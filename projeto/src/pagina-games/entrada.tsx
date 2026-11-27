import { Composition, registerRoot } from "remotion";
import { DURACAO_FASE01, VideoFase01 } from "./fase01/Video";
import { DURACAO_FASE01_V4, VideoFase01V4 } from "./fase01/VideoV4";
import { DURACAO_FASE02, VideoFase02 } from "./fase02/Video";
import { DURACAO_FASE03, VideoFase03 } from "./fase03/Video";
import { DURACAO_FASE04, VideoFase04 } from "./fase04/Video";
import { DURACAO_FASE05, VideoFase05 } from "./fase05/Video";
import { DURACAO_FASE06, VideoFase06 } from "./fase06/Video";
import { DURACAO_FASE07, VideoFase07 } from "./fase07/Video";
import { DURACAO_FASE08, VideoFase08 } from "./fase08/Video";
import { DURACAO_FASE09, VideoFase09 } from "./fase09/Video";
import { DURACAO_FASE10, VideoFase10 } from "./fase10/Video";
import { DURACAO_FASE11, VideoFase11 } from "./fase11/Video";
import { DURACAO_FASE12, VideoFase12 } from "./fase12/Video";
import { DURACAO_FASE13, VideoFase13 } from "./fase13/Video";
import { DURACAO_FASE14, VideoFase14 } from "./fase14/Video";
import { DURACAO_FASE15, VideoFase15 } from "./fase15/Video";
import { DURACAO_FASE18, VideoFase18 } from "./fase18/Video";
import { DURACAO_FASE17, VideoFase17 } from "./fase17/Video";
import { DURACAO_FASE16, VideoFase16 } from "./fase16/Video";
import { FotoPerfil, FotoPerfilVice } from "./Perfil";

// Entrada só da página Fase Extra, para empacotar e renderizar mais rápido que o Root inteiro.
const Raiz: React.FC = () => (
  <>
    <Composition id="FotoPerfilC" component={FotoPerfilVice} defaultProps={{ modelo: "c" as const }} durationInFrames={1} fps={30} width={1080} height={1080} />
    <Composition id="FotoPerfilD" component={FotoPerfilVice} defaultProps={{ modelo: "d" as const }} durationInFrames={1} fps={30} width={1080} height={1080} />
    <Composition id="FotoPerfilA" component={FotoPerfil} defaultProps={{ modelo: "a" as const }} durationInFrames={1} fps={30} width={1080} height={1080} />
    <Composition id="FotoPerfilB" component={FotoPerfil} defaultProps={{ modelo: "b" as const }} durationInFrames={1} fps={30} width={1080} height={1080} />
    <Composition id="FaseExtraFase18" component={VideoFase18} durationInFrames={DURACAO_FASE18} fps={30} width={1080} height={1920} />
    <Composition id="FaseExtraFase17" component={VideoFase17} durationInFrames={DURACAO_FASE17} fps={30} width={1080} height={1920} />
    <Composition id="FaseExtraFase16" component={VideoFase16} durationInFrames={DURACAO_FASE16} fps={30} width={1080} height={1920} />
    <Composition id="FaseExtraFase15" component={VideoFase15} durationInFrames={DURACAO_FASE15} fps={30} width={1080} height={1920} />
    <Composition id="FaseExtraFase14" component={VideoFase14} durationInFrames={DURACAO_FASE14} fps={30} width={1080} height={1920} />
    <Composition id="FaseExtraFase13" component={VideoFase13} durationInFrames={DURACAO_FASE13} fps={30} width={1080} height={1920} />
    <Composition id="FaseExtraFase12" component={VideoFase12} durationInFrames={DURACAO_FASE12} fps={30} width={1080} height={1920} />
    <Composition id="FaseExtraFase11" component={VideoFase11} durationInFrames={DURACAO_FASE11} fps={30} width={1080} height={1920} />
    <Composition id="FaseExtraFase10" component={VideoFase10} durationInFrames={DURACAO_FASE10} fps={30} width={1080} height={1920} />
    <Composition id="FaseExtraFase09" component={VideoFase09} durationInFrames={DURACAO_FASE09} fps={30} width={1080} height={1920} />
    <Composition id="FaseExtraFase08" component={VideoFase08} durationInFrames={DURACAO_FASE08} fps={30} width={1080} height={1920} />
    <Composition id="FaseExtraFase07" component={VideoFase07} durationInFrames={DURACAO_FASE07} fps={30} width={1080} height={1920} />
    <Composition id="FaseExtraFase06" component={VideoFase06} durationInFrames={DURACAO_FASE06} fps={30} width={1080} height={1920} />
    <Composition id="FaseExtraFase05" component={VideoFase05} durationInFrames={DURACAO_FASE05} fps={30} width={1080} height={1920} />
    <Composition id="FaseExtraFase04" component={VideoFase04} durationInFrames={DURACAO_FASE04} fps={30} width={1080} height={1920} />
    <Composition id="FaseExtraFase03" component={VideoFase03} durationInFrames={DURACAO_FASE03} fps={30} width={1080} height={1920} />
    <Composition id="FaseExtraFase02" component={VideoFase02} durationInFrames={DURACAO_FASE02} fps={30} width={1080} height={1920} />
    <Composition id="FaseExtraFase01V4" component={VideoFase01V4} durationInFrames={DURACAO_FASE01_V4} fps={30} width={1080} height={1920} />
    <Composition id="FaseExtraFase01" component={VideoFase01} durationInFrames={DURACAO_FASE01} fps={30} width={1080} height={1920} />
  </>
);
registerRoot(Raiz);
