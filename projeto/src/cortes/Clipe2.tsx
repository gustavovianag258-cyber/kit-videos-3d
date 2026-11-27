import { AbsoluteFill, Audio, Easing, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { AMARELO, Bloco, fontFamily, LegendaV, Titulo } from "./CorteLive";
import { Carimbo } from "./Gancho3";
import legendas from "./clipe2v-legendas.json";

// Clipe "twitch-clip (1).mp4" da Nova pasta — "Pegue o gato, vá!"
// Linha do tempo (public/cortes/clipe2-base.mp4, 53,5 s):
//   0–5,45   câmera dele em tela cheia
//   5,45–46  câmera em cima (540 px) + TikTok embaixo (900 px)
//   46–53,5  câmera em tela cheia de novo (ele sem entender nada)
export const CLIPE2_SEG = 53.5;
const P = { tiktok: 5.45, volta: 46 };

// cada "pegue o gato" do vídeo do TikTok (início de cada grito, em s)
const GRITOS = [7.48, 8.82, 9.62, 10.62, 12.64, 13.68, 26.13, 29.51, 30.55, 31.83, 33.31, 34.61, 35.25, 36.71, 38.55, 39.89, 41.97];
const ELE_REPETE = 52.45; // o próprio Meikod: "Pega o gato, vá!"

const Contador: React.FC<{ t: number }> = ({ t }) => {
  const { fps } = useVideoConfig();
  const feitos = GRITOS.filter((g) => t >= g);
  const n = feitos.length;
  if (n === 0 || t >= P.volta) return null;
  const ultimo = feitos[n - 1];
  const pulo = spring({ frame: Math.round((t - ultimo) * fps), fps, config: { damping: 8, stiffness: 320, mass: 0.6 } });
  const escala = interpolate(pulo, [0, 1], [1.45, 1]);
  return (
    <div style={{ position: "absolute", top: 1690, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          fontFamily,
          fontWeight: 900,
          fontSize: 62,
          color: "#000",
          background: AMARELO,
          border: "6px solid #000",
          borderRadius: 18,
          padding: "8px 28px",
          boxShadow: "0 10px 0 #000, 0 16px 40px rgba(0,0,0,.5)",
          transform: `rotate(-3deg) scale(${escala})`,
          whiteSpace: "nowrap",
        }}
      >
        “PEGUE O GATO” <span style={{ background: "#000", color: AMARELO, borderRadius: 10, padding: "0 14px" }}>×{n}</span>
      </div>
    </div>
  );
};

export const Clipe2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / fps;
  const f = (s: number) => Math.round(s * fps);
  const src = staticFile("cortes/clipe2-base.mp4");
  const dividido = t >= P.tiktok && t < P.volta;

  // câmera: soco nas trocas, aproximação lenta no rosto no final, tremida quando ele mesmo grita
  let zoom = 1;
  let origem = "50% 50%";
  if (t < P.tiktok) zoom = interpolate(t, [0, 0.3], [1.15, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  else if (dividido) {
    zoom = interpolate(t - P.tiktok, [0, 0.3], [1.12, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
    origem = "50% 70%";
  } else {
    zoom = interpolate(t, [P.volta, P.volta + 0.3, CLIPE2_SEG], [1.25, 1.05, 1.4], { extrapolateRight: "clamp" });
    origem = "55% 40%";
  }
  // pequena "batida" no TikTok a cada grito
  const ultimoGrito = GRITOS.filter((g) => t >= g).pop();
  const batida = dividido && ultimoGrito !== undefined ? interpolate(t - ultimoGrito, [0, 0.12], [1.04, 1], { extrapolateRight: "clamp" }) : 1;
  const treme = t >= ELE_REPETE ? Math.sin(frame * 2.3) * 12 : 0;
  const flash = Math.max(
    t >= P.tiktok ? interpolate(t - P.tiktok, [0, 0.12], [0.8, 0], { extrapolateRight: "clamp" }) : 0,
    t >= P.volta ? interpolate(t - P.volta, [0, 0.12], [0.8, 0], { extrapolateRight: "clamp" }) : 0,
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <OffthreadVideo
        src={src}
        muted
        style={{ position: "absolute", width: 1440, height: 1920, left: -180, top: 0, filter: "blur(40px) brightness(.45)", transform: "scale(1.15)" }}
      />
      <div style={{ position: "absolute", top: 400, left: 0, width: 1080, height: 1440, overflow: "hidden" }}>
        <OffthreadVideo
          src={src}
          style={{ width: 1080, height: 1440, transform: `translate(${treme}px, ${treme * 0.4}px) scale(${zoom * batida})`, transformOrigin: origem }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,.35) 0%, rgba(0,0,0,0) 18%, rgba(0,0,0,0) 70%, rgba(0,0,0,.45) 100%)" }} />
      </div>
      {dividido && <div style={{ position: "absolute", top: 400 + 540 - 4, left: 0, width: 1080, height: 8, background: AMARELO }} />}
      <AbsoluteFill style={{ background: "#fff", opacity: flash }} />

      {/* títulos de cada parte */}
      <Sequence durationInFrames={f(P.tiktok)}>
        <Titulo linhas={["O MEIKOD ABRIU", "UM ", "TIKTOK…"]} estilo="preto" />
      </Sequence>
      <Sequence from={f(P.tiktok)} durationInFrames={f(P.volta - P.tiktok)}>
        <Titulo linhas={["“PEGUE O GATO,", "", "VÁ!”"]} estilo="amarelo" />
      </Sequence>
      <Sequence from={f(P.volta)}>
        <Titulo linhas={["MEIKODRJ NÃO", "ENTENDEU ", "NADA"]} estilo="branco" />
      </Sequence>

      <Contador t={t} />

      {/* carimbo final: até ele entra no "pegue o gato" */}
      <Sequence from={f(ELE_REPETE)}>
        <Carimbo texto="ATÉ ELE!" cor={AMARELO} giro={-7} top={1600} tam={110} />
      </Sequence>

      {/* legendas: em cima (na câmera) enquanto o TikTok está embaixo; no lugar de sempre no resto */}
      <LegendaV blocos={(legendas as Bloco[]).filter((b) => b.de >= P.tiktok && b.de < P.volta - 2.5)} topo={760} />
      <LegendaV blocos={(legendas as Bloco[]).filter((b) => b.de < P.tiktok || b.de >= P.volta - 2.5)} />

      {/* sons */}
      <Sequence from={f(P.tiktok - 0.12)}><Audio src={staticFile("cortes/sons/whoosh-curto.wav")} volume={0.6} /></Sequence>
      {GRITOS.map((g, i) => (
        <Sequence key={i} from={f(g)}>
          <Audio src={staticFile("cortes/sons/blip.wav")} volume={0.35} />
        </Sequence>
      ))}
      <Sequence from={f(P.volta - 0.12)}><Audio src={staticFile("cortes/sons/whoosh-curto.wav")} volume={0.6} /></Sequence>
      <Sequence from={f(P.volta)}><Audio src={staticFile("cortes/sons/dum.wav")} volume={0.55} /></Sequence>
      <Sequence from={f(ELE_REPETE)}><Audio src={staticFile("cortes/sons/carimbo.wav")} volume={0.8} /></Sequence>

      <div style={{ position: "absolute", left: 0, top: 1834, height: 10, width: 1080 * (frame / durationInFrames), background: AMARELO }} />
    </AbsoluteFill>
  );
};
