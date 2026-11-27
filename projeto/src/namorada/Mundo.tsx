import { useMemo } from "react";
import * as THREE from "three";
import { random } from "remotion";
import { Bloco, MAE } from "./Bloco";
import { CameraLenta, entre, Palco, suave, texturaCanvas, type PropsPlano } from "./comum";

// Mãe na cozinha e os monumentos que o terremoto entorta.

// ---------- Mãe chorando de emoção ----------
const texturaAzulejo = () =>
  texturaCanvas(
    256,
    256,
    (ctx) => {
      ctx.fillStyle = "#e9f5ee";
      ctx.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 4; i++)
        for (let j = 0; j < 4; j++) {
          ctx.fillStyle = (i + j) % 2 ? "#2f9e6b" : "#3fb37d";
          ctx.fillRect(i * 64 + 3, j * 64 + 3, 58, 58);
        }
    },
    [4, 3],
  );

export const PlanoMae: React.FC<PropsPlano> = ({ t, dur, frame }) => {
  const azulejo = useMemo(texturaAzulejo, []);
  return (
    <Palco fundo="#203a2c">
      <CameraLenta de={[0.5, 1.8, 2.7]} para={[0.35, 1.8, 2.3]} alvo={[0, 1.5, 0]} x={t / dur} fov={40} />
      <ambientLight intensity={0.6} color="#fff1dc" />
      <directionalLight position={[2, 3, 3]} intensity={2} color="#ffe2b8" />
      <pointLight position={[-1, 2.4, 1.2]} intensity={2} color="#ffd1ec" />
      {/* parede de azulejo verde e armários */}
      <mesh position={[0, 1.8, -1.2]}>
        <planeGeometry args={[6, 3.6]} />
        <meshStandardMaterial map={azulejo} roughness={0.35} />
      </mesh>
      <mesh position={[0, 2.95, -0.95]}>
        <boxGeometry args={[4, 0.9, 0.5]} />
        <meshStandardMaterial color="#f2e8cf" />
      </mesh>
      <mesh position={[0, 0.45, -0.85]}>
        <boxGeometry args={[4, 0.9, 0.7]} />
        <meshStandardMaterial color="#f2e8cf" />
      </mesh>
      <mesh position={[0, 0.92, -0.85]}>
        <boxGeometry args={[4.05, 0.06, 0.75]} />
        <meshStandardMaterial color="#5c5c66" roughness={0.4} />
      </mesh>
      <Bloco
        v={MAE}
        pos={[0, 0, 0]}
        frame={frame}
        e={{ olhosFechados: true, sobrancelha: 0.7, boca: "tremendo" }}
        p={{ bracoE: [-0.25, 0.05], bracoD: [-0.25, 0.05], cotoveloE: -1.7, cotoveloD: -1.7, cotoveloDentro: 0.75, cabeca: [-0.12, Math.sin(frame * 0.25) * 0.06] }}
      />
      {/* lágrimas descendo pelo rosto */}
      {[-1, 1].flatMap((l) =>
        [0, 1, 2].map((k) => {
          const f = (t * 1.6 + k / 3 + (l > 0 ? 0.15 : 0)) % 1;
          return (
            <mesh key={`${l}${k}`} position={[l * 0.12, 1.9 - f * 0.4, 0.275]} scale={[1, 1.4, 1]}>
              <sphereGeometry args={[0.014, 8, 8]} />
              <meshBasicMaterial color="#7fd1ff" transparent opacity={1 - f * 0.6} toneMapped={false} />
            </mesh>
          );
        }),
      )}
      {/* brilhos em volta */}
      {Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * Math.PI * 2 + t * 0.6;
        const pis = Math.max(0, Math.sin(t * 6 + i * 1.7));
        return (
          <mesh key={i} position={[Math.cos(a) * 0.62, 1.9 + Math.sin(a * 2) * 0.32, 0.25 + Math.sin(a) * 0.2]} rotation={[0, 0, t * 2 + i]} scale={0.02 + pis * 0.035}>
            <octahedronGeometry args={[1, 0]} />
            <meshBasicMaterial color={i % 2 ? "#ffe066" : "#ff9ad5"} toneMapped={false} />
          </mesh>
        );
      })}
    </Palco>
  );
};

