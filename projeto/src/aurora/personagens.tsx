import { COR } from "./estilo";

// Personagens chapados em SVG: cabeça grande, corpo simples, olhos expressivos, sem contorno.
// Coordenadas locais com os pés em (0,0); o personagem tem ~620 unidades de altura.

export type Olhos = "normal" | "espanto" | "fechado" | "cima";
export type Boca = "neutra" | "aberta" | "o" | "sorriso" | "dentes";

type Pose = {
  bracoE?: number; // graus, 0 = pra baixo, positivo abre pra fora
  bracoD?: number;
  antebracoE?: number;
  antebracoD?: number;
  pernaE?: number;
  pernaD?: number;
  cabeca?: number; // inclinação
  tronco?: number;
};

export const Membro: React.FC<{ x: number; y: number; ang: number; comp: number; larg: number; cor: string; manga?: { comp: number; cor: string }; ponta?: React.ReactNode; dobra?: number }> = ({
  x,
  y,
  ang,
  comp,
  larg,
  cor,
  manga,
  ponta,
  dobra = 0,
}) => {
  const metade = comp / 2;
  return (
    <g transform={`translate(${x} ${y}) rotate(${ang})`}>
      <rect x={-larg / 2} y={0} width={larg} height={metade + larg / 2} rx={larg / 2} fill={cor} />
      {manga ? <rect x={-larg / 2 - 4} y={-6} width={larg + 8} height={manga.comp} rx={(larg + 8) / 2.4} fill={manga.cor} /> : null}
      <g transform={`translate(0 ${metade}) rotate(${dobra})`}>
        <rect x={-larg / 2} y={-larg / 2} width={larg} height={metade + larg / 2} rx={larg / 2} fill={cor} />
        <g transform={`translate(0 ${metade})`}>{ponta}</g>
      </g>
    </g>
  );
};

export const Rosto: React.FC<{ olhos: Olhos; boca: Boca; piscar?: boolean }> = ({ olhos, boca, piscar }) => {
  const fechado = olhos === "fechado" || piscar;
  const ry = olhos === "espanto" ? 30 : 24;
  const py = olhos === "cima" ? -12 : 2;
  return (
    <g>
      {[-40, 40].map((ex) => (
        <g key={ex}>
          {fechado ? (
            <path d={`M ${ex - 18} 0 Q ${ex} 10 ${ex + 18} 0`} stroke={COR.tinta} strokeWidth={6} fill="none" strokeLinecap="round" />
          ) : (
            <>
              <ellipse cx={ex} cy={0} rx={olhos === "espanto" ? 24 : 21} ry={ry} fill="#fff" />
              <circle cx={ex + (ex < 0 ? 3 : -3)} cy={py} r={olhos === "espanto" ? 8 : 10} fill={COR.tinta} />
              <circle cx={ex + (ex < 0 ? 6 : 0)} cy={py - 4} r={3} fill="#fff" />
            </>
          )}
          <path
            d={olhos === "espanto" ? `M ${ex - 20} ${-ry - 18} Q ${ex} ${-ry - 30} ${ex + 20} ${-ry - 18}` : `M ${ex - 20} -38 Q ${ex} -44 ${ex + 20} -36`}
            stroke={COR.cabelo}
            strokeWidth={9}
            fill="none"
            strokeLinecap="round"
          />
        </g>
      ))}
      <path d="M -6 22 Q 0 34 8 24" stroke={COR.peleSombra} strokeWidth={6} fill="none" strokeLinecap="round" />
      <g transform="translate(0 58)">
        {boca === "neutra" && <path d="M -16 0 L 16 0" stroke={COR.tinta} strokeWidth={6} strokeLinecap="round" />}
        {boca === "sorriso" && <path d="M -22 -4 Q 0 16 22 -4" stroke={COR.tinta} strokeWidth={6} fill="none" strokeLinecap="round" />}
        {boca === "o" && <ellipse cx={0} cy={2} rx={11} ry={14} fill={COR.tinta} />}
        {boca === "aberta" && (
          <g>
            <path d="M -26 -6 Q 0 -10 26 -6 Q 22 30 0 32 Q -22 30 -26 -6 Z" fill={COR.tinta} />
            <ellipse cx={0} cy={22} rx={12} ry={6} fill="#E46A6A" />
          </g>
        )}
        {boca === "dentes" && (
          <g>
            <rect x={-26} y={-10} width={52} height={22} rx={8} fill="#fff" />
            <path d="M -26 1 L 26 1" stroke={COR.tinta} strokeWidth={3} />
          </g>
        )}
      </g>
    </g>
  );
};

