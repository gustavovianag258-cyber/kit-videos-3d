import { Audio, interpolate, Sequence, staticFile } from "remotion";
import { clamp } from "../aurora/estilo";
import { CLIPES, clipe, palavra } from "./falas";
import { S } from "./tempos";
import { passagens } from "./vida";

// Som do episódio 4. Música SÓ no fundinho da abertura, até o narrador apresentar o Kaique.
// O resto é voz e muito efeito: zap quando o raio-x liga, faíscas, impactos, mensagem.
// Efeito abaixa quando alguém fala e um entra, o outro sai.
const FPS = 30;
const seg = (s: number) => Math.round(s * FPS);
const G = "gravidade/sons/";
const N = "namorada/sons/";
const A = "astral/sons/";

const ini = (id: string, d = 0) => clipe(id).inicio + d;
const p = palavra;

type Efeito = { em: number; arq: string; vol: number };
const W = (em: number, vol = 0.3): Efeito => ({ em, arq: `${G}whoosh-curto.wav`, vol });
const aurora = (em: number, vol = 0.5): Efeito[] => [
  { em, arq: `${N}brilho.wav`, vol },
  { em, arq: `${N}dum.wav`, vol: vol * 0.8 },
];
// "zap" do raio-x ligando
const zap = (em: number, vol = 0.2): Efeito[] => [
  { em, arq: `${G}laser.wav`, vol },
  { em: em + 0.05, arq: `${N}brilho.wav`, vol: vol * 1.2 },
];
const pop = (em: number, vol = 0.45): Efeito => ({ em, arq: `${G}pop-grave.wav`, vol });
const clique = (em: number, vol = 0.4): Efeito => ({ em, arq: `${G}taque.wav`, vol });
const bate = (em: number, vol = 0.45): Efeito => ({ em, arq: `${G}impacto-leve.wav`, vol });

// moto: ronco curto chegando e freada
const moto = (em: number, vol = 0.3): Efeito[] => [
  { em, arq: `${G}motor.wav`, vol },
  { em: em + 0.75, arq: `${G}pneu.wav`, vol: vol * 0.9 },
];
// carro, ônibus e caminhão passando na rua (acompanham o trânsito da tela de tempos em tempos)
const passa = (em: number, vol = 0.14): Efeito => ({ em, arq: `${G}whoosh-medio.wav`, vol });

