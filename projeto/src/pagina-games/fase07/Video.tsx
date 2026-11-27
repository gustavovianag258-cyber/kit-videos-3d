import { loadFont } from "@remotion/google-fonts/Montserrat";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { Acabamento, PalcoCinema } from "../../cinema/Palco";
import { Camera } from "../Estudio";
import { Mascote3D, PoseMascote } from "../Mascote3D";
import { SetupGamer } from "../SetupGamer";
import dados from "./dados.json";

// Fase Extra, Fase 07: "Eu entrei no GTA 6 antes de todo mundo" (~44 s).
// O Vyce 3D montado DENTRO do gameplay oficial "Um Olhar Estendido": de pé no banco de trás do conversível (gancho)
// e no porta-malas do carro da live do jogo (desfecho). Imagens só desse gameplay, nunca usado antes.
const { fontFamily } = loadFont("normal", { weights: ["600", "800", "900"], subsets: ["latin"] });
export const FPS = 30;
const FIM = dados.duracao + 1.0;
export const DURACAO_FASE07 = Math.ceil(FIM * FPS);
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
const mix = (a: number[], b: number[], k: number) => a.map((v, i) => v + (b[i] - v) * k) as [number, number, number];

const INICIO_FINAL = 36.93; // "Você está na Fase Extra"
const emSetup = (t: number) => t >= INICIO_FINAL;
const CONGELA = 2.62; // "Tá, eu sou montagem": a imagem congela
const FIM_CARRO = 4.25;
const LIVE_DE = 27.05;
const PAYOFF = 33.84;
const CLIPE = (n: string) => `fase-extra/fase07/clipes/${n}.mp4`;

