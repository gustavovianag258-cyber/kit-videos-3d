import { useCurrentFrame } from "remotion";
import { COR } from "../aurora/estilo";
import { Corpo, Janela } from "./pessoa";

// Peças do raio-x do ep. 4: esqueleto (que também respira, anda e acena), gente de roupa que vira
// esqueleto, feixe verde saindo dos olhos e a mão com os ossos aparecendo.

const OSSO = "#EDE8DA";
const OSSO_SOMBRA = "#B9B29C";

// Esqueleto em pé, pés em (0,0), mesma régua do boneco (altura ~740, cabeça em y = -668).
export const Esqueleto: React.FC<{
  x: number;
  y: number;
  e?: number;
  bone?: boolean;
  pochete?: boolean;
  parafuso?: boolean;
  olhosVerdes?: number;
  celular?: boolean;
  op?: number;
  anda?: number;
  dir?: 1 | -1;
  vira?: number; // inclina a caveira (graus)
  acena?: number; // 0–1: levanta o braço e acena
  semente?: number;
}> = ({ x, y, e = 1, bone, pochete, parafuso, olhosVerdes = 0, celular, op = 1, anda = 0, dir = 1, vira = 0, acena = 0, semente = 0 }) => {
  const tg = useCurrentFrame() / 30;
  const s = anda ? Math.sin(tg * anda * Math.PI * 2 + semente) : 0;
  const pE = 24 * s;
  const pD = -24 * s;
  const bob = 1.7 * Math.sin(tg * 1.7 + semente);
  const cab = vira + 1.5 * Math.sin(tg * 0.8 + semente) + (anda ? 2 * s : 0);
  const braco = 1.2 * Math.sin(tg * 1 + semente);
  const linha = (x1: number, y1: number, x2: number, y2: number, l = 22) => <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={OSSO} strokeWidth={l} strokeLinecap="round" />;
  const baixa = anda ? 325 * (1 - Math.cos((Math.abs(pE) * Math.PI) / 180)) : 0;
  const perna = (px: number, ang: number) => (
    <g transform={`rotate(${ang} ${px} -340)`}>
      {linha(px, -340, px + Math.sign(px) * 3, -172, 24)}
      {linha(px + Math.sign(px) * 3, -172, px, -22, 21)}
      <circle cx={px + Math.sign(px) * 3} cy={-172} r={18} fill={OSSO} stroke={OSSO_SOMBRA} strokeWidth={3} />
      <ellipse cx={px + (px < 0 ? -6 : 8)} cy={-8} rx={32} ry={12} fill={OSSO} />
      {parafuso && px > 0 && (
        <g>
          <rect x={22} y={-196} width={32} height={9} rx={3} fill="#9AA0AA" />
          <rect x={22} y={-158} width={32} height={9} rx={3} fill="#9AA0AA" />
          <rect x={34} y={-198} width={8} height={50} rx={3} fill="#C9CED6" />
        </g>
      )}
    </g>
  );
  return (
    <g transform={`translate(${x} ${y + baixa * e}) scale(${dir * e} ${e})`} opacity={op}>
      {perna(-34, pE)}
      {perna(34, pD)}
      <g transform={`translate(0 ${bob})`}>
        <ellipse cx={0} cy={-348} rx={72} ry={32} fill={OSSO} stroke={OSSO_SOMBRA} strokeWidth={3} />
        <ellipse cx={-28} cy={-348} rx={13} ry={18} fill="#2A2230" opacity={0.55} />
        <ellipse cx={28} cy={-348} rx={13} ry={18} fill="#2A2230" opacity={0.55} />
        <rect x={-7} y={-592} width={14} height={246} rx={7} fill={OSSO} />
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <path d={`M 0 ${-560 + i * 34} Q -76 ${-560 + i * 34} -${70 - i * 6} ${-516 + i * 34}`} stroke={OSSO} strokeWidth={13} fill="none" strokeLinecap="round" />
            <path d={`M 0 ${-560 + i * 34} Q 76 ${-560 + i * 34} ${70 - i * 6} ${-516 + i * 34}`} stroke={OSSO} strokeWidth={13} fill="none" strokeLinecap="round" />
          </g>
        ))}
        {linha(-76, -582, 76, -582, 17)}
        <g transform={`rotate(${braco + (anda ? -20 * s : 0)} -84 -580)`}>
          {linha(-84, -580, -100, -462, 19)}
          {linha(-100, -462, -94, -340, 17)}
        </g>
        <g transform={`rotate(${-braco + (anda ? -20 * s : 0) - acena * (150 + 9 * Math.sin(tg * 5))} 84 -580)`}>
          {linha(84, -580, 100, -462, 19)}
          {linha(100, -462, celular ? 76 : 94, celular ? -420 : -340, 17)}
          {celular && (
            <g>
              <rect x={56} y={-460} width={38} height={68} rx={8} fill="#1d1d22" />
              <rect x={60} y={-454} width={30} height={54} rx={5} fill="#7FB3E8" opacity={0.7} />
            </g>
          )}
        </g>
        {pochete && (
          <g>
            <rect x={-80} y={-384} width={160} height={20} fill="#1F1F24" />
            <rect x={-24} y={-400} width={48} height={46} rx={11} fill="#26262C" />
            <circle cx={0} cy={-376} r={5} fill="#777" />
            <path d="M -36 -590 Q 0 -500 36 -590" stroke="#E8E8E8" strokeWidth={4} fill="none" />
            <rect x={-8} y={-506} width={20} height={11} rx={4} fill="#C9C9C9" />
          </g>
        )}
        <g transform={`rotate(${cab} 0 -600)`}>
          <rect x={-17} y={-622} width={34} height={36} fill={OSSO} />
          <ellipse cx={0} cy={-672} rx={60} ry={64} fill={OSSO} stroke={OSSO_SOMBRA} strokeWidth={3} />
          <rect x={-34} y={-628} width={68} height={32} rx={9} fill={OSSO} stroke={OSSO_SOMBRA} strokeWidth={3} />
          {[-22, -7, 7, 22].map((tx) => (
            <line key={tx} x1={tx} y1={-628} x2={tx} y2={-598} stroke={OSSO_SOMBRA} strokeWidth={3} />
          ))}
          {[-24, 24].map((ex) => (
            <g key={ex}>
              <circle cx={ex} cy={-676} r={18} fill="#2A2230" />
              {olhosVerdes > 0 && (
                <>
                  <circle cx={ex} cy={-676} r={24 * olhosVerdes + 6} fill={COR.aurora} opacity={0.4} style={{ filter: "blur(6px)" }} />
                  <circle cx={ex} cy={-676} r={8} fill={COR.aurora} />
                  <circle cx={ex} cy={-676} r={3.4} fill="#EFFFF8" />
                </>
              )}
            </g>
          ))}
          <path d="M -7 -650 L 0 -664 L 7 -650 Z" fill="#2A2230" />
          {bone && (
            <g transform="translate(0 -30)">
              <path d="M -66 -690 Q -62 -754 0 -756 Q 62 -754 66 -690 Z" fill="#2E6B4F" />
              <path d="M -66 -690 Q 20 -664 108 -698 Q 112 -684 68 -672 Q 0 -648 -66 -668 Z" fill="#245A41" />
            </g>
          )}
        </g>
      </g>
    </g>
  );
};

