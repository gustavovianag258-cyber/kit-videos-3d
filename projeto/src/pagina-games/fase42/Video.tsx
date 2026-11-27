import { loadFont } from "@remotion/google-fonts/Montserrat";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, Audio, Easing, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { Camera } from "../Estudio";
import { CorPele, Mascote3D, PoseMascote } from "../Mascote3D";
import dados from "./dados.json";

// Fase Extra, Fase 42: "A cobertura do GTA 6 com 8 supercarros de graça" — a partir de um guia gringo (Incredilags).
// clipes/jogo.mp4 = o vídeo inteiro em 30 fps (mesmos segundos). Gameplay limpa (sem webcam/títulos): o jogo entra INTEIRO,
// sem zoom, no meio da tela. Voz só do Vyce, sem crédito, áudio do vídeo mudo.
const { fontFamily } = loadFont("normal", { weights: ["600", "800", "900"], subsets: ["latin"] });
export const FPS = 30;
const FIM = dados.duracao + 1.2;
export const DURACAO_FASE42 = Math.ceil(FIM * FPS);
const AMARELO = "#FFD84A";
const LARANJA = "#FF8A2B";
const AZUL = "#6FD6FF";
const VERDE = "#7CFF9B";
const ROSA = "#FF7EB6";
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const suave = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
const entra = (t: number, a: number, d = 0.3) => interpolate(t, [a, a + d], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) });
const sombra = "0 4px 22px rgba(0,0,0,.8)";
const ARQ = (n: string) => `fase-extra/fase42/${n}`;

// trechos do vídeo original emendados em clipes/jogo.mp4: [início, fim] em segundos do original
const TRECHOS: [number, number][] = [[0, 475.2]];
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
const N1 = em("1", 8);
const N2 = em("2", N1);
const N3 = em("3", em("estacionamentos"));
const N4 = em("4", em("hora"));
const N5 = em("5", N4);
const N6 = em("e", em("inteira"));
const PORE = em("como", N6);
const FINAL = em("você", em("horas")) - 0.15;
const ENQ = em("e", em("vyce", FINAL));

