import { loadFont } from "@remotion/google-fonts/Montserrat";
import { AbsoluteFill, Audio, Easing, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Acabamento, PalcoCinema } from "../../cinema/Palco";
import { Camera } from "../Estudio";
import { QuartoGamer } from "../QuartoGamer";
import dados from "./dados.json";

// Fase Extra, Fase 22: "Faça isso ANTES de buscar a Lucia no GTA 6".
// ESTILO NOVO (pedido em 19/11/2026): claro, direto, pouco efeito. Uma ideia por tela: título curto em cima,
// gameplay em tela cheia com zoom lento (sem soco nem batida), legenda embaixo. Vyce só no final.
// Gameplay: só a parte do jogo do reel do Thalera (clipes/jogo.mp4, recortado sem o rosto e as legendas dele);
// src = segundo de clipes/jogo.mp4. Evitar 0–2.5 s (logo e texto dele), 48.5–51.5 (faixa "inscreva-se"), 89–90.5 e 121 s+ (só o rosto do criador).
const { fontFamily } = loadFont("normal", { weights: ["600", "800", "900"], subsets: ["latin"] });
export const FPS = 30;
const FIM = dados.duracao + 1.0;
export const DURACAO_FASE22 = Math.ceil(FIM * FPS);
const ROSA = "#FF4FD8";
const VERDE = "#4ADE80";
const AMARELO = "#FFD84A";
const AZUL = "#7CC8FF";
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const suave = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
const entra = (t: number, a: number, d = 0.3) => interpolate(t, [a, a + d], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) });
const sombra = "0 4px 22px rgba(0,0,0,.75)";
const ARQ = (n: string) => `fase-extra/fase22/${n}`;

