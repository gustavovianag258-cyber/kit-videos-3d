import { RoundedBox } from "@react-three/drei";
import { useMemo } from "react";
import { Cabeca, CeuNoite, CidadeNoite, Cx, entre, Luzinha, Ondulacao, rnd, type Roupa, texturaCanvas } from "./pecas";
import { CamTrajeto, type Chave, Palco } from "./palco";
import type { V3 } from "./tempo";

// MEU QUARTO (início, mergulho de volta e o acordar). Quarto à noite num prédio alto: janelão de
// 3 folhas para a avenida iluminada, cortinas com pisca-pisca, luminária de ripas, gato laranja no
// parapeito, cama com manta verde listrada e você dormindo.
export const EU: Roupa = { pele: "#c99f7a", cabelo: "#2a1d16", camisa: "#2d4f9c", calca: "#2d4f9c", penteado: "curto", barba: true };

const JANELA_Z = -3.5;
const PAREDE_X = -2.0;
const CABECA: V3 = [0, 0.74, -0.08];

const Janela: React.FC<{ s: number }> = ({ s }) => {
  const xs = [-1.2, -0.37, 0.53, 1.4];
  return (
    <group>
      {/* moldura preta: 4 montantes, travessa de cima, bandeira e base */}
      {xs.map((x, i) => (
        <Cx key={i} t={[0.07, 1.62, 0.1]} p={[x, 1.74, JANELA_Z]} c="#16171b" rug={0.5} />
      ))}
      <Cx t={[2.7, 0.08, 0.1]} p={[0.1, 2.55, JANELA_Z]} c="#16171b" rug={0.5} />
      <Cx t={[2.7, 0.06, 0.1]} p={[0.1, 2.18, JANELA_Z]} c="#16171b" rug={0.5} />
      <Cx t={[2.7, 0.07, 0.1]} p={[0.1, 0.95, JANELA_Z]} c="#16171b" rug={0.5} />
      {/* parede em volta da janela */}
      <Cx t={[1.0, 2.7, 0.2]} p={[-1.75, 1.35, JANELA_Z - 0.05]} c="#6f6670" />
      <Cx t={[1.0, 2.7, 0.2]} p={[1.95, 1.35, JANELA_Z - 0.05]} c="#6f6670" />
      <Cx t={[2.7, 0.92, 0.2]} p={[0.1, 0.46, JANELA_Z - 0.05]} c="#6f6670" />
      <Cx t={[2.7, 0.14, 0.2]} p={[0.1, 2.66, JANELA_Z - 0.05]} c="#6f6670" />
      {/* parapeito largo com as coisinhas */}
      <Cx t={[3.1, 0.06, 0.34]} p={[0.1, 0.94, JANELA_Z + 0.16]} c="#e8e4dc" />
      <Vaso p={[-1.05, 0.97, JANELA_Z + 0.17]} alto />
      <group position={[-0.72, 0.97, JANELA_Z + 0.17]}>
        <Cx t={[0.3, 0.05, 0.2]} p={[0, 0.025, 0]} c="#4e7a8a" />
        <Cx t={[0.28, 0.045, 0.19]} p={[0, 0.07, 0]} c="#e8d7b5" />
        <Cx t={[0.08, 0.1, 0.08]} p={[0, 0.14, 0]} c="#f4ead6" />
        <Luzinha p={[0, 0.22, 0]} tam={0.018} cor="#ffb347" forca={5} />
        <pointLight position={[0, 0.3, 0.1]} color="#ffae5a" intensity={0.6} distance={2.2} decay={2} />
      </group>
      <Vaso p={[-0.15, 0.97, JANELA_Z + 0.17]} />
      <GatoLaranja p={[0.95, 0.97, JANELA_Z + 0.17]} s={s} />
      <Vaso p={[1.35, 0.97, JANELA_Z + 0.17]} />
      {/* bandô e cortinas com pisca-pisca */}
      <Cortina x={-1.55} s={s} />
      <Cortina x={1.75} s={s} />
      <Varal s={s} />
    </group>
  );
};

