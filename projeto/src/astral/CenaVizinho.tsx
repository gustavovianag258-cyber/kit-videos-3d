import { useMemo } from "react";
import * as THREE from "three";
import { Reflector } from "three/examples/jsm/objects/Reflector.js";
import { CeuNoite, CidadeNoite, Cx, Gente, Luzinha, type Roupa, texturaCanvas } from "./pecas";
import { CamTrajeto, type Chave, Palco } from "./palco";
import type { V3 } from "./tempo";

// VIZINHO, 3:30: quarto roxo com fita de LED rosa, parede de tijolo, TV no plantão do tsunami,
// o crush dançando de frente para o espelho, gato preto em cima da cômoda (o único que te vê),
// relógio digital 3:30 e a janela para a cidade.
const CRUSH: Roupa = { pele: "#c98e66", cabelo: "#2b1a12", camisa: "#f4f4f4", calca: "#e0457b", sapato: "#f4f4f4", penteado: "longoCacheado", batom: true, top: true, short: true };
const ROXO = "#6a4f8c";
const W = 2.2; // meia largura do quarto (x)
const P = 2.5; // meia profundidade (z)

const texturaTijolo = () =>
  texturaCanvas(
    256,
    256,
    (g) => {
      g.fillStyle = "#7d6464";
      g.fillRect(0, 0, 256, 256);
      for (let y = 0; y < 16; y++)
        for (let x = -1; x < 5; x++) {
          const off = y % 2 ? 32 : 0;
          const tom = 120 + ((x * 37 + y * 53) % 40);
          g.fillStyle = `rgb(${tom + 30},${Math.round(tom * 0.55)},${Math.round(tom * 0.55)})`;
          g.fillRect(x * 64 + off + 3, y * 16 + 3, 58, 11);
        }
    },
    [3, 2],
  );

const texturaTV = () =>
  texturaCanvas(512, 288, (g) => {
    // imagem do mar recuando com a onda
    const ceu = g.createLinearGradient(0, 0, 0, 170);
    ceu.addColorStop(0, "#9fb3c4");
    ceu.addColorStop(1, "#d6dde2");
    g.fillStyle = ceu;
    g.fillRect(0, 0, 512, 288);
    g.fillStyle = "#3d6b80";
    g.fillRect(0, 120, 512, 80);
    g.fillStyle = "#f4f7f8";
    g.beginPath();
    g.moveTo(150, 140);
    g.quadraticCurveTo(300, 40, 470, 120);
    g.quadraticCurveTo(400, 110, 360, 150);
    g.closePath();
    g.fill();
    g.fillStyle = "#5c7d5a";
    g.fillRect(0, 175, 512, 30);
    // selo AO VIVO
    g.fillStyle = "#d61f26";
    g.fillRect(10, 10, 58, 22);
    g.fillStyle = "#fff";
    g.font = "bold 15px sans-serif";
    g.fillText("AO VIVO", 14, 27);
    g.fillStyle = "#111";
    g.fillRect(68, 10, 50, 22);
    g.fillStyle = "#fff";
    g.fillText("03:30", 74, 27);
    // tarja URGENTE + manchete
    g.fillStyle = "#d61f26";
    g.fillRect(8, 186, 120, 20);
    g.fillStyle = "#fff";
    g.font = "bold 14px sans-serif";
    g.fillText("URGENTE", 14, 201);
    g.fillStyle = "#ffffff";
    g.fillRect(8, 206, 496, 52);
    g.fillStyle = "#14161c";
    g.font = "bold 34px sans-serif";
    g.fillText("O MAR RECUOU...", 16, 238);
    g.fillStyle = "#d61f26";
    g.font = "bold 17px sans-serif";
    g.fillText("E SIM, É UM TSUNAMI. CLARO.", 16, 256);
    g.fillStyle = "#16244a";
    g.fillRect(0, 262, 512, 26);
    g.fillStyle = "#fff";
    g.font = "bold 13px sans-serif";
    g.fillText("O GATO DELA: NEM AÍ  •  ESPECIALISTAS: CORRAM  •  TEMPO: MOLHADO  •  ", 8, 280);
  });

