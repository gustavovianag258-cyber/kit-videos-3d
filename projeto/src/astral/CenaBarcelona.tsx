import { useMemo } from "react";
import * as THREE from "three";
import { Sol } from "../cinema/Palco";
import { CarrosGrade, Eixample, Instancias, Multidao, texturaFachada } from "./cidade";
import { CeuDia, Cx, Gente, rnd, texturaCanvas } from "./pecas";
import { CamTrajeto, type Chave, Palco } from "./palco";
import type { V3 } from "./tempo";

// BARCELONA, 15:30: você aparece ao lado das torres da Sagrada Família, voa por cima dos
// quarteirões octogonais do Eixample (mar ao fundo) e desce na Rambla: arco de mosaico,
// plátanos dos dois lados, multidão andando, o mosaico do Miró no chão e uma mascote laranja.

const texturaTorre = () =>
  texturaCanvas(
    128,
    256,
    (g) => {
      g.fillStyle = "#e7dcc6";
      g.fillRect(0, 0, 128, 256);
      g.fillStyle = "#6f7f96";
      for (let y = 0; y < 256; y += 9)
        for (let x = 0; x < 128; x += 16) {
          if (rnd(`tt${x}${y}`) > 0.25) g.fillRect(x + 6, y + 1, 4, 6);
        }
    },
    [6, 10],
  );

// Torre de perfil de "charuto" (paraboloide) com fendas e pináculo de mosaico + cruz
const Torre: React.FC<{ p: V3; altura: number; raio: number; tex: THREE.Texture; topo?: "mosaico" | "cruz" | "estrela"; corTopo?: string }> = ({
  p,
  altura,
  raio,
  tex,
  topo = "mosaico",
  corTopo = "#c8302c",
}) => {
  const geo = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= 24; i++) {
      const u = i / 24;
      const r = raio * Math.pow(1 - u, 0.62) * (1 - 0.06 * Math.sin(u * Math.PI));
      pts.push(new THREE.Vector2(Math.max(r, 0.15), u * altura));
    }
    return new THREE.LatheGeometry(pts, 24);
  }, [altura, raio]);
  const h = altura;
  return (
    <group position={p}>
      <mesh geometry={geo} castShadow receiveShadow>
        <meshStandardMaterial map={tex} roughness={0.85} />
      </mesh>
      {topo === "mosaico" && (
        <group position={[0, h * 0.93, 0]}>
          {Array.from({ length: 9 }).map((_, i) => (
            <mesh key={i} position={[Math.cos(i * 2.4) * raio * 0.16, (i / 9) * h * 0.06, Math.sin(i * 2.4) * raio * 0.16]}>
              <icosahedronGeometry args={[raio * 0.13, 0]} />
              <meshStandardMaterial color={i % 3 === 0 ? "#f3f0ea" : corTopo} roughness={0.4} />
            </mesh>
          ))}
          <Cx t={[raio * 0.05, raio * 0.6, raio * 0.05]} p={[0, h * 0.09, 0]} c="#ffffff" />
          <Cx t={[raio * 0.36, raio * 0.05, raio * 0.05]} p={[0, h * 0.1, 0]} c="#ffffff" />
        </group>
      )}
      {topo === "cruz" && (
        <group position={[0, h, 0]}>
          <Cx t={[raio * 0.25, raio * 2.2, raio * 0.25]} p={[0, raio * 1.1, 0]} c="#f7f7f5" />
          <Cx t={[raio * 1.5, raio * 0.25, raio * 0.25]} p={[0, raio * 1.5, 0]} c="#f7f7f5" />
          <Cx t={[raio * 0.25, raio * 1.5, raio * 0.25]} p={[0, raio * 1.5, 0]} r={[Math.PI / 2, 0, 0]} c="#f7f7f5" />
        </group>
      )}
      {topo === "estrela" && (
        <mesh position={[0, h + raio * 0.3, 0]}>
          <icosahedronGeometry args={[raio * 0.35, 0]} />
          <meshStandardMaterial color="#ffffff" emissive="#fff4d6" emissiveIntensity={0.4} />
        </mesh>
      )}
    </group>
  );
};

// pináculo pequeno de frutas (cones com cachos coloridos em cima das naves)
const Pinaculo: React.FC<{ p: V3; tam: number; cor: string }> = ({ p, tam, cor }) => (
  <group position={p}>
    <mesh position={[0, tam * 0.5, 0]} castShadow>
      <cylinderGeometry args={[tam * 0.08, tam * 0.16, tam, 8]} />
      <meshStandardMaterial color="#d8c8aa" roughness={0.8} />
    </mesh>
    {Array.from({ length: 6 }).map((_, i) => (
      <mesh key={i} position={[Math.cos(i) * tam * 0.06, tam * (1.0 + i * 0.05), Math.sin(i) * tam * 0.06]}>
        <icosahedronGeometry args={[tam * 0.09, 0]} />
        <meshStandardMaterial color={i % 2 ? cor : "#f2eee6"} roughness={0.4} />
      </mesh>
    ))}
    <Cx t={[tam * 0.04, tam * 0.3, tam * 0.04]} p={[0, tam * 1.45, 0]} c="#ffffff" />
    <Cx t={[tam * 0.18, tam * 0.04, tam * 0.04]} p={[0, tam * 1.5, 0]} c="#ffffff" />
  </group>
);

