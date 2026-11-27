import { useLayoutEffect, useRef } from "react";
import * as THREE from "three";

// Personagem blocado (cabeça quadrada, sobrancelhas grossas pretas, roupa simples).
// 1 unidade = 1 metro; em pé ele tem ~1,9 m com a cabeça grande.

export type Visual = {
  pele: string;
  cabelo: string;
  camisa: string;
  calca: string;
  sapato: string;
  cabeloLongo?: boolean;
  jaleco?: boolean;
};

export const GABRIEL: Visual = { pele: "#d9a066", cabelo: "#1a1410", camisa: "#2f6fd6", calca: "#2a2f3d", sapato: "#f2f2f2" };
export const MAE: Visual = { pele: "#e8b07a", cabelo: "#5a3420", camisa: "#d94f8a", calca: "#3b3355", sapato: "#ffffff", cabeloLongo: true };
export const CIENTISTA = (i: number): Visual => ({
  pele: ["#f1c27d", "#c68642", "#e0ac69", "#8d5524", "#ffdbac", "#d9a066"][i % 6],
  cabelo: ["#111111", "#5a3420", "#2b1b12", "#9a9a9a", "#a0522d", "#111111"][i % 6],
  camisa: "#eef1f4",
  calca: "#30343f",
  sapato: "#222222",
  jaleco: true,
});

export type Boca = "neutra" | "sorriso" | "aberta" | "meioSorriso" | "tremendo";

export type Expressao = {
  // -1 = franzida (séria), 0 = normal, 1 = levantada (espanto)
  sobrancelha?: number;
  // 0 = normal, 1 = olhos arregalados
  espanto?: number;
  olhosFechados?: boolean;
  boca?: Boca;
  abertura?: number;
};

export type Pose = {
  // [frente/trás, lado] em radianos, a partir do ombro
  bracoE?: [number, number];
  bracoD?: [number, number];
  // quanto o antebraço dobra (0 = esticado)
  cotoveloE?: number;
  cotoveloD?: number;
  // antebraços girando para dentro (mãos se encontram na frente do peito)
  cotoveloDentro?: number;
  sentado?: boolean;
  // inclinação do tronco para a frente (curvado no celular)
  curvado?: number;
  // cabeça: [cima/baixo, lado]
  cabeca?: [number, number];
  // objeto na mão direita
  celular?: boolean;
  // brilho da tela do celular (0 a 1)
  telaAcesa?: number;
};

const Caixa: React.FC<{
  tam: [number, number, number];
  pos?: [number, number, number];
  rot?: [number, number, number];
  cor: string;
  rugosidade?: number;
  emissivo?: string;
  intensidade?: number;
}> = ({ tam, pos = [0, 0, 0], rot = [0, 0, 0], cor, rugosidade = 0.75, emissivo, intensidade = 0 }) => (
  <mesh position={pos} rotation={rot}>
    <boxGeometry args={tam} />
    <meshStandardMaterial color={cor} roughness={rugosidade} emissive={emissivo ?? "#000000"} emissiveIntensity={intensidade} />
  </mesh>
);

