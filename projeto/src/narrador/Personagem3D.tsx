import { RoundedBox } from "@react-three/drei";
import { useLayoutEffect, useRef } from "react";
import { random } from "remotion";
import * as THREE from "three";

// O narrador do Mundo Paralelo em 3D: forma lisa e simples, igual à do exemplo, com o realismo vindo
// do material (malha, jeans, pele), da mão com dedos e da luz. Sem modelo externo e sem logo de marca.
// Unidade = metro.
export type V3 = [number, number, number];

// ---------- relevo de tecido gerado em código ----------
export const mapaNormal = (altura: (x: number, y: number) => number, tam = 512, forca = 2.4) => {
  const c = document.createElement("canvas");
  c.width = c.height = tam;
  const g = c.getContext("2d")!;
  const img = g.createImageData(tam, tam);
  const h = new Float32Array(tam * tam);
  for (let y = 0; y < tam; y++) for (let x = 0; x < tam; x++) h[y * tam + x] = altura(x / tam, y / tam);
  const pega = (x: number, y: number) => h[((y + tam) % tam) * tam + ((x + tam) % tam)];
  for (let y = 0; y < tam; y++)
    for (let x = 0; x < tam; x++) {
      const nx = (pega(x - 1, y) - pega(x + 1, y)) * forca;
      const ny = (pega(x, y - 1) - pega(x, y + 1)) * forca;
      const l = Math.hypot(nx, ny, 1);
      const i = (y * tam + x) * 4;
      img.data[i] = (nx / l) * 127 + 128;
      img.data[i + 1] = (ny / l) * 127 + 128;
      img.data[i + 2] = (1 / l) * 127 + 128;
      img.data[i + 3] = 255;
    }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
};
const TAU = Math.PI * 2;
const guardados: Record<string, THREE.CanvasTexture> = {};
const guarda = (k: string, f: () => THREE.CanvasTexture) => (guardados[k] ??= f());
const ruidos = new Array(9).fill(0).map((_, i) => ({ a: 1 + Math.floor(random(`ra${i}`) * 3), b: 1 + Math.floor(random(`rb${i}`) * 3), f: random(`rf${i}`) * TAU, n: 0.25 + random(`rn${i}`) }));
const dobra = (x: number, y: number) => ruidos.reduce((s, r) => s + r.n * Math.sin(TAU * (r.a * x + r.b * y) + r.f), 0);
export const texMoletom = () => guarda("mol", () => mapaNormal((x, y) => dobra(x, y) * 0.9 + Math.sin(TAU * x * 110) * Math.sin(TAU * y * 110) * 0.03, 512, 3));
export const texJeans = () =>
  guarda("jea", () => {
    const t = mapaNormal((x, y) => Math.sin(TAU * (x + y) * 90) * 0.1 + dobra(x * 2, y) * 0.3, 512, 2.6);
    t.repeat.set(1, 2);
    return t;
  });
export const texCanelado = () => guarda("can", () => mapaNormal((x) => Math.sin(TAU * x * 34) * 0.5, 256, 3));

// ---------- peças ----------
const PELE = "#EDBE9C";
const PELE_FUNDA = "#D9A583";
const MOLETOM = "#2B2C34";
const BARRA = "#1F2027";
const JEANS = "#33436A";
const ARO = "#6A6F76";
const CASTANHO = ["#3A2415", "#452D1B", "#2F1C10", "#513723", "#3E2818"];

export const pano = (cor: string, normal: THREE.Texture, escala = 0.5, rugoso = 0.92): React.ReactElement => <meshStandardMaterial color={cor} roughness={rugoso} normalMap={normal} normalScale={new THREE.Vector2(escala, escala)} />;
export const pele = (cor = PELE): React.ReactElement => <meshPhysicalMaterial color={cor} roughness={0.5} sheen={0.6} sheenColor="#FFB898" sheenRoughness={0.55} />;

export const Caixa: React.FC<{ p: V3; s: V3; raio?: number; rot?: V3; children: React.ReactNode }> = ({ p, s, raio = 0.02, rot, children }) => (
  <RoundedBox args={s} position={p} rotation={rot} radius={Math.min(raio, Math.min(...s) * 0.48)} smoothness={6} castShadow receiveShadow>
    {children}
  </RoundedBox>
);
export const Capsula: React.FC<{ p: V3; r: number; l: number; rot?: V3; children: React.ReactNode }> = ({ p, r, l, rot, children }) => (
  <mesh position={p} rotation={rot} castShadow receiveShadow>
    <capsuleGeometry args={[r, l, 8, 24]} />
    {children}
  </mesh>
);
export const Bola: React.FC<{ p: V3; s: V3; children: React.ReactNode }> = ({ p, s, children }) => (
  <mesh position={p} scale={s} castShadow receiveShadow>
    <sphereGeometry args={[1, 24, 18]} />
    {children}
  </mesh>
);

