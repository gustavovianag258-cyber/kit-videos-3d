import { useMemo } from "react";
import * as THREE from "three";
import { random } from "remotion";
import { Bloco } from "../namorada/Bloco";
import { CameraLenta, entre, lerp, Palco, suave, texturaCanvas, tremor, type PropsPlano } from "../namorada/comum";
import { Camera } from "../v2/mundo";
import { Braco1aPessoa, Curativos, FIGURANTE, ICARO, ICARO_PRAIA, ICARO_SUJO } from "./gente";
import { MARCOS, type Vec3 } from "./tempo";

// Os testes: Boa Viagem cheia de tubarões, o prédio de 30 andares, o salto sem paraquedas
// (em primeira pessoa), a cratera e o Ícaro de pé — machucado, mas vivo.

const LuzSol: React.FC<{ forca?: number }> = ({ forca = 1 }) => (
  <>
    <ambientLight intensity={0.5 * forca} color="#fff4e0" />
    <directionalLight position={[8, 14, 6]} intensity={2.6 * forca} color="#fff1d0" castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-20} shadow-camera-right={20} shadow-camera-top={20} shadow-camera-bottom={-20} />
    <hemisphereLight args={["#9fd3ff", "#e7c88f", 0.55 * forca]} />
  </>
);

const Ceu: React.FC<{ topo?: string; base?: string; raio?: number }> = ({ topo = "#3d9bff", base = "#cdeeff", raio = 300 }) => {
  const tex = useMemo(
    () =>
      texturaCanvas(16, 256, (ctx) => {
        const g = ctx.createLinearGradient(0, 0, 0, 256);
        g.addColorStop(0, topo);
        g.addColorStop(0.55, base);
        g.addColorStop(1, base);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 16, 256);
      }),
    [topo, base],
  );
  return (
    <mesh>
      <sphereGeometry args={[raio, 32, 16]} />
      <meshBasicMaterial map={tex} side={THREE.BackSide} toneMapped={false} depthWrite={false} />
    </mesh>
  );
};

// Mar low-poly com ondinhas (vértices animados)
const Mar: React.FC<{ s: number; tam?: number; cor?: string; y?: number }> = ({ s, tam = 120, cor = "#1b8ec9", y = 0 }) => {
  const geo = useMemo(() => new THREE.PlaneGeometry(tam, tam, 60, 60), [tam]);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getY(i);
    pos.setZ(i, Math.sin(x * 0.55 + s * 1.8) * 0.12 + Math.sin(z * 0.8 + s * 1.3) * 0.09);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return (
    <mesh geometry={geo} rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]} receiveShadow>
      <meshStandardMaterial color={cor} roughness={0.25} metalness={0.1} flatShading transparent opacity={0.93} />
    </mesh>
  );
};

// Fileira de prédios da orla (Boa Viagem é famosa pelo paredão de prédios na beira-mar)
const Orla: React.FC<{ z: number; n?: number; de?: number; passo?: number }> = ({ z, n = 16, de = -40, passo = 5.5 }) => {
  const tex = useMemo(
    () =>
      texturaCanvas(
        64,
        128,
        (ctx) => {
          ctx.fillStyle = "#f2ece0";
          ctx.fillRect(0, 0, 64, 128);
          ctx.fillStyle = "#4f7ea8";
          for (let y = 4; y < 128; y += 12) for (let x = 4; x < 64; x += 15) ctx.fillRect(x, y, 10, 7);
        },
        [1, 6],
      ),
    [],
  );
  return (
    <group>
      {Array.from({ length: n }, (_, i) => {
        const h = 18 + random(`ph${i}`) * 30;
        return (
          <mesh key={i} position={[de + i * passo, h / 2, z - random(`pz${i}`) * 3]} castShadow>
            <boxGeometry args={[4.2, h, 4]} />
            <meshStandardMaterial map={tex} color={["#ffffff", "#ffe6cc", "#e6f0ff", "#fff5d6"][i % 4]} />
          </mesh>
        );
      })}
    </group>
  );
};

