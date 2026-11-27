import { Composition, registerRoot } from "remotion";
import { DURACAO_FASE21, VideoFase21 } from "./Video";

// Entrada só da Fase 21 (bundle leve, com --public-dir de uma pasta enxuta).
const Raiz: React.FC = () => <Composition id="FaseExtraFase21" component={VideoFase21} durationInFrames={DURACAO_FASE21} fps={30} width={1080} height={1920} />;
registerRoot(Raiz);
