import { RoundedBox } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useLayoutEffect, useMemo } from "react";
import { Composition, Easing, interpolate, random, registerRoot, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { Acabamento, PalcoCinema } from "../cinema/Palco";
import { Personagem3D, Pose3D } from "./Personagem3D";

// Teste de movimento, 5 s sem voz: ele chega andando numa rua de fim de tarde, para e fala gesticulando; depois, close.
const Camera: React.FC<{ pos: [number, number, number]; alvo: [number, number, number] }> = ({ pos, alvo }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    camera.position.set(...pos);
    camera.lookAt(...alvo);
    camera.updateProjectionMatrix();
  });
  return null;
};

const textura = (tam: number, rep: [number, number], desenha: (g: CanvasRenderingContext2D) => void) => {
  const c = document.createElement("canvas");
  c.width = c.height = tam;
  desenha(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(...rep);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};
const texTijolo = () =>
  textura(1024, [8, 3], (g) => {
    g.fillStyle = "#6E685E";
    g.fillRect(0, 0, 1024, 1024);
    const H = 64;
    for (let y = 0; y < 16; y++)
      for (let x = -1; x < 9; x++) {
        const v = random(`tj${x}${y}`);
        g.fillStyle = `rgb(${92 + v * 34},${56 + v * 18},${44 + v * 12})`;
        g.fillRect(x * 128 + (y % 2) * 64 + 3, y * H + 3, 122, H - 6);
      }
    for (let i = 0; i < 40; i++) {
      g.fillStyle = `rgba(20,16,12,${0.05 + random(`mz${i}`) * 0.09})`;
      g.beginPath();
      g.ellipse(random(`mx${i}`) * 1024, random(`my${i}`) * 1024, 60 + random(`mr${i}`) * 110, 40 + random(`ms${i}`) * 80, 0, 0, 7);
      g.fill();
    }
  });
const texCalcada = () =>
  textura(1024, [10, 10], (g) => {
    g.fillStyle = "#7B756B";
    g.fillRect(0, 0, 1024, 1024);
    for (let i = 0; i < 26000; i++) {
      g.fillStyle = random(`cl${i}`) > 0.5 ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.07)";
      g.fillRect(random(`cx${i}`) * 1024, random(`cy${i}`) * 1024, 2, 2);
    }
    g.fillStyle = "rgba(0,0,0,0.4)";
    g.fillRect(0, 0, 1024, 5);
    g.fillRect(0, 0, 5, 1024);
  });

const Peca: React.FC<{ p: [number, number, number]; s: [number, number, number]; cor: string; rugoso?: number; metal?: number; raio?: number }> = ({ p, s, cor, rugoso = 0.8, metal = 0, raio = 0.02 }) => (
  <RoundedBox args={s} position={p} radius={Math.min(raio, Math.min(...s) * 0.45)} smoothness={3} castShadow receiveShadow>
    <meshStandardMaterial color={cor} roughness={rugoso} metalness={metal} />
  </RoundedBox>
);

const Rua: React.FC = () => {
  const tijolo = useMemo(texTijolo, []);
  const calcada = useMemo(texCalcada, []);
  return (
    <>
      <directionalLight position={[-3.4, 3, 3]} intensity={3.1} color="#FFD9AE" castShadow shadow-mapSize={[4096, 4096]} shadow-bias={-0.0002} shadow-normalBias={0.008} shadow-camera-left={-6} shadow-camera-right={6} shadow-camera-top={6} shadow-camera-bottom={-6} shadow-camera-far={30} />
      <hemisphereLight args={["#C8D8F2", "#6E5E4C", 0.62]} />
      <directionalLight position={[2.4, 2.4, -2.4]} intensity={1.3} color="#FFC58F" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial map={calcada} roughness={0.9} />
      </mesh>
      {/* muro, porta e janela lá atrás */}
      <mesh position={[0, 3, -6]} receiveShadow>
        <planeGeometry args={[34, 6]} />
        <meshStandardMaterial map={tijolo} roughness={0.92} />
      </mesh>
      <Peca p={[-1.5, 1.1, -5.96]} s={[1.05, 2.2, 0.06]} cor="#3A2C22" />
      <Peca p={[1.6, 1.75, -5.96]} s={[1.5, 1.2, 0.06]} cor="#1E2933" rugoso={0.25} />
      <Peca p={[1.6, 1.75, -5.93]} s={[1.56, 0.05, 0.05]} cor="#D2CCBC" />
      <Peca p={[1.6, 1.75, -5.93]} s={[0.05, 1.26, 0.05]} cor="#D2CCBC" />
      <Peca p={[0, 0.07, -5.9]} s={[34, 0.14, 0.2]} cor="#5D5850" />
      {/* poste */}
      <mesh position={[-2.9, 2.7, -3.6]} castShadow>
        <cylinderGeometry args={[0.055, 0.07, 5.4, 16]} />
        <meshStandardMaterial color="#2A2D33" roughness={0.65} metalness={0.3} />
      </mesh>
      {/* lixeira e vaso */}
      <mesh position={[2.15, 0.42, -1.8]} castShadow receiveShadow>
        <cylinderGeometry args={[0.26, 0.21, 0.84, 24]} />
        <meshStandardMaterial color="#3F5A4A" roughness={0.6} metalness={0.2} />
      </mesh>
      <mesh position={[-2.05, 0.24, -2.2]} castShadow receiveShadow>
        <cylinderGeometry args={[0.3, 0.22, 0.48, 24]} />
        <meshStandardMaterial color="#7A5B47" roughness={0.85} />
      </mesh>
      {new Array(9).fill(0).map((_, i) => (
        <mesh key={i} position={[-2.05 + Math.cos(i * 2.4) * 0.2, 0.62 + (i % 3) * 0.13, -2.2 + Math.sin(i * 2.4) * 0.2]} scale={[0.17, 0.2, 0.17]} castShadow>
          <sphereGeometry args={[1, 14, 12]} />
          <meshStandardMaterial color={i % 2 ? "#3C6236" : "#2F5230"} roughness={0.75} />
        </mesh>
      ))}
      {/* carro parado no fundo */}
      <Peca p={[3.4, 0.5, -4.2]} s={[3.6, 0.62, 1.55]} cor="#6E2B2A" rugoso={0.35} metal={0.25} raio={0.15} />
      <Peca p={[3.2, 1.0, -4.2]} s={[2.0, 0.5, 1.35]} cor="#18222C" rugoso={0.18} raio={0.14} />
    </>
  );
};

