import { useMemo } from "react";
import * as THREE from "three";
import { random } from "remotion";
import { CameraLenta, entre, Palco, type PropsPlano } from "./comum";

// Bairro de casinhas low-poly à noite. A casa do Gabriel fica no centro (0, 0).

const LOTE = 7;
const CORES_CASA = ["#e9d8a6", "#94d2bd", "#ee9b00", "#ca6702", "#a3c4f3", "#f4acb7", "#b5e48c", "#e5e5e5"];
const CORES_TELHADO = ["#9b2226", "#6d4c41", "#344e41", "#3a3a5a", "#7f5539"];

const CASAS = (() => {
  const lista: { x: number; z: number; cor: string; telhado: string; alt: number; giro: number; luz: boolean; dist: number }[] = [];
  for (let i = -4; i <= 4; i++)
    for (let j = -4; j <= 4; j++) {
      if (i === 0 && j === 0) continue;
      const x = i * LOTE + (random(`cx${i}${j}`) - 0.5) * 0.8;
      const z = j * LOTE + (random(`cz${i}${j}`) - 0.5) * 0.8;
      lista.push({
        x,
        z,
        cor: CORES_CASA[Math.floor(random(`cc${i}${j}`) * CORES_CASA.length)],
        telhado: CORES_TELHADO[Math.floor(random(`ct${i}${j}`) * CORES_TELHADO.length)],
        alt: 2.4 + random(`ca${i}${j}`) * 1.4,
        giro: Math.floor(random(`cg${i}${j}`) * 4) * (Math.PI / 2),
        luz: random(`cl${i}${j}`) > 0.55,
        dist: Math.hypot(x, z),
      });
    }
  return lista;
})();

const Casa: React.FC<{ cor: string; telhado: string; alt: number; janela: string; brilho: number; balanco?: number }> = ({
  cor,
  telhado,
  alt,
  janela,
  brilho,
  balanco = 0,
}) => (
  <group scale={[1 + balanco * 0.06, 1 - balanco * 0.1, 1 + balanco * 0.06]}>
    <mesh position={[0, alt / 2, 0]} castShadow receiveShadow>
      <boxGeometry args={[3.6, alt, 3.4]} />
      <meshStandardMaterial color={cor} roughness={0.85} flatShading />
    </mesh>
    <mesh position={[0, alt + 0.75, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
      <coneGeometry args={[2.85, 1.5, 4]} />
      <meshStandardMaterial color={telhado} roughness={0.8} flatShading />
    </mesh>
    {/* janelas da frente e do lado */}
    {[
      [-0.85, alt * 0.55, 1.71, 0],
      [0.85, alt * 0.55, 1.71, 0],
      [1.81, alt * 0.55, 0, Math.PI / 2],
    ].map(([x, y, z, r], i) => (
      <mesh key={i} position={[x, y, z]} rotation={[0, r, 0]}>
        <planeGeometry args={[0.8, 0.75]} />
        <meshBasicMaterial color={new THREE.Color(janela).multiplyScalar(brilho)} toneMapped={false} />
      </mesh>
    ))}
    {/* porta */}
    <mesh position={[0, 0.6, 1.71]}>
      <planeGeometry args={[0.7, 1.2]} />
      <meshStandardMaterial color="#4a2e1a" />
    </mesh>
  </group>
);

const coracaoGeo = () => {
  const s = new THREE.Shape();
  s.moveTo(0, -0.35);
  s.bezierCurveTo(-0.6, 0.05, -0.35, 0.55, 0, 0.25);
  s.bezierCurveTo(0.35, 0.55, 0.6, 0.05, 0, -0.35);
  return new THREE.ExtrudeGeometry(s, { depth: 0.18, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, bevelSegments: 2 });
};

const CORACOES = Array.from({ length: 36 }, (_, i) => ({
  ang: (i / 36) * Math.PI * 2 + random(`ha${i}`) * 0.2,
  alt: 1 + random(`hy${i}`) * 4,
  tam: 0.8 + random(`hs${i}`) * 0.9,
  atraso: random(`hd${i}`) * 0.25,
}));

const Vizinhanca: React.FC<{ onda: number; frame: number; epicentro?: number }> = ({ onda, frame, epicentro = 0 }) => {
  const coracao = useMemo(coracaoGeo, []);
  // raio da onda de choque (m)
  const R = onda * 24;
  const pulso = 0.75 + 0.25 * Math.sin(frame * 0.5);
  return (
    <group>
      {/* chão e ruas */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial color="#1f3524" roughness={1} />
      </mesh>
      {[-3.5, 3.5, -10.5, 10.5, -17.5, 17.5, -24.5, 24.5].map((k) => (
        <group key={k}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[k, 0.01, 0]}>
            <planeGeometry args={[2.2, 120]} />
            <meshStandardMaterial color="#2a2c33" roughness={0.9} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, k]}>
            <planeGeometry args={[120, 2.2]} />
            <meshStandardMaterial color="#2a2c33" roughness={0.9} />
          </mesh>
        </group>
      ))}
      {/* postes */}
      {[-3.5, 3.5, -10.5, 10.5, -17.5, 17.5].flatMap((a) =>
        [-10.5, 0, 10.5].map((b) => (
          <group key={`${a}${b}`} position={[a + 1.3, 0, b + 3]}>
            <mesh position={[0, 1.6, 0]}>
              <cylinderGeometry args={[0.06, 0.08, 3.2, 6]} />
              <meshStandardMaterial color="#555" />
            </mesh>
            <mesh position={[0, 3.25, 0]}>
              <sphereGeometry args={[0.18, 8, 8]} />
              <meshBasicMaterial color="#ffd89a" toneMapped={false} />
            </mesh>
          </group>
        )),
      )}
      {CASAS.map((c, i) => {
        const passou = R > c.dist;
        const balanco = Math.max(0, 1 - Math.abs(R - c.dist) / 2.5);
        return (
          <group key={i} position={[c.x, 0, c.z]} rotation={[0, c.giro, 0]}>
            <Casa cor={c.cor} telhado={c.telhado} alt={c.alt} janela={passou ? "#ff5fc1" : "#ffcf70"} brilho={passou ? 1.1 : c.luz ? 0.9 : 0.08} balanco={balanco} />
          </group>
        );
      })}
      {/* casa do Gabriel: janelas rosa neon */}
      <Casa cor="#f4f1de" telhado="#3d405b" alt={3} janela="#ff4fb8" brilho={1.3 * pulso} balanco={onda > 0 ? Math.max(0, 1 - onda * 6) : 0} />
      <mesh position={[0, 3.78, 1.02]} rotation={[-0.93, 0, 0]}>
        <planeGeometry args={[1.3, 0.85]} />
        <meshBasicMaterial color={new THREE.Color("#ff4fb8").multiplyScalar(1.2 * pulso)} toneMapped={false} />
      </mesh>
      <pointLight position={[0, 2.2, 3]} intensity={10 * pulso + epicentro * 20} distance={14} color="#ff4fb8" />
      {/* onda de choque: anel rosa e cúpula translúcida */}
      {onda > 0 && (
        <group>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.4, 0]} scale={[R, R, 1]}>
            <ringGeometry args={[0.92, 1, 96]} />
            <meshBasicMaterial color="#ff4fb8" transparent opacity={Math.max(0, 1 - onda * 0.7)} side={THREE.DoubleSide} toneMapped={false} />
          </mesh>
          <mesh scale={[R, R * 0.45, R]}>
            <sphereGeometry args={[1, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshBasicMaterial color="#ff7fd0" transparent opacity={Math.max(0, 0.22 - onda * 0.15)} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
          </mesh>
          {CORACOES.map((h, i) => {
            const k = Math.max(0, onda - h.atraso);
            const r = k * 24;
            return (
              <mesh
                key={i}
                geometry={coracao}
                position={[Math.cos(h.ang) * r, h.alt + k * 3, Math.sin(h.ang) * r]}
                rotation={[0, -h.ang + Math.PI / 2 + frame * 0.05, 0]}
                scale={h.tam * Math.min(1, k * 8)}
              >
                <meshBasicMaterial color="#ff4fb8" toneMapped={false} />
              </mesh>
            );
          })}
        </group>
      )}
      {/* epicentro: anéis vermelhos pulsando no chão em volta da casa */}
      {epicentro > 0 &&
        [0, 1, 2].map((k) => {
          const f = (frame / 30 / 0.9 + k / 3) % 1;
          return (
            <mesh key={k} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]} scale={[3 + f * 9, 3 + f * 9, 1]}>
              <ringGeometry args={[0.9, 1, 64]} />
              <meshBasicMaterial color="#ff2a2a" transparent opacity={(1 - f) * epicentro} toneMapped={false} />
            </mesh>
          );
        })}
    </group>
  );
};

