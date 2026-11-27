import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";
import { useMemo } from "react";
import { AbsoluteFill, Easing, interpolate, useVideoConfig } from "remotion";
import { useTempoGuia } from "./relogio";
import { Carro } from "../Cidade";
import { Camera } from "../v2/mundo";
import type { VisualPersonagem } from "../Personagem";
import { Arvores, BancaEPipoqueiro, Ciclistas, FilaDeCarros, Folhas, GenteConversando, Pombos, Semaforos } from "./vida";
import {
  CALCADA_Y,
  CenarioRua,
  type Chave,
  coresDoCeu,
  CristaisDeGelo,
  Geada,
  Gente,
  type EstadoPersonagem,
  LuzMeioDia,
  Multidao,
  TransitoLonge,
  trajeto,
} from "./cenario";
import { BIA, CENAS, clamp, ease, lerp3, MARCOS, type Vec3 } from "./tempo";

// A Avenida Paulista em todas as partes do vídeo que acontecem nela.
// Recebe o segundo ABSOLUTO do vídeo e decide câmera, personagens e clima.

const G = 4.9; // gravidade pela metade (m/s²)
const MEIO_PI = Math.PI / 2;
const Z_FAIXA = -14;

// ---------- Câmera ----------
const CAMERA: Chave[] = [
  // Gancho: desce do alto até a altura dos olhos, na frente da Bia
  { t: 0, pos: [-6, 22, -1], alvo: [-1.3, 0, -18] },
  { t: 6.2, pos: [-4.2, 1.7, -8.8], alvo: [-1.3, 1.25, -14] },
  { t: 8.5, pos: [-4.0, 1.75, -9.4], alvo: [-1.3, 1.3, -14] },
  // Promessa: sobe reto, mostrando a cidade inteira presa ao chão
  { t: 14.5, pos: [-5, 55, 4], alvo: [-3, 0, -24] },
  // Corpo: de lado, na faixa
  { t: 14.5, pos: [-3.4, 1.15, -9.2], alvo: [-2.3, 0.9, -14], corte: true },
  { t: 18.6, pos: [-3.5, 1.15, -9.6], alvo: [-2.7, 0.85, -14] },
  { t: 19.6, pos: [-3.7, 1.05, -11.2], alvo: [-2.9, 0.75, -14] },
  { t: 24, pos: [-3.9, 1.35, -10.4], alvo: [-2.6, 0.9, -14.5] },
  // Pneus: baixa, na calçada, vendo o carro chegar
  { t: 24, pos: [2.5, 3.2, -6.5], alvo: [-4.5, 0.4, -19], corte: true },
  { t: 29.3, pos: [2.3, 3.4, -6.0], alvo: [-4.2, 0.3, -16.5] },
  { t: 33, pos: [1.5, 10.5, -3.0], alvo: [-4, 0, -15] },
  // Ar: drone subindo para mostrar a camada de ar
  { t: 33, pos: [-6, 14, 6], alvo: [-3, 2, -30], corte: true },
  { t: 38.5, pos: [-40, 150, 110], alvo: [-3, 10, -40] },
  // Ar: close na Bia sem fôlego
  { t: 38.5, pos: [-1.0, 1.5, -11.9], alvo: [-1.0, 1.3, -14], corte: true },
  { t: 44, pos: [-1.0, 1.45, -12.4], alvo: [-1.0, 1.28, -14] },
  // Frio: a neblina engole a avenida atrás dela
  { t: 47, pos: [-2.9, 1.6, -5.4], alvo: [-1.2, 1.35, -9.8], corte: true },
  { t: 53, pos: [-3.3, 1.7, -4.4], alvo: [-1.6, 1.4, -10.5] },
  // Paulista congelada e vazia
  { t: 65.5, pos: [-5.5, 2.2, 2], alvo: [-5, 1.2, -40], corte: true },
  { t: 70, pos: [-5.5, 3.2, -6], alvo: [-5, 1.0, -45] },
  // Final: a Bia na balança, vista de lado (dá para ver o rosto e o mostrador)
  { t: 80, pos: [3.3, 1.55, -14.9], alvo: [0.8, 1.2, -14.05], corte: true },
  { t: 86, pos: [3.0, 1.5, -15.0], alvo: [0.8, 1.15, -14.05] },
];

// Visão de drone (cena do ar): a neblina recua para a cidade aparecer inteira
const drone = (s: number) => s >= CENAS.ar.inicio && s < 38.5;

// ---------- Bia ----------
const VOO = 0.96; // tempo no ar do pulo (sobe 2,2 m/s com metade da gravidade)

