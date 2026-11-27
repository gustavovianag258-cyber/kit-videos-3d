import { ThreeCanvas } from "@remotion/three";
import { useVideoConfig } from "remotion";
import * as THREE from "three";
import { entre, lerp, type PoseMao, type PoseMaos } from "./pecas";
import type { V3 } from "./tempo";

// MÃOS EM PRIMEIRA PESSOA numa camada própria por cima da cena (como no original, elas nunca
// ficam atrás de nada — atravessam paredes). Duas passadas: um halo azul borrado de verdade
// (CSS blur) e, por cima, as mãos nítidas.

export const POSE_BASE: PoseMaos = {
  e: { x: -0.135, y: -0.175, z: -0.46, rz: 0.12 },
  d: { x: 0.135, y: -0.175, z: -0.46, rz: -0.12 },
};
const mistura = (a: PoseMaos, b: PoseMaos, k: number): PoseMaos => {
  const m = (p: PoseMao, q: PoseMao): PoseMao => ({
    x: lerp(p.x, q.x, k),
    y: lerp(p.y, q.y, k),
    z: lerp(p.z, q.z, k),
    rx: lerp(p.rx ?? 0, q.rx ?? 0, k),
    ry: lerp(p.ry ?? 0, q.ry ?? 0, k),
    rz: lerp(p.rz ?? 0, q.rz ?? 0, k),
    dobra: lerp(p.dobra ?? 0, q.dobra ?? 0, k),
  });
  return { e: m(a.e, b.e), d: m(a.d, b.d) };
};
// as duas mãos vão para a frente (empurrar a porta do cofre / a janela do Salão Oval)
const FRENTE: PoseMaos = {
  e: { x: -0.11, y: -0.11, z: -0.6, rz: 0.08 },
  d: { x: 0.11, y: -0.11, z: -0.6, rz: -0.08 },
};
// só a direita vai até a parede
const PAREDE: PoseMaos = {
  e: { x: -0.16, y: -0.27, z: -0.44, rz: 0.15 },
  d: { x: 0.02, y: -0.06, z: -0.58, rz: -0.05 },
};
const ACORDADO: PoseMaos = {
  e: { x: -0.15, y: -0.205, z: -0.42, rx: -1.1, rz: 0.25 },
  d: { x: 0.15, y: -0.205, z: -0.42, rx: -1.1, rz: -0.25 },
};

export const maosEm = (s: number): { pose: PoseMaos; modo: "fantasma" | "normal"; vis: number } => {
  if (s >= 67.07) return { pose: ACORDADO, modo: "normal", vis: 1 };
  if (s < 3.45) {
    const k = entre(s, 0.2, 2.6);
    const sobe = (p: PoseMao): PoseMao => ({ ...p, y: lerp(-0.34, -0.2, k), z: lerp(-0.42, -0.47, k), rx: lerp(-0.9, 0, k) });
    return { pose: { e: sobe(POSE_BASE.e), d: sobe(POSE_BASE.d) }, modo: "fantasma", vis: 1 };
  }
  if (s >= 6.6 && s < 10.7) return { pose: mistura(POSE_BASE, PAREDE, entre(s, 7.3, 8.5)), modo: "fantasma", vis: 1 };
  if (s >= 30.9 && s < 32.6) return { pose: mistura(POSE_BASE, FRENTE, entre(s, 30.9, 31.5) * (1 - entre(s, 32.2, 32.6))), modo: "fantasma", vis: 1 };
  if (s >= 44.4 && s < 45.8) return { pose: mistura(POSE_BASE, FRENTE, entre(s, 44.4, 44.95) * (1 - entre(s, 45.3, 45.8))), modo: "fantasma", vis: 1 };
  return { pose: POSE_BASE, modo: "fantasma", vis: 1 };
};

const Bloco: React.FC<{ t: V3; p?: V3; r?: V3; cor: string; brilho: boolean; emis?: string; ei?: number }> = ({ t, p = [0, 0, 0], r = [0, 0, 0], cor, brilho, emis = "#000", ei = 0 }) => (
  <mesh position={p} rotation={r}>
    <boxGeometry args={t} />
    {brilho ? <meshBasicMaterial color={cor} /> : <meshStandardMaterial color={cor} emissive={emis} emissiveIntensity={ei} roughness={0.6} />}
  </mesh>
);

