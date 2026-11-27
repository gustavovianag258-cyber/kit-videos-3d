import { RoundedBox } from "@react-three/drei";
import { useLayoutEffect, useMemo, useRef } from "react";
import { continueRender, delayRender, interpolate, random, staticFile } from "remotion";
import * as THREE from "three";
import dados from "../../namorada/mundo-dados.json";
import { AguaViva, Entulho, Respingo, TroncoBatendo } from "./Acao";
import { uma } from "./CasaPartida";
import { RioVivo } from "./Rio";

// Os cenários das demonstrações. Mesmo jeito liso do narrador, com detalhe. Unidade = metro (o mapa e o globo têm escala própria).
type V3 = [number, number, number];
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const sv = (x: number) => x * x * (3 - 2 * x);
export const entre = (t: number, a: number, b: number) => sv(Math.min(1, Math.max(0, (t - a) / (b - a))));

const Peca: React.FC<{ p: V3; s: V3; cor: string; rugoso?: number; metal?: number; raio?: number; rot?: V3; brilho?: string; forca?: number; op?: number }> = ({ p, s, cor, rugoso = 0.85, metal = 0, raio = 0.015, rot, brilho, forca = 0, op }) => (
  <RoundedBox args={s} position={p} rotation={rot} radius={Math.min(raio, Math.min(...s) * 0.45)} smoothness={2} castShadow receiveShadow>
    <meshStandardMaterial color={cor} roughness={rugoso} metalness={metal} emissive={brilho ?? "#000000"} emissiveIntensity={forca} transparent={op !== undefined} opacity={op ?? 1} />
  </RoundedBox>
);
const Cil: React.FC<{ p: V3; r: number; l: number; cor: string; rot?: V3; rugoso?: number; metal?: number }> = ({ p, r, l, cor, rot, rugoso = 0.7, metal = 0 }) => (
  <mesh position={p} rotation={rot} castShadow receiveShadow>
    <cylinderGeometry args={[r, r, l, 18]} />
    <meshStandardMaterial color={cor} roughness={rugoso} metalness={metal} />
  </mesh>
);
const tela = (l: number, a: number, f: (g: CanvasRenderingContext2D) => void) => {
  const c = document.createElement("canvas");
  c.width = l;
  c.height = a;
  f(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};
const placaTexto = (texto: string, sub: string, fundo: string, cor = "#fff") =>
  tela(512, 256, (g) => {
    g.fillStyle = fundo;
    g.fillRect(0, 0, 512, 256);
    g.fillStyle = cor;
    g.textAlign = "center";
    g.font = "700 54px Arial, sans-serif";
    g.fillText(texto, 256, sub ? 118 : 148);
    if (sub) {
      g.font = "700 32px Arial, sans-serif";
      g.fillText(sub, 256, 178);
    }
  });
const Fundo: React.FC<{ cor: string }> = ({ cor }) => (
  <mesh>
    <sphereGeometry args={[400, 24, 16]} />
    <meshBasicMaterial color={cor} side={THREE.BackSide} />
  </mesh>
);
const ceuDia = () =>
  tela(256, 512, (g) => {
    const d = g.createLinearGradient(0, 0, 0, 512);
    d.addColorStop(0, "#6F8DA6");
    d.addColorStop(0.75, "#C9D2D4");
    d.addColorStop(1, "#E3DFD2");
    g.fillStyle = d;
    g.fillRect(0, 0, 256, 512);
  });
const Ceu: React.FC = () => (
  <mesh position={[0, 90, -240]}>
    <planeGeometry args={[700, 240]} />
    <meshBasicMaterial map={uma("ceuDia", ceuDia)} />
  </mesh>
);
const SolPadrao: React.FC<{ forca?: number; cor?: string; ceu?: number; alvo?: V3; pos?: V3; area?: number }> = ({ forca = 3, cor = "#FFE6C4", ceu = 0.75, pos = [-6, 12, 9], area = 14 }) => (
  <>
    <hemisphereLight args={["#C8D6E4", "#6E5E4C", ceu]} />
    <directionalLight position={pos} intensity={forca} color={cor} castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0003} shadow-normalBias={0.02} shadow-camera-left={-area} shadow-camera-right={area} shadow-camera-top={area} shadow-camera-bottom={-area} shadow-camera-far={70} />
  </>
);

