import { loadFont } from "@remotion/google-fonts/Montserrat";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, Audio, Easing, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { Acabamento, PalcoCinema } from "../../cinema/Palco";
import { Camera } from "../Estudio";
import { Mascote3D, PoseMascote } from "../Mascote3D";
import { SetupGamer } from "../SetupGamer";
import dados from "./dados.json";

// Fase Extra, Fase 02: "O primeiro dia de GTA 6 vai ser estranho" (~71 s).
// Mesmo padrão da Fase 01 final: trailer oficial da Rockstar (áudio mudo) em tela cheia, Vyce em facecam
// no canto de cima à direita, tudo dentro da área segura do TikTok/Reels, setup gamer às 4 da manhã e no fim.
const { fontFamily } = loadFont("normal", { weights: ["600", "800", "900"], subsets: ["latin"] });
export const FPS = 30;
const FIM = dados.duracao + 1.0;
export const DURACAO_FASE02 = Math.ceil(FIM * FPS);
const ROXO = "#B66BFF";
const ROSA = "#FF4FD8";
const DIAS = 5; // postagem em 14/11
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const suave = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
const entra = (t: number, a: number, d = 0.3) => interpolate(t, [a, a + d], [0, 1], { ...cl, easing: Easing.out(Easing.back(1.7)) });

// trechos com o Vyce no PC (em vez do trailer)
const SETUPS: [number, number][] = [
  [47.3, 50.75], // "às 4 da manhã"
  [64.95, FIM], // final
];
const emSetup = (t: number) => SETUPS.find(([a, b]) => t >= a && t < b);

// ---------- planos do trailer (segundos conferidos no catálogo de 0,5 s) ----------
type Plano = { de: number; tr: number; x?: number; inteiro?: boolean; zoom?: number; lento?: number };
const PLANOS: Plano[] = [
  { de: 0.0, tr: 18.0, x: 0.5, zoom: 1.2 }, // cidade à noite (19/11)
  { de: 0.8, tr: 55.3, x: 0.5, zoom: 1.2 }, // biplano na praia
  { de: 1.6, tr: 47.0, x: 0.55, zoom: 1.15 }, // supercarros
  { de: 2.4, tr: 49.1, x: 0.5, zoom: 1.1 }, // moto saltando
  { de: 3.24, tr: 58.5, x: 0.5, lento: 0.6 }, // largado no sofá ("faltando no trabalho")
  { de: 5.2, tr: 21.0, x: 0.5, zoom: 1.1 }, // iguana na estrada ("doença chamada GTA 6")
  { de: 7.22, tr: 30.2, x: 0.45 }, // luz verde, mistério
  { de: 9.7, tr: 35.0, x: 0.5, lento: 0.7 }, // silhueta no cofre ("fica até o final")
  { de: 11.82, tr: 17.6, inteiro: true, lento: 0.5 }, // cidade à noite inteira ("meia-noite")
  { de: 14.54, tr: 64.0, x: 0.5 }, // rua à noite ("outro lado do mundo")
  { de: 16.9, tr: 70.0, x: 0.55 }, // vista aérea à noite ("encara o relógio")
  { de: 18.78, tr: 2.6, x: 0.45 }, // estrada da orla ("13 anos")
  { de: 21.86, tr: 32.6, x: 0.5 }, // tapa ("errar tudo")
  { de: 24.54, tr: 61.0, x: 0.55, zoom: 1.15 }, // explosão ("confusão")
  { de: 26.92, tr: 61.5, x: 0.45, lento: 0.55 }, // grupo do assalto ("GTA 5 abre num assalto")
  { de: 28.98, tr: 28.6, x: 0.5 }, // pântano ao pôr do sol ("Red Dead 2")
  { de: 30.58, tr: 5.0, x: 0.5 }, // marina vista do alto ("soltar a sua mão")
  { de: 32.16, tr: 68.6, x: 0.6, lento: 0.8 }, // helicóptero entre prédios ("prédio mais alto")
  { de: 34.4, tr: 18.2, inteiro: true }, // Vice City à noite, inteira
  { de: 35.52, tr: 47.4, x: 0.5 }, // supercarros ("bater o carro")
  { de: 37.48, tr: 71.5, x: 0.4 }, // viatura à noite ("polícia nova")
  { de: 38.6, tr: 48.0, x: 0.55 }, // viatura de dia
  { de: 40.02, tr: 72.95, x: 0.42, zoom: 1.15, lento: 0.7 }, // Lucia atirando ("só a primeira hora")
  { de: 40.95, tr: 53.0, x: 0.5, zoom: 1.1 }, // explosão no telhado
  { de: 41.92, tr: 28.8, x: 0.6 }, // pântano ("caçando segredo")
  { de: 44.46, tr: 54.0, x: 0.5 }, // laser verde
  { de: 45.18, tr: 54.5, x: 0.5 }, // laser vermelho ("sempre esconde alguma coisa")
  { de: 50.84, tr: 62.9, x: 0.55, lento: 0.45 }, // pôr do sol ("no dia seguinte")
  { de: 52.3, tr: 59.0, x: 0.5 }, // largado no sofá ("escritório")
  { de: 54.46, tr: 18.3, x: 0.5, lento: 0.6 }, // cidade à noite, lento (payoff)
  { de: 56.06, tr: 40.6, x: 0.35 }, // Jason e Lucia ("quem jogou o GTA 5 em 2013")
  { de: 58.5, tr: 26.6, x: 0.5 }, // Lucia no conversível ("quem nasceu depois")
  { de: 61.88, tr: 55.4, inteiro: true, lento: 0.7 }, // praia com biplano, inteira ("todo mundo perdido junto")
];
const planoEm = (t: number) => {
  let i = 0;
  while (i + 1 < PLANOS.length && PLANOS[i + 1].de <= t) i++;
  return i;
};
const fimDoPlano = (i: number) => {
  const prox = PLANOS[i + 1]?.de ?? FIM;
  const s = SETUPS.find(([a]) => a > PLANOS[i].de && a < prox);
  return s ? s[0] + 0.4 : prox;
};

