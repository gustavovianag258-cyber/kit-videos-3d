import { loadFont } from "@remotion/google-fonts/Montserrat";
import { useLoader } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, Audio, Easing, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { Acabamento, PalcoCinema } from "../../cinema/Palco";
import { Camera } from "../Estudio";
import { Mascote3D, PoseMascote } from "../Mascote3D";
import { QuartoGamer } from "../QuartoGamer";
import dados from "./dados.json";

// Fase Extra, Fase 08: "Tem gente que vai jogar GTA 6 16 horas antes de você" (~59 s).
// Meia-noite no horário local (Rockstar) → Nova Zelândia primeiro. Relógios NZ x Brasil, globo 3D com a linha da
// meia-noite, Xbox (não garantido), PS5 (conta nova = paga duas vezes), alerta de golpe. Imagens: trechos novos do
// gameplay oficial "Um Olhar Estendido" que a Fase 07 não usou.
const { fontFamily } = loadFont("normal", { weights: ["600", "800", "900"], subsets: ["latin"] });
export const FPS = 30;
const FIM = dados.duracao + 1.0;
export const DURACAO_FASE08 = Math.ceil(FIM * FPS);
const ROXO = "#B66BFF";
const ROSA = "#FF4FD8";
const VERDE = "#4ADE80";
const VERMELHO = "#FF4D5E";
const AMARELO = "#FFD84A";
const LARANJA = "#FF8A3D";
const AZUL = "#7CC8FF";
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const suave = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
const entra = (t: number, a: number, d = 0.3) => interpolate(t, [a, a + d], [0, 1], { ...cl, easing: Easing.out(Easing.back(1.7)) });
const sombra = "0 0 26px rgba(182,107,255,.85), 0 5px 0 #2B0F66, 0 0 8px rgba(0,0,0,.9)";

const INICIO_FINAL = 53.29; // "Você está na Fase Extra"
const emSetup = (t: number) => t >= INICIO_FINAL;
const GLOBO_DE = 16.8;
const GLOBO_ATE = 21.2;
const CLIPE = (n: string) => `fase-extra/fase08/clipes/${n}.mp4`;

