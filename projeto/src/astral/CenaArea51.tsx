import { useMemo } from "react";
import * as THREE from "three";
import { Sol } from "../cinema/Palco";
import { Instancias } from "./cidade";
import { CeuDia, Cx, Gente, Luzinha, rnd, type Roupa, texturaCanvas } from "./pecas";
import { CamTrajeto, type Chave, Palco } from "./palco";
import type { V3 } from "./tempo";

// ÁREA 51, 7:30 (Nevada): estrada reta no deserto, placa de "ÁREA RESTRITA", morro com a
// caminhonete da guarda, a base com hangares e pista, a parede do hangar que você atravessa e,
// lá dentro, discos voadores, aliens em tubos de vidro e cientistas. Depois: "mais alto".

const texturaPlaca = () =>
  texturaCanvas(512, 340, (g) => {
    g.fillStyle = "#f4f1ea";
    g.fillRect(0, 0, 512, 340);
    g.fillStyle = "#c4161c";
    g.fillRect(0, 0, 512, 72);
    g.fillStyle = "#ffffff";
    g.font = "bold 50px serif";
    g.textAlign = "center";
    g.fillText("ATENÇÃO", 256, 54);
    g.fillStyle = "#222";
    g.font = "bold 40px serif";
    g.fillText("ÁREA RESTRITA", 256, 120);
    g.fillStyle = "#333";
    for (let i = 0; i < 4; i++) g.fillRect(60, 150 + i * 26, 392 - (i % 2) * 70, 9);
    g.fillStyle = "#c4161c";
    g.font = "bold 26px serif";
    g.fillText("USO DE FORÇA LETAL", 256, 276);
    g.fillText("AUTORIZADO", 256, 308);
  });

