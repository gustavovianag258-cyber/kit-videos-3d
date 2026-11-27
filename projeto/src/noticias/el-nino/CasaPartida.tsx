import { RoundedBox } from "@react-three/drei";
import { useLayoutEffect, useMemo, useRef } from "react";
import { random } from "remotion";
import * as THREE from "three";

// A casa partida: um sobrado cortado em x = 0. Do lado x < 0, enchente e chuva; do lado x > 0, seca e sol.
// Mesmo jeito liso do narrador, com o realismo vindo de material, luz e muito detalhe. Unidade = metro.
type V3 = [number, number, number];
export const NIVEL_AGUA = 1.0;
const META = 2.8; // meia largura da casa
const ALTURA = 6;
// textura pesada só é gerada uma vez, mesmo trocando de cena
const guardadas: Record<string, unknown> = {};
export const uma = <T,>(k: string, f: () => T): T => (guardadas[k] ??= f()) as T;

// ---------- texturas em código ----------
const tela = (l: number, a: number, desenha: (g: CanvasRenderingContext2D) => void, rep?: [number, number]) => {
  const c = document.createElement("canvas");
  c.width = l;
  c.height = a;
  desenha(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  if (rep) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(...rep);
  }
  return t;
};
const mancha = (g: CanvasRenderingContext2D, x: number, y: number, r: number, cor: string) => {
  const d = g.createRadialGradient(x, y, 0, x, y, r);
  d.addColorStop(0, cor);
  d.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = d;
  g.fillRect(x - r, y - r, r * 2, r * 2);
};
const rachadura = (g: CanvasRenderingContext2D, x: number, y: number, passos: number, sem: string, cor = "rgba(40,28,20,0.75)", grossura = 2.2) => {
  g.strokeStyle = cor;
  g.lineWidth = grossura;
  g.lineCap = "round";
  g.beginPath();
  g.moveTo(x, y);
  for (let i = 0; i < passos; i++) {
    x += (random(`${sem}x${i}`) - 0.5) * 46;
    y += 12 + random(`${sem}y${i}`) * 26;
    g.lineTo(x, y);
  }
  g.stroke();
};
const tijolos = (g: CanvasRenderingContext2D, x0: number, y0: number, l: number, a: number, sem: string) => {
  g.save();
  // reboco que caiu: borda irregular, nada de forma redonda
  g.beginPath();
  const voltas = 26;
  for (let i = 0; i < voltas; i++) {
    const ang = (i / voltas) * Math.PI * 2;
    const k = 0.5 + random(`${sem}b${i}`) * 0.5;
    const x = x0 + l / 2 + (Math.cos(ang) * l * k) / 2;
    const y = y0 + a / 2 + (Math.sin(ang) * a * k) / 2;
    if (i) g.lineTo(x, y);
    else g.moveTo(x, y);
  }
  g.closePath();
  g.save();
  g.shadowColor = "rgba(0,0,0,0.5)";
  g.shadowBlur = 8;
  g.fillStyle = "#6E685E";
  g.fill();
  g.restore();
  g.clip();
  for (let y = 0; y < a / 18 + 1; y++)
    for (let x = -1; x < l / 44 + 1; x++) {
      const v = random(`${sem}${x}|${y}`);
      g.fillStyle = `rgb(${112 + v * 30},${66 + v * 18},${50 + v * 12})`;
      g.fillRect(x0 + x * 44 + (y % 2) * 22 + 2, y0 + y * 18 + 2, 40, 14);
    }
  g.restore();
};
// fachada: 1024 px = largura da metade; 6 m de altura em 2194 px
const fachada = (lado: -1 | 1) =>
  tela(1024, 2194, (g) => {
    const base = lado < 0 ? "#7F918A" : "#D6BA8C";
    g.fillStyle = base;
    g.fillRect(0, 0, 1024, 2194);
    for (let i = 0; i < 120; i++) mancha(g, random(`fm${lado}${i}`) * 1024, random(`fn${lado}${i}`) * 2194, 60 + random(`fr${lado}${i}`) * 180, lado < 0 ? `rgba(30,44,46,${0.05 + random(`fa${i}`) * 0.1})` : `rgba(255,240,205,${0.05 + random(`fb${i}`) * 0.14})`);
    for (let i = 0; i < 26000; i++) {
      g.fillStyle = random(`fg${lado}${i}`) > 0.5 ? "rgba(255,255,255,0.035)" : "rgba(0,0,0,0.05)";
      g.fillRect(random(`fh${lado}${i}`) * 1024, random(`fi${lado}${i}`) * 2194, 2, 2);
    }
    if (lado < 0) {
      // escorridos da chuva e marca de lama acima do nível da água
      for (let i = 0; i < 46; i++) {
        const x = random(`ex${i}`) * 1024;
        const d = g.createLinearGradient(0, 40, 0, 900);
        d.addColorStop(0, "rgba(18,28,30,0.34)");
        d.addColorStop(1, "rgba(18,28,30,0)");
        g.fillStyle = d;
        g.fillRect(x, 40, 8 + random(`el${i}`) * 26, 400 + random(`eh${i}`) * 500);
      }
      const nivel = 2194 - (NIVEL_AGUA / ALTURA) * 2194;
      const lama = g.createLinearGradient(0, nivel - 300, 0, nivel);
      lama.addColorStop(0, "rgba(70,52,32,0)");
      lama.addColorStop(0.6, "rgba(70,52,32,0.42)");
      lama.addColorStop(0.97, "rgba(58,42,24,0.88)");
      lama.addColorStop(1, "rgba(30,22,14,0.9)");
      g.fillStyle = lama;
      g.fillRect(0, nivel - 300, 1024, 300);
      g.fillStyle = "#33271A";
      g.fillRect(0, nivel, 1024, 2194 - nivel);
      tijolos(g, 730, 1080, 170, 90, "ta");
    } else {
      // reboco queimado de sol, rachado e descascado
      tijolos(g, 130, 1240, 200, 100, "tb");
      tijolos(g, 790, 210, 150, 80, "tc");
      tijolos(g, 640, 1700, 170, 90, "td");
      rachadura(g, 620, 620, 16, "ra");
      rachadura(g, 240, 140, 9, "rb");
      rachadura(g, 900, 1120, 12, "rc");
      rachadura(g, 90, 1600, 10, "rd", "rgba(40,28,20,0.6)", 1.6);
      const poeira = g.createLinearGradient(0, 1760, 0, 2194);
      poeira.addColorStop(0, "rgba(150,108,66,0)");
      poeira.addColorStop(1, "rgba(150,108,66,0.72)");
      g.fillStyle = poeira;
      g.fillRect(0, 1760, 1024, 434);
    }
  });
