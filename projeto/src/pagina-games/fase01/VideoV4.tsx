import { loadFont } from "@remotion/google-fonts/Montserrat";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, Audio, Easing, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { Acabamento, PalcoCinema } from "../../cinema/Palco";
import { Camera } from "../Estudio";
import { Mascote3D, PoseMascote } from "../Mascote3D";
import { SetupGamer } from "../SetupGamer";
import dados from "../fase01-v6-dados.json";
import emenda from "../fase01-emenda.json";
import emenda2 from "../fase01-emenda2.json";

// Fase Extra, Fase 01 (v4): lançamento do GTA 6 com o trailer oficial em tela cheia e o Vyce no canto,
// como facecam de streamer. Trailer e capturas baixados da página de mídia oficial da Rockstar
// (rockstargames.com/VI/media), com o áudio do trailer mudo. Sem cena íntima nem spoiler.
const { fontFamily } = loadFont("normal", { weights: ["600", "800", "900"], subsets: ["latin"] });
export const FPS = 30;
const FIM = dados.duracao + 1.0;
// A frase "o trailer de lançamento" foi trocada e emendada (13/11): o vídeo foi montado no tempo antigo,
// então convertemos tempo real <-> tempo de montagem.
const { A, B_velho, B_novo } = emenda;
const tv1 = (t: number) => (t < A ? t : t < B_novo ? A + ((t - A) * (B_velho - A)) / (B_novo - A) : t + (B_velho - B_novo));
const rv1 = (v: number) => (v < A ? v : v < B_velho ? A + ((v - A) * (B_novo - A)) / (B_velho - A) : v - (B_velho - B_novo));
// 14/11: a 1ª frase virou "Faltam CINCO dias" (postagem em 14/11) e também foi emendada
const { C, Cn } = emenda2;
const paraV5 = (t: number) => (t < Cn ? (t * C) / Cn : t - (Cn - C));
const deV5 = (v: number) => (v < C ? (v * Cn) / C : v + (Cn - C));
const tv = (t: number) => tv1(paraV5(t));
const rv = (v: number) => deV5(rv1(v));
export const DURACAO_FASE01_V4 = Math.ceil(FIM * FPS);
const ROXO = "#B66BFF";
const ROSA = "#FF4FD8";
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const suave = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
const entra = (t: number, a: number, d = 0.3) => interpolate(t, [a, a + d], [0, 1], { ...cl, easing: Easing.out(Easing.back(1.7)) });

// ---------- planos do trailer: [início no vídeo, segundo no trailer, foco horizontal 0–1, inteiro?] ----------
type Plano = { de: number; tr: number; x?: number; inteiro?: boolean; zoom?: number; lento?: number };
const PLANOS: Plano[] = [
  { de: 0.0, tr: 55.9, x: 0.5, zoom: 1.25 }, // biplano com fumaça rosa
  { de: 0.65, tr: 61.0, x: 0.55, zoom: 1.2 }, // explosão à noite
  { de: 1.3, tr: 47.0, x: 0.5, zoom: 1.15 }, // supercarros
  { de: 2.06, tr: 2.9, x: 0.45 }, // estrada da orla
  { de: 3.7, tr: 5.0, x: 0.75 }, // placa "The Keys"
  { de: 5.4, tr: 73.0, x: 0.42, zoom: 1.15 }, // "olha isso!": ação
  { de: 6.5, tr: 14.25, x: 0.5, lento: 0.55 }, // píer com hidroavião
  { de: 8.1, tr: 47.0, inteiro: true }, // rua com supercarros, inteira
  { de: 9.7, tr: 27.0, x: 0.5 }, // Jason e Lucia no conversível
  { de: 11.0, tr: 41.0, x: 0.35 }, // Jason e Lucia no carro
  { de: 12.26, tr: 83.6, inteiro: true }, // tela oficial "November 19, 2026"
  { de: 14.1, tr: 53.4, x: 0.5, zoom: 1.1 }, // telhado à noite (relógio por cima)
  { de: 16.36, tr: 49.6, x: 0.45 }, // moto
  { de: 17.5, tr: 69.0, x: 0.6 }, // helicóptero entre prédios
  { de: 18.7, tr: 5.4, x: 0.55 }, // bicicleta na ponte
  { de: 20.5, tr: 47.6, x: 0.45 }, // supercarros
  { de: 21.6, tr: 71.0, x: 0.3 }, // viatura à noite
  { de: 23.16, tr: 19.2, x: 0.6 }, // lowrider verde
  { de: 24.9, tr: 53.0, x: 0.5 }, // telhado com helicóptero
  { de: 26.2, tr: 9.0, x: 0.6 }, // polindo o barco
  { de: 28.38, tr: 63.0, x: 0.45 }, // grupo no assalto
  { de: 30.1, tr: 56.3, x: 0.55, zoom: 1.1 }, // biplano
  { de: 32.54, tr: 13.0, x: 0.6 }, // no telefone
  { de: 34.0, tr: 61.3, x: 0.55 }, // explosão
];
const FINAL = 36.0; // o Vyce sai do canto e toma a tela
const planoEm = (t: number) => {
  let i = 0;
  while (i + 1 < PLANOS.length && PLANOS[i + 1].de <= t) i++;
  return i;
};

