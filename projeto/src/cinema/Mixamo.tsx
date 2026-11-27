import { useLoader } from "@react-three/fiber";
import { useLayoutEffect, useMemo } from "react";
import { staticFile } from "remotion";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { clone as clonarComEsqueleto } from "three/examples/jsm/utils/SkeletonUtils.js";

// Personagens do Mixamo (Adobe, grátis, royalty-free para vídeo): estilo de animação parecido com o
// Culturaverso. Todos usam o mesmo esqueleto ("mixamorig"), então qualquer animação serve em qualquer
// personagem. Arquivos em public/modelos/mixamo/{personagens,animacoes}/*.fbx (em centímetros).

export const PERSONAGENS = ["remy", "ch03", "ch06", "ch07", "ch16", "ch21", "ch31", "swat", "the-boss", "ch08", "ch12", "ch29", "ch39", "ty", "lola", "rapaz"] as const;
// personagens gerados por IA (FLUX → TRELLIS → auto-rig do Mixamo): a textura já vem lisa e "sombreada"
const DE_IA = new Set<string>(["rapaz"]);
export type Personagem = (typeof PERSONAGENS)[number];

export const ANIMACOES = [
  "idle", "walking", "running", "talking", "laughing", "waving", "pointing", "surprised", "sitting-idle",
  "texting-while-standing", "clapping", "standing-thumbs-up", "shrugging", "terrified", "sad-idle", "crying",
  "sitting-talking", "laying-sleeping", "getting-up", "neck-stretching", "jumping", "falling", "treading-water",
  "drinking", "hip-hop-dancing",
] as const;
export type AnimacaoMixamo = (typeof ANIMACOES)[number];

const urlPersonagem = (p: Personagem) => staticFile(`modelos/mixamo/personagens/${p}.fbx`);
export const urlAnimacao = (a: AnimacaoMixamo) => staticFile(`modelos/mixamo/animacoes/${a}.fbx`);

// Material "fosco de animação": troca o Phong do FBX por Standard (reage à luz e ao céu HDRI).
// No acabamento "culturaverso" a textura é lida já suavizada (mipmap mais alto): some o poro, a
// costura e o relevo de jogo, fica a pele lisa e a roupa de cor sólida do canal de referência.
const LISO = 2.2;
const paraStandard = (m: THREE.Material) => {
  const v = m as THREE.MeshPhongMaterial;
  const s = new THREE.MeshStandardMaterial({
    name: v.name,
    color: v.color,
    map: v.map ?? null,
    transparent: v.transparent,
    opacity: v.opacity,
    alphaTest: v.transparent ? 0.3 : 0,
    roughness: 0.88,
    metalness: 0,
    side: THREE.FrontSide,
  });
  if (s.map) {
    s.map.colorSpace = THREE.SRGBColorSpace;
    s.map.anisotropy = 4;
    s.onBeforeCompile = (sh) => {
      sh.fragmentShader = sh.fragmentShader.replace(
        "#include <map_fragment>",
        `#ifdef USE_MAP
          vec4 corLisa = texture2D(map, vMapUv, ${LISO.toFixed(1)});
          diffuseColor *= corLisa;
        #endif`,
      );
    };
    s.customProgramCacheKey = () => "liso";
  }
  return s;
};

// Acabamento dos personagens de IA (igual ao teste EstiloIA): sem o borrão extra, um pouco da própria
// textura como emissiva clareia as sombras pintadas sem achatar, e fica fosco como no Culturaverso.
const paraIA = (m: THREE.Material) => {
  const v = m as THREE.MeshPhongMaterial;
  if (v.map) v.map.colorSpace = THREE.SRGBColorSpace;
  return new THREE.MeshStandardMaterial({
    name: v.name,
    map: v.map ?? null,
    emissiveMap: v.map ?? null,
    emissive: new THREE.Color(v.map ? "#ffffff" : "#000000"),
    emissiveIntensity: 0.32,
    roughness: 0.92,
    metalness: 0,
    envMapIntensity: 0.6,
  });
};

// Normais lisas para malha sem normais e sem índice (a da IA chega assim do Mixamo): soma a normal das
// faces em cada posição repetida, sem olhar a UV (senão a costura da textura vira um vinco).
const normaisLisas = (g: THREE.BufferGeometry) => {
  const p = g.attributes.position;
  const chave = (i: number) => `${p.getX(i).toFixed(4)},${p.getY(i).toFixed(4)},${p.getZ(i).toFixed(4)}`;
  const soma = new Map<string, THREE.Vector3>();
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  const n = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i += 3) {
    a.fromBufferAttribute(p, i);
    b.fromBufferAttribute(p, i + 1);
    c.fromBufferAttribute(p, i + 2);
    const f = c.sub(b).cross(a.sub(b)); // tamanho = área: face grande pesa mais
    for (let k = 0; k < 3; k++) {
      const ch = chave(i + k);
      if (!soma.has(ch)) soma.set(ch, new THREE.Vector3());
      soma.get(ch)!.add(f);
    }
  }
  for (let i = 0; i < p.count; i++) {
    const v = soma.get(chave(i))!.clone().normalize();
    n.set([v.x, v.y, v.z], i * 3);
  }
  g.setAttribute("normal", new THREE.BufferAttribute(n, 3));
};

