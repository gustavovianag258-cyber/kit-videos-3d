import { RoundedBox } from "@react-three/drei";
import { useLayoutEffect, useMemo, useRef } from "react";
import { random } from "remotion";
import * as THREE from "three";
import { uma } from "./CasaPartida";

// Um rio de verdade: terreno modelado com barranco, água correndo em duas camadas, espuma na beira,
// redemoinhos, troncos descendo, pedras, juncos, capim e uma ponte. A cena é ilustrativa, não um lugar real.
export const NIVEL_RIO = -0.62;
const MEIA_LARGURA = 5.4;
export const centroRio = (z: number) => -10.6 + 3.2 * Math.sin(z * 0.085) + 1.4 * Math.sin(z * 0.21 + 1);
const sv = (x: number) => {
  const k = Math.min(1, Math.max(0, x));
  return k * k * (3 - 2 * k);
};
const ondula = (x: number, z: number) => 0.09 * Math.sin(x * 0.61 + z * 0.33) + 0.05 * Math.sin(x * 1.7 - z * 1.1) + 0.03 * Math.sin(x * 3.9 + z * 2.7);
export const alturaTerreno = (x: number, z: number) => {
  const d = Math.abs(x - centroRio(z));
  const leito = -1.9 + 1.0 * (d / MEIA_LARGURA) ** 2;
  const terra = ondula(x, z) * sv((d - MEIA_LARGURA - 2) / 6) + 0.02;
  const k = sv((d - MEIA_LARGURA + 0.4) / 2.6);
  return leito + (terra - leito) * k;
};
const geoTerreno = () => {
  const g = new THREE.PlaneGeometry(190, 290, 260, 330);
  g.rotateX(-Math.PI / 2);
  g.translate(-20, 0, -110);
  const p = g.attributes.position;
  const cores = new Float32Array(p.count * 3);
  const grama = new THREE.Color("#7F8A50");
  const grama2 = new THREE.Color("#5E7238");
  const lama = new THREE.Color("#6B5237");
  const areia = new THREE.Color("#94795A");
  const c = new THREE.Color();
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const z = p.getZ(i);
    p.setY(i, alturaTerreno(x, z));
    const d = Math.abs(x - centroRio(z));
    const mancha = 0.5 + 0.5 * Math.sin(x * 0.53 + Math.sin(z * 0.31) * 2);
    c.copy(grama).lerp(grama2, mancha);
    c.lerp(areia, 1 - sv((d - MEIA_LARGURA - 1.6) / 1.5));
    c.lerp(lama, 1 - sv((d - MEIA_LARGURA - 0.7) / 0.9));
    cores.set([c.r, c.g, c.b], i * 3);
  }
  g.setAttribute("color", new THREE.BufferAttribute(cores, 3));
  g.computeVertexNormals();
  return g;
};
const tela = (l: number, a: number, f: (g: CanvasRenderingContext2D) => void, rep: [number, number]) => {
  const c = document.createElement("canvas");
  c.width = l;
  c.height = a;
  f(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(...rep);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};
// grão do chão: multiplica a cor do terreno
const grao = () =>
  tela(
    1024,
    1024,
    (g) => {
      g.fillStyle = "#E8E8E8";
      g.fillRect(0, 0, 1024, 1024);
      for (let i = 0; i < 26000; i++) {
        const v = random(`gg${i}`);
        g.fillStyle = v > 0.5 ? `rgba(255,255,255,${0.1 + v * 0.3})` : `rgba(0,0,0,${0.07 + v * 0.26})`;
        g.fillRect(random(`gh${i}`) * 1024, random(`gi${i}`) * 1024, 1.5 + v * 3, 2 + v * 7);
      }
    },
    [150, 230],
  );
// corpo da água: barrenta, com veios esticados na direção da corrente
const corpoAgua = () =>
  tela(
    1024,
    1024,
    (g) => {
      g.fillStyle = "#6E5433";
      g.fillRect(0, 0, 1024, 1024);
      for (let i = 0; i < 500; i++) {
        const x = random(`wa${i}`) * 1024;
        const y = random(`wb${i}`) * 1024;
        const l = 40 + random(`wc${i}`) * 220;
        const d = g.createLinearGradient(x, y, x, y + l);
        const claro = random(`wd${i}`) > 0.5;
        d.addColorStop(0, "rgba(0,0,0,0)");
        d.addColorStop(0.5, claro ? `rgba(176,146,102,${0.08 + random(`we${i}`) * 0.2})` : `rgba(38,27,14,${0.08 + random(`we${i}`) * 0.2})`);
        d.addColorStop(1, "rgba(0,0,0,0)");
        g.fillStyle = d;
        g.fillRect(x, y, 6 + random(`wf${i}`) * 30, l);
      }
    },
    [9, 26],
  );
// espuma: traços claros que correm mais rápido
const espuma = () =>
  tela(
    1024,
    1024,
    (g) => {
      g.clearRect(0, 0, 1024, 1024);
      for (let i = 0; i < 300; i++) {
        const x = random(`ea${i}`) * 1024;
        const y = random(`eb${i}`) * 1024;
        const l = 18 + random(`ec${i}`) * 120;
        const a = 0.14 + random(`ed${i}`) * 0.44;
        g.strokeStyle = `rgba(240,232,214,${a})`;
        g.lineWidth = 0.8 + random(`ee${i}`) * 1.9;
        g.lineCap = "round";
        g.beginPath();
        g.moveTo(x, y);
        g.quadraticCurveTo(x + (random(`ef${i}`) - 0.5) * 34, y + l / 2, x + (random(`eg${i}`) - 0.5) * 22, y + l);
        g.stroke();
      }
    },
    [11, 28],
  );
const normalAgua = () => {
  const tam = 512;
  const c = document.createElement("canvas");
  c.width = c.height = tam;
  const g = c.getContext("2d")!;
  const img = g.createImageData(tam, tam);
  const TAU = Math.PI * 2;
  const r = new Array(14).fill(0).map((_, i) => ({ a: 1 + Math.floor(random(`na${i}`) * 9), b: 1 + Math.floor(random(`nb${i}`) * 3), f: random(`nc${i}`) * TAU, n: 0.3 + random(`nd${i}`) }));
  const h = (x: number, y: number) => r.reduce((s, o) => s + o.n * Math.sin(TAU * (o.a * x + o.b * y) + o.f), 0);
  for (let y = 0; y < tam; y++)
    for (let x = 0; x < tam; x++) {
      const nx = (h((x - 1) / tam, y / tam) - h((x + 1) / tam, y / tam)) * 3;
      const ny = (h(x / tam, (y - 1) / tam) - h(x / tam, (y + 1) / tam)) * 3;
      const l = Math.hypot(nx, ny, 1);
      const i = (y * tam + x) * 4;
      img.data[i] = (nx / l) * 127 + 128;
      img.data[i + 1] = (ny / l) * 127 + 128;
      img.data[i + 2] = (1 / l) * 127 + 128;
      img.data[i + 3] = 255;
    }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(16, 44);
  return t;
};

// espuma acompanhando a margem que serpenteia
const fitaMargem = (lado: -1 | 1, recuo: number) => {
  const pts: THREE.Vector3[] = [];
  for (let z = 30; z > -170; z -= 2) pts.push(new THREE.Vector3(centroRio(z) + lado * (MEIA_LARGURA - 0.66 - recuo + 0.14 * Math.sin(z * 1.3)), NIVEL_RIO + 0.015, z));
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 320, 0.028, 5);
};