// ---------- globo ----------
// As imagens da Terra carregam uma vez, antes de tudo. Dentro do componente, o React pode rodar o início duas
// vezes, e a segunda espera nunca seria liberada.
const IMAGENS: Record<string, THREE.Texture> = {};
["noticias/el-nino/terra/earth_atmos_2048.jpg", "noticias/el-nino/terra/earth_clouds_1024.png"].forEach((arquivo) => {
  const espera = delayRender(`img ${arquivo}`, { timeoutInMilliseconds: 120000 });
  new THREE.TextureLoader().load(
    staticFile(arquivo),
    (t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
      IMAGENS[arquivo] = t;
      continueRender(espera);
    },
    undefined,
    () => continueRender(espera),
  );
});
const usaImagem = (arquivo: string): THREE.Texture | null => IMAGENS[arquivo] ?? null;
const manchaCalor = () => {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 512;
  const g = c.getContext("2d")!;
  const px = (lon: number) => ((lon + 180) / 360) * 1024;
  const py = (lat: number) => ((90 - lat) / 180) * 512;
  const blob = (lon: number, lat: number, rx: number, ry: number, cor: string) => {
    g.save();
    g.translate(px(lon), py(lat));
    g.scale(1, ry / rx);
    const d = g.createRadialGradient(0, 0, 0, 0, 0, rx);
    d.addColorStop(0, cor);
    d.addColorStop(1, "rgba(255,70,20,0)");
    g.fillStyle = d;
    g.beginPath();
    g.arc(0, 0, rx, 0, 7);
    g.fill();
    g.restore();
  };
  blob(-125, -1, 200, 38, "rgba(255,70,20,0.75)");
  blob(-100, -2, 100, 24, "rgba(255,120,30,0.85)");
  blob(-150, 0, 110, 22, "rgba(255,90,30,0.7)");
  // a área Niño 3.4, medida de verdade: 5°N a 5°S, 170°O a 120°O
  g.strokeStyle = "rgba(255,255,255,0.95)";
  g.lineWidth = 2.4;
  g.setLineDash([9, 7]);
  g.strokeRect(px(-170), py(5), px(-120) - px(-170), py(-5) - py(5));
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};
export const MundoGlobo: React.FC<{ t: number; estado?: string }> = ({ t, estado }) => {
  const terra = usaImagem("noticias/el-nino/terra/earth_atmos_2048.jpg");
  const nuvens = usaImagem("noticias/el-nino/terra/earth_clouds_1024.png");
  const calor = uma("calor", manchaCalor);
  // Pacífico de frente; gira devagar
  const ry = 0.62 + (t - 4.9) * 0.011;
  const estrelas = useMemo(() => {
    const p = new Float32Array(1400 * 3);
    for (let i = 0; i < 1400; i++) {
      const a = random(`ea${i}`) * Math.PI * 2;
      const b = Math.acos(2 * random(`eb${i}`) - 1);
      p.set([Math.sin(b) * Math.cos(a) * 200, Math.cos(b) * 200, Math.sin(b) * Math.sin(a) * 200], i * 3);
    }
    return p;
  }, []);
  const pulso = estado === "calor" || estado === "ele" ? 0.82 + 0.18 * Math.sin(t * 3) : 0.55;
  return (
    <>
      <Fundo cor="#05070F" />
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[estrelas, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#D8E2F0" size={0.55} sizeAttenuation transparent opacity={0.8} />
      </points>
      <hemisphereLight args={["#90A4C8", "#0A0E18", 0.5]} />
      <directionalLight position={[-2, 2, 4]} intensity={4.2} color="#FFF3E0" />
      <group rotation={[0.03, ry, 0]}>
        <mesh>
          <sphereGeometry args={[1, 96, 64]} />
          {terra ? <meshStandardMaterial map={terra} roughness={0.72} /> : <meshStandardMaterial color="#20365A" />}
        </mesh>
        <mesh>
          <sphereGeometry args={[1.003, 96, 64]} />
          <meshBasicMaterial map={calor} transparent opacity={pulso} depthWrite={false} />
        </mesh>
        {nuvens && (
          <mesh rotation={[0, t * 0.006, 0]}>
            <sphereGeometry args={[1.012, 72, 48]} />
            <meshStandardMaterial map={nuvens} alphaMap={nuvens} transparent opacity={0.22} depthWrite={false} />
          </mesh>
        )}
      </group>
      {/* atmosfera */}
      <mesh scale={1.06}>
        <sphereGeometry args={[1, 64, 40]} />
        <meshBasicMaterial color="#4F93E0" transparent opacity={0.09} side={THREE.BackSide} depthWrite={false} />
      </mesh>
    </>
  );
};

// ---------- escala ----------
const DEGRAUS: [string, string, string][] = [
  ["FRACO", "+0,5 a +1 °C", "#3E6E8F"],
  ["MODERADO", "+1 a +1,5 °C", "#B99B3F"],
  ["FORTE", "+1,5 a +2 °C", "#C96A2E"],
  ["MUITO FORTE", "+2 °C ou mais", "#B23423"],
];
const LARG_DEGRAU = 0.85;
const Degrau: React.FC<{ i: number }> = ({ i }) => {
  const [txt, sub, cor] = DEGRAUS[i];
  const tex = uma(`dg${i}`, () => placaTexto(txt, sub, cor));
  const h = 0.7 + i * 0.5;
  const x = -1.275 + i * LARG_DEGRAU;
  return (
    <group position={[x, 0, 0]}>
      <Peca p={[0, h / 2, 0]} s={[LARG_DEGRAU - 0.03, h, 2.2]} cor={cor} raio={0.03} rugoso={0.55} />
      <mesh position={[0, h - 0.24, 1.105]}>
        <planeGeometry args={[LARG_DEGRAU - 0.04, 0.4]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
    </group>
  );
};
const placaSuper = () => placaTexto("SUPER", "", "#EAE3D2", "#A42A1C");
export const MundoEscala: React.FC<{ t: number }> = ({ t }) => {
  // o carimbo "super" cai no topo, quica e sai da escala
  const cai = entre(t, 16.25, 16.72);
  const sai = entre(t, 17.25, 18.05);
  const y = interpolate(cai, [0, 1], [9, 2.46]) + Math.sin(sai * Math.PI) * 0.9 - sai * sai * 3.5;
  const x = 1.275 + sai * 2.2;
  const gira = -sai * 2.6;
  return (
    <>
      <Fundo cor="#10161F" />
      <SolPadrao forca={2.8} ceu={0.8} pos={[-5, 11, 9]} />
      <directionalLight position={[6, 4, 6]} intensity={0.8} color="#9DBBDC" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#1B2C3D" roughness={0.3} metalness={0.15} />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <Degrau key={i} i={i} />
      ))}
      <group position={[x, y, 0.2]} rotation={[0.1, 0, gira]}>
        <Peca p={[0, 0, 0]} s={[0.84, 0.42, 0.16]} cor="#EAE3D2" raio={0.03} />
        <mesh position={[0, 0, 0.085]}>
          <planeGeometry args={[0.8, 0.38]} />
          <meshBasicMaterial map={uma("super", placaSuper)} toneMapped={false} />
        </mesh>
      </group>
      {/* mar na base: é ele que a escala mede */}
      {new Array(8).fill(0).map((_, i) => (
        <mesh key={i} position={[-2.1 + i * 0.6, 0.06 + 0.02 * Math.sin(t * 2 + i), 1.5]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 0.3, 1]}>
          <torusGeometry args={[0.29, 0.035, 10, 28, Math.PI]} />
          <meshStandardMaterial color="#6FB2D8" roughness={0.3} />
        </mesh>
      ))}
    </>
  );
};

// ---------- Brasil ----------
const ANEIS = (dados as unknown as { brasil: number[][][] }).brasil;
const CONTORNO = ANEIS.slice().sort((a, b) => b.length - a.length)[0];
export const K_MAPA = 0.165;
export const mapaX = (lon: number) => (lon + 52) * K_MAPA;
export const mapaZ = (lat: number) => -(lat + 14) * K_MAPA;
const NORTE = [[-75, 6], [-46, 6], [-46, -1.2], [-48, -5], [-46, -8], [-46, -13], [-50, -13], [-50.5, -9.8], [-58.5, -9.5], [-60, -13.6], [-65, -14], [-75, -14]];
const NORDESTE = [[-46, 0], [-30, 0], [-30, -18.5], [-39.7, -18.4], [-41, -15], [-44, -14.8], [-46, -15], [-46, -13], [-46, -8], [-48, -5], [-46, -1.2]];
const CENTRO = [[-50, -13], [-46, -13], [-47, -16], [-47.3, -17], [-50, -19.5], [-51, -20], [-52, -22.6], [-58, -24.5], [-61, -22], [-61, -13.6], [-60, -13.6], [-58.5, -9.5], [-50.5, -9.8]];
const SUDESTE = [[-47.3, -17], [-46, -15], [-44, -14.8], [-41, -15], [-39.7, -18.4], [-38, -21], [-38, -25], [-44, -25], [-48, -24.6], [-52, -22.6], [-51, -20], [-50, -19.5]];
const SUL = [[-60, -22.6], [-52, -22.6], [-48, -24.6], [-44, -25], [-44, -36], [-60, -36]];
const RORAIMA = [[-65, 5.5], [-58.5, 5.5], [-59, 0.5], [-60.4, -1.4], [-62, 0.4], [-64.5, 1.5]];
const RS = [[-60, -27], [-52, -27], [-48, -29], [-48, -36], [-60, -36]];

