import { Composition, registerRoot } from "remotion";
import { DURACAO_FASE46, VideoFase46 } from "./Video";

// Entrada só da Fase 46 (bundle leve, com --public-dir de uma pasta enxuta).
const Raiz: React.FC = () => <Composition id="FaseExtraFase46" component={VideoFase46} durationInFrames={DURACAO_FASE46} fps={30} width={1080} height={1920} />;
registerRoot(Raiz);
