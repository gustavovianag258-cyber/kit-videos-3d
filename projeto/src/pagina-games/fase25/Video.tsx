import { loadFont } from "@remotion/google-fonts/Montserrat";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, Audio, Easing, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { Camera } from "../Estudio";
import { Mascote3D, PoseMascote } from "../Mascote3D";
import dados from "./dados.json";
import davy from "./davy.json";

// Fase Extra, Fase 25: "Um cachorro de jet ski resgatou o Davy Jones no GTA 6".
// Base: corte da live do Davy Jones (reel do @nexcortz, Df5pnVyOD0U). clipes/live.mp4 = webcam dele em cima (0–616)
// + jogo recortado do meio embaixo (616–1920), legendas do jogo (cortadas nas bordas) borradas.
// Igual à Fase 24 aprovada: gancho contínuo que promete o "onde achar", áudio da live baixinho por baixo,
// e nas reações do Davy a narração PARA (buracos em davy.json) e a voz dele entra alta, com a fala na tela.
// Música leve de verão: "My Last Mojito" (Mixkit 814, Michael Ramir C.). Vyce só no final, dentro do GTA.
const { fontFamily } = loadFont("normal", { weights: ["600", "800", "900"], subsets: ["latin"] });
export const FPS = 30;
const FIM = dados.duracao + 1.0;
export const DURACAO_FASE25 = Math.ceil(FIM * FPS);
const AZUL = "#5FE3FF";
const VERDE = "#7CFF9B";
const AMARELO = "#FFD84A";
const VERMELHO = "#FF3B3B";
const LARANJA = "#FF9B3D";
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const suave = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
const entra = (t: number, a: number, d = 0.3) => interpolate(t, [a, a + d], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) });
const sombra = "0 4px 22px rgba(0,0,0,.8)";
const ARQ = (n: string) => `fase-extra/fase25/${n}`;