const bia = (s: number): EstadoPersonagem | null => {
  // Chega andando pela calçada até a faixa
  if (s < 14.5) {
    const p = interpolate(s, [0.5, 6.3], [0, 1], clamp);
    const z = -22 + 8 * p;
    const intensidade = interpolate(s, [0.3, 0.9, 5.7, 6.3], [0, 1, 1, 0], clamp);
    return {
      pos: [-1.3, CALCADA_Y, z],
      giroY: interpolate(s, [6.3, 7.2], [0, -MEIO_PI], { ...clamp, easing: ease }),
      fase: ((8 * p) / 1.5) * Math.PI * 2,
      intensidade,
      // Sente algo estranho quando a gravidade cai
      espanto: interpolate(s, [MARCOS.quedaGravidade, MARCOS.quedaGravidade + 0.6], [0, 0.6], clamp),
    };
  }
  // Desce do meio-fio e voa longe
  if (s < CENAS.corpo.fim) {
    const tau = Math.min(Math.max(0, s - MARCOS.pulo), VOO);
    const noAr = s >= MARCOS.pulo && s < MARCOS.pulo + VOO;
    const y = CALCADA_Y + 2.2 * tau - (G / 2) * tau * tau;
    return {
      pos: [-1.3 - 1.6 * tau, Math.max(0, y), Z_FAIXA],
      giroY: interpolate(s, [16.4, 17.3], [-MEIO_PI, -0.35], { ...clamp, easing: ease }),
      bracos: noAr ? Math.sin((Math.PI * tau) / VOO) * 0.9 : interpolate(s, [19.3, 19.6, 20.6], [0, 0.35, 0], clamp),
      espanto: interpolate(s, [MARCOS.pulo, MARCOS.pulo + 0.2, 17.2, 18.0], [0.6, 1, 1, 0.1], clamp),
      boca: s >= MARCOS.pulo && s < MARCOS.pulo + 0.5 ? 0.8 : 0,
      giroCabeca: [interpolate(s, [MARCOS.celularCai, MARCOS.celularCai + 0.4], [0, 0.35], clamp), 0],
    };
  }
  // Pneus: olha da calçada o carro passar da faixa
  if (s < CENAS.pneus.fim) {
    return {
      pos: [1.0, CALCADA_Y, -17],
      giroY: -MEIO_PI + 0.4,
      espanto: interpolate(s, [26.3, 26.8], [0, 1], clamp),
      bracos: interpolate(s, [26.5, 27.0, 28.5, 29.5], [0, 0.5, 0.5, 0.1], clamp),
    };
  }
  // Ar: sem fôlego
  if (s >= 38.5 && s < CENAS.ar.fim) {
    return {
      pos: [-1.0, CALCADA_Y, Z_FAIXA],
      giroY: 0,
      ofego: 1,
      espanto: 0.6,
      giroCabeca: [0.22, 0],
      boca: s >= MARCOS.cadeOAr && s < MARCOS.cadeOAr + 1.3 ? 0.5 + 0.4 * Math.abs(Math.sin(s * 9)) : 0.25,
    };
  }
  // Frio
  if (s >= CENAS.frio.inicio && s < CENAS.frio.fim) {
    return { pos: [-1.0, CALCADA_Y, -9.6], giroY: 0.15, ofego: 0.5, espanto: 0.45, giroCabeca: [0.1, 0.25] };
  }
  // Final: na balança de farmácia
  if (s >= CENAS.final.inicio) {
    // De frente para a coluna (sentido -z), olhando o ponteiro; no fim, abaixa a cabeça desanimada
    return {
      pos: [0.8, CALCADA_Y + 0.12, Z_FAIXA],
      giroY: Math.PI,
      giroCabeca: [interpolate(s, [80.2, 80.8, 83.2, 84.0], [0, 0.3, 0.3, 0.6], { ...clamp, easing: ease }), 0],
      espanto: interpolate(s, [81, 82], [0, 0.3], clamp),
    };
  }
  return null;
};

// Rapaz pulando o dobro no fundo da cena do corpo
const pulador = (s: number): EstadoPersonagem => {
  const AR = 1.22; // sobe a 3 m/s: no ar o dobro do normal
  const ciclo = AR + 0.45;
  const t = (((s - 15.6) % ciclo) + ciclo) % ciclo;
  const tau = Math.min(t, AR);
  return {
    pos: [0.9, CALCADA_Y + Math.max(0, 3 * tau - (G / 2) * tau * tau), -17.5],
    giroY: -0.6,
    bracos: t < AR ? 0.9 : 0.1,
    espanto: 0.2,
  };
};

// Pedestre que atravessa e pula para trás quando o carro não para
const atravessando = (s: number): EstadoPersonagem => {
  const recuo = Math.min(Math.max(0, s - 26.4), 1.6);
  const andou = Math.min(s - 24, 2.4) * 1.2;
  return {
    pos: [-8.2 + andou - 1.4 * recuo, Math.max(0, 2.5 * recuo - (G / 2) * recuo * recuo), Z_FAIXA + 0.3],
    giroY: s < 26.4 ? MEIO_PI : MEIO_PI + 0.3,
    fase: andou * 4,
    intensidade: s < 26.2 ? 1 : 0,
    bracos: s >= 26.4 && s < 28 ? 0.9 : 0,
    espanto: s >= 25.4 ? 1 : 0,
    boca: s >= 25.6 && s < 26.4 ? 0.8 : 0,
  };
};

