import { loadFont } from "@remotion/google-fonts/Montserrat";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { Acabamento, PalcoCinema } from "../../cinema/Palco";
import { Camera } from "../Estudio";
import { Mascote3D, PoseMascote } from "../Mascote3D";
import { QuartoGamer } from "../QuartoGamer";
import dados from "./dados.json";

// Fase Extra, Fase 16: "Tem empresa fechando no dia 19 pro povo jogar GTA 6" (~56 s).
// O mundo parando no lançamento: a empresa da Califórnia "e/ou em Vice City", a Logitech (inclusive no Brasil),
// a Pocketpair, o batalhão do Exército dos EUA (folga em troca de mais 2 anos) e os pedidos de folga. Só imagem oficial.
const { fontFamily } = loadFont("normal", { weights: ["600", "800", "900"], subsets: ["latin"] });
export const FPS = 30;
const FIM = dados.duracao + 1.0;
export const DURACAO_FASE16 = Math.ceil(FIM * FPS);
const ROXO = "#B66BFF";
const ROSA = "#FF4FD8";
const VERDE = "#4ADE80";
const VERMELHO = "#FF4D5E";
const AMARELO = "#FFD84A";
const AZUL = "#7CC8FF";
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const suave = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
const entra = (t: number, a: number, d = 0.3) => interpolate(t, [a, a + d], [0, 1], { ...cl, easing: Easing.out(Easing.back(1.7)) });
const sombra = "0 0 26px rgba(182,107,255,.85), 0 5px 0 #2B0F66, 0 0 8px rgba(0,0,0,.9)";

const INICIO_FINAL = 48.74; // "Você está na Fase Extra"
const ENQUETE = 51.42;
const emSetup = (t: number) => t >= INICIO_FINAL;
const CLIPE = (n: string) => `fase-extra/fase16/clipes/${n}.mp4`;

// ---------- planos: vídeo (clipe) ou foto desfocada de fundo ----------
type Plano = { de: number; clipe?: string; foto?: string; src?: number; x?: number; x2?: number; zoom?: number; chicote?: boolean };
const PLANOS: Plano[] = [
  { de: 0.0, clipe: "lojas", src: 0, x: 0.5, x2: 0.45, zoom: 1.1 },
  { de: 3.98, clipe: "loja2", src: 0, x: 0.5, x2: 0.45, chicote: true },
  // o aviso interno
  { de: 6.5, clipe: "moto", src: 0, x: 0.5, x2: 0.45, chicote: true },
  { de: 10.48, clipe: "tiro", src: 0.5, x: 0.5, x2: 0.42 },
  { de: 14.24, clipe: "rua", src: 0, x: 0.55, x2: 0.45, chicote: true },
  // Logitech
  { de: 16.06, clipe: "jetski", src: 0, x: 0.5, x2: 0.45, chicote: true },
  { de: 19.6, clipe: "aereo", src: 0, x: 0.5, x2: 0.5, chicote: true },
  // Pocketpair
  { de: 21.06, clipe: "airboat", src: 0, x: 0.5, x2: 0.5, chicote: true },
  { de: 23.7, clipe: "pista", src: 0, x: 0.5, x2: 0.45 },
  // Exército
  { de: 24.8, clipe: "aereo", src: 1.5, x: 0.45, x2: 0.55, chicote: true },
  { de: 27.36, clipe: "pista", src: 1.1, x: 0.5, x2: 0.45 },
  { de: 30.16, clipe: "corre", src: 1.0, x: 0.5, x2: 0.45, chicote: true },
  { de: 32.84, clipe: "moto", src: 4.0, x: 0.5, x2: 0.5 },
  { de: 33.62, clipe: "rua", src: 2.0, x: 0.5, x2: 0.45, chicote: true, zoom: 1.15 },
  // gráfico
  { de: 34.72, clipe: "lojas", src: 2.5, x: 0.45, x2: 0.55, chicote: true },
  { de: 37.46, clipe: "aereo", src: 3.8, x: 0.5, x2: 0.45 },
  { de: 39.58, clipe: "tiro", src: 3.0, x: 0.5, x2: 0.45, chicote: true },
  // o chefe
  { de: 42.48, clipe: "pista", src: 2.0, x: 0.5, x2: 0.45, chicote: true },
  { de: 45.28, clipe: "loja2", src: 0.8, x: 0.45, x2: 0.55, chicote: true },
  { de: 47.56, clipe: "airboat", src: 0, x: 0.5, x2: 0.5, chicote: true },
];
const planoEm = (t: number) => {
  let i = 0;
  while (i + 1 < PLANOS.length && PLANOS[i + 1].de <= t) i++;
  return i;
};
const fimDoPlano = (i: number) => Math.min(PLANOS[i + 1]?.de ?? FIM, INICIO_FINAL + 0.4);

