import { useMemo } from "react";
import * as THREE from "three";
import { random } from "remotion";
import { Bloco } from "../namorada/Bloco";
import { CameraLenta, entre, lerp, Palco, suave, texturaCanvas, type PropsPlano } from "../namorada/comum";
import { BRASIL, Explosao, focar, Globo } from "../namorada/Globo";
import { Estrelas } from "../v2/mundo";
import { Braco1aPessoa, ICARO, ICARO_ESPACO } from "./gente";
import { MARCOS, type Vec3 } from "./tempo";

// Do fim da Terra ao infinito: oceanos evaporando, o Sol inchando, a Terra se desfazendo,
// o espaço em silêncio, as últimas estrelas, o xadrez no escuro e o ∞.
// O espaço é mais limpo e bonito que o resto, para o boneco quadrado parecer minúsculo.

const FOCO_BR = focar(BRASIL.lat, BRASIL.lon);

// Nebulosa suave no fundo (textura em canvas numa esfera grande)
const Nebulosa: React.FC<{ cor?: string; opacidade?: number }> = ({ cor = "#5b3fbf", opacidade = 1 }) => {
  const tex = useMemo(
    () =>
      texturaCanvas(512, 256, (ctx) => {
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, 512, 256);
        for (let i = 0; i < 14; i++) {
          const x = random(`nx${i}`) * 512;
          const y = 60 + random(`ny${i}`) * 140;
          const r = 40 + random(`nr${i}`) * 90;
          const g = ctx.createRadialGradient(x, y, 0, x, y, r);
          g.addColorStop(0, i % 3 === 0 ? "rgba(255,120,200,0.22)" : i % 3 === 1 ? "rgba(90,140,255,0.2)" : "rgba(140,90,255,0.2)");
          g.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, 512, 256);
        }
      }),
    [],
  );
  return (
    <mesh>
      <sphereGeometry args={[500, 32, 16]} />
      <meshBasicMaterial map={tex} color={cor} side={THREE.BackSide} transparent opacity={opacidade} depthWrite={false} toneMapped={false} />
    </mesh>
  );
};

// O Sol: núcleo + coroa aditiva; "incha" e fica vermelho
const Sol: React.FC<{ pos: Vec3; raio: number; vermelho: number; s: number }> = ({ pos, raio, vermelho, s }) => {
  const cor = new THREE.Color("#fff3b0").lerp(new THREE.Color("#b81800"), vermelho);
  const coroa = new THREE.Color("#ffb347").lerp(new THREE.Color("#c41a00"), vermelho);
  return (
    <group position={pos}>
      <mesh rotation={[0, s * 0.05, 0]}>
        <icosahedronGeometry args={[raio, 3]} />
        <meshBasicMaterial color={cor} toneMapped={false} />
      </mesh>
      {[1.1, 1.25, 1.45].map((k, i) => (
        <mesh key={k} scale={raio * k * (1 + Math.sin(s * (1.5 + i)) * 0.02)}>
          <sphereGeometry args={[1, 32, 16]} />
          <meshBasicMaterial color={coroa} transparent opacity={0.16 - i * 0.045} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
        </mesh>
      ))}
      <pointLight intensity={4} decay={0} color={cor} />
    </group>
  );
};

// Ícaro flutuando no vácuo (girando devagar, braços soltos)
const Flutuando: React.FC<{ pos: Vec3; frame: number; s: number; escala?: number; e?: Parameters<typeof Bloco>[0]["e"] }> = ({ pos, frame, s, escala = 1, e }) => (
  <group position={pos} rotation={[Math.sin(s * 0.3) * 0.4, s * 0.15, Math.sin(s * 0.22) * 0.5]} scale={escala}>
    <group position={[0, -1.1, 0]}>
      <Bloco
        v={ICARO_ESPACO}
        frame={frame}
        e={e ?? { sobrancelha: 0.35 }}
        p={{ bracoE: [-0.4 + Math.sin(s * 0.7) * 0.2, 0.9], bracoD: [-0.3 + Math.cos(s * 0.6) * 0.2, 1.0], cotoveloE: -0.4, cotoveloD: -0.3, cabeca: [Math.sin(s * 0.4) * 0.2, 0] }}
      />
    </group>
  </group>
);

// ---------- 6. O fim da Terra ----------

