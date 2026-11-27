import { Easing } from "remotion";

// Linha do tempo de "E se a gravidade caísse pela metade?" (teste).
//
// Há DOIS relógios:
//  • tempo REAL do vídeo — o que toca na tela, amarrado à narração do ElevenLabs;
//  • tempo-GUIA — a linha estimada em que as cenas foram animadas (CENAS, MARCOS e as
//    chaves de câmera usam ele). MAPA_TEMPO converte um no outro, então para ajustar o
//    ritmo basta mexer nos pares abaixo; as animações se adaptam sozinhas.

export const FPS = 30;
export const DURACAO_SEGUNDOS = 90; // duração da linha-guia
export const DURACAO_REAL = 95.85; // duração do vídeo final
export const DURACAO_FRAMES = Math.round(DURACAO_REAL * FPS);

export const TEM_NARRACAO = true;

// [tempo real, tempo-guia]. Cada par prende um momento da animação a uma palavra da narração.
const MAPA_TEMPO: [number, number][] = [
  [0, 0], // "E se a gravidade da Terra caísse pela metade? Vamos começar pela Avenida Paulista."
  [5.5, 4.3], // "Meio-dia em ponto" → relógio 12:00
  [7.72, 7.4], // "e caiu." → HUD 4,9
  [8.54, 8.5],
  [9.74, 9.6], // "seu pé no chão"
  [10.64, 11.0], // "o ar em volta da Terra"
  [12.14, 12.8], // "e a Terra em volta do Sol"
  [13.4, 14.5],
  [13.85, 15.0], // pulo + "Opa!" (respiro sem narração)
  [17.7, 17.81], // "Pulo? O dobro!" → topo do pulo em primeira pessoa
  [19.66, 19.0], // "O celular cai…"
  [24.58, 24.0],
  [24.98, 25.0], // o carro começa a frear (respiro, "Sai da frente!")
  [35.2, 33.0],
  [40.95, 34.0], // "Metade da gravidade? Ar ralo." → a camada de ar estufa
  [43.55, 38.5],
  [43.8, 39.5], // "Cadê o ar…?" (respiro)
  [48.85, 44.0], // "E a água ferve a 80 graus"
  [52.75, 47.0], // "E ar que se expande, esfria"
  [56.45, 50.0],
  [59.4, 53.0], // "Lá em cima, a Lua…"
  [60.75, 54.9],
  [62.02, 56.7],
  [63.45, 58.5], // "E a Terra em volta do Sol?"
  [66.5, 63.2], // "A Terra sai pela tangente"
  [68.85, 65.5], // "Em cinco meses…" → Paulista congelada
  [73.45, 67.6], // "Em um ano e meio…"
  [77.1, 70.0], // "Relaxa"
  [81.25, 72.5], // "mira laser neles"
  [87.05, 80.0], // "Ou seja…" → balança
  [90.75, 86.0], // "Qual vai ser o próximo E se?" → cartaz
  [95.85, 90.0],
];

// Inverso de paraGuia: em que segundo REAL acontece um momento da linha-guia (usado pelos sons)
export const paraReal = (guia: number) => {
  for (let i = 0; i < MAPA_TEMPO.length - 1; i++) {
    const [r0, g0] = MAPA_TEMPO[i];
    const [r1, g1] = MAPA_TEMPO[i + 1];
    if (guia < g1) return r0 + ((Math.max(guia, g0) - g0) / (g1 - g0)) * (r1 - r0);
  }
  return MAPA_TEMPO[MAPA_TEMPO.length - 1][0];
};

export const paraGuia = (real: number) => {
  for (let i = 0; i < MAPA_TEMPO.length - 1; i++) {
    const [r0, g0] = MAPA_TEMPO[i];
    const [r1, g1] = MAPA_TEMPO[i + 1];
    if (real < r1) return g0 + ((Math.max(real, r0) - r0) / (r1 - r0)) * (g1 - g0);
  }
  return MAPA_TEMPO[MAPA_TEMPO.length - 1][1];
};

// A narração (public/gravidade/narracao.mp3) entra em 6 trechos, com respiros de ação entre eles.
// de/ate = segundos no arquivo; em = segundo REAL do vídeo em que o trecho começa.
export const TRECHOS_NARRACAO = [
  // Abertura regravada (mesma voz) até "e caiu."; o take aprovado segue de "A gravidade segura…",
  // no mesmo segundo de antes. A abertura nova saiu ~1 dB mais baixa que o take, daí o ganho.
  { de: 0, ate: 8.0, em: 0.22, arquivo: "abertura", vol: 1.13 },
  { de: 8.45, ate: 13.775, em: 8.39 },
  { de: 13.775, ate: 23.805, em: 14.55 },
  { de: 23.805, ate: 32.105, em: 26.9 },
  { de: 32.105, ate: 40.225, em: 35.43 },
  { de: 40.225, ate: 71.28, em: 45.2 },
  { de: 71.28, ate: 88.64, em: 77.15 },
];

