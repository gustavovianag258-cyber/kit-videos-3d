import { Audio, interpolate, Sequence, staticFile } from "remotion";
import palavrasAbertura from "./abertura-palavras.json";
import palavras from "./narracao-v3-palavras.json";
import { clamp, DURACAO_FRAMES, FPS, MARCOS, paraReal, REACOES, seg, TRECHOS_NARRACAO } from "./tempo";

// Trilha e efeitos sonoros (arquivos gerados por scripts/sons-gravidade.mjs).
// Os efeitos são marcados na linha-GUIA (g) — no mesmo momento da animação — ou em tempo REAL (r).

type Efeito = { id: string; g?: number; r?: number; vol: number };
type Ambiente = { id: string; de: number; ate: number; vol: number; fade?: number };

const EFEITOS: Efeito[] = [
  // Abertura: título, relógio chegando ao meio-dia
  { id: "whoosh-curto", r: 0.1, vol: 0.22 },
  { id: "pop-grave", g: 1.45, vol: 0.22 },
  { id: "tique", g: 0.3, vol: 0.2 },
  { id: "taque", g: 1.3, vol: 0.2 },
  { id: "tique", g: 2.3, vol: 0.2 },
  { id: "taque", g: 3.3, vol: 0.2 },
  { id: "sino-meio-dia", g: MARCOS.meioDia, vol: 0.26 },
  // A gravidade cai (o som começa um pouco antes do golpe)
  { id: "queda-gravidade", r: paraReal(MARCOS.quedaGravidade) - 0.12, vol: 0.16 },
  // Promessa: um "plop" por cartão
  { id: "pop", g: MARCOS.promessaPe, vol: 0.2 },
  { id: "pop", g: MARCOS.promessaAr, vol: 0.2 },
  { id: "pop", g: MARCOS.promessaTerra, vol: 0.24 },
  // Corpo: pulos, primeira pessoa, celular
  { id: "whoosh-medio", g: 14.4, vol: 0.14 },
  { id: "pulo", g: MARCOS.pulo, vol: 0.24 },
  { id: "kenney-footstep_concrete_000", g: MARCOS.pulo + 0.96, vol: 0.45 },
  { id: "whoosh-curto", g: 16.55, vol: 0.13 },
  { id: "pulo", g: 17.2, vol: 0.3 },
  { id: "kenney-footstep_concrete_003", g: 18.42, vol: 0.55 },
  { id: "whoosh-curto", g: MARCOS.celularCai, vol: 0.1 },
  { id: "kenney-impactGeneric_light_002", g: MARCOS.celularCai + 0.6, vol: 0.4 },
  { id: "whoosh-curto", g: 20.75, vol: 0.12 },
  // Pneus: o carro vem, freia, não para
  { id: "whoosh-medio", g: 23.95, vol: 0.14 },
  { id: "motor", g: 24.0, vol: 0.24 },
  { id: "pneu", g: MARCOS.freada, vol: 0.17 },
  { id: "buzina", g: 26.9, vol: 0.16 },
  { id: "whoosh-curto", g: 27.35, vol: 0.12 },
  { id: "pop", g: 28.6, vol: 0.18 },
  { id: "pop-grave", g: 29.0, vol: 0.2 },
  // Ar
  { id: "whoosh-longo", g: 32.6, vol: 0.18 },
  { id: "inflar", r: paraReal(MARCOS.diagramaAr) - 0.4, vol: 0.18 },
  { id: "whoosh-curto", g: 38.45, vol: 0.12 },
  // Panela, frio, Lua, espaço
  { id: "whoosh-medio", g: 43.9, vol: 0.14 },
  { id: "whoosh-medio", g: 46.9, vol: 0.14 },
  { id: "gelo", g: 48.4, vol: 0.2 },
  { id: "whoosh-longo", g: 52.6, vol: 0.16 },
  { id: "whoosh-longo", g: 58.1, vol: 0.16 },
  // A Terra solta: subida de tensão que termina no golpe
  { id: "riser", r: paraReal(MARCOS.terraSolta) - 3.4, vol: 0.11 },
  { id: "impacto", g: MARCOS.terraSolta, vol: 0.17 },
  { id: "whoosh-longo", g: MARCOS.terraSolta + 0.15, vol: 0.11 },
  { id: "whoosh-medio", g: MARCOS.paulistaCongelada - 0.1, vol: 0.14 },
  // Volta ao real
  { id: "whoosh-medio", g: 69.9, vol: 0.14 },
  { id: "religa", g: 70.3, vol: 0.2 },
  { id: "laser", g: MARCOS.laser, vol: 0.2 },
  // Balança
  { id: "whoosh-curto", g: 79.95, vol: 0.12 },
  { id: "kenney-impactMetal_light_001", g: 80.2, vol: 0.3 },
  { id: "mola", g: 80.3, vol: 0.2 },
  // Cartaz final
  { id: "whoosh-medio", g: MARCOS.cartaz - 0.05, vol: 0.2 },
  { id: "impacto-leve", g: MARCOS.cartaz + 0.45, vol: 0.2 },
  { id: "pop", g: MARCOS.cartaz + 0.9, vol: 0.18 },
];

