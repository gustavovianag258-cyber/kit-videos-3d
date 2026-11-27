// "E se você acordasse amanhã e não pudesse mais morrer?" — linha do tempo.
// Tudo em segundos REAIS do vídeo, presos às palavras da narração aprovada (opção B, vozes.json):
// a faixa de vozes já vem montada (narrador + Ícaro + alien) em public/imortal/vozes.wav.

// @ do perfil para o cartaz final ("" = não mostra)
export const ARROBA = "";

export const FPS = 30;
export const DURACAO = 103;
export const DURACAO_FRAMES = DURACAO * FPS;
export const seg = (s: number) => Math.round(s * FPS);
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export type Vec3 = [number, number, number];

// ---------- Planos (um corte a cada 1–2 s) ----------
// "tr" = transição de entrada: whip (chicote), flash, glitch, zoom ou seco
export type Transicao = "whip" | "flash" | "glitch" | "zoom" | "seco";
export const PLANOS = [
  // 1. Quarto no Recife, segunda 7h
  { id: "quartoAcorda", de: 0, tr: "seco" },
  { id: "quartoEspreguica", de: 2.3, tr: "whip" },
  // 2. Os testes
  { id: "desconfiado", de: 4.6, tr: "zoom" },
  { id: "normal", de: 6.45, tr: "whip" },
  { id: "praia", de: 7.55, tr: "whip" },
  { id: "tubaroes", de: 9.15, tr: "zoom" },
  { id: "predio", de: 10.45, tr: "whip" },
  { id: "aviao", de: 12.15, tr: "whip" },
  { id: "queda", de: 13.25, tr: "zoom" },
  { id: "cratera", de: 14.75, tr: "flash" },
  { id: "levanta", de: 17.0, tr: "whip" },
  { id: "dePe", de: 19.2, tr: "zoom" },
  { id: "risoFraco", de: 20.65, tr: "whip" },
  { id: "joinha", de: 22.55, tr: "whip" },
  // 3. Dez anos depois
  { id: "almoco", de: 24.8, tr: "flash" },
  { id: "casamento", de: 27.78, tr: "whip" },
  { id: "bebe", de: 28.58, tr: "whip" },
  { id: "filhoGrande", de: 29.78, tr: "whip" },
  // 4. As famílias
  { id: "filhoVelho", de: 31.6, tr: "zoom" },
  { id: "velorio", de: 33.45, tr: "seco" },
  { id: "novaFamilia", de: 35.0, tr: "whip" },
  { id: "retratos", de: 36.3, tr: "whip" },
  { id: "bolo1", de: 38.7, tr: "zoom" },
  { id: "bolo2", de: 39.55, tr: "whip" },
  { id: "bolo3", de: 40.3, tr: "whip" },
  { id: "cansado", de: 41.15, tr: "whip" },
  // 5. Alienígenas
  { id: "futuro", de: 43.25, tr: "glitch" },
  { id: "disco", de: 44.68, tr: "whip" },
  { id: "invasao", de: 45.95, tr: "glitch" },
  { id: "laser", de: 47.13, tr: "zoom" },
  { id: "nada", de: 48.55, tr: "flash" },
  { id: "alien", de: 49.6, tr: "whip" },
  { id: "parceiro", de: 51.6, tr: "whip" },
  { id: "alienEIcaro", de: 53.55, tr: "whip" },
  // 6. O fim da Terra
  { id: "cidadeVazia", de: 55.7, tr: "glitch" },
  { id: "soVoce", de: 58.0, tr: "zoom" },
  { id: "oceanos", de: 58.95, tr: "whip" },
  { id: "sol", de: 61.72, tr: "zoom" },
  { id: "terraAcaba", de: 63.58, tr: "whip" },
  { id: "voceNao", de: 65.05, tr: "flash" },
  // 7. Espaço, silêncio
  { id: "espacoLonge", de: 66.35, tr: "seco" },
  { id: "espacoRosto", de: 68.25, tr: "seco" },
  { id: "estrelas", de: 70.05, tr: "zoom" },
  { id: "ultimaEstrela", de: 72.0, tr: "seco" },
  // 8. O infinito
  { id: "escuro", de: 75.15, tr: "seco" },
  { id: "dedos", de: 76.5, tr: "whip" },
  { id: "xadrez", de: 78.85, tr: "zoom" },
  { id: "xadrezOutroLado", de: 81.0, tr: "whip" },
  { id: "infinito", de: 82.2, tr: "zoom" },
  { id: "infinitoLonge", de: 84.6, tr: "seco" },
  // 9. Volta ao real (corte seco)
  { id: "acordaDeNovo", de: 86.45, tr: "seco" },
  { id: "sorri", de: 90.28, tr: "whip" },
  { id: "ligaMae", de: 91.35, tr: "whip" },
  // 10. Chamada
  { id: "terraCalma", de: 94.4, tr: "zoom" },
] as const satisfies readonly { id: string; de: number; tr: Transicao }[];

