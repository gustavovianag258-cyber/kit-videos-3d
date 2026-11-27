import { loadFont } from "@remotion/google-fonts/Montserrat";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { Camera } from "../Estudio";
import { Mascote3D, PoseMascote } from "../Mascote3D";
import dados from "./dados.json";
import buracos from "./davy.json";

// Fase Extra, Fase 30: "A McLaren Senna roxa com nitro do GTA 6" (Progen "Purple Drank" Emerus, veículo distinto com nitro).
// clipes/jogo.mp4 = gameplay do GHOST YT (YouTube gBInG9-LLtM, 0–300 s, 1920x1080, 30 fps), recortado na vertical por plano
// (k = 1.778 tela cheia; k = 1 mostra 1080 px de largura, pra ler os avisos do jogo no canto, com fundo desfocado).
// mapa/mapa.png = mapa interativo da GTABase (zoom 5), marcador da Purple Drank Emerus em ~(610, 650).
// Áudio do jogo baixinho; o segurança do portão entra alto num buraco da narração (davy.json), traduzido na tela.
// Música "Gear" (Mixkit 180) a 0,5 × ducking; efeitos baixos; Vyce só no final, dentro do GTA.
const { fontFamily } = loadFont("normal", { weights: ["600", "800", "900"], subsets: ["latin"] });
export const FPS = 30;
const FIM = dados.duracao + 1.0;
export const DURACAO_FASE30 = Math.ceil(FIM * FPS);
const ROXO = "#C77DFF";
const AMARELO = "#FFD84A";
const VERMELHO = "#FF4B6B";
const VERDE = "#7CFF9B";
const AZUL = "#6FD6FF";
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const suave = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
const entra = (t: number, a: number, d = 0.3) => interpolate(t, [a, a + d], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) });
const pula = (t: number, a: number) => interpolate(t, [a, a + 0.35], [0, 1], { ...cl, easing: Easing.out(Easing.back(1.8)) });
const sombra = "0 4px 22px rgba(0,0,0,.8)";
const contorno = (px: number) => ({ WebkitTextStroke: `${px}px #000`, paintOrder: "stroke fill" as const });
const ARQ = (n: string) => `fase-extra/fase30/${n}`;

