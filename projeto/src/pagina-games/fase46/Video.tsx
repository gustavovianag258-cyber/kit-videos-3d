import { loadFont } from "@remotion/google-fonts/Montserrat";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { Camera } from "../Estudio";
import { CorPele, Mascote3D, PoseMascote } from "../Mascote3D";
import dados from "./dados.json";


// Fase Extra, Fase 46: "O palhaço assassino do GTA 6 (easter egg do It)" — a partir de um vídeo gringo (Robbin Rams).
// clipes/jogo.mp4 = o vídeo inteiro em 30 fps (mesmos segundos). Gameplay limpa, sem legenda queimada: o jogo entra INTEIRO
// na largura, sem zoom, e clareado (regra da Fase 45: nada escuro). Mapa parado com anel "AQUI" no Haymarket.
// Susto: a voz tem 2 s de silêncio depois de "e…"; a música some e o palhaço (78,4–80,4 s do original) entra sozinho.

const { fontFamily } = loadFont("normal", { weights: ["600", "800", "900"], subsets: ["latin"] });
export const FPS = 30;
const FIM = dados.duracao + 1.2;
export const DURACAO_FASE46 = Math.ceil(FIM * FPS);
const AMARELO = "#FFD84A";
const AZUL = "#6FD6FF";
const VERDE = "#7CFF9B";
const ROSA = "#FF7EB6";
const ROXO = "#C99BFF";
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const suave = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
const entra = (t: number, a: number, d = 0.3) => interpolate(t, [a, a + d], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) });
const sombra = "0 4px 22px rgba(0,0,0,.8)";
const ARQ = (n: string) => `fase-extra/fase46/${n}`;


