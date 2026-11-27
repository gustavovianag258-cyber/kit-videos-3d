import { COR, FONTE } from "../aurora/estilo";

// Kit de objetos da rua, da escola e do quarto do Bruno (mesmo traço do kit do ep. 1:
// base em (x, y), `e` = escala). Servem pra encher fundo e primeiro plano.

type P = { x: number; y: number; e?: number };
const G: React.FC<P & { children: React.ReactNode; a?: number }> = ({ x, y, e = 1, a = 0, children }) => (
  <g transform={`translate(${x} ${y}) scale(${e}) rotate(${a})`}>{children}</g>
);

// ---------- rua ----------
export const Arvore: React.FC<P & { cor?: string }> = ({ cor = "#4E8A43", ...p }) => (
  <G {...p}>
    <rect x={-14} y={-260} width={28} height={260} fill="#6B4A32" />
    <circle cx={-60} cy={-300} r={90} fill={cor} />
    <circle cx={60} cy={-310} r={80} fill={cor} />
    <circle cx={0} cy={-380} r={100} fill={cor} />
    <circle cx={-20} cy={-350} r={50} fill="rgba(255,255,255,0.08)" />
    <rect x={-40} y={-30} width={80} height={30} fill="#8C8F96" />
  </G>
);

export const CarroParado: React.FC<P & { cor?: string }> = ({ cor = "#2F5DA8", ...p }) => (
  <G {...p}>
    <rect x={-170} y={-110} width={340} height={80} rx={24} fill={cor} />
    <path d="M -110 -110 Q -90 -180 -20 -180 L 60 -180 Q 110 -180 130 -110 Z" fill={cor} />
    <path d="M -90 -114 Q -76 -164 -24 -166 L -24 -114 Z M -8 -114 L -8 -166 L 52 -166 Q 92 -164 110 -114 Z" fill="#9FC0D8" />
    <rect x={150} y={-90} width={22} height={16} rx={4} fill="#FFD27A" />
    <rect x={-172} y={-90} width={18} height={16} rx={4} fill="#E04040" />
    <circle cx={-100} cy={-30} r={36} fill="#1E1E22" />
    <circle cx={100} cy={-30} r={36} fill="#1E1E22" />
    <circle cx={-100} cy={-30} r={16} fill="#9EA3AB" />
    <circle cx={100} cy={-30} r={16} fill="#9EA3AB" />
  </G>
);

export const Lixeira: React.FC<P> = (p) => (
  <G {...p}>
    <rect x={-8} y={-200} width={16} height={200} fill="#5C6068" />
    <path d="M -46 -190 L 46 -190 L 38 -90 L -38 -90 Z" fill="#E6862E" />
    <rect x={-48} y={-198} width={96} height={12} rx={4} fill="#C96A1C" />
  </G>
);

export const PlacaPonto: React.FC<P> = (p) => (
  <G {...p}>
    <rect x={-7} y={-380} width={14} height={380} fill="#6B6F78" />
    <rect x={-60} y={-460} width={120} height={90} rx={10} fill="#2F5DA8" />
    <text x={0} y={-404} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={34} fill="#fff">
      PONTO
    </text>
  </G>
);

export const Orelhao: React.FC<P> = (p) => (
  <G {...p}>
    <rect x={-8} y={-230} width={16} height={230} fill="#5C6068" />
    <path d="M -80 -230 Q -90 -360 0 -370 Q 90 -360 80 -230 Z" fill="#F2C230" />
    <rect x={-26} y={-310} width={52} height={70} rx={6} fill="#C9C9C9" />
  </G>
);

export const Cachorro: React.FC<P & { t?: number }> = ({ t = 0, ...p }) => (
  <G {...p}>
    <path d={`M 70 -70 q ${30 + Math.sin(t * 14) * 14} -30 ${40 + Math.sin(t * 14) * 10} -60`} stroke="#C99A62" strokeWidth={14} fill="none" strokeLinecap="round" />
    <ellipse cx={0} cy={-70} rx={80} ry={40} fill="#C99A62" />
    {[-55, -25, 25, 55].map((x) => (
      <rect key={x} x={x - 8} y={-50} width={16} height={50} rx={6} fill="#B07F4A" />
    ))}
    <circle cx={-80} cy={-110} r={36} fill="#C99A62" />
    <ellipse cx={-62} cy={-130} rx={14} ry={24} fill="#8E6438" />
    <ellipse cx={-110} cy={-100} rx={16} ry={12} fill="#B07F4A" />
    <circle cx={-122} cy={-104} r={6} fill={COR.tinta} />
    <circle cx={-88} cy={-118} r={5} fill={COR.tinta} />
  </G>
);

