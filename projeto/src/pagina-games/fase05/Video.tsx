import { loadFont } from "@remotion/google-fonts/Montserrat";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { Acabamento, PalcoCinema } from "../../cinema/Palco";
import { Camera } from "../Estudio";
import { Mascote3D, PoseMascote } from "../Mascote3D";
import { SetupGamer } from "../SetupGamer";
import dados from "./dados.json";

// Fase Extra, Fase 05: "GTA 6 em 3 dias: o que você precisa saber antes de jogar" (~1:25).
// Gancho do espaço (barra de download travada), checklist "ANTES DO DIA 19", contagem 1→5 "NO PRIMEIRO DIA"
// e desfecho desmentindo os 125 km² do mapa. Padrão da Fase 04: nada parado, corte a cada 1–2 s.
const { fontFamily } = loadFont("normal", { weights: ["600", "800", "900"], subsets: ["latin"] });
export const FPS = 30;
const FIM = dados.duracao + 1.0;
export const DURACAO_FASE05 = Math.ceil(FIM * FPS);
const ROXO = "#B66BFF";
const ROSA = "#FF4FD8";
const VERDE = "#4ADE80";
const VERMELHO = "#FF4D5E";
const AMARELO = "#FFD84A";
const DIAS = 3;
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const suave = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
const entra = (t: number, a: number, d = 0.3) => interpolate(t, [a, a + d], [0, 1], { ...cl, easing: Easing.out(Easing.back(1.7)) });
const sombra = "0 0 26px rgba(182,107,255,.85), 0 5px 0 #2B0F66, 0 0 8px rgba(0,0,0,.9)";

const INICIO_FINAL = 80.31; // "Você está na Fase Extra"
const emSetup = (t: number) => t >= INICIO_FINAL;