// ---------- âncoras ----------
type Pal = { w: string; s: number; e: number };
const PAL = dados.palavras as Pal[];
const limpa = (w: string) => w.toLowerCase().replace(/[.,?!:…“”"]/g, "");
const em = (palavra: string, depois = 0) => PAL.find((p) => limpa(p.w) === palavra && p.s >= depois)?.s ?? 999;
const LUGAR = em("vai");
const ELEV = em("na", em("meia-noite"));
const CHAMA = em("aí");
const ENTRA = em("entra");
const SUSTO = em("e", em("apaga")) + 0.55; // corte pro escuro do elevador (o palhaço surge 1,8 s depois)
const PALHACO = SUSTO + (78.4 - 77.0);
const SOME = em("calma");
const INGRESSO = em("e", em("susto"));
const TERRACO = em("sobe");
const FINAL = em("você", em("fugir")) - 0.15;
const ENQ = em("e", em("vyce", FINAL));

// ---------- planos (s = segundo do vídeo ORIGINAL) ----------
type Plano = { de: number; s: number; luz?: number; mapa?: boolean };
const PLANOS: Plano[] = [
  { de: 0, s: 45.0, luz: 1.15 },
  { de: em("e", 2) - 0.1, s: 50.0, luz: 1.15 },
  { de: LUGAR - 0.1, s: 8, mapa: true },
  { de: em("um", LUGAR) - 0.1, s: 1.0, luz: 1.8 },
  { de: em("depois", LUGAR) - 0.1, s: 13.6, luz: 1.5 },
  { de: ELEV - 0.1, s: 15.5, luz: 1.3 },
  { de: em("um", ELEV) - 0.1, s: 23.0, luz: 1.3 },
  { de: em("com", ELEV) - 0.1, s: 26.0, luz: 1.2 },
  { de: em("igualzinho") - 0.1, s: 35.5, luz: 1.2 },
  { de: CHAMA - 0.1, s: 40.5, luz: 1.3 },
  { de: em("e", CHAMA) - 0.1, s: 43.5, luz: 1.15 },
  { de: ENTRA - 0.1, s: 56.5, luz: 1.1 },
  { de: em("a", em("porta")) - 0.1, s: 70.5, luz: 1.1 },
  { de: em("a", em("fecha")) - 0.1, s: 75.0, luz: 1.1 },
  { de: SUSTO, s: 77.0, luz: 1.25 },
  { de: SOME + 1.3, s: 82.6, luz: 1.15 },
  { de: INGRESSO - 0.1, s: 93.5, luz: 1.3 },
  { de: em("vale", INGRESSO) - 0.1, s: 103.0, luz: 1.2 },
  { de: em("o", em("limpas")) - 0.1, s: 106.0, luz: 1.2 },
  { de: TERRACO - 0.1, s: 122.0, luz: 1.4 },
  { de: em("terraço") - 0.1, s: 133.0, luz: 1.7 },
  { de: em("pra", em("paraquedas")) - 0.1, s: 182.0, luz: 1.8 },
];
PLANOS.sort((a, b) => a.de - b.de);
const planoEm = (t: number) => {
  let i = -1;
  while (i + 1 < PLANOS.length && PLANOS[i + 1].de <= t) i++;
  return i;
};
const VIDEO = staticFile(ARQ("clipes/jogo.mp4"));
const CHEIO = 1920 / 1080;
const Quadro: React.FC<{ s: number; k: number; filtro?: string }> = ({ s, k, filtro }) => {
  const w = 1920 * k;
  const h = (w * 1080) / 1920;
  return <OffthreadVideo src={VIDEO} startFrom={Math.round(s * FPS)} muted style={{ position: "absolute", left: 540 - w / 2, top: 960 - h / 2, width: w, height: h, filter: filtro }} />;
};
const CLARO = (luz: number) => `brightness(${luz}) contrast(1.06) saturate(1.15)`;
const esc = 1080 / 1920;
const MARCA: [number, number] = [856, 480]; // o Haymarket no mapa (quadro 1920x1080; mapas/m01.jpg = 8 s do original)
// o jogo inteiro na largura (sem zoom); tremida curta no susto
const Janela: React.FC<{ s: number; z: number; luz?: number; mapa?: boolean; t: number }> = ({ s, z, luz = 1.6, mapa, t }) => {
  const H = 1080 * esc;
  const pulso = (t * 1.6) % 1;
  const treme = t >= PALHACO && t < PALHACO + 0.5 ? 14 * (1 - (t - PALHACO) / 0.5) : 0;
  const dx = treme * Math.sin(t * 90);
  const dy = treme * Math.cos(t * 77);
  return (
    <div style={{ position: "absolute", left: 0, top: 960 - H / 2, width: 1080, height: H, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,.6)" }}>
      <div style={{ position: "absolute", inset: 0, transform: `translate(${dx}px, ${dy}px) scale(${z + (treme ? 0.04 : 0)})` }}>
        {mapa ? (
          <>
            <Img src={staticFile(ARQ("mapas/m01.jpg"))} style={{ position: "absolute", left: 0, top: 0, width: 1080, height: H }} />
            <div style={{ position: "absolute", left: MARCA[0] * esc - 60, top: MARCA[1] * esc - 60, width: 120, height: 120 }}>
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `7px solid ${ROSA}`, boxShadow: `0 0 18px ${ROSA}` }} />
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `5px solid ${ROSA}`, transform: `scale(${1 + 0.8 * pulso})`, opacity: 1 - pulso }} />
              <div style={{ position: "absolute", left: 60 - 80, top: -66, width: 160, textAlign: "center", fontFamily, fontWeight: 900, fontSize: 34, color: "#fff", WebkitTextStroke: "7px #000", paintOrder: "stroke fill" }}>AQUI ▼</div>
            </div>
          </>
        ) : (
          <OffthreadVideo src={VIDEO} startFrom={Math.round(s * FPS)} muted style={{ position: "absolute", left: 0, top: 0, width: 1080, height: H, filter: CLARO(luz) }} />
        )}
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
          <Quadro s={p.s} k={CHEIO} filtro="blur(30px) brightness(0.8)" />
        </AbsoluteFill>
        <Janela s={p.s} z={z} luz={p.luz} mapa={p.mapa} t={t} />
      </AbsoluteFill>
    </Sequence>
  );
};

