import { random, useCurrentFrame } from "remotion";
import { FONTE } from "../aurora/estilo";
import { Gente } from "./corpo";

// O que faz o bairro parecer vivo (pedido do usuário: "mais vivo, menos artificial"): trânsito,
// gente passando, passarinho, pipa, folha voando, roupa no varal e árvore com vento. Tudo usa o
// relógio do vídeo, então continua igual de um corte pro outro, como numa rua de verdade.

const mod = (a: number, n: number) => ((a % n) + n) % n;

// ---------- balanço de vento ----------
export const Balanca: React.FC<{ x: number; y: number; forca?: number; vel?: number; fase?: number; children: React.ReactNode }> = ({ x, y, forca = 2, vel = 1.3, fase = 0, children }) => {
  const tg = useCurrentFrame() / 30;
  const a = Math.sin(tg * vel + fase) * forca + Math.sin(tg * vel * 2.7 + fase) * forca * 0.35;
  return <g transform={`rotate(${a} ${x} ${y})`}>{children}</g>;
};

// roupa pendurada: cada peça balança sozinha
export const Varal: React.FC<{ x1: number; y1: number; x2: number; y2: number; cores?: string[] }> = ({ x1, y1, x2, y2, cores = ["#E0565B", "#F4ECDD", "#4B7FB3", "#E6B83A"] }) => (
  <g>
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#999" strokeWidth={3} />
    {cores.map((c, i) => {
      const k = (i + 0.6) / cores.length;
      const px = x1 + (x2 - x1) * k;
      const py = y1 + (y2 - y1) * k;
      return (
        <Balanca key={i} x={px} y={py} forca={9} vel={2.4} fase={i * 1.3}>
          <rect x={px - 26} y={py} width={52} height={78} rx={6} fill={c} />
          <rect x={px - 26} y={py} width={52} height={78} rx={6} fill="rgba(0,0,0,0.08)" />
        </Balanca>
      );
    })}
  </g>
);

// ---------- veículos com roda girando ----------
export const Roda: React.FC<{ x: number; y: number; r: number; giro: number }> = ({ x, y, r, giro }) => (
  <g transform={`translate(${x} ${y}) rotate(${giro})`}>
    <circle r={r} fill="#17171C" />
    <circle r={r * 0.5} fill="#9EA3AB" />
    <rect x={-r * 0.5} y={-2.5} width={r} height={5} fill="#5A5E66" />
    <rect x={-2.5} y={-r * 0.5} width={5} height={r} fill="#5A5E66" />
  </g>
);

const Carro: React.FC<{ cor: string; giro: number; bob: number }> = ({ cor, giro, bob }) => (
  <g>
    <ellipse cx={0} cy={4} rx={190} ry={14} fill="rgba(0,0,0,0.3)" />
    <g transform={`translate(0 ${bob})`}>
      <rect x={-175} y={-112} width={350} height={84} rx={26} fill={cor} />
      <rect x={-175} y={-112} width={350} height={84} rx={26} fill="url(#luzVeic)" />
      <path d="M -112 -112 Q -92 -186 -20 -186 L 62 -186 Q 112 -186 134 -112 Z" fill={cor} />
      <path d="M -92 -116 Q -78 -170 -24 -172 L -24 -116 Z M -8 -116 L -8 -172 L 54 -172 Q 94 -170 112 -116 Z" fill="#A9C8DE" />
      <rect x={155} y={-92} width={22} height={18} rx={5} fill="#FFE9A8" />
      <rect x={-177} y={-92} width={16} height={18} rx={4} fill="#E04040" />
      <rect x={-20} y={-82} width={26} height={7} rx={3} fill="rgba(0,0,0,0.3)" />
    </g>
    <Roda x={-102} y={-34} r={36} giro={giro} />
    <Roda x={102} y={-34} r={36} giro={giro} />
  </g>
);

