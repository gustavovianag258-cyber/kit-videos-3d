import palavrasAntigas from "./narracao-palavras.json";
import palavrasFinal from "./final-palavras.json";
import palavrasGancho from "./gancho-palavras.json";

// Tudo do vídeo preso nos tempos da voz (segundos). A narração dura 114,24 s; o cartaz entra logo depois.
export const FPS = 30;
export const FIM_VOZ = 114.4;
export const DURACAO = 117.77;
const INICIO_FINAL = 111.45;

// O gancho entrou antes de tudo e um trecho saiu do meio. O resto do arquivo segue nos tempos da narração
// original ("tempo virtual"): o gancho fica em tempos negativos, e o que foi cortado nunca aparece.
export const GANCHO = 13.03;
const INI = 6.0;
const FIM_1 = 12.24;
const INI_2 = 15.96;
export const virtual = (t: number) => {
  if (t < GANCHO) return t - GANCHO;
  const x = t - GANCHO;
  return x < FIM_1 - INI ? INI + x : INI_2 + (x - (FIM_1 - INI));
};
// devolve o tempo real; null quando aquele momento foi cortado
export const real = (v: number): number | null => {
  if (v < 0) return v + GANCHO;
  if (v < INI) return null;
  if (v < FIM_1) return v - INI + GANCHO;
  if (v < INI_2) return null;
  return v - INI_2 + (FIM_1 - INI) + GANCHO;
};
const palavras = [...palavrasGancho.map((p) => ({ ...p, s: p.s - GANCHO, e: p.e - GANCHO })), ...palavrasAntigas.filter((p) => p.s < 111.2), ...palavrasFinal.map((p) => ({ ...p, s: p.s + INICIO_FINAL, e: p.e + INICIO_FINAL }))];

export type Mundo = "casa" | "globo" | "escala" | "brasil" | "corte" | "terreno" | "cisterna" | "mesa" | "celular" | "bairro" | "alagada";
export type PoseNome = "neutro" | "abre" | "apontaE" | "apontaD" | "ombros" | "cima" | "explica" | "baixo";
export type Plano = {
  de: number;
  ate: number;
  mundo: Mundo;
  pos: [[number, number, number], [number, number, number]]; // câmera do começo e do fim do plano
  alvo: [[number, number, number], [number, number, number]];
  fov?: number;
  foco?: number;
  desfoque?: number;
  pose?: PoseNome;
  olhar?: number;
  estado?: string; // detalhe do mundo neste plano
  treme?: number; // tremor da câmera nos impactos
  anda?: { de: [number, number, number]; ate: [number, number, number]; t0: number; t1: number; giro?: number };
};

const parado = (p: [number, number, number]): [[number, number, number], [number, number, number]] => [p, p];
const CASA_CAM: [number, number, number] = [0.42, 2.1, 17];
const CASA_ALVO: [number, number, number] = [0.03, 3.25, 0];
export const CASA_ELE: [number, number, number] = [0, 0, 7.4];

