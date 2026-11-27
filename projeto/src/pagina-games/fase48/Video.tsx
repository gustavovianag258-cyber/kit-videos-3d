import { loadFont } from "@remotion/google-fonts/Montserrat";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { Camera } from "../Estudio";
import { CorPele, Mascote3D, PoseMascote } from "../Mascote3D";
import dados from "./dados.json";


// Fase Extra, Fase 48: "4 motos raras do GTA 6 e onde achar" — a partir de um vídeo gringo (DeluxPlays), gameplay de dia.
// clipes/jogo.mp4 = o vídeo inteiro em 30 fps. Jogo inteiro na largura, sem zoom. Pacote da Fase 47: missão com ✓ (uma por moto),
// mapa com "AQUI" em cada lugar, barra de progresso, legenda viva, "MISSÃO CUMPRIDA". Evitados os textos queimados dele
// (20–24, 35–38, 64–67 e 215–240 s). Ele narra tudo: sem som do jogo, só memes sonoros + música.
const { fontFamily } = loadFont("normal", { weights: ["600", "800", "900"], subsets: ["latin"] });
export const FPS = 30;
const FIM = dados.duracao + 1.2;
export const DURACAO_FASE48 = Math.ceil(FIM * FPS);
const AMARELO = "#FFD84A";
const VERDE = "#7CFF9B";
const ROSA = "#FF7EB6";
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const suave = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
const entra = (t: number, a: number, d = 0.3) => interpolate(t, [a, a + d], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) });
const sombra = "0 4px 22px rgba(0,0,0,.8)";
const ARQ = (n: string) => `fase-extra/fase48/${n}`;


