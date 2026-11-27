import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CALCADA_Y } from "../Cidade";
import { ESCALA_PERSONAGEM, Personagem } from "../Personagem";
import { aberturaBoca, CENAS, clamp, ease, lerp, type Vec3 } from "../roteiro";
import { CameraControlada, CeuCidade, Cidade3D, LuzesCidade } from "./comum";

// Cena 1 (0 s até o corte): "E se a Terra fosse plana?"
// A câmera desce do alto até a altura dos olhos do personagem.

export const DESCIDA = CENAS.disco - CENAS.gancho; // frames de descida = cena inteira

const ALTURA_OLHOS = CALCADA_Y + 1.55;

// Posição da câmera em cada frame. O contador usa ESTA mesma função.
export const posicaoCameraGancho = (f: number): Vec3 => {
  const p = interpolate(f, [0, DESCIDA], [0, 1], { ...clamp, easing: ease });
  return [lerp(6, 0.5, p), lerp(45, ALTURA_OLHOS, p), lerp(70, 3, p)];
};

// Distância percorrida = soma dos trechos retos entre as posições de cada frame
export const distanciaCameraGancho = (f: number) => {
  let total = 0;
  for (let i = 0; i < Math.min(f, DESCIDA); i++) {
    const a = posicaoCameraGancho(i);
    const b = posicaoCameraGancho(i + 1);
    total += Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
  }
  return total;
};

const Contador: React.FC<{ metros: number }> = ({ metros }) => (
  <div
    style={{
      position: "absolute",
      top: 170,
      left: 0,
      right: 0,
      textAlign: "center",
      color: "white",
      fontFamily: "Arial Black, Arial, sans-serif",
      textShadow: "0 4px 18px rgba(0,0,0,0.7)",
    }}
  >
    <div style={{ fontSize: 38, fontWeight: 900, letterSpacing: 4, opacity: 0.9 }}>
      DESCIDA DA CÂMERA
    </div>
    <div
      style={{
        fontSize: 150,
        fontWeight: 900,
        lineHeight: 1,
        fontVariantNumeric: "tabular-nums",
        WebkitTextStroke: "6px rgba(0,0,0,0.55)",
        paintOrder: "stroke fill",
      }}
    >
      {metros.toFixed(1).replace(".", ",")} m
    </div>
  </div>
);

export const Gancho: React.FC = () => {
  const f = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const global = CENAS.gancho + f;

  // O céu começa a mudar enquanto ele faz a pergunta
  const mistura = interpolate(f, [12, 54], [0, 1], { ...clamp, easing: ease });
  const p = interpolate(f, [0, DESCIDA], [0, 1], { ...clamp, easing: ease });
  const alvo: Vec3 = [0, lerp(0.5, CALCADA_Y + 1.4, p), 0];

  return (
    <AbsoluteFill>
      <CeuCidade mistura={mistura} />
      <ThreeCanvas
        width={width}
        height={height}
        shadows
        camera={{ fov: 50, near: 0.1, far: 400 }}
      >
        <CameraControlada posicao={posicaoCameraGancho(f)} alvo={alvo} />
        <LuzesCidade mistura={mistura} />
        <Cidade3D tempo={global / fps} />
        <group position={[0, CALCADA_Y, 0]} rotation={[0, 0.17, 0]} scale={ESCALA_PERSONAGEM}>
          <Personagem
            posicao={[0, 0, 0]}
            giroY={0}
            fase={0}
            intensidade={0}
            frame={global}
            boca={aberturaBoca(global)}
            sobrancelha={interpolate(f, [10, 20], [0, 1], clamp)}
          />
        </group>
      </ThreeCanvas>
      <Contador metros={distanciaCameraGancho(f)} />
    </AbsoluteFill>
  );
};
