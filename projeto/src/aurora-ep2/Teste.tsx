import { AbsoluteFill, useCurrentFrame } from "remotion";
import { CenaCeuVerde } from "../aurora/cenas";
import { CenaFinal } from "../aurora/cenas2";
import { Acabamento, Pergunta } from "../aurora/estilo";
import { CenaBusaoDentro, CenaBusaoLado, CenaQuadra } from "./cenas";
import { CenaAtrito, CenaBussola, CenaDistancia, CenaGeladeira, CenaLaje, CenaMensagem, CenaPonto, CenaQuarto, CenaRegra, CenaSeFudeu } from "./cenas2";

// Teste visual do ep. 2 (sem voz ainda): todas as cenas na ordem do roteiro, com tempos
// provisórios. Na montagem as cenas passam a seguir o tempo das falas.
const FPS = 30;
const Final: React.FC<{ t: number }> = ({ t }) => <CenaFinal t={t} ep={2} titulo="BRUNO GRUDOU" />;
const CENAS: { de: number; C: React.FC<{ t: number }> }[] = [
  { de: 0, C: CenaBusaoLado },
  { de: 4.5, C: CenaCeuVerde },
  { de: 8, C: CenaLaje },
  { de: 13, C: CenaQuarto },
  { de: 20, C: CenaGeladeira },
  { de: 30, C: CenaBussola },
  { de: 39, C: CenaDistancia },
  { de: 45, C: CenaPonto },
  { de: 47.5, C: CenaBusaoDentro },
  { de: 56.5, C: CenaBusaoLado },
  { de: 62, C: CenaAtrito },
  { de: 66, C: CenaRegra },
  { de: 74, C: CenaMensagem },
  { de: 83, C: CenaQuadra },
  { de: 88, C: CenaSeFudeu },
  { de: 90, C: Final },
];
export const DURACAO_TESTE_EP2 = 94 * FPS;

export const TesteEp2: React.FC = () => {
  const s = useCurrentFrame() / FPS;
  let i = 0;
  CENAS.forEach((c, k) => {
    if (s >= c.de) i = k;
  });
  const { C, de } = CENAS[i];
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <C t={s - de} />
      <Acabamento />
      {s < 3.2 && (
        <Pergunta
          s={s}
          ate={3.2}
          linhas={[
            [{ t: "E" }, { t: "SE" }, { t: "CÊ" }, { t: "ACORDASSE" }, { t: "AMANHÃ" }],
            [{ t: "VIRANDO" }, { t: "UM" }, { t: "ÍMÃ?", c: "a" }],
          ]}
        />
      )}
    </AbsoluteFill>
  );
};
