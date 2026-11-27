import { Composition, registerRoot } from "remotion";
import { DURACAO_FASE48, VideoFase48 } from "./Video";

// Entrada só da Fase 48 (bundle leve, com --public-dir de uma pasta enxuta).
const Raiz: React.FC = () => <Composition id="FaseExtraFase48" component={VideoFase48} durationInFrames={DURACAO_FASE48} fps={30} width={1080} height={1920} />;
registerRoot(Raiz);