const Onibus: React.FC<{ giro: number; bob: number }> = ({ giro, bob }) => (
  <g>
    <ellipse cx={0} cy={4} rx={400} ry={16} fill="rgba(0,0,0,0.3)" />
    <g transform={`translate(0 ${bob})`}>
      <rect x={-380} y={-300} width={760} height={270} rx={24} fill="#F0E2BE" />
      <rect x={-380} y={-140} width={760} height={46} fill="#1F7F8C" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x={-356 + i * 118} y={-278} width={100} height={104} rx={12} fill="#22304A" />
      ))}
      <rect x={-380} y={-300} width={760} height={270} rx={24} fill="url(#luzVeic)" />
      <rect x={340} y={-250} width={38} height={120} rx={8} fill="#A9C8DE" />
      <text x={0} y={-104} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={30} fill="#fff">
        JD. AURORA · TERMINAL
      </text>
    </g>
    <Roda x={-250} y={-36} r={42} giro={giro} />
    <Roda x={250} y={-36} r={42} giro={giro} />
  </g>
);

const Caminhao: React.FC<{ giro: number; bob: number }> = ({ giro, bob }) => (
  <g>
    <ellipse cx={0} cy={4} rx={420} ry={16} fill="rgba(0,0,0,0.3)" />
    <g transform={`translate(0 ${bob})`}>
      <rect x={-400} y={-300} width={620} height={250} fill="#F2EDE0" />
      <rect x={-400} y={-300} width={620} height={250} fill="url(#luzVeic)" />
      <text x={-90} y={-180} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={66} fill="#2F5DA8">
        MUDANÇAS DA ZL
      </text>
      <rect x={-400} y={-80} width={620} height={12} fill="#C8322B" />
      <path d="M 230 -240 L 340 -240 L 400 -150 L 400 -50 L 230 -50 Z" fill="#C8322B" />
      <path d="M 262 -222 L 330 -222 L 374 -150 L 262 -150 Z" fill="#A9C8DE" />
    </g>
    <Roda x={-280} y={-36} r={42} giro={giro} />
    <Roda x={-170} y={-36} r={42} giro={giro} />
    <Roda x={300} y={-36} r={42} giro={giro} />
  </g>
);

const MotoQuePassa: React.FC<{ giro: number; cor: string }> = ({ giro, cor }) => (
  <g transform="scale(0.8)">
    <ellipse cx={0} cy={4} rx={150} ry={10} fill="rgba(0,0,0,0.3)" />
    <path d="M -80 -50 L -20 -110 L 50 -110 L 90 -50 Z" fill={cor} />
    <Roda x={-90} y={-46} r={46} giro={giro} />
    <Roda x={90} y={-46} r={46} giro={giro} />
    <rect x={-36} y={-230} width={66} height={110} rx={20} fill="#2F3A52" />
    <circle cx={6} cy={-262} r={36} fill="#1B1B22" />
    <rect x={10} y={-200} width={70} height={18} rx={9} fill="#2F3A52" transform="rotate(24 10 -200)" />
  </g>
);

type Veic = { tipo: "carro" | "onibus" | "caminhao" | "moto"; v: number; off: number; cor?: string; pista: 0 | 1 };
const FROTA: Veic[] = [
  { tipo: "carro", v: 980, off: 200, cor: "#C8322B", pista: 1 },
  { tipo: "moto", v: 1100, off: 2100, cor: "#2F5DA8", pista: 1 },
  { tipo: "onibus", v: 760, off: 3300, pista: 1 },
  { tipo: "carro", v: 1040, off: 5200, cor: "#E6B83A", pista: 1 },
  { tipo: "caminhao", v: 800, off: 6800, pista: 1 },
  { tipo: "carro", v: 620, off: 300, cor: "#3C8C6A", pista: 0 },
  { tipo: "moto", v: 700, off: 2300, cor: "#B3262C", pista: 0 },
  { tipo: "carro", v: 600, off: 4500, cor: "#F4F0E6", pista: 0 },
];
const PERIODO = 9000;

