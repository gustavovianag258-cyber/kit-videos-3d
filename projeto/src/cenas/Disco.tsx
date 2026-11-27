import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CALCADA_Y } from "../Cidade";
import { DiscoTerra } from "../DiscoTerra";
import { ESCALA_PERSONAGEM, Personagem } from "../Personagem";
import { aberturaBoca, CENAS, clamp, ease, lerp, type Vec3 } from "../roteiro";
import { CameraControlada, CeuCidade, Cidade3D, Estrelas, LuzesCidade } from "./comum";

// Cena 2: "O planeta inteiro seria um disco gigante!"
// Close no rosto surpreso; depois a câmera sobe até revelar o disco inteiro.

const DURACAO = CENAS.borda - CENAS.disco;
const INICIO_SUBIDA = 20;
const ALTURA_FINAL = 70000;
// A subida termina antes do corte, para o disco inteiro ficar um instante na tela
const FIM_SUBIDA = DURACAO - 14;

export const Disco: React.FC = () => {
  const f = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const global = CENAS.disco + f;

  const virar = interpolate(f, [0, 16], [0, 1], { ...clamp, easing: ease });
  // Subida em escala exponencial: a sensação de velocidade fica constante
  const s = interpolate(f, [INICIO_SUBIDA, FIM_SUBIDA], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.quad),
  });
  const h = 1.6 * Math.pow(ALTURA_FINAL / 1.6, s);

  const posicao: Vec3 = [0.9 + h * 0.25, CALCADA_Y + Math.max(1.6, h), 2.3 + h * 1.1];
  // Olha para o rosto no começo e para o centro do disco no fim
  const olharDisco = interpolate(Math.log10(h), [0.5, 2.5], [0, 1], clamp);
  const alvo: Vec3 = [0, lerp(CALCADA_Y + 1.55, 0, olharDisco), 0];

  // O céu some e vira espaço conforme a câmera sobe
  const ceu = interpolate(Math.log10(h), [2.3, 3.8], [1, 0], clamp);

  return (
    <AbsoluteFill style={{ backgroundColor: "#03040c" }}>
      <CeuCidade mistura={1} opacidade={ceu} />
      <ThreeCanvas
        width={width}
        height={height}
        shadows
        gl={{ logarithmicDepthBuffer: true }}
        camera={{ fov: 50, near: 0.05, far: 3e6 }}
      >
        <CameraControlada posicao={posicao} alvo={alvo} />
        <LuzesCidade mistura={1} nevoaPerto={Math.max(40, h * 3)} nevoaLonge={Math.max(170, h * 10)} />
        <Estrelas raio={1e6} />
        <DiscoTerra />
        <Cidade3D tempo={global / fps} />
        <group position={[0, CALCADA_Y, 0]} rotation={[0, 0.25, 0]} scale={ESCALA_PERSONAGEM}>
          <Personagem
            posicao={[0, 0, 0]}
            giroY={0}
            fase={0}
            intensidade={0}
            frame={global}
            boca={aberturaBoca(global)}
            sobrancelha={1}
            espanto={virar}
            giroCabeca={[-0.25 * virar, 0.55 * virar]}
            bracos={0.35 * virar}
          />
        </group>
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