const mapaTextura = (estado: string) =>
  tela(1024, 1024, (g) => {
    const px = (lon: number) => ((lon + 76) / 44) * 1024;
    const py = (lat: number) => ((8 - lat) / 44) * 1024;
    const caminho = (a: number[][]) => {
      g.beginPath();
      a.forEach(([lo, la], i) => (i ? g.lineTo(px(lo), py(la)) : g.moveTo(px(lo), py(la))));
      g.closePath();
    };
    const CORES: Record<string, Record<string, string>> = {
      neutro: { n: "#6D8A62", ne: "#AA9B6B", co: "#93A06A", se: "#7D9A6E", s: "#6E9378" },
      chuva: { n: "#5B6858", ne: "#6D6754", co: "#5E7A86", se: "#4E7E9C", s: "#2D75B4" },
      seco: { n: "#CE7A2E", ne: "#C7903F", co: "#5D6E55", se: "#5C6D57", s: "#50655C" },
      calor: { n: "#D2612A", ne: "#D07A32", co: "#CC6F2E", se: "#C97A3C", s: "#BF8749" },
      amazonia: { n: "#6D8A62", ne: "#6F6D58", co: "#5B6856", se: "#596A58", s: "#546858" },
    };
    const c = CORES[estado];
    g.fillStyle = c.se;
    g.fillRect(0, 0, 1024, 1024);
    const pinta = (a: number[][], cor: string) => {
      caminho(a);
      g.fillStyle = cor;
      g.fill();
    };
    pinta(NORTE, c.n);
    pinta(NORDESTE, c.ne);
    pinta(CENTRO, c.co);
    pinta(SUDESTE, c.se);
    pinta(SUL, c.s);
    if (estado === "seco") {
      // "áreas do Nordeste": a metade do litoral sul fica de fora
      caminho([[-46, -9], [-34, -9], [-34, -19], [-46, -16]]);
      g.fillStyle = "#6E6D58";
      g.fill();
    }
    if (estado === "calor") {
      caminho(RS);
      g.fillStyle = "#6E93A0";
      g.fill();
    }
    if (estado === "amazonia") {
      caminho(RORAIMA);
      g.fillStyle = "#D2702A";
      g.fill();
    }
    // textura de relevo: manchas
    for (let i = 0; i < 180; i++) {
      const x = random(`ma${i}`) * 1024;
      const y = random(`mb${i}`) * 1024;
      const r = 20 + random(`mc${i}`) * 80;
      const d = g.createRadialGradient(x, y, 0, x, y, r);
      d.addColorStop(0, random(`md${i}`) > 0.5 ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.09)");
      d.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = d;
      g.fillRect(x - r, y - r, r * 2, r * 2);
    }
    // divisas das regiões
    g.strokeStyle = "rgba(255,255,255,0.4)";
    g.lineWidth = 2;
    [NORTE, NORDESTE, CENTRO, SUDESTE, SUL].forEach((a) => {
      caminho(a);
      g.stroke();
    });
    // rios
    g.strokeStyle = estado === "amazonia" ? "#F6B46C" : "#6EA9CC";
    g.lineWidth = estado === "amazonia" ? 7 : 3;
    g.lineCap = "round";
    const rio = (a: number[][]) => {
      g.beginPath();
      a.forEach(([lo, la], i) => (i ? g.lineTo(px(lo), py(la)) : g.moveTo(px(lo), py(la))));
      g.stroke();
    };
    rio([[-67, 1], [-63, -0.6], [-60, -3.1]]);
    rio([[-60.7, 3], [-61.5, -1.3]]);
    g.lineWidth = 3;
    g.strokeStyle = "#6EA9CC";
    rio([[-70, -3.4], [-65, -3], [-60, -3.1], [-55, -2.4], [-50, -0.5]]);
  });

const geoBrasil = () => {
  const s = new THREE.Shape();
  CONTORNO.forEach(([lo, la], i) => (i ? s.lineTo(mapaX(lo), -mapaZ(la)) : s.moveTo(mapaX(lo), -mapaZ(la))));
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.16, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.012, bevelSegments: 1, curveSegments: 2 });
  g.rotateX(-Math.PI / 2);
  // UV a partir da posição, pra casar com a textura do mapa
  const pos = g.attributes.position;
  const uv = g.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    const lon = pos.getX(i) / K_MAPA - 52;
    const lat = -pos.getZ(i) / K_MAPA - 14;
    uv.setXY(i, (lon + 76) / 44, 1 - (8 - lat) / 44);
  }
  return g;
};
const NuvemChuva: React.FC<{ t: number }> = ({ t }) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const n = 260;
  const cx = mapaX(-51.5);
  const cz = mapaZ(-27.5);
  useLayoutEffect(() => {
    const o = new THREE.Object3D();
    for (let i = 0; i < n; i++) {
      const y = (random(`rb${i}`) * 1.2 - t * 2.2) % 1.2;
      o.position.set(cx + (random(`rx${i}`) - 0.5) * 1.7, 0.18 + (y < 0 ? y + 1.2 : y), cz + (random(`rz${i}`) - 0.5) * 1.7);
      o.updateMatrix();
      ref.current!.setMatrixAt(i, o.matrix);
    }
    ref.current!.instanceMatrix.needsUpdate = true;
  }, [t, cx, cz]);
  return (
    <>
      <instancedMesh ref={ref} args={[undefined, undefined, n]}>
        <boxGeometry args={[0.006, 0.11, 0.006]} />
        <meshBasicMaterial color="#CFE4F2" transparent opacity={0.55} depthWrite={false} />
      </instancedMesh>
      {new Array(16).fill(0).map((_, i) => (
        <mesh key={i} position={[cx + (random(`nu${i}`) - 0.5) * 1.8, 1.42 + random(`nv${i}`) * 0.1, cz + (random(`nw${i}`) - 0.5) * 1.6]} scale={[0.32 + random(`ne${i}`) * 0.25, 0.14, 0.3 + random(`nf${i}`) * 0.2]}>
          <sphereGeometry args={[1, 14, 10]} />
          <meshStandardMaterial color="#6F7A86" roughness={0.9} />
        </mesh>
      ))}
    </>
  );
};
export const MundoBrasil: React.FC<{ t: number; estado: string }> = ({ t, estado }) => {
  const geo = uma("geoBrasil", geoBrasil);
  const tex = uma(`mapa${estado}`, () => mapaTextura(estado));
  return (
    <>
      <Fundo cor="#0B1520" />
      <SolPadrao forca={2.5} ceu={0.95} pos={[-5, 11, 6]} area={8} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#123047" roughness={0.42} metalness={0.1} />
      </mesh>
      <mesh geometry={geo} castShadow receiveShadow>
        <meshStandardMaterial map={tex} roughness={0.9} />
      </mesh>
      {estado === "chuva" && <NuvemChuva t={t} />}
      {estado === "amazonia" && (
        <mesh position={[mapaX(-61.5), 0.2, mapaZ(2.5)]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.72 + 0.04 * Math.sin(t * 4), 0.76 + 0.04 * Math.sin(t * 4), 48]} />
          <meshBasicMaterial color="#FFE3BF" />
        </mesh>
      )}
    </>
  );
};