export const Mao: React.FC<{ s: 1 | -1 }> = ({ s }) => (
  <group>
    <Caixa p={[0, -0.05, 0.002]} s={[0.074, 0.08, 0.034]} raio={0.016}>
      {pele()}
    </Caixa>
    {[
      [-0.026, 0.048],
      [-0.009, 0.056],
      [0.009, 0.054],
      [0.026, 0.044],
    ].map(([x, l], i) => (
      <Capsula key={i} p={[x * s, -0.09 - l / 2, 0.006]} r={0.0088} l={l} rot={[0.12, 0, 0]}>
        {pele()}
      </Capsula>
    ))}
    <Capsula p={[-s * 0.044, -0.052, 0.012]} r={0.0108} l={0.038} rot={[0.25, 0, s * 0.55]}>
      {pele()}
    </Capsula>
  </group>
);

const TUFOS = (() => {
  const l: { p: V3; s: V3; cor: string }[] = [];
  const add = (x: number, y: number, z: number, k: string) => {
    const r = (q: string) => random(`tf${k}${q}`);
    const t = 0.016 + r("t") * 0.011;
    l.push({ p: [x + (r("x") - 0.5) * 0.016, y + (r("y") - 0.5) * 0.016, z + (r("z") - 0.5) * 0.016], s: [t * (0.85 + r("a") * 0.4), t * (0.7 + r("b") * 0.35), t * (0.85 + r("c") * 0.4)], cor: CASTANHO[Math.floor(r("d") * CASTANHO.length)] });
  };
  const P = 0.024;
  for (let x = -0.106; x <= 0.107; x += P)
    for (let z = -0.1; z <= 0.103; z += P) {
      add(x, 0.122, z, `t${x.toFixed(3)}${z.toFixed(3)}`);
      if (Math.abs(x) < 0.085 && Math.abs(z) < 0.08 && random(`u${x.toFixed(3)}${z.toFixed(3)}`) > 0.4) add(x, 0.138, z, `u${x.toFixed(3)}${z.toFixed(3)}`);
    }
  for (let x = -0.106; x <= 0.107; x += 0.02) add(x, 0.1, 0.109, `f${x.toFixed(3)}`);
  [-1, 1].forEach((s) => {
    for (let y = 0.034; y <= 0.11; y += P) for (let z = -0.09; z <= 0.05; z += P) add(s * 0.118, y, z, `l${s}${y.toFixed(3)}${z.toFixed(3)}`);
  });
  for (let x = -0.106; x <= 0.107; x += P) for (let y = -0.035; y <= 0.11; y += P) add(x, y, -0.109, `n${x.toFixed(3)}${y.toFixed(3)}`);
  return l;
})();

export type Pose3D = { bracoE?: V3; bracoD?: V3; cotoveloE?: number; cotoveloD?: number; pernaE?: number; pernaD?: number; joelhoE?: number; joelhoD?: number; cabeca?: V3; tronco?: number };

const Braco: React.FC<{ s: 1 | -1; r: V3; cotovelo: number }> = ({ s, r, cotovelo }) => (
  <group position={[s * 0.255, 1.355, 0]} rotation={r}>
    <Capsula p={[0, -0.125, 0]} r={0.056} l={0.2}>
      {pano(MOLETOM, texMoletom())}
    </Capsula>
    <group position={[0, -0.265, 0]} rotation={[-cotovelo, 0, 0]}>
      <Capsula p={[0, -0.095, 0]} r={0.05} l={0.17}>
        {pano(MOLETOM, texMoletom())}
      </Capsula>
      <Capsula p={[0, -0.215, 0]} r={0.046} l={0.012}>
        {pano(BARRA, texCanelado(), 0.6)}
      </Capsula>
      <group position={[0, -0.24, 0]}>
        <Mao s={s} />
      </group>
    </group>
  </group>
);

