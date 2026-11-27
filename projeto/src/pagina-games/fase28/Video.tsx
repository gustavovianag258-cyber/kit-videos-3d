import { loadFont } from "@remotion/google-fonts/Montserrat";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, Audio, Easing, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { Camera } from "../Estudio";
import { Mascote3D, PoseMascote } from "../Mascote3D";
import dados from "./dados.json";
import davy from "./davy.json";

// Fase Extra, Fase 28: "O pesadelo da Lucia depois da abdução no GTA 6" (Parte 1 de 2; continuação da Fase 24).
// clipes/live.mp4 = corte do Davy Jones (YouTube ZvDy51-RVNU, trecho 14:11–27:20, 30 fps): webcam nítida em cima (0–616)
// e o jogo embaixo (616–1920), faixa das legendas do jogo borrada. clipes/alien.mp4 e clipes/ufo.mp4 = cenas limpas do
// HarryNinetyFour (5OgDGkUdeDw; 918–942 s e 1050–1090 s), em tela cheia.
// Padrão aprovado: gancho contínuo, áudio da live baixinho, a narração PARA nas reações (davy.json) e o original entra alto
// com a fala na tela; música de suspense (Mixkit "Unforgiven", 890) a 0,5 × ducking; Vyce só no final, dentro do GTA.
const { fontFamily } = loadFont("normal", { weights: ["600", "800", "900"], subsets: ["latin"] });
export const FPS = 30;
const FIM = dados.duracao + 1.0;
export const DURACAO_FASE28 = Math.ceil(FIM * FPS);
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
const ARQ = (n: string) => `fase-extra/fase28/${n}`;