// ---------- Céu de dia com nuvens ----------
const NUVENS = Array.from({ length: 9 }, (_, i) => ({
  x: -40 + random(`nx${i}`) * 80,
  y: 20 + random(`ny${i}`) * 16,
  z: -80 - random(`nz${i}`) * 30,
  s: 2 + random(`ns${i}`) * 3,
}));
const Nuvens: React.FC<{ t: number }> = ({ t }) => (
  <>
    {NUVENS.map((n, i) => (
      <group key={i} position={[n.x + t * 0.6, n.y, n.z]} scale={n.s}>
        {[[-1, 0, 0, 1], [0, 0.35, 0, 1.3], [1.1, 0, 0, 1], [0.3, -0.1, 0.4, 0.9]].map(([x, y, z, r], k) => (
          <mesh key={k} position={[x, y, z]}>
            <icosahedronGeometry args={[r, 0]} />
            <meshStandardMaterial color="#ffffff" flatShading roughness={1} />
          </mesh>
        ))}
      </group>
    ))}
  </>
);

const Dia: React.FC = () => (
  <>
    <ambientLight intensity={0.75} />
    <directionalLight position={[10, 18, 12]} intensity={2.4} color="#fff3dd" castShadow shadow-mapSize={[1024, 1024]} />
    <hemisphereLight args={["#bfe3ff", "#4c7a3a", 0.5]} />
  </>
);

// ---------- Cristo Redentor dá um passo pro lado ----------
const BRANCO_PEDRA = "#e9e6dd";
export const PlanoCristo: React.FC<PropsPlano> = ({ t, dur, s }) => {
  // o passo: sobe, vai pro lado e pousa (com tranco)
  const p = suave(entre(t, 0.35, 0.95));
  const salto = Math.sin(p * Math.PI) * 0.8;
  const pousou = t > 0.95 ? Math.max(0, 1 - (t - 0.95) * 4) : 0;
  return (
    <Palco fundo="#7cc2ff" sombras>
      <fog attach="fog" args={["#a9d8ff", 60, 140]} />
      <Dia />
      <CameraLenta de={[5.5, 7.5, 23]} para={[4.5, 8, 19.5]} alvo={[2.4, 5.4, 0]} x={t / dur} treme={pousou * 0.25 + 0.01} s={s} fov={44} />
      <Nuvens t={t} />
      {/* morro do Corcovado e o Pão de Açúcar ao fundo */}
      <mesh position={[0, -6, 0]} castShadow receiveShadow>
        <coneGeometry args={[14, 14, 9]} />
        <meshStandardMaterial color="#4f7d3a" flatShading roughness={1} />
      </mesh>
      <mesh position={[-26, -4, -35]}>
        <sphereGeometry args={[7, 8, 6]} />
        <meshStandardMaterial color="#5e7f45" flatShading />
      </mesh>
      <mesh position={[0, -10, -60]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[400, 200]} />
        <meshStandardMaterial color="#2f8fd1" roughness={0.3} />
      </mesh>
      {/* a estátua */}
      <group position={[p * 3.2, 1 + salto, 0]} rotation={[0, 0, (salto - pousou * 0.3) * 0.12]}>
        <mesh position={[0, 0.8, 0]} castShadow>
          <boxGeometry args={[2.2, 1.6, 2.2]} />
          <meshStandardMaterial color="#d8d3c6" flatShading />
        </mesh>
        <mesh position={[0, 4.5, 0]} castShadow>
          <cylinderGeometry args={[0.85, 1.25, 5.8, 6]} />
          <meshStandardMaterial color={BRANCO_PEDRA} flatShading roughness={0.9} />
        </mesh>
        <mesh position={[0, 6.6, 0]} castShadow>
          <boxGeometry args={[7.2, 0.8, 0.9]} />
          <meshStandardMaterial color={BRANCO_PEDRA} flatShading roughness={0.9} />
        </mesh>
        <mesh position={[0, 7.55, 0]} castShadow>
          <boxGeometry args={[1, 1.15, 1]} />
          <meshStandardMaterial color={BRANCO_PEDRA} flatShading roughness={0.9} />
        </mesh>
      </group>
    </Palco>
  );
};

