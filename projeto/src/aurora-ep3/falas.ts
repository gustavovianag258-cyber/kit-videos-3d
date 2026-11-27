import { bruno, edson, narrador, narrador2, olheiro } from "./voz/palavras";

// Linha do tempo das vozes do episódio 3 (mesmo esquema dos eps. 1 e 2): cada trecho é um
// pedaço de uma geração e entra logo depois do anterior. `de`/`ate` são aproximados: o corte
// encaixa no início e no fim das palavras de verdade.

type Palavra = { w: string; s: number; e: number };
export type Voz = "narrador" | "narrador2" | "edson" | "bruno" | "olheiro";
const PALAVRAS: Record<Voz, Palavra[]> = { narrador, narrador2, edson, bruno, olheiro };
// vozes com o nível igualado (ganho linear, ~-22 LUFS cada)
export const ARQUIVO: Record<Voz, string> = {
  narrador: "aurora-ep3/voz/narrador-nivel.wav",
  narrador2: "aurora-ep3/voz/narrador2-nivel.wav", // frases novas da v2
  edson: "aurora-ep3/voz/edson-nivel.wav",
  bruno: "aurora-ep3/voz/bruno-nivel.wav",
  olheiro: "aurora-ep3/voz/olheiro-nivel.wav",
};

type Trecho = { id: string; voz: Voz; de: number; ate: number; tom?: number; folga?: number };

// folga = respiro antes do trecho, em segundos.
const TRECHOS: Trecho[] = [
  { id: "n-pergunta", voz: "narrador", de: 0, ate: 2.6 },
  { id: "n-ceu", voz: "narrador", de: 2.85, ate: 6.9, folga: 0.25 },
  { id: "n-edson", voz: "narrador", de: 7.1, ate: 11.5 },
  { id: "e-ceu", voz: "edson", de: 0, ate: 5.0, folga: 0.3 },
  { id: "n-lixo", voz: "narrador", de: 11.55, ate: 15.6, folga: 0.3 },
  { id: "e-pe", voz: "edson", de: 5.3, ate: 7.0, folga: 0.2 },
  { id: "e-cuspiu", voz: "edson", de: 7.1, ate: 9.9, folga: 0.5 },
  { id: "n-regra", voz: "narrador", de: 15.75, ate: 23.0, folga: 0.2 },
  { id: "n-porta", voz: "narrador2", de: 0, ate: 6.6, folga: 0.3 },
  // v2: sai o "átomo vazio / Itaquerão" (24,5 a 29,3 s da gravação)
  { id: "n-fisica", voz: "narrador", de: 23.05, ate: 24.5, folga: 0.5 },
  { id: "n-parede", voz: "narrador", de: 29.3, ate: 33.95, folga: 0.1 },
  { id: "n-empurrao", voz: "narrador", de: 33.95, ate: 38.7 },
  { id: "n-ar", voz: "narrador", de: 38.75, ate: 41.5, folga: 0.2 },
  { id: "e-folego", voz: "edson", de: 10.0, ate: 13.5 },
  { id: "n-atrito", voz: "narrador", de: 41.55, ate: 45.8, folga: 0.2 },
  { id: "e-luz", voz: "edson", de: 13.6, ate: 15.3, folga: 1.0 },
  { id: "n-cego", voz: "narrador", de: 45.85, ate: 49.4 },
  { id: "n-travou", voz: "narrador2", de: 6.8, ate: 10.8, folga: 0.6 },
  { id: "e-atalho", voz: "edson", de: 15.4, ate: 17.4, folga: 0.3 },
  { id: "n-garagem", voz: "narrador", de: 49.45, ate: 55.5 },
  { id: "n-ruim", voz: "narrador", de: 55.55, ate: 58.45, folga: 0.9 },
  { id: "e-mmm", voz: "edson", de: 17.5, ate: 19.25 },
  { id: "n-japao", voz: "narrador", de: 58.45, ate: 68.3 },
  { id: "e-puta", voz: "edson", de: 19.25, ate: 20.9, folga: 0.5 },
  { id: "n-portao", voz: "narrador", de: 68.35, ate: 70.3, folga: 0.5 },
  { id: "b-grudei", voz: "bruno", de: 0, ate: 2.4, folga: 0.2 },
  { id: "e-filho", voz: "edson", de: 20.95, ate: 24.4, folga: 0.2 },
  { id: "o-vaga", voz: "olheiro", de: 0, ate: 4.3, folga: 1.4 },
  { id: "e-livro", voz: "edson", de: 24.45, ate: 26.2, folga: 0.4 },
  { id: "n-apneia", voz: "narrador", de: 70.4, ate: 76.3, folga: 0.7 },
  { id: "e-ronco", voz: "edson", de: 26.2, ate: 29.5, folga: 0.2 },
  { id: "n-queda", voz: "narrador", de: 76.3, ate: 79.6, folga: 0.2 },
  { id: "n-parte2", voz: "narrador", de: 79.65, ate: 81.3, folga: 0.6 },
];

export type Clipe = Trecho & { inicio: number; fim: number; palavras: Palavra[] };

const ENTRE = 0.12; // respiro padrão entre um trecho e outro
const ANTES = 0.06; // pega um tiquinho antes da 1ª palavra (ataque da consoante)
const DEPOIS = 0.18; // e deixa a última palavra terminar

export const CLIPES: Clipe[] = (() => {
  let t = 0.15;
  return TRECHOS.map((tr) => {
    const ps = PALAVRAS[tr.voz].filter((p) => p.s >= tr.de - 0.02 && p.s < tr.ate);
    const de = Math.max(0, ps[0].s - ANTES);
    const ate = ps[ps.length - 1].e + DEPOIS;
    t += tr.folga ?? 0;
    const inicio = t;
    // palavras com o tempo já no relógio do vídeo
    const palavras = ps.map((p) => ({ w: p.w, s: inicio + (p.s - de), e: inicio + (p.e - de) }));
    t = inicio + (ate - de) + ENTRE;
    return { ...tr, de, ate, inicio, fim: inicio + (ate - de), palavras };
  });
})();

export const FIM_VOZ = CLIPES[CLIPES.length - 1].fim;
export const clipe = (id: string) => CLIPES.find((c) => c.id === id)!;
// momento (no relógio do vídeo) em que uma palavra de um trecho começa
export const palavra = (id: string, w: string) => clipe(id).palavras.find((p) => p.w.toLowerCase().startsWith(w.toLowerCase()))!.s;
// janelas de fala de um personagem, relativas ao início de uma cena
export const janelas = (vozes: string[], inicioCena: number): [number, number][] =>
  CLIPES.filter((c) => vozes.includes(c.voz) && !["e-mmm", "e-ronco"].includes(c.id)).flatMap((c) =>
    c.palavras.map((p): [number, number] => [p.s - inicioCena, p.e - inicioCena]),
  );
