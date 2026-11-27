import { Composition, registerRoot } from "remotion";
import { DURACAO_FASE45, VideoFase45 } from "./Video";

// Entrada só da Fase 45 (bundle leve, com --public-dir de uma pasta enxuta).
const Raiz: React.FC = () => <Composition id="FaseExtraFase45" component={VideoFase45} durationInFrames={DURACAO_FASE45} fps={30} width={1080} height={1920} />;
registerRoot(Raiz);
