import { useLayoutEffect, useMemo } from "react";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  random,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const R = 1.6; // raio da Terra
const ACHATADO = 0.05;
const ease = Easing.inOut(Easing.cubic);

// Altura relativa da Terra: 1 = esfera, ACHATADO = disco
const escalaY = (f: number) =>
  f < 60
    ? 1
    : f < 120
      ? interpolate(f, [60, 120], [1, ACHATADO], { easing: ease })
      : f < 360
        ? ACHATADO
        : interpolate(f, [360, 420], [ACHATADO, 1], {
            easing: ease,
            extrapolateRight: "clamp",
          });

const TEXTOS: { de: number; ate: number; texto: string; grande?: boolean }[] = [
  { de: 0, ate: 60, texto: "E SE A TERRA FOSSE PLANA?", grande: true },
  { de: 120, ate: 210, texto: "Na borda, o “chão” viraria uma ladeira" },
  { de: 210, ate: 300, texto: "O ar escaparia pelas bordas" },
  { de: 300, ate: 360, texto: "Seria dia em todo lugar ao mesmo tempo" },
  { de: 360, ate: 420, texto: "A gravidade arredondaria tudo de volta" },
  { de: 420, ate: 450, texto: "Por isso ela é redonda 🌍" },
];

const Camera: React.FC<{ y: number; z: number }> = ({ y, z }) => {
  const camera = useThree((s) => s.camera);
  useLayoutEffect(() => {
    camera.position.set(0, y, z);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera, y, z]);
  return null;
};

const Estrelas: React.FC = () => {
  const posicoes = useMemo(() => {
    const arr = new Float32Array(300 * 3);
    for (let i = 0; i < 300; i++) {
      const u = random(`estrela-u-${i}`) * 2 - 1;
      const a = random(`estrela-a-${i}`) * Math.PI * 2;
      const s = Math.sqrt(1 - u * u);
      arr[i * 3] = Math.cos(a) * s * 25;
      arr[i * 3 + 1] = u * 25;
      arr[i * 3 + 2] = Math.sin(a) * s * 25;
    }
    return arr;
  }, []);
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[posicoes, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#ffffff" size={0.12} sizeAttenuation />
    </points>
  );
};

const Terra: React.FC<{ rotY: number; scaleY: number }> = ({ rotY, scaleY }) => {
  const geo = useMemo(() => {
    const g = new THREE.SphereGeometry(R, 192, 192);
    const pos = g.attributes.position;
    const cores = new Float32Array(pos.count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i) / R;
      const y = pos.getY(i) / R;
      const z = pos.getZ(i) / R;
      const v =
        Math.sin(x * 3.1 + 1) * Math.cos(y * 2.7) +
        Math.sin(z * 3.7 + 2) * Math.cos(x * 2.3) +
        Math.sin(y * 4 + z * 2) * 0.5;
      if (Math.abs(y) > 0.96) c.set("#f2f8ff");
      else if (v > 0.45) c.set("#3f9b4a");
      else if (v > 0.3) c.set("#c8b56a");
      else c.set("#1e6fd0");
      cores[i * 3] = c.r;
      cores[i * 3 + 1] = c.g;
      cores[i * 3 + 2] = c.b;
    }
    g.setAttribute("color", new THREE.BufferAttribute(cores, 3));
    return g;
  }, []);

  return (
    <mesh geometry={geo} rotation={[0, rotY, 0]} scale={[1, scaleY, 1]}>
      <meshStandardMaterial vertexColors />
    </mesh>
  );
};

// Pés do bonequinho na origem do grupo; o corpo sobe a partir dali
const Boneco: React.FC<{
  posicao: [number, number, number];
  inclinacao: number;
  escala: number;
  cor: string;
}> = ({ posicao, inclinacao, escala, cor }) => {
  if (escala <= 0.001) return null;
  return (
    <group position={posicao} rotation={[0, 0, inclinacao]} scale={escala}>
      <group position={[0, 0.65, 0]}>
        <mesh>
          <capsuleGeometry args={[0.3, 0.7, 8, 16]} />
          <meshStandardMaterial color={cor} />
        </mesh>
        <mesh position={[0, 0.85, 0]}>
          <sphereGeometry args={[0.28, 24, 24]} />
          <meshStandardMaterial color="#ffe0b2" />
        </mesh>
      </group>
    </group>
  );
};

// Seta que aponta para o centro do disco (para -x)
const SetaGravidade: React.FC<{
  posicao: [number, number, number];
  escala: number;
}> = ({ posicao, escala }) => {
  if (escala <= 0.001) return null;
  return (
    <group position={posicao} scale={escala}>
      <mesh position={[-0.35, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 0.7, 12]} />
        <meshStandardMaterial color="#ff3b30" emissive="#ff3b30" emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[-0.82, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.12, 0.25, 16]} />
        <meshStandardMaterial color="#ff3b30" emissive="#ff3b30" emissiveIntensity={0.4} />
      </mesh>
    </group>
  );
};

