import { loadFont } from "@remotion/google-fonts/Montserrat";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { Acabamento, PalcoCinema } from "../../cinema/Palco";
import { Camera } from "../Estudio";
import { Mascote3D, PoseMascote } from "../Mascote3D";
import { SetupGamer } from "../SetupGamer";
import dados from "./dados.json";

// Fase Extra, Fase 06: "O GTA 6 é realista até demais" (~1:07).
// Imagens NOVAS (nada das Fases 01–05): capturas oficiais ainda não usadas, imagens da Ultimate Edition e o vídeo
// oficial "Pré-carregue agora". Realismômetro no alto sobe a cada detalhe e estoura no final. Sem selo de dias.
const { fontFamily } = loadFont("normal", { weights: ["600", "800", "900"], subsets: ["latin"] });
export const FPS = 30;
const FIM = dados.duracao + 1.0;
export const DURACAO_FASE06 = Math.ceil(FIM * FPS);
const ROXO = "#B66BFF";
const ROSA = "#FF4FD8";
const VERDE = "#4ADE80";
const VERMELHO = "#FF4D5E";
const AMARELO = "#FFD84A";
const LARANJA = "#FF8A3D";
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const suave = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
const entra = (t: number, a: number, d = 0.3) => interpolate(t, [a, a + d], [0, 1], { ...cl, easing: Easing.out(Easing.back(1.7)) });
const sombra = "0 0 26px rgba(182,107,255,.85), 0 5px 0 #2B0F66, 0 0 8px rgba(0,0,0,.9)";

const INICIO_FINAL = 60.45; // "Você está na Fase Extra"
const emSetup = (t: number) => t >= INICIO_FINAL;

