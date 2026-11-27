import { random } from "remotion";

// Efeitos com perspectiva calculada, sem WebGL: cada pedaço é um sólido de verdade, que gira no
// espaço, tem luz por face e fica maior quando vem na direção da câmera. Tudo em função de `t`,
// então o quadro é sempre o mesmo em qualquer render.

type V = [number, number, number];
const FOCAL = 1500;
const CX = 540;
const CY = 900;

// ponto do mundo (x, y em pixels da tela no plano z = 0; z positivo vai pra longe)
export const projeta = (x: number, y: number, z: number): [number, number, number] => {
  const k = FOCAL / Math.max(120, FOCAL + z);
  return [CX + (x - CX) * k, CY + (y - CY) * k, k];
};

const gira = ([x, y, z]: V, a: number, b: number, c: number): V => {
  const y1 = y * Math.cos(a) - z * Math.sin(a);
  const z1 = y * Math.sin(a) + z * Math.cos(a);
  const x2 = x * Math.cos(b) + z1 * Math.sin(b);
  const z2 = -x * Math.sin(b) + z1 * Math.cos(b);
  return [x2 * Math.cos(c) - y1 * Math.sin(c), x2 * Math.sin(c) + y1 * Math.cos(c), z2];
};

const tom = (hex: string, k: number) => {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.max(0, Math.min(255, Math.round(v * k)));
  return `rgb(${f((n >> 16) & 255)},${f((n >> 8) & 255)},${f(n & 255)})`;
};

const LUZ: V = [-0.48, -0.72, -0.5];
const FACES: { eixo: V; vs: V[] }[] = [
  { eixo: [0, 0, -1], vs: [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1]] },
  { eixo: [0, 0, 1], vs: [[1, -1, 1], [-1, -1, 1], [-1, 1, 1], [1, 1, 1]] },
  { eixo: [-1, 0, 0], vs: [[-1, -1, 1], [-1, -1, -1], [-1, 1, -1], [-1, 1, 1]] },
  { eixo: [1, 0, 0], vs: [[1, -1, -1], [1, -1, 1], [1, 1, 1], [1, 1, -1]] },
  { eixo: [0, -1, 0], vs: [[-1, -1, 1], [1, -1, 1], [1, -1, -1], [-1, -1, -1]] },
  { eixo: [0, 1, 0], vs: [[-1, 1, -1], [1, 1, -1], [1, 1, 1], [-1, 1, 1]] },
];

// sólido com luz por face. (a, b, c) = meio lado em cada eixo
export const Solido: React.FC<{ x: number; y: number; z?: number; a: number; b: number; c: number; rx: number; ry: number; rz: number; cor: string; alfa?: number }> = ({ x, y, z = 0, a, b, c, rx, ry, rz, cor, alfa = 1 }) => (
  <g opacity={alfa}>
    {FACES.map((f, i) => {
      const n = gira(f.eixo, rx, ry, rz);
      if (n[2] >= 0) return null;
      const luz = 0.5 + 0.62 * Math.max(0, n[0] * LUZ[0] + n[1] * LUZ[1] + n[2] * LUZ[2]);
      const pts = f.vs
        .map(([u, v, w]) => {
          const p = gira([u * a, v * b, w * c], rx, ry, rz);
          const [sx, sy] = projeta(x + p[0], y + p[1], z + p[2]);
          return `${sx},${sy}`;
        })
        .join(" ");
      return <polygon key={i} points={pts} fill={tom(cor, luz)} />;
    })}
  </g>
);

// Estilhaços: saem de (x, y), caem com gravidade, quicam uma vez e ficam no chão.
export const Estilhacos: React.FC<{ t: number; x: number; y: number; chao: number; n?: number; cores: string[]; forca?: number; tam?: number; semente: string; abre?: number; fino?: boolean }> = ({ t, x, y, chao, n = 22, cores, forca = 1, tam = 26, semente, abre = 1, fino }) => {
  if (t < 0) return null;
  const G = 2300;
  const itens = new Array(n).fill(0).map((_, i) => {
    const r = (s: string) => random(`${semente}${s}${i}`);
    const ang = r("a") * Math.PI * 2;
    const v0 = forca * (220 + r("v") * 760) * abre;
    const vx = Math.cos(ang) * v0;
    const vz = Math.sin(ang) * v0 * 0.9;
    const vy = -forca * (360 + r("u") * 980);
    const y0 = y + (r("y") - 0.5) * 60;
    const t1 = (-vy + Math.sqrt(vy * vy + 2 * G * Math.max(1, chao - y0))) / G;
    const vy1 = -0.3 * (vy + G * t1);
    const t2 = (-2 * vy1) / G;
    let px, py, pz;
    if (t < t1) {
      px = x + vx * t;
      pz = vz * t;
      py = y0 + vy * t + 0.5 * G * t * t;
    } else {
      const d = Math.min(t - t1, t2);
      px = x + vx * t1 + 0.4 * vx * d;
      pz = vz * t1 + 0.4 * vz * d;
      py = chao + vy1 * d + 0.5 * G * d * d;
    }
    const vivo = Math.min(t, t1 + t2);
    const giro = 3 + r("g") * 9;
    return {
      z: pz,
      el: (
        <Solido
          key={i}
          x={px}
          y={py}
          z={pz}
          a={tam * (0.5 + r("s") * 0.9)}
          b={tam * (fino ? 0.14 : 0.3 + r("h") * 0.5)}
          c={tam * (0.4 + r("c") * 0.7)}
          rx={r("x") * 6 + vivo * giro}
          ry={r("q") * 6 + vivo * giro * 0.7}
          rz={r("w") * 6 + vivo * giro * 0.4}
          cor={cores[i % cores.length]}
        />
      ),
    };
  });
  return <g>{itens.sort((p, q) => q.z - p.z).map((o) => o.el)}</g>;
};

