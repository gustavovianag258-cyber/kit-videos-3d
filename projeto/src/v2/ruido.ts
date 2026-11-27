// Ruído determinístico (value noise + fBm). Mesma semente = mesmo resultado sempre.

const hash = (x: number, y: number, s: number) => {
  let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(s, 982451653);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967295;
};

const suave = (t: number) => t * t * (3 - 2 * t);

export const ruido = (x: number, y: number, s: number) => {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = suave(x - ix);
  const fy = suave(y - iy);
  const a = hash(ix, iy, s);
  const b = hash(ix + 1, iy, s);
  const c = hash(ix, iy + 1, s);
  const d = hash(ix + 1, iy + 1, s);
  return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
};

// Soma de oitavas: detalhes grandes + pequenos. Resultado aproximadamente em [0, 1].
export const fbm = (x: number, y: number, oitavas: number, s: number) => {
  let soma = 0;
  let amp = 0.5;
  let freq = 1;
  let norm = 0;
  for (let i = 0; i < oitavas; i++) {
    soma += amp * ruido(x * freq, y * freq, s + i * 17);
    norm += amp;
    amp *= 0.5;
    freq *= 2.03;
  }
  return soma / norm;
};
