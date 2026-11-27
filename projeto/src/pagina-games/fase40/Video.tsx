import { loadFont } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadMarker } from "@remotion/google-fonts/PermanentMarker";
import { loadFont as loadMaquina } from "@remotion/google-fonts/SpecialElite";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { Camera } from "../Estudio";
import { CorPele, Mascote3D, PoseMascote } from "../Mascote3D";
import dados from "./dados.json";

// Fase Extra, Fase 40: "O NPC do GTA 6 que descobriu que vive num jogo" — mistério, edição nossa (dossiê).
// Base: vídeo do YouTube UJaOX8SqyKk. clipes/jogo.mp4 = o vídeo inteiro em 30 fps (mesmos segundos), mudo.
// Só a gameplay pura (o jogo inteiro na tela, sem zoom) + as FOTOS dos bilhetes recortadas dos cartões dele
// (provas/*.png: só a foto do jogo, sem texto/moldura dele, com os cantinhos de foco apagados por inpaint).
// Nada dos cartões dele, nada da pessoa real. Voz só do Vyce, sem crédito.
const { fontFamily } = loadFont("normal", { weights: ["600", "800", "900"], subsets: ["latin"] });
const { fontFamily: marcador } = loadMarker();
const { fontFamily: maquina } = loadMaquina();
export const FPS = 30;
const FIM = dados.duracao + 1.2;
export const DURACAO_FASE40 = Math.ceil(FIM * FPS);
const AMARELO = "#FFD84A";
const VERMELHO = "#FF4D4D";
const AZUL = "#6FD6FF";
const VERDE = "#7CFF9B";
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const suave = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
const entra = (t: number, a: number, d = 0.3) => interpolate(t, [a, a + d], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) });
const sombra = "0 4px 22px rgba(0,0,0,.85)";
const ARQ = (n: string) => `fase-extra/fase40/${n}`;