export const PLANOS: Plano[] = [
  // GANCHO: a pergunta, em tempo virtual (negativo)
  { de: -13.03, ate: -11.4, mundo: "casa", pos: [[0.42, 8.5, 26], [0.42, 2.3, 17.4]], alvo: [[0.03, 6, 0], CASA_ALVO], pose: "abre", treme: 0.05 },
  { de: -11.4, ate: -9.95, mundo: "globo", pos: [[0.02, -0.02, 4.4], [0.02, -0.02, 2.7]], alvo: parado([0, 0, 0]), fov: 34, foco: 3, desfoque: 0, estado: "calor" },
  { de: -9.95, ate: -8.72, mundo: "casa", pos: [[0.18, 1.62, 10.6], [0.1, 1.56, 9.8]], alvo: parado([0, 1.52, 7.4]), foco: 2.6, desfoque: 5, pose: "explica", treme: 0.012 },
  { de: -8.72, ate: -7.95, mundo: "brasil", pos: [[1.5, 3.2, 6.8], [1.3, 2.9, 6]], alvo: parado([0.75, 0.1, 2.3]), fov: 40, foco: 4, desfoque: 1, estado: "chuva" },
  { de: -7.95, ate: -7.1, mundo: "brasil", pos: [[-0.8, 7.4, 3.6], [-0.5, 6.8, 3]], alvo: parado([-0.25, 0.1, -1.1]), fov: 40, foco: 8, desfoque: 0.5, estado: "seco" },
  { de: -7.1, ate: -5.15, mundo: "casa", pos: [[-4.2, 1.5, 10.8], [-3, 1.5, 8.9]], alvo: parado([-1.4, 1.5, 0]), foco: 9, desfoque: 2, estado: "enchente", treme: 0.02 },
  { de: -5.15, ate: -3.72, mundo: "casa", pos: [[3.5, 1.25, 12.6], [2.7, 1.35, 11.4]], alvo: parado([1.5, 0.5, 5]), foco: 6, desfoque: 2, estado: "seca" },
  { de: -3.72, ate: -1.45, mundo: "casa", pos: [[0.3, 1.55, 12.5], [0.16, 1.55, 10.2]], alvo: parado([0, 1.45, 7.4]), foco: 3, desfoque: 4.5, pose: "explica", anda: { de: [0, 0, 5.4], ate: [0, 0, 7.4], t0: -3.72, t1: -2.6 } },
  { de: -1.45, ate: 0, mundo: "celular", pos: [[0, 0.1, 2.9], [0, 0.05, 2.45]], alvo: parado([0, 0, 0]), fov: 38, foco: 2.45, desfoque: 3 },
  // CENA 1: a casa partida
  { de: 0, ate: 2.78, mundo: "casa", pos: [[0.42, 5.4, 22], CASA_CAM], alvo: [[0.03, 4.6, 0], CASA_ALVO], pose: "abre" },
  { de: 2.78, ate: 4.9, mundo: "casa", pos: [[0.16, 1.62, 10.3], [0.1, 1.56, 9.6]], alvo: parado([0, 1.52, 7.4]), foco: 2.5, desfoque: 5, pose: "ombros" },
  // CENA 2: o mar
  { de: 4.9, ate: 6.1, mundo: "globo", pos: [[0.4, 0.1, 4.2], [0.2, 0.05, 3.6]], alvo: parado([0, 0.05, 0]), fov: 34, foco: 3, desfoque: 0, estado: "longe" },
  { de: 6.0, ate: 7.6, mundo: "globo", pos: [[0.35, 0.8, 2.9], [0.25, 0.85, 2.7]], alvo: parado([0, 0.78, 0]), fov: 34, foco: 2, desfoque: 0, estado: "ele", pose: "baixo" },
  { de: 7.6, ate: 9.6, mundo: "globo", pos: [[0.02, -0.02, 2.75], [0.02, -0.02, 2.45]], alvo: parado([0, 0, 0]), fov: 34, foco: 1, desfoque: 0, estado: "calor" },
  { de: 9.6, ate: 12.24, mundo: "globo", pos: [[-0.8, 0.15, 2.5], [-0.5, 0.1, 2.45]], alvo: parado([0, 0, 0]), fov: 34, foco: 1, desfoque: 0, estado: "calor" },
  { de: 12.24, ate: 14.2, mundo: "globo", pos: [[0.8, 0.3, 2.3], [0.5, 0.25, 2.8]], alvo: parado([0, 0.08, 0]), fov: 34, foco: 2, desfoque: 0, estado: "ele", pose: "apontaE" },
  { de: 14.2, ate: 15.96, mundo: "globo", pos: [[0, 0.35, 3], [0, 0.3, 4.6]], alvo: parado([0, 0.1, 0]), fov: 34, foco: 3, desfoque: 0, estado: "ele", pose: "abre" },
  { de: 15.96, ate: 18.34, mundo: "escala", pos: [[0, 2.5, 10.4], [0.1, 2.6, 9.8]], alvo: parado([0, 2.3, 0]), foco: 9.5, desfoque: 1.5, pose: "apontaD" },
  { de: 18.34, ate: 20.72, mundo: "escala", pos: [[-0.5, 1.1, 8.2], [-0.2, 1.2, 7.7]], alvo: parado([0, 1.55, 0]), foco: 7.5, desfoque: 1.5, pose: "ombros", estado: "mar" },
  // CENA 3: o Brasil partido
  { de: 20.72, ate: 23, mundo: "brasil", pos: [[0.7, 12.6, 11.2], [0.65, 11.9, 10.5]], alvo: parado([0.55, 0.2, 0.5]), fov: 40, foco: 16, desfoque: 0.5, estado: "neutro", pose: "abre" },
  { de: 23, ate: 25.72, mundo: "brasil", pos: [[1.6, 3.2, 6.4], [1.3, 2.8, 5.8]], alvo: parado([0.75, 0.1, 2.3]), fov: 40, foco: 4, desfoque: 1, estado: "chuva", pose: "apontaE" },
  { de: 25.72, ate: 28.68, mundo: "brasil", pos: [[-0.7, 7.2, 3.4], [-0.45, 6.7, 2.8]], alvo: parado([-0.25, 0.1, -1.1]), fov: 40, foco: 8, desfoque: 0.5, estado: "seco" },
  { de: 28.68, ate: 31.32, mundo: "brasil", pos: [[0.6, 13.4, 9.4], [0.65, 12.4, 11]], alvo: parado([0.55, 0.2, 0.5]), fov: 40, foco: 16, desfoque: 1, estado: "calor", pose: "abre" },
  { de: 31.32, ate: 33.6, mundo: "casa", pos: [CASA_CAM, [-0.2, 2.2, 15]], alvo: [CASA_ALVO, [-0.8, 2.6, 0]], pose: "explica" },
  // CENA 4: água demais
  { de: 33.6, ate: 35.72, mundo: "casa", pos: [[-3.4, 1.9, 13], [-3.2, 1.7, 11.5]], alvo: parado([-1.4, 2.3, 0]), foco: 11, desfoque: 2.4, pose: "apontaE" },
  { de: 35.72, ate: 37.68, mundo: "corte", pos: [[-0.4, 3.4, 12.5], [-0.2, 3.3, 11.8]], alvo: parado([-0.2, 3.1, 0]), estado: "vedar" },
  { de: 37.68, ate: 39.72, mundo: "corte", pos: [[-6.6, 2.1, 9.4], [-6, 1.8, 8.3]], alvo: parado([-3.4, 1.2, 0]), estado: "um" },
  { de: 39.72, ate: 41.3, mundo: "corte", pos: [[-5.4, 1.4, 6.8], [-5, 1.3, 6.1]], alvo: parado([-3.4, 1.1, 0]), estado: "um" },
  { de: 41.3, ate: 42.96, mundo: "corte", pos: [[-0.2, 1.2, 4.6], [-0.7, 1.1, 4]], alvo: parado([-2.9, 0.95, -0.4]), estado: "um" },
  { de: 42.96, ate: 44.6, mundo: "corte", pos: [[-5.6, 2, 7.4], [-5.2, 2, 7.1]], alvo: parado([-3.4, 1.6, 0]), estado: "dois" },
  { de: 44.6, ate: 46.3, mundo: "corte", pos: [[-4.5, 1.25, 3.9], [-4.3, 1.2, 3.5]], alvo: parado([-3, 1.25, 0.7]), estado: "dois", treme: 0.03 },
  { de: 46.3, ate: 47.4, mundo: "corte", pos: [[-3.9, 1, 4.2], [-3.6, 0.95, 3.8]], alvo: parado([-2.9, 0.65, 0.7]), estado: "entra" },
  { de: 47.4, ate: 49, mundo: "corte", pos: [[-0.4, 1.3, 5.6], [-0.8, 1.15, 4.8]], alvo: parado([-2.4, 0.65, -0.4]), estado: "entra", treme: 0.008 },
  { de: 49, ate: 52.12, mundo: "corte", pos: [[-3, 1.5, 7.2], [-3, 1.4, 6.4]], alvo: parado([-3, 1, 0]), estado: "anula" },
  { de: 52.12, ate: 54.42, mundo: "corte", pos: [[-0.4, 3.6, 9.2], [-0.2, 4.2, 7.8]], alvo: [[-0.3, 3, 0], [-0.1, 3.9, 0]], estado: "familia" },
  { de: 54.42, ate: 56.56, mundo: "corte", pos: [[-6, 2.1, 12.2], [-5.2, 2.1, 11.2]], alvo: parado([-2, 1.9, 0]), estado: "correnteza", treme: 0.022 },
  { de: 56.56, ate: 58.2, mundo: "terreno", pos: [[-9.6, -0.1, 20], [-10.2, -0.22, 8.5]], alvo: parado([-12.5, -0.15, -30]), foco: 16, desfoque: 0.8, estado: "placa" },
  { de: 58.2, ate: 59.92, mundo: "terreno", pos: [[-8.4, 2, 10.6], [-7.2, 1.75, 9.2]], alvo: parado([-1.6, 0.8, 0]), foco: 9, desfoque: 1.4, estado: "placa", pose: "apontaE" },
  { de: 59.92, ate: 62.88, mundo: "terreno", pos: [[1.5, 1.5, 8.2], [1.1, 1.45, 7.4]], alvo: parado([-1.3, 0.95, 0]), foco: 7, desfoque: 1.6, estado: "placa", pose: "ombros", anda: { de: [0.5, 0, 0], ate: [-0.7, 0, 1.2], t0: 59.92, t1: 61.1, giro: -0.4 } },
  // CENA 5: água de menos
  { de: 62.88, ate: 65.08, mundo: "casa", pos: [[3.9, 1.5, 12.5], [3.5, 1.5, 11.2]], alvo: parado([1.3, 2.2, 0]), foco: 4.5, desfoque: 2.4, pose: "neutro", anda: { de: [0.3, 0, 7.4], ate: [2.4, 0, 7.4], t0: 62.88, t1: 64.1, giro: 1.2 }, estado: "seca" },
  { de: 65.08, ate: 67.1, mundo: "casa", pos: [[2.1, 8.8, 8], [1.7, 8.2, 7]], alvo: parado([1.2, 6, -1]), foco: 8, desfoque: 1.5, estado: "gota" },
  { de: 67.1, ate: 69.92, mundo: "casa", pos: [[3.8, 7.1, 7.4], [3.3, 6.8, 6.4]], alvo: parado([1.6, 5.9, 0]), foco: 7, desfoque: 1.5, estado: "gota" },
  { de: 69.92, ate: 71.72, mundo: "casa", pos: [[3.9, 5.2, 4.2], [3.7, 3, 3.9]], alvo: [[2.72, 5, 0.3], [2.5, 2.2, 0.7]], foco: 3.6, desfoque: 2, estado: "gota" },
  { de: 71.72, ate: 74.3, mundo: "cisterna", pos: [[2.4, 1.3, 6], [2.25, 1.2, 5.2]], alvo: parado([2.15, 0.9, 1.5]), foco: 3.7, desfoque: 1.5, estado: "enche" },
  { de: 74.3, ate: 76.14, mundo: "casa", pos: [[6, 1.1, 10.5], [5.3, 1.2, 10]], alvo: parado([2.3, 1.7, 0]), foco: 4.2, desfoque: 2.4, pose: "apontaE", estado: "cisterna" },
  { de: 76.14, ate: 78.78, mundo: "mesa", pos: [[-1.8, 1.25, 2.1], [-1.55, 1.2, 1.7]], alvo: parado([-0.55, 0.95, -0.9]), foco: 2.4, desfoque: 2.5 },
  { de: 78.78, ate: 81.66, mundo: "mesa", pos: [[0.05, 3.7, 4.5], [0, 3.3, 3.9]], alvo: parado([0, 0.82, -0.1]), foco: 4.7, desfoque: 1.5 },
  { de: 81.66, ate: 84.62, mundo: "casa", pos: [[4.8, 3.2, 13], [4, 3, 11.6]], alvo: parado([1.5, 3.2, 0]), foco: 11, desfoque: 1.5, estado: "fresco" },
  { de: 84.62, ate: 87.26, mundo: "brasil", pos: [[-1.5, 7.2, 2.2], [-1.6, 6.8, 1.6]], alvo: parado([-1.65, 0.1, -1.5]), fov: 40, foco: 7, desfoque: 0.8, estado: "amazonia" },
  { de: 87.26, ate: 89.4, mundo: "brasil", pos: [[-1.6, 5.2, -0.2], [-1.65, 4.6, -0.6]], alvo: parado([-1.65, 0.1, -2]), fov: 40, foco: 5, desfoque: 0.8, estado: "amazonia" },
  // CENA 6: o que dá pra fazer hoje
  { de: 89.4, ate: 91.92, mundo: "terreno", pos: [[3.2, 1.6, 8], [3, 1.55, 7.2]], alvo: parado([2, 1.25, 0]), foco: 5.6, desfoque: 2.4, estado: "obra", pose: "ombros" },
  { de: 91.92, ate: 94.34, mundo: "celular", pos: [[0.7, 0.1, 3], [0.45, 0.05, 2.6]], alvo: parado([0.3, 0.02, -0.4]), fov: 38, foco: 3.4, desfoque: 3 },
  { de: 94.34, ate: 97.98, mundo: "celular", pos: [[-0.2, 0.12, 1.75], [-0.2, 0.12, 1.55]], alvo: parado([-0.2, 0.12, 0]), fov: 38, foco: 1.6, desfoque: 4 },
  { de: 97.98, ate: 100.2, mundo: "celular", pos: [[0, 0.1, 2.7], [0, 0.05, 2.45]], alvo: parado([0, 0, 0]), fov: 38, foco: 2.45, desfoque: 3 },
  { de: 100.2, ate: 102.38, mundo: "bairro", pos: [[-1, 9.4, 8], [0.4, 8.2, 6.6]], alvo: parado([0, 0, -0.5]), fov: 38, foco: 10, desfoque: 0 },
  { de: 102.38, ate: 104.5, mundo: "casa", pos: [[2.8, 1.5, 11.6], [2.6, 1.4, 11]], alvo: parado([0.2, 1, 7.4]), foco: 4, desfoque: 3, pose: "baixo", estado: "borda", anda: { de: [1, 0, 7.4], ate: [0.32, 0, 7.4], t0: 102.38, t1: 103.2, giro: -1.2 } },
  { de: 104.5, ate: 106.92, mundo: "alagada", pos: [[3.6, 0.75, 6.6], [3.3, 0.72, 6.4]], alvo: parado([-0.2, 0.42, 5.4]), foco: 3.6, desfoque: 1 },
  // CENA 7: fechamento
  { de: 106.92, ate: 109.54, mundo: "casa", pos: [[0.5, 2.4, 19], [0.42, 2.2, 17.8]], alvo: parado(CASA_ALVO), pose: "neutro" },
  { de: 109.54, ate: 111.22, mundo: "casa", pos: [[0.16, 1.6, 9.9], [0.1, 1.56, 9.3]], alvo: parado([0, 1.52, 7.4]), foco: 2.2, desfoque: 5, pose: "explica" },
  { de: 111.22, ate: DURACAO + 1, mundo: "casa", pos: [[0.3, 1.9, 13], [0.36, 2, 15]], alvo: [[0, 1.8, 7.4], [0.03, 2.5, 3]], foco: 7, desfoque: 2.4, pose: "abre" },
];

