import { useMemo } from "react";
import * as THREE from "three";
import { random } from "remotion";
import { Bloco } from "../namorada/Bloco";
import { CameraLenta, entre, lerp, Palco, suave, texturaCanvas, type PropsPlano } from "../namorada/comum";
import { Alien, FIGURANTE, ICARO_FUTURO, ICARO_SUJO } from "./gente";
import { MARCOS, type Vec3 } from "./tempo";

// Séculos depois: Recife futurista com carros voadores, a invasão alienígena, o laser que não
// adianta nada e, bem depois, a cidade vazia onde só sobrou ele.

const texturaTorre = (neon: string) =>
  texturaCanvas(
    64,
    128,
    (ctx) => {
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, 64, 128);
      for (let y = 4; y < 128; y += 8)
        for (let x = 3; x < 64; x += 10) {
          ctx.fillStyle = (x * 7 + y * 3) % 5 === 0 ? neon : "rgba(160,200,255,0.55)";
          ctx.fillRect(x, y, 6, 4);
        }
    },
    [1, 5],
  );

const TORRES = Array.from({ length: 34 }, (_, i) => ({
  x: (random(`tx${i}`) - 0.5) * 90,
  z: -10 - random(`tz${i}`) * 80,
  h: 20 + random(`th${i}`) ** 1.5 * 70,
  l: 4 + random(`tl${i}`) * 4,
  neon: ["#22d3ee", "#f472b6", "#a78bfa", "#facc15"][i % 4],
}));

const CidadeFutura: React.FC<{ s: number; apagada?: number }> = ({ s, apagada = 0 }) => {
  const texs = useMemo(() => ["#22d3ee", "#f472b6", "#a78bfa", "#facc15"].map(texturaTorre), []);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[300, 300]} />
        <meshStandardMaterial color={apagada ? "#9c8468" : "#111827"} />
      </mesh>
      {/* mar ao lado (o Recife continua na beira do mar) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[70, 0.05, -40]}>
        <planeGeometry args={[60, 200]} />
        <meshStandardMaterial color={apagada ? "#3f5a63" : "#0c4a6e"} roughness={0.3} />
      </mesh>
      {TORRES.map((t, i) => (
        <group key={i} position={[t.x, 0, t.z]}>
          <mesh position={[0, t.h / 2, 0]} castShadow>
            <boxGeometry args={[t.l, t.h, t.l]} />
            <meshStandardMaterial
              map={texs[i % 4]}
              color={apagada ? "#b8a58e" : "#ffffff"}
              emissive={apagada ? "#000000" : t.neon}
              emissiveIntensity={apagada ? 0 : 0.08}
              emissiveMap={apagada ? null : texs[i % 4]}
            />
          </mesh>
          {/* anel de neon no topo */}
          {!apagada && (
            <mesh position={[0, t.h + 0.4, 0]}>
              <boxGeometry args={[t.l + 0.3, 0.3, t.l + 0.3]} />
              <meshBasicMaterial color={t.neon} toneMapped={false} />
            </mesh>
          )}
          {/* no futuro abandonado, mato subindo pelas torres */}
          {apagada > 0 && (
            <mesh position={[0, 2, t.l / 2 + 0.05]}>
              <boxGeometry args={[t.l * 0.9, 4 + (i % 3) * 3, 0.2]} />
              <meshStandardMaterial color="#3f6b2a" />
            </mesh>
          )}
        </group>
      ))}
      {/* carros voadores em faixas no ar */}
      {!apagada &&
        Array.from({ length: 26 }, (_, i) => {
          const faixa = i % 4;
          const dir = faixa % 2 ? 1 : -1;
          const x = ((i * 23 + s * (14 + faixa * 3) * dir) % 120) - 60;
          return (
            <group key={i} position={[x * dir, 14 + faixa * 7, -20 - faixa * 12]}>
              <mesh>
                <boxGeometry args={[2.2, 0.6, 1.0]} />
                <meshStandardMaterial color={["#e11d48", "#f8fafc", "#0ea5e9", "#facc15"][i % 4]} metalness={0.6} roughness={0.3} />
              </mesh>
              <mesh position={[-1.15 * dir, 0, 0]}>
                <boxGeometry args={[0.1, 0.25, 0.7]} />
                <meshBasicMaterial color="#38bdf8" toneMapped={false} />
              </mesh>
            </group>
          );
        })}
    </group>
  );
};