// "Em um bilhão de anos, os oceanos evaporam." — o azul vai sumindo, vapor saindo
export const PlanoOceanos: React.FC<PropsPlano> = ({ t, dur, s }) => {
  const seca = suave(entre(t, 0.4, dur));
  return (
    <Palco fundo="#000000" far={1200}>
      <CameraLenta de={[0, 0.8, 15.5]} para={[0, 0.6, 13.8]} alvo={[0, 0.3, 0]} x={t / dur} fov={40} />
      <ambientLight intensity={0.15} />
      <Estrelas raio={400} quantidade={2200} />
      <Sol pos={[-80, 20, -140]} raio={14 + seca * 4} vermelho={seca * 0.2} s={s} />
      <directionalLight position={[-80, 20, -40]} intensity={3} color="#fff1d0" />
      <group rotation={[0, s * 0.08, 0]}>
        <Globo raio={2.6} giro={[FOCO_BR[0], FOCO_BR[1] + t * 0.12]} tempo={s} laranja={seca * 0.35} />
        {/* o planeta secando: camada marrom que cobre os oceanos */}
        <mesh scale={1.006}>
          <sphereGeometry args={[2.6, 64, 48]} />
          <meshStandardMaterial color="#a8743f" transparent opacity={seca * 0.78} roughness={1} />
        </mesh>
      </group>
      {/* vapor subindo e indo embora */}
      {Array.from({ length: 40 }, (_, i) => {
        const a = random(`va${i}`) * Math.PI * 2;
        const b = (random(`vb${i}`) - 0.5) * Math.PI;
        const k = (t * 0.4 + random(`vk${i}`)) % 1;
        const r = 2.7 + k * 1.6;
        return (
          <mesh key={i} position={[Math.cos(a) * Math.cos(b) * r, Math.sin(b) * r, Math.sin(a) * Math.cos(b) * r]} scale={0.12 + k * 0.25}>
            <icosahedronGeometry args={[1, 0]} />
            <meshBasicMaterial color="#e8f4ff" transparent opacity={(1 - k) * 0.35 * seca} depthWrite={false} />
          </mesh>
        );
      })}
    </Palco>
  );
};

// "Em cinco, o Sol incha." — o Sol cresce vermelho atrás da Terra torrada
export const PlanoSol: React.FC<PropsPlano> = ({ t, dur, s }) => {
  const k = suave(entre(t, 0, dur));
  return (
    <Palco fundo="#000000" far={1500}>
      {/* a Terra pequena embaixo, em contraluz; o Sol cresce vermelho atrás dela */}
      <CameraLenta de={[1.5, -1.0, 26]} para={[1.2, -0.8, 22]} alvo={[0, 6, -60]} x={t / dur} fov={46} treme={0.01 + k * 0.03} s={s} />
      <ambientLight intensity={0.12} />
      <Estrelas raio={600} quantidade={1500} opacidade={1 - k * 0.6} />
      <Sol pos={[0, 22, -150]} raio={lerp(18, 70, k)} vermelho={1} s={s} />
      <directionalLight position={[0, 22, -100]} intensity={3} color="#ff6a3a" />
      <group position={[0, -2.2, 0]}>
        <Globo raio={2.4} giro={[FOCO_BR[0], FOCO_BR[1] + s * 0.05]} tempo={s} laranja={0.6 + k * 0.4} rachaduras={k * 0.6} />
        <mesh scale={1.006}>
          <sphereGeometry args={[2.4, 64, 48]} />
          <meshStandardMaterial color="#7a3b18" transparent opacity={0.75} roughness={1} emissive="#ff3a00" emissiveIntensity={k * 0.3} />
        </mesh>
      </group>
    </Palco>
  );
};

