import { useThree } from "@react-three/fiber";
import { useLayoutEffect } from "react";
import * as THREE from "three";
import { Acabamento, type Ceu, PalcoCinema } from "../cinema/Palco";
import type { V3 } from "./tempo";

// Palco de cada cena: céu HDRI só para a luz/reflexo (o fundo é desenhado pela própria cena),
// e o acabamento de cinema (brilho, foco, vinheta, cor). Desfoque baixo porque as mãos ficam
// a meio metro da câmera e o original deixa tudo nítido.
export const Palco: React.FC<{
  children: React.ReactNode;
  ceu?: Ceu | null;
  luzCeu?: number;
  fundo?: string;
  foco?: number;
  desfoque?: number;
  brilho?: number;
  saturacao?: number;
  contraste?: number;
  ao?: number;
  raioAo?: number;
  far?: number;
}> = ({ children, ceu = "noite", luzCeu = 0.3, fundo = "#000", foco = 4, desfoque = 0.6, brilho = 0.9, saturacao = 0.18, contraste = 0.12, ao = 0, raioAo = 1, far = 4000 }) => (
  <PalcoCinema ceu={ceu} fundo={fundo} luzCeu={luzCeu} brilhoCeu={0} far={far}>
    {children}
    <Acabamento foco={foco} desfoque={desfoque} brilho={brilho} saturacao={saturacao} contraste={contraste} vinheta={0.38} ao={ao} raioAo={raioAo} />
  </PalcoCinema>
);

// Câmera com vetor "para cima" livre (vista de cima com o rosto em pé, viradas rápidas)
export const Cam: React.FC<{ pos: V3; alvo: V3; cima?: V3; fov?: number; perto?: number }> = ({ pos, alvo, cima = [0, 1, 0], fov = 70, perto = 0.02 }) => {
  const camera = useThree((st) => st.camera) as THREE.PerspectiveCamera;
  useLayoutEffect(() => {
    camera.position.set(...pos);
    camera.up.set(...cima).normalize();
    camera.lookAt(...alvo);
    camera.fov = fov;
    camera.near = perto;
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
  });
  return null;
};

// Trajeto por pontos-chave (posição, alvo, "cima", lente) com curva lisa e tempo absoluto
export type Chave = { t: number; pos: V3; alvo: V3; cima?: V3; fov?: number };
const v3 = (a: V3) => new THREE.Vector3(...a);
export const noTrajeto = (ch: Chave[], s: number) => {
  if (s <= ch[0].t) return { ...ch[0], cima: ch[0].cima ?? ([0, 1, 0] as V3), fov: ch[0].fov ?? 70 };
  const ult = ch[ch.length - 1];
  if (s >= ult.t) return { ...ult, cima: ult.cima ?? ([0, 1, 0] as V3), fov: ult.fov ?? 70 };
  let i = 0;
  while (i < ch.length - 2 && s > ch[i + 1].t) i++;
  const a = ch[i];
  const b = ch[i + 1];
  const k = (s - a.t) / (b.t - a.t);
  const u = (i + k) / (ch.length - 1);
  const cp = new THREE.CatmullRomCurve3(ch.map((c) => v3(c.pos)), false, "centripetal");
  const ca = new THREE.CatmullRomCurve3(ch.map((c) => v3(c.alvo)), false, "centripetal");
  const ua = v3(a.cima ?? [0, 1, 0]).lerp(v3(b.cima ?? [0, 1, 0]), k).normalize();
  const fa = a.fov ?? 70;
  const fb = b.fov ?? fa;
  return { pos: cp.getPoint(u).toArray() as V3, alvo: ca.getPoint(u).toArray() as V3, cima: ua.toArray() as V3, fov: fa + (fb - fa) * k, t: s };
};
export const CamTrajeto: React.FC<{ ch: Chave[]; s: number; balanco?: number }> = ({ ch, s, balanco = 1 }) => {
  const c = noTrajeto(ch, s);
  // flutuação leve de fantasma (sobe e desce devagar)
  const b: V3 = [Math.sin(s * 0.9) * 0.012 * balanco, Math.sin(s * 1.3 + 1) * 0.015 * balanco, 0];
  return <Cam pos={[c.pos[0] + b[0], c.pos[1] + b[1], c.pos[2]]} alvo={c.alvo} cima={c.cima} fov={c.fov} />;
};
