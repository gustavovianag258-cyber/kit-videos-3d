import { useMemo } from "react";
import * as THREE from "three";
import { random } from "remotion";
import dados from "./mundo-dados.json";
import { Bloco, CIENTISTA } from "./Bloco";
import { CameraLenta, entre, Palco, type PropsPlano } from "./comum";

// Sala de controle escura com grade neon. Azul = calma ("isso nunca vai acontecer");
// vermelha = alerta máximo (a NASA rastreando a origem).

type Modo = "emoji" | "mapa";
const D = dados as { terras: number[][][]; brasil: number[][][] };

const desenharTelao = (ctx: CanvasRenderingContext2D, modo: Modo, t: number, rastro: number) => {
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  ctx.fillStyle = modo === "mapa" ? "#12060a" : "#06142e";
  ctx.fillRect(0, 0, W, H);
  // grade fina
  ctx.strokeStyle = modo === "mapa" ? "rgba(255,60,60,0.12)" : "rgba(80,160,255,0.14)";
  ctx.lineWidth = 2;
  for (let x = 0; x < W; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let y = 0; y < H; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
  if (modo === "emoji") {
    // carinha sorridente
    const cx = W * 0.3;
    const cy = H * 0.5;
    const r = H * 0.27;
    ctx.fillStyle = "#ffd23f";
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#3a2a00";
    ctx.fillRect(cx - r * 0.42, cy - r * 0.38, r * 0.2, r * 0.32);
    ctx.fillRect(cx + r * 0.22, cy - r * 0.38, r * 0.2, r * 0.32);
    ctx.lineWidth = r * 0.12;
    ctx.strokeStyle = "#3a2a00";
    ctx.beginPath();
    ctx.arc(cx, cy + r * 0.05, r * 0.55, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();
    // coração rosa riscado com X vermelho
    const hx = W * 0.7;
    const hy = H * 0.52;
    const k = H * 0.0125 * (1 + 0.04 * Math.sin(t * 6));
    ctx.fillStyle = "#ff4fa3";
    ctx.beginPath();
    ctx.moveTo(hx, hy + 14 * k);
    ctx.bezierCurveTo(hx - 26 * k, hy - 2 * k, hx - 16 * k, hy - 22 * k, hx, hy - 10 * k);
    ctx.bezierCurveTo(hx + 16 * k, hy - 22 * k, hx + 26 * k, hy - 2 * k, hx, hy + 14 * k);
    ctx.fill();
    ctx.strokeStyle = "#ff1a1a";
    ctx.lineWidth = H * 0.05;
    ctx.lineCap = "round";
    const a = H * 0.26;
    ctx.beginPath();
    ctx.moveTo(hx - a, hy - a);
    ctx.lineTo(hx + a, hy + a);
    ctx.moveTo(hx + a, hy - a);
    ctx.lineTo(hx - a, hy + a);
    ctx.stroke();
    ctx.lineCap = "butt";
  } else {
    // mapa-múndi verde, ponto pulsando no Brasil e o traço do sinal chegando
    const px = (lon: number) => ((lon + 180) / 360) * W;
    const py = (lat: number) => ((80 - lat) / 140) * H;
    for (const [lista, cor] of [
      [D.terras, "#1f9e57"],
      [D.brasil, "#2fd17a"],
    ] as const) {
      for (const anel of lista) {
        ctx.beginPath();
        anel.forEach(([lon, lat], i) => (i ? ctx.lineTo(px(lon), py(lat)) : ctx.moveTo(px(lon), py(lat))));
        ctx.closePath();
        ctx.fillStyle = cor;
        ctx.globalAlpha = 0.55;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = "#5dffa5";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }
    const bx = px(-51);
    const by = py(-12);
    if (rastro > 0) {
      // sinal de sismógrafo (zigue-zague) atravessando do outro lado do mundo até o Brasil
      const ini = { x: px(110), y: py(35) };
      const n = 120;
      const ate = Math.floor(n * Math.min(1, rastro));
      ctx.strokeStyle = "#ff2a2a";
      ctx.shadowColor = "#ff2a2a";
      ctx.shadowBlur = 16;
      ctx.lineWidth = 5;
      ctx.beginPath();
      for (let i = 0; i <= ate; i++) {
        const u = i / n;
        const x = ini.x + (bx - ini.x) * u;
        const y = ini.y + (by - ini.y) * u - Math.sin(u * Math.PI) * H * 0.18 + Math.sin(i * 1.9) * 14 * (1 - u * 0.6);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
    for (let k = 0; k < 3; k++) {
      const f = (t * 1.3 + k / 3) % 1;
      ctx.strokeStyle = `rgba(255,40,40,${1 - f})`;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(bx, by, 10 + f * 90, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = "#ff2a2a";
    ctx.beginPath();
    ctx.arc(bx, by, 14, 0, Math.PI * 2);
    ctx.fill();
  }
};

const Telao: React.FC<{ modo: Modo; t: number; rastro?: number; vermelho: boolean }> = ({ modo, t, rastro = 0, vermelho }) => {
  const { tex, ctx } = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 1600;
    c.height = 900;
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return { tex, ctx: c.getContext("2d")! };
  }, []);
  desenharTelao(ctx, modo, t, rastro);
  tex.needsUpdate = true;
  return (
    <group position={[0, 3.3, -6]}>
      <mesh position={[0, 0, -0.08]}>
        <boxGeometry args={[8.5, 4.9, 0.12]} />
        <meshStandardMaterial color="#0b0d12" roughness={0.5} />
      </mesh>
      <mesh>
        <planeGeometry args={[8, 4.5]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
      <pointLight position={[0, 0, 2]} intensity={vermelho ? 8 : 6} distance={14} color={vermelho ? "#ff4040" : "#6fa8ff"} />
    </group>
  );
};

// Chiado dos monitores: uma textura de ruído que "pula" a cada quadro
const useChiado = (vermelho: boolean) =>
  useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 128;
    c.height = 128;
    const ctx = c.getContext("2d")!;
    const img = ctx.createImageData(128, 128);
    for (let i = 0; i < 128 * 128; i++) {
      const v = random(`ch${i}`) * 255;
      img.data[i * 4] = vermelho ? v : v * 0.35;
      img.data[i * 4 + 1] = vermelho ? v * 0.15 : v * 0.6;
      img.data[i * 4 + 2] = vermelho ? v * 0.15 : v;
      img.data[i * 4 + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.magFilter = THREE.NearestFilter;
    return t;
  }, [vermelho]);

const MESAS: [number, number][] = [
  [-2.7, -2.2],
  [0, -2.2],
  [2.7, -2.2],
  [-2.7, 0.4],
  [0, 0.4],
  [2.7, 0.4],
];

const SalaDeControle: React.FC<{
  frame: number;
  t: number;
  vermelho: boolean;
  modo: Modo;
  rastro?: number;
  olhandoTelao?: number;
}> = ({ frame, t, vermelho, modo, rastro, olhandoTelao = 0 }) => {
  const chiado = useChiado(vermelho);
  chiado.offset.set(random(`o${frame}`), random(`p${frame}`));
  const neon = vermelho ? "#ff2a3a" : "#2a8cff";
  const grade = useMemo(() => new THREE.GridHelper(40, 40, neon, neon), [neon]);
  const alarme = vermelho ? 0.6 + 0.4 * Math.sin(t * 9) : 1;
  return (
    <>
      <fog attach="fog" args={[vermelho ? "#1a0306" : "#020814", 8, 26]} />
      <ambientLight intensity={vermelho ? 0.3 * alarme : 0.5} color={vermelho ? "#ff8080" : "#9ab8ff"} />
      <hemisphereLight args={[vermelho ? "#ff5050" : "#5f8dff", "#05070c", vermelho ? 0.4 : 0.6]} />
      <directionalLight position={[3, 5, 8]} intensity={vermelho ? 0.6 : 0.9} color={vermelho ? "#ffb0b0" : "#cfe0ff"} />
      <pointLight position={[0, 5, 3]} intensity={vermelho ? 7 * alarme : 4} distance={18} color={neon} />
      <pointLight position={[-6, 3, -2]} intensity={3} distance={12} color={vermelho ? "#ff6040" : "#3fd0ff"} />
      {/* chão e grade neon */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -2]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#05070c" roughness={0.35} metalness={0.4} />
      </mesh>
      <primitive object={grade} position={[0, 0.01, -2]} material-transparent material-opacity={0.35} />
      {/* parede do fundo com grade */}
      <mesh position={[0, 4, -6.3]}>
        <planeGeometry args={[30, 10]} />
        <meshStandardMaterial color="#070a12" roughness={0.8} />
      </mesh>
      <Telao modo={modo} t={t} rastro={rastro} vermelho={vermelho} />
      {MESAS.map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 0.76, 0]}>
            <boxGeometry args={[2.2, 0.08, 0.9]} />
            <meshStandardMaterial color="#1b2130" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.38, -0.3]}>
            <boxGeometry args={[2, 0.72, 0.06]} />
            <meshStandardMaterial color="#121722" />
          </mesh>
          {[-0.5, 0.5].map((mx) => (
            <group key={mx} position={[mx, 1.15, -0.25]} rotation={[-0.08, 0, 0]}>
              <mesh>
                <boxGeometry args={[0.85, 0.55, 0.05]} />
                <meshStandardMaterial color="#0c0f16" />
              </mesh>
              <mesh position={[0, 0, 0.03]}>
                <planeGeometry args={[0.78, 0.48]} />
                <meshBasicMaterial map={chiado} toneMapped={false} />
              </mesh>
            </group>
          ))}
          {/* cientista sentado de costas para a câmera */}
          <mesh position={[0, 0.45, 0.75]}>
            <boxGeometry args={[0.6, 0.08, 0.55]} />
            <meshStandardMaterial color="#222836" />
          </mesh>
          <Bloco
            v={CIENTISTA(i)}
            pos={[0, -0.13, 0.72]}
            giroY={Math.PI}
            frame={frame + i * 17}
            escala={0.92}
            p={{
              sentado: true,
              curvado: olhandoTelao ? -0.05 : 0.18,
              bracoE: [-0.9, 0.12],
              bracoD: [-0.9 + Math.sin(frame * 0.6 + i) * 0.04, 0.12],
              cotoveloE: -0.3,
              cotoveloD: -0.3,
              cabeca: [olhandoTelao ? -0.35 * olhandoTelao : 0.05, Math.sin(frame * 0.05 + i) * 0.1],
            }}
          />
        </group>
      ))}
    </>
  );
};

