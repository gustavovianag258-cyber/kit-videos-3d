import { useMemo } from "react";
import * as THREE from "three";
import { interpolate, random } from "remotion";
import { CALCADA_Y, Carro, Pedestre } from "../Cidade";
import { clamp, ease, MARCOS } from "./tempo";

// Vida da Avenida Paulista: árvores, folhas, pombos, ciclovia, ônibus, fila de carros,
// semáforo, banca, pipoqueiro, MASP, antenas e gente parada conversando.
// Layout (Cidade.tsx): asfalto x de -9 a -2 (pistas em -7,2 e -3,8), calçada da Bia x de -2 a 4,5,
// calçada do outro lado x de -12 a -9, faixa de pedestres em z = -14.

const G = 4.9;
const pegar = <T,>(lista: T[], s: string) => lista[Math.floor(random(s) * lista.length)];
const PELES = ["#f1c27d", "#e0ac69", "#c68642", "#8d5524", "#ffdbac"];
const ROUPAS = ["#e74c3c", "#27ae60", "#f39c12", "#8e44ad", "#16a085", "#34495e", "#ecf0f1", "#ff6b6b", "#4d96ff", "#ffd166"];
const CABELOS = ["#2b1b12", "#111111", "#a0522d", "#d9b26f"];

// ---------- Árvores (copas balançando com o vento) ----------
type Arvore = { x: number; z: number; e: number; k: number };
const ARVORES: Arvore[] = [
  // Outro lado, rente ao meio-fio
  ...Array.from({ length: 12 }, (_, i) => ({ x: -9.45, z: -95 + i * 10, e: 0.9 + random(`arv-a-${i}`) * 0.35, k: i })),
  // Lado da Bia, longe da faixa (perto dela ficam só os postes e a placa)
  ...[-95, -85, -75, -65, -55, -45, -35, 5, 15].map((z, i) => ({ x: -1.45, z, e: 0.9 + random(`arv-b-${i}`) * 0.35, k: 20 + i })),
];
const VERDES = ["#3f7d3a", "#4f9a45", "#2f6b34", "#5aa64b"];

export const Arvores: React.FC<{ s: number; geada?: boolean }> = ({ s, geada = false }) => (
  <>
    {ARVORES.map((a) => {
      const balanco = Math.sin(s * 1.1 + a.k * 1.7) * 0.035 + Math.sin(s * 2.3 + a.k) * 0.012;
      return (
        <group key={a.k} position={[a.x, CALCADA_Y, a.z]} scale={a.e}>
          <mesh position={[0, 1.4, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.16, 2.8, 8]} />
            <meshStandardMaterial color="#5b4636" roughness={0.9} />
          </mesh>
          <group position={[0, 2.6, 0]} rotation={[balanco * 0.6, 0, balanco]}>
            {[
              [0, 0.9, 0, 1.25],
              [0.6, 0.6, 0.3, 0.9],
              [-0.55, 0.7, -0.25, 0.95],
              [0.1, 1.5, -0.1, 0.85],
            ].map(([x, y, z, r], i) => (
              <mesh key={i} position={[x, y, z]} castShadow>
                <icosahedronGeometry args={[r, 1]} />
                <meshStandardMaterial
                  color={geada ? "#c9d6dc" : VERDES[(a.k + i) % VERDES.length]}
                  roughness={0.85}
                  flatShading
                />
              </mesh>
            ))}
          </group>
        </group>
      );
    })}
  </>
);