// Barro seco: placas de verdade (células de Voronoi com a borda ondulada), cada uma com seu tom e a beira
// escurecendo até a rachadura. Repete sem emenda.
const chaoSeco = () =>
  tela(
    1024,
    1024,
    (g) => {
      const T = 1024;
      const N = 13;
      const passo = T / N;
      const sx: number[] = [];
      const sy: number[] = [];
      const tom: number[] = [];
      for (let j = 0; j < N; j++)
        for (let i = 0; i < N; i++) {
          sx.push((i + 0.15 + random(`vx${i}|${j}`) * 0.7) * passo);
          sy.push((j + 0.15 + random(`vy${i}|${j}`) * 0.7) * passo);
          tom.push(random(`vt${i}|${j}`));
        }
      const TAU = Math.PI * 2;
      const img = g.createImageData(T, T);
      for (let y = 0; y < T; y++)
        for (let x = 0; x < T; x++) {
          const u = x / T;
          const v = y / T;
          const wx = x + 13 * Math.sin(TAU * (3 * v + u)) + 6 * Math.sin(TAU * (9 * v + 4 * u));
          const wy = y + 13 * Math.sin(TAU * (3 * u + 2 * v)) + 6 * Math.sin(TAU * (8 * u + 3 * v));
          const ci = Math.floor(wx / passo);
          const cj = Math.floor(wy / passo);
          let d1 = 1e9;
          let d2 = 1e9;
          let dono = 0;
          for (let b = -1; b <= 1; b++)
            for (let a = -1; a <= 1; a++) {
              const ii = ((ci + a) % N + N) % N;
              const jj = ((cj + b) % N + N) % N;
              const k = jj * N + ii;
              const dx = sx[k] + (ci + a - ii) * passo - wx;
              const dy = sy[k] + (cj + b - jj) * passo - wy;
              const d = Math.hypot(dx, dy);
              if (d < d1) {
                d2 = d1;
                d1 = d;
                dono = k;
              } else if (d < d2) d2 = d;
            }
          const borda = d2 - d1;
          const grao = 0.97 + 0.03 * Math.sin(x * 12.9 + y * 78.2) * Math.sin(x * 37.1 - y * 19.7);
          const placa = (0.84 + tom[dono] * 0.2) * grao;
          const beira = Math.min(1, 0.72 + borda / 34);
          const racha = borda < 2.4 + 2.2 * tom[dono] ? 0.2 : 1;
          const k = placa * beira * racha;
          const i = (y * T + x) * 4;
          img.data[i] = Math.min(255, 196 * k);
          img.data[i + 1] = Math.min(255, 160 * k);
          img.data[i + 2] = Math.min(255, 116 * k);
          img.data[i + 3] = 255;
        }
      g.putImageData(img, 0, 0);
    },
    [52, 68],
  );
// reboco da cisterna, com escorridos do pouco de chuva que caiu
const cimento = () =>
  tela(1024, 512, (g) => {
    g.fillStyle = "#C9BFAC";
    g.fillRect(0, 0, 1024, 512);
    for (let i = 0; i < 70; i++) mancha(g, random(`im${i}`) * 1024, random(`in${i}`) * 512, 40 + random(`ir${i}`) * 110, random(`is${i}`) > 0.5 ? "rgba(90,78,60,0.14)" : "rgba(240,232,214,0.16)");
    for (let i = 0; i < 40; i++) {
      const x = random(`iv${i}`) * 1024;
      const d = g.createLinearGradient(0, 0, 0, 260);
      d.addColorStop(0, "rgba(72,60,44,0.32)");
      d.addColorStop(1, "rgba(72,60,44,0)");
      g.fillStyle = d;
      g.fillRect(x, 0, 4 + random(`iw${i}`) * 12, 120 + random(`ih${i}`) * 140);
    }
    const p = g.createLinearGradient(0, 400, 0, 512);
    p.addColorStop(0, "rgba(150,108,66,0)");
    p.addColorStop(1, "rgba(150,108,66,0.65)");
    g.fillStyle = p;
    g.fillRect(0, 400, 1024, 112);
  });
// a seção da água, vista na linha do meio: barrenta, clara em cima e escura embaixo, com sujeira em suspensão
const secaoAgua = () =>
  tela(
    1024,
    256,
    (g) => {
      const d = g.createLinearGradient(0, 0, 0, 256);
      d.addColorStop(0, "#8D7654");
      d.addColorStop(0.28, "#6A553A");
      d.addColorStop(1, "#2C2216");
      g.fillStyle = d;
      g.fillRect(0, 0, 1024, 256);
      for (let i = 0; i < 2400; i++) {
        const v = random(`sa${i}`);
        g.fillStyle = v > 0.5 ? `rgba(226,204,160,${0.1 + v * 0.3})` : `rgba(24,16,6,${0.2 + v * 0.3})`;
        const r = 0.6 + random(`sb${i}`) * 1.8;
        g.fillRect(random(`sc${i}`) * 1024, random(`sd${i}`) * 256, r, r);
      }
      g.fillStyle = "rgba(240,228,204,0.75)";
      g.fillRect(0, 0, 1024, 4);
    },
    [40, 1],
  );
