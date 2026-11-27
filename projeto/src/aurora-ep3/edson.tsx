import { COR } from "../aurora/estilo";
import { Boca, Membro, Olhos } from "../aurora/personagens";

// Seu Edson: 61 anos, porteiro da noite. Mesmo traço do Jonas e do Bruno (pés em (0,0),
// ~640 de altura), barriguinha, careca no alto com as laterais e o bigode grisalhos, camisa
// azul-clara de porteiro com crachá e quepe opcional.
// `prende` (0–1): bochecha cheia e cara vermelha (prendendo o ar).
// `fantasma` (0–1): fica translúcido, verde-aurora e brilhando (o poder ligado).

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

const PELE = "#C58A62";
const PELE_SOMBRA = "#A9704B";
const GRIS = "#D9D6D0";
const CAMISA = "#9CC3E4";
const CAMISA_ESC = "#7FA9CF";
const CALCA = "#26324F";

const RostoEdson: React.FC<{ olhos: Olhos; boca: Boca; piscar?: boolean; prende: number }> = ({ olhos, boca, piscar, prende }) => {
  const fechado = olhos === "fechado" || piscar;
  const ry = olhos === "espanto" ? 28 : 21;
  const py = olhos === "cima" ? -10 : 2;
  return (
    <g>
      {[-40, 40].map((ex) => (
        <g key={ex}>
          {fechado ? (
            <path d={`M ${ex - 18} 0 Q ${ex} 10 ${ex + 18} 0`} stroke={COR.tinta} strokeWidth={6} fill="none" strokeLinecap="round" />
          ) : (
            <>
              <ellipse cx={ex} cy={0} rx={olhos === "espanto" ? 23 : 19} ry={ry} fill="#fff" />
              <circle cx={ex + (ex < 0 ? 3 : -3)} cy={py} r={olhos === "espanto" ? 7 : 9} fill={COR.tinta} />
              <circle cx={ex + (ex < 0 ? 6 : 0)} cy={py - 4} r={3} fill="#fff" />
              {/* pálpebra caída de quem passou a noite acordado */}
              {olhos === "normal" && <path d={`M ${ex - 21} -6 Q ${ex} -26 ${ex + 21} -6 L ${ex + 21} -22 L ${ex - 21} -22 Z`} fill={PELE} />}
            </>
          )}
          {/* sobrancelha grisalha e grossa */}
          <path
            d={olhos === "espanto" ? `M ${ex - 22} ${-ry - 16} Q ${ex} ${-ry - 30} ${ex + 22} ${-ry - 16}` : `M ${ex - 24} -32 Q ${ex} -42 ${ex + 24} -30`}
            stroke={GRIS}
            strokeWidth={12}
            fill="none"
            strokeLinecap="round"
          />
        </g>
      ))}
      {/* nariz grande */}
      <ellipse cx={2} cy={28} rx={20} ry={16} fill={PELE_SOMBRA} />
      {prende > 0.3 ? (
        <g>
          <circle cx={-58} cy={58} r={42 * prende} fill="#D07A5E" />
          <circle cx={58} cy={58} r={42 * prende} fill="#D07A5E" />
          <circle cx={-56} cy={50} r={14} fill="#E05A5A" opacity={0.45 * prende} />
          <circle cx={56} cy={50} r={14} fill="#E05A5A" opacity={0.45 * prende} />
          <path d="M -14 66 Q 0 60 14 66" stroke={COR.tinta} strokeWidth={6} fill="none" strokeLinecap="round" />
        </g>
      ) : (
        <g transform="translate(0 66)">
          {boca === "neutra" && <path d="M -16 0 Q 0 -4 16 0" stroke={COR.tinta} strokeWidth={6} fill="none" strokeLinecap="round" />}
          {boca === "sorriso" && <path d="M -22 -4 Q 0 16 22 -4" stroke={COR.tinta} strokeWidth={6} fill="none" strokeLinecap="round" />}
          {boca === "o" && <ellipse cx={0} cy={4} rx={12} ry={15} fill={COR.tinta} />}
          {boca === "aberta" && (
            <g>
              <path d="M -26 -4 Q 0 -8 26 -4 Q 22 32 0 34 Q -22 32 -26 -4 Z" fill={COR.tinta} />
              <ellipse cx={0} cy={24} rx={12} ry={6} fill="#E46A6A" />
            </g>
          )}
          {boca === "dentes" && (
            <g>
              <rect x={-26} y={-8} width={52} height={22} rx={8} fill="#fff" />
              <path d="M -26 3 L 26 3" stroke={COR.tinta} strokeWidth={3} />
            </g>
          )}
        </g>
      )}
      {/* bigodão grisalho */}
      <path d="M -50 54 Q -30 36 0 44 Q 30 36 50 54 Q 30 50 0 56 Q -30 50 -50 54 Z" fill={GRIS} />
    </g>
  );
};

