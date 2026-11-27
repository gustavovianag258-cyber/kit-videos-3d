import { edson, kaique, narrador, olheiro } from "./voz/palavras";

// Linha do tempo das vozes do episódio 4 (mesmo esquema do ep. 3): cada trecho é um pedaço de
// uma geração e entra logo depois do anterior. O corte encaixa no início/fim das palavras.

type Palavra = { w: string; s: number; e: number };
export type Voz = "narrador" | "kaique" | "edson" | "olheiro";
const PALAVRAS: Record<Voz, Palavra[]> = { narrador, kaique, edson, olheiro };
export const ARQUIVO: Record<Voz, string> = {
  narrador: "aurora-ep4/voz/narrador-nivel.wav",
  kaique: "aurora-ep4/voz/kaique-nivel.wav",
  edson: "aurora-ep4/voz/edson-nivel.wav",
  olheiro: "aurora-ep4/voz/olheiro-nivel.wav",
};

type Trecho = { id: string; voz: Voz; de: number; ate: number; tom?: number; folga?: number };

const TRECHOS: Trecho[] = [
  { id: "n-pergunta", voz: "narrador", de: 0, ate: 3.0 },
  { id: "n-ceu", voz: "narrador", de: 3.05, ate: 7.2, folga: 0.2 },
  { id: "n-kaique", voz: "narrador", de: 7.4, ate: 12.9 },
  { id: "k-lindo", voz: "kaique", de: 0, ate: 2.8, folga: 0.15 },
  { id: "n-osso", voz: "narrador", de: 12.95, ate: 16.45, folga: 0.3 },
  { id: "k-caralho", voz: "kaique", de: 2.9, ate: 5.2, folga: 0.15 },
  { id: "k-gato", voz: "kaique", de: 5.25, ate: 7.9, folga: 0.2 },
  { id: "n-regra", voz: "narrador", de: 16.5, ate: 20.3, folga: 0.3 },
  { id: "k-interruptor", voz: "kaique", de: 7.95, ate: 9.5, folga: 0.1 },
  { id: "n-fisica1", voz: "narrador", de: 20.35, ate: 30.3, folga: 0.3 },
  { id: "n-fisica2", voz: "narrador", de: 30.4, ate: 38.5, folga: 0.1 },
  { id: "k-lanterna", voz: "kaique", de: 9.55, ate: 12.05, folga: 0.15 },
  { id: "n-vantagem", voz: "narrador", de: 38.55, ate: 41.4, folga: 0.3 },
  { id: "k-cebola", voz: "kaique", de: 12.1, ate: 14.85, folga: 0.1 },
  { id: "k-instinto", voz: "kaique", de: 14.9, ate: 16.5, folga: 0.15 },
  { id: "n-zeno", voz: "narrador", de: 41.5, ate: 43.0, folga: 0.1 },
  { id: "e-andar", voz: "edson", de: 0, ate: 4.0, folga: 0.3 },
  { id: "n-foto", voz: "narrador", de: 43.2, ate: 44.95, folga: 0.2 },
  { id: "n-chuvisco", voz: "narrador", de: 45.0, ate: 46.9 },
  { id: "n-sensor", voz: "narrador", de: 46.92, ate: 49.25 },
  { id: "k-porra", voz: "kaique", de: 16.55, ate: 18.7, folga: 0.15 },
  { id: "n-escolhe", voz: "narrador", de: 49.3, ate: 54.3, folga: 0.3 },
  { id: "k-parafuso", voz: "kaique", de: 18.8, ate: 21.8, folga: 0.1 },
  { id: "n-dona", voz: "narrador", de: 54.4, ate: 56.3, folga: 0.15 },
  { id: "n-ruim", voz: "narrador", de: 56.35, ate: 60.5, folga: 0.3 },
  { id: "k-pimenta", voz: "kaique", de: 21.85, ate: 24.5, folga: 0.15 },
  { id: "n-radio", voz: "narrador", de: 60.55, ate: 63.1, folga: 0.15 },
  { id: "n-esqueleto", voz: "narrador", de: 63.2, ate: 66.8, folga: 0.3 },
  { id: "o-encomenda", voz: "olheiro", de: 0, ate: 4.6, folga: 2.15 },
  { id: "k-quem", voz: "kaique", de: 24.6, ate: 25.3, folga: 0.3 },
  { id: "n-ninguem", voz: "narrador", de: 66.85, ate: 72.4, folga: 0.5 },
  { id: "k-dentro", voz: "kaique", de: 25.3, ate: 27.5, folga: 0.5 },
  { id: "n-parte2", voz: "narrador", de: 72.45, ate: 74.5, folga: 1.7 },
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
