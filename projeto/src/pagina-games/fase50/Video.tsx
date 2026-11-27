import { loadFont } from "@remotion/google-fonts/Montserrat";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { Camera } from "../Estudio";
import { CorPele, Mascote3D, PoseMascote } from "../Mascote3D";
import dados from "./dados.json";


// Fase Extra, Fase 50: "A missão mais bizarra do GTA 6 (e a teoria de que a Lúcia é um clone)" — missão "The Final Flush",
// gameplay do Shirrako (sem narração). clipes/jogo.mp4 = o vídeo inteiro em 30 fps, já clareado (gama 1,45). O jogo entra inteiro
// na largura, sem zoom, cortando só a faixa de baixo (y > 900: legenda do jogo e marca d'água dele). Os corpos do bunker ficam
// DESFOCADOS (caixas "borra"). Som do jogo nos respiros (sem narração no vídeo base). Teoria do clone = TheGamer, marcada como TEORIA.
const { fontFamily } = loadFont("normal", { weights: ["600", "800", "900"], subsets: ["latin"] });
export const FPS = 30;
const FIM = dados.duracao + 1.2;
export const DURACAO_FASE50 = Math.ceil(FIM * FPS);
const AMARELO = "#FFD84A";
const VERDE = "#7CFF9B";
const ROSA = "#FF7EB6";
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const suave = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
const entra = (t: number, a: number, d = 0.3) => interpolate(t, [a, a + d], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) });
const sombra = "0 4px 22px rgba(0,0,0,.8)";
const ARQ = (n: string) => `fase-extra/fase50/${n}`;


