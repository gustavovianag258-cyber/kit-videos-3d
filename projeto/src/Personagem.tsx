import { createContext, useContext, useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { interpolate } from "remotion";

// Cores e cabelo do personagem. O padrão é o personagem original; outros vídeos
// trocam só o que precisam (ex.: { pele: "#8d5524", cabeloLongo: true }).
export type VisualPersonagem = {
  pele: string;
  nariz: string;
  cabelo: string;
  camisa: string;
  calca: string;
  tenis: string;
  cabeloLongo: boolean;
};

const VISUAL_PADRAO: VisualPersonagem = {
  pele: "#f1c27d",
  nariz: "#e8b06a",
  cabelo: "#4a2c1a",
  camisa: "#2f80ed",
  calca: "#2d3142",
  tenis: "#f5f5f5",
  cabeloLongo: false,
};

const ContextoVisual = createContext(VISUAL_PADRAO);

// Escala que deixa o personagem com 1,75 m (1 unidade = 1 metro)
export const ESCALA_PERSONAGEM = 0.83;

const Olho: React.FC<{ x: number; piscada: number; espanto: number }> = ({
  x,
  piscada,
  espanto,
}) => (
  <group
    position={[x, 0.04, 0.225]}
    scale={[1 + espanto * 0.15, piscada * (1 + espanto * 0.3), 1]}
  >
    <mesh>
      <sphereGeometry args={[0.052, 24, 24]} />
      <meshStandardMaterial color="#ffffff" roughness={0.3} />
    </mesh>
    <mesh position={[0, 0, 0.038]}>
      <sphereGeometry args={[0.028, 16, 16]} />
      <meshStandardMaterial color="#1b1b1b" roughness={0.2} />
    </mesh>
    {/* Brilho no olho */}
    <mesh position={[0.012, 0.014, 0.062]}>
      <sphereGeometry args={[0.008, 8, 8]} />
      <meshBasicMaterial color="#ffffff" />
    </mesh>
  </group>
);

export const Cabeca: React.FC<{
  frame: number;
  boca: number;
  sobrancelha: number;
  espanto: number;
}> = ({ frame, boca: bocaFala, sobrancelha, espanto }) => {
  const v = useContext(ContextoVisual);
  // Espantado, ele fica de boca entreaberta mesmo em silêncio
  const boca = Math.max(bocaFala, espanto * 0.35);
  // Piscada rápida a cada ~2,5 s
  const ciclo = frame % 75;
  const piscada = interpolate(ciclo, [60, 63, 66], [1, 0.1, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <group>
      <mesh>
        <sphereGeometry args={[0.26, 48, 48]} />
        <meshStandardMaterial color={v.pele} roughness={0.6} />
      </mesh>
      {/* Cabelo: calota que cobre topo e nuca, inclinada para trás para deixar a testa livre */}
      <mesh rotation={[-0.5, 0, 0]}>
        <sphereGeometry args={[0.278, 48, 24, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        <meshStandardMaterial color={v.cabelo} roughness={0.85} side={THREE.DoubleSide} />
      </mesh>
      {v.cabeloLongo && (
        // Rabo de cavalo: elástico na nuca e o cabelo caindo atrás da cabeça
        <group position={[0, 0.06, -0.26]} rotation={[0.35, 0, 0]}>
          <mesh>
            <torusGeometry args={[0.045, 0.014, 8, 16]} />
            <meshStandardMaterial color="#d6336c" roughness={0.6} />
          </mesh>
          <mesh position={[0, -0.17, -0.03]} scale={[1, 1, 0.8]}>
            <capsuleGeometry args={[0.065, 0.24, 8, 16]} />
            <meshStandardMaterial color={v.cabelo} roughness={0.85} />
          </mesh>
        </group>
      )}
      {/* Franja: mechas achatadas caindo sobre a testa */}
      {[-0.1, 0, 0.1].map((x, i) => (
        <mesh
          key={x}
          position={[x, 0.17 - i * 0.012, 0.19]}
          rotation={[0.9, 0, -x * 2]}
          scale={[1, 0.45, 1]}
        >
          <sphereGeometry args={[0.075, 16, 16]} />
          <meshStandardMaterial color={v.cabelo} roughness={0.85} />
        </mesh>
      ))}
      <Olho x={-0.09} piscada={piscada} espanto={espanto} />
      <Olho x={0.09} piscada={piscada} espanto={espanto} />
      {/* Sobrancelhas: sobem quando ele faz a pergunta */}
      {[-0.09, 0.09].map((x) => (
        <mesh
          key={x}
          position={[x, 0.12 + sobrancelha * 0.03, 0.225]}
          rotation={[0, 0, (x > 0 ? -0.15 : 0.15) * (1 + sobrancelha)]}
        >
          <boxGeometry args={[0.07, 0.014, 0.02]} />
          <meshStandardMaterial color={v.cabelo} />
        </mesh>
      ))}
      {/* Nariz */}
      <mesh position={[0, -0.02, 0.255]}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshStandardMaterial color={v.nariz} roughness={0.6} />
      </mesh>
      {boca < 0.05 ? (
        // Sorriso: meio anel virado para baixo
        <mesh position={[0, -0.085, 0.23]} rotation={[0.25, 0, Math.PI]}>
          <torusGeometry args={[0.055, 0.012, 8, 24, Math.PI]} />
          <meshStandardMaterial color="#8a3324" />
        </mesh>
      ) : (
        // Boca aberta falando: abre e fecha conforme "boca" (0 a 1)
        <mesh position={[0, -0.1, 0.235]} scale={[1, 0.25 + boca * 0.75, 0.45]}>
          <sphereGeometry args={[0.05, 24, 24]} />
          <meshStandardMaterial color="#5a1a14" roughness={0.5} />
        </mesh>
      )}
      {/* Bochechas */}
      {[-0.15, 0.15].map((x) => (
        <mesh key={x} position={[x, -0.06, 0.19]} scale={[1, 0.7, 0.5]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshStandardMaterial color="#f28b82" roughness={0.8} />
        </mesh>
      ))}
      {/* Orelhas */}
      {[-0.255, 0.255].map((x) => (
        <mesh key={x} position={[x, 0, 0]} scale={[0.5, 1, 0.8]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color={v.pele} roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
};

// Perna pendurada no quadril: girar o grupo balança a perna inteira
const Perna: React.FC<{ x: number; giro: number }> = ({ x, giro }) => {
  const v = useContext(ContextoVisual);
  return (
    <group position={[x, 0.85, 0]} rotation={[giro, 0, 0]}>
      <mesh position={[0, -0.37, 0]}>
        <capsuleGeometry args={[0.09, 0.55, 8, 16]} />
        <meshStandardMaterial color={v.calca} roughness={0.8} />
      </mesh>
      <mesh position={[0, -0.79, 0.05]}>
        <boxGeometry args={[0.17, 0.1, 0.3]} />
        <meshStandardMaterial color={v.tenis} roughness={0.5} />
      </mesh>
      {/* Sola */}
      <mesh position={[0, -0.835, 0.05]}>
        <boxGeometry args={[0.18, 0.03, 0.31]} />
        <meshStandardMaterial color="#c0392b" roughness={0.7} />
      </mesh>
    </group>
  );
};

// Braço pendurado no ombro; "abertura" levanta o braço para o lado (0 = caído)
const Braco: React.FC<{ x: number; giro: number; abertura: number }> = ({
  x,
  giro,
  abertura,
}) => {
  const v = useContext(ContextoVisual);
  return (
    <group
      position={[x, 1.45, 0]}
      rotation={[giro, 0, (x > 0 ? 1 : -1) * (0.1 + abertura * 1.1)]}
    >
      <mesh position={[0, -0.22, 0]}>
        <capsuleGeometry args={[0.07, 0.36, 8, 16]} />
        <meshStandardMaterial color={v.camisa} roughness={0.7} />
      </mesh>
      <mesh position={[0, -0.5, 0]}>
        <sphereGeometry args={[0.075, 16, 16]} />
        <meshStandardMaterial color={v.pele} roughness={0.6} />
      </mesh>
    </group>
  );
};

export const Personagem: React.FC<{
  posicao: [number, number, number];
  giroY: number;
  fase: number;
  intensidade: number;
  frame: number;
  boca: number;
  sobrancelha: number;
  espanto?: number;
  // Rotação extra da cabeça: [para cima/baixo, para os lados]
  giroCabeca?: [number, number];
  bracos?: number;
  // 0 = respiração normal; 1 = ofegante (peito sobe e desce rápido e fundo)
  ofego?: number;
  visual?: Partial<VisualPersonagem>;
}> = ({
  posicao,
  giroY,
  fase,
  intensidade,
  frame,
  boca,
  sobrancelha,
  espanto = 0,
  giroCabeca = [0, 0],
  bracos = 0,
  ofego = 0,
  visual,
}) => {
  const v = { ...VISUAL_PADRAO, ...visual };
  const ref = useRef<THREE.Group>(null);
  useLayoutEffect(() => {
    ref.current?.traverse((o) => {
      if (o instanceof THREE.Mesh) o.castShadow = true;
    });
  }, []);

  const balancoPerna = Math.sin(fase) * 0.55 * intensidade;
  // Corpo fica mais baixo quando as pernas estão abertas
  const quique = 0.04 * intensidade * (Math.abs(Math.cos(fase)) - 1);
  const torcao = Math.sin(fase) * 0.08 * intensidade;
  // Respiração bem leve quando está parado
  const respiracao =
    1 +
    0.012 * Math.sin(frame * 0.12) * (1 - intensidade) +
    0.05 * ofego * Math.sin(frame * 0.5);
  const acenoCabeca = Math.sin(fase * 2) * 0.03 * intensidade + 0.04 * ofego * Math.sin(frame * 0.5);

  return (
    <ContextoVisual.Provider value={v}>
    <group ref={ref} position={posicao} rotation={[0, giroY, 0]}>
      <group position={[0, quique, 0]}>
        <Perna x={-0.12} giro={balancoPerna} />
        <Perna x={0.12} giro={-balancoPerna} />
        <group rotation={[0, torcao, 0]}>
          {/* Tronco */}
          <mesh position={[0, 1.15, 0]} scale={[1.15, respiracao, 0.8]}>
            <capsuleGeometry args={[0.22, 0.35, 12, 24]} />
            <meshStandardMaterial color={v.camisa} roughness={0.7} />
          </mesh>
          {/* Cinto */}
          <mesh position={[0, 0.86, 0]} scale={[1.15, 1, 0.8]}>
            <cylinderGeometry args={[0.215, 0.215, 0.06, 24]} />
            <meshStandardMaterial color="#5d4037" roughness={0.6} />
          </mesh>
          <Braco x={-0.3} giro={-balancoPerna * 0.9} abertura={bracos} />
          <Braco x={0.3} giro={balancoPerna * 0.9} abertura={bracos} />
          {/* Pescoço */}
          <mesh position={[0, 1.6, 0]}>
            <cylinderGeometry args={[0.07, 0.08, 0.12, 16]} />
            <meshStandardMaterial color={v.pele} roughness={0.6} />
          </mesh>
          <group
            position={[0, 1.85, 0]}
            rotation={[
              acenoCabeca + giroCabeca[0],
              -torcao * 0.6 + giroCabeca[1],
              sobrancelha * 0.08,
            ]}
          >
            <Cabeca
              frame={frame}
              boca={boca}
              sobrancelha={Math.max(sobrancelha, espanto)}
              espanto={espanto}
            />
          </group>
        </group>
      </group>
    </group>
    </ContextoVisual.Provider>
  );
};
