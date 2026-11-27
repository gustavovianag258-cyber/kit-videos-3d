import { useCurrentFrame } from "remotion";
import { COR } from "./estilo";
import { clipe } from "./falas";
import { Boca, Membro, Olhos, Rosto } from "./personagens";

// Boca mexendo enquanto a fala do personagem está tocando (abre nas palavras, fecha nos vãos).
export const useBoca = (ids: string[], aberta: Boca = "aberta", fechada: Boca = "neutra"): Boca => {
  const s = useCurrentFrame() / 30;
  for (const id of ids) {
    const c = clipe(id);
    if (s < c.inicio || s > c.fim) continue;
    const p = c.palavras.find((w) => s >= w.s && s <= w.e);
    if (!p) return fechada;
    return Math.floor((s - p.s) / 0.09) % 2 === 0 ? aberta : "o";
  }
  return fechada;
};

// Dona Cida: ~52 anos, coque, avental, chinelo. Pés em (0,0).
export const Cida: React.FC<{ x: number; y: number; escala?: number; olhos?: Olhos; boca?: Boca; bracoD?: number; celular?: boolean; sentada?: boolean }> = ({
  x,
  y,
  escala = 1,
  olhos = "normal",
  boca = "neutra",
  bracoD = 20,
  celular,
  sentada,
}) => {
  const pele = "#B9774C";
  const blusa = "#C0506A";
  const mao = <circle cx={0} cy={4} r={24} fill={pele} />;
  return (
    <g transform={`translate(${x} ${y}) scale(${escala})`}>
      {!sentada && (
        <>
          <Membro x={-40} y={-200} ang={0} comp={200} larg={52} cor={pele} ponta={<ellipse cx={8} cy={8} rx={34} ry={16} fill="#3a7" />} />
          <Membro x={40} y={-200} ang={0} comp={200} larg={52} cor={pele} ponta={<ellipse cx={8} cy={8} rx={34} ry={16} fill="#3a7" />} />
        </>
      )}
      <path d="M -110 -200 Q -120 -60 -100 -40 L 100 -40 Q 120 -60 110 -200 Z" fill="#5A4E8C" />
      <Membro x={-96} y={-372} ang={14} comp={190} larg={44} cor={pele} manga={{ comp: 60, cor: blusa }} ponta={mao} dobra={-30} />
      <rect x={-104} y={-410} width={208} height={230} rx={60} fill={blusa} />
      <path d="M -60 -380 L 60 -380 L 70 -190 L -70 -190 Z" fill="#F1E6D2" opacity={0.95} />
      <Membro
        x={96}
        y={-372}
        ang={-bracoD}
        comp={190}
        larg={44}
        cor={pele}
        manga={{ comp: 60, cor: blusa }}
        dobra={-40}
        ponta={
          celular ? (
            <g>
              <rect x={-26} y={-34} width={52} height={92} rx={10} fill="#1d1d22" />
              <rect x={-21} y={-28} width={42} height={78} rx={6} fill="#7FB3E8" />
              {mao}
            </g>
          ) : (
            mao
          )
        }
      />
      <rect x={-22} y={-440} width={44} height={40} fill="#A3653D" />
      <circle cx={0} cy={-520} r={110} fill={pele} />
      <path d="M -112 -540 Q -100 -650 0 -652 Q 100 -650 112 -540 Q 90 -600 0 -600 Q -90 -600 -112 -540 Z" fill="#4A3426" />
      <circle cx={0} cy={-660} r={52} fill="#4A3426" />
      <circle cx={-104} cy={-505} r={20} fill={pele} />
      <circle cx={104} cy={-505} r={20} fill={pele} />
      <circle cx={104} cy={-482} r={8} fill={COR.amarelo} />
      <circle cx={-104} cy={-482} r={8} fill={COR.amarelo} />
      <g transform="translate(0 -510)">
        <Rosto olhos={olhos} boca={boca} />
        <circle cx={-62} cy={40} r={16} fill="#D46A6A" opacity={0.35} />
        <circle cx={62} cy={40} r={16} fill="#D46A6A" opacity={0.35} />
      </g>
    </g>
  );
};

