import { RoundedBox } from "@react-three/drei";
import { useLayoutEffect, useMemo } from "react";
import { random } from "remotion";
import * as THREE from "three";
import { uma } from "./CasaPartida";

// Peças de ação e de vida: água com superfície que mexe, jatos, respingos, raio, onda, poeira,
// rachaduras crescendo, carro alagado, varal e entulho.
type V3 = [number, number, number];
const sv = (x: number) => {
  const k = Math.min(1, Math.max(0, x));
  return k * k * (3 - 2 * k);
};
const Bloco: React.FC<{ p: V3; s: V3; cor: string; rugoso?: number; metal?: number; rot?: V3; raio?: number; brilho?: string; forca?: number }> = ({ p, s, cor, rugoso = 0.8, metal = 0, rot, raio = 0.03, brilho, forca = 0 }) => (
  <RoundedBox args={s} position={p} rotation={rot} radius={Math.min(raio, Math.min(...s) * 0.45)} smoothness={3} castShadow receiveShadow>
    <meshStandardMaterial color={cor} roughness={rugoso} metalness={metal} emissive={brilho ?? "#000000"} emissiveIntensity={forca} />
  </RoundedBox>
);

// Corpo de água em corte: a face da frente tem o topo ondulando e a superfície mexe de verdade.
export const AguaViva: React.FC<{ x0: number; x1: number; h: number; t: number; z0?: number; z1?: number; agito?: number }> = ({ x0, x1, h, t, z0 = -1.7, z1 = 0.78, agito = 1 }) => {
  const seg = 36;
  const criaFrente = useMemo(() => new THREE.PlaneGeometry(x1 - x0, 1, seg, 1), [x0, x1]);
  const criaTopo = useMemo(() => new THREE.PlaneGeometry(x1 - x0, z1 - z0, seg, 8), [x0, x1, z0, z1]);
  useLayoutEffect(() => {
    const onda = (x: number, z: number) => agito * (0.03 * Math.sin(x * 2.8 + t * 3.4 + z) + 0.018 * Math.sin(x * 6.3 - t * 4.7 + z * 2) + 0.01 * Math.sin(x * 13 + t * 7));
    const f = criaFrente.attributes.position;
    for (let i = 0; i < f.count; i++) {
      const x = f.getX(i);
      const local = i <= seg ? h + onda(x, z1) : 0;
      f.setY(i, local);
    }
    f.needsUpdate = true;
    criaFrente.computeVertexNormals();
    const p = criaTopo.attributes.position;
    for (let i = 0; i < p.count; i++) p.setZ(i, onda(p.getX(i), p.getY(i)));
    p.needsUpdate = true;
    criaTopo.computeVertexNormals();
  }, [t, h, agito, seg, criaFrente, criaTopo, z1]);
  if (h < 0.02) return null;
  const cx = (x0 + x1) / 2;
  return (
    <>
      <mesh geometry={criaTopo} position={[cx, h, (z0 + z1) / 2]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={3}>
        <meshPhysicalMaterial color="#7D5F39" roughness={0.14} clearcoat={0.9} transparent opacity={0.82} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={criaFrente} position={[cx, 0, z1]} renderOrder={4}>
        <meshPhysicalMaterial color="#6B4F2E" roughness={0.2} transparent opacity={0.66} depthWrite={false} />
      </mesh>
    </>
  );
};

// Partículas de água: seguem um arco e somem.
export const Respingo: React.FC<{ t: number; de: number; ate: number; p: V3; n?: number; vx?: number; vy?: number; cor?: string; escala?: number; sem?: string }> = ({ t, de, ate, p, n = 34, vx = 1.4, vy = 1.3, cor = "#DCCDAE", escala = 1, sem = "r" }) => {
  if (t < de || t > ate + 0.8) return null;
  return (
    <>
      {new Array(n).fill(0).map((_, i) => {
        const a = random(`${sem}a${i}`);
        const nasce = de + random(`${sem}b${i}`) * (ate - de);
        const u = t - nasce;
        if (u < 0 || u > 0.72) return null;
        const velX = vx * (0.5 + a);
        const velY = vy * (0.3 + random(`${sem}c${i}`));
        return (
          <mesh key={i} position={[p[0] + velX * u, p[1] + velY * u - 4.9 * u * u, p[2] + (random(`${sem}d${i}`) - 0.5) * 0.9 * (0.3 + u)]} scale={escala * (0.012 + 0.03 * random(`${sem}e${i}`))}>
            <sphereGeometry args={[1, 8, 6]} />
            <meshStandardMaterial color={cor} roughness={0.25} />
          </mesh>
        );
      })}
    </>
  );
};

// Raio: caminho quebrado, muito brilhante, por poucos quadros.
export const Raio: React.FC<{ t: number; quando: number[]; sem?: string; x?: number; z?: number }> = ({ t, quando, x = -11, z = -70 }) => {
  const q = quando.find((v) => t >= v && t < v + 0.2);
  const segs = useMemo(() => {
    const l: { p: V3; rz: number; len: number; r: number }[] = [];
    const galho = (x0: number, y0: number, passos: number, r: number, sem: string) => {
      let a = x0;
      let b = y0;
      for (let i = 0; i < passos; i++) {
        const dx = (random(`${sem}x${i}`) - 0.5) * 7;
        const dy = -3.4 - random(`${sem}y${i}`) * 3.4;
        const len = Math.hypot(dx, dy);
        l.push({ p: [a + dx / 2, b + dy / 2, 0], rz: Math.atan2(dx, -dy), len, r });
        a += dx;
        b += dy;
        if (r > 0.1 && i === 3) galho(a, b, 3, r * 0.5, `${sem}g`);
      }
    };
    galho(0, 42, 8, 0.22, "ra");
    return l;
  }, []);
  if (q === undefined) return null;
  const k = 1 - (t - q) / 0.2;
  return (
    <group position={[x, 0, z]}>
      {segs.map((s, i) => (
        <mesh key={i} position={s.p} rotation={[0, 0, s.rz]}>
          <cylinderGeometry args={[s.r, s.r, s.len, 6]} />
          <meshBasicMaterial color="#F3F4FF" transparent opacity={k} toneMapped={false} />
        </mesh>
      ))}
      <pointLight position={[0, 22, 40]} intensity={260 * k} distance={140} decay={1.7} color="#DCE4FF" />
    </group>
  );
};

// A onda da enchente chegando pela rua, do fundo para a frente.
export const OndaChegando: React.FC<{ t: number; de: number; ate: number; nivel: number }> = ({ t, de, ate, nivel }) => {
  if (t < de || t > ate) return null;
  const u = (t - de) / (ate - de);
  const z = -40 + u * 47;
  return (
    <group position={[-20, nivel, z]}>
      <mesh rotation={[0, 0, Math.PI / 2]} scale={[0.5, 1, 0.9]} castShadow>
        <cylinderGeometry args={[0.72, 0.72, 39.9, 14]} />
        <meshStandardMaterial color="#6B4F2E" roughness={0.2} />
      </mesh>
      {new Array(60).fill(0).map((_, i) => (
        <mesh key={i} position={[-19.5 + i * 0.66 + 0.1, 0.36 + 0.1 * Math.sin(i * 2.1 + t * 18), 0.2 + 0.2 * Math.sin(i * 3.7)]} scale={0.07 + 0.09 * random(`on${i}`)}>
          <sphereGeometry args={[1, 8, 6]} />
          <meshStandardMaterial color="#C9B795" roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
};

// Poeira quente: manchas macias levadas pelo vento, só do lado seco.
const nuvemPo = () => {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const d = g.createRadialGradient(64, 64, 2, 64, 64, 62);
  d.addColorStop(0, "rgba(214,172,120,0.72)");
  d.addColorStop(0.55, "rgba(198,156,108,0.3)");
  d.addColorStop(1, "rgba(198,156,108,0)");
  g.fillStyle = d;
  g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};
export const PoeiraVento: React.FC<{ t: number; forca: number; x0?: number; z0?: number; camZ?: number }> = ({ t, forca, x0 = 0.12, z0 = 8, camZ = 17 }) => {
  if (forca <= 0.01) return null;
  const tex = uma("nuvemPo", nuvemPo);
  return (
    <>
      {new Array(26).fill(0).map((_, i) => {
        const v = random(`po${i}`);
        const x = x0 + (((v * 9 + t * (1.5 + v * 2.1)) % 9));
        const y = 0.18 + random(`pq${i}`) * 1.3 + 0.12 * Math.sin(t * 2 + i);
        const z = z0 - random(`pr${i}`) * 9;
        const s = 0.9 + random(`ps${i}`) * 1.7;
        return (
          <mesh key={i} position={[x, y, z]} rotation={[Math.atan2(y - 2, camZ - z) * -0.2, 0, t * 0.3 + i]} scale={s}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial map={tex} transparent opacity={forca * (0.26 + v * 0.3)} depthWrite={false} />
          </mesh>
        );
      })}
    </>
  );
};
// Rodamoinho de poeira, girando.
export const Rodamoinho: React.FC<{ t: number; p: V3; forca: number }> = ({ t, p, forca }) => {
  if (forca <= 0.01) return null;
  const tex = uma("nuvemPo", nuvemPo);
  return (
    <group position={p}>
      {new Array(30).fill(0).map((_, i) => {
        const h = (i / 30) * 3.2;
        const raio = 0.1 + h * 0.3;
        const a = t * 7 + i * 0.75;
        return (
          <mesh key={i} position={[Math.cos(a) * raio, h + 0.1, Math.sin(a) * raio]} scale={0.34 + h * 0.2}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial map={tex} transparent opacity={0.5 * forca} depthWrite={false} />
          </mesh>
        );
      })}
    </group>
  );
};

// Rachaduras novas abrindo no chão seco enquanto a gente olha.
const RAMOS: V3[][] = [
  [[0.22, 0.01, 11.5], [0.7, 0.01, 10.6], [0.8, 0.01, 9.7], [1.45, 0.01, 9], [1.55, 0.01, 8.1], [2.25, 0.01, 7.4], [2.9, 0.01, 7.15]],
  [[0.8, 0.01, 9.7], [0.5, 0.01, 8.8], [0.75, 0.01, 7.7], [0.45, 0.01, 6.9]],
  [[1.55, 0.01, 8.1], [2.35, 0.01, 8.8], [3.2, 0.01, 9.3]],
  [[2.25, 0.01, 7.4], [2, 0.01, 6.4], [2.55, 0.01, 5.6]],
];
export const RachasVivas: React.FC<{ k: number }> = ({ k }) => {
  if (k <= 0) return null;
  return (
    <>
      {RAMOS.flatMap((ramo, r) =>
        ramo.slice(0, -1).map((a, i) => {
          const b = ramo[i + 1];
          const fim = (i + 1) / (ramo.length - 1);
          const parcial = Math.min(1, Math.max(0, (k - (fim - 1 / (ramo.length - 1))) * (ramo.length - 1)));
          if (parcial <= 0) return null;
          const q: V3 = [a[0] + (b[0] - a[0]) * parcial, 0.012, a[2] + (b[2] - a[2]) * parcial];
          const len = Math.hypot(q[0] - a[0], q[2] - a[2]);
          return (
            <mesh key={`${r}${i}`} position={[(a[0] + q[0]) / 2, 0.012, (a[2] + q[2]) / 2]} rotation={[0, -Math.atan2(q[2] - a[2], q[0] - a[0]), 0]}>
              <boxGeometry args={[len + 0.02, 0.006, 0.024 - r * 0.004]} />
              <meshBasicMaterial color="#120A05" />
            </mesh>
          );
        }),
      )}
    </>
  );
};

// Carro meio afundado, com o pisca-alerta ligado.
export const CarroAlagado: React.FC<{ t: number; p: V3; giro?: number; cor?: string }> = ({ t, p, giro = 0.15, cor = "#7E2A26" }) => {
  const acende = Math.floor(t * 2.6) % 2 === 0;
  return (
    <group position={p} rotation={[0.02, giro, -0.02]}>
      <Bloco p={[0, 0.72, 0]} s={[1.72, 0.66, 4.1]} cor={cor} rugoso={0.26} metal={0.3} raio={0.18} />
      <Bloco p={[0, 1.28, -0.16]} s={[1.5, 0.56, 2.1]} cor="#172029" rugoso={0.12} metal={0.4} raio={0.17} />
      <Bloco p={[0, 1.56, -0.16]} s={[1.42, 0.06, 1.7]} cor={cor} rugoso={0.3} metal={0.3} />
      {[-0.86, 0.86].map((x) => (
        <group key={x}>
          <Bloco p={[x * 0.72, 0.84, 2.05]} s={[0.36, 0.14, 0.03]} cor={acende ? "#FFB84D" : "#7F5B1E"} brilho={acende ? "#FFB84D" : undefined} forca={acende ? 3 : 0} />
          <Bloco p={[x * 0.72, 0.86, -2.05]} s={[0.4, 0.15, 0.03]} cor={acende ? "#FF6A3D" : "#6B1F15"} brilho={acende ? "#FF5A2E" : undefined} forca={acende ? 3 : 0} />
        </group>
      ))}
      <Bloco p={[0, 0.74, 2.06]} s={[0.56, 0.16, 0.03]} cor="#E9E6DB" />
    </group>
  );
};

// Varal com roupa mexendo no vento quente.
export const Varal: React.FC<{ t: number; a: V3; b: V3 }> = ({ t, a, b }) => {
  const dx = b[0] - a[0];
  const dz = b[2] - a[2];
  const len = Math.hypot(dx, dz);
  return (
    <group position={a} rotation={[0, -Math.atan2(dz, dx), 0]}>
      <mesh position={[len / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.006, 0.006, len, 6]} />
        <meshStandardMaterial color="#D8D5C8" roughness={0.8} />
      </mesh>
      {[
        [0.24, 0.5, 0.62, "#C7523D"],
        [0.95, 0.44, 0.5, "#3F6D95"],
        [1.55, 0.58, 0.75, "#E7E1CE"],
        [2.25, 0.34, 0.4, "#D6A23A"],
      ].map(([x, l, h, c], i) => (
        <mesh key={i} position={[x as number, -(h as number) * 0.36, 0]} rotation={[0.2 + 0.16 * Math.sin(t * 3 + i), 0.12 * Math.sin(t * 2 + i * 2), 0.03 * Math.sin(t * 2.4 + i)]} scale={0.72}>
          <boxGeometry args={[l as number, h as number, 0.01]} />
          <meshStandardMaterial color={c as string} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
};

// Pedaços de reboco soltando da parede.
export const Entulho: React.FC<{ t: number; de: number; p: V3 }> = ({ t, de, p }) => {
  if (t < de || t > de + 1.4) return null;
  return (
    <>
      {new Array(16).fill(0).map((_, i) => {
        const u = t - de - random(`en${i}`) * 0.5;
        if (u < 0) return null;
        return (
          <mesh key={i} position={[p[0] - u * (0.2 + random(`eo${i}`) * 0.6), Math.max(0.03, p[1] + random(`ep${i}`) * 1.2 - 4.9 * u * u), p[2] + random(`eq${i}`) * 0.2]} rotation={[u * 7, u * 5, 0]} scale={0.012 + random(`er${i}`) * 0.026}>
            <dodecahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color="#D5CCB9" roughness={1} />
          </mesh>
        );
      })}
    </>
  );
};

// Tronco trazido pela correnteza, batendo na parede.
export const TroncoBatendo: React.FC<{ t: number; de: number; bate: number; z?: number; y?: number }> = ({ t, de, bate, z = 1.15, y = 0.8 }) => {
  if (t < de) return null;
  const fim = -3.45;
  const x = t < bate ? fim - (bate - t) * 8.6 : fim - Math.min(1.9, (t - bate) * 1.7) * (1 - (t - bate) * 0.3);
  return (
    <group position={[x - 1, y + 0.03 * Math.sin(t * 7), z]} rotation={[0, 0, Math.PI / 2 + 0.05 * Math.sin(t * 5)]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.15, 0.12, 2, 12]} />
        <meshStandardMaterial color="#3D2D1E" roughness={0.9} />
      </mesh>
    </group>
  );
};
export const quanto = sv;