// ---------- a casa em corte ----------
const LX = 3;
const Seta: React.FC<{ y: number; x: number; dir: 1 | -1; l: number; cor?: string; op?: number }> = ({ y, x, dir, l, cor = "#E0301E", op = 1 }) => {
  if (l < 0.04 || op <= 0.01) return null;
  const r = dir > 0 ? -Math.PI / 2 : Math.PI / 2;
  return (
    <group position={[x, y, 0.72]}>
      <mesh position={[(-dir * l) / 2, 0, 0]} rotation={[0, 0, r]}>
        <cylinderGeometry args={[0.022, 0.022, l, 10]} />
        <meshBasicMaterial color={cor} transparent opacity={op} />
      </mesh>
      <mesh position={[-dir * 0.002, 0, 0]} rotation={[0, 0, r]}>
        <coneGeometry args={[0.07, 0.14, 14]} />
        <meshBasicMaterial color={cor} transparent opacity={op} />
      </mesh>
    </group>
  );
};
const Racha: React.FC<{ k: number }> = ({ k }) => {
  if (k <= 0) return null;
  const pts: V3[] = [[0, 0.3, 0], [0.05, 0.62, 0], [-0.03, 0.9, 0], [0.06, 1.25, 0], [-0.02, 1.6, 0], [0.04, 1.9, 0]];
  return (
    <group position={[-LX + 0.01, 0, 0.77]}>
      {pts.slice(0, Math.ceil(pts.length * k) - 1).map((p, i) => {
        const q = pts[i + 1];
        const dx = q[0] - p[0];
        const dy = q[1] - p[1];
        return (
          <mesh key={i} position={[(p[0] + q[0]) / 2, (p[1] + q[1]) / 2, 0]} rotation={[0, 0, -Math.atan2(dx, dy)]}>
            <boxGeometry args={[0.03, Math.hypot(dx, dy) + 0.02, 0.01]} />
            <meshBasicMaterial color="#1C120C" />
          </mesh>
        );
      })}
    </group>
  );
};
const Gente: React.FC<{ p: V3; rot?: V3; camisa: string; k?: number }> = ({ p, rot, camisa, k = 1 }) => (
  <group position={p} rotation={rot} scale={k}>
    <mesh position={[0, 0.72, 0]}>
      <capsuleGeometry args={[0.17, 0.42, 6, 16]} />
      <meshStandardMaterial color={camisa} roughness={0.8} />
    </mesh>
    <mesh position={[0, 1.26, 0]}>
      <sphereGeometry args={[0.13, 18, 14]} />
      <meshStandardMaterial color="#D9A583" roughness={0.6} />
    </mesh>
  </group>
);
export const MundoCorte: React.FC<{ t: number; estado: string }> = ({ t, estado }) => {
  // nível da água fora e dentro, em metros
  const volta = entre(t, 46.3, 46.75);
  const sobe1 = entre(t, 38.1, 39.6);
  const sobe2 = entre(t, 43, 44.3);
  const fora = 0.1 + 0.9 * sobe1 + 1 * sobe2 * (1 - volta) + 0.3 * volta;
  const dentro = 1.3 * entre(t, 47.2, 49.2);
  const racha = t > 44.6 && t < 46.3 ? entre(t, 44.6, 45.3) : t >= 46.3 ? 1 - entre(t, 46.3, 46.55) : 0;
  const pancada = (b: number) => (t > b && t < b + 0.45 ? Math.exp(-(t - b) * 7) * 0.06 : 0);
  const tremor = t > 44.6 && t < 46.3 ? 0.014 * Math.sin(t * 60) : estado === "correnteza" ? (0.012 + pancada(55.08) + pancada(55.86)) * Math.sin(t * 58) : 0;
  const correnteza = estado === "correnteza";
  const telhado = uma("telhadoCorte", () => {
    const s = new THREE.Shape();
    s.moveTo(-LX - 0.45, 5.76);
    s.lineTo(LX + 0.45, 5.76);
    s.lineTo(0, 7.5);
    s.closePath();
    return new THREE.ExtrudeGeometry(s, { depth: 2.7, bevelEnabled: false });
  });
  const aberto = t > 46.5;
  const vedado = t < 46.5;
  // setas: quanto mais fundo, mais força
  const ys = [0.2, 0.55, 0.9, 1.25, 1.6, 1.9];
  const opFora = estado === "anula" ? 1 - entre(t, 51, 51.9) : estado === "familia" || correnteza ? 0 : t < 38.2 ? 0 : 1;
  const parede = "#E7DFCE";
  return (
    <>
      <Fundo cor="#3E4A56" />
      <Ceu />
      {/* vizinhos ao fundo, na chuva */}
      {[-13, -8, 8, 13, 18, -18].map((x, i) => (
        <group key={x} position={[x, 0, -9 - (i % 3) * 3]}>
          <Peca p={[0, 1.8 + (i % 2) * 0.5, 0]} s={[4.4, 3.6 + i % 2, 3]} cor={["#7C8A88", "#87857A", "#6F7C7E"][i % 3]} raio={0.01} />
          <mesh position={[0, 4 + (i % 2), 0]} rotation={[0, Math.PI / 4, 0]} scale={[1.05, 0.28, 0.75]}>
            <coneGeometry args={[3.4, 3.5, 4]} />
            <meshStandardMaterial color="#4B3B30" roughness={0.6} />
          </mesh>
        </group>
      ))}
      <SolPadrao forca={1.9} ceu={1.05} cor="#D7E2EE" pos={[-3, 14, 12]} area={11} />
      <pointLight position={[0.3, 4.9, -0.2]} intensity={1.7} distance={7} color="#FFC98A" />
      <group position={[tremor, 0, 0]}>
        {/* chão da rua e piso */}
        <Peca p={[0, -0.1, -0.5]} s={[40, 0.2, 4]} cor="#3A3128" raio={0.01} />
        <Peca p={[0, 0.12, -0.5]} s={[LX * 2, 0.24, 2.6]} cor="#8F8B83" raio={0.01} />
        {/* fundo dos dois andares */}
        <Peca p={[0, 1.58, -1.75]} s={[LX * 2, 2.72, 0.1]} cor="#BFC9BC" raio={0.01} />
        <Peca p={[0, 4.42, -1.75]} s={[LX * 2, 2.72, 0.1]} cor="#E6D9BE" raio={0.01} />
        {/* laje */}
        <Peca p={[0, 2.97, -0.5]} s={[LX * 2, 0.22, 2.6]} cor={parede} raio={0.01} />
        {/* forro e telhado em corte */}
        <Peca p={[0, 5.85, -0.5]} s={[LX * 2, 0.14, 2.6]} cor={parede} raio={0.01} />
        <mesh geometry={telhado} position={[0, 0, -1.85]} castShadow>
          <meshStandardMaterial color="#A5522D" roughness={0.75} />
        </mesh>
        {/* paredes laterais em corte */}
        <Peca p={[-LX + 0.11, 3, -0.5]} s={[0.22, 5.86, 2.6]} cor={parede} raio={0.01} />
        <Peca p={[LX - 0.11, 3, -0.5]} s={[0.22, 5.86, 2.6]} cor={parede} raio={0.01} />
        {/* vãos na base: fechados com tábua, depois abertos */}
        {[-0.95, 0.75].map((z, i) => (
          <group key={i}>
            <mesh position={[-LX + 0.11, 0.6, 0.76]}>
              <boxGeometry args={[0.24, 0.42, 0.012]} />
              <meshBasicMaterial color={aberto ? "#2A2118" : "#E7DFCE"} />
            </mesh>
            {vedado && estado === "vedar" && z > 0 && (
              <>
                <Peca p={[-LX - 0.04, 0.6, 0.72]} s={[0.05, 0.6, 0.12]} rot={[0, 0, 0.45]} cor="#8A6A44" />
                <Peca p={[-LX - 0.04, 0.6, 0.72]} s={[0.05, 0.6, 0.12]} rot={[0, 0, -0.45]} cor="#8A6A44" />
              </>
            )}
          </group>
        ))}
        {/* térreo que pode molhar: piso frio, escada, sem nada de valor embaixo */}
        {new Array(8).fill(0).map((_, i) => (
          <Peca key={i} p={[1.55 + i * 0.16, 0.34 + i * 0.32, -1.1]} s={[0.26, 0.1, 1]} cor="#9B8B74" />
        ))}
        {/* azulejo da cozinha até meia altura, cheio de rejunte */}
        <mesh position={[0, 1.15, -1.695]}>
          <planeGeometry args={[LX * 2 - 0.44, 1.8]} />
          <meshStandardMaterial map={uma("azulejo", () => { const a = tela(512, 256, (g) => { g.fillStyle = "#EEF0E9"; g.fillRect(0, 0, 512, 256); for (let y = 0; y < 8; y++) for (let x = 0; x < 16; x++) { const v = random(`az${x}|${y}`); g.fillStyle = `rgb(${196 + v * 22},${214 + v * 16},${206 + v * 16})`; g.fillRect(x * 32 + 1.5, y * 32 + 1.5, 29, 29); } }); a.wrapS = a.wrapT = THREE.RepeatWrapping; a.repeat.set(2, 2); return a; })} roughness={0.32} />
        </mesh>
        {/* pia, armário, fogão, geladeira, mesa e cadeira */}
        <Peca p={[-1.6, 0.68, -1.4]} s={[1.5, 0.84, 0.56]} cor="#8D7458" />
        <Peca p={[-1.6, 1.12, -1.4]} s={[1.56, 0.05, 0.6]} cor="#CFCDC6" rugoso={0.3} />
        <Peca p={[-1.75, 1.13, -1.4]} s={[0.54, 0.03, 0.36]} cor="#9EA2A3" metal={0.7} rugoso={0.3} />
        <Cil p={[-1.75, 1.32, -1.6]} r={0.015} l={0.32} cor="#B6BABC" metal={0.8} rugoso={0.25} />
        <Peca p={[-1.6, 2.05, -1.55]} s={[1.3, 0.5, 0.26]} cor="#94785B" />
        {[-2, -1.6, -1.2].map((x) => (
          <Cil key={x} p={[x, 0.68, -1.11]} r={0.012} l={0.06} rot={[Math.PI / 2, 0, 0]} cor="#C9C1AD" metal={0.6} />
        ))}
        <Peca p={[-0.42, 0.72, -1.38]} s={[0.56, 0.96, 0.58]} cor="#D9D6CC" rugoso={0.35} />
        <Peca p={[-0.42, 1.21, -1.38]} s={[0.58, 0.03, 0.6]} cor="#2C2C2E" metal={0.4} rugoso={0.3} />
        <Peca p={[0.5, 1.15, -1.32]} s={[0.66, 1.8, 0.62]} cor="#ECEAE2" rugoso={0.32} />
        <Cil p={[0.74, 1.3, -1]} r={0.012} l={0.42} cor="#9EA2A3" metal={0.7} />
        {/* relógio, tomadas lá no alto e cano */}
        <mesh position={[-0.7, 2.25, -1.69]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.02, 24]} />
          <meshStandardMaterial color="#F1EEE4" />
        </mesh>
        <Peca p={[1.2, 2.3, -1.68]} s={[0.1, 0.14, 0.02]} cor="#F1EEE4" />
        <Peca p={[1.4, 2.3, -1.68]} s={[0.1, 0.14, 0.02]} cor="#F1EEE4" />
        {/* mesa e cadeira: a cadeira boia quando a água entra */}
        <Peca p={[0.1, 0.92, 0.1]} s={[0.9, 0.05, 0.62]} cor="#A07C58" />
        {[[-0.28, -0.14], [0.48, -0.14], [-0.28, 0.34], [0.48, 0.34]].map(([x, z]) => (
          <Peca key={`${x}${z}`} p={[x, 0.58, z]} s={[0.05, 0.64, 0.05]} cor="#7D5F42" />
        ))}
        <group position={[-0.95, dentro > 0.28 ? Math.min(1.25, dentro + 0.02) - 0.3 + 0.02 * Math.sin(t * 3) : 0.27, 0.25]} rotation={[dentro > 0.28 ? 0.14 * Math.sin(t * 1.9) : 0, 0.5 + dentro * 0.8, dentro > 0.28 ? 0.16 * Math.sin(t * 2.3) : 0]}>
          <Peca p={[0, 0.3, 0]} s={[0.4, 0.04, 0.4]} cor="#C3C8C4" />
          <Peca p={[0, 0.54, -0.18]} s={[0.4, 0.45, 0.03]} cor="#C3C8C4" />
          {[[-0.16, -0.16], [0.16, -0.16], [-0.16, 0.16], [0.16, 0.16]].map(([x, z]) => (
            <Peca key={`c${x}${z}`} p={[x, 0.13, z]} s={[0.03, 0.34, 0.03]} cor="#A2A7A4" />
          ))}
        </group>
        {/* andar de cima: a família, seca */}
        <Peca p={[-0.9, 3.34, -1.0]} s={[2.3, 0.3, 1.25]} cor="#7D5A3C" />
        <Peca p={[-0.9, 3.54, -1.0]} s={[2.2, 0.16, 1.15]} cor="#C7D4DC" raio={0.05} />
        <Peca p={[-1.82, 3.66, -1.0]} s={[0.34, 0.14, 0.9]} cor="#F1EDE3" raio={0.05} />
        <Peca p={[-2.15, 3.8, -1.0]} s={[0.1, 0.9, 1.3]} cor="#5B4029" />
        {/* deitados: o corpo sai para o lado da cabeceira */}
        <Gente p={[-0.24, 3.72, -1.26]} rot={[0, 0, Math.PI / 2]} camisa="#3F6C8B" k={1.0} />
        <Gente p={[-0.24, 3.72, -0.74]} rot={[0, 0, Math.PI / 2]} camisa="#9D4F3A" k={1.0} />
        <Gente p={[-0.58, 3.7, -1.0]} rot={[0, 0, Math.PI / 2]} camisa="#D2A741" k={0.7} />
        {/* coberta até o peito */}
        <Peca p={[-0.44, 3.72, -1.0]} s={[1.3, 0.2, 1.17]} cor="#88A7BB" raio={0.06} />
        <Peca p={[1.8, 3.42, -1.4]} s={[0.46, 0.5, 0.42]} cor="#6B4D34" />
        {/* guarda-roupa, tapete e cortina */}
        <Peca p={[0.9, 4.0, -1.45]} s={[0.9, 1.84, 0.46]} cor="#7E6348" />
        <Peca p={[0.9, 4.0, -1.215]} s={[0.02, 1.8, 0.012]} cor="#4F3B28" />
        <Peca p={[-0.3, 3.1, -0.3]} s={[1.5, 0.018, 1]} cor="#9B4C37" />
        <Peca p={[-1.62, 4.62, -1.65]} s={[0.22, 1.1, 0.03]} cor="#D8CBB0" />
        <Peca p={[-0.38, 4.62, -1.65]} s={[0.22, 1.1, 0.03]} cor="#D8CBB0" />
        <mesh position={[1.8, 3.92, -1.4]}>
          <sphereGeometry args={[0.13, 16, 12]} />
          <meshStandardMaterial color="#FFD58F" emissive="#FFB765" emissiveIntensity={1.4} />
        </mesh>
        <Peca p={[-1.0, 4.62, -1.67]} s={[1, 0.85, 0.05]} cor="#1E2B38" brilho="#2E4660" forca={0.25} />
        <Peca p={[-1.0, 4.62, -1.64]} s={[0.05, 0.85, 0.02]} cor="#E6E0D3" />
        <Peca p={[-2.15, 4.8, -1.68]} s={[0.42, 0.32, 0.03]} cor="#A68756" />
        <Racha k={racha} />
      </group>
      {/* a água */}
      <AguaViva x0={-14} x1={-LX} h={fora} t={t} agito={correnteza ? 2.4 : t > 43 && t < 44.4 ? 1.9 : 1} />
      <AguaViva x0={LX} x1={14} h={fora} t={t} agito={correnteza ? 2.4 : 1} />
      <AguaViva x0={-LX + 0.22} x1={LX - 0.22} h={dentro} t={t + 1.3} agito={t < 49.3 ? 1.8 : 1} />
      {/* a água invade: jatos pelos vãos, reboco caindo, troncos batendo */}
      <Respingo t={t} de={47.2} ate={49.1} p={[-LX + 0.26, 0.62, 0.3]} n={90} vx={2.3} vy={1.3} sem="ja" escala={0.62} />
      <Respingo t={t} de={38.2} ate={39.5} p={[-LX - 0.06, fora, 0.6]} n={26} vx={-1.2} vy={1.5} sem="fa" />
      <Respingo t={t} de={43} ate={44.3} p={[-LX - 0.06, fora, 0.6]} n={38} vx={-1.5} vy={1.9} sem="fb" />
      <Entulho t={t} de={44.7} p={[-LX - 0.05, 1.4, 0.76]} />
      {correnteza && (
        <>
          <TroncoBatendo t={t} de={54.5} bate={55.08} />
          <TroncoBatendo t={t} de={55.1} bate={55.86} z={1.4} y={1.05} />
          <Respingo t={t} de={55.08} ate={55.28} p={[-LX - 0.12, 0.95, 0.9]} n={40} vx={-2.4} vy={2.2} sem="tb" escala={1.3} />
          <Respingo t={t} de={55.86} ate={56.05} p={[-LX - 0.12, 1.1, 1.1]} n={40} vx={-2.4} vy={2.2} sem="tc" escala={1.3} />
        </>
      )}
      {/* chuva na frente do corte */}
      {new Array(90).fill(0).map((_, i) => {
        const y = ((random(`ch${i}`) * 9 - t * 10) % 9 + 9) % 9;
        return (
          <mesh key={i} position={[-12 + random(`ci${i}`) * 8.7, y + 0.2, 0.4 + random(`cj${i}`) * 1.5]}>
            <boxGeometry args={[0.012, 0.42, 0.012]} />
            <meshBasicMaterial color="#DDE7EE" transparent opacity={0.24} depthWrite={false} />
          </mesh>
        );
      })}
      {/* empurrão de fora e de dentro */}
      {ys.map((y) => (
        <Seta key={`f${y}`} y={y} x={-LX - 0.02} dir={1} l={Math.max(0, fora - y) * 0.9} op={opFora} />
      ))}
      {ys.map((y) => (
        <Seta key={`d${y}`} y={y} x={-LX + 0.24} dir={-1} l={Math.max(0, dentro - y) * 0.9} cor="#F2F0E8" op={opFora} />
      ))}
      {correnteza &&
        new Array(34).fill(0).map((_, i) => {
          const x = ((random(`fl${i}`) * 26 + t * 11) % 26) - 19;
          const y = 0.14 + random(`fm${i}`) * 0.85;
          return (
            <mesh key={i} position={[x, y, 0.8 + random(`fn${i}`) * 0.4]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.012, 0.012, 0.9 + random(`fo${i}`), 6]} />
              <meshBasicMaterial color="#E9DEC6" transparent opacity={0.7} />
            </mesh>
          );
        })}
      {correnteza && <Peca p={[((t - 54.4) * 3.6) % 16 - 11, 1, 1]} s={[2, 0.08, 0.3]} rot={[0.2, 0.3, Math.sin(t * 4) * 0.1]} cor="#6F5236" />}
    </>
  );
};