export const Edson: React.FC<{
  x: number;
  y: number;
  escala?: number;
  pose?: Pose;
  olhos?: Olhos;
  boca?: Boca;
  piscar?: boolean;
  prende?: number;
  fantasma?: number;
  quepe?: boolean;
  celular?: boolean;
  caneca?: boolean;
  semPernas?: boolean; // quando está afundado no chão
  rot?: number;
}> = ({ x, y, escala = 1, pose = {}, olhos = "normal", boca = "neutra", piscar, prende = 0, fantasma = 0, quepe, celular, caneca, semPernas, rot = 0 }) => {
  const { bracoE = 8, bracoD = 8, antebracoE = 0, antebracoD = 0, pernaE = 0, pernaD = 0, cabeca = 0, tronco = 0 } = pose;
  const pele = prende > 0.3 ? "#D07A5E" : PELE;
  const mao = <circle cx={0} cy={4} r={24} fill={pele} />;
  const sapato = <ellipse cx={10} cy={8} rx={38} ry={17} fill="#1E1E22" />;
  const naMaoD = celular ? (
    <g>
      <rect x={-26} y={-30} width={52} height={92} rx={10} fill="#1d1d22" />
      <rect x={-21} y={-24} width={42} height={78} rx={6} fill="#7FB3E8" />
      {mao}
    </g>
  ) : caneca ? (
    <g>
      <rect x={-10} y={-34} width={52} height={56} rx={8} fill="#F4ECDD" />
      <path d="M 42 -22 q 22 0 22 18 q 0 18 -22 18" stroke="#F4ECDD" strokeWidth={8} fill="none" />
      {mao}
    </g>
  ) : (
    mao
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${escala}) rotate(${rot})`} opacity={1 - 0.35 * fantasma}
      style={fantasma > 0 ? { filter: `sepia(${fantasma}) hue-rotate(${95 * fantasma}deg) saturate(${1 + 1.5 * fantasma}) drop-shadow(0 0 ${22 * fantasma}px ${COR.aurora})` } : undefined}
    >
      {fantasma > 0 && <ellipse cx={0} cy={-330} rx={240} ry={380} fill={COR.aurora} opacity={0.25 * fantasma} style={{ filter: "blur(40px)" }} />}
      {!semPernas && (
        <>
          <ellipse cx={0} cy={6} rx={110} ry={16} fill="rgba(0,0,0,0.22)" opacity={1 - fantasma} />
          <Membro x={-40} y={-205} ang={pernaE} comp={200} larg={50} cor={CALCA} ponta={sapato} dobra={Math.max(0, -pernaE) * 0.8} />
          <Membro x={40} y={-205} ang={pernaD} comp={200} larg={50} cor={CALCA} ponta={sapato} dobra={Math.max(0, -pernaD) * 0.8} />
        </>
      )}
      <g transform={`rotate(${tronco} 0 -205)`}>
        <rect x={-92} y={-250} width={184} height={62} rx={24} fill={CALCA} />
        <rect x={-92} y={-236} width={184} height={12} fill="#1A1A1E" />
        <Membro x={-84} y={-372} ang={bracoE} comp={190} larg={42} cor={pele} manga={{ comp: 74, cor: CAMISA }} ponta={mao} dobra={antebracoE} />
        {/* camisa com barriguinha */}
        <rect x={-92} y={-405} width={184} height={200} rx={44} fill={CAMISA} />
        <ellipse cx={8} cy={-262} rx={104} ry={70} fill={CAMISA} />
        <path d="M 0 -400 L 0 -200" stroke={CAMISA_ESC} strokeWidth={5} />
        {[-370, -320, -270, -220].map((cy) => (
          <circle key={cy} cx={10} cy={cy} r={6} fill="#F4F4F0" />
        ))}
        {/* bolso com caneta e crachá */}
        <rect x={-74} y={-366} width={56} height={52} rx={6} fill={CAMISA_ESC} />
        <rect x={-50} y={-384} width={8} height={30} rx={3} fill="#2F5DA8" />
        <rect x={34} y={-370} width={50} height={62} rx={6} fill="#F4F4F0" />
        <rect x={40} y={-362} width={38} height={14} rx={3} fill="#2F5DA8" />
        <rect x={40} y={-342} width={38} height={6} rx={3} fill="#9AA" />
        <rect x={40} y={-330} width={26} height={6} rx={3} fill="#9AA" />
        <path d="M -40 -402 L 0 -376 L 40 -402" stroke={CAMISA_ESC} strokeWidth={9} fill="none" strokeLinecap="round" />
        <Membro x={84} y={-372} ang={-bracoD} comp={190} larg={42} cor={pele} manga={{ comp: 74, cor: CAMISA }} ponta={naMaoD} dobra={-antebracoD} />
        <g transform={`rotate(${cabeca} 0 -405)`}>
          <rect x={-24} y={-432} width={48} height={40} fill={PELE_SOMBRA} />
          <circle cx={-104} cy={-505} r={22} fill={pele} />
          <circle cx={104} cy={-505} r={22} fill={pele} />
          <ellipse cx={0} cy={-510} rx={108} ry={106} fill={pele} />
          {/* careca brilhando, laterais grisalhas */}
          <ellipse cx={-30} cy={-590} rx={34} ry={14} fill="rgba(255,255,255,0.22)" transform="rotate(-18 -30 -590)" />
          <path d="M -108 -520 Q -112 -580 -84 -600 Q -96 -560 -90 -470 L -100 -470 Q -110 -490 -108 -520 Z" fill={GRIS} />
          <path d="M 108 -520 Q 112 -580 84 -600 Q 96 -560 90 -470 L 100 -470 Q 110 -490 108 -520 Z" fill={GRIS} />
          <g transform="translate(0 -505)">
            <RostoEdson olhos={olhos} boca={boca} piscar={piscar} prende={prende} />
          </g>
          {quepe && (
            <g>
              <path d="M -100 -580 Q -96 -660 0 -664 Q 96 -660 100 -580 Z" fill={CALCA} />
              <rect x={-104} y={-596} width={208} height={22} rx={6} fill="#1A1A1E" />
              <path d="M -96 -578 Q 0 -548 96 -578 L 110 -566 Q 0 -526 -110 -566 Z" fill="#14141A" />
              <circle cx={0} cy={-620} r={14} fill={COR.amarelo} />
            </g>
          )}
        </g>
      </g>
    </g>
  );
};
