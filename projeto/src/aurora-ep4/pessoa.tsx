import { createContext, useContext } from "react";
import { useCurrentFrame } from "remotion";
import { COR } from "../aurora/estilo";
import { Boca, Olhos } from "../aurora/personagens";

// Boneco do ep. 4 (pedido do usuário em 06/11/2026: igual ao do vídeo de "super velocidade", e
// VIVO). Proporção de gente: cabeça pequena, tronco e membros em blocos, luz e sombra em degradê.
// Ele nunca fica parado: respira, troca o peso de perna, mexe a cabeça, pisca sozinho, olha pros
// lados, gesticula quando fala e sabe andar e correr. Pés em (0,0); cabeça em y = -CABECA_Y.
export const CABECA_Y = 668;
// Com true, o corpo ganha volume: membros cilíndricos, cabeça esférica e sombra projetada no chão.
export const VolumeCtx = createContext(false);
export type Janela = [number, number];

export type Pose = { bracoE?: number; bracoD?: number; antebracoE?: number; antebracoD?: number; pernaE?: number; pernaD?: number; joelhoE?: number; joelhoD?: number; cabeca?: number; tronco?: number };
export type Cores = { pele: string; peleSombra: string; camisa: string; camisaEscura: string; calca: string; tenis: string; cabelo: string };
export type CabeloTipo = "curto" | "careca" | "grisalho" | "bone" | "longo" | "touca";

// 0–1: o quanto a pessoa está "em fala" agora (sobe e desce suave em volta de cada palavra)
export const envFala = (t: number, fala?: Janela[]) => {
  if (!fala) return 0;
  let e = 0;
  for (const [a, b] of fala) {
    const d = t < a ? a - t : t > b ? t - b : 0;
    e = Math.max(e, 1 - d / 0.35);
  }
  return Math.max(0, e);
};
export const bocaDe = (t: number, fala: Janela[] | undefined, fechada: Boca): Boca =>
  (fala ?? []).some(([a, b]) => t >= a && t <= b) ? (Math.floor(t / 0.12) % 2 ? "aberta" : "o") : fechada;

const hash = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 997;
  return h / 97;
};
const rad = (g: number) => (g * Math.PI) / 180;

let _n = 0;
const GradVolume: React.FC<{ id: string }> = ({ id }) => (
  <linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stopColor="#000" stopOpacity={0.28} />
    <stop offset="0.3" stopColor="#fff" stopOpacity={0.3} />
    <stop offset="0.58" stopColor="#fff" stopOpacity={0} />
    <stop offset="1" stopColor="#000" stopOpacity={0.52} />
  </linearGradient>
);
const Grad: React.FC<{ id: string; claro?: number; escuro?: number }> = ({ id, claro = 0.22, escuro = 0.28 }) => (
  <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stopColor="#fff" stopOpacity={claro} />
    <stop offset="0.45" stopColor="#fff" stopOpacity={0} />
    <stop offset="1" stopColor="#000" stopOpacity={escuro} />
  </linearGradient>
);

const Bloco: React.FC<{ x: number; y: number; w: number; h: number; r?: number; cor: string; g: string }> = ({ x, y, w, h, r = 16, cor, g }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx={r} fill={cor} />
    <rect x={x} y={y} width={w} height={h} rx={r} fill={`url(#${g})`} />
  </g>
);