// ---------- planos (gameplay oficial; trechos sem falha de arquivo) ----------
type Plano = { de: number; clipe?: string; src?: number; x?: number; x2?: number; zoom?: number; lento?: number; chicote?: boolean; globo?: boolean };
const PLANOS: Plano[] = [
  // gancho: relógios
  { de: 0.0, clipe: "noite", src: 5.0, x: 0.5, x2: 0.45, zoom: 1.15 },
  { de: 1.6, clipe: "corridanoite", src: 0.2, x: 0.5, x2: 0.55, chicote: true },
  { de: 3.7, clipe: "amanhecer", src: 0.0, x: 0.5, x2: 0.45, zoom: 1.1 },
  // não é hack / paga duas vezes
  { de: 5.55, clipe: "corridanoite", src: 4.2, x: 0.5, x2: 0.45, chicote: true },
  { de: 7.3, clipe: "skyline", src: 0.2, x: 0.5, x2: 0.4, zoom: 1.1 },
  { de: 9.4, clipe: "corridanoite", src: 1.6, x: 0.45, x2: 0.55, chicote: true },
  // Rockstar confirmou
  { de: 11.7, clipe: "escritorio", src: 0.5, x: 0.5, x2: 0.4, zoom: 1.15 },
  { de: 14.0, clipe: "noite", src: 5.3, x: 0.45, x2: 0.55, chicote: true, zoom: 1.2 },
  // globo (animação nossa)
  { de: GLOBO_DE, globo: true },
  // relógios: 8 da manhã
  { de: GLOBO_ATE, clipe: "amanhecer", src: 1.5, x: 0.5, x2: 0.4, chicote: true },
  { de: 23.4, clipe: "amanhecer", src: 4.5, x: 0.45, x2: 0.55, zoom: 1.2 },
  // perfil de fã do Alanzoka
  { de: 24.95, clipe: "casal", src: 0.3, x: 0.5, x2: 0.45, chicote: true },
  { de: 27.2, clipe: "estrada", src: 0.5, x: 0.5, x2: 0.55, zoom: 1.12 },
  // Xbox
  { de: 30.3, clipe: "roubo", src: 3.2, x: 0.45, x2: 0.55, chicote: true },
  { de: 32.2, clipe: "perseguicao", src: 0.2, x: 0.5, x2: 0.4 },
  { de: 34.3, clipe: "perseguicao", src: 3.5, x: 0.45, x2: 0.55, chicote: true, zoom: 1.15 },
  // re-gancho
  { de: 36.65, clipe: "helicoptero", src: 0.2, x: 0.5, x2: 0.45, zoom: 1.1 },
  { de: 38.2, clipe: "helicoptero", src: 3.0, x: 0.45, x2: 0.55, chicote: true, zoom: 1.2 },
  // PS5
  { de: 39.7, clipe: "aeroporto", src: 2.2, x: 0.5, x2: 0.4, chicote: true },
  { de: 41.85, clipe: "assalto", src: 0.2, x: 0.45, x2: 0.55 },
  { de: 43.9, clipe: "assalto", src: 3.5, x: 0.5, x2: 0.45, chicote: true },
  { de: 46.0, clipe: "estrada", src: 4.5, x: 0.45, x2: 0.55, zoom: 1.15 },
  // golpe
  { de: 48.2, clipe: "invasao", src: 0.3, x: 0.5, x2: 0.45, chicote: true, zoom: 1.1 },
  { de: 50.85, clipe: "invasao", src: 2.0, x: 0.45, x2: 0.55, zoom: 1.2 },
  { de: 52.3, clipe: "noite", src: 6.0, x: 0.5, x2: 0.45, chicote: true },
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
  if (t > fim || p.globo || !p.clipe) return null;
  const k = interpolate(t, [p.de, fim], [0, 1], cl);
  const punch = 1 + 0.08 * (1 - suave(t, p.de, p.de + 0.25));
  const ch = p.chicote ? 1 - suave(t, p.de, p.de + 0.22) : 0;
  const x = interpolate(k, [0, 1], [p.x ?? 0.5, p.x2 ?? p.x ?? 0.5]);
  const z = (p.zoom ?? 1.06) * (1 + 0.07 * k) * punch;
  const dur = Math.max(1, Math.round((fim - p.de) * FPS) + 2);
  return (
    <Sequence key={i} from={Math.round(p.de * FPS)} durationInFrames={dur} layout="none">
      <AbsoluteFill style={{ overflow: "hidden", filter: ch > 0.02 ? `blur(${10 * ch}px)` : undefined, transform: `translateX(${ch * 260}px)` }}>
        <OffthreadVideo src={staticFile(CLIPE(p.clipe))} startFrom={Math.round((p.src ?? 0) * FPS)} playbackRate={p.lento ?? 1} muted style={{ position: "absolute", width: 1080, height: 1920, left: 0, top: 0, transform: `scale(${z})`, transformOrigin: `${x * 100}% 50%` }} />
      </AbsoluteFill>
    </Sequence>
  );
};

