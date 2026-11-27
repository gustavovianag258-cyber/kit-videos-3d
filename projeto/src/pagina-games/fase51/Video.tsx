import { loadFont } from "@remotion/google-fonts/Montserrat";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { Camera } from "../Estudio";
import { CorPele, Mascote3D, PoseMascote } from "../Mascote3D";
import dados from "./dados.json";


// Fase Extra, Fase 51: "A Lúcia e o Jason do GTA 6 são clones?" — mesma gameplay da Fase 50 (Shirrako, sem narração, clareada
// gama 1,45), cortando a faixa de baixo (y > 900). Gancho de mistério; corpos SEM desfoque (pedido do usuário). Que o careca é o
// Jason e que os dois são clones é OPINIÃO do Vyce, marcada como TEORIA na tela.
const { fontFamily } = loadFont("normal", { weights: ["600", "800", "900"], subsets: ["latin"] });
export const FPS = 30;
const FIM = dados.duracao + 1.2;
export const DURACAO_FASE51 = Math.ceil(FIM * FPS);
const AMARELO = "#FFD84A";
const VERDE = "#7CFF9B";
const ROSA = "#FF7EB6";
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const suave = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
const entra = (t: number, a: number, d = 0.3) => interpolate(t, [a, a + d], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) });
const sombra = "0 4px 22px rgba(0,0,0,.8)";
const ARQ = (n: string) => `fase-extra/fase51/${n}`;


