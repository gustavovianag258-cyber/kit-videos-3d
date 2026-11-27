import { Audio, interpolate, Sequence, staticFile } from "remotion";
import palavras from "./narracao-palavras.json";
import { clamp, DURACAO_FRAMES, ETIQUETAS, FPS, HUDS, MARCOS, PLANOS, seg, SELOS, TRECHOS_NARRACAO } from "./tempo";

// Música e efeitos. Os efeitos ficam à frente da música; a música abaixa sozinha quando o narrador fala.

type Efeito = { arq: string; em: number; vol: number };
const G = "gravidade/sons/";
const N = "namorada/sons/";

// whoosh em cada corte (menos nos que já têm som próprio ou no corte seco depois da explosão)
const SEM_WHOOSH = new Set(["espaco", "explosao", "terraCalma", "grupo", "cartaz"]);
const WHOOSHES: Efeito[] = PLANOS.filter((p) => !SEM_WHOOSH.has(p.id)).map((p, i) => ({
  arq: `${G}${i % 3 === 2 ? "whoosh-medio" : "whoosh-curto"}.wav`,
  em: p.de - 0.12,
  vol: 0.09,
}));

// blip toda vez que um HUD, selo ou etiqueta entra na tela
const BLIPS: Efeito[] = [
  ...HUDS.map((h) => ({ arq: `${N}${h.alerta ? "blip-grave" : "blip"}.wav`, em: h.de, vol: 0.16 })),
  ...SELOS.map((s) => ({ arq: `${G}pop.wav`, em: s.de, vol: 0.22 })),
  ...ETIQUETAS.map((e) => ({ arq: `${N}blip.wav`, em: e.de, vol: 0.09 })),
];

const EFEITOS: Efeito[] = [
  ...WHOOSHES,
  ...BLIPS,
  // abertura: a Terra, o selo "E SE…?" e o zoom no Brasil
  { arq: `${N}dum.wav`, em: 0.02, vol: 0.28 },
  { arq: `${G}pop-grave.wav`, em: 0.1, vol: 0.22 },
  { arq: `${G}whoosh-longo.wav`, em: 0.95, vol: 0.14 },
  { arq: `${N}ping.wav`, em: 1.4, vol: 0.14 },
  { arq: `${N}ping.wav`, em: 2.1, vol: 0.1 },
  // sala de controle: o "nunca" do telão (sem bipes de computador: o usuário não gostou do "piriri")
  { arq: `${N}erro.wav`, em: 5.3, vol: 0.2 },
  // quarto às 2 da manhã
  { arq: `${N}relogio.wav`, em: 11.0, vol: 0.18 },
  // o pedido e a resposta
  { arq: `${N}mensagem.wav`, em: 13.4, vol: 0.3 },
  { arq: `${N}ding.wav`, em: MARCOS.aceito - 0.03, vol: 0.32 },
  { arq: `${N}dum.wav`, em: MARCOS.aceito, vol: 0.3 },
  // onda de choque saindo da casa (golpe + ar se espalhando) e os corações estourando
  { arq: `${N}onda-de-choque.wav`, em: MARCOS.ondaDeChoque - 0.04, vol: 0.5 },
  ...[0.25, 0.45, 0.6, 0.8, 1.05, 1.3].map((d, i) => ({ arq: `${G}pop.wav`, em: MARCOS.ondaDeChoque + d, vol: 0.1 - i * 0.008 })),
  // a mãe emocionada
  { arq: `${N}brilho.wav`, em: 17.65, vol: 0.22 },
  // grupo dos solteiros
  { arq: `${N}mensagem.wav`, em: 19.15, vol: 0.24 },
  { arq: `${N}mensagem.wav`, em: 19.55, vol: 0.24 },
  { arq: `${N}mensagem.wav`, em: 19.95, vol: 0.24 },
  { arq: `${N}saiu.wav`, em: MARCOS.saiuDoGrupo, vol: 0.32 },
  { arq: `${N}vidro.wav`, em: 20.85, vol: 0.4 },
  // a Terra não aguenta
  { arq: `${N}racha.wav`, em: MARCOS.racha, vol: 0.32 },
  { arq: `${N}racha.wav`, em: 22.7, vol: 0.22 },
  { arq: `${N}estrondo.wav`, em: MARCOS.terremoto - 0.02, vol: 0.42 },
  { arq: `${N}desmorona.wav`, em: 25.95, vol: 0.2 },
  { arq: `${N}estrondo.wav`, em: 27.33, vol: 0.32 },
  { arq: `${N}alarme.wav`, em: 27.4, vol: 0.07 },
  // recorde do Chile
  { arq: `${N}ping.wav`, em: 28.6, vol: 0.12 },
  // monumentos
  { arq: `${G}whoosh-curto.wav`, em: 32.2, vol: 0.14 },
  { arq: `${N}passo.wav`, em: 32.78, vol: 0.45 },
  { arq: `${N}desmorona.wav`, em: 32.85, vol: 0.16 },
  { arq: `${N}rangido.wav`, em: 33.6, vol: 0.24 },
  { arq: `${G}mola.wav`, em: 34.05, vol: 0.2 },
  { arq: `${N}estrondo.wav`, em: 35.15, vol: 0.16 },
  { arq: `${N}desmorona.wav`, em: 35.3, vol: 0.22 },
  // NASA, sismógrafos, lasers
  { arq: `${N}alarme.wav`, em: 37.05, vol: 0.12 },
  { arq: `${G}laser.wav`, em: 40.3, vol: 0.14 },
  { arq: `${G}laser.wav`, em: 40.55, vol: 0.1 },
  { arq: `${G}laser.wav`, em: 40.8, vol: 0.08 },
  { arq: `${N}dum.wav`, em: 41.88, vol: 0.32 },
  { arq: `${N}ping.wav`, em: 41.9, vol: 0.12 },
  // "bom dia, amor"
  { arq: `${N}mensagem.wav`, em: 43.25, vol: 0.2 },
  { arq: `${N}teclado.wav`, em: MARCOS.digita, vol: 0.32 },
  { arq: `${N}mensagem.wav`, em: 44.8, vol: 0.26 },
  // e o planeta… explode
  { arq: `${N}racha.wav`, em: 45.1, vol: 0.25 },
  { arq: `${G}riser.wav`, em: MARCOS.explosao - 3.4, vol: 0.13 },
  { arq: `${N}explosao.wav`, em: MARCOS.explosao - 0.03, vol: 0.62 },
  // de volta: ele sério, a medalha e o cartaz
  { arq: `${N}dum.wav`, em: 49.3, vol: 0.2 },
  { arq: `${G}whoosh-curto.wav`, em: 51.2, vol: 0.12 },
  { arq: `${N}medalha.wav`, em: 51.62, vol: 0.3 },
  { arq: `${N}brilho.wav`, em: 53.05, vol: 0.16 },
  { arq: `${G}pop.wav`, em: 55.5, vol: 0.24 },
  { arq: `${G}impacto-leve.wav`, em: 55.5, vol: 0.18 },
  { arq: `${N}blip.wav`, em: 55.85, vol: 0.14 },
  { arq: `${N}ding.wav`, em: 56.2, vol: 0.16 },
];

