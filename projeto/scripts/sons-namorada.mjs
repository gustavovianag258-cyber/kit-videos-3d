// Efeitos sonoros de "E se o Gabriel arrumasse uma namorada?" (as músicas são faixas prontas do Mixkit).
// Gera WAVs em public/namorada/sons/. Rodar: node scripts/sons-namorada.mjs
import { join } from "node:path";
import { bordas, Filtro, midi, normalizar, novo, reverb, ruidoVarrido, salvarEm, semente, SR } from "./sintese.mjs";

const PASTA = join(import.meta.dirname, "..", "public", "namorada", "sons");
const salvar = (nome, som) => salvarEm(PASTA, nome, som);

// Sino curto com parciais metálicos (notificação, medalha)
const sino = (notas, seg, intervalo, brilho = 1) => {
  const [L, R] = novo(seg);
  const parciais = [
    [1, 1, 5],
    [2.0, 0.4 * brilho, 7],
    [3.01, 0.22 * brilho, 9],
    [4.2, 0.1 * brilho, 12],
  ];
  notas.forEach((n, k) => {
    const t0 = k * intervalo;
    const f = midi(n);
    for (let i = Math.floor(t0 * SR); i < L.length; i++) {
      const t = i / SR - t0;
      let v = 0;
      for (const [m, a, d] of parciais) v += Math.sin(2 * Math.PI * f * m * t) * a * Math.exp(-t * d);
      v *= Math.min(1, t / 0.002);
      L[i] += v;
      R[i] += v;
    }
  });
  return bordas(normalizar(reverb([L, R], 0.25, 0.8), 0.8), 0.001, 0.1);
};

// "Plop" de mensagem
const plop = (f0, f1, seg = 0.18) => {
  const [L, R] = novo(seg);
  let fase = 0;
  for (let i = 0; i < L.length; i++) {
    const t = i / SR;
    fase += (2 * Math.PI * (f0 + (f1 - f0) * Math.min(1, t / 0.06))) / SR;
    L[i] = R[i] = Math.sin(fase) * Math.exp(-t * 26) * Math.min(1, t / 0.002);
  }
  return bordas(normalizar(reverb([L, R], 0.15), 0.75), 0.001);
};

// Vidro rachando: estalos agudos em cascata + um brilho que soa
const vidro = () => {
  const seg = 0.9;
  const [L, R] = novo(seg);
  const rnd = semente(41);
  const hp = new Filtro("hp", 3200);
  const hp2 = new Filtro("hp", 3000);
  const estalos = Array.from({ length: 26 }, (_, k) => 0.005 + (k / 26) ** 1.6 * 0.4 + rnd() * 0.02);
  for (let i = 0; i < L.length; i++) {
    const t = i / SR;
    let v = 0;
    for (const e of estalos) if (t >= e) v += Math.exp(-(t - e) * 380) * (1 - e * 1.5);
    const n = rnd() * 2 - 1;
    const anel = Math.sin(2 * Math.PI * 4100 * t) * Math.exp(-t * 9) * 0.12 + Math.sin(2 * Math.PI * 6230 * t) * Math.exp(-t * 12) * 0.08;
    L[i] = hp.p(n * v) + anel;
    R[i] = hp2.p(n * v * 0.9) + anel;
  }
  return bordas(normalizar(reverb([L, R], 0.25, 0.8), 0.85), 0.0005, 0.1);
};

// Estrondo grave do terremoto
const estrondo = (seg, f0, sem) => {
  const [L, R] = novo(seg);
  const rnd = semente(sem);
  const lp = new Filtro("lp", 220);
  const lp2 = new Filtro("lp", 220);
  let fase = 0;
  for (let i = 0; i < L.length; i++) {
    const t = i / SR;
    const f = f0 + f0 * 1.4 * Math.exp(-t * 6);
    fase += (2 * Math.PI * f) / SR;
    const a = Math.min(1, t / 0.01) * Math.exp(-t * (2.6 / seg));
    const corpo = Math.sin(fase) * a;
    L[i] = Math.tanh((corpo + lp.p(rnd() * 2 - 1) * a * 1.4) * 1.6);
    R[i] = Math.tanh((corpo + lp2.p(rnd() * 2 - 1) * a * 1.4) * 1.6);
  }
  return bordas(normalizar(reverb([L, R], 0.3, 0.86, 0.5), 0.92), 0.002, 0.4);
};

