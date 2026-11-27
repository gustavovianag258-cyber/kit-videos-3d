import { agente, denis, edson, narrador, olheiro } from "./voz/palavras";

// Linha do tempo das vozes (mesmo esquema do ep. 5): cada trecho é um pedaço de uma geração e entra
// logo depois do anterior. As folgas grandes são de propósito: é o silêncio do escuro.

type Palavra = { w: string; s: number; e: number };
export type Voz = "narrador" | "denis" | "agente" | "olheiro" | "edson";
const PALAVRAS: Record<Voz, Palavra[]> = { narrador, denis, agente, olheiro, edson };
export const ARQUIVO: Record<Voz, string> = {
  narrador: "aurora-ep5b/voz/narrador-nivel.wav",
  denis: "aurora-ep5b/voz/denis-nivel.wav",
  agente: "aurora-ep5b/voz/agente-nivel.wav",
  olheiro: "aurora-ep5b/voz/olheiro-nivel.wav",
  edson: "aurora-ep5b/voz/edson-nivel.wav",
};

type Trecho = { id: string; voz: Voz; de: number; ate: number; tom?: number; folga?: number };

const TRECHOS: Trecho[] = [
  { id: "n-pergunta", voz: "narrador", de: 0, ate: 3.7 },
  { id: "n-denis", voz: "narrador", de: 3.94, ate: 8.3, folga: 0.2 },
  { id: "n-agentes", voz: "narrador", de: 8.54, ate: 11.4 },
  { id: "d-laje", voz: "denis", de: 0, ate: 2.6, folga: 0.15 },
  { id: "n-galpao", voz: "narrador", de: 11.6, ate: 14.45, folga: 0.35 },
  { id: "n-volta", voz: "narrador", de: 14.66, ate: 18.35 },
  { id: "d-aguado", voz: "denis", de: 2.85, ate: 6.7, folga: 0.2 },
  { id: "a-anota", voz: "agente", de: 0, ate: 0.65, folga: 0.35 },
  { id: "n-fisica", voz: "narrador", de: 18.62, ate: 19.9, folga: 0.3 },
  { id: "n-peso", voz: "narrador", de: 20.26, ate: 22.8 },
  { id: "n-boia", voz: "narrador", de: 23.12, ate: 26.35 },
  { id: "n-resp", voz: "narrador", de: 26.62, ate: 28.15 },
  { id: "d-aperta", voz: "denis", de: 6.88, ate: 8.4, folga: 0.15 },
  { id: "n-cura", voz: "narrador", de: 28.46, ate: 30.75, folga: 0.3 },
  { id: "n-reacao", voz: "narrador", de: 30.96, ate: 34.6 },
  { id: "a-solto", voz: "agente", de: 1.12, ate: 4.3, folga: 0.4 },
  { id: "n-ruim", voz: "narrador", de: 34.92, ate: 35.6, folga: 0.4 },
  { id: "n-boca", voz: "narrador", de: 35.96, ate: 36.7, folga: 0.2 },
  { id: "n-apito", voz: "narrador", de: 37.18, ate: 38.25, folga: 2.6 },
  { id: "n-luz", voz: "narrador", de: 38.48, ate: 39.4, folga: 0.2 },
  { id: "n-re", voz: "narrador", de: 39.68, ate: 43.55, folga: 0.3 },
  { id: "d-porra", voz: "denis", de: 8.58, ate: 11.4, folga: 1.0 },
  { id: "o-ouvi", voz: "olheiro", de: 0, ate: 1.95, folga: 0.8 },
  { id: "d-quem", voz: "denis", de: 11.72, ate: 12.6, folga: 0.2 },
  { id: "o-lista", voz: "olheiro", de: 2.4, ate: 5.3, folga: 0.25 },
  { id: "n-ninguem", voz: "narrador", de: 43.72, ate: 45.7, folga: 0.6 },
  { id: "n-vez", voz: "narrador", de: 46.12, ate: 47.7 },
  { id: "n-89", voz: "narrador", de: 48.1, ate: 50.8 },
  { id: "o-apontava", voz: "olheiro", de: 5.88, ate: 6.7, folga: 0.3 },
  { id: "o-levavam", voz: "olheiro", de: 7.24, ate: 7.95, folga: 0.3 },
  { id: "d-blocos", voz: "denis", de: 12.81, ate: 14.2, folga: 0.6 },
  { id: "o-31", voz: "olheiro", de: 8.44, ate: 9.9, folga: 1.2 },
  { id: "o-preciso", voz: "olheiro", de: 10.42, ate: 12.3, folga: 1.0 },
  { id: "d-merda", voz: "denis", de: 14.58, ate: 15.65, folga: 0.5 },
  { id: "n-contrato", voz: "narrador", de: 51.22, ate: 53.2, folga: 1.2 },
  { id: "e-parede", voz: "edson", de: 0, ate: 5.2, folga: 0.2 },
  { id: "a-assina", voz: "agente", de: 4.74, ate: 5.85, folga: 0.25 },
  { id: "n-parte3", voz: "narrador", de: 53.52, ate: 54.7, folga: 1.0 },
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