const ondas = () => {
  const tam = 512;
  const c = document.createElement("canvas");
  c.width = c.height = tam;
  const g = c.getContext("2d")!;
  const img = g.createImageData(tam, tam);
  const TAU = Math.PI * 2;
  const r = new Array(12).fill(0).map((_, i) => ({ a: 1 + Math.floor(random(`wa${i}`) * 6), b: 1 + Math.floor(random(`wb${i}`) * 6), f: random(`wf${i}`) * TAU, n: 0.3 + random(`wn${i}`) }));
  const h = (x: number, y: number) => r.reduce((s, o) => s + o.n * Math.sin(TAU * (o.a * x + o.b * y) + o.f), 0);
  for (let y = 0; y < tam; y++)
    for (let x = 0; x < tam; x++) {
      const nx = (h((x - 1) / tam, y / tam) - h((x + 1) / tam, y / tam)) * 3.2;
      const ny = (h(x / tam, (y - 1) / tam) - h(x / tam, (y + 1) / tam)) * 3.2;
      const l = Math.hypot(nx, ny, 1);
      const i = (y * tam + x) * 4;
      img.data[i] = (nx / l) * 127 + 128;
      img.data[i + 1] = (ny / l) * 127 + 128;
      img.data[i + 2] = (1 / l) * 127 + 128;
      img.data[i + 3] = 255;
    }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(90, 118);
  return t;
};
const ceuTempestade = () =>
  tela(1024, 2048, (g) => {
    const d = g.createLinearGradient(0, 0, 0, 2048);
    d.addColorStop(0, "#58626E");
    d.addColorStop(0.55, "#7E8B97");
    d.addColorStop(1, "#AEB9BE");
    g.fillStyle = d;
    g.fillRect(0, 0, 1024, 2048);
    // nuvem pesada: massa escura em cima, barriga mais clara embaixo
    for (let i = 0; i < 150; i++) {
      const v = random(`nv${i}`);
      const y = random(`ny${i}`) * 1750;
      const k = 1 - y / 2300;
      mancha(g, random(`nx${i}`) * 1024, y, 110 + random(`nr${i}`) * 230, v > 0.5 ? `rgba(36,42,52,${0.42 * k})` : `rgba(176,188,198,${0.3 * (1 - k * 0.5)})`);
    }
  });
const ceuSeco = () =>
  tela(1024, 2048, (g) => {
    const d = g.createLinearGradient(0, 0, 0, 2048);
    d.addColorStop(0, "#5E9CCB");
    d.addColorStop(0.55, "#B7CFC9");
    d.addColorStop(0.85, "#F2D7A6");
    d.addColorStop(1, "#F5C486");
    g.fillStyle = d;
    g.fillRect(0, 0, 1024, 2048);
    mancha(g, 690, 420, 620, "rgba(255,240,205,0.72)");
    mancha(g, 690, 420, 150, "rgba(255,255,244,1)");
    mancha(g, 690, 420, 80, "rgba(255,255,255,1)");
  });

// ---------- peças ----------
const Peca: React.FC<{ p: V3; s: V3; cor: string; rugoso?: number; metal?: number; raio?: number; rot?: V3; brilho?: string; forca?: number }> = ({ p, s, cor, rugoso = 0.85, metal = 0, raio = 0.015, rot, brilho, forca = 0 }) => (
  <RoundedBox args={s} position={p} rotation={rot} radius={Math.min(raio, Math.min(...s) * 0.45)} smoothness={2} castShadow receiveShadow>
    <meshStandardMaterial color={cor} roughness={rugoso} metalness={metal} emissive={brilho ?? "#000000"} emissiveIntensity={forca} />
  </RoundedBox>
);
const Cano: React.FC<{ p: V3; r: number; l: number; cor: string; rot?: V3; rugoso?: number; metal?: number }> = ({ p, r, l, cor, rot, rugoso = 0.7, metal = 0 }) => (
  <mesh position={p} rotation={rot} castShadow receiveShadow>
    <cylinderGeometry args={[r, r, l, 16]} />
    <meshStandardMaterial color={cor} roughness={rugoso} metalness={metal} />
  </mesh>
);
const Fio: React.FC<{ a: V3; b: V3; flecha?: number; cor?: string }> = ({ a, b, flecha = 0.5, cor = "#1C1D20" }) => {
  const geo = useMemo(() => {
    const meio = new THREE.Vector3((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - flecha, (a[2] + b[2]) / 2);
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(...a), meio, new THREE.Vector3(...b)]), 28, 0.012, 6);
  }, [a, b, flecha]);
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial color={cor} roughness={0.7} />
    </mesh>
  );
};
const Poste: React.FC<{ x: number; z: number; molhado?: boolean; inclina?: number }> = ({ x, z, molhado, inclina = 0 }) => {
  const cor = molhado ? "#54575A" : "#A9A195";
  return (
    <group position={[x, 0, z]} rotation={[0, 0, inclina]}>
      <Cano p={[0, 4, 0]} r={0.09} l={8} cor={cor} />
      <Peca p={[0, 7.4, 0]} s={[1.4, 0.1, 0.1]} cor="#5A4A38" />
      {[-0.6, 0, 0.6].map((d) => (
        <Cano key={d} p={[d, 7.53, 0]} r={0.03} l={0.15} cor="#D8D2C2" rugoso={0.3} />
      ))}
      <Peca p={[0.18, 5.9, 0]} s={[0.32, 0.5, 0.3]} cor="#42464A" metal={0.2} rugoso={0.5} />
    </group>
  );
};

