import { Audio, interpolate, Sequence, staticFile } from "remotion";
import { clamp } from "../aurora/estilo";
import { CLIPES, clipe, palavra } from "./falas";
import { S } from "./tempos";

// Som do episódio 2, nas regras aprovadas no ep. 1: sem música o tempo todo (fundinho da
// aurora na abertura, "Vastness" só quando ele se acalma, drone sombrio no Olheiro), narrador
// explicando sem música, efeito abaixa quando alguém fala e um entra, o outro sai.
const FPS = 30;
const seg = (s: number) => Math.round(s * FPS);
const G = "gravidade/sons/";
const N = "namorada/sons/";
const I = "imortal/sons/";

const ini = (id: string, d = 0) => clipe(id).inicio + d;
const fim = (id: string, d = 0) => clipe(id).fim + d;

type Efeito = { em: number; arq: string; vol: number };
const W = (em: number, vol = 0.3): Efeito => ({ em, arq: `${G}whoosh-curto.wav`, vol });
const metal = (em: number, vol = 0.4): Efeito => ({ em, arq: `${G}kenney-impactMetal_light_001.wav`, vol });
// assinatura da aurora: brilho + um "dum" grave (céu verde, poder, Olheiro)
const aurora = (em: number, vol = 0.5): Efeito[] => [
  { em, arq: `${N}brilho.wav`, vol },
  { em, arq: `${N}dum.wav`, vol: vol * 0.8 },
];

const EFEITOS: Efeito[] = [
  // 1 gancho: busão andando com ele grudado
  { em: 0, arq: `${G}whoosh-medio.wav`, vol: 0.35 },
  { em: 0.5, arq: `${G}buzina.wav`, vol: 0.25 },
  ...aurora(ini("n-ceu"), 0.55),
  // 3 laje
  W(S.laje),
  // 4 quarto: tudo de aço vindo pra ele
  { em: S.quarto, arq: `${I}despertador.wav`, vol: 0.4 },
  metal(S.quarto + 0.5),
  metal(S.quarto + 0.75),
  metal(S.quarto + 1.0),
  metal(S.quarto + 1.3),
  W(ini("b-cofrinho", -0.1)),
  W(ini("n-aco")),
  { em: ini("n-aco", 0.6), arq: `${I}tink.wav`, vol: 0.3 },
  // 5 geladeira e ação e reação
  W(S.geladeira),
  { em: S.geladeira + 0.45, arq: `${I}toc.wav`, vol: 0.5 },
  { em: S.geladeira + 1.1, arq: `${G}taque.wav`, vol: 0.4 },
  { em: S.geladeira + 1.4, arq: `${G}taque.wav`, vol: 0.4 },
  { em: S.geladeira + 1.7, arq: `${G}taque.wav`, vol: 0.4 },
  W(palavra("n-fisica", "ímã")),
  W(palavra("n-fisica", "quem")),
  { em: palavra("n-fisica", "quem") + 0.75, arq: `${G}pop.wav`, vol: 0.35 },
  { em: palavra("n-fisica", "quem") + 2.0, arq: `${G}impacto-leve.wav`, vol: 0.4 },
  // 6 bússola e sangue
  W(S.bussola),
  W(palavra("n-bussola", "bússola") + 0.6),
  { em: palavra("n-bussola", "bússola") + 0.7, arq: `${N}bipes.wav`, vol: 0.2 },
  { em: palavra("n-bussola", "bússola") + 1.1, arq: `${N}mensagem.wav`, vol: 0.4 },
  W(ini("b-polo", -0.1)),
  W(ini("n-sangue")),
  { em: ini("n-sangue", 1.4), arq: `${N}erro.wav`, vol: 0.25 },
  // 7 distância
  W(S.distancia),
  { em: palavra("n-rua", "dobrou"), arq: `${N}blip-grave.wav`, vol: 0.3 },
  // 8 ponto e busão por dentro
  W(S.ponto),
  { em: S.ponto + 0.5, arq: `${G}pneu.wav`, vol: 0.2 },
  W(S.dentro),
  metal(S.dentro + 0.9),
  metal(S.dentro + 1.15),
  metal(S.dentro + 1.4),
  metal(S.dentro + 1.65),
  { em: ini("c-sombrinha", 0.2), arq: `${N}rangido.wav`, vol: 0.3 },
  W(fim("b-fisica", 0.2)),
  ...aurora(fim("b-fisica", 1.0), 0.5),
  // 9 aí deu ruim
  { em: S.ruim, arq: `${G}whoosh-longo.wav`, vol: 0.4 },
  { em: ini("b-puta", -0.2), arq: `${G}buzina.wav`, vol: 0.3 },
  W(ini("n-toneladas")),
  W(palavra("n-toneladas", "ele")),
  W(palavra("n-toneladas", "adivinha")),
  W(S.atrito),
  { em: S.atrito + 0.3, arq: `${G}pop.wav`, vol: 0.3 },
  // 10 a regra
  { em: ini("n-regra"), arq: `${N}dum.wav`, vol: 0.4 },
  W(fim("n-regra", 0.3)),
  { em: fim("n-regra", 0.8), arq: `${G}mola.wav`, vol: 0.3 },
  // 11 a mensagem e o Olheiro
  { em: S.mensagem + 0.1, arq: `${N}mensagem.wav`, vol: 0.5 },
  W(fim("o-final", 0.1)),
  ...aurora(fim("o-final", 1.0), 0.5),
  W(ini("b-sabe", -0.1)),
  // 12 a trave
  W(S.quadra),
  { em: palavra("n-trave", "trave") - 0.2, arq: `${N}dum.wav`, vol: 0.5 },
  { em: palavra("n-trave", "trave") + 0.6, arq: `${I}tink-grave.wav`, vol: 0.35 },
  W(S.sefudeu),
  // 13 cartão final
  { em: S.final, arq: `${G}whoosh-longo.wav`, vol: 0.35 },
  { em: S.final + 0.1, arq: `${N}brilho.wav`, vol: 0.4 },
];

