import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { projeta } from "./tresd";
import { clamp, COR, FONTE } from "../aurora/estilo";
import { Roda } from "../aurora-ep4/vida";
import { Denis } from "./elenco";
import { Corpo } from "../aurora-ep4/pessoa";
import { Kaique, SeuEdson } from "../aurora-ep4/pessoa";

// Objetos do ep. 5: ferramentas, obra, ônibus que amassa, andaime, hospital, carro preto,
// caminhão-betoneira, chuva e a pasta com as fotos.

// ---------- ferramentas (pega em (0,0), cabeça pra cima) ----------
export const Martelo: React.FC<{ x?: number; y?: number; a?: number; e?: number }> = ({ x = 0, y = 0, a = 0, e = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${a}) scale(${e})`}>
    <rect x={-12} y={-210} width={24} height={270} rx={10} fill="#B5844F" />
    <rect x={-12} y={-210} width={9} height={270} rx={4} fill="rgba(255,255,255,0.16)" />
    <rect x={-12} y={0} width={24} height={60} rx={10} fill="#2A2A30" />
    <path d="M -46 -262 L 58 -262 L 66 -240 L 58 -206 L -46 -206 Q -92 -214 -106 -192 Q -104 -244 -46 -262 Z" fill="#4A4E58" />
    <rect x={-46} y={-262} width={104} height={14} fill="rgba(255,255,255,0.18)" />
  </g>
);

export const Marreta: React.FC<{ x?: number; y?: number; a?: number; e?: number; semCabeca?: boolean; cabo?: number }> = ({ x = 0, y = 0, a = 0, e = 1, semCabeca, cabo = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${a}) scale(${e})`}>
    <rect x={-13} y={-420 * cabo} width={26} height={420 * cabo + 70} rx={10} fill="#C2965C" />
    <rect x={-13} y={-420 * cabo} width={9} height={420 * cabo + 70} rx={4} fill="rgba(255,255,255,0.16)" />
    {semCabeca && <path d={`M -13 ${-420 * cabo} l 8 -22 l 7 16 l 8 -20 l 3 26 Z`} fill="#C2965C" />}
    {!semCabeca && <CabecaMarreta y={-450} />}
  </g>
);
export const CabecaMarreta: React.FC<{ x?: number; y?: number; a?: number }> = ({ x = 0, y = 0, a = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${a})`}>
    <rect x={-88} y={-50} width={176} height={100} rx={10} fill="#3F434C" />
    <rect x={-88} y={-50} width={176} height={20} rx={8} fill="rgba(255,255,255,0.15)" />
    <rect x={-94} y={-56} width={18} height={112} rx={5} fill="#565B66" />
    <rect x={76} y={-56} width={18} height={112} rx={5} fill="#565B66" />
  </g>
);

export const Balde: React.FC<{ x: number; y: number; e?: number; cor?: string; estoura?: number }> = ({ x, y, e = 1, cor = "#3A3F4A", estoura = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${e})`}>
    <ellipse cx={0} cy={3} rx={92} ry={11} fill="rgba(0,0,0,0.3)" />
    {estoura <= 0 ? (
      <g>
        <path d="M -82 -200 L 82 -200 L 64 0 L -64 0 Z" fill={cor} />
        <path d="M -82 -200 L -40 -200 L -30 0 L -64 0 Z" fill="rgba(255,255,255,0.1)" />
        <ellipse cx={0} cy={-202} rx={88} ry={20} fill="#2A2E36" />
        <ellipse cx={0} cy={-202} rx={72} ry={13} fill="#14161B" />
        <path d="M -78 -196 Q 0 -278 78 -196" stroke="#8A8F99" strokeWidth={6} fill="none" />
      </g>
    ) : (
      [-1, -0.6, -0.2, 0.3, 0.7, 1].map((k, i) => (
        <path key={i} d="M -30 -40 L 30 -46 L 22 30 L -26 26 Z" fill={cor} transform={`translate(${k * 340 * estoura} ${-70 - 300 * estoura + 620 * estoura * estoura + i * 6}) rotate(${(i - 2.5) * 200 * estoura})`} />
      ))
    )}
  </g>
);

export const Marmita: React.FC<{ x: number; y: number; e?: number }> = ({ x, y, e = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${e})`}>
    <rect x={-60} y={-44} width={120} height={44} rx={10} fill="#B8BCC4" />
    <rect x={-64} y={-54} width={128} height={15} rx={6} fill="#D2D6DC" />
    <rect x={-20} y={-30} width={40} height={10} rx={3} fill="#8A8F99" />
  </g>
);

export const Saco: React.FC<{ x: number; y: number; e?: number; a?: number }> = ({ x, y, e = 1, a = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${a}) scale(${e})`}>
    <path d="M -116 -74 Q 0 -90 116 -74 Q 128 -36 116 0 Q 0 10 -116 0 Q -128 -36 -116 -74 Z" fill="#D8CFBC" />
    <rect x={-82} y={-54} width={164} height={34} fill="#2F5DA8" opacity={0.8} />
    <text x={0} y={-28} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={26} fill="#fff">
      CIMENTO
    </text>
  </g>
);

