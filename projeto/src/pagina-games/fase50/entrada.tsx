import { Composition, registerRoot } from "remotion";
import { DURACAO_FASE50, VideoFase50 } from "./Video";

// Entrada só da Fase 50 (bundle leve, com --public-dir de uma pasta enxuta).
const Raiz: React.FC = () => <Composition id="FaseExtraFase50" component={VideoFase50} durationInFrames={DURACAO_FASE50} fps={30} width={1080} height={1920} />;
registerRoot(Raiz);
