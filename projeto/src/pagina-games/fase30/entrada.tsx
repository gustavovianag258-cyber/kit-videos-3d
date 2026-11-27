import { Composition, registerRoot } from "remotion";
import { DURACAO_FASE30, VideoFase30 } from "./Video";

// Entrada só da Fase 30 (bundle leve, com --public-dir de uma pasta enxuta).
const Raiz: React.FC = () => <Composition id="FaseExtraFase30" component={VideoFase30} durationInFrames={DURACAO_FASE30} fps={30} width={1080} height={1920} />;
registerRoot(Raiz);
