import { AbsoluteFill } from "remotion";
import { Edson } from "./edson";

// Folha do Seu Edson pra conferir o traço: normal, de quepe falando, prendendo o ar e fantasma.
export const ElencoEdson: React.FC = () => (
  <AbsoluteFill style={{ background: "linear-gradient(180deg,#E8CFA6,#B07A4E)" }}>
    <svg width={1080} height={1920}>
      <Edson x={280} y={860} escala={0.95} />
      <Edson x={800} y={860} escala={0.95} quepe boca="aberta" pose={{ bracoD: 40, antebracoD: 60 }} caneca />
      <Edson x={280} y={1800} escala={0.95} prende={1} olhos="espanto" />
      <Edson x={800} y={1800} escala={0.95} prende={1} fantasma={1} olhos="fechado" />
    </svg>
  </AbsoluteFill>
);
