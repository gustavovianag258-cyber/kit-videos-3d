import * as THREE from "three";
import { Bloco, type Expressao, type Pose, type Visual } from "../namorada/Bloco";
import type { Vec3 } from "./tempo";

// Elenco do "Imortal": Ícaro (31 anos para sempre), as famílias, os filhos que envelhecem e o alien.
// Todos em bloco (identidade do canal); a emoção vem de luz, câmera e olhos.

export const ICARO: Visual = { pele: "#b9774a", cabelo: "#16100c", camisa: "#f08a24", calca: "#26344f", sapato: "#f2f2f2" };
// na praia: sem camisa, de bermuda azul
export const ICARO_PRAIA: Visual = { ...ICARO, camisa: ICARO.pele, calca: "#1fa4d6", sapato: ICARO.pele };
// depois dos testes: roupa rasgada e suja
export const ICARO_SUJO: Visual = { ...ICARO, camisa: "#b5651d", calca: "#3a3a40" };
// no futuro: macacão prateado
export const ICARO_FUTURO: Visual = { ...ICARO, camisa: "#9aa7b8", calca: "#5c6878", sapato: "#2b2f36" };
// no espaço: a mesma camisa laranja, iluminada pelas estrelas
export const ICARO_ESPACO: Visual = ICARO;

export const ESPOSA1: Visual = { pele: "#e2a878", cabelo: "#3b2214", camisa: "#e8486f", calca: "#3c3a63", sapato: "#ffffff", cabeloLongo: true };
export const ESPOSA2: Visual = { pele: "#8d5524", cabelo: "#111111", camisa: "#2bb38f", calca: "#2f3550", sapato: "#ffffff", cabeloLongo: true };
export const FILHO: Visual = { pele: "#c98b5a", cabelo: "#1a1410", camisa: "#3a86ff", calca: "#28324a", sapato: "#ffffff" };
export const FILHA: Visual = { pele: "#c98b5a", cabelo: "#2a1a10", camisa: "#ffbe0b", calca: "#5b3f8c", sapato: "#ffffff", cabeloLongo: true };
// o filho, velho: cabelo branco, roupa apagada
export const FILHO_VELHO: Visual = { pele: "#b78a6a", cabelo: "#e9e9e9", camisa: "#7d8ca3", calca: "#3d4252", sapato: "#2b2b2b" };
export const ENLUTADO = (i: number): Visual => ({
  pele: ["#c68642", "#e0ac69", "#8d5524", "#f1c27d"][i % 4],
  cabelo: ["#111111", "#e5e5e5", "#2b1b12", "#5a3420"][i % 4],
  camisa: "#15161b",
  calca: "#0f1014",
  sapato: "#0a0a0a",
  cabeloLongo: i % 2 === 1,
});
export const FIGURANTE = (i: number): Visual => ({
  pele: ["#f1c27d", "#c68642", "#e0ac69", "#8d5524", "#ffdbac", "#b9774a"][i % 6],
  cabelo: ["#111111", "#5a3420", "#2b1b12", "#9a9a9a", "#a0522d", "#1a1410"][i % 6],
  camisa: ["#e63946", "#2a9d8f", "#f4a261", "#457b9d", "#ffb703", "#8338ec", "#06d6a0"][i % 7],
  calca: ["#22223b", "#3d405b", "#264653", "#4a4e69"][i % 4],
  sapato: "#f2f2f2",
  cabeloLongo: i % 3 === 1,
});

type PropsGente = { pos?: Vec3; giroY?: number; e?: Expressao; p?: Pose; frame?: number; escala?: number };

export const Icaro: React.FC<PropsGente & { v?: Visual }> = ({ v = ICARO, ...r }) => <Bloco v={v} {...r} />;

const Caixa: React.FC<{ tam: Vec3; pos?: Vec3; rot?: Vec3; cor: string; emissivo?: string; brilho?: number; rug?: number }> = ({
  tam,
  pos = [0, 0, 0],
  rot = [0, 0, 0],
  cor,
  emissivo,
  brilho = 0,
  rug = 0.7,
}) => (
  <mesh position={pos} rotation={rot} castShadow>
    <boxGeometry args={tam} />
    <meshStandardMaterial color={cor} roughness={rug} emissive={emissivo ?? "#000"} emissiveIntensity={brilho} />
  </mesh>
);

