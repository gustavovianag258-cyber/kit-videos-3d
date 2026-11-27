import { Audio, interpolate, Sequence, staticFile } from "remotion";
import { clamp } from "../aurora/estilo";
import { CLIPES, clipe, palavra } from "./falas";
import { S } from "./tempos";

// Som do episódio 3. Música SÓ no fundinho da abertura, até o narrador apresentar o Seu Edson
// (v2: o usuário mandou tirar o Vastness e o drone do Olheiro, que "apareciam onde não era pra
// aparecer"). O resto é voz e muito efeito: "zap" quando vira fantasma, impacto, vento, porta.
// Efeito abaixa quando alguém fala e um entra, o outro sai.
const FPS = 30;
const seg = (s: number) => Math.round(s * FPS);
const G = "gravidade/sons/";
const N = "namorada/sons/";
const I = "imortal/sons/";
const A = "astral/sons/";

const ini = (id: string, d = 0) => clipe(id).inicio + d;
const fim = (id: string, d = 0) => clipe(id).fim + d;

type Efeito = { em: number; arq: string; vol: number };
const W = (em: number, vol = 0.3): Efeito => ({ em, arq: `${G}whoosh-curto.wav`, vol });
// assinatura da aurora: brilho + um "dum" grave (céu verde, poder, Olheiro)
const aurora = (em: number, vol = 0.5): Efeito[] => [
  { em, arq: `${N}brilho.wav`, vol },
  { em, arq: `${N}dum.wav`, vol: vol * 0.8 },
];
const atravessa = (em: number, vol = 0.45): Efeito => ({ em, arq: `${A}atravessar.wav`, vol });
// "zap" do poder ligando (vira fantasma)
const zap = (em: number, vol = 0.18): Efeito => ({ em, arq: `${G}laser.wav`, vol });
// sai do chão feito rolha e cai no capô (gancho e cena 10)
const rolha = (de: number): Efeito[] => [
  { em: de, arq: `${G}whoosh-medio.wav`, vol: 0.3 },
  { em: de + 0.3, arq: `${N}racha.wav`, vol: 0.4 },
  { em: de + 0.32, arq: `${G}pop-grave.wav`, vol: 0.5 },
  { em: de + 0.45, arq: `${G}whoosh-curto.wav`, vol: 0.3 },
  { em: de + 1.05, arq: `${G}impacto.wav`, vol: 0.45 },
  { em: de + 1.2, arq: `${N}alarme.wav`, vol: 0.18 },
  { em: de + 0.35, arq: `${N}onda-de-choque.wav`, vol: 0.2 },
];

