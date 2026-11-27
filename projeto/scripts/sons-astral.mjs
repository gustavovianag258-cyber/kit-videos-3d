// Efeitos do vídeo da projeção astral (sintetizados, sem chiado contínuo):
//  - voo.wav: whoosh macio e curto para cada "voo" entre lugares
//  - atravessar.wav: "vuum" grave + brilho de sininhos quando você atravessa parede/cofre/janela
//  - chegada.wav: acorde de sino suave quando você "chega" (Barcelona) e quando acorda
//  - subida.wav: subida curta (tom que sobe) no "Mais alto"
//  - miado.wav: miadinho curto do gato que te vê
import { bordas, normalizar, novo, reverb, ruidoVarrido, salvarEm, SR, suave, whoosh, Filtro } from "./sintese.mjs";

const PASTA = "public/astral/sons";

salvarEm(PASTA, "voo", whoosh(0.7, true, 7));

{
  const seg = 1.4;
  const [L, R] = novo(seg);
  const f = new Filtro("lp", 300, 0.9);
  for (let i = 0; i < L.length; i++) {
    const t = i / SR;
    const env = Math.min(1, t / 0.12) * Math.exp(-t * 2.6);
    const grave = Math.sin(2 * Math.PI * (70 + 40 * Math.exp(-t * 4)) * t) * 0.6;
    const v = f.p(grave) * env;
    L[i] += v;
    R[i] += v;
    // sininhos brilhando (4 parciais que entram em cascata)
    [1568, 2093, 2637, 3136].forEach((fq, k) => {
      const t0 = 0.05 + k * 0.07;
      if (t < t0) return;
      const tt = t - t0;
      const s = Math.sin(2 * Math.PI * fq * tt) * Math.exp(-tt * 5) * 0.12;
      L[i] += s * (k % 2 ? 0.6 : 1);
      R[i] += s * (k % 2 ? 1 : 0.6);
    });
  }
  salvarEm(PASTA, "atravessar", bordas(normalizar(reverb([L, R], 0.35, 0.86, 0.35), 0.8)));
}

{
  const seg = 2.4;
  const [L, R] = novo(seg);
  const notas = [523.25, 659.25, 783.99, 1046.5];
  for (let i = 0; i < L.length; i++) {
    const t = i / SR;
    notas.forEach((fq, k) => {
      const t0 = k * 0.05;
      if (t < t0) return;
      const tt = t - t0;
      const env = Math.min(1, tt / 0.01) * Math.exp(-tt * 1.8);
      const s = (Math.sin(2 * Math.PI * fq * tt) + 0.3 * Math.sin(2 * Math.PI * fq * 2.01 * tt)) * env * 0.16;
      L[i] += s * (k % 2 ? 0.7 : 1);
      R[i] += s * (k % 2 ? 1 : 0.7);
    });
  }
  salvarEm(PASTA, "chegada", bordas(normalizar(reverb([L, R], 0.4, 0.88, 0.3), 0.7), 0.002, 0.3));
}

{
  const seg = 1.9;
  const ar = ruidoVarrido(seg, { freq: (x) => 300 * 12 ** x, q: 2, env: (x) => suave(x / 0.8) * (1 - suave((x - 0.85) / 0.15)) * 0.5, sem: 11 });
  const [L, R] = ar;
  let fase = 0;
  for (let i = 0; i < L.length; i++) {
    const x = i / L.length;
    fase += (2 * Math.PI * (180 + 520 * x * x)) / SR;
    const s = Math.sin(fase) * 0.25 * suave(x / 0.6) * (1 - suave((x - 0.85) / 0.15));
    L[i] += s;
    R[i] += s;
  }
  salvarEm(PASTA, "subida", bordas(normalizar(reverb([L, R], 0.25), 0.75)));
}

{
  const seg = 0.55;
  const [L, R] = novo(seg);
  const f = new Filtro("bp", 1200, 3);
  for (let i = 0; i < L.length; i++) {
    const x = i / L.length;
    const t = i / SR;
    const fq = 520 + 380 * Math.sin(Math.PI * Math.min(1, x * 1.3));
    const env = Math.sin(Math.PI * x) ** 1.5;
    let s = 0;
    for (let h = 1; h <= 5; h++) s += Math.sin(2 * Math.PI * fq * h * t) / h;
    const v = f.p(s) * env * 0.5;
    L[i] = v;
    R[i] = v;
  }
  salvarEm(PASTA, "miado", bordas(normalizar(reverb([L, R], 0.15), 0.6)));
}