// ---------- Folhas caindo devagar (gravidade pela metade) ----------
export const Folhas: React.FC<{ s: number; opacidade: number }> = ({ s, opacidade }) => {
  const N = 90;
  const base = useMemo(
    () =>
      Array.from({ length: N }, (_, i) => ({
        x: -10 + random(`folha-x-${i}`) * 14,
        z: -32 + random(`folha-z-${i}`) * 30,
        y0: random(`folha-y-${i}`) * 7,
        v: 0.25 + random(`folha-v-${i}`) * 0.2,
        f: random(`folha-f-${i}`) * 10,
        cor: i % 3 === 0 ? "#d9a441" : i % 3 === 1 ? "#6aa84f" : "#b7c93a",
      })),
    [],
  );
  if (opacidade <= 0) return null;
  return (
    <>
      {base.map((b, i) => {
        const y = 0.2 + ((((b.y0 - s * b.v) % 7) + 7) % 7);
        return (
          <mesh
            key={i}
            position={[b.x + Math.sin(s * 1.3 + b.f) * 0.5, y, b.z + Math.cos(s * 0.9 + b.f) * 0.3]}
            rotation={[s * 2 + b.f, s * 1.4 + b.f, s + b.f]}
          >
            <planeGeometry args={[0.09, 0.06]} />
            <meshStandardMaterial color={b.cor} side={THREE.DoubleSide} transparent opacity={opacidade} />
          </mesh>
        );
      })}
    </>
  );
};

// ---------- Pombos: bicam o chão e levantam voo quando a gravidade cai ----------
const Pombo: React.FC<{ asa: number; bica: number }> = ({ asa, bica }) => (
  <group>
    <mesh scale={[0.11, 0.1, 0.19]} castShadow>
      <sphereGeometry args={[1, 12, 10]} />
      <meshStandardMaterial color="#8a8f99" roughness={0.8} />
    </mesh>
    <group position={[0, 0.08 - bica * 0.1, 0.15 + bica * 0.04]}>
      <mesh>
        <sphereGeometry args={[0.06, 10, 8]} />
        <meshStandardMaterial color="#5d6370" roughness={0.7} />
      </mesh>
      <mesh position={[0, -0.01, 0.065]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.015, 0.04, 6]} />
        <meshStandardMaterial color="#e0a052" />
      </mesh>
    </group>
    <mesh position={[0, 0.02, -0.2]} scale={[0.08, 0.015, 0.1]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#6e7480" />
    </mesh>
    {[-1, 1].map((lado) => (
      <group key={lado} position={[lado * 0.08, 0.04, 0]} rotation={[0, 0, lado * asa]}>
        <mesh position={[lado * 0.13, 0, 0]}>
          <boxGeometry args={[0.26, 0.012, 0.13]} />
          <meshStandardMaterial color="#7d838e" roughness={0.8} />
        </mesh>
      </group>
    ))}
  </group>
);

export const Pombos: React.FC<{ s: number; frame: number }> = ({ s, frame }) => {
  const bando = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        x: 2.4 + random(`pombo-x-${i}`) * 1.6,
        z: -25 + random(`pombo-z-${i}`) * 6,
        giro: random(`pombo-g-${i}`) * Math.PI * 2,
        raio: 5 + random(`pombo-r-${i}`) * 5,
        altura: 5 + random(`pombo-h-${i}`) * 4,
        fase: random(`pombo-f-${i}`) * Math.PI * 2,
        vel: 0.35 + random(`pombo-v-${i}`) * 0.2,
      })),
    [],
  );
  const centro = [-1, 0, -22];
  return (
    <>
      {bando.map((p, i) => {
        const decola = MARCOS.quedaGravidade + 0.15 + i * 0.06;
        const voo = interpolate(s, [decola, decola + 2.2], [0, 1], { ...clamp, easing: ease });
        const ang = p.fase + (s - decola) * p.vel * (s > decola ? 1 : 0);
        const noAr: [number, number, number] = [
          centro[0] + Math.cos(ang) * p.raio,
          p.altura + Math.sin(s * 0.8 + p.fase) * 0.6,
          centro[2] + Math.sin(ang) * p.raio,
        ];
        // No chão: passinhos e bicadas
        const passo = Math.sin(s * 3 + i) * 0.08;
        const noChao: [number, number, number] = [p.x + passo, CALCADA_Y + 0.12, p.z];
        const pos = noChao.map((v, k) => v + (noAr[k] - v) * voo) as [number, number, number];
        // Voando, o pombo olha na direção da volta
        const giroVoo = -ang;
        const giro = p.giro + (giroVoo - p.giro) * voo;
        const asa = voo > 0.01 ? Math.sin(frame * 0.9 + i) * 0.9 * (voo < 1 ? 1 : 0.55) : 0;
        const bica = voo < 0.01 ? Math.max(0, Math.sin(s * 5 + i * 2)) : 0;
        return (
          <group key={i} position={pos} rotation={[0, giro, 0]}>
            <Pombo asa={asa} bica={bica} />
          </group>
        );
      })}
    </>
  );
};