export const PlanoSala: React.FC<
  PropsPlano & { variante: "ampla" | "cientista" | "telao" | "telaoPerto" | "olham" | "vermelha" | "mapa" }
> = ({ t, dur, frame, s, variante }) => {
  const vermelho = variante === "vermelha" || variante === "mapa";
  const modo: Modo = vermelho ? "mapa" : "emoji";
  const x = t / dur;
  const cams = {
    ampla: <CameraLenta de={[0, 4.2, 7.5]} para={[0, 3.6, 6.2]} alvo={[0, 2.2, -4]} x={x} fov={50} />,
    cientista: <CameraLenta de={[1.05, 1.85, -0.75]} para={[0.8, 1.8, -0.45]} alvo={[0, 1.5, 1.1]} x={x} fov={45} />,
    telao: <CameraLenta de={[0, 2.6, 4]} para={[0, 2.8, 2.6]} alvo={[0, 3.2, -6]} x={x} fov={45} />,
    telaoPerto: <CameraLenta de={[0, 3.2, 0.8]} para={[0, 3.25, -1.2]} alvo={[0, 3.3, -6]} x={x} fov={45} />,
    olham: <CameraLenta de={[-1.8, 0.9, 2.8]} para={[-1.4, 0.95, 2.2]} alvo={[0, 2.6, -6]} x={x} fov={50} />,
    vermelha: <CameraLenta de={[3.5, 3.8, 6.5]} para={[2.6, 3.4, 5.4]} alvo={[0, 2.6, -5]} x={x} fov={50} treme={0.015} s={s} />,
    mapa: <CameraLenta de={[0, 3.3, 0.2]} para={[-0.3, 3.3, -1.5]} alvo={[0, 3.3, -6]} alvoFim={[-1.2, 3.1, -6]} x={x} fov={45} />,
  }[variante];
  return (
    <Palco fundo={vermelho ? "#140205" : "#020814"} fov={45}>
      {cams}
      <SalaDeControle
        frame={frame}
        t={t}
        vermelho={vermelho}
        modo={modo}
        rastro={variante === "mapa" ? entre(t, 0.05, 1.2) : variante === "vermelha" ? 1 : 0}
        olhandoTelao={variante === "olham" ? entre(t, 0.1, 0.8) : 0}
      />
    </Palco>
  );
};