const Coqueiro: React.FC<{ pos: Vec3; s: number; h?: number }> = ({ pos, s, h = 4.5 }) => (
  <group position={pos}>
    <mesh position={[0, h / 2, 0]} rotation={[0, 0, 0.08]}>
      <cylinderGeometry args={[0.12, 0.18, h, 6]} />
      <meshStandardMaterial color="#8a6a45" />
    </mesh>
    {Array.from({ length: 7 }, (_, i) => (
      <mesh key={i} position={[0.2, h, 0]} rotation={[Math.sin(s * 1.5 + i) * 0.06 + 0.9, (i / 7) * Math.PI * 2, 0]}>
        <boxGeometry args={[0.35, 0.05, 2.2]} />
        <meshStandardMaterial color="#2f8f3a" />
      </mesh>
    ))}
  </group>
);

// Placa amarela de alerta de tubarão (existem de verdade na orla de Recife)
const PlacaTubarao: React.FC<{ pos: Vec3; giro?: number }> = ({ pos, giro = 0 }) => {
  const tex = useMemo(
    () =>
      texturaCanvas(256, 320, (ctx) => {
        ctx.fillStyle = "#ffd400";
        ctx.fillRect(0, 0, 256, 320);
        ctx.strokeStyle = "#111";
        ctx.lineWidth = 12;
        ctx.strokeRect(8, 8, 240, 304);
        ctx.fillStyle = "#d62828";
        ctx.font = "bold 46px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("PERIGO", 128, 66);
        // tubarão
        ctx.fillStyle = "#111";
        ctx.beginPath();
        ctx.moveTo(40, 190);
        ctx.quadraticCurveTo(128, 120, 216, 180);
        ctx.lineTo(236, 150);
        ctx.lineTo(228, 200);
        ctx.quadraticCurveTo(128, 230, 40, 190);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(118, 140);
        ctx.lineTo(150, 95);
        ctx.lineTo(160, 145);
        ctx.fill();
        ctx.fillStyle = "#111";
        ctx.font = "bold 26px sans-serif";
        ctx.fillText("ÁREA SUJEITA A", 128, 262);
        ctx.fillText("INCIDENTES", 128, 292);
      }),
    [],
  );
  return (
    <group position={pos} rotation={[0, giro, 0]}>
      <mesh position={[0, 1.2, 0]}>
        <boxGeometry args={[0.08, 2.4, 0.08]} />
        <meshStandardMaterial color="#9ca3af" />
      </mesh>
      <mesh position={[0, 2.35, 0.05]}>
        <planeGeometry args={[1.2, 1.5]} />
        <meshStandardMaterial map={tex} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

// Tubarão low-poly (corpo, barbatana, cauda batendo)
const Tubarao: React.FC<{ pos: Vec3; giroY: number; s: number; boca?: number; escala?: number }> = ({ pos, giroY, s, boca = 0, escala = 1 }) => {
  const cauda = Math.sin(s * 8) * 0.35;
  return (
    <group position={pos} rotation={[0, giroY, 0]} scale={escala}>
      <mesh rotation={[0, 0, Math.PI / 2]} scale={[0.55, 1, 0.45]}>
        <octahedronGeometry args={[1.1, 0]} />
        <meshStandardMaterial color="#6b7c8f" flatShading roughness={0.5} />
      </mesh>
      {/* barriga clara */}
      <mesh position={[0.1, -0.18, 0]} rotation={[0, 0, Math.PI / 2]} scale={[0.4, 0.9, 0.38]}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#e5e7eb" flatShading />
      </mesh>
      {/* barbatana dorsal (é o que aparece fora d'água) */}
      <mesh position={[0, 0.55, 0]} rotation={[0, Math.PI / 2, 0]}>
        <coneGeometry args={[0.32, 0.8, 3]} />
        <meshStandardMaterial color="#556373" flatShading />
      </mesh>
      {/* cauda */}
      <group position={[-1.05, 0, 0]} rotation={[0, cauda, 0]}>
        <mesh position={[-0.25, 0.2, 0]} rotation={[0, 0, 0.6]}>
          <boxGeometry args={[0.5, 0.12, 0.08]} />
          <meshStandardMaterial color="#556373" />
        </mesh>
        <mesh position={[-0.2, -0.15, 0]} rotation={[0, 0, -0.5]}>
          <boxGeometry args={[0.35, 0.1, 0.08]} />
          <meshStandardMaterial color="#556373" />
        </mesh>
      </group>
      {/* boca com dentes */}
      <group position={[1.0, -0.12, 0]} rotation={[0, 0, -boca * 0.5]}>
        <mesh>
          <boxGeometry args={[0.25, 0.06 + boca * 0.15, 0.3]} />
          <meshStandardMaterial color="#7a1c1c" />
        </mesh>
        {boca > 0.2 &&
          [-0.1, 0, 0.1].map((z) => (
            <mesh key={z} position={[0.05, 0.05, z]} rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[0.03, 0.08, 4]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          ))}
      </group>
      {[-1, 1].map((l) => (
        <mesh key={l} position={[0.75, 0.08, l * 0.25]}>
          <boxGeometry args={[0.06, 0.06, 0.02]} />
          <meshBasicMaterial color="#000" />
        </mesh>
      ))}
    </group>
  );
};

// ---------- Planos ----------

// "Então… testa." — Boa Viagem: a placa de tubarão, ele indo para a água de bermuda
export const PlanoPraia: React.FC<PropsPlano> = ({ t, dur, frame, s }) => {
  const anda = t * 1.1;
  return (
    <Palco fundo="#8fd0ff" sombras far={600}>
      <CameraLenta de={[2.6, 1.3, 6.5]} para={[1.9, 1.5, 5.0]} alvo={[0, 1.4, -2]} x={t / dur} fov={44} />
      <LuzSol />
      <Ceu />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 12]} receiveShadow>
        <planeGeometry args={[200, 40]} />
        <meshStandardMaterial color="#f1dca7" />
      </mesh>
      <group position={[0, -0.05, -14]}>
        <Mar s={s} />
      </group>
      <Orla z={34} />
      <Coqueiro pos={[-4, 0, 9]} s={s} />
      <Coqueiro pos={[5, 0, 11]} s={s} h={5} />
      <PlacaTubarao pos={[-0.85, 0, 2.2]} giro={0.45} />
      <Bloco
        v={ICARO_PRAIA}
        pos={[0.55, 0, 1.6 - anda]}
        giroY={Math.PI}
        frame={frame}
        e={{ sobrancelha: -0.3, boca: "neutra" }}
        p={{ bracoE: [Math.sin(anda * 4) * 0.5, 0.08], bracoD: [-Math.sin(anda * 4) * 0.5, 0.08] }}
      />
      {/* banhistas apontando, assustados */}
      {[
        [-2.1, 1.4, 0.7],
        [2.3, 1.3, -0.7],
        [3.1, -0.6, -0.9],
      ].map(([x, z, g], i) => (
        <Bloco key={i} v={FIGURANTE(i)} pos={[x, 0, z]} giroY={g} frame={frame + i * 9} e={{ espanto: 1, boca: "aberta", sobrancelha: 1 }} p={{ bracoD: [-1.5 - Math.sin(s * 6 + i) * 0.1, -0.2], bracoE: [-0.2, 0.3] }} />
      ))}
      {/* guarda-sol */}
      <group position={[3.6, 0, 3.6]}>
        <mesh position={[0, 1.2, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 2.4, 6]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0, 2.4, 0]}>
          <coneGeometry args={[1.4, 0.5, 8]} />
          <meshStandardMaterial color="#e63946" flatShading />
        </mesh>
      </group>
    </Palco>
  );
};