// ---------- Ciclovia no canteiro central e ciclistas ----------
export const Ciclovia: React.FC = () => (
  <>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-5.5, 0.014, -40]} receiveShadow>
      <planeGeometry args={[1.1, 240]} />
      <meshStandardMaterial color="#b0413e" roughness={0.9} />
    </mesh>
    {[-6.08, -4.92].map((x) => (
      <mesh key={x} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.016, -40]}>
        <planeGeometry args={[0.07, 240]} />
        <meshStandardMaterial color="#f2f2f2" />
      </mesh>
    ))}
  </>
);

const Ciclista: React.FC<{ pedal: number; roupa: string; pele: string; capacete: string }> = ({ pedal, roupa, pele, capacete }) => (
  <group>
    {[0.52, -0.52].map((z) => (
      <mesh key={z} position={[0, 0.34, z]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.31, 0.03, 8, 20]} />
        <meshStandardMaterial color="#1c1c1c" />
      </mesh>
    ))}
    <mesh position={[0, 0.62, 0]} rotation={[0.25, 0, 0]}>
      <boxGeometry args={[0.04, 0.05, 1.05]} />
      <meshStandardMaterial color="#2a9d8f" metalness={0.4} roughness={0.4} />
    </mesh>
    {/* Pernas pedalando */}
    {[0, Math.PI].map((f) => (
      <mesh key={f} position={[f ? 0.09 : -0.09, 0.62 + Math.cos(pedal + f) * 0.1, -0.12 + Math.sin(pedal + f) * 0.1]} rotation={[Math.sin(pedal + f) * 0.4, 0, 0]}>
        <capsuleGeometry args={[0.06, 0.45, 4, 8]} />
        <meshStandardMaterial color="#2a2d36" />
      </mesh>
    ))}
    <mesh position={[0, 1.15, -0.05]} rotation={[0.35, 0, 0]} castShadow>
      <capsuleGeometry args={[0.18, 0.4, 4, 10]} />
      <meshStandardMaterial color={roupa} roughness={0.8} />
    </mesh>
    <mesh position={[0, 1.55, 0.12]}>
      <sphereGeometry args={[0.15, 14, 12]} />
      <meshStandardMaterial color={pele} />
    </mesh>
    <mesh position={[0, 1.6, 0.11]}>
      <sphereGeometry args={[0.165, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
      <meshStandardMaterial color={capacete} />
    </mesh>
  </group>
);

export const Ciclistas: React.FC<{ s: number; evitarFaixa: boolean }> = ({ s, evitarFaixa }) => {
  const lista = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => ({
        dir: i % 2 ? -1 : 1,
        z0: -100 + random(`cic-z-${i}`) * 120,
        vel: 4 + random(`cic-v-${i}`) * 1.5,
        x: -5.5 + (i % 2 ? -0.25 : 0.25),
        roupa: pegar(ROUPAS, `cic-r-${i}`),
        pele: pegar(PELES, `cic-p-${i}`),
        capacete: pegar(["#ffffff", "#ff6b6b", "#ffd166", "#111111"], `cic-c-${i}`),
      })),
    [],
  );
  return (
    <>
      {lista.map((c, i) => {
        const d = c.vel * s;
        const z = -110 + ((((c.z0 + 110 + c.dir * d) % 140) + 140) % 140);
        // Na cena do carro, ninguém passa pela faixa (o pedestre está atravessando)
        if (evitarFaixa && Math.abs(z + 14) < 7) return null;
        return (
          <group key={i} position={[c.x, 0, z]} rotation={[0, c.dir > 0 ? 0 : Math.PI, 0]}>
            <Ciclista pedal={d / 0.5} roupa={c.roupa} pele={c.pele} capacete={c.capacete} />
          </group>
        );
      })}
    </>
  );
};

