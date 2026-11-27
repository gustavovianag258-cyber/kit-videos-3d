// "E se a Terra parasse de girar, de repente, na praia de Copacabana?"
// Linha do tempo em segundos REAIS, presa às palavras da narração aprovada
// (public/terra-para/narracao.mp3 — ver narracao-palavras.json).

export const FPS = 30;

// Marcos-chave (segundos), tirados da transcrição por palavra
export const T = {
  inicio: 0,
  regra: 2.32, // "Ela gira a mil e seiscentos..."
  transicao: 8.86, // "Mas hoje, só o chão vai parar."
  contagem3: 11.36,
  contagem2: 12.16,
  contagem1: 12.96,
  parou: 14.44, // GATILHO
  cafeAndou: 15.2, // "O café continuou andando."
  vocêNao: 17.4, // "Você, não."
  entorno: 17.97, // "E não só o café..."
  inercia: 25.68, // "Mil e seiscentos quilômetros por hora."
  leste: 28.08, // "Pra leste."
  valePraAr: 28.92, // "Isso vale pro ar também."
  vento: 30.58, // "O vento que você sente agora..."
  oceano: 34.37, // "E o oceano é grande demais..."
  eleVem: 37.76, // "Ele vem."
  real: 38.5, // "Na vida real..."
  lenta: 42.0, // "...ficando mais lenta..."
  anos: 45.4, // "...cem anos."
  relaxa: 46.3, // "Relaxa."
  cafeSeguro: 47.2, // "Seu café tá seguro."
  cta: 48.5, // "O próximo 'E se'..."
  fimNarracao: 52.16,
} as const;

export const DURACAO_SEGUNDOS = 58; // narração (52,16s) + cartaz final
export const DURACAO_FRAMES = Math.round(DURACAO_SEGUNDOS * FPS);

export const seg = (s: number) => Math.round(s * FPS);
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Fases da cena (pra escolher câmera e o que anima)
export type Fase = "normal" | "gatilho" | "pessoal" | "entorno" | "vento" | "oceano" | "espaco" | "piada" | "cta";
export const faseEm = (s: number): Fase => {
  if (s < T.parou) return "normal";
  if (s < T.cafeAndou + 0.3) return "gatilho";
  if (s < T.entorno) return "pessoal";
  if (s < T.vento) return "entorno";
  if (s < T.oceano) return "vento";
  if (s < T.real) return "oceano";
  if (s < T.relaxa) return "espaco";
  if (s < T.cta) return "piada";
  return "cta";
};

// Legendas curtas (serifa, terço inferior); * marca a palavra-chave em itálico
export type Legenda = { de: number; ate: number; texto: string };
export const LEGENDAS: Legenda[] = [
  { de: T.regra, ate: T.transicao, texto: "*1.600 km/h* — e você gira junto" },
  { de: T.transicao, ate: T.parou, texto: "só o chão vai parar" },
  { de: T.cafeAndou, ate: T.vocêNao + 0.6, texto: "o café continuou. você, *não*" },
  { de: T.entorno, ate: T.leste + 0.6, texto: "tudo que não tá *preso* segue" },
  { de: T.vento, ate: T.oceano, texto: "o vento é o ar que *não parou*" },
  { de: T.oceano, ate: T.real, texto: "o oceano *vem*" },
  { de: T.real, ate: T.relaxa, texto: "na real: *2 ms* a cada 100 anos" },
  { de: T.relaxa, ate: T.cta, texto: "seu café tá *seguro*" },
];

// HUD do canto
export const hudRotulo = (s: number) => (s < T.parou ? "VELOCIDADE DA TERRA" : "DESDE A PARADA");
export const hudValor = (s: number) => (s < T.parou ? "1.600" : (s - T.parou).toFixed(1));
export const hudLinha = (s: number) => (s < T.parou ? "COPACABANA" : "SEGUNDOS");
