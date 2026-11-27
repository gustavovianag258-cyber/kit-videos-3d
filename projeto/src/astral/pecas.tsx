import { useLayoutEffect, useMemo } from "react";
import { random } from "remotion";
import * as THREE from "three";
import type { V3 } from "./tempo";

// Peças do vídeo da projeção astral, no estilo do original: mundo em blocos, mãos de fantasma
// azuladas presas à câmera, gente de cabeça quadrada com rosto desenhado.

export const suave = (x: number) => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
};
export const entre = (s: number, a: number, b: number) => suave((s - a) / (b - a));
export const lerp = (a: number, b: number, x: number) => a + (b - a) * x;
export const rnd = (chave: string) => random(`astral-${chave}`);

export const texturaCanvas = (l: number, a: number, desenhar: (c: CanvasRenderingContext2D) => void, repetir?: [number, number]) => {
  const cv = document.createElement("canvas");
  cv.width = l;
  cv.height = a;
  desenhar(cv.getContext("2d")!);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  if (repetir) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(...repetir);
  }
  return t;
};

// Caixa simples (o mundo inteiro é feito delas)
export const Cx: React.FC<{
  t: V3;
  p?: V3;
  r?: V3;
  c?: string;
  e?: string;
  ei?: number;
  rug?: number;
  met?: number;
  map?: THREE.Texture;
  sombra?: boolean;
  transp?: number;
}> = ({ t, p = [0, 0, 0], r = [0, 0, 0], c = "#ffffff", e, ei = 0, rug = 0.8, met = 0, map, sombra = true, transp }) => (
  <mesh position={p} rotation={r} castShadow={sombra} receiveShadow>
    <boxGeometry args={t} />
    <meshStandardMaterial
      color={c}
      emissive={e ?? "#000000"}
      emissiveIntensity={ei}
      roughness={rug}
      metalness={met}
      map={map ?? null}
      transparent={transp !== undefined}
      opacity={transp ?? 1}
    />
  </mesh>
);

// Material que brilha (lâmpadas, LED, telas) — passa do limite do bloom
export const Luzinha: React.FC<{ p: V3; tam?: number; cor?: string; forca?: number }> = ({ p, tam = 0.03, cor = "#ffd28a", forca = 3 }) => (
  <mesh position={p}>
    <sphereGeometry args={[tam, 8, 6]} />
    <meshBasicMaterial color={new THREE.Color(cor).multiplyScalar(forca)} toneMapped={false} />
  </mesh>
);

export type PoseMao = { x: number; y: number; z: number; rx?: number; ry?: number; rz?: number; dobra?: number };
export type PoseMaos = { e: PoseMao; d: PoseMao };

// ---------------------------------------------------------------------------------------------
// ONDULAÇÃO: anéis que se espalham na superfície quando a mão atravessa (parede, cofre, janela)
// ---------------------------------------------------------------------------------------------
const fragOnda = `
uniform float t; uniform vec3 cor;
varying vec2 vUv;
void main(){
  vec2 p = vUv * 2.0 - 1.0;
  float r = length(p);
  float a = 0.0;
  for (int i = 0; i < 4; i++) {
    float ri = fract(t * 0.55 - float(i) * 0.25);
    float anel = smoothstep(0.06, 0.0, abs(r - ri)) * (1.0 - ri);
    a += anel;
  }
  a += smoothstep(0.35, 0.0, r) * 0.55;
  a *= smoothstep(1.0, 0.7, r);
  gl_FragColor = vec4(cor * a * 1.6, a);
}`;
export const Ondulacao: React.FC<{ p: V3; r?: V3; tam?: number; t: number; forca?: number }> = ({ p, r = [0, 0, 0], tam = 1, t, forca = 1 }) => {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { t: { value: 0 }, cor: { value: new THREE.Color("#dfe9ff") } },
        vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: fragOnda,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        toneMapped: false,
      }),
    [],
  );
  useLayoutEffect(() => {
    mat.uniforms.t.value = t;
    mat.uniforms.cor.value = new THREE.Color("#dfe9ff").multiplyScalar(forca);
  });
  if (t <= 0 || forca <= 0) return null;
  return (
    <mesh position={p} rotation={r} material={mat}>
      <planeGeometry args={[tam, tam]} />
    </mesh>
  );
};

