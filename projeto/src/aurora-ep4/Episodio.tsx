import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { censuradas, janelasPiParcial, Pis, tapaParcial, volumeSemPalavrao } from "../aurora/censura";
import { CartazPagina } from "../astral/ui";
import { CenaCeuVerde } from "../aurora/cenas";
import { CenaFinal } from "../aurora/cenas2";
import { Legenda, Legendas, Palavra, Pergunta } from "../aurora/estilo";
import { CenaFisica } from "./fisica";
import { CenaCaixa, CenaCelular, CenaEsqueleto, CenaFila, CenaGancho, CenaNoite, CenaOsso, CenaPizza, CenaPortaria, CenaRegra, CenaRuim } from "./atos";
import { ARQUIVO, clipe, CLIPES, FIM_VOZ, janelas, palavra } from "./falas";
import { SonsEp4 } from "./sons";
import { S } from "./tempos";

// Episódio 4 montado na voz (mesmo esquema dos eps. 1–3): cenas presas ao tempo das falas,
// legendas automáticas e, no fim, o cartaz padrão do canal.
export const FPS = 30;
const CARTAZ_DE = FIM_VOZ + 1.4;
const CARTAZ_ASTRAL = 74.7;
export const DURACAO_EP4 = Math.ceil((CARTAZ_DE + 6.5) * FPS);