// ---------- âncoras ----------
type Pal = { w: string; s: number; e: number };
const PAL = dados.palavras as Pal[];
const limpa = (w: string) => w.toLowerCase().replace(/[.,?!:…“”"]/g, "");
const em = (palavra: string, depois = 0) => PAL.find((p) => limpa(p.w) === palavra && p.s >= depois)?.s ?? 999;
const P1 = em("começa");
const P2 = em("lá", 15);
const P3 = em("você", 25);
const P4 = em("lá", 32);
const PASSOU = em("acorda");
const MAS = em("mas", 40);
const LIGA = em("o", em("lúcia", 51));
const FINAL = em("você", em("nada")) - 0.15;
const ENQ = em("e", em("vyce", FINAL));

// ---------- planos (s = segundo do vídeo ORIGINAL; borra = caixa desfocada [x, y, w, h] no quadro 1920x1080) ----------
type Plano = { de: number; s: number; v?: 1 | 2; luz?: number; mapa?: boolean; soco?: boolean; som?: number; borra?: [number, number, number, number] };
const CORPOS: [number, number, number, number] = [640, 340, 820, 360];
const PLANOS: Plano[] = [
  { de: 0, s: 962.0, som: 0 },
  { de: em("e", 3) - 0.1, s: 1174.5, borra: CORPOS, som: 0 },
  { de: em("só", 5) - 0.1, s: 1316.0, luz: 1.5, som: 0 },
  // 1 · o cartaz
  { de: P1 - 0.1, s: 4.0 },
  { de: em("um", P1) - 0.1, s: 9.0 },
  { de: em("lê") - 0.1, s: 22.0 },
  { de: em("frank's") - 0.1, s: 66.0 },
  // 2 · Dr. Merle
  { de: P2 - 0.1, s: 105.0, som: 0 },
  { de: em("a", em("merle")) - 0.1, s: 150.0, som: 0 },
  { de: em("andrew") - 0.1, s: 206.0, som: 0 },
  { de: em("e", em("mundo")) - 0.1, s: 226.0, som: 0 },
  { de: em("e", em("rastreador", 23)) - 0.1, s: 262.0, som: 0.6 },
  // 3 · a van
  { de: P3 - 0.1, s: 318.0, som: 0 },
  { de: em("seguindo") - 0.1, s: 400.0, som: 0 },
  { de: em("estação") - 0.1, s: 490.0, som: 0 },
  { de: em("entra") - 0.1, s: 665.0, som: 0 },
  { de: em("acha", 30) - 0.1, s: 860.0, som: 0.5 },
  // 4 · a câmara
  { de: P4 - 0.1, s: 905.0, som: 0 },
  { de: em("o", em("verde")) - 0.1, s: 950.0, som: 0 },
  { de: em("se", 37) - 0.1, s: 982.0, soco: true, som: 0.5 },
  { de: PASSOU - 0.1, s: 1020.0, luz: 1.2 },
  // o bunker (corpos desfocados)
  { de: MAS - 0.1, s: 1040.0, luz: 1.6, som: 0.5 },
  { de: em("um", MAS) - 0.1, s: 1064.0, luz: 1.4 },
  { de: em("código") - 0.1, s: 1072.0, luz: 1.4 },
  { de: em("lá", MAS) - 0.1, s: 1094.0, luz: 1.3 },
  { de: em("três", MAS) - 0.1, s: 1175.0, borra: CORPOS, soco: true, som: 0 },
  { de: em("o", em("careca")) - 0.1, s: 1181.0, borra: [820, 380, 560, 300], som: 0 },
  { de: em("aqui") - 0.1, s: 1176.0, borra: CORPOS, som: 0 },
  // a ligação e a teoria
  { de: LIGA - 0.1, s: 1173.0, borra: CORPOS, som: 0 },
  { de: em("e", em("ela", LIGA)) - 0.1, s: 1300.0, luz: 1.6, som: 0 },
  { de: em("um", em("ótima")) - 0.1, s: 1314.0, luz: 1.5, som: 0 },
  { de: em("a", em("clone")) - 0.1, s: 1322.0, luz: 1.5, som: 0 },
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
const MARCA: [number, number] = [0, 0];
const Y1 = 900; // corta a faixa de baixo (legenda do jogo e marca d'água do canal)
// o jogo inteiro na largura (sem zoom); nos momentos fortes ("soco"): flash branco + leve avanço que volta em 0,4 s
const Janela: React.FC<{ s: number; z: number; luz?: number; mapa?: boolean; t: number; soco?: number; v?: 1 | 2; borra?: [number, number, number, number] }> = ({ s, z, luz = 1.15, mapa, t, soco = 0, v, borra }) => {
  const H = Y1 * esc;
  const pulso = (t * 1.6) % 1;
  return (
    <div style={{ position: "absolute", left: 0, top: 960 - H / 2, width: 1080, height: H, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,.6)" }}>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${z + 0.06 * soco})` }}>
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
          <OffthreadVideo src={fonte(v)} startFrom={Math.round(s * FPS)} muted style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1080 * esc, filter: CLARO(luz) }} />
        )}
        {borra && <div style={{ position: "absolute", left: borra[0] * esc, top: borra[1] * esc, width: borra[2] * esc, height: borra[3] * esc, backdropFilter: "blur(26px)", WebkitBackdropFilter: "blur(26px)", background: "rgba(20,20,10,.25)", borderRadius: 30 }} />}
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
        <Janela s={p.s} v={p.v} z={z} luz={p.luz} mapa={p.mapa} t={t} soco={soco} borra={p.borra} />
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
  { de: 0.05, ate: P1 - 0.05, rotulo: "THE FINAL FLUSH", cor: VERDE, titulo: "A MISSÃO MAIS BIZARRA DO GTA 6" },
  { de: MAS, ate: LIGA - 0.05, rotulo: "BUNKER · LUMMOX COUNTY · CÓDIGO 3612", cor: ROSA, titulo: "MAS…" },
  { de: LIGA, ate: FINAL - 0.1, rotulo: "TEORIA DE UM SITE · A ROCKSTAR NÃO CONFIRMOU", cor: AMARELO, titulo: "A LÚCIA É UM CLONE? 🧬" },
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

// ---------- os passos como OBJETIVOS DE MISSÃO do GTA (a lista vai se completando) ----------
const OBJETIVOS: [number, string][] = [
  [P1, "Cartaz com QR code no banheiro"],
  [P2, "Dr. Merle no Frank's Waffles"],
  [P3, "Segue o rastreador de van"],
  [P4, "Câmara de líquido verde"],
];
const fimObj = (i: number) => OBJETIVOS[i + 1]?.[0] ?? PASSOU;
const Missao: React.FC<{ t: number }> = ({ t }) => {
  if (t < P1 - 0.1 || t >= PASSOU - 0.05) return null;
  const k = entra(t, P1 - 0.1, 0.3);
  const atual = OBJETIVOS.findIndex((_, i) => t < fimObj(i));
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: 215, fontFamily, opacity: k }}>
      <div style={{ fontWeight: 800, fontSize: 28, letterSpacing: 6, color: AMARELO, textShadow: sombra, marginBottom: 10 }}>MISSÃO · THE FINAL FLUSH</div>
      {OBJETIVOS.map(([de, txt], i) => {
        if (t < de - 0.1) return null;
        const feito = t >= fimObj(i) - 0.15;
        const e = entra(t, de - 0.1, 0.25);
        const ok = interpolate(t, [fimObj(i) - 0.15, fimObj(i) + 0.05], [0, 1], cl);
        const eAtual = i === atual;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 6, opacity: e * (feito ? 0.6 : 1), transform: `translateX(${(1 - e) * -30}px)` }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, border: `4px solid ${feito ? VERDE : "#fff"}`, background: feito ? VERDE : "rgba(0,0,0,.4)", color: "#111", fontWeight: 900, fontSize: 34, lineHeight: "38px", textAlign: "center", transform: `scale(${1 + 0.25 * Math.sin(ok * Math.PI)})` }}>{feito ? "✓" : ""}</div>
            <div style={{ fontWeight: 900, fontSize: eAtual ? 50 : 40, color: eAtual ? AMARELO : "#fff", WebkitTextStroke: "6px #000", paintOrder: "stroke fill", textShadow: sombra, textDecoration: feito ? "line-through" : "none" }}>{txt}</div>
          </div>
        );
      })}
    </div>
  );
};
// "MISSÃO CUMPRIDA" no estilo do GTA quando o carro aparece
const Cumprida: React.FC<{ t: number }> = ({ t }) => {
  const a = PASSOU - 0.05;
  if (t < a || t > a + 2.4) return null;
  const k = interpolate(t, [a, a + 0.25], [1.4, 1], { ...cl, easing: Easing.out(Easing.cubic) });
  const o = entra(t, a, 0.2) * (1 - suave(t, a + 2.0, a + 2.4));
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 880, textAlign: "center", fontFamily, opacity: o, transform: `scale(${k})` }}>
      <div style={{ fontWeight: 900, fontSize: 104, letterSpacing: 2, color: AMARELO, WebkitTextStroke: "10px #000", paintOrder: "stroke fill", textShadow: "0 6px 30px rgba(0,0,0,.9)" }}>MISSÃO CUMPRIDA</div>
      <div style={{ fontWeight: 900, fontSize: 46, color: "#fff", WebkitTextStroke: "6px #000", paintOrder: "stroke fill" }}>STAMINA MÁXIMA ↑ PRA SEMPRE</div>
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
  ["1", "🧬", "É CLONE", VERDE],
  ["2", "🤡", "É SÓ PIADA", ROSA],
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
            const kk = entra(t, em(i === 0 ? "lúcia" : "ou", ENQ) - 0.15);
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
  ...OBJETIVOS.map((_, i) => [fimObj(i) - 0.15, VIRAL("click"), 0.25] as [number, string, number]),
  [em("rastreador", 23) + 0.2, VIRAL("huh"), 0.22],
  [em("descarga", 24) + 0.15, VIRAL("peido"), 0.12, 1.2],
  [em("clones") + 0.05, BANCO("suspense-dun-dun"), 0.22, 2.2],
  [PASSOU - 0.05, BANCO("gta-mission-passed"), 0.3, 3.2],
  [MAS + 0.05, BANCO("x-files"), 0.16, 4.0],
  [em("lúcia", 51) + 0.1, BANCO("vine-boom"), 0.25, 1.5],
];

const falando = (t: number) => PAL.some((p) => t >= p.s - 0.04 && t <= p.e + 0.04);
const DUCK: number[] = (() => {
  const bruto = Array.from({ length: DURACAO_FASE50 }, (_, i) => (falando(i / FPS) ? 0.5 : 0.85));
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
      if (p.mapa || p.som === 0 || p.de >= FINAL) return null;
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

// a música abaixa enquanto toca o "mission passed" e no bunker (o X-Files)
const MUDO = (t: number) => (1 - 0.85 * suave(t, PASSOU - 0.3, PASSOU) * (1 - suave(t, PASSOU + 2.6, PASSOU + 3.2))) * (1 - 0.6 * suave(t, MAS - 0.2, MAS + 0.2) * (1 - suave(t, MAS + 3.6, MAS + 4.2)));

export const VideoFase50: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Fundo t={t} />
      {t < FINAL + 0.3 && <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.35) 0%, rgba(0,0,0,0) 24%, rgba(0,0,0,0) 78%, rgba(0,0,0,.4) 100%)" }} />}
      <Progresso t={t} />
      <Titulos t={t} />
      <Missao t={t} />
      <Cumprida t={t} />
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