// ---------------------------------------------------------------------------------------------
// GENTE em blocos (cabeça quadrada com rosto desenhado, como no original)
// ---------------------------------------------------------------------------------------------
export type Rosto = "dormindo" | "aberto" | "feliz" | "serio";
export type Roupa = {
  pele: string;
  cabelo: string;
  camisa: string;
  calca: string;
  sapato?: string;
  penteado?: "curto" | "cacheado" | "careca" | "grisalho" | "longo" | "coque" | "lateral" | "longoCacheado";
  barba?: boolean; // barba por fazer
  top?: boolean; // blusinha curta (barriga de fora)
  short?: boolean; // short curto (canela de fora)
  terno?: boolean;
  gravata?: string;
  vestido?: boolean;
  batom?: boolean;
};

const rostoCache = new Map<string, THREE.Texture>();
const texturaRosto = (pele: string, rosto: Rosto, batom: boolean, barba = false) => {
  const chave = `${pele}-${rosto}-${batom}-${barba}`;
  const cached = rostoCache.get(chave);
  if (cached) return cached;
  const t = texturaCanvas(256, 256, (g) => {
    g.fillStyle = pele;
    g.fillRect(0, 0, 256, 256);
    if (barba) {
      // barba por fazer lisa: sombra no queixo/mandíbula e bigodinho
      g.save();
      g.beginPath();
      g.rect(0, 150, 256, 106);
      g.clip();
      g.fillStyle = "rgba(55,36,26,0.15)";
      g.beginPath();
      g.ellipse(128, 206, 112, 66, 0, 0, Math.PI * 2);
      g.fill();
      g.restore();
      g.fillStyle = "rgba(55,36,26,0.22)";
      g.beginPath();
      g.ellipse(128, 160, 38, 9, 0, 0, Math.PI * 2);
      g.fill();
    }
    g.strokeStyle = "#2a1c16";
    g.fillStyle = "#1b1410";
    g.lineCap = "round";
    // sobrancelhas
    g.lineWidth = 7;
    g.beginPath();
    g.moveTo(52, 76);
    g.lineTo(100, 70);
    g.moveTo(156, 70);
    g.lineTo(204, 76);
    g.stroke();
    if (rosto === "dormindo") {
      g.lineWidth = 5;
      for (const cx of [80, 176]) {
        g.beginPath();
        g.arc(cx, 104, 20, 0.15 * Math.PI, 0.85 * Math.PI);
        g.stroke();
        for (let k = 0; k < 4; k++) {
          const a = (0.25 + k * 0.17) * Math.PI;
          g.beginPath();
          g.moveTo(cx + Math.cos(a) * 20, 104 + Math.sin(a) * 20);
          g.lineTo(cx + Math.cos(a) * 29, 104 + Math.sin(a) * 29);
          g.stroke();
        }
      }
    } else {
      for (const cx of [80, 176]) {
        g.fillStyle = "#ffffff";
        g.fillRect(cx - 17, 92, 34, 26);
        g.fillStyle = "#1b1410";
        g.fillRect(cx - 8, 95, 16, 22);
        if (batom) {
          // cílios
          g.lineWidth = 4;
          g.strokeStyle = "#1b1410";
          for (let k = 0; k < 3; k++) {
            g.beginPath();
            g.moveTo(cx - 12 + k * 12, 92);
            g.lineTo(cx - 16 + k * 14, 82);
            g.stroke();
          }
        }
      }
    }
    // nariz (traço)
    g.lineWidth = 5;
    g.strokeStyle = "rgba(60,35,25,0.7)";
    g.beginPath();
    g.moveTo(132, 118);
    g.lineTo(120, 158);
    g.lineTo(134, 160);
    g.stroke();
    // boca
    g.strokeStyle = batom ? "#c4182c" : "#5a2018";
    g.lineWidth = batom ? 10 : 7;
    g.beginPath();
    if (rosto === "serio") {
      g.moveTo(100, 198);
      g.lineTo(156, 198);
    } else g.arc(128, 168, 34, 0.25 * Math.PI, 0.75 * Math.PI);
    g.stroke();
  });
  rostoCache.set(chave, t);
  return t;
};