// Trânsito: passa na rua, atrás das pessoas da calçada, em tamanho real pra elas.
export const Transito: React.FC<{ pista: 0 | 1; noite?: boolean }> = ({ pista, noite }) => {
  const tg = useCurrentFrame() / 30;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", pointerEvents: "none" }}>
      <defs>
        <linearGradient id="luzVeic" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity={0.22} />
          <stop offset="0.5" stopColor="#fff" stopOpacity={0} />
          <stop offset="1" stopColor="#000" stopOpacity={0.3} />
        </linearGradient>
      </defs>
      {FROTA.filter((f) => f.pista === pista).map((f, i) => {
        const d = mod(tg * f.v + f.off, PERIODO) - 1000;
        if (d > 2200) return null;
        const x = pista === 1 ? d : 1080 - d;
        const giro = tg * f.v * 0.8;
        const bob = Math.sin(tg * 16 + i) * 1.6;
        const e = pista === 1 ? 2.1 : 1.4;
        const y = pista === 1 ? 1545 : 1385;
        return (
          <g key={i} transform={`translate(${x} ${y}) scale(${pista === 1 ? e : -e} ${e})`} opacity={noite ? 0.92 : 1}>
            {f.tipo === "carro" && <Carro cor={f.cor!} giro={giro} bob={bob} />}
            {f.tipo === "onibus" && <Onibus giro={giro} bob={bob} />}
            {f.tipo === "caminhao" && <Caminhao giro={giro} bob={bob} />}
            {f.tipo === "moto" && <MotoQuePassa giro={giro} cor={f.cor!} />}
          </g>
        );
      })}
    </svg>
  );
};

// ---------- gente passando na calçada, bem menor (lá atrás) ----------
const PASSANTES = [
  { v: 340, off: 100, cor: "#C05070", pele: "#C98B5E", cabelo: "#2B1E1A", longo: true, dir: 1 as const },
  { v: 300, off: 1500, cor: "#3C8C6A", pele: "#8D5A3C", cabelo: "#17120F", longo: false, dir: -1 as const },
  { v: 360, off: 2700, cor: "#E6B83A", pele: "#E0B08A", cabelo: "#5A3A2A", longo: false, dir: 1 as const },
  { v: 320, off: 3900, cor: "#4B7FB3", pele: "#C98B5E", cabelo: "#D8D4CC", longo: true, dir: -1 as const },
];
export const Passantes: React.FC<{ raio?: number; noite?: boolean }> = ({ raio = 0, noite }) => {
  const tg = useCurrentFrame() / 30;
  return (
    <g opacity={noite ? 0.75 : 1}>
      {PASSANTES.map((p, i) => {
        const d = mod(tg * p.v + p.off, 5200) - 240;
        if (d > 1400) return null;
        const x = p.dir === 1 ? d : 1080 - d;
        return <Gente key={i} x={x} y={1610} e={0.95} cor={p.cor} pele={p.pele} cabelo={p.cabelo} longo={p.longo} anda={p.v / 423} dir={p.dir} raio={raio} celular={i === 2} semente={`pass${i}`} />;
      })}
    </g>
  );
};

// ---------- céu ----------
export const Passaros: React.FC<{ y?: number }> = ({ y = 420 }) => {
  const tg = useCurrentFrame() / 30;
  return (
    <g>
      {[0, 1, 2, 3, 4].map((i) => {
        const x = mod(tg * 90 + i * 46, 1500) - 200;
        const py = y + Math.sin(tg * 0.8 + i) * 22 + i * 16;
        const asa = Math.sin(tg * 14 + i * 2) * 13;
        return <path key={i} d={`M ${x - 18} ${py - asa} Q ${x - 6} ${py - 3} ${x} ${py} Q ${x + 6} ${py - 3} ${x + 18} ${py - asa}`} stroke="#2A2A30" strokeWidth={4} fill="none" strokeLinecap="round" />;
      })}
    </g>
  );
};

