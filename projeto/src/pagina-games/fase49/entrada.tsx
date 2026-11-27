import { Composition, registerRoot } from "remotion";
import { DURACAO_FASE49, VideoFase49 } from "./Video";

// Entrada só da Fase 49 (bundle leve, com --public-dir de uma pasta enxuta).
const Raiz: React.FC = () => <Composition id="FaseExtraFase49" component={VideoFase49} durationInFrames={DURACAO_FASE49} fps={30} width={1080} height={1920} />;
registerRoot(Raiz);
