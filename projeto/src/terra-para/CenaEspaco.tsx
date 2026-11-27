import { interpolate } from "remotion";
import { PalcoCinema } from "../cinema/Palco";
import { Camera, Estrelas } from "../v2/mundo";
import { Globo } from "../namorada/Globo";
import { clamp, T } from "./tempo";

// "Na vida real, a Terra não vai parar do nada..." — corte calmo pro espaço: o planeta girando
// devagar, sem drama nenhum (sem placas, sem rachadura, sem ondas).
export const CenaEspaco: React.FC<{ s: number }> = ({ s }) => {
  const k = interpolate(s, [T.real, T.real + 1.2], [0, 1], clamp);
  const giroY = interpolate(s, [T.real, T.relaxa], [0, 0.4]);
  return (
    <PalcoCinema ceu={null} fundo="#05070f">
      <ambientLight intensity={0.4} />
      <directionalLight position={[6, 3, 5]} intensity={2.4} color="#fff3dc" />
      <Camera posicao={[0, 0.3, 4.2]} alvo={[0, 0, 0]} fov={38} />
      <Estrelas raio={60} />
      <group scale={k}>
        <Globo raio={1.4} giro={[0.15, giroY]} tempo={s} />
      </group>
    </PalcoCinema>
  );
};
