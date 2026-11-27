import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Vinheta } from "../v2/ui";
import { PlanoBairro, PlanoTelhado } from "./Bairro";
import {
  PlanoEspaco,
  PlanoExplosao,
  PlanoLasers,
  PlanoMagnitude,
  PlanoPlacas,
  PlanoRecorde,
  PlanoTerraCalma,
  PlanoTerraLaranja,
  PlanoTerraRacha,
  PlanoZoomBrasil,
} from "./CenasTerra";
import type { PropsPlano } from "./comum";
import { PlanoCristo, PlanoEiffel, PlanoMae, PlanoMuralha } from "./Mundo";
import { PlanoChoque, PlanoDeitado, PlanoQuarto, PlanoSentado } from "./Quarto";
import { PlanoSala } from "./Sala";
import { Sons } from "./sons";
import { FPS, planoEm, seg, TRECHOS_NARRACAO, type IdPlano } from "./tempo";
import { Aviso, Cartaz, ChatBomDia, ChatPedido, Clarao, Etiquetas, GrupoSolteiros, Hud, Legendas, Selos } from "./ui";

// "E se o Gabriel arrumasse uma namorada?" — NAMORADA, versão final

const PLANOS: Record<IdPlano, React.FC<PropsPlano>> = {
  espaco: PlanoEspaco,
  zoomBrasil: PlanoZoomBrasil,
  salaAmpla: (p) => <PlanoSala {...p} variante="ampla" />,
  cientista: (p) => <PlanoSala {...p} variante="cientista" />,
  telao: (p) => <PlanoSala {...p} variante="telao" />,
  telaoPerto: (p) => <PlanoSala {...p} variante="telaoPerto" />,
  cientistasOlham: (p) => <PlanoSala {...p} variante="olham" />,
  quartoAmplo: (p) => <PlanoQuarto {...p} variante="amplo" />,
  quartoPerto: (p) => <PlanoQuarto {...p} variante="perto" />,
  chat: (p) => <PlanoQuarto {...p} variante="chat" />,
  choque: PlanoChoque,
  bairro: PlanoBairro,
  mae: PlanoMae,
  // o grupo do WhatsApp é só interface (desenhado por cima)
  grupo: () => null,
  terraRacha: PlanoTerraRacha,
  placas: (p) => <PlanoPlacas {...p} angulo={0} />,
  placas2: (p) => <PlanoPlacas {...p} angulo={1} />,
  magnitude: PlanoMagnitude,
  recorde: (p) => <PlanoRecorde {...p} perto={false} />,
  recorde2: (p) => <PlanoRecorde {...p} perto />,
  cristo: PlanoCristo,
  eiffel: PlanoEiffel,
  muralha: PlanoMuralha,
  salaVermelha: (p) => <PlanoSala {...p} variante="vermelha" />,
  mapa: (p) => <PlanoSala {...p} variante="mapa" />,
  lasers: PlanoLasers,
  telhado: PlanoTelhado,
  deitado: PlanoDeitado,
  terraLaranja: PlanoTerraLaranja,
  explosao: PlanoExplosao,
  terraCalma: PlanoTerraCalma,
  sentado: (p) => <PlanoSentado {...p} variante="serio" />,
  medalha: (p) => <PlanoSentado {...p} variante="medalha" />,
  medalhaPerto: (p) => <PlanoSentado {...p} variante="medalhaPerto" />,
  // o cartaz escurece por cima do último plano
  cartaz: (p) => <PlanoSentado {...p} t={p.t + 2.4} dur={p.dur + 2.4} variante="medalhaPerto" />,
};

export const VideoNamorada: React.FC = () => {
  const frame = useCurrentFrame();
  const s = frame / FPS;
  const plano = planoEm(s);
  const Plano = PLANOS[plano.id];
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Plano key={plano.id} t={plano.t} dur={plano.dur} frame={frame} s={s} />
      <GrupoSolteiros s={s} />
      <Vinheta forca={0.4} />
      <Clarao s={s} />

      <ChatPedido s={s} />
      <ChatBomDia s={s} />
      <Hud s={s} />
      <Aviso s={s} />
      <Selos s={s} />
      <Etiquetas s={s} />
      <Legendas s={s} />
      <Cartaz s={s} />

      {TRECHOS_NARRACAO.map((t) => (
        <Sequence key={t.em} from={seg(t.em)} layout="none">
          <Audio src={staticFile("namorada/narracao.mp3")} trimBefore={seg(t.de)} trimAfter={seg(t.ate)} />
        </Sequence>
      ))}
      <Sons />
    </AbsoluteFill>
  );
};
