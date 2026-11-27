import { Composition, registerRoot } from "remotion";
import { DURACAO_FASE23, VideoFase23 } from "./Video";

// Entrada só da Fase 23 (bundle leve, com --public-dir de uma pasta enxuta).
const Raiz: React.FC = () => <Composition id="FaseExtraFase23" component={VideoFase23} durationInFrames={DURACAO_FASE23} fps={30} width={1080} height={1920} />;
registerRoot(Raiz);