// membro de dois segmentos saindo de (x, y), rodado em `ang`.
const Membro2: React.FC<{ x: number; y: number; ang: number; dobra: number; l1: number; l2: number; w1: number; w2: number; cor: string; g: string; ponta: React.ReactNode; manga?: { l: number; cor: string }; cor2?: string }> = ({
  x,
  y,
  ang,
  dobra,
  l1,
  l2,
  w1,
  w2,
  cor,
  g,
  ponta,
  manga,
  cor2,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${ang})`}>
    <Bloco x={-w1 / 2} y={-w1 / 3} w={w1} h={l1 + w1 / 2} r={w1 / 2.6} cor={cor} g={g} />
    {manga && <Bloco x={-w1 / 2 - 4} y={-w1 / 3 - 4} w={w1 + 8} h={manga.l} r={w1 / 2.4} cor={manga.cor} g={g} />}
    <g transform={`translate(0 ${l1}) rotate(${dobra})`}>
      <Bloco x={-w2 / 2} y={-w2 / 3} w={w2} h={l2 + w2 / 2} r={w2 / 2.6} cor={cor2 ?? cor} g={g} />
      <g transform={`translate(0 ${l2})`}>{ponta}</g>
    </g>
  </g>
);

const Rosto: React.FC<{ olhos: Olhos; boca: Boca; piscar?: boolean; raio: number; ardendo: number; sombra: string; cabelo: string; bigode?: string; olhar: number; sobe: number; roxo: number }> = ({ olhos, boca, piscar, raio, ardendo, sombra, cabelo, bigode, olhar, sobe, roxo }) => {
  const fechado = olhos === "fechado" || piscar;
  const ry = olhos === "espanto" ? 20 : 16;
  const rx = olhos === "espanto" ? 17 : 14;
  const py = olhos === "cima" ? -6 : 1;
  const px = olhar * 4;
  return (
    <g>
      {[-25, 25].map((ex) => (
        <g key={ex}>
          {ex > 0 && roxo > 0 && <ellipse cx={ex + 1} cy={2} rx={25} ry={27} fill="#6B3A5E" opacity={0.8 * roxo} />}
          {fechado ? (
            <path d={`M ${ex - 13} 0 Q ${ex} 8 ${ex + 13} 0`} stroke={COR.tinta} strokeWidth={4.5} fill="none" strokeLinecap="round" />
          ) : (
            <>
              <ellipse cx={ex} cy={0} rx={rx} ry={ry} fill={ardendo > 0 ? "#FFD9D2" : "#fff"} />
              {ardendo > 0 && <ellipse cx={ex} cy={0} rx={rx} ry={ry} fill="#FF4B4B" opacity={0.35 * ardendo} />}
              {raio > 0 ? (
                <>
                  <circle cx={ex} cy={py} r={26 * raio} fill={COR.aurora} opacity={0.4} style={{ filter: "blur(6px)" }} />
                  <circle cx={ex + px} cy={py} r={8.5} fill={COR.aurora} />
                  <circle cx={ex + px} cy={py} r={3.4} fill="#EFFFF8" />
                </>
              ) : (
                <circle cx={ex + px} cy={py} r={6.5} fill={COR.tinta} />
              )}
            </>
          )}
          {ex > 0 && roxo > 0 && !fechado && <path d={`M ${ex - rx - 2} ${-ry - 2} L ${ex + rx + 2} ${-ry - 2} L ${ex + rx + 2} ${-ry * 0.1} Q ${ex} ${ry * 0.45} ${ex - rx - 2} ${-ry * 0.1} Z`} fill="#7A4A62" opacity={roxo} />}
          {ardendo > 0 && <path d={`M ${ex} 18 q -6 18 0 28 q 6 -10 0 -28 Z`} fill="#8CD3FF" opacity={0.9 * ardendo} />}
          <path
            d={olhos === "espanto" ? `M ${ex - 14} ${-ry - 10 - sobe} Q ${ex} ${-ry - 18 - sobe} ${ex + 14} ${-ry - 10 - sobe}` : `M ${ex - 15} ${-ry - 6 - sobe} Q ${ex} ${ardendo > 0 ? -ry - 2 : -ry - 12 - sobe} ${ex + 15} ${-ry - 6 - sobe}`}
            stroke={cabelo}
            strokeWidth={6}
            fill="none"
            strokeLinecap="round"
          />
        </g>
      ))}
      <ellipse cx={olhar * 4} cy={20} rx={9} ry={7} fill={sombra} />
      {bigode && <path d="M -30 34 Q -15 24 0 31 Q 15 24 30 34 Q 15 36 0 38 Q -15 36 -30 34 Z" fill={bigode} />}
      <g transform="translate(0 44)">
        {boca === "neutra" && <path d="M -10 0 Q 0 -2 10 0" stroke={COR.tinta} strokeWidth={4.5} fill="none" strokeLinecap="round" />}
        {boca === "sorriso" && <path d="M -15 -3 Q 0 11 15 -3" stroke={COR.tinta} strokeWidth={4.5} fill="none" strokeLinecap="round" />}
        {boca === "o" && <ellipse cx={0} cy={3} rx={8} ry={10} fill={COR.tinta} />}
        {boca === "aberta" && (
          <g>
            <path d="M -17 -3 Q 0 -5 17 -3 Q 14 20 0 22 Q -14 20 -17 -3 Z" fill={COR.tinta} />
            <ellipse cx={0} cy={15} rx={8} ry={4} fill="#E46A6A" />
          </g>
        )}
        {boca === "dentes" && (
          <g>
            <rect x={-17} y={-5} width={34} height={14} rx={5} fill="#fff" />
            <path d="M -17 2 L 17 2" stroke={COR.tinta} strokeWidth={2} />
          </g>
        )}
      </g>
    </g>
  );
};

export type PropsCorpo = {
  x: number;
  y: number;
  escala?: number;
  pose?: Pose;
  olhos?: Olhos;
  boca?: Boca; // boca quando está calado (com `t` e `fala`, ela mexe sozinha nas palavras)
  piscar?: boolean;
  raio?: number;
  ardendo?: number;
  cores: Cores;
  cabelo?: CabeloTipo;
  bigode?: string;
  capacete?: boolean;
  quepe?: boolean;
  celular?: boolean;
  mochila?: boolean;
  manga?: number;
  faixas?: boolean;
  extra?: React.ReactNode;
  rot?: number;
  sombra?: boolean;
  t?: number;
  fala?: Janela[];
  anda?: number; // passadas por segundo (até 2 anda; de 2,2 pra cima corre)
  dir?: 1 | -1; // pra que lado o corpo está virado
  olha?: number; // -1 a 1: vira o rosto (jeito 3/4)
  estica?: number; // 1 = normal; maior estica, menor achata (susto, pouso)
  vivo?: boolean;
  semente?: string;
  gesto?: boolean; // false: fala sem mexer os braços (quando a cena já decide a pose)
  olhoRoxo?: number; // 0–1: o olho que levou a bolsada, inchado e roxo
  naMao?: React.ReactNode; // o que ele segura na mão direita
  mangaLonga?: boolean; // terno: o antebraço também é da cor da roupa
  chapeu?: React.ReactNode; // desenhado por cima da cabeça (capacete de obra etc.)
};

export const Corpo: React.FC<PropsCorpo> = ({
  x,
  y,
  escala = 1,
  pose = {},
  olhos = "normal",
  boca = "neutra",
  piscar,
  raio = 0,
  ardendo = 0,
  cores,
  cabelo = "curto",
  bigode,
  capacete,
  quepe,
  celular,
  mochila,
  manga = 110,
  faixas,
  extra,
  rot = 0,
  sombra = true,
  t,
  fala,
  anda = 0,
  dir = 1,
  olha = 0,
  estica = 1,
  vivo = true,
  semente,
  gesto = true,
  olhoRoxo = 0,
  naMao,
  mangaLonga,
  chapeu,
}) => {
  const tg = useCurrentFrame() / 30;
  const volume = useContext(VolumeCtx);
  const sem = hash(semente ?? cores.camisa + cabelo);
  const v = vivo ? 1 : 0;
  const e = t !== undefined && gesto ? envFala(t, fala) : 0;
  const bocaAgora = t !== undefined && fala ? bocaDe(t, fala, boca) : boca;

  // caminhada e corrida
  const corre = anda >= 2.2;
  const fase = tg * anda * Math.PI * 2 + sem;
  const s = anda ? Math.sin(fase) : 0;
  const ampPerna = anda ? (corre ? 38 : 20) : 0;
  const ampBraco = anda ? (corre ? 30 : 13) : 0;
  const { bracoE = 6, bracoD = 6, antebracoE = 0, antebracoD = 0, pernaE = 0, pernaD = 0, joelhoE, joelhoD, cabeca = 0, tronco = 0 } = pose;
  const pE = pernaE + ampPerna * s;
  const pD = pernaD - ampPerna * s;
  const jE = joelhoE ?? Math.max(0, pE) * (corre ? 1.7 : 1.1);
  const jD = joelhoD ?? Math.max(0, pD) * (corre ? 1.7 : 1.1);
  // o pé de apoio fica no chão: abaixa o corpo conforme a perna abre
  const baixa = anda ? 325 * (1 - Math.cos(rad(Math.max(Math.abs(pE), Math.abs(pD))))) - (corre ? Math.abs(Math.cos(fase)) * 34 : Math.abs(Math.cos(fase)) * 6) : 0;

  // o corpo de cima nunca para
  const bob = v * 1.7 * Math.sin(tg * 1.7 + sem);
  const balanco = v * 1.5 * Math.sin(tg * 0.6 + sem);
  const tr = tronco + v * 0.5 * Math.sin(tg * 0.9 + sem) + e * 0.6 * Math.sin(tg * 1.7 + sem) + (corre ? 8 : anda ? 2 : 0);
  const cab = cabeca + v * 1.3 * Math.sin(tg * 0.7 + sem * 2) + e * 2.4 * Math.sin(tg * 3.1 + sem) - tr * 0.4;
  const bE = bracoE + v * 1 * Math.sin(tg * 1.1 + sem) - ampBraco * s;
  const bD = bracoD + v * 1 * Math.sin(tg * 0.9 + sem + 1) + e * (9 + 5 * Math.sin(tg * 1.9 + sem + 2)) - ampBraco * s;
  // antebraço negativo dobra pra dentro/pra frente
  const aE = antebracoE - (corre ? 70 : anda ? 12 : 0);
  const aD = antebracoD - e * (28 + 12 * Math.sin(tg * 2.3 + sem + 1)) - (corre ? 70 : anda ? 12 : 0);

  // olhar e piscada sozinhos
  const olhaAgora = olha + (anda ? 0.6 : 0) + v * 0.1 * Math.sin(tg * 0.5 + sem * 3);
  const periodo = 2.5 + (sem % 1.7);
  const piscaSo = v > 0 && (tg + sem * 3) % periodo < 0.1;
  const dx = olhaAgora * 15;

  const id = `g${(_n = (_n + 1) % 1000)}`;
  const gp = `${id}p`;
  const gc = `${id}c`;
  const gj = `${id}j`;
  const mao = <circle cx={0} cy={6} r={20} fill={cores.pele} />;
  const maoD = naMao ? (
    <g>
      {naMao}
      {mao}
    </g>
  ) : celular ? (
    <g>
      <rect x={-22} y={-26} width={44} height={78} rx={9} fill="#1d1d22" />
      <rect x={-18} y={-21} width={36} height={66} rx={5} fill="#7FB3E8" />
      {mao}
    </g>
  ) : (
    mao
  );
  const tenis = (
    <g>
      <ellipse cx={10} cy={8} rx={36} ry={15} fill={cores.tenis} />
      <ellipse cx={10} cy={14} rx={36} ry={7} fill="#E8E8E4" />
    </g>
  );
  const baixaEsc = baixa * escala;
  return (
    <g transform={`translate(${x} ${y})`}>
      {sombra && (
        <>
          {volume && (
            <g>
              <defs>
                <linearGradient id={`${id}s`} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#000" stopOpacity={0.42} />
                  <stop offset="1" stopColor="#000" stopOpacity={0} />
                </linearGradient>
              </defs>
              <polygon points={`${-70 * escala},2 ${70 * escala},-6 ${520 * escala},${-58 * escala} ${430 * escala},${-92 * escala}`} fill={`url(#${id}s)`} />
            </g>
          )}
          <ellipse cx={14 * escala} cy={6} rx={120 * escala} ry={17 * escala} fill="rgba(0,0,0,0.28)" />
          <ellipse cx={0} cy={4} rx={72 * escala} ry={11 * escala} fill="rgba(0,0,0,0.25)" />
        </>
      )}
      <g transform={`translate(0 ${baixaEsc}) scale(${dir * escala * (2 - estica)} ${escala * estica}) rotate(${rot})`}>
        <defs>
          {volume ? <GradVolume id={gp} /> : <Grad id={gp} />}
          {volume ? <GradVolume id={gc} /> : <Grad id={gc} />}
          {volume ? <GradVolume id={gj} /> : <Grad id={gj} claro={0.14} escuro={0.3} />}
          {volume && (
            <radialGradient id={`${id}h`} cx="0.38" cy="0.3" r="0.85">
              <stop offset="0" stopColor="#fff" stopOpacity={0.3} />
              <stop offset="0.5" stopColor="#fff" stopOpacity={0} />
              <stop offset="1" stopColor="#000" stopOpacity={0.5} />
            </radialGradient>
          )}
        </defs>
        <Membro2 x={-34} y={-340} ang={pE} dobra={jE} l1={160} l2={165} w1={64} w2={56} cor={cores.calca} g={gj} ponta={tenis} />
        <Membro2 x={34} y={-340} ang={pD} dobra={jD} l1={160} l2={165} w1={64} w2={56} cor={cores.calca} g={gj} ponta={tenis} />
        <g transform={`translate(${balanco} ${bob}) rotate(${tr} 0 -340)`}>
          {mochila && (
            <g>
              <rect x={-150} y={-610} width={96} height={190} rx={12} fill="#1FA6A0" />
              <rect x={-150} y={-610} width={96} height={38} rx={12} fill="#188884" />
              <rect x={-132} y={-520} width={60} height={12} rx={5} fill="#E8FFFD" opacity={0.6} />
            </g>
          )}
          <Membro2 x={-92} y={-585} ang={bE} dobra={aE} l1={125} l2={125} w1={46} w2={40} cor={cores.pele} g={gp} ponta={mao} manga={manga ? { l: manga, cor: cores.camisa } : undefined} cor2={mangaLonga ? cores.camisa : undefined} />
          <Bloco x={-84} y={-605} w={168} h={280} r={22} cor={cores.camisa} g={gc} />
          <rect x={-84} y={-362} width={168} height={22} fill={cores.calca} />
          <rect x={-84} y={-362} width={168} height={22} fill="rgba(0,0,0,0.18)" />
          <circle cx={0} cy={-351} r={7} fill="#D9C27A" />
          {faixas && (
            <>
              <rect x={-84} y={-470} width={168} height={15} fill="#E8F26B" opacity={0.9} />
              <rect x={-84} y={-430} width={168} height={11} fill="#E8F26B" opacity={0.9} />
            </>
          )}
          <path d="M -30 -603 L 0 -572 L 30 -603" stroke={cores.camisaEscura} strokeWidth={9} fill="none" strokeLinecap="round" />
          {extra}
          <Membro2 x={92} y={-585} ang={-bD} dobra={-aD} l1={125} l2={125} w1={46} w2={40} cor={cores.pele} g={gp} ponta={maoD} manga={manga ? { l: manga, cor: cores.camisa } : undefined} cor2={mangaLonga ? cores.camisa : undefined} />
          <g transform={`rotate(${cab} 0 -612)`}>
            <rect x={-21} y={-628} width={42} height={40} fill={cores.peleSombra} />
            {volume && <ellipse cx={0} cy={-596} rx={46} ry={13} fill="#000" opacity={0.32} />}
            <circle cx={-60} cy={-664} r={13} fill={cores.pele} />
            <circle cx={60} cy={-664} r={13} fill={cores.pele} />
            <ellipse cx={0} cy={-CABECA_Y} rx={59} ry={65} fill={cores.pele} />
            <ellipse cx={0} cy={-CABECA_Y} rx={59} ry={65} fill={volume ? `url(#${id}h)` : `url(#${gp})`} />
            {cabelo === "curto" && (
              <g>
                {corre &&
                  [0, 1, 2].map((i) => (
                    <path key={i} d={`M -40 ${-722 + i * 18} L ${-96 - i * 10 + Math.sin(tg * 24 + i) * 7} ${-740 + i * 22 + Math.sin(tg * 30 + i) * 7} L -44 ${-704 + i * 18} Z`} fill={cores.cabelo} />
                  ))}
                <path d="M -62 -672 Q -66 -742 0 -744 Q 66 -742 62 -672 Q 40 -712 0 -708 Q -40 -712 -62 -672 Z" fill={cores.cabelo} />
                {volume && <path d="M -62 -672 Q -66 -742 0 -744 Q 66 -742 62 -672 Q 40 -712 0 -708 Q -40 -712 -62 -672 Z" fill={`url(#${id}h)`} />}
              </g>
            )}
            {cabelo === "grisalho" && (
              <>
                <path d="M -60 -680 Q -64 -730 -42 -742 Q -52 -706 -48 -660 L -58 -660 Z" fill={cores.cabelo} />
                <path d="M 60 -680 Q 64 -730 42 -742 Q 52 -706 48 -660 L 58 -660 Z" fill={cores.cabelo} />
              </>
            )}
            {cabelo === "longo" && <path d="M -64 -660 Q -72 -750 0 -750 Q 72 -750 64 -660 L 70 -560 L 48 -560 Q 50 -700 0 -712 Q -50 -700 -48 -560 L -70 -560 Z" fill={cores.cabelo} />}
            <g transform={`translate(${dx} ${-CABECA_Y + 3})`}>
              <Rosto olhos={olhos} boca={bocaAgora} piscar={piscar || piscaSo} raio={raio} ardendo={ardendo} sombra={cores.peleSombra} cabelo={cores.cabelo} bigode={bigode} olhar={olhaAgora} sobe={e * 3 * Math.max(0, Math.sin(tg * 3.3 + sem))} roxo={olhoRoxo} />
            </g>
            {cabelo === "bone" && (
              <g transform="translate(0 -32)">
                <path d="M -64 -690 Q -62 -752 0 -754 Q 62 -752 64 -690 Z" fill={cores.cabelo} />
                <path d="M -64 -690 Q 10 -668 100 -700 Q 104 -688 66 -676 Q 0 -652 -64 -672 Z" fill="rgba(0,0,0,0.3)" />
              </g>
            )}
            {cabelo === "touca" && (
              <g>
                <rect x={-52} y={-790} width={104} height={60} rx={26} fill="#fff" />
                <rect x={-66} y={-748} width={132} height={24} rx={8} fill="#fff" />
              </g>
            )}
            {quepe && (
              <g>
                <path d="M -64 -690 Q -62 -760 0 -764 Q 62 -760 64 -690 Z" fill="#26324F" />
                <rect x={-68} y={-702} width={136} height={16} rx={5} fill="#1A1A1E" />
                <path d="M -62 -688 Q 0 -664 62 -688 L 70 -678 Q 0 -648 -70 -678 Z" fill="#14141A" />
                <circle cx={0} cy={-728} r={9} fill={COR.amarelo} />
              </g>
            )}
            {chapeu}
            {capacete && (
              <g>
                <path d="M -72 -668 Q -78 -770 0 -772 Q 78 -770 72 -668 L 72 -646 L -72 -646 Z" fill="#1B1B22" />
                <rect x={-68} y={-704} width={136} height={56} rx={22} fill={raio > 0 ? "rgba(60,240,160,0.3)" : "rgba(170,205,230,0.25)"} />
                <path d="M -48 -690 L -18 -690" stroke="rgba(255,255,255,0.4)" strokeWidth={6} strokeLinecap="round" />
              </g>
            )}
          </g>
        </g>
      </g>
    </g>
  );
};

