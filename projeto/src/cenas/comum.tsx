import { useLayoutEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { AbsoluteFill, random } from "remotion";
import { Carros, Pedestres, Predios, Rua } from "../Cidade";
import type { Vec3 } from "../roteiro";

export const CameraControlada: React.FC<{ posicao: Vec3; alvo: Vec3 }> = ({
  posicao,
  alvo,
}) => {
  const camera = useThree((s) => s.camera);
  useLayoutEffect(() => {
    camera.position.set(...posicao);
    camera.lookAt(...alvo);
    camera.updateProjectionMatrix();
  }, [camera, posicao, alvo]);
  return null;
};

const misturarCor = (a: string, b: string, t: number) =>
  `#${new THREE.Color(a).lerp(new THREE.Color(b), t).getHexString()}`;

// Céu "normal" de dia e céu "estranho" (roxo e dourado) da Terra plana
const NORMAL = {
  ceu: "linear-gradient(180deg, #2f7fd8 0%, #79b8f0 50%, #cfe6ff 100%)",
  nevoa: "#cfe6ff",
  sol: "#fff1d6",
};
const ESTRANHO = {
  ceu: "linear-gradient(180deg, #2a1050 0%, #7b3fa0 38%, #f08a4b 74%, #ffcf7a 100%)",
  nevoa: "#f2a273",
  sol: "#ffb070",
};

export const CeuCidade: React.FC<{ mistura: number; opacidade?: number }> = ({
  mistura,
  opacidade = 1,
}) => (
  <AbsoluteFill style={{ opacity: opacidade }}>
    <AbsoluteFill style={{ background: NORMAL.ceu }} />
    <AbsoluteFill style={{ background: ESTRANHO.ceu, opacity: mistura }} />
  </AbsoluteFill>
);

export const LuzesCidade: React.FC<{
  mistura: number;
  nevoaPerto?: number;
  nevoaLonge?: number;
}> = ({ mistura, nevoaPerto = 35, nevoaLonge = 130 }) => (
  <>
    <fog
      attach="fog"
      args={[misturarCor(NORMAL.nevoa, ESTRANHO.nevoa, mistura), nevoaPerto, nevoaLonge]}
    />
    <hemisphereLight args={["#ffe6cc", "#6a6070", 1.4]} />
    <ambientLight intensity={0.25} />
    <directionalLight
      position={[14, 9, 12]}
      color={misturarCor(NORMAL.sol, ESTRANHO.sol, mistura)}
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
    {/* Luz de preenchimento vinda da frente, para o rosto não ficar escuro */}
    <directionalLight position={[3, 1.5, 10]} color="#cfd8ff" intensity={0.5} />
  </>
);

export const Cidade3D: React.FC<{ tempo: number }> = ({ tempo }) => (
  <>
    <Rua />
    <Predios />
    <Carros tempo={tempo} />
    <Pedestres tempo={tempo} />
  </>
);

// Estrelas fixas numa esfera grande em volta da cena
export const Estrelas: React.FC<{ raio: number; quantidade?: number; tamanho?: number }> = ({
  raio,
  quantidade = 1500,
  tamanho = 2,
}) => {
  const posicoes = useMemo(() => {
    const arr = new Float32Array(quantidade * 3);
    for (let i = 0; i < quantidade; i++) {
      const u = random(`estrela-u-${i}`) * 2 - 1;
      const a = random(`estrela-a-${i}`) * Math.PI * 2;
      const s = Math.sqrt(1 - u * u);
      arr[i * 3] = Math.cos(a) * s * raio;
      arr[i * 3 + 1] = u * raio;
      arr[i * 3 + 2] = Math.sin(a) * s * raio;
    }
    return arr;
  }, [quantidade, raio]);
  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[posicoes, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#ffffff" size={tamanho} sizeAttenuation={false} fog={false} />
    </points>
  );
};

// Textura de brilho redondo (para o Sol e névoas)
export const criarBrilho = (cor: string) => {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, cor);
  g.addColorStop(0.25, cor);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
};