// ---------- Ônibus ----------
export const Onibus: React.FC<{ x: number; z: number; dir: number; cor?: string }> = ({ x, z, dir, cor = "#d62828" }) => (
  <group position={[x, 0, z]} rotation={[0, dir > 0 ? 0 : Math.PI, 0]}>
    <mesh position={[0, 1.75, 0]} castShadow>
      <boxGeometry args={[2.5, 2.9, 11.5]} />
      <meshStandardMaterial color="#f4f4f2" roughness={0.5} />
    </mesh>
    <mesh position={[0, 0.65, 0]}>
      <boxGeometry args={[2.52, 0.35, 11.52]} />
      <meshStandardMaterial color={cor} roughness={0.5} />
    </mesh>
    {/* Faixa de janelas */}
    <mesh position={[0, 2.25, 0]}>
      <boxGeometry args={[2.54, 1.0, 10.6]} />
      <meshStandardMaterial color="#1f2a36" roughness={0.15} metalness={0.4} />
    </mesh>
    <mesh position={[0, 2.0, 5.77]}>
      <boxGeometry args={[2.3, 1.5, 0.02]} />
      <meshStandardMaterial color="#1f2a36" roughness={0.1} metalness={0.5} />
    </mesh>
    {/* Letreiro */}
    <mesh position={[0, 3.0, 5.77]}>
      <boxGeometry args={[1.8, 0.3, 0.02]} />
      <meshStandardMaterial color="#ffb703" emissive="#ffb703" emissiveIntensity={0.8} />
    </mesh>
    {[
      [-1.15, 3.8],
      [1.15, 3.8],
      [-1.15, -3.8],
      [1.15, -3.8],
    ].map(([rx, rz], i) => (
      <mesh key={i} position={[rx, 0.48, rz]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.48, 0.48, 0.3, 16]} />
        <meshStandardMaterial color="#141414" />
      </mesh>
    ))}
  </group>
);

// ---------- Fila de carros na pista da Bia (trânsito parado da Paulista) ----------
// Quando a gravidade cai, os carros dão um "pulinho" na suspensão
export const FilaDeCarros: React.FC<{ s: number }> = ({ s }) => {
  const q = MARCOS.quedaGravidade;
  const cores = ["#f1c40f", "#ecf0f1", "#2b2d42", "#8d99ae", "#e76f51"];
  return (
    <>
      {[-19, -24.6, -30.2, -35.8, -41.4].map((z, i) => {
        const t = s - q - i * 0.05;
        const pulo = t > 0 ? Math.max(0, Math.sin(t * 5) * Math.exp(-t * 2.2)) * 0.12 : 0;
        return (
          <group key={z} position={[0, pulo, 0]}>
            <Carro x={-3.8} z={z} dir={1} cor={cores[i]} />
          </group>
        );
      })}
    </>
  );
};

// ---------- Semáforo ----------
const Lampada: React.FC<{ y: number; cor: string; acesa: boolean }> = ({ y, cor, acesa }) => (
  <mesh position={[0, y, 0.11]}>
    <circleGeometry args={[0.09, 16]} />
    <meshStandardMaterial color={acesa ? cor : "#2a2a2a"} emissive={acesa ? cor : "#000000"} emissiveIntensity={acesa ? 2 : 0} toneMapped={!acesa} />
  </mesh>
);