const Vaso: React.FC<{ p: V3; alto?: boolean }> = ({ p, alto }) => (
  <group position={p}>
    <Cx t={[0.18, 0.16, 0.18]} p={[0, 0.08, 0]} c="#b5603e" />
    {Array.from({ length: alto ? 7 : 5 }).map((_, i) => (
      <Cx
        key={i}
        t={[0.035, alto ? 0.5 + rnd(`vs${i}`) * 0.25 : 0.18, 0.035]}
        p={[(rnd(`vx${i}${p[0]}`) - 0.5) * 0.12, alto ? 0.42 : 0.24, (rnd(`vz${i}${p[0]}`) - 0.5) * 0.1]}
        r={[(rnd(`vr${i}`) - 0.5) * 0.4, 0, (rnd(`vq${i}`) - 0.5) * 0.4]}
        c={i % 2 ? "#4f8f46" : "#3f7a3a"}
      />
    ))}
  </group>
);

const GatoLaranja: React.FC<{ p: V3; s: number }> = ({ p, s }) => (
  <group position={p} rotation={[0, -0.7, 0]} scale={0.62}>
    <Cx t={[0.26, 0.2, 0.36]} p={[0, 0.1, 0]} c="#e6a04e" />
    <Cx t={[0.2, 0.28, 0.2]} p={[0, 0.3, 0.08]} c="#e6a04e" />
    <Cx t={[0.12, 0.2, 0.02]} p={[0, 0.28, 0.185]} c="#f6dcb8" />
    <group position={[0, 0.52, 0.1]} rotation={[0, Math.sin(s * 0.6) * 0.2, 0]}>
      <Cx t={[0.21, 0.17, 0.17]} c="#eaa452" />
      <Cx t={[0.055, 0.075, 0.04]} p={[-0.065, 0.115, 0]} c="#c8792c" />
      <Cx t={[0.055, 0.075, 0.04]} p={[0.065, 0.115, 0]} c="#c8792c" />
      <Cx t={[0.1, 0.06, 0.02]} p={[0, -0.04, 0.09]} c="#f6dcb8" />
      <Cx t={[0.03, 0.035, 0.01]} p={[-0.05, 0.02, 0.087]} c="#1a1a1a" />
      <Cx t={[0.03, 0.035, 0.01]} p={[0.05, 0.02, 0.087]} c="#1a1a1a" />
    </group>
    <Cx t={[0.06, 0.06, 0.34]} p={[0.12, 0.04, -0.12]} r={[0, 0.5, 0]} c="#c8792c" />
  </group>
);

const Cortina: React.FC<{ x: number; s: number }> = ({ x, s }) => (
  <group position={[x, 0, JANELA_Z + 0.25]}>
    {Array.from({ length: 6 }).map((_, i) => (
      <Cx key={i} t={[0.085, 2.6, 0.07]} p={[-0.22 + i * 0.085, 1.33, (i % 2) * 0.05]} c={i % 2 ? "#d9d4d6" : "#c9c3c7"} rug={0.95} />
    ))}
    {/* fios de luz descendo pela cortina */}
    {[-0.16, 0.0, 0.16].map((fx, j) =>
      Array.from({ length: 16 }).map((_, i) => (
        <Luzinha key={`${j}-${i}`} p={[fx, 0.35 + i * 0.145, 0.09]} tam={0.014} cor="#ffe2a8" forca={2.6 + Math.sin(s * 3 + i + j * 2) * 0.6} />
      )),
    )}
  </group>
);

// guirlanda de luzinhas em ondas por cima da janela
const Varal: React.FC<{ s: number }> = ({ s }) => {
  const pts: V3[] = [];
  for (let i = 0; i <= 60; i++) {
    const u = i / 60;
    const x = -1.9 + u * 4.0;
    const y = 2.62 - Math.abs(Math.sin(u * Math.PI * 4)) * 0.12;
    pts.push([x, y, JANELA_Z + 0.32]);
  }
  return (
    <group>
      {pts.map((p, i) => (
        <Luzinha key={i} p={p} tam={0.014} cor="#ffe6b0" forca={2.6 + Math.sin(s * 2.4 + i * 0.7) * 0.5} />
      ))}
    </group>
  );
};

