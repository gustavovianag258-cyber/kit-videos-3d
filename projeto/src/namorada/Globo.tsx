import { useMemo } from "react";
import * as THREE from "three";
import { random } from "remotion";
import dados from "./mundo-dados.json";
import type { Vec3 } from "./tempo";

// Terra com os continentes de verdade (Natural Earth, domínio público) e as bordas das
// placas tectônicas (PB2002, Peter Bird), desenhados numa textura na hora.

type Anel = number[][];
const D = dados as { terras: Anel[]; brasil: Anel[]; placas: Anel[] };

export const BRASIL = { lat: -12, lon: -51 };
export const CHILE = { lat: -39.8, lon: -73.2 };

// Ponto da superfície (mesma convenção de UV da SphereGeometry do three)
export const pontoNaEsfera = (lat: number, lon: number, r: number): Vec3 => {
  const phi = ((lon + 180) / 360) * Math.PI * 2;
  const theta = ((90 - lat) / 180) * Math.PI;
  return [-Math.cos(phi) * Math.sin(theta) * r, Math.cos(theta) * r, Math.sin(phi) * Math.sin(theta) * r];
};

// Rotações [x, y] que trazem (lat, lon) para a frente da câmera (+Z)
export const focar = (lat: number, lon: number): [number, number] => {
  const [x, , z] = pontoNaEsfera(0, lon, 1);
  return [(lat * Math.PI) / 180, -Math.atan2(x, z)];
};

const W = 2048;
const H = 1024;
const px = (lon: number) => ((lon + 180) / 360) * W;
const py = (lat: number) => ((90 - lat) / 180) * H;

const tracar = (ctx: CanvasRenderingContext2D, anel: Anel) => {
  ctx.beginPath();
  anel.forEach(([lon, lat], i) => (i ? ctx.lineTo(px(lon), py(lat)) : ctx.moveTo(px(lon), py(lat))));
  ctx.closePath();
};

const novaTextura = (desenho: (ctx: CanvasRenderingContext2D) => void) => {
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  desenho(ctx);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
};

const texturaBase = () =>
  novaTextura((ctx) => {
    const mar = ctx.createLinearGradient(0, 0, 0, H);
    mar.addColorStop(0, "#0d3a73");
    mar.addColorStop(0.5, "#1666b8");
    mar.addColorStop(1, "#0d3a73");
    ctx.fillStyle = mar;
    ctx.fillRect(0, 0, W, H);
    // Faixas de verde por latitude dão um ar "low-poly" de biomas
    for (const anel of [...D.terras, ...D.brasil]) {
      tracar(ctx, anel);
      const lat = anel[0][1];
      ctx.fillStyle = Math.abs(lat) > 62 ? "#e9f1f5" : Math.abs(lat) > 18 && Math.abs(lat) < 35 ? "#a98e55" : "#3f9a46";
      ctx.fill();
      ctx.strokeStyle = "rgba(10,40,20,0.55)";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    ctx.fillStyle = "#eef4f8";
    ctx.fillRect(0, H - 40, W, 40);
  });

const texturaBrasil = () =>
  novaTextura((ctx) => {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W, H);
    ctx.shadowColor = "#ff4fb8";
    ctx.shadowBlur = 30;
    for (const anel of D.brasil) {
      tracar(ctx, anel);
      ctx.fillStyle = "#ff5fc1";
      ctx.fill();
    }
  });

const texturaPlacas = () =>
  novaTextura((ctx) => {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W, H);
    ctx.lineJoin = "round";
    for (const [largura, cor, blur] of [
      [14, "rgba(255,90,0,0.55)", 22],
      [5, "#ffb347", 8],
      [2, "#fff1c4", 0],
    ] as const) {
      ctx.shadowColor = "#ff5a00";
      ctx.shadowBlur = blur;
      ctx.strokeStyle = cor;
      ctx.lineWidth = largura;
      for (const linha of D.placas) {
        ctx.beginPath();
        let ant: number[] | null = null;
        for (const [lon, lat] of linha) {
          // linhas que cruzam a emenda de ±180° não são ligadas
          if (ant && Math.abs(lon - ant[0]) > 180) ctx.moveTo(px(lon), py(lat));
          else if (ant) ctx.lineTo(px(lon), py(lat));
          else ctx.moveTo(px(lon), py(lat));
          ant = [lon, lat];
        }
        ctx.stroke();
      }
    }
  });

