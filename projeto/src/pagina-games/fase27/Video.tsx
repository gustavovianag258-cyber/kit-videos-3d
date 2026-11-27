import { loadFont } from "@remotion/google-fonts/Montserrat";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, Audio, Easing, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { Camera } from "../Estudio";
import { CorPele, Mascote3D, PoseMascote } from "../Mascote3D";
import dados from "./dados.json";

// Fase Extra, Fase 27: "O carro com nitro escondido no começo do GTA 6".
// Base: reel do Richardson Gomes (@richardsongomes01, Instagram Df6_dPhxvOM). Só a faixa do jogo do reel
// (1080x608, y 656) ampliada para 1920x1080 em clipes/jogo.mp4 (mesmos segundos do reel, 30 fps, com o áudio dele).
// Imagem pequena: recorte k≈1 (faixa de 1080 px no meio) com o próprio quadro desfocado no fundo; nada de esticar.
// Claro e direto: título em cima, legenda embaixo. Só a voz do Vyce (o áudio do reel fica mudo) e sem crédito, a pedido.
const { fontFamily } = loadFont("normal", { weights: ["600", "800", "900"], subsets: ["latin"] });
export const FPS = 30;
const FIM = dados.duracao + 1.0;
export const DURACAO_FASE27 = Math.ceil(FIM * FPS);
const AMARELO = "#FFD84A";
const LARANJA = "#FF8A2B";
const AZUL = "#6FD6FF";
const VERDE = "#7CFF9B";
const ROSA = "#FF7EB6";
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const suave = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
const entra = (t: number, a: number, d = 0.3) => interpolate(t, [a, a + d], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) });
const sombra = "0 4px 22px rgba(0,0,0,.8)";
const ARQ = (n: string) => `fase-extra/fase27/${n}`;

