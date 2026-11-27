import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { censuradas, janelasPi, Pis, tapa, volumeSemPalavrao } from "../aurora/censura";
import { CartazPagina } from "../astral/ui";
import { CenaCeuVerde } from "../aurora/cenas";
import { CenaFinal } from "../aurora/cenas2";
import { Acabamento, Legenda, Legendas, Palavra, Pergunta } from "../aurora/estilo";
import { CenaFisica, CenaFolego, CenaGuarita, CenaLixo, CenaParede, CenaPorta, CenaPortao } from "./cenas";
import { CenaBruno, CenaCasa, CenaLivro, CenaQueda, CenaRolha } from "./cenas2";
import { ARQUIVO, clipe, CLIPES, FIM_VOZ, janelas, palavra } from "./falas";
import { S } from "./tempos";
import { SonsEp3 } from "./sons";

// Episódio 3 montado na voz (mesmo esquema dos eps. 1 e 2): cenas presas ao tempo das falas,
// legendas automáticas e, no fim, o cartaz padrão do canal.
export const FPS = 30;
const CARTAZ_DE = FIM_VOZ + 1.4;
const CARTAZ_ASTRAL = 74.7; // o CartazPagina conta o tempo a partir deste ponto
export const DURACAO_EP3 = Math.ceil((CARTAZ_DE + 6.5) * FPS);

// Palavras que ganham cor na legenda (a = amarelo, v = vermelho, g = verde-aurora).
const DESTAQUE: Record<string, Palavra["c"]> = {
  verde: "g", fantasma: "g", poder: "g", vaga: "g",
  edson: "a", porteiro: "a", lixo: "a", fede: "a", regra: "a", sólido: "a", cuspido: "a", cuspiu: "a", física: "a", átomo: "a",
  vazio: "a", itaquerão: "a", feijão: "a", empurram: "a", empurrão: "a", chão: "a", pulmão: "a", luz: "a", olho: "a", fôlego: "a",
  trinta: "a", atrito: "a", desliza: "a", embalo: "a", garagem: "a", metros: "a", segundo: "a", vinte: "a", japão: "a",
  quarenta: "a", portão: "a", livro: "a", grudei: "a", "três": "a", dezessete: "a", chave: "a", chaveiro: "a", atravessava: "g", travou: "v",
  cego: "v", ruim: "v", susto: "v", sempre: "v", apneia: "v", quinhentos: "v", queda: "v", caralho: "v", porra: "v", puta: "v", merda: "v",
};

const limpa = (w: string) => w.toLowerCase().replace(/[.,!?…:]/g, "");
const SEM_LEGENDA = ["n-parte2", "e-mmm", "e-ronco"];

