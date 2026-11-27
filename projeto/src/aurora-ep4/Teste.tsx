import { AbsoluteFill } from "remotion";
import { Esqueleto, Gente } from "./corpo";
import { Kaique } from "./kaique";

// Folha do elenco do ep. 4 pra conferir o traço: Kaique normal, de capacete com raio-x, ardendo, e os esqueletos.
export const ElencoKaique: React.FC = () => (
  <AbsoluteFill style={{ background: "linear-gradient(180deg,#E8CFA6,#B07A4E)" }}>
    <svg width={1080} height={1920}>
      <Kaique x={280} y={860} escala={0.95} mochila />
      <Kaique x={800} y={860} escala={0.95} capacete raio={1} olhos="espanto" boca="aberta" />
      <Kaique x={280} y={1800} escala={0.95} ardendo={1} raio={1} olhos="espanto" boca="aberta" />
      <Esqueleto x={580} y={1800} e={0.95} bone pochete olhosVerdes={1} />
      <Gente x={880} y={1800} e={0.95} raio={0.5} parafuso />
    </svg>
  </AbsoluteFill>
);
