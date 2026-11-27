import { loadFont } from "@remotion/google-fonts/Montserrat";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { Acabamento, PalcoCinema } from "../../cinema/Palco";
import { Camera } from "../Estudio";
import { Mascote3D, PoseMascote } from "../Mascote3D";
import { SetupGamer } from "../SetupGamer";
import dados from "./dados.json";

// Fase Extra, Fase 04: "7 problemas do GTA 5 que o GTA 6 finalmente corrigiu" (~1:29).
// Contagem 7 → 1: cada item abre com o número batendo na tela e o cartão "GTA 5 ✗ / GTA 6 ✓".
// Fundo sempre em movimento (capturas oficiais com zoom/chicote + trailer mudo), corte a cada 1–2 s.
const { fontFamily } = loadFont("normal", { weights: ["600", "800", "900"], subsets: ["latin"] });
export const FPS = 30;
const FIM = dados.duracao + 1.0;
export const DURACAO_FASE04 = Math.ceil(FIM * FPS);
const ROXO = "#B66BFF";
const ROSA = "#FF4FD8";
const VERDE = "#4ADE80";
const VERMELHO = "#FF4D5E";
const DIAS = 3; // postagem em 16/11
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const suave = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
const entra = (t: number, a: number, d = 0.3) => interpolate(t, [a, a + d], [0, 1], { ...cl, easing: Easing.out(Easing.back(1.7)) });
const sombra = "0 0 26px rgba(182,107,255,.85), 0 5px 0 #2B0F66, 0 0 8px rgba(0,0,0,.9)";

const INICIO_FINAL = 82.95; // "Você está na Fase Extra"
const emSetup = (t: number) => t >= INICIO_FINAL;

