import { useMemo } from "react";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ESPESSURA_RELATIVA, orbitaNoDisco } from "../fisica";
import { Camera, DIRECAO_SOL, Estrelas, POSICAO_SOL } from "../mundo";
import { PlanetaDisco, RAIO } from "../PlanetaDisco";
import { LuzDeBaixo, LuzSolarNoDisco, SolVisivel } from "../Sol";
import { CENAS, clamp, ease, lerp, MARCOS, type Vec3 } from "../tempo";

// CENA 5 — A ATMOSFERA, O SOL E OS SATÉLITES
// 1) Do espaço, a câmera mergulha pela atmosfera até perto da superfície (o céu muda de cor)
// 2) Satélite numa órbita "copiada" da Terra real → X vermelho
// 3) Trajetória calculada no campo de gravidade do disco (SIMULAÇÃO CONCEITUAL)
//
// Aqui o disco fica na ORIGEM da cena (posições do Sol relativas a ele).

const INICIO = CENAS.atmosfera.inicio;
const T_SATELITE = MARCOS.satelite - INICIO;
const T_X = MARCOS.xOrbita - INICIO;
const T_TRAJ = MARCOS.trajetoria - INICIO;
const ORIGEM: Vec3 = [0, 0, 0];
const SOL_LOCAL: Vec3 = [DIRECAO_SOL[0] * 420000, DIRECAO_SOL[1] * 420000, DIRECAO_SOL[2] * 420000];
void POSICAO_SOL;

// ---------------- Parte 1: mergulho na atmosfera ----------------
const ALVO_SUPERFICIE: Vec3 = [-5000, 0, 2000]; // perto da divisão dia/noite

const Mergulho: React.FC<{ t: number }> = ({ t }) => {
  const { width, height } = useVideoConfig();
  const dur = T_SATELITE;
  const p = interpolate(t, [0, dur], [0, 1], { ...clamp, easing: ease });
  // Altitude cai de forma exponencial (sensação de velocidade constante)
  const altitude = 90000 * Math.pow(1400 / 90000, p);
  const horizontal = lerp(60000, 9000, p);
  const posicao: Vec3 = [ALVO_SUPERFICIE[0] + horizontal * 0.55, altitude, ALVO_SUPERFICIE[2] + horizontal];
  // No fim olha para o horizonte (para onde fica a divisão entre dia e noite)
  const olharHorizonte = interpolate(p, [0.55, 1], [0, 1], { ...clamp, easing: ease });
  const alvo: Vec3 = [
    lerp(0, ALVO_SUPERFICIE[0] - 14000, olharHorizonte),
    lerp(-2000, altitude * 0.55, olharHorizonte),
    lerp(0, ALVO_SUPERFICIE[2] - 14000, olharHorizonte),
  ];
  // O céu aparece conforme a câmera desce (preto → azul-escuro → azul com faixa quente)
  const ceu = interpolate(Math.log10(altitude), [3.3, 4.6], [1, 0], clamp);
  const nevoa = new THREE.Color("#000000").lerp(new THREE.Color("#7fb2e6"), ceu);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill
        style={{
          opacity: ceu,
          background: "linear-gradient(180deg, #0b2a66 0%, #2f6fbf 35%, #8cc2f0 62%, #f3c48e 80%, #2a2440 100%)",
        }}
      />
      <ThreeCanvas
        width={width}
        height={height}
        gl={{ logarithmicDepthBuffer: true }}
        camera={{ fov: 55, near: 1, far: 3e6 }}
      >
        <Camera posicao={posicao} alvo={alvo} />
        <fog attach="fog" args={[nevoa.getStyle(), lerp(200000, 6000, ceu), lerp(600000, 60000, ceu)]} />
        <hemisphereLight args={["#3a4a70", "#05060a", 0.15 + ceu * 0.2]} />
        <Estrelas raio={1.5e6} opacidade={1 - ceu} />
        <SolVisivel posicao={SOL_LOCAL} raio={9000} brilho={1 + ceu} />
        <PlanetaDisco giroNuvens={(INICIO + t) * 0.004} intensidadeAtmosfera={lerp(1.4, 0.4, ceu)} />
        <LuzSolarNoDisco centroDisco={ORIGEM} direcaoSol={DIRECAO_SOL} />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};

