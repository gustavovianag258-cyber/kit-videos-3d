import { loadFont } from "@remotion/google-fonts/Montserrat";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { Camera } from "../Estudio";
import { CorPele, Mascote3D, PoseMascote } from "../Mascote3D";
import dados from "./dados.json";

// Fase Extra, Fase 43: "O NPC da garagem é o Jimmy do Bully?" — estilo de reel (cortes rápidos, zoom de impacto, legenda no meio,
// figurinhas que pulam, webcams dos streamers). Base: live do TioZero (YouTube YYwCbQMvI5s); estilo: reel do Game Cortes TV.
// clipes/jogo.mp4 = trechos da live emendados (TRECHOS), 30 fps, mudo. Falas dos streamers já emendadas na narracao.wav.
// fig/*.png = figurinhas (Jimmy, capa do Bully, Jason e Lucia) recortadas do reel. Liberado pelo usuário.
const { fontFamily } = loadFont("normal", { weights: ["600", "800", "900"], subsets: ["latin"] });
export const FPS = 30;
const FIM = dados.duracao + 1.2;
export const DURACAO_FASE43 = Math.ceil(FIM * FPS);
const AMARELO = "#FFD84A";
const AZUL = "#6FD6FF";
const AZUL_BULLY = "#1E3F8F";
const VERMELHO = "#FF4D4D";
const ROSA = "#FF7EB6";
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const suave = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
const entra = (t: number, a: number, d = 0.3) => interpolate(t, [a, a + d], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) });
const pula = (t: number, a: number) => interpolate(t, [a, a + 0.12, a + 0.22], [0, 1.15, 1], { ...cl });
const sombra = "0 4px 22px rgba(0,0,0,.85)";
const ARQ = (n: string) => `fase-extra/fase43/${n}`;

// trechos da live emendados em clipes/jogo.mp4: [início, fim] em segundos da live
const TRECHOS: [number, number][] = [[0, 12], [28, 40], [118, 140], [330, 346], [600, 606], [650, 700], [700, 735], [828, 845], [960, 985], [1685, 1700], [1745, 1778], [1955, 1968], [2160, 2175]];
const src = (s: number) => {
  let off = 0;
  for (const [a, b] of TRECHOS) {
    if (s >= a && s <= b) return off + (s - a);
    off += b - a;
  }
  return 0;
};

