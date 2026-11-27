import * as THREE from "three";
import { Caixa, Cam, Chao, Fosco, useTextura } from "./boneco";
import { lerp3, suave, type V3 } from "./tempo";

// Planos de câmera: cada um começa num instante (segundos da cena) e anda devagar de "de" para "para"
export type Plano = { t: number; de: V3; para: V3; alvo: V3; alvoFim?: V3; fov?: number };
export const CamPlanos: React.FC<{ t: number; dur: number; planos: Plano[] }> = ({ t, dur, planos }) => {
  let i = 0;
  while (i + 1 < planos.length && t >= planos[i + 1].t) i++;
  const p = planos[i];
  const fim = i + 1 < planos.length ? planos[i + 1].t : dur;
  const x = Math.min(1, Math.max(0, (t - p.t) / Math.max(0.5, fim - p.t)));
  const k = suave(x) * 0.5 + x * 0.5;
  return <Cam pos={lerp3(p.de, p.para, k)} alvo={p.alvoFim ? lerp3(p.alvo, p.alvoFim, k) : p.alvo} fov={p.fov ?? 35} />;
};

// ---------- peças ----------
export const Janela: React.FC<{ pos: V3; larg?: number; alt?: number }> = ({ pos, larg = 1.6, alt = 1.2 }) => (
  <group position={pos}>
    <Caixa tam={[larg + 0.16, alt + 0.16, 0.08]} cor="#ffffff" />
    <mesh position={[0, 0, 0.045]}>
      <planeGeometry args={[larg, alt]} />
      <meshBasicMaterial color="#9fd8f5" />
    </mesh>
    {/* nuvem */}
    {[
      [-0.25, 0.15, 0.13],
      [-0.05, 0.22, 0.17],
      [0.18, 0.15, 0.12],
    ].map(([x, y, r], i) => (
      <mesh key={i} position={[x, y, 0.06]}>
        <circleGeometry args={[r, 24]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    ))}
    <Caixa tam={[0.05, alt, 0.06]} pos={[0, 0, 0.06]} cor="#ffffff" sombra={false} />
    <Caixa tam={[larg, 0.05, 0.06]} pos={[0, 0, 0.06]} cor="#ffffff" sombra={false} />
  </group>
);

export const Relogio: React.FC<{ pos: V3; s: number }> = ({ pos, s }) => (
  <group position={pos}>
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.32, 0.32, 0.06, 32]} />
      <Fosco cor="#1f2a44" />
    </mesh>
    <mesh position={[0, 0, 0.035]}>
      <circleGeometry args={[0.27, 32]} />
      <meshBasicMaterial color="#ffffff" />
    </mesh>
    <mesh position={[0, 0, 0.045]} rotation={[0, 0, -s * 0.6]}>
      <planeGeometry args={[0.025, 0.4]} />
      <meshBasicMaterial color="#e8463f" />
    </mesh>
    <mesh position={[0, 0.06, 0.05]} rotation={[0, 0, 0.6]}>
      <planeGeometry args={[0.035, 0.16]} />
      <meshBasicMaterial color="#1f2a44" />
    </mesh>
  </group>
);

// régua de altura em forma de girafa amarela
export const Regua: React.FC<{ pos: V3 }> = ({ pos }) => (
  <group position={pos}>
    <Caixa tam={[0.28, 1.9, 0.04]} pos={[0, 0.95, 0]} cor="#ffd34d" sombra={false} />
    {Array.from({ length: 7 }, (_, i) => (
      <mesh key={i} position={[(i % 2 ? 0.06 : -0.05), 0.25 + i * 0.24, 0.025]}>
        <circleGeometry args={[0.045, 16]} />
        <meshBasicMaterial color="#e0a13a" />
      </mesh>
    ))}
    <mesh position={[0, 2.02, 0.02]}>
      <sphereGeometry args={[0.17, 20, 14]} />
      <Fosco cor="#ffd34d" />
    </mesh>
    {[-1, 1].map((l) => (
      <mesh key={l} position={[l * 0.06, 2.06, 0.17]}>
        <sphereGeometry args={[0.025, 8, 6]} />
        <meshBasicMaterial color="#1b1410" />
      </mesh>
    ))}
  </group>
);

export const Quadro: React.FC<{ pos: V3; larg?: number; alt?: number; desenhar: (ctx: CanvasRenderingContext2D) => void; chave: string; escala?: number }> = ({
  pos,
  larg = 1.4,
  alt = 1.0,
  desenhar,
  chave,
  escala = 1,
}) => {
  const tx = useTextura(560, Math.round((560 * alt) / larg), desenhar, chave);
  return (
    <group position={pos} scale={escala}>
      <Caixa tam={[larg + 0.12, alt + 0.12, 0.06]} cor="#1f2a44" />
      <mesh position={[0, 0, 0.035]}>
        <planeGeometry args={[larg, alt]} />
        <meshBasicMaterial map={tx} toneMapped={false} />
      </mesh>
    </group>
  );
};