const SagradaFamilia: React.FC = () => {
  const tex = useMemo(texturaTorre, []);
  const texCentral = useMemo(() => {
    const t = texturaTorre();
    t.repeat.set(8, 14);
    return t;
  }, []);
  const fachada = (cx: number, cz: number, rot: number, alturas: number[], cor: string) => (
    <group position={[cx, 0, cz]} rotation={[0, rot, 0]}>
      {alturas.map((h, i) => (
        <Torre key={i} p={[(-1.5 + i) * 11, 0, 0]} altura={h} raio={4.6} tex={tex} corTopo={cor} />
      ))}
    </group>
  );
  return (
    <group>
      {/* corpo das naves */}
      <Cx t={[95, 42, 50]} p={[0, 21, 0]} c="#d6c3a2" />
      <Cx t={[50, 52, 90]} p={[0, 26, -6]} c="#d1bd99" />
      <Cx t={[70, 6, 36]} p={[0, 45, 0]} c="#c9b28c" />
      {/* torres dos evangelistas e de Jesus (no meio, a mais alta, com a cruz) */}
      <Torre p={[0, 0, -4]} altura={172} raio={9.5} tex={texCentral} topo="cruz" />
      <Torre p={[-14, 0, -18]} altura={135} raio={6.2} tex={tex} topo="estrela" />
      <Torre p={[14, 0, -18]} altura={135} raio={6.2} tex={tex} topo="estrela" />
      <Torre p={[-14, 0, 10]} altura={135} raio={6.2} tex={tex} topo="estrela" />
      <Torre p={[14, 0, 10]} altura={135} raio={6.2} tex={tex} topo="estrela" />
      <Torre p={[0, 0, -34]} altura={138} raio={6.8} tex={tex} topo="estrela" />
      {/* fachadas: Nascimento, Paixão e Glória (4 campanários cada) */}
      {fachada(52, 0, Math.PI / 2, [98, 107, 107, 98], "#c8302c")}
      {fachada(-52, 0, -Math.PI / 2, [100, 110, 110, 100], "#c8302c")}
      {fachada(0, 46, 0, [104, 112, 112, 104], "#d84a2a")}
      {/* pináculos de frutas por cima das naves */}
      {Array.from({ length: 14 }).map((_, i) => (
        <Pinaculo key={i} p={[-40 + (i % 7) * 13, 42, i < 7 ? 22 : -22]} tam={14} cor={["#c8302c", "#e2a72e", "#d84a2a"][i % 3]} />
      ))}
      {/* praça com árvores em volta */}
      <Cx t={[120, 0.5, 120]} p={[0, 0.25, 0]} c="#b9ab90" sombra={false} />
    </group>
  );
};

// Rua: arco de mosaico (tipo o do mercado da Boqueria)
const ArcoMosaico: React.FC<{ p: V3; giroY: number }> = ({ p, giroY }) => {
  const vitral = useMemo(
    () =>
      texturaCanvas(256, 128, (g) => {
        g.fillStyle = "#e8d48a";
        g.fillRect(0, 0, 256, 128);
        for (let i = 0; i < 260; i++) {
          g.fillStyle = ["#2f5fb3", "#f2c230", "#e9e4d4", "#3b7ad9", "#e08a2c", "#7fb0e8"][i % 6];
          const x = rnd(`vx${i}`) * 256;
          const y = rnd(`vy${i}`) * 128;
          g.beginPath();
          g.moveTo(x, y);
          g.lineTo(x + 8 + rnd(`va${i}`) * 10, y + rnd(`vb${i}`) * 8);
          g.lineTo(x + rnd(`vc${i}`) * 8, y + 8 + rnd(`vd${i}`) * 10);
          g.closePath();
          g.fill();
        }
      }),
    [],
  );
  const coluna = useMemo(
    () =>
      texturaCanvas(64, 256, (g) => {
        g.fillStyle = "#e9e3d2";
        g.fillRect(0, 0, 64, 256);
        for (let i = 0; i < 120; i++) {
          g.fillStyle = ["#2f6f4f", "#d9a52b", "#3b6fbf", "#c94d2b", "#e9e3d2"][i % 5];
          g.fillRect(rnd(`kx${i}`) * 60, rnd(`ky${i}`) * 252, 5, 4);
        }
      }),
    [],
  );
  return (
    <group position={p} rotation={[0, giroY, 0]}>
      {[-5, 5].map((x) => (
        <mesh key={x} position={[x, 3.5, 0]} castShadow>
          <boxGeometry args={[0.7, 7, 0.7]} />
          <meshStandardMaterial map={coluna} roughness={0.5} />
        </mesh>
      ))}
      {/* meio-disco com raios de ferro */}
      <mesh position={[0, 7, 0]}>
        <circleGeometry args={[5.4, 40, 0, Math.PI]} />
        <meshStandardMaterial map={vitral} side={THREE.DoubleSide} roughness={0.4} />
      </mesh>
      <mesh position={[0, 7, 0.02]}>
        <ringGeometry args={[5.3, 5.8, 40, 1, 0, Math.PI]} />
        <meshStandardMaterial color="#1c1f24" side={THREE.DoubleSide} metalness={0.4} roughness={0.5} />
      </mesh>
      {Array.from({ length: 9 }).map((_, i) => {
        const a = (i / 8) * Math.PI;
        return <Cx key={i} t={[5.4, 0.12, 0.12]} p={[Math.cos(a) * 2.7, 7 + Math.sin(a) * 2.7, 0.05]} r={[0, 0, a]} c="#1c1f24" />;
      })}
      <Cx t={[11.6, 0.35, 0.4]} p={[0, 7, 0]} c="#1c1f24" />
    </group>
  );
};

