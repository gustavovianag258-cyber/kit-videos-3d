import { Audio, interpolate, Sequence, staticFile } from "remotion";
import { clamp } from "../aurora/estilo";
import { CLIPES, clipe, palavra as p } from "./falas";
import { S } from "./tempos";

// Som do "Os blocos". Música só no fundinho da abertura. Até a boca, efeito em todo corte; depois,
// só o que assusta: coração, apito, ré, batida no bloco. Efeito abaixa quando alguém fala.
const FPS = 30;
const seg = (s: number) => Math.round(s * FPS);
const G = "gravidade/sons/";
const N = "namorada/sons/";
const I = "imortal/sons/";
const E = "aurora-ep5/sons/";
const B = "aurora-ep5b/sons/";

const ini = (id: string, d = 0) => clipe(id).inicio + d;
const fim = (id: string, d = 0) => clipe(id).fim + d;

type Efeito = { em: number; arq: string; vol: number };
const W = (em: number, vol = 0.24): Efeito => ({ em, arq: `${G}whoosh-curto.wav`, vol });
const dum = (em: number, vol = 0.4): Efeito => ({ em, arq: `${N}dum.wav`, vol });
const taque = (em: number, vol = 0.4): Efeito => ({ em, arq: `${G}taque.wav`, vol });
const aurora = (em: number, vol = 0.4): Efeito[] => [
  { em, arq: `${N}brilho.wav`, vol },
  { em, arq: `${N}dum.wav`, vol: vol * 0.8 },
];

const bateForma = p("n-re", "forma") - 0.4;
const batida = fim("o-31", 0.1);

const EFEITOS: Efeito[] = [
  // 1 gancho
  { em: 0.1, arq: `${G}fervura.wav`, vol: 0.2 },
  // 2 captura
  W(S.captura),
  { em: p("n-denis", "Mas") - 0.42, arq: `${I}tink.wav`, vol: 0.5 },
  taque(p("n-denis", "Mas") - 0.3, 0.6),
  W(p("n-denis", "Mas") - 0.1),
  { em: p("n-denis", "quilos") - 0.1, arq: `${N}ding.wav`, vol: 0.14 },
  { em: ini("n-agentes"), arq: `${G}kenney-footstep_concrete_000.wav`, vol: 0.4 },
  { em: ini("n-agentes", 0.6), arq: `${G}kenney-footstep_concrete_003.wav`, vol: 0.32 },
  { em: ini("n-agentes", 1.3), arq: `${G}kenney-footstep_concrete_000.wav`, vol: 0.32 },
  W(ini("d-laje", -0.1), 0.2),
  // 3 galpão
  dum(S.galpao, 0.44),
  W(ini("n-volta", -0.05)),
  { em: p("n-volta", "cada") - 0.1, arq: `${N}blip-grave.wav`, vol: 0.28 },
  W(ini("d-aguado", -0.1), 0.18),
  W(ini("a-anota", -0.2), 0.18),
  { em: ini("a-anota", 0.1), arq: `${N}teclado.wav`, vol: 0.14 },
  // 4 física
  { em: S.fisica, arq: `${G}fervura.wav`, vol: 0.3 },
  W(ini("n-peso", -0.05)),
  { em: ini("n-peso", 0.8), arq: `${N}ding.wav`, vol: 0.24 },
  { em: ini("n-peso", 1.6), arq: `${N}erro.wav`, vol: 0.24 },
  W(ini("n-boia", -0.05)),
  taque(p("n-boia", "tampa"), 0.6),
  dum(p("n-boia", "tampa") + 0.04, 0.44),
  { em: p("n-boia", "aperta"), arq: `${N}rangido.wav`, vol: 0.24 },
  W(ini("n-resp", -0.05), 0.18),
  { em: ini("n-resp", 0.2), arq: `${G}coracao.wav`, vol: 0.34 },
  // 5 regra
  { em: S.regra, arq: `${G}fervura.wav`, vol: 0.36 },
  { em: p("n-reacao", "poucas") - 0.1, arq: `${N}relogio.wav`, vol: 0.3 },
  { em: p("n-reacao", "pedra"), arq: `${N}racha.wav`, vol: 0.32 },
  dum(ini("a-solto", -0.2), 0.36),
  // 6 deu ruim: coração
  { em: S.ruim, arq: `${N}rangido.wav`, vol: 0.3 },
  taque(fim("n-boca"), 0.7),
  { em: fim("n-boca", 0.2), arq: `${G}coracao.wav`, vol: 0.62 },
  // 7 apito
  { em: S.apito - 0.9, arq: `${B}apito.wav`, vol: 0.34 },
  { em: ini("n-luz", 0.4), arq: `${I}toc.wav`, vol: 0.5 },
  { em: ini("n-luz", 0.65), arq: `${I}toc.wav`, vol: 0.5 },
  { em: ini("n-luz", 0.9), arq: `${N}dum.wav`, vol: 0.5 },
  ...aurora(ini("n-re", 0.05), 0.3),
  ...new Array(5).fill(0).map((_, i): Efeito => ({ em: ini("n-re", 0.9 + i * 0.56), arq: `${E}re.wav`, vol: 0.34 })),
  { em: bateForma, arq: `${N}estrondo.wav`, vol: 0.72 },
  { em: bateForma + 0.02, arq: `${N}racha.wav`, vol: 0.6 },
  { em: bateForma + 0.08, arq: `${N}desmorona.wav`, vol: 0.44 },
  { em: bateForma + 0.7, arq: `${I}splash.wav`, vol: 0.36 },
  // 8 cabine
  { em: S.cabine, arq: `${G}pneu.wav`, vol: 0.1 },
  taque(ini("o-lista", -0.2), 0.42),
  { em: p("o-lista", "porque") - 0.1, arq: `${N}dum.wav`, vol: 0.34 },
  ...aurora(ini("n-ninguem", 0.5), 0.3),
  // 9 1989
  { em: S.antes, arq: `${I}disco.wav`, vol: 0.16 },
  dum(ini("n-89", 0.05), 0.42),
  ...aurora(p("n-89", "verde"), 0.26),
  { em: ini("o-apontava", -0.05), arq: `${N}blip-grave.wav`, vol: 0.24 },
  taque(ini("o-levavam", 0.75), 0.54),
  { em: ini("o-levavam", 0.9), arq: `${G}motor.wav`, vol: 0.2 },
  // 10 blocos: silêncio e duas batidas de dentro
  { em: batida, arq: `${I}toc.wav`, vol: 0.96 },
  { em: batida + 0.03, arq: `${N}dum.wav`, vol: 0.5 },
  { em: batida + 0.55, arq: `${I}toc.wav`, vol: 0.96 },
  { em: batida + 0.58, arq: `${N}dum.wav`, vol: 0.5 },
  { em: fim("d-merda", 0.12), arq: `${I}toc.wav`, vol: 0.86 },
  // 11 contrato
  dum(S.contrato, 0.3),
  taque(p("n-contrato", "contratando"), 0.26),
  { em: p("e-parede", "atravessar"), arq: `${N}brilho.wav`, vol: 0.34 },
  { em: ini("a-assina", -0.05), arq: `${N}dum.wav`, vol: 0.32 },
  { em: ini("a-assina", 0.5), arq: `${N}teclado.wav`, vol: 0.14 },
  // final
  ...aurora(S.final + 0.1, 0.4),
];

