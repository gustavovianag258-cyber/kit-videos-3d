// Monta a faixa de vozes do vídeo "Imortal" (narrador + Ícaro + alien).
// A narração V2 é UMA geração inteira (soa mais humana que frase por frase); aqui ela é cortada entre as
// frases, no ponto mais silencioso perto do fim de cada frase, para encaixar as falas do Ícaro, do alien
// e os respiros do roteiro.
//
// Uso: node scripts/montar-imortal.mjs t1|t2
//   → public/imortal/vozes-v2-<take>.wav e src/imortal/vozes-v2-<take>.json
import { execSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";

const TAXA = 44100;
const PASTA = "public/imortal/takes-v2";
const TAKE = process.argv[2] ?? "t1";

// Fim da última palavra e início da próxima em cada troca de frase (alinhamento do Scribe, em segundos do take)
const FRONTEIRAS = {
  t1: [[3.52, 3.68], [13.6, 13.68], [16.891, 16.96], [22.893, 22.96], [33.533, 33.6], [39.693, 39.76], [49.851, 49.92], [54.28, 54.32], [63.867, 63.973], [71.14, 71.16]],
  t2: [[3.48, 3.68], [13.707, 13.733], [17.24, 17.28], [23.4, 23.44], [34.354, 34.389], [40.413, 40.48], [50.75, 50.93], [55.16, 55.2], [64.747, 64.853], [72.26, 72.28]],
};

// Ordem do vídeo: [o que toca, respiro depois (s)]. "n<i>" = frase i da narração (entre as fronteiras i-1 e i).
const SEQUENCIA = [
  ["n0", 0.7], // E se você acordasse amanhã… e não pudesse mais morrer?
  ["n1", 0.15], // Você não acredita… Sem paraquedas.
  [["icaro-ai-t1", 0, 2.0, "icaro"], 0.2], // (gemido) Aaai!
  ["n2", 0.15], // Doeu. Muito. Mas você continua aqui.
  [["icaro-ai-t1", 2.45, 6.0, "icaro"], 0.6], // (ofegante, risada fraca) …Ainda tô aqui.
  ["n3", 0.6], // Dez anos depois…
  ["n4", 0.7], // Aí os filhos envelhecem… Já cansou de bolo.
  ["n5", 0.3], // Passam séculos… Nada.
  [["alien-t1", 0, 1.3, "alien"], 0.25], // Por que ele não morre?
  [["icaro-parceiro-t1", 0, 3.4, "icaro"], 0.6], // (suspiro) Ah… já tentei de tudo, parceiro.
  ["n6", 4.0], // Um dia… Você não.   → 4 s de silêncio (cena 7)
  ["n7", 0.8], // Passam trilhões de anos…
  ["n8", 1.5], // Escuro total… infinito.  → respiro no ∞
  ["n9", 0.8], // (expira) Na vida real…
  ["n10", 0], // Qual vai ser o próximo "E se"?
];
const INICIO = 0.3;
const CARTAZ_FINAL = 3.6; // segundos de cartaz depois da última fala

const lerWav = (mp3) => {
  const tmp = "out/imortal-tmp.wav";
  execSync(`npx remotion ffmpeg -y -loglevel error -i ${mp3} -ac 1 -ar ${TAXA} -c:a pcm_s16le ${tmp}`);
  const wav = readFileSync(tmp);
  rmSync(tmp);
  let pos = 12;
  while (wav.toString("ascii", pos, pos + 4) !== "data") pos += 8 + wav.readUInt32LE(pos + 4);
  const dados = wav.subarray(pos + 8, pos + 8 + wav.readUInt32LE(pos + 4));
  const i16 = new Int16Array(dados.buffer, dados.byteOffset, Math.floor(dados.length / 2));
  return Float32Array.from(i16, (v) => v / 32768);
};

// Ponto mais silencioso (janela de 15 ms) entre o fim de uma palavra e o começo da outra, com folga
// porque os tempos do Scribe ficam ~0,05–0,1 s fora do áudio real
const pontoDeCorte = (x, [fim, ini]) => {
  const jan = Math.floor(0.015 * TAXA);
  const de = Math.floor((fim - 0.06) * TAXA);
  const ate = Math.floor((ini + 0.22) * TAXA);
  let melhor = de;
  let menor = Infinity;
  for (let i = de; i + jan < ate; i += Math.floor(jan / 3)) {
    let e = 0;
    for (let k = i; k < i + jan; k++) e += x[k] * x[k];
    if (e < menor) [menor, melhor] = [e, i + Math.floor(jan / 2)];
  }
  return melhor / TAXA;
};

// Voz de alien: mais grave e lenta (reamostra), um pouco metálica (modulação em anel) e com eco curto
const alienizar = (x) => {
  const fator = 0.84;
  const n = Math.floor(x.length / fator);
  const y = new Float32Array(n + Math.floor(0.24 * TAXA));
  for (let i = 0; i < n; i++) {
    const p = i * fator;
    const k = Math.floor(p);
    const s = (x[k] ?? 0) + ((x[k + 1] ?? 0) - (x[k] ?? 0)) * (p - k);
    y[i] = s * 0.6 + s * Math.sin((2 * Math.PI * 58 * i) / TAXA) * 0.55;
  }
  const atraso = Math.floor(0.11 * TAXA);
  for (let i = atraso; i < y.length; i++) y[i] += y[i - atraso] * 0.32;
  return y;
};

// 20 ms de rampa nas pontas: quando o corte pega o fim de uma respiração, ela some sem estalo
const rampas = (x) => {
  const r = Math.min(Math.floor(0.02 * TAXA), Math.floor(x.length / 2));
  for (let i = 0; i < r; i++) {
    x[i] *= i / r;
    x[x.length - 1 - i] *= i / r;
  }
  return x;
};

mkdirSync("out", { recursive: true });
const narr = lerWav(`${PASTA}/narracao-${TAKE}.mp3`);
const cortes = [0, ...FRONTEIRAS[TAKE].map((f) => pontoDeCorte(narr, f)), narr.length / TAXA];
const cache = {};
const pecas = [];
let t = INICIO;
for (const [item, respiro] of SEQUENCIA) {
  let audio, info;
  if (typeof item === "string") {
    const i = Number(item.slice(1));
    const [de, ate] = [cortes[i], cortes[i + 1]];
    audio = rampas(Float32Array.from(narr.subarray(Math.floor(de * TAXA), Math.floor(ate * TAXA))));
    info = { voz: "narrador", frase: i, de: +de.toFixed(3), ate: +ate.toFixed(3) };
  } else {
    const [arq, de, ate, voz] = item;
    const pasta = arq.startsWith("alien") ? "public/imortal/takes" : PASTA;
    cache[arq] ??= lerWav(`${pasta}/${arq}.mp3`);
    audio = rampas(Float32Array.from(cache[arq].subarray(Math.floor(de * TAXA), Math.floor(ate * TAXA))));
    if (voz === "alien") audio = alienizar(audio);
    info = { voz, arquivo: arq, de, ate };
  }
  pecas.push({ ...info, inicio: +t.toFixed(3), fim: +(t + audio.length / TAXA).toFixed(3), audio });
  t += audio.length / TAXA + respiro;
}
const duracao = Math.ceil(t + CARTAZ_FINAL);
const mix = new Float32Array(duracao * TAXA);
for (const p of pecas) {
  const ini = Math.floor(p.inicio * TAXA);
  for (let i = 0; i < p.audio.length; i++) mix[ini + i] += p.audio[i];
}

const buf = Buffer.alloc(44 + mix.length * 2);
buf.write("RIFF", 0);
buf.writeUInt32LE(36 + mix.length * 2, 4);
buf.write("WAVEfmt ", 8);
buf.writeUInt32LE(16, 16);
buf.writeUInt16LE(1, 20);
buf.writeUInt16LE(1, 22);
buf.writeUInt32LE(TAXA, 24);
buf.writeUInt32LE(TAXA * 2, 28);
buf.writeUInt16LE(2, 32);
buf.writeUInt16LE(16, 34);
buf.write("data", 36);
buf.writeUInt32LE(mix.length * 2, 40);
for (let i = 0; i < mix.length; i++) buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, mix[i])) * 32767), 44 + i * 2);
writeFileSync(`public/imortal/vozes-v2-${TAKE}.wav`, buf);
mkdirSync("src/imortal", { recursive: true });
writeFileSync(
  `src/imortal/vozes-v2-${TAKE}.json`,
  JSON.stringify({ take: TAKE, duracao, pecas: pecas.map(({ audio, ...p }) => p) }, null, 1),
);
for (const p of pecas) console.log(`${p.inicio.toFixed(2).padStart(6)} → ${p.fim.toFixed(2).padStart(6)}  ${p.voz.padEnd(9)} ${p.arquivo ?? "frase " + p.frase}`);
console.log(`duração ${duracao} s`);
