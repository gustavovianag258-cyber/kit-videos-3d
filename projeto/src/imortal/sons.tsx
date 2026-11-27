import { Audio, interpolate, Sequence, staticFile } from "remotion";
import vozes from "./vozes.json";
import { clamp, DURACAO_FRAMES, ETIQUETAS, FPS, HUDS, MARCOS, PLANOS, seg, SELOS } from "./tempo";

// Música e efeitos. A voz aprovada não passa por aqui (entra pronta em Video.tsx).
// Música: uma faixa só ("Coffee or Tea", Mixkit), constante; o clima muda pelo volume e por uma
// versão ABAFADA da mesma faixa, tocando junto e sincronizada (nunca troca de música).

type Efeito = { arq: string; em: number; vol: number };
const G = "gravidade/sons/";
const N = "namorada/sons/";
const I = "imortal/sons/";

// whoosh baixo em cada corte (os cortes secos ficam secos)
const WHOOSHES: Efeito[] = PLANOS.filter((p) => p.tr !== "seco" && p.de > 0).map((p, i) => ({
  arq: `${G}${i % 3 === 2 ? "whoosh-medio" : "whoosh-curto"}.wav`,
  em: p.de - 0.12,
  vol: p.tr === "glitch" ? 0.11 : 0.085,
}));

// blip quando o HUD muda de número, pop nos selos, blip nas etiquetas
const BLIPS: Efeito[] = [
  ...HUDS.filter((h, i) => i === 0 || JSON.stringify(h.valor) !== JSON.stringify(HUDS[i - 1].valor)).map((h) => ({
    arq: `${N}${h.alerta ? "blip-grave" : "blip"}.wav`,
    em: h.de,
    vol: 0.13,
  })),
  ...SELOS.map((s) => ({ arq: `${G}pop.wav`, em: s.de, vol: 0.2 })),
  ...ETIQUETAS.map((e) => ({ arq: `${N}blip.wav`, em: e.de, vol: 0.08 })),
];