// ---------- âncoras ----------
type Pal = { w: string; s: number; e: number };
const PAL = dados.palavras as Pal[];
const limpa = (w: string) => w.toLowerCase().replace(/[.,?!:…“”"]/g, "");
const em = (palavra: string, depois = 0) => PAL.find((p) => limpa(p.w) === palavra && p.s >= depois)?.s ?? 999;
const BILHETE1 = em("e", 3);
const QUADRO = em("em", 7);
const CINCO = em("cinco");
const GARAGEM = em("a", em("igualzinha"));
const PAREDE = em("na", em("provas"));
const CERTO = em("parece");
const P1 = em("ele", CERTO);
const VIZINHO = em("e", em("reais"));
const P2 = em("ele", em("fachada"));
const P3 = em("os", em("repete"));
const P4 = em("matei");
const P5 = em("e", em("respawn"));
const P6 = em("tem", em("rua"));
const JL = em("jason", P6);
const VOCE = em("é", em("chegaram"));
const P7 = em("e", em("jogando"));
const FUGA = em("ele", em("6", em("vive", P7)));
const BARCO = em("e", em("inteiro"));
const SPRAY = em("e", em("barco"));
const BILHETE = em("e", em("mais", SPRAY));
const LER = em("se", BILHETE);
const MESTRE = em("o", em("livre"));
const FINAL = em("você", em("você", MESTRE) + 0.5) - 0.15;
const ENQ = em("e", em("vyce", FINAL));

// ---------- planos ----------
// s = segundo do vídeo base (gameplay pura). foto = prova recortada (papel preso no mural).
type Plano = { de: number; s?: number; foto?: string; borrado?: number; trad?: string };
const PLANOS: Plano[] = [
  // gancho
  { de: 0, s: 469.5 },
  { de: BILHETE1 - 0.1, s: 0.6, borrado: 14 },
  // o quadro de 2021 → a casa
  { de: QUADRO - 0.1, foto: "casa2021" },
  { de: em("a", em("céu")) - 0.1, s: 66.0 },
  { de: CINCO - 0.1, s: 72.0 },
  { de: em("em", em("aqui")) - 0.1, s: 70.0 },
  // a garagem
  { de: GARAGEM - 0.1, s: 75.5 },
  { de: em("e", em("forçar")) - 0.1, s: 80.0 },
  { de: em("computador") - 0.1, s: 410.2 },
  { de: em("um", em("computador")) - 0.1, s: 116.5 },
  // a parede
  { de: PAREDE - 0.1, s: 92.0 },
  { de: CERTO - 0.1, s: 20.0, trad: "ESTAMOS NUM LOOP · ACORDA · A GENTE NÃO MORRE" },
  // prova 1 · portas
  { de: P1 - 0.1, s: 417.0, trad: "AS PORTAS NÃO SÃO REAIS" },
  { de: VIZINHO - 0.1, s: 139.5 },
  // prova 2 · mesma pessoa
  { de: P2 - 0.1, s: 85.0, trad: "É A MESMA PESSOA" },
  // prova 3 · carros
  { de: P3 - 0.1, foto: "carros", trad: "OS CARROS ESTÃO SUMINDO! · SEGUI UM, VIREI A ESQUINA: SUMIU!" },
  { de: em("é", em("sumindo")) - 0.1, s: 193.5 },
  // prova 4 · cachorro
  { de: P4 - 0.1, foto: "cachorro", trad: "MATEI UM CACHORRO! ELE VOLTOU UMA HORA DEPOIS" },
  // prova 5 · crianças
  { de: P5 - 0.1, foto: "criancas", trad: "ONDE ESTÃO TODAS AS CRIANÇAS?" },
  { de: em("o", em("crianças")) - 0.1, s: 213.0 },
  // prova 6 · gráfico
  { de: P6 - 0.1, foto: "grafico", trad: "CRIME VIOLENTO EM LEONIDA · O CRIME SUBIU... POR QUÊ?" },
  { de: VOCE - 0.1, s: 206.0 },
  // prova 7 · número 6
  { de: P7 - 0.1, s: 285.0, trad: "6 · 6 · 6 · 6 · 6 · 6" },
  { de: em("ele", em("significa")) - 0.1, s: 16.5 },
  // a fuga
  { de: FUGA - 0.1, s: 313.0, trad: "POR QUE EU NÃO CONSIGO SAIR DE LEONIDA???" },
  { de: BARCO - 0.1, foto: "barco", trad: "BARCO À VENDA · CONSTRUIR UM BARCO" },
  // eu não aguento mais
  { de: SPRAY - 0.1, s: 415.0, trad: "EU NÃO AGUENTO MAIS · ISSO É SÓ TEMPORÁRIO" },
  // o bilhete
  { de: BILHETE - 0.1, s: 2.0 },
  { de: LER - 0.1, foto: "mestre" },
  { de: MESTRE - 0.1, s: 481.0 },
];
PLANOS.sort((a, b) => a.de - b.de);
const planoEm = (t: number) => {
  let i = -1;
  while (i + 1 < PLANOS.length && PLANOS[i + 1].de <= t) i++;
  return i;
};
const VIDEO = staticFile(ARQ("clipes/jogo.mp4"));
const GRADE = "saturate(0.82) contrast(1.06) brightness(0.96)";
const CENTRO = 930; // centro vertical da imagem principal
const H_JOGO = (1080 * 1080) / 1920; // 607,5: o quadro 16:9 inteiro, sem zoom

const FundoBorrado: React.FC<{ s: number }> = ({ s }) => (
  <AbsoluteFill style={{ transform: "scale(1.2)" }}>
    <OffthreadVideo src={VIDEO} startFrom={Math.round(s * FPS)} muted style={{ position: "absolute", left: -(3413 - 1080) / 2, top: 0, width: 3413, height: 1920, filter: "blur(34px) brightness(0.32) saturate(0.6)" }} />
  </AbsoluteFill>
);
const MuralBorrado: React.FC = () => (
  <AbsoluteFill style={{ transform: "scale(1.2)" }}>
    <Img src={staticFile(ARQ("provas/mural.jpg"))} style={{ position: "absolute", left: -(3413 - 1080) / 2, top: 0, width: 3413, height: 1920, filter: "blur(30px) brightness(0.3) saturate(0.6)" }} />
  </AbsoluteFill>
);
const Jogo: React.FC<{ s: number; z: number; borrado?: number }> = ({ s, z, borrado }) => (
  <div style={{ position: "absolute", left: 0, top: CENTRO - H_JOGO / 2, width: 1080, height: H_JOGO, overflow: "hidden", boxShadow: "0 24px 70px rgba(0,0,0,.75)" }}>
    <div style={{ position: "absolute", inset: 0, transform: `scale(${z})` }}>
      <OffthreadVideo src={VIDEO} startFrom={Math.round(s * FPS)} muted style={{ position: "absolute", left: 0, top: 0, width: 1080, height: H_JOGO, filter: `${GRADE}${borrado ? ` blur(${borrado}px) brightness(0.8)` : ""}` }} />
    </div>
  </div>
);
const TAM: Record<string, [number, number]> = {
  casa2021: [1285, 626],
  carros: [546, 526],
  cachorro: [526, 526],
  criancas: [634, 526],
  grafico: [551, 412],
  barco: [312, 441],
  mestre: [596, 526],
};
// prova: a foto do bilhete como papel preso no mural, com tachinha, levemente torta, aproximando devagar
const Prova: React.FC<{ foto: string; t: number; de: number; fim: number; marca?: boolean }> = ({ foto, t, de, fim, marca }) => {
  const [w0, h0] = TAM[foto];
  const esc = Math.min(940 / w0, 640 / h0);
  const w = w0 * esc;
  const h = h0 * esc;
  const k = entra(t, de, 0.35);
  const z = 1 + 0.05 * suave(t, de, fim);
  const giro = foto === "casa2021" ? -1.2 : ((foto.length % 3) - 1) * 1.8;
  const jl = foto === "grafico" ? entra(t, JL - 0.1, 0.4) : 0;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 48%, rgba(80,60,40,.35) 0%, rgba(0,0,0,0) 60%)" }} />
      <div
        style={{
          position: "absolute",
          left: 540 - w / 2 - 14,
          top: CENTRO - h / 2 - 14,
          width: w + 28,
          height: h + 28,
          background: foto === "casa2021" ? "#3A2A1C" : "#EFE9DC",
          padding: 14,
          boxShadow: "0 30px 80px rgba(0,0,0,.8), 0 0 0 1px rgba(0,0,0,.4)",
          transform: `translateY(${(1 - k) * 60}px) rotate(${giro + (1 - k) * 4}deg) scale(${z * (0.92 + 0.08 * k)})`,
          opacity: k,
        }}
      >
        <Img src={staticFile(ARQ(`provas/${foto}.png`))} style={{ width: w, height: h, display: "block", filter: "saturate(0.9) contrast(1.04)" }} />
        {jl > 0 && (
          <>
            <div style={{ position: "absolute", left: 14 + w * 0.69, top: 14 + h * 0.06, width: w * 0.2, height: h * 0.52, border: `7px solid ${VERMELHO}`, borderRadius: "50%", opacity: jl, transform: `scale(${0.6 + 0.4 * jl}) rotate(-8deg)` }} />
            <div style={{ position: "absolute", right: -10, top: -70, fontFamily: marcador, fontSize: 46, color: VERMELHO, opacity: jl, transform: "rotate(-4deg)", textShadow: "0 3px 12px rgba(0,0,0,.9)", whiteSpace: "nowrap" }}>JASON E LUCIA CHEGAM →</div>
          </>
        )}
        {marca !== false && <div style={{ position: "absolute", left: "50%", top: -16, width: 34, height: 34, marginLeft: -17, borderRadius: 17, background: "radial-gradient(circle at 35% 35%, #FF8A8A, #C21A1A 70%)", boxShadow: "0 4px 8px rgba(0,0,0,.6)" }} />}
      </div>
    </AbsoluteFill>
  );
};
// tradução do bilhete: fita escura com letra de marcador, embaixo da imagem
const Traducao: React.FC<{ texto: string; t: number; de: number; fim: number }> = ({ texto, t, de, fim }) => {
  const k = entra(t, de + 0.35, 0.35) * (1 - suave(t, fim - 0.15, fim));
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: CENTRO + 352, display: "flex", justifyContent: "center", opacity: k }}>
      <div style={{ background: "rgba(10,10,14,.9)", border: "2px solid rgba(255,255,255,.12)", padding: "10px 26px 12px", transform: `rotate(-1.2deg) translateY(${(1 - k) * 14}px)`, boxShadow: "0 10px 30px rgba(0,0,0,.6)" }}>
        <div style={{ fontFamily: maquina, fontSize: 22, letterSpacing: 4, color: "rgba(255,255,255,.55)", marginBottom: 4 }}>TRADUÇÃO</div>
        <div style={{ fontFamily: marcador, fontSize: 40, lineHeight: 1.15, color: "#fff", textAlign: "center" }}>{texto}</div>
      </div>
    </div>
  );
};
// o bilhete do mestre das marionetes: tradução linha por linha, junto com a voz
const LINHAS: [string, number][] = [
  ["SE VOCÊ CONSEGUE LER ISSO,", LER],
  ["MESTRE DAS MARIONETES,", em("mestre", LER)],
  ["ME DEIXA SER LIVRE!", em("me", LER)],
];
const TraducaoMestre: React.FC<{ t: number }> = ({ t }) => {
  if (t < LER - 0.1 || t > MESTRE - 0.05) return null;
  const fora = 1 - suave(t, MESTRE - 0.2, MESTRE - 0.05);
  return (
    <div style={{ position: "absolute", left: 50, right: 50, top: CENTRO + 352, textAlign: "center", opacity: fora }}>
      {LINHAS.map(([txt, q], i) => {
        const k = entra(t, q - 0.05, 0.3);
        return (
          <div key={i} style={{ fontFamily: marcador, fontSize: i === 2 ? 58 : 46, lineHeight: 1.18, color: i === 2 ? VERMELHO : "#fff", opacity: k, transform: `translateY(${(1 - k) * 12}px)`, textShadow: "0 4px 18px rgba(0,0,0,.95)" }}>
            {txt}
          </div>
        );
      })}
    </div>
  );
};
const Fundo: React.FC<{ t: number }> = ({ t }) => {
  const i = planoEm(t);
  if (i < 0 || t > FINAL + 0.3) return null;
  const p = PLANOS[i];
  const fim = Math.min(PLANOS[i + 1]?.de ?? FIM, FINAL + 0.3);
  const z = 1 + 0.025 * interpolate(t, [p.de, fim], [0, 1], { ...cl, easing: Easing.inOut(Easing.sin) });
  const dur = Math.max(1, Math.round((fim - p.de) * FPS) + 2);
  const sFundo = p.s ?? 0; // atrás das provas: foto do próprio mural, desfocada
  return (
    <Sequence key={i} from={Math.round(p.de * FPS)} durationInFrames={dur} layout="none">
      <AbsoluteFill style={{ background: "#050608", overflow: "hidden" }}>
        {p.foto ? <MuralBorrado /> : <FundoBorrado s={sFundo} />}
        {p.foto ? <Prova foto={p.foto} t={t} de={p.de} fim={fim} marca={p.foto !== "casa2021"} /> : <Jogo s={p.s ?? 0} z={z} borrado={p.borrado} />}
        {p.trad && <Traducao texto={p.trad} t={t} de={p.de} fim={fim} />}
      </AbsoluteFill>
    </Sequence>
  );
};

