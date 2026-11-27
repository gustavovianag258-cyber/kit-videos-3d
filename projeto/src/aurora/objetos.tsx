// Kit de objetos da casa do Jonas (SVG chapado, mesmo traço dos personagens). Cada objeto é
// desenhado com a base em (x, y) e `e` = escala. Servem pra encher fundo e primeiro plano.

type P = { x: number; y: number; e?: number };
const G: React.FC<P & { children: React.ReactNode }> = ({ x, y, e = 1, children }) => <g transform={`translate(${x} ${y}) scale(${e})`}>{children}</g>;

// ---------- quarto ----------
export const Cama: React.FC<P & { lencol?: string }> = ({ lencol = "#8A6AA0", ...p }) => (
  <G {...p}>
    <rect x={-20} y={-420} width={60} height={420} rx={10} fill="#5B3F2C" />
    <rect x={0} y={-200} width={900} height={120} rx={20} fill="#6E4C34" />
    <rect x={10} y={-290} width={880} height={110} rx={30} fill="#F2EEE6" />
    <path d="M 260 -300 Q 560 -340 890 -300 L 890 -170 Q 600 -150 260 -175 Z" fill={lencol} />
    <rect x={40} y={-340} width={220} height={80} rx={36} fill="#FFFFFF" />
    <rect x={860} y={-80} width={40} height={80} fill="#5B3F2C" />
    <rect x={20} y={-80} width={40} height={80} fill="#5B3F2C" />
  </G>
);

export const CriadoMudo: React.FC<P & { abajur?: boolean; aceso?: boolean }> = ({ abajur = true, aceso, ...p }) => (
  <G {...p}>
    <rect x={-90} y={-220} width={180} height={220} rx={10} fill="#8B5E3C" />
    <rect x={-80} y={-150} width={160} height={60} rx={6} fill="#9C6C46" />
    <circle cx={0} cy={-120} r={8} fill="#D9B98C" />
    {abajur && (
      <>
        <rect x={-6} y={-330} width={12} height={110} fill="#444" />
        <path d="M -70 -330 L 70 -330 L 45 -420 L -45 -420 Z" fill={aceso ? "#FFE3A0" : "#E8D9B8"} />
        {aceso && <circle cx={0} cy={-360} r={140} fill="#FFD680" opacity={0.25} style={{ filter: "blur(30px)" }} />}
      </>
    )}
    <rect x={30} y={-245} width={44} height={25} rx={4} fill="#3A6EA5" />
  </G>
);

export const Poster: React.FC<P & { cor?: string }> = ({ cor = "#E0565B", ...p }) => (
  <G {...p}>
    <rect x={-110} y={-150} width={220} height={300} rx={6} fill="#1E1A2E" />
    <circle cx={0} cy={-30} r={70} fill={cor} />
    <rect x={-80} y={80} width={160} height={14} rx={4} fill="#EEE" />
    <rect x={-60} y={104} width={120} height={10} rx={4} fill="#999" />
  </G>
);

export const Prateleira: React.FC<P> = (p) => (
  <G {...p}>
    <rect x={-200} y={0} width={400} height={18} fill="#6E4C34" />
    {["#E0A040", "#5DA0D0", "#C05070", "#70B070", "#D0D070", "#8A6AA0"].map((c, i) => (
      <rect key={i} x={-190 + i * 36} y={-110 + (i % 3) * 8} width={30} height={110 - (i % 3) * 8} fill={c} />
    ))}
    <rect x={60} y={-60} width={70} height={60} rx={8} fill="#2E3B57" />
    <circle cx={160} cy={-30} r={28} fill="#3E8E5E" />
    <rect x={146} y={-10} width={28} height={12} fill="#9C6C46" />
  </G>
);