// "Mar de tubarões!" — ele boiando, tubarões rodando em volta; um tenta morder o braço
export const PlanoTubaroes: React.FC<PropsPlano> = ({ t, dur, frame, s }) => {
  const mordida = MARCOS.mordida - 9.15;
  const ataque = entre(t, mordida - 0.25, mordida) * (1 - entre(t, mordida + 0.15, mordida + 0.5));
  const dor = entre(t, mordida, mordida + 0.1);
  const ang = t * 0.35;
  return (
    <Palco fundo="#8fd0ff" sombras far={600}>
      <CameraLenta de={[Math.sin(ang) * 5.2, 2.6, Math.cos(ang) * 5.2]} para={[Math.sin(ang + 0.25) * 4.6, 2.4, Math.cos(ang + 0.25) * 4.6]} alvo={[0, 0.35, 0]} x={t / dur} fov={48} treme={ataque * 0.02} s={s} />
      <LuzSol />
      <Ceu />
      <Orla z={-60} n={22} de={-60} />
      <Mar s={s} />
      {/* ele com água no peito */}
      <Bloco v={ICARO_PRAIA} pos={[0, -1.0 + Math.sin(s * 2) * 0.04, 0]} frame={frame} e={{ espanto: dor, boca: dor > 0.5 ? "aberta" : "tremendo", abertura: dor, sobrancelha: 0.8 }} p={{ bracoE: [-0.2, 1.2], bracoD: [-0.2 - dor * 0.6, 1.2], cabeca: [0, Math.sin(t * 3) * 0.3] }} />
      {/* tubarões em volta: só as barbatanas e o dorso aparecem */}
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i / 5) * Math.PI * 2 + t * (0.9 + i * 0.07);
        const r = 2.4 + (i % 2) * 0.9;
        const atacando = i === 0 ? ataque : 0;
        const rr = lerp(r, 0.9, atacando);
        return (
          <Tubarao
            key={i}
            pos={[Math.cos(a) * rr, -0.35 + atacando * 0.45, Math.sin(a) * rr]}
            giroY={-a - Math.PI / 2 + (atacando ? 1.2 : 0)}
            s={s + i}
            boca={atacando}
            escala={0.85 + (i % 3) * 0.12}
          />
        );
      })}
      {/* espuma do ataque */}
      {ataque > 0.3 &&
        Array.from({ length: 10 }, (_, i) => (
          <mesh key={i} position={[0.7 + Math.cos(i) * 0.4 * ataque, 0.1 + random(`sp${i}`) * 0.6 * ataque, Math.sin(i) * 0.4]} scale={0.08 + random(`ss${i}`) * 0.1}>
            <icosahedronGeometry args={[1, 0]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.85} />
          </mesh>
        ))}
    </Palco>
  );
};

