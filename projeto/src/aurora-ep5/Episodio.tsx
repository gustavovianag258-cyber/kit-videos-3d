import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { censuradas, janelasPiParcial, Pis, tapaParcial, volumeSemPalavrao } from "../aurora/censura";
import { CartazPagina } from "../astral/ui";
import { VolumeCtx } from "../aurora-ep4/pessoa";
import { CenaCeuVerde } from "../aurora/cenas";
import { CenaFinal } from "../aurora/cenas2";
import { Legenda, Legendas, Palavra, Pergunta } from "../aurora/estilo";
import { CenaAndaime, CenaCalcada, CenaFisica, CenaGancho, CenaHospital, CenaLaje, CenaMarreta, CenaObra, CenaQueda } from "./dia";
import { ARQUIVO, CLIPES, FIM_VOZ } from "./falas";
import { CenaCaminhao, CenaCarro, CenaOlheiro, CenaQuarto } from "./noite";
import { SonsEp5 } from "./sons";
import { S } from "./tempos";

// Episódio 5 montado na voz (mesmo esquema do ep. 4): cenas presas ao tempo das falas, legendas
// automáticas e, no fim, o cartaz padrão do canal.
export const FPS = 30;
const CARTAZ_DE = FIM_VOZ + 1.0;
const CARTAZ_ASTRAL = 74.7;
export const DURACAO_EP5 = Math.ceil((CARTAZ_DE + 6.5) * FPS);

const DESTAQUE: Record<string, Palavra["c"]> = {
  invencível: "g", verde: "g", firmeza: "g",
  denis: "a", pedreiro: "a", física: "a", pancada: "a", prego: "a", dedo: "a", marreta: "a", andaime: "a", calçada: "a", hospital: "a", agulhas: "a", sistema: "a", parede: "a",
  amassa: "a", amortece: "a", "três": "a", dezessete: "a", quatro: "a", andares: "a", olheiro: "a", lista: "a", carro: "a", forte: "a", tião: "a",
  ruim: "v", soltou: "v", respirar: "v", solto: "v", caralho: "v", porra: "v", puta: "v", merda: "v", departamento: "v", atmosféricos: "v", eventos: "v", tortas: "v",
};

const limpa = (w: string) => w.toLowerCase().replace(/[.,!?…:]/g, "");
const SEM_LEGENDA = ["n-parte2"];

const LEGENDAS: Legenda[] = CLIPES.filter((c) => !SEM_LEGENDA.includes(c.id))
  .flatMap((c) => {
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
    c.palavras.forEach((p) => {
      atual.push(p);
      if (atual.length >= 3 || /[.,!?:…]$/.test(p.w)) fecha();
    });
    fecha();
    return saida.map((l, i) => ({ ...l, ate: saida[i + 1] ? saida[i + 1].de - 0.02 : l.ate }));
  })
  .filter((l) => l.de > S.ceu);

const PI = janelasPiParcial(CLIPES);

const CENAS: { de: number; C: React.FC<{ t: number }> }[] = [
  { de: 0, C: CenaGancho },
  { de: S.ceu, C: CenaCeuVerde },
  { de: S.laje, C: CenaLaje },
  { de: S.obra, C: CenaObra },
  { de: S.fisica, C: CenaFisica },
  { de: S.marreta, C: CenaMarreta },
  { de: S.andaime, C: CenaAndaime },
  { de: S.queda, C: CenaQueda },
  { de: S.calcada, C: CenaCalcada },
  { de: S.hospital, C: CenaHospital },
  { de: S.noite, C: CenaCarro },
  { de: S.olheiro, C: CenaOlheiro },
  { de: S.quarto, C: CenaQuarto },
  { de: S.caminhao, C: CenaCaminhao },
  { de: S.final, C: ({ t }) => <CenaFinal t={t} ep={5} titulo="DENIS NÃO QUEBRA" /> },
];

// Respiração bem leve de câmera na mão; entre uma cena e outra, um arrasto curto só de dia. De noite
// o corte é seco, sem arrasto nenhum: o silêncio é o efeito.
const Camera: React.FC<{ s: number; children: React.ReactNode }> = ({ s, children }) => {
  let i = 0;
  CENAS.forEach((c, k) => {
    if (s >= c.de) i = k;
  });
  const dia = s < S.noite;
  const k = dia ? Math.max(0, 1 - (s - CENAS[i].de) / 0.14) : 0;
  const lado = i % 2 ? 1 : -1;
  const mx = 3 * Math.sin(s * 0.83) + 1.2 * Math.sin(s * 1.9);
  const my = 2.4 * Math.sin(s * 0.97 + 1) + 1 * Math.sin(s * 2.1);
  const rot = 0.12 * Math.sin(s * 0.61);
  const borra = i > 0 && k > 0.2 ? 5 * k : 0;
  return (
    <AbsoluteFill style={{ transform: `translate(${mx + (i > 0 ? lado * 60 * k * k : 0)}px, ${my}px) rotate(${rot}deg) scale(1.03)`, filter: borra ? `blur(${borra}px)` : undefined }}>
      {children}
    </AbsoluteFill>
  );
};

export const EpisodioAurora5: React.FC = () => {
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
            <VolumeCtx.Provider value>
              <C t={s - de} />
            </VolumeCtx.Provider>
          </Camera>
        </AbsoluteFill>
      )}
      {/* luz quente só de dia; acabamento liso, sem granulado */}
      {s < S.noite && <AbsoluteFill style={{ background: "radial-gradient(ellipse at 18% 12%, rgba(255,232,190,0.30), transparent 62%)", mixBlendMode: "soft-light", pointerEvents: "none" }} />}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,8,30,0.22) 0%, transparent 22%, transparent 78%, rgba(10,8,30,0.3) 100%)", pointerEvents: "none" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.26) 100%)", pointerEvents: "none" }} />
      {s < S.ceu && (
        <Pergunta
          s={s}
          ate={S.ceu}
          linhas={[
            [{ t: "E" }, { t: "SE" }, { t: "CÊ" }, { t: "ACORDASSE" }, { t: "AMANHÃ" }],
            [{ t: "INVENCÍVEL?", c: "g" }],
          ]}
        />
      )}
      {s < CARTAZ_DE && <Legendas s={s} lista={LEGENDAS} />}
      <CartazPagina s={s - CARTAZ_DE + CARTAZ_ASTRAL} />
      <SonsEp5 total={DURACAO_EP5} />
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
