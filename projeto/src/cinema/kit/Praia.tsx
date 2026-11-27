import { useTexture } from "@react-three/drei";
import { useLayoutEffect, useMemo } from "react";
import { random, staticFile } from "remotion";
import * as THREE from "three";

// Peças de praia (vieram do teste de Boa Viagem): areia PBR, mar com ondas e espuma, coqueiro,
// guarda-sol, placa de tubarão, gaivotas e o paredão de prédios da orla.
// Praia ao longo do eixo x: mar em z < -7, areia de -8 a 28.

type V3 = [number, number, number];

export const Areia: React.FC = () => {
  const [cor, normal, rugo] = useTexture([
    staticFile("texturas/areia/Diffuse.jpg"),
    staticFile("texturas/areia/nor_gl.jpg"),
    staticFile("texturas/areia/Rough.jpg"),
  ]);
  useMemo(() => {
    for (const t of [cor, normal, rugo]) {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(90, 30);
      t.anisotropy = 8;
    }
    cor.colorSpace = THREE.SRGBColorSpace;
  }, [cor, normal, rugo]);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 10]} receiveShadow>
        <planeGeometry args={[400, 36]} />
        <meshStandardMaterial map={cor} normalMap={normal} roughnessMap={rugo} color="#f3dfb8" normalScale={new THREE.Vector2(0.8, 0.8)} />
      </mesh>
      {/* areia molhada perto da água (mais escura e brilhante) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, -6.2]} receiveShadow>
        <planeGeometry args={[400, 3]} />
        <meshStandardMaterial map={cor} color="#a88b62" roughness={0.25} />
      </mesh>
    </group>
  );
};

// Mar com ondas (vértices animados pelo tempo do vídeo) e a linha de espuma na beira
export const Mar: React.FC<{ s: number }> = ({ s }) => {
  const geo = useMemo(() => new THREE.PlaneGeometry(400, 160, 160, 64), []);
  useLayoutEffect(() => {
    const p = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      const y = p.getY(i);
      p.setZ(i, Math.sin(x * 0.35 + s * 1.4) * 0.06 + Math.sin(y * 0.9 - s * 1.9) * 0.1 + Math.sin((x + y) * 1.7 + s * 3) * 0.025);
    }
    p.needsUpdate = true;
    geo.computeVertexNormals();
  });
  const espuma = 0.5 + 0.5 * Math.sin(s * 1.3);
  return (
    <group>
      <mesh geometry={geo} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, -87]} receiveShadow>
        <meshPhysicalMaterial color="#0e7fb0" roughness={0.07} metalness={0} clearcoat={1} clearcoatRoughness={0.05} envMapIntensity={1.2} />
      </mesh>
      {/* faixa verde-clara do raso */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, -9.5]}>
        <planeGeometry args={[400, 5]} />
        <meshPhysicalMaterial color="#3fc1c9" roughness={0.05} transparent opacity={0.75} clearcoat={1} />
      </mesh>
      {/* espuma indo e voltando */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -7.2 + espuma * 0.8]}>
        <planeGeometry args={[400, 0.5 + espuma * 0.4]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.65} roughness={0.9} />
      </mesh>
    </group>
  );
};