// ---------- planos (todos do gameplay oficial) ----------
type Plano = { de: number; clipe?: string; src?: number; x?: number; x2?: number; zoom?: number; lento?: number; chicote?: boolean; especial?: "carro" | "live" | "payoff" };
const PLANOS: Plano[] = [
  { de: 0.0, especial: "carro" },
  { de: 4.25, clipe: "carro", src: 26.2, x: 0.5, x2: 0.4, zoom: 1.12, chicote: true }, // "gameplay de verdade"
  { de: 5.3, clipe: "corrida", src: 2.6, x: 0.5, x2: 0.55, chicote: true },
  { de: 6.25, clipe: "jetski", src: 5.2, x: 0.5, x2: 0.45, zoom: 1.1 },
  { de: 7.0, clipe: "moto", src: 3.6, x: 0.45, x2: 0.55, chicote: true },
  { de: 7.95, clipe: "carro", src: 5.0, x: 0.5, x2: 0.45 }, // fica até o final
  { de: 9.5, clipe: "carro", src: 8.2, x: 0.45, x2: 0.55, chicote: true },
  // corrida de rua
  { de: 11.3, clipe: "corrida", src: 2.0, x: 0.5, x2: 0.45, zoom: 1.1 },
  { de: 12.75, clipe: "corrida", src: 3.6, x: 0.5, x2: 0.55, chicote: true },
  { de: 14.2, clipe: "corrida", src: 5.0, x: 0.55, x2: 0.45, zoom: 1.2 },
  // moto na terra
  { de: 15.8, clipe: "moto", src: 3.0, x: 0.5, x2: 0.45, chicote: true },
  { de: 17.1, clipe: "moto", src: 4.8, x: 0.45, x2: 0.55, zoom: 1.15 },
  // jet ski
  { de: 18.7, clipe: "jetski", src: 5.0, x: 0.5, x2: 0.4, chicote: true },
  { de: 19.8, clipe: "jetski", src: 6.2, x: 0.45, x2: 0.55, zoom: 1.2 },
  // praia
  { de: 20.9, clipe: "praia", src: 0.6, x: 0.5, x2: 0.4, chicote: true },
  { de: 22.1, clipe: "praia", src: 0.9, x: 0.2, x2: 0.05, zoom: 1.05 },
  // re-gancho
  { de: 23.55, clipe: "carro", src: 18.5, x: 0.5, x2: 0.5, zoom: 1.25, lento: 0.6 },
  // live
  { de: 25.4, clipe: "celular", src: 5.5, x: 0.55, x2: 0.45, chicote: true },
  { de: LIVE_DE, especial: "live" },
  // qualquer confusão vira vídeo
  { de: 30.4, clipe: "carro", src: 29.2, x: 0.5, x2: 0.4, chicote: true },
  { de: 31.5, clipe: "motel", src: 3.0, x: 0.55, x2: 0.45, zoom: 1.1 },
  { de: 32.6, clipe: "motel", src: 5.5, x: 0.5, x2: 0.55, zoom: 1.25, chicote: true },
  // desfecho
  { de: PAYOFF, especial: "payoff" },
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
  if (t > fim || p.especial || !p.clipe) return null;
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

// ---------- Vyce 3D montado na cena ----------
const boca = (f: number) => (dados.boca as number[])[f] ?? 0;
const pisca = (t: number) => {
  const c = t % 4.3;
  return c > 1.4 && c < 1.52;
};
const LuzDeRua: React.FC = () => (
  <>
    <hemisphereLight args={["#CFE2FF", "#7A6A58", 1.05]} />
    <directionalLight position={[-1.5, 4, 4]} intensity={2.1} color="#FFF4E2" />
    <directionalLight position={[2.5, 3, -2.5]} intensity={1.6} color="#FFE9C8" />
  </>
);
// mesmo enquadramento em pixels: px por metro na tela e altura do olho da câmera
const CenaVyce: React.FC<{ pxm: number; yc: number; children: React.ReactNode }> = ({ pxm, yc, children }) => {
  const fov = (2 * Math.atan(1920 / pxm / 2 / 6) * 180) / Math.PI;
  return (
    <AbsoluteFill style={{ filter: "contrast(1.04) saturate(0.92) blur(0.4px)" }}>
      <ThreeCanvas width={1080} height={1920} camera={{ fov, near: 0.05, far: 50 }} gl={{ toneMapping: THREE.ACESFilmicToneMapping, antialias: true, alpha: true }}>
        <Camera pos={[0, yc + 0.35, 6]} alvo={[0, yc, 0]} />
        <LuzDeRua />
        {children}
      </ThreeCanvas>
    </AbsoluteFill>
  );
};

const posePulando = (t: number): { pose: PoseMascote; y: number } => {
  const t2 = Math.min(t, CONGELA);
  const sobe = suave(t2, 0, 0.3);
  const aponta = suave(t2, 0.25, 0.45) * (1 - suave(t2, 1.0, 1.2));
  const ergue = suave(t2, 1.05, 1.3);
  const onda = Math.sin(t2 * 9);
  const repouso = { bE: [0.02, 0, -0.1], bD: [0.02, 0, 0.1] };
  let bD = mix(repouso.bD, [-0.3, 0, 2.2 + 0.3 * Math.sin(t2 * 10)], aponta);
  bD = mix(bD, [-0.25, 0, 2.45 + 0.22 * onda], ergue);
  const bE = mix(repouso.bE, [-0.25, 0, -2.45 - 0.22 * Math.sin(t2 * 9 + 1)], ergue);
  return {
    y: -0.75 * (1 - sobe),
    pose: {
      bracoD: bD,
      bracoE: bE,
      cotoveloD: 0.15 + 0.25 * ergue,
      cotoveloE: 0.2 + 0.25 * ergue,
      tronco: -0.05 * aponta + 0.03 * Math.sin(t2 * 6) * ergue,
      cabeca: [0.05 * Math.sin(t2 * 3.1), 0.1 * Math.sin(t2 * 1.7), 0.06 * Math.sin(t2 * 2.3) * ergue],
    },
  };
};

// tampa do banco de trás + encostos de cabeça: o carro passa NA FRENTE do Vyce
const MASCARA_CARRO =
  "polygon(0 1300px, 300px 1300px, 300px 1250px, 318px 1238px, 492px 1238px, 508px 1250px, 508px 1300px, 575px 1300px, 575px 1250px, 591px 1238px, 756px 1238px, 772px 1250px, 772px 1300px, 1080px 1300px, 1080px 1920px, 0 1920px)";
const PlacaCarro: React.FC<{ t: number; clip?: string }> = ({ t, clip }) => {
  const congelado = t >= CONGELA;
  const cinza = suave(t, CONGELA, CONGELA + 0.25);
  return (
    <AbsoluteFill style={{ clipPath: clip, filter: congelado ? `saturate(${1 - 0.75 * cinza}) contrast(${1 + 0.25 * cinza})` : undefined }}>
      {congelado ? (
        <Img src={staticFile("fase-extra/fase07/congelado.jpg")} style={{ width: 1080, height: 1920 }} />
      ) : (
        <OffthreadVideo src={staticFile(CLIPE("carro"))} startFrom={Math.round(13.0 * FPS)} muted style={{ width: 1080, height: 1920 }} />
      )}
    </AbsoluteFill>
  );
};
const VyceNoCarro: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  if (t >= FIM_CARRO + 0.05) return null;
  const { pose, y } = posePulando(t);
  const congelado = t >= CONGELA;
  const cinza = suave(t, CONGELA, CONGELA + 0.25);
  const glitch = congelado && t < CONGELA + 0.35 ? Math.sin(t * 173) * 22 : 0;
  const zoom = 1 + 0.06 * suave(t, 0, FIM_CARRO);
  return (
    <AbsoluteFill style={{ transform: `scale(${zoom}) translateX(${glitch}px)`, transformOrigin: "50% 60%" }}>
      <PlacaCarro t={t} />
      <AbsoluteFill style={{ filter: congelado ? `saturate(${1 - 0.75 * cinza}) contrast(${1 + 0.25 * cinza})` : undefined }}>
        <CenaVyce pxm={500} yc={1.45}>
          <Mascote3D pos={[0, y, 0]} giro={0.05 * Math.sin(Math.min(t, CONGELA) * 2)} pose={pose} boca={congelado ? 0 : boca(f)} pisca={pisca(t)} olhar={0.6} sorriso />
        </CenaVyce>
      </AbsoluteFill>
      <PlacaCarro t={t} clip={MASCARA_CARRO} />
      {congelado && (
        <AbsoluteFill style={{ background: "repeating-linear-gradient(0deg, rgba(0,0,0,.18) 0 3px, transparent 3px 7px)", opacity: cinza, mixBlendMode: "multiply" }} />
      )}
    </AbsoluteFill>
  );
};