const Luminaria: React.FC = () => (
  <group position={[-1.1, 2.18, -2.55]}>
    <Cx t={[0.01, 0.5, 0.01]} p={[0, 0.3, 0]} c="#222" />
    {Array.from({ length: 10 }).map((_, i) => {
      const a = (i / 10) * Math.PI * 2;
      return <Cx key={i} t={[0.045, 0.3, 0.02]} p={[Math.cos(a) * 0.15, 0, Math.sin(a) * 0.15]} r={[0, -a, 0]} c="#c79a4a" e="#ffb347" ei={0.25} />;
    })}
    <Luzinha p={[0, -0.02, 0]} tam={0.06} cor="#ffcf7a" forca={2.2} />
    <pointLight position={[0, -0.1, 0]} color="#ffc27a" intensity={1.3} distance={6} decay={1.6} castShadow />
  </group>
);

const Cama: React.FC = () => {
  const manta = useMemo(
    () =>
      texturaCanvas(256, 256, (g) => {
        g.fillStyle = "#8ea69a";
        g.fillRect(0, 0, 256, 256);
        g.fillStyle = "#e9efe9";
        for (let x = 0; x < 256; x += 64) {
          g.fillRect(x + 20, 0, 6, 256);
          g.fillRect(x + 34, 0, 3, 256);
        }
      }, [2, 3]),
    [],
  );
  return (
    <group>
      {/* estrutura e colchão */}
      <Cx t={[1.8, 0.35, 2.3]} p={[0, 0.18, -0.85]} c="#7a5236" />
      <Cx t={[1.72, 0.22, 2.2]} p={[0, 0.46, -0.85]} c="#f2efe8" />
      {/* cabeceira */}
      <Cx t={[1.9, 1.1, 0.1]} p={[0, 0.75, 0.32]} c="#c98b5a" />
      {/* travesseiros */}
      <RoundedBox args={[0.62, 0.16, 0.42]} radius={0.07} position={[-0.38, 0.64, 0.02]}>
        <meshStandardMaterial color="#e9e7ee" roughness={0.9} />
      </RoundedBox>
      <RoundedBox args={[0.62, 0.16, 0.42]} radius={0.07} position={[0.38, 0.64, 0.02]}>
        <meshStandardMaterial color="#e2dfe8" roughness={0.9} />
      </RoundedBox>
      {/* manta: lençol liso + o volume do corpo e dos pés */}
      <RoundedBox args={[1.86, 0.1, 1.95]} radius={0.04} position={[0, 0.6, -1.0]} receiveShadow>
        <meshStandardMaterial map={manta} roughness={0.95} />
      </RoundedBox>
      <RoundedBox args={[0.62, 0.26, 1.55]} radius={0.12} smoothness={5} position={[0, 0.7, -0.98]} castShadow receiveShadow>
        <meshStandardMaterial map={manta} roughness={0.95} />
      </RoundedBox>
      <RoundedBox args={[0.5, 0.3, 0.3]} radius={0.12} smoothness={5} position={[0, 0.74, -1.72]} castShadow receiveShadow>
        <meshStandardMaterial map={manta} roughness={0.95} />
      </RoundedBox>
    </group>
  );
};

// você, dormindo: só a cabeça aparece (o resto está debaixo da manta)
const Dormindo: React.FC = () => (
  <group position={CABECA} rotation={[0, Math.PI, 0]}>
    <group rotation={[-Math.PI / 2, 0, 0]}>
      <Cabeca r={EU} rosto="dormindo" tam={0.4} />
    </group>
  </group>
);

