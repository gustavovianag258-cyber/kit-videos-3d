import { loadFont } from "@remotion/google-fonts/Montserrat";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { Acabamento, PalcoCinema } from "../../cinema/Palco";
import { Camera } from "../Estudio";
import { Mascote3D, PoseMascote } from "../Mascote3D";
import { QuartoGamer } from "../QuartoGamer";
import dados from "./dados.json";

// Fase Extra, Fase 11: "3 notícias ruins do GTA 6 (e uma boa)" (~85 s).
// 1) caixa física sem disco (só código, preso na conta); 2) 30 fps até no PS5 Pro (tira 30 x 60, gargalo no
// processador segundo análises); 3) sem online no lançamento (linha do tempo GTA 5 → Online 14 dias depois);
// virada boa: Xbox One pela nuvem (Xbox Cloud Gaming, gráfico de Series S, 19/11 às 3h de Brasília).
// Imagens: cenas do "Um Olhar Estendido" que nenhuma Fase usou + captura oficial de Jason e Lucia + grafismo nosso.
const { fontFamily } = loadFont("normal", { weights: ["600", "800", "900"], subsets: ["latin"] });
export const FPS = 30;
const FIM = dados.duracao + 1.0;
export const DURACAO_FASE11 = Math.ceil(FIM * FPS);
const ROXO = "#B66BFF";
const ROSA = "#FF4FD8";
const VERDE = "#4ADE80";
const VERMELHO = "#FF4D5E";
const AMARELO = "#FFD84A";
const LARANJA = "#FF8A3D";
const AZUL = "#7CC8FF";
const XBOX = "#3DDC4F";
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const suave = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
const entra = (t: number, a: number, d = 0.3) => interpolate(t, [a, a + d], [0, 1], { ...cl, easing: Easing.out(Easing.back(1.7)) });
const sombra = "0 0 26px rgba(182,107,255,.85), 0 5px 0 #2B0F66, 0 0 8px rgba(0,0,0,.9)";
const CAPA = "fase-extra/rockstar/capturas/People/Jason and Lucia/Jason_and_Lucia_03.jpg";

const INICIO_FINAL = 79.65; // "Você está na Fase Extra"
const emSetup = (t: number) => t >= INICIO_FINAL;
const CLIPE = (n: string) => `fase-extra/fase11/clipes/${n}.mp4`;

// ---------- planos (gameplay oficial, cenas que nenhuma Fase usou) ----------
type Plano = { de: number; clipe: string; src?: number; x?: number; x2?: number; zoom?: number; chicote?: boolean };
const PLANOS: Plano[] = [
  { de: 0.0, clipe: "aereo", src: 4.5, x: 0.5, x2: 0.45, zoom: 1.15 },
  { de: 3.96, clipe: "paraquedas", src: 1.5, x: 0.5, x2: 0.45, chicote: true },
  { de: 6.56, clipe: "paraquedas", src: 5.0, x: 0.45, x2: 0.55, zoom: 1.1 },
  { de: 8.13, clipe: "conversivel", src: 1.0, x: 0.5, x2: 0.42, chicote: true },
  // código
  { de: 10.2, clipe: "conversivel", src: 5.0, x: 0.45, x2: 0.55, zoom: 1.1 },
  { de: 13.55, clipe: "aereo", src: 0.5, x: 0.5, x2: 0.45, chicote: true },
  { de: 17.44, clipe: "casal", src: 1.0, x: 0.5, x2: 0.42, chicote: true },
  { de: 21.33, clipe: "casal", src: 3.5, x: 0.45, x2: 0.55, zoom: 1.1 },
  // ruim 2: 30 fps
  { de: 24.67, clipe: "corrida", src: 4.5, x: 0.5, x2: 0.45, chicote: true, zoom: 1.12 },
  { de: 29.22, clipe: "conversivel", src: 7.5, x: 0.45, x2: 0.55, chicote: true },
  { de: 32.44, clipe: "corrida", src: 6.5, x: 0.5, x2: 0.42, chicote: true },
  { de: 36.87, clipe: "corrida", src: 8.0, x: 0.45, x2: 0.55, zoom: 1.15 },
  { de: 41.49, clipe: "aereo", src: 6.5, x: 0.5, x2: 0.45, chicote: true },
  { de: 44.47, clipe: "sofa", src: 2.5, x: 0.45, x2: 0.55, zoom: 1.1 },
  { de: 46.91, clipe: "aereo", src: 2.5, x: 0.5, x2: 0.42, chicote: true },
  { de: 49.55, clipe: "conversivel", src: 9.5, x: 0.45, x2: 0.55, zoom: 1.12 },
  // ruim 3: sem online
  { de: 52.42, clipe: "ponte", src: 4.0, x: 0.5, x2: 0.45, chicote: true, zoom: 1.12 },
  { de: 55.62, clipe: "casal", src: 6.5, x: 0.5, x2: 0.5, zoom: 1.05, chicote: true },
  { de: 59.85, clipe: "sofa", src: 6.3, x: 0.45, x2: 0.55, chicote: true },
  { de: 64.16, clipe: "casal", src: 0.2, x: 0.5, x2: 0.42, zoom: 1.12 },
  // a notícia boa
  { de: 66.15, clipe: "paraquedas", src: 3.5, x: 0.5, x2: 0.45, chicote: true },
  { de: 67.55, clipe: "tv", src: 5.5, x: 0.5, x2: 0.45, chicote: true },
  { de: 71.07, clipe: "tv", src: 7.0, x: 0.45, x2: 0.55, zoom: 1.12 },
  { de: 74.22, clipe: "aereo", src: 7.0, x: 0.5, x2: 0.42, chicote: true },
  { de: 77.24, clipe: "paraquedas", src: 7.0, x: 0.45, x2: 0.55, zoom: 1.1 },
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
  return (
    <Sequence key={i} from={Math.round(p.de * FPS)} durationInFrames={dur} layout="none">
      <AbsoluteFill style={{ overflow: "hidden", filter: ch > 0.02 ? `blur(${10 * ch}px)` : undefined, transform: `translateX(${ch * 260}px)` }}>
        <OffthreadVideo src={staticFile(CLIPE(p.clipe))} startFrom={Math.round((p.src ?? 0) * FPS)} muted style={{ position: "absolute", width: 1080, height: 1920, left: 0, top: 0, filter: "brightness(1.08) contrast(1.05) saturate(1.15)", transform: `scale(${z})`, transformOrigin: `${x * 100}% 50%` }} />
      </AbsoluteFill>
    </Sequence>
  );
};

