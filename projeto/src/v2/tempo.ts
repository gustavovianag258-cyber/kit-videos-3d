import { Easing } from "remotion";
import narracaoGuia from "./narracao-guia.json";

// Linha do tempo do vídeo "E se a Terra fosse plana?".
// Todos os tempos em SEGUNDOS. Para ajustar ao áudio definitivo, mude os números aqui
// (e em src/legendas.ts / src/v2/correcoes.ts); as cenas se adaptam sozinhas.

export const FPS = 30;
export const DURACAO_SEGUNDOS = 58.6;
export const DURACAO_FRAMES = Math.round(DURACAO_SEGUNDOS * FPS);

// Arquivo de narração tocado no vídeo (narracao-final.mp3 = ElevenLabs; narracao-guia.mp3 = voz-guia)
export const ARQUIVO_NARRACAO = "narracao-final.mp3";

export const CENAS = {
  descoberta: { inicio: 0, fim: 6.4 },
  espaco: { inicio: 6.4, fim: 12.9 },
  gravidade: { inicio: 12.9, fim: 25.9 },
  oceano: { inicio: 25.9, fim: 37.4 },
  atmosfera: { inicio: 37.4, fim: 50.4 },
  conclusao: { inicio: 50.4, fim: DURACAO_SEGUNDOS },
} as const;

// Momentos-chave dentro das cenas (segundos ABSOLUTOS no vídeo)
export const MARCOS = {
  revelacaoJanela: 3.6, // "você abre a janela e dá de cara com isso"
  cidadeFlutua: 14.0, // a cidade vira o cenário hipotético
  congelaCidade: 16.0, // congela e entra o 1º X
  diagramaGravidade: 17.6, // setas de gravidade
  bordaRevelada: 28.2, // a câmera sobe e mostra a cachoeira
  congelaOceano: 29.6, // câmera lenta até parar + 2º X
  diagramaAgua: 31.1, // água em equilíbrio no disco
  satelite: 43.2, // corte para o satélite
  xOrbita: 45.2, // 3º X
  trajetoria: 46.4, // trajetória calculada
  recapitulacao: 51.6, // câmera sai da estação e relembra os temas
} as const;

export const seg = (s: number) => Math.round(s * FPS);
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const ease = Easing.inOut(Easing.cubic);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export type Vec3 = [number, number, number];
export const lerp3 = (a: Vec3, b: Vec3, t: number): Vec3 => [
  lerp(a[0], b[0], t),
  lerp(a[1], b[1], t),
  lerp(a[2], b[2], t),
];

// Abertura da boca (0 a 1) a partir do volume da narração neste frame
export const aberturaBoca = (frameGlobal: number) => {
  const v = narracaoGuia.volume[Math.round(frameGlobal)] ?? 0;
  return Math.min(1, Math.max(0, (v - 0.08) / 0.5));
};

// Quanto a narração está falando por perto deste frame (0 a 1), para abaixar a música.
// Olha um pouco antes e depois para a música não "bombear" entre as palavras.
export const vozPorPerto = (frameGlobal: number) => {
  let maior = 0;
  for (let f = frameGlobal - 8; f <= frameGlobal + 4; f++) maior = Math.max(maior, narracaoGuia.volume[f] ?? 0);
  return Math.min(1, maior / 0.12);
};