const MosaicoMiro: React.FC<{ p: V3 }> = ({ p }) => {
  const tex = useMemo(
    () =>
      texturaCanvas(256, 256, (g) => {
        g.fillStyle = "#f2efe8";
        g.beginPath();
        g.arc(128, 128, 126, 0, Math.PI * 2);
        g.fill();
        g.lineWidth = 6;
        g.strokeStyle = "#111";
        g.beginPath();
        g.arc(128, 128, 120, 0, Math.PI * 2);
        g.stroke();
        g.fillStyle = "#d62828";
        g.beginPath();
        g.arc(90, 120, 34, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = "#1d4fb8";
        g.beginPath();
        g.ellipse(170, 150, 30, 18, 0.4, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = "#f2c230";
        g.beginPath();
        g.arc(150, 80, 18, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = "#1a7a4a";
        g.beginPath();
        g.arc(100, 185, 14, 0, Math.PI * 2);
        g.fill();
        g.strokeStyle = "#111";
        g.beginPath();
        g.moveTo(40, 128);
        g.bezierCurveTo(90, 60, 170, 210, 220, 120);
        g.stroke();
      }),
    [],
  );
  return (
    <mesh position={p} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <circleGeometry args={[3.4, 48]} />
      <meshStandardMaterial map={tex} roughness={0.7} />
    </mesh>
  );
};

const Mascote: React.FC<{ p: V3; s: number }> = ({ p, s }) => (
  <group position={p} rotation={[0, 0.3, 0]}>
    <mesh position={[0, 1.15, 0]} castShadow>
      <capsuleGeometry args={[0.45, 1.2, 6, 12]} />
      <meshStandardMaterial color="#e8952b" roughness={0.95} />
    </mesh>
    {Array.from({ length: 10 }).map((_, i) => (
      <mesh key={i} position={[Math.cos(i * 1.3) * 0.42, 0.5 + i * 0.14, Math.sin(i * 1.3) * 0.42]}>
        <icosahedronGeometry args={[0.12, 0]} />
        <meshStandardMaterial color="#d9821f" roughness={1} />
      </mesh>
    ))}
    {[-1, 1].map((l) => (
      <group key={l} position={[l * 0.42, 1.25, 0]} rotation={[0, 0, l * (0.9 + Math.sin(s * 5 + l) * 0.5)]}>
        <Cx t={[0.12, 0.7, 0.12]} p={[0, 0.35, 0]} c="#e8952b" />
      </group>
    ))}
    <Cx t={[0.12, 0.12, 0.04]} p={[-0.15, 1.65, 0.44]} c="#111" />
    <Cx t={[0.12, 0.12, 0.04]} p={[0.15, 1.65, 0.44]} c="#111" />
    <Cx t={[0.25, 0.06, 0.04]} p={[0, 1.45, 0.45]} c="#7a2a10" />
    <Cx t={[0.16, 0.22, 0.2]} p={[-0.18, 0.08, 0.05]} c="#111" />
    <Cx t={[0.16, 0.22, 0.2]} p={[0.18, 0.08, 0.05]} c="#111" />
  </group>
);

const Carrinho: React.FC<{ p: V3; giroY: number; cor: string }> = ({ p, giroY, cor }) => (
  <group position={p} rotation={[0, giroY, 0]}>
    <Cx t={[1.8, 0.7, 4.2]} p={[0, 0.65, 0]} c={cor} rug={0.35} />
    <Cx t={[1.6, 0.6, 2.2]} p={[0, 1.3, -0.2]} c="#2b3442" rug={0.2} />
    {[
      [-0.9, 1.3],
      [0.9, 1.3],
      [-0.9, -1.3],
      [0.9, -1.3],
    ].map(([x, z], i) => (
      <Cx key={i} t={[0.25, 0.6, 0.6]} p={[x, 0.3, z]} c="#15161a" />
    ))}
  </group>
);

const Rambla: React.FC<{ s: number }> = ({ s }) => {
  const fachadas = useMemo(() => {
    const cores = ["#e7c9b1", "#efe1bf", "#cfdbe0", "#f0e6da", "#e3b9a5", "#d8e2c8", "#f2d29b"];
    const vens = ["#2f6f4f", "#3d6f8f", "#556b2f", "#8a3b2f"];
    return Array.from({ length: 8 }).map((_, i) => texturaFachada(cores[i % cores.length], vens[i % vens.length], `fa${i}`));
  }, []);
  const predios = useMemo(() => {
    const l: { z: number; lado: number; larg: number; alt: number; tex: number; cor: string }[] = [];
    for (const lado of [-1, 1]) {
      let z = 60;
      let i = 0;
      while (z > -220) {
        const larg = 13 + rnd(`rl${lado}${i}`) * 8;
        l.push({ z: z - larg / 2, lado, larg, alt: 18 + rnd(`ra${lado}${i}`) * 7, tex: Math.floor(rnd(`rt${lado}${i}`) * 8), cor: ["#e7c9b1", "#efe1bf", "#cfdbe0", "#e3b9a5"][i % 4] });
        z -= larg;
        i++;
      }
    }
    return l;
  }, []);
  const pisoOnda = useMemo(texturaPisoOnda, []);
  const matSimples = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.6 }), []);
  // sacadas alinhadas com as janelas desenhadas na fachada (5 andares x 3 colunas) + toldos das lojas
  const sacadas = useMemo(() => {
    const l: { p: V3; t: V3; r?: number; cor: string }[] = [];
    for (const b of predios) {
      const xf = b.lado * 20;
      const fora = -b.lado;
      for (let andar = 0; andar < 5; andar++) {
        const y = b.alt * (1 - (30 + andar * 80 + 56) / 512);
        for (let j = 0; j < 3; j++) {
          const u = (47 + j * 80) / 256 - 0.5;
          const z = b.z + b.lado * u * b.larg;
          l.push({ p: [xf + fora * 0.35, y, z], t: [0.7, 0.12, b.larg * 0.27], cor: "#e9e4da" });
          l.push({ p: [xf + fora * 0.68, y + 0.45, z], t: [0.05, 0.85, b.larg * 0.27], cor: "#22252a" });
        }
      }
      const toldo = ["#c0392b", "#2e86ab", "#27ae60", "#f39c12"][Math.floor(rnd(`aw${b.z}${b.lado}`) * 4)];
      for (const u of [-0.25, 0.25]) {
        l.push({ p: [xf + fora * 0.9, b.alt * (1 - 430 / 512) - 0.2, b.z + b.lado * u * b.larg], t: [1.8, 0.12, b.larg * 0.42], r: 0, cor: toldo });
      }
    }
    return l;
  }, [predios]);
  return (
    <group>
      {/* chão: calçadão de piso ondulado, pistas, calçadas */}
      <mesh position={[0, 0.06, -80]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[18, 320]} />
        <meshStandardMaterial map={pisoOnda} roughness={0.85} />
      </mesh>
      <Cx t={[7, 0.08, 320]} p={[12.5, -0.02, -80]} c="#55585e" sombra={false} />
      <Cx t={[7, 0.08, 320]} p={[-12.5, -0.02, -80]} c="#55585e" sombra={false} />
      <Cx t={[4, 0.14, 320]} p={[18, 0.02, -80]} c="#a9a49b" sombra={false} />
      <Cx t={[4, 0.14, 320]} p={[-18, 0.02, -80]} c="#a9a49b" sombra={false} />
      {Array.from({ length: 40 }).map((_, i) => (
        <Cx key={i} t={[0.15, 0.02, 3]} p={[12.5, 0.03, 50 - i * 8]} c="#f2f2f2" sombra={false} />
      ))}
      <MosaicoMiro p={[0, 0.07, -8]} />
      {/* plátanos (copas fofas) e postes dos dois lados */}
      {Array.from({ length: 28 }).map((_, i) =>
        [-8.6, 8.6].map((x) => {
          if (x > 0 && i < 3) return null;
          const z = 46 - i * 9.5;
          const k = `${i}${x}`;
          return (
            <group key={k} position={[x, 0, z]}>
              <Cx t={[0.4, 5.5, 0.4]} p={[0, 2.75, 0]} c="#8b7b5f" />
              {Array.from({ length: 7 }).map((_, j) => (
                <mesh key={j} position={[(rnd(`a${k}${j}`) - 0.5) * 4, 6.2 + rnd(`b${k}${j}`) * 2.6, (rnd(`c${k}${j}`) - 0.5) * 4]} castShadow>
                  <icosahedronGeometry args={[1.6 + rnd(`d${k}${j}`) * 0.8, 3]} />
                  <meshStandardMaterial color={j % 2 ? "#5c9440" : "#6aa64a"} roughness={0.9} />
                </mesh>
              ))}
              {i % 2 === 0 && (
                <group position={[x > 0 ? 0.6 : -0.6, 0, 3]}>
                  <Cx t={[0.15, 4.5, 0.15]} p={[0, 2.25, 0]} c="#1e2126" />
                  <Cx t={[0.4, 0.3, 0.4]} p={[0, 4.6, 0]} c="#1e2126" />
                </group>
              )}
            </group>
          );
        }),
      )}
      {/* prédios dos dois lados */}
      {predios.map((b, i) => (
        <group key={i} position={[b.lado * (20 + 7), 0, b.z]}>
          <Cx t={[14, b.alt, b.larg]} p={[0, b.alt / 2, 0]} c={b.cor} />
          <mesh position={[-b.lado * 7.02, b.alt / 2, 0]} rotation={[0, (-b.lado * Math.PI) / 2, 0]} receiveShadow>
            <planeGeometry args={[b.larg, b.alt]} />
            <meshStandardMaterial map={fachadas[b.tex]} roughness={0.85} />
          </mesh>
        </group>
      ))}
      <ArcoMosaico p={[17.5, 0, 14]} giroY={-Math.PI / 2} />
      {/* carros nas pistas */}
      {Array.from({ length: 10 }).map((_, i) => {
        const ida = i % 2 === 0;
        const z = ida ? 60 - ((i * 37 + s * 9) % 300) : -240 + ((i * 41 + s * 9) % 300);
        return <Carrinho key={i} p={[ida ? 11 : -11, 0, z]} giroY={ida ? Math.PI : 0} cor={["#2e7d32", "#f1f1f1", "#1d3557", "#c1121f", "#e9c46a"][i % 5]} />;
      })}
      {/* sacadas de ferro e toldos em 3D nas fachadas */}
      <Instancias itens={sacadas} material={matSimples} />
      {/* bancas de flores, mesinhas com guarda-sol, bancos, estátua viva e pombos */}
      {[-30, -62, -95].map((z, i) => (
        <BancaFlores key={z} p={[i % 2 ? 4.6 : -4.6, 0, z]} giroY={i % 2 ? -Math.PI / 2 : Math.PI / 2} />
      ))}
      {[-44, -52, -76, -84].map((z, i) => (
        <Mesinha key={z} p={[i % 2 ? -5.2 : 5.2, 0, z]} cor={["#d62828", "#f1f1f1", "#2a9d8f", "#f4a261"][i]} />
      ))}
      {[-20, -40, -70, -100].map((z, i) => (
        <group key={z} position={[i % 2 ? 7.4 : -7.4, 0, z]}>
          <Cx t={[0.5, 0.06, 1.8]} p={[0, 0.45, 0]} c="#6b4a2e" />
          <Cx t={[0.1, 0.45, 1.8]} p={[i % 2 ? 0.25 : -0.25, 0.7, 0]} c="#6b4a2e" />
          <Cx t={[0.4, 0.42, 0.1]} p={[0, 0.21, -0.7]} c="#1e2126" />
          <Cx t={[0.4, 0.42, 0.1]} p={[0, 0.21, 0.7]} c="#1e2126" />
        </group>
      ))}
      <group position={[-3.4, 0, -2]}>
        <Cx t={[1.0, 0.8, 1.0]} p={[0, 0.4, 0]} c="#c9b27c" met={0.6} rug={0.35} />
        <Gente r={{ pele: "#d4a63a", cabelo: "#c9952a", camisa: "#d4a63a", calca: "#d4a63a", sapato: "#c9952a", penteado: "curto" }} pos={[0, 0.8, 0]} giroY={0.6} acao="parado" t={0} />
      </group>
      {Array.from({ length: 9 }).map((_, i) => (
        <group key={i} position={[1 + rnd(`pg${i}`) * 3, 0.1, 6 - rnd(`ph${i}`) * 6]} rotation={[0, rnd(`pr${i}`) * 6, 0]}>
          <Cx t={[0.14, 0.13, 0.26]} p={[0, 0.1 + Math.abs(Math.sin(s * 6 + i)) * 0.02, 0]} c="#8a8f99" />
          <Cx t={[0.08, 0.09, 0.08]} p={[0, 0.2, 0.13 + Math.sin(s * 8 + i) * 0.02]} c="#6f7684" />
        </group>
      ))}
      {/* gente: calçadão cheio, calçadas e a mascote */}
      <Multidao n={70} x={[-6.5, 6.5]} z={[-110, 40]} s={s} sem="rb" />
      <Multidao n={16} x={[16.5, 19]} z={[-110, 40]} s={s} sem="rc" />
      <Multidao n={16} x={[-19, -16.5]} z={[-110, 40]} s={s} sem="rd" />
      <Mascote p={[1.6, 0, -15]} s={s} />
      <Gente r={{ pele: "#c68642", cabelo: "#1a1410", camisa: "#2a6fb0", calca: "#efefef", penteado: "curto" }} pos={[13.5, 0, 9]} giroY={-1.2} acao="andar" t={s} />
    </group>
  );
};