// venezianas: ripas de verdade, abertas ou fechadas
const Veneziana: React.FC<{ p: V3; l: number; a: number; cor: string }> = ({ p, l, a, cor }) => {
  const ripas = Math.floor(a / 0.075);
  return (
    <group position={p}>
      <Peca p={[-l / 2 + 0.025, 0, 0]} s={[0.05, a, 0.04]} cor={cor} />
      <Peca p={[l / 2 - 0.025, 0, 0]} s={[0.05, a, 0.04]} cor={cor} />
      <Peca p={[0, a / 2 - 0.025, 0]} s={[l, 0.05, 0.04]} cor={cor} />
      <Peca p={[0, -a / 2 + 0.025, 0]} s={[l, 0.05, 0.04]} cor={cor} />
      {new Array(ripas).fill(0).map((_, i) => (
        <Peca key={i} p={[0, -a / 2 + 0.06 + i * 0.075, 0]} s={[l - 0.08, 0.065, 0.012]} cor={cor} rot={[-0.5, 0, 0]} raio={0.004} />
      ))}
    </group>
  );
};
const Janela: React.FC<{ x: number; y: number; l?: number; a?: number; moldura: string; acesa?: boolean; fechada?: boolean; venez: string }> = ({ x, y, l = 1.25, a = 1.35, moldura, acesa, fechada, venez }) => (
  <group position={[x, y, 0]}>
    <Peca p={[0, 0, 0.012]} s={[l, a, 0.03]} cor={acesa ? "#E8A95F" : "#141B21"} rugoso={acesa ? 0.75 : 0.2} brilho={acesa ? "#F09A45" : undefined} forca={acesa ? 0.72 : 0} />
    {acesa && (
      <>
        <Peca p={[-l * 0.34, 0, 0.032]} s={[l * 0.28, a * 0.94, 0.012]} cor="#D9C197" rugoso={0.9} brilho="#B9772F" forca={0.32} />
        <Peca p={[l * 0.34, 0, 0.032]} s={[l * 0.28, a * 0.94, 0.012]} cor="#D9C197" rugoso={0.9} brilho="#B9772F" forca={0.32} />
      </>
    )}
    {/* moldura, cruzeta e peitoril */}
    <Peca p={[0, a / 2 + 0.05, 0.05]} s={[l + 0.2, 0.1, 0.08]} cor={moldura} />
    <Peca p={[-l / 2 - 0.05, 0, 0.05]} s={[0.1, a + 0.1, 0.08]} cor={moldura} />
    <Peca p={[l / 2 + 0.05, 0, 0.05]} s={[0.1, a + 0.1, 0.08]} cor={moldura} />
    <Peca p={[0, 0, 0.05]} s={[0.05, a, 0.04]} cor={moldura} />
    <Peca p={[0, a * 0.12, 0.05]} s={[l, 0.05, 0.04]} cor={moldura} />
    <Peca p={[0, -a / 2 - 0.06, 0.09]} s={[l + 0.36, 0.08, 0.2]} cor={moldura} />
    {fechada ? (
      <>
        <Veneziana p={[-l / 4, 0, 0.1]} l={l / 2} a={a} cor={venez} />
        <Veneziana p={[l / 4, 0, 0.1]} l={l / 2} a={a} cor={venez} />
      </>
    ) : (
      <>
        <Veneziana p={[-l / 2 - 0.42, 0, 0.1]} l={0.66} a={a} cor={venez} />
        <Veneziana p={[l / 2 + 0.42, 0, 0.1]} l={0.66} a={a} cor={venez} />
      </>
    )}
  </group>
);

const Telhado: React.FC<{ lado: -1 | 1; claro: number }> = ({ lado, claro }) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const ang = Math.atan2(1.72, 3.5);
  const passoL = 0.33;
  const passoX = 0.2;
  const linhas = 12;
  const colunas = Math.floor((META + 0.32) / passoX);
  useLayoutEffect(() => {
    const m = ref.current!;
    const o = new THREE.Object3D();
    const cor = new THREE.Color();
    for (let i = 0; i < linhas; i++)
      for (let j = 0; j < colunas; j++) {
        const d = i * passoL + 0.05;
        o.position.set(lado * (0.07 + j * passoX + (i % 2) * 0.012), 5.72 + Math.sin(ang) * d, 0.62 - Math.cos(ang) * d);
        o.rotation.set(ang - Math.PI / 2, 0, 0);
        o.updateMatrix();
        m.setMatrixAt(i * colunas + j, o.matrix);
        const v = random(`tl${lado}${i}${j}`);
        if (lado < 0) cor.setRGB(0.2 + v * 0.1, 0.1 + v * 0.05, 0.075 + v * 0.03);
        else cor.setRGB(0.42 + v * 0.14 + claro * 0.34, 0.2 + v * 0.07 + claro * 0.52, 0.11 + v * 0.04 + claro * 0.6);
        m.setColorAt(i * colunas + j, cor);
      }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [lado, ang, colunas, claro]);
  return (
    <>
      <instancedMesh ref={ref} args={[undefined, undefined, linhas * colunas]} castShadow receiveShadow>
        <cylinderGeometry args={[0.112, 0.112, 0.4, 12, 1, true, -Math.PI / 2, Math.PI]} />
        <meshStandardMaterial color="#FFFFFF" roughness={lado < 0 ? 0.28 : 0.86} side={THREE.DoubleSide} />
      </instancedMesh>
      {/* forro e testeira */}
      <mesh position={[lado * ((META + 0.45) / 2), 6.58, -1.33]} rotation={[ang - Math.PI / 2, 0, 0]}>
        <boxGeometry args={[META + 0.45, 4.05, 0.05]} />
        <meshStandardMaterial color="#2A1D15" roughness={0.9} />
      </mesh>
      <Peca p={[lado * ((META + 0.42) / 2), 5.66, 0.63]} s={[META + 0.42, 0.13, 0.07]} cor={lado < 0 ? "#3C3026" : "#9B8263"} />
      {/* calha */}
      <mesh position={[lado * ((META + 0.42) / 2), 5.67, 0.72]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.065, 0.065, META + 0.42, 12, 1, true, Math.PI, Math.PI]} />
        <meshStandardMaterial color={lado < 0 ? "#6C7074" : "#BDB7AA"} roughness={0.42} metalness={0.45} side={THREE.DoubleSide} />
      </mesh>
    </>
  );
};

const Metade: React.FC<{ lado: -1 | 1; claro: number }> = ({ lado, claro }) => {
  const tex = uma(`fachada${lado}`, () => fachada(lado));
  const cx = lado * (META / 2 + 0.02);
  const moldura = lado < 0 ? "#D5D2C6" : "#E3D5B8";
  const venez = lado < 0 ? "#274A52" : "#8D6A45";
  return (
    <group>
      {/* corpo da casa */}
      <Peca p={[cx, ALTURA / 2, -3]} s={[META, ALTURA, 5.96]} cor={lado < 0 ? "#566F6C" : "#C7A87C"} raio={0.01} />
      <mesh position={[cx, ALTURA / 2, 0.005]} receiveShadow>
        <planeGeometry args={[META, ALTURA]} />
        <meshStandardMaterial map={tex} roughness={lado < 0 ? 0.62 : 0.95} />
      </mesh>
      {/* friso entre os andares e rodapé */}
      <Peca p={[cx, 3.02, 0.04]} s={[META, 0.13, 0.1]} cor={moldura} />
      <Peca p={[cx, 0.12, 0.03]} s={[META, 0.24, 0.07]} cor={lado < 0 ? "#2E2A23" : "#8B6E4F"} />
      <Janela x={lado * 1.42} y={4.5} moldura={moldura} acesa={lado < 0} fechada={lado > 0} venez={venez} />
      <Telhado lado={lado} claro={claro} />
    </group>
  );
};

