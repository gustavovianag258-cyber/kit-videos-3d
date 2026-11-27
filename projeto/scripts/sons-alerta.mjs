// Efeitos do vídeo do alerta (parte 1), todos sintetizados e SEM chiado contínuo (regra do canal):
//  corte, alarme (vários celulares tocando juntos), vibra, moto, bum (céu vermelho + zumbido no ouvido),
//  rolo (porta de aço descendo), apagao (celulares/luz morrendo), msg (notificação sinistra),
//  coracao, grave (drone tonal 46/69/92 Hz como nas referências) e escolha (golpe da tela A/B).
import { Filtro, SR, bordas, normalizar, novo, reverb, ruidoVarrido, salvarEm, semente, whoosh } from "./sintese.mjs";

const PASTA = "public/alerta/sons";
const TAU = 2 * Math.PI;

// whoosh curto e baixo para os cortes
salvarEm(PASTA, "corte", whoosh(0.32, true, 3));
salvarEm(PASTA, "corte2", whoosh(0.32, false, 9));

// ALARME: tom duplo áspero (853 + 960 Hz) em pulsos, tocado por vários celulares levemente fora de tempo
{
  const seg = 3.2;
  const [L, R] = novo(seg);
  const fones = [
    [0, 1.0, 0],
    [0.045, 0.7, -0.7],
    [0.09, 0.6, 0.7],
    [0.13, 0.45, -0.3],
    [0.17, 0.4, 0.4],
  ];
  for (const [atraso, vol, pan] of fones) {
    const det = 1 + (pan * 0.004);
    for (let i = 0; i < L.length; i++) {
      const t = i / SR - atraso;
      if (t < 0) continue;
      const ciclo = t % 0.5;
      const liga = ciclo < 0.36 ? Math.min(1, ciclo / 0.01, (0.36 - ciclo) / 0.01) : 0;
      const env = liga * Math.min(1, t / 0.02) * (t > seg - 0.4 ? Math.max(0, (seg - t) / 0.4) : 1);
      const s = (Math.sign(Math.sin(TAU * 853 * det * t)) * 0.5 + Math.sign(Math.sin(TAU * 960 * det * t)) * 0.5) * 0.25 + (Math.sin(TAU * 853 * det * t) + Math.sin(TAU * 960 * det * t)) * 0.25;
      const v = s * env * vol;
      L[i] += v * Math.sqrt(0.5 * (1 - pan));
      R[i] += v * Math.sqrt(0.5 * (1 + pan));
    }
  }
  const fa = new Filtro("lp", 4200, 0.7);
  const fb = new Filtro("lp", 4200, 0.7);
  for (let i = 0; i < L.length; i++) {
    L[i] = fa.p(L[i]);
    R[i] = fb.p(R[i]);
  }
  salvarEm(PASTA, "alarme", bordas(normalizar(reverb([L, R], 0.22, 0.8, 0.4), 0.8)));
}

// VIBRA: zumbido do celular na mão (pulsos de ~170 Hz)
{
  const seg = 1.6;
  const [L, R] = novo(seg);
  const f = new Filtro("bp", 170, 2);
  for (let i = 0; i < L.length; i++) {
    const t = i / SR;
    const pulso = t % 0.55 < 0.38 ? 1 : 0;
    const s = Math.sign(Math.sin(TAU * 170 * t)) * 0.6 + Math.sin(TAU * 340 * t) * 0.2;
    const v = f.p(s) * pulso * 0.9;
    L[i] = v;
    R[i] = v;
  }
  salvarEm(PASTA, "vibra", bordas(normalizar([L, R], 0.7), 0.01, 0.05));
}

// MOTO: motor chegando e desacelerando (dente de serra filtrado, rotação caindo)
{
  const seg = 1.8;
  const [L, R] = novo(seg);
  const f = new Filtro("lp", 900, 0.9);
  let fase = 0;
  for (let i = 0; i < L.length; i++) {
    const t = i / SR;
    const x = t / seg;
    const rot = 95 - 55 * x + 6 * Math.sin(t * 30);
    fase += rot / SR;
    const saw = (fase % 1) * 2 - 1;
    const env = Math.min(1, x / 0.25) * (x > 0.8 ? (1 - x) / 0.2 : 1);
    const v = f.p(saw) * env * 0.8;
    L[i] = v * (0.4 + 0.6 * x);
    R[i] = v * (1 - 0.5 * x);
  }
  salvarEm(PASTA, "moto", bordas(normalizar(reverb([L, R], 0.12), 0.7)));
}

// BUM: golpe grave do céu virando vermelho + zumbido agudo no ouvido que vai sumindo
{
  const seg = 4.5;
  const [L, R] = novo(seg);
  const rnd = semente(4);
  const fl = new Filtro("lp", 180, 0.8);
  for (let i = 0; i < L.length; i++) {
    const t = i / SR;
    const grave = Math.sin(TAU * (32 + 60 * Math.exp(-t * 6)) * t) * Math.exp(-t * 1.1);
    const ar = fl.p(rnd() * 2 - 1) * Math.exp(-t * 4) * 1.4;
    const zumbido = Math.sin(TAU * 3150 * t) * 0.06 * Math.min(1, t / 0.3) * Math.exp(-Math.max(0, t - 0.6) * 0.9);
    const v = grave * 0.9 + ar;
    L[i] = v + zumbido;
    R[i] = v * 0.97 + zumbido * 0.9;
  }
  salvarEm(PASTA, "bum", bordas(normalizar(reverb([L, R], 0.3, 0.88, 0.35), 0.92), 0.002, 0.3));
}