const ParedeLateral: React.FC = () => {
  const quadro = useMemo(
    () =>
      texturaCanvas(128, 160, (g) => {
        g.fillStyle = "#f3efe8";
        g.fillRect(0, 0, 128, 160);
        const cores = ["#e7a4a6", "#9fc8b2", "#e6c58f", "#a8b8de"];
        cores.forEach((c, i) => {
          g.fillStyle = c;
          g.fillRect(18, 30 + i * 26, 92, 18);
        });
      }),
    [],
  );
  const livros = ["#2f5d8a", "#e7e2d6", "#d8c6a5", "#3d7a5b", "#9a3b3b", "#e0d8c8", "#4a4a6a", "#c9b27c"];
  return (
    <group>
      <Cx t={[0.24, 2.7, 4.4]} p={[PAREDE_X - 0.12, 1.35, -1.35]} c="#7b7178" />
      {/* prateleira de madeira com livros, vela e hera */}
      <Cx t={[0.3, 0.045, 1.5]} p={[PAREDE_X + 0.15, 1.95, -1.2]} c="#9a6a3c" />
      {livros.map((c, i) => (
        <Cx key={i} t={[0.2, 0.24 + (i % 3) * 0.03, 0.06]} p={[PAREDE_X + 0.13, 2.1 + (i % 3) * 0.015, -1.85 + i * 0.068]} c={c} />
      ))}
      <Cx t={[0.09, 0.12, 0.09]} p={[PAREDE_X + 0.15, 2.04, -1.12]} c="#f1e6d0" />
      <Luzinha p={[PAREDE_X + 0.15, 2.13, -1.12]} tam={0.015} cor="#ffb347" forca={5} />
      <pointLight position={[PAREDE_X + 0.3, 2.2, -1.12]} color="#ffae5a" intensity={0.5} distance={2} decay={2} />
      <Cx t={[0.18, 0.14, 0.16]} p={[PAREDE_X + 0.14, 2.05, -0.7]} c="#d6d0c4" />
      {Array.from({ length: 9 }).map((_, i) => (
        <Cx key={i} t={[0.03, 0.05, 0.05]} p={[PAREDE_X + 0.25, 1.92 - i * 0.07, -0.68 + Math.sin(i) * 0.04]} r={[0, 0, 0.4]} c={i % 2 ? "#4f9a3c" : "#3f8a30"} />
      ))}
      {/* quadro e interruptor */}
      <mesh position={[PAREDE_X + 0.02, 1.25, -2.45]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.55, 0.7]} />
        <meshStandardMaterial map={quadro} roughness={0.8} />
      </mesh>
      <Cx t={[0.03, 0.76, 0.61]} p={[PAREDE_X + 0.005, 1.25, -2.45]} c="#7a5236" />
      <Cx t={[0.015, 0.07, 0.07]} p={[PAREDE_X + 0.008, 1.18, -1.2]} c="#f4f2ee" />
    </group>
  );
};

