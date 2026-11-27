// Vídeo-demo "Glomerulonefrite pós-estreptocócica" (caso do Lucas), 1 minuto, estilo bonecos 3D
// de cabeça redonda. Os tempos vêm de palavras.json (scripts/glomerulo-dados.py): cada frase da
// narração é uma cena, e os selos/objetos entram no instante em que a palavra é falada.
import { interpolate } from "remotion";
import dados from "./palavras.json";

export const FPS = 30;
export type V3 = [number, number, number];
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export type Palavra = { w: string; f: number; s: number; e: number };
export const PALAVRAS: Palavra[] = dados.palavras;
export const DURACAO_SEGUNDOS: number = dados.fim;
export const DURACAO_FRAMES = Math.ceil(DURACAO_SEGUNDOS * FPS);
export const N_FRASES = PALAVRAS[PALAVRAS.length - 1].f + 1;

// a cena i vai do começo da frase i até o começo da frase i+1 (corte 0,12 s antes da fala)
const ANTES = 0.12;
export const INICIO_FRASE = Array.from({ length: N_FRASES }, (_, i) => {
  const p = PALAVRAS.find((x) => x.f === i)!;
  return i === 0 ? 0 : Math.max(0, p.s - ANTES);
});
export const fimFrase = (i: number) => (i + 1 < N_FRASES ? INICIO_FRASE[i + 1] : DURACAO_SEGUNDOS);
export const fraseEm = (s: number) => {
  let i = 0;
  while (i + 1 < N_FRASES && s >= INICIO_FRASE[i + 1]) i++;
  return i;
};

const limpa = (x: string) =>
  x
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\w]/g, "");

// segundo (relativo ao começo da cena) em que a palavra é dita dentro da frase; n = ocorrência
export const naFala = (frase: number, palavra: string, n = 0) => {
  const alvo = limpa(palavra);
  const achadas = PALAVRAS.filter((p) => p.f === frase && limpa(p.w) === alvo);
  const p = achadas[Math.min(n, achadas.length - 1)];
  if (!p) throw new Error(`palavra "${palavra}" não está na frase ${frase}`);
  return p.s - INICIO_FRASE[frase];
};

// 0 → 1 suave entre dois instantes
export const entre = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], clamp);
export const suave = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
// "pop" com leve passada do tamanho (como objeto de desenho animado que surge)
export const pop = (t: number, ini: number, dur = 0.32) => {
  const x = (t - ini) / dur;
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  return 1 + 2.2 * Math.pow(x - 1, 3) + 1.2 * Math.pow(x - 1, 2);
};
export const lerp = (a: number, b: number, x: number) => a + (b - a) * x;
export const lerp3 = (a: V3, b: V3, x: number): V3 => [lerp(a[0], b[0], x), lerp(a[1], b[1], x), lerp(a[2], b[2], x)];