// ---------- Carro que freia e não para ----------
// 43 km/h; com metade do peso a desaceleração cai de 6,9 para 3,4 m/s²
const V0 = 12;
const DESACELERACAO = 3.43;
const Z_FREIO = -31.4;
const PARADA_NORMAL = Z_FREIO + (V0 * V0) / (2 * 6.86);
const PARADA_HOJE = Z_FREIO + (V0 * V0) / (2 * DESACELERACAO);

const carro = (s: number) => {
  const t = s - MARCOS.freada;
  if (t < 0) return { z: Z_FREIO + V0 * t, inclina: 0 };
  const tParar = V0 / DESACELERACAO;
  const tt = Math.min(t, tParar);
  return {
    z: Z_FREIO + V0 * tt - (DESACELERACAO / 2) * tt * tt,
    inclina: t < tParar ? 0.035 : interpolate(t - tParar, [0, 0.4], [0.035, 0], clamp),
  };
};

const MarcaNoChao: React.FC<{ z: number; cor: string }> = ({ z, cor }) => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-3.8, 0.02, z]}>
    <planeGeometry args={[3.2, 0.4]} />
    <meshBasicMaterial color={cor} toneMapped={false} fog={false} />
  </mesh>
);

// ---------- Celular que cai devagar ----------
const Celular: React.FC<{ s: number; dona: EstadoPersonagem }> = ({ s, dona }) => {
  if (s < MARCOS.celularCai - 0.6 || s >= CENAS.corpo.fim) return null;
  // Mão direita da Bia, girada junto com o corpo
  const [bx, by, bz] = dona.pos;
  const g = dona.giroY;
  const lx = -0.3;
  const lz = 0.06;
  const mao: Vec3 = [bx + lx * Math.cos(g) + lz * Math.sin(g), by + 0.8, bz - lx * Math.sin(g) + lz * Math.cos(g)];
  const t = Math.max(0, s - MARCOS.celularCai);
  // Cai 0,35 m em ~0,38 s; ela pega no ar e traz de volta para a mão
  const PEGA = 0.38;
  const queda =
    t < PEGA ? (G / 2) * t * t : interpolate(t, [PEGA, PEGA + 0.3], [(G / 2) * PEGA * PEGA, 0], { ...clamp, easing: ease });
  const giro = Math.min(t, PEGA) * 3;
  return (
    <group position={[mao[0], mao[1] - queda, mao[2]]} rotation={[giro, g, giro * 0.5]}>
      <mesh castShadow>
        <boxGeometry args={[0.075, 0.15, 0.012]} />
        <meshStandardMaterial color="#1b1b1f" roughness={0.3} />
      </mesh>
      <mesh position={[0, 0, 0.007]}>
        <planeGeometry args={[0.065, 0.135]} />
        <meshBasicMaterial color="#7fb8ff" toneMapped={false} />
      </mesh>
    </group>
  );
};

// ---------- Camada de ar (cena do ar) ----------
const BORDA_CAIXA = new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1));