// ---------- planos ----------
const PE = (pasta: string, nome: string) => `fase-extra/rockstar/capturas/People/${pasta}/${nome}.jpg`;
const PL = (pasta: string, nome: string) => `fase-extra/rockstar/capturas/Places/${pasta}/${nome}.jpg`;
const UE = (nome: string) => `fase-extra/rockstar/novos/ultimate/ULTIMATE_EDITION_${nome}.jpg`;
// pre: segundo do vídeo oficial "Pré-carregue agora" (proxy 1920 de altura); gira: plano que capota (fica de cabeça pra baixo)
type Plano = { de: number; img?: string; pre?: number; x?: number; x2?: number; zoom?: number; lento?: number; chicote?: boolean; gira?: number };
const PLANOS: Plano[] = [
  // gancho: cofre explodido, dinheiro queimando
  { de: 0.0, img: PE("Jason Duval", "Jason_Duval_16"), x: 0.45, x2: 0.55, zoom: 1.2 },
  { de: 1.4, img: PE("Jason and Lucia", "Jason_and_Lucia_04"), x: 0.4, x2: 0.5, chicote: true },
  { de: 3.2, img: PL("Vice City", "Vice_City_18"), x: 0.5, x2: 0.4, zoom: 1.15 },
  // apresentação
  { de: 5.0, pre: 11.0, x: 0.5 },
  { de: 6.9, img: PL("Vice City", "Vice_City_27"), x: 0.4, x2: 0.6 },
  { de: 8.55, img: PE("Jason and Lucia", "Jason_and_Lucia_16"), x: 0.35, x2: 0.5 }, // "do Red Dead"
  { de: 10.7, img: PL("Vice City", "Vice_City_15"), x: 0.6, x2: 0.45, chicote: true },
  // 1 cofre
  { de: 11.75, img: PE("Jason Duval", "Jason_Duval_10"), x: 0.5, x2: 0.4 },
  { de: 14.0, img: PE("Jason and Lucia", "Jason_and_Lucia_12"), x: 0.45, x2: 0.55 }, // combinação
  { de: 15.25, img: PE("Lucia Caminos", "Lucia_Caminos_07"), x: 0.5, x2: 0.6, chicote: true }, // polícia chegando
  { de: 16.35, img: PL("Vice City", "Vice_City_12"), x: 0.55, x2: 0.45, zoom: 1.15 }, // explodir
  // 2 espaço
  { de: 18.3, img: PE("Lucia Caminos", "Lucia_Caminos_08"), x: 0.4, x2: 0.5, zoom: 1.1 }, // mochila
  { de: 20.95, img: UE("SAFEHOUSE_VEHICLES_01"), x: 0.55, x2: 0.4 }, // carro
  { de: 22.15, img: UE("PTT_STORE_01"), x: 0.45, x2: 0.55, chicote: true }, // assalto
  // 3 receptador
  { de: 24.5, img: PL("Vice City", "Vice_City_25"), x: 0.5, x2: 0.4, zoom: 1.15 }, // joia
  { de: 25.35, img: PE("Boobie Ike", "Boobie_Ike_04"), x: 0.45, x2: 0.55 }, // dinheiro
  { de: 27.5, img: PE("Raul Bautista", "Raul_Bautista_04"), x: 0.5, x2: 0.4, chicote: true }, // receptador
  // re-gancho
  { de: 29.1, pre: 19.0, x: 0.5, lento: 0.6 },
  // 4 corpo
  { de: 31.5, img: PE("Lucia Caminos", "Lucia_Caminos_09"), x: 0.45, x2: 0.55, zoom: 1.1 }, // suor
  { de: 33.6, img: PL("Leonida Keys", "Leonida_Keys_06"), x: 0.35, x2: 0.5 }, // praia
  { de: 36.15, img: PE("Jason Duval", "Jason_Duval_18"), x: 0.5, x2: 0.6, chicote: true }, // tiro
  // 5 carro
  { de: 38.0, img: UE("VAPID_BUGGY_01"), x: 0.4, x2: 0.55, zoom: 1.1 },
  { de: 39.85, img: UE("VAPID_BUGGY_04"), x: 0.55, x2: 0.45, chicote: true },
  { de: 40.9, img: PL("Ambrosia", "Ambrosia_05"), x: 0.45, x2: 0.5, gira: 41.0 }, // de cabeça pra baixo
  // 6 briga
  { de: 42.95, img: PE("Lucia Caminos", "Lucia_Caminos_01"), x: 0.5, x2: 0.6, zoom: 1.1 },
  { de: 44.4, pre: 10.0, x: 0.45 }, // empurrão
  { de: 45.15, img: PL("Vice City", "Vice_City_21"), x: 0.45, x2: 0.55, chicote: true }, // briga de rua
  { de: 46.7, img: PL("Vice City", "Vice_City_04"), x: 0.5, x2: 0.4 },
  { de: 47.7, pre: 9.0, x: 0.5 }, // óculos
  { de: 48.6, img: UE("GOODTIME_GEAR_01"), x: 0.45, x2: 0.55, zoom: 1.15 },
  // 7 roupa
  { de: 49.55, img: UE("VICE_CITY_STYLE_03"), x: 0.5, x2: 0.4 },
  { de: 50.7, img: UE("VICE_CITY_STYLE_01"), x: 0.45, x2: 0.55, chicote: true },
  { de: 51.5, img: UE("STOCK_305_04"), x: 0.5, x2: 0.4 },
  { de: 52.25, img: UE("ELECTRIC_FANG_02"), x: 0.45, x2: 0.55, chicote: true },
  // desfecho: o cabelo
  { de: 53.1, img: PE("Jason and Lucia", "Jason_and_Lucia_14"), x: 0.5, x2: 0.4 },
  { de: 54.35, img: UE("SARAS_SALON_02"), x: 0.5, x2: 0.55, zoom: 1.2 }, // "o cabelo"
  { de: 55.25, img: PL("Grassrivers", "Grassrivers_07"), x: 0.4, x2: 0.5, chicote: true }, // "Red Dead 2"
  { de: 57.2, img: UE("SARAS_SALON_01"), x: 0.45, x2: 0.55 }, // "não cresce"
  { de: 58.9, img: UE("SARAS_SALON_02"), x: 0.55, x2: 0.5, zoom: 1.45 }, // "só no salão"
];
const planoEm = (t: number) => {
  let i = 0;
  while (i + 1 < PLANOS.length && PLANOS[i + 1].de <= t) i++;
  return i;
};
const fimDoPlano = (i: number) => Math.min(PLANOS[i + 1]?.de ?? FIM, INICIO_FINAL + 0.4);