// ---------- peças comuns ----------
const Painel: React.FC<{ t: number; de: number; ate: number; topo?: number; cor: string; children: React.ReactNode; pad?: string }> = ({ t, de, ate, topo = 300, cor, children, pad = "22px 20px" }) => {
  if (t < de || t > ate) return null;
  const k = entra(t, de, 0.35);
  const sai = suave(t, ate - 0.2, ate);
  return (
    <div style={{ position: "absolute", top: topo, left: 60, right: 180, padding: pad, borderRadius: 28, background: "rgba(14,8,30,.88)", border: `4px solid ${cor}`, boxShadow: `0 0 34px ${cor}88`, textAlign: "center", fontFamily, color: "#fff", opacity: k * (1 - sai), transform: `scale(${0.7 + 0.3 * k})` }}>
      {children}
    </div>
  );
};
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
const Carimbo: React.FC<{ t: number; de: number; ate: number; texto: string; cor: string; topo?: number; tam?: number }> = ({ t, de, ate, texto, cor, topo = 1010, tam = 92 }) => {
  if (t < de || t > ate) return null;
  const k = interpolate(t, [de, de + 0.12], [0, 1], cl);
  const sai = suave(t, ate - 0.15, ate);
  return (
    <div style={{ position: "absolute", top: topo, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: 1 - sai }}>
      <div style={{ fontFamily, fontWeight: 900, fontSize: tam, color: cor, border: `10px solid ${cor}`, borderRadius: 18, padding: "4px 26px", transform: `rotate(-8deg) scale(${2.4 - 1.4 * k})`, opacity: k, background: "rgba(20,0,4,.6)", whiteSpace: "nowrap" }}>
        {texto}
      </div>
    </div>
  );
};
const Selo: React.FC<{ texto: string; cor: string; t: number; de: number }> = ({ texto, cor, t, de }) => {
  const k = entra(t, de, 0.25);
  return (
    <div style={{ display: "inline-block", marginTop: 16, transform: `scale(${0.6 + 0.4 * k}) rotate(${(1 - k) * -8}deg)`, opacity: k, fontFamily, fontWeight: 800, fontSize: 27, letterSpacing: 3, color: "#111", background: cor, padding: "6px 18px", borderRadius: 10, boxShadow: `0 0 24px ${cor}99`, whiteSpace: "nowrap" }}>
      {texto}
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
// tarja "NOTÍCIA RUIM N" que bate na tela
const Tarja: React.FC<{ t: number; de: number; ate: number; n: string }> = ({ t, de, ate, n }) => {
  if (t < de || t > ate) return null;
  const k = interpolate(t, [de, de + 0.15], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) });
  const sai = suave(t, ate - 0.15, ate);
  return (
    <div style={{ position: "absolute", top: 560, left: -40, right: -40, height: 260, background: VERMELHO, transform: `rotate(-5deg) scaleX(${k})`, opacity: 1 - sai, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 60px ${VERMELHO}`, fontFamily }}>
      <div style={{ textAlign: "center", color: "#fff" }}>
        <div style={{ fontWeight: 800, fontSize: 40, letterSpacing: 10 }}>NOTÍCIA RUIM</div>
        <div style={{ fontWeight: 900, fontSize: 150, lineHeight: 0.9, textShadow: "0 8px 0 #7A0014" }}>Nº {n}</div>
      </div>
    </div>
  );
};

// ---------- 1) a caixa que abre e não tem disco ----------
const Caixa: React.FC<{ t: number }> = ({ t }) => {
  const de = 0.0;
  const ate = 3.95;
  if (t > ate) return null;
  const k = entra(t, de, 0.4);
  const abre = suave(t, 1.6, 2.3);
  const sai = suave(t, ate - 0.2, ate);
  const W = 520;
  const H = 680;
  const giro = -8 + 6 * Math.sin(t * 1.4);
  return (
    <div style={{ position: "absolute", top: 360, left: 270 - 60, width: W + 120, height: H, perspective: 1600, opacity: k * (1 - sai), transform: `translateY(${(1 - k) * 300}px) scale(${1.15 + 0.08 * abre})` }}>
      <div style={{ position: "absolute", left: 60, top: 0, width: W, height: H, transformStyle: "preserve-3d", transform: `rotateY(${giro}deg) rotateX(4deg)` }}>
        {/* miolo da caixa: bandeja vazia + papel com o código */}
        <div style={{ position: "absolute", inset: 0, borderRadius: 18, background: "linear-gradient(160deg,#1a1630,#0c0a18)", border: "6px solid #2b2540", boxShadow: "inset 0 0 40px #000" }}>
          <div style={{ position: "absolute", left: W / 2 - 190, top: 120, width: 380, height: 380, borderRadius: "50%", border: "6px dashed rgba(255,255,255,.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 70, height: 70, borderRadius: "50%", border: "6px solid rgba(255,255,255,.2)" }} />
          </div>
          <div style={{ position: "absolute", left: 70, top: 470, width: W - 140, padding: "14px 16px", background: "#F4F1E8", borderRadius: 8, transform: `rotate(-4deg)`, boxShadow: "0 10px 20px rgba(0,0,0,.5)", fontFamily, textAlign: "center", color: "#222" }}>
            <div style={{ fontWeight: 800, fontSize: 20, letterSpacing: 3 }}>CÓDIGO DE DOWNLOAD</div>
            <div style={{ fontWeight: 900, fontSize: 34, letterSpacing: 2, marginTop: 4 }}>XXXX-XXXX-XXXX</div>
          </div>
        </div>
        {/* tampa com a capa (abre pra esquerda) */}
        <div style={{ position: "absolute", inset: 0, transformOrigin: "0% 50%", transform: `rotateY(${-150 * abre}deg)`, backfaceVisibility: "hidden", borderRadius: 18, overflow: "hidden", border: "6px solid #0E3B9C", boxShadow: "0 30px 60px rgba(0,0,0,.6)" }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 64, background: "#0E3B9C", display: "flex", alignItems: "center", paddingLeft: 20, fontFamily, fontWeight: 900, fontSize: 34, color: "#fff", letterSpacing: 2, zIndex: 2 }}>PS5</div>
          <Img src={staticFile("fase-extra/fase11/fotos/capa-arte.png")} style={{ position: "absolute", top: 64, left: 0, width: "100%", height: H - 64, objectFit: "cover", objectPosition: "50% 40%" }} />
        </div>
      </div>
    </div>
  );
};

// ---------- print da frase oficial da Rockstar ----------
const PrintRockstar: React.FC<{ t: number }> = ({ t }) => {
  const de = 10.3;
  const ate = 13.45;
  if (t < de || t > ate) return null;
  const k = entra(t, de, 0.35);
  const sai = suave(t, ate - 0.2, ate);
  const marca = suave(t, 11.6, 12.2);
  return (
    <div style={{ position: "absolute", top: 520, left: 70, right: 170, opacity: k * (1 - sai), transform: `scale(${0.7 + 0.3 * k}) rotate(${1.5 - 1.5 * k}deg)`, fontFamily }}>
      <div style={{ display: "inline-block", fontWeight: 800, fontSize: 24, letterSpacing: 3, color: "#111", background: AMARELO, padding: "4px 14px", borderRadius: 8, marginBottom: 8 }}>ROCKSTAR, OFICIAL</div>
      <div style={{ position: "relative", borderRadius: 18, overflow: "hidden", border: "4px solid #444", boxShadow: "0 20px 40px rgba(0,0,0,.6)" }}>
        <Img src={staticFile("fase-extra/fase11/fotos/tweet-caixa.jpg")} style={{ display: "block", width: "100%" }} />
        <div style={{ position: "absolute", left: "6%", top: "55%", height: "17%", width: `${78 * marca}%`, background: "rgba(255,216,74,.35)", borderBottom: `5px solid ${AMARELO}` }} />
      </div>
    </div>
  );
};

// ---------- código: baixa tudo, depois fica preso na conta ----------
const Codigo: React.FC<{ t: number }> = ({ t }) => {
  const de = 10.2;
  const ate = 24.6;
  if (t < de || t > ate) return null;
  const k = entra(t, de, 0.35);
  const sai = suave(t, ate - 0.2, ate);
  const barra = interpolate(t, [13.55, 16.6], [0, 1], { ...cl, easing: Easing.inOut(Easing.quad) });
  const gb = Math.round(212 * barra);
  const preso = suave(t, 19.5, 19.8);
  return (
    <div style={{ position: "absolute", top: 300, left: 60, right: 180, fontFamily, textAlign: "center", color: "#fff", opacity: k * (1 - sai), transform: `scale(${0.7 + 0.3 * k})` }}>
      <div style={{ position: "relative", margin: "0 auto", width: 700, padding: "20px 18px", background: preso > 0.5 ? "#4a4a55" : "#F4F1E8", borderRadius: 16, color: "#222", transform: `rotate(${-3 + 3 * preso}deg)`, boxShadow: "0 20px 40px rgba(0,0,0,.6)", filter: `grayscale(${preso})` }}>
        <div style={{ fontWeight: 800, fontSize: 28, letterSpacing: 4, color: preso > 0.5 ? "#ccc" : "#222" }}>CÓDIGO DE DOWNLOAD</div>
        <div style={{ fontWeight: 900, fontSize: 60, letterSpacing: 3, marginTop: 6, color: preso > 0.5 ? "#999" : "#111" }}>{"7KQ2-VX9M-L4TD".slice(0, Math.max(0, Math.floor((t - de) * 14)))}</div>
        {preso > 0.05 && (
          <div style={{ position: "absolute", left: 0, right: 0, top: 30, display: "flex", justifyContent: "center" }}>
            <div style={{ fontWeight: 900, fontSize: 64, color: VERMELHO, border: `8px solid ${VERMELHO}`, borderRadius: 14, padding: "0 18px", transform: `rotate(-10deg) scale(${2.2 - 1.2 * preso})`, opacity: preso, background: "rgba(255,255,255,.85)", whiteSpace: "nowrap" }}>JÁ RESGATADO</div>
          </div>
        )}
      </div>
      {/* barra de download */}
      <div style={{ opacity: entra(t, 13.4) * (1 - suave(t, 17.3, 17.6)), marginTop: 30 }}>
        <div style={{ margin: "0 auto", width: 700, height: 54, borderRadius: 27, background: "rgba(20,10,40,.85)", border: `4px solid ${AZUL}`, overflow: "hidden", position: "relative" }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${barra * 100}%`, background: `linear-gradient(90deg,${AZUL},${ROXO})` }} />
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 30, letterSpacing: 2 }}>⬇ BAIXANDO {gb} GB</div>
        </div>
        <div style={{ marginTop: 8 }}>
          <Chip t={t} de={15.07} cor={AMARELO}>200+ GB</Chip>
          <Chip t={t} de={16.51} cor={AZUL} tam={34}>IGUAL AO DIGITAL</Chip>
        </div>
      </div>
      {/* preso na conta */}
      <div style={{ opacity: entra(t, 19.8), marginTop: -40 }}>
        <G tam={96} cor={AMARELO}>🔒 PRESO NA SUA CONTA</G>
        <div>
          <Chip t={t} de={21.33} cor={VERMELHO} riscado>🤝 EMPRESTAR</Chip>
          <Chip t={t} de={22.33} cor={VERMELHO} riscado>💸 VENDER USADO</Chip>
        </div>
      </div>
    </div>
  );
};