// ---------- Torre Eiffel se curva como borracha ----------
// Larguras nas emendas e alturas dos segmentos (base larga, 1ª plataforma a ~7,5 m, 2ª a ~16 m)
const LARGURAS = [11, 8.6, 6.4, 4.6, 3.9, 3.3, 2.9, 2.6, 2.1, 1.7, 1.3, 1.0, 0.72, 0.5, 0.34];
const ALTURAS = [2.5, 2.5, 2.5, 2.2, 2.2, 2.2, 2.2, 2.1, 2.1, 2.1, 2.1, 2.1, 2.1, 2.1];
const SEGMENTOS = ALTURAS.length;
const PLATAFORMAS = new Set([2, 6]);
const BRONZE = "#7a4a22";

// Viga entre dois pontos
const Viga: React.FC<{ a: THREE.Vector3; b: THREE.Vector3; grossura: number }> = ({ a, b, grossura }) => {
  const meio = a.clone().add(b).multiplyScalar(0.5);
  const dir = b.clone().sub(a);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  return (
    <mesh position={meio.toArray()} quaternion={q} castShadow>
      <boxGeometry args={[grossura, dir.length(), grossura]} />
      <meshStandardMaterial color={BRONZE} roughness={0.65} metalness={0.35} />
    </mesh>
  );
};

const CANTOS: [number, number][] = [
  [-1, -1],
  [1, -1],
  [1, 1],
  [-1, 1],
];

const Segmento: React.FC<{ i: number; curva: number }> = ({ i, curva }) => {
  const h = ALTURAS[i];
  const l0 = LARGURAS[i] / 2;
  const l1 = LARGURAS[i + 1] / 2;
  const g = Math.max(0.08, 0.32 - i * 0.018);
  const baixo = CANTOS.map(([a, b]) => new THREE.Vector3(a * l0, 0, b * l0));
  const cima = CANTOS.map(([a, b]) => new THREE.Vector3(a * l1, h, b * l1));
  const plataforma = PLATAFORMAS.has(i);
  return (
    <group>
      {CANTOS.map((_, k) => {
        const k2 = (k + 1) % 4;
        return (
          <group key={k}>
            {/* perna do canto */}
            <Viga a={baixo[k]} b={cima[k]} grossura={g * 1.6} />
            {/* treliça em X em cada face */}
            <Viga a={baixo[k]} b={cima[k2]} grossura={g * 0.55} />
            <Viga a={baixo[k2]} b={cima[k]} grossura={g * 0.55} />
          </group>
        );
      })}
      {/* arcos entre as pernas, na base */}
      {i === 0 &&
        [0, Math.PI / 2].map((r) => (
          <mesh key={r} position={[0, 0.3, 0]} rotation={[0, r, 0]}>
            <torusGeometry args={[l0 * 0.78, 0.22, 6, 18, Math.PI]} />
            <meshStandardMaterial color={BRONZE} roughness={0.65} metalness={0.35} />
          </mesh>
        ))}
      <mesh position={[0, h, 0]}>
        <boxGeometry args={[l1 * 2 + (plataforma ? 1.4 : 0.1), plataforma ? 0.55 : 0.12, l1 * 2 + (plataforma ? 1.4 : 0.1)]} />
        <meshStandardMaterial color={plataforma ? "#5c3518" : BRONZE} roughness={0.7} metalness={0.3} />
      </mesh>
      {/* a curva aumenta para cima: a ponta balança mais que a base */}
      <group position={[0, h, 0]} rotation={[0, 0, curva * (0.3 + (i / SEGMENTOS) * 1.7)]}>
        {i === SEGMENTOS - 1 ? (
          <mesh position={[0, 1.4, 0]}>
            <coneGeometry args={[0.22, 2.8, 4]} />
            <meshStandardMaterial color={BRONZE} />
          </mesh>
        ) : (
          <Segmento i={i + 1} curva={curva} />
        )}
      </group>
    </group>
  );
};

const PREDIOS_PARIS = Array.from({ length: 80 }, (_, i) => ({
  x: -60 + random(`px${i}`) * 120,
  z: -60 + random(`pz${i}`) * 90,
  w: 3 + random(`pw${i}`) * 4,
  h: 3 + random(`ph${i}`) * 4,
}));

