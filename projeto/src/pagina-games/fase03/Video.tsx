import { loadFont } from "@remotion/google-fonts/Montserrat";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { Acabamento, PalcoCinema } from "../../cinema/Palco";
import { Camera } from "../Estudio";
import { Mascote3D, PoseMascote } from "../Mascote3D";
import { SetupGamer } from "../SetupGamer";
import dados from "./dados.json";

// Fase Extra, Fase 03 (v2): "O mapa do GTA 6 tem um aviso que ninguém leu" (~1:57).
// Abre no mapa feito por fãs (comparação GTA 5 x GTA 6 + uma seta por região), depois o passeio pelas 6 regiões
// com as capturas oficiais da Rockstar e o mesmo mapa em miniatura no canto. Vyce na facecam só nos momentos-chave.
const { fontFamily } = loadFont("normal", { weights: ["600", "800", "900"], subsets: ["latin"] });
export const FPS = 30;
const FIM = dados.duracao + 1.0;
export const DURACAO_FASE03 = Math.ceil(FIM * FPS);
const ROXO = "#B66BFF";
const ROSA = "#FF4FD8";
const DIAS = 4; // postagem em 15/11
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const suave = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
const entra = (t: number, a: number, d = 0.3) => interpolate(t, [a, a + d], [0, 1], { ...cl, easing: Easing.out(Easing.back(1.7)) });
const sombra = "0 0 26px rgba(182,107,255,.85), 0 5px 0 #2B0F66, 0 0 8px rgba(0,0,0,.9)";

const FIM_MAPA = 28.9; // "Começa nas Keys"
const INICIO_FINAL = 111.9; // "Você está na Fase Extra"
const emSetup = (t: number) => t >= INICIO_FINAL;

// ---------- mapa dos fãs (imagem 725x908; coordenadas das regiões nessa imagem, aproximadas) ----------
const MAPA = "fase-extra/mapa-fas/mapa-fas.jpg";
const MW = 725;
const MH = 908;
const REGIOES = [
  { nome: "LEONIDA KEYS", seta: 11.25, tour: 28.91, x: 350, y: 825 },
  { nome: "VICE CITY", seta: 12.8, tour: 45.45, x: 600, y: 475 },
  { nome: "GRASSRIVERS", seta: 14.18, tour: 58.85, x: 450, y: 625 },
  { nome: "AMBROSIA", seta: 16.18, tour: 67.65, x: 360, y: 310 },
  { nome: "MONTE KALAGA", seta: 17.56, tour: 72.93, x: 250, y: 110 },
  { nome: "PORT GELLHORN", seta: 19.22, tour: 87.49, x: 180, y: 190 },
];
const SAI_MAPA = 21.6; // "seis regiões...": o mapa sai e entra a rajada de capturas