const EFEITOS: Efeito[] = [
  ...WHOOSHES,
  ...BLIPS,
  // 1. o despertador de segunda 7h
  { arq: `${I}despertador.wav`, em: MARCOS.despertador, vol: 0.3 },
  { arq: `${G}taque.wav`, em: 1.72, vol: 0.18 }, // a mão batendo no despertador
  { arq: `${N}dum.wav`, em: 0.05, vol: 0.16 },
  // 2. os testes
  { arq: `${G}pulo.wav`, em: 9.05, vol: 0.14 },
  { arq: `${I}splash.wav`, em: MARCOS.splash, vol: 0.3 },
  { arq: `${I}mordida.wav`, em: MARCOS.mordida - 0.02, vol: 0.42 },
  { arq: `${I}splash.wav`, em: MARCOS.mordida + 0.05, vol: 0.14 },
  { arq: `${G}whoosh-longo.wav`, em: 11.55, vol: 0.12 }, // o pulo do prédio
  { arq: `${I}vento-queda.wav`, em: MARCOS.pulo, vol: 0.2 },
  { arq: `${N}estrondo.wav`, em: MARCOS.impacto - 0.02, vol: 0.5 },
  { arq: `${G}impacto.wav`, em: MARCOS.impacto, vol: 0.32 },
  { arq: `${N}racha.wav`, em: MARCOS.impacto + 0.1, vol: 0.18 },
  { arq: `${N}desmorona.wav`, em: MARCOS.impacto + 0.35, vol: 0.12 },
  { arq: `${G}kenney-footstep_concrete_000.wav`, em: 18.2, vol: 0.18 }, // ele se levantando
  { arq: `${G}kenney-footstep_concrete_003.wav`, em: 18.75, vol: 0.16 },
  { arq: `${G}pop.wav`, em: 22.75, vol: 0.12 }, // joinha
  // 3. família
  { arq: `${N}brilho.wav`, em: 24.85, vol: 0.14 },
  { arq: `${G}sino-meio-dia.wav`, em: MARCOS.sinoCasamento, vol: 0.14 },
  { arq: `${N}brilho.wav`, em: 28.65, vol: 0.12 },
  { arq: `${G}coracao.wav`, em: 29.85, vol: 0.12 },
  // 4. as famílias
  { arq: `${N}dum.wav`, em: MARCOS.velorio, vol: 0.22 },
  { arq: `${G}pop.wav`, em: 36.35, vol: 0.16 },
  { arq: `${G}pop.wav`, em: 36.7, vol: 0.16 },
  { arq: `${G}pop.wav`, em: 37.5, vol: 0.18 },
  ...MARCOS.sopra.map((em) => ({ arq: `${I}sopro.wav`, em, vol: 0.26 })),
  { arq: `${N}relogio.wav`, em: 38.75, vol: 0.1 }, // os anos passando no HUD
  { arq: `${G}pop-grave.wav`, em: 41.2, vol: 0.12 },
  // 5. alienígenas
  { arq: `${N}relogio.wav`, em: 43.3, vol: 0.1 },
  { arq: `${I}disco.wav`, em: MARCOS.disco, vol: 0.32 },
  { arq: `${G}laser.wav`, em: MARCOS.raios, vol: 0.12 },
  { arq: `${G}laser.wav`, em: MARCOS.raios + 0.22, vol: 0.1 },
  { arq: `${G}laser.wav`, em: MARCOS.raios + 0.45, vol: 0.08 },
  { arq: `${G}laser.wav`, em: MARCOS.disparo, vol: 0.3 },
  { arq: `${G}impacto-leve.wav`, em: MARCOS.bateLaser, vol: 0.3 },
  { arq: `${N}dum.wav`, em: 48.6, vol: 0.18 }, // "Nada."
  { arq: `${G}zumbido.wav`, em: 49.65, vol: 0.06 },
  // 6. o fim da Terra
  { arq: `${G}riser.wav`, em: 61.0, vol: 0.12 },
  { arq: `${N}racha.wav`, em: 63.7, vol: 0.24 },
  { arq: `${N}explosao.wav`, em: MARCOS.terraAcaba - 0.03, vol: 0.62 },
  { arq: `${N}dum.wav`, em: 65.1, vol: 0.2 },
  // 7. espaço: só o acorde grave do espaço, e as estrelas apagando
  { arq: `${I}espaco.wav`, em: MARCOS.silencio, vol: 0.26 },
  ...MARCOS.estrelaApaga.map((em, i) => ({ arq: `${I}tink.wav`, em, vol: 0.05 + i * 0.006 })),
  { arq: `${I}tink-grave.wav`, em: MARCOS.ultima, vol: 0.12 },
  // 8. o infinito
  { arq: `${G}tique.wav`, em: 76.6, vol: 0.08 },
  ...MARCOS.pecas.map((em) => ({ arq: `${I}toc.wav`, em: em + 0.4, vol: 0.3 })),
  { arq: `${N}brilho.wav`, em: MARCOS.infinito - 0.3, vol: 0.24 },
  { arq: `${N}dum.wav`, em: MARCOS.infinito, vol: 0.16 },
  // 9. volta ao real
  { arq: `${I}despertador.wav`, em: MARCOS.despertador2, vol: 0.28 },
  { arq: `${G}taque.wav`, em: 87.95, vol: 0.18 },
  { arq: `${N}mensagem.wav`, em: MARCOS.ligar, vol: 0.18 },
  // 10. chamada
  { arq: `${G}pop.wav`, em: MARCOS.cartaz + 0.3, vol: 0.24 },
  { arq: `${G}impacto-leve.wav`, em: MARCOS.cartaz + 0.3, vol: 0.14 },
  { arq: `${N}blip.wav`, em: MARCOS.cartaz + 0.75, vol: 0.13 },
  { arq: `${G}pop.wav`, em: 96.68, vol: 0.18 },
  { arq: `${N}ding.wav`, em: 97.1, vol: 0.2 }, // notificação
];

// Ronco grave embaixo do Sol inchando (só graves, nada de chiado)
const RONCO = { de: 61.75, ate: 64.3, vol: 0.22 };

// ---------- A música abaixa quando alguém fala ----------
const ABAIXA = (() => {
  const bruto = new Float32Array(DURACAO_FRAMES);
  for (const p of vozes.pecas)
    for (let f = Math.max(0, Math.floor(p.inicio * FPS) - 2); f < Math.min(DURACAO_FRAMES, Math.ceil(p.fim * FPS) + 3); f++) bruto[f] = 1;
  const env = new Float32Array(DURACAO_FRAMES);
  let v = 0;
  for (let f = 0; f < DURACAO_FRAMES; f++) {
    v += (bruto[f] - v) * (bruto[f] > v ? 0.35 : 0.07);
    env[f] = v;
  }
  return env;
})();