const EFEITOS: Efeito[] = [
  // 1 gancho: chega de moto, liga o raio-x, o bloco vira esqueleto
  ...moto(0, 0.34),
  W(1.15),
  ...zap(1.25, 0.28),
  { em: 1.3, arq: `${G}zumbido.wav`, vol: 0.12 },
  W(2.15),
  pop(2.25, 0.3),
  ...aurora(S.ceu, 0.55),
  // 3 moto de noite
  W(S.laje),
  { em: S.laje + 0.05, arq: `${G}motor.wav`, vol: 0.2 },
  passa(p("n-kaique", "fechando"), 0.16),
  W(p("n-kaique", "vinte")),
  { em: p("n-kaique", "vinte") + 0.1, arq: `${G}motor.wav`, vol: 0.2 },
  W(ini("k-lindo", -0.1)),
  { em: ini("k-lindo", 0.1), arq: `${N}passo.wav`, vol: 0.2 },
  { em: ini("k-lindo", 1.2), arq: `${N}brilho.wav`, vol: 0.2 },
  // 4 acorda e vê o osso
  W(S.osso),
  { em: S.osso + 0.05, arq: `${N}relogio.wav`, vol: 0.32 },
  W(p("n-osso", "olhou"), 0.2),
  ...zap(p("n-osso", "viu"), 0.3),
  bate(p("n-osso", "osso"), 0.35),
  W(ini("k-caralho", -0.05)),
  { em: ini("k-caralho", 0.1), arq: `${N}passo.wav`, vol: 0.25 },
  W(ini("k-gato", -0.1)),
  { em: ini("k-gato", 0.05), arq: `${N}brilho.wav`, vol: 0.28 },
  { em: ini("k-gato", 0.6), arq: `${A}miado.wav`, vol: 0.22 },
  // 5 regra liga/desliga
  W(S.regra),
  ...zap(p("n-regra", "olhou"), 0.28),
  W(p("n-regra", "piscou")),
  clique(p("n-regra", "piscou") + 0.1, 0.5),
  clique(p("n-regra", "desliga") + 0.28, 0.4),
  W(p("n-regra", "firmeza")),
  ...zap(p("n-regra", "firmeza"), 0.28),
  W(ini("k-interruptor")),
  clique(ini("k-interruptor"), 0.55),
  clique(ini("k-interruptor", 0.5), 0.5),
  clique(ini("k-interruptor", 1.0), 0.55),
  // 6 física
  W(S.fisica),
  { em: p("n-fisica1", "olho"), arq: `${N}blip.wav`, vol: 0.25 },
  W(p("n-fisica1", "raio-x")),
  ...zap(p("n-fisica1", "raio-x") + 0.1, 0.22),
  W(p("n-fisica1", "para")),
  { em: p("n-fisica1", "para"), arq: `${G}zumbido.wav`, vol: 0.14 },
  W(ini("n-fisica2", -0.05)),
  { em: p("n-fisica2", "osso"), arq: `${N}blip.wav`, vol: 0.25 },
  { em: p("n-fisica2", "metal"), arq: `${N}blip.wav`, vol: 0.25 },
  { em: p("n-fisica2", "chumbo"), arq: `${G}kenney-impactMetal_light_001.wav`, vol: 0.55 },
  W(p("n-fisica2", "raio-x")),
  { em: p("n-fisica2", "fração"), arq: `${N}blip.wav`, vol: 0.4 },
  W(p("n-fisica2", "dele") - 0.2),
  { em: p("n-fisica2", "dele"), arq: `${G}motor.wav`, vol: 0.2 },
  { em: p("n-fisica2", "dele") + 0.1, arq: `${G}riser.wav`, vol: 0.2 },
  W(ini("k-lanterna", -0.05)),
  ...zap(ini("k-lanterna", 0.1), 0.2),
  // 7 pizzaria: massa no ar, caixa deslizando, cebola, massa na cara
  W(S.pizza),
  { em: S.pizza + 0.2, arq: `${N}passo.wav`, vol: 0.22 },
  W(p("n-vantagem", "conferir") - 0.1),
  { em: p("n-vantagem", "conferir"), arq: `${G}whoosh-curto.wav`, vol: 0.3 },
  { em: p("n-vantagem", "conferir") + 0.32, arq: `${G}taque.wav`, vol: 0.3 },
  ...zap(p("n-vantagem", "conferir") + 0.45, 0.2),
  W(ini("k-cebola", -0.05)),
  { em: ini("k-cebola", 0.3), arq: `${G}zumbido.wav`, vol: 0.14 },
  pop(ini("k-cebola", 0.5), 0.3),
  pop(ini("k-cebola", 0.63), 0.3),
  pop(ini("k-cebola", 0.76), 0.3),
  pop(ini("k-cebola", 0.89), 0.3),
  { em: ini("k-cebola", 1.0), arq: `${N}erro.wav`, vol: 0.26 },
  W(ini("k-instinto", -0.05)),
  { em: ini("k-instinto", 0.4), arq: `${N}ding.wav`, vol: 0.2 },
  W(ini("n-zeno")),
  { em: ini("n-zeno", 0.02), arq: `${G}whoosh-curto.wav`, vol: 0.3 },
  { em: ini("n-zeno", 0.3), arq: `${N}saiu.wav`, vol: 0.45 },
  bate(ini("n-zeno", 0.3), 0.32),
  // 8 portaria e foto
  ...moto(S.portaria, 0.3),
  W(p("e-andar", "interfone") - 0.1),
  { em: p("e-andar", "palma"), arq: `${G}taque.wav`, vol: 0.55 },
  { em: p("e-andar", "palma") + 0.33, arq: `${G}taque.wav`, vol: 0.55 },
  { em: p("e-andar", "palma") + 0.66, arq: `${G}taque.wav`, vol: 0.5 },
  W(ini("n-foto", -0.05)),
  clique(ini("n-foto", 0.7), 0.5),
  { em: ini("n-foto", 0.72), arq: `${N}ping.wav`, vol: 0.18 },
  { em: p("n-chuvisco", "saiu"), arq: `${G}zumbido.wav`, vol: 0.2 },
  W(ini("n-sensor")),
  { em: ini("n-sensor", 0.1), arq: `${N}bipes.wav`, vol: 0.2 },
  W(ini("k-porra", -0.05)),
  { em: ini("k-porra", 0.55), arq: `${N}erro.wav`, vol: 0.28 },
  // 9 fila
  W(S.fila),
  ...zap(S.fila + 0.2, 0.25),
  { em: S.fila + 0.4, arq: `${G}zumbido.wav`, vol: 0.14 },
  pop(S.fila + 0.55, 0.3),
  pop(S.fila + 0.85, 0.3),
  pop(S.fila + 1.15, 0.3),
  pop(S.fila + 1.45, 0.3),
  W(p("n-escolhe", "bairro") - 1.2),
  { em: p("n-escolhe", "bairro") - 1.0, arq: `${G}whoosh-longo.wav`, vol: 0.3 },
  ...zap(p("n-escolhe", "bairro"), 0.22),
  W(ini("k-parafuso", -0.05)),
  { em: ini("k-parafuso", 0.4), arq: `${G}kenney-impactMetal_light_001.wav`, vol: 0.45 },
  W(ini("n-dona")),
  { em: ini("n-dona", 0.1), arq: `${G}whoosh-curto.wav`, vol: 0.4 },
  { em: ini("n-dona", 0.34), arq: `${G}impacto-leve.wav`, vol: 0.55 },
  { em: ini("n-dona", 0.36), arq: `${G}pop-grave.wav`, vol: 0.4 },
  W(ini("n-dona", 0.58), 0.22),
  // 10 deu ruim: corre, arde
  W(S.ruim),
  { em: p("n-ruim", "ruim"), arq: `${G}coracao.wav`, vol: 0.4 },
  { em: p("n-ruim", "ruim"), arq: `${G}impacto.wav`, vol: 0.3 },
  W(p("n-ruim", "lente")),
  { em: p("n-ruim", "lente") + 0.1, arq: `${G}fervura.wav`, vol: 0.14 },
  W(ini("k-pimenta", -0.05)),
  { em: ini("k-pimenta", 0.2), arq: `${G}fervura.wav`, vol: 0.2 },
  W(ini("n-radio", -0.05)),
  { em: ini("n-radio", 0.3), arq: `${G}kenney-impactMetal_light_001.wav`, vol: 0.5 },
  { em: p("n-radio", "chumbo"), arq: `${N}ding.wav`, vol: 0.22 },
  // 11 o esqueleto de boné
  W(S.esqueleto),
  ...aurora(p("n-esqueleto", "olhando"), 0.5),
  { em: p("n-esqueleto", "volta") + 0.2, arq: `${N}ping.wav`, vol: 0.35 },
  clique(p("n-esqueleto", "volta") + 0.25, 0.5),
  W(p("n-esqueleto", "boné") - 0.1, 0.2),
  W(p("n-esqueleto", "volta") + 1.1, 0.22),
  ...new Array(7).fill(0).map((_, i): Efeito => ({ em: p("n-esqueleto", "volta") + 1.22 + i * 0.11, arq: `${G}tique.wav`, vol: 0.3 })),
  { em: p("n-esqueleto", "volta") + 2.02, arq: `${N}ding.wav`, vol: 0.2 },
  // 12 celular
  W(S.celular),
  ...aurora(S.celular + 0.1, 0.32),
  W(p("o-encomenda", "tenho") - 0.1, 0.22),
  { em: p("o-encomenda", "tenho") - 0.05, arq: `${N}mensagem.wav`, vol: 0.55 },
  W(ini("k-quem", -0.05)),
  { em: ini("k-quem", 0.5), arq: `${N}blip-grave.wav`, vol: 0.3 },
  // 13 a caixa: passos, chega em casa, nada de atravessar, uma batida por dentro
  W(S.caixa),
  { em: S.caixa + 0.1, arq: `${N}passo.wav`, vol: 0.25 },
  { em: p("n-ninguem", "tinha"), arq: `${N}dum.wav`, vol: 0.3 },
  { em: p("n-ninguem", "atravessava") - 1.0, arq: `${G}zumbido.wav`, vol: 0.14 },
  { em: p("n-ninguem", "atravessava"), arq: `${N}erro.wav`, vol: 0.4 },
  { em: p("n-ninguem", "atravessava"), arq: `${N}dum.wav`, vol: 0.5 },
  W(ini("k-dentro", -0.05)),
  { em: ini("k-dentro", 0.2), arq: `${G}coracao.wav`, vol: 0.3 },
  W(clipe("k-dentro").fim + 0.05),
  { em: clipe("k-dentro").fim + 0.06, arq: `${N}dum.wav`, vol: 0.4 },
  { em: clipe("k-dentro").fim + 0.61, arq: `${N}dum.wav`, vol: 0.4 },
  // carros que passam de verdade, nas cenas de rua com trânsito
  ...[
    ...passagens(2.15, S.ceu),
    ...passagens(ini("k-lindo"), S.osso),
    ...passagens(p("n-escolhe", "bairro") - 1.2, ini("k-parafuso")),
    ...passagens(S.ruim, p("n-ruim", "lente")),
    ...passagens(ini("k-pimenta"), ini("n-radio")),
    ...passagens(ini("k-quem"), S.caixa),
  ].map((em) => passa(em - 0.4, 0.2)),
  W(clipe("k-dentro").fim + 0.8, 0.22),
  ...aurora(clipe("k-dentro").fim + 0.85, 0.45),
  // final
  W(S.final),
  ...aurora(S.final + 0.15, 0.4),
];