// carrinho de mão, pilha de blocos, vergalhões: enche o canteiro
export const Carrinho: React.FC<{ x: number; y: number; e?: number }> = ({ x, y, e = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${e})`}>
    <ellipse cx={0} cy={3} rx={170} ry={11} fill="rgba(0,0,0,0.25)" />
    <circle cx={120} cy={-42} r={42} fill="#17171C" />
    <circle cx={120} cy={-42} r={15} fill="#9EA3AB" />
    <path d="M -130 -170 L 110 -170 L 76 -70 L -92 -70 Z" fill="#3C8C6A" />
    <path d="M -130 -170 L 110 -170 L 104 -150 L -122 -150 Z" fill="#C9C2B4" />
    <path d="M 120 -42 L -60 -70 L -220 -96" stroke="#5A5E66" strokeWidth={13} fill="none" strokeLinecap="round" />
    <path d="M -80 -70 L -96 0" stroke="#5A5E66" strokeWidth={11} />
  </g>
);
export const Blocos: React.FC<{ x: number; y: number; e?: number; lin?: number; col?: number }> = ({ x, y, e = 1, lin = 4, col = 4 }) => (
  <g transform={`translate(${x} ${y}) scale(${e})`}>
    {new Array(lin).fill(0).flatMap((_, l) =>
      new Array(col - (l % 2)).fill(0).map((__, c) => (
        <g key={`${l}${c}`}>
          <rect x={c * 96 + (l % 2) * 48} y={-(l + 1) * 54} width={92} height={50} fill={(l + c) % 3 ? "#A9A79E" : "#9B998F"} />
          <rect x={c * 96 + (l % 2) * 48 + 14} y={-(l + 1) * 54 + 12} width={24} height={26} fill="rgba(0,0,0,0.22)" />
          <rect x={c * 96 + (l % 2) * 48 + 54} y={-(l + 1) * 54 + 12} width={24} height={26} fill="rgba(0,0,0,0.22)" />
        </g>
      )),
    )}
  </g>
);

// ---------- vão sem janela, com profundidade ----------
const Vao: React.FC<{ x: number; y: number; l: number; a: number }> = ({ x, y, l, a }) => {
  const dx = l * 0.2;
  const dy = a * 0.2;
  const r = (px: number, py: number) => `${px},${py}`;
  return (
    <g>
      <rect x={x} y={y} width={l} height={a} fill="#1E1C1A" />
      <polygon points={[r(x, y), r(x + l, y), r(x + l - dx, y + dy), r(x + dx, y + dy)].join(" ")} fill="#2A2724" />
      <polygon points={[r(x, y + a), r(x + l, y + a), r(x + l - dx, y + a - dy), r(x + dx, y + a - dy)].join(" ")} fill="#6E675C" />
      <polygon points={[r(x, y), r(x + dx, y + dy), r(x + dx, y + a - dy), r(x, y + a)].join(" ")} fill="#4A4640" />
      <polygon points={[r(x + l, y), r(x + l - dx, y + dy), r(x + l - dx, y + a - dy), r(x + l, y + a)].join(" ")} fill="#332F2A" />
      <rect x={x + dx} y={y + dy} width={l - 2 * dx} height={a - 2 * dy} fill="#3E3A36" />
      <rect x={x - 6} y={y - 6} width={l + 12} height={10} fill="rgba(0,0,0,0.35)" />
    </g>
  );
};

// ---------- a obra de fundo: pilares, laje, tijolo à vista, tela, andaime ----------
export const Obra: React.FC<{ tarde?: boolean; blur?: number }> = ({ blur = 2 }) => {
  const tg = useCurrentFrame() / 30;
  return (
    <g>
      <g style={{ filter: blur ? `blur(${blur}px)` : undefined }}>
        <rect x={-40} y={-40} width={1160} height={1620} fill="#B9B3A6" />
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <rect x={-40} y={1570 - (i + 1) * 410} width={1160} height={410} fill={i % 2 ? "#8A8478" : "#807A6E"} />
            {/* tijolo à vista em parte da parede */}
            <g opacity={i === 3 ? 0.4 : 1}>
              {new Array(9).fill(0).flatMap((_, l) =>
                new Array(8).fill(0).map((__, c) => (
                  <rect key={`${i}${l}${c}`} x={(i * 2 + 1) % 3 === 0 ? 40 + c * 62 + (l % 2) * 30 : 560 + c * 62 + (l % 2) * 30} y={1570 - (i + 1) * 410 + 60 + l * 36} width={58} height={32} fill={(l * c + i) % 4 ? "#B8643C" : "#A65733"} />
                )),
              )}
            </g>
            {/* vão sem janela ainda */}
            <Vao x={(i * 2 + 1) % 3 === 0 ? 650 : 130} y={1570 - (i + 1) * 410 + 90} l={260} a={210} />
            <rect x={-40} y={1570 - (i + 1) * 410 - 26} width={1160} height={38} fill="#CFCABD" />
            <rect x={-40} y={1570 - (i + 1) * 410 + 12} width={1160} height={8} fill="rgba(0,0,0,0.25)" />
            {[20, 500, 980].map((px) => (
              <g key={px}>
                <rect x={px + 70} y={1570 - (i + 1) * 410} width={34} height={410} fill="rgba(0,0,0,0.22)" />
                <rect x={px} y={1570 - (i + 1) * 410} width={70} height={410} fill="#C4BEB0" />
                <rect x={px} y={1570 - (i + 1) * 410} width={22} height={410} fill="rgba(255,255,255,0.14)" />
              </g>
            ))}
          </g>
        ))}
        {/* vergalhões saindo em cima */}
        {[30, 44, 58, 510, 524, 538, 990, 1004, 1018].map((px) => (
          <line key={px} x1={px} y1={-30} x2={px + 5} y2={-100} stroke="#6E4A3A" strokeWidth={5} />
        ))}
      </g>
      {/* lona de obra balançando */}
      <path d={`M 820 ${1570 - 410 + 20} L 1090 ${1570 - 410 + 20} L 1090 1570 L ${830 + Math.sin(tg * 1.4) * 16} 1570 Z`} fill="#3D6E9E" opacity={0.75} />
    </g>
  );
};

// chão de terra batida do canteiro, com entulho, fita zebrada e o que mais tiver
export const ChaoObra: React.FC = () => (
  <g>
    <rect x={0} y={1568} width={1080} height={352} fill="#A4937A" />
    <rect x={0} y={1568} width={1080} height={352} fill="url(#terraSombra)" />
    <defs>
      <linearGradient id="terraSombra" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#000" stopOpacity={0.22} />
        <stop offset="0.4" stopColor="#000" stopOpacity={0} />
        <stop offset="1" stopColor="#000" stopOpacity={0.18} />
      </linearGradient>
    </defs>
    {new Array(26).fill(0).map((_, i) => (
      <ellipse key={i} cx={random(`tx${i}`) * 1080} cy={1600 + random(`ty${i}`) * 310} rx={8 + random(`tr${i}`) * 26} ry={4 + random(`tr${i}`) * 8} fill={i % 2 ? "#8E7E66" : "#B7A68C"} />
    ))}
  </g>
);

// ---------- ônibus de lado: a frente fica em x = 0 e o corpo vai pra esquerda ----------
export const OnibusLado: React.FC<{ x: number; y: number; e?: number; amassa?: number; giro?: number }> = ({ x, y, e = 3.1, amassa = 0, giro = 0 }) => {
  const a = amassa;
  const frente = `M -780 -300 L -26 -300 Q ${-6 - 16 * a} -300 ${-2 - 30 * a} -270 L ${-2 - 60 * a} -220 Q ${-2 - 118 * a} -170 ${-2 - 92 * a} -120 L ${-2 - 58 * a} -70 L ${-4 - 20 * a} -30 L -780 -30 Z`;
  return (
    <g transform={`translate(${x} ${y}) scale(${e})`}>
      <ellipse cx={-390} cy={4} rx={420} ry={14} fill="rgba(0,0,0,0.3)" />
      <clipPath id="corpoOnibus">
        <path d={frente} />
      </clipPath>
      <polygon points="-780,-300 -40,-300 -8,-336 -730,-336" fill="#FFF4D8" />
      
      <path d={frente} fill="#F0E2BE" />
      <g clipPath="url(#corpoOnibus)">
        <rect x={-780} y={-140} width={800} height={46} fill="#1F7F8C" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect key={i} x={-766 + i * 106} y={-278} width={92} height={108} rx={10} fill="#22304A" />
        ))}
        <rect x={-122} y={-280} width={120} height={150} rx={10} fill="#8FB4CE" />
        <rect x={-112} y={-270} width={38} height={130} fill="rgba(255,255,255,0.2)" />
        {a > 0 && (
          <g stroke="#fff" strokeWidth={3} fill="none" opacity={0.9}>
            <path d="M -60 -216 L -112 -262 M -60 -216 L -22 -270 M -60 -216 L -116 -190 M -60 -216 L -28 -150 M -60 -216 L -80 -146" />
            <circle cx={-60} cy={-216} r={16} />
          </g>
        )}
        <rect x={-220} y={-250} width={80} height={204} rx={6} fill="#1F7F8C" />
        <rect x={-214} y={-244} width={32} height={100} fill="#8FB4CE" />
        <rect x={-176} y={-244} width={30} height={100} fill="#8FB4CE" />
        <rect x={-780} y={-300} width={800} height={270} fill="url(#luzOnibus)" />
        <defs>
          <linearGradient id="luzOnibus" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity={0.2} />
            <stop offset="0.5" stopColor="#fff" stopOpacity={0} />
            <stop offset="1" stopColor="#000" stopOpacity={0.3} />
          </linearGradient>
        </defs>
      </g>
      {/* letreiro */}
      <rect x={-560} y={-316} width={340} height={20} rx={4} fill="#17171C" />
      <text x={-390} y={-301} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={17} fill="#FFB238">
        JD. AURORA · TERMINAL
      </text>
      {/* para-choque, e amassado depois da batida */}
      <path d={`M -80 -44 L ${-4 - 20 * a} -44 Q ${4 - 26 * a} -30 ${-8 - 20 * a} -18 L -80 -18 Z`} fill="#2A2A30" />
      <rect x={-34} y={-72} width={18} height={18} rx={4} fill={a > 0.4 ? "#555" : "#FFE9A8"} />
      <Roda x={-660} y={-36} r={42} giro={giro} />
      <Roda x={-130} y={-36} r={42} giro={giro} />
    </g>
  );
};

// ---------- andaime: `solta` 0–1 faz a tábua virar em volta do lado direito ----------
export const AndaimeAlto: React.FC<{ x: number; base: number; andar: number; a: number; solta?: number }> = ({ x, base, andar, a, solta = 0 }) => {
  const py = base - andar * a + 60;
  return (
    <g>
      {/* tubos */}
      {[x, x + 240].map((px, i) => (
        <rect key={i} x={px} y={py - 120} width={13} height={base - py + 120} fill="#8C8F96" />
      ))}
      {new Array(andar + 1).fill(0).map((_, i) => (
        <g key={i}>
          <rect x={x} y={base - i * a + 60} width={253} height={9} fill="#8C8F96" />
          {i > 0 && <line x1={x + 6} y1={base - i * a + 60} x2={x + 246} y2={base - (i - 1) * a + 60} stroke="#8C8F96" strokeWidth={6} />}
        </g>
      ))}
      {/* a tábua de cima */}
      <g transform={`rotate(${-solta * 62} ${x + 246} ${py})`}>
        <rect x={x - 40} y={py - 22} width={300} height={22} fill="#B5844F" />
        <rect x={x - 40} y={py - 22} width={300} height={7} fill="rgba(255,255,255,0.2)" />
      </g>
    </g>
  );
};

// fachada inteira do prédio em obra, vista de longe (4 andares), pro plano da queda
export const PredioObra: React.FC<{ base: number; a: number }> = ({ base, a }) => (
  <g>
    <rect x={180} y={base - 4 * a - 30} width={900} height={4 * a + 30} fill="#8A8478" />
    {[0, 1, 2, 3].map((i) => (
      <g key={i}>
        <rect x={180} y={base - (i + 1) * a - 16} width={900} height={22} fill="#CFCABD" />
        {[240, 620].map((px) => (
          <Vao key={px} x={px} y={base - (i + 1) * a + 70} l={240} a={190} />
        ))}
        {[180, 540, 900].map((px) => (
          <rect key={px} x={px} y={base - (i + 1) * a} width={44} height={a} fill="#C4BEB0" />
        ))}
      </g>
    ))}
    {[192, 208, 552, 568, 912, 928].map((px) => (
      <line key={px} x1={px} y1={base - 4 * a - 30} x2={px + 4} y2={base - 4 * a - 90} stroke="#6E4A3A" strokeWidth={5} />
    ))}
  </g>
);

// ---------- calçada arrebentada ----------
const RACHAS = [
  "M 0 0 L -120 -18 L -210 6 L -340 -14 L -520 -2",
  "M 0 0 L 140 -14 L 230 12 L 380 -8 L 560 8",
  "M 0 0 L -70 36 L -160 58 L -240 112",
  "M 0 0 L 80 42 L 150 64 L 260 124",
  "M -120 -18 L -150 28 L -260 60",
  "M 140 -14 L 190 34 L 330 56",
  "M -210 6 L -240 -34 L -320 -60",
  "M 230 12 L 270 -34 L 340 -60",
  "M 0 0 L -14 60 L -40 170",
  "M 0 0 L 24 64 L 64 190",
];
export const Cratera: React.FC<{ x: number; y: number; k: number; e?: number }> = ({ x, y, k, e = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${e})`}>
    {RACHAS.map((d, i) => (
      <path key={i} d={d} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - Math.min(1, k * (1 + i * 0.04))} stroke="#2A2620" strokeWidth={i < 2 ? 12 : 8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    ))}
    <defs>
      <linearGradient id="paredeBuraco" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#141210" />
        <stop offset="0.55" stopColor="#3A322A" />
        <stop offset="1" stopColor="#6E6250" />
      </linearGradient>
    </defs>
    <ellipse cx={0} cy={8} rx={262 * Math.min(1, k * 2)} ry={68 * Math.min(1, k * 2)} fill="url(#paredeBuraco)" />
    <ellipse cx={0} cy={18} rx={190 * Math.min(1, k * 2)} ry={40 * Math.min(1, k * 2)} fill="#231F1A" />
  </g>
);
// beiço de cimento que tampa os pés de quem está no buraco
export const BeicoCratera: React.FC<{ x: number; y: number; e?: number }> = ({ x, y, e = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${e})`}>
    <path d="M -250 8 Q -160 62 0 66 Q 160 62 250 8 L 280 74 L -280 74 Z" fill="#CFC8B8" />
    {[-180, -90, 30, 130, 210].map((px, i) => (
      <path key={px} d={`M ${px} 44 l 36 -12 l 28 14 l -10 26 l -44 6 Z`} fill={i % 2 ? "#B4AD9C" : "#DAD3C4"} />
    ))}
  </g>
);
// cano estourado: coluna d'água subindo do buraco
export const Jato: React.FC<{ x: number; y: number; t: number; altura?: number }> = ({ x, y, t, altura = 620 }) => {
  if (t < 0) return null;
  const h = altura * interpolate(t, [0, 0.45], [0, 1], { ...clamp, easing: (v) => 1 - Math.pow(1 - v, 2) });
  const poca = interpolate(t, [0, 3], [40, 340], clamp);
  const gotas = new Array(46)
    .fill(0)
    .map((_, i) => {
      const per = 0.8 + random(`jp${i}`) * 0.7;
      const k = ((t + random(`jo${i}`) * per) % per) / per;
      const ang = random(`ja${i}`) * Math.PI * 2;
      const dist = (50 + random(`jd${i}`) * 300) * k;
      const z = Math.sin(ang) * dist * 1.4;
      const wx = x + Math.cos(ang) * dist + Math.sin(t * 2 + i) * 4;
      const wy = y - h + (h * 1.05 + 40) * k * k - 150 * k * (1 - k);
      const [sx, sy, e] = projeta(wx, wy, z);
      return { z, sx, sy, e, r: (3 + random(`jr${i}`) * 9) * (1 - k * 0.4), a: (1 - k) * 0.95, i };
    })
    .sort((p, q) => q.z - p.z);
  return (
    <g>
      <defs>
        <linearGradient id="agua" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#6FA8CC" stopOpacity={0.75} />
          <stop offset="0.35" stopColor="#F2FBFF" stopOpacity={0.95} />
          <stop offset="1" stopColor="#4F8FB8" stopOpacity={0.7} />
        </linearGradient>
        <radialGradient id="pocaAgua" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#8FBFDC" stopOpacity={0.75} />
          <stop offset="0.8" stopColor="#6FA0C0" stopOpacity={0.5} />
          <stop offset="1" stopColor="#6FA0C0" stopOpacity={0} />
        </radialGradient>
      </defs>
      <ellipse cx={x} cy={y + 40} rx={poca} ry={poca * 0.17} fill="url(#pocaAgua)" />
      {[0, 1, 2].map((k) => {
        const f = (t * 0.8 + k / 3) % 1;
        return <ellipse key={k} cx={x} cy={y + 40} rx={poca * f} ry={poca * 0.17 * f} fill="none" stroke="#E8F6FF" strokeWidth={3} opacity={(1 - f) * 0.5} />;
      })}
      <path d={`M ${x - 26} ${y} Q ${x - 19 + Math.sin(t * 9) * 9} ${y - h * 0.5} ${x - 8 + Math.sin(t * 6) * 10} ${y - h} L ${x + 8 + Math.sin(t * 6) * 10} ${y - h} Q ${x + 19 + Math.sin(t * 8) * 9} ${y - h * 0.5} ${x + 26} ${y} Z`} fill="url(#agua)" />
      {gotas.map((g) => (
        <g key={g.i} opacity={g.a}>
          <circle cx={g.sx} cy={g.sy} r={g.r * g.e} fill="#BFE0F2" />
          <circle cx={g.sx - g.r * g.e * 0.3} cy={g.sy - g.r * g.e * 0.3} r={g.r * g.e * 0.35} fill="#fff" />
        </g>
      ))}
      <ellipse cx={x} cy={y + 4} rx={46} ry={16} fill="#E8F6FF" opacity={0.8} />
    </g>
  );
};

// ---------- hospital: corredor com cadeiras, bebedouro, cartaz, porta e relógio ----------
export const Corredor: React.FC<{ blur?: number }> = ({ blur = 3 }) => (
  <AbsoluteFill style={{ background: "#CFE0D8" }}>
    <svg width={1080} height={1920} style={{ position: "absolute", filter: blur ? `blur(${blur}px)` : undefined }}>
      <rect x={0} y={0} width={1080} height={900} fill="#DCE8E2" />
      <rect x={0} y={900} width={1080} height={700} fill="#BFD6CC" />
      <rect x={0} y={892} width={1080} height={14} fill="#8FAFA2" />
      <rect x={0} y={1580} width={1080} height={340} fill="#9FAFAC" />
      <rect x={0} y={1572} width={1080} height={16} fill="#6F8A80" />
      {new Array(7).fill(0).map((_, i) => (
        <line key={i} x1={i * 180 - 60} y1={1588} x2={i * 260 - 240} y2={1920} stroke="rgba(0,0,0,0.1)" strokeWidth={4} />
      ))}
      {/* luz fria do teto */}
      {[180, 620, 1020].map((px) => (
        <g key={px}>
          <rect x={px - 120} y={40} width={240} height={26} rx={6} fill="#F6FFFB" />
          <polygon points={`${px - 120},66 ${px + 120},66 ${px + 300},900 ${px - 300},900`} fill="#F6FFFB" opacity={0.14} />
        </g>
      ))}
      {/* porta dupla com vidro */}
      <rect x={620} y={560} width={400} height={1020} fill="#6E8C82" />
      <rect x={636} y={576} width={176} height={1004} fill="#94AEA5" />
      <rect x={828} y={576} width={176} height={1004} fill="#94AEA5" />
      <rect x={670} y={640} width={110} height={190} rx={6} fill="#30423C" />
      <rect x={862} y={640} width={110} height={190} rx={6} fill="#30423C" />
      <rect x={780} y={470} width={80} height={60} rx={6} fill="#C8322B" />
      <text x={820} y={514} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={38} fill="#fff">
        PS
      </text>
      {/* relógio em 3:17 parado, bebedouro e cartaz */}
      <circle cx={160} cy={300} r={70} fill="#F4F4F0" stroke="#3A3F4A" strokeWidth={8} />
      <path d="M 160 300 L 160 252 M 160 300 L 198 322" stroke="#2A2230" strokeWidth={7} strokeLinecap="round" />
      <rect x={290} y={380} width={230} height={300} rx={6} fill="#F4F4F0" />
      <rect x={290} y={380} width={230} height={70} rx={6} fill="#C8322B" />
      <text x={405} y={430} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={44} fill="#fff">
        SILÊNCIO
      </text>
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={312} y={480 + i * 36} width={186} height={12} rx={5} fill="#AEB5B2" />
      ))}
      <rect x={30} y={1180} width={120} height={400} rx={10} fill="#E8ECEA" />
      <rect x={52} y={1040} width={76} height={140} rx={20} fill="#9CCBE6" opacity={0.85} />
    </svg>
  </AbsoluteFill>
);

// fileira de cadeiras (pés no chão em y)
export const Cadeiras: React.FC<{ x: number; y: number; n?: number; e?: number }> = ({ x, y, n = 3, e = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${e})`}>
    <rect x={0} y={-16} width={n * 210} height={16} fill="#6E7480" />
    {new Array(n).fill(0).map((_, i) => (
      <g key={i}>
        <rect x={i * 210 + 10} y={-250} width={190} height={34} rx={14} fill="#3E6E8E" />
        <rect x={i * 210 + 16} y={-500} width={178} height={250} rx={22} fill="#34607C" />
        <rect x={i * 210 + 90} y={-216} width={20} height={200} fill="#6E7480" />
      </g>
    ))}
  </g>
);