export const planoEm = (t: number) => PLANOS.find((p) => t >= p.de && t < p.ate) ?? PLANOS[PLANOS.length - 1];

// Legendas: * marca a palavra em itálico.
export const LEGENDAS: [number, number, string][] = [
  [-8.65, -7.2, "*Depende* de onde ela fica."],
  [-7.07, -5.2, "Porque essa aqui tá *alagando*"],
  [-5.11, -3.72, "e *secando* ao mesmo tempo."],
  [-3.33, -2.35, "E no fim eu te mostro"],
  [-2.33, -1.37, "o que fazer *hoje*,"],
  [-1.35, -0.1, "só com o *celular*."],
  [0, 1.35, "Essa casa tá *alagando*"],
  [1.35, 2.7, "e *secando* ao mesmo tempo."],
  [2.8, 4.85, "E a *culpa* é de uma coisa só:"],
  [4.94, 5.95, "o *El Niño*."],
  [6.04, 7.55, "Em outubro, o *Pacífico*"],
  [7.6, 9.55, "ficou *2,47 graus*"],
  [9.6, 10.75, "acima do normal,"],
  [10.8, 12.2, "*recorde* pra um outubro."],
  [12.24, 13.55, "E pode virar o *mais forte*"],
  [13.6, 15.9, "desde *1950*."],
  [15.98, 17.4, "Mas *\"super El Niño\"*"],
  [17.46, 18.3, "é *apelido*."],
  [18.36, 19.7, "A escala mede o *mar*,"],
  [19.74, 20.7, "não o *estrago*."],
  [20.74, 21.8, "O estrago *depende*"],
  [21.84, 22.95, "de onde você *mora*."],
  [23.02, 24.5, "Até janeiro, a *previsão* é"],
  [24.54, 25.7, "mais *chuva* no Sul,"],
  [25.74, 27.4, "menos em grande parte do *Norte*"],
  [27.42, 28.65, "e em áreas do *Nordeste*,"],
  [28.7, 31.3, "e *calor* em quase todo o país."],
  [31.34, 32.3, "Então bora *construir*"],
  [32.36, 33.55, "as *duas casas*."],
  [33.64, 34.5, "Desse lado,"],
  [34.52, 35.7, "*água demais*."],
  [35.74, 37.65, "O instinto é *vedar* tudo."],
  [37.7, 38.98, "Só que *1 metro* de água"],
  [39.0, 39.7, "de um lado só"],
  [39.72, 40.9, "*empurra* cada metro"],
  [40.92, 42.9, "de parede com uns *500 quilos*."],
  [43.0, 43.9, "*2 metros*?"],
  [43.96, 45.05, "*Quadruplica*:"],
  [45.08, 46.25, "*2 toneladas*."],
  [46.32, 47.55, "Então tem *engenharia*"],
  [47.6, 48.95, "que deixa a *água entrar*."],
  [49.02, 50.45, "Com água dos *dois lados*,"],
  [50.5, 52.1, "os empurrões quase se *anulam*,"],
  [52.16, 53.1, "e a *família* dorme"],
  [53.18, 54.4, "*acima* da cheia."],
  [54.46, 55.7, "*Correnteza* forte"],
  [55.72, 56.55, "isso não segura."],
  [56.58, 57.65, "Por isso *Muçum*"],
  [57.7, 58.85, "proibiu casa nova"],
  [58.88, 59.9, "na *beira do rio*."],
  [59.94, 60.68, "A melhor casa"],
  [60.7, 61.45, "contra *enchente*"],
  [61.46, 62.85, "é a que *não tá lá*."],
  [62.92, 63.8, "Desse lado,"],
  [63.86, 65.05, "*água de menos*."],
  [65.12, 67.05, "Aqui o *telhado* vira ferramenta:"],
  [67.14, 68.4, "cada *milímetro* de chuva"],
  [68.42, 69.9, "em *50 metros quadrados*"],
  [69.92, 71.7, "dá até *50 litros*,"],
  [71.74, 72.9, "que enchem uma *cisterna*"],
  [72.92, 74.3, "de *16 mil*."],
  [74.34, 76.1, "Isso já existe no *semiárido*:"],
  [76.16, 77.6, "água pra *beber* e cozinhar,"],
  [77.66, 78.75, "depois de *tratada*,"],
  [78.78, 79.75, "pra *5 pessoas*"],
  [79.76, 81.6, "por até *8 meses*."],
  [81.7, 82.45, "Pro *calor*,"],
  [82.48, 83.45, "*telhado claro*,"],
  [83.5, 84.6, "sombra e *vento*."],
  [84.66, 85.8, "E sem drama:"],
  [85.82, 87.25, "hoje a *Amazônia* não tá"],
  [87.26, 89.3, "em *seca geral* como em 2024."],
  [89.44, 90.85, "Só que ninguém *levanta casa*"],
  [90.88, 91.9, "até *janeiro*."],
  [91.94, 92.95, "O que dá pra fazer *hoje*"],
  [93.0, 94.3, "cabe no *celular*:"],
  [94.34, 95.35, "manda seu *CEP*"],
  [95.36, 96.45, "por SMS pro"],
  [96.5, 97.95, "*40199*"],
  [97.98, 99.0, "e recebe *alerta*"],
  [99.02, 100.15, "da *Defesa Civil*."],
  [100.22, 101.5, "Descobre a *rota de fuga*"],
  [101.54, 102.35, "do bairro."],
  [102.4, 103.2, "E *rua alagada*"],
  [103.22, 104.45, "não se *atravessa*:"],
  [104.52, 105.6, "esconde *buraco*,"],
  [105.64, 106.85, "*bueiro* e *fio*."],
  [106.96, 108.0, "A previsão *sozinha*"],
  [108.02, 109.5, "não impede desastre."],
  [109.58, 111.2, "Quem impede é *gente*."],
  [111.45, 112.19, "Você quer uma *casa*"],
  [112.21, 113.21, "que aguenta *de boa*"],
  [113.23, 113.99, "esse *El Niño*"],
  [114.01, 115.59, "ou qualquer *tempestade*?"],
  [115.61, 117.05, "*Deixa aí* nos comentários."],
];