const Fundo: React.FC<{ t: number }> = ({ t }) => {
  const i = planoEm(t);
  const p = PLANOS[i];
  const fim = fimDoPlano(i);
  if (t > fim) return null;
  const k = interpolate(t, [p.de, fim], [0, 1], cl);
  const punch = 1 + 0.08 * (1 - suave(t, p.de, p.de + 0.25));
  const ch = p.chicote ? 1 - suave(t, p.de, p.de + 0.22) : 0;
  const rot = p.gira ? 180 * suave(t, p.gira, p.gira + 0.5) : 0;
  const W = 3413;
  const estilo = { filter: ch > 0.02 ? `blur(${10 * ch}px)` : undefined, transform: `translateX(${ch * 260}px) rotate(${rot}deg) scale(${p.gira ? 1 + 0.25 * Math.sin((rot / 180) * Math.PI) : 1})` };
  if (p.img) {
    const x = interpolate(k, [0, 1], [p.x ?? 0.5, p.x2 ?? p.x ?? 0.5]);
    const z = (p.zoom ?? 1.05) * (1 + 0.1 * k) * punch;
    return (
      <AbsoluteFill style={{ overflow: "hidden", ...estilo }}>
        <Img src={staticFile(p.img)} style={{ position: "absolute", width: W, height: 1920, left: -(W - 1080) * x, top: 0, transform: `scale(${z})`, transformOrigin: `${x * 100}% 50%` }} />
      </AbsoluteFill>
    );
  }
  const z = (p.zoom ?? 1.05) * (1 + 0.07 * k) * punch;
  const dur = Math.max(1, Math.round((fim - p.de) * FPS) + 2);
  return (
    <Sequence key={i} from={Math.round(p.de * FPS)} durationInFrames={dur} layout="none">
      <AbsoluteFill style={{ overflow: "hidden", ...estilo }}>
        <OffthreadVideo src={staticFile("fase-extra/rockstar/novos/preload-1920.mp4")} startFrom={Math.round((p.pre ?? 0) * FPS)} playbackRate={p.lento ?? 1} muted style={{ position: "absolute", width: W, height: 1920, left: -(W - 1080) * (p.x ?? 0.5), top: 0, transform: `scale(${z})`, transformOrigin: `${(p.x ?? 0.5) * 100}% 50%` }} />
      </AbsoluteFill>
    </Sequence>
  );
};

// ---------- gancho: dinheiro pegando fogo ----------
const Fogo: React.FC<{ t: number }> = ({ t }) => {
  if (t > 5.0) return null;
  const k = suave(t, 3.1, 3.4) * (1 - suave(t, 4.7, 5.0));
  if (k <= 0) return null;
  const brasas = Array.from({ length: 26 }, (_, i) => {
    const x = (i * 137) % 1080;
    const v = 260 + ((i * 53) % 200);
    const y = 1900 - (((t - 3.1) * v + i * 97) % 1500);
    const r = 4 + (i % 4) * 3;
    return <div key={i} style={{ position: "absolute", left: x, top: y, width: r, height: r, borderRadius: r, background: i % 3 ? LARANJA : AMARELO, boxShadow: `0 0 ${r * 3}px ${LARANJA}`, opacity: 0.9 }} />;
  });
  return (
    <AbsoluteFill style={{ opacity: k, pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: `linear-gradient(0deg, rgba(255,90,20,${0.55 + 0.15 * Math.sin(t * 23)}) 0%, rgba(255,90,20,0) 55%)`, mixBlendMode: "screen" }} />
      {brasas}
    </AbsoluteFill>
  );
};