// ---------- âncoras ----------
type Pal = { w: string; s: number; e: number };
const PAL = dados.palavras as Pal[];
const limpa = (w: string) => w.toLowerCase().replace(/[.,?!:…“”"]/g, "");
const em = (palavra: string, depois = 0) => PAL.find((p) => limpa(p.w) === palavra && p.s >= depois)?.s ?? 999;
const GUIA = em("faz");
const T1 = em("1");
const T2 = em("2", T1);
const T3 = em("3", T2);
const T4 = em("4", T3);
const T5 = em("5", T4);
const FECHO = em("aí", T5);
const iFase = PAL.findIndex((p) => limpa(p.w) === "fase" && p.s >= FECHO);
const INICIO_FINAL = iFase >= 3 ? PAL[iFase - 3].s : 999;
const ENQUETE = em("e", em("vyce", INICIO_FINAL)) - 0.1;
const emSetup = (t: number) => t >= INICIO_FINAL - 0.1;

// ---------- planos (src = segundo do reel) ----------
type Plano = { de: number; src: number; zoom?: number; zoom2?: number; oy?: number; vel?: number };
const PLANOS: Plano[] = [
  { de: 0, src: 53.0, zoom: 1.0, zoom2: 1.12 },
  { de: em("perdeu") - 0.1, src: 64.0, zoom: 1.0, zoom2: 1.1 },
  { de: GUIA - 0.1, src: 4.5, zoom: 1.05, zoom2: 1.15 },
  { de: T1 - 0.1, src: 52.0, zoom: 1.0, zoom2: 1.12 },
  { de: em("pincel", T1) - 0.1, src: 56.0, zoom: 1.05, zoom2: 1.15 },
  { de: em("coração", T1) - 0.1, src: 65.5, zoom: 1.0, zoom2: 1.1 },
  { de: em("depois", T1) - 0.1, src: 58.5, zoom: 1.0, zoom2: 1.1 },
  { de: T2 - 0.1, src: 13.3, zoom: 1.0, zoom2: 1.12 },
  { de: em("flores", T2) - 0.1, src: 44.0, zoom: 1.0, zoom2: 1.1 },
  { de: em("carro", T2) - 0.1, src: 69.0, zoom: 1.0, zoom2: 1.12 },
  { de: T3 - 0.1, src: 3.3, zoom: 1.0, zoom2: 1.12 },
  { de: em("saco", T3) - 0.1, src: 34.5, zoom: 1.0, zoom2: 1.12 },
  { de: em("só", T3) - 0.1, src: 10.8, zoom: 1.0, zoom2: 1.1 },
  { de: T4 - 0.1, src: 70.0, zoom: 1.0, zoom2: 1.1 },
  { de: em("salva", T4) - 0.1, src: 74.2, zoom: 1.0, zoom2: 1.15 },
  { de: em("bateu", T4) - 0.1, src: 84.5, zoom: 1.0, zoom2: 1.12 },
  { de: T5 - 0.1, src: 39.8, vel: 0.7, zoom: 1.0, zoom2: 1.15 },
  { de: FECHO - 0.1, src: 62.3, zoom: 1.0, zoom2: 1.1 },
  { de: em("apaixonados", FECHO) - 0.2, src: 64.3, zoom: 1.0, zoom2: 1.08 },
];
const planoEm = (t: number) => {
  let i = -1;
  while (i + 1 < PLANOS.length && PLANOS[i + 1].de <= t) i++;
  return i;
};
const Fundo: React.FC<{ t: number }> = ({ t }) => {
  const i = planoEm(t);
  if (i < 0) return null;
  const p = PLANOS[i];
  const fim = Math.min(PLANOS[i + 1]?.de ?? FIM, INICIO_FINAL + 0.3);
  if (t > fim) return null;
  const k = interpolate(t, [p.de, fim], [0, 1], { ...cl, easing: Easing.inOut(Easing.sin) });
  const z = interpolate(k, [0, 1], [p.zoom ?? 1, p.zoom2 ?? 1.1]);
  const dur = Math.max(1, Math.round((fim - p.de) * FPS) + 2);
  return (
    <Sequence key={i} from={Math.round(p.de * FPS)} durationInFrames={dur} layout="none">
      <AbsoluteFill style={{ overflow: "hidden", background: "#000" }}>
        <OffthreadVideo src={staticFile(ARQ("clipes/jogo.mp4"))} startFrom={Math.round(p.src * FPS)} playbackRate={p.vel ?? 1} muted style={{ position: "absolute", width: 1080, height: 1920, transform: `scale(${z})`, transformOrigin: `50% ${p.oy ?? 50}%`, filter: "brightness(1.08) saturate(1.08)" }} />
      </AbsoluteFill>
    </Sequence>
  );
};

// ---------- título de cada tela (uma ideia só) ----------
type Tela = { de: number; ate: number; rotulo?: string; cor: string; titulo: string[] };
const TELAS: Tela[] = [
  { de: 0.05, ate: GUIA - 0.05, rotulo: "GTA 6 · CAPÍTULO 1", cor: ROSA, titulo: ["ANTES DE", "BUSCAR A LUCIA"] },
  { de: GUIA, ate: T1 - 0.05, cor: AMARELO, titulo: ["5 COISAS", "PRA FAZER"] },
  { de: T1, ate: T2 - 0.05, rotulo: "1", cor: VERDE, titulo: ["CONSERTA", "A CASA"] },
  { de: T2, ate: T3 - 0.05, rotulo: "2", cor: ROSA, titulo: ["ARRUMA TUDO", "PRA ELA"] },
  { de: T3, ate: T4 - 0.05, rotulo: "3", cor: AZUL, titulo: ["TREINA NA", "VARANDA"] },
  { de: T4, ate: T5 - 0.05, rotulo: "4", cor: AMARELO, titulo: ["SALVA O", "NÚMERO DO JOEY"] },
  { de: T5, ate: FECHO - 0.05, rotulo: "5", cor: VERDE, titulo: ["O ESCONDERIJO", "DO DINHEIRO"] },
  { de: FECHO, ate: INICIO_FINAL - 0.1, cor: ROSA, titulo: ["JÁ COMEÇA", "APAIXONADO ❤️"] },
];
const Titulos: React.FC<{ t: number }> = ({ t }) => {
  const tela = TELAS.find((x) => t >= x.de - 0.05 && t < x.ate);
  if (!tela) return null;
  const k = entra(t, tela.de, 0.35);
  const s = suave(t, tela.ate - 0.2, tela.ate);
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: 250, fontFamily, opacity: k * (1 - s), transform: `translateY(${(1 - k) * 24}px)` }}>
      {tela.rotulo && (
        <div style={{ display: "inline-block", fontWeight: 900, fontSize: tela.rotulo.length < 3 ? 64 : 32, letterSpacing: tela.rotulo.length < 3 ? 0 : 8, color: "#111", background: tela.cor, borderRadius: 14, padding: tela.rotulo.length < 3 ? "0 26px" : "6px 16px", marginBottom: 14 }}>{tela.rotulo}</div>
      )}
      {tela.titulo.map((l) => (
        <div key={l} style={{ fontWeight: 900, fontSize: 104, lineHeight: 0.98, letterSpacing: -1, color: "#fff", textShadow: sombra }}>
          {l}
        </div>
      ))}
    </div>
  );
};

