import { RoundedBox } from "@react-three/drei";
import { useMemo } from "react";
import { random } from "remotion";
import * as THREE from "three";
import { Hora, ehNoite } from "./Luz";
import { Arvore, materialPredio, Poste, texturaCanvas } from "./Pecas";

// PARQUE (Ibirapuera/Aterro/praça): gramado em volta da origem, caminho de terra ao longo do eixo z
// (x de -1,5 a 1,5), lago em (14, 0, -10), bancos na beira do caminho (assento a 0,45 m: serve para
// as animações "sitting-*"), toalha de piquenique em (-5, 0, 2) e a cidade no horizonte.

export const BANCOS: [number, number, number, number][] = [
  // x, z, giroY (de frente para o caminho)
  [-2.4, -6, Math.PI / 2, 0],
  [2.4, 3, -Math.PI / 2, 0],
  [-2.4, 12, Math.PI / 2, 0],
];

const texturaGrama = () =>
  texturaCanvas(
    512,
    512,
    (ctx) => {
      ctx.fillStyle = "#5f9a3c";
      ctx.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 26000; i++) {
        const v = random(`g${i}`);
        ctx.fillStyle = v < 0.33 ? "rgba(70,130,45,0.5)" : v < 0.66 ? "rgba(120,170,70,0.45)" : "rgba(50,100,35,0.4)";
        const x = random(`x${i}`) * 512;
        const y = random(`y${i}`) * 512;
        ctx.fillRect(x, y, 2, 4 + random(`h${i}`) * 4);
      }
    },
    true,
  );

// tufos de grama de verdade perto da câmera (lâminas finas instanciadas)
const Tufos: React.FC<{ raio: number; quantidade: number; s: number }> = ({ raio, quantidade, s }) => {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(0.014, 0.13, 1, 3).translate(0, 0.065, 0);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) p.setX(i, p.getX(i) * (1 - p.getY(i) / 0.14));
    return g;
  }, []);
  const mesh = useMemo(() => {
    const m = new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({ color: "#6fae45", side: THREE.DoubleSide, roughness: 0.9 }), quantidade);
    const mat = new THREE.Matrix4();
    const cor = new THREE.Color();
    for (let i = 0; i < quantidade; i++) {
      const a = random(`ta${i}`) * Math.PI * 2;
      const r = Math.sqrt(random(`tr${i}`)) * raio;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      if (Math.abs(x) < 1.7) continue; // não nasce no caminho
      mat.compose(new THREE.Vector3(x, 0, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(random(`tx${i}`) * 0.4 - 0.2, random(`ty${i}`) * 6, 0)), new THREE.Vector3(1, 0.7 + random(`ts${i}`) * 0.8, 1));
      m.setMatrixAt(i, mat);
      m.setColorAt(i, cor.set("#6fae45").multiplyScalar(0.75 + random(`tc${i}`) * 0.4));
    }
    m.receiveShadow = true;
    return m;
  }, [geo, raio, quantidade]);
  mesh.rotation.z = Math.sin(s * 1.3) * 0.004;
  return <primitive object={mesh} />;
};

const Banco: React.FC<{ pos: [number, number, number]; giroY: number }> = ({ pos, giroY }) => (
  <group position={pos} rotation={[0, giroY, 0]}>
    {[0, 1, 2].map((i) => (
      <RoundedBox key={i} args={[1.8, 0.04, 0.12]} radius={0.015} position={[0, 0.45, -0.17 + i * 0.15]} castShadow receiveShadow>
        <meshStandardMaterial color="#9a6a3e" roughness={0.8} />
      </RoundedBox>
    ))}
    {[0, 1].map((i) => (
      <RoundedBox key={`e${i}`} args={[1.8, 0.12, 0.04]} radius={0.015} position={[0, 0.65 + i * 0.17, -0.27]} rotation={[-0.15, 0, 0]} castShadow>
        <meshStandardMaterial color="#9a6a3e" roughness={0.8} />
      </RoundedBox>
    ))}
    {[-0.75, 0.75].map((x) => (
      <mesh key={x} position={[x, 0.22, -0.05]} castShadow>
        <boxGeometry args={[0.06, 0.45, 0.5]} />
        <meshStandardMaterial color="#2b2b2b" metalness={0.5} roughness={0.5} />
      </mesh>
    ))}
  </group>
);

