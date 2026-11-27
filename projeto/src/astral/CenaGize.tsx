import { useMemo } from "react";
import * as THREE from "three";
import { Sol } from "../cinema/Palco";
import { Instancias } from "./cidade";
import { CeuDia, Cx, Gente, Luzinha, rnd, type Roupa, texturaCanvas } from "./pecas";
import { CamTrajeto, type Chave, Palco } from "./palco";
import type { V3 } from "./tempo";

// GIZÉ, 17:30: a Grande Pirâmide (blocos de calcário de verdade) no sol baixo, Quéfren com o
// topo de revestimento, Miquerinos, as pirâmides das rainhas, a Esfinge, mastabas, camelos,
// ônibus de turista e o Cairo com minaretes ao longe. Você atravessa os blocos de pedra e chega
// na Câmara do Rei: granito vermelho polido, vigas no teto, sarcófago, dutos de ar, luz de
// serviço e turistas.

// blocos de calcário: fileiras com blocos de largura variada, tons diferentes e juntas escuras
const texturaBlocos = (base: string, sem: string, repetir: [number, number]) =>
  texturaCanvas(
    512,
    512,
    (g) => {
      const c = new THREE.Color(base);
      g.fillStyle = "#8a7454";
      g.fillRect(0, 0, 512, 512);
      const linhas = 32;
      const h = 512 / linhas;
      for (let r = 0; r < linhas; r++) {
        let x = -rnd(`${sem}o${r}`) * 40;
        let i = 0;
        while (x < 512) {
          const w = 9 + rnd(`${sem}w${r}${i}`) * 9;
          const v = 0.86 + rnd(`${sem}v${r}${i}`) * 0.22;
          const q = c.clone().multiplyScalar(v);
          g.fillStyle = `rgb(${Math.min(255, q.r * 255)},${Math.min(255, q.g * 255)},${Math.min(255, q.b * 255)})`;
          g.fillRect(x + 0.8, r * h + 0.8, w - 1.6, h - 1.6);
          // desgaste: canto mais escuro e uns furinhos
          g.fillStyle = "rgba(60,40,20,0.18)";
          g.fillRect(x + 1.2, r * h + h - 4, w - 2.4, 3);
          if (rnd(`${sem}f${r}${i}`) > 0.7) g.fillRect(x + w * 0.3, r * h + 4, 3, 3);
          x += w;
          i++;
        }
      }
    },
    repetir,
  );

const Piramide: React.FC<{ p: V3; base: number; altura: number; cor: string; topoBranco?: boolean; rep?: number }> = ({ p, base, altura, cor, topoBranco, rep = 6 }) => {
  const tex = useMemo(() => texturaBlocos(cor, `pi${base}`, [rep, rep]), [cor, base, rep]);
  return (
    <group position={p}>
      <mesh position={[0, altura / 2, 0]} rotation={[0, Math.PI / 4, 0]} castShadow receiveShadow>
        <coneGeometry args={[base / Math.SQRT2, altura, 4, 1]} />
        <meshStandardMaterial map={tex} roughness={0.95} flatShading />
      </mesh>
      {topoBranco && (
        <mesh position={[0, altura * 0.89, 0]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[(base / Math.SQRT2) * 0.225, altura * 0.225, 4, 1]} />
          <meshStandardMaterial color="#e9dcc0" roughness={0.8} flatShading />
        </mesh>
      )}
    </group>
  );
};

