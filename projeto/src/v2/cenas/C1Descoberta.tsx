import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Astronauta } from "../Astronauta";
import { InteriorEstacao } from "../Estacao";
import { Camera, CENTRO_DISCO, curva, DIRECAO_SOL, Estrelas } from "../mundo";
import { PlanetaDisco } from "../PlanetaDisco";
import { LuzSolarNoDisco } from "../Sol";
import { aberturaBoca, CENAS, clamp, ease, MARCOS, type Vec3 } from "../tempo";

// CENA 1 — A DESCOBERTA
// Dentro da estação: a câmera começa atrás do astronauta e avança até a janela,
// revelando a Terra em forma de disco do outro lado.

// O astronauta flutua perto da janela, à esquerda; a câmera vem de trás pelo lado direito
// e para a uns 3 m da janela: assim a moldura e o capacete continuam enquadrando o planeta.
const POSICAO_ASTRONAUTA: Vec3 = [-0.48, -0.22, -0.65];
const caminho = curva([
  [0.75, 0.45, 3.4],
  [0.6, 0.38, 2.4],
  [0.38, 0.3, 1.3],
  [0.22, 0.26, 0.55],
]);
// Mira abaixo do centro do disco: o planeta fica no meio da janela, acima das legendas
const ALVO_DISCO: Vec3 = [CENTRO_DISCO[0], CENTRO_DISCO[1] - 16000, CENTRO_DISCO[2]];

export const C1Descoberta: React.FC = () => {
  const f = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const segundos = CENAS.descoberta.inicio + f / fps;
  const duracao = CENAS.descoberta.fim - CENAS.descoberta.inicio;

  const p = interpolate(segundos, [0, duracao], [0, 1], { ...clamp, easing: ease });
  const posicao = caminho(p);
  // No começo olha para a nuca/janela; no fim olha direto para o disco
  const olharDisco = interpolate(segundos, [1.5, MARCOS.revelacaoJanela + 1.6], [0, 1], { ...clamp, easing: ease });
  const alvoJanela: Vec3 = [-0.2, -0.3, -4];
  const dir = [ALVO_DISCO[0] - posicao[0], ALVO_DISCO[1] - posicao[1], ALVO_DISCO[2] - posicao[2]];
  const n = Math.hypot(dir[0], dir[1], dir[2]);
  const alvoDisco: Vec3 = [
    posicao[0] + (dir[0] / n) * 10,
    posicao[1] + (dir[1] / n) * 10,
    posicao[2] + (dir[2] / n) * 10,
  ];
  const alvo: Vec3 = [
    alvoJanela[0] + (alvoDisco[0] - alvoJanela[0]) * olharDisco,
    alvoJanela[1] + (alvoDisco[1] - alvoJanela[1]) * olharDisco,
    alvoJanela[2] + (alvoDisco[2] - alvoJanela[2]) * olharDisco,
  ];

  const espanto = interpolate(segundos, [MARCOS.revelacaoJanela, MARCOS.revelacaoJanela + 0.8], [0.15, 1], clamp);
  const frameGlobal = Math.round(segundos * fps);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <ThreeCanvas
        width={width}
        height={height}
        gl={{ logarithmicDepthBuffer: true }}
        camera={{ fov: 52, near: 0.03, far: 3e6 }}
      >
        <Camera posicao={posicao} alvo={alvo} />
        {/* Luz do planeta (azulada) e do Sol (quente) entrando pela janela */}
        {/* Luzes da janela com alcance curto: iluminam o interior, não o planeta */}
        <pointLight position={[0, -0.6, -3.5]} color="#bcd8ff" intensity={1.6} decay={0} distance={12} />
        <pointLight position={[-1.5, 1, -3.2]} color="#ffe2b8" intensity={1.8} decay={0} distance={12} />
        <InteriorEstacao tempo={segundos} />
        <group position={POSICAO_ASTRONAUTA} rotation={[0, Math.PI - 0.15, 0]}>
          <Astronauta
            frame={frameGlobal}
            boca={aberturaBoca(frameGlobal)}
            espanto={espanto}
            giroCabeca={[0.3, 0]}
            bracoDireito={interpolate(segundos, [3.2, 4.6], [0, 0.55], { ...clamp, easing: ease })}
            flutuar={segundos}
          />
        </group>
        {/* Lá fora: o planeta */}
        <Estrelas raio={1.5e6} />
        <group position={CENTRO_DISCO}>
          <PlanetaDisco giroNuvens={segundos * 0.004} />
        </group>
        <hemisphereLight args={["#3a4a70", "#05060a", 0.12]} />
        <LuzSolarNoDisco centroDisco={CENTRO_DISCO} direcaoSol={DIRECAO_SOL} />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
