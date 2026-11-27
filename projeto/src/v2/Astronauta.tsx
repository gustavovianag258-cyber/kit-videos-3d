import { useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { Cabeca } from "../Personagem";

// O mesmo personagem do vídeo de teste, agora de traje espacial.
// Origem do grupo = centro da cabeça; o corpo fica abaixo. Olha para +z.
// Altura total ~1,75 m (1 unidade = 1 metro).

const TRAJE = "#eceff2";
const TRAJE_SOMBRA = "#c9ced4";
const AZUL = "#2f80ed";
const METAL = "#9aa3ad";

const Membro: React.FC<{
  posicao: [number, number, number];
  rotacao: [number, number, number];
  comprimento: number;
  raio: number;
  ponta?: React.ReactNode;
}> = ({ posicao, rotacao, comprimento, raio, ponta }) => (
  <group position={posicao} rotation={rotacao}>
    <mesh position={[0, -comprimento / 2, 0]}>
      <capsuleGeometry args={[raio, comprimento - raio * 2, 8, 16]} />
      <meshStandardMaterial color={TRAJE} roughness={0.75} />
    </mesh>
    {/* Faixa azul no braço/perna */}
    <mesh position={[0, -comprimento * 0.3, 0]}>
      <cylinderGeometry args={[raio * 1.04, raio * 1.04, 0.05, 20]} />
      <meshStandardMaterial color={AZUL} roughness={0.6} />
    </mesh>
    {/* Junta (cotovelo/joelho) */}
    <mesh position={[0, -comprimento * 0.55, 0]}>
      <torusGeometry args={[raio * 0.98, 0.018, 8, 24]} />
      <meshStandardMaterial color={TRAJE_SOMBRA} roughness={0.8} />
    </mesh>
    <group position={[0, -comprimento, 0]}>{ponta}</group>
  </group>
);

export const Astronauta: React.FC<{
  frame: number;
  boca: number;
  espanto: number;
  giroCabeca?: [number, number];
  // Pose dos braços: 0 = relaxado, 1 = braço direito apoiado/estendido para a janela
  bracoDireito?: number;
  flutuar?: number; // fase da flutuação (segundos)
}> = ({ frame, boca, espanto, giroCabeca = [0, 0], bracoDireito = 0, flutuar = 0 }) => {
  const ref = useRef<THREE.Group>(null);
  useLayoutEffect(() => {
    ref.current?.traverse((o) => {
      if (o instanceof THREE.Mesh) o.castShadow = true;
    });
  }, []);
  // Flutuação lenta e suave (sem gravidade dentro da estação)
  const balanco = Math.sin(flutuar * 1.1) * 0.025;
  const inclinacao = Math.sin(flutuar * 0.7) * 0.03;
  // A cabeça do Personagem tem centro em y = 1,85 (escala 1); aqui ela fica na origem
  const ESC = 0.83;

  return (
    <group ref={ref} position={[0, balanco, 0]} rotation={[inclinacao, 0, inclinacao * 0.5]}>
      {/* Cabeça (mesma do personagem do teste) */}
      <group scale={ESC} rotation={[giroCabeca[0], giroCabeca[1], 0]}>
        <Cabeca frame={frame} boca={boca} sobrancelha={espanto} espanto={espanto} />
      </group>
      {/* Capacete: vidro quase transparente + reflexo + anel do pescoço */}
      <mesh>
        <sphereGeometry args={[0.3, 48, 32]} />
        <meshStandardMaterial
          color="#cfe6ff"
          transparent
          opacity={0.13}
          roughness={0.05}
          metalness={0.2}
          depthWrite={false}
        />
      </mesh>
      <mesh rotation={[0.2, -0.6, 0.5]}>
        <torusGeometry args={[0.285, 0.006, 6, 48, Math.PI * 0.45]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.55} />
      </mesh>
      <mesh position={[0, -0.24, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.2, 0.04, 12, 40]} />
        <meshStandardMaterial color={METAL} roughness={0.35} metalness={0.7} />
      </mesh>
      {/* Tronco do traje */}
      <group position={[0, -0.62, 0]}>
        <mesh scale={[1.18, 1, 0.85]}>
          <capsuleGeometry args={[0.24, 0.36, 12, 24]} />
          <meshStandardMaterial color={TRAJE} roughness={0.75} />
        </mesh>
        {/* Painel do peito com luzes */}
        <mesh position={[0, 0.06, 0.2]} rotation={[-0.12, 0, 0]}>
          <boxGeometry args={[0.24, 0.15, 0.06]} />
          <meshStandardMaterial color="#5b6670" roughness={0.5} metalness={0.4} />
        </mesh>
        {[
          [-0.07, "#38e07b"],
          [0, "#ffd60a"],
          [0.07, "#ff4d4d"],
        ].map(([x, cor]) => (
          <mesh key={String(x)} position={[Number(x), 0.08, 0.235]}>
            <sphereGeometry args={[0.014, 10, 10]} />
            <meshStandardMaterial color={String(cor)} emissive={String(cor)} emissiveIntensity={1.6} />
          </mesh>
        ))}
        {/* Faixa azul do peito (lembra a camisa azul do teste) */}
        <mesh position={[0, -0.12, 0]} scale={[1.2, 1, 0.87]}>
          <cylinderGeometry args={[0.24, 0.24, 0.07, 28]} />
          <meshStandardMaterial color={AZUL} roughness={0.6} />
        </mesh>
        {/* Mochila de suporte de vida */}
        <mesh position={[0, 0.05, -0.28]}>
          <boxGeometry args={[0.44, 0.56, 0.2]} />
          <meshStandardMaterial color={TRAJE_SOMBRA} roughness={0.7} />
        </mesh>
        <mesh position={[0.15, 0.25, -0.39]}>
          <cylinderGeometry args={[0.035, 0.035, 0.12, 12]} />
          <meshStandardMaterial color={METAL} metalness={0.7} roughness={0.3} />
        </mesh>
      </group>
      {/* Braços */}
      <Membro
        posicao={[-0.33, -0.42, 0]}
        rotacao={[-0.25, 0, -0.32]}
        comprimento={0.58}
        raio={0.085}
        ponta={
          <mesh>
            <sphereGeometry args={[0.085, 16, 16]} />
            <meshStandardMaterial color="#8d969f" roughness={0.6} />
          </mesh>
        }
      />
      <Membro
        posicao={[0.33, -0.42, 0]}
        rotacao={[-0.25 - bracoDireito * 1.05, 0, 0.32 - bracoDireito * 0.15]}
        comprimento={0.58}
        raio={0.085}
        ponta={
          <mesh>
            <sphereGeometry args={[0.085, 16, 16]} />
            <meshStandardMaterial color="#8d969f" roughness={0.6} />
          </mesh>
        }
      />
      {/* Pernas levemente dobradas, como quem flutua */}
      {[-0.13, 0.13].map((x, i) => (
        <Membro
          key={x}
          posicao={[x, -0.95, 0]}
          rotacao={[0.18 + i * 0.12, 0, x * 0.4]}
          comprimento={0.8}
          raio={0.1}
          ponta={
            <mesh position={[0, -0.02, 0.06]}>
              <boxGeometry args={[0.18, 0.12, 0.3]} />
              <meshStandardMaterial color="#d7dbe0" roughness={0.7} />
            </mesh>
          }
        />
      ))}
    </group>
  );
};
