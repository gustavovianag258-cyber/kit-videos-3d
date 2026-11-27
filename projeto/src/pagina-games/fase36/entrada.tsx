import { Composition, registerRoot } from "remotion";
import { DURACAO_FASE36, VideoFase36 } from "./Video";

// Entrada só da Fase 36 (bundle leve, com --public-dir de uma pasta enxuta).
const Raiz: React.FC = () => <Composition id="FaseExtraFase36" component={VideoFase36} durationInFrames={DURACAO_FASE36} fps={30} width={1080} height={1920} />;
registerRoot(Raiz);
