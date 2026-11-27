import { loadFont } from "@remotion/google-fonts/Montserrat";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, Audio, Easing, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { Camera } from "../Estudio";
import { CorPele, Mascote3D, PoseMascote } from "../Mascote3D";
import dados from "./dados.json";

// Fase Extra, Fase 41: "GTA 6 a 60 FPS: o truque do streamer". Renderizado a 60 QUADROS POR SEGUNDO (a comparação precisa).
// Base: corte da live do Davy Jones (YouTube xXinOoII0uU). Ele pode aparecer (webcam) e a voz dele entra em 2 falas curtas
// (já emendadas na narracao.wav). clipes/jogo60.mp4 = o corte inteiro a 60; clipes/jogo30.mp4 = o mesmo com metade dos
// quadros (cada um repetido 2×, como o console entrega); lento60/lento30 = 86,5–89,5 s em 0,5×.
const { fontFamily } = loadFont("normal", { weights: ["600", "800", "900"], subsets: ["latin"] });
export const FPS = 60;
const FIM = dados.duracao + 1.2;
export const DURACAO_FASE41 = Math.ceil(FIM * FPS);
const AMARELO = "#FFD84A";
const LARANJA = "#FF8A2B";
const VERMELHO = "#FF4D4D";
const VERDE = "#5CFF8A";
const AZUL = "#6FD6FF";
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const suave = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
const entra = (t: number, a: number, d = 0.3) => interpolate(t, [a, a + d], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) });
const sombra = "0 4px 22px rgba(0,0,0,.85)";
const ARQ = (n: string) => `fase-extra/fase41/${n}`;

