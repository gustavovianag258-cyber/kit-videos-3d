import { useMemo } from "react";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";
import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { Carro, Pedestre, Predios, Rua } from "../../Cidade";
import { CeuCidade, LuzesCidade } from "../../cenas/comum";
import { DiscoCortado, PessoasNaGravidade, SetasGravidade } from "../Diagramas";
import { Camera, Estrelas } from "../mundo";
import { mapaDoPlaneta } from "../PlanetaDisco";
import { CENAS, clamp, ease, lerp, MARCOS, type Vec3 } from "../tempo";

// CENA 3 — A GRAVIDADE
// 1) Cidade normal vista do alto  2) CENÁRIO HIPOTÉTICO: tudo começa a flutuar
// 3) Congela + X vermelho          4) Diagrama: setas de gravidade calculadas no disco

const INICIO = CENAS.gravidade.inicio;
const T_FLUTUA = MARCOS.cidadeFlutua - INICIO;
const T_CONGELA = MARCOS.congelaCidade - INICIO;
const T_DIAGRAMA = MARCOS.diagramaGravidade - INICIO;

const PELES = ["#f1c27d", "#e0ac69", "#c68642", "#8d5524", "#ffdbac"];
const ROUPAS = ["#e74c3c", "#27ae60", "#f39c12", "#8e44ad", "#16a085", "#d35400", "#ecf0f1", "#2f80ed"];
const CABELOS = ["#2b1b12", "#4a2c1a", "#111111", "#a0522d", "#d9b26f"];
const CORES_CARRO = ["#e63946", "#f1c40f", "#3a86ff", "#ecf0f1", "#2a9d8f"];
const escolher = <T,>(l: T[], s: string) => l[Math.floor(random(s) * l.length)];

// Quanto cada objeto já "decolou" (0 a 1), com começo suave e atraso individual
const subida = (t: number, atraso: number) =>
  ease(Math.min(1, Math.max(0, (t - T_FLUTUA - atraso) / (T_CONGELA - T_FLUTUA - atraso + 0.6))));

const CidadeFlutuando: React.FC<{ t: number }> = ({ t }) => {
  const pessoas = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => {
        const s = `flut-p-${i}`;
        const lado = i % 2 === 0;
        return {
          x: lado ? -11.4 + random(`${s}-x`) * 1.8 : -1.6 + random(`${s}-x`) * 5.5,
          z: -40 + random(`${s}-z`) * 52,
          dir: random(`${s}-d`) > 0.5 ? 1 : -1,
          vel: 0.9 + random(`${s}-v`) * 0.4,
          altura: 4 + random(`${s}-h`) * 9,
          atraso: random(`${s}-a`) * 0.7,
          giro: (random(`${s}-g`) - 0.5) * 1.6,
          roupa: escolher(ROUPAS, `${s}-r`),
          pele: escolher(PELES, `${s}-p`),
          cabelo: escolher(CABELOS, `${s}-c`),
        };
      }),
    [],
  );
  const carros = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        x: i % 2 ? -3.8 : -7.2,
        z: -38 + i * 9,
        dir: i % 2 ? 1 : -1,
        altura: 3 + random(`flut-c-h-${i}`) * 4,
        atraso: 0.2 + random(`flut-c-a-${i}`) * 0.6,
        giro: (random(`flut-c-g-${i}`) - 0.5) * 0.9,
        cor: CORES_CARRO[i % CORES_CARRO.length],
      })),
    [],
  );
  const papeis = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        x: -12 + random(`pap-x-${i}`) * 17,
        z: -35 + random(`pap-z-${i}`) * 45,
        fase: random(`pap-f-${i}`) * Math.PI * 2,
        altura: 6 + random(`pap-h-${i}`) * 14,
        atraso: random(`pap-a-${i}`) * 0.5,
      })),
    [],
  );
  // Até o começo da flutuação, todos andam; depois "travam" na posição e sobem
  const tAndar = Math.min(t, T_FLUTUA + 0.4);

  return (
    <>
      {pessoas.map((p, i) => {
        const s = subida(t, p.atraso);
        const dist = p.vel * tAndar;
        return (
          <group
            key={i}
            position={[0, s * p.altura, 0]}
            rotation={[s * p.giro * 0.6, 0, s * p.giro]}
          >
            <Pedestre
              x={p.x}
              z={p.z + p.dir * dist}
              dir={p.dir}
              fase={(dist / 1.4) * Math.PI * 2 * (1 - s)}
              roupa={p.roupa}
              pele={p.pele}
              cabelo={p.cabelo}
              escala={1}
            />
          </group>
        );
      })}
      {carros.map((c, i) => {
        const s = subida(t, c.atraso);
        const z = c.z + c.dir * 6 * tAndar;
        return (
          <group key={i} position={[c.x, s * c.altura, z]} rotation={[s * c.giro, 0, s * c.giro * 0.7]}>
            <Carro x={0} z={0} dir={c.dir} cor={c.cor} />
          </group>
        );
      })}
      {papeis.map((p, i) => {
        const s = subida(t, p.atraso);
        if (s <= 0) return null;
        const tl = t - T_FLUTUA;
        return (
          <mesh
            key={i}
            position={[p.x + Math.sin(tl * 1.3 + p.fase) * 0.8 * s, 0.2 + s * p.altura, p.z + Math.cos(tl + p.fase) * 0.6 * s]}
            rotation={[tl * 1.7 + p.fase, tl * 1.1, tl * 0.8]}
          >
            <planeGeometry args={[0.3, 0.42]} />
            <meshStandardMaterial color="#fafafa" side={THREE.DoubleSide} roughness={0.9} />
          </mesh>
        );
      })}
    </>
  );
};

