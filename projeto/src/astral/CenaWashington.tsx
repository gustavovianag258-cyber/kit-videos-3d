import { useMemo } from "react";
import * as THREE from "three";
import { Sol } from "../cinema/Palco";
import { Instancias } from "./cidade";
import { CeuDia, Cx, entre, Gente, Ondulacao, rnd, type Roupa, texturaCanvas } from "./pecas";
import { CamTrajeto, type Chave, Palco } from "./palco";
import type { V3 } from "./tempo";

// WASHINGTON, D.C., 10:30: Casa Branca vista da Elipse, o obelisco do Monumento de Washington,
// voo baixo pelo Gramado Sul até a janela curva do Salão Oval (você atravessa) e o Salão por
// dentro: sofás creme, tapete azul com o brasão, mesa Resolute e gente de terno conversando.

const CasaBranca: React.FC = () => (
  <group>
    <Cx t={[52, 21, 26]} p={[0, 10.5, 0]} c="#f2f1ec" />
    <Cx t={[54, 2, 28]} p={[0, 22, 0]} c="#e8e6df" />
    {Array.from({ length: 40 }).map((_, i) => (
      <Cx key={i} t={[0.5, 1.4, 0.5]} p={[-26 + i * 1.33, 23.6, 13.6]} c="#f4f3ef" sombra={false} />
    ))}
    <Cx t={[54, 0.4, 0.8]} p={[0, 24.4, 13.6]} c="#f4f3ef" />
    {[-20, -8, 8, 20].map((x) => (
      <Cx key={x} t={[2.2, 4, 1.6]} p={[x, 24.5, 0]} c="#e2ddd2" />
    ))}
    {[-1, 1].map((l) =>
      [0, 1, 2, 3, 4].map((i) => <Cx key={`f${l}${i}`} t={[3, 0.6, 0.6]} p={[l * (7 + i * 4), 16.3, 13.3]} c="#f7f6f2" sombra={false} />),
    )}
    {/* chafariz do Gramado Sul */}
    <group position={[0, 0, 70]}>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[7, 7.4, 1, 32]} />
        <meshStandardMaterial color="#e8ebef" />
      </mesh>
      <mesh position={[0, 1.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[6.6, 32]} />
        <meshStandardMaterial color="#7fa6b8" roughness={0.1} />
      </mesh>
      <mesh position={[0, 4, 0]}>
        <coneGeometry args={[1.2, 6, 12, 1, true]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.6} emissive="#ffffff" emissiveIntensity={0.3} side={THREE.DoubleSide} />
      </mesh>
    </group>
    {/* janelas (2 andares) */}
    {[-1, 1].map((l) =>
      [0, 1, 2, 3, 4].map((i) =>
        [6, 14].map((y) => <Cx key={`${l}${i}${y}`} t={[2.2, 3.6, 0.3]} p={[l * (7 + i * 4), y, 13.1]} c="#2b3442" sombra={false} />),
      ),
    )}
    {/* pórtico sul em semicírculo com colunas e a sacada */}
    {Array.from({ length: 7 }).map((_, i) => {
      const a = Math.PI * (i / 6);
      return (
        <mesh key={i} position={[Math.cos(a) * 9, 9, 13 + Math.sin(a) * 6]} castShadow>
          <cylinderGeometry args={[0.6, 0.7, 18, 12]} />
          <meshStandardMaterial color="#f7f6f2" roughness={0.6} />
        </mesh>
      );
    })}
    <mesh position={[0, 18.6, 13]} castShadow>
      <cylinderGeometry args={[10, 10, 1.6, 24, 1, false, 0, Math.PI]} />
      <meshStandardMaterial color="#efeee9" />
    </mesh>
    <Cx t={[16, 0.5, 6]} p={[0, 9.5, 15]} c="#e2e0d8" />
    <Cx t={[0.2, 8, 0.2]} p={[0, 27, 0]} c="#cccccc" />
    <mesh position={[2.2, 30, 0]}>
      <planeGeometry args={[4.4, 2.6]} />
      <meshStandardMaterial color="#b22234" side={THREE.DoubleSide} />
    </mesh>
    {/* alas e a Ala Oeste com o Salão Oval (meio-cilindro com janelas altas) */}
    <Cx t={[60, 9, 22]} p={[-58, 4.5, -2]} c="#efeee9" />
    <Cx t={[50, 9, 20]} p={[58, 4.5, -2]} c="#efeee9" />
    <group position={[-75, 0, 9]}>
      <mesh position={[0, 4, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[5.8, 5.8, 8, 32, 1, false, -Math.PI / 2, Math.PI]} />
        <meshStandardMaterial color="#f4f3ef" roughness={0.6} />
      </mesh>
      {[-0.55, -0.18, 0.18, 0.55].map((a) => (
        <group key={a} rotation={[0, a, 0]}>
          <Cx t={[1.5, 4.2, 0.1]} p={[0, 3.6, 5.82]} c="#2c4a6a" rug={0.15} met={0.3} />
          <Cx t={[1.7, 0.15, 0.2]} p={[0, 5.8, 5.85]} c="#ffffff" />
          <Cx t={[1.7, 0.15, 0.2]} p={[0, 1.4, 5.85]} c="#ffffff" />
        </group>
      ))}
    </group>
  </group>
);

const Arredores: React.FC<{ s: number }> = ({ s }) => {
  const { arvores, predios } = useMemo(() => {
    const arvores: { p: V3; t: V3; cor: string }[] = [];
    for (let i = 0; i < 520; i++) {
      const x = (rnd(`wx${i}`) - 0.5) * 900;
      const z = -80 + rnd(`wz${i}`) * 1100;
      if (Math.abs(x) < 70 && z < 120) continue;
      if (Math.hypot(x, z - 420) < 120 && Math.hypot(x, z - 420) > 20) continue;
      const tam = 5 + rnd(`ws${i}`) * 4;
      arvores.push({ p: [x, tam * 1.1, z], t: [tam, tam * 1.1, tam], cor: ["#4f8a3a", "#5c9a3f", "#3f7a34", "#6aa84f"][i % 4] });
    }
    const predios: { p: V3; t: V3; cor: string }[] = [];
    for (let i = 0; i < 400; i++) {
      const x = (rnd(`bx${i}`) - 0.5) * 2600;
      const z = -300 - rnd(`bz${i}`) * 1400;
      const a = 18 + rnd(`ba${i}`) * 22;
      predios.push({ p: [x, a / 2, z], t: [30 + rnd(`bw${i}`) * 40, a, 30 + rnd(`bd${i}`) * 30], cor: ["#d9d2c4", "#c9bfae", "#e6e0d4", "#b9a88f", "#cfc7b8"][i % 5] });
    }
    for (const lado of [-1, 1]) {
      for (let i = 0; i < 40; i++) {
        const z = -200 + i * 40;
        const a = 20 + rnd(`la${lado}${i}`) * 15;
        predios.push({ p: [lado * (520 + rnd(`lx${i}`) * 80), a / 2, z], t: [60, a, 34], cor: "#d6cfc2" });
      }
    }
    return { arvores, predios };
  }, []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.9 }), []);
  const esfera = useMemo(() => new THREE.IcosahedronGeometry(0.6, 2), []);
  const grama = useMemo(
    () =>
      texturaCanvas(
        256,
        256,
        (g) => {
          g.fillStyle = "#6c9a48";
          g.fillRect(0, 0, 256, 256);
          // listras do cortador de grama
          for (let x = 0; x < 256; x += 32) {
            g.fillStyle = "rgba(255,255,220,0.07)";
            g.fillRect(x, 0, 16, 256);
          }
          for (let i = 0; i < 2500; i++) {
            g.fillStyle = rnd(`gr${i}`) > 0.5 ? "rgba(40,70,30,0.15)" : "rgba(200,220,150,0.1)";
            g.fillRect(rnd(`gx${i}`) * 256, rnd(`gy${i}`) * 256, 2, 2);
          }
        },
        [400, 400],
      ),
    [],
  );
  // copas mais cheias: 3 bolas por árvore
  const copas = useMemo(
    () =>
      arvores.flatMap((a, i) => [
        a,
        { p: [a.p[0] + a.t[0] * 0.55, a.p[1] - a.t[1] * 0.25, a.p[2] + a.t[0] * 0.2] as V3, t: [a.t[0] * 0.75, a.t[1] * 0.75, a.t[2] * 0.75] as V3, cor: a.cor },
        { p: [a.p[0] - a.t[0] * 0.45, a.p[1] - a.t[1] * 0.3, a.p[2] - a.t[0] * 0.35] as V3, t: [a.t[0] * 0.7, a.t[1] * 0.7, a.t[2] * 0.7] as V3, cor: i % 2 ? "#4a7f34" : a.cor },
      ]),
    [arvores],
  );
  const troncos = useMemo(() => arvores.map((a) => ({ p: [a.p[0], a.p[1] * 0.45, a.p[2]] as V3, t: [0.6, a.p[1] * 0.9, 0.6] as V3, cor: "#6b4a32" })), [arvores]);
  return (
    <group>
      <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[9000, 9000]} />
        <meshStandardMaterial map={grama} roughness={1} />
      </mesh>
      {/* Elipse (estrada em volta) e caminhos */}
      <mesh position={[0, 0.06, 420]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[128, 136, 80]} />
        <meshStandardMaterial color="#3f434b" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.06, 90]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[60, 63, 60, 1, 0, Math.PI]} />
        <meshStandardMaterial color="#dad7cf" roughness={0.9} />
      </mesh>
      <Cx t={[900, 0.12, 9]} p={[0, 0.06, 250]} c="#3f434b" sombra={false} />
      <Cx t={[12, 0.12, 900]} p={[300, 0.06, 300]} c="#3f434b" sombra={false} />

      <Instancias itens={copas} material={mat} geo={esfera} />
      <Instancias itens={troncos} material={mat} />
      {/* carros nas avenidas e gente passeando na Elipse */}
      {Array.from({ length: 16 }).map((_, i) => {
        const x = -450 + ((i * 61 + s * 14) % 900);
        return <Cx key={i} t={[4.4, 1.5, 2]} p={[i % 2 ? x : -x, 0.8, 250 + (i % 2 ? 2.2 : -2.2)]} c={["#1d1d1f", "#f1f1f1", "#8d99ae", "#1d3557"][i % 4]} />;
      })}
      {Array.from({ length: 60 }).map((_, i) => {
        const a = rnd(`ea${i}`) * Math.PI * 2 + s * 0.01 * (i % 2 ? 1 : -1);
        return <Cx key={i} t={[0.6, 1.75, 0.6]} p={[Math.cos(a) * 132, 0.9, 420 + Math.sin(a) * 132]} c={["#e63946", "#f1faee", "#457b9d", "#2b2d42", "#e9c46a"][i % 5]} sombra={false} />;
      })}
      <Instancias itens={predios} material={mat} />
      {/* Monumento de Washington */}
      <group position={[90, 0, 1050]}>
        <mesh position={[0, 80, 0]} castShadow>
          <cylinderGeometry args={[6.5 * Math.SQRT1_2, 10 * Math.SQRT1_2, 160, 4]} />
          <meshStandardMaterial color="#efeae0" roughness={0.7} flatShading />
        </mesh>
        <mesh position={[0, 164.5, 0]}>
          <coneGeometry args={[6.5 * Math.SQRT1_2, 9, 4]} />
          <meshStandardMaterial color="#efeae0" roughness={0.7} flatShading />
        </mesh>
      </group>
      {/* bandeiras em volta do monumento */}
      {Array.from({ length: 16 }).map((_, i) => {
        const a = (i / 16) * Math.PI * 2;
        return <Cx key={i} t={[0.4, 18, 0.4]} p={[90 + Math.cos(a) * 30, 9, 1050 + Math.sin(a) * 30]} c="#eeeeee" />;
      })}
    </group>
  );
};

