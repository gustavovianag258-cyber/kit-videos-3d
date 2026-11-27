import { AbsoluteFill, Audio, getStaticFiles, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { CENAS } from "./cenas";
import { clamp, DURACAO_SEGUNDOS, fimFrase, FPS, fraseEm, INICIO_FRASE } from "./tempo";
import { Legenda } from "./ui";

// Vídeo-demo de medicina: "O xixi cor de refrigerante" — glomerulonefrite pós-estreptocócica,
// contada pelo caso do Lucas, em bonecos 3D de brinquedo. Sem @ e sem cartaz de página.
const VOZ = "glomerulo/narracao.mp3";
const temVoz = () => getStaticFiles().some((f) => f.name === VOZ);

export const VideoGlomerulo: React.FC = () => {
  const frame = useCurrentFrame();
  const s = frame / FPS;
  const i = fraseEm(s);
  const Cena = CENAS[i];
  const t = s - INICIO_FRASE[i];
  // "pulo" de corte: o quadro novo entra com um zoom rápido (como na referência)
  const entrada = interpolate(t, [0, 0.18], [1.06, 1], clamp);
  const fimVideo = interpolate(s, [DURACAO_SEGUNDOS - 0.6, DURACAO_SEGUNDOS], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: "#fff" }}>
      <AbsoluteFill style={{ transform: `scale(${entrada})` }}>
        <Cena t={t} dur={fimFrase(i) - INICIO_FRASE[i]} s={s} />
      </AbsoluteFill>
      <Legenda s={s} />
      <AbsoluteFill style={{ background: "#fff", opacity: fimVideo }} />

      {temVoz() && <Audio src={staticFile(VOZ)} />}
      <Audio src={staticFile("musica/musica-fundo.mp3")} volume={(f) => 0.06 * interpolate(f / FPS, [0, 1, DURACAO_SEGUNDOS - 1.5, DURACAO_SEGUNDOS], [0, 1, 1, 0], clamp)} />
      {INICIO_FRASE.slice(1).map((ini) => (
        <Sequence key={ini} from={Math.max(0, Math.round((ini - 0.12) * FPS))} durationInFrames={30} layout="none">
          <Audio src={staticFile("sfx/whoosh.wav")} volume={0.22} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
