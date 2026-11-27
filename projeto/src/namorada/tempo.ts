// "E se o Gabriel arrumasse uma namorada?" — linha do tempo.
// Tudo em segundos REAIS do vídeo, presos às palavras da narração (narracao-palavras.json).
// Para outro amigo da série: troque NOME (e AMIGO) e gere a narração de novo com o nome novo.

export const NOME = "Gabriel";
export const AMIGO = "Lucas";
// @ do perfil para o cartaz final ("" = não mostra)
export const ARROBA = "";

export const FPS = 30;
export const DURACAO = 58.6;
export const DURACAO_FRAMES = Math.round(DURACAO * FPS);
export const seg = (s: number) => Math.round(s * FPS);
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export type Vec3 = [number, number, number];

// A narração entra inteira, com um respiro de 1,4 s depois de "explode." (o planeta volta inteiro)
export const TRECHOS_NARRACAO = [
  { de: 0, ate: 46.75, em: 0.15 },
  { de: 46.75, ate: 54.0, em: 48.15 },
];

// ---------- Planos (um corte a cada 1–2 s) ----------
export type IdPlano =
  | "espaco" | "zoomBrasil" | "salaAmpla" | "cientista" | "telao" | "telaoPerto" | "cientistasOlham"
  | "quartoAmplo" | "quartoPerto" | "chat" | "choque" | "bairro" | "mae" | "grupo"
  | "terraRacha" | "placas" | "placas2" | "magnitude" | "recorde" | "recorde2"
  | "cristo" | "eiffel" | "muralha" | "salaVermelha" | "mapa" | "lasers" | "telhado" | "deitado"
  | "terraLaranja" | "explosao" | "terraCalma" | "sentado" | "medalha" | "medalhaPerto" | "cartaz";

export const PLANOS: { id: IdPlano; de: number }[] = [
  { id: "espaco", de: 0 },
  { id: "zoomBrasil", de: 1.0 },
  { id: "salaAmpla", de: 2.55 },
  { id: "cientista", de: 4.05 },
  { id: "telao", de: 5.2 },
  { id: "telaoPerto", de: 6.95 },
  { id: "cientistasOlham", de: 8.9 },
  { id: "quartoAmplo", de: 10.85 },
  { id: "quartoPerto", de: 12.2 },
  { id: "chat", de: 13.35 },
  { id: "choque", de: 14.55 },
  { id: "bairro", de: 15.4 },
  { id: "mae", de: 17.6 },
  { id: "grupo", de: 19.05 },
  { id: "terraRacha", de: 21.65 },
  { id: "placas", de: 23.85 },
  { id: "placas2", de: 25.9 },
  { id: "magnitude", de: 27.35 },
  { id: "recorde", de: 28.35 },
  { id: "recorde2", de: 30.0 },
  { id: "cristo", de: 31.85 },
  { id: "eiffel", de: 33.55 },
  { id: "muralha", de: 35.0 },
  { id: "salaVermelha", de: 37.0 },
  { id: "mapa", de: 38.75 },
  { id: "lasers", de: 40.25 },
  { id: "telhado", de: 41.85 },
  { id: "deitado", de: 43.2 },
  { id: "terraLaranja", de: 45.05 },
  { id: "explosao", de: 46.1 },
  { id: "terraCalma", de: 47.6 },
  { id: "sentado", de: 49.3 },
  { id: "medalha", de: 51.05 },
  { id: "medalhaPerto", de: 53.0 },
  { id: "cartaz", de: 55.4 },
];

export const planoEm = (s: number) => {
  let i = 0;
  while (i + 1 < PLANOS.length && PLANOS[i + 1].de <= s) i++;
  const ate = i + 1 < PLANOS.length ? PLANOS[i + 1].de : DURACAO;
  return { ...PLANOS[i], ate, t: s - PLANOS[i].de, dur: ate - PLANOS[i].de };
};
export const inicioDe = (id: IdPlano) => PLANOS.find((p) => p.id === id)!.de;

