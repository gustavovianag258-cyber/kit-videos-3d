// Uso: node scripts/volume-final.mjs mix.wav saida.wav ganhoDb tetoDb   (ex.: ... 3 -1.8)
// Mostra em que segundos o limitador agiu: escolha o maior ganho em que ele só pega efeitos (estrondo, explosão), nunca a voz.
// Ganho linear + limitador de pico com antecipação (só age nos raros picos; não comprime a fala).
import { readFileSync, writeFileSync } from "node:fs";
const [, , ent, sai, ganhoDb, tetoDb] = process.argv;
const buf = readFileSync(ent);
let p = 12, fmt, d;
while (p < buf.length) { const id = buf.toString("ascii", p, p + 4), n = buf.readUInt32LE(p + 4); if (id === "fmt ") fmt = p + 8; if (id === "data") { d = [p + 8, n]; break; } p += 8 + n + (n & 1); }
const SR = buf.readUInt32LE(fmt + 4), CH = 2, N = d[1] / 4;
const g = 10 ** (Number(ganhoDb) / 20), teto = 10 ** (Number(tetoDb) / 20);
const L = new Float32Array(N), R = new Float32Array(N);
for (let i = 0; i < N; i++) { L[i] = buf.readInt16LE(d[0] + i * 4) / 32768 * g; R[i] = buf.readInt16LE(d[0] + i * 4 + 2) / 32768 * g; }
const ant = Math.round(SR * 0.005), rel = Math.exp(-1 / (SR * 0.12));
// ganho necessário por amostra, mínimo numa janela à frente, depois suavizado
const alvo = new Float32Array(N);
for (let i = 0; i < N; i++) { const pk = Math.max(Math.abs(L[i]), Math.abs(R[i])); alvo[i] = pk > teto ? teto / pk : 1; }
const min = new Float32Array(N); const fila = [];
for (let i = N - 1; i >= 0; i--) { // mínimo em [i, i+ant]
  while (fila.length && alvo[fila[fila.length - 1]] >= alvo[i]) fila.pop(); fila.push(i);
  while (fila[0] > i + ant) fila.shift(); min[i] = alvo[fila[0]];
}
let env = 1, reduz = 0; const zonas = new Set();
const out = Buffer.alloc(44 + N * 4);
for (let i = 0; i < N; i++) {
  const a = min[i]; env = a < env ? env + (a - env) * 0.25 : a + (env - a) * rel; if (env > a && a < 1) env = Math.min(env, a);
  if (env < 0.99) { reduz++; zonas.add(Math.floor(i / SR)); }
  out.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(L[i] * env * 32767))), 44 + i * 4);
  out.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(R[i] * env * 32767))), 46 + i * 4);
}
out.write("RIFF", 0); out.writeUInt32LE(36 + N * 4, 4); out.write("WAVEfmt ", 8); out.writeUInt32LE(16, 16); out.writeUInt16LE(1, 20); out.writeUInt16LE(2, 22);
out.writeUInt32LE(SR, 24); out.writeUInt32LE(SR * 4, 28); out.writeUInt16LE(4, 32); out.writeUInt16LE(16, 34); out.write("data", 36); out.writeUInt32LE(N * 4, 40);
writeFileSync(sai, out);
console.log(`limitador agiu em ${(100 * reduz / N).toFixed(2)}% do tempo; segundos: ${[...zonas].join(",")}`);