// ---------- relógios: Nova Zelândia x Brasil ----------
const hhmmss = (seg: number) => {
  const s = ((Math.floor(seg) % 86400) + 86400) % 86400;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return [h, m, ss].map((v) => String(v).padStart(2, "0")).join(":");
};
// relógio que vira de 23:59:57 para 00:00:00 (um segundo a cada 0,25 s do vídeo)
const Relogio: React.FC<{ t: number; de: number; lugar: string; alvo: number; dia: [string, string]; brilho: number; cor: string; entraEm: number }> = ({ t, de, lugar, alvo, dia, brilho, cor, entraEm }) => {
  const passo = Math.min(3, Math.max(0, Math.floor((t - de) / 0.25)));
  const virou = passo >= 3;
  const k = entra(t, entraEm, 0.35);
  const pulso = virou ? 1 + 0.06 * (1 - suave(t, de + 0.75, de + 1.05)) : 1;
  return (
    <div style={{ width: 860, margin: "0 auto 26px", padding: "18px 26px", borderRadius: 28, background: "rgba(14,8,30,.82)", border: `4px solid ${brilho > 0.5 ? cor : "rgba(255,255,255,.25)"}`, boxShadow: `0 0 ${10 + 40 * brilho}px ${cor}`, fontFamily, color: "#fff", opacity: k, transform: `translateX(${(1 - k) * -200}px) scale(${pulso})` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontWeight: 900, fontSize: 40, letterSpacing: 3 }}>
          {lugar}
        </div>
        <div style={{ fontWeight: 900, fontSize: 40, color: virou ? AMARELO : "#bbb" }}>{virou ? dia[1] : dia[0]}</div>
      </div>
      <div style={{ fontWeight: 900, fontSize: 150, lineHeight: 1, letterSpacing: -2, color: virou ? cor : "#fff", textShadow: `0 0 ${20 * brilho}px ${cor}`, fontVariantNumeric: "tabular-nums" }}>{hhmmss(alvo - 3 + passo)}</div>
    </div>
  );
};
const PainelRelogios: React.FC<{ t: number; de: number; ate: number; topo: number; brilhoNZ: number; brilhoBR: number; vira?: number }> = ({ t, de, ate, topo, brilhoNZ, brilhoBR, vira }) => {
  if (t < de || t > ate) return null;
  const sai = suave(t, ate - 0.2, ate);
  const v = vira ?? de;
  return (
    <div style={{ position: "absolute", top: topo, left: 0, right: 0, opacity: 1 - sai }}>
      <Relogio t={t} de={v} lugar="NOVA ZELÂNDIA" alvo={0} dia={["18/11", "19/11"]} brilho={brilhoNZ} cor={AMARELO} entraEm={de} />
      <Relogio t={t} de={v} lugar="BRASIL" alvo={8 * 3600} dia={["18/11", "18/11"]} brilho={brilhoBR} cor={VERDE} entraEm={de + 0.15} />
    </div>
  );
};

