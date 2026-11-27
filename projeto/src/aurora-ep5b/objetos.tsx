import { random } from "remotion";
import { Corpo, Cores } from "../aurora-ep4/pessoa";
import { FONTE } from "../aurora/estilo";

// Objetos que enchem a tela e a primeira pessoa do episódio.

// Denis coberto de concreto
const CINZA: Cores = { pele: "#A9A8A0", peleSombra: "#8C8B84", camisa: "#96958E", camisaEscura: "#7E7D77", calca: "#888780", tenis: "#6E6D68", cabelo: "#77766F" };
type Sem = Omit<React.ComponentProps<typeof Corpo>, "cores" | "cabelo" | "manga" | "bigode" | "semente">;
export const DenisCinza: React.FC<Sem> = (p) => <Corpo {...p} cores={CINZA} cabelo="curto" manga={96} bigode="#66655F" semente="denis" />;

// Mão em primeira pessoa: pulso em (0, 0), braço pra baixo, dedos pra cima.
export const Mao: React.FC<{ x: number; y: number; e?: number; rot?: number; pele?: string; sombra?: string; manga?: string; punho?: string; dobra?: number; opacidade?: number; id: string }> = ({ x, y, e = 1, rot = 0, pele = "#B07A52", sombra = "#90613F", manga = "#6E7480", punho, dobra = 0, opacidade = 1, id }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${e})`} opacity={opacidade}>
    <defs>
      <linearGradient id={`mao${id}`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#fff" stopOpacity={0.16} />
        <stop offset="0.5" stopColor="#fff" stopOpacity={0} />
        <stop offset="1" stopColor="#000" stopOpacity={0.3} />
      </linearGradient>
    </defs>
    {/* antebraço e manga */}
    <rect x={-74} y={-10} width={148} height={1100} fill={pele} />
    <rect x={-74} y={-10} width={148} height={1100} fill={`url(#mao${id})`} />
    <rect x={-92} y={70} width={184} height={1100} fill={manga} />
    <rect x={-92} y={70} width={184} height={1100} fill={`url(#mao${id})`} />
    {punho && <rect x={-96} y={60} width={192} height={46} rx={6} fill={punho} />}
    {/* palma e dedos */}
    <rect x={-88} y={-190} width={176} height={210} rx={46} fill={pele} />
    {[-66, -22, 22, 66].map((dx, i) => {
      const alt = [150, 186, 196, 170][i] - dobra;
      return (
        <g key={i}>
          <rect x={dx - 20} y={-170 - alt} width={40} height={alt + 30} rx={20} fill={pele} />
          <rect x={dx - 13} y={-170 - alt + 4} width={26} height={22} rx={10} fill="#EFD3BC" opacity={0.75} />
          <line x1={dx - 16} x2={dx + 16} y1={-170 - alt * 0.45} y2={-170 - alt * 0.45} stroke={sombra} strokeWidth={3} />
        </g>
      );
    })}
    <g transform="translate(-90 -60) rotate(-42)">
      <rect x={-22} y={-140} width={44} height={170} rx={22} fill={pele} />
      <rect x={-14} y={-134} width={28} height={24} rx={11} fill="#EFD3BC" opacity={0.75} />
    </g>
    <rect x={-88} y={-190} width={176} height={210} rx={46} fill={`url(#mao${id})`} />
    <path d="M -60 -90 Q 0 -60 58 -110" stroke={sombra} strokeWidth={4} fill="none" />
  </g>
);

