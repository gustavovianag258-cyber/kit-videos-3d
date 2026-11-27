import { Easing } from "remotion";
import narracao from "./narracao.json";

// Tudo aqui vem de src/narracao.json, gerado por scripts/montar_narracao.mjs
// a partir do áudio real. Nenhum tempo de fala é digitado à mão.

export const FPS = 30;
export const DURACAO = 15 * FPS;

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const ease = Easing.inOut(Easing.cubic);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export type Vec3 = [number, number, number];

export type Palavra = { texto: string; inicio: number; fim: number }; // em frames
export type Fala = { texto: string; palavras: Palavra[] };

export const FALAS: Fala[] = narracao.falas.map((f) => {
  // Usa o texto original (com pontuação) quando o número de palavras bate
  const tokens = f.texto.split(" ");
  const mesmoTamanho = tokens.length === f.palavras.length;
  return {
    texto: f.texto,
    palavras: f.palavras.map((p, i) => ({
      texto: mesmoTamanho ? tokens[i] : p.texto,
      inicio: p.inicio * FPS,
      fim: p.fim * FPS,
    })),
  };
});

// Cada cena começa um pouquinho antes da primeira palavra da sua fala
const antesDaFala = (i: number) => Math.round(FALAS[i].palavras[0].inicio) - 4;

export const CENAS = {
  gancho: 0,
  disco: antesDaFala(1),
  borda: antesDaFala(2),
  gravidade: antesDaFala(3),
  final: antesDaFala(4),
  cartaz: 14 * FPS,
} as const;

// Abertura da boca (0 a 1) a partir do volume real da voz neste frame
export const aberturaBoca = (frameGlobal: number) => {
  const v = narracao.volume[Math.round(frameGlobal)] ?? 0;
  return Math.min(1, Math.max(0, (v - 0.08) / 0.5));
};
