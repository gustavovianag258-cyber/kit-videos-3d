import { loadFont } from "@remotion/google-fonts/Montserrat";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { Camera } from "../Estudio";
import { Mascote3D, PoseMascote } from "../Mascote3D";
import dados from "./mapa-dados.json";

// Fase Extra, Fase 26 (extra): vídeo rápido "ONDE FICA" a base do caranguejo gigante, com o MAPA do jogo.
// Mapa: trecho de clipes/jogo.mp4 (44,5–48,4 s: o mapa com o cursor perto de "Vale Pelican" e o zoom até "Destino")
// e as fotos mapa/largo.png e mapa/perto.png (quadros 1920x1080 desse trecho; o cursor fica no centro, 960x540).
const { fontFamily } = loadFont("normal", { weights: ["600", "800", "900"], subsets: ["latin"] });
export const FPS = 30;
const FIM = dados.duracao + 1.0;
export const DURACAO_FASE26_MAPA = Math.ceil(FIM * FPS);
const VERDE = "#7CFF9B";
const AMARELO = "#FFD84A";
const VERMELHO = "#FF4B4B";
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const suave = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
const entra = (t: number, a: number, d = 0.3) => interpolate(t, [a, a + d], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) });
const pula = (t: number, a: number) => interpolate(t, [a, a + 0.35], [0, 1], { ...cl, easing: Easing.out(Easing.back(1.8)) });
const sombra = "0 4px 22px rgba(0,0,0,.8)";
const contorno = (px: number) => ({ WebkitTextStroke: `${px}px #000`, paintOrder: "stroke fill" as const });
const ARQ = (n: string) => `fase-extra/fase26/${n}`;

type Pal = { w: string; s: number; e: number };
const PAL = dados.palavras as Pal[];
const limpa = (w: string) => w.toLowerCase().replace(/[.,?!:…“”"]/g, "");
const em = (palavra: string, depois = 0) => PAL.find((p) => limpa(p.w) === palavra && p.s >= depois)?.s ?? 999;
const ABRE = em("abre");
const NOME = em("vale");
const BASE = em("a", em("keys"));
const MARCA = em("marca");
const CHEGANDO = em("chegando");
const SENHA = em("senha", CHEGANDO);
const COFRE = em("cofre", CHEGANDO);
const GALPAO = em("galpão", CHEGANDO);
const SALVA = em("salva");
const FINAL = em("você", SALVA) - 0.15;
const ENQ = em("comenta", FINAL);

// recorte vertical de um quadro 1920x1080 (k = altura relativa; 1.778 = 9:16 cheio)
const CHEIO = 1920 / 1080;
const pos = (k: number, cx: number, cy: number) => {
  const w = 1920 * k;
  const h = 1080 * k;
  return { left: 540 - (cx / 1920) * w, top: 960 - (cy / 1080) * h, width: w, height: h };
};

// alvo vermelho pulsando no centro da tela (onde fica o cursor do mapa)
const Alvo: React.FC<{ t: number; de: number; rotulo: string; y?: number; raio?: number }> = ({ t, de, rotulo, y = 960, raio = 110 }) => {
  const k = pula(t, de);
  const p = 1 + 0.08 * Math.sin((t - de) * 7);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, opacity: Math.min(1, k * 1.4) }}>
      <div style={{ position: "absolute", left: 540 - raio, top: y - raio, width: raio * 2, height: raio * 2, borderRadius: raio, border: "12px solid #000", transform: `scale(${(0.6 + 0.4 * k) * p})` }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: raio, border: `8px solid ${VERMELHO}` }} />
      </div>
      <div style={{ position: "absolute", top: y + raio + 30, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div style={{ fontFamily, fontWeight: 900, fontSize: 64, color: "#fff", background: VERMELHO, borderRadius: 16, padding: "4px 28px", boxShadow: "0 6px 24px rgba(0,0,0,.5)" }}>{rotulo}</div>
      </div>
    </div>
  );
};