// Sons contínuos (em linha-guia), repetidos enquanto a cena durar
// Sem camadas de chiado (vento, ondas, espaço): ruído contínuo soa como sussurro por baixo da voz.
const AMBIENTES: Ambiente[] = [
  { id: "coracao", de: 38.6, ate: 44, vol: 0.28 },
  { id: "fervura", de: 44, ate: 47, vol: 0.2 },
  { id: "zumbido", de: MARCOS.laser + 0.2, ate: 80, vol: 0.05 },
];

// Efeitos com corpo (pulo, passo, pneu, pop…) um pouco à frente; os "whooshes" são chiado e ficam como estão.
const GANHO_EFEITOS = 1.25;
const volumeEfeito = (e: Efeito) => (e.id.startsWith("whoosh") ? e.vol : Math.min(1, e.vol * GANHO_EFEITOS));

// ---------- A trilha abaixa sozinha quando alguém fala ----------
const momentosDeFala = (() => {
  const trechos: [number, number][] = [];
  type Palavras = { words: { text: string; type: string; start: number; end: number }[] };
  const soPalavras = (arq: Palavras) => arq.words.filter((p) => p.type === "word" && !p.text.startsWith("["));
  const lista = soPalavras(palavras as Palavras);
  const listaAbertura = soPalavras(palavrasAbertura as Palavras);
  for (const t of TRECHOS_NARRACAO)
    for (const p of t.arquivo === "abertura" ? listaAbertura : lista)
      if (p.start >= t.de && p.end <= t.ate + 0.05) trechos.push([p.start - t.de + t.em, p.end - t.de + t.em]);
  for (const r of REACOES) trechos.push([r.inicio, r.inicio + 1.3]);
  return trechos;
})();

// Envelope por quadro: desce rápido (0,1 s) e sobe devagar (0,5 s), para não "bombear"
const ABAIXA = (() => {
  const bruto = new Float32Array(DURACAO_FRAMES);
  for (const [a, b] of momentosDeFala)
    for (let f = Math.max(0, Math.floor(a * FPS) - 2); f < Math.min(DURACAO_FRAMES, Math.ceil(b * FPS) + 3); f++) bruto[f] = 1;
  const env = new Float32Array(DURACAO_FRAMES);
  let v = 0;
  for (let f = 0; f < DURACAO_FRAMES; f++) {
    v += (bruto[f] - v) * (bruto[f] > v ? 0.35 : 0.07);
    env[f] = v;
  }
  return env;
})();

// Volume em degraus de 0,0025: a mudança é inaudível e o ffmpeg recebe poucos valores diferentes
// (um valor por quadro gera uma expressão grande demais e a mixagem falha)
const degrau = (v: number) => Math.round(v * 400) / 400;

// Música: "Coffee or Tea" (Michael Ramir C., Mixkit — licença livre, sem crédito obrigatório),
// com os agudos cortados acima de 4,5 kHz. O arquivo está em −17,1 LUFS e a voz em −19,4: com estes
// volumes ela fica ~30 dB abaixo da voz enquanto alguém fala e ~22 dB abaixo nos respiros.
// Só uma cama: se ninguém notar a música, está certo.
const VOL_MUSICA_LIVRE = 0.06;
const VOL_MUSICA_FALA = 0.025;

export const Sons: React.FC = () => (
  <>
    <Audio
      src={staticFile("gravidade/sons/musica-coffee-or-tea.wav")}
      volume={(f) =>
        degrau(
          interpolate(ABAIXA[Math.min(f, DURACAO_FRAMES - 1)] ?? 0, [0, 1], [VOL_MUSICA_LIVRE, VOL_MUSICA_FALA]) *
            interpolate(f, [0, 12, DURACAO_FRAMES - 45, DURACAO_FRAMES], [0, 1, 1, 0], clamp),
        )
      }
    />
    {EFEITOS.map((e, i) => (
      <Sequence key={i} from={Math.max(0, seg(e.r ?? paraReal(e.g ?? 0)))} layout="none">
        <Audio src={staticFile(`gravidade/sons/${e.id}.wav`)} volume={volumeEfeito(e)} />
      </Sequence>
    ))}
    {AMBIENTES.map((a, i) => {
      const inicio = seg(paraReal(a.de));
      const dur = seg(paraReal(a.ate)) - inicio;
      const fade = seg(a.fade ?? 0.35);
      return (
        <Sequence key={`amb-${i}`} from={inicio} durationInFrames={dur} layout="none">
          <Audio
            src={staticFile(`gravidade/sons/${a.id}.wav`)}
            loop
            volume={(f) => degrau(a.vol * interpolate(f, [0, fade, dur - fade, dur], [0, 1, 1, 0], clamp))}
          />
        </Sequence>
      );
    })}
  </>
);
