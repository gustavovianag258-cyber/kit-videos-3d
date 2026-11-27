import { RoundedBox } from "@react-three/drei";
import { useLayoutEffect, useMemo, useRef } from "react";
import { random } from "remotion";
import * as THREE from "three";
import { escolher, texturaCanvas } from "./Pecas";

// MERCADINHO / VENDINHA DE BAIRRO (interior). Sala de 7 x 8 m, pé-direito 3 m, piso em y = 0.
// Fundo (prateleiras) em z = -4, porta para a rua em z = +4 (de x = -1 a 1). Balcão à direita (x ≈ 2).
// Use com <Ambiente hora="interior">: as lâmpadas fluorescentes daqui fazem a luz.

const L = 7;
const P = 8;
const H = 3;

const ROTULOS = ["ARROZ", "FEIJÃO", "CAFÉ", "AÇÚCAR", "MOLHO", "SARDINHA", "BISCOITO", "FARINHA", "MILHO", "LEITE"] as const;
const CORES_ROTULO = [
  ["#c81e1e", "#ffffff"],
  ["#1d3557", "#f2c230"],
  ["#2a9d8f", "#ffffff"],
  ["#f2c230", "#c81e1e"],
  ["#ffffff", "#1d3557"],
  ["#e76f51", "#ffffff"],
] as const;

const texturaRotulo = (texto: string, fundo: string, letra: string) =>
  texturaCanvas(256, 128, (ctx) => {
    ctx.fillStyle = fundo;
    ctx.fillRect(0, 0, 256, 128);
    ctx.fillStyle = letra;
    ctx.fillRect(0, 96, 256, 10);
    ctx.font = "bold 46px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(texto, 128, 56);
  });

// Garrafas (instanciadas: centenas sem pesar)
const Garrafas: React.FC<{ posicoes: [number, number, number][]; corpo: string; tampa: string; rotulo: string; escala?: number }> = ({ posicoes, corpo, tampa, rotulo, escala = 1 }) => {
  const refs = [useRef<THREE.InstancedMesh>(null), useRef<THREE.InstancedMesh>(null), useRef<THREE.InstancedMesh>(null)];
  const geos = useMemo(() => {
    const perfil = [
      [0.0, 0],
      [0.045, 0],
      [0.048, 0.02],
      [0.048, 0.16],
      [0.042, 0.2],
      [0.018, 0.25],
      [0.016, 0.3],
      [0.0, 0.3],
    ].map(([r, y]) => new THREE.Vector2(r, y));
    return [new THREE.LatheGeometry(perfil, 16), new THREE.CylinderGeometry(0.02, 0.02, 0.025, 10).translate(0, 0.31, 0), new THREE.CylinderGeometry(0.0495, 0.0495, 0.08, 16, 1, true).translate(0, 0.1, 0)];
  }, []);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    for (const r of refs)
      if (r.current) {
        posicoes.forEach((p, i) => r.current!.setMatrixAt(i, m.compose(new THREE.Vector3(...p), new THREE.Quaternion(), new THREE.Vector3(escala, escala, escala))));
        r.current.instanceMatrix.needsUpdate = true;
      }
  });
  return (
    <>
      <instancedMesh ref={refs[0]} args={[geos[0], undefined, posicoes.length]} castShadow>
        <meshPhysicalMaterial color={corpo} roughness={0.15} transmission={0} clearcoat={1} />
      </instancedMesh>
      <instancedMesh ref={refs[1]} args={[geos[1], undefined, posicoes.length]}>
        <meshStandardMaterial color={tampa} roughness={0.4} />
      </instancedMesh>
      <instancedMesh ref={refs[2]} args={[geos[2], undefined, posicoes.length]}>
        <meshStandardMaterial color={rotulo} roughness={0.6} side={THREE.DoubleSide} />
      </instancedMesh>
    </>
  );
};

