import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { censuradas, janelasPi, Pis, tapa, volumeSemPalavrao } from "./censura";
import { CartazPagina } from "../astral/ui";
import { CenaCeuVerde, CenaCozinhaChao, CenaQuartoGigante, CenaQuartoNoite } from "./cenas";
import { CenaArroz, CenaBalanca, CenaBorrado, CenaFinal, CenaFrio, CenaGota, CenaMae, CenaOlheiro, CenaPudimAcorda, CenaPulo, CenaSofa, CenaVolta } from "./cenas2";
import { Acabamento, COR, FONTE, Legenda, Legendas, Palavra, Pergunta } from "./estilo";
import { ARQUIVO, CLIPES, clipe, FIM_VOZ } from "./falas";
import { SonsAurora } from "./sons";

// Episódio 1 montado na voz: cenas presas ao tempo das falas, legendas automáticas e, no fim,
// o cartaz padrão do canal (reaproveitado do vídeo da projeção astral).
export const FPS = 30;
const CARTAZ_DE = FIM_VOZ + 1.4;
const CARTAZ_ASTRAL = 74.7; // o CartazPagina conta o tempo a partir deste ponto
export const DURACAO_EP1 = Math.ceil((CARTAZ_DE + 6.5) * FPS);

// Palavras que ganham cor na legenda (a = amarelo, v = vermelho, g = verde-aurora).
const DESTAQUE: Record<string, Palavra["c"]> = {
  caneta: "a", verde: "g", jonas: "a", mãe: "a", "17": "a", centímetros: "a", física: "a", mil: "a", gramas: "a",
  porra: "v", merda: "v", puta: "v", caralho: "v", capeta: "v", ruim: "v", pudim: "v", cego: "v", gota: "v",
  pele: "a", calor: "a", arroz: "a", agudo: "a", queda: "a", formiga: "a", cabelo: "a", cola: "a",
  burra: "v", único: "g", shopping: "a", congelando: "v", fome: "v", vaga: "g", capinha: "a",
  diacho: "v", cacilda: "v", ingrato: "v", raios: "v",
};

const limpa = (w: string) => w.toLowerCase().replace(/[.,!?…]/g, "");

// Junta as palavras em pedaços de até 3, quebrando na pontuação.
const LEGENDAS: Legenda[] = CLIPES.filter((c) => c.id !== "n-parte2").flatMap((c) => {
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
  return saida.map((l, i) => ({ ...l, ate: Math.max(l.ate, (saida[i + 1]?.de ?? l.ate) - 0.02) }));
}).filter((l) => l.de > 3.2); // nos primeiros segundos quem fala é a pergunta na tela

const PI = janelasPi(CLIPES);

// Cenas: as 4 primeiras já animadas; o resto entra como cartão provisório.
const inicioDe = (id: string) => clipe(id).inicio;
const CENAS: { de: number; nome: string; C?: React.FC<{ t: number }> }[] = [
  { de: 0, nome: "1 cozinha", C: CenaCozinhaChao },
  { de: inicioDe("n-ceu") - 0.1, nome: "2 céu verde", C: CenaCeuVerde },
  { de: inicioDe("j-diacho-ceu") + 0.4, nome: "3 quarto noite", C: CenaQuartoNoite },
  { de: inicioDe("j-shopping") - 0.2, nome: "4 quarto gigante", C: CenaQuartoGigante },
  { de: inicioDe("n-fisica"), nome: "5 balança", C: CenaBalanca },
  { de: inicioDe("j-congelando"), nome: "6 frio", C: CenaFrio },
  { de: inicioDe("n-arroz"), nome: "7 arroz", C: CenaArroz },
  { de: inicioDe("j-mae") - 0.2, nome: "8 a mãe", C: CenaMae },
  { de: inicioDe("n-pudim"), nome: "9 Pudim acorda", C: CenaPudimAcorda },
  { de: inicioDe("j-capeta"), nome: "10 pulo da mesa", C: CenaPulo },
  { de: inicioDe("n-burra"), nome: "11 debaixo do sofá", C: CenaSofa },
  { de: inicioDe("j-cego"), nome: "12 mundo borrado", C: CenaBorrado },
  { de: inicioDe("n-gota"), nome: "13 a gota", C: CenaGota },
  { de: inicioDe("j-pronto") - 0.2, nome: "14 volta", C: CenaVolta },
  { de: inicioDe("o-vaga") - 0.4, nome: "15 o Olheiro", C: CenaOlheiro },
  { de: inicioDe("n-parte2") - 0.1, nome: "16 cartão final", C: CenaFinal },
];

const Provisorio: React.FC<{ nome: string }> = ({ nome }) => (
  <AbsoluteFill style={{ background: "linear-gradient(180deg,#231E40,#3F2D57)", alignItems: "center", justifyContent: "center" }}>
    <div style={{ fontFamily: FONTE, fontWeight: 800, fontSize: 54, color: COR.creme, opacity: 0.5, letterSpacing: 2 }}>CENA {nome.toUpperCase()}</div>
  </AbsoluteFill>
);

export const EpisodioAurora: React.FC = () => {
  const s = useCurrentFrame() / FPS;
  let i = 0;
  CENAS.forEach((c, k) => {
    if (s >= c.de) i = k;
  });
  const cena = CENAS[Math.max(0, i)];
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {cena.C ? <cena.C t={s - cena.de} /> : <Provisorio nome={cena.nome} />}
      <Acabamento />
      {s < 3.2 && (
        <Pergunta
          s={s}
          ate={3.2}
          linhas={[
            [{ t: "E" }, { t: "SE" }, { t: "CÊ" }, { t: "ACORDASSE" }, { t: "AMANHÃ" }],
            [{ t: "DO" }, { t: "TAMANHO" }, { t: "DE" }, { t: "UMA" }, { t: "CANETA?", c: "a" }],
          ]}
        />
      )}
      {s < CARTAZ_DE && <Legendas s={s} lista={LEGENDAS} />}
      <CartazPagina s={s - CARTAZ_DE + CARTAZ_ASTRAL} />
      <SonsAurora total={DURACAO_EP1} />
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
