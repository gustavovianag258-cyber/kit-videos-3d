import { useMemo } from "react";
import * as THREE from "three";
import { random } from "remotion";
import { CALCADA_Y, Carro, Pedestre, Predios, Rua } from "../Cidade";
import { ESCALA_PERSONAGEM, Personagem, type VisualPersonagem } from "../Personagem";
import { ease, lerp3, type Vec3 } from "./tempo";
import { Antenas, Ciclovia, Masp, MASP_Z, Onibus } from "./vida";

// Peças da "Avenida Paulista" reaproveitadas em várias cenas.
// Layout da rua (de Cidade.tsx): asfalto em x de -9 a -2, calçada da Bia em x de -2 a 4.5,
// faixa de pedestres em z = -14. 1 unidade = 1 metro.

export { CALCADA_Y };

// ---------- Câmera por chaves ----------
// Entre duas chaves a câmera desliza suave; uma chave com "corte" troca de plano na hora.
export type Chave = { t: number; pos: Vec3; alvo: Vec3; corte?: boolean };

export const trajeto = (chaves: Chave[], s: number): { pos: Vec3; alvo: Vec3 } => {
  if (s <= chaves[0].t) return chaves[0];
  for (let i = 0; i < chaves.length - 1; i++) {
    const a = chaves[i];
    const b = chaves[i + 1];
    if (s < b.t) {
      if (b.corte) return a;
      const p = ease((s - a.t) / (b.t - a.t));
      return { pos: lerp3(a.pos, b.pos, p), alvo: lerp3(a.alvo, b.alvo, p) };
    }
  }
  return chaves[chaves.length - 1];
};

// ---------- Personagem em escala real (1,75 m) ----------
export type EstadoPersonagem = {
  pos: Vec3;
  giroY: number;
  fase?: number;
  intensidade?: number;
  bracos?: number;
  espanto?: number;
  ofego?: number;
  boca?: number;
  giroCabeca?: [number, number];
};

export const Gente: React.FC<{ e: EstadoPersonagem; frame: number; visual?: Partial<VisualPersonagem> }> = ({
  e,
  frame,
  visual,
}) => (
  <group position={e.pos} scale={ESCALA_PERSONAGEM}>
    <Personagem
      posicao={[0, 0, 0]}
      giroY={e.giroY}
      fase={e.fase ?? 0}
      intensidade={e.intensidade ?? 0}
      frame={frame}
      boca={e.boca ?? 0}
      sobrancelha={0}
      espanto={e.espanto ?? 0}
      giroCabeca={e.giroCabeca}
      bracos={e.bracos ?? 0}
      ofego={e.ofego ?? 0}
      visual={visual}
    />
  </group>
);

// ---------- Placa de rua azul de São Paulo ----------
const texturaPlaca = (texto: string) => {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 150;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#1f4e9c";
  ctx.fillRect(0, 0, 512, 150);
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 8;
  ctx.strokeRect(10, 10, 492, 130);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 64px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(texto, 256, 78);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
};

