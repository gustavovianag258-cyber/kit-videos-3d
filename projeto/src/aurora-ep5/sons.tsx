import { Audio, interpolate, Sequence, staticFile } from "remotion";
import { clamp } from "../aurora/estilo";
import { GANCHO_BATE } from "./dia";
import { CLIPES, clipe, palavra } from "./falas";
import { S } from "./tempos";

// Som do episódio 5. Música SÓ no fundinho da abertura, até o narrador apresentar o Denis. De dia,
// voz e muito efeito. De noite o tom vira: nada de whoosh, só chuva bem baixa e os poucos sons que
// assustam (porta de carro, ré do caminhão, tambor girando). Efeito abaixa quando alguém fala.
const FPS = 30;
const seg = (s: number) => Math.round(s * FPS);
const G = "gravidade/sons/";
const N = "namorada/sons/";
const I = "imortal/sons/";
const E = "aurora-ep5/sons/";

const ini = (id: string, d = 0) => clipe(id).inicio + d;
const p = palavra;

type Efeito = { em: number; arq: string; vol: number };
const W = (em: number, vol = 0.3): Efeito => ({ em, arq: `${G}whoosh-curto.wav`, vol });
const aurora = (em: number, vol = 0.5): Efeito[] => [
  { em, arq: `${N}brilho.wav`, vol },
  { em, arq: `${N}dum.wav`, vol: vol * 0.8 },
];
const metal = (em: number, vol = 0.55): Efeito => ({ em, arq: `${G}kenney-impactMetal_light_001.wav`, vol });
const bate = (em: number, vol = 0.45): Efeito => ({ em, arq: `${G}impacto-leve.wav`, vol });
const pop = (em: number, vol = 0.45): Efeito => ({ em, arq: `${G}pop-grave.wav`, vol });
const taque = (em: number, vol = 0.45): Efeito => ({ em, arq: `${G}taque.wav`, vol });

const hit = p("n-martelo", "próprio");
const quebra = p("n-tiao", "Quebrou") + 0.05;
const doNt = p("n-fisica2", "não");
const volta = p("n-fisica2", "volta");
const chao = p("n-fisica2", "chão") - 0.1;