// Números e etiquetas: número grande e fino, rótulo pequeno espaçado, fonte embaixo. Sem caixa.
export type Etiqueta = { de: number; ate: number; numero?: string; rotulo?: string; fonte?: string; topo?: number; conta?: [number, number, number, number] };
export const ETIQUETAS: Etiqueta[] = [
  { de: -9.95, ate: -8.75, fonte: "Previsão da NOAA, 08/10/2026", topo: 1660 },
  { de: 7.66, ate: 12.2, conta: [7.66, 9.1, 0, 2.47], rotulo: "PACÍFICO, ÁREA NIÑO 3.4, OUTUBRO", fonte: "Inmet, 03/11/2026" },
  { de: 12.3, ate: 15.9, numero: "desde 1950", rotulo: "PODE SER O MAIS FORTE", fonte: "Previsão da NOAA, 08/10/2026" },
  { de: 23.1, ate: 25.7, rotulo: "SUL: CHUVA ACIMA DO NORMAL", fonte: "Previsão, nov. a jan. Painel El Niño, 29/10/2026" },
  { de: 25.8, ate: 28.65, rotulo: "NORTE E PARTE DO NORDESTE: CHUVA ABAIXO DO NORMAL", fonte: "Previsão, nov. a jan. Painel El Niño, 29/10/2026" },
  { de: 28.75, ate: 31.3, rotulo: "CALOR ACIMA DA MÉDIA EM QUASE TODO O PAÍS", fonte: "Previsão, nov. a jan. O sul do RS pode ficar abaixo." },
  { de: 39.72, ate: 42.96, numero: "≈ 500 kg", rotulo: "1 M DE ÁGUA, POR METRO DE PAREDE", fonte: "Conta aproximada. Obra de verdade precisa de engenheiro." },
  { de: 43.3, ate: 46.28, numero: "≈ 2 toneladas", rotulo: "2 M DE ÁGUA, POR METRO DE PAREDE", fonte: "Conta aproximada. Obra de verdade precisa de engenheiro." },
  { de: 49.6, ate: 52.1, numero: "≈ 0", rotulo: "EMPURRÃO QUE SOBRA", fonte: "Técnica usada nos EUA, só em área sem morador (FEMA)" },
  { de: 56.7, ate: 59.9, rotulo: "MUÇUM (RS)", fonte: "Decisão da prefeitura: nada de casa nova nas áreas de maior risco (NSC Total). Cena ilustrativa." },
  { de: 68.5, ate: 71.7, numero: "1 mm = 50 L", rotulo: "EM 50 M² DE TELHADO, NO MÁXIMO", fonte: "Conta aproximada, sem perdas" },
  { de: 72.9, ate: 74.3, numero: "16 mil L", rotulo: "CISTERNA DE PLACAS", fonte: "ASA e governo federal" },
  { de: 79, ate: 81.6, numero: "até 8 meses", rotulo: "5 PESSOAS, BEBER E COZINHAR", fonte: "ASA e governo federal. Água tratada." },
  { de: 85.9, ate: 89.3, rotulo: "MAIOR ATENÇÃO: RORAIMA E RIOS BRANCO E NEGRO", fonte: "Painel El Niño, 29/10/2026" },
  { de: 98.1, ate: 100.1, rotulo: "SMS SÓ COM OS NÚMEROS DO CEP", fonte: "Serviço do governo federal (gov.br)" },
  { de: 107, ate: 111.1, rotulo: "A IDEIA É DE CELESTE SAULO", fonte: "Secretária-geral da OMM" },
];

