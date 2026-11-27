import { Composition, registerRoot } from "remotion";
import { DURACAO_FASE26, VideoFase26 } from "./Video";

// Entrada só da Fase 26 (bundle leve, com --public-dir de uma pasta enxuta).
const Raiz: React.FC = () => <Composition id="FaseExtraFase26" component={VideoFase26} durationInFrames={DURACAO_FASE26} fps={30} width={1080} height={1920} />;
registerRoot(Raiz);