const Fundo: React.FC<{ t: number }> = ({ t }) => {
  const i = planoEm(t);
  const p = PLANOS[i];
  const fim = fimDoPlano(i);
  if (t > fim) return null;
  const k = interpolate(t, [p.de, fim], [0, 1], cl);
  const punch = 1 + 0.08 * (1 - suave(t, p.de, p.de + 0.25));
  const ch = p.chicote ? 1 - suave(t, p.de, p.de + 0.22) : 0;
  const x = interpolate(k, [0, 1], [p.x ?? 0.5, p.x2 ?? p.x ?? 0.5]);
  const z = (p.zoom ?? 1.06) * (1 + 0.07 * k) * punch;
  const dur = Math.max(1, Math.round((fim - p.de) * FPS) + 2);
  const cheia = { position: "absolute", width: 1080, height: 1920, left: 0, top: 0, objectFit: "cover", transform: `scale(${z})`, transformOrigin: `${x * 100}% 50%` } as const;
  return (
    <Sequence key={i} from={Math.round(p.de * FPS)} durationInFrames={dur} layout="none">
      <AbsoluteFill style={{ overflow: "hidden", filter: ch > 0.02 ? `blur(${10 * ch}px)` : undefined, transform: `translateX(${ch * 260}px)` }}>
        {p.clipe && <OffthreadVideo src={staticFile(CLIPE(p.clipe))} startFrom={Math.round((p.src ?? 0) * FPS)} muted style={{ ...cheia, filter: `brightness(${["noite", "torre", "praianoite"].includes(p.clipe) ? 1.38 : 1.16}) contrast(1.05) saturate(1.15)` }} />}
        {p.foto && <Img src={staticFile(p.foto)} style={{ ...cheia, filter: "blur(36px) brightness(.5) saturate(1.3)", transform: `scale(${1.3 * z})` }} />}
      </AbsoluteFill>
    </Sequence>
  );
};

// ---------- peças comuns ----------
const Chip: React.FC<{ t: number; de: number; cor: string; children: React.ReactNode; tam?: number; riscado?: boolean }> = ({ t, de, cor, children, tam = 42, riscado }) => {
  const q = entra(t, de, 0.25);
  const r = riscado ? suave(t, de + 0.35, de + 0.6) : 0;
  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 12, margin: "8px 6px 0", fontWeight: 900, fontSize: tam, color: "#fff", background: "rgba(20,10,40,.85)", border: `4px solid ${cor}`, borderRadius: 18, padding: "4px 20px", boxShadow: `0 0 20px ${cor}`, opacity: q, transform: `scale(${0.5 + 0.5 * q})`, whiteSpace: "nowrap" }}>
      {children}
      {riscado && <div style={{ position: "absolute", left: "4%", top: "50%", height: 7, width: `${92 * r}%`, background: VERMELHO, borderRadius: 4, boxShadow: `0 0 10px ${VERMELHO}` }} />}
    </div>
  );
};
const Bloco: React.FC<{ t: number; de: number; ate: number; children: React.ReactNode; gancho?: boolean; topo?: number }> = ({ t, de, ate, children, gancho, topo }) => {
  if (t < de - 0.05 || t > ate + 0.05) return null;
  const k = entra(t, de);
  const s = suave(t, ate - 0.15, ate);
  const tx = gancho ? Math.sin(t * 61) * 14 * (1 - suave(t, de + 0.1, de + 0.6)) : 0;
  return <div style={{ position: "absolute", top: topo ?? 650, left: 60, right: 180, textAlign: "center", color: "#fff", fontFamily, opacity: k * (1 - s), transform: `translateX(${tx}px) scale(${0.7 + 0.3 * k})` }}>{children}</div>;
};
const G: React.FC<{ tam: number; children: React.ReactNode; cor?: string }> = ({ tam, children, cor = "#fff" }) => <div style={{ fontWeight: 900, fontSize: Math.round(tam * 0.74), lineHeight: 0.95, letterSpacing: -2, color: cor, textShadow: sombra, whiteSpace: "nowrap" }}>{children}</div>;
const P: React.FC<{ children: React.ReactNode; cor?: string }> = ({ children, cor = "#F3E8FF" }) => <div style={{ fontWeight: 800, fontSize: 36, letterSpacing: 4, color: cor, textShadow: sombra, marginTop: 6 }}>{children}</div>;

const Janela: React.FC<{ t: number; de: number; ate: number; topo?: number; children: React.ReactNode }> = ({ t, de, ate, topo = 240, children }) => {
  if (t < de || t > ate) return null;
  const k = entra(t, de, 0.35);
  const sai = suave(t, ate - 0.2, ate);
  return <div style={{ position: "absolute", top: topo, left: 60, right: 180, textAlign: "center", fontFamily, color: "#fff", opacity: k * (1 - sai), transform: `scale(${0.7 + 0.3 * k})` }}>{children}</div>;
};

