import { Composition, registerRoot } from "remotion";
import { DURACAO_QUADROS, VideoElNino } from "./Video";

// Entrada própria: o bundle fica rápido e só carrega este vídeo.
const Raiz: React.FC = () => <Composition id="ElNinoVideo" component={VideoElNino} durationInFrames={DURACAO_QUADROS} fps={30} width={1080} height={1920} />;
registerRoot(Raiz);