export const Ventilador: React.FC<P & { t?: number }> = ({ t = 0, ...p }) => (
  <G {...p}>
    <rect x={-60} y={-12} width={120} height={20} rx={10} fill="#DDD" />
    <rect x={-8} y={-260} width={16} height={250} fill="#CCC" />
    <circle cx={0} cy={-300} r={90} fill="none" stroke="#BBB" strokeWidth={8} />
    <g transform={`translate(0 -300) rotate(${t * 900})`}>
      {[0, 120, 240].map((a) => (
        <ellipse key={a} cx={0} cy={-45} rx={22} ry={45} fill="#7FB3E8" transform={`rotate(${a})`} opacity={0.8} />
      ))}
    </g>
    <circle cx={0} cy={-300} r={14} fill="#888" />
  </G>
);

export const RoupaNoChao: React.FC<P> = (p) => (
  <G {...p}>
    <path d="M -120 0 Q -90 -50 -20 -40 Q 40 -60 110 -30 Q 140 -5 100 10 Q 0 25 -120 0 Z" fill="#C05070" />
    <path d="M 80 -10 Q 140 -40 200 -15 Q 210 10 150 15 Z" fill="#3E6894" />
  </G>
);

export const Tenis: React.FC<P> = (p) => (
  <G {...p}>
    <path d="M -90 0 L -90 -40 Q -60 -70 -10 -60 L 40 -40 Q 90 -30 95 -5 L 95 0 Z" fill="#F4F1EA" />
    <rect x={-92} y={-8} width={190} height={12} rx={6} fill="#C9C1B3" />
    <path d="M -40 -50 L 20 -30" stroke="#2F6FB0" strokeWidth={10} />
  </G>
);

// ---------- cozinha ----------
export const Geladeira: React.FC<P> = (p) => (
  <G {...p}>
    <rect x={-130} y={-760} width={260} height={760} rx={22} fill="#E6E6E6" />
    <rect x={-130} y={-520} width={260} height={8} fill="#C9C9C9" />
    <rect x={95} y={-700} width={12} height={130} rx={6} fill="#AAA" />
    <rect x={95} y={-460} width={12} height={160} rx={6} fill="#AAA" />
    {[
      [-80, -680, "#E0565B"],
      [-30, -640, "#F0C040"],
      [10, -700, "#5DA0D0"],
      [-70, -580, "#70B070"],
    ].map(([x, y, c], i) => (
      <rect key={i} x={x as number} y={y as number} width={40} height={30} rx={6} fill={c as string} />
    ))}
    <rect x={-60} y={-470} width={110} height={140} fill="#FFFDF5" transform="rotate(4 0 -400)" />
  </G>
);

export const Fogao: React.FC<P & { t?: number }> = ({ t = 0, ...p }) => (
  <G {...p}>
    <rect x={-160} y={-300} width={320} height={300} rx={12} fill="#F2F2F2" />
    <rect x={-160} y={-320} width={320} height={30} rx={8} fill="#333" />
    <rect x={-130} y={-230} width={260} height={180} rx={10} fill="#3A3A3A" />
    {[-90, -30, 30, 90].map((x) => (
      <circle key={x} cx={x} cy={-270} r={10} fill="#222" />
    ))}
    <rect x={-100} y={-420} width={140} height={100} rx={14} fill="#9AA3AD" />
    <rect x={-120} y={-430} width={180} height={18} rx={8} fill="#7D858E" />
    {[0, 1, 2].map((i) => (
      <path key={i} d={`M ${-60 + i * 30} -440 q 10 -20 0 -40 q -10 -20 0 -40`} stroke="#fff" strokeWidth={6} fill="none" opacity={0.25 + 0.2 * Math.sin(t * 4 + i)} />
    ))}
  </G>
);

export const FiltroBarro: React.FC<P> = (p) => (
  <G {...p}>
    <path d="M -80 0 Q -100 -120 -70 -170 L 70 -170 Q 100 -120 80 0 Z" fill="#B8643A" />
    <path d="M -70 -170 Q -95 -260 -60 -320 L 60 -320 Q 95 -260 70 -170 Z" fill="#C97447" />
    <rect x={-50} y={-340} width={100} height={24} rx={10} fill="#A85A33" />
    <rect x={60} y={-80} width={40} height={14} rx={6} fill="#ddd" />
  </G>
);