const Teto: React.FC = () => (
  <group>
    <Cx t={[4.4, 0.1, 4.6]} p={[0.1, 2.75, -1.4]} c="#d9d6de" />
    {/* placas geométricas do teto (só aparecem ao acordar, olhando para cima) */}
    <Cx t={[1.3, 0.01, 0.9]} p={[-0.75, 2.695, -0.7]} r={[0, 0.25, 0]} c="#b7c6d2" e="#b7c6d2" ei={0.25} sombra={false} />
    <Cx t={[1.3, 0.01, 0.9]} p={[0.95, 2.695, -0.7]} r={[0, -0.25, 0]} c="#b7c6d2" e="#b7c6d2" ei={0.25} sombra={false} />
    <Cx t={[0.7, 0.008, 0.35]} p={[-0.9, 2.69, -0.55]} r={[0, 0.25, 0]} c="#f0bfa4" e="#f0bfa4" ei={0.25} sombra={false} />
    <Cx t={[0.7, 0.008, 0.35]} p={[1.1, 2.69, -0.55]} r={[0, -0.25, 0]} c="#f0bfa4" e="#f0bfa4" ei={0.25} sombra={false} />
    <pointLight position={[0.1, 2.2, -1.0]} color="#dfe4ff" intensity={0.5} distance={3} decay={2} />
    {/* parede atrás da cama e piso */}
    <Cx t={[4.4, 2.7, 0.2]} p={[0.1, 1.35, 0.45]} c="#c98b5a" />
    <Cx t={[0.2, 2.7, 4.4]} p={[2.3, 1.35, -1.35]} c="#7b7178" />
    <Cx t={[4.4, 0.05, 4.4]} p={[0.1, -0.02, -1.35]} c="#7a4e33" />
    <Cx t={[1.6, 0.02, 1.0]} p={[1.2, 0.01, -2.6]} c="#efe6df" />
    {/* costela-de-adão no canto direito */}
    <group position={[2.0, 0, -3.0]}>
      <Cx t={[0.36, 0.38, 0.36]} p={[0, 0.19, 0]} c="#c46b3f" />
      {[0, 1, 2, 3].map((i) => (
        <group key={i} position={[0, 0.4, 0]} rotation={[0, i * 1.6, 0.5 + i * 0.12]}>
          <Cx t={[0.025, 1.3 + i * 0.15, 0.025]} p={[0, 0.65, 0]} c="#3b7a3a" />
          <Cx t={[0.55, 0.02, 0.4]} p={[0, 1.35 + i * 0.15, 0]} r={[0.3, 0, 0]} c="#3e8c45" />
        </group>
      ))}
    </group>
  </group>
);

// Câmera do quarto: deitado olhando a janela → vira e se vê dormindo → flutua até a parede e entra
const CAM_INICIO: Chave[] = [
  { t: 0, pos: [0, 1.32, -0.25], alvo: [0.1, 1.62, JANELA_Z], fov: 84 },
  { t: 3.45, pos: [0, 1.48, -0.55], alvo: [0.1, 1.68, JANELA_Z], fov: 84 },
];
const CAM_VIRA: Chave[] = [
  { t: 3.45, pos: [0, 1.48, -0.55], alvo: [0.1, 1.68, JANELA_Z], cima: [0, 1, 0], fov: 84 },
  { t: 3.95, pos: [0.25, 1.5, -0.62], alvo: [0, 0.72, -0.12], cima: [-0.25, 0, 1], fov: 70 },
  { t: 6.55, pos: [0.02, 1.95, -0.42], alvo: [0, 0.72, -0.1], cima: [0, 0, 1], fov: 62 },
];
const CAM_PAREDE: Chave[] = [
  { t: 6.55, pos: [0.02, 1.95, -0.42], alvo: [0, 0.72, -0.1], cima: [0, 0, 1], fov: 62 },
  { t: 6.95, pos: [-0.35, 1.62, -1.3], alvo: [PAREDE_X, 1.66, -1.5], cima: [0, 1, 0], fov: 74 },
  { t: 8.6, pos: [-0.95, 1.56, -1.45], alvo: [PAREDE_X, 1.55, -1.5], fov: 74 },
  { t: 10.25, pos: [-1.8, 1.5, -1.48], alvo: [PAREDE_X - 1, 1.48, -1.52], fov: 74 },
  { t: 10.62, pos: [-2.3, 1.48, -1.5], alvo: [PAREDE_X - 2, 1.48, -1.52], fov: 74 },
];
const CAM_MERGULHO: Chave[] = [
  { t: 66.4, pos: [0, 2.6, -0.2], alvo: CABECA, cima: [0, 0, 1], fov: 60 },
  { t: 67.07, pos: [0, 1.08, -0.1], alvo: CABECA, cima: [0, 0, 1], fov: 60 },
];
const CAM_ACORDA: Chave[] = [
  { t: 67.07, pos: [0, 1.05, -0.16], alvo: [0.05, 2.75, -1.25], fov: 84 },
  { t: 68.5, pos: [0, 1.1, -0.18], alvo: [0.05, 2.55, -1.8], fov: 84 },
  { t: 69.6, pos: [0, 1.25, -0.24], alvo: [0.1, 1.62, JANELA_Z], fov: 84 },
  { t: 74.7, pos: [0, 1.3, -0.32], alvo: [0.1, 1.66, JANELA_Z], fov: 84 },
];

