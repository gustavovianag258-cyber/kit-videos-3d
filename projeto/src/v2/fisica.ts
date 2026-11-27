// Física do "disco uniforme" usada nos diagramas.
// Unidades adimensionais: raio do disco = 1 e G·M = 1. Não representam valores reais
// (a massa de um planeta assim é imaginária); servem para DIREÇÕES e PROPORÇÕES.
//
// Método: o disco é dividido em milhares de pedacinhos de massa igual; a gravidade num
// ponto é a soma das atrações de todos eles (lei de Newton). Nada é desenhado "a olho".

export const ESPESSURA_RELATIVA = 0.13; // espessura / raio (a mesma proporção do disco 3D)

type Massa = { x: number; y: number; z: number; m: number };

const criarMassas = (nr: number, nphi: number, ny: number): Massa[] => {
  const massas: Massa[] = [];
  let total = 0;
  for (let i = 0; i < nr; i++) {
    const r0 = i / nr;
    const r1 = (i + 1) / nr;
    const r = (r0 + r1) / 2;
    const area = Math.PI * (r1 * r1 - r0 * r0) / nphi;
    for (let j = 0; j < nphi; j++) {
      // Desloca meio passo a cada anel para evitar alinhamentos artificiais
      const phi = ((j + 0.5 * (i % 2)) / nphi) * Math.PI * 2;
      for (let k = 0; k < ny; k++) {
        const y = -ESPESSURA_RELATIVA * ((k + 0.5) / ny);
        massas.push({ x: r * Math.cos(phi), y, z: r * Math.sin(phi), m: area });
        total += area;
      }
    }
  }
  for (const m of massas) m.m /= total;
  return massas;
};

// Topo do disco em y = 0; o disco ocupa y de -ESPESSURA_RELATIVA até 0
const MASSAS_FINAS = criarMassas(48, 96, 3);
const MASSAS_RAPIDAS = criarMassas(20, 48, 2);
const SUAVIZACAO = 0.0004; // evita divisão por zero perto de um pedacinho

export const gravidade = (
  x: number,
  y: number,
  z: number,
  rapido = false,
): [number, number, number] => {
  let gx = 0;
  let gy = 0;
  let gz = 0;
  for (const p of rapido ? MASSAS_RAPIDAS : MASSAS_FINAS) {
    const dx = p.x - x;
    const dy = p.y - y;
    const dz = p.z - z;
    const d2 = dx * dx + dy * dy + dz * dz + SUAVIZACAO;
    const k = p.m / (d2 * Math.sqrt(d2));
    gx += dx * k;
    gy += dy * k;
    gz += dz * k;
  }
  return [gx, gy, gz];
};

export const potencial = (x: number, y: number, z: number) => {
  let phi = 0;
  for (const p of MASSAS_FINAS) {
    const dx = p.x - x;
    const dy = p.y - y;
    const dz = p.z - z;
    phi -= p.m / Math.sqrt(dx * dx + dy * dy + dz * dz + SUAVIZACAO);
  }
  return phi;
};

// ---------- Setas sobre a superfície (corte do disco no plano x–y) ----------
export type Seta = { x: number; y: number; dx: number; dy: number; intensidade: number };

let setasCache: Seta[] | null = null;
export const setasNaSuperficie = (): Seta[] => {
  if (setasCache) return setasCache;
  const ALTURA = 0.035;
  const raios = [0, 0.2, 0.4, 0.6, 0.75, 0.88, 0.97];
  const pontos: [number, number][] = [];
  for (const r of raios) {
    pontos.push([r, ALTURA]);
    if (r > 0) pontos.push([-r, ALTURA]);
  }
  // Também logo depois da borda, na altura do meio do disco
  pontos.push([1.08, -ESPESSURA_RELATIVA / 2], [-1.08, -ESPESSURA_RELATIVA / 2]);
  const brutas = pontos.map(([x, y]) => {
    const [gx, gy] = gravidade(x, y, 0);
    return { x, y, gx, gy, g: Math.hypot(gx, gy) };
  });
  const max = Math.max(...brutas.map((b) => b.g));
  setasCache = brutas.map((b) => ({
    x: b.x,
    y: b.y,
    dx: b.gx / b.g,
    dy: b.gy / b.g,
    intensidade: b.g / max,
  }));
  return setasCache;
};

// ---------- Água em equilíbrio ----------
// A superfície da água em repouso é uma superfície de potencial constante.
// Aproximação de primeira ordem: altura h(r) = (C − Φ(r, topo)) / g_vertical(r),
// com C escolhido para a água cobrir a parte central. Resultado: em raio 1 = 1.
let aguaCache: { r: number; h: number }[] | null = null;
export const perfilAguaEquilibrio = () => {
  if (aguaCache) return aguaCache;
  const N = 40;
  const amostras = Array.from({ length: N + 1 }, (_, i) => {
    const r = i / N;
    const phi = potencial(r, 0.002, 0);
    const [, gy] = gravidade(r, 0.002, 0);
    return { r, phi, gv: Math.abs(gy) };
  });
  // Nível escolhido: o potencial no raio 0,72 (a água ocupa ~72% do raio)
  const C = amostras[Math.round(0.72 * N)].phi;
  aguaCache = amostras.map((a) => ({ r: a.r, h: Math.max(0, (C - a.phi) / a.gv) }));
  return aguaCache;
};

// ---------- Órbita (integração numérica no campo do disco) ----------
export type PontoOrbita = [number, number, number];
let orbitaCache: PontoOrbita[] | null = null;
export const orbitaNoDisco = (): PontoOrbita[] => {
  if (orbitaCache) return orbitaCache;
  // Começa a 1,7 raios do centro, com órbita inclinada 55° em relação ao disco
  const r0 = 1.7;
  const inc = (55 * Math.PI) / 180;
  let x = r0;
  let y = 0;
  let z = 0;
  const v = Math.sqrt(1 / r0) * 1.0;
  let vx = 0;
  let vy = v * Math.sin(inc);
  let vz = v * Math.cos(inc);
  const dt = 0.01;
  const pontos: PontoOrbita[] = [];
  // Leapfrog (kick-drift-kick): estável para órbitas
  let [ax, ay, az] = gravidade(x, y - ESPESSURA_RELATIVA / 2, z, true);
  for (let i = 0; i < 2600; i++) {
    vx += ax * dt * 0.5;
    vy += ay * dt * 0.5;
    vz += az * dt * 0.5;
    x += vx * dt;
    y += vy * dt;
    z += vz * dt;
    [ax, ay, az] = gravidade(x, y - ESPESSURA_RELATIVA / 2, z, true);
    vx += ax * dt * 0.5;
    vy += ay * dt * 0.5;
    vz += az * dt * 0.5;
    if (i % 4 === 0) pontos.push([x, y, z]);
  }
  orbitaCache = pontos;
  return pontos;
};
