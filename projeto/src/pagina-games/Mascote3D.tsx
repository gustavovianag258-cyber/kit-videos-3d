import React from "react";
import { random } from "remotion";
import * as THREE from "three";
import { Bola, Caixa, Capsula, Pose3D, texCanelado, texJeans, texMoletom, pano, pele, V3 } from "../narrador/Personagem3D";

// Personagem da página de games, versão realista (v3): proporção de gente (1,78 m), tecido com relevo,
// mão com dedos, cabelo em tufos e headset de verdade. Mesma linguagem lisa do narrador do Mundo Paralelo,
// com silhueta e cor próprias: moletom roxo, headset com luz, jogger e tênis branco. Sem logo de marca.
// Unidade = metro.
export type PoseMascote = Pose3D;

const PELE_PADRAO = "#A9714C";
const PELE_FUNDA_PADRAO = "#95623F";
// cor da pele opcional (padrão = a de sempre); use <CorPele.Provider value={{ pele, funda }}> por volta do Mascote3D
export const CorPele = React.createContext({ pele: PELE_PADRAO, funda: PELE_FUNDA_PADRAO });
const ROXO = "#5B2DB8";
const ROXO_BARRA = "#3E1D85";
const ROXO_CAPUZ = "#4A2399";
const NEON = "#B66BFF";
const JOGGER = "#23232E";
const CABELO = ["#17121C", "#1E1826", "#120E17", "#241C2E", "#19141F"];
const PRETO_FONE = "#1D1530";

const neon = (cor = NEON, forca = 2.6) => <meshStandardMaterial color={cor} emissive={cor} emissiveIntensity={forca} roughness={0.4} />;

// cápsula entre dois pontos
const Haste: React.FC<{ de: V3; ate: V3; r: number; children: React.ReactNode }> = ({ de, ate, r, children }) => {
  const a = new THREE.Vector3(...de);
  const b = new THREE.Vector3(...ate);
  const d = b.clone().sub(a);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize());
  return (
    <mesh position={a.clone().add(b).multiplyScalar(0.5)} quaternion={q} castShadow>
      <capsuleGeometry args={[r, Math.max(0.001, d.length() - 2 * r), 6, 16]} />
      {children}
    </mesh>
  );
};

// cabelo curto: laterais baixas, topo com volume e franja caída para o lado
const TUFOS = (() => {
  const l: { p: V3; s: V3; cor: string }[] = [];
  const add = (x: number, y: number, z: number, k: string, g = 1) => {
    const r = (q: string) => random(`mt${k}${q}`);
    const t = (0.015 + r("t") * 0.011) * g;
    l.push({ p: [x + (r("x") - 0.5) * 0.014, y + (r("y") - 0.5) * 0.014, z + (r("z") - 0.5) * 0.014], s: [t * (0.85 + r("a") * 0.4), t * (0.7 + r("b") * 0.35), t * (0.85 + r("c") * 0.4)], cor: CABELO[Math.floor(r("d") * CABELO.length)] });
  };
  const P = 0.022;
  for (let x = -0.1; x <= 0.101; x += P)
    for (let z = -0.095; z <= 0.1; z += P) {
      const k = `${x.toFixed(3)}${z.toFixed(3)}`;
      add(x, 0.122, z, `a${k}`);
      if (Math.abs(x) < 0.09 && z > -0.07 && random(`u${k}`) > 0.3) add(x, 0.138 + (z > 0.03 ? 0.006 : 0), z, `b${k}`, 1.05);
      if (x > -0.04 && x < 0.1 && z > 0.02 && random(`v${k}`) > 0.45) add(x, 0.15, z + 0.006, `c${k}`, 1.1);
    }
  // franja na testa, caída para a direita
  for (let x = -0.09; x <= 0.1; x += 0.02) add(x, 0.103 + (x > 0.02 ? 0.006 : 0), 0.109, `f${x.toFixed(3)}`);
  // laterais e nuca baixas
  [-1, 1].forEach((s) => {
    for (let y = 0.05; y <= 0.11; y += P) for (let z = -0.09; z <= 0.03; z += P) add(s * 0.116, y, z, `l${s}${y.toFixed(3)}${z.toFixed(3)}`);
  });
  for (let x = -0.1; x <= 0.101; x += P) for (let y = -0.01; y <= 0.11; y += P) add(x, y, -0.109, `n${x.toFixed(3)}${y.toFixed(3)}`);
  return l;
})();