const Porta: React.FC = () => (
  <group position={[-1.42, 0, 0]}>
    <Peca p={[0, 1.12, 0.035]} s={[1.06, 2.24, 0.05]} cor="#37251A" />
    {[0.4, 1.12, 1.84].map((y) => (
      <Peca key={y} p={[0, y, 0.066]} s={[0.78, 0.56, 0.018]} cor="#452F20" />
    ))}
    <Peca p={[0, 2.3, 0.05]} s={[1.28, 0.1, 0.08]} cor="#D5D2C6" />
    <Peca p={[-0.59, 1.15, 0.05]} s={[0.1, 2.3, 0.08]} cor="#D5D2C6" />
    <Peca p={[0.59, 1.15, 0.05]} s={[0.1, 2.3, 0.08]} cor="#D5D2C6" />
    <Cano p={[0.4, 1.3, 0.09]} r={0.02} l={0.04} rot={[Math.PI / 2, 0, 0]} cor="#5C4A2B" metal={0.4} rugoso={0.6} />
    {/* número e lâmpada na parede */}
    <Peca p={[0.9, 2.1, 0.03]} s={[0.26, 0.16, 0.02]} cor="#EFEBDF" />
    <Peca p={[-0.9, 2.45, 0.05]} s={[0.1, 0.18, 0.1]} cor="#2B2B2B" />
  </group>
);

// Mandacaru de verdade: tronco em gomos, com espinhos, em vez de cano liso.
const Gomo: React.FC<{ p: V3; r: number; l: number; cor: string }> = ({ p, r, l, cor }) => {
  const geo = useMemo(() => {
    const g = new THREE.CylinderGeometry(r * 0.86, r, l, 56, 10);
    const a = g.attributes.position;
    for (let i = 0; i < a.count; i++) {
      const x = a.getX(i);
      const z = a.getZ(i);
      const th = Math.atan2(z, x);
      const k = 1 + 0.17 * Math.abs(Math.cos(th * 4));
      a.setX(i, x * k);
      a.setZ(i, z * k);
    }
    g.computeVertexNormals();
    return g;
  }, [r, l]);
  return (
    <group position={p}>
      <mesh geometry={geo} castShadow receiveShadow>
        <meshStandardMaterial color={cor} roughness={0.72} />
      </mesh>
      {new Array(Math.floor(l * 34)).fill(0).map((_, i) => {
        const th = ((i % 8) * Math.PI) / 4;
        const y = -l / 2 + ((i + 0.5) / (l * 34)) * l;
        const rr = r * 1.13;
        return (
          <mesh key={i} position={[Math.cos(th) * rr, y, Math.sin(th) * rr]} rotation={[0, -th, Math.PI / 2 - 0.2]}>
            <coneGeometry args={[0.005, 0.05, 4]} />
            <meshStandardMaterial color="#D8CFA8" roughness={0.7} />
          </mesh>
        );
      })}
    </group>
  );
};

