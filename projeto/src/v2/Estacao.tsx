import { useMemo } from "react";
import * as THREE from "three";
import { random } from "remotion";

// Estação espacial. O interior é um módulo cilíndrico ao longo do eixo z,
// com a janela grande na ponta em z = Z_JANELA (o astronauta olha para -z).
export const RAIO_MODULO = 2.1;
export const Z_JANELA = -1.8;
export const RAIO_JANELA = 1.45;

const canvasTextura = (w: number, h: number, desenhar: (ctx: CanvasRenderingContext2D) => void) => {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  desenhar(canvas.getContext("2d")!);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
};

const texturaPainel = () =>
  canvasTextura(512, 512, (ctx) => {
    ctx.fillStyle = "#d6dbe0";
    ctx.fillRect(0, 0, 512, 512);
    for (let j = 0; j < 4; j++) {
      for (let i = 0; i < 4; i++) {
        const x = i * 128;
        const y = j * 128;
        ctx.fillStyle = random(`painel-${i}-${j}`) > 0.7 ? "#c4cad1" : "#dde2e7";
        ctx.fillRect(x + 4, y + 4, 120, 120);
        ctx.strokeStyle = "#9aa2ab";
        ctx.lineWidth = 3;
        ctx.strokeRect(x + 4, y + 4, 120, 120);
        // Parafusos nos cantos
        ctx.fillStyle = "#7f8892";
        for (const [px, py] of [[12, 12], [116, 12], [12, 116], [116, 116]]) {
          ctx.beginPath();
          ctx.arc(x + px, y + py, 3, 0, Math.PI * 2);
          ctx.fill();
        }
        // Etiquetas e pequenos detalhes
        if (random(`etq-${i}-${j}`) > 0.6) {
          ctx.fillStyle = random(`etq-c-${i}-${j}`) > 0.5 ? "#f2c94c" : "#5b8def";
          ctx.fillRect(x + 30, y + 40, 50, 14);
          ctx.fillStyle = "#333";
          ctx.fillRect(x + 30, y + 62, 64, 4);
          ctx.fillRect(x + 30, y + 72, 40, 4);
        }
      }
    }
  });

const texturaTela = (semente: number) =>
  canvasTextura(256, 160, (ctx) => {
    ctx.fillStyle = "#06121f";
    ctx.fillRect(0, 0, 256, 160);
    ctx.strokeStyle = "rgba(80,200,255,0.25)";
    for (let x = 0; x < 256; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 160);
      ctx.stroke();
    }
    ctx.strokeStyle = semente % 2 ? "#46e0a0" : "#5cc8ff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let x = 0; x <= 256; x += 8) {
      const y = 80 + Math.sin(x * 0.05 + semente) * 30 + (random(`tela-${semente}-${x}`) - 0.5) * 16;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.fillStyle = "#ffd60a";
    ctx.fillRect(12, 12, 60, 8);
    ctx.fillStyle = "#5cc8ff";
    ctx.fillRect(12, 26, 100, 6);
  });

const texturaPainelSolar = () =>
  canvasTextura(256, 512, (ctx) => {
    ctx.fillStyle = "#0d2347";
    ctx.fillRect(0, 0, 256, 512);
    ctx.strokeStyle = "#5b7fb5";
    ctx.lineWidth = 2;
    for (let x = 0; x <= 256; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 512);
      ctx.stroke();
    }
    for (let y = 0; y <= 512; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(256, y);
      ctx.stroke();
    }
    ctx.strokeStyle = "#c9a646";
    ctx.lineWidth = 6;
    ctx.strokeRect(3, 3, 250, 506);
  });

