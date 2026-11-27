import { Composition, registerRoot } from "remotion";
import { DURACAO_HISTORICO, Historico } from "./Historico";

// Entrada só do corte "HISTÓRICO" (bundle leve com --public-dir enxuto).
const Raiz: React.FC = () => <Composition id="KoskyHistorico" component={Historico} durationInFrames={DURACAO_HISTORICO} fps={30} width={1080} height={1920} />;
registerRoot(Raiz);