export const CENAS = {
  gancho: { inicio: 0, fim: 8.5 },
  promessa: { inicio: 8.5, fim: 14.5 },
  corpo: { inicio: 14.5, fim: 24 },
  pneus: { inicio: 24, fim: 33 },
  ar: { inicio: 33, fim: 47 },
  frio: { inicio: 47, fim: 53 },
  lua: { inicio: 53, fim: 58.5 },
  terra: { inicio: 58.5, fim: 70 },
  real: { inicio: 70, fim: 80 },
  final: { inicio: 80, fim: DURACAO_SEGUNDOS },
} as const;

export type NomeCena = keyof typeof CENAS;

// Momentos-chave (segundos ABSOLUTOS)
// Momentos-chave na linha-GUIA
export const MARCOS = {
  meioDia: 4.3, // "Meio-dia em ponto" → relógio 12:00:00
  quedaGravidade: 7.4, // "e caiu." → HUD 9,8 → 4,9
  promessaPe: 9.6, // "seu pé no chão"
  promessaAr: 11.0, // "o ar em volta da Terra"
  promessaTerra: 12.8, // "e a Terra em volta do Sol"
  pulo: 15.0, // Bia desce do meio-fio e voa ("Opa!")
  celularCai: 19.0, // o celular escorrega
  freada: 25.0, // o carro começa a frear
  diagramaAr: 34.0, // camada de ar inchando
  cadeOAr: 39.5, // Bia: "Cadê o ar…?"
  terraSolta: 63.2, // "A Terra sai pela tangente"
  paulistaCongelada: 65.5, // corte para a Paulista congelada
  laser: 72.5, // o laser bate no espelho
  balanca: 80.5, // Bia na balança
  cartaz: 86.0, // cartaz final
} as const;

// HUD do canto: o rótulo de baixo muda conforme a história avança
export type EstadoHud = { inicio: number; local: string; relogio: string };
export const HUD: EstadoHud[] = [
  { inicio: 0, local: "AV. PAULISTA", relogio: "11:59:5{s}" }, // {s} conta até o meio-dia
  { inicio: MARCOS.meioDia, local: "AV. PAULISTA", relogio: "12:00" },
  { inicio: CENAS.pneus.inicio, local: "AV. PAULISTA", relogio: "12:01" },
  { inicio: CENAS.ar.inicio, local: "AV. PAULISTA", relogio: "12:10" },
  { inicio: CENAS.frio.inicio, local: "AV. PAULISTA", relogio: "12:30" },
  { inicio: CENAS.lua.inicio, local: "DESDE O MEIO-DIA", relogio: "3 dias" },
  { inicio: CENAS.terra.inicio, local: "DESDE O MEIO-DIA", relogio: "5 meses" },
  { inicio: 67.6, local: "DESDE O MEIO-DIA", relogio: "1 ano e meio" },
  // Volta ao real: a gravidade volta a 9,8 no HUD
  { inicio: CENAS.real.inicio, local: "NO MUNDO REAL", relogio: "hoje" },
];
export const FIM_HUD = MARCOS.cartaz;

// Legendas curtas, em tempo REAL (presas às palavras da narração; ** = negrito)
export type Legenda = { inicio: number; fim: number; texto: string };
export const LEGENDAS: Legenda[] = [
  { inicio: 14.58, fim: 16.85, texto: "metade da gravidade = **metade do peso**" },
  { inicio: 16.91, fim: 18.95, texto: "pulo = **o dobro**" },
  { inicio: 19.02, fim: 21.85, texto: "celular cai **devagar**" },
  { inicio: 27.08, fim: 32.0, texto: "metade do peso = **dobro pra frear**" },
  { inicio: 32.12, fim: 35.15, texto: "hora certa, **lugar errado**" },
  { inicio: 37.41, fim: 41.25, texto: "o ar também **pesa**" },
  { inicio: 45.3, fim: 48.8, texto: "Paulista a **5.500 m de altitude**" },
  { inicio: 48.87, fim: 52.8, texto: "água ferve a **80 °C**" },
  { inicio: 52.9, fim: 59.35, texto: "ar expandindo = **ar gelando**" },
  { inicio: 60.31, fim: 63.45, texto: "Lua **indo embora**" },
  { inicio: 64.97, fim: 68.85, texto: "Terra × Sol: **soltou**" },
  { inicio: 68.92, fim: 73.4, texto: "2× mais longe = **¼ da luz**" },
  { inicio: 73.46, fim: 76.25, texto: "1,5 ano: **quase em Júpiter**" },
  { inicio: 78.72, fim: 83.55, texto: "espelho na Lua **desde 1969**" },
  { inicio: 83.6, fim: 86.4, texto: "gravidade: **firme**" },
];

// Reações curtas dos personagens, em tempo REAL (arquivos em public/gravidade/<id>.wav)
export const REACOES = [
  { id: "bia-opa", inicio: 13.85, texto: "Opa!" },
  { id: "pedestre-sai", inicio: 25.55, texto: "Sai da frente!" },
  { id: "bia-ar", inicio: 43.8, texto: "Cadê o ar…?" },
] as const;

export const BIA = {
  pele: "#a86b3c",
  nariz: "#95592f",
  cabelo: "#1e130c",
  camisa: "#f4d35e",
  calca: "#33415c",
  tenis: "#ffffff",
  cabeloLongo: true,
};

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
