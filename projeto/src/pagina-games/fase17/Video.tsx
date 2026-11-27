import { loadFont } from "@remotion/google-fonts/Montserrat";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { Acabamento, PalcoCinema } from "../../cinema/Palco";
import { Camera } from "../Estudio";
import { Mascote3D, PoseMascote } from "../Mascote3D";
import { QuartoGamer } from "../QuartoGamer";
import dados from "./dados.json";

// Fase Extra, Fase 17: "O GTA 6 já saiu. Só que na Nova Zelândia" (~65 s).
// Lançamento escalonado: meia-noite do dia 19 em Auckland = 8h de Brasília, streamers brasileiros jogando de manhã,
// o truque da Nova Zelândia (Xbox x PS5), a primeira hora sem spoiler e a revelação que não contamos. Só imagem oficial.
const { fontFamily } = loadFont("normal", { weights: ["600", "800", "900"], subsets: ["latin"] });
export const FPS = 30;
const FIM = dados.duracao + 1.0;
export const DURACAO_FASE17 = Math.ceil(FIM * FPS);
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

const INICIO_FINAL = 57.96; // "Você está na Fase Extra"
const ENQUETE = 60.7;
const emSetup = (t: number) => t >= INICIO_FINAL;
const CLIPE = (n: string) => `fase-extra/fase17/clipes/${n}.mp4`;