// Boca presa na voz: abre durante cada palavra e fecha nas pausas.
export const bocaEm = (t: number) => {
  for (const p of palavras) {
    if (t < p.s - 0.03) return 0;
    if (t <= p.e + 0.03) {
      const u = (t - p.s) / Math.max(0.05, p.e - p.s);
      const envelope = Math.min(1, Math.min(u, 1 - u) * 5 + 0.25);
      return Math.max(0.04, envelope * (0.42 + 0.34 * Math.abs(Math.sin(t * 19))));
    }
  }
  return 0;
};
// no gancho o tempo é negativo, e o resto negativo da divisão deixava ele de olho fechado o tempo todo
export const piscaEm = (t: number) => (((t * 0.27) % 1) + 1) % 1 < 0.035;

// Os efeitos nunca podem cobrir a voz: tabela, quadro a quadro, com o quanto cada efeito pode soar.
// Durante a fala ficam quase sumidos; nas pausas voltam. A subida e a descida são suaves.
export const baixaEfeitos = (() => {
  const n = Math.ceil(130 * FPS);
  const alvo = new Float32Array(n).fill(1);
  for (let q = 0; q < n; q++) {
    const v = virtual(q / FPS);
    if (palavras.some((p) => v >= p.s - 0.14 && v <= p.e + 0.1)) alvo[q] = 0.12;
  }
  const s = new Float32Array(n);
  let atual = 1;
  for (let q = 0; q < n; q++) {
    atual += (alvo[q] - atual) * (alvo[q] < atual ? 0.7 : 0.22);
    s[q] = atual;
  }
  return s;
})();
