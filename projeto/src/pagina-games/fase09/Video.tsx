import { loadFont } from "@remotion/google-fonts/Montserrat";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, Audio, Easing, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { Acabamento, PalcoCinema } from "../../cinema/Palco";
import { Camera } from "../Estudio";
import { Mascote3D, PoseMascote } from "../Mascote3D";
import { QuartoGamer } from "../QuartoGamer";
import dados from "./dados.json";

// Fase Extra, Fase 09: "Roubar carro no GTA 6 não é mais apertar um botão" (~53 s).
// Prévias (Rob Nelson, Rockstar North, à IGN): carros em camadas (velho / chave eletrônica / GPS), app que escaneia o
// carro, gasolina (~10 s pra abastecer) e o jeito fácil (puxar o motorista no sinal). Imagens: trechos do gameplay
// oficial "Um Olhar Estendido" que as Fases 07 e 08 não usaram. Final no QuartoGamer com a enquete.
const { fontFamily } = loadFont("normal", { weights: ["600", "800", "900"], subsets: ["latin"] });
export const FPS = 30;
const FIM = dados.duracao + 1.0;
export const DURACAO_FASE09 = Math.ceil(FIM * FPS);
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

const INICIO_FINAL = 45.75; // "Você está na Fase Extra"
const emSetup = (t: number) => t >= INICIO_FINAL;
const CLIPE = (n: string) => `fase-extra/fase09/clipes/claro/${n}.mp4`;

// ---------- planos (gameplay oficial) ----------
type Plano = { de: number; clipe: string; src?: number; x?: number; x2?: number; zoom?: number; chicote?: boolean };
const PLANOS: Plano[] = [
  // gancho: chega no carro, puxa a porta... e nada
  { de: 0.0, clipe: "porta", src: 4.4, x: 0.5, x2: 0.42, zoom: 1.12 },
  // não é mais um botão / um jeito continua fácil
  { de: 4.42, clipe: "noite", src: 2.2, x: 0.5, x2: 0.45, chicote: true },
  { de: 6.75, clipe: "mascarados", src: 8.0, x: 0.45, x2: 0.55, zoom: 1.1 },
  { de: 8.6, clipe: "noite", src: 5.6, x: 0.5, x2: 0.42, chicote: true, zoom: 1.15 },
  // GTA 5
  { de: 9.78, clipe: "garagem", src: 11.0, x: 0.5, x2: 0.45, chicote: true },
  { de: 11.8, clipe: "garagem", src: 14.0, x: 0.45, x2: 0.55, zoom: 1.15 },
  // GTA 6: camadas
  { de: 14.02, clipe: "loja", src: 0.2, x: 0.5, x2: 0.42, chicote: true },
  { de: 15.95, clipe: "loja", src: 2.6, x: 0.45, x2: 0.55, zoom: 1.15 },
  // escada: carro velho / chave eletrônica / GPS
  { de: 17.83, clipe: "porta", src: 11.5, x: 0.5, x2: 0.42, chicote: true },
  { de: 20.53, clipe: "luxo", src: 3.0, x: 0.5, x2: 0.55, chicote: true },
  { de: 22.3, clipe: "luxo", src: 5.5, x: 0.45, x2: 0.5, zoom: 1.15 },
  { de: 24.02, clipe: "fuga", src: 1.0, x: 0.5, x2: 0.42, chicote: true },
  { de: 25.6, clipe: "fuga", src: 6.0, x: 0.45, x2: 0.55, zoom: 1.12 },
  // re-gancho
  { de: 27.26, clipe: "loja", src: 4.2, x: 0.5, x2: 0.45, chicote: true, zoom: 1.1 },
  // app que escaneia
  { de: 29.9, clipe: "loja", src: 5.6, x: 0.45, x2: 0.55, zoom: 1.2 },
  { de: 32.9, clipe: "porta", src: 0.3, x: 0.5, x2: 0.4, chicote: true },
  // gasolina
  { de: 35.6, clipe: "garagem", src: 2.0, x: 0.5, x2: 0.45, chicote: true },
  { de: 37.35, clipe: "garagem", src: 5.8, x: 0.45, x2: 0.55, zoom: 1.15 },
  { de: 38.95, clipe: "noite", src: 3.4, x: 0.5, x2: 0.42, chicote: true },
  // o jeito fácil
  { de: 40.22, clipe: "luxo", src: 0.2, x: 0.5, x2: 0.45, chicote: true },
  { de: 41.15, clipe: "garagem", src: 12.0, x: 0.45, x2: 0.55, zoom: 1.1 },
  { de: 42.53, clipe: "luxo", src: 6.3, x: 0.5, x2: 0.42, chicote: true },
  { de: 44.25, clipe: "garagem", src: 15.3, x: 0.45, x2: 0.55, zoom: 1.12 },
];
const planoEm = (t: number) => {
  let i = 0;
  while (i + 1 < PLANOS.length && PLANOS[i + 1].de <= t) i++;
  return i;
};
const fimDoPlano = (i: number) => Math.min(PLANOS[i + 1]?.de ?? FIM, INICIO_FINAL + 0.4);