// Folha de coqueiro: textura de canvas (talo + folíolos) com recorte por alpha
const texturaFolha = () => {
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 512;
  const ctx = c.getContext("2d")!;
  ctx.strokeStyle = "#5b7a2a";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(64, 512);
  ctx.lineTo(64, 0);
  ctx.stroke();
  for (let y = 20; y < 500; y += 9) {
    const L = 58 * Math.sin((y / 512) * Math.PI) + 6;
    for (const l of [-1, 1]) {
      const g = ctx.createLinearGradient(64, y, 64 + l * L, y + 22);
      g.addColorStop(0, "#2f6b1f");
      g.addColorStop(1, "#5f9a34");
      ctx.strokeStyle = g;
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(64, y);
      ctx.quadraticCurveTo(64 + l * L * 0.5, y + 4, 64 + l * L, y + 24);
      ctx.stroke();
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

export const Coqueiro: React.FC<{ pos: V3; s: number; h?: number; inclina?: number; giro?: number }> = ({ pos, s, h = 8, inclina = 0.25, giro = 0 }) => {
  const folha = useMemo(texturaFolha, []);
  const { tronco, topo } = useMemo(() => {
    const curva = new THREE.QuadraticBezierCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(inclina * h * 0.2, h * 0.5, 0), new THREE.Vector3(inclina * h, h, 0));
    return { tronco: new THREE.TubeGeometry(curva, 24, 0.17, 8), topo: curva.getPoint(1) };
  }, [h, inclina]);
  return (
    <group position={pos} rotation={[0, giro, 0]}>
      <mesh geometry={tronco} castShadow>
        <meshStandardMaterial color="#8a6f4e" roughness={0.95} />
      </mesh>
      <group position={topo.toArray()}>
        {Array.from({ length: 15 }, (_, i) => {
          const a = (i / 11) * Math.PI * 2;
          const balanco = Math.sin(s * 1.2 + i) * 0.05;
          return (
            <group key={i} rotation={[0, a, 0]}>
              <group rotation={[0.35 + (i % 3) * 0.25 + balanco, 0, 0]}>
                {/* folha arqueada: dois pedaços, o de fora caindo mais */}
                <mesh position={[0, 0, 1.1]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
                  <planeGeometry args={[1.1, 2.6]} />
                  <meshStandardMaterial map={folha} alphaTest={0.4} side={THREE.DoubleSide} roughness={0.7} />
                </mesh>
              </group>
            </group>
          );
        })}
        {/* cocos */}
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[Math.cos(i * 2.1) * 0.22, -0.25, Math.sin(i * 2.1) * 0.22]} castShadow>
            <sphereGeometry args={[0.16, 12, 12]} />
            <meshStandardMaterial color="#5d7a22" roughness={0.6} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

const texturaPredio = (tom: string) => {
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 256;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = tom;
  ctx.fillRect(0, 0, 128, 256);
  for (let y = 6; y < 256; y += 16)
    for (let x = 6; x < 128; x += 24) {
      ctx.fillStyle = (x * 3 + y) % 7 === 0 ? "#cfe6f5" : "#4a6b86";
      ctx.fillRect(x, y, 16, 9);
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.fillRect(x - 2, y + 11, 20, 2); // varandas
    }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
};

// O "paredão" de prédios da orla de Boa Viagem
export const Orla: React.FC = () => {
  const texs = useMemo(() => ["#f4efe6", "#f2d9c0", "#e3ebf2", "#fff7e4"].map(texturaPredio), []);
  return (
    <group>
      {/* avenida e calçadão */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 31]} receiveShadow>
        <planeGeometry args={[400, 6]} />
        <meshStandardMaterial color="#d8d2c4" roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 37]} receiveShadow>
        <planeGeometry args={[400, 8]} />
        <meshStandardMaterial color="#3d4047" roughness={0.8} />
      </mesh>
      {Array.from({ length: 40 }, (_, i) => {
        const h = 18 + random(`oh${i}`) ** 1.6 * 48;
        const l = 12 + random(`ol${i}`) * 6;
        const x = -260 + i * 14 + random(`ox${i}`) * 4;
        const tex = texs[i % 4].clone();
        tex.repeat.set(l / 12, h / 22);
        tex.needsUpdate = true;
        return (
          <mesh key={i} position={[x, h / 2, 72 + random(`oz${i}`) * 6]} castShadow receiveShadow>
            <boxGeometry args={[l, h, 12]} />
            <meshStandardMaterial map={tex} roughness={0.6} />
          </mesh>
        );
      })}
    </group>
  );
};

// textura de gomos listrados (alterna cor e branco) pra não ficar todo guarda-sol liso
const texturaGomos = (cor: string) => {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 64;
  const ctx = c.getContext("2d")!;
  for (let i = 0; i < 12; i++) {
    ctx.fillStyle = i % 2 ? cor : "#f6f2e8";
    ctx.fillRect((i * 256) / 12, 0, 256 / 12 + 1, 64);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = THREE.RepeatWrapping;
  return t;
};

export const GuardaSol: React.FC<{ pos: V3; cor: string; s: number; listrado?: boolean }> = ({ pos, cor, s, listrado = true }) => {
  const tex = useMemo(() => (listrado ? texturaGomos(cor) : null), [cor, listrado]);
  return (
    <group position={pos} rotation={[0.08, 0, Math.sin(s * 0.8 + pos[0]) * 0.02]}>
      <mesh position={[0, 1.2, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 2.4, 6]} />
        <meshStandardMaterial color="#f5f5f5" />
      </mesh>
      <mesh position={[0, 2.35, 0]} castShadow>
        <coneGeometry args={[1.35, 0.45, 12, 1, true]} />
        {tex ? <meshStandardMaterial map={tex} side={THREE.DoubleSide} roughness={0.8} /> : <meshStandardMaterial color={cor} side={THREE.DoubleSide} roughness={0.8} />}
      </mesh>
    </group>
  );
};

export const PlacaTubarao: React.FC<{ pos: V3; giro: number }> = ({ pos, giro }) => {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 320;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#ffd400";
    ctx.fillRect(0, 0, 256, 320);
    ctx.strokeStyle = "#111";
    ctx.lineWidth = 12;
    ctx.strokeRect(8, 8, 240, 304);
    ctx.fillStyle = "#c81e1e";
    ctx.font = "bold 46px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("PERIGO", 128, 66);
    ctx.fillStyle = "#111";
    ctx.beginPath();
    ctx.moveTo(40, 190);
    ctx.quadraticCurveTo(128, 120, 216, 180);
    ctx.lineTo(236, 150);
    ctx.lineTo(228, 200);
    ctx.quadraticCurveTo(128, 230, 40, 190);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(118, 140);
    ctx.lineTo(150, 95);
    ctx.lineTo(160, 145);
    ctx.fill();
    ctx.font = "bold 19px sans-serif";
    ctx.fillText("ÁREA SUJEITA A", 128, 262);
    ctx.fillText("INCIDENTES COM TUBARÃO", 128, 292);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  return (
    <group position={pos} rotation={[0, giro, 0]}>
      <mesh position={[0, 1.3, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 2.6, 8]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 2.5, 0.05]} castShadow>
        <boxGeometry args={[1.1, 1.38, 0.03]} />
        <meshStandardMaterial map={tex} roughness={0.5} />
      </mesh>
    </group>
  );
};

// Gaivotas planando (V branco que bate as asas devagar)
export const Gaivotas: React.FC<{ s: number }> = ({ s }) => (
  <>
    {Array.from({ length: 6 }, (_, i) => {
      const x = -40 + ((s * (3 + i * 0.4) + i * 13) % 60);
      const bate = Math.sin(s * 5 + i) * 0.35;
      return (
        <group key={i} position={[x, 9 + (i % 3) * 2.5 + Math.sin(s + i) * 0.4, -12 - i * 3]}>
          {[-1, 1].map((l) => (
            <mesh key={l} position={[0, 0, l * 0.28]} rotation={[l * (0.25 + bate), 0, 0]}>
              <boxGeometry args={[0.18, 0.02, 0.55]} />
              <meshStandardMaterial color="#f8fafc" />
            </mesh>
          ))}
        </group>
      );
    })}
  </>
);

