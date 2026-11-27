import { Composition, registerRoot } from "remotion";
import { DURACAO_FASE20, VideoFase20 } from "./Video";

// Entrada só da Fase 20 (bundle leve, com --public-dir de uma pasta enxuta).
const Raiz: React.FC = () => <Composition id="FaseExtraFase20" component={VideoFase20} durationInFrames={DURACAO_FASE20} fps={30} width={1080} height={1920} />;
registerRoot(Raiz);