// ROLO: porta de aço descendo (catraca metálica acelerando) e batida no chão
{
  const seg = 2.2;
  const [L, R] = novo(seg);
  const res = [1120, 1810, 2650, 3900];
  let prox = 0;
  const cliques = [];
  for (let t = 0.02; t < 1.55; t += prox) {
    cliques.push(t);
    prox = 0.07 - 0.035 * (t / 1.55);
  }
  for (const t0 of cliques) {
    for (let i = Math.floor(t0 * SR); i < Math.min(L.length, Math.floor((t0 + 0.08) * SR)); i++) {
      const tt = i / SR - t0;
      let v = 0;
      res.forEach((fq, k) => (v += Math.sin(TAU * fq * tt + k) * Math.exp(-tt * (60 + k * 20)) * 0.25));
      L[i] += v * 0.8;
      R[i] += v * 0.7;
    }
  }
  // batida final
  const t0 = 1.6;
  const rnd = semente(8);
  const f = new Filtro("lp", 600, 0.8);
  for (let i = Math.floor(t0 * SR); i < L.length; i++) {
    const tt = i / SR - t0;
    let v = Math.sin(TAU * (70 + 50 * Math.exp(-tt * 20)) * tt) * Math.exp(-tt * 7) * 0.9 + f.p(rnd() * 2 - 1) * Math.exp(-tt * 18) * 0.8;
    res.forEach((fq, k) => (v += Math.sin(TAU * fq * 0.7 * tt + k) * Math.exp(-tt * (9 + k * 4)) * 0.18));
    L[i] += v;
    R[i] += v;
  }
  salvarEm(PASTA, "rolo", bordas(normalizar(reverb([L, R], 0.25, 0.8), 0.85)));
}

// APAGÃO: tom eletrônico descendo + estalos (celulares e luzes morrendo)
{
  const seg = 1.6;
  const [L, R] = novo(seg);
  const rnd = semente(13);
  let fase = 0;
  for (let i = 0; i < L.length; i++) {
    const t = i / SR;
    const x = t / seg;
    fase += (900 * Math.pow(0.08, x)) / SR;
    const tom = Math.sin(TAU * fase) * 0.35 * (1 - x);
    const estalo = rnd() < 0.0025 * (1 - x) ? (rnd() * 2 - 1) * 0.8 : 0;
    L[i] = tom + estalo;
    R[i] = tom * 0.9 + estalo;
  }
  salvarEm(PASTA, "apagao", bordas(normalizar(reverb([L, R], 0.25), 0.75)));
}

// MSG: notificação grave e estranha (duas notas descendo, com eco)
{
  const seg = 1.8;
  const [L, R] = novo(seg);
  [
    [0, 659.25],
    [0.16, 466.16],
  ].forEach(([t0, fq]) => {
    for (let i = Math.floor(t0 * SR); i < L.length; i++) {
      const tt = i / SR - t0;
      const v = (Math.sin(TAU * fq * tt) + Math.sin(TAU * fq * 2.01 * tt) * 0.3) * Math.exp(-tt * 5) * 0.4;
      L[i] += v;
      R[i] += v;
    }
  });
  salvarEm(PASTA, "msg", bordas(normalizar(reverb([L, R], 0.45, 0.9, 0.5), 0.7)));
}

// CORAÇÃO: duas batidas graves (tum-tum)
{
  const seg = 1.0;
  const [L, R] = novo(seg);
  [
    [0, 1],
    [0.22, 0.75],
  ].forEach(([t0, a]) => {
    for (let i = Math.floor(t0 * SR); i < L.length; i++) {
      const tt = i / SR - t0;
      const v = Math.sin(TAU * (48 + 30 * Math.exp(-tt * 25)) * tt) * Math.exp(-tt * 14) * a;
      L[i] += v;
      R[i] += v;
    }
  });
  salvarEm(PASTA, "coracao", bordas(normalizar([L, R], 0.85)));
}

// GRAVE: drone tonal contínuo (46 Hz + quinta + oitava), batimento lento; 12 s, emendável em loop
{
  const seg = 12;
  const [L, R] = novo(seg);
  for (let i = 0; i < L.length; i++) {
    const t = i / SR;
    const lfo = 0.75 + 0.25 * Math.sin(TAU * t / 6);
    const v = (Math.sin(TAU * 46 * t) * 0.6 + Math.sin(TAU * 69 * t + 1) * 0.3 + Math.sin(TAU * 92.4 * t + 2) * 0.22 + Math.sin(TAU * 138.5 * t) * 0.06) * lfo;
    L[i] = v;
    R[i] = Math.sin(TAU * 46.15 * t) * 0.6 * lfo + (v - Math.sin(TAU * 46 * t) * 0.6 * lfo);
  }
  salvarEm(PASTA, "grave", normalizar([L, R], 0.8));
}

// ESCOLHA: golpe da tela A/B (grave + reverso que cresce antes)
{
  const seg = 2.6;
  const [L, R] = novo(seg);
  const sobe = ruidoVarrido(0.9, { freq: (x) => 300 * 10 ** x, q: 1.2, env: (x) => x ** 2.2, sem: 21 });
  for (let i = 0; i < sobe[0].length; i++) {
    L[i] += sobe[0][i] * 0.6;
    R[i] += sobe[1][i] * 0.6;
  }
  const t0 = 0.9;
  for (let i = Math.floor(t0 * SR); i < L.length; i++) {
    const tt = i / SR - t0;
    const v = Math.sin(TAU * (40 + 50 * Math.exp(-tt * 10)) * tt) * Math.exp(-tt * 2.2);
    L[i] += v;
    R[i] += v;
  }
  salvarEm(PASTA, "escolha", bordas(normalizar(reverb([L, R], 0.3, 0.86), 0.9)));
}
