import { loadFont } from "@remotion/google-fonts/Montserrat";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, Audio, Easing, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { Camera } from "../Estudio";
import { CorPele, Mascote3D, PoseMascote } from "../Mascote3D";
import dados from "./dados.json";

// Fase Extra, Fase 31: "Os 7 easter eggs mais insanos do GTA 6" (contagem 7 → 1).
// Base: vídeo do Grand Gabe (YouTube krXeDYcquTM, 4K). Só a imagem do jogo, recortada na vertical com zoom no centro
// (sem o contador "NN/20", sem os selos e sem as legendas dele). Voz só do Vyce, áudio do vídeo mudo, sem crédito.
// clipes/jogo.mp4 = 5 trechos do 4K emendados (2560x1440, 30 fps); src() converte o segundo do vídeo original.
const { fontFamily } = loadFont("normal", { weights: ["600", "800", "900"], subsets: ["latin"] });
export const FPS = 30;
const FIM = dados.duracao + 1.2;
export const DURACAO_FASE31 = Math.ceil(FIM * FPS);
const AMARELO = "#FFD84A";
const LARANJA = "#FF8A2B";
const AZUL = "#6FD6FF";
const VERDE = "#7CFF9B";
const ROSA = "#FF7EB6";
const ROXO = "#C08BFF";
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const suave = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
const entra = (t: number, a: number, d = 0.3) => interpolate(t, [a, a + d], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) });
const sombra = "0 4px 22px rgba(0,0,0,.8)";
const ARQ = (n: string) => `fase-extra/fase31/${n}`;

// trechos do vídeo original emendados em clipes/jogo.mp4: [início, fim] em segundos do original
const TRECHOS: [number, number][] = [[99, 116], [139, 208], [247, 266], [328, 337], [360, 390]];
const src = (s: number) => {
  let off = 0;
  for (const [a, b] of TRECHOS) {
    if (s >= a && s <= b) return off + (s - a);
    off += b - a;
  }
  return 0;
};