const Quadro: React.FC = () => {
  const t = useCurrentFrame() / 30;
  const andando = t < 1.6;
  const k = interpolate(t, [1.25, 1.6], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const z = interpolate(t, [0, 1.6], [-2.2, 0.4], { extrapolateRight: "clamp", easing: Easing.out(Easing.quad) });
  const passo = Math.sin(t * Math.PI * 3.2);
  const bob = Math.abs(Math.cos(t * Math.PI * 3.2)) * 0.016 * k;
  const fala = t > 1.7;
  const boca = fala ? Math.max(0, 0.42 * Math.sin(t * 13) + 0.34 * Math.sin(t * 21.7 + 1) + 0.18) : 0;
  const gesto = interpolate(t, [1.75, 2.1, 2.75, 3.05], [0, 1, 1, 0.45], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const aponta = interpolate(t, [3.7, 4.05], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const balanco = fala ? Math.sin(t * 5.4) : 0;
  const pose: Pose3D = {
    pernaE: 0.42 * passo * k,
    pernaD: -0.42 * passo * k,
    bracoE: [-0.3 * passo * k + 0.02 - gesto * 0.25, 0, -0.08 - gesto * 0.08],
    cotoveloE: 0.2 + gesto * 0.65,
    bracoD: [0.3 * passo * k + 0.02 - gesto * 0.55 - aponta * 0.35, 0, 0.08 + gesto * (0.42 + balanco * 0.05) + aponta * 0.55],
    cotoveloD: 0.2 + gesto * (0.95 + balanco * 0.16) - aponta * 0.65,
    tronco: 0.012 * Math.sin(t * 1.7),
    cabeca: [0.03 * Math.sin(t * 2.9) + (fala ? 0.03 * Math.sin(t * 6.3) : 0), 0.08 * Math.sin(t * 1.2) + aponta * 0.38, 0.02 * Math.sin(t * 0.9)],
  };
  const pisca = (t > 0.8 && t < 0.92) || (t > 2.65 && t < 2.77) || (t > 4.3 && t < 4.42);
  const close = t >= 3;
  const cam: { pos: [number, number, number]; alvo: [number, number, number] } = close
    ? { pos: [0.36 - (t - 3) * 0.1, 1.52, 2.6 - (t - 3) * 0.09], alvo: [0.02, 1.42, 0.4] }
    : { pos: [0.55 - t * 0.04, 1.32, 6.2 - t * 0.17], alvo: [0, 1.0, z * 0.45] };
  return (
    <PalcoCinema ceu="entardecer" fundo="#C8A98A" fov={28} luzCeu={0.42} brilhoCeu={0.9} desfoqueCeu={0.2}>
      <Camera pos={cam.pos} alvo={cam.alvo} />
      <Rua />
      <Personagem3D pos={[0, bob, z]} giro={andando ? 0.04 : 0.08 + aponta * 0.1} pose={pose} boca={boca} olhar={aponta * 0.6} pisca={pisca} />
      <Acabamento foco={Math.hypot(cam.pos[0], cam.pos[1] - 1.5, cam.pos[2] - z)} desfoque={close ? 7 : 5.5} brilho={0.22} saturacao={0.06} contraste={0.12} vinheta={0.38} ao={0} />
    </PalcoCinema>
  );
};

const Raiz: React.FC = () => <Composition id="Narrador3D" component={Quadro} durationInFrames={150} fps={30} width={1080} height={1920} />;
registerRoot(Raiz);
