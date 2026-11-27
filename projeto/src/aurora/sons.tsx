import { Audio, interpolate, Sequence, staticFile } from "remotion";
import { clamp } from "./estilo";
import { CLIPES, clipe } from "./falas";

// Som do episódio 1 (V4, pedido do usuário): música SÓ nos momentos de emoção — "Vastness"
// (Mixkit, etérea) no céu verde e quando o Jonas encolhe, e um drone sombrio no Olheiro.
// Na explicação do narrador não tem música. Efeito nunca por cima da voz (abaixa quando
// alguém fala) e não empilha: quando um entra, o anterior sai com um fade curto.
const FPS = 30;
const seg = (s: number) => Math.round(s * FPS);
const G = "gravidade/sons/";
const N = "namorada/sons/";
const I = "imortal/sons/";
const A = "astral/sons/";

// começo de cada cena (mesmas âncoras do Episodio.tsx)
const ini = (id: string, d = 0) => clipe(id).inicio + d;
const C = {
  s3: ini("j-diacho-ceu", 0.4),
  s4: ini("j-shopping", -0.2),
  s5: ini("n-fisica"),
  s6: ini("j-congelando"),
  s7: ini("n-arroz"),
  s8: ini("j-mae", -0.2),
  s9: ini("n-pudim"),
  s10: ini("j-capeta"),
  s11: ini("n-burra"),
  s12: ini("j-cego"),
  s13: ini("n-gota"),
  s14: ini("j-pronto", -0.2),
  s15: ini("o-vaga", -0.4),
  s16: ini("n-parte2", -0.1),
};

type Efeito = { em: number; arq: string; vol: number };
const W = (em: number, vol = 0.3): Efeito => ({ em, arq: `${G}whoosh-curto.wav`, vol });
// assinatura da aurora: brilho + um "dum" grave (céu verde, poder, Olheiro)
const aurora = (em: number, vol = 0.5): Efeito[] => [
  { em, arq: `${N}brilho.wav`, vol },
  { em, arq: `${N}dum.wav`, vol: vol * 0.8 },
];

const EFEITOS: Efeito[] = [
  { em: 0, arq: `${G}whoosh-medio.wav`, vol: 0.35 },
  { em: 1.0, arq: `${A}miado.wav`, vol: 0.35 },
  ...aurora(ini("n-ceu"), 0.55),
  W(C.s3),
  { em: C.s4, arq: `${I}despertador.wav`, vol: 0.45 },
  { em: ini("n-17cm"), arq: `${N}dum.wav`, vol: 0.5 },
  // 5 balança
  W(C.s5),
  W(C.s5 + 3.4),
  { em: C.s5 + 4.2, arq: `${N}bipes.wav`, vol: 0.25 },
  { em: C.s5 + 6.4, arq: `${G}whoosh-curto.wav`, vol: 0.35 },
  { em: C.s5 + 6.75, arq: `${G}impacto-leve.wav`, vol: 0.5 },
  W(C.s5 + 8.2),
  // 6 frio
  W(C.s6),
  { em: C.s6 + 0.1, arq: `${G}vento-gelado.wav`, vol: 0.3 },
  { em: C.s6 + 0.4, arq: `${G}tique.wav`, vol: 0.3 },
  { em: C.s6 + 1.2, arq: `${G}tique.wav`, vol: 0.3 },
  W(C.s6 + 3.9),
  // 7 arroz
  W(C.s7),
  { em: C.s7 + 0.9, arq: `${I}mordida.wav`, vol: 0.4 },
  { em: C.s7 + 1.9, arq: `${I}mordida.wav`, vol: 0.4 },
  { em: C.s7 + 2.9, arq: `${I}mordida.wav`, vol: 0.4 },
  { em: C.s7 + 4.4, arq: `${N}relogio.wav`, vol: 0.35 },
  { em: ini("j-fome", 0.7), arq: `${G}pop-grave.wav`, vol: 0.35 },
  // 8 a mãe
  W(C.s8),
  { em: ini("j-mae"), arq: `${N}ping.wav`, vol: 0.2 },
  W(C.s8 + 1.4),
  W(C.s8 + 5.0),
  { em: C.s8 + 5.3, arq: `${N}ding.wav`, vol: 0.25 },
  // 9 o Pudim acorda
  { em: C.s9, arq: `${N}dum.wav`, vol: 0.6 },
  { em: C.s9 + 1.8, arq: `${A}miado.wav`, vol: 0.5 },
  W(C.s9 + 3.4),
  // 10 perseguição e pulo
  { em: C.s10, arq: `${G}whoosh-medio.wav`, vol: 0.4 },
  { em: C.s10 + 0.9, arq: `${N}vidro.wav`, vol: 0.3 },
  { em: C.s10 + 1.6, arq: `${G}whoosh-longo.wav`, vol: 0.45 },
  { em: C.s10 + 2.8, arq: `${G}impacto-leve.wav`, vol: 0.6 },
  { em: C.s10 + 2.9, arq: `${G}mola.wav`, vol: 0.35 },
  W(C.s10 + 5.4),
  W(C.s10 + 8.0),
  // 11 debaixo do sofá: encolhe
  { em: C.s11, arq: `${N}dum.wav`, vol: 0.35 },
  { em: C.s11 + 3.6, arq: `${A}subida.wav`, vol: 0.4 },
  ...aurora(C.s11 + 4.8, 0.5),
  // 12 mundo borrado
  W(C.s12),
  { em: C.s12 + 0.2, arq: `${G}zumbido.wav`, vol: 0.15 },
  W(C.s12 + 2.2),
  // 13 a gota
  W(C.s13),
  { em: C.s13 + 3.2, arq: `${I}splash.wav`, vol: 0.5 },
  W(C.s13 + 4.6),
  W(C.s13 + 7.0),
  { em: C.s13 + 7.1, arq: `${I}splash.wav`, vol: 0.3 },
  // 14 volta ao tamanho de caneta
  ...aurora(C.s14, 0.45),
  // 15 o Olheiro
  { em: C.s15 + 0.1, arq: `${N}mensagem.wav`, vol: 0.5 },
  W(C.s15 + 4.8),
  W(C.s15 + 6.6),
  ...aurora(C.s15 + 6.6 + 1.2, 0.55),
  { em: C.s15 + 6.6 + 3.5, arq: `${N}dum.wav`, vol: 0.5 },
  // 16 cartão final
  { em: C.s16, arq: `${G}whoosh-longo.wav`, vol: 0.35 },
  { em: C.s16 + 0.1, arq: `${N}brilho.wav`, vol: 0.4 },
];