// ---------- a live do jogo (vídeo horizontal mostrado em altura cheia) ----------
const ESC = 1920 / 1080; // 1,778
const W_LIVE = 1920 * ESC;
const LiveCena: React.FC<{ t: number; de: number; src: number; esquerda: (t: number) => number; children?: (dx: number, dy: number) => React.ReactNode; clipOcluir?: (dy: number) => string }> = ({ t, de, src, esquerda, children, clipOcluir }) => {
  const L = esquerda(t);
  const u = src + (t - de);
  // o carro anda um pouco no quadro original: acompanha o porta-malas
  const dx = interpolate(u, [0.5, 2.0, 3.2], [0, 5, 50], { extrapolateLeft: "clamp", extrapolateRight: "extend" }) * ESC;
  const dy = interpolate(u, [0.5, 2.0], [0, 10], cl) * ESC;
  const punch = 1 + 0.06 * (1 - suave(t, de, de + 0.25));
  const video = (clip?: string) => (
    <AbsoluteFill style={{ clipPath: clip, overflow: "hidden" }}>
      <OffthreadVideo src={staticFile(CLIPE("live-h"))} startFrom={Math.round(src * FPS)} muted style={{ position: "absolute", width: W_LIVE, height: 1920, left: L, top: 0 }} />
    </AbsoluteFill>
  );
  return (
    <Sequence from={Math.round(de * FPS)} durationInFrames={Math.round(3.4 * FPS)} layout="none">
      <AbsoluteFill style={{ transform: `scale(${punch})` }}>
        {video()}
        {children?.(L + dx, dy)}
        {clipOcluir && video(clipOcluir(dy))}
      </AbsoluteFill>
    </Sequence>
  );
};
const LiveDoJogo: React.FC<{ t: number }> = ({ t }) => {
  if (t < LIVE_DE || t >= 30.4) return null;
  // começa no carro e corre até o chat em "o chat comenta"
  const esquerda = (q: number) => interpolate(suave(q, 28.55, 29.25), [0, 1], [540 - 0.49 * W_LIVE, 1080 - W_LIVE]);
  return <LiveCena t={t} de={LIVE_DE} src={0} esquerda={esquerda} />;
};

