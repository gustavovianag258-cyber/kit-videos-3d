import { useMemo } from "react";
import * as THREE from "three";
import { ESPESSURA_RELATIVA, perfilAguaEquilibrio, setasNaSuperficie } from "./fisica";

// Diagramas 3D "de laboratório": o disco cortado ao meio, com as setas de gravidade
// e a água calculadas em src/v2/fisica.ts. Unidades: raio do disco = 1.

const ROCHA = "#7a5636";

// Meio disco (corte), para mostrar a espessura e o interior
export const DiscoCortado: React.FC<{ textura?: THREE.Texture }> = ({ textura }) => {
  const corte = useMemo(() => {
    // Seção retangular do corte (plano z = 0)
    const g = new THREE.PlaneGeometry(2, ESPESSURA_RELATIVA);
    g.translate(0, -ESPESSURA_RELATIVA / 2, 0);
    return g;
  }, []);
  return (
    <group>
      {/* Metade de trás do disco (theta de 0 a π, z negativo) */}
      <mesh position={[0, -ESPESSURA_RELATIVA / 2, 0]}>
        <cylinderGeometry args={[1, 1, ESPESSURA_RELATIVA, 128, 1, false, Math.PI / 2, Math.PI]} />
        <meshStandardMaterial color={ROCHA} roughness={0.9} />
      </mesh>
      {/* Superfície de cima com o mapa */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <circleGeometry args={[1, 128, 0, Math.PI]} />
        <meshStandardMaterial map={textura} color={textura ? "#ffffff" : "#3f7f3a"} roughness={0.9} />
      </mesh>
      {/* Face do corte, com camadas */}
      <mesh geometry={corte} position={[0, 0, 0.001]}>
        <meshStandardMaterial color="#9a7048" roughness={1} />
      </mesh>
      {[0.25, 0.55, 0.8].map((f) => (
        <mesh key={f} position={[0, -ESPESSURA_RELATIVA * f, 0.002]}>
          <planeGeometry args={[2, 0.006]} />
          <meshBasicMaterial color="#6b4a2c" />
        </mesh>
      ))}
    </group>
  );
};

const CIMA = new THREE.Vector3(0, 1, 0);

export const Seta3D: React.FC<{
  origem: [number, number, number];
  direcao: [number, number, number];
  comprimento: number;
  cor: string;
  espessura?: number;
}> = ({ origem, direcao, comprimento, cor, espessura = 0.015 }) => {
  const q = useMemo(() => {
    const d = new THREE.Vector3(...direcao).normalize();
    return new THREE.Quaternion().setFromUnitVectors(CIMA, d);
  }, [direcao]);
  if (comprimento <= 0.001) return null;
  const ponta = Math.min(comprimento * 0.4, espessura * 5);
  return (
    <group position={origem} quaternion={q}>
      <mesh position={[0, (comprimento - ponta) / 2, 0]}>
        <cylinderGeometry args={[espessura, espessura, comprimento - ponta, 10]} />
        <meshStandardMaterial color={cor} emissive={cor} emissiveIntensity={0.55} roughness={0.4} />
      </mesh>
      <mesh position={[0, comprimento - ponta / 2, 0]}>
        <coneGeometry args={[espessura * 2.6, ponta, 14]} />
        <meshStandardMaterial color={cor} emissive={cor} emissiveIntensity={0.55} roughness={0.4} />
      </mesh>
    </group>
  );
};

// Setas de gravidade calculadas; "progresso" (0 a 1) faz elas aparecerem do centro para a borda
export const SetasGravidade: React.FC<{ progresso: number; escala?: number }> = ({
  progresso,
  escala = 0.22,
}) => {
  const setas = setasNaSuperficie();
  return (
    <>
      {setas.map((s, i) => {
        const ordem = Math.min(1, Math.abs(s.x) / 1.1);
        const p = Math.min(1, Math.max(0, (progresso - ordem * 0.6) / 0.4));
        const comp = escala * (0.55 + 0.45 * s.intensidade) * p;
        // A seta termina no ponto onde a gravidade foi calculada (aponta "para dentro")
        const origem: [number, number, number] = [s.x - s.dx * comp, s.y - s.dy * comp, 0.03];
        return (
          <Seta3D
            key={i}
            origem={origem}
            direcao={[s.dx, s.dy, 0]}
            comprimento={comp}
            cor={Math.abs(s.x) > 1 ? "#ff9f1c" : "#ffd60a"}
          />
        );
      })}
    </>
  );
};

// Bonequinhos em pé "perpendiculares à gravidade local": ficam inclinados perto da borda
export const PessoasNaGravidade: React.FC<{ progresso: number }> = ({ progresso }) => {
  const setas = setasNaSuperficie().filter((s) => s.x >= 0 && s.x < 1 && [0, 0.6, 0.97].some((r) => Math.abs(s.x - r) < 0.01));
  return (
    <>
      {setas.map((s, i) => {
        const p = Math.min(1, Math.max(0, progresso * 3 - i));
        if (p <= 0) return null;
        // "Para cima" do boneco = oposto da gravidade
        const ang = Math.atan2(-s.dx, -s.dy);
        return (
          <group key={i} position={[s.x, 0, 0.06]} rotation={[0, 0, -ang * p]} scale={0.085 * p}>
            <mesh position={[0, 0.55, 0]}>
              <capsuleGeometry args={[0.18, 0.55, 6, 12]} />
              <meshStandardMaterial color="#2f80ed" roughness={0.6} />
            </mesh>
            <mesh position={[0, 1.15, 0]}>
              <sphereGeometry args={[0.17, 16, 16]} />
              <meshStandardMaterial color="#f1c27d" roughness={0.6} />
            </mesh>
          </group>
        );
      })}
    </>
  );
};

// Água em equilíbrio (cúpula no centro) — perfil calculado, exagerado na altura para ficar visível
export const AguaEquilibrio: React.FC<{ progresso: number; exagero?: number }> = ({
  progresso,
  exagero = 0.9,
}) => {
  const perfil = perfilAguaEquilibrio();
  const geo = useMemo(() => {
    // Camada uniforme fina (começo) → perfil de equilíbrio (fim)
    const ESPESSURA_INICIAL = 0.035;
    const pontos = perfil.map((a) => {
      const hFinal = a.h * exagero;
      const h = ESPESSURA_INICIAL * (1 - progresso) + hFinal * progresso;
      return new THREE.Vector2(a.r, Math.max(0.0005, h));
    });
    pontos.push(new THREE.Vector2(1, 0.0005));
    pontos.unshift(new THREE.Vector2(0, 0));
    return new THREE.LatheGeometry(pontos, 96, Math.PI / 2, Math.PI);
  }, [perfil, progresso, exagero]);
  // Perfil da água na face do corte (z = 0): deixa a forma bem legível
  const perfilGeo = useMemo(() => {
    const ESPESSURA_INICIAL = 0.035;
    const forma = new THREE.Shape();
    forma.moveTo(-1, 0);
    const pts = [...perfil].reverse().map((a) => ({ r: -a.r, h: a.h }));
    const todos = [...pts, ...perfil.slice(1)];
    for (const a of todos) {
      const h = ESPESSURA_INICIAL * (1 - progresso) + a.h * exagero * progresso;
      forma.lineTo(a.r, Math.max(0.0005, h));
    }
    forma.lineTo(1, 0);
    forma.lineTo(-1, 0);
    return new THREE.ShapeGeometry(forma, 1);
  }, [perfil, progresso, exagero]);
  return (
    <>
      <mesh geometry={geo}>
        <meshStandardMaterial
          color="#2d8fe0"
          transparent
          opacity={0.82}
          roughness={0.15}
          metalness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh geometry={perfilGeo} position={[0, 0, 0.004]}>
        <meshStandardMaterial color="#3aa0f0" emissive="#0d4a8a" emissiveIntensity={0.5} roughness={0.2} />
      </mesh>
    </>
  );
};