const SalaoOval: React.FC<{ s: number }> = ({ s }) => {
  const tapete = useMemo(
    () =>
      texturaCanvas(512, 512, (g) => {
        g.fillStyle = "#1f3f8f";
        g.beginPath();
        g.ellipse(256, 256, 254, 254, 0, 0, Math.PI * 2);
        g.fill();
        g.strokeStyle = "#e9e2c8";
        g.lineWidth = 10;
        g.beginPath();
        g.ellipse(256, 256, 236, 236, 0, 0, Math.PI * 2);
        g.stroke();
        g.fillStyle = "#f4f2ea";
        for (let i = 0; i < 30; i++) {
          const a = (i / 30) * Math.PI * 2;
          g.beginPath();
          g.arc(256 + Math.cos(a) * 214, 256 + Math.sin(a) * 214, 5, 0, Math.PI * 2);
          g.fill();
        }
        g.fillStyle = "#e7d7a4";
        g.beginPath();
        g.arc(256, 256, 60, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = "#7a5a2a";
        g.beginPath();
        g.arc(256, 256, 30, 0, Math.PI * 2);
        g.fill();
      }),
    [],
  );
  const HOMEM1: Roupa = { pele: "#e6b48f", cabelo: "#d7d8dc", camisa: "#1d2433", calca: "#1d2433", sapato: "#111", penteado: "grisalho", terno: true, gravata: "#9b1b2a" };
  const HOMEM2: Roupa = { pele: "#d9a37a", cabelo: "#6b6f78", camisa: "#1d2433", calca: "#1d2433", sapato: "#111", penteado: "lateral", terno: true, gravata: "#1f3f8f" };
  const MULHER: Roupa = { pele: "#8a5a3a", cabelo: "#1a1410", camisa: "#c4182c", calca: "#c4182c", sapato: "#111", penteado: "coque", vestido: true, batom: true };
  const RX = 5.6;
  const RZ = 4.5;
  return (
    <group position={[0, 0, -2000]}>
      {/* parede oval creme com friso dourado */}
      <mesh position={[0, 2.8, 0]} scale={[RX, 1, RZ]}>
        <cylinderGeometry args={[1, 1, 5.6, 64, 1, true]} />
        <meshStandardMaterial color="#efe8d6" side={THREE.BackSide} roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.0, 0]} scale={[RX * 0.995, 1, RZ * 0.995]}>
        <cylinderGeometry args={[1, 1, 0.06, 64, 1, true]} />
        <meshStandardMaterial color="#c9a24a" side={THREE.BackSide} metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 5.3, 0]} scale={[RX * 0.99, 1, RZ * 0.99]}>
        <cylinderGeometry args={[1, 1, 0.12, 64, 1, true]} />
        <meshStandardMaterial color="#c9a24a" side={THREE.BackSide} metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 5.6, 0]} scale={[RX, 1, RZ]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1, 64]} />
        <meshStandardMaterial color="#9aa0a6" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.01, 0]} scale={[RX, 1, RZ]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1, 64]} />
        <meshStandardMaterial color="#d9cfb8" />
      </mesh>
      <mesh position={[0, 0.02, 0]} scale={[RX * 0.82, 1, RZ * 0.82]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[1, 64]} />
        <meshStandardMaterial map={tapete} roughness={0.95} />
      </mesh>
      {/* quadros escuros com moldura dourada, portas */}
      {[-0.9, 0, 0.9].map((a) => (
        <group key={a} position={[Math.sin(a) * RX * 0.97, 3.3, -Math.cos(a) * RZ * 0.97]} rotation={[0, -a, 0]}>
          <Cx t={[1.3, 1.5, 0.06]} c="#e3c770" e="#e3c770" ei={0.15} />
          <Cx t={[1.1, 1.3, 0.08]} p={[0, 0, 0.01]} c="#3a3228" />
        </group>
      ))}
      {[-1.4, 1.4].map((a) => (
        <group key={a} position={[Math.sin(a) * RX * 0.98, 1.6, -Math.cos(a) * RZ * 0.98]} rotation={[0, -a, 0]}>
          <Cx t={[1.2, 3.0, 0.08]} c="#f4f2ec" />
          <Cx t={[0.9, 2.6, 0.1]} c="#dfe7ee" />
        </group>
      ))}
      {/* mesa Resolute, cadeiras amarelas e bandeiras no fundo */}
      <Cx t={[2.2, 0.8, 1.0]} p={[0, 0.4, -3.5]} c="#5a2f1c" />
      {[-1.8, 1.8].map((x) => (
        <Cx key={x} t={[0.8, 1.3, 0.8]} p={[x, 0.65, -2.8]} c="#d9b236" />
      ))}
      {[-0.8, 0.8].map((x) => (
        <group key={x} position={[x, 0, -4.2]}>
          <Cx t={[0.05, 2.6, 0.05]} p={[0, 1.3, 0]} c="#c9a24a" />
          <Cx t={[0.6, 1.0, 0.04]} p={[0.32, 2.1, 0]} c={x < 0 ? "#b22234" : "#1f3f8f"} />
        </group>
      ))}
      {/* dois sofás creme frente a frente e a mesa de centro */}
      {[-1, 1].map((l) => (
        <group key={l} position={[l * 1.55, 0, 0.3]}>
          <Cx t={[0.9, 0.45, 2.4]} p={[0, 0.25, 0]} c="#efe6cf" />
          <Cx t={[0.25, 0.9, 2.4]} p={[l * 0.42, 0.55, 0]} c="#e9dfc4" />
        </group>
      ))}
      <Cx t={[1.0, 0.45, 1.8]} p={[0, 0.22, 0.3]} c="#5a2f1c" />
      {[-1.8, 0, 1.8].map((x) => (
        <group key={x} position={[x, 2.4, -RZ * 0.93]} rotation={[0, x * -0.12, 0]}>
          <Cx t={[1.2, 2.8, 0.06]} c="#c9dbe8" e="#c9dbe8" ei={0.15} />
          <Cx t={[0.4, 3.4, 0.12]} p={[-0.75, 0, 0.08]} c="#b8892a" />
          <Cx t={[0.4, 3.4, 0.12]} p={[0.75, 0, 0.08]} c="#b8892a" />
          <Cx t={[2.0, 0.4, 0.14]} p={[0, 1.75, 0.08]} c="#c99b30" />
        </group>
      ))}
      <group position={[0, 0, RZ * 0.97]} rotation={[0, Math.PI, 0]}>
        <Cx t={[2.2, 1.4, 0.4]} p={[0, 0.7, 0]} c="#f4f1ea" />
        <Cx t={[1.2, 0.9, 0.42]} p={[0, 0.5, 0]} c="#1a1410" />
        <Cx t={[1.4, 1.7, 0.08]} p={[0, 2.6, 0]} c="#e3c770" e="#e3c770" ei={0.1} />
        <Cx t={[1.2, 1.5, 0.1]} p={[0, 2.6, 0.01]} c="#4a5a6a" />
      </group>
      {[-1, 1].map((l) => (
        <group key={l} position={[l * RX * 0.9, 0, 1.4]} rotation={[0, -l * Math.PI / 2 + l * 0.3, 0]}>
          <Cx t={[1.5, 2.6, 0.4]} p={[0, 1.3, 0]} c="#f1ede2" />
          {[0.5, 1.1, 1.7, 2.3].map((y) =>
            Array.from({ length: 6 }).map((_, i) => <Cx key={`${y}${i}`} t={[0.18, 0.4, 0.3]} p={[-0.55 + i * 0.22, y, 0.06]} c={["#8e2a2a", "#2a4a6e", "#c9b27c", "#3a5a3a", "#6e4a2e", "#e9e2d0"][(i + y * 3) % 6 | 0]} />),
          )}
        </group>
      ))}
      {[-2.4, 2.4].map((x) => (
        <group key={x} position={[x, 0, 1.6]}>
          <Cx t={[0.5, 0.6, 0.5]} p={[0, 0.3, 0]} c="#5a2f1c" />
          <Cx t={[0.06, 0.5, 0.06]} p={[0, 0.85, 0]} c="#c9a24a" />
          <mesh position={[0, 1.2, 0]}>
            <cylinderGeometry args={[0.15, 0.25, 0.3, 12]} />
            <meshStandardMaterial color="#f7efd8" emissive="#ffe7b0" emissiveIntensity={0.7} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 5.58, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.2, 1.5, 48]} />
        <meshStandardMaterial color="#e9e4d8" side={THREE.DoubleSide} />
      </mesh>
      <Cx t={[0.3, 0.2, 0.3]} p={[0, 0.55, 0.3]} c="#c9a24a" met={0.5} />
      <Gente r={HOMEM1} pos={[-1.42, 0.02, 0.0]} giroY={Math.PI / 2} acao="conversar" t={s} rosto="aberto" />
      <Gente r={HOMEM2} pos={[1.42, 0.02, 0.6]} giroY={-Math.PI / 2} acao="conversar" t={s} fase={1.3} rosto="aberto" />
      <Gente r={MULHER} pos={[0.9, 0, -3.0]} giroY={-0.4} acao="parado" t={s} rosto="aberto" />
      <pointLight position={[0, 5, 0]} color="#fff6e6" intensity={4} distance={14} decay={1.5} castShadow />
      <ambientLight intensity={0.35} color="#fff4e2" />
    </group>
  );
};

