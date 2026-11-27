import { useMemo } from "react";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CALCADA_Y, Carro } from "../Cidade";
import { ESCALA_PERSONAGEM, Personagem } from "../Personagem";
import { aberturaBoca, CENAS, clamp, ease, lerp, type Vec3 } from "../roteiro";
import { CameraControlada, CeuCidade, Cidade3D, LuzesCidade } from "./comum";

// Cena 4: "E se a gravidade nem funcionasse como conhecemos?"
// Objetos começam a flutuar; a câmera acompanha a bola subindo.

const DURACAO = CENAS.final - CENAS.gravidade;
const subindo = Easing.inOut(Easing.quad);

type Objeto = {
  tipo: "bola" | "lata" | "livro" | "pedra" | "cone" | "garrafa";
  pos: Vec3; // posição inicial (no chão)
  subida: number; // quantos metros sobe até o fim da cena
  atraso: number; // frames até começar a flutuar
  giro: Vec3; // velocidade de rotação
};

const OBJETOS: Objeto[] = [
  { tipo: "bola", pos: [0.55, 0.11, 0.9], subida: 3.4, atraso: 4, giro: [0.04, 0.06, 0.02] },
  { tipo: "lata", pos: [-0.7, 0.06, 0.6], subida: 3.2, atraso: 0, giro: [0.07, 0.02, 0.05] },
  { tipo: "livro", pos: [0.95, 0.03, -0.4], subida: 2.6, atraso: 8, giro: [0.03, 0.05, 0.04] },
  { tipo: "pedra", pos: [-0.45, 0.08, -0.9], subida: 2.1, atraso: 12, giro: [0.05, 0.03, 0.06] },
  { tipo: "pedra", pos: [1.5, 0.06, 0.4], subida: 3.6, atraso: 6, giro: [0.02, 0.07, 0.03] },
  { tipo: "cone", pos: [-1.3, 0.25, 1.3], subida: 2.4, atraso: 14, giro: [0.03, 0.02, 0.05] },
  { tipo: "garrafa", pos: [0.2, 0.12, 1.9], subida: 4.2, atraso: 2, giro: [0.06, 0.03, 0.02] },
  { tipo: "pedra", pos: [-1.1, 0.05, -0.2], subida: 1.6, atraso: 18, giro: [0.04, 0.04, 0.04] },
];

const posicaoObjeto = (o: Objeto, i: number, t: number): Vec3 => {
  const p = subindo(Math.min(1, Math.max(0, (t - o.atraso) / (DURACAO - o.atraso))));
  const balanco = p > 0 ? 0.06 * Math.sin(t * 0.18 + i) : 0;
  return [o.pos[0] + balanco, CALCADA_Y + o.pos[1] + o.subida * p, o.pos[2] + balanco * 0.5];
};

const texturaBola = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#f5f5f5";
  ctx.fillRect(0, 0, 256, 128);
  ctx.fillStyle = "#1a1a1a";
  for (const [x, y] of [[32, 30], [96, 90], [160, 30], [224, 90], [0, 90], [256, 30]]) {
    ctx.beginPath();
    ctx.arc(x, y, 17, 0, Math.PI * 2);
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
};

