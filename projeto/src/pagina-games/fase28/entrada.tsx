import { Composition, registerRoot } from "remotion";
import { DURACAO_FASE28, VideoFase28 } from "./Video";

// Entrada só da Fase 28 (bundle leve, com --public-dir de uma pasta enxuta).
const Raiz: React.FC = () => <Composition id="FaseExtraFase28" component={VideoFase28} durationInFrames={DURACAO_FASE28} fps={30} width={1080} height={1920} />;
registerRoot(Raiz);