// Curativos em X na testa e no braço (o Ícaro depois dos testes); posição relativa ao corpo
export const Curativos: React.FC<{ pos: Vec3; giroY?: number; escala?: number }> = ({ pos, giroY = 0, escala = 1 }) => (
  <group position={pos} rotation={[0, giroY, 0]} scale={escala}>
    <group position={[0.12, 2.07, 0.27]}>
      <Caixa tam={[0.2, 0.05, 0.02]} rot={[0, 0, 0.6]} cor="#f3d9b1" />
      <Caixa tam={[0.2, 0.05, 0.02]} rot={[0, 0, -0.6]} cor="#f3d9b1" />
    </group>
    <Caixa tam={[0.04, 0.12, 0.14]} pos={[-0.33, 1.83, 0.03]} cor="#f3d9b1" />
    {/* olho roxo */}
    <Caixa tam={[0.13, 0.11, 0.01]} pos={[-0.12, 1.92, 0.268]} cor="#5b3a7a" />
  </group>
);

// Chapéu de festa (cone listrado) em cima da cabeça
export const ChapeuFesta: React.FC<{ pos: Vec3; cor?: string; inclina?: number }> = ({ pos, cor = "#ff4fa3", inclina = 0.15 }) => (
  <group position={pos} rotation={[0, 0, inclina]}>
    <mesh position={[0, 0.2, 0]}>
      <coneGeometry args={[0.17, 0.42, 8]} />
      <meshStandardMaterial color={cor} roughness={0.6} />
    </mesh>
    <mesh position={[0, 0.43, 0]}>
      <sphereGeometry args={[0.05, 8, 8]} />
      <meshStandardMaterial color="#ffd23f" emissive="#ffd23f" emissiveIntensity={0.3} />
    </mesh>
  </group>
);

// Braço em primeira pessoa: sai de baixo da câmera e vai até a mão (pos), apontando para "alvo"
export const Braco1aPessoa: React.FC<{ ombro: Vec3; mao: Vec3; manga?: string; pele?: string; fechada?: boolean }> = ({
  ombro,
  mao,
  manga = ICARO.camisa,
  pele = ICARO.pele,
  fechada = false,
}) => {
  const a = new THREE.Vector3(...ombro);
  const b = new THREE.Vector3(...mao);
  const meio = a.clone().add(b).multiplyScalar(0.5);
  const dir = b.clone().sub(a);
  const comp = dir.length();
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  const e = new THREE.Euler().setFromQuaternion(q);
  return (
    <group>
      <mesh position={meio.toArray()} rotation={[e.x, e.y, e.z]}>
        <boxGeometry args={[0.13, comp, 0.14]} />
        <meshStandardMaterial color={manga} roughness={0.8} />
      </mesh>
      <mesh position={b.toArray()} rotation={[e.x, e.y, e.z]}>
        <boxGeometry args={fechada ? [0.14, 0.14, 0.13] : [0.15, 0.17, 0.08]} />
        <meshStandardMaterial color={pele} roughness={0.6} />
      </mesh>
      {/* polegar */}
      {!fechada && (
        <mesh position={b.clone().add(new THREE.Vector3(0.08 * Math.sign(b.x - a.x || 1), 0.02, 0.02)).toArray()} rotation={[e.x, e.y, e.z + 0.5]}>
          <boxGeometry args={[0.05, 0.09, 0.05]} />
          <meshStandardMaterial color={pele} roughness={0.6} />
        </mesh>
      )}
    </group>
  );
};

// Bebê enrolado na manta
export const Bebe: React.FC<{ pos: Vec3; rot?: Vec3; frame: number }> = ({ pos, rot = [0, 0, 0], frame }) => {
  const resp = 1 + Math.sin(frame * 0.18) * 0.02;
  return (
    <group position={pos} rotation={rot}>
      <mesh scale={[1, resp, 1]}>
        <boxGeometry args={[0.32, 0.22, 0.5]} />
        <meshStandardMaterial color="#9fd3ff" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.08, -0.27]}>
        <boxGeometry args={[0.22, 0.22, 0.2]} />
        <meshStandardMaterial color="#d79a6c" roughness={0.6} />
      </mesh>
      {/* olhinhos fechados e sorriso */}
      {[-1, 1].map((l) => (
        <mesh key={l} position={[l * 0.05, 0.13, -0.37]}>
          <boxGeometry args={[0.05, 0.012, 0.01]} />
          <meshBasicMaterial color="#3a2010" />
        </mesh>
      ))}
      <mesh position={[0, 0.05, -0.37]}>
        <boxGeometry args={[0.05, 0.015, 0.01]} />
        <meshBasicMaterial color="#8a2a1a" />
      </mesh>
    </group>
  );
};

