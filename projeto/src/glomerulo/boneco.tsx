import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { useVideoConfig } from "remotion";
import type { V3 } from "./tempo";

// Bonecos de brinquedo: cabeça redonda grande, olhos de bolinha, bochecha rosada, corpo de
// cilindro, perninhas e bracinhos curtos. Tudo em cor chapada e fosca.

export type Visual = {
  pele: string;
  cabelo: string;
  roupa: string;
  calca: string;
  penteado?: "curto" | "coque" | "longo" | "careca";
  jaleco?: boolean;
  oculos?: boolean;
};

export const LUCAS: Visual = { pele: "#f0c49a", cabelo: "#5b3a24", roupa: "#ffd34d", calca: "#3d5a99", penteado: "curto" };
export const MAE: Visual = { pele: "#e7b48a", cabelo: "#6b4126", roupa: "#b48ae0", calca: "#2b2b3a", penteado: "longo" };
export const MEDICA: Visual = { pele: "#c98d63", cabelo: "#2a1a12", roupa: "#7fc6e8", calca: "#2f3d58", penteado: "coque", jaleco: true, oculos: true };
const PELES = ["#f3d2b3", "#e7b48a", "#c98d63", "#9a6440", "#6e4529", "#f0c49a"];
const CABELOS = ["#2a1a12", "#5b3a24", "#111111", "#8a5a2b", "#d9a54a"];
const ROUPAS = ["#ff8a80", "#7fc6e8", "#ffd34d", "#9be08a", "#b48ae0", "#ffb36b", "#f28ab2"];
export const crianca = (i: number): Visual => ({
  pele: PELES[(i * 7) % PELES.length],
  cabelo: CABELOS[(i * 5) % CABELOS.length],
  roupa: ROUPAS[(i * 3) % ROUPAS.length],
  calca: ["#3d5a99", "#2b2b3a", "#5a6b7d"][i % 3],
  penteado: (["curto", "coque", "longo", "curto"] as const)[(i * 11) % 4],
});

export type Rosto = "feliz" | "triste" | "espanto" | "serio";

const Fosco: React.FC<{ cor: string; brilho?: number }> = ({ cor, brilho = 0 }) => (
  <meshStandardMaterial color={cor} roughness={0.85} metalness={0} emissive={cor} emissiveIntensity={brilho} />
);

// meia-lua de boca (sorriso para cima, tristeza para baixo)
const Boca: React.FC<{ rosto: Rosto; fala: number }> = ({ rosto, fala }) => {
  if (rosto === "espanto" || fala > 0.15)
    return (
      <mesh position={[0, -0.1, 0.312]} scale={[1, 0.7 + (rosto === "espanto" ? 0.6 : fala * 0.9), 0.4]}>
        <sphereGeometry args={[0.055, 20, 12]} />
        <Fosco cor="#5a1f1f" />
      </mesh>
    );
  const triste = rosto === "triste";
  const serio = rosto === "serio";
  return (
    <mesh position={[0, triste ? -0.14 : -0.085, 0.305]} rotation={[0, 0, triste ? 0 : Math.PI]} scale={[1, serio ? 0.25 : 1, 1]}>
      <torusGeometry args={[0.065, 0.016, 8, 24, Math.PI]} />
      <Fosco cor="#4a1d1d" />
    </mesh>
  );
};

