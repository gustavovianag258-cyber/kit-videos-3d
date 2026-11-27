import { AbsoluteFill, Html5Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { C1Descoberta } from "./v2/cenas/C1Descoberta";
import { C2Espaco } from "./v2/cenas/C2Espaco";
import { C3Gravidade } from "./v2/cenas/C3Gravidade";
import { C4Oceano } from "./v2/cenas/C4Oceano";
import { C5Atmosfera } from "./v2/cenas/C5Atmosfera";
import { C6Conclusao } from "./v2/cenas/C6Conclusao";
import { CORRECOES, MUSICA, SONS, TRANCO } from "./v2/correcoes";
import { ARQUIVO_NARRACAO, CENAS, FPS, lerp, seg, vozPorPerto } from "./v2/tempo";
import { FiltroCor, Legendas, Recapitulacao, Selos, TextoFinal, Vinheta, XVermelho } from "./v2/ui";

// VÍDEO: "E se a Terra fosse plana?" (~58 s, 1080x1920, 30 fps)
// Cada cena é um componente em src/v2/cenas. Tempos em src/v2/tempo.ts,
// legendas em src/legendas.ts e correções (X vermelho) em src/v2/correcoes.ts.

const cenas = [
  { id: "descoberta", Componente: C1Descoberta },
  { id: "espaco", Componente: C2Espaco },
  { id: "gravidade", Componente: C3Gravidade },
  { id: "oceano", Componente: C4Oceano },
  { id: "atmosfera", Componente: C5Atmosfera },
  { id: "conclusao", Componente: C6Conclusao },
] as const;

export const Cena1: React.FC = () => {
  const frame = useCurrentFrame();
  const segundos = frame / FPS;
  // Tranco quando entra um X: zoom rápido e tremida que somem em ~0,3 s
  const x = CORRECOES.find((c) => segundos >= c.inicio && segundos < c.fim);
  const fx = x ? (segundos - x.inicio) * FPS : 0;
  const forca = x ? Math.exp(-fx / 6) : 0;
  const tranco = `translate(${Math.sin(fx * 2.1) * TRANCO.tremida * forca}px, ${Math.cos(fx * 2.9) * TRANCO.tremida * 0.7 * forca}px) scale(${1 + TRANCO.zoom * forca})`;
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <AbsoluteFill style={{ transform: tranco }}>
      <FiltroCor>
        {cenas.map(({ id, Componente }) => {
          const c = CENAS[id];
          return (
            <Sequence key={id} from={seg(c.inicio)} durationInFrames={seg(c.fim) - seg(c.inicio)}>
              <Componente />
            </Sequence>
          );
        })}
      </FiltroCor>
      </AbsoluteFill>
      <Vinheta />
      <Selos segundos={segundos} />
      <XVermelho segundos={segundos} />
      <Recapitulacao segundos={segundos} />
      <TextoFinal segundos={segundos} />
      <Legendas segundos={segundos} />
      <Html5Audio src={staticFile(ARQUIVO_NARRACAO)} />
      <Html5Audio
        src={staticFile(MUSICA.arquivo)}
        volume={(f) => lerp(MUSICA.volume, MUSICA.volumeSobVoz, vozPorPerto(f))}
      />
      {SONS.map((s, i) => (
        <Sequence key={i} from={seg(s.inicio)} durationInFrames={seg(1.2)}>
          <Html5Audio src={staticFile(s.arquivo)} volume={s.volume} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