const DUR: Record<string, number> = {
  "whoosh-curto": 0.45, brilho: 1.4, dum: 1.6, taque: 0.12, tique: 0.1, rangido: 1.5, ding: 1.0, erro: 0.75, "blip-grave": 0.5, racha: 1.4, estrondo: 2.0, desmorona: 2.4, coracao: 3.0, toc: 0.4, re: 0.45, splash: 1.2, teclado: 1.2, motor: 1.6, pneu: 0.9, tink: 1.6, fervura: 2.4, relogio: 1.6, apito: 1.5, disco: 1.6,
  "kenney-footstep_concrete_000": 0.3, "kenney-footstep_concrete_003": 0.3,
};
const nomeDe = (arq: string) => arq.split("/").pop()!.replace(".wav", "");

const envelopeVoz = (total: number) => {
  const bruto = new Float32Array(total);
  for (const c of CLIPES) for (const pl of c.palavras) for (let f = Math.max(0, seg(pl.s) - 2); f < Math.min(total, seg(pl.e) + 3); f++) bruto[f] = 1;
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
  { arq: "aurora/sons/aurora-fundo.wav", de: 0, ate: ini("n-agentes"), livre: 0.055, fala: 0.035, entra: 0.6, sai: 1.2 },
  { arq: `${E}chuva.wav`, de: S.captura, ate: S.galpao, livre: 0.12, fala: 0.022, entra: 0.3, sai: 0.4 },
  { arq: `${E}betoneira.wav`, de: ini("n-re", 0.8), ate: S.cabine - 0.4, livre: 0.42, fala: 0.2, entra: 0.5, sai: 0.8 },
  { arq: `${E}chuva.wav`, de: S.cabine - 0.2, ate: S.antes, livre: 0.12, fala: 0.022, entra: 0.5, sai: 0.4 },
  { arq: `${E}chuva.wav`, de: S.blocos - 0.1, ate: clipe("d-blocos").fim + 0.1, livre: 0.12, fala: 0.022, entra: 0.2, sai: 0.2 },
  { arq: `${E}chuva.wav`, de: ini("o-preciso", -0.1), ate: S.contrato - 0.1, livre: 0.12, fala: 0.022, entra: 0.2, sai: 0.3 },
  { arq: `${E}chuva.wav`, de: S.contrato, ate: S.final, livre: 0.12, fala: 0.022, entra: 0.3, sai: 0.4 },
];

const degrau = (v: number) => Math.round(v * 2000) / 2000;

export const SonsEp5b: React.FC<{ total: number }> = ({ total }) => {
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
              volume={(f) => degrau(interpolate(naVoz(de + f), [0, 1], [m.livre, m.fala]) * interpolate(f, [0, seg(m.entra)], [0, 1], clamp) * interpolate(f, [dur - seg(m.sai), dur], [1, 0], clamp) ** 1.6)}
            />
          </Sequence>
        );
      })}
      {ordem.map((e, i) => {
        const prox = ordem.slice(i + 1).find((o) => o.em > e.em + 0.05);
        const naoCorta = ["coracao", "apito", "estrondo"].includes(nomeDe(e.arq));
        const ate = Math.min(e.em + (DUR[nomeDe(e.arq)] ?? 1.5), prox && !naoCorta ? prox.em + 0.08 : Infinity);
        const de = Math.max(0, seg(e.em));
        const dur = Math.max(2, seg(ate - e.em));
        return (
          <Sequence key={i} from={de} durationInFrames={dur} layout="none">
            <Audio src={staticFile(e.arq)} volume={(f) => degrau(e.vol * interpolate(naVoz(de + f), [0, 1], [1, 0.3]) * interpolate(f, [dur - 3, dur], [1, 0], clamp))} />
          </Sequence>
        );
      })}
    </>
  );
};