const Mapa: React.FC<{ t: number }> = ({ t }) => {
  if (t > CHEGANDO + 0.2) return null;
  // 1) gancho: mapa largo (vídeo), zoom lento no cursor
  // 2) "procura o nome Vale Pelican": foto larga mais aberta, seta pro nome
  // 3) "a base fica bem aqui": o zoom do mapa até "Destino" (vídeo)
  // 4) "marca o destino": foto de perto
  const fase = t < ABRE - 0.1 ? 1 : t < BASE - 0.1 ? 2 : t < MARCA - 0.1 ? 3 : 4;
  let el: React.ReactNode = null;
  if (fase === 1) {
    const k = interpolate(t, [0, ABRE], [1.9, 2.3], cl);
    el = <Img src={staticFile(ARQ("mapa/largo.png"))} style={{ position: "absolute", ...pos(k, 960, 540) }} />;
  } else if (fase === 2) {
    const k = interpolate(t, [ABRE, BASE], [1.8, 2.0], { ...cl, easing: Easing.inOut(Easing.sin) });
    el = <Img src={staticFile(ARQ("mapa/largo.png"))} style={{ position: "absolute", ...pos(k, 1060, 540) }} />;
  } else if (fase === 3) {
    el = (
      <Sequence from={Math.round((BASE - 0.1) * FPS)} layout="none">
        <OffthreadVideo src={staticFile(ARQ("clipes/jogo.mp4"))} startFrom={Math.round(45.6 * FPS)} playbackRate={(48.3 - 45.6) / Math.max(0.5, MARCA - BASE)} muted style={{ position: "absolute", ...pos(CHEIO, 960, 540) }} />
      </Sequence>
    );
  } else {
    const k = interpolate(t, [MARCA, CHEGANDO], [1.9, 2.2], cl);
    el = <Img src={staticFile(ARQ("mapa/perto.png"))} style={{ position: "absolute", ...pos(k, 960, 540) }} />;
  }
  // posição do cursor na fase 2 (a foto está centrada em x=1060 → cursor 100 px à esquerda, escalado)
  const k2 = interpolate(t, [ABRE, BASE], [1.8, 2.0], { ...cl, easing: Easing.inOut(Easing.sin) });
  return (
    <AbsoluteFill style={{ background: "#0B0820", overflow: "hidden" }}>
      {el}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.55) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 70%, rgba(0,0,0,.5) 100%)" }} />
      {fase === 1 && <Alvo t={t} de={0.2} rotulo="AQUI" />}
      {fase === 2 && (
        <>
          <div style={{ position: "absolute", left: 540 - 100 * k2 - 70, top: 960 - 70, width: 140, height: 140, borderRadius: 70, border: `8px solid ${VERMELHO}`, opacity: entra(t, em("esquerdo") - 0.2) }} />
          <div style={{ position: "absolute", left: 540 + (1166 - 1060) * k2 - 200, top: 960 + (474 - 540) * k2 - 60, width: 400, height: 120, borderRadius: 30, border: `8px solid ${AMARELO}`, opacity: entra(t, NOME - 0.15) }} />
          <div style={{ position: "absolute", top: 960 + (474 - 540) * k2 - 150, left: 0, right: 0, textAlign: "center", fontFamily, fontWeight: 900, fontSize: 46, color: AMARELO, ...contorno(8), opacity: entra(t, NOME - 0.15) }}>"VALE PELICAN"</div>
        </>
      )}
      {fase === 3 && <Alvo t={t} de={BASE} rotulo="A BASE" raio={90} />}
      {fase === 4 && <Alvo t={t} de={MARCA - 0.1} rotulo="MARCA O DESTINO" raio={100} />}
    </AbsoluteFill>
  );
};