// ---------- terreno vazio / obra ----------
const Arvore: React.FC<{ p: V3; k?: number }> = ({ p, k = 1 }) => (
  <group position={p} scale={k}>
    <Cil p={[0, 1.4, 0]} r={0.12} l={2.8} cor="#4A3A2A" rugoso={1} />
    {new Array(32).fill(0).map((_, i) => {
      const a = random(`aa${i}`) * Math.PI * 2;
      const b = Math.acos(2 * random(`ab${i}`) - 1);
      const r = 0.6 + random(`ar${i}`) * 0.7;
      return (
        <mesh key={i} position={[Math.sin(b) * Math.cos(a) * r, 3.3 + Math.cos(b) * r * 0.8, Math.sin(b) * Math.sin(a) * r]} scale={0.26 + random(`ae${i}`) * 0.26} castShadow>
          <sphereGeometry args={[1, 10, 8]} />
          <meshStandardMaterial color={["#3D6238", "#2F5230", "#527544"][i % 3]} roughness={0.8} />
        </mesh>
      );
    })}
  </group>
);
const placaRisco = () => placaTexto("ÁREA DE RISCO", "não construir", "#E7B92E", "#201A0E");
export const MundoTerreno: React.FC<{ t: number; obra: boolean }> = ({ t, obra }) => {
  return (
    <>
      <Ceu />
      <SolPadrao forca={2.7} ceu={1} pos={[-7, 12, 8]} area={16} />
      <RioVivo t={t} />
      <Arvore p={[-3.2, 0, -14]} k={1.3} />
      <Arvore p={[8.5, 0, -18]} k={1.5} />
      <Arvore p={[3.6, 0, -26]} k={1.2} />
      <Arvore p={[-26, 0, -22]} k={2} />
      <Arvore p={[-29, 0, -8]} k={2.2} />
      <Arvore p={[-24, 0, -42]} k={2.5} />
      <Arvore p={[-33, 0, -30]} k={2.4} />
      {obra ? (
        <>
          {/* só a fundação: janeiro chega antes da parede */}
          <group position={[2.4, 0, 0]}>
          <Peca p={[-0.6, 0.12, -2]} s={[6, 0.24, 4]} cor="#A6A29A" raio={0.01} />
          <Peca p={[-3.5, 0.5, -3.9]} s={[0.2, 0.55, 0.2]} cor="#8F8A82" />
          {[-3.3, -1.9, -0.5, 0.9, 2.3].map((x) => (
            <group key={x}>
              <Cil p={[x, 0.85, -3.8]} r={0.012} l={1.3} cor="#6D4A32" metal={0.5} />
              <Cil p={[x + 0.1, 0.85, -3.8]} r={0.012} l={1.3} cor="#6D4A32" metal={0.5} />
            </group>
          ))}
          {new Array(18).fill(0).map((_, i) => (
            <Peca key={i} p={[-2.6 + (i % 6) * 0.44, 0.33 + Math.floor(i / 6) * 0.2, -0.7]} s={[0.4, 0.17, 0.2]} cor="#A9583A" />
          ))}
          </group>
        </>
      ) : (
        <>
          <group position={[-1.9, 0, 1.2]} rotation={[0, 0.3, 0]}>
            <Cil p={[0, 0.95, 0]} r={0.045} l={1.9} cor="#6B4D34" rugoso={1} />
            <Peca p={[0, 1.72, 0.05]} s={[1.5, 0.75, 0.04]} cor="#E7B92E" />
            <mesh position={[0, 1.72, 0.075]}>
              <planeGeometry args={[1.46, 0.71]} />
              <meshBasicMaterial map={uma("risco", placaRisco)} toneMapped={false} />
            </mesh>
          </group>
          {/* marca da cheia nas estacas */}
          {new Array(5).fill(0).map((_, i) => (
            <Cil key={i} p={[-1.4 + i * 1.4, 0.45, -1.8]} r={0.035} l={0.9} cor="#6E5A40" rugoso={1} />
          ))}
        </>
      )}
    </>
  );
};

