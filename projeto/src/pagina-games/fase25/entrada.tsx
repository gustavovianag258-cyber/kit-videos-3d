import { Composition, registerRoot } from "remotion";
import { DURACAO_FASE25, VideoFase25 } from "./Video";

// Entrada só da Fase 25 (bundle leve, com --public-dir de uma pasta enxuta).
const Raiz: React.FC = () => <Composition id="FaseExtraFase25" component={VideoFase25} durationInFrames={DURACAO_FASE25} fps={30} width={1080} height={1920} />;
registerRoot(Raiz);
