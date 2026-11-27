import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";

export const CenaTeste: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  // Uma volta completa ao longo do vídeo, para o loop ficar perfeito
  const rotacao = (frame / durationInFrames) * Math.PI * 2;

  return (
    <AbsoluteFill style={{ backgroundColor: "#101820" }}>
      <ThreeCanvas width={width} height={height}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <mesh rotation={[rotacao * 0.5, rotacao, 0]}>
          <boxGeometry args={[2, 2, 2]} />
          <meshStandardMaterial color="#4a9eff" />
        </mesh>
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
