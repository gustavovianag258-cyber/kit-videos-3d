import { loadFont } from "@remotion/google-fonts/Montserrat";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, Audio, Easing, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { Camera } from "../Estudio";
import { CorPele, Mascote3D, PoseMascote } from "../Mascote3D";
import dados from "./dados.json";

// Fase Extra, Fase 32: "O glitch de dinheiro infinito do começo do GTA 6" (passo a passo, 6 passos).
// Base: vídeo do Bosco Play (YouTube S9mZBUR5KgQ, 1080p). Só a imagem do jogo, numa faixa larga no meio da tela
// (pouco zoom, fundo desfocado), fora dos cartões dele. Voz só do Vyce, áudio do vídeo mudo, sem crédito, música bem baixa.
// clipes/jogo.mp4 = 6 trechos emendados (1920x1080, 30 fps); src() converte o segundo do vídeo original.
const { fontFamily } = loadFont("normal", { weights: ["600", "800", "900"], subsets: ["latin"] });
export const FPS = 30;
const FIM = dados.duracao + 1.2;
export const DURACAO_FASE32 = Math.ceil(FIM * FPS);
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
const ARQ = (n: string) => `fase-extra/fase32/${n}`;

// trechos do vídeo original emendados em clipes/jogo.mp4: [início, fim] em segundos do original
const TRECHOS: [number, number][] = [[12, 46], [48, 146], [158, 246], [286, 390], [446, 486], [508, 522]];
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
const P1 = em("passo", 9);
const P2 = em("passo", P1 + 1);
const P3 = em("passo", P2 + 1);
const P4 = em("passo", P3 + 1);
const P5 = em("passo", P4 + 1);
const P6 = em("passo", P5 + 1);
const DETALHE = em("como", P6);
const SENHA = em("a", em("senha") - 0.4);
const POS_SENHA = em("o", em("7700"));
const ROUPA = em("e", em("roupa"));
const FINAL = em("você", em("corrigir")) - 0.15;
const ENQ = em("e", em("vyce", FINAL));