// duração de cada arquivo (s), pra cortar o efeito quando o próximo entra
const DUR: Record<string, number> = {
  "whoosh-curto": 0.45, "whoosh-medio": 0.8, "whoosh-longo": 1.5, brilho: 1.4, dum: 1.6, despertador: 2.1, bipes: 0.96,
  "impacto-leve": 1.2, mensagem: 0.18, "kenney-impactMetal_light_001": 0.25, tink: 1.6, "tink-grave": 1.6, taque: 0.12,
  pneu: 4.8, toc: 0.4, buzina: 0.7, rangido: 1.5, pop: 0.25, mola: 1.8,
};
const nomeDe = (arq: string) => arq.split("/").pop()!.replace(".wav", "");

// ---------- quando tem voz, o efeito e a música abaixam ----------
const envelopeVoz = (total: number) => {
  const bruto = new Float32Array(total);
  for (const c of CLIPES)
    for (const p of c.palavras)
      for (let f = Math.max(0, seg(p.s) - 2); f < Math.min(total, seg(p.e) + 3); f++) bruto[f] = 1;
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
  // abertura: fundinho bem baixo da aurora (acorde + cristais); para quando o narrador apresenta o Bruno
  { arq: "aurora/sons/aurora-fundo.wav", de: 0, ate: clipe("n-bruno").inicio, livre: 0.055, fala: 0.035, entra: 0.6, sai: 1.2 },
  // ele respira e o ímã solta
  { arq: "astral/musica-vastness.wav", de: S.regra, ate: fim("n-regra", 1.2), desde: 30, livre: 0.22, fala: 0.1, entra: 1.2, sai: 1.5 },
  // o Olheiro: no busão e na mensagem
  { arq: "aurora/sons/olheiro-sombrio.wav", de: fim("b-fisica", 0.2), ate: S.ruim, livre: 0.42, fala: 0.24, entra: 0.6, sai: 0.8 },
  { arq: "aurora/sons/olheiro-sombrio.wav", de: S.mensagem, ate: S.final + 2.6, livre: 0.42, fala: 0.24, entra: 1.5, sai: 2.0 },
];

const degrau = (v: number) => Math.round(v * 2000) / 2000;

export const SonsEp2: React.FC<{ total: number }> = ({ total }) => {
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