// ---------- título (em cima): carimbo "PROVA 0N" + título curto ----------
type Tela = { de: number; ate: number; prova?: string; rotulo?: string; titulo: string };
const TELAS: Tela[] = [
  { de: 0.05, ate: QUADRO - 0.05, rotulo: "GTA 6 · MISTÉRIO", titulo: "O NPC QUE SABE DE TUDO" },
  { de: QUADRO, ate: CINCO - 0.05, rotulo: "SAN ANDREAS REMASTERIZADO", titulo: "O QUADRO DE 2021" },
  { de: CINCO, ate: GARAGEM - 0.05, rotulo: "LEONIDA · 5 ANOS DEPOIS", titulo: "BELVILLE" },
  { de: GARAGEM, ate: PAREDE - 0.05, rotulo: "DÁ PRA FORÇAR", titulo: "A GARAGEM" },
  { de: PAREDE, ate: CERTO - 0.05, rotulo: "SIMULANTES, LEVANTEM-SE", titulo: "NÓS NUNCA ESTIVEMOS VIVOS" },
  { de: CERTO, ate: P1 - 0.05, rotulo: "PARECE MALUQUICE...", titulo: "MAS ELE TÁ CERTO" },
  { de: P1, ate: P2 - 0.05, prova: "01", titulo: "AS PORTAS NÃO SÃO REAIS" },
  { de: P2, ate: P3 - 0.05, prova: "02", titulo: "É A MESMA PESSOA" },
  { de: P3, ate: P4 - 0.05, prova: "03", titulo: "OS CARROS SOMEM" },
  { de: P4, ate: P5 - 0.05, prova: "04", titulo: "O CACHORRO VOLTOU" },
  { de: P5, ate: P6 - 0.05, prova: "05", titulo: "CADÊ AS CRIANÇAS?" },
  { de: P6, ate: P7 - 0.05, prova: "06", titulo: "O CRIME DISPAROU" },
  { de: P7, ate: FUGA - 0.05, prova: "07", titulo: "O NÚMERO 6" },
  { de: FUGA, ate: SPRAY - 0.05, rotulo: "PASSAGEM · ESTRADA · BARCO", titulo: "ELE TENTOU FUGIR" },
  { de: SPRAY, ate: BILHETE - 0.05, rotulo: "EM SPRAY, POR CIMA DE TUDO", titulo: "EU NÃO AGUENTO MAIS" },
  { de: BILHETE, ate: MESTRE - 0.05, rotulo: "ESCRITO PRA VOCÊ", titulo: "O BILHETE" },
  { de: MESTRE, ate: FINAL - 0.1, rotulo: "QUEM CONTROLA JASON E LUCIA", titulo: "O MESTRE É VOCÊ" },
];
const Titulos: React.FC<{ t: number }> = ({ t }) => {
  const tela = TELAS.find((x) => t >= x.de - 0.05 && t < x.ate);
  if (!tela) return null;
  const k = entra(t, tela.de, 0.3);
  const s = suave(t, tela.ate - 0.15, tela.ate);
  const carimbo = interpolate(t, [tela.de, tela.de + 0.25], [1.8, 1], { ...cl, easing: Easing.in(Easing.quad) });
  const n = tela.titulo.length;
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: 236, textAlign: "center", fontFamily, opacity: k * (1 - s) }}>
      {tela.prova && (
        <div style={{ display: "inline-block", fontFamily: maquina, fontSize: 40, letterSpacing: 8, color: VERMELHO, border: `4px solid ${VERMELHO}`, padding: "2px 18px 0", marginBottom: 14, transform: `rotate(-4deg) scale(${carimbo})`, opacity: entra(t, tela.de, 0.12), textShadow: "0 0 18px rgba(255,77,77,.35)", background: "rgba(0,0,0,.35)" }}>
          PROVA {tela.prova}
        </div>
      )}
      {tela.rotulo && <div style={{ fontFamily: maquina, fontSize: 32, letterSpacing: 5, color: tela.de < 0.1 ? VERMELHO : "#E9E3D6", textShadow: sombra, marginBottom: 8, transform: `translateY(${(1 - k) * 16}px)` }}>{tela.rotulo}</div>}
      <div style={{ fontWeight: 900, fontSize: n > 20 ? 64 : n > 15 ? 76 : 92, lineHeight: 1.02, letterSpacing: -1, color: "#fff", WebkitTextStroke: "8px #000", paintOrder: "stroke fill", textShadow: sombra, transform: `translateY(${(1 - k) * 20}px) scale(${0.94 + 0.06 * k})` }}>{tela.titulo}</div>
    </div>
  );
};