// Esfinge deitada olhando para o leste (+z), com o toucado (nemes) e as patas para a frente
const Esfinge: React.FC<{ p: V3 }> = ({ p }) => {
  const rosto = useMemo(
    () =>
      texturaCanvas(128, 128, (g) => {
        g.fillStyle = "#c9a066";
        g.fillRect(0, 0, 128, 128);
        g.fillStyle = "#5a4024";
        g.fillRect(30, 46, 22, 7);
        g.fillRect(76, 46, 22, 7);
        g.fillStyle = "#8a6a40";
        g.fillRect(58, 56, 12, 26);
        g.fillRect(44, 92, 40, 6);
        g.fillStyle = "rgba(80,55,30,0.25)";
        for (let i = 0; i < 120; i++) g.fillRect(rnd(`es${i}`) * 128, rnd(`et${i}`) * 128, 4, 2);
      }),
    [],
  );
  const pedra = useMemo(() => texturaBlocos("#c9a066", "esf", [3, 2]), []);
  const M = (t: V3, pos: V3, r: V3 = [0, 0, 0]) => (
    <mesh position={pos} rotation={r} castShadow receiveShadow>
      <boxGeometry args={t} />
      <meshStandardMaterial map={pedra} roughness={0.95} />
    </mesh>
  );
  return (
    <group position={p}>
      {/* buraco onde ela fica (chão rebaixado) e o muro em volta */}
      <Cx t={[40, 0.4, 90]} p={[0, 0.05, 6]} c="#b8915c" sombra={false} />
      {M([16, 10, 52], [0, 5, -6])}
      {M([14, 4, 20], [0, 11, -20])}
      {M([4, 3, 18], [-4.5, 1.5, 26])}
      {M([4, 3, 18], [4.5, 1.5, 26])}
      {/* cabeça com toucado */}
      {M([12, 13, 9], [0, 17, 16])}
      <mesh position={[0, 15.5, 20.6]}>
        <boxGeometry args={[8, 10, 0.4]} />
        <meshStandardMaterial map={rosto} roughness={0.9} />
      </mesh>
      {M([2.4, 10, 3], [-5, 13, 19])}
      {M([2.4, 10, 3], [5, 13, 19])}
      {M([9, 2, 8], [0, 23.5, 15])}
    </group>
  );
};

// camelo com sela colorida (às vezes com alguém montado)
const Camelo: React.FC<{ p: V3; giro: number; t: number; montado?: boolean }> = ({ p, giro, t, montado }) => {
  const passo = Math.sin(t * 3) * 0.25;
  return (
    <group position={p} rotation={[0, giro, 0]}>
      {[
        [-0.35, 0.8, passo],
        [0.35, 0.8, -passo],
        [-0.35, -0.8, -passo],
        [0.35, -0.8, passo],
      ].map(([x, z, r], i) => (
        <group key={i} position={[x, 1.4, z]} rotation={[r, 0, 0]}>
          <Cx t={[0.2, 1.4, 0.2]} p={[0, -0.7, 0]} c="#a87a4a" />
        </group>
      ))}
      <Cx t={[0.9, 0.8, 2.2]} p={[0, 1.75, 0]} c="#b5864f" />
      <Cx t={[0.7, 0.6, 0.8]} p={[0, 2.35, -0.1]} c="#b5864f" />
      <Cx t={[1.0, 0.15, 0.9]} p={[0, 2.25, 0.5]} c="#c0392b" />
      <Cx t={[0.3, 1.2, 0.3]} p={[0, 2.4, 1.25]} r={[0.5, 0, 0]} c="#b5864f" />
      <Cx t={[0.35, 0.35, 0.7]} p={[0, 3.0, 1.65]} c="#a87a4a" />
      {montado && <Gente r={{ pele: "#e8b98f", cabelo: "#c9a15a", camisa: "#f1f1f1", calca: "#3d5a80", penteado: "longo" }} pos={[0, 1.65, 0.4]} acao="sentado" t={t} escala={0.9} />}
    </group>
  );
};

const texturaAreia = () =>
  texturaCanvas(
    256,
    256,
    (g) => {
      g.fillStyle = "#d4b07a";
      g.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 3000; i++) {
        const r = rnd(`ar${i}`);
        g.fillStyle = r > 0.66 ? "rgba(255,240,210,0.18)" : r > 0.33 ? "rgba(150,110,60,0.14)" : "rgba(120,90,50,0.08)";
        g.fillRect(rnd(`ax${i}`) * 256, rnd(`ay${i}`) * 256, 2 + rnd(`aw${i}`) * 6, 1.5);
      }
    },
    [120, 120],
  );