// O Olheiro: senhor de boné, pochete, prancheta e apito. Olhos podem acender em verde.
// `apito` (graus) entorta o cordão do apito, puxado por um ímã (ep. 2).
export const Olheiro: React.FC<{ x: number; y: number; escala?: number; olhosVerdes?: number; apito?: number }> = ({ x, y, escala = 1, olhosVerdes = 0, apito = 0 }) => {
  const pele = "#C89A72";
  return (
    <g transform={`translate(${x} ${y}) scale(${escala})`}>
      <ellipse cx={0} cy={6} rx={110} ry={16} fill="rgba(0,0,0,0.3)" />
      <Membro x={-38} y={-205} ang={0} comp={200} larg={50} cor="#3B3F4A" ponta={<ellipse cx={10} cy={8} rx={36} ry={16} fill="#1E1E22" />} />
      <Membro x={38} y={-205} ang={0} comp={200} larg={50} cor="#3B3F4A" ponta={<ellipse cx={10} cy={8} rx={36} ry={16} fill="#1E1E22" />} />
      <Membro x={-90} y={-372} ang={6} comp={190} larg={42} cor={pele} manga={{ comp: 70, cor: "#2E6B4F" }} ponta={<circle cx={0} cy={4} r={24} fill={pele} />} />
      <rect x={-96} y={-405} width={192} height={220} rx={46} fill="#2E6B4F" />
      <path d="M -96 -330 L 96 -330" stroke="#F2F2F2" strokeWidth={10} />
      <rect x={-80} y={-218} width={160} height={46} rx={18} fill="#1F1F24" />
      <circle cx={40} cy={-195} r={8} fill="#666" />
      <g transform={`rotate(${apito} 0 -400)`}>
        <path d="M -40 -400 Q 0 -310 40 -400" stroke="#E8E8E8" strokeWidth={4} fill="none" />
        <rect x={-10} y={-330} width={26} height={14} rx={5} fill="#C9C9C9" />
      </g>
      {/* braço com a prancheta */}
      <Membro
        x={90}
        y={-372}
        ang={-30}
        comp={190}
        larg={42}
        cor={pele}
        manga={{ comp: 70, cor: "#2E6B4F" }}
        dobra={-80}
        ponta={
          <g>
            <rect x={-60} y={-80} width={110} height={150} rx={8} fill="#8B6A43" />
            <rect x={-50} y={-66} width={90} height={126} rx={4} fill="#F4F1EA" />
            {[0, 1, 2, 3].map((i) => (
              <rect key={i} x={-42} y={-50 + i * 26} width={70} height={6} rx={3} fill="#9AA" />
            ))}
            <circle cx={0} cy={4} r={24} fill={pele} />
          </g>
        }
      />
      <rect x={-22} y={-435} width={44} height={40} fill="#B08560" />
      <circle cx={0} cy={-510} r={105} fill={pele} />
      <path d="M -60 -460 Q 0 -420 60 -460 Q 50 -430 0 -425 Q -50 -430 -60 -460 Z" fill="#DDD" />
      <g transform="translate(0 -505)">
        {[-40, 40].map((ex) => (
          <g key={ex}>
            <ellipse cx={ex} cy={0} rx={18} ry={10} fill="#fff" />
            <circle cx={ex} cy={0} r={8} fill={COR.tinta} />
            {olhosVerdes > 0 && (
              <>
                <circle cx={ex} cy={0} r={14} fill={COR.aurora} opacity={olhosVerdes} />
                <circle cx={ex} cy={0} r={40} fill={COR.aurora} opacity={0.35 * olhosVerdes} style={{ filter: "blur(10px)" }} />
              </>
            )}
            <path d={`M ${ex - 22} -22 L ${ex + 20} -16`} stroke="#DDD" strokeWidth={9} strokeLinecap="round" />
          </g>
        ))}
        <path d="M -24 50 Q 0 64 28 44" stroke={COR.tinta} strokeWidth={6} fill="none" strokeLinecap="round" />
      </g>
      {/* boné */}
      <path d="M -108 -560 Q -100 -650 0 -650 Q 100 -650 108 -560 Z" fill="#1F3B73" />
      <path d="M -10 -568 L 170 -560 Q 150 -540 -10 -548 Z" fill="#183062" />
      <circle cx={0} cy={-648} r={10} fill="#183062" />
    </g>
  );
};