// Pessoa comum de roupa; `raio` (0–1) troca a roupa pelo esqueleto.
export const Gente: React.FC<{
  x: number;
  y: number;
  e?: number;
  cor?: string;
  pele?: string;
  cabelo?: string;
  raio?: number;
  parafuso?: boolean;
  celular?: boolean;
  longo?: boolean;
  anda?: number;
  dir?: 1 | -1;
  olha?: number;
  olhos?: "normal" | "espanto" | "fechado" | "cima";
  boca?: "neutra" | "aberta" | "o" | "sorriso" | "dentes";
  pose?: { bracoE?: number; bracoD?: number; antebracoE?: number; antebracoD?: number };
  t?: number;
  fala?: Janela[];
  semente?: string;
}> = ({ x, y, e = 1, cor = "#C05070", pele = "#C98B5E", cabelo = "#2B1E1A", raio = 0, parafuso, celular, longo, anda, dir, olha, olhos, boca, pose, t, fala, semente }) => (
  <g transform={`translate(${x} ${y}) scale(${e})`}>
    {raio < 1 && (
      <g opacity={1 - raio}>
        <Corpo
          x={0}
          y={0}
          cores={{ pele, peleSombra: "#7C4C31", camisa: cor, camisaEscura: "#00000040", calca: "#3A4A6A", tenis: "#26262C", cabelo }}
          cabelo={longo ? "longo" : "curto"}
          manga={90}
          celular={celular}
          anda={anda}
          dir={dir}
          olha={olha}
          olhos={olhos}
          boca={boca}
          t={t}
          fala={fala}
          semente={semente ?? cor}
          pose={pose ?? { bracoD: celular ? 40 : 6, antebracoD: celular ? -110 : 0 }}
        />
      </g>
    )}
    {raio > 0 && <Esqueleto x={0} y={0} op={raio} parafuso={parafuso} celular={celular} anda={anda} dir={dir} semente={x * 0.013} />}
  </g>
);

