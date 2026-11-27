import { Composition, registerRoot } from "remotion";
import { DURACAO_FASE47, VideoFase47 } from "./Video";

// Entrada só da Fase 47 (bundle leve, com --public-dir de uma pasta enxuta).
const Raiz: React.FC = () => <Composition id="FaseExtraFase47" component={VideoFase47} durationInFrames={DURACAO_FASE47} fps={30} width={1080} height={1920} />;
registerRoot(Raiz);
