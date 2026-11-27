import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Gente, rnd, roupaAleatoria, texturaCanvas } from "./pecas";
import type { V3 } from "./tempo";

// Peças de cidade de dia vista do alto (quarteirões instanciados, árvores, carros) e fachadas de rua.

type Inst = { p: V3; t: V3; r?: number; cor: string };

export const Instancias: React.FC<{ itens: Inst[]; material: THREE.Material; geo?: THREE.BufferGeometry; sombra?: boolean }> = ({ itens, material, geo, sombra = true }) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const g = useMemo(() => geo ?? new THREE.BoxGeometry(1, 1, 1), [geo]);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    itens.forEach((it, i) => {
      o.position.set(...it.p);
      o.rotation.set(0, it.r ?? 0, 0);
      o.scale.set(...it.t);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      m.setColorAt(i, new THREE.Color(it.cor));
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    m.computeBoundingSphere();
  }, [itens]);
  return <instancedMesh ref={ref} args={[g, material, itens.length]} castShadow={sombra} receiveShadow />;
};

const CORES_BCN = ["#e4cfa8", "#d8b88c", "#e2ab92", "#cf9a66", "#efe6d6", "#c4b7a6", "#e8c9a0", "#c98f6e", "#f0d3a6", "#b9a48a", "#e6bfae", "#d4c49c"];