const DESTAQUE: Record<string, Palavra["c"]> = {
  "raio-x": "g", raio: "g", verde: "g", poder: "g", liga: "g", firmeza: "g",
  kaique: "a", entregador: "a", osso: "a", física: "a", luz: "a", lanterna: "a", metal: "a", dentista: "a", dia: "a", pedido: "a", cebola: "a",
  foto: "a", chuvisco: "a", sensor: "a", câmera: "a", bairro: "a", lente: "a", olho: "a", óculos: "a", esqueleto: "a", boné: "a", parafuso: "a",
  "três": "a", dezessete: "a", vinte: "a", chumbo: "a", fração: "a", interruptor: "a", estrela: "a", pimenta: "a", encomenda: "a",
  barram: "v", barra: "v", ruim: "v", ardendo: "v", desliga: "v", piscou: "v", "sensíveis": "v", caralho: "v", porra: "v", puta: "v", merda: "v", preto: "v",
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
  .filter((l) => l.de > 3.2);

const PI = janelasPiParcial(CLIPES);

const ini = (id: string) => clipe(id).inicio;
const kai = (de: number) => janelas(["kaique"], de);
const w = (id: string, p: string, de: number) => palavra(id, p) - de;
const C_GANCHO = [1.15, 2.15];

const fim = (id: string) => clipe(id).fim;
const CENAS: { de: number; C: React.FC<{ t: number }> }[] = [
  { de: 0, C: ({ t }) => <CenaGancho t={t} c1={C_GANCHO[0]} c2={C_GANCHO[1]} /> },
  { de: S.ceu, C: CenaCeuVerde },
  { de: S.laje, C: ({ t }) => <CenaNoite t={t} fala={kai(S.laje)} placa={w("n-kaique", "kaique", S.laje)} vinte={w("n-kaique", "vinte", S.laje)} lindo={ini("k-lindo") - S.laje - 0.1} /> },
  {
    de: S.osso,
    C: ({ t }) => (
      <CenaOsso
        t={t}
        fala={kai(S.osso)}
        olhou={w("n-osso", "olhou", S.osso)}
        mao={w("n-osso", "própria", S.osso)}
        viu={w("n-osso", "viu", S.osso)}
        osso={w("n-osso", "osso", S.osso)}
        caralho={ini("k-caralho") - S.osso}
        gato={ini("k-gato") - S.osso}
      />
    ),
  },
  {
    de: S.regra,
    C: ({ t }) => (
      <CenaRegra
        t={t}
        fala={kai(S.regra)}
        liga={w("n-regra", "olhou", S.regra)}
        piscou={w("n-regra", "piscou", S.regra)}
        desliga={w("n-regra", "desliga", S.regra)}
        firmeza={w("n-regra", "firmeza", S.regra)}
        interruptor={ini("k-interruptor") - S.regra}
      />
    ),
  },
  {
    de: S.fisica,
    C: ({ t }) => (
      <CenaFisica
        t={t}
        fala={kai(S.fisica)}
        w={{
          atravessa: w("n-fisica1", "raio-x", S.fisica),
          jogar: w("n-fisica1", "para", S.fisica),
          osso: w("n-fisica2", "osso", S.fisica),
          metal: w("n-fisica2", "metal", S.fisica),
          chumbo: w("n-fisica2", "chumbo", S.fisica),
          dentista: w("n-fisica2", "raio-x", S.fisica),
          fracao: w("n-fisica2", "fração", S.fisica),
          dele: w("n-fisica2", "dele", S.fisica) - 0.2,
          lanterna: ini("k-lanterna") - S.fisica,
        }}
      />
    ),
  },
  { de: S.pizza, C: ({ t }) => <CenaPizza t={t} fala={kai(S.pizza)} conferir={w("n-vantagem", "conferir", S.pizza) - 0.1} cebola={ini("k-cebola") - S.pizza} instinto={ini("k-instinto") - S.pizza} zeno={ini("n-zeno") - S.pizza} /> },
  {
    de: S.portaria,
    C: ({ t }) => (
      <CenaPortaria
        t={t}
        fala={kai(S.portaria)}
        falaEdson={janelas(["edson"], S.portaria)}
        placa={ini("e-andar") - S.portaria}
        interfone={w("e-andar", "interfone", S.portaria) - 0.1}
        palma={w("e-andar", "palma", S.portaria)}
        foto={ini("n-foto") - S.portaria}
        chuvisco={w("n-chuvisco", "saiu", S.portaria)}
        sensor={ini("n-sensor") - S.portaria}
        porra={ini("k-porra") - S.portaria}
      />
    ),
  },
  {
    de: S.fila,
    C: ({ t }) => <CenaFila t={t} fala={kai(S.fila)} escolhe={0.1} bairro={w("n-escolhe", "bairro", S.fila) - 1.2} parafuso={ini("k-parafuso") - S.fila} dona={ini("n-dona") - S.fila} />,
  },
  { de: S.ruim, C: ({ t }) => <CenaRuim t={t} fala={kai(S.ruim)} lente={w("n-ruim", "lente", S.ruim)} pimenta={ini("k-pimenta") - S.ruim} radio={ini("n-radio") - S.ruim} /> },
  { de: S.esqueleto, C: ({ t }) => <CenaEsqueleto t={t} boneW={w("n-esqueleto", "boné", S.esqueleto) - 0.1} olhando={w("n-esqueleto", "olhando", S.esqueleto)} apaga={w("n-esqueleto", "volta", S.esqueleto) + 0.25} /> },
  { de: S.celular, C: ({ t }) => <CenaCelular t={t} fala={kai(S.celular)} falaOlheiro={janelas(["olheiro"], S.celular)} msg={w("o-encomenda", "tenho", S.celular) - 0.1} quem={ini("k-quem") - S.celular} /> },
  {
    de: S.caixa,
    C: ({ t }) => (
      <CenaCaixa t={t} fala={kai(S.caixa)} queda={w("n-ninguem", "tinha", S.caixa)} olhaDe={w("n-ninguem", "tinha", S.caixa) + 0.8} atravessa={w("n-ninguem", "atravessava", S.caixa)} dentro={ini("k-dentro") - S.caixa} fim={fim("k-dentro") - S.caixa + 0.05} fim2={fim("k-dentro") - S.caixa + 0.8} />
    ),
  },
  { de: S.final, C: ({ t }) => <CenaFinal t={t} ep={4} titulo="KAIQUE VIU TUDO" /> },
];

// ---------- câmera ----------
// Respiração bem leve de câmera na mão. Entre uma cena e outra, um arrasto curto; dentro da cena o
// corte é seco (o chicote em todo corte deixava o vídeo "doido", pedido do usuário em 06/11/2026).
const Camera: React.FC<{ s: number; children: React.ReactNode }> = ({ s, children }) => {
  let i = 0;
  CENAS.forEach((c, k) => {
    if (s >= c.de) i = k;
  });
  const k = Math.max(0, 1 - (s - CENAS[i].de) / 0.14);
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

export const EpisodioAurora4: React.FC = () => {
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
      {/* luz quente de cima/esquerda + desfoque de miniatura em cima e embaixo (volume 3D) */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 18% 12%, rgba(255,232,190,0.30), transparent 62%)", mixBlendMode: "soft-light", pointerEvents: "none" }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,8,30,0.22) 0%, transparent 22%, transparent 78%, rgba(10,8,30,0.3) 100%)", pointerEvents: "none" }} />
      {/* acabamento liso: sem granulado, só um vinheta bem suave */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.26) 100%)", pointerEvents: "none" }} />
      {s < 3.2 && (
        <Pergunta
          s={s}
          ate={3.2}
          linhas={[
            [{ t: "E" }, { t: "SE" }, { t: "CÊ" }, { t: "ACORDASSE" }, { t: "AMANHÃ" }],
            [{ t: "COM" }, { t: "VISÃO" }, { t: "DE" }, { t: "RAIO-X?", c: "g" }],
          ]}
        />
      )}
      {s < CARTAZ_DE && <Legendas s={s} lista={LEGENDAS} />}
      <CartazPagina s={s - CARTAZ_DE + CARTAZ_ASTRAL} />
      <SonsEp4 total={DURACAO_EP4} />
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