// Cidade vista de cima (blocos de quarteirão), usada no prédio e na queda
const Cidade: React.FC<{ n?: number; passo?: number }> = ({ n = 16, passo = 12 }) => {
  const quadras = useMemo(
    () =>
      Array.from({ length: n * n }, (_, k) => {
        const i = k % n;
        const j = Math.floor(k / n);
        const h = 4 + random(`ch${k}`) ** 2 * 26;
        return { x: (i - n / 2) * passo, z: (j - n / 2) * passo, h, cor: ["#e8e2d4", "#f2c6a0", "#cfd8e3", "#f6efe0", "#b8c9a8"][k % 5] };
      }),
    [n, passo],
  );
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[n * passo * 1.6, n * passo * 1.6]} />
        <meshStandardMaterial color="#4b5563" />
      </mesh>
      {quadras.map((q, k) => (
        <mesh key={k} position={[q.x, q.h / 2, q.z]} castShadow receiveShadow>
          <boxGeometry args={[passo * 0.7, q.h, passo * 0.7]} />
          <meshStandardMaterial color={q.cor} />
        </mesh>
      ))}
      {/* faixa de mar e areia de um lado (litoral) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[n * passo * 0.75, 0.05, 0]}>
        <planeGeometry args={[n * passo * 0.6, n * passo * 1.6]} />
        <meshStandardMaterial color="#1b8ec9" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[n * passo * 0.46, 0.04, 0]}>
        <planeGeometry args={[passo * 0.9, n * passo * 1.6]} />
        <meshStandardMaterial color="#f1dca7" />
      </mesh>
    </group>
  );
};

// Prédio de 30 andares (3 m por andar = 90 m) com as janelas
const Predio30: React.FC = () => {
  const tex = useMemo(
    () =>
      texturaCanvas(
        64,
        64,
        (ctx) => {
          ctx.fillStyle = "#e9eef5";
          ctx.fillRect(0, 0, 64, 64);
          ctx.fillStyle = "#3b6ea5";
          ctx.fillRect(6, 14, 22, 36);
          ctx.fillRect(36, 14, 22, 36);
        },
        [3, 30],
      ),
    [],
  );
  return (
    <group>
      <mesh position={[0, 45, 0]} castShadow>
        <boxGeometry args={[10, 90, 10]} />
        <meshStandardMaterial map={tex} />
      </mesh>
      <mesh position={[0, 90.2, 0]}>
        <boxGeometry args={[10.4, 0.4, 10.4]} />
        <meshStandardMaterial color="#9ca3af" />
      </mesh>
      {/* caixa d'água e antena no topo */}
      <mesh position={[-2.5, 91.4, -2.5]}>
        <boxGeometry args={[2.4, 2, 2.4]} />
        <meshStandardMaterial color="#d1d5db" />
      </mesh>
    </group>
  );
};