// ---------- âncoras ----------
type Pal = { w: string; s: number; e: number; davy?: boolean };
const PAL = dados.palavras as Pal[];
const limpa = (w: string) => w.toLowerCase().replace(/[.,?!:…“”"]/g, "");
const em = (palavra: string, depois = 0) => PAL.find((p) => !p.davy && limpa(p.w) === palavra && p.s >= depois)?.s ?? 999;
const DAVY = dados.davy as [number, number][];
const GANCHO = em("esse");
const NOFINAL = em("e", em("dá"));
const CONSOLE = em("no", NOFINAL + 1);
const DIF = em("agora");
const LENTO = em("em", DAVY[1][1]);
const TRUQUE = em("o", em("pulinhos"));
const PRECO = em("como");
const VERDADE = em("60", em("captura", PRECO));
const FINAL = em("você", em("ainda")) - 0.15;
const ENQ = em("e", em("vyce", FINAL));

// ---------- planos ----------
// tipo: "davy" = o streamer (quadro inteiro, com a webcam) · "um" = gameplay inteira (30 ou 60) · "dois" = 30 em cima × 60 embaixo
// "lento" = a comparação em 0,5× · "esquema" = o truque desenhado. s = segundo do corte.
type Plano = { de: number; tipo: "davy" | "um" | "dois" | "lento" | "esquema"; s?: number; fps?: 30 | 60 };
const PLANOS: Plano[] = [
  { de: 0, tipo: "davy", s: 167.55 },
  { de: GANCHO - 0.05, tipo: "dois", s: 66.0 },
  { de: NOFINAL - 0.05, tipo: "um", s: 213.0, fps: 60 },
  { de: CONSOLE - 0.05, tipo: "um", s: 72.0, fps: 30 },
  { de: DIF - 0.05, tipo: "dois", s: 85.0 },
  { de: DAVY[1][0] - 0.05, tipo: "davy", s: 237.7 },
  { de: LENTO - 0.05, tipo: "lento" },
  { de: TRUQUE - 0.05, tipo: "esquema", s: 130.0 },
  { de: PRECO - 0.05, tipo: "dois", s: 264.0 },
  { de: VERDADE - 0.05, tipo: "um", s: 284.0, fps: 60 },
];
PLANOS.sort((a, b) => a.de - b.de);
const planoEm = (t: number) => {
  let i = -1;
  while (i + 1 < PLANOS.length && PLANOS[i + 1].de <= t) i++;
  return i;
};
const V60 = staticFile(ARQ("clipes/jogo60.mp4"));
const V30 = staticFile(ARQ("clipes/jogo30.mp4"));
const L60 = staticFile(ARQ("clipes/lento60.mp4"));
const L30 = staticFile(ARQ("clipes/lento30.mp4"));
const H = (1080 * 1080) / 1920; // 607,5 — o quadro 16:9 inteiro, sem zoom

const Borrado: React.FC<{ src: string; s: number }> = ({ src, s }) => (
  <AbsoluteFill style={{ transform: "scale(1.2)" }}>
    <OffthreadVideo src={src} startFrom={Math.round(s * FPS)} muted style={{ position: "absolute", left: -(3413 - 1080) / 2, top: 0, width: 3413, height: 1920, filter: "blur(34px) brightness(0.35)" }} />
  </AbsoluteFill>
);
const Selo: React.FC<{ fps: 30 | 60; lento?: boolean }> = ({ fps, lento }) => (
  <div style={{ position: "absolute", left: 18, top: 16, display: "flex", gap: 10, alignItems: "center" }}>
    <div style={{ fontFamily, fontWeight: 900, fontSize: 46, color: "#111", background: fps === 30 ? VERMELHO : VERDE, borderRadius: 12, padding: "2px 16px", boxShadow: "0 6px 18px rgba(0,0,0,.55)" }}>{fps} FPS</div>
    {lento && <div style={{ fontFamily, fontWeight: 900, fontSize: 34, color: "#fff", background: "rgba(0,0,0,.65)", borderRadius: 10, padding: "4px 12px" }}>0,5×</div>}
  </div>
);
const Quadro: React.FC<{ src: string; s: number; top: number; z?: number; fps?: 30 | 60; lento?: boolean; semLegendaJogo?: boolean }> = ({ src, s, top, z = 1, fps, lento, semLegendaJogo }) => (
  <div style={{ position: "absolute", left: 0, top, width: 1080, height: H, overflow: "hidden", boxShadow: "0 18px 50px rgba(0,0,0,.7)" }}>
    <div style={{ position: "absolute", inset: 0, transform: `scale(${z})` }}>
      <OffthreadVideo src={src} startFrom={Math.round(s * FPS)} muted style={{ position: "absolute", left: 0, top: 0, width: 1080, height: H }} />
    </div>
    {/* a legenda de diálogo do jogo nesse trecho tem palavrão: desfoca só a faixa dela */}
    {semLegendaJogo && <div style={{ position: "absolute", left: 160, right: 160, top: H * 0.86, height: H * 0.11, backdropFilter: "blur(9px)", WebkitBackdropFilter: "blur(9px)", background: "rgba(0,0,0,.15)" }} />}
    {fps && <Selo fps={fps} lento={lento} />}
  </div>
);
const TOPO_A = 372; // comparação: painel de cima
const TOPO_B = TOPO_A + H + 14; // painel de baixo

// ---------- o esquema do truque ----------
const PASSOS: [string, string, string, string][] = [
  ["🎮", "CONSOLE", "30 QUADROS POR SEGUNDO", VERMELHO],
  ["🔌", "PLACA DE CAPTURA", "LEVA A IMAGEM PRO PC", AZUL],
  ["💻", "PROGRAMA NO PC", "CRIA 1 QUADRO NO MEIO", AMARELO],
  ["📺", "TELA", "60 QUADROS POR SEGUNDO", VERDE],
];
const Esquema: React.FC<{ t: number }> = ({ t }) => {
  const marcos = [em("console", TRUQUE), em("placa", TRUQUE), em("programa", TRUQUE), em("jogo", em("quadros", TRUQUE))];
  const tira = entra(t, em("quadro", TRUQUE) - 0.1, 0.4);
  const inventa = entra(t, em("inventa", TRUQUE) - 0.1, 0.3);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 90, right: 90, top: 450 }}>
        {PASSOS.map(([ic, nome, sub, cor], i) => {
          const k = entra(t, marcos[i] - 0.1, 0.35);
          return (
            <div key={nome}>
              {i > 0 && <div style={{ height: 34, display: "flex", justifyContent: "center", opacity: k }}><div style={{ width: 6, height: 34, background: "rgba(255,255,255,.5)" }} /></div>}
              <div style={{ display: "flex", alignItems: "center", gap: 22, background: "rgba(8,10,16,.82)", borderLeft: `10px solid ${cor}`, borderRadius: 16, padding: "16px 24px", opacity: k, transform: `translateX(${(1 - k) * -50}px)`, boxShadow: "0 12px 30px rgba(0,0,0,.5)" }}>
                <span style={{ fontSize: 58 }}>{ic}</span>
                <div style={{ fontFamily }}>
                  <div style={{ fontWeight: 900, fontSize: 46, color: "#fff" }}>{nome}</div>
                  <div style={{ fontWeight: 800, fontSize: 28, letterSpacing: 2, color: cor }}>{sub}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* tira de quadros: brancos = do jogo, amarelos = inventados */}
      <div style={{ position: "absolute", left: 60, right: 60, top: 1300, opacity: tira, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <div style={{ display: "flex", gap: 10 }}>
          {Array.from({ length: 10 }, (_, i) => {
            const falso = i % 2 === 1;
            const k = falso ? entra(t, em("quadro", TRUQUE) + 0.15 + i * 0.06, 0.2) : 1;
            return <div key={i} style={{ width: 74, height: 54, borderRadius: 8, background: falso ? AMARELO : "#EDEDED", opacity: k, transform: `scale(${0.6 + 0.4 * k})`, boxShadow: falso ? `0 0 ${18 * inventa}px ${AMARELO}` : "none" }} />;
          })}
        </div>
        <div style={{ fontFamily, fontWeight: 800, fontSize: 30, color: "#fff", textShadow: sombra }}>
          <span style={{ color: "#EDEDED" }}>■ DO JOGO</span>   <span style={{ color: AMARELO }}>■ INVENTADO PELO PC</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Fundo: React.FC<{ t: number }> = ({ t }) => {
  const i = planoEm(t);
  if (i < 0 || t > FINAL + 0.3) return null;
  const p = PLANOS[i];
  const fim = Math.min(PLANOS[i + 1]?.de ?? FIM, FINAL + 0.3);
  const z = 1 + 0.02 * interpolate(t, [p.de, fim], [0, 1], { ...cl, easing: Easing.inOut(Easing.sin) });
  const dur = Math.max(1, Math.round((fim - p.de) * FPS) + 2);
  const s = p.s ?? 0;
  let corpo: React.ReactNode;
  if (p.tipo === "davy") corpo = <><Borrado src={V60} s={s} /><Quadro src={V60} s={s} top={930 - H / 2} z={z} semLegendaJogo /></>;
  else if (p.tipo === "um") corpo = <><Borrado src={p.fps === 30 ? V30 : V60} s={s} /><Quadro src={p.fps === 30 ? V30 : V60} s={s} top={930 - H / 2} z={z} fps={p.fps} /></>;
  else if (p.tipo === "dois")
    corpo = (
      <>
        <Borrado src={V60} s={s} />
        <Quadro src={V30} s={s} top={TOPO_A} fps={30} />
        <Quadro src={V60} s={s} top={TOPO_B} fps={60} />
      </>
    );
  else if (p.tipo === "lento")
    corpo = (
      <>
        <Borrado src={L60} s={0} />
        <Quadro src={L30} s={0} top={TOPO_A} fps={30} lento />
        <Quadro src={L60} s={0} top={TOPO_B} fps={60} lento />
      </>
    );
  else corpo = <><Borrado src={V60} s={s} /><Esquema t={t} /></>;
  return (
    <Sequence key={i} from={Math.round(p.de * FPS)} durationInFrames={dur} layout="none">
      <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>{corpo}</AbsoluteFill>
    </Sequence>
  );
};
const ehDois = (t: number) => {
  const i = planoEm(t);
  return i >= 0 && (PLANOS[i].tipo === "dois" || PLANOS[i].tipo === "lento");
};
const ehDavy = (t: number) => DAVY.some(([a, b]) => t >= a - 0.05 && t < b + 0.15);

// ---------- título (em cima) ----------
type Tela = { de: number; ate: number; rotulo?: string; cor: string; titulo: string };
const TELAS: Tela[] = [
  { de: 0.05, ate: GANCHO - 0.05, rotulo: "AO VIVO", cor: VERMELHO, titulo: "\"É CINEMA!\"" },
  { de: GANCHO, ate: NOFINAL - 0.05, rotulo: "MESMO SEM MODO 60", cor: AMARELO, titulo: "GTA 6 A 60 FPS?!" },
  { de: NOFINAL, ate: CONSOLE - 0.05, rotulo: "NO FINAL", cor: LARANJA, titulo: "O TRUQUE E O PREÇO" },
  { de: CONSOLE, ate: DIF - 0.05, rotulo: "NEM O PS5 PRO TEM MODO 60", cor: VERMELHO, titulo: "NO CONSOLE: 30 FPS" },
  { de: DIF, ate: DAVY[1][0] - 0.05, rotulo: "MESMO TRECHO", cor: AMARELO, titulo: "30 × 60" },
  { de: DAVY[1][0], ate: LENTO - 0.05, rotulo: "AO VIVO", cor: VERMELHO, titulo: "\"DIFERENÇA BRUTAL!\"" },
  { de: LENTO, ate: TRUQUE - 0.05, rotulo: "REPARA NOS PULINHOS", cor: AMARELO, titulo: "EM CÂMERA LENTA" },
  { de: TRUQUE, ate: PRECO - 0.05, rotulo: "O JOGO CONTINUA EM 30", cor: AMARELO, titulo: "O TRUQUE" },
  { de: PRECO, ate: VERDADE - 0.05, rotulo: "BORRÃO · ATRASO · PC + PLACA", cor: LARANJA, titulo: "O PREÇO ⚠️" },
  { de: VERDADE, ate: FINAL - 0.1, rotulo: "SÓ NO PC OU NA PRÓXIMA GERAÇÃO", cor: VERDE, titulo: "60 DE VERDADE?" },
];
const Titulos: React.FC<{ t: number }> = ({ t }) => {
  const tela = TELAS.find((x) => t >= x.de - 0.05 && t < x.ate);
  if (!tela) return null;
  const k = entra(t, tela.de, 0.3);
  const s = suave(t, tela.ate - 0.15, tela.ate);
  const n = tela.titulo.length;
  const dois = ehDois(t);
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: dois ? 178 : 236, textAlign: "center", fontFamily, opacity: k * (1 - s) }}>
      {tela.rotulo && (
        <div style={{ display: "inline-block", fontWeight: 800, fontSize: dois ? 28 : 32, letterSpacing: 6, color: tela.rotulo === "AO VIVO" ? "#fff" : tela.cor, background: tela.rotulo === "AO VIVO" ? VERMELHO : "transparent", borderRadius: 8, padding: tela.rotulo === "AO VIVO" ? "2px 14px" : 0, textShadow: tela.rotulo === "AO VIVO" ? "none" : sombra, marginBottom: 6, transform: `translateY(${(1 - k) * 16}px)` }}>
          {tela.rotulo === "AO VIVO" ? "● AO VIVO" : tela.rotulo}
        </div>
      )}
      <div style={{ fontWeight: 900, fontSize: dois ? (n > 15 ? 66 : 80) : n > 18 ? 68 : n > 14 ? 78 : 92, lineHeight: 1.02, letterSpacing: -1, color: "#fff", WebkitTextStroke: "8px #000", paintOrder: "stroke fill", textShadow: sombra, transform: `translateY(${(1 - k) * 20}px) scale(${0.94 + 0.06 * k})` }}>{tela.titulo}</div>
    </div>
  );
};

// ---------- legenda (embaixo); as falas do Davy em azul, entre aspas ----------
const DESTAQUE = /^(streamer|gta|6|60|fps|rockstar|truque|preço|console|30|ps5|pro|processador|simulação|diferença|cima|baixo|carro|palmeiras|lenta|pulinhos|placa|captura|pc|programa|quadro|inventa|resto|borrar|atrasinho|controle|verdade|geração|anunciou|fase|extra|vyce|ótimo|comenta|cinema|brutal)$/i;
const BLOCOS: Pal[][] = (() => {
  const b: Pal[][] = [];
  let c: Pal[] = [];
  PAL.forEach((p, i) => {
    c.push(p);
    const n = PAL[i + 1];
    if (c.length >= 3 || /[.,?!:…]$/.test(p.w) || !n || n.s - p.e > 0.35 || !!n.davy !== !!p.davy) {
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
  const top = ehDois(t) ? 1612 : 1560;
  return (
    <div style={{ position: "absolute", top, left: 50, right: 50, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 18px" }}>
      {BLOCOS[i].map((p, j) => (
        <span key={j} style={{ fontFamily, fontWeight: 900, fontSize: 66, lineHeight: 1.1, fontStyle: p.davy ? "italic" : "normal", color: p.davy ? AZUL : DESTAQUE.test(limpa(p.w)) ? AMARELO : "#fff", opacity: t >= p.s - 0.03 ? 1 : 0, WebkitTextStroke: "10px #000", paintOrder: "stroke fill" }}>
          {p.w.replace(/[.,:!…]+$/, "")}
        </span>
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
  ["1", "🎬", "30 TÁ ÓTIMO", VERMELHO],
  ["2", "⚡", "SÓ JOGO EM 60", VERDE],
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
          <OffthreadVideo src={V60} startFrom={Math.round(290.0 * FPS)} muted style={{ position: "absolute", left: -(3413 - 1080) / 2, top: 0, width: 3413, height: 1920, filter: "blur(2px)" }} />
        </AbsoluteFill>
      </Sequence>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.65) 0%, rgba(0,0,0,.2) 35%, rgba(0,0,0,0) 60%, rgba(0,0,0,.35) 100%)" }} />
      <AbsoluteFill>
        <ThreeCanvas width={1080} height={1920} camera={{ fov, near: 0.05, far: 50 }} gl={{ toneMapping: THREE.ACESFilmicToneMapping, antialias: true, alpha: true }}>
          <Camera pos={[0, 1.2, 6]} alvo={[0, 1.05, 0]} />
          <hemisphereLight args={["#FFF1DE", "#4A3A2E", 1.1]} />
          <directionalLight position={[-2, 5, 4]} intensity={2.2} color="#FFF2DE" />
          <directionalLight position={[2.5, 3, -2]} intensity={1.3} color="#FFE2C0" />
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
            const kk = entra(t, em(i === 0 ? "30" : "ou", ENQ) - 0.15);
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

// aviso honesto embaixo do painel de 30 na comparação
const Aviso: React.FC<{ t: number }> = ({ t }) => {
  if (!ehDois(t) || t > FINAL) return null;
  return <div style={{ position: "absolute", left: 0, right: 0, top: TOPO_A + H - 40, textAlign: "center", fontFamily, fontWeight: 700, fontSize: 22, letterSpacing: 2, color: "rgba(255,255,255,.8)", textShadow: "0 2px 8px rgba(0,0,0,1)" }}>SIMULAÇÃO: MESMO TRECHO COM METADE DOS QUADROS</div>;
};

// ---------- som: voz (com as 2 falas do Davy) + música (Mi Gente, Mixkit 284) bem baixa + whoosh nos planos + virais pontuais ----------
const VIRAL = (n: string) => `fase-extra/sons/virais/${n}.wav`;
const SONS: [number, string, number][] = [
  ...[GANCHO, CONSOLE, DIF, LENTO, TRUQUE, PRECO, VERDADE].map((q) => [q - 0.05, "whoosh", 0.09] as [number, string, number]),
  [FINAL, "whoosh", 0.1],
  [em("60", DIF) + 0.35, VIRAL("magic-reveal"), 0.18],
  [em("quadro", TRUQUE) + 0.2, VIRAL("click"), 0.2],
  [em("preço", PRECO) + 0.3, VIRAL("erro-windows"), 0.18],
];
const falando = (t: number) => PAL.some((p) => t >= p.s - 0.04 && t <= p.e + 0.04) || ehDavy(t);
const DUCK: number[] = (() => {
  const bruto = Array.from({ length: DURACAO_FASE41 }, (_, i) => (falando(i / FPS) ? 0.5 : 0.85));
  return bruto.map((_, i) => {
    let soma = 0;
    let n = 0;
    for (let k = -12; k <= 12; k++) {
      const v = bruto[i + k];
      if (v !== undefined) {
        soma += v;
        n++;
      }
    }
    return soma / n;
  });
})();

export const VideoFase41: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Fundo t={t} />
      {t < FINAL + 0.3 && <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.5) 0%, rgba(0,0,0,0) 20%, rgba(0,0,0,0) 78%, rgba(0,0,0,.6) 100%)" }} />}
      <Aviso t={t} />
      <Titulos t={t} />
      <VyceNoGta t={t} f={f} />
      <Legenda t={t} />
      <Audio src={staticFile(ARQ("narracao.wav"))} />
      <Audio src={staticFile(ARQ("trilha.wav"))} volume={(q) => 0.12 * (DUCK[q] ?? 0.5)} />
      {SONS.map(([q, nome, vol], i) => (
        <Sequence key={i} from={Math.max(0, Math.round(q * FPS))} durationInFrames={240}>
          <Audio src={staticFile(nome === "whoosh" ? "fase-extra/sons/whoosh.wav" : nome.includes("/") ? nome : ARQ(`sfx-${nome}.wav`))} volume={vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