export type IdPlano = (typeof PLANOS)[number]["id"];

export const planoEm = (s: number) => {
  let i = 0;
  while (i + 1 < PLANOS.length && PLANOS[i + 1].de <= s) i++;
  const ate = i + 1 < PLANOS.length ? PLANOS[i + 1].de : DURACAO;
  return { ...PLANOS[i], ate, t: s - PLANOS[i].de, dur: ate - PLANOS[i].de };
};
export const inicioDe = (id: IdPlano) => PLANOS.find((p) => p.id === id)!.de;

// ---------- Momentos-chave (segundos) ----------
export const MARCOS = {
  despertador: 0.1,
  splash: 9.2,
  mordida: 9.85,
  pulo: 13.3,
  impacto: 14.75,
  aiDor: 15.4,
  ri: 22.3,
  sinoCasamento: 27.85,
  velorio: 33.45,
  sopra: [39.1, 39.9, 40.65],
  disco: 44.75,
  raios: 46.05,
  disparo: 47.4,
  bateLaser: 48.15,
  sol: 61.75,
  terraAcaba: 64.3,
  silencio: 66.05,
  estrelaApaga: [70.6, 71.3, 71.9, 72.6, 73.3, 73.75],
  ultima: 74.2,
  pecas: [79.15, 79.85, 80.6, 81.4],
  infinito: 82.9,
  despertador2: 86.5,
  ligar: 92.6,
  cartaz: 94.4,
};

// ---------- Legendas (curtas; resumem a narração) ----------
export const LEGENDAS: { de: number; ate: number; texto: string; cor?: "alien" }[] = [
  { de: 17.55, ate: 20.62, texto: "**DOEU.** MAS NÃO MORREU." },
  { de: 25.04, ate: 27.76, texto: "10 ANOS DEPOIS: **AINDA 31.**" },
  { de: 36.3, ate: 38.7, texto: "**3** FAMÍLIAS" },
  { de: 38.8, ate: 41.15, texto: "**400** ANIVERSÁRIOS" },
  { de: 44.7, ate: 48.55, texto: "ALIENS vs **IMORTAL**" },
  { de: 49.66, ate: 51.55, texto: "POR QUE ELE **NÃO MORRE?**", cor: "alien" },
  { de: 57.15, ate: 58.95, texto: "SÓ SOBROU **VOCÊ.**" },
  { de: 72.05, ate: 75.1, texto: "AS ÚLTIMAS **ESTRELAS** SE APAGAM" },
  { de: 79.0, ate: 82.2, texto: "JÁ GANHOU **DE SI MESMO.**" },
  { de: 88.9, ate: 91.32, texto: "RECORDE REAL: **122 ANOS**" },
  { de: 94.76, ate: 96.6, texto: "QUAL SERÁ O **PRÓXIMO** “E SE”?" },
  { de: 96.6, ate: 99.4, texto: "DEIXA NOS **COMENTÁRIOS**" },
];

