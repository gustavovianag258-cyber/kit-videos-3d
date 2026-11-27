import { useLayoutEffect } from "react";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CALCADA_Y, Carros, Pedestres, Predios, Rua } from "./Cidade";
import { Personagem } from "./Personagem";

export const DURACAO_CENA_CIDADE = 210;

const COR_NEVOA = "#f0b48f";
const ease = Easing.inOut(Easing.cubic);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// ---------- Roteiro da cena (em frames) ----------
// 0–90: câmera desce | 20–140: ele anda e para | 120–150: vira para a câmera
// 135–195: câmera se aproxima | 150–198: ele fala a pergunta
const VELOCIDADE = 1.2; // unidades por segundo
const PASSADA = 1.8; // distância de um ciclo completo (dois passos)
const Z_INICIAL = -3;
const INICIO_FALA = 150;
const PALAVRAS = ["E", "se", "a", "Terra", "fosse", "plana?"];
const FRAMES_POR_PALAVRA = 7;
const FIM_FALA = INICIO_FALA + PALAVRAS.length * FRAMES_POR_PALAVRA + 6;

// Quanto da velocidade total ele está usando: acelera, anda, desacelera até parar
const fatorVelocidade = (f: number) =>
  interpolate(f, [20, 50, 110, 140], [0, 1, 1, 0], {
    ...clamp,
    easing: Easing.inOut(Easing.sin),
  });

const caminhada = (frame: number, fps: number) => {
  // Soma quadro a quadro: a posição é sempre a mesma para o mesmo frame
  let distancia = 0;
  for (let i = 0; i < frame; i++) distancia += (fatorVelocidade(i) * VELOCIDADE) / fps;
  return {
    z: Z_INICIAL + distancia,
    intensidade: fatorVelocidade(frame),
    // Fase das pernas amarrada à distância, para os pés não "patinarem"
    fase: (distancia / PASSADA) * Math.PI * 2,
  };
};

const CameraSeguindo: React.FC<{
  posicao: [number, number, number];
  alvo: [number, number, number];
}> = ({ posicao, alvo }) => {
  const camera = useThree((s) => s.camera);
  useLayoutEffect(() => {
    camera.position.set(...posicao);
    camera.lookAt(...alvo);
    camera.updateProjectionMatrix();
  }, [camera, posicao, alvo]);
  return null;
};

const BalaoDeFala: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const entrada = spring({ frame: frame - (INICIO_FALA - 4), fps, config: { damping: 12 } });
  if (entrada <= 0.001) return null;
  return (
    <div
      style={{
        position: "absolute",
        top: 170,
        left: 90,
        right: 90,
        transform: `scale(${entrada})`,
        transformOrigin: "30% 100%",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: 48,
          padding: "36px 44px",
          textAlign: "center",
          fontFamily: "Arial, sans-serif",
          fontWeight: 900,
          fontSize: 76,
          lineHeight: 1.1,
          color: "#1d1d1f",
          boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
        }}
      >
        {PALAVRAS.map((p, i) => {
          const inicio = INICIO_FALA + i * FRAMES_POR_PALAVRA;
          const opacidade = interpolate(frame, [inicio, inicio + 4], [0, 1], clamp);
          return (
            <span key={i} style={{ opacity: opacidade }}>
              {p}{" "}
            </span>
          );
        })}
      </div>
      {/* Rabinho do balão apontando para o personagem */}
      <div
        style={{
          width: 0,
          height: 0,
          marginLeft: 260,
          borderLeft: "34px solid transparent",
          borderRight: "34px solid transparent",
          borderTop: "54px solid white",
        }}
      />
    </div>
  );
};

export const CenaCidade: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const tempo = frame / fps;

  const { z, intensidade, fase } = caminhada(frame, fps);

  // Ele para e vira o corpo para a câmera antes de falar
  const giroY = interpolate(frame, [120, 150], [0, 0.65], { ...clamp, easing: ease });

  // Boca abre e fecha só enquanto fala
  const envelopeFala = interpolate(
    frame,
    [INICIO_FALA - 2, INICIO_FALA + 2, FIM_FALA - 6, FIM_FALA],
    [0, 1, 1, 0],
    clamp,
  );
  const boca = envelopeFala * (0.3 + 0.7 * Math.abs(Math.sin((frame - INICIO_FALA) * 0.6)));
  const sobrancelha = interpolate(frame, [140, 150, FIM_FALA, FIM_FALA + 10], [0, 1, 1, 0], {
    ...clamp,
    easing: ease,
  });

  // Descida da câmera: 3 segundos, com easing que começa e termina devagar
  const p = interpolate(frame, [0, 3 * fps], [0, 1], { ...clamp, easing: ease });
  // Aproximação final para o close enquanto ele fala
  const aproximacao = interpolate(frame, [135, 195], [0, 1], { ...clamp, easing: ease });
  const k = 1 - 0.28 * aproximacao;

  const posicaoCamera: [number, number, number] = [
    interpolate(p, [0, 1], [1.5, 2.6]) * k,
    CALCADA_Y + interpolate(p, [0, 1], [12, 0.5]) + aproximacao * 0.6,
    z + interpolate(p, [0, 1], [16, 3.4]) * k,
  ];
  const alvo: [number, number, number] = [
    0,
    CALCADA_Y + interpolate(p, [0, 1], [0.9, 1.2]) + aproximacao * 0.4,
    z,
  ];

  return (
    <AbsoluteFill>
      {/* Céu de fim de tarde */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, #3b5ba5 0%, #8a7fc0 35%, #f2a37e 72%, ${COR_NEVOA} 100%)`,
        }}
      />
      <ThreeCanvas width={width} height={height} shadows camera={{ fov: 50, near: 0.1, far: 300 }}>
        <CameraSeguindo posicao={posicaoCamera} alvo={alvo} />
        <fog attach="fog" args={[COR_NEVOA, 35, 120]} />

        <hemisphereLight args={["#ffd9b8", "#6a6070", 1.4]} />
        <ambientLight intensity={0.25} />
        {/* Sol baixo e quente, criando sombras compridas */}
        <directionalLight
          position={[14, 9, 12]}
          color="#ffc58a"
          intensity={2.6}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0004}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20}
          shadow-camera-far={60}
        />
        {/* Luz de preenchimento vinda da câmera, para o rosto não ficar escuro */}
        <directionalLight position={[3, 1.5, 10]} color="#cfd8ff" intensity={0.5} />

        <Rua />
        <Predios />
        <Carros tempo={tempo} />
        <Pedestres tempo={tempo} />
        <Personagem
          posicao={[0, CALCADA_Y, z]}
          giroY={giroY}
          fase={fase}
          intensidade={intensidade}
          frame={frame}
          boca={boca}
          sobrancelha={sobrancelha}
        />
      </ThreeCanvas>
      <BalaoDeFala frame={frame} fps={fps} />
    </AbsoluteFill>
  );
};
