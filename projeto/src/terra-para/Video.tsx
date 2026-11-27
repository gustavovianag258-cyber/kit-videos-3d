import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame } from "remotion";
import { CenaCopacabana } from "./CenaCopacabana";
import { CenaEspaco } from "./CenaEspaco";
import { clamp, FPS, T } from "./tempo";
import { CartazFinal, FlashGatilho, Hud, Legendas, Pergunta } from "./ui";

export const VideoTerraPara: React.FC = () => {
  const frame = useCurrentFrame();
  const s = frame / FPS;
  const noEspaco = s >= T.real && s < T.relaxa;

  const volMusica = interpolate(s, [0, 2, T.cta, T.cta + 5], [0.09, 0.09, 0.09, 0], clamp);

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {noEspaco ? <CenaEspaco s={s} /> : <CenaCopacabana s={s} />}

      <FlashGatilho s={s} />
      <Pergunta s={s} />
      <Hud s={s} />
      <Legendas s={s} />
      <CartazFinal s={s} />

      <Audio src={staticFile("terra-para/narracao.mp3")} volume={1} />
      <Audio src={staticFile("gravidade/sons/musica-coffee-or-tea.wav")} volume={volMusica} loop />
    </AbsoluteFill>
  );
};