// --- detalhes da Rambla ---

// piso ondulado típico das Ramblas (ondas cinza e creme)
const texturaPisoOnda = () =>
  texturaCanvas(
    256,
    256,
    (g) => {
      g.fillStyle = "#b3ab9e";
      g.fillRect(0, 0, 256, 256);
      g.strokeStyle = "#a29a8d";
      g.lineWidth = 6;
      for (let y = -32; y < 300; y += 26) {
        g.beginPath();
        for (let x = 0; x <= 256; x += 4) {
          const yy = y + Math.sin((x / 256) * Math.PI * 4) * 9;
          if (x === 0) g.moveTo(x, yy);
          else g.lineTo(x, yy);
        }
        g.stroke();
      }
      g.fillStyle = "rgba(0,0,0,0.05)";
      for (let i = 0; i < 500; i++) g.fillRect(rnd(`po${i}`) * 256, rnd(`pp${i}`) * 256, 3, 3);
    },
    [3, 90],
  );

// banca de flores (quiosque verde com baldes coloridos na frente)
const BancaFlores: React.FC<{ p: V3; giroY: number }> = ({ p, giroY }) => (
  <group position={p} rotation={[0, giroY, 0]}>
    <Cx t={[3.2, 2.6, 2]} p={[0, 1.3, 0]} c="#2f5d46" />
    <Cx t={[3.8, 0.15, 2.6]} p={[0, 2.7, 0.2]} c="#24483a" />
    <Cx t={[3.0, 0.5, 0.6]} p={[0, 0.9, 1.25]} c="#3b6e55" />
    {Array.from({ length: 12 }).map((_, i) => (
      <mesh key={i} position={[-1.35 + (i % 6) * 0.54, 1.25 + Math.floor(i / 6) * 0.3, 1.2 + Math.floor(i / 6) * 0.15]}>
        <icosahedronGeometry args={[0.2, 0]} />
        <meshStandardMaterial color={["#e63946", "#f4a261", "#ffd166", "#f15bb5", "#ffffff", "#9b5de5"][i % 6]} roughness={0.7} />
      </mesh>
    ))}
  </group>
);