// "A Terra acaba." — rachaduras, brilho e a Terra se desfaz (golpe forte)
export const PlanoTerraAcaba: React.FC<PropsPlano> = ({ t, dur, s }) => {
  const estoura = MARCOS.terraAcaba - 63.58;
  const tx = Math.max(0, t - estoura);
  return (
    <Palco fundo="#000000" far={1500}>
      <CameraLenta de={[0, 0.5, 11]} para={[0, 0.4, 13.5]} alvo={[0, 0, 0]} x={t / dur} fov={44} treme={t < estoura ? 0.02 + t * 0.03 : 0.12 * Math.max(0, 1 - tx * 1.2)} s={s} />
      <ambientLight intensity={0.15} />
      <Estrelas raio={600} quantidade={1500} opacidade={0.5} />
      <Sol pos={[-20, 8, -160]} raio={120} vermelho={1} s={s} />
      <directionalLight position={[-20, 8, -100]} intensity={3} color="#ff5a2a" />
      {tx <= 0 ? (
        <group>
          <Globo raio={2.4} giro={[FOCO_BR[0], FOCO_BR[1]]} tempo={s} laranja={1} rachaduras={1} />
          <mesh scale={1.006}>
            <sphereGeometry args={[2.4, 64, 48]} />
            <meshStandardMaterial color="#5a2a10" transparent opacity={0.6} emissive="#ff4a00" emissiveIntensity={0.4 + t * 0.6} />
          </mesh>
        </group>
      ) : (
        <Explosao raio={2.4} t={tx * 0.55} />
      )}
    </Palco>
  );
};

// "Você não." — os pedaços passam e ele sai flutuando, minúsculo, com o Sol vermelho atrás
export const PlanoVoceNao: React.FC<PropsPlano> = ({ t, dur, frame, s }) => (
  <Palco fundo="#000000" far={1500}>
    <CameraLenta de={[0, 0.3, 6]} para={[0, 0.2, 4.6]} alvo={[0, 0, 0]} x={t / dur} fov={42} />
    <ambientLight intensity={0.2} />
    <Estrelas raio={600} quantidade={1500} opacidade={0.6} />
    <Sol pos={[-30, 10, -200]} raio={130} vermelho={1} s={s} />
    <directionalLight position={[-30, 10, -100]} intensity={2.4} color="#ff6a3a" />
    <pointLight position={[1.5, 1, 3]} intensity={1.5} distance={8} color="#9fb4ff" />
    {/* destroços passando */}
    {Array.from({ length: 24 }, (_, i) => (
      <mesh key={i} position={[(random(`dx${i}`) - 0.5) * 12, (random(`dy${i}`) - 0.5) * 9, -6 + ((t * 3 + random(`dz${i}`) * 12) % 12)]} rotation={[t + i, t * 0.7, i]} scale={0.15 + random(`ds${i}`) * 0.35}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color={["#7c2d12", "#c2410c", "#3f3f46"][i % 3]} emissive="#ff4a00" emissiveIntensity={0.25} flatShading />
      </mesh>
    ))}
    <Flutuando pos={[0, 0, 0]} frame={frame} s={s} escala={0.55} e={{ sobrancelha: 0.6, espanto: 0.4 }} />
  </Palco>
);

// ---------- 7. Espaço, silêncio ----------
export const PlanoEspacoLonge: React.FC<PropsPlano> = ({ t, dur, frame, s }) => (
  <Palco fundo="#000000" far={1500}>
    <CameraLenta de={[0, 0, 7]} para={[0, 0, 10]} alvo={[0, 0, 0]} x={t / dur} fov={40} />
    <ambientLight intensity={0.12} />
    <directionalLight position={[4, 3, 5]} intensity={0.9} color="#c7d7ff" />
    <Nebulosa />
    <Estrelas raio={500} quantidade={3200} />
    <Flutuando pos={[0, 0, 0]} frame={frame} s={s} escala={0.35} />
  </Palco>
);

// Close no rosto, iluminado só pelas estrelas: olhos grandes, piscada lenta
export const PlanoEspacoRosto: React.FC<PropsPlano> = ({ t, dur, frame, s }) => (
  <Palco fundo="#000000" far={1500}>
    <CameraLenta de={[0.25, 0.15, 2.35]} para={[0.18, 0.15, 2.1]} alvo={[0, 0.05, 0]} x={t / dur} fov={40} />
    <ambientLight intensity={0.08} />
    <pointLight position={[1.2, 0.8, 1.4]} intensity={3} distance={6} color="#bcd0ff" />
    <pointLight position={[-1.4, -0.4, 0.4]} intensity={1.2} distance={5} color="#ff9ad1" />
    <Nebulosa opacidade={0.7} />
    <Estrelas raio={500} quantidade={3000} />
    <group rotation={[0, 0, Math.sin(s * 0.25) * 0.1]}>
      <group position={[0, -1.73, 0]}>
        <Bloco v={ICARO_ESPACO} frame={frame} e={{ sobrancelha: 0.45, espanto: 0.35, olhosFechados: t > 1.1 && t < 1.32 }} p={{ cabeca: [0, 0] }} />
      </group>
    </group>
  </Palco>
);