const CamadaDeAr: React.FC<{ s: number }> = ({ s }) => {
  if (s < CENAS.ar.inicio || s >= 38.5) return null;
  const p = interpolate(s, [MARCOS.diagramaAr, MARCOS.diagramaAr + 3.2], [0, 1], { ...clamp, easing: ease });
  const altura = 30 + 50 * p; // estufa para cima
  // Caixa unitária esticada: assim a borda acompanha a altura sem recriar geometria
  return (
    <group position={[-3, altura / 2, -40]} scale={[120, altura, 160]}>
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial
          color="#5aa9ff"
          transparent
          opacity={0.26 - 0.12 * p}
          depthWrite={false}
          fog={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      <lineSegments geometry={BORDA_CAIXA}>
        <lineBasicMaterial color="#bfe3ff" fog={false} />
      </lineSegments>
    </group>
  );
};

// ---------- Vizinhos: gente comum em volta da Bia, reagindo em cada cena ----------
// Posições [x, z, giroY] em cada trecho (calçada da Bia: x de -2 a 4,5)
type Lugar = [number, number, number];
const VIZINHOS: { visual: Partial<VisualPersonagem>; espera: Lugar; pulo: Lugar; pneus: Lugar; ar: Lugar; frio: Lugar }[] = [
  {
    visual: { camisa: "#e76f51", pele: "#8d5524", nariz: "#7a4720", cabelo: "#111111" },
    espera: [-0.4, -12.6, -MEIO_PI + 0.2],
    pulo: [-0.1, -15.3, -MEIO_PI + 0.4],
    pneus: [0.2, -16.0, -MEIO_PI + 0.5],
    ar: [0.3, -15.4, 0.3],
    frio: [0.2, -12.2, 0.2],
  },
  {
    visual: { camisa: "#457b9d", pele: "#f1c27d", nariz: "#e3ad62", cabelo: "#d9b26f", cabeloLongo: true },
    espera: [-0.6, -13.4, -MEIO_PI + 0.35],
    pulo: [1.1, -14.6, -MEIO_PI - 0.2],
    pneus: [1.9, -17.7, -MEIO_PI + 0.3],
    ar: [-1.8, -16.8, 0.1],
    frio: [-0.7, -13.6, -0.1],
  },
  {
    visual: { camisa: "#9b5de5", pele: "#c68642", nariz: "#b07335", cabelo: "#2b1b12" },
    espera: [-0.3, -15.1, -MEIO_PI],
    pulo: [1.9, -16.7, -MEIO_PI + 0.3],
    pneus: [0.6, -18.5, -MEIO_PI + 0.4],
    ar: [1.3, -17.6, -0.2],
    frio: [1.1, -11.2, 0.4],
  },
  {
    visual: { camisa: "#06d6a0", pele: "#ffdbac", nariz: "#f0c492", cabelo: "#a0522d", cabeloLongo: true },
    espera: [0.5, -14.6, -MEIO_PI - 0.25],
    pulo: [3.4, -15.6, -MEIO_PI + 0.1],
    pneus: [2.6, -16.5, -MEIO_PI + 0.2],
    ar: [-0.4, -19.0, 0],
    frio: [-1.4, -15.0, 0.1],
  },
  {
    visual: { camisa: "#ef476f", pele: "#e0ac69", nariz: "#cf9a57", cabelo: "#111111" },
    espera: [-0.1, -16.4, -MEIO_PI + 0.1],
    pulo: [0.6, -16.6, -MEIO_PI + 0.6],
    pneus: [1.5, -19.5, -MEIO_PI + 0.35],
    ar: [2.0, -15.0, -0.4],
    frio: [0.9, -14.4, 0],
  },
];

// Pula sem parar no mesmo lugar (sobe a v0 m/s, com a gravidade pela metade)
const quicando = (s: number, inicio: number, v0: number) => {
  const ar = (2 * v0) / G;
  const ciclo = ar + 0.4;
  const t = (((s - inicio) % ciclo) + ciclo) % ciclo;
  const tau = Math.min(t, ar);
  return { y: s < inicio ? 0 : Math.max(0, v0 * tau - (G / 2) * tau * tau), noAr: s >= inicio && t < ar };
};

const vizinho = (i: number, s: number): EstadoPersonagem | null => {
  const v = VIZINHOS[i];
  // Gancho: esperando o sinal; quando a gravidade cai, os braços "boiam" e todo mundo se espanta
  if (s < CENAS.corpo.inicio) {
    const [x, z, g] = v.espera;
    const q = MARCOS.quedaGravidade + i * 0.13;
    const r = interpolate(s, [q, q + 0.5], [0, 1], { ...clamp, easing: ease });
    return {
      pos: [x, CALCADA_Y, z],
      giroY: g + r * 0.35 * Math.sin(i * 2.3),
      espanto: 0.8 * r,
      bracos: 0.3 * r,
      giroCabeca: [i === 3 ? 0.3 * (1 - r) : -0.18 * r, 0],
      boca: r > 0.5 && i % 2 === 0 ? 0.45 : 0,
    };
  }
  // Corpo: todo mundo testando o pulo
  if (s < CENAS.corpo.fim) {
    const [x, z, g] = v.pulo;
    const q = quicando(s, 14.9 + i * 0.37, 2.6 + (i % 3) * 0.3);
    return { pos: [x, CALCADA_Y + q.y, z], giroY: g, bracos: q.noAr ? 0.85 : 0.15, espanto: 0.55, boca: q.noAr && i % 2 ? 0.5 : 0 };
  }
  // Pneus: assistem o carro passar da faixa e levantam as mãos
  if (s < CENAS.pneus.fim) {
    const [x, z, g] = v.pneus;
    const susto = interpolate(s, [26.3 + i * 0.08, 26.7 + i * 0.08], [0, 1], clamp);
    return { pos: [x, CALCADA_Y, z], giroY: g, espanto: susto, bracos: 0.6 * susto, boca: susto > 0.5 && i % 2 ? 0.6 : 0 };
  }
  // Ar ralo: ofegando
  if (s >= 38.5 && s < CENAS.ar.fim) {
    const [x, z, g] = v.ar;
    return { pos: [x, CALCADA_Y, z], giroY: g, ofego: 0.8 + 0.2 * Math.sin(i), espanto: 0.5, giroCabeca: [0.25, 0] };
  }
  // Frio: encolhidos
  if (s >= CENAS.frio.inicio && s < CENAS.frio.fim) {
    const [x, z, g] = v.frio;
    return { pos: [x, CALCADA_Y, z], giroY: g, ofego: 0.5, espanto: 0.4, bracos: 0.12, giroCabeca: [0.15, 0.2 * Math.sin(i)] };
  }
  return null;
};

// ---------- Primeira pessoa ----------
type Vista = { pos: Vec3; alvo: Vec3; rolo: number; fov: number };
const OLHO = 1.55;

// (1) Pelos olhos da Bia: ela pula de novo (o dobro da altura) e depois o celular escorrega da mão
const POV_BIA = { inicio: 16.6, fim: 20.8 };
const PULO_POV = 17.2;
const V_POV = 3;
const AR_POV = (2 * V_POV) / G;
const PEGA_POV = 0.6;
const BIA_POV: Vec3 = [-1.3 - 1.6 * VOO, 0, Z_FAIXA];
// Olhando para a calçada, onde o pessoal está pulando (de lado, para o poste da placa não tapar)
const FX = 8 / Math.hypot(8, 3);
const FZ = -3 / Math.hypot(8, 3);
const YAW_POV = Math.atan2(-FX, -FZ);
const RX = -FZ;
const RZ = FX;

const celularPov = (s: number) => {
  const entra = interpolate(s, [18.45, 18.85], [-0.5, 0], { ...clamp, easing: ease });
  const sai = interpolate(s, [20.3, 20.8], [0, -0.45], { ...clamp, easing: ease });
  const base: Vec3 = [BIA_POV[0] + FX * 0.36 + RX * 0.05, OLHO - 0.36 + entra + sai, BIA_POV[2] + FZ * 0.36 + RZ * 0.05];
  const t = s - MARCOS.celularCai;
  const fundo = (G / 2) * PEGA_POV * PEGA_POV;
  let cel = 0;
  let mao = 0;
  let giro = 0;
  if (t > 0 && t < PEGA_POV) {
    // O celular cai devagar; a mão vai atrás e alcança
    cel = (G / 2) * t * t;
    mao = interpolate(t, [0.15, PEGA_POV], [0, fundo], { ...clamp, easing: Easing.in(Easing.quad) });
    giro = t * 4;
  } else if (t >= PEGA_POV) {
    const volta = interpolate(t, [PEGA_POV, PEGA_POV + 0.5], [1, 0], { ...clamp, easing: ease });
    cel = fundo * volta;
    mao = fundo * volta;
    giro = PEGA_POV * 4 * volta;
  }
  return {
    mao: [base[0], base[1] - mao, base[2]] as Vec3,
    celular: [base[0], base[1] + 0.055 - cel, base[2]] as Vec3,
    giro,
    abaixa: mao,
  };
};

const vistaBia = (s: number): Vista => {
  const tau = Math.min(Math.max(0, s - PULO_POV), AR_POV);
  const sobe = V_POV * tau - (G / 2) * tau * tau;
  const agacha = interpolate(s, [16.95, 17.15, 17.25], [0, -0.14, 0], clamp);
  const depois = s - PULO_POV - AR_POV;
  const pouso = depois > 0 ? -0.15 * Math.sin(Math.PI * Math.min(1, depois / 0.4)) : 0;
  const respira = Math.sin(s * 2.4) * 0.012;
  const cel = celularPov(s);
  // Ela se abaixa um pouco atrás do celular
  const pos: Vec3 = [BIA_POV[0] + Math.sin(s * 1.3) * 0.02, OLHO + sobe + agacha + pouso + respira - cel.abaixa * 0.35, BIA_POV[2]];
  // Inclinação do olhar: para longe (o pessoal pulando) ou para baixo, deixando o celular
  // uns 18° abaixo do centro da tela (o mundo continua aparecendo em cima)
  const olhaLonge = Math.atan2(1.15 - sobe * 0.4 - pos[1], 7);
  const [cx, cy, cz] = cel.celular;
  const olhaCel = Math.atan2(cy - pos[1], Math.hypot(cx - pos[0], cz - pos[2])) + 0.24;
  const w = interpolate(s, [18.4, 18.9], [0, 1], { ...clamp, easing: ease }) * (1 - 0.6 * interpolate(s, [20.3, 20.8], [0, 1], clamp));
  const inclina = olhaLonge + (olhaCel - olhaLonge) * w;
  return {
    pos,
    alvo: [pos[0] + FX * 5 * Math.cos(inclina), pos[1] + 5 * Math.sin(inclina), pos[2] + FZ * 5 * Math.cos(inclina)],
    rolo: Math.sin(s * 1.7) * 0.02 + 0.06 * Math.sin((Math.PI * tau) / AR_POV) + pouso * 0.3,
    fov: 64,
  };
};

// Tela do celular: tela de bloqueio com a notificação do dia
const telaCelular = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, "#3a1c71");
  grad.addColorStop(0.5, "#d76d77");
  grad.addColorStop(1, "#ffaf7b");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 512);
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.font = "bold 76px Arial";
  ctx.fillText("12:00", 128, 130);
  ctx.font = "22px Arial";
  ctx.fillText("quinta-feira", 128, 165);
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.beginPath();
  ctx.roundRect(18, 210, 220, 86, 18);
  ctx.fill();
  ctx.fillStyle = "#222222";
  ctx.textAlign = "left";
  ctx.font = "bold 20px Arial";
  ctx.fillText("Alerta", 34, 242);
  ctx.font = "19px Arial";
  ctx.fillText("Gravidade: 4,9 m/s²", 34, 274);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
};