// Ronco contínuo do chão tremendo (só graves: nada de chiado por baixo da voz)
const ronco = (seg) => {
  const [L, R] = novo(seg);
  const rnd = semente(77);
  const a1 = new Filtro("lp", 75, 0.9);
  const a2 = new Filtro("lp", 75, 0.9);
  const b1 = new Filtro("lp", 75, 0.9);
  const b2 = new Filtro("lp", 75, 0.9);
  for (let i = 0; i < L.length; i++) {
    const t = i / SR;
    const pulsa = 0.65 + 0.35 * Math.sin(t * 2 * Math.PI * 0.7) * Math.sin(t * 2 * Math.PI * 0.23 + 1);
    L[i] = b1.p(a1.p(rnd() * 2 - 1)) * pulsa;
    R[i] = b2.p(a2.p(rnd() * 2 - 1)) * pulsa;
  }
  // emenda sem estalo para tocar em loop
  const n = Math.floor(0.3 * SR);
  for (let i = 0; i < n; i++) {
    const k = i / n;
    L[i] *= k;
    R[i] *= k;
    L[L.length - 1 - i] *= k;
    R[R.length - 1 - i] *= k;
  }
  return normalizar([L, R], 0.9);
};

// Explosão do planeta: golpe sub-grave + ruído que vai abafando + destroços
const explosao = () => {
  const seg = 4;
  const r = ruidoVarrido(seg, {
    freq: (x) => 5000 * (1 / 40) ** Math.min(1, x * 1.6),
    tipo: "lp",
    q: 0.8,
    env: (x) => Math.min(1, x / 0.004) * Math.exp(-x * 3.2),
    sem: 9,
  });
  const rnd = semente(13);
  let fase = 0;
  for (let i = 0; i < r[0].length; i++) {
    const t = i / SR;
    fase += (2 * Math.PI * (32 + 60 * Math.exp(-t * 3))) / SR;
    const sub = Math.sin(fase) * Math.min(1, t / 0.008) * Math.exp(-t * 0.9) * 1.1;
    // destroços: estalinhos espalhados que vão rareando
    const est = rnd() < 0.0018 * Math.exp(-t * 1.2) ? (rnd() * 2 - 1) * 0.6 : 0;
    r[0][i] = Math.tanh((r[0][i] * 1.4 + sub + est) * 1.3);
    r[1][i] = Math.tanh((r[1][i] * 1.4 + sub - est) * 1.3);
  }
  return bordas(normalizar(reverb(r, 0.35, 0.9, 0.4), 0.95), 0.001, 0.6);
};

// Teclado do celular: 13 toques ("bom dia, amor")
const teclado = () => {
  const [L, R] = novo(0.85);
  const rnd = semente(5);
  const hp = new Filtro("hp", 2400);
  for (let k = 0; k < 13; k++) {
    const t0 = k * 0.058 + rnd() * 0.012;
    const f = 1800 + rnd() * 500;
    for (let i = Math.floor(t0 * SR); i < Math.min(L.length, Math.floor((t0 + 0.04) * SR)); i++) {
      const t = i / SR - t0;
      const v = hp.p(rnd() * 2 - 1) * Math.exp(-t * 600) * 0.7 + Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 250) * 0.35;
      L[i] += v;
      R[i] += v;
    }
  }
  return bordas(normalizar(reverb([L, R], 0.1), 0.7), 0.0005);
};