// ---------- âncoras ----------
type Pal = { w: string; s: number; e: number };
const PAL = dados.palavras as Pal[];
const limpa = (w: string) => w.toLowerCase().replace(/[.,?!:…“”"]/g, "");
const em = (palavra: string, depois = 0) => PAL.find((p) => limpa(p.w) === palavra && p.s >= depois)?.s ?? 999;
type Buraco = { de: number; src: number; dur: number; nome: string };
const B = buracos as Buraco[];
const NOME = em("no");
const PURPLE = em("purple");
const PORTO = em("ela", PURPLE);
const PELA = em("pela");
const DENTRO = em("lá", PELA);
const CONT = em("ela", DENTRO);
const AVISA = em("e", em("liga", CONT));
const NITRO = em("e", em("distinto", AVISA));
const PECAS = em("só", NITRO);
const COMO = em("como", PECAS);
const FINAL = em("você", COMO) - 0.15;
const ENQ = em("e", em("vyce", FINAL));
const FUNDO_JOGO = 0.08;

// ---------- planos ----------
type Plano = { de: number; src: number; cx?: number; k?: number; vol?: number };
const CHEIO = 1920 / 1080;
const PLANOS: Plano[] = [
  { de: 0, src: 211.0, cx: 900 },
  { de: em("roxa") - 0.1, src: 163.0 },
  { de: em("e", 4) - 0.1, src: 215.0 },
  { de: NOME - 0.1, src: 161.5, cx: 980 },
  { de: PURPLE - 0.1, src: 169.0, cx: 1150 },
  { de: PORTO - 0.1, src: 3.0 },
  { de: em("cheio", PORTO) - 0.1, src: 13.0 },
  { de: B[0].de, src: B[0].src, vol: 1 },
  { de: PELA - 0.1, src: 26.0 },
  { de: em("dá", PELA) - 0.1, src: 56.0 },
  { de: em("atravessa", PELA) - 0.1, src: 76.0 },
  { de: em("sobe", PELA) - 0.1, src: 80.5 },
  { de: DENTRO - 0.1, src: 100.0 },
  { de: CONT - 0.1, src: 150.0 },
  { de: em("entra", CONT) - 0.1, src: 153.5 },
  { de: AVISA - 0.1, src: 170.0, cx: 960 },
  { de: NITRO - 0.1, src: 162.0, cx: 1000 },
  { de: em("ou", NITRO) - 0.1, src: 164.0 },
  { de: PECAS - 0.1, src: 222.0, cx: 1020 },
  { de: em("carro", PECAS) - 0.1, src: 232.0 },
];
const planoEm = (t: number) => {
  let i = -1;
  while (i + 1 < PLANOS.length && PLANOS[i + 1].de <= t) i++;
  return i;
};
const Quadro: React.FC<{ src: number; k: number; cx: number; vol?: number; muted?: boolean; filtro?: string }> = ({ src, k, cx, vol, muted, filtro }) => {
  const w = 1920 * k;
  const h = 1080 * k;
  const left = Math.min(0, Math.max(1080 - w, 540 - (cx / 1920) * w));
  return <OffthreadVideo src={staticFile(ARQ("clipes/jogo.mp4"))} startFrom={Math.round(src * FPS)} muted={muted} volume={vol ?? FUNDO_JOGO} style={{ position: "absolute", left, top: 960 - h / 2, width: w, height: h, filter: filtro }} />;
};
const Fundo: React.FC<{ t: number }> = ({ t }) => {
  const i = planoEm(t);
  if (i < 0 || t > COMO + 0.3) return null;
  const p = PLANOS[i];
  const fim = Math.min(PLANOS[i + 1]?.de ?? FIM, COMO + 0.3);
  const k0 = p.k ?? 1.12;
  const z = 1 + 0.05 * interpolate(t, [p.de, fim], [0, 1], { ...cl, easing: Easing.inOut(Easing.sin) });
  const dur = Math.max(1, Math.round((fim - p.de) * FPS) + 2);
  const cheio = k0 >= CHEIO - 0.01;
  return (
    <Sequence key={i} from={Math.round(p.de * FPS)} durationInFrames={dur} layout="none">
      <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
        {!cheio && (
          <AbsoluteFill style={{ transform: "scale(1.1)" }}>
            <Quadro src={p.src} k={CHEIO} cx={p.cx ?? 960} muted filtro="blur(28px) brightness(0.45)" />
          </AbsoluteFill>
        )}
        <AbsoluteFill style={{ transform: `scale(${z})` }}>
          <Quadro src={p.src} k={k0} cx={p.cx ?? 960} vol={p.vol} />
        </AbsoluteFill>
      </AbsoluteFill>
    </Sequence>
  );
};

// ---------- mapa (cumpre a promessa) ----------
const MX = 610;
const MY = 650;
const Mapa: React.FC<{ t: number }> = ({ t }) => {
  if (t < COMO - 0.2 || t > FINAL + 0.1) return null;
  const k = entra(t, COMO - 0.1, 0.4);
  const esc = interpolate(t, [COMO, FINAL], [1.55, 1.9], { ...cl, easing: Easing.inOut(Easing.sin) });
  const alvo = pula(t, COMO + 0.3);
  const pulso = 1 + 0.08 * Math.sin((t - COMO) * 7);
  return (
    <AbsoluteFill style={{ background: "#0B2A3A", overflow: "hidden", opacity: k }}>
      <Img src={staticFile(ARQ("mapa/mapa.png"))} style={{ position: "absolute", left: 540 - MX * esc, top: 960 - MY * esc, width: 1280 * esc, height: 1280 * esc }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(6,10,20,.92) 0%, rgba(6,10,20,.85) 22%, rgba(0,0,0,0) 36%, rgba(0,0,0,0) 74%, rgba(0,0,0,.55) 100%)" }} />
      <div style={{ position: "absolute", left: 540 - 95, top: 960 - 95, width: 190, height: 190, borderRadius: 95, border: "12px solid #000", transform: `scale(${(0.6 + 0.4 * alvo) * pulso})`, opacity: Math.min(1, alvo * 1.4) }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: 95, border: `8px solid ${ROXO}` }} />
      </div>
      <div style={{ position: "absolute", top: 960 + 125, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: Math.min(1, alvo * 1.4) }}>
        <div style={{ fontFamily, fontWeight: 900, fontSize: 54, color: "#fff", background: ROXO, borderRadius: 16, padding: "4px 26px", boxShadow: "0 6px 24px rgba(0,0,0,.5)" }}>PURPLE DRANK EMERUS 📍</div>
      </div>
      <div style={{ position: "absolute", top: 230, left: 70, right: 70, fontFamily }}>
        <div style={{ fontWeight: 800, fontSize: 32, letterSpacing: 8, color: ROXO, ...contorno(6) }}>COMO EU PROMETI</div>
        <div style={{ fontWeight: 900, fontSize: 92, lineHeight: 1, color: "#fff", ...contorno(8) }}>ILHA DO PORTO</div>
        <div style={{ fontWeight: 800, fontSize: 40, color: AMARELO, ...contorno(6), marginTop: 6 }}>VICE CITY · DO LADO DO CENTRO</div>
      </div>
      <div style={{ position: "absolute", bottom: 40, left: 0, right: 0, textAlign: "center", fontFamily, fontWeight: 700, fontSize: 22, letterSpacing: 3, color: "rgba(255,255,255,.6)" }}>MAPA: GTABASE</div>
    </AbsoluteFill>
  );
};

// ---------- títulos ----------
type Tela = { de: number; ate: number; rotulo?: string; cor: string; titulo: string[] };
const TELAS: Tela[] = [
  { de: 0.05, ate: NOME - 0.05, rotulo: "GTA 6 · DE GRAÇA", cor: ROXO, titulo: ["McLAREN SENNA", "COM NITRO 💜"] },
  { de: NOME, ate: PORTO - 0.05, rotulo: "NO JOGO", cor: ROXO, titulo: ["PROGEN EMERUS", "PURPLE DRANK"] },
  { de: PORTO, ate: B[0].de - 0.05, cor: AZUL, titulo: ["PORTO DE", "VICE CITY"] },
  { de: PELA, ate: DENTRO - 0.05, cor: AZUL, titulo: ["ENTRA", "PELA ÁGUA"] },
  { de: DENTRO, ate: CONT - 0.05, cor: AMARELO, titulo: ["ESCONDIDO"] },
  { de: CONT, ate: NITRO - 0.05, cor: VERDE, titulo: ["DENTRO DO", "CONTÊINER"] },
  { de: NITRO, ate: PECAS - 0.05, rotulo: "NITRO", cor: ROXO, titulo: ["SEGURA LT", "(L2 NO PS5)"] },
  { de: PECAS, ate: COMO - 0.05, rotulo: "VEÍCULO DISTINTO", cor: VERMELHO, titulo: ["NÃO TIRA", "AS PEÇAS"] },
];
const Titulos: React.FC<{ t: number }> = ({ t }) => {
  const tela = TELAS.find((x) => t >= x.de - 0.05 && t < x.ate);
  if (!tela) return null;
  const k = entra(t, tela.de, 0.35);
  const s = suave(t, tela.ate - 0.2, tela.ate);
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: 230, fontFamily, opacity: k * (1 - s), transform: `translateY(${(1 - k) * 24}px)` }}>
      {tela.rotulo && <div style={{ display: "inline-block", fontWeight: 900, fontSize: 30, letterSpacing: 8, color: "#111", background: tela.cor, borderRadius: 12, padding: "6px 16px", marginBottom: 12 }}>{tela.rotulo}</div>}
      {tela.titulo.map((l) => (
        <div key={l} style={{ fontWeight: 900, fontSize: 96, lineHeight: 0.98, letterSpacing: -1, color: "#fff", textShadow: sombra, ...contorno(8) }}>
          {l}
        </div>
      ))}
    </div>
  );
};