// ---------- título (em cima) ----------
type Tela = { de: number; ate: number; n?: string; rotulo?: string; cor: string; titulo: string; nota?: string };
const TELAS: Tela[] = [
  { de: 0.05, ate: LUGAR - 0.05, rotulo: "EASTER EGG DO GTA 6", cor: ROSA, titulo: "TEM UM PALHAÇO ASSASSINO 🎈" },
  { de: LUGAR, ate: ELEV - 0.05, n: "1", rotulo: "DE MADRUGADA · DEPOIS DA MEIA-NOITE", cor: AZUL, titulo: "HAYMARKET · OCEAN BEACH" },
  { de: ELEV, ate: CHAMA - 0.05, n: "2", rotulo: "NA RECEPÇÃO, VIRA À ESQUERDA", cor: ROSA, titulo: "O ELEVADOR QUEBRADO 🎈" },
  { de: CHAMA, ate: ENTRA - 0.05, n: "3", rotulo: "CHAMA O OUTRO ELEVADOR", cor: AMARELO, titulo: "LOTADO DE BALÃO" },
  { de: ENTRA, ate: SUSTO - 0.05, rotulo: "A PORTA FECHA…", cor: ROXO, titulo: "A LUZ APAGA…" },
  { de: SOME + 1.3, ate: INGRESSO - 0.05, rotulo: "ELE SOME", cor: VERDE, titulo: "NÃO DÁ DANO NENHUM ✅" },
  { de: INGRESSO, ate: TERRACO - 0.05, n: "4", rotulo: "NO CHÃO DO ANDAR DE CIMA", cor: ROSA, titulo: "CUECA LIMPA GRÁTIS 🩲", nota: "INGRESSO DE PROGRAMA DE PEGADINHA · BENNY “BOO” BEDSON" },
  { de: TERRACO, ate: FINAL - 0.1, n: "5", rotulo: "ESCADA → TERRAÇO", cor: AZUL, titulo: "PARAQUEDAS PRA FUGIR 🪂" },
];

const Titulos: React.FC<{ t: number }> = ({ t }) => {
  const tela = TELAS.find((x) => t >= x.de - 0.05 && t < x.ate);
  if (!tela) return null;
  const k = entra(t, tela.de, 0.25);
  const s = suave(t, tela.ate - 0.12, tela.ate);
  const kn = interpolate(t, [tela.de, tela.de + 0.35], [0, 1], { ...cl, easing: Easing.out(Easing.back(2)) });
  const n = tela.titulo.length;
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: 230, textAlign: "center", fontFamily, opacity: k * (1 - s) }}>
      {tela.n && (
        <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 120, height: 120, borderRadius: 60, background: tela.cor, color: "#111", fontWeight: 900, fontSize: tela.n === "•" ? 120 : 84, lineHeight: 1, marginBottom: 10, boxShadow: "0 6px 26px rgba(0,0,0,.6)", transform: `scale(${kn})` }}>{tela.n}</div>
      )}
      {tela.rotulo && <div style={{ fontWeight: 800, fontSize: 32, letterSpacing: 5, color: tela.cor, textShadow: sombra, marginBottom: 6, transform: `translateY(${(1 - k) * 16}px)` }}>{tela.rotulo}</div>}
      <div style={{ fontWeight: 900, fontSize: n > 22 ? 64 : n > 16 ? 74 : 92, lineHeight: 1.02, letterSpacing: -1, color: "#fff", WebkitTextStroke: "8px #000", paintOrder: "stroke fill", textShadow: sombra, transform: `translateY(${(1 - k) * 20}px) scale(${0.94 + 0.06 * k})` }}>{tela.titulo}</div>
      {tela.nota && <div style={{ marginTop: 10, fontWeight: 800, fontSize: 26, letterSpacing: 3, color: "#fff", opacity: 0.85, textShadow: sombra }}>{tela.nota}</div>}
    </div>
  );
};