const texturaRelogio = () =>
  texturaCanvas(256, 128, (g) => {
    g.fillStyle = "#120808";
    g.fillRect(0, 0, 256, 128);
    g.fillStyle = "#ff3b2f";
    g.font = "bold 92px monospace";
    g.textAlign = "center";
    g.fillText("3:30", 128, 98);
  });

const Espelho: React.FC<{ p: V3; tam: [number, number] }> = ({ p, tam }) => {
  const espelho = useMemo(() => {
    const r = new Reflector(new THREE.PlaneGeometry(tam[0], tam[1]), { textureWidth: 768, textureHeight: 1536, color: new THREE.Color("#b9b4c8"), clipBias: 0.003 });
    return r;
  }, [tam]);
  return (
    <group position={p}>
      <Cx t={[tam[0] + 0.1, tam[1] + 0.1, 0.05]} p={[0, 0, -0.03]} c="#3a3048" />
      <primitive object={espelho} position={[0, 0, 0.005]} />
    </group>
  );
};

const LavaLampada: React.FC<{ p: V3; s: number }> = ({ p, s }) => (
  <group position={p}>
    <mesh position={[0, 0.07, 0]}>
      <cylinderGeometry args={[0.05, 0.08, 0.14, 12]} />
      <meshStandardMaterial color="#bfc3cc" metalness={0.6} roughness={0.3} />
    </mesh>
    <mesh position={[0, 0.3, 0]}>
      <cylinderGeometry args={[0.035, 0.055, 0.32, 16]} />
      <meshBasicMaterial color={new THREE.Color("#a97bff").multiplyScalar(1.4)} toneMapped={false} transparent opacity={0.85} />
    </mesh>
    {[0, 1, 2].map((i) => (
      <Luzinha key={i} p={[Math.sin(i * 2) * 0.012, 0.2 + ((s * 0.05 + i * 0.33) % 1) * 0.2, 0]} tam={0.022} cor="#ff8ad1" forca={1.8} />
    ))}
    <mesh position={[0, 0.5, 0]}>
      <coneGeometry args={[0.035, 0.08, 12]} />
      <meshStandardMaterial color="#bfc3cc" metalness={0.6} roughness={0.3} />
    </mesh>
    <pointLight position={[0, 0.35, 0.1]} color="#b07bff" intensity={0.9} distance={2.5} decay={2} />
  </group>
);

// gato preto sentado; vira a cabeça para olhar para a câmera
const GatoPreto: React.FC<{ p: V3; olhar: number; s: number }> = ({ p, olhar, s }) => (
  <group position={p} rotation={[0, -Math.PI / 2 + 0.45, 0]}>
    <Cx t={[0.28, 0.24, 0.42]} p={[0, 0.12, -0.05]} c="#26232e" />
    <Cx t={[0.24, 0.32, 0.22]} p={[0, 0.34, 0.08]} c="#26232e" />
    <Cx t={[0.07, 0.24, 0.07]} p={[-0.07, 0.12, 0.16]} c="#2b2834" />
    <Cx t={[0.07, 0.24, 0.07]} p={[0.07, 0.12, 0.16]} c="#2b2834" />
    <Cx t={[0.07, 0.07, 0.38]} p={[0.16, 0.04, -0.2]} r={[0, 0.4, 0]} c="#26232e" />
    <group position={[0, 0.58, 0.1]} rotation={[0.05, olhar + Math.sin(s * 1.2) * 0.04, 0]}>
      <Cx t={[0.26, 0.22, 0.22]} c="#2b2834" />
      <Cx t={[0.07, 0.09, 0.05]} p={[-0.08, 0.14, -0.02]} c="#26232e" />
      <Cx t={[0.07, 0.09, 0.05]} p={[0.08, 0.14, -0.02]} c="#26232e" />
      {[-1, 1].map((l) => (
        <group key={l} position={[l * 0.06, 0.02, 0.112]}>
          <mesh>
            <boxGeometry args={[0.055, 0.04, 0.005]} />
            <meshBasicMaterial color={new THREE.Color("#f6e27a").multiplyScalar(1.6)} toneMapped={false} />
          </mesh>
          <Cx t={[0.012, 0.035, 0.006]} p={[0, 0, 0.003]} c="#111" />
        </group>
      ))}
      <Cx t={[0.035, 0.025, 0.01]} p={[0, -0.04, 0.112]} c="#d07a8a" />
    </group>
  </group>
);