// ---------- gancho: a placa vira ----------
const Gancho: React.FC<{ t: number }> = ({ t }) => {
  const vira = suave(t, 0.74, 1.05);
  const fechado = vira > 0.5;
  const rot = fechado ? (1 - vira) * 180 : vira * 180;
  const treme = t > 1.05 ? Math.sin(t * 60) * 12 * (1 - suave(t, 1.1, 1.8)) : 0;
  return (
    <Janela t={t} de={0} ate={6.46} topo={250}>
      <div style={{ display: "inline-block", fontWeight: 900, fontSize: 44, letterSpacing: 4, color: "#111", background: AMARELO, borderRadius: 14, padding: "4px 20px", boxShadow: `0 0 24px ${AMARELO}` }}>📅 19/11</div>
      <div style={{ position: "relative", margin: "26px auto 0", width: 700, height: 300, perspective: 900, transform: `translateX(${treme}px)` }}>
        <div style={{ position: "absolute", left: "50%", top: -40, width: 6, height: 50, background: "#ddd" }} />
        <div style={{ position: "absolute", inset: 0, borderRadius: 26, display: "flex", alignItems: "center", justifyContent: "center", transform: `rotateX(${rot}deg)`, background: fechado ? VERMELHO : VERDE, border: "8px solid #fff", boxShadow: `0 0 50px ${fechado ? VERMELHO : VERDE}, 0 20px 40px rgba(0,0,0,.5)` }}>
          <div style={{ fontWeight: 900, fontSize: fechado ? 118 : 130, color: "#fff", letterSpacing: 2, textShadow: "0 6px 0 rgba(0,0,0,.25)" }}>{fechado ? "FECHADO 🎮" : "ABERTO"}</div>
        </div>
      </div>
      <div style={{ marginTop: 34, opacity: entra(t, 2.74) }}>
        <P cor={AMARELO}>PRA TODO MUNDO JOGAR GTA 6</P>
      </div>
      <div style={{ marginTop: 14 }}>
        <Chip t={t} de={4.34} cor={AZUL} tam={46}>🔓 SÓ REABRE DEPOIS DE 1 MISSÃO ✅</Chip>
      </div>
    </Janela>
  );
};

// ---------- o aviso interno ----------
const Aviso: React.FC<{ t: number }> = ({ t }) => {
  const carimbo = entra(t, 13.2, 0.25);
  const linha = (txt: string, de: number) => (
    <div style={{ fontWeight: 800, fontSize: 40, marginTop: 10, opacity: entra(t, de), display: "flex", alignItems: "center", gap: 14 }}>
      <span style={{ color: VERMELHO }}>✖</span> {txt}
    </div>
  );
  return (
    <Janela t={t} de={6.5} ate={14.2} topo={260}>
      <P cor={AMARELO}>É SÉRIO.</P>
      <div style={{ position: "relative", margin: "18px auto 0", width: 780, padding: "26px 34px 40px", background: "#F4EFE4", color: "#1b1b1b", borderRadius: 8, textAlign: "left", boxShadow: "0 20px 50px rgba(0,0,0,.6)", transform: `rotate(-1.5deg) scale(${0.6 + 0.4 * entra(t, 7.36)})`, opacity: entra(t, 7.36) }}>
        <div style={{ fontFamily: "Georgia, serif", fontWeight: 900, fontSize: 52, letterSpacing: 2, borderBottom: "3px solid #1b1b1b", paddingBottom: 8 }}>AVISO INTERNO</div>
        <div style={{ fontWeight: 700, fontSize: 30, marginTop: 12, color: "#555", opacity: entra(t, 7.88) }}>🔧 Peças de carro · Califórnia · 19/11</div>
        <div style={{ fontWeight: 700, fontSize: 32, marginTop: 14, opacity: entra(t, 9.9) }}>A equipe vai estar:</div>
        {linha("INDISPONÍVEL", 10.48)}
        {linha("INALCANÇÁVEL", 11.56)}
        <div style={{ position: "absolute", right: -10, bottom: -70, opacity: carimbo, transform: `rotate(-10deg) scale(${2 - carimbo})`, border: `8px solid ${ROXO}`, color: ROXO, fontWeight: 900, fontSize: 50, padding: "4px 20px", borderRadius: 14, background: "rgba(244,239,228,.92)", whiteSpace: "nowrap" }}>E/OU EM VICE CITY 🌴</div>
      </div>
    </Janela>
  );
};
const NaoUnica: React.FC<{ t: number }> = ({ t }) => (
  <Bloco t={t} de={14.24} ate={16.02} topo={720} gancho>
    <P>E ELA NÃO É…</P>
    <G tam={130} cor={AMARELO}>A ÚNICA</G>
  </Bloco>
);