// ---------- legenda (embaixo) ----------
const DESTAQUE = /^(npc|gta|6|jogo|bilhete|você|final|2021|remasterizado|quadro|óvni|vazando|belville|igualzinha|garagem|forçar|mural|provas|nunca|vivos|simulantes|certo|portas|reais|fachada|mesmo|rosto|carros|sumindo|cachorro|respawn|crianças|gráfico|crime|dispara|jason|lucia|jogando|seis|número|fugir|los|santos|barco|aguento|mais|mestre|marionetes|livre|fase|extra|vyce|protagonista|comenta)$/i;
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
    <div style={{ position: "absolute", top: 1590, left: 50, right: 50, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 18px" }}>
      {BLOCOS[i].map((p, j) => (
        <span key={j} style={{ fontFamily, fontWeight: 900, fontSize: 66, lineHeight: 1.1, color: DESTAQUE.test(limpa(p.w)) ? AMARELO : "#fff", opacity: t >= p.s - 0.03 ? 1 : 0, WebkitTextStroke: "10px #000", paintOrder: "stroke fill" }}>
          {p.w.replace(/[.,:!…]+$/, "")}
        </span>
      ))}
    </div>
  );
};

// ---------- clima: vinheta fria + grão + piscada de luz nas provas ----------
const Clima: React.FC<{ f: number; t: number }> = ({ f, t }) => {
  if (t > FINAL + 0.3) return null;
  return (
    <>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 48%, rgba(0,0,0,0) 45%, rgba(0,4,12,.72) 100%)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.55) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 74%, rgba(0,0,0,.65) 100%)" }} />
      <AbsoluteFill style={{ background: "rgba(40,70,110,.07)", mixBlendMode: "screen" }} />
      <AbsoluteFill style={{ opacity: 0.09, mixBlendMode: "overlay" }}>
        <svg width="1080" height="1920">
          <filter id="grao">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={f % 23} />
          </filter>
          <rect width="1080" height="1920" filter="url(#grao)" />
        </svg>
      </AbsoluteFill>
    </>
  );
};

