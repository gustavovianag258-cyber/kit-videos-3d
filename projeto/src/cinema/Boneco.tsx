import { useLoader, useThree } from "@react-three/fiber";
import { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { clone as clonarComEsqueleto } from "three/examples/jsm/utils/SkeletonUtils.js";
import { AnimacaoMixamo, prepararClipe, urlAnimacao } from "./Mixamo";

// Boneco: gente "escrita em código" no estilo do Culturaverso (que também é Claude Code + Remotion +
// Three.js). Corpo liso de cor única, pescoço e membros compridos, rosto de desenho (olho grande com
// pálpebra e brilho, nariz e lábios marcados), roupa de cor sólida com manga bufante, tênis arredondado e
// cabelo marcante. O corpo é montado em cima do esqueleto das animações do Mixamo (o próprio idle.fbx,
// em T, em centímetros), então as 25 animações baixadas servem em qualquer boneco.

export type Visual = {
  corpo?: "homem" | "mulher";
  pele?: string;
  cabelo?: "curto" | "raspado" | "black" | "coque" | "trancas" | "longo" | "rabo" | "careca" | "bone";
  corCabelo?: string;
  corBone?: string;
  barba?: boolean;
  camisa?: string;
  listras?: string; // segunda cor da camisa listrada
  manga?: "curta" | "longa" | "regata";
  calca?: string;
  perna?: "bermuda" | "short" | "calca";
  vestido?: string; // no lugar de camisa + calça
  sapato?: string;
  peso?: number; // 0,9 magro · 1 normal · 1,2 cheinho
  brinco?: boolean;
  olhos?: string;
  avental?: string; // avental de comerciante por cima da roupa (cor)
};

export type PropsBoneco = {
  visual: Visual;
  animacao: AnimacaoMixamo;
  t: number; // segundos (preso ao quadro do Remotion)
  velocidade?: number;
  pos?: [number, number, number];
  giroY?: number;
  altura?: number; // metros
  noLugar?: boolean;
  falando?: boolean;
  semente?: number; // muda o ritmo da piscada
  // PRIMEIRA PESSOA: a câmera vai para os olhos dele (a cabeça some) e você vê as mãos/braços.
  // inclinar: quanto olha para baixo (0 = reto, 0,5 = para as mãos); fov: abertura da lente
  primeiraPessoa?: boolean | { inclinar?: number; fov?: number; olharPara?: [number, number, number] };
  naMao?: "celular" | "coco"; // objeto na mão direita
  telaCelular?: "pix" | "camera" | "mensagens";
};

type V3 = THREE.Vector3;
type Pesos = [number, number][]; // [índice do osso, peso]
const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const suave = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const cor = (c: string) => new THREE.Color(c);
const escurecer = (c: string, k: number) => new THREE.Color(c).multiplyScalar(k);

// ---------- formas ----------

// raio ao longo do eixo, interpolado suave (Catmull-Rom) entre os pontos do perfil [distância, raio]
const raioEm = (perfil: [number, number][], d: number) => {
  if (d <= perfil[0][0]) return perfil[0][1];
  const n = perfil.length;
  if (d >= perfil[n - 1][0]) return perfil[n - 1][1];
  let i = 0;
  while (perfil[i + 1][0] < d) i++;
  const p0 = perfil[Math.max(0, i - 1)][1];
  const p1 = perfil[i][1];
  const p2 = perfil[i + 1][1];
  const p3 = perfil[Math.min(n - 1, i + 2)][1];
  const t = (d - perfil[i][0]) / (perfil[i + 1][0] - perfil[i][0]);
  return 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t);
};