// ---------- mesa da cisterna ----------
export const MundoMesa: React.FC<{ t: number }> = ({ t }) => {
  // de 79,0 em diante, o calendário vira até oito meses
  const mes = Math.min(8, Math.floor(interpolate(t, [79.6, 81.2], [0, 8], cl)));
  const MESES = ["DEZ", "JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO"];
  const tex = uma(`mes${mes}`, () => placaTexto(MESES[mes], `mês ${mes} de 8`, "#F1ECDF", "#27303A"));
  return (
    <>
      <Fundo cor="#7E6B52" />
      <SolPadrao forca={2.4} ceu={1.05} cor="#FFD9A8" pos={[4, 9, 7]} area={5} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial map={uma("chaoMesa", () => tela(8, 8, (g) => { g.fillStyle = "#B89878"; g.fillRect(0, 0, 8, 8); }))} roughness={1} />
      </mesh>
      <Peca p={[0, 3, -3]} s={[14, 6, 0.2]} cor="#D0B48A" raio={0.01} />
      {/* janela com luz */}
      <Peca p={[-2.2, 2.4, -2.88]} s={[1.5, 1.3, 0.04]} cor="#F6E5BC" brilho="#FFD99A" forca={0.65} />
      <Peca p={[-2.2, 2.4, -2.86]} s={[0.05, 1.3, 0.03]} cor="#7A5C3E" />
      <Peca p={[-2.2, 2.4, -2.86]} s={[1.5, 0.05, 0.03]} cor="#7A5C3E" />
      {/* mesa */}
      <Peca p={[0, 0.88, 0]} s={[1.72, 0.09, 1.3]} cor="#8A6546" rugoso={0.6} />
      {[[-0.75, -0.55], [0.75, -0.55], [-0.75, 0.55], [0.75, 0.55]].map(([x, z]) => (
        <Peca key={`${x}${z}`} p={[x, 0.43, z]} s={[0.09, 0.86, 0.09]} cor="#6E4E35" />
      ))}
      {/* cinco lugares */}
      {[[-0.56, 0.34], [0, 0.4], [0.56, 0.34], [-0.3, -0.3], [0.3, -0.3]].map(([x, z], i) => (
        <group key={i} position={[x, 0.93, z]}>
          <mesh>
            <cylinderGeometry args={[0.15, 0.11, 0.03, 26]} />
            <meshStandardMaterial color="#EDE7D8" roughness={0.35} />
          </mesh>
          <mesh position={[0.1, 0.07, -0.16]}>
            <cylinderGeometry args={[0.036, 0.032, 0.12, 16]} />
            <meshPhysicalMaterial color="#AFD3E2" roughness={0.1} transparent opacity={0.7} />
          </mesh>
        </group>
      ))}
      {/* filtro de barro: água tratada */}
      {/* banquinho, corpo largo em dois andares, tampa e torneira */}
      <Peca p={[-0.62, 0.39, -1.05]} s={[0.62, 0.05, 0.62]} cor="#6E4E35" />
      {[[-0.86, -1.29], [-0.38, -1.29], [-0.86, -0.81], [-0.38, -0.81]].map(([x, z]) => (
        <Peca key={`${x}${z}`} p={[x, 0.19, z]} s={[0.05, 0.38, 0.05]} cor="#5D412C" />
      ))}
      <mesh position={[-0.62, 0.66, -1.05]} castShadow>
        <cylinderGeometry args={[0.27, 0.23, 0.5, 30]} />
        <meshStandardMaterial color="#9C5A36" roughness={0.9} />
      </mesh>
      <mesh position={[-0.62, 1.09, -1.05]} castShadow>
        <cylinderGeometry args={[0.29, 0.27, 0.36, 30]} />
        <meshStandardMaterial color="#A5613B" roughness={0.9} />
      </mesh>
      <mesh position={[-0.62, 1.3, -1.05]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.05, 30]} />
        <meshStandardMaterial color="#8A4E2E" roughness={0.9} />
      </mesh>
      <Cil p={[-0.42, 0.6, -0.86]} r={0.016} l={0.1} rot={[Math.PI / 2, 0, 0]} cor="#C7C2B5" metal={0.5} />
      {/* folhinha na parede */}
      <group position={[0.42, 1.28, -2.87]}>
        <Peca p={[0, 0, 0]} s={[1.05, 0.72, 0.03]} cor="#F1ECDF" />
        <mesh position={[0, 0, 0.02]}>
          <planeGeometry args={[1, 0.68]} />
          <meshBasicMaterial map={tex} toneMapped={false} />
        </mesh>
      </group>
    </>
  );
};