const EFEITOS: Efeito[] = [
  // 1 gancho: ônibus, batida, lataria
  { em: 0, arq: `${G}motor.wav`, vol: 0.34 },
  { em: GANCHO_BATE - 0.3, arq: `${G}buzina.wav`, vol: 0.32 },
  bate(GANCHO_BATE, 0.6),
  metal(GANCHO_BATE, 0.7),
  { em: GANCHO_BATE + 0.02, arq: `${N}vidro.wav`, vol: 0.32 },
  W(1.3),
  pop(1.42, 0.4),
  ...aurora(S.ceu, 0.55),
  // 3 laje de madrugada
  W(S.laje),
  { em: ini("d-ceu", 0.05), arq: `${G}whoosh-curto.wav`, vol: 0.14 },
  // 4 martelo
  W(S.obra),
  taque(p("n-martelo", "errou"), 0.5),
  taque(p("n-martelo", "prego") + 0.05, 0.5),
  metal(hit, 0.6),
  { em: hit + 0.03, arq: `${G}mola.wav`, vol: 0.3 },
  W(hit + 0.22),
  { em: hit + 0.52, arq: `${G}pop-grave.wav`, vol: 0.6 },
  W(ini("d-porra", -0.05), 0.22),
  { em: ini("d-doeu", 0.25), arq: `${N}blip-grave.wav`, vol: 0.3 },
  W(ini("n-dedo", -0.05)),
  { em: p("n-dedo", "entortou"), arq: `${N}rangido.wav`, vol: 0.3 },
  // 5 física: colchão, aço, volta, chão
  W(S.fisica),
  W(p("n-fisica1", "pancada") - 0.1),
  { em: p("n-fisica1", "Gente"), arq: `${N}dum.wav`, vol: 0.3 },
  W(ini("n-fisica2", -0.05)),
  metal(doNt, 0.8),
  { em: doNt + 0.01, arq: `${I}tink.wav`, vol: 0.45 },
  W(p("n-fisica2", "Então")),
  bate(volta, 0.5),
  W(p("n-fisica2", "ou"), 0.22),
  { em: chao, arq: `${N}racha.wav`, vol: 0.5 },
  W(ini("d-parede", -0.05)),
  { em: ini("d-parede", 0.1), arq: `${N}ding.wav`, vol: 0.2 },
  // 6 marreta
  W(S.marreta),
  W(p("n-tiao", "Até")),
  { em: quebra - 0.2, arq: `${G}whoosh-medio.wav`, vol: 0.34 },
  metal(quebra, 0.6),
  { em: quebra, arq: `${N}racha.wav`, vol: 0.45 },
  { em: quebra + 0.5, arq: `${G}kenney-impactGeneric_light_002.wav`, vol: 0.7 },
  pop(quebra + 0.52, 0.45),
  W(p("n-tiao", "quase")),
  // 7 andaime, queda, calçada
  W(S.andaime),
  { em: p("n-ruim", "ruim"), arq: `${N}rangido.wav`, vol: 0.42 },
  W(p("n-ruim", "O")),
  metal(p("n-ruim", "soltou") - 0.1, 0.55),
  metal(p("n-ruim", "soltou") + 0.1, 0.45),
  { em: S.queda, arq: `${I}vento-queda.wav`, vol: 0.5 },
  { em: S.queda + 1.2, arq: `${G}vento.wav`, vol: 0.34 },
  { em: S.calcada, arq: `${N}estrondo.wav`, vol: 0.62 },
  { em: S.calcada + 0.02, arq: `${N}racha.wav`, vol: 0.5 },
  { em: S.calcada + 0.4, arq: `${I}splash.wav`, vol: 0.4 },
  W(p("n-corpo", "O"), 0.2),
  W(p("n-corpo", "Quem"), 0.24),
  { em: p("n-corpo", "Quem") + 0.1, arq: `${N}racha.wav`, vol: 0.3 },
  W(ini("d-caralho", -0.05)),
  // 8 hospital
  W(S.hospital),
  { em: S.hospital + 0.05, arq: `${N}bipes.wav`, vol: 0.14 },
  W(p("n-hospital", "mesmo")),
  { em: p("n-hospital", "mesmo") + 0.15, arq: `${N}brilho.wav`, vol: 0.22 },
  W(ini("n-agulhas", -0.35), 0.22),
  { em: ini("n-agulhas"), arq: `${I}tink.wav`, vol: 0.5 },
  { em: p("n-agulhas", "agulhas") + 0.02, arq: `${I}tink.wav`, vol: 0.5 },
  { em: p("n-agulhas", "tortas") + 0.05, arq: `${I}tink.wav`, vol: 0.55 },
  W(ini("n-sistema", -0.1), 0.2),
  { em: ini("n-sistema"), arq: `${N}teclado.wav`, vol: 0.28 },
  { em: p("n-sistema", "no"), arq: `${N}teclado.wav`, vol: 0.32 },
  { em: ini("n-le"), arq: `${N}ping.wav`, vol: 0.26 },
  { em: p("n-le", "não"), arq: `${N}dum.wav`, vol: 0.32 },
  // 9 noite: carro, portas, sem whoosh
  { em: S.noite + 0.05, arq: `${G}motor.wav`, vol: 0.2 },
  { em: S.noite + 1.3, arq: `${G}pneu.wav`, vol: 0.12 },
  taque(S.noite + 1.95, 0.32),
  taque(S.noite + 2.2, 0.32),
  ...[0, 1, 2, 3, 4].map((i): Efeito => ({ em: palavra("a-ceu", "É") + i * 0.27, arq: `${G}tique.wav`, vol: 0.28 })),
  { em: palavra("a-ceu", "É") + 1.1, arq: `${N}dum.wav`, vol: 0.32 },
  // 10 Olheiro: só o som da aurora, e um dum em cada lugar onde o carro já esteve
  ...aurora(S.olheiro + 0.5, 0.36),
  { em: ini("n-jonas", -0.05), arq: `${N}dum.wav`, vol: 0.28 },
  { em: ini("n-edson", -0.05), arq: `${N}dum.wav`, vol: 0.28 },
  { em: ini("n-kaique", -0.05), arq: `${N}dum.wav`, vol: 0.28 },
  ...new Array(14).fill(0).map((_, i): Efeito => ({ em: S.prancheta + i * 0.13, arq: `${G}tique.wav`, vol: 0.22 })),
  { em: S.prancheta + 1.25, arq: `${N}dum.wav`, vol: 0.45 },
  // 11 mensagem
  { em: S.quarto + 0.15, arq: `${N}mensagem.wav`, vol: 0.55 },
  { em: ini("d-quem", 0.5), arq: `${N}blip-grave.wav`, vol: 0.2 },
  // 12 o caminhão: o resto é ré e tambor
  { em: ini("a-solto", -0.15), arq: `${N}dum.wav`, vol: 0.34 },
  { em: ini("d-merda", 0.2), arq: `${G}coracao.wav`, vol: 0.32 },
  // final
  W(S.final),
  ...aurora(S.final + 0.15, 0.4),
  // ré do caminhão, um bipe por segundo enquanto ele encosta
  ...new Array(Math.max(0, Math.floor(palavra("n-respirar", "Mas") - S.caminhao))).fill(0).map((_, i): Efeito => ({ em: S.caminhao + 0.1 + i, arq: `${E}re.wav`, vol: 0.3 })),
];