// ---------- âncoras ----------
type Pal = { w: string; s: number; e: number };
const PAL = dados.palavras as Pal[];
const limpa = (w: string) => w.toLowerCase().replace(/[.,?!:…“”"]/g, "");
const em = (palavra: string, depois = 0) => PAL.find((p) => limpa(p.w) === palavra && p.s >= depois)?.s ?? 999;
const N7 = em("número", 12.8);
const N6 = em("número", N7 + 1);
const N5 = em("número", N6 + 1);
const N4 = em("número", N5 + 1);
const N3 = em("número", N4 + 1);
const N2 = em("número", N3 + 1);
const N1 = em("e", em("toque", N2 + 5));
const FINAL = em("você", em("lá", N1 + 15)) - 0.15;
const ENQ = em("e", em("vyce", FINAL));

// ---------- planos (s = segundo do vídeo ORIGINAL; cx/cy no quadro 1920x1080; k = zoom; foto = cartão recortado) ----------
type Plano = { de: number; s: number; cx?: number; cy?: number; k?: number; vel?: number; larg?: number; foto?: [number, number, number, number] };
const CHEIO = 1920 / 1080;
const PLANOS: Plano[] = [
  // gancho: rajada
  { de: 0, s: 375.5, cx: 1060, cy: 450, k: 2.2 },
  { de: em("anitta") - 0.1, s: 202.5, cx: 960, cy: 650, k: 2.3 },
  { de: em("barco") - 0.1, s: 142.0, cx: 880, larg: 1200 },
  { de: em("pé") - 0.1, s: 373.3, cx: 980 },
  { de: em("separei") - 0.1, s: 330.5, cx: 1000, cy: 450, k: 2.2 },
  { de: em("um", 11) - 0.1, s: 376.0, cx: 1060, cy: 460, k: 2.2 },
  // 7 · carinho
  { de: N7 - 0.1, s: 100.0, cx: 1050 },
  { de: em("olha", N7) - 0.1, s: 107.2, cx: 1340, cy: 560, k: 2 },
  { de: em("cachorro") - 0.1, s: 111.0, cx: 1000 },
  { de: em("carinho", N7 + 5) - 0.1, s: 113.5, cx: 1050 },
  // 6 · briga
  { de: N6 - 0.1, s: 247.5, cx: 960, cy: 450, k: 2.2 },
  { de: em("desafia") - 0.1, s: 251.0, cx: 980, cy: 450, k: 2.2 },
  { de: em("ganha") - 0.1, s: 256.0, cx: 1000, cy: 450, k: 2.2 },
  { de: em("ele", em("briga")) - 0.1, s: 264.6, cx: 1130, cy: 450, k: 2.2 },
  // 5 · meteorito
  { de: N5 - 0.1, s: 328.4, cx: 1000, cy: 450, k: 2.2 },
  { de: em("é", N5) - 0.1, s: 332.0, cx: 960, cy: 450, k: 2.2 },
  { de: em("dá", N5) - 0.1, s: 334.0, cx: 1000, cy: 450, k: 2.2 },
  // 4 · Anitta
  { de: N4 - 0.1, s: 197.5, cx: 980, cy: 650, k: 2.3 },
  { de: em("tem", N4) - 0.1, s: 200.8, cx: 960, cy: 650, k: 2.3 },
  { de: em("tá", N4) - 0.1, s: 204.6, cx: 1080, cy: 650, k: 2.3 },
  // 3 · casa de 2021
  { de: N3 - 0.1, s: 172.2, cx: 1150 },
  { de: em("foto", N3) - 0.1, s: 177.5, foto: [470, 230, 1440, 840] },
  { de: em("agora", N3) - 0.1, s: 182.4, cx: 1150, cy: 450, k: 2.2 },
  { de: em("e", em("belville")) - 0.1, s: 186.2, cx: 900, cy: 450, k: 2.2 },
  { de: em("jason", N3) - 0.1, s: 188.0, cx: 1000, cy: 450, k: 2.2 },
  // 2 · barco do Michael
  { de: N2 - 0.1, s: 141.0, cx: 880, larg: 1200 },
  { de: em("é", N2) - 0.1, s: 151.0, cx: 880, larg: 1200 },
  { de: em("sobe", N2) - 0.1, s: 155.0, cx: 880, larg: 1200 },
  { de: em("mapa", N2) - 0.1, s: 156.4, cx: 640, cy: 650, k: 2.2 },
  { de: em("e", em("santos")) - 0.1, s: 158.5, cx: 980, k: 2.1 },
  // 1 · Pé Grande
  { de: N1 - 0.1, s: 363.0, cx: 960 },
  { de: em("um", N1 + 1) - 0.1, s: 370.4, cx: 1000 },
  { de: em("segue", N1) - 0.1, s: 373.2, cx: 980 },
  { de: em("boneco", N1) - 0.1, s: 375.5, cx: 1060, cy: 450, k: 2.2 },
  { de: em("chega", N1) - 0.1, s: 377.6, cx: 1060, cy: 450, k: 2.2 },
  { de: em("visão", N1) - 0.1, s: 379.2, cx: 960 },
  { de: em("e", em("apaga", N1)) - 0.1, s: 382.0, cx: 960 },
  { de: em("é", em("aconteceu")) - 0.1, s: 375.8, cx: 1060, cy: 460, k: 2.3 },
  { de: em("no", em("flórida")) - 0.1, s: 384.6, cx: 900, k: 2 },
  { de: em("vinte") - 0.1, s: 374.6, cx: 1060, cy: 470, k: 2.1 },
];
PLANOS.sort((a, b) => a.de - b.de);
const planoEm = (t: number) => {
  let i = -1;
  while (i + 1 < PLANOS.length && PLANOS[i + 1].de <= t) i++;
  return i;
};
const VIDEO = staticFile(ARQ("clipes/jogo.mp4"));
const Quadro: React.FC<{ s: number; k: number; cx: number; cy: number; filtro?: string; vel?: number }> = ({ s, k, cx, cy, filtro, vel }) => {
  const w = 1920 * k;
  const h = (w * 1080) / 1920;
  const left = 540 - (cx / 1920) * w;
  const top = Math.min(0, Math.max(1920 - h, 960 - (cy / 1080) * h));
  return <OffthreadVideo src={VIDEO} startFrom={Math.round(src(s) * FPS)} playbackRate={vel ?? 1} muted style={{ position: "absolute", left: Math.min(0, Math.max(1080 - w, left)), top, width: w, height: h, filter: filtro }} />;
};
// cartão: mostra só o retângulo [x0,y0,x1,y1] (coordenadas 1920x1080) do quadro, com borda
const Cartao: React.FC<{ s: number; r: [number, number, number, number]; t: number; de: number }> = ({ s, r, t, de }) => {
  const [x0, y0, x1, y1] = r;
  const W = 980;
  const esc = W / (x1 - x0);
  const H = (y1 - y0) * esc;
  const k = interpolate(t, [de, de + 0.45], [0, 1], { ...cl, easing: Easing.out(Easing.back(1.4)) });
  return (
    <div style={{ position: "absolute", left: 50, top: 960 - H / 2, width: W, height: H, overflow: "hidden", borderRadius: 18, border: "6px solid #fff", boxShadow: "0 20px 60px rgba(0,0,0,.7)", transform: `scale(${0.85 + 0.15 * k}) rotate(${(1 - k) * -3}deg)`, opacity: k }}>
      <OffthreadVideo src={VIDEO} startFrom={Math.round(src(s) * FPS)} muted style={{ position: "absolute", left: -x0 * esc, top: -y0 * esc, width: 1920 * esc, height: 1080 * esc }} />
    </div>
  );
};
// janela larga (pedido: menos zoom): 1440 px de largura do quadro original no meio da tela, cortando embaixo
// (y > 930: legendas queimadas do criador) e nas bordas (contador "NN/20" no canto de cima à esquerda)
const Janela: React.FC<{ s: number; cx: number; y0: number; z: number; LARG?: number }> = ({ s, cx, y0, z, LARG = 1440 }) => {
  const x0 = Math.min(1920 - LARG, Math.max(0, cx - LARG / 2));
  const y1 = 930;
  const esc = 1080 / LARG;
  const H = (y1 - y0) * esc;
  return (
    <div style={{ position: "absolute", left: 0, top: 940 - H / 2, width: 1080, height: H, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,.6)" }}>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${z})` }}>
        <OffthreadVideo src={VIDEO} startFrom={Math.round(src(s) * FPS)} muted style={{ position: "absolute", left: -x0 * esc, top: -y0 * esc, width: 1920 * esc, height: 1080 * esc }} />
      </div>
    </div>
  );
};
const Fundo: React.FC<{ t: number }> = ({ t }) => {
  const i = planoEm(t);
  if (i < 0 || t > FINAL + 0.3) return null;
  const p = PLANOS[i];
  const fim = Math.min(PLANOS[i + 1]?.de ?? FIM, FINAL + 0.3);
  const z = 1 + 0.04 * interpolate(t, [p.de, fim], [0, 1], { ...cl, easing: Easing.inOut(Easing.sin) });
  const dur = Math.max(1, Math.round((fim - p.de) * FPS) + 2);
  return (
    <Sequence key={i} from={Math.round(p.de * FPS)} durationInFrames={dur} layout="none">
      <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
        {p.foto ? (
          <>
            <AbsoluteFill style={{ transform: "scale(1.15)" }}>
              <Quadro s={p.s} k={CHEIO} cx={960} cy={540} filtro="blur(30px) brightness(0.4)" />
            </AbsoluteFill>
            <Cartao s={p.s} r={p.foto} t={t} de={p.de} />
          </>
        ) : (
          <>
            <AbsoluteFill style={{ transform: "scale(1.15)" }}>
              <Quadro s={p.s} k={CHEIO} cx={p.cx ?? 960} cy={540} filtro="blur(30px) brightness(0.4)" />
            </AbsoluteFill>
            <Janela s={p.s} cx={p.cx ?? 960} y0={(p.cy ?? 540) >= 600 ? 220 : 0} z={z} LARG={p.larg} />
          </>
        )}
      </AbsoluteFill>
    </Sequence>
  );
};

// ---------- título (em cima): número grande da contagem + título curto ----------
type Tela = { de: number; ate: number; n?: string; rotulo?: string; cor: string; titulo: string };
const TELAS: Tela[] = [
  { de: 0.05, ate: em("separei") - 0.05, cor: AMARELO, titulo: "SEGREDOS DO GTA 6" },
  { de: em("separei"), ate: N7 - 0.05, rotulo: "OS MAIS INSANOS", cor: AMARELO, titulo: "TOP 7 🔥" },
  { de: N7, ate: N6 - 0.05, n: "7", rotulo: "FOCO REFORÇADO", cor: VERDE, titulo: "CARINHO VIRA BÔNUS" },
  { de: N6, ate: N5 - 0.05, n: "6", rotulo: "PERTO DA PRAIA", cor: LARANJA, titulo: "BRIGA QUE PAGA $1.000" },
  { de: N5, ate: N4 - 0.05, n: "5", rotulo: "MONTE KALAGA", cor: ROXO, titulo: "METEORITO ☄️" },
  { de: N4, ate: N3 - 0.05, n: "4", rotulo: "THE WIPE · ASK DR. NITA", cor: ROSA, titulo: "ANITTA NA RÁDIO" },
  { de: N3, ate: N2 - 0.05, n: "3", rotulo: "SAN ANDREAS · 2021", cor: AZUL, titulo: "A CASA ESCONDIDA" },
  { de: N2, ate: N1 - 0.05, n: "2", rotulo: "GTA 5 · LOS SANTOS", cor: AMARELO, titulo: "O BARCO DO MICHAEL" },
  { de: N1, ate: FINAL - 0.1, n: "1", rotulo: "GRASSRIVERS", cor: VERDE, titulo: "O PÉ GRANDE" },
];
const Titulos: React.FC<{ t: number }> = ({ t }) => {
  const tela = TELAS.find((x) => t >= x.de - 0.05 && t < x.ate);
  if (!tela) return null;
  const k = entra(t, tela.de, 0.3);
  const s = suave(t, tela.ate - 0.15, tela.ate);
  const kn = interpolate(t, [tela.de, tela.de + 0.4], [0, 1], { ...cl, easing: Easing.out(Easing.back(2)) });
  const n = tela.titulo.length;
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: 230, textAlign: "center", fontFamily, opacity: k * (1 - s) }}>
      {tela.n && (
        <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 120, height: 120, borderRadius: 60, background: tela.cor, color: "#111", fontWeight: 900, fontSize: 84, lineHeight: 1, marginBottom: 10, boxShadow: "0 6px 26px rgba(0,0,0,.6)", transform: `scale(${kn})` }}>{tela.n}</div>
      )}
      {tela.rotulo && <div style={{ fontWeight: 800, fontSize: 32, letterSpacing: 6, color: tela.cor, textShadow: sombra, marginBottom: 6, transform: `translateY(${(1 - k) * 16}px)` }}>{tela.rotulo}</div>}
      <div style={{ fontWeight: 900, fontSize: n > 18 ? 68 : n > 14 ? 78 : 92, lineHeight: 1.02, letterSpacing: -1, color: "#fff", WebkitTextStroke: "8px #000", paintOrder: "stroke fill", textShadow: sombra, transform: `translateY(${(1 - k) * 20}px) scale(${0.94 + 0.06 * k})` }}>{tela.titulo}</div>
    </div>
  );
};