export const CabecaBloco: React.FC<{ v: Visual; e: Expressao; piscada?: number }> = ({ v, e, piscada = 1 }) => {
  const sob = e.sobrancelha ?? 0;
  const esp = e.espanto ?? 0;
  const abre = e.abertura ?? 0.6;
  const olhoY = e.olhosFechados ? 0.012 : 0.085 * (1 + esp * 0.45) * piscada;
  const olhoX = 0.075 * (1 + esp * 0.25);
  return (
    <group>
      <Caixa tam={[0.56, 0.56, 0.52]} cor={v.pele} rugosidade={0.6} />
      {/* Cabelo: tampa + nuca + costeletas */}
      <Caixa tam={[0.6, 0.13, 0.56]} pos={[0, 0.31, -0.01]} cor={v.cabelo} rugosidade={0.9} />
      <Caixa tam={[0.6, 0.36, 0.1]} pos={[0, 0.14, -0.25]} cor={v.cabelo} rugosidade={0.9} />
      <Caixa tam={[0.06, 0.2, 0.4]} pos={[-0.29, 0.17, -0.05]} cor={v.cabelo} rugosidade={0.9} />
      <Caixa tam={[0.06, 0.2, 0.4]} pos={[0.29, 0.17, -0.05]} cor={v.cabelo} rugosidade={0.9} />
      <Caixa tam={[0.5, 0.07, 0.08]} pos={[0.03, 0.24, 0.24]} rot={[0, 0, -0.06]} cor={v.cabelo} rugosidade={0.9} />
      {v.cabeloLongo && (
        <>
          <Caixa tam={[0.64, 0.62, 0.14]} pos={[0, -0.12, -0.26]} cor={v.cabelo} rugosidade={0.9} />
          <Caixa tam={[0.09, 0.55, 0.36]} pos={[-0.3, -0.1, -0.08]} cor={v.cabelo} rugosidade={0.9} />
          <Caixa tam={[0.09, 0.55, 0.36]} pos={[0.3, -0.1, -0.08]} cor={v.cabelo} rugosidade={0.9} />
        </>
      )}
      {/* Olhos (brancos com pupila) */}
      {[-1, 1].map((l) => (
        <group key={l} position={[l * 0.12, 0.04, 0.262]}>
          <Caixa tam={[olhoX * 1.35, olhoY, 0.012]} cor={e.olhosFechados ? "#2a1a10" : "#ffffff"} rugosidade={0.3} />
          {!e.olhosFechados && <Caixa tam={[0.045, Math.min(0.06, olhoY * 0.8), 0.014]} pos={[0, -0.004, 0.004]} cor="#111111" rugosidade={0.2} />}
        </group>
      ))}
      {/* Sobrancelhas grossas: descem e entortam para dentro quando ele fica sério */}
      {[-1, 1].map((l) => (
        <Caixa
          key={l}
          tam={[0.17, 0.05, 0.03]}
          pos={[l * 0.12, 0.13 + sob * 0.035 + esp * 0.03, 0.27]}
          rot={[0, 0, l * (sob < 0 ? sob * -0.32 : -sob * 0.12)]}
          cor="#0d0d0d"
          rugosidade={0.8}
        />
      ))}
      {/* Nariz */}
      <Caixa tam={[0.07, 0.08, 0.05]} pos={[0, -0.04, 0.28]} cor={v.pele} rugosidade={0.6} />
      {/* Boca */}
      {(() => {
        const b = e.boca ?? "neutra";
        if (b === "aberta")
          return <Caixa tam={[0.13, 0.05 + abre * 0.12, 0.02]} pos={[0, -0.15, 0.262]} cor="#4a0f0f" rugosidade={0.5} />;
        if (b === "tremendo")
          return <Caixa tam={[0.16, 0.035, 0.02]} pos={[0, -0.15, 0.262]} rot={[0, 0, 0.05]} cor="#5a1a14" />;
        if (b === "sorriso" || b === "meioSorriso") {
          const meio = b === "meioSorriso";
          return (
            <group position={[0, -0.15, 0.264]}>
              <Caixa tam={[meio ? 0.1 : 0.14, 0.03, 0.02]} pos={[meio ? 0.02 : 0, 0, 0]} cor="#5a1a14" />
              {!meio && <Caixa tam={[0.04, 0.03, 0.02]} pos={[-0.085, 0.022, 0]} rot={[0, 0, -0.5]} cor="#5a1a14" />}
              <Caixa tam={[0.04, 0.03, 0.02]} pos={[meio ? 0.085 : 0.085, 0.022, 0]} rot={[0, 0, 0.5]} cor="#5a1a14" />
            </group>
          );
        }
        return <Caixa tam={[0.13, 0.022, 0.02]} pos={[0, -0.15, 0.262]} cor="#2a0d0a" />;
      })()}
    </group>
  );
};