// Nuvem de fumaça ou poeira: bolas com luz própria que crescem, sobem e se desfazem.
export const Fumaca3D: React.FC<{ t: number; x: number; y: number; n?: number; cor?: string; dur?: number; raio?: number; sobe?: number; abre?: number; forca?: number; id: string }> = ({ t, x, y, n = 14, cor = "#BDB4A2", dur = 1.8, raio = 120, sobe = 320, abre = 340, forca = 0.75, id }) => {
  if (t < 0 || t > dur) return null;
  const k = t / dur;
  const ease = 1 - Math.pow(1 - k, 2.4);
  return (
    <g>
      <defs>
        <radialGradient id={id} cx="0.36" cy="0.3" r="0.72">
          <stop offset="0" stopColor={tom(cor, 1.18)} />
          <stop offset="0.55" stopColor={cor} />
          <stop offset="1" stopColor={tom(cor, 0.55)} stopOpacity={0.15} />
        </radialGradient>
      </defs>
      {new Array(n)
        .fill(0)
        .map((_, i) => {
          const r = (s: string) => random(`${id}${s}${i}`);
          const ang = r("a") * Math.PI * 2;
          const z = Math.sin(ang) * abre * ease * r("d");
          const wx = x + Math.cos(ang) * abre * ease * (0.3 + r("d") * 0.9);
          const wy = y - sobe * ease * (0.2 + r("u") * 0.9) + (r("y") - 0.5) * 40;
          const [sx, sy, e] = projeta(wx, wy, z);
          return { z, sx, sy, e, rr: raio * (0.45 + r("t") * 0.75) * (0.35 + ease), i };
        })
        .sort((p, q) => q.z - p.z)
        .map((b) => (
          <circle key={b.i} cx={b.sx} cy={b.sy} r={b.rr * b.e} fill={`url(#${id})`} opacity={forca * (1 - k) ** 1.3} />
        ))}
    </g>
  );
};

// Chão molhado: faixa de luz refletida no asfalto, com ondinha, que começa no pé da fonte de luz.
export const Molhado: React.FC<{ t: number; luzes: { x: number; y: number; cor: string; forca?: number; l?: number; h?: number }[] }> = ({ t, luzes }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", pointerEvents: "none", mixBlendMode: "screen" }}>
    <defs>
      <linearGradient id="reflexoQueda" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fff" stopOpacity={0.85} />
        <stop offset="1" stopColor="#fff" stopOpacity={0} />
      </linearGradient>
      <mask id="reflexoMask">
        <rect x={0} y={0} width={1080} height={1920} fill="url(#reflexoQueda)" />
      </mask>
    </defs>
    {luzes.map((m, i) => {
      const h = m.h ?? 300;
      const l = m.l ?? 90;
      return (
        <g key={i} opacity={m.forca ?? 0.5}>
          <defs>
            <linearGradient id={`refl${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={m.cor} stopOpacity={0.9} />
              <stop offset="1" stopColor={m.cor} stopOpacity={0} />
            </linearGradient>
          </defs>
          {new Array(9).fill(0).map((_, k) => {
            const yy = m.y + (k * h) / 9;
            const w = l * (1 + k * 0.1) * (1 + 0.28 * Math.sin(t * 5 + k * 1.7));
            return <ellipse key={k} cx={m.x + Math.sin(t * 3.1 + k * 2.1) * 8} cy={yy} rx={w} ry={h / 14} fill={`url(#refl${i})`} opacity={1 - k / 9} />;
          })}
        </g>
      );
    })}
  </svg>
);