// ---------------- Interior ----------------
export const InteriorEstacao: React.FC<{ tempo: number }> = ({ tempo }) => {
  const painel = useMemo(() => {
    const t = texturaPainel();
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(6, 3);
    return t;
  }, []);
  const telas = useMemo(() => [0, 1, 2, 3].map(texturaTela), []);
  const parede = useMemo(() => {
    const t = texturaPainel();
    return t;
  }, []);
  const COMPRIMENTO = 7;
  const zCentro = Z_JANELA + COMPRIMENTO / 2;

  // Objetos soltos flutuando devagar (sem gravidade)
  const soltos = [
    { pos: [-1.1, 0.9, 0.4], tam: [0.16, 0.22, 0.01], cor: "#f5f5f5", giro: [0.3, 0.5, 0.2] },
    { pos: [-1.0, 0.5, 1.2], tam: [0.015, 0.015, 0.16], cor: "#2f80ed", giro: [0.8, 0.2, 0.6] },
    { pos: [-0.9, -0.9, 2.2], tam: [0.18, 0.12, 0.1], cor: "#e07a2f", giro: [0.2, 0.4, 0.1] },
  ] as const;

  return (
    <group>
      {/* Paredes do módulo (vistas por dentro) */}
      <mesh position={[0, 0, zCentro]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[RAIO_MODULO, RAIO_MODULO, COMPRIMENTO, 48, 1, true]} />
        <meshStandardMaterial map={painel} side={THREE.BackSide} roughness={0.7} metalness={0.1} />
      </mesh>
      {/* Parede do fundo (atrás da câmera) */}
      <mesh position={[0, 0, Z_JANELA + COMPRIMENTO]} rotation={[0, Math.PI, 0]}>
        <circleGeometry args={[RAIO_MODULO, 48]} />
        <meshStandardMaterial map={parede} roughness={0.7} />
      </mesh>
      {/* Parede da janela: anel entre a janela e o casco */}
      <mesh position={[0, 0, Z_JANELA]}>
        <ringGeometry args={[RAIO_JANELA, RAIO_MODULO, 64, 1]} />
        <meshStandardMaterial map={parede} roughness={0.7} side={THREE.DoubleSide} />
      </mesh>
      {/* Moldura da janela */}
      <mesh position={[0, 0, Z_JANELA + 0.02]}>
        <torusGeometry args={[RAIO_JANELA, 0.09, 16, 96]} />
        <meshStandardMaterial color="#8c959f" roughness={0.3} metalness={0.8} />
      </mesh>
      {Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * (RAIO_JANELA + 0.05), Math.sin(a) * (RAIO_JANELA + 0.05), Z_JANELA + 0.08]}
            rotation={[0, 0, a]}
          >
            <boxGeometry args={[0.18, 0.08, 0.12]} />
            <meshStandardMaterial color="#6f7882" roughness={0.4} metalness={0.7} />
          </mesh>
        );
      })}
      {/* Vidro: quase transparente, com um leve tom azulado */}
      <mesh position={[0, 0, Z_JANELA - 0.01]}>
        <circleGeometry args={[RAIO_JANELA, 64]} />
        <meshStandardMaterial color="#bfe0ff" transparent opacity={0.05} roughness={0} metalness={0.3} depthWrite={false} />
      </mesh>
      {/* Nervuras metálicas */}
      {Array.from({ length: 5 }, (_, i) => (
        <mesh key={i} position={[0, 0, Z_JANELA + 0.9 + i * 1.4]}>
          <torusGeometry args={[RAIO_MODULO - 0.06, 0.06, 10, 64]} />
          <meshStandardMaterial color="#aab2bb" roughness={0.35} metalness={0.6} />
        </mesh>
      ))}
      {/* Corrimãos azuis */}
      {[0.6, 2.2, 3.7, 5.1].map((a) => (
        <mesh
          key={a}
          position={[Math.cos(a) * (RAIO_MODULO - 0.25), Math.sin(a) * (RAIO_MODULO - 0.25), zCentro + 0.5]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[0.025, 0.025, COMPRIMENTO - 1.6, 10]} />
          <meshStandardMaterial color="#3a6fd8" roughness={0.4} metalness={0.3} />
        </mesh>
      ))}
      {/* Racks de equipamento com telas acesas */}
      {[
        { a: 0.0, z: 1.0, tela: 0 },
        { a: Math.PI, z: 0.6, tela: 1 },
        { a: Math.PI * 1.35, z: 2.4, tela: 2 },
        { a: Math.PI * 0.3, z: 3.0, tela: 3 },
      ].map((r, i) => {
        const raio = RAIO_MODULO - 0.32;
        return (
          <group
            key={i}
            position={[Math.cos(r.a) * raio, Math.sin(r.a) * raio, r.z]}
            rotation={[0, 0, r.a + Math.PI / 2]}
          >
            <mesh>
              <boxGeometry args={[0.9, 0.3, 0.8]} />
              <meshStandardMaterial color="#b9c0c7" roughness={0.6} metalness={0.2} />
            </mesh>
            <mesh position={[0, -0.155, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.7, 0.44]} />
              <meshStandardMaterial
                map={telas[r.tela]}
                emissive="#ffffff"
                emissiveMap={telas[r.tela]}
                emissiveIntensity={1.1}
              />
            </mesh>
          </group>
        );
      })}
      {/* Faixas de luz no teto */}
      {[-0.5, 0.5].map((x) => (
        <mesh key={x} position={[x, RAIO_MODULO - 0.12, zCentro + 0.6]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.12, COMPRIMENTO - 2]} />
          <meshBasicMaterial color="#e8f4ff" toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
      ))}
      <pointLight position={[0, 1.4, 1.2]} color="#dbeaff" intensity={6} distance={9} decay={2} />
      <pointLight position={[0, -1.2, 3.2]} color="#ffe2c4" intensity={3} distance={8} decay={2} />
      {soltos.map((s, i) => (
        <mesh
          key={i}
          position={[s.pos[0], s.pos[1] + Math.sin(tempo * 0.6 + i) * 0.05, s.pos[2]]}
          rotation={[s.giro[0] * tempo, s.giro[1] * tempo, s.giro[2] * tempo]}
        >
          <boxGeometry args={s.tam as unknown as [number, number, number]} />
          <meshStandardMaterial color={s.cor} roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
};

// ---------------- Exterior (visto de fora) ----------------
export const ExteriorEstacao: React.FC = () => {
  const solar = useMemo(() => {
    const t = texturaPainelSolar();
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(2, 3);
    return t;
  }, []);
  const casco = useMemo(() => {
    const t = texturaPainel();
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(5, 3);
    return t;
  }, []);
  return (
    <group>
      {/* Módulo principal (a janela fica na ponta em -z) */}
      <mesh position={[0, 0, 1.7]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[RAIO_MODULO + 0.05, RAIO_MODULO + 0.05, 7, 64]} />
        <meshStandardMaterial map={casco} color="#f4f1e8" roughness={0.8} />
      </mesh>
      {[-1.6, 5.1].map((z) => (
        <mesh key={z} position={[0, 0, z]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[RAIO_MODULO + 0.1, RAIO_MODULO + 0.1, 0.18, 64]} />
          <meshStandardMaterial color="#a9a499" roughness={0.6} metalness={0.3} />
        </mesh>
      ))}
      {/* Módulo de trás, mais estreito, e nó de conexão */}
      <mesh position={[0, 0, 8.6]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.5, 1.5, 6, 48]} />
        <meshStandardMaterial map={casco} color="#e2ddd0" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0, 12]}>
        <sphereGeometry args={[1.7, 32, 24]} />
        <meshStandardMaterial color="#d8d3c6" roughness={0.7} />
      </mesh>
      {/* Antena */}
      <mesh position={[0, 2.8, 6]}>
        <cylinderGeometry args={[0.05, 0.05, 2.4, 8]} />
        <meshStandardMaterial color="#9aa3ad" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 4.0, 6]} rotation={[0.5, 0, 0]}>
        <coneGeometry args={[0.7, 0.35, 24, 1, true]} />
        <meshStandardMaterial color="#eeeeee" side={THREE.DoubleSide} roughness={0.5} />
      </mesh>
      {/* Janela vista de fora: vidro escuro com moldura */}
      <mesh position={[0, 0, Z_JANELA - 0.02]} rotation={[0, Math.PI, 0]}>
        <circleGeometry args={[RAIO_JANELA, 48]} />
        <meshStandardMaterial color="#0e1a2a" roughness={0.05} metalness={0.9} />
      </mesh>
      <mesh position={[0, 0, Z_JANELA - 0.04]}>
        <torusGeometry args={[RAIO_JANELA, 0.12, 12, 64]} />
        <meshStandardMaterial color="#9aa3ad" roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Luz interna vista pela janela */}
      <mesh position={[0, 0, Z_JANELA - 0.03]} rotation={[0, Math.PI, 0]}>
        <circleGeometry args={[RAIO_JANELA * 0.6, 32]} />
        <meshBasicMaterial color="#ffe8c2" transparent opacity={0.25} />
      </mesh>
      {/* Treliça e painéis solares */}
      <mesh position={[0, 0, 9]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.4, 34, 0.4]} />
        <meshStandardMaterial color="#a7a9ad" roughness={0.5} metalness={0.6} />
      </mesh>
      {[-1, 1].map((lado) =>
        [-1, 1].map((frente) => (
          <mesh
            key={`${lado}-${frente}`}
            position={[lado * 11, 0, 9 + frente * 2.4]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[12, 4]} />
            <meshStandardMaterial
              map={solar}
              roughness={0.3}
              metalness={0.5}
              emissive="#0b1f44"
              emissiveIntensity={0.4}
              side={THREE.DoubleSide}
            />
          </mesh>
        )),
      )}
      {/* Radiadores brancos */}
      {[-1, 1].map((lado) => (
        <mesh key={lado} position={[lado * 3.0, -1.2, 8.5]} rotation={[0, 0, lado * 0.4]}>
          <boxGeometry args={[3.5, 0.05, 2]} />
          <meshStandardMaterial color="#f2f2ee" roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
};