const pisoClaro = (ctx: CanvasRenderingContext2D) => {
  ctx.fillStyle = "#eceff1";
  ctx.fillRect(0, 0, 256, 256);
  ctx.strokeStyle = "#d6dbdf";
  ctx.lineWidth = 4;
  for (let i = 0; i <= 4; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 64, 0);
    ctx.lineTo(i * 64, 256);
    ctx.moveTo(0, i * 64);
    ctx.lineTo(256, i * 64);
    ctx.stroke();
  }
};

// Consultório do pronto-socorro: parede azul-clara com faixa verde, janela, relógio, régua-girafa,
// maca, armário com caixinhas e um monitor de pressão.
export const Consultorio: React.FC<{ s: number; pressao?: number }> = ({ s, pressao = 0 }) => {
  const piso = useTextura(256, 256, pisoClaro, "piso", [14, 14]);
  const tela = useTextura(
    320,
    200,
    (ctx) => {
      ctx.fillStyle = "#10202c";
      ctx.fillRect(0, 0, 320, 200);
      ctx.fillStyle = pressao > 0.5 ? "#ff5a52" : "#59e39a";
      ctx.font = "bold 86px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(pressao > 0.5 ? "135/90" : "--/--", 160, 118);
      ctx.font = "bold 30px sans-serif";
      ctx.fillText("mmHg", 160, 172);
    },
    pressao > 0.5 ? "alta" : "vazia",
  );
  return (
    <group>
      <Chao textura={piso} />
      {/* parede do fundo */}
      <Caixa tam={[14, 5, 0.2]} pos={[0, 2.5, -2.2]} cor="#cfe7f0" sombra={false} />
      <Caixa tam={[14, 0.12, 0.05]} pos={[0, 1.05, -2.08]} cor="#5cc39a" sombra={false} />
      <Caixa tam={[14, 0.9, 0.05]} pos={[0, 0.45, -2.09]} cor="#e4f1f5" sombra={false} />
      {/* parede lateral */}
      <Caixa tam={[0.2, 5, 10]} pos={[-4.2, 2.5, 2.5]} cor="#d9ecf2" sombra={false} />
      <Janela pos={[1.9, 2.2, -2.08]} />
      <Relogio pos={[-0.4, 2.75, -2.08]} s={s} />
      <Regua pos={[-1.6, 0, -2.08]} />
      {/* maca */}
      <group position={[2.6, 0, -1.2]}>
        <Caixa tam={[1.9, 0.5, 0.8]} pos={[0, 0.45, 0]} cor="#f6f7f9" />
        <Caixa tam={[1.9, 0.14, 0.8]} pos={[0, 0.77, 0]} cor="#7fd1b9" />
        <Caixa tam={[0.5, 0.1, 0.6]} pos={[-0.65, 0.88, 0]} cor="#ffffff" />
      </group>
      {/* armário com caixinhas coloridas */}
      <group position={[-3.0, 0, -1.7]}>
        <Caixa tam={[1.3, 1.1, 0.6]} pos={[0, 0.55, 0]} cor="#ffffff" />
        <Caixa tam={[0.6, 0.02, 0.02]} pos={[0, 0.85, 0.31]} cor="#9aa5ad" />
        {["#ff8a80", "#7fc6e8", "#ffd34d"].map((c, i) => (
          <Caixa key={c} tam={[0.25, 0.25, 0.25]} pos={[-0.38 + i * 0.36, 1.23, 0]} cor={c} />
        ))}
      </group>
      {/* monitor de pressão num pedestal */}
      <group position={[1.15, 0, -1.3]}>
        <Caixa tam={[0.08, 1.3, 0.08]} pos={[0, 0.65, 0]} cor="#9aa5ad" />
        <Caixa tam={[0.7, 0.5, 0.18]} pos={[0, 1.5, 0]} cor="#e8ecef" />
        <mesh position={[0, 1.52, 0.095]}>
          <planeGeometry args={[0.58, 0.36]} />
          <meshBasicMaterial map={tela} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
};

// Banheiro: azulejo branco com rejunte verde, privada, pia com o copinho
export const Banheiro: React.FC<{ cheio: number; corUrina?: string }> = ({ cheio, corUrina = "#6b3a1a" }) => {
  const azulejo = useTextura(
    128,
    128,
    (ctx) => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 128, 128);
      ctx.strokeStyle = "#a6dccb";
      ctx.lineWidth = 5;
      ctx.strokeRect(0, 0, 128, 128);
    },
    "azulejo",
    [10, 4],
  );
  const piso = useTextura(
    128,
    128,
    (ctx) => {
      for (let i = 0; i < 2; i++)
        for (let j = 0; j < 2; j++) {
          ctx.fillStyle = (i + j) % 2 ? "#7fc6e8" : "#eaf6fb";
          ctx.fillRect(i * 64, j * 64, 64, 64);
        }
    },
    "pisoban",
    [16, 16],
  );
  return (
    <group>
      <Chao textura={piso} tam={30} />
      <mesh position={[0, 2, -1.6]}>
        <planeGeometry args={[12, 4]} />
        <meshStandardMaterial map={azulejo} roughness={0.6} />
      </mesh>
      <mesh position={[-3, 2, 1]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[8, 4]} />
        <meshStandardMaterial map={azulejo} roughness={0.6} />
      </mesh>
      {/* privada */}
      <group position={[-1.3, 0, -1.1]}>
        <mesh position={[0, 0.22, 0.15]} castShadow>
          <cylinderGeometry args={[0.2, 0.16, 0.44, 24]} />
          <Fosco cor="#ffffff" />
        </mesh>
        <mesh position={[0, 0.46, 0.2]} scale={[1, 0.3, 1.25]} castShadow>
          <sphereGeometry args={[0.28, 24, 16]} />
          <Fosco cor="#ffffff" />
        </mesh>
        <Caixa tam={[0.6, 0.6, 0.22]} pos={[0, 0.75, -0.2]} cor="#ffffff" />
        <Caixa tam={[0.12, 0.04, 0.04]} pos={[0.18, 0.98, -0.08]} cor="#9aa5ad" />
      </group>
      {/* pia com bancada e espelho */}
      <group position={[0.9, 0, -1.2]}>
        <Caixa tam={[1.3, 0.85, 0.6]} pos={[0, 0.425, 0]} cor="#7fc6e8" />
        <Caixa tam={[1.4, 0.08, 0.66]} pos={[0, 0.89, 0]} cor="#ffffff" />
        <Caixa tam={[0.9, 0.8, 0.05]} pos={[0, 1.65, -0.28]} cor="#d7eef7" />
        <Caixa tam={[0.06, 0.25, 0.06]} pos={[0.35, 1.05, -0.2]} cor="#9aa5ad" />
        {/* copo de vidro com a urina escura */}
        <group position={[-0.15, 0.93, 0.05]}>
          <mesh position={[0, 0.16, 0]}>
            <cylinderGeometry args={[0.1, 0.085, 0.32, 28, 1, true]} />
            <meshStandardMaterial color="#e6f7ff" transparent opacity={0.35} roughness={0.1} side={THREE.DoubleSide} />
          </mesh>
          {cheio > 0.01 && (
            <mesh position={[0, 0.01 + (0.28 * cheio) / 2, 0]}>
              <cylinderGeometry args={[0.092, 0.084, 0.28 * cheio, 28]} />
              <meshStandardMaterial color={corUrina} roughness={0.25} />
            </mesh>
          )}
        </group>
      </group>
    </group>
  );
};

