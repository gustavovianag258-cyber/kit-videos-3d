import { loadFont } from "@remotion/google-fonts/Montserrat";
import { AbsoluteFill, Easing, interpolate, OffthreadVideo, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import legendas1 from "./corte1-legendas.json";

export const { fontFamily } = loadFont("normal", { weights: ["900"], subsets: ["latin", "latin-ext"] });

export type Palavra = { t: string; s: number; d: boolean };
export type Bloco = { de: number; ate: number; palavras: Palavra[] };

export const CORTES = {
  corte1: { video: "cortes/corte1-base.mp4", legendas: legendas1 as Bloco[], segundos: 95 },
};

export const AMARELO = "#FFE14D";

const Legenda: React.FC<{ blocos: Bloco[] }> = ({ blocos }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const b = blocos.find((x) => t >= x.de && t < x.ate);
  if (!b) return null;
  const entrada = spring({ frame: frame - Math.round(b.de * fps), fps, config: { damping: 14, stiffness: 220, mass: 0.6 } });
  const escala = interpolate(entrada, [0, 1], [0.82, 1]);
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 110 }}>
      <div
        style={{
          fontFamily,
          fontWeight: 900,
          fontSize: 76,
          lineHeight: 1.1,
          textTransform: "uppercase",
          textAlign: "center",
          maxWidth: 1500,
          transform: `scale(${escala})`,
          opacity: interpolate(entrada, [0, 0.4], [0, 1], { extrapolateRight: "clamp" }),
          WebkitTextStroke: "14px #000",
          paintOrder: "stroke fill",
          textShadow: "0 6px 18px rgba(0,0,0,.55)",
        }}
      >
        {b.palavras.map((p, i) => {
          const falada = t >= p.s;
          const pulo = interpolate(t - p.s, [0, 0.08, 0.2], [1, 1.12, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.quad),
          });
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                margin: "0 22px",
                color: p.d ? AMARELO : "#fff",
                opacity: falada ? 1 : 0.55,
                transform: `scale(${falada ? pulo : 1})`,
              }}
            >
              {p.t}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------- versão vertical (TikTok / Reels) ----------
import legendas1v from "./corte1v-legendas.json";
import legendas2v from "./corte2v-legendas.json";
import legendas3v from "./corte3v-legendas.json";

export const CORTES_V = {
  corte1: {
    video: "cortes/corte1v-base.mp4",
    legendas: legendas1v as Bloco[],
    segundos: 57.8,
    cortes: [43.2], // emendas (s) para dar o "zoom" de corte
    titulo: ["MEIKODRJ FALA", "SOBRE O ", "GTA 6"],
    estilo: "branco" as Estilo,
  },
  corte2: {
    video: "cortes/corte2v-base.mp4",
    legendas: legendas2v as Bloco[],
    segundos: 55.9,
    cortes: [13.9, 18.3, 32.7],
    titulo: ["“ISSO É", "", "TESTOSTERONA”"],
    estilo: "amarelo" as Estilo,
  },
  corte3: {
    video: "cortes/corte3v-base.mp4",
    legendas: legendas3v as Bloco[],
    segundos: 44.7,
    cortes: [] as number[],
    titulo: ["“EU NÃO QUERIA", "ESTAR NA ", "PELE DELE”"],
    estilo: "preto" as Estilo,
  },
};