// ---------- HUD do canto: a história contada em anos ----------
// valor pode ser fixo ou contar de um número a outro entre "de" e "conta"
export type EstadoHud = {
  de: number;
  ate: number;
  rotulo: string;
  valor: string | { de: number; para: number; ate: number };
  rodape?: string;
  alerta?: boolean;
};
export const HUDS: EstadoHud[] = [
  { de: 0.4, ate: 4.6, rotulo: "ANOS IMORTAL", valor: "0", rodape: "SEG 07:00 · IDADE 31" },
  { de: 4.6, ate: 13.25, rotulo: "ANOS IMORTAL", valor: "0", rodape: "ÍCARO · IDADE 31" },
  { de: 13.25, ate: 14.75, rotulo: "QUEDA LIVRE", valor: "200 km/h", rodape: "SEM PARAQUEDAS", alerta: true },
  { de: 14.75, ate: 24.8, rotulo: "ANOS IMORTAL", valor: "0", rodape: "ÍCARO · IDADE 31" },
  { de: 24.8, ate: 31.6, rotulo: "ANOS IMORTAL", valor: "10", rodape: "IDADE: AINDA 31" },
  { de: 31.6, ate: 33.45, rotulo: "ANOS IMORTAL", valor: "40", rodape: "IDADE: AINDA 31" },
  { de: 33.45, ate: 35.0, rotulo: "ANOS IMORTAL", valor: "80", rodape: "IDADE: AINDA 31" },
  { de: 35.0, ate: 38.7, rotulo: "ANOS IMORTAL", valor: "150", rodape: "IDADE: AINDA 31" },
  { de: 38.7, ate: 43.25, rotulo: "ANOS IMORTAL", valor: { de: 150, para: 400, ate: 41.1 }, rodape: "IDADE: AINDA 31" },
  { de: 43.25, ate: 58.95, rotulo: "ANOS IMORTAL", valor: { de: 400, para: 3000, ate: 44.6 }, rodape: "IDADE: AINDA 31" },
  { de: 58.95, ate: 61.72, rotulo: "ANOS IMORTAL", valor: "1 BILHÃO", rodape: "OCEANOS EVAPORAM", alerta: true },
  { de: 61.72, ate: 70.05, rotulo: "ANOS IMORTAL", valor: "5 BILHÕES", rodape: "O SOL INCHA", alerta: true },
  { de: 70.05, ate: 82.2, rotulo: "ANOS IMORTAL", valor: "100 TRI", rodape: "≈ ESTIMATIVA" },
  { de: 82.2, ate: 86.45, rotulo: "ANOS IMORTAL", valor: "∞", rodape: "ÍCARO · IDADE 31" },
];

// Selos amarelos inclinados
export const SELOS: { de: number; ate: number; texto: string; topo: number }[] = [
  { de: 9.25, ate: 10.45, texto: "TESTE 1", topo: 330 },
  { de: 10.52, ate: 12.15, texto: "TESTE 2", topo: 1250 },
  { de: 13.3, ate: 14.75, texto: "TESTE 3", topo: 520 },
  { de: 77.75, ate: 78.85, texto: "1.000.000", topo: 520 },
];

// Etiquetas (pílulas pretas com borda branca)
export const ETIQUETAS: { de: number; ate: number; texto: string; topo: number }[] = [
  { de: 2.45, ate: 4.55, texto: "ÍCARO · RECIFE", topo: 1480 },
  { de: 7.65, ate: 10.4, texto: "PRAIA DE BOA VIAGEM", topo: 1480 },
  { de: 10.55, ate: 12.1, texto: "30 ANDARES", topo: 1480 },
  { de: 33.55, ate: 34.95, texto: "CÂMERA LENTA", topo: 1480 },
  { de: 43.35, ate: 44.65, texto: "RECIFE · ANO 3026", topo: 1480 },
  { de: 61.85, ate: 63.55, texto: "SOL: GIGANTE VERMELHA", topo: 1480 },
  { de: 89.0, ate: 91.3, texto: "JEANNE CALMENT · 1875–1997", topo: 1480 },
];

// Avisos fixos no canto superior direito
export const AVISOS: { de: number; ate: number; texto: string }[] = [
  { de: 43.25, ate: 55.7, texto: "ILUSTRAÇÃO · NÃO É CIÊNCIA" },
  { de: 58.95, ate: 65.05, texto: "ESTIMATIVA CIENTÍFICA" },
  { de: 65.05, ate: 86.45, texto: "FICÇÃO · NINGUÉM SOBREVIVE NO VÁCUO" },
];

// Cor que acompanha a escalada (tinta por cima de tudo)
export const TINTAS: { de: number; ate: number; cor: string; forca: number }[] = [
  { de: 24.8, ate: 31.6, cor: "#ffb547", forca: 0.12 }, // dourado de família
  { de: 31.6, ate: 43.25, cor: "#5a7bd6", forca: 0.12 }, // azul frio (séculos)
  { de: 43.25, ate: 55.7, cor: "#3fb6ff", forca: 0.08 },
  { de: 58.95, ate: 66.35, cor: "#ff3a1a", forca: 0.14 }, // vermelho (fim da Terra)
];