const Planalto: React.FC<{ s: number }> = ({ s }) => {
  const areia = useMemo(texturaAreia, []);
  const { mastabas, cairo, turistas, onibus, minaretes } = useMemo(() => {
    const mastabas: { p: V3; t: V3; cor: string }[] = [];
    for (let i = 0; i < 9; i++)
      for (let j = 0; j < 7; j++) {
        mastabas.push({ p: [-70 + i * 18 + rnd(`mx${i}${j}`) * 4, 2.2, 190 + j * 22], t: [14, 4.4, 9 + rnd(`mt${i}${j}`) * 6], cor: rnd(`mc${i}${j}`) > 0.5 ? "#c9a46a" : "#bf9a60" });
        mastabas.push({ p: [-260 - i * 18, 2.2, -40 + j * 22], t: [14, 4.4, 10], cor: "#c4a066" });
      }
    const cairo: { p: V3; t: V3; cor: string }[] = [];
    for (let i = 0; i < 900; i++) {
      const x = -900 - rnd(`cx${i}`) * 1600;
      const z = 300 + rnd(`cz${i}`) * 1800;
      const a = 8 + rnd(`ca${i}`) * 26;
      cairo.push({ p: [x, a / 2, z], t: [14 + rnd(`cw${i}`) * 16, a, 14 + rnd(`cd${i}`) * 16], cor: ["#c9b394", "#b89f80", "#d8c7a8", "#a88c6c", "#c28a5c", "#e0d6c4"][i % 6] });
    }
    const minaretes: { p: V3; t: V3; cor: string }[] = [];
    for (let i = 0; i < 40; i++) minaretes.push({ p: [-950 - rnd(`mi${i}`) * 1500, 26, 320 + rnd(`mj${i}`) * 1700], t: [3, 52, 3], cor: "#efe6d4" });
    const turistas: { p: V3; t: V3; cor: string }[] = [];
    for (let i = 0; i < 260; i++) turistas.push({ p: [-110 + rnd(`tx${i}`) * 220, 0.85, 118 + rnd(`tz${i}`) * 30], t: [0.6, 1.7, 0.6], cor: ["#f1f1f1", "#2b2d42", "#e63946", "#457b9d", "#e9c46a"][i % 5] });
    const onibus: { p: V3; t: V3; cor: string }[] = [];
    for (let i = 0; i < 14; i++) onibus.push({ p: [140 + (i % 7) * 4.5, 1.7, 230 + Math.floor(i / 7) * 16], t: [3, 3.4, 12], cor: ["#f4f4f2", "#2e5d9c", "#f4f4f2", "#e9c46a"][i % 4] });
    return { mastabas, cairo, turistas, onibus, minaretes };
  }, []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.95 }), []);
  return (
    <group>
      <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[9000, 9000]} />
        <meshStandardMaterial map={areia} roughness={1} />
      </mesh>
      {/* estrada e estacionamento dos ônibus */}
      <Cx t={[10, 0.1, 420]} p={[175, 0.04, 380]} c="#5b5853" sombra={false} />
      <Cx t={[50, 0.1, 40]} p={[155, 0.04, 238]} c="#6a6660" sombra={false} />
      <Piramide p={[0, 0, 0]} base={230} altura={146} cor="#d6bb8c" />
      <Piramide p={[-250, 0, -260]} base={215} altura={136} cor="#d2b486" topoBranco />
      <Piramide p={[-430, 0, -520]} base={103} altura={65} cor="#ccad80" rep={3} />
      {[0, 1, 2].map((i) => (
        <Piramide key={i} p={[150, 0, 60 - i * 55]} base={46} altura={30} cor="#ccae82" rep={2} />
      ))}
      <Esfinge p={[-150, 0, 160]} />
      <Instancias itens={mastabas} material={mat} />
      <Instancias itens={cairo} material={mat} />
      <Instancias itens={minaretes} material={mat} />
      <Instancias itens={turistas} material={mat} sombra={false} />
      <Instancias itens={onibus} material={mat} />
      {Array.from({ length: 9 }).map((_, i) => (
        <Camelo key={i} p={[30 + i * 9 + rnd(`cm${i}`) * 4, 0, 150 + rnd(`cn${i}`) * 30]} giro={rnd(`co${i}`) * 6} t={s + i} montado={i % 2 === 0} />
      ))}
    </group>
  );
};

// os blocos de pedra passando por você quando atravessa a face da pirâmide
const DentroDaPedra: React.FC<{ c: V3 }> = ({ c }) => {
  const tex = useMemo(() => texturaBlocos("#d6bb8c", "dentro", [1, 1]), []);
  return (
    <group position={c}>
      <mesh>
        <boxGeometry args={[7, 7, 7]} />
        <meshStandardMaterial map={tex} side={THREE.BackSide} roughness={0.9} />
      </mesh>
      <pointLight color="#ffe3b8" intensity={6} distance={10} decay={1.5} />
    </group>
  );
};

