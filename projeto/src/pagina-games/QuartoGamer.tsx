import { RoundedBox } from "@react-three/drei";
import { staticFile } from "remotion";
import { Mascote3D } from "./Mascote3D";
import { useQuadroVideo } from "./SetupGamer";

// Cenário novo do final da Fase Extra (a partir da Fase 08): quarto gamer à noite, com janelão para a cidade,
// mesa com dois monitores (gameplay oficial + chat), painéis hexagonais de LED, prateleira com bonecos, planta,
// piso de madeira e cadeira laranja. Paleta ciano + laranja (o roxo fica só no Vyce).
// O Vyce olha para −x (mesa à esquerda dele); a câmera fica à frente, do lado +z.
type V3 = [number, number, number];
const CIANO = "#22D3EE";
const LARANJA = "#FF8A3D";
const ROSA = "#FF4FD8";
const Bloco: React.FC<{ p: V3; s: V3; cor: string; rot?: V3; raio?: number; rug?: number; met?: number; luz?: number }> = ({ p, s, cor, rot, raio = 0.02, rug = 0.6, met = 0.1, luz = 0 }) => (
  <RoundedBox args={s} position={p} rotation={rot} radius={Math.min(raio, Math.min(...s) * 0.45)} smoothness={4} castShadow receiveShadow>
    <meshStandardMaterial color={cor} roughness={rug} metalness={met} emissive={luz ? cor : "#000"} emissiveIntensity={luz} />
  </RoundedBox>
);
const Neon: React.FC<{ p: V3; s: V3; cor: string; forca?: number; rot?: V3 }> = ({ p, s, cor, forca = 3, rot }) => (
  <mesh position={p} rotation={rot}>
    <boxGeometry args={s} />
    <meshStandardMaterial color={cor} emissive={cor} emissiveIntensity={forca} toneMapped={false} />
  </mesh>
);

const TelaJogo: React.FC = () => {
  const tex = useQuadroVideo(staticFile("fase-extra/quarto/monitor-corrida.mp4"));
  return (
    <mesh position={[0, 0, 0.027]}>
      <planeGeometry args={[0.96, 0.54]} />
      <meshBasicMaterial map={tex} toneMapped={false} />
    </mesh>
  );
};

// cidade à noite atrás do janelão (prédios com janelas acesas)
const Cidade: React.FC<{ t: number }> = ({ t }) => {
  const predios = Array.from({ length: 16 }, (_, i) => {
    const r = (k: number) => ((Math.sin(i * 91.7 + k * 13.3) + 1) / 2);
    return { x: -3.2 + i * 0.42 + r(1) * 0.15, w: 0.28 + r(2) * 0.22, h: 0.8 + r(3) * 2.2, z: -4.2 - r(4) * 1.2, cor: r(5) > 0.5 ? CIANO : LARANJA };
  });
  return (
    <group>
      {/* céu de Vice City à noite */}
      <mesh position={[-0.8, 2.2, -6.5]}>
        <planeGeometry args={[14, 7]} />
        <meshBasicMaterial color="#1a0f3d" />
      </mesh>
      <mesh position={[-0.8, 0.9, -6.4]}>
        <planeGeometry args={[14, 1.6]} />
        <meshBasicMaterial color="#5a1f6e" transparent opacity={0.7} />
      </mesh>
      {predios.map((p, i) => (
        <group key={i} position={[p.x, p.h / 2 - 0.2, p.z]}>
          <mesh>
            <boxGeometry args={[p.w, p.h, 0.3]} />
            <meshStandardMaterial color="#0b0a18" roughness={0.9} />
          </mesh>
          {Array.from({ length: Math.floor(p.h / 0.22) }, (_, j) => (
            <mesh key={j} position={[0, -p.h / 2 + 0.15 + j * 0.22, 0.152]}>
              <planeGeometry args={[p.w * 0.7, 0.05]} />
              <meshBasicMaterial color={(i + j) % 3 === 0 ? p.cor : "#FFE3A3"} transparent opacity={(i * 7 + j * 3) % 5 === 0 ? 0.15 : 0.75} toneMapped={false} />
            </mesh>
          ))}
          <mesh position={[0, p.h / 2 + 0.01, 0.152]}>
            <planeGeometry args={[p.w, 0.03]} />
            <meshBasicMaterial color={p.cor} toneMapped={false} />
          </mesh>
        </group>
      ))}
      {/* luz piscando no topo de um prédio */}
      <mesh position={[-1.3, 2.9, -4.3]}>
        <sphereGeometry args={[0.04, 12, 8]} />
        <meshBasicMaterial color="#FF3344" transparent opacity={0.4 + 0.6 * Math.max(0, Math.sin(t * 4))} toneMapped={false} />
      </mesh>
    </group>
  );
};