// Tubo liso de a até b com raio variável e seção elíptica (su = largura, sv = profundidade/altura),
// com tampas arredondadas opcionais. Sem costura: as normais saem lisas em volta toda.
const tubo = (
  a: V3,
  b: V3,
  perfil: [number, number][],
  o: { su?: number; sv?: number; tampaIni?: boolean; tampaFim?: boolean; passo?: number; lados?: number; fundoIni?: number; fundoFim?: number } = {},
) => {
  // fundoIni/fundoFim: profundidade da tampa em relação ao raio (0,9 = meia esfera; menor = mais achatada)
  const { su = 1, sv = 1, tampaIni = true, tampaFim = true, passo = 1.2, lados = 28, fundoIni = 0.9, fundoFim = 0.9 } = o;
  const dir = b.clone().sub(a);
  const comp = dir.length();
  dir.normalize();
  const ref = Math.abs(dir.z) > 0.8 ? v3(0, 1, 0) : v3(0, 0, 1);
  const vv = ref.clone().sub(dir.clone().multiplyScalar(ref.dot(dir))).normalize();
  const uu = vv.clone().cross(dir);
  const d0 = perfil[0][0];
  const d1 = perfil[perfil.length - 1][0];
  const aneis: [number, number][] = [];
  const r0 = raioEm(perfil, d0);
  const r1 = raioEm(perfil, d1);
  if (tampaIni) for (let k = 6; k >= 1; k--) {
    const th = (k / 7) * (Math.PI / 2);
    aneis.push([d0 - r0 * Math.sin(th) * fundoIni, r0 * Math.cos(th)]);
  }
  const n = Math.max(2, Math.ceil((d1 - d0) / passo));
  for (let i = 0; i <= n; i++) {
    const d = d0 + ((d1 - d0) * i) / n;
    aneis.push([d, raioEm(perfil, d)]);
  }
  if (tampaFim) for (let k = 1; k <= 6; k++) {
    const th = (k / 7) * (Math.PI / 2);
    aneis.push([d1 + r1 * Math.sin(th) * fundoFim, r1 * Math.cos(th)]);
  }
  const pos: number[] = [];
  const idx: number[] = [];
  const ponto = (d: number, r: number, f: number) => {
    const c = a.clone().add(dir.clone().multiplyScalar((d / comp) * comp));
    c.add(uu.clone().multiplyScalar(Math.cos(f) * r * su)).add(vv.clone().multiplyScalar(Math.sin(f) * r * sv));
    pos.push(c.x, c.y, c.z);
  };
  for (const [d, r] of aneis) for (let j = 0; j < lados; j++) ponto(d, r, (j / lados) * Math.PI * 2);
  for (let k = 0; k < aneis.length - 1; k++)
    for (let j = 0; j < lados; j++) {
      const A = k * lados + j;
      const B = k * lados + ((j + 1) % lados);
      const C = (k + 1) * lados + j;
      const D = (k + 1) * lados + ((j + 1) % lados);
      idx.push(A, B, C, B, D, C);
    }
  const nA = aneis.length * lados;
  if (tampaIni) {
    const [d] = aneis[0];
    const c = a.clone().add(dir.clone().multiplyScalar(d - r0 * 0.13 * fundoIni));
    pos.push(c.x, c.y, c.z);
    for (let j = 0; j < lados; j++) idx.push(nA, (j + 1) % lados, j);
  }
  if (tampaFim) {
    const [d] = aneis[aneis.length - 1];
    const c = a.clone().add(dir.clone().multiplyScalar(d + r1 * 0.13 * fundoFim));
    pos.push(c.x, c.y, c.z);
    const p = pos.length / 3 - 1;
    const base = (aneis.length - 1) * lados;
    for (let j = 0; j < lados; j++) idx.push(base + j, base + ((j + 1) % lados), p);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
};

const elipsoide = (c: V3, r: V3, seg = 32) => {
  const g = new THREE.SphereGeometry(1, seg, Math.round(seg * 0.7));
  g.applyMatrix4(new THREE.Matrix4().compose(c, new THREE.Quaternion(), r));
  return g;
};

// liso de verdade: junta os vértices repetidos da costura antes de calcular as normais
const alisar = (g: THREE.BufferGeometry) => {
  g.deleteAttribute("normal");
  g.deleteAttribute("uv");
  const m = mergeVertices(g, 1e-3);
  m.computeVertexNormals();
  return m;
};

// ---------- corpo com pele (skinning) ----------

class Malha {
  pos: number[] = [];
  nor: number[] = [];
  cor: number[] = [];
  si: number[] = [];
  sw: number[] = [];
  idx: number[] = [];
  reg: number[] = [];
  // regiao = 1: a cor vem do material (gola, alça, listra e avental desenhados ponto a ponto, borda lisa)
  add(g: THREE.BufferGeometry, c: THREE.Color | ((p: V3) => THREE.Color), pesos: (p: V3) => Pesos, regiao = 0) {
    const base = this.pos.length / 3;
    const P = g.attributes.position;
    const N = g.attributes.normal;
    const p = new THREE.Vector3();
    for (let i = 0; i < P.count; i++) {
      p.fromBufferAttribute(P, i);
      this.pos.push(p.x, p.y, p.z);
      this.nor.push(N.getX(i), N.getY(i), N.getZ(i));
      const k = typeof c === "function" ? c(p) : c;
      this.cor.push(k.r, k.g, k.b);
      this.reg.push(regiao);
      const w = pesos(p)
        .filter(([, x]) => x > 0.001)
        .sort((x, y) => y[1] - x[1])
        .slice(0, 4);
      const soma = w.reduce((s, [, x]) => s + x, 0) || 1;
      for (let j = 0; j < 4; j++) {
        this.si.push(w[j]?.[0] ?? 0);
        this.sw.push(w[j] ? w[j][1] / soma : 0);
      }
    }
    const I = g.index!;
    for (let i = 0; i < I.count; i++) this.idx.push(base + I.getX(i));
  }
  geometria() {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(this.pos, 3));
    g.setAttribute("normal", new THREE.Float32BufferAttribute(this.nor, 3));
    g.setAttribute("color", new THREE.Float32BufferAttribute(this.cor, 3));
    g.setAttribute("skinIndex", new THREE.Uint16BufferAttribute(this.si, 4));
    g.setAttribute("skinWeight", new THREE.Float32BufferAttribute(this.sw, 4));
    g.setAttribute("aRegiao", new THREE.Float32BufferAttribute(this.reg, 1));
    g.setIndex(this.idx);
    return g;
  }
}

// Pesos por "corrente" de juntas: cada osso manda no trecho dele, e perto de cada junta o peso passa
// suavemente para o osso vizinho (h = meia largura da dobra, em cm) — dobra de cotovelo/joelho lisa.
const corrente = (juntas: V3[], ossos: number[], pai?: number, filho?: number, h = 3) => {
  const arcos = [0];
  for (let i = 1; i < juntas.length; i++) arcos.push(arcos[i - 1] + juntas[i].distanceTo(juntas[i - 1]));
  return (p: V3): Pesos => {
    let melhor = Infinity;
    let u = 0;
    for (let i = 0; i < juntas.length - 1; i++) {
      const a = juntas[i];
      const ab = juntas[i + 1].clone().sub(a);
      const L = ab.length();
      const t = Math.min(1, Math.max(0, p.clone().sub(a).dot(ab) / (L * L)));
      const d = a.clone().add(ab.multiplyScalar(t)).distanceTo(p);
      if (d < melhor) {
        melhor = d;
        u = arcos[i] + t * L;
      }
    }
    let j = 0;
    for (let i = 1; i < arcos.length; i++) if (Math.abs(arcos[i] - u) < Math.abs(arcos[j] - u)) j = i;
    const antes = j === 0 ? pai : ossos[j - 1];
    const depois = j === juntas.length - 1 ? filho : ossos[j];
    const f = suave(arcos[j] - h, arcos[j] + h, u);
    if (antes === undefined) return [[depois ?? ossos[0], 1]];
    if (depois === undefined) return [[antes, 1]];
    return [
      [antes, 1 - f],
      [depois, f],
    ];
  };
};

// ---------- cabelo com fios/tranças desenhados no material ----------

const materialCabelo = (c: string, modo: "fios" | "faixas" | "liso") => {
  const m = new THREE.MeshStandardMaterial({ color: cor(c), roughness: 0.62, metalness: 0 });
  if (modo === "liso") return m;
  m.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vLocal;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvLocal = position;");
    sh.fragmentShader = sh.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vLocal;")
      .replace(
        "#include <map_fragment>",
        modo === "fios"
          ? `float ang = atan(vLocal.x, vLocal.y + 4.0);
             float s = 0.5 + 0.5 * sin(ang * 78.0);
             diffuseColor.rgb *= mix(0.55, 1.15, smoothstep(0.15, 0.85, s));`
          : `float s = 0.5 + 0.5 * sin(vLocal.y * 4.2);
             diffuseColor.rgb *= mix(0.6, 1.12, smoothstep(0.1, 0.9, s));`,
      );
  };
  m.customProgramCacheKey = () => "cabelo-" + modo;
  return m;
};