// Alien: cabeça larga verde, olhos pretos enormes, antenas com bolinhas acesas
export const Alien: React.FC<{ pos?: Vec3; giroY?: number; frame: number; confuso?: number; mira?: number; escala?: number }> = ({
  pos = [0, 0, 0],
  giroY = 0,
  frame,
  confuso = 0,
  mira = 0,
  escala = 1,
}) => {
  const balanca = Math.sin(frame * 0.12) * 0.04;
  const pisca = frame % 70 > 66 ? 0.15 : 1;
  const verde = "#5fd35a";
  return (
    <group position={pos} rotation={[0, giroY, 0]} scale={escala}>
      {/* pernas finas */}
      {[-1, 1].map((l) => (
        <Caixa key={l} tam={[0.16, 0.75, 0.18]} pos={[l * 0.13, 0.38, 0]} cor="#3c9c3a" />
      ))}
      {/* corpo com macacão roxo */}
      <Caixa tam={[0.56, 0.62, 0.34]} pos={[0, 1.05, 0]} cor="#5b2a86" />
      <Caixa tam={[0.2, 0.2, 0.02]} pos={[0, 1.12, 0.18]} cor="#7CFF6B" emissivo="#7CFF6B" brilho={0.8} />
      {/* braços: o direito segura a arma de raio */}
      <Caixa tam={[0.14, 0.55, 0.15]} pos={[-0.36, 1.0, 0]} rot={[0, 0, 0.12]} cor={verde} />
      <group position={[0.36, 1.3, 0]} rotation={[-1.25 * mira - 0.1, 0, -0.1]}>
        <Caixa tam={[0.14, 0.55, 0.15]} pos={[0, -0.26, 0]} cor={verde} />
        <group position={[0, -0.58, 0.05]}>
          <Caixa tam={[0.12, 0.14, 0.34]} pos={[0, 0, 0.12]} cor="#c9d1d9" rug={0.3} />
          <Caixa tam={[0.06, 0.06, 0.1]} pos={[0, 0, 0.33]} cor="#7CFF6B" emissivo="#7CFF6B" brilho={1.2} />
        </group>
      </group>
      {/* cabeça grande e inclinada quando ele fica confuso */}
      <group position={[0, 1.72 + balanca, 0]} rotation={[0, 0, confuso * 0.25]}>
        <Caixa tam={[0.82, 0.62, 0.6]} cor={verde} rug={0.5} />
        {[-1, 1].map((l) => (
          <group key={l}>
            <mesh position={[l * 0.2, 0.04, 0.305]} rotation={[0, 0, l * -0.35]} scale={[1, pisca, 1]}>
              <boxGeometry args={[0.26, 0.17, 0.02]} />
              <meshStandardMaterial color="#050505" roughness={0.15} metalness={0.4} />
            </mesh>
            <mesh position={[l * 0.23, 0.08, 0.318]}>
              <boxGeometry args={[0.05, 0.04, 0.01]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            {/* antenas */}
            <Caixa tam={[0.04, 0.36, 0.04]} pos={[l * 0.24, 0.48, 0]} rot={[0, 0, l * -0.3]} cor="#3c9c3a" />
            <mesh position={[l * 0.3, 0.68, 0]}>
              <sphereGeometry args={[0.06, 10, 10]} />
              <meshStandardMaterial color="#ffe066" emissive="#ffe066" emissiveIntensity={1.4} />
            </mesh>
          </group>
        ))}
        {/* boca pequena: um "o" quando ele não entende */}
        <Caixa tam={[0.1 - confuso * 0.04, 0.03 + confuso * 0.06, 0.02]} pos={[0, -0.17, 0.305]} cor="#1b3a1a" />
      </group>
    </group>
  );
};
