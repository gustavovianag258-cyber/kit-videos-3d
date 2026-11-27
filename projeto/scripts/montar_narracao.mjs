// Junta as falas em public/narracao.mp3 (15 s) e gera src/narracao.json com:
// - início de cada fala e de cada palavra (em segundos, no vídeo final)
// - volume da voz em cada frame (0 a 1), usado para mexer a boca do personagem
//
// Uso: node scripts/montar_narracao.mjs
import { execSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";

const FPS = 30;
const DURACAO = 15;
// Em que segundo do vídeo cada arquivo de fala começa a tocar
const INICIOS = [0.3, 2.6, 5.5, 8.75, 11.7];

const { falas } = JSON.parse(readFileSync("public/narracao/falas.json", "utf-8"));
if (falas.length !== INICIOS.length) throw new Error("INICIOS precisa ter um valor por fala");

// 1) Mistura as falas, cada uma no seu tempo, e completa com silêncio até 15 s
const entradas = falas.map((f) => `-i public/narracao/${f.arquivo}`).join(" ");
const atrasos = INICIOS.map((s, i) => {
  const ms = Math.round(s * 1000);
  return `[${i}]adelay=${ms}|${ms}[a${i}]`;
}).join(";");
const rotulos = INICIOS.map((_, i) => `[a${i}]`).join("");
const filtro = `${atrasos};${rotulos}amix=inputs=${falas.length}:normalize=0,apad,atrim=0:${DURACAO}`;
execSync(
  `npx remotion ffmpeg -y -loglevel error ${entradas} -filter_complex "${filtro}" -ar 44100 -b:a 192k public/narracao.mp3`,
  { stdio: "inherit" },
);

// 2) Volume por frame: decodifica para WAV mono e mede o RMS de cada frame
// (o ffmpeg do Remotion não tem o formato PCM "cru", então lemos o WAV direto)
const TAXA = 48000;
const WAV_TEMP = "out/narracao-temp.wav";
mkdirSync("out", { recursive: true });
execSync(
  `npx remotion ffmpeg -y -loglevel error -i public/narracao.mp3 -ac 1 -ar ${TAXA} -c:a pcm_s16le ${WAV_TEMP}`,
  { stdio: "inherit" },
);
const wav = readFileSync(WAV_TEMP);
rmSync(WAV_TEMP);
// Procura o bloco "data" do WAV, onde ficam as amostras
let pos = 12;
while (wav.toString("ascii", pos, pos + 4) !== "data") pos += 8 + wav.readUInt32LE(pos + 4);
const tamanho = wav.readUInt32LE(pos + 4);
const dados = wav.subarray(pos + 8, pos + 8 + tamanho);
const amostras = new Int16Array(dados.buffer, dados.byteOffset, Math.floor(dados.length / 2));
const porFrame = TAXA / FPS;
const totalFrames = DURACAO * FPS;
const rms = [];
for (let f = 0; f < totalFrames; f++) {
  let soma = 0;
  const ini = Math.floor(f * porFrame);
  const fim = Math.min(amostras.length, Math.floor((f + 1) * porFrame));
  for (let i = ini; i < fim; i++) soma += (amostras[i] / 32768) ** 2;
  rms.push(fim > ini ? Math.sqrt(soma / (fim - ini)) : 0);
}
const pico = Math.max(...rms) || 1;
const volume = rms.map((v) => Math.round((v / pico) * 1000) / 1000);

// 3) Tempos absolutos das falas e palavras
const saida = {
  fonte: "edge-tts",
  duracao: DURACAO,
  fps: FPS,
  falas: falas.map((f, i) => ({
    texto: f.texto,
    inicioArquivo: INICIOS[i],
    palavras: f.palavras.map((p) => ({
      texto: p.texto,
      inicio: Math.round((INICIOS[i] + p.inicio) * 1000) / 1000,
      fim: Math.round((INICIOS[i] + p.fim) * 1000) / 1000,
    })),
  })),
  volume,
};
writeFileSync("src/narracao.json", JSON.stringify(saida, null, 1));

for (const f of saida.falas) {
  const ps = f.palavras;
  console.log(`${ps[0].inicio.toFixed(2)}s -> ${ps[ps.length - 1].fim.toFixed(2)}s  ${f.texto}`);
}
