import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { Vinheta } from "../v2/ui";
import type { PropsPlano } from "../namorada/comum";
import {
  PlanoAlmoco,
  PlanoBebe,
  PlanoBolo,
  PlanoCansado,
  PlanoCasamento,
  PlanoDesconfiado,
  PlanoEspreguica,
  PlanoFilhoGrande,
  PlanoFilhoVelho,
  PlanoLigaMae,
  PlanoNovaFamilia,
  PlanoQuartoAcorda,
  PlanoRetratos,
  PlanoSorri,
  PlanoVelorio,
} from "./Casa";
import {
  PlanoDedos,
  PlanoEscuro,
  PlanoEspacoLonge,
  PlanoEspacoRosto,
  PlanoEstrelas,
  PlanoInfinito,
  PlanoOceanos,
  PlanoSol,
  PlanoTerraAcaba,
  PlanoTerraCalma,
  PlanoUltimaEstrela,
  PlanoVoceNao,
  PlanoXadrez,
  PlanoXadrezOutroLado,
} from "./Cosmos";
import {
  PlanoAlien,
  PlanoAlienEIcaro,
  PlanoCidadeVazia,
  PlanoDisco,
  PlanoFuturo,
  PlanoInvasao,
  PlanoLaser,
  PlanoNada,
  PlanoParceiro,
  PlanoSoVoce,
} from "./Futuro";
import { Sons } from "./sons";
import { FPS, planoEm, type IdPlano } from "./tempo";
import {
  PlanoAviao,
  PlanoCratera,
  PlanoDePe,
  PlanoJoinha,
  PlanoLevanta,
  PlanoPraia,
  PlanoPredio,
  PlanoQueda,
  PlanoRisoFraco,
  PlanoTubaroes,
} from "./Testes";
import { Avisos, Cartaz, Clarao, Etiquetas, Hud, Legendas, Pergunta, Selos, Tinta, Transicoes } from "./ui";

// "E se você acordasse amanhã e não pudesse mais morrer?" — IMORTAL

const PLANOS: Record<IdPlano, React.FC<PropsPlano>> = {
  quartoAcorda: PlanoQuartoAcorda,
  quartoEspreguica: PlanoEspreguica,
  desconfiado: PlanoDesconfiado,
  normal: (p) => <PlanoDesconfiado {...p} normal />,
  praia: PlanoPraia,
  tubaroes: PlanoTubaroes,
  predio: PlanoPredio,
  aviao: PlanoAviao,
  queda: PlanoQueda,
  cratera: PlanoCratera,
  levanta: PlanoLevanta,
  dePe: PlanoDePe,
  risoFraco: PlanoRisoFraco,
  joinha: PlanoJoinha,
  almoco: PlanoAlmoco,
  casamento: PlanoCasamento,
  bebe: PlanoBebe,
  filhoGrande: PlanoFilhoGrande,
  filhoVelho: PlanoFilhoVelho,
  velorio: PlanoVelorio,
  novaFamilia: PlanoNovaFamilia,
  retratos: PlanoRetratos,
  bolo1: (p) => <PlanoBolo {...p} n={0} />,
  bolo2: (p) => <PlanoBolo {...p} n={1} />,
  bolo3: (p) => <PlanoBolo {...p} n={2} />,
  cansado: PlanoCansado,
  futuro: PlanoFuturo,
  disco: PlanoDisco,
  invasao: PlanoInvasao,
  laser: PlanoLaser,
  nada: PlanoNada,
  alien: PlanoAlien,
  parceiro: PlanoParceiro,
  alienEIcaro: PlanoAlienEIcaro,
  cidadeVazia: PlanoCidadeVazia,
  soVoce: PlanoSoVoce,
  oceanos: PlanoOceanos,
  sol: PlanoSol,
  terraAcaba: PlanoTerraAcaba,
  voceNao: PlanoVoceNao,
  espacoLonge: PlanoEspacoLonge,
  espacoRosto: PlanoEspacoRosto,
  estrelas: PlanoEstrelas,
  ultimaEstrela: PlanoUltimaEstrela,
  escuro: PlanoEscuro,
  dedos: PlanoDedos,
  xadrez: PlanoXadrez,
  xadrezOutroLado: PlanoXadrezOutroLado,
  infinito: PlanoInfinito,
  infinitoLonge: (p) => <PlanoInfinito {...p} longe />,
  acordaDeNovo: (p) => <PlanoQuartoAcorda {...p} volta />,
  sorri: PlanoSorri,
  ligaMae: PlanoLigaMae,
  terraCalma: PlanoTerraCalma,
};

export const VideoImortal: React.FC = () => {
  const frame = useCurrentFrame();
  const s = frame / FPS;
  const plano = planoEm(s);
  const Plano = PLANOS[plano.id];
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Plano key={plano.id} t={plano.t} dur={plano.dur} frame={frame} s={s} />
      <Tinta s={s} />
      <Vinheta forca={0.42} />
      <Transicoes s={s} />
      <Clarao s={s} />

      <Pergunta s={s} />
      <Hud s={s} />
      <Avisos s={s} />
      <Selos s={s} />
      <Etiquetas s={s} />
      <Legendas s={s} />
      <Cartaz s={s} />

      {/* vozes aprovadas (narrador + Ícaro + alien), já montadas: não mexer */}
      <Audio src={staticFile("imortal/vozes.wav")} />
      <Sons />
    </AbsoluteFill>
  );
};