// os clipes de noite são muito escuros: clareia cada um até ficar parecido
const CLAREIA: Record<string, number> = { luxo: 1.2, noite: 1.15, mascarados: 1.12, garagem: 1.1, porta: 1.05, loja: 1.05, fuga: 1 };
const filtroClipe = (c: string) => `brightness(${CLAREIA[c] ?? 1.2}) contrast(1.06) saturate(1.18)`;

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
        <OffthreadVideo src={staticFile(CLIPE(p.clipe))} startFrom={Math.round((p.src ?? 0) * FPS)} muted style={{ position: "absolute", width: 1080, height: 1920, left: 0, top: 0, filter: filtroClipe(p.clipe), transform: `scale(${z})`, transformOrigin: `${x * 100}% 50%` }} />
      </AbsoluteFill>
    </Sequence>
  );
};

// ---------- cartões ----------
// GTA 5 x GTA 6
const CartaoJogo: React.FC<{ t: number; de: number; ate: number; jogo: string; ano: string; cor: string; linhas: [string, number, string?][]; riscado?: boolean }> = ({ t, de, ate, jogo, ano, cor, linhas, riscado }) => {
  if (t < de || t > ate) return null;
  const k = entra(t, de, 0.35);
  const sai = suave(t, ate - 0.2, ate);
  return (
    <div style={{ position: "absolute", top: 520, left: 70, right: 170, padding: "24px 22px", borderRadius: 28, background: "rgba(14,8,30,.88)", border: `4px solid ${cor}`, boxShadow: `0 0 34px ${cor}88`, textAlign: "center", fontFamily, opacity: k * (1 - sai), transform: `scale(${0.7 + 0.3 * k})` }}>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "baseline", gap: 18 }}>
        <div style={{ fontWeight: 900, fontSize: 96, color: cor, lineHeight: 1 }}>{jogo}</div>
        <div style={{ fontWeight: 800, fontSize: 40, color: "#bbb" }}>{ano}</div>
      </div>
      {linhas.map(([txt, d, c = "#fff"], i) => {
        const q = entra(t, d, 0.25);
        const risco = riscado ? suave(t, d + 0.5, d + 0.8) : 0;
        return (
          <div key={i} style={{ position: "relative", marginTop: 14, fontWeight: 900, fontSize: 50, lineHeight: 1.05, color: c, opacity: q, transform: `scale(${0.6 + 0.4 * q})`, whiteSpace: "nowrap" }}>
            {txt}
            {riscado && <div style={{ position: "absolute", left: "4%", top: "52%", height: 8, width: `${92 * risco}%`, background: VERMELHO, borderRadius: 4, boxShadow: `0 0 12px ${VERMELHO}` }} />}
          </div>
        );
      })}
    </div>
  );
};