// ---------- montagem ----------

const PELES = { padrao: "#c98e6a" };

const montarBoneco = (esqueleto: THREE.Group, vis: Visual) => {
  const raiz = clonarComEsqueleto(esqueleto) as THREE.Group;
  raiz.position.set(0, 0, 0);
  raiz.rotation.set(0, 0, 0);
  raiz.scale.set(1, 1, 1);
  raiz.updateMatrixWorld(true);

  const ossos: THREE.Bone[] = [];
  const indice: Record<string, number> = {};
  const porNome: Record<string, THREE.Bone> = {};
  let prefixo = "mixamorig";
  raiz.traverse((o) => {
    if (!(o as THREE.Bone).isBone) return;
    const m = /^(mixamorig\d*):?(.*)$/.exec(o.name);
    const nome = m ? m[2] : o.name;
    if (indice[nome] !== undefined) return;
    if (m && nome === "Hips") prefixo = m[1];
    indice[nome] = ossos.length;
    porNome[nome] = o as THREE.Bone;
    ossos.push(o as THREE.Bone);
  });
  const P = (n: string) => porNome[n].getWorldPosition(new THREE.Vector3());
  const O = (n: string) => indice[n];

  const mulher = vis.corpo === "mulher";
  const peso = vis.peso ?? 1;
  const pm = 1 + (peso - 1) * 0.6; // membros engordam menos que o tronco
  const pele = cor(vis.pele ?? PELES.padrao);
  const vestido = vis.vestido;
  const camisa = vestido ?? vis.camisa ?? "#f2f2f2";
  const calca = vestido ?? vis.calca ?? "#3f6fb0";
  const sapato = cor(vis.sapato ?? "#f4f4f4");
  const manga = vis.manga ?? "curta";
  const perna = vis.perna ?? "bermuda";
  // gola (camiseta mostra o pescoço; regata/vestido têm alça, cava e decote), listras e avental são
  // desenhados ponto a ponto no material do corpo (função roupa() lá embaixo): borda lisa no close.
  const alcas = manga === "regata" || !!vestido;

  const m = new Malha();

  // tronco (camisa)
  const ta = v3(0, 96, -0.5);
  const tb = v3(0, 151, -3.5);
  const perfilTronco: [number, number][] = (mulher
    ? [[-0.6, 15.5], [0, 18.6], [4, 17.0], [9, 14.4], [14, 12.8], [24, 13.0], [34, 14.2], [42, 14.6], [47, 14.0], [51, 12.2], [54, 8.4], [56, 5]]
    : [[-0.6, 15.0], [0, 17.8], [5, 16.6], [10, 15.0], [14, 14.6], [24, 15.0], [34, 16.4], [42, 16.8], [47, 16.0], [51, 13.6], [54, 8.8], [56, 5.2]]
  ).map(([d, r]) => [d, r * (d < 50 ? peso : 1)] as [number, number]);
  const pesoColuna = corrente(
    [P("Hips"), P("Spine"), P("Spine1"), P("Spine2"), P("Neck")],
    [O("Hips"), O("Spine"), O("Spine1"), O("Spine2")],
    undefined,
    O("Neck"),
    5,
  );
  const pesoTronco = (p: V3): Pesos => {
    const w = pesoColuna(p);
    // a parte de cima dos lados acompanha o ombro (encolher, levantar o braço)
    const s = suave(9, 15, Math.abs(p.x)) * suave(132, 143, p.y) * 0.7;
    if (s <= 0) return w;
    return [...w.map(([o, x]) => [o, x * (1 - s)] as [number, number]), [O(p.x > 0 ? "LeftShoulder" : "RightShoulder"), s]];
  };
  const gTronco = tubo(ta, tb, perfilTronco, { sv: 0.6, tampaIni: false, passo: 0.6, lados: 56 });
  // peito da mulher e barriga de quem é mais cheinho: o próprio tecido estufa, suave
  // (peça separada colada no tronco fica caricata e corta a estampa)
  if (mulher || peso > 1.05) {
    const pt = gTronco.attributes.position;
    for (let i = 0; i < pt.count; i++) {
      const x = pt.getX(i);
      const y = pt.getY(i);
      const z = pt.getZ(i);
      if (z < 1) continue;
      let dz = 0;
      if (mulher) dz += 2.3 * peso * (Math.exp(-(((x - 5.2) / 4.6) ** 2)) + Math.exp(-(((x + 5.2) / 4.6) ** 2))) * Math.exp(-(((y - 127.5) / 5.2) ** 2));
      if (peso > 1.05) dz += (peso - 1) * 30 * Math.exp(-((x / 11) ** 2)) * Math.exp(-(((y - 110) / 9) ** 2));
      pt.setZ(i, z + dz * suave(1, 5, z));
    }
    gTronco.computeVertexNormals();
  }
  m.add(gTronco, cor("#ffffff"), pesoTronco, 1);

  // quadril (bermuda / saia por baixo)
  const pesoQuadril = (p: V3): Pesos => {
    const f = suave(91, 80, p.y) * suave(2, 8, Math.abs(p.x)) * 0.8;
    return [[O("Hips"), 1 - f], [O(p.x > 0 ? "LeftUpLeg" : "RightUpLeg"), f]];
  };
  const rq = (mulher ? 18.0 : 17.0) * peso;
  m.add(
    // começa por dentro da camisa (mais estreito que ela na cintura) e desce até a virilha com fundo achatado
    tubo(v3(0, 100, -1), v3(0, 84, -1), [[0, rq - 3.2], [4, rq - 0.9], [8, rq], [12, rq - 0.6], [16, rq - 2.2]], { sv: 0.6, tampaIni: false, fundoFim: 0.28, passo: 1 }),
    cor(calca),
    pesoQuadril,
  );

  if (vis.avental) {
    const ca = cor(vis.avental);
    const saia = new THREE.BoxGeometry(23, 30, 0.5, 12, 12, 1);
    const ps = saia.attributes.position;
    for (let i = 0; i < ps.count; i++) {
      const x = ps.getX(i);
      ps.setZ(i, ps.getZ(i) - (x / 11.5) ** 2 * 5); // acompanha a curva do quadril
    }
    saia.translate(0, 82, (mulher ? 10.6 : 10.2) * peso);
    saia.computeVertexNormals();
    m.add(saia, ca, (p) => [[O("Hips"), 0.7], [O(p.x > 0 ? "LeftUpLeg" : "RightUpLeg"), 0.3 * suave(95, 70, p.y)]]);
    for (const lado of [-1, 1])
      m.add(tubo(v3(6.8 * lado, 138.5, 6.5), v3(4.2 * lado, 149, -3.5), [[0, 0.55], [12, 0.55]], { lados: 8 }), ca, () => [[O("Spine2"), 0.6], [O("Neck"), 0.4]]);
  }

  // pescoço
  const pesoPescoco = corrente([P("Neck"), P("Head")], [O("Neck")], O("Spine2"), O("Head"), 3);
  m.add(tubo(v3(0, 144, -3.2), v3(0, 163, -0.5), [[0, mulher ? 4.0 : 4.6], [19, mulher ? 3.8 : 4.4]], { tampaIni: false }), pele, pesoPescoco);

  for (const lado of [-1, 1]) {
    const L = lado > 0 ? "Left" : "Right";

    // braço inteiro (ombro → punho), dobra no cotovelo
    const raizBraco = P(`${L}Shoulder`).add(v3(lado * 3, 0, -0.5));
    const ombro = P(`${L}Arm`);
    const punho = P(`${L}Hand`);
    const o0 = raizBraco.distanceTo(ombro); // ~9 cm dentro do tronco antes do ombro
    const perfilBraco: [number, number][] = [[0, 5.0], [o0, 4.8], [o0 + 8, 4.3], [o0 + 20, 3.7], [o0 + 27.7, 3.3], [o0 + 34, 3.4], [o0 + 46, 2.7], [o0 + 55.6, 2.3]].map(
      ([d, r]) => [d, r * pm * (mulher ? 0.9 : 1)] as [number, number],
    );
    const pesoBraco = corrente([raizBraco, ombro, P(`${L}ForeArm`), punho], [O(`${L}Shoulder`), O(`${L}Arm`), O(`${L}ForeArm`)], O("Spine2"), O(`${L}Hand`), 3);
    m.add(tubo(raizBraco, punho, perfilBraco), pele, pesoBraco);
    if (manga !== "regata") {
      const fim = o0 + (manga === "longa" ? 53 : 13);
      const perfilManga: [number, number][] =
        manga === "longa"
          ? [[1, 6.0], [o0, 5.9], [o0 + 20, 5.0], [o0 + 40, 4.4], [fim, 4.0], [fim + 0.6, 2.6]]
          : [[1, 5.6 * pm], [o0, 5.8 * pm], [o0 + 8, 5.5 * pm], [fim - 0.6, 5.2 * pm], [fim, 4.2 * pm]];
      m.add(tubo(raizBraco, punho, perfilManga, { tampaFim: false }), cor("#ffffff"), pesoBraco, 1);
    }

    // mão: palma + dedos que dobram de verdade
    const mao = P(`${L}Hand`);
    const meio = P(`${L}HandMiddle1`);
    m.add(elipsoide(mao.clone().lerp(meio, 0.55).add(v3(0, -0.2, -0.9)), v3(5.4, 1.9, 4.4)), pele, () => [[O(`${L}Hand`), 1]]);
    for (const [dedo, r] of [["Index", 0.95], ["Middle", 0.98], ["Ring", 0.92], ["Pinky", 0.8], ["Thumb", 1.1]] as const) {
      const js = [1, 2, 3, 4].map((k) => P(`${L}Hand${dedo}${k}`));
      const g = tubo(js[0], js[3], [[0, r], [js[0].distanceTo(js[3]), r * 0.92]], { lados: 14, passo: 0.8 });
      m.add(g, pele, corrente(js, [1, 2, 3].map((k) => O(`${L}Hand${dedo}${k}`)), O(`${L}Hand`), O(`${L}Hand${dedo}3`), 0.9));
    }

    // perna inteira (virilha → tornozelo), dobra no joelho
    const virilha = P(`${L}UpLeg`);
    const tornozelo = P(`${L}Foot`);
    const perfilPerna: [number, number][] = [[0, 7.2], [8, 7.0], [22, 6.2], [36, 5.2], [41.8, 4.9], [47, 5.1], [54, 5.4], [64, 4.2], [76, 3.3], [80.8, 3.2]].map(
      ([d, r]) => [d, r * pm * (mulher && d < 40 ? 1.05 : 1)] as [number, number],
    );
    const pesoPerna = corrente([virilha, P(`${L}Leg`), tornozelo], [O(`${L}UpLeg`), O(`${L}Leg`)], O("Hips"), O(`${L}Foot`), 4);
    m.add(tubo(virilha, tornozelo, [[2, perfilPerna[0][1] * 0.85], ...perfilPerna.slice(1)], { fundoIni: 0.4 }), pele, pesoPerna);
    if (!vestido) {
      const fim = perna === "calca" ? 78 : perna === "short" ? 15 : 31;
      const perfilBermuda: [number, number][] = perfilPerna
        .filter(([d]) => d < fim)
        .map(([d, r]) => [d, r + 0.7 + (perna === "calca" ? 0.3 : 1.0 * (d / fim))] as [number, number]);
      perfilBermuda.push([fim, raioEm(perfilPerna, fim) + (perna === "calca" ? 1.4 : 2.2)], [fim + 0.5, raioEm(perfilPerna, fim) + 0.1]);
      m.add(tubo(virilha, tornozelo, perfilBermuda, { tampaIni: false, tampaFim: false }), cor(calca), pesoPerna);
    }

    // tênis arredondado de bico fino (sola clara)
    const pe = P(`${L}Foot`);
    const ponta = P(`${L}Toe_End`);
    const calcanhar = v3(pe.x, 4.3, pe.z - 5.2);
    const bico = v3(ponta.x, 3.3, ponta.z - 3.5);
    const gT = tubo(calcanhar, bico, [[0, 4.3], [8, 4.7], [17, 4.5], [22, 3.6], [calcanhar.distanceTo(bico), 2.5]], { su: 0.92, sv: 0.86 });
    const pp = gT.attributes.position;
    for (let i = 0; i < pp.count; i++) if (pp.getY(i) < 0.4) pp.setY(i, 0.4);
    gT.computeVertexNormals();
    const pesoPe = corrente([pe, P(`${L}ToeBase`), ponta], [O(`${L}Foot`), O(`${L}ToeBase`)], undefined, undefined, 3);
    m.add(gT, (p) => (p.y < 1.9 ? cor("#d9d6d0") : sapato), pesoPe);
    m.add(elipsoide(pe.clone().add(v3(0, -2.5, -0.8)), v3(3.9, 3.6, 4.2)), sapato, () => [[O(`${L}Foot`), 1]]);
  }

  // saia do vestido
  if (vestido) {
    const pesoSaia = (p: V3): Pesos => {
      const f = suave(95, 60, p.y) * suave(3, 12, Math.abs(p.x)) * 0.55;
      return [[O("Hips"), 1 - f], [O(p.x > 0 ? "LeftUpLeg" : "RightUpLeg"), f]];
    };
    m.add(
      tubo(v3(0, 103, 0), v3(0, 56, 1), [[0, 14 * peso], [10, 17.5 * peso], [25, 21], [46, 23.5], [47, 21.5]], { sv: 0.8, tampaIni: false, tampaFim: false }),
      cor(vestido),
      pesoSaia,
    );
  }

  const matCorpo = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.74, metalness: 0, side: THREE.DoubleSide });
  const listras = vis.listras ? cor(vis.listras) : cor(camisa);
  matCorpo.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, {
      uCamisa: { value: cor(camisa) },
      uListras: { value: listras },
      uPele: { value: pele },
      uAvental: { value: cor(vis.avental ?? camisa) },
      uFlags: { value: new THREE.Vector4(vis.listras ? 1 : 0, vis.avental ? 1 : 0, alcas ? 1 : 0, mulher ? 1 : 0) },
    });
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", "#include <common>\nattribute float aRegiao;\nvarying float vRegiao;\nvarying vec3 vRest;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvRest = position;\nvRegiao = aRegiao;");
    sh.fragmentShader = sh.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
        varying float vRegiao;
        varying vec3 vRest;
        uniform vec3 uCamisa, uListras, uPele, uAvental;
        uniform vec4 uFlags; // listras, avental, alças, mulher
        vec3 roupa(vec3 p) {
          float ax = abs(p.x);
          bool frente = p.z > -1.0;
          bool mulher = uFlags.w > 0.5;
          vec3 c = uCamisa;
          if (uFlags.x > 0.5 && mod(floor((p.y - 90.0) / 3.2), 2.0) < 0.5) c = uListras;
          if (uFlags.y > 0.5 && p.z > 2.0 && p.y > 92.0 && p.y < (ax < 7.2 ? 139.0 : 120.0 - (ax - 7.2) * 1.2) && ax < 13.5) c = uAvental;
          bool decote;
          if (uFlags.z > 0.5) {
            float larg = mulher ? 5.6 : 6.0;
            float fundo = frente ? (mulher ? 9.5 : 7.0) : 4.5;
            float u = clamp(ax / larg, 0.0, 1.0);
            // decote em U (arredondado) e cava funda dos lados
            // cava: elipse em volta do ombro (sem degrau)
            float cx = (ax - (mulher ? 16.0 : 17.0)) / (mulher ? 5.6 : 5.4);
            float cy = (p.y - 143.0) / 11.5;
            decote = (cx * cx + cy * cy < 1.0) || (ax < larg && p.y > 145.0 - fundo * sqrt(1.0 - u * u));
          } else {
            float meio = max(0.0, 1.0 - (p.x / 6.8) * (p.x / 6.8));
            decote = ax < 7.6 && p.y > 147.4 - (frente ? 3.4 : 0.9) * meio;
          }
          return decote ? uPele : c;
        }`,
      )
      .replace("#include <color_fragment>", "#include <color_fragment>\nif (vRegiao > 0.5) diffuseColor.rgb = roupa(vRest);");
  };
  matCorpo.customProgramCacheKey = () => "boneco-roupa";
  const corpo = new THREE.SkinnedMesh(m.geometria(), matCorpo);
  corpo.castShadow = true;
  corpo.receiveShadow = true;
  corpo.frustumCulled = false;
  raiz.add(corpo);
  raiz.updateMatrixWorld(true);
  corpo.bind(new THREE.Skeleton(ossos));

  // ---------- cabeça (presa ao osso Head; coordenadas a partir do centro da cabeça) ----------
  const centro = P("Head").add(v3(0, 13.3, 3.9));
  const cabeca = new THREE.Group();
  new THREE.Matrix4()
    .copy(porNome.Head.matrixWorld)
    .invert()
    .multiply(new THREE.Matrix4().makeTranslation(centro.x, centro.y, centro.z))
    .decompose(cabeca.position, cabeca.quaternion, cabeca.scale);
  porNome.Head.add(cabeca);

  const RX = mulher ? 10.4 : 10.8;
  const RY = 13.0;
  const RZ = 11.6;
  const afina = (uy: number) => (uy < 0 ? 1 - 0.36 * Math.pow(-uy, 1.5) : 1);
  const deformar = (g: THREE.BufferGeometry, rx: number, ry: number, rz: number) => {
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      const y = p.getY(i);
      const z = p.getZ(i);
      p.setXYZ(i, x * rx * afina(y), y * ry, z * rz * (z < 0 ? 1.06 : 1));
    }
    return g;
  };
  // z da superfície do rosto num ponto (x, y)
  const sup = (x: number, y: number) => {
    const uy = y / RY;
    const ux = x / (RX * afina(uy));
    return RZ * Math.sqrt(Math.max(0, 1 - ux * ux - uy * uy));
  };
  const malhaRosto = (g: THREE.BufferGeometry, c: THREE.Color | THREE.Material, rough = 0.7) => {
    const mat = (c as THREE.Material).isMaterial ? (c as THREE.Material) : new THREE.MeshStandardMaterial({ color: c as THREE.Color, roughness: rough });
    const me = new THREE.Mesh(g, mat);
    me.castShadow = true;
    me.receiveShadow = true;
    return me;
  };
  const corPele = vis.pele ?? PELES.padrao;
  cabeca.add(malhaRosto(alisar(deformar(new THREE.SphereGeometry(1, 64, 48), RX, RY, RZ)), pele, 0.74));

  // orelhas
  for (const lado of [-1, 1]) {
    const g = new THREE.SphereGeometry(1, 20, 14);
    g.applyMatrix4(new THREE.Matrix4().compose(v3(lado * RX * 0.96, 0.4, -0.6), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, lado * 0.35, 0)), v3(1.3, 2.9, 2.1)));
    cabeca.add(malhaRosto(g, pele, 0.74));
    if (vis.brinco) {
      const b = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.16, 8, 24), new THREE.MeshStandardMaterial({ color: "#e0b040", metalness: 0.9, roughness: 0.3 }));
      b.position.set(lado * RX * 1.0, -3.4, 0.2);
      b.rotation.y = Math.PI / 2;
      cabeca.add(b);
    }
  }

  // olhos: globo branco, íris grande, brilho, pálpebra de pele com linha de cílios (pisca girando)
  const palpebras: THREE.Group[] = [];
  const RO = 2.35;
  const branco = new THREE.MeshStandardMaterial({ color: "#f3efe8", roughness: 0.35 });
  const iris = new THREE.MeshStandardMaterial({ color: vis.olhos ?? "#24160f", roughness: 0.25 });
  const brilho = new THREE.MeshBasicMaterial({ color: "#ffffff" });
  const cilio = new THREE.MeshStandardMaterial({ color: "#16100c", roughness: 0.6 });
  const corPalpebra = escurecer(corPele, 0.9);
  for (const lado of [-1, 1]) {
    const x = 4.0 * lado;
    const y = 2.2;
    const olho = new THREE.Group();
    olho.position.set(x, y, sup(x, y) - 1.15);
    olho.rotation.y = lado * 0.12;
    olho.add(malhaRosto(new THREE.SphereGeometry(RO, 28, 20), branco));
    const ir = malhaRosto(new THREE.SphereGeometry(1.5, 24, 16), iris);
    ir.position.z = 1.2;
    olho.add(ir);
    const br = new THREE.Mesh(new THREE.SphereGeometry(0.33, 10, 8), brilho);
    br.position.copy(v3(0.38 * lado, 0.45, 1).normalize().multiplyScalar(RO + 0.32));
    olho.add(br);
    const pivo = new THREE.Group();
    const tampa = malhaRosto(new THREE.SphereGeometry(RO + 0.14, 28, 14, 0, Math.PI * 2, 0, 1.3), corPalpebra, 0.74);
    pivo.add(tampa);
    const lr = RO + 0.14;
    const linha = new THREE.Mesh(new THREE.TorusGeometry(lr * Math.sin(1.3), mulher ? 0.24 : 0.17, 6, 40), cilio);
    linha.position.y = lr * Math.cos(1.3);
    linha.rotation.x = Math.PI / 2;
    pivo.add(linha);
    olho.add(pivo);
    palpebras.push(pivo);
    // sobrancelha
    const sb = new THREE.Mesh(new THREE.CapsuleGeometry(mulher ? 0.32 : 0.42, 3.0, 4, 10), new THREE.MeshStandardMaterial({ color: escurecer(vis.corCabelo ?? "#1f150f", 0.8), roughness: 0.8 }));
    sb.position.set(x + 0.2 * lado, 5.5, sup(x, 5.5) + 0.05);
    sb.rotation.set(-0.35, lado * 0.32, Math.PI / 2 - lado * 0.1);
    cabeca.add(sb);
    cabeca.add(olho);
  }

  // nariz: ponte, ponta e asas
  const corNariz = escurecer(corPele, 0.97);
  const topoN = v3(0, 2.2, sup(0, 2.2) - 0.35);
  const pontaN = v3(0, -1.8, sup(0, -1.8) + 1.6);
  cabeca.add(malhaRosto(alisar(tubo(topoN, pontaN, [[0, 0.75], [topoN.distanceTo(pontaN), 1.0]], { lados: 16 })), corNariz, 0.7));
  cabeca.add(malhaRosto(elipsoide(pontaN, v3(1.15, 1.05, 1.05), 20), corNariz, 0.7));
  for (const lado of [-1, 1]) cabeca.add(malhaRosto(elipsoide(v3(1.15 * lado, -2.1, sup(1.15, -2.1) + 0.35), v3(0.8, 0.65, 0.75), 16), corNariz, 0.7));

  // boca: dois lábios e o escuro de dentro (abre quando fala)
  const corLabio = new THREE.Color(corPele).lerp(cor("#8c3a3a"), 0.35).multiplyScalar(0.82);
  const boca = new THREE.Group();
  const yb = -5.2;
  boca.position.set(0, yb, sup(0, yb) - 0.2);
  const lSup = malhaRosto(elipsoide(v3(0, 0.55, 0.15), v3(2.5, 0.62, 0.8), 20), corLabio, 0.55);
  const lInf = malhaRosto(elipsoide(v3(0, -0.55, 0.1), v3(2.1, 0.75, 0.85), 20), corLabio, 0.55);
  const dentro = malhaRosto(elipsoide(v3(0, 0, -0.1), v3(1.9, 0.5, 0.6), 16), cor("#2a0e0e"), 0.9);
  boca.add(dentro, lSup, lInf);
  if (vis.barba) boca.position.z += 0.5;
  cabeca.add(boca);

  // ---------- cabelo ----------
  const corC = vis.corCabelo ?? "#1f150f";
  const capa = (tampa: number, giro: number, folga: number, mat: THREE.Material) => {
    const g = new THREE.SphereGeometry(1, 48, 28, 0, Math.PI * 2, 0, tampa);
    g.applyMatrix4(new THREE.Matrix4().makeRotationX(giro));
    deformar(g, RX + folga, RY + folga, RZ + folga);
    g.computeVertexNormals();
    const me = new THREE.Mesh(g, mat);
    me.castShadow = true;
    return me;
  };
  const estilo = vis.cabelo ?? "curto";
  const fios = materialCabelo(corC, "fios");
  if (estilo === "curto") cabeca.add(capa(1.55, -0.55, 0.9, fios));
  if (estilo === "raspado") cabeca.add(capa(1.6, -0.5, 0.2, materialCabelo(new THREE.Color(corC).lerp(new THREE.Color(corPele), 0.35).getStyle(), "liso")));
  if (estilo === "black") {
    cabeca.add(capa(1.55, -0.55, 0.6, materialCabelo(corC, "liso")));
    const g = alisar(elipsoide(v3(0, 5, -4), v3(14.8, 13.8, 13.8), 40));
    const me = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: cor(corC), roughness: 0.95 }));
    me.castShadow = true;
    cabeca.add(me);
  }
  if (estilo === "coque" || estilo === "trancas") {
    cabeca.add(capa(1.55, -0.5, 0.5, fios));
    const bun = new THREE.Mesh(alisar(elipsoide(v3(0, 12.5, -5.5), v3(5.6, 5.0, 5.6), 28)), materialCabelo(corC, "fios"));
    bun.castShadow = true;
    cabeca.add(bun);
  }
  if (estilo === "trancas") {
    const faixas = materialCabelo(corC, "faixas");
    for (let i = 0; i < 26; i++) {
      const k = i - 12.5;
      const ang = Math.PI + k * 0.105;
      const topo = v3(Math.sin(ang) * 10.6, 1.5 - Math.abs(k) * 0.22 + (i % 2) * 0.8, Math.cos(ang) * 10.9 - 1);
      const fim = topo.clone().add(v3(Math.sin(ang) * 3 + Math.sin(i * 2.1) * 0.8, -33 + Math.abs(k) * 0.9 + Math.sin(i * 1.7) * 2.5, -2.2 - (i % 3) * 0.5));
      const g = tubo(topo, fim, [[0, 0.55], [topo.distanceTo(fim), 0.42]], { lados: 8, passo: 0.8 });
      const me = new THREE.Mesh(g, faixas);
      me.castShadow = true;
      cabeca.add(me);
    }
  }
  if (estilo === "longo") {
    cabeca.add(capa(1.6, -0.45, 0.7, fios));
    for (const g of [elipsoide(v3(0, -8, -7.2), v3(11.6, 17, 6.4), 32), elipsoide(v3(-10, -5, -1.8), v3(2.8, 12.5, 4.2), 20), elipsoide(v3(10, -5, -1.8), v3(2.8, 12.5, 4.2), 20)]) {
      const me = new THREE.Mesh(alisar(g), fios);
      me.castShadow = true;
      cabeca.add(me);
    }
  }
  if (estilo === "rabo") {
    cabeca.add(capa(1.55, -0.5, 0.5, fios));
    const me = new THREE.Mesh(tubo(v3(0, 4, -12), v3(0, -17, -15.5), [[0, 3.0], [8, 2.8], [21, 1.4]], { lados: 16 }), materialCabelo(corC, "faixas"));
    me.castShadow = true;
    cabeca.add(me);
  }
  if (estilo === "bone") {
    const corB = vis.corBone ?? "#1d3557";
    const matB = new THREE.MeshStandardMaterial({ color: cor(corB), roughness: 0.8 });
    cabeca.add(capa(1.45, -0.25, 1.4, matB));
    const aba = new THREE.Mesh(alisar(elipsoide(v3(0, 6.2, 11.5), v3(7.8, 0.55, 6.5), 28)), matB);
    aba.rotation.x = 0.12;
    aba.castShadow = true;
    cabeca.add(aba);
  }
  if (vis.barba) {
    const g = new THREE.SphereGeometry(1, 48, 20, 0.2, Math.PI - 0.4, 1.72, 1.1);
    deformar(g, RX + 0.5, RY + 0.45, RZ + 0.55);
    g.computeVertexNormals();
    const matBarba = new THREE.MeshStandardMaterial({ color: cor(corC), roughness: 0.95, side: THREE.DoubleSide });
    cabeca.add(new THREE.Mesh(g, matBarba));
    const bigode = new THREE.Mesh(new THREE.CapsuleGeometry(0.75, 3.2, 4, 10), matBarba);
    bigode.rotation.z = Math.PI / 2;
    bigode.position.set(0, -3.75, sup(0, -3.75) + 0.35);
    cabeca.add(bigode);
  }

  const quadril = porNome.Hips.position.y;
  const repousoCabeca = porNome.Head.getWorldQuaternion(new THREE.Quaternion()).invert();
  return { raiz, prefixo, quadril, palpebras, boca: { lInf, dentro }, cabeca, ossoCabeca: porNome.Head, repousoCabeca, maoD: porNome.RightHand, P };
};

// tela do celular (canvas): Pix, câmera ou conversa
const telaDoCelular = (tipo: "pix" | "camera" | "mensagens") => {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 512;
  const ctx = c.getContext("2d")!;
  if (tipo === "camera") {
    const g = ctx.createLinearGradient(0, 0, 0, 512);
    g.addColorStop(0, "#f7b98a");
    g.addColorStop(0.55, "#9fc4e8");
    g.addColorStop(1, "#2f5d7a");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 512);
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = 2;
    for (const k of [1, 2]) {
      ctx.beginPath();
      ctx.moveTo((256 * k) / 3, 40);
      ctx.lineTo((256 * k) / 3, 440);
      ctx.moveTo(0, 40 + (400 * k) / 3);
      ctx.lineTo(256, 40 + (400 * k) / 3);
      ctx.stroke();
    }
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 440, 256, 72);
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(128, 476, 24, 0, Math.PI * 2);
    ctx.fill();
  } else if (tipo === "pix") {
    ctx.fillStyle = "#f6f7f9";
    ctx.fillRect(0, 0, 256, 512);
    ctx.fillStyle = "#32bcad";
    ctx.fillRect(0, 0, 256, 90);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 34px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Pix", 128, 60);
    ctx.fillStyle = "#222";
    ctx.font = "20px Arial";
    ctx.fillText("Pagar", 128, 140);
    ctx.font = "bold 44px Arial";
    ctx.fillText("R$ 15,00", 128, 200);
    ctx.fillStyle = "#32bcad";
    ctx.fillRect(28, 400, 200, 54);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 24px Arial";
    ctx.fillText("Confirmar", 128, 435);
  } else {
    ctx.fillStyle = "#ece5dd";
    ctx.fillRect(0, 0, 256, 512);
    ctx.fillStyle = "#1f8f5f";
    ctx.fillRect(0, 0, 256, 64);
    for (let i = 0; i < 6; i++) {
      const eu = i % 2 === 1;
      ctx.fillStyle = eu ? "#d9fdd3" : "#ffffff";
      const w = 120 + ((i * 37) % 70);
      ctx.fillRect(eu ? 256 - w - 14 : 14, 90 + i * 64, w, 44);
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

// Prende um objeto na mão direita. Coordenadas da pose em T (mão direita em x negativo, palma para
// baixo): o objeto fica embaixo da palma, a tela virada para fora dela (quando a mão gira para o
// rosto, a tela olha para os olhos).
const montarNaMao = (b: ReturnType<typeof montarBoneco>, tipo: "celular" | "coco", tela: "pix" | "camera" | "mensagens") => {
  const mao = b.P("RightHand");
  const g = new THREE.Group();
  new THREE.Matrix4()
    .copy(b.maoD.matrixWorld)
    .invert()
    .multiply(new THREE.Matrix4().makeTranslation(mao.x, mao.y, mao.z))
    .decompose(g.position, g.quaternion, g.scale);
  if (tipo === "celular") {
    const corpo = new THREE.Mesh(new THREE.BoxGeometry(14.5, 0.9, 7.2), new THREE.MeshStandardMaterial({ color: "#1b1b1f", roughness: 0.35, metalness: 0.4 }));
    corpo.position.set(0, 0, 0);
    const t = telaDoCelular(tela);
    const visor = new THREE.Mesh(new THREE.PlaneGeometry(13.4, 6.4), new THREE.MeshStandardMaterial({ map: t, emissiveMap: t, emissive: new THREE.Color("#ffffff"), emissiveIntensity: 0.5, roughness: 0.2 }));
    // a tela olha para -y; o "alto" da tela aponta para os dedos (-x)
    visor.rotation.set(Math.PI / 2, 0, -Math.PI / 2);
    visor.position.set(0, -0.47, 0);
    // na animação de mexer no celular a palma fica de lado: gira o aparelho para a tela olhar o rosto
    const aparelho = new THREE.Group();
    aparelho.add(corpo, visor);
    aparelho.rotation.x = GIRO_CELULAR;
    aparelho.position.set(-8, -2.6, -0.6);
    g.add(aparelho);
  } else {
    const coco = new THREE.Mesh(new THREE.SphereGeometry(7, 24, 18), new THREE.MeshStandardMaterial({ color: "#6d9a2c", roughness: 0.6 }));
    coco.position.set(-6, -7.5, 0);
    const canudo = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 9, 8), new THREE.MeshStandardMaterial({ color: "#e63946" }));
    canudo.position.set(-6, -14, 1.5);
    g.add(coco, canudo);
  }
  g.traverse((o) => ((o as THREE.Mesh).castShadow = true));
  b.maoD.add(g);
  return g;
};

const GIRO_CELULAR = -Math.PI / 2;
const ESQUELETO: AnimacaoMixamo = "idle";
const ALTURA_MODELO = 184; // cm, do tênis ao alto da cabeça

export const Boneco: React.FC<PropsBoneco> = ({
  visual,
  animacao,
  t,
  velocidade = 1,
  pos = [0, 0, 0],
  giroY = 0,
  altura = 1.75,
  noLugar = true,
  falando = false,
  semente = 0,
  primeiraPessoa,
  naMao,
  telaCelular = "mensagens",
}) => {
  const camera = useThree((st) => st.camera) as THREE.PerspectiveCamera;
  const esqueleto = useLoader(FBXLoader, urlAnimacao(ESQUELETO));
  const anim = useLoader(FBXLoader, urlAnimacao(animacao));
  const chave = JSON.stringify(visual);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const b = useMemo(() => montarBoneco(esqueleto, visual), [esqueleto, chave]);
  const mixer = useMemo(() => new THREE.AnimationMixer(b.raiz), [b]);
  const objeto = useMemo(() => (naMao ? montarNaMao(b, naMao, telaCelular) : null), [b, naMao, telaCelular]);
  useLayoutEffect(() => () => void objeto?.removeFromParent(), [objeto]);
  const clipe = useMemo(() => prepararClipe(anim, b.prefixo, b.quadril, noLugar), [anim, b, noLugar]);
  useMemo(() => {
    mixer.stopAllAction();
    mixer.clipAction(clipe).play();
  }, [mixer, clipe]);

  useLayoutEffect(() => {
    mixer.setTime(Math.max(0, t) * velocidade);
    // piscada: a cada ~3,4 s, fecha e abre em 0,16 s
    const ciclo = 3.4 + (semente % 5) * 0.37;
    const fase = (t + semente * 1.13) % ciclo;
    const fecha = fase < 0.16 ? Math.sin((fase / 0.16) * Math.PI) : 0;
    for (const p of b.palpebras) p.rotation.x = -0.2 + fecha * 1.55;
    // fala: a boca abre e fecha em ritmo irregular
    const abre = falando ? Math.abs(Math.sin(t * 10.7) * Math.sin(t * 6.3 + 1.1)) : 0;
    b.boca.lInf.position.y = -0.55 - abre * 1.1;
    b.boca.dentro.scale.y = 1 + abre * 2.2;
    b.boca.dentro.position.y = -abre * 0.55;

    // primeira pessoa: câmera nos olhos, olhando para onde a cabeça olha (suavizado pelo corpo)
    b.cabeca.visible = !primeiraPessoa;
    if (primeiraPessoa) {
      const op = typeof primeiraPessoa === "object" ? primeiraPessoa : {};
      b.raiz.updateWorldMatrix(true, true);
      const qCab = b.ossoCabeca.getWorldQuaternion(new THREE.Quaternion()).multiply(b.repousoCabeca);
      const centro = b.ossoCabeca.getWorldPosition(new THREE.Vector3());
      const frenteCab = new THREE.Vector3(0, 0, 1).applyQuaternion(qCab);
      const cimaCab = new THREE.Vector3(0, 1, 0).applyQuaternion(qCab);
      const e = altura / ALTURA_MODELO;
      const olho = centro.add(cimaCab.clone().multiplyScalar(15 * e)).add(frenteCab.clone().multiplyScalar(9 * e));
      const corpo = new THREE.Vector3(Math.sin(giroY), 0, Math.cos(giroY));
      const frente = corpo.lerp(frenteCab, 0.6).normalize();
      frente.y -= op.inclinar ?? 0.15;
      camera.position.copy(olho);
      camera.up.set(0, 1, 0).lerp(cimaCab, 0.3).normalize();
      if (op.olharPara) camera.lookAt(...op.olharPara);
      else camera.lookAt(olho.clone().add(frente));
      const fov = op.fov ?? 68;
      if (camera.fov !== fov) {
        camera.fov = fov;
        camera.updateProjectionMatrix();
      }
    }
  });

  const escala = altura / ALTURA_MODELO;
  return <primitive object={b.raiz} position={pos} rotation={[0, giroY, 0]} scale={escala} />;
};