// granito vermelho polido com blocos grandes (5 fiadas) e pontinhos pretos/rosados
const texturaGranito = (sem: string, larg: number) =>
  texturaCanvas(1024, 512, (g) => {
    g.fillStyle = "#1c0c08";
    g.fillRect(0, 0, 1024, 512);
    const fiadas = 5;
    const h = 512 / fiadas;
    for (let r = 0; r < fiadas; r++) {
      let x = 0;
      let i = 0;
      while (x < 1024) {
        const w = (1024 / larg) * (1.4 + rnd(`${sem}g${r}${i}`) * 1.6);
        const v = 0.85 + rnd(`${sem}v${r}${i}`) * 0.3;
        g.fillStyle = `rgb(${Math.round(150 * v)},${Math.round(70 * v)},${Math.round(55 * v)})`;
        g.fillRect(x + 2, r * h + 2, w - 4, h - 4);
        x += w;
        i++;
      }
    }
    for (let i = 0; i < 16000; i++) {
      const r = rnd(`${sem}p${i}`);
      g.fillStyle = r > 0.55 ? "rgba(30,12,8,0.75)" : r > 0.25 ? "rgba(210,130,110,0.55)" : "rgba(240,200,190,0.4)";
      g.fillRect(rnd(`${sem}x${i}`) * 1024, rnd(`${sem}y${i}`) * 512, 2, 2);
    }
  });

const CamaraDoRei: React.FC<{ s: number }> = ({ s }) => {
  const L = 10.5;
  const A = 5.8;
  const P = 5.2;
  const parL = useMemo(() => texturaGranito("cl", L), []);
  const parP = useMemo(() => texturaGranito("cp", P), []);
  const chao = useMemo(() => texturaGranito("ch", L), []);
  const TURISTA: Roupa = { pele: "#7a4a2e", cabelo: "#e9e9ec", camisa: "#2aa3c9", calca: "#b49a72", sapato: "#3a2a1a", penteado: "grisalho" };
  const TURISTA2: Roupa = { pele: "#f1c9a5", cabelo: "#c9a15a", camisa: "#e76f51", calca: "#2b2d42", sapato: "#f2f2f2", penteado: "coque" };
  const parede = (tex: THREE.Texture, pos: V3, rotY: number, w: number) => (
    <mesh position={pos} rotation={[0, rotY, 0]} receiveShadow>
      <planeGeometry args={[w, A]} />
      <meshStandardMaterial map={tex} roughness={0.35} metalness={0.05} />
    </mesh>
  );
  return (
    <group position={[0, 0, -1000]}>
      {parede(parL, [0, A / 2, -P / 2], 0, L)}
      {parede(parL, [0, A / 2, P / 2], Math.PI, L)}
      {parede(parP, [-L / 2, A / 2, 0], Math.PI / 2, P)}
      {parede(parP, [L / 2, A / 2, 0], -Math.PI / 2, P)}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[L, P]} />
        <meshStandardMaterial map={chao} roughness={0.3} />
      </mesh>
      {/* teto: 9 vigas de granito atravessando */}
      {Array.from({ length: 9 }).map((_, i) => (
        <Cx key={i} t={[1.12, 0.3, P]} p={[-L / 2 + 0.6 + i * 1.165, A + 0.1, 0]} c={i % 2 ? "#5a2a20" : "#4e241b"} rug={0.5} />
      ))}
      {/* dutos de ar (quadradinhos escuros) e a passagem baixa de entrada */}
      <Cx t={[0.22, 0.22, 0.05]} p={[1.5, 0.95, -P / 2 + 0.02]} c="#050302" />
      <Cx t={[0.22, 0.22, 0.05]} p={[1.5, 0.95, P / 2 - 0.02]} c="#050302" />
      <Cx t={[1.05, 1.1, 0.05]} p={[4.4, 0.55, -P / 2 + 0.02]} c="#0a0604" />
      {/* sarcófago oco de granito, com uma quina lascada */}
      <group position={[-3.7, 0, 0.2]}>
        <Cx t={[2.28, 1.05, 0.98]} p={[0, 0.52, 0]} c="#6a3226" rug={0.45} />
        <Cx t={[1.98, 0.08, 0.68]} p={[0, 1.02, 0]} c="#1a0b08" />
        <Cx t={[0.25, 0.2, 0.25]} p={[1.08, 0.98, 0.42]} c="#2a120c" />
      </group>
      <Cx t={[2.6, 0.04, 1.4]} p={[-3.7, 0.02, 0.2]} c="#3a1a12" />
      {/* luzes de serviço: dois tubos fluorescentes perto do teto e um foco quente no sarcófago */}
      {[-P / 2 + 0.12, P / 2 - 0.12].map((z, i) => (
        <group key={z}>
          <mesh position={[i ? -1.5 : 2.5, A - 0.6, z]}>
            <boxGeometry args={[2.0, 0.07, 0.07]} />
            <meshBasicMaterial color={new THREE.Color("#fff6e8").multiplyScalar(2.6)} toneMapped={false} />
          </mesh>
          <pointLight position={[i ? -1.5 : 2.5, A - 0.9, z * 0.7]} color="#ffeccc" intensity={7} distance={14} decay={1.3} />
        </group>
      ))}
      <pointLight position={[-2.6, 2.2, 1.4]} color="#ffb070" intensity={5} distance={6} decay={1.6} />
      <ambientLight intensity={0.55} color="#ffd2c0" />
      <hemisphereLight args={["#ffdccc", "#4a2018", 0.5]} />
      <Gente r={TURISTA} pos={[1.8 - Math.max(0, s - 40.0) * 1.2, 0, 1.4]} giroY={-Math.PI / 2 - 0.3} acao="andar" t={s} rosto="aberto" />
      <Gente r={TURISTA2} pos={[-1.6, 0, -1.6]} giroY={-1.1} acao="parado" t={s} rosto="aberto" />
      {s % 2.4 < 0.12 && <Luzinha p={[-1.95, 1.45, -1.25]} tam={0.08} cor="#ffffff" forca={6} />}
    </group>
  );
};