// ---------- final: o Vyce DENTRO do GTA ----------
const boca = (f: number) => (dados.boca as number[])[f] ?? 0;
const pisca = (t: number) => {
  const c = t % 4.3;
  return c > 1.4 && c < 1.52;
};
const OPCOES: [string, string, string, string][] = [
  ["1", "💜", "FICAVA COM A ROXA", ROXO],
  ["2", "❤️", "IA ATRÁS DA VERMELHA", VERMELHO],
];
const VyceNoGta: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  if (t < FINAL - 0.2) return null;
  const k = suave(t, FINAL - 0.2, FINAL + 0.3);
  const fala = Math.sin(t * 5.5);
  const aponta = suave(t, ENQ - 0.2, ENQ + 0.1) * (1 - suave(t, ENQ + 2.4, ENQ + 2.7));
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
        <AbsoluteFill>
          <Quadro src={226.0} k={CHEIO} cx={960} muted />
        </AbsoluteFill>
      </Sequence>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.6) 0%, rgba(0,0,0,.15) 35%, rgba(0,0,0,0) 60%, rgba(0,0,0,.3) 100%)" }} />
      <AbsoluteFill>
        <ThreeCanvas width={1080} height={1920} camera={{ fov, near: 0.05, far: 50 }} gl={{ toneMapping: THREE.ACESFilmicToneMapping, antialias: true, alpha: true }}>
          <Camera pos={[0, 1.2, 6]} alvo={[0, 1.05, 0]} />
          <hemisphereLight args={["#E6D6FF", "#3A2A5A", 1.1]} />
          <directionalLight position={[0, 6, -3]} intensity={2.4} color="#E9D6FF" />
          <directionalLight position={[-2, 3, 4]} intensity={1.6} color="#FFF4E6" />
          <Mascote3D pos={[0.05, -0.62 * (1 - suave(t, FINAL - 0.1, FINAL + 0.35)) - 0.52, 0]} giro={-0.08 + 0.05 * Math.sin(t * 0.9)} pose={pose} boca={boca(f)} pisca={pisca(t)} olhar={0.6} sorriso />
        </ThreeCanvas>
      </AbsoluteFill>
      <div style={{ position: "absolute", top: 230, left: 70, right: 70, fontFamily, color: "#fff" }}>
        <div style={{ fontWeight: 800, fontSize: 32, letterSpacing: 8, color: "#E2C4FF", textShadow: sombra, opacity: entra(t, FINAL) }}>VOCÊ ESTÁ NA FASE EXTRA</div>
        <div style={{ fontWeight: 900, fontSize: 80, lineHeight: 1, textShadow: sombra, opacity: entra(t, ENQ - 0.2) }}>E VOCÊ?</div>
        <div style={{ marginTop: 10 }}>
          {OPCOES.map(([n, ic, txt, cor], i) => {
            const kk = entra(t, em(i === 0 ? "ficava" : "ou", ENQ) - 0.15);
            return (
              <div key={n} style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 14, opacity: kk, transform: `translateX(${(1 - kk) * -40}px)`, width: "fit-content", background: "rgba(10,6,20,.8)", borderLeft: `8px solid ${cor}`, borderRadius: 12, padding: "8px 22px 8px 16px" }}>
                <span style={{ fontWeight: 900, fontSize: 40, color: cor }}>{n}</span>
                <span style={{ fontSize: 42 }}>{ic}</span>
                <span style={{ fontWeight: 900, fontSize: 40 }}>{txt}</span>
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
const FALAS: [number, number, number, string, string][] = [
  [0, 8.9, 10.5, "SEGURANÇA", "HOJE NÃO TEM ENTREGA NENHUMA."],
  [0, 10.5, 12.8, "SEGURANÇA", "FOI UM SERVIÇO CORRIDO."],
  [0, 12.8, 15.7, "SEGURANÇA", "TÁ FAZENDO O QUÊ AQUI AINDA?"],
];
const DESTAQUE = /^(graça|mclaren|senna|roxa|nitro|progen|emerus|purple|drank|contêineres|porto|vice|city|segurança|água|nadando|cais|contêiner|distinto|lt|l2|peças|perde|ilha|centro|printa|vermelha|fase|extra|vyce|comenta)$/i;
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
  const fala = FALAS.find(([g, a, b]) => t >= B[g].de + (a - B[g].src) && t < B[g].de + (b - B[g].src));
  if (fala) {
    const de = B[fala[0]].de + (fala[1] - B[fala[0]].src);
    const k = interpolate(t, [de, de + 0.22], [0, 1], { ...cl, easing: Easing.out(Easing.back(2)) });
    return (
      <div style={{ position: "absolute", top: 1540, left: 30, right: 30, textAlign: "center", fontFamily, transform: `scale(${0.7 + 0.3 * k})`, opacity: k }}>
        <div style={{ fontWeight: 800, fontSize: 30, letterSpacing: 6, color: "#fff", ...contorno(6) }}>{fala[3]}:</div>
        <div style={{ fontWeight: 900, fontSize: 76, lineHeight: 1.05, color: "#9BE7FF", ...contorno(12) }}>“{fala[4]}”</div>
      </div>
    );
  }
  if (B.some((g) => t >= g.de && t < g.de + g.dur)) return null;
  const i = BLOCOS.findIndex((b, j) => t >= b[0].s - 0.05 && t < Math.min(BLOCOS[j + 1]?.[0].s ?? 999, b[b.length - 1].e + 0.5) - 0.05);
  if (i < 0) return null;
  return (
    <div style={{ position: "absolute", top: 1600, left: 50, right: 50, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 18px" }}>
      {BLOCOS[i].map((p, j) => (
        <span key={j} style={{ fontFamily, fontWeight: 900, fontSize: 66, lineHeight: 1.1, color: DESTAQUE.test(limpa(p.w)) ? AMARELO : "#fff", opacity: t >= p.s - 0.03 ? 1 : 0, ...contorno(10) }}>
          {p.w.replace(/[.,:!]$/, "")}
        </span>
      ))}
    </div>
  );
};

// ---------- som ----------
const falando = (t: number) => PAL.some((p) => t >= p.s - 0.04 && t <= p.e + 0.04);
const DUCK: number[] = (() => {
  const bruto = Array.from({ length: DURACAO_FASE30 }, (_, i) => {
    const t = i / FPS;
    if (B.some((g) => t >= g.de - 0.1 && t < g.de + g.dur)) return 0.3;
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
const TROCAS = [NOME, PORTO, PELA, DENTRO, CONT, NITRO, PECAS, COMO, FINAL];
const SONS: [number, string, number][] = [
  [AVISA, "sino", 0.08],
  [NITRO, "pop", 0.08],
  [COMO + 0.3, "pop", 0.08],
  ...TROCAS.map((q) => [q - 0.05, "whoosh", 0.06] as [number, string, number]),
];

export const VideoFase30: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Fundo t={t} />
      {t < COMO + 0.3 && <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.6) 0%, rgba(0,0,0,.12) 30%, rgba(0,0,0,0) 50%, rgba(0,0,0,.5) 100%)" }} />}
      <Titulos t={t} />
      <Mapa t={t} />
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
