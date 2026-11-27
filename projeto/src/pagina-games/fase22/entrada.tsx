import { Composition, registerRoot } from "remotion";
import { DURACAO_FASE22, VideoFase22 } from "./Video";

// Entrada só da Fase 22 (bundle leve, com --public-dir de uma pasta enxuta).
const Raiz: React.FC = () => <Composition id="FaseExtraFase22" component={VideoFase22} durationInFrames={DURACAO_FASE22} fps={30} width={1080} height={1920} />;
registerRoot(Raiz);