export const Cabeca: React.FC<{ v: Visual; rosto: Rosto; fala?: number; piscar?: boolean; inchado?: number }> = ({ v, rosto, fala = 0, piscar, inchado = 0 }) => (
  <group>
    <mesh castShadow>
      <sphereGeometry args={[0.33, 40, 28]} />
      <Fosco cor={v.pele} />
    </mesh>
    {/* cabelo: calota por cima e por trás */}
    {v.penteado !== "careca" && (
      <mesh rotation={[-0.45, 0, 0]} castShadow>
        <sphereGeometry args={[0.345, 36, 20, 0, Math.PI * 2, 0, v.penteado === "longo" ? 1.55 : 1.15]} />
        <Fosco cor={v.cabelo} />
      </mesh>
    )}
    {v.penteado === "coque" && (
      <mesh position={[0, 0.36, -0.12]} castShadow>
        <sphereGeometry args={[0.13, 20, 14]} />
        <Fosco cor={v.cabelo} />
      </mesh>
    )}
    {v.penteado === "longo" && (
      <mesh position={[0, -0.18, -0.12]} scale={[1.05, 1.2, 0.8]} castShadow>
        <sphereGeometry args={[0.3, 24, 16]} />
        <Fosco cor={v.cabelo} />
      </mesh>
    )}
    {/* olhos de bolinha com brilho */}
    {[-1, 1].map((l) => (
      <group key={l} position={[l * 0.11, 0.03, 0.3]} scale={[1, piscar ? 0.12 : 1, 1]}>
        <mesh>
          <sphereGeometry args={[0.042, 16, 12]} />
          <meshStandardMaterial color="#1b1410" roughness={0.3} />
        </mesh>
        <mesh position={[0.012, 0.014, 0.035]}>
          <sphereGeometry args={[0.012, 8, 6]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>
    ))}
    {/* pálpebras inchadas (edema periorbital) */}
    {inchado > 0 &&
      [-1, 1].map((l) => (
        <mesh key={l} position={[l * 0.11, -0.035, 0.29]} scale={[1.3 * inchado, 0.55 * inchado, 0.6 * inchado]}>
          <sphereGeometry args={[0.06, 16, 10]} />
          <Fosco cor="#e9a3a0" />
        </mesh>
      ))}
    {/* sobrancelhas */}
    {[-1, 1].map((l) => (
      <mesh key={l} position={[l * 0.11, 0.12 + (rosto === "espanto" ? 0.03 : 0), 0.3]} rotation={[0, 0, (rosto === "triste" ? -0.35 : rosto === "serio" ? 0.25 : 0) * l]}>
        <boxGeometry args={[0.08, 0.018, 0.02]} />
        <Fosco cor="#2a1a12" />
      </mesh>
    ))}
    {/* bochechas */}
    {[-1, 1].map((l) => (
      <mesh key={l} position={[l * 0.21, -0.07, 0.24]} scale={[1, 0.75, 0.4]}>
        <sphereGeometry args={[0.06, 16, 10]} />
        <Fosco cor="#f28c8c" />
      </mesh>
    ))}
    <Boca rosto={rosto} fala={fala} />
    {v.oculos &&
      [-1, 1].map((l) => (
        <mesh key={l} position={[l * 0.11, 0.03, 0.33]}>
          <torusGeometry args={[0.072, 0.012, 8, 24]} />
          <meshStandardMaterial color="#1b1b1b" roughness={0.4} />
        </mesh>
      ))}
  </group>
);

const Membro: React.FC<{ cor: string; comp: number; raio: number }> = ({ cor, comp, raio }) => (
  <mesh position={[0, -comp / 2, 0]} castShadow>
    <capsuleGeometry args={[raio, comp - raio * 2, 6, 12]} />
    <Fosco cor={cor} />
  </mesh>
);

export const Boneco: React.FC<{
  v: Visual;
  pos?: V3;
  giro?: number;
  escala?: number;
  rosto?: Rosto;
  fala?: number; // 0..1 abertura da boca
  t?: number; // segundos (para piscar / respirar)
  acena?: boolean;
  pula?: number; // 0..1 altura do pulo
  inchado?: number; // 0..1 inchaço do corpo
  olhoInchado?: number;
  bracos?: [number, number]; // ângulo dos braços (para cima/frente)
  simples?: boolean; // versão leve para multidões
  cabeca?: [number, number];
}> = ({ v, pos = [0, 0, 0], giro = 0, escala = 1, rosto = "feliz", fala = 0, t = 0, acena, pula = 0, inchado = 0, olhoInchado = 0, bracos = [0, 0], simples, cabeca = [0, 0] }) => {
  const piscar = (t + pos[0] * 0.7) % 3.4 < 0.12;
  const resp = 1 + Math.sin(t * 2.4 + pos[0]) * 0.015;
  const larg = 1 + inchado * 0.35;
  const aceno = 2.5 + Math.sin(t * 12) * 0.3;
  const corpo = v.jaleco ? "#f6f7f9" : v.roupa;
  if (simples)
    return (
      <group position={[pos[0], pos[1] + pula * 0.3, pos[2]]} rotation={[0, giro, 0]} scale={escala}>
        <mesh position={[0, 0.42, 0]}>
          <cylinderGeometry args={[0.2, 0.23, 0.6, 12]} />
          <Fosco cor={corpo} />
        </mesh>
        <mesh position={[0, 0.98, 0]}>
          <sphereGeometry args={[0.3, 14, 10]} />
          <Fosco cor={v.pele} />
        </mesh>
        <mesh position={[0, 1.02, -0.02]} rotation={[-0.45, 0, 0]}>
          <sphereGeometry args={[0.315, 14, 8, 0, Math.PI * 2, 0, 1.15]} />
          <Fosco cor={v.cabelo} />
        </mesh>
        {[-1, 1].map((l) => (
          <mesh key={l} position={[l * 0.1, 1.0, 0.28]}>
            <sphereGeometry args={[0.035, 8, 6]} />
            <meshBasicMaterial color="#1b1410" />
          </mesh>
        ))}
      </group>
    );
  return (
    <group position={[pos[0], pos[1] + pula * 0.35, pos[2]]} rotation={[0, giro, 0]} scale={escala}>
      {/* pernas */}
      {[-1, 1].map((l) => (
        <group key={l} position={[l * 0.11, 0.42, 0]}>
          <Membro cor={v.calca} comp={0.42} raio={0.085} />
          <mesh position={[0, -0.4, 0.04]} castShadow>
            <boxGeometry args={[0.15, 0.07, 0.22]} />
            <Fosco cor="#2a2a2a" />
          </mesh>
        </group>
      ))}
      {/* corpo */}
      <mesh position={[0, 0.74, 0]} scale={[larg * resp, 1, larg * resp]} castShadow>
        <cylinderGeometry args={[0.23, 0.26, 0.6, 28]} />
        <Fosco cor={corpo} />
      </mesh>
      {v.jaleco && (
        <>
          <mesh position={[0, 0.8, 0.2]} scale={[1, 1, 0.5]}>
            <cylinderGeometry args={[0.1, 0.1, 0.48, 16]} />
            <Fosco cor={v.roupa} />
          </mesh>
          <mesh position={[0.12, 0.86, 0.235]}>
            <boxGeometry args={[0.08, 0.06, 0.02]} />
            <Fosco cor="#3a7bd5" />
          </mesh>
        </>
      )}
      {/* braços */}
      {[-1, 1].map((l) => (
        <group key={l} position={[l * (0.27 * larg), 0.98, 0]} rotation={[-bracos[0], 0, l * (l === 1 && acena ? aceno : 0.12 + bracos[1])]}>
          <Membro cor={corpo} comp={0.38} raio={0.065} />
          <mesh position={[0, -0.38, 0]}>
            <sphereGeometry args={[0.07, 12, 10]} />
            <Fosco cor={v.pele} />
          </mesh>
        </group>
      ))}
      <group position={[0, 1.36, 0]} rotation={[cabeca[0], cabeca[1], 0]}>
        <Cabeca v={v} rosto={rosto} fala={fala} piscar={piscar} inchado={olhoInchado} />
      </group>
    </group>
  );
};

// Câmera simples (posição e alvo)
export const Cam: React.FC<{ pos: V3; alvo: V3; fov?: number }> = ({ pos, alvo, fov = 35 }) => {
  const camera = useThree((st) => st.camera) as THREE.PerspectiveCamera;
  useLayoutEffect(() => {
    camera.position.set(...pos);
    camera.lookAt(...alvo);
    camera.fov = fov;
    camera.updateProjectionMatrix();
  });
  return null;
};

// Palco claro de desenho animado: luz do dia suave, sombra macia, cores vivas
export const Palco: React.FC<{ children: React.ReactNode; fundo?: string; sol?: V3 }> = ({ children, fundo = "#dff1f7", sol = [4, 9, 6] }) => {
  const { width, height } = useVideoConfig();
  return (
    <ThreeCanvas width={width} height={height} shadows camera={{ fov: 35, near: 0.05, far: 300 }} gl={{ toneMapping: THREE.NoToneMapping, antialias: true }} style={{ filter: "saturate(1.3) brightness(1.05) contrast(1.04)" }}>
      <color attach="background" args={[fundo]} />
      <hemisphereLight args={["#ffffff", "#c9d6e3", 1.55]} />
      <directionalLight position={sol} intensity={1.5} castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-12} shadow-camera-right={12} shadow-camera-top={12} shadow-camera-bottom={-12} shadow-radius={6} shadow-bias={-0.0005} />
      {children}
    </ThreeCanvas>
  );
};

