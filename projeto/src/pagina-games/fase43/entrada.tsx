import { Composition, registerRoot } from "remotion";
import { DURACAO_FASE43, VideoFase43 } from "./Video";

// Entrada só da Fase 43 (bundle leve, com --public-dir de uma pasta enxuta).
const Raiz: React.FC = () => <Composition id="FaseExtraFase43" component={VideoFase43} durationInFrames={DURACAO_FASE43} fps={30} width={1080} height={1920} />;
registerRoot(Raiz);
