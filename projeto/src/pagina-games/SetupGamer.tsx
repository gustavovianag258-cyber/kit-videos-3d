import { RoundedBox } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useLayoutEffect, useMemo } from "react";
import { staticFile, useCurrentFrame, useDelayRender, useVideoConfig } from "remotion";
import { NoReactInternals } from "remotion/no-react";
import * as THREE from "three";
import { Mascote3D } from "./Mascote3D";

// Final da Fase Extra: o Vyce sentado na cadeira gamer, jogando no PC, com o trailer oficial passando no monitor.
// O Vyce olha para a frente (+x); a mesa e o monitor ficam à frente dele, virados um pouco para a câmera.
type V3 = [number, number, number];
const ROXO = "#B66BFF";
const ROSA = "#FF4FD8";
const Bloco: React.FC<{ p: V3; s: V3; cor: string; rot?: V3; raio?: number; rug?: number; met?: number; luz?: number }> = ({ p, s, cor, rot, raio = 0.02, rug = 0.6, met = 0.1, luz = 0 }) => (
  <RoundedBox args={s} position={p} rotation={rot} radius={Math.min(raio, Math.min(...s) * 0.45)} smoothness={4} castShadow receiveShadow>
    <meshStandardMaterial color={cor} roughness={rug} metalness={met} emissive={luz ? cor : "#000"} emissiveIntensity={luz} />
  </RoundedBox>
);

// Quadro do vídeo como textura. O useOffthreadVideoTexture libera o render antes de a cena 3D redesenhar
// (a tela saía preta); aqui o quadro só é liberado depois de desenhar a tela com a textura nova.
export const useQuadroVideo = (src: string) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { advance } = useThree();
  const { delayRender, continueRender, cancelRender } = useDelayRender();
  const tex = useMemo(() => {
    const t = new THREE.Texture();
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  const url = NoReactInternals.getOffthreadVideoSource({ src, currentTime: Math.max(0, frame) / fps, transparent: false, toneMapped: true });
  useLayoutEffect(() => {
    const h = delayRender("quadro do monitor");
    let vivo = true;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (!vivo) return;
      tex.image = img;
      tex.needsUpdate = true;
      advance(performance.now());
      requestAnimationFrame(() => {
        advance(performance.now());
        continueRender(h);
      });
    };
    img.onerror = () => cancelRender(new Error("quadro do monitor não carregou: " + url));
    img.src = url;
    return () => {
      vivo = false;
      continueRender(h);
    };
  }, [url]); // eslint-disable-line react-hooks/exhaustive-deps
  return tex;
};

const Tela: React.FC = () => {
  const tex = useQuadroVideo(staticFile("fase-extra/rockstar/monitor.mp4"));
  return (
    <mesh position={[0, 0, 0.026]}>
      <planeGeometry args={[1.0, 0.5625]} />
      <meshBasicMaterial map={tex} toneMapped={false} />
    </mesh>
  );
};