// Alarme da NASA: dois tons, suave
const alarme = () => {
  const [L, R] = novo(1.7);
  for (let i = 0; i < L.length; i++) {
    const t = i / SR;
    const k = Math.floor(t / 0.28);
    const f = k % 2 ? 660 : 880;
    const tt = t - k * 0.28;
    const env = Math.min(1, tt / 0.01) * (tt < 0.22 ? 1 : Math.max(0, 1 - (tt - 0.22) / 0.04));
    const v = (Math.sin(2 * Math.PI * f * t) * 0.7 + Math.sin(2 * Math.PI * f * 2 * t) * 0.15) * env;
    L[i] = R[i] = v;
  }
  return bordas(normalizar(reverb([L, R], 0.25), 0.7), 0.002, 0.1);
};

// Ping de radar (o pulso rosa sobre o Brasil)
const ping = () => {
  const [L, R] = novo(1.4);
  for (let i = 0; i < L.length; i++) {
    const t = i / SR;
    L[i] = R[i] = Math.sin(2 * Math.PI * 1320 * t) * Math.exp(-t * 6) * Math.min(1, t / 0.003) + Math.sin(2 * Math.PI * 2640 * t) * Math.exp(-t * 14) * 0.2;
  }
  return bordas(normalizar(reverb([L, R], 0.45, 0.88), 0.75), 0.001, 0.2);
};

// "Errado!" de programa de auditório, baixinho (o telão dizendo que nunca vai acontecer)
const erro = () => {
  const [L, R] = novo(0.75);
  const lp = new Filtro("lp", 1400);
  let fase = 0;
  for (let i = 0; i < L.length; i++) {
    const t = i / SR;
    const f = t < 0.3 ? 233 : 175;
    fase += (2 * Math.PI * f) / SR;
    const quadrada = Math.tanh(Math.sin(fase) * 3) * 0.7 + Math.sin(fase * 2) * 0.2;
    const tt = t < 0.3 ? t : t - 0.32;
    const env = t > 0.28 && t < 0.32 ? 0 : Math.min(1, tt / 0.01) * Math.exp(-tt * (t < 0.3 ? 2 : 3.5));
    L[i] = R[i] = lp.p(quadrada * env);
  }
  return bordas(normalizar(reverb([L, R], 0.15), 0.75), 0.002, 0.08);
};

// Blip de interface (HUD, selos, etiquetas entrando)
const blip = (f0, f1, seg = 0.09) => {
  const [L, R] = novo(seg + 0.25);
  let fase = 0;
  for (let i = 0; i < L.length; i++) {
    const t = i / SR;
    fase += (2 * Math.PI * (f0 + (f1 - f0) * Math.min(1, t / seg))) / SR;
    L[i] = R[i] = (Math.sin(fase) + Math.sin(fase * 2) * 0.15) * Math.min(1, t / 0.002) * Math.exp(-t * 28);
  }
  return bordas(normalizar(reverb([L, R], 0.25, 0.75), 0.7), 0.001);
};

// Bipes de computador (sala de controle, sismógrafos)
const bipes = (n, sem) => {
  const [L, R] = novo(n * 0.11 + 0.3);
  const rnd = semente(sem);
  for (let k = 0; k < n; k++) {
    const t0 = k * 0.11;
    const f = [1320, 1760, 1480, 1980, 1175][Math.floor(rnd() * 5)];
    for (let i = Math.floor(t0 * SR); i < Math.floor((t0 + 0.07) * SR); i++) {
      const t = i / SR - t0;
      const env = Math.min(1, t / 0.003) * (t < 0.055 ? 1 : (0.07 - t) / 0.015);
      L[i] += Math.sin(2 * Math.PI * f * t) * env * 0.5;
      R[i] += Math.sin(2 * Math.PI * f * t) * env * 0.5;
    }
  }
  return bordas(normalizar(reverb([L, R], 0.2), 0.6), 0.001, 0.1);
};