export const Maca: React.FC<{ x: number; y: number; e?: number }> = ({ x, y, e = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${e})`}>
    <ellipse cx={0} cy={4} rx={430} ry={14} fill="rgba(0,0,0,0.25)" />
    <rect x={-400} y={-290} width={800} height={46} rx={14} fill="#F2F4F2" />
    <rect x={-410} y={-250} width={820} height={18} rx={6} fill="#8C8F96" />
    {[-300, 300].map((px) => (
      <g key={px}>
        <rect x={px - 8} y={-234} width={16} height={190} fill="#8C8F96" />
        <circle cx={px} cy={-30} r={30} fill="#17171C" />
        <circle cx={px} cy={-30} r={10} fill="#9EA3AB" />
      </g>
    ))}
  </g>
);

// ---------- carro preto (frente pra direita; `chega` 0–1 ainda rodando) ----------
export const CarroPreto: React.FC<{ x: number; y: number; e?: number; giro?: number; faroisOn?: boolean; olho?: number }> = ({ x, y, e = 2.7, giro = 0, faroisOn = true, olho = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${e})`}>
    <ellipse cx={0} cy={4} rx={196} ry={13} fill="rgba(0,0,0,0.5)" />
    {faroisOn && <polygon points="170,-84 460,-130 460,-10" fill="#FFF4C4" opacity={0.18} />}
    <rect x={-182} y={-112} width={364} height={84} rx={24} fill="#0C0D12" />
    <path d="M -118 -112 Q -96 -182 -26 -182 L 62 -182 Q 112 -182 136 -112 Z" fill="#0C0D12" />
    <path d="M -98 -116 Q -82 -168 -30 -170 L -30 -116 Z M -14 -116 L -14 -170 L 56 -170 Q 96 -168 114 -116 Z" fill="#1E2A3A" />
    <path d="M -90 -120 L -60 -162 L -46 -162 L -80 -120 Z" fill="rgba(255,255,255,0.1)" />
    <rect x={-182} y={-112} width={364} height={22} rx={12} fill="rgba(255,255,255,0.08)" />
    <path d="M -182 -66 L 182 -66" stroke="rgba(255,255,255,0.08)" strokeWidth={3} />
    <rect x={-22} y={-84} width={26} height={6} rx={3} fill="rgba(255,255,255,0.22)" />
    <rect x={162} y={-94} width={22} height={16} rx={5} fill={faroisOn ? "#FFF0C0" : "#3A3A3A"} />
    <rect x={-184} y={-94} width={16} height={16} rx={4} fill="#A82020" />
    <rect x={-120} y={-196} width={3} height={18} fill="#3A3F4A" />
    <path d="M -118 -196 L -118 -240" stroke="#3A3F4A" strokeWidth={2} />
    <rect x={120} y={-58} width={46} height={18} rx={3} fill="#D8D8D0" />
    <text x={143} y={-44} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={13} fill="#222">
      DEA-317
    </text>
    {olho > 0 && <rect x={-182} y={-182} width={364} height={154} fill={COR.aurora} opacity={0.12 * olho} />}
    <Roda x={-108} y={-34} r={36} giro={giro} />
    <Roda x={108} y={-34} r={36} giro={giro} />
  </g>
);