// Ronco do chão enquanto o terremoto dura (só graves)
const RONCO = { de: MARCOS.terremoto, ate: 31.85, vol: 0.32 };

// ---------- A música abaixa quando alguém fala ----------
const ABAIXA = (() => {
  const bruto = new Float32Array(DURACAO_FRAMES);
  for (const t of TRECHOS_NARRACAO)
    for (const p of palavras.words)
      if (p.start >= t.de && p.end <= t.ate + 0.05) {
        const a = p.start - t.de + t.em;
        const b = p.end - t.de + t.em;
        for (let f = Math.max(0, Math.floor(a * FPS) - 2); f < Math.min(DURACAO_FRAMES, Math.ceil(b * FPS) + 3); f++) bruto[f] = 1;
      }
  const env = new Float32Array(DURACAO_FRAMES);
  let v = 0;
  for (let f = 0; f < DURACAO_FRAMES; f++) {
    v += (bruto[f] - v) * (bruto[f] > v ? 0.35 : 0.07);
    env[f] = v;
  }
  return env;
})();

// Volume em degraus de 0,0025: inaudível, e a mixagem do ffmpeg não estoura
const degrau = (v: number) => Math.round(v * 400) / 400;

// Música (versão final, pedido do usuário): uma faixa só, de boa e constante, para o vídeo nunca ficar calado —
// "Coffee or Tea" (Michael Ramir C., Mixkit, licença livre), a mesma do vídeo da gravidade, com os agudos cortados.
// Fica audível o tempo todo: ~23 dB abaixo da voz na fala e ~19 dB nos respiros (abaixa só um pouco).
// Não corta na explosão: só dá uma respirada curta no estouro e volta.
// (Recusadas pelo usuário, não usar: tambores de tensão, "Games Music", "Kidding Around".)
const MUSICA = "gravidade/sons/musica-coffee-or-tea.wav";
const VOL_LIVRE = 0.072;
const VOL_FALA = 0.046;

// Fade out no fim (pedido do usuário): começa quando o narrador termina e vai sumindo devagar
// até o último quadro, em curva (cai rápido no ouvido no começo e some suave no fim)
const FADE_FINAL = 4;
// no fade os degraus são bem finos, para a descida não soar em "escadinha"
const degrauFino = (v: number) => Math.round(v * 20000) / 20000;
const fadeFinal = (f: number) => {
  const entra = interpolate(f, [0, 6], [0, 1], clamp);
  const x = interpolate(f, [DURACAO_FRAMES - seg(FADE_FINAL), DURACAO_FRAMES], [0, 1], clamp);
  return entra * (1 - x) ** 2.2;
};

export const Sons: React.FC = () => {
  const estouro = seg(MARCOS.explosao);
  return (
    <>
      <Audio
        src={staticFile(MUSICA)}
        volume={(f) =>
          (f >= DURACAO_FRAMES - seg(FADE_FINAL) ? degrauFino : degrau)(
            interpolate(ABAIXA[Math.min(f, DURACAO_FRAMES - 1)] ?? 0, [0, 1], [VOL_LIVRE, VOL_FALA]) *
              fadeFinal(f) *
              interpolate(f, [estouro - 2, estouro + 2, estouro + 25, estouro + 50], [1, 0.25, 0.25, 1], clamp),
          )
        }
      />
      <Sequence from={seg(RONCO.de)} durationInFrames={seg(RONCO.ate - RONCO.de)} layout="none">
        <Audio
          src={staticFile(`${N}ronco.wav`)}
          loop
          volume={(f) => degrau(RONCO.vol * interpolate(f, [0, 6, seg(RONCO.ate - RONCO.de) - 20, seg(RONCO.ate - RONCO.de)], [0, 1, 1, 0], clamp))}
        />
      </Sequence>
      {EFEITOS.map((e, i) => (
        <Sequence key={i} from={Math.max(0, seg(e.em))} layout="none">
          <Audio src={staticFile(e.arq)} volume={e.vol} />
        </Sequence>
      ))}
    </>
  );
};