const N_PARTICULAS = 150;

const Atmosfera: React.FC<{ frame: number; topo: number }> = ({ frame, topo }) => {
  const base = useMemo(
    () =>
      Array.from({ length: N_PARTICULAS }, (_, i) => ({
        ang: random(`p-ang-${i}`) * Math.PI * 2,
        r0: Math.sqrt(random(`p-r-${i}`)) * (R - 0.1),
        alt: 0.08 + random(`p-alt-${i}`) * 0.3,
        vel: 0.5 + random(`p-vel-${i}`) * 0.6,
      })),
    [],
  );

  const opacidade = interpolate(frame, [190, 210, 285, 300], [0, 0.9, 0.9, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (opacidade <= 0) return null;

  const t = Math.max(0, frame - 210) / 30;
  const arr = new Float32Array(N_PARTICULAS * 3);
  base.forEach((p, i) => {
    const r = p.r0 + p.vel * t;
    const tBorda = (R - p.r0) / p.vel;
    const queda = t > tBorda ? 2.5 * (t - tBorda) ** 2 : 0;
    arr[i * 3] = Math.cos(p.ang) * r;
    arr[i * 3 + 1] = topo + p.alt - queda;
    arr[i * 3 + 2] = Math.sin(p.ang) * r;
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[arr, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#7ec8ff"
        size={0.07}
        sizeAttenuation
        transparent
        opacity={opacidade}
      />
    </points>
  );
};

export const TerraPlana: React.FC<{ mostrarTitulo?: boolean }> = ({
  mostrarTitulo = true,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const scaleY = escalaY(frame);
  const topo = R * scaleY;
  // Gira só enquanto é esfera; continua de onde parou
  const rotY = 0.02 * (Math.min(frame, 120) + Math.max(0, frame - 360));

  const camY = interpolate(frame, [60, 120, 360, 420], [0.8, 5.5, 5.5, 0.8], {
    easing: ease,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const camZ = interpolate(frame, [60, 120, 360, 420], [8, 7, 7, 8], {
    easing: ease,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const escalaBonecos =
    interpolate(frame, [120, 140, 340, 360], [0, 0.4, 0.4, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }) || 0;
  const escalaSeta = interpolate(frame, [150, 165, 300, 315], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const escalaSol = interpolate(frame, [300, 320, 405, 420], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const luzSol = interpolate(frame, [290, 330], [0.8, 2.8], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{ background: "linear-gradient(180deg, #02030a 0%, #0b1330 100%)" }}
      />
      <ThreeCanvas width={width} height={height} camera={{ fov: 50 }}>
        <Camera y={camY} z={camZ} />
        <ambientLight intensity={0.35} />
        <directionalLight position={[-5, 4, 3]} intensity={luzSol} />
        <Estrelas />
        <Terra rotY={rotY} scaleY={scaleY} />
        <Boneco
          posicao={[0, topo, 0]}
          inclinacao={0}
          escala={escalaBonecos}
          cor="#ff7043"
        />
        <Boneco
          posicao={[R - 0.35, topo, 0]}
          inclinacao={0.6}
          escala={escalaBonecos}
          cor="#ffca28"
        />
        <SetaGravidade posicao={[R - 0.45, topo + 0.8, 0]} escala={escalaSeta} />
        <Atmosfera frame={frame} topo={topo} />
        <mesh position={[-1.9, 0.6, -2.5]} scale={escalaSol}>
          <sphereGeometry args={[0.45, 32, 32]} />
          <meshBasicMaterial color="#ffe27a" />
        </mesh>
      </ThreeCanvas>

      {TEXTOS.filter((t) => mostrarTitulo || !t.grande).map((t) => {
        const opacidade = interpolate(
          frame,
          [t.de, t.de + 8, t.ate - 8, t.ate],
          [0, 1, 1, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );
        if (opacidade <= 0) return null;
        return (
          <div
            key={t.texto}
            style={{
              position: "absolute",
              top: 130,
              left: 40,
              right: 40,
              textAlign: "center",
              color: "white",
              fontFamily: "Arial, 'Segoe UI Emoji', sans-serif",
              fontWeight: 900,
              fontSize: t.grande ? 104 : 68,
              lineHeight: 1.1,
              textShadow: "0 4px 24px rgba(0,0,0,0.8)",
              opacity: opacidade,
            }}
          >
            {t.texto}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