// ---------- caminhão-betoneira (cabine à esquerda: entra de ré, vindo da direita) ----------
export const Betoneira: React.FC<{ x: number; y: number; e?: number; giro?: number; gira?: number; re?: boolean; bica?: number }> = ({ x, y, e = 2.6, giro = 0, gira = 0, re, bica = 0 }) => {
  const faixa = (i: number) => {
    const k = ((gira * 0.8 + i / 5) % 1 + 1) % 1;
    return -250 + k * 500;
  };
  return (
    <g transform={`translate(${x} ${y}) scale(${e})`}>
      <ellipse cx={0} cy={4} rx={400} ry={15} fill="rgba(0,0,0,0.5)" />
      <rect x={-340} y={-96} width={720} height={36} fill="#26262C" />
      {/* cabine */}
      <path d="M 200 -60 L 200 -300 L 330 -300 Q 372 -290 384 -190 L 384 -60 Z" fill="#7A8290" />
      <path d="M 232 -276 L 324 -276 Q 350 -268 356 -196 L 232 -196 Z" fill="#1E2A3A" />
      <rect x={358} y={-120} width={26} height={22} rx={4} fill="#FFF0C0" />
      {/* tambor girando (as faixas correm de um lado pro outro) */}
      <clipPath id="tambor">
        <path d="M -300 -220 Q -280 -380 -120 -392 L 90 -392 Q 180 -386 190 -240 Q 180 -96 90 -92 L -120 -92 Q -280 -104 -300 -220 Z" />
      </clipPath>
      <path d="M -300 -220 Q -280 -380 -120 -392 L 90 -392 Q 180 -386 190 -240 Q 180 -96 90 -92 L -120 -92 Q -280 -104 -300 -220 Z" fill="#5C6470" />
      <g clipPath="url(#tambor)">
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={i} d={`M ${faixa(i)} -400 L ${faixa(i) + 70} -400 L ${faixa(i) + 150} -80 L ${faixa(i) + 80} -80 Z`} fill={i % 2 ? "#D8C21F" : "#2A2C34"} opacity={0.8} />
        ))}
        <rect x={-320} y={-400} width={520} height={80} fill="rgba(255,255,255,0.12)" />
        <rect x={-320} y={-160} width={520} height={80} fill="rgba(0,0,0,0.32)" />
      </g>
      {/* bica atrás (na esquerda), com concreto escorrendo */}
      <path d="M -300 -210 L -372 -150 L -350 -130 L -286 -176 Z" fill="#3A3F4A" />
      {bica > 0 && (
        <g>
          <defs>
            <linearGradient id="concreto" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#5E5E5A" />
              <stop offset="0.35" stopColor="#B4B4AC" />
              <stop offset="1" stopColor="#4A4A46" />
            </linearGradient>
            <radialGradient id="monte" cx="0.38" cy="0.2" r="0.85">
              <stop offset="0" stopColor="#B4B4AC" />
              <stop offset="1" stopColor="#3E3E3A" />
            </radialGradient>
          </defs>
          <path d={`M -374 -146 Q ${-384 + Math.sin(gira * 8) * 3} ${-146 + 73 * bica} -378 ${-146 + 146 * bica} L -342 ${-146 + 146 * bica} Q ${-346 + Math.sin(gira * 7) * 3} ${-146 + 73 * bica} -344 -138 Z`} fill="url(#concreto)" />
          {[0, 1, 2, 3].map((i) => {
            const k = (gira * 1.7 + i / 4) % 1;
            return <ellipse key={i} cx={-360 + Math.sin(i * 2.3) * 12} cy={-146 + 146 * k * bica} rx={15} ry={19} fill="#A4A49C" />;
          })}
          <ellipse cx={-360} cy={2} rx={130 * bica} ry={46 * bica} fill="url(#monte)" />
        </g>
      )}
      {/* lanternas de ré acesas */}
      <rect x={-342} y={-92} width={22} height={18} rx={4} fill={re ? "#FF3B30" : "#6A1A16"} />
      <rect x={-342} y={-70} width={22} height={12} rx={3} fill={re ? "#FFF6D8" : "#555"} />
      {re && <polygon points="-342,-70 -760,-40 -760,60 -342,-40" fill="#FFF6D8" opacity={0.12} />}
      {re && <circle cx={-332} cy={-84} r={44} fill="#FF3B30" opacity={0.22} />}
      {[-250, -150, 250, 330].map((px) => (
        <Roda key={px} x={px} y={-42} r={42} giro={giro} />
      ))}
    </g>
  );
};

