// Gera os efeitos sonoros de "E se a gravidade caísse pela metade?" (a música é uma faixa pronta do Mixkit).
// Tudo é sintetizado aqui (sem bibliotecas), em WAV 44,1 kHz estéreo, em public/gravidade/sons/.
// Rodar: node scripts/sons-gravidade.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SR = 44100;
const PASTA = join(import.meta.dirname, "..", "public", "gravidade", "sons");
mkdirSync(PASTA, { recursive: true });

// ---------- Utilidades ----------
const semente = (s) => () => {
  s |= 0;
  s = (s + 0x6d2b79f5) | 0;
  let t = Math.imul(s ^ (s >>> 15), 1 | s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const midi = (n) => 440 * 2 ** ((n - 69) / 12);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const suave = (x) => {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
};

const novo = (seg) => [new Float32Array(Math.ceil(seg * SR)), new Float32Array(Math.ceil(seg * SR))];

// Filtro biquad (fórmulas RBJ); dá para mudar a frequência no meio do som
class Filtro {
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
const reverb = ([L, R], mistura = 0.25, tamanho = 0.84, abafa = 0.3) => {
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

const normalizar = ([L, R], pico = 0.89) => {
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
const bordas = ([L, R], entra = 0.005, sai = 0.03) => {
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

const salvar = (nome, [L, R]) => {
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
  writeFileSync(join(PASTA, `${nome}.wav`), buf);
  console.log(`${nome}.wav  ${(n / SR).toFixed(2)} s`);
};

// Ruído filtrado com frequência variando no tempo: base de whoosh, vento, riser
const ruidoVarrido = (seg, { freq, q = 1, env, pan = () => 0, tipo = "bp", sem = 1 }) => {
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
const whoosh = (seg, sobe, sem) =>
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

// A gravidade "despenca": tom grave descendo + ruído caindo + golpe no fim
const quedaGravidade = () => {
  const seg = 2.2;
  const ar = ruidoVarrido(seg, {
    freq: (x) => 2600 * (1 / 30) ** x,
    q: 1.2,
    env: (x) => (x < 0.12 ? (x / 0.12) ** 2 : Math.exp(-(x - 0.12) * 4)),
    sem: 7,
  });
  let fase = 0;
  for (let i = 0; i < ar[0].length; i++) {
    const t = i / SR;
    const f = 40 + 140 * Math.exp(-t * 2.2);
    fase += (2 * Math.PI * f) / SR;
    const a = t < 0.25 ? (t / 0.25) ** 2 : Math.exp(-(t - 0.25) * 1.6);
    const v = Math.tanh(Math.sin(fase) * 1.8) * a * 0.9;
    ar[0][i] = ar[0][i] * 0.55 + v;
    ar[1][i] = ar[1][i] * 0.55 + v;
  }
  return bordas(normalizar(reverb(ar, 0.25), 0.9), 0.01, 0.2);
};

// Golpe grave (Terra soltando, título)
const impacto = (seg, f0, sem) => {
  const [L, R] = novo(seg);
  const rnd = semente(sem);
  const lp = new Filtro("lp", 900);
  let fase = 0;
  for (let i = 0; i < L.length; i++) {
    const t = i / SR;
    const f = f0 + f0 * 1.6 * Math.exp(-t * 9);
    fase += (2 * Math.PI * f) / SR;
    const v = Math.sin(fase) * Math.exp(-t * (3 / seg)) + lp.p(rnd() * 2 - 1) * Math.exp(-t * 14) * 0.7;
    L[i] = R[i] = Math.tanh(v * 1.3);
  }
  return bordas(normalizar(reverb([L, R], 0.3, 0.86), 0.9), 0.002, 0.3);
};

// Subida de tensão que termina num ponto exato
const riser = (seg, sem) => {
  const r = ruidoVarrido(seg, {
    freq: (x) => 200 * 30 ** (x ** 1.5),
    q: 2,
    env: (x) => x ** 2.2,
    pan: (x) => Math.sin(x * 20) * 0.3 * x,
    sem,
  });
  let fase = 0;
  for (let i = 0; i < r[0].length; i++) {
    const x = i / r[0].length;
    fase += (2 * Math.PI * (180 * 4 ** (x ** 1.4))) / SR;
    const v = Math.sin(fase) * 0.25 * x ** 2;
    r[0][i] += v;
    r[1][i] += v;
  }
  return bordas(normalizar(reverb(r, 0.2), 0.85), 0.05, 0.01);
};

// Tique-taque de relógio
const tique = (f, sem) => {
  const [L, R] = novo(0.12);
  const rnd = semente(sem);
  const hp = new Filtro("hp", 2500);
  for (let i = 0; i < L.length; i++) {
    const t = i / SR;
    const v = hp.p(rnd() * 2 - 1) * Math.exp(-t * 400) + Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 90) * 0.6;
    L[i] = R[i] = v;
  }
  return bordas(normalizar(reverb([L, R], 0.15), 0.8), 0.0005);
};

// Sino suave (meio-dia, gravidade de volta)
const sino = (notas, seg, intervalo = 0) => {
  const [L, R] = novo(seg);
  const parciais = [
    [1, 1, 1.6],
    [2.0, 0.45, 2.4],
    [2.76, 0.3, 3.2],
    [5.4, 0.12, 5],
    [8.93, 0.05, 7],
  ];
  notas.forEach((n, k) => {
    const t0 = k * intervalo;
    const f = midi(n);
    for (let i = Math.floor(t0 * SR); i < L.length; i++) {
      const t = i / SR - t0;
      let v = 0;
      for (const [m, a, d] of parciais) v += Math.sin(2 * Math.PI * f * m * t) * a * Math.exp(-t * d);
      v *= Math.min(1, t / 0.004);
      L[i] += v * (k % 2 ? 0.8 : 1);
      R[i] += v * (k % 2 ? 1 : 0.8);
    }
  });
  return bordas(normalizar(reverb([L, R], 0.35, 0.86), 0.8), 0.001, 0.2);
};

// "Plop" curto (cartões, marcas no chão)
const pop = (f0, f1, sem) => {
  const [L, R] = novo(0.25);
  let fase = 0;
  for (let i = 0; i < L.length; i++) {
    const t = i / SR;
    fase += (2 * Math.PI * (f0 + (f1 - f0) * Math.min(1, t / 0.05))) / SR;
    L[i] = R[i] = Math.sin(fase) * Math.exp(-t * 32) * Math.min(1, t / 0.002);
  }
  return bordas(normalizar(reverb([L, R], 0.2), 0.75), 0.001);
};

// Motor de carro chegando, passando e indo embora (com efeito Doppler)
const motor = () => {
  const seg = 6;
  const passa = 3.2;
  const [L, R] = novo(seg);
  const rnd = semente(21);
  const lp = new Filtro("lp", 700, 0.9);
  const lp2 = new Filtro("lp", 700, 0.9);
  let fase = 0;
  for (let i = 0; i < L.length; i++) {
    const t = i / SR;
    const d = t - passa;
    const dist = Math.hypot(d * 9, 2);
    const doppler = 1 + 0.06 * Math.tanh(-d * 2);
    const f = 62 * doppler * (t < 1 ? 1 : 1 - 0.15 * clamp01((t - 1) / 3)); // freando: rotação cai
    fase += (2 * Math.PI * f) / SR;
    if (i % 32 === 0) {
      lp.ajustar(500 + 2500 / dist);
      lp2.ajustar(500 + 2500 / dist);
    }
    const bruto = Math.sign(Math.sin(fase)) * 0.5 + Math.sin(fase * 2) * 0.4 + (rnd() * 2 - 1) * 0.3;
    const a = 1 / (0.25 + dist * 0.18);
    const p = Math.tanh(-d * 1.5) * 0.7;
    L[i] = lp.p(bruto) * a * Math.sqrt(0.5 * (1 - p));
    R[i] = lp2.p(bruto) * a * Math.sqrt(0.5 * (1 + p));
  }
  return bordas(normalizar([L, R], 0.8), 0.6, 0.6);
};

// Pneu cantando: faixas estreitas de ruído com "tremido"
const pneu = () => {
  const seg = 4.8;
  const [L, R] = novo(seg);
  const rnd = semente(33);
  const bandas = [1150, 2280, 3400].map((f) => [new Filtro("bp", f, 18), new Filtro("bp", f * 1.01, 18), f]);
  for (let i = 0; i < L.length; i++) {
    const t = i / SR;
    const x = t / seg;
    if (i % 32 === 0)
      bandas.forEach(([a, b, f], k) => {
        const trem = 1 + 0.025 * Math.sin(t * 37 + k) + 0.015 * (rnd() - 0.5) - 0.06 * x;
        a.ajustar(f * trem, 18);
        b.ajustar(f * trem * 1.01, 18);
      });
    const env = Math.min(1, t / 0.15) * (x < 0.8 ? 1 : 1 - (x - 0.8) / 0.2) * (0.75 + 0.25 * Math.sin(t * 13));
    let l = 0;
    let r = 0;
    bandas.forEach(([a, b], k) => {
      const n = rnd() * 2 - 1;
      l += a.p(n) / (k + 1);
      r += b.p(n) / (k + 1);
    });
    L[i] = l * env;
    R[i] = r * env;
  }
  return bordas(normalizar(reverb([L, R], 0.25), 0.8), 0.05, 0.1);
};

const buzina = () => {
  const [L, R] = novo(0.7);
  const lp = new Filtro("lp", 2200);
  for (let i = 0; i < L.length; i++) {
    const t = i / SR;
    const q = (f) => (Math.sin(2 * Math.PI * f * t) > 0 ? 1 : -1);
    const env = Math.min(1, t / 0.02) * (t < 0.5 ? 1 : Math.max(0, 1 - (t - 0.5) / 0.15));
    L[i] = R[i] = lp.p(q(415) * 0.5 + q(523) * 0.5) * env;
  }
  return bordas(normalizar(reverb([L, R], 0.25), 0.7));
};

// Vento (camadas de ruído com rajadas lentas). "assobio" deixa ele gelado e fino
const vento = (seg, assobio, sem) => {
  const rnd = semente(sem);
  const [L, R] = novo(seg);
  const fL = new Filtro("bp", 400, assobio ? 6 : 0.8);
  const fR = new Filtro("bp", 400, assobio ? 6 : 0.8);
  const lento = (t, k) => 0.5 + 0.3 * Math.sin(t * 0.7 + k) + 0.2 * Math.sin(t * 1.9 + 2 * k);
  for (let i = 0; i < L.length; i++) {
    const t = i / SR;
    if (i % 32 === 0) {
      const base = assobio ? 700 + 500 * lento(t, 1) : 250 + 500 * lento(t, 3);
      fL.ajustar(base);
      fR.ajustar(base * 1.07);
    }
    L[i] = fL.p(rnd() * 2 - 1) * lento(t, 0.5);
    R[i] = fR.p(rnd() * 2 - 1) * lento(t, 1.7);
  }
  // Ponta e fim iguais para poder repetir sem emenda aparente
  return bordas(normalizar([L, R], 0.8), 0.4, 0.4);
};

// Coração acelerado (ar ralo)
const coracao = (seg, bpm) => {
  const [L, R] = novo(seg);
  const batida = 60 / bpm;
  for (let i = 0; i < L.length; i++) {
    const t = i / SR;
    const k = t % batida;
    const golpe = (u) => (u < 0 ? 0 : Math.sin(2 * Math.PI * 52 * u) * Math.exp(-u * 22));
    L[i] = R[i] = golpe(k) + 0.7 * golpe(k - 0.18);
  }
  return bordas(normalizar([L, R], 0.8), 0.2, 0.3);
};

// Água fervendo: bolhas (tons curtos que sobem) + chiado grave
const fervura = (seg) => {
  const rnd = semente(55);
  const [L, R] = novo(seg);
  const chiado = new Filtro("lp", 500);
  for (let i = 0; i < L.length; i++) L[i] = R[i] = chiado.p(rnd() * 2 - 1) * 0.25;
  for (let b = 0; b < seg * 45; b++) {
    const t0 = rnd() * seg;
    const f = 300 + rnd() * 700;
    const d = 0.02 + rnd() * 0.04;
    const p = rnd() * 2 - 1;
    let fase = 0;
    for (let i = Math.floor(t0 * SR); i < Math.min(L.length, (t0 + d * 3) * SR); i++) {
      const t = i / SR - t0;
      fase += (2 * Math.PI * f * (1 + t / d)) / SR;
      const v = Math.sin(fase) * Math.exp(-t / d) * 0.5;
      L[i] += v * (1 - p) * 0.5;
      R[i] += v * (1 + p) * 0.5;
    }
  }
  return bordas(normalizar(reverb([L, R], 0.2), 0.8), 0.3, 0.3);
};

// Estalos de gelo se formando
const gelo = (seg) => {
  const rnd = semente(77);
  const [L, R] = novo(seg);
  for (let c = 0; c < seg * 30; c++) {
    const t0 = rnd() * seg;
    const bp = new Filtro("bp", 2500 + rnd() * 5000, 3);
    const a = 0.3 + rnd() * 0.7;
    const p = rnd() * 2 - 1;
    for (let i = Math.floor(t0 * SR); i < Math.min(L.length, (t0 + 0.03) * SR); i++) {
      const t = i / SR - t0;
      const v = bp.p(rnd() * 2 - 1) * Math.exp(-t * 250) * a;
      L[i] += v * (1 - p) * 0.5;
      R[i] += v * (1 + p) * 0.5;
    }
  }
  return bordas(normalizar(reverb([L, R], 0.3), 0.75), 0.05, 0.3);
};

// Ondas do mar quebrando devagar
const ondas = (seg) =>
  bordas(
    normalizar(
      ruidoVarrido(seg, {
        tipo: "lp",
        freq: (x) => 400 + 1400 * Math.sin(Math.PI * ((x * seg) / 4.2)) ** 2,
        q: 0.7,
        env: (x) => 0.3 + 0.7 * Math.sin(Math.PI * ((x * seg) / 4.2)) ** 4,
        pan: (x) => Math.sin(x * 3) * 0.4,
        sem: 88,
      }),
      0.8,
    ),
    0.5,
    0.5,
  );

// Drone grave do espaço
const espaco = (seg) => {
  const [L, R] = novo(seg);
  for (let i = 0; i < L.length; i++) {
    const t = i / SR;
    const v = (f, k) => Math.sin(2 * Math.PI * f * t + Math.sin(t * 0.3 + k) * 2);
    const a = 0.7 + 0.3 * Math.sin(t * 0.5);
    L[i] = (v(55, 0) * 0.6 + v(82.5, 1) * 0.3 + v(110.3, 2) * 0.15) * a;
    R[i] = (v(55.2, 3) * 0.6 + v(82.2, 4) * 0.3 + v(109.7, 5) * 0.15) * a;
  }
  return bordas(normalizar(reverb([L, R], 0.3), 0.8), 0.8, 0.8);
};

// Disparo de laser curto e zumbido baixo enquanto ele fica ligado
const laser = () => {
  const [L, R] = novo(0.7);
  let fase = 0;
  for (let i = 0; i < L.length; i++) {
    const t = i / SR;
    fase += (2 * Math.PI * (2400 * Math.exp(-t * 9) + 500)) / SR;
    L[i] = R[i] = Math.sin(fase) * Math.exp(-t * 7) * 0.7;
  }
  return bordas(normalizar(reverb([L, R], 0.35, 0.86), 0.7), 0.001, 0.1);
};
const zumbido = (seg) => {
  const [L, R] = novo(seg);
  for (let i = 0; i < L.length; i++) {
    const t = i / SR;
    const v = Math.sin(2 * Math.PI * 220 * t) * 0.5 + Math.sin(2 * Math.PI * 440.7 * t) * 0.25 + Math.sin(2 * Math.PI * 660 * t) * 0.1;
    const a = 0.8 + 0.2 * Math.sin(t * 7);
    L[i] = v * a;
    R[i] = v * a * 0.9;
  }
  return bordas(normalizar([L, R], 0.6), 0.3, 0.3);
};

// Mola do ponteiro da balança
const mola = () => {
  const [L, R] = novo(1.8);
  let fase = 0;
  for (let i = 0; i < L.length; i++) {
    const t = i / SR;
    fase += (2 * Math.PI * (140 + 25 * Math.sin(t * 22) * Math.exp(-t * 3))) / SR;
    L[i] = R[i] = Math.sin(fase) * Math.exp(-t * 2.6) * Math.min(1, t / 0.005);
  }
  return bordas(normalizar(reverb([L, R], 0.2), 0.7), 0.001, 0.2);
};

// ---------- Gera tudo ----------
salvar("whoosh-curto", whoosh(0.45, true, 1));
salvar("whoosh-medio", whoosh(0.8, false, 2));
salvar("whoosh-longo", whoosh(1.5, true, 3));
salvar("pulo", whoosh(0.5, true, 4));
salvar("queda-gravidade", quedaGravidade());
salvar("impacto", impacto(2.6, 42, 5));
salvar("impacto-leve", impacto(1.2, 70, 6));
salvar("riser", riser(3.4, 8));
salvar("inflar", riser(2.6, 9));
salvar("tique", tique(3200, 10));
salvar("taque", tique(2500, 11));
salvar("sino-meio-dia", sino([72, 79], 3.5, 0.18));
salvar("religa", sino([69, 74, 78, 81], 2.4, 0.11));
salvar("pop", pop(520, 880, 12));
salvar("pop-grave", pop(300, 420, 13));
salvar("motor", motor());
salvar("pneu", pneu());
salvar("buzina", buzina());
salvar("vento", vento(10, false, 14));
salvar("vento-gelado", vento(10, true, 15));
salvar("coracao", coracao(6, 96));
salvar("fervura", fervura(4));
salvar("gelo", gelo(3));
salvar("ondas", ondas(8.4));
salvar("espaco", espaco(10));
salvar("laser", laser());
salvar("zumbido", zumbido(8));
salvar("mola", mola());