const p = palavra;
const EFEITOS: Efeito[] = [
  // 1 gancho
  ...rolha(0),
  ...aurora(ini("n-ceu"), 0.55),
  // 3 guarita
  W(S.guarita),
  W(ini("e-ceu", -0.15)),
  { em: ini("e-ceu", 2.05), arq: `${N}brilho.wav`, vol: 0.25 },
  // 4 o lixo, a calçada e a regra
  W(S.lixo),
  { em: S.lixo + 0.3, arq: `${N}passo.wav`, vol: 0.25 },
  W(p("n-lixo", "prendeu")),
  { em: p("n-lixo", "prendeu") + 0.15, arq: `${G}inflar.wav`, vol: 0.25 },
  zap(p("n-lixo", "fede") - 0.05),
  atravessa(p("n-lixo", "fede")),
  { em: p("n-lixo", "fede") + 0.1, arq: `${N}brilho.wav`, vol: 0.35 },
  { em: ini("e-pe", 0.05), arq: `${G}pop-grave.wav`, vol: 0.55 },
  { em: ini("e-pe", 0.07), arq: `${N}saiu.wav`, vol: 0.4 },
  { em: ini("e-pe", 0.5), arq: `${G}impacto-leve.wav`, vol: 0.35 },
  { em: ini("n-regra"), arq: `${N}dum.wav`, vol: 0.4 },
  zap(ini("n-regra", 0.1), 0.14),
  { em: p("n-regra", "soltou"), arq: `${N}blip.wav`, vol: 0.3 },
  { em: p("n-regra", "dentro"), arq: `${N}blip.wav`, vol: 0.3 },
  { em: p("n-regra", "cuspido"), arq: `${G}pop.wav`, vol: 0.35 },
  // 4b a porta bate com a chave lá dentro
  { em: S.porta, arq: `${G}vento.wav`, vol: 0.3 },
  { em: S.porta + 0.5, arq: `${G}impacto.wav`, vol: 0.55 },
  { em: S.porta + 0.52, arq: `${N}estrondo.wav`, vol: 0.18 },
  W(p("n-porta", "chave")),
  { em: p("n-porta", "chave") + 0.3, arq: `${I}tink.wav`, vol: 0.35 },
  { em: p("n-porta", "chave") + 0.6, arq: `${I}toc.wav`, vol: 0.45 },
  { em: p("n-porta", "chave") + 0.85, arq: `${I}toc.wav`, vol: 0.45 },
  W(p("n-porta", "ou")),
  { em: p("n-porta", "chaveiro"), arq: `${N}ping.wav`, vol: 0.25 },
  zap(p("n-porta", "atravessava")),
  { em: p("n-porta", "atravessava") + 0.05, arq: `${N}brilho.wav`, vol: 0.3 },
  // 5 o empurrão
  W(S.fisica),
  W(p("n-parede", "parede")),
  { em: p("n-parede", "parede") + 0.5, arq: `${G}taque.wav`, vol: 0.35 },
  { em: p("n-parede", "parede") + 0.8, arq: `${G}taque.wav`, vol: 0.35 },
  { em: p("n-parede", "parede") + 1.1, arq: `${G}taque.wav`, vol: 0.35 },
  zap(p("n-parede", "desliga")),
  atravessa(p("n-parede", "desliga") + 0.3, 0.35),
  W(ini("n-empurrao")),
  { em: p("n-empurrao", "chão"), arq: `${N}blip.wav`, vol: 0.3 },
  { em: p("n-empurrao", "pulmão"), arq: `${N}blip.wav`, vol: 0.3 },
  { em: p("n-empurrao", "olho"), arq: `${N}blip.wav`, vol: 0.3 },
  { em: p("n-empurrao", "olho") + 0.5, arq: `${N}erro.wav`, vol: 0.3 },
  // 6 o fôlego
  W(S.folego),
  { em: S.folego + 0.2, arq: `${G}coracao.wav`, vol: 0.3 },
  W(ini("e-folego", -0.1)),
  { em: ini("e-folego", -0.05), arq: `${I}sopro.wav`, vol: 0.4 },
  { em: ini("e-folego", 0.8), arq: `${N}bipes.wav`, vol: 0.2 },
  // 7 sem atrito, a parede e o olho
  W(S.parede),
  zap(S.parede + 0.05),
  { em: S.parede + 0.2, arq: `${G}gelo.wav`, vol: 0.2 },
  W(p("n-atrito", "tem")),
  { em: p("n-atrito", "tem") + 0.2, arq: `${N}passo.wav`, vol: 0.3 },
  zap(p("n-atrito", "tem") + 0.65),
  atravessa(p("n-atrito", "tem") + 0.7, 0.5),
  { em: ini("e-luz", -0.35), arq: `${G}pop.wav`, vol: 0.35 },
  { em: ini("e-luz", -0.25), arq: `${I}sopro.wav`, vol: 0.3 },
  W(ini("n-cego")),
  { em: p("n-cego", "passa"), arq: `${N}erro.wav`, vol: 0.25 },
  // 8 o portão e o atalho
  { em: S.portao, arq: `${N}rangido.wav`, vol: 0.35 },
  { em: S.portao + 0.5, arq: `${G}kenney-impactMetal_light_001.wav`, vol: 0.4 },
  { em: p("n-travou", "síndico"), arq: `${G}buzina.wav`, vol: 0.3 },
  { em: p("n-travou", "buzinando") + 0.5, arq: `${G}buzina.wav`, vol: 0.3 },
  { em: fim("n-travou", 0.1), arq: `${G}buzina.wav`, vol: 0.3 },
  W(ini("e-atalho", -0.1)),
  W(ini("n-garagem")),
  { em: p("n-garagem", "menos"), arq: `${N}blip-grave.wav`, vol: 0.3 },
  // 9 aí deu ruim: a queda
  { em: S.queda, arq: `${G}whoosh-longo.wav`, vol: 0.4 },
  zap(S.queda + 0.15, 0.22),
  atravessa(S.queda + 0.2, 0.5),
  { em: S.queda + 1.5, arq: `${G}vento.wav`, vol: 0.18 },
  { em: S.queda + 0.9, arq: `${I}vento-queda.wav`, vol: 0.3 },
  W(ini("e-mmm", -0.1)),
  W(p("n-japao", "não") - 0.25),
  { em: p("n-japao", "caía"), arq: `${N}dum.wav`, vol: 0.35 },
  { em: p("n-japao", "sempre"), arq: `${G}mola.wav`, vol: 0.25 },
  // 10 sai do chão, o capô e o Bruno
  ...rolha(S.rolha),
  W(S.bruno),
  { em: S.bruno + 0.3, arq: `${G}kenney-impactMetal_light_001.wav`, vol: 0.35 },
  W(ini("e-filho", -0.15)),
  // 11 o livro, a câmera e o Olheiro
  { em: S.livro + 0.1, arq: `${N}mensagem.wav`, vol: 0.45 },
  { em: S.livro + 0.65, arq: `${N}mensagem.wav`, vol: 0.45 },
  { em: S.livro + 1.25, arq: `${N}mensagem.wav`, vol: 0.45 },
  W(p("o-vaga", "tenho")),
  { em: p("o-vaga", "tenho") + 0.05, arq: `${G}zumbido.wav`, vol: 0.08 },
  ...aurora(p("o-vaga", "tenho") + 0.9, 0.45),
  W(ini("e-livro", -0.15)),
  // 12 em casa: a apneia
  W(S.casa),
  { em: S.casa + 0.4, arq: `${G}impacto-leve.wav`, vol: 0.3 },
  zap(ini("n-queda", 0.05), 0.2),
  atravessa(ini("n-queda", 0.1), 0.45),
  { em: p("n-queda", "quinhentos"), arq: `${N}dum.wav`, vol: 0.45 },
  // 13 cartão final
  { em: S.final, arq: `${G}whoosh-longo.wav`, vol: 0.35 },
  { em: S.final + 0.1, arq: `${N}brilho.wav`, vol: 0.4 },
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
  { arq: "aurora/sons/aurora-fundo.wav", de: 0, ate: ini("n-edson"), livre: 0.055, fala: 0.035, entra: 0.6, sai: 1.2 },
];

const degrau = (v: number) => Math.round(v * 2000) / 2000;

export const SonsEp3: React.FC<{ total: number }> = ({ total }) => {
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