// ---------- legenda (embaixo) ----------
const DESTAQUE = /^(gta|6|5|anitta|michael|pé|grande|sete|um|insanos|carinho|foco|reforçado|bônus|beta|luta|mil|dólares|kalaga|cratera|roxa|meteorito|vender|wipe|ask|dr|nita|rockstar|2021|casa|san|andreas|igualzinha|belville|seis|j|l|jason|lucia|barco|cavalete|gps|los|santos|wind|chimes|grassrivers|vulto|boneco|gás|verde|apaga|carro|skunk|ape|flórida|nunca|existiu|vinte|dois|fase|extra|vyce|comenta)$/i;
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
  const i = BLOCOS.findIndex((b, j) => t >= b[0].s - 0.05 && t < Math.min(BLOCOS[j + 1]?.[0].s ?? 999, b[b.length - 1].e + 0.5) - 0.05);
  if (i < 0) return null;
  return (
    <div style={{ position: "absolute", top: 1560, left: 50, right: 50, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 18px" }}>
      {BLOCOS[i].map((p, j) => (
        <span key={j} style={{ fontFamily, fontWeight: 900, fontSize: 66, lineHeight: 1.1, color: DESTAQUE.test(limpa(p.w)) ? AMARELO : "#fff", opacity: t >= p.s - 0.03 ? 1 : 0, WebkitTextStroke: "10px #000", paintOrder: "stroke fill" }}>
          {p.w.replace(/[.,:!]$/, "")}
        </span>
      ))}
    </div>
  );
};

// apagão do Pé Grande: a tela escurece e embaça quando o Jason apaga
const Apagao: React.FC<{ t: number }> = ({ t }) => {
  const a = em("apaga", N1);
  const v = interpolate(t, [a - 0.2, a + 0.25, em("e", a) + 0.05, em("e", a) + 0.35], [0, 0.92, 0.92, 0], cl);
  return <AbsoluteFill style={{ background: "#000", opacity: v }} />;
};

// ---------- final: o Vyce DENTRO do GTA, no pântano do Pé Grande ----------
const boca = (f: number) => (dados.boca as number[])[f] ?? 0;
const pisca = (t: number) => {
  const c = t % 4.3;
  return c > 1.4 && c < 1.52;
};
const OPCOES: [string, string, string, string][] = [
  ["1", "🦶", "CAÇAR O PÉ GRANDE", VERDE],
  ["2", "☄️", "PEGAR O METEORITO", ROXO],
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
          <Quadro s={374.0} k={2} cx={1060} cy={470} filtro="blur(2px) brightness(0.9)" />
        </AbsoluteFill>
      </Sequence>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.65) 0%, rgba(0,0,0,.2) 35%, rgba(0,0,0,0) 60%, rgba(0,0,0,.35) 100%)" }} />
      <AbsoluteFill>
        <ThreeCanvas width={1080} height={1920} camera={{ fov, near: 0.05, far: 50 }} gl={{ toneMapping: THREE.ACESFilmicToneMapping, antialias: true, alpha: true }}>
          <Camera pos={[0, 1.2, 6]} alvo={[0, 1.05, 0]} />
          <hemisphereLight args={["#DDEBD8", "#3A4A32", 1.1]} />
          <directionalLight position={[-2, 5, 4]} intensity={2.2} color="#FFF2DE" />
          <directionalLight position={[2.5, 3, -2]} intensity={1.3} color="#D8FFD0" />
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
            const kk = entra(t, em(i === 0 ? "ia" : "ou", ENQ) - 0.15);
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

