import { Composition, registerRoot } from "remotion";
import { DURACAO_FASE41, VideoFase41 } from "./Video";

// Entrada só da Fase 41 (bundle leve, com --public-dir de uma pasta enxuta).
const Raiz: React.FC = () => <Composition id="FaseExtraFase41" component={VideoFase41} durationInFrames={DURACAO_FASE41} fps={60} width={1080} height={1920} />;
registerRoot(Raiz);
