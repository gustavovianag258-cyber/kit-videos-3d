import { RoundedBox } from "@react-three/drei";
import { useMemo } from "react";
import { random } from "remotion";
import * as THREE from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { Boneco, Visual } from "../Boneco";
import { AnimacaoMixamo } from "../Mixamo";

// Peças de cenário reaproveitáveis (estilo Culturaverso: formas simples e arredondadas, cores sólidas
// e vivas, muito detalhe pequeno). Tudo determinístico: aleatório só com semente (random do Remotion).

export type V3 = [number, number, number];
export const sorteio = (chave: string) => random(chave);
export const escolher = <T,>(lista: readonly T[], chave: string) => lista[Math.floor(random(chave) * lista.length) % lista.length];

// ---------- gente ----------

const PELES = ["#f1c9a5", "#e8b896", "#d9a07a", "#c98e6a", "#a86e4c", "#8d5a3c", "#6e4532", "#5e3a28", "#4e3022"] as const;
const CAMISAS = ["#ff7a2f", "#f2c230", "#e63946", "#2a9d8f", "#3f7fc8", "#ffffff", "#8338ec", "#06d6a0", "#ffd6e7", "#1d3557", "#f4a261", "#ffb4a2", "#90be6d"] as const;
const CALCAS = ["#2f5f9e", "#3b3b3b", "#4a6fa5", "#22223b", "#c2b280", "#118ab2", "#5c4033", "#6c757d"] as const;
const CABELOS_H = ["curto", "curto", "raspado", "black", "careca", "bone"] as const;
const CABELOS_M = ["longo", "coque", "trancas", "rabo", "black", "curto"] as const;
const CORES_CABELO = ["#1a120c", "#2a1c14", "#3b2214", "#4a2c1c", "#6b4226", "#15100c", "#8a6a4a"] as const;

// Pessoa sorteada pela semente (mesma semente = mesma pessoa sempre)
export const pessoaAleatoria = (semente: string): Visual => {
  const k = (s: string) => `${semente}-${s}`;
  const mulher = random(k("m")) < 0.5;
  const v: Visual = {
    corpo: mulher ? "mulher" : "homem",
    pele: escolher(PELES, k("p")),
    cabelo: mulher ? escolher(CABELOS_M, k("c")) : escolher(CABELOS_H, k("c")),
    corCabelo: escolher(CORES_CABELO, k("cc")),
    camisa: escolher(CAMISAS, k("cam")),
    manga: random(k("mg")) < 0.25 ? "regata" : random(k("mg2")) < 0.15 ? "longa" : "curta",
    calca: escolher(CALCAS, k("cal")),
    perna: random(k("pr")) < 0.3 ? "calca" : mulher && random(k("pr2")) < 0.5 ? "short" : "bermuda",
    peso: 0.95 + random(k("pe")) * 0.25,
    barba: !mulher && random(k("b")) < 0.35,
    brinco: mulher && random(k("br")) < 0.5,
    corBone: escolher(CAMISAS, k("bo")),
  };
  if (random(k("li")) < 0.15) v.listras = escolher(CAMISAS, k("li2"));
  if (mulher && random(k("v")) < 0.2) v.vestido = escolher(CAMISAS, k("vv"));
  return v;
};

// Alguém andando de um ponto a outro em loop (entra de novo no começo quando chega no fim)
export const Passante: React.FC<{ semente: string; de: [number, number]; para: [number, number]; t: number; vel?: number; correndo?: boolean; visual?: Visual; y?: number }> = ({
  semente,
  de,
  para,
  t,
  vel = 1.3,
  correndo,
  visual,
  y = 0, // altura do chão (calçada = 0,16)
}) => {
  const dx = para[0] - de[0];
  const dz = para[1] - de[1];
  const L = Math.hypot(dx, dz);
  const ini = random(`${semente}-ini`) * L;
  const d = (ini + t * vel) % L;
  const v = visual ?? pessoaAleatoria(semente);
  return (
    <Boneco
      visual={v}
      animacao={correndo ? "running" : "walking"}
      t={t + random(`${semente}-fase`) * 3}
      velocidade={correndo ? 1 : vel / 1.3}
      pos={[de[0] + (dx * d) / L, y, de[1] + (dz * d) / L]}
      giroY={Math.atan2(dx, dz)}
      altura={v.corpo === "mulher" ? 1.6 + random(`${semente}-h`) * 0.1 : 1.7 + random(`${semente}-h`) * 0.12}
      semente={Math.floor(random(`${semente}-s`) * 20)}
    />
  );
};