const Instancias: React.FC<{ n: number; arruma: (o: THREE.Object3D, i: number) => string; children: React.ReactNode; sombra?: boolean }> = ({ n, arruma, children, sombra }) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = ref.current!;
    const o = new THREE.Object3D();
    const c = new THREE.Color();
    for (let i = 0; i < n; i++) {
      const cor = arruma(o, i);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      m.setColorAt(i, c.set(cor));
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, n]} castShadow={sombra} receiveShadow={sombra}>
      {children}
    </instancedMesh>
  );
};
const Tronco: React.FC<{ fase: number; t: number; lado: number; l: number; r: number }> = ({ fase, t, lado, l, r }) => {
  const z = ((fase * 120 + t * 3.1) % 120) - 96;
  const x = centroRio(z) + lado;
  return (
    <group position={[x, NIVEL_RIO + 0.03 + 0.025 * Math.sin(t * 2.4 + fase * 20), z]} rotation={[0.04 * Math.sin(t * 2 + fase), fase * 6 + t * 0.14, Math.PI / 2 + 0.05 * Math.sin(t * 1.7 + fase)]}>
      <mesh castShadow>
        <cylinderGeometry args={[r, r * 0.8, l, 12]} />
        <meshStandardMaterial color="#3D2D1E" roughness={0.9} />
      </mesh>
      <mesh position={[r * 1.2, l * 0.2, 0]} rotation={[0, 0, -0.8]} castShadow>
        <cylinderGeometry args={[r * 0.3, r * 0.2, l * 0.4, 8]} />
        <meshStandardMaterial color="#3A2B1D" roughness={0.9} />
      </mesh>
    </group>
  );
};
const Redemoinho: React.FC<{ fase: number; t: number; lado: number }> = ({ fase, t, lado }) => {
  const z = ((fase * 100 + t * 2.6) % 100) - 80;
  return (
    <group position={[centroRio(z) + lado, NIVEL_RIO + 0.018, z]} rotation={[-Math.PI / 2, 0, t * 2.2 + fase * 9]}>
      {[0.18, 0.34, 0.52].map((r, i) => (
        <mesh key={r}>
          <ringGeometry args={[r, r + 0.03, 28, 1, i, 4.6]} />
          <meshBasicMaterial color="#EDE4CF" transparent opacity={0.62 - i * 0.13} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
};
const Ponte: React.FC = () => {
  const z = -30;
  const c = centroRio(z);
  return (
    <group position={[c, 0, z]}>
      <Bloco p={[0, 1.3, 0]} s={[18, 0.36, 2.5]} cor="#8B8B85" />
      {[-1.15, 1.15].map((zz) => (
        <group key={zz}>
          <Bloco p={[0, 1.95, zz]} s={[18, 0.07, 0.07]} cor="#5C5F60" />
          {new Array(19).fill(0).map((_, i) => (
            <Bloco key={i} p={[-9 + i, 1.72, zz]} s={[0.06, 0.5, 0.06]} cor="#5C5F60" />
          ))}
        </group>
      ))}
      {[-3.4, 3.4].map((x) => (
        <group key={x}>
          <Bloco p={[x, 0, 0]} s={[0.8, 2.6, 1.9]} cor="#74746E" />
          <mesh position={[x, NIVEL_RIO + 0.02, 1.15]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.45, 0.72, 24]} />
            <meshBasicMaterial color="#EDE4CF" transparent opacity={0.72} depthWrite={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
};
const Bloco: React.FC<{ p: [number, number, number]; s: [number, number, number]; cor: string }> = ({ p, s, cor }) => (
  <RoundedBox args={s} position={p} radius={Math.min(0.02, Math.min(...s) * 0.45)} smoothness={2} castShadow receiveShadow>
    <meshStandardMaterial color={cor} roughness={0.85} />
  </RoundedBox>
);

export const RioVivo: React.FC<{ t: number }> = ({ t }) => {
  const geo = uma("geoTerreno", geoTerreno);
  const g = uma("graoTerreno", grao);
  const corpo = uma("corpoAgua", corpoAgua);
  const esp = uma("espumaRio", espuma);
  const nrm = uma("normalRio", normalAgua);
  const fitas = uma("fitasRio", () => [fitaMargem(-1, 0), fitaMargem(1, 0), fitaMargem(-1, 0.28), fitaMargem(1, 0.28)]);
  const vec = useMemo(() => new THREE.Vector2(0.5, 0.5), []);
  // a corrente desce em direção à câmera (+z)
  corpo.offset.set(0.012 * Math.sin(t * 0.5), t * 0.085);
  esp.offset.set(0.02 * Math.sin(t * 0.7), t * 0.15);
  nrm.offset.set(0, t * 0.22);
  return (
    <>
      <mesh geometry={geo} receiveShadow>
        <meshStandardMaterial map={g} vertexColors roughness={1} />
      </mesh>
      {/* água */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-10.6, NIVEL_RIO, -70]}>
        <planeGeometry args={[34, 240]} />
        <meshStandardMaterial map={corpo} normalMap={nrm} normalScale={vec} roughness={0.3} envMapIntensity={0.2} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-10.6, NIVEL_RIO + 0.006, -70]}>
        <planeGeometry args={[34, 240]} />
        <meshBasicMaterial map={esp} transparent opacity={0.46} depthWrite={false} />
      </mesh>
      {fitas.map((f, i) => (
        <mesh key={i} geometry={f}>
          <meshBasicMaterial color="#EFE8D6" transparent opacity={i < 2 ? 0.5 : 0.2} depthWrite={false} />
        </mesh>
      ))}
      {/* o que a água carrega */}
      {[0.08, 0.24, 0.41, 0.57, 0.73, 0.91].map((f, i) => (
        <Tronco key={f} fase={f} t={t} lado={[-2.6, 1.4, -0.7, 2.8, 0.4, -1.9][i]} l={1.2 + (i % 3) * 0.55} r={0.07 + (i % 2) * 0.04} />
      ))}
      {[0.12, 0.33, 0.52, 0.68, 0.87].map((f, i) => (
        <Redemoinho key={f} fase={f} t={t} lado={[-1.6, 2.2, 0.3, -3, 1.2][i]} />
      ))}
      {/* pedras na beira */}
      <Instancias
        n={170}
        sombra
        arruma={(o, i) => {
          const z = 18 - random(`pz${i}`) * 110;
          const lado = random(`pl${i}`) > 0.5 ? 1 : -1;
          const x = centroRio(z) + lado * (MEIA_LARGURA - 1 + random(`pd${i}`) * 1.8);
          const s = 0.1 + random(`ps${i}`) ** 2 * 0.5;
          o.position.set(x, Math.max(NIVEL_RIO, alturaTerreno(x, z)) + s * 0.2, z);
          o.rotation.set(random(`pa${i}`) * 3, random(`pb${i}`) * 3, random(`pc${i}`) * 3);
          o.scale.set(s, s * (0.55 + random(`pe${i}`) * 0.4), s * (0.8 + random(`pf${i}`) * 0.5));
          return ["#6F6A60", "#57534B", "#837C70"][i % 3];
        }}
      >
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.95} flatShading />
      </Instancias>
      {/* juncos no barranco */}
      <Instancias
        n={760}
        arruma={(o, i) => {
          const z = 16 - random(`jz${i}`) * 90;
          const lado = random(`jl${i}`) > 0.5 ? 1 : -1;
          const x = centroRio(z) + lado * (MEIA_LARGURA + 0.2 + random(`jd${i}`) * 1.6);
          const a = 0.5 + random(`ja${i}`) * 0.75;
          o.position.set(x, alturaTerreno(x, z) + a / 2, z);
          o.rotation.set(0.14 * Math.sin(t * 1.3 + i), random(`jr${i}`) * 3, 0.18 * (random(`js${i}`) - 0.5));
          o.scale.set(1, a, 1);
          return ["#62763B", "#73853F", "#4F652E", "#8A8A4A"][i % 4];
        }}
      >
        <cylinderGeometry args={[0.004, 0.018, 1, 5]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.9} />
      </Instancias>
      {/* capim no terreno perto da câmera */}
      <Instancias
        n={2600}
        arruma={(o, i) => {
          const x = -3.8 + random(`kx${i}`) * 13;
          const z = 12 - random(`kz${i}`) * 32;
          const a = 0.08 + random(`ka${i}`) * 0.2;
          o.position.set(x, alturaTerreno(x, z) + a / 2, z);
          o.rotation.set(0, random(`kr${i}`) * 3, (random(`ks${i}`) - 0.5) * 0.5);
          o.scale.set(1, a, 1);
          return ["#7D8C47", "#5F7437", "#94A055", "#6F7D3D"][i % 4];
        }}
      >
        <coneGeometry args={[0.022, 1, 4]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.9} />
      </Instancias>
      <Ponte />
    </>
  );
};