const Braco: React.FC<{ v: Visual; lado: -1 | 1; giro: [number, number]; cotovelo: number; dentro?: number; celular?: boolean; tela?: number }> = ({
  v,
  lado,
  giro,
  cotovelo,
  dentro = 0,
  celular,
  tela = 0,
}) => (
  <group position={[lado * 0.4, 1.47, 0]} rotation={[giro[0], 0, lado * giro[1]]}>
    {/* braço de cima */}
    <Caixa tam={[0.19, 0.36, 0.21]} pos={[0, -0.17, 0]} cor={v.jaleco ? "#eef1f4" : v.camisa} />
    <group position={[0, -0.34, 0]} rotation={[cotovelo, 0, -lado * dentro]}>
      <Caixa tam={[0.18, 0.3, 0.2]} pos={[0, -0.14, 0]} cor={v.jaleco ? "#eef1f4" : v.camisa} />
      <Caixa tam={[0.17, 0.12, 0.19]} pos={[0, -0.34, 0]} cor={v.pele} rugosidade={0.6} />
      {celular && (
        <group position={[-lado * 0.02, -0.4, 0.1]} rotation={[-1.25, 0, 0]}>
          <Caixa tam={[0.15, 0.28, 0.025]} cor="#15161a" rugosidade={0.3} />
          <mesh position={[0, 0, 0.013]}>
            <planeGeometry args={[0.13, 0.25]} />
            <meshBasicMaterial color={new THREE.Color("#bfe3ff").multiplyScalar(0.3 + tela * 1.2)} toneMapped={false} side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}
    </group>
  </group>
);

export const Bloco: React.FC<{
  v: Visual;
  pos?: [number, number, number];
  giroY?: number;
  e?: Expressao;
  p?: Pose;
  frame?: number;
  escala?: number;
}> = ({ v, pos = [0, 0, 0], giroY = 0, e = {}, p = {}, frame = 0, escala = 1 }) => {
  const ref = useRef<THREE.Group>(null);
  useLayoutEffect(() => {
    ref.current?.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
  }, []);
  const ciclo = frame % 96;
  const piscada = ciclo > 88 && ciclo < 93 ? 0.15 : 1;
  const resp = 1 + Math.sin(frame * 0.1) * 0.012;
  const sent = p.sentado ?? false;
  const curv = p.curvado ?? 0;
  const [cx, cy] = p.cabeca ?? [0, 0];

  return (
    <group ref={ref} position={pos} rotation={[0, giroY, 0]} scale={escala}>
      {/* Pernas: no sentado, a coxa vai para a frente e a canela desce */}
      {[-1, 1].map((l) => (
        <group key={l} position={[l * 0.14, 0.8, 0]} rotation={[sent ? -Math.PI / 2 : 0, 0, 0]}>
          <Caixa tam={[0.23, 0.42, 0.25]} pos={[0, -0.2, 0]} cor={v.calca} />
          <group position={[0, -0.4, 0]} rotation={[sent ? Math.PI / 2 : 0, 0, 0]}>
            <Caixa tam={[0.22, 0.36, 0.24]} pos={[0, -0.18, 0]} cor={v.calca} />
            <Caixa tam={[0.24, 0.1, 0.32]} pos={[0, -0.38, 0.04]} cor={v.sapato} />
          </group>
        </group>
      ))}
      {/* Tronco (gira no quadril para curvar) */}
      <group position={[0, 0.8, 0]} rotation={[curv, 0, 0]}>
        <group position={[0, -0.8, 0]}>
          <Caixa tam={[0.62, 0.72 * resp, 0.34]} pos={[0, 1.16, 0]} cor={v.camisa} />
          {v.jaleco && (
            <>
              <Caixa tam={[0.64, 0.8, 0.36]} pos={[0, 1.12, -0.005]} cor="#f4f6f8" />
              <Caixa tam={[0.04, 0.62, 0.02]} pos={[0, 1.18, 0.18]} cor="#c9d1d9" />
            </>
          )}
          <Braco v={v} lado={-1} giro={p.bracoE ?? [0, 0.08]} cotovelo={p.cotoveloE ?? 0} dentro={p.cotoveloDentro} />
          <Braco v={v} lado={1} giro={p.bracoD ?? [0, 0.08]} cotovelo={p.cotoveloD ?? 0} dentro={p.cotoveloDentro} celular={p.celular} tela={p.telaAcesa} />
          {/* Pescoço e cabeça */}
          <Caixa tam={[0.18, 0.1, 0.18]} pos={[0, 1.56, 0]} cor={v.pele} />
          <group position={[0, 1.88, 0]} rotation={[cx, cy, 0]}>
            <CabecaBloco v={v} e={e} piscada={piscada} />
          </group>
        </group>
      </group>
    </group>
  );
};