// ---------- âncoras ----------
type Pal = { w: string; s: number; e: number };
const PAL = dados.palavras as Pal[];
const limpa = (w: string) => w.toLowerCase().replace(/[.,?!:…“”"]/g, "");
const em = (palavra: string, depois = 0) => PAL.find((p) => limpa(p.w) === palavra && p.s >= depois)?.s ?? 999;
const BUNKER = em("só", 20);
const LIGA = em("aí", 26);
const QUEM = em("então");
const TEORIA = em("pra", 34);
const FINAL = em("você", 38) - 0.15;
const ENQ = em("e", em("vyce", FINAL));

// ---------- planos (s = segundo do vídeo ORIGINAL) ----------
type Plano = { de: number; s: number; v?: 1 | 2; luz?: number; soco?: boolean; som?: number };
const PLANOS: Plano[] = [
  // gancho
  { de: 0, s: 1272.5, luz: 1.3, soco: true, som: 0 },
  { de: em("olha") - 0.1, s: 1213.0, luz: 1.25, som: 0 },
  // a missão, rapidinho
  { de: em("tem") - 0.1, s: 105.0, som: 0 },
  { de: em("que", 6.5) - 0.1, s: 150.0, som: 0 },
  { de: em("ele", 10) - 0.1, s: 262.0, som: 0.6 },
  { de: em("e", 12) - 0.1, s: 400.0, som: 0 },
  { de: em("estação") - 0.1, s: 490.0, som: 0 },
  { de: em("lá", 14) - 0.1, s: 962.0, som: 0 },
  { de: em("a", 16.5) - 0.1, s: 980.0, soco: true, som: 0.5 },
  { de: em("e", 17.4) - 0.1, s: 1030.0, luz: 1.15, som: 0 },
  { de: em("como") - 0.1, s: 1033.0, luz: 1.15, som: 0 },
  // o bunker (sem desfoque)
  { de: BUNKER - 0.1, s: 1040.0, luz: 1.6, som: 0.5 },
  { de: em("num") - 0.1, s: 1094.0, luz: 1.3 },
  { de: em("o", 22.5) - 0.1, s: 1183.3, luz: 1.3, soco: true, som: 0 },
  { de: em("o", 24.3) - 0.1, s: 1193.0, luz: 1.3, som: 0 },
  { de: em("o", 25.3) - 0.1, s: 1204.0, luz: 1.2, som: 0 },
  { de: em("e", 26) - 0.1, s: 1197.0, luz: 1.2, soco: true, som: 0 },
  // a ligação: ela está viva
  { de: LIGA - 0.1, s: 1176.0, luz: 1.3, som: 0 },
  { de: em("e", 28.8) - 0.1, s: 1179.5, luz: 1.3, som: 0.6 },
  { de: em("viva") - 0.1, s: 1256.5, luz: 1.3, som: 0 },
  { de: QUEM - 0.1, s: 1269.0, luz: 1.3, som: 0 },
  { de: em("e", 32.7) - 0.1, s: 1279.3, luz: 1.5, som: 0 },
  // a teoria
  { de: TEORIA - 0.1, s: 1205.0, luz: 1.2, soco: true, som: 0 },
  { de: em("e", 36.4) - 0.1, s: 1313.0, luz: 1.5, som: 0 },
];
PLANOS.sort((a, b) => a.de - b.de);
const planoEm = (t: number) => {
  let i = -1;
  while (i + 1 < PLANOS.length && PLANOS[i + 1].de <= t) i++;
  return i;
};
const VIDEO = staticFile(ARQ("clipes/jogo.mp4"));
const fonte = (_v?: 1 | 2) => VIDEO;
const CHEIO = 1920 / 1080;
const Quadro: React.FC<{ s: number; k: number; filtro?: string; v?: 1 | 2 }> = ({ s, k, filtro, v }) => {
  const w = 1920 * k;
  const h = (w * 1080) / 1920;
  return <OffthreadVideo src={fonte(v)} startFrom={Math.round(s * FPS)} muted style={{ position: "absolute", left: 540 - w / 2, top: 960 - h / 2, width: w, height: h, filter: filtro }} />;
};
const CLARO = (luz: number) => `brightness(${luz}) contrast(1.06) saturate(1.15)`;
const esc = 1080 / 1920;
const Y1 = 900; // corta a faixa de baixo (legenda do jogo e marca d'água do canal)
// o jogo inteiro na largura (sem zoom); nos momentos fortes ("soco"): flash branco + leve avanço que volta em 0,4 s
const Janela: React.FC<{ s: number; z: number; luz?: number; soco?: number; v?: 1 | 2 }> = ({ s, z, luz = 1.15, soco = 0, v }) => {
  const H = Y1 * esc;
  return (
    <div style={{ position: "absolute", left: 0, top: 960 - H / 2, width: 1080, height: H, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,.6)" }}>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${z + 0.06 * soco})` }}>
        <OffthreadVideo src={fonte(v)} startFrom={Math.round(s * FPS)} muted style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1080 * esc, filter: CLARO(luz) }} />
      </div>
      {soco > 0 && <div style={{ position: "absolute", inset: 0, background: "#fff", opacity: 0.85 * soco * soco }} />}
    </div>
  );
};
const Fundo: React.FC<{ t: number }> = ({ t }) => {
  const i = planoEm(t);
  if (i < 0 || t > FINAL + 0.3) return null;
  const p = PLANOS[i];
  const fim = Math.min(PLANOS[i + 1]?.de ?? FIM, FINAL + 0.3);
  const z = 1 + 0.02 * interpolate(t, [p.de, fim], [0, 1], { ...cl, easing: Easing.inOut(Easing.sin) });
  const soco = p.soco ? 1 - suave(t, p.de, p.de + 0.4) : 0;
  const dur = Math.max(1, Math.round((fim - p.de) * FPS) + 2);
  return (
    <Sequence key={i} from={Math.round(p.de * FPS)} durationInFrames={dur} layout="none">
      <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
        <AbsoluteFill style={{ transform: "scale(1.15)" }}>
          <Quadro s={p.s} v={p.v} k={CHEIO} filtro="blur(30px) brightness(0.95)" />
        </AbsoluteFill>
        <Janela s={p.s} v={p.v} z={z} luz={p.luz} soco={soco} />
      </AbsoluteFill>
    </Sequence>
  );
};

// ---------- barra de progresso fininha no topo (dá a sensação de "falta pouco") ----------
const Progresso: React.FC<{ t: number }> = ({ t }) => {
  if (t >= FINAL) return null;
  const k = Math.min(1, t / FINAL);
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 170, height: 8, borderRadius: 4, background: "rgba(255,255,255,.18)" }}>
      <div style={{ width: `${k * 100}%`, height: "100%", borderRadius: 4, background: `linear-gradient(90deg, ${ROSA}, ${AMARELO})`, boxShadow: `0 0 12px ${AMARELO}` }} />
    </div>
  );
};

// ---------- título (em cima) ----------
type Tela = { de: number; ate: number; n?: string; rotulo?: string; cor: string; titulo: string; nota?: string };
const TELAS: Tela[] = [
  { de: 0.05, ate: em("tem") - 0.05, rotulo: "OLHA ISSO 👀", cor: VERDE, titulo: "A LÚCIA E O JASON SÃO CLONES? 🧬" },
  { de: BUNKER, ate: LIGA - 0.05, rotulo: "DEPOIS DA MISSÃO", cor: ROSA, titulo: "O BUNKER" },
  { de: QUEM, ate: TEORIA - 0.05, rotulo: "ELA TÁ VIVA…", cor: AMARELO, titulo: "QUEM TÁ MORTA NO BUNKER?" },
  { de: TEORIA, ate: FINAL - 0.1, rotulo: "TEORIA · A ROCKSTAR NÃO CONFIRMOU", cor: AMARELO, titulo: "O CARECA É O JASON?" },
];
const Titulos: React.FC<{ t: number }> = ({ t }) => {
  const tela = TELAS.find((x) => t >= x.de - 0.05 && t < x.ate);
  if (!tela) return null;
  const k = entra(t, tela.de, 0.25);
  const s = suave(t, tela.ate - 0.12, tela.ate);
  const n = tela.titulo.length;
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: 250, textAlign: "center", fontFamily, opacity: k * (1 - s) }}>
      {tela.rotulo && <div style={{ fontWeight: 800, fontSize: 32, letterSpacing: 5, color: tela.cor, textShadow: sombra, marginBottom: 6, transform: `translateY(${(1 - k) * 16}px)` }}>{tela.rotulo}</div>}
      <div style={{ fontWeight: 900, fontSize: n > 22 ? 70 : n > 16 ? 80 : 92, lineHeight: 1.02, letterSpacing: -1, color: "#fff", WebkitTextStroke: "8px #000", paintOrder: "stroke fill", textShadow: sombra, transform: `translateY(${(1 - k) * 20}px) scale(${0.94 + 0.06 * k})` }}>{tela.titulo}</div>
    </div>
  );
};

