// Efeitos do vídeo do El Niño, sintetizados aqui, sem chiado contínuo. Gera public/el-nino/sons/*.wav.
// Rodar: node scripts/sons-el-nino.mjs
import { join } from "node:path";
import { normalizar, novo, reverb, salvarEm, SR } from "./sintese.mjs";

const PASTA = join(import.meta.dirname, "..", "public", "noticias", "el-nino", "sons");
let s = 1;
const ruido = () => ((s = (s * 16807) % 2147483647) / 1073741823.5) - 1;
const cria = (nome, seg, f, { pico = 0.85, eco = 0 } = {}) => {
  const canais = novo(seg);
  const [L, R] = canais;
  for (let i = 0; i < L.length; i++) {
    const t = i / SR;
    const [a, b] = f(t, t / seg, i);
    L[i] = a;
    R[i] = b ?? a;
  }
  const saida = eco ? reverb(canais, eco) : canais;
  normalizar(saida, pico);
  const fim = Math.floor(0.02 * SR);
  for (let i = 0; i < fim; i++) {
    const k = i / fim;
    saida[0][saida[0].length - 1 - i] *= k;
    saida[1][saida[1].length - 1 - i] *= k;
  }
  salvarEm(PASTA, nome, saida);
};
// ruído filtrado de um polo: fc pode variar no tempo
const filtrado = (fc) => {
  let y = 0;
  return (t) => {
    const a = 1 - Math.exp((-2 * Math.PI * fc(t)) / SR);
    y += a * (ruido() - y);
    return y;
  };
};