// ---------- âncoras ----------
type Pal = { w: string; s: number; e: number };
const PAL = dados.palavras as Pal[];
const limpa = (w: string) => w.toLowerCase().replace(/[.,?!:…“”"]/g, "");
const em = (palavra: string, depois = 0) => PAL.find((p) => limpa(p.w) === palavra && p.s >= depois)?.s ?? 999;
const NOFINAL = em("no", em("e", 5));
const OLHA = em("olha");
const PINTURA = em("pintura");
const TA = em("tá");
const QUEBRA = em("quebra");
const AVISO = em("aí");
const NOME = em("é", AVISO);
const PECA = em("carro", NOME);
const NITRO = em("e", em("perde"));
const FOGO = em("olha", NITRO);
const CHAMOU = em("tem", FOGO);
const CALMA = em("calma");
const MAS = em("mas", CALMA);
const ORIGEM = em("e", em("baita"));
const RUINER = em("o", em("vem"));
const COMO = em("como");
const JASON = em("pertinho", COMO);
const CASA = em("uma", COMO);
const PRINTA = em("printa");
const FINAL = em("você", PRINTA) - 0.15;
const ENQ = em("e", em("vyce", FINAL));

// ---------- planos (src = segundo de clipes/jogo.mp4 = segundo do reel; cx/cy no quadro 1920x1080; k = zoom) ----------
type Plano = { de: number; src: number; cx?: number; cy?: number; k?: number; vel?: number; vol?: number; mapa?: boolean };
const CHEIO = 1920 / 1080;
const PLANOS: Plano[] = [
  { de: 0, src: 1.0, cx: 1000, k: 1.15 },
  { de: em("carro") - 0.1, src: 4.6, cx: 1250, k: 1.2 },
  { de: NOFINAL - 0.1, src: 13.0, k: 1, mapa: true },
  { de: OLHA - 0.1, src: 5.4, cx: 1420, cy: 640, k: 1.6 },
  { de: PINTURA - 0.1, src: 2.2, cx: 1320, cy: 700, k: 1.3 },
  { de: TA - 0.1, src: 20.4, cx: 1000, k: 1.15 },
  { de: QUEBRA - 0.1, src: 22.4, cx: 960, k: 1.15 },
  { de: AVISO - 0.1, src: 25.4, cx: 560, k: 1 },
  { de: NOME - 0.1, src: 27.2, cx: 540, k: 1 },
  { de: PECA - 0.1, src: 29.0, cx: 560, k: 1 },
  { de: NITRO - 0.1, src: 37.2, k: 1.15 },
  { de: FOGO - 0.1, src: 53.2, cx: 960, cy: 820, k: 1.45, vel: 0.7 },
  { de: CHAMOU - 0.1, src: 43.6, k: 1.15 },
  { de: CALMA - 0.1, src: 46.0, k: 1.15 },
  { de: MAS - 0.1, src: 55.0, k: 1.15 },
  { de: ORIGEM - 0.1, src: 57.4, k: 1.15 },
  { de: RUINER - 0.1, src: 59.6, k: 1.15 },
  { de: COMO - 0.1, src: 12.1, k: 1, vel: 0.6, mapa: true },
  { de: CASA - 0.1, src: 15.0, k: 1, vel: 0.5, mapa: true },
  { de: PRINTA - 0.1, src: 6.0, cx: 1150, k: 1.15 },
];
const planoEm = (t: number) => {
  let i = -1;
  while (i + 1 < PLANOS.length && PLANOS[i + 1].de <= t) i++;
  return i;
};
const Quadro: React.FC<{ src: number; k: number; cx: number; cy: number; filtro?: string; vel?: number; vol?: number }> = ({ src, k, cx, cy, filtro, vel, vol }) => {
  const w = 1920 * k * (1920 / 1080) / CHEIO;
  const h = (w * 1080) / 1920;
  const left = 540 - (cx / 1920) * w;
  const top = 960 - (cy / 1080) * h;
  return (
    <OffthreadVideo
      src={staticFile(ARQ("clipes/jogo.mp4"))}
      startFrom={Math.round(src * FPS)}
      playbackRate={vel ?? 1}
      muted={vol === undefined}
      volume={vol}
      style={{ position: "absolute", left: Math.min(0, Math.max(1080 - w, left)), top, width: w, height: h, filter: filtro }}
    />
  );
};
const Fundo: React.FC<{ t: number }> = ({ t }) => {
  const i = planoEm(t);
  if (i < 0 || t > FINAL + 0.3) return null;
  const p = PLANOS[i];
  const fim = Math.min(PLANOS[i + 1]?.de ?? FIM, FINAL + 0.3);
  const k0 = p.k ?? 1.15;
  const z = 1 + 0.05 * interpolate(t, [p.de, fim], [0, 1], { ...cl, easing: Easing.inOut(Easing.sin) });
  const dur = Math.max(1, Math.round((fim - p.de) * FPS) + 2);
  return (
    <Sequence key={i} from={Math.round(p.de * FPS)} durationInFrames={dur} layout="none">
      <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
        <AbsoluteFill style={{ transform: "scale(1.1)" }}>
          <Quadro src={p.src} k={CHEIO} cx={p.cx ?? 960} cy={540} vel={p.vel} filtro="blur(30px) brightness(0.42)" />
        </AbsoluteFill>
        <AbsoluteFill style={{ transform: `scale(${z})` }}>
          <Quadro src={p.src} k={k0} cx={p.cx ?? 960} cy={p.cy ?? 540} vel={p.vel} />
        </AbsoluteFill>
      </AbsoluteFill>
    </Sequence>
  );
};

// marcador pulsando no ponto do mapa (o marcador do jogador fica no centro do quadro nos dois mapas do reel)
const Marcador: React.FC<{ t: number }> = ({ t }) => {
  const i = planoEm(t);
  if (i < 0 || !PLANOS[i].mapa || t > FINAL) return null;
  const de = PLANOS[i].de + 0.1;
  const k = interpolate(t, [de, de + 0.4], [0, 1], { ...cl, easing: Easing.out(Easing.back(1.8)) });
  const pulso = (t * 1.4) % 1;
  return (
    <div style={{ position: "absolute", left: 540, top: 960, transform: `translate(-50%,-50%) scale(${k})` }}>
      <div style={{ position: "absolute", left: -90, top: -90, width: 180, height: 180, borderRadius: 90, border: `6px solid ${AMARELO}`, opacity: 1 - pulso, transform: `scale(${0.5 + pulso})` }} />
      <div style={{ position: "absolute", left: -55, top: -55, width: 110, height: 110, borderRadius: 55, border: `8px solid ${AMARELO}`, boxShadow: `0 0 30px ${AMARELO}` }} />
      <div style={{ position: "absolute", left: -40, top: -230 + 10 * Math.sin(t * 6), fontSize: 90, filter: "drop-shadow(0 4px 10px rgba(0,0,0,.7))" }}>📍</div>
    </div>
  );
};

// ---------- título (em cima, acima da faixa do jogo) ----------
type Tela = { de: number; ate: number; rotulo?: string; cor: string; titulo: string };
const TELAS: Tela[] = [
  { de: 0.05, ate: NOFINAL - 0.05, cor: LARANJA, titulo: "CARRO RARO COM NITRO 🔥" },
  { de: NOFINAL, ate: OLHA - 0.05, rotulo: "NO FINAL", cor: AMARELO, titulo: "ONDE FICA 📍" },
  { de: OLHA, ate: TA - 0.05, cor: LARANJA, titulo: "MOTOR PRA FORA" },
  { de: TA, ate: AVISO - 0.05, cor: AZUL, titulo: "QUEBRA O VIDRO" },
  { de: AVISO, ate: NOME - 0.05, cor: AZUL, titulo: "VEÍCULO DISTINTO" },
  { de: NOME, ate: PECA - 0.05, rotulo: "O NOME DELE", cor: AMARELO, titulo: "IMPONTE RUINER TURBO" },
  { de: PECA, ate: NITRO - 0.05, rotulo: "NÃO TIRA NA OFICINA", cor: ROSA, titulo: "PEÇA ÚNICA" },
  { de: NITRO, ate: CHAMOU - 0.05, cor: LARANJA, titulo: "TEM NITRO 🔥" },
  { de: CHAMOU, ate: CALMA - 0.05, cor: AMARELO, titulo: "O MAIS RÁPIDO?" },
  { de: CALMA, ate: ORIGEM - 0.05, rotulo: "VELOCIDADE OFICIAL", cor: AZUL, titulo: "NINGUÉM MEDIU AINDA" },
  { de: ORIGEM, ate: COMO - 0.05, rotulo: "INSPIRADO NO CARRO DA", cor: VERDE, titulo: "SUPER MÁQUINA" },
  { de: COMO, ate: JASON - 0.05, rotulo: "COMO EU PROMETI", cor: AMARELO, titulo: "KEY LENTO 📍" },
  { de: JASON, ate: CASA - 0.05, rotulo: "PERTINHO DA", cor: AZUL, titulo: "CASA DO JASON" },
  { de: CASA, ate: PRINTA - 0.05, rotulo: "LEONIDA KEYS", cor: ROSA, titulo: "CASA ROSA, BEIRA D'ÁGUA" },
  { de: PRINTA, ate: FINAL - 0.1, cor: AMARELO, titulo: "PRINTA 📸" },
];
const Titulos: React.FC<{ t: number }> = ({ t }) => {
  const tela = TELAS.find((x) => t >= x.de - 0.05 && t < x.ate);
  if (!tela) return null;
  const k = entra(t, tela.de, 0.3);
  const s = suave(t, tela.ate - 0.15, tela.ate);
  const n = tela.titulo.length;
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: 250, textAlign: "center", fontFamily, opacity: k * (1 - s), transform: `translateY(${(1 - k) * 20}px) scale(${0.94 + 0.06 * k})` }}>
      {tela.rotulo && <div style={{ fontWeight: 800, fontSize: 34, letterSpacing: 7, color: tela.cor, textShadow: sombra, marginBottom: 6 }}>{tela.rotulo}</div>}
      <div style={{ fontWeight: 900, fontSize: n > 20 ? 64 : n > 15 ? 74 : n > 12 ? 86 : 100, lineHeight: 1.02, letterSpacing: -1, color: "#fff", WebkitTextStroke: "8px #000", paintOrder: "stroke fill", textShadow: sombra }}>{tela.titulo}</div>
    </div>
  );
};

