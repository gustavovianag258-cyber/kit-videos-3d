import { bruno, cida, narrador, olheiro } from "./voz/palavras";

// Linha do tempo das vozes do episódio 2 (mesmo esquema do ep. 1): cada trecho é um pedaço
// de uma geração e entra logo depois do anterior. `de`/`ate` são aproximados: o corte encaixa
// no início e no fim das palavras de verdade.

type Palavra = { w: string; s: number; e: number };
export type Voz = "narrador" | "bruno" | "cida" | "olheiro";
const PALAVRAS: Record<Voz, Palavra[]> = { narrador, bruno, cida, olheiro };
// vozes com o nível igualado (ganho linear, ~-22 LUFS cada)
export const ARQUIVO: Record<Voz, string> = {
  narrador: "aurora-ep2/voz/narrador-nivel.wav",
  bruno: "aurora-ep2/voz/bruno-nivel.wav",
  cida: "aurora-ep2/voz/cida-nivel.wav",
  olheiro: "aurora-ep2/voz/olheiro-nivel.wav",
};

type Trecho = { id: string; voz: Voz; de: number; ate: number; tom?: number; folga?: number };

// folga = respiro antes do trecho, em segundos.
const TRECHOS: Trecho[] = [
  { id: "n-pergunta", voz: "narrador", de: 0, ate: 2.5 },
  { id: "n-ceu", voz: "narrador", de: 2.55, ate: 6.7, folga: 0.25 },
  { id: "n-bruno", voz: "narrador", de: 6.75, ate: 12.6 },
  { id: "b-ceu", voz: "bruno", de: 0, ate: 3.4, folga: 0.3 },
  { id: "n-manha", voz: "narrador", de: 12.6, ate: 16.4, folga: 0.3 },
  { id: "b-cofrinho", voz: "bruno", de: 3.45, ate: 5.6 },
  { id: "n-aco", voz: "narrador", de: 16.4, ate: 19.7 },
  { id: "b-geladeira", voz: "bruno", de: 5.6, ate: 9.0, folga: 0.4 },
  { id: "n-fisica", voz: "narrador", de: 19.7, ate: 27.0, folga: 0.2 },
  { id: "n-bussola", voz: "narrador", de: 27.0, ate: 30.9, folga: 0.2 },
  { id: "b-polo", voz: "bruno", de: 9.05, ate: 11.1 },
  { id: "n-sangue", voz: "narrador", de: 30.9, ate: 37.8, folga: 0.2 },
  { id: "n-rua", voz: "narrador", de: 37.85, ate: 45.6, folga: 0.2 },
  { id: "n-busao", voz: "narrador", de: 45.65, ate: 46.9, folga: 0.2 },
  { id: "c-sombrinha", voz: "cida", de: 0, ate: 6.0, folga: 1.3 },
  { id: "b-fisica", voz: "bruno", de: 11.1, ate: 13.05 },
  { id: "n-ruim", voz: "narrador", de: 46.95, ate: 50.3, folga: 1.5 },
  { id: "b-puta", voz: "bruno", de: 13.05, ate: 16.3 },
  { id: "n-toneladas", voz: "narrador", de: 50.35, ate: 55.95, folga: 0.2 },
  { id: "n-atrito", voz: "narrador", de: 55.95, ate: 61.9 },
  { id: "b-respira", voz: "bruno", de: 16.35, ate: 20.4, folga: 0.4 },
  { id: "n-regra", voz: "narrador", de: 61.95, ate: 66.6, folga: 0.2 },
  { id: "o-final", voz: "olheiro", de: 0, ate: 5.0, folga: 1.6 },
  { id: "b-sabe", voz: "bruno", de: 20.4, ate: 22.0, folga: 0.5 },
  { id: "n-trave", voz: "narrador", de: 66.62, ate: 71.2, folga: 0.4 },
  { id: "b-fudeu", voz: "bruno", de: 22.0, ate: 23.1, folga: 0.3 },
  { id: "n-parte2", voz: "narrador", de: 71.22, ate: 73.0, folga: 0.6 },
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
  CLIPES.filter((c) => vozes.includes(c.voz)).flatMap((c) => c.palavras.map((p): [number, number] => [p.s - inicioCena, p.e - inicioCena]));
