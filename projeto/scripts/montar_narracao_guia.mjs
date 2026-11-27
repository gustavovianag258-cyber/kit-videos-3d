// Monta a narração-guia e as legendas a partir de scripts/narracao-guia.json.
//
// Uso: node scripts/montar_narracao_guia.mjs              (voz-guia, falas em public/narracao-guia)
//      node scripts/montar_narracao_guia.mjs elevenlabs   (voz final, falas em public/elevenlabs)
// Gera:
//   public/narracao-guia.mp3 ou public/narracao-final.mp3 — todas as falas, cada uma no seu "inicio"
//   src/v2/narracao-guia.json      — volume da voz em cada frame (boca do astronauta)
//   src/legendas.ts                — blocos de legenda editáveis (máx. 2 linhas)
//
// "inicio" de cada fala = segundo em que a PRIMEIRA PALAVRA é dita no vídeo.
import { execSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";

const FPS = 30;
const config = JSON.parse(readFileSync("scripts/narracao-guia.json", "utf-8"));
const FONTE = process.argv[2] ?? "narracao-guia";
const FINAL = FONTE === "elevenlabs";
const SAIDA = FINAL ? "public/narracao-final.mp3" : "public/narracao-guia.mp3";
const { falas } = JSON.parse(readFileSync(`public/${FONTE}/falas.json`, "utf-8"));
const DURACAO = config.duracaoTotal;
const porId = Object.fromEntries(falas.map((f) => [f.id, f]));

// "seguir": true = a fala vem logo depois da anterior, com a MESMA pausa da gravação original
// (só funciona com a narração final, que guarda a "origem" de cada pedaço). Fica mais natural.
const itens = [];
for (const c of config.falas) {
  const f = porId[c.id];
  if (!f) throw new Error(`Fala ${c.id} não foi gerada. Rode gerar_narracao_guia.py antes.`);
  const ant = itens[itens.length - 1];
  let inicio = c.inicio;
  if (c.seguir && ant && f.origem !== undefined && ant.origem !== undefined) {
    inicio = ant.inicioArquivo + (f.origem - ant.origem);
  }
  // O arquivo tem um silêncio antes da primeira palavra: compensa para a palavra cair no "inicio"
  const inicioArquivo = c.seguir && ant && f.origem !== undefined ? inicio : inicio - f.palavras[0].inicio;
  itens.push({ ...f, inicioArquivo });
}

// 1) Mistura todas as falas num único MP3, completando com silêncio até o fim
const entradas = itens.map((f) => `-i public/${FONTE}/${f.arquivo}`).join(" ");
const atrasos = itens
  .map((f, i) => {
    const ms = Math.max(0, Math.round(f.inicioArquivo * 1000));
    return `[${i}]adelay=${ms}|${ms}[a${i}]`;
  })
  .join(";");
const rotulos = itens.map((_, i) => `[a${i}]`).join("");
const filtro = `${atrasos};${rotulos}amix=inputs=${itens.length}:normalize=0,apad,atrim=0:${DURACAO}`;
execSync(
  `npx remotion ffmpeg -y -loglevel error ${entradas} -filter_complex "${filtro}" -ar 44100 -b:a 192k ${SAIDA}`,
  { stdio: "inherit" },
);

// 2) Volume por frame (o ffmpeg do Remotion não exporta PCM cru; lemos um WAV)
const TAXA = 48000;
const WAV_TEMP = "out/narracao-guia-temp.wav";
mkdirSync("out", { recursive: true });
execSync(
  `npx remotion ffmpeg -y -loglevel error -i ${SAIDA} -ac 1 -ar ${TAXA} -c:a pcm_s16le ${WAV_TEMP}`,
  { stdio: "inherit" },
);
const wav = readFileSync(WAV_TEMP);
rmSync(WAV_TEMP);
let pos = 12;
while (wav.toString("ascii", pos, pos + 4) !== "data") pos += 8 + wav.readUInt32LE(pos + 4);
const dados = wav.subarray(pos + 8, pos + 8 + wav.readUInt32LE(pos + 4));
const amostras = new Int16Array(dados.buffer, dados.byteOffset, Math.floor(dados.length / 2));
const porFrame = TAXA / FPS;
const totalFrames = Math.round(DURACAO * FPS);
const rms = [];
for (let f = 0; f < totalFrames; f++) {
  let soma = 0;
  const ini = Math.floor(f * porFrame);
  const fim = Math.min(amostras.length, Math.floor((f + 1) * porFrame));
  for (let i = ini; i < fim; i++) soma += (amostras[i] / 32768) ** 2;
  rms.push(fim > ini ? Math.sqrt(soma / (fim - ini)) : 0);
}
const pico = Math.max(...rms) || 1;
writeFileSync(
  "src/v2/narracao-guia.json",
  JSON.stringify({ aviso: FINAL ? "Narração final (ElevenLabs)." : config.aviso, fps: FPS, volume: rms.map((v) => Math.round((v / pico) * 1000) / 1000) }),
);

// 3) Blocos de legenda: no máximo ~28 caracteres (2 linhas na fonte usada).
//    Divide por frase; frase longa vira pedaços de tamanho parecido (sem palavra sozinha);
//    frase muito curta ("E o ar?") se junta com a seguinte.
const LIMITE = 28;
const r2 = (n) => Math.round(n * 100) / 100;
const tamanho = (ps) => ps.map((p) => p.texto).join(" ").length;

const dividirEquilibrado = (ps) => {
  const total = tamanho(ps);
  const partes = Math.ceil(total / LIMITE);
  if (partes <= 1) return [ps];
  const alvo = total / partes;
  const saida = [];
  let atual = [];
  for (const p of ps) {
    if (atual.length && saida.length < partes - 1 && tamanho([...atual, p]) > alvo + 1) {
      saida.push(atual);
      atual = [];
    }
    atual.push(p);
  }
  saida.push(atual);
  // Bloco não termina em palavra "de ligação" (de, a, o, e...): ela passa para o bloco seguinte
  for (let i = 0; i < saida.length - 1; i++) {
    while (saida[i].length > 1 && LIGACAO.has(saida[i][saida[i].length - 1].texto.toLowerCase())) {
      saida[i + 1].unshift(saida[i].pop());
    }
  }
  return saida;
};
const LIGACAO = new Set(["de", "da", "do", "a", "o", "e", "um", "uma", "que", "com", "pro", "pra", "no", "na", "em"]);

// Divide uma frase nas vírgulas/dois-pontos/interrogações e junta os pedaços enquanto couberem
const dividirNasPausas = (ps) => {
  const pausas = [];
  let atual = [];
  for (const p of ps) {
    atual.push(p);
    if (/[,:?!.]$/.test(p.texto)) {
      pausas.push(atual);
      atual = [];
    }
  }
  if (atual.length) pausas.push(atual);
  const pedacos = pausas.flatMap((u) => (tamanho(u) > LIMITE ? dividirEquilibrado(u) : [u]));
  const saida = [];
  for (const p of pedacos) {
    const ultimo = saida[saida.length - 1];
    if (ultimo && tamanho([...ultimo, ...p]) <= LIMITE + 2) ultimo.push(...p);
    else saida.push([...p]);
  }
  return saida;
};

const blocos = [];
for (const f of itens) {
  const tokens = f.texto.split(" ");
  const palavras = f.palavras.map((p, i) => ({
    texto: tokens.length === f.palavras.length ? tokens[i] : p.texto,
    inicio: r2(f.inicioArquivo + p.inicio),
    fim: r2(f.inicioArquivo + p.fim),
  }));
  // Separa em frases
  const frases = [];
  let atual = [];
  for (const p of palavras) {
    atual.push(p);
    if (/[?.!]$/.test(p.texto)) {
      frases.push(atual);
      atual = [];
    }
  }
  if (atual.length) frases.push(atual);
  // Junta frase curta com a próxima
  const unidades = [];
  for (let i = 0; i < frases.length; i++) {
    if (tamanho(frases[i]) < 12 && i + 1 < frases.length) {
      frases[i + 1] = [...frases[i], ...frases[i + 1]];
    } else {
      unidades.push(frases[i]);
    }
  }
  for (const u of unidades) blocos.push(...dividirNasPausas(u));
}
const legendas = blocos.map((ps, i) => {
  const proximo = blocos[i + 1]?.[0].inicio ?? DURACAO;
  return {
    texto: ps.map((p) => p.texto).join(" "),
    inicio: r2(ps[0].inicio - 0.08),
    fim: r2(Math.min(proximo - 0.05, ps[ps.length - 1].fim + 0.6)),
    palavras: ps,
  };
});

const ts = `// LEGENDAS — arquivo de configuração, separado das animações.
// Gerado por scripts/montar_narracao_guia.mjs a partir da ${FINAL ? "NARRAÇÃO FINAL (ElevenLabs)" : "NARRAÇÃO-GUIA PROVISÓRIA"}.
// Tempos em segundos. Pode editar à mão (texto, inicio, fim de cada bloco).
// Se a narração definitiva chegar, os tempos são medidos de novo e este arquivo é regerado.

export type PalavraLegenda = { texto: string; inicio: number; fim: number };
export type BlocoLegenda = {
  texto: string;
  inicio: number;
  fim: number;
  palavras: PalavraLegenda[];
};

export const LEGENDAS_PROVISORIAS = ${!FINAL};

export const LEGENDAS: BlocoLegenda[] = ${JSON.stringify(legendas, null, 2)};
`;
writeFileSync("src/legendas.ts", ts);

for (const l of legendas) console.log(`${l.inicio.toFixed(2)} → ${l.fim.toFixed(2)}  ${l.texto}`);