// Textura desenhada em canvas 2D
export const useTextura = (l: number, a: number, desenho: (ctx: CanvasRenderingContext2D) => void, chave = "", repetir?: [number, number]) =>
  useMemo(() => {
    const c = document.createElement("canvas");
    c.width = l;
    c.height = a;
    desenho(c.getContext("2d")!);
    const tx = new THREE.CanvasTexture(c);
    tx.colorSpace = THREE.SRGBColorSpace;
    tx.anisotropy = 8;
    if (repetir) {
      tx.wrapS = tx.wrapT = THREE.RepeatWrapping;
      tx.repeat.set(...repetir);
    }
    return tx;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [l, a, chave]);

export const Caixa: React.FC<{ tam: V3; pos?: V3; rot?: V3; cor: string; sombra?: boolean }> = ({ tam, pos = [0, 0, 0], rot = [0, 0, 0], cor, sombra = true }) => (
  <mesh position={pos} rotation={rot} castShadow={sombra} receiveShadow>
    <boxGeometry args={tam} />
    <Fosco cor={cor} />
  </mesh>
);

export const Chao: React.FC<{ cor?: string; tam?: number; textura?: THREE.Texture }> = ({ cor = "#eef0f2", tam = 60, textura }) => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
    <planeGeometry args={[tam, tam]} />
    <meshStandardMaterial color={textura ? "#ffffff" : cor} map={textura ?? null} roughness={0.95} />
  </mesh>
);

export { Fosco };
