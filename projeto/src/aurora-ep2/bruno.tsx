import { COR } from "../aurora/estilo";
import { Boca, Membro, Olhos, Rosto } from "../aurora/personagens";

// Bruno: 17 anos, goleiro do 3º B. Mesmo traço do Jonas (pés em (0,0), ~620 de altura),
// mais magro, cabelo na régua com risquinho. Três roupas: goleiro, escola e casa.

export type Pose = {
  bracoE?: number;
  bracoD?: number;
  antebracoE?: number;
  antebracoD?: number;
  pernaE?: number;
  pernaD?: number;
  cabeca?: number;
  tronco?: number;
};
export type Roupa = "goleiro" | "escola" | "casa";

const PELE = "#8E5B3A";
const PELE_SOMBRA = "#76482B";

const ROUPA: Record<Roupa, { camisa: string; manga: number; detalhe: string; calca: string; pernaManga: number; meiao?: string }> = {
  goleiro: { camisa: "#F2873A", manga: 170, detalhe: "#FFFFFF", calca: "#22222A", pernaManga: 80, meiao: "#F2873A" },
  escola: { camisa: "#F4F4F0", manga: 70, detalhe: "#2F5DA8", calca: "#1F2F55", pernaManga: 200 },
  casa: { camisa: "#8C8F96", manga: 0, detalhe: "#6E7178", calca: "#3E6894", pernaManga: 90 },
};