export const SetupGamer: React.FC<{ t: number; boca: number; pisca: boolean; olhaCamera: number }> = ({ t, boca, pisca, olhaCamera }) => {
  const digita = Math.sin(t * 14) * 0.05;
  const mouse = Math.sin(t * 3.1) * 0.06;
  return (
    <group>
      {/* sala */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#171026" roughness={0.5} metalness={0.2} />
      </mesh>
      <mesh position={[0, 2, -1.4]} receiveShadow>
        <planeGeometry args={[12, 4]} />
        <meshStandardMaterial color="#1E1338" roughness={0.9} />
      </mesh>
      {/* fita de LED na parede e prateleira */}
      <mesh position={[0.6, 1.9, -1.38]}>
        <boxGeometry args={[3.2, 0.03, 0.02]} />
        <meshStandardMaterial color={ROSA} emissive={ROSA} emissiveIntensity={3} />
      </mesh>
      <mesh position={[0.6, 0.55, -1.38]}>
        <boxGeometry args={[3.2, 0.03, 0.02]} />
        <meshStandardMaterial color={ROXO} emissive={ROXO} emissiveIntensity={3} />
      </mesh>
      <Bloco p={[-0.6, 1.5, -1.3]} s={[0.9, 0.04, 0.22]} cor="#2A1B4A" />
      {[-0.9, -0.7, -0.45].map((x, i) => (
        <Bloco key={x} p={[x, 1.6, -1.3]} s={[0.1, 0.17 + i * 0.04, 0.1]} cor={i === 1 ? ROSA : ROXO} luz={0.6} raio={0.03} />
      ))}

      {/* cadeira gamer */}
      <group position={[0, 0, 0]}>
        <Bloco p={[0.02, 0.47, 0]} s={[0.55, 0.1, 0.56]} cor="#2B1656" raio={0.05} />
        <Bloco p={[-0.27, 0.95, 0]} s={[0.1, 0.9, 0.54]} cor="#2B1656" raio={0.05} rot={[0, 0, 0.12]} />
        <Bloco p={[-0.25, 0.95, 0]} s={[0.11, 0.6, 0.12]} cor={ROXO} raio={0.04} rot={[0, 0, 0.12]} luz={0.25} />
        <mesh position={[0, 0.26, 0]} castShadow>
          <cylinderGeometry args={[0.035, 0.035, 0.36, 16]} />
          <meshStandardMaterial color="#555" metalness={0.8} roughness={0.3} />
        </mesh>
        {[0, 1, 2, 3, 4].map((i) => (
          <Bloco key={i} p={[Math.cos((i * 2 * Math.PI) / 5) * 0.2, 0.06, Math.sin((i * 2 * Math.PI) / 5) * 0.2]} s={[0.36, 0.04, 0.05]} rot={[0, (-i * 2 * Math.PI) / 5, 0]} cor="#222" />
        ))}
      </group>

      {/* Vyce sentado, mãos no teclado e no mouse */}
      <Mascote3D
        pos={[0.06, -0.31, 0]}
        giro={Math.PI / 2}
        pose={{
          pernaE: -1.45,
          pernaD: -1.45,
          joelhoE: 1.4,
          joelhoD: 1.4,
          tronco: 0.12,
          bracoE: [-0.95 + digita, 0, -0.15],
          cotoveloE: 0.75,
          bracoD: [-0.9 + mouse, 0, 0.12],
          cotoveloD: 0.7,
          cabeca: [0.05 + 0.03 * Math.sin(t * 3), -0.95 * olhaCamera + 0.05 * Math.sin(t * 1.3), 0],
        }}
        boca={boca}
        pisca={pisca}
        olhar={-0.6 * olhaCamera}
      />

      {/* mesa */}
      <Bloco p={[0.75, 0.74, 0.1]} s={[0.7, 0.05, 1.7]} cor="#231638" rug={0.4} met={0.3} />
      <mesh position={[0.41, 0.716, 0.1]}>
        <boxGeometry args={[0.012, 0.012, 1.7]} />
        <meshStandardMaterial color={ROXO} emissive={ROXO} emissiveIntensity={3} />
      </mesh>
      {[-0.65, 0.85].map((z) => (
        <Bloco key={z} p={[0.75, 0.36, z]} s={[0.6, 0.72, 0.05]} cor="#1A1129" />
      ))}
      {/* teclado RGB e mouse */}
      <Bloco p={[0.55, 0.78, 0.0]} s={[0.17, 0.025, 0.46]} cor="#15101F" raio={0.008} />
      <mesh position={[0.55, 0.795, 0.0]}>
        <boxGeometry args={[0.14, 0.004, 0.42]} />
        <meshStandardMaterial color={ROSA} emissive={ROSA} emissiveIntensity={1.5 + Math.sin(t * 4) * 0.5} />
      </mesh>
      <Bloco p={[0.58 + mouse * 0.3, 0.785, 0.36]} s={[0.1, 0.035, 0.06]} cor="#15101F" raio={0.015} />
      <mesh position={[0.6, 0.7655, 0.36]}>
        <boxGeometry args={[0.3, 0.003, 0.26]} />
        <meshStandardMaterial color="#120c1c" />
      </mesh>
      {/* monitor com o trailer */}
      <group position={[0.98, 1.2, 0.05]} rotation={[0, -Math.PI / 2 + 0.85, 0]}>
        <Bloco p={[0, 0, 0]} s={[1.06, 0.62, 0.05]} cor="#0E0A16" raio={0.02} />
        <Tela />
        <mesh position={[0, 0, -0.03]}>
          <planeGeometry args={[1.2, 0.75]} />
          <meshBasicMaterial color={ROXO} transparent opacity={0.25} />
        </mesh>
      </group>
      <Bloco p={[0.98, 0.86, 0.05]} s={[0.05, 0.22, 0.05]} cor="#222" />
      <Bloco p={[0.98, 0.77, 0.05]} s={[0.22, 0.02, 0.18]} cor="#222" />
      {/* gabinete com vidro e RGB */}
      <group position={[0.95, 0.98, -0.62]}>
        <Bloco p={[0, 0, 0]} s={[0.42, 0.45, 0.2]} cor="#120C1E" raio={0.02} />
        <mesh position={[0, 0, 0.101]}>
          <planeGeometry args={[0.36, 0.38]} />
          <meshStandardMaterial color={ROXO} emissive={ROXO} emissiveIntensity={0.9 + 0.3 * Math.sin(t * 2)} transparent opacity={0.85} />
        </mesh>
        {[-0.1, 0.0, 0.1].map((y) => (
          <mesh key={y} position={[0.08, y, 0.104]}>
            <circleGeometry args={[0.045, 24]} />
            <meshStandardMaterial color={ROSA} emissive={ROSA} emissiveIntensity={2.2} />
          </mesh>
        ))}
      </group>
      {/* luzes da cena */}
      <hemisphereLight args={["#8A6BD8", "#120A20", 0.5]} />
      <directionalLight position={[-1.5, 3, 3]} intensity={2.2} color="#F2E6FF" castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0003} />
      <pointLight position={[0.8, 1.3, 0.6]} intensity={4} color="#9FB4FF" distance={2.5} />
      <pointLight position={[1.8, 1.4, -0.6]} intensity={8} color={ROSA} distance={5} />
      <pointLight position={[-1.2, 1.2, 0.8]} intensity={6} color="#5B6CFF" distance={5} />
    </group>
  );
};