// ---------- realismômetro ----------
const ITENS = [11.8, 18.36, 24.53, 31.55, 38.07, 42.98, 49.58];
const ESTOURO = 53.15;
const Realismometro: React.FC<{ t: number }> = ({ t }) => {
  if (t < 5.0 || t > INICIO_FINAL) return null;
  const vis = entra(t, 5.0, 0.35);
  const n = ITENS.filter((a) => t >= a).length;
  const estoura = t >= ESTOURO;
  const treme = estoura ? Math.sin(t * 60) * 6 * (1 - suave(t, ESTOURO, ESTOURO + 1.2)) : 0;
  return (
    <div style={{ position: "absolute", left: 60, top: 255, width: 600, opacity: vis, transform: `translateX(${treme}px)` }}>
      <div style={{ fontFamily, fontWeight: 900, fontSize: 24, letterSpacing: 4, color: "#fff", textShadow: "0 2px 6px #000" }}>
        REALISMÔMETRO <span style={{ color: estoura ? VERMELHO : AMARELO }}>{estoura ? "ESTOUROU!" : `${Math.round((n / 7) * 100)}%`}</span>
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 6, padding: 6, borderRadius: 14, background: "rgba(20,10,40,.8)", border: `3px solid ${estoura ? VERMELHO : ROXO}`, boxShadow: `0 0 ${estoura ? 30 : 14}px ${estoura ? VERMELHO : ROXO}` }}>
        {ITENS.map((a, i) => {
          const k = entra(t, a, 0.3);
          const cor = estoura ? (Math.floor(t * 8) % 2 ? VERMELHO : AMARELO) : i < 3 ? VERDE : i < 5 ? AMARELO : LARANJA;
          return <div key={i} style={{ flex: 1, height: 26, borderRadius: 6, background: t >= a ? cor : "rgba(255,255,255,.12)", transform: `scaleY(${t >= a ? 0.6 + 0.4 * k : 1})`, boxShadow: t >= a ? `0 0 10px ${cor}` : undefined }} />;
        })}
      </div>
    </div>
  );
};