// Estrelas que se apagam uma a uma
const CampoQueApaga: React.FC<{ s: number; n?: number; inicio: number; fim: number }> = ({ s, n = 1800, inicio, fim }) => {
  const { pos, cor, apaga } = useMemo(() => {
    const pos = new Float32Array(n * 3);
    const cor = new Float32Array(n * 3);
    const apaga = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const u = random(`q-u-${i}`) * 2 - 1;
      const a = random(`q-a-${i}`) * Math.PI * 2;
      const r = Math.sqrt(1 - u * u);
      pos.set([Math.cos(a) * r * 300, u * 300, Math.sin(a) * r * 300], i * 3);
      apaga[i] = inicio + random(`q-t-${i}`) ** 0.7 * (fim - inicio);
    }
    return { pos, cor, apaga };
  }, [n, inicio, fim]);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("color", new THREE.BufferAttribute(cor, 3));
    return g;
  }, [pos, cor]);
  const atr = geo.attributes.color as THREE.BufferAttribute;
  for (let i = 0; i < n; i++) {
    const v = Math.max(0, Math.min(1, (apaga[i] - s) / 0.25));
    const quente = random(`q-c-${i}`) < 0.3;
    atr.setXYZ(i, v, v * (quente ? 0.85 : 0.95), v * (quente ? 0.7 : 1));
  }
  atr.needsUpdate = true;
  return (
    <points geometry={geo}>
      <pointsMaterial size={3} vertexColors sizeAttenuation={false} transparent depthWrite={false} toneMapped={false} />
    </points>
  );
};

export const PlanoEstrelas: React.FC<PropsPlano> = ({ t, dur, frame, s }) => (
  <Palco fundo="#000000" far={1500}>
    <CameraLenta de={[0, 0.5, 8]} para={[0, 0.3, 6.5]} alvo={[0, 0, 0]} x={t / dur} fov={46} />
    <ambientLight intensity={0.08} />
    <directionalLight position={[3, 2, 4]} intensity={0.6 * (1 - entre(s, 70, 74))} color="#c7d7ff" />
    <Nebulosa opacidade={1 - entre(s, 70.5, 73.5)} />
    <CampoQueApaga s={s} inicio={70.2} fim={74.0} />
    <Flutuando pos={[0, 0, 0]} frame={frame} s={s} escala={0.4} />
  </Palco>
);

// A última estrela: ele de perfil olhando para ela, no alto da tela; quando ela apaga, o rosto some no escuro
export const PlanoUltimaEstrela: React.FC<PropsPlano> = ({ t, dur, frame, s }) => {
  const luz = 1 - entre(s, MARCOS.ultima, MARCOS.ultima + 0.35);
  return (
    <Palco fundo="#000000" far={1500}>
      {/* por cima do ombro: a nuca dele em contraluz e a última estrela lá na frente */}
      <CameraLenta de={[0.75, 0.15, 3.3]} para={[0.65, 0.2, 3.0]} alvo={[0.1, 1.35, -7]} x={t / dur} fov={46} />
      <ambientLight intensity={0.1 * luz} />
      <pointLight position={[0.15, 0.9, -1.2]} intensity={14 * luz} distance={5} color="#fff1c4" />
      <CampoQueApaga s={s} n={300} inicio={72.0} fim={73.9} />
      {/* a estrela */}
      <group position={[0.1, 1.35, -7]} scale={1.3 * luz * (1 + Math.sin(s * 9) * 0.06)}>
        <mesh>
          <sphereGeometry args={[0.12, 12, 12]} />
          <meshBasicMaterial color="#fff6dc" toneMapped={false} />
        </mesh>
        {[2.5, 5].map((k, i) => (
          <mesh key={k} scale={0.12 * k}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshBasicMaterial color="#ffe4a0" transparent opacity={0.3 - i * 0.12} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
          </mesh>
        ))}
      </group>
      <group position={[0, -1.73, 0]} rotation={[0, Math.PI, 0]}>
        <Bloco v={ICARO_ESPACO} frame={frame} e={{ sobrancelha: 0.6, espanto: 0.5 * luz, olhosFechados: false }} p={{ cabeca: [-0.15, 0] }} />
      </group>
    </Palco>
  );
};

