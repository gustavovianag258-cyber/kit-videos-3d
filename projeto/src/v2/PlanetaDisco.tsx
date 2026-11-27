import { useMemo } from "react";
import * as THREE from "three";
import { fbm } from "./ruido";

// A Terra plana do vídeo: disco de 40 km de diâmetro (1 unidade = 1 metro).
// Escala artística, para caber a estação, o personagem e o planeta na mesma história.
export const RAIO = 20000;
export const ESPESSURA = 2600;
const ALTURA_MONTANHAS = 1500; // exagerada, para o relevo aparecer de longe
export const NIVEL_MAR = 0.52;

// ---------------- Mapa do planeta (calculado uma vez e reaproveitado) ----------------
const TAM = 2048;
type Mapa = { cor: HTMLCanvasElement; elevacao: Float32Array };
let mapaEmCache: Mapa | null = null;

const misturar = (a: number[], b: number[], t: number) => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const C = {
  fundo: hex("#0a3266"),
  raso: hex("#2f8fd0"),
  areia: hex("#d9c48e"),
  deserto: hex("#d0ad72"),
  savana: hex("#a8a35a"),
  floresta: hex("#2e6b2c"),
  temperado: hex("#5c9a45"),
  tundra: hex("#8b9878"),
  rocha: hex("#7c6c5b"),
  neve: hex("#eef2f6"),
  gelo: hex("#e4f0fb"),
};
const sat = (x: number) => Math.min(1, Math.max(0, x));

// Elevação relativa ao nível do mar em um ponto do disco (x, z em [-1, 1])
const elevacaoEm = (x: number, z: number) => {
  const wx = fbm(x * 1.4 + 5.2, z * 1.4 + 1.3, 2, 101);
  const wz = fbm(x * 1.4 - 3.1, z * 1.4 + 7.7, 2, 202);
  const qx = x + 0.45 * (wx - 0.5);
  const qz = z + 0.45 * (wz - 0.5);
  return fbm(qx * 2.1 + 10, qz * 2.1 + 10, 5, 303) - NIVEL_MAR;
};

