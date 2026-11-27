import { RoundedBox } from "@react-three/drei";
import { useMemo } from "react";
import { random } from "remotion";
import * as THREE from "three";
import { Hora, ehNoite } from "./Luz";
import { Arvore, Carro, Fios, Morro, Poste, escolher, texturaCanvas } from "./Pecas";

// RUA DE BAIRRO (Rio/Recife/qualquer cidade), com o nível de detalhe do Culturaverso: janela com
// moldura em relevo, peitoril, veneziana de madeira aberta e grade; porta de madeira com almofadas;
// número da casa, relógio de luz, ar-condicionado, cano, frisos entre andares, barrado escuro e manchas
// na parede; loja com toldo listrado e letreiro; mesas de bar na calçada.
// Rua ao longo do eixo z (de -comprimento/2 a +comprimento/2); asfalto x -3,5…3,5; calçadas até ±5,9,
// onde ficam as fachadas.

const CORES_CASA = ["#e9c9a8", "#c9d8c0", "#f0d58c", "#9fc9c3", "#f3e6d3", "#e8b4a0", "#d9c2e0", "#bfd6e8", "#f2c49b", "#e5d8b0", "#a8c69f"] as const;
const CORES_MADEIRA = ["#7a4a2a", "#6b3f22", "#2f5d4a", "#8a5a34", "#3c5a7a"] as const;

// ---------- materiais e geometrias compartilhados (muita peça repetida = pouco custo) ----------

const CAIXA = new THREE.BoxGeometry(1, 1, 1);
const cacheMat = new Map<string, THREE.Material>();
const mat = (chave: string, criar: () => THREE.Material) => {
  if (!cacheMat.has(chave)) cacheMat.set(chave, criar());
  return cacheMat.get(chave)!;
};
const fosco = (c: string, rough = 0.85) => mat(`f${c}${rough}`, () => new THREE.MeshStandardMaterial({ color: c, roughness: rough }));

// Parede pintada com vida: barrado escuro embaixo, sujeira subindo do chão e manchas suaves
const parede = (c: string) =>
  mat(`parede${c}`, () => {
    const m = new THREE.MeshStandardMaterial({ color: c, roughness: 0.92 });
    m.onBeforeCompile = (sh) => {
      sh.vertexShader = sh.vertexShader
        .replace("#include <common>", "#include <common>\nvarying vec3 vMundoP;")
        .replace("#include <worldpos_vertex>", "#include <worldpos_vertex>\nvMundoP = (modelMatrix * vec4(transformed, 1.0)).xyz;");
      sh.fragmentShader = sh.fragmentShader
        .replace(
          "#include <common>",
          `#include <common>
          varying vec3 vMundoP;
          float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
          float ruido(vec2 p){ vec2 i = floor(p); vec2 f = fract(p); f = f*f*(3.0-2.0*f);
            return mix(mix(h21(i), h21(i+vec2(1,0)), f.x), mix(h21(i+vec2(0,1)), h21(i+vec2(1,1)), f.x), f.y); }`,
        )
        .replace(
          "#include <color_fragment>",
          `#include <color_fragment>
          vec2 q = vec2(vMundoP.x + vMundoP.z, vMundoP.y);
          float mancha = ruido(q * 0.6) * 0.6 + ruido(q * 2.3) * 0.4;
          diffuseColor.rgb *= 0.9 + 0.16 * mancha;
          // escorrido vertical bem leve (chuva)
          diffuseColor.rgb *= 1.0 - 0.06 * smoothstep(0.55, 0.9, ruido(vec2(q.x * 3.0, q.y * 0.15)));
          // sujeira que sobe do chão e barrado cinza
          diffuseColor.rgb *= mix(0.78, 1.0, smoothstep(0.4, 1.6, vMundoP.y));
          diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.16, 0.15, 0.14), step(vMundoP.y, 0.55));`,
        );
    };
    m.customProgramCacheKey = () => "parede";
    return m;
  });

const texPorta = (c: string) =>
  texturaCanvas(128, 256, (ctx) => {
    ctx.fillStyle = c;
    ctx.fillRect(0, 0, 128, 256);
    ctx.strokeStyle = "rgba(0,0,0,0.35)";
    ctx.lineWidth = 4;
    for (const [x, y, w, h] of [[16, 16, 96, 100], [16, 136, 96, 104]]) ctx.strokeRect(x, y, w, h);
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    ctx.fillRect(20, 20, 4, 92);
    ctx.fillStyle = "#d4af37";
    ctx.beginPath();
    ctx.arc(104, 132, 5, 0, Math.PI * 2);
    ctx.fill();
  });