export const Fruteira: React.FC<P> = (p) => (
  <G {...p}>
    <path d="M -110 -40 Q 0 30 110 -40 Z" fill="#C9A06A" />
    <circle cx={-50} cy={-60} r={34} fill="#E8873A" />
    <circle cx={10} cy={-70} r={36} fill="#D94A4A" />
    <path d="M 40 -60 Q 90 -120 120 -70" stroke="#F0D040" strokeWidth={26} fill="none" strokeLinecap="round" />
  </G>
);

export const Calendario: React.FC<P> = (p) => (
  <G {...p}>
    <rect x={-70} y={-100} width={140} height={190} rx={6} fill="#FFFDF5" />
    <rect x={-70} y={-100} width={140} height={40} fill="#D94A4A" />
    {new Array(12).fill(0).map((_, i) => (
      <rect key={i} x={-58 + (i % 4) * 30} y={-48 + Math.floor(i / 4) * 40} width={20} height={20} fill={i === 5 ? "#3CF0A0" : "#DDD"} />
    ))}
  </G>
);

export const PanoDePrato: React.FC<P> = (p) => (
  <G {...p}>
    <rect x={-10} y={-10} width={120} height={14} rx={6} fill="#777" />
    <rect x={10} y={0} width={80} height={140} fill="#F4F1EA" />
    {[30, 60, 90, 120].map((y) => (
      <rect key={y} x={10} y={y} width={80} height={8} fill="#D94A4A" />
    ))}
  </G>
);

export const Xicara: React.FC<P> = (p) => (
  <G {...p}>
    <path d="M -50 -90 L 50 -90 L 40 0 L -40 0 Z" fill="#F4F1EA" />
    <path d="M 50 -70 q 35 0 35 30 q 0 30 -40 25" stroke="#F4F1EA" strokeWidth={12} fill="none" />
    <rect x={-50} y={-90} width={100} height={12} fill="#6B3E1E" />
  </G>
);

// ---------- sala ----------
export const Televisao: React.FC<P & { t?: number }> = ({ t = 0, ...p }) => (
  <G {...p}>
    <rect x={-220} y={-60} width={440} height={60} rx={8} fill="#5B3F2C" />
    <rect x={-200} y={-330} width={400} height={250} rx={12} fill="#1d1d22" />
    <rect x={-185} y={-315} width={370} height={220} rx={6} fill="#2E5A8A" />
    <rect x={-185} y={-315} width={370} height={220} rx={6} fill="#7FC4F0" opacity={0.25 + 0.15 * Math.sin(t * 6)} />
    <rect x={-160} y={-170} width={200} height={20} rx={6} fill="#F0C040" opacity={0.9} />
  </G>
);

export const Planta: React.FC<P> = (p) => (
  <G {...p}>
    <path d="M -50 0 L -60 -90 L 60 -90 L 50 0 Z" fill="#B8643A" />
    {[-60, -25, 10, 45].map((a, i) => (
      <ellipse key={i} cx={Math.sin((a * Math.PI) / 180) * 60} cy={-170 - (i % 2) * 30} rx={26} ry={90} fill={i % 2 ? "#3E8E5E" : "#4FA36C"} transform={`rotate(${a} 0 -90)`} />
    ))}
  </G>
);

export const Quadro: React.FC<P> = (p) => (
  <G {...p}>
    <rect x={-110} y={-80} width={220} height={160} rx={6} fill="#D9B98C" />
    <rect x={-95} y={-65} width={190} height={130} fill="#8FC2D9" />
    <path d="M -95 65 L -30 0 L 20 40 L 60 10 L 95 65 Z" fill="#4FA36C" />
    <circle cx={50} cy={-30} r={18} fill="#F0D040" />
  </G>
);

export const Tapete: React.FC<P & { cor?: string }> = ({ cor = "#9A4F5A", ...p }) => (
  <G {...p}>
    <ellipse cx={0} cy={0} rx={420} ry={90} fill={cor} />
    <ellipse cx={0} cy={0} rx={340} ry={66} fill="none" stroke="#F2E2C8" strokeWidth={8} opacity={0.6} />
  </G>
);
