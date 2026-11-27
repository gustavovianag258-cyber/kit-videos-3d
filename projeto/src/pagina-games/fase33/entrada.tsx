import { Composition, registerRoot } from "remotion";
import { DURACAO_FASE33, VideoFase33 } from "./Video";

// Entrada só da Fase 33 (bundle leve, com --public-dir de uma pasta enxuta).
const Raiz: React.FC = () => <Composition id="FaseExtraFase33" component={VideoFase33} durationInFrames={DURACAO_FASE33} fps={30} width={1080} height={1920} />;
registerRoot(Raiz);