const Mao: React.FC<{ lado: -1 | 1; pose: PoseMao; modo: "fantasma" | "normal"; brilho: boolean; s: number }> = ({ lado, pose, modo, brilho, s }) => {
  const fantasma = modo === "fantasma";
  const pele = brilho ? "#3d74ff" : fantasma ? "#eaf1ff" : "#a8714a";
  const manga = brilho ? "#3d74ff" : fantasma ? "#e6eeff" : "#2d4f9c";
  const emis = fantasma ? "#b7d0ff" : "#000";
  const ei = fantasma ? 0.55 : 0;
  const W = new THREE.Vector3(pose.x, pose.y, pose.z);
  const E = new THREE.Vector3(lado * 0.32, -0.56, -0.1);
  const meio = W.clone().add(E).multiplyScalar(0.5);
  const comp = W.distanceTo(E) + 0.06;
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), E.clone().sub(W).normalize());
  const resp = Math.sin(s * 1.4 + lado) * 0.004;
  const dedos = [-0.031, -0.0105, 0.0105, 0.031];
  const g = brilho ? 1.18 : 1; // o halo é um pouco maior que a mão
  return (
    <group>
      <group position={meio.toArray()} quaternion={q}>
        <Bloco t={[0.05 * g, 0.05 * g, comp]} cor={manga} brilho={brilho} emis={emis} ei={ei} />
      </group>
      <group position={[pose.x, pose.y + resp, pose.z]} rotation={[pose.rx ?? 0, pose.ry ?? 0, pose.rz ?? 0]} scale={0.74 * g}>
        <Bloco t={[0.088, 0.092, 0.03]} cor={pele} brilho={brilho} emis={emis} ei={ei} />
        {dedos.map((x, i) => (
          <Bloco key={i} t={[0.018, i === 0 || i === 3 ? 0.045 : 0.054, 0.024]} p={[x, 0.046 + (i === 0 || i === 3 ? 0.022 : 0.027), 0]} cor={pele} brilho={brilho} emis={emis} ei={ei} />
        ))}
        <Bloco t={[0.022, 0.048, 0.024]} p={[-lado * 0.056, 0.004, 0.006]} r={[0, 0, lado * 0.7]} cor={pele} brilho={brilho} emis={emis} ei={ei} />
      </group>
    </group>
  );
};

const Cena: React.FC<{ s: number; brilho: boolean }> = ({ s, brilho }) => {
  const { pose, modo } = maosEm(s);
  return (
    <>
      <ambientLight intensity={modo === "normal" ? 0.55 : 0.9} color={modo === "normal" ? "#b9c6ff" : "#ffffff"} />
      <directionalLight position={[0.3, 1, 0.6]} intensity={modo === "normal" ? 1.1 : 1.4} color={modo === "normal" ? "#ffd2a8" : "#ffffff"} />
      <directionalLight position={[-0.5, 0.2, -1]} intensity={0.5} color="#8fb0ff" />
      <Mao lado={-1} pose={pose.e} modo={modo} brilho={brilho} s={s} />
      <Mao lado={1} pose={pose.d} modo={modo} brilho={brilho} s={s} />
    </>
  );
};

export const CamadaMaos: React.FC<{ s: number; escurecer?: number }> = ({ s, escurecer = 0 }) => {
  const { width, height } = useVideoConfig();
  const { modo, vis } = maosEm(s);
  if (vis <= 0) return null;
  const fantasma = modo === "fantasma";
  return (
    <>
      {fantasma && (
        <div style={{ position: "absolute", inset: 0, filter: "blur(20px) brightness(1.35)", opacity: 1 * vis, mixBlendMode: "screen" }}>
          <ThreeCanvas width={width} height={height} camera={{ fov: 70, near: 0.01, far: 10, position: [0, 0, 0] }} gl={{ alpha: true }} style={{ background: "transparent" }}>
            <Cena s={s} brilho />
          </ThreeCanvas>
        </div>
      )}
      <div style={{ position: "absolute", inset: 0, opacity: vis, filter: escurecer ? `brightness(${1 - escurecer})` : undefined }}>
        <ThreeCanvas width={width} height={height} camera={{ fov: 70, near: 0.01, far: 10, position: [0, 0, 0] }} gl={{ alpha: true, toneMapping: THREE.ACESFilmicToneMapping }} style={{ background: "transparent" }}>
          <Cena s={s} brilho={false} />
        </ThreeCanvas>
      </div>
    </>
  );
};
