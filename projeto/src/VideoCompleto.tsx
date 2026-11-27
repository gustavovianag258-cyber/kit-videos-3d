import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from "remotion";
import { CenaCidade, DURACAO_CENA_CIDADE } from "./CenaCidade";
import { TerraPlana } from "./TerraPlana";

const DURACAO_TERRA = 450;
const TRANSICAO = 20; // frames em que as duas cenas aparecem juntas

export const DURACAO_VIDEO = DURACAO_CENA_CIDADE + DURACAO_TERRA - TRANSICAO;

const SurgirAos: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const opacidade = interpolate(frame, [0, TRANSICAO], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return <AbsoluteFill style={{ opacity: opacidade }}>{children}</AbsoluteFill>;
};

export const VideoCompleto: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Sequence durationInFrames={DURACAO_CENA_CIDADE}>
        <CenaCidade />
      </Sequence>
      <Sequence from={DURACAO_CENA_CIDADE - TRANSICAO} durationInFrames={DURACAO_TERRA}>
        <SurgirAos>
          {/* O personagem já fez a pergunta, então a Terra entra sem repetir o título */}
          <TerraPlana mostrarTitulo={false} />
        </SurgirAos>
      </Sequence>
    </AbsoluteFill>
  );
};