// ---------- planos ----------
const PE = (pasta: string, nome: string) => `fase-extra/rockstar/capturas/People/${pasta}/${nome}.jpg`;
const PL = (pasta: string, nome: string) => `fase-extra/rockstar/capturas/Places/${pasta}/${nome}.jpg`;
const MAPA = "fase-extra/mapa-fas/mapa-fas.jpg";
type Plano = { de: number; img?: string; tr?: number; x?: number; x2?: number; zoom?: number; lento?: number; chicote?: boolean; retrato?: boolean };
const PLANOS: Plano[] = [
  // gancho
  { de: 0.0, tr: 18.0, x: 0.5, zoom: 1.25 },
  { de: 1.6, tr: 70.0, x: 0.55, zoom: 1.1 },
  { de: 3.0, img: PL("Vice City", "Vice_City_08"), x: 0.4, x2: 0.6, chicote: true },
  { de: 4.4, tr: 47.0, x: 0.55, zoom: 1.15 },
  // apresentação
  { de: 5.5, tr: 55.3, x: 0.5, lento: 0.7 },
  { de: 7.6, img: PE("Jason and Lucia", "Jason_and_Lucia_01"), x: 0.45, x2: 0.55 },
  { de: 9.9, img: MAPA, retrato: true, x: 0.6, x2: 0.4, zoom: 1.3 }, // provocação: o mapa
  // antes do dia 19
  { de: 13.5, img: PE("Jason Duval", "Jason_Duval_04"), x: 0.5, x2: 0.4 },
  { de: 16.1, tr: 64.0, x: 0.5 },
  { de: 18.2, img: PE("Lucia Caminos", "Lucia_Caminos_10"), x: 0.45, x2: 0.55, chicote: true },
  { de: 20.15, tr: 18.5, x: 0.45, lento: 0.6 }, // meia-noite
  { de: 21.7, img: PL("Vice City", "Vice_City_02"), x: 0.55, x2: 0.65 },
  { de: 23.1, img: PE("Boobie Ike", "Boobie_Ike_01"), x: 0.42, x2: 0.5 }, // dinheiro
  { de: 25.3, img: PL("Vice City", "Vice_City_07"), x: 0.5, x2: 0.4, chicote: true },
  // no primeiro dia
  { de: 27.85, tr: 49.1, x: 0.5, zoom: 1.1 },
  { de: 29.75, tr: 47.0, x: 0.55, zoom: 1.1 }, // 1: abasteça
  { de: 31.1, img: PE("Jason Duval", "Jason_Duval_11"), x: 0.4, x2: 0.5 },
  { de: 32.7, tr: 71.5, x: 0.4, lento: 0.7 }, // fuga
  { de: 34.0, img: PE("Jason and Lucia", "Jason_and_Lucia_11"), x: 0.45, x2: 0.55, chicote: true },
  { de: 35.0, img: PE("Jason and Lucia", "Jason_and_Lucia_20"), x: 0.5, x2: 0.4 }, // 2: celular
  { de: 36.8, img: PE("Jason Duval", "Jason_Duval_19"), x: 0.5, x2: 0.6 },
  { de: 38.3, tr: 47.0, x: 0.6, zoom: 1.2 },
  { de: 40.6, img: PE("Jason Duval", "Jason_Duval_01"), x: 0.55, x2: 0.45, chicote: true }, // carro de luxo
  { de: 42.7, tr: 48.0, x: 0.55 }, // polícia
  { de: 44.25, tr: 35.0, x: 0.5, lento: 0.6 }, // re-gancho
  { de: 46.65, img: PE("Jason and Lucia", "Jason_and_Lucia_15"), x: 0.45, x2: 0.55 }, // 3: missão travada
  { de: 49.4, img: PE("Jason and Lucia", "Jason_and_Lucia_08"), x: 0.5, x2: 0.4, chicote: true },
  { de: 51.1, tr: 61.5, x: 0.45, lento: 0.6 },
  { de: 52.45, img: PE("Jason Duval", "Jason_Duval_14"), x: 0.5, x2: 0.4 }, // 4: casa
  { de: 54.75, img: PE("Cal Hampton", "Cal_Hampton_01"), x: 0.45, x2: 0.55 },
  { de: 57.0, img: PE("Jason and Lucia", "Jason_and_Lucia_13"), x: 0.5, x2: 0.4, chicote: true },
  { de: 59.81, img: PE("Lucia Caminos", "Lucia_Caminos_02"), x: 0.45, x2: 0.55 }, // selfie
  { de: 61.71, img: PL("Vice City", "Vice_City_03"), x: 0.4, x2: 0.55 }, // 5: cachorro
  { de: 63.81, img: PE("Jason and Lucia", "Jason_and_Lucia_19"), x: 0.55, x2: 0.45, chicote: true },
  { de: 65.26, img: PL("Leonida Keys", "Leonida_Keys_02"), x: 0.35, x2: 0.45 },
  // desfecho: o mapa
  { de: 67.46, img: MAPA, retrato: true, x: 0.5, x2: 0.5, zoom: 1.0 },
  { de: 72.21, img: MAPA, retrato: true, x: 0.2, x2: 0.35, zoom: 1.5, chicote: true },
  { de: 76.01, img: MAPA, retrato: true, x: 0.7, x2: 0.55, zoom: 1.25 },
  { de: 78.81, tr: 70.0, x: 0.55 },
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
  const W = p.retrato ? 1533 : 3413; // retrato: mapa 1450x1816 cobrindo a altura
  const estilo = { filter: ch > 0.02 ? `blur(${10 * ch}px)` : undefined, transform: `translateX(${ch * 260}px)` };
  if (p.img) {
    const x = interpolate(k, [0, 1], [p.x ?? 0.5, p.x2 ?? p.x ?? 0.5]);
    const z = (p.zoom ?? 1.05) * (1 + 0.1 * k) * punch;
    return (
      <AbsoluteFill style={{ overflow: "hidden", ...estilo }}>
        <Img src={staticFile(p.img)} style={{ position: "absolute", width: W, height: 1920, left: -(W - 1080) * x, top: 0, transform: `scale(${z})`, transformOrigin: `${x * 100}% 50%` }} />
      </AbsoluteFill>
    );
  }
  const z = (p.zoom ?? 1.05) * (1 + 0.07 * k) * punch;
  const src = staticFile("fase-extra/rockstar/trailer-1920.mp4");
  const dur = Math.max(1, Math.round((fim - p.de) * FPS) + 2);
  return (
    <Sequence key={i} from={Math.round(p.de * FPS)} durationInFrames={dur} layout="none">
      <AbsoluteFill style={{ overflow: "hidden", ...estilo }}>
        <OffthreadVideo src={src} startFrom={Math.round((p.tr ?? 0) * FPS)} playbackRate={p.lento ?? 1} muted style={{ position: "absolute", width: W, height: 1920, left: -(W - 1080) * (p.x ?? 0.5), top: 0, transform: `scale(${z})`, transformOrigin: `${(p.x ?? 0.5) * 100}% 50%` }} />
      </AbsoluteFill>
    </Sequence>
  );
};

