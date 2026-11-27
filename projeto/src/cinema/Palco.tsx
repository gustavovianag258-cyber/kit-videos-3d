import { Environment } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import {
  BlendFunction,
  BloomEffect,
  BrightnessContrastEffect,
  DepthOfFieldEffect,
  EffectComposer,
  EffectPass,
  HueSaturationEffect,
  NoiseEffect,
  RenderPass,
  ToneMappingEffect,
  ToneMappingMode,
  VignetteEffect,
} from "postprocessing";
import { N8AOPostPass } from "n8ao";
import { useLayoutEffect, useMemo } from "react";
import { staticFile, useVideoConfig } from "remotion";
import * as THREE from "three";

// Palco com acabamento de cinema (skill visual-cinematico): céu HDRI de verdade, sol com sombra
// macia, névoa ao longe e pós-processamento (brilho, desfoque de fundo, vinheta, granulado, cor).

export type Ceu = "praia-sol" | "entardecer" | "dia" | "manha" | "noite" | "fogo" | "estudio";

export const PalcoCinema: React.FC<{
  children: React.ReactNode;
  ceu?: Ceu | null;
  fundo?: string;
  fov?: number;
  far?: number;
  exposicao?: number;
  luzCeu?: number; // quanto o céu ilumina a cena (reflexos e sombra colorida)
  brilhoCeu?: number; // quanto o céu aparece claro no fundo
  desfoqueCeu?: number; // borra o fundo do HDRI (esconde prédios/postes da foto original)
}> = ({ children, ceu = "praia-sol", fundo = "#9fd3ff", fov = 40, far = 2000, exposicao = 1, luzCeu = 0.6, brilhoCeu = 0.85, desfoqueCeu = 0 }) => {
  const { width, height } = useVideoConfig();
  return (
    <ThreeCanvas
      width={width}
      height={height}
      shadows={{ type: THREE.PCFSoftShadowMap }}
      camera={{ fov, near: 0.05, far }}
      gl={{ toneMapping: THREE.NoToneMapping, toneMappingExposure: exposicao, antialias: false, alpha: false }}
      style={{ background: fundo }}
    >
      <color attach="background" args={[fundo]} />
      {ceu && <Environment files={staticFile(`hdri/${ceu}.hdr`)} background backgroundIntensity={brilhoCeu} backgroundBlurriness={desfoqueCeu} environmentIntensity={luzCeu} />}
      {children}
    </ThreeCanvas>
  );
};

// Sol: luz principal quente com sombra macia e grande área coberta
export const Sol: React.FC<{ pos?: [number, number, number]; cor?: string; forca?: number; area?: number }> = ({
  pos = [25, 30, 18],
  cor = "#fff1d6",
  forca = 3.2,
  area = 30,
}) => (
  <directionalLight
    position={pos}
    intensity={forca}
    color={cor}
    castShadow
    shadow-mapSize={[2048, 2048]}
    shadow-bias={-0.0004}
    shadow-normalBias={0.02}
    shadow-camera-left={-area}
    shadow-camera-right={area}
    shadow-camera-top={area}
    shadow-camera-bottom={-area}
    shadow-camera-far={200}
  />
);

// Acabamento: foco no assunto (distância em metros da câmera), brilho nas luzes fortes,
// vinheta, granulado sutil e um toque de contraste/saturação.
// Montado à mão e de forma SÍNCRONA: no render o Remotion desenha cada quadro uma vez só
// (frameloop "never" + um advance), e o <EffectComposer> do @react-three/postprocessing só fica
// pronto depois do primeiro quadro — a tela saía vazia. Aqui tudo existe já no primeiro advance.
export const Acabamento: React.FC<{
  foco?: number;
  desfoque?: number;
  brilho?: number;
  saturacao?: number;
  contraste?: number;
  vinheta?: number;
  ao?: number; // sombra de contato nos cantos e embaixo das coisas (0 = desligada)
  raioAo?: number; // alcance da sombra de contato em metros
}> = ({ foco = 6, desfoque = 3.2, brilho = 0.9, saturacao = 0.22, contraste = 0.16, vinheta = 0.45, ao = 0, raioAo = 1.2 }) => {
  const { gl, scene, camera, size } = useThree();
  const fx = useMemo(() => {
    const composer = new EffectComposer(gl, { frameBufferType: THREE.HalfFloatType });
    const dof = new DepthOfFieldEffect(camera, { worldFocusDistance: foco, worldFocusRange: foco * 0.35, bokehScale: desfoque });
    const bloom = new BloomEffect({ intensity: brilho, luminanceThreshold: 0.82, luminanceSmoothing: 0.2, mipmapBlur: true });
    const sat = new HueSaturationEffect({ saturation: saturacao });
    const bc = new BrightnessContrastEffect({ contrast: contraste });
    const tom = new ToneMappingEffect({ mode: ToneMappingMode.ACES_FILMIC });
    const vin = new VignetteEffect({ offset: 0.3, darkness: vinheta });
    const ruido = new NoiseEffect({ blendFunction: BlendFunction.OVERLAY, premultiply: false });
    ruido.blendMode.opacity.value = 0.035;
    composer.addPass(new RenderPass(scene, camera));
    if (ao > 0) {
      const n8 = new N8AOPostPass(scene, camera, size.width, size.height);
      n8.configuration.aoRadius = raioAo;
      n8.configuration.distanceFalloff = raioAo * 0.6;
      n8.configuration.intensity = ao;
      n8.configuration.aoSamples = 16;
      n8.configuration.denoiseSamples = 8;
      n8.configuration.denoiseRadius = 12;
      n8.configuration.halfRes = false;
      n8.configuration.gammaCorrection = false;
      composer.addPass(n8);
    }
    composer.addPass(new EffectPass(camera, dof));
    composer.addPass(new EffectPass(camera, bloom, tom, sat, bc, vin, ruido));
    return { composer, dof, bloom, sat, bc, vin };
    // o composer é um só por palco; os valores mudam abaixo a cada quadro
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl, scene, camera]);
  useLayoutEffect(() => {
    fx.composer.setSize(size.width, size.height);
  }, [fx, size.width, size.height]);
  useLayoutEffect(() => {
    fx.dof.cocMaterial.worldFocusDistance = foco;
    fx.dof.cocMaterial.worldFocusRange = foco * 0.35;
    fx.dof.bokehScale = desfoque;
    fx.bloom.intensity = brilho;
    fx.sat.saturation = saturacao;
    fx.bc.contrast = contraste;
  });
  useLayoutEffect(() => () => fx.composer.dispose(), [fx]);
  // prioridade 1: o R3F deixa de desenhar sozinho e quem desenha é o composer
  useFrame((_, delta) => fx.composer.render(delta), 1);
  return null;
};