// Fatores que mantêm uma atmosfera (aparecem junto com a fala)
const FATORES = [
  { texto: "GRAVIDADE", inicio: 2.7 },
  { texto: "TEMPERATURA", inicio: 4.1 },
  { texto: "GASES", inicio: 5.0 },
];
const Fatores: React.FC<{ t: number }> = ({ t }) => {
  const { fps } = useVideoConfig();
  if (t >= T_SATELITE + 0.2) return null;
  const sair = interpolate(t, [T_SATELITE - 0.3, T_SATELITE + 0.1], [1, 0], clamp);
  return (
    <div style={{ position: "absolute", top: 300, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 18, opacity: sair }}>
      <div style={{ color: "#dff1ff", fontFamily: "Arial, sans-serif", fontWeight: 800, fontSize: 34, letterSpacing: 3, opacity: interpolate(t, [2.2, 2.6], [0, 1], clamp), textShadow: "0 2px 10px rgba(0,0,0,0.7)" }}>
        MANTER O AR DEPENDE DE:
      </div>
      {FATORES.map((f) => {
        const e = spring({ frame: Math.round((t - f.inicio) * fps), fps, config: { damping: 13, stiffness: 190 } });
        if (t < f.inicio) return null;
        return (
          <div
            key={f.texto}
            style={{
              padding: "12px 34px",
              borderRadius: 40,
              background: "rgba(10,30,70,0.72)",
              border: "3px solid #8cc8ff",
              color: "#ffffff",
              fontFamily: "Arial Black, Arial, sans-serif",
              fontWeight: 900,
              fontSize: 46,
              transform: `scale(${0.6 + 0.4 * e})`,
              opacity: e,
            }}
          >
            {f.texto}
          </div>
        );
      })}
    </div>
  );
};

// ---------------- Parte 2: satélite ----------------
const Satelite: React.FC<{ posicao: Vec3; direcao: Vec3 }> = ({ posicao, direcao }) => {
  const q = useMemo(() => {
    const d = new THREE.Vector3(...direcao).normalize();
    return new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), d);
  }, [direcao]);
  // Tamanho muito exagerado (≈5 km) só para ficar visível nesta escala
  return (
    <group position={posicao} quaternion={q} scale={800}>
      <mesh>
        <boxGeometry args={[1.2, 1.2, 2]} />
        <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.3} emissive="#3a2a00" emissiveIntensity={0.4} />
      </mesh>
      {[-1, 1].map((l) => (
        <mesh key={l} position={[l * 2.6, 0, 0]}>
          <boxGeometry args={[3.6, 0.05, 1.3]} />
          <meshStandardMaterial color="#1d3f7a" metalness={0.5} roughness={0.3} emissive="#0d2350" emissiveIntensity={0.6} />
        </mesh>
      ))}
      <mesh position={[0, 0.9, 0.6]} rotation={[0.6, 0, 0]}>
        <coneGeometry args={[0.6, 0.3, 20, 1, true]} />
        <meshStandardMaterial color="#eeeeee" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

// Órbita circular "copiada" da Terra real (tracejada), no plano inclinado
const INCLINACAO = (55 * Math.PI) / 180;
const RAIO_ORBITA_COPIADA = 1.7 * RAIO;
const pontoCopiado = (ang: number): Vec3 => [
  Math.cos(ang) * RAIO_ORBITA_COPIADA,
  Math.sin(ang) * Math.sin(INCLINACAO) * RAIO_ORBITA_COPIADA - (ESPESSURA_RELATIVA / 2) * RAIO,
  Math.sin(ang) * Math.cos(INCLINACAO) * RAIO_ORBITA_COPIADA,
];

const OrbitaTracejada: React.FC<{ cor: string; opacidade: number }> = ({ cor, opacidade }) => {
  const tracos = useMemo(() => {
    const N = 64;
    return Array.from({ length: N }, (_, i) => {
      const a0 = (i / N) * Math.PI * 2;
      const a1 = a0 + (Math.PI * 2) / N / 2;
      const curva = new THREE.LineCurve3(new THREE.Vector3(...pontoCopiado(a0)), new THREE.Vector3(...pontoCopiado(a1)));
      return new THREE.TubeGeometry(curva, 1, 180, 6, false);
    });
  }, []);
  if (opacidade <= 0.01) return null;
  return (
    <>
      {tracos.map((g, i) => (
        <mesh key={i} geometry={g}>
          <meshBasicMaterial color={cor} transparent opacity={opacidade} toneMapped={false} />
        </mesh>
      ))}
    </>
  );
};