// ---------- gancho: barra de download travada ----------
const Download: React.FC<{ t: number }> = ({ t }) => {
  if (t > 5.45) return null;
  const sai = suave(t, 5.2, 5.45);
  const pct = Math.min(99, Math.round(interpolate(t, [0.2, 2.0], [12, 99], { ...cl, easing: Easing.out(Easing.cubic) })));
  const pisca = t > 2.0 && Math.floor(t * 4) % 2 === 0;
  const bate = interpolate(t, [0, 0.18], [2.6, 1], { ...cl, easing: Easing.out(Easing.cubic) });
  return (
    <div style={{ position: "absolute", left: 60, right: 180, top: 470, textAlign: "center", fontFamily, color: "#fff", opacity: 1 - sai }}>
      <div style={{ transform: `scale(${bate})`, fontWeight: 900, fontSize: 230, lineHeight: 1, color: AMARELO, WebkitTextStroke: "8px #2B0F66", textShadow: `0 0 50px ${AMARELO}, 0 14px 0 #2B0F66` }}>212 GB</div>
      <div style={{ margin: "26px auto 0", width: 760, height: 46, borderRadius: 23, background: "rgba(20,10,40,.85)", border: `4px solid ${pisca ? VERMELHO : "#fff"}`, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg, ${ROXO}, ${ROSA})` }} />
      </div>
      <div style={{ marginTop: 12, fontWeight: 900, fontSize: 46, textShadow: sombra }}>
        BAIXANDO… <span style={{ color: pisca ? VERMELHO : "#fff" }}>{pct}%</span>
      </div>
      {t > 3.0 && (
        <div style={{ display: "inline-block", marginTop: 18, transform: `scale(${entra(t, 3.0, 0.25)}) rotate(-4deg)`, fontWeight: 900, fontSize: 64, color: "#fff", background: VERMELHO, borderRadius: 14, padding: "6px 22px", boxShadow: "0 8px 0 #5a0710" }}>
          JÁ TÁ ATRASADO
        </div>
      )}
    </div>
  );
};

// ---------- tarjas das duas partes ----------
const Tarja: React.FC<{ t: number; de: number; ate: number; txt: string; cor: string }> = ({ t, de, ate, txt, cor }) => {
  if (t < de || t > ate) return null;
  const grande = 1 - suave(t, de + 0.9, de + 1.3); // entra grande no meio e vira faixa no alto
  const y = interpolate(grande, [0, 1], [400, 760]);
  const tam = interpolate(grande, [0, 1], [40, 96]);
  const k = entra(t, de, 0.3);
  return (
    <div style={{ position: "absolute", left: 60, right: 180, top: y, textAlign: "center", opacity: k * (1 - suave(t, ate - 0.2, ate)) }}>
      <span style={{ display: "inline-block", transform: `scale(${0.5 + 0.5 * k}) rotate(-2deg)`, fontFamily, fontWeight: 900, fontSize: tam, color: "#111", background: cor, borderRadius: 16, padding: "6px 24px", boxShadow: "0 8px 0 rgba(0,0,0,.6)", whiteSpace: "nowrap" }}>{txt}</span>
    </div>
  );
};

// checklist da parte "antes do dia 19"
const ANTES: { txt: string; de: number; ok: boolean }[] = [
  { txt: "PRÉ-DOWNLOAD DESDE 10/11", de: 13.67, ok: true },
  { txt: "SÓ PS5 E XBOX SERIES", de: 16.2, ok: true },
  { txt: "PC: NADA AINDA", de: 18.27, ok: false },
  { txt: "MEIA-NOITE NO HORÁRIO LOCAL", de: 20.2, ok: true },
];
const Checklist: React.FC<{ t: number }> = ({ t }) => {
  if (t < 13.6 || t > 21.7) return null;
  const sai = suave(t, 21.5, 21.7);
  return (
    <div style={{ position: "absolute", left: 50, right: 170, top: 500, display: "flex", flexDirection: "column", alignItems: "center", gap: 14, opacity: 1 - sai }}>
      {ANTES.map((it, i) => {
        const k = entra(t, it.de, 0.3);
        if (k <= 0) return null;
        const cor = it.ok ? VERDE : VERMELHO;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, transform: `translateX(${(1 - k) * -160}px) scale(${0.6 + 0.4 * k})`, opacity: k, background: "rgba(20,10,40,.82)", border: `3px solid ${cor}`, borderRadius: 16, padding: "8px 20px", boxShadow: `0 0 18px ${cor}88` }}>
            <span style={{ fontFamily, fontWeight: 900, fontSize: 50, color: cor }}>{it.ok ? "✓" : "✗"}</span>
            <span style={{ fontFamily, fontWeight: 900, fontSize: 42, color: "#fff", whiteSpace: "nowrap" }}>{it.txt}</span>
          </div>
        );
      })}
    </div>
  );
};

// etiquetas de preço
const Precos: React.FC<{ t: number }> = ({ t }) => {
  if (t < 22.2 || t > 27.8) return null;
  const sai = suave(t, 27.6, 27.8);
  const Etq: React.FC<{ de: number; nome: string; valor: string; cor: string; rot: number }> = ({ de, nome, valor, cor, rot }) => {
    const k = entra(t, de, 0.3);
    if (k <= 0) return null;
    return (
      <div style={{ transform: `scale(${0.4 + 0.6 * k}) rotate(${rot}deg)`, opacity: k, textAlign: "center", background: "rgba(20,10,40,.9)", border: `4px solid ${cor}`, borderRadius: 20, padding: "10px 24px", boxShadow: `0 0 26px ${cor}` }}>
        <div style={{ fontFamily, fontWeight: 800, fontSize: 32, letterSpacing: 4, color: cor }}>{nome}</div>
        <div style={{ fontFamily, fontWeight: 900, fontSize: 90, lineHeight: 1, color: "#fff" }}>{valor}</div>
      </div>
    );
  };
  return (
    <div style={{ position: "absolute", left: 50, right: 170, top: 470, display: "flex", flexDirection: "column", alignItems: "center", gap: 26, opacity: 1 - sai }}>
      <div style={{ fontFamily, fontWeight: 800, fontSize: 38, letterSpacing: 6, color: "#fff", textShadow: sombra, opacity: entra(t, 22.2) }}>NO BRASIL</div>
      <Etq de={23.16} nome="STANDARD" valor="R$ 449,90" cor={VERDE} rot={-3} />
      <Etq de={25.33} nome="ULTIMATE" valor="R$ 549,90" cor={ROSA} rot={3} />
    </div>
  );
};

// ---------- itens "no primeiro dia" ----------
type Item = { n: number; de: number; ate: number; titulo: string; cor: string };
const ITENS: Item[] = [
  { n: 1, de: 29.78, ate: 34.95, titulo: "ABASTEÇA", cor: AMARELO },
  { n: 2, de: 35.02, ate: 44.2, titulo: "APONTA O CELULAR", cor: "#7CC8FF" },
  { n: 3, de: 46.69, ate: 52.4, titulo: "MISSÃO TRAVADA", cor: VERMELHO },
  { n: 4, de: 52.47, ate: 61.71, titulo: "CASA? NÃO DÁ", cor: "#FF9D9D" },
  { n: 5, de: 61.76, ate: 67.41, titulo: "PEDE PRO DONO", cor: VERDE },
];
const Cartao: React.FC<{ t: number }> = ({ t }) => {
  const it = ITENS.find((i) => t >= i.de - 0.05 && t < i.ate);
  if (!it) return null;
  const sai = suave(t, it.ate - 0.2, it.ate);
  const bate = interpolate(t, [it.de, it.de + 0.18], [3.2, 1], { ...cl, easing: Easing.out(Easing.cubic) });
  const treme = Math.sin(t * 70) * 14 * (1 - suave(t, it.de + 0.18, it.de + 0.5));
  const sobe = suave(t, it.de + 0.55, it.de + 0.9);
  const tam = interpolate(sobe, [0, 1], [420, 190]);
  const y = interpolate(sobe, [0, 1], [700, 430]);
  return (
    <AbsoluteFill style={{ opacity: 1 - sai }}>
      <div style={{ position: "absolute", left: 60, right: 180, top: y, transform: `translate(${treme}px,-50%) scale(${bate})`, textAlign: "center", fontFamily, fontWeight: 900, fontSize: tam, lineHeight: 1, color: "#fff", WebkitTextStroke: "8px #2B0F66", textShadow: `0 0 50px ${ROSA}, 0 14px 0 #2B0F66` }}>
        {it.n}
      </div>
      <div style={{ position: "absolute", left: 40, right: 160, top: 560, textAlign: "center", opacity: sobe, transform: `scale(${0.6 + 0.4 * sobe})` }}>
        <span style={{ display: "inline-block", fontFamily, fontWeight: 900, fontSize: 70, color: "#111", background: it.cor, borderRadius: 16, padding: "4px 24px", boxShadow: "0 8px 0 rgba(0,0,0,.6)", whiteSpace: "nowrap" }}>{it.titulo}</span>
      </div>
    </AbsoluteFill>
  );
};
const Pilulas: React.FC<{ t: number; de: number; ate: number; itens: [string, number][]; cor?: string; topo?: number }> = ({ t, de, ate, itens, cor = ROSA, topo = 720 }) => {
  if (t < de || t > ate) return null;
  const sai = suave(t, ate - 0.2, ate);
  return (
    <div style={{ position: "absolute", left: 60, right: 180, top: topo, display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center", opacity: 1 - sai }}>
      {itens.map(([txt, d], i) => {
        const k = entra(t, d, 0.25);
        return (
          <span key={i} style={{ fontFamily, fontWeight: 900, fontSize: 40, color: "#fff", background: "rgba(20,10,40,.82)", border: `3px solid ${cor}`, borderRadius: 14, padding: "6px 16px", boxShadow: `0 0 16px ${cor}`, opacity: k, transform: `scale(${0.5 + 0.5 * k})` }}>
            {txt}
          </span>
        );
      })}
    </div>
  );
};

// celular escaneando o carro (item 2)
const Scanner: React.FC<{ t: number }> = ({ t }) => {
  if (t < 37.2 || t > 40.6) return null;
  const k = entra(t, 37.2, 0.35);
  const sai = suave(t, 40.4, 40.6);
  const linha = (t * 1.6) % 1;
  const L: [string, string, number, string][] = [
    ["ALARME", "SIM", 38.31, AMARELO],
    ["VALOR", "$$$", 39.04, VERDE],
    ["RASTREADOR", "⚠ SIM", 39.91, VERMELHO],
  ];
  return (
    <div style={{ position: "absolute", left: 540, top: 960, transform: `translate(-50%,-50%) scale(${0.82 * k}) rotate(${(1 - k) * 12}deg)`, opacity: 1 - sai }}>
      <div style={{ position: "relative", width: 420, height: 560, borderRadius: 48, background: "#0d0820", border: "10px solid #2a1f45", boxShadow: `0 0 40px ${ROXO}, 0 20px 40px rgba(0,0,0,.7)`, overflow: "hidden", padding: "60px 30px 30px" }}>
        <div style={{ fontFamily, fontWeight: 900, fontSize: 30, color: "#7CC8FF", letterSpacing: 4, textAlign: "center" }}>SCANNER</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 60 + linha * 440, height: 4, background: "#7CC8FF", boxShadow: "0 0 18px #7CC8FF", opacity: 0.8 }} />
        {L.map(([a, b, d, cor], i) => {
          const q = entra(t, d, 0.25);
          return (
            <div key={i} style={{ marginTop: 34, display: "flex", justifyContent: "space-between", opacity: q, transform: `translateX(${(1 - q) * 60}px)` }}>
              <span style={{ fontFamily, fontWeight: 800, fontSize: 34, color: "#fff" }}>{a}</span>
              <span style={{ fontFamily, fontWeight: 900, fontSize: 34, color: cor }}>{b}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// cadeado (item 3)
const Cadeado: React.FC<{ t: number }> = ({ t }) => {
  if (t < 47.4 || t > 52.4) return null;
  const k = entra(t, 47.4, 0.35);
  const treme = t > 49.4 && t < 49.9 ? Math.sin(t * 60) * 10 : 0;
  return (
    <div style={{ position: "absolute", left: 540, top: 900, transform: `translate(calc(-50% + ${treme}px),-50%) scale(${k})`, opacity: 1 - suave(t, 52.2, 52.4), textAlign: "center" }}>
      <svg width={220} height={240} viewBox="0 0 220 240">
        <path d="M55 105 V75 a55 55 0 0 1 110 0 V105" fill="none" stroke="#fff" strokeWidth={22} strokeLinecap="round" />
        <rect x={25} y={100} width={170} height={130} rx={24} fill={VERMELHO} stroke="#fff" strokeWidth={8} />
        <circle cx={110} cy={158} r={16} fill="#fff" />
        <rect x={103} y={160} width={14} height={36} rx={6} fill="#fff" />
      </svg>
      <div style={{ fontFamily, fontWeight: 900, fontSize: 44, color: "#fff", textShadow: sombra }}>MISSÃO DA HISTÓRIA</div>
    </div>
  );
};

// desfecho: 125 km² FALSO
const Mito: React.FC<{ t: number }> = ({ t }) => {
  if (t < 67.46 || t > 80.26) return null;
  const sai = suave(t, 80.06, 80.26);
  const bate = interpolate(t, [68.61, 68.81], [3, 1], { ...cl, easing: Easing.out(Easing.cubic) });
  const carimbo = interpolate(t, [72.26, 72.41], [3.5, 1], { ...cl, easing: Easing.out(Easing.cubic) });
  return (
    <AbsoluteFill style={{ opacity: 1 - sai }}>
      <div style={{ position: "absolute", left: 60, right: 180, top: 380, textAlign: "center", fontFamily }}>
        <div style={{ fontWeight: 800, fontSize: 38, letterSpacing: 6, color: "#fff", textShadow: sombra, opacity: entra(t, 67.51) }}>O NÚMERO DO MAPA</div>
        {t > 68.61 && (
          <div style={{ position: "relative", display: "inline-block", transform: `scale(${bate})`, marginTop: 10 }}>
            <div style={{ fontWeight: 900, fontSize: 160, lineHeight: 1, whiteSpace: "nowrap", color: "#fff", WebkitTextStroke: "8px #2B0F66", textShadow: `0 0 40px ${ROSA}, 0 12px 0 #2B0F66` }}>125 km²</div>
            {t > 72.26 && (
              <div style={{ position: "absolute", left: "50%", top: "50%", transform: `translate(-50%,-50%) rotate(-12deg) scale(${carimbo})`, fontWeight: 900, fontSize: 150, color: VERMELHO, border: `12px solid ${VERMELHO}`, borderRadius: 24, padding: "0 30px", background: "rgba(0,0,0,.35)", textShadow: "0 0 20px #000" }}>
                FALSO
              </div>
            )}
          </div>
        )}
      </div>
      <Pilulas t={t} de={73.91} ate={80.26} topo={720} cor={AMARELO} itens={[["MEDIÇÃO DE FÃ", 74.96]]} />
      {t > 76.07 && (
        <div style={{ position: "absolute", left: 60, right: 180, top: 820, textAlign: "center", opacity: entra(t, 76.11) }}>
          <div style={{ display: "inline-block", transform: `scale(${0.6 + 0.4 * entra(t, 77.21, 0.3)})`, fontFamily, fontWeight: 900, fontSize: 58, color: "#111", background: VERDE, borderRadius: 16, padding: "8px 26px", boxShadow: "0 8px 0 #0b3a22" }}>
            ROCKSTAR: ≈ 2× GTA 5
          </div>
          {t > 78.86 && <div style={{ marginTop: 16, fontFamily, fontWeight: 900, fontSize: 64, color: "#fff", textShadow: sombra, transform: `scale(${entra(t, 78.86)})` }}>O RESTO É CHUTE</div>}
        </div>
      )}
    </AbsoluteFill>
  );
};

// ---------- Vyce: facecam ----------
const boca = (f: number) => (dados.boca as number[])[f] ?? 0;
const poseFala = (t: number, extra: Partial<PoseMascote> = {}): PoseMascote => ({
  bracoE: [0.02 - 0.15 * Math.max(0, Math.sin(t * 5.1)), 0, -0.12],
  cotoveloE: 0.4 + 0.2 * Math.sin(t * 4.3),
  bracoD: [-0.5 - 0.25 * Math.max(0, Math.sin(t * 3.7 + 1)), 0, 0.25],
  cotoveloD: 1.1 + 0.25 * Math.sin(t * 5.7),
  tronco: 0.02 * Math.sin(t * 1.9),
  cabeca: [0.04 * Math.sin(t * 3.1) + 0.03 * Math.sin(t * 7.2), 0.12 * Math.sin(t * 1.3), 0.04 * Math.sin(t * 1.1)],
  ...extra,
});
const pisca = (t: number) => {
  const c = t % 4.3;
  return c > 1.4 && c < 1.52;
};
const REACOES = [5.6, 10.0, 44.4, 67.61];
const JANELAS: [number, number][] = [
  [5.4, 13.4], // "faltam 3 dias... o número do mapa"
  [44.2, 46.6], // re-gancho
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

// ---------- Vyce no PC (final) ----------
const Setup: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const a = INICIO_FINAL;
  if (t < a - 0.3) return null;
  const k = suave(t, a - 0.3, a + 0.2);
  const olha = suave(t, a + 0.25, a + 0.7);
  const pos: [number, number, number] = [0.94 - (t - a) * 0.04, 1.5, 4.4 - (t - a) * 0.12];
  return (
    <AbsoluteFill style={{ opacity: k, transform: `scale(${1.2 - 0.2 * k})` }}>
      <Sequence from={Math.round(a * FPS) - 10} layout="none">
        <PalcoCinema ceu="estudio" fundo="#120B22" fov={45} luzCeu={0.25} brilhoCeu={0.05}>
          <Camera pos={pos} alvo={[0.82, 1.12, 0]} />
          <SetupGamer t={t} boca={boca(f)} pisca={pisca(t)} olhaCamera={olha} />
          <Acabamento foco={Math.hypot(pos[0] - 0.2, pos[1] - 1.3, pos[2])} desfoque={4} brilho={0.8} saturacao={0.12} contraste={0.12} vinheta={0.45} ao={0} />
        </PalcoCinema>
      </Sequence>
      <div style={{ position: "absolute", top: 270, left: 60, right: 180, textAlign: "center", color: "#fff", fontFamily, transform: `scale(${0.8 + 0.2 * entra(t, a + 0.2)})`, opacity: entra(t, a + 0.2) }}>
        <div style={{ fontWeight: 800, fontSize: 38, letterSpacing: 8, color: "#E6D2FF", textShadow: sombra }}>VOCÊ ESTÁ NA</div>
        <div style={{ fontWeight: 900, fontSize: 112, lineHeight: 0.95, letterSpacing: -2, textShadow: sombra }}>FASE EXTRA</div>
        <div style={{ fontWeight: 800, fontSize: 40, letterSpacing: 8, marginTop: 8, textShadow: sombra, opacity: entra(t, a + 1.3) }}>COM VYCE</div>
        <div style={{ display: "inline-block", marginTop: 18, fontWeight: 900, fontSize: 40, letterSpacing: 1, color: "#fff", background: "rgba(20,10,40,.7)", border: `3px solid ${ROSA}`, borderRadius: 16, padding: "6px 22px", boxShadow: `0 0 22px ${ROSA}`, opacity: entra(t, a + 1.7), transform: `scale(${0.7 + 0.3 * entra(t, a + 1.7)})` }}>
          @faseextra.br
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- textos soltos ----------
const Selo: React.FC<{ texto: string; cor: string; t: number; de: number }> = ({ texto, cor, t, de }) => {
  const k = entra(t, de, 0.25);
  return (
    <div style={{ display: "inline-block", marginTop: 16, transform: `scale(${0.6 + 0.4 * k}) rotate(${(1 - k) * -8}deg)`, opacity: k, fontFamily, fontWeight: 800, fontSize: 27, letterSpacing: 3, color: "#111", background: cor, padding: "6px 18px", borderRadius: 10, boxShadow: `0 0 24px ${cor}99` }}>
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
const G: React.FC<{ tam: number; children: React.ReactNode; cor?: string }> = ({ tam, children, cor = "#fff" }) => <div style={{ fontWeight: 900, fontSize: Math.round(tam * 0.74), lineHeight: 0.95, letterSpacing: -2, color: cor, textShadow: sombra }}>{children}</div>;
const P: React.FC<{ children: React.ReactNode; cor?: string }> = ({ children, cor = "#F3E8FF" }) => <div style={{ fontWeight: 800, fontSize: 38, letterSpacing: 5, color: cor, textShadow: sombra, marginTop: 6 }}>{children}</div>;
const Faltam: React.FC<{ t: number }> = ({ t }) => {
  if (t < 5.4 || emSetup(t)) return null;
  const k = entra(t, 5.4, 0.35);
  return (
    <div style={{ position: "absolute", top: 260, left: 60, display: "flex", opacity: k }}>
      <div style={{ fontFamily, fontWeight: 900, fontSize: 30, letterSpacing: 3, lineHeight: 1.15, color: "#fff", background: "rgba(20,10,40,.75)", border: `3px solid ${ROSA}`, borderRadius: 22, padding: "10px 20px", boxShadow: `0 0 ${16 + 10 * Math.abs(Math.sin(t * 3))}px ${ROSA}` }}>
        GTA 6
        <br />
        FALTAM <span style={{ color: "#FFB3EE" }}>{DIAS} DIAS</span>
      </div>
    </div>
  );
};

// ---------- legenda ----------
const DESTAQUE = /^(GTA|6|5|200|GB|livres|atrasado|3|dias|jogar|final|número|mapa|pré-download|10|PS5|Xbox|Series|PC|nada|meia-noite|local|Brasil|R\$449,90|R\$549,90|Ultimate|primeiro|dia|abasteça|gasolina|fim|celular|alarme|valor|rastreador|polícia|devagar|travar|história|grana|rua|casa|comprar|esconderijos|fugitivos|selfie|cachorro|dono|não|125|km²|nunca|fã|dois|chute|Fase|Extra|Vyce|noite|19)$/i;
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

// ---------- sons (só nas pausas da voz) ----------
const falando = (t: number) => PAL.some((p) => t >= p.s - 0.04 && t <= p.e + 0.04);
const SONS: { s: string; t: number; v: number }[] = [
  { s: "dum", t: 0.0, v: 0.6 },
  { s: "carimbo", t: 2.95, v: 0.55 },
  { s: "whoosh", t: 5.35, v: 0.4 },
  { s: "carimbo", t: 9.85, v: 0.5 },
  { s: "whoosh", t: 13.45, v: 0.4 },
  { s: "dum", t: 27.8, v: 0.55 },
  ...ITENS.map((i) => ({ s: "dum", t: i.de - 0.05, v: 0.6 })),
  { s: "dum", t: 44.2, v: 0.55 },
  { s: "dum", t: 67.41, v: 0.6 },
  { s: "carimbo", t: 72.21, v: 0.6 },
  { s: "whoosh", t: 80.21, v: 0.45 },
];

const DUCK: number[] = (() => {
  const bruto = Array.from({ length: DURACAO_FASE05 }, (_, i) => (falando(i / FPS) ? 0.42 : 1));
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

export const VideoFase05: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const corte = PLANOS.some((p) => t >= p.de && t < p.de + 2 / FPS) && !emSetup(t) ? 0.2 : 0;
  const impactos = [0, 3.02, 27.89, 44.31, 68.64, 72.26, ...ITENS.map((i) => i.de)];
  const flash = Math.min(0.8, impactos.reduce((m, a) => m + interpolate(t, [a, a + 0.04, a + 0.28], [0, a === 0 ? 0.35 : 0.45, 0], cl), 0));
  const tremor = impactos.reduce((m, a) => (t >= a ? Math.max(m, 1 - suave(t, a, a + 0.35)) : m), 0);
  const tx = Math.sin(t * 83) * 10 * tremor;
  const ty = Math.cos(t * 71) * 8 * tremor;
  const noFundo = !emSetup(t);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ transform: `translate(${tx}px,${ty}px) scale(1.02)` }}>
        {noFundo && <Fundo t={t} />}
        {noFundo && <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,4,24,.78) 0%, rgba(10,4,24,.2) 32%, rgba(10,4,24,.15) 55%, rgba(10,4,24,.82) 100%)" }} />}
      </AbsoluteFill>
      <Setup t={t} f={f} />

      <Download t={t} />
      {/* apresentação */}
      <Bloco t={t} de={5.51} ate={13.4}>
        <G tam={140} cor={AMARELO}><span style={{ whiteSpace: "nowrap" }}>FALTAM 3 DIAS</span></G>
        {t > 6.93 && <P>O QUE SABER ANTES DE JOGAR</P>}
        <Selo texto="NO FINAL: O NÚMERO FALSO DO MAPA" cor={ROSA} t={t} de={9.91} />
      </Bloco>
      <Tarja t={t} de={13.5} ate={27.8} txt="ANTES DO DIA 19" cor="#7CC8FF" />
      <Checklist t={t} />
      <Precos t={t} />
      <Tarja t={t} de={27.89} ate={29.75} txt="NO PRIMEIRO DIA" cor={AMARELO} />
      <Cartao t={t} />
      <Pilulas t={t} de={31.1} ate={34.95} itens={[["CARRO TEM GASOLINA", 31.15], ["SEM GASOLINA NA FUGA = FIM", 32.71]]} />
      <Scanner t={t} />
      <Pilulas t={t} de={40.6} ate={44.2} topo={740} cor={VERMELHO} itens={[["LUXO + RASTREADOR + DEVAGAR = POLÍCIA", 40.65]]} />
      <Bloco t={t} de={44.31} ate={46.6} gancho>
        <P>A PRÓXIMA PODE</P>
        <G tam={150} cor="#FF9D9D">TRAVAR A HISTÓRIA</G>
      </Bloco>
      <Cadeado t={t} />
      <Pilulas t={t} de={49.4} ate={52.4} topo={1100} itens={[["FALTA GRANA", 49.44], ["SE VIRA NA RUA", 51.11]]} />
      <Pilulas t={t} de={54.7} ate={61.71} itens={[["O ESCONDERIJO MUDA", 54.76], ["JASON E LUCIA: FUGITIVOS", 57.82], ["SELFIE: PROIBIDA ✗", 60.78]]} />
      <Pilulas t={t} de={63.81} ate={67.41} itens={[["O DONO PODE DIZER NÃO", 65.29], ["O CACHORRO TAMBÉM", 65.84]]} />
      <Mito t={t} />

      <Faltam t={t} />
      <Facecam t={t} f={f} />
      <Legenda t={t} />

      <AbsoluteFill style={{ background: "#F5E9FF", opacity: flash, pointerEvents: "none" }} />
      <AbsoluteFill style={{ background: "#000", opacity: corte, pointerEvents: "none" }} />

      <Audio src={staticFile("fase-extra/fase05/narracao.wav")} />
      {/* música do trailer, 0,7 (Fase 04) e mais 10% abaixo a pedido do usuário */}
      <Audio src={staticFile("fase-extra/fase05/trilha.wav")} volume={(q) => 0.63 * (DUCK[q] ?? 1)} />
      {SONS.map((s, i) => (
        <Sequence key={i} from={Math.round(s.t * FPS)} durationInFrames={60}>
          <Audio src={staticFile(`fase-extra/sons/${s.s}.wav`)} volume={(q) => s.v * (falando(s.t + q / FPS) ? 0.3 : 1)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
