import { AbsoluteFill, useCurrentFrame } from "remotion";
import { CenaCeuVerde, CenaCozinhaChao, CenaQuartoGigante, CenaQuartoNoite } from "./cenas";
import { Acabamento, Legenda, Legendas, Pergunta } from "./estilo";

// Teste visual do episódio 1 (cenas 1 a 4, sem narração ainda) pra aprovar o estilo 2.5D.
export const FPS_AURORA = 30;
const CENAS = [
  { de: 0, ate: 4, C: CenaCozinhaChao },
  { de: 4, ate: 8, C: CenaCeuVerde },
  { de: 8, ate: 12, C: CenaQuartoNoite },
  { de: 12, ate: 17, C: CenaQuartoGigante },
];
export const DURACAO_TESTE_AURORA = 17 * FPS_AURORA;

const LEGENDAS: Legenda[] = [
  { de: 4.3, ate: 5.5, palavras: [{ t: "3:17" }, { t: "DA MANHÃ" }] },
  { de: 5.5, ate: 7.9, palavras: [{ t: "O CÉU FICOU" }, { t: "VERDE", c: "g" }] },
  { de: 8.2, ate: 9.8, palavras: [{ t: "O" }, { t: "JONAS", c: "a" }] },
  { de: 9.8, ate: 11.8, palavras: [{ t: "MORA COM A" }, { t: "MÃE", c: "a" }] },
  { de: 12.2, ate: 13.4, palavras: [{ t: "DE MANHÃ," }] },
  { de: 13.4, ate: 14.8, palavras: [{ t: "O QUARTO TAVA" }, { t: "GIGANTE", c: "v" }] },
  { de: 14.9, ate: 16.9, palavras: [{ t: "17", c: "a" }, { t: "CENTÍMETROS", c: "a" }] },
];

export const TesteAurora: React.FC = () => {
  const s = useCurrentFrame() / FPS_AURORA;
  const cena = CENAS.find((c) => s >= c.de && s < c.ate) ?? CENAS[CENAS.length - 1];
  const { C } = cena;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <C t={s - cena.de} />
      <Acabamento />
      {s < 4 && (
        <Pergunta
          s={s}
          ate={4}
          linhas={[
            [{ t: "E" }, { t: "SE" }, { t: "CÊ" }, { t: "ACORDASSE" }, { t: "AMANHÃ" }],
            [{ t: "DO" }, { t: "TAMANHO" }, { t: "DE" }, { t: "UMA" }, { t: "CANETA?", c: "a" }],
          ]}
        />
      )}
      <Legendas s={s} lista={LEGENDAS} />
    </AbsoluteFill>
  );
};