// ---------- planos: captura oficial (img) ou trailer (tr, segundos conferidos no catálogo de 0,5 s) ----------
const PE = (pasta: string, nome: string) => `fase-extra/rockstar/capturas/People/${pasta}/${nome}.jpg`;
const PL = (pasta: string, nome: string) => `fase-extra/rockstar/capturas/Places/${pasta}/${nome}.jpg`;
type Plano = { de: number; img?: string; tr?: number; x?: number; x2?: number; zoom?: number; lento?: number; chicote?: boolean };
const PLANOS: Plano[] = [
  // gancho
  { de: 0.0, img: PE("Jason Duval", "Jason_Duval_17"), x: 0.3, x2: 0.4, zoom: 1.25 }, // fuzil na mão
  { de: 1.2, tr: 72.95, x: 0.42, zoom: 1.15 }, // Lucia atirando de fuzil
  { de: 2.5, img: PE("Jason Duval", "Jason_Duval_09"), x: 0.55, x2: 0.45, zoom: 1.2 }, // mesa de armas
  { de: 3.25, tr: 53.0, x: 0.5, zoom: 1.1 }, // explosão no telhado ("acabou")
  // apresentação
  { de: 4.95, tr: 18.0, x: 0.5, zoom: 1.2 }, // cidade à noite
  { de: 6.6, tr: 47.0, x: 0.55, zoom: 1.15 }, // supercarros
  { de: 8.8, tr: 70.0, x: 0.55 }, // vista aérea à noite ("número absurdo")
  { de: 10.95, img: PL("Vice City", "Vice_City_08"), x: 0.45, x2: 0.6 },
  // 7 interiores
  { de: 12.1, tr: 38.0, x: 0.5, lento: 0.6 }, // boate por dentro
  { de: 13.55, img: PE("Jason Duval", "Jason_Duval_06"), x: 0.5, x2: 0.4 }, // bar por dentro
  { de: 15.3, img: PE("Cal Hampton", "Cal_Hampton_02"), x: 0.4, x2: 0.5 }, // sinuca
  { de: 16.65, img: PE("DreQuan Priest", "DreQuan_Priest_04"), x: 0.5, x2: 0.6 }, // estúdio
  { de: 19.75, img: PE("Jason and Lucia", "Jason_and_Lucia_15"), x: 0.45, x2: 0.55, chicote: true }, // "loja"
  { de: 20.3, img: PE("Jason and Lucia", "Jason_and_Lucia_10"), x: 0.4, x2: 0.5, chicote: true }, // "saguão de hotel"
  { de: 21.15, tr: 63.0, x: 0.5 }, // "telhado"
  { de: 21.9, tr: 35.0, x: 0.5, lento: 0.6 }, // cofre ("o lugar da missão")
  // 6 armas
  { de: 24.3, img: PE("Jason Duval", "Jason_Duval_09"), x: 0.4, x2: 0.6, zoom: 1.15 },
  { de: 25.95, img: PE("Jason and Lucia", "Jason_and_Lucia_02"), x: 0.5, x2: 0.4 },
  { de: 27.4, img: PE("Lucia Caminos", "Lucia_Caminos_12"), x: 0.4, x2: 0.5 },
  { de: 28.2, img: PE("Jason Duval", "Jason_Duval_17"), x: 0.5, x2: 0.35, chicote: true },
  { de: 29.75, img: PE("Jason and Lucia", "Jason_and_Lucia_17"), x: 0.6, x2: 0.45 }, // "porta-malas"
  { de: 31.45, tr: 72.95, x: 0.42, zoom: 1.1 }, // fuzil na rua
  { de: 33.2, img: PL("Vice City", "Vice_City_06"), x: 0.5, x2: 0.4 }, // polícia
  // 5 NPCs
  { de: 34.6, img: PL("Vice City", "Vice_City_05"), x: 0.55, x2: 0.4 },
  { de: 36.6, img: PE("Jason and Lucia", "Jason_and_Lucia_05"), x: 0.45, x2: 0.55 },
  { de: 38.3, img: PE("Jason and Lucia", "Jason_and_Lucia_18"), x: 0.4, x2: 0.55, chicote: true }, // "encara"
  { de: 39.0, img: PE("Jason and Lucia", "Jason_and_Lucia_19"), x: 0.55, x2: 0.45, chicote: true }, // "segue"
  { de: 39.8, img: PE("Real Dimez", "Real_Dimez_03"), x: 0.45, x2: 0.55 }, // "ouvindo a conversa"
  { de: 40.8, img: PE("Jason Duval", "Jason_Duval_12"), x: 0.55, x2: 0.45, zoom: 1.15 }, // "gente armada"
  { de: 41.8, tr: 53.0, x: 0.5, zoom: 1.1 }, // "atira de volta"
  // re-gancho
  { de: 42.75, tr: 71.5, x: 0.4, lento: 0.6 },
  // 4 polícia
  { de: 45.25, tr: 48.0, x: 0.55 }, // viatura de dia
  { de: 46.85, img: PE("Lucia Caminos", "Lucia_Caminos_14"), x: 0.4, x2: 0.5 },
  { de: 48.7, img: PE("Jason Duval", "Jason_Duval_07"), x: 0.5, x2: 0.6 }, // "a vítima ligou"
  { de: 49.95, tr: 68.6, x: 0.6, lento: 0.8 }, // helicóptero ("uma câmera pegou")
  { de: 52.1, img: PE("Jason and Lucia", "Jason_and_Lucia_09"), x: 0.5, x2: 0.4 }, // a ficha
  { de: 54.1, img: PE("Lucia Caminos", "Lucia_Caminos_03"), x: 0.45, x2: 0.55, chicote: true }, // "trocou de roupa"
  { de: 55.0, img: PE("Lucia Caminos", "Lucia_Caminos_06"), x: 0.5, x2: 0.4 },
  // 3 tiroteio
  { de: 56.15, tr: 65.0, x: 0.45, lento: 0.7 }, // silhueta apontando
  { de: 57.95, img: PE("Lucia Caminos", "Lucia_Caminos_13"), x: 0.55, x2: 0.65, zoom: 1.1 }, // "tirar a arma da mão"
  { de: 60.05, img: PE("Jason Duval", "Jason_Duval_05"), x: 0.35, x2: 0.45 }, // "acertar braço e perna"
  { de: 62.5, img: PE("Jason Duval", "Jason_Duval_12"), x: 0.6, x2: 0.6, zoom: 1.35 }, // mira que muda de cor
  // 2 corpo
  { de: 63.95, img: PE("Jason Duval", "Jason_Duval_02"), x: 0.5, x2: 0.4 },
  { de: 65.9, tr: 59.0, x: 0.5 }, // sofá ("comeu demais")
  { de: 66.95, img: PE("Cal Hampton", "Cal_Hampton_03"), x: 0.5, x2: 0.45, zoom: 1.15 }, // "barriga"
  { de: 67.75, tr: 57.55, x: 0.5, lento: 0.45 }, // academia
  { de: 68.75, img: PE("Jason Duval", "Jason_Duval_15"), x: 0.55, x2: 0.45, zoom: 1.1 }, // "músculo"
  // 1 animações
  { de: 70.3, tr: 55.3, x: 0.5, lento: 0.6 }, // praia lotada
  { de: 74.15, img: PL("Vice City", "Vice_City_05"), x: 0.4, x2: 0.6, zoom: 1.1 },
  { de: 75.9, img: PE("Jason and Lucia", "Jason_and_Lucia_18"), x: 0.55, x2: 0.4, chicote: true },
  { de: 77.15, img: PE("Real Dimez", "Real_Dimez_02"), x: 0.45, x2: 0.6 },
  // reviravolta
  { de: 78.7, img: PE("Lucia Caminos", "Lucia_Caminos_13"), x: 0.62, x2: 0.62, zoom: 1.1 },
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
  // chicote: entra deslizando de lado com borrão
  const ch = p.chicote ? 1 - suave(t, p.de, p.de + 0.22) : 0;
  const W = 3413;
  const estilo = { filter: ch > 0.02 ? `blur(${10 * ch}px)` : undefined, transform: `translateX(${ch * 260}px)` };
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
  const src = staticFile("fase-extra/rockstar/trailer-1920.mp4");
  const dur = Math.max(1, Math.round((fim - p.de) * FPS) + 2);
  return (
    <Sequence key={i} from={Math.round(p.de * FPS)} durationInFrames={dur} layout="none">
      <AbsoluteFill style={{ overflow: "hidden", ...estilo }}>
        <OffthreadVideo src={src} startFrom={Math.round((p.tr ?? 0) * FPS)} playbackRate={p.lento ?? 1} muted style={{ position: "absolute", width: W, height: 1920, left: -(W - 1080) * (p.x ?? 0.5), top: 0, transform: `scale(${z})`, transformOrigin: `${(p.x ?? 0.5) * 100}% 50%` }} />
      </AbsoluteFill>
    </Sequence>
  );
};