// passos na base (gameplay) com os códigos
const Passos: React.FC<{ t: number }> = ({ t }) => {
  if (t < CHEGANDO - 0.1 || t > FINAL + 0.2) return null;
  const src = t < SENHA - 0.1 ? 64.6 : t < COFRE - 0.1 ? 84.6 : t < GALPAO - 0.1 ? 201.0 : t < SALVA - 0.1 ? 239.5 : 130.0;
  const de = t < SENHA - 0.1 ? CHEGANDO - 0.1 : t < COFRE - 0.1 ? SENHA - 0.1 : t < GALPAO - 0.1 ? COFRE - 0.1 : t < SALVA - 0.1 ? GALPAO - 0.1 : SALVA - 0.1;
  const itens: [string, string, number][] = [
    ["1", "LIGA A ENERGIA", CHEGANDO + 0.6],
    ["2", "SENHA: CLEAVES", SENHA - 0.1],
    ["3", "COFRE: 0072", COFRE - 0.1],
    ["4", "GALPÃO: 0212", GALPAO - 0.1],
  ];
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <Sequence key={src} from={Math.round(de * FPS)} layout="none">
        <OffthreadVideo src={staticFile(ARQ("clipes/jogo.mp4"))} startFrom={Math.round(src * FPS)} muted style={{ position: "absolute", ...pos(CHEIO, src === 201.0 ? 1000 : src === 239.5 ? 1100 : 960, 540) }} />
      </Sequence>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.6) 0%, rgba(0,0,0,.2) 40%, rgba(0,0,0,.2) 60%, rgba(0,0,0,.6) 100%)" }} />
      <div style={{ position: "absolute", top: 230, left: 70, right: 70, fontFamily }}>
        <div style={{ fontWeight: 800, fontSize: 32, letterSpacing: 8, color: VERDE, ...contorno(6) }}>CHEGANDO LÁ</div>
        {itens.map(([n, txt, d]) => {
          const k = pula(t, d);
          return (
            <div key={n} style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 18, opacity: Math.min(1, k * 1.4), transform: `translateX(${(1 - k) * -40}px)`, width: "fit-content", background: "rgba(8,10,18,.86)", borderLeft: `10px solid ${AMARELO}`, borderRadius: 14, padding: "10px 26px 10px 18px" }}>
              <span style={{ fontWeight: 900, fontSize: 56, color: AMARELO }}>{n}</span>
              <span style={{ fontWeight: 900, fontSize: 56, color: "#fff" }}>{txt}</span>
            </div>
          );
        })}
        <div style={{ marginTop: 26, fontWeight: 900, fontSize: 60, color: VERDE, ...contorno(8), opacity: entra(t, SALVA - 0.1) }}>= $10.000 + ARMA 💵</div>
      </div>
    </AbsoluteFill>
  );
};

// títulos do mapa
const Titulo: React.FC<{ t: number }> = ({ t }) => {
  if (t >= CHEGANDO - 0.1) return null;
  const tela = t < ABRE - 0.05 ? { r: "GTA 6 · ONDE FICA", l: ["OS $10.000 DO", "CARANGUEJO 🦀"], c: VERDE, de: 0.05, ate: ABRE - 0.05 } : t < BASE - 0.05 ? { r: "NO MAPA", l: ["PROCURA", "VALE PELICAN"], c: AMARELO, de: ABRE, ate: BASE - 0.05 } : { r: "PÂNTANO · ACIMA DAS KEYS", l: ["É BEM", "AQUI 📍"], c: VERMELHO, de: BASE, ate: CHEGANDO - 0.1 };
  const k = entra(t, tela.de, 0.3);
  const s = suave(t, tela.ate - 0.15, tela.ate);
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: 230, fontFamily, opacity: k * (1 - s), transform: `translateY(${(1 - k) * 24}px)` }}>
      <div style={{ display: "inline-block", fontWeight: 900, fontSize: 30, letterSpacing: 8, color: "#111", background: tela.c, borderRadius: 14, padding: "6px 16px", marginBottom: 12 }}>{tela.r}</div>
      {tela.l.map((x) => (
        <div key={x} style={{ fontWeight: 900, fontSize: 100, lineHeight: 0.98, color: "#fff", textShadow: sombra, ...contorno(8) }}>
          {x}
        </div>
      ))}
    </div>
  );
};