export const Personagem3D: React.FC<{ pos?: V3; giro?: number; pose?: Pose3D; boca?: number; olhar?: number; pisca?: boolean }> = ({ pos = [0, 0, 0], giro = 0, pose = {}, boca = 0, olhar = 0.15, pisca }) => {
  const { bracoE = [0.02, 0, -0.08], bracoD = [0.02, 0, 0.08], cotoveloE = 0.14, cotoveloD = 0.14, pernaE = 0, pernaD = 0, cabeca = [0, 0, 0], tronco = 0 } = pose;
  // o aro dos óculos não projeta sombra: era o que riscava o rosto
  const raiz = useRef<THREE.Group>(null);
  useLayoutEffect(() => {
    raiz.current?.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh && (m.material as THREE.MeshStandardMaterial).color?.getHexString() === ARO.slice(1).toLowerCase()) m.castShadow = false;
    });
  });
  return (
    <group ref={raiz} position={pos} rotation={[0, giro, 0]}>
      {/* pernas de jeans e tênis */}
      {([[-0.095, pernaE, pose.joelhoE], [0.095, pernaD, pose.joelhoD]] as [number, number, number | undefined][]).map(([x, a, j]) => {
        const tenis = (
          <>
            <Caixa p={[0, -0.72, 0.035]} s={[0.165, 0.085, 0.28]} raio={0.04}>
              <meshStandardMaterial color="#C9C8C2" roughness={0.65} />
            </Caixa>
            <Caixa p={[0, -0.763, 0.038]} s={[0.17, 0.03, 0.29]} raio={0.014}>
              <meshStandardMaterial color="#F1F0EA" roughness={0.75} />
            </Caixa>
          </>
        );
        return (
          <group key={x} position={[x, 0.78, 0]} rotation={[a, 0, 0]}>
            {j === undefined ? (
              <>
                <Caixa p={[0, -0.35, 0]} s={[0.172, 0.72, 0.18]} raio={0.06}>
                  {pano(JEANS, texJeans(), 0.45, 0.85)}
                </Caixa>
                {tenis}
              </>
            ) : (
              // andando: a perna se divide no joelho
              <>
                <Caixa p={[0, -0.18, 0]} s={[0.172, 0.4, 0.18]} raio={0.06}>
                  {pano(JEANS, texJeans(), 0.45, 0.85)}
                </Caixa>
                <group position={[0, -0.36, 0]} rotation={[j, 0, 0]}>
                  <Caixa p={[0, 0.01, 0]} s={[0.17, 0.72 - 0.34, 0.178]} raio={0.06}>
                    {pano(JEANS, texJeans(), 0.45, 0.85)}
                  </Caixa>
                  <group position={[0, 0.36, 0]}>{tenis}</group>
                </group>
              </>
            )}
          </group>
        );
      })}
      <group position={[0, -0.08, 0]} rotation={[tronco, 0, 0]}>
        {/* tronco inteiro, de cantos macios */}
        <Caixa p={[0, 1.13, 0]} s={[0.42, 0.56, 0.24]} raio={0.085}>
          {pano(MOLETOM, texMoletom(), 0.7)}
        </Caixa>
        <Caixa p={[0, 0.865, 0]} s={[0.405, 0.05, 0.228]} raio={0.022}>
          {pano(BARRA, texCanelado(), 0.6)}
        </Caixa>
        {/* bolso */}
        <Caixa p={[0, 0.975, 0.117]} s={[0.25, 0.125, 0.016]} raio={0.007}>
          {pano("#25262E", texMoletom(), 0.4)}
        </Caixa>
        {/* capuz caído e gola */}
        <Caixa p={[0, 1.42, -0.06]} s={[0.24, 0.095, 0.105]} raio={0.044}>
          {pano(BARRA, texMoletom(), 0.5)}
        </Caixa>
        <mesh position={[0, 1.405, 0.006]} rotation={[Math.PI / 2 + 0.1, 0, 0]} castShadow receiveShadow>
          <torusGeometry args={[0.072, 0.022, 14, 40]} />
          {pano(MOLETOM, texMoletom(), 0.4)}
        </mesh>
        {/* pescoço */}
        <mesh position={[0, 1.46, 0.006]} castShadow receiveShadow>
          <cylinderGeometry args={[0.052, 0.058, 0.13, 28]} />
          {pele(PELE_FUNDA)}
        </mesh>
        {/* cordão */}
        <Capsula p={[-0.046, 1.28, 0.123]} r={0.0055} l={0.17}>
          <meshStandardMaterial color="#B5B6BA" roughness={0.95} />
        </Capsula>
        <Capsula p={[0.046, 1.295, 0.123]} r={0.0055} l={0.14}>
          <meshStandardMaterial color="#B5B6BA" roughness={0.95} />
        </Capsula>
        {[
          [-0.046, 1.185],
          [0.046, 1.215],
        ].map(([x, y]) => (
          <Capsula key={x} p={[x, y, 0.124]} r={0.0062} l={0.018}>
            <meshStandardMaterial color="#7D8086" metalness={0.65} roughness={0.38} />
          </Capsula>
        ))}
        <Braco s={-1} r={bracoE} cotovelo={cotoveloE} />
        <Braco s={1} r={bracoD} cotovelo={cotoveloD} />
        {/* cabeça */}
        <group position={[0, 1.585, 0]} rotation={cabeca} scale={1.1}>
          <Caixa p={[0, 0, 0]} s={[0.228, 0.24, 0.222]} raio={0.085}>
            {pele()}
          </Caixa>
          {[-1, 1].map((s) => (
            <group key={s}>
              <Bola p={[s * 0.116, -0.012, 0.002]} s={[0.012, 0.028, 0.021]}>
                {pele(PELE_FUNDA)}
              </Bola>
              {/* olho */}
              {pisca ? (
                <Capsula p={[s * 0.05, 0.006, 0.1125]} r={0.0026} l={0.034} rot={[0, 0, Math.PI / 2]}>
                  <meshStandardMaterial color="#4A2C1E" />
                </Capsula>
              ) : (
                <>
                  <Bola p={[s * 0.05, 0.008, 0.1085]} s={[0.021, 0.0135, 0.0045]}>
                    <meshPhysicalMaterial color="#F6F4EE" roughness={0.2} clearcoat={0.7} />
                  </Bola>
                  <Bola p={[s * 0.05 + olhar * 0.006, 0.0075, 0.1118]} s={[0.0098, 0.0105, 0.0025]}>
                    <meshPhysicalMaterial color="#4B2E19" roughness={0.25} clearcoat={1} />
                  </Bola>
                  <Bola p={[s * 0.05 + olhar * 0.006, 0.0075, 0.1138]} s={[0.0052, 0.0056, 0.001]}>
                    <meshStandardMaterial color="#060607" roughness={0.1} />
                  </Bola>
                  <Bola p={[s * 0.05 + olhar * 0.006 - 0.0035, 0.0115, 0.1148]} s={[0.0017, 0.0017, 0.0006]}>
                    <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={1.3} />
                  </Bola>
                  {/* linha da pálpebra */}
                  <Capsula p={[s * 0.05, 0.0215, 0.1102]} r={0.0026} l={0.036} rot={[0, 0, Math.PI / 2]}>
                    <meshStandardMaterial color="#3A2316" roughness={0.8} />
                  </Capsula>
                </>
              )}
              {/* sobrancelha */}
              <Capsula p={[s * 0.051, 0.043, 0.111]} r={0.0048} l={0.036} rot={[0, 0, Math.PI / 2 + s * 0.08]}>
                <meshStandardMaterial color="#2C1A0F" roughness={0.95} />
              </Capsula>
              {/* óculos */}
              {[0.033, -0.017].map((y) => (
                <Caixa key={y} p={[s * 0.052, y, 0.122]} s={[0.072, 0.0036, 0.0036]} raio={0.0016}>
                  <meshStandardMaterial color={ARO} metalness={0.85} roughness={0.28} />
                </Caixa>
              ))}
              {[-0.0355, 0.0355].map((d) => (
                <Caixa key={d} p={[s * 0.052 + d, 0.008, 0.122]} s={[0.0036, 0.054, 0.0036]} raio={0.0016}>
                  <meshStandardMaterial color={ARO} metalness={0.85} roughness={0.28} />
                </Caixa>
              ))}
              <mesh position={[s * 0.052, 0.008, 0.1215]}>
                <planeGeometry args={[0.068, 0.05]} />
                <meshPhysicalMaterial color="#DCE8F2" roughness={0.04} metalness={0.1} transparent opacity={0.1} clearcoat={1} side={THREE.DoubleSide} />
              </mesh>
              <Capsula p={[s * 0.113, 0.024, 0.066]} r={0.0018} l={0.11} rot={[Math.PI / 2, 0, 0]}>
                <meshStandardMaterial color={ARO} metalness={0.85} roughness={0.28} />
              </Capsula>
            </group>
          ))}
          <Capsula p={[0, 0.018, 0.122]} r={0.0018} l={0.026} rot={[0, 0, Math.PI / 2]}>
            <meshStandardMaterial color={ARO} metalness={0.85} roughness={0.28} />
          </Capsula>
          {/* nariz discreto */}
          <Bola p={[0, -0.024, 0.11]} s={[0.0125, 0.024, 0.0125]}>
            {pele()}
          </Bola>
          {/* boca */}
          {boca > 0.15 ? (
            <Bola p={[0, -0.068, 0.1085]} s={[0.017 + boca * 0.004, 0.0035 + boca * 0.011, 0.0035]}>
              <meshStandardMaterial color="#3B1712" roughness={0.75} />
            </Bola>
          ) : (
            <Capsula p={[0, -0.066, 0.1095]} r={0.0028} l={0.028} rot={[0, 0, Math.PI / 2]}>
              <meshStandardMaterial color="#A5624F" roughness={0.55} />
            </Capsula>
          )}
          {/* cabelo: base e tufos pequenos */}
          <Caixa p={[0, 0.102, -0.008]} s={[0.228, 0.05, 0.21]} raio={0.024}>
            <meshStandardMaterial color="#2A190E" roughness={0.95} />
          </Caixa>
          {TUFOS.map((t, i) => (
            <mesh key={i} position={t.p} scale={t.s} castShadow receiveShadow>
              <sphereGeometry args={[1, 10, 8]} />
              <meshStandardMaterial color={t.cor} roughness={0.78} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
};