// ---------- planos: vídeo (clipe) ou foto desfocada de fundo ----------
type Plano = { de: number; clipe?: string; foto?: string; src?: number; x?: number; x2?: number; zoom?: number; chicote?: boolean };
const PLANOS: Plano[] = [
  { de: 0.0, clipe: "skyline", src: 0, x: 0.5, x2: 0.45, zoom: 1.1 },
  // os relógios
  { de: 3.28, clipe: "jato", src: 0, x: 0.45, x2: 0.55, chicote: true },
  { de: 6.1, clipe: "neon", src: 0, x: 0.5, x2: 0.45, chicote: true },
  { de: 9.92, clipe: "skyline", src: 1.5, x: 0.5, x2: 0.5, zoom: 1.2 },
  // a meia-noite no mundo
  { de: 10.94, clipe: "mapa", src: 0, x: 0.5, x2: 0.45, chicote: true },
  { de: 13.66, clipe: "mapa", src: 2.2, x: 0.45, x2: 0.55, zoom: 1.2 },
  // streamers
  { de: 16.38, clipe: "tv", src: 0, x: 0.5, x2: 0.45, chicote: true },
  { de: 19.5, clipe: "tv", src: 3.0, x: 0.55, x2: 0.45, zoom: 1.15 },
  { de: 21.56, clipe: "terraco2", src: 0, x: 0.5, x2: 0.45, chicote: true },
  // o truque
  { de: 24.36, clipe: "terraco2", src: 3.0, x: 0.45, x2: 0.55, chicote: true },
  { de: 26.9, clipe: "barco", src: 0, x: 0.5, x2: 0.45 },
  { de: 28.52, clipe: "jato", src: 2.3, x: 0.5, x2: 0.45, chicote: true },
  { de: 31.1, clipe: "neon", src: 2.5, x: 0.45, x2: 0.55 },
  // primeira hora
  { de: 34.34, clipe: "corredor", src: 0, x: 0.5, x2: 0.45, chicote: true },
  { de: 37.78, clipe: "conversivel", src: 0, x: 0.5, x2: 0.45, chicote: true },
  { de: 40.3, clipe: "explosao", src: 0, x: 0.45, x2: 0.5, chicote: true },
  { de: 42.8, clipe: "barco", src: 0, x: 0.5, x2: 0.45, chicote: true },
  { de: 44.8, clipe: "conversivel", src: 4.0, x: 0.5, x2: 0.45 },
  // a revelação
  { de: 46.68, clipe: "casal", src: 0, x: 0.5, x2: 0.5, chicote: true },
  { de: 49.8, clipe: "carro1", src: 0.4, x: 0.5, x2: 0.5, chicote: true },
  { de: 52.18, clipe: "carro2", src: 0.3, x: 0.5, x2: 0.5, chicote: true },
  // Brasil x NZ
  { de: 53.44, clipe: "skyline", src: 0, x: 0.5, x2: 0.45, chicote: true, zoom: 1.2 },
  { de: 55.48, clipe: "neon", src: 2.0, x: 0.5, x2: 0.45, chicote: true },
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
        {p.clipe && <OffthreadVideo src={staticFile(CLIPE(p.clipe))} startFrom={Math.round((p.src ?? 0) * FPS)} muted style={{ ...cheia, filter: `brightness(${["skyline", "neon", "tv", "carro1", "carro2"].includes(p.clipe) ? 1.38 : 1.16}) contrast(1.05) saturate(1.15)` }} />}
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
const G: React.FC<{ tam: number; children: React.ReactNode; cor?: string }> = ({ tam, children, cor = "#fff" }) => <div style={{ fontWeight: 900, fontSize: Math.round(tam * 0.74), lineHeight: 0.95, letterSpacing: -2, color: cor, textShadow: sombra, whiteSpace: "nowrap" }}>{children}</div>;
const P: React.FC<{ children: React.ReactNode; cor?: string }> = ({ children, cor = "#F3E8FF" }) => <div style={{ fontWeight: 800, fontSize: 36, letterSpacing: 4, color: cor, textShadow: sombra, marginTop: 6 }}>{children}</div>;

const Janela: React.FC<{ t: number; de: number; ate: number; topo?: number; children: React.ReactNode }> = ({ t, de, ate, topo = 240, children }) => {
  if (t < de || t > ate) return null;
  const k = entra(t, de, 0.35);
  const sai = suave(t, ate - 0.2, ate);
  return <div style={{ position: "absolute", top: topo, left: 60, right: 180, textAlign: "center", fontFamily, color: "#fff", opacity: k * (1 - sai), transform: `scale(${0.7 + 0.3 * k})` }}>{children}</div>;
};

// ---------- gancho: o cadeado abre ----------
const Cadeado: React.FC<{ aberto: number; tam?: number; cor?: string }> = ({ aberto, tam = 1, cor = AMARELO }) => (
  <div style={{ position: "relative", width: 220 * tam, height: 260 * tam, margin: "0 auto" }}>
    <div style={{ position: "absolute", left: 40 * tam, top: 0, width: 140 * tam, height: 150 * tam, border: `${22 * tam}px solid #E8E8F0`, borderBottom: "none", borderRadius: `${80 * tam}px ${80 * tam}px 0 0`, transform: `translateY(${-50 * aberto * tam}px) rotate(${-25 * aberto}deg)`, transformOrigin: "10% 100%" }} />
    <div style={{ position: "absolute", left: 0, top: 110 * tam, width: 220 * tam, height: 150 * tam, borderRadius: 26 * tam, background: cor, boxShadow: `0 0 40px ${cor}, 0 14px 30px rgba(0,0,0,.5)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 34 * tam, height: 60 * tam, borderRadius: 17 * tam, background: "#1b1033" }} />
    </div>
  </div>
);
const Gancho: React.FC<{ t: number }> = ({ t }) => {
  const abre = suave(t, 0.92, 1.2);
  const treme = t < 0.92 ? Math.sin(t * 70) * 8 : 0;
  return (
    <Janela t={t} de={0} ate={3.26} topo={260}>
      <div style={{ display: "inline-block", fontWeight: 900, fontSize: 44, letterSpacing: 4, color: "#fff", background: ROXO, borderRadius: 14, padding: "4px 20px", boxShadow: `0 0 24px ${ROXO}` }}>GTA 6</div>
      <div style={{ marginTop: 84, transform: `translateX(${treme}px)` }}>
        <Cadeado aberto={abre} cor={abre > 0.5 ? VERDE : AMARELO} />
      </div>
      <div style={{ marginTop: 26, opacity: entra(t, 0.92), transform: `scale(${0.5 + 0.5 * entra(t, 0.92)})` }}>
        <G tam={150}>JÁ SAIU</G>
      </div>
      <div style={{ marginTop: 10 }}>
        <Chip t={t} de={2.32} cor={AZUL} tam={50}>🥝 SÓ NA NOVA ZELÂNDIA</Chip>
      </div>
    </Janela>
  );
};

// ---------- os dois relógios ----------
const Relogio: React.FC<{ h: number; m: number; nome: string; dia: string; cor: string; k: number }> = ({ h, m, nome, dia, cor, k }) => {
  const ah = ((h % 12) + m / 60) * 30;
  const am = m * 6;
  return (
    <div style={{ width: 340, opacity: k, transform: `scale(${0.6 + 0.4 * k})` }}>
      <div style={{ fontWeight: 900, fontSize: 40, color: cor, textShadow: sombra }}>{nome}</div>
      <svg width={300} height={300} viewBox="-100 -100 200 200" style={{ display: "block", margin: "10px auto 0" }}>
        <circle r={94} fill="rgba(14,8,30,.88)" stroke={cor} strokeWidth={7} />
        {Array.from({ length: 12 }, (_, i) => <line key={i} x1={0} y1={-80} x2={0} y2={-68} stroke="#fff" strokeWidth={i % 3 ? 3 : 6} transform={`rotate(${i * 30})`} />)}
        <line x1={0} y1={8} x2={0} y2={-46} stroke="#fff" strokeWidth={9} strokeLinecap="round" transform={`rotate(${ah})`} />
        <line x1={0} y1={10} x2={0} y2={-70} stroke={cor} strokeWidth={5} strokeLinecap="round" transform={`rotate(${am})`} />
        <circle r={7} fill="#fff" />
      </svg>
      <div style={{ fontWeight: 900, fontSize: 64, color: "#fff", textShadow: sombra, fontVariantNumeric: "tabular-nums" }}>{String(h).padStart(2, "0")}:{String(m).padStart(2, "0")}</div>
      <div style={{ fontWeight: 800, fontSize: 30, letterSpacing: 3, color: "#E6D2FF", textShadow: sombra }}>{dia}</div>
    </div>
  );
};
const Relogios: React.FC<{ t: number }> = ({ t }) => {
  const gira = suave(t, 6.14, 7.4); // os ponteiros chegam na hora certa
  const hB = Math.round(interpolate(gira, [0, 1], [0, 8]));
  const hN = Math.round(interpolate(gira, [0, 1], [8, 24])) % 24;
  const destrava = entra(t, 9.92, 0.25);
  return (
    <Janela t={t} de={3.28} ate={10.9} topo={250}>
      <Chip t={t} de={3.62} cor={AMARELO} tam={58}>⏩ +16 HORAS</Chip>
      <div style={{ marginTop: 24, display: "flex", justifyContent: "center", gap: 20 }}>
        <Relogio h={hB} m={0} nome="BRASÍLIA" dia="QUARTA · 18/11" cor={VERDE} k={entra(t, 4.86)} />
        <Relogio h={hN} m={0} nome="AUCKLAND 🥝" dia="QUINTA · 19/11" cor={AZUL} k={entra(t, 8.78)} />
      </div>
      <div style={{ marginTop: 26, opacity: destrava, transform: `rotate(-4deg) scale(${2 - destrava})` }}>
        <div style={{ display: "inline-block", fontWeight: 900, fontSize: 64, color: "#111", background: VERDE, borderRadius: 18, padding: "6px 28px", boxShadow: `0 0 34px ${VERDE}` }}>🔓 DESTRAVOU</div>
      </div>
    </Janela>
  );
};

// ---------- a meia-noite dando a volta no mundo ----------
const LUGARES: [string, number][] = [["🥝 NZ", 0.03], ["🦘 AUSTRÁLIA", 0.16], ["🗾 ÁSIA", 0.34], ["🏰 EUROPA", 0.56], ["💚 BRASIL", 0.68]];
const Globo: React.FC<{ t: number }> = ({ t }) => {
  const p = suave(t, 12.18, 15.2);
  return (
    <Janela t={t} de={10.94} ate={16.36} topo={300}>
      <P cor={AMARELO}>LIBERA À MEIA-NOITE DE CADA PAÍS</P>
      <div style={{ position: "relative", margin: "26px auto 0", width: 800, height: 330, borderRadius: 30, background: "rgba(14,8,30,.85)", border: `4px solid ${ROXO}`, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${4 + 90 * p}%`, background: `linear-gradient(90deg, rgba(74,222,128,.35), rgba(74,222,128,.08))` }} />
        <div style={{ position: "absolute", top: 0, bottom: 0, left: `${4 + 90 * p}%`, width: 6, background: VERDE, boxShadow: `0 0 24px ${VERDE}` }} />
        <div style={{ position: "absolute", top: 18, left: Math.min((0.04 + 0.9 * p) * 800, 700) - 70, width: 140, fontWeight: 900, fontSize: 30, color: VERDE }}>00:00</div>
        {LUGARES.map(([n, x], i) => {
          const ja = 0.04 + 0.9 * p >= x;
          return (
            <div key={i} style={{ position: "absolute", left: `${x * 100}%`, top: 120 + (i % 2) * 90, fontWeight: 900, fontSize: 32, whiteSpace: "nowrap", color: ja ? "#fff" : "#7d7396", textShadow: ja ? `0 0 14px ${VERDE}` : "none" }}>
              {ja ? "🔓" : "🔒"} {n}
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 26, opacity: entra(t, 14.64), transform: `scale(${0.5 + 0.5 * entra(t, 14.64)})` }}>
        <G tam={110} cor={AMARELO}>🥇 1º DO MUNDO</G>
      </div>
    </Janela>
  );
};

// ---------- os streamers brasileiros ----------
const Live: React.FC<{ t: number; de: number; nome: string; cor: string }> = ({ t, de, nome, cor }) => {
  const k = entra(t, de, 0.3);
  return (
    <div style={{ width: 360, borderRadius: 24, overflow: "hidden", background: "#0d0a18", border: `5px solid ${cor}`, boxShadow: `0 0 26px ${cor}`, opacity: k, transform: `scale(${0.5 + 0.5 * k}) rotate(${de % 2 > 1 ? 2 : -2}deg)` }}>
      <div style={{ height: 190, background: `linear-gradient(160deg, ${cor}, #2B0F66)`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        <div style={{ fontWeight: 900, fontSize: 70, color: "#fff", textShadow: sombra }}>GTA 6</div>
        <div style={{ position: "absolute", left: 12, top: 12, fontWeight: 900, fontSize: 24, color: "#fff", background: VERMELHO, borderRadius: 8, padding: "2px 10px", opacity: Math.sin(t * 8) > -0.3 ? 1 : 0.5 }}>● AO VIVO</div>
      </div>
      <div style={{ fontWeight: 900, fontSize: 36, color: "#fff", padding: "10px 0 12px" }}>{nome}</div>
    </div>
  );
};
const Streamers: React.FC<{ t: number }> = ({ t }) => (
  <Janela t={t} de={16.38} ate={24.3} topo={260}>
    <div style={{ width: 640 }}>
      <P cor={AMARELO}>E O BRASILEIRO?</P>
      <Chip t={t} de={18.64} cor={AMARELO} tam={54}>⏰ 8:00 DA MANHÃ</Chip>
    </div>
    <div style={{ marginTop: 34, display: "flex", justifyContent: "center", gap: 24 }}>
      <Live t={t} de={20.96} nome="ALANZOKA" cor={ROSA} />
      <Live t={t} de={21.62} nome="DAVY JONES" cor={AZUL} />
    </div>
    <div style={{ marginTop: 34, opacity: entra(t, 23.14), transform: `rotate(-3deg) scale(${0.5 + 0.5 * entra(t, 23.14)})` }}>
      <G tam={104}>ANTES DO CAFÉ ☕</G>
    </div>
  </Janela>
);

// ---------- o truque ----------
const Truque: React.FC<{ t: number }> = ({ t }) => {
  const troca = t > 27.32;
  const reinicia = t > 28.18;
  const risco = entra(t, 33.28, 0.25);
  const cartao = (de: number, titulo: string, cor: string, filhos: React.ReactNode) => (
    <div style={{ margin: "18px auto 0", width: 760, padding: "18px 26px 22px", borderRadius: 28, background: "rgba(14,8,30,.9)", border: `5px solid ${cor}`, boxShadow: `0 0 24px ${cor}`, opacity: entra(t, de), transform: `scale(${0.6 + 0.4 * entra(t, de)})`, textAlign: "left" }}>
      <div style={{ fontWeight: 900, fontSize: 40, color: cor }}>{titulo}</div>
      {filhos}
    </div>
  );
  return (
    <Janela t={t} de={24.36} ate={34.3} topo={250}>
      <G tam={110} cor={AMARELO}>O TRUQUE 🤫</G>
      {cartao(25.1, "🎮 XBOX", VERDE, (
        <>
          <div style={{ marginTop: 10, fontWeight: 800, fontSize: 30, color: "#cfc6e6" }}>Configurações › Localização</div>
          <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 14, fontWeight: 900, fontSize: 40, color: "#fff", whiteSpace: "nowrap" }}>
            <span style={{ opacity: troca ? 0.4 : 1, textDecoration: troca ? "line-through" : "none" }}>BRASIL</span>
            <span style={{ color: VERDE }}>→</span>
            <span style={{ opacity: entra(t, 27.32), color: VERDE }}>NOVA ZELÂNDIA 🥝</span>
          </div>
          <div style={{ marginTop: 12, display: "inline-block", fontWeight: 900, fontSize: 32, color: "#111", background: reinicia ? VERDE : "#9AA3B5", borderRadius: 14, padding: "4px 18px" }}>{reinicia ? "✓ REINICIAR" : "REINICIAR"}</div>
        </>
      ))}
      {cartao(28.52, "🎮 PLAYSTATION", AZUL, (
        <>
          <div style={{ marginTop: 10, fontWeight: 900, fontSize: 40, color: "#fff", opacity: entra(t, 30.7) }}>SÓ COM CONTA DA NOVA ZELÂNDIA</div>
          <div style={{ marginTop: 12, display: "inline-block", fontWeight: 900, fontSize: 36, color: "#111", background: AMARELO, borderRadius: 14, padding: "4px 18px", opacity: risco, transform: `scale(${2 - risco}) rotate(-2deg)`, boxShadow: `0 0 24px ${AMARELO}` }}>⚠️ DADO FALSO = SUSPENSÃO</div>
        </>
      ))}
    </Janela>
  );
};

// ---------- a primeira hora, sem spoiler ----------
const ITENS: [string, string, number][] = [
  ["⛓️", "COMEÇA COM A LUCIA NA CADEIA", 36.74],
  ["🚗", "CARRO BEM MAIS PESADO", 38.76],
  ["🔧", "O MOTOR MOSTRA O ESTRAGO", 40.3],
  ["🐅", "TIGRE NO PÂNTANO", 44.8],
  ["🐊", "JACARÉ ALBINO", 45.5],
];
const PrimeiraHora: React.FC<{ t: number }> = ({ t }) => (
  <Janela t={t} de={34.34} ate={46.62} topo={250}>
    <div style={{ display: "inline-block", fontWeight: 900, fontSize: 40, letterSpacing: 3, color: "#111", background: VERDE, borderRadius: 14, padding: "4px 20px", boxShadow: `0 0 24px ${VERDE}` }}>✅ SEM SPOILER</div>
    <div style={{ marginTop: 10 }}>
      <G tam={104}>A PRIMEIRA HORA</G>
    </div>
    <div style={{ margin: "22px auto 0", width: 800, padding: "14px 26px 22px", borderRadius: 28, background: "rgba(14,8,30,.88)", border: `4px solid ${ROXO}`, textAlign: "left" }}>
      {ITENS.map(([ic, txt, de], i) => {
        const k = entra(t, de, 0.25);
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 12, opacity: k, transform: `translateX(${(1 - k) * -60}px)` }}>
            <span style={{ fontSize: 56 }}>{ic}</span>
            <span style={{ flex: 1, fontWeight: 900, fontSize: 40, color: i >= 3 ? AMARELO : "#fff" }}>{txt}</span>
            <span style={{ fontWeight: 900, fontSize: 50, color: VERDE }}>✓</span>
          </div>
        );
      })}
    </div>
  </Janela>
);