// Brilhinhos (a mãe emocionada, a medalha)
const brilho = (seg, sem) => {
  const [L, R] = novo(seg);
  const rnd = semente(sem);
  const notas = [96, 100, 103, 108, 105, 101, 98];
  for (let k = 0; k < 9; k++) {
    const t0 = rnd() * (seg - 0.6);
    const f = midi(notas[Math.floor(rnd() * notas.length)]);
    const p = rnd() * 2 - 1;
    for (let i = Math.floor(t0 * SR); i < L.length; i++) {
      const t = i / SR - t0;
      const v = Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 9) * Math.min(1, t / 0.002) * 0.4;
      L[i] += v * Math.sqrt(0.5 * (1 - p));
      R[i] += v * Math.sqrt(0.5 * (1 + p));
    }
  }
  return bordas(normalizar(reverb([L, R], 0.4, 0.86), 0.65), 0.001, 0.2);
};

// Pedra rachando (a Terra não aguenta)
const racha = () => {
  const [L, R] = novo(1.4);
  const rnd = semente(61);
  const bp = new Filtro("bp", 900, 0.9);
  const bp2 = new Filtro("bp", 1300, 0.9);
  const estalos = Array.from({ length: 18 }, (_, k) => 0.02 + (k / 18) * 0.9 + rnd() * 0.05);
  let fase = 0;
  for (let i = 0; i < L.length; i++) {
    const t = i / SR;
    let v = 0;
    for (const e of estalos) if (t >= e) v += Math.exp(-(t - e) * 120);
    const n = rnd() * 2 - 1;
    fase += (2 * Math.PI * 48) / SR;
    const grave = Math.sin(fase) * Math.exp(-t * 2.5) * Math.min(1, t / 0.01) * 0.6;
    L[i] = bp.p(n * v) * 1.4 + grave;
    R[i] = bp2.p(n * v) * 1.4 + grave;
  }
  return bordas(normalizar(reverb([L, R], 0.3, 0.85), 0.85), 0.002, 0.2);
};

// Metal rangendo (a Torre Eiffel entortando)
const rangido = () => {
  const [L, R] = novo(1.5);
  const bp = new Filtro("bp", 500, 3);
  const bp2 = new Filtro("bp", 760, 4);
  let fase = 0;
  for (let i = 0; i < L.length; i++) {
    const t = i / SR;
    const f = 95 + 40 * Math.sin(t * 3.1) + 12 * Math.sin(t * 23);
    fase += (2 * Math.PI * f) / SR;
    const serra = ((fase / (2 * Math.PI)) % 1) * 2 - 1;
    const env = Math.min(1, t / 0.15) * Math.min(1, (1.5 - t) / 0.4);
    const v = (bp.p(serra) + bp2.p(serra) * 0.7) * env;
    L[i] = v;
    R[i] = v * 0.9;
  }
  return bordas(normalizar(reverb([L, R], 0.35, 0.86), 0.75), 0.01, 0.2);
};

// Desmoronando (muralha, monumentos): pancadas graves e pedrinhas
const desmorona = () => {
  const [L, R] = novo(1.8);
  const rnd = semente(88);
  const lp = new Filtro("lp", 600);
  const lp2 = new Filtro("lp", 600);
  const golpes = Array.from({ length: 12 }, () => rnd() * 1.2);
  for (let i = 0; i < L.length; i++) {
    const t = i / SR;
    let v = 0;
    for (const g of golpes) if (t >= g) v += Math.exp(-(t - g) * 30);
    const n = rnd() * 2 - 1;
    L[i] = lp.p(n * v) * 1.6;
    R[i] = lp2.p(n * v) * 1.6;
  }
  return bordas(normalizar(reverb([L, R], 0.3, 0.85), 0.8), 0.002, 0.3);
};

// Tique-taque do relógio (2 da manhã)
const relogio = () => {
  const [L, R] = novo(2.1);
  const rnd = semente(3);
  const hp = new Filtro("hp", 2500);
  for (let k = 0; k < 4; k++) {
    const t0 = k * 0.5;
    const f = k % 2 ? 1250 : 1650;
    for (let i = Math.floor(t0 * SR); i < Math.floor((t0 + 0.1) * SR); i++) {
      const t = i / SR - t0;
      const v = hp.p(rnd() * 2 - 1) * Math.exp(-t * 400) + Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 90) * 0.6;
      L[i] += v;
      R[i] += v;
    }
  }
  return bordas(normalizar(reverb([L, R], 0.2), 0.75), 0.0005, 0.1);
};