// Ficha do Denis: papel molhado na prancheta do agente.
export const Ficha: React.FC<{ t: number; x: number; y: number; circulo: number }> = ({ t, x, y, circulo }) => (
  <g transform={`translate(${x} ${y}) rotate(${-2 + Math.sin(t * 0.8) * 0.5})`}>
    <rect x={-400} y={-560} width={800} height={1040} rx={22} fill="#201A14" />
    <rect x={-120} y={-596} width={240} height={70} rx={14} fill="#7D8087" />
    <rect x={-366} y={-520} width={732} height={970} fill="#E7E1D0" />
    <rect x={-366} y={-520} width={732} height={92} fill="#191B22" />
    <text x={0} y={-460} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={42} letterSpacing={1} fill="#E7E1D0">
      DEP. DE EVENTOS ATMOSFÉRICOS
    </text>
    {/* foto */}
    <rect x={-324} y={-388} width={216} height={266} fill="#3B4250" />
    <circle cx={-216} cy={-296} r={62} fill="#B07A52" />
    <path d="M -278 -304 Q -280 -366 -216 -366 Q -152 -366 -154 -304 Q -180 -340 -216 -336 Q -252 -340 -278 -304 Z" fill="#1E1712" />
    <path d="M -240 -270 Q -216 -282 -192 -270 Q -216 -262 -240 -270 Z" fill="#2C2018" />
    <rect x={-300} y={-226} width={168} height={104} rx={16} fill="#6E7480" />
    <text x={-70} y={-340} fontFamily={FONTE} fontWeight={800} fontSize={72} fill="#16181F">
      DENIS, 34
    </text>
    <text x={-70} y={-274} fontFamily={FONTE} fontWeight={700} fontSize={44} fill="#55585F">
      PEDREIRO
    </text>
    <text x={-70} y={-214} fontFamily={FONTE} fontWeight={700} fontSize={44} fill="#55585F">
      NOITE DA AURORA · 3:17
    </text>
    {[
      ["QUEBRA?", "NÃO", "#1E7A52"],
      ["FORÇA", "NORMAL", "#16181F"],
      ["PESO", "80 KG", "#C42A22"],
    ].map(([a, b, c], i) => (
      <g key={a} transform={`translate(0 ${-20 + i * 148})`}>
        <line x1={-324} x2={324} y1={46} y2={46} stroke="#B5AE9B" strokeWidth={4} />
        <text x={-324} y={20} fontFamily={FONTE} fontWeight={700} fontSize={56} fill="#55585F">
          {a}
        </text>
        <text x={324} y={22} textAnchor="end" fontFamily={FONTE} fontWeight={800} fontSize={92} fill={c}>
          {b}
        </text>
      </g>
    ))}
    {circulo > 0 && (
      <ellipse cx={200} cy={258} rx={190} ry={72} fill="none" stroke="#C42A22" strokeWidth={9} strokeDasharray={900} strokeDashoffset={900 * (1 - circulo)} transform="rotate(-3 200 258)" />
    )}
    {/* pingos no papel */}
    {new Array(14).fill(0).map((_, i) => {
      const r = (s: string) => random(`pingo${i}${s}`);
      if (t < r("t") * 3) return null;
      return <ellipse key={i} cx={-340 + r("x") * 680} cy={-400 + r("y") * 820} rx={10 + r("r") * 16} ry={8 + r("r") * 12} fill="#8D8878" opacity={0.3} />;
    })}
  </g>
);

// Plaquinha do bloco, de perto, enchendo a tela.
export const ParedeBloco: React.FC<{ n: string; luz?: string; tremor?: number; poeira?: number; t: number }> = ({ n, luz = "#FFE7BC", tremor = 0, poeira = 0, t }) => (
  <svg width={1080} height={1920} style={{ position: "absolute" }}>
    <defs>
      <linearGradient id="faceBloco" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#84878A" />
        <stop offset="0.55" stopColor="#62666A" />
        <stop offset="1" stopColor="#2A2E34" />
      </linearGradient>
      <radialGradient id="luzBloco" cx="0.5" cy="0.15" r="0.9">
        <stop offset="0" stopColor={luz} stopOpacity={0.3} />
        <stop offset="1" stopColor={luz} stopOpacity={0} />
      </radialGradient>
    </defs>
    <g transform={`translate(${Math.sin(t * 90) * tremor * 7} ${Math.cos(t * 77) * tremor * 3})`}>
      <rect x={-20} y={-20} width={1120} height={1960} fill="url(#faceBloco)" />
      {[260, 560, 860, 1160, 1460, 1760].map((y) => (
        <g key={y}>
          <rect x={-20} y={y} width={1120} height={9} fill="#2A2D32" opacity={0.7} />
          <rect x={-20} y={y + 9} width={1120} height={4} fill="#B4B4AE" opacity={0.25} />
        </g>
      ))}
      {[[170, 420], [910, 420], [170, 1320], [910, 1320]].map(([x, y]) => (
        <g key={`${x}${y}`}>
          <circle cx={x} cy={y} r={40} fill="#1C1F24" />
          <path d={`M ${x - 40} ${y} A 40 40 0 0 1 ${x + 40} ${y}`} fill="#101216" />
        </g>
      ))}
      <path d="M 300 480 q 24 240 8 460 q -14 18 -26 0 q -4 -240 -10 -460 Z" fill="#7A4A2C" opacity={0.42} />
      <path d="M 760 980 l 70 90 l -36 70 l 64 110 l -30 120" stroke="#23262B" strokeWidth={6} fill="none" />
      <rect x={250} y={620} width={580} height={280} rx={14} fill="#E9E4D4" />
      <rect x={250} y={620} width={580} height={70} rx={14} fill="#191B22" />
      <text x={540} y={670} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={40} letterSpacing={2} fill="#E9E4D4">
        DEP. EV. ATMOSFÉRICOS
      </text>
      <text x={540} y={860} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={170} fill="#1A1C22">
        {n}
      </text>
      {[[270, 640], [810, 640], [270, 880], [810, 880]].map(([x, y]) => (
        <circle key={`${x}${y}`} cx={x} cy={y} r={7} fill="#7A7A74" />
      ))}
    </g>
    <rect x={0} y={0} width={1080} height={1920} fill="url(#luzBloco)" />
    {poeira > 0 &&
      new Array(26).fill(0).map((_, i) => {
        const r = (s: string) => random(`poe${i}${s}`);
        const y = 200 + r("y") * 500 + poeira * (300 + r("v") * 900);
        return <circle key={i} cx={100 + r("x") * 880} cy={y} r={3 + r("r") * 7} fill="#B7B6AE" opacity={Math.max(0, 0.8 - poeira * 0.7)} />;
      })}
  </svg>
);

