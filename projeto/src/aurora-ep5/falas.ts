import { agente, denis, narrador, olheiro } from "./voz/palavras";

// Linha do tempo das vozes do episódio 5 (mesmo esquema do ep. 4): cada trecho é um pedaço de uma
// geração e entra logo depois do anterior. As folgas grandes da segunda metade são de propósito:
// de noite o episódio respira, só com a chuva.

type Palavra = { w: string; s: number; e: number };
export type Voz = "narrador" | "denis" | "agente" | "olheiro";
const PALAVRAS: Record<Voz, Palavra[]> = { narrador, denis, agente, olheiro };
export const ARQUIVO: Record<Voz, string> = {
  narrador: "aurora-ep5/voz/narrador-nivel.wav",
  denis: "aurora-ep5/voz/denis-nivel.wav",
  agente: "aurora-ep5/voz/agente-nivel.wav",
  olheiro: "aurora-ep5/voz/olheiro-nivel.wav",
};

type Trecho = { id: string; voz: Voz; de: number; ate: number; tom?: number; folga?: number };

const TRECHOS: Trecho[] = [
  { id: "n-pergunta", voz: "narrador", de: 0, ate: 2.4 },
  { id: "n-ceu", voz: "narrador", de: 2.7, ate: 6.7, folga: 0.25 },
  { id: "n-denis", voz: "narrador", de: 7.0, ate: 11.5 },
  { id: "d-ceu", voz: "denis", de: 0, ate: 5.2, folga: 0.15 },
  { id: "n-martelo", voz: "narrador", de: 11.75, ate: 14.7, folga: 0.3 },
  { id: "d-porra", voz: "denis", de: 5.4, ate: 6.2, folga: 0.1 },
  { id: "d-doeu", voz: "denis", de: 6.6, ate: 8.0, folga: 0.35 },
  { id: "n-dedo", voz: "narrador", de: 14.88, ate: 18.1, folga: 0.2 },
  { id: "n-fisica1", voz: "narrador", de: 18.38, ate: 23.6, folga: 0.3 },
  { id: "n-fisica2", voz: "narrador", de: 23.85, ate: 28.6 },
  { id: "d-parede", voz: "denis", de: 8.45, ate: 10.4, folga: 0.2 },
  { id: "n-tiao", voz: "narrador", de: 28.78, ate: 34.2, folga: 0.3 },
  { id: "n-ruim", voz: "narrador", de: 34.35, ate: 36.4, folga: 0.2 },
  { id: "n-queda", voz: "narrador", de: 36.66, ate: 39.1, folga: 0.1 },
  { id: "n-corpo", voz: "narrador", de: 39.35, ate: 43.9, folga: 0.25 },
  { id: "d-caralho", voz: "denis", de: 10.54, ate: 11.4, folga: 0.15 },
  { id: "d-vivo", voz: "denis", de: 12.3, ate: 13.4, folga: 0.3 },
  { id: "n-hospital", voz: "narrador", de: 44.08, ate: 46.0, folga: 0.4 },
  { id: "n-agulhas", voz: "narrador", de: 46.28, ate: 47.6, folga: 0.8 },
  { id: "n-sistema", voz: "narrador", de: 47.7, ate: 49.6, folga: 0.25 },
  { id: "n-le", voz: "narrador", de: 49.8, ate: 52.3 },
  { id: "a-ceu", voz: "agente", de: 0, ate: 4.2, folga: 2.8 },
  { id: "n-olheiro", voz: "narrador", de: 52.46, ate: 54.6, folga: 1.25 },
  { id: "n-jonas", voz: "narrador", de: 54.75, ate: 56.0, folga: 0.35 },
  { id: "n-edson", voz: "narrador", de: 56.05, ate: 57.4, folga: 0.35 },
  { id: "n-kaique", voz: "narrador", de: 57.5, ate: 58.8, folga: 0.35 },
  { id: "o-lista", voz: "olheiro", de: 0, ate: 3.4, folga: 2.4 },
  { id: "d-quem", voz: "denis", de: 13.55, ate: 14.4, folga: 0.5 },
  { id: "n-ninguem", voz: "narrador", de: 59.0, ate: 61.0, folga: 1.3 },
  { id: "n-respirar", voz: "narrador", de: 61.3, ate: 66.7, folga: 0.3 },
  { id: "a-solto", voz: "agente", de: 4.4, ate: 7.5, folga: 0.7 },
  { id: "d-merda", voz: "denis", de: 14.6, ate: 15.75, folga: 0.4 },
  { id: "n-parte2", voz: "narrador", de: 66.9, ate: 68.3, folga: 1.3 },
];

export type Clipe = Trecho & { inicio: number; fim: number; palavras: Palavra[] };

const ENTRE = 0.12;
const ANTES = 0.06;
const DEPOIS = 0.18;

export const CLIPES: Clipe[] = (() => {
  let t = 0.15;
  return TRECHOS.map((tr) => {
    const ps = PALAVRAS[tr.voz].filter((p) => p.s >= tr.de - 0.02 && p.s < tr.ate);
    const de = Math.max(0, ps[0].s - ANTES);
    const ate = ps[ps.length - 1].e + DEPOIS;
    t += tr.folga ?? 0;
    const inicio = t;
    const palavras = ps.map((p) => ({ w: p.w, s: inicio + (p.s - de), e: inicio + (p.e - de) }));
    t = inicio + (ate - de) + ENTRE;
    return { ...tr, de, ate, inicio, fim: inicio + (ate - de), palavras };
  });
})();

export const FIM_VOZ = CLIPES[CLIPES.length - 1].fim;
export const clipe = (id: string) => CLIPES.find((c) => c.id === id)!;
export const palavra = (id: string, w: string) => clipe(id).palavras.find((p) => p.w.toLowerCase().startsWith(w.toLowerCase()))!.s;
// janelas de fala de um personagem, relativas ao início de uma cena
export const janelas = (vozes: string[], inicioCena: number): [number, number][] =>
  CLIPES.filter((c) => vozes.includes(c.voz)).flatMap((c) => c.palavras.map((p): [number, number] => [p.s - inicioCena, p.e - inicioCena]));