// ---------- a revelação que eu não vou contar ----------
const Revelacao: React.FC<{ t: number }> = ({ t }) => {
  const lacre = entra(t, 49.8, 0.25);
  return (
    <Janela t={t} de={46.68} ate={53.42} topo={300}>
      <div style={{ width: 640 }}>
        <P cor={AMARELO}>UMA REVELAÇÃO NO COMEÇO</P>
        <div style={{ position: "relative", margin: "26px auto 0", width: 560, height: 360, opacity: entra(t, 47.0), transform: `rotate(-2deg) scale(${0.6 + 0.4 * entra(t, 47.0)})` }}>
          <div style={{ position: "absolute", inset: 0, background: "#E9DCC0", borderRadius: 14, boxShadow: "0 20px 50px rgba(0,0,0,.6)" }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 0, borderLeft: "280px solid transparent", borderRight: "280px solid transparent", borderTop: "190px solid #D7C6A3" }} />
          <div style={{ position: "absolute", left: 30, bottom: 30, fontFamily: "Georgia, serif", fontWeight: 900, fontSize: 46, color: VERMELHO, letterSpacing: 4 }}>CONFIDENCIAL</div>
          <div style={{ position: "absolute", left: "50%", top: 150, width: 120, height: 120, marginLeft: -60, borderRadius: "50%", background: VERMELHO, boxShadow: "0 6px 0 #8a1622", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 60 }}>🤫</div>
          <div style={{ position: "absolute", right: -30, top: 40, opacity: lacre, transform: `rotate(12deg) scale(${2 - lacre})`, border: `8px solid ${VERMELHO}`, color: VERMELHO, fontWeight: 900, fontSize: 46, padding: "4px 20px", borderRadius: 14, background: "rgba(233,220,192,.95)", whiteSpace: "nowrap" }}>NÃO VOU CONTAR</div>
        </div>
        <div style={{ marginTop: 30 }}>
          <Chip t={t} de={52.18} cor={ROSA} tam={46}>💥 MUDA TUDO: JASON & LUCIA</Chip>
        </div>
      </div>
    </Janela>
  );
};