const Trailer: React.FC<{ t: number }> = ({ t }) => {
  const i = planoEm(t);
  const p = PLANOS[i];
  const fim = PLANOS[i + 1]?.de ?? FINAL + 0.6;
  const k = interpolate(t, [p.de, fim], [0, 1], cl);
  const punch = 1 + 0.06 * (1 - suave(t, p.de, p.de + 0.25)); // pancada de zoom no corte
  const z = (p.zoom ?? 1.05) * (1 + 0.06 * k) * punch;
  const W = 3413; // proxy 3413x1920
  const left = -(W - 1080) * (p.x ?? 0.5);
  const src = staticFile("fase-extra/rockstar/trailer-1920.mp4");
  const startFrom = Math.round(p.tr * FPS);
  const dur = Math.max(1, Math.round((rv(fim) - rv(p.de)) * FPS) + 2);
  return (
    <Sequence key={i} from={Math.round(rv(p.de) * FPS)} durationInFrames={dur} layout="none">
      {p.inteiro ? (
        <AbsoluteFill style={{ background: "#000" }}>
          <OffthreadVideo src={src} startFrom={startFrom} muted style={{ position: "absolute", width: W, height: 1920, left, top: 0, filter: "blur(28px) brightness(.45)", transform: "scale(1.2)" }} />
          <OffthreadVideo src={src} startFrom={startFrom} muted style={{ position: "absolute", width: 1080 * 1.0 * z, height: 608 * z, left: (1080 - 1080 * z) / 2, top: 560 - (608 * z - 608) / 2, borderRadius: 18, boxShadow: `0 0 50px ${ROXO}88` }} />
        </AbsoluteFill>
      ) : (
        <AbsoluteFill style={{ overflow: "hidden" }}>
          <OffthreadVideo src={src} startFrom={startFrom} playbackRate={p.lento ?? 1} muted style={{ position: "absolute", width: W, height: 1920, left, top: 0, transform: `scale(${z})`, transformOrigin: `${(p.x ?? 0.5) * 100}% 50%` }} />
        </AbsoluteFill>
      )}
    </Sequence>
  );
};

