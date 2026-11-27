// Corta a narração do vídeo da projeção astral (take 2) em 20 frases, cada uma no ponto mais
// silencioso entre ela e a próxima, e salva em public/astral/voz/fNN.wav (+ duracoes.json).
// Os tempos de palavra do Scribe ficam ~0,05–0,1 s fora: por isso o corte é pelo áudio, não pelo texto.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const ORIGEM = "public/astral/narracao-take2.wav";
const PASTA = "public/astral/voz";

// [início da 1ª palavra (ou da respiração/riso), fim da última palavra] — da transcrição do take 2
const FRASES = [
  [0.08, 2.48], // E se você pudesse fazer projeção astral?
  [2.88, 5.16], // Esse é você... Dormindo.
  [5.5, 7.28], // As paredes não te seguram mais.
  [7.52, 9.48], // Seu crush, às três da manhã.
  [9.6, 11.6], // (risinho) Só o gato dele te vê.
  [11.9, 12.8], // Pensa num lugar...
  [13.0, 14.08], // ...e você está lá.
  [14.3, 15.68], // Ninguém consegue te ver.
  [15.92, 17.96], // O arquivo secreto do Vaticano.
  [18.07, 20.44], // Nenhuma porta fica trancada pra você.
  [20.55, 22.33], // Dentro da Grande Pirâmide.
  [22.4, 23.48], // O Salão Oval.
  [23.6, 25.22], // Ninguém percebe você.
  [25.36, 26.57], // Área cinquenta e um.
  [26.64, 28.73], // Agora você sabe o que tem lá dentro.
  [28.8, 29.77], // Mais alto!
  [29.84, 32.25], // A Terra inteira... lá embaixo.
  [32.32, 34.28], // Aí você pensa no seu corpo...
  [34.32, 36.01], // (suspiro) E você acorda.
  [36.08, 37.52], // Você tentaria hoje à noite?
];

const buf = readFileSync(ORIGEM);
let p = 12;
let dados = null;
let sr = 44100;
while (p < buf.length) {
  const id = buf.toString("latin1", p, p + 4);
  const tam = buf.readUInt32LE(p + 4);
  if (id === "fmt ") sr = buf.readUInt32LE(p + 12);
  if (id === "data") dados = buf.subarray(p + 8, p + 8 + tam);
  p += 8 + tam + (tam % 2);
}
const n = dados.length / 2;
const x = new Float32Array(n);
for (let i = 0; i < n; i++) x[i] = dados.readInt16LE(i * 2) / 32768;

// energia em janelas de 10 ms
const J = Math.round(sr * 0.01);
const energia = (t) => {
  const c = Math.round(t * sr);
  let s = 0;
  for (let i = Math.max(0, c - J); i < Math.min(n, c + J); i++) s += x[i] * x[i];
  return s;
};
const maisQuieto = (a, b) => {
  let melhor = a;
  let menor = Infinity;
  for (let t = a; t <= b; t += 0.005) {
    const e = energia(t);
    if (e < menor) {
      menor = e;
      melhor = t;
    }
  }
  return melhor;
};

const cortes = [Math.max(0, FRASES[0][0] - 0.06)];
for (let i = 0; i < FRASES.length - 1; i++) {
  const fim = FRASES[i][1];
  const ini = FRASES[i + 1][0];
  cortes.push(maisQuieto(Math.min(fim, ini) - 0.12, Math.max(fim, ini) + 0.05));
}
cortes.push(n / sr);

mkdirSync(PASTA, { recursive: true });
const salvar = (nome, amostras) => {
  const out = Buffer.alloc(44 + amostras.length * 2);
  out.write("RIFF", 0);
  out.writeUInt32LE(36 + amostras.length * 2, 4);
  out.write("WAVEfmt ", 8);
  out.writeUInt32LE(16, 16);
  out.writeUInt16LE(1, 20);
  out.writeUInt16LE(1, 22);
  out.writeUInt32LE(sr, 24);
  out.writeUInt32LE(sr * 2, 28);
  out.writeUInt16LE(2, 32);
  out.writeUInt16LE(16, 34);
  out.write("data", 36);
  out.writeUInt32LE(amostras.length * 2, 40);
  for (let i = 0; i < amostras.length; i++) out.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(amostras[i] * 32767))), 44 + i * 2);
  writeFileSync(`${PASTA}/${nome}`, out);
};

const duracoes = [];
for (let i = 0; i < FRASES.length; i++) {
  const a = Math.round(cortes[i] * sr);
  const b = Math.round(cortes[i + 1] * sr);
  const trecho = x.slice(a, b);
  const borda = Math.round(sr * 0.012);
  for (let k = 0; k < borda && k < trecho.length; k++) {
    trecho[k] *= k / borda;
    trecho[trecho.length - 1 - k] *= k / borda;
  }
  salvar(`f${String(i).padStart(2, "0")}.wav`, trecho);
  // atraso até a 1ª palavra dentro do trecho (para alinhar a legenda com a voz)
  duracoes.push({ arquivo: `f${String(i).padStart(2, "0")}.wav`, duracao: +(trecho.length / sr).toFixed(3), atrasoFala: +(FRASES[i][0] - cortes[i]).toFixed(3) });
}
writeFileSync(`${PASTA}/duracoes.json`, JSON.stringify(duracoes, null, 1));
console.log(duracoes.map((d, i) => `${i}: ${d.duracao}s (fala em +${d.atrasoFala})`).join("\n"));
