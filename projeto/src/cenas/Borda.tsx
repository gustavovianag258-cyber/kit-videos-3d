import { useLayoutEffect, useMemo, useRef } from "react";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";
import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { CENAS, clamp, ease, lerp, type Vec3 } from "../roteiro";
import { CameraControlada, criarBrilho, Estrelas } from "./comum";

// Cena 3: "Mas espera... para onde iria toda essa água?"
// O oceano chega na borda do mundo e despenca no vazio.

const DURACAO = CENAS.gravidade - CENAS.borda;
const LARGURA = 400; // largura da borda mostrada (eixo z)
const COMPRIMENTO = 400; // oceano de x = -400 até a borda em x = 0

const criarTexturaAgua = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#1a6fc0";
  ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 140; i++) {
    ctx.fillStyle = `rgba(190,225,255,${0.15 + random(`agua-a-${i}`) * 0.35})`;
    ctx.fillRect(random(`agua-x-${i}`) * 256, random(`agua-y-${i}`) * 256, 20 + random(`agua-w-${i}`) * 60, 2);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(10, 10);
  return tex;
};

// Riscos brancos ao longo da queda (direção u = sentido da água)
const criarTexturaQueda = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#3f8fd8";
  ctx.fillRect(0, 0, 512, 256);
  for (let i = 0; i < 260; i++) {
    ctx.fillStyle = `rgba(255,255,255,${0.3 + random(`queda-a-${i}`) * 0.6})`;
    ctx.fillRect(random(`queda-x-${i}`) * 512, random(`queda-y-${i}`) * 256, 60 + random(`queda-w-${i}`) * 160, 1 + random(`queda-h-${i}`) * 3);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 6);
  return tex;
};

// A água fica transparente conforme cai, sumindo no vazio
const criarTransparenciaQueda = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 4;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, 256, 0);
  g.addColorStop(0, "#ffffff");
  g.addColorStop(0.5, "#aaaaaa");
  g.addColorStop(1, "#000000");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 4);
  return new THREE.CanvasTexture(canvas);
};

const Oceano: React.FC<{ t: number }> = ({ t }) => {
  const mapa = useMemo(criarTexturaAgua, []);
  const geo = useMemo(
    () =>
      new THREE.PlaneGeometry(COMPRIMENTO, LARGURA, 140, 140)
        .rotateX(-Math.PI / 2)
        .translate(-COMPRIMENTO / 2, 0, 0),
    [],
  );
  // Ondas e a curva da água descendo na beirada, recalculadas a cada frame
  useMemo(() => {
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      let y =
        0.5 * Math.sin(x * 0.09 + t * 0.15) +
        0.35 * Math.sin(z * 0.13 - t * 0.11) +
        0.2 * Math.sin((x + z) * 0.21 + t * 0.23);
      const perto = Math.max(0, (x + 8) / 8); // últimos 8 m antes da borda
      y = y * (1 - perto) - perto * perto * 2.5;
      pos.setY(i, y);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
  }, [geo, t]);
  // A textura corre em direção à borda
  mapa.offset.x = -t * 0.012;

  return (
    <mesh geometry={geo} receiveShadow>
      <meshStandardMaterial map={mapa} roughness={0.15} metalness={0.15} />
    </mesh>
  );
};

const Queda: React.FC<{ t: number }> = ({ t }) => {
  const mapa = useMemo(criarTexturaQueda, []);
  const alfa = useMemo(criarTransparenciaQueda, []);
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(1, LARGURA, 80, 40);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const s = (pos.getX(i) + 0.5) * 110; // distância ao longo da queda
      const z = pos.getY(i);
      // Parábola: sai da borda para fora e cai cada vez mais rápido
      pos.setXYZ(i, s * 0.32, -2.5 - 0.016 * s * s, z);
    }
    g.computeVertexNormals();
    return g;
  }, []);
  mapa.offset.x = -t * 0.035;

  return (
    <mesh geometry={geo}>
      <meshStandardMaterial
        map={mapa}
        alphaMap={alfa}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        emissive="#2a5a8a"
        emissiveIntensity={0.35}
        roughness={0.3}
      />
    </mesh>
  );
};