// ---------- âncoras ----------
type Pal = { w: string; s: number; e: number };
const PAL = dados.palavras as Pal[];
const limpa = (w: string) => w.toLowerCase().replace(/[.,?!:…“”"]/g, "");
const em = (palavra: string, depois = 0) => PAL.find((p) => limpa(p.w) === palavra && p.s >= depois)?.s ?? 999;
type Buraco = { de: number; src: number; dur: number; nome: string };
const DAVY = davy as Buraco[];
const G = DAVY.map((g) => g.de);
const fimG = (i: number) => DAVY[i].de + DAVY[i].dur;
const LEMBRA = em("lembra");
const DORMIR = em("se", LEMBRA);
const COMECA = em("o", em("hora", DORMIR));
const ELA = em("ela", COMECA);
const OVOS = em("a", fimG(0));
const PLANET = em("depois", fimG(2));
const TECLADO = em("aí", fimG(3));
const PAINEL = em("e", em("dele", TECLADO));
const PORTAS = em("três", TECLADO);
const CERTA = em("a", fimG(4));
const GARRAFA = em("e", fimG(5) - 0.3);
const MAQUINA = em("leva", fimG(6));
const ACORDA = em("e", MAQUINA + 0.5);
const MAPA = em("e", fimG(7));
const BASE = em("é", MAPA);
const ALIEN = em("e", BASE + 0.3);
const PARTE2 = em("mas", ALIEN);
const FINAL = em("você", fimG(8)) - 0.15;
const ENQ = em("comenta", FINAL);
const VOL_ORIG: Record<string, number> = { maluquice: 0.61, ovos: 0.53, tentaculo: 0.48, torre: 0.81, fogo: 0.81, vacas: 0.79, leite: 0.72, sonho: 1.0, incrivel: 0.91 };
const FUNDO_LIVE = 0.06;

// ---------- planos ----------
// arq "live" = webcam + jogo; "alien"/"ufo" = tela cheia (quadro 16:9 recortado na vertical)
type Plano = { de: number; src: number; arq?: "live" | "alien" | "ufo"; z?: number; oy?: number; vol?: number };
const PLANOS: Plano[] = [
  { de: 0, src: 134.6, z: 1.15, oy: 60 },
  { de: em("pesadelo") - 0.1, src: 129.0, z: 1.1 },
  { de: em("tudo") - 0.1, src: 386.0, z: 1.1 },
  { de: LEMBRA - 0.1, src: 123.0 },
  { de: em("não", LEMBRA) - 0.1, src: 126.0 },
  { de: DORMIR - 0.1, src: 103.0 },
  { de: em("uma", DORMIR) - 0.1, src: 115.0, z: 1.1 },
  { de: COMECA - 0.1, src: 129.0, z: 1.15 },
  { de: ELA - 0.1, src: 134.6, z: 1.15, oy: 60 },
  { de: em("sem", ELA) - 0.1, src: 140.0 },
  { de: em("só", ELA) - 0.1, src: 150.0 },
  { de: G[0], src: DAVY[0].src, vol: VOL_ORIG.maluquice },
  { de: OVOS - 0.1, src: 163.0 },
  { de: em("tem", OVOS) - 0.1, src: 172.0, z: 1.1 },
  { de: em("porque", OVOS) - 0.1, src: 183.0, z: 1.1 },
  { de: G[1], src: DAVY[1].src, vol: VOL_ORIG.ovos },
  { de: G[2], src: DAVY[2].src, vol: VOL_ORIG.tentaculo, z: 1.1 },
  { de: PLANET - 0.1, src: 361.0 },
  { de: em("e", PLANET + 2) - 0.1, src: 375.0 },
  { de: em("aparece", PLANET) - 0.1, src: 388.0, z: 1.15 },
  { de: G[3], src: DAVY[3].src, vol: VOL_ORIG.torre, z: 1.1 },
  { de: TECLADO - 0.1, src: 420.0 },
  { de: em("o", TECLADO + 1) - 0.1, src: 427.0, z: 1.15 },
  { de: PAINEL - 0.1, src: 470.0 },
  { de: PORTAS - 0.1, src: 572.0 },
  { de: em("a", PORTAS + 0.5) - 0.1, src: 585.0 },
  { de: G[4], src: DAVY[4].src, vol: VOL_ORIG.fogo, z: 1.1 },
  { de: CERTA - 0.1, src: 629.0 },
  { de: G[5], src: DAVY[5].src, vol: VOL_ORIG.vacas },
  { de: GARRAFA - 0.1, src: 645.0, z: 1.1 },
  { de: G[6], src: DAVY[6].src, vol: VOL_ORIG.leite },
  { de: MAQUINA - 0.1, src: 693.0 },
  { de: ACORDA - 0.1, src: 708.0 },
  { de: G[7], src: DAVY[7].src, vol: VOL_ORIG.sonho },
  { de: MAPA - 0.1, src: 779.0 },
  { de: BASE - 0.1, src: 783.0, z: 1.15 },
  { de: ALIEN - 0.1, src: 5.5, arq: "alien" },
  { de: PARTE2 - 0.1, src: 19.0, arq: "ufo" },
  { de: G[8], src: DAVY[8].src, vol: VOL_ORIG.incrivel },
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

// clarões (pesadelo começa / acorda)
const Flash: React.FC<{ t: number }> = ({ t }) => {
  const a = interpolate(t, [COMECA + 0.4, COMECA + 0.5, COMECA + 0.95], [0, 0.85, 0], cl);
  const b = interpolate(t, [ACORDA, ACORDA + 0.08, ACORDA + 0.5], [0, 0.8, 0], cl);
  return <AbsoluteFill style={{ background: "#fff", opacity: Math.max(a, b) }} />;
};

// ---------- títulos (logo abaixo da webcam) ----------
type Tela = { de: number; ate: number; rotulo?: string; cor: string; titulo: string };
const TELAS: Tela[] = [
  { de: 0.05, ate: LEMBRA - 0.05, rotulo: "GTA 6 · PARTE 1", cor: ROXO, titulo: "O PESADELO DA LUCIA" },
  { de: LEMBRA, ate: DORMIR - 0.05, cor: AZUL, titulo: "NÃO ACABOU ALI" },
  { de: DORMIR, ate: ELA - 0.05, cor: AZUL, titulo: "VAI DORMIR… 😴" },
  { de: ELA, ate: G[0] - 0.05, cor: ROXO, titulo: "QUARTO BRANCO" },
  { de: OVOS, ate: G[1] - 0.05, cor: AMARELO, titulo: "A SALA DOS OVOS" },
  { de: PLANET, ate: G[3] - 0.05, cor: AZUL, titulo: "O PLANETÁRIO" },
  { de: TECLADO, ate: PORTAS - 0.05, cor: VERDE, titulo: "O CÓDIGO" },
  { de: PORTAS, ate: G[4] - 0.05, cor: VERMELHO, titulo: "3 PORTAS" },
  { de: CERTA, ate: MAQUINA - 0.05, cor: AMARELO, titulo: "AS VACAS 🐄" },
  { de: MAQUINA, ate: G[7] - 0.05, cor: VERDE, titulo: "ACORDA" },
  { de: G[7], ate: MAPA - 0.05, cor: ROXO, titulo: "\"FOI NO MEU SONHO\"" },
  { de: MAPA, ate: ALIEN - 0.05, cor: AZUL, titulo: "EXISTE DE VERDADE" },
  { de: ALIEN, ate: PARTE2 - 0.05, cor: VERDE, titulo: "TEM UM ALIEN 👽" },
  { de: PARTE2, ate: FINAL - 0.1, cor: ROXO, titulo: "PARTE 2 →" },
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
  ["1", "😴", "DORMIA DE NOVO", AZUL],
  ["2", "🚫", "NUNCA MAIS DORMIA", VERMELHO],
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
        <OffthreadVideo src={staticFile(ARQ("clipes/ufo.mp4"))} startFrom={Math.round(24.0 * FPS)} muted style={{ position: "absolute", left: 540 - 1707, top: 0, width: 3413, height: 1920 }} />
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
            const kk = entra(t, FINAL + 0.7 + i * 0.3);
            return (
              <div key={n} style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 14, opacity: kk, transform: `translateX(${(1 - kk) * -40}px)`, width: "fit-content", background: "rgba(10,6,20,.8)", borderLeft: `8px solid ${cor}`, borderRadius: 12, padding: "8px 22px 8px 16px" }}>
                <span style={{ fontWeight: 900, fontSize: 42, color: cor }}>{n}</span>
                <span style={{ fontSize: 44 }}>{ic}</span>
                <span style={{ fontWeight: 900, fontSize: 42 }}>{txt}</span>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 30, fontWeight: 900, fontSize: 64, color: AMARELO, ...contorno(8), opacity: entra(t, ENQ - 0.1), transform: `scale(${0.8 + 0.2 * entra(t, ENQ - 0.1)})`, transformOrigin: "left center" }}>COMENTA "PARTE 2" 👇</div>
      </div>
      <div style={{ position: "absolute", bottom: 110, left: 0, right: 0, textAlign: "center", fontFamily, fontWeight: 900, fontSize: 44, color: "#fff", textShadow: sombra, opacity: entra(t, FINAL + 0.6) }}>FASE EXTRA · @faseextra.br</div>
    </AbsoluteFill>
  );
};