// ---------- legenda (embaixo) ----------
const DESTAQUE = /^(palhaço|assassino|gta|6|haymarket|ocean|beach|madrugada|meia-noite|esquerda|elevador|quebrado|balão|vermelho|it|coisa|outro|lotado|apaga|calma|some|susto|ingresso|pegadinha|cuecas|limpas|escada|terraço|paraquedas|fase|extra|vyce|comenta)$/i;
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
    <div style={{ position: "absolute", top: 1560, left: 50, right: 50, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 18px" }}>
      {BLOCOS[i].map((p, j) => (
        <span key={j} style={{ fontFamily, fontWeight: 900, fontSize: 66, lineHeight: 1.1, color: DESTAQUE.test(limpa(p.w)) ? AMARELO : "#fff", opacity: t >= p.s - 0.03 ? 1 : 0, WebkitTextStroke: "10px #000", paintOrder: "stroke fill" }}>
          {p.w.replace(/[.,:!]$/, "")}
        </span>
      ))}
    </div>
  );
};

// ---------- final: o Vyce DENTRO do GTA, na frente do Haymarket ----------
const boca = (f: number) => (dados.boca as number[])[f] ?? 0;
const pisca = (t: number) => {
  const c = t % 4.3;
  return c > 1.4 && c < 1.52;
};
const OPCOES: [string, string, string, string][] = [
  ["1", "🎈", "ENTRAVA NO ELEVADOR", ROSA],
  ["2", "🏃", "IA DE ESCADA", AMARELO],
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
          <Quadro s={15.0} k={CHEIO} filtro="blur(5px) brightness(1.7) saturate(1.1)" />
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
            const kk = entra(t, em(i === 0 ? "entrava" : "ou", ENQ) - 0.15);
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
const MEMES: [number, number, string, number][] = [
  [em("cuecas") + 0.1, 1.6, "hide-the-pain-harold.jpg", 480 / 601],
];

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


// ---------- som: voz + música (Feedback Dreams, Mixkit) bem baixa, que some no susto + whoosh/pop nas telas + sons do banco ----------
const VIRAL = (n: string) => `fase-extra/sons/virais/${n}.wav`;
const BANCO = (n: string) => `fase-extra/banco/sons/${n}.wav`;
const CORTES = [LUGAR, ELEV, CHAMA, INGRESSO, TERRACO];
const SONS: [number, string, number][] = [
  ...CORTES.map((q) => [q - 0.05, "whoosh", 0.1] as [number, string, number]),
  ...CORTES.map((q) => [q + 0.05, "pop", 0.11] as [number, string, number]),
  [FINAL, "whoosh", 0.1],
  [PALHACO - 0.03, BANCO("vine-boom"), 0.3],
  [em("ingresso") + 0.1, VIRAL("huh"), 0.18],
];

const falando = (t: number) => PAL.some((p) => t >= p.s - 0.04 && t <= p.e + 0.04);
const DUCK: number[] = (() => {
  const bruto = Array.from({ length: DURACAO_FASE46 }, (_, i) => (falando(i / FPS) ? 0.5 : 0.85));
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


// a música some do "e…" até o palhaço sumir (o silêncio é o susto)
const MUDO = (t: number) => 1 - suave(t, SUSTO - 0.6, SUSTO - 0.1) * (1 - suave(t, SOME + 0.6, SOME + 1.6));

export const VideoFase46: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Fundo t={t} />
      {t < FINAL + 0.3 && <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.35) 0%, rgba(0,0,0,0) 24%, rgba(0,0,0,0) 78%, rgba(0,0,0,.4) 100%)" }} />}
      <Titulos t={t} />
      <Memes t={t} />
      <VyceNoGta t={t} f={f} />
      <Legenda t={t} />
      <Audio src={staticFile(ARQ("narracao.wav"))} />
      <Audio src={staticFile(ARQ("trilha.wav"))} volume={(q) => 0.12 * (DUCK[q] ?? 0.5) * MUDO(q / FPS)} />
      {SONS.map(([q, nome, vol], i) => (
        <Sequence key={i} from={Math.max(0, Math.round(q * FPS))} durationInFrames={90}>
          <Audio src={staticFile(nome === "whoosh" ? "fase-extra/sons/whoosh.wav" : nome.includes("/") ? nome : ARQ(`sfx-${nome}.wav`))} volume={vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