// "Prédio de trinta andares!" — de cima, olhando para baixo pela beira; no fim ele pula
export const PlanoPredio: React.FC<PropsPlano> = ({ t, dur, frame, s }) => {
  const pula = entre(t, 1.15, 1.7);
  return (
    <Palco fundo="#8fd0ff" sombras far={900}>
      {/* atrás dele no telhado, olhando por cima do ombro a queda até a rua */}
      <CameraLenta de={[1.3, 93.9, 0.6]} para={[1.0, 93.6, 1.4]} alvo={[0.3, 84, 15]} x={t / dur} fov={54} treme={0.008} s={s} />
      <LuzSol />
      <Ceu raio={600} />
      <Cidade />
      <group position={[0, 0, 0]}>
        <Predio30 />
      </group>
      <Bloco
        v={ICARO}
        pos={[0.3, 90.4 + Math.sin(pula * Math.PI) * 0.6 - pula * pula * 3, 4.6 + pula * 1.4]}
        giroY={0}
        frame={frame}
        e={{ sobrancelha: -0.4 + pula, espanto: pula, boca: pula > 0.3 ? "aberta" : "neutra" }}
        p={{ bracoE: [-0.4 - pula * 2.4, 0.4 + pula], bracoD: [-0.4 - pula * 2.4, 0.4 + pula], cabeca: [0.5 - pula * 0.5, 0] }}
      />
    </Palco>
  );
};

// "Paraquedas?" — na porta do avião, ele confere as costas: nada
export const PlanoAviao: React.FC<PropsPlano> = ({ t, dur, frame, s }) => {
  const olha = Math.sin(entre(t, 0.15, 0.75) * Math.PI);
  return (
    <Palco fundo="#5aa9ff" sombras far={900}>
      {/* de dentro do avião, olhando para a porta aberta (céu e nuvens atrás dele) */}
      <CameraLenta de={[1.9, 1.55, 0.25]} para={[1.6, 1.55, 0.1]} alvo={[-2.0, 1.35, 0]} x={t / dur} fov={50} treme={0.006} s={s} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[-6, 6, 2]} intensity={2.4} color="#ffffff" />
      <Ceu topo="#1e6fe0" base="#bfe3ff" />
      {/* nuvens passando lá fora */}
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={i} position={[-14 - (i % 3) * 6, -6 - (i % 4) * 3, ((i * 9 + t * 40) % 70) - 35]} scale={[4 + (i % 3), 1.5, 3]}>
          <icosahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#ffffff" flatShading />
        </mesh>
      ))}
      {/* fuselagem por dentro (piso, teto, parede com a porta aberta) */}
      <mesh position={[0.6, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4, 6]} />
        <meshStandardMaterial color="#3f4652" />
      </mesh>
      <mesh position={[0.6, 2.6, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4, 6]} />
        <meshStandardMaterial color="#cfd5dd" />
      </mesh>
      {[
        [-1.4, 1.3, -2.0, 2.6],
        [-1.4, 1.3, 2.0, 2.6],
      ].map(([x, y, z, h], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[2.4, h]} />
          <meshStandardMaterial color="#e5e9ef" side={THREE.DoubleSide} />
        </mesh>
      ))}
      <mesh position={[0.6, 1.3, -2.9]}>
        <planeGeometry args={[4, 2.6]} />
        <meshStandardMaterial color="#e5e9ef" />
      </mesh>
      {/* luz vermelha de salto */}
      <mesh position={[-1.35, 2.3, 0.9]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshBasicMaterial color={Math.floor(s * 3) % 2 ? "#22c55e" : "#14532d"} toneMapped={false} />
      </mesh>
      <Bloco
        v={ICARO}
        pos={[-0.95, 0, 0]}
        giroY={-Math.PI / 2 + olha * 2.3}
        frame={frame}
        e={{ sobrancelha: 0.9 * olha, espanto: olha * 0.4, boca: olha > 0.5 ? "meioSorriso" : "neutra" }}
        p={{ bracoE: [-0.1, 0.25 + olha * 0.3], bracoD: [-0.1, 0.25 + olha * 0.3], cotoveloE: -olha * 1.2, cotoveloD: -olha * 1.2, cabeca: [0, olha * 0.4] }}
      />
    </Palco>
  );
};