// ---------- chuva: fios que caem, sempre iguais de um corte pro outro ----------
export const Chuva: React.FC<{ n?: number; forca?: number; v?: number }> = ({ n = 120, forca = 0.42, v = 2100 }) => {
  const f = useCurrentFrame() / 30;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", pointerEvents: "none" }}>
      {new Array(n).fill(0).map((_, i) => {
        // z: 0 longe (fino e lento), 1 colado na câmera (grosso, comprido e rápido)
        const z = random(`cz${i}`) ** 2.4;
        const vv = v * (0.55 + z * 1.1);
        const y = ((f * vv + random(`cy${i}`) * 2400) % 2400) - 260;
        const x = random(`cx${i}`) * 1180 - 40 - y * 0.07;
        const c = 22 + z * 190;
        return <line key={i} x1={x} y1={y} x2={x - c * 0.07} y2={y + c} stroke="#C9D8EE" strokeWidth={1.4 + z * 5} strokeLinecap="round" opacity={forca * (0.32 + (1 - z) * 0.42 + z * 0.1)} />;
      })}
    </svg>
  );
};
// gotas estourando no chão molhado
export const Respingos: React.FC<{ y?: number; h?: number; n?: number }> = ({ y = 1600, h = 300, n = 22 }) => {
  const f = useCurrentFrame() / 30;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", pointerEvents: "none" }}>
      {new Array(n).fill(0).map((_, i) => {
        const p = 0.5 + random(`rp${i}`) * 0.6;
        const k = ((f + random(`ro${i}`) * 3) % p) / p;
        return <ellipse key={i} cx={random(`rx${i}`) * 1080} cy={y + random(`ry${i}`) * h} rx={4 + k * 26} ry={1 + k * 6} fill="none" stroke="#C9D8EE" strokeWidth={2} opacity={(1 - k) * 0.5} />;
      })}
    </svg>
  );
};
// noite de verdade: escurece tudo, menos em volta de uma fonte de luz
export const Escuro: React.FC<{ x?: number; y?: number; r?: number; forca?: number; cor?: string }> = ({ x = 540, y = 800, r = 640, forca = 0.82, cor = "6,9,24" }) => (
  <AbsoluteFill style={{ background: `radial-gradient(circle ${r}px at ${x}px ${y}px, rgba(${cor},${forca * 0.12}) 0%, rgba(${cor},${forca * 0.55}) 55%, rgba(${cor},${forca}) 100%)`, pointerEvents: "none" }} />
);
export const ConeDePoste: React.FC<{ x: number; y: number; base: number; l?: number }> = ({ x, y, base, l = 330 }) => (
  <g>
    <polygon points={`${x - 26},${y} ${x + 26},${y} ${x + l},${base} ${x - l},${base}`} fill="#FFD9A0" opacity={0.15} />
    <ellipse cx={x} cy={base} rx={l} ry={46} fill="#FFD9A0" opacity={0.16} />
    <circle cx={x} cy={y} r={30} fill="#FFE9C0" />
    <circle cx={x} cy={y} r={80} fill="#FFD9A0" opacity={0.25} />
  </g>
);