// ---------- Logitech ----------
const Logitech: React.FC<{ t: number }> = ({ t }) => {
  const n = Math.round(interpolate(t, [17.6, 18.5], [0, 7000], { ...cl, easing: Easing.out(Easing.cubic) }));
  return (
    <Janela t={t} de={16.06} ate={21.02} topo={300}>
      <Chip t={t} de={16.16} cor={AZUL} tam={50}>🖱️ LOGITECH</Chip>
      <div style={{ marginTop: 20, opacity: entra(t, 17.6) }}>
        <div style={{ fontWeight: 900, fontSize: 190, lineHeight: 1, color: "#fff", textShadow: sombra, fontVariantNumeric: "tabular-nums" }}>{n.toLocaleString("pt-BR")}</div>
        <G tam={90} cor={AMARELO}>FOLGAS PRA JOGAR</G>
      </div>
      <div style={{ marginTop: 24, opacity: entra(t, 19.6), transform: `rotate(-3deg) scale(${0.5 + 0.5 * entra(t, 19.6)})` }}>
        <div style={{ display: "inline-block", fontWeight: 900, fontSize: 56, color: "#111", background: VERDE, borderRadius: 16, padding: "6px 26px", boxShadow: `0 0 30px ${VERDE}` }}>INCLUSIVE NO BRASIL 💚</div>
      </div>
    </Janela>
  );
};

// ---------- Pocketpair: 5 dias ----------
const Pocketpair: React.FC<{ t: number }> = ({ t }) => (
  <Janela t={t} de={21.06} ate={24.76} topo={300}>
    <Chip t={t} de={21.2} cor={ROSA} tam={46}>🎮 POCKETPAIR (PALWORLD)</Chip>
    <P cor={AMARELO}>FOI ALÉM:</P>
    <div style={{ marginTop: 20, display: "flex", gap: 14, justifyContent: "center" }}>
      {[0, 1, 2, 3, 4].map((i) => {
        const k = entra(t, 23.7 + i * 0.09, 0.25);
        return (
          <div key={i} style={{ width: 130, borderRadius: 18, overflow: "hidden", background: "#fff", boxShadow: "0 10px 24px rgba(0,0,0,.5)", transform: `scale(${0.4 + 0.6 * k})`, opacity: k }}>
            <div style={{ background: VERMELHO, color: "#fff", fontWeight: 900, fontSize: 26, padding: "4px 0" }}>NOV</div>
            <div style={{ position: "relative", fontWeight: 900, fontSize: 70, color: "#1b1033", padding: "6px 0" }}>
              {19 + i}
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 90, color: VERDE }}>✓</div>
            </div>
          </div>
        );
      })}
    </div>
    <div style={{ marginTop: 18, opacity: entra(t, 24.0), transform: `scale(${0.5 + 0.5 * entra(t, 24.0)})` }}>
      <G tam={120}>5 DIAS 🏖️</G>
    </div>
  </Janela>
);

// ---------- o contrato do Exército ----------
const Exercito: React.FC<{ t: number }> = ({ t }) => {
  const miuda = suave(t, 31.6, 32.1);
  const assinou = entra(t, 33.62, 0.25);
  return (
    <Janela t={t} de={24.8} ate={34.66} topo={260}>
      <P cor={AMARELO}>🎖️ EXÉRCITO DOS EUA</P>
      <div style={{ position: "relative", margin: "18px auto 0", width: 780, padding: "26px 34px 34px", background: "#F4EFE4", color: "#1b1b1b", borderRadius: 8, boxShadow: "0 20px 50px rgba(0,0,0,.6)", transform: `rotate(1.2deg) scale(${0.6 + 0.4 * entra(t, 26.38)})`, opacity: entra(t, 26.38) }}>
        <div style={{ fontFamily: "Georgia, serif", fontWeight: 900, fontSize: 44, letterSpacing: 2, borderBottom: "3px solid #1b1b1b", paddingBottom: 8 }}>OFERTA DO BATALHÃO</div>
        <div style={{ fontWeight: 900, fontSize: 50, marginTop: 18, lineHeight: 1.1, opacity: entra(t, 27.36) }}>✅ 4 DIAS DE FOLGA<br />PRA JOGAR GTA 6</div>
        <div style={{ marginTop: 22, opacity: entra(t, 30.16), fontWeight: 800, fontSize: 22 + 30 * miuda, color: miuda > 0.5 ? VERMELHO : "#666", transition: "none" }}>*assine mais 2 anos de Exército</div>
        <div style={{ marginTop: 18, borderTop: "2px solid #1b1b1b", paddingTop: 8, fontWeight: 700, fontSize: 24, color: "#555", textAlign: "left" }}>assinatura:</div>
        <div style={{ position: "absolute", right: -16, bottom: -54, opacity: assinou, transform: `rotate(-10deg) scale(${2 - assinou})`, border: `8px solid ${VERDE}`, color: "#0d6b33", fontWeight: 900, fontSize: 56, padding: "4px 22px", borderRadius: 14, background: "rgba(244,239,228,.95)", whiteSpace: "nowrap" }}>✍️ 20 ASSINARAM</div>
      </div>
    </Janela>
  );
};

