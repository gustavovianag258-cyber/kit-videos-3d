// Procura quadros pretos num MP4: extrai 3 quadros por segundo em tamanho pequeno (PNG)
// e mede o brilho médio de cada um. Uso: node scripts/checar_pretos.mjs out/arquivo.mp4
import { execSync } from "node:child_process";
import { mkdirSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { inflateSync } from "node:zlib";

const arquivo = process.argv[2];
const pasta = "out/checar-pretos";
rmSync(pasta, { recursive: true, force: true });
mkdirSync(pasta, { recursive: true });
execSync(`npx remotion ffmpeg -loglevel error -i ${arquivo} -r 3 -vf scale=54:96 ${pasta}/q%04d.png`, { stdio: "inherit" });

// Lê um PNG RGB/RGBA de 8 bits (o que o ffmpeg gera) e devolve o brilho médio de 0 a 255
const brilho = (buf) => {
  let pos = 8;
  let w = 0, h = 0, tipo = 0;
  const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const nome = buf.toString("ascii", pos + 4, pos + 8);
    const dados = buf.subarray(pos + 8, pos + 8 + len);
    if (nome === "IHDR") { w = dados.readUInt32BE(0); h = dados.readUInt32BE(4); tipo = dados[9]; }
    if (nome === "IDAT") idat.push(dados);
    pos += 12 + len;
  }
  const bpp = tipo === 6 ? 4 : 3;
  const raw = inflateSync(Buffer.concat(idat));
  const linha = w * bpp;
  const ant = Buffer.alloc(linha);
  const atual = Buffer.alloc(linha);
  let soma = 0;
  for (let y = 0; y < h; y++) {
    const filtro = raw[y * (linha + 1)];
    for (let x = 0; x < linha; x++) {
      const v = raw[y * (linha + 1) + 1 + x];
      const a = x >= bpp ? atual[x - bpp] : 0;
      const b = ant[x];
      const c = x >= bpp ? ant[x - bpp] : 0;
      let p = 0;
      if (filtro === 1) p = a;
      else if (filtro === 2) p = b;
      else if (filtro === 3) p = (a + b) >> 1;
      else if (filtro === 4) { const pa = Math.abs(b - c), pb = Math.abs(a - c), pc = Math.abs(a + b - 2 * c); p = pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      atual[x] = (v + p) & 255;
    }
    for (let x = 0; x < linha; x += bpp) soma += (atual[x] + atual[x + 1] + atual[x + 2]) / 3;
    atual.copy(ant);
  }
  return soma / (w * h);
};

const quadros = readdirSync(pasta).filter((f) => f.endsWith(".png")).sort();
const escuros = [];
let minimo = 255;
for (const [i, f] of quadros.entries()) {
  const b = brilho(readFileSync(`${pasta}/${f}`));
  minimo = Math.min(minimo, b);
  if (b < 4) escuros.push(`${(i / 3).toFixed(2)}s (brilho ${b.toFixed(1)})`);
}
console.log(`Quadros analisados: ${quadros.length} | brilho mínimo: ${minimo.toFixed(1)} de 255`);
console.log(escuros.length ? `Quase pretos: ${escuros.join(", ")}` : "Nenhum quadro preto encontrado.");
rmSync(pasta, { recursive: true, force: true });