// duração de cada arquivo (s), pra cortar o efeito quando o próximo entra
const DUR: Record<string, number> = {
  "whoosh-curto": 0.45, "whoosh-medio": 0.8, "whoosh-longo": 1.5, brilho: 1.4, dum: 1.6, bipes: 0.96, "impacto-leve": 1.2,
  mensagem: 0.18, "kenney-impactMetal_light_001": 0.25, "kenney-impactGeneric_light_002": 0.3, taque: 0.12, tique: 0.1, buzina: 0.7, rangido: 1.5, pop: 0.25, mola: 1.8,
  racha: 1.4, alarme: 1.7, impacto: 2.6, "pop-grave": 0.25, sopro: 0.55, gelo: 3.0, "vento-queda": 1.4, vento: 2.0, ding: 1.0, erro: 0.75, blip: 0.34, "blip-grave": 0.5, passo: 1.6,
  coracao: 3.0, zumbido: 2.5, estrondo: 2.0, saiu: 0.35, ping: 1.4, tink: 1.6, toc: 0.4, re: 0.45, splash: 1.2, vidro: 1.0, teclado: 1.2, motor: 1.6, pneu: 0.9,
};
const nomeDe = (arq: string) => arq.split("/").pop()!.replace(".wav", "");

// ---------- quando tem voz, o efeito e a música abaixam ----------
const envelopeVoz = (total: number) => {
  const bruto = new Float32Array(total);
  for (const c of CLIPES)
    for (const pl of c.palavras)
      for (let f = Math.max(0, seg(pl.s) - 2); f < Math.min(total, seg(pl.e) + 3); f++) bruto[f] = 1;
  const env = new Float32Array(total);
  let v = 0;
  for (let f = 0; f < total; f++) {
    v += (bruto[f] - v) * (bruto[f] > v ? 0.35 : 0.07);
    env[f] = v;
  }
  return env;
};

type Trilha = { arq: string; de: number; ate: number; livre: number; fala: number; entra: number; sai: number };
const TRILHAS: Trilha[] = [
  // abertura: fundinho bem baixo da aurora; para quando o narrador apresenta o Denis
  { arq: "aurora/sons/aurora-fundo.wav", de: 0, ate: ini("n-denis"), livre: 0.055, fala: 0.035, entra: 0.6, sai: 1.2 },
  // chuva: quase some debaixo da voz (nada de chiado por baixo da fala)
  { arq: `${E}chuva.wav`, de: S.noite - 0.2, ate: S.final, livre: 0.12, fala: 0.022, entra: 0.5, sai: 0.5 },
  // tambor da betoneira, grave, chegando
  { arq: `${E}betoneira.wav`, de: S.caminhao, ate: S.final, livre: 0.42, fala: 0.2, entra: 1.6, sai: 0.5 },
];

const degrau = (v: number) => Math.round(v * 2000) / 2000;

export const SonsEp5: React.FC<{ total: number }> = ({ total }) => {
  const voz = envelopeVoz(total);
  const naVoz = (f: number) => voz[Math.min(Math.max(0, f), total - 1)] ?? 0;
  const ordem = [...EFEITOS].sort((x, y) => x.em - y.em);
  return (
    <>
      {TRILHAS.map((m, i) => {
        const de = seg(m.de);
        const dur = seg(m.ate - m.de);
        return (
          <Sequence key={`m${i}`} from={de} durationInFrames={dur} layout="none">
            <Audio
              src={staticFile(m.arq)}
              volume={(f) =>
                degrau(
                  interpolate(naVoz(de + f), [0, 1], [m.livre, m.fala]) *
                    interpolate(f, [0, seg(m.entra)], [0, 1], clamp) *
                    interpolate(f, [dur - seg(m.sai), dur], [1, 0], clamp) ** 1.6,
                )
              }
            />
          </Sequence>
        );
      })}
      {ordem.map((e, i) => {
        // corta quando o próximo efeito (que comece depois deste) entra
        const prox = ordem.slice(i + 1).find((o) => o.em > e.em + 0.05);
        const ate = Math.min(e.em + (DUR[nomeDe(e.arq)] ?? 1.5), prox ? prox.em + 0.08 : Infinity);
        const de = Math.max(0, seg(e.em));
        const dur = Math.max(2, seg(ate - e.em));
        return (
          <Sequence key={i} from={de} durationInFrames={dur} layout="none">
            <Audio
              src={staticFile(e.arq)}
              volume={(f) => degrau(e.vol * interpolate(naVoz(de + f), [0, 1], [1, 0.3]) * interpolate(f, [dur - 3, dur], [1, 0], clamp))}
            />
          </Sequence>
        );
      })}
    </>
  );
};