// ---------- âncoras ----------
type Pal = { w: string; s: number; e: number };
const PAL = dados.palavras as Pal[];
const limpa = (w: string) => w.toLowerCase().replace(/[.,?!:…“”"]/g, "");
const em = (palavra: string, depois = 0) => PAL.find((p) => limpa(p.w) === palavra && p.s >= depois)?.s ?? 999;
const L1 = em("a", 4);
const L2 = em("a", em("sair"));
const L3 = em("e", em("comprar"));
const PASSOU = em("quatro", 30);
const FINAL = em("você", em("gasto")) - 0.15;
const ENQ = em("e", em("vyce", FINAL));

// ---------- planos (s = segundo do vídeo ORIGINAL; mapa = índice em MAPAS) ----------
type Plano = { de: number; s: number; v?: 1 | 2; luz?: number; mapa?: number; soco?: boolean };
const PLANOS: Plano[] = [
  { de: 0, s: 418.0 },
  { de: em("uma", 2) - 0.1, s: 146.5, soco: true },
  // 1 · Dinka Double-T (Vespucci Island)
  { de: L1 - 0.1, s: 46, mapa: 1 },
  { de: em("dinka") - 0.1, s: 68.3 },
  { de: em("numa", L1) - 0.1, s: 58.0 },
  { de: em("ela", L1) - 0.1, s: 69.0 },
  { de: em("sem", L1) - 0.1, s: 80.5 },
  { de: em("é", em("clonador")) - 0.1, s: 86.0 },
  // 2 · Nagasaki Hung Carbon RS (Leonard County, na árvore)
  { de: L2 - 0.1, s: 118, mapa: 2 },
  { de: em("numa", L2) - 0.1, s: 127.0 },
  { de: em("alguém") - 0.1, s: 137.0 },
  { de: em("e", em("árvore", L2)) - 0.1, s: 146.5, soco: true },
  { de: em("atira") - 0.1, s: 155.5 },
  { de: em("e", em("correntes")) - 0.1, s: 161.6, soco: true },
  { de: em("ainda") - 0.1, s: 166.3 },
  // 3 e 4 · SFB 1000 e Alvino V1 (Starfish Island, garagem dos fundos)
  { de: L3 - 0.1, s: 299, mapa: 3 },
  { de: em("starfish") - 0.1, s: 304.0 },
  { de: em("a", em("island", L3)) - 0.1, s: 308.0 },
  { de: em("sobe") - 0.1, s: 312.5 },
  { de: em("e", em("lado", L3)) - 0.1, s: 317.0 },
  { de: em("na", em("pula")) - 0.1, s: 405.5 },
  { de: em("nagasaki") - 0.1, s: 411.0 },
  { de: em("principe") - 0.1, s: 433.0 },
  { de: em("desliga") - 0.1, s: 438.0 },
  { de: em("pode") - 0.1, s: 441.0, soco: true },
  { de: PASSOU - 0.1, s: 485.0 },
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
// mapas parados (segundo do original) e o ponto exato de cada lugar no quadro 1920x1080
const MAPAS: [string, number, number][] = [["", 0, 0], ["m46.jpg", 954, 534], ["m118.jpg", 958, 540], ["m299.jpg", 957, 540]];
// o jogo inteiro na largura (sem zoom); nos momentos fortes ("soco"): flash branco + leve avanço que volta em 0,4 s
const Janela: React.FC<{ s: number; z: number; luz?: number; mapa?: number; t: number; soco?: number; v?: 1 | 2 }> = ({ s, z, luz = 1.05, mapa, t, soco = 0, v }) => {
  const H = 1080 * esc;
  const MARCA = MAPAS[mapa ?? 0];
  const pulso = (t * 1.6) % 1;
  return (
    <div style={{ position: "absolute", left: 0, top: 960 - H / 2, width: 1080, height: H, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,.6)" }}>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${z + 0.06 * soco})` }}>
        {mapa ? (
          <>
            <Img src={staticFile(ARQ(`mapas/${MARCA[0]}`))} style={{ position: "absolute", left: 0, top: 0, width: 1080, height: H }} />
            <div style={{ position: "absolute", left: MARCA[1] * esc - 60, top: MARCA[2] * esc - 60, width: 120, height: 120 }}>
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `7px solid ${ROSA}`, boxShadow: `0 0 18px ${ROSA}` }} />
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `5px solid ${ROSA}`, transform: `scale(${1 + 0.8 * pulso})`, opacity: 1 - pulso }} />
              <div style={{ position: "absolute", left: 60 - 80, top: -66, width: 160, textAlign: "center", fontFamily, fontWeight: 900, fontSize: 34, color: "#fff", WebkitTextStroke: "7px #000", paintOrder: "stroke fill" }}>AQUI ▼</div>
            </div>
          </>
        ) : (
          <OffthreadVideo src={fonte(v)} startFrom={Math.round(s * FPS)} muted style={{ position: "absolute", left: 0, top: 0, width: 1080, height: H, filter: CLARO(luz) }} />
        )}
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
        <Janela s={p.s} v={p.v} z={z} luz={p.luz} mapa={p.mapa} t={t} soco={soco} />
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
  { de: 0.05, ate: L1 - 0.05, rotulo: "UMA TÁ PENDURADA NUMA ÁRVORE", cor: AMARELO, titulo: "4 MOTOS RARAS DO GTA 6" },
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

// ---------- as motos como OBJETIVOS DE MISSÃO do GTA (cada uma ganha ✓ quando ele pega) ----------
const OBJETIVOS: [number, number, string][] = [
  [L1, em("sair"), "Dinka Double-T · Vespucci Island"],
  [L2, em("cai"), "Hung Carbon RS · Leonard County"],
  [L3, em("levar"), "SFB 1000 · Starfish Island"],
  [L3, em("levar") + 0.25, "Alvino V1 · Starfish Island"],
];
const Missao: React.FC<{ t: number }> = ({ t }) => {
  if (t < L1 - 0.1 || t >= PASSOU - 0.05) return null;
  const k = entra(t, L1 - 0.1, 0.3);
  const atual = OBJETIVOS.findIndex(([de, fim]) => t >= de - 0.1 && t < fim);
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: 215, fontFamily, opacity: k }}>
      <div style={{ fontWeight: 800, fontSize: 28, letterSpacing: 6, color: AMARELO, textShadow: sombra, marginBottom: 10 }}>MISSÃO · 4 MOTOS RARAS</div>
      {OBJETIVOS.map(([de, fim, txt], i) => {
        if (t < de - 0.1) return null;
        const feito = t >= fim - 0.15;
        const e = entra(t, de - 0.1, 0.25);
        const ok = interpolate(t, [fim - 0.15, fim + 0.05], [0, 1], cl);
        const eAtual = i === atual;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 6, opacity: e * (feito ? 0.6 : 1), transform: `translateX(${(1 - e) * -30}px)` }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, border: `4px solid ${feito ? VERDE : "#fff"}`, background: feito ? VERDE : "rgba(0,0,0,.4)", color: "#111", fontWeight: 900, fontSize: 34, lineHeight: "38px", textAlign: "center", transform: `scale(${1 + 0.25 * Math.sin(ok * Math.PI)})` }}>{feito ? "✓" : ""}</div>
            <div style={{ fontWeight: 900, fontSize: eAtual ? 46 : 38, color: eAtual ? AMARELO : "#fff", WebkitTextStroke: "6px #000", paintOrder: "stroke fill", textShadow: sombra, textDecoration: feito ? "line-through" : "none" }}>{txt}</div>
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
      <div style={{ fontWeight: 900, fontSize: 46, color: "#fff", WebkitTextStroke: "6px #000", paintOrder: "stroke fill" }}>4 MOTOS DE GRAÇA</div>
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

// ---------- final: o Vyce DENTRO do GTA, andando de moto ----------
const boca = (f: number) => (dados.boca as number[])[f] ?? 0;
const pisca = (t: number) => {
  const c = t % 4.3;
  return c > 1.4 && c < 1.52;
};
const OPCOES: [string, string, string, string][] = [
  ["1", "🌳", "A DA ÁRVORE", VERDE],
  ["2", "🔥", "AS DA MANSÃO", ROSA],
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
          <Quadro s={486.0} k={CHEIO} filtro="blur(5px) brightness(1.05) saturate(1.1)" />
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
            const kk = entra(t, em(i === 0 ? "qual" : "buscar", ENQ) - 0.15);
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
  [em("pendurou") + 0.15, 1.3, "surprised-pikachu.jpg", 1893 / 1892],
];

const pula = (t: number, a: number) => interpolate(t, [a, a + 0.12, a + 0.22], [0, 1.15, 1], cl);
const Memes: React.FC<{ t: number }> = ({ t }) => {
  const m = MEMES.find(([q, d]) => t >= q && t < q + d);
  if (!m) return null;
  const [q, d, arq, prop] = m;
  const w = 300;
  const k = pula(t, q) * (1 - suave(t, q + d - 0.12, q + d));
  return (
    <div style={{ position: "absolute", left: 540 - w / 2, top: 1150, width: w, height: w / prop, borderRadius: 18, overflow: "hidden", border: "8px solid #fff", boxShadow: "0 20px 50px rgba(0,0,0,.7)", transform: `scale(${k}) rotate(-3deg)` }}>
      <Img src={staticFile(ARQ(`memes/${arq}`))} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </div>
  );
};



// ---------- som (regra nova, desde a Fase 47): sem whoosh automático; memes sonoros nas viradas + música ~0,2 ----------
// O criador do vídeo base narra tudo (e tem música com direitos num trecho): sem som do jogo nesta Fase.
const VIRAL = (n: string) => `fase-extra/sons/virais/${n}.wav`;
const BANCO = (n: string) => `fase-extra/banco/sons/${n}.wav`;
const SONS: [number, string, number, number?][] = [
  [em("pendurou") + 0.1, BANCO("vine-boom"), 0.28, 1.5],
  [em("festinha") + 0.1, VIRAL("huh"), 0.22],
  [em("correntes") + 0.25, VIRAL("hit-minecraft"), 0.3],
  [em("cai") - 0.05, VIRAL("hit-minecraft"), 0.3],
  [em("pintura") + 0.1, VIRAL("cha-ching-dinheiro"), 0.22],
  [em("nagasaki") - 0.05, BANCO("anime-wow"), 0.22, 1.4],
  ...OBJETIVOS.map(([, fim]) => [fim - 0.15, VIRAL("click"), 0.25] as [number, string, number]),
  [PASSOU - 0.05, BANCO("gta-mission-passed"), 0.32, 3.2],
];

const falando = (t: number) => PAL.some((p) => t >= p.s - 0.04 && t <= p.e + 0.04);
const DUCK: number[] = (() => {
  const bruto = Array.from({ length: DURACAO_FASE48 }, (_, i) => (falando(i / FPS) ? 0.5 : 0.85));
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



// a música abaixa enquanto toca o "mission passed"
const MUDO = (t: number) => 1 - 0.85 * suave(t, PASSOU - 0.3, PASSOU) * (1 - suave(t, PASSOU + 2.6, PASSOU + 3.2));

export const VideoFase48: React.FC = () => {
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
      <Audio src={staticFile(ARQ("trilha.wav"))} volume={(q) => 0.2 * (DUCK[q] ?? 0.5) * MUDO(q / FPS)} />
      {SONS.map(([q, nome, vol, dur], i) => (
        <Sequence key={i} from={Math.max(0, Math.round(q * FPS))} durationInFrames={Math.round((dur ?? 2) * FPS)}>
          <Audio src={staticFile(nome)} volume={vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
