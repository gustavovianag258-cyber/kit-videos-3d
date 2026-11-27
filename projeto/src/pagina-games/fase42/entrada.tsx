import { Composition, registerRoot } from "remotion";
import { DURACAO_FASE42, VideoFase42 } from "./Video";

// Entrada só da Fase 42 (bundle leve, com --public-dir de uma pasta enxuta).
const Raiz: React.FC = () => <Composition id="FaseExtraFase42" component={VideoFase42} durationInFrames={DURACAO_FASE42} fps={30} width={1080} height={1920} />;
registerRoot(Raiz);