export const Cabeca: React.FC<{ r: Roupa; rosto?: Rosto; tam?: number }> = ({ r, rosto = "aberto", tam = 0.4 }) => {
  const face = useMemo(() => texturaRosto(r.pele, rosto, !!r.batom, !!r.barba), [r.pele, rosto, r.batom, r.barba]);
  const mats = useMemo(() => {
    const pele = new THREE.MeshStandardMaterial({ color: r.pele, roughness: 0.7 });
    const frente = new THREE.MeshStandardMaterial({ map: face, roughness: 0.7 });
    return [pele, pele, pele, pele, frente, pele];
  }, [r.pele, face]);
  const h = tam;
  const cab = r.cabelo;
  const p = r.penteado ?? "curto";
  return (
    <group>
      <mesh material={mats} castShadow>
        <boxGeometry args={[h, h, h]} />
      </mesh>
      {p !== "careca" && (
        <>
          <Cx t={[h * 1.06, h * 0.2, h * 1.06]} p={[0, h * 0.5, -h * 0.02]} c={cab} rug={0.95} />
          <Cx t={[h * 1.06, h * 0.75, h * 0.16]} p={[0, h * 0.2, -h * 0.48]} c={cab} rug={0.95} />
          <Cx t={[h * 0.1, h * 0.42, h * 0.8]} p={[-h * 0.5, h * 0.3, -h * 0.1]} c={cab} rug={0.95} />
          <Cx t={[h * 0.1, h * 0.42, h * 0.8]} p={[h * 0.5, h * 0.3, -h * 0.1]} c={cab} rug={0.95} />
        </>
      )}
      {p === "lateral" && <Cx t={[h * 0.7, h * 0.14, h * 0.25]} p={[h * 0.15, h * 0.44, h * 0.42]} r={[0, 0, -0.12]} c={cab} rug={0.95} />}
      {p === "longoCacheado" && (
        <>
          <Cx t={[h * 1.15, h * 1.5, h * 0.3]} p={[0, -h * 0.2, -h * 0.5]} c={cab} rug={0.95} />
          <Cx t={[h * 0.2, h * 1.2, h * 0.5]} p={[-h * 0.58, -h * 0.1, -h * 0.25]} c={cab} rug={0.95} />
          <Cx t={[h * 0.2, h * 1.2, h * 0.5]} p={[h * 0.58, -h * 0.1, -h * 0.25]} c={cab} rug={0.95} />
          {Array.from({ length: 22 }).map((_, i) => (
            <Cx
              key={i}
              t={[h * 0.3, h * 0.26, h * 0.3]}
              p={[(rnd(`lc${i}`) - 0.5) * h * 1.35, h * (0.62 - rnd(`ly${i}`) * 1.35), -h * (0.25 + rnd(`lz${i}`) * 0.4)]}
              r={[rnd(`lr${i}`) * 0.7, rnd(`ls${i}`), 0]}
              c={new THREE.Color(cab).multiplyScalar(0.8 + rnd(`lk${i}`) * 0.6).getStyle()}
              rug={0.95}
            />
          ))}
        </>
      )}
      {(p === "cacheado" || p === "longoCacheado") &&
        Array.from({ length: 14 }).map((_, i) => (
          <Cx
            key={i}
            t={[h * 0.32, h * 0.26, h * 0.32]}
            p={[(rnd(`cc${i}`) - 0.5) * h * 1.0, h * (0.6 + rnd(`cy${i}`) * 0.18), (rnd(`cz${i}`) - 0.6) * h * 1.0]}
            r={[rnd(`cr${i}`) * 0.6, rnd(`cs${i}`), 0]}
            c={new THREE.Color(cab).multiplyScalar(0.8 + rnd(`ck${i}`) * 0.5).getStyle()}
            rug={0.95}
          />
        ))}
      {p === "grisalho" &&
        Array.from({ length: 10 }).map((_, i) => (
          <Cx key={i} t={[h * 0.3, h * 0.2, h * 0.3]} p={[(rnd(`g${i}`) - 0.5) * h, h * 0.62, (rnd(`gz${i}`) - 0.5) * h]} c={i % 2 ? "#e9e9ec" : "#cfd0d6"} rug={0.95} />
        ))}
      {p === "longo" && <Cx t={[h * 1.1, h * 1.3, h * 0.2]} p={[0, -h * 0.15, -h * 0.5]} c={cab} rug={0.95} />}
      {p === "coque" && <Cx t={[h * 0.4, h * 0.35, h * 0.4]} p={[0, h * 0.72, -h * 0.25]} c={cab} rug={0.95} />}
    </group>
  );
};