// ---------- celular ----------
const TELA_L = 512;
const telaCelular = (estado: number) =>
  tela(TELA_L, 1024, (g) => {
    const fundoTela = g.createLinearGradient(0, 0, 0, 1024);
    fundoTela.addColorStop(0, "#1C3A55");
    fundoTela.addColorStop(1, "#0E1C2B");
    g.fillStyle = fundoTela;
    g.fillRect(0, 0, TELA_L, 1024);
    g.fillStyle = "#1F262E";
    g.fillRect(0, 0, TELA_L, 130);
    g.fillStyle = "#F2F2F0";
    g.textAlign = "center";
    g.font = "600 46px Arial, sans-serif";
    g.fillText("40199", TELA_L / 2, 88);
    const bolha = (y: number, texto: string[], minha: boolean) => {
      const a = 40 + texto.length * 42;
      const l = 370;
      const x = minha ? TELA_L - l - 26 : 26;
      g.fillStyle = minha ? "#2F8CDE" : "#2C343D";
      g.beginPath();
      g.roundRect(x, y, l, a, 26);
      g.fill();
      g.fillStyle = "#fff";
      g.textAlign = "left";
      g.font = "400 34px Arial, sans-serif";
      texto.forEach((s, i) => g.fillText(s, x + 24, y + 48 + i * 42));
    };
    if (estado === 0) {
      g.fillStyle = "#EAF1F6";
      g.textAlign = "center";
      g.font = "600 40px Arial, sans-serif";
      g.fillText("Nova mensagem", TELA_L / 2, 440);
      g.font = "400 30px Arial, sans-serif";
      g.fillStyle = "#B7C8D5";
      g.fillText("Para: 40199", TELA_L / 2, 492);
    }
    if (estado >= 1) bolha(190, ["seu CEP", "(só os números)"], true);
    if (estado >= 2) bolha(370, ["Cadastro realizado", "com sucesso"], false);
    if (estado >= 3) bolha(550, ["Alerta da", "Defesa Civil", "(exemplo)"], false);
    g.fillStyle = "#1F262E";
    g.fillRect(0, 900, TELA_L, 124);
    g.fillStyle = "#39424C";
    g.beginPath();
    g.roundRect(30, 925, 452, 70, 34);
    g.fill();
  });
