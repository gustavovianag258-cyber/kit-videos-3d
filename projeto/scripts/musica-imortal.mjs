// Prepara a música do "Imortal": a mesma "Coffee or Tea" (Mixkit) dos vídeos aprovados, estendida
// para 106 s e numa segunda versão ABAFADA (passa-baixa ~700 Hz), as duas sincronizadas.
// O clima muda trocando o volume entre elas — nunca troca de música.
// A emenda para estender é feita onde a batida combina (correlação do envelope do som).
// Uso: node scripts/musica-imortal.mjs
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const ENT = "public/gravidade/sons/musica-coffee-or-tea.wav";
const PASTA = "public/imortal/sons";
const DURACAO = 106;

const buf = readFileSync(ENT);
let p = 12, fmt, dados;
while (p < buf.length) {
  const id = buf.toString("ascii", p, p + 4), n = buf.readUInt32LE(p + 4);
  if (id === "fmt ") fmt = p + 8;
  if (id === "data") { dados = [p + 8, n]; break; }
  p += 8 + n + (n & 1);
}
const SR = buf.readUInt32LE(fmt + 4), CH = buf.readUInt16LE(fmt + 2);
const N = dados[1] / 2 / CH;
const canais = Array.from({ length: CH }, (_, c) => {
  const x = new Float32Array(N);
  for (let i = 0; i < N; i++) x[i] = buf.readInt16LE(dados[0] + (i * CH + c) * 2) / 32768;
  return x;
});

// envelope (energia suavizada) a 441 Hz para achar a emenda
const PASSO = SR / 441;
const env = new Float32Array(Math.floor(N / PASSO));
for (let k = 0; k < env.length; k++) {
  let e = 0;
  for (let i = 0; i < PASSO; i++) e += Math.abs(canais[0][Math.floor(k * PASSO) + i] ?? 0);
  env[k] = e / PASSO;
}
const S = 94.0; // ponto do fim onde a emenda começa (a faixa original tem fade no fim)
const JAN = Math.floor(441 * 3);
const ks = Math.floor(S * 441);
let melhor = 0, melhorK = 0;
for (let k = Math.floor(30 * 441); k < Math.floor(70 * 441); k++) {
  let soma = 0, a2 = 0, b2 = 0;
  for (let j = 0; j < JAN; j++) {
    const a = env[ks + j], b = env[k + j];
    soma += a * b; a2 += a * a; b2 += b * b;
  }
  const r = soma / Math.sqrt(a2 * b2 + 1e-12);
  if (r > melhor) [melhor, melhorK] = [r, k];
}
let T = Math.floor((melhorK / 441) * SR);
// refina em ±15 ms pela forma de onda
const iS = Math.floor(S * SR);
let melhorR = -Infinity, ajuste = 0;
for (let d = -Math.floor(0.015 * SR); d <= Math.floor(0.015 * SR); d++) {
  let r = 0;
  for (let j = 0; j < 4096; j++) r += canais[0][iS + j] * canais[0][T + d + j];
  if (r > melhorR) [melhorR, ajuste] = [r, d];
}
T += ajuste;
console.log(`emenda: ${S.toFixed(2)} s → ${(T / SR).toFixed(3)} s (semelhança ${melhor.toFixed(3)})`);

// monta a versão longa com cruzamento de 1,2 s (potência constante)
const TOTAL = DURACAO * SR;
const F = Math.floor(1.2 * SR);
const longa = canais.map((x) => {
  const y = new Float32Array(TOTAL);
  for (let i = 0; i < TOTAL; i++) {
    if (i < iS) y[i] = x[i];
    else {
      const d = i - iS;
      const b = x[T + d] ?? 0;
      if (d < F) {
        const k = d / F;
        y[i] = x[i] * Math.cos((k * Math.PI) / 2) + b * Math.sin((k * Math.PI) / 2);
      } else y[i] = b;
    }
  }
  return y;
});

// passa-baixa 2ª ordem aplicada duas vezes (4ª ordem) para o som abafado, "de longe"
const passaBaixa = (x, f) => {
  const w = (2 * Math.PI * f) / SR, c = Math.cos(w), a = Math.sin(w) / (2 * 0.707), a0 = 1 + a;
  const b0 = (1 - c) / 2 / a0, b1 = (1 - c) / a0, a1 = (-2 * c) / a0, a2 = (1 - a) / a0;
  const y = new Float32Array(x.length);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < x.length; i++) {
    const v = b0 * x[i] + b1 * x1 + b0 * x2 - a1 * y1 - a2 * y2;
    x2 = x1; x1 = x[i]; y2 = y1; y1 = v; y[i] = v;
  }
  return y;
};
const abafada = longa.map((x) => passaBaixa(passaBaixa(x, 700), 700));

const salvar = (nome, cs) => {
  const n = cs[0].length;
  const out = Buffer.alloc(44 + n * CH * 2);
  out.write("RIFF", 0); out.writeUInt32LE(36 + n * CH * 2, 4); out.write("WAVEfmt ", 8); out.writeUInt32LE(16, 16);
  out.writeUInt16LE(1, 20); out.writeUInt16LE(CH, 22); out.writeUInt32LE(SR, 24); out.writeUInt32LE(SR * CH * 2, 28);
  out.writeUInt16LE(CH * 2, 32); out.writeUInt16LE(16, 34); out.write("data", 36); out.writeUInt32LE(n * CH * 2, 40);
  for (let i = 0; i < n; i++)
    for (let c = 0; c < CH; c++) out.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(cs[c][i] * 32767))), 44 + (i * CH + c) * 2);
  mkdirSync(PASTA, { recursive: true });
  writeFileSync(`${PASTA}/${nome}.wav`, out);
  console.log(`${nome}.wav  ${(n / SR).toFixed(1)} s`);
};
salvar("musica", longa);
salvar("musica-abafada", abafada);