export const Bruno: React.FC<{
  x: number;
  y: number;
  escala?: number;
  pose?: Pose;
  olhos?: Olhos;
  boca?: Boca;
  piscar?: boolean;
  roupa?: Roupa;
  mochila?: boolean;
  celular?: boolean;
  brilho?: number;
  vento?: number; // 0–1: alças e camisa tremendo (grudado no busão)
  t?: number;
}> = ({ x, y, escala = 1, pose = {}, olhos = "normal", boca = "neutra", piscar, roupa = "escola", mochila, celular, brilho = 0, vento = 0, t = 0 }) => {
  const { bracoE = 8, bracoD = 8, antebracoE = 0, antebracoD = 0, pernaE = 0, pernaD = 0, cabeca = 0, tronco = 0 } = pose;
  const r = ROUPA[roupa];
  const luva = roupa === "goleiro";
  const mao = luva ? (
    <g>
      <rect x={-30} y={-14} width={60} height={56} rx={20} fill="#F4F4F0" />
      <rect x={-30} y={-16} width={60} height={14} rx={6} fill="#22222A" />
    </g>
  ) : (
    <circle cx={0} cy={4} r={23} fill={PELE} />
  );
  const tenis = (
    <g>
      <ellipse cx={8} cy={8} rx={36} ry={17} fill={roupa === "casa" ? "#2E8B57" : "#F4F1EA"} />
      {roupa !== "casa" && <path d="M -18 4 L 30 4" stroke="#2F5DA8" strokeWidth={5} strokeLinecap="round" />}
    </g>
  );
  const pe = r.meiao ? (
    <g>
      <rect x={-24} y={-70} width={48} height={70} rx={14} fill={r.meiao} />
      {tenis}
    </g>
  ) : (
    tenis
  );
  const celularNaMao = (
    <g>
      <rect x={-26} y={-30} width={52} height={92} rx={10} fill="#1d1d22" />
      <rect x={-21} y={-24} width={42} height={78} rx={6} fill="#7FB3E8" opacity={0.9} />
      {mao}
    </g>
  );
  const treme = Math.sin(t * 60) * 6 * vento;
  return (
    <g transform={`translate(${x} ${y}) scale(${escala})`}>
      {brilho > 0 && <ellipse cx={0} cy={-320} rx={230} ry={360} fill={COR.aurora} opacity={0.22 * brilho} style={{ filter: "blur(40px)" }} />}
      <ellipse cx={0} cy={6} rx={100} ry={15} fill="rgba(0,0,0,0.22)" />
      <Membro x={-34} y={-205} ang={pernaE} comp={200} larg={44} cor={PELE} manga={{ comp: r.pernaManga, cor: r.calca }} ponta={pe} dobra={Math.max(0, -pernaE) * 0.8} />
      <Membro x={34} y={-205} ang={pernaD} comp={200} larg={44} cor={PELE} manga={{ comp: r.pernaManga, cor: r.calca }} ponta={pe} dobra={Math.max(0, -pernaD) * 0.8} />
      <g transform={`rotate(${tronco} 0 -205)`}>
        {mochila && (
          <g>
            <rect x={-104 + treme} y={-390} width={60} height={190} rx={22} fill="#C0392B" />
            <rect x={44 - treme} y={-390} width={60} height={190} rx={22} fill="#C0392B" />
          </g>
        )}
        <rect x={-80} y={-240} width={160} height={58} rx={22} fill={r.calca} />
        <Membro x={-78} y={-372} ang={bracoE} comp={190} larg={38} cor={PELE} manga={r.manga ? { comp: r.manga, cor: r.camisa } : undefined} ponta={mao} dobra={antebracoE} />
        <rect x={-84} y={-400} width={168} height={200} rx={42} fill={r.camisa} />
        {roupa === "goleiro" && (
          <>
            <path d="M -84 -330 L 84 -330" stroke="#22222A" strokeWidth={10} />
            <text x={0} y={-235} textAnchor="middle" fontFamily="Arial Black, Arial" fontWeight={900} fontSize={70} fill={r.detalhe}>
              1
            </text>
          </>
        )}
        {roupa === "escola" && (
          <>
            <path d="M -84 -300 L 84 -300" stroke={r.detalhe} strokeWidth={12} />
            <circle cx={-40} cy={-350} r={16} fill={r.detalhe} />
            <path d="M -30 -398 L 0 -372 L 30 -398" stroke={r.detalhe} strokeWidth={8} fill="none" strokeLinecap="round" />
          </>
        )}
        {roupa === "casa" && <path d="M -46 -400 Q 0 -350 46 -400" fill={PELE} />}
        {mochila && (
          <>
            <path d={`M -62 -398 L ${-70 + treme} -250`} stroke="#8E2A20" strokeWidth={12} strokeLinecap="round" />
            <path d={`M 62 -398 L ${70 - treme} -250`} stroke="#8E2A20" strokeWidth={12} strokeLinecap="round" />
          </>
        )}
        <Membro x={78} y={-372} ang={-bracoD} comp={190} larg={38} cor={PELE} manga={r.manga ? { comp: r.manga, cor: r.camisa } : undefined} ponta={celular ? celularNaMao : mao} dobra={-antebracoD} />
        <g transform={`rotate(${cabeca} 0 -405)`}>
          <rect x={-20} y={-430} width={40} height={40} fill={PELE_SOMBRA} />
          <circle cx={-102} cy={-505} r={21} fill={PELE} />
          <circle cx={102} cy={-505} r={21} fill={PELE} />
          <circle cx={0} cy={-510} r={104} fill={PELE} />
          {/* cabelo na régua: topo baixo, laterais raspadas e o risquinho */}
          <path d="M -104 -530 Q -110 -628 0 -632 Q 110 -628 104 -530 Q 96 -580 60 -590 Q 0 -600 -60 -590 Q -96 -580 -104 -530 Z" fill={COR.cabelo} />
          <path d="M -104 -530 Q -102 -480 -96 -470 L -88 -470 Q -94 -520 -92 -560 Z" fill={COR.cabelo} opacity={0.45} />
          <path d="M 104 -530 Q 102 -480 96 -470 L 88 -470 Q 94 -520 92 -560 Z" fill={COR.cabelo} opacity={0.45} />
          <path d="M -82 -575 L -56 -596" stroke={PELE} strokeWidth={5} strokeLinecap="round" />
          <g transform="translate(0 -500)">
            <Rosto olhos={olhos} boca={boca} piscar={piscar} />
          </g>
        </g>
      </g>
    </g>
  );
};
