import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { ExteriorEstacao } from "../Estacao";
import { Camera, CENTRO_DISCO, DIRECAO_SOL, Estrelas, POSICAO_SOL } from "../mundo";
import { PlanetaDisco } from "../PlanetaDisco";
import { LuzDeBaixo, LuzSolarNoDisco, SolVisivel } from "../Sol";
import { CENAS, clamp, ease, lerp, lerp3, type Vec3 } from "../tempo";

// CENA 2 — A TERRA VISTA DO ESPAÇO
// A câmera se afasta da estação e faz meia órbita em volta do disco:
// primeiro de cima, depois de lado, mostrando espessura e borda.

// Posição em coordenadas esféricas em volta do centro do disco
const orbita = (r: number, elevacao: number, azimute: number): Vec3 => [
  CENTRO_DISCO[0] + r * Math.cos(elevacao) * Math.sin(azimute),
  CENTRO_DISCO[1] + r * Math.sin(elevacao),
  CENTRO_DISCO[2] + r * Math.cos(elevacao) * Math.cos(azimute),
];
const graus = (g: number) => (g * Math.PI) / 180;

export const C2Espaco: React.FC = () => {
  const f = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const t = f / fps; // segundos dentro da cena
  const duracao = CENAS.espaco.fim - CENAS.espaco.inicio;

  // Trecho A: atrás e acima da estação (ela aparece contra o planeta), recuando
  const a = interpolate(t, [0, 2.2], [0, 1], { ...clamp, easing: ease });
  // Trecho B: meia órbita (de cima para o lado)
  const b = interpolate(t, [0.6, duracao], [0, 1], { ...clamp, easing: ease });
  const r = interpolate(b, [0, 0.45, 1], [96000, 90000, 86000]);
  const elev = interpolate(b, [0, 0.45, 1], [graus(24), graus(52), graus(9)]);
  const az = interpolate(b, [0, 1], [graus(4), graus(-72)]);
  const pontoOrbita = orbita(r, elev, az);

  // Começa atrás e acima da estação (ela aparece na frente do planeta) e recua
  const pertoDaEstacao: Vec3 = lerp3([4, 6, 34], [20, 30, 140], a);
  const mistura = interpolate(t, [1.3, 3.2], [0, 1], { ...clamp, easing: ease });
  const posicao = lerp3(pertoDaEstacao, pontoOrbita, mistura);

  // Olha para o disco (abaixo do centro, para o planeta ficar acima das legendas
  // e para incluir a rocha de baixo quando a câmera está de lado)
  const alvo: Vec3 = [CENTRO_DISCO[0], CENTRO_DISCO[1] - lerp(9000, 6000, b), CENTRO_DISCO[2]];

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <ThreeCanvas
        width={width}
        height={height}
        gl={{ logarithmicDepthBuffer: true }}
        camera={{ fov: 50, near: 0.5, far: 3e6 }}
      >
        <Camera posicao={posicao} alvo={alvo} />
        <hemisphereLight args={["#3a4a70", "#05060a", 0.12]} />
        {/* Luz do Sol na estação: alcance curto, para não clarear o planeta inteiro */}
        <pointLight position={[-40, 18, 25]} color="#fff1dc" intensity={2.4} decay={0} distance={160} />
        <Estrelas raio={1.5e6} />
        <SolVisivel posicao={POSICAO_SOL} raio={9000} />
        <ExteriorEstacao />
        <group position={CENTRO_DISCO}>
          <PlanetaDisco giroNuvens={(CENAS.espaco.inicio + t) * 0.004} />
        </group>
        <LuzSolarNoDisco centroDisco={CENTRO_DISCO} direcaoSol={DIRECAO_SOL} />
        <LuzDeBaixo />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