// ---------- Brasil x Nova Zelândia ----------
const Placar: React.FC<{ t: number }> = ({ t }) => (
  <Janela t={t} de={53.44} ate={57.94} topo={300}>
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
      <div style={{ width: 760, padding: "22px 26px", borderRadius: 28, background: "rgba(14,8,30,.9)", border: `5px solid ${VERDE}`, display: "flex", alignItems: "center", gap: 24, opacity: entra(t, 53.66), transform: `scale(${0.6 + 0.4 * entra(t, 53.66)})` }}>
        <Cadeado aberto={0} tam={0.42} cor={AMARELO} />
        <div style={{ textAlign: "left" }}>
          <div style={{ fontWeight: 900, fontSize: 50, color: "#fff" }}>💚 BRASIL</div>
          <div style={{ fontWeight: 900, fontSize: 38, color: AMARELO, whiteSpace: "nowrap" }}>DESTRAVA À MEIA-NOITE</div>
        </div>
      </div>
      <div style={{ width: 760, padding: "22px 26px", borderRadius: 28, background: "rgba(14,8,30,.9)", border: `5px solid ${AZUL}`, display: "flex", alignItems: "center", gap: 24, opacity: entra(t, 56.44), transform: `scale(${0.6 + 0.4 * entra(t, 56.44)})` }}>
        <Cadeado aberto={1} tam={0.42} cor={VERDE} />
        <div style={{ textAlign: "left" }}>
          <div style={{ fontWeight: 900, fontSize: 50, color: "#fff", whiteSpace: "nowrap" }}>🥝 NOVA ZELÂNDIA</div>
          <div style={{ fontWeight: 900, fontSize: 38, color: VERDE, whiteSpace: "nowrap" }}>JÁ EM VICE CITY 🌴</div>
        </div>
      </div>
    </div>
  </Janela>
);

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
const REACOES = [17.68, 49.8];
const JANELAS: [number, number][] = [
  [16.38, 18.6], // o brasileiro não esperou nada
  [46.68, 53.4], // a revelação
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
  ["🌙", "VIRO A NOITE", 61.74, ROSA],
  ["☀️", "JOGO DE MANHÃ", 62.6, AMARELO],
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
        <div style={{ fontWeight: 900, fontSize: 84, lineHeight: 0.95, color: "#fff", textShadow: sombra }}>MEIA-NOITE</div>
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
const DESTAQUE = /^(GTA|6|saiu|Nova|Zelândia|16|horas|8|manhã|meia-noite|19|Auckland|destravou|Rockstar|primeira|mundo|brasileiro|nada|streamer|Alanzoka|Davy|Jones|café|truque\?|Xbox|reinicia|PlayStation|chato|neozelandesa|suspensa|hora\?|Lucia|cadeia|pesado|5|motor|estrago|pântano|tigre|jacaré|albino|revelação|ninguém|contar|tudo|Jason|Brasil|Vice|City|Fase|Extra|Vyce|noite|manhã\?|Comenta)$/i;
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
const IMPACTOS = [0.92, 9.92, 14.64, 23.14, 33.28, 45.5, 49.8, 56.44];
const SONS: { s: string; t: number; v: number }[] = [
  { s: "dum", t: 0.0, v: 0.5 },
  { s: "carimbo", t: 0.92, v: 0.55 },
  { s: "whoosh", t: 3.26, v: 0.45 },
  { s: "whoosh", t: 6.08, v: 0.4 },
  { s: "carimbo", t: 9.92, v: 0.55 },
  { s: "whoosh", t: 10.92, v: 0.45 },
  { s: "dum", t: 14.64, v: 0.5 },
  { s: "whoosh", t: 16.36, v: 0.45 },
  { s: "whoosh", t: 21.54, v: 0.4 },
  { s: "carimbo", t: 23.14, v: 0.5 },
  { s: "whoosh", t: 24.34, v: 0.45 },
  { s: "whoosh", t: 28.5, v: 0.4 },
  { s: "carimbo", t: 33.28, v: 0.55 },
  { s: "whoosh", t: 34.32, v: 0.45 },
  { s: "whoosh", t: 40.28, v: 0.4 },
  { s: "dum", t: 45.5, v: 0.5 },
  { s: "whoosh", t: 46.66, v: 0.45 },
  { s: "carimbo", t: 49.8, v: 0.55 },
  { s: "whoosh", t: 53.42, v: 0.45 },
  { s: "dum", t: 56.44, v: 0.5 },
  { s: "whoosh", t: INICIO_FINAL - 0.1, v: 0.45 },
];

const DUCK: number[] = (() => {
  const bruto = Array.from({ length: DURACAO_FASE17 }, (_, i) => (falando(i / FPS) ? 0.42 : 1));
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

export const VideoFase17: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const corte = PLANOS.some((p) => p.de > 0 && t >= p.de && t < p.de + 2 / FPS) && !emSetup(t) ? 0.2 : 0;
  const flash = Math.min(0.8, IMPACTOS.reduce((m, a) => m + interpolate(t, [a, a + 0.04, a + 0.28], [0, a === 0 ? 0.35 : 0.45, 0], cl), 0));
  const tremor = IMPACTOS.reduce((m, a) => (t >= a ? Math.max(m, 1 - suave(t, a, a + 0.35)) : m), 0);
  const tx = Math.sin(t * 83) * 10 * tremor;
  const ty = Math.cos(t * 71) * 8 * tremor;
  const noFundo = !emSetup(t);
  const escurece = t > 3.28 && t < INICIO_FINAL ? 0.1 : 0;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ transform: `translate(${tx}px,${ty}px) scale(1.02)` }}>
        {noFundo && <Fundo t={t} />}
        {noFundo && <AbsoluteFill style={{ background: `rgba(8,4,20,${escurece})` }} />}
        {noFundo && <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,4,24,.5) 0%, rgba(10,4,24,.08) 22%, rgba(10,4,24,0) 50%, rgba(10,4,24,.12) 72%, rgba(10,4,24,.55) 100%)" }} />}
      </AbsoluteFill>
      <Setup t={t} f={f} />

      <Gancho t={t} />
      <Relogios t={t} />
      <Globo t={t} />
      <Streamers t={t} />
      <Truque t={t} />
      <PrimeiraHora t={t} />
      <Revelacao t={t} />
      <Placar t={t} />

      <Facecam t={t} f={f} />
      <Legenda t={t} />

      <AbsoluteFill style={{ background: "#F5E9FF", opacity: flash, pointerEvents: "none" }} />
      <AbsoluteFill style={{ background: "#000", opacity: corte, pointerEvents: "none" }} />

      <Audio src={staticFile("fase-extra/fase17/narracao.wav")} />
      <Audio src={staticFile("fase-extra/fase17/trilha.wav")} volume={(q) => 0.63 * (DUCK[q] ?? 1)} />
      {SONS.map((s, i) => (
        <Sequence key={i} from={Math.round(s.t * FPS)} durationInFrames={60}>
          <Audio src={staticFile(`fase-extra/sons/${s.s}.wav`)} volume={(q) => s.v * (falando(s.t + q / FPS) ? 0.3 : 1)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