const Cidade: React.FC<{ t: number }> = ({ t }) => {
  const { width, height } = useVideoConfig();
  // Câmera aérea que desce e avança devagar; na flutuação acompanha a subida
  const p = interpolate(t, [0, T_CONGELA], [0, 1], { ...clamp, easing: ease });
  const posicao: Vec3 = [lerp(14, 8, p), lerp(32, 16, p), lerp(30, 14, p)];
  const alvo: Vec3 = [-4, lerp(0, 5, interpolate(t, [T_FLUTUA, T_CONGELA], [0, 1], clamp)), -8];
  const caos = interpolate(t, [T_FLUTUA, T_CONGELA], [0, 1], { ...clamp, easing: ease });
  return (
    <AbsoluteFill>
      <CeuCidade mistura={0.25 + caos * 0.5} />
      <ThreeCanvas width={width} height={height} shadows camera={{ fov: 50, near: 0.1, far: 600 }}>
        <Camera posicao={posicao} alvo={alvo} />
        <LuzesCidade mistura={0.25 + caos * 0.5} nevoaPerto={60} nevoaLonge={220} />
        <Rua />
        <Predios />
        <CidadeFlutuando t={t} />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};

const Diagrama: React.FC<{ t: number }> = ({ t }) => {
  const { width, height } = useVideoConfig();
  const mapa = useMemo(() => {
    const tex = new THREE.CanvasTexture(mapaDoPlaneta().cor);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);
  const tl = t - T_DIAGRAMA;
  const duracao = CENAS.gravidade.fim - MARCOS.diagramaGravidade;
  // Enquadra do centro até depois da borda (o disco é simétrico) e gira devagar
  // de 3/4 para quase de frente ao corte
  const p = interpolate(tl, [0, duracao], [0, 1], { ...clamp, easing: ease });
  const ang = lerp(0.42, 0.08, p);
  const dist = lerp(3.6, 3.2, p);
  const CENTRO_X = 0.52;
  const posicao: Vec3 = [CENTRO_X + Math.sin(ang) * dist, lerp(1.0, 0.42, p), Math.cos(ang) * dist];
  const setas = interpolate(tl, [0.6, 3.4], [0, 1], clamp);
  const pessoas = interpolate(tl, [3.2, 5.2], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #142a4f 0%, #050912 70%)" }}>
      <ThreeCanvas width={width} height={height} camera={{ fov: 42, near: 0.01, far: 100 }}>
        <Camera posicao={posicao} alvo={[CENTRO_X, lerp(-0.2, -0.1, p), 0]} />
        <ambientLight intensity={0.55} />
        <directionalLight position={[2, 3, 4]} intensity={1.6} />
        <directionalLight position={[-3, 1, 2]} intensity={0.5} color="#9fc4ff" />
        <Estrelas raio={60} quantidade={600} opacidade={0.6} />
        <DiscoCortado textura={mapa} />
        <SetasGravidade progresso={setas} />
        <PessoasNaGravidade progresso={pessoas} />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};

export const C3Gravidade: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  if (t >= T_DIAGRAMA) return <Diagrama t={t} />;
  // Congelado: a imagem para no instante do X e perde cor
  const congelado = t >= T_CONGELA;
  const tCena = Math.min(t, T_CONGELA);
  const filtro = congelado
    ? `saturate(${interpolate(t, [T_CONGELA, T_CONGELA + 0.3], [1, 0.25], clamp)}) brightness(0.72)`
    : "none";
  return (
    <AbsoluteFill style={{ filter: filtro }}>
      <Cidade t={tCena} />
    </AbsoluteFill>
  );
};

