import { loadFont } from "@remotion/google-fonts/Montserrat";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, Audio, Easing, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { Camera } from "../Estudio";
import { Mascote3D, PoseMascote } from "../Mascote3D";
import dados from "./dados.json";
import davy from "./davy.json";

// Fase Extra, Fase 29: "O resgate do alien no GTA 6" (Parte 2 de 2; continua a Fase 28).
// clipes/live.mp4 = corte do Davy Jones (YouTube ZvDy51-RVNU, trecho 26:50–38:30, 30 fps): webcam nítida em cima, jogo embaixo.
// clipes/base.mp4 (HarryNinetyFour 620–670 s: a base e a torre de dia) e clipes/ufo.mp4 (1050–1090 s: o disco destruindo tudo), tela cheia.
// Mesmo padrão da Fase 28: buracos na narração (davy.json) com o áudio original alto e a fala na tela.
// Música de suspense "Echoes" (Mixkit 188) a 0,5 × ducking; efeitos baixos; Vyce só no final, dentro do GTA.
const { fontFamily } = loadFont("normal", { weights: ["600", "800", "900"], subsets: ["latin"] });
export const FPS = 30;
const FIM = dados.duracao + 1.0;
export const DURACAO_FASE29 = Math.ceil(FIM * FPS);
const AZUL = "#6FD6FF";
const VERDE = "#7CFF9B";
const AMARELO = "#FFD84A";
const VERMELHO = "#FF4B4B";
const ROXO = "#C9A2FF";
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const suave = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
const entra = (t: number, a: number, d = 0.3) => interpolate(t, [a, a + d], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) });
const sombra = "0 4px 22px rgba(0,0,0,.8)";
const contorno = (px: number) => ({ WebkitTextStroke: `${px}px #000`, paintOrder: "stroke fill" as const });
const ARQ = (n: string) => `fase-extra/fase29/${n}`;

