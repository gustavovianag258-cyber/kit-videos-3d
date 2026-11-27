// Gera a MÚSICA DE FUNDO original do vídeo (sintetizada aqui, sem direitos de terceiros).
//
// Uso: node scripts/gerar_musica.mjs
// Gera: public/musica/musica-fundo.mp3 (58,6 s, estéreo)
//
// Estilo: lo-fi / chill hop "de boa" — 84 BPM com swing, batida suave, acordes de piano
// elétrico (Dm9 – G13 – Cmaj9 – Am9), grave macio e chiado de vinil. Sem melodia correndo.
//   0–6,4 s   só os acordes e o chiado (clima)
//   6,4 s     entra a batida
//   em cada X vermelho só a bateria some (os acordes continuam)
//   50,4 s    final: bateria sai, acordes até o fim
import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";

const TAXA = 44100;
const DURACAO = 58.6;
const N = Math.round(TAXA * DURACAO);
const BPM = 84;
const TEMPO = 60 / BPM;
const SWING = 0.17; // atraso da 2ª e 4ª semicolcheia (fração de tempo) — o "balanço"

// Momentos do vídeo (iguais a src/v2/tempo.ts e src/v2/correcoes.ts)
const BATIDA_ENTRA = 6.4;
const FINAL = 50.4;
const CORTES = [
  [16.0, 17.6],
  [29.6, 31.1],
  [45.2, 46.4],
];
const cortado = (t) => CORTES.some(([a, b]) => t >= a - 0.05 && t < b - 0.05);

const L = new Float32Array(N);
const R = new Float32Array(N);

// Ruído determinístico (sem Math.random)
let semente = 777;
const ruido = () => {
  semente = (semente * 1103515245 + 12345) >>> 0;
  return (semente / 4294967296) * 2 - 1;
};
const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);

const somar = (inicio, amostras, pan = 0) => {
  const i0 = Math.round(inicio * TAXA);
  const gl = Math.cos(((pan + 1) * Math.PI) / 4);
  const gr = Math.sin(((pan + 1) * Math.PI) / 4);
  for (let i = 0; i < amostras.length; i++) {
    const k = i0 + i;
    if (k < 0 || k >= N) continue;
    L[k] += amostras[i] * gl;
    R[k] += amostras[i] * gr;
  }
};

// ---------- Instrumentos ----------
// Piano elétrico (FM suave: timbre redondo, ataque macio, leve tremolo)
const piano = (f, dur, vol) => {
  const n = Math.round((dur + 0.6) * TAXA);
  const s = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / TAXA;
    const solto = t > dur ? Math.exp(-(t - dur) * 8) : 1;
    const indice = 1.1 * Math.exp(-t * 5);
    const v =
      Math.sin(2 * Math.PI * f * t + indice * Math.sin(2 * Math.PI * f * t)) +
      0.12 * Math.sin(2 * Math.PI * f * 2 * t) * Math.exp(-t * 3);
    const env = Math.min(1, t / 0.012) * Math.exp(-t * 0.9) * solto;
    s[i] = v * env * vol * (1 + 0.07 * Math.sin(2 * Math.PI * 4.2 * t));
  }
  return s;
};
// Grave macio (quase só a fundamental)
const grave = (f, dur, vol) => {
  const n = Math.round(dur * TAXA);
  const s = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / TAXA;
    const env = Math.min(1, t / 0.02) * Math.min(1, (dur - t) / 0.08) * Math.exp(-t * 0.8);
    s[i] = (Math.sin(2 * Math.PI * f * t) + 0.15 * Math.sin(2 * Math.PI * f * 2 * t)) * env * vol;
  }
  return s;
};
// Bumbo abafado
const bumbo = (vol) => {
  const n = Math.round(0.4 * TAXA);
  const s = new Float32Array(n);
  let fase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / TAXA;
    fase += (2 * Math.PI * (45 + 60 * Math.exp(-t * 35))) / TAXA;
    s[i] = Math.sin(fase) * Math.exp(-t * 7) * Math.min(1, t / 0.003) * vol;
  }
  return s;
};
// Caixa "lo-fi": ruído abafado + corpo grave, sem estalo forte
const caixa = (vol) => {
  const n = Math.round(0.3 * TAXA);
  const s = new Float32Array(n);
  let lp = 0;
  for (let i = 0; i < n; i++) {
    const t = i / TAXA;
    lp += (ruido() - lp) * 0.35; // passa-baixa: tira o agudo áspero
    s[i] = (lp * 0.9 * Math.exp(-t * 14) + Math.sin(2 * Math.PI * 180 * t) * 0.35 * Math.exp(-t * 30)) * vol;
  }
  return s;
};
// Chimbal fechado bem baixinho
const chimbal = (vol) => {
  const n = Math.round(0.06 * TAXA);
  const s = new Float32Array(n);
  let a = 0;
  for (let i = 0; i < n; i++) {
    const t = i / TAXA;
    const r = ruido();
    s[i] = (r - a) * 0.5 * Math.exp(-t * 60) * vol;
    a = r;
  }
  return s;
};

