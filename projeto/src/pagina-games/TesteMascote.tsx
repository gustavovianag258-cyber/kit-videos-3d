import { Composition, interpolate, registerRoot, useCurrentFrame } from "remotion";
import { Acabamento, PalcoCinema } from "../cinema/Palco";
import { Mascote3D, PoseMascote } from "./Mascote3D";
import { Camera, Estudio } from "./Estudio";

// Teste do mascote da página de games: quadro parado em estúdio roxo/neon e 3 s de movimento.

const Quadro: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const fala = t > 0.5;
  const boca = fala ? Math.max(0, 0.42 * Math.sin(t * 13) + 0.34 * Math.sin(t * 21.7 + 1) + 0.18) : 0;
  const gesto = interpolate(t, [0.6, 1.0, 2.2, 2.7], [0, 1, 1, 0.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const balanco = Math.sin(t * 5.2);
  const pose: PoseMascote = {
    bracoE: [0.02, 0, -0.1 - gesto * 0.06],
    cotoveloE: 0.15 + gesto * 0.5,
    bracoD: [0.02 - gesto * 0.5, 0, 0.1 + gesto * 0.4],
    cotoveloD: 0.15 + gesto * (0.9 + balanco * 0.15),
    tronco: 0.01 * Math.sin(t * 1.7),
    cabeca: [0.03 * Math.sin(t * 2.9), 0.1 * Math.sin(t * 1.2), 0.03 * Math.sin(t * 0.9)],
  };
  const pisca = (t > 0.8 && t < 0.92) || (t > 2.2 && t < 2.32);
  const pos: [number, number, number] = [0.45 - t * 0.04, 1.35, 4.5 - t * 0.15];
  return (
    <PalcoCinema ceu="estudio" fundo="#120B22" fov={28} luzCeu={0.3} brilhoCeu={0.05}>
      <Camera pos={pos} alvo={[0, 1.08, 0]} />
      <Estudio />
      <Mascote3D giro={0.1} pose={pose} boca={boca} pisca={pisca} />
      <Acabamento foco={Math.hypot(pos[0], pos[1] - 1.5, pos[2])} desfoque={5} brilho={0.7} saturacao={0.1} contraste={0.1} vinheta={0.4} ao={0} />
    </PalcoCinema>
  );
};

const Raiz: React.FC = () => <Composition id="MascoteTeste" component={Quadro} durationInFrames={90} fps={30} width={1080} height={1920} />;
registerRoot(Raiz);