// ---------- âncoras ----------
type Pal = { w: string; s: number; e: number };
const PAL = dados.palavras as Pal[];
const limpa = (w: string) => w.toLowerCase().replace(/[.,?!:…“”"]/g, "");
const em = (palavra: string, depois = 0) => PAL.find((p) => limpa(p.w) === palavra && p.s >= depois)?.s ?? 999;
type Buraco = { de: number; src: number; dur: number; nome: string };
const DAVY = davy as Buraco[];
const G = DAVY.map((g) => g.de);
const fimG = (i: number) => DAVY[i].de + DAVY[i].dur;
const PARTE1 = em("na");
const MAPAOBJ = em("depois", PARTE1);
const FICA = em("fica", MAPAOBJ);
const BASEM = em("uma", FICA);
const TECLADO = em("lá", BASEM);
const ELEVADOR = em("um", fimG(0) - 0.3);
const DESCOBRE = em("você", fimG(1) - 0.3) - 0.2;
const PAINEL = em("tem", fimG(2) - 0.3);
const ATRAS = em("e", em("sonho", PAINEL));
const LEITE = em("o", fimG(3) - 0.3) - 0.2;
const ALIENV = em("um", fimG(4) - 0.3);
const FORA = em("lá", fimG(5) - 0.3);
const PREMIO = em("e", fimG(6) - 0.3);
const DESTROI = em("e", fimG(7) - 0.3);
const FINAL = em("você", fimG(8) - 0.3) - 0.15;
const ENQ = em("e", em("vyce", FINAL));
const VOL_ORIG: Record<string, number> = { codigo: 0.89, musica: 0.74, leite: 1.0, esqueleto: 0.73, oque: 1.0, carregar: 0.62, nave: 0.76, aumentou: 0.65, goat: 0.87 };
const FUNDO_LIVE = 0.06;

// ---------- planos ----------
// arq "live" = webcam + jogo; "alien"/"ufo" = tela cheia (quadro 16:9 recortado na vertical)
type Plano = { de: number; src: number; arq?: "live" | "base" | "ufo"; z?: number; oy?: number; vol?: number };
const PLANOS: Plano[] = [
  { de: 0, src: 519.0, z: 1.1 },
  { de: em("ganha") - 0.1, src: 524.0, z: 1.15 },
  { de: em("e", 7) - 0.1, src: 64.0 },
  { de: PARTE1 - 0.1, src: 12.0, arq: "base" },
  { de: MAPAOBJ - 0.1, src: 18.0 },
  { de: FICA - 0.1, src: 64.0, z: 1.1, oy: 40 },
  { de: BASEM - 0.1, src: 6.0, arq: "base" },
  { de: em("com", BASEM) - 0.1, src: 15.0, arq: "base" },
  { de: TECLADO - 0.1, src: 116.0 },
  { de: G[0], src: DAVY[0].src, vol: VOL_ORIG.codigo, z: 1.1 },
  { de: ELEVADOR - 0.1, src: 140.0 },
  { de: em("subterrâneo", ELEVADOR) - 0.1, src: 175.0 },
  { de: G[1], src: DAVY[1].src, vol: VOL_ORIG.musica },
  { de: DESCOBRE - 0.1, src: 205.0 },
  { de: G[2], src: DAVY[2].src, vol: VOL_ORIG.leite },
  { de: PAINEL - 0.1, src: 300.0 },
  { de: em("três", PAINEL) - 0.1, src: 318.0 },
  { de: ATRAS - 0.1, src: 338.0 },
  { de: G[3], src: DAVY[3].src, vol: VOL_ORIG.esqueleto, z: 1.1 },
  { de: LEITE - 0.1, src: 392.0 },
  { de: G[4], src: DAVY[4].src, vol: VOL_ORIG.oque },
  { de: ALIENV - 0.1, src: 410.0, z: 1.15 },
  { de: em("você", ALIENV) - 0.1, src: 418.0 },
  { de: G[5], src: DAVY[5].src, vol: VOL_ORIG.carregar },
  { de: FORA - 0.1, src: 512.0, z: 1.1 },
  { de: em("desce", FORA) - 0.1, src: 527.0 },
  { de: G[6], src: DAVY[6].src, vol: VOL_ORIG.nave },
  { de: PREMIO - 0.1, src: 538.0 },
  { de: G[7], src: DAVY[7].src, vol: VOL_ORIG.aumentou },
  { de: DESTROI - 0.1, src: 19.0, arq: "ufo" },
  { de: G[8], src: DAVY[8].src, vol: VOL_ORIG.goat },
];
const planoEm = (t: number) => {
  let i = -1;
  while (i + 1 < PLANOS.length && PLANOS[i + 1].de <= t) i++;
  return i;
};
const Fundo: React.FC<{ t: number }> = ({ t }) => {
  const i = planoEm(t);
  if (i < 0 || t > FINAL + 0.3) return null;
  const p = PLANOS[i];
  const fim = Math.min(PLANOS[i + 1]?.de ?? FIM, FINAL + 0.3);
  const k = interpolate(t, [p.de, fim], [0, 1], { ...cl, easing: Easing.inOut(Easing.sin) });
  const z = (p.z ?? 1) + 0.05 * k;
  const dur = Math.max(1, Math.round((fim - p.de) * FPS) + 2);
  const arq = p.arq ?? "live";
  return (
    <Sequence key={i} from={Math.round(p.de * FPS)} durationInFrames={dur} layout="none">
      {arq === "live" ? (
        <AbsoluteFill style={{ background: "#000" }}>
          <AbsoluteFill style={{ top: 616, overflow: "hidden" }}>
            <OffthreadVideo src={staticFile(ARQ("clipes/live.mp4"))} startFrom={Math.round(p.src * FPS)} volume={p.vol ?? FUNDO_LIVE} style={{ position: "absolute", top: -616, width: 1080, height: 1920, transform: `scale(${z})`, transformOrigin: `50% ${p.oy ?? 66}%` }} />
          </AbsoluteFill>
          <AbsoluteFill style={{ height: 616, overflow: "hidden" }}>
            <OffthreadVideo src={staticFile(ARQ("clipes/live.mp4"))} startFrom={Math.round(p.src * FPS)} muted style={{ position: "absolute", width: 1080, height: 1920 }} />
          </AbsoluteFill>
          <div style={{ position: "absolute", top: 612, left: 0, right: 0, height: 8, background: "rgba(0,0,0,.6)" }} />
        </AbsoluteFill>
      ) : (
        <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
          <OffthreadVideo src={staticFile(ARQ(`clipes/${arq}.mp4`))} startFrom={Math.round(p.src * FPS)} muted style={{ position: "absolute", left: 540 - 1707 * z, top: 960 - 960 * z, width: 3413 * z, height: 1920 * z }} />
        </AbsoluteFill>
      )}
    </Sequence>
  );
};

// o prêmio, com o texto exato da tela do jogo
const Premio: React.FC<{ t: number }> = ({ t }) => {
  if (t < PREMIO + 0.2 || t > DESTROI - 0.05) return null;
  const linhas = ["SAÚDE MÁXIMA AUMENTADA", "FÔLEGO MÁXIMO AUMENTADO", "FOCO MÁXIMO AUMENTADO", "FOCO MELHORADO"];
  const des = [em("saúde", PREMIO), em("fôlego", PREMIO), em("foco", PREMIO), em("pra", PREMIO)];
  const s = suave(t, DESTROI - 0.3, DESTROI - 0.05);
  return (
    <div style={{ position: "absolute", top: 900, left: 60, right: 60, fontFamily, opacity: 1 - s }}>
      {linhas.map((l, i) => {
        const k = interpolate(t, [des[i] - 0.15, des[i] + 0.2], [0, 1], { ...cl, easing: Easing.out(Easing.back(1.6)) });
        return (
          <div key={l} style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 16, opacity: Math.min(1, k * 1.4), transform: `translateX(${(1 - k) * 60}px)`, background: "rgba(8,14,20,.86)", borderLeft: `10px solid ${VERDE}`, borderRadius: 14, padding: "12px 24px" }}>
            <span style={{ fontWeight: 900, fontSize: 46, color: VERDE }}>▲</span>
            <span style={{ fontWeight: 900, fontSize: 46, color: "#fff" }}>{l}</span>
          </div>
        );
      })}
    </div>
  );
};