export const Bicicleta: React.FC<P> = (p) => (
  <G {...p}>
    <circle cx={-80} cy={-60} r={58} fill="none" stroke="#2A2A30" strokeWidth={10} />
    <circle cx={80} cy={-60} r={58} fill="none" stroke="#2A2A30" strokeWidth={10} />
    <path d="M -80 -60 L -20 -140 L 60 -140 L 80 -60 M -20 -140 L 10 -60 L -80 -60 M 10 -60 L 60 -140 M 60 -140 L 50 -170 L 80 -170" stroke="#C8322B" strokeWidth={10} fill="none" strokeLinejoin="round" />
    <rect x={-44} y={-158} width={50} height={14} rx={6} fill="#2A2A30" />
  </G>
);

export const PlacaLoja: React.FC<P & { texto: string; cor?: string }> = ({ texto, cor = "#C8322B", ...p }) => (
  <G {...p}>
    <rect x={-150} y={-60} width={300} height={60} rx={6} fill={cor} />
    <text x={0} y={-18} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={38} fill="#fff">
      {texto}
    </text>
  </G>
);

// Pichação de muro (traço livre, não é marca de ninguém).
export const Picho: React.FC<P & { cor?: string }> = ({ cor = "#2A2A30", ...p }) => (
  <G {...p}>
    <path d="M 0 0 l 20 -60 l 20 60 m -10 -30 h -20 M 60 0 v -60 q 30 0 30 15 q 0 15 -30 15 l 34 30 M 110 -60 l 30 60 l 30 -60" stroke={cor} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </G>
);

export const Bueiro: React.FC<P> = (p) => (
  <G {...p}>
    <rect x={-60} y={-14} width={120} height={28} rx={4} fill="#3A3C44" />
    {[-40, -20, 0, 20, 40].map((x) => (
      <rect key={x} x={x - 4} y={-10} width={8} height={20} fill="#26282E" />
    ))}
  </G>
);

export const Pipa: React.FC<P & { a?: number }> = ({ a = 0, ...p }) => (
  <G {...p} a={a}>
    <path d="M 0 -60 L 40 0 L 0 60 L -40 0 Z" fill="#E0565B" />
    <path d="M 0 -60 L 0 60 M -40 0 L 40 0" stroke="#F4ECDD" strokeWidth={3} />
    <path d="M 0 60 q 20 40 -10 80 q -30 40 0 80" stroke="#F4ECDD" strokeWidth={3} fill="none" />
  </G>
);

// ---------- laje ----------
export const Antena: React.FC<P> = (p) => (
  <G {...p}>
    <rect x={-5} y={-300} width={10} height={300} fill="#8C9099" />
    {[0, 1, 2, 3].map((i) => (
      <rect key={i} x={-70 + i * 8} y={-290 + i * 30} width={140 - i * 16} height={6} fill="#8C9099" />
    ))}
  </G>
);

export const Vergalhao: React.FC<P> = (p) => (
  <G {...p}>
    {[-30, -10, 10, 30].map((x, i) => (
      <path key={x} d={`M ${x} 0 L ${x + (i - 1.5) * 6} -140`} stroke="#7A4A2A" strokeWidth={6} />
    ))}
    <rect x={-50} y={-10} width={100} height={20} fill="#8A8494" />
  </G>
);

export const CadeiraPraia: React.FC<P & { cor?: string }> = ({ cor = "#2F8FA8", ...p }) => (
  <G {...p}>
    <path d="M -70 0 L 40 -150 M 70 0 L -20 -90" stroke="#C9C9C9" strokeWidth={8} />
    <path d="M -50 -40 L 50 -40 L 60 -150 L 10 -150 Z" fill={cor} />
    {[0, 1, 2].map((i) => (
      <rect key={i} x={-46 + i * 34} y={-148} width={14} height={106} fill="#F4ECDD" opacity={0.6} />
    ))}
  </G>
);

export const Balde: React.FC<P & { cor?: string }> = ({ cor = "#E6B83A", ...p }) => (
  <G {...p}>
    <path d="M -40 -80 L 40 -80 L 32 0 L -32 0 Z" fill={cor} />
    <path d="M -40 -80 Q 0 -130 40 -80" stroke="#666" strokeWidth={4} fill="none" />
  </G>
);

export const Vaso: React.FC<P & { cor?: string }> = ({ cor = "#5FA052", ...p }) => (
  <G {...p}>
    <path d="M -36 -60 L 36 -60 L 28 0 L -28 0 Z" fill="#B65A3A" />
    {[-30, -10, 10, 30].map((x, i) => (
      <ellipse key={x} cx={x} cy={-90 - (i % 2) * 20} rx={18} ry={42} fill={cor} transform={`rotate(${x / 2} ${x} -70)`} />
    ))}
  </G>
);

export const Chinelo: React.FC<P & { cor?: string }> = ({ cor = "#2F5DA8", ...p }) => (
  <G {...p}>
    <ellipse cx={0} cy={0} rx={44} ry={14} fill={cor} />
    <path d="M -10 -6 L 10 -14 L 26 -4" stroke="#F4ECDD" strokeWidth={5} fill="none" />
  </G>
);