// Estante de parede: 4 prateleiras amarelas cheias de produtos
const Estante: React.FC<{ pos: [number, number, number]; giroY?: number; largura: number; semente: string }> = ({ pos, giroY = 0, largura, semente }) => {
  const prateleiras = [0.35, 0.95, 1.55, 2.15];
  const caixas = useMemo(
    () =>
      prateleiras.flatMap((y, n) => {
        if (n % 2 === 0) return [];
        const itens: { x: number; y: number; tex: THREE.Texture; w: number; h: number }[] = [];
        let x = -largura / 2 + 0.15;
        let k = 0;
        while (x < largura / 2 - 0.3) {
          const nome = escolher(ROTULOS, `${semente}r${n}${k}`);
          const [f, l] = escolher(CORES_ROTULO, `${semente}c${n}${k}`);
          const w = 0.22 + random(`${semente}w${n}${k}`) * 0.12;
          const h = 0.26 + random(`${semente}h${n}${k}`) * 0.14;
          itens.push({ x: x + w / 2, y, tex: texturaRotulo(nome, f, l), w, h });
          x += w + 0.02;
          k++;
        }
        return itens;
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [largura, semente],
  );
  const garrafas = useMemo(() => {
    const grupos: [number, number, number][][] = [[], [], []];
    prateleiras.forEach((y, n) => {
      if (n % 2 === 1) return;
      let g = Math.floor(random(`${semente}g${n}`) * 3);
      for (let x = -largura / 2 + 0.12, i = 0; x < largura / 2 - 0.1; x += 0.105, i++) {
        if (i % 9 === 0) g = (g + 1) % 3;
        grupos[g].push([x, y + 0.03, -0.12]);
        grupos[g].push([x + 0.05, y + 0.03, 0.02]);
      }
    });
    return grupos;
  }, [largura, semente]);
  return (
    <group position={pos} rotation={[0, giroY, 0]}>
      {/* fundo e laterais */}
      <mesh position={[0, 1.25, -0.3]} receiveShadow>
        <boxGeometry args={[largura, 2.5, 0.04]} />
        <meshStandardMaterial color="#5a4632" roughness={0.9} />
      </mesh>
      {prateleiras.map((y) => (
        <RoundedBox key={y} args={[largura, 0.05, 0.5]} radius={0.02} position={[0, y, -0.05]} castShadow receiveShadow>
          <meshStandardMaterial color="#f2b705" roughness={0.6} />
        </RoundedBox>
      ))}
      {/* frente amarela das prateleiras (a faixa que aparece em close) */}
      {prateleiras.map((y) => (
        <mesh key={`f${y}`} position={[0, y - 0.04, 0.2]}>
          <boxGeometry args={[largura, 0.09, 0.03]} />
          <meshStandardMaterial color="#e0a800" roughness={0.5} />
        </mesh>
      ))}
      <Garrafas posicoes={garrafas[0]} corpo="#1f7a3a" tampa="#f2c230" rotulo="#f2c230" />
      <Garrafas posicoes={garrafas[1]} corpo="#2b6cb0" tampa="#ffffff" rotulo="#ffffff" />
      <Garrafas posicoes={garrafas[2]} corpo="#7a2e12" tampa="#c81e1e" rotulo="#e9c46a" />
      {caixas.map((c, i) => (
        <mesh key={i} position={[c.x, c.y + c.h / 2 + 0.025, -0.05]} castShadow>
          <boxGeometry args={[c.w, c.h, 0.2]} />
          <meshStandardMaterial attach="material-0" color="#ddd" />
          <meshStandardMaterial attach="material-1" color="#ddd" />
          <meshStandardMaterial attach="material-2" color="#eee" />
          <meshStandardMaterial attach="material-3" color="#eee" />
          <meshStandardMaterial attach="material-4" map={c.tex} roughness={0.6} />
          <meshStandardMaterial attach="material-5" color="#ddd" />
        </mesh>
      ))}
    </group>
  );
};

const Lampada: React.FC<{ pos: [number, number, number] }> = ({ pos }) => (
  <group position={pos}>
    <mesh>
      <boxGeometry args={[1.25, 0.05, 0.14]} />
      <meshStandardMaterial color="#d8d8d8" />
    </mesh>
    <mesh position={[0, -0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.025, 0.025, 1.2, 8]} />
      <meshStandardMaterial color="#ffffff" emissive="#f4fbff" emissiveIntensity={4} />
    </mesh>
    <pointLight position={[0, -0.2, 0]} color="#f2f6ff" intensity={9} distance={7} decay={1.6} castShadow shadow-mapSize={[512, 512]} shadow-bias={-0.002} />
  </group>
);

export const Mercadinho: React.FC<{ semente?: string; corParede?: string; nomeNaParede?: string }> = ({ semente = "merc", corParede = "#9fbf9a" }) => {
  const piso = useMemo(
    () =>
      texturaCanvas(
        256,
        256,
        (ctx) => {
          for (let i = 0; i < 4; i++)
            for (let j = 0; j < 4; j++) {
              ctx.fillStyle = (i + j) % 2 ? "#d9cdb8" : "#c4b59c";
              ctx.fillRect(i * 64, j * 64, 64, 64);
              ctx.strokeStyle = "rgba(0,0,0,0.15)";
              ctx.strokeRect(i * 64, j * 64, 64, 64);
            }
        },
        true,
      ),
    [],
  );
  piso.repeat.set(L / 1.2, P / 1.2);
  const azulejo = useMemo(
    () =>
      texturaCanvas(
        128,
        128,
        (ctx) => {
          ctx.fillStyle = "#f1efe9";
          ctx.fillRect(0, 0, 128, 128);
          ctx.strokeStyle = "#cfcac0";
          ctx.lineWidth = 3;
          for (let k = 0; k <= 128; k += 32) {
            ctx.beginPath();
            ctx.moveTo(k, 0);
            ctx.lineTo(k, 128);
            ctx.moveTo(0, k);
            ctx.lineTo(128, k);
            ctx.stroke();
          }
        },
        true,
      ),
    [],
  );
  azulejo.repeat.set(P / 0.6, 1.4 / 0.6);
  return (
    <group>
      {/* piso, teto */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[L, P]} />
        <meshStandardMaterial map={piso} roughness={0.35} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, H, 0]}>
        <planeGeometry args={[L, P]} />
        <meshStandardMaterial color="#efe9df" roughness={0.95} />
      </mesh>
      {/* paredes: azulejo embaixo, pintura em cima */}
      {(
        [
          [[0, 0, -P / 2], 0, L],
          [[-L / 2, 0, 0], Math.PI / 2, P],
          [[L / 2, 0, 0], -Math.PI / 2, P],
        ] as [[number, number, number], number, number][]
      ).map(([p, g, w], i) => (
        <group key={i} position={p} rotation={[0, g, 0]}>
          <mesh position={[0, 0.7, 0]} receiveShadow>
            <planeGeometry args={[w, 1.4]} />
            <meshStandardMaterial map={azulejo} roughness={0.3} />
          </mesh>
          <mesh position={[0, 1.4 + (H - 1.4) / 2, 0]} receiveShadow>
            <planeGeometry args={[w, H - 1.4]} />
            <meshStandardMaterial color={corParede} roughness={0.95} />
          </mesh>
        </group>
      ))}
      {/* parede da frente com a porta aberta (luz do dia entrando) */}
      {[-1, 1].map((l) => (
        <mesh key={l} position={[l * (1.1 + (L / 2 - 1.1) / 2), H / 2, P / 2]} rotation={[0, Math.PI, 0]} receiveShadow>
          <planeGeometry args={[L / 2 - 1.1, H]} />
          <meshStandardMaterial color={corParede} roughness={0.95} side={THREE.DoubleSide} />
        </mesh>
      ))}
      <mesh position={[0, H - 0.4, P / 2]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[2.2, 0.8]} />
        <meshStandardMaterial color={corParede} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 1.3, P / 2 + 3]}>
        <planeGeometry args={[6, 3]} />
        <meshStandardMaterial color="#fff6e6" emissive="#fff3dc" emissiveIntensity={2.2} />
      </mesh>
      <pointLight position={[0, 1.8, P / 2 - 0.3]} color="#fff2d8" intensity={12} distance={8} />

      <Estante pos={[0, 0, -P / 2 + 0.35]} largura={L - 0.4} semente={`${semente}a`} />
      <Estante pos={[-L / 2 + 0.35, 0, -0.5]} giroY={Math.PI / 2} largura={5.5} semente={`${semente}b`} />

      {/* balcão com tampo de vidro, caixa registradora e doces */}
      <group position={[2.1, 0, 0.6]}>
        <RoundedBox args={[1.0, 1.0, 3.6]} radius={0.05} position={[0, 0.5, 0]} castShadow receiveShadow>
          <meshStandardMaterial color="#8a5a3a" roughness={0.6} />
        </RoundedBox>
        <mesh position={[0, 1.03, 0]}>
          <boxGeometry args={[1.05, 0.04, 3.65]} />
          <meshPhysicalMaterial color="#cfe8ef" roughness={0.05} transmission={0.6} transparent opacity={0.6} />
        </mesh>
        <RoundedBox args={[0.42, 0.28, 0.38]} radius={0.04} position={[0, 1.2, 0.9]} castShadow>
          <meshStandardMaterial color="#2b2d42" roughness={0.5} />
        </RoundedBox>
        {Array.from({ length: 5 }, (_, i) => (
          <mesh key={i} position={[0.1, 1.15, -1.2 + i * 0.22]} castShadow>
            <cylinderGeometry args={[0.08, 0.08, 0.2, 14]} />
            <meshPhysicalMaterial color={["#e63946", "#f2c230", "#2a9d8f", "#ff7a2f", "#8338ec"][i]} roughness={0.1} transmission={0.4} transparent opacity={0.85} />
          </mesh>
        ))}
      </group>
      {/* geladeira de bebidas com porta de vidro iluminada */}
      <group position={[L / 2 - 0.45, 0, -2.6]} rotation={[0, -Math.PI / 2, 0]}>
        <RoundedBox args={[1.2, 2.0, 0.7]} radius={0.06} position={[0, 1.0, 0]} castShadow>
          <meshStandardMaterial color="#e63946" roughness={0.5} />
        </RoundedBox>
        <mesh position={[0, 1.05, 0.36]}>
          <planeGeometry args={[1.0, 1.6]} />
          <meshStandardMaterial color="#d6f0ff" emissive="#bfe6ff" emissiveIntensity={0.7} roughness={0.1} />
        </mesh>
      </group>
      {Array.from({ length: 4 }, (_, i) => (
        <Lampada key={i} pos={[i % 2 ? 1.4 : -1.4, H - 0.04, i < 2 ? -1.8 : 1.6]} />
      ))}
    </group>
  );
};