// Rachaduras extras (galhos saindo das placas), para a Terra "não aguentar"
const texturaRachaduras = () =>
  novaTextura((ctx) => {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W, H);
    ctx.shadowColor = "#ff3b00";
    ctx.shadowBlur = 14;
    for (let i = 0; i < 140; i++) {
      let x = random(`rx${i}`) * W;
      let y = H * 0.12 + random(`ry${i}`) * H * 0.76;
      let ang = random(`ra${i}`) * Math.PI * 2;
      ctx.strokeStyle = random(`rc${i}`) > 0.5 ? "#ff7a1a" : "#ffc04d";
      ctx.lineWidth = 2 + random(`rl${i}`) * 4;
      ctx.beginPath();
      ctx.moveTo(x, y);
      const n = 4 + Math.floor(random(`rn${i}`) * 6);
      for (let k = 0; k < n; k++) {
        ang += (random(`rk${i}-${k}`) - 0.5) * 1.4;
        x += Math.cos(ang) * 22;
        y += Math.sin(ang) * 22;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  });

// ---------- Ondas: anéis que se espalham pela superfície a partir de um ponto ----------
const vert = /* glsl */ `
  varying vec3 vPos;
  void main() {
    vPos = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const frag = /* glsl */ `
  uniform vec3 centro;
  uniform vec3 cor;
  uniform float tempo;
  uniform float forca;
  uniform float velocidade;
  uniform float pulso;
  varying vec3 vPos;
  void main() {
    float d = acos(clamp(dot(vPos, normalize(centro)), -1.0, 1.0));
    float onda = 0.5 + 0.5 * sin(d * 26.0 - tempo * velocidade);
    onda = pow(onda, 10.0);
    float lim = tempo * 0.55;
    float frente = 1.0 - smoothstep(lim - 0.15, lim + 0.05, d);
    float brilhoCentro = pulso * exp(-d * d * 60.0);
    float a = (onda * frente * exp(-d * 0.9) + brilhoCentro) * forca;
    gl_FragColor = vec4(cor * a, a);
  }
`;

const Ondas: React.FC<{ raio: number; centro: Vec3; cor: string; tempo: number; forca: number; velocidade?: number; pulso?: number }> = ({
  raio,
  centro,
  cor,
  tempo,
  forca,
  velocidade = 9,
  pulso = 0,
}) => {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vert,
        fragmentShader: frag,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          centro: { value: new THREE.Vector3() },
          cor: { value: new THREE.Color() },
          tempo: { value: 0 },
          forca: { value: 0 },
          velocidade: { value: 9 },
          pulso: { value: 0 },
        },
      }),
    [],
  );
  material.uniforms.centro.value.set(...centro);
  material.uniforms.cor.value.set(cor);
  material.uniforms.tempo.value = tempo;
  material.uniforms.forca.value = forca;
  material.uniforms.velocidade.value = velocidade;
  material.uniforms.pulso.value = pulso;
  return (
    <mesh scale={raio * 1.006} material={material}>
      <sphereGeometry args={[1, 96, 64]} />
    </mesh>
  );
};

// ---------- Lasers: arcos vermelhos saindo de sismógrafos espalhados até o Brasil ----------
const ESTACOES = Array.from({ length: 34 }, (_, i) => ({
  lat: -60 + random(`el${i}`) * 130,
  lon: -180 + random(`eo${i}`) * 360,
  atraso: random(`ea${i}`) * 0.5,
}));

const Lasers: React.FC<{ raio: number; progresso: number }> = ({ raio, progresso }) => {
  const tubos = useMemo(() => {
    const alvo = new THREE.Vector3(...pontoNaEsfera(BRASIL.lat, BRASIL.lon, raio));
    return ESTACOES.map((e) => {
      const ini = new THREE.Vector3(...pontoNaEsfera(e.lat, e.lon, raio));
      const meio = ini.clone().add(alvo).multiplyScalar(0.5);
      const alto = raio * (1.15 + ini.distanceTo(alvo) / raio * 0.35);
      meio.setLength(Math.max(alto, meio.length()));
      const curva = new THREE.QuadraticBezierCurve3(ini, meio, alvo);
      return { geo: new THREE.TubeGeometry(curva, 64, raio * 0.006, 6), atraso: e.atraso, ini };
    });
  }, [raio]);
  return (
    <group>
      {tubos.map((t, i) => {
        const p = Math.max(0, Math.min(1, (progresso - t.atraso) / 0.5));
        const total = t.geo.index!.count;
        t.geo.setDrawRange(0, Math.floor((total * p) / 6) * 6);
        return (
          <group key={i}>
            <mesh geometry={t.geo}>
              <meshBasicMaterial color="#ff2a2a" toneMapped={false} />
            </mesh>
            <mesh position={t.ini.toArray()}>
              <sphereGeometry args={[raio * 0.018, 10, 10]} />
              <meshBasicMaterial color="#ff6b6b" toneMapped={false} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

// ---------- Explosão: pedaços low-poly voando, núcleo e clarão ----------
const PEDACOS = Array.from({ length: 170 }, (_, i) => {
  const lat = Math.asin(random(`pz${i}`) * 2 - 1);
  const lon = random(`pl${i}`) * Math.PI * 2;
  const dir = new THREE.Vector3(Math.cos(lat) * Math.cos(lon), Math.sin(lat), Math.cos(lat) * Math.sin(lon));
  return {
    dir,
    vel: 0.8 + random(`pv${i}`) * 1.6,
    tam: 0.05 + random(`pt${i}`) ** 3 * 0.22,
    giro: new THREE.Vector3(random(`gx${i}`) - 0.5, random(`gy${i}`) - 0.5, random(`gz${i}`) - 0.5).multiplyScalar(8),
    cor: ["#ff7a1a", "#ffb347", "#c2410c", "#3f9a46", "#1666b8", "#7c2d12"][Math.floor(random(`pc${i}`) * 6)],
  };
});

export const Explosao: React.FC<{ raio: number; t: number }> = ({ raio, t }) => {
  const nucleo = Math.min(1, t / 0.25);
  return (
    <group>
      {PEDACOS.map((p, i) => {
        const d = raio * (0.85 + p.vel * t * 2.2 + t * t * 0.3);
        return (
          <mesh
            key={i}
            position={p.dir.clone().multiplyScalar(d).toArray()}
            rotation={[p.giro.x * t, p.giro.y * t, p.giro.z * t]}
            scale={raio * p.tam}
          >
            <dodecahedronGeometry args={[1, 0]} />
            <meshStandardMaterial
              color={p.cor}
              emissive={p.cor}
              emissiveIntensity={Math.max(0.3, 1.6 - t)}
              flatShading
              roughness={0.6}
            />
          </mesh>
        );
      })}
      {/* núcleo incandescente que cresce e some */}
      <mesh scale={raio * (0.5 + t * 1.1)}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial color="#fff2c2" transparent opacity={Math.max(0, 1 - t * 1.6) * nucleo} toneMapped={false} />
      </mesh>
      {/* anel de choque achatado, como nos filmes */}
      <mesh rotation={[1.25, 0, 0.2]} scale={raio * (1.1 + t * 5)}>
        <ringGeometry args={[0.82, 1, 96]} />
        <meshBasicMaterial color="#ffb36b" transparent opacity={Math.max(0, 0.9 - t * 0.65)} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh scale={raio * (1 + t * 1.6)}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color="#ff4d00"
          transparent
          opacity={Math.max(0, 0.5 - t * 0.5)}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
};

// ---------- A Terra ----------
export const Globo: React.FC<{
  raio: number;
  // [x, y] da rotação (use focar() para mirar um lugar)
  giro: [number, number];
  brasil?: number; // brilho rosa sobre o Brasil
  tempo?: number; // segundos (anima pulsos e ondas)
  placas?: number; // bordas das placas acesas (0 a 1)
  rachaduras?: number;
  laranja?: number; // planeta inteiro brilhando em laranja
  ondas?: number; // ondas sísmicas saindo do Brasil
  ondasCor?: string;
  lasers?: number; // progresso dos lasers (0 a 1,5)
  alvoChile?: number; // marcador no Chile
}> = ({ raio, giro, brasil = 0, tempo = 0, placas = 0, rachaduras = 0, laranja = 0, ondas = 0, ondasCor = "#ff8a00", lasers = 0, alvoChile = 0 }) => {
  const base = useMemo(texturaBase, []);
  const br = useMemo(texturaBrasil, []);
  const pl = useMemo(texturaPlacas, []);
  const ra = useMemo(texturaRachaduras, []);
  const centroBr = pontoNaEsfera(BRASIL.lat, BRASIL.lon, 1);
  const centroCl = pontoNaEsfera(CHILE.lat, CHILE.lon, 1);
  return (
    <group rotation={[giro[0], 0, 0]}>
      <group rotation={[0, giro[1], 0]}>
        <mesh>
          <sphereGeometry args={[raio, 72, 48]} />
          <meshStandardMaterial map={base} roughness={0.8} emissive="#ff5a00" emissiveIntensity={laranja * 0.55} />
        </mesh>
        {brasil > 0 && (
          <mesh scale={1.002}>
            <sphereGeometry args={[raio, 72, 48]} />
            <meshBasicMaterial map={br} transparent opacity={brasil} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
          </mesh>
        )}
        {placas > 0 && (
          <mesh scale={1.003}>
            <sphereGeometry args={[raio, 72, 48]} />
            <meshBasicMaterial map={pl} transparent opacity={placas} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
          </mesh>
        )}
        {rachaduras > 0 && (
          <mesh scale={1.004}>
            <sphereGeometry args={[raio, 72, 48]} />
            <meshBasicMaterial map={ra} transparent opacity={rachaduras} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
          </mesh>
        )}
        {(brasil > 0 || ondas > 0) && (
          <Ondas raio={raio} centro={centroBr} cor={ondas > 0 ? ondasCor : "#ff4fb8"} tempo={tempo} forca={Math.max(ondas, brasil * 0.8)} pulso={brasil} velocidade={ondas > 0 ? 9 : 6} />
        )}
        {alvoChile > 0 && <Ondas raio={raio} centro={centroCl} cor="#ffd23f" tempo={tempo * 1.5} forca={alvoChile * 0.7} pulso={0.6} velocidade={8} />}
        {lasers > 0 && <Lasers raio={raio * 1.004} progresso={lasers} />}
      </group>
      {/* Atmosfera */}
      <mesh scale={1.045}>
        <sphereGeometry args={[raio, 48, 48]} />
        <meshBasicMaterial
          color={laranja > 0.3 ? "#ff7a1a" : "#6fb6ff"}
          transparent
          opacity={0.25 + laranja * 0.2}
          side={THREE.BackSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
};