// mesinha de bar com 2 cadeiras e guarda-sol
const Mesinha: React.FC<{ p: V3; cor: string }> = ({ p, cor }) => (
  <group position={p}>
    <mesh position={[0, 0.72, 0]}>
      <cylinderGeometry args={[0.4, 0.4, 0.04, 16]} />
      <meshStandardMaterial color="#f1f1f1" />
    </mesh>
    <Cx t={[0.06, 0.72, 0.06]} p={[0, 0.36, 0]} c="#555" />
    {[-1, 1].map((l) => (
      <group key={l} position={[l * 0.65, 0, 0]}>
        <Cx t={[0.42, 0.05, 0.42]} p={[0, 0.45, 0]} c="#333" />
        <Cx t={[0.05, 0.45, 0.42]} p={[l * 0.2, 0.68, 0]} c="#333" />
      </group>
    ))}
    <Cx t={[0.05, 2.3, 0.05]} p={[0, 1.15, 0]} c="#ddd" />
    <mesh position={[0, 2.35, 0]}>
      <coneGeometry args={[1.3, 0.5, 8]} />
      <meshStandardMaterial color={cor} roughness={0.8} />
    </mesh>
  </group>
);

// --- detalhes da vista aérea ---

// guindaste de torre amarelo (a Sagrada Família ainda está em obra)
const Guindaste: React.FC<{ p: V3; altura: number; giro: number }> = ({ p, altura, giro }) => (
  <group position={p} rotation={[0, giro, 0]}>
    {[-1, 1].map((a) =>
      [-1, 1].map((b) => <Cx key={`${a}${b}`} t={[0.35, altura, 0.35]} p={[a * 0.9, altura / 2, b * 0.9]} c="#e8b923" sombra={false} />),
    )}
    {Array.from({ length: Math.floor(altura / 4) }).map((_, i) => (
      <Cx key={i} t={[2.1, 0.25, 2.1]} p={[0, i * 4 + 2, 0]} c="#e8b923" sombra={false} />
    ))}
    <Cx t={[2.6, 2.4, 2.6]} p={[0, altura + 1.2, 0]} c="#e8b923" />
    <Cx t={[62, 1.6, 1.6]} p={[26, altura + 3, 0]} c="#e8b923" />
    <Cx t={[18, 1.4, 1.4]} p={[-10, altura + 3, 0]} c="#e8b923" />
    <Cx t={[4, 3, 2.4]} p={[-17, altura + 1.5, 0]} c="#9a9a9a" />
    <Cx t={[0.4, 8, 0.4]} p={[0, altura + 7, 0]} c="#e8b923" sombra={false} />
    <Cx t={[0.1, 28, 0.1]} p={[40, altura - 11, 0]} c="#222" sombra={false} />
    <Cx t={[2.5, 1.5, 2.5]} p={[40, altura - 26, 0]} c="#444" />
  </group>
);