// ---------- Vyce: facecam no canto ----------
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
const pisca = (t: number) => [1.4, 4.9, 9.1, 13.3, 17.9, 22.8, 27.2, 31.4, 35.6, 39.0].some((p) => t > p && t < p + 0.12);
const LuzFacecam: React.FC = () => (
  <>
    <hemisphereLight args={["#B9A2F2", "#1A1030", 0.9]} />
    <directionalLight position={[-1.2, 2.2, 2.4]} intensity={2.6} color="#F6EEFF" />
    <pointLight position={[1.2, 1.7, 0.6]} intensity={5} color={ROSA} distance={4} />
    <pointLight position={[-1.3, 1.4, 0.2]} intensity={5} color="#5B6CFF" distance={4} />
    <mesh position={[0, 1.4, -1.2]}>
      <planeGeometry args={[6, 4]} />
      <meshStandardMaterial color="#1B1035" />
    </mesh>
  </>
);
const CamFacecam: React.FC<{ t: number }> = ({ t }) => {
  return <Camera pos={[0.1 + 0.05 * Math.sin(t * 0.6), 1.68, 1.22]} alvo={[0, 1.57, 0]} />;
};
const Facecam: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const k = entra(t, 1.9, 0.4);
  const sai = suave(t, FINAL - 0.1, FINAL + 0.5);
  const reage = Math.max(0, 1 - Math.abs(t - 4.85) * 2) + Math.max(0, 1 - Math.abs(t - 8.4) * 2); // "olha isso!", "olha o tamanho"
  if (t < 1.9 || t > FINAL + 0.6) return null;
  const W = 300;
  const H = 360;
  return (
    <div style={{ position: "absolute", left: 1080 - W - 40, top: 250, width: W, height: H, borderRadius: 26, overflow: "hidden", border: `5px solid ${ROXO}`, boxShadow: `0 0 ${30 + 25 * reage}px ${ROXO}, 0 10px 30px rgba(0,0,0,.6)`, transform: `scale(${(0.5 + 0.5 * k) * (1 + 0.05 * reage) * (1 + sai * 0.5)})`, transformOrigin: "100% 0%", opacity: k * (1 - sai), background: "#140a2a" }}>
      <ThreeCanvas width={W} height={H} camera={{ fov: 32, near: 0.05, far: 50 }} gl={{ toneMapping: THREE.ACESFilmicToneMapping, antialias: true }}>
        <CamFacecam t={t} />
        <LuzFacecam />
        <Mascote3D giro={-0.15 + 0.1 * Math.sin(t * 0.7)} pose={poseFala(t, reage > 0.3 ? { bracoD: [-1.6, 0, 0.35], cotoveloD: 1.4 } : {})} boca={boca(f)} pisca={pisca(t)} olhar={0.6} />
      </ThreeCanvas>
      <div style={{ position: "absolute", left: 14, top: 12, fontFamily, fontWeight: 900, fontSize: 20, letterSpacing: 3, color: "#fff", background: ROSA, padding: "3px 10px", borderRadius: 8 }}>● VYCE</div>
    </div>
  );
};