const CHAT: { de: number; nome: string; txt: string; cor: string }[] = [
  { de: 34.2, nome: "@faseextra.br", txt: "QUEM É ESSE ROXO??", cor: ROXO },
  { de: 34.85, nome: "@gtazeiro_br", txt: "KKKKKKKKK", cor: AMARELO },
  { de: 35.5, nome: "@leonida_fan", txt: "ele tá no porta-malas 💀", cor: VERDE },
  { de: 36.1, nome: "@vyce", txt: "eu disse que entrei 😎", cor: ROSA },
];
const PayoffLive: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  if (t < PAYOFF || t >= INICIO_FINAL + 0.4) return null;
  const esquerda = (q: number) => 540 - 0.47 * W_LIVE - 25 * suave(q, PAYOFF, INICIO_FINAL);
  const tudo = suave(t, 35.75, 36.0);
  const onda = Math.sin(t * 8);
  const pose: PoseMascote = {
    bracoD: mix([-0.35, 0, 2.2 + 0.35 * onda], [-0.25, 0, 2.5 + 0.2 * onda], tudo),
    bracoE: mix([-0.6, 0, -0.35], [-0.25, 0, -2.5 - 0.2 * Math.sin(t * 8 + 1)], tudo),
    cotoveloD: 0.55,
    cotoveloE: 0.6 - 0.3 * tudo,
    tronco: 0.04 * Math.sin(t * 5),
    cabeca: [0.05 * Math.sin(t * 3), -0.15 + 0.1 * Math.sin(t * 1.6), 0.05 * Math.sin(t * 2.4)],
  };
  const sobe = suave(t, PAYOFF + 0.1, PAYOFF + 0.45);
  return (
    <>
      <LiveCena
        t={t}
        de={PAYOFF}
        src={0.3}
        esquerda={esquerda}
        clipOcluir={(dy) => `polygon(0 ${1525 + dy}px, 1080px ${1525 + dy}px, 1080px 1920px, 0 1920px)`}
      >
        {(x0, dy) => {
          // porta-malas: x 735–860 do quadro original (lado esquerdo, o cara da live está à direita)
          const sx = x0 + 830 * ESC;
          const wx = (sx - 540) / 430;
          return (
            <AbsoluteFill style={{ transform: `translateY(${dy}px)` }}>
              <CenaVyce pxm={430} yc={2.134}>
                <Mascote3D pos={[wx, -0.55 * (1 - sobe), 0]} giro={0.25} pose={pose} boca={boca(f)} pisca={pisca(t)} olhar={0.6} sorriso />
              </CenaVyce>
            </AbsoluteFill>
          );
        }}
      </LiveCena>
      {/* selo e chat da live (o nosso chat é montagem) */}
      <div style={{ position: "absolute", left: 600, top: 520, width: 440, fontFamily }}>
        <div style={{ display: "inline-block", fontWeight: 900, fontSize: 30, color: "#fff", background: "#E0242E", borderRadius: 8, padding: "4px 14px", marginBottom: 14, opacity: entra(t, PAYOFF + 0.1) }}>LIVE 53k</div>
        {CHAT.map((c, i) => {
          const k = entra(t, c.de, 0.25);
          if (t < c.de) return null;
          return (
            <div key={i} style={{ marginBottom: 12, background: "rgba(10,6,20,.72)", borderRadius: 14, padding: "8px 14px", borderLeft: `6px solid ${c.cor}`, opacity: k, transform: `translateX(${(1 - k) * 60}px)` }}>
              <div style={{ fontWeight: 800, fontSize: 26, color: c.cor }}>{c.nome}</div>
              <div style={{ fontWeight: 900, fontSize: 32, color: "#fff" }}>{c.txt}</div>
            </div>
          );
        })}
      </div>
    </>
  );
};