export const mapaDoPlaneta = (): Mapa => {
  if (mapaEmCache) return mapaEmCache;
  const elevacao = new Float32Array(TAM * TAM);
  for (let j = 0; j < TAM; j++) {
    for (let i = 0; i < TAM; i++) {
      const x = (i / (TAM - 1)) * 2 - 1;
      const z = (j / (TAM - 1)) * 2 - 1;
      elevacao[j * TAM + i] = x * x + z * z > 1.02 ? -0.2 : elevacaoEm(x, z);
    }
  }
  const canvas = document.createElement("canvas");
  canvas.width = TAM;
  canvas.height = TAM;
  const ctx = canvas.getContext("2d")!;
  const img = ctx.createImageData(TAM, TAM);
  for (let j = 0; j < TAM; j++) {
    for (let i = 0; i < TAM; i++) {
      const k = j * TAM + i;
      const x = (i / (TAM - 1)) * 2 - 1;
      const z = (j / (TAM - 1)) * 2 - 1;
      const r = Math.sqrt(x * x + z * z);
      const e = elevacao[k];
      // "Latitude" do mapa plano clássico: centro frio, faixa quente no meio, borda gelada
      const calor = sat(1 - Math.abs(r - 0.5) * 2.4);
      const umidade = fbm(x * 3 + 9, z * 3 + 9, 3, 404);
      let cor: number[];
      if (e < 0) {
        cor = misturar(C.raso, C.fundo, sat(-e * 6));
      } else if (e < 0.012) {
        cor = C.areia;
      } else {
        let bioma =
          calor > 0.6
            ? umidade > 0.52
              ? C.floresta
              : umidade > 0.42
                ? C.savana
                : C.deserto
            : calor > 0.3
              ? umidade > 0.45
                ? C.temperado
                : C.savana
              : C.tundra;
        bioma = misturar(bioma, C.rocha, sat((e - 0.13) * 8));
        cor = misturar(bioma, C.neve, sat((e - 0.22 + (1 - calor) * 0.1) * 10));
      }
      // Gelo: pequena calota no centro e o anel da borda (como no mapa plano clássico)
      cor = misturar(cor, C.gelo, sat((r - 0.94) * 30) + sat((0.05 - r) * 40));
      // Sombreamento do relevo (luz vinda de cima à esquerda)
      if (e > 0 && i > 0 && j > 0) {
        const dx = e - elevacao[k - 1];
        const dz = e - elevacao[k - TAM];
        const s = 1 + Math.max(-0.35, Math.min(0.35, (dx + dz) * 90));
        cor = cor.map((c) => c * s);
      }
      img.data[k * 4] = cor[0];
      img.data[k * 4 + 1] = cor[1];
      img.data[k * 4 + 2] = cor[2];
      img.data[k * 4 + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  mapaEmCache = { cor: canvas, elevacao };
  return mapaEmCache;
};

let nuvensEmCache: HTMLCanvasElement[] = [];
const texturaNuvens = (camada: number) => {
  if (!nuvensEmCache[camada]) {
    const N = 1024;
    const canvas = document.createElement("canvas");
    canvas.width = N;
    canvas.height = N;
    const ctx = canvas.getContext("2d")!;
    const img = ctx.createImageData(N, N);
    for (let j = 0; j < N; j++) {
      for (let i = 0; i < N; i++) {
        const x = (i / N) * 2 - 1;
        const z = (j / N) * 2 - 1;
        const n = fbm(x * 4 + camada * 13, z * 4 - camada * 7, 5, 600 + camada * 50);
        const a = sat((n - (camada === 0 ? 0.56 : 0.6)) * 5) * (x * x + z * z < 0.96 ? 1 : 0);
        const k = (j * N + i) * 4;
        img.data[k] = img.data[k + 1] = img.data[k + 2] = 255;
        img.data[k + 3] = Math.round(a * 235);
      }
    }
    ctx.putImageData(img, 0, 0);
    nuvensEmCache[camada] = canvas;
  }
  const tex = new THREE.CanvasTexture(nuvensEmCache[camada]);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
};

const texturaRocha = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;
  const camadas = ["#6e4b30", "#7d5a3a", "#5b3d28", "#8a6a48", "#4f3523", "#6b4a33"];
  let y = 0;
  let i = 0;
  while (y < 512) {
    const h = 12 + ((i * 37) % 40);
    ctx.fillStyle = camadas[i % camadas.length];
    ctx.fillRect(0, y, 64, h);
    y += h;
    i++;
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.repeat.set(60, 1);
  return tex;
};

// ---------------- Atmosfera: brilho azul mais forte nas bordas ----------------
const atmosferaVertex = /* glsl */ `
  #include <common>
  #include <logdepthbuf_pars_vertex>
  varying vec3 vNormal;
  varying vec3 vVista;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vVista = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
    #include <logdepthbuf_vertex>
  }
`;
const atmosferaFragment = /* glsl */ `
  #include <logdepthbuf_pars_fragment>
  uniform vec3 cor;
  uniform float intensidade;
  varying vec3 vNormal;
  varying vec3 vVista;
  void main() {
    #include <logdepthbuf_fragment>
    float borda = 1.0 - abs(dot(normalize(vNormal), normalize(vVista)));
    float a = pow(borda, 2.6) * intensidade;
    gl_FragColor = vec4(cor * a, a);
  }
`;

export const Atmosfera: React.FC<{ intensidade?: number }> = ({ intensidade = 0.9 }) => {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: atmosferaVertex,
        fragmentShader: atmosferaFragment,
        uniforms: {
          cor: { value: new THREE.Color("#6fb8ff") },
          intensidade: { value: intensidade },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [intensidade],
  );
  return (
    <mesh material={material} scale={[RAIO * 1.07, 5200, RAIO * 1.07]} position={[0, 300, 0]}>
      <sphereGeometry args={[1, 96, 48]} />
    </mesh>
  );
};

// ---------------- O disco ----------------
export const PlanetaDisco: React.FC<{
  giroNuvens?: number; // rotação das nuvens (radianos), para dar vida
  comAtmosfera?: boolean;
  intensidadeAtmosfera?: number;
}> = ({ giroNuvens = 0, comAtmosfera = true, intensidadeAtmosfera = 0.9 }) => {
  const mapa = useMemo(mapaDoPlaneta, []);
  const texturaSuperficie = useMemo(() => {
    const t = new THREE.CanvasTexture(mapa.cor);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 16;
    return t;
  }, [mapa]);
  const superficie = useMemo(() => {
    // Anel com muitos segmentos: tem vértices no meio, que sobem para formar montanhas
    const g = new THREE.RingGeometry(1, RAIO, 360, 150);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const u = Math.round(((x / RAIO + 1) / 2) * (TAM - 1));
      const v = Math.round(((z / RAIO + 1) / 2) * (TAM - 1));
      const e = mapa.elevacao[Math.min(TAM - 1, Math.max(0, v)) * TAM + Math.min(TAM - 1, Math.max(0, u))];
      pos.setY(i, Math.max(0, e) * ALTURA_MONTANHAS * (1 / 0.35));
    }
    // UV no mesmo sistema do mapa (a rotação inverteu o eixo z da textura)
    const uv = g.attributes.uv;
    for (let i = 0; i < uv.count; i++) {
      uv.setXY(i, (pos.getX(i) / RAIO + 1) / 2, 1 - (pos.getZ(i) / RAIO + 1) / 2);
    }
    g.computeVertexNormals();
    return g;
  }, [mapa]);
  const nuvens0 = useMemo(() => texturaNuvens(0), []);
  const nuvens1 = useMemo(() => texturaNuvens(1), []);
  const rocha = useMemo(texturaRocha, []);
  const baseRochosa = useMemo(() => {
    const g = new THREE.ConeGeometry(RAIO * 0.985, ESPESSURA * 3, 96, 10, true);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const ang = Math.atan2(z, x);
      const k = 1 + (fbm(ang * 3 + 50, y / 2500 + 50, 3, 707) - 0.5) * 0.18;
      pos.setXYZ(i, x * k, y, z * k);
    }
    g.computeVertexNormals();
    return g;
  }, []);

  return (
    <group>
      <mesh geometry={superficie} receiveShadow>
        <meshStandardMaterial map={texturaSuperficie} roughness={0.88} metalness={0} />
      </mesh>
      {/* Nuvens em duas altitudes, girando devagar em sentidos opostos */}
      <mesh rotation={[-Math.PI / 2, 0, giroNuvens]} position={[0, 2600, 0]}>
        <circleGeometry args={[RAIO * 0.93, 128]} />
        <meshStandardMaterial map={nuvens0} transparent depthWrite={false} roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, -giroNuvens * 0.6 + 1]} position={[0, 4200, 0]}>
        <circleGeometry args={[RAIO * 0.93, 128]} />
        <meshStandardMaterial map={nuvens1} transparent depthWrite={false} roughness={1} opacity={0.75} />
      </mesh>
      {/* Lateral com camadas de rocha */}
      <mesh position={[0, -ESPESSURA / 2, 0]}>
        <cylinderGeometry args={[RAIO, RAIO * 0.985, ESPESSURA, 256, 1, true]} />
        <meshStandardMaterial map={rocha} roughness={1} side={THREE.DoubleSide} />
      </mesh>
      {/* Parte de baixo: rocha irregular, como uma ilha flutuante */}
      <mesh geometry={baseRochosa} position={[0, -ESPESSURA - ESPESSURA * 1.5, 0]} rotation={[Math.PI, 0, 0]}>
        <meshStandardMaterial color="#4a3222" roughness={1} flatShading />
      </mesh>
      {/* Muralha de gelo na borda */}
      <mesh position={[0, 700, 0]}>
        <cylinderGeometry args={[RAIO * 0.997, RAIO * 0.999, 1400, 256, 1, true]} />
        <meshStandardMaterial color="#e8f3ff" roughness={0.5} side={THREE.DoubleSide} />
      </mesh>
      {comAtmosfera && <Atmosfera intensidade={intensidadeAtmosfera} />}
    </group>
  );
};