// Jonas: 23 anos, cabelo cacheado, pijama azul de manga curta.
export const Jonas: React.FC<{ x: number; y: number; escala?: number; pose?: Pose; olhos?: Olhos; boca?: Boca; piscar?: boolean; celular?: boolean; brilho?: number }> = ({
  x,
  y,
  escala = 1,
  pose = {},
  olhos = "normal",
  boca = "neutra",
  piscar,
  celular,
  brilho = 0,
}) => {
  const { bracoE = 8, bracoD = 8, antebracoE = 0, antebracoD = 0, pernaE = 0, pernaD = 0, cabeca = 0, tronco = 0 } = pose;
  const mao = <circle cx={0} cy={4} r={24} fill={COR.pele} />;
  const pe = <ellipse cx={8} cy={8} rx={32} ry={16} fill={COR.pele} />;
  const celularNaMao = (
    <g>
      <rect x={-26} y={-30} width={52} height={92} rx={10} fill="#1d1d22" />
      <rect x={-21} y={-24} width={42} height={78} rx={6} fill={COR.aurora} opacity={0.85} />
      <circle cx={0} cy={4} r={24} fill={COR.pele} />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${escala})`}>
      {brilho > 0 && <ellipse cx={0} cy={-320} rx={230} ry={360} fill={COR.aurora} opacity={0.22 * brilho} style={{ filter: "blur(40px)" }} />}
      <ellipse cx={0} cy={6} rx={110} ry={16} fill="rgba(0,0,0,0.22)" />
      <Membro x={-38} y={-205} ang={pernaE} comp={200} larg={48} cor={COR.pele} manga={{ comp: 78, cor: COR.pijamaEscuro }} ponta={pe} dobra={Math.max(0, -pernaE) * 0.8} />
      <Membro x={38} y={-205} ang={pernaD} comp={200} larg={48} cor={COR.pele} manga={{ comp: 78, cor: COR.pijamaEscuro }} ponta={pe} dobra={Math.max(0, -pernaD) * 0.8} />
      <g transform={`rotate(${tronco} 0 -205)`}>
        <rect x={-88} y={-240} width={176} height={58} rx={22} fill={COR.pijamaEscuro} />
        <Membro x={-86} y={-372} ang={bracoE} comp={190} larg={40} cor={COR.pele} manga={{ comp: 70, cor: COR.pijama }} ponta={mao} dobra={antebracoE} />
        <rect x={-92} y={-400} width={184} height={200} rx={44} fill={COR.pijama} />
        <path d="M -30 -398 L 0 -360 L 30 -398" fill={COR.pele} />
        <rect x={34} y={-340} width={36} height={30} rx={6} fill={COR.pijamaEscuro} />
        <Membro x={86} y={-372} ang={-bracoD} comp={190} larg={40} cor={COR.pele} manga={{ comp: 70, cor: COR.pijama }} ponta={celular ? celularNaMao : mao} dobra={-antebracoD} />
        <g transform={`rotate(${cabeca} 0 -405)`}>
          <rect x={-22} y={-430} width={44} height={40} fill={COR.peleSombra} />
          <circle cx={-104} cy={-505} r={22} fill={COR.pele} />
          <circle cx={104} cy={-505} r={22} fill={COR.pele} />
          <circle cx={0} cy={-510} r={108} fill={COR.pele} />
          {[
            [-80, -580, 40],
            [-40, -612, 44],
            [8, -622, 46],
            [54, -606, 42],
            [90, -572, 36],
            [-100, -540, 28],
            [104, -536, 26],
            [-14, -590, 40],
            [34, -588, 38],
          ].map(([cx, cy, r], i) => (
            <circle key={i} cx={cx} cy={cy} r={r} fill={COR.cabelo} />
          ))}
          <g transform="translate(0 -500)">
            <Rosto olhos={olhos} boca={boca} piscar={piscar} />
          </g>
        </g>
      </g>
    </g>
  );
};

// Pudim: gato laranja gordo. Pés em (0,0), ~340 de altura sentado; "agachado" pra caçar.
export const Pudim: React.FC<{ x: number; y: number; escala?: number; olhos?: "abertos" | "fechados" | "caca"; rabo?: number; agachado?: boolean; virado?: boolean }> = ({
  x,
  y,
  escala = 1,
  olhos = "abertos",
  rabo = 0,
  agachado,
  virado,
}) => {
  const laranja = "#E8873A";
  const escuro = "#C76A24";
  const claro = "#F6C08A";
  return (
    <g transform={`translate(${x} ${y}) scale(${virado ? -escala : escala} ${escala})`}>
      <ellipse cx={0} cy={6} rx={200} ry={22} fill="rgba(0,0,0,0.25)" />
      <path d={`M 150 -60 Q ${260 + rabo * 20} ${-120 - rabo * 40} ${230 + rabo * 30} ${-240 - rabo * 20}`} stroke={laranja} strokeWidth={44} fill="none" strokeLinecap="round" />
      <ellipse cx={20} cy={agachado ? -90 : -130} rx={190} ry={agachado ? 95 : 135} fill={laranja} />
      {[-60, 0, 60].map((sx) => (
        <path key={sx} d={`M ${sx + 20} ${agachado ? -180 : -260} q 14 30 0 60`} stroke={escuro} strokeWidth={16} fill="none" strokeLinecap="round" />
      ))}
      <ellipse cx={-30} cy={agachado ? -60 : -80} rx={90} ry={agachado ? 45 : 70} fill={claro} />
      <ellipse cx={-110} cy={-14} rx={46} ry={22} fill={laranja} />
      <ellipse cx={20} cy={-14} rx={46} ry={22} fill={laranja} />
      <g transform={`translate(-130 ${agachado ? -150 : -250})`}>
        <path d="M -80 -50 L -70 -140 L -10 -80 Z" fill={laranja} />
        <path d="M 80 -50 L 70 -140 L 10 -80 Z" fill={laranja} />
        <path d="M -66 -64 L -62 -116 L -28 -82 Z" fill="#E9A0A0" />
        <path d="M 66 -64 L 62 -116 L 28 -82 Z" fill="#E9A0A0" />
        <circle cx={0} cy={0} r={100} fill={laranja} />
        <path d="M -30 -96 q 10 30 0 50 M 0 -100 q 10 30 0 54 M 30 -96 q 10 30 0 50" stroke={escuro} strokeWidth={10} fill="none" strokeLinecap="round" />
        <ellipse cx={0} cy={40} rx={56} ry={40} fill={claro} />
        {[-38, 38].map((ex) =>
          olhos === "fechados" ? (
            <path key={ex} d={`M ${ex - 18} 0 Q ${ex} 12 ${ex + 18} 0`} stroke={COR.tinta} strokeWidth={6} fill="none" strokeLinecap="round" />
          ) : (
            <g key={ex}>
              <ellipse cx={ex} cy={0} rx={22} ry={olhos === "caca" ? 18 : 22} fill="#E8C64A" />
              <ellipse cx={ex} cy={0} rx={olhos === "caca" ? 4 : 8} ry={18} fill={COR.tinta} />
            </g>
          ),
        )}
        <path d="M -10 28 L 10 28 L 0 40 Z" fill="#D9707A" />
        <path d="M 0 40 Q -12 54 -22 48 M 0 40 Q 12 54 22 48" stroke={COR.tinta} strokeWidth={4} fill="none" strokeLinecap="round" />
        {[-1, 1].map((l) => (
          <g key={l} stroke="#fff" strokeWidth={3} opacity={0.8}>
            <line x1={40 * l} y1={40} x2={130 * l} y2={26} />
            <line x1={40 * l} y1={48} x2={130 * l} y2={52} />
          </g>
        ))}
      </g>
    </g>
  );
};