export const CenaQuarto: React.FC<{ s: number }> = ({ s }) => {
  const acordado = s >= 67.07;
  const ch = s < 3.45 ? CAM_INICIO : s < 6.55 ? CAM_VIRA : s < 10.7 ? CAM_PAREDE : s < 67.07 ? CAM_MERGULHO : CAM_ACORDA;
  const tOnda = s - 8.45;
  return (
    <Palco ceu="noite" luzCeu={0.35} foco={2.5} desfoque={0.5} brilho={1.1} ao={1.2} raioAo={0.5}>
      <CamTrajeto ch={ch} s={s} balanco={acordado ? 0.3 : 1} />
      <hemisphereLight args={["#5a6fd6", "#2a1d1a", 0.55]} />
      <directionalLight position={[0.1, 2.0, -6]} intensity={0.9} color="#7f97ff" />
      <ambientLight intensity={0.12} color="#ffd9b0" />
      <CeuNoite />
      <CidadeNoite s={s} centro={[0.1, -62, -14]} />
      <Janela s={s} />
      <Luminaria />
      <Cama />
      <Dormindo />
      <ParedeLateral />
      <pointLight position={[-1.0, 1.9, -1.5]} color="#e9e4ff" intensity={0.55} distance={2.6} decay={2} />
      <Teto />
      {/* criado-mudo: abajur, celular com a tela acesa de notificação, despertador e copo d'água */}
      <group position={[-1.25, 0, 0.05]}>
        <Cx t={[0.5, 0.55, 0.42]} p={[0, 0.275, 0]} c="#8a5a3a" />
        <Cx t={[0.02, 0.12, 0.3]} p={[0.26, 0.38, 0]} c="#6b4428" />
        <Cx t={[0.12, 0.04, 0.12]} p={[-0.12, 0.57, -0.08]} c="#d8d2c6" />
        <Cx t={[0.03, 0.22, 0.03]} p={[-0.12, 0.69, -0.08]} c="#d8d2c6" />
        <mesh position={[-0.12, 0.84, -0.08]}>
          <cylinderGeometry args={[0.07, 0.11, 0.14, 12, 1, true]} />
          <meshStandardMaterial color="#efe3c8" side={2} />
        </mesh>
        <Cx t={[0.08, 0.008, 0.16]} p={[0.1, 0.556, 0.05]} c="#16171b" />
        <mesh position={[0.1, 0.562, 0.05]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.07, 0.14]} />
          <meshBasicMaterial color="#9fd0ff" toneMapped={false} />
        </mesh>
        <Cx t={[0.12, 0.07, 0.05]} p={[0.12, 0.59, -0.12]} c="#1a1a1e" />
        <Luzinha p={[0.12, 0.59, -0.094]} tam={0.012} cor="#ff4a3a" forca={3} />
        <mesh position={[-0.02, 0.6, 0.12]}>
          <cylinderGeometry args={[0.035, 0.03, 0.09, 10]} />
          <meshStandardMaterial color="#cfe8ff" transparent opacity={0.5} />
        </mesh>
      </group>
      {/* parede por dentro (escuro de madeira/tijolo) ao atravessar */}
      <Cx t={[0.3, 2.7, 4.4]} p={[PAREDE_X - 0.38, 1.35, -1.35]} c="#3a2a22" />
      <Ondulacao p={[PAREDE_X + 0.012, 1.46, -1.53]} r={[0, Math.PI / 2, 0]} tam={0.9} t={tOnda} forca={s < 10.7 ? entre(s, 8.45, 8.7) : 0} />
    </Palco>
  );
};