// Parque do final: grama, árvores redondas, banco e sol
export const Parque: React.FC = () => (
  <group>
    <Chao cor="#9ed77f" tam={80} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
      <planeGeometry args={[2.2, 80]} />
      <meshStandardMaterial color="#f1e2b8" roughness={1} />
    </mesh>
    {[
      [-3, -4],
      [3.2, -5],
      [-4.5, 1],
      [4.4, 0.5],
      [-1.8, -8],
      [2, -10],
      [5, -8],
    ].map(([x, z], i) => (
      <group key={i} position={[x, 0, z]}>
        <mesh position={[0, 0.6, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.16, 1.2, 10]} />
          <Fosco cor="#8a5a3a" />
        </mesh>
        <mesh position={[0, 1.6, 0]} castShadow>
          <sphereGeometry args={[0.85 + (i % 3) * 0.15, 20, 14]} />
          <Fosco cor={i % 2 ? "#5cbf6a" : "#6fcf7c"} />
        </mesh>
      </group>
    ))}
    <group position={[-2.2, 0, -1.5]} rotation={[0, 0.5, 0]}>
      <Caixa tam={[1.6, 0.08, 0.45]} pos={[0, 0.5, 0]} cor="#c97b4a" />
      <Caixa tam={[1.6, 0.4, 0.06]} pos={[0, 0.8, -0.2]} cor="#c97b4a" />
      <Caixa tam={[0.08, 0.5, 0.4]} pos={[-0.7, 0.25, 0]} cor="#4a4a4a" />
      <Caixa tam={[0.08, 0.5, 0.4]} pos={[0.7, 0.25, 0]} cor="#4a4a4a" />
    </group>
    <mesh position={[4, 7, -14]}>
      <sphereGeometry args={[1.1, 24, 16]} />
      <meshBasicMaterial color="#fff3b0" />
    </mesh>
  </group>
);
