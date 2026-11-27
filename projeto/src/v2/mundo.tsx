import { useLayoutEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { random } from "remotion";
import type { Vec3 } from "./tempo";

// Posições fixas do "mundo" das cenas no espaço (1 unidade = 1 metro).
// A estação fica na origem; o disco fica longe, abaixo e à frente da janela.
export const CENTRO_DISCO: Vec3 = [0, -24000, -90000];
const d = [-0.62, 0.62, 0.42];
const n = Math.hypot(d[0], d[1], d[2]);
export const DIRECAO_SOL: Vec3 = [d[0] / n, d[1] / n, d[2] / n];
export const POSICAO_SOL: Vec3 = [
  CENTRO_DISCO[0] + DIRECAO_SOL[0] * 420000,
  CENTRO_DISCO[1] + DIRECAO_SOL[1] * 420000,
  CENTRO_DISCO[2] + DIRECAO_SOL[2] * 420000,
];

export const Camera: React.FC<{ posicao: Vec3; alvo: Vec3; fov?: number; rolo?: number }> = ({
  posicao,
  alvo,
  fov,
  rolo = 0,
}) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  useLayoutEffect(() => {
    camera.position.set(...posicao);
    camera.lookAt(...alvo);
    // Inclinação lateral (câmera de mão / primeira pessoa)
    if (rolo) camera.rotateZ(rolo);
    if (fov) camera.fov = fov;
    camera.updateProjectionMatrix();
  }, [camera, posicao, alvo, fov, rolo]);
  return null;
};

// Curva suave por pontos (Catmull-Rom): evita "trancos" entre trechos da câmera
export const curva = (pontos: Vec3[]) => {
  const c = new THREE.CatmullRomCurve3(pontos.map((p) => new THREE.Vector3(...p)), false, "centripetal");
  return (t: number): Vec3 => {
    const v = c.getPoint(Math.min(1, Math.max(0, t)));
    return [v.x, v.y, v.z];
  };
};

export const Estrelas: React.FC<{ raio: number; quantidade?: number; opacidade?: number }> = ({
  raio,
  quantidade = 2500,
  opacidade = 1,
}) => {
  const { posicoes, cores } = useMemo(() => {
    const posicoes = new Float32Array(quantidade * 3);
    const cores = new Float32Array(quantidade * 3);
    for (let i = 0; i < quantidade; i++) {
      const u = random(`est-u-${i}`) * 2 - 1;
      const a = random(`est-a-${i}`) * Math.PI * 2;
      const s = Math.sqrt(1 - u * u);
      posicoes[i * 3] = Math.cos(a) * s * raio;
      posicoes[i * 3 + 1] = u * raio;
      posicoes[i * 3 + 2] = Math.sin(a) * s * raio;
      // Estrelas com brilhos e tons levemente diferentes
      const b = 0.45 + random(`est-b-${i}`) * 0.55;
      const t = random(`est-t-${i}`);
      cores[i * 3] = b * (t > 0.85 ? 1 : 0.9);
      cores[i * 3 + 1] = b * 0.93;
      cores[i * 3 + 2] = b * (t < 0.2 ? 1 : 0.85);
    }
    return { posicoes, cores };
  }, [quantidade, raio]);
  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[posicoes, 3]} />
        <bufferAttribute attach="attributes-color" args={[cores, 3]} />
      </bufferGeometry>
      <pointsMaterial
        vertexColors
        size={2.2}
        sizeAttenuation={false}
        fog={false}
        transparent
        opacity={opacidade}
        depthWrite={false}
      />
    </points>
  );
};
