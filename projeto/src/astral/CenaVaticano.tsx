import { useMemo } from "react";
import * as THREE from "three";
import { Sol } from "../cinema/Palco";
import { Instancias } from "./cidade";
import { CeuDia, Cx, entre, Gente, Luzinha, Ondulacao, rnd, texturaCanvas } from "./pecas";
import { CamTrajeto, type Chave, Palco } from "./palco";
import type { V3 } from "./tempo";

// CIDADE DO VATICANO, 15:30: cúpula de São Pedro bem de perto, a praça com a colunata em elipse
// e o obelisco lá embaixo, voo até o pátio da Pinha (nicho gigante com a pinha de bronze), porta
// de cofre que você atravessa e o Arquivo Secreto: estantes deslizantes com volante, caixas e um
// guarda passando.

const texturaCupula = () =>
  texturaCanvas(
    256,
    128,
    (g) => {
      g.fillStyle = "#62748f";
      g.fillRect(0, 0, 256, 128);
      g.fillStyle = "#f1eee6";
      for (let i = 0; i < 16; i++) g.fillRect(i * 16, 0, 3, 128);
      g.fillStyle = "#3a4250";
      for (let i = 0; i < 16; i++) {
        g.fillRect(i * 16 + 8, 30, 4, 5);
        g.fillRect(i * 16 + 8, 70, 4, 5);
      }
    },
    [1, 1],
  );

const Cupula: React.FC<{ p: V3; raio: number; tex: THREE.Texture }> = ({ p, raio, tex }) => {
  const geo = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= 20; i++) {
      const a = (i / 20) * (Math.PI / 2);
      pts.push(new THREE.Vector2(Math.max(0.05, raio * Math.cos(a)), raio * 1.18 * Math.sin(a)));
    }
    return new THREE.LatheGeometry(pts, 48);
  }, [raio]);
  const nervuras = useMemo(
    () =>
      Array.from({ length: 16 }).map((_, k) => {
        const f = (k / 16) * Math.PI * 2;
        const pts: THREE.Vector3[] = [];
        for (let i = 0; i <= 16; i++) {
          const a = (i / 16) * (Math.PI / 2) * 0.93;
          const r = raio * 1.012 * Math.cos(a);
          pts.push(new THREE.Vector3(r * Math.cos(f), raio * 1.18 * 1.012 * Math.sin(a), r * Math.sin(f)));
        }
        return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, raio * 0.028, 5);
      }),
    [raio],
  );
  return (
    <group position={p}>
      {/* tambor com pares de colunas e janelas */}
      <mesh position={[0, -raio * 0.42, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[raio * 1.02, raio * 1.06, raio * 0.85, 48]} />
        <meshStandardMaterial color="#e6dfcf" roughness={0.8} />
      </mesh>
      {Array.from({ length: 16 }).map((_, i) => {
        const a = (i / 16) * Math.PI * 2;
        return (
          <group key={i} rotation={[0, a, 0]}>
            <Cx t={[raio * 0.08, raio * 0.8, raio * 0.12]} p={[raio * 1.1, -raio * 0.42, 0]} c="#efe9db" />
            <Cx t={[raio * 0.05, raio * 0.35, raio * 0.14]} p={[raio * 1.05, -raio * 0.42, raio * 0.2]} c="#2f3540" />
          </group>
        );
      })}
      <mesh geometry={geo} castShadow receiveShadow>
        <meshStandardMaterial map={tex} roughness={0.6} />
      </mesh>
      {nervuras.map((g, i) => (
        <mesh key={i} geometry={g} castShadow>
          <meshStandardMaterial color="#f1ede4" roughness={0.6} />
        </mesh>
      ))}
      {/* lanterna, bola dourada e cruz */}
      <mesh position={[0, raio * 1.3, 0]} castShadow>
        <cylinderGeometry args={[raio * 0.17, raio * 0.2, raio * 0.36, 16]} />
        <meshStandardMaterial color="#ece6d6" roughness={0.7} />
      </mesh>
      <mesh position={[0, raio * 1.52, 0]}>
        <coneGeometry args={[raio * 0.18, raio * 0.2, 16]} />
        <meshStandardMaterial color="#7c8ea6" roughness={0.6} />
      </mesh>
      <mesh position={[0, raio * 1.66, 0]}>
        <sphereGeometry args={[raio * 0.05, 12, 8]} />
        <meshStandardMaterial color="#d8b04a" metalness={0.8} roughness={0.3} />
      </mesh>
      <Cx t={[raio * 0.025, raio * 0.15, raio * 0.025]} p={[0, raio * 1.76, 0]} c="#d8b04a" met={0.8} />
      <Cx t={[raio * 0.09, raio * 0.025, raio * 0.025]} p={[0, raio * 1.79, 0]} c="#d8b04a" met={0.8} />
    </group>
  );
};

const geoPrisma = () => {
  const g = new THREE.CylinderGeometry(0.5, 0.5, 1, 3, 1);
  g.rotateX(-Math.PI / 2);
  g.translate(0, 0.25, 0);
  g.scale(1 / 0.866, 1 / 0.75, 1);
  return g;
};

