import { Composition, registerRoot } from "remotion";
import { DURACAO_FASE39, VideoFase39 } from "./Video";

// Entrada só da Fase 39 (bundle leve, com --public-dir de uma pasta enxuta).
const Raiz: React.FC = () => <Composition id="FaseExtraFase39" component={VideoFase39} durationInFrames={DURACAO_FASE39} fps={30} width={1080} height={1920} />;
registerRoot(Raiz);