// ---------- final: o Vyce DENTRO do GTA, na frente da casa à noite ----------
const boca = (f: number) => (dados.boca as number[])[f] ?? 0;
const pisca = (t: number) => {
  const c = t % 4.3;
  return c > 1.4 && c < 1.52;
};
const OPCOES: [string, string, string, string][] = [
  ["1", "🤖", "SÓ UM NPC", AZUL],
  ["2", "🎮", "FUTURO PROTAGONISTA", VERDE],
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
          <OffthreadVideo src={VIDEO} startFrom={Math.round(470.5 * FPS)} muted style={{ position: "absolute", left: -(3413 - 1080) / 2, top: 0, width: 3413, height: 1920, filter: "blur(2px) brightness(1.15)" }} />
        </AbsoluteFill>
      </Sequence>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.65) 0%, rgba(0,0,0,.2) 35%, rgba(0,0,0,0) 60%, rgba(0,0,0,.35) 100%)" }} />
      <AbsoluteFill>
        <ThreeCanvas width={1080} height={1920} camera={{ fov, near: 0.05, far: 50 }} gl={{ toneMapping: THREE.ACESFilmicToneMapping, antialias: true, alpha: true }}>
          <Camera pos={[0, 1.2, 6]} alvo={[0, 1.05, 0]} />
          <hemisphereLight args={["#DDE6FF", "#2E3440", 1.15]} />
          <directionalLight position={[-2, 5, 4]} intensity={2.2} color="#FFF2DE" />
          <directionalLight position={[2.5, 3, -2]} intensity={1.3} color="#BFD4FF" />
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
            const kk = entra(t, em(i === 0 ? "ele" : "ou", ENQ) - 0.15);
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