const LuzNoiteNeon: React.FC = () => (
  <>
    <ambientLight intensity={0.35} color="#8ab4ff" />
    <directionalLight position={[20, 40, 10]} intensity={1.2} color="#c7d2fe" castShadow shadow-mapSize={[1024, 1024]} />
    <hemisphereLight args={["#4c1d95", "#0f172a", 0.6]} />
  </>
);

// Disco voador: prato metálico, cúpula, luzes girando e o raio
const Disco: React.FC<{ pos: Vec3; s: number; escala?: number; raio?: number }> = ({ pos, s, escala = 1, raio = 0 }) => (
  <group position={pos} scale={escala}>
    <mesh rotation={[0, s * 0.8, 0]}>
      <cylinderGeometry args={[6, 8, 1.2, 24]} />
      <meshStandardMaterial color="#c7ced8" metalness={0.5} roughness={0.35} emissive="#38404c" emissiveIntensity={0.6} />
    </mesh>
    <mesh position={[0, -0.8, 0]}>
      <cylinderGeometry args={[3, 6, 0.6, 24]} />
      <meshStandardMaterial color="#8b95a3" metalness={0.5} roughness={0.35} emissive="#2a313b" emissiveIntensity={0.6} />
    </mesh>
    {/* barriga acesa em verde (lê de longe, contra o céu escuro) */}
    <mesh position={[0, -1.12, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <circleGeometry args={[2.8, 24]} />
      <meshBasicMaterial color="#7CFF6B" toneMapped={false} side={THREE.DoubleSide} />
    </mesh>
    <mesh position={[0, -0.2, 0]} scale={[1, 0.18, 1]}>
      <sphereGeometry args={[11, 24, 12]} />
      <meshBasicMaterial color="#7CFF6B" transparent opacity={0.12} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
    </mesh>
    <mesh position={[0, 0.9, 0]}>
      <sphereGeometry args={[3, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshStandardMaterial color="#7CFF6B" transparent opacity={0.55} emissive="#3fbf3a" emissiveIntensity={0.6} />
    </mesh>
    {Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2 + s * 2;
      return (
        <mesh key={i} position={[Math.cos(a) * 7.4, -0.1, Math.sin(a) * 7.4]}>
          <sphereGeometry args={[0.35, 8, 8]} />
          <meshBasicMaterial color={i % 2 ? "#facc15" : "#7CFF6B"} toneMapped={false} />
        </mesh>
      );
    })}
    {raio > 0 && (
      <mesh position={[0, -1 - 40 * raio, 0]}>
        <cylinderGeometry args={[2.2, 5, 80 * raio, 20, 1, true]} />
        <meshBasicMaterial color="#7CFF6B" transparent opacity={0.35} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
    )}
  </group>
);

// "Passam séculos." — drone sobre o Recife futurista
export const PlanoFuturo: React.FC<PropsPlano> = ({ t, dur, s }) => (
  <Palco fundo="#0b1026" sombras far={600}>
    <CameraLenta de={[-30, 40, 40]} para={[-18, 34, 26]} alvo={[0, 18, -30]} x={t / dur} fov={46} />
    <LuzNoiteNeon />
    <CidadeFutura s={s} />
  </Palco>
);

// "Chegam os alienígenas!" — o disco desce sobre a cidade
export const PlanoDisco: React.FC<PropsPlano> = ({ t, dur, s }) => {
  const desce = suave(entre(t, 0, 1.0));
  return (
    <Palco fundo="#0b1026" sombras far={600}>
      <CameraLenta de={[8, 6, 30]} para={[6, 5, 24]} alvo={[0, 35, -30]} x={t / dur} fov={52} treme={0.04} s={s} />
      <LuzNoiteNeon />
      <pointLight position={[0, 40, -30]} intensity={600} distance={120} color="#7CFF6B" />
      <CidadeFutura s={s} />
      <Disco pos={[0, lerp(85, 44, desce), -35]} s={s} escala={2.2} />
    </Palco>
  );
};

// "Invadem a Terra!" — vários discos com raios, gente correndo
export const PlanoInvasao: React.FC<PropsPlano> = ({ t, dur, frame, s }) => {
  const raio = entre(t, MARCOS.raios - 45.95, MARCOS.raios - 45.95 + 0.4);
  return (
    <Palco fundo="#0b1026" sombras far={600}>
      <CameraLenta de={[0, 2.2, 10]} para={[0, 2.4, 8]} alvo={[0, 15, -30]} x={t / dur} fov={54} treme={0.03} s={s} />
      <LuzNoiteNeon />
      <pointLight position={[0, 20, -20]} intensity={400} distance={80} color="#7CFF6B" />
      <CidadeFutura s={s} />
      <Disco pos={[-18, 40, -45]} s={s} escala={1.3} raio={raio} />
      <Disco pos={[16, 34, -38]} s={s + 1} escala={1.0} raio={raio} />
      <Disco pos={[0, 46, -70]} s={s + 2} escala={1.8} raio={raio} />
      {/* gente correndo em direção à câmera */}
      {Array.from({ length: 8 }, (_, i) => {
        const z = -6 + ((t * 3.2 + i * 1.3) % 10);
        return (
          <Bloco
            key={i}
            v={{ ...FIGURANTE(i), camisa: ["#94a3b8", "#e2e8f0", "#64748b"][i % 3] }}
            pos={[(i - 3.5) * 1.3, 0, z]}
            frame={frame + i * 5}
            e={{ espanto: 1, boca: "aberta", sobrancelha: 1 }}
            p={{ bracoE: [Math.sin(s * 14 + i) * 0.9, 0.1], bracoD: [-Math.sin(s * 14 + i) * 0.9, 0.1], cabeca: [0, Math.sin(i) * 0.3] }}
          />
        );
      })}
    </Palco>
  );
};

// "E atiram em você…" — primeira pessoa: o alien mira e o raio vem direto na câmera
export const PlanoLaser: React.FC<PropsPlano> = ({ t, dur, frame, s }) => {
  const dispara = MARCOS.disparo - 47.13;
  const bate = MARCOS.bateLaser - 47.13;
  const k = entre(t, dispara, bate);
  return (
    <Palco fundo="#0b1026" sombras far={600}>
      <CameraLenta de={[0, 1.85, 4.2]} para={[0, 1.85, 3.8]} alvo={[0, 1.5, 0]} x={t / dur} fov={46} treme={0.004 + k * 0.03} s={s} />
      <LuzNoiteNeon />
      <pointLight position={[0.4, 1.3, 0.6]} intensity={6 * (0.3 + k)} distance={6} color="#7CFF6B" />
      <CidadeFutura s={s} />
      <Alien pos={[0, 0, 0]} frame={frame} mira={1} escala={1.1} />
      <Alien pos={[-1.8, 0, -1.6]} giroY={0.3} frame={frame + 20} mira={0.4} />
      <Alien pos={[1.9, 0, -1.4]} giroY={-0.3} frame={frame + 35} mira={0.6} />
      {k > 0 && k < 1 && (
        <mesh position={[0.4, 1.3, lerp(0.8, 3.8, k) - 0.6]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.06 + k * 0.12, 0.06 + k * 0.12, 1.4, 10]} />
          <meshBasicMaterial color="#d9ffd2" toneMapped={false} />
        </mesh>
      )}
    </Palco>
  );
};

// "Nada." — fumaça indo embora e ele intacto, piscando, cara de "e aí?"
export const PlanoNada: React.FC<PropsPlano> = ({ t, dur, frame }) => {
  const fumaca = 1 - entre(t, 0, 1.0);
  return (
    <Palco fundo="#0b1026" sombras far={600}>
      <CameraLenta de={[0.3, 1.85, 3.0]} para={[0.2, 1.85, 2.65]} alvo={[0, 1.62, 0]} x={t / dur} fov={40} />
      <LuzNoiteNeon />
      <pointLight position={[0, 2.2, 1.6]} intensity={2} distance={5} color="#c7d2fe" />
      <CidadeFutura s={t} />
      <Bloco v={{ ...ICARO_FUTURO, camisa: "#6b7280" }} frame={frame} e={{ sobrancelha: -0.15, boca: "neutra", olhosFechados: t > 0.55 && t < 0.68 }} p={{ cabeca: [0, 0] }} />
      {/* cabelo arrepiado do tiro */}
      {[-0.18, -0.06, 0.06, 0.18].map((x, i) => (
        <mesh key={x} position={[x, 2.28 + (i % 2) * 0.05, 0]} rotation={[0, 0, x * -1.5]}>
          <boxGeometry args={[0.06, 0.14, 0.06]} />
          <meshStandardMaterial color="#16100c" />
        </mesh>
      ))}
      {Array.from({ length: 14 }, (_, i) => (
        <mesh key={i} position={[Math.cos(i) * (0.5 + t * 0.8), 1.2 + (i % 5) * 0.3 + t * 0.4, Math.sin(i) * 0.4]} scale={0.25 + t * 0.2}>
          <icosahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#9ca3af" transparent opacity={fumaca * 0.55} depthWrite={false} flatShading />
        </mesh>
      ))}
    </Palco>
  );
};

// "Por que ele não morre?" — close no alien confuso
export const PlanoAlien: React.FC<PropsPlano> = ({ t, dur, frame, s }) => (
  <Palco fundo="#0b1026" sombras far={600}>
    <CameraLenta de={[0.45, 1.75, 3.1]} para={[0.3, 1.75, 2.75]} alvo={[0, 1.55, 0]} x={t / dur} fov={40} />
    <LuzNoiteNeon />
    <pointLight position={[0, 1.6, 1.4]} intensity={3} distance={4} color="#7CFF6B" />
    <CidadeFutura s={s} />
    <Alien frame={frame} confuso={suave(entre(t, 0.1, 0.6))} mira={0.15} />
  </Palco>
);

// "Já tentei de tudo, parceiro." — ele, cansado, dá de ombros
export const PlanoParceiro: React.FC<PropsPlano> = ({ t, dur, frame }) => {
  const ombro = Math.sin(entre(t, 0.9, 1.8) * Math.PI);
  return (
    <Palco fundo="#0b1026" sombras far={600}>
      <CameraLenta de={[-0.4, 1.8, 3.1]} para={[-0.3, 1.8, 2.75]} alvo={[0, 1.6, 0]} x={t / dur} fov={40} />
      <LuzNoiteNeon />
      <pointLight position={[0.6, 2.2, 1.6]} intensity={2.2} distance={5} color="#c7d2fe" />
      <CidadeFutura s={t} />
      <Bloco
        v={ICARO_FUTURO}
        frame={frame}
        e={{ sobrancelha: 0.35, boca: "meioSorriso", olhosFechados: t < 0.8 }}
        p={{ bracoE: [-0.3, 0.45 + ombro * 0.4], bracoD: [-0.3, 0.45 + ombro * 0.4], cotoveloE: -1.5, cotoveloD: -1.5, cabeca: [0.12, 0.1 * ombro], curvado: 0.08 }}
      />
    </Palco>
  );
};

// Os dois lado a lado; o alien coça a cabeça
export const PlanoAlienEIcaro: React.FC<PropsPlano> = ({ t, dur, frame, s }) => (
  <Palco fundo="#0b1026" sombras far={600}>
    <CameraLenta de={[0, 1.6, 5.2]} para={[0, 1.7, 4.4]} alvo={[0, 1.5, 0]} x={t / dur} fov={42} />
    <LuzNoiteNeon />
    <pointLight position={[0, 3, 2]} intensity={3} distance={8} color="#a5b4fc" />
    <CidadeFutura s={s} />
    <Disco pos={[0, 22, -26]} s={s} escala={1.2} />
    <Bloco v={ICARO_FUTURO} pos={[-0.75, 0, 0]} giroY={0.6} frame={frame} e={{ sobrancelha: 0.2, boca: "neutra" }} p={{ cotoveloDentro: 0.4, bracoE: [-0.5, 0], bracoD: [-0.5, 0], cotoveloE: -1.4, cotoveloD: -1.4 }} />
    <Alien pos={[0.8, 0, 0]} giroY={-0.6} frame={frame} confuso={0.6 + Math.sin(t * 2) * 0.3} />
  </Palco>
);

// ---------- Muito depois: a cidade vazia ----------
const LuzPoente: React.FC = () => (
  <>
    <ambientLight intensity={0.75} color="#ffc9a8" />
    <directionalLight position={[-30, 18, 20]} intensity={3.2} color="#ff9a5a" castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-20} shadow-camera-right={20} shadow-camera-top={20} shadow-camera-bottom={-20} />
    <hemisphereLight args={["#ffb38a", "#6b4a35", 0.9]} />
  </>
);