// Crachá velho do Olheiro.
export const Cracha: React.FC<{ x: number; y: number; a?: number; e?: number }> = ({ x, y, a = 0, e = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${a}) scale(${e})`}>
    <rect x={-40} y={-470} width={80} height={80} rx={12} fill="#6A6D74" />
    <rect x={-24} y={-452} width={48} height={22} rx={10} fill="#151820" />
    <rect x={-330} y={-420} width={660} height={860} rx={32} fill="#DED6BE" />
    <rect x={-330} y={-420} width={660} height={150} rx={32} fill="#17352A" />
    <rect x={-330} y={-320} width={660} height={50} fill="#17352A" />
    <text x={0} y={-340} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={56} letterSpacing={1} fill="#DED6BE">
      DEP. DE EVENTOS
    </text>
    <text x={0} y={-284} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={56} letterSpacing={1} fill="#DED6BE">
      ATMOSFÉRICOS
    </text>
    <rect x={-180} y={-240} width={360} height={410} fill="#8E8878" />
    <rect x={-180} y={-240} width={360} height={410} fill="#3C5A50" opacity={0.5} />
    <circle cx={0} cy={-90} r={96} fill="#C89A72" />
    <path d="M -100 -100 Q -100 -196 0 -196 Q 100 -196 100 -100 Q 50 -150 0 -146 Q -50 -150 -100 -100 Z" fill="#2B2520" />
    <circle cx={-34} cy={-86} r={15} fill="#fff" />
    <circle cx={34} cy={-86} r={15} fill="#fff" />
    <circle cx={-34} cy={-86} r={8} fill="#3CF0A0" />
    <circle cx={34} cy={-86} r={8} fill="#3CF0A0" />
    <path d="M -22 -40 Q 0 -32 22 -40" stroke="#42302A" strokeWidth={6} fill="none" />
    <polygon points="-160,170 -130,40 -36,10 0,60 36,10 130,40 160,170" fill="#1A1C24" />
    <polygon points="-36,10 0,60 36,10" fill="#E8E8E4" />
    <polygon points="-11,30 11,30 16,120 0,150 -16,120" fill="#7A2A2A" />
    <text x={0} y={250} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={74} fill="#191B22">
      DETECTOR Nº 1
    </text>
    <text x={0} y={350} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={104} fill="#A82A22">
      1989
    </text>
    <path d="M -300 410 L 300 410" stroke="#AFA78E" strokeWidth={5} />
    <path d="M 120 -220 Q 240 -120 300 40 L 330 40 L 330 -120 Z" fill="#fff" opacity={0.1} />
  </g>
);

// Lista do Olheiro na prancheta. `marca` = quantos nomes já estão riscados de verde.
const NOMES = ["JONAS", "BRUNO", "SEU EDSON", "KAIQUE", "DENIS"];
export const Lista: React.FC<{ x: number; y: number; a?: number; e?: number; marca?: number }> = ({ x, y, a = 0, e = 1, marca = 5 }) => (
  <g transform={`translate(${x} ${y}) rotate(${a}) scale(${e})`}>
    <rect x={-360} y={-490} width={720} height={980} rx={26} fill="#8B6A43" />
    <rect x={-110} y={-524} width={220} height={66} rx={12} fill="#9AA0A8" />
    <rect x={-324} y={-450} width={648} height={910} fill="#F4F1EA" />
    <text x={0} y={-380} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={54} fill="#1A1C22">
      NOITE DA AURORA · 3:17
    </text>
    <line x1={-284} x2={284} y1={-352} y2={-352} stroke="#1A1C22" strokeWidth={5} />
    {NOMES.map((n, i) => (
      <g key={n} transform={`translate(0 ${-250 + i * 136})`}>
        <text x={-280} y={0} fontFamily={FONTE} fontWeight={800} fontSize={88} fill="#1A1C22">
          {n}
        </text>
        {i < marca && <circle cx={250} cy={-26} r={22} fill="#3CF0A0" />}
        <line x1={-284} x2={284} y1={26} y2={26} stroke="#C8C4B8" strokeWidth={3} />
      </g>
    ))}
  </g>
);

// Balde com leitura digital na balança.
export const Balanca: React.FC<{ x: number; y: number; cor: string; kg: number; nome: string; corVisor: string; id: string; altura?: number }> = ({ x, y, cor, kg, nome, corVisor, id, altura = 0 }) => (
  <g transform={`translate(${x} ${y})`}>
    <defs>
      <linearGradient id={`balde${id}`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#fff" stopOpacity={0.24} />
        <stop offset="0.5" stopColor="#fff" stopOpacity={0} />
        <stop offset="1" stopColor="#000" stopOpacity={0.4} />
      </linearGradient>
    </defs>
    <ellipse cx={0} cy={8} rx={250} ry={40} fill="#000" opacity={0.45} />
    <rect x={-210} y={-70} width={420} height={70} rx={12} fill="#2A2E36" />
    <rect x={-190} y={-86} width={380} height={18} rx={6} fill="#4A4F58" />
    <rect x={-110} y={-48} width={220} height={40} rx={6} fill="#090C10" />
    <g transform={`translate(0 ${-88 + altura})`}>
      <polygon points="-130,0 130,0 170,-300 -170,-300" fill="#3D434D" />
      <polygon points="-130,0 130,0 170,-300 -170,-300" fill={`url(#balde${id})`} />
      <ellipse cx={0} cy={-300} rx={170} ry={36} fill="#23262C" />
      <ellipse cx={0} cy={-294} rx={150} ry={28} fill={cor} />
      <path d="M -168 -296 Q 0 -560 168 -296" stroke="#70757E" strokeWidth={10} fill="none" />
    </g>
    <text x={0} y={-16} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={40} fill={corVisor}>
      {Math.round(kg)} KG
    </text>
    {/* visor grande, igual o da fábrica */}
    <g transform="translate(0 -560)">
      <rect x={-165} y={-120} width={330} height={190} rx={18} fill="#8A8F98" />
      <rect x={-148} y={-104} width={296} height={120} rx={10} fill="#090C10" />
      <text x={0} y={-16} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={96} fill={corVisor}>
        {Math.round(kg)} KG
      </text>
      <text x={0} y={54} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={40} fill="#16181F">
        {nome}
      </text>
    </g>
  </g>
);

// Termômetro de obra, espetado no concreto.
export const Termometro: React.FC<{ x: number; y: number; k: number }> = ({ x, y, k }) => {
  const cor = k > 0.65 ? "#E8392F" : k > 0.35 ? "#E89A2F" : "#3F8FD8";
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-20} y={-660} width={40} height={700} rx={10} fill="#C9CDD2" />
      <circle cx={0} cy={-790} r={170} fill="#1C2026" />
      <circle cx={0} cy={-790} r={150} fill="#EDE9DC" />
      <path d="M -112 -720 A 130 130 0 0 1 -50 -908" stroke="#3F8FD8" strokeWidth={24} fill="none" />
      <path d="M -50 -908 A 130 130 0 0 1 60 -905" stroke="#E89A2F" strokeWidth={24} fill="none" />
      <path d="M 60 -905 A 130 130 0 0 1 114 -722" stroke="#E8392F" strokeWidth={24} fill="none" />
      <line x1={0} y1={-790} x2={Math.cos(Math.PI * (1.17 + 0.66 * k)) * 112} y2={-790 + Math.sin(Math.PI * (1.17 + 0.66 * k)) * 112} stroke={cor} strokeWidth={10} strokeLinecap="round" />
      <circle cx={0} cy={-790} r={18} fill="#1C2026" />
      <text x={0} y={-704} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={36} fill="#1C2026">
        TEMP.
      </text>
    </g>
  );
};