// guarda-chuva: fica sempre em pé, já descontando o ângulo do antebraço (`net`)
export const GuardaChuva: React.FC<{ net: number }> = ({ net }) => (
  <g transform={`rotate(${-net})`}>
    <line x1={0} y1={30} x2={0} y2={-360} stroke="#26262C" strokeWidth={10} strokeLinecap="round" />
    <path d="M -250 -340 Q 0 -560 250 -340 Q 166 -376 84 -340 Q 0 -376 -84 -340 Q -166 -376 -250 -340 Z" fill="#0E0F14" />
    <path d="M -250 -340 Q -80 -500 0 -500 Q -100 -470 -166 -360 Z" fill="rgba(255,255,255,0.08)" />
  </g>
);
export const Pasta: React.FC = () => (
  <g>
    <rect x={-74} y={22} width={148} height={108} rx={8} fill="#2A1D14" />
    <rect x={-74} y={22} width={148} height={18} rx={6} fill="#3A291C" />
    <path d="M -26 22 Q 0 -8 26 22" stroke="#2A1D14" strokeWidth={9} fill="none" />
    <rect x={-10} y={36} width={20} height={14} rx={3} fill="#C9B27A" />
  </g>
);

// ---------- a casa do Denis, de frente: sobrado inacabado, portão e cortina em cima ----------
export const CasaDenis: React.FC<{ base?: number; cortina?: number }> = ({ base = 1730, cortina = 0 }) => (
  <g>
    <rect x={-20} y={base - 1420} width={1120} height={1420} fill="#44405A" />
    {/* tijolo sem reboco em cima */}
    {new Array(11).fill(0).flatMap((_, l) =>
      new Array(13).fill(0).map((__, c) => (
        <rect key={`${l}${c}`} x={-20 + c * 88 + (l % 2) * 44} y={base - 1420 + l * 44} width={84} height={40} fill={(l + c) % 4 ? "#5A4048" : "#4E3840"} />
      )),
    )}
    <rect x={-20} y={base - 930} width={1120} height={22} fill="#2E2B40" />
    {/* janela de cima, luz fraca, cortina mexendo */}
    <rect x={590} y={base - 1290} width={330} height={290} fill="#22202E" />
    <rect x={606} y={base - 1274} width={298} height={258} fill="#D9A95C" opacity={0.55} />
    <rect x={606} y={base - 1274} width={150 + cortina * 60} height={258} fill="#7A5A62" opacity={0.92} />
    <rect x={826 - cortina * 20} y={base - 1274} width={78 + cortina * 20} height={258} fill="#7A5A62" opacity={0.92} />
    <rect x={752} y={base - 1274} width={8} height={258} fill="#22202E" />
    {/* muro e portão */}
    <rect x={-20} y={base - 560} width={1120} height={560} fill="#4A465C" />
    {new Array(9).fill(0).map((_, i) => (
      <path key={i} d={`M ${i * 130 - 10} ${base - 560} q 8 ${70 + (i % 3) * 40} -4 ${160 + (i % 2) * 80}`} stroke="rgba(0,0,0,0.25)" strokeWidth={6} fill="none" />
    ))}
    <rect x={-20} y={base - 576} width={1120} height={20} fill="#35324A" />
    <rect x={250} y={base - 520} width={520} height={520} fill="#14141C" />
    {new Array(11).fill(0).map((_, i) => (
      <rect key={i} x={258 + i * 47} y={base - 520} width={15} height={520} fill="#2A2C38" />
    ))}
    <rect x={250} y={base - 526} width={520} height={18} fill="#2A2C38" />
    <rect x={250} y={base - 276} width={520} height={14} fill="#2A2C38" />
    <rect x={740} y={base - 300} width={36} height={60} rx={6} fill="#3A3F4A" />
    <rect x={820} y={base - 400} width={110} height={80} rx={6} fill="#26262C" />
    <text x={875} y={base - 348} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={46} fill="#BBB">
      84
    </text>
    {/* gato-net de fios e caixa de luz */}
    <rect x={80} y={base - 470} width={110} height={150} rx={6} fill="#6A6E78" />
    <rect x={92} y={base - 456} width={86} height={60} fill="#2A2C38" />
  </g>
);