// ---------- os dois mundos ----------
const LadoEnchente: React.FC<{ t: number; opSecao: number; perigos: boolean; aguaK: number }> = ({ t, opSecao, perigos, aguaK }) => {
  const agua = uma("ondas", ondas);
  const secao = uma("secao", secaoAgua);
  const vec = useMemo(() => new THREE.Vector2(0.32, 0.32), []);
  agua.offset.set(t * 0.05, t * 0.11);
  const boia = (fase: number) => Math.sin(t * 1.5 + fase) * 0.018 + (aguaK - 1) * NIVEL_AGUA;
  const nivel = NIVEL_AGUA * aguaK;
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-130, -0.02, -60]} receiveShadow>
        <planeGeometry args={[260, 340]} />
        <meshStandardMaterial color="#2B2115" roughness={1} />
      </mesh>
      {/* a água: um bloco cortado na linha do meio; dá pra ver a seção dela */}
      <mesh position={[-130, nivel, -60]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={4}>
        <planeGeometry args={[260, 340]} />
        <meshStandardMaterial color="#7A5A32" roughness={0.3} transparent opacity={0.95} normalMap={agua} normalScale={vec} envMapIntensity={0.42} depthWrite={false} />
      </mesh>
      <mesh position={[-0.004, nivel / 2, -60]} rotation={[0, Math.PI / 2, 0]} scale={[1, aguaK, 1]} renderOrder={5}>
        <planeGeometry args={[340, NIVEL_AGUA]} />
        <meshBasicMaterial map={secao} transparent opacity={opSecao} depthWrite={false} />
      </mesh>
      {/* o que a água esconde: buraco, bueiro aberto e fio caído, visíveis só na seção */}
      {perigos && (
        <group position={[-0.45, 0, 5.4]}>
          <pointLight position={[0.35, 0.72, 0]} intensity={3.4} distance={4.5} decay={1.6} color="#F3DCB2" />
          <mesh position={[0, 0.003, 1.15]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.36, 28]} />
            <meshBasicMaterial color="#050403" />
          </mesh>
          <Cano p={[0, -0.25, 1.15]} r={0.36} l={0.5} cor="#0C0906" />
          <mesh position={[0, 0.02, -0.05]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.24, 0.32, 28]} />
            <meshStandardMaterial color="#4A4A4C" metalness={0.5} roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.006, -0.05]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.25, 24]} />
            <meshBasicMaterial color="#060504" />
          </mesh>
          <Peca p={[0.32, 0.1, -0.5]} s={[0.56, 0.04, 0.5]} rot={[0.3, 0.5, 0.5]} cor="#55555A" metal={0.6} rugoso={0.45} />
          <Fio a={[0, 0.9, -1.6]} b={[0, 0.03, -1.05]} flecha={0.1} cor="#101012" />
          <Fio a={[0, 0.03, -1.05]} b={[0, 0.05, -0.75]} flecha={0.02} cor="#101012" />
        </group>
      )}
      {/* espuma encostada na parede e na borda cortada */}
      <Peca p={[-META / 2 - 0.02, nivel + 0.01, 0.13]} s={[META, 0.024, 0.2]} cor="#C7BDA9" rugoso={0.9} raio={0.008} />
      <Peca p={[-0.014, nivel + 0.004, 4]} s={[0.028, 0.02, 80]} cor="#E7DFCE" rugoso={0.5} raio={0.008} />

      <Porta />
      {/* padrão de luz com caixa pingando */}
      <Peca p={[-0.48, 1.85, 0.06]} s={[0.4, 0.55, 0.12]} cor="#4F5A5E" metal={0.3} rugoso={0.45} />
      <Cano p={[-0.48, 2.4, 0.08]} r={0.02} l={0.6} cor="#26282A" />
      {/* cano de descida */}
      <Cano p={[-2.72, 3.1, 0.14]} r={0.045} l={5.2} cor="#72777B" metal={0.4} rugoso={0.4} />

      {/* coisas boiando */}
      <mesh position={[-2.25 + t * 0.012, NIVEL_AGUA + 0.03 + boia(0), 3.2]} rotation={[Math.PI / 2 - 0.06, 0.08, 0]} castShadow>
        <torusGeometry args={[0.32, 0.12, 14, 28]} />
        <meshStandardMaterial color="#17181A" roughness={0.75} />
      </mesh>
      <group position={[-1.05 - t * 0.008, NIVEL_AGUA + 0.05 + boia(2), 5.9]} rotation={[0.1 + boia(4) * 3, 0.5, -0.12]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.2, 0.14, 0.3, 22]} />
          <meshStandardMaterial color="#A5492B" roughness={0.7} />
        </mesh>
      </group>
      <Peca p={[-3.0, nivel + 0.03, 1.5]} s={[1.65, 0.05, 0.2]} rot={[0, 0.35, 0.03]} cor="#7A5E3F" />
      <Peca p={[-1.5, nivel + 0.02, 1.6]} s={[0.9, 0.04, 0.14]} rot={[0, -0.6, -0.02]} cor="#5F4B34" />
      <group position={[-3.3, nivel - 0.1, 2.2]} rotation={[0.42, 0.7, 0.34]}>
        <Peca p={[0, 0.26, 0]} s={[0.46, 0.05, 0.46]} cor="#E6E2D6" rugoso={0.4} raio={0.02} />
        <Peca p={[0, 0.54, -0.21]} s={[0.46, 0.55, 0.05]} cor="#E6E2D6" rugoso={0.4} raio={0.02} />
      </group>
      {/* árvore encharcada e casa vizinha afundada */}
      <group position={[-4.3, 0, -3.1]}>
        <Cano p={[0, 2.2, 0]} r={0.2} l={4.4} cor="#2D241C" rugoso={1} />
        {/* copa: muitos tufos pequenos, pra borda não virar uma bola */}
        {new Array(70).fill(0).map((_, i) => {
          const a = random(`ta${i}`) * Math.PI * 2;
          const b = Math.acos(2 * random(`tb${i}`) - 1);
          const raio = 0.9 + random(`tr${i}`) * 1.1;
          return (
            <mesh key={i} position={[Math.sin(b) * Math.cos(a) * raio * 1.25, 5 + Math.cos(b) * raio, Math.sin(b) * Math.sin(a) * raio]} scale={0.3 + random(`te${i}`) * 0.38} castShadow>
              <sphereGeometry args={[1, 12, 10]} />
              <meshStandardMaterial color={["#1E3525", "#27442D", "#30523A"][i % 3]} roughness={0.5} />
            </mesh>
          );
        })}
      </group>
      <group position={[-13, 0, -24]}>
        <Peca p={[0, 1.8, 0]} s={[7, 3.6, 6]} cor="#536360" />
        <mesh position={[0, 4.3, 0]} rotation={[0, Math.PI / 4, 0]} scale={[1, 0.3, 1]} castShadow>
          <coneGeometry args={[5.9, 4.6, 4]} />
          <meshStandardMaterial color="#2F2019" roughness={0.45} />
        </mesh>
      </group>
      <group position={[-27, 0, -46]}>
        <Peca p={[0, 2.2, 0]} s={[11, 4.4, 7]} cor="#4A5453" />
        <mesh position={[0, 5.3, 0]} rotation={[0, Math.PI / 4, 0]} scale={[1.4, 0.3, 1]} castShadow>
          <coneGeometry args={[7.2, 5, 4]} />
          <meshStandardMaterial color="#2A201A" roughness={0.45} />
        </mesh>
      </group>
      <Poste x={-5.6} z={-14} molhado inclina={0.06} />
      {/* morro na chuva */}
      <mesh position={[-52, 0, -130]} scale={[50, 26, 26]}>
        <sphereGeometry args={[1, 32, 20]} />
        <meshStandardMaterial color="#334A42" roughness={1} />
      </mesh>
    </>
  );
};

