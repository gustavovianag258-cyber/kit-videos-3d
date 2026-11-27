import { useMemo } from "react";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";
import { AbsoluteFill, interpolate, random, useVideoConfig } from "remotion";
import { useTempoGuia } from "./relogio";
import { Camera, Estrelas } from "../v2/mundo";
import { SolVisivel } from "../v2/Sol";
import { trajeto, type Chave } from "./cenario";
import { CENAS, clamp, MARCOS, type Vec3 } from "./tempo";

// Cenas que não acontecem na Paulista: padaria, praia de Santos, espaço e Lua.

const useSegundos = (_inicio: number) => {
  const { s, frame } = useTempoGuia();
  return { s, frameGlobal: frame };
};

// ---------- Texturas feitas na hora (sem arquivos de imagem) ----------
const texturaTerra = () => {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 512;
  const ctx = c.getContext("2d")!;
  const mar = ctx.createLinearGradient(0, 0, 0, 512);
  mar.addColorStop(0, "#0b3d6b");
  mar.addColorStop(0.5, "#1565a8");
  mar.addColorStop(1, "#0b3d6b");
  ctx.fillStyle = mar;
  ctx.fillRect(0, 0, 1024, 512);
  // Continentes: manchas verdes e marrons
  for (let i = 0; i < 40; i++) {
    const x = random(`ct-x-${i}`) * 1024;
    const y = 90 + random(`ct-y-${i}`) * 330;
    ctx.fillStyle = random(`ct-c-${i}`) > 0.35 ? "#3f7d3a" : "#8a7343";
    ctx.beginPath();
    ctx.ellipse(x, y, 20 + random(`ct-a-${i}`) * 70, 14 + random(`ct-b-${i}`) * 45, random(`ct-r-${i}`) * 3, 0, Math.PI * 2);
    ctx.fill();
  }
  // Polos e nuvens
  ctx.fillStyle = "#eef4f8";
  ctx.fillRect(0, 0, 1024, 26);
  ctx.fillRect(0, 486, 1024, 26);
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  for (let i = 0; i < 70; i++) {
    ctx.beginPath();
    ctx.ellipse(random(`nv-x-${i}`) * 1024, random(`nv-y-${i}`) * 512, 30 + random(`nv-a-${i}`) * 60, 6 + random(`nv-b-${i}`) * 10, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

const texturaLua = () => {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 512;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#9a9a96";
  ctx.fillRect(0, 0, 1024, 512);
  // "Mares" escuros e crateras com borda clara
  for (let i = 0; i < 14; i++) {
    ctx.fillStyle = "rgba(70,70,72,0.45)";
    ctx.beginPath();
    ctx.ellipse(random(`mr-x-${i}`) * 1024, 100 + random(`mr-y-${i}`) * 300, 40 + random(`mr-a-${i}`) * 110, 30 + random(`mr-b-${i}`) * 70, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  for (let i = 0; i < 260; i++) {
    const x = random(`cr-x-${i}`) * 1024;
    const y = random(`cr-y-${i}`) * 512;
    const r = 2 + random(`cr-r-${i}`) ** 3 * 26;
    ctx.fillStyle = "rgba(60,60,60,0.5)";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(220,220,215,0.45)";
    ctx.lineWidth = Math.max(1, r * 0.18);
    ctx.beginPath();
    ctx.arc(x - r * 0.1, y - r * 0.1, r, Math.PI * 0.9, Math.PI * 1.9);
    ctx.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

const Terra: React.FC<{ raio: number; giro: number }> = ({ raio, giro }) => {
  const mapa = useMemo(texturaTerra, []);
  return (
    <group rotation={[0.41, giro, 0]}>
      <mesh>
        <sphereGeometry args={[raio, 64, 64]} />
        <meshStandardMaterial map={mapa} roughness={0.75} />
      </mesh>
      {/* Brilho azul da atmosfera */}
      <mesh scale={1.03}>
        <sphereGeometry args={[raio, 48, 48]} />
        <meshBasicMaterial
          color="#6fb6ff"
          transparent
          opacity={0.22}
          side={THREE.BackSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
};

const Lua: React.FC<{ raio: number; giro?: number; brilho?: number }> = ({ raio, giro = 0, brilho = 0 }) => {
  const mapa = useMemo(texturaLua, []);
  return (
    <mesh rotation={[0, giro, 0]}>
      <sphereGeometry args={[raio, 64, 64]} />
      <meshStandardMaterial map={mapa} roughness={0.95} emissive="#ffffff" emissiveMap={mapa} emissiveIntensity={brilho} />
    </mesh>
  );
};

// ---------- Padaria: a água ferve a 80 °C ----------
export const CenaPanela: React.FC<{ inicio: number }> = ({ inicio }) => {
  const { width, height } = useVideoConfig();
  const { s } = useSegundos(inicio);
  const t = s - inicio;
  const bolhas = Array.from({ length: 26 }, (_, i) => {
    const periodo = 0.6 + random(`bo-p-${i}`) * 0.8;
    const fase = (((t + random(`bo-f-${i}`) * periodo) % periodo) + periodo) % periodo / periodo;
    const ang = random(`bo-a-${i}`) * Math.PI * 2;
    const r = Math.sqrt(random(`bo-r-${i}`)) * 0.17;
    return { x: Math.cos(ang) * r, z: Math.sin(ang) * r, y: 0.55 + fase * 0.42, esc: 0.008 + fase * 0.018, o: 1 - fase };
  });
  const vapor = Array.from({ length: 10 }, (_, i) => {
    const per = 2.2;
    const fase = (((t + i * 0.22) % per) + per) % per / per;
    return { x: Math.sin(i * 2.3) * 0.1 + fase * 0.05, y: 1.0 + fase * 0.7, esc: 0.025 + fase * 0.1, o: 0.22 * (1 - fase) };
  });
  return (
    <AbsoluteFill style={{ background: "#2a1d14" }}>
      <ThreeCanvas width={width} height={height} camera={{ fov: 40, near: 0.05, far: 50 }}>
        <Camera posicao={[0.25, 1.55 - t * 0.03, 2.1 - t * 0.12]} alvo={[0.1, 0.82, 0]} />
        <ambientLight intensity={0.35} />
        <pointLight position={[0.8, 2.2, 1.2]} color="#ffd59a" intensity={6} decay={1.5} />
        <pointLight position={[-1.2, 1.5, -0.5]} color="#9fc4ff" intensity={1.5} decay={1.5} />
        {/* Balcão e azulejos */}
        <mesh position={[0, 0.25, 0]} receiveShadow>
          <boxGeometry args={[3, 0.5, 1.4]} />
          <meshStandardMaterial color="#5b4636" roughness={0.8} />
        </mesh>
        <mesh position={[0, 1.4, -0.75]}>
          <planeGeometry args={[4, 2.4]} />
          <meshStandardMaterial color="#d9e3dc" roughness={0.6} />
        </mesh>
        {/* Fogão e panela */}
        <mesh position={[0, 0.52, 0]}>
          <cylinderGeometry args={[0.24, 0.24, 0.04, 32]} />
          <meshStandardMaterial color="#222" />
        </mesh>
        <mesh position={[0, 0.76, 0]}>
          <cylinderGeometry args={[0.22, 0.2, 0.44, 40, 1, true]} />
          <meshStandardMaterial color="#b8bec6" metalness={0.8} roughness={0.25} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0.96, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.215, 40]} />
          <meshStandardMaterial color="#c9dde6" roughness={0.1} metalness={0.2} transparent opacity={0.9} />
        </mesh>
        {bolhas.map((b, i) => (
          <mesh key={i} position={[b.x, Math.min(b.y, 0.97), b.z]} scale={b.esc}>
            <sphereGeometry args={[1, 10, 10]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.7 * b.o} />
          </mesh>
        ))}
        {vapor.map((v, i) => (
          <mesh key={`v${i}`} position={[v.x, v.y, 0]} scale={v.esc}>
            <sphereGeometry args={[1, 14, 14]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={v.o} depthWrite={false} />
          </mesh>
        ))}
        {/* Xícara de café ao lado */}
        <group position={[0.55, 0.5, 0.2]}>
          <mesh position={[0, 0.06, 0]}>
            <cylinderGeometry args={[0.06, 0.05, 0.12, 24]} />
            <meshStandardMaterial color="#f4f1ea" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.115, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.055, 24]} />
            <meshStandardMaterial color="#a9773f" />
          </mesh>
        </group>
      </ThreeCanvas>
    </AbsoluteFill>
  );
};

// ---------- Santos: a Lua indo embora ----------
export const CenaLua: React.FC<{ inicio: number }> = ({ inicio }) => {
  const { width, height } = useVideoConfig();
  const { s } = useSegundos(inicio);
  const t = s - CENAS.lua.inicio;
  // Menor a cada corte, e ainda diminuindo devagar dentro de cada plano
  const degrau = s < 54.9 ? 1 : s < 56.7 ? 0.7 : 0.48;
  const escala = degrau * (1 - 0.03 * (t % 1.8));
  const posLua: Vec3 = [10, 30, -140];
  // Prédios da orla: uma fileira à esquerda, acompanhando a praia até o horizonte
  const predios = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => ({
        x: -34 - random(`st-x-${i}`) * 6,
        z: 10 - i * 9,
        h: 14 + random(`st-h-${i}`) * 22,
        l: 5 + random(`st-l-${i}`) * 3,
      })),
    [],
  );
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #050914 0%, #0d1a33 60%, #1c2c4a 100%)" }}>
      <ThreeCanvas width={width} height={height} camera={{ fov: 55, near: 0.1, far: 2000 }}>
        <Camera posicao={[0, 1.6, 8 - t * 0.15]} alvo={[6, 16, -100]} />
        <Estrelas raio={900} quantidade={1500} />
        <ambientLight intensity={0.15} />
        <directionalLight position={posLua} color="#cfdcff" intensity={0.9 * escala + 0.2} />
        <group position={posLua} scale={escala}>
          <Lua raio={6} brilho={0.55} />
        </group>
        {/* Reflexo da Lua no mar */}
        <mesh position={[7, 0.02, -75]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.5 * escala, 130]} />
          <meshBasicMaterial color="#9fb7e0" transparent opacity={0.16 * escala} depthWrite={false} />
        </mesh>
        {/* Mar e areia */}
        <mesh position={[0, 0, -200]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[800, 400]} />
          <meshStandardMaterial color="#081628" roughness={0.85} metalness={0} />
        </mesh>
        <mesh position={[0, 0.03, -2.5]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[60, 0.35]} />
          <meshBasicMaterial color="#c9d6e6" transparent opacity={0.5} />
        </mesh>
        <mesh position={[0, 0.05, 6]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[80, 17]} />
          <meshStandardMaterial color="#6b6150" roughness={1} />
        </mesh>
        {/* Prédios da orla, recortados contra o céu */}
        {predios.map((p, i) => (
          <mesh key={i} position={[p.x, p.h / 2, p.z]}>
            <boxGeometry args={[p.l, p.h, 7]} />
            <meshStandardMaterial color="#0a0f18" roughness={1} />
          </mesh>
        ))}
      </ThreeCanvas>
    </AbsoluteFill>
  );
};

// ---------- Espaço: a Terra se solta do Sol ----------
const R_ORBITA = 16;
const OMEGA = 0.35; // rad/s (acelerado para caber no vídeo)
const ANG0 = -0.4;

const posTerra = (s: number): { pos: Vec3; dir: Vec3 } => {
  const tSolta = MARCOS.terraSolta;
  const ang = ANG0 + OMEGA * (Math.min(s, tSolta) - CENAS.terra.inicio);
  const p: Vec3 = [Math.cos(ang) * R_ORBITA, 0, Math.sin(ang) * R_ORBITA];
  // Tangente da órbita (sentido do movimento)
  const dir: Vec3 = [-Math.sin(ang), 0, Math.cos(ang)];
  if (s <= tSolta) return { pos: p, dir };
  // Depois de solta segue reto pela tangente, perdendo um pouco de velocidade
  const dt = s - tSolta;
  const d = OMEGA * R_ORBITA * dt - 0.25 * dt * dt;
  return { pos: [p[0] + dir[0] * d, 0, p[2] + dir[2] * d], dir };
};

export const CenaEspaco: React.FC<{ inicio: number }> = ({ inicio }) => {
  const { width, height } = useVideoConfig();
  const { s } = useSegundos(inicio);
  const terra = posTerra(s);
  const solta = s > MARCOS.terraSolta;
  // Antes: vista da órbita. Depois: a câmera vai na frente da Terra e para fora da órbita,
  // olhando de volta — a Terra iluminada de lado e o Sol ficando pequeno lá atrás.
  const fora: Vec3 = [terra.dir[2], 0, -terra.dir[0]]; // perpendicular à tangente, para longe do Sol
  const frente: Vec3 = [
    terra.pos[0] + terra.dir[0] * 4.5 + fora[0] * 2.8,
    1.4,
    terra.pos[2] + terra.dir[2] * 4.5 + fora[2] * 2.8,
  ];
  const entreTerraESol: Vec3 = [terra.pos[0] * 0.8, 0, terra.pos[2] * 0.8];
  // Enquanto ainda gira: câmera acompanha a Terra por fora da órbita, com o Sol ao fundo
  const acompanhando: Vec3 = [
    terra.pos[0] + fora[0] * 7 - terra.dir[0] * 4,
    3.2,
    terra.pos[2] + fora[2] * 7 - terra.dir[2] * 4,
  ];
  const meioCaminho: Vec3 = [terra.pos[0] * 0.55, 0, terra.pos[2] * 0.55];
  const chaves: Chave[] = [
    { t: CENAS.terra.inicio, pos: acompanhando, alvo: meioCaminho },
    { t: MARCOS.terraSolta, pos: acompanhando, alvo: meioCaminho },
    { t: MARCOS.terraSolta + 1.4, pos: frente, alvo: entreTerraESol },
    { t: CENAS.terra.fim, pos: frente, alvo: entreTerraESol },
  ];
  const cam = trajeto(chaves, s);
  // A linha da órbita some depois que a Terra sai dela
  const orbita = interpolate(s, [MARCOS.terraSolta, MARCOS.terraSolta + 1.5], [0.4, 0.12], clamp);
  return (
    <AbsoluteFill style={{ background: "#010104" }}>
      <ThreeCanvas width={width} height={height} camera={{ fov: 48, near: 0.05, far: 5000 }}>
        <Camera posicao={cam.pos} alvo={cam.alvo} />
        <Estrelas raio={3000} quantidade={2500} />
        <SolVisivel posicao={[0, 0, 0]} raio={2.2} brilho={1} />
        <pointLight position={[0, 0, 0]} color="#fff3df" intensity={3.2} decay={0} />
        <ambientLight intensity={0.04} />
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[R_ORBITA, 0.03, 8, 200]} />
          <meshBasicMaterial color="#9fc4ff" transparent opacity={orbita} />
        </mesh>
        {solta && (
          // Rastro reto mostrando a saída pela tangente
          <mesh
            position={[
              (posTerra(MARCOS.terraSolta).pos[0] + terra.pos[0]) / 2,
              0,
              (posTerra(MARCOS.terraSolta).pos[2] + terra.pos[2]) / 2,
            ]}
            rotation={[0, Math.atan2(terra.dir[0], terra.dir[2]), 0]}
          >
            <boxGeometry args={[0.03, 0.03, Math.hypot(terra.pos[0] - posTerra(MARCOS.terraSolta).pos[0], terra.pos[2] - posTerra(MARCOS.terraSolta).pos[2])]} />
            <meshBasicMaterial color="#ffd27a" transparent opacity={0.6} />
          </mesh>
        )}
        <group position={terra.pos}>
          <Terra raio={0.9} giro={s * 0.8} />
        </group>
      </ThreeCanvas>
    </AbsoluteFill>
  );
};

// ---------- Volta ao real: laser no espelho da Lua ----------
const NORMAL_ESPELHO: Vec3 = (() => {
  const v = [0.28, 0.32, 0.9];
  const n = Math.hypot(v[0], v[1], v[2]);
  return [v[0] / n, v[1] / n, v[2] / n] as Vec3;
})();

export const CenaLaser: React.FC<{ inicio: number }> = ({ inicio }) => {
  const { width, height } = useVideoConfig();
  const { s } = useSegundos(inicio);
  const R = 5;
  const espelho: Vec3 = [NORMAL_ESPELHO[0] * R, NORMAL_ESPELHO[1] * R, NORMAL_ESPELHO[2] * R];
  // O laser vem "da Terra": de baixo e da frente
  const origem: Vec3 = [espelho[0] - 10, espelho[1] - 22, espelho[2] + 40];
  const meio: Vec3 = [(origem[0] + espelho[0]) / 2, (origem[1] + espelho[1]) / 2, (origem[2] + espelho[2]) / 2];
  const comp = Math.hypot(espelho[0] - origem[0], espelho[1] - origem[1], espelho[2] - origem[2]);
  const ligado = interpolate(s, [MARCOS.laser, MARCOS.laser + 0.4], [0, 1], clamp);
  const raio = useMemo(() => {
    const q = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(espelho[0] - origem[0], espelho[1] - origem[1], espelho[2] - origem[2]).normalize(),
    );
    return new THREE.Euler().setFromQuaternion(q);
  }, [espelho, origem]);
  const orientEspelho = useMemo(() => {
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(...NORMAL_ESPELHO));
    return new THREE.Euler().setFromQuaternion(q);
  }, []);
  // Pulsos de luz subindo pelo feixe
  const pulsos = [0, 0.33, 0.66].map((k) => ((s * 0.9 + k) % 1));
  const cam = trajeto(
    [
      { t: CENAS.real.inicio, pos: [12, 4, 20], alvo: [0, 0, 0] },
      { t: MARCOS.laser + 1.5, pos: [9, 4.5, 14], alvo: [espelho[0] * 0.6, espelho[1] * 0.6, espelho[2] * 0.6] },
      { t: CENAS.real.fim, pos: [espelho[0] + 1.6, espelho[1] + 1.0, espelho[2] + 2.6], alvo: espelho },
    ],
    s,
  );
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <ThreeCanvas width={width} height={height} camera={{ fov: 45, near: 0.02, far: 5000 }}>
        <Camera posicao={cam.pos} alvo={cam.alvo} />
        <Estrelas raio={3000} quantidade={2000} />
        <ambientLight intensity={0.05} />
        <directionalLight position={[20, 8, 14]} color="#fff6e8" intensity={2.4} />
        <Lua raio={R} giro={-0.3 + s * 0.01} />
        {/* Espelho (retrorrefletor) */}
        <group position={espelho} rotation={orientEspelho}>
          <mesh position={[0, 0, 0.04]}>
            <boxGeometry args={[0.36, 0.36, 0.05]} />
            <meshStandardMaterial color="#c9ccd2" metalness={0.9} roughness={0.15} />
          </mesh>
          <mesh position={[0, 0, 0.07]}>
            <planeGeometry args={[0.3, 0.3]} />
            <meshBasicMaterial color="#d8ffe0" toneMapped={false} transparent opacity={0.25 + 0.6 * ligado} />
          </mesh>
        </group>
        {ligado > 0 && (
          <>
            <mesh position={meio} rotation={raio}>
              <cylinderGeometry args={[0.025, 0.025, comp, 8]} />
              <meshBasicMaterial color="#38ff6a" toneMapped={false} transparent opacity={0.85 * ligado} />
            </mesh>
            {pulsos.map((p, i) => (
              <mesh
                key={i}
                position={[
                  origem[0] + (espelho[0] - origem[0]) * p,
                  origem[1] + (espelho[1] - origem[1]) * p,
                  origem[2] + (espelho[2] - origem[2]) * p,
                ]}
              >
                <sphereGeometry args={[0.08, 12, 12]} />
                <meshBasicMaterial color="#c8ffd2" toneMapped={false} transparent opacity={ligado} />
              </mesh>
            ))}
          </>
        )}
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
