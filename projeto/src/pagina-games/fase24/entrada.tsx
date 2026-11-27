import { Composition, registerRoot } from "remotion";
import { DURACAO_FASE24, VideoFase24 } from "./Video";

// Entrada só da Fase 24 (bundle leve, com --public-dir de uma pasta enxuta).
const Raiz: React.FC = () => <Composition id="FaseExtraFase24" component={VideoFase24} durationInFrames={DURACAO_FASE24} fps={30} width={1080} height={1920} />;
registerRoot(Raiz);