const LadoSeca: React.FC<{ nivelCisterna?: number; semMoitas: boolean }> = ({ nivelCisterna, semMoitas }) => {
  const chao = uma("chao", chaoSeco);
  const reboco = uma("cimento", cimento);
  const cortada = nivelCisterna !== undefined;
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[130, 0, -60]} receiveShadow>
        <planeGeometry args={[260, 340]} />
        <meshStandardMaterial map={chao} bumpMap={chao} bumpScale={0.9} roughness={0.98} />
      </mesh>
      {/* a cisterna, ligada à calha */}
      <group position={[2.1, 0, 1.5]}>
        {cortada ? (
          <>
            {/* cortada ao meio pra mostrar a água subindo: casca de trás, parede cortada e água */}
            <mesh position={[0, 0.82, 0]} receiveShadow>
              <cylinderGeometry args={[0.92, 1, 1.64, 48, 1, true, Math.PI / 2, Math.PI]} />
              <meshStandardMaterial map={reboco} roughness={0.96} side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[0, 0.03, 0]}>
              <cylinderGeometry args={[0.97, 0.97, 0.06, 48]} />
              <meshStandardMaterial color="#8F8574" roughness={1} />
            </mesh>
            {/* a face de água que o corte revela, e a superfície dela */}
            <mesh position={[0, 0.06 + (nivelCisterna * 1.5) / 2, 0.012]}>
              <planeGeometry args={[1.88, Math.max(0.001, nivelCisterna * 1.5)]} />
              <meshPhysicalMaterial color="#3F8CB5" roughness={0.12} transparent opacity={0.78} clearcoat={1} emissive="#1C5674" emissiveIntensity={0.35} />
            </mesh>
            <mesh position={[0, 0.06 + nivelCisterna * 1.5, 0.008]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.93, 48, 0, Math.PI]} />
              <meshPhysicalMaterial color="#A9D2E2" roughness={0.08} transparent opacity={0.9} />
            </mesh>
            {[-0.96, 0.96].map((x) => (
              <Peca key={x} p={[x, 0.82, 0.002]} s={[0.07, 1.64, 0.03]} cor="#8F8574" />
            ))}
          </>
        ) : (
          <>
            <mesh position={[0, 0.82, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.92, 1, 1.64, 40]} />
              <meshStandardMaterial map={reboco} roughness={0.96} />
            </mesh>
            {[0.36, 0.82, 1.28].map((y) => (
              <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[1 - (y / 1.64) * 0.08 + 0.002, 0.012, 8, 56]} />
                <meshStandardMaterial color="#9E937E" roughness={1} />
              </mesh>
            ))}
            <mesh position={[0, 1.7, 0]} castShadow>
              <cylinderGeometry args={[0.2, 0.96, 0.18, 40]} />
              <meshStandardMaterial color="#B5AA95" roughness={0.95} />
            </mesh>
          </>
        )}
        {!cortada && <Cano p={[0, 1.83, 0]} r={0.22} l={0.08} cor="#776A55" />}
        <Cano p={[-0.72, 0.28, 0.6]} r={0.022} l={0.2} rot={[Math.PI / 2, 0, 0]} cor="#7B7F82" metal={0.6} rugoso={0.35} />
        <Peca p={[-0.74, 0.28, 0.72]} s={[0.08, 0.04, 0.05]} cor="#B33B24" />
      </group>
      {/* cano de descida: da calha até a cisterna */}
      <Cano p={[2.72, 3.5, 0.2]} r={0.05} l={4.34} cor="#ADA89D" metal={0.2} rugoso={0.5} />
      <Cano p={[2.6, 1.55, 0.75]} r={0.05} l={1.2} rot={[Math.PI / 2 - 0.05, 0, 0.15]} cor="#ADA89D" metal={0.2} rugoso={0.5} />
      {/* mandacaru, galhada seca, balde e bacia */}
      <group position={[3.15, 0, -1.2]} scale={1.05}>
        <Gomo p={[0, 1.5, 0]} r={0.19} l={3} cor="#4D6A3B" />
        <Cano p={[0.42, 1.55, 0]} r={0.09} l={0.72} rot={[0, 0, Math.PI / 2]} cor="#46613A" rugoso={0.85} />
        <Gomo p={[0.78, 2.15, 0]} r={0.12} l={1.25} cor="#55733F" />
        <Cano p={[-0.34, 1.1, 0]} r={0.08} l={0.6} rot={[0, 0, Math.PI / 2]} cor="#46613A" rugoso={0.85} />
        <Gomo p={[-0.62, 1.55, 0]} r={0.105} l={0.95} cor="#55733F" />
      </group>
      {/* moitas secas: muitos galhos finos saindo do mesmo pé */}
      {!semMoitas && [[1.75, 5.6, 1], [2.5, 7.2, 0.8], [0.95, 3.7, 0.7]].map(([x, z, k], m) => (
        <group key={m} position={[x, 0, z]} scale={k}>
          {new Array(16).fill(0).map((_, i) => {
            const a = i * 2.399 + m;
            const inc = 0.2 + random(`mo${m}${i}`) * 0.75;
            const l = 0.3 + random(`ml${m}${i}`) * 0.42;
            return (
              <group key={i} rotation={[0, a, inc]}>
                <Cano p={[0, l / 2, 0]} r={0.006} l={l} cor="#6B4C2F" rugoso={1} />
              </group>
            );
          })}
        </group>
      ))}
      <group position={[3.2, 0, 4.9]} rotation={[0, 0, 1.45]}>
        <mesh position={[0.17, 0, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.2, 0.15, 0.32, 22, 1, true]} />
          <meshStandardMaterial color="#3E6D94" roughness={0.6} side={THREE.DoubleSide} />
        </mesh>
      </group>
      {/* vizinhos desbotados */}
      <group position={[14, 0, -26]}>
        <Peca p={[0, 1.8, 0]} s={[8, 3.6, 6]} cor="#D9C4A2" />
        <mesh position={[0, 4.3, 0]} rotation={[0, Math.PI / 4, 0]} scale={[1.1, 0.3, 1]} castShadow>
          <coneGeometry args={[6.2, 5, 4]} />
          <meshStandardMaterial color="#A86B47" roughness={0.9} />
        </mesh>
      </group>
      <group position={[29, 0, -50]}>
        <Peca p={[0, 2, 0]} s={[12, 4, 7]} cor="#CBB391" />
        <mesh position={[0, 4.9, 0]} rotation={[0, Math.PI / 4, 0]} scale={[1.4, 0.3, 1]} castShadow>
          <coneGeometry args={[7.2, 5, 4]} />
          <meshStandardMaterial color="#9A6341" roughness={0.9} />
        </mesh>
      </group>
      <Poste x={5.6} z={-14} />
      {/* morro seco */}
      <mesh position={[52, 0, -130]} scale={[50, 22, 26]}>
        <sphereGeometry args={[1, 32, 20]} />
        <meshStandardMaterial color="#B4905F" roughness={1} />
      </mesh>
      {/* a racha do chão, indo até o horizonte */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.03, 0.006, -60]}>
        <planeGeometry args={[0.06, 340]} />
        <meshBasicMaterial color="#160E08" />
      </mesh>
    </>
  );
};

