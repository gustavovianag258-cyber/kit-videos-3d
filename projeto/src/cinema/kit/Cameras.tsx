import { useThree } from "@react-three/fiber";
import { useLayoutEffect } from "react";
import * as THREE from "three";

// KIT DE CÂMERAS (linguagem do Culturaverso, estudada quadro a quadro no vídeo dos polos magnéticos):
// voo contínuo que entra e sai dos lugares, por cima do ombro, seguir alguém, vista de cima (olho de
// Deus), órbita, rente ao chão e câmera na mão. A PRIMEIRA PESSOA fica no próprio <Boneco primeiraPessoa>.
// Tudo preso ao tempo do vídeo (s em segundos), nada de relógio.

export type V3 = [number, number, number];
const v = (a: V3) => new THREE.Vector3(...a);
export const suave = (x: number) => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * t * (t * (t * 6 - 15) + 10);
};

// balanço de câmera na mão (determinístico)
export const tremor = (s: number, forca = 1): V3 => [
  (Math.sin(s * 1.7) * 0.6 + Math.sin(s * 4.3 + 1) * 0.25) * 0.025 * forca,
  (Math.sin(s * 2.3 + 2) * 0.6 + Math.sin(s * 5.1) * 0.2) * 0.018 * forca,
  0,
];

// Base: põe a câmera num ponto olhando para outro (com rolo e lente)
export const CameraLivre: React.FC<{ pos: V3; alvo: V3; fov?: number; rolo?: number; cima?: V3 }> = ({ pos, alvo, fov = 40, rolo = 0, cima = [0, 1, 0] }) => {
  const camera = useThree((st) => st.camera) as THREE.PerspectiveCamera;
  useLayoutEffect(() => {
    camera.position.set(...pos);
    camera.up.set(...cima);
    camera.lookAt(...alvo);
    if (rolo) camera.rotateZ(rolo);
    if (camera.fov !== fov) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
  });
  return null;
};

// VOO CONTÍNUO: a câmera passa por pontos-chave (posição, alvo e lente em cada instante) num
// caminho curvo e liso — é o plano longo que sai de um lugar e entra em outro sem cortar.
export type Chave = { t: number; pos: V3; alvo: V3; fov?: number };
export const posicaoNoTrajeto = (chaves: Chave[], s: number) => {
  const t0 = chaves[0].t;
  const t1 = chaves[chaves.length - 1].t;
  // acelera no começo e freia no fim; entre as chaves anda num ritmo contínuo
  const T = t0 + suave((s - t0) / (t1 - t0)) * (t1 - t0);
  let i = 0;
  while (i < chaves.length - 2 && T > chaves[i + 1].t) i++;
  const local = Math.min(1, Math.max(0, (T - chaves[i].t) / (chaves[i + 1].t - chaves[i].t)));
  const u = (i + local) / (chaves.length - 1);
  const cp = new THREE.CatmullRomCurve3(chaves.map((c) => v(c.pos)), false, "centripetal");
  const ca = new THREE.CatmullRomCurve3(chaves.map((c) => v(c.alvo)), false, "centripetal");
  const fa = chaves[i].fov ?? 40;
  const fb = chaves[i + 1].fov ?? fa;
  return { pos: cp.getPoint(u).toArray() as V3, alvo: ca.getPoint(u).toArray() as V3, fov: fa + (fb - fa) * local };
};
export const CameraTrajeto: React.FC<{ chaves: Chave[]; s: number; mao?: number }> = ({ chaves, s, mao = 0 }) => {
  const c = posicaoNoTrajeto(chaves, s);
  const m = tremor(s, mao);
  return <CameraLivre pos={[c.pos[0] + m[0], c.pos[1] + m[1], c.pos[2]]} alvo={c.alvo} fov={c.fov} />;
};

// POR CIMA DO OMBRO: atrás de quem está em pos (virado para giroY), do lado direito (lado = 1) ou
// esquerdo (-1), olhando para onde a pessoa olha (ou para alvo)
export const CameraOmbro: React.FC<{ pos: V3; giroY: number; s: number; lado?: number; altura?: number; distancia?: number; alvo?: V3; fov?: number }> = ({
  pos,
  giroY,
  s,
  lado = 1,
  altura = 1.7,
  distancia = 0.75,
  alvo,
  fov = 40,
}) => {
  const frente = new THREE.Vector3(Math.sin(giroY), 0, Math.cos(giroY));
  const direita = new THREE.Vector3(-frente.z, 0, frente.x);
  const p = v(pos).add(frente.clone().multiplyScalar(-distancia)).add(direita.clone().multiplyScalar(0.38 * lado));
  p.y = pos[1] + altura;
  const a = alvo ?? (v(pos).add(frente.clone().multiplyScalar(3)).setY(pos[1] + 1.3).toArray() as V3);
  const m = tremor(s, 0.6);
  return <CameraLivre pos={[p.x + m[0], p.y + m[1], p.z]} alvo={a} fov={fov} />;
};

// SEGUIR: atrás (atras = true) ou na frente de alguém que anda, com um leve atraso de câmera
export const CameraSegue: React.FC<{ pos: V3; giroY: number; s: number; atras?: boolean; distancia?: number; altura?: number; fov?: number }> = ({
  pos,
  giroY,
  s,
  atras = false,
  distancia = 2.6,
  altura = 1.5,
  fov = 42,
}) => {
  const frente = new THREE.Vector3(Math.sin(giroY), 0, Math.cos(giroY));
  const p = v(pos).add(frente.clone().multiplyScalar(atras ? -distancia : distancia));
  p.y = pos[1] + altura;
  const m = tremor(s, 1);
  return <CameraLivre pos={[p.x + m[0], p.y + m[1], p.z]} alvo={[pos[0], pos[1] + 1.35, pos[2]]} fov={fov} />;
};

// OLHO DE DEUS: bem de cima, girando devagar
export const CameraTopo: React.FC<{ alvo: V3; altura: number; s: number; giro?: number; fov?: number }> = ({ alvo, altura, s, giro = 0.12, fov = 40 }) => {
  const a = s * giro;
  return <CameraLivre pos={[alvo[0] + 0.001, alvo[1] + altura, alvo[2]]} alvo={alvo} fov={fov} cima={[Math.sin(a), 0, Math.cos(a)]} />;
};

// ÓRBITA: gira em volta de um ponto (de ângulo a até b, em radianos)
export const CameraOrbita: React.FC<{ alvo: V3; raio: number; altura: number; de: number; ate: number; x: number; fov?: number }> = ({ alvo, raio, altura, de, ate, x, fov = 40 }) => {
  const a = de + (ate - de) * suave(x);
  return <CameraLivre pos={[alvo[0] + Math.sin(a) * raio, alvo[1] + altura, alvo[2] + Math.cos(a) * raio]} alvo={alvo} fov={fov} />;
};