// papéis voando, a única coisa que se mexe
const Papeis: React.FC<{ s: number; centro: Vec3 }> = ({ s, centro }) => (
  <>
    {Array.from({ length: 12 }, (_, i) => {
      const x = ((s * (1.5 + (i % 3)) + i * 3) % 24) - 12;
      return (
        <mesh key={i} position={[centro[0] + x, centro[1] + 0.3 + Math.abs(Math.sin(s * 2 + i)) * 1.2, centro[2] + ((i * 1.7) % 6) - 3]} rotation={[s * 3 + i, s * 2, i]}>
          <planeGeometry args={[0.25, 0.18]} />
          <meshStandardMaterial color="#f5efe0" side={THREE.DoubleSide} />
        </mesh>
      );
    })}
  </>
);

export const PlanoCidadeVazia: React.FC<PropsPlano> = ({ t, dur, frame, s }) => {
  const anda = t * 0.9;
  return (
    <Palco fundo="#ff9966" sombras far={600}>
      <CameraLenta de={[3, 1.6, 9]} para={[2.2, 1.7, 7.2]} alvo={[0, 1.4, -3 - anda]} x={t / dur} fov={44} />
      <LuzPoente />
      <fog attach="fog" args={["#d9825b", 20, 120]} />
      <CidadeFutura s={0} apagada={1} />
      <Papeis s={s} centro={[0, 0, 0]} />
      {/* carro voador caído, enferrujado */}
      <mesh position={[3.5, 0.35, -2]} rotation={[0.2, 0.6, 0.3]}>
        <boxGeometry args={[2.2, 0.6, 1.0]} />
        <meshStandardMaterial color="#7c4a2d" roughness={0.9} />
      </mesh>
      <Bloco v={ICARO_SUJO} pos={[0, 0, -anda]} giroY={Math.PI} frame={frame} e={{ sobrancelha: 0.3 }} p={{ bracoE: [Math.sin(anda * 3) * 0.35, 0.08], bracoD: [-Math.sin(anda * 3) * 0.35, 0.08], cabeca: [0.15, Math.sin(t) * 0.3] }} />
    </Palco>
  );
};

// "Só você." — grua subindo: ele minúsculo no meio da praça vazia
export const PlanoSoVoce: React.FC<PropsPlano> = ({ t, dur, frame, s }) => (
  <Palco fundo="#ff9966" sombras far={600}>
    <CameraLenta de={[0, 8, 6]} para={[0, 26, 10]} alvo={[0, 0, -1]} x={t / dur} fov={46} />
    <LuzPoente />
    <fog attach="fog" args={["#d9825b", 30, 160]} />
    <CidadeFutura s={0} apagada={1} />
    <Papeis s={s} centro={[0, 0, -1]} />
    <Bloco v={ICARO_SUJO} pos={[0, 0, -1]} frame={frame} e={{ sobrancelha: 0.4 }} p={{ cabeca: [-0.6, 0] }} />
  </Palco>
);