// câmera sobre o mapa em tela cheia: (cx, cy) no mapa, z = zoom (1 = mapa com a altura da tela)
const S0 = 1920 / MH;
const CENTRO_Y = 880; // o alvo fica um pouco acima do meio, longe da legenda
type Cam = [number, number, number, number]; // t, cx, cy, z
const CAM: Cam[] = [
  [0.0, 600, 470, 2.4], // colado nas luzes de Vice City...
  [1.5, 362, 454, 0.74], // ...e puxa até o mapa inteiro
  [2.9, 362, 454, 0.8],
  [3.45, 150, 590, 1.45], // mergulho na ilha do GTA 5
  [4.55, 150, 600, 1.55],
  [5.05, 430, 420, 0.95], // chicote até o GTA 6
  [5.8, 362, 454, 0.74],
  [9.6, 362, 470, 0.86],
  [10.4, 362, 600, 1.25], // "bora conhecer"
  ...REGIOES.flatMap((r, i): Cam[] => {
    const prox = REGIOES[i + 1]?.seta ?? 20.9;
    return [
      [r.seta - 0.3, r.x, r.y, 2.0],
      [prox - 0.8, r.x, r.y - 6, 2.25],
    ];
  }),
  [21.15, 362, 454, 0.74],
];
const camEm = (t: number): [number, number, number] => {
  let i = 0;
  while (i + 1 < CAM.length && CAM[i + 1][0] <= t) i++;
  const a = CAM[i];
  const b = CAM[i + 1] ?? a;
  const k = b === a ? 0 : interpolate(t, [a[0], b[0]], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
  // zoom interpolado em escala logarítmica (voo mais natural)
  return [a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k, Math.exp(Math.log(a[3]) + (Math.log(b[3]) - Math.log(a[3])) * k)];
};
const naTela = (t: number, x: number, y: number) => {
  const [cx, cy, z] = camEm(t);
  return [540 + (x - cx) * S0 * z, CENTRO_Y + (y - cy) * S0 * z] as const;
};

const Pino: React.FC<{ t: number; r: (typeof REGIOES)[number]; atual: boolean }> = ({ t, r, atual }) => {
  const k = suave(t, r.seta - 0.2, r.seta + 0.15);
  if (k <= 0) return null;
  const [x, y] = naTela(t, r.x, r.y);
  const cor = atual ? ROSA : "#E2B8FF";
  if (!atual) {
    return <div style={{ position: "absolute", left: x - 10, top: y - 10, width: 20, height: 20, borderRadius: 10, background: cor, border: "3px solid #fff", boxShadow: `0 0 14px ${cor}` }} />;
  }
  // seta caindo de cima até o ponto + etiqueta
  const queda = interpolate(k, [0, 1], [-260, 0]);
  const pulso = entra(t, r.seta + 0.3, 0.4);
  return (
    <>
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        <circle cx={x} cy={y} r={20 + 70 * pulso} fill="none" stroke={ROSA} strokeWidth={6} opacity={1 - pulso} />
        <circle cx={x} cy={y} r={14 + 3 * Math.sin(t * 9)} fill={ROSA} stroke="#fff" strokeWidth={4} />
        <g transform={`translate(${x},${y - 34 + queda})`}>
          <rect x={-9} y={-170} width={18} height={130} rx={9} fill="#fff" stroke="#000" strokeWidth={4} />
          <polygon points="0,0 -40,-52 40,-52" fill="#fff" stroke="#000" strokeWidth={4} strokeLinejoin="round" />
        </g>
      </svg>
      <div style={{ position: "absolute", left: x, top: y - 260 + queda, transform: `translate(-50%,-50%) scale(${entra(t, r.seta - 0.1, 0.3)})`, fontFamily, fontWeight: 900, fontSize: 64, color: "#fff", background: ROSA, border: "4px solid #fff", borderRadius: 18, padding: "6px 24px", whiteSpace: "nowrap", boxShadow: `0 0 30px ${ROSA}, 0 8px 0 #2B0F66` }}>
        {r.nome}
      </div>
    </>
  );
};

const CenaMapa: React.FC<{ t: number }> = ({ t }) => {
  if (t > SAI_MAPA + 0.2) return null;
  const [cx, cy, z] = camEm(t);
  const [cx2, cy2, z2] = camEm(t + 1 / FPS);
  const vel = Math.hypot((cx2 - cx) * S0 * z, (cy2 - cy) * S0 * z) + Math.abs(Math.log(z2 / z)) * 900;
  const borrao = Math.min(14, vel * 0.09);
  const W = MW * S0 * z;
  const H = MH * S0 * z;
  const left = 540 - cx * S0 * z;
  const top = CENTRO_Y - cy * S0 * z;
  // saída: soco de zoom + clarão (o corte para as capturas)
  const sai = suave(t, SAI_MAPA - 0.25, SAI_MAPA);
  let atual = -1;
  REGIOES.forEach((r, i) => {
    if (t >= r.seta) atual = i;
  });
  if (t >= 20.9) atual = -1;
  const comp5 = suave(t, 3.2, 3.5) * (1 - suave(t, 9.6, 10.0));
  const comp6 = suave(t, 4.9, 5.2) * (1 - suave(t, 9.6, 10.0));
  const P = (x: number, y: number) => `${left + x * S0 * z} ${top + y * S0 * z}`;
  const balanco = 1 + 0.012 * Math.sin(t * 2.1);
  return (
    <AbsoluteFill style={{ background: "#071026", overflow: "hidden", transform: `scale(${(1 + 0.6 * sai) * balanco})`, opacity: 1 - sai * 0.6 }}>
      <Img src={staticFile(MAPA)} style={{ position: "absolute", width: 1080 * 2.2, height: (1080 * 2.2 * MH) / MW, left: -1080 * 0.6 - (cx - 362) * 0.4, top: -900 - (cy - 454) * 0.4, filter: "blur(36px) brightness(.5)" }} />
      <Img src={staticFile(MAPA)} style={{ position: "absolute", left, top, width: W, height: H, filter: `blur(${borrao}px) saturate(1.15)` }} />
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        {comp5 > 0 && <ellipse cx={left + 150 * S0 * z} cy={top + 590 * S0 * z} rx={125 * S0 * z} ry={205 * S0 * z} fill="none" stroke="#7CFFB2" strokeWidth={8} strokeDasharray="22 14" opacity={comp5} strokeDashoffset={-t * 60} />}
        {comp6 > 0 && <path d={`M ${P(300, 110)} Q ${P(700, 40)} ${P(720, 420)} Q ${P(730, 820)} ${P(500, 880)} Q ${P(280, 760)} ${P(330, 440)} Q ${P(150, 260)} ${P(300, 110)} Z`} fill="none" stroke={ROSA} strokeWidth={8} strokeDasharray="22 14" opacity={comp6} strokeDashoffset={t * 60} />}
      </svg>
      {comp5 > 0 && (
        <div style={{ position: "absolute", left: left + 150 * S0 * z, top: top + 330 * S0 * z, transform: `translate(-50%,-50%) scale(${entra(t, 3.3) * (t < 5.0 ? 1.4 : 1)})`, opacity: comp5, fontFamily, fontWeight: 900, fontSize: 60, color: "#111", background: "#7CFFB2", borderRadius: 16, padding: "4px 22px", whiteSpace: "nowrap", boxShadow: "0 8px 0 #0b3a22" }}>GTA 5</div>
      )}
      {comp6 > 0 && (
        <div style={{ position: "absolute", left: left + 560 * S0 * z, top: top + 120 * S0 * z, transform: `translate(-50%,-50%) scale(${entra(t, 5.0) * 1.2})`, opacity: comp6, fontFamily, fontWeight: 900, fontSize: 60, color: "#fff", background: ROSA, borderRadius: 16, padding: "4px 22px", whiteSpace: "nowrap", boxShadow: "0 8px 0 #2B0F66" }}>GTA 6</div>
      )}
      {REGIOES.map((r, i) => (
        <Pino key={i} t={t} r={r} atual={i === atual} />
      ))}
      <div style={{ position: "absolute", left: 60, top: 250, fontFamily, fontWeight: 800, fontSize: 24, letterSpacing: 2, color: "#111", background: "#FFD84A", borderRadius: 8, padding: "4px 12px", opacity: entra(t, 0.3) }}>
        MAPA FEITO POR FÃS · NÃO OFICIAL
      </div>
      <AbsoluteFill style={{ background: "#fff", opacity: 0.85 * suave(t, SAI_MAPA - 0.12, SAI_MAPA) }} />
    </AbsoluteFill>
  );
};

// ---------- planos do passeio: captura oficial (img) ou trailer (tr, segundos conferidos na Fase 02) ----------
const C = (pasta: string, nome: string) => `fase-extra/rockstar/capturas/Places/${pasta}/${nome}.jpg`;
const PE = (pasta: string, nome: string) => `fase-extra/rockstar/capturas/People/${pasta}/${nome}.jpg`;
type Plano = { de: number; img?: string; tr?: number; x?: number; x2?: number; zoom?: number; lento?: number };
const PLANOS: Plano[] = [
  // rajada: "seis regiões, e a Rockstar avisa pra tomar cuidado em quase todas"
  { de: 21.6, img: C("Leonida Keys", "Leonida_Keys_01"), x: 0.55, x2: 0.45, zoom: 1.15 },
  { de: 22.15, img: C("Grassrivers", "Grassrivers_04"), x: 0.45, x2: 0.55, zoom: 1.15 },
  { de: 22.7, img: C("Ambrosia", "Ambrosia_01"), x: 0.4, x2: 0.5, zoom: 1.15 },
  { de: 23.25, img: C("Mount Kalaga National Park", "Mount_Kalaga_National_Park_02"), x: 0.45, x2: 0.55, zoom: 1.15 },
  { de: 23.8, img: C("Port Gellhorn", "Port_Gellhorn_06"), x: 0.5, x2: 0.4, zoom: 1.15 },
  { de: 24.35, img: C("Vice City", "Vice_City_10"), x: 0.4, x2: 0.55, zoom: 1.15 },
  { de: 24.85, img: C("Vice City", "Vice_City_11"), x: 0.3, x2: 0.45, zoom: 1.15 }, // "um aviso que quase ninguém leu"
  // 1/6 Keys
  { de: 28.85, img: C("Leonida Keys", "Leonida_Keys_01"), x: 0.35, x2: 0.6 },
  { de: 32.15, img: PE("Brian Heder", "Brian_Heder_01"), x: 0.42, x2: 0.36 }, // "casa do Brian"
  { de: 32.8, img: PE("Brian Heder", "Brian_Heder_03"), x: 0.55, x2: 0.62 }, // "traficante das antigas"
  { de: 35.9, img: C("Leonida Keys", "Leonida_Keys_05"), x: 0.4, x2: 0.55 }, // "a vida lá é simples"
  { de: 38.0, img: C("Leonida Keys", "Leonida_Keys_03"), x: 0.45, x2: 0.55 }, // "bar de praia"
  { de: 38.95, img: C("Leonida Keys", "Leonida_Keys_02"), x: 0.3, x2: 0.4, zoom: 1.15 }, // iguana
  { de: 40.4, img: C("Leonida Keys", "Leonida_Keys_04"), x: 0.5, x2: 0.35 }, // "essas águas"
  { de: 42.8, img: C("Leonida Keys", "Leonida_Keys_07"), x: 0.4, x2: 0.55, zoom: 1.2 }, // "as mais perigosas"
  // 2/6 Vice City
  { de: 45.4, tr: 2.6, x: 0.45 }, // estrada da orla ("estrada sobre o mar")
  { de: 47.0, img: C("Vice City", "Vice_City_10"), x: 0.55, x2: 0.45 },
  { de: 48.0, img: C("Vice City", "Vice_City_05"), x: 0.5, x2: 0.4 }, // "art déco"
  { de: 48.75, img: C("Vice City", "Vice_City_09"), x: 0.35, x2: 0.5 }, // "padaria cubana"
  { de: 49.8, img: C("Vice City", "Vice_City_06"), x: 0.45, x2: 0.55 }, // "marca falsificada"
  { de: 51.45, img: C("Vice City", "Vice_City_08"), x: 0.5, x2: 0.62 }, // "porto de cruzeiro"
  { de: 53.35, img: PE("Boobie Ike", "Boobie_Ike_01"), x: 0.42, x2: 0.5 }, // Boobie Ike
  { de: 56.3, img: PE("Boobie Ike", "Boobie_Ike_02"), x: 0.38, x2: 0.48 }, // "boate"
  { de: 57.7, img: PE("Boobie Ike", "Boobie_Ike_03"), x: 0.4, x2: 0.5, zoom: 1.1 }, // "estúdio de gravação"
  // 3/6 Grassrivers
  { de: 58.8, img: C("Grassrivers", "Grassrivers_05"), x: 0.6, x2: 0.4 },
  { de: 61.0, img: C("Grassrivers", "Grassrivers_03"), x: 0.4, x2: 0.5, zoom: 1.15 }, // aerobarco e jacarés
  { de: 63.0, img: C("Grassrivers", "Grassrivers_08"), x: 0.5, x2: 0.4, zoom: 1.2 }, // "nem é o mais perigoso"
  { de: 65.5, tr: 28.6, x: 0.5, lento: 0.7 }, // pântano ao pôr do sol (re-gancho)
  // 4/6 Ambrosia
  { de: 67.6, img: C("Ambrosia", "Ambrosia_02"), x: 0.5, x2: 0.62 },
  { de: 69.2, img: C("Ambrosia", "Ambrosia_04"), x: 0.4, x2: 0.55 }, // "refinaria de açúcar"
  { de: 71.0, img: C("Ambrosia", "Ambrosia_01"), x: 0.55, x2: 0.4 }, // motoqueiros
  // 5/6 Kalaga
  { de: 72.9, img: C("Mount Kalaga National Park", "Mount_Kalaga_National_Park_04"), x: 0.5, x2: 0.4 },
  { de: 74.75, img: C("Mount Kalaga National Park", "Mount_Kalaga_National_Park_02"), x: 0.45, x2: 0.55 }, // "caça"
  { de: 75.4, img: C("Mount Kalaga National Park", "Mount_Kalaga_National_Park_06"), x: 0.4, x2: 0.5 }, // "pesca"
  { de: 75.95, img: C("Mount Kalaga National Park", "Mount_Kalaga_National_Park_01"), x: 0.45, x2: 0.55 }, // "trilha"
  { de: 76.7, img: C("Mount Kalaga National Park", "Mount_Kalaga_National_Park_03"), x: 0.4, x2: 0.5, zoom: 1.1 }, // "caipiras místicos"
  { de: 80.5, img: C("Mount Kalaga National Park", "Mount_Kalaga_National_Park_05"), x: 0.6, x2: 0.45 }, // suçuarana e cervos
  { de: 85.3, img: C("Mount Kalaga National Park", "Mount_Kalaga_National_Park_05"), x: 0.3, x2: 0.22, zoom: 1.4 }, // "o caçador pode virar a caça"
  // 6/6 Port Gellhorn
  { de: 87.45, img: C("Port Gellhorn", "Port_Gellhorn_06"), x: 0.55, x2: 0.4 },
  { de: 89.1, img: C("Port Gellhorn", "Port_Gellhorn_01"), x: 0.5, x2: 0.4, zoom: 1.1 }, // motel
  { de: 91.55, img: C("Port Gellhorn", "Port_Gellhorn_05"), x: 0.45, x2: 0.55 }, // fogueira
  { de: 93.6, img: C("Port Gellhorn", "Port_Gellhorn_04"), x: 0.4, x2: 0.55 }, // "a economia de lá"
  { de: 96.6, img: C("Port Gellhorn", "Port_Gellhorn_02"), x: 0.5, x2: 0.4 },
  // payoff
  { de: 98.6, img: C("Port Gellhorn", "Port_Gellhorn_01"), x: 0.3, x2: 0.4, zoom: 1.25 },
  { de: 101.85, tr: 49.1, x: 0.5, zoom: 1.1 }, // moto saltando ("moto de trilha")
  { de: 103.3, img: C("Port Gellhorn", "Port_Gellhorn_03"), x: 0.45, x2: 0.6, zoom: 1.15 }, // "segurar a carteira"
  { de: 104.05, img: C("Port Gellhorn", "Port_Gellhorn_07"), x: 0.5, x2: 0.45 }, // "não é piada"
  { de: 105.0, img: C("Vice City", "Vice_City_07"), x: 0.5, x2: 0.4, zoom: 1.1 }, // dinheiro voando
  { de: 108.4, tr: 61.0, x: 0.55, zoom: 1.15 }, // explosão ("ele some")
  { de: 109.15, img: C("Vice City", "Vice_City_02"), x: 0.6, x2: 0.45 }, // "banco"
];
const planoEm = (t: number) => {
  let i = 0;
  while (i + 1 < PLANOS.length && PLANOS[i + 1].de <= t) i++;
  return i;
};
const fimDoPlano = (i: number) => Math.min(PLANOS[i + 1]?.de ?? FIM, INICIO_FINAL + 0.4);

const Fundo: React.FC<{ t: number }> = ({ t }) => {
  if (t < PLANOS[0].de) return null;
  const i = planoEm(t);
  const p = PLANOS[i];
  const fim = fimDoPlano(i);
  if (t > fim) return null;
  const k = interpolate(t, [p.de, fim], [0, 1], cl);
  const punch = 1 + 0.06 * (1 - suave(t, p.de, p.de + 0.25));
  const W = 3413;
  if (p.img) {
    const x = interpolate(k, [0, 1], [p.x ?? 0.5, p.x2 ?? p.x ?? 0.5]);
    const z = (p.zoom ?? 1.05) * (1 + 0.08 * k) * punch;
    return (
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <Img src={staticFile(p.img)} style={{ position: "absolute", width: W, height: 1920, left: -(W - 1080) * x, top: 0, transform: `scale(${z})`, transformOrigin: `${x * 100}% 50%` }} />
      </AbsoluteFill>
    );
  }
  const z = (p.zoom ?? 1.05) * (1 + 0.06 * k) * punch;
  const src = staticFile("fase-extra/rockstar/trailer-1920.mp4");
  const dur = Math.max(1, Math.round((fim - p.de) * FPS) + 2);
  return (
    <Sequence key={i} from={Math.round(p.de * FPS)} durationInFrames={dur} layout="none">
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <OffthreadVideo src={src} startFrom={Math.round((p.tr ?? 0) * FPS)} playbackRate={p.lento ?? 1} muted style={{ position: "absolute", width: W, height: 1920, left: -(W - 1080) * (p.x ?? 0.5), top: 0, transform: `scale(${z})`, transformOrigin: `${(p.x ?? 0.5) * 100}% 50%` }} />
      </AbsoluteFill>
    </Sequence>
  );
};

// ---------- minimapa (o mesmo mapa dos fãs, em miniatura) ----------
const FIM_TOUR = 98.6;
const MINI = 230;
const Minimapa: React.FC<{ t: number }> = ({ t }) => {
  if (t < FIM_MAPA || t > FIM_TOUR + 0.3) return null;
  const regancho = suave(t, 65.3, 65.6) * (1 - suave(t, 67.45, 67.75));
  const vis = entra(t, FIM_MAPA, 0.35) * (1 - suave(t, FIM_TOUR, FIM_TOUR + 0.3)) * (1 - regancho);
  let atual = 0;
  REGIOES.forEach((r, i) => {
    if (t >= r.tour) atual = i;
  });
  const r = REGIOES[atual];
  const s = MINI / MW;
  const pulso = entra(t, r.tour, 0.35);
  return (
    <div style={{ position: "absolute", left: 60, top: 390, width: MINI + 16, opacity: vis, transform: `scale(${0.8 + 0.2 * vis})`, transformOrigin: "0 0" }}>
      <div style={{ background: "rgba(20,10,40,.8)", border: `3px solid ${ROXO}`, borderRadius: 20, padding: 8, boxShadow: `0 0 22px ${ROXO}88` }}>
        <div style={{ position: "relative", width: MINI, height: MH * s, borderRadius: 12, overflow: "hidden" }}>
          <Img src={staticFile(MAPA)} style={{ width: MINI, height: MH * s }} />
          <svg width={MINI} height={MH * s} style={{ position: "absolute", left: 0, top: 0 }}>
            {REGIOES.map((g, i) => (
              <circle key={i} cx={g.x * s} cy={g.y * s} r={i === atual ? 0 : 4} fill={i < atual ? "#E2B8FF" : "#fff"} opacity={0.8} />
            ))}
            <circle cx={r.x * s} cy={r.y * s} r={8 + 22 * pulso} fill="none" stroke={ROSA} strokeWidth={3} opacity={1 - pulso} />
            <circle cx={r.x * s} cy={r.y * s} r={8 + 2 * Math.sin(t * 8)} fill={ROSA} stroke="#fff" strokeWidth={3} />
          </svg>
        </div>
        <div style={{ fontFamily, fontWeight: 900, fontSize: 24, letterSpacing: 2, color: "#fff", textAlign: "center", lineHeight: 1.1, marginTop: 6 }}>
          <span style={{ color: ROSA }}>{atual + 1}/6</span> {r.nome}
        </div>
      </div>
    </div>
  );
};

// ---------- Vyce: facecam ----------
const boca = (f: number) => (dados.boca as number[])[f] ?? 0;
const poseFala = (t: number, extra: Partial<PoseMascote> = {}): PoseMascote => ({
  bracoE: [0.02 - 0.15 * Math.max(0, Math.sin(t * 5.1)), 0, -0.12],
  cotoveloE: 0.4 + 0.2 * Math.sin(t * 4.3),
  bracoD: [-0.5 - 0.25 * Math.max(0, Math.sin(t * 3.7 + 1)), 0, 0.25],
  cotoveloD: 1.1 + 0.25 * Math.sin(t * 5.7),
  tronco: 0.02 * Math.sin(t * 1.9),
  cabeca: [0.04 * Math.sin(t * 3.1) + 0.03 * Math.sin(t * 7.2), 0.12 * Math.sin(t * 1.3), 0.04 * Math.sin(t * 1.1)],
  ...extra,
});
const pisca = (t: number) => {
  const c = t % 4.3;
  return c > 1.4 && c < 1.52;
};
const REACOES = [26.15, 27.9, 65.6, 99.9, 108.5]; // "um aviso", "fica até o final", "pior parte", "é esse", "ele some"
const JANELAS: [number, number][] = [
  [24.8, 28.75], // "numa delas tem um aviso... fica até o final"
  [65.4, 67.55], // "e ainda tá longe de ser a pior parte"
  [98.5, 101.0], // "o aviso que ninguém leu é esse"
  [104.95, 109.1], // "o chefe da Rockstar North disse"
];
const Facecam: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const k = JANELAS.reduce((m, [a, b]) => Math.max(m, entra(t, a, 0.3) * (1 - suave(t, b - 0.25, b))), 0);
  const reage = REACOES.reduce((m, r) => Math.max(m, 1 - Math.abs(t - r) * 1.6), 0);
  const W = 300;
  const H = 360;
  if (k <= 0.01) return null;
  return (
    <div style={{ position: "absolute", left: 1080 - W - 40, top: 250, width: W, height: H, borderRadius: 26, overflow: "hidden", border: `5px solid ${ROXO}`, boxShadow: `0 0 ${30 + 25 * Math.max(0, reage)}px ${ROXO}, 0 10px 30px rgba(0,0,0,.6)`, transform: `scale(${(0.5 + 0.5 * k) * (1 + 0.06 * Math.max(0, reage))})`, transformOrigin: "100% 0%", opacity: k, background: "#140a2a" }}>
      <ThreeCanvas width={W} height={H} camera={{ fov: 32, near: 0.05, far: 50 }} gl={{ toneMapping: THREE.ACESFilmicToneMapping, antialias: true }}>
        <Camera pos={[0.1 + 0.05 * Math.sin(t * 0.6), 1.68, 1.22]} alvo={[0, 1.57, 0]} />
        <hemisphereLight args={["#B9A2F2", "#1A1030", 0.9]} />
        <directionalLight position={[-1.2, 2.2, 2.4]} intensity={2.6} color="#F6EEFF" />
        <pointLight position={[1.2, 1.7, 0.6]} intensity={5} color={ROSA} distance={4} />
        <pointLight position={[-1.3, 1.4, 0.2]} intensity={5} color="#5B6CFF" distance={4} />
        <mesh position={[0, 1.4, -1.2]}>
          <planeGeometry args={[6, 4]} />
          <meshStandardMaterial color="#1B1035" />
        </mesh>
        <Mascote3D giro={-0.15 + 0.1 * Math.sin(t * 0.7)} pose={poseFala(t, reage > 0.3 ? { bracoD: [-1.7, 0, 0.3], cotoveloD: 1.5 } : {})} boca={boca(f)} pisca={pisca(t)} olhar={0.6} />
      </ThreeCanvas>
      <div style={{ position: "absolute", left: 12, top: 10, fontFamily, fontWeight: 900, fontSize: 20, letterSpacing: 3, color: "#fff", background: ROSA, padding: "3px 10px", borderRadius: 8 }}>● VYCE</div>
    </div>
  );
};