// ---------- Vyce no quarto gamer + enquete ----------
const boca = (f: number) => (dados.boca as number[])[f] ?? 0;
const pisca = (t: number) => {
  const c = t % 4.3;
  return c > 1.4 && c < 1.52;
};
const OPCOES: [string, string, number, string][] = [
  ["🏠", "JÁ FIZ TUDO", em("fez", ENQUETE), VERDE],
  ["😭", "JÁ BUSQUEI A LUCIA", em("buscou", ENQUETE), ROSA],
];
const Linha: React.FC<{ t: number; de: number; ic: string; txt: string; cor: string }> = ({ t, de, ic, txt, cor }) => {
  const k = entra(t, de);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 14, opacity: k, width: "fit-content", background: "rgba(14,8,30,.8)", borderLeft: `8px solid ${cor}`, borderRadius: 12, padding: "10px 22px 10px 18px" }}>
      <span style={{ fontSize: 48 }}>{ic}</span>
      <span style={{ fontWeight: 900, fontSize: 42, color: "#fff", whiteSpace: "nowrap" }}>{txt}</span>
    </div>
  );
};
const Setup: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const a = INICIO_FINAL;
  if (t < a - 0.3) return null;
  const k = suave(t, a - 0.3, a + 0.2);
  const olha = suave(t, a + 0.25, a + 0.7);
  const pos: [number, number, number] = [0.45 - (t - a) * 0.06, 1.5, 3.6 - (t - a) * 0.1];
  const troca = suave(t, ENQUETE - 0.2, ENQUETE + 0.1);
  return (
    <AbsoluteFill style={{ opacity: k }}>
      <Sequence from={Math.round(a * FPS) - 10} layout="none">
        <PalcoCinema ceu="estudio" fundo="#0B1016" fov={45} luzCeu={0.2} brilhoCeu={0.03}>
          <Camera pos={pos} alvo={[-0.5, 1.12, -0.15]} />
          <QuartoGamer t={t} boca={boca(f)} pisca={pisca(t)} olhaCamera={olha} />
          <Acabamento foco={Math.hypot(pos[0] + 0.2, pos[1] - 1.3, pos[2])} desfoque={4} brilho={0.8} saturacao={0.15} contraste={0.12} vinheta={0.45} ao={0} />
        </PalcoCinema>
      </Sequence>
      <div style={{ position: "absolute", top: 230, left: 70, right: 70, fontFamily, opacity: entra(t, a + 0.2) * (1 - troca) }}>
        <div style={{ fontWeight: 800, fontSize: 32, letterSpacing: 8, color: "#E2C4FF", textShadow: sombra }}>VOCÊ ESTÁ NA</div>
        <div style={{ fontWeight: 900, fontSize: 108, color: "#fff", textShadow: sombra }}>FASE EXTRA</div>
      </div>
      <div style={{ position: "absolute", top: 210, left: 70, right: 70, fontFamily, opacity: troca }}>
        <div style={{ fontWeight: 800, fontSize: 32, letterSpacing: 8, color: "#E2C4FF", textShadow: sombra }}>E VOCÊ?</div>
        {OPCOES.map(([ic, nome, d, cor], i) => (
          <Linha key={i} t={t} de={d} ic={ic} txt={`${i + 1} · ${nome}`} cor={cor} />
        ))}
      </div>
      <div style={{ position: "absolute", top: 1090, left: 70, fontFamily, fontWeight: 900, fontSize: 44, color: "#fff", textShadow: sombra, opacity: entra(t, a + 1.7) }}>@faseextra.br</div>
    </AbsoluteFill>
  );
};

// ---------- legenda ----------
const DESTAQUE = /^(lucia|sempre|5|casa|pincel|graça|coração|geladeira|flores|colar|carro|varanda|vida|saco|fôlego|perde|joey|número|tábuas|dinheiro|apaixonados|fase|extra|vyce|comenta)$/i;
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
  const i = BLOCOS.findIndex((b, j) => t >= b[0].s - 0.05 && t < Math.min(BLOCOS[j + 1]?.[0].s ?? 999, b[b.length - 1].e + 0.5) - 0.05);
  if (i < 0) return null;
  const topo = emSetup(t) ? 1420 : 1540;
  return (
    <div style={{ position: "absolute", top: topo, left: 60, right: 60, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 20px" }}>
      {BLOCOS[i].map((p, j) => (
        <span key={j} style={{ fontFamily, fontWeight: 900, fontSize: 66, lineHeight: 1.1, color: DESTAQUE.test(limpa(p.w)) ? AMARELO : "#fff", opacity: t >= p.s - 0.03 ? 1 : 0, WebkitTextStroke: "10px #000", paintOrder: "stroke fill" }}>
          {p.w.replace(/[.,:!]$/, "")}
        </span>
      ))}
    </div>
  );
};

// ---------- som: voz + música baixa (sem efeito sonoro) ----------
const falando = (t: number) => PAL.some((p) => t >= p.s - 0.04 && t <= p.e + 0.04);
const DUCK: number[] = (() => {
  const bruto = Array.from({ length: DURACAO_FASE22 }, (_, i) => (falando(i / FPS) ? 0.42 : 1));
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

export const VideoFase22: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {!emSetup(t) && <Fundo t={t} />}
      {!emSetup(t) && <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.6) 0%, rgba(0,0,0,.15) 32%, rgba(0,0,0,0) 50%, rgba(0,0,0,.45) 100%)" }} />}
      <Setup t={t} f={f} />
      {!emSetup(t) && <Titulos t={t} />}
      <Legenda t={t} />
      <Audio src={staticFile(ARQ("narracao.wav"))} />
      <Audio src={staticFile(ARQ("trilha.wav"))} volume={(q) => 0.63 * (DUCK[q] ?? 1)} />
    </AbsoluteFill>
  );
};
