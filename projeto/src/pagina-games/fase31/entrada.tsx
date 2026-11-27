import { Composition, registerRoot } from "remotion";
import { DURACAO_FASE31, VideoFase31 } from "./Video";

// Entrada só da Fase 31 (bundle leve, com --public-dir de uma pasta enxuta).
const Raiz: React.FC = () => <Composition id="FaseExtraFase31" component={VideoFase31} durationInFrames={DURACAO_FASE31} fps={30} width={1080} height={1920} />;
registerRoot(Raiz);
