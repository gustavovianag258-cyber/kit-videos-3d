import { useMemo } from "react";
import * as THREE from "three";
import { random } from "remotion";

// Layout da rua (eixo z é o comprimento da rua):
// x de -12 a -9: calçada do outro lado | -9 a -2: asfalto | -2 a 4.5: calçada do personagem
export const CALCADA_Y = 0.15;

const CORES_PREDIO = [
  "#c96f53",
  "#d9a066",
  "#8c6f8f",
  "#5f7c99",
  "#b5b09a",
  "#7a8f78",
  "#d4c4a8",
  "#a35d5d",
];
const PELES = ["#f1c27d", "#e0ac69", "#c68642", "#8d5524", "#ffdbac"];
const ROUPAS = ["#e74c3c", "#27ae60", "#f39c12", "#8e44ad", "#16a085", "#d35400", "#ecf0f1", "#34495e"];
const CABELOS = ["#2b1b12", "#4a2c1a", "#111111", "#a0522d", "#d9b26f"];

const escolher = <T,>(lista: T[], semente: string) =>
  lista[Math.floor(random(semente) * lista.length)];

// ---------- Prédios ----------
const ANDAR = 2.8;

const criarFachada = (semente: string, base: string, colunas: number, andares: number) => {
  const px = 48;
  const py = 64;
  const canvas = document.createElement("canvas");
  canvas.width = colunas * px;
  canvas.height = andares * py;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let a = 0; a < andares - 1; a++) {
    for (let c = 0; c < colunas; c++) {
      const aceso = random(`${semente}-janela-${a}-${c}`) < 0.3;
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      ctx.fillRect(c * px + 8, a * py + 10, px - 16, py - 20);
      ctx.fillStyle = aceso ? "#ffd27a" : "#34445f";
      ctx.fillRect(c * px + 11, a * py + 13, px - 22, py - 26);
    }
    // Faixa entre os andares
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    ctx.fillRect(0, (a + 1) * py - 4, canvas.width, 4);
  }
  // Térreo: lojas com vitrines iluminadas
  const yLoja = (andares - 1) * py;
  ctx.fillStyle = "#3a2f2a";
  ctx.fillRect(0, yLoja, canvas.width, py);
  for (let c = 0; c < colunas; c++) {
    ctx.fillStyle = random(`${semente}-loja-${c}`) < 0.6 ? "#ffe2a8" : "#6b7c93";
    ctx.fillRect(c * px + 5, yLoja + 14, px - 10, py - 14);
  }
  // Toldo
  ctx.fillStyle = escolher(["#c0392b", "#16a085", "#2c3e50", "#d35400"], `${semente}-toldo`);
  ctx.fillRect(0, yLoja, canvas.width, 10);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
};

type DadosPredio = {
  id: string;
  x: number;
  z: number;
  larg: number;
  prof: number;
  andares: number;
  cor: string;
};

// vao: trecho [zIni, zFim] sem prédios (praça, monumento)
const fileiraDePredios = (lado: -1 | 1, xInterno: number, vao?: [number, number]): DadosPredio[] => {
  const lista: DadosPredio[] = [];
  let z = -110;
  let i = 0;
  while (z < 30) {
    const id = `predio-${lado}-${i}`;
    const prof = 5 + random(`${id}-prof`) * 5;
    const larg = 6 + random(`${id}-larg`) * 5;
    const andares = 3 + Math.floor(random(`${id}-andares`) * 6);
    if (vao && z + prof > vao[0] && z < vao[1]) {
      z += prof + 0.3;
      i++;
      continue;
    }
    lista.push({
      id,
      x: lado * (xInterno + larg / 2),
      z: z + prof / 2,
      larg,
      prof,
      andares,
      cor: escolher(CORES_PREDIO, `${id}-cor`),
    });
    z += prof + 0.3;
    i++;
  }
  return lista;
};

const Predio: React.FC<{ p: DadosPredio }> = ({ p }) => {
  const materiais = useMemo(() => {
    const colunas = Math.max(2, Math.round(p.prof / 1.8));
    const fachada = new THREE.MeshStandardMaterial({
      map: criarFachada(p.id, p.cor, colunas, p.andares),
      roughness: 0.85,
    });
    const teto = new THREE.MeshStandardMaterial({ color: "#4f4a47", roughness: 0.9 });
    // Ordem das faces do BoxGeometry: +x, -x, +y, -y, +z, -z
    return [fachada, fachada, teto, teto, fachada, fachada];
  }, [p]);

  const altura = p.andares * ANDAR;
  return (
    <mesh position={[p.x, altura / 2, p.z]} material={materiais} castShadow receiveShadow>
      <boxGeometry args={[p.larg, altura, p.prof]} />
    </mesh>
  );
};

// vaoEsquerda: trecho sem prédios do lado esquerdo da rua (x negativo)
export const Predios: React.FC<{ vaoEsquerda?: [number, number] }> = ({ vaoEsquerda }) => {
  const predios = useMemo(
    () => [...fileiraDePredios(-1, 12, vaoEsquerda), ...fileiraDePredios(1, 4.5)],
    [vaoEsquerda],
  );
  return (
    <>
      {predios.map((p) => (
        <Predio key={p.id} p={p} />
      ))}
    </>
  );
};