const Basilica: React.FC = () => {
  const tex = useMemo(texturaCupula, []);
  const prisma = useMemo(geoPrisma, []);
  return (
    <group>
      <Cupula p={[0, 80, 0]} raio={21} tex={tex} />
      {/* cúpulas menores em volta */}
      <Cupula p={[-38, 56, -30]} raio={7} tex={tex} />
      <Cupula p={[38, 56, -30]} raio={7} tex={tex} />
      <Cupula p={[-38, 56, 32]} raio={7} tex={tex} />
      <Cupula p={[38, 56, 32]} raio={7} tex={tex} />
      {/* cruz das naves e a nave longa até a fachada */}
      <Cx t={[140, 46, 50]} p={[0, 23, 0]} c="#ddd5c3" />
      <Cx t={[50, 46, 140]} p={[0, 23, 0]} c="#ddd5c3" />
      <Cx t={[62, 46, 110]} p={[0, 23, 95]} c="#d8cfbc" />
      <mesh position={[0, 46, 95]} scale={[62, 16, 110]} geometry={prisma}>
        <meshStandardMaterial color="#8d8a86" roughness={0.7} />
      </mesh>
      <mesh position={[0, 46, 0]} scale={[50, 14, 140]} geometry={prisma}>
        <meshStandardMaterial color="#8d8a86" roughness={0.7} />
      </mesh>
      <mesh position={[0, 46, 0]} scale={[50, 14, 140]} rotation={[0, Math.PI / 2, 0]} geometry={prisma}>
        <meshStandardMaterial color="#8d8a86" roughness={0.7} />
      </mesh>
      {Array.from({ length: 9 }).map((_, i) => (
        <Cx key={i} t={[4, 6, 0.5]} p={[-40 + i * 10, 34, 156.3]} c="#3a3a3e" />
      ))}
      {Array.from({ length: 9 }).map((_, i) => (
        <Cx key={i} t={[4, 4, 0.5]} p={[-40 + i * 10, 12, 156.3]} c="#2a2a2e" />
      ))}
      <Cx t={[118, 1.5, 9]} p={[0, 48.5, 152]} c="#d9d1bd" />
      {/* fachada com estátuas no alto */}
      <Cx t={[116, 48, 8]} p={[0, 24, 152]} c="#e9e2d0" />
      {Array.from({ length: 13 }).map((_, i) => (
        <Cx key={i} t={[2, 6, 2]} p={[-54 + i * 9, 51, 154]} c="#f2eee4" />
      ))}
      {Array.from({ length: 8 }).map((_, i) => (
        <Cx key={i} t={[3, 30, 3]} p={[-42 + i * 12, 15, 157]} c="#f0eadb" />
      ))}
    </group>
  );
};