// ---------- Momentos-chave ----------
export const MARCOS = {
  aceito: 14.6,
  ondaDeChoque: 15.55,
  saiuDoGrupo: 20.25,
  racha: 21.75,
  terremoto: 23.85,
  explode: 46.07,
  explosao: 46.15,
  digita: 44.0,
};

// ---------- Legendas (a narração fala exatamente isso) ----------
const N = NOME.toUpperCase();
export const LEGENDAS: { de: number; ate: number; texto: string }[] = [
  { de: 0.22, ate: 0.95, texto: `E SE O **${N}**` },
  { de: 0.95, ate: 2.55, texto: "ARRUMASSE UMA **NAMORADA?**" },
  { de: 2.61, ate: 3.55, texto: "DURANTE **ANOS**," },
  { de: 3.59, ate: 5.08, texto: "OS CIENTISTAS **GARANTIRAM**:" },
  { de: 5.11, ate: 6.8, texto: "ISSO **NUNCA** IA ACONTECER." },
  { de: 6.83, ate: 7.62, texto: "A CHANCE ERA DE" },
  { de: 7.67, ate: 10.75, texto: "**0,0001%**" },
  { de: 10.79, ate: 11.4, texto: "ATÉ QUE," },
  { de: 11.43, ate: 12.2, texto: "NUMA **TERÇA**," },
  { de: 12.23, ate: 13.3, texto: "ÀS **2 DA MANHÃ**," },
  { de: 13.35, ate: 14.5, texto: "ELA **RESPONDEU**:" },
  { de: 14.6, ate: 15.38, texto: "**ACEITO.**" },
  { de: 15.42, ate: 16.44, texto: "UMA **ONDA DE CHOQUE**" },
  { de: 16.47, ate: 17.53, texto: "SAI DO **QUARTO** DELE." },
  { de: 17.55, ate: 18.25, texto: "A MÃE **CHORA**" },
  { de: 18.27, ate: 19.04, texto: "DE **EMOÇÃO**." },
  { de: 19.06, ate: 20.2, texto: "O GRUPO DOS **SOLTEIROS**" },
  { de: 20.23, ate: 21.66, texto: "PERDE O **ÚLTIMO MEMBRO**." },
  { de: 21.72, ate: 22.52, texto: "EM **SEGUNDOS**," },
  { de: 22.55, ate: 23.8, texto: "A TERRA **NÃO AGUENTA**." },
  { de: 23.83, ate: 25.05, texto: "AS **PLACAS TECTÔNICAS**" },
  { de: 25.07, ate: 26.08, texto: "AO **MESMO TEMPO**." },
  { de: 26.11, ate: 27.3, texto: "**TERREMOTO GLOBAL**." },
  { de: 27.35, ate: 28.33, texto: "MAGNITUDE **12**." },
  { de: 28.35, ate: 29.3, texto: "O **MAIOR** DA HISTÓRIA" },
  { de: 29.35, ate: 30.95, texto: "TINHA SIDO **9,5**," },
  { de: 31.03, ate: 31.85, texto: "NO **CHILE**." },
  { de: 31.89, ate: 32.85, texto: "O CRISTO DÁ UM **PASSO**" },
  { de: 32.87, ate: 33.53, texto: "**PRO LADO**." },
  { de: 33.55, ate: 34.2, texto: "A **TORRE EIFFEL**" },
  { de: 34.23, ate: 34.97, texto: "SE **CURVA**." },
  { de: 34.99, ate: 35.85, texto: "A **MURALHA DA CHINA**" },
  { de: 35.87, ate: 36.98, texto: "VIRA **ZIGUE-ZAGUE**." },
  { de: 37.01, ate: 38.7, texto: "A **NASA** RASTREIA A ORIGEM." },
  { de: 38.75, ate: 39.72, texto: "TODOS OS **SISMÓGRAFOS**" },
  { de: 39.75, ate: 40.6, texto: "DO MUNDO **APONTAM**" },
  { de: 40.67, ate: 41.78, texto: "PRO **MESMO LUGAR**:" },
  { de: 41.82, ate: 43.2, texto: `O **QUARTO DO ${N}**.` },
  { de: 43.23, ate: 44.0, texto: "ELE **MANDA**:" },
  { de: 44.04, ate: 44.95, texto: "**BOM DIA, AMOR.**" },
  { de: 44.98, ate: 46.0, texto: "E O **PLANETA**…" },
  { de: 46.07, ate: 47.3, texto: "**EXPLODE.**" },
  { de: 48.41, ate: 49.25, texto: "AGORA VOCÊ **ENTENDE**" },
  { de: 49.32, ate: 49.95, texto: `POR QUE O **${N}**` },
  { de: 50.0, ate: 50.97, texto: "CONTINUA **SOLTEIRO**." },
  { de: 51.0, ate: 51.85, texto: "ELE TÁ **PROTEGENDO**" },
  { de: 51.88, ate: 52.85, texto: "A **HUMANIDADE**." },
  { de: 52.92, ate: 53.3, texto: "**MARCA** AQUELE" },
  { de: 53.32, ate: 54.0, texto: "AMIGO **SOLTEIRO**" },
  { de: 54.04, ate: 54.68, texto: "QUE TÁ **SALVANDO**" },
  { de: 54.71, ate: 55.4, texto: "O **MUNDO**." },
];

