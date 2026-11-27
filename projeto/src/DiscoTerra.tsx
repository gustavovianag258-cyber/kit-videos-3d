import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { random } from "remotion";

// A Terra plana: um disco de 40 km de diâmetro (1 unidade = 1 metro).
// O tamanho é artístico, para caber o personagem e o planeta na mesma cena.
export const RAIO_DISCO = 20000;
export const ESPESSURA_DISCO = 2500;

// A imagem da superfície é cara de desenhar: gera uma vez e reaproveita nas cenas
let superficieEmCache: HTMLCanvasElement | null = null;

const criarTexturaSuperficie = () => {
  superficieEmCache ??= desenharSuperficie();
  const tex = new THREE.CanvasTexture(superficieEmCache);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 16;
  return tex;
};

const desenharSuperficie = () => {
  const N = 2048;
  const c = N / 2;
  const canvas = document.createElement("canvas");
  canvas.width = N;
  canvas.height = N;
  const ctx = canvas.getContext("2d")!;
  // Camada auxiliar: cada cor é desenhada nela e colada com desfoque UMA vez só
  const camada = document.createElement("canvas");
  camada.width = N;
  camada.height = N;
  const cctx = camada.getContext("2d")!;
  const colarCamada = (desfoque: number) => {
    ctx.filter = desfoque > 0 ? `blur(${desfoque}px)` : "none";
    ctx.drawImage(camada, 0, 0);
    ctx.filter = "none";
    cctx.clearRect(0, 0, N, N);
  };

  // Oceano, mais escuro perto da borda
  const oceano = ctx.createRadialGradient(c, c, 0, c, c, c);
  oceano.addColorStop(0, "#2a7fd0");
  oceano.addColorStop(0.8, "#1a62a8");
  oceano.addColorStop(1, "#0d3f74");
  ctx.fillStyle = oceano;
  ctx.fillRect(0, 0, N, N);

  // Continentes: aglomerados de círculos, primeiro a areia, depois a vegetação
  const continentes = Array.from({ length: 8 }, (_, i) => {
    const ang = random(`cont-ang-${i}`) * Math.PI * 2;
    const dist = (0.12 + random(`cont-dist-${i}`) * 0.6) * c;
    return {
      x: c + Math.cos(ang) * dist,
      y: c + Math.sin(ang) * dist,
      tam: (0.07 + random(`cont-tam-${i}`) * 0.1) * N,
      bolhas: Array.from({ length: 40 }, (_, j) => ({
        dx: (random(`b-dx-${i}-${j}`) - 0.5) * 2,
        dy: (random(`b-dy-${i}-${j}`) - 0.5) * 2,
        r: 0.25 + random(`b-r-${i}-${j}`) * 0.35,
      })),
    };
  });
  const desenhar = (cor: string, fator: number, desfoque = 0) => {
    // O desfoque suaviza as bordas internas, para não parecer "bolinhas"
    cctx.fillStyle = cor;
    for (const ct of continentes) {
      for (const b of ct.bolhas) {
        cctx.beginPath();
        cctx.arc(ct.x + b.dx * ct.tam, ct.y + b.dy * ct.tam, b.r * ct.tam * fator, 0, Math.PI * 2);
        cctx.fill();
      }
    }
    colarCamada(desfoque);
  };
  desenhar("#d8c28a", 1.12);
  desenhar("#4f9a45", 1);
  desenhar("#3f8a3a", 0.75, 14);
  desenhar("#336f30", 0.45, 22);

  // Muralha de gelo na borda
  ctx.strokeStyle = "#f2f8ff";
  ctx.lineWidth = N * 0.025;
  ctx.beginPath();
  ctx.arc(c, c, c - ctx.lineWidth / 2, 0, Math.PI * 2);
  ctx.stroke();

  // Nuvens pintadas, bem suaves
  for (let i = 0; i < 160; i++) {
    const x = random(`nuv-x-${i}`) * N;
    const y = random(`nuv-y-${i}`) * N;
    const r = 15 + random(`nuv-r-${i}`) * 50;
    cctx.fillStyle = "rgba(255,255,255,0.22)";
    cctx.beginPath();
    cctx.ellipse(x, y, r * 2, r, random(`nuv-a-${i}`) * Math.PI, 0, Math.PI * 2);
    cctx.fill();
  }
  colarCamada(10);

  return canvas;
};