const CelularPov: React.FC<{ s: number }> = ({ s }) => {
  const tela = useMemo(telaCelular, []);
  const { mao, celular, giro } = celularPov(s);
  return (
    <>
      <group position={mao} rotation={[0, YAW_POV, 0]}>
        {/* Palma e antebraço da Bia (o braço sai pela parte de baixo da tela) */}
        <mesh position={[0, -0.012, 0.01]} scale={[0.05, 0.016, 0.055]}>
          <sphereGeometry args={[1, 16, 12]} />
          <meshStandardMaterial color={BIA.pele} roughness={0.7} />
        </mesh>
        {/* Dedos dobrados segurando a borda do celular */}
        {[-0.03, -0.01, 0.01, 0.03].map((x) => (
          <mesh key={x} position={[x, 0.012, -0.062]} rotation={[-0.9, 0, 0]}>
            <capsuleGeometry args={[0.009, 0.03, 4, 8]} />
            <meshStandardMaterial color={BIA.pele} roughness={0.7} />
          </mesh>
        ))}
        <mesh position={[-0.055, 0.014, -0.01]} rotation={[0.3, 0, 0.9]}>
          <capsuleGeometry args={[0.011, 0.04, 4, 8]} />
          <meshStandardMaterial color={BIA.pele} roughness={0.7} />
        </mesh>
        <mesh position={[0.05, -0.12, 0.18]} rotation={[-1.0, 0, 0.25]}>
          <capsuleGeometry args={[0.035, 0.3, 4, 10]} />
          <meshStandardMaterial color={BIA.pele} roughness={0.7} />
        </mesh>
      </group>
      <group position={celular} rotation={[0, YAW_POV, 0]}>
        {/* Tela virada para os olhos dela; ao cair, o celular gira no próprio plano */}
        <group rotation={[-0.85 + giro * 0.25, 0, giro * 1.2]}>
          <mesh castShadow>
            <boxGeometry args={[0.075, 0.15, 0.012]} />
            <meshStandardMaterial color="#1b1b1f" roughness={0.3} />
          </mesh>
          <mesh position={[0, 0, 0.0065]}>
            <planeGeometry args={[0.067, 0.138]} />
            <meshBasicMaterial map={tela} toneMapped={false} />
          </mesh>
        </group>
      </group>
    </>
  );
};

