import { loadFont } from "@remotion/google-fonts/Montserrat";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, Audio, Easing, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { Camera } from "../Estudio";
import { CorPele, Mascote3D, PoseMascote } from "../Mascote3D";
import dados from "./dados.json";

// Fase Extra, Fase 37: "4 supercarros de graça em Vice City" — vídeo autoral a partir de um reel gringo (Millzaa).
// clipes/jogo.mp4 = faixa do jogo do reel a partir de y 400 (a marca d'água "MillzaaTV" fica de fora), 1080x1190,
// com a faixa das legendas dele (y 626–734 do clipe) apagada por delogo; a NOSSA legenda entra numa tarja exatamente em cima.
// Voz só do Vyce, sem crédito, áudio do reel mudo, música baixa, efeitos virais pontuais.
const { fontFamily } = loadFont("normal", { weights: ["600", "800", "900"], subsets: ["latin"] });
export const FPS = 30;
const FIM = dados.duracao + 1.2;
export const DURACAO_FASE37 = Math.ceil(FIM * FPS);
const AMARELO = "#FFD84A";
const LARANJA = "#FF8A2B";
const AZUL = "#6FD6FF";
const VERDE = "#7CFF9B";
const ROSA = "#FF7EB6";
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const suave = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
const entra = (t: number, a: number, d = 0.3) => interpolate(t, [a, a + d], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) });
const sombra = "0 4px 22px rgba(0,0,0,.8)";
const ARQ = (n: string) => `fase-extra/fase37/${n}`;

