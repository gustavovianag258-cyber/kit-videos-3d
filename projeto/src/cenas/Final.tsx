import { useMemo } from "react";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { DiscoTerra } from "../DiscoTerra";
import { CENAS, clamp, type Vec3 } from "../roteiro";
import { CameraControlada, criarBrilho, Estrelas } from "./comum";

// Cena 5: "Será que conseguiríamos sobreviver nesse mundo?"
// A câmera se afasta rápido e revela o disco inteiro no espaço,
// com o Sol iluminando só uma parte.

const DURACAO = CENAS.cartaz - CENAS.final;
const DIST_INICIAL = 26000;
const DIST_FINAL = 95000;
const SOL: Vec3 = [-32000, 3500, -115000];

export const Final: React.FC = () => {
  const t = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const brilho = useMemo(() => criarBrilho("rgba(255,214,140,1)"), []);
  const alvoLuz = useMemo(() => {
    const o = new THREE.Object3D();
    o.position.set(-13000, 0, -9000);
    return o;
  }, []);

  // Afastamento rápido no começo, desacelerando no fim
  const e = interpolate(t, [0, DURACAO], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const dist = DIST_INICIAL * Math.pow(DIST_FINAL / DIST_INICIAL, e);
  const elev = interpolate(e, [0, 1], [0.75, 0.56]);
  const az = interpolate(e, [0, 1], [0.35, 0]);
  const posicao: Vec3 = [
    dist * Math.cos(elev) * Math.sin(az),
    dist * Math.sin(elev),
    dist * Math.cos(elev) * Math.cos(az),
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: "#000005" }}>
      <ThreeCanvas
        width={width}
        height={height}
        gl={{ logarithmicDepthBuffer: true }}
        camera={{ fov: 50, near: 1, far: 3e6 }}
      >
        <CameraControlada posicao={posicao} alvo={[0, 0, 0]} />
        <hemisphereLight args={["#3a4a70", "#05060a", 0.5]} />
        {/* Luz do Sol em cone: ilumina um lado do disco, o resto fica na sombra */}
        <primitive object={alvoLuz} />
        <spotLight
          position={[-60000, 45000, -30000]}
          target={alvoLuz}
          color="#fff0d8"
          intensity={4}
          decay={0}
          angle={0.2}
          penumbra={1}
        />
        <Estrelas raio={1e6} quantidade={2500} />
        <DiscoTerra comNuvens={false} />
        {/* Sol visível com brilho */}
        <mesh position={SOL}>
          <sphereGeometry args={[4500, 32, 32]} />
          <meshBasicMaterial color="#fff4c2" toneMapped={false} />
        </mesh>
        <sprite position={SOL} scale={[60000, 60000, 1]}>
          <spriteMaterial
            map={brilho}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </sprite>
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