// ---------- globo 3D com a linha da meia-noite ----------
const NZ = { lat: -36.85, lon: 174.76 };
const rad = (g: number) => (g * Math.PI) / 180;
const local = (lat: number, lon: number, r: number) => [r * Math.cos(rad(lat)) * Math.cos(rad(lon)), r * Math.sin(rad(lat)), -r * Math.cos(rad(lat)) * Math.sin(rad(lon))] as [number, number, number];
const GLOBO_Y = 0.25;
const GLOBO_R = 0.8;
const TILT = -0.62;
const CAM_Z = 4.2;
const FOV = 40;
const centroDe = (t: number) => interpolate(t, [GLOBO_DE, GLOBO_DE + 2.4, GLOBO_ATE], [95, 165, 172], { ...cl, easing: Easing.inOut(Easing.cubic) });
const meiaNoiteEm = (t: number) => interpolate(t, [GLOBO_DE + 0.4, 19.47], [235, NZ.lon], cl); // a linha chega na Nova Zelândia em "meia-noite"
const naTela = (lat: number, lon: number, t: number) => {
  const a = -Math.PI / 2 - rad(centroDe(t));
  const [x, y, z] = local(lat, lon, GLOBO_R);
  const X = x * Math.cos(a) + z * Math.sin(a);
  const Z = -x * Math.sin(a) + z * Math.cos(a);
  const Y1 = y * Math.cos(TILT) - Z * Math.sin(TILT);
  const Z1 = y * Math.sin(TILT) + Z * Math.cos(TILT);
  const Y = Y1 + GLOBO_Y;
  const f = 960 / Math.tan(rad(FOV / 2));
  return { x: 540 + (X / (CAM_Z - Z1)) * f, y: 960 - (Y / (CAM_Z - Z1)) * f, frente: Z1 > 0.15 };
};
const Terra: React.FC<{ t: number }> = ({ t }) => {
  const [dia, luzes] = useLoader(THREE.TextureLoader, [staticFile("fase-extra/fase08/terra/earth_atmos_2048.jpg"), staticFile("fase-extra/fase08/terra/earth_lights_2048.png")]);
  dia.colorSpace = THREE.SRGBColorSpace;
  const a = -Math.PI / 2 - rad(centroDe(t));
  const lm = rad(meiaNoiteEm(t));
  const nz = local(NZ.lat, NZ.lon, GLOBO_R * 1.01);
  const acende = suave(t, 19.4, 19.7);
  return (
    <group position={[0, GLOBO_Y, 0]} rotation={[TILT, 0, 0]}>
      <group rotation={[0, a, 0]}>
        <mesh>
          <sphereGeometry args={[GLOBO_R, 96, 64]} />
          <meshStandardMaterial map={dia} emissiveMap={luzes} emissive={new THREE.Color("#FFD9A0")} emissiveIntensity={0.9} roughness={0.85} />
        </mesh>
        {/* linha da meia-noite (meridiano) */}
        <group rotation={[0, lm, 0]}>
          <mesh rotation={[0, 0, -Math.PI / 2]}>
            <torusGeometry args={[GLOBO_R * 1.012, 0.012, 8, 96, Math.PI]} />
            <meshBasicMaterial color={ROSA} toneMapped={false} />
          </mesh>
          <mesh rotation={[0, 0, -Math.PI / 2]}>
            <torusGeometry args={[GLOBO_R * 1.03, 0.04, 8, 96, Math.PI]} />
            <meshBasicMaterial color={ROSA} transparent opacity={0.25} toneMapped={false} />
          </mesh>
        </group>
        {/* pino da Nova Zelândia */}
        <mesh position={nz}>
          <sphereGeometry args={[0.035 + 0.03 * acende * (1 + 0.3 * Math.sin(t * 12)), 16, 12]} />
          <meshBasicMaterial color={AMARELO} toneMapped={false} />
        </mesh>
      </group>
      {/* brilho da atmosfera */}
      <mesh>
        <sphereGeometry args={[GLOBO_R * 1.06, 64, 32]} />
        <meshBasicMaterial color="#7A5CFF" transparent opacity={0.12} side={THREE.BackSide} />
      </mesh>
    </group>
  );
};
const Globo: React.FC<{ t: number }> = ({ t }) => {
  if (t < GLOBO_DE - 0.1 || t > GLOBO_ATE + 0.1) return null;
  const k = suave(t, GLOBO_DE - 0.1, GLOBO_DE + 0.3);
  const sai = suave(t, GLOBO_ATE - 0.2, GLOBO_ATE + 0.1);
  const zoom = 0.9 + 0.1 * k + 0.08 * suave(t, 19.3, GLOBO_ATE);
  const p = naTela(NZ.lat, NZ.lon, t);
  const rot = entra(t, 19.55, 0.35);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, #1b0f3a 0%, #07040f 70%)", opacity: k * (1 - sai) }}>
      {Array.from({ length: 70 }, (_, i) => (
        <div key={i} style={{ position: "absolute", left: (i * 397) % 1080, top: (i * 733) % 1920, width: 3, height: 3, borderRadius: 2, background: "#fff", opacity: 0.25 + 0.5 * ((i * 37) % 10) / 10 }} />
      ))}
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: `${p.x}px ${p.y}px` }}>
        <ThreeCanvas width={1080} height={1920} camera={{ fov: FOV, near: 0.1, far: 50, position: [0, 0, CAM_Z] }} gl={{ toneMapping: THREE.ACESFilmicToneMapping, antialias: true, alpha: true }}>
          <ambientLight intensity={0.9} />
          <directionalLight position={[-3, 2, 3]} intensity={2.4} color="#FFF4E2" />
          <Terra t={t} />
        </ThreeCanvas>
        {p.frente && rot > 0.01 && (
          <div style={{ position: "absolute", left: p.x + 26, top: p.y - 30, fontFamily, fontWeight: 900, fontSize: 40, color: "#111", background: AMARELO, padding: "6px 16px", borderRadius: 12, boxShadow: `0 0 26px ${AMARELO}`, transform: `scale(${rot})`, transformOrigin: "0% 50%", whiteSpace: "nowrap" }}>
            1º A BATER 00:00
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- cartões ----------
const CartaoRockstar: React.FC<{ t: number }> = ({ t }) => {
  const de = 11.75;
  const ate = 16.7;
  if (t < de || t > ate) return null;
  const k = entra(t, de, 0.35);
  const sai = suave(t, ate - 0.2, ate);
  const linha = (txt: string, d: number, tam: number, cor = "#fff") => (
    <div style={{ fontWeight: 900, fontSize: tam, lineHeight: 1.02, color: cor, opacity: entra(t, d, 0.25), transform: `scale(${0.6 + 0.4 * entra(t, d, 0.25)})`, whiteSpace: "nowrap" }}>{txt}</div>
  );
  return (
    <div style={{ position: "absolute", top: 560, left: 70, right: 170, padding: "26px 20px", borderRadius: 28, background: "rgba(14,8,30,.86)", border: `4px solid ${AMARELO}`, boxShadow: `0 0 34px ${AMARELO}88`, textAlign: "center", fontFamily, opacity: k * (1 - sai), transform: `scale(${0.7 + 0.3 * k})` }}>
      <div style={{ display: "inline-block", fontWeight: 800, fontSize: 26, letterSpacing: 3, color: "#111", background: AMARELO, padding: "4px 14px", borderRadius: 8, marginBottom: 12 }}>✔ SUPORTE OFICIAL DA ROCKSTAR</div>
      {linha("MEIA-NOITE", 12.3, 104, AMARELO)}
      {linha("DO DIA 19/11", 14.84, 64)}
      {linha("NO HORÁRIO LOCAL", 15.58, 56, ROSA)}
      <div style={{ marginTop: 10, fontWeight: 800, fontSize: 28, letterSpacing: 2, color: "#ddd", opacity: entra(t, 15.9) }}>PS5 · XBOX SERIES X|S</div>
    </div>
  );
};
const CartaoLive: React.FC<{ t: number }> = ({ t }) => {
  const de = 24.96;
  const ate = 30.25;
  if (t < de || t > ate) return null;
  const k = entra(t, de + 0.6, 0.35);
  const sai = suave(t, ate - 0.2, ate);
  const pisc = 0.6 + 0.4 * Math.abs(Math.sin(t * 5));
  return (
    <div style={{ position: "absolute", top: 600, left: 70, right: 170, fontFamily, opacity: k * (1 - sai), transform: `translateY(${(1 - k) * 80}px)` }}>
      <div style={{ borderRadius: 26, background: "rgba(14,8,30,.9)", border: `4px solid ${VERMELHO}`, boxShadow: `0 0 30px ${VERMELHO}88`, padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ fontWeight: 900, fontSize: 30, color: "#fff", background: VERMELHO, borderRadius: 8, padding: "3px 12px", opacity: pisc }}>● LIVE</div>
          <div style={{ fontWeight: 800, fontSize: 26, color: "#ccc" }}>perfil de fã avisa</div>
        </div>
        <div style={{ fontWeight: 900, fontSize: 62, color: "#fff", marginTop: 10, lineHeight: 1.02 }}>ALANZOKA</div>
        <div style={{ fontWeight: 900, fontSize: 54, color: AMARELO, lineHeight: 1.05, opacity: entra(t, 28.29), whiteSpace: "nowrap" }}>ÀS 8H DO DIA 18</div>
      </div>
    </div>
  );
};
const Alerta: React.FC<{ t: number }> = ({ t }) => {
  const de = 48.27;
  const ate = 53.2;
  if (t < de || t > ate) return null;
  const k = entra(t, de, 0.3);
  const sai = suave(t, ate - 0.2, ate);
  const pisca = 0.55 + 0.45 * Math.abs(Math.sin(t * 7));
  return (
    <div style={{ position: "absolute", top: 560, left: 70, right: 170, textAlign: "center", fontFamily, opacity: k * (1 - sai), transform: `scale(${0.6 + 0.4 * k})` }}>
      <div style={{ borderRadius: 28, background: "rgba(40,4,10,.88)", border: `5px solid rgba(255,77,94,${pisca})`, boxShadow: `0 0 ${20 + 30 * pisca}px ${VERMELHO}`, padding: "22px 18px" }}>
        <div style={{ fontSize: 90, lineHeight: 1 }}>⚠️</div>
        <div style={{ fontWeight: 900, fontSize: 50, color: "#fff", lineHeight: 1.05 }}>GIFT CARD DE LOJA</div>
        <div style={{ fontWeight: 900, fontSize: 50, color: "#fff", lineHeight: 1.05 }}>DESCONHECIDA</div>
        <div style={{ fontWeight: 900, fontSize: 64, color: VERMELHO, marginTop: 6, opacity: entra(t, 49.6), whiteSpace: "nowrap" }}>= RISCO DE GOLPE</div>
      </div>
      <div style={{ marginTop: 22, fontWeight: 900, fontSize: 56, color: AMARELO, textShadow: sombra, opacity: entra(t, 50.89), transform: `scale(${0.6 + 0.4 * entra(t, 50.89)})`, whiteSpace: "nowrap" }}>16 HORAS VALEM?</div>
    </div>
  );
};
// carimbo "PAGA 2 VEZES"
const Carimbo: React.FC<{ t: number }> = ({ t }) => {
  const de = 46.98;
  const ate = 48.2;
  if (t < de || t > ate) return null;
  const k = interpolate(t, [de, de + 0.12], [0, 1], cl);
  return (
    <div style={{ position: "absolute", top: 1010, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div style={{ fontFamily, fontWeight: 900, fontSize: 92, color: VERMELHO, border: `10px solid ${VERMELHO}`, borderRadius: 18, padding: "4px 26px", transform: `rotate(-8deg) scale(${2.4 - 1.4 * k})`, opacity: k, background: "rgba(20,0,4,.55)", whiteSpace: "nowrap" }}>
        PAGA 2 VEZES 💸
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
const REACOES = [5.7, 9.85, 36.8];
const JANELAS: [number, number][] = [
  [5.5, 11.7], // não é hack / paga duas vezes / fica até o final
  [36.6, 39.7], // re-gancho: o PlayStation
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
  const pos: [number, number, number] = [0.45 - (t - a) * 0.06, 1.5, 3.6 - (t - a) * 0.1];
  return (
    <AbsoluteFill style={{ opacity: k, transform: `scale(${1.2 - 0.2 * k})` }}>
      <Sequence from={Math.round(a * FPS) - 10} layout="none">
        <PalcoCinema ceu="estudio" fundo="#0B1016" fov={45} luzCeu={0.2} brilhoCeu={0.03}>
          <Camera pos={pos} alvo={[-0.5, 1.12, -0.15]} />
          <QuartoGamer t={t} boca={boca(f)} pisca={pisca(t)} olhaCamera={olha} />
          <Acabamento foco={Math.hypot(pos[0] + 0.2, pos[1] - 1.3, pos[2])} desfoque={4} brilho={0.8} saturacao={0.15} contraste={0.12} vinheta={0.45} ao={0} />
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

// ---------- textos ----------
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
const P: React.FC<{ children: React.ReactNode; cor?: string }> = ({ children, cor = "#F3E8FF" }) => <div style={{ fontWeight: 800, fontSize: 38, letterSpacing: 5, color: cor, textShadow: sombra, marginTop: 6 }}>{children}</div>;
const Pilulas: React.FC<{ t: number; de: number; ate: number; itens: [string, number, string?][]; topo?: number }> = ({ t, de, ate, itens, topo = 690 }) => {
  if (t < de || t > ate) return null;
  const sai = suave(t, ate - 0.2, ate);
  return (
    <div style={{ position: "absolute", left: 60, right: 180, top: topo, display: "flex", flexDirection: "column", alignItems: "center", gap: 14, opacity: 1 - sai }}>
      {itens.map(([txt, d, cor = ROSA], i) => {
        const k = entra(t, d, 0.25);
        return (
          <span key={i} style={{ fontFamily, fontWeight: 900, fontSize: 42, color: "#fff", background: "rgba(20,10,40,.85)", border: `3px solid ${cor}`, borderRadius: 14, padding: "6px 18px", boxShadow: `0 0 16px ${cor}`, opacity: k, transform: `scale(${0.5 + 0.5 * k})`, whiteSpace: "nowrap" }}>
            {txt}
          </span>
        );
      })}
    </div>
  );
};

// ---------- legenda ----------
const DESTAQUE = /^(GTA|6|16|horas|antes|Rockstar|deixou|hack|vazamento|detalhe|pagar|duas|vezes|final|meia-noite|19|local|lugar|Terra|redonda|primeiro|Nova|Zelândia|oito|manhã|18|Alanzoka|Live|8|Xbox|localização|ninguém|funciona|PlayStation|perigo|região|conta|nova|novo|cuidado|gift|card|risco|Fase|Extra|Vyce|tentar|esperar)$/i;
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
  { s: "carimbo", t: 0.75, v: 0.45 },
  { s: "dum", t: 1.62, v: 0.6 },
  { s: "whoosh", t: 5.5, v: 0.4 },
  { s: "carimbo", t: 10.6, v: 0.5 },
  { s: "whoosh", t: 11.65, v: 0.45 },
  { s: "whoosh", t: GLOBO_DE - 0.05, v: 0.5 },
  { s: "dum", t: 19.42, v: 0.6 },
  { s: "whoosh", t: GLOBO_ATE - 0.05, v: 0.45 },
  { s: "whoosh", t: 24.9, v: 0.45 },
  { s: "whoosh", t: 30.25, v: 0.45 },
  { s: "dum", t: 36.6, v: 0.6 },
  { s: "whoosh", t: 39.65, v: 0.45 },
  { s: "carimbo", t: 46.95, v: 0.6 },
  { s: "dum", t: 48.2, v: 0.6 },
  { s: "whoosh", t: INICIO_FINAL - 0.1, v: 0.45 },
];

const DUCK: number[] = (() => {
  const bruto = Array.from({ length: DURACAO_FASE08 }, (_, i) => (falando(i / FPS) ? 0.42 : 1));
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

export const VideoFase08: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const corte = PLANOS.some((p) => p.de > 0 && t >= p.de && t < p.de + 2 / FPS) && !emSetup(t) ? 0.2 : 0;
  const impactos = [0, 0.75, 1.64, 19.47, 36.71, 46.98];
  const flash = Math.min(0.8, impactos.reduce((m, a) => m + interpolate(t, [a, a + 0.04, a + 0.28], [0, a === 0 ? 0.35 : 0.45, 0], cl), 0));
  const tremor = impactos.reduce((m, a) => (t >= a ? Math.max(m, 1 - suave(t, a, a + 0.35)) : m), 0);
  const tx = Math.sin(t * 83) * 10 * tremor;
  const ty = Math.cos(t * 71) * 8 * tremor;
  const noFundo = !emSetup(t);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ transform: `translate(${tx}px,${ty}px) scale(1.02)` }}>
        {noFundo && <Fundo t={t} />}
        {noFundo && <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,4,24,.72) 0%, rgba(10,4,24,.25) 30%, rgba(10,4,24,.2) 55%, rgba(10,4,24,.8) 100%)" }} />}
        <Globo t={t} />
      </AbsoluteFill>
      <Setup t={t} f={f} />

      {/* gancho: os dois relógios */}
      <Bloco t={t} de={0.1} ate={5.4} gancho topo={240}>
        <G tam={190} cor={AMARELO}>16 HORAS</G>
        <P>ANTES DE VOCÊ</P>
        <Selo texto="E FOI A ROCKSTAR QUE DEIXOU" cor={ROSA} t={t} de={3.9} />
      </Bloco>
      <PainelRelogios t={t} de={0.0} ate={5.4} topo={600} brilhoNZ={1} brilhoBR={suave(t, 0.8, 1.1)} vira={0.0} />
      {/* não é hack / paga duas vezes */}
      <Bloco t={t} de={5.62} ate={7.3} gancho>
        <G tam={120} cor={VERMELHO}>✗ HACK</G>
        <G tam={120} cor={VERMELHO}>✗ VAZAMENTO</G>
      </Bloco>
      <Bloco t={t} de={7.33} ate={11.65}>
        <P>PODE PAGAR O JOGO</P>
        <G tam={190} cor={AMARELO}>2 VEZES</G>
        <Selo texto="FICA ATÉ O FINAL" cor={AMARELO} t={t} de={10.65} />
      </Bloco>
      <CartaoRockstar t={t} />
      {/* globo */}
      <Bloco t={t} de={17.42} ate={GLOBO_ATE - 0.1} topo={250}>
        <P>A TERRA É</P>
        <G tam={150} cor={AZUL}>REDONDA</G>
      </Bloco>
      {/* relógios de novo: 8 da manhã do dia 18 */}
      <PainelRelogios t={t} de={GLOBO_ATE} ate={24.95} topo={620} brilhoNZ={suave(t, 21.85, 22.1)} brilhoBR={suave(t, 23.45, 23.7)} vira={21.3} />
      <Bloco t={t} de={24.4} ate={24.95} topo={250}>
        <G tam={130} cor={VERDE}>8H DO DIA 18</G>
      </Bloco>
      <CartaoLive t={t} />
      {/* Xbox */}
      <Bloco t={t} de={30.35} ate={36.5} topo={250}>
        <G tam={140} cor={VERDE}>XBOX</G>
      </Bloco>
      <Pilulas t={t} de={30.35} ate={36.5} itens={[["LOCALIZAÇÃO → NOVA ZELÂNDIA", 31.98, VERDE], ["🔄 REINICIA O CONSOLE", 34.0, AZUL], ["⚠ NINGUÉM GARANTIU", 35.05, VERMELHO]]} />
      {/* re-gancho */}
      <Bloco t={t} de={37.3} ate={39.65} gancho>
        <P>PLAYSTATION:</P>
        <G tam={150} cor={VERMELHO}>O PERIGO</G>
      </Bloco>
      {/* PS5 */}
      <Bloco t={t} de={39.71} ate={47.95} topo={250}>
        <G tam={140} cor={AZUL}>PS5</G>
      </Bloco>
      <Pilulas t={t} de={39.71} ate={46.9} itens={[["CONTA BR: NÃO MUDA DE REGIÃO ✗", 40.25, VERMELHO], ["CONTA NOVA: NOVA ZELÂNDIA", 42.35, AZUL], ["COMPRA O JOGO DE NOVO", 43.95, LARANJA]]} />
      <Bloco t={t} de={46.0} ate={47.95}>
        <P>JÁ COMPROU AQUI?</P>
      </Bloco>
      <Carimbo t={t} />
      <Alerta t={t} />

      <Facecam t={t} f={f} />
      <Legenda t={t} />

      <AbsoluteFill style={{ background: "#F5E9FF", opacity: flash, pointerEvents: "none" }} />
      <AbsoluteFill style={{ background: "#000", opacity: corte, pointerEvents: "none" }} />

      <Audio src={staticFile("fase-extra/fase08/narracao.wav")} />
      {/* música: animação oficial da arte de capa (a mesma base da Fase 06), no mesmo nível das Fases 05 a 07 */}
      <Audio src={staticFile("fase-extra/fase08/trilha.wav")} volume={(q) => 0.63 * (DUCK[q] ?? 1)} />
      {SONS.map((s, i) => (
        <Sequence key={i} from={Math.round(s.t * FPS)} durationInFrames={60}>
          <Audio src={staticFile(`fase-extra/sons/${s.s}.wav`)} volume={(q) => s.v * (falando(s.t + q / FPS) ? 0.3 : 1)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