// ---------- 8. O infinito ----------
const LuzEscuro: React.FC = () => (
  <>
    <ambientLight intensity={0.02} />
    <pointLight position={[-1.2, -0.6, 1.2]} intensity={1.4} distance={4} color="#6f86ff" />
  </>
);

export const PlanoEscuro: React.FC<PropsPlano> = ({ t, dur, frame }) => (
  <Palco fundo="#000000">
    <CameraLenta de={[0, 0.12, 2.1]} para={[0, 0.12, 1.9]} alvo={[0, 0.05, 0]} x={t / dur} fov={40} />
    <LuzEscuro />
    <group position={[0, -1.73, 0]}>
      <Bloco v={ICARO_ESPACO} frame={frame} e={{ sobrancelha: 0.3, espanto: 0.2, olhosFechados: t > 0.7 && t < 0.85 }} />
    </group>
  </Palco>
);

// Primeira pessoa: a mão contando nos dedos, rápido
const Mao: React.FC<{ pos: Vec3; dedos: number; rot?: Vec3 }> = ({ pos, dedos, rot = [0, 0, 0] }) => (
  <group position={pos} rotation={rot}>
    <mesh>
      <boxGeometry args={[0.2, 0.2, 0.07]} />
      <meshStandardMaterial color={ICARO.pele} roughness={0.6} />
    </mesh>
    {[0, 1, 2, 3, 4].map((i) => {
      const levantado = i < dedos;
      const x = -0.075 + i * 0.0375;
      return i === 4 ? (
        <mesh key={i} position={[0.13, levantado ? 0.04 : -0.02, 0]} rotation={[0, 0, levantado ? -0.6 : -1.4]}>
          <boxGeometry args={[0.045, 0.1, 0.05]} />
          <meshStandardMaterial color={ICARO.pele} roughness={0.6} />
        </mesh>
      ) : (
        <mesh key={i} position={[x, levantado ? 0.16 : 0.1, levantado ? 0 : 0.04]} rotation={[levantado ? 0 : 1.3, 0, 0]}>
          <boxGeometry args={[0.032, levantado ? 0.13 : 0.06, 0.04]} />
          <meshStandardMaterial color={ICARO.pele} roughness={0.6} />
        </mesh>
      );
    })}
  </group>
);

export const PlanoDedos: React.FC<PropsPlano> = ({ t, dur, s }) => {
  const dedos = Math.floor(t * 9) % 6;
  return (
    <Palco fundo="#000000">
      <CameraLenta de={[0, 0, 0.9]} para={[0, 0, 0.8]} alvo={[0, -0.05, 0]} x={t / dur} fov={46} treme={0.002} s={s} />
      <ambientLight intensity={0.05} />
      <pointLight position={[0.4, 0.5, 0.8]} intensity={1.6} distance={3} color="#c7d7ff" />
      <Mao pos={[0.05, -0.08, 0]} dedos={dedos} rot={[0.1, 0, -0.1]} />
      <Braco1aPessoa ombro={[0.3, -0.7, 0.6]} mao={[0.06, -0.2, 0.02]} fechada />
    </Palco>
  );
};

// Tabuleiro de xadrez flutuando no vazio; a mão move as peças
const texturaTabuleiro = () =>
  texturaCanvas(256, 256, (ctx) => {
    for (let y = 0; y < 8; y++)
      for (let x = 0; x < 8; x++) {
        ctx.fillStyle = (x + y) % 2 ? "#3b2a1a" : "#e9d8b4";
        ctx.fillRect(x * 32, y * 32, 32, 32);
      }
  });

const Peca: React.FC<{ pos: Vec3; branca: boolean; tipo: number }> = ({ pos, branca, tipo }) => {
  const cor = branca ? "#f5f0e6" : "#1f1f24";
  return (
    <group position={pos}>
      <mesh position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.07, 0.085, 0.08, 10]} />
        <meshStandardMaterial color={cor} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.12 + tipo * 0.03, 0]}>
        <cylinderGeometry args={[0.035, 0.06, 0.12 + tipo * 0.06, 10]} />
        <meshStandardMaterial color={cor} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.2 + tipo * 0.06, 0]}>
        {tipo === 3 ? <boxGeometry args={[0.07, 0.07, 0.07]} /> : <sphereGeometry args={[0.045, 10, 10]} />}
        <meshStandardMaterial color={cor} roughness={0.35} />
      </mesh>
    </group>
  );
};