const texVeneziana = (c: string) =>
  texturaCanvas(64, 160, (ctx) => {
    ctx.fillStyle = c;
    ctx.fillRect(0, 0, 64, 160);
    for (let y = 6; y < 154; y += 7) {
      ctx.fillStyle = "rgba(0,0,0,0.28)";
      ctx.fillRect(4, y, 56, 2);
      ctx.fillStyle = "rgba(255,255,255,0.1)";
      ctx.fillRect(4, y + 2, 56, 1);
    }
    ctx.strokeStyle = "rgba(0,0,0,0.3)";
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, 60, 156);
  });
const texToldo = (a: string, b: string) =>
  texturaCanvas(256, 64, (ctx) => {
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = i % 2 ? a : b;
      ctx.fillRect(i * 32, 0, 32, 64);
    }
    ctx.fillStyle = "rgba(0,0,0,0.12)";
    ctx.fillRect(0, 56, 256, 8);
  });
const texLetreiro = (nome: string, sub: string, fundo: string, letra: string) =>
  texturaCanvas(512, 128, (ctx) => {
    ctx.fillStyle = fundo;
    ctx.fillRect(0, 0, 512, 128);
    ctx.strokeStyle = letra;
    ctx.lineWidth = 3;
    ctx.strokeRect(8, 8, 496, 112);
    ctx.fillStyle = letra;
    ctx.textAlign = "center";
    ctx.font = "bold 56px Georgia, serif";
    ctx.fillText(nome, 256, 68);
    ctx.font = "22px Arial, sans-serif";
    ctx.fillText(sub, 256, 104);
  });