const CAM: Chave[] = [
  { t: 10.62, pos: [-0.35, 1.55, P + 0.2], alvo: [0.15, 1.25, -P], fov: 72 },
  { t: 10.95, pos: [-0.35, 1.55, P - 0.3], alvo: [0.15, 1.25, -P], fov: 72 },
  { t: 13.55, pos: [-0.25, 1.5, 0.95], alvo: [0.25, 1.2, -P], fov: 72 },
  { t: 13.95, pos: [0.75, 1.48, 0.7], alvo: [W, 1.1, -0.35], fov: 70 },
  { t: 16.55, pos: [1.25, 1.3, 0.12], alvo: [W, 1.08, -0.45], fov: 70 },
  { t: 17.1, pos: [0.4, 1.5, 0.25], alvo: [-W, 1.5, -0.8], fov: 72 },
  { t: 18.95, pos: [-1.55, 1.5, -0.55], alvo: [-W - 1, 1.45, -0.8], fov: 72 },
];

export const CenaVizinho: React.FC<{ s: number }> = ({ s }) => {
  const tijolo = useMemo(texturaTijolo, []);
  const tv = useMemo(texturaTV, []);
  const relogio = useMemo(texturaRelogio, []);
  // o gato acompanha você com a cabeça
  const olharGato = s < 13.9 ? -0.7 : Math.min(0.25, -0.7 + (s - 13.9) * 1.2);
  return (
    <Palco ceu="noite" luzCeu={0.25} foco={2.5} desfoque={0.4} brilho={1.15} saturacao={0.22} ao={1.2} raioAo={0.5}>
      <CamTrajeto ch={CAM} s={s} />
      <hemisphereLight args={["#9a7bd6", "#3a1e2a", 0.7]} />
      <ambientLight intensity={0.18} color="#c9a8ff" />
      <pointLight position={[0.3, 1.9, -0.6]} color="#ff4fd8" intensity={0.9} distance={6} decay={1.5} />
      <pointLight position={[1.2, 1.4, 1.2]} color="#b48cff" intensity={0.6} distance={5} decay={1.5} />
      <pointLight position={[-1.4, 1.6, -2.1]} color="#9fc0ff" intensity={0.6} distance={3} decay={2} />

      {/* paredes, chão e teto */}
      <Cx t={[2 * W, 2.7, 0.2]} p={[0, 1.35, -P - 0.1]} c={ROXO} />
      <Cx t={[2 * W, 2.7, 0.3]} p={[0, 1.35, P + 0.15]} c={ROXO} />
      <mesh position={[W + 0.01, 1.35, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[2 * P, 2.7]} />
        <meshStandardMaterial map={tijolo} color="#b7929a" roughness={0.95} />
      </mesh>
      <Cx t={[0.2, 0.9, 2 * P]} p={[-W - 0.1, 0.45, 0]} c={ROXO} />
      <Cx t={[0.2, 0.4, 2 * P]} p={[-W - 0.1, 2.5, 0]} c={ROXO} />
      <Cx t={[0.2, 1.4, 1.6]} p={[-W - 0.1, 1.6, 1.4]} c={ROXO} />
      <Cx t={[0.2, 1.4, 1.5]} p={[-W - 0.1, 1.6, -1.85]} c={ROXO} />
      <Cx t={[2 * W, 0.05, 2 * P]} p={[0, -0.02, 0]} c="#7a3524" rug={0.6} />
      <Cx t={[2 * W, 0.1, 2 * P]} p={[0, 2.75, 0]} c="#a68ac8" />
      {/* fita de LED rosa no alto das paredes */}
      {[
        [[2 * W, 0.04, 0.04], [0, 2.66, -P + 0.02]],
        [[0.04, 0.04, 2 * P], [W - 0.02, 2.66, 0]],
        [[0.04, 0.04, 2 * P], [-W + 0.02, 2.66, 0]],
      ].map(([t, p], i) => (
        <mesh key={i} position={p as V3}>
          <boxGeometry args={t as V3} />
          <meshBasicMaterial color={new THREE.Color("#ff3fd2").multiplyScalar(2.6)} toneMapped={false} />
        </mesh>
      ))}

      {/* TV com o plantão + rack branco com soundbar */}
      <group position={[-1.3, 1.95, -P + 0.04]}>
        <Cx t={[1.22, 0.7, 0.05]} c="#111216" />
        <mesh position={[0, 0, 0.03]}>
          <planeGeometry args={[1.16, 0.65]} />
          <meshBasicMaterial map={tv} toneMapped={false} />
        </mesh>
      </group>
      <Cx t={[1.5, 0.45, 0.42]} p={[-1.3, 0.23, -P + 0.22]} c="#e9e6ef" />
      <Cx t={[0.9, 0.08, 0.1]} p={[-1.3, 0.5, -P + 0.2]} c="#1a1a1e" />
      <Cx t={[0.22, 0.03, 0.12]} p={[-1.0, 0.03, -P + 0.9]} c="#f2f2f2" />

      {/* pôsteres na parede roxa, escrivaninha com notebook aceso e pelúcia */}
      {[
        [-0.95, 0.95, "#ff8fab", "#ffd166"],
        [1.2, 1.9, "#4cc9f0", "#f72585"],
      ].map(([x, y, a, b], i) => (
        <group key={i} position={[x as number, y as number, -P + 0.02]}>
          <Cx t={[0.62, 0.86, 0.02]} c={a as string} />
          <Cx t={[0.4, 0.4, 0.025]} p={[0, 0.1, 0]} c={b as string} />
          <Cx t={[0.5, 0.06, 0.026]} p={[0, -0.28, 0]} c="#ffffff" />
        </group>
      ))}
      <group position={[-1.9, 0, 1.3]} rotation={[0, Math.PI / 2, 0]}>
        <Cx t={[1.2, 0.05, 0.6]} p={[0, 0.75, 0]} c="#efe9f5" />
        <Cx t={[0.05, 0.75, 0.55]} p={[-0.55, 0.37, 0]} c="#d9d2e6" />
        <Cx t={[0.05, 0.75, 0.55]} p={[0.55, 0.37, 0]} c="#d9d2e6" />
        <Cx t={[0.4, 0.02, 0.28]} p={[0, 0.79, 0.05]} c="#2a2a30" />
        <group position={[0, 0.92, -0.08]} rotation={[-0.25, 0, 0]}>
          <Cx t={[0.4, 0.26, 0.015]} c="#2a2a30" />
          <mesh position={[0, 0, 0.01]}>
            <planeGeometry args={[0.36, 0.22]} />
            <meshBasicMaterial color={new THREE.Color("#c9a8ff").multiplyScalar(1.3)} toneMapped={false} />
          </mesh>
        </group>
        <pointLight position={[0, 1.0, 0.2]} color="#c9a8ff" intensity={0.5} distance={1.6} />
      </group>
      <group position={[1.95, 0.52, -2.3]} rotation={[0, -0.6, 0]}>
        <Cx t={[0.3, 0.3, 0.24]} p={[0, 0.15, 0]} c="#f2c6de" />
        <Cx t={[0.26, 0.24, 0.22]} p={[0, 0.42, 0]} c="#f2c6de" />
        <Cx t={[0.08, 0.1, 0.06]} p={[-0.09, 0.58, 0]} c="#f2c6de" />
        <Cx t={[0.08, 0.1, 0.06]} p={[0.09, 0.58, 0]} c="#f2c6de" />
        <Cx t={[0.04, 0.04, 0.01]} p={[-0.05, 0.44, 0.115]} c="#1a1a1e" />
        <Cx t={[0.04, 0.04, 0.01]} p={[0.05, 0.44, 0.115]} c="#1a1a1e" />
      </group>
      {/* espelho de corpo inteiro (reflexo de verdade) */}
      <Espelho p={[0.3, 1.08, -P + 0.02]} tam={[0.72, 1.86]} />

      {/* cama azul e travesseiro no chão */}
      <Cx t={[1.15, 0.35, 1.5]} p={[1.62, 0.18, -1.78]} c="#2e4fae" />
      <Cx t={[1.1, 0.12, 1.45]} p={[1.62, 0.4, -1.78]} c="#3c64d0" />
      <Cx t={[0.5, 0.1, 0.32]} p={[1.62, 0.5, -2.3]} c="#e9e6f2" />
      <Cx t={[0.55, 0.14, 0.38]} p={[0.6, 0.07, 0.4]} r={[0, 0.4, 0]} c="#f1eef6" />

      {/* o crush dançando de frente para o espelho */}
      <Gente r={CRUSH} pos={[0.85, 0, -1.2]} giroY={-2.8} acao="dancar" t={s} rosto="feliz" />

      {/* cômoda, lava lamp, gato e o relógio na parede de tijolo */}
      <group position={[W - 0.3, 0, -0.45]}>
        <Cx t={[0.55, 0.85, 1.2]} p={[0, 0.425, 0]} c="#b54a2a" rug={0.5} />
        {[0.2, 0.47, 0.72].map((y) => (
          <group key={y}>
            <Cx t={[0.02, 0.2, 1.1]} p={[-0.28, y, 0]} c="#9c3f23" />
            <Cx t={[0.03, 0.03, 0.14]} p={[-0.3, y, 0]} c="#e8e8e8" />
          </group>
        ))}
        <LavaLampada p={[-0.05, 0.85, -0.35]} s={s} />
        <GatoPreto p={[0, 0.85, 0.22]} olhar={olharGato} s={s} />
        <group position={[0.27, 1.62, -0.25]} rotation={[0, -Math.PI / 2, 0]}>
          <Cx t={[0.5, 0.25, 0.06]} c="#120808" />
          <mesh position={[0, 0, 0.032]}>
            <planeGeometry args={[0.46, 0.22]} />
            <meshBasicMaterial map={relogio} toneMapped={false} />
          </mesh>
        </group>
      </group>

      {/* janela na parede da esquerda com cortina roxa e a cidade */}
      <group>
        {[-0.45, -1.1].map((z, i) => (
          <Cx key={i} t={[0.08, 1.4, 0.05]} p={[-W, 1.6, z + (i ? 0 : 0)]} c="#1d1828" />
        ))}
        <Cx t={[0.08, 0.06, 1.6]} p={[-W, 2.28, -0.4]} c="#1d1828" />
        <Cx t={[0.08, 0.06, 1.6]} p={[-W, 0.92, -0.4]} c="#1d1828" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Cx key={i} t={[0.07, 2.3, 0.08]} p={[-W + 0.12, 1.4, 0.48 + i * 0.07]} c={i % 2 ? "#4b3570" : "#5a4183"} rug={0.95} />
        ))}
      </group>
      <CeuNoite />
      <CidadeNoite s={s} centro={[-W - 12, -30, -0.4]} giroY={Math.PI / 2} />
    </Palco>
  );
};