export const Semaforos: React.FC<{ s: number }> = ({ s }) => {
  // Carros: verde → amarelo → vermelho logo antes de a Bia atravessar; pedestre: vermelho → verde
  const carro = s < 12.6 ? "verde" : s < 13.6 ? "amarelo" : "vermelho";
  const pedestreVerde = s >= 13.6;
  return (
    <>
      {[
        // Do outro lado da faixa; e, do lado da Bia, no mesmo poste da placa (luz de carro acima da placa)
        { x: -9.35, z: -12.4, giro: Math.PI / 2 },
        { x: -1.75, z: -16.2, giro: -Math.PI / 2 },
      ].map((p, i) => (
        <group key={i} position={[p.x, CALCADA_Y, p.z]} rotation={[0, p.giro, 0]}>
          <mesh position={[0, 1.85, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.06, 3.7, 8]} />
            <meshStandardMaterial color="#2b2f36" metalness={0.4} roughness={0.5} />
          </mesh>
          {/* Para os carros */}
          <group position={[0, 3.35, 0]}>
            <mesh>
              <boxGeometry args={[0.3, 0.75, 0.2]} />
              <meshStandardMaterial color="#1b1d21" />
            </mesh>
            <Lampada y={0.22} cor="#ff3b30" acesa={carro === "vermelho"} />
            <Lampada y={0} cor="#ffcc00" acesa={carro === "amarelo"} />
            <Lampada y={-0.22} cor="#34c759" acesa={carro === "verde"} />
          </group>
          {/* Para pedestres */}
          <group position={[0, 2.0, 0]} rotation={[0, Math.PI, 0]}>
            <mesh>
              <boxGeometry args={[0.28, 0.5, 0.18]} />
              <meshStandardMaterial color="#1b1d21" />
            </mesh>
            <Lampada y={0.11} cor="#ff3b30" acesa={!pedestreVerde} />
            <Lampada y={-0.11} cor="#34c759" acesa={pedestreVerde} />
          </group>
        </group>
      ))}
    </>
  );
};

// ---------- Banca de jornal e pipoqueiro ----------
const texturaRevistas = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#1e5631";
  ctx.fillRect(0, 0, 256, 128);
  for (let l = 0; l < 3; l++)
    for (let c = 0; c < 9; c++) {
      ctx.fillStyle = ["#e63946", "#f1faee", "#ffd166", "#06d6a0", "#118ab2", "#ef476f", "#ff9f1c"][(l * 9 + c * 3) % 7];
      ctx.fillRect(6 + c * 27.5, 8 + l * 40, 22, 32);
    }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
};

export const BancaEPipoqueiro: React.FC<{ s: number; frame: number }> = ({ s, frame }) => {
  const revistas = useMemo(texturaRevistas, []);
  return (
    <>
      <group position={[-0.7, CALCADA_Y, -40]}>
        <mesh position={[0, 1.15, 0]} castShadow>
          <boxGeometry args={[1.6, 2.3, 3.2]} />
          <meshStandardMaterial color="#1e5631" roughness={0.6} />
        </mesh>
        <mesh position={[0, 2.4, 0]}>
          <boxGeometry args={[2.0, 0.15, 3.6]} />
          <meshStandardMaterial color="#174a28" />
        </mesh>
        {[-1, 1].map((lado) => (
          <mesh key={lado} position={[lado * 0.81, 1.2, 0]} rotation={[0, lado * Math.PI / 2, 0]}>
            <planeGeometry args={[3, 1.5]} />
            <meshStandardMaterial map={revistas} />
          </mesh>
        ))}
      </group>
      {/* Carrinho de pipoca com guarda-sol e o pipoqueiro do lado */}
      <group position={[-0.9, CALCADA_Y, -26]}>
        <mesh position={[0, 0.75, 0]} castShadow>
          <boxGeometry args={[0.8, 0.9, 1.1]} />
          <meshStandardMaterial color="#e63946" roughness={0.5} />
        </mesh>
        <mesh position={[0, 1.4, 0]}>
          <boxGeometry args={[0.7, 0.45, 0.9]} />
          <meshStandardMaterial color="#fff3c4" transparent opacity={0.75} />
        </mesh>
        <mesh position={[0, 1.4, 0]} scale={[0.6, 0.35, 0.8]}>
          <icosahedronGeometry args={[0.5, 1]} />
          <meshStandardMaterial color="#fff8e1" flatShading />
        </mesh>
        <mesh position={[0, 1.9, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 1.2, 6]} />
          <meshStandardMaterial color="#888888" />
        </mesh>
        <mesh position={[0, 2.5, 0]} rotation={[0, s * 0.2, 0]}>
          <coneGeometry args={[0.95, 0.35, 12, 1, true]} />
          <meshStandardMaterial color="#ffd166" side={THREE.DoubleSide} />
        </mesh>
        <group position={[0.75, 0, 0]}>
          <Pedestre x={0} z={0} dir={-1} fase={Math.sin(frame * 0.08) * 0.15} roupa="#f1faee" pele="#c68642" cabelo="#111111" escala={0.9} />
        </group>
      </group>
    </>
  );
};

