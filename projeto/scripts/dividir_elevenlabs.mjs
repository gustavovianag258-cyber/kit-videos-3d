// Divide uma narração do ElevenLabs gravada DE UMA VEZ em uma fala por arquivo.
//
// Uso: node scripts/dividir_elevenlabs.mjs public/elevenlabs/narracao-completa.mp3
// Gera: public/elevenlabs/<id>.wav e public/elevenlabs/falas.json (mesmo formato da narração-guia)
// Depois: node scripts/montar_narracao_guia.mjs elevenlabs
//
// Como funciona (sem reconhecimento de voz):
//  1) acha os trechos com voz e as pausas entre eles;
//  2) distribui as 16 falas pelos trechos, comparando a duração de cada fala com a
//     duração que ela teve na narração-guia (public/narracao-guia/falas.json);
//  3) o tempo de cada palavra vem da narração-guia, esticado para o trecho certo.
import { execSync } from "node:child_process";
import { readFileSync, rmSync, writeFileSync } from "node:fs";

const ENTRADA = process.argv[2] ?? "public/elevenlabs/narracao-completa.mp3";
const PASTA = "public/elevenlabs";
const guia = JSON.parse(readFileSync("public/narracao-guia/falas.json", "utf-8")).falas;

// 1) Volume a cada 10 ms
const TAXA = 16000;
const WAV = "out/elevenlabs-temp.wav";
execSync(`npx remotion ffmpeg -y -loglevel error -i "${ENTRADA}" -ac 1 -ar ${TAXA} -c:a pcm_s16le ${WAV}`, { stdio: "inherit" });
const wav = readFileSync(WAV);
rmSync(WAV);
let pos = 12;
while (wav.toString("ascii", pos, pos + 4) !== "data") pos += 8 + wav.readUInt32LE(pos + 4);
const dados = wav.subarray(pos + 8, pos + 8 + wav.readUInt32LE(pos + 4));
const amostras = new Int16Array(dados.buffer, dados.byteOffset, Math.floor(dados.length / 2));
const JANELA = TAXA / 100;
const rms = [];
for (let i = 0; i + JANELA <= amostras.length; i += JANELA) {
  let s = 0;
  for (let k = 0; k < JANELA; k++) s += (amostras[i + k] / 32768) ** 2;
  rms.push(Math.sqrt(s / JANELA));
}
const pico = Math.max(...rms);
const temVoz = rms.map((v) => 20 * Math.log10(v / pico + 1e-9) > -38);

// Trechos com voz (pausas menores que 120 ms não contam)
const trechos = [];
let ini = -1;
temVoz.forEach((v, i) => {
  if (v && ini < 0) ini = i;
  if (!v && ini >= 0) {
    trechos.push([ini / 100, i / 100]);
    ini = -1;
  }
});
if (ini >= 0) trechos.push([ini / 100, temVoz.length / 100]);
const T = [];
for (const t of trechos) {
  if (T.length && t[0] - T[T.length - 1][1] < 0.12) T[T.length - 1][1] = t[1];
  else T.push([...t]);
}

// 2) Distribuição das falas pelos trechos (programação dinâmica): cada fala ocupa trechos
//    seguidos; o custo é a diferença de duração (em escala log) menos um bônus por pausa longa.
const esperado = guia.map((f) => f.palavras.at(-1).fim - f.palavras[0].inicio);
const N = T.length;
const L = guia.length;
let melhor = null;
for (let escala = 0.6; escala <= 1.2; escala += 0.01) {
  const C = Array.from({ length: L + 1 }, () => Array(N + 1).fill(Infinity));
  const B = Array.from({ length: L + 1 }, () => Array(N + 1).fill(-1));
  C[0][0] = 0;
  for (let i = 1; i <= L; i++)
    for (let j = 1; j <= N; j++)
      for (let k = i - 1; k < j; k++) {
        if (C[i - 1][k] === Infinity) continue;
        const dur = T[j - 1][1] - T[k][0];
        const pausa = k > 0 ? T[k][0] - T[k - 1][1] : 0.3;
        const c = C[i - 1][k] + 10 * Math.log(dur / (esperado[i - 1] * escala)) ** 2 - 2 * pausa;
        if (c < C[i][j]) {
          C[i][j] = c;
          B[i][j] = k;
        }
      }
  if (!melhor || C[L][N] < melhor.custo) melhor = { custo: C[L][N], escala, B };
}
const grupos = [];
for (let i = L, j = N; i > 0; i--) {
  const k = melhor.B[i][j];
  grupos.unshift(T.slice(k, j));
  j = k;
}

