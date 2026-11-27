// "E se você pudesse fazer projeção astral?" — cópia fiel (traduzida) de um reel gringo
// (Downloads/copy-videos.inst). Todos os tempos abaixo foram medidos no original, quadro a quadro.

export const FPS = 30;
// a história (cópia do original) vai até 74,7 s; depois vem o cartaz da página (Mundo Paralelo)
export const FIM_HISTORIA = 74.7;
export const CARTAZ = { de: 74.7, voz: 75.0, ate: 81.2 };
export const DURACAO_SEGUNDOS = 81.2;
export const DURACAO_FRAMES = Math.round(DURACAO_SEGUNDOS * FPS);

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export type V3 = [number, number, number];

// Cenas (cada uma é um palco 3D próprio)
export const CENAS = {
  quarto: [0, 10.62],
  vizinho: [10.62, 18.9],
  barcelona: [18.9, 27.1],
  vaticano: [27.1, 34.08],
  gize: [34.08, 41.1],
  washington: [41.1, 48.55],
  area51: [48.55, 59.5],
  espaco: [59.5, 66.4],
  mergulho: [66.4, 67.1],
  acorda: [67.1, DURACAO_SEGUNDOS],
} as const;
export type Cena = keyof typeof CENAS;
export const cenaEm = (s: number): Cena => {
  for (const [k, [a, b]] of Object.entries(CENAS)) if (s >= a && s < b) return k as Cena;
  return "acorda";
};

// Legendas (itálico, como no original). `voz` = frase da narração que começa junto.
export type Legenda = { de: number; ate: number; texto: string; voz: number };
export const LEGENDAS: Legenda[] = [
  { de: 4.0, ate: 6.5, texto: "Esse é você. Dormindo.", voz: 1 },
  { de: 7.0, ate: 10.4, texto: "As paredes não te seguram mais.", voz: 2 },
  { de: 11.6, ate: 13.6, texto: "Seu crush, às 3 da manhã.", voz: 3 },
  { de: 14.25, ate: 16.6, texto: "Só o gato dela te vê.", voz: 4 },
  { de: 17.0, ate: 18.9, texto: "Pensa num lugar...", voz: 5 },
  { de: 19.8, ate: 22.7, texto: "...e você está lá.", voz: 6 },
  { de: 23.6, ate: 27.0, texto: "Ninguém consegue te ver.", voz: 7 },
  { de: 27.6, ate: 31.3, texto: "O arquivo secreto do Vaticano.", voz: 8 },
  { de: 31.7, ate: 34.4, texto: "Nenhuma porta fica trancada pra você.", voz: 9 },
  { de: 38.7, ate: 41.2, texto: "Dentro da Grande Pirâmide.", voz: 10 },
  { de: 44.0, ate: 45.6, texto: "O Salão Oval.", voz: 11 },
  { de: 46.0, ate: 48.5, texto: "Ninguém percebe você.", voz: 12 },
  { de: 50.4, ate: 53.2, texto: "Área 51.", voz: 13 },
  { de: 53.9, ate: 56.5, texto: "Agora você sabe o que tem lá dentro.", voz: 14 },
  { de: 56.8, ate: 58.6, texto: "Mais alto.", voz: 15 },
  { de: 63.4, ate: 65.8, texto: "A Terra inteira, lá embaixo.", voz: 16 },
  { de: 65.95, ate: 67.5, texto: "Aí você pensa no seu corpo.", voz: 17 },
  { de: 68.0, ate: 71.0, texto: "E você acorda.", voz: 18 },
];

// Pergunta grande (abre e fecha o vídeo) e a chamada amarela do fim
export const TITULO = [
  { de: 0, ate: 3.45 },
  { de: 71.4, ate: FIM_HISTORIA + 0.25 },
];
export const CTA = { de: 72.45, ate: FIM_HISTORIA + 0.25, texto: "Você tentaria hoje à noite?", voz: 19 };

// HUD do canto (sem anel, igual ao original): lugar, hora e linha de baixo
export type Hud = { de: number; ate: number; lugar: string; hora: string; linha?: string };
export const HUDS: Hud[] = [
  { de: 3.85, ate: 10.62, lugar: "CASA", hora: "03:30" },
  { de: 10.62, ate: 18.9, lugar: "VIZINHO", hora: "03:30" },
  { de: 18.9, ate: 27.1, lugar: "BARCELONA", hora: "15:30", linha: "ESPANHA" },
  { de: 27.1, ate: 34.08, lugar: "CIDADE DO VATICANO", hora: "15:30", linha: "ROMA" },
  { de: 34.08, ate: 41.1, lugar: "GIZÉ", hora: "17:30", linha: "EGITO" },
  { de: 41.1, ate: 48.55, lugar: "WASHINGTON, D.C.", hora: "10:30", linha: "EUA" },
  { de: 48.55, ate: 59.5, lugar: "ÁREA 51", hora: "07:30", linha: "NEVADA, EUA" },
  { de: 59.5, ate: 66.4, lugar: "ESPAÇO", hora: "14:30", linha: "UTC" },
  { de: 66.4, ate: 71.3, lugar: "CASA", hora: "03:31" },
];

// Altitude no espaço (km), como o contador do original (430 → 14.600)
const ALT: [number, number][] = [
  [59.5, 410],
  [61, 580],
  [62, 800],
  [63, 5600],
  [64, 14000],
  [66.4, 14700],
];
export const altitudeKm = (s: number) => {
  if (s <= ALT[0][0]) return ALT[0][1];
  for (let i = 0; i < ALT.length - 1; i++) {
    const [a, va] = ALT[i];
    const [b, vb] = ALT[i + 1];
    if (s <= b) return va + (vb - va) * ((s - a) / (b - a));
  }
  return ALT[ALT.length - 1][1];
};
export const horaEspaco = (s: number) => (s < 63.7 ? "14:30" : "14:31");
