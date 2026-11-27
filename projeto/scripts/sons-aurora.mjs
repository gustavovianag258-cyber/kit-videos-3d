// Também gera aurora-fundo.wav (fundinho suave da abertura), no fim deste arquivo.
// Trilha sombria do Olheiro (final do episódio 1 da série AURORA): drone grave em tom menor,
// pulso lento de coração e um brilho agudo dissonante que entra e sai. Sem chiado.
// Gera public/aurora/sons/olheiro-sombrio.wav. Rodar: node scripts/sons-aurora.mjs
import { join } from "node:path";
import { bordas, midi, normalizar, novo, reverb, salvarEm, SR } from "./sintese.mjs";

const PASTA = join(import.meta.dirname, "..", "public", "aurora", "sons");
const SEG = 20;
const [L, R] = novo(SEG);

const entra = (t) => Math.min(1, t / 3); // sobe devagar nos primeiros 3 s

// drone: Ré menor grave (D1, A1, D2, F2) com leve batimento entre os lados
const drone = [
  [26, 0.5],
  [33, 0.3],
  [38, 0.22],
  [41, 0.12],
];
for (let i = 0; i < L.length; i++) {
  const t = i / SR;
  let l = 0;
  let r = 0;
  for (const [n, a] of drone) {
    const f = midi(n);
    const lfo = 0.75 + 0.25 * Math.sin(2 * Math.PI * 0.07 * t + n);
    l += Math.sin(2 * Math.PI * f * t) * a * lfo;
    r += Math.sin(2 * Math.PI * f * 1.003 * t) * a * lfo;
  }
  L[i] += l * entra(t);
  R[i] += r * entra(t);
}

// pulso de coração lento (~52 bpm): duas batidas graves, "tum-tum"
const bpm = 52;
for (let b = 0; b * (60 / bpm) < SEG; b++) {
  for (const [atraso, vol] of [
    [0, 0.9],
    [0.22, 0.6],
  ]) {
    const t0 = b * (60 / bpm) + atraso + 1.5;
    for (let i = Math.floor(t0 * SR); i < Math.min(L.length, Math.floor((t0 + 0.5) * SR)); i++) {
      const t = i / SR - t0;
      const f = 55 * Math.exp(-t * 6) + 38;
      const v = Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 9) * vol * 0.9;
      L[i] += v;
      R[i] += v;
    }
  }
}

// brilho agudo dissonante (trítono), entrando e saindo devagar, como um olhar
for (let i = 0; i < L.length; i++) {
  const t = i / SR;
  const env = Math.max(0, Math.sin(2 * Math.PI * (t / 9) - 1.2)) ** 2 * 0.07 * entra(t);
  L[i] += Math.sin(2 * Math.PI * midi(86) * t) * env + Math.sin(2 * Math.PI * midi(92) * t) * env * 0.6;
  R[i] += Math.sin(2 * Math.PI * midi(86) * 1.002 * t) * env * 0.6 + Math.sin(2 * Math.PI * midi(92) * t) * env;
}

salvarEm(PASTA, "olheiro-sombrio", bordas(normalizar(reverb([L, R], 0.35, 0.9, 0.5), 0.85), 0.01, 2.5));

// Fundinho da abertura (o céu fica verde): acorde maior bem suave e aberto (Ré com 9ª), que
// respira devagar, mais umas notinhas de cristal soltas, combinando com o "brilho" dos efeitos.
// Sem melodia e sem chiado. Gera public/aurora/sons/aurora-fundo.wav.
{
  const S = 20;
  const [l, r] = novo(S);
  const acorde = [50, 57, 62, 64, 66];
  for (let i = 0; i < l.length; i++) {
    const t = i / SR;
    let a = 0;
    let b = 0;
    acorde.forEach((n, k) => {
      const resp = 0.6 + 0.4 * Math.sin(2 * Math.PI * (0.05 + k * 0.013) * t + k);
      const f = midi(n);
      a += Math.sin(2 * Math.PI * f * t) * resp * 0.12;
      b += Math.sin(2 * Math.PI * f * 1.002 * t + 0.5) * resp * 0.12;
    });
    const sobe = Math.min(1, t / 2);
    l[i] += a * sobe;
    r[i] += b * sobe;
  }
  // cristais: notas agudas da escala, espaçadas, decaindo rápido
  const notas = [86, 81, 88, 83, 86, 90, 81, 85];
  notas.forEach((n, k) => {
    const t0 = 1.2 + k * 2.3;
    const pan = k % 2 ? 0.7 : 1;
    for (let i = Math.floor(t0 * SR); i < Math.min(l.length, Math.floor((t0 + 2.5) * SR)); i++) {
      const t = i / SR - t0;
      const v = Math.sin(2 * Math.PI * midi(n) * t) * Math.exp(-t * 2.2) * 0.1 * Math.min(1, t / 0.01);
      l[i] += v * pan;
      r[i] += v * (1.7 - pan);
    }
  });
  salvarEm(PASTA, "aurora-fundo", bordas(normalizar(reverb([l, r], 0.45, 0.9, 0.4), 0.7), 0.01, 2));
}