// ---------- âncoras ----------
type Pal = { w: string; s: number; e: number; davy?: boolean };
const PAL = dados.palavras as Pal[];
const limpa = (w: string) => w.toLowerCase().replace(/[.,?!:…“”"]/g, "");
const em = (palavra: string, depois = 0) => PAL.find((p) => !p.davy && limpa(p.w) === palavra && p.s >= depois)?.s ?? 999;
const DAVY = dados.davy as [number, number][];
const LEMBRA = em("lembra");
const ESCREVEU = em("escreveu");
const JL = em("j", ESCREVEU);
const TEORIA = em("a", em("livres"));
const BULLY1 = em("bully", TEORIA);
const QUANDO = em("quando");
const PORISSO = em("por", QUANDO);
const P1 = em("pista");
const P2 = em("pista", P1 + 1);
const P3 = em("pista", P2 + 1);
const BULL = em("bullworth", P2);
const QUINZE = em("15");
const HOJE = em("hoje");
const PROVA = em("e", em("garagem", P3));
const CABIDE = em("pendurada");
const AZULJ = em("azul", CABIDE);
const GALERA = em("que", em("bullworth", PROVA));
const MAS = em("a", DAVY[1][1]);
const PRAMIM = em("mas", MAS);
const FINAL = em("você", em("coincidência")) - 0.15;
const ENQ = em("e", em("vyce", FINAL));

// ---------- planos ----------
// "jogo": gameplay em tela cheia vertical (zoom de impacto no corte) · "fig": figurinha grande · "cams": as webcams dos streamers
type Plano = { de: number; tipo: "jogo" | "fig" | "cams"; s?: number; cx?: number; fig?: string };
const PLANOS: Plano[] = [
  // gancho (cortes rápidos)
  { de: 0, tipo: "jogo", s: 0.5 },
  { de: 1.1, tipo: "jogo", s: 30.0 },
  { de: 2.2, tipo: "jogo", s: 1763.0 },
  { de: em("jimmy") - 0.1, tipo: "fig", fig: "jimmy" },
  { de: em("e", em("bully")) - 0.1, tipo: "jogo", s: 659.0 },
  { de: em("ver") - 0.1, tipo: "jogo", s: 970.0 },
  { de: em("e", em("deles")) - 0.1, tipo: "jogo", s: 133.0 },
  { de: em("a", em("mostro")) - 0.1, tipo: "jogo", s: 655.0 },
  // J + L
  { de: LEMBRA - 0.1, tipo: "jogo", s: 1690.0 },
  { de: ESCREVEU - 0.1, tipo: "jogo", s: 337.0 },
  // a teoria
  { de: TEORIA - 0.1, tipo: "fig", fig: "jimmy" },
  { de: QUANDO - 0.1, tipo: "jogo", s: 1772.0 },
  { de: PORISSO - 0.1, tipo: "jogo", s: 1763.0 },
  // fala 1 dos streamers
  { de: DAVY[0][0] - 0.05, tipo: "cams", s: 975.8 },
  // pista 1 · bicicleta
  { de: P1 - 0.1, tipo: "jogo", s: 688.0 },
  { de: em("igualzinha") - 0.1, tipo: "jogo", s: 690.0 },
  // pista 2 · cores
  { de: P2 - 0.1, tipo: "jogo", s: 727.0 },
  { de: em("por", P2) - 0.1, tipo: "jogo", s: 836.0 },
  { de: em("nas", P2) - 0.1, tipo: "jogo", s: 683.0 },
  // pista 3 · idade
  { de: P3 - 0.1, tipo: "fig", fig: "jimmy" },
  { de: HOJE - 0.1, tipo: "jogo", s: 1772.0 },
  { de: em("a", em("35")) - 0.1, tipo: "jogo", s: 1690.0 },
  // a prova mais forte · a jaqueta
  { de: PROVA - 0.1, tipo: "jogo", s: 1755.0 },
  { de: CABIDE - 0.1, tipo: "jogo", s: 1757.0, cx: 1150 },
  { de: AZULJ - 0.1, tipo: "jogo", s: 1766.0, cx: 1180 },
  { de: GALERA - 0.1, tipo: "jogo", s: 1762.0, cx: 1150 },
  // fala 2 dos streamers
  { de: DAVY[1][0] - 0.05, tipo: "cams", s: 1962.5 },
  // mas...
  { de: MAS - 0.1, tipo: "jogo", s: 133.0 },
  { de: PRAMIM - 0.1, tipo: "jogo", s: 1763.0 },
  { de: em("é", em("mim")) - 0.1, tipo: "jogo", s: 2170.0 },
];
PLANOS.sort((a, b) => a.de - b.de);
const planoEm = (t: number) => {
  let i = -1;
  while (i + 1 < PLANOS.length && PLANOS[i + 1].de <= t) i++;
  return i;
};
const VIDEO = staticFile(ARQ("clipes/jogo.mp4"));
const W_CHEIO = (1920 / 1080) * 1920; // 3413: quadro 16:9 cobrindo a tela vertical

const Borrado: React.FC<{ s: number }> = ({ s }) => (
  <AbsoluteFill style={{ transform: "scale(1.15)" }}>
    <OffthreadVideo src={VIDEO} startFrom={Math.round(src(s) * FPS)} muted style={{ position: "absolute", left: -(W_CHEIO - 1080) / 2, top: 0, width: W_CHEIO, height: 1920, filter: "blur(30px) brightness(0.35)" }} />
  </AbsoluteFill>
);
// gameplay em tela cheia: começa 14% mais perto e "assenta" (zoom de impacto), tremidinha nos primeiros quadros
const Cheio: React.FC<{ s: number; cx: number; t: number; de: number; fim: number }> = ({ s, cx, t, de, fim }) => {
  const impacto = 1 + 0.14 * (1 - entra(t, de, 0.22));
  const deriva = 1 + 0.06 * suave(t, de, fim);
  const treme = t - de < 0.18 ? Math.sin((t - de) * 90) * 10 : 0;
  const left = 540 - (cx / 1920) * W_CHEIO;
  return (
    <AbsoluteFill style={{ transform: `scale(${impacto * deriva}) translateX(${treme}px)` }}>
      <OffthreadVideo src={VIDEO} startFrom={Math.round(src(s) * FPS)} muted style={{ position: "absolute", left: Math.min(0, Math.max(1080 - W_CHEIO, left)), top: 0, width: W_CHEIO, height: 1920 }} />
    </AbsoluteFill>
  );
};
// as webcams (na live: Zero em x 1652–1858 / y 165–395; Phoenix em y 488–718)
const Webcam: React.FC<{ s: number; y0: number; top: number; nome: string; t: number; de: number; atraso: number }> = ({ s, y0, top, nome, t, de, atraso }) => {
  const k = pula(t, de + atraso);
  const W = 560;
  const esc = W / 206;
  return (
    <div style={{ position: "absolute", left: 540 - W / 2, top, width: W, height: 230 * esc, borderRadius: 34, overflow: "hidden", border: `8px solid ${AMARELO}`, boxShadow: "0 20px 60px rgba(0,0,0,.7)", transform: `scale(${k}) rotate(${nome === "Zero" ? -2 : 2}deg)` }}>
      <OffthreadVideo src={VIDEO} startFrom={Math.round(src(s) * FPS)} muted style={{ position: "absolute", left: -1652 * esc, top: -y0 * esc, width: 1920 * esc, height: 1080 * esc }} />
    </div>
  );
};
const FIGS: Record<string, [number, number]> = { jimmy: [720, 770], bully: [345, 505], jl: [410, 410] };
const Figurona: React.FC<{ fig: string; t: number; de: number; fim: number }> = ({ fig, t, de, fim }) => {
  const [w0, h0] = FIGS[fig];
  const esc = Math.min(1000 / w0, 1080 / h0);
  const k = pula(t, de);
  const z = 1 + 0.06 * suave(t, de, fim);
  return (
    <div style={{ position: "absolute", left: 540 - (w0 * esc) / 2, top: 880 - (h0 * esc) / 2, width: w0 * esc, height: h0 * esc, borderRadius: 28, overflow: "hidden", border: "8px solid #fff", boxShadow: "0 30px 80px rgba(0,0,0,.75)", transform: `scale(${k * z}) rotate(-1.5deg)` }}>
      <Img src={staticFile(ARQ(`fig/${fig}.png`))} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};
const Fundo: React.FC<{ t: number }> = ({ t }) => {
  const i = planoEm(t);
  if (i < 0 || t > FINAL + 0.3) return null;
  const p = PLANOS[i];
  const fim = Math.min(PLANOS[i + 1]?.de ?? FIM, FINAL + 0.3);
  const dur = Math.max(1, Math.round((fim - p.de) * FPS) + 2);
  const sBg = p.s ?? 970.0;
  return (
    <Sequence key={i} from={Math.round(p.de * FPS)} durationInFrames={dur} layout="none">
      <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
        {p.tipo === "jogo" && <Cheio s={p.s ?? 0} cx={p.cx ?? 960} t={t} de={p.de} fim={fim} />}
        {p.tipo === "fig" && (
          <>
            <Borrado s={sBg} />
            <Figurona fig={p.fig ?? "jimmy"} t={t} de={p.de} fim={fim} />
          </>
        )}
        {p.tipo === "cams" && (
          <>
            <Borrado s={sBg} />
            <Webcam s={sBg} y0={165} top={250} nome="Zero" t={t} de={p.de} atraso={0} />
            <Webcam s={sBg} y0={488} top={900} nome="Phoenix" t={t} de={p.de} atraso={0.1} />
          </>
        )}
        {/* flash curto no corte */}
        <AbsoluteFill style={{ background: "#fff", opacity: 0.32 * (1 - entra(t, p.de, 0.14)) }} />
      </AbsoluteFill>
    </Sequence>
  );
};
const tipoEm = (t: number) => {
  const i = planoEm(t);
  return i >= 0 ? PLANOS[i].tipo : "jogo";
};

// ---------- figurinhas pequenas que pulam (embaixo da legenda) ----------
type Fig = { de: number; ate: number; img?: string; texto?: string; sub?: string; cor?: string };
const FIGURINHAS: Fig[] = [
  { de: JL - 0.05, ate: TEORIA - 0.1, img: "jl" },
  { de: BULLY1 - 0.05, ate: QUANDO - 0.1, img: "bully" },
  { de: BULL - 0.05, ate: P3 - 0.1, texto: "BULLWORTH", sub: "AZUL + AMARELO", cor: AZUL_BULLY },
  { de: QUINZE - 0.05, ate: HOJE - 0.1, texto: "15 ANOS", sub: "EM 2006", cor: AZUL_BULLY },
  { de: HOJE - 0.05, ate: PROVA - 0.1, texto: "~35 ANOS", sub: "HOJE", cor: VERMELHO },
];
const Figurinhas: React.FC<{ t: number }> = ({ t }) => {
  const f = FIGURINHAS.find((x) => t >= x.de && t < x.ate);
  if (!f) return null;
  const k = pula(t, f.de) * (1 - suave(t, f.ate - 0.12, f.ate));
  const balanco = Math.sin(t * 3) * 2;
  if (f.img) {
    const [w0, h0] = FIGS[f.img];
    const h = 360;
    const w = (w0 / h0) * h;
    return (
      <div style={{ position: "absolute", left: 540 - w / 2, top: 1120, width: w, height: h, borderRadius: 20, overflow: "hidden", border: "6px solid #fff", boxShadow: "0 16px 40px rgba(0,0,0,.7)", transform: `scale(${k}) rotate(${balanco}deg)` }}>
        <Img src={staticFile(ARQ(`fig/${f.img}.png`))} style={{ width: "100%", height: "100%" }} />
      </div>
    );
  }
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1130, display: "flex", justifyContent: "center", transform: `scale(${k}) rotate(${balanco}deg)` }}>
      <div style={{ background: f.cor, border: `6px solid ${AMARELO}`, borderRadius: 22, padding: "14px 36px", textAlign: "center", fontFamily, color: "#fff", boxShadow: "0 16px 40px rgba(0,0,0,.7)" }}>
        <div style={{ fontWeight: 900, fontSize: 76, lineHeight: 1 }}>{f.texto}</div>
        <div style={{ fontWeight: 800, fontSize: 38, letterSpacing: 4, color: AMARELO }}>{f.sub}</div>
      </div>
    </div>
  );
};