// ---------- títulos (logo abaixo da webcam) ----------
type Tela = { de: number; ate: number; rotulo?: string; cor: string; titulo: string };
const TELAS: Tela[] = [
  { de: 0.05, ate: PARTE1 - 0.05, rotulo: "GTA 6 · PARTE 2", cor: VERDE, titulo: "RESGATE O ALIEN 👽" },
  { de: PARTE1, ate: FICA - 0.05, cor: ROXO, titulo: "O LUGAR DO SONHO" },
  { de: FICA, ate: BASEM - 0.05, cor: AZUL, titulo: "AO SUL DE HAMLET" },
  { de: BASEM, ate: TECLADO - 0.05, cor: AMARELO, titulo: "A BASE ABANDONADA" },
  { de: TECLADO, ate: G[0] - 0.05, cor: VERDE, titulo: "O CÓDIGO DO SONHO" },
  { de: ELEVADOR, ate: G[1] - 0.05, cor: AZUL, titulo: "O SUBTERRÂNEO" },
  { de: DESCOBRE, ate: G[2] + DAVY[2].dur, cor: VERMELHO, titulo: "AS GRAVAÇÕES" },
  { de: PAINEL, ate: G[3] - 0.05, cor: ROXO, titulo: "IGUAL AO SONHO" },
  { de: LEITE, ate: G[4] - 0.05, cor: AMARELO, titulo: "O LEITE 🥛" },
  { de: ALIENV, ate: FORA - 0.05, cor: VERDE, titulo: "UM ALIEN VIVO 👽" },
  { de: FORA, ate: PREMIO - 0.05, cor: AZUL, titulo: "LEVA ELE PRA CASA" },
  { de: PREMIO, ate: DESTROI - 0.05, cor: VERDE, titulo: "O PRÊMIO" },
  { de: DESTROI, ate: FINAL - 0.1, cor: VERMELHO, titulo: "E AINDA…" },
];
const Titulos: React.FC<{ t: number }> = ({ t }) => {
  const tela = TELAS.find((x) => t >= x.de - 0.05 && t < x.ate);
  if (!tela) return null;
  const k = entra(t, tela.de, 0.3);
  const s = suave(t, tela.ate - 0.15, tela.ate);
  const n = tela.titulo.length;
  return (
    <div style={{ position: "absolute", left: 30, right: 30, top: 648, textAlign: "center", fontFamily, opacity: k * (1 - s), transform: `translateY(${(1 - k) * 20}px) scale(${0.94 + 0.06 * k})` }}>
      {tela.rotulo && <div style={{ display: "inline-block", fontWeight: 900, fontSize: 26, letterSpacing: 6, color: "#111", background: tela.cor, borderRadius: 10, padding: "3px 14px", marginBottom: 8 }}>{tela.rotulo}</div>}
      <div style={{ fontWeight: 900, fontSize: n > 16 ? 62 : 74, lineHeight: 1, letterSpacing: -1, color: "#fff", textShadow: sombra, ...contorno(6) }}>{tela.titulo}</div>
    </div>
  );
};

