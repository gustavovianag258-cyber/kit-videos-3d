import * as THREE from "three";
import { Fosco } from "./boneco";
import type { V3 } from "./tempo";

// Peças "dentro do corpo", no mesmo jeito de brinquedo: bactéria em colar de bolinhas com
// olhinhos, anticorpo em Y, grumo (imunocomplexo), glomérulo (novelo vermelho dentro de uma
// cápsula) e célula de defesa.

const Olhos: React.FC<{ r: number; bravo?: boolean }> = ({ r, bravo }) => (
  <>
    {[-1, 1].map((l) => (
      <group key={l}>
        <mesh position={[l * r * 0.35, r * 0.15, r * 0.88]}>
          <sphereGeometry args={[r * 0.16, 12, 8]} />
          <meshBasicMaterial color="#1b1410" />
        </mesh>
        {bravo && (
          <mesh position={[l * r * 0.35, r * 0.42, r * 0.85]} rotation={[0, 0, l * 0.5]}>
            <boxGeometry args={[r * 0.4, r * 0.08, r * 0.05]} />
            <meshBasicMaterial color="#1b1410" />
          </mesh>
        )}
      </group>
    ))}
  </>
);

// Estreptococo: corrente de bolinhas roxas que ondula; a primeira tem cara de vilão
export const Estreptococo: React.FC<{ pos: V3; t: number; n?: number; rot?: number; escala?: number }> = ({ pos, t, n = 7, rot = 0, escala = 1 }) => (
  <group position={pos} rotation={[0, 0, rot]} scale={escala}>
    {Array.from({ length: n }, (_, i) => (
      <mesh key={i} position={[i * 0.34 - (n * 0.34) / 2, Math.sin(t * 3 + i * 0.8) * 0.12, Math.cos(t * 2 + i) * 0.05]} castShadow>
        <sphereGeometry args={[0.19, 20, 14]} />
        <Fosco cor={i % 2 ? "#8e6ad8" : "#a17fe6"} />
        {i === 0 && <Olhos r={0.19} bravo />}
      </mesh>
    ))}
  </group>
);

// Anticorpo em Y (azul)
export const Anticorpo: React.FC<{ pos: V3; rot?: V3; escala?: number }> = ({ pos, rot = [0, 0, 0], escala = 1 }) => (
  <group position={pos} rotation={rot} scale={escala}>
    <mesh position={[0, -0.22, 0]}>
      <capsuleGeometry args={[0.06, 0.34, 6, 10]} />
      <Fosco cor="#4f8fe8" />
    </mesh>
    {[-1, 1].map((l) => (
      <mesh key={l} position={[l * 0.13, 0.12, 0]} rotation={[0, 0, -l * 0.7]}>
        <capsuleGeometry args={[0.06, 0.3, 6, 10]} />
        <Fosco cor="#6aa7f2" />
      </mesh>
    ))}
  </group>
);

// Pedaço da bactéria (antígeno) — bolinha roxa pequena
export const Pedaco: React.FC<{ pos: V3; r?: number }> = ({ pos, r = 0.11 }) => (
  <mesh position={pos}>
    <dodecahedronGeometry args={[r, 0]} />
    <Fosco cor="#a17fe6" />
  </mesh>
);

// Grumo (imunocomplexo): pedaço roxo + anticorpos grudados, amarelado
export const Grumo: React.FC<{ pos: V3; escala?: number; giro?: number }> = ({ pos, escala = 1, giro = 0 }) => (
  <group position={pos} scale={escala} rotation={[giro, giro * 1.3, 0]}>
    <mesh>
      <icosahedronGeometry args={[0.16, 0]} />
      <Fosco cor="#f2c84b" />
    </mesh>
    <Pedaco pos={[0.1, 0.08, 0.08]} r={0.08} />
    <Anticorpo pos={[-0.12, 0.1, 0]} rot={[0, 0, 0.8]} escala={0.45} />
    <Anticorpo pos={[0.05, -0.15, 0.05]} rot={[0, 0, 2.6]} escala={0.45} />
  </group>
);

// Glomérulo: novelo de vaso vermelho dentro da cápsula translúcida. inflama 0..1 escurece e incha.
export const Glomerulo: React.FC<{ t: number; inflama?: number; escala?: number }> = ({ t, inflama = 0, escala = 1 }) => {
  const cor = new THREE.Color("#e2575a").lerp(new THREE.Color("#8f1f2a"), inflama);
  const pulso = 1 + inflama * 0.06 * Math.sin(t * 9);
  return (
    <group scale={escala * pulso} rotation={[0.3, t * 0.25, 0]}>
      <mesh castShadow>
        <torusKnotGeometry args={[0.75, 0.2, 220, 24, 3, 7]} />
        <meshStandardMaterial color={cor} roughness={0.55} emissive={cor} emissiveIntensity={0.12 + inflama * 0.25} />
      </mesh>
      <mesh rotation={[0.6, 0.3, 0]}>
        <torusKnotGeometry args={[0.55, 0.15, 200, 20, 2, 5]} />
        <meshStandardMaterial color={cor.clone().offsetHSL(0, 0, 0.08)} roughness={0.55} />
      </mesh>
      {/* cápsula (de Bowman), meia esfera translúcida */}
      <mesh>
        <sphereGeometry args={[1.45, 40, 28]} />
        <meshStandardMaterial color="#ffd6dc" transparent opacity={0.22} roughness={0.2} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {/* vasinho que entra e sai */}
      <mesh position={[0, -1.6, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 1.0, 16]} />
        <meshStandardMaterial color={cor} roughness={0.55} />
      </mesh>
    </group>
  );
};

// Célula de defesa (neutrófilo): bolota branca com núcleo lilás e olhinhos determinados
export const Defesa: React.FC<{ pos: V3; giro?: number }> = ({ pos, giro = 0 }) => (
  <group position={pos} rotation={[0, giro, 0]}>
    <mesh castShadow>
      <sphereGeometry args={[0.28, 22, 16]} />
      <Fosco cor="#f7f3ea" />
    </mesh>
    <mesh position={[0, 0.02, 0.12]} scale={[1, 0.6, 0.6]}>
      <sphereGeometry args={[0.15, 14, 10]} />
      <meshStandardMaterial color="#c9a6f0" transparent opacity={0.7} />
    </mesh>
    <Olhos r={0.28} bravo />
  </group>
);

// Hemácia: disco vermelho com o meio afundado
export const Hemacia: React.FC<{ pos: V3; rot?: V3; escala?: number }> = ({ pos, rot = [0, 0, 0], escala = 1 }) => (
  <group position={pos} rotation={rot} scale={escala}>
    <mesh>
      <torusGeometry args={[0.1, 0.06, 12, 24]} />
      <Fosco cor="#d63c3c" />
    </mesh>
    <mesh scale={[1, 1, 0.35]}>
      <sphereGeometry args={[0.1, 14, 10]} />
      <Fosco cor="#c22f30" />
    </mesh>
  </group>
);