// escada dos 3 tipos de carro
const DEGRAUS: { de: number; icone: string; tipo: string; precisa: string; cor: string }[] = [
  { de: 17.83, icone: "🚗", tipo: "CARRO VELHO", precisa: "FERRAMENTA SIMPLES / QUEBRA O VIDRO", cor: VERDE },
  { de: 20.53, icone: "🔑", tipo: "CHAVE ELETRÔNICA", precisa: "CLONADOR DE CHAVE", cor: AMARELO },
  { de: 24.02, icone: "📡", tipo: "CARRO COM GPS", precisa: "TE ENTREGA NA FUGA", cor: VERMELHO },
];
const Escada: React.FC<{ t: number }> = ({ t }) => {
  const de = 17.8;
  const ate = 27.2;
  if (t < de || t > ate) return null;
  const sai = suave(t, ate - 0.2, ate);
  const atual = DEGRAUS.reduce((m, g, i) => (t >= g.de ? i : m), 0);
  return (
    <div style={{ position: "absolute", top: 470, left: 60, right: 170, display: "flex", flexDirection: "column", gap: 18, opacity: 1 - sai, fontFamily }}>
      {DEGRAUS.map((g, i) => {
        const k = entra(t, g.de, 0.3);
        const ativo = i === atual;
        return (
          <div key={i} style={{ marginLeft: i * 40, display: "flex", alignItems: "center", gap: 16, padding: "14px 18px", borderRadius: 22, background: ativo ? "rgba(20,10,40,.92)" : "rgba(20,10,40,.6)", border: `4px solid ${ativo ? g.cor : "rgba(255,255,255,.2)"}`, boxShadow: ativo ? `0 0 28px ${g.cor}` : "none", opacity: k * (ativo ? 1 : 0.6), transform: `translateX(${(1 - k) * -240}px) scale(${ativo ? 1 : 0.92})`, transformOrigin: "0% 50%" }}>
            <div style={{ fontWeight: 900, fontSize: 40, color: "#111", background: g.cor, borderRadius: 14, width: 64, height: 64, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</div>
            <div style={{ fontSize: 54, lineHeight: 1 }}>{g.icone}</div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 44, color: "#fff", lineHeight: 1.02, whiteSpace: "nowrap" }}>{g.tipo}</div>
              <div style={{ fontWeight: 800, fontSize: 26, letterSpacing: 1, color: g.cor, marginTop: 4, whiteSpace: "nowrap", opacity: entra(t, g.de + 0.6, 0.25) }}>→ {g.precisa}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// celular com o app escaneando o carro
const ITENS_APP: [string, string, string, number][] = [
  ["🔒", "TRANCADO", "SIM", 32.04],
  ["🚨", "ALARME", "SIM", 32.93],
  ["📡", "RASTREADOR", "NÃO", 33.69],
  ["💰", "VALOR DE REVENDA", "$$$", 34.45],
];
const Celular: React.FC<{ t: number }> = ({ t }) => {
  const de = 29.9;
  const ate = 35.55;
  if (t < de || t > ate) return null;
  const k = entra(t, de, 0.4);
  const sai = suave(t, ate - 0.2, ate);
  const W = 560;
  const scan = ((t - de) * 0.9) % 1;
  return (
    <div style={{ position: "absolute", top: 300, left: 160, width: W, opacity: k * (1 - sai), transform: `translateY(${(1 - k) * 300}px) rotate(${-4 + 2 * Math.sin(t * 1.3)}deg)`, fontFamily }}>
      <div style={{ borderRadius: 56, background: "#0B0716", border: "10px solid #2A2238", boxShadow: `0 0 40px ${ROXO}99, 0 30px 60px rgba(0,0,0,.7)`, padding: 18 }}>
        <div style={{ position: "relative", height: 380, borderRadius: 30, overflow: "hidden", background: "#000" }}>
          <Sequence from={Math.round(de * FPS)} layout="none">
            <OffthreadVideo src={staticFile(CLIPE("loja"))} startFrom={Math.round(3.3 * FPS)} playbackRate={0.15} muted style={{ filter: filtroClipe("loja"), position: "absolute", width: 560, height: 996, left: -10, top: -600 }} />
          </Sequence>
          <div style={{ position: "absolute", left: 0, right: 0, top: `${scan * 100}%`, height: 6, background: VERDE, boxShadow: `0 0 24px ${VERDE}, 0 0 60px ${VERDE}` }} />
          {[[20, 20], [460, 20], [20, 300], [460, 300]].map(([x, y], i) => (
            <div key={i} style={{ position: "absolute", left: x, top: y, width: 40, height: 40, borderLeft: x < 100 ? `5px solid ${VERDE}` : undefined, borderRight: x > 100 ? `5px solid ${VERDE}` : undefined, borderTop: y < 100 ? `5px solid ${VERDE}` : undefined, borderBottom: y > 100 ? `5px solid ${VERDE}` : undefined }} />
          ))}
          <div style={{ position: "absolute", left: 16, top: 14, fontWeight: 900, fontSize: 22, letterSpacing: 3, color: "#111", background: VERDE, padding: "3px 10px", borderRadius: 8 }}>ESCANEANDO…</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
          {ITENS_APP.map(([ic, nome, val, d], i) => {
            const q = entra(t, d, 0.25);
            const cor = val === "NÃO" ? VERDE : val === "SIM" ? VERMELHO : AMARELO;
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 16px", borderRadius: 16, background: "rgba(255,255,255,.07)", opacity: q, transform: `translateX(${(1 - q) * 120}px)` }}>
                <div style={{ fontSize: 36 }}>{ic}</div>
                <div style={{ flex: 1, fontWeight: 900, fontSize: 32, color: "#fff", whiteSpace: "nowrap" }}>{nome}</div>
                <div style={{ fontWeight: 900, fontSize: 30, color: "#111", background: cor, padding: "2px 14px", borderRadius: 10 }}>{val}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// marcador de gasolina descendo + 10 segundos
const Gasolina: React.FC<{ t: number }> = ({ t }) => {
  const de = 35.6;
  const ate = 40.15;
  if (t < de || t > ate) return null;
  const k = entra(t, de, 0.35);
  const sai = suave(t, ate - 0.2, ate);
  const nivel = interpolate(t, [de + 0.3, 37.3], [1, 0.06], { ...cl, easing: Easing.in(Easing.quad) });
  const enche = suave(t, 38.6, 40.0);
  const n = Math.max(nivel, enche);
  const ang = -60 + 120 * n;
  const vazio = n < 0.2;
  const seg = Math.min(10, Math.max(0, Math.floor(interpolate(t, [38.6, 39.9], [0, 10], cl))));
  return (
    <div style={{ position: "absolute", top: 470, left: 60, right: 170, display: "flex", flexDirection: "column", alignItems: "center", fontFamily, opacity: k * (1 - sai), transform: `scale(${0.7 + 0.3 * k})` }}>
      <div style={{ position: "relative", width: 520, height: 300, borderRadius: "260px 260px 30px 30px", background: "rgba(14,8,30,.88)", border: `5px solid ${vazio ? VERMELHO : LARANJA}`, boxShadow: `0 0 ${vazio ? 40 : 24}px ${vazio ? VERMELHO : LARANJA}`, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 40, bottom: 30, fontWeight: 900, fontSize: 56, color: VERMELHO }}>E</div>
        <div style={{ position: "absolute", right: 40, bottom: 30, fontWeight: 900, fontSize: 56, color: VERDE }}>F</div>
        <div style={{ position: "absolute", left: "50%", bottom: 40, fontSize: 64, transform: "translateX(-50%)" }}>⛽</div>
        <div style={{ position: "absolute", left: 257, bottom: 70, width: 8, height: 200, background: "#fff", borderRadius: 4, transformOrigin: "50% 100%", transform: `rotate(${ang}deg)`, boxShadow: "0 0 12px #fff" }} />
      </div>
      <div style={{ marginTop: 22, fontWeight: 900, fontSize: 74, color: AMARELO, textShadow: sombra, opacity: entra(t, 38.55), whiteSpace: "nowrap" }}>⏱ {seg}s</div>
      <div style={{ fontWeight: 800, fontSize: 30, letterSpacing: 3, color: "#ddd", textShadow: sombra, opacity: entra(t, 39.4) }}>PRA ENCHER O TANQUE</div>
    </div>
  );
};

// carimbo
const Carimbo: React.FC<{ t: number; de: number; ate: number; texto: string; cor: string; topo?: number }> = ({ t, de, ate, texto, cor, topo = 1010 }) => {
  if (t < de || t > ate) return null;
  const k = interpolate(t, [de, de + 0.12], [0, 1], cl);
  const sai = suave(t, ate - 0.15, ate);
  return (
    <div style={{ position: "absolute", top: topo, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: 1 - sai }}>
      <div style={{ fontFamily, fontWeight: 900, fontSize: 92, color: cor, border: `10px solid ${cor}`, borderRadius: 18, padding: "4px 26px", transform: `rotate(-8deg) scale(${2.4 - 1.4 * k})`, opacity: k, background: "rgba(20,0,4,.55)", whiteSpace: "nowrap" }}>
        {texto}
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
const REACOES = [4.6, 8.7, 27.4];
const JANELAS: [number, number][] = [
  [4.42, 9.75], // não é mais um botão / um jeito fácil / fica até o final
  [27.26, 29.85], // re-gancho: dá pra ver tudo isso
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
const ENQUETE = 48.55;
const OPCOES: [string, string, number, string][] = [
  ["⛽", "GASOLINA", 49.29, LARANJA],
  ["🔑", "CHAVE", 50.02, AMARELO],
  ["📡", "GPS", 50.64, VERMELHO],
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
      {/* enquete */}
      <div style={{ position: "absolute", top: 250, left: 60, right: 180, textAlign: "center", fontFamily, opacity: troca }}>
        <div style={{ fontWeight: 800, fontSize: 36, letterSpacing: 6, color: "#E6D2FF", textShadow: sombra }}>SE DESSE PRA</div>
        <div style={{ fontWeight: 900, fontSize: 92, lineHeight: 0.95, color: "#fff", textShadow: sombra }}>DESLIGAR UM</div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, marginTop: 22 }}>
          {OPCOES.map(([ic, nome, d, cor], i) => {
            const q = entra(t, d, 0.25);
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, fontWeight: 900, fontSize: 46, color: "#fff", background: "rgba(20,10,40,.85)", border: `4px solid ${cor}`, borderRadius: 18, padding: "6px 24px", boxShadow: `0 0 20px ${cor}`, opacity: q, transform: `scale(${0.5 + 0.5 * q})`, whiteSpace: "nowrap" }}>
                <span style={{ color: "#111", background: cor, borderRadius: 10, padding: "0 12px" }}>{i + 1}</span>
                <span>{ic}</span>
                <span>{nome}</span>
              </div>
            );
          })}
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

// ---------- legenda ----------
const DESTAQUE = /^(GTA|6|5|carrão|porta|nada|Roubar|botão|fácil|final|vidro|igual|Rockstar|IGN|camadas|velho|Ferramenta|chave|eletrônica|clona|GPS|entregar|foge|app|celular|escaneia|trancado|alarme|rastreador|vale|gasolina|abastecer|dez|segundos|Carrão|sinal|motorista|nenhuma|Fase|Extra|Vyce|desligar|Comenta)$/i;
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
const SONS: { s: string; t: number; v: number }[] = [
  { s: "dum", t: 0.0, v: 0.6 },
  { s: "carimbo", t: 3.82, v: 0.55 },
  { s: "whoosh", t: 4.4, v: 0.4 },
  { s: "carimbo", t: 8.6, v: 0.5 },
  { s: "whoosh", t: 9.75, v: 0.45 },
  { s: "dum", t: 14.0, v: 0.55 },
  { s: "whoosh", t: 17.8, v: 0.45 },
  { s: "whoosh", t: 20.5, v: 0.45 },
  { s: "whoosh", t: 24.0, v: 0.45 },
  { s: "dum", t: 27.24, v: 0.6 },
  { s: "whoosh", t: 29.88, v: 0.45 },
  { s: "whoosh", t: 35.58, v: 0.45 },
  { s: "dum", t: 40.2, v: 0.6 },
  { s: "carimbo", t: 44.27, v: 0.6 },
  { s: "whoosh", t: INICIO_FINAL - 0.1, v: 0.45 },
];

const DUCK: number[] = (() => {
  const bruto = Array.from({ length: DURACAO_FASE09 }, (_, i) => (falando(i / FPS) ? 0.42 : 1));
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

export const VideoFase09: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const corte = PLANOS.some((p) => p.de > 0 && t >= p.de && t < p.de + 2 / FPS) && !emSetup(t) ? 0.2 : 0;
  const impactos = [0, 3.82, 14.02, 27.26, 44.27];
  const flash = Math.min(0.8, impactos.reduce((m, a) => m + interpolate(t, [a, a + 0.04, a + 0.28], [0, a === 0 ? 0.35 : 0.45, 0], cl), 0));
  const tremor = impactos.reduce((m, a) => (t >= a ? Math.max(m, 1 - suave(t, a, a + 0.35)) : m), 0);
  const tx = Math.sin(t * 83) * 10 * tremor;
  const ty = Math.cos(t * 71) * 8 * tremor;
  const noFundo = !emSetup(t);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ transform: `translate(${tx}px,${ty}px) scale(1.02)` }}>
        {noFundo && <Fundo t={t} />}
        {noFundo && <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,4,24,.5) 0%, rgba(10,4,24,.08) 22%, rgba(10,4,24,0) 50%, rgba(10,4,24,.12) 72%, rgba(10,4,24,.55) 100%)" }} />}
      </AbsoluteFill>
      <Setup t={t} f={f} />

      {/* gancho: puxou a porta... e nada */}
      <Bloco t={t} de={0.1} ate={4.38} gancho topo={250}>
        <P>NO GTA 6</P>
        <G tam={130}>PUXOU A PORTA…</G>
      </Bloco>
      <Carimbo t={t} de={3.82} ate={4.4} texto="🔒 TRANCADO" cor={VERMELHO} topo={760} />
      {/* não é mais um botão / um jeito continua fácil */}
      <Bloco t={t} de={4.45} ate={6.72} gancho>
        <P>ROUBAR CARRO</P>
        <G tam={130} cor={VERMELHO}>≠ 1 BOTÃO</G>
      </Bloco>
      <Bloco t={t} de={6.78} ate={9.72}>
        <P>MAS UM JEITO</P>
        <G tam={130} cor={VERDE}>CONTINUA FÁCIL</G>
        <Selo texto="FICA ATÉ O FINAL" cor={AMARELO} t={t} de={8.62} />
      </Bloco>
      {/* GTA 5 x GTA 6 */}
      <CartaoJogo t={t} de={9.8} ate={13.98} jogo="GTA 5" ano="2013" cor={AZUL} riscado linhas={[["QUEBRA O VIDRO E SAI", 11.42], ["TODO CARRO IGUAL", 12.84]]} />
      <CartaoJogo t={t} de={14.04} ate={17.78} jogo="GTA 6" ano="2026" cor={ROSA} linhas={[["CARROS COM", 16.36], ["CAMADAS DE SEGURANÇA", 16.75, AMARELO]]} />
      <Bloco t={t} de={15.0} ate={17.78} topo={1010}>
        <Selo texto="ROCKSTAR À IGN" cor={AMARELO} t={t} de={15.69} />
      </Bloco>
      <Escada t={t} />
      {/* re-gancho */}
      <Bloco t={t} de={27.3} ate={29.85} gancho>
        <P>ANTES DE ENCOSTAR</P>
        <G tam={130} cor={AMARELO}>VOCÊ JÁ SABE</G>
      </Bloco>
      <Celular t={t} />
      <Gasolina t={t} />
      {/* o jeito fácil */}
      <Bloco t={t} de={40.28} ate={41.12} gancho>
        <G tam={140} cor={VERDE}>O JEITO FÁCIL?</G>
      </Bloco>
      <Bloco t={t} de={41.18} ate={44.2} topo={560}>
        <P>CARRÃO PARADO</P>
        <G tam={130} cor={AMARELO}>NO SINAL</G>
        <div style={{ opacity: entra(t, 42.56) }}>
          <G tam={110} cor={VERDE}>PUXA O MOTORISTA</G>
        </div>
      </Bloco>
      <Carimbo t={t} de={44.27} ate={INICIO_FINAL - 0.05} texto="SEM FERRAMENTA" cor={VERDE} topo={700} />

      <Facecam t={t} f={f} />
      <Legenda t={t} />

      <AbsoluteFill style={{ background: "#F5E9FF", opacity: flash, pointerEvents: "none" }} />
      <AbsoluteFill style={{ background: "#000", opacity: corte, pointerEvents: "none" }} />

      <Audio src={staticFile("fase-extra/fase09/narracao.wav")} />
      {/* música do trailer de lançamento (a preferida dele), no nível das Fases 05 a 08 */}
      <Audio src={staticFile("fase-extra/fase09/trilha.wav")} volume={(q) => 0.63 * (DUCK[q] ?? 1)} />
      {SONS.map((s, i) => (
        <Sequence key={i} from={Math.round(s.t * FPS)} durationInFrames={60}>
          <Audio src={staticFile(`fase-extra/sons/${s.s}.wav`)} volume={(q) => s.v * (falando(s.t + q / FPS) ? 0.3 : 1)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