const texInterior = (semente: string) =>
  texturaCanvas(256, 192, (ctx) => {
    ctx.fillStyle = "#3a2c22";
    ctx.fillRect(0, 0, 256, 192);
    for (let r = 0; r < 4; r++) {
      ctx.fillStyle = "#c9a227";
      ctx.fillRect(0, 40 + r * 40, 256, 5);
      const base = 40 + r * 40;
      let x = 4;
      let k = 0;
      while (x < 246) {
        const tipo = Math.floor(random(`${semente}t${r}${k}`) * 3);
        const corP = escolher(["#e63946", "#2a9d8f", "#f2c230", "#f4f1ea", "#1d3557", "#ff7a2f", "#6a994e", "#7a2e12"] as const, `${semente}${r}${k}`);
        const n = 3 + Math.floor(random(`${semente}n${r}${k}`) * 4); // produtos iguais lado a lado
        for (let j = 0; j < n && x < 246; j++) {
          ctx.fillStyle = corP;
          if (tipo === 0) {
            // garrafa: corpo, ombro, gargalo e tampinha
            ctx.fillRect(x, base - 22, 7, 22);
            ctx.beginPath();
            ctx.moveTo(x, base - 22);
            ctx.lineTo(x + 2.5, base - 28);
            ctx.lineTo(x + 4.5, base - 28);
            ctx.lineTo(x + 7, base - 22);
            ctx.fill();
            ctx.fillRect(x + 2.5, base - 33, 2, 6);
            ctx.fillStyle = "#f4f1ea";
            ctx.fillRect(x, base - 15, 7, 5);
            x += 9;
          } else if (tipo === 1) {
            // lata com rótulo
            ctx.fillRect(x, base - 12, 9, 12);
            ctx.fillStyle = "rgba(255,255,255,0.55)";
            ctx.fillRect(x, base - 9, 9, 3);
            x += 10;
          } else {
            // pacote/caixa
            ctx.fillRect(x, base - 18, 12, 18);
            ctx.fillStyle = "rgba(255,255,255,0.7)";
            ctx.fillRect(x + 2, base - 13, 8, 5);
            x += 13;
          }
        }
        x += 3;
        k++;
      }
    }
    const g = ctx.createLinearGradient(0, 0, 0, 192);
    g.addColorStop(0, "rgba(255,240,200,0.25)");
    g.addColorStop(1, "rgba(0,0,0,0.25)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 192);
  });

// peça = caixa escalada (geometria única compartilhada)
const Peca: React.FC<{ p: [number, number, number]; e: [number, number, number]; m: THREE.Material; sombra?: boolean; giro?: [number, number, number] }> = ({ p, e, m, sombra, giro }) => (
  <mesh geometry={CAIXA} material={m} position={p} scale={e} rotation={giro} castShadow={sombra} receiveShadow />
);

// ---------- janela, porta, loja ----------

const Janela: React.FC<{ x: number; y: number; w: number; h: number; semente: string; terreo: boolean; noite: boolean; corMadeira: string }> = ({ x, y, w, h, semente, terreo, noite, corMadeira }) => {
  const moldura = fosco("#f3eee4", 0.7);
  const vidroAceso = mat("vidroNoite", () => new THREE.MeshPhysicalMaterial({ color: "#26333d", roughness: 0.08, metalness: 0.1, clearcoat: 1, emissive: new THREE.Color("#ffb860"), emissiveIntensity: 0.6 }));
  const vidro = mat("vidroDia", () => new THREE.MeshPhysicalMaterial({ color: "#26333d", roughness: 0.08, metalness: 0.1, clearcoat: 1 }));
  const ferro = fosco("#1e1e1e", 0.5);
  const veneziana = mat(`ven${corMadeira}`, () => new THREE.MeshStandardMaterial({ map: texVeneziana(corMadeira), roughness: 0.8 }));
  const temVen = !terreo && random(`${semente}ven`) < 0.75;
  const temGrade = terreo || random(`${semente}gr`) < 0.25;
  const acesa = noite && random(`${semente}ac`) < 0.6;
  const b = 0.09;
  const barras = Math.round(w / 0.12);
  return (
    <group position={[x, y, 0]}>
      {/* vidro + caixilho */}
      <Peca p={[0, h / 2, -0.02]} e={[w, h, 0.02]} m={acesa ? vidroAceso : vidro} />
      <Peca p={[0, h / 2, 0.0]} e={[0.05, h, 0.04]} m={moldura} />
      <Peca p={[0, h * 0.72, 0.0]} e={[w, 0.05, 0.04]} m={moldura} />
      {/* moldura em relevo */}
      <Peca p={[-w / 2 - b / 2, h / 2, 0.05]} e={[b, h + b * 2, 0.12]} m={moldura} sombra />
      <Peca p={[w / 2 + b / 2, h / 2, 0.05]} e={[b, h + b * 2, 0.12]} m={moldura} sombra />
      <Peca p={[0, h + b / 2, 0.05]} e={[w, b, 0.12]} m={moldura} sombra />
      {/* peitoril */}
      <Peca p={[0, -0.04, 0.1]} e={[w + 0.3, 0.07, 0.22]} m={moldura} sombra />
      {temVen &&
        [-1, 1].map((l) => (
          <Peca key={l} p={[l * (w / 2 + b + w / 4), h / 2, 0.04]} e={[w / 2, h, 0.04]} m={veneziana} sombra />
        ))}
      {temGrade && (
        <>
          {Array.from({ length: barras + 1 }, (_, k) => (
            <Peca key={k} p={[-w / 2 + (k * w) / barras, h / 2, 0.13]} e={[0.022, h, 0.022]} m={ferro} />
          ))}
          {[0.25, 0.75].map((t) => (
            <Peca key={t} p={[0, h * t, 0.13]} e={[w, 0.03, 0.03]} m={ferro} />
          ))}
        </>
      )}
      {acesa && <pointLight position={[0, h / 2, 0.6]} color="#ffb860" intensity={2} distance={4} />}
    </group>
  );
};

const Porta: React.FC<{ x: number; cor: string; numero: number }> = ({ x, cor, numero }) => {
  const moldura = fosco("#efe8dc", 0.7);
  const porta = mat(`porta${cor}`, () => new THREE.MeshStandardMaterial({ map: texPorta(cor), roughness: 0.7 }));
  const placa = mat(`num${numero}`, () => {
    const t = texturaCanvas(64, 48, (ctx) => {
      ctx.fillStyle = "#f4f4f4";
      ctx.fillRect(0, 0, 64, 48);
      ctx.strokeStyle = "#1d3557";
      ctx.lineWidth = 3;
      ctx.strokeRect(3, 3, 58, 42);
      ctx.fillStyle = "#1d3557";
      ctx.font = "bold 26px Arial";
      ctx.textAlign = "center";
      ctx.fillText(String(numero), 32, 33);
    });
    return new THREE.MeshStandardMaterial({ map: t, roughness: 0.5 });
  });
  return (
    <group position={[x, 0, 0]}>
      <Peca p={[0, 1.08, -0.04]} e={[1.0, 2.16, 0.04]} m={porta} />
      <Peca p={[-0.56, 1.13, 0.04]} e={[0.1, 2.3, 0.12]} m={moldura} sombra />
      <Peca p={[0.56, 1.13, 0.04]} e={[0.1, 2.3, 0.12]} m={moldura} sombra />
      <Peca p={[0, 2.29, 0.04]} e={[1.22, 0.12, 0.12]} m={moldura} sombra />
      {/* degrau, número e relógio de luz */}
      <Peca p={[0, 0.06, 0.2]} e={[1.3, 0.12, 0.4]} m={fosco("#bdb6aa", 0.95)} sombra />
      <Peca p={[0.85, 1.75, 0.02]} e={[0.2, 0.15, 0.02]} m={placa} />
      <Peca p={[-0.95, 1.45, 0.08]} e={[0.34, 0.44, 0.16]} m={fosco("#8d9196", 0.5)} sombra />
      <Peca p={[-0.95, 1.45, 0.165]} e={[0.2, 0.14, 0.01]} m={fosco("#d9dde0", 0.2)} />
    </group>
  );
};

const Loja: React.FC<{ largura: number; nome: string; sub: string; semente: string; noite: boolean }> = ({ largura, nome, sub, semente, noite }) => {
  const w = Math.min(largura - 1.2, 3.4);
  const [a, b] = escolher([["#1d3557", "#f4f1ea"], ["#c1121f", "#f4f1ea"], ["#2a9d8f", "#f4f1ea"], ["#e76f51", "#fff3e0"]] as const, `${semente}tc`);
  const toldo = mat(`toldo${a}`, () => new THREE.MeshStandardMaterial({ map: texToldo(a, b), roughness: 0.85, side: THREE.DoubleSide }));
  const interior = mat(`int${semente}${noite}`, () => {
    const t = texInterior(semente);
    return new THREE.MeshStandardMaterial({ map: t, emissiveMap: t, emissive: new THREE.Color("#ffffff"), emissiveIntensity: noite ? 0.9 : 0.35, roughness: 0.9 });
  });
  const [fl, cl] = escolher([["#f4f1ea", "#7a1f1f"], ["#3a2c22", "#f2c230"], ["#f2c230", "#1d3557"], ["#1d3557", "#f4f1ea"]] as const, `${semente}lt`);
  const letreiro = mat(`let${nome}${noite}`, () => {
    const t = texLetreiro(nome, sub, fl, cl);
    return new THREE.MeshStandardMaterial({ map: t, emissiveMap: t, emissive: new THREE.Color("#ffffff"), emissiveIntensity: noite ? 0.8 : 0.04, roughness: 0.6 });
  });
  const lw = Math.min(w + 0.4, 3.6);
  return (
    <group>
      {/* salão da loja: fundo com prateleiras, piso, teto, laterais, balcão e lâmpada */}
      <Peca p={[0, 1.3, -5.95]} e={[w, 2.6, 0.02]} m={interior} />
      {[-1, 1].map((l) => (
        <Peca key={`pl${l}`} p={[l * (w / 2 - 0.01), 1.35, -3]} e={[0.02, 2.7, 6]} m={interior} />
      ))}
      <Peca p={[0, 0.005, -3]} e={[w, 0.01, 6]} m={fosco("#b9a98f", 0.4)} />
      <Peca p={[0, 2.69, -3]} e={[w, 0.02, 6]} m={fosco("#efe9df")} />
      <Peca p={[w / 2 - 0.55, 0.5, -2.2]} e={[0.7, 1.0, 2.4]} m={fosco("#8a5a3a", 0.6)} sombra />
      <Peca p={[w / 2 - 0.55, 1.02, -2.2]} e={[0.75, 0.04, 2.45]} m={fosco("#8a7a66", 0.55)} />
      <Peca p={[0, 2.62, -2.5]} e={[1.2, 0.05, 0.14]} m={mat("fluor", () => new THREE.MeshStandardMaterial({ color: "#ffffff", emissive: new THREE.Color("#f4fbff"), emissiveIntensity: 3 }))} />
      <pointLight position={[0, 2.3, -2.5]} color="#f2f6ff" intensity={noite ? 10 : 5} distance={7} decay={1.6} />
      <Peca p={[0, 2.72, 0.02]} e={[w + 0.1, 0.32, 0.16]} m={fosco("#9aa0a6", 0.45)} sombra />
      {[-1, 1].map((l) => (
        <Peca key={l} p={[l * (w / 2 + 0.08), 1.4, 0.0]} e={[0.16, 2.8, 0.2]} m={fosco("#d8d0c4")} sombra />
      ))}
      {/* letreiro e toldo listrado */}
      <Peca p={[0, 3.25, 0.06]} e={[lw, lw / 4, 0.08]} m={letreiro} sombra />
      <mesh position={[0, 2.62, 0.55]} rotation={[0.42, 0, 0]} castShadow material={toldo}>
        <planeGeometry args={[w + 0.3, 1.2]} />
      </mesh>
      <mesh position={[0, 2.25, 1.1]} material={toldo}>
        <planeGeometry args={[w + 0.3, 0.22]} />
      </mesh>
      {noite && <pointLight position={[0, 2.0, 1.2]} color="#ffd59a" intensity={18} distance={7} />}
    </group>
  );
};

// ---------- casa ----------

type Casa = { z: number; larg: number; andares: number; cor: string; lado: 1 | -1; varanda: boolean; telhado: boolean; ar: boolean; loja?: [string, string]; numero: number; madeira: string };

const Sobrado: React.FC<{ c: Casa; semente: string; noite: boolean }> = ({ c, semente, noite }) => {
  const PE = 3.1;
  const alt = c.andares * PE + 0.5;
  const prof = 9;
  const W = c.larg;
  const friso = fosco(new THREE.Color(c.cor).multiplyScalar(0.92).getStyle(), 0.85);
  const janelasPorAndar = W > 6.5 ? 2 : 1;
  const xs = janelasPorAndar === 2 ? [-W / 4, W / 4] : [0];
  const metal = fosco("#1e1e1e", 0.5);
  return (
    // fachada em z = 0 olhando para +z; o grupo vira para a rua
    <group position={[c.lado * 5.9, 0, c.z]} rotation={[0, (-c.lado * Math.PI) / 2, 0]}>
      {c.loja ? (
        // parede montada em volta do vão da loja (esquerda, direita e em cima) + salão de verdade atrás
        (() => {
          const w = Math.min(W - 1.2, 3.4);
          const lado = (W - w) / 2;
          return (
            <>
              <mesh geometry={CAIXA} material={parede(c.cor)} position={[-W / 2 + lado / 2, alt / 2, -prof / 2]} scale={[lado, alt, prof]} castShadow receiveShadow />
              <mesh geometry={CAIXA} material={parede(c.cor)} position={[W / 2 - lado / 2, alt / 2, -prof / 2]} scale={[lado, alt, prof]} castShadow receiveShadow />
              <mesh geometry={CAIXA} material={parede(c.cor)} position={[0, (alt + 2.7) / 2, -prof / 2]} scale={[w, alt - 2.7, prof]} castShadow receiveShadow />
              <mesh geometry={CAIXA} material={parede(c.cor)} position={[0, 1.35, -prof + 1.5]} scale={[w, 2.7, 3]} receiveShadow />
            </>
          );
        })()
      ) : (
        <mesh geometry={CAIXA} material={parede(c.cor)} position={[0, alt / 2, -prof / 2]} scale={[W, alt, prof]} castShadow receiveShadow />
      )}
      {/* frisos entre andares e cornija no alto */}
      {Array.from({ length: c.andares - 1 }, (_, a) => (
        <Peca key={a} p={[0, (a + 1) * PE + 0.05, 0.04]} e={[W, 0.12, 0.08]} m={friso} sombra />
      ))}
      <Peca p={[0, alt - 0.05, 0.1]} e={[W + 0.05, 0.22, 0.22]} m={friso} sombra />
      <Peca p={[0, alt + 0.25, -0.05]} e={[W + 0.05, 0.4, 0.12]} m={parede(c.cor)} sombra />
      {/* térreo: loja OU porta + janela com grade */}
      {c.loja ? (
        <Loja largura={W} nome={c.loja[0]} sub={c.loja[1]} semente={semente} noite={noite} />
      ) : (
        <>
          <Porta x={janelasPorAndar === 2 ? -W / 4 : -W / 2 + 1.3} cor={c.madeira} numero={c.numero} />
          <Janela x={janelasPorAndar === 2 ? W / 4 : W / 2 - 1.2} y={0.95} w={1.1} h={1.3} semente={`${semente}t`} terreo noite={noite} corMadeira={c.madeira} />
        </>
      )}
      {/* andares de cima */}
      {Array.from({ length: c.andares - 1 }, (_, a) =>
        xs.map((x, j) => <Janela key={`${a}${j}`} x={x} y={(a + 1) * PE + 0.9} w={1.1} h={1.4} semente={`${semente}${a}${j}`} terreo={false} noite={noite} corMadeira={c.madeira} />),
      )}
      {/* varanda com guarda-corpo de ferro no 1º andar */}
      {c.varanda && c.andares > 1 && (
        <group position={[xs[0], PE + 0.1, 0.55]}>
          <Peca p={[0, 0, 0]} e={[1.9, 0.14, 1.1]} m={fosco("#e9e4da", 0.9)} sombra />
          <Peca p={[0, 0.95, 0.52]} e={[1.9, 0.05, 0.05]} m={metal} />
          {Array.from({ length: 16 }, (_, k) => (
            <Peca key={k} p={[-0.92 + k * 0.1227, 0.5, 0.52]} e={[0.022, 0.9, 0.022]} m={metal} />
          ))}
          {[-1, 1].map((l) => (
            <Peca key={l} p={[l * 0.93, 0.5, 0]} e={[0.03, 0.9, 1.05]} m={metal} />
          ))}
          {/* vaso com planta */}
          <mesh position={[0.6, 0.22, 0.2]} castShadow>
            <cylinderGeometry args={[0.16, 0.12, 0.3, 12]} />
            <meshStandardMaterial color="#b4532a" roughness={0.9} />
          </mesh>
          <mesh position={[0.6, 0.55, 0.2]} castShadow>
            <icosahedronGeometry args={[0.28, 2]} />
            <meshStandardMaterial color="#4f8a3a" roughness={0.9} />
          </mesh>
        </group>
      )}
      {/* ar-condicionado e cano de descida */}
      {c.ar && c.andares > 1 && (
        <group position={[W / 2 - 0.75, PE + 0.55, 0.2]}>
          <RoundedBox args={[0.8, 0.5, 0.32]} radius={0.04} castShadow>
            <meshStandardMaterial color="#eeeeea" roughness={0.6} />
          </RoundedBox>
          <Peca p={[0.1, 0, 0.165]} e={[0.42, 0.36, 0.01]} m={fosco("#9a9a96", 0.6)} />
        </group>
      )}
      <mesh position={[W / 2 - 0.12, alt / 2, 0.1]} castShadow>
        <cylinderGeometry args={[0.045, 0.045, alt, 8]} />
        <meshStandardMaterial color="#9b9892" roughness={0.6} />
      </mesh>
      {c.telhado && (
        <group position={[0, alt + 0.45, -prof / 2]}>
          {[-1, 1].map((l) => (
            <Peca key={l} p={[0, 0.7, (l * prof) / 4]} e={[W + 0.3, 0.12, prof / 2 + 0.6]} giro={[l * -0.32, 0, 0]} m={mat("telha", () => new THREE.MeshStandardMaterial({ map: texToldo("#b4532a", "#a24a25"), roughness: 0.85 }))} sombra />
          ))}
        </group>
      )}
    </group>
  );
};

// Mesa de bar de plástico com 4 cadeiras (assento a 0,45 m: serve para as animações "sitting-*")
export const MesaBar: React.FC<{ pos: [number, number, number]; cor?: string; giroY?: number; cerveja?: boolean }> = ({ pos, cor = "#f4f4f2", giroY = 0, cerveja = true }) => {
  const plastico = fosco(cor, 0.55);
  return (
    <group position={pos} rotation={[0, giroY, 0]}>
      <RoundedBox args={[0.75, 0.04, 0.75]} radius={0.015} position={[0, 0.72, 0]} castShadow receiveShadow material={plastico} />
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b], i) => (
        <Peca key={i} p={[a * 0.32, 0.36, b * 0.32]} e={[0.04, 0.72, 0.04]} m={plastico} />
      ))}
      {[0, 1, 2, 3].map((k) => (
        <group key={k} rotation={[0, (k * Math.PI) / 2, 0]}>
          <group position={[0, 0, 0.62]}>
            <RoundedBox args={[0.44, 0.04, 0.42]} radius={0.015} position={[0, 0.45, 0]} castShadow material={plastico} />
            <RoundedBox args={[0.44, 0.42, 0.04]} radius={0.015} position={[0, 0.68, 0.2]} rotation={[0.12, 0, 0]} castShadow material={plastico} />
            {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b], i) => (
              <Peca key={i} p={[a * 0.19, 0.22, b * 0.18]} e={[0.03, 0.45, 0.03]} m={plastico} />
            ))}
          </group>
        </group>
      ))}
      {cerveja && (
        <>
          <mesh position={[0.12, 0.88, 0.05]} castShadow>
            <cylinderGeometry args={[0.04, 0.04, 0.28, 12]} />
            <meshPhysicalMaterial color="#5a2a0a" roughness={0.15} clearcoat={1} />
          </mesh>
          {[-0.12, 0.05].map((x) => (
            <mesh key={x} position={[x, 0.79, -0.12]} castShadow>
              <cylinderGeometry args={[0.035, 0.03, 0.11, 12]} />
              <meshPhysicalMaterial color="#f2c230" roughness={0.1} transmission={0.3} transparent opacity={0.85} />
            </mesh>
          ))}
        </>
      )}
    </group>
  );
};

