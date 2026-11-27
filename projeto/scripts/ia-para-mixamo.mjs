// Converte o personagem gerado por IA (public/modelos/ia/<nome>/modelo.glb, do TRELLIS) no formato que
// o auto-rig do Mixamo aceita: um .zip com modelo.obj + modelo.mtl + textura.png, com 1,80 m de altura,
// pés no chão e centrado. Depois é só arrastar o .zip no Mixamo ("Upload Character").
// Uso: node scripts/ia-para-mixamo.mjs <nome>
import { execSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const nome = process.argv[2];
if (!nome) {
  console.log("Uso: node scripts/ia-para-mixamo.mjs <nome>");
  process.exit(1);
}
const pasta = `public/modelos/ia/${nome}`;
const glb = readFileSync(`${pasta}/modelo.glb`);
const lenJson = glb.readUInt32LE(12);
const j = JSON.parse(glb.toString("utf8", 20, 20 + lenJson));
const bin = glb.subarray(20 + lenJson + 8);

const view = (iv) => {
  const bv = j.bufferViews[iv];
  return bin.subarray(bv.byteOffset ?? 0, (bv.byteOffset ?? 0) + bv.byteLength);
};
const ler = (ia) => {
  const a = j.accessors[ia];
  const v = view(a.bufferView);
  const off = a.byteOffset ?? 0;
  const n = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 }[a.type];
  const T = { 5126: Float32Array, 5125: Uint32Array, 5123: Uint16Array }[a.componentType];
  return { dados: new T(v.buffer, v.byteOffset + off, a.count * n), n };
};

const prim = j.meshes[0].primitives[0];
const pos = ler(prim.attributes.POSITION).dados;
const uv = ler(prim.attributes.TEXCOORD_0).dados;
const idx = ler(prim.indices).dados;

// normaliza: altura 1,80 m, pés em y = 0, centrado em x/z
let min = [Infinity, Infinity, Infinity];
let max = [-Infinity, -Infinity, -Infinity];
for (let i = 0; i < pos.length; i += 3)
  for (let k = 0; k < 3; k++) {
    min[k] = Math.min(min[k], pos[i + k]);
    max[k] = Math.max(max[k], pos[i + k]);
  }
const escala = 1.8 / (max[1] - min[1]);
const cx = (min[0] + max[0]) / 2;
const cz = (min[2] + max[2]) / 2;

let obj = "mtllib modelo.mtl\no personagem\n";
for (let i = 0; i < pos.length; i += 3)
  obj += `v ${((pos[i] - cx) * escala).toFixed(5)} ${((pos[i + 1] - min[1]) * escala).toFixed(5)} ${((pos[i + 2] - cz) * escala).toFixed(5)}\n`;
for (let i = 0; i < uv.length; i += 2) obj += `vt ${uv[i].toFixed(5)} ${(1 - uv[i + 1]).toFixed(5)}\n`;
obj += "usemtl pele\ns 1\n";
for (let i = 0; i < idx.length; i += 3) {
  const [a, b, c] = [idx[i] + 1, idx[i + 1] + 1, idx[i + 2] + 1];
  obj += `f ${a}/${a} ${b}/${b} ${c}/${c}\n`;
}

const tmp = `out/mixamo-${nome}`;
rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });
writeFileSync(`${tmp}/modelo.obj`, obj);
writeFileSync(`${tmp}/modelo.mtl`, "newmtl pele\nKd 1 1 1\nmap_Kd textura.png\n");
const img = j.images[j.textures[j.materials[prim.material].pbrMetallicRoughness.baseColorTexture.index].source];
writeFileSync(`${tmp}/textura.png`, view(img.bufferView));

const zip = resolve(`out/${nome}-para-mixamo.zip`);
rmSync(zip, { force: true });
execSync(`powershell -NoProfile -Command "Compress-Archive -Path '${resolve(tmp)}\\*' -DestinationPath '${zip}'"`);
console.log(`pronto: ${zip}  (${idx.length / 3} triângulos, altura 1,80 m)`);