export const PlanoEiffel: React.FC<PropsPlano> = ({ t, dur, s }) => {
  // entorta pro lado e balança como borracha
  const curva = 0.055 * suave(entre(t, 0.1, 0.7)) + Math.sin(t * 7) * 0.012 * entre(t, 0.2, 0.6);
  return (
    <Palco fundo="#9fd0ff" sombras>
      <fog attach="fog" args={["#cfe6ff", 60, 160]} />
      <Dia />
      <CameraLenta de={[16, 5, 46]} para={[13, 7, 40]} alvo={[0, 15, 0]} x={t / dur} treme={0.05} s={s} fov={46} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color="#9bbf6b" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 20]}>
        <planeGeometry args={[400, 7]} />
        <meshStandardMaterial color="#3c87c4" roughness={0.3} />
      </mesh>
      {PREDIOS_PARIS.filter((b) => Math.hypot(b.x, b.z) > 14 && Math.abs(b.z - 20) > 6 && !(b.z > 20 && Math.abs(b.x - 10) < 16)).map((b, i) => (
        <group key={i} position={[b.x, 0, b.z]}>
          <mesh position={[0, b.h / 2, 0]} castShadow>
            <boxGeometry args={[b.w, b.h, b.w * 0.8]} />
            <meshStandardMaterial color="#efe3c8" flatShading />
          </mesh>
          <mesh position={[0, b.h + 0.5, 0]}>
            <boxGeometry args={[b.w * 0.95, 1, b.w * 0.75]} />
            <meshStandardMaterial color="#5f6b7a" flatShading />
          </mesh>
        </group>
      ))}
      <Segmento i={0} curva={curva} />
    </Palco>
  );
};

// ---------- Muralha da China vira zigue-zague ----------
const morro = (x: number, z: number) => Math.sin(x * 0.12) * 2.2 + Math.cos(z * 0.09 + 1) * 2.6 + Math.sin((x + z) * 0.05) * 3;

const Colinas: React.FC = () => {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(140, 140, 70, 70);
    g.rotateX(-Math.PI / 2);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) p.setY(i, morro(p.getX(i), p.getZ(i)));
    g.computeVertexNormals();
    return g;
  }, []);
  return (
    <mesh geometry={geo} receiveShadow>
      <meshStandardMaterial color="#4f9a45" flatShading roughness={1} />
    </mesh>
  );
};

const PASSO = 1.3;
const N_MURO = 90;
export const PlanoMuralha: React.FC<PropsPlano> = ({ t, dur, s }) => {
  const amp = 4.5 * suave(entre(t, 0.15, 1.1));
  const tri = (z: number) => {
    const f = (z / 9) % 2;
    const g = f < 0 ? f + 2 : f;
    return g < 1 ? g * 2 - 1 : 3 - g * 2;
  };
  const caminho = (z: number) => Math.sin(z * 0.06) * 6 + tri(z) * amp;
  return (
    <Palco fundo="#a8d8ff" sombras>
      <fog attach="fog" args={["#c4e4ff", 50, 120]} />
      <Dia />
      <CameraLenta de={[30, 36, 30]} para={[24, 31, 22]} alvo={[0, 0, -4]} x={t / dur} treme={0.06} s={s} fov={45} />
      <Colinas />
      {Array.from({ length: N_MURO }, (_, i) => {
        const z = -58 + i * PASSO;
        const x = caminho(z);
        const x2 = caminho(z + PASSO);
        const y = morro(x, z);
        const torre = i % 9 === 0;
        return (
          <group key={i} position={[x, y, z]} rotation={[0, Math.atan2(x2 - x, PASSO), 0]}>
            <mesh position={[0, torre ? 1.6 : 0.9, 0]} castShadow>
              <boxGeometry args={[torre ? 2.6 : 1.6, torre ? 3.2 : 1.8, torre ? 2.6 : PASSO * 1.05]} />
              <meshStandardMaterial color={torre ? "#a89f8a" : "#b9ae95"} flatShading roughness={0.95} />
            </mesh>
            {!torre && (
              <mesh position={[0.65, 2, 0]}>
                <boxGeometry args={[0.25, 0.4, 0.5]} />
                <meshStandardMaterial color="#a89f8a" />
              </mesh>
            )}
          </group>
        );
      })}
    </Palco>
  );
};