const Trailer: React.FC<{ t: number }> = ({ t }) => {
  const i = planoEm(t);
  const p = PLANOS[i];
  const fim = fimDoPlano(i);
  if (t > fim) return null;
  const k = interpolate(t, [p.de, fim], [0, 1], cl);
  const punch = 1 + 0.06 * (1 - suave(t, p.de, p.de + 0.25));
  const z = (p.zoom ?? 1.05) * (1 + 0.06 * k) * punch;
  const W = 3413;
  const left = -(W - 1080) * (p.x ?? 0.5);
  const src = staticFile("fase-extra/rockstar/trailer-1920.mp4");
  const startFrom = Math.round(p.tr * FPS);
  const dur = Math.max(1, Math.round((fim - p.de) * FPS) + 2);
  return (
    <Sequence key={i} from={Math.round(p.de * FPS)} durationInFrames={dur} layout="none">
      {p.inteiro ? (
        <AbsoluteFill style={{ background: "#000" }}>
          <OffthreadVideo src={src} startFrom={startFrom} playbackRate={p.lento ?? 1} muted style={{ position: "absolute", width: W, height: 1920, left, top: 0, filter: "blur(28px) brightness(.45)", transform: "scale(1.2)" }} />
          <OffthreadVideo src={src} startFrom={startFrom} playbackRate={p.lento ?? 1} muted style={{ position: "absolute", width: 1080 * z, height: 608 * z, left: (1080 - 1080 * z) / 2, top: 640 - (608 * z - 608) / 2, borderRadius: 18, boxShadow: `0 0 50px ${ROXO}88` }} />
        </AbsoluteFill>
      ) : (
        <AbsoluteFill style={{ overflow: "hidden" }}>
          <OffthreadVideo src={src} startFrom={startFrom} playbackRate={p.lento ?? 1} muted style={{ position: "absolute", width: W, height: 1920, left, top: 0, transform: `scale(${z})`, transformOrigin: `${(p.x ?? 0.5) * 100}% 50%` }} />
        </AbsoluteFill>
      )}
    </Sequence>
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
const pisca = (t: number) => [1.4, 4.9, 9.1, 13.3, 17.9, 22.8, 27.2, 31.4, 35.6, 39.0, 43.2, 48.5, 52.8, 57.1, 61.3, 66.4, 69.6].some((p) => t > p && t < p + 0.12);
const REACOES = [7.3, 10.6, 22.0, 40.1, 54.5]; // "mas tem uma coisa", "fica até o final", "errar tudo", "primeira hora", payoff
// a facecam só aparece em momentos-chave, para sobrar mais trailer na tela
const JANELAS: [number, number][] = [
  [7.1, 11.8], // "mas tem uma coisa... fica até o final"
  [21.7, 24.5], // "você vai errar tudo"
  [39.9, 42.0], // "e isso é só a primeira hora"
  [54.3, 57.3], // "e a coisa que ninguém percebeu"
];
const Facecam: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const k = JANELAS.reduce((m, [a, b]) => Math.max(m, entra(t, a, 0.3) * (1 - suave(t, b - 0.25, b))), 0);
  const fora = 0;
  const reage = REACOES.reduce((m, r) => Math.max(m, 1 - Math.abs(t - r) * 1.6), 0);
  const W = 300;
  const H = 360;
  const vis = k * (1 - fora);
  if (vis <= 0.01) return null;
  return (
    <div style={{ position: "absolute", left: 1080 - W - 40, top: 250, width: W, height: H, borderRadius: 26, overflow: "hidden", border: `5px solid ${ROXO}`, boxShadow: `0 0 ${30 + 25 * Math.max(0, reage)}px ${ROXO}, 0 10px 30px rgba(0,0,0,.6)`, transform: `scale(${(0.5 + 0.5 * vis) * (1 + 0.06 * Math.max(0, reage))})`, transformOrigin: "100% 0%", opacity: vis, background: "#140a2a" }}>
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

// ---------- Vyce no PC ----------
const Setup: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const s = emSetup(t + 0.3) ?? emSetup(t);
  if (!s) return null;
  const [a, b] = s;
  const k = suave(t, a - 0.3, a + 0.2) * (b >= FIM ? 1 : 1 - suave(t, b - 0.2, b + 0.1));
  const final = b >= FIM;
  const olha = final ? suave(t, a + 0.25, a + 0.7) : 0.35 + 0.3 * Math.sin(t * 2); // às 4h: olha a tela, meio sonolento
  const pos: [number, number, number] = [0.94 - (t - a) * 0.04, 1.5, 4.4 - (t - a) * 0.12];
  return (
    <AbsoluteFill style={{ opacity: k, transform: `scale(${1.2 - 0.2 * k})` }}>
      <Sequence from={Math.round(a * FPS) - 10} layout="none">
        <PalcoCinema ceu="estudio" fundo="#120B22" fov={45} luzCeu={0.25} brilhoCeu={0.05}>
          <Camera pos={pos} alvo={[0.82, 1.12, 0]} />
          <SetupGamer t={t} boca={boca(f)} pisca={final ? pisca(t) : Math.sin(t * 2.2) > 0.6} olhaCamera={olha} />
          <Acabamento foco={Math.hypot(pos[0] - 0.2, pos[1] - 1.3, pos[2])} desfoque={4} brilho={0.8} saturacao={0.12} contraste={0.12} vinheta={0.45} ao={0} />
        </PalcoCinema>
      </Sequence>
      {!final && (
        <div style={{ position: "absolute", top: 300, left: 60, right: 180, textAlign: "center", fontFamily, color: "#fff", opacity: entra(t, a + 0.1) }}>
          <div style={{ fontWeight: 800, fontSize: 38, letterSpacing: 8, color: "#E6D2FF", textShadow: sombra }}>MADRUGADA DO DIA 19</div>
          <div style={{ fontWeight: 900, fontSize: 170, lineHeight: 1, textShadow: sombra }}>04:00</div>
          <div style={{ fontWeight: 800, fontSize: 36, letterSpacing: 4, color: "#FFB3EE", textShadow: sombra }}>"SÓ MAIS UMA MISSÃO"</div>
        </div>
      )}
      {final && (
        <div style={{ position: "absolute", top: 270, left: 60, right: 180, textAlign: "center", color: "#fff", fontFamily, transform: `scale(${0.8 + 0.2 * entra(t, a + 0.2)})`, opacity: entra(t, a + 0.2) }}>
          <div style={{ fontWeight: 800, fontSize: 38, letterSpacing: 8, color: "#E6D2FF", textShadow: sombra }}>VOCÊ ESTÁ NA</div>
          <div style={{ fontWeight: 900, fontSize: 112, lineHeight: 0.95, letterSpacing: -2, textShadow: sombra }}>FASE EXTRA</div>
          <div style={{ fontWeight: 800, fontSize: 40, letterSpacing: 8, marginTop: 8, textShadow: sombra, opacity: entra(t, a + 1.6) }}>COM VYCE</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

// ---------- textos ----------
const sombra = "0 0 26px rgba(182,107,255,.85), 0 5px 0 #2B0F66, 0 0 8px rgba(0,0,0,.9)";
const Selo: React.FC<{ texto: string; cor: string; t: number; de: number }> = ({ texto, cor, t, de }) => {
  const k = entra(t, de, 0.25);
  return (
    <div style={{ display: "inline-block", marginTop: 16, transform: `scale(${0.6 + 0.4 * k}) rotate(${(1 - k) * -8}deg)`, opacity: k, fontFamily, fontWeight: 800, fontSize: 27, letterSpacing: 3, color: "#111", background: cor, padding: "6px 18px", borderRadius: 10, boxShadow: `0 0 24px ${cor}99` }}>
      {texto}
    </div>
  );
};
const Bloco: React.FC<{ t: number; de: number; ate: number; children: React.ReactNode; gancho?: boolean }> = ({ t, de, ate, children, gancho }) => {
  if (t < de - 0.05 || t > ate + 0.05) return null;
  const k = entra(t, de);
  const s = suave(t, ate - 0.15, ate);
  const tx = gancho ? Math.sin(t * 61) * 12 * (1 - suave(t, de + 0.1, de + 0.7)) : 0;
  return <div style={{ position: "absolute", top: gancho && t < 3.3 ? 430 : 650, left: 60, right: 180, textAlign: "center", color: "#fff", fontFamily, opacity: k * (1 - s), transform: `translateX(${tx}px) scale(${0.7 + 0.3 * k})` }}>{children}</div>;
};
const G: React.FC<{ tam: number; children: React.ReactNode; cor?: string }> = ({ tam, children, cor = "#fff" }) => <div style={{ fontWeight: 900, fontSize: Math.round(tam * 0.74), lineHeight: 0.95, letterSpacing: -2, color: cor, textShadow: sombra }}>{children}</div>;
const P: React.FC<{ children: React.ReactNode; cor?: string }> = ({ children, cor = "#F3E8FF" }) => <div style={{ fontWeight: 800, fontSize: 38, letterSpacing: 5, color: cor, textShadow: sombra, marginTop: 6 }}>{children}</div>;
const Relogio: React.FC<{ t: number }> = ({ t }) => {
  const s = Math.max(0, Math.round(interpolate(t, [15.0, 18.2], [9, 0], cl)));
  return <>{s > 0 ? `23:59:${String(60 - s).padStart(2, "0")}` : "00:00"}</>;
};
const Faltam: React.FC<{ t: number }> = ({ t }) => {
  if (t < 3.2 || t > 64.9 || emSetup(t)) return null;
  const k = entra(t, 3.2, 0.35);
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
const DESTAQUE = /^(19|estranho|trabalho|doença|GTA|6|coisa|ninguém|percebeu|final|meia-noite|mundo|relógio|13|anos|errar|tudo|confusão|assalto|nevasca|alto|Vice|City|polícia|trinta|primeira|hora|segredo|esconde|4|manhã|missão|escritório|cara|2013|nasceu|igual|guia|tutorial|perdido|junto|Fase|Extra|Vyce)$/i;
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
  return (
    <div style={{ position: "absolute", top: 1240, left: 60, right: 180, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 18px" }}>
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

// ---------- sons (só nas pausas da voz) ----------
const falando = (t: number) => PAL.some((p) => t >= p.s - 0.04 && t <= p.e + 0.04);
const SONS: { s: string; t: number; v: number }[] = [
  { s: "dum", t: 0.0, v: 0.6 },
  { s: "whoosh", t: 0.75, v: 0.45 },
  { s: "whoosh", t: 1.55, v: 0.45 },
  { s: "whoosh", t: 6.9, v: 0.4 },
  { s: "dum", t: 10.3, v: 0.45 },
  { s: "whoosh", t: 18.4, v: 0.35 },
  { s: "whoosh", t: 24.2, v: 0.35 },
  { s: "dum", t: 39.7, v: 0.6 },
  { s: "whoosh", t: 47.0, v: 0.45 },
  { s: "whoosh", t: 50.5, v: 0.4 },
  { s: "dum", t: 54.0, v: 0.5 },
  { s: "whoosh", t: 64.6, v: 0.45 },
];

// trilha: música do trailer de lançamento (trechos sem fala), abaixa sob a voz e sobe nas pausas
const DUCK: number[] = (() => {
  const bruto = Array.from({ length: DURACAO_FASE02 }, (_, i) => (falando(i / FPS) ? 0.42 : 1));
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

export const VideoFase02: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const corte = PLANOS.some((p) => t >= p.de && t < p.de + 2 / FPS) && !emSetup(t) ? 0.2 : 0;
  const flash = interpolate(t, [0, 0.05, 0.35], [0.8, 0.6, 0], cl) + interpolate(t, [40.0, 40.05, 40.4], [0, 0.6, 0], cl) + interpolate(t, [54.45, 54.5, 54.9], [0, 0.4, 0], cl);
  const noTrailer = !emSetup(t);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {noTrailer && <Trailer t={t} />}
      {noTrailer && <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,4,24,.75) 0%, rgba(10,4,24,0) 30%, rgba(10,4,24,0) 55%, rgba(10,4,24,.8) 100%)" }} />}
      <Setup t={t} f={f} />

      {/* gancho */}
      <Bloco t={t} de={0.0} ate={3.2} gancho>
        <P cor="#FFE0FA">O DIA MAIS ESTRANHO DO ANO</P>
        <G tam={330}>19/11</G>
      </Bloco>
      <Bloco t={t} de={3.3} ate={7.1}>
        <P>DOENÇA DO DIA</P>
        <G tam={150} cor="#FFB3EE">"GTA 6"</G>
        <P>FALTA NO TRABALHO</P>
      </Bloco>
      <Bloco t={t} de={7.22} ate={11.7}>
        <G tam={104}>QUASE NINGUÉM</G>
        <G tam={104}>PERCEBEU</G>
        <Selo texto="FICA ATÉ O FINAL" cor="#FFD84A" t={t} de={10.6} />
      </Bloco>
      <Bloco t={t} de={11.82} ate={18.7}>
        <P>MEIA-NOITE NO HORÁRIO LOCAL</P>
        <G tam={170}>
          <Relogio t={t} />
        </G>
        <Selo texto="OFICIAL · ROCKSTAR" cor="#4ADE80" t={t} de={13.0} />
      </Bloco>
      <Bloco t={t} de={18.78} ate={24.4}>
        <G tam={190}>13 ANOS</G>
        <P>APERTANDO OS MESMOS BOTÕES</P>
      </Bloco>
      <Bloco t={t} de={24.54} ate={30.5}>
        <P>A ROCKSTAR COMEÇA NA CONFUSÃO</P>
        <G tam={96}>GTA 5: ASSALTO</G>
        {t > 28.98 && <G tam={96} cor="#BFE3FF">RDR2: NEVASCA</G>}
      </Bloco>
      <Bloco t={t} de={30.58} ate={35.4}>
        <P>METADE VAI</P>
        <G tam={120}>SÓ OLHAR</G>
        <G tam={120} cor="#FFB3EE">VICE CITY</G>
      </Bloco>
      <Bloco t={t} de={35.52} ate={39.9}>
        <P>A OUTRA METADE</P>
        <G tam={120}>POLÍCIA</G>
        <G tam={120} cor="#FF9D9D">EM 30 S</G>
      </Bloco>
      <Bloco t={t} de={40.02} ate={41.85} gancho>
        <G tam={150}>E ISSO É SÓ</G>
        <G tam={150} cor="#FFB3EE">A 1ª HORA</G>
      </Bloco>
      <Bloco t={t} de={41.92} ate={47.2}>
        <P>CAÇADORES DE</P>
        <G tam={150} cor="#B9FFC9">SEGREDO</G>
      </Bloco>
      <Bloco t={t} de={50.84} ate={54.3}>
        <P>NO DIA SEGUINTE</P>
        <G tam={110}>ESCRITÓRIO</G>
        <G tam={110} cor="#FFB3EE">DE ZUMBI</G>
      </Bloco>
      <Bloco t={t} de={54.46} ate={64.8}>
        <P cor="#FFE0FA">O QUE NINGUÉM PERCEBEU</P>
        {t > 56.0 && (
          <>
            <G tam={110}>2013 OU 2026</G>
            <G tam={110} cor="#FFB3EE">TODO MUNDO</G>
            <G tam={110} cor="#FFB3EE">DO ZERO</G>
          </>
        )}
      </Bloco>

      <Faltam t={t} />
      <Facecam t={t} f={f} />
      <Legenda t={t} />

      <AbsoluteFill style={{ background: "#F5E9FF", opacity: Math.min(0.8, flash), pointerEvents: "none" }} />
      <AbsoluteFill style={{ background: "#000", opacity: corte, pointerEvents: "none" }} />

      <Audio src={staticFile("fase-extra/fase02/narracao.wav")} />
      <Audio src={staticFile("fase-extra/fase02/trilha.wav")} volume={(q) => DUCK[q] ?? 1} />
      {SONS.map((s, i) => (
        <Sequence key={i} from={Math.round(s.t * FPS)} durationInFrames={60}>
          <Audio src={staticFile(`fase-extra/sons/${s.s}.wav`)} volume={(q) => s.v * (falando(s.t + q / FPS) ? 0.3 : 1)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