// ---------- cartão de cada detalhe ----------
const CARTOES: { n: number; de: number; ate: number; titulo: string; cor: string }[] = [
  { n: 1, de: 11.8, ate: 18.3, titulo: "O COFRE", cor: AMARELO },
  { n: 2, de: 18.36, ate: 24.48, titulo: "SEM ESPAÇO", cor: "#7CC8FF" },
  { n: 3, de: 24.53, ate: 29.05, titulo: "MUAMBA", cor: ROSA },
  { n: 4, de: 31.55, ate: 37.95, titulo: "O CORPO MARCA", cor: LARANJA },
  { n: 5, de: 38.07, ate: 42.9, titulo: "CAPOTOU, JÁ ERA", cor: VERMELHO },
  { n: 6, de: 42.98, ate: 49.5, titulo: "CADA UM BRIGA DE UM JEITO", cor: VERDE },
  { n: 7, de: 49.58, ate: 53.05, titulo: "O POVO REPARA", cor: "#E2B8FF" },
];
const Cartao: React.FC<{ t: number }> = ({ t }) => {
  const it = CARTOES.find((i) => t >= i.de - 0.05 && t < i.ate);
  if (!it) return null;
  const sai = suave(t, it.ate - 0.2, it.ate);
  const bate = interpolate(t, [it.de, it.de + 0.18], [3.2, 1], { ...cl, easing: Easing.out(Easing.cubic) });
  const treme = Math.sin(t * 70) * 14 * (1 - suave(t, it.de + 0.18, it.de + 0.5));
  const sobe = suave(t, it.de + 0.5, it.de + 0.85);
  const tam = interpolate(sobe, [0, 1], [380, 150]);
  const y = interpolate(sobe, [0, 1], [700, 440]);
  return (
    <AbsoluteFill style={{ opacity: 1 - sai }}>
      <div style={{ position: "absolute", left: 60, right: 180, top: y, transform: `translate(${treme}px,-50%) scale(${bate})`, textAlign: "center", fontFamily, fontWeight: 900, fontSize: tam, lineHeight: 1, color: "#fff", WebkitTextStroke: "8px #2B0F66", textShadow: `0 0 50px ${it.cor}, 0 14px 0 #2B0F66` }}>
        {it.n}
      </div>
      <div style={{ position: "absolute", left: 40, right: 160, top: 540, textAlign: "center", opacity: sobe, transform: `scale(${0.6 + 0.4 * sobe})` }}>
        <span style={{ display: "inline-block", fontFamily, fontWeight: 900, fontSize: it.titulo.length > 16 ? 48 : 66, color: "#111", background: it.cor, borderRadius: 16, padding: "4px 24px", boxShadow: "0 8px 0 rgba(0,0,0,.6)", whiteSpace: "nowrap" }}>{it.titulo}</span>
      </div>
    </AbsoluteFill>
  );
};
const Pilulas: React.FC<{ t: number; de: number; ate: number; itens: [string, number, string?][]; topo?: number }> = ({ t, de, ate, itens, topo = 690 }) => {
  if (t < de || t > ate) return null;
  const sai = suave(t, ate - 0.2, ate);
  return (
    <div style={{ position: "absolute", left: 60, right: 180, top: topo, display: "flex", flexDirection: "column", alignItems: "center", gap: 14, opacity: 1 - sai }}>
      {itens.map(([txt, d, cor = ROSA], i) => {
        const k = entra(t, d, 0.25);
        return (
          <span key={i} style={{ fontFamily, fontWeight: 900, fontSize: 42, color: "#fff", background: "rgba(20,10,40,.85)", border: `3px solid ${cor}`, borderRadius: 14, padding: "6px 18px", boxShadow: `0 0 16px ${cor}`, opacity: k, transform: `scale(${0.5 + 0.5 * k})`, whiteSpace: "nowrap" }}>
            {txt}
          </span>
        );
      })}
    </div>
  );
};

// bolsa enchendo (item 2)
const Bolsa: React.FC<{ t: number }> = ({ t }) => {
  if (t < 19.8 || t > 24.45) return null;
  const k = entra(t, 19.8, 0.3);
  const enche = interpolate(t, [19.9, 20.45], [0.1, 1], cl);
  const cheia = t > 20.45;
  return (
    <div style={{ position: "absolute", left: 540, top: 960, transform: `translate(-50%,-50%) scale(${k})`, opacity: 1 - suave(t, 24.25, 24.45), textAlign: "center" }}>
      <div style={{ position: "relative", width: 260, height: 220, margin: "0 auto", borderRadius: "40px 40px 30px 30px", border: `8px solid ${cheia ? VERMELHO : "#fff"}`, background: "rgba(20,10,40,.85)", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: `${enche * 100}%`, background: `linear-gradient(0deg, ${VERDE}, #1f8a4c)` }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 70, fontFamily, fontWeight: 900, fontSize: 64, color: "#fff", textShadow: "0 4px 0 #000" }}>$</div>
      </div>
      {cheia && <div style={{ marginTop: 10, display: "inline-block", transform: `scale(${entra(t, 20.45, 0.25)}) rotate(-5deg)`, fontFamily, fontWeight: 900, fontSize: 56, color: "#fff", background: VERMELHO, borderRadius: 12, padding: "2px 18px" }}>CHEIA</div>}
    </div>
  );
};