// ---------- final: o Vyce DENTRO do GTA (com o disco voador) ----------
const boca = (f: number) => (dados.boca as number[])[f] ?? 0;
const pisca = (t: number) => {
  const c = t % 4.3;
  return c > 1.4 && c < 1.52;
};
const OPCOES: [string, string, string, string][] = [
  ["1", "👽", "SALVAVA", VERDE],
  ["2", "🔒", "DEIXAVA LÁ", VERMELHO],
];
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
        <OffthreadVideo src={staticFile(ARQ("clipes/ufo.mp4"))} startFrom={Math.round(26.0 * FPS)} muted style={{ position: "absolute", left: 540 - 1707, top: 0, width: 3413, height: 1920 }} />
      </Sequence>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.6) 0%, rgba(0,0,0,.15) 35%, rgba(0,0,0,0) 60%, rgba(0,0,0,.3) 100%)" }} />
      <AbsoluteFill>
        <ThreeCanvas width={1080} height={1920} camera={{ fov, near: 0.05, far: 50 }} gl={{ toneMapping: THREE.ACESFilmicToneMapping, antialias: true, alpha: true }}>
          <Camera pos={[0, 1.2, 6]} alvo={[0, 1.05, 0]} />
          <hemisphereLight args={["#CFE6FF", "#3A4A5A", 1.1]} />
          <directionalLight position={[0, 6, -3]} intensity={2.6} color="#BFEFFF" />
          <directionalLight position={[-2, 3, 4]} intensity={1.6} color="#FFF4E6" />
          <Mascote3D pos={[0.05, -0.62 * (1 - suave(t, FINAL - 0.1, FINAL + 0.35)) - 0.52, 0]} giro={-0.08 + 0.05 * Math.sin(t * 0.9)} pose={pose} boca={boca(f)} pisca={pisca(t)} olhar={0.6} sorriso />
        </ThreeCanvas>
      </AbsoluteFill>
      <div style={{ position: "absolute", top: 230, left: 70, right: 70, fontFamily, color: "#fff" }}>
        <div style={{ fontWeight: 800, fontSize: 32, letterSpacing: 8, color: "#E2C4FF", textShadow: sombra, opacity: entra(t, FINAL) }}>VOCÊ ESTÁ NA FASE EXTRA</div>
        <div style={{ fontWeight: 900, fontSize: 80, lineHeight: 1, textShadow: sombra, opacity: entra(t, FINAL + 0.4) }}>E VOCÊ?</div>
        <div style={{ marginTop: 10 }}>
          {OPCOES.map(([n, ic, txt, cor], i) => {
            const kk = entra(t, em(i === 0 ? "salvava" : "ou", ENQ) - 0.15);
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

// ---------- legenda ----------
// falas originais nos buracos: [buraco, ini, fim (segundo da live), quem, texto]
const FALAS: [number, number, number, string, string][] = [
  [0, 121.6, 123.4, "DAVY JONES", "MEU CÓDIGO É 3, 1, 2, 4."],
  [0, 123.4, 125.2, "DAVY JONES", "É O CÓDIGO QUE EU ARRUMEI NO SONHO."],
  [1, 158.5, 160.5, "DAVY JONES", "Ó, A MÚSICA. TENEBROSA."],
  [2, 244.4, 249.6, "CIENTISTA", "A FORMA DE VIDA PARECE GOSTAR MUITO DE LEITE."],
  [2, 249.6, 253.3, "CIENTISTA", "O LEITE PARECE AGIR COMO UMA ESPÉCIE DE ALUCINÓGENO."],
  [2, 253.3, 255.4, "DAVY JONES", "E ELE FICA DOIDÃO QUANDO BEBE LEITE!"],
  [3, 344.2, 347.3, "DAVY JONES", "ESQUELETO DE VACA, OLHA ISSO!"],
  [4, 402.4, 403.9, "DAVY JONES", "QUE QUE É ISSO, GENTE?"],
  [5, 424.8, 426.4, "DAVY JONES", "DÁ PRA EU CARREGAR O ALIEN!"],
  [6, 503.0, 506.5, "DAVY JONES", "NAVE MAIOR VAI VIR BUSCAR? IH, RAPAZ…"],
  [7, 542.7, 545.3, "DAVY JONES", "OLHA! AUMENTOU UM MONTE DE COISA!"],
  [8, 606.8, 608.8, "DAVY JONES", "REALMENTE É O GOAT DOS EASTER EGGS."],
];
const DESTAQUE = /^(base|secreta|alien|vida|fôlego|foco|sempre|torre|mapa|misterioso|hamlet|vice-dale|militar|teclado|código|sonho|elevador|subterrâneo|cientistas|painel|portas|leite|máquina|cápsula|vivo|colo|disco|prêmio|saúde|máximos|destrói|fase|extra|vyce|comenta)$/i;
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
  const fala = FALAS.find(([g, a, b]) => t >= DAVY[g].de + (a - DAVY[g].src) && t < DAVY[g].de + (b - DAVY[g].src));
  if (fala) {
    const de = DAVY[fala[0]].de + (fala[1] - DAVY[fala[0]].src);
    const k = interpolate(t, [de, de + 0.22], [0, 1], { ...cl, easing: Easing.out(Easing.back(2)) });
    const cor = fala[3] === "DAVY JONES" ? AMARELO : "#9BE7FF";
    return (
      <div style={{ position: "absolute", top: 1540, left: 30, right: 30, textAlign: "center", fontFamily, transform: `scale(${0.7 + 0.3 * k})`, opacity: k }}>
        <div style={{ fontWeight: 800, fontSize: 30, letterSpacing: 6, color: "#fff", ...contorno(6) }}>{fala[3]}:</div>
        <div style={{ fontWeight: 900, fontSize: fala[4].length > 30 ? 58 : fala[4].length > 18 ? 70 : 86, lineHeight: 1.05, color: cor, ...contorno(12) }}>“{fala[4]}”</div>
      </div>
    );
  }
  if (G.some((g, i) => t >= g && t < g + DAVY[i].dur)) return null;
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
  const bruto = Array.from({ length: DURACAO_FASE29 }, (_, i) => {
    const t = i / FPS;
    if (DAVY.some((g) => t >= g.de - 0.1 && t < g.de + g.dur)) return 0.3;
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
const TROCAS = [PARTE1, FICA, BASEM, TECLADO, ELEVADOR, DESCOBRE, PAINEL, LEITE, ALIENV, FORA, PREMIO, DESTROI, FINAL];
const SONS: [number, string, number][] = [
  [0.0, "feixe", 0.1],
  [ALIENV, "sino", 0.08],
  [em("desce", FORA), "feixe", 0.1],
  [PREMIO + 0.6, "sino", 0.08],
  [DESTROI, "clarao", 0.1],
  ...TROCAS.map((q) => [q - 0.05, "whoosh", 0.06] as [number, string, number]),
];

export const VideoFase29: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Fundo t={t} />
      {t < FINAL + 0.3 && <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 74%, rgba(0,0,0,.45) 82%, rgba(0,0,0,.6) 100%)" }} />}
      <Premio t={t} />
      <Titulos t={t} />
      <VyceNoGta t={t} f={f} />
      <Legenda t={t} />
      <Audio src={staticFile(ARQ("narracao.wav"))} />
      <Audio src={staticFile(ARQ("trilha.wav"))} volume={(q) => 0.5 * (DUCK[q] ?? 0.5)} />
      {SONS.map(([q, nome, vol], i) => (
        <Sequence key={i} from={Math.max(0, Math.round(q * FPS))} durationInFrames={90}>
          <Audio src={staticFile(nome === "whoosh" ? "fase-extra/sons/whoosh.wav" : ARQ(`sfx-${nome}.wav`))} volume={vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