// duração de cada arquivo (s), pra cortar o efeito quando o próximo entra
const DUR: Record<string, number> = {
  "whoosh-curto": 0.45, "whoosh-medio": 0.8, "whoosh-longo": 1.5, brilho: 1.4, dum: 1.6, despertador: 2.1, miado: 0.55,
  bipes: 0.96, "impacto-leve": 1.2, "vento-gelado": 2.5, tique: 0.12, mordida: 0.7, relogio: 2.1, "pop-grave": 0.25,
  ping: 1.4, ding: 1.0, vidro: 0.9, mola: 1.8, subida: 1.9, zumbido: 2.0, splash: 1.1, mensagem: 0.18,
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

// ---------- trilhas por momento (não é música o tempo todo) ----------
type Trilha = { arq: string; de: number; ate: number; desde?: number; livre: number; fala: number; entra: number; sai: number };
const TRILHAS: Trilha[] = [
  // abertura: o céu fica verde, coisa bonita e misteriosa
  // (V5: a música do começo não encaixou; virou um fundinho bem baixo, só brilho e acorde)
  { arq: "aurora/sons/aurora-fundo.wav", de: 0, ate: ini("n-17cm"), livre: 0.08, fala: 0.05, entra: 0.6, sai: 1.8 },
  // o Jonas encolhe de novo (sofá → mundo borrado)
  { arq: "astral/musica-vastness.wav", de: C.s11 + 2.4, ate: C.s12 + 2.4, desde: 30, livre: 0.22, fala: 0.1, entra: 1.2, sai: 1.5 },
  // o Olheiro: sombrio, alguém está observando
  { arq: "aurora/sons/olheiro-sombrio.wav", de: C.s15, ate: C.s16 + 2.6, livre: 0.42, fala: 0.24, entra: 1.5, sai: 2.0 },
];

const degrau = (v: number) => Math.round(v * 2000) / 2000;

export const SonsAurora: React.FC<{ total: number }> = ({ total }) => {
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
        const fim = Math.min(e.em + (DUR[nomeDe(e.arq)] ?? 1.5), prox ? prox.em + 0.08 : Infinity);
        const de = Math.max(0, seg(e.em));
        const dur = Math.max(2, seg(fim - e.em));
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