// ---------- Rua, calçadas e faixas ----------
const criarTexturaCalcada = (repX: number, repZ: number) => {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#c9c1b3";
  ctx.fillRect(0, 0, 64, 64);
  ctx.strokeStyle = "#a89f91";
  ctx.lineWidth = 3;
  ctx.strokeRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repX, repZ);
  tex.anisotropy = 8;
  return tex;
};

const COMPRIMENTO = 240;
const Z_CENTRO = -40;

const Calcada: React.FC<{ xMin: number; xMax: number }> = ({ xMin, xMax }) => {
  const larg = xMax - xMin;
  const mapa = useMemo(
    () => criarTexturaCalcada(larg / 1.2, COMPRIMENTO / 1.2),
    [larg],
  );
  return (
    <mesh position={[(xMin + xMax) / 2, CALCADA_Y / 2, Z_CENTRO]} receiveShadow>
      <boxGeometry args={[larg, CALCADA_Y, COMPRIMENTO]} />
      <meshStandardMaterial attach="material-0" color="#9a9286" />
      <meshStandardMaterial attach="material-1" color="#9a9286" />
      <meshStandardMaterial attach="material-2" map={mapa} roughness={0.9} />
      <meshStandardMaterial attach="material-3" color="#9a9286" />
      <meshStandardMaterial attach="material-4" color="#9a9286" />
      <meshStandardMaterial attach="material-5" color="#9a9286" />
    </mesh>
  );
};

const Poste: React.FC<{ z: number }> = ({ z }) => (
  <group position={[-1.7, CALCADA_Y, z]}>
    <mesh position={[0, 2.2, 0]} castShadow>
      <cylinderGeometry args={[0.06, 0.09, 4.4, 10]} />
      <meshStandardMaterial color="#2b2f36" roughness={0.5} metalness={0.4} />
    </mesh>
    <mesh position={[-0.45, 4.35, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
      <cylinderGeometry args={[0.04, 0.04, 0.9, 8]} />
      <meshStandardMaterial color="#2b2f36" roughness={0.5} metalness={0.4} />
    </mesh>
    <mesh position={[-0.85, 4.25, 0]}>
      <boxGeometry args={[0.35, 0.12, 0.25]} />
      <meshStandardMaterial color="#fff1c4" emissive="#ffd98a" emissiveIntensity={1.2} />
    </mesh>
  </group>
);

export const Rua: React.FC = () => {
  const tracejados = useMemo(
    () => Array.from({ length: 60 }, (_, i) => -150 + i * 4),
    [],
  );
  const postes = useMemo(() => Array.from({ length: 13 }, (_, i) => -100 + i * 10), []);

  return (
    <>
      {/* Chão de fundo */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, Z_CENTRO]}>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color="#3a3a40" />
      </mesh>
      {/* Asfalto */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-5.5, 0.002, Z_CENTRO]} receiveShadow>
        <planeGeometry args={[7, COMPRIMENTO]} />
        <meshStandardMaterial color="#4a4b53" roughness={0.95} />
      </mesh>
      {/* Faixa central tracejada */}
      {tracejados.map((z) => (
        <mesh key={z} rotation={[-Math.PI / 2, 0, 0]} position={[-5.5, 0.01, z]}>
          <planeGeometry args={[0.15, 2]} />
          <meshStandardMaterial color="#f2f2f2" />
        </mesh>
      ))}
      {/* Faixa de pedestres */}
      {Array.from({ length: 8 }, (_, i) => (
        <mesh
          key={i}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[-8.4 + i * 0.85, 0.012, -14]}
          receiveShadow
        >
          <planeGeometry args={[0.5, 3]} />
          <meshStandardMaterial color="#f2f2f2" />
        </mesh>
      ))}
      <Calcada xMin={-2} xMax={4.5} />
      <Calcada xMin={-12} xMax={-9} />
      {postes.map((z) => (
        <Poste key={z} z={z} />
      ))}
    </>
  );
};