const Braco: React.FC<{ s: 1 | -1; r: V3; cotovelo: number }> = ({ s, r, cotovelo }) => (
  <group position={[s * 0.255, 1.355, 0]} rotation={r}>
    <Capsula p={[0, -0.125, 0]} r={0.056} l={0.2}>
      {pano(ROXO, texMoletom())}
    </Capsula>
    <group position={[0, -0.265, 0]} rotation={[-cotovelo, 0, 0]}>
      <Capsula p={[0, -0.095, 0]} r={0.05} l={0.17}>
        {pano(ROXO, texMoletom())}
      </Capsula>
      <Capsula p={[0, -0.215, 0]} r={0.046} l={0.012}>
        {pano(ROXO_BARRA, texCanelado(), 0.6)}
      </Capsula>
      <group position={[0, -0.24, 0]}>
        <MaoMorena s={s} />
      </group>
    </group>
  </group>
);

// a mão do narrador com a pele deste personagem
const MaoMorena: React.FC<{ s: 1 | -1 }> = ({ s }) => {
  const { pele: PELE } = React.useContext(CorPele);
  return (
  <group>
    <Caixa p={[0, -0.05, 0.002]} s={[0.078, 0.08, 0.034]} raio={0.016}>
      {pele(PELE)}
    </Caixa>
    {[
      [-0.026, 0.05],
      [-0.009, 0.058],
      [0.009, 0.056],
      [0.026, 0.046],
    ].map(([x, l], i) => (
      <Capsula key={i} p={[x * s, -0.09 - l / 2, 0.006]} r={0.0092} l={l} rot={[0.12, 0, 0]}>
        {pele(PELE)}
      </Capsula>
    ))}
    <Capsula p={[-s * 0.046, -0.052, 0.012]} r={0.0112} l={0.04} rot={[0.25, 0, s * 0.55]}>
      {pele(PELE)}
    </Capsula>
  </group>
  );
};

