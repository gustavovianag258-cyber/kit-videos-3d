import { Composition, registerRoot } from "remotion";
import { DURACAO_FASE44, VideoFase44 } from "./Video";

// Entrada só da Fase 44 (bundle leve, com --public-dir de uma pasta enxuta).
const Raiz: React.FC = () => <Composition id="FaseExtraFase44" component={VideoFase44} durationInFrames={DURACAO_FASE44} fps={30} width={1080} height={1920} />;
registerRoot(Raiz);