// ---------- legenda (embaixo): a palavra falada acende e dá um pulinho ----------
const BLOCOS: Pal[][] = (() => {
  const b: Pal[][] = [];
  let c: Pal[] = [];
  PAL.forEach((p, i) => {
    c.push(p);
    const n = PAL[i + 1];
    if (c.length >= 3 || /[.,?!:…”]$/.test(p.w) || !n || n.s - p.e > 0.35) {
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
    <div style={{ position: "absolute", top: 1560, left: 50, right: 50, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 24px" }}>
      {BLOCOS[i].map((p, j) => {
        const fala = t >= p.s - 0.03 && t < p.e + 0.05;
        const pulo = interpolate(t, [p.s - 0.03, p.s + 0.07, p.s + 0.17], [1, 1.1, 1.03], cl);
        return (
          <span key={j} style={{ display: "inline-block", fontFamily, fontWeight: 900, fontSize: 66, lineHeight: 1.1, color: fala ? AMARELO : "#fff", opacity: t >= p.s - 0.03 ? 1 : 0, transform: `scale(${fala ? pulo : 1})`, WebkitTextStroke: "10px #000", paintOrder: "stroke fill" }}>
            {p.w.replace(/[.,:!]$/, "")}
          </span>
        );
      })}
    </div>
  );
};

// ---------- final: o Vyce DENTRO do GTA, no jet ski, de noite ----------
const boca = (f: number) => (dados.boca as number[])[f] ?? 0;
const pisca = (t: number) => {
  const c = t % 4.3;
  return c > 1.4 && c < 1.52;
};
const OPCOES: [string, string, string, string][] = [
  ["1", "🧬", "SÃO CLONES", VERDE],
  ["2", "🤡", "É VIAGEM", ROSA],
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
        <AbsoluteFill style={{ transformOrigin: "50% 0%", transform: `scale(${1.3 + 0.04 * suave(t, FINAL, FIM)})` }}>
          <Quadro s={1316.0} k={CHEIO} filtro="blur(5px) brightness(1.05) saturate(1.1)" />
        </AbsoluteFill>
      </Sequence>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.65) 0%, rgba(0,0,0,.2) 35%, rgba(0,0,0,0) 60%, rgba(0,0,0,.45) 100%)" }} />
      <AbsoluteFill>
        <ThreeCanvas width={1080} height={1920} camera={{ fov, near: 0.05, far: 50 }} gl={{ toneMapping: THREE.ACESFilmicToneMapping, antialias: true, alpha: true }}>
          <Camera pos={[0, 1.2, 6]} alvo={[0, 1.05, 0]} />
          <hemisphereLight args={["#FFF1DE", "#4A3A2E", 1.1]} />
          <directionalLight position={[-2, 5, 4]} intensity={2.2} color="#FFF2DE" />
          <directionalLight position={[2.5, 3, -2]} intensity={1.3} color="#FFC0E8" />
          <CorPele.Provider value={{ pele: "#D9A584", funda: "#C48E6C" }}>
            <Mascote3D pos={[0.05, -0.62 * (1 - suave(t, FINAL - 0.1, FINAL + 0.35)) - 0.52, 0]} giro={-0.08 + 0.05 * Math.sin(t * 0.9)} pose={pose} boca={boca(f)} pisca={pisca(t)} olhar={0.6} sorriso />
          </CorPele.Provider>
        </ThreeCanvas>
      </AbsoluteFill>
      <div style={{ position: "absolute", top: 230, left: 70, right: 70, fontFamily, color: "#fff" }}>
        <div style={{ fontWeight: 800, fontSize: 32, letterSpacing: 8, color: "#E2C4FF", textShadow: sombra, opacity: entra(t, FINAL) }}>VOCÊ ESTÁ NA FASE EXTRA</div>
        <div style={{ fontWeight: 900, fontSize: 92, lineHeight: 1, textShadow: sombra, opacity: entra(t, ENQ - 0.2) }}>E AÍ?</div>
        <div style={{ marginTop: 10 }}>
          {OPCOES.map(([n, ic, txt, cor], i) => {
            const kk = entra(t, em(i === 0 ? "são" : "ou", ENQ) - 0.15);
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



// ---------- memes do banco (inserto curto, pulando) ----------
const MEMES: [number, number, string, number][] = [];

const pula = (t: number, a: number) => interpolate(t, [a, a + 0.12, a + 0.22], [0, 1.15, 1], cl);
const Memes: React.FC<{ t: number }> = ({ t }) => {
  const m = MEMES.find(([q, d]) => t >= q && t < q + d);
  if (!m) return null;
  const [q, d, arq, prop] = m;
  const w = 340;
  const k = pula(t, q) * (1 - suave(t, q + d - 0.12, q + d));
  return (
    <div style={{ position: "absolute", left: 540 - w / 2, top: 1150, width: w, height: w / prop, borderRadius: 18, overflow: "hidden", border: "8px solid #fff", boxShadow: "0 20px 50px rgba(0,0,0,.7)", transform: `scale(${k}) rotate(-3deg)` }}>
      <Img src={staticFile(ARQ(`memes/${arq}`))} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </div>
  );
};



// ---------- som (regra nova, desde a Fase 47): sem whoosh automático; memes sonoros nas viradas + música ~0,2 ----------
// O vídeo base não tem narração: o som do jogo entra nos respiros (SomDoJogo).
const VIRAL = (n: string) => `fase-extra/sons/virais/${n}.wav`;
const BANCO = (n: string) => `fase-extra/banco/sons/${n}.wav`;
const SONS: [number, string, number, number?][] = [
  [em("clones?") + 0.05, BANCO("suspense-dun-dun"), 0.22, 2.2],
  [em("rastreador") + 0.2, VIRAL("huh"), 0.22],
  [em("descarga") + 0.15, VIRAL("peido"), 0.12, 1.2],
  [BUNKER + 0.05, BANCO("x-files"), 0.16, 4.0],
  [em("lúcia.", 26) + 0.1, BANCO("vine-boom"), 0.25, 1.5],
  [TEORIA + 0.05, BANCO("suspense-dun-dun"), 0.22, 2.2],
];

const falando = (t: number) => PAL.some((p) => t >= p.s - 0.04 && t <= p.e + 0.04);
const DUCK: number[] = (() => {
  const bruto = Array.from({ length: DURACAO_FASE51 }, (_, i) => (falando(i / FPS) ? 0.5 : 0.85));
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



// som do próprio jogo (gameplay nova, sem narração): baixo por baixo da voz, sobe quando o Vyce para e nos momentos fortes.
// Fica mudo onde a gameplay tem o policial xingando (11–21,5 s dela) e nos planos que vêm do vídeo base (ele narra).
const SomDoJogo: React.FC<{ t: number }> = () => (
  <>
    {PLANOS.map((p, i) => {
      if (p.som === 0 || p.de >= FINAL) return null;
      const fim = Math.min(PLANOS[i + 1]?.de ?? FINAL, FINAL);
      const d = Math.round((fim - p.de) * FPS);
      if (d <= 0) return null;
      const base = p.som ?? 0.35;
      return (
        <Sequence key={i} from={Math.round(p.de * FPS)} durationInFrames={d}>
          <Audio src={staticFile(ARQ("jogo-audio.wav"))} startFrom={Math.round(p.s * FPS)} volume={(q) => base * (falando((p.de * FPS + q) / FPS) ? 0.35 : 1)} />
        </Sequence>
      );
    })}
  </>
);

// a música abaixa no bunker (o X-Files)
const MUDO = (t: number) => 1 - 0.6 * suave(t, BUNKER - 0.2, BUNKER + 0.2) * (1 - suave(t, BUNKER + 3.6, BUNKER + 4.2));

export const VideoFase51: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Fundo t={t} />
      {t < FINAL + 0.3 && <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.35) 0%, rgba(0,0,0,0) 24%, rgba(0,0,0,0) 78%, rgba(0,0,0,.4) 100%)" }} />}
      <Progresso t={t} />
      <Titulos t={t} />
      <Memes t={t} />
      <VyceNoGta t={t} f={f} />
      <Legenda t={t} />
      <Audio src={staticFile(ARQ("narracao.wav"))} />
      <SomDoJogo t={t} />
      <Audio src={staticFile(ARQ("trilha.wav"))} volume={(q) => 0.2 * (DUCK[q] ?? 0.5) * MUDO(q / FPS)} />
      {SONS.map(([q, nome, vol, dur], i) => (
        <Sequence key={i} from={Math.max(0, Math.round(q * FPS))} durationInFrames={Math.round((dur ?? 2) * FPS)}>
          <Audio src={staticFile(nome)} volume={vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
