// Sintetiza os efeitos sonoros do vídeo (sem arquivos de terceiros, sem licença a respeitar).
// Uso: node scripts/gerar_sfx.mjs
// Gera: public/sfx/whoosh.wav e public/sfx/x.wav (44,1 kHz, mono, 16 bits)
import { mkdirSync, writeFileSync } from "node:fs";

const TAXA = 44100;

const salvarWav = (caminho, amostras) => {
  const pico = Math.max(...amostras.map(Math.abs)) || 1;
  const ganho = 0.7 / pico; // normaliza com folga (~ -3 dB)
  const dados = Buffer.alloc(amostras.length * 2);
  amostras.forEach((v, i) => dados.writeInt16LE(Math.round(v * ganho * 32767), i * 2));
  const cab = Buffer.alloc(44);
  cab.write("RIFF", 0);
  cab.writeUInt32LE(36 + dados.length, 4);
  cab.write("WAVE", 8);
  cab.write("fmt ", 12);
  cab.writeUInt32LE(16, 16);
  cab.writeUInt16LE(1, 20); // PCM
  cab.writeUInt16LE(1, 22); // mono
  cab.writeUInt32LE(TAXA, 24);
  cab.writeUInt32LE(TAXA * 2, 28);
  cab.writeUInt16LE(2, 32);
  cab.writeUInt16LE(16, 34);
  cab.write("data", 36);
  cab.writeUInt32LE(dados.length, 40);
  writeFileSync(caminho, Buffer.concat([cab, dados]));
};

// Ruído determinístico (gerador congruente linear com semente fixa)
let semente = 12345;
const ruido = () => {
  semente = (semente * 1664525 + 1013904223) >>> 0;
  return semente / 2 ** 31 - 1;
};

// Filtro passa-banda (biquad) com frequência que muda ao longo do tempo
const passaBanda = (entrada, freqEm, q) => {
  const saida = new Array(entrada.length).fill(0);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < entrada.length; i++) {
    const w = (2 * Math.PI * freqEm(i / TAXA)) / TAXA;
    const alfa = Math.sin(w) / (2 * q);
    const a0 = 1 + alfa;
    const b0 = alfa / a0, b2 = -alfa / a0;
    const a1 = (-2 * Math.cos(w)) / a0, a2 = (1 - alfa) / a0;
    const y = b0 * entrada[i] + b2 * x2 - a1 * y1 - a2 * y2;
    x2 = x1; x1 = entrada[i]; y2 = y1; y1 = y;
    saida[i] = y;
  }
  return saida;
};

// WHOOSH: ruído com a frequência central subindo e descendo, volume em "sino"
{
  const dur = 1.1;
  const n = Math.round(dur * TAXA);
  const base = Array.from({ length: n }, ruido);
  const filtrado = passaBanda(base, (t) => 250 + 2300 * Math.sin(Math.PI * Math.min(1, t / dur)) ** 1.5, 1.4);
  const som = filtrado.map((v, i) => {
    const t = i / n;
    const env = Math.sin(Math.PI * Math.pow(t, 0.8)) ** 2;
    return v * env;
  });
  mkdirSync("public/sfx", { recursive: true });
  salvarWav("public/sfx/whoosh.wav", som);
}

// X: impacto grave (seno com queda de afinação) + zumbido de "erro" + estalo inicial
{
  const dur = 0.65;
  const n = Math.round(dur * TAXA);
  let fase = 0;
  let lp = 0;
  const som = Array.from({ length: n }, (_, i) => {
    const t = i / TAXA;
    const freq = 45 + 50 * Math.exp(-t * 18);
    fase += (2 * Math.PI * freq) / TAXA;
    const impacto = Math.sin(fase) * Math.exp(-t * 7);
    const quadrada = (f) => (Math.sin(2 * Math.PI * f * t) >= 0 ? 1 : -1);
    const zumbidoBruto = (quadrada(196) + quadrada(208)) * 0.5 * Math.exp(-t * 5.5) * Math.min(1, t / 0.01);
    lp += 0.18 * (zumbidoBruto - lp); // suaviza o zumbido (passa-baixa simples)
    const estalo = t < 0.012 ? ruido() * (1 - t / 0.012) : 0;
    return impacto * 1.0 + lp * 0.35 + estalo * 0.5;
  });
  salvarWav("public/sfx/x.wav", som);
}

console.log("Gerados: public/sfx/whoosh.wav, public/sfx/x.wav");