// ---------- Vyce no PC (final) ----------
const Setup: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const a = INICIO_FINAL;
  if (t < a - 0.3) return null;
  const k = suave(t, a - 0.3, a + 0.2);
  const olha = suave(t, a + 0.25, a + 0.7);
  const pos: [number, number, number] = [0.94 - (t - a) * 0.04, 1.5, 4.4 - (t - a) * 0.12];
  return (
    <AbsoluteFill style={{ opacity: k, transform: `scale(${1.2 - 0.2 * k})` }}>
      <Sequence from={Math.round(a * FPS) - 10} layout="none">
        <PalcoCinema ceu="estudio" fundo="#120B22" fov={45} luzCeu={0.25} brilhoCeu={0.05}>
          <Camera pos={pos} alvo={[0.82, 1.12, 0]} />
          <SetupGamer t={t} boca={boca(f)} pisca={pisca(t)} olhaCamera={olha} />
          <Acabamento foco={Math.hypot(pos[0] - 0.2, pos[1] - 1.3, pos[2])} desfoque={4} brilho={0.8} saturacao={0.12} contraste={0.12} vinheta={0.45} ao={0} />
        </PalcoCinema>
      </Sequence>
      <div style={{ position: "absolute", top: 270, left: 60, right: 180, textAlign: "center", color: "#fff", fontFamily, transform: `scale(${0.8 + 0.2 * entra(t, a + 0.2)})`, opacity: entra(t, a + 0.2) }}>
        <div style={{ fontWeight: 800, fontSize: 38, letterSpacing: 8, color: "#E6D2FF", textShadow: sombra }}>VOCÊ ESTÁ NA</div>
        <div style={{ fontWeight: 900, fontSize: 112, lineHeight: 0.95, letterSpacing: -2, textShadow: sombra }}>FASE EXTRA</div>
        <div style={{ fontWeight: 800, fontSize: 40, letterSpacing: 8, marginTop: 8, textShadow: sombra, opacity: entra(t, a + 1.3) }}>COM VYCE</div>
        <div style={{ display: "inline-block", marginTop: 18, fontWeight: 900, fontSize: 40, letterSpacing: 1, color: "#fff", background: "rgba(20,10,40,.7)", border: `3px solid ${ROSA}`, borderRadius: 16, padding: "6px 22px", boxShadow: `0 0 22px ${ROSA}`, opacity: entra(t, a + 1.7), transform: `scale(${0.7 + 0.3 * entra(t, a + 1.7)})` }}>
          @faseextra.br
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- textos ----------
const Selo: React.FC<{ texto: string; cor: string; t: number; de: number }> = ({ texto, cor, t, de }) => {
  const k = entra(t, de, 0.25);
  return (
    <div style={{ display: "inline-block", marginTop: 16, transform: `scale(${0.6 + 0.4 * k}) rotate(${(1 - k) * -8}deg)`, opacity: k, fontFamily, fontWeight: 800, fontSize: 27, letterSpacing: 3, color: "#111", background: cor, padding: "6px 18px", borderRadius: 10, boxShadow: `0 0 24px ${cor}99` }}>
      {texto}
    </div>
  );
};
// topo: textos curtos em cima do mapa (y 240); lado: durante o passeio, abaixo do minimapa
const Bloco: React.FC<{ t: number; de: number; ate: number; children: React.ReactNode; gancho?: boolean; lado?: boolean; topo?: number }> = ({ t, de, ate, children, gancho, lado, topo }) => {
  if (t < de - 0.05 || t > ate + 0.05) return null;
  const k = entra(t, de);
  const s = suave(t, ate - 0.15, ate);
  const tx = gancho ? Math.sin(t * 61) * 12 * (1 - suave(t, de + 0.1, de + 0.7)) : 0;
  return <div style={{ position: "absolute", top: topo ?? (lado ? 760 : 650), left: 60, right: 180, textAlign: "center", color: "#fff", fontFamily, opacity: k * (1 - s), transform: `translateX(${tx}px) scale(${0.7 + 0.3 * k})` }}>{children}</div>;
};
const G: React.FC<{ tam: number; children: React.ReactNode; cor?: string }> = ({ tam, children, cor = "#fff" }) => <div style={{ fontWeight: 900, fontSize: Math.round(tam * 0.74), lineHeight: 0.95, letterSpacing: -2, color: cor, textShadow: sombra }}>{children}</div>;
const P: React.FC<{ children: React.ReactNode; cor?: string }> = ({ children, cor = "#F3E8FF" }) => <div style={{ fontWeight: 800, fontSize: 38, letterSpacing: 5, color: cor, textShadow: sombra, marginTop: 6 }}>{children}</div>;
const Lista: React.FC<{ t: number; itens: [string, number][] }> = ({ t, itens }) => (
  <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "flex-start", gap: 6, marginTop: 10 }}>
    {itens.map(([txt, de], i) => {
      const k = entra(t, de, 0.25);
      return (
        <div key={i} style={{ fontWeight: 900, fontSize: 44, letterSpacing: 1, color: "#fff", textShadow: sombra, opacity: k, transform: `translateX(${(1 - k) * -40}px)` }}>
          <span style={{ color: ROSA }}>✓</span> {txt}
        </div>
      );
    })}
  </div>
);
const Faltam: React.FC<{ t: number }> = ({ t }) => {
  if (t < FIM_MAPA || emSetup(t)) return null;
  const k = entra(t, FIM_MAPA, 0.35);
  return (
    <div style={{ position: "absolute", top: 260, left: 60, display: "flex", opacity: k }}>
      <div style={{ fontFamily, fontWeight: 900, fontSize: 30, letterSpacing: 3, lineHeight: 1.15, color: "#fff", background: "rgba(20,10,40,.75)", border: `3px solid ${ROSA}`, borderRadius: 22, padding: "10px 20px", boxShadow: `0 0 ${16 + 10 * Math.abs(Math.sin(t * 3))}px ${ROSA}` }}>
        GTA 6
        <br />
        FALTAM <span style={{ color: "#FFB3EE" }}>{DIAS} DIAS</span>
      </div>
    </div>
  );
};

