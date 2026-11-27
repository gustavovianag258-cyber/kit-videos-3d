// Gera um personagem 3D grátis, sem clicar em site nenhum:
//   1) FLUX.1-schnell (Hugging Face, licença livre) cria a imagem do personagem em T-pose
//   2) TRELLIS (Microsoft, MIT) transforma a imagem em modelo 3D pintado (.glb)
// Uso: node scripts/gerar-personagem.mjs <nome> "<descrição em inglês da pessoa e da roupa>" [semente]
// Saída: public/modelos/ia/<nome>/conceito.png e modelo.glb
import { Client, handle_file } from "@gradio/client";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

// chave grátis do Hugging Face (aumenta a cota de GPU) guardada em .env.local (fora do git)
const env = existsSync(".env.local") ? readFileSync(".env.local", "utf8") : "";
const HF_TOKEN = process.env.HF_TOKEN ?? /HF_TOKEN=(\S+)/.exec(env)?.[1];
const opcoes = HF_TOKEN ? { token: HF_TOKEN } : {};

const [, , nome, descricao, sementeArg] = process.argv;
if (!nome || !descricao) {
  console.log('Uso: node scripts/gerar-personagem.mjs <nome> "<descrição>" [semente]');
  process.exit(1);
}
const PASTA = `public/modelos/ia/${nome}`;
mkdirSync(PASTA, { recursive: true });

// Mesmo trecho de estilo para todos: o elenco sai da mesma "família" (estilo Culturaverso)
const ESTILO =
  "3D render of an adult with natural realistic body proportions (head is 1/8 of body height), lightly stylized like a Sims 4 or Pixar adult character, " +
  "smooth matte materials, simple clean clothes.";
const POSE = "Full body head to feet, front view, standing in T-pose with arms straight out to the sides, plain light gray background, no props, no text.";

const baixar = async (url, destino) => {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`download falhou (${r.status}) ${url}`);
  writeFileSync(destino, Buffer.from(await r.arrayBuffer()));
  return destino;
};

// 1) imagem de conceito
console.log("1/2 gerando a imagem do personagem (FLUX)…");
const flux = await Client.connect("black-forest-labs/FLUX.1-schnell", opcoes);
const semente = Number(sementeArg ?? 11);
const img = await flux.predict("/infer", {
  prompt: `${ESTILO} ${descricao}, ${POSE}`,
  seed: semente,
  randomize_seed: false,
  width: 768,
  height: 1024,
  num_inference_steps: 4,
});
const arqImg = await baixar(img.data[0].url, `${PASTA}/conceito.png`);
console.log("   imagem:", arqImg);

// 2) imagem → 3D
console.log("2/2 transformando em 3D (TRELLIS)… pode levar 1–3 min");
const trellis = await Client.connect("trellis-community/TRELLIS", opcoes);
await trellis.predict("/start_session", {}).catch(() => {});
const blob = new Blob([await (await fetch(img.data[0].url)).arrayBuffer()], { type: "image/png" });
const pre = await trellis.predict("/preprocess_image", { image: handle_file(blob) });
const res = await trellis.predict("/generate_and_extract_glb", {
  image: handle_file(await (await fetch(pre.data[0].url)).blob()),
  multiimages: [],
  seed: semente,
  ss_guidance_strength: 7.5,
  ss_sampling_steps: 12,
  slat_guidance_strength: 3,
  slat_sampling_steps: 12,
  multiimage_algo: "stochastic",
  mesh_simplify: 0.8, // 0,95 jogava fora 95% dos triângulos (ficava facetado)
  texture_size: 2048,
});
const glb = res.data.find((d) => d && typeof d === "object" && /\.glb/.test(d.url ?? d.path ?? "")) ?? res.data[2] ?? res.data[1];
const arqGlb = await baixar(glb.url, `${PASTA}/modelo.glb`);
console.log("   modelo 3D:", arqGlb);
process.exit(0);
