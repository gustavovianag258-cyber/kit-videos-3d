// Efeitos novos do "Imortal" (os outros vêm de public/gravidade/sons e public/namorada/sons).
// Gera WAVs em public/imortal/sons/. Rodar: node scripts/sons-imortal.mjs
// Regras do usuário: nada de chiado contínuo nem bipe eletrônico; sons com timbre definido e sutis.
import { join } from "node:path";
import { bordas, Filtro, midi, normalizar, novo, reverb, ruidoVarrido, salvarEm, semente, SR, whoosh } from "./sintese.mjs";

const PASTA = join(import.meta.dirname, "..", "public", "imortal", "sons");
const salvar = (nome, som) => salvarEm(PASTA, nome, som);

// Despertador de corda (campainha mecânica): o martelinho batendo rápido entre dois sinos
const despertador = (seg = 1.5) => {
  const [L, R] = novo(seg + 0.6);
  const sinos = [
    [2210, 3305, 4870],
    [2480, 3710, 5420],
  ];
  const batidas = Math.floor(seg * 22);
  for (let b = 0; b < batidas; b++) {
    const t0 = b / 22;
    const [f1, f2, f3] = sinos[b % 2];
    const lado = b % 2 ? 0.35 : -0.35;
    for (let i = Math.floor(t0 * SR); i < L.length; i++) {
      const t = i / SR - t0;
      if (t > 0.5) break;
      const v = (Math.sin(2 * Math.PI * f1 * t) + Math.sin(2 * Math.PI * f2 * t) * 0.45 + Math.sin(2 * Math.PI * f3 * t) * 0.2) * Math.exp(-t * 9) * Math.min(1, t / 0.0008);
      L[i] += v * (0.5 - lado * 0.5);
      R[i] += v * (0.5 + lado * 0.5);
    }
  }
  return bordas(normalizar(reverb([L, R], 0.18, 0.6), 0.75), 0.002, 0.25);
};

// Água espirrando (o pulo no mar): golpe de ruído que fecha + bolhas subindo
const splash = () => {
  const ruido = ruidoVarrido(1.1, { freq: (x) => 2600 * (1 - x * 0.8), q: 0.7, env: (x) => Math.exp(-x * 5) * Math.min(1, x * 60), tipo: "lp", sem: 3 });
  const [L, R] = ruido;
  const rnd = semente(8);
  for (let b = 0; b < 14; b++) {
    const t0 = 0.12 + rnd() * 0.8;
    const f0 = 500 + rnd() * 900;
    for (let i = Math.floor(t0 * SR); i < Math.min(L.length, Math.floor((t0 + 0.06) * SR)); i++) {
      const t = i / SR - t0;
      const v = Math.sin(2 * Math.PI * (f0 + t * 9000) * t) * Math.exp(-t * 60) * 0.25;
      L[i] += v;
      R[i] += v;
    }
  }
  return bordas(normalizar(reverb([L, R], 0.2), 0.8));
};

// Mordida do tubarão: pancada grave + estalo dos dentes + água
const mordida = () => {
  const [L, R] = novo(0.7);
  for (let i = 0; i < L.length; i++) {
    const t = i / SR;
    const grave = Math.sin(2 * Math.PI * (90 - t * 60) * t) * Math.exp(-t * 9);
    L[i] = R[i] = grave * 0.9;
  }
  const rnd = semente(5);
  const f = new Filtro("bp", 2400, 2);
  for (let i = Math.floor(0.03 * SR); i < Math.floor(0.09 * SR); i++) {
    const v = f.p(rnd() * 2 - 1) * Math.exp(-(i / SR - 0.03) * 60) * 2.2;
    L[i] += v;
    R[i] += v;
  }
  return bordas(normalizar(reverb([L, R], 0.15), 0.85));
};

// Sopro nas velas
const sopro = () =>
  bordas(normalizar(ruidoVarrido(0.55, { freq: (x) => 900 + x * 700, q: 0.9, env: (x) => Math.sin(Math.PI * Math.min(1, x * 1.1)) ** 1.5, sem: 11 }), 0.7), 0.01, 0.12);

// Peça de xadrez batendo na madeira: "toc" seco com um pouco de sala
const toc = () => {
  const [L, R] = novo(0.4);
  const rnd = semente(2);
  const f = new Filtro("bp", 1800, 3);
  for (let i = 0; i < L.length; i++) {
    const t = i / SR;
    const v = Math.sin(2 * Math.PI * 920 * t) * Math.exp(-t * 55) + Math.sin(2 * Math.PI * 1530 * t) * Math.exp(-t * 80) * 0.4 + f.p(rnd() * 2 - 1) * Math.exp(-t * 300) * 0.8;
    L[i] = R[i] = v;
  }
  return bordas(normalizar(reverb([L, R], 0.35, 0.7), 0.75));
};

// "Som do espaço" para o silêncio: um acorde grave, puro e lento (timbre definido, sem ruído)
const espaco = (seg = 6) => {
  const [L, R] = novo(seg);
  const notas = [midi(33), midi(40), midi(45), midi(52)];
  for (let i = 0; i < L.length; i++) {
    const t = i / SR;
    const env = Math.min(1, t / 1.8) * Math.min(1, (seg - t) / 2);
    let l = 0;
    let r = 0;
    notas.forEach((f, k) => {
      const a = (0.5 + 0.5 * Math.sin(t * (0.3 + k * 0.17) + k)) * (k ? 0.35 : 0.6);
      l += Math.sin(2 * Math.PI * f * t + k) * a;
      r += Math.sin(2 * Math.PI * f * 1.002 * t + k * 2) * a;
    });
    L[i] = l * env;
    R[i] = r * env;
  }
  return normalizar(reverb([L, R], 0.45, 0.92, 0.5), 0.6);
};

// Estrela apagando: um "tink" agudo e macio, longe
const tink = (n = 88) => {
  const [L, R] = novo(1.6);
  const f = midi(n);
  for (let i = 0; i < L.length; i++) {
    const t = i / SR;
    const v = (Math.sin(2 * Math.PI * f * t) + Math.sin(2 * Math.PI * f * 2.76 * t) * 0.15) * Math.exp(-t * 4) * Math.min(1, t / 0.004);
    L[i] = v;
    R[i] = v * 0.8;
  }
  return bordas(normalizar(reverb([L, R], 0.5, 0.9), 0.6), 0.002, 0.3);
};

// Zumbido do disco voador (timbre definido, com batimento lento), descendo
const disco = (seg = 2.6) => {
  const [L, R] = novo(seg);
  for (let i = 0; i < L.length; i++) {
    const t = i / SR;
    const f = 70 + 40 * Math.exp(-t * 1.5);
    const env = Math.min(1, t / 0.4) * Math.min(1, (seg - t) / 0.8);
    const v = (Math.sin(2 * Math.PI * f * t) + Math.sin(2 * Math.PI * f * 2.01 * t) * 0.5 + Math.sin(2 * Math.PI * f * 3.02 * t) * 0.25) * env * (0.7 + 0.3 * Math.sin(t * 9));
    L[i] = v;
    R[i] = v * (0.8 + 0.2 * Math.sin(t * 3));
  }
  return normalizar(reverb([L, R], 0.3, 0.85), 0.75);
};

salvar("despertador", despertador());
salvar("splash", splash());
salvar("mordida", mordida());
salvar("sopro", sopro());
salvar("toc", toc());
salvar("espaco", espaco());
salvar("tink", tink());
salvar("tink-grave", tink(76));
salvar("disco", disco());
salvar("vento-queda", whoosh(1.4, true, 21));
