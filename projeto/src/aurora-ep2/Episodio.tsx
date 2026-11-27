import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { censuradas, janelasPi, Pis, tapa, volumeSemPalavrao } from "../aurora/censura";
import { CartazPagina } from "../astral/ui";
import { CenaCeuVerde } from "../aurora/cenas";
import { CenaFinal } from "../aurora/cenas2";
import { Acabamento, Legenda, Legendas, Palavra, Pergunta } from "../aurora/estilo";
import { CenaBusaoDentro, CenaBusaoLado, CenaQuadra } from "./cenas";
import { CenaAtrito, CenaBussola, CenaDistancia, CenaGeladeira, CenaLaje, CenaMensagem, CenaPonto, CenaQuarto, CenaRegra, CenaSeFudeu } from "./cenas2";
import { ARQUIVO, clipe, CLIPES, FIM_VOZ, janelas, palavra } from "./falas";
import { S } from "./tempos";
import { SonsEp2 } from "./sons";

// Episódio 2 montado na voz (mesmo esquema do ep. 1): cenas presas ao tempo das falas,
// legendas automáticas e, no fim, o cartaz padrão do canal.
export const FPS = 30;
const CARTAZ_DE = FIM_VOZ + 1.4;
const CARTAZ_ASTRAL = 74.7; // o CartazPagina conta o tempo a partir deste ponto
export const DURACAO_EP2 = Math.ceil((CARTAZ_DE + 6.5) * FPS);

// Palavras que ganham cor na legenda (a = amarelo, v = vermelho, g = verde-aurora).
const DESTAQUE: Record<string, Palavra["c"]> = {
  ímã: "g", verde: "g", nervoso: "g", "3:17": "a", bruno: "a", goleiro: "a", interclasse: "a", final: "a",
  moeda: "a", aço: "a", cofrinho: "a", geladeira: "a", física: "a", mesma: "a", força: "a", leve: "a", bússola: "a",
  norte: "a", polo: "a", ressonância: "a", perto: "a", longe: "a", "8": "a", "10": "a", toneladas: "a", "70": "a",
  quilos: "a", atrito: "a", regra: "a", sombrinha: "a", pênalti: "a",
  gruda: "v", voa: "v", sangue: "v", ruim: "v", ferro: "v", trave: "v", merda: "v", puta: "v", pariu: "v", fudeu: "v",
};

const limpa = (w: string) => w.toLowerCase().replace(/[.,!?…]/g, "");

// Junta as palavras em pedaços de até 3, quebrando na pontuação.
const LEGENDAS: Legenda[] = CLIPES.filter((c) => c.id !== "n-parte2")
  .flatMap((c) => {
    const saida: Legenda[] = [];
    const cens = censuradas(c.palavras);
    let atual: typeof c.palavras = [];
    const fecha = () => {
      if (!atual.length) return;
      saida.push({
        de: atual[0].s,
        ate: atual[atual.length - 1].e + 0.05,
        palavras: atual.map((p) =>
        cens.has(c.palavras.indexOf(p)) ? { t: tapa(p.w).replace(/[,]$/, ""), c: "v" as const } : { t: p.w.replace(/[,]$/, ""), c: DESTAQUE[limpa(p.w)] },
      ),
      });
      atual = [];
    };
    c.palavras.forEach((p) => {
      atual.push(p);
      if (atual.length >= 3 || /[.,!?]$/.test(p.w)) fecha();
    });
    fecha();
    // cada legenda fica até a próxima começar (sem buraco piscando)
    // (e sai antes da próxima entrar: duas legendas nunca aparecem juntas)
    return saida.map((l, i) => ({ ...l, ate: saida[i + 1] ? saida[i + 1].de - 0.02 : l.ate }));
  })
  .filter((l) => l.de > 3.2); // nos primeiros segundos quem fala é a pergunta na tela

const PI = janelasPi(CLIPES);

const ini = (id: string) => clipe(id).inicio;
const fim = (id: string) => clipe(id).fim;
const fala = (de: number) => janelas(["bruno"], de);