const Noite: React.FC = () => (
  <>
    <fog attach="fog" args={["#0a0f2a", 25, 70]} />
    <ambientLight intensity={0.28} color="#8090ff" />
    <directionalLight position={[-10, 20, 8]} intensity={0.7} color="#93a6ff" castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-30} shadow-camera-right={30} shadow-camera-top={30} shadow-camera-bottom={-30} />
    <hemisphereLight args={["#2b3a80", "#0b1a10", 0.35]} />
  </>
);

// 15,4–17,6 s: vista aérea; a onda de choque rosa sai do quarto e varre a vizinhança
export const PlanoBairro: React.FC<PropsPlano> = ({ t, dur, frame }) => (
  <Palco fundo="#0a0f2a" sombras>
    <Noite />
    <CameraLenta de={[19, 21, 22]} para={[15, 17, 18]} alvo={[0, 0, 0]} x={t / dur} fov={42} />
    <Vizinhanca onda={entre(t, 0.15, dur + 0.3)} frame={frame} />
  </Palco>
);

// 41,8–43,2 s: de cima, o telhado com a janela rosa — o epicentro
export const PlanoTelhado: React.FC<PropsPlano> = ({ t, dur, frame }) => (
  <Palco fundo="#0a0f2a" sombras>
    <Noite />
    <CameraLenta de={[1, 36, 13]} para={[0.6, 27, 10]} alvo={[0, 1.5, 2.6]} x={t / dur} fov={45} />
    <Vizinhanca onda={0} frame={frame} epicentro={entre(t, 0, 0.3)} />
    {/* feixes vermelhos caindo do céu bem em cima da casa */}
    {Array.from({ length: 10 }, (_, i) => {
      const a = (i / 10) * Math.PI * 2;
      const topo = new THREE.Vector3(Math.cos(a) * 30, 14, Math.sin(a) * 30);
      const alvo = new THREE.Vector3(0, 4.2, 0);
      const meio = topo.clone().add(alvo).multiplyScalar(0.5);
      const comp = topo.distanceTo(alvo);
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), topo.clone().sub(alvo).normalize());
      return (
        <mesh key={i} position={meio.toArray()} quaternion={q} scale={[1, entre(t, i * 0.03, 0.5 + i * 0.03), 1]}>
          <cylinderGeometry args={[0.025, 0.025, comp, 6]} />
          <meshBasicMaterial color="#ff2a2a" transparent opacity={0.8} toneMapped={false} />
        </mesh>
      );
    })}
  </Palco>
);
