import { Composition, registerRoot } from "remotion";
import { DURACAO_FASE26_MAPA, VideoFase26Mapa } from "./VideoMapa";

// Entrada só do vídeo rápido "onde fica" da Fase 26 (bundle leve, com --public-dir de uma pasta enxuta).
const Raiz: React.FC = () => <Composition id="FaseExtraFase26Mapa" component={VideoFase26Mapa} durationInFrames={DURACAO_FASE26_MAPA} fps={30} width={1080} height={1920} />;
registerRoot(Raiz);