export type Acao = "parado" | "andar" | "correr" | "dancar" | "sentado" | "conversar";

export const Gente: React.FC<{
  r: Roupa;
  pos?: V3;
  giroY?: number;
  acao?: Acao;
  t?: number;
  rosto?: Rosto;
  escala?: number;
  fase?: number;
  olharY?: number;
}> = ({ r, pos = [0, 0, 0], giroY = 0, acao = "parado", t = 0, rosto = "aberto", escala = 1, fase = 0, olharY = 0 }) => {
  const s = t + fase;
  const anda = acao === "andar" || acao === "correr";
  const vel = acao === "correr" ? 9 : 5.6;
  const amp = acao === "correr" ? 0.9 : 0.5;
  const passo = anda ? Math.sin(s * vel) * amp : 0;
  const sent = acao === "sentado" || acao === "conversar";
  let bE: [number, number] = [-passo * 0.8, 0.06];
  let bD: [number, number] = [passo * 0.8, 0.06];
  let cotE = anda ? -0.3 : 0;
  let cotD = anda ? -0.3 : 0;
  let quica = anda ? Math.abs(Math.cos(s * vel)) * 0.04 : 0;
  let quadril = 0;
  let cabeca = 0;
  if (acao === "dancar") {
    const b = s * 7.2;
    bE = [-1.2 - Math.sin(b) * 0.7, 0.5 + Math.sin(b * 0.5) * 0.35];
    bD = [-1.3 + Math.sin(b) * 0.7, 0.45 + Math.cos(b * 0.5) * 0.35];
    cotE = -1.1 - Math.sin(b) * 0.5;
    cotD = -1.2 + Math.sin(b) * 0.5;
    quica = Math.abs(Math.sin(b)) * 0.08;
    quadril = Math.sin(b * 0.5) * 0.18;
    cabeca = Math.sin(b * 0.5) * 0.25;
  }
  if (acao === "conversar") {
    const b = s * 2.4;
    bD = [-0.9 + Math.sin(b) * 0.25, 0.2];
    cotD = -0.9 + Math.sin(b * 1.3) * 0.3;
    bE = [-0.5, 0.1];
    cotE = -0.9;
    cabeca = Math.sin(b * 0.7) * 0.15;
  }
  if (sent && acao === "sentado") {
    bE = [-0.5, 0.1];
    bD = [-0.5, 0.1];
    cotE = -0.9;
    cotD = -0.9;
  }
  const camisa = r.terno ? "#1d2433" : r.camisa;
  const braco = r.terno ? "#1d2433" : r.camisa;
  const h = 0.4;
  const pernaY = 0.78;
  return (
    <group position={pos} rotation={[0, giroY, 0]} scale={escala}>
      <group position={[0, quica + (sent ? -0.3 : 0), 0]} rotation={[0, quadril, 0]}>
        {/* pernas */}
        {[-1, 1].map((l) => (
          <group key={l} position={[l * 0.11, pernaY, 0]} rotation={[sent ? -Math.PI / 2 : l * passo, 0, 0]}>
            <Cx t={[0.2, 0.42, 0.22]} p={[0, -0.21, 0]} c={r.vestido ? r.pele : r.calca} />
            {r.short && <Cx t={[0.19, 0.2, 0.21]} p={[0, -0.32, 0]} c={r.pele} />}
            <group position={[0, -0.4, 0]} rotation={[sent ? Math.PI / 2 : Math.max(0, -l * passo) * 0.8, 0, 0]}>
              <Cx t={[0.19, 0.36, 0.21]} p={[0, -0.18, 0]} c={r.vestido || r.short ? r.pele : r.calca} />
              <Cx t={[0.21, 0.09, 0.3]} p={[0, -0.37, 0.04]} c={r.sapato ?? "#f2f2f2"} />
            </group>
          </group>
        ))}
        {r.vestido && <Cx t={[0.56, 0.5, 0.36]} p={[0, pernaY - 0.12, 0]} c={r.camisa} />}
        {/* tronco */}
        {r.top ? (
          <>
            <Cx t={[0.46, 0.18, 0.25]} p={[0, pernaY + 0.09, 0]} c={r.pele} />
            <Cx t={[0.5, 0.44, 0.28]} p={[0, pernaY + 0.4, 0]} c={camisa} />
          </>
        ) : (
          <Cx t={[0.5, 0.62, 0.28]} p={[0, pernaY + 0.31, 0]} c={camisa} />
        )}
        {r.terno && (
          <>
            <Cx t={[0.14, 0.5, 0.02]} p={[0, pernaY + 0.36, 0.14]} c="#f4f4f4" />
            <Cx t={[0.06, 0.4, 0.025]} p={[0, pernaY + 0.36, 0.152]} c={r.gravata ?? "#9b1b2a"} />
          </>
        )}
        {/* braços */}
        {[
          [-1, bE, cotE],
          [1, bD, cotD],
        ].map(([l, g, cot]) => {
          const lado = l as number;
          const giro = g as [number, number];
          return (
            <group key={lado} position={[lado * 0.33, pernaY + 0.58, 0]} rotation={[giro[0], 0, lado * giro[1]]}>
              <Cx t={[0.16, 0.32, 0.18]} p={[0, -0.15, 0]} c={braco} />
              <group position={[0, -0.3, 0]} rotation={[cot as number, 0, 0]}>
                <Cx t={[0.15, 0.26, 0.17]} p={[0, -0.12, 0]} c={braco} />
                <Cx t={[0.14, 0.1, 0.16]} p={[0, -0.3, 0]} c={r.pele} />
              </group>
            </group>
          );
        })}
        {/* pescoço e cabeça */}
        <Cx t={[0.14, 0.08, 0.14]} p={[0, pernaY + 0.66, 0]} c={r.pele} />
        <group position={[0, pernaY + 0.66 + h * 0.5 + 0.03, 0]} rotation={[0, cabeca + olharY, 0]}>
          <Cabeca r={r} rosto={rosto} tam={h} />
        </group>
      </group>
    </group>
  );
};