const texturaMar = () =>
  texturaCanvas(
    256,
    256,
    (g) => {
      g.fillStyle = "#4f86a8";
      g.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 900; i++) {
        g.fillStyle = rnd(`m${i}`) > 0.5 ? "rgba(255,255,255,0.12)" : "rgba(20,50,80,0.18)";
        g.fillRect(rnd(`mx${i}`) * 256, rnd(`my${i}`) * 256, 6 + rnd(`mw${i}`) * 14, 1.5);
      }
    },
    [40, 16],
  );

// litoral: praia da Barceloneta, mar com marolas, barcos, porto com guindastes e o hotel-vela
const Litoral: React.FC = () => {
  const mar = useMemo(texturaMar, []);
  return (
    <group>
      <mesh position={[0, 0.2, -3600]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12000, 4400]} />
        <meshStandardMaterial map={mar} roughness={0.25} metalness={0.15} />
      </mesh>
      <Cx t={[3000, 0.6, 46]} p={[300, 0.35, -1420]} c="#e3cf9f" sombra={false} />
      {Array.from({ length: 60 }).map((_, i) => (
        <Cx key={i} t={[2.5, 0.2, 2.5]} p={[-600 + rnd(`gs${i}`) * 1700, 0.7, -1410 - rnd(`gz${i}`) * 26]} c={["#e63946", "#f4a261", "#2a9d8f", "#ffffff", "#457b9d"][i % 5]} sombra={false} />
      ))}
      {Array.from({ length: 34 }).map((_, i) => {
        const x = -1400 + rnd(`bx${i}`) * 2800;
        const z = -1520 - rnd(`bz${i}`) * 900;
        const l = 8 + rnd(`bl${i}`) * 16;
        return (
          <group key={i} position={[x, 0.4, z]} rotation={[0, rnd(`br${i}`) * 3, 0]}>
            <Cx t={[l * 0.32, 1.6, l]} p={[0, 0.8, 0]} c="#f4f4f2" />
            <Cx t={[l * 0.22, 1.2, l * 0.35]} p={[0, 2.2, -l * 0.1]} c="#dfe6ea" />
            {rnd(`bm${i}`) > 0.5 && <Cx t={[0.2, l * 0.9, 0.2]} p={[0, l * 0.45 + 1.6, 0]} c="#cccccc" sombra={false} />}
          </group>
        );
      })}
      {/* porto: cais, contêineres e guindastes de carga */}
      <Cx t={[700, 3, 260]} p={[-1250, 1.5, -1600]} c="#8c8a86" />
      {Array.from({ length: 80 }).map((_, i) => (
        <Cx key={i} t={[12, 2.6, 2.6]} p={[-1500 + (i % 16) * 16, 4.3 + Math.floor(i / 40) * 2.6, -1530 - Math.floor((i % 40) / 16) * 3.2]} c={["#c0392b", "#2e86ab", "#e67e22", "#27ae60", "#7f8c8d"][i % 5]} />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <group key={i} position={[-1050 + i * 70, 3, -1690]}>
          <Cx t={[2, 44, 2]} p={[0, 22, 0]} c="#c0392b" />
          <Cx t={[2, 2, 50]} p={[0, 44, -12]} c="#c0392b" />
        </group>
      ))}
      {/* hotel-vela na ponta da praia */}
      <mesh position={[-640, 52, -1470]} rotation={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[38, 38, 104, 24, 1, true, 0, 1.2]} />
        <meshStandardMaterial color="#9fb6c8" metalness={0.5} roughness={0.15} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

// morros: Montjuïc (com o castelo) e a serra de Collserola no horizonte
const Morro: React.FC<{ p: V3; esc: V3; cor?: string }> = ({ p, esc, cor = "#5f7f45" }) => (
  <mesh position={p} scale={esc}>
    <sphereGeometry args={[1, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
    <meshStandardMaterial color={cor} roughness={1} />
  </mesh>
);

const texturaGlories = () =>
  texturaCanvas(64, 256, (g) => {
    g.fillStyle = "#a9b4c2";
    g.fillRect(0, 0, 64, 256);
    for (let y = 0; y < 256; y += 4)
      for (let x = 0; x < 64; x += 4) {
        const u = y / 256;
        g.fillStyle = rnd(`gl${x}${y}`) > 0.5 ? (u < 0.5 ? "#c8434a" : "#3b6fb6") : u < 0.3 ? "#e38b4a" : "#5f8fd0";
        g.fillRect(x, y, 3, 3);
      }
  });

const CAM_AR: Chave[] = [
  { t: 18.9, pos: [80, 104, 140], alvo: [-40, 54, -400], fov: 72 },
  { t: 20.4, pos: [70, 104, 36], alvo: [60, 20, -500], fov: 72 },
  { t: 21.6, pos: [62, 96, -130], alvo: [120, -10, -580], fov: 72 },
  { t: 22.85, pos: [92, 86, -290], alvo: [150, -40, -680], fov: 72 },
];
const CAM_RUA: Chave[] = [
  { t: 22.8, pos: [5, 1.72, 30], alvo: [17, 4.4, 12], fov: 72 },
  { t: 24.2, pos: [2.2, 1.66, 16], alvo: [1, 1.8, -25], fov: 72 },
  { t: 27.15, pos: [0.3, 1.66, -17], alvo: [0, 1.9, -70], fov: 72 },
];

export const CenaBarcelona: React.FC<{ s: number }> = ({ s }) => {
  const noAr = s < 22.8;
  const glories = useMemo(texturaGlories, []);
  return (
    <Palco ceu="dia" luzCeu={0.45} foco={noAr ? 200 : 12} desfoque={0.3} brilho={0.5} saturacao={0.2} contraste={0.14} ao={noAr ? 0 : 1} raioAo={1.5}>
      <CamTrajeto ch={noAr ? CAM_AR : CAM_RUA} s={s} balanco={noAr ? 3 : 1} />
      <hemisphereLight args={["#cfe3ff", "#b39d7c", 0.6]} />
      <Sol pos={noAr ? [250, 400, 120] : [40, 70, 25]} forca={2.2} area={noAr ? 450 : 70} cor="#fff2dc" />
      <fog attach="fog" args={["#cfdcea", noAr ? 600 : 120, noAr ? 3600 : 420]} />
      <CeuDia />
      {noAr ? (
        <group>
          <Cx t={[9000, 1, 9000]} p={[0, -0.6, 0]} c="#8f8b80" sombra={false} />
          <Litoral />
          <SagradaFamilia />
          <Guindaste p={[38, 0, 34]} altura={150} giro={2.4} />
          <Guindaste p={[-40, 0, -42]} altura={135} giro={2.6} />
          <Eixample centro={[0, 0, 0]} n={10} buraco={[0, 0, 80]} />
          <CarrosGrade centro={[0, 0, 0]} n={10} s={s} />
          {/* Torre Glòries (bala com luzes coloridas) */}
          <mesh position={[620, 72, -520]} castShadow>
            <capsuleGeometry args={[19, 110, 8, 20]} />
            <meshStandardMaterial map={glories} emissiveMap={glories} emissive="#ffffff" emissiveIntensity={0.25} roughness={0.35} metalness={0.2} />
          </mesh>
          {/* parque da Ciutadella com árvores e lago */}
          <Cx t={[380, 1.2, 260]} p={[-420, 0.6, -520]} c="#6f9a4a" sombra={false} />
          <Cx t={[90, 1.4, 50]} p={[-380, 0.7, -500]} c="#5d8fa8" sombra={false} />
          {Array.from({ length: 90 }).map((_, i) => (
            <mesh key={i} position={[-600 + rnd(`cp${i}`) * 360, 7, -640 + rnd(`cq${i}`) * 240]}>
              <icosahedronGeometry args={[5 + rnd(`cr${i}`) * 3, 1]} />
              <meshStandardMaterial color={i % 2 ? "#4f7f35" : "#5e8a3c"} roughness={0.9} />
            </mesh>
          ))}
          {/* Montjuïc e Collserola */}
          <Morro p={[-1650, 0, -1150]} esc={[520, 170, 380]} />
          <Cx t={[50, 14, 50]} p={[-1650, 172, -1150]} c="#bfa98a" />
          <Morro p={[-2600, 0, 200]} esc={[900, 380, 1400]} cor="#56743f" />
          <Morro p={[2400, 0, -600]} esc={[700, 220, 1200]} cor="#5c7a44" />
        </group>
      ) : (
        <Rambla s={s} />
      )}
    </Palco>
  );
};
