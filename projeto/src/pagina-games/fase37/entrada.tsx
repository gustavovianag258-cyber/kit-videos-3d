import { Composition, registerRoot } from "remotion";
import { DURACAO_FASE37, VideoFase37 } from "./Video";

// Entrada só da Fase 37 (bundle leve, com --public-dir de uma pasta enxuta).
const Raiz: React.FC = () => <Composition id="FaseExtraFase37" component={VideoFase37} durationInFrames={DURACAO_FASE37} fps={30} width={1080} height={1920} />;
registerRoot(Raiz);