const CAM_FORA: Chave[] = [
  { t: 34.08, pos: [150, 120, 200], alvo: [0, 80, 0], fov: 72 },
  { t: 35.5, pos: [90, 60, 290], alvo: [-10, 50, 0], fov: 72 },
  { t: 36.6, pos: [40, 22, 330], alvo: [-30, 40, 0], fov: 72 },
  { t: 37.6, pos: [12, 14, 200], alvo: [0, 22, 0], fov: 72 },
  { t: 38.2, pos: [2, 15, 116], alvo: [0, 15, 0], fov: 72 },
  { t: 38.42, pos: [0, 15, 104], alvo: [0, 15, 0], fov: 72 },
];
const CAM_DENTRO: Chave[] = [
  { t: 38.42, pos: [-4.2, 1.75, -1000.3], alvo: [3.4, 1.2, -999.9], fov: 76 },
  { t: 40.0, pos: [-3.6, 1.7, -1000.2], alvo: [3.5, 1.0, -1000.1], fov: 76 },
  { t: 41.1, pos: [2.6, 1.7, -1000.4], alvo: [-2, 1.4, -998.6], fov: 76 },
];

export const CenaGize: React.FC<{ s: number }> = ({ s }) => {
  const dentro = s >= 38.42;
  return (
    <Palco ceu="entardecer" luzCeu={dentro ? 0.12 : 0.45} foco={dentro ? 3 : 150} desfoque={0.3} brilho={0.6} saturacao={0.16} contraste={0.14} ao={dentro ? 1.0 : 0} raioAo={0.8}>
      <CamTrajeto ch={dentro ? CAM_DENTRO : CAM_FORA} s={s} balanco={dentro ? 0.6 : 2} />
      {!dentro ? (
        <>
          <hemisphereLight args={["#ffe2c2", "#b48a5a", 0.55]} />
          <Sol pos={[-300, 140, 160]} forca={2.4} area={340} cor="#ffe2b8" />
          <fog attach="fog" args={["#e8cfa8", 450, 2800]} />
          <CeuDia topo="#5e8fcf" horizonte="#f1d9b8" />
          <Planalto s={s} />
          {s > 38.35 && <DentroDaPedra c={[0, 15, 105]} />}
        </>
      ) : (
        <CamaraDoRei s={s} />
      )}
    </Palco>
  );
};