// ---------- Gente parada conversando (dá pulinhos depois que a gravidade cai) ----------
const GRUPOS: [number, number][] = [
  [3.4, -31],
  [3.2, -44],
  [3.6, -55],
  [3.3, 4],
  [-10.6, -6],
  [-10.4, -22],
  [-10.8, -33],
  [-10.5, -47],
];

export const GenteConversando: React.FC<{ s: number; frame: number }> = ({ s, frame }) => {
  const pessoas = useMemo(
    () =>
      GRUPOS.flatMap(([gx, gz], g) =>
        Array.from({ length: 2 + (g % 2) }, (_, k) => {
          const id = `conv-${g}-${k}`;
          const ang = (k / (2 + (g % 2))) * Math.PI * 2 + g;
          return {
            id,
            x: gx + Math.cos(ang) * 0.55,
            z: gz + Math.sin(ang) * 0.55,
            // Vira para o centro da rodinha
            dir: Math.cos(ang) > 0 ? -1 : 1,
            roupa: pegar(ROUPAS, `${id}-r`),
            pele: pegar(PELES, `${id}-p`),
            cabelo: pegar(CABELOS, `${id}-c`),
            escala: 0.85 + random(`${id}-e`) * 0.13,
            pula: random(`${id}-pula`),
          };
        }),
      ),
    [],
  );
  return (
    <>
      {pessoas.map((p, i) => {
        // Pulinho de vez em quando (no ar o dobro do tempo), só depois da queda
        const ciclo = 3 + p.pula * 3;
        const t = (s + p.pula * 7) % ciclo;
        const tau = Math.min(t, 0.8);
        const pulinho = s > MARCOS.quedaGravidade + 1 && t < 0.8 ? Math.max(0, 1.96 * tau - (G / 2) * tau * tau) : 0;
        return (
          <group key={p.id} position={[0, pulinho, 0]}>
            <Pedestre
              x={p.x}
              z={p.z}
              dir={p.dir}
              fase={Math.sin(frame * 0.07 + i) * 0.18}
              roupa={p.roupa}
              pele={p.pele}
              cabelo={p.cabelo}
              escala={p.escala}
            />
          </group>
        );
      })}
    </>
  );
};

// ---------- MASP (caixa de vidro sobre dois pórticos vermelhos) e antenas da Paulista ----------
export const MASP_Z: [number, number] = [-88, -60];
const VERMELHO_MASP = "#c1272d";

const texturaVidro = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#2c3e50";
  ctx.fillRect(0, 0, 512, 128);
  ctx.strokeStyle = "#1a252f";
  ctx.lineWidth = 3;
  for (let x = 0; x < 512; x += 16) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 128);
    ctx.stroke();
  }
  ctx.fillStyle = "rgba(160,200,230,0.18)";
  ctx.fillRect(0, 10, 512, 40);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
};