export const LegendaV: React.FC<{ blocos: Bloco[]; topo?: number }> = ({ blocos, topo = 1270 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const b = blocos.find((x) => t >= x.de && t < x.ate);
  if (!b) return null;
  const entrada = spring({ frame: frame - Math.round(b.de * fps), fps, config: { damping: 13, stiffness: 240, mass: 0.6 } });
  return (
    <div
      style={{
        position: "absolute",
        top: topo,
        left: 70,
        right: 150,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          fontFamily,
          fontWeight: 900,
          fontSize: 78,
          lineHeight: 1.12,
          textTransform: "uppercase",
          textAlign: "center",
          transform: `scale(${interpolate(entrada, [0, 1], [0.75, 1])})`,
          opacity: interpolate(entrada, [0, 0.35], [0, 1], { extrapolateRight: "clamp" }),
          WebkitTextStroke: "16px #000",
          paintOrder: "stroke fill",
          textShadow: "0 8px 22px rgba(0,0,0,.6)",
        }}
      >
        {b.palavras.map((p, i) => {
          const falada = t >= p.s;
          const pulo = interpolate(t - p.s, [0, 0.08, 0.2], [1, 1.14, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                margin: "0 18px",
                color: p.d ? AMARELO : "#fff",
                opacity: falada ? 1 : 0.5,
                transform: `scale(${falada ? pulo : 1})`,
              }}
            >
              {p.t}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export type Estilo = "branco" | "amarelo" | "preto";
const ESTILOS: Record<Estilo, { fundo: string; texto: string; destaqueFundo: string; destaqueTexto: string; sombra: string; borda: string; giro: number }> = {
  branco: { fundo: "#fff", texto: "#000", destaqueFundo: AMARELO, destaqueTexto: "#000", sombra: "#000", borda: "#000", giro: -2 },
  amarelo: { fundo: AMARELO, texto: "#000", destaqueFundo: "#000", destaqueTexto: AMARELO, sombra: "#000", borda: "#000", giro: 2 },
  preto: { fundo: "#111", texto: "#fff", destaqueFundo: AMARELO, destaqueTexto: "#000", sombra: AMARELO, borda: "#fff", giro: -1.5 },
};

export const Titulo: React.FC<{ linhas: string[]; estilo: Estilo }> = ({ linhas, estilo }) => {
  const st = ESTILOS[estilo];
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const e = spring({ frame, fps, config: { damping: 12, stiffness: 180 } });
  const respira = 1 + Math.sin(frame / 9) * 0.012;
  return (
    <div style={{ position: "absolute", top: 90, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          transform: `scale(${interpolate(e, [0, 1], [0.6, 1]) * respira}) rotate(${st.giro}deg)`,
          background: st.fundo,
          color: st.texto,
          fontFamily,
          fontWeight: 900,
          fontSize: Math.min(92, Math.floor(1480 / Math.max(linhas[0].length, (linhas[1] + linhas[2]).length))),
          whiteSpace: "nowrap",
          lineHeight: 1.05,
          textAlign: "center",
          padding: "22px 40px 26px",
          borderRadius: 22,
          boxShadow: `0 14px 0 ${st.sombra}, 0 20px 50px rgba(0,0,0,.5)`,
          border: `6px solid ${st.borda}`,
        }}
      >
        <div>{linhas[0]}</div>
        <div>
          {linhas[1]}
          <span style={{ background: st.destaqueFundo, color: st.destaqueTexto, padding: "0 14px", borderRadius: 10 }}>{linhas[2]}</span>
        </div>
      </div>
    </div>
  );
};

export const CorteLiveVertical: React.FC<{ corte: keyof typeof CORTES_V; semBarra?: boolean }> = ({ corte, semBarra }) => {
  const c = CORTES_V[corte];
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / fps;
  // pequeno zoom-soco na entrada e em cada emenda
  const desde = Math.min(t, ...c.cortes.map((x) => (t >= x ? t - x : 99)));
  const soco = interpolate(desde, [0, 0.25], [1.12, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const src = staticFile(c.video);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <OffthreadVideo
        src={src}
        muted
        style={{ position: "absolute", width: 1440, height: 1920, left: -180, top: 0, filter: "blur(40px) brightness(.45)", transform: "scale(1.15)" }}
      />
      <div style={{ position: "absolute", top: 400, left: 0, width: 1080, height: 1440, overflow: "hidden" }}>
        <OffthreadVideo src={src} style={{ width: 1080, height: 1440, transform: `scale(${soco})` }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,.35) 0%, rgba(0,0,0,0) 18%, rgba(0,0,0,0) 70%, rgba(0,0,0,.45) 100%)" }} />
      </div>
      <Titulo linhas={c.titulo} estilo={c.estilo} />
      <LegendaV blocos={c.legendas} />
      {!semBarra && <div style={{ position: "absolute", left: 0, top: 1834, height: 10, width: 1080 * (frame / durationInFrames), background: AMARELO }} />}
    </AbsoluteFill>
  );
};

export const CorteLive: React.FC<{ corte: keyof typeof CORTES }> = ({ corte }) => {
  const c = CORTES[corte];
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <OffthreadVideo src={staticFile(c.video)} style={{ width: "100%", height: "100%" }} />
      <Legenda blocos={c.legendas} />
    </AbsoluteFill>
  );
};