// ---------- o gráfico ----------
const Grafico: React.FC<{ t: number }> = ({ t }) => {
  const b1 = suave(t, 35.8, 36.4);
  const b2 = suave(t, 37.2, 37.9);
  const barra = (h: number, cor: string, nome: string, rot: string, k: number) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: 360 }}>
      <div style={{ fontWeight: 900, fontSize: 48, color: cor, opacity: k }}>{rot}</div>
      <div style={{ width: 190, height: h * k, background: cor, borderRadius: "16px 16px 0 0", boxShadow: `0 0 26px ${cor}` }} />
      <div style={{ fontWeight: 900, fontSize: 34, color: "#fff", marginTop: 10 }}>{nome}</div>
    </div>
  );
  return (
    <Janela t={t} de={34.72} ate={42.44} topo={260}>
      <P cor={AMARELO}>PEDIDOS DE FOLGA (EUA)</P>
      <div style={{ margin: "16px auto 0", width: 700, padding: "20px 0 16px", borderRadius: 26, background: "rgba(14,8,30,.85)", border: `4px solid ${ROXO}`, display: "flex", justifyContent: "center", gap: 70 }}>
        {barra(230, "#9AA3B5", "DIA NORMAL", "", b1)}
        {barra(260, ROXO, "DIA 19", "+13%", b2)}
      </div>
      <div style={{ marginTop: 22, opacity: entra(t, 39.58), display: "flex", justifyContent: "center", gap: 16 }}>
        {[0, 1, 2, 3, 4].map((i) => {
          const aceso = i === 2 && t > 40.38;
          return <div key={i} style={{ fontSize: 110, lineHeight: 1, filter: aceso ? "none" : "grayscale(1) brightness(.6)", transform: `scale(${aceso ? 1.15 : 1})` }}>{aceso ? "🏃" : "🧍"}</div>;
        })}
      </div>
      <div style={{ marginTop: 8, opacity: entra(t, 40.38), transform: `scale(${0.5 + 0.5 * entra(t, 40.38)})` }}>
        <G tam={96}>1 EM CADA 5</G>
        <P>QUER TIRAR O DIA</P>
      </div>
    </Janela>
  );
};