// ---------- rótulo do bloco (em cima, pequeno) ----------
type Tela = { de: number; ate: number; titulo: string; cor: string };
const TELAS: Tela[] = [
  { de: 0.05, ate: LEMBRA - 0.05, titulo: "O NPC É O JIMMY DO BULLY?", cor: AMARELO },
  { de: LEMBRA, ate: TEORIA - 0.05, titulo: "J + L SÃO LIVRES", cor: ROSA },
  { de: TEORIA, ate: DAVY[0][0] - 0.05, titulo: "A TEORIA", cor: AMARELO },
  { de: DAVY[0][0], ate: P1 - 0.05, titulo: "● AO VIVO", cor: VERMELHO },
  { de: P1, ate: P2 - 0.05, titulo: "PISTA 1 · A BICICLETA", cor: AZUL },
  { de: P2, ate: P3 - 0.05, titulo: "PISTA 2 · AS CORES", cor: AZUL },
  { de: P3, ate: PROVA - 0.05, titulo: "PISTA 3 · A IDADE", cor: AZUL },
  { de: PROVA, ate: DAVY[1][0] - 0.05, titulo: "A PROVA MAIS FORTE", cor: AMARELO },
  { de: DAVY[1][0], ate: MAS - 0.05, titulo: "● AO VIVO", cor: VERMELHO },
  { de: MAS, ate: FINAL - 0.1, titulo: "A ROCKSTAR NUNCA CONFIRMOU", cor: ROSA },
];
const Rotulo: React.FC<{ t: number }> = ({ t }) => {
  const tela = TELAS.find((x) => t >= x.de - 0.05 && t < x.ate);
  if (!tela) return null;
  const k = pula(t, tela.de);
  const s = suave(t, tela.ate - 0.12, tela.ate);
  const vivo = tela.titulo.startsWith("●");
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 150, display: "flex", justifyContent: "center", opacity: 1 - s }}>
      <div style={{ fontFamily, fontWeight: 900, fontSize: vivo ? 40 : 46, letterSpacing: 1, color: vivo ? "#fff" : "#111", background: tela.cor, borderRadius: 14, padding: "8px 22px", boxShadow: "0 10px 30px rgba(0,0,0,.6)", transform: `scale(${k}) rotate(-2deg)` }}>{tela.titulo}</div>
    </div>
  );
};