// ---------- itens da contagem ----------
type Item = { n: number; de: number; ate: number; g5: string; t5: number; g6: string; t6: number };
const ITENS: Item[] = [
  { n: 7, de: 12.11, ate: 24.25, g5: "PORTA DE ENFEITE", t5: 13.56, g6: "CENTENAS DE INTERIORES", t6: 16.65 },
  { n: 6, de: 24.33, ate: 34.55, g5: "ARSENAL NO BOLSO", t5: 25.07, g6: "SÓ 4 ARMAS NO CORPO", t6: 25.96 },
  { n: 5, de: 34.62, ate: 42.7, g5: "NPC DE PAPELÃO", t5: 35.2, g6: "ELES REPARAM EM VOCÊ", t6: 36.24 },
  { n: 4, de: 45.27, ate: 56.1, g5: "POLÍCIA VIDENTE", t5: 45.82, g6: "SÓ VEM SE ALGUÉM VIU", t6: 46.89 },
  { n: 3, de: 56.18, ate: 63.9, g5: "TIROTEIO = MATAR", t5: 56.64, g6: "DESARMA SEM MATAR", t6: 57.98 },
  { n: 2, de: 63.96, ate: 70.25, g5: "CORPO DE ESTÁTUA", t5: 64.67, g6: "BARRIGA OU MÚSCULO", t6: 65.93 },
];
const Linha: React.FC<{ t: number; de: number; jogo: string; txt: string; cor: string; risca?: boolean }> = ({ t, de, jogo, txt, cor, risca }) => {
  const k = entra(t, de, 0.3);
  if (k <= 0) return null;
  const r = risca ? suave(t, de + 0.35, de + 0.7) : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, justifyContent: "center", marginTop: 14, opacity: k, transform: `translateX(${(1 - k) * (risca ? -120 : 120)}px)` }}>
      <span style={{ fontFamily, fontWeight: 900, fontSize: 30, color: "#111", background: cor, borderRadius: 10, padding: "4px 12px", whiteSpace: "nowrap" }}>{jogo}</span>
      <span style={{ position: "relative", fontFamily, fontWeight: 900, fontSize: 44, color: "#fff", textShadow: sombra, whiteSpace: "nowrap" }}>
        {txt}
        {risca && <span style={{ position: "absolute", left: -6, top: "52%", height: 7, width: `${(r * 100 + 4).toFixed(1)}%`, background: VERMELHO, borderRadius: 4, boxShadow: "0 0 10px #000" }} />}
      </span>
      <span style={{ fontFamily, fontWeight: 900, fontSize: 46, color: cor, textShadow: "0 0 12px #000" }}>{risca ? "✗" : "✓"}</span>
    </div>
  );
};
const Cartao: React.FC<{ t: number }> = ({ t }) => {
  const it = ITENS.find((i) => t >= i.de - 0.05 && t < i.ate);
  if (!it) return null;
  const sai = suave(t, it.ate - 0.2, it.ate);
  // número: bate gigante no meio e encolhe para o topo
  const bate = interpolate(t, [it.de, it.de + 0.18], [3.2, 1], { ...cl, easing: Easing.out(Easing.cubic) });
  const treme = Math.sin(t * 70) * 14 * (1 - suave(t, it.de + 0.18, it.de + 0.5));
  const sobe = suave(t, it.de + 0.6, it.de + 0.95);
  const tam = interpolate(sobe, [0, 1], [420, 210]);
  const y = interpolate(sobe, [0, 1], [700, 440]);
  return (
    <AbsoluteFill style={{ opacity: 1 - sai }}>
      <div style={{ position: "absolute", left: 60, right: 180, top: y, transform: `translate(${treme}px,-50%) scale(${bate})`, textAlign: "center", fontFamily, fontWeight: 900, fontSize: tam, lineHeight: 1, color: "#fff", WebkitTextStroke: "8px #2B0F66", textShadow: `0 0 50px ${ROSA}, 0 14px 0 #2B0F66` }}>
        {it.n}
      </div>
      <div style={{ position: "absolute", left: 40, right: 160, top: 580, opacity: sobe }}>
        <Linha t={t} de={it.t5} jogo="GTA 5" txt={it.g5} cor={VERMELHO} risca />
        <Linha t={t} de={it.t6} jogo="GTA 6" txt={it.g6} cor={VERDE} />
      </div>
    </AbsoluteFill>
  );
};