// ---------- âncoras ----------
type Pal = { w: string; s: number; e: number };
const PAL = dados.palavras as Pal[];
const limpa = (w: string) => w.toLowerCase().replace(/[.,?!:…“”"]/g, "");
const em = (palavra: string, depois = 0) => PAL.find((p) => limpa(p.w) === palavra && p.s >= depois)?.s ?? 999;
type Buraco = { de: number; src: number; dur: number };
const DAVY = davy as Buraco[];
const G = DAVY.map((g) => g.de);
const QUEM = em("quem");
const FINALG = em("final");
const NADANDO = em("ele", FINALG);
const MIRAGEM = em("e", G[0]);
const OCULOS = em("óculos", MIRAGEM);
const ATE = em("até", G[1]);
const SOBE = em("ele", G[2]);
const JOGO = em("no", G[3]);
const GALERA = em("galera", JOGO);
const RESGATA = em("ele", GALERA);
const SEGUNDO = em("e", em("mar", RESGATA));
const ILHA = em("ilha", SEGUNDO);
const CARTEIRA = em("e", em("cachorro", ILHA));
const COMO = em("como", CARTEIRA);
const NAODESCE = em("e", em("lento", COMO));
const FINAL = em("você", G[4]) - 0.15;
const ENQ = em("e", em("vyce", FINAL));
const VOL_DAVY = [0.4, 0.47, 0.87, 0.34, 0.31];
const FUNDO_LIVE = 0.06;

// ---------- planos (src = segundo de clipes/live.mp4) ----------
type Plano = { de: number; src: number; vel?: number; z?: number; oy?: number; vol?: number };
const PLANOS: Plano[] = [
  { de: 0, src: 49.0 },
  { de: QUEM - 0.1, src: 33.6, z: 1.08, oy: 62 },
  { de: FINALG - 0.1, src: 52.6 },
  { de: NADANDO - 0.1, src: 0.6 },
  { de: G[0], src: DAVY[0].src, vol: VOL_DAVY[0], z: 1.12, oy: 64 },
  { de: MIRAGEM - 0.1, src: 10.4, z: 1.35, oy: 62 },
  { de: OCULOS - 0.1, src: 34.6, z: 1.1, oy: 62 },
  { de: G[1], src: DAVY[1].src, vol: VOL_DAVY[1], z: 1.15, oy: 64 },
  { de: ATE - 0.1, src: 19.6, z: 1.2, oy: 64 },
  { de: em("e", ATE + 1) - 0.1, src: 23.6, z: 1.25, oy: 62 },
  { de: G[2], src: DAVY[2].src, vol: VOL_DAVY[2], z: 1.15, oy: 62 },
  { de: SOBE - 0.1, src: 31.0 },
  { de: G[3], src: DAVY[3].src, vol: VOL_DAVY[3] },
  { de: JOGO - 0.1, src: 46.2 },
  { de: GALERA - 0.1, src: 50.0 },
  { de: RESGATA - 0.1, src: 53.0 },
  { de: SEGUNDO - 0.1, src: 55.6 },
  { de: ILHA - 0.1, src: 59.2 },
  { de: CARTEIRA - 0.1, src: 61.0 },
  { de: COMO - 0.1, src: 0.0 },
  { de: em("partridge", COMO) - 0.1, src: 42.6 },
  { de: NAODESCE - 0.1, src: 44.6 },
  { de: G[4], src: DAVY[4].src, vol: VOL_DAVY[4] },
];
const planoEm = (t: number) => {
  let i = -1;
  while (i + 1 < PLANOS.length && PLANOS[i + 1].de <= t) i++;
  return i;
};
const Live: React.FC<{ t: number }> = ({ t }) => {
  const i = planoEm(t);
  if (i < 0 || t > FINAL + 0.3) return null;
  const p = PLANOS[i];
  const fim = Math.min(PLANOS[i + 1]?.de ?? FIM, FINAL + 0.3);
  const k = interpolate(t, [p.de, fim], [0, 1], { ...cl, easing: Easing.inOut(Easing.sin) });
  const z0 = p.z ?? 1;
  const z = z0 + 0.05 * k;
  const dur = Math.max(1, Math.round((fim - p.de) * FPS) + 2);
  return (
    <Sequence key={i} from={Math.round(p.de * FPS)} durationInFrames={dur} layout="none">
      <AbsoluteFill style={{ background: "#000" }}>
        {/* jogo (parte de baixo), com zoom próprio */}
        <AbsoluteFill style={{ top: 616, overflow: "hidden" }}>
          <OffthreadVideo src={staticFile(ARQ("clipes/live.mp4"))} startFrom={Math.round(p.src * FPS)} playbackRate={p.vel ?? 1} volume={p.vol ?? FUNDO_LIVE} style={{ position: "absolute", top: -616, width: 1080, height: 1920, transform: `scale(${z})`, transformOrigin: `50% ${p.oy ?? 66}%` }} />
        </AbsoluteFill>
        {/* webcam do Davy (parte de cima), sem zoom */}
        <AbsoluteFill style={{ height: 616, overflow: "hidden" }}>
          <OffthreadVideo src={staticFile(ARQ("clipes/live.mp4"))} startFrom={Math.round(p.src * FPS)} playbackRate={p.vel ?? 1} muted style={{ position: "absolute", width: 1080, height: 1920 }} />
        </AbsoluteFill>
        <div style={{ position: "absolute", top: 612, left: 0, right: 0, height: 8, background: "rgba(0,0,0,.6)" }} />
      </AbsoluteFill>
    </Sequence>
  );
};

// ---------- título (logo abaixo da webcam) ----------
type Tela = { de: number; ate: number; rotulo?: string; cor: string; titulo: string; vivo?: boolean };
const TELAS: Tela[] = [
  { de: 0.05, ate: FINALG - 0.05, cor: VERMELHO, titulo: "RESGATADO POR UM CACHORRO", vivo: true },
  { de: FINALG, ate: NADANDO - 0.05, rotulo: "NO FINAL", cor: VERMELHO, titulo: "ONDE ACHAR 📍" },
  { de: NADANDO, ate: G[0] - 0.05, cor: AZUL, titulo: "SEM BARCO NENHUM" },
  { de: MIRAGEM, ate: G[1] - 0.05, cor: AMARELO, titulo: "DE ÓCULOS ESCUROS 😎" },
  { de: ATE, ate: G[2] - 0.05, cor: AMARELO, titulo: "SÓ ESPERANDO ELE SUBIR" },
  { de: SOBE, ate: G[3] - 0.05, cor: VERDE, titulo: "JASON NA GARUPA 🐶" },
  { de: JOGO, ate: GALERA - 0.05, rotulo: "NO JOGO EM PORTUGUÊS", cor: AMARELO, titulo: "CACHORRO MANEIRO" },
  { de: GALERA, ate: SEGUNDO - 0.05, rotulo: "LÁ FORA", cor: AZUL, titulo: "COOL DOG" },
  { de: SEGUNDO, ate: COMO - 0.05, rotulo: "SEGUNDO QUEM JÁ FOI", cor: VERDE, titulo: "ILHA DOS CACHORROS" },
];
const Titulos: React.FC<{ t: number }> = ({ t }) => {
  const tela = TELAS.find((x) => t >= x.de - 0.05 && t < x.ate);
  if (!tela) return null;
  const k = entra(t, tela.de, 0.3);
  const s = suave(t, tela.ate - 0.15, tela.ate);
  const n = tela.titulo.length;
  return (
    <div style={{ position: "absolute", left: 30, right: 30, top: 650, textAlign: "center", fontFamily, opacity: k * (1 - s), transform: `translateY(${(1 - k) * 20}px) scale(${0.94 + 0.06 * k})` }}>
      {tela.vivo && (
        <div style={{ display: "inline-flex", alignItems: "center", gap: 12, fontWeight: 900, fontSize: 34, letterSpacing: 6, color: "#fff", background: VERMELHO, borderRadius: 10, padding: "4px 18px", marginBottom: 10 }}>
          <span style={{ width: 18, height: 18, borderRadius: 9, background: "#fff", opacity: Math.sin(t * 7) > 0 ? 1 : 0.25 }} />
          AO VIVO
        </div>
      )}
      {tela.rotulo && <div style={{ fontWeight: 800, fontSize: 32, letterSpacing: 8, color: tela.cor, WebkitTextStroke: "6px #000", paintOrder: "stroke fill", marginBottom: 4 }}>{tela.rotulo}</div>}
      <div style={{ fontWeight: 900, fontSize: n > 20 ? 70 : n > 15 ? 82 : 100, lineHeight: 1, letterSpacing: -1, color: "#fff", WebkitTextStroke: "8px #000", paintOrder: "stroke fill", textShadow: sombra }}>{tela.titulo}</div>
    </div>
  );
};

// ---------- onde achar (cumpre a promessa do gancho) ----------
const ITENS: [string, string, string, string][] = [
  ["1", "VAI PRO MAR ABERTO", "barco", AZUL],
  ["2", "PULA NA ÁGUA E ESPERA O LATIDO", "pula", AZUL],
  ["📍", "PARTRIDGE BAY · LUMMOX COUNTY", "partridge", VERDE],
  ["📍", "GAMBIT BAY · KEY LENTO", "gambit", VERDE],
  ["⚠", "NÃO DESCE NO MEIO DO CAMINHO", "não", LARANJA],
];
const OndeAchar: React.FC<{ t: number }> = ({ t }) => {
  if (t < COMO - 0.1 || t > G[4]) return null;
  const k = entra(t, COMO, 0.35);
  const s = suave(t, G[4] - 0.25, G[4]);
  return (
    <AbsoluteFill style={{ fontFamily, opacity: k * (1 - s) }}>
      <AbsoluteFill style={{ top: 616, background: "rgba(4,12,22,.5)" }} />
      <div style={{ position: "absolute", top: 650, left: 60, right: 60 }}>
        <div style={{ fontWeight: 800, fontSize: 32, letterSpacing: 8, color: AZUL, WebkitTextStroke: "6px #000", paintOrder: "stroke fill" }}>COMO EU PROMETI</div>
        <div style={{ fontWeight: 900, fontSize: 96, lineHeight: 1, color: "#fff", WebkitTextStroke: "8px #000", paintOrder: "stroke fill", marginBottom: 16 }}>ONDE ACHAR 📍</div>
        {ITENS.map(([n, txt, pal, cor], i) => {
          const de = pal === "não" ? NAODESCE : em(pal, COMO) - 0.15;
          const kk = entra(t, de, 0.3);
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 16, opacity: kk, transform: `translateX(${(1 - kk) * -40}px)`, background: "rgba(6,14,26,.86)", borderLeft: `8px solid ${cor}`, borderRadius: 14, padding: "12px 22px" }}>
              <span style={{ fontWeight: 900, fontSize: 46, color: cor, width: 52, textAlign: "center" }}>{n}</span>
              <span style={{ fontWeight: 900, fontSize: 42, color: "#fff", lineHeight: 1.1 }}>{txt}</span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------- final: o Vyce DENTRO do GTA (no mar, com o jet ski) ----------
const boca = (f: number) => (dados.boca as number[])[f] ?? 0;
const pisca = (t: number) => {
  const c = t % 4.3;
  return c > 1.4 && c < 1.52;
};
const OPCOES: [string, string, string, string][] = [
  ["1", "🐶", "SUBIA NO JET SKI", AMARELO],
  ["2", "🏊", "NADAVA DE VOLTA", AZUL],
];
const VyceNoGta: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  if (t < FINAL - 0.2) return null;
  const k = suave(t, FINAL - 0.2, FINAL + 0.3);
  const fala = Math.sin(t * 5.5);
  const aponta = suave(t, ENQ - 0.2, ENQ + 0.1) * (1 - suave(t, ENQ + 1.6, ENQ + 1.9));
  const pose: PoseMascote = {
    bracoD: [-0.3 - 0.9 * aponta, 0, 0.35 + 0.12 * fala + 0.9 * aponta],
    bracoE: [-0.25, 0, -0.3 - 0.1 * Math.sin(t * 4.3)],
    cotoveloD: 0.9 - 0.6 * aponta,
    cotoveloE: 0.8,
    tronco: 0.03 * Math.sin(t * 2.4),
    cabeca: [0.04 * Math.sin(t * 3.1), 0.08 * Math.sin(t * 1.3), 0.04 * Math.sin(t * 2.2)],
  };
  const fov = (2 * Math.atan(1920 / 560 / 2 / 6) * 180) / Math.PI;
  return (
    <AbsoluteFill style={{ opacity: k, background: "#000", overflow: "hidden" }}>
      <Sequence from={Math.round((FINAL - 0.2) * FPS)} layout="none">
        {/* só o jogo (616–1920) ampliado pra tela toda */}
        <OffthreadVideo src={staticFile(ARQ("clipes/live.mp4"))} startFrom={Math.round(58.8 * FPS)} muted style={{ position: "absolute", width: 1080, height: 1920, transform: `scale(${1.52 + 0.04 * suave(t, FINAL, FIM)})`, transformOrigin: "50% 100%" }} />
      </Sequence>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.55) 0%, rgba(0,0,0,.12) 35%, rgba(0,0,0,0) 60%, rgba(0,0,0,.3) 100%)" }} />
      <AbsoluteFill>
        <ThreeCanvas width={1080} height={1920} camera={{ fov, near: 0.05, far: 50 }} gl={{ toneMapping: THREE.ACESFilmicToneMapping, antialias: true, alpha: true }}>
          <Camera pos={[0, 1.2, 6]} alvo={[0, 1.05, 0]} />
          <hemisphereLight args={["#DCEBFF", "#C8B48C", 1.15]} />
          <directionalLight position={[-2, 5, 4]} intensity={2.3} color="#FFF6E6" />
          <directionalLight position={[2.5, 3, -2]} intensity={1.4} color="#FFE6C4" />
          <Mascote3D pos={[0.05, -0.62 * (1 - suave(t, FINAL - 0.1, FINAL + 0.35)) - 0.52, 0]} giro={-0.08 + 0.05 * Math.sin(t * 0.9)} pose={pose} boca={boca(f)} pisca={pisca(t)} olhar={0.6} sorriso />
        </ThreeCanvas>
      </AbsoluteFill>
      <div style={{ position: "absolute", top: 230, left: 70, right: 70, fontFamily, color: "#fff" }}>
        <div style={{ fontWeight: 800, fontSize: 32, letterSpacing: 8, color: "#E2C4FF", textShadow: sombra, opacity: entra(t, FINAL) }}>VOCÊ ESTÁ NA FASE EXTRA</div>
        <div style={{ fontWeight: 900, fontSize: 92, lineHeight: 1, textShadow: sombra, opacity: entra(t, ENQ - 0.2) }}>E VOCÊ?</div>
        <div style={{ marginTop: 10 }}>
          {OPCOES.map(([n, ic, txt, cor], i) => {
            const kk = entra(t, em(i === 0 ? "subia" : "ou", ENQ) - 0.15);
            return (
              <div key={n} style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 14, opacity: kk, transform: `translateX(${(1 - kk) * -40}px)`, width: "fit-content", background: "rgba(10,6,20,.8)", borderLeft: `8px solid ${cor}`, borderRadius: 12, padding: "8px 22px 8px 16px" }}>
                <span style={{ fontWeight: 900, fontSize: 42, color: cor }}>{n}</span>
                <span style={{ fontSize: 44 }}>{ic}</span>
                <span style={{ fontWeight: 900, fontSize: 42 }}>{txt}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 110, left: 0, right: 0, textAlign: "center", fontFamily, fontWeight: 900, fontSize: 44, color: "#fff", textShadow: sombra, opacity: entra(t, FINAL + 0.6) }}>FASE EXTRA · @faseextra.br</div>
    </AbsoluteFill>
  );
};

// ---------- legenda ----------
// falas do Davy nos buracos (tempo relativo ao início do buraco = segundo da live − src)
const FALAS: [number, number, number, string][] = [
  [0, 7.6, 10.2, "UM CACHORRO? O QUE É ISSO?"],
  [1, 15.5, 17.2, "UM CACHORRO DE JET SKI?"],
  [1, 17.2, 18.4, "O QUE É ISSO?"],
  [2, 28.0, 30.5, "VOCÊ QUER SUBIR?"],
  [3, 38.4, 40.24, "QUE P… É ESSA, GALERA?"],
  [3, 40.24, 44.5, "O QUE É ISSO, CARA?"],
  [3, 44.6, 46.0, "MUITO FODA!"],
  [4, 57.6, 58.7, "FODA!"],
];
const DESTAQUE = /^(davy|jones|mar|gta|6|cachorro|jet|ski|achar|oceano|barco|miragem|óculos|escuros|jason|doido|subir|garupa|maneiro|cool|dog|resgatar|ilha|secreta|carteira|dinheiro|latido|partridge|bay|lummox|county|gambit|key|lento|fase|extra|vyce|comenta)$/i;
const BLOCOS: Pal[][] = (() => {
  const b: Pal[][] = [];
  let c: Pal[] = [];
  PAL.forEach((p, i) => {
    c.push(p);
    const n = PAL[i + 1];
    if (c.length >= 3 || /[.,?!:…]$/.test(p.w) || !n || n.s - p.e > 0.35) {
      b.push(c);
      c = [];
    }
  });
  return b;
})();
const Legenda: React.FC<{ t: number }> = ({ t }) => {
  if (t >= FINAL) return null;
  const fala = FALAS.find(([g, a, b]) => t >= DAVY[g].de + (a - DAVY[g].src) && t < DAVY[g].de + (b - DAVY[g].src));
  if (fala) {
    const de = DAVY[fala[0]].de + (fala[1] - DAVY[fala[0]].src);
    const k = interpolate(t, [de, de + 0.22], [0, 1], { ...cl, easing: Easing.out(Easing.back(2)) });
    return (
      <div style={{ position: "absolute", top: 1560, left: 30, right: 30, textAlign: "center", fontFamily, transform: `scale(${0.7 + 0.3 * k})`, opacity: k }}>
        <div style={{ fontWeight: 800, fontSize: 30, letterSpacing: 6, color: "#fff", WebkitTextStroke: "6px #000", paintOrder: "stroke fill" }}>DAVY JONES:</div>
        <div style={{ fontWeight: 900, fontSize: fala[3].length > 18 ? 72 : 88, lineHeight: 1.05, color: AMARELO, WebkitTextStroke: "12px #000", paintOrder: "stroke fill" }}>“{fala[3]}”</div>
      </div>
    );
  }
  if (G.some((g, i) => t >= g && t < g + DAVY[i].dur)) return null;
  const i = BLOCOS.findIndex((b, j) => t >= b[0].s - 0.05 && t < Math.min(BLOCOS[j + 1]?.[0].s ?? 999, b[b.length - 1].e + 0.5) - 0.05);
  if (i < 0) return null;
  return (
    <div style={{ position: "absolute", top: 1600, left: 50, right: 50, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 18px" }}>
      {BLOCOS[i].map((p, j) => (
        <span key={j} style={{ fontFamily, fontWeight: 900, fontSize: 66, lineHeight: 1.1, color: DESTAQUE.test(limpa(p.w)) ? AMARELO : "#fff", opacity: t >= p.s - 0.03 ? 1 : 0, WebkitTextStroke: "10px #000", paintOrder: "stroke fill" }}>
          {p.w.replace(/[.,:!]$/, "")}
        </span>
      ))}
    </div>
  );
};

// ---------- som ----------
const falando = (t: number) => PAL.some((p) => t >= p.s - 0.04 && t <= p.e + 0.04);
const DUCK: number[] = (() => {
  const bruto = Array.from({ length: DURACAO_FASE25 }, (_, i) => {
    const t = i / FPS;
    if (DAVY.some((g) => t >= g.de - 0.1 && t < g.de + g.dur)) return 0.3;
    return falando(t) ? 0.5 : 0.85;
  });
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
const TROCAS = [NADANDO, MIRAGEM, ATE, SOBE, JOGO, GALERA, SEGUNDO, COMO, FINAL];
const SONS: [number, string, number][] = [
  ...TROCAS.map((q) => [q - 0.05, "whoosh", 0.12] as [number, string, number]),
  ...ITENS.map(([, , pal]) => [(pal === "não" ? NAODESCE : em(pal, COMO) - 0.15), "pop", 0.14] as [number, string, number]),
  [JOGO, "sino", 0.14],
];

export const VideoFase25: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Live t={t} />
      {t < FINAL + 0.3 && <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 74%, rgba(0,0,0,.45) 82%, rgba(0,0,0,.6) 100%)" }} />}
      <OndeAchar t={t} />
      <Titulos t={t} />
      <VyceNoGta t={t} f={f} />
      <Legenda t={t} />
      <Audio src={staticFile(ARQ("narracao.wav"))} />
      <Audio src={staticFile(ARQ("trilha.wav"))} volume={(q) => 0.5 * (DUCK[q] ?? 0.5)} />
      {SONS.map(([q, nome, vol], i) => (
        <Sequence key={i} from={Math.max(0, Math.round(q * FPS))} durationInFrames={60}>
          <Audio src={staticFile(nome === "whoosh" ? "fase-extra/sons/whoosh.wav" : ARQ(`sfx-${nome}.wav`))} volume={vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