// duração de cada arquivo (s), pra cortar o efeito quando o próximo entra
const DUR: Record<string, number> = {
  "whoosh-curto": 0.45, "whoosh-medio": 0.8, "whoosh-longo": 1.5, brilho: 1.4, dum: 1.6, bipes: 0.96, "impacto-leve": 1.2,
  mensagem: 0.18, "kenney-impactMetal_light_001": 0.25, taque: 0.12, buzina: 0.7, rangido: 1.5, pop: 0.25, mola: 1.8,
  racha: 1.4, alarme: 1.7, impacto: 2.6, "pop-grave": 0.25, inflar: 2.6, atravessar: 1.4, sopro: 0.55, gelo: 3.0,
  "vento-queda": 1.4, ding: 1.0, erro: 0.75, blip: 0.34, "blip-grave": 0.5, passo: 1.6, laser: 0.7, vento: 2.0,
  coracao: 3.0, zumbido: 2.5, "onda-de-choque": 2.0, estrondo: 2.0, saiu: 0.35, ping: 1.4, tink: 1.6, toc: 0.4,
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

type Trilha = { arq: string; de: number; ate: number; desde?: number; livre: number; fala: number; entra: number; sai: number };
const TRILHAS: Trilha[] = [
  // abertura: fundinho bem baixo da aurora; para quando o narrador apresenta o Seu Edson
  { arq: "aurora/sons/aurora-fundo.wav", de: 0, ate: ini("n-kaique"), livre: 0.055, fala: 0.035, entra: 0.6, sai: 1.2 },
];

const degrau = (v: number) => Math.round(v * 2000) / 2000;

export const SonsEp4: React.FC<{ total: number }> = ({ total }) => {
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
              trimBefore={seg(m.desde ?? 0)}
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