// praça: duas colunatas em semicírculo + braços retos, obelisco no meio e gente
const Praca: React.FC = () => {
  const { colunas, gente } = useMemo(() => {
    const colunas: { p: V3; t: V3; r?: number; cor: string }[] = [];
    const cz = 300;
    const rx = 120;
    const rz = 95;
    for (const lado of [-1, 1]) {
      for (let i = 0; i <= 44; i++) {
        const a = -Math.PI / 2 + (i / 44) * Math.PI;
        for (let fila = 0; fila < 4; fila++) {
          const k = 1 + fila * 0.04;
          colunas.push({ p: [lado * Math.cos(a) * rx * k, 8, cz + Math.sin(a) * rz * k], t: [1.6, 16, 1.6], cor: "#efe9db" });
        }
        colunas.push({ p: [lado * Math.cos(a) * rx * 1.06, 17, cz + Math.sin(a) * rz * 1.06], t: [8, 3, 9], r: -a * lado, cor: "#e6dfcd" });
        colunas.push({ p: [lado * Math.cos(a) * rx * 1.06, 20.5, cz + Math.sin(a) * rz * 1.06], t: [1.2, 4, 1.2], cor: "#f4f1ea" });
      }
    }
    const gente: { p: V3; t: V3; cor: string }[] = [];
    for (let i = 0; i < 900; i++) {
      const a = rnd(`pa${i}`) * Math.PI * 2;
      const r = Math.sqrt(rnd(`pr${i}`));
      gente.push({ p: [Math.cos(a) * r * 105, 0.9, cz + Math.sin(a) * r * 82], t: [0.6, 1.8, 0.6], cor: ["#2b2d42", "#e63946", "#f1faee", "#457b9d", "#e9c46a", "#1d3557"][i % 6] });
    }
    return { colunas, gente };
  }, []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.85 }), []);
  const pisoPraca = useMemo(
    () =>
      texturaCanvas(512, 512, (g) => {
        g.fillStyle = "#b9ae9a";
        g.fillRect(0, 0, 512, 512);
        g.strokeStyle = "#e9e2d2";
        g.lineWidth = 6;
        for (let i = 0; i < 16; i++) {
          const a = (i / 16) * Math.PI * 2;
          g.beginPath();
          g.moveTo(256, 256);
          g.lineTo(256 + Math.cos(a) * 256, 256 + Math.sin(a) * 256);
          g.stroke();
        }
        g.fillStyle = "rgba(90,80,70,0.12)";
        for (let i = 0; i < 3000; i++) g.fillRect(rnd(`pq${i}`) * 512, rnd(`pw${i}`) * 512, 3, 3);
      }),
    [],
  );
  return (
    <group>
      <Instancias itens={colunas} material={mat} />
      <Instancias itens={gente} material={mat} sombra={false} />
      <mesh position={[0, 0.25, 300]} rotation={[-Math.PI / 2, 0, 0]} scale={[1.25, 1, 1]}>
        <circleGeometry args={[100, 64]} />
        <meshStandardMaterial map={pisoPraca} roughness={0.85} />
      </mesh>
      <Cx t={[90, 0.4, 120]} p={[0, 0.2, 210]} c="#b6aa96" sombra={false} />
      {/* obelisco e fontes */}
      <mesh position={[0, 13, 300]} castShadow>
        <cylinderGeometry args={[0.9, 1.6, 26, 4]} />
        <meshStandardMaterial color="#c9b896" roughness={0.8} />
      </mesh>
      <Cx t={[5, 3, 5]} p={[0, 1.5, 300]} c="#d8cfbb" />
      {[-40, 40].map((x) => (
        <group key={x} position={[x, 0, 300]}>
          <mesh position={[0, 1.5, 0]}>
            <cylinderGeometry args={[5, 5.5, 3, 20]} />
            <meshStandardMaterial color="#d8cfbb" />
          </mesh>
          <mesh position={[0, 3.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[4.6, 20]} />
            <meshStandardMaterial color="#7fa6b8" roughness={0.1} />
          </mesh>
          <mesh position={[0, 6, 0]}>
            <coneGeometry args={[1.6, 6, 12, 1, true]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.55} emissive="#ffffff" emissiveIntensity={0.3} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// Roma em volta: prédios ocre com telhado de duas águas de terracota, a Via della Conciliazione
// saindo da praça até o Tibre, o Castelo de Santo Ângelo, pontes, cúpulas de igreja espalhadas
// e pinheiros-mansos (copa larga e achatada) nos jardins e parques
const RIO_Z = 980;
const Roma: React.FC = () => {
  const prisma = useMemo(geoPrisma, []);
  const { predios, telhados, cupulas, pinheiros, troncos } = useMemo(() => {
    const predios: { p: V3; t: V3; r?: number; cor: string }[] = [];
    const telhados: { p: V3; t: V3; r?: number; cor: string }[] = [];
    const cupulas: { p: V3; t: V3; cor: string }[] = [];
    const pinheiros: { p: V3; t: V3; cor: string }[] = [];
    const troncos: { p: V3; t: V3; cor: string }[] = [];
    const cores = ["#e3c89b", "#d9b48a", "#e8d7b9", "#cf9f74", "#e6c7a4", "#d7a77d", "#c98a5e", "#e9dcc4"];
    const poe = (x: number, z: number, w: number, d: number, alt: number, r: number, i: number) => {
      predios.push({ p: [x, alt / 2, z], t: [w, alt, d], r, cor: cores[i % cores.length] });
      telhados.push({ p: [x, alt, z], t: [w * 1.02, 3 + rnd(`tl${i}`) * 2, d * 1.02], r, cor: rnd(`tc${i}`) > 0.3 ? "#b55d3a" : "#a8553a" });
    };
    let n = 0;
    for (let i = 0; i < 3400; i++) {
      const x = (rnd(`rx${i}`) - 0.5) * 3200;
      const z = (rnd(`rz${i}`) - 0.5) * 3200;
      if (x > -440 && x < 260 && z > -400 && z < 430) continue; // Vaticano
      if (Math.abs(z - RIO_Z) < 75) continue; // rio
      if (Math.abs(x) < 34 && z > 400 && z < RIO_Z) continue; // avenida
      if (Math.hypot(x - 60, z - (RIO_Z + 110)) < 70) continue; // castelo
      const alt = 13 + rnd(`ra${i}`) * 13;
      const w = 18 + rnd(`rw${i}`) * 24;
      poe(x, z, w, 14 + rnd(`rd${i}`) * 22, alt, rnd(`rr${i}`) > 0.5 ? 0 : 0.15, n++);
    }
    // prédios em fila dos dois lados da Via della Conciliazione
    for (const lado of [-1, 1])
      for (let k = 0; k < 9; k++) poe(lado * 50, 450 + k * 56, 30, 50, 24 + rnd(`vc${lado}${k}`) * 4, 0, n++);
    for (let i = 0; i < 28; i++) {
      const x = (rnd(`cux${i}`) - 0.5) * 2800;
      const z = (rnd(`cuz${i}`) - 0.5) * 2800;
      if (x > -440 && x < 260 && z > -400 && z < 430) continue;
      cupulas.push({ p: [x, 30, z], t: [9 + rnd(`cus${i}`) * 6, 9, 9 + rnd(`cus${i}`) * 6], cor: rnd(`cuc${i}`) > 0.5 ? "#8e9aa6" : "#b8693f" });
    }
    const pinheiro = (x: number, z: number, k: string) => {
      const h = 12 + rnd(`ph${k}`) * 6;
      troncos.push({ p: [x, h / 2, z], t: [0.8, h, 0.8], cor: "#6b4a32" });
      pinheiros.push({ p: [x, h + 1.5, z], t: [9 + rnd(`pw${k}`) * 4, 3.2, 9 + rnd(`pw${k}`) * 4], cor: rnd(`pc${k}`) > 0.5 ? "#3f6a34" : "#4a7a3c" });
    };
    for (let i = 0; i < 90; i++) pinheiro(-320 + rnd(`jx${i}`) * 300, -380 + rnd(`jz${i}`) * 300, `j${i}`);
    for (let i = 0; i < 120; i++) {
      const x = (rnd(`px${i}`) - 0.5) * 2600;
      const z = (rnd(`pz${i}`) - 0.5) * 2600;
      if (x > -440 && x < 260 && z > -400 && z < 430) continue;
      pinheiro(x, z, `p${i}`);
    }
    return { predios, telhados, cupulas, pinheiros, troncos };
  }, []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.9 }), []);
  const meiaEsfera = useMemo(() => new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), []);
  const esfera = useMemo(() => new THREE.SphereGeometry(1, 16, 8), []);
  return (
    <group>
      <Instancias itens={predios} material={mat} />
      <Instancias itens={telhados} material={mat} geo={prisma} />
      <Instancias itens={cupulas} material={mat} geo={meiaEsfera} />
      <Instancias itens={troncos} material={mat} />
      <Instancias itens={pinheiros} material={mat} geo={esfera} />
      <Cx t={[8000, 1, 8000]} p={[0, -0.6, 0]} c="#a89c84" sombra={false} />
      {/* Via della Conciliazione */}
      <Cx t={[64, 0.4, RIO_Z - 420]} p={[0, 0.15, 420 + (RIO_Z - 420) / 2]} c="#9e968a" sombra={false} />
      {/* rio Tibre com as margens e as pontes */}
      <Cx t={[6000, 0.5, 110]} p={[0, 0.1, RIO_Z]} c="#5f7f7a" sombra={false} />
      <Cx t={[6000, 3, 8]} p={[0, 1.5, RIO_Z - 58]} c="#cdbfa6" />
      <Cx t={[6000, 3, 8]} p={[0, 1.5, RIO_Z + 58]} c="#cdbfa6" />
      {[-700, -260, 60, 500, 1000].map((x) => (
        <Cx key={x} t={[14, 3, 124]} p={[x, 4, RIO_Z]} c="#d8cdb6" />
      ))}
      {/* Castelo de Santo Ângelo */}
      <group position={[60, 0, RIO_Z + 110]}>
        <mesh position={[0, 12, 0]} castShadow>
          <cylinderGeometry args={[34, 36, 24, 40]} />
          <meshStandardMaterial color="#c7a982" roughness={0.9} />
        </mesh>
        <mesh position={[0, 30, 0]} castShadow>
          <cylinderGeometry args={[20, 22, 14, 32]} />
          <meshStandardMaterial color="#cdb08a" roughness={0.9} />
        </mesh>
        <Cx t={[16, 12, 16]} p={[0, 43, 0]} c="#d6bb93" />
        <Cx t={[90, 8, 90]} p={[0, 4, 0]} r={[0, Math.PI / 4, 0]} c="#b89c74" />
      </group>
    </group>
  );
};

// Dentro dos muros: as duas alas compridas dos Museus Vaticanos (do palácio até o pátio da Pinha),
// a Biblioteca atravessada no meio, o Palácio Apostólico ao lado da praça, pátios gramados,
// calçamento e a muralha em volta
const MuseusVaticanos: React.FC = () => {
  const prisma = useMemo(geoPrisma, []);
  const { blocos, telhados, janelas } = useMemo(() => {
    const blocos: { p: V3; t: V3; r?: number; cor: string }[] = [];
    const telhados: { p: V3; t: V3; r?: number; cor: string }[] = [];
    const janelas: { p: V3; t: V3; r?: number; cor: string }[] = [];
    const ala = (x0: number, x1: number, z: number, alt: number, larg: number, cor: string) => {
      const c = (x0 + x1) / 2;
      const comp = Math.abs(x1 - x0);
      blocos.push({ p: [c, alt / 2, z], t: [comp, alt, larg], cor });
      telhados.push({ p: [c, alt, z], t: [larg * 1.04, 4, comp], r: Math.PI / 2, cor: "#b55d3a" });
      for (let x = Math.min(x0, x1) + 4; x < Math.max(x0, x1) - 2; x += 6)
        for (let a = 0; a < Math.floor(alt / 6); a++)
          for (const lado of [-1, 1]) janelas.push({ p: [x, 4 + a * 6, z + lado * (larg / 2 + 0.05)], t: [2, 3.2, 0.2], cor: "#3d3a36" });
    };
    ala(-330, -40, -128, 22, 16, "#e2c48e");
    ala(-330, -40, 8, 22, 16, "#e6cc9a");
    // Biblioteca: atravessa o pátio grande no meio
    blocos.push({ p: [-190, 13, -60], t: [18, 26, 136], cor: "#dcbd86" });
    telhados.push({ p: [-190, 26, -60], t: [19, 4, 136], cor: "#b55d3a" });
    // Palácio Apostólico (ao lado direito da praça) e prédios do governo
    blocos.push({ p: [95, 16, 120], t: [60, 32, 50], cor: "#e3c79a" });
    telhados.push({ p: [95, 32, 120], t: [52, 5, 62], r: Math.PI / 2, cor: "#a8553a" });
    blocos.push({ p: [-60, 12, -230], t: [70, 24, 36], cor: "#e8d3a8" });
    telhados.push({ p: [-60, 24, -230], t: [38, 4, 72], r: Math.PI / 2, cor: "#b55d3a" });
    blocos.push({ p: [170, 10, -160], t: [44, 20, 80], cor: "#ddc59a" });
    telhados.push({ p: [170, 20, -160], t: [46, 4, 82], cor: "#a8553a" });
    // casario de dentro dos muros (entre as alas e a basílica) com telhados de terracota
    for (let i = 0; i < 46; i++) {
      const x = -420 + rnd(`vi${i}`) * 340;
      const z = 30 + rnd(`vj${i}`) * 360;
      const w = 16 + rnd(`vw${i}`) * 22;
      const d = 14 + rnd(`vd${i}`) * 18;
      const alt = 12 + rnd(`va${i}`) * 12;
      const cor = ["#e3c89b", "#d9b48a", "#e8d7b9", "#cf9f74", "#e6c7a4"][i % 5];
      blocos.push({ p: [x, alt / 2, z], t: [w, alt, d], cor });
      telhados.push({ p: [x, alt, z], t: [w * 1.03, 3.5, d * 1.03], cor: i % 3 ? "#b55d3a" : "#a8553a" });
    }
    // muralha em volta
    for (const [x, z, w, d] of [
      [-60, -405, 760, 6],
      [-440, 0, 6, 810],
      [255, -60, 6, 690],
    ] as const)
      blocos.push({ p: [x, 6, z], t: [w, 12, d], cor: "#cdb48a" });
    return { blocos, telhados, janelas };
  }, []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.88 }), []);
  return (
    <group>
      {/* chão de dentro dos muros: calçamento claro e pátios gramados */}
      <Cx t={[690, 0.5, 800]} p={[-90, 0.12, 15]} c="#c9bea8" sombra={false} />
      <Cx t={[130, 0.7, 120]} p={[-265, 0.2, -60]} c="#6fa046" sombra={false} />
      <Cx t={[130, 0.7, 120]} p={[-115, 0.2, -60]} c="#78a84c" sombra={false} />
      {[-265, -115].map((x) =>
        [-90, -30].map((z) => (
          <mesh key={`${x}${z}`} position={[x + 30 * (z < -60 ? 1 : -1), 3, z]}>
            <icosahedronGeometry args={[4, 1]} />
            <meshStandardMaterial color="#4f8a3a" roughness={0.9} />
          </mesh>
        )),
      )}
      <Instancias itens={blocos} material={mat} />
      <Instancias itens={telhados} material={mat} geo={prisma} />
      <Instancias itens={janelas} material={mat} sombra={false} />
      {/* pinheiros-mansos espalhados entre o casario */}
      {Array.from({ length: 40 }).map((_, i) => {
        const x = -420 + rnd(`vp${i}`) * 340;
        const z = 30 + rnd(`vq${i}`) * 360;
        return (
          <group key={i} position={[x, 0, z]}>
            <Cx t={[0.8, 13, 0.8]} p={[0, 6.5, 0]} c="#6b4a32" />
            <mesh position={[0, 14.5, 0]} scale={[10, 3, 10]}>
              <sphereGeometry args={[1, 16, 8]} />
              <meshStandardMaterial color={i % 2 ? "#3f6a34" : "#4a7a3c"} roughness={0.9} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

// pátio da Pinha: prédio ocre com o nicho (meia-cúpula) e a pinha de bronze
const PatioPinha: React.FC = () => (
  <group position={[-340, 0, -60]} rotation={[0, Math.PI / 2, 0]}>
    <Cx t={[70, 26, 16]} p={[0, 13, 0]} c="#d9b77a" />
    {/* corpo central aberto em volta do nicho: pilares, parte de cima e o fundo */}
    <Cx t={[3.5, 34, 18]} p={[-10.3, 17, 1]} c="#ddbd84" />
    <Cx t={[3.5, 34, 18]} p={[10.3, 17, 1]} c="#ddbd84" />
    <Cx t={[24, 2, 18]} p={[0, 33.5, 1]} c="#ddbd84" />
    <Cx t={[24, 34, 2]} p={[0, 17, -8]} c="#d4b47a" />
    <Cx t={[26, 3, 19]} p={[0, 35, 1]} c="#efe2c4" />
    {Array.from({ length: 3 }).map((_, i) =>
      [-31, -24, -17, 17, 24, 31].map((x) => <Cx key={`${i}${x}`} t={[3, 4.2, 0.5]} p={[x, 5 + i * 7.5, 8.3]} c="#3d3a36" />),
    )}
    {/* nicho: meio-cilindro cavado com meia-cúpula */}
    <mesh position={[0, 12, 6]} rotation={[0, Math.PI, 0]}>
      <cylinderGeometry args={[8.5, 8.5, 24, 24, 1, true, -Math.PI / 2, Math.PI]} />
      <meshStandardMaterial color="#c9a86c" side={THREE.BackSide} roughness={0.8} />
    </mesh>
    <mesh position={[0, 24, 6]} rotation={[0, Math.PI, 0]}>
      <sphereGeometry args={[8.5, 24, 12, -Math.PI / 2, Math.PI, 0, Math.PI / 2]} />
      <meshStandardMaterial color="#bc9a60" side={THREE.BackSide} roughness={0.8} />
    </mesh>
    {/* pedestal e pinha */}
    <Cx t={[5, 5, 5]} p={[0, 2.5, 10]} c="#e9e2d2" />
    <mesh position={[0, 7.4, 10]} scale={[1, 1.4, 1]} castShadow>
      <icosahedronGeometry args={[2.4, 2]} />
      <meshStandardMaterial color="#5e5a3a" metalness={0.5} roughness={0.5} flatShading />
    </mesh>
    {/* gramado com caminhos em cruz, a "Esfera dentro da Esfera" dourada e estátuas no alto */}
    <Cx t={[90, 0.6, 120]} p={[0, 0.3, 70]} c="#6fa046" sombra={false} />
    <Cx t={[6, 0.7, 120]} p={[0, 0.32, 70]} c="#d9cfb6" sombra={false} />
    <Cx t={[90, 0.7, 6]} p={[0, 0.32, 70]} c="#d9cfb6" sombra={false} />
    <Cx t={[5, 1.2, 5]} p={[0, 0.6, 70]} c="#e9e2d2" />
    <mesh position={[0, 4.2, 70]} castShadow>
      <sphereGeometry args={[3, 32, 24, 0.4, 5.6]} />
      <meshStandardMaterial color="#d6ad4a" metalness={0.85} roughness={0.25} side={THREE.DoubleSide} />
    </mesh>
    <mesh position={[0, 4.2, 70]}>
      <sphereGeometry args={[2.2, 24, 16]} />
      <meshStandardMaterial color="#b88d34" metalness={0.8} roughness={0.35} />
    </mesh>
    {Array.from({ length: 9 }).map((_, i) => (
      <Cx key={i} t={[1.2, 3.2, 1.2]} p={[-32 + i * 8, 27.6, 7]} c="#f1ede4" />
    ))}
    <Cx t={[70, 1.2, 1.4]} p={[0, 26.4, 7.6]} c="#efe6d0" />
    <Cx t={[16, 22, 110]} p={[48, 11, 62]} c="#e7e3da" />
    {Array.from({ length: 10 }).map((_, i) => (
      <Cx key={i} t={[0.5, 4, 3]} p={[39.7, 9, 14 + i * 10]} c="#3d3a36" />
    ))}
    {[-28, 28].map((x) =>
      [30, 60, 90].map((z) => (
        <mesh key={`${x}${z}`} position={[x, 3, z]} castShadow>
          <icosahedronGeometry args={[2.6, 1]} />
          <meshStandardMaterial color="#4f8a3a" roughness={0.9} />
        </mesh>
      )),
    )}
  </group>
);

// porta do cofre (aparece entre 31,4 e 32,3 s)
const PortaCofre: React.FC<{ s: number }> = ({ s }) => {
  const placa = useMemo(
    () =>
      texturaCanvas(512, 84, (g) => {
        g.fillStyle = "#8a6a2e";
        g.fillRect(0, 0, 512, 84);
        g.strokeStyle = "#d9b45a";
        g.lineWidth = 4;
        g.strokeRect(6, 6, 500, 72);
        g.fillStyle = "#f1d58a";
        g.font = "bold 30px serif";
        g.textAlign = "center";
        g.fillText("ARCHIVVM APOSTOLICVM VATICANVM", 256, 54);
      }),
    [],
  );
  const pedra = useMemo(
    () =>
      texturaCanvas(
        256,
        256,
        (g) => {
          g.fillStyle = "#77736c";
          g.fillRect(0, 0, 256, 256);
          for (let y = 0; y < 4; y++)
            for (let x = 0; x < 3; x++) {
              g.fillStyle = `rgb(${120 + ((x + y) % 3) * 8},${116 + ((x + y) % 3) * 8},${108 + ((x * y) % 3) * 8})`;
              g.fillRect(x * 86 + (y % 2) * 40 + 2, y * 64 + 2, 82, 60);
            }
        },
        [3, 3],
      ),
    [],
  );
  return (
    <group position={[0, 0, -400]}>
      <mesh position={[0, 2, -0.05]}>
        <planeGeometry args={[10, 8]} />
        <meshStandardMaterial map={pedra} roughness={0.95} />
      </mesh>
      <Cx t={[2.3, 2.9, 0.12]} p={[0, 1.5, 0]} c="#2c3b44" met={0.3} rug={0.5} />
      <Cx t={[1.95, 2.55, 0.1]} p={[0, 1.5, 0.06]} c="#9fb2b8" met={0.4} rug={0.4} />
      <mesh position={[0, 1.5, 0.13]}>
        <torusGeometry args={[0.42, 0.04, 8, 32]} />
        <meshStandardMaterial color="#141618" metalness={0.5} roughness={0.4} />
      </mesh>
      {[0, Math.PI / 2].map((a) => (
        <Cx key={a} t={[0.86, 0.05, 0.05]} p={[0, 1.5, 0.13]} r={[0, 0, a + Math.PI / 4]} c="#141618" />
      ))}
      <Cx t={[0.14, 0.14, 0.08]} p={[0, 1.5, 0.15]} c="#141618" />
      <Cx t={[0.14, 0.14, 0.05]} p={[0.8, 2.2, 0.1]} c="#141618" />
      <Cx t={[0.14, 0.14, 0.05]} p={[0.8, 0.8, 0.1]} c="#141618" />
      {/* teclado com luz vermelha */}
      <group position={[-1.6, 1.6, 0.03]}>
        <Cx t={[0.32, 0.45, 0.05]} c="#1e2124" />
        <mesh position={[0, 0.15, 0.03]}>
          <boxGeometry args={[0.2, 0.06, 0.01]} />
          <meshBasicMaterial color={new THREE.Color("#ff2a2a").multiplyScalar(2)} toneMapped={false} />
        </mesh>
        {Array.from({ length: 9 }).map((_, i) => (
          <Cx key={i} t={[0.06, 0.05, 0.01]} p={[-0.08 + (i % 3) * 0.08, 0.03 - Math.floor(i / 3) * 0.08, 0.03]} c="#cfd3d6" />
        ))}
      </group>
      {/* placa de bronze em cima da porta e luminárias de parede */}
      <mesh position={[0, 3.35, 0.06]}>
        <planeGeometry args={[2.6, 0.42]} />
        <meshStandardMaterial map={placa} metalness={0.6} roughness={0.35} />
      </mesh>
      {[-1.9, 1.9].map((x) => (
        <group key={x} position={[x, 2.7, 0.15]}>
          <Cx t={[0.18, 0.3, 0.12]} c="#3a3226" />
          <Luzinha p={[0, 0.05, 0.08]} tam={0.06} cor="#ffd9a0" forca={3} />
        </group>
      ))}
      <Ondulacao p={[0, 1.55, 0.2]} tam={1.4} t={s - 31.45} forca={entre(s, 31.4, 31.6)} />
      <pointLight position={[0, 2.5, 2]} color="#fff4e2" intensity={2} distance={8} />
      <pointLight position={[-1.9, 2.6, 0.6]} color="#ffcf8a" intensity={1.2} distance={4} />
      <pointLight position={[1.9, 2.6, 0.6]} color="#ffcf8a" intensity={1.2} distance={4} />
    </group>
  );
};

// Arquivo Secreto: corredor de estantes cheias de caixas e, na transversal, estantes deslizantes
const Arquivo: React.FC<{ s: number }> = ({ s }) => {
  const prat = useMemo(
    () =>
      texturaCanvas(256, 256, (g) => {
        g.fillStyle = "#e4e2dc";
        g.fillRect(0, 0, 256, 256);
        for (let y = 0; y < 5; y++) {
          g.fillStyle = "#c9ccd0";
          g.fillRect(0, y * 51 + 46, 256, 5);
          let x = 0;
          let i = 0;
          while (x < 256) {
            const w = 12 + Math.floor(rnd(`ar${y}${i}`) * 30);
            const r = rnd(`ac${y}${i}`);
            g.fillStyle = r > 0.92 ? "#8e2a2a" : r > 0.82 ? "#7a5a3c" : r > 0.5 ? "#efeadf" : "#ddd3c0";
            g.fillRect(x + 1, y * 51 + 6, w - 2, 40);
            g.fillStyle = "rgba(0,0,0,0.12)";
            g.fillRect(x + w / 2 - 3, y * 51 + 20, 6, 8);
            x += w;
            i++;
          }
        }
      }, [8, 1]),
    [],
  );
  const GUARDA = { pele: "#d9a37a", cabelo: "#5a5a5e", camisa: "#1d2433", calca: "#1d2433", sapato: "#111", penteado: "lateral" as const, terno: true, gravata: "#1d2433" };
  return (
    <group position={[0, 0, -600]}>
      <Cx t={[3, 0.05, 30]} p={[0, -0.02, -6]} c="#5f8b8f" rug={0.5} />
      <Cx t={[3, 0.05, 30]} p={[0, 3.2, -6]} c="#1f2226" />
      {/* calhas de luz fria no teto, ao longo do corredor */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} position={[0, 3.12, -i * 4]}>
          <boxGeometry args={[0.25, 0.05, 1.6]} />
          <meshBasicMaterial color={new THREE.Color("#f4f8ff").multiplyScalar(2.2)} toneMapped={false} />
        </mesh>
      ))}
      {[-1, 1].map((l) => (
        <group key={l}>
          <mesh position={[l * 1.05, 1.5, -10]} rotation={[0, -l * Math.PI / 2, 0]}>
            <planeGeometry args={[22, 3]} />
            <meshStandardMaterial map={prat} roughness={0.9} />
          </mesh>
          <Cx t={[0.4, 3.1, 22]} p={[l * 1.3, 1.55, -10]} c="#cfd2d4" />
        </group>
      ))}
      <Cx t={[3, 3.2, 0.2]} p={[0, 1.6, -21]} c="#d5d9dd" e="#ffffff" ei={0.2} />
      {/* estantes deslizantes (ponta com painel cinza e volante de 3 raios), à direita */}
      {Array.from({ length: 5 }).map((_, i) => (
        <group key={i} position={[1.6 + i * 1.1, 0, 1.2]}>
          <Cx t={[0.95, 2.9, 0.2]} p={[0, 1.45, 0]} c="#c7cbcf" rug={0.5} />
          <Cx t={[0.2, 0.15, 0.02]} p={[0, 2.3, 0.11]} c="#f2f2f2" />
          <group position={[0, 1.2, 0.14]}>
            <mesh>
              <torusGeometry args={[0.22, 0.025, 8, 24]} />
              <meshStandardMaterial color="#141618" />
            </mesh>
            {[0, 1, 2].map((k) => (
              <Cx key={k} t={[0.22, 0.03, 0.03]} p={[Math.cos((k * 2 * Math.PI) / 3) * 0.11, Math.sin((k * 2 * Math.PI) / 3) * 0.11, 0]} r={[0, 0, (k * 2 * Math.PI) / 3]} c="#141618" />
            ))}
          </group>
        </group>
      ))}
      {/* guarda de terno passando (atravessa você) */}
      <Gente r={GUARDA} pos={[3.2 - (s - 33.0) * 1.5, 0, 0.6]} giroY={-Math.PI / 2} acao="andar" t={s} rosto="serio" />
      <pointLight position={[0, 2.9, -2]} color="#f4f7ff" intensity={2.5} distance={12} />
      <pointLight position={[2, 2.9, 1]} color="#f4f7ff" intensity={1.5} distance={8} />
    </group>
  );
};

const CAM_AR: Chave[] = [
  { t: 27.1, pos: [62, 112, 42], alvo: [0, 104, -2], fov: 72 },
  { t: 28.4, pos: [48, 128, 70], alvo: [0, 92, 30], fov: 72 },
  { t: 29.4, pos: [10, 105, 150], alvo: [0, 0, 300], fov: 72 },
  { t: 30.3, pos: [-80, 70, 70], alvo: [-320, 20, -50], fov: 72 },
  { t: 31.4, pos: [-260, 16, -58], alvo: [-340, 14, -60], fov: 72 },
];
const CAM_COFRE: Chave[] = [
  { t: 31.4, pos: [0, 1.6, -397.6], alvo: [0, 1.55, -400], fov: 72 },
  { t: 32.32, pos: [0, 1.6, -400.1], alvo: [0, 1.55, -402], fov: 72 },
];
const CAM_ARQUIVO: Chave[] = [
  { t: 32.32, pos: [0, 1.6, -596], alvo: [0, 1.5, -620], fov: 72 },
  { t: 33.2, pos: [0, 1.6, -599.2], alvo: [0, 1.5, -620], fov: 72 },
  { t: 33.75, pos: [0.1, 1.6, -599.4], alvo: [3, 1.5, -598.8], fov: 72 },
  { t: 34.1, pos: [0.15, 1.6, -599.5], alvo: [3, 1.5, -598.8], fov: 72 },
];

export const CenaVaticano: React.FC<{ s: number }> = ({ s }) => {
  const fase = s < 31.4 ? "ar" : s < 32.32 ? "cofre" : "arquivo";
  return (
    <Palco ceu="dia" luzCeu={0.38} foco={fase === "ar" ? 120 : 3} desfoque={0.3} brilho={0.45} saturacao={0.2} contraste={0.16} ao={fase === "ar" ? 0 : 1} raioAo={0.8}>
      <CamTrajeto ch={fase === "ar" ? CAM_AR : fase === "cofre" ? CAM_COFRE : CAM_ARQUIVO} s={s} balanco={fase === "ar" ? 2 : 0.6} />
      <hemisphereLight args={["#d6e6ff", "#a8987c", fase === "ar" ? 0.45 : 0.35]} />
      {fase === "ar" && (
        <>
          <Sol pos={[260, 300, 200]} forca={1.6} area={420} cor="#fff1da" />
          <fog attach="fog" args={["#d7e1ea", 450, 2600]} />
          <CeuDia topo="#4f86d4" />
          <Basilica />
          <Praca />
          <Roma />
          <PatioPinha />
          <MuseusVaticanos />
        </>
      )}
      {fase === "cofre" && <PortaCofre s={s} />}
      {fase === "arquivo" && <Arquivo s={s} />}
    </Palco>
  );
};
