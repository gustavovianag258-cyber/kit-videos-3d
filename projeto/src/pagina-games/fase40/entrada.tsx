import { Composition, registerRoot } from "remotion";
import { DURACAO_FASE40, VideoFase40 } from "./Video";

// Entrada só da Fase 40 (bundle leve, com --public-dir de uma pasta enxuta).
const Raiz: React.FC = () => <Composition id="FaseExtraFase40" component={VideoFase40} durationInFrames={DURACAO_FASE40} fps={30} width={1080} height={1920} />;
registerRoot(Raiz);
