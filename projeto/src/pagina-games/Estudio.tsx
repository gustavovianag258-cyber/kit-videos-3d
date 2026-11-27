import { useThree } from "@react-three/fiber";
import { useLayoutEffect } from "react";

// Peças comuns dos testes e cartazes da página Fase Extra: câmera e estúdio roxo/neon.
export const Camera: React.FC<{ pos: [number, number, number]; alvo: [number, number, number] }> = ({ pos, alvo }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    camera.position.set(...pos);
    camera.lookAt(...alvo);
    camera.updateProjectionMatrix();
  });
  return null;
};

const Neon: React.FC<{ p: [number, number, number]; s: [number, number, number]; cor: string }> = ({ p, s, cor }) => (
  <mesh position={p}>
    <boxGeometry args={s} />
    <meshStandardMaterial color={cor} emissive={cor} emissiveIntensity={3.2} />
  </mesh>
);

export const Estudio: React.FC = () => (
  <>
    <hemisphereLight args={["#8A6BD8", "#1A1030", 0.55]} />
    <directionalLight position={[-2.6, 3.2, 3.4]} intensity={3} color="#F2E6FF" castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0003} shadow-camera-left={-4} shadow-camera-right={4} shadow-camera-top={4} shadow-camera-bottom={-4} />
    <pointLight position={[2.4, 1.5, 0.4]} intensity={7} color="#FF4FD8" distance={7} />
    <pointLight position={[-2.4, 1.2, 0.2]} intensity={7} color="#5B6CFF" distance={7} />
    {/* chão e parede escuros */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <circleGeometry args={[6, 64]} />
      <meshStandardMaterial color="#17102A" roughness={0.35} metalness={0.4} />
    </mesh>
    <mesh position={[0, 3, -2.6]} receiveShadow>
      <planeGeometry args={[14, 8]} />
      <meshStandardMaterial color="#1B1233" roughness={0.9} />
    </mesh>
    {/* arco de neon atrás e anel no chão */}
    <Neon p={[0, 2.2, -2.55]} s={[2.6, 0.05, 0.05]} cor="#B66BFF" />
    <Neon p={[-1.3, 1.1, -2.55]} s={[0.05, 2.2, 0.05]} cor="#B66BFF" />
    <Neon p={[1.3, 1.1, -2.55]} s={[0.05, 2.2, 0.05]} cor="#B66BFF" />
    <Neon p={[0, 0.01, -2.55]} s={[2.6, 0.02, 0.05]} cor="#FF4FD8" />
    <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.95, 1.0, 64]} />
      <meshStandardMaterial color="#B66BFF" emissive="#B66BFF" emissiveIntensity={3} />
    </mesh>
  </>
);
