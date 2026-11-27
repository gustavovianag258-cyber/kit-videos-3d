import { useMemo } from "react";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Astronauta } from "../Astronauta";
import { Seta3D } from "../Diagramas";
import { ExteriorEstacao, InteriorEstacao } from "../Estacao";
import { ESPESSURA_RELATIVA, orbitaNoDisco, setasNaSuperficie } from "../fisica";
import { Camera, CENTRO_DISCO, DIRECAO_SOL, Estrelas, POSICAO_SOL } from "../mundo";
import { PlanetaDisco, RAIO } from "../PlanetaDisco";
import { LuzDeBaixo, LuzSolarNoDisco, SolVisivel } from "../Sol";
import { aberturaBoca, CENAS, clamp, ease, lerp, lerp3, MARCOS, type Vec3 } from "../tempo";
import { RECAPITULACAO } from "../correcoes";

// CENA 6 — A GRANDE CONCLUSÃO
// Volta ao astronauta na janela; a câmera sai da estação e se afasta até a imagem
// monumental do disco. Os temas do vídeo reaparecem integrados à cena 3D.

const INICIO = CENAS.conclusao.inicio;
const T_SAIR = MARCOS.recapitulacao - INICIO;
const destaque = (nome: string, t: number) => {
  const r = RECAPITULACAO.find((x) => x.texto === nome);
  if (!r) return 0;
  return interpolate(t, [r.inicio - INICIO, r.inicio - INICIO + 0.5], [0, 1], { ...clamp, easing: ease });
};

const Dentro: React.FC<{ t: number }> = ({ t }) => {
  const { width, height, fps } = useVideoConfig();
  const frameGlobal = Math.round((INICIO + t) * fps);
  // Mesma composição do fim da cena 1, recuando devagar
  const p = interpolate(t, [0, T_SAIR], [0, 1], { ...clamp, easing: ease });
  const posicao: Vec3 = lerp3([0.22, 0.26, 0.55], [0.4, 0.34, 1.6], p);
  const alvoDisco: Vec3 = [CENTRO_DISCO[0], CENTRO_DISCO[1] - 16000, CENTRO_DISCO[2]];
  const dir = [alvoDisco[0] - posicao[0], alvoDisco[1] - posicao[1], alvoDisco[2] - posicao[2]];
  const n = Math.hypot(dir[0], dir[1], dir[2]);
  const alvo: Vec3 = [posicao[0] + (dir[0] / n) * 10, posicao[1] + (dir[1] / n) * 10, posicao[2] + (dir[2] / n) * 10];
  return (
    <ThreeCanvas width={width} height={height} gl={{ logarithmicDepthBuffer: true }} camera={{ fov: 52, near: 0.03, far: 3e6 }}>
      <Camera posicao={posicao} alvo={alvo} />
      <pointLight position={[0, -0.6, -3.5]} color="#bcd8ff" intensity={1.6} decay={0} distance={12} />
      <pointLight position={[-1.5, 1, -3.2]} color="#ffe2b8" intensity={1.8} decay={0} distance={12} />
      <InteriorEstacao tempo={INICIO + t} />
      <group position={[-0.48, -0.22, -0.65]} rotation={[0, Math.PI - 0.15, 0]}>
        <Astronauta frame={frameGlobal} boca={aberturaBoca(frameGlobal)} espanto={0.6} giroCabeca={[0.3, 0]} bracoDireito={0.55} flutuar={INICIO + t} />
      </group>
      <Estrelas raio={1.5e6} />
      <group position={CENTRO_DISCO}>
        <PlanetaDisco giroNuvens={(INICIO + t) * 0.004} />
      </group>
      <hemisphereLight args={["#3a4a70", "#05060a", 0.12]} />
      <LuzSolarNoDisco centroDisco={CENTRO_DISCO} direcaoSol={DIRECAO_SOL} />
    </ThreeCanvas>
  );
};

// Setas grandes sobre o disco (as mesmas direções calculadas, em vários ângulos)
const SetasSobreDisco: React.FC<{ forca: number }> = ({ forca }) => {
  // Só três raios (centro, meio e borda) em quatro direções: limpo e legível
  const setas = setasNaSuperficie().filter((s) => [0.4, 0.88].some((r) => Math.abs(s.x - r) < 0.01));
  if (forca <= 0.01) return null;
  return (
    <>
      {[0, 1, 2, 3].map((k) => {
        const giro = (k / 4) * Math.PI * 2 + 0.6;
        return (
          <group key={k} rotation={[0, giro, 0]}>
            {setas.map((s, i) => {
              const comp = 0.24 * RAIO * forca;
              return (
                <Seta3D
                  key={i}
                  origem={[s.x * RAIO - s.dx * comp, 3000 - s.dy * comp, 0]}
                  direcao={[s.dx, s.dy, 0]}
                  comprimento={comp}
                  cor="#ffd60a"
                  espessura={260}
                />
              );
            })}
          </group>
        );
      })}
    </>
  );
};