const N_ESPUMA = 600;
const Espuma: React.FC<{ t: number }> = ({ t }) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dados = useMemo(
    () =>
      Array.from({ length: N_ESPUMA }, (_, i) => ({
        x: -6 + random(`esp-x-${i}`) * 9,
        z: (random(`esp-z-${i}`) - 0.5) * LARGURA,
        fase: random(`esp-f-${i}`) * Math.PI * 2,
        tam: 0.2 + random(`esp-t-${i}`) * 0.5,
      })),
    [],
  );
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    dados.forEach((d, i) => {
      const y = -1.2 - Math.max(0, d.x) * 0.4 + 0.5 * Math.abs(Math.sin(t * 0.25 + d.fase));
      const s = d.tam * (0.8 + 0.3 * Math.sin(t * 0.3 + d.fase));
      m.compose(new THREE.Vector3(d.x, y, d.z), q, new THREE.Vector3(s, s * 0.6, s));
      ref.current!.setMatrixAt(i, m);
    });
    ref.current!.instanceMatrix.needsUpdate = true;
  }, [dados, t]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, N_ESPUMA]} frustumCulled={false}>
      <sphereGeometry args={[1, 8, 6]} />
      <meshStandardMaterial color="#ffffff" roughness={0.9} transparent opacity={0.9} />
    </instancedMesh>
  );
};

// Gotas que saltam da borda e caem (trajetória de queda livre, em loop)
const N_GOTAS = 900;
const Gotas: React.FC<{ t: number }> = ({ t }) => {
  const base = useMemo(
    () =>
      Array.from({ length: N_GOTAS }, (_, i) => ({
        z: (random(`gota-z-${i}`) - 0.5) * LARGURA,
        vx: 4 + random(`gota-vx-${i}`) * 6,
        vy: 1 + random(`gota-vy-${i}`) * 4,
        fase: random(`gota-f-${i}`) * 3,
      })),
    [],
  );
  const segundos = t / 30;
  const arr = new Float32Array(N_GOTAS * 3);
  base.forEach((g, i) => {
    const tau = (segundos + g.fase) % 3;
    arr[i * 3] = g.vx * tau;
    arr[i * 3 + 1] = -1.5 + g.vy * tau - 4.9 * tau * tau;
    arr[i * 3 + 2] = g.z;
  });
  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[arr, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#e8f6ff" size={0.45} sizeAttenuation transparent opacity={0.85} />
    </points>
  );
};

const Nevoa: React.FC<{ t: number }> = ({ t }) => {
  const mapa = useMemo(() => criarBrilho("rgba(220,240,255,0.55)"), []);
  return (
    <>
      {Array.from({ length: 10 }, (_, i) => {
        const tam = 40 + random(`nev-t-${i}`) * 50;
        return (
          <sprite
            key={i}
            position={[
              10 + random(`nev-x-${i}`) * 25,
              -12 - random(`nev-y-${i}`) * 30 - t * 0.05,
              (random(`nev-z-${i}`) - 0.5) * 160,
            ]}
            scale={[tam, tam, 1]}
          >
            <spriteMaterial map={mapa} transparent depthWrite={false} opacity={0.5} />
          </sprite>
        );
      })}
    </>
  );
};

export const Borda: React.FC = () => {
  const t = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // A câmera vem por cima do oceano e desce acompanhando a água
  const p = interpolate(t, [0, DURACAO], [0, 1], { ...clamp, easing: ease });
  // Termina de lado e afastada, para ver a queda inteira (sem entrar na água)
  const posicao: Vec3 = [lerp(-60, 60, p), lerp(14, 4, p), lerp(46, 150, p)];
  const alvo: Vec3 = [lerp(-10, 18, p), lerp(0, -40, p), lerp(0, 10, p)];

  return (
    <AbsoluteFill
      style={{ background: "linear-gradient(180deg, #0a1638 0%, #050817 55%, #000000 100%)" }}
    >
      <ThreeCanvas width={width} height={height} camera={{ fov: 50, near: 0.1, far: 5000 }}>
        <CameraControlada posicao={posicao} alvo={alvo} />
        <hemisphereLight args={["#9fc4ff", "#141428", 0.7]} />
        <directionalLight position={[-50, 60, 80]} color="#fff2dc" intensity={2.6} />
        <Estrelas raio={3000} quantidade={1200} />
        <Oceano t={t} />
        <Queda t={t} />
        <Espuma t={t} />
        <Gotas t={t} />
        <Nevoa t={t} />
        {/* Rocha da borda do disco, por baixo da água */}
        <mesh position={[-COMPRIMENTO / 2, -42.5, 0]}>
          <boxGeometry args={[COMPRIMENTO, 80, LARGURA]} />
          <meshStandardMaterial color="#5b4433" roughness={1} flatShading />
        </mesh>
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