// ---------- legenda (embaixo) ----------
const DESTAQUE = /^(gta|6|graça|carro|raro|nitro|final|mapa|capô|compressor|fogo|trancado|vidro|distinto|imponte|ruiner|turbo|peça|única|oficina|perde|azul|rápido|rockstar|velocidade|baita|escapamento|super|máquina|key|lento|keys|jason|rosa|avenida|printa|fase|extra|vyce|original|comenta)$/i;
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
    <div style={{ position: "absolute", top: 1580, left: 50, right: 50, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 18px" }}>
      {BLOCOS[i].map((p, j) => (
        <span key={j} style={{ fontFamily, fontWeight: 900, fontSize: 66, lineHeight: 1.1, color: DESTAQUE.test(limpa(p.w)) ? AMARELO : "#fff", opacity: t >= p.s - 0.03 ? 1 : 0, WebkitTextStroke: "10px #000", paintOrder: "stroke fill" }}>
          {p.w.replace(/[.,:!]$/, "")}
        </span>
      ))}
    </div>
  );
};

// ---------- final: o Vyce DENTRO do GTA, na frente da casa do carro ----------
const boca = (f: number) => (dados.boca as number[])[f] ?? 0;
const pisca = (t: number) => {
  const c = t % 4.3;
  return c > 1.4 && c < 1.52;
};
const OPCOES: [string, string, string, string][] = [
  ["1", "🔧", "MEXIA NO CARRO", LARANJA],
  ["2", "🔒", "DEIXAVA ORIGINAL", AZUL],
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
          <Quadro src={4.6} k={CHEIO} cx={1250} cy={540} vel={0.5} filtro="blur(2px)" />
        </AbsoluteFill>
      </Sequence>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.65) 0%, rgba(0,0,0,.2) 35%, rgba(0,0,0,0) 60%, rgba(0,0,0,.35) 100%)" }} />
      <AbsoluteFill>
        <ThreeCanvas width={1080} height={1920} camera={{ fov, near: 0.05, far: 50 }} gl={{ toneMapping: THREE.ACESFilmicToneMapping, antialias: true, alpha: true }}>
          <Camera pos={[0, 1.2, 6]} alvo={[0, 1.05, 0]} />
          <hemisphereLight args={["#FFE9D2", "#5A4A3A", 1.1]} />
          <directionalLight position={[-2, 5, 4]} intensity={2.3} color="#FFE8C8" />
          <directionalLight position={[2.5, 3, -2]} intensity={1.4} color="#FFD2A0" />
          <CorPele.Provider value={{ pele: "#D9A584", funda: "#C48E6C" }}><Mascote3D pos={[0.05, -0.62 * (1 - suave(t, FINAL - 0.1, FINAL + 0.35)) - 0.52, 0]} giro={-0.08 + 0.05 * Math.sin(t * 0.9)} pose={pose} boca={boca(f)} pisca={pisca(t)} olhar={0.6} sorriso /></CorPele.Provider>
        </ThreeCanvas>
      </AbsoluteFill>
      <div style={{ position: "absolute", top: 230, left: 70, right: 70, fontFamily, color: "#fff" }}>
        <div style={{ fontWeight: 800, fontSize: 32, letterSpacing: 8, color: "#E2C4FF", textShadow: sombra, opacity: entra(t, FINAL) }}>VOCÊ ESTÁ NA FASE EXTRA</div>
        <div style={{ fontWeight: 900, fontSize: 92, lineHeight: 1, textShadow: sombra, opacity: entra(t, ENQ - 0.2) }}>E VOCÊ?</div>
        <div style={{ marginTop: 10 }}>
          {OPCOES.map(([n, ic, txt, cor], i) => {
            const kk = entra(t, em(i === 0 ? "mexia" : "ou", ENQ) - 0.15);
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

// ---------- som: voz + música (Trap Electro Vibes, Mixkit 126) + whoosh leve nas trocas ----------
const TROCAS = [OLHA, TA, AVISO, NOME, CHAMOU, ORIGEM, COMO, FINAL];
const SONS: [number, string, number][] = [
  ...TROCAS.map((q) => [q - 0.05, "whoosh", 0.1] as [number, string, number]),
  [NOFINAL + 0.1, "pop", 0.14],
  [COMO + 0.1, "pop", 0.14],
];
const falando = (t: number) => PAL.some((p) => t >= p.s - 0.04 && t <= p.e + 0.04);
const DUCK: number[] = (() => {
  const bruto = Array.from({ length: DURACAO_FASE27 }, (_, i) => {
    const t = i / FPS;
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

export const VideoFase27: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Fundo t={t} />
      {t < FINAL + 0.3 && <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.45) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 78%, rgba(0,0,0,.6) 100%)" }} />}
      <Marcador t={t} />
      <Titulos t={t} />
      <VyceNoGta t={t} f={f} />
      <Legenda t={t} />
      <Audio src={staticFile(ARQ("narracao.wav"))} />
      <Audio src={staticFile(ARQ("trilha.wav"))} volume={(q) => 0.35 * (DUCK[q] ?? 0.5)} />
      {SONS.map(([q, nome, vol], i) => (
        <Sequence key={i} from={Math.max(0, Math.round(q * FPS))} durationInFrames={90}>
          <Audio src={staticFile(nome === "whoosh" ? "fase-extra/sons/whoosh.wav" : ARQ(`sfx-${nome}.wav`))} volume={vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
