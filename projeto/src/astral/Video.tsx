import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import duracoes from "../../public/astral/voz/duracoes.json";
import { CenaArea51 } from "./CenaArea51";
import { CenaBarcelona } from "./CenaBarcelona";
import { CenaEspaco } from "./CenaEspaco";
import { CenaGize } from "./CenaGize";
import { CenaQuarto } from "./CenaQuarto";
import { CenaVaticano } from "./CenaVaticano";
import { CenaVizinho } from "./CenaVizinho";
import { CenaWashington } from "./CenaWashington";
import { CamadaMaos } from "./maos";
import { CARTAZ, cenaEm, clamp, CTA, DURACAO_SEGUNDOS, FPS, LEGENDAS } from "./tempo";
import { CartazPagina, ChamadaFinal, Hud, Legendas, Titulo } from "./ui";

// Transições do original: borrão rápido de movimento (o "voo"), clarão branco ao chegar em
// Barcelona e ao acordar.
const BORROES: [number, number, number][] = [
  [3.7, 0.28, 14],
  [6.75, 0.22, 12],
  [10.55, 0.22, 10],
  [13.72, 0.2, 9],
  [16.85, 0.28, 11],
  [22.8, 0.16, 14],
  [27.1, 0.13, 12],
  [34.08, 0.12, 10],
  [38.42, 0.12, 8],
  [41.1, 0.12, 10],
  [45.15, 0.15, 8],
  [48.55, 0.12, 10],
  [53.6, 0.12, 8],
  [66.75, 0.36, 16],
];
const borrao = (s: number) => BORROES.reduce((m, [c, l, px]) => Math.max(m, px * Math.max(0, 1 - Math.abs(s - c) / l)), 0);
const clarao = (s: number) =>
  Math.max(
    interpolate(s, [18.75, 18.9, 19.3], [0, 0.95, 0], clamp),
    interpolate(s, [58.7, 59.2, 59.5, 59.75], [0, 0.97, 0.97, 0], clamp), // as nuvens
    interpolate(s, [66.95, 67.07, 67.8], [0, 0.85, 0], clamp),
  );

// quando cada frase da narração começa (a fala começa junto com a legenda)
const EXTRA: Record<number, number> = { 4: 0.64, 18: 0.62 };
const inicioVoz = (i: number) => {
  if (i === 0) return 0.12;
  const atraso = duracoes[i].atrasoFala + (EXTRA[i] ?? 0);
  if (i === CTA.voz) return CTA.de - atraso;
  const l = LEGENDAS.find((x) => x.voz === i);
  return (l ? l.de : 0) - atraso;
};

// efeitos: [arquivo, segundo, volume]
const EFEITOS: [string, number, number][] = [
  ...[3.45, 6.55, 10.35, 13.55, 16.65, 22.68, 26.98, 33.95, 40.98, 48.42, 59.38, 66.38].map((t) => ["voo", t, 0.32] as [string, number, number]),
  ...[8.45, 10.42, 31.42, 38.25, 44.82, 53.5].map((t) => ["atravessar", t, 0.42] as [string, number, number]),
  ["chegada", 18.82, 0.38],
  ["chegada", 67.02, 0.3],
  ["subida", 56.7, 0.38],
  ["miado", 14.7, 0.26],
];

// música: abaixa sozinha enquanto o narrador fala, sobe um pouco nos respiros, some no fim
const VOZ_CARTAZ = 5.2; // "Segue o Mundo Paralelo... comenta a sua ideia... A melhor vira vídeo!"
const falas = [...duracoes.map((d, i) => [inicioVoz(i), inicioVoz(i) + d.duracao] as const), [CARTAZ.voz, CARTAZ.voz + VOZ_CARTAZ] as const];
const volMusica = (s: number) => {
  const falando = falas.some(([a, b]) => s > a - 0.15 && s < b + 0.1);
  const proxFala = falas.reduce((m, [a, b]) => Math.min(m, s < a ? a - s : s > b ? s - b : 0), 99);
  const base = falando ? 0.05 : interpolate(proxFala, [0.15, 0.6], [0.05, 0.085], clamp);
  const entra = interpolate(s, [0, 1.2], [0.4, 1], clamp);
  const sai = s > 79.4 ? Math.pow(1 - Math.min(1, (s - 79.4) / (DURACAO_SEGUNDOS - 79.4)), 2.2) : 1;
  return base * entra * sai;
};

export const VideoAstral: React.FC = () => {
  const frame = useCurrentFrame();
  const s = frame / FPS;
  const cena = cenaEm(s);
  const b = borrao(s);
  const escuroFim = interpolate(s, [71.0, 71.8], [0, 0.32], clamp);

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ filter: b > 0.3 ? `blur(${b.toFixed(1)}px)` : undefined }}>
        {(cena === "quarto" || cena === "mergulho" || cena === "acorda") && <CenaQuarto s={s} />}
        {cena === "vizinho" && <CenaVizinho s={s} />}
        {cena === "barcelona" && <CenaBarcelona s={s} />}
        {cena === "vaticano" && <CenaVaticano s={s} />}
        {cena === "gize" && <CenaGize s={s} />}
        {cena === "washington" && <CenaWashington s={s} />}
        {cena === "area51" && <CenaArea51 s={s} />}
        {cena === "espaco" && <CenaEspaco s={s} />}
      </AbsoluteFill>
      <AbsoluteFill style={{ filter: b > 0.3 ? `blur(${(b * 0.6).toFixed(1)}px)` : undefined }}>
        <CamadaMaos s={s} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#fff", opacity: clarao(s) }} />
      <AbsoluteFill style={{ background: "#0a0c1e", opacity: escuroFim }} />

      <Hud s={s} />
      <Titulo s={s} />
      <Legendas s={s} />
      <ChamadaFinal s={s} />
      <CartazPagina s={s} />

      <Audio src={staticFile("astral/musica-vastness.wav")} volume={(f) => volMusica(f / FPS)} />
      {EFEITOS.map(([arq, t, vol], i) => (
        <Sequence key={`${arq}${i}`} from={Math.round(t * FPS)} durationInFrames={90} layout="none">
          <Audio src={staticFile(`astral/sons/${arq}.wav`)} volume={vol} />
        </Sequence>
      ))}
      <Sequence from={Math.round(CARTAZ.voz * FPS)} durationInFrames={Math.ceil(VOZ_CARTAZ * FPS) + 4} layout="none">
        <Audio src={staticFile("astral/voz/fcartaz.wav")} />
      </Sequence>
      {duracoes.map((d, i) => (
        <Sequence key={d.arquivo} from={Math.round(inicioVoz(i) * FPS)} durationInFrames={Math.ceil(d.duracao * FPS) + 2} layout="none">
          <Audio src={staticFile(`astral/voz/${d.arquivo}`)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
