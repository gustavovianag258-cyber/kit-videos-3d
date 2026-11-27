import { useLoader } from "@react-three/fiber";
import { useMemo } from "react";
import { staticFile } from "remotion";
import * as THREE from "three";
import { Estrelas } from "../v2/mundo";
import { CamTrajeto, type Chave, Palco } from "./palco";
import type { V3 } from "./tempo";

// ESPAÇO, 14:30 UTC: você sobe da Área 51 até 430 km — breu, depois o horizonte curvo com as luzes
// das cidades — e vai se afastando até ver a Terra inteira (14.600 km), com a linha entre o dia e
// a noite passando pela América do Norte. Texturas: NASA (Blue Marble / Black Marble), via three.js.

const R = 6.371; // 1 unidade = 1.000 km
const dir = (lat: number, lon: number): V3 => {
  const f = (lat * Math.PI) / 180;
  const l = (lon * Math.PI) / 180;
  return [Math.cos(f) * Math.cos(l), Math.sin(f), -Math.cos(f) * Math.sin(l)];
};
const mul = (v: V3, k: number): V3 => [v[0] * k, v[1] * k, v[2] * k];
const soma = (...vs: V3[]): V3 => vs.reduce((a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], [0, 0, 0] as V3);
const norte = (lat: number, lon: number): V3 => {
  const f = (lat * Math.PI) / 180;
  const l = (lon * Math.PI) / 180;
  return [-Math.sin(f) * Math.cos(l), Math.cos(f), Math.sin(f) * Math.sin(l)];
};

const SOL = dir(-15, -15);
const NEV = dir(37.2, -115.8);
const NN = norte(37.2, -115.8);
const P0 = mul(NEV, R + 0.41);
const P1 = mul(NEV, R + 0.8);

const CAM: Chave[] = [
  { t: 59.5, pos: P0, alvo: soma(P0, NN, mul(NEV, 0.4)), cima: NEV, fov: 72 },
  { t: 60.6, pos: mul(NEV, R + 0.5), alvo: soma(mul(NEV, R + 0.5), NN, mul(NEV, 0.1)), cima: NEV, fov: 72 },
  { t: 61.8, pos: P1, alvo: soma(P1, NN, mul(NEV, -0.45)), cima: NEV, fov: 72 },
  { t: 63.0, pos: mul(dir(31, -106), R + 5.6), alvo: [0, 0, 0], cima: [0, 1, 0], fov: 72 },
  { t: 64.0, pos: mul(dir(27, -98), R + 14.0), alvo: [0, 0, 0], cima: [0, 1, 0], fov: 72 },
  { t: 66.4, pos: mul(dir(25, -95), R + 14.7), alvo: [0, 0, 0], cima: [0.05, 1, 0], fov: 72 },
];

const vertTerra = `
varying vec2 vUv; varying vec3 vN; varying vec3 vP;
void main(){
  vUv = uv;
  vN = normalize(mat3(modelMatrix) * normal);
  vec4 w = modelMatrix * vec4(position, 1.0);
  vP = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}`;
const fragTerra = `
uniform sampler2D dia; uniform sampler2D noite; uniform sampler2D nuvens; uniform sampler2D mar;
uniform vec3 sol; uniform vec3 cam;
varying vec2 vUv; varying vec3 vN; varying vec3 vP;
void main(){
  vec3 n = normalize(vN);
  vec3 v = normalize(cam - vP);
  float d = dot(n, sol);
  float luz = smoothstep(-0.1, 0.22, d);
  float nv = texture2D(nuvens, vUv).a;
  vec3 cDia = mix(texture2D(dia, vUv).rgb, vec3(1.0), nv * 0.8) * (0.08 + 1.25 * max(d, 0.0));
  vec3 cNoite = texture2D(noite, vUv).rgb * vec3(1.0, 0.8, 0.55) * 2.4 * (1.0 - nv * 0.75);
  vec3 cor = cDia * luz + cNoite * (1.0 - luz);
  float agua = texture2D(mar, vUv).r;
  float brilho = pow(max(dot(reflect(-sol, n), v), 0.0), 40.0) * agua * luz;
  cor += vec3(1.0, 0.95, 0.85) * brilho * 1.4;
  float borda = pow(1.0 - max(dot(n, v), 0.0), 3.0);
  cor += vec3(0.25, 0.5, 1.0) * borda * (0.15 + luz * 0.9);
  gl_FragColor = vec4(cor, 1.0);
}`;

const Terra: React.FC = () => {
  const [dia, noite, nuvens, mar] = useLoader(THREE.TextureLoader, [
    staticFile("astral/terra/earth_atmos_2048.jpg"),
    staticFile("astral/terra/earth_lights_2048.png"),
    staticFile("astral/terra/earth_clouds_1024.png"),
    staticFile("astral/terra/earth_specular_2048.jpg"),
  ]);
  dia.colorSpace = THREE.SRGBColorSpace;
  noite.colorSpace = THREE.SRGBColorSpace;
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { dia: { value: dia }, noite: { value: noite }, nuvens: { value: nuvens }, mar: { value: mar }, sol: { value: new THREE.Vector3(...SOL) }, cam: { value: new THREE.Vector3() } },
        vertexShader: vertTerra,
        fragmentShader: fragTerra,
      }),
    [dia, noite, nuvens, mar],
  );
  const atmos = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { sol: { value: new THREE.Vector3(...SOL) } },
        vertexShader: `varying vec3 vN; varying vec3 vW; void main(){ vN = normalize(normalMatrix * normal); vW = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: `uniform vec3 sol; varying vec3 vN; varying vec3 vW; void main(){ float i = pow(clamp(0.66 - dot(vN, vec3(0.0,0.0,1.0)), 0.0, 1.0), 3.0); float dia = 0.35 + 0.65 * smoothstep(-0.3, 0.4, dot(vW, sol)); gl_FragColor = vec4(vec3(0.32, 0.6, 1.0) * i * 3.2 * dia, 1.0); }`,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false,
      }),
    [],
  );
  return (
    <group>
      <mesh material={mat} onBeforeRender={(_r, _s, c) => mat.uniforms.cam.value.copy(c.position)}>
        <sphereGeometry args={[R, 128, 64]} />
      </mesh>
      <mesh material={atmos} scale={1.035}>
        <sphereGeometry args={[R, 96, 48]} />
      </mesh>
    </group>
  );
};

export const CenaEspaco: React.FC<{ s: number }> = ({ s }) => {
  return (
    <Palco ceu={null} fundo="#000000" foco={50} desfoque={0} brilho={1.0} saturacao={0.1} contraste={0.08}>
      <CamTrajeto ch={CAM} s={s} balanco={0.2} />
      <Estrelas raio={900} quantidade={1800} />
      <Terra />
    </Palco>
  );
};
