// Funções de síntese de som compartilhadas pelos scripts de efeitos (WAV 44,1 kHz estéreo, sem bibliotecas).
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export const SR = 44100;
// ---------- Utilidades ----------
export const semente = (s) => () => {
  s |= 0;
  s = (s + 0x6d2b79f5) | 0;
  let t = Math.imul(s ^ (s >>> 15), 1 | s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
export const midi = (n) => 440 * 2 ** ((n - 69) / 12);
export const clamp01 = (x) => Math.min(1, Math.max(0, x));
export const suave = (x) => {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
};

export const novo = (seg) => [new Float32Array(Math.ceil(seg * SR)), new Float32Array(Math.ceil(seg * SR))];

// Filtro biquad (fórmulas RBJ); dá para mudar a frequência no meio do som
export class Filtro {
  constructor(tipo, f, q = 0.707) {
    this.tipo = tipo;
    this.x1 = this.x2 = this.y1 = this.y2 = 0;
    this.ajustar(f, q);
  }
  ajustar(f, q = this.q) {
    this.q = q;
    const w = (2 * Math.PI * Math.min(f, SR * 0.45)) / SR;
    const cw = Math.cos(w);
    const a = Math.sin(w) / (2 * q);
    let b0, b1, b2;
    if (this.tipo === "lp") [b0, b1, b2] = [(1 - cw) / 2, 1 - cw, (1 - cw) / 2];
    else if (this.tipo === "hp") [b0, b1, b2] = [(1 + cw) / 2, -(1 + cw), (1 + cw) / 2];
    else [b0, b1, b2] = [a, 0, -a]; // passa-banda
    const a0 = 1 + a;
    this.b0 = b0 / a0;
    this.b1 = b1 / a0;
    this.b2 = b2 / a0;
    this.a1 = (-2 * cw) / a0;
    this.a2 = (1 - a) / a0;
  }
  p(x) {
    const y = this.b0 * x + this.b1 * this.x1 + this.b2 * this.x2 - this.a1 * this.y1 - this.a2 * this.y2;
    this.x2 = this.x1;
    this.x1 = x;
    this.y2 = this.y1;
    this.y1 = y;
    return y;
  }
}

// Reverb simples (estilo Freeverb): dá ar e espaço aos sons sintéticos
export const reverb = ([L, R], mistura = 0.25, tamanho = 0.84, abafa = 0.3) => {
  const combs = [1116, 1188, 1277, 1356, 1422, 1491];
  const alls = [556, 441, 341];
  const lado = (x, extra) => {
    const out = new Float32Array(x.length);
    const cs = combs.map((d) => ({ b: new Float32Array(d + extra), i: 0, f: 0 }));
    const as = alls.map((d) => ({ b: new Float32Array(d + extra), i: 0 }));
    for (let n = 0; n < x.length; n++) {
      let s = 0;
      for (const c of cs) {
        const y = c.b[c.i];
        c.f = y * (1 - abafa) + c.f * abafa;
        c.b[c.i] = x[n] * 0.015 + c.f * tamanho;
        c.i = (c.i + 1) % c.b.length;
        s += y;
      }
      for (const a of as) {
        const y = a.b[a.i];
        a.b[a.i] = s + y * 0.5;
        a.i = (a.i + 1) % a.b.length;
        s = y - s;
      }
      out[n] = x[n] * (1 - mistura) + s * mistura * 3;
    }
    return out;
  };
  return [lado(L, 0), lado(R, 23)];
};

export const normalizar = ([L, R], pico = 0.89) => {
  let m = 1e-9;
  for (let i = 0; i < L.length; i++) m = Math.max(m, Math.abs(L[i]), Math.abs(R[i]));
  const g = pico / m;
  for (let i = 0; i < L.length; i++) {
    L[i] *= g;
    R[i] *= g;
  }
  return [L, R];
};

// Começo e fim sem estalo
export const bordas = ([L, R], entra = 0.005, sai = 0.03) => {
  const ne = Math.floor(entra * SR);
  const ns = Math.floor(sai * SR);
  for (let i = 0; i < ne && i < L.length; i++) {
    L[i] *= i / ne;
    R[i] *= i / ne;
  }
  for (let i = 0; i < ns && i < L.length; i++) {
    const k = L.length - 1 - i;
    L[k] *= i / ns;
    R[k] *= i / ns;
  }
  return [L, R];
};

export const salvarEm = (pasta, nome, [L, R]) => {
  mkdirSync(pasta, { recursive: true });
  const n = L.length;
  const buf = Buffer.alloc(44 + n * 4);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + n * 4, 4);
  buf.write("WAVEfmt ", 8);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 4, 28);
  buf.writeUInt16LE(4, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) {
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i])) * 32767), 44 + i * 4);
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i])) * 32767), 46 + i * 4);
  }
  writeFileSync(join(pasta, `${nome}.wav`), buf);
  console.log(`${nome}.wav  ${(n / SR).toFixed(2)} s`);
};

// Ruído filtrado com frequência variando no tempo: base de whoosh, vento, riser
export const ruidoVarrido = (seg, { freq, q = 1, env, pan = () => 0, tipo = "bp", sem = 1 }) => {
  const [L, R] = novo(seg);
  const rnd = semente(sem);
  const f1 = new Filtro(tipo, freq(0), q);
  const f2 = new Filtro(tipo, freq(0), q);
  for (let i = 0; i < L.length; i++) {
    const t = i / SR;
    if (i % 16 === 0) {
      f1.ajustar(freq(t / seg));
      f2.ajustar(freq(t / seg) * 1.03);
    }
    const a = env(t / seg);
    const p = pan(t / seg);
    L[i] = f1.p(rnd() * 2 - 1) * a * Math.sqrt(0.5 * (1 - p));
    R[i] = f2.p(rnd() * 2 - 1) * a * Math.sqrt(0.5 * (1 + p));
  }
  return [L, R];
};

// ---------- Efeitos ----------
export const whoosh = (seg, sobe, sem) =>
  bordas(
    normalizar(
      reverb(
        ruidoVarrido(seg, {
          freq: (x) => (sobe ? 250 * 14 ** x : 3500 * (1 / 14) ** x),
          q: 1.4,
          env: (x) => Math.sin(Math.PI * x ** 0.8) ** 2,
          pan: (x) => (sobe ? -0.6 + 1.2 * x : 0.6 - 1.2 * x),
          sem,
        }),
        0.2,
      ),
      0.8,
    ),
  );