// Pancada grave e curta, de suspense ("dum")
const dum = () => {
  const [L, R] = novo(1.6);
  let fase = 0;
  for (let i = 0; i < L.length; i++) {
    const t = i / SR;
    fase += (2 * Math.PI * (55 + 30 * Math.exp(-t * 12))) / SR;
    const v = Math.tanh((Math.sin(fase) + Math.sin(fase * 2.01) * 0.3) * 1.5) * Math.min(1, t / 0.005) * Math.exp(-t * 2.4);
    L[i] = R[i] = v;
  }
  return bordas(normalizar(reverb([L, R], 0.35, 0.86, 0.5), 0.9), 0.002, 0.3);
};

// Onda de choque se espalhando: golpe seco + ar empurrado que abre de um lado ao outro e
// vai ficando grave + cauda longe com um brilho leve (é uma onda de amor, não um terremoto)
const ondaDeChoque = () => {
  const seg = 3.2;
  const ar = ruidoVarrido(seg, {
    freq: (x) => 2400 * (1 / 16) ** Math.min(1, x * 1.4),
    q: 0.9,
    env: (x) => Math.min(1, x / 0.012) * Math.exp(-x * 3.4) * (1 + 0.5 * Math.exp(-x * 30)),
    pan: (x) => Math.sin(x * 5) * 0.75,
    sem: 31,
  });
  const rnd = semente(17);
  const hp = new Filtro("hp", 1800);
  let fase = 0;
  for (let i = 0; i < ar[0].length; i++) {
    const t = i / SR;
    // golpe grave: começa em ~95 Hz e desce para ~38 Hz
    fase += (2 * Math.PI * (38 + 57 * Math.exp(-t * 7))) / SR;
    const golpe = Math.sin(fase) * Math.min(1, t / 0.004) * Math.exp(-t * 2.2) * 1.1;
    // estalo do ar logo no começo
    const estalo = hp.p(rnd() * 2 - 1) * Math.exp(-t * 60) * 0.5;
    // brilho leve que acompanha a onda
    const brilho = (Math.sin(2 * Math.PI * 1568 * t) + Math.sin(2 * Math.PI * 2093 * t) * 0.7) * 0.05 * Math.min(1, t / 0.2) * Math.exp(-t * 1.6);
    ar[0][i] = Math.tanh((ar[0][i] * 1.2 + golpe + estalo + brilho) * 1.2);
    ar[1][i] = Math.tanh((ar[1][i] * 1.2 + golpe + estalo * 0.8 + brilho) * 1.2);
  }
  return bordas(normalizar(reverb(ar, 0.38, 0.9, 0.35), 0.92), 0.001, 0.5);
};

salvar("onda-de-choque", ondaDeChoque());
salvar("erro", erro());
salvar("blip", blip(1400, 2100));
salvar("blip-grave", blip(700, 1050, 0.12));
salvar("bipes", bipes(6, 2));
salvar("bipes2", bipes(9, 7));
salvar("brilho", brilho(1.4, 4));
salvar("racha", racha());
salvar("rangido", rangido());
salvar("desmorona", desmorona());
salvar("relogio", relogio());
salvar("dum", dum());
salvar("ding", sino([88, 95], 1.0, 0.11));
salvar("ping", ping());
salvar("mensagem", plop(700, 1250));
salvar("saiu", plop(520, 170, 0.35));
salvar("vidro", vidro());
salvar("estrondo", estrondo(3.2, 30, 3));
salvar("passo", estrondo(1.6, 42, 8));
salvar("ronco", ronco(8));
salvar("explosao", explosao());
salvar("teclado", teclado());
salvar("alarme", alarme());
salvar("medalha", sino([93, 100, 105], 2.2, 0.07, 1.4));