// ---------- legenda GRANDE no meio (estilo do reel), palavra-chave em amarelo; falas dos streamers em azul ----------
const DESTAQUE = /^(npc|maluco|garagem|gta|6|jimmy|bully|pistas|prova|forte|jogo|j|l|livres|teoria|controlado|jogador|npc|único|percebe|bicicleta|igualzinha|escola|cores|bullworth|azul|amarelo|15|2006|35|sozinho|cabide|jaqueta|rockstar|nunca|confirmou|universo|coincidência|possível|batendo|tudo|fase|extra|vyce|comenta)$/i;
const BLOCOS: Pal[][] = (() => {
  const b: Pal[][] = [];
  let c: Pal[] = [];
  PAL.forEach((p, i) => {
    c.push(p);
    const n = PAL[i + 1];
    if (c.length >= 3 || /[.,?!:…]$/.test(p.w) || !n || n.s - p.e > 0.35 || !!n.davy !== !!p.davy) {
      b.push(c);
      c = [];
    }
  });
  return b;
})();
const Legenda: React.FC<{ t: number }> = ({ t }) => {
  if (t >= FINAL) return null;
  const i = BLOCOS.findIndex((b, j) => t >= b[0].s - 0.05 && t < Math.min(BLOCOS[j + 1]?.[0].s ?? 999, b[b.length - 1].e + 0.5) - 0.05);
  if (i < 0) return null;
  const cams = tipoEm(t) === "cams";
  const k = pula(t, BLOCOS[i][0].s - 0.05);
  return (
    <div style={{ position: "absolute", top: cams ? 1560 : 880, left: 40, right: 40, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 20px", transform: `scale(${0.9 + 0.1 * k})` }}>
      {BLOCOS[i].map((p, j) => (
        <span key={j} style={{ fontFamily, fontWeight: 900, fontSize: 84, lineHeight: 1.05, textTransform: "uppercase", fontStyle: p.davy ? "italic" : "normal", color: p.davy ? AZUL : DESTAQUE.test(limpa(p.w)) ? AMARELO : "#fff", opacity: t >= p.s - 0.03 ? 1 : 0, WebkitTextStroke: "12px #000", paintOrder: "stroke fill", textShadow: "0 6px 18px rgba(0,0,0,.7)" }}>
          {p.w.replace(/[.,:!…]+$/, "")}
        </span>
      ))}
    </div>
  );
};

// ---------- final: o Vyce DENTRO do GTA, na garagem do NPC ----------
const boca = (f: number) => (dados.boca as number[])[f * 2] ?? 0; // boca calculada a 60/s
const pisca = (t: number) => {
  const c = t % 4.3;
  return c > 1.4 && c < 1.52;
};
const OPCOES: [string, string, string, string][] = [
  ["1", "🎒", "É O JIMMY", AZUL],
  ["2", "🤪", "SÓ UM NPC MALUCO", ROSA],
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
        <AbsoluteFill style={{ transform: `scale(${1 + 0.04 * suave(t, FINAL, FIM)})` }}>
          <OffthreadVideo src={VIDEO} startFrom={Math.round(src(970.0) * FPS)} muted style={{ position: "absolute", left: -(W_CHEIO - 1080) / 2, top: 0, width: W_CHEIO, height: 1920, filter: "blur(2px)" }} />
        </AbsoluteFill>
      </Sequence>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.65) 0%, rgba(0,0,0,.2) 35%, rgba(0,0,0,0) 60%, rgba(0,0,0,.35) 100%)" }} />
      <AbsoluteFill>
        <ThreeCanvas width={1080} height={1920} camera={{ fov, near: 0.05, far: 50 }} gl={{ toneMapping: THREE.ACESFilmicToneMapping, antialias: true, alpha: true }}>
          <Camera pos={[0, 1.2, 6]} alvo={[0, 1.05, 0]} />
          <hemisphereLight args={["#FFF1DE", "#4A3A2E", 1.1]} />
          <directionalLight position={[-2, 5, 4]} intensity={2.2} color="#FFF2DE" />
          <directionalLight position={[2.5, 3, -2]} intensity={1.3} color="#FFE2C0" />
          <CorPele.Provider value={{ pele: "#D9A584", funda: "#C48E6C" }}>
            <Mascote3D pos={[0.05, -0.62 * (1 - suave(t, FINAL - 0.1, FINAL + 0.35)) - 0.52, 0]} giro={-0.08 + 0.05 * Math.sin(t * 0.9)} pose={pose} boca={boca(f)} pisca={pisca(t)} olhar={0.6} sorriso />
          </CorPele.Provider>
        </ThreeCanvas>
      </AbsoluteFill>
      <div style={{ position: "absolute", top: 230, left: 70, right: 70, fontFamily, color: "#fff" }}>
        <div style={{ fontWeight: 800, fontSize: 32, letterSpacing: 8, color: "#E2C4FF", textShadow: sombra, opacity: entra(t, FINAL) }}>VOCÊ ESTÁ NA FASE EXTRA</div>
        <div style={{ fontWeight: 900, fontSize: 92, lineHeight: 1, textShadow: sombra, opacity: entra(t, ENQ - 0.2) }}>E VOCÊ?</div>
        <div style={{ marginTop: 10 }}>
          {OPCOES.map(([n, ic, txt, cor], i) => {
            const kk = entra(t, em(i === 0 ? "é" : "ou", ENQ) - 0.15);
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

// ---------- som: voz (com 2 falas dos streamers) + música de mistério (Fright Night, Mixkit 871) bem baixa + whoosh nos cortes + virais ----------
const VIRAL = (n: string) => `fase-extra/sons/virais/${n}.wav`;
const CORTES = PLANOS.map((p) => p.de).filter((q) => q > 0.5);
const SONS: [number, string, number][] = [
  ...CORTES.map((q) => [q - 0.03, "whoosh", 0.06] as [number, string, number]),
  ...[P1, P2, P3, PROVA].map((q) => [q + 0.02, "pop", 0.12] as [number, string, number]),
  [FINAL, "whoosh", 0.1],
  [TEORIA + 0.1, VIRAL("dexter-meme"), 0.14],
  [em("35") + 0.35, VIRAL("huh"), 0.16],
  [AZULJ + 0.25, VIRAL("magic-reveal"), 0.2],
  [em("confirmou") + 0.4, VIRAL("faah"), 0.12],
];
const falando = (t: number) => PAL.some((p) => t >= p.s - 0.04 && t <= p.e + 0.04) || DAVY.some(([a, b]) => t >= a && t <= b);
const DUCK: number[] = (() => {
  const bruto = Array.from({ length: DURACAO_FASE43 }, (_, i) => (falando(i / FPS) ? 0.5 : 0.85));
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

export const VideoFase43: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Fundo t={t} />
      {t < FINAL + 0.3 && <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.45) 0%, rgba(0,0,0,0) 18%, rgba(0,0,0,0) 80%, rgba(0,0,0,.5) 100%)" }} />}
      <Rotulo t={t} />
      <Figurinhas t={t} />
      <VyceNoGta t={t} f={f} />
      <Legenda t={t} />
      <Audio src={staticFile(ARQ("narracao.wav"))} />
      <Audio src={staticFile(ARQ("trilha.wav"))} volume={(q) => 0.12 * (DUCK[q] ?? 0.5)} />
      {SONS.map(([q, nome, vol], i) => (
        <Sequence key={i} from={Math.max(0, Math.round(q * FPS))} durationInFrames={120}>
          <Audio src={staticFile(nome === "whoosh" ? "fase-extra/sons/whoosh.wav" : nome.includes("/") ? nome : ARQ(`sfx-${nome}.wav`))} volume={vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