// ---------- HUD do canto (rótulo, número gigante, rodapé) ----------
export type EstadoHud = { de: number; ate: number; rotulo: string; valor: string; rodape?: string; alerta?: boolean };
export const HUDS: EstadoHud[] = [
  { de: 6.83, ate: 10.85, rotulo: "PROBABILIDADE", valor: "0,0001%", rodape: "DE ACONTECER" },
  { de: 11.43, ate: 13.35, rotulo: "TERÇA-FEIRA", valor: "02:00" },
  { de: 14.6, ate: 15.4, rotulo: "PROBABILIDADE", valor: "100%", rodape: "ACONTECEU" },
  { de: 27.35, ate: 28.35, rotulo: "MAGNITUDE", valor: "12", rodape: "NUNCA REGISTRADO", alerta: true },
  { de: 28.35, ate: 31.85, rotulo: "RECORDE ANTERIOR", valor: "9,5", rodape: "CHILE · 1960" },
  { de: 38.75, ate: 41.85, rotulo: "ORIGEM DO SINAL", valor: "BRASIL", alerta: true },
];

// Selos amarelos inclinados
export const SELOS: { de: number; ate: number; texto: string; topo: number }[] = [
  { de: 14.75, ate: 15.4, texto: "×1.000.000", topo: 330 },
  { de: 29.75, ate: 31.85, texto: "12 > 9,5", topo: 330 },
];

// Etiquetas (pílulas pretas com borda branca)
export const ETIQUETAS: { de: number; ate: number; texto: string; topo: number }[] = [
  { de: 15.5, ate: 17.6, texto: `CASA DO ${N}`, topo: 1480 },
  { de: 17.65, ate: 19.05, texto: "MÃE", topo: 1480 },
  { de: 24.0, ate: 27.35, texto: "PLACAS TECTÔNICAS", topo: 1480 },
  { de: 31.9, ate: 33.55, texto: "CRISTO REDENTOR", topo: 1480 },
  { de: 33.6, ate: 35.0, texto: "TORRE EIFFEL", topo: 1480 },
  { de: 35.05, ate: 37.0, texto: "MURALHA DA CHINA", topo: 1480 },
  { de: 37.05, ate: 38.75, texto: "NASA · ALERTA MÁXIMO", topo: 1480 },
  { de: 41.9, ate: 43.2, texto: "EPICENTRO", topo: 1480 },
  { de: 42.05, ate: 43.2, texto: `QUARTO DO ${N}`, topo: 1575 },
  { de: 51.6, ate: 55.4, texto: "PROTETOR DA HUMANIDADE", topo: 300 },
];

// Aviso no canto superior direito durante a catástrofe
export const AVISO_ILUSTRACAO = { de: 21.65, ate: 47.6 };