const Deserto: React.FC = () => {
  const placa = useMemo(texturaPlaca, []);
  const { arbustos, base } = useMemo(() => {
    const arbustos: { p: V3; t: V3; cor: string }[] = [];
    for (let i = 0; i < 500; i++) {
      const x = (rnd(`ax${i}`) - 0.5) * 900;
      const z = 40 - rnd(`az${i}`) * 900;
      if (Math.abs(x) < 8) continue;
      const t = 0.6 + rnd(`at${i}`) * 1.2;
      arbustos.push({ p: [x, t * 0.4, z], t: [t, t * 0.8, t], cor: rnd(`ac${i}`) > 0.5 ? "#6f7a4a" : "#7d7a52" });
    }
    const base: { p: V3; t: V3; r?: number; cor: string }[] = [];
    for (let i = 0; i < 70; i++) {
      const x = -260 + (i % 10) * 52 + rnd(`bx${i}`) * 10;
      const z = -520 - Math.floor(i / 10) * 48 + rnd(`bz${i}`) * 8;
      const a = 6 + rnd(`ba${i}`) * 12;
      base.push({ p: [x, a / 2, z], t: [26 + rnd(`bw${i}`) * 22, a, 18 + rnd(`bd${i}`) * 14], cor: ["#d9d4c8", "#c7c1b2", "#e6e2d8", "#b9b3a4"][i % 4] });
    }
    return { arbustos, base };
  }, []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.95 }), []);
  const bolinha = useMemo(() => new THREE.IcosahedronGeometry(1, 1), []);
  const chao = useMemo(
    () =>
      texturaCanvas(
        256,
        256,
        (g) => {
          g.fillStyle = "#b09a74";
          g.fillRect(0, 0, 256, 256);
          for (let i = 0; i < 3500; i++) {
            const r = rnd(`dz${i}`);
            g.fillStyle = r > 0.7 ? "rgba(90,70,45,0.18)" : r > 0.4 ? "rgba(220,205,170,0.16)" : "rgba(120,110,80,0.12)";
            g.fillRect(rnd(`dx${i}`) * 256, rnd(`dy${i}`) * 256, 2 + rnd(`dw${i}`) * 5, 2);
          }
        },
        [300, 300],
      ),
    [],
  );
  // árvores-de-josué: tronco, dois ou três braços e tufos espinhosos nas pontas
  const { josue, tufos } = useMemo(() => {
    const josue: { p: V3; t: V3; r?: number; cor: string }[] = [];
    const tufos: { p: V3; t: V3; cor: string }[] = [];
    for (let i = 0; i < 160; i++) {
      const x = (rnd(`jx${i}`) > 0.5 ? 1 : -1) * (12 + rnd(`jd${i}`) * 260);
      const z = 30 - rnd(`jz${i}`) * 520;
      const h = 3 + rnd(`jh${i}`) * 3;
      josue.push({ p: [x, h / 2, z], t: [0.45, h, 0.45], cor: "#6e5a44" });
      for (let b = 0; b < 2 + (i % 2); b++) {
        const a = rnd(`ja${i}${b}`) * 6.28;
        const bx = x + Math.cos(a) * 0.9;
        const bz = z + Math.sin(a) * 0.9;
        josue.push({ p: [bx, h * 0.85, bz], t: [0.3, 1.6, 0.3], r: a, cor: "#6e5a44" });
        tufos.push({ p: [bx, h * 0.85 + 1.0, bz], t: [0.7, 0.8, 0.7], cor: "#55663c" });
      }
      tufos.push({ p: [x, h + 0.4, z], t: [0.8, 0.9, 0.8], cor: "#5b6c40" });
    }
    return { josue, tufos };
  }, []);
  return (
    <group>
      <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[12000, 12000]} />
        <meshStandardMaterial map={chao} roughness={1} />
      </mesh>
      {/* balizas brancas com refletor vermelho na beira da estrada */}
      {Array.from({ length: 60 }).map((_, i) =>
        [-5, 5].map((x) => (
          <group key={`${i}${x}`} position={[x, 0, 20 - i * 20]}>
            <Cx t={[0.12, 1.1, 0.12]} p={[0, 0.55, 0]} c="#f2f2f2" sombra={false} />
            <Cx t={[0.13, 0.15, 0.13]} p={[0, 0.95, 0]} c="#d62828" sombra={false} />
          </group>
        )),
      )}
      <Instancias itens={josue} material={mat} />
      <Instancias itens={tufos} material={mat} geo={bolinha} />
      {/* serras em volta (bem longe) */}
      {Array.from({ length: 26 }).map((_, i) => {
        const a = (i / 26) * Math.PI * 2;
        const d = 2600 + rnd(`sd${i}`) * 600;
        return (
          <mesh key={i} position={[Math.cos(a) * d, 0, Math.sin(a) * d]} scale={[700 + rnd(`sw${i}`) * 500, 120 + rnd(`sh${i}`) * 140, 400]} rotation={[0, -a, 0]}>
            <sphereGeometry args={[1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#9a8a78" roughness={1} />
          </mesh>
        );
      })}
      {/* estrada com faixa amarela tracejada */}
      <Cx t={[7.5, 0.1, 1200]} p={[0, 0.02, -480]} c="#2d3036" sombra={false} />
      {Array.from({ length: 120 }).map((_, i) => (
        <Cx key={i} t={[0.18, 0.02, 3]} p={[0, 0.08, 30 - i * 10]} c="#e2b62a" sombra={false} />
      ))}
      <Instancias itens={arbustos} material={mat} />
      {/* placa */}
      <group position={[6.2, 0, -64]} rotation={[0, -0.15, 0]}>
        {[-1.2, 1.2].map((x) => (
          <Cx key={x} t={[0.14, 2.6, 0.14]} p={[x, 1.3, 0]} c="#4a4a4a" />
        ))}
        <mesh position={[0, 2.6, 0.08]}>
          <planeGeometry args={[3, 2]} />
          <meshStandardMaterial map={placa} roughness={0.7} />
        </mesh>
        <Cx t={[3.05, 2.05, 0.06]} p={[0, 2.6, 0.04]} c="#dcd8cf" />
      </group>
      {/* morro com a caminhonete branca da guarda */}
      <mesh position={[-64, 0, -150]} scale={[40, 16, 34]}>
        <sphereGeometry args={[1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#b89a6c" roughness={1} />
      </mesh>
      <group position={[-64, 15.6, -150]} rotation={[0, 0.4, 0]}>
        <Cx t={[2.1, 1.0, 5]} p={[0, 0.8, 0]} c="#f1f1ee" />
        <Cx t={[2.0, 0.8, 2.2]} p={[0, 1.6, 0.6]} c="#f1f1ee" />
        <Cx t={[1.9, 0.6, 0.1]} p={[0, 1.6, 1.72]} c="#30353c" />
      </group>
      {/* a base: prédios, hangares de teto curvo e pista */}
      <Instancias itens={base} material={mat} />
      <Cx t={[60, 0.2, 2200]} p={[340, 0.1, -900]} c="#8e8a84" sombra={false} />
      {[-120, -40, 40].map((x, i) => (
        <group key={i} position={[x, 0, -420]}>
          <Cx t={[56, 12, 40]} p={[0, 6, 0]} c="#d6c7a8" />
          <mesh position={[0, 12, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[28, 28, 40, 24, 1, false, -Math.PI / 2, Math.PI / 4]} />
            <meshStandardMaterial color="#cdbd9c" side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
      <group position={[150, 0, -470]}>
        <mesh position={[0, 14, 0]} castShadow>
          <sphereGeometry args={[12, 24, 16]} />
          <meshStandardMaterial color="#f1f1ee" roughness={0.6} />
        </mesh>
        <Cx t={[14, 6, 14]} p={[0, 3, 0]} c="#d9d4c8" />
        <Cx t={[8, 30, 8]} p={[60, 15, 30]} c="#cfc8b8" />
        <Cx t={[14, 6, 14]} p={[60, 33, 30]} c="#3f5a6e" />
        {[0, 1, 2].map((i) => (
          <group key={i} position={[-40 - i * 26, 0, 40]} rotation={[0, 0.6, 0]}>
            <Cx t={[1, 8, 1]} p={[0, 4, 0]} c="#bfbfbf" />
            <mesh position={[0, 10, 0]} rotation={[0.9, 0, 0]}>
              <cylinderGeometry args={[6, 0.5, 2, 24, 1, true]} />
              <meshStandardMaterial color="#f2f2f0" side={THREE.DoubleSide} />
            </mesh>
          </group>
        ))}
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[120 + i * 14, 5, -40]}>
            <cylinderGeometry args={[6, 6, 10, 20]} />
            <meshStandardMaterial color="#e9e6df" />
          </mesh>
        ))}
      </group>
      {[0, 1, 2, 3, 4].map((i) => (
        <group key={i} position={[300 + (i % 2) * 22, 0.8, -560 - i * 40]} rotation={[0, Math.PI / 2, 0]}>
          <Cx t={[2.2, 2, 18]} p={[0, 1, 0]} c="#7d838b" />
          <Cx t={[14, 0.3, 5]} p={[0, 1.2, -1]} c="#6f757d" />
          <Cx t={[5, 0.3, 2.4]} p={[0, 1.6, -8]} c="#6f757d" />
          <Cx t={[0.3, 3.4, 2.6]} p={[0, 3, -8]} c="#6f757d" />
        </group>
      ))}
      {Array.from({ length: 24 }).map((_, i) => (
        <Cx key={i} t={[1.2, 0.05, 12]} p={[340, 0.22, -300 - i * 40]} c="#f1f1ee" sombra={false} />
      ))}
      {/* parede de chapa do hangar onde você entra */}
      <group position={[0, 0, -398]}>
        {Array.from({ length: 40 }).map((_, i) => (
          <Cx key={i} t={[56, 0.28, 0.25]} p={[-40, 0.3 + i * 0.3, 18]} c={i % 2 ? "#cdb78f" : "#c2ab83"} sombra={false} />
        ))}
      </group>
    </group>
  );
};

const Disco: React.FC<{ p: V3; r: number; giro?: number; cor?: string; luz?: string }> = ({ p, r, giro = 0, cor = "#c9ced6", luz = "#7ff0ff" }) => (
  <group position={p} rotation={[0, giro, 0]}>
    <mesh scale={[1, 0.18, 1]} castShadow>
      <sphereGeometry args={[r, 32, 16]} />
      <meshStandardMaterial color={cor} metalness={0.7} roughness={0.25} />
    </mesh>
    <mesh position={[0, r * 0.12, 0]} scale={[1, 0.7, 1]}>
      <sphereGeometry args={[r * 0.38, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshStandardMaterial color="#9fb2c4" metalness={0.4} roughness={0.15} transparent opacity={0.85} />
    </mesh>
    {Array.from({ length: 14 }).map((_, i) => {
      const a = (i / 14) * Math.PI * 2;
      return <Luzinha key={i} p={[Math.cos(a) * r * 0.93, -r * 0.02, Math.sin(a) * r * 0.93]} tam={r * 0.03} cor={luz} forca={2} />;
    })}
  </group>
);

const Alien: React.FC<{ p: V3; giroY?: number; escala?: number; s: number }> = ({ p, giroY = 0, escala = 1, s }) => (
  <group position={p} rotation={[0, giroY, 0]} scale={escala}>
    <Cx t={[0.1, 0.55, 0.1]} p={[-0.08, 0.27, 0]} c="#9aa3a8" />
    <Cx t={[0.1, 0.55, 0.1]} p={[0.08, 0.27, 0]} c="#9aa3a8" />
    <Cx t={[0.3, 0.45, 0.18]} p={[0, 0.75, 0]} c="#a3abb0" />
    <Cx t={[0.07, 0.5, 0.07]} p={[-0.2, 0.65, 0]} r={[0, 0, 0.15 + Math.sin(s * 2) * 0.05]} c="#9aa3a8" />
    <Cx t={[0.07, 0.5, 0.07]} p={[0.2, 0.65, 0]} r={[0, 0, -0.15]} c="#9aa3a8" />
    <group position={[0, 1.22, 0]}>
      <Cx t={[0.44, 0.48, 0.4]} c="#b0b8bd" />
      <Cx t={[0.12, 0.17, 0.02]} p={[-0.1, 0.0, 0.205]} r={[0, 0, 0.35]} c="#0b0c0e" rug={0.1} />
      <Cx t={[0.12, 0.17, 0.02]} p={[0.1, 0.0, 0.205]} r={[0, 0, -0.35]} c="#0b0c0e" rug={0.1} />
    </group>
  </group>
);

const TuboVidro: React.FC<{ p: V3; s: number }> = ({ p, s }) => (
  <group position={p}>
    <Cx t={[1.6, 0.35, 1.6]} p={[0, 0.17, 0]} c="#2a2d33" />
    <Cx t={[1.6, 0.25, 1.6]} p={[0, 3.3, 0]} c="#2a2d33" />
    <Cx t={[0.2, 2.2, 0.2]} p={[0, 4.5, 0]} c="#1c1e22" />
    <mesh position={[0, 1.75, 0]}>
      <boxGeometry args={[1.5, 2.8, 1.5]} />
      <meshStandardMaterial color="#c9e9ff" transparent opacity={0.18} roughness={0.05} metalness={0.2} depthWrite={false} />
    </mesh>
    <Alien p={[0, 0.4, 0]} s={s} escala={1.1} />
    {Array.from({ length: 10 }).map((_, i) => (
      <Luzinha key={i} p={[(rnd(`tb${i}${p[0]}`) - 0.5) * 1.2, 0.5 + ((rnd(`ty${i}`) + s * 0.2) % 1) * 2.6, (rnd(`tz${i}${p[0]}`) - 0.5) * 1.2]} tam={0.02} cor="#ffd27a" forca={2.5} />
    ))}
    <pointLight position={[0, 2, 0]} color="#bfe4ff" intensity={1.2} distance={4} />
  </group>
);

const Hangar: React.FC<{ s: number }> = ({ s }) => {
  const CIENTISTA: Roupa = { pele: "#e8b98f", cabelo: "#3b2416", camisa: "#f2f3f5", calca: "#f2f3f5", sapato: "#dfe3e8", penteado: "careca" };
  return (
    <group position={[0, 0, -1500]}>
      <Cx t={[60, 0.1, 80]} p={[0, -0.05, 0]} c="#8c8f93" rug={0.6} />
      <Cx t={[0.3, 0.02, 50]} p={[0, 0.02, -10]} c="#e2b62a" sombra={false} />
      <Cx t={[24, 0.02, 0.3]} p={[-2, 0.02, -4]} c="#e2b62a" sombra={false} />
      {/* paredes bege e teto escuro com luminárias */}
      <Cx t={[60, 16, 0.4]} p={[0, 8, -35]} c="#d8cdb6" />
      <Cx t={[0.4, 16, 50]} p={[-26, 8, -10]} c="#d0c4ab" />
      <Cx t={[0.4, 16, 50]} p={[26, 8, -10]} c="#d0c4ab" />
      <Cx t={[60, 0.4, 50]} p={[0, 16, -10]} c="#4a4234" />
      <Cx t={[60, 0.5, 0.6]} p={[0, 13.5, -14]} c="#e2b62a" />
      {Array.from({ length: 18 }).map((_, i) => (
        <mesh key={i} position={[-20 + (i % 6) * 8, 15.75, -28 + Math.floor(i / 6) * 12]}>
          <boxGeometry args={[0.8, 0.1, 0.8]} />
          <meshBasicMaterial color={new THREE.Color("#ffffff").multiplyScalar(2.5)} toneMapped={false} />
        </mesh>
      ))}
      {/* disco no cavalete amarelo (esq.), domo escuro com borda ciano (meio), disco pendurado */}
      <Disco p={[-14, 3.2, -6]} r={7} giro={0.3} />
      {[-1, 1].map((l) => (
        <Cx key={l} t={[0.6, 2.4, 0.6]} p={[-14 + l * 3, 1.2, -6]} c="#e2b62a" />
      ))}
      <mesh position={[0, 0, -18]} scale={[1, 0.38, 1]}>
        <sphereGeometry args={[7.5, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#38433f" metalness={0.5} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.25, -18]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[7.4, 7.7, 64]} />
        <meshBasicMaterial color={new THREE.Color("#8ff6ff").multiplyScalar(2.2)} toneMapped={false} />
      </mesh>
      <Disco p={[8, 9.5, -14]} r={4.5} giro={s * 0.3} cor="#b8bec7" luz="#ffffff" />
      {[-2, 0, 2].map((dx, i) => (
        <Cx key={i} t={[0.04, 6, 0.04]} p={[8 + dx, 12.8, -14]} c="#111" />
      ))}
      <TuboVidro p={[10, 0, -2]} s={s} />
      {[
        [-20, -14],
        [-20, -16.4],
        [-17.6, -14],
        [-20, -14],
        [18, -24],
        [20.4, -24],
      ].map(([x, z], i) => (
        <Cx key={i} t={[2.2, 2.2, 2.2]} p={[x, 1.1 + (i === 3 ? 2.2 : 0), z]} c={i % 2 ? "#8a6a42" : "#7a5c38"} />
      ))}
      <group position={[-6, 0, 6]} rotation={[0, 0.8, 0]}>
        <Cx t={[1.6, 1.4, 2.6]} p={[0, 1, 0]} c="#e2b62a" />
        <Cx t={[1.4, 1.2, 1.2]} p={[0, 2.3, -0.4]} c="#2b2d33" />
        <Cx t={[0.15, 3.2, 0.15]} p={[-0.5, 1.6, 1.4]} c="#2b2d33" />
        <Cx t={[0.15, 3.2, 0.15]} p={[0.5, 1.6, 1.4]} c="#2b2d33" />
        <Cx t={[1.2, 0.1, 1.4]} p={[0, 0.4, 2.1]} c="#2b2d33" />
      </group>
      {[0, 1, 2].map((i) => (
        <group key={i} position={[18 + i * 2.8, 0, 6]} rotation={[0, -Math.PI / 2, 0]}>
          <Cx t={[2.4, 0.08, 1.0]} p={[0, 0.85, 0]} c="#d9dde2" />
          <Cx t={[0.08, 0.85, 0.9]} p={[-1.1, 0.42, 0]} c="#9aa1a8" />
          <Cx t={[0.08, 0.85, 0.9]} p={[1.1, 0.42, 0]} c="#9aa1a8" />
          {[-0.6, 0.6].map((x) => (
            <group key={x} position={[x, 1.2, -0.2]}>
              <Cx t={[0.8, 0.5, 0.05]} c="#16181c" />
              <mesh position={[0, 0, 0.03]}>
                <planeGeometry args={[0.72, 0.42]} />
                <meshBasicMaterial color={new THREE.Color(x < 0 ? "#3ad7ff" : "#7dff9a").multiplyScalar(1.4)} toneMapped={false} />
              </mesh>
            </group>
          ))}
        </group>
      ))}
      {Array.from({ length: 30 }).map((_, i) => (
        <Cx key={i} t={[0.9, 0.02, 0.35]} p={[-18 + i * 1.2, 0.03, 3]} r={[0, 0.5, 0]} c={i % 2 ? "#e2b62a" : "#1c1c1c"} sombra={false} />
      ))}
      <group position={[16, 0, -8]} rotation={[0, -0.6, 0]}>
        <Cx t={[2.0, 1.0, 4.0]} p={[0, 0.9, 0]} c="#4b5a3a" />
        <Cx t={[1.9, 0.9, 1.6]} p={[0, 1.8, -0.4]} c="#4b5a3a" />
        {[
          [-1, 1.3],
          [1, 1.3],
          [-1, -1.3],
          [1, -1.3],
        ].map(([x, z], i) => (
          <Cx key={i} t={[0.3, 0.8, 0.8]} p={[x, 0.4, z]} c="#111" />
        ))}
      </group>
      <TuboVidro p={[13, 0, -6]} s={s} />
      <Alien p={[3, 0, -10]} giroY={-0.4} s={s} />
      <Gente r={CIENTISTA} pos={[-11, 0, 0]} giroY={0.6} acao="parado" t={s} escala={0.95} />
      <Gente r={CIENTISTA} pos={[-6 + Math.sin(s * 0.4) * 2, 0, -24]} giroY={1.2} acao="andar" t={s} escala={0.95} />
      {/* luminária de teto que você passa ao subir */}
      <group position={[0.5, 12.3, 3]}>
        <mesh>
          <cylinderGeometry args={[0.8, 1.3, 1.2, 16, 1, true]} />
          <meshStandardMaterial color="#b9c0c6" side={THREE.DoubleSide} />
        </mesh>
        <Cx t={[0.05, 3.5, 0.05]} p={[0, 2.3, 0]} c="#111" />
      </group>
      <pointLight position={[0, 12, -10]} color="#ffffff" intensity={3} distance={50} decay={1.2} />
      <ambientLight intensity={0.4} color="#f2f0ea" />
    </group>
  );
};

const CAM_FORA: Chave[] = [
  { t: 48.55, pos: [0, 2.6, 10], alvo: [0.5, 1.6, -200], fov: 72 },
  { t: 50.2, pos: [1.2, 2.4, -42], alvo: [5.8, 2.4, -64], fov: 72 },
  { t: 51.3, pos: [2, 3, -80], alvo: [-64, 13, -150], fov: 72 },
  { t: 52.4, pos: [0, 14, -180], alvo: [0, 0, -420], fov: 72 },
  { t: 53.45, pos: [-30, 6, -372], alvo: [-30, 5, -390], fov: 72 },
];
const CAM_DENTRO: Chave[] = [
  { t: 53.6, pos: [-1, 3.2, -1477], alvo: [0, 2.6, -1500], fov: 80 },
  { t: 55.0, pos: [1.5, 2.4, -1487], alvo: [10, 1.8, -1503], fov: 80 },
  { t: 56.5, pos: [0.5, 2.2, -1493], alvo: [0, 1.5, -1510], fov: 74 },
  { t: 57.2, pos: [0.5, 6, -1494], alvo: [0.5, 30, -1497], fov: 74 },
  { t: 57.7, pos: [0.5, 14, -1496], alvo: [0.5, 40, -1497], fov: 74 },
];
const CAM_ALTO: Chave[] = [
  { t: 57.7, pos: [0, 140, -380], alvo: [0, 0, -440], cima: [0, 0, -1], fov: 72 },
  { t: 59.5, pos: [0, 900, -390], alvo: [0, 0, -460], cima: [0, 0, -1], fov: 72 },
];

export const CenaArea51: React.FC<{ s: number }> = ({ s }) => {
  const fase = s < 53.6 ? "fora" : s < 57.7 ? "hangar" : "alto";
  const ch = fase === "fora" ? CAM_FORA : fase === "hangar" ? CAM_DENTRO : CAM_ALTO;
  return (
    <Palco ceu={fase === "hangar" ? "estudio" : "manha"} luzCeu={0.5} foco={fase === "hangar" ? 8 : 150} desfoque={0.3} brilho={0.6} saturacao={0.12} contraste={0.1} ao={fase === "hangar" ? 1 : 0} raioAo={1.5}>
      <CamTrajeto ch={ch} s={s} balanco={1.2} />
      {fase !== "hangar" ? (
        <>
          <hemisphereLight args={["#d9e4f2", "#a8916c", 0.75]} />
          <Sol pos={[300, 160, -100]} forca={2.4} area={fase === "alto" ? 600 : 260} cor="#ffe3c0" />
          <fog attach="fog" args={["#d8d8d0", 600, 4200]} />
          <CeuDia topo="#5a86c2" horizonte="#e6dccb" nuvens={18} />
          <Deserto />
        </>
      ) : (
        <Hangar s={s} />
      )}
    </Palco>
  );
};