// ---------- planos (s = segundo do vídeo ORIGINAL; cx/cy no quadro 1920x1080; k = zoom; foto = cartão recortado) ----------
type Plano = { de: number; s: number; cx?: number; luz?: number; larg?: number; y0?: number };
const CHEIO = 1920 / 1080;
const PLANOS: Plano[] = [
  // gancho
  { de: 0, s: 375.0 },
  { de: em("um", 3) - 0.1, s: 133.0 },
  { de: em("uma", em("teto")) - 0.1, s: 360.0 },
  { de: em("e", em("céu")) - 0.1, s: 413.0 },
  // 1 · Tequesta Retreat (mapa ~3,5 s)
  { de: N1 - 0.1, s: 45.0 },
  { de: em("no", em("diamante")) - 0.1, s: 17.0 },
  // 2 · elevador
  { de: N2 - 0.1, s: 62.0 },
  // 3 · helicóptero
  { de: N3 - 0.1, s: 132.0 },
  // 4 · lá dentro
  { de: N4 - 0.1, s: 165.0 },
  { de: em("mesa") - 0.1, s: 168.0 },
  { de: em("closet") - 0.1, s: 180.0 },
  { de: em("um", em("roupa")) - 0.1, s: 273.0 },
  // 5 · andar de baixo
  { de: N5 - 0.1, s: 212.0 },
  { de: em("sauna") - 0.1, s: 228.0 },
  { de: em("e", em("vestiário")) - 0.1, s: 215.0 },
  // 6 · a garagem no céu
  { de: N6 - 0.1, s: 284.0 },
  { de: em("são", N6) - 0.1, s: 375.0 },
  { de: em("entra") - 0.1, s: 397.0 },
  { de: em("o", em("chave")) - 0.1, s: 403.0 },
  { de: em("e", em("cidade")) - 0.1, s: 415.0 },
  // o porém
  { de: PORE - 0.1, s: 425.0 },
  { de: em("o", em("história")) - 0.1, s: 440.0 },
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
// janela larga (pedido: menos zoom): 1440 px de largura do quadro original no meio da tela, cortando embaixo
// (y > 930: legendas queimadas do criador) e nas bordas (contador "NN/20" no canto de cima à esquerda)
const Janela: React.FC<{ s: number; cx: number; y0: number; z: number; LARG?: number; luz?: number }> = ({ s, cx, y0, z, LARG = 1920, luz = 1 }) => {
  const x0 = Math.min(1920 - LARG, Math.max(0, cx - LARG / 2));
  const y1 = 1080; // imagem inteira; os segundos com etiqueta/título dele ficam de fora
  const esc = 1080 / LARG;
  const H = (y1 - y0) * esc;
  return (
    <div style={{ position: "absolute", left: 0, top: 940 - H / 2, width: 1080, height: H, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,.6)" }}>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${z})` }}>
        <OffthreadVideo src={VIDEO} startFrom={Math.round(src(s) * FPS)} muted style={{ position: "absolute", left: -x0 * esc, top: -y0 * esc, width: 1920 * esc, height: 1080 * esc, filter: luz !== 1 ? `brightness(${luz})` : undefined }} />
      </div>
    </div>
  );
};
const Fundo: React.FC<{ t: number }> = ({ t }) => {
  const i = planoEm(t);
  if (i < 0 || t > FINAL + 0.3) return null;
  const p = PLANOS[i];
  const fim = Math.min(PLANOS[i + 1]?.de ?? FIM, FINAL + 0.3);
  const z = 1 + 0.02 * interpolate(t, [p.de, fim], [0, 1], { ...cl, easing: Easing.inOut(Easing.sin) });
  const dur = Math.max(1, Math.round((fim - p.de) * FPS) + 2);
  return (
    <Sequence key={i} from={Math.round(p.de * FPS)} durationInFrames={dur} layout="none">
      <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
        <AbsoluteFill style={{ transform: "scale(1.15)" }}>
          <Quadro s={p.s} k={CHEIO} cx={960} cy={540} filtro="blur(30px) brightness(0.4)" />
        </AbsoluteFill>
        <Janela s={p.s} cx={p.cx ?? 960} y0={p.y0 ?? 0} z={z} LARG={p.larg} luz={p.luz} />
      </AbsoluteFill>
    </Sequence>
  );
};

// ---------- título (em cima): número grande da contagem + título curto ----------
type Tela = { de: number; ate: number; n?: string; rotulo?: string; cor: string; titulo: string };
const TELAS: Tela[] = [
  { de: 0.05, ate: em("e", em("céu")) - 0.05, rotulo: "A MELHOR CASA DO GTA 6", cor: AMARELO, titulo: "8 SUPERCARROS DE GRAÇA" },
  { de: em("e", em("céu")), ate: N1 - 0.05, rotulo: "NO FINAL", cor: ROSA, titulo: "O PORÉM" },
  { de: N1, ate: N2 - 0.05, n: "1", rotulo: "A ILHA EM FORMA DE DIAMANTE", cor: AZUL, titulo: "TEQUESTA RETREAT" },
  { de: N2, ate: N3 - 0.05, n: "2", rotulo: "HELIPONTO · 3 ANDARES · 2 GARAGENS", cor: VERDE, titulo: "O ELEVADOR" },
  { de: N3, ate: N4 - 0.05, n: "3", rotulo: "A QUALQUER HORA", cor: LARANJA, titulo: "HELICÓPTERO NO TETO" },
  { de: N4, ate: N5 - 0.05, n: "4", rotulo: "SINUCA · CLOSET · VIDEOGAME", cor: ROSA, titulo: "LÁ DENTRO" },
  { de: N5, ate: N6 - 0.05, n: "5", rotulo: "SAUNA · BANHEIRA · VISTA", cor: AZUL, titulo: "ANDAR DE BAIXO" },
  { de: N6, ate: PORE - 0.05, n: "6", rotulo: "8 CARROS + MOTOS + PATINETE", cor: AMARELO, titulo: "A GARAGEM NO CÉU" },
  { de: PORE, ate: FINAL - 0.1, rotulo: "NÃO DÁ PRA COMPRAR · SÓ NO FIM", cor: LARANJA, titulo: "O PORÉM ⚠️" },
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
const DESTAQUE = /^(melhor|casa|gta|6|8|supercarros|graça|helicóptero|teto|garagem|céu|porém|tequesta|retreat|diamante|pegassi|residences|torre|elevador|heliponto|andares|garagens|estacionamentos|adega|sinuca|closet|videogame|tv|banheira|sauna|vestiário|vista|motos|patinete|arrombar|chave|bater|comprar|últimas|missões|45|horas|fase|extra|vyce|cobertura|comenta)$/i;
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

// ---------- final: o Vyce DENTRO do GTA, na garagem no céu ----------
const boca = (f: number) => (dados.boca as number[])[f] ?? 0;
const pisca = (t: number) => {
  const c = t % 4.3;
  return c > 1.4 && c < 1.52;
};
const OPCOES: [string, string, string, string][] = [
  ["1", "🏙️", "A COBERTURA", AZUL],
  ["2", "🏎️", "A GARAGEM NO CÉU", AMARELO],
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
          <Quadro s={360.0} k={CHEIO} cx={960} cy={540} filtro="blur(2px)" />
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

// ---------- som: voz + música (Beautiful Dream, Mixkit 493) bem baixa + whoosh/pop nos números + efeitos virais pontuais ----------
const PASSOS = [N1, N2, N3, N4, N5, N6, PORE];
const VIRAL = (n: string) => `fase-extra/sons/virais/${n}.wav`;
const SONS: [number, string, number][] = [
  ...PASSOS.map((q) => [q - 0.05, "whoosh", 0.1] as [number, string, number]),
  ...PASSOS.map((q) => [q + 0.05, "pop", 0.12] as [number, string, number]),
  [FINAL, "whoosh", 0.1],
  [em("graça") + 0.3, VIRAL("cha-ching-dinheiro"), 0.22],
  [em("sauna") + 0.2, VIRAL("rizz"), 0.16],
  [em("são", N6) - 0.1, VIRAL("magic-reveal"), 0.2],
  [em("porém", PORE) + 0.3, VIRAL("erro-windows"), 0.18],
];
const falando = (t: number) => PAL.some((p) => t >= p.s - 0.04 && t <= p.e + 0.04);
const DUCK: number[] = (() => {
  const bruto = Array.from({ length: DURACAO_FASE42 }, (_, i) => (falando(i / FPS) ? 0.5 : 0.85));
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

export const VideoFase42: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Fundo t={t} />
      {t < FINAL + 0.3 && <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.5) 0%, rgba(0,0,0,0) 24%, rgba(0,0,0,0) 74%, rgba(0,0,0,.6) 100%)" }} />}
      <Titulos t={t} />
      <VyceNoGta t={t} f={f} />
      <Legenda t={t} />
      <Audio src={staticFile(ARQ("narracao.wav"))} />
      <Audio src={staticFile(ARQ("trilha.wav"))} volume={(q) => 0.12 * (DUCK[q] ?? 0.5)} />
      {SONS.map(([q, nome, vol], i) => (
        <Sequence key={i} from={Math.max(0, Math.round(q * FPS))} durationInFrames={90}>
          <Audio src={staticFile(nome === "whoosh" ? "fase-extra/sons/whoosh.wav" : nome.includes("/") ? nome : ARQ(`sfx-${nome}.wav`))} volume={vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