// ---------- legenda ----------
// falas originais nos buracos: [buraco, ini, fim (segundo da live), quem, texto]
const FALAS: [number, number, number, string, string][] = [
  [0, 157.8, 159.0, "DAVY JONES", "QUE MALUQUICE É ESSA?"],
  [0, 159.0, 160.8, "DAVY JONES", "O SONHO DA LUCIA, GENTE!"],
  [1, 165.4, 166.9, "DAVY JONES", "OS OVOS DE ALIEN!"],
  [2, 187.9, 189.6, "DAVY JONES", "UM TENTÁCULO!"],
  [2, 189.6, 191.7, "DAVY JONES", "ME LARGA AÍ, ME LARGA AÍ!"],
  [3, 378.4, 380.5, "DAVY JONES", "ACHO QUE VAI MOSTRAR A TORRE…"],
  [4, 595.0, 596.6, "DAVY JONES", "TÁ PEGANDO FOGO AZUL!"],
  [5, 632.6, 634.6, "DAVY JONES", "O QUE ESSAS VACAS TÃO FAZENDO AQUI?"],
  [6, 641.5, 644.0, "DAVY JONES", "BEBER LEITE? DA VAQUINHA?"],
  [7, 724.8, 730.0, "LUCIA", "TEM UMA TORRE GRANDE… E UM POSTE DE ELETRICIDADE PERTO."],
  [7, 730.0, 732.2, "LUCIA", "NO MEIO DE LUGAR NENHUM?"],
  [7, 732.2, 734.3, "JASON", "PODE SER UM MONTE DE LUGAR."],
  [7, 734.3, 735.1, "JASON", "POR QUÊ?"],
  [7, 735.1, 736.6, "LUCIA", "TAVA NO MEU SONHO."],
  [8, 774.2, 777.0, "DAVY JONES", "QUE PARADA INCRÍVEL ESSE EASTER EGG!"],
];
const DESTAQUE = /^(disco|lucia|gta|6|pesadelo|verdade|mapa|abdução|dormir|branco|preta|ovos|brilhando|agachada|planetário|terra|leonida|teclado|código|linhas|painel|portas|meio|vacas|leite|máquina|acorda|sonho|base|secreta|alien|parte|2|fase|extra|vyce|comenta)$/i;
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
    const cor = fala[3] === "DAVY JONES" ? AMARELO : fala[3] === "LUCIA" ? "#FF9BD2" : AZUL;
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
  const bruto = Array.from({ length: DURACAO_FASE28 }, (_, i) => {
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
const TROCAS = [LEMBRA, ELA, OVOS, PLANET, TECLADO, PORTAS, CERTA, MAQUINA, MAPA, PARTE2, FINAL];
const SONS: [number, string, number][] = [
  [0.0, "feixe", 0.1],
  [COMECA + 0.4, "clarao", 0.12],
  [ACORDA, "clarao", 0.1],
  [ALIEN - 0.1, "sino", 0.08],
  ...TROCAS.map((q) => [q - 0.05, "whoosh", 0.06] as [number, string, number]),
];

export const VideoFase28: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Fundo t={t} />
      {t < FINAL + 0.3 && <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 74%, rgba(0,0,0,.45) 82%, rgba(0,0,0,.6) 100%)" }} />}
      <Flash t={t} />
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