// ---------- manda pro chefe ----------
const Chefe: React.FC<{ t: number }> = ({ t }) => {
  const aperta = t > 45.28 && t < 45.5;
  const enviado = t > 45.5;
  return (
    <Janela t={t} de={42.48} ate={48.7} topo={300}>
      <div style={{ width: 640 }}>
      <P cor={AMARELO}>CHEFE NÃO LIBEROU?</P>
      <div style={{ margin: "18px auto 0", width: 470, padding: "26px 22px 30px", borderRadius: 54, background: "#0d0a18", border: "8px solid #2c2442", boxShadow: "0 20px 50px rgba(0,0,0,.6)", opacity: entra(t, 43.2), transform: `scale(${0.6 + 0.4 * entra(t, 43.2)})` }}>
        <div style={{ fontWeight: 800, fontSize: 26, color: "#9aa", textAlign: "left" }}>👔 Chefe</div>
        <div style={{ marginTop: 16, height: 240, borderRadius: 22, background: `linear-gradient(160deg, ${ROXO}, #2B0F66)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 120 }}>▶️</div>
        <div style={{ marginTop: 10, fontWeight: 800, fontSize: 26, color: "#ddd", textAlign: "left" }}>Fase 16 · Fase Extra</div>
        <div style={{ marginTop: 18, display: "inline-block", fontWeight: 900, fontSize: 38, color: "#fff", background: enviado ? VERDE : AZUL, borderRadius: 18, padding: "10px 26px", transform: `scale(${aperta ? 0.9 : 1})`, opacity: entra(t, 44.34) }}>{enviado ? "✓ ENVIADO" : "📲 ENVIAR PRO CHEFE"}</div>
      </div>
      <div style={{ marginTop: 22, opacity: entra(t, 47.56), transform: `rotate(-3deg) scale(${0.5 + 0.5 * entra(t, 47.56)})` }}>
        <G tam={84} cor={AMARELO}>PELO MENOS</G>
        <G tam={84} cor={AMARELO}>VOCÊ TENTOU 🤷</G>
      </div>
      </div>
    </Janela>
  );
};

// ---------- Vyce: facecam ----------
const boca = (f: number) => (dados.boca as number[])[f] ?? 0;
const pisca = (t: number) => {
  const c = t % 4.3;
  return c > 1.4 && c < 1.52;
};
const poseFala = (t: number, extra: Partial<PoseMascote> = {}): PoseMascote => ({
  bracoE: [0.02 - 0.15 * Math.max(0, Math.sin(t * 5.1)), 0, -0.12],
  cotoveloE: 0.4 + 0.2 * Math.sin(t * 4.3),
  bracoD: [-0.5 - 0.25 * Math.max(0, Math.sin(t * 3.7 + 1)), 0, 0.25],
  cotoveloD: 1.1 + 0.25 * Math.sin(t * 5.7),
  tronco: 0.02 * Math.sin(t * 1.9),
  cabeca: [0.04 * Math.sin(t * 3.1) + 0.03 * Math.sin(t * 7.2), 0.12 * Math.sin(t * 1.3), 0.04 * Math.sin(t * 1.1)],
  ...extra,
});
const REACOES = [14.4, 45.3];
const JANELAS: [number, number][] = [
  [14.24, 16.02], // e ela não é a única
  [42.48, 48.66], // manda pro chefe
];
const Facecam: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const k = JANELAS.reduce((m, [a, b]) => Math.max(m, entra(t, a, 0.3) * (1 - suave(t, b - 0.25, b))), 0);
  const reage = REACOES.reduce((m, r) => Math.max(m, 1 - Math.abs(t - r) * 1.6), 0);
  const W = 300;
  const H = 360;
  if (k <= 0.01) return null;
  return (
    <div style={{ position: "absolute", left: 1080 - W - 40, top: 250, width: W, height: H, borderRadius: 26, overflow: "hidden", border: `5px solid ${ROXO}`, boxShadow: `0 0 ${30 + 25 * Math.max(0, reage)}px ${ROXO}, 0 10px 30px rgba(0,0,0,.6)`, transform: `scale(${(0.5 + 0.5 * k) * (1 + 0.06 * Math.max(0, reage))})`, transformOrigin: "100% 0%", opacity: k, background: "#140a2a" }}>
      <ThreeCanvas width={W} height={H} camera={{ fov: 32, near: 0.05, far: 50 }} gl={{ toneMapping: THREE.ACESFilmicToneMapping, antialias: true }}>
        <Camera pos={[0.1 + 0.05 * Math.sin(t * 0.6), 1.68, 1.22]} alvo={[0, 1.57, 0]} />
        <hemisphereLight args={["#B9A2F2", "#1A1030", 0.9]} />
        <directionalLight position={[-1.2, 2.2, 2.4]} intensity={2.6} color="#F6EEFF" />
        <pointLight position={[1.2, 1.7, 0.6]} intensity={5} color={ROSA} distance={4} />
        <pointLight position={[-1.3, 1.4, 0.2]} intensity={5} color="#5B6CFF" distance={4} />
        <mesh position={[0, 1.4, -1.2]}>
          <planeGeometry args={[6, 4]} />
          <meshStandardMaterial color="#1B1035" />
        </mesh>
        <Mascote3D giro={-0.15 + 0.1 * Math.sin(t * 0.7)} pose={poseFala(t, reage > 0.3 ? { bracoD: [-1.7, 0, 0.3], cotoveloD: 1.5 } : {})} boca={boca(f)} pisca={pisca(t)} olhar={0.6} />
      </ThreeCanvas>
      <div style={{ position: "absolute", left: 12, top: 10, fontFamily, fontWeight: 900, fontSize: 20, letterSpacing: 3, color: "#fff", background: ROSA, padding: "3px 10px", borderRadius: 8 }}>● VYCE</div>
    </div>
  );
};

// ---------- Vyce no quarto gamer (final) + enquete ----------
const OPCOES: [string, string, number, string][] = [
  ["💼", "VOU TRABALHAR (CHORANDO)", 52.54, AZUL],
  ["🌴", "TÔ EM VICE CITY", 53.72, ROSA],
];
const Setup: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const a = INICIO_FINAL;
  if (t < a - 0.3) return null;
  const k = suave(t, a - 0.3, a + 0.2);
  const olha = suave(t, a + 0.25, a + 0.7);
  const pos: [number, number, number] = [0.45 - (t - a) * 0.06, 1.5, 3.6 - (t - a) * 0.1];
  const troca = suave(t, ENQUETE - 0.2, ENQUETE + 0.1);
  return (
    <AbsoluteFill style={{ opacity: k, transform: `scale(${1.2 - 0.2 * k})` }}>
      <Sequence from={Math.round(a * FPS) - 10} layout="none">
        <PalcoCinema ceu="estudio" fundo="#0B1016" fov={45} luzCeu={0.2} brilhoCeu={0.03}>
          <Camera pos={pos} alvo={[-0.5, 1.12, -0.15]} />
          <QuartoGamer t={t} boca={boca(f)} pisca={pisca(t)} olhaCamera={olha} />
          <Acabamento foco={Math.hypot(pos[0] + 0.2, pos[1] - 1.3, pos[2])} desfoque={4} brilho={0.8} saturacao={0.15} contraste={0.12} vinheta={0.45} ao={0} />
        </PalcoCinema>
      </Sequence>
      <div style={{ position: "absolute", top: 270, left: 60, right: 180, textAlign: "center", color: "#fff", fontFamily, transform: `scale(${0.8 + 0.2 * entra(t, a + 0.2)})`, opacity: entra(t, a + 0.2) * (1 - troca) }}>
        <div style={{ fontWeight: 800, fontSize: 38, letterSpacing: 8, color: "#E6D2FF", textShadow: sombra }}>VOCÊ ESTÁ NA</div>
        <div style={{ fontWeight: 900, fontSize: 112, lineHeight: 0.95, letterSpacing: -2, textShadow: sombra }}>FASE EXTRA</div>
        <div style={{ fontWeight: 800, fontSize: 40, letterSpacing: 8, marginTop: 8, textShadow: sombra, opacity: entra(t, a + 1.3) }}>COM VYCE</div>
      </div>
      <div style={{ position: "absolute", top: 240, left: 60, right: 180, textAlign: "center", fontFamily, opacity: troca }}>
        <div style={{ fontWeight: 800, fontSize: 34, letterSpacing: 5, color: "#E6D2FF", textShadow: sombra }}>E VOCÊ?</div>
        <div style={{ fontWeight: 900, fontSize: 84, lineHeight: 0.95, color: "#fff", textShadow: sombra }}>DIA 19</div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 12 }}>
          {OPCOES.map(([ic, nome, d, cor], i) => (
            <Chip key={i} t={t} de={d} cor={cor} tam={42}>
              <span style={{ color: "#111", background: cor, borderRadius: 10, padding: "0 12px" }}>{i + 1}</span>
              <span>{ic}</span>
              <span>{nome}</span>
            </Chip>
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", top: 1090, left: 60, right: 180, textAlign: "center", opacity: entra(t, a + 1.7) }}>
        <div style={{ display: "inline-block", fontFamily, fontWeight: 900, fontSize: 40, letterSpacing: 1, color: "#fff", background: "rgba(20,10,40,.7)", border: `3px solid ${ROSA}`, borderRadius: 16, padding: "6px 22px", boxShadow: `0 0 22px ${ROSA}`, transform: `scale(${0.7 + 0.3 * entra(t, a + 1.7)})` }}>
          @faseextra.br
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- legenda ----------
const DESTAQUE = /^(fechar|19|GTA|6|reabre|missão|sério|Califórnia|indisponível|inalcançável…|e\/ou|Vice|City|única|Logitech|folga|7|mil|Brasil|Pocketpair|Palworld|cinco|dias|Exército|batalhão|quatro|detalhe|dois|anos|Vinte|aceitaram|13%|normal|um|cinco|chefe|vídeo|tentou|Fase|Extra|Vyce|trabalhar|Comenta)$/i;
type Pal = { w: string; s: number; e: number };
const PAL = dados.palavras as Pal[];
const BLOCOS: Pal[][] = (() => {
  const b: Pal[][] = [];
  let c: Pal[] = [];
  PAL.forEach((p, i) => {
    c.push(p);
    const n = PAL[i + 1];
    if (c.length >= 3 || /[.,?!:]$/.test(p.w) || !n || n.s - p.e > 0.35) {
      b.push(c);
      c = [];
    }
  });
  return b;
})();
const Legenda: React.FC<{ t: number }> = ({ t }) => {
  const i = BLOCOS.findIndex((b, j) => t >= b[0].s - 0.05 && t < Math.min(BLOCOS[j + 1]?.[0].s ?? 999, b[b.length - 1].e + 0.6) - 0.05);
  if (i < 0) return null;
  return (
    <div style={{ position: "absolute", top: 1300, left: 60, right: 180, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 28px" }}>
      {BLOCOS[i].map((p, j) => {
        const ativo = t >= p.s;
        const dest = DESTAQUE.test(p.w.replace(/[.,?!:]$/g, ""));
        const pulo = ativo ? interpolate(t, [p.s, p.s + 0.1, p.s + 0.22], [0.75, 1.15, 1], cl) : 1;
        return (
          <span key={j} style={{ fontFamily, fontWeight: 900, fontSize: 74, lineHeight: 1.08, color: dest ? "#E2B8FF" : "#fff", opacity: ativo ? 1 : 0, transform: `scale(${pulo})`, display: "inline-block", WebkitTextStroke: "10px #000", paintOrder: "stroke fill", textShadow: dest ? "0 0 24px rgba(182,107,255,.95)" : "0 6px 10px rgba(0,0,0,.6)" }}>
            {p.w.replace(/[.,:!]$/, "")}
          </span>
        );
      })}
    </div>
  );
};

// ---------- sons ----------
const falando = (t: number) => PAL.some((p) => t >= p.s - 0.04 && t <= p.e + 0.04);
const IMPACTOS = [0.74, 13.2, 19.6, 23.7, 33.62, 37.46, 45.5];
const SONS: { s: string; t: number; v: number }[] = [
  { s: "dum", t: 0.0, v: 0.5 },
  { s: "carimbo", t: 0.74, v: 0.55 },
  { s: "whoosh", t: 3.96, v: 0.4 },
  { s: "whoosh", t: 6.48, v: 0.45 },
  { s: "carimbo", t: 13.2, v: 0.55 },
  { s: "whoosh", t: 14.22, v: 0.45 },
  { s: "whoosh", t: 16.04, v: 0.45 },
  { s: "dum", t: 19.6, v: 0.5 },
  { s: "whoosh", t: 21.04, v: 0.45 },
  { s: "carimbo", t: 23.7, v: 0.5 },
  { s: "whoosh", t: 24.78, v: 0.45 },
  { s: "carimbo", t: 33.62, v: 0.55 },
  { s: "whoosh", t: 34.7, v: 0.45 },
  { s: "dum", t: 37.46, v: 0.5 },
  { s: "whoosh", t: 42.46, v: 0.45 },
  { s: "carimbo", t: 45.5, v: 0.5 },
  { s: "whoosh", t: INICIO_FINAL - 0.1, v: 0.45 },
];

const DUCK: number[] = (() => {
  const bruto = Array.from({ length: DURACAO_FASE16 }, (_, i) => (falando(i / FPS) ? 0.42 : 1));
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

export const VideoFase16: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const corte = PLANOS.some((p) => p.de > 0 && t >= p.de && t < p.de + 2 / FPS) && !emSetup(t) ? 0.2 : 0;
  const flash = Math.min(0.8, IMPACTOS.reduce((m, a) => m + interpolate(t, [a, a + 0.04, a + 0.28], [0, a === 0 ? 0.35 : 0.45, 0], cl), 0));
  const tremor = IMPACTOS.reduce((m, a) => (t >= a ? Math.max(m, 1 - suave(t, a, a + 0.35)) : m), 0);
  const tx = Math.sin(t * 83) * 10 * tremor;
  const ty = Math.cos(t * 71) * 8 * tremor;
  const noFundo = !emSetup(t);
  const escurece = t > 6.5 && t < INICIO_FINAL ? 0.1 : 0;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ transform: `translate(${tx}px,${ty}px) scale(1.02)` }}>
        {noFundo && <Fundo t={t} />}
        {noFundo && <AbsoluteFill style={{ background: `rgba(8,4,20,${escurece})` }} />}
        {noFundo && <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,4,24,.5) 0%, rgba(10,4,24,.08) 22%, rgba(10,4,24,0) 50%, rgba(10,4,24,.12) 72%, rgba(10,4,24,.55) 100%)" }} />}
      </AbsoluteFill>
      <Setup t={t} f={f} />

      <Gancho t={t} />
      <Aviso t={t} />
      <NaoUnica t={t} />
      <Logitech t={t} />
      <Pocketpair t={t} />
      <Exercito t={t} />
      <Grafico t={t} />
      <Chefe t={t} />

      <Facecam t={t} f={f} />
      <Legenda t={t} />

      <AbsoluteFill style={{ background: "#F5E9FF", opacity: flash, pointerEvents: "none" }} />
      <AbsoluteFill style={{ background: "#000", opacity: corte, pointerEvents: "none" }} />

      <Audio src={staticFile("fase-extra/fase16/narracao.wav")} />
      <Audio src={staticFile("fase-extra/fase16/trilha.wav")} volume={(q) => 0.63 * (DUCK[q] ?? 1)} />
      {SONS.map((s, i) => (
        <Sequence key={i} from={Math.round(s.t * FPS)} durationInFrames={60}>
          <Audio src={staticFile(`fase-extra/sons/${s.s}.wav`)} volume={(q) => s.v * (falando(s.t + q / FPS) ? 0.3 : 1)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