// Alguém parado fazendo alguma coisa (conversando, mexendo no celular, rindo…)
export const Parado: React.FC<{ semente: string; pos: V3; giroY?: number; t: number; animacao?: AnimacaoMixamo; visual?: Visual; falando?: boolean }> = ({
  semente,
  pos,
  giroY = 0,
  t,
  animacao,
  visual,
  falando,
}) => {
  const v = visual ?? pessoaAleatoria(semente);
  const anim = animacao ?? escolher(["idle", "talking", "texting-while-standing", "laughing", "idle", "talking"] as const, `${semente}-a`);
  return (
    <Boneco
      visual={v}
      animacao={anim}
      t={t + random(`${semente}-fase`) * 4}
      pos={pos}
      giroY={giroY}
      altura={v.corpo === "mulher" ? 1.6 + random(`${semente}-h`) * 0.1 : 1.7 + random(`${semente}-h`) * 0.12}
      falando={falando ?? anim === "talking"}
      semente={Math.floor(random(`${semente}-s`) * 20)}
    />
  );
};

// ---------- materiais ----------

// Janelas desenhadas pelo próprio material, pela posição no mundo: não esticam em prédio alto ou baixo.
// À noite parte delas acende (amarelo quente).
export const materialPredio = (noite: boolean, opts: { andar?: number; vao?: number; telhado?: string } = {}) => {
  const { andar = 3, vao = 2.6, telhado = "#8f8a84" } = opts;
  const m = new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0 });
  m.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vMundo;\nvarying vec3 vNormMundo;")
      .replace(
        "#include <worldpos_vertex>",
        `#include <worldpos_vertex>
        vec4 pm = vec4(transformed, 1.0);
        #ifdef USE_INSTANCING
          pm = instanceMatrix * pm;
        #endif
        pm = modelMatrix * pm;
        vMundo = pm.xyz;
        mat3 nm = mat3(modelMatrix);
        #ifdef USE_INSTANCING
          nm = nm * mat3(instanceMatrix);
        #endif
        vNormMundo = normalize(nm * objectNormal);`,
      );
    sh.fragmentShader = sh.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vMundo;\nvarying vec3 vNormMundo;\nfloat hash13(vec3 p){ p = fract(p * 0.1031); p += dot(p, p.zyx + 31.32); return fract((p.x + p.y) * p.z); }")
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        float lateral = 1.0 - step(0.5, abs(vNormMundo.y));
        float horiz = abs(vNormMundo.x) > 0.5 ? vMundo.z : vMundo.x;
        vec2 cel = vec2(horiz / ${vao.toFixed(2)}, (vMundo.y - 0.6) / ${andar.toFixed(2)});
        vec2 f = fract(cel);
        float janela = step(0.22, f.x) * step(f.x, 0.78) * step(0.3, f.y) * step(f.y, 0.8) * lateral * step(1.2, vMundo.y);
        float acesa = step(0.55, hash13(vec3(floor(cel), floor(vMundo.x * 0.1 + vMundo.z * 0.1))));
        vec3 vidro = mix(vec3(0.16, 0.24, 0.32), vec3(0.42, 0.55, 0.66), f.y);
        diffuseColor.rgb = mix(diffuseColor.rgb, vidro, janela * 0.9);
        // laje / telhado
        diffuseColor.rgb = mix(diffuseColor.rgb, ${new THREE.Color(telhado).toArray().map((x) => x.toFixed(3)).join(" ,").replace(/^/, "vec3(")}), step(0.5, vNormMundo.y));
        float luzJanela = janela * acesa;`,
      )
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
        totalEmissiveRadiance += vec3(1.0, 0.72, 0.38) * luzJanela * ${noite ? "1.6" : "0.0"};`,
      );
  };
  m.customProgramCacheKey = () => `predio-${noite}-${andar}-${vao}-${telhado}`;
  return m;
};