export const Parque: React.FC<{ hora: Hora; s: number; semente?: string; tufos?: boolean }> = ({ hora, s, semente = "parque", tufos = true }) => {
  const noite = ehNoite(hora);
  const grama = useMemo(texturaGrama, []);
  grama.repeat.set(40, 40);
  const toalha = useMemo(
    () =>
      texturaCanvas(
        256,
        256,
        (ctx) => {
          for (let i = 0; i < 8; i++)
            for (let j = 0; j < 8; j++) {
              ctx.fillStyle = (i + j) % 2 ? "#e63946" : "#fff4f0";
              ctx.fillRect(i * 32, j * 32, 32, 32);
            }
        },
        true,
      ),
    [],
  );
  const matPredio = useMemo(() => {
    const m = materialPredio(noite);
    m.color.set("#e9e4dc");
    return m;
  }, [noite]);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial map={grama} roughness={0.95} />
      </mesh>
      {tufos && <Tufos raio={9} quantidade={30000} s={s} />}
      {/* caminho de terra batida */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[3, 120]} />
        <meshStandardMaterial color="#8f8068" roughness={1} />
      </mesh>
      {/* lago */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[16, 0.02, -12]} scale={[1.6, 1, 1]}>
        <circleGeometry args={[9, 48]} />
        <meshPhysicalMaterial color="#3d7d8f" roughness={0.06} clearcoat={1} envMapIntensity={1.3} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[16, 0.015, -12]} scale={[1.6, 1, 1]}>
        <ringGeometry args={[9, 9.6, 48]} />
        <meshStandardMaterial color="#8a7f6a" roughness={1} />
      </mesh>
      {BANCOS.map(([x, z, g], i) => (
        <Banco key={i} pos={[x, 0, z]} giroY={g} />
      ))}
      {/* toalha de piquenique com cesta */}
      <mesh rotation={[-Math.PI / 2, 0, 0.3]} position={[-5, 0.02, 2]} receiveShadow>
        <planeGeometry args={[2.2, 1.8]} />
        <meshStandardMaterial map={toalha} roughness={0.9} />
      </mesh>
      <RoundedBox args={[0.5, 0.3, 0.35]} radius={0.06} position={[-5.4, 0.17, 1.7]} castShadow>
        <meshStandardMaterial color="#b07a3e" roughness={0.9} />
      </RoundedBox>
      {Array.from({ length: 22 }, (_, i) => {
        const lado = i % 2 ? 1 : -1;
        const x = lado * (6 + random(`${semente}ax${i}`) * 30);
        const z = -50 + random(`${semente}az${i}`) * 90;
        if (Math.hypot(x - 16, (z + 12) / 1.6) < 11) return null;
        return <Arvore key={i} pos={[x, 0, z]} tam={1 + random(`${semente}at${i}`) * 0.7} semente={`${semente}a${i}`} />;
      })}
      {Array.from({ length: 6 }, (_, i) => (
        <Poste key={i} pos={[i % 2 ? 1.9 : -1.9, 0, -30 + i * 12]} giroY={i % 2 ? -Math.PI / 2 : Math.PI / 2} aceso={noite} />
      ))}
      {/* skyline no horizonte */}
      {Array.from({ length: 30 }, (_, i) => {
        const h = 25 + random(`${semente}sh${i}`) ** 1.4 * 70;
        return (
          <mesh key={i} position={[-150 + i * 11, h / 2, -150 - random(`${semente}sz${i}`) * 30]} material={matPredio}>
            <boxGeometry args={[9, h, 9]} />
          </mesh>
        );
      })}
    </group>
  );
};