// Prepara a animação do Mixamo para um esqueleto: troca o prefixo dos ossos, ajusta a escala do quadril
// e (noLugar) tira o deslocamento para o trajeto ser controlado por pos. Usado também pelo Boneco.
export const prepararClipe = (anim: THREE.Group, prefixo: string, quadril: number, noLugar: boolean) => {
  const c = anim.animations[0].clone();
  // traduz o nome dos ossos da animação para o prefixo deste personagem
  for (const tr of c.tracks) tr.name = tr.name.replace(/^mixamorig\d*:?/, prefixo);
  // a animação guarda a posição do quadril na unidade dela (cm); o personagem pode estar em metros
  // (os da IA) ou ter perna de outro tamanho: ajusta pela altura do quadril de cada um
  let quadrilAnim = 0;
  anim.traverse((o) => {
    if (/^mixamorig\d*:?Hips$/.test(o.name)) quadrilAnim = o.position.y;
  });
  for (const tr of c.tracks)
    if (/Hips\.position$/.test(tr.name) && quadril > 0 && quadrilAnim > 0) {
      const r = quadril / quadrilAnim;
      for (let i = 0; i < tr.values.length; i++) tr.values[i] *= r;
    }
  if (noLugar)
    for (const tr of c.tracks)
      if (/Hips\.position$/.test(tr.name)) {
        // mantém só a altura do quadril (o "sobe e desce" do passo); x e z ficam no 1º valor
        const v = tr.values;
        for (let i = 3; i < v.length; i += 3) {
          v[i] = v[0];
          v[i + 2] = v[2];
        }
      }
  return c;
};

export type PropsMixamo = {
  personagem: Personagem;
  animacao: AnimacaoMixamo;
  t: number; // segundos dentro da animação (preso ao quadro do Remotion)
  velocidade?: number;
  pos?: [number, number, number];
  giroY?: number;
  altura?: number; // em metros; se omitido usa o tamanho original
  noLugar?: boolean; // tira o deslocamento do quadril (andar/correr ficam parados; o trajeto é por pos)
};

export const PessoaMixamo: React.FC<PropsMixamo> = ({ personagem, animacao, t, velocidade = 1, pos = [0, 0, 0], giroY = 0, altura, noLugar = true }) => {
  const fbx = useLoader(FBXLoader, urlPersonagem(personagem));
  const anim = useLoader(FBXLoader, urlAnimacao(animacao));

  const { cena, mixer, alturaOriginal, pe, prefixo, quadril } = useMemo(() => {
    const cena = clonarComEsqueleto(fbx) as THREE.Group;
    cena.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      m.castShadow = true;
      m.receiveShadow = true;
      m.frustumCulled = false;
      const conv = DE_IA.has(personagem) ? paraIA : paraStandard;
      m.material = Array.isArray(m.material) ? m.material.map(conv) : conv(m.material);
      if (!m.geometry.attributes.normal) {
        m.geometry = m.geometry.clone();
        if (m.geometry.index) m.geometry.computeVertexNormals();
        else normaisLisas(m.geometry);
      }
    });
    const caixa = new THREE.Box3().setFromObject(fbx);
    // cada personagem pode ter um prefixo diferente nos ossos (mixamorig, mixamorig1, mixamorig9…)
    let prefixo = "mixamorig";
    let quadril = 0;
    cena.traverse((o) => {
      const m = /^(mixamorig\d*):?Hips$/.exec(o.name);
      if (m) {
        prefixo = m[1];
        quadril = o.position.y;
      }
    });
    const alturaOriginal = caixa.max.y - caixa.min.y;
    return { cena, mixer: new THREE.AnimationMixer(cena), alturaOriginal, pe: caixa.min.y, prefixo, quadril };
  }, [fbx, personagem]);

  const clipe = useMemo(() => prepararClipe(anim, prefixo, quadril, noLugar), [anim, noLugar, prefixo, quadril]);

  useMemo(() => {
    mixer.stopAllAction();
    mixer.clipAction(clipe).play();
  }, [mixer, clipe]);
  useLayoutEffect(() => {
    mixer.setTime(Math.max(0, t) * velocidade);
  });

  // FBX do Mixamo vem em centímetros (os de IA, em metros)
  const escala = altura ? altura / alturaOriginal : alturaOriginal > 10 ? 0.01 : 1;
  // apoia os pés no chão (alguns modelos têm a origem acima dos pés)
  return <primitive object={cena} position={[pos[0], pos[1] - pe * escala, pos[2]]} rotation={[0, giroY, 0]} scale={escala} />;
};
