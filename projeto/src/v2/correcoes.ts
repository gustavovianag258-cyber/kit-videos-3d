// CORREÇÕES (X vermelho), SELOS, TEXTOS DE TELA E SONS — configuração editável.
// Tempos em SEGUNDOS no vídeo. Separado das animações: dá para mudar texto e tempo aqui.

export type Correcao = {
  texto: string;
  inicio: number;
  fim: number;
  // Como o X entra: "congela" (imagem para e perde cor), "lento" (desacelera até parar), "rapido"
  estilo: "congela" | "lento" | "rapido";
};

export const CORRECOES: Correcao[] = [
  { texto: "CALMA: NINGUÉM SAIRIA FLUTUANDO!", inicio: 16.0, fim: 17.6, estilo: "congela" },
  { texto: "O MAR NÃO DESPENCARIA ASSIM, NÃO!", inicio: 29.6, fim: 31.1, estilo: "lento" },
  { texto: "NÃO DÁ PRA COPIAR A ÓRBITA!", inicio: 45.2, fim: 46.4, estilo: "rapido" },
];

// Selos discretos que identificam hipóteses e simulações
export type Selo = { texto: string; inicio: number; fim: number };
export const SELOS: Selo[] = [
  { texto: "CENÁRIO HIPOTÉTICO", inicio: 14.0, fim: 17.6 },
  { texto: "SIMULAÇÃO CONCEITUAL · DISCO UNIFORME", inicio: 17.6, fim: 25.9 },
  { texto: "CENÁRIO HIPOTÉTICO", inicio: 28.2, fim: 31.1 },
  { texto: "SIMULAÇÃO CONCEITUAL · DISCO UNIFORME", inicio: 31.1, fim: 37.4 },
  { texto: "SIMULAÇÃO CONCEITUAL", inicio: 45.2, fim: 50.4 },
];

// Frase de impacto da conclusão (aparece grande, no lugar da legenda comum)
export const TEXTO_FINAL = {
  texto: "ACHATAR O PLANETA BAGUNÇARIA MUITO MAIS DO QUE A VISTA.",
  inicio: 50.6,
  fim: 58.6,
};

// Etiquetas da recapitulação final
export const RECAPITULACAO = [
  { texto: "GRAVIDADE", inicio: 52.0 },
  { texto: "ÁGUA", inicio: 52.7 },
  { texto: "ATMOSFERA", inicio: 53.4 },
  { texto: "LUZ DO SOL", inicio: 54.1 },
  { texto: "ÓRBITAS", inicio: 54.8 },
];

// Efeitos sonoros (arquivos sintetizados por scripts/gerar_sfx.mjs)
export type Som = { arquivo: "sfx/whoosh.wav" | "sfx/x.wav"; inicio: number; volume: number };
export const SONS: Som[] = [
  { arquivo: "sfx/whoosh.wav", inicio: 3.1, volume: 0.35 },
  { arquivo: "sfx/whoosh.wav", inicio: 6.1, volume: 0.45 },
  { arquivo: "sfx/whoosh.wav", inicio: 13.7, volume: 0.5 },
  { arquivo: "sfx/x.wav", inicio: 16.0, volume: 0.8 },
  { arquivo: "sfx/whoosh.wav", inicio: 17.3, volume: 0.45 },
  { arquivo: "sfx/whoosh.wav", inicio: 25.6, volume: 0.45 },
  { arquivo: "sfx/whoosh.wav", inicio: 27.9, volume: 0.4 },
  { arquivo: "sfx/x.wav", inicio: 29.75, volume: 0.8 },
  { arquivo: "sfx/whoosh.wav", inicio: 37.1, volume: 0.45 },
  { arquivo: "sfx/x.wav", inicio: 45.2, volume: 0.65 },
  { arquivo: "sfx/whoosh.wav", inicio: 50.1, volume: 0.45 },
];

// FILTRO DE COR — aplicado só nas cenas 3D (legendas e X ficam limpos).
// 1 = sem mudança. Saturação: cores mais vivas. Contraste: escuros mais escuros e claros mais claros.
// Nitidez: realça as bordas dos detalhes (0 desliga; acima de 0.6 começa a "serrilhar").
export const FILTRO_COR = {
  saturacao: 1.35,
  contraste: 1.08,
  brilho: 1.07,
  nitidez: 0,
};

// MÚSICA DE FUNDO (gerada por scripts/gerar_musica.mjs). Volume de 0 a 1.
// Quando a narração fala, a música abaixa para "volumeSobVoz"; nas pausas, sobe para "volume".
export const MUSICA = {
  arquivo: "musica/musica-fundo.mp3",
  volume: 0.17,
  volumeSobVoz: 0.08,
};

// "Tranco" na tela quando entra cada X: zoom rápido + tremida (0 desliga)
export const TRANCO = { zoom: 0.07, tremida: 14 };
