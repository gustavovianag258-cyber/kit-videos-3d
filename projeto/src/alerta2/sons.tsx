import { Audio, Sequence, interpolate, staticFile } from "remotion";

// Som da parte 1 (tempo REAL do vídeo, em segundos). Vozes da ElevenLabs cortadas por
// scripts/cortar-alerta.py; efeitos de scripts/sons-alerta.mjs (sem chiado contínuo).
const F = 30;
const v = (n: string) => staticFile(`alerta/voz/cortes/${n}.wav`);
const e = (n: string) => staticFile(`alerta/sons/${n}.wav`);

// [segundo, arquivo de voz]
export const VOZES: [number, string][] = [
  [0.15, "n-pergunta"],
  [6.05, "n-domingo"],
  [10.3, "cliente-vai"],
  [14.7, "jair"],
  [16.95, "thais-ceu"],
  [29.3, "thais-rafa"],
  [31.4, "n-segundo"],
  [33.3, "neide-porta"],
  [35.5, "rafa-abre"],
  [38.4, "thais-bem"],
  [40.4, "rafa-bem"],
  [42.3, "beto-piscou"],
  [50.2, "n-morrer1"],
  [52.9, "n-morrer2"],
  [55.2, "n-msg1"],
  [58.3, "n-msg2"],
  [62.5, "n-escolha"],
];

// [segundo, efeito, volume]
const EFEITOS: [number, string, number][] = [
  [3.0, "moto", 0.32],
  [11.3, "alarme", 0.5],
  [11.3, "vibra", 0.45],
  [25.2, "bum", 0.85],
  [33.3, "rolo", 0.55],
  [45.0, "coracao", 0.55],
  [46.0, "coracao", 0.6],
  [47.0, "coracao", 0.65],
  [50.2, "apagao", 0.55],
  [52.0, "vibra", 0.5],
  [52.0, "msg", 0.5],
  [58.0, "msg", 0.3],
  [61.1, "escolha", 0.75],
];

export const SonsAlerta: React.FC<{ cortes: number[]; fim: number }> = ({ cortes, fim }) => (
  <>
    {/* música calma só no começo (bar normal), ~30 dB abaixo da voz, some no alerta */}
    <Audio
      src={staticFile("gravidade/sons/musica-coffee-or-tea.wav")}
      volume={(f) => interpolate(f / F, [0, 0.5, 10.8, 11.5], [0, 0.05, 0.05, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
      endAt={Math.round(12 * F)}
    />
    {/* grave tonal contínuo depois que o céu fica vermelho */}
    <Sequence from={Math.round(25.2 * F)}>
      <Audio src={e("grave")} loop volume={(f) => interpolate(f / F, [0, 1.5, fim - 25.2 - 1.2, fim - 25.2], [0, 0.22, 0.22, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
    </Sequence>
    {/* whoosh baixinho em cada corte */}
    {cortes.map((t, i) => (
      <Sequence key={`c${i}`} from={Math.max(0, Math.round((t - 0.12) * F))} durationInFrames={12}>
        <Audio src={e(i % 2 ? "corte2" : "corte")} volume={0.16} />
      </Sequence>
    ))}
    {EFEITOS.map(([t, n, vol], i) => (
      <Sequence key={`e${i}`} from={Math.round(t * F)}>
        <Audio src={e(n)} volume={vol} />
      </Sequence>
    ))}
    {VOZES.map(([t, n], i) => (
      <Sequence key={`v${i}`} from={Math.round(t * F)}>
        <Audio src={v(n)} volume={1} />
      </Sequence>
    ))}
  </>
);
