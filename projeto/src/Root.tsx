import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import { CenaTeste } from "./CenaTeste";
import { Cena1 } from "./Cena1";
import { TerraPlana15s } from "./Cena15s";
import { CenaCidade, DURACAO_CENA_CIDADE } from "./CenaCidade";
import { TerraPlana } from "./TerraPlana";
import { DURACAO_VIDEO, VideoCompleto } from "./VideoCompleto";
import { DURACAO, FPS } from "./roteiro";
import { DURACAO_FRAMES } from "./v2/tempo";
import { VideoGravidade } from "./gravidade/Video";
import { DURACAO_FRAMES as DURACAO_GRAVIDADE } from "./gravidade/tempo";
import { VideoNamorada } from "./namorada/Video";
import { DURACAO_FRAMES as DURACAO_NAMORADA } from "./namorada/tempo";
import { VideoImortal } from "./imortal/Video";
import { DURACAO_TESTE, TestePraia } from "./cinema/TestePraia";
import { DURACAO_ELENCO, TesteElenco } from "./cinema/TesteElenco";
import { DURACAO_IA, TesteIA } from "./cinema/TesteIA";
import { DURACAO_VITRINE, Vitrine } from "./cinema/kit/Vitrine";
import { DURACAO_TESTE_RUA, TesteRua } from "./cinema/kit/TesteRua";
import { DURACAO_TESTE_CAMERAS, TesteCameras } from "./cinema/kit/TesteCameras";
import { AlertaTeste, DURACAO_ALERTA_TESTE } from "./alerta/Teste";
import { AlertaPrevia, DURACAO_PREVIA } from "./alerta2/Previa";
import { AlertaAnima, DURACAO_ANIMA } from "./alerta2/Anima";
import { AlertaFontes } from "./alerta2/Fontes";
import { AlertaParte1, DURACAO_PARTE1 } from "./alerta2/Parte1";
import { DURACAO_BONECO, TesteBoneco, TesteBonecoDetalhe } from "./cinema/TesteBoneco";
import { DURACAO_TELEPATIA, TesteTelepatia } from "./cinema/TesteTelepatia";
import { DURACAO_FRAMES as DURACAO_TERRA_PARA } from "./terra-para/tempo";
import { VideoTerraPara } from "./terra-para/Video";
import { DURACAO_FRAMES as DURACAO_IMORTAL } from "./imortal/tempo";
import { VideoAstral } from "./astral/Video";
import { DURACAO_FRAMES as DURACAO_ASTRAL } from "./astral/tempo";
import { VideoGlomerulo } from "./glomerulo/Video";
import { DURACAO_FRAMES as DURACAO_GLOMERULO } from "./glomerulo/tempo";
import { DURACAO_TESTE_AURORA, TesteAurora } from "./aurora/Teste";
import { DURACAO_EP1, EpisodioAurora } from "./aurora/Episodio";
import { DURACAO_TESTE_EP2, TesteEp2 } from "./aurora-ep2/Teste";
import { DURACAO_EP2, EpisodioAurora2 } from "./aurora-ep2/Episodio";
import { ElencoEdson } from "./aurora-ep3/Teste";
import { DURACAO_EP3, EpisodioAurora3 } from "./aurora-ep3/Episodio";
import { ElencoKaique } from "./aurora-ep4/Teste";
import { DURACAO_EP4, EpisodioAurora4 } from "./aurora-ep4/Episodio";
import { DURACAO_EP5, EpisodioAurora5 } from "./aurora-ep5/Episodio";
import { DURACAO_EP5B, EpisodioAurora5b } from "./aurora-ep5b/Episodio";
import { DURACAO_QUADROS, VideoElNino } from "./noticias/el-nino/Video";
import { DURACAO_FASE01, VideoFase01 } from "./pagina-games/fase01/Video";
import { DURACAO_FASE01_V4, VideoFase01V4 } from "./pagina-games/fase01/VideoV4";
import { DURACAO_FASE02, VideoFase02 } from "./pagina-games/fase02/Video";
import { DURACAO_FASE03, VideoFase03 } from "./pagina-games/fase03/Video";
import { DURACAO_FASE04, VideoFase04 } from "./pagina-games/fase04/Video";
import { DURACAO_FASE05, VideoFase05 } from "./pagina-games/fase05/Video";
import { DURACAO_FASE06, VideoFase06 } from "./pagina-games/fase06/Video";
import { DURACAO_FASE07, VideoFase07 } from "./pagina-games/fase07/Video";
import { DURACAO_FASE08, VideoFase08 } from "./pagina-games/fase08/Video";
import { DURACAO_FASE09, VideoFase09 } from "./pagina-games/fase09/Video";
import { DURACAO_FASE10, VideoFase10 } from "./pagina-games/fase10/Video";
import { DURACAO_FASE11, VideoFase11 } from "./pagina-games/fase11/Video";
import { DURACAO_FASE12, VideoFase12 } from "./pagina-games/fase12/Video";
import { DURACAO_FASE13, VideoFase13 } from "./pagina-games/fase13/Video";
import { DURACAO_FASE14, VideoFase14 } from "./pagina-games/fase14/Video";
import { DURACAO_FASE15, VideoFase15 } from "./pagina-games/fase15/Video";
import { DURACAO_FASE18, VideoFase18 } from "./pagina-games/fase18/Video";
import { DURACAO_FASE17, VideoFase17 } from "./pagina-games/fase17/Video";
import { DURACAO_FASE16, VideoFase16 } from "./pagina-games/fase16/Video";
import { CorteLive, CorteLiveVertical } from "./cortes/CorteLive";
import { Corte3ComGancho, CORTE3_SEG, GANCHO3_SEG } from "./cortes/Gancho3";
import { Clipe2, CLIPE2_SEG } from "./cortes/Clipe2";
import { CorteKosky, CORTES_K } from "./cortes/kosky/CorteKosky";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyComposition />
      {/* Fase Extra (página de GTA 6): Fase 01 */}
      <Composition id="CorteLive1" component={CorteLive} defaultProps={{ corte: "corte1" as const }} durationInFrames={95 * 30} fps={30} width={1920} height={1080} />
      <Composition id="CorteLive1Vertical" component={CorteLiveVertical} defaultProps={{ corte: "corte1" as const }} durationInFrames={Math.round(57.8 * 30)} fps={30} width={1080} height={1920} />
      <Composition id="CorteLive2Vertical" component={CorteLiveVertical} defaultProps={{ corte: "corte2" as const }} durationInFrames={Math.round(55.9 * 30)} fps={30} width={1080} height={1920} />
      <Composition id="CorteClipePegueOGato" component={Clipe2} durationInFrames={Math.round(CLIPE2_SEG * 30)} fps={30} width={1080} height={1920} />
      <Composition id="CorteLive3ComGancho" component={Corte3ComGancho} durationInFrames={Math.round(GANCHO3_SEG * 30) + Math.round(CORTE3_SEG * 30)} fps={30} width={1080} height={1920} />
      <Composition id="CorteLive3Vertical" component={CorteLiveVertical} defaultProps={{ corte: "corte3" as const }} durationInFrames={Math.round(44.7 * 30)} fps={30} width={1080} height={1920} />
      <Composition id="FaseExtraFase06" component={VideoFase06} durationInFrames={DURACAO_FASE06} fps={30} width={1080} height={1920} />
      <Composition id="FaseExtraFase07" component={VideoFase07} durationInFrames={DURACAO_FASE07} fps={30} width={1080} height={1920} />
      <Composition id="FaseExtraFase08" component={VideoFase08} durationInFrames={DURACAO_FASE08} fps={30} width={1080} height={1920} />
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
      <Composition id="FaseExtraFase05" component={VideoFase05} durationInFrames={DURACAO_FASE05} fps={30} width={1080} height={1920} />
      <Composition id="FaseExtraFase04" component={VideoFase04} durationInFrames={DURACAO_FASE04} fps={30} width={1080} height={1920} />
      <Composition id="FaseExtraFase03" component={VideoFase03} durationInFrames={DURACAO_FASE03} fps={30} width={1080} height={1920} />
      <Composition id="FaseExtraFase02" component={VideoFase02} durationInFrames={DURACAO_FASE02} fps={30} width={1080} height={1920} />
      <Composition id="FaseExtraFase01V4" component={VideoFase01V4} durationInFrames={DURACAO_FASE01_V4} fps={30} width={1080} height={1920} />
      <Composition id="FaseExtraFase01" component={VideoFase01} durationInFrames={DURACAO_FASE01} fps={30} width={1080} height={1920} />
      {/* Notícias: El Niño, "a casa partida" */}
      <Composition id="ElNinoVideo" component={VideoElNino} durationInFrames={DURACAO_QUADROS} fps={30} width={1080} height={1920} />
      {/* AURORA ep. 1 — teste do visual 2.5D (cenas 1 a 4) */}
      <Composition id="AuroraTeste" component={TesteAurora} durationInFrames={DURACAO_TESTE_AURORA} fps={30} width={1080} height={1920} />
      <Composition id="AuroraEp1" component={EpisodioAurora} durationInFrames={DURACAO_EP1} fps={30} width={1080} height={1920} />
      <Composition id="AuroraEp2Teste" component={TesteEp2} durationInFrames={DURACAO_TESTE_EP2} fps={30} width={1080} height={1920} />
      <Composition id="AuroraEp2" component={EpisodioAurora2} durationInFrames={DURACAO_EP2} fps={30} width={1080} height={1920} />
      <Composition id="AuroraEp3Elenco" component={ElencoEdson} durationInFrames={30} fps={30} width={1080} height={1920} />
      <Composition id="AuroraEp3" component={EpisodioAurora3} durationInFrames={DURACAO_EP3} fps={30} width={1080} height={1920} />
      <Composition id="AuroraEp4Elenco" component={ElencoKaique} durationInFrames={30} fps={30} width={1080} height={1920} />
      <Composition id="AuroraEp4" component={EpisodioAurora4} durationInFrames={DURACAO_EP4} fps={30} width={1080} height={1920} />
      <Composition id="AuroraEp5" component={EpisodioAurora5} durationInFrames={DURACAO_EP5} fps={30} width={1080} height={1920} />
      <Composition id="AuroraEp5b" component={EpisodioAurora5b} durationInFrames={DURACAO_EP5B} fps={30} width={1080} height={1920} />
      {/* Teste do visual novo (skill visual-cinematico): Boa Viagem, personagens semi-realistas */}
      <Composition id="EstiloTestePraia" component={TestePraia} durationInFrames={DURACAO_TESTE} fps={30} width={1080} height={1920} />
      <Composition id="EstiloElenco" component={TesteElenco} durationInFrames={DURACAO_ELENCO} fps={30} width={1080} height={1920} />
      <Composition id="EstiloBoneco" component={TesteBoneco} durationInFrames={DURACAO_BONECO} fps={30} width={1080} height={1920} />
      <Composition id="EstiloBonecoDetalhe" component={TesteBonecoDetalhe} durationInFrames={32} fps={30} width={1080} height={1920} />
      {/* Kit de cenários (rua, calçadão, mercadinho, parque, cidade) em várias horas do dia */}
      <Composition id="EstiloCenarios" component={Vitrine} durationInFrames={DURACAO_VITRINE} fps={30} width={1080} height={1920} />
      <Composition id="EstiloRuaDetalhe" component={TesteRua} durationInFrames={DURACAO_TESTE_RUA} fps={30} width={1080} height={1920} />
      <Composition id="AlertaParte1" component={AlertaParte1} durationInFrames={DURACAO_PARTE1} fps={30} width={1080} height={1920} />
      <Composition id="AlertaFontes" component={AlertaFontes} durationInFrames={4} fps={30} width={1080} height={1920} />
      <Composition id="AlertaAnima" component={AlertaAnima} durationInFrames={DURACAO_ANIMA} fps={30} width={1080} height={1920} />
      <Composition id="AlertaPrevia" component={AlertaPrevia} durationInFrames={DURACAO_PREVIA} fps={30} width={1080} height={1920} />
      <Composition id="AlertaTeste" component={AlertaTeste} durationInFrames={DURACAO_ALERTA_TESTE} fps={30} width={1080} height={1920} />
      <Composition id="EstiloCameras"component={TesteCameras} durationInFrames={DURACAO_TESTE_CAMERAS} fps={30} width={1080} height={1920} />
      <Composition id="EstiloIA" component={TesteIA} durationInFrames={DURACAO_IA} fps={30} width={1080} height={1920} />
      {/* Elenco do vídeo da telepatia (Marcos, Juliana, Rodrigo) dentro do Mercadinho */}
      <Composition id="TelepatiaElenco" component={TesteTelepatia} durationInFrames={DURACAO_TELEPATIA} fps={30} width={1080} height={1920} />
      {/* TERRA PARA — "E se a Terra parasse de girar, de repente, na praia de Copacabana?" (V1, ~58s) */}
      {/* DEMO MEDICINA — glomerulonefrite pós-estreptocócica (caso do Lucas), ~1 min */}
      <Composition id="Glomerulonefrite" component={VideoGlomerulo} durationInFrames={DURACAO_GLOMERULO} fps={30} width={1080} height={1920} />
      <Composition id="ProjecaoAstral" component={VideoAstral} durationInFrames={DURACAO_ASTRAL} fps={30} width={1080} height={1920} />
      <Composition id="TerraParaV1" component={VideoTerraPara} durationInFrames={DURACAO_TERRA_PARA} fps={30} width={1080} height={1920} />
      {/* IMORTAL — "E se você acordasse amanhã e não pudesse mais morrer?" (~1min43) */}
      <Composition
        id="Imortal"
        component={VideoImortal}
        durationInFrames={DURACAO_IMORTAL}
        fps={30}
        width={1080}
        height={1920}
      />
      {/* NAMORADA — versão final: "E se o Gabriel arrumasse uma namorada?" (~1 min) */}
      <Composition
        id="NamoradaFinal"
        component={VideoNamorada}
        durationInFrames={DURACAO_NAMORADA}
        fps={30}
        width={1080}
        height={1920}
      />
      {/* Teste: "E se a gravidade caísse pela metade?" (~1min30) */}
      <Composition
        id="EseGravidade"
        component={VideoGravidade}
        durationInFrames={DURACAO_GRAVIDADE}
        fps={30}
        width={1080}
        height={1920}
      />
      {/* Vídeo de ~58 s: "E se a Terra fosse plana?" */}
      <Composition
        id="Cena1"
        component={Cena1}
        durationInFrames={DURACAO_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
      {/* Versão de teste de 15 s (referência visual) */}
      <Composition
        id="TerraPlana15s"
        component={TerraPlana15s}
        durationInFrames={DURACAO}
        fps={FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="VideoCompleto"
        component={VideoCompleto}
        durationInFrames={DURACAO_VIDEO}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="CenaTeste"
        component={CenaTeste}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="CenaCidade"
        component={CenaCidade}
        durationInFrames={DURACAO_CENA_CIDADE}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="TerraPlana"
        component={TerraPlana}
        durationInFrames={450}
        fps={30}
        width={1080}
        height={1920}
      />
      {/* cortes da live do kosky (16:9) */}
      {Object.entries(CORTES_K).map(([id, c]) => (
        <Composition key={id} id={`Kosky-${id}`} component={CorteKosky} defaultProps={{ id }} durationInFrames={Math.ceil(c.segundos * 30)} fps={30} width={1080} height={1920} />
      ))}
    </>
  );
};