// ---------- peças ----------

export const Arvore: React.FC<{ pos: V3; tam?: number; semente: string; cor?: string }> = ({ pos, tam = 1, semente, cor }) => {
  const copa = useMemo(() => {
    // copa lisa (sem facetas): junta os vértices repetidos antes de deformar e calcular normais
    const g = mergeVertices(new THREE.IcosahedronGeometry(1, 4).deleteAttribute("normal").deleteAttribute("uv"));
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const v = new THREE.Vector3().fromBufferAttribute(p, i);
      const n = 1 + 0.12 * Math.sin(v.x * 4 + random(`${semente}a`) * 6) * Math.sin(v.y * 5) * Math.sin(v.z * 4.5);
      v.multiplyScalar(n);
      p.setXYZ(i, v.x, v.y, v.z);
    }
    g.computeVertexNormals();
    return g;
  }, [semente]);
  const verde = cor ?? escolher(["#4f8a3a", "#5c9a3f", "#3f7a34", "#6aa84f"] as const, `${semente}v`);
  const bolas: [number, number, number, number][] = [
    [0, 3.4, 0, 1.6],
    [0.9, 3.0, 0.3, 1.1],
    [-0.8, 3.1, -0.2, 1.15],
    [0.1, 4.2, -0.3, 1.05],
  ];
  return (
    <group position={pos} scale={tam}>
      <mesh position={[0, 1.3, 0]} castShadow>
        <cylinderGeometry args={[0.13, 0.2, 2.6, 10]} />
        <meshStandardMaterial color="#7a5a3c" roughness={0.95} />
      </mesh>
      {bolas.map(([x, y, z, r], i) => (
        <mesh key={i} geometry={copa} position={[x, y, z]} scale={r} castShadow receiveShadow>
          <meshStandardMaterial color={new THREE.Color(verde).multiplyScalar(0.9 + i * 0.06)} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
};

// Carro popular arredondado: carroceria, vidros escuros (para-brisa inclinado, laterais), rodas com
// calota, caixa de roda escura, para-choques, retrovisores, faróis, lanternas e placa.
export const Carro: React.FC<{ pos: V3; giroY?: number; cor?: string; semente?: string; farolAceso?: boolean }> = ({ pos, giroY = 0, cor, semente = "c", farolAceso }) => {
  const c = cor ?? escolher(["#c1121f", "#1d3557", "#f1f1f1", "#2b2d42", "#e9c46a", "#8d99ae", "#3a5a40", "#b08d57", "#d8d8d8"] as const, `${semente}cor`);
  const placa = useMemo(
    () =>
      texturaCanvas(128, 40, (ctx) => {
        ctx.fillStyle = "#f4f4f4";
        ctx.fillRect(0, 0, 128, 40);
        ctx.fillStyle = "#1d4fa3";
        ctx.fillRect(0, 0, 128, 9);
        ctx.fillStyle = "#111";
        ctx.font = "bold 22px Arial";
        ctx.textAlign = "center";
        ctx.fillText(`RIO${Math.floor(random(`${semente}pl`) * 9)}A${Math.floor(random(`${semente}p2`) * 90 + 10)}`, 64, 34);
      }),
    [semente],
  );
  const vidro = <meshPhysicalMaterial color="#17212b" roughness={0.05} metalness={0.3} clearcoat={1} />;
  const pintura = <meshPhysicalMaterial color={c} roughness={0.32} clearcoat={0.9} clearcoatRoughness={0.15} />;
  const plasticoEscuro = <meshStandardMaterial color="#2a2a2c" roughness={0.7} />;
  return (
    <group position={pos} rotation={[0, giroY, 0]}>
      {/* carroceria de baixo + capô e porta-malas */}
      <RoundedBox args={[1.72, 0.62, 3.9]} radius={0.22} smoothness={5} position={[0, 0.62, 0]} castShadow receiveShadow>
        {pintura}
      </RoundedBox>
      {/* cabine (teto na cor do carro) */}
      <RoundedBox args={[1.56, 0.58, 2.0]} radius={0.2} smoothness={5} position={[0, 1.16, -0.3]} castShadow>
        {pintura}
      </RoundedBox>
      {/* vidros: para-brisa inclinado, traseiro e laterais */}
      <mesh position={[0, 1.13, 0.72]} rotation={[-0.55, 0, 0]}>
        <boxGeometry args={[1.4, 0.62, 0.02]} />
        {vidro}
      </mesh>
      <mesh position={[0, 1.15, -1.32]} rotation={[0.45, 0, 0]}>
        <boxGeometry args={[1.36, 0.5, 0.02]} />
        {vidro}
      </mesh>
      {[-1, 1].map((l) =>
        [0.25, -0.75].map((z) => (
          <mesh key={`${l}${z}`} position={[l * 0.785, 1.17, z]}>
            <boxGeometry args={[0.02, 0.4, 0.85]} />
            {vidro}
          </mesh>
        )),
      )}
      {/* para-choques */}
      {[1.98, -1.98].map((z) => (
        <RoundedBox key={z} args={[1.76, 0.22, 0.16]} radius={0.06} position={[0, 0.42, z]} castShadow>
          {plasticoEscuro}
        </RoundedBox>
      ))}
      {/* rodas: pneu + calota + caixa de roda */}
      {[[-0.8, 1.25], [0.8, 1.25], [-0.8, -1.25], [0.8, -1.25]].map(([x, z], i) => (
        <group key={i} position={[x, 0.32, z]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.32, 0.32, 0.22, 24]} />
            <meshStandardMaterial color="#161616" roughness={0.85} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]} position={[x > 0 ? 0.115 : -0.115, 0, 0]}>
            <cylinderGeometry args={[0.19, 0.19, 0.02, 20]} />
            <meshStandardMaterial color="#c9ccd0" metalness={0.8} roughness={0.3} />
          </mesh>
        </group>
      ))}
      {/* retrovisores */}
      {[-1, 1].map((l) => (
        <RoundedBox key={l} args={[0.16, 0.1, 0.12]} radius={0.03} position={[l * 0.93, 1.0, 0.55]} castShadow>
          {pintura}
        </RoundedBox>
      ))}
      {/* faróis, lanternas e placas */}
      {[-0.6, 0.6].map((x) => (
        <RoundedBox key={x} args={[0.34, 0.14, 0.05]} radius={0.02} position={[x, 0.74, 1.95]}>
          <meshStandardMaterial color="#fff6dc" emissive="#fff1c8" emissiveIntensity={farolAceso ? 3 : 0.15} roughness={0.2} />
        </RoundedBox>
      ))}
      {[-0.62, 0.62].map((x) => (
        <RoundedBox key={`t${x}`} args={[0.3, 0.14, 0.05]} radius={0.02} position={[x, 0.76, -1.95]}>
          <meshStandardMaterial color="#9a0016" emissive="#ff1a2e" emissiveIntensity={farolAceso ? 2 : 0.25} roughness={0.2} />
        </RoundedBox>
      ))}
      {[2.07, -2.07].map((z) => (
        <mesh key={`p${z}`} position={[0, 0.5, z]} rotation={[0, z < 0 ? Math.PI : 0, 0]}>
          <planeGeometry args={[0.4, 0.13]} />
          <meshStandardMaterial map={placa} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
};

// Poste de concreto com braço e luminária (acende à noite)
export const Poste: React.FC<{ pos: V3; giroY?: number; aceso?: boolean }> = ({ pos, giroY = 0, aceso }) => (
  <group position={pos} rotation={[0, giroY, 0]}>
    <mesh position={[0, 4.2, 0]} castShadow>
      <cylinderGeometry args={[0.09, 0.14, 8.4, 8]} />
      <meshStandardMaterial color="#a8a29a" roughness={0.9} />
    </mesh>
    <mesh position={[0, 7.4, 0]} castShadow>
      <boxGeometry args={[0.1, 0.1, 1.6]} />
      <meshStandardMaterial color="#8a857e" />
    </mesh>
    <mesh position={[0, 7.9, 0.9]} rotation={[0.4, 0, 0]} castShadow>
      <cylinderGeometry args={[0.04, 0.04, 1.3, 6]} />
      <meshStandardMaterial color="#7a756e" />
    </mesh>
    <mesh position={[0, 8.15, 1.45]}>
      <boxGeometry args={[0.3, 0.12, 0.55]} />
      <meshStandardMaterial color="#e8e2d0" emissive="#ffd28a" emissiveIntensity={aceso ? 6 : 0} />
    </mesh>
    {aceso && <pointLight position={[0, 7.8, 1.45]} color="#ffc87a" intensity={60} distance={18} decay={2} />}
  </group>
);

// Fios entre postes (catenária: barriga no meio)
export const Fios: React.FC<{ pontos: V3[]; alturas?: number[]; barriga?: number }> = ({ pontos, alturas = [7.4, 7.0, 6.6], barriga = 0.45 }) => {
  const geos = useMemo(() => {
    const gs: THREE.BufferGeometry[] = [];
    for (const [k, h] of alturas.entries())
      for (let i = 0; i < pontos.length - 1; i++) {
        const a = pontos[i];
        const b = pontos[i + 1];
        const off = (k - 1) * 0.35;
        const pts = Array.from({ length: 13 }, (_, j) => {
          const t = j / 12;
          return new THREE.Vector3(a[0] + (b[0] - a[0]) * t + off, h - barriga * 4 * t * (1 - t), a[2] + (b[2] - a[2]) * t);
        });
        gs.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.018, 4));
      }
    return gs;
  }, [pontos, alturas, barriga]);
  return (
    <>
      {geos.map((g, i) => (
        <mesh key={i} geometry={g}>
          <meshStandardMaterial color="#141414" roughness={0.7} />
        </mesh>
      ))}
    </>
  );
};

// Morro (tipo Pão de Açúcar / Dois Irmãos / Urca): paredão de granito com estrias escorridas pela
// encosta e mata com copas nas partes menos íngremes. `pedra` (0…1) = quanto do morro é rocha nua.
// Tudo nas cores dos vértices (malha bem densa): sem textura esticada.
export const Morro: React.FC<{ pos: V3; raio: number; altura: number; semente: string; pedra?: number; giroY?: number }> = ({ pos, raio, altura, semente, pedra = 0.5, giroY = 0 }) => {
  const geo = useMemo(() => {
    const g = new THREE.SphereGeometry(1, 360, 120, 0, Math.PI * 2, 0, Math.PI / 2);
    const p = g.attributes.position;
    const uv = g.attributes.uv;
    const cores: number[] = [];
    const s1 = random(`${semente}1`) * 10;
    const verde = new THREE.Color("#2b4f26");
    const verde2 = new THREE.Color("#4a7636");
    const rochaClara = new THREE.Color("#a8968a");
    const rochaEscura = new THREE.Color("#5e534d");
    const c = new THREE.Color();
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      const y = p.getY(i);
      const z = p.getZ(i);
      const u = uv.getX(i) * Math.PI * 2;
      const ruido = 1 + 0.1 * Math.sin(x * 5 + s1) * Math.cos(z * 4 - s1) + 0.05 * Math.sin(x * 13 + z * 11 + s1);
      // íngreme no meio da encosta; no alto e no pé a mata segura (borda irregular)
      const ingreme = 1 - Math.abs(y - 0.5) * 2.1;
      const borda = 0.3 * Math.sin(x * 9 + s1) * Math.sin(z * 7) + 0.15 * Math.sin(x * 23 - z * 19) + 0.08 * Math.sin(u * 60 + y * 9);
      const k = THREE.MathUtils.clamp(ingreme * (0.4 + pedra) + borda, 0, 1);
      const ehPedra = k > 0.5;
      const copas = ehPedra ? 0 : 0.012 * (Math.sin(x * 61 + s1) * Math.sin(z * 57) + Math.sin(x * 97 - z * 89 + s1) * 0.6);
      const yy = Math.pow(y, 0.6);
      p.setXYZ(i, x * raio * (ruido + copas), yy * altura * (1 + copas * 2), z * raio * (ruido + copas));
      if (ehPedra) {
        // estrias: faixas finas que descem a encosta (variam com o ângulo, quase não com a altura)
        const estria = 0.5 + 0.25 * Math.sin(u * 173 + s1) + 0.15 * Math.sin(u * 61 + y * 3) + 0.1 * Math.sin(u * 397 + y * 7);
        c.copy(rochaEscura).lerp(rochaClara, THREE.MathUtils.clamp(estria, 0, 1));
        // manchas de mato agarrado na pedra
        if (Math.sin(u * 37 + s1) * Math.sin(y * 23) > 0.82) c.copy(verde);
      } else {
        const salpico = 0.5 + 0.5 * Math.sin(x * 83 + z * 71 + s1) * Math.sin(x * 31 - z * 43);
        c.copy(verde).lerp(verde2, salpico);
      }
      cores.push(c.r, c.g, c.b);
    }
    g.setAttribute("color", new THREE.Float32BufferAttribute(cores, 3));
    g.computeVertexNormals();
    return g;
  }, [raio, altura, semente, pedra]);
  return (
    <mesh geometry={geo} position={pos} rotation={[0, giroY, 0]} receiveShadow castShadow>
      <meshStandardMaterial vertexColors roughness={0.92} />
    </mesh>
  );
};

// Textura de canvas reaproveitável (letreiros, rótulos, pisos)
export const texturaCanvas = (l: number, a: number, desenhar: (ctx: CanvasRenderingContext2D) => void, repetir = false) => {
  const c = document.createElement("canvas");
  c.width = l;
  c.height = a;
  desenhar(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  if (repetir) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
};

// Letreiro de loja (placa com nome), com luz própria à noite
export const Letreiro: React.FC<{ pos: V3; texto: string; fundo?: string; cor?: string; largura?: number; giroY?: number; aceso?: boolean }> = ({
  pos,
  texto,
  fundo = "#f2c230",
  cor = "#b3261e",
  largura = 3,
  giroY = 0,
  aceso,
}) => {
  const tex = useMemo(
    () =>
      texturaCanvas(512, 96, (ctx) => {
        ctx.fillStyle = fundo;
        ctx.fillRect(0, 0, 512, 96);
        ctx.fillStyle = cor;
        ctx.font = "bold 58px 'Arial Rounded MT Bold', Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(texto, 256, 52);
      }),
    [texto, fundo, cor],
  );
  return (
    <mesh position={pos} rotation={[0, giroY, 0]} castShadow>
      <boxGeometry args={[largura, largura * (96 / 512), 0.08]} />
      <meshStandardMaterial map={tex} emissiveMap={tex} emissive="#ffffff" emissiveIntensity={aceso ? 0.9 : 0.05} roughness={0.6} />
    </mesh>
  );
};