const CENAS: { de: number; C: React.FC<{ t: number }> }[] = [
  { de: 0, C: ({ t }) => <CenaBusaoLado t={t} /> },
  { de: S.ceu, C: CenaCeuVerde },
  { de: S.laje, C: ({ t }) => <CenaLaje t={t} fala={fala(S.laje)} /> },
  { de: S.quarto, C: ({ t }) => <CenaQuarto t={t} fala={fala(S.quarto)} close={ini("b-cofrinho") - 0.1 - S.quarto} corte={ini("n-aco") - S.quarto} /> },
  {
    de: S.geladeira,
    C: ({ t }) => <CenaGeladeira t={t} fala={fala(S.geladeira)} corte1={palavra("n-fisica", "ímã") - S.geladeira} corte2={palavra("n-fisica", "quem") - S.geladeira} />,
  },
  {
    de: S.bussola,
    C: ({ t }) => (
      <CenaBussola t={t} fala={fala(S.bussola)} corte1={palavra("n-bussola", "bússola") + 0.6 - S.bussola} corte2={ini("b-polo") - 0.1 - S.bussola} corte3={ini("n-sangue") - S.bussola} />
    ),
  },
  { de: S.distancia, C: ({ t }) => <CenaDistancia t={t} dobra={palavra("n-rua", "dobrou") - S.distancia} /> },
  { de: S.ponto, C: CenaPonto },
  {
    de: S.dentro,
    C: ({ t }) => (
      <CenaBusaoDentro t={t} corte1={ini("c-sombrinha") - S.dentro} corte2={fim("b-fisica") + 0.2 - S.dentro} fala={fala(S.dentro)} falaCida={janelas(["cida"], S.dentro)} />
    ),
  },
  {
    de: S.ruim,
    C: ({ t }) => (
      <CenaBusaoLado t={t} cortes={[ini("b-puta") - S.ruim, ini("n-toneladas") - S.ruim, palavra("n-toneladas", "ele") - S.ruim, palavra("n-toneladas", "adivinha") - S.ruim]} />
    ),
  },
  { de: S.atrito, C: CenaAtrito },
  { de: S.regra, C: ({ t }) => <CenaRegra t={t} fala={fala(S.regra)} cartaoDe={ini("n-regra") - S.regra} corte={fim("n-regra") + 0.3 - S.regra} /> },
  { de: S.mensagem, C: ({ t }) => <CenaMensagem t={t} fala={fala(S.mensagem)} corte1={fim("o-final") + 0.1 - S.mensagem} corte2={ini("b-sabe") - 0.1 - S.mensagem} /> },
  { de: S.quadra, C: ({ t }) => <CenaQuadra t={t} corte={palavra("n-trave", "trave") - 0.2 - S.quadra} /> },
  { de: S.sefudeu, C: ({ t }) => <CenaSeFudeu t={t} fala={fala(S.sefudeu)} /> },
  { de: S.final, C: ({ t }) => <CenaFinal t={t} ep={2} titulo="BRUNO GRUDOU" /> },
];

export const EpisodioAurora2: React.FC = () => {
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
      {s < CARTAZ_DE && <Legendas s={s} lista={LEGENDAS} />}
      <CartazPagina s={s - CARTAZ_DE + CARTAZ_ASTRAL} />
      <SonsEp2 total={DURACAO_EP2} />
      <Sequence from={Math.round((CARTAZ_DE + 0.3) * FPS)}>
        <Audio src={staticFile("astral/voz/fcartaz.wav")} />
      </Sequence>
      <Pis janelas={PI} />
      {CLIPES.map((c) => (
        <Sequence key={c.id} from={Math.round(c.inicio * FPS)} durationInFrames={Math.ceil((c.fim - c.inicio) * FPS) + 2}>
          <Audio src={staticFile(ARQUIVO[c.voz])} trimBefore={Math.round(c.de * FPS)} toneFrequency={c.tom ?? 1} volume={volumeSemPalavrao(c.inicio, PI)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