cria("tique", 0.07, (t) => [Math.sin(2 * Math.PI * 1500 * t) * Math.exp(-t * 90)]);
{
  const n = filtrado((t) => 300 + 3800 * Math.sin(Math.PI * Math.min(1, t / 0.42)));
  cria("whoosh", 0.45, (t, u) => [n(t) * Math.sin(Math.PI * u) ** 1.4, n(t) * Math.sin(Math.PI * u) ** 1.4 * 0.85]);
}
cria("dum", 0.9, (t) => [Math.sin(2 * Math.PI * (46 + 40 * Math.exp(-t * 14)) * t) * Math.exp(-t * 4.6)], { eco: 0.2 });
{
  const n = filtrado(() => 5200);
  cria("estalo-frio", 0.5, (t) => [n(t) * Math.exp(-t * 26) + Math.sin(2 * Math.PI * 180 * t) * Math.exp(-t * 11) * 0.5], { eco: 0.3 });
}
cria("sobe", 1.4, (t, u) => [Math.sin(2 * Math.PI * (130 + 560 * u * u) * t) * Math.sin(Math.PI * u) * 0.7]);
{
  const n = filtrado(() => 900);
  cria("carimbo", 0.55, (t) => [Math.sin(2 * Math.PI * (70 + 80 * Math.exp(-t * 30)) * t) * Math.exp(-t * 11) + n(t) * Math.exp(-t * 38) * 1.5], { eco: 0.18 });
}
cria("quique", 0.42, (t) => [Math.sin(2 * Math.PI * (260 - 170 * t) * t) * Math.exp(-t * 11)]);
{
  // chuva curta com gotas soltas: entra e some, nunca fica por baixo da voz
  const n = filtrado(() => 6200);
  const m = filtrado(() => 6200);
  cria("chuva-curta", 2.6, (t, u) => {
    const env = Math.min(1, t / 0.1) * (1 - u) ** 1.8;
    return [n(t) * env, m(t) * env];
  });
}
{
  const n = filtrado((t) => 500 + 900 * Math.sin(t * 2.6) ** 2);
  cria("vento-seco", 2.2, (t, u) => [n(t) * Math.sin(Math.PI * u) ** 1.5]);
}
{
  const n = filtrado(() => 2200);
  const batida = (t, b) => (t > b ? Math.exp(-(t - b) * 34) : 0);
  cria("martelo", 0.9, (t) => {
    const k = batida(t, 0) + batida(t, 0.3) * 0.85 + batida(t, 0.56) * 0.7;
    return [n(t) * k * 0.7 + Math.sin(2 * Math.PI * 165 * t) * k * 0.7];
  }, { eco: 0.12 });
}
{
  const n = filtrado((t) => 300 + 260 * t);
  const m = filtrado((t) => 900 + 240 * Math.sin(t * 22));
  cria("agua-sobe", 1.7, (t, u) => {
    const env = Math.sin(Math.PI * u) ** 0.7;
    return [(n(t) + 0.35 * m(t)) * env];
  });
}
{
  const n = filtrado(() => 4200);
  cria("racha", 1.0, (t) => {
    const estalo = Math.sin(t * 310) > 0.72 ? 1 : 0.1;
    return [n(t) * Math.exp(-t * 3.8) * estalo + Math.sin(2 * Math.PI * 80 * t) * Math.exp(-t * 7) * 0.5];
  });
}
{
  const n = filtrado((t) => 5400 - 4700 * Math.min(1, t / 0.45));
  cria("rebobina", 0.45, (t, u) => [n(t) * u ** 2 * 1.4 + Math.sin(2 * Math.PI * (880 - 720 * u) * t) * 0.16 * Math.sin(Math.PI * u)]);
}
{
  const n = filtrado(() => 1100);
  const m = filtrado(() => 460);
  cria("agua-entra", 1.8, (t, u) => {
    const borbulha = 0.5 + 0.5 * Math.sin(t * 58 + 5 * Math.sin(t * 7));
    return [(n(t) * borbulha + m(t) * 0.9) * Math.sin(Math.PI * u) ** 0.7];
  });
}
cria("ding", 1.1, (t) => [(Math.sin(2 * Math.PI * 880 * t) + 0.5 * Math.sin(2 * Math.PI * 1320 * t)) * Math.exp(-t * 4.2)], { eco: 0.22 });
{
  const n = filtrado((t) => 700 + 400 * Math.sin(t * 9));
  const m = filtrado(() => 220);
  cria("correnteza", 2.2, (t, u) => [(n(t) + m(t)) * Math.min(1, t / 0.18) * (1 - u) ** 0.8]);
}
{
  // gotas caindo no telhado, soltas
  const tempos = new Array(26).fill(0).map((_, i) => 0.05 + ((i * 0.617) % 1) * 2.6);
  cria("gotas", 2.9, (t) =>
    [tempos.reduce((soma, b) => (t > b ? soma + Math.sin(2 * Math.PI * (520 + ((b * 900) % 900)) * (t - b)) * Math.exp(-(t - b) * 72) : soma), 0)],
  { eco: 0.12 });
}
{
  const b = [0, 0.16, 0.34];
  cria("louca", 0.8, (t) => [b.reduce((soma, x) => (t > x ? soma + (Math.sin(2 * Math.PI * 1760 * (t - x)) + 0.6 * Math.sin(2 * Math.PI * 2640 * (t - x))) * Math.exp(-(t - x) * 22) : soma), 0)]);
}
{
  const b = new Array(8).fill(0).map((_, i) => i * 0.19);
  const n = filtrado(() => 3400);
  cria("folhas", 1.75, (t) => [b.reduce((soma, x) => (t > x ? soma + Math.exp(-(t - x) * 46) : soma), 0) * n(t)]);
}
{
  const n = filtrado((t) => 800 + 2500 * t);
  cria("toldo", 0.65, (t, u) => [n(t) * Math.sin(Math.PI * u) + Math.sin(2 * Math.PI * 120 * t) * (u > 0.82 ? Math.exp(-(u - 0.82) * 14) : 0) * 0.6]);
}
cria("sms", 0.42, (t) => [(t < 0.12 ? Math.sin(2 * Math.PI * 1320 * t) * Math.exp(-t * 18) : Math.sin(2 * Math.PI * 1760 * t) * Math.exp(-(t - 0.12) * 12))]);
cria("alerta", 0.9, (t) => [Math.sin(2 * Math.PI * (t % 0.3 < 0.15 ? 880 : 660) * t) * Math.exp(-t * 2.7)]);
{
  // trovão: estalo seco e o ronco que vai embora
  const a = filtrado(() => 3800);
  const b = filtrado((t) => 110 + 170 * Math.exp(-t * 1.7));
  const c = filtrado(() => 62);
  cria("trovao", 3.4, (t) => {
    const ronco = Math.exp(-t * 1.2) * (0.68 + 0.32 * Math.sin(t * 7.4 + 3 * Math.sin(t * 2.2)));
    return [a(t) * Math.exp(-t * 38) * 0.9 + b(t) * ronco * 2.3 + c(t) * ronco * 3];
  }, { eco: 0.34 });
}
console.log("sons prontos");
