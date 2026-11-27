import { Composition, registerRoot } from "remotion";
import { DURACAO_FASE19, VideoFase19 } from "./Video";

// Entrada só da Fase 19 (bundle leve, com --public-dir de uma pasta enxuta).
const Raiz: React.FC = () => <Composition id="FaseExtraFase19" component={VideoFase19} durationInFrames={DURACAO_FASE19} fps={30} width={1080} height={1920} />;
registerRoot(Raiz);