const Hexagono: React.FC<{ p: V3; cor: string; forca: number }> = ({ p, cor, forca }) => (
  <group position={p}>
    <mesh rotation={[0, 0, Math.PI / 6]}>
      <cylinderGeometry args={[0.15, 0.15, 0.02, 6]} />
      <meshStandardMaterial color="#111" />
    </mesh>
    <mesh rotation={[Math.PI / 2, 0, Math.PI / 6]} position={[0, 0, 0.012]}>
      <ringGeometry args={[0.11, 0.14, 6]} />
      <meshStandardMaterial color={cor} emissive={cor} emissiveIntensity={forca} toneMapped={false} side={2} />
    </mesh>
  </group>
);

export const QuartoGamer: React.FC<{ t: number; boca: number; pisca: boolean; olhaCamera: number }> = ({ t, boca, pisca, olhaCamera }) => {
  const digita = Math.sin(t * 14) * 0.05;
  const mouse = Math.sin(t * 3.1) * 0.06;
  const ZP = -1.6; // parede do fundo
  return (
    <group>
      {/* piso de madeira (tábuas) e tapete */}
      {Array.from({ length: 18 }, (_, i) => (
        <mesh key={i} position={[-4 + i * 0.45, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[0.44, 10]} />
          <meshStandardMaterial color={i % 3 === 0 ? "#3B2A20" : i % 3 === 1 ? "#43302A" : "#352519"} roughness={0.55} />
        </mesh>
      ))}
      <mesh position={[0.1, 0.004, 0.2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[1.05, 48]} />
        <meshStandardMaterial color="#1D2A3A" roughness={0.95} />
      </mesh>

      {/* parede do fundo com o janelão */}
      <Bloco p={[-2.65, 1.5, ZP]} s={[1.9, 3.2, 0.1]} cor="#13232B" rug={0.9} />
      <Bloco p={[1.05, 1.5, ZP]} s={[2.3, 3.2, 0.1]} cor="#13232B" rug={0.9} />
      <Bloco p={[-0.95, 0.45, ZP]} s={[1.7, 0.9, 0.1]} cor="#13232B" rug={0.9} />
      <Bloco p={[-0.95, 2.85, ZP]} s={[1.7, 0.5, 0.1]} cor="#13232B" rug={0.9} />
      {/* caixilho e persiana meio aberta */}
      <Bloco p={[-0.95, 0.92, ZP + 0.06]} s={[1.72, 0.05, 0.14]} cor="#D9D4CC" />
      <Bloco p={[-0.95, 1.75, ZP + 0.03]} s={[0.04, 1.65, 0.06]} cor="#D9D4CC" />
      {Array.from({ length: 6 }, (_, i) => (
        <Bloco key={i} p={[-0.95, 2.55 - i * 0.05, ZP + 0.07]} s={[1.68, 0.025, 0.02]} cor="#E8E2D8" rug={0.8} />
      ))}
      <Cidade t={t} />

      {/* painéis hexagonais de LED e fita no rodapé */}
      {([[0.55, 2.15], [0.81, 2.0], [0.81, 2.3], [1.07, 2.15], [1.33, 2.0], [1.07, 1.85]] as [number, number][]).map(([x, y], i) => (
        <Hexagono key={i} p={[x, y, ZP + 0.06]} cor={i % 2 ? CIANO : LARANJA} forca={2.2 + 0.8 * Math.sin(t * 2 + i)} />
      ))}
      <Neon p={[0, 0.05, ZP + 0.07]} s={[6, 0.02, 0.02]} cor={CIANO} forca={2.5} />
      {/* prateleira com bonecos */}
      <Bloco p={[0.95, 1.45, ZP + 0.13]} s={[1.0, 0.04, 0.22]} cor="#E8E2D8" />
      {[0.6, 0.8, 1.0, 1.25].map((x, i) => (
        <group key={x} position={[x, 1.55, ZP + 0.13]}>
          <Bloco p={[0, 0, 0]} s={[0.08, 0.14 + (i % 2) * 0.05, 0.08]} cor={[LARANJA, CIANO, ROSA, "#FFD84A"][i]} raio={0.03} luz={0.15} />
          <mesh position={[0, 0.1 + (i % 2) * 0.025, 0]}>
            <sphereGeometry args={[0.045, 16, 12]} />
            <meshStandardMaterial color="#F2D0B4" roughness={0.6} />
          </mesh>
        </group>
      ))}
      {/* planta no canto */}
      <group position={[1.6, 0, ZP + 0.35]}>
        <Bloco p={[0, 0.2, 0]} s={[0.3, 0.4, 0.3]} cor="#D9D4CC" raio={0.05} />
        {Array.from({ length: 7 }, (_, i) => (
          <mesh key={i} position={[Math.cos(i) * 0.08, 0.6 + (i % 3) * 0.1, Math.sin(i) * 0.08]} rotation={[Math.cos(i * 2) * 0.5, i, Math.sin(i * 2) * 0.5]}>
            <coneGeometry args={[0.07, 0.5, 6]} />
            <meshStandardMaterial color={i % 2 ? "#2F7A4A" : "#3E9A5C"} roughness={0.8} />
          </mesh>
        ))}
      </group>

      {/* cadeira gamer laranja e preta */}
      <group>
        <Bloco p={[-0.02, 0.47, 0]} s={[0.55, 0.1, 0.56]} cor="#18181C" raio={0.05} />
        <Bloco p={[0.27, 0.97, 0]} s={[0.1, 0.92, 0.54]} cor="#18181C" raio={0.05} rot={[0, 0, -0.12]} />
        <Bloco p={[0.25, 0.97, 0]} s={[0.11, 0.62, 0.14]} cor={LARANJA} raio={0.04} rot={[0, 0, -0.12]} luz={0.2} />
        <Bloco p={[0.29, 1.32, 0]} s={[0.1, 0.12, 0.3]} cor={LARANJA} raio={0.04} rot={[0, 0, -0.12]} />
        <mesh position={[0, 0.26, 0]} castShadow>
          <cylinderGeometry args={[0.035, 0.035, 0.36, 16]} />
          <meshStandardMaterial color="#666" metalness={0.8} roughness={0.3} />
        </mesh>
        {[0, 1, 2, 3, 4].map((i) => (
          <Bloco key={i} p={[Math.cos((i * 2 * Math.PI) / 5) * 0.2, 0.06, Math.sin((i * 2 * Math.PI) / 5) * 0.2]} s={[0.36, 0.04, 0.05]} rot={[0, (-i * 2 * Math.PI) / 5, 0]} cor="#222" />
        ))}
      </group>

      {/* Vyce sentado, de frente para a mesa (−x), mãos no teclado e no mouse */}
      <Mascote3D
        pos={[-0.06, -0.31, 0]}
        giro={-Math.PI / 2}
        pose={{
          pernaE: -1.45,
          pernaD: -1.45,
          joelhoE: 1.4,
          joelhoD: 1.4,
          tronco: 0.12,
          bracoE: [-0.9 + mouse, 0, -0.12],
          cotoveloE: 0.7,
          bracoD: [-0.95 + digita, 0, 0.15],
          cotoveloD: 0.75,
          cabeca: [0.05 + 0.03 * Math.sin(t * 3), 0.95 * olhaCamera + 0.05 * Math.sin(t * 1.3), 0],
        }}
        boca={boca}
        pisca={pisca}
        olhar={0.6 * olhaCamera}
      />

      {/* mesa branca */}
      <Bloco p={[-0.78, 0.74, -0.05]} s={[0.72, 0.05, 1.5]} cor="#2B2B33" rug={0.45} met={0.2} />
      <Neon p={[-0.43, 0.715, -0.05]} s={[0.012, 0.012, 1.5]} cor={LARANJA} forca={3} />
      {[-0.72, 0.62].map((z) => (
        <Bloco key={z} p={[-0.78, 0.36, z]} s={[0.62, 0.72, 0.05]} cor="#1E1E24" />
      ))}
      {/* teclado, mouse, headset e lata */}
      <Bloco p={[-0.58, 0.78, 0.0]} s={[0.17, 0.025, 0.46]} cor="#1B1B22" raio={0.008} />
      <Neon p={[-0.58, 0.795, 0.0]} s={[0.14, 0.004, 0.42]} cor={CIANO} forca={1.4 + 0.5 * Math.sin(t * 4)} />
      <Bloco p={[-0.6 - mouse * 0.3, 0.785, -0.36]} s={[0.1, 0.035, 0.06]} cor="#1B1B22" raio={0.015} />
      <mesh position={[-0.6, 0.7655, -0.36]}>
        <boxGeometry args={[0.3, 0.003, 0.26]} />
        <meshStandardMaterial color="#1E2B36" />
      </mesh>
      <group position={[-0.95, 0.77, 0.5]}>
        <mesh position={[0, 0.16, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.32, 10]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        <mesh position={[0, 0.33, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.09, 0.018, 10, 24, Math.PI]} />
          <meshStandardMaterial color={LARANJA} roughness={0.5} />
        </mesh>
      </group>
      <mesh position={[-0.5, 0.82, 0.42]}>
        <cylinderGeometry args={[0.033, 0.033, 0.12, 16]} />
        <meshStandardMaterial color={CIANO} metalness={0.6} roughness={0.3} />
      </mesh>

      {/* monitor principal com gameplay oficial */}
      <group position={[-1.02, 1.2, 0.1]} rotation={[0, Math.PI / 2 - 0.85, 0]}>
        <Bloco p={[0, 0, 0]} s={[1.02, 0.6, 0.05]} cor="#0E0E12" raio={0.02} />
        <TelaJogo />
        <mesh position={[0, 0, -0.03]}>
          <planeGeometry args={[1.18, 0.74]} />
          <meshBasicMaterial color={CIANO} transparent opacity={0.22} />
        </mesh>
      </group>
      <Bloco p={[-1.02, 0.86, 0.1]} s={[0.05, 0.22, 0.05]} cor="#222" />
      <Bloco p={[-1.02, 0.77, 0.1]} s={[0.22, 0.02, 0.18]} cor="#222" />
      {/* monitor vertical com o chat */}
      <group position={[-0.95, 1.22, -0.62]} rotation={[0, Math.PI / 2 - 0.35, 0]}>
        <Bloco p={[0, 0, 0]} s={[0.36, 0.6, 0.04]} cor="#0E0E12" raio={0.015} />
        <mesh position={[0, 0, 0.022]}>
          <planeGeometry args={[0.32, 0.56]} />
          <meshBasicMaterial color="#10141f" />
        </mesh>
        {Array.from({ length: 9 }, (_, i) => {
          const k = (Math.floor(t * 2.5) + i) % 9;
          return (
            <mesh key={i} position={[-0.02 + ((k * 37) % 5) * 0.006, 0.23 - i * 0.055, 0.024]}>
              <planeGeometry args={[0.18 + ((k * 53) % 7) * 0.012, 0.022]} />
              <meshBasicMaterial color={[CIANO, LARANJA, ROSA, "#FFFFFF"][k % 4]} transparent opacity={0.85} toneMapped={false} />
            </mesh>
          );
        })}
      </group>

      {/* luzes da cena */}
      <hemisphereLight args={["#9FD8FF", "#2A1A12", 0.55]} />
      <directionalLight position={[2, 3, 3]} intensity={1.9} color="#FFF0E0" castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0003} />
      <pointLight position={[-0.8, 1.3, 0.6]} intensity={4} color="#BFEFFF" distance={2.5} />
      <pointLight position={[1.0, 2.0, -1.0]} intensity={6} color={LARANJA} distance={4} />
      <pointLight position={[-1.4, 1.6, -1.2]} intensity={6} color={CIANO} distance={4} />
      <pointLight position={[1.4, 1.2, 1.2]} intensity={3} color={ROSA} distance={4} />
    </group>
  );
};