// Clima por trecho: quanto da versão abafada entra e o volume geral
const CLIMAS: { de: number; abafa: number; mult: number }[] = [
  { de: 0, abafa: 0, mult: 1 }, // leve
  { de: 24.8, abafa: 0.25, mult: 1 }, // família, quente
  { de: 31.6, abafa: 0.8, mult: 0.85 }, // emocional
  { de: 43.25, abafa: 0, mult: 1 }, // futuro, aliens
  { de: 55.7, abafa: 0.65, mult: 0.85 }, // fim da Terra
  { de: 66.1, abafa: 1, mult: 0.3 }, // espaço: quase silêncio
  { de: 86.45, abafa: 0, mult: 1 }, // de volta ao real
];
const climaEm = (s: number) => {
  let i = 0;
  while (i + 1 < CLIMAS.length && CLIMAS[i + 1].de <= s) i++;
  const atual = CLIMAS[i];
  const ant = CLIMAS[Math.max(0, i - 1)];
  const k = interpolate(s, [atual.de, atual.de + 0.9], [0, 1], clamp);
  return { abafa: ant.abafa + (atual.abafa - ant.abafa) * k, mult: ant.mult + (atual.mult - ant.mult) * k };
};

// ~30 dB abaixo da voz na fala, ~22 dB nos respiros (como no vídeo aprovado da gravidade)
const VOL_LIVRE = 0.06;
const VOL_FALA = 0.025;
// a abafada perde os agudos: um pouco mais de volume para soar igual de presente
const GANHO_ABAFADA = 1.7;

const degrau = (v: number) => Math.round(v * 400) / 400;
const degrauFino = (v: number) => Math.round(v * 20000) / 20000;
// fade out: a partir do fim da última fala, em curva, até o último quadro
const FIM_FALA = vozes.pecas[vozes.pecas.length - 1].fim;
const fadeFinal = (f: number) => {
  const entra = interpolate(f, [0, 6], [0, 1], clamp);
  const x = interpolate(f, [seg(FIM_FALA), DURACAO_FRAMES], [0, 1], clamp);
  return entra * (1 - x) ** 2.2;
};
const estouro = seg(MARCOS.terraAcaba);
const base = (f: number) =>
  interpolate(ABAIXA[Math.min(f, DURACAO_FRAMES - 1)] ?? 0, [0, 1], [VOL_LIVRE, VOL_FALA]) *
  fadeFinal(f) *
  // respirada curta no estouro da Terra
  interpolate(f, [estouro - 2, estouro + 2, estouro + 25, estouro + 50], [1, 0.25, 0.25, 1], clamp);

export const Sons: React.FC = () => (
  <>
    <Audio
      src={staticFile(`${I}musica.wav`)}
      volume={(f) => {
        const c = climaEm(f / FPS);
        return (f >= seg(FIM_FALA) ? degrauFino : degrau)(base(f) * c.mult * (1 - c.abafa));
      }}
    />
    <Audio
      src={staticFile(`${I}musica-abafada.wav`)}
      volume={(f) => {
        const c = climaEm(f / FPS);
        return (f >= seg(FIM_FALA) ? degrauFino : degrau)(base(f) * c.mult * c.abafa * GANHO_ABAFADA);
      }}
    />
    <Sequence from={seg(RONCO.de)} durationInFrames={seg(RONCO.ate - RONCO.de)} layout="none">
      <Audio
        src={staticFile(`${N}ronco.wav`)}
        loop
        volume={(f) => degrau(RONCO.vol * interpolate(f, [0, 10, seg(RONCO.ate - RONCO.de) - 4, seg(RONCO.ate - RONCO.de)], [0, 1, 1, 0], clamp))}
      />
    </Sequence>
    {EFEITOS.map((e, i) => (
      <Sequence key={i} from={Math.max(0, seg(e.em))} layout="none">
        <Audio src={staticFile(e.arq)} volume={e.vol} />
      </Sequence>
    ))}
  </>
);