// "Sem paraquedas." — primeira pessoa: os braços abertos e o chão vindo
export const PlanoQueda: React.FC<PropsPlano> = ({ t, dur, s }) => {
  const k = entre(t, 0, dur);
  const altura = lerp(520, 16, k ** 1.5);
  const [tx, ty] = tremor(s, 0.02 + k * 0.03);
  const pos: Vec3 = [20 + tx * 30, altura, 10 + ty * 30];
  return (
    <Palco fundo="#8fd0ff" far={2000}>
      <Camera posicao={pos} alvo={[20.5, 0, 9.4]} fov={62} rolo={Math.sin(s * 2.1) * 0.1} />
      <LuzSol />
      <Ceu raio={1500} />
      <Cidade n={22} passo={14} />
      {/* nuvens atravessando na subida */}
      {Array.from({ length: 6 }, (_, i) => {
        const y = 700 - i * 110;
        return (
          <mesh key={i} position={[20 + Math.sin(i * 2) * 14, y, 10 + Math.cos(i * 3) * 14]} scale={[9, 2.5, 7]}>
            <icosahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color="#ffffff" flatShading transparent opacity={0.8} />
          </mesh>
        );
      })}
      {/* os próprios braços abertos, na borda da tela */}
      <group position={pos}>
        {/* a câmera olha para baixo: "na frente" é -y; os braços entram pelas bordas da tela */}
        <Braco1aPessoa ombro={[-0.42, -0.12, 0.3]} mao={[-0.2, -0.62, 0.05 + Math.sin(s * 9) * 0.02]} />
        <Braco1aPessoa ombro={[0.42, -0.12, -0.3]} mao={[0.2, -0.62, -0.05 - Math.sin(s * 9) * 0.02]} />
      </group>
    </Palco>
  );
};

// Cratera na rua: ele estatelado no meio, poeira subindo, gente chegando
const Rua: React.FC = () => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[60, 60]} />
      <meshStandardMaterial color="#3b3f47" />
    </mesh>
    {Array.from({ length: 10 }, (_, i) => (
      <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -25 + i * 5.5]}>
        <planeGeometry args={[0.25, 2.2]} />
        <meshStandardMaterial color="#f5d000" />
      </mesh>
    ))}
    {/* calçadas e prédios baixos */}
    {[-1, 1].map((l) => (
      <group key={l}>
        <mesh position={[l * 7.5, 0.12, 0]} receiveShadow>
          <boxGeometry args={[4, 0.25, 60]} />
          <meshStandardMaterial color="#c9c2b4" />
        </mesh>
        {Array.from({ length: 6 }, (_, i) => (
          <mesh key={i} position={[l * 12, 4 + (i % 3) * 2, -20 + i * 8]} castShadow>
            <boxGeometry args={[6, 8 + (i % 3) * 4, 7]} />
            <meshStandardMaterial color={["#f2c6a0", "#cfe3d4", "#f6efe0", "#d8c3ff"][(i + (l > 0 ? 1 : 0)) % 4]} />
          </mesh>
        ))}
      </group>
    ))}
  </group>
);

const Cratera: React.FC<{ t: number }> = ({ t }) => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
      <circleGeometry args={[2.4, 14]} />
      <meshStandardMaterial color="#26282c" />
    </mesh>
    {/* borda de asfalto quebrado */}
    {Array.from({ length: 14 }, (_, i) => {
      const a = (i / 14) * Math.PI * 2;
      return (
        <mesh key={i} position={[Math.cos(a) * 2.5, 0.15, Math.sin(a) * 2.5]} rotation={[random(`ra${i}`), a, random(`rb${i}`) * 0.6]}>
          <boxGeometry args={[0.9, 0.3, 0.6]} />
          <meshStandardMaterial color="#4b5058" flatShading />
        </mesh>
      );
    })}
    {/* poeira se espalhando */}
    {Array.from({ length: 18 }, (_, i) => {
      const a = (i / 18) * Math.PI * 2;
      const r = 1.2 + t * (2.2 + random(`pr${i}`) * 1.4);
      return (
        <mesh key={i} position={[Math.cos(a) * r, 0.4 + t * 0.6 + random(`py${i}`) * 0.6, Math.sin(a) * r]} scale={0.4 + t * 0.5}>
          <icosahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#b8a88f" transparent opacity={Math.max(0, 0.6 - t * 0.22)} depthWrite={false} flatShading />
        </mesh>
      );
    })}
  </group>
);