// ---------- planos (s = segundo do vídeo ORIGINAL; cx/cy no quadro 1920x1080; k = zoom; foto = cartão recortado) ----------
type Plano = { de: number; s: number; cx?: number; luz?: number; larg?: number };
const CHEIO = 1920 / 1080;
const DENTRO = 1.45; // o interior do galpão é escuro
const PLANOS: Plano[] = [
  // gancho
  { de: 0, s: 234.5, cx: 1150 },
  { de: em("salvando") - 0.1, s: 195.5, cx: 700 },
  { de: em("eu", 4.5) - 0.1, s: 41.0, cx: 900 },
  { de: em("detalhe") - 0.1, s: 513.0, cx: 900 },
  // 1 · galpão
  { de: P1 - 0.1, s: 28.0, cx: 960 },
  { de: em("logo", P1) - 0.1, s: 33.0, cx: 900 },
  { de: em("a", em("lento", P1)) - 0.1, s: 42.0, cx: 960 },
  { de: em("arromba") - 0.1, s: 44.6, cx: 1000 },
  // 2 · pega tudo
  { de: P2 - 0.1, s: 49.0, cx: 960, luz: DENTRO },
  { de: em("pega", P2) - 0.1, s: 59.0, cx: 960, luz: DENTRO },
  { de: em("das", P2) - 0.1, s: 98.0, cx: 960, luz: 1.15 },
  { de: em("abre", P2) - 0.1, s: 129.0, cx: 900, luz: 1.2 },
  { de: em("só", P2) - 0.1, s: 104.0, cx: 960, luz: 1.15 },
  // 3 · porta-malas
  { de: P3 - 0.1, s: 160.5, cx: 900 },
  { de: em("joga", P3) - 0.1, s: 163.0, cx: 960 },
  { de: em("tem", P3) - 0.1, s: 168.0, cx: 960 },
  { de: em("em", em("lucia")) - 0.1, s: 184.0, cx: 960 },
  // 4 · salva e carrega
  { de: P4 - 0.1, s: 188.4, cx: 700 },
  { de: em("carrega", P4) - 0.1, s: 195.5, cx: 700 },
  { de: em("o", em("save")) - 0.1, s: 211.0, cx: 960 },
  { de: em("e", em("casa")) - 0.1, s: 231.0, cx: 960 },
  // 5 · repete
  { de: P5 - 0.1, s: 304.0, cx: 900 },
  { de: em("parte", P5) - 0.1, s: 333.0, cx: 960, luz: 1.15 },
  { de: em("pega", P5) - 0.1, s: 376.5, cx: 900 },
  { de: em("salva", P5) - 0.1, s: 384.0, cx: 700 },
  { de: em("cabe", P5) - 0.1, s: 380.5, cx: 1000 },
  // 6 · Brian
  { de: P6 - 0.1, s: 452.5, cx: 1000 },
  { de: em("no", em("brian", P6)) - 0.1, s: 459.0, cx: 960 },
  { de: SENHA - 0.1, s: 472.4, cx: 1000 },
  { de: POS_SENHA - 0.1, s: 480.0, cx: 960, luz: 1.3 },
  { de: em("na", POS_SENHA) - 0.1, s: 513.5, cx: 900 },
  // o detalhe
  { de: DETALHE - 0.1, s: 515.0, cx: 900 },
  { de: em("então", DETALHE) - 0.1, s: 230.0, cx: 960 },
  { de: ROUPA - 0.1, s: 288.0, cx: 960 },
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
const Janela: React.FC<{ s: number; cx: number; y0: number; z: number; LARG?: number; luz?: number }> = ({ s, cx, y0, z, LARG = 1440, luz = 1 }) => {
  const x0 = Math.min(1920 - LARG, Math.max(0, cx - LARG / 2));
  const y1 = 900;
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
  const z = 1 + 0.04 * interpolate(t, [p.de, fim], [0, 1], { ...cl, easing: Easing.inOut(Easing.sin) });
  const dur = Math.max(1, Math.round((fim - p.de) * FPS) + 2);
  return (
    <Sequence key={i} from={Math.round(p.de * FPS)} durationInFrames={dur} layout="none">
      <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
        <AbsoluteFill style={{ transform: "scale(1.15)" }}>
          <Quadro s={p.s} k={CHEIO} cx={p.cx ?? 960} cy={540} filtro="blur(30px) brightness(0.4)" />
        </AbsoluteFill>
        <Janela s={p.s} cx={p.cx ?? 960} y0={0} z={z} LARG={p.larg} luz={p.luz} />
      </AbsoluteFill>
    </Sequence>
  );
};

// ---------- título (em cima): número grande da contagem + título curto ----------
type Tela = { de: number; ate: number; n?: string; rotulo?: string; cor: string; titulo: string };
const TELAS: Tela[] = [
  { de: 0.05, ate: em("eu", 4.5) - 0.05, cor: VERDE, titulo: "DINHEIRO INFINITO 💵" },
  { de: em("eu", 4.5), ate: P1 - 0.05, rotulo: "SALVA E CARREGA", cor: VERDE, titulo: "PASSO A PASSO" },
  { de: P1, ate: P2 - 0.05, n: "1", rotulo: "VICE-DALE SUL · ACIMA DE KEY LENTO", cor: LARANJA, titulo: "O GALPÃO VERMELHO" },
  { de: P2, ate: P3 - 0.05, n: "2", rotulo: "VAN · MESAS · COFRE", cor: AMARELO, titulo: "PEGA TUDO" },
  { de: P3, ate: P4 - 0.05, n: "3", rotulo: "TEM QUE SER O CARRO DELE", cor: AZUL, titulo: "PORTA-MALAS DO JASON" },
  { de: P4, ate: P5 - 0.05, n: "4", rotulo: "SALVA NA MÃO, NÃO O AUTOMÁTICO", cor: ROXO, titulo: "SALVA E CARREGA" },
  { de: P5, ate: P6 - 0.05, n: "5", rotulo: "≈ $2.400 POR VOLTA · ATÉ 4 BOLSAS", cor: ROSA, titulo: "REPETE" },
  { de: P6, ate: SENHA - 0.05, n: "6", rotulo: "SUDOESTE DE KEY LENTO", cor: VERDE, titulo: "VENDE NO BRIAN" },
  { de: SENHA, ate: POS_SENHA - 0.05, n: "6", rotulo: "SENHA DA PORTA", cor: VERDE, titulo: "7700" },
  { de: POS_SENHA, ate: DETALHE - 0.05, n: "6", rotulo: "NA CAIXA DE CORREIO", cor: VERDE, titulo: "O DINHEIRO CAI DEPOIS" },
  { de: DETALHE, ate: em("então", DETALHE) - 0.05, rotulo: "SEM SPOILER", cor: AMARELO, titulo: "O DETALHE ⚠️" },
  { de: em("então", DETALHE), ate: ROUPA - 0.05, rotulo: "ARMA · CARRO · ROUPA", cor: AMARELO, titulo: "NÃO JUNTA: GASTA" },
  { de: ROUPA, ate: FINAL - 0.1, rotulo: "PODE SER CORRIGIDO", cor: AMARELO, titulo: "FAZ LOGO" },
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
      <div style={{ fontWeight: 900, fontSize: tela.titulo === "7700" ? 150 : n > 18 ? 68 : n > 14 ? 78 : 92, lineHeight: 1.02, letterSpacing: -1, color: "#fff", WebkitTextStroke: "8px #000", paintOrder: "stroke fill", textShadow: sombra, transform: `translateY(${(1 - k) * 20}px) scale(${0.94 + 0.06 * k})` }}>{tela.titulo}</div>
    </div>
  );
};

