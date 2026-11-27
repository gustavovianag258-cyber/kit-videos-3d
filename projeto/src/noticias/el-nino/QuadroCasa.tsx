import { useThree } from "@react-three/fiber";
import { useLayoutEffect } from "react";
import { Composition, registerRoot } from "remotion";
import { Acabamento, PalcoCinema } from "../../cinema/Palco";
import { Personagem3D, Pose3D } from "../../narrador/Personagem3D";
import { CasaPartida, NIVEL_AGUA } from "./CasaPartida";

// Quadro parado da cena 1, pra aprovar o cenário antes de produzir.
const POS: [number, number, number] = [0.42, 2.1, 17];
const ALVO: [number, number, number] = [0.03, 3.25, 0];
const ELE: [number, number, number] = [0, 0, 7.4];

const Camera: React.FC = () => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    camera.position.set(...POS);
    camera.lookAt(...ALVO);
    camera.updateProjectionMatrix();
  });
  return null;
};

const POSE: Pose3D = {
  bracoE: [-0.25, 0, -1.02],
  cotoveloE: 0.5,
  bracoD: [-0.25, 0, 1.02],
  cotoveloD: 0.5,
  tronco: 0.01,
  cabeca: [0.02, 0.1, 0.02],
};

const Quadro: React.FC = () => (
  <PalcoCinema ceu="entardecer" fundo="#5B6670" fov={38} far={600} luzCeu={0.28} brilhoCeu={0.6} desfoqueCeu={0.2}>
    <Camera />
    <CasaPartida camX={POS[0]} camZ={POS[2]} />
    <Personagem3D pos={ELE} giro={-0.04} pose={POSE} boca={0.25} olhar={0.1} />
    {/* anel de espuma na perna que está dentro da água */}
    <mesh position={[ELE[0] - 0.13, NIVEL_AGUA + 0.012, ELE[2]]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.17, 0.24, 28]} />
      <meshBasicMaterial color="#E4DCCB" transparent opacity={0.7} depthWrite={false} />
    </mesh>
    <Acabamento foco={Math.hypot(POS[0], POS[1] - 1.3, POS[2] - ELE[2])} desfoque={2.2} brilho={0.26} saturacao={0.06} contraste={0.1} vinheta={0.34} ao={0} />
  </PalcoCinema>
);

const Raiz: React.FC = () => <Composition id="ElNinoCasa" component={Quadro} durationInFrames={1} fps={30} width={1080} height={1920} />;
registerRoot(Raiz);