// 3) Corta cada fala (com 20–40 ms de fade para não ter "clique") e estica os tempos das palavras
const r3 = (n) => Math.round(n * 1000) / 1000;
const TAXA_SAIDA = 44100;
const WAV_ALTO = "out/elevenlabs-temp-44k.wav";
execSync(`npx remotion ffmpeg -y -loglevel error -i "${ENTRADA}" -ac 1 -ar ${TAXA_SAIDA} -c:a pcm_s16le ${WAV_ALTO}`, { stdio: "inherit" });
const wavAlto = readFileSync(WAV_ALTO);
rmSync(WAV_ALTO);
let posAlto = 12;
while (wavAlto.toString("ascii", posAlto, posAlto + 4) !== "data") posAlto += 8 + wavAlto.readUInt32LE(posAlto + 4);
const voz = new Int16Array(
  wavAlto.buffer,
  wavAlto.byteOffset + posAlto + 8,
  Math.floor(wavAlto.readUInt32LE(posAlto + 4) / 2),
);
const salvarTrecho = (arquivo, ini, fim) => {
  const a = Math.round(ini * TAXA_SAIDA);
  const n = Math.round(fim * TAXA_SAIDA) - a;
  const entra = Math.round(0.02 * TAXA_SAIDA);
  const sai = Math.round(0.04 * TAXA_SAIDA);
  const dados = Buffer.alloc(n * 2);
  for (let i = 0; i < n; i++) {
    const g = Math.min(1, i / entra, (n - 1 - i) / sai);
    dados.writeInt16LE(Math.round((voz[a + i] ?? 0) * g), i * 2);
  }
  const cab = Buffer.alloc(44);
  cab.write("RIFF", 0);
  cab.writeUInt32LE(36 + dados.length, 4);
  cab.write("WAVEfmt ", 8);
  cab.writeUInt32LE(16, 16);
  cab.writeUInt16LE(1, 20);
  cab.writeUInt16LE(1, 22);
  cab.writeUInt32LE(TAXA_SAIDA, 24);
  cab.writeUInt32LE(TAXA_SAIDA * 2, 28);
  cab.writeUInt16LE(2, 32);
  cab.writeUInt16LE(16, 34);
  cab.write("data", 36);
  cab.writeUInt32LE(dados.length, 40);
  writeFileSync(arquivo, Buffer.concat([cab, dados]));
};
const falas = guia.map((g, i) => {
  const pedacos = grupos[i];
  const anterior = grupos[i - 1]?.at(-1)[1] ?? 0;
  const proximo = grupos[i + 1]?.[0][0] ?? temVoz.length / 100;
  const corteIni = Math.max(0, pedacos[0][0] - Math.min(0.08, (pedacos[0][0] - anterior) / 2));
  const corteFim = pedacos.at(-1)[1] + Math.min(0.12, (proximo - pedacos.at(-1)[1]) / 2);
  salvarTrecho(`${PASTA}/${g.id}.wav`, corteIni, corteFim);
  // Na guia, palavras separadas por pausa formam "blocos"; se o número de blocos for igual
  // ao de trechos nesta fala, cada bloco é esticado no seu trecho. Senão, a fala inteira de uma vez.
  const blocos = [[g.palavras[0]]];
  for (let k = 1; k < g.palavras.length; k++) {
    if (g.palavras[k].inicio - g.palavras[k - 1].fim > 0.15) blocos.push([]);
    blocos.at(-1).push(g.palavras[k]);
  }
  const pares = blocos.length === pedacos.length
    ? blocos.map((b, k) => [b, pedacos[k]])
    : [[g.palavras, [pedacos[0][0], pedacos.at(-1)[1]]]];
  const palavras = pares.flatMap(([b, [a, z]]) => {
    const gi = b[0].inicio;
    const gf = b.at(-1).fim;
    const m = (t) => r3(a + ((t - gi) / (gf - gi)) * (z - a) - corteIni);
    return b.map((p) => ({ texto: p.texto, inicio: m(p.inicio), fim: m(p.fim) }));
  });
  console.log(
    `${g.id}: ${pedacos[0][0].toFixed(2)}–${pedacos.at(-1)[1].toFixed(2)}s (${(pedacos.at(-1)[1] - pedacos[0][0]).toFixed(2)}s, ${pedacos.length} trecho(s))  ${g.texto}`,
  );
  // "origem": onde este arquivo começa na gravação original (para manter as pausas naturais)
  return { id: g.id, texto: g.texto, arquivo: `${g.id}.wav`, origem: r3(corteIni), palavras };
});
writeFileSync(`${PASTA}/falas.json`, JSON.stringify({ falas }, null, 2));
console.log(`Escala em relação à guia: ${melhor.escala.toFixed(2)}`);