// ---------- foto 3x4 da pasta ----------
const FUNDO_FOTO = "#B9C7CE";
export type QuemFoto = "jonas" | "bruno" | "edson" | "kaique" | "denis";
const ROSTO_ID = { jonas: "fjonas", bruno: "fbruno", edson: "fedson", kaique: "fkaique", denis: "fdenis" };
const RostoFoto: React.FC<{ q: QuemFoto }> = ({ q }) => {
  const P = { x: 0, y: 0, vivo: false, sombra: false, gesto: false, escala: 1 } as const;
  if (q === "edson") return <SeuEdson {...P} />;
  if (q === "kaique") return <Kaique {...P} olhoRoxo={0} />;
  if (q === "denis") return <Denis {...P} casa />;
  const cores =
    q === "jonas"
      ? { pele: "#D9A27A", peleSombra: "#B9825C", camisa: "#4B7FB3", camisaEscura: "#3B6894", calca: "#333", tenis: "#222", cabelo: "#3A2A20" }
      : { pele: "#8D5A3C", peleSombra: "#6F4630", camisa: "#E8863A", camisaEscura: "#C06A28", calca: "#333", tenis: "#222", cabelo: "#17120F" };
  return <Corpo {...P} cores={cores} cabelo="curto" manga={90} semente={q} />;
};
export const Foto: React.FC<{ q: QuemFoto; nome: string; x: number; y: number; a?: number; e?: number; umida?: number; carimbo?: boolean }> = ({ q, nome, x, y, a = 0, e = 1, umida = 0, carimbo }) => (
  <g transform={`translate(${x} ${y}) rotate(${a}) scale(${e})`}>
    <rect x={-186} y={-238} width={372} height={476} fill="rgba(0,0,0,0.3)" transform="translate(8 10)" />
    <rect x={-186} y={-238} width={372} height={476} fill="#F4F1EA" />
    <rect x={-160} y={-212} width={320} height={340} fill={FUNDO_FOTO} />
    <clipPath id={ROSTO_ID[q]}>
      <rect x={-160} y={-212} width={320} height={340} />
    </clipPath>
    <g clipPath={`url(#${ROSTO_ID[q]})`}>
      <g transform="translate(0 860) scale(1.35)">
        <RostoFoto q={q} />
      </g>
    </g>
    <text x={0} y={186} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={58} fill={COR.tinta}>
      {nome}
    </text>
    {carimbo && (
      <g transform="rotate(-14 100 50)">
        <rect x={0} y={20} width={200} height={62} fill="none" stroke="#B3262C" strokeWidth={6} />
        <text x={100} y={68} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={42} fill="#B3262C">
          3:17
        </text>
      </g>
    )}
    {umida > 0 && <rect x={-186} y={-238} width={372} height={476} fill="#BFD6E8" opacity={0.22 * umida} />}
  </g>
);