export const PlanoCratera: React.FC<PropsPlano> = ({ t, dur, frame, s }) => {
  const dor = entre(t, MARCOS.aiDor - 14.75, MARCOS.aiDor - 14.75 + 0.15);
  return (
    <Palco fundo="#8fd0ff" sombras>
      <CameraLenta de={[0.3, 9.5, 2.0]} para={[0.3, 6.8, 1.4]} alvo={[0, 0, 0]} x={t / dur} fov={46} treme={0.08 * (1 - entre(t, 0, 0.6))} s={s} rolo={0.3} />
      <LuzSol />
      <Rua />
      <Cratera t={t} />
      {/* deitado de costas, braços e pernas abertos (estrela) */}
      <group position={[0, 0.2, 0.7]} rotation={[-Math.PI / 2, 0, 0]}>
        <Bloco v={ICARO_SUJO} frame={frame} e={{ olhosFechados: dor < 0.5, boca: dor > 0.5 ? "aberta" : "tremendo", abertura: 0.9, sobrancelha: 0.9 * dor }} p={{ bracoE: [0, 1.2 + Math.sin(s * 3) * 0.05], bracoD: [0, 1.2], cabeca: [0, Math.sin(t * 2) * 0.2] }} />
      </group>
      {/* curiosos chegando na beira */}
      {[0, 1, 2, 3].map((i) => {
        const a = -0.6 + i * 0.5;
        const r = 5.5 - entre(t, 0.3 + i * 0.2, 1.6) * 1.8;
        return <Bloco key={i} v={FIGURANTE(i + 3)} pos={[Math.cos(a + Math.PI) * r, 0, Math.sin(a + Math.PI) * r]} giroY={-a + Math.PI / 2} frame={frame + i * 5} e={{ espanto: 1, boca: "aberta", sobrancelha: 1 }} p={{ cotoveloDentro: 0.4, bracoE: [-0.8, 0], bracoD: [-0.8, 0], cotoveloE: -1.6, cotoveloD: -1.6 }} />;
      })}
    </Palco>
  );
};

// "Doeu. Muito." — ele se levanta devagar da cratera, cheio de curativos
export const PlanoLevanta: React.FC<PropsPlano> = ({ t, dur, frame, s }) => {
  const sobe = suave(entre(t, 0.1, 1.6));
  return (
    <Palco fundo="#8fd0ff" sombras>
      <CameraLenta de={[2.4, 1.3, 4.2]} para={[1.9, 1.4, 3.5]} alvo={[0, 1.1, 0.5]} x={t / dur} fov={44} />
      <LuzSol />
      <Rua />
      <Cratera t={1.6 + t * 0.4} />
      <Bloco v={ICARO_SUJO} pos={[0, -1.2 + sobe * 1.2, 0.5]} frame={frame} e={{ sobrancelha: 0.7, boca: "tremendo", olhosFechados: Math.floor(t * 2) % 3 === 0 }} p={{ curvado: 0.6 - sobe * 0.45, bracoE: [-0.5, 0.2], bracoD: [-1.2 + sobe * 0.6, 0.3], cotoveloD: -1.3, cabeca: [0.2, Math.sin(s * 5) * 0.06] }} />
      <Curativos pos={[0, -1.2 + sobe * 1.2, 0.5]} />
    </Palco>
  );
};