// ---------- Arranjo ----------
// Acordes sem a fundamental (o grave toca a fundamental), voz média
const ACORDES = [
  { notas: [53, 57, 60, 64], raiz: 38 }, // Dm9
  { notas: [53, 59, 64, 69], raiz: 43 }, // G13
  { notas: [52, 55, 59, 62], raiz: 36 }, // Cmaj9
  { notas: [55, 60, 64, 71], raiz: 45 }, // Am9
];
const compassos = Math.ceil(DURACAO / (4 * TEMPO));
// Posição de uma semicolcheia (0–15) dentro do compasso, com swing
const quando = (compasso, passo) => (compasso * 4 + passo / 4) * TEMPO + (passo % 2 === 1 ? SWING * TEMPO * 0.25 * 2 : 0);

for (let c = 0; c < compassos; c++) {
  const ac = ACORDES[c % 4];
  const t0 = c * 4 * TEMPO;
  const final = t0 >= FINAL;

  // Acordes: um ataque no 1 e um mais leve no "e" do 3 (dedilhado levinho)
  ac.notas.forEach((m, k) => {
    somar(t0 + k * 0.018, piano(hz(m), 2.4 * TEMPO, 0.075), k % 2 ? 0.3 : -0.3);
    if (!final || t0 + 2.5 * TEMPO < DURACAO - 2) {
      somar(quando(c, 10) + k * 0.012, piano(hz(m), 1.2 * TEMPO, 0.045), k % 2 ? -0.2 : 0.2);
    }
  });

  if (t0 < BATIDA_ENTRA - 0.01) continue;
  // Grave: fundamental no 1 e uma "puxada" antes do 3
  if (!final) {
    somar(t0, grave(hz(ac.raiz), 2.2 * TEMPO, 0.32), 0);
    somar(quando(c, 7), grave(hz(ac.raiz), 1.3 * TEMPO, 0.24), 0);
  }

  if (final) continue;
  // Bateria boom-bap tranquila
  for (const p of [0, 7, 10]) {
    const t = quando(c, p);
    if (!cortado(t)) somar(t, bumbo(p === 0 ? 0.6 : 0.42), 0);
  }
  for (const p of [4, 12]) {
    const t = quando(c, p);
    if (!cortado(t)) somar(t, caixa(0.3), 0.08);
  }
  for (let p = 0; p < 16; p += 2) {
    const t = quando(c, p + (p % 4 === 2 ? 1 : 0));
    if (!cortado(t)) somar(t, chimbal(p % 4 === 0 ? 0.35 : 0.22), 0.3);
  }
}

// Chiado de vinil: estalinhos esparsos + ruído bem baixo
let lp = 0;
for (let i = 0; i < N; i++) {
  lp += (ruido() - lp) * 0.08;
  const chiado = lp * 0.012 + (ruido() > 0.9994 ? ruido() * 0.06 : 0);
  L[i] += chiado;
  R[i] += chiado;
}

// "Fita velha": passa-baixa suave em tudo, fade-in/out e limitador
let fl = 0;
let fr = 0;
for (let i = 0; i < N; i++) {
  const t = i / TAXA;
  fl += (L[i] - fl) * 0.45;
  fr += (R[i] - fr) * 0.45;
  const env = Math.min(1, t / 1.5) * Math.min(1, (DURACAO - t) / 2.5);
  L[i] = Math.tanh(fl * env * 1.1);
  R[i] = Math.tanh(fr * env * 1.1);
}

// Normaliza pelo volume MÉDIO (não pelo pico): a música sai num nível previsível
let soma = 0;
for (let i = 0; i < N; i++) soma += (L[i] ** 2 + R[i] ** 2) / 2;
const rmsAtual = Math.sqrt(soma / N);
const ALVO_RMS = 10 ** (-18 / 20);
const ganho = ALVO_RMS / rmsAtual;

// WAV 16 bits estéreo
const dados = Buffer.alloc(N * 4);
for (let i = 0; i < N; i++) {
  dados.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * ganho)) * 32767), i * 4);
  dados.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * ganho)) * 32767), i * 4 + 2);
}
const cab = Buffer.alloc(44);
cab.write("RIFF", 0);
cab.writeUInt32LE(36 + dados.length, 4);
cab.write("WAVEfmt ", 8);
cab.writeUInt32LE(16, 16);
cab.writeUInt16LE(1, 20);
cab.writeUInt16LE(2, 22);
cab.writeUInt32LE(TAXA, 24);
cab.writeUInt32LE(TAXA * 4, 28);
cab.writeUInt16LE(4, 32);
cab.writeUInt16LE(16, 34);
cab.write("data", 36);
cab.writeUInt32LE(dados.length, 40);
mkdirSync("public/musica", { recursive: true });
writeFileSync("out/musica-temp.wav", Buffer.concat([cab, dados]));
execSync("npx remotion ffmpeg -y -loglevel error -i out/musica-temp.wav -b:a 192k public/musica/musica-fundo.mp3", {
  stdio: "inherit",
});
console.log("Música gerada: public/musica/musica-fundo.mp3");