// ---------- legenda (embaixo) ----------
const DESTAQUE = /^(dinheiro|infinito|gta|6|salvando|carregando|detalhe|tudo|galpão|vermelho|vice-dale|key|lento|arromba|bolsas|mercadoria|van|mesas|cofre|dez|mil|porta-malas|jason|lucia|somem|salva|mão|automático|carrega|save|continuam|novo|repete|quatro|brian|7700|caixa|correio|perder|gasta|arma|carro|roupa|logo|rockstar|fase|extra|vyce|glitch|limpo|comenta)$/i;
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

// ---------- final: o Vyce DENTRO do GTA, na frente do galpão vermelho ----------
const boca = (f: number) => (dados.boca as number[])[f] ?? 0;
const pisca = (t: number) => {
  const c = t % 4.3;
  return c > 1.4 && c < 1.52;
};
const OPCOES: [string, string, string, string][] = [
  ["1", "💵", "USAVA O GLITCH", VERDE],
  ["2", "😇", "JOGAVA LIMPO", AZUL],
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
          <Quadro s={41.0} k={CHEIO} cx={760} cy={540} filtro="blur(2px)" />
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
            const kk = entra(t, em(i === 0 ? "usava" : "ou", ENQ) - 0.15);
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

// ---------- som: voz + música (Trapanomics, Mixkit 283) bem baixa + whoosh leve em cada passo ----------
const PASSOS = [P1, P2, P3, P4, P5, P6, DETALHE];
const SONS: [number, string, number][] = [
  ...PASSOS.map((q) => [q - 0.05, "whoosh", 0.1] as [number, string, number]),
  ...PASSOS.map((q) => [q + 0.05, "pop", 0.12] as [number, string, number]),
  [FINAL, "whoosh", 0.1],
];
const falando = (t: number) => PAL.some((p) => t >= p.s - 0.04 && t <= p.e + 0.04);
const DUCK: number[] = (() => {
  const bruto = Array.from({ length: DURACAO_FASE32 }, (_, i) => (falando(i / FPS) ? 0.5 : 0.85));
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

export const VideoFase32: React.FC = () => {
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
          <Audio src={staticFile(nome === "whoosh" ? "fase-extra/sons/whoosh.wav" : ARQ(`sfx-${nome}.wav`))} volume={vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