// roupas sorteadas para multidão
const PELES = ["#f1c9a5", "#d9a066", "#a86b45", "#7a4a2e", "#e8b98f", "#c68642"];
const CABELOS = ["#1a1410", "#3b2416", "#6b4423", "#c9a15a", "#111111", "#8a8a8a"];
const CAMISAS = ["#e63946", "#2a9d8f", "#f4a261", "#264653", "#e9c46a", "#457b9d", "#ffffff", "#8338ec", "#ff6b9a", "#1d3557", "#2b2b2b", "#7cb518"];
const CALCAS = ["#1d3557", "#2b2d42", "#6c757d", "#ffffff", "#b5838d", "#343a40", "#c9b79c"];
export const roupaAleatoria = (k: string): Roupa => {
  const pick = <T,>(l: T[], c: string) => l[Math.floor(rnd(`${k}${c}`) * l.length) % l.length];
  return {
    pele: pick(PELES, "p"),
    cabelo: pick(CABELOS, "c"),
    camisa: pick(CAMISAS, "m"),
    calca: pick(CALCAS, "l"),
    sapato: rnd(`${k}s`) > 0.5 ? "#f2f2f2" : "#222222",
    penteado: pick(["curto", "careca", "longo", "coque", "lateral", "curto"] as const, "h"),
    vestido: rnd(`${k}v`) > 0.85,
  };
};

// ---------------------------------------------------------------------------------------------
// CIDADE À NOITE vista pela janela (prédios com janelas acesas + avenida com faróis)
// ---------------------------------------------------------------------------------------------
const corJanela = (k: string) => (rnd(k) > 0.5 ? "#ffd38a" : rnd(`${k}b`) > 0.5 ? "#ffe9c2" : "#fff1d9");
const texturaFachadaNoite = (sem: string) =>
  texturaCanvas(64, 256, (g) => {
    g.fillStyle = "#1e2333";
    g.fillRect(0, 0, 64, 256);
    for (let y = 0; y < 32; y++)
      for (let x = 0; x < 4; x++) {
        const acesa = rnd(`${sem}-${x}-${y}`) > 0.45;
        g.fillStyle = acesa ? corJanela(`${sem}${x}${y}`) : "#2c3346";
        g.fillRect(4 + x * 15, 3 + y * 8, 9, 5);
      }
  });

