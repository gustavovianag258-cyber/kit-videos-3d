import { Composition, registerRoot } from "remotion";
import { DURACAO_FASE34, VideoFase34 } from "./Video";

// Entrada só da Fase 34 (bundle leve, com --public-dir de uma pasta enxuta).
const Raiz: React.FC = () => <Composition id="FaseExtraFase34" component={VideoFase34} durationInFrames={DURACAO_FASE34} fps={30} width={1080} height={1920} />;
registerRoot(Raiz);