const PECAS = Array.from({ length: 20 }, (_, i) => ({
  x: ((i * 3) % 8) - 3.5,
  z: (i < 10 ? -3.5 + (i % 2) : 2.5 + (i % 2)) + (i % 3 === 0 ? 1 : 0),
  branca: i >= 10,
  tipo: i % 4,
}));

const Tabuleiro: React.FC<{ s: number; movida?: number }> = ({ s, movida = 0 }) => {
  const tex = useMemo(texturaTabuleiro, []);
  return (
    <group rotation={[0.04 * Math.sin(s * 0.5), s * 0.03, 0]}>
      <mesh>
        <boxGeometry args={[1.7, 0.08, 1.7]} />
        <meshStandardMaterial color="#5a3a22" />
      </mesh>
      <mesh position={[0, 0.041, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.6, 1.6]} />
        <meshStandardMaterial map={tex} />
      </mesh>
      {PECAS.map((p, i) => {
        // a peça que a mão está movendo sobe, anda e desce
        const anda = i === 12 ? movida : 0;
        return <Peca key={i} pos={[p.x * 0.2, 0.04 + Math.sin(anda * Math.PI) * 0.15, p.z * 0.2 - anda * 0.4]} branca={p.branca} tipo={p.tipo} />;
      })}
    </group>
  );
};

const LuzXadrez: React.FC = () => (
  <>
    <ambientLight intensity={0.06} />
    <spotLight position={[0, 3, 0.5]} angle={0.5} penumbra={0.7} intensity={18} color="#fff1d6" />
    <pointLight position={[-1, 0.5, 1]} intensity={0.8} distance={4} color="#6f86ff" />
  </>
);

export const PlanoXadrez: React.FC<PropsPlano> = ({ t, dur, s }) => {
  const lance = MARCOS.pecas.filter((p) => s >= p).pop() ?? MARCOS.pecas[0];
  const movida = suave(entre(s, lance, lance + 0.45));
  const peca: Vec3 = [((12 * 3) % 8 - 3.5) * 0.2, 0.25 + Math.sin(movida * Math.PI) * 0.15, (2.5 + 0) * 0.2 - movida * 0.4];
  return (
    <Palco fundo="#000000">
      <CameraLenta de={[0, 1.0, 1.25]} para={[0, 0.95, 1.05]} alvo={[0, 0, 0]} x={t / dur} fov={46} />
      <LuzXadrez />
      <Estrelas raio={300} quantidade={200} opacidade={0.25} />
      <Tabuleiro s={s} movida={movida} />
      <Braco1aPessoa ombro={[0.35, 0.55, 1.15]} mao={[peca[0] + 0.03, peca[1] + 0.12, peca[2] + 0.06]} />
    </Palco>
  );
};

// "…dos dois lados." — o mesmo Ícaro sentado dos DOIS lados do tabuleiro (o segundo aparece com um "pop")
export const PlanoXadrezOutroLado: React.FC<PropsPlano> = ({ t, dur, frame, s }) => {
  const outro = suave(entre(t, 0.15, 0.35));
  const pose = { sentado: true, curvado: 0.35, bracoD: [-1.1, 0.1] as [number, number], cotoveloD: -0.4, bracoE: [-0.5, 0.1] as [number, number], cabeca: [0.45, 0] as [number, number] };
  return (
    <Palco fundo="#000000">
      {/* no eixo do tabuleiro: um Ícaro de costas (perto) e o outro de frente (longe) */}
      <CameraLenta de={[0.9, 1.25, 2.9]} para={[0.75, 1.15, 2.5]} alvo={[0, -0.15, -0.4]} x={t / dur} fov={46} />
      <LuzXadrez />
      <pointLight position={[0.3, 1.0, 0.1]} intensity={3} distance={4} color="#c7d7ff" />
      <pointLight position={[0.5, 1.0, 2.2]} intensity={1.5} distance={4} color="#ffd9a8" />
      <Estrelas raio={300} quantidade={300} opacidade={0.3} />
      <Tabuleiro s={s} movida={1} />
      <Bloco v={ICARO_ESPACO} pos={[0, -0.82, 1.05]} giroY={Math.PI} frame={frame} escala={0.6} e={{ sobrancelha: -0.35, boca: "meioSorriso" }} p={pose} />
      {outro > 0 && (
        <Bloco v={ICARO_ESPACO} pos={[0, -0.82, -1.05]} frame={frame + 17} escala={0.6 * outro} e={{ sobrancelha: -0.35, boca: "meioSorriso" }} p={pose} />
      )}
    </Palco>
  );
};

