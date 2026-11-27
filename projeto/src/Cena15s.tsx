import {
  AbsoluteFill,
  Html5Audio,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Borda } from "./cenas/Borda";
import { Disco } from "./cenas/Disco";
import { Final } from "./cenas/Final";
import { Gancho } from "./cenas/Gancho";
import { Gravidade } from "./cenas/Gravidade";
import { CENAS, FALAS } from "./roteiro";

// Vídeo "E se a Terra fosse plana?" — 15 s, 1080x1920, 30 fps.
// Os cortes entre cenas vêm dos tempos reais da narração (src/roteiro.ts).

const Legendas: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const fala = FALAS.find(
    (f) => frame >= f.palavras[0].inicio - 3 && frame <= f.palavras[f.palavras.length - 1].fim + 8,
  );
  if (!fala) return null;
  const entrada = spring({
    frame: frame - (fala.palavras[0].inicio - 3),
    fps,
    config: { damping: 14, stiffness: 180 },
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 1180,
        // Margem maior à direita: lá ficam os botões do TikTok/Reels
        left: 60,
        right: 120,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "0 22px",
        opacity: entrada,
        transform: `scale(${0.85 + 0.15 * entrada})`,
      }}
    >
      {fala.palavras.map((p, i) => {
        const proxima = fala.palavras[i + 1]?.inicio ?? p.fim + 8;
        const ativa = frame >= p.inicio && frame < proxima;
        return (
          <span
            key={i}
            style={{
              fontFamily: "Arial Black, Arial, sans-serif",
              fontWeight: 900,
              fontSize: 72,
              lineHeight: 1.15,
              textTransform: "uppercase",
              color: ativa ? "#ffd60a" : "#ffffff",
              WebkitTextStroke: "12px #000000",
              paintOrder: "stroke fill",
              textShadow: "0 6px 20px rgba(0,0,0,0.6)",
              transform: `scale(${ativa ? 1.08 : 1})`,
            }}
          >
            {p.texto}
          </span>
        );
      })}
    </div>
  );
};

const Cartaz: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entrada = spring({ frame, fps, config: { damping: 10, stiffness: 160 } });
  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(circle at 50% 45%, #1b1440 0%, #000000 70%)",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          fontFamily: "Arial Black, Arial, sans-serif",
          fontWeight: 900,
          fontSize: 124,
          lineHeight: 1.05,
          textAlign: "center",
          color: "#ffffff",
          padding: "0 90px",
          transform: `scale(${1.4 - 0.4 * entrada})`,
          opacity: entrada,
          textShadow: "0 0 40px rgba(255,214,10,0.35)",
        }}
      >
        E VOCÊ, VIVERIA <span style={{ color: "#ffd60a" }}>AQUI?</span>
      </div>
    </AbsoluteFill>
  );
};

const Selo: React.FC = () => (
  <div
    style={{
      position: "absolute",
      top: 70,
      left: 60,
      padding: "8px 18px",
      borderRadius: 12,
      background: "rgba(0,0,0,0.45)",
      color: "#ffffff",
      fontFamily: "Arial, sans-serif",
      fontWeight: 700,
      fontSize: 28,
      letterSpacing: 2,
    }}
  >
    FICÇÃO CIENTÍFICA
  </div>
);

export const TerraPlana15s: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Sequence durationInFrames={CENAS.disco - CENAS.gancho}>
        <Gancho />
      </Sequence>
      <Sequence from={CENAS.disco} durationInFrames={CENAS.borda - CENAS.disco}>
        <Disco />
      </Sequence>
      <Sequence from={CENAS.borda} durationInFrames={CENAS.gravidade - CENAS.borda}>
        <Borda />
      </Sequence>
      <Sequence from={CENAS.gravidade} durationInFrames={CENAS.final - CENAS.gravidade}>
        <Gravidade />
      </Sequence>
      <Sequence from={CENAS.final} durationInFrames={CENAS.cartaz - CENAS.final}>
        <Final />
      </Sequence>
      <Sequence from={CENAS.cartaz}>
        <Cartaz />
      </Sequence>
      {frame < CENAS.cartaz && <Legendas frame={frame} />}
      {frame < CENAS.cartaz && <Selo />}
      <Html5Audio src={staticFile("narracao.mp3")} />
    </AbsoluteFill>
  );
};