// ---------- quarto ----------
export const Luvas: React.FC<P> = (p) => (
  <G {...p}>
    {[-34, 34].map((x) => (
      <g key={x}>
        <rect x={x - 30} y={-60} width={60} height={60} rx={20} fill="#F4F4F0" />
        <rect x={x - 30} y={-62} width={60} height={14} rx={6} fill="#22222A" />
      </g>
    ))}
  </G>
);

export const Mochila: React.FC<P & { cor?: string }> = ({ cor = "#C0392B", ...p }) => (
  <G {...p}>
    <rect x={-70} y={-150} width={140} height={150} rx={36} fill={cor} />
    <rect x={-50} y={-70} width={100} height={56} rx={14} fill="rgba(0,0,0,0.15)" />
    <path d="M -30 -150 Q 0 -190 30 -150" stroke="#8E2A20" strokeWidth={10} fill="none" />
  </G>
);

export const Bola: React.FC<P> = (p) => (
  <G {...p}>
    <circle cx={0} cy={-40} r={40} fill="#F4F4F0" />
    <path d="M -20 -54 l 16 -12 l 18 6 l 2 20 l -18 10 l -16 -8 Z" fill="#22222A" />
  </G>
);

export const Medalhas: React.FC<P> = (p) => (
  <G {...p}>
    {[0, 1, 2].map((i) => (
      <g key={i}>
        <path d={`M ${i * 50 - 50} 0 L ${i * 50 - 40} 90 M ${i * 50 - 30} 0 L ${i * 50 - 40} 90`} stroke={["#2F5DA8", "#C8322B", "#2E8B57"][i]} strokeWidth={8} />
        <circle cx={i * 50 - 40} cy={104} r={18} fill={i === 0 ? "#E6B83A" : i === 1 ? "#C9CED6" : "#C27A3A"} />
      </g>
    ))}
    <rect x={-80} y={-8} width={140} height={10} rx={4} fill="#6E4C34" />
  </G>
);

export const Cortina: React.FC<P & { largura: number; altura: number; cor?: string }> = ({ largura, altura, cor = "#C05070", ...p }) => (
  <G {...p}>
    <rect x={-20} y={-14} width={largura + 40} height={12} rx={6} fill="#6E4C34" />
    {[0, 1].map((k) => (
      <path
        key={k}
        d={k === 0 ? `M 0 0 H 90 Q 70 ${altura / 2} 110 ${altura} H 0 Z` : `M ${largura} 0 H ${largura - 90} Q ${largura - 70} ${altura / 2} ${largura - 110} ${altura} H ${largura} Z`}
        fill={cor}
        opacity={0.9}
      />
    ))}
  </G>
);

export const Cadeira: React.FC<P> = (p) => (
  <G {...p}>
    <rect x={-60} y={-260} width={16} height={260} fill="#6E4C34" />
    <rect x={44} y={-130} width={16} height={130} fill="#6E4C34" />
    <rect x={-60} y={-140} width={120} height={20} fill="#8B5E3C" />
    <rect x={-60} y={-260} width={16} height={130} fill="#8B5E3C" />
    <path d="M -50 -250 Q 0 -230 30 -150 L -40 -150 Z" fill="#F2873A" />
  </G>
);

// ---------- busão e escola ----------
export const Extintor: React.FC<P> = (p) => (
  <G {...p}>
    <rect x={-22} y={-120} width={44} height={120} rx={18} fill="#C8322B" />
    <rect x={-10} y={-140} width={20} height={24} fill="#2A2A30" />
    <path d="M 10 -134 q 30 0 30 40" stroke="#2A2A30" strokeWidth={6} fill="none" />
  </G>
);

export const Adesivo: React.FC<P & { texto: string; cor?: string }> = ({ texto, cor = "#2F5DA8", ...p }) => (
  <G {...p}>
    <rect x={-110} y={-36} width={220} height={72} rx={10} fill={cor} />
    <text x={0} y={12} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={30} fill="#fff">
      {texto}
    </text>
  </G>
);

export const Cone: React.FC<P> = (p) => (
  <G {...p}>
    <path d="M -14 -90 L 14 -90 L 40 0 L -40 0 Z" fill="#F2873A" />
    <rect x={-26} y={-50} width={52} height={12} fill="#F4F4F0" />
    <rect x={-48} y={-6} width={96} height={10} rx={3} fill="#C96A1C" />
  </G>
);

export const Bebedouro: React.FC<P> = (p) => (
  <G {...p}>
    <rect x={-50} y={-200} width={100} height={200} rx={10} fill="#C9CED6" />
    <rect x={-40} y={-196} width={80} height={30} rx={6} fill="#9EA3AB" />
    <circle cx={0} cy={-150} r={8} fill="#5C6068" />
  </G>
);

export const Garrafa: React.FC<P & { cor?: string }> = ({ cor = "#5DA0D0", ...p }) => (
  <G {...p}>
    <rect x={-14} y={-70} width={28} height={70} rx={8} fill={cor} opacity={0.8} />
    <rect x={-7} y={-84} width={14} height={16} fill="#F4F4F0" />
  </G>
);
