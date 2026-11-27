import { useMemo } from "react";
import * as THREE from "three";
import type { Vec3 } from "./tempo";

// Brilho redondo e suave (para o Sol e luzes fortes)
export const texturaBrilho = (cor: string) => {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, cor);
  g.addColorStop(0.18, cor);
  g.addColorStop(0.45, "rgba(255,190,110,0.25)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
};

// Sol visível (esfera + brilho) — não ilumina nada sozinho
export const SolVisivel: React.FC<{ posicao: Vec3; raio: number; brilho?: number }> = ({
  posicao,
  raio,
  brilho = 1,
}) => {
  const mapa = useMemo(() => texturaBrilho("rgba(255,236,190,1)"), []);
  return (
    <group position={posicao}>
      <mesh>
        <sphereGeometry args={[raio, 32, 32]} />
        <meshBasicMaterial color="#fff6d6" toneMapped={false} fog={false} />
      </mesh>
      <sprite scale={[raio * 14 * brilho, raio * 14 * brilho, 1]}>
        <spriteMaterial
          map={mapa}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          fog={false}
        />
      </sprite>
    </group>
  );
};

// Luz do Sol em cone: ilumina uma parte do disco e deixa o resto na sombra
export const LuzSolarNoDisco: React.FC<{
  centroDisco: Vec3;
  direcaoSol: Vec3; // direção (normalizada) do disco para o Sol
  intensidade?: number;
}> = ({ centroDisco, direcaoSol, intensidade = 4.2 }) => {
  const alvo = useMemo(() => new THREE.Object3D(), []);
  const [cx, cy, cz] = centroDisco;
  const [dx, dy, dz] = direcaoSol;
  // O cone mira um ponto deslocado para o lado do Sol: metade do disco fica clara
  const horizontal = Math.hypot(dx, dz) || 1;
  alvo.position.set(cx + (dx / horizontal) * 10000, cy, cz + (dz / horizontal) * 10000);
  alvo.updateMatrixWorld();
  return (
    <>
      <primitive object={alvo} />
      <spotLight
        position={[cx + dx * 95000, cy + dy * 95000, cz + dz * 95000]}
        target={alvo}
        color="#fff1dc"
        intensity={intensidade}
        decay={0}
        angle={0.17}
        penumbra={0.75}
      />
    </>
  );
};

// Luz fraca vinda de baixo: deixa a rocha da parte de baixo do disco visível (sem isso fica preta)
export const LuzDeBaixo: React.FC = () => (
  <directionalLight position={[0.6, -1, 0.4]} color="#8a6a50" intensity={0.55} />
);