// ---------- legenda ----------
const DESTAQUE = /^(mapa|GTA|6|5|seis|regiões|fãs|tamanho|cuidado|maior|2|aviso|ninguém|leu|final|Keys|Jason|Brian|traficante|perigosas|lindas|iguana|Vice|City|cruzeiro|Boobie|Ike|império|Grassrivers|jacaré|perigoso|pior|Ambrosia|açúcar|motoqueiros|Kalaga|caipiras|místicos|paranoicos|suçuarana|caça|Port|Gellhorn|tempo|carteira|piada|North|dinheiro|some|19|banco|Fase|Extra|Vyce|região)$/i;
type Pal = { w: string; s: number; e: number };
const PAL = dados.palavras as Pal[];
const BLOCOS: Pal[][] = (() => {
  const b: Pal[][] = [];
  let c: Pal[] = [];
  PAL.forEach((p, i) => {
    c.push(p);
    const n = PAL[i + 1];
    if (c.length >= 3 || /[.,?!:]$/.test(p.w) || !n || n.s - p.e > 0.35) {
      b.push(c);
      c = [];
    }
  });
  return b;
})();
const Legenda: React.FC<{ t: number }> = ({ t }) => {
  const i = BLOCOS.findIndex((b, j) => t >= b[0].s - 0.05 && t < Math.min(BLOCOS[j + 1]?.[0].s ?? 999, b[b.length - 1].e + 0.6) - 0.05);
  if (i < 0) return null;
  return (
    <div style={{ position: "absolute", top: 1240, left: 60, right: 180, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 18px" }}>
      {BLOCOS[i].map((p, j) => {
        const ativo = t >= p.s;
        const dest = DESTAQUE.test(p.w.replace(/[.,?!:]/g, ""));
        const pulo = ativo ? interpolate(t, [p.s, p.s + 0.1, p.s + 0.22], [0.75, 1.15, 1], cl) : 1;
        return (
          <span key={j} style={{ fontFamily, fontWeight: 900, fontSize: 74, lineHeight: 1.08, color: dest ? "#E2B8FF" : "#fff", opacity: ativo ? 1 : 0, transform: `scale(${pulo})`, display: "inline-block", WebkitTextStroke: "10px #000", paintOrder: "stroke fill", textShadow: dest ? "0 0 24px rgba(182,107,255,.95)" : "0 6px 10px rgba(0,0,0,.6)" }}>
            {p.w.replace(/[.,:]$/, "")}
          </span>
        );
      })}
    </div>
  );
};

// ---------- sons (só nas pausas da voz) ----------
const falando = (t: number) => PAL.some((p) => t >= p.s - 0.04 && t <= p.e + 0.04);
const SONS: { s: string; t: number; v: number }[] = [
  { s: "dum", t: 0.0, v: 0.6 },
  { s: "whoosh", t: 2.9, v: 0.4 },
  ...REGIOES.map((r) => ({ s: "whoosh", t: r.seta, v: 0.3 })),
  { s: "dum", t: 21.15, v: 0.5 },
  { s: "dum", t: 24.8, v: 0.45 },
  { s: "carimbo", t: 27.8, v: 0.5 },
  { s: "whoosh", t: 28.8, v: 0.45 },
  { s: "whoosh", t: 45.35, v: 0.4 },
  { s: "whoosh", t: 58.75, v: 0.4 },
  { s: "dum", t: 65.45, v: 0.6 },
  { s: "whoosh", t: 67.55, v: 0.4 },
  { s: "whoosh", t: 72.85, v: 0.4 },
  { s: "whoosh", t: 87.4, v: 0.4 },
  { s: "dum", t: 98.55, v: 0.6 },
  { s: "carimbo", t: 100.45, v: 0.5 },
  { s: "dum", t: 104.95, v: 0.45 },
  { s: "carimbo", t: 111.2, v: 0.5 },
  { s: "whoosh", t: 111.8, v: 0.45 },
];

const DUCK: number[] = (() => {
  const bruto = Array.from({ length: DURACAO_FASE03 }, (_, i) => (falando(i / FPS) ? 0.42 : 1));
  return bruto.map((_, i) => {
    let soma = 0;
    let n = 0;
    for (let k = -6; k <= 6; k++) {
      const v = bruto[i + k];
      if (v !== undefined) {
        soma += v;
        n++;
      }
    }
    return soma / n;
  });
})();

export const VideoFase03: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const corte = PLANOS.some((p) => t >= p.de && t < p.de + 2 / FPS) && !emSetup(t) ? 0.2 : 0;
  const flash = interpolate(t, [0, 0.05, 0.3], [0.35, 0.25, 0], cl) + interpolate(t, [65.55, 65.6, 65.95], [0, 0.6, 0], cl) + interpolate(t, [100.55, 100.6, 101.0], [0, 0.5, 0], cl);
  const noFundo = !emSetup(t);
  return (
    <AbsoluteFill style={{ background: "#0b0618" }}>
      {noFundo && <Fundo t={t} />}
      {noFundo && t >= SAI_MAPA && <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,4,24,.75) 0%, rgba(10,4,24,0) 30%, rgba(10,4,24,0) 55%, rgba(10,4,24,.8) 100%)" }} />}
      <CenaMapa t={t} />
      <Setup t={t} f={f} />

      {/* abertura no mapa */}
      <Bloco t={t} de={0.0} ate={2.85} gancho topo={560}>
        <P cor="#FFE0FA">ESSE É O MAPA DO</P>
        <G tam={190}>GTA 6</G>
      </Bloco>
      <Bloco t={t} de={5.8} ate={9.65} topo={1060}>
        <G tam={120} cor="#FFB3EE">≈ 2× GTA 5</G>
        <Selo texto="ROCKSTAR NORTH · GAME INFORMER" cor="#4ADE80" t={t} de={6.2} />
      </Bloco>
      <Bloco t={t} de={21.25} ate={24.75}>
        <G tam={190}>6 REGIÕES</G>
        <P>A ROCKSTAR AVISA:</P>
        <G tam={120} cor="#FFD84A">CUIDADO</G>
        <P>EM QUASE TODAS</P>
      </Bloco>
      <Bloco t={t} de={24.89} ate={28.75}>
        <G tam={104}>UM AVISO QUE</G>
        <G tam={104}>NINGUÉM LEU</G>
        <Selo texto="FICA ATÉ O FINAL" cor="#FFD84A" t={t} de={27.89} />
      </Bloco>

      {/* 1/6 Keys */}
      <Bloco t={t} de={31.2} ate={32.7} lado>
        <P>O JASON MORA</P>
        <G tam={110} cor="#FFB3EE">DE GRAÇA</G>
      </Bloco>
      <Bloco t={t} de={32.75} ate={35.85} lado>
        <P>BRIAN</P>
        <G tam={90}>TRAFICANTE</G>
        <G tam={90} cor="#FFD84A">DAS ANTIGAS</G>
      </Bloco>
      <Bloco t={t} de={36.4} ate={40.35} lado>
        <P>A VIDA NAS KEYS</P>
        <Lista t={t} itens={[["ESPREGUIÇADEIRA", 37.11], ["BAR DE PRAIA", 38.07], ["IGUANA NA RUA", 39.02]]} />
      </Bloco>
      <Bloco t={t} de={41.55} ate={45.3} lado>
        <P>ÁGUAS ENTRE AS</P>
        <G tam={110} cor="#9DE3FF">MAIS PERIGOSAS</G>
        <P>DOS EUA</P>
        <Selo texto="OFICIAL · ROCKSTAR" cor="#4ADE80" t={t} de={42.2} />
      </Bloco>
      {/* 2/6 Vice City */}
      <Bloco t={t} de={47.7} ate={53.3} lado>
        <Lista t={t} itens={[["ART DÉCO", 48.05], ["PADARIA CUBANA", 48.8], ["MARCA FALSIFICADA", 49.84], ["CAPITAL DOS CRUZEIROS", 51.75]]} />
      </Bloco>
      <Bloco t={t} de={54.0} ate={58.75} lado>
        <G tam={130} cor="#FFB3EE">BOOBIE IKE</G>
        <P>DAS RUAS PRA UM IMPÉRIO</P>
        <Lista t={t} itens={[["IMÓVEIS", 56.55], ["BOATE", 57.18], ["ESTÚDIO", 57.76]]} />
      </Bloco>
      {/* 3/6 Grassrivers */}
      <Bloco t={t} de={61.4} ate={65.4} lado>
        <P>O JACARÉ É</P>
        <G tam={100} cor="#B9FFC9">O MENOS PIOR</G>
        <Selo texto="OFICIAL · ROCKSTAR" cor="#4ADE80" t={t} de={63.5} />
      </Bloco>
      <Bloco t={t} de={65.56} ate={67.5} gancho>
        <G tam={130}>E NEM É</G>
        <G tam={130} cor="#FFB3EE">A PIOR PARTE</G>
      </Bloco>
      {/* 4/6 Ambrosia */}
      <Bloco t={t} de={69.25} ate={72.85} lado>
        <P>EMPREGO</P>
        <G tam={100}>AÇÚCAR</G>
        {t > 71.05 && (
          <>
            <P>TODO O RESTO</P>
            <G tam={100} cor="#FFB3EE">MOTOQUEIROS</G>
          </>
        )}
      </Bloco>
      {/* 5/6 Kalaga */}
      <Bloco t={t} de={74.7} ate={80.45} lado>
        <Lista t={t} itens={[["CAÇA", 74.82], ["PESCA", 75.42], ["TRILHA", 76.0], ["CAIPIRAS MÍSTICOS", 76.73], ["RADICAIS PARANOICOS", 77.82]]} />
      </Bloco>
      <Bloco t={t} de={82.1} ate={87.4} lado>
        <P>SUÇUARANA DE OLHO</P>
        <G tam={100}>NOS CERVOS</G>
        <Selo texto="IMAGEM OFICIAL · ROCKSTAR" cor="#4ADE80" t={t} de={82.5} />
        {t > 85.3 && <G tam={100} cor="#FF9D9D">O CAÇADOR VIRA CAÇA</G>}
      </Bloco>
      {/* 6/6 Port Gellhorn */}
      <Bloco t={t} de={89.16} ate={90.6} lado>
        <P>A PRAIA QUE</P>
        <G tam={100} cor="#FFD84A">PAROU NO TEMPO</G>
      </Bloco>
      <Bloco t={t} de={90.65} ate={93.55} lado>
        <Lista t={t} itens={[["MOTEL BARATO", 90.73], ["ATRAÇÃO FECHADA", 91.62], ["SHOPPING VAZIO", 92.69]]} />
      </Bloco>
      <Bloco t={t} de={93.65} ate={98.5} lado>
        <P>A ECONOMIA DE LÁ</P>
        <Lista t={t} itens={[["CERVEJA BARATA", 95.69], ["REMÉDIO PRA DOR", 96.65], ["ENERGÉTICO DE POSTO", 97.58]]} />
        <div />
        <Selo texto="OFICIAL · ROCKSTAR" cor="#4ADE80" t={t} de={94.1} />
      </Bloco>
      {/* payoff */}
      <Bloco t={t} de={98.64} ate={104.95}>
        <P cor="#FFE0FA">O AVISO QUE NINGUÉM LEU</P>
        {t > 100.56 && (
          <>
            <G tam={130}>SEGURE SUA</G>
            <G tam={130} cor="#FFD84A">CARTEIRA</G>
            <Selo texto="OFICIAL · ROCKSTAR · PORT GELLHORN" cor="#4ADE80" t={t} de={100.9} />
          </>
        )}
      </Bloco>
      <Bloco t={t} de={105.05} ate={109.1}>
        <P>MORREU COM DINHEIRO NO BOLSO?</P>
        {t > 108.45 && <G tam={190} cor="#FF9D9D">SUMIU</G>}
        <Selo texto="ROB NELSON · ROCKSTAR NORTH" cor="#4ADE80" t={t} de={105.7} />
      </Bloco>
      <Bloco t={t} de={109.2} ate={111.85}>
        <P>DIA 19, PRIMEIRA COISA</P>
        {t > 111.25 && <G tam={190} cor="#B9FFC9">BANCO</G>}
      </Bloco>

      <Faltam t={t} />
      <Minimapa t={t} />
      <Facecam t={t} f={f} />
      <Legenda t={t} />

      <AbsoluteFill style={{ background: "#F5E9FF", opacity: Math.min(0.8, flash), pointerEvents: "none" }} />
      <AbsoluteFill style={{ background: "#000", opacity: corte, pointerEvents: "none" }} />

      <Audio src={staticFile("fase-extra/fase03/narracao.wav")} />
      <Audio src={staticFile("fase-extra/fase03/trilha.wav")} volume={(q) => DUCK[q] ?? 1} />
      {SONS.map((s, i) => (
        <Sequence key={i} from={Math.round(s.t * FPS)} durationInFrames={60}>
          <Audio src={staticFile(`fase-extra/sons/${s.s}.wav`)} volume={(q) => s.v * (falando(s.t + q / FPS) ? 0.3 : 1)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
