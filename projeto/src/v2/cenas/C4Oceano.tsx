import { useLayoutEffect, useMemo, useRef } from "react";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";
import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { AguaEquilibrio, DiscoCortado, SetasGravidade } from "../Diagramas";
import { Camera, Estrelas } from "../mundo";
import { mapaDoPlaneta } from "../PlanetaDisco";
import { SolVisivel } from "../Sol";
import { CENAS, clamp, ease, lerp, MARCOS, type Vec3 } from "../tempo";

// CENA 4 — OS OCEANOS E A BORDA DO MUNDO
// 1) Rente à água, um navio segue para a borda  2) A câmera sobe: cachoeira colossal (HIPÓTESE)
// 3) Câmera lenta até parar + X vermelho        4) Diagrama: água em equilíbrio no disco uniforme
//
// Coordenadas da cena: a borda do mundo fica em x = 0; o oceano em x < 0; queda em x > 0.

const INICIO = CENAS.oceano.inicio;
const T_REVELA = MARCOS.bordaRevelada - INICIO;
const T_LENTO = MARCOS.congelaOceano - INICIO;
const T_DIAGRAMA = MARCOS.diagramaAgua - INICIO;
const LARGURA = 1600; // trecho de borda mostrado (eixo z)
const QUEDA = 900; // altura visível da queda

// Tempo "da física": normal até T_LENTO, depois desacelera até parar em ~0,7 s
const tempoEfetivo = (t: number) => {
  if (t <= T_LENTO) return t;
  const d = t - T_LENTO;
  const DUR = 0.7;
  const k = Math.min(d, DUR);
  return T_LENTO + k - (k * k) / (2 * DUR); // velocidade cai linearmente até zero
};