// ---------- som: voz + música (Cyberpunk City, Mixkit 140) mais baixa + whoosh leve em cada número ----------
const NUMEROS = [N7, N6, N5, N4, N3, N2, N1];
const SONS: [number, string, number][] = [
  ...NUMEROS.map((q) => [q - 0.05, "whoosh", 0.1] as [number, string, number]),
  ...NUMEROS.map((q) => [q + 0.05, "pop", 0.12] as [number, string, number]),
  [FINAL, "whoosh", 0.1],
];
const falando = (t: number) => PAL.some((p) => t >= p.s - 0.04 && t <= p.e + 0.04);
const DUCK: number[] = (() => {
  const bruto = Array.from({ length: DURACAO_FASE31 }, (_, i) => (falando(i / FPS) ? 0.5 : 0.85));
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

export const VideoFase31: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Fundo t={t} />
      {t < FINAL + 0.3 && <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.5) 0%, rgba(0,0,0,0) 24%, rgba(0,0,0,0) 74%, rgba(0,0,0,.6) 100%)" }} />}
      <Apagao t={t} />
      <Titulos t={t} />
      <VyceNoGta t={t} f={f} />
      <Legenda t={t} />
      <Audio src={staticFile(ARQ("narracao.wav"))} />
      <Audio src={staticFile(ARQ("trilha.wav"))} volume={(q) => 0.12 * (DUCK[q] ?? 0.5)} />
      {SONS.map(([q, nome, vol], i) => (
        <Sequence key={i} from={Math.max(0, Math.round(q * FPS))} durationInFrames={90}>
          <Audio src={staticFile(nome === "whoosh" ? "fase-extra/sons/whoosh.wav" : ARQ(`sfx-${nome}.wav`))} volume={vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