// Fachada desenhada no próprio material, pela posição no mundo (não estica): janelas com
// venezianas de madeira dos lados, sacada de ferro embaixo de cada janela, térreo de loja escuro,
// sujeira subindo do chão e telhado/terraço variando entre telha, cinza e branco.
export const materialFachada = (opts: { andar?: number; vao?: number } = {}) => {
  const { andar = 3.2, vao = 3.4 } = opts;
  const m = new THREE.MeshStandardMaterial({ roughness: 0.88, metalness: 0 });
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
      .replace("#include <common>", "#include <common>\nvarying vec3 vMundo;\nvarying vec3 vNormMundo;\nfloat h13(vec3 p){ p = fract(p * 0.1031); p += dot(p, p.zyx + 31.32); return fract((p.x + p.y) * p.z); }")
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        vec3 nmw = normalize(vNormMundo);
        float lateral = 1.0 - step(0.5, abs(nmw.y));
        vec3 tg = normalize(cross(vec3(0.0, 1.0, 0.0), nmw) + vec3(1e-4));
        float horiz = dot(vMundo, tg);
        vec2 cel = vec2(horiz / ${vao.toFixed(2)}, (vMundo.y - 0.4) / ${andar.toFixed(2)});
        vec2 f = fract(cel);
        float acima = step(1.0, floor(cel.y));
        float jan = step(0.33, f.x) * step(f.x, 0.67) * step(0.22, f.y) * step(f.y, 0.86) * lateral * acima;
        float ven = (step(0.2, f.x) * step(f.x, 0.32) + step(0.68, f.x) * step(f.x, 0.8)) * step(0.22, f.y) * step(f.y, 0.86) * lateral * acima;
        float sac = step(0.16, f.x) * step(f.x, 0.84) * step(0.16, f.y) * step(f.y, 0.26) * lateral * acima;
        float grade = sac * step(0.5, fract(f.x * 22.0));
        float cornija = step(0.93, f.y) * lateral * acima;
        float hb = h13(floor(vMundo * 0.05));
        vec3 corVen = mix(vec3(0.22, 0.38, 0.27), vec3(0.42, 0.28, 0.18), step(0.6, hb));
        vec3 vidro = mix(vec3(0.10, 0.12, 0.15), vec3(0.30, 0.38, 0.46), f.y * 0.8);
        diffuseColor.rgb *= 1.0 - cornija * 0.12;
        diffuseColor.rgb = mix(diffuseColor.rgb, corVen, ven * 0.92);
        diffuseColor.rgb = mix(diffuseColor.rgb, vidro, jan);
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.1, 0.1, 0.11), max(grade, sac * 0.35));
        float terreo = (1.0 - acima) * lateral;
        float vitrine = terreo * step(0.12, f.x) * step(f.x, 0.88) * step(0.08, f.y) * step(f.y, 0.78);
        diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * 0.55, terreo);
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.16, 0.2, 0.24), vitrine);
        diffuseColor.rgb *= 0.86 + 0.14 * smoothstep(0.0, 6.0, vMundo.y);
        float teto = step(0.5, nmw.y);
        float ht = h13(floor(vMundo * 0.04) + 7.0);
        vec3 corTeto = ht < 0.35 ? vec3(0.72, 0.42, 0.3) : ht < 0.7 ? vec3(0.68, 0.66, 0.62) : vec3(0.88, 0.86, 0.82);
        float telha = step(0.5, fract(vMundo.x * 1.2 + vMundo.z * 1.2)) * step(ht, 0.35) * 0.12;
        diffuseColor.rgb = mix(diffuseColor.rgb, corTeto * (1.0 - telha), teto);`,
      );
  };
  m.customProgramCacheKey = () => `fachada-${andar}-${vao}`;
  return m;
};

// Chão das ruas do Eixample (1 ladrilho = 1 quarteirão de 133 m): asfalto, calçada larga em volta
// do quarteirão chanfrado, faixas de pedestre e o tracejado no meio da rua
const texturaRuas = (n: number) =>
  texturaCanvas(
    512,
    512,
    (g) => {
      const k = 512 / 133;
      g.fillStyle = "#4e5156";
      g.fillRect(0, 0, 512, 512);
      const oct = (meio: number, ch: number, cor: string) => {
        const c = 256;
        g.fillStyle = cor;
        g.beginPath();
        g.moveTo(c - meio + ch, c - meio);
        g.lineTo(c + meio - ch, c - meio);
        g.lineTo(c + meio, c - meio + ch);
        g.lineTo(c + meio, c + meio - ch);
        g.lineTo(c + meio - ch, c + meio);
        g.lineTo(c - meio + ch, c + meio);
        g.lineTo(c - meio, c + meio - ch);
        g.lineTo(c - meio, c - meio + ch);
        g.closePath();
        g.fill();
      };
      oct(62 * k, 24 * k, "#b8b0a2");
      oct(56.5 * k, 20 * k, "#8f8a80");
      g.fillStyle = "#e8e6e0";
      for (let i = 0; i < 6; i++) {
        const a = 256 + (-30 + i * 6) * k * 0.5;
        g.fillRect(a, 0, 5, 18);
        g.fillRect(a, 494, 5, 18);
        g.fillRect(0, a, 18, 5);
        g.fillRect(494, a, 18, 5);
      }
      g.fillStyle = "#d9d6cc";
      for (let i = 0; i < 512; i += 26) {
        g.fillRect(i, 0, 12, 1.5);
        g.fillRect(0, i, 1.5, 12);
      }
    },
    [n, n],
  );

// Eixample: quarteirões octogonais (113 m, cantos chanfrados) com pátio arborizado, telhados cheios
// de coisas (casinhas, caixas d'água, placas solares, antenas), árvores nas duas calçadas e o chão
// das ruas desenhado
export const Eixample: React.FC<{ centro: V3; n?: number; buraco?: [number, number, number] }> = ({ centro, n = 9, buraco }) => {
  const mat = useMemo(() => materialFachada(), []);
  const chao = useMemo(() => texturaRuas(2 * n + 1), [n]);
  const { predios, casinhas, placas, antenas, arvores, patios, patioArv } = useMemo(() => {
    const predios: Inst[] = [];
    const casinhas: Inst[] = [];
    const placas: Inst[] = [];
    const antenas: Inst[] = [];
    const arvores: Inst[] = [];
    const patios: Inst[] = [];
    const patioArv: Inst[] = [];
    const passo = 133;
    for (let i = -n; i <= n; i++)
      for (let j = -n; j <= n; j++) {
        const cx = centro[0] + i * passo;
        const cz = centro[2] + j * passo;
        if (buraco && Math.hypot(cx - buraco[0], cz - buraco[1]) < buraco[2]) continue;
        const k = `${i}_${j}`;
        const lado = 113;
        const prof = 22;
        const ch = 20;
        const teto = (x: number, z: number, alt: number, ang: number, s: string) => {
          const r = rnd(`tt${s}`);
          if (r > 0.25) casinhas.push({ p: [x + (rnd(`tx${s}`) - 0.5) * 8, alt + 1.4, z + (rnd(`tz${s}`) - 0.5) * 8], t: [3 + rnd(`tw${s}`) * 3, 2.8, 3 + rnd(`td${s}`) * 3], r: -ang, cor: rnd(`tc${s}`) > 0.5 ? "#f2efe9" : "#d9d2c6" });
          if (r > 0.55) placas.push({ p: [x + 4, alt + 0.6, z - 3], t: [6, 0.3, 3.5], r: -ang + 0.3, cor: "#26385e" });
          if (r > 0.45) antenas.push({ p: [x - 3, alt + 3, z + 2], t: [0.25, 6, 0.25], r: 0, cor: "#8a8a8a" });
          if (r < 0.2) casinhas.push({ p: [x - 4, alt + 1.2, z + 4], t: [2.4, 2.4, 2.4], r: 0, cor: "#c9c6bf" });
        };
        for (let s = 0; s < 4; s++) {
          const ang = (s * Math.PI) / 2;
          for (let q = 0; q < 3; q++) {
            const alt = 17 + rnd(`h${k}${s}${q}`) * 12;
            const largura = (lado - 2 * ch) / 3;
            const off = -((lado - 2 * ch) / 2) + largura * (q + 0.5);
            const dx = Math.cos(ang) * (lado / 2 - prof / 2) - Math.sin(ang) * off;
            const dz = Math.sin(ang) * (lado / 2 - prof / 2) + Math.cos(ang) * off;
            const cor = CORES_BCN[Math.floor(rnd(`c${k}${s}${q}`) * CORES_BCN.length)];
            predios.push({ p: [cx + dx, alt / 2, cz + dz], t: [prof, alt, largura + 0.5], r: -ang, cor });
            teto(cx + dx, cz + dz, alt, ang, `${k}${s}${q}`);
          }
          const ac = ang + Math.PI / 4;
          const altc = 18 + rnd(`hc${k}${s}`) * 10;
          const dc = (lado / 2) * Math.SQRT2 - ch * 0.7 - prof / 2;
          predios.push({ p: [cx + Math.cos(ac) * dc, altc / 2, cz + Math.sin(ac) * dc], t: [prof, altc, ch * 1.45], r: -ac, cor: CORES_BCN[Math.floor(rnd(`cc${k}${s}`) * CORES_BCN.length)] });
          // árvores nas duas calçadas desse lado
          for (let a = 0; a < 10; a++) {
            const u = -lado / 2 + 12 + a * 9.5;
            for (const d of [lado / 2 + 3.5, lado / 2 + 16]) {
              const tx = cx + Math.cos(ang) * d - Math.sin(ang) * u;
              const tz = cz + Math.sin(ang) * d + Math.cos(ang) * u;
              const tam = 3.2 + rnd(`ar${k}${s}${a}${d}`) * 1.4;
              arvores.push({ p: [tx, 5 + tam * 0.4, tz], t: [tam, tam * 0.85, tam], cor: ["#4f7f35", "#5e8a3c", "#6b9a44", "#57843a"][a % 4] });
            }
          }
        }
        patios.push({ p: [cx, 0.3, cz], t: [lado - 2 * prof - 6, 0.6, lado - 2 * prof - 6], cor: rnd(`p${k}`) > 0.4 ? "#7d9a5a" : "#b3a68e" });
        for (let a = 0; a < 6; a++) patioArv.push({ p: [cx + (rnd(`pa${k}${a}`) - 0.5) * 50, 4, cz + (rnd(`pb${k}${a}`) - 0.5) * 50], t: [4, 4, 4], cor: "#5a8a3a" });
      }
    return { predios, casinhas, placas, antenas, arvores, patios, patioArv };
  }, [centro, n, buraco]);
  const matSimples = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.9 }), []);
  const matPlaca = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.25, metalness: 0.4 }), []);
  const esfera = useMemo(() => new THREE.IcosahedronGeometry(1, 1), []);
  const tam = (2 * n + 1) * 133;
  return (
    <group>
      <mesh position={[centro[0], 0.05, centro[2]]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[tam, tam]} />
        <meshStandardMaterial map={chao} roughness={0.95} />
      </mesh>
      <Instancias itens={predios} material={mat} />
      <Instancias itens={casinhas} material={matSimples} />
      <Instancias itens={placas} material={matPlaca} sombra={false} />
      <Instancias itens={antenas} material={matSimples} sombra={false} />
      <Instancias itens={patios} material={matSimples} sombra={false} />
      <Instancias itens={arvores} material={matSimples} geo={esfera} />
      <Instancias itens={patioArv} material={matSimples} geo={esfera} />
    </group>
  );
};

// Carros andando nas ruas da grade (pontinhos coloridos vistos do alto)
export const CarrosGrade: React.FC<{ centro: V3; n?: number; s: number }> = ({ centro, n = 8, s }) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const lista = useMemo(() => {
    const l: { eixoX: boolean; linha: number; base: number; vel: number; cor: string }[] = [];
    for (let i = 0; i < 260; i++) {
      l.push({
        eixoX: rnd(`ce${i}`) > 0.5,
        linha: Math.round((rnd(`cl${i}`) - 0.5) * 2 * n) * 133 + 66.5 + (rnd(`cs${i}`) > 0.5 ? 3 : -3),
        base: rnd(`cb${i}`) * 2400,
        vel: (rnd(`cv${i}`) > 0.5 ? 1 : -1) * (8 + rnd(`cw${i}`) * 6),
        cor: ["#f1f1f1", "#c1121f", "#1d3557", "#e9c46a", "#2b2d42", "#8d99ae", "#3a86ff", "#ffbe0b"][i % 8],
      });
    }
    return l;
  }, [n]);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.5 }), []);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    lista.forEach((c, i) => {
      const u = ((c.base + s * c.vel) % 2400 + 2400) % 2400 - 1200;
      if (c.eixoX) {
        o.position.set(centro[0] + u, 0.8, centro[2] + c.linha);
        o.rotation.set(0, Math.PI / 2, 0);
      } else {
        o.position.set(centro[0] + c.linha, 0.8, centro[2] + u);
        o.rotation.set(0, 0, 0);
      }
      o.scale.set(2, 1.5, 4.4);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      m.setColorAt(i, new THREE.Color(c.cor));
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  });
  return <instancedMesh ref={ref} args={[undefined, mat, lista.length]}><boxGeometry args={[1, 1, 1]} /></instancedMesh>;
};

// Fachada de rua (5–6 andares, janelas com venezianas, sacadas de ferro, loja embaixo com toldo)
export const texturaFachada = (cor: string, veneziana: string, sem: string) =>
  texturaCanvas(256, 512, (g) => {
    g.fillStyle = cor;
    g.fillRect(0, 0, 256, 512);
    g.fillStyle = "rgba(0,0,0,0.06)";
    for (let y = 0; y < 512; y += 4) if (rnd(`${sem}r${y}`) > 0.7) g.fillRect(0, y, 256, 2);
    for (let andar = 0; andar < 5; andar++) {
      const y = 30 + andar * 80;
      for (let j = 0; j < 3; j++) {
        const x = 22 + j * 80;
        g.fillStyle = "#2b3440";
        g.fillRect(x, y, 50, 58);
        g.fillStyle = veneziana;
        g.fillRect(x - 12, y, 12, 58);
        g.fillRect(x + 50, y, 12, 58);
        g.fillStyle = "rgba(255,255,255,0.18)";
        g.fillRect(x + 4, y + 4, 18, 20);
        // sacada
        g.fillStyle = "#22252a";
        g.fillRect(x - 6, y + 52, 62, 4);
        for (let b = 0; b < 8; b++) g.fillRect(x - 4 + b * 8, y + 40, 2, 14);
      }
      g.fillStyle = "rgba(255,255,255,0.35)";
      g.fillRect(0, y + 68, 256, 3);
    }
    // térreo: lojas com vitrine e toldo
    g.fillStyle = "#3b3330";
    g.fillRect(0, 430, 256, 82);
    g.fillStyle = "#b9d0dc";
    g.fillRect(14, 448, 100, 60);
    g.fillRect(142, 448, 100, 60);
    const toldo = ["#c0392b", "#2e86ab", "#27ae60", "#f39c12"][Math.floor(rnd(`${sem}t`) * 4)];
    g.fillStyle = toldo;
    g.fillRect(8, 426, 112, 18);
    g.fillRect(136, 426, 112, 18);
  });

// Multidão andando num corredor (calçadão), em ambos os sentidos
export const Multidao: React.FC<{ n: number; x: [number, number]; z: [number, number]; s: number; sem: string; vel?: number }> = ({ n, x, z, s, sem, vel = 1.3 }) => {
  const pessoas = useMemo(
    () =>
      Array.from({ length: n }).map((_, i) => {
        const k = `${sem}${i}`;
        const ida = rnd(`${k}i`) > 0.5;
        return {
          r: roupaAleatoria(k),
          x: x[0] + rnd(`${k}x`) * (x[1] - x[0]),
          z0: rnd(`${k}z`),
          ida,
          v: vel * (0.8 + rnd(`${k}v`) * 0.4),
          fase: rnd(`${k}f`) * 10,
          parado: rnd(`${k}p`) > 0.85,
        };
      }),
    [n, x, z, sem, vel],
  );
  const L = z[1] - z[0];
  return (
    <group>
      {pessoas.map((p, i) => {
        const dz = p.parado ? 0 : (p.ida ? -1 : 1) * p.v * s;
        const zz = z[0] + ((((p.z0 * L + dz) % L) + L) % L);
        if (p.x > 0.6 && p.x < 3.4 && zz > 8 && zz < 32) return null;
        return <Gente key={i} r={p.r} pos={[p.x, 0, zz]} giroY={p.ida ? Math.PI : 0} acao={p.parado ? "conversar" : "andar"} t={s} fase={p.fase} escala={0.95 + (i % 5) * 0.03} />;
      })}
    </group>
  );
};
