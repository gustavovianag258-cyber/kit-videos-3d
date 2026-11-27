import { Composition, registerRoot } from "remotion";
import { DURACAO_FASE38, VideoFase38 } from "./Video";

// Entrada só da Fase 38 (bundle leve, com --public-dir de uma pasta enxuta).
const Raiz: React.FC = () => <Composition id="FaseExtraFase38" component={VideoFase38} durationInFrames={DURACAO_FASE38} fps={30} width={1080} height={1920} />;
registerRoot(Raiz);