export const MundoCelular: React.FC<{ t: number; ElePadrao: React.ReactNode }> = ({ t, ElePadrao }) => {
  const entra = t < 0 ? entre(t, -1.45, -1.05) : entre(t, 91.95, 92.7);
  const estado = t < 0 ? 3 : t < 94.6 ? 0 : t < 97.9 ? 1 : t < 98.5 ? 2 : 3;
  const tex = uma(`cel${estado}`, () => telaCelular(estado));
  return (
    <>
      <Fundo cor="#8C7B66" />
      <mesh position={[0, 0, -9]}>
        <planeGeometry args={[40, 30]} />
        <meshBasicMaterial map={uma("tom", () => tela(4, 256, (g) => { const d = g.createLinearGradient(0, 0, 0, 256); d.addColorStop(0, "#9FB3C4"); d.addColorStop(1, "#D9B98E"); g.fillStyle = d; g.fillRect(0, 0, 4, 256); }))} />
      </mesh>
      <SolPadrao forca={2.6} ceu={1.1} pos={[-3, 6, 6]} area={5} />
      <directionalLight position={[3, 2, 2]} intensity={0.9} color="#BCD4EC" />
      {ElePadrao}
      <group position={[-0.2, -2.6 + entra * 2.72, 0.05]} rotation={[0.05 * Math.sin(t), 0.1 + 0.07 * entra, 0.02]} scale={0.8}>
        <RoundedBox args={[0.58, 1.2, 0.05]} radius={0.024} smoothness={4} castShadow>
          <meshStandardMaterial color="#23272C" roughness={0.3} metalness={0.6} />
        </RoundedBox>
        <mesh position={[0, 0, 0.0265]}>
          <planeGeometry args={[0.54, 1.15]} />
          <meshBasicMaterial map={tex} toneMapped={false} />
        </mesh>
      </group>
    </>
  );
};

// ---------- bairro e rota de fuga ----------
export const MundoBairro: React.FC<{ t: number }> = ({ t }) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const casas = useMemo(() => {
    const l: { x: number; z: number; s: number; h: number; c: string }[] = [];
    for (let i = -6; i <= 6; i++)
      for (let j = -5; j <= 5; j++) {
        if (i % 3 === 0 || j % 3 === 0) continue;
        const v = random(`bq${i}${j}`);
        l.push({ x: i * 0.68, z: j * 0.68, s: 0.42 + v * 0.14, h: 0.22 + random(`bh${i}${j}`) * 0.2, c: ["#D8C4A0", "#B9C4B4", "#CCAA8E", "#A9B7C4", "#E2D7C2"][Math.floor(v * 5)] });
      }
    return l;
  }, []);
  useLayoutEffect(() => {
    const m = ref.current!;
    const o = new THREE.Object3D();
    const c = new THREE.Color();
    casas.forEach((k, i) => {
      o.position.set(k.x, k.h / 2, k.z);
      o.scale.set(k.s, k.h, k.s);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      m.setColorAt(i, c.set(k.c));
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [casas]);
  const caminho = useMemo(() => new THREE.CatmullRomCurve3([[-3, 0.03, 3.6], [-2, 0.03, 2], [-2, 0.03, 0], [0, 0.03, 0], [0, 0.03, -2], [2, 0.03, -2], [2.05, 0.3, -3.1]].map(([x, y, z]) => new THREE.Vector3(x, y, z)), false, "catmullrom", 0.02), []);
  const geo = useMemo(() => new THREE.TubeGeometry(caminho, 220, 0.075, 8), [caminho]);
  const k = entre(t, 100.3, 101.9);
  geo.setDrawRange(0, Math.floor(geo.index!.count * k));
  const ponta = caminho.getPoint(Math.max(0.001, k));
  return (
    <>
      <Fundo cor="#40525C" />
      <SolPadrao forca={2.9} ceu={0.95} pos={[-6, 12, 5]} area={9} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#6A6964" roughness={1} />
      </mesh>
      {/* a parte baixa, que alaga, e o morro seguro */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.25, 6.2]} renderOrder={2}>
        <planeGeometry args={[40, 7]} />
        <meshStandardMaterial color="#6E5636" roughness={0.2} transparent opacity={0.86} />
      </mesh>
      <mesh position={[2.3, -1.15, -4.6]} scale={[4.4, 1.6, 2]}>
        <sphereGeometry args={[1, 28, 18]} />
        <meshStandardMaterial color="#5F7D4E" roughness={1} />
      </mesh>
      <instancedMesh ref={ref} args={[undefined, undefined, casas.length]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.85} />
      </instancedMesh>
      <mesh geometry={geo}>
        <meshBasicMaterial color="#4CE28A" toneMapped={false} />
      </mesh>
      <mesh position={[ponta.x, ponta.y + 0.2, ponta.z]}>
        <sphereGeometry args={[0.14, 20, 14]} />
        <meshBasicMaterial color="#D9FFE5" toneMapped={false} />
      </mesh>
    </>
  );
};
