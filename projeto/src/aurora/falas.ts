import { cida, jonas, jonas2, narrador, olheiro } from "./voz/palavras";

// Linha do tempo das vozes do episódio 1. Cada trecho é um pedaço de uma geração (narrador e
// Jonas foram gerados inteiros, numa tomada só) e entra logo depois do anterior.
// `de`/`ate` são aproximados: o corte encaixa no início e no fim das palavras de verdade.

type Palavra = { w: string; s: number; e: number };
export type Voz = "narrador" | "jonas" | "jonas2" | "cida" | "olheiro";
const PALAVRAS: Record<Voz, Palavra[]> = { narrador, jonas, jonas2, cida, olheiro };
export const ARQUIVO: Record<Voz, string> = {
  narrador: "aurora/voz/narrador.mp3",
  jonas: "aurora/voz/jonas.mp3",
  // falas regravadas com menos palavrão (mesma voz)
  jonas2: "aurora/voz/jonas2.mp3",
  cida: "aurora/voz/cida.mp3",
  olheiro: "aurora/voz/olheiro.mp3",
};

type Trecho = { id: string; voz: Voz; de: number; ate: number; tom?: number; folga?: number };

// tom > 1 afina a voz (Jonas pequeno). folga = respiro antes do trecho, em segundos.
const TRECHOS: Trecho[] = [
  { id: "n-pergunta", voz: "narrador", de: 0, ate: 2.9 },
  { id: "n-ceu", voz: "narrador", de: 3.0, ate: 7.6, folga: 0.25 },
  { id: "j-diacho-ceu", voz: "jonas2", de: 0, ate: 2.6 },
  { id: "n-jonas", voz: "narrador", de: 7.7, ate: 12.5 },
  { id: "j-shopping", voz: "jonas", de: 2.8, ate: 5.8, folga: 0.4, tom: 1.15 },
  { id: "n-17cm", voz: "narrador", de: 12.55, ate: 14.4 },
  { id: "j-puta-merda", voz: "jonas", de: 5.95, ate: 7.3, tom: 1.15 },
  { id: "n-fisica", voz: "narrador", de: 14.5, ate: 22.6, folga: 0.3 },
  { id: "j-capinha", voz: "jonas", de: 7.5, ate: 10.0, tom: 1.15 },
  { id: "j-congelando", voz: "jonas2", de: 3.2, ate: 7.0, folga: 0.35, tom: 1.15 },
  { id: "n-pele", voz: "narrador", de: 22.8, ate: 27.4 },
  { id: "n-arroz", voz: "narrador", de: 27.5, ate: 31.9 },
  { id: "j-fome", voz: "jonas", de: 13.45, ate: 15.5, folga: 0.5, tom: 1.15 },
  { id: "j-mae", voz: "jonas", de: 15.6, ate: 16.4, folga: 0.3, tom: 1.7 },
  { id: "c-celular", voz: "cida", de: 0, ate: 3.8, folga: 0.25 },
  { id: "n-corda", voz: "narrador", de: 32.0, ate: 34.4 },
  { id: "n-pudim", voz: "narrador", de: 34.5, ate: 37.8, folga: 0.3 },
  { id: "j-racao", voz: "jonas2", de: 7.1, ate: 11.1, tom: 1.15 },
  { id: "j-capeta", voz: "jonas", de: 19.7, ate: 21.0, folga: 0.3, tom: 1.15 },
  { id: "n-queda", voz: "narrador", de: 37.9, ate: 44.0, folga: 0.5 },
  { id: "j-vivo", voz: "jonas", de: 21.9, ate: 24.4, tom: 1.15 },
  { id: "n-burra", voz: "narrador", de: 44.05, ate: 46.9, folga: 0.3 },
  { id: "j-menor", voz: "jonas", de: 24.6, ate: 27.0, tom: 1.15 },
  { id: "j-cego", voz: "jonas", de: 27.1, ate: 28.85, folga: 0.6, tom: 1.3 },
  { id: "n-pupila", voz: "narrador", de: 46.95, ate: 54.1 },
  { id: "n-gota", voz: "narrador", de: 54.15, ate: 61.0, folga: 0.3 },
  { id: "j-afogado", voz: "jonas", de: 28.9, ate: 30.9, tom: 1.3 },
  { id: "j-pronto", voz: "jonas", de: 31.0, ate: 33.0, folga: 0.7, tom: 1.15 },
  { id: "o-vaga", voz: "olheiro", de: 0, ate: 4.4, folga: 0.8 },
  { id: "j-quem", voz: "jonas2", de: 14.6, ate: 15.9, folga: 0.5, tom: 1.15 },
  { id: "n-unico", voz: "narrador", de: 61.1, ate: 66.1, folga: 0.4 },
  { id: "n-parte2", voz: "narrador", de: 66.2, ate: 67.68, folga: 0.5 },
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
