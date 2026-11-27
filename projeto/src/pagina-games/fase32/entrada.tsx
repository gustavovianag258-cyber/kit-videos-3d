import { Composition, registerRoot } from "remotion";
import { DURACAO_FASE32, VideoFase32 } from "./Video";

// Entrada só da Fase 32 (bundle leve, com --public-dir de uma pasta enxuta).
const Raiz: React.FC = () => <Composition id="FaseExtraFase32" component={VideoFase32} durationInFrames={DURACAO_FASE32} fps={30} width={1080} height={1920} />;
registerRoot(Raiz);