const CAM_FORA: Chave[] = [
  { t: 41.1, pos: [-10, 26, 330], alvo: [0, 12, 0], fov: 72 },
  { t: 42.4, pos: [-30, 20, 280], alvo: [-20, 8, 0], fov: 72 },
  { t: 43.2, pos: [-50, 14, 220], alvo: [90, 60, 1050], fov: 72 },
  { t: 44.0, pos: [-66, 6, 120], alvo: [-75, 4, 9], fov: 72 },
  { t: 45.0, pos: [-75, 3.4, 15.4], alvo: [-75, 3.4, 9], fov: 72 },
];
const CAM_DENTRO: Chave[] = [
  { t: 45.0, pos: [0, 1.85, -1995.6], alvo: [0, 1.1, -2003], fov: 80 },
  { t: 46.5, pos: [0.05, 1.8, -1996.6], alvo: [0.1, 1.0, -2003], fov: 80 },
  { t: 48.6, pos: [0.3, 1.7, -1997.8], alvo: [1.5, 1.1, -1999.4], fov: 80 },
];

export const CenaWashington: React.FC<{ s: number }> = ({ s }) => {
  const dentro = s >= 45.2;
  return (
    <Palco ceu={dentro ? "estudio" : "dia"} luzCeu={dentro ? 0.35 : 0.55} foco={dentro ? 3 : 120} desfoque={0.3} brilho={0.5} saturacao={0.15} contraste={0.1} ao={dentro ? 1.2 : 0} raioAo={0.8}>
      <CamTrajeto ch={dentro ? CAM_DENTRO : CAM_FORA} s={s} balanco={dentro ? 0.6 : 2} />
      {!dentro ? (
        <>
          <hemisphereLight args={["#d6e6ff", "#7f9a5a", 0.7]} />
          <Sol pos={[200, 320, 260]} forca={2.6} area={320} cor="#fff4e2" />
          <fog attach="fog" args={["#dbe5ee", 450, 2600]} />
          <CeuDia />
          <CasaBranca />
          <Arredores s={s} />
          <Ondulacao p={[-75, 3.6, 14.9]} tam={2.6} t={s - 44.85} forca={entre(s, 44.8, 45.0)} />
        </>
      ) : (
        <SalaoOval s={s} />
      )}
    </Palco>
  );
};