export const PipaNoCeu: React.FC<{ x?: number; y?: number; cor?: string }> = ({ x = 800, y = 520, cor = "#E0565B" }) => {
  const tg = useCurrentFrame() / 30;
  const px = x + Math.sin(tg * 0.9) * 46;
  const py = y + Math.sin(tg * 1.4) * 34;
  const a = Math.sin(tg * 1.7) * 16;
  return (
    <g>
      <path d={`M ${px} ${py} Q ${px - 60} ${py + 240} ${x - 240} ${y + 620}`} stroke="rgba(255,255,255,0.55)" strokeWidth={2} fill="none" />
      <g transform={`translate(${px} ${py}) rotate(${a})`}>
        <polygon points="0,-46 34,0 0,46 -34,0" fill={cor} />
        <polygon points="0,-46 34,0 0,0" fill="rgba(255,255,255,0.25)" />
        <path d={`M 0 46 q ${Math.sin(tg * 5) * 18} 26 0 52 q ${-Math.sin(tg * 5) * 18} 26 0 52`} stroke={cor} strokeWidth={5} fill="none" />
      </g>
    </g>
  );
};

// ---------- ar e fumaça ----------
export const Folhas: React.FC<{ n?: number; cor?: string }> = ({ n = 8, cor = "#7A9A4A" }) => {
  const tg = useCurrentFrame() / 30;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", pointerEvents: "none" }}>
      {new Array(n).fill(0).map((_, i) => {
        const v = 140 + random(`fv${i}`) * 180;
        const x = mod(tg * v + random(`fx${i}`) * 1400, 1400) - 160;
        const y = 1180 + random(`fy${i}`) * 560 + Math.sin(tg * 2 + i) * 40;
        const a = tg * 190 * (i % 2 ? 1 : -1);
        return <ellipse key={i} cx={0} cy={0} rx={13} ry={6} fill={i % 3 === 0 ? "#E8E2D0" : cor} transform={`translate(${x} ${y}) rotate(${a})`} opacity={0.85} />;
      })}
    </svg>
  );
};

export const Fumaca: React.FC<{ x: number; y: number; n?: number; cor?: string; sobe?: number }> = ({ x, y, n = 7, cor = "#D8D4CC", sobe = 240 }) => {
  const tg = useCurrentFrame() / 30;
  return (
    <g>
      {new Array(n).fill(0).map((_, i) => {
        const k = mod(tg * 0.5 + i / n, 1);
        return <circle key={i} cx={x + Math.sin(tg * 1.3 + i) * 30 * k} cy={y - k * sobe} r={14 + k * 46} fill={cor} opacity={0.32 * (1 - k)} />;
      })}
    </g>
  );
};

// poeira que levanta no pé ou na roda (t = segundos desde o começo do efeito)
export const Poeirinha: React.FC<{ t: number; x: number; y: number; forca?: number }> = ({ t, x, y, forca = 1 }) => {
  if (t < 0 || t > 0.9) return null;
  return (
    <g opacity={(1 - t / 0.9) * 0.75}>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = -2.6 + i * 0.42;
        const d = 40 + t * 240 * forca;
        return <circle key={i} cx={x + Math.cos(a) * d} cy={y + Math.sin(a) * d * 0.45} r={16 + t * 60} fill="#CFC6B4" opacity={0.7} />;
      })}
    </g>
  );
};

// Momentos em que um veículo da pista de perto passa pelo meio da tela (pro som acompanhar).
export const passagens = (de: number, ate: number): number[] => {
  const saida: number[] = [];
  for (const f of FROTA) {
    if (f.pista !== 1) continue;
    for (let n = 0; n < 40; n++) {
      const s = (1540 - f.off + n * PERIODO) / f.v;
      if (s >= de && s < ate) saida.push(s);
    }
  }
  return saida;
};