// Cortina de água em volta da borda (o cenário hipotético da cachoeira)
const CortinaAgua: React.FC<{ forca: number }> = ({ forca }) => {
  if (forca <= 0.01) return null;
  return (
    <mesh position={[0, -ESPESSURA_RELATIVA * RAIO * 1.2, 0]}>
      <cylinderGeometry args={[RAIO * 1.005, RAIO * 1.04, ESPESSURA_RELATIVA * RAIO * 2.4, 128, 1, true]} />
      <meshStandardMaterial color="#8fd0ff" emissive="#2d6aa8" emissiveIntensity={0.5} transparent opacity={0.45 * forca} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
};

const OrbitaFinal: React.FC<{ forca: number }> = ({ forca }) => {
  const geo = useMemo(() => {
    const pts = orbitaNoDisco().map(([x, y, z]) => new THREE.Vector3(x * RAIO, y * RAIO - (ESPESSURA_RELATIVA / 2) * RAIO, z * RAIO));
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 1300, 200, 6, false);
  }, []);
  if (forca <= 0.01) return null;
  return (
    <mesh geometry={geo}>
      <meshBasicMaterial color="#5cf2ff" transparent opacity={0.75 * forca} toneMapped={false} />
    </mesh>
  );
};

const Fora: React.FC<{ t: number }> = ({ t }) => {
  const { width, height } = useVideoConfig();
  const tl = t - T_SAIR;
  const dur = CENAS.conclusao.fim - MARCOS.recapitulacao;
  // Sai de perto da janela e recua até ver o disco inteiro, monumental
  const p = interpolate(tl, [0, dur], [0, 1], { ...clamp, easing: ease });
  const ang = lerp(0.15, 0.7, p);
  const dist = lerp(8, 135000, Math.pow(p, 2.2));
  const perto: Vec3 = [1.5, 1.5, -8];
  const longe: Vec3 = [
    CENTRO_DISCO[0] + Math.sin(ang) * 135000,
    CENTRO_DISCO[1] + 52000,
    CENTRO_DISCO[2] + Math.cos(ang) * 135000,
  ];
  const mistura = interpolate(tl, [0, dur * 0.85], [0, 1], { ...clamp, easing: ease });
  const posicao = lerp3(perto, longe, mistura);
  void dist;
  // Olha da estação (começo) para o centro do disco (fim)
  const alvo = lerp3([0, -0.5, 4], [CENTRO_DISCO[0], CENTRO_DISCO[1] - 4000, CENTRO_DISCO[2]], interpolate(tl, [0, 0.9], [0, 1], { ...clamp, easing: ease }));
  const sol = destaque("LUZ DO SOL", t);
  const atmosfera = destaque("ATMOSFERA", t);
  return (
    <ThreeCanvas width={width} height={height} gl={{ logarithmicDepthBuffer: true }} camera={{ fov: 50, near: 0.3, far: 3e6 }}>
      <Camera posicao={posicao} alvo={alvo} />
      <hemisphereLight args={["#3a4a70", "#05060a", 0.12]} />
      <pointLight position={[-40, 18, 25]} color="#fff1dc" intensity={2.4} decay={0} distance={160} />
      <Estrelas raio={1.5e6} />
      <SolVisivel posicao={POSICAO_SOL} raio={9000} brilho={1 + sol * 0.8} />
      <ExteriorEstacao />
      <group position={CENTRO_DISCO}>
        <PlanetaDisco giroNuvens={(INICIO + t) * 0.004} intensidadeAtmosfera={0.9 + atmosfera * 0.9 * (1 - Math.max(0, destaque("ÓRBITAS", t)) * 0.5)} />
        <SetasSobreDisco forca={destaque("GRAVIDADE", t) * (1 - destaque("ATMOSFERA", t) * 0.6)} />
        <CortinaAgua forca={destaque("ÁGUA", t) * (1 - destaque("LUZ DO SOL", t) * 0.5)} />
        <OrbitaFinal forca={destaque("ÓRBITAS", t)} />
      </group>
      <LuzSolarNoDisco centroDisco={CENTRO_DISCO} direcaoSol={DIRECAO_SOL} intensidade={4.2 + sol * 2.5} />
      <LuzDeBaixo />
    </ThreeCanvas>
  );
};

export const C6Conclusao: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  return <AbsoluteFill style={{ backgroundColor: "#000" }}>{t < T_SAIR ? <Dentro t={t} /> : <Fora t={t} />}</AbsoluteFill>;
};