// Feixe de raio-x saindo de (x, y) na direção `ang` (graus; 0 = pra direita). Tremula levemente.
export const Feixe: React.FC<{ t: number; x: number; y: number; ang?: number; comp?: number; abre?: number; forca?: number; id?: string }> = ({ t, x, y, ang = 0, comp = 1300, abre = 220, forca = 1, id = "fx" }) => {
  const tr = 1 + Math.sin(t * 40) * 0.03;
  return (
    <g transform={`translate(${x} ${y}) rotate(${ang})`} opacity={forca} style={{ pointerEvents: "none" }}>
      <defs>
        <linearGradient id={id} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={COR.aurora} stopOpacity="0.85" />
          <stop offset="1" stopColor={COR.aurora} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,-14 ${comp * tr},${-abre} ${comp * tr},${abre} 0,14`} fill={`url(#${id})`} style={{ mixBlendMode: "screen" }} />
      <polygon points={`0,-6 ${comp * 0.6 * tr},${-abre * 0.3} ${comp * 0.6 * tr},${abre * 0.3} 0,6`} fill="#EFFFF8" opacity={0.35} />
      {/* ondas correndo dentro do feixe */}
      {[0, 1, 2, 3].map((i) => {
        const k = ((t * 1.6 + i / 4) % 1) * comp * 0.9;
        return <line key={i} x1={k} y1={(-abre * k) / comp} x2={k} y2={(abre * k) / comp} stroke="#EFFFF8" strokeWidth={5} opacity={0.3 * (1 - k / comp)} />;
      })}
    </g>
  );
};

// Mão em primeira pessoa: ele olhando a própria mão direita, de costas pra ele, com o polegar à
// esquerda. `raio` (0–1) é uma varredura que sobe do punho até a ponta dos dedos, trocando a pele
// pelo raio-x. Palma em (0,0); o antebraço e a manga saem por baixo da tela.
const DEDOS = [
  { x: -80, len: 190, w: 54, a: -7 },
  { x: -22, len: 216, w: 56, a: -2 },
  { x: 36, len: 198, w: 54, a: 3 },
  { x: 90, len: 152, w: 48, a: 10 },
];
export const MaoOssos: React.FC<{ x: number; y: number; e?: number; raio: number; rot?: number; mangaCor?: string }> = ({ x, y, e = 1, raio, rot = 0, mangaCor }) => {
  const tg = useCurrentFrame() / 30;
  const dobra = (i: number) => Math.sin(tg * 1.3 + i * 0.7) * 1.1;
  const PELE = "#A06845";
  const corte = 720 - raio * 1120; // altura da varredura
  const osso = (x1: number, y1: number, x2: number, y2: number, l: number) => (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={OSSO_SOMBRA} strokeWidth={l + 4} strokeLinecap="round" />
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={OSSO} strokeWidth={l} strokeLinecap="round" />
    </g>
  );
  const silhueta = (fill: string) => (
    <g>
      <path d="M -120 -92 Q -128 40 -86 130 L -74 330 L 74 330 L 90 130 Q 132 30 118 -92 Q 0 -122 -120 -92 Z" fill={fill} />
      <rect x={-92} y={320} width={184} height={400} fill={fill} />
      {DEDOS.map((d, i) => (
        <g key={i} transform={`translate(${d.x} -86) rotate(${d.a + dobra(i)})`}>
          <rect x={-d.w / 2} y={-d.len} width={d.w} height={d.len + 34} rx={d.w / 2.1} fill={fill} />
        </g>
      ))}
      <g transform={`translate(-112 48) rotate(${-52 + dobra(5)})`}>
        <rect x={-30} y={-150} width={60} height={190} rx={28} fill={fill} />
      </g>
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${e})`}>
      <defs>
        <clipPath id="maoPele">
          <rect x={-500} y={-600} width={1000} height={600 + corte} />
        </clipPath>
        <clipPath id="maoRaio">
          <rect x={-500} y={corte} width={1000} height={1400} />
        </clipPath>
        <linearGradient id="maoLuz" x1="0" y1="0" x2="1" y2="0.3">
          <stop offset="0" stopColor="#fff" stopOpacity={0.22} />
          <stop offset="0.5" stopColor="#fff" stopOpacity={0} />
          <stop offset="1" stopColor="#000" stopOpacity={0.3} />
        </linearGradient>
      </defs>
      {/* a mão de verdade, acima da varredura */}
      <g clipPath="url(#maoPele)">
        {silhueta(PELE)}
        {silhueta("url(#maoLuz)")}
        {DEDOS.map((d, i) => (
          <g key={i} transform={`translate(${d.x} -86) rotate(${d.a + dobra(i)})`}>
            {/* unha e dobrinhas */}
            <rect x={-d.w / 2 + 9} y={-d.len + 8} width={d.w - 18} height={38} rx={13} fill="#D9A98C" />
            <rect x={-d.w / 2 + 12} y={-d.len + 11} width={d.w - 24} height={10} rx={5} fill="#EBC6AE" />
            {[0.34, 0.66].map((k) => (
              <path key={k} d={`M ${-d.w / 2 + 9} ${-d.len * k} q ${d.w / 2 - 9} 7 ${d.w - 18} 0`} stroke="#7C4C31" strokeWidth={3} fill="none" opacity={0.6} />
            ))}
          </g>
        ))}
        <g transform={`translate(-112 48) rotate(${-52 + dobra(5)})`}>
          <rect x={-20} y={-142} width={40} height={36} rx={13} fill="#D9A98C" />
        </g>
        {[-80, -22, 36, 90].map((kx) => (
          <ellipse key={kx} cx={kx} cy={-82} rx={17} ry={11} fill="#8A5637" opacity={0.65} />
        ))}
        {[-52, 6, 62].map((kx) => (
          <path key={kx} d={`M ${kx} 90 L ${kx * 0.82} -60`} stroke="#8A5637" strokeWidth={5} opacity={0.3} />
        ))}
      </g>
      {/* o raio-x, abaixo da varredura */}
      <g clipPath="url(#maoRaio)">
        {silhueta("#123C30")}
        {silhueta("url(#maoLuz)")}
        <g style={{ filter: `drop-shadow(0 0 10px ${COR.aurora})` }}>
          {/* rádio e ulna */}
          {osso(-34, 180, -42, 720, 34)}
          {osso(34, 180, 40, 720, 28)}
          {/* ossinhos do punho */}
          {[
            [-46, 118],
            [-12, 104],
            [24, 106],
            [56, 122],
            [-30, 150],
            [8, 146],
            [42, 152],
          ].map(([cx, cy], i) => (
            <ellipse key={i} cx={cx} cy={cy} rx={20} ry={17} fill={OSSO} stroke={OSSO_SOMBRA} strokeWidth={3} />
          ))}
          {/* metacarpos e falanges */}
          {DEDOS.map((d, i) => (
            <g key={i}>
              {osso(d.x * 0.5, 84, d.x * 0.98, -64, 20)}
              <g transform={`translate(${d.x} -86) rotate(${d.a + dobra(i)})`}>
                {osso(0, -6, 0, -d.len * 0.46, 19)}
                {osso(0, -d.len * 0.53, 0, -d.len * 0.76, 16)}
                {osso(0, -d.len * 0.83, 0, -d.len * 0.95, 14)}
              </g>
            </g>
          ))}
          {osso(-46, 92, -104, 44, 22)}
          <g transform={`translate(-112 48) rotate(${-52 + dobra(5)})`}>
            {osso(0, -6, 0, -70, 19)}
            {osso(0, -86, 0, -128, 16)}
          </g>
        </g>
      </g>
      {/* a linha da varredura */}
      {raio > 0 && raio < 1 && (
        <rect x={-260} y={corte - 4} width={520} height={8} fill={COR.aurora} style={{ filter: `drop-shadow(0 0 14px ${COR.aurora})` }} />
      )}
      {/* manga da jaqueta */}
      <rect x={-112} y={470} width={224} height={300} rx={18} fill={mangaCor ?? "#4B3A7A"} />
      <rect x={-112} y={470} width={224} height={300} rx={18} fill="url(#maoLuz)" />
      {!mangaCor && <rect x={-112} y={492} width={224} height={16} fill="#E8F26B" opacity={0.9} />}
    </g>
  );
};