const pontosCalculados = () =>
  orbitaNoDisco().map(
    ([x, y, z]) => new THREE.Vector3(x * RAIO, y * RAIO - (ESPESSURA_RELATIVA / 2) * RAIO, z * RAIO),
  );

const TrajetoriaCalculada: React.FC<{ progresso: number }> = ({ progresso }) => {
  const geo = useMemo(() => {
    const curva = new THREE.CatmullRomCurve3(pontosCalculados());
    return new THREE.TubeGeometry(curva, 1300, 220, 6, false);
  }, []);
  const total = geo.index ? geo.index.count : 0;
  geo.setDrawRange(0, Math.floor(total * progresso / 6) * 6);
  return (
    <mesh geometry={geo}>
      <meshBasicMaterial color="#5cf2ff" toneMapped={false} transparent opacity={0.9} />
    </mesh>
  );
};

const Orbitas: React.FC<{ t: number }> = ({ t }) => {
  const { width, height } = useVideoConfig();
  const ts = t - T_SATELITE;
  const dur = CENAS.atmosfera.fim - MARCOS.satelite;
  // Câmera de lado e um pouco acima, girando devagar
  const p = interpolate(ts, [0, dur], [0, 1], { ...clamp, easing: ease });
  const ang = lerp(0.5, -0.2, p);
  const dist = lerp(118000, 128000, p);
  const posicao: Vec3 = [Math.sin(ang) * dist, lerp(26000, 42000, p), Math.cos(ang) * dist];

  const calculada = t >= T_TRAJ;
  const pontos = useMemo(pontosCalculados, []);
  let posSat: Vec3;
  let dirSat: Vec3;
  let progresso = 0;
  if (!calculada) {
    // Antes da correção: segue a órbita copiada
    const ang0 = 0.4 + ts * 0.55;
    posSat = pontoCopiado(ang0);
    const prox = pontoCopiado(ang0 + 0.01);
    dirSat = [prox[0] - posSat[0], prox[1] - posSat[1], prox[2] - posSat[2]];
  } else {
    progresso = interpolate(t, [T_TRAJ, CENAS.atmosfera.fim - INICIO - 0.2], [0.02, 1], { ...clamp, easing: ease });
    const i = Math.min(pontos.length - 2, Math.floor(progresso * (pontos.length - 1)));
    posSat = [pontos[i].x, pontos[i].y, pontos[i].z];
    dirSat = [pontos[i + 1].x - pontos[i].x, pontos[i + 1].y - pontos[i].y, pontos[i + 1].z - pontos[i].z];
  }
  // A câmera acompanha o satélite de leve, sem perder o disco do quadro
  const alvo: Vec3 = [posSat[0] * 0.25, -9000 + posSat[1] * 0.25, posSat[2] * 0.25];
  // A órbita copiada fica vermelha no X e depois some
  const corCopiada = t >= T_X ? "#ff2a2a" : "#ffffff";
  const opCopiada = t < T_X ? 0.7 : interpolate(t, [T_X, T_TRAJ, T_TRAJ + 0.6], [0.95, 0.95, 0], clamp);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <ThreeCanvas
        width={width}
        height={height}
        gl={{ logarithmicDepthBuffer: true }}
        camera={{ fov: 50, near: 5, far: 3e6 }}
      >
        <Camera posicao={posicao} alvo={alvo} />
        <hemisphereLight args={["#3a4a70", "#05060a", 0.15]} />
        <Estrelas raio={1.5e6} />
        <SolVisivel posicao={SOL_LOCAL} raio={9000} />
        <PlanetaDisco giroNuvens={(INICIO + t) * 0.004} />
        <LuzSolarNoDisco centroDisco={ORIGEM} direcaoSol={DIRECAO_SOL} />
        <LuzDeBaixo />
        {/* Luz que ilumina só o satélite */}
        <pointLight position={[posSat[0] + 6000, posSat[1] + 8000, posSat[2] + 6000]} intensity={3} decay={0} distance={30000} />
        <OrbitaTracejada cor={corCopiada} opacidade={opCopiada} />
        {calculada && <TrajetoriaCalculada progresso={progresso} />}
        <Satelite posicao={posSat} direcao={dirSat} />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};

export const C5Atmosfera: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  return (
    <AbsoluteFill>
      {t < T_SATELITE ? <Mergulho t={t} /> : <Orbitas t={t} />}
      <Fatores t={t} />
    </AbsoluteFill>
  );
};