// ∞ em 3D: tubo dourado desenhado aos poucos, o Ícaro minúsculo dentro de uma das voltas
const CURVA_INFINITO = (() => {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= 200; i++) {
    const u = (i / 200) * Math.PI * 2;
    const d = 1 + Math.sin(u) ** 2;
    pts.push(new THREE.Vector3((3 * Math.cos(u)) / d, (3 * Math.sin(u) * Math.cos(u)) / d, Math.sin(u * 2) * 0.25));
  }
  return new THREE.CatmullRomCurve3(pts, true);
})();

const Infinito: React.FC<{ desenho: number; s: number }> = ({ desenho, s }) => {
  const geo = useMemo(() => new THREE.TubeGeometry(CURVA_INFINITO, 400, 0.16, 12, true), []);
  const total = geo.index ? geo.index.count : 0;
  geo.setDrawRange(0, Math.floor(total * desenho));
  return (
    <group rotation={[0.25 + Math.sin(s * 0.4) * 0.08, Math.sin(s * 0.3) * 0.25, 0]}>
      <mesh geometry={geo}>
        <meshStandardMaterial color="#ffd23f" emissive="#ffb000" emissiveIntensity={0.9} metalness={0.6} roughness={0.25} />
      </mesh>
      {/* brilhos correndo pelo ∞ */}
      {Array.from({ length: 10 }, (_, i) => {
        const u = ((s * 0.12 + i / 10) % 1) * desenho;
        const p = CURVA_INFINITO.getPointAt(u);
        return (
          <mesh key={i} position={p.toArray()}>
            <sphereGeometry args={[0.09, 8, 8]} />
            <meshBasicMaterial color="#fff6d0" toneMapped={false} />
          </mesh>
        );
      })}
    </group>
  );
};

export const PlanoInfinito: React.FC<PropsPlano & { longe?: boolean }> = ({ t, dur, frame, s, longe = false }) => {
  const desenho = longe ? 1 : suave(entre(s, MARCOS.infinito - 0.6, MARCOS.infinito + 0.8));
  return (
    <Palco fundo="#000000" far={1200}>
      {longe ? (
        <CameraLenta de={[0, 0.5, 9]} para={[0, 0.8, 15]} alvo={[0, 0, 0]} x={t / dur} fov={44} />
      ) : (
        <CameraLenta de={[1.6, 0.4, 3.4]} para={[0.6, 0.3, 7.5]} alvo={[-1.6, 0, 0]} x={t / dur} fov={44} />
      )}
      <ambientLight intensity={0.15} />
      <pointLight position={[0, 2, 4]} intensity={6} distance={14} color="#fff1d6" />
      <Nebulosa opacidade={0.35} />
      <Estrelas raio={500} quantidade={600} opacidade={0.35} />
      <Infinito desenho={desenho} s={s} />
      <Flutuando pos={[-1.6, 0, 0]} frame={frame} s={s} escala={0.16} />
    </Palco>
  );
};

// ---------- 10. Terra calma, pequena, atrás do cartaz ----------
export const PlanoTerraCalma: React.FC<PropsPlano> = ({ t, dur, s }) => (
  <Palco fundo="#000000" far={1200}>
    <CameraLenta de={[0, -0.6, 11]} para={[0, -0.4, 9.5]} alvo={[0, -1.4, 0]} x={t / dur} fov={40} />
    <ambientLight intensity={0.25} />
    <directionalLight position={[-6, 3, 6]} intensity={2.6} color="#fff1d0" />
    <Nebulosa opacidade={0.6} />
    <Estrelas raio={500} quantidade={2600} />
    <group position={[0, -2.4, 0]}>
      <Globo raio={1.6} giro={[FOCO_BR[0], FOCO_BR[1] + s * 0.06]} tempo={s} />
    </group>
  </Palco>
);
