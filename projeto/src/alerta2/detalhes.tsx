import { random } from "remotion";
import { Prim, V3, caixa, quad } from "./olho";

// DETALHES do Bar do Neide (pedido do usuário: "não fique vazio, quero detalhes"). Tudo em metros, no
// mesmo mundo da sala: fundo z = −4, rua z = +4, paredes x = ±5, teto 3,2 m.
// Devolve polígonos, linhas finas e textos presos a pontos do mundo (lousa, relógio…).

const fino = { fino: true } as const;
const r = (k: string) => random(`det-${k}`);

const garrafa = (x: number, y: number, z: number, cor: string, alt = 0.28): Prim[] => [
  ...caixa([x, y + alt * 0.36, z], [0.075, alt * 0.72, 0.075], cor, 0, fino),
  ...caixa([x, y + alt * 0.86, z], [0.03, alt * 0.28, 0.03], cor, 0, fino),
];
const copo = (x: number, y: number, z: number, cheio = true): Prim[] => caixa([x, y + 0.05, z], [0.06, 0.1, 0.06], cheio ? "#f2c230" : "#dfe9ee", 0, fino);

export type TextoNoMundo = { centro: V3; larg: number; tipo: "lousa" | "relogio" | "placa" | "calendario" | "fiado" };

export const detalhesBar = (gold: boolean, motoX = 0) => {
  const P: Prim[] = [];
  const L: V3[][] = [];
  const T: TextoNoMundo[] = [];

  // ---------- paredes ----------
  // rejunte do azulejo (fundo e laterais) e rodapé
  for (let x = -5; x <= 5; x += 0.3) L.push([[x, 0.08, -3.98], [x, 1.3, -3.98]]);
  for (let y = 0.3; y < 1.3; y += 0.3) L.push([[-5, y, -3.98], [5, y, -3.98]]);
  for (const sx of [-1, 1])
    for (let z = -4; z <= 4; z += 0.3) L.push([[sx * 4.98, 0.08, z], [sx * 4.98, 1.3, z]]);
  for (const sx of [-1, 1]) for (let y = 0.3; y < 1.3; y += 0.3) L.push([[sx * 4.98, y, -4], [sx * 4.98, y, 4]]);
  P.push(quad([-5, 0, -3.97], [5, 0, -3.97], [5, 0.08, -3.97], [-5, 0.08, -3.97], "#5a4632", { tam: 3 }));
  // manchas de umidade e reboco caído no alto da parede
  [[-4.6, 2.9, 0.7, 0.35], [1.0, 3.0, 0.9, 0.2], [3.0, 1.45, 0.4, 0.25]].forEach(([x, y, w, h]) =>
    P.push(quad([x, y, -3.985], [x + w, y, -3.985], [x + w, y + h, -3.985], [x, y + h, -3.985], gold ? "#6e5f3c" : "#c4a35a", { tam: 3 })),
  );
  P.push(quad([0.4, 2.5, -3.985], [0.75, 2.5, -3.985], [0.75, 2.72, -3.985], [0.4, 2.72, -3.985], "#cfc6b0", { borda: [true, true, true, true], ...fino }));
  // rachaduras
  L.push([[-0.8, 3.2, -3.98], [-0.7, 2.9, -3.98], [-0.85, 2.7, -3.98], [-0.75, 2.45, -3.98]]);
  L.push([[4.98, 3.2, 2.8], [4.98, 2.8, 2.6], [4.98, 2.6, 2.75]]);
  // lousa do cardápio
  P.push(...caixa([1.75, 2.15, -3.96], [1.3, 0.95, 0.04], "#2d4a3a"));
  P.push(...caixa([1.75, 1.66, -3.93], [1.3, 0.04, 0.06], "#7a4a22", 0, fino));
  T.push({ centro: [1.75, 2.15, -3.93], larg: 1.2, tipo: "lousa" });
  // relógio
  P.push(...caixa([-3.2, 2.85, -3.96], [0.36, 0.36, 0.04], "#f4f4f2", 0, fino));
  T.push({ centro: [-3.2, 2.85, -3.93], larg: 0.34, tipo: "relogio" });
  // calendário e placa "fiado só amanhã"
  P.push(quad([-4.55, 1.45, -3.97], [-4.05, 1.45, -3.97], [-4.05, 1.0, -3.97], [-4.55, 1.0, -3.97], "#f8f6ef", { borda: [true, true, true, true], ...fino }));
  P.push(quad([-4.55, 1.45, -3.965], [-4.05, 1.45, -3.965], [-4.05, 1.35, -3.965], [-4.55, 1.35, -3.965], "#c1121f", fino));
  P.push(...caixa([-1.0, 1.75, -3.96], [0.7, 0.3, 0.03], "#f2c230", 0, fino));
  T.push({ centro: [-1.0, 1.75, -3.94], larg: 0.66, tipo: "fiado" });
  // tomadas e interruptor
  [[-1.6, 0.4], [2.6, 0.4], [0.9, 1.1]].forEach(([x, y]) => P.push(...caixa([x, y, -3.97], [0.1, 0.1, 0.02], "#f4f4f2", 0, fino)));
  // quadro de luz na parede da direita + fios até o teto e pelo teto
  P.push(...caixa([4.96, 2.2, 1.4], [0.06, 0.55, 0.42], "#9aa0a6"));
  L.push([[4.93, 2.47, 1.3], [4.93, 3.18, 1.3], [2.4, 3.18, 1.3], [2.4, 3.18, -1]]);
  L.push([[4.93, 2.47, 1.5], [4.93, 3.17, 1.5], [-1.5, 3.17, 1.5], [-1.5, 3.17, 0]]);
  L.push([[-1.5, 3.17, 0], [-1.0, 3.17, 0.5]]);
  // parede da esquerda: flâmula, espelho, ventilador de parede, cabideiro
  P.push(quad([-4.97, 2.75, -1.6], [-4.97, 2.75, -0.8], [-4.97, 2.3, -1.2], [-4.97, 2.3, -1.2], "#1f9d55", { borda: [true, true, true, true], ...fino }));
  P.push(quad([-4.96, 2.62, -1.42], [-4.96, 2.62, -0.98], [-4.96, 2.4, -1.2], [-4.96, 2.4, -1.2], "#f2c230", fino));
  P.push(...caixa([-4.95, 1.9, 0.6], [0.04, 0.8, 0.55], "#7a4a22"));
  P.push(quad([-4.92, 1.55, 0.37], [-4.92, 1.55, 0.83], [-4.92, 2.25, 0.83], [-4.92, 2.25, 0.37], "#bfe3f2", fino));
  P.push(...caixa([-4.85, 2.6, 2.6], [0.2, 0.5, 0.5], "#2b2b2b"));
  P.push(...caixa([-4.7, 2.6, 2.6], [0.06, 0.62, 0.62], "#5c6670", 0, fino));
  // ---------- teto: bandeirinhas de dia de jogo ----------
  const cores = ["#1f9d55", "#f2c230", "#1d4e89", "#f4f4f2"];
  for (const zl of [-1.6, 1.0]) {
    const y = (x: number) => 2.98 - 0.22 * (1 - (x / 4.9) ** 2);
    const linha: V3[] = [];
    for (let x = -4.9; x <= 4.9; x += 0.35) {
      linha.push([x, y(x), zl]);
      P.push(quad([x, y(x), zl], [x + 0.26, y(x + 0.26), zl], [x + 0.13, y(x + 0.13) - 0.3, zl], [x + 0.13, y(x + 0.13) - 0.3, zl], cores[Math.round((x + 5) / 0.35) % 4], { borda: [true, true, true, true], ...fino }));
    }
    L.push(linha);
  }
  // ---------- balcão ----------
  // prateleira atrás do balcão com garrafas (cachaças, refri, vinho barato)
  P.push(...caixa([4.0, 1.75, -3.85], [2.0, 0.04, 0.28], "#7a4a22", 0, fino));
  P.push(...caixa([4.0, 2.35, -3.85], [2.0, 0.04, 0.28], "#7a4a22", 0, fino));
  const vidros = ["#5a2a0a", "#1f6f3a", "#c9a14a", "#8b1e2d", "#e6e2d6", "#3a5a8c", "#d9822b"];
  for (let i = 0; i < 9; i++) P.push(...garrafa(3.15 + i * 0.21, 1.77, -3.85, vidros[i % 7], 0.24 + r(`g${i}`) * 0.1));
  for (let i = 0; i < 8; i++) P.push(...garrafa(3.25 + i * 0.22, 2.37, -3.85, vidros[(i + 3) % 7], 0.22 + r(`h${i}`) * 0.12));
  // estufa de salgados (moldura de vidro) com coxinhas e pastéis
  P.push(...caixa([4.0, 1.13, -2.9], [0.9, 0.05, 0.5], "#c9ccd1", 0, fino));
  for (let i = 0; i < 6; i++) P.push(...caixa([3.68 + (i % 3) * 0.3, 1.21, -3.02 + Math.floor(i / 3) * 0.22], [0.12, 0.11, 0.12], i % 2 ? "#e0912f" : "#d4a24a", 0, fino));
  L.push([[3.55, 1.15, -2.65], [3.55, 1.5, -2.65], [4.45, 1.5, -2.65], [4.45, 1.15, -2.65]]);
  L.push([[3.55, 1.5, -2.65], [3.55, 1.5, -3.15], [4.45, 1.5, -3.15], [4.45, 1.5, -2.65]]);
  // maquininha de cartão, porta-guardanapo, palito, copos americanos, garrafa no balcão
  P.push(...caixa([2.4, 1.14, -2.75], [0.12, 0.05, 0.2], "#222", 0, fino));
  P.push(...caixa([2.85, 1.15, -2.7], [0.16, 0.12, 0.1], "#c9ccd1", 0, fino));
  P.push(...caixa([2.85, 1.17, -2.7], [0.12, 0.1, 0.02], "#f8f8f4", 0, fino));
  [[2.1, -2.7], [2.2, -2.85], [5.0 - 0.35, -2.7]].forEach(([x, z], i) => P.push(...copo(x, 1.1, z, i !== 1)));
  P.push(...garrafa(2.0, 1.1, -2.95, "#5a2a0a"));
  // banquetas na frente do balcão
  [2.4, 3.3, 4.2].forEach((x) => {
    P.push(...caixa([x, 0.76, -2.1], [0.36, 0.06, 0.36], "#c1121f", 0, fino));
    P.push(...caixa([x, 0.38, -2.1], [0.05, 0.74, 0.05], "#9aa0a6", 0, fino));
    P.push(...caixa([x, 0.03, -2.1], [0.32, 0.03, 0.32], "#9aa0a6", 0, fino));
  });
  // engradados empilhados e isopor
  P.push(...caixa([4.55, 0.16, -1.1], [0.55, 0.32, 0.38], "#f2c230"));
  P.push(...caixa([4.55, 0.48, -1.1], [0.55, 0.32, 0.38], "#c1121f"));
  for (let i = 0; i < 4; i++) P.push(...caixa([4.38 + (i % 2) * 0.32, 0.7, -1.2 + Math.floor(i / 2) * 0.2], [0.06, 0.12, 0.06], "#5a2a0a", 0, fino));
  P.push(...caixa([4.5, 0.2, 0.3], [0.6, 0.4, 0.4], "#f4f4f2"));
  P.push(...caixa([4.5, 0.42, 0.3], [0.64, 0.05, 0.44], "#3a86c8", 0, fino));
  // geladeira: garrafas atrás do vidro
  for (let row = 0; row < 3; row++)
    for (let i = 0; i < 6; i++) {
      const x = -0.2 + i * 0.15;
      const y = 0.55 + row * 0.42;
      P.push(quad([x, y, -3.13], [x + 0.08, y, -3.13], [x + 0.08, y + 0.28, -3.13], [x, y + 0.28, -3.13], vidros[(i + row) % 7], fino));
    }
  P.push(quad([-0.25, 1.82, -3.13], [0.65, 1.82, -3.13], [0.65, 1.9, -3.13], [-0.25, 1.9, -3.13], "#c1121f", fino));
  // ---------- mesas: copos, petisco, porta-guardanapo ----------
  const mesas: [number, number][] = [[-3, -0.8], [-0.6, -1.2], [-3.4, 1.4]];
  mesas.forEach(([x, z], k) => {
    P.push(...copo(x - 0.15, 0.745, z + 0.15));
    P.push(...copo(x + 0.2, 0.745, z - 0.2, k !== 1));
    P.push(...caixa([x - 0.1, 0.76, z - 0.12], [0.28, 0.02, 0.2], "#f4f4f2", 0, fino));
    for (let i = 0; i < 4; i++) P.push(...caixa([x - 0.18 + i * 0.05, 0.79, z - 0.12], [0.04, 0.04, 0.04], "#c97b2a", 0, fino));
    P.push(...caixa([x + 0.25, 0.8, z + 0.2], [0.1, 0.1, 0.06], "#c9ccd1", 0, fino));
  });
  // ---------- chão: guardanapo, tampinha, pano ----------
  for (let i = 0; i < 14; i++) {
    const x = -4.6 + r(`gx${i}`) * 9;
    const z = -3.4 + r(`gz${i}`) * 7;
    const s = 0.08 + r(`gs${i}`) * 0.08;
    P.push(quad([x, 0.004, z], [x + s, 0.004, z], [x + s, 0.004, z + s], [x, 0.004, z + s], i % 3 ? "#f8f6ef" : "#e0b23a", fino));
  }
  // ---------- perto da vitrine e da porta ----------
  P.push(quad([-4.2, 2.12, 3.9], [-0.6, 2.12, 3.9], [-0.6, 2.36, 3.9], [-4.2, 2.36, 3.9], "#c1121f", { borda: [true, false, true, false], ...fino }));
  for (let x = -4.0; x < -0.6; x += 0.25) L.push([[x, 2.12, 3.89], [x, 2.36, 3.89]]);
  P.push(...caixa([-4.5, 0.25, 3.55], [0.4, 0.5, 0.4], "#a0522d"));
  P.push(...caixa([-4.5, 0.75, 3.55], [0.75, 0.6, 0.7], "#2f8f3a"));
  P.push(...caixa([-4.5, 1.15, 3.5], [0.5, 0.35, 0.5], "#3aa64a", 0.5));
  for (let i = 0; i < 6; i++) P.push(...caixa([0.6, 0.47 + i * 0.07, 3.55], [0.46, 0.04, 0.44], "#c1121f", 0, fino));
  P.push(...caixa([0.6, 0.23, 3.55], [0.44, 0.46, 0.04], "#c1121f", 0, fino));
  P.push(...caixa([0.6, 0.85, 3.75], [0.44, 0.42, 0.04], "#c1121f", 0, fino));
  T.push({ centro: [-2.4, 1.9, 3.97], larg: 0.7, tipo: "placa" });

  // ---------- lá fora ----------
  const quente = (c: string, q: string) => (gold ? q : c);
  P.push(quad([-40, 0.01, 7], [40, 0.01, 7], [40, 0.01, 11.5], [-40, 0.01, 11.5], quente("#5d5a55", "#7a281e"), { tam: 4, brilha: gold }));
  for (let x = -20; x < 20; x += 3) P.push(quad([x, 0.02, 9.2], [x + 1.6, 0.02, 9.2], [x + 1.6, 0.02, 9.35], [x, 0.02, 9.35], quente("#f2f2ee", "#6a2a22"), fino));
  P.push(...caixa([0, 0.08, 6.9], [80, 0.16, 0.25], quente("#bdb4a4", "#9a3426"), 0, fino));
  // carros estacionados
  const carro = (x: number, z: number, cor: string) => {
    P.push(...caixa([x, 0.55, z], [3.9, 0.7, 1.7], cor));
    P.push(...caixa([x - 0.2, 1.15, z], [2.2, 0.55, 1.55], cor));
    P.push(quad([x - 1.3, 0.95, z - 0.79], [x + 0.9, 0.95, z - 0.79], [x + 0.75, 1.38, z - 0.79], [x - 1.15, 1.38, z - 0.79], quente("#26323d", "#1c1212"), fino));
    [-1.3, 1.3].forEach((dx) => P.push(...caixa([x + dx, 0.32, z - 0.86], [0.62, 0.62, 0.1], "#1a1a1a", 0, fino)));
  };
  carro(-6.5, 8.0, quente("#d62828", "#4a1612"));
  carro(4.5, 8.0, quente("#3a86c8", "#2a2030"));
  carro(-14, 10.6, quente("#f4f4f2", "#4a3a34"));
  // moto do Rafa
  P.push(...caixa([-0.6 + motoX, 0.45, 6.4], [1.6, 0.35, 0.3], "#c1121f"));
  P.push(...caixa([-0.6 + motoX, 0.85, 6.4], [0.5, 0.35, 0.42], "#c1121f"));
  [-1.25, 0.05].forEach((dx) => P.push(...caixa([-0.6 + motoX + dx, 0.3, 6.4], [0.6, 0.6, 0.12], "#1a1a1a", 0, fino)));
  // poste com fios, orelhão, lixeira
  P.push(...caixa([-3.2, 3.5, 6.8], [0.22, 7, 0.22], quente("#9aa0a6", "#3a2c28")));
  P.push(...caixa([-3.2, 6.6, 6.8], [1.6, 0.12, 0.12], quente("#9aa0a6", "#3a2c28"), 0, fino));
  L.push([[-25, 6.4, 6.8], [-12, 6.0, 6.8], [-3.2, 6.6, 6.8], [8, 6.1, 6.8], [25, 6.5, 6.8]]);
  L.push([[-25, 6.7, 6.9], [-12, 6.3, 6.9], [-3.2, 6.8, 6.9], [8, 6.4, 6.9], [25, 6.8, 6.9]]);
  P.push(...caixa([1.2, 1.0, 6.5], [0.12, 2.0, 0.12], "#7a7a7a", 0, fino));
  P.push(...caixa([1.2, 2.1, 6.5], [0.8, 0.8, 0.7], quente("#f28c28", "#5a2a1a")));
  P.push(...caixa([3.0, 0.45, 6.6], [0.45, 0.9, 0.45], quente("#2a9d8f", "#2a3028")));
  // prédios do outro lado, com janelas, sacadas e toldo
  const predios: [number, number, number, string][] = [[-12, 13, 7, "#c98a62"], [-6.5, 13, 5, "#7fb0c8"], [-1, 13.5, 9, "#d8b85e"], [4.8, 13, 6, "#e0956a"], [10.5, 13, 8, "#94c4c8"]];
  predios.forEach(([x, z, h, c], k) => {
    P.push(...caixa([x, h / 2, z], [5.2, h, 2], quente(c, "#a5341f"), 0, { brilha: gold }));
    const fz = z - 1.01;
    for (let andar = 1; andar < h / 2.6; andar++)
      for (let j = -1; j <= 1; j++) {
        const wx = x + j * 1.6;
        const wy = andar * 2.6 + 0.2;
        P.push(quad([wx - 0.45, wy, fz], [wx + 0.45, wy, fz], [wx + 0.45, wy + 1.1, fz], [wx - 0.45, wy + 1.1, fz], quente("#4a6a8a", r(`jan${k}${andar}${j}`) < 0.3 ? "#ff6a3a" : "#160c0a"), { borda: [true, true, true, true], ...fino }));
      }
    P.push(quad([x - 2.4, 2.6, fz], [x + 2.4, 2.6, fz], [x + 2.4, 2.2, fz - 0.8], [x - 2.4, 2.2, fz - 0.8], quente(k % 2 ? "#1d4e89" : "#c1121f", "#5a2a1a"), { borda: [true, true, true, true] }));
    P.push(quad([x - 1.2, 0.02, fz], [x + 1.2, 0.02, fz], [x + 1.2, 2.1, fz], [x - 1.2, 2.1, fz], quente("#6b6f75", "#160c0a"), { borda: [true, true, true, true], ...fino }));
  });
  return { prims: P, linhas: L, textos: T };
};