export const Mascote3D: React.FC<{ pos?: V3; giro?: number; pose?: PoseMascote; boca?: number; olhar?: number; pisca?: boolean; sorriso?: boolean; oculos?: boolean }> = ({ pos = [0, 0, 0], giro = 0, pose = {}, boca = 0, olhar = 0.15, pisca, sorriso, oculos }) => {
  const { pele: PELE, funda: PELE_FUNDA } = React.useContext(CorPele);
  const { bracoE = [0.02, 0, -0.08], bracoD = [0.02, 0, 0.08], cotoveloE = 0.14, cotoveloD = 0.14, pernaE = 0, pernaD = 0, cabeca = [0, 0, 0], tronco = 0 } = pose;
  return (
    <group position={pos} rotation={[0, giro, 0]}>
      {/* pernas de jogger com punho canelado e tênis grosso com detalhe de luz */}
      {([[-0.095, pernaE, pose.joelhoE ?? 0], [0.095, pernaD, pose.joelhoD ?? 0]] as [number, number, number][]).map(([x, a, j]) => (
        <group key={x} position={[x, 0.78, 0]} rotation={[a, 0, 0]}>
          {/* coxa */}
          <Caixa p={[0, -0.2, 0]} s={[0.175, 0.42, 0.185]} raio={0.062}>
            {pano(JOGGER, texJeans(), 0.3, 0.88)}
          </Caixa>
          {/* joelho: dobra para sentar */}
          <group position={[0, -0.38, 0]} rotation={[j, 0, 0]}>
            <mesh castShadow receiveShadow>
              <sphereGeometry args={[0.088, 20, 14]} />
              {pano(JOGGER, texJeans(), 0.3, 0.88)}
            </mesh>
            <Caixa p={[0, -0.13, 0]} s={[0.17, 0.3, 0.18]} raio={0.06}>
              {pano(JOGGER, texJeans(), 0.3, 0.88)}
            </Caixa>
            <Caixa p={[0, -0.285, 0]} s={[0.158, 0.05, 0.168]} raio={0.02}>
              {pano("#17171F", texCanelado(), 0.6)}
            </Caixa>
            <Caixa p={[0, -0.34, 0.03]} s={[0.168, 0.09, 0.285]} raio={0.042}>
              <meshStandardMaterial color="#EDEBF4" roughness={0.6} />
            </Caixa>
            <Caixa p={[0, -0.347, 0.03]} s={[0.172, 0.02, 0.2]} raio={0.008}>
              {neon("#9A4BFF", 2.8)}
            </Caixa>
            <Caixa p={[0, -0.385, 0.034]} s={[0.172, 0.032, 0.295]} raio={0.014}>
              <meshStandardMaterial color="#F7F6FB" roughness={0.75} />
            </Caixa>
          </group>
        </group>
      ))}
      <group position={[0, -0.08, 0]} rotation={[tronco, 0, 0]}>
        {/* moletom roxo, inteiro, de cantos macios */}
        <Caixa p={[0, 1.13, 0]} s={[0.42, 0.56, 0.24]} raio={0.085}>
          {pano(ROXO, texMoletom(), 0.7)}
        </Caixa>
        <Caixa p={[0, 0.865, 0]} s={[0.405, 0.05, 0.228]} raio={0.022}>
          {pano(ROXO_BARRA, texCanelado(), 0.6)}
        </Caixa>
        <Caixa p={[0, 0.975, 0.117]} s={[0.25, 0.125, 0.016]} raio={0.007}>
          {pano(ROXO_CAPUZ, texMoletom(), 0.4)}
        </Caixa>
        <Caixa p={[0, 1.42, -0.06]} s={[0.24, 0.095, 0.105]} raio={0.044}>
          {pano(ROXO_CAPUZ, texMoletom(), 0.5)}
        </Caixa>
        <mesh position={[0, 1.405, 0.006]} rotation={[Math.PI / 2 + 0.1, 0, 0]} castShadow receiveShadow>
          <torusGeometry args={[0.072, 0.022, 14, 40]} />
          {pano(ROXO, texMoletom(), 0.4)}
        </mesh>
        <mesh position={[0, 1.46, 0.006]} castShadow receiveShadow>
          <cylinderGeometry args={[0.052, 0.058, 0.13, 28]} />
          {pele(PELE_FUNDA)}
        </mesh>
        {/* cordões */}
        {[-0.046, 0.046].map((x, i) => (
          <group key={x}>
            <Capsula p={[x, 1.28 + i * 0.015, 0.123]} r={0.0055} l={0.16 - i * 0.02}>
              <meshStandardMaterial color="#E3DFF0" roughness={0.95} />
            </Capsula>
            <Capsula p={[x, 1.185 + i * 0.03, 0.124]} r={0.0062} l={0.018}>
              <meshStandardMaterial color="#8B8D96" metalness={0.65} roughness={0.38} />
            </Capsula>
          </group>
        ))}
        <Braco s={-1} r={bracoE} cotovelo={cotoveloE} />
        <Braco s={1} r={bracoD} cotovelo={cotoveloD} />
        {/* cabeça */}
        <group position={[0, 1.585, 0]} rotation={cabeca} scale={1.1}>
          <Caixa p={[0, 0, 0]} s={[0.228, 0.24, 0.222]} raio={0.085}>
            {pele(PELE)}
          </Caixa>
          {[-1, 1].map((s) => (
            <group key={s}>
              <Bola p={[s * 0.116, -0.012, 0.002]} s={[0.012, 0.028, 0.021]}>
                {pele(PELE_FUNDA)}
              </Bola>
              {pisca ? (
                <Capsula p={[s * 0.05, 0.006, 0.1125]} r={0.0028} l={0.036} rot={[0, 0, Math.PI / 2]}>
                  <meshStandardMaterial color="#2A1710" />
                </Capsula>
              ) : (
                <>
                  <Bola p={[s * 0.05, 0.008, 0.1085]} s={[0.0235, 0.0155, 0.0045]}>
                    <meshPhysicalMaterial color="#F6F4EE" roughness={0.2} clearcoat={0.7} />
                  </Bola>
                  <Bola p={[s * 0.05 + olhar * 0.006, 0.0075, 0.1118]} s={[0.0112, 0.012, 0.0025]}>
                    <meshPhysicalMaterial color="#3A2212" roughness={0.25} clearcoat={1} />
                  </Bola>
                  <Bola p={[s * 0.05 + olhar * 0.006, 0.0075, 0.1138]} s={[0.006, 0.0064, 0.001]}>
                    <meshStandardMaterial color="#060607" roughness={0.1} />
                  </Bola>
                  <Bola p={[s * 0.05 + olhar * 0.006 - 0.0038, 0.0118, 0.1148]} s={[0.0019, 0.0019, 0.0006]}>
                    <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={1.3} />
                  </Bola>
                  <Capsula p={[s * 0.05, 0.0225, 0.1102]} r={0.0028} l={0.04} rot={[0, 0, Math.PI / 2]}>
                    <meshStandardMaterial color="#2A170E" roughness={0.8} />
                  </Capsula>
                </>
              )}
              {/* sobrancelha cheia */}
              <Capsula p={[s * 0.052, 0.043, 0.111]} r={0.0058} l={0.038} rot={[0, 0, Math.PI / 2 + s * 0.1]}>
                <meshStandardMaterial color="#1C120D" roughness={0.95} />
              </Capsula>
              {/* concha do headset, com almofada e anel de luz */}
              <group position={[s * 0.139, -0.004, 0.004]}>
                <mesh rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
                  <cylinderGeometry args={[0.058, 0.058, 0.04, 40]} />
                  <meshStandardMaterial color={PRETO_FONE} roughness={0.5} metalness={0.25} />
                </mesh>
                <mesh position={[-s * 0.017, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
                  <cylinderGeometry args={[0.061, 0.061, 0.012, 40]} />
                  <meshStandardMaterial color="#14101C" roughness={0.9} />
                </mesh>
                <mesh position={[s * 0.0215, 0, 0]} rotation={[0, s * (Math.PI / 2), 0]}>
                  <torusGeometry args={[0.04, 0.0055, 12, 40]} />
                  {neon(NEON, 3.2)}
                </mesh>
                <mesh position={[s * 0.0212, 0, 0]} rotation={[0, s * (Math.PI / 2), 0]}>
                  <circleGeometry args={[0.04, 32]} />
                  <meshStandardMaterial color="#120A24" roughness={0.45} metalness={0.3} />
                </mesh>
              </group>
            </group>
          ))}
          {/* óculos escuros rosa, estilo Vice City (opcional) */}
          {oculos && (
            <group position={[0, 0.006, 0.121]}>
              {[-1, 1].map((sd) => (
                <group key={sd}>
                  <Caixa p={[sd * 0.05, 0, 0]} s={[0.064, 0.042, 0.008]} raio={0.016}>
                    <meshPhysicalMaterial color="#E43DC4" roughness={0.08} metalness={0.5} clearcoat={1} clearcoatRoughness={0.05} />
                  </Caixa>
                  <Caixa p={[sd * 0.05, 0.022, 0.001]} s={[0.068, 0.006, 0.01]} raio={0.003}>
                    <meshStandardMaterial color="#2A1446" metalness={0.6} roughness={0.3} />
                  </Caixa>
                  <Caixa p={[sd * 0.103, 0.012, -0.05]} s={[0.004, 0.005, 0.1]} raio={0.002}>
                    <meshStandardMaterial color="#2A1446" metalness={0.6} roughness={0.3} />
                  </Caixa>
                </group>
              ))}
              <Caixa p={[0, 0.012, 0.001]} s={[0.04, 0.005, 0.006]} raio={0.002}>
                <meshStandardMaterial color="#2A1446" metalness={0.6} roughness={0.3} />
              </Caixa>
            </group>
          )}
          {/* nariz */}
          <Bola p={[0, -0.024, 0.11]} s={[0.0135, 0.025, 0.0135]}>
            {pele(PELE)}
          </Bola>
          {/* boca */}
          {sorriso && boca <= 0.15 ? (
            // sorriso de canto: arco fino
            <mesh position={[0.004, -0.06, 0.1095]} rotation={[0, 0, Math.PI + 0.12]}>
              <torusGeometry args={[0.02, 0.0034, 10, 28, Math.PI * 0.85]} />
              <meshStandardMaterial color="#7A3A2E" roughness={0.55} />
            </mesh>
          ) : boca > 0.15 ? (
            <Bola p={[0, -0.068, 0.1085]} s={[0.018 + boca * 0.004, 0.0035 + boca * 0.011, 0.0035]}>
              <meshStandardMaterial color="#3B1712" roughness={0.75} />
            </Bola>
          ) : (
            <Capsula p={[0, -0.066, 0.1095]} r={0.003} l={0.03} rot={[0, 0, Math.PI / 2]}>
              <meshStandardMaterial color="#8E4A3C" roughness={0.55} />
            </Capsula>
          )}
          {/* arco do headset por cima do cabelo */}
          <mesh scale={[1, 1.3, 1]} castShadow>
            <torusGeometry args={[0.139, 0.0095, 14, 48, Math.PI]} />
            <meshStandardMaterial color={PRETO_FONE} roughness={0.5} metalness={0.25} />
          </mesh>
          <mesh position={[0, 0.181, 0]}>
            <boxGeometry args={[0.05, 0.005, 0.012]} />
            {neon(NEON, 3)}
          </mesh>
          {/* microfone: haste do fone esquerdo até a frente da boca */}
          <Haste de={[-0.139, -0.03, 0.04]} ate={[-0.052, -0.072, 0.118]} r={0.0045}>
            <meshStandardMaterial color={PRETO_FONE} roughness={0.5} />
          </Haste>
          <Bola p={[-0.05, -0.073, 0.12]} s={[0.0095, 0.008, 0.0095]}>
            {neon("#FF6BD6", 2.4)}
          </Bola>
          {/* cabelo */}
          <Caixa p={[0, 0.108, -0.008]} s={[0.228, 0.05, 0.21]} raio={0.024}>
            <meshStandardMaterial color="#120E17" roughness={0.95} />
          </Caixa>
          {TUFOS.map((t, i) => (
            <mesh key={i} position={t.p} scale={t.s} castShadow receiveShadow>
              <sphereGeometry args={[1, 10, 8]} />
              <meshStandardMaterial color={t.cor} roughness={0.72} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
};