// ---------- Carros ----------
export const Carro: React.FC<{ x: number; z: number; dir: number; cor: string }> = ({
  x,
  z,
  dir,
  cor,
}) => (
  <group position={[x, 0, z]} rotation={[0, dir > 0 ? 0 : Math.PI, 0]}>
    <mesh position={[0, 0.6, 0]} castShadow>
      <boxGeometry args={[1.8, 0.55, 4]} />
      <meshStandardMaterial color={cor} roughness={0.35} metalness={0.3} />
    </mesh>
    <mesh position={[0, 1.08, -0.2]} castShadow>
      <boxGeometry args={[1.6, 0.48, 2.1]} />
      <meshStandardMaterial color="#1f2730" roughness={0.15} metalness={0.5} />
    </mesh>
    {[
      [-0.85, 1.3],
      [0.85, 1.3],
      [-0.85, -1.3],
      [0.85, -1.3],
    ].map(([rx, rz], i) => (
      <mesh key={i} position={[rx, 0.33, rz]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.33, 0.33, 0.25, 16]} />
        <meshStandardMaterial color="#141414" roughness={0.8} />
      </mesh>
    ))}
    {/* Faróis e lanternas */}
    {[-0.6, 0.6].map((fx) => (
      <group key={fx}>
        <mesh position={[fx, 0.65, 2.01]}>
          <boxGeometry args={[0.35, 0.15, 0.02]} />
          <meshStandardMaterial color="#fff6d0" emissive="#fff3c0" emissiveIntensity={1.5} />
        </mesh>
        <mesh position={[fx, 0.65, -2.01]}>
          <boxGeometry args={[0.35, 0.12, 0.02]} />
          <meshStandardMaterial color="#ff3b30" emissive="#ff2a1f" emissiveIntensity={1.2} />
        </mesh>
      </group>
    ))}
  </group>
);

const CARROS = [
  { x: -3.8, z0: -70, dir: 1, vel: 7, cor: "#e63946" },
  { x: -3.8, z0: -35, dir: 1, vel: 6.5, cor: "#f1c40f" },
  { x: -7.2, z0: 25, dir: -1, vel: 6, cor: "#3a86ff" },
  { x: -7.2, z0: -5, dir: -1, vel: 7.5, cor: "#ecf0f1" },
];

export const Carros: React.FC<{ tempo: number }> = ({ tempo }) => (
  <>
    {CARROS.map((c, i) => (
      <Carro key={i} x={c.x} z={c.z0 + c.dir * c.vel * tempo} dir={c.dir} cor={c.cor} />
    ))}
  </>
);

// ---------- Pedestres (mais simples que o personagem principal) ----------
export const Pedestre: React.FC<{
  x: number;
  z: number;
  dir: number;
  fase: number;
  roupa: string;
  pele: string;
  cabelo: string;
  escala: number;
}> = ({ x, z, dir, fase, roupa, pele, cabelo, escala }) => {
  const giro = Math.sin(fase) * 0.5;
  return (
    <group position={[x, CALCADA_Y, z]} rotation={[0, dir > 0 ? 0 : Math.PI, 0]} scale={escala}>
      {[-0.11, 0.11].map((lx, i) => (
        <group key={lx} position={[lx, 0.85, 0]} rotation={[i ? giro : -giro, 0, 0]}>
          <mesh position={[0, -0.42, 0]} castShadow>
            <capsuleGeometry args={[0.09, 0.66, 4, 8]} />
            <meshStandardMaterial color="#2a2d36" />
          </mesh>
        </group>
      ))}
      {[-0.29, 0.29].map((bx, i) => (
        <group key={bx} position={[bx, 1.42, 0]} rotation={[i ? -giro : giro, 0, 0]}>
          <mesh position={[0, -0.25, 0]} castShadow>
            <capsuleGeometry args={[0.065, 0.4, 4, 8]} />
            <meshStandardMaterial color={roupa} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 1.18, 0]} scale={[1.1, 1, 0.8]} castShadow>
        <capsuleGeometry args={[0.22, 0.38, 4, 12]} />
        <meshStandardMaterial color={roupa} roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.78, 0]} castShadow>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color={pele} roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.8, -0.02]} rotation={[-0.4, 0, 0]}>
        <sphereGeometry args={[0.212, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        <meshStandardMaterial color={cabelo} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

const N_PEDESTRES = 16;

export const Pedestres: React.FC<{ tempo: number }> = ({ tempo }) => {
  const pessoas = useMemo(
    () =>
      Array.from({ length: N_PEDESTRES }, (_, i) => {
        const s = `pedestre-${i}`;
        // A maioria na calçada da frente; alguns na beira da calçada do personagem (atrás dele)
        const doOutroLado = i % 3 !== 0;
        return {
          x: doOutroLado ? -11.4 + random(`${s}-x`) * 1.8 : -1.5 + random(`${s}-x`) * 0.5,
          z0: -45 + random(`${s}-z`) * 55,
          dir: random(`${s}-dir`) > 0.5 ? 1 : -1,
          vel: 0.9 + random(`${s}-vel`) * 0.5,
          roupa: escolher(ROUPAS, `${s}-roupa`),
          pele: escolher(PELES, `${s}-pele`),
          cabelo: escolher(CABELOS, `${s}-cabelo`),
          escala: 0.9 + random(`${s}-escala`) * 0.15,
        };
      }),
    [],
  );

  return (
    <>
      {pessoas.map((p, i) => {
        const distancia = p.vel * tempo;
        return (
          <Pedestre
            key={i}
            x={p.x}
            z={p.z0 + p.dir * distancia}
            dir={p.dir}
            fase={(distancia / 1.4) * Math.PI * 2}
            roupa={p.roupa}
            pele={p.pele}
            cabelo={p.cabelo}
            escala={p.escala}
          />
        );
      })}
    </>
  );
};