// ---------- âncoras ----------
type Pal = { w: string; s: number; e: number };
const PAL = dados.palavras as Pal[];
const limpa = (w: string) => w.toLowerCase().replace(/[.,?!:…“”"]/g, "");
const em = (palavra: string, depois = 0) => PAL.find((p) => limpa(p.w) === palavra && p.s >= depois)?.s ?? 999;
const N1 = em("um", 8.5);
const N2 = em("dois", N1);
const N3 = em("três", N2);
const N4 = em("quatro", N3);
const GARAGEM = em("como", N4);
const FINAL = em("você", em("volta", GARAGEM)) - 0.15;
const ENQ = em("e", em("vyce", FINAL));

// ---------- planos (v = qual clipe; s = segundo do short original = segundo do clipe) ----------
type Plano = { de: number; v: "A" | "B"; s: number; luz?: number };
const PLANOS: Plano[] = [
  // gancho
  { de: 0, v: "A", s: 0.3 },
  { de: em("um", 3) - 0.1, v: "A", s: 32.2 },
  { de: em("e", em("nenhuma")) - 0.1, v: "A", s: 58.4 },
  { de: em("garagem") - 0.1, v: "A", s: 65.0 },
  // 1 · Emerus rubi
  { de: N1 - 0.1, v: "A", s: 8.4 },
  { de: em("tem", N1) - 0.1, v: "A", s: 13.0 },
  { de: em("pula", N1) - 0.1, v: "A", s: 11.0 },
  { de: em("tem", em("cerca")) - 0.1, v: "A", s: 15.0 },
  { de: em("sem", N1) - 0.1, v: "A", s: 20.5 },
  // 2 · Urus de ouro
  { de: N2 - 0.1, v: "A", s: 24.4 },
  { de: em("entra", N2) - 0.1, v: "A", s: 29.2 },
  { de: em("tem", em("fundos")) - 0.1, v: "A", s: 32.5 },
  { de: em("e", em("clonador")) - 0.1, v: "A", s: 35.2 },
  // 3 · Lambo de ouro
  { de: N3 - 0.1, v: "A", s: 38.4 },
  { de: em("sobe") - 0.1, v: "A", s: 45.0 },
  { de: em("tem", em("direita")) - 0.1, v: "A", s: 47.2 },
  // 4 · oncinha
  { de: N4 - 0.1, v: "A", s: 51.4 },
  { de: em("tem", em("abaixo")) - 0.1, v: "A", s: 58.0 },
  { de: em("com", em("porta", N4)) - 0.1, v: "A", s: 60.5 },
  // a garagem
  { de: GARAGEM - 0.1, v: "A", s: 64.0 },
  { de: em("tem", GARAGEM) - 0.1, v: "A", s: 66.2 },
  { de: em("e", em("lambo", GARAGEM)) - 0.1, v: "A", s: 68.0 },
];
PLANOS.sort((a, b) => a.de - b.de);
const planoEm = (t: number) => {
  let i = -1;
  while (i + 1 < PLANOS.length && PLANOS[i + 1].de <= t) i++;
  return i;
};
const CLIPE = { A: { src: staticFile(ARQ("clipes/jogo.mp4")), h: 1190, topo: 0 }, B: { src: staticFile(ARQ("clipes/jogo.mp4")), h: 1190, topo: 0 } };
// a faixa apagada das legendas dele fica em y 626–734 do clipe → na tela: 960 - 595 + (626..734)
const TOPO_FAIXA = 450;
const TARJA_Y = TOPO_FAIXA + 626 - 8;
const TARJA_H = 108 + 16;
// faixa do jogo inteira (largura 1080, sem zoom) no meio da tela
const Faixa: React.FC<{ v: "A" | "B"; s: number; z: number; luz?: number }> = ({ v, s, z, luz }) => {
  const { src, h, topo } = CLIPE[v];
  return (
    <div style={{ position: "absolute", left: 0, top: TOPO_FAIXA, width: 1080, height: h, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,.6)" }}>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${z})` }}>
        <OffthreadVideo src={src} startFrom={Math.round(s * FPS)} muted style={{ position: "absolute", left: 0, top: -topo, width: 1080, height: h + topo, filter: luz ? `brightness(${luz})` : undefined }} />
      </div>
    </div>
  );
};
const Desfocado: React.FC<{ v: "A" | "B"; s: number }> = ({ v, s }) => {
  const { src, h } = CLIPE[v];
  const esc = 1920 / h;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <OffthreadVideo src={src} startFrom={Math.round(s * FPS)} muted style={{ position: "absolute", left: 540 - 540 * esc, top: 0, width: 1080 * esc, height: 1920, filter: "blur(30px) brightness(0.4)" }} />
    </AbsoluteFill>
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
        <Desfocado v={p.v} s={p.s} />
        <Faixa v={p.v} s={p.s} z={z} luz={p.luz} />
      </AbsoluteFill>
    </Sequence>
  );
};

// ---------- título (em cima): número grande da contagem + título curto ----------
type Tela = { de: number; ate: number; n?: string; rotulo?: string; cor: string; titulo: string };
const TELAS: Tela[] = [
  { de: 0.05, ate: em("e", em("nenhuma")) - 0.05, rotulo: "4 EM VICE CITY", cor: VERDE, titulo: "SUPERCARROS DE GRAÇA" },
  { de: em("e", em("nenhuma")), ate: N1 - 0.05, rotulo: "NO FINAL", cor: AMARELO, titulo: "A GARAGEM SURPRESA" },
  { de: N1, ate: N2 - 0.05, n: "1", rotulo: "VESPUCCI ISLAND", cor: ROSA, titulo: "EMERUS RUBI" },
  { de: N2, ate: N3 - 0.05, n: "2", rotulo: "CASANOVA ISLAND · COM CLONADOR", cor: AMARELO, titulo: "URUS DE OURO" },
  { de: N3, ate: N4 - 0.05, n: "3", rotulo: "CRIMSON PALMS · RAMPA DA DIREITA", cor: AMARELO, titulo: "LAMBO DE OURO" },
  { de: N4, ate: GARAGEM - 0.05, n: "4", rotulo: "STARFISH ISLAND", cor: LARANJA, titulo: "O DE ONCINHA 🐆" },
  { de: GARAGEM, ate: FINAL - 0.1, rotulo: "MUDA A CADA VISITA, DIZ A GALERA", cor: AZUL, titulo: "A GARAGEM SURPRESA" },
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
      <div style={{ fontWeight: 900, fontSize: tela.titulo === "“NÃO”" ? 130 : n > 18 ? 68 : n > 14 ? 78 : 92, lineHeight: 1.02, letterSpacing: -1, color: "#fff", WebkitTextStroke: "8px #000", paintOrder: "stroke fill", textShadow: sombra, transform: `translateY(${(1 - k) * 20}px) scale(${0.94 + 0.06 * k})` }}>{tela.titulo}</div>
    </div>
  );
};

// ---------- legenda (embaixo) ----------
const DESTAQUE = /^(quatro|supercarros|graça|vice|city|trava|garagem|vespucci|island|progen|emerus|rubi|cerca|segurança|derruba|alarme|destrancada|sua|casanova|fundos|urus|ouro|clonador|cartas|crimson|palms|rampa|direita|lambo|starfish|oncinha|pounds|g-wagon|mudam|fase|extra|vyce|comenta)$/i;
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
    <div style={{ position: "absolute", top: TARJA_Y + 14, left: 50, right: 50, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 18px" }}>
      {BLOCOS[i].map((p, j) => (
        <span key={j} style={{ fontFamily, fontWeight: 900, fontSize: 66, lineHeight: 1.1, color: DESTAQUE.test(limpa(p.w)) ? AMARELO : "#fff", opacity: t >= p.s - 0.03 ? 1 : 0, WebkitTextStroke: "10px #000", paintOrder: "stroke fill" }}>
          {p.w.replace(/[.,:!]$/, "")}
        </span>
      ))}
    </div>
  );
};

// ---------- final: o Vyce DENTRO do GTA, na frente da mansão de Starfish Island ----------
const boca = (f: number) => (dados.boca as number[])[f] ?? 0;
const pisca = (t: number) => {
  const c = t % 4.3;
  return c > 1.4 && c < 1.52;
};
const OPCOES: [string, string, string, string][] = [
  ["1", "🔴", "A EMERUS RUBI", ROSA],
  ["2", "🟡", "O LAMBO DE OURO", AMARELO],
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
          <OffthreadVideo src={CLIPE.A.src} startFrom={Math.round(56.0 * FPS)} muted style={{ position: "absolute", left: -(1920 / 1190 * 1080 - 1080) / 2, top: 0, width: 1920 / 1190 * 1080, height: 1920, filter: "blur(3px)" }} />
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

// ---------- som: voz + música (Funkee Monkeee, Mixkit 1140) bem baixa + whoosh/pop nos números + efeitos virais pontuais ----------
const PASSOS = [N1, N2, N3, N4, GARAGEM];
const VIRAL = (n: string) => `fase-extra/sons/virais/${n}.wav`;
const SONS: [number, string, number][] = [
  ...PASSOS.map((q) => [q - 0.05, "whoosh", 0.1] as [number, string, number]),
  ...PASSOS.map((q) => [q + 0.05, "pop", 0.12] as [number, string, number]),
  [FINAL, "whoosh", 0.1],
  [em("graça") + 0.3, VIRAL("cha-ching-dinheiro"), 0.22],
  [em("derruba") + 0.1, VIRAL("hit-minecraft"), 0.3],
  [em("garagem", GARAGEM) + 0.1, VIRAL("magic-reveal"), 0.22],
];
const falando = (t: number) => PAL.some((p) => t >= p.s - 0.04 && t <= p.e + 0.04);
const DUCK: number[] = (() => {
  const bruto = Array.from({ length: DURACAO_FASE37 }, (_, i) => (falando(i / FPS) ? 0.5 : 0.85));
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

export const VideoFase37: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Fundo t={t} />
      {t < FINAL + 0.3 && <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.5) 0%, rgba(0,0,0,0) 24%, rgba(0,0,0,0) 74%, rgba(0,0,0,.6) 100%)" }} />}
      <Titulos t={t} />
      <VyceNoGta t={t} f={f} />
      {t < FINAL && <div style={{ position: "absolute", left: 0, right: 0, top: TARJA_Y, height: TARJA_H, background: "rgba(8,8,14,.88)", boxShadow: "0 0 30px rgba(0,0,0,.6)" }} />}
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