// ---------- 2) medidor de FPS travado em 30 ----------
const Medidor: React.FC<{ t: number }> = ({ t }) => {
  const de = 25.96;
  const ate = 32.4;
  if (t < de || t > ate) return null;
  const k = entra(t, de, 0.35);
  const sai = suave(t, ate - 0.2, ate);
  const sobe = interpolate(t, [26.2, 27.38], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) });
  const tenta = t > 27.6 ? Math.max(0, Math.sin((t - 27.6) * 9)) * 0.06 * (1 - suave(t, 28.2, 28.8)) : 0;
  const v = 30 * sobe + 60 * tenta * (sobe > 0.99 ? 1 : 0);
  const ang = -90 + 180 * (v / 60);
  const trava = suave(t, 28.6, 28.8);
  return (
    <div style={{ position: "absolute", top: 290, left: 60, right: 180, display: "flex", flexDirection: "column", alignItems: "center", fontFamily, color: "#fff", opacity: k * (1 - sai), transform: `scale(${0.7 + 0.3 * k})` }}>
      <div style={{ position: "relative", width: 600, height: 330, borderRadius: "300px 300px 30px 30px", background: "rgba(14,8,30,.88)", border: `5px solid ${LARANJA}`, boxShadow: `0 0 30px ${LARANJA}`, overflow: "hidden" }}>
        {Array.from({ length: 13 }, (_, i) => {
          const a = -90 + i * 15;
          return <div key={i} style={{ position: "absolute", left: 297, bottom: 40, width: 6, height: i % 2 === 0 ? 270 : 255, transformOrigin: "50% 100%", transform: `rotate(${a}deg)` }}><div style={{ width: 6, height: i % 2 === 0 ? 30 : 16, background: i === 6 ? AMARELO : "rgba(255,255,255,.5)" }} /></div>;
        })}
        <div style={{ position: "absolute", left: 40, bottom: 34, fontWeight: 900, fontSize: 36, color: "#aaa" }}>0</div>
        <div style={{ position: "absolute", left: 278, top: 64, fontWeight: 900, fontSize: 36, color: AMARELO }}>30</div>
        <div style={{ position: "absolute", right: 30, bottom: 34, fontWeight: 900, fontSize: 36, color: VERDE }}>60</div>
        <div style={{ position: "absolute", left: 296, bottom: 40, width: 8, height: 230, background: "#fff", borderRadius: 4, transformOrigin: "50% 100%", transform: `rotate(${ang}deg)`, boxShadow: "0 0 12px #fff" }} />
        <div style={{ position: "absolute", left: 280, bottom: 24, width: 40, height: 40, borderRadius: "50%", background: LARANJA }} />
      </div>
      <div style={{ marginTop: 18, fontWeight: 900, fontSize: 110, lineHeight: 1, color: AMARELO, textShadow: sombra }}>{Math.round(v)} FPS</div>
      <div style={{ fontWeight: 900, fontSize: 40, letterSpacing: 4, color: VERMELHO, textShadow: sombra, opacity: trava, transform: `scale(${1.6 - 0.6 * trava})` }}>🔒 TRAVADO</div>
      <div>
        <Chip t={t} de={29.33} cor={AZUL} tam={34}>PS5 = 30</Chip>
        <Chip t={t} de={30.2} cor={XBOX} tam={34}>XBOX SERIES = 30</Chip>
        <Chip t={t} de={31.51} cor={AMARELO} tam={38}>PS5 PRO = 30 😬</Chip>
      </div>
    </div>
  );
};