// ---------- som: voz + música (Dark Shadows, Mixkit 64) bem baixa + whoosh nos planos + carimbo nas provas + virais pontuais ----------
const PROVAS = [P1, P2, P3, P4, P5, P6, P7];
const VIRAL = (n: string) => `fase-extra/sons/virais/${n}.wav`;
const SONS: [number, string, number][] = [
  ...[QUADRO, CINCO, GARAGEM, PAREDE, FUGA, SPRAY, BILHETE, MESTRE].map((q) => [q - 0.05, "whoosh", 0.09] as [number, string, number]),
  ...PROVAS.map((q) => [q - 0.02, "fase-extra/sons/carimbo.wav", 0.14] as [number, string, number]),
  [FINAL, "whoosh", 0.1],
  [em("nunca") - 0.05, VIRAL("minecraft-caverna"), 0.14],
  [em("depois", P4) + 0.45, VIRAL("huh"), 0.16],
  [em("jogando") + 0.45, VIRAL("dexter-meme"), 0.16],
];
const falando = (t: number) => PAL.some((p) => t >= p.s - 0.04 && t <= p.e + 0.04);
const DUCK: number[] = (() => {
  const bruto = Array.from({ length: DURACAO_FASE40 }, (_, i) => (falando(i / FPS) ? 0.5 : 0.85));
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

export const VideoFase40: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Fundo t={t} />
      <Clima f={f} t={t} />
      <TraducaoMestre t={t} />
      <Titulos t={t} />
      <VyceNoGta t={t} f={f} />
      <Legenda t={t} />
      <Audio src={staticFile(ARQ("narracao.wav"))} />
      <Audio src={staticFile(ARQ("trilha.wav"))} volume={(q) => 0.12 * (DUCK[q] ?? 0.5)} />
      {SONS.map(([q, nome, vol], i) => (
        <Sequence key={i} from={Math.max(0, Math.round(q * FPS))} durationInFrames={120}>
          <Audio src={staticFile(nome === "whoosh" ? "fase-extra/sons/whoosh.wav" : nome.includes("/") ? nome : ARQ(`sfx-${nome}.wav`))} volume={vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