// desfecho: o cabelo
const Cabelo: React.FC<{ t: number }> = ({ t }) => {
  if (t < ESTOURO || t > INICIO_FINAL - 0.05) return null;
  const sai = suave(t, INICIO_FINAL - 0.25, INICIO_FINAL - 0.05);
  return (
    <div style={{ position: "absolute", left: 60, right: 180, top: 430, textAlign: "center", fontFamily, opacity: 1 - sai }}>
      <div style={{ display: "inline-block", transform: `scale(${entra(t, ESTOURO, 0.3)})`, fontWeight: 900, fontSize: 40, color: "#111", background: VERMELHO, borderRadius: 12, padding: "4px 18px" }}>O QUE A ROCKSTAR TIROU</div>
      {t > 54.38 && <div style={{ marginTop: 12, transform: `scale(${interpolate(t, [54.38, 54.55], [3, 1], { ...cl, easing: Easing.out(Easing.cubic) })})`, fontWeight: 900, fontSize: 130, lineHeight: 1, color: "#fff", WebkitTextStroke: "7px #2B0F66", textShadow: `0 0 40px ${ROSA}, 0 12px 0 #2B0F66` }}>O CABELO</div>}
      <div style={{ marginTop: 26, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        {t > 55.29 && <span style={{ transform: `scale(${entra(t, 55.29, 0.25)})`, fontWeight: 900, fontSize: 44, color: "#fff", background: "rgba(20,10,40,.85)", border: `3px solid ${AMARELO}`, borderRadius: 14, padding: "6px 18px" }}>RED DEAD 2: CRESCIA SOZINHO</span>}
        {t > 57.27 && <span style={{ transform: `scale(${entra(t, 57.27, 0.25)})`, fontWeight: 900, fontSize: 44, color: "#fff", background: "rgba(20,10,40,.85)", border: `3px solid ${VERMELHO}`, borderRadius: 14, padding: "6px 18px" }}>GTA 6: NÃO CRESCE ✗</span>}
        {t > 59.62 && <span style={{ transform: `scale(${entra(t, 59.62, 0.25)}) rotate(-3deg)`, fontWeight: 900, fontSize: 60, color: "#111", background: VERDE, borderRadius: 14, padding: "6px 22px" }}>✂ SÓ NO SALÃO</span>}
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
const REACOES = [5.1, 7.95, 10.8, 29.2];
const JANELAS: [number, number][] = [
  [4.95, 11.7], // "realista num nível que dá até raiva... fica até o final"
  [29.0, 31.45], // re-gancho
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

// ---------- textos soltos ----------
const Selo: React.FC<{ texto: string; cor: string; t: number; de: number }> = ({ texto, cor, t, de }) => {
  const k = entra(t, de, 0.25);
  return (
    <div style={{ display: "inline-block", marginTop: 16, transform: `scale(${0.6 + 0.4 * k}) rotate(${(1 - k) * -8}deg)`, opacity: k, fontFamily, fontWeight: 800, fontSize: 27, letterSpacing: 3, color: "#111", background: cor, padding: "6px 18px", borderRadius: 10, boxShadow: `0 0 24px ${cor}99` }}>
      {texto}
    </div>
  );
};
const Bloco: React.FC<{ t: number; de: number; ate: number; children: React.ReactNode; gancho?: boolean; topo?: number }> = ({ t, de, ate, children, gancho, topo }) => {
  if (t < de - 0.05 || t > ate + 0.05) return null;
  const k = entra(t, de);
  const s = suave(t, ate - 0.15, ate);
  const tx = gancho ? Math.sin(t * 61) * 14 * (1 - suave(t, de + 0.1, de + 0.6)) : 0;
  return <div style={{ position: "absolute", top: topo ?? 650, left: 60, right: 180, textAlign: "center", color: "#fff", fontFamily, opacity: k * (1 - s), transform: `translateX(${tx}px) scale(${0.7 + 0.3 * k})` }}>{children}</div>;
};
const G: React.FC<{ tam: number; children: React.ReactNode; cor?: string }> = ({ tam, children, cor = "#fff" }) => <div style={{ fontWeight: 900, fontSize: Math.round(tam * 0.74), lineHeight: 0.95, letterSpacing: -2, color: cor, textShadow: sombra }}>{children}</div>;
const P: React.FC<{ children: React.ReactNode; cor?: string }> = ({ children, cor = "#F3E8FF" }) => <div style={{ fontWeight: 800, fontSize: 38, letterSpacing: 5, color: cor, textShadow: sombra, marginTop: 6 }}>{children}</div>;

// ---------- legenda ----------
const DESTAQUE = /^(GTA|6|explodir|cofre|queima|dinheiro|realista|raiva|Red|Dead|Rockstar|tirou|propósito|final|combinação|polícia|grana|tudo|bolsa|limite|carro|maior|Joia|marcado|gastar|receptador|detalhe|ninguém|sua|praia|areia|tênis|tiro|marca|Capotou|volante|cabeça|baixo|Lucia|kickboxing|MMA|Jason|rua|óculos|roupa|estiloso|comentam|cabelo|crescia|cresce|salão|Fase|Extra|Vyce|detalhes|primeiro)$/i;
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
        const dest = DESTAQUE.test(p.w.replace(/[.,?!:]$/g, ""));
        const pulo = ativo ? interpolate(t, [p.s, p.s + 0.1, p.s + 0.22], [0.75, 1.15, 1], cl) : 1;
        return (
          <span key={j} style={{ fontFamily, fontWeight: 900, fontSize: 74, lineHeight: 1.08, color: dest ? "#E2B8FF" : "#fff", opacity: ativo ? 1 : 0, transform: `scale(${pulo})`, display: "inline-block", WebkitTextStroke: "10px #000", paintOrder: "stroke fill", textShadow: dest ? "0 0 24px rgba(182,107,255,.95)" : "0 6px 10px rgba(0,0,0,.6)" }}>
            {p.w.replace(/[.,:!]$/, "")}
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
  { s: "carimbo", t: 3.15, v: 0.5 },
  { s: "whoosh", t: 4.95, v: 0.4 },
  { s: "carimbo", t: 10.7, v: 0.5 },
  ...ITENS.map((a) => ({ s: "dum", t: a - 0.05, v: 0.55 })),
  { s: "dum", t: 29.05, v: 0.55 },
  { s: "whoosh", t: 40.95, v: 0.5 },
  { s: "dum", t: ESTOURO - 0.05, v: 0.65 },
  { s: "carimbo", t: 59.55, v: 0.55 },
  { s: "whoosh", t: INICIO_FINAL - 0.1, v: 0.45 },
];

const DUCK: number[] = (() => {
  const bruto = Array.from({ length: DURACAO_FASE06 }, (_, i) => (falando(i / FPS) ? 0.42 : 1));
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

export const VideoFase06: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const corte = PLANOS.some((p) => t >= p.de && t < p.de + 2 / FPS) && !emSetup(t) ? 0.2 : 0;
  const impactos = [0, 3.22, 29.13, ESTOURO, 54.38, ...ITENS];
  const flash = Math.min(0.8, impactos.reduce((m, a) => m + interpolate(t, [a, a + 0.04, a + 0.28], [0, a === 0 ? 0.35 : 0.45, 0], cl), 0));
  const tremor = impactos.reduce((m, a) => (t >= a ? Math.max(m, 1 - suave(t, a, a + 0.35)) : m), 0);
  const tx = Math.sin(t * 83) * 10 * tremor;
  const ty = Math.cos(t * 71) * 8 * tremor;
  const noFundo = !emSetup(t);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ transform: `translate(${tx}px,${ty}px) scale(1.02)` }}>
        {noFundo && <Fundo t={t} />}
        {noFundo && <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,4,24,.78) 0%, rgba(10,4,24,.2) 32%, rgba(10,4,24,.15) 55%, rgba(10,4,24,.82) 100%)" }} />}
      </AbsoluteFill>
      <Fogo t={t} />
      <Setup t={t} f={f} />

      {/* gancho */}
      <Bloco t={t} de={0.0} ate={1.35} gancho topo={600}>
        <G tam={210}>NO GTA 6</G>
      </Bloco>
      <Bloco t={t} de={1.4} ate={3.15} gancho topo={560}>
        <P>EXPLODIU O</P>
        <G tam={190} cor={AMARELO}>COFRE?</G>
      </Bloco>
      <Bloco t={t} de={3.22} ate={4.95} gancho topo={540}>
        <P>QUEIMOU O PRÓPRIO</P>
        <G tam={190} cor={LARANJA}>DINHEIRO</G>
      </Bloco>
      {/* apresentação */}
      <Bloco t={t} de={5.04} ate={11.7}>
        <P>O GTA 6 É</P>
        <G tam={150} cor={AMARELO}><span style={{ whiteSpace: "nowrap" }}>REALISTA</span></G>
        <G tam={150}><span style={{ whiteSpace: "nowrap" }}>ATÉ DEMAIS</span></G>
        <Selo texto="O QUE A ROCKSTAR TIROU DO RED DEAD?" cor={ROSA} t={t} de={7.91} />
        <div />
        <Selo texto="FICA ATÉ O FINAL" cor={AMARELO} t={t} de={10.75} />
      </Bloco>

      <Realismometro t={t} />
      <Cartao t={t} />
      <Pilulas t={t} de={14.0} ate={18.3} itens={[["COMBINAÇÃO: DEMORA", 14.04, AMARELO], ["DINAMITE: ESTRAGA A GRANA", 16.4, VERMELHO]]} />
      <Bolsa t={t} />
      <Pilulas t={t} de={21.0} ate={24.45} topo={680} itens={[["O CARRO TAMBÉM TEM LIMITE", 21.11], ["BOLSA MAIOR? ESCOLHE ANTES", 22.2, VERDE]]} />
      <Pilulas t={t} de={25.0} ate={29.0} itens={[["JOIA: ✗ NÃO GASTA", 25.29, VERMELHO], ["DINHEIRO MARCADO: ✗", 25.65, VERMELHO], ["VENDE PRO RECEPTADOR ✓", 27.73, VERDE]]} />
      <Bloco t={t} de={29.13} ate={31.45} gancho>
        <P>O DETALHE QUE</P>
        <G tam={140} cor="#FFB3EE">QUASE NINGUÉM VIU</G>
      </Bloco>
      <Pilulas t={t} de={32.5} ate={37.95} itens={[["SUOR", 32.91, "#7CC8FF"], ["AREIA NO TÊNIS", 34.71, AMARELO], ["A MARCA DO TIRO FICA", 37.02, VERMELHO]]} />
      <Pilulas t={t} de={39.1} ate={42.9} itens={[["NÃO DESVIRA NO VOLANTE ✗", 39.13, VERMELHO]]} />
      <Pilulas t={t} de={43.5} ate={49.5} itens={[["LUCIA: KICKBOXING + MMA", 43.6, ROSA], ["JASON: BRIGA DE RUA", 45.85, LARANJA], ["PEGA OS ÓCULOS DO CARA", 47.85, VERDE]]} />
      <Pilulas t={t} de={50.4} ate={53.05} itens={[["\"QUE ROUPA É ESSA?\"", 50.75, "#E2B8FF"], ["\"TÁ ESTILOSO, HEIN\"", 51.55, AMARELO]]} />
      <Cabelo t={t} />

      <Facecam t={t} f={f} />
      <Legenda t={t} />

      <AbsoluteFill style={{ background: "#F5E9FF", opacity: flash, pointerEvents: "none" }} />
      <AbsoluteFill style={{ background: "#000", opacity: corte, pointerEvents: "none" }} />

      <Audio src={staticFile("fase-extra/fase06/narracao.wav")} />
      {/* música nova: animação oficial da arte de capa (escolha do usuário), no mesmo nível da Fase 05 */}
      <Audio src={staticFile("fase-extra/fase06/trilha.wav")} volume={(q) => 0.63 * (DUCK[q] ?? 1)} />
      {SONS.map((s, i) => (
        <Sequence key={i} from={Math.round(s.t * FPS)} durationInFrames={60}>
          <Audio src={staticFile(`fase-extra/sons/${s.s}.wav`)} volume={(q) => s.v * (falando(s.t + q / FPS) ? 0.3 : 1)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
