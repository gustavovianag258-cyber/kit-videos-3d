// Uso: node scripts/suavizar-musica.mjs entrada.wav saida.wav segundos
// (entrada: WAV 16 bits, ex.: ffmpeg -i musica.mp3 -ar 44100 -ac 2 -c:a pcm_s16le musica.wav)
// Suaviza a música: corta os agudos (passa-baixa 2ª ordem, 4,5 kHz) para ela ficar "atrás" da voz e dos efeitos.
import { readFileSync, writeFileSync } from "node:fs";
const [, , ent, sai, segs] = process.argv;
const buf = readFileSync(ent);
let p = 12, fmt, dados;
while (p < buf.length) { const id = buf.toString("ascii", p, p + 4), n = buf.readUInt32LE(p + 4); if (id === "fmt ") fmt = p + 8; if (id === "data") { dados = [p + 8, n]; break; } p += 8 + n + (n & 1); }
const SR = buf.readUInt32LE(fmt + 4), CH = buf.readUInt16LE(fmt + 2);
const total = Math.min(dados[1] / 2 / CH, Math.round(Number(segs) * SR));
const w = 2 * Math.PI * 4500 / SR, c = Math.cos(w), a = Math.sin(w) / (2 * 0.707), a0 = 1 + a;
const b0 = (1 - c) / 2 / a0, b1 = (1 - c) / a0, a1 = -2 * c / a0, a2 = (1 - a) / a0;
const out = Buffer.alloc(44 + total * CH * 2);
for (let ch = 0; ch < CH; ch++) {
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < total; i++) {
    const x = buf.readInt16LE(dados[0] + (i * CH + ch) * 2) / 32768;
    const y = b0 * x + b1 * x1 + b0 * x2 - a1 * y1 - a2 * y2; x2 = x1; x1 = x; y2 = y1; y1 = y;
    const fade = Math.min(1, (total - i) / (SR * 2));
    out.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(y * fade * 32767))), 44 + (i * CH + ch) * 2);
  }
}
out.write("RIFF", 0); out.writeUInt32LE(36 + total * CH * 2, 4); out.write("WAVEfmt ", 8); out.writeUInt32LE(16, 16);
out.writeUInt16LE(1, 20); out.writeUInt16LE(CH, 22); out.writeUInt32LE(SR, 24); out.writeUInt32LE(SR * CH * 2, 28);
out.writeUInt16LE(CH * 2, 32); out.writeUInt16LE(16, 34); out.write("data", 36); out.writeUInt32LE(total * CH * 2, 40);
writeFileSync(sai, out);