// ---------- personagens prontos ----------
type SemCores = Omit<PropsCorpo, "cores" | "cabelo" | "manga" | "faixas" | "bigode" | "extra" | "naMao">;
const KC: Cores = { pele: "#9A6240", peleSombra: "#7C4C31", camisa: "#4B3A7A", camisaEscura: "#3A2C62", calca: "#34507A", tenis: "#C8322B", cabelo: "#17120F" };
export const Kaique: React.FC<SemCores> = (p) => <Corpo {...p} cores={KC} cabelo="curto" manga={140} faixas />;

const EC: Cores = { pele: "#C58A62", peleSombra: "#A9704B", camisa: "#9CC3E4", camisaEscura: "#7FA9CF", calca: "#26324F", tenis: "#1E1E22", cabelo: "#D9D6D0" };
export const SeuEdson: React.FC<SemCores> = (p) => <Corpo {...p} cores={EC} cabelo="grisalho" bigode="#D9D6D0" manga={90} extra={<rect x={34} y={-560} width={42} height={52} rx={5} fill="#F4F4F0" />} />;

const ZC: Cores = { pele: "#D9A27A", peleSombra: "#B9825C", camisa: "#F4F4F0", camisaEscura: "#CFCFC8", calca: "#3A4A6A", tenis: "#26262C", cabelo: "#4A3A30" };
export const SeuZe: React.FC<SemCores> = (p) => <Corpo {...p} cores={ZC} cabelo="touca" bigode="#4A3A30" manga={90} />;

