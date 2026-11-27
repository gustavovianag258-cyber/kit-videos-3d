import { useGLTF } from "@react-three/drei";
import { useLayoutEffect, useMemo } from "react";
import { staticFile } from "remotion";
import * as THREE from "three";
import { clone as clonarComEsqueleto } from "three/examples/jsm/utils/SkeletonUtils.js";

// Pessoa semi-realista (Quaternius Universal Base Characters + Universal Animation Library, CC0).
// Os corpos-base vêm sem roupa: a roupa é pintada no próprio corpo pelo shader, usando a posição
// do vértice na pose em T (1,81 m de altura, braços abertos no eixo x). A animação é sempre
// presa ao quadro do Remotion (mixer.setTime), nunca ao relógio.

export type Corpo = "homem" | "mulher";
export type Cabelo = "curto" | "raspado" | "longo" | "coque" | "raspadoF" | "barba" | "nenhum";
export type Animacao =
  | "Idle_Loop" | "Idle_Talking_Loop" | "Walk_Loop" | "Walk_Formal_Loop" | "Jog_Fwd_Loop" | "Sprint_Loop"
  | "Swim_Fwd_Loop" | "Swim_Idle_Loop" | "Sitting_Idle_Loop" | "Sitting_Talking_Loop" | "Sitting_Enter" | "Sitting_Exit"
  | "Jump_Start" | "Jump_Loop" | "Jump_Land" | "Death01" | "Hit_Chest" | "Hit_Head" | "Dance_Loop" | "Interact"
  | "PickUp_Table" | "Crouch_Idle_Loop" | "Crouch_Fwd_Loop" | "Roll" | "Push_Loop" | "Driving_Loop"
  | "Pistol_Aim_Neutral" | "Pistol_Shoot" | "Pistol_Idle_Loop" | "Spell_Simple_Idle_Loop" | "Spell_Simple_Shoot"
  | "Fixing_Kneeling" | "Punch_Jab" | "Punch_Cross" | "A_TPose";

export type Roupa = {
  camisa?: string | null; // null = sem camisa
  mangaLonga?: boolean;
  calca: string;
  bermuda?: boolean; // até o joelho
  sapato?: string | null; // null = descalço
  vestido?: boolean;
};

const ARQ_CORPO: Record<Corpo, string> = {
  homem: "modelos/gente/Superhero_Male_FullBody.gltf",
  mulher: "modelos/gente/Superhero_Female_FullBody.gltf",
};
const ARQ_CABELO: Record<Exclude<Cabelo, "nenhum">, string> = {
  curto: "modelos/cabelos/Hair_SimpleParted.gltf",
  raspado: "modelos/cabelos/Hair_Buzzed.gltf",
  raspadoF: "modelos/cabelos/Hair_BuzzedFemale.gltf",
  longo: "modelos/cabelos/Hair_Long.gltf",
  coque: "modelos/cabelos/Hair_Buns.gltf",
  barba: "modelos/cabelos/Hair_Beard.gltf",
};
export const ARQ_ANIMACOES = "modelos/animacoes.glb";

// Pré-carrega tudo (o ThreeCanvas do Remotion espera o Suspense antes de renderizar o quadro)
export const precarregarGente = () => {
  Object.values(ARQ_CORPO).forEach((a) => useGLTF.preload(staticFile(a)));
  Object.values(ARQ_CABELO).forEach((a) => useGLTF.preload(staticFile(a)));
  useGLTF.preload(staticFile(ARQ_ANIMACOES));
};