// Chuva só do lado de lá e poeira só do lado de cá
const Chuva: React.FC<{ t: number }> = ({ t }) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const n = 620;
  useLayoutEffect(() => {
    const o = new THREE.Object3D();
    for (let i = 0; i < n; i++) {
      const queda = (random(`cv${i}`) * 13 - t * (10 + random(`cq${i}`) * 3)) % 13;
      o.position.set(-0.05 - random(`cu${i}`) * 9, NIVEL_AGUA + (queda < 0 ? queda + 13 : queda), 4 - random(`cz${i}`) * 9);
      o.rotation.set(0.03, 0, 0.05);
      const k = 0.5 + random(`cs${i}`) * 0.5;
      o.scale.set(1, k, 1);
      o.updateMatrix();
      ref.current!.setMatrixAt(i, o.matrix);
    }
    ref.current!.instanceMatrix.needsUpdate = true;
  }, [t]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, n]}>
      <boxGeometry args={[0.014, 0.75, 0.014]} />
      <meshBasicMaterial color="#DCE6EC" transparent opacity={0.17} depthWrite={false} />
    </instancedMesh>
  );
};
const Respingos: React.FC = () => (
  <>
    {new Array(46).fill(0).map((_, i) => (
      <mesh key={i} position={[-0.25 - random(`sx${i}`) * 5.2, NIVEL_AGUA + 0.012, 8.6 - random(`sz${i}`) * 8.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.03 + random(`sr${i}`) * 0.1, 0.045 + random(`sr${i}`) * 0.1, 22]} />
        <meshBasicMaterial color="#DAD6C8" transparent opacity={0.62} depthWrite={false} />
      </mesh>
    ))}
  </>
);
const Poeira: React.FC = () => (
  <>
    {new Array(34).fill(0).map((_, i) => (
      <mesh key={i} position={[0.6 + random(`dx${i}`) * 3.4, 0.05 + random(`dy${i}`) * 1.6, 7.2 - random(`dz${i}`) * 3]} scale={0.003 + random(`dr${i}`) * 0.005}>
        <sphereGeometry args={[1, 8, 6]} />
        <meshBasicMaterial color="#F0D5A8" transparent opacity={0.45} depthWrite={false} />
      </mesh>
    ))}
  </>
);

// Dois sóis recortados exatamente em x = 0: a direção de cada luz não tem componente x, então a sombra de
// cada anteparo invisível termina numa parede reta que passa pela casa e pelo próprio narrador.
const Anteparo: React.FC<{ p: V3; rot: V3; s: [number, number] }> = ({ p, rot, s }) => (
  <mesh position={p} rotation={rot} castShadow>
    <planeGeometry args={s} />
    <meshBasicMaterial colorWrite={false} depthWrite={false} side={THREE.DoubleSide} />
  </mesh>
);
const Luzes: React.FC = () => (
  <>
    <hemisphereLight args={["#AEBCCC", "#5E5243", 0.5]} />
    <directionalLight position={[0, 30, 27]} intensity={4.1} color="#FFD8A2" castShadow shadow-mapSize={[4096, 4096]} shadow-bias={-0.0002} shadow-normalBias={0.01} shadow-camera-left={-14} shadow-camera-right={14} shadow-camera-top={14} shadow-camera-bottom={-14} shadow-camera-near={1} shadow-camera-far={90} />
    <directionalLight position={[0, 7, 60]} intensity={2.2} color="#A9C3E2" castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0003} shadow-normalBias={0.02} shadow-camera-left={-14} shadow-camera-right={14} shadow-camera-top={14} shadow-camera-bottom={-14} shadow-camera-near={1} shadow-camera-far={110} />
    {/* tira o sol da metade da enchente */}
    <Anteparo p={[-40, 18, 0]} rot={[-Math.PI / 2, 0, 0]} s={[80, 200]} />
    {/* tira a luz fria da metade da seca */}
    <Anteparo p={[40, 7, 40]} rot={[0, 0, 0]} s={[80, 18]} />
    {/* brilho quente que escapa da janela acesa */}
    <pointLight position={[-1.42, 3.7, 1.3]} intensity={1.6} distance={4} decay={2} color="#FFB268" />
  </>
);

export const CasaPartida: React.FC<{ camX: number; camZ: number; t?: number; opSecao?: number; perigos?: boolean; nivelCisterna?: number; claro?: number; aguaK?: number }> = ({ camX, camZ, t = 0, opSecao = 0.72, perigos = false, nivelCisterna, claro = 0, aguaK = 1 }) => {
  const tempestade = uma("ceuT", ceuTempestade);
  const seco = uma("ceuS", ceuSeco);
  // o céu se divide bem atrás da fresta da casa, vista da posição da câmera
  const corte = camX * (1 - (240 + camZ) / camZ);
  return (
    <>
      <Luzes />
      <mesh position={[corte - 70, 72, -240]}>
        <planeGeometry args={[140, 160]} />
        <meshBasicMaterial map={tempestade} />
      </mesh>
      <mesh position={[corte + 70, 72, -240]}>
        <planeGeometry args={[140, 160]} />
        <meshBasicMaterial map={seco} />
      </mesh>
      <LadoEnchente t={t} opSecao={opSecao} perigos={perigos} aguaK={aguaK} />
      <LadoSeca nivelCisterna={nivelCisterna} semMoitas={perigos} />
      <Metade lado={-1} claro={0} />
      <Metade lado={1} claro={claro} />
      {/* a fresta entre as metades */}
      <mesh position={[0, 2.86, 0.02]}>
        <boxGeometry args={[0.045, 5.72, 0.02]} />
        <meshBasicMaterial color="#0B0705" />
      </mesh>
      <Fio a={[-5.6, 7.45, -14]} b={[5.6, 7.45, -14]} flecha={0.6} />
      <Fio a={[-5, 7.45, -14]} b={[6.2, 7.45, -14]} flecha={0.66} />
      <Fio a={[5, 7.45, -14]} b={[2.2, 5.45, -0.05]} flecha={0.3} />
      <Fio a={[-5.05, 7.3, -13.6]} b={[-0.5, 2.7, 0.08]} flecha={0.26} />
      <Chuva t={t} />
      {aguaK > 0.92 && <Respingos />}
      <Poeira />
    </>
  );
};
