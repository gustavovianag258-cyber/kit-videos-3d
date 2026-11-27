import { Composition, registerRoot } from "remotion";
import { DURACAO_FASE29, VideoFase29 } from "./Video";

// Entrada só da Fase 29 (bundle leve, com --public-dir de uma pasta enxuta).
const Raiz: React.FC = () => <Composition id="FaseExtraFase29" component={VideoFase29} durationInFrames={DURACAO_FASE29} fps={30} width={1080} height={1920} />;
registerRoot(Raiz);
