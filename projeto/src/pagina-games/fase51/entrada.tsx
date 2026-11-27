import { Composition, registerRoot } from "remotion";
import { DURACAO_FASE51, VideoFase51 } from "./Video";

// Entrada só da Fase 51 (bundle leve, com --public-dir de uma pasta enxuta).
const Raiz: React.FC = () => <Composition id="FaseExtraFase51" component={VideoFase51} durationInFrames={DURACAO_FASE51} fps={30} width={1080} height={1920} />;
registerRoot(Raiz);