// (2) Pelos olhos do pedestre na faixa: o carro vem freando e não para
const POV_CARRO = { inicio: 24.0, fim: 27.4 };
const PEDESTRE_VISUAL = { camisa: "#2a9d8f", pele: "#c68642", cabelo: "#111111" };

const vistaPedestre = (s: number): Vista => {
  const e = atravessando(s);
  const c = carro(s);
  const susto = interpolate(s, [26.35, 26.5, 27.4], [0, 1, 0.35], clamp);
  const passo = s < 26.2 ? Math.abs(Math.sin(e.fase ?? 0)) * 0.05 : 0;
  const tremor = susto * 0.05;
  const pos: Vec3 = [
    e.pos[0] + Math.sin(s * 47) * tremor,
    e.pos[1] + OLHO + passo + Math.cos(s * 53) * tremor,
    e.pos[2],
  ];
  const frente: Vec3 = [e.pos[0] + 6, 1.3, e.pos[2] - 0.8];
  const noCarro: Vec3 = [-3.8, 0.9, c.z + 1.4];
  const olha = interpolate(s, [24.55, 25.05], [0, 1], { ...clamp, easing: ease });
  return {
    pos,
    alvo: lerp3(frente, noCarro, olha),
    rolo: Math.sin(s * 2) * 0.015 + susto * 0.16 * Math.sin(s * 7),
    fov: 62 + susto * 6,
  };
};