// textos extras por item (abaixo do cartão, acima da legenda)
const Pilulas: React.FC<{ t: number; de: number; ate: number; itens: [string, number][]; cor?: string }> = ({ t, de, ate, itens, cor = ROSA }) => {
  if (t < de || t > ate) return null;
  const sai = suave(t, ate - 0.2, ate);
  return (
    <div style={{ position: "absolute", left: 60, right: 180, top: 820, display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center", opacity: 1 - sai }}>
      {itens.map(([txt, d], i) => {
        const k = entra(t, d, 0.25);
        return (
          <span key={i} style={{ fontFamily, fontWeight: 900, fontSize: 40, color: "#fff", background: "rgba(20,10,40,.82)", border: `3px solid ${cor}`, borderRadius: 14, padding: "6px 16px", boxShadow: `0 0 16px ${cor}`, opacity: k, transform: `scale(${0.5 + 0.5 * k})` }}>
            {txt}
          </span>
        );
      })}
    </div>
  );
};

// mira que muda de cor (item 3)
const Mira: React.FC<{ t: number }> = ({ t }) => {
  if (t < 62.5 || t > 63.95) return null;
  const cor = t < 62.95 ? "#fff" : t < 63.4 ? "#FFD84A" : VERMELHO;
  const nome = t < 62.95 ? "ACERTO" : t < 63.4 ? "INCAPACITA" : "MATA";
  const k = entra(t, 62.5, 0.2);
  return (
    <div style={{ position: "absolute", left: 540, top: 960, transform: `translate(-50%,-50%) scale(${k})` }}>
      <svg width={260} height={260} viewBox="-130 -130 260 260">
        <circle r={70} fill="none" stroke={cor} strokeWidth={8} />
        {[0, 90, 180, 270].map((a) => (
          <line key={a} x1={0} y1={-110} x2={0} y2={-80} stroke={cor} strokeWidth={10} strokeLinecap="round" transform={`rotate(${a})`} />
        ))}
        <circle r={8} fill={cor} />
      </svg>
      <div style={{ textAlign: "center", fontFamily, fontWeight: 900, fontSize: 40, color: cor, textShadow: "0 0 12px #000, 0 4px 0 #000" }}>{nome}</div>
    </div>
  );
};

// contador do número 1
const Contador: React.FC<{ t: number }> = ({ t }) => {
  if (t < 70.3 || t > 78.7) return null;
  const sai = suave(t, 78.5, 78.7);
  const v5 = Math.round(interpolate(t, [72.0, 73.2], [0, 55000], { ...cl, easing: Easing.out(Easing.cubic) }));
  const v6 = Math.round(interpolate(t, [76.2, 77.3], [55000, 600000], { ...cl, easing: Easing.out(Easing.cubic) }));
  const fmt = (n: number) => n.toLocaleString("pt-BR");
  const bate = interpolate(t, [70.3, 70.5], [3, 1], { ...cl, easing: Easing.out(Easing.cubic) });
  return (
    <AbsoluteFill style={{ opacity: 1 - sai }}>
      <div style={{ position: "absolute", left: 60, right: 180, top: 300, textAlign: "center", transform: `scale(${bate})`, fontFamily, fontWeight: 900, fontSize: 210, lineHeight: 1, color: "#FFD84A", WebkitTextStroke: "8px #2B0F66", textShadow: `0 0 50px #FFD84A, 0 14px 0 #2B0F66` }}>1</div>
      <div style={{ position: "absolute", left: 60, right: 180, top: 560, textAlign: "center", fontFamily, color: "#fff" }}>
        <div style={{ fontWeight: 800, fontSize: 38, letterSpacing: 6, textShadow: sombra, opacity: entra(t, 71.2) }}>ANIMAÇÕES</div>
        <div style={{ opacity: entra(t, 71.3), marginTop: 10 }}>
          <span style={{ fontWeight: 900, fontSize: 32, color: "#111", background: VERMELHO, borderRadius: 10, padding: "4px 12px", verticalAlign: "middle" }}>GTA 5</span>
          <span style={{ fontWeight: 900, fontSize: 88, marginLeft: 16, textShadow: sombra, verticalAlign: "middle" }}>{fmt(v5)}</span>
        </div>
        <div style={{ opacity: entra(t, 74.2), marginTop: 10 }}>
          <span style={{ fontWeight: 900, fontSize: 32, color: "#111", background: VERDE, borderRadius: 10, padding: "4px 12px", verticalAlign: "middle" }}>GTA 6</span>
          <span style={{ fontWeight: 900, fontSize: 88, marginLeft: 16, color: "#B9FFC9", textShadow: sombra, verticalAlign: "middle" }}>{t < 76.2 ? "???" : fmt(v6) + (t > 77.3 ? "+" : "")}</span>
        </div>
        <div style={{ display: "inline-block", marginTop: 18, transform: `scale(${entra(t, 77.15, 0.3) * 1})`, fontWeight: 900, fontSize: 110, color: "#FFD84A", textShadow: `0 0 40px #FFD84A, 0 8px 0 #2B0F66` }}>+10×</div>
        <div style={{ marginTop: 6, opacity: entra(t, 74.9) }}>
          <span style={{ fontWeight: 800, fontSize: 24, letterSpacing: 2, color: "#111", background: "#E2B8FF", borderRadius: 8, padding: "4px 12px" }}>SEGUNDO AS PRÉVIAS</span>
        </div>
      </div>
    </AbsoluteFill>
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
const REACOES = [8.85, 11.05, 42.8, 78.8, 80.1];
const JANELAS: [number, number][] = [
  [4.9, 12.05], // "esses são os problemas... fica até o final"
  [42.7, 45.2], // re-gancho
  [78.6, 82.9], // reviravolta
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
const Faltam: React.FC<{ t: number }> = ({ t }) => {
  if (t < 4.9 || emSetup(t)) return null;
  const k = entra(t, 4.9, 0.35);
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
const DESTAQUE = /^(13|anos|lança-foguete|bolso|acabou|GTA|5|6|problemas|corrigiu|número|um|absurdo|final|mentira|enfeite|centenas|interiores|mágico|pistolas|armas|porta-malas|fuzil|polícia|papelão|encara|segue|conversa|armada|caça|vidente|viu|câmera|ficha|velha|tiroteio|arma|matar|cor|barriga|músculo|San|Andreas|55|mil|600|10|vezes|primeira|pessoa|Fase|Extra|Vyce|esperava)$/i;
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
  { s: "carimbo", t: 3.25, v: 0.55 },
  { s: "whoosh", t: 4.85, v: 0.4 },
  { s: "carimbo", t: 10.95, v: 0.5 },
  ...ITENS.map((i) => ({ s: "dum", t: i.de - 0.05, v: 0.6 })),
  { s: "dum", t: 42.7, v: 0.5 },
  { s: "dum", t: 70.25, v: 0.65 },
  { s: "carimbo", t: 77.1, v: 0.55 },
  { s: "dum", t: 78.6, v: 0.5 },
  { s: "whoosh", t: 82.85, v: 0.45 },
];

const DUCK: number[] = (() => {
  const bruto = Array.from({ length: DURACAO_FASE04 }, (_, i) => (falando(i / FPS) ? 0.42 : 1));
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

export const VideoFase04: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const corte = PLANOS.some((p) => t >= p.de && t < p.de + 2 / FPS) && !emSetup(t) ? 0.2 : 0;
  const flash = interpolate(t, [0, 0.05, 0.3], [0.35, 0.25, 0], cl) + interpolate(t, [3.25, 3.3, 3.6], [0, 0.55, 0], cl) + interpolate(t, [42.75, 42.8, 43.15], [0, 0.5, 0], cl) + interpolate(t, [70.3, 70.35, 70.75], [0, 0.6, 0], cl) + ITENS.reduce((m, i) => m + interpolate(t, [i.de, i.de + 0.04, i.de + 0.25], [0, 0.35, 0], cl), 0);
  const noFundo = !emSetup(t);
  // tremida de câmera nos impactos
  const tremor = [3.25, 42.75, 70.3, ...ITENS.map((i) => i.de)].reduce((m, a) => (t >= a ? Math.max(m, 1 - suave(t, a, a + 0.35)) : m), 0);
  const tx = Math.sin(t * 83) * 10 * tremor;
  const ty = Math.cos(t * 71) * 8 * tremor;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ transform: `translate(${tx}px,${ty}px) scale(1.02)` }}>
        {noFundo && <Fundo t={t} />}
        {noFundo && <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,4,24,.78) 0%, rgba(10,4,24,.15) 32%, rgba(10,4,24,.1) 55%, rgba(10,4,24,.82) 100%)" }} />}
      </AbsoluteFill>
      <Setup t={t} f={f} />

      {/* gancho */}
      <Bloco t={t} de={0.0} ate={3.2} gancho topo={560}>
        <P cor="#FFE0FA">13 ANOS COM UM</P>
        <G tam={128} cor="#FFD84A"><span style={{ whiteSpace: "nowrap" }}>LANÇA-FOGUETE</span></G>
        <G tam={150}>NO BOLSO</G>
      </Bloco>
      <Bloco t={t} de={3.27} ate={4.85} gancho topo={600}>
        <P>NO GTA 6</P>
        <G tam={200} cor={VERMELHO}>ACABOU.</G>
      </Bloco>
      <Bloco t={t} de={4.95} ate={12.0}>
        <P>OS PROBLEMAS DO</P>
        <G tam={130} cor="#FF9D9D">GTA 5</G>
        <P>QUE O</P>
        <G tam={130} cor="#B9FFC9">GTA 6 CORRIGIU</G>
        <Selo texto="Nº 1 É UM NÚMERO ABSURDO" cor="#FFD84A" t={t} de={8.85} />
        <div />
        <Selo texto="FICA ATÉ O FINAL" cor={ROSA} t={t} de={11.04} />
      </Bloco>

      <Cartao t={t} />
      <Pilulas t={t} de={19.7} ate={24.25} itens={[["LOJA", 19.76], ["SAGUÃO DE HOTEL", 20.33], ["TELHADO", 21.18], ["LOCAL DA MISSÃO CONTINUA ABERTO", 21.93]]} />
      <Pilulas t={t} de={26.5} ate={34.55} itens={[["2 PISTOLAS ESCONDIDAS", 26.53], ["2 ARMAS GRANDES À MOSTRA", 28.24], ["O RESTO: PORTA-MALAS", 29.76], ["FUZIL NA RUA = POLÍCIA", 31.49]]} />
      <Pilulas t={t} de={38.3} ate={42.7} itens={[["ENCARA", 38.35], ["SEGUE", 39.02], ["ESCUTA A CONVERSA", 39.82], ["TEM GENTE ARMADA", 41.02]]} />
      <Pilulas t={t} de={48.0} ate={50.5} itens={[["ALGUÉM VIU", 48.09], ["A VÍTIMA LIGOU", 48.82], ["CÂMERA PEGOU", 49.84]]} />
      <Pilulas t={t} de={50.6} ate={56.1} cor="#FFD84A" itens={[["FICHA: ROSTO", 52.13], ["ROUPA", 52.67], ["CARRO", 53.15], ["ARMA", 53.62], ["TROCOU DE ROUPA? FICHA VELHA", 54.13]]} />
      <Pilulas t={t} de={58.5} ate={62.4} itens={[["TIRA A ARMA DA MÃO", 58.78], ["BRAÇO E PERNA: DERRUBA SEM MATAR", 60.07]]} />
      <Pilulas t={t} de={65.9} ate={70.25} itens={[["COMEU DEMAIS: BARRIGA", 65.93], ["ACADEMIA: MÚSCULO", 67.76], ["IGUAL SAN ANDREAS", 69.35]]} />
      <Mira t={t} />

      {/* re-gancho */}
      <Bloco t={t} de={42.78} ate={45.2} gancho>
        <P>O PRÓXIMO MUDA</P>
        <G tam={150} cor="#FFB3EE">A CAÇADA</G>
      </Bloco>
      <Contador t={t} />
      {/* reviravolta */}
      <Bloco t={t} de={78.75} ate={82.9}>
        <Selo texto="MAS UMA COISA ELE TIROU" cor={VERMELHO} t={t} de={78.75} />
        {t > 80.0 && (
          <>
            <G tam={130}>SEM PRIMEIRA</G>
            <G tam={130} cor="#FF9D9D">PESSOA</G>
          </>
        )}
        {t > 81.58 && <P>SÓ NA MIRA DE ALGUMAS ARMAS</P>}
      </Bloco>

      <Faltam t={t} />
      <Facecam t={t} f={f} />
      <Legenda t={t} />

      <AbsoluteFill style={{ background: "#F5E9FF", opacity: Math.min(0.8, flash), pointerEvents: "none" }} />
      <AbsoluteFill style={{ background: "#000", opacity: corte, pointerEvents: "none" }} />

      <Audio src={staticFile("fase-extra/fase04/narracao.wav")} />
      <Audio src={staticFile("fase-extra/fase04/trilha.wav")} volume={(q) => 0.7 * (DUCK[q] ?? 1)} /> {/* música do trailer, 3 dB abaixo (pedido do usuário) */}
      {SONS.map((s, i) => (
        <Sequence key={i} from={Math.round(s.t * FPS)} durationInFrames={60}>
          <Audio src={staticFile(`fase-extra/sons/${s.s}.wav`)} volume={(q) => s.v * (falando(s.t + q / FPS) ? 0.3 : 1)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
