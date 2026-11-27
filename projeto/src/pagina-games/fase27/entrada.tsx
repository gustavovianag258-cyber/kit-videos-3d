import { Composition, registerRoot } from "remotion";
import { DURACAO_FASE27, VideoFase27 } from "./Video";

// Entrada só da Fase 27 (bundle leve, com --public-dir de uma pasta enxuta).
const Raiz: React.FC = () => <Composition id="FaseExtraFase27" component={VideoFase27} durationInFrames={DURACAO_FASE27} fps={30} width={1080} height={1920} />;
registerRoot(Raiz);