// Cortina de água caindo pela borda: branca em cima, some para baixo
const criarTexturaCortina = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  for (let i = 0; i < 400; i++) {
    const x = random(`cort-x-${i}`) * 512;
    ctx.fillStyle = `rgba(255,255,255,${0.25 + random(`cort-a-${i}`) * 0.5})`;
    ctx.fillRect(x, 0, 1 + random(`cort-w-${i}`) * 3, 256);
  }
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, "rgba(0,0,0,1)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.globalCompositeOperation = "destination-in";
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 256);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.repeat.set(24, 1);
  return tex;
};

const NuvensDoDisco: React.FC = () => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const N = 70;
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    for (let i = 0; i < N; i++) {
      const ang = random(`nuvem-ang-${i}`) * Math.PI * 2;
      const dist = Math.sqrt(random(`nuvem-d-${i}`)) * RAIO_DISCO * 0.9;
      const tam = 200 + random(`nuvem-t-${i}`) * 350;
      m.compose(
        new THREE.Vector3(
          Math.cos(ang) * dist,
          1500 + random(`nuvem-y-${i}`) * 1200,
          Math.sin(ang) * dist,
        ),
        q,
        new THREE.Vector3(tam * 1.6, tam * 0.35, tam),
      );
      ref.current!.setMatrixAt(i, m);
    }
    ref.current!.instanceMatrix.needsUpdate = true;
  }, []);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, N]} frustumCulled={false}>
      <sphereGeometry args={[1, 14, 10]} />
      <meshStandardMaterial color="#ffffff" transparent opacity={0.6} roughness={1} depthWrite={false} />
    </instancedMesh>
  );
};

export const DiscoTerra: React.FC<{ comNuvens?: boolean; comCascata?: boolean }> = ({
  comNuvens = true,
  comCascata = true,
}) => {
  const superficie = useMemo(criarTexturaSuperficie, []);
  const cortina = useMemo(criarTexturaCortina, []);
  // Parte de baixo em forma de rocha irregular (cone com relevo)
  const rocha = useMemo(() => {
    const g = new THREE.ConeGeometry(RAIO_DISCO * 0.98, ESPESSURA_DISCO * 3, 64, 8, true);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const k = 1 + (random(`rocha-${Math.round(x)}-${Math.round(y)}-${Math.round(z)}`) - 0.5) * 0.12;
      pos.setXYZ(i, x * k, y, z * k);
    }
    g.computeVertexNormals();
    return g;
  }, []);

  return (
    <group>
      {/* Superfície (um pouco abaixo de y = 0, onde fica o chão da cidade) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <circleGeometry args={[RAIO_DISCO, 128]} />
        <meshStandardMaterial map={superficie} roughness={0.9} />
      </mesh>
      {/* Lateral do disco */}
      <mesh position={[0, -ESPESSURA_DISCO / 2 - 0.05, 0]}>
        <cylinderGeometry
          args={[RAIO_DISCO, RAIO_DISCO * 0.98, ESPESSURA_DISCO, 128, 1, true]}
        />
        <meshStandardMaterial color="#6b4a32" roughness={1} side={THREE.DoubleSide} />
      </mesh>
      {/* Parte de baixo: rocha pontuda, como uma ilha flutuante */}
      <mesh
        geometry={rocha}
        position={[0, -ESPESSURA_DISCO - ESPESSURA_DISCO * 1.5, 0]}
        rotation={[Math.PI, 0, 0]}
      >
        <meshStandardMaterial color="#4e3524" roughness={1} flatShading />
      </mesh>
      {/* Muralha de gelo na borda */}
      <mesh position={[0, 400, 0]}>
        <cylinderGeometry args={[RAIO_DISCO * 0.995, RAIO_DISCO * 0.995, 800, 128, 1, true]} />
        <meshStandardMaterial color="#eef6ff" roughness={0.6} side={THREE.DoubleSide} />
      </mesh>
      {comCascata && (
        <mesh position={[0, -ESPESSURA_DISCO * 1.5, 0]}>
          <cylinderGeometry
            args={[RAIO_DISCO * 1.004, RAIO_DISCO * 1.02, ESPESSURA_DISCO * 3, 128, 1, true]}
          />
          <meshStandardMaterial
            map={cortina}
            color="#d6ecff"
            emissive="#3a6a9a"
            emissiveIntensity={0.3}
            transparent
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
      {comNuvens && <NuvensDoDisco />}
    </group>
  );
};