export const CidadeNoite: React.FC<{ s: number; centro?: V3; giroY?: number }> = ({ s, centro = [0, 0, 0], giroY = 0 }) => {
  const texs = useMemo(() => [0, 1, 2, 3].map((i) => texturaFachadaNoite(`f${i}`)), []);
  const predios = useMemo(() => {
    const l: { p: V3; t: V3; tex: number; cor: string }[] = [];
    // duas fileiras ao longo da avenida (eixo -z), mais um mar de prédios ao fundo
    for (let i = 0; i < 26; i++) {
      for (const lado of [-1, 1]) {
        // perto ficam abaixo da janela (dá para ver a avenida); longe sobem
        const alt = 8 + Math.min(i, 12) * 2.2 + rnd(`a${i}${lado}`) * 14;
        const larg = 14 + rnd(`l${i}${lado}`) * 10;
        l.push({ p: [lado * (22 + larg / 2), alt / 2, -40 - i * 26], t: [larg, alt, 22], tex: Math.floor(rnd(`t${i}${lado}`) * 4), cor: "#ffffff" });
      }
    }
    for (let i = 0; i < 70; i++) {
      const x = (rnd(`fx${i}`) - 0.5) * 900;
      const z = -420 - rnd(`fz${i}`) * 500;
      const alt = 40 + rnd(`fa${i}`) ** 2 * 200;
      l.push({ p: [x, alt / 2, z], t: [26 + rnd(`fl${i}`) * 20, alt, 26], tex: i % 4, cor: "#c9d0ff" });
    }
    return l;
  }, []);
  return (
    <group position={centro} rotation={[0, giroY, 0]}>
      {predios.map((b, i) => (
        <mesh key={i} position={b.p}>
          <boxGeometry args={b.t} />
          <meshStandardMaterial
            color="#ffffff"
            map={texs[b.tex]}
            emissiveMap={texs[b.tex]}
            emissive={b.cor}
            emissiveIntensity={0.9}
            roughness={0.9}
          />
        </mesh>
      ))}
      {/* arranha-céu iluminado (tipo Empire State) */}
      <group position={[-60, 0, -520]}>
        <Cx t={[40, 180, 40]} p={[0, 90, 0]} c="#ffffff" e="#e2e6ff" ei={0.55} />
        <Cx t={[26, 50, 26]} p={[0, 205, 0]} c="#ffffff" e="#e2e6ff" ei={0.65} />
        <Cx t={[10, 40, 10]} p={[0, 250, 0]} c="#ffffff" e="#ffffff" ei={0.9} />
      </group>
      <group position={[140, 0, -600]}>
        <Cx t={[34, 150, 34]} p={[0, 75, 0]} c="#ffffff" e="#d9defc" ei={0.5} />
        <Cx t={[4, 40, 4]} p={[0, 170, 0]} c="#ffffff" e="#ffffff" ei={1} />
      </group>
      {/* avenida */}
      <Cx t={[40, 0.2, 1400]} p={[0, 0, -700]} c="#20232c" sombra={false} />
      <Cx t={[3, 0.5, 1400]} p={[0, 0.2, -700]} c="#2c5a2e" sombra={false} />
      {/* faróis (brancos vindo) e lanternas (vermelhas indo) */}
      {Array.from({ length: 90 }).map((_, i) => {
        const vindo = i % 2 === 0;
        const base = rnd(`car${i}`) * 1400;
        const z = vindo ? -1400 + ((base + s * 14) % 1400) : -((base + s * 12) % 1400);
        const x = (vindo ? -1 : 1) * (5 + (rnd(`cx${i}`) > 0.5 ? 6 : 0));
        return (
          <group key={i} position={[x, 1, z]}>
            <mesh>
              <boxGeometry args={[2.2, 0.8, 3.4]} />
              <meshBasicMaterial color={vindo ? new THREE.Color("#fff3d6").multiplyScalar(2.2) : new THREE.Color("#ff3b30").multiplyScalar(2.4)} toneMapped={false} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

// céu de noite azul profundo com estrelinhas (pano de fundo grande)
export const CeuNoite: React.FC<{ raio?: number }> = ({ raio = 1800 }) => {
  const tex = useMemo(
    () =>
      texturaCanvas(16, 512, (g) => {
        const gr = g.createLinearGradient(0, 0, 0, 512);
        gr.addColorStop(0, "#0c1a5c");
        gr.addColorStop(0.4, "#1d3796");
        gr.addColorStop(0.5, "#3550b4");
        gr.addColorStop(1, "#2a2f6a");
        g.fillStyle = gr;
        g.fillRect(0, 0, 16, 512);
      }),
    [],
  );
  const estrelas = useMemo(() => {
    const n = 220;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const a = rnd(`ea${i}`) * Math.PI * 2;
      const y = 0.08 + rnd(`ey${i}`) * 0.9;
      const c = Math.sqrt(1 - y * y);
      pos.set([Math.cos(a) * c * raio * 0.95, y * raio * 0.95, Math.sin(a) * c * raio * 0.95], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, [raio]);
  return (
    <group>
      <mesh>
        <sphereGeometry args={[raio, 32, 16]} />
        <meshBasicMaterial map={tex} side={THREE.BackSide} fog={false} toneMapped={false} />
      </mesh>
      <points geometry={estrelas}>
        <pointsMaterial color="#ffffff" size={3} sizeAttenuation={false} fog={false} toneMapped={false} />
      </points>
    </group>
  );
};

// céu de dia (gradiente + nuvens achatadas), para Barcelona, Roma, Gizé, Washington
export const CeuDia: React.FC<{ raio?: number; topo?: string; horizonte?: string; nuvens?: number }> = ({
  raio = 3000,
  topo = "#3f7fd6",
  horizonte = "#cfe2f2",
  nuvens = 40,
}) => {
  const tex = useMemo(
    () =>
      texturaCanvas(16, 512, (g) => {
        const gr = g.createLinearGradient(0, 0, 0, 512);
        gr.addColorStop(0, topo);
        gr.addColorStop(0.42, new THREE.Color(topo).lerp(new THREE.Color(horizonte), 0.55).getStyle());
        gr.addColorStop(0.5, horizonte);
        gr.addColorStop(1, horizonte);
        g.fillStyle = gr;
        g.fillRect(0, 0, 16, 512);
      }),
    [topo, horizonte],
  );
  const nuvemTex = useMemo(
    () =>
      texturaCanvas(256, 128, (g) => {
        for (let i = 0; i < 14; i++) {
          const x = 40 + rnd(`nx${i}`) * 176;
          const y = 50 + rnd(`ny${i}`) * 40;
          const r = 18 + rnd(`nr${i}`) * 30;
          const gr = g.createRadialGradient(x, y, 0, x, y, r);
          gr.addColorStop(0, "rgba(255,255,255,0.95)");
          gr.addColorStop(1, "rgba(255,255,255,0)");
          g.fillStyle = gr;
          g.beginPath();
          g.arc(x, y, r, 0, Math.PI * 2);
          g.fill();
        }
      }),
    [],
  );
  return (
    <group>
      <mesh>
        <sphereGeometry args={[raio, 32, 16]} />
        <meshBasicMaterial map={tex} side={THREE.BackSide} fog={false} toneMapped={false} />
      </mesh>
      {Array.from({ length: nuvens }).map((_, i) => {
        const a = rnd(`na${i}`) * Math.PI * 2;
        const el = 0.08 + rnd(`ne${i}`) * 0.5;
        const d = raio * 0.8;
        const pos: V3 = [Math.cos(a) * Math.cos(el) * d, Math.sin(el) * d, Math.sin(a) * Math.cos(el) * d];
        const tam = (120 + rnd(`ns${i}`) * 260) * (1 - el * 0.5);
        return (
          <mesh key={i} position={pos} onUpdate={(m) => m.lookAt(0, 0, 0)}>
            <planeGeometry args={[tam * 2, tam * 0.7]} />
            <meshBasicMaterial map={nuvemTex} transparent depthWrite={false} fog={false} opacity={0.9} toneMapped={false} />
          </mesh>
        );
      })}
    </group>
  );
};