// ---------- 30 x 60: tira de quadros em 1/10 de segundo ----------
const Tira: React.FC<{ t: number; de: number; n: number; cor: string; rotulo: string; ms: string; deMs: number; fim: string; deFim: number }> = ({ t, de, n, cor, rotulo, ms, deMs, fim, deFim }) => {
  const k = entra(t, de, 0.3);
  const W = 800;
  return (
    <div style={{ opacity: k, transform: `translateX(${(1 - k) * -200}px)`, marginTop: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", width: W, margin: "0 auto" }}>
        <div style={{ fontWeight: 900, fontSize: 52, color: cor, textShadow: sombra }}>{rotulo}</div>
        <div style={{ fontWeight: 900, fontSize: 34, color: "#fff", textShadow: sombra, opacity: entra(t, deMs) }}>1 imagem a cada {ms}</div>
      </div>
      {/* pista: cada carro é uma imagem que aparece na tela; a 30 ele "pula" mais longe entre uma e outra */}
      <div style={{ position: "relative", width: W, height: 130, margin: "8px auto 0", borderRadius: 18, background: "rgba(14,8,30,.9)", border: `4px solid ${cor}`, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 20, right: 20, top: 92, height: 6, background: "rgba(255,255,255,.25)" }} />
        {Array.from({ length: n }, (_, i) => {
          const q = entra(t, de + 0.15 * i, 0.15);
          const x = 30 + (i / (n - 1)) * (W - 120);
          return (
            <div key={i} style={{ position: "absolute", left: x, top: 18, opacity: q * (i === n - 1 ? 1 : 0.45), transform: "scaleX(-1)" }}>
              <div style={{ fontSize: 64, lineHeight: 1 }}>🚗</div>
              <div style={{ position: "absolute", left: 28, top: 82, width: 6, height: 22, background: cor }} />
            </div>
          );
        })}
      </div>
      <div style={{ fontWeight: 900, fontSize: 44, color: cor, textShadow: sombra, marginTop: 6, opacity: entra(t, deFim), transform: `scale(${0.6 + 0.4 * entra(t, deFim)})` }}>{fim}</div>
    </div>
  );
};
const TrintaSessenta: React.FC<{ t: number }> = ({ t }) => {
  const de = 32.44;
  const ate = 41.4;
  if (t < de || t > ate) return null;
  const sai = suave(t, ate - 0.2, ate);
  return (
    <div style={{ position: "absolute", top: 250, left: 0, right: 0, fontFamily, textAlign: "center", opacity: 1 - sai }}>
      <div style={{ fontWeight: 800, fontSize: 34, letterSpacing: 5, color: "#F3E8FF", textShadow: sombra, opacity: entra(t, de) }}>O MESMO 1/10 DE SEGUNDO</div>
      <Tira t={t} de={33.42} n={3} cor={LARANJA} rotulo="30 FPS" ms="33 ms" deMs={35.25} fim="TRAVADINHO NA CURVA" deFim={40.2} />
      <Tira t={t} de={36.87} n={6} cor={VERDE} rotulo="60 FPS" ms="16,7 ms" deMs={37.69} fim="SUAVE" deFim={39.4} />
    </div>
  );
};

// ---------- o que o PS5 Pro ganha (e o que não ganha) ----------
const Pro: React.FC<{ t: number }> = ({ t }) => (
  <Painel t={t} de={41.5} ate={46.85} topo={300} cor={AZUL}>
    <G tam={110} cor={AZUL}>PS5 PRO</G>
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Chip t={t} de={42.07} cor={VERDE}>✓ IMAGEM MAIS NÍTIDA</Chip>
      <Chip t={t} de={43.22} cor={VERDE}>✓ SOMBRA COM RAY TRACING</Chip>
      <Chip t={t} de={44.6} cor={VERMELHO} tam={48}>FLUIDEZ = PS5 NORMAL</Chip>
    </div>
  </Painel>
);

// ---------- gargalo: processador ----------
const Barra: React.FC<{ t: number; de: number; rotulo: string; antes: number; depois: number; deSobe: number; cor: string; ic: string }> = ({ t, de, rotulo, antes, depois, deSobe, cor, ic }) => {
  const q = entra(t, de, 0.3);
  const v = interpolate(t, [deSobe, deSobe + 0.6], [antes, depois], { ...cl, easing: Easing.out(Easing.cubic) });
  return (
    <div style={{ opacity: q, marginTop: 16, textAlign: "left" }}>
      <div style={{ fontWeight: 900, fontSize: 40, color: "#fff" }}>{ic} {rotulo}</div>
      <div style={{ position: "relative", height: 48, borderRadius: 24, background: "rgba(255,255,255,.1)", marginTop: 6, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${v * 100}%`, background: cor, borderRadius: 24, boxShadow: `0 0 20px ${cor}` }} />
      </div>
    </div>
  );
};
const Gargalo: React.FC<{ t: number }> = ({ t }) => {
  const pisca = t > 48.64 && t < 52.3 && Math.sin(t * 14) > 0;
  return (
    <Painel t={t} de={46.95} ate={52.35} topo={300} cor={pisca ? VERMELHO : ROXO} pad="22px 34px">
      <div style={{ fontWeight: 800, fontSize: 30, letterSpacing: 4, color: "#ccc" }}>PS5 → PS5 PRO</div>
      <Barra t={t} de={47.4} rotulo="PLACA DE VÍDEO" antes={0.45} depois={0.85} deSobe={50.22} cor={VERDE} ic="🟩" />
      <Barra t={t} de={48.5} rotulo="PROCESSADOR" antes={0.45} depois={0.48} deSobe={51.16} cor={pisca ? VERMELHO : LARANJA} ic="🧠" />
      <div style={{ marginTop: 14, fontWeight: 900, fontSize: 56, color: VERMELHO, opacity: entra(t, 48.64), transform: `scale(${0.6 + 0.4 * entra(t, 48.64)})` }}>GARGALO</div>
      <Selo texto="SEGUNDO ANÁLISES" cor={AMARELO} t={t} de={47.2} />
    </Painel>
  );
};

// ---------- 3) sem online ----------
const SemOnline: React.FC<{ t: number }> = ({ t }) => {
  const de = 53.55;
  const ate = 59.8;
  if (t < de || t > ate) return null;
  const k = entra(t, de, 0.35);
  const sai = suave(t, ate - 0.2, ate);
  const x = suave(t, 54.91, 55.15);
  const foto = entra(t, 55.62, 0.35);
  return (
    <div style={{ position: "absolute", top: 260, left: 60, right: 180, textAlign: "center", fontFamily, color: "#fff", opacity: k * (1 - sai) }}>
      <div style={{ position: "relative", display: "inline-block", fontSize: 150, lineHeight: 1 }}>
        🌐
        <div style={{ position: "absolute", left: "50%", top: "50%", width: 220 * x, height: 22, background: VERMELHO, borderRadius: 11, transform: "translate(-50%,-50%) rotate(45deg)", boxShadow: `0 0 16px ${VERMELHO}` }} />
        <div style={{ position: "absolute", left: "50%", top: "50%", width: 220 * x, height: 22, background: VERMELHO, borderRadius: 11, transform: "translate(-50%,-50%) rotate(-45deg)", boxShadow: `0 0 16px ${VERMELHO}` }} />
      </div>
      <G tam={110}>SEM ONLINE</G>
      <P>NO DIA 19</P>
      <div style={{ margin: "18px auto 0", width: 620, height: 349, borderRadius: 22, overflow: "hidden", border: `5px solid ${ROSA}`, boxShadow: `0 0 30px ${ROSA}`, opacity: foto, transform: `scale(${0.6 + 0.4 * foto}) rotate(${(1 - foto) * 6}deg)` }}>
        <Img src={staticFile(CAPA)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${1.05 + 0.04 * (t - 55.6)})` }} />
      </div>
      <div style={{ marginTop: -26 }}>
        <Chip t={t} de={56.45} cor={ROSA}>SÓ A HISTÓRIA</Chip>
      </div>
    </div>
  );
};
// linha do tempo: GTA 5 (2013) x GTA 6 (2026)
const Marco: React.FC<{ t: number; de: number; titulo: string; data: string; cor: string }> = ({ t, de, titulo, data, cor }) => {
  const q = entra(t, de, 0.3);
  return (
    <div style={{ width: 300, textAlign: "center", opacity: q, transform: `scale(${0.5 + 0.5 * q})` }}>
      <div style={{ margin: "0 auto", width: 34, height: 34, borderRadius: "50%", background: cor, boxShadow: `0 0 20px ${cor}` }} />
      <div style={{ fontWeight: 900, fontSize: 40, color: "#fff", marginTop: 8, whiteSpace: "nowrap" }}>{titulo}</div>
      <div style={{ fontWeight: 800, fontSize: 32, color: cor }}>{data}</div>
    </div>
  );
};
const Linha: React.FC<{ t: number; de: number; ano: string; a: [string, string]; b: [string, string]; deA: number; deB: number; meio: string; deMeio: number; cor: string; tracejada?: boolean }> = ({ t, de, ano, a, b, deA, deB, meio, deMeio, cor, tracejada }) => {
  const q = entra(t, de, 0.3);
  const corre = suave(t, deA + 0.2, deB);
  return (
    <div style={{ opacity: q, marginTop: 24 }}>
      <div style={{ fontWeight: 900, fontSize: 44, color: cor, textShadow: sombra }}>{ano}</div>
      <div style={{ position: "relative", display: "flex", justifyContent: "space-between", width: 760, margin: "10px auto 0" }}>
        <div style={{ position: "absolute", left: 150, top: 14, width: 460 * corre, height: 6, background: tracejada ? `repeating-linear-gradient(90deg, ${cor} 0 18px, transparent 18px 30px)` : cor }} />
        <Marco t={t} de={deA} titulo={a[0]} data={a[1]} cor={cor} />
        <Marco t={t} de={deB} titulo={b[0]} data={b[1]} cor={tracejada ? VERMELHO : cor} />
        <div style={{ position: "absolute", left: 0, right: 0, top: -10, textAlign: "center", fontWeight: 900, fontSize: 38, color: AMARELO, textShadow: sombra, opacity: entra(t, deMeio), transform: `scale(${0.6 + 0.4 * entra(t, deMeio)})` }}>{meio}</div>
      </div>
    </div>
  );
};
const LinhaDoTempo: React.FC<{ t: number }> = ({ t }) => (
  <Painel t={t} de={59.9} ate={66.1} topo={290} cor={AMARELO}>
    <Linha t={t} de={59.9} ano="2013" a={["GTA 5", "17/09"]} b={["ONLINE", "01/10"]} deA={59.95} deB={62.25} meio="+14 DIAS" deMeio={63.24} cor={AZUL} />
    <Linha t={t} de={64.16} ano="2026" a={["GTA 6", "19/11"]} b={["ONLINE", "???"]} deA={64.3} deB={65.27} meio="SEM DATA" deMeio={65.5} cor={ROSA} tracejada />
  </Painel>
);

// ---------- a notícia boa: Xbox One pela nuvem ----------
const Nuvem: React.FC<{ t: number }> = ({ t }) => {
  const de = 67.55;
  const ate = 74.15;
  if (t < de || t > ate) return null;
  const k = entra(t, de, 0.35);
  const sai = suave(t, ate - 0.2, ate);
  const liga = suave(t, 68.4, 68.7);
  const fluxo = t > 71.0 ? ((t - 71.0) * 1.6) % 1 : -1;
  return (
    <div style={{ position: "absolute", top: 270, left: 60, right: 180, textAlign: "center", fontFamily, color: "#fff", opacity: k * (1 - sai), transform: `scale(${0.7 + 0.3 * k})` }}>
      <div style={{ position: "relative", height: 210, opacity: entra(t, 71.07) }}>
        <div style={{ fontSize: 170, lineHeight: 1 }}>☁️</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 120, fontWeight: 900, fontSize: 34, color: XBOX, textShadow: sombra }}>XBOX CLOUD GAMING</div>
        {fluxo >= 0 && [0, 0.33, 0.66].map((o, i) => {
          const p = (fluxo + o) % 1;
          return <div key={i} style={{ position: "absolute", left: "50%", top: 170 + p * 150, width: 18, height: 18, borderRadius: "50%", background: XBOX, transform: "translateX(-50%)", opacity: 1 - p, boxShadow: `0 0 14px ${XBOX}` }} />;
        })}
      </div>
      {/* Xbox One (o console antigo) */}
      <div style={{ margin: "120px auto 0", width: 560, height: 150, borderRadius: 18, background: "linear-gradient(180deg,#1b1b1b,#0a0a0a)", border: "4px solid #333", position: "relative", boxShadow: `0 0 ${40 * liga}px ${XBOX}` }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: "45%", height: "100%", background: "repeating-linear-gradient(90deg,#222 0 6px,#111 6px 12px)", borderRadius: "14px 0 0 14px" }} />
        <div style={{ position: "absolute", right: 30, top: 54, width: 40, height: 40, borderRadius: "50%", background: liga > 0.5 ? "#fff" : "#444", boxShadow: liga > 0.5 ? "0 0 20px #fff" : "none" }} />
        <div style={{ position: "absolute", right: 90, top: 50, fontWeight: 900, fontSize: 34, color: "#ddd" }}>XBOX ONE</div>
      </div>
      <div>
        <Chip t={t} de={68.45} cor={XBOX} tam={52}>✓ DÁ PRA JOGAR</Chip>
      </div>
      <Selo texto="COM O GRÁFICO DO XBOX SERIES S" cor={XBOX} t={t} de={72.64} />
    </div>
  );
};
const Relogio: React.FC<{ t: number }> = ({ t }) => {
  const de = 74.22;
  const ate = INICIO_FINAL - 0.05;
  if (t < de || t > ate) return null;
  const k = entra(t, de, 0.35);
  const sai = suave(t, ate - 0.2, ate);
  const pisca = Math.floor(t * 2) % 2 === 0;
  return (
    <div style={{ position: "absolute", top: 290, left: 60, right: 180, textAlign: "center", fontFamily, color: "#fff", opacity: k * (1 - sai), transform: `scale(${0.7 + 0.3 * k})` }}>
      <div style={{ fontWeight: 800, fontSize: 40, letterSpacing: 6, color: "#E6D2FF", textShadow: sombra, opacity: entra(t, 74.62) }}>19/11 · BRASÍLIA</div>
      <div style={{ display: "inline-block", marginTop: 10, padding: "6px 40px", borderRadius: 24, background: "rgba(5,5,12,.9)", border: `5px solid ${XBOX}`, boxShadow: `0 0 34px ${XBOX}`, fontWeight: 900, fontSize: 170, lineHeight: 1.05, color: XBOX, fontVariantNumeric: "tabular-nums", opacity: entra(t, 75.4) }}>
        03{pisca ? ":" : " "}00
      </div>
      <div style={{ marginTop: 8 }}>
        <Chip t={t} de={77.24} cor={XBOX}>✓ SÓ NO CONSOLE</Chip>
        <Chip t={t} de={77.87} cor={VERMELHO} riscado>💻 PC NA NUVEM</Chip>
      </div>
    </div>
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
const REACOES = [4.1, 8.2, 66.3];
const JANELAS: [number, number][] = [
  [3.96, 10.15], // primeira notícia ruim / tem mais duas / uma boa / fica até o final
  [66.1, 67.55], // re-gancho: agora, a notícia boa
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
const ENQUETE = 81.89;
const OPCOES: [string, string, number, string][] = [
  ["📦", "SEM DISCO", 82.31, LARANJA],
  ["🐢", "30 FPS", 82.6, AMARELO],
  ["🌐", "SEM ONLINE", 82.9, ROSA],
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
        <div style={{ fontWeight: 800, fontSize: 36, letterSpacing: 6, color: "#E6D2FF", textShadow: sombra }}>QUAL DESSAS</div>
        <div style={{ fontWeight: 900, fontSize: 92, lineHeight: 0.95, color: "#fff", textShadow: sombra }}>TE PEGOU?</div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 12 }}>
          {OPCOES.map(([ic, nome, d, cor], i) => (
            <Chip key={i} t={t} de={d} cor={cor} tam={44}>
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
const DESTAQUE = /^(GTA|6|5|caixa|disco|ruim|duas|boa|final|código|loja|inteiro|duzentos|gigas|digital|pior|preso|conta|Emprestar|amigo|vender|usado|dois|Rockstar|trinta|quadros|segundo|PS5|Pro|Xbox|Series|três|milésimos|sessenta|metade|suave|travadinho|curva|nítida|ray|tracing|fluidez|mesma|processador|gargalo|vídeo|Três|dezenove|online|história|Jason|Lucia|data|semanas|tem|One|jogar|nuvem|Cloud|Gaming|S|manhã|Brasília|console|PC|não|Fase|Extra|Vyce|surpresa|Comenta)$/i;
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
    <div style={{ position: "absolute", top: 1240, left: 60, right: 180, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 18px" }}>
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
const IMPACTOS = [0, 2.96, 19.55, 24.67, 27.38, 52.42, 54.91, 66.15, 68.45];
const SONS: { s: string; t: number; v: number }[] = [
  { s: "dum", t: 0.0, v: 0.6 },
  { s: "whoosh", t: 1.6, v: 0.4 },
  { s: "carimbo", t: 2.96, v: 0.6 },
  { s: "whoosh", t: 3.94, v: 0.4 },
  { s: "whoosh", t: 10.18, v: 0.45 },
  { s: "whoosh", t: 13.53, v: 0.4 },
  { s: "carimbo", t: 19.55, v: 0.6 },
  { s: "dum", t: 24.67, v: 0.6 },
  { s: "dum", t: 27.38, v: 0.5 },
  { s: "whoosh", t: 32.42, v: 0.45 },
  { s: "whoosh", t: 36.85, v: 0.4 },
  { s: "whoosh", t: 41.47, v: 0.45 },
  { s: "whoosh", t: 46.89, v: 0.45 },
  { s: "dum", t: 52.42, v: 0.6 },
  { s: "carimbo", t: 54.91, v: 0.55 },
  { s: "whoosh", t: 59.83, v: 0.45 },
  { s: "dum", t: 66.15, v: 0.6 },
  { s: "carimbo", t: 68.45, v: 0.5 },
  { s: "whoosh", t: 74.2, v: 0.45 },
  { s: "whoosh", t: INICIO_FINAL - 0.1, v: 0.45 },
];

const DUCK: number[] = (() => {
  const bruto = Array.from({ length: DURACAO_FASE11 }, (_, i) => (falando(i / FPS) ? 0.42 : 1));
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

export const VideoFase11: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const corte = PLANOS.some((p) => p.de > 0 && t >= p.de && t < p.de + 2 / FPS) && !emSetup(t) ? 0.2 : 0;
  const flash = Math.min(0.8, IMPACTOS.reduce((m, a) => m + interpolate(t, [a, a + 0.04, a + 0.28], [0, a === 0 ? 0.35 : 0.45, 0], cl), 0));
  const tremor = IMPACTOS.reduce((m, a) => (t >= a ? Math.max(m, 1 - suave(t, a, a + 0.35)) : m), 0);
  const tx = Math.sin(t * 83) * 10 * tremor;
  const ty = Math.cos(t * 71) * 8 * tremor;
  const noFundo = !emSetup(t);
  const escurece = t < 3.95 || (t > 10.2 && t < 24.6) || (t > 25.96 && t < 52.35) || (t > 53.55 && t < 66.1) || (t > 67.55 && t < INICIO_FINAL) ? 0.22 : 0;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ transform: `translate(${tx}px,${ty}px) scale(1.02)` }}>
        {noFundo && <Fundo t={t} />}
        {noFundo && <AbsoluteFill style={{ background: `rgba(8,4,20,${escurece})` }} />}
        {noFundo && <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,4,24,.5) 0%, rgba(10,4,24,.08) 22%, rgba(10,4,24,0) 50%, rgba(10,4,24,.12) 72%, rgba(10,4,24,.55) 100%)" }} />}
      </AbsoluteFill>
      <Setup t={t} f={f} />

      {/* gancho: a caixa sem disco */}
      <Bloco t={t} de={0.05} ate={3.92} gancho topo={190}>
        <P>COMPROU EM CAIXA?</P>
      </Bloco>
      <Caixa t={t} />
      <Carimbo t={t} de={2.96} ate={3.92} texto="SEM DISCO" cor={VERMELHO} topo={620} tam={110} />
      {/* 3 ruins + 1 boa */}
      <Bloco t={t} de={3.98} ate={10.15}>
        <P>NOTÍCIAS DO GTA 6</P>
        <G tam={140} cor={VERMELHO}>3 RUINS</G>
        <div style={{ opacity: entra(t, 7.49) }}>
          <G tam={140} cor={VERDE}>+ 1 BOA</G>
        </div>
        <Selo texto="FICA ATÉ O FINAL" cor={AMARELO} t={t} de={9.25} />
      </Bloco>
      <Codigo t={t} />
      <PrintRockstar t={t} />
      <Tarja t={t} de={24.67} ate={25.95} n="2" />
      <Medidor t={t} />
      <TrintaSessenta t={t} />
      <Pro t={t} />
      <Gargalo t={t} />
      <Tarja t={t} de={52.42} ate={53.52} n="3" />
      <SemOnline t={t} />
      <LinhaDoTempo t={t} />
      {/* re-gancho */}
      <Bloco t={t} de={66.15} ate={67.52} gancho>
        <P>AGORA, A</P>
        <G tam={140} cor={VERDE}>NOTÍCIA BOA</G>
      </Bloco>
      <Nuvem t={t} />
      <Relogio t={t} />

      <Facecam t={t} f={f} />
      <Legenda t={t} />

      <AbsoluteFill style={{ background: "#F5E9FF", opacity: flash, pointerEvents: "none" }} />
      <AbsoluteFill style={{ background: "#000", opacity: corte, pointerEvents: "none" }} />

      <Audio src={staticFile("fase-extra/fase11/narracao.wav")} />
      <Audio src={staticFile("fase-extra/fase11/trilha.wav")} volume={(q) => 0.63 * (DUCK[q] ?? 1)} />
      {SONS.map((s, i) => (
        <Sequence key={i} from={Math.round(s.t * FPS)} durationInFrames={60}>
          <Audio src={staticFile(`fase-extra/sons/${s.s}.wav`)} volume={(q) => s.v * (falando(s.t + q / FPS) ? 0.3 : 1)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