export const LOJAS_RUA: [string, string][] = [
  ["MERCEARIA", "FRIOS · LATICÍNIOS"],
  ["BAR", "CERVEJA GELADA"],
  ["PADARIA", "PÃO QUENTINHO"],
  ["FARMÁCIA", "24 HORAS"],
  ["ARMARINHO", "LINHAS E AVIAMENTOS"],
];

export type CasaRua = Casa;

export const casasDaRua = (comprimento: number, semente: string, lojas: [string, string][]) => {
  const cs: Casa[] = [];
  let iLoja = 0;
  for (const lado of [-1, 1] as const) {
    let z = -comprimento / 2;
    let i = 0;
    while (z < comprimento / 2) {
      const larg = 5.2 + random(`${semente}${lado}l${i}`) * 3.6;
      const loja = random(`${semente}${lado}lj${i}`) < 0.3 && iLoja < lojas.length ? lojas[iLoja++] : undefined;
      cs.push({
        z: z + larg / 2,
        larg,
        andares: 1 + Math.floor(random(`${semente}${lado}a${i}`) * 3),
        cor: escolher(CORES_CASA, `${semente}${lado}c${i}`),
        lado,
        varanda: random(`${semente}${lado}v${i}`) < 0.45,
        telhado: random(`${semente}${lado}t${i}`) < 0.25,
        ar: random(`${semente}${lado}ar${i}`) < 0.4,
        loja,
        numero: 40 + i * 12 + (lado > 0 ? 1 : 0),
        madeira: escolher(CORES_MADEIRA, `${semente}${lado}md${i}`),
      });
      z += larg;
      i++;
    }
  }
  return cs;
};

