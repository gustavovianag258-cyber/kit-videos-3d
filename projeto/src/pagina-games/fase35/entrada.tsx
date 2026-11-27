import { Composition, registerRoot } from "remotion";
import { DURACAO_FASE35, VideoFase35 } from "./Video";

// Entrada só da Fase 35 (bundle leve, com --public-dir de uma pasta enxuta).
const Raiz: React.FC = () => <Composition id="FaseExtraFase35" component={VideoFase35} durationInFrames={DURACAO_FASE35} fps={30} width={1080} height={1920} />;
registerRoot(Raiz);