// "Mas você continua aqui." — contra-plongée, poeira e sol atrás dele
export const PlanoDePe: React.FC<PropsPlano> = ({ t, dur, frame, s }) => (
  <Palco fundo="#ffd8a0" sombras>
    <CameraLenta de={[0.8, 0.45, 3.6]} para={[0.5, 0.5, 2.9]} alvo={[0, 1.9, 0]} x={t / dur} fov={46} />
    <ambientLight intensity={0.55} color="#ffe2b8" />
    <directionalLight position={[-2, 6, -8]} intensity={3.2} color="#ffc76b" castShadow />
    <pointLight position={[1, 2, 3]} intensity={1.2} color="#ffffff" />
    <Ceu topo="#ff9a4d" base="#ffe0b0" />
    <Rua />
    <Cratera t={2.2 + t * 0.2} />
    <Bloco v={ICARO_SUJO} pos={[0, 0, 0.5]} frame={frame} e={{ sobrancelha: -0.2, boca: "meioSorriso" }} p={{ bracoE: [0, 0.2], bracoD: [0, 0.2], cabeca: [-0.08, 0] }} />
    <Curativos pos={[0, 0, 0.5]} />
    {/* poeira leve passando */}
    {Array.from({ length: 10 }, (_, i) => (
      <mesh key={i} position={[((i * 1.7 + s * 0.6) % 8) - 4, 0.3 + (i % 4) * 0.4, -1 + (i % 3)]} scale={0.3}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#d9c7a3" transparent opacity={0.25} depthWrite={false} />
      </mesh>
    ))}
  </Palco>
);

// "…ainda tô aqui." — close: ofegante, risada fraca; depois o joinha
export const PlanoRisoFraco: React.FC<PropsPlano> = ({ t, dur, frame, s }) => {
  const ri = t > MARCOS.ri - 20.65 ? Math.abs(Math.sin(t * 9)) : 0;
  const ofega = Math.sin(t * 7) * 0.04;
  return (
    <Palco fundo="#ffd8a0" sombras>
      <CameraLenta de={[0.3, 1.9, 2.75]} para={[0.22, 1.9, 2.45]} alvo={[0, 1.78, 0.5]} x={t / dur} fov={40} treme={0.003} s={s} />
      <ambientLight intensity={0.6} color="#ffe2b8" />
      <directionalLight position={[-3, 5, 4]} intensity={2.2} color="#ffd59a" />
      <Ceu topo="#ff9a4d" base="#ffe0b0" />
      <Rua />
      <Bloco v={ICARO_SUJO} pos={[0, ofega, 0.5]} frame={frame} e={{ sobrancelha: 0.5, boca: ri > 0.3 ? "aberta" : "meioSorriso", abertura: 0.3 + ri * 0.4, olhosFechados: ri > 0.7 }} p={{ cabeca: [0.1 + ofega * 2, 0.08], curvado: 0.12 + ofega }} />
      <Curativos pos={[0, ofega, 0.5]} />
    </Palco>
  );
};

export const PlanoJoinha: React.FC<PropsPlano> = ({ t, dur, frame, s }) => {
  const sobe = suave(entre(t, 0.1, 0.45));
  return (
    <Palco fundo="#ffd8a0" sombras>
      <CameraLenta de={[1.2, 1.5, 4.0]} para={[0.9, 1.55, 3.4]} alvo={[0, 1.4, 0.5]} x={t / dur} fov={42} />
      <LuzSol forca={1.05} />
      <Ceu topo="#ff9a4d" base="#ffe0b0" />
      <Rua />
      <Cratera t={2.6} />
      <Bloco v={ICARO_SUJO} pos={[0, 0, 0.5]} frame={frame} e={{ sobrancelha: 0.3, boca: "meioSorriso" }} p={{ bracoD: [-1.4 * sobe, 0.1], cotoveloD: -1.3 * sobe, cabeca: [0, 0.1] }} />
      <Curativos pos={[0, 0, 0.5]} />
      {/* curiosos no fundo, de boca aberta */}
      {[-2.8, -1.6, 1.8, 3.0].map((x, i) => (
        <Bloco key={x} v={FIGURANTE(i + 1)} pos={[x, 0, -2.5 - (i % 2)]} giroY={-x * 0.15} frame={frame + i * 11} e={{ espanto: 1, boca: "aberta", sobrancelha: 1 }} p={{ cotoveloDentro: 0.5, bracoE: [-0.8, 0], bracoD: [-0.8, 0], cotoveloE: -1.5 + Math.sin(s * 12 + i) * 0.2, cotoveloD: -1.5 }} />
      ))}
    </Palco>
  );
};