// Junta as palavras em pedaços de até 3, quebrando na pontuação.
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
        palavras: atual.map((p) =>
        cens.has(c.palavras.indexOf(p)) ? { t: tapa(p.w).replace(/[,:]$/, ""), c: "v" as const } : { t: p.w.replace(/[,:]$/, ""), c: DESTAQUE[limpa(p.w)] },
      ),
      });
      atual = [];
    };
    c.palavras.forEach((p) => {
      atual.push(p);
      if (atual.length >= 3 || /[.,!?:…]$/.test(p.w)) fecha();
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
const fala = (de: number) => janelas(["edson"], de);
const w = (id: string, p: string, de: number) => palavra(id, p) - de;

const CENAS: { de: number; C: React.FC<{ t: number }> }[] = [
  { de: 0, C: ({ t }) => <CenaRolha t={t} gancho /> },
  { de: S.ceu, C: CenaCeuVerde },
  { de: S.guarita, C: ({ t }) => <CenaGuarita t={t} fala={fala(S.guarita)} corte={ini("e-ceu") - 0.15 - S.guarita} /> },
  {
    de: S.lixo,
    C: ({ t }) => (
      <CenaLixo
        t={t}
        fala={fala(S.lixo)}
        prendeu={w("n-lixo", "prendeu", S.lixo)}
        afunda={w("n-lixo", "fede", S.lixo)}
        pop={ini("e-pe") + 0.05 - S.lixo}
        regra={ini("n-regra") - S.lixo}
        wSoltou={w("n-regra", "soltou", S.lixo)}
        wDentro={w("n-regra", "dentro", S.lixo)}
        wCuspido={w("n-regra", "cuspido", S.lixo)}
      />
    ),
  },
  {
    de: S.porta,
    C: ({ t }) => (
      <CenaPorta
        t={t}
        chave={w("n-porta", "chave", S.porta)}
        ou={w("n-porta", "ou", S.porta)}
        wChaveiro={w("n-porta", "chaveiro", S.porta)}
        atravessa={w("n-porta", "atravessava", S.porta)}
      />
    ),
  },
  {
    de: S.fisica,
    C: ({ t }) => (
      <CenaFisica
        t={t}
        w={{
          atomo: w("n-parede", "parede", S.fisica),
          itaquerao: w("n-parede", "parede", S.fisica),
          parede: w("n-parede", "parede", S.fisica),
          desliga: w("n-parede", "desliga", S.fisica),
          segura: ini("n-empurrao") - S.fisica,
          chao: w("n-empurrao", "chão", S.fisica),
          ar: w("n-empurrao", "pulmão", S.fisica),
          luz: w("n-empurrao", "olho", S.fisica),
        }}
      />
    ),
  },
  { de: S.folego, C: ({ t }) => <CenaFolego t={t} fala={fala(S.folego)} corte={ini("e-folego") - 0.1 - S.folego} /> },
  {
    de: S.parede,
    C: ({ t }) => (
      <CenaParede
        t={t}
        fala={fala(S.parede)}
        embalo={w("n-atrito", "tem", S.parede)}
        dentro={fim("n-atrito") - 0.1 - S.parede}
        sai={ini("e-luz") - 0.35 - S.parede}
        cego={ini("n-cego") - S.parede}
        passa={w("n-cego", "passa", S.parede)}
      />
    ),
  },
  {
    de: S.portao,
    C: ({ t }) => (
      <CenaPortao
        t={t}
        fala={fala(S.portao)}
        atalho={ini("e-atalho") - 0.1 - S.portao}
        garagem={ini("n-garagem") - S.portao}
        segundo={w("n-garagem", "menos", S.portao)}
        wCego={w("n-garagem", "cego", S.portao)}
      />
    ),
  },
  {
    de: S.queda,
    C: ({ t }) => (
      <CenaQueda
        t={t}
        mmm={ini("e-mmm") - 0.1 - S.queda}
        japao={w("n-japao", "não", S.queda) - 0.25}
        volta={w("n-japao", "caía", S.queda)}
        wVinte={w("n-japao", "vinte", S.queda)}
        wSempre={w("n-japao", "sempre", S.queda)}
      />
    ),
  },
  { de: S.rolha, C: ({ t }) => <CenaRolha t={t} fala={fala(S.rolha)} /> },
  { de: S.bruno, C: ({ t }) => <CenaBruno t={t} fala={fala(S.bruno)} falaBruno={janelas(["bruno"], S.bruno)} corte={ini("e-filho") - 0.15 - S.bruno} /> },
  { de: S.livro, C: ({ t }) => <CenaLivro t={t} fala={fala(S.livro)} camera={w("o-vaga", "tenho", S.livro)} close={ini("e-livro") - 0.15 - S.livro} /> },
  {
    de: S.casa,
    C: ({ t }) => (
      <CenaCasa t={t} ronco={ini("e-ronco") - 0.2 - S.casa} fimRonco={fim("e-ronco") - S.casa} queda={ini("n-queda") - 0.2 - S.casa} wQuinhentos={w("n-queda", "quinhentos", S.casa)} />
    ),
  },
  { de: S.final, C: ({ t }) => <CenaFinal t={t} ep={3} titulo="SEU EDSON ATRAVESSOU" /> },
];

export const EpisodioAurora3: React.FC = () => {
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
            [{ t: "ATRAVESSANDO" }, { t: "PAREDE?", c: "a" }],
          ]}
        />
      )}
      {s < CARTAZ_DE && <Legendas s={s} lista={LEGENDAS} />}
      <CartazPagina s={s - CARTAZ_DE + CARTAZ_ASTRAL} />
      <SonsEp3 total={DURACAO_EP3} />
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