const Forma: React.FC<{ tipo: Objeto["tipo"]; bola: THREE.Texture }> = ({ tipo, bola }) => {
  switch (tipo) {
    case "bola":
      return (
        <mesh castShadow>
          <sphereGeometry args={[0.11, 32, 32]} />
          <meshStandardMaterial map={bola} roughness={0.5} />
        </mesh>
      );
    case "lata":
      return (
        <mesh castShadow>
          <cylinderGeometry args={[0.033, 0.033, 0.12, 20]} />
          <meshStandardMaterial color="#d62828" metalness={0.6} roughness={0.3} />
        </mesh>
      );
    case "livro":
      return (
        <mesh castShadow>
          <boxGeometry args={[0.22, 0.05, 0.3]} />
          <meshStandardMaterial color="#1d4e89" roughness={0.7} />
        </mesh>
      );
    case "pedra":
      return (
        <mesh castShadow>
          <dodecahedronGeometry args={[0.09, 0]} />
          <meshStandardMaterial color="#8a8580" roughness={1} flatShading />
        </mesh>
      );
    case "cone":
      return (
        <mesh castShadow>
          <coneGeometry args={[0.16, 0.5, 20]} />
          <meshStandardMaterial color="#ff7b00" roughness={0.6} />
        </mesh>
      );
    case "garrafa":
      return (
        <mesh castShadow>
          <cylinderGeometry args={[0.035, 0.04, 0.24, 16]} />
          <meshStandardMaterial color="#2a9d8f" transparent opacity={0.8} roughness={0.1} />
        </mesh>
      );
  }
};

export const Gravidade: React.FC = () => {
  const t = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const global = CENAS.gravidade + t;
  const bola = useMemo(texturaBola, []);

  const posBola = posicaoObjeto(OBJETOS[0], 0, t);
  const cabeca: Vec3 = [0, CALCADA_Y + 1.5, 0];
  // A câmera acompanha a bola subindo (inclina e se afasta), mas mira perto da cabeça:
  // assim o rosto fica acima da legenda e a bola continua no quadro
  const seguir = interpolate(t, [6, DURACAO - 10], [0, 1], { ...clamp, easing: ease });
  const subidaBola = posBola[1] - OBJETOS[0].pos[1] - CALCADA_Y;
  const posicao: Vec3 = [lerp(1.4, 2.4, seguir), lerp(CALCADA_Y + 1.5, 2.2, seguir), lerp(3.2, 7.2, seguir)];
  const alvo: Vec3 = [
    lerp(cabeca[0], posBola[0] * 0.5, seguir),
    cabeca[1] - 0.3 * seguir + subidaBola * 0.12,
    lerp(cabeca[2], posBola[2] * 0.4, seguir),
  ];

  const espanto = interpolate(t, [0, 10], [0.4, 1], clamp);
  const olharCima = interpolate(t, [4, 40], [0, -0.55], { ...clamp, easing: ease });
  const carroSobe = 3 * subindo(Math.min(1, t / DURACAO));

  return (
    <AbsoluteFill>
      <CeuCidade mistura={1} />
      <ThreeCanvas width={width} height={height} shadows camera={{ fov: 50, near: 0.05, far: 400 }}>
        <CameraControlada posicao={posicao} alvo={alvo} />
        <LuzesCidade mistura={1} />
        <Cidade3D tempo={global / fps} />
        {/* Até um carro estacionado sai do chão */}
        <group position={[0, carroSobe, 0]} rotation={[carroSobe * 0.05, 0, carroSobe * 0.08]}>
          <Carro x={-3.6} z={-5} dir={1} cor="#8338ec" />
        </group>
        <group position={[0, CALCADA_Y, 0]} rotation={[0, 0.2, 0]} scale={ESCALA_PERSONAGEM}>
          <Personagem
            posicao={[0, 0, 0]}
            giroY={0}
            fase={0}
            intensidade={0}
            frame={global}
            boca={aberturaBoca(global)}
            sobrancelha={1}
            espanto={espanto}
            giroCabeca={[olharCima, 0.1]}
            bracos={interpolate(t, [0, 14], [0.2, 0.75], { ...clamp, easing: ease })}
          />
        </group>
        {OBJETOS.map((o, i) => {
          const pos = posicaoObjeto(o, i, t);
          const tempo = Math.max(0, t - o.atraso);
          return (
            <group
              key={i}
              position={pos}
              rotation={[o.giro[0] * tempo, o.giro[1] * tempo, o.giro[2] * tempo]}
            >
              <Forma tipo={o.tipo} bola={bola} />
            </group>
          );
        })}
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