const texturaAgua = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0, "#1c6fb5");
  g.addColorStop(1, "#155c9a");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 420; i++) {
    const x = random(`ag-x-${i}`) * 512;
    const y = random(`ag-y-${i}`) * 512;
    const w = 6 + random(`ag-w-${i}`) * 26;
    ctx.strokeStyle = `rgba(200,235,255,${0.08 + random(`ag-a-${i}`) * 0.22})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + w / 2, y - 3, x + w, y);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(40, 40);
  tex.anisotropy = 8;
  return tex;
};

const texturaQueda = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#3f8fd6";
  ctx.fillRect(0, 0, 512, 512);
  // Filetes de água no sentido da queda (u = largura, v = queda), com desfoque para não serrilhar
  ctx.filter = "blur(1.5px)";
  for (let i = 0; i < 260; i++) {
    const x = random(`qd-x-${i}`) * 512;
    const y = random(`qd-y-${i}`) * 512;
    const comp = 80 + random(`qd-c-${i}`) * 300;
    ctx.fillStyle = `rgba(255,255,255,${0.25 + random(`qd-a-${i}`) * 0.55})`;
    ctx.fillRect(x, y, 1.5 + random(`qd-w-${i}`) * 4, comp);
    ctx.fillRect(x, y - 512, 1.5 + random(`qd-w-${i}`) * 4, comp); // continua do outro lado (sem emenda)
  }
  ctx.filter = "none";
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(10, 2);
  tex.anisotropy = 8;
  return tex;
};

const transparenciaQueda = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 4;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, "#ffffff");
  g.addColorStop(0.55, "#bbbbbb");
  g.addColorStop(1, "#000000");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 4, 256);
  return new THREE.CanvasTexture(canvas);
};

// Altura das ondas (determinística) em (x, z) no tempo te
const onda = (x: number, z: number, te: number) =>
  0.55 * Math.sin(x * 0.09 + te * 1.1) +
  0.35 * Math.sin(z * 0.12 - te * 0.8) +
  0.18 * Math.sin((x - z) * 0.31 + te * 1.9);

const Oceano: React.FC<{ te: number; centroX: number; centroZ: number }> = ({ te, centroX, centroZ }) => {
  const mapa = useMemo(texturaAgua, []);
  // Malha densa perto da câmera (acompanha o navio), sobre um plano grande de fundo
  const geo = useMemo(() => new THREE.PlaneGeometry(260, 260, 130, 130).rotateX(-Math.PI / 2), []);
  useMemo(() => {
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i) + centroX;
      const z = pos.getZ(i) + centroZ;
      // Perto da borda (x > -30) a água acelera e se curva para baixo
      const perto = Math.max(0, (x + 30) / 30);
      pos.setY(i, onda(x, z, te) * (1 - perto) - perto * perto * 6);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
  }, [geo, te, centroX, centroZ]);
  mapa.offset.set((-te * 0.01) % 1, 0);
  return (
    <>
      <mesh geometry={geo} position={[centroX, 0, centroZ]} receiveShadow>
        <meshStandardMaterial map={mapa} roughness={0.18} metalness={0.25} />
      </mesh>
      {/* Mar distante (plano, sem ondas) até perto da borda */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-2030, -0.4, 0]}>
        <planeGeometry args={[4000, LARGURA * 2]} />
        <meshStandardMaterial map={mapa} roughness={0.25} metalness={0.2} />
      </mesh>
      <FaixaDaBorda mapa={mapa} />
    </>
  );
};

// Os últimos 30 m antes da borda, em toda a largura: a água acelera e se curva para baixo
const FaixaDaBorda: React.FC<{ mapa: THREE.Texture }> = ({ mapa }) => {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(32, LARGURA * 2, 16, 1).rotateX(-Math.PI / 2).translate(-16, 0, 0);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const perto = Math.max(0, (pos.getX(i) + 30) / 30);
      pos.setY(i, -0.4 * (1 - perto) - perto * perto * 6);
    }
    g.computeVertexNormals();
    return g;
  }, []);
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial map={mapa} roughness={0.2} metalness={0.2} />
    </mesh>
  );
};

const Cachoeira: React.FC<{ te: number }> = ({ te }) => {
  const mapa = useMemo(texturaQueda, []);
  const alfa = useMemo(transparenciaQueda, []);
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(LARGURA, 1, 60, 60);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const z = pos.getX(i);
      const s = (0.5 - pos.getY(i)) * QUEDA; // 0 no topo → QUEDA embaixo
      // Sai da borda para fora e cai cada vez mais na vertical
      pos.setXYZ(i, 2.5 * Math.sqrt(s * 6), -6 - s, z);
    }
    g.computeVertexNormals();
    return g;
  }, []);
  // v cresce para baixo na queda: a textura "desce" com o tempo
  mapa.offset.set(0, (te * 0.35) % 1);
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial
        map={mapa}
        alphaMap={alfa}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        emissive="#1f4f80"
        emissiveIntensity={0.45}
        roughness={0.35}
      />
    </mesh>
  );
};

// Espuma na beira e névoa de gotas caindo (trajetórias de queda livre, em ciclo)
const N_GOTAS = 2200;
const Gotas: React.FC<{ te: number }> = ({ te }) => {
  const base = useMemo(
    () =>
      Array.from({ length: N_GOTAS }, (_, i) => ({
        z: (random(`gt-z-${i}`) - 0.5) * LARGURA,
        vx: 5 + random(`gt-vx-${i}`) * 9,
        vy: random(`gt-vy-${i}`) * 5,
        fase: random(`gt-f-${i}`) * 6,
      })),
    [],
  );
  const arr = new Float32Array(N_GOTAS * 3);
  base.forEach((g, i) => {
    const tau = (te + g.fase) % 6;
    arr[i * 3] = g.vx * tau;
    arr[i * 3 + 1] = -5 + g.vy * tau - 4.9 * tau * tau;
    arr[i * 3 + 2] = g.z;
  });
  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[arr, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#eaf6ff" size={0.9} sizeAttenuation transparent opacity={0.8} depthWrite={false} />
    </points>
  );
};

const Espuma: React.FC<{ te: number }> = ({ te }) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const N = 900;
  const dados = useMemo(
    () =>
      Array.from({ length: N }, (_, i) => ({
        x: -14 + random(`es-x-${i}`) * 16,
        z: (random(`es-z-${i}`) - 0.5) * LARGURA,
        fase: random(`es-f-${i}`) * Math.PI * 2,
        tam: 0.5 + random(`es-t-${i}`) * 1.4,
      })),
    [],
  );
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    dados.forEach((d, i) => {
      const perto = Math.max(0, (d.x + 30) / 30);
      const y = -perto * perto * 6 + 0.3 + 0.25 * Math.sin(te * 2 + d.fase);
      const s = d.tam * (0.85 + 0.25 * Math.sin(te * 1.5 + d.fase));
      m.compose(new THREE.Vector3(d.x, y, d.z), q, new THREE.Vector3(s, s * 0.35, s));
      ref.current!.setMatrixAt(i, m);
    });
    ref.current!.instanceMatrix.needsUpdate = true;
  }, [dados, te]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, N]} frustumCulled={false}>
      <sphereGeometry args={[1, 10, 6]} />
      <meshStandardMaterial color="#ffffff" roughness={0.9} transparent opacity={0.92} />
    </instancedMesh>
  );
};

// Navio cargueiro simples (~60 m), apontando para +x (para a borda)
const Navio: React.FC<{ x: number; z: number; te: number }> = ({ x, z, te }) => {
  const balanco = Math.sin(te * 0.9) * 0.025;
  const arfagem = Math.sin(te * 0.7 + 1) * 0.02;
  const y = onda(x, z, te) * 0.6 + 0.4;
  const conteineres = ["#c0392b", "#2980b9", "#f39c12", "#27ae60", "#8e44ad", "#d35400"];
  return (
    <group position={[x, y, z]} rotation={[balanco, 0, arfagem]}>
      {/* Casco */}
      <mesh position={[0, 1.6, 0]} castShadow>
        <boxGeometry args={[56, 5.5, 11]} />
        <meshStandardMaterial color="#1f2833" roughness={0.6} metalness={0.3} />
      </mesh>
      <mesh position={[0, -0.3, 0]}>
        <boxGeometry args={[54, 1.6, 10.6]} />
        <meshStandardMaterial color="#b3261e" roughness={0.7} />
      </mesh>
      {/* Proa em cunha */}
      <mesh position={[30.5, 1.6, 0]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.1, 5.6, 5.5, 3, 1]} />
        <meshStandardMaterial color="#1f2833" roughness={0.6} />
      </mesh>
      {/* Contêineres */}
      {Array.from({ length: 6 }, (_, i) =>
        [0, 1].map((n) => (
          <mesh key={`${i}-${n}`} position={[-14 + i * 6.5, 5.4 + n * 2.6, (n - 0.5) * 3.2]} castShadow>
            <boxGeometry args={[6, 2.5, 3]} />
            <meshStandardMaterial color={conteineres[(i + n * 3) % 6]} roughness={0.7} />
          </mesh>
        )),
      )}
      {/* Ponte de comando */}
      <mesh position={[-23, 7, 0]} castShadow>
        <boxGeometry args={[6, 8, 9]} />
        <meshStandardMaterial color="#f2f2f2" roughness={0.6} />
      </mesh>
      <mesh position={[-20.2, 9.5, 0]}>
        <boxGeometry args={[0.4, 1.2, 8.4]} />
        <meshStandardMaterial color="#14202b" roughness={0.2} metalness={0.6} />
      </mesh>
      <mesh position={[-25, 12.5, 0]}>
        <cylinderGeometry args={[0.9, 1.1, 3, 16]} />
        <meshStandardMaterial color="#c0392b" />
      </mesh>
    </group>
  );
};

// Esteira de espuma atrás do navio
const Esteira: React.FC<{ x: number; z: number }> = ({ x, z }) => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[x - 50, 0.55, z]}>
    <planeGeometry args={[60, 9]} />
    <meshBasicMaterial color="#ffffff" transparent opacity={0.28} depthWrite={false} />
  </mesh>
);

const Borda: React.FC<{ t: number }> = ({ t }) => {
  const { width, height } = useVideoConfig();
  const te = tempoEfetivo(t);
  // Navio avança em direção à borda (x = 0)
  const navioX = -380 + te * 44;
  const navioZ = 0;
  // 1) Câmera baixa atrás do navio, com ele no centro  2) sobe e vai para o lado: queda colossal
  const r = interpolate(t, [T_REVELA - 0.9, T_LENTO + 0.2], [0, 1], { ...clamp, easing: ease });
  // Vista final: de fora do mundo, de lado e um pouco abaixo da borda — o oceano em cima,
  // a queda colossal no meio e o navio pequenininho chegando na beira
  const perto: Vec3 = [navioX - 95, 16, navioZ + 26];
  const longe: Vec3 = [620, 60, 900];
  const posicao: Vec3 = [lerp(perto[0], longe[0], r), lerp(perto[1], longe[1], r), lerp(perto[2], longe[2], r)];
  const alvo: Vec3 = [lerp(navioX + 30, -60, r), lerp(5, -230, r), lerp(navioZ, 0, r)];
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #0a1940 0%, #1d3f7a 38%, #6d8fc0 58%, #0b1430 72%, #02040b 100%)" }}>
      <ThreeCanvas
        width={width}
        height={height}
        shadows
        gl={{ logarithmicDepthBuffer: true }}
        camera={{ fov: 50, near: 0.5, far: 200000 }}
      >
        <Camera posicao={posicao} alvo={alvo} />
        <hemisphereLight args={["#cfe2ff", "#20345a", 1.1]} />
        <directionalLight position={[-300, 220, 260]} color="#fff0d6" intensity={2.8} castShadow />
        <SolVisivel posicao={[-60000, 26000, 30000]} raio={1800} />
        <Estrelas raio={150000} quantidade={1800} />
        <Oceano te={te} centroX={Math.min(navioX, -140)} centroZ={navioZ} />
        <Esteira x={navioX} z={navioZ} />
        <Navio x={navioX} z={navioZ} te={te} />
        <Cachoeira te={te} />
        <Espuma te={te} />
        <Gotas te={te} />
        {/* Rocha do disco sob a água */}
        <mesh position={[-1000, -QUEDA / 2 - 6, 0]}>
          <boxGeometry args={[2000, QUEDA, LARGURA * 1.05]} />
          <meshStandardMaterial color="#4e3624" roughness={1} />
        </mesh>
      </ThreeCanvas>
    </AbsoluteFill>
  );
};

const Diagrama: React.FC<{ t: number }> = ({ t }) => {
  const { width, height } = useVideoConfig();
  const mapa = useMemo(() => {
    const tex = new THREE.CanvasTexture(mapaDoPlaneta().cor);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);
  const tl = t - T_DIAGRAMA;
  const duracao = CENAS.oceano.fim - MARCOS.diagramaAgua;
  const p = interpolate(tl, [0, duracao], [0, 1], { ...clamp, easing: ease });
  // Metade do disco (do centro até a borda), quase de frente ao corte, para ver o perfil da água
  const CENTRO_X = 0.45;
  const ang = lerp(0.35, 0.06, p);
  const dist = lerp(3.4, 3.1, p);
  const posicao: Vec3 = [CENTRO_X + Math.sin(ang) * dist, lerp(0.75, 0.3, p), Math.cos(ang) * dist];
  const agua = interpolate(tl, [1.2, 4.6], [0, 1], { ...clamp, easing: ease });
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #0f2c4a 0%, #04080f 70%)" }}>
      <ThreeCanvas width={width} height={height} camera={{ fov: 42, near: 0.01, far: 100 }}>
        <Camera posicao={posicao} alvo={[CENTRO_X, -0.02, 0]} />
        <ambientLight intensity={0.55} />
        <directionalLight position={[2, 3, 4]} intensity={1.6} />
        <directionalLight position={[-3, 1, 2]} intensity={0.5} color="#9fc4ff" />
        <Estrelas raio={60} quantidade={600} opacidade={0.6} />
        <DiscoCortado textura={mapa} />
        <AguaEquilibrio progresso={agua} exagero={1} />
        <SetasGravidade progresso={1} escala={0.16} />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};

export const C4Oceano: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  if (t >= T_DIAGRAMA) return <Diagrama t={t} />;
  // Ao parar, a imagem perde um pouco de cor (momento da correção)
  const parado = interpolate(t, [T_LENTO + 0.4, T_LENTO + 0.8], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ filter: parado > 0 ? `saturate(${1 - parado * 0.6}) brightness(${1 - parado * 0.25})` : "none" }}>
      <Borda t={t} />
    </AbsoluteFill>
  );
};
