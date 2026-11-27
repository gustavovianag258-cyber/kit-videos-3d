import { useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { Camera } from "../v2/mundo";
import { Acabamento, PalcoCinema, Sol } from "./Palco";
import { SANS } from "./Textos";

// Vista de um personagem gerado por IA (FLUX → TRELLIS): gira 360° para conferir o modelo 3D.
// O .glb do TRELLIS vem com 1 unidade de altura e centrado na origem.

export const DURACAO_IA = 4 * 30;
const NOME = "rapaz";

const ModeloIA: React.FC<{ nome: string; giro: number }> = ({ nome, giro }) => {
  const g = useGLTF(staticFile(`modelos/ia/${nome}/modelo.glb`));
  const cena = useMemo(() => {
    const c = g.scene.clone(true);
    c.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      m.castShadow = true;
      m.receiveShadow = true;
      // o TRELLIS não manda normais: sem isso a superfície fica facetada
      m.geometry = m.geometry.clone();
      m.geometry.computeVertexNormals();
      // a textura da IA já vem "sombreada": um pouco dela como emissiva clareia sem achatar,
      // e o material fica fosco como no Culturaverso
      const base = m.material as THREE.MeshStandardMaterial;
      m.material = new THREE.MeshStandardMaterial({
        map: base.map,
        emissiveMap: base.map,
        emissive: new THREE.Color("#ffffff"),
        emissiveIntensity: 0.32,
        roughness: 0.92,
        metalness: 0,
        envMapIntensity: 0.6,
      });
    });
    return c;
  }, [g.scene]);
  // 1,75 m de altura, pés no chão
  return (
    <group rotation={[0, giro, 0]}>
      <primitive object={cena} scale={1.75} position={[0, 0.875, 0]} />
    </group>
  );
};

export const TesteIA: React.FC = () => {
  const frame = useCurrentFrame();
  const s = frame / 30;
  return (
    <AbsoluteFill style={{ background: "#9fd3ff" }}>
      <PalcoCinema ceu="praia-sol">
        <Camera posicao={[0, 1.3, 3.4]} alvo={[0, 1.0, 0]} fov={42} />
        <Sol pos={[4, 8, 6]} forca={3} />
        <hemisphereLight args={["#cfe8ff", "#d9c7a3", 0.5]} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[40, 40]} />
          <meshStandardMaterial color="#a89a82" roughness={0.9} />
        </mesh>
        <ModeloIA nome={NOME} giro={(s / 4) * Math.PI * 2} />
        <Acabamento foco={3.4} desfoque={1.2} brilho={0.4} />
      </PalcoCinema>
      <div style={{ position: "absolute", top: 1650, left: 0, right: 0, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: 48, color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
        gerado por IA · {NOME}
      </div>
    </AbsoluteFill>
  );
};