// Roupa pintada no corpo: máscaras pela posição na pose em T
const vestir = (base: THREE.MeshStandardMaterial, roupa: Roupa, pele: number, suaviza = 0) => {
  const m = base.clone();
  const cor = (c: string | null | undefined, padrao: string) => new THREE.Color(c ?? padrao);
  const u = {
    uCamisa: { value: cor(roupa.camisa, "#000000") },
    uTemCamisa: { value: roupa.camisa ? 1 : 0 },
    uMangaLonga: { value: roupa.mangaLonga ? 1 : 0 },
    uCalca: { value: cor(roupa.calca, "#222222") },
    uBermuda: { value: roupa.bermuda ? 1 : 0 },
    uVestido: { value: roupa.vestido ? 1 : 0 },
    uSapato: { value: cor(roupa.sapato, "#000000") },
    uTemSapato: { value: roupa.sapato ? 1 : 0 },
    uPele: { value: pele },
    uSuaviza: { value: suaviza },
  };
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, u);
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vPosT;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvPosT = position;");
    sh.fragmentShader = sh.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
        varying vec3 vPosT;
        uniform vec3 uCamisa, uCalca, uSapato;
        uniform float uTemCamisa, uMangaLonga, uBermuda, uVestido, uTemSapato, uPele, uSuaviza;
        float ruidoT(vec3 p){ return fract(sin(dot(p, vec3(12.9898,78.233,37.719))) * 43758.5453); }`,
      )
      .replace(
        "#include <map_fragment>",
        `#include <map_fragment>
        float ax = abs(vPosT.x);
        float y = vPosT.y;
        // músculos pintados na textura (tanquinho, peitoral, braço): mistura com a própria pele
        // desfocada (mipmap alto), mantendo o tom e tirando o desenho dos gomos
        #ifdef USE_MAP
          vec3 peleLisa = texture2D(map, vMapUv, 5.0).rgb;
          float corpoNu = step(0.55, y) * step(y, 1.5) * step(ax, 0.75);
          diffuseColor.rgb = mix(diffuseColor.rgb, peleLisa, uSuaviza * corpoNu);
        #endif
        // tom de pele (1 = textura original, <1 mais claro, >1 mais escuro)
        diffuseColor.rgb = pow(max(diffuseColor.rgb, 0.0), vec3(uPele));
        float tronco = step(ax, 0.235) * step(0.93, y) * step(y, 1.47);
        float manga = step(0.16, ax) * step(ax, mix(0.40, 0.80, uMangaLonga)) * step(1.30, y) * step(y, 1.56);
        float camisa = max(tronco, manga) * uTemCamisa;
        float pernas = step(ax, 0.30) * step(mix(0.10, 0.52, uBermuda), y) * step(y, 1.0);
        float vestido = uVestido * step(ax, 0.30) * step(0.55, y) * step(y, 1.0);
        float calca = max(pernas * (1.0 - uVestido), 0.0);
        float sapato = step(y, 0.105) * uTemSapato;
        // trama do tecido: um pouco de ruído para não ficar plástico
        float trama = 0.94 + 0.06 * ruidoT(floor(vPosT * 900.0));
        diffuseColor.rgb = mix(diffuseColor.rgb, uCalca * trama, calca);
        diffuseColor.rgb = mix(diffuseColor.rgb, uCamisa * trama, max(camisa, vestido));
        diffuseColor.rgb = mix(diffuseColor.rgb, uSapato, sapato);`,
      );
  };
  m.customProgramCacheKey = () => JSON.stringify(roupa) + pele + suaviza;
  return m;
};

// Liga o cabelo (malha presa no osso Head do próprio arquivo) ao esqueleto do corpo, pelo nome dos ossos
const prenderCabelo = (cabelo: THREE.Object3D, corpo: THREE.Object3D, cor: string) => {
  const ossos = new Map<string, THREE.Bone>();
  corpo.traverse((o) => {
    if ((o as THREE.Bone).isBone) ossos.set(o.name, o as THREE.Bone);
  });
  const malhas: THREE.SkinnedMesh[] = [];
  cabelo.traverse((o) => {
    if ((o as THREE.SkinnedMesh).isSkinnedMesh) malhas.push(o as THREE.SkinnedMesh);
  });
  return malhas.map((m) => {
    const novos = m.skeleton.bones.map((b) => ossos.get(b.name) ?? b);
    const sk = new THREE.Skeleton(novos, m.skeleton.boneInverses);
    const copia = new THREE.SkinnedMesh(m.geometry, (m.material as THREE.MeshStandardMaterial).clone());
    const mat = copia.material as THREE.MeshStandardMaterial;
    mat.color = new THREE.Color(cor);
    mat.alphaTest = 0.45;
    mat.transparent = false;
    mat.side = THREE.DoubleSide;
    copia.bind(sk, m.bindMatrix);
    copia.castShadow = true;
    copia.frustumCulled = false;
    return copia;
  });
};

// Físico: os 2 corpos grátis são de "super-herói". O "comum" afina pelo esqueleto (peito e ombros
// mais estreitos, braços e coxas mais finos) e suaviza o relevo da pele (o normal map desenha o
// tanquinho). Fatores [x, y, z] no espaço do osso; y é o comprimento do osso e fica 1.
type Fisico = "comum" | "magro" | "atletico";
const AFINA: Record<Fisico, Record<string, [number, number, number]>> = {
  atletico: {},
  comum: {
    spine_02: [0.94, 1, 0.93],
    spine_03: [0.9, 1, 0.88],
    // o pescoço desfaz o afinamento do tronco para a cabeça não achatar
    neck_01: [1 / (0.94 * 0.9), 1, 1 / (0.93 * 0.88)],
    thigh_l: [0.9, 1, 0.9],
    thigh_r: [0.9, 1, 0.9],
  },
  magro: {
    spine_01: [0.95, 1, 0.94],
    spine_02: [0.92, 1, 0.9],
    spine_03: [0.86, 1, 0.84],
    neck_01: [1 / (0.95 * 0.92 * 0.86), 1, 1 / (0.94 * 0.9 * 0.84)],
    thigh_l: [0.84, 1, 0.84],
    thigh_r: [0.84, 1, 0.84],
  },
};
const RELEVO: Record<Fisico, number> = { atletico: 1, comum: 0.2, magro: 0.12 };
const SUAVIZA: Record<Fisico, number> = { atletico: 0, comum: 0.7, magro: 0.85 };

export type PropsPessoa = {
  corpo: Corpo;
  roupa: Roupa;
  cabelo?: Cabelo;
  corCabelo?: string;
  pele?: number; // 0,7 clara · 1 morena (textura) · 1,4 bem escura
  animacao: Animacao;
  t: number; // segundos dentro da animação
  velocidade?: number;
  pos?: [number, number, number];
  giroY?: number;
  altura?: number; // em metros (padrão 1,78 homem / 1,66 mulher)
  fisico?: Fisico;
};

export const Pessoa: React.FC<PropsPessoa> = ({
  corpo,
  roupa,
  cabelo = "curto",
  corCabelo = "#1b120c",
  pele = 1,
  animacao,
  t,
  velocidade = 1,
  pos = [0, 0, 0],
  giroY = 0,
  altura,
  fisico = "comum",
}) => {
  const base = useGLTF(staticFile(ARQ_CORPO[corpo]));
  const anim = useGLTF(staticFile(ARQ_ANIMACOES));
  const arqCabelo = cabelo === "nenhum" ? null : ARQ_CABELO[cabelo];
  const gCabelo = useGLTF(staticFile(arqCabelo ?? ARQ_CABELO.curto));

  const { cena, mixer } = useMemo(() => {
    const cena = clonarComEsqueleto(base.scene);
    cena.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      m.castShadow = true;
      m.receiveShadow = true;
      m.frustumCulled = false;
      const mat = m.material as THREE.MeshStandardMaterial;
      if (/Superhero/.test(mat.name)) {
        const v = vestir(mat, roupa, pele, SUAVIZA[fisico]);
        v.normalScale = new THREE.Vector2(RELEVO[fisico], RELEVO[fisico]);
        m.material = v;
      }
      // sobrancelhas e cabelo usam o alpha da textura (sem isso viram uma mancha clara no rosto)
      else if (/Hair/.test(mat.name)) {
        const h = mat.clone();
        h.alphaTest = 0.45;
        h.transparent = false;
        h.color = new THREE.Color(corCabelo);
        m.material = h;
      }
    });
    if (arqCabelo) for (const c of prenderCabelo(clonarComEsqueleto(gCabelo.scene), cena, corCabelo)) cena.add(c);
    return { cena, mixer: new THREE.AnimationMixer(cena) };
    // a roupa é fixa por pessoa
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base.scene, gCabelo.scene]);

  const clipe = useMemo(() => anim.animations.find((a) => a.name === animacao) ?? anim.animations[0], [anim.animations, animacao]);
  useMemo(() => {
    mixer.stopAllAction();
    mixer.clipAction(clipe).play();
  }, [mixer, clipe]);
  const ossos = useMemo(() => {
    const lista: [THREE.Object3D, [number, number, number]][] = [];
    cena.traverse((o) => {
      const f = AFINA[fisico][o.name];
      if (f) lista.push([o, f]);
    });
    return lista;
  }, [cena, fisico]);
  useLayoutEffect(() => {
    mixer.setTime(Math.max(0, t) * velocidade);
    // a animação grava a escala dos ossos a cada quadro: o afinamento vem depois dela
    for (const [o, [x, y, z]] of ossos) o.scale.set(o.scale.x * x, o.scale.y * y, o.scale.z * z);
  });

  const escala = (altura ?? (corpo === "homem" ? 1.78 : 1.66)) / (corpo === "homem" ? 1.81 : 1.77);
  return <primitive object={cena} position={pos} rotation={[0, giroY, 0]} scale={escala} />;
};
