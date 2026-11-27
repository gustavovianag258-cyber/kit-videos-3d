import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";
import { interpolate, useVideoConfig } from "remotion";
import { Camera } from "../v2/mundo";
import { clamp, type Vec3 } from "./tempo";

// O que cada plano recebe: segundos desde o corte (t), duração do plano e o quadro global
export type PropsPlano = { t: number; dur: number; frame: number; s: number };

export const suave = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
export const lerp = (a: number, b: number, x: number) => a + (b - a) * x;
export const lerp3 = (a: Vec3, b: Vec3, x: number): Vec3 => [lerp(a[0], b[0], x), lerp(a[1], b[1], x), lerp(a[2], b[2], x)];
export const entre = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], clamp);

// Tremor de câmera: soma de senos (determinístico, igual em todo render)
export const tremor = (s: number, forca: number): Vec3 => [
  (Math.sin(s * 37.1) + Math.sin(s * 23.7 + 1.3) * 0.6) * forca,
  (Math.sin(s * 41.3 + 0.7) + Math.sin(s * 19.1 + 2.1) * 0.6) * forca,
  (Math.sin(s * 29.9 + 2.9) * 0.6) * forca,
];

// Câmera que sempre se move um pouco (zoom lento / órbita leve) entre duas posições
export const CameraLenta: React.FC<{
  de: Vec3;
  para: Vec3;
  alvo: Vec3;
  alvoFim?: Vec3;
  x: number;
  fov?: number;
  treme?: number;
  s?: number;
  rolo?: number;
}> = ({ de, para, alvo, alvoFim, x, fov, treme = 0, s = 0, rolo = 0 }) => {
  const k = suave(x) * 0.65 + x * 0.35;
  const p = lerp3(de, para, k);
  const [tx, ty, tr] = tremor(s, treme);
  return (
    <Camera
      posicao={[p[0] + tx, p[1] + ty, p[2]]}
      alvo={alvoFim ? lerp3(alvo, alvoFim, k) : alvo}
      fov={fov}
      rolo={rolo + tr * 0.25}
    />
  );
};

export const Palco: React.FC<{ children: React.ReactNode; fundo?: string; sombras?: boolean; fov?: number; far?: number }> = ({
  children,
  fundo = "#000000",
  sombras = false,
  fov = 40,
  far = 400,
}) => {
  const { width, height } = useVideoConfig();
  return (
    <ThreeCanvas
      width={width}
      height={height}
      shadows={sombras}
      camera={{ fov, near: 0.05, far }}
      gl={{ toneMapping: THREE.ACESFilmicToneMapping }}
      style={{ background: fundo }}
    >
      <color attach="background" args={[fundo]} />
      {children}
    </ThreeCanvas>
  );
};

// Textura feita num canvas 2D (redesenhada quando "chave" muda)
export const texturaCanvas = (l: number, a: number, desenho: (ctx: CanvasRenderingContext2D) => void, repetir?: [number, number]) => {
  const c = document.createElement("canvas");
  c.width = l;
  c.height = a;
  desenho(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  if (repetir) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(...repetir);
  }
  return t;
};
