import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { censuradas, janelasPiParcial, Pis, tapaParcial, volumeSemPalavrao } from "../aurora/censura";
import { CartazPagina } from "../astral/ui";
import { CenaFinal } from "../aurora/cenas2";
import { Cartao, Legenda, Legendas, Palavra, Pergunta } from "../aurora/estilo";
import { CenaAntes, CenaApito, CenaBlocos, CenaCabine, CenaCaptura, CenaContrato, CenaFisica, CenaGalpao, CenaGancho, CenaRegra, CenaRuim } from "./cenas";
import { ARQUIVO, clipe, CLIPES, FIM_VOZ, palavra } from "./falas";
import { SonsEp5b } from "./sons";
import { S } from "./tempos";

// Parte 2 do Denis montada na voz: cenas presas ao tempo das falas, legenda automática, pi depois
// da maior parte da palavra e, no fim, o cartaz padrão do canal.
export const FPS = 30;
const CARTAZ_DE = FIM_VOZ + 1.0;
const CARTAZ_ASTRAL = 74.7;
export const DURACAO_EP5B = Math.ceil((CARTAZ_DE + 6.5) * FPS);

const DESTAQUE: Record<string, Palavra["c"]> = {
  invencível: "g", verde: "g",
  vivo: "v", denis: "a", oitenta: "a", quilos: "a", quatro: "a", agentes: "a", cimento: "a", galpão: "a", forma: "a", madeira: "a", bloco: "a", concreto: "a", número: "a", física: "a", dobro: "a", tampa: "a", peito: "a", menor: "v", cura: "a", química: "a", pedra: "a", apito: "a", vinte: "a", toneladas: "a", lista: "a", primeira: "a", nove: "a", blocos: "a", governo: "v", contratando: "v", pedreiro: "a", edson: "a", parede: "g", atravessar: "g", portão: "a",
  ruim: "v", boca: "v", apagou: "v", escorada: "v", estourar: "v", morre: "v", sai: "v", vez: "v", levavam: "v", apontava: "v", fiz: "v", puta: "v", merda: "v", assina: "v", laje: "a", aguado: "a",
};

const limpa = (w: string) => w.toLowerCase().replace(/[.,!?…:]/g, "");
const SEM_LEGENDA = ["n-parte3", "n-pergunta"];

const LEGENDAS: Legenda[] = CLIPES.filter((c) => !SEM_LEGENDA.includes(c.id)).flatMap((c) => {
  const saida: Legenda[] = [];
  const cens = censuradas(c.palavras);
  let atual: typeof c.palavras = [];
  const fecha = () => {
    if (!atual.length) return;
    saida.push({
      de: atual[0].s,
      ate: atual[atual.length - 1].e + 0.05,
      palavras: atual.map((p) => (cens.has(c.palavras.indexOf(p)) ? { t: tapaParcial(p.w).replace(/[,:]$/, ""), c: "v" as const } : { t: p.w.replace(/[,:]$/, ""), c: DESTAQUE[limpa(p.w)] })),
    });
    atual = [];
  };
  c.palavras
    .filter((p) => !p.w.startsWith("("))
    .forEach((p) => {
      atual.push(p);
      if (atual.length >= 3 || /[.,!?:…]$/.test(p.w)) fecha();
    });
  fecha();
  return saida.map((l, i) => ({ ...l, ate: saida[i + 1] ? saida[i + 1].de - 0.02 : l.ate }));
});

const PI = janelasPiParcial(CLIPES);

const CENAS: { de: number; C: React.FC<{ t: number }> }[] = [
  { de: 0, C: CenaGancho },
  { de: S.captura, C: CenaCaptura },
  { de: S.galpao, C: CenaGalpao },
  { de: S.fisica, C: CenaFisica },
  { de: S.regra, C: CenaRegra },
  { de: S.ruim, C: CenaRuim },
  { de: S.apito, C: CenaApito },
  { de: S.cabine, C: CenaCabine },
  { de: S.antes, C: CenaAntes },
  { de: S.blocos, C: CenaBlocos },
  { de: S.contrato, C: CenaContrato },
  { de: S.final, C: ({ t }) => <CenaFinal t={t} ep={5} titulo="OS BLOCOS" parte={3} /> },
];

// Respiração bem leve de câmera na mão, corte sempre seco: o silêncio é o efeito.
const Camera: React.FC<{ s: number; children: React.ReactNode }> = ({ s, children }) => {
  const mx = 3 * Math.sin(s * 0.83) + 1.2 * Math.sin(s * 1.9);
  const my = 2.4 * Math.sin(s * 0.97 + 1) + 1 * Math.sin(s * 2.1);
  const rot = 0.12 * Math.sin(s * 0.61);
  return <AbsoluteFill style={{ transform: `translate(${mx}px, ${my}px) rotate(${rot}deg) scale(1.03)` }}>{children}</AbsoluteFill>;
};

const REGRA_DE = palavra("n-reacao", "poucas") + 0.5;
const REGRA_ATE = clipe("a-solto").inicio - 0.2;

export const EpisodioAurora5b: React.FC = () => {
  const s = useCurrentFrame() / FPS;
  let i = 0;
  CENAS.forEach((c, k) => {
    if (s >= c.de) i = k;
  });
  const { C, de } = CENAS[i];
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {s < CARTAZ_DE + 0.7 && (
        <AbsoluteFill style={{ opacity: s > CARTAZ_DE ? Math.max(0, 1 - (s - CARTAZ_DE) / 0.6) : 1 }}>
          <Camera s={s}>
            <C t={s - de} />
          </Camera>
        </AbsoluteFill>
      )}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(5,8,16,0.5) 0%, rgba(5,8,16,0) 18%, rgba(5,8,16,0) 72%, rgba(5,8,16,0.68) 100%)", pointerEvents: "none" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 42%, rgba(0,0,0,0) 56%, rgba(0,0,0,0.4) 100%)", pointerEvents: "none" }} />
      {s < S.captura && (
        <Pergunta
          s={s}
          ate={S.captura}
          linhas={[
            [{ t: "E" }, { t: "SE" }, { t: "CÊ" }, { t: "ACORDASSE" }, { t: "AMANHÃ" }],
            [{ t: "INVENCÍVEL...", c: "g" }],
            [{ t: "E" }, { t: "TE" }, { t: "ENTERRASSEM" }, { t: "VIVO?", c: "v" }],
          ]}
        />
      )}
      {s < CARTAZ_DE && <Legendas s={s} lista={LEGENDAS} top={s >= S.contrato ? 700 : 1400} />}
      <Cartao s={s} de={REGRA_DE} ate={REGRA_ATE} etiqueta="REGRA DO PODER #2" texto="NÃO MORRER NÃO É RESPIRAR" top={1130} />
      <CartazPagina s={s - CARTAZ_DE + CARTAZ_ASTRAL} />
      <SonsEp5b total={DURACAO_EP5B} />
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