// ---------- Vyce: facecam ----------
const poseFala = (t: number, extra: Partial<PoseMascote> = {}): PoseMascote => ({
  bracoE: [0.02 - 0.15 * Math.max(0, Math.sin(t * 5.1)), 0, -0.12],
  cotoveloE: 0.4 + 0.2 * Math.sin(t * 4.3),
  bracoD: [-0.5 - 0.25 * Math.max(0, Math.sin(t * 3.7 + 1)), 0, 0.25],
  cotoveloD: 1.1 + 0.25 * Math.sin(t * 5.7),
  tronco: 0.02 * Math.sin(t * 1.9),
  cabeca: [0.04 * Math.sin(t * 3.1) + 0.03 * Math.sin(t * 7.2), 0.12 * Math.sin(t * 1.3), 0.04 * Math.sin(t * 1.1)],
  ...extra,
});
const REACOES = [8.1, 23.65];
const JANELAS: [number, number][] = [
  [7.9, 11.2], // "fica até o final"
  [23.5, 25.35], // re-gancho
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
// carimbo "É MONTAGEM"
const Carimbo: React.FC<{ t: number }> = ({ t }) => {
  const de = 3.4;
  if (t < de || t > FIM_CARRO) return null;
  const k = interpolate(t, [de, de + 0.12], [0, 1], cl);
  return (
    <div style={{ position: "absolute", top: 760, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div style={{ fontFamily, fontWeight: 900, fontSize: 104, color: VERMELHO, border: `10px solid ${VERMELHO}`, borderRadius: 18, padding: "4px 30px", transform: `rotate(-9deg) scale(${2.4 - 1.4 * k})`, opacity: k, background: "rgba(255,255,255,.12)", textShadow: "0 0 18px rgba(0,0,0,.6)", whiteSpace: "nowrap" }}>
        É MONTAGEM
      </div>
    </div>
  );
};

// ---------- legenda ----------
const DESTAQUE = /^(GTA|6|entrei|mundo|montagem|gameplay|verdade|Rockstar|final|lugar|ninguém|corrida|rua|volta|posição|cronômetro|asfalto|moto|terra|Jet|ski|sol|praia|lotada|pegou|live|celular|chat|vivo|confusão|vídeo|real|apareceu|entrei|Fase|Extra|Vyce|primeiro)$/i;
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
  if (t >= PAYOFF && t < INICIO_FINAL) return null; // no desfecho o Vyce ocupa o terço de baixo; o texto vai em cima
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
  { s: "whoosh", t: 0.02, v: 0.45 },
  { s: "carimbo", t: 3.4, v: 0.6 },
  { s: "whoosh", t: 4.2, v: 0.45 },
  { s: "whoosh", t: 7.9, v: 0.4 },
  { s: "dum", t: 11.25, v: 0.55 },
  { s: "whoosh", t: 15.75, v: 0.45 },
  { s: "whoosh", t: 18.65, v: 0.45 },
  { s: "whoosh", t: 20.85, v: 0.45 },
  { s: "dum", t: 23.5, v: 0.6 },
  { s: "whoosh", t: 25.35, v: 0.45 },
  { s: "dum", t: 27.0, v: 0.55 },
  { s: "whoosh", t: 30.35, v: 0.45 },
  { s: "dum", t: PAYOFF - 0.05, v: 0.65 },
  { s: "whoosh", t: INICIO_FINAL - 0.1, v: 0.45 },
];

const DUCK: number[] = (() => {
  const bruto = Array.from({ length: DURACAO_FASE07 }, (_, i) => (falando(i / FPS) ? 0.42 : 1));
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

export const VideoFase07: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const corte = PLANOS.some((p) => p.de > 0 && t >= p.de && t < p.de + 2 / FPS) && !emSetup(t) ? 0.2 : 0;
  const impactos = [0, 3.4, 23.55, LIVE_DE, PAYOFF];
  const flash = Math.min(0.8, impactos.reduce((m, a) => m + interpolate(t, [a, a + 0.04, a + 0.28], [0, a === 0 ? 0.35 : 0.45, 0], cl), 0));
  const tremor = impactos.reduce((m, a) => (t >= a ? Math.max(m, 1 - suave(t, a, a + 0.35)) : m), 0);
  const tx = Math.sin(t * 83) * 10 * tremor;
  const ty = Math.cos(t * 71) * 8 * tremor;
  const noFundo = !emSetup(t);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ transform: `translate(${tx}px,${ty}px) scale(1.02)` }}>
        {noFundo && <Fundo t={t} />}
        {noFundo && <VyceNoCarro t={t} f={f} />}
        {noFundo && <LiveDoJogo t={t} />}
        {noFundo && <PayoffLive t={t} f={f} />}
        {noFundo && <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,4,24,.62) 0%, rgba(10,4,24,.08) 26%, rgba(10,4,24,0) 55%, rgba(10,4,24,.7) 100%)", pointerEvents: "none" }} />}
      </AbsoluteFill>
      <Setup t={t} f={f} />

      {/* gancho */}
      <Bloco t={t} de={0.15} ate={2.6} gancho topo={240}>
        <P>EU ENTREI NO</P>
        <G tam={190} cor={AMARELO}>GTA 6</G>
      </Bloco>
      <Carimbo t={t} />
      <Bloco t={t} de={4.25} ate={7.85} gancho>
        <P>DAQUI PRA FRENTE</P>
        <G tam={150} cor={VERDE}>É GAMEPLAY</G>
        <G tam={150}>DE VERDADE</G>
        <Selo texto="VÍDEO OFICIAL DA ROCKSTAR" cor={AMARELO} t={t} de={6.84} />
      </Bloco>
      <Bloco t={t} de={7.96} ate={11.2}>
        <P>ONDE O VYCE</P>
        <G tam={150} cor={ROSA}>APARECEU?</G>
        <Selo texto="FICA ATÉ O FINAL" cor={AMARELO} t={t} de={8.35} />
      </Bloco>

      <Pilulas t={t} de={11.36} ate={15.6} itens={[["🏁 CORRIDA DE RUA", 12.4, AMARELO], ["VOLTA ✓", 13.36, VERDE], ["POSIÇÃO ✓", 13.95, VERDE], ["CRONÔMETRO ✓", 14.56, VERDE]]} />
      <Pilulas t={t} de={15.82} ate={18.5} itens={[["NÃO É SÓ ASFALTO", 15.9, LARANJA], ["🏍️ MOTO NA TERRA", 17.22, AMARELO]]} />
      <Pilulas t={t} de={18.75} ate={20.8} itens={[["CANSOU?", 18.75, ROSA], ["🌅 JET SKI NO PÔR DO SOL", 19.47, LARANJA]]} />
      <Pilulas t={t} de={20.93} ate={23.4} itens={[["🏖️ PRAIA LOTADA", 21.18, AZUL]]} />
      <Bloco t={t} de={23.55} ate={25.35} gancho>
        <P>MAS O QUE ME</P>
        <G tam={170} cor={ROSA}>PEGOU...</G>
      </Bloco>
      <Pilulas t={t} de={25.42} ate={30.35} topo={250} itens={[["📱 TEM LIVE DENTRO DO JOGO", 26.09, VERMELHO], ["O CHAT COMENTA AO VIVO", 28.87, ROXO]]} />
      <Pilulas t={t} de={30.47} ate={33.75} itens={[["QUALQUER CONFUSÃO", 30.47, LARANJA], ["🎥 VIRA VÍDEO", 31.56, VERMELHO]]} />
      <Bloco t={t} de={PAYOFF} ate={35.72} gancho topo={240}>
        <P>ADIVINHA QUEM</P>
        <G tam={112} cor={AMARELO}>APARECEU NA LIVE?</G>
      </Bloco>
      <Bloco t={t} de={35.78} ate={INICIO_FINAL - 0.05} gancho topo={240}>
        <P>EU DISSE QUE</P>
        <G tam={170} cor={ROSA}>ENTREI 😎</G>
      </Bloco>

      <Facecam t={t} f={f} />
      <Legenda t={t} />

      <AbsoluteFill style={{ background: "#F5E9FF", opacity: flash, pointerEvents: "none" }} />
      <AbsoluteFill style={{ background: "#000", opacity: corte, pointerEvents: "none" }} />

      <Audio src={staticFile("fase-extra/fase07/narracao.wav")} />
      {/* música: "Pré-carregue agora" oficial, no mesmo nível das Fases 05 e 06 */}
      <Audio src={staticFile("fase-extra/fase07/trilha.wav")} volume={(q) => 0.63 * (DUCK[q] ?? 1)} />
      {SONS.map((s, i) => (
        <Sequence key={i} from={Math.round(s.t * FPS)} durationInFrames={60}>
          <Audio src={staticFile(`fase-extra/sons/${s.s}.wav`)} volume={(q) => s.v * (falando(s.t + q / FPS) ? 0.3 : 1)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