const OC: Cores = { pele: "#C89A72", peleSombra: "#A97D58", camisa: "#2E6B4F", camisaEscura: "#245A41", calca: "#3B3F4A", tenis: "#1E1E22", cabelo: "#2E6B4F" };
export const OlheiroBloco: React.FC<Omit<SemCores, "raio"> & { olhosVerdes?: number; apito?: number }> = ({ olhosVerdes = 0, apito = 0, pose, ...p }) => (
  <Corpo
    {...p}
    cores={OC}
    cabelo="bone"
    bigode="#DDD"
    raio={olhosVerdes}
    manga={100}
    pose={pose ?? { bracoD: 34, antebracoD: -108 }}
    naMao={
      <g transform="rotate(-74)">
        <rect x={-58} y={-86} width={116} height={150} rx={8} fill="#8B6A43" />
        <rect x={-48} y={-72} width={96} height={126} rx={4} fill="#F4F1EA" />
        <rect x={-22} y={-94} width={44} height={16} rx={5} fill="#9AA0A8" />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={-38} y={-54 + i * 26} width={76} height={6} rx={3} fill="#9AA" />
        ))}
      </g>
    }
    extra={
      <g>
        <rect x={-70} y={-372} width={140} height={34} rx={12} fill="#1F1F24" />
        <rect x={-26} y={-390} width={52} height={46} rx={10} fill="#26262C" />
        <path d="M -34 -603 Q 0 -500 34 -603" stroke="#E8E8E8" strokeWidth={4} fill="none" />
        <g transform={`rotate(${apito} 0 -560)`}>
          <rect x={-8} y={-528} width={22} height={12} rx={4} fill="#C9C9C9" />
        </g>
      </g>
    }
  />
);