export const Masp: React.FC<{ frame: number }> = ({ frame }) => {
  const vidro = useMemo(texturaVidro, []);
  const [z0, z1] = MASP_Z;
  const zc = (z0 + z1) / 2;
  const comp = z1 - z0 - 2;
  const xc = -18;
  return (
    <group>
      {/* Piso do vão livre */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[xc, CALCADA_Y + 0.01, zc]} receiveShadow>
        <planeGeometry args={[12, comp + 2]} />
        <meshStandardMaterial color="#b9b4aa" roughness={0.9} />
      </mesh>
      {/* Caixa de vidro suspensa */}
      <mesh position={[xc, 12, zc]} castShadow>
        <boxGeometry args={[10, 7.5, comp]} />
        <meshStandardMaterial attach="material-0" map={vidro} roughness={0.2} metalness={0.3} />
        <meshStandardMaterial attach="material-1" map={vidro} roughness={0.2} metalness={0.3} />
        <meshStandardMaterial attach="material-2" color="#3b4650" />
        <meshStandardMaterial attach="material-3" color="#55606a" />
        <meshStandardMaterial attach="material-4" map={vidro} roughness={0.2} metalness={0.3} />
        <meshStandardMaterial attach="material-5" map={vidro} roughness={0.2} metalness={0.3} />
      </mesh>
      {/* Dois pórticos vermelhos e as vigas de cima */}
      {[z0 + 1, z1 - 1].map((z) => (
        <group key={z}>
          {[xc - 5.3, xc + 5.3].map((x) => (
            <mesh key={x} position={[x, 8.5, z]} castShadow>
              <boxGeometry args={[1.2, 17, 1.2]} />
              <meshStandardMaterial color={VERMELHO_MASP} roughness={0.6} />
            </mesh>
          ))}
          <mesh position={[xc, 16.6, z]}>
            <boxGeometry args={[11.8, 1.3, 1.2]} />
            <meshStandardMaterial color={VERMELHO_MASP} roughness={0.6} />
          </mesh>
        </group>
      ))}
      {[xc - 5.3, xc + 5.3].map((x) => (
        <mesh key={x} position={[x, 16.6, zc]}>
          <boxGeometry args={[1.2, 1.3, comp + 2]} />
          <meshStandardMaterial color={VERMELHO_MASP} roughness={0.6} />
        </mesh>
      ))}
      {/* Gente no vão livre */}
      {Array.from({ length: 8 }, (_, i) => (
        <Pedestre
          key={i}
          x={xc - 4 + random(`masp-x-${i}`) * 8}
          z={zc - 10 + random(`masp-z-${i}`) * 20}
          dir={random(`masp-d-${i}`) > 0.5 ? 1 : -1}
          fase={Math.sin(frame * 0.07 + i) * 0.2}
          roupa={pegar(ROUPAS, `masp-r-${i}`)}
          pele={pegar(PELES, `masp-p-${i}`)}
          cabelo={pegar(CABELOS, `masp-c-${i}`)}
          escala={0.88}
        />
      ))}
    </group>
  );
};

// Antenas listradas de vermelho e branco atrás dos prédios
export const Antenas: React.FC = () => (
  <>
    {[
      [-42, -105, 70],
      [28, -135, 85],
    ].map(([x, z, h], i) => (
      <group key={i} position={[x, 0, z]}>
        {Array.from({ length: 10 }, (_, k) => (
          <mesh key={k} position={[0, (k + 0.5) * (h / 10), 0]}>
            <cylinderGeometry args={[0.6 - k * 0.04, 0.64 - k * 0.04, h / 10, 8]} />
            <meshStandardMaterial color={k % 2 ? "#ffffff" : "#d62828"} roughness={0.6} />
          </mesh>
        ))}
        <mesh position={[0, h + 0.3, 0]}>
          <sphereGeometry args={[0.35, 10, 8]} />
          <meshStandardMaterial color="#ff3b30" emissive="#ff3b30" emissiveIntensity={1.5} />
        </mesh>
      </group>
    ))}
  </>
);