// ---------- final: Vyce sentado jogando no PC, com o trailer no monitor ----------
const Final: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  if (t < FINAL - 0.05) return null;
  const k = suave(t, FINAL, FINAL + 0.5);
  const olha = suave(t, FINAL + 0.25, FINAL + 0.7); // vira do jogo para a câmera e fala com quem assiste
  const pos: [number, number, number] = [0.94 - (t - FINAL) * 0.04, 1.5, 4.4 - (t - FINAL) * 0.12];
  return (
    <AbsoluteFill style={{ opacity: k, transform: `scale(${1.2 - 0.2 * k})` }}>
      <Sequence from={Math.round(rv(FINAL) * FPS) - 2} layout="none">
        <PalcoCinema ceu="estudio" fundo="#120B22" fov={45} luzCeu={0.25} brilhoCeu={0.05}>
          <Camera pos={pos} alvo={[0.82, 1.12, 0]} />
          <SetupGamer t={t} boca={boca(f)} pisca={pisca(t)} olhaCamera={olha} />
          <Acabamento foco={Math.hypot(pos[0] - 0.2, pos[1] - 1.3, pos[2])} desfoque={4} brilho={0.8} saturacao={0.12} contraste={0.12} vinheta={0.45} ao={0} />
        </PalcoCinema>
      </Sequence>
      <div style={{ position: "absolute", top: 270, left: 60, right: 180, textAlign: "center", color: "#fff", fontFamily, transform: `scale(${0.8 + 0.2 * entra(t, FINAL + 0.2)})`, opacity: entra(t, FINAL + 0.2) }}>
        <div style={{ fontWeight: 800, fontSize: 38, letterSpacing: 8, color: "#E6D2FF", textShadow: sombra }}>VOCÊ ESTÁ NA</div>
        <div style={{ fontWeight: 900, fontSize: 112, lineHeight: 0.95, letterSpacing: -2, textShadow: sombra }}>FASE EXTRA</div>
        <div style={{ fontWeight: 800, fontSize: 40, letterSpacing: 8, marginTop: 8, textShadow: sombra, opacity: entra(t, FINAL + 1.6) }}>COM VYCE</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- textos sobre o trailer ----------
const sombra = "0 0 26px rgba(182,107,255,.85), 0 5px 0 #2B0F66, 0 0 8px rgba(0,0,0,.9)";
const Selo: React.FC<{ texto: string; cor: string; t: number; de: number }> = ({ texto, cor, t, de }) => {
  const k = entra(t, de, 0.25);
  return (
    <div style={{ display: "inline-block", marginTop: 18, transform: `scale(${0.6 + 0.4 * k}) rotate(${(1 - k) * -8}deg)`, opacity: k, fontFamily, fontWeight: 800, fontSize: 27, letterSpacing: 3, color: "#111", background: cor, padding: "6px 18px", borderRadius: 10, boxShadow: `0 0 24px ${cor}99` }}>
      {texto}
    </div>
  );
};
const Bloco: React.FC<{ t: number; de: number; ate: number; topo: number; children: React.ReactNode; tremor?: boolean }> = ({ t, de, ate, topo, children, tremor }) => {
  if (t < de - 0.05 || t > ate + 0.05) return null;
  const k = entra(t, de);
  const s = suave(t, ate - 0.15, ate);
  const tx = tremor ? Math.sin(t * 61) * 12 * (1 - suave(t, de + 0.1, de + 0.7)) : 0;
  return <div style={{ position: "absolute", top: tremor ? 430 : 650, left: 60, right: 180, textAlign: "center", color: "#fff", fontFamily, opacity: k * (1 - s), transform: `translateX(${tx}px) scale(${0.7 + 0.3 * k})` }}>{children}</div>;
};
const G: React.FC<{ tam: number; children: React.ReactNode; cor?: string }> = ({ tam, children, cor = "#fff" }) => <div style={{ fontWeight: 900, fontSize: Math.round(tam * 0.74), lineHeight: 0.95, letterSpacing: -2, color: cor, textShadow: sombra }}>{children}</div>;
const P: React.FC<{ children: React.ReactNode }> = ({ children }) => <div style={{ fontWeight: 800, fontSize: 38, letterSpacing: 5, color: "#F3E8FF", textShadow: sombra, marginTop: 6 }}>{children}</div>;
const Contador: React.FC<{ t: number }> = ({ t }) => <>{Math.round(90421491 * interpolate(t, [25.5, 27.8], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) })).toLocaleString("pt-BR")}</>;
const Relogio: React.FC<{ t: number }> = ({ t }) => {
  // contagem até a meia-noite
  const s = Math.max(0, Math.round(interpolate(t, [14.0, 15.6], [10, 0], cl)));
  return <>{s > 0 ? `23:59:${String(60 - s).padStart(2, "0")}` : "00:00"}</>;
};

// selo fixo do topo: contagem regressiva
const Faltam: React.FC<{ t: number }> = ({ t }) => {
  if (t < 2.0 || t > FINAL) return null;
  const k = entra(t, 2.0, 0.35);
  return (
    <div style={{ position: "absolute", top: 260, left: 60, display: "flex", opacity: k * (1 - suave(t, FINAL - 0.3, FINAL)) }}>
      <div style={{ fontFamily, fontWeight: 900, fontSize: 30, letterSpacing: 3, lineHeight: 1.15, color: "#fff", background: "rgba(20,10,40,.75)", border: `3px solid ${ROSA}`, borderRadius: 22, padding: "10px 20px", boxShadow: `0 0 ${16 + 10 * Math.abs(Math.sin(t * 3))}px ${ROSA}` }}>
        GTA 6<br />FALTAM <span style={{ color: "#FFB3EE" }}>5 DIAS</span>
      </div>
    </div>
  );
};