// final: Vyce dentro do GTA
const boca = (f: number) => (dados.boca as number[])[f] ?? 0;
const pisca = (t: number) => {
  const c = t % 4.3;
  return c > 1.4 && c < 1.52;
};
const VyceNoGta: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  if (t < FINAL - 0.2) return null;
  const k = suave(t, FINAL - 0.2, FINAL + 0.3);
  const fala = Math.sin(t * 5.5);
  const aponta = suave(t, ENQ - 0.2, ENQ + 0.1);
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
        <OffthreadVideo src={staticFile(ARQ("clipes/jogo.mp4"))} startFrom={Math.round(59.5 * FPS)} muted style={{ position: "absolute", ...pos(CHEIO, 760, 540) }} />
      </Sequence>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.6) 0%, rgba(0,0,0,.15) 35%, rgba(0,0,0,0) 60%, rgba(0,0,0,.3) 100%)" }} />
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
        <div style={{ fontWeight: 900, fontSize: 84, lineHeight: 1, textShadow: sombra, opacity: entra(t, ENQ - 0.2) }}>JÁ PEGOU?</div>
        <div style={{ fontWeight: 900, fontSize: 52, lineHeight: 1.1, color: AMARELO, textShadow: sombra, opacity: entra(t, ENQ) }}>COMENTA 👇</div>
      </div>
      <div style={{ position: "absolute", bottom: 110, left: 0, right: 0, textAlign: "center", fontFamily, fontWeight: 900, fontSize: 44, color: "#fff", textShadow: sombra, opacity: entra(t, FINAL + 0.6) }}>FASE EXTRA · @faseextra.br</div>
    </AbsoluteFill>
  );
};

// legenda
const DESTAQUE = /^(10|mil|dólares|caranguejo|gigante|aqui|mapa|vale|pelican|pântano|keys|base|esquerdo|destino|energia|cleaves|0072|0212|salva|fase|extra|vyce|comenta)$/i;
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
    <div style={{ position: "absolute", top: 1600, left: 50, right: 50, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 18px" }}>
      {BLOCOS[i].map((p, j) => (
        <span key={j} style={{ fontFamily, fontWeight: 900, fontSize: 66, lineHeight: 1.1, color: DESTAQUE.test(limpa(p.w)) ? AMARELO : "#fff", opacity: t >= p.s - 0.03 ? 1 : 0, ...contorno(10) }}>
          {p.w.replace(/[.,:!]$/, "")}
        </span>
      ))}
    </div>
  );
};

const falando = (t: number) => PAL.some((p) => t >= p.s - 0.04 && t <= p.e + 0.04);
const DUCK: number[] = Array.from({ length: DURACAO_FASE26_MAPA }, (_, i) => (falando(i / FPS) ? 0.5 : 0.85));
const SONS: [number, string, number][] = [
  [0.2, "pop", 0.18],
  [ABRE - 0.05, "whoosh", 0.12],
  [BASE - 0.05, "whoosh", 0.12],
  [BASE, "pop", 0.18],
  [MARCA - 0.1, "sino", 0.16],
  [CHEGANDO - 0.05, "whoosh", 0.12],
  [SENHA - 0.1, "pop", 0.16],
  [COFRE - 0.1, "pop", 0.16],
  [GALPAO - 0.1, "pop", 0.16],
  [SALVA - 0.1, "sino", 0.16],
  [FINAL, "whoosh", 0.12],
];

export const VideoFase26Mapa: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Mapa t={t} />
      <Passos t={t} />
      <Titulo t={t} />
      <VyceNoGta t={t} f={f} />
      <Legenda t={t} />
      <Audio src={staticFile(ARQ("mapa/narracao.wav"))} />
      <Audio src={staticFile(ARQ("trilha.wav"))} volume={(q) => 0.5 * (DUCK[q] ?? 0.5)} />
      {SONS.map(([q, nome, vol], i) => (
        <Sequence key={i} from={Math.max(0, Math.round(q * FPS))} durationInFrames={60}>
          <Audio src={staticFile(nome === "whoosh" ? "fase-extra/sons/whoosh.wav" : ARQ(`sfx-${nome}.wav`))} volume={vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