export const Rua: React.FC<{ hora: Hora; comprimento?: number; semente?: string; morro?: boolean; carros?: number; lojas?: [string, string][] }> = ({
  hora,
  comprimento = 120,
  semente = "rua",
  morro = true,
  carros = 6,
  lojas = LOJAS_RUA,
}) => {
  const noite = ehNoite(hora);
  const casas = useMemo(() => casasDaRua(comprimento, semente, lojas), [comprimento, semente, lojas]);
  const asfalto = useMemo(
    () =>
      texturaCanvas(
        512,
        512,
        (ctx) => {
          ctx.fillStyle = "#4a4846";
          ctx.fillRect(0, 0, 512, 512);
          // remendos e manchas de óleo
          for (let i = 0; i < 7; i++) {
            ctx.fillStyle = `rgba(${random(`rm${i}`) < 0.5 ? "20,20,22" : "70,70,72"},0.35)`;
            ctx.fillRect(random(`rx${i}`) * 450, random(`ry${i}`) * 450, 30 + random(`rw${i}`) * 80, 20 + random(`rh${i}`) * 60);
          }
          for (let i = 0; i < 9000; i++) {
            ctx.fillStyle = `rgba(${random(`a${i}`) < 0.5 ? "255,255,255" : "0,0,0"},${0.03 + random(`b${i}`) * 0.07})`;
            ctx.fillRect(random(`x${i}`) * 512, random(`y${i}`) * 512, 2, 2);
          }
        },
        true,
      ),
    [],
  );
  asfalto.repeat.set(1, comprimento / 10);
  const calcada = useMemo(
    () =>
      texturaCanvas(
        256,
        256,
        (ctx) => {
          ctx.fillStyle = "#cfc9bf";
          ctx.fillRect(0, 0, 256, 256);
          for (let i = 0; i < 4; i++)
            for (let j = 0; j < 4; j++) {
              ctx.fillStyle = `rgba(${random(`c${i}${j}`) < 0.5 ? "0,0,0" : "255,255,255"},0.05)`;
              ctx.fillRect(i * 64 + 2, j * 64 + 2, 60, 60);
            }
          ctx.strokeStyle = "rgba(0,0,0,0.22)";
          ctx.lineWidth = 2;
          for (let k = 0; k <= 256; k += 64) {
            ctx.beginPath();
            ctx.moveTo(k, 0);
            ctx.lineTo(k, 256);
            ctx.moveTo(0, k);
            ctx.lineTo(256, k);
            ctx.stroke();
          }
        },
        true,
      ),
    [],
  );
  calcada.repeat.set(1.2, comprimento / 2);
  const postes: [number, number, number][] = [];
  for (let z = -comprimento / 2 + 6; z < comprimento / 2; z += 22) postes.push([-4.1, 0, z]);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[7, comprimento]} />
        <meshStandardMaterial map={asfalto} roughness={0.9} />
      </mesh>
      {/* faixa branca tracejada no meio e bueiros */}
      {Array.from({ length: Math.floor(comprimento / 6) }, (_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, -comprimento / 2 + i * 6 + 1.5]}>
          <planeGeometry args={[0.13, 2.4]} />
          <meshStandardMaterial color="#e9e6df" roughness={0.75} />
        </mesh>
      ))}
      {Array.from({ length: Math.floor(comprimento / 25) }, (_, i) => (
        <mesh key={`b${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[(i % 2 ? 1 : -1) * 1.6, 0.007, -comprimento / 2 + 12 + i * 25]}>
          <circleGeometry args={[0.35, 20]} />
          <meshStandardMaterial color="#26272a" roughness={0.5} metalness={0.4} />
        </mesh>
      ))}
      {[-1, 1].map((l) => (
        <group key={l}>
          <mesh position={[l * (3.5 + 1.2), 0.08, 0]} receiveShadow castShadow>
            <boxGeometry args={[2.4, 0.16, comprimento]} />
            <meshStandardMaterial attach="material-0" color="#c4beb3" roughness={0.95} />
            <meshStandardMaterial attach="material-1" color="#c4beb3" roughness={0.95} />
            <meshStandardMaterial attach="material-2" map={calcada} roughness={0.95} />
            <meshStandardMaterial attach="material-3" color="#c4beb3" />
            <meshStandardMaterial attach="material-4" color="#c4beb3" />
            <meshStandardMaterial attach="material-5" color="#c4beb3" />
          </mesh>
          {/* meio-fio pintado */}
          <mesh position={[l * 3.55, 0.09, 0]} receiveShadow>
            <boxGeometry args={[0.14, 0.18, comprimento]} />
            <meshStandardMaterial color="#e6e2d8" roughness={0.9} />
          </mesh>
        </group>
      ))}
      {casas.map((c, i) => (
        <Sobrado key={i} c={c} semente={`${semente}s${i}`} noite={noite} />
      ))}
      {/* mesas de bar na frente do bar */}
      {casas
        .filter((c) => c.loja?.[0] === "BAR")
        .map((c, i) =>
          [-1, 1].map((k) => <MesaBar key={`${i}${k}`} pos={[c.lado * 4.6, 0.16, c.z + k * 1.15]} cor={k > 0 ? "#f2c230" : "#f4f4f2"} giroY={0.3 * k} />),
        )}
      {postes.map((p, i) => (
        <Poste key={i} pos={p} giroY={Math.PI / 2} aceso={noite} />
      ))}
      <Fios pontos={postes} alturas={[7.4, 7.1, 6.8, 6.4]} />
      {Array.from({ length: carros }, (_, i) => {
        const lado = i % 2 ? 1 : -1;
        return <Carro key={i} pos={[lado * 2.5, 0, -comprimento / 2 + 8 + random(`${semente}cz${i}`) * (comprimento - 16)]} giroY={lado > 0 ? 0 : Math.PI} semente={`${semente}c${i}`} farolAceso={noite} />;
      })}
      {Array.from({ length: Math.floor(comprimento / 20) }, (_, i) => (
        <Arvore key={i} pos={[(i % 2 ? 1 : -1) * 4.65, 0.16, -comprimento / 2 + 14 + i * 20]} tam={0.75 + random(`${semente}ar${i}`) * 0.25} semente={`${semente}ar${i}`} />
      ))}
      {morro && (
        <>
          <Morro pos={[-25, 0, -comprimento / 2 - 260]} raio={95} altura={95} semente={`${semente}m1`} pedra={0.95} />
          <Morro pos={[110, 0, -comprimento / 2 - 380]} raio={120} altura={60} semente={`${semente}m2`} pedra={0.2} />
        </>
      )}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[600, 600]} />
        <meshStandardMaterial color="#8c8273" roughness={1} />
      </mesh>
    </group>
  );
};