// ---------- legenda ----------
const DESTAQUE = /^(CINCO|5|6|lançamento|isso|Vice|City|tamanho|Jason|Lucia|protagonistas|19|novembro|meia-noite|cidade|PS5|Xbox|pré-download|liberado|liberar|Guinness|90|milhões|24|nunca|visto|novidade|todo|dia|Fase|Extra|Vyce|madrugada)$/i;
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
  const i = BLOCOS.findIndex((b, j) => t >= b[0].s - 0.05 && t < Math.min(BLOCOS[j + 1]?.[0].s ?? 99, b[b.length - 1].e + 0.6) - 0.05);
  if (i < 0) return null;
  const topo = 1240;
  return (
    <div style={{ position: "absolute", top: topo, left: 60, right: 180, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 18px" }}>
      {BLOCOS[i].map((p, j) => {
        const ativo = t >= p.s;
        const dest = DESTAQUE.test(p.w.replace(/[.,?!:]/g, ""));
        const pulo = ativo ? interpolate(t, [p.s, p.s + 0.1, p.s + 0.22], [0.75, 1.15, 1], cl) : 1;
        return (
          <span key={j} style={{ fontFamily, fontWeight: 900, fontSize: 74, lineHeight: 1.08, color: dest ? "#E2B8FF" : "#fff", opacity: ativo ? 1 : 0, transform: `scale(${pulo})`, display: "inline-block", WebkitTextStroke: "10px #000", paintOrder: "stroke fill", textShadow: dest ? "0 0 24px rgba(182,107,255,.95)" : "0 6px 10px rgba(0,0,0,.6)" }}>
            {p.w.replace(/[.,]$/, "")}
          </span>
        );
      })}
    </div>
  );
};

// ---------- sons nas pausas ----------
const falando = (t: number) => PAL.some((p) => t >= p.s - 0.04 && t <= p.e + 0.04);
const SONS: { s: string; t: number; v: number }[] = [
  { s: "dum", t: 0.0, v: 0.6 },
  { s: "whoosh", t: 0.6, v: 0.45 },
  { s: "whoosh", t: 1.25, v: 0.45 },
  { s: "whoosh", t: 6.35, v: 0.4 },
  { s: "whoosh", t: 9.5, v: 0.35 },
  { s: "dum", t: 12.2, v: 0.45 },
  { s: "whoosh", t: 16.2, v: 0.35 },
  { s: "whoosh", t: 18.55, v: 0.35 },
  { s: "carimbo", t: 22.95, v: 0.4 },
  { s: "whoosh", t: 28.2, v: 0.35 },
  { s: "whoosh", t: 32.3, v: 0.35 },
  { s: "dum", t: 35.9, v: 0.55 },
];

// trilha: música do trailer de lançamento (trecho sem fala), abaixa sob a voz e sobe nas pausas
const DUCK: number[] = (() => {
  const bruto = Array.from({ length: DURACAO_FASE01_V4 }, (_, i) => (falando(i / FPS) ? 0.42 : 1));
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

export const VideoFase01V4: React.FC = () => {
  const f = useCurrentFrame();
  const treal = f / FPS;
  const t = tv(treal);
  const corte = PLANOS.some((p) => t >= p.de && t < p.de + 2 / FPS) && t < FINAL ? interpolate(t % 1, [0, 1], [0.5, 0.5]) : 0;
  const flash = interpolate(t, [0, 0.05, 0.35], [0.8, 0.6, 0], cl) + interpolate(t, [12.26, 12.3, 12.6], [0, 0.5, 0], cl) + interpolate(t, [FINAL, FINAL + 0.05, FINAL + 0.4], [0, 0.7, 0], cl);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {t < FINAL + 0.6 && <Trailer t={t} />}
      {/* escurece em cima e embaixo para os textos */}
      {t < FINAL + 0.6 && <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,4,24,.75) 0%, rgba(10,4,24,0) 30%, rgba(10,4,24,0) 55%, rgba(10,4,24,.8) 100%)" }} />}
      <Final t={t} f={f} />

      {/* gancho */}
      <Bloco t={t} de={0.0} ate={2.0} topo={330} tremor>
        <div style={{ fontWeight: 800, fontSize: 60, letterSpacing: 12, color: "#FFE0FA", textShadow: sombra }}>FALTAM</div>
        <G tam={300}>5 DIAS</G>
        <P>PRO GTA 6</P>
      </Bloco>
      <Bloco t={t} de={2.1} ate={5.3} topo={220}>
        <P>TRAILER DE LANÇAMENTO</P>
        <Selo texto="OFICIAL · ROCKSTAR" cor="#4ADE80" t={t} de={2.6} />
      </Bloco>
      <Bloco t={t} de={6.5} ate={9.6} topo={220}>
        <G tam={130}>VICE CITY</G>
        <P>ESTÁ DE VOLTA</P>
      </Bloco>
      <Bloco t={t} de={9.7} ate={12.1} topo={220}>
        <G tam={110}>JASON & LUCIA</G>
        <P>OS PROTAGONISTAS</P>
      </Bloco>
      <Bloco t={t} de={14.0} ate={16.3} topo={260}>
        <P>19 DE NOVEMBRO</P>
        <G tam={180}>
          <Relogio t={t} />
        </G>
        <P>NO HORÁRIO DA SUA CIDADE</P>
      </Bloco>
      <Bloco t={t} de={16.36} ate={18.6} topo={240}>
        <G tam={120}>PS5 · XBOX</G>
        <P>SERIES X|S</P>
      </Bloco>
      <Bloco t={t} de={18.68} ate={22.9} topo={240}>
        <P>PRÉ-DOWNLOAD</P>
        <G tam={130} cor="#B9FFC9">LIBERADO</G>
        <Selo texto="DESDE 10/11 · OFICIAL" cor="#4ADE80" t={t} de={19.5} />
      </Bloco>
      <Bloco t={t} de={23.16} ate={28.3} topo={220}>
        <P>1º TRAILER · 24 HORAS</P>
        <G tam={128}>
          <Contador t={t} />
        </G>
        <P>VIEWS NO YOUTUBE</P>
        <Selo texto="RECORDE GUINNESS" cor="#FACC15" t={t} de={24.9} />
      </Bloco>
      <Bloco t={t} de={28.38} ate={32.4} topo={240}>
        <P>PRÉ-VENDAS</P>
        <G tam={104}>“NUNCA VISTO”</G>
        <Selo texto="TAKE-TWO · 09/11" cor="#4ADE80" t={t} de={30.0} />
      </Bloco>
      <Bloco t={t} de={32.54} ate={35.9} topo={240}>
        <P>AQUI NA FASE EXTRA</P>
        <G tam={130}>NOVIDADE</G>
        <G tam={100} cor="#FFB3EE">TODO DIA</G>
      </Bloco>

      <Faltam t={t} />
      <Facecam t={t} f={f} />
      <Legenda t={treal} />

      <AbsoluteFill style={{ background: "#F5E9FF", opacity: Math.min(0.8, flash), pointerEvents: "none" }} />
      <AbsoluteFill style={{ background: "#000", opacity: corte * 0.4, pointerEvents: "none" }} />

      <Audio src={staticFile("fase-extra/fase01/narracao-v6.wav")} />
      <Audio src={staticFile("fase-extra/fase01/trilha.wav")} volume={(q) => DUCK[q] ?? 1} />
      {SONS.map((s, i) => (
        <Sequence key={i} from={Math.round(rv(s.t) * FPS)} durationInFrames={60}>
          <Audio src={staticFile(`fase-extra/sons/${s.s}.wav`)} volume={(q) => s.v * (falando(rv(s.t) + q / FPS) ? 0.3 : 1)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
