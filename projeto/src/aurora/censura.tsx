import { Audio, Sequence, staticFile } from "remotion";

// Censura dos palavrões fortes (pedido do usuário em 06/11/2026, nos eps. 1, 2 e 3): na hora
// da palavra a voz some e entra um "pi"; na legenda ficam as duas primeiras letras e asteriscos
// (CARALHO → CA*****). "Merda" e "puta merda" continuam sem censura.

type Palavra = { w: string; s: number; e: number };
type ClipeVoz = { inicio: number; palavras: Palavra[] };

const FPS = 30;
const limpa = (w: string) => w.toLowerCase().replace(/[.,!?…:]/g, "");
const FORTE = /^(caralh|porra|fud|fod)/;

// Índices das palavras censuradas de um trecho ("puta que pariu" inteiro conta; "puta merda" não).
export const censuradas = (ps: Palavra[]): Set<number> => {
  const out = new Set<number>();
  ps.forEach((p, i) => {
    const w = limpa(p.w);
    if (FORTE.test(w)) out.add(i);
    if (w === "puta" && limpa(ps[i + 1]?.w ?? "") === "que" && limpa(ps[i + 2]?.w ?? "") === "pariu") {
      out.add(i);
      out.add(i + 2);
    }
  });
  return out;
};

// "caralho…" → "CA*****…" (mantém a pontuação do fim).
export const tapa = (w: string) => {
  const m = w.match(/^(.*?)([.,!?…:]*)$/)!;
  const letras = m[1];
  return letras.slice(0, 2) + "*".repeat(Math.max(1, letras.length - 2)) + m[2];
};

// Pi "CARÁ-pi" (pedido do usuário em 06/11/2026, a partir do ep. 4): o começo da palavra fica
// audível, pra dar pra entender o palavrão, e o pi entra em cima do resto. FICA = fração da
// palavra que continua no ar, medida na forma de onda (cará | lho, porr | a).
const FICA: [RegExp, number][] = [
  [/^caralh/, 0.58],
  [/^porra/, 0.64],
  [/^(fud|fod)/, 0.45],
];
const fica = (w: string) => FICA.find(([r]) => r.test(limpa(w)))?.[1] ?? 0.4;
// "caralho!" → "cara***!"; "porra!" → "po***!" (a legenda mostra o que a voz deixa ouvir).
export const tapaParcial = (w: string) => {
  const m = w.match(/^(.*?)([.,!?…:]*)$/)!;
  const letras = m[1];
  const n = Math.max(1, Math.round(letras.length * fica(w)));
  return letras.slice(0, n) + "*".repeat(Math.max(1, letras.length - n)) + m[2];
};
export const janelasPiParcial = (clipes: ClipeVoz[]): [number, number][] =>
  clipes.flatMap((c) =>
    [...censuradas(c.palavras)].map((i): [number, number] => {
      const p = c.palavras[i];
      return [p.s + (p.e - p.s) * fica(p.w), p.e + 0.1];
    }),
  );

// Janelas (s, no relógio do vídeo) em que toca o pi.
export const janelasPi = (clipes: ClipeVoz[]): [number, number][] =>
  clipes.flatMap((c) => [...censuradas(c.palavras)].map((i): [number, number] => [c.palavras[i].s - 0.03, c.palavras[i].e + 0.03]));

// Volume da voz de um trecho: zero dentro das janelas do pi.
export const volumeSemPalavrao = (inicio: number, janelas: [number, number][]) => (f: number) => {
  const s = inicio + f / FPS;
  return janelas.some(([a, b]) => s >= a && s <= b) ? 0 : 1;
};

export const Pis: React.FC<{ janelas: [number, number][] }> = ({ janelas }) => (
  <>
    {janelas.map(([a, b], i) => (
      <Sequence key={i} from={Math.round(a * FPS)} durationInFrames={Math.max(3, Math.round((b - a) * FPS))} layout="none">
        <Audio src={staticFile("aurora/sons/pi.wav")} />
      </Sequence>
    ))}
  </>
);