// Mãos levantadas no susto, presas à câmera (x direita, y cima, -z frente)
const MaosPov: React.FC<{ vista: Vista; levanta: number }> = ({ vista, levanta }) => {
  if (levanta <= 0.01) return null;
  const d = new THREE.Vector3(...vista.alvo).sub(new THREE.Vector3(...vista.pos)).normalize();
  const rot = new THREE.Euler(Math.asin(d.y), Math.atan2(-d.x, -d.z), vista.rolo, "YXZ");
  const y = -0.6 + 0.48 * levanta;
  const pele = <meshStandardMaterial color={PEDESTRE_VISUAL.pele} roughness={0.7} />;
  return (
    <group position={vista.pos} rotation={rot}>
      {[-1, 1].map((lado) => (
        // Palmas viradas para o carro, dedos abertos
        <group key={lado} position={[lado * 0.15, y, -0.5]} rotation={[0.1, 0, lado * -0.2]}>
          <mesh scale={[0.045, 0.052, 0.018]}>
            <sphereGeometry args={[1, 16, 12]} />
            {pele}
          </mesh>
          {[-0.027, -0.009, 0.009, 0.027].map((x, k) => (
            <mesh key={x} position={[x, 0.07 - Math.abs(k - 1.5) * 0.006, 0]} rotation={[0, 0, -x * 4]}>
              <capsuleGeometry args={[0.0085, 0.04, 4, 8]} />
              {pele}
            </mesh>
          ))}
          <mesh position={[lado * -0.05, 0.005, 0]} rotation={[0, 0, lado * 1.0]}>
            <capsuleGeometry args={[0.01, 0.035, 4, 8]} />
            {pele}
          </mesh>
          <mesh position={[0, -0.2, 0.05]} rotation={[0.25, 0, 0]}>
            <capsuleGeometry args={[0.04, 0.26, 4, 10]} />
            <meshStandardMaterial color={PEDESTRE_VISUAL.camisa} roughness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// ---------- Balança de farmácia ----------
const Balanca: React.FC<{ s: number }> = ({ s }) => {
  // O ponteiro balança e para no peso de sempre
  const ponteiro = interpolate(s, [80.3, 81.2, 81.7, 82.1], [0, 1.15, 0.92, 1], clamp);
  return (
    <group position={[0.8, CALCADA_Y, Z_FAIXA]}>
      <mesh position={[0, 0.06, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.55, 0.12, 0.45]} />
        <meshStandardMaterial color="#d8dde3" metalness={0.3} roughness={0.4} />
      </mesh>
      {/* Coluna na frente da Bia (ela olha para -z); o mostrador vira para a câmera, que está de lado */}
      <mesh position={[0, 0.55, -0.3]} castShadow>
        <boxGeometry args={[0.12, 0.9, 0.08]} />
        <meshStandardMaterial color="#c0392b" roughness={0.5} />
      </mesh>
      <group position={[0.02, 1.25, -0.3]} rotation={[0, MEIO_PI * 0.8, 0]}>
        <mesh rotation={[MEIO_PI, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.08, 32]} />
          <meshStandardMaterial color="#c0392b" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0, 0.045]}>
          <circleGeometry args={[0.17, 32]} />
          <meshStandardMaterial color="#fbfbf6" />
        </mesh>
        <mesh position={[0, 0, 0.05]} rotation={[0, 0, -ponteiro * 2.2 + 1.1]}>
          <boxGeometry args={[0.012, 0.14, 0.005]} />
          <meshBasicMaterial color="#111111" />
        </mesh>
      </group>
    </group>
  );
};

// ---------- Hálito virando fumaça no frio ----------
const Halito: React.FC<{ s: number; boca: Vec3 }> = ({ s, boca }) => (
  <>
    {[0, 1, 2].map((k) => {
      const t = (((s - k * 0.45) % 1.35) + 1.35) % 1.35;
      const o = interpolate(t, [0, 0.15, 1.2], [0, 0.55, 0], clamp);
      return (
        <mesh key={k} position={[boca[0] + t * 0.08, boca[1] + t * 0.12, boca[2] + 0.12 + t * 0.35]} scale={0.04 + t * 0.14}>
          <sphereGeometry args={[1, 12, 12]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={o} depthWrite={false} />
        </mesh>
      );
    })}
  </>
);

export const CenaRua: React.FC = () => {
  const { width, height } = useVideoConfig();
  const { s, frame: frameGlobal } = useTempoGuia();

  const congelada = s >= MARCOS.paulistaCongelada && s < CENAS.real.inicio;
  const frio = congelada ? 1 : s >= CENAS.frio.inicio && s < CENAS.frio.fim ? interpolate(s, [47, 50], [0.2, 0.85], clamp) : 0;
  const neblina = congelada ? 0.55 : s >= CENAS.frio.inicio && s < CENAS.frio.fim ? interpolate(s, [47, 50.5], [0, 0.85], { ...clamp, easing: ease }) : 0;
  const ceu = coresDoCeu(frio);

  const cam = trajeto(CAMERA, s);
  // Tremidinha quando a gravidade cai + balanço leve de câmera na mão o tempo todo
  const q = MARCOS.quedaGravidade;
  const tremor = interpolate(s, [q, q + 0.1, q + 0.7], [0, 1, 0], clamp) * 0.06;
  const f = frameGlobal;
  const mao = drone(s) ? 0 : 1;
  const terceira: Vista = {
    pos: [
      cam.pos[0] + Math.sin(f * 2.1) * tremor + mao * (Math.sin(f * 0.043) * 0.018 + Math.sin(f * 0.11 + 1) * 0.008),
      cam.pos[1] + Math.cos(f * 2.7) * tremor + mao * (Math.sin(f * 0.057 + 2) * 0.014 + Math.sin(f * 0.13) * 0.006),
      cam.pos[2],
    ],
    alvo: [
      cam.alvo[0] + mao * Math.sin(f * 0.037 + 3) * 0.025,
      cam.alvo[1] + mao * Math.sin(f * 0.049 + 1) * 0.02,
      cam.alvo[2],
    ],
    rolo: mao * Math.sin(f * 0.031) * 0.008,
    fov: 50,
  };
  const naPovBia = s >= POV_BIA.inicio && s < POV_BIA.fim;
  const naPovCarro = s >= POV_CARRO.inicio && s < POV_CARRO.fim;
  const vista = naPovBia ? vistaBia(s) : naPovCarro ? vistaPedestre(s) : terceira;

  const estadoBia = naPovBia ? null : bia(s);
  const c = carro(s);
  const naCenaDosPneus = s >= CENAS.pneus.inicio && s < CENAS.pneus.fim;
  const aberto = drone(s);
  const comGente = !congelada;
  const quique = comGente ? interpolate(s, [q, q + 1], [0, 1], clamp) : 0;

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{ background: `linear-gradient(180deg, ${ceu.topo} 0%, ${ceu.meio} 45%, ${ceu.horizonte} 100%)` }}
      />
      {congelada && (
        // Sol pequeno e pálido: a Terra já está longe
        <div
          style={{
            position: "absolute",
            top: 330,
            left: 640,
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: "#fffdf0",
            boxShadow: "0 0 30px 10px rgba(255,250,230,0.5)",
          }}
        />
      )}
      <ThreeCanvas width={width} height={height} shadows camera={{ fov: 50, near: 0.1, far: 1200 }}>
        <Camera posicao={vista.pos} alvo={vista.alvo} rolo={vista.rolo} fov={vista.fov} />
        <LuzMeioDia frio={frio} neblina={neblina} aberto={aberto} />
        <CenarioRua frame={frameGlobal} />
        <Arvores s={s} geada={congelada} />
        <Semaforos s={s} />
        {congelada && <Geada />}
        <TransitoLonge segundos={s} parado={congelada} />
        {comGente && (
          <>
            <Multidao segundos={s} quique={quique} />
            <GenteConversando s={s} frame={frameGlobal} />
            <BancaEPipoqueiro s={s} frame={frameGlobal} />
            <Pombos s={s} frame={frameGlobal} />
            {/* Na balança (final), o fundo fica mais limpo para a piada */}
            {s < CENAS.final.inicio && <Ciclistas s={s} evitarFaixa={naCenaDosPneus} />}
            {!naCenaDosPneus && s < CENAS.final.inicio && <FilaDeCarros s={s} />}
            <Folhas s={s} opacidade={aberto ? 0 : interpolate(s, [q, q + 1.5], [0, 0.9], clamp)} />
          </>
        )}
        {comGente &&
          VIZINHOS.map((v, i) => {
            const e = vizinho(i, s);
            return e && <Gente key={i} e={e} frame={frameGlobal + i * 17} visual={v.visual} />;
          })}
        {estadoBia && <Gente e={estadoBia} frame={frameGlobal} visual={BIA} />}
        {estadoBia && <Celular s={s} dona={estadoBia} />}
        {naPovBia && <CelularPov s={s} />}
        {naPovCarro && <MaosPov vista={vista} levanta={interpolate(s, [26.3, 26.55], [0, 1], clamp)} />}
        {s >= 15.4 && s < CENAS.corpo.fim && <Gente e={pulador(s)} frame={frameGlobal} visual={{ camisa: "#e63946", pele: "#ffdbac", cabelo: "#a0522d" }} />}
        {naCenaDosPneus && (
          <>
            {/* O nariz do carro abaixa enquanto freia (giro em torno do próprio carro) */}
            <group position={[-3.8, 0, c.z]} rotation={[c.inclina, 0, 0]}>
              <Carro x={0} z={0} dir={1} cor="#d62828" />
            </group>
            {!naPovCarro && <Gente e={atravessando(s)} frame={frameGlobal} visual={PEDESTRE_VISUAL} />}
            {s >= 28.6 && <MarcaNoChao z={PARADA_NORMAL + 2} cor="#2ecc71" />}
            {s >= 29.0 && <MarcaNoChao z={PARADA_HOJE + 2} cor="#ff3b30" />}
          </>
        )}
        <CamadaDeAr s={s} />
        {s >= CENAS.frio.inicio && s < CENAS.frio.fim && estadoBia && (
          <>
            <Halito s={s} boca={[estadoBia.pos[0] + 0.03, estadoBia.pos[1] + 1.43, estadoBia.pos[2] + 0.2]} />
            <CristaisDeGelo segundos={s} centro={[-2, 0, -12]} opacidade={interpolate(s, [48.5, 50], [0, 0.85], clamp)} />
          </>
        )}
        {congelada && <CristaisDeGelo segundos={s} centro={[-5, 0, -14]} opacidade={0.7} />}
        {s >= CENAS.final.inicio && <Balanca s={s} />}
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