export const PlacaRua: React.FC<{ posicao: Vec3; texto?: string }> = ({ posicao, texto = "AV. PAULISTA" }) => {
  const mapa = useMemo(() => texturaPlaca(texto), [texto]);
  return (
    <group position={posicao}>
      <mesh position={[0, 1.4, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.05, 2.8, 8]} />
        <meshStandardMaterial color="#3b3f45" metalness={0.4} roughness={0.5} />
      </mesh>
      {/* Placa dos dois lados (uma face para cada lado, para o texto nunca sair espelhado) */}
      {[Math.PI / 2, -Math.PI / 2].map((giro) => (
        <mesh key={giro} position={[0, 2.65, 0]} rotation={[0, giro, 0]}>
          <planeGeometry args={[1.3, 0.38]} />
          <meshStandardMaterial map={mapa} roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
};

// ---------- Trânsito na pista do outro lado (sentido -z) ----------
const CORES_CARRO = ["#3a86ff", "#ecf0f1", "#2b2d42", "#8d99ae", "#f4a261"];

export const TransitoLonge: React.FC<{ segundos: number; parado?: boolean }> = ({ segundos, parado = false }) => (
  <>
    {CORES_CARRO.map((cor, i) => {
      // Cada carro anda a 9 m/s e reaparece no começo da rua (laço de 140 m)
      const andado = parado ? 0 : segundos * 9;
      const z = 30 - ((i * 28 + andado) % 140);
      // Dois deles são ônibus
      return i === 0 || i === 2 ? (
        <Onibus key={i} x={-7.2} z={z} dir={-1} cor={i === 0 ? "#d62828" : "#2a9d8f"} />
      ) : (
        <Carro key={i} x={-7.2} z={z} dir={-1} cor={cor} />
      );
    })}
  </>
);

// ---------- Pedestres de fundo ----------
const PELES = ["#f1c27d", "#e0ac69", "#c68642", "#8d5524", "#ffdbac"];
const ROUPAS = ["#e74c3c", "#27ae60", "#f39c12", "#8e44ad", "#16a085", "#34495e", "#ecf0f1"];
const CABELOS = ["#2b1b12", "#111111", "#a0522d", "#d9b26f"];
const pegar = <T,>(lista: T[], s: string) => lista[Math.floor(random(s) * lista.length)];

// quique: 0 = passo normal; 1 = passos "de astronauta" com metade da gravidade
export const Multidao: React.FC<{ segundos: number; quique?: number }> = ({ segundos, quique = 0 }) => {
  const pessoas = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => {
        const s = `multidao-${i}`;
        // Metade do outro lado da rua; metade na parte de dentro da calçada da Bia (longe do meio-fio)
        const outroLado = i % 2 === 0;
        return {
          x: outroLado ? -11.3 + random(`${s}-x`) * 1.6 : 2.2 + random(`${s}-x`) * 1.8,
          z0: -70 + random(`${s}-z`) * 75,
          dir: random(`${s}-d`) > 0.5 ? 1 : -1,
          vel: 0.9 + random(`${s}-v`) * 0.5,
          roupa: pegar(ROUPAS, `${s}-r`),
          pele: pegar(PELES, `${s}-p`),
          cabelo: pegar(CABELOS, `${s}-c`),
          escala: 0.82 + random(`${s}-e`) * 0.14,
        };
      }),
    [],
  );
  return (
    <>
      {pessoas.map((p, i) => {
        const d = p.vel * segundos;
        const fase = (d / 1.4) * Math.PI * 2;
        return (
          <group key={i} position={[0, quique * 0.16 * Math.abs(Math.sin(fase)), 0]}>
            <Pedestre
              x={p.x}
              z={p.z0 + p.dir * d}
              dir={p.dir}
              fase={fase}
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

// ---------- Luz e céu do meio-dia (com versão gelada) ----------
// frio: 0 = meio-dia normal; 1 = neblina gelada e sol fraco
export const coresDoCeu = (frio: number) => {
  const mistura = (a: string, b: string) => {
    const ca = new THREE.Color(a);
    ca.lerp(new THREE.Color(b), frio);
    return `#${ca.getHexString()}`;
  };
  return {
    topo: mistura("#3f7fd0", "#9aa9b8"),
    meio: mistura("#8dbbe6", "#cfd8e0"),
    horizonte: mistura("#e3edf3", "#eef2f5"),
  };
};

export const LuzMeioDia: React.FC<{ frio: number; neblina: number; aberto?: boolean }> = ({
  frio,
  neblina,
  aberto = false,
}) => {
  const c = coresDoCeu(frio);
  // Neblina: começa longe (120 m) e fecha até 12 m. "aberto" = visão de drone, bem mais longe
  const perto = aberto ? 120 : 30 - 26 * neblina;
  const longe = aberto ? 380 : 120 - 108 * neblina;
  return (
    <>
      <fog attach="fog" args={[c.horizonte, perto, longe]} />
      <hemisphereLight args={["#dfefff", "#6f6a66", 1.3 - 0.4 * frio]} />
      <ambientLight intensity={0.25 + 0.2 * frio} />
      {/* Sol quase a pino: sombras curtas */}
      <directionalLight
        position={[6, 22, 9]}
        color={frio > 0.5 ? "#e8eef5" : "#fff3dc"}
        intensity={2.6 * (1 - 0.75 * frio)}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
        shadow-camera-far={80}
      />
      <directionalLight position={[-4, 2, 10]} color="#d6e4ff" intensity={0.45} />
    </>
  );
};

// Gelo no chão e nos carros parados (Paulista congelada)
export const Geada: React.FC = () => (
  <>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-5.5, 0.02, -40]}>
      <planeGeometry args={[7, 240]} />
      <meshStandardMaterial color="#f4f8fb" transparent opacity={0.55} roughness={0.3} />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[1.25, CALCADA_Y + 0.01, -40]}>
      <planeGeometry args={[6.5, 240]} />
      <meshStandardMaterial color="#f4f8fb" transparent opacity={0.6} roughness={0.3} />
    </mesh>
  </>
);

// Partículas de gelo caindo devagar (gravidade pela metade: caem ainda mais devagar)
export const CristaisDeGelo: React.FC<{ segundos: number; centro: Vec3; opacidade: number }> = ({
  segundos,
  centro,
  opacidade,
}) => {
  const N = 600;
  const base = useMemo(() => {
    const b = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      b[i * 3] = (random(`gelo-x-${i}`) - 0.5) * 24;
      b[i * 3 + 1] = random(`gelo-y-${i}`) * 10;
      b[i * 3 + 2] = (random(`gelo-z-${i}`) - 0.5) * 24;
    }
    return b;
  }, []);
  const pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    pos[i * 3] = centro[0] + base[i * 3] + Math.sin(segundos * 0.7 + i) * 0.2;
    pos[i * 3 + 1] = centro[1] + (((base[i * 3 + 1] - segundos * 0.6) % 10) + 10) % 10;
    pos[i * 3 + 2] = centro[2] + base[i * 3 + 2];
  }
  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[pos, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#ffffff" size={0.06} transparent opacity={opacidade} depthWrite={false} />
    </points>
  );
};

export const CenarioRua: React.FC<{ frame?: number }> = ({ frame = 0 }) => (
  <>
    <Rua />
    <Ciclovia />
    <Predios vaoEsquerda={MASP_Z} />
    <Masp frame={frame} />
    <Antenas />
    <PlacaRua posicao={[-1.75, CALCADA_Y, -16.2]} />
  </>
);
