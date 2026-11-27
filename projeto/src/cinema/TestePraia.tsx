import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Camera } from "../v2/mundo";
import { Acabamento, PalcoCinema, Sol } from "./Palco";
import { Boneco } from "./Boneco";
import { Areia, Coqueiro, Gaivotas, GuardaSol, Mar, Orla, PlacaTubarao } from "./kit/Praia";
import { HudAnel, NomeEspacado, TextoSerifa } from "./Textos";

// TESTE DE ESTILO (visual-cinematico): Ícaro semi-realista andando para o mar em Boa Viagem.
// Praia ao longo do eixo x: mar em z < -7, areia até z = 28, avenida e prédios da orla depois.

export const DURACAO_TESTE = 6.5 * 30;

const FPS = 30;
type V3 = [number, number, number];

// Câmera na mão: pequeno balanço determinístico
const CameraMao: React.FC<{ de: V3; para: V3; alvoDe: V3; alvoPara: V3; x: number; s: number; fov?: number }> = ({ de, para, alvoDe, alvoPara, x, s, fov = 40 }) => {
  const e = x * x * (3 - 2 * x);
  const L = (a: V3, b: V3): V3 => [a[0] + (b[0] - a[0]) * e, a[1] + (b[1] - a[1]) * e, a[2] + (b[2] - a[2]) * e];
  const p = L(de, para);
  const a = L(alvoDe, alvoPara);
  const m = [Math.sin(s * 1.7) * 0.03, Math.sin(s * 2.3 + 1) * 0.02, 0];
  return <Camera posicao={[p[0] + m[0], p[1] + m[1], p[2]]} alvo={a} fov={fov} rolo={Math.sin(s * 1.1) * 0.006} />;
};

export const TestePraia: React.FC = () => {
  const frame = useCurrentFrame();
  const s = frame / FPS;
  // o Ícaro anda ~1,3 m/s em diagonal para o mar
  const ix = 2.0 - s * 0.55;
  const iz = 4.0 - s * 1.2;
  return (
    <AbsoluteFill style={{ background: "#9fd3ff" }}>
      <PalcoCinema ceu="praia-sol">
        {/* de frente, em 3/4: ele vem na direção da câmera; atrás dele guarda-sóis, banhistas, coqueiros e a orla */}
        <CameraMao de={[ix - 2.4, 1.6, iz - 3.9]} para={[ix - 2.1, 1.6, iz - 3.5]} alvoDe={[ix + 3.4, 1.35, iz + 6.3]} alvoPara={[ix + 3.2, 1.4, iz + 6.3]} x={s / 6.5} s={s} fov={42} />
        {/* sol de fim de tarde atrás dele (lado da orla): contraluz recortando o corpo e sombras longas para o mar */}
        <Sol pos={[22, 13, 42]} cor="#ffcf96" forca={3.6} area={40} />
        <directionalLight position={[-10, 6, -20]} intensity={0.9} color="#bcd9ff" />
        <hemisphereLight args={["#bfe3ff", "#e9cfa0", 0.35]} />
        <fog attach="fog" args={["#f2dcc0", 14, 150]} />
        <Areia />
        <Mar s={s} />
        <Orla />
        <Gaivotas s={s} />
        {[
          [-14, 0, 14, 0.3, 0.2],
          [-3, 0, 19, 0.2, 1.4],
          [9, 0, 16, 0.35, 2.5],
          [-30, 0, 18, 0.28, 0.8],
          [-46, 0, 15, 0.22, 3.0],
          [22, 0, 20, 0.3, 1.0],
        ].map(([x, y, z, inc, g], i) => (
          <Coqueiro key={i} pos={[x, y, z]} s={s} h={7.5 + (i % 3)} inclina={inc} giro={g} />
        ))}
        <GuardaSol pos={[-6, 0, 6]} cor="#e63946" s={s} />
        <GuardaSol pos={[-13, 0, 3]} cor="#2a9d8f" s={s} />
        <GuardaSol pos={[-22, 0, 7]} cor="#f4a261" s={s} />
        <GuardaSol pos={[3, 0, 11]} cor="#1d4ed8" s={s} />
        <PlacaTubarao pos={[-1.5, 0, 1.5]} giro={0.6} />

        {/* Ícaro: boneco "escrito em código" (estilo Culturaverso), andando para o mar */}
        <Boneco visual={{ pele: "#a86e4c", cabelo: "curto", corCabelo: "#1a120c", barba: true, camisa: "#ff7a2f", calca: "#2f5f9e" }} animacao="walking" t={s} pos={[ix, 0, iz]} giroY={Math.atan2(-0.55, -1.2)} altura={1.78} />
        {/* banhistas */}
        <Boneco visual={{ corpo: "mulher", pele: "#d9a07a", cabelo: "longo", corCabelo: "#3b2214", vestido: "#ff6fa3" }} animacao="talking" falando t={s + 1.3} pos={[-5.2, 0, 7.2]} giroY={1.2} altura={1.65} semente={1} />
        <Boneco visual={{ pele: "#7a4a32", cabelo: "raspado", camisa: "#f4f4f4", calca: "#2b2d42" }} animacao="laughing" t={s + 0.4} pos={[-6.4, 0, 6.6]} giroY={-1.9} altura={1.8} semente={2} />
        <Boneco visual={{ corpo: "mulher", pele: "#5e3a28", cabelo: "trancas", corCabelo: "#2a1a10", camisa: "#ffd166", manga: "regata", calca: "#118ab2", perna: "short", brinco: true }} animacao="texting-while-standing" t={s} pos={[-12, 0, 4.2]} giroY={-2.2} altura={1.68} semente={3} />
        <Boneco visual={{ pele: "#e8b896", cabelo: "bone", corBone: "#e63946", camisa: "#06d6a0", manga: "regata", calca: "#22223b", perna: "short" }} animacao="running" t={s} pos={[-30 + s * 3.2, 0, -3]} giroY={Math.PI / 2} altura={1.76} semente={4} />
        <Boneco visual={{ corpo: "mulher", pele: "#c58c68", cabelo: "black", corCabelo: "#15100c", vestido: "#8338ec" }} animacao="walking" t={s + 0.6} pos={[-20 + s * 1.1, 0, 1]} giroY={Math.PI / 2} altura={1.66} semente={5} />
        {/* atrás dele, no caminho da câmera: mais gente, guarda-sóis e cadeiras (o fundo tem que estar vivo) */}
        <GuardaSol pos={[6.5, 0, 9]} cor="#ffbe0b" s={s} />
        <GuardaSol pos={[11, 0, 13]} cor="#e63946" s={s} />
        <GuardaSol pos={[1.5, 0, 16]} cor="#2a9d8f" s={s} />
        <GuardaSol pos={[15, 0, 19]} cor="#8338ec" s={s} />
        {[
          [6.0, 7.8, 0.3, "#ff7b00"],
          [7.0, 7.9, -0.2, "#3a86ff"],
          [10.5, 11.8, 0.1, "#06d6a0"],
        ].map(([x, z, g, c], i) => (
          <group key={i} position={[x as number, 0, z as number]} rotation={[0, g as number, 0]}>
            {/* cadeira de praia de lona */}
            <mesh position={[0, 0.32, 0]} rotation={[-0.5, 0, 0]} castShadow>
              <boxGeometry args={[0.55, 0.04, 0.9]} />
              <meshStandardMaterial color={c as string} roughness={0.9} />
            </mesh>
            <mesh position={[0, 0.16, 0.1]}>
              <boxGeometry args={[0.6, 0.32, 0.03]} />
              <meshStandardMaterial color="#d1d5db" metalness={0.5} roughness={0.4} />
            </mesh>
          </group>
        ))}
        <Boneco visual={{ corpo: "mulher", pele: "#f0c8a8", cabelo: "rabo", corCabelo: "#5a3420", camisa: "#e63946", calca: "#e63946", perna: "short" }} animacao="talking" falando t={s + 2} pos={[6.6, 0, 8.4]} giroY={2.8} altura={1.64} semente={6} />
        <Boneco visual={{ pele: "#4e3022", cabelo: "careca", barba: true, corCabelo: "#1a1410", camisa: "#ffffff", listras: "#264653", calca: "#264653", peso: 1.15 }} animacao="talking" falando t={s + 0.9} pos={[8.2, 0, 8.6]} giroY={-2.4} altura={1.74} semente={7} />
        <Boneco visual={{ pele: "#c99470", cabelo: "curto", corCabelo: "#2a1c14", camisa: "#f4a261", calca: "#3d405b" }} animacao="walking" t={s + 1.7} pos={[2 + s * 1.2, 0, 12.5]} giroY={Math.PI / 2 + 0.2} altura={1.77} semente={8} />
        <Boneco visual={{ corpo: "mulher", pele: "#8d5a3c", cabelo: "coque", corCabelo: "#2a1a10", camisa: "#ffd6e7", calca: "#118ab2", perna: "short" }} animacao="idle" t={s + 0.3} pos={[12.5, 0, 15]} giroY={3.6} altura={1.62} semente={9} />

        <Acabamento foco={4.6} desfoque={5.5} brilho={0.8} saturacao={0.15} contraste={0.1} />
      </PalcoCinema>

      {/* textos do padrão novo */}
      <TextoSerifa s={s} de={0.2} ate={2.6} topo={330} tam={70} texto="E se você acordasse amanhã e *não pudesse mais morrer?*" />
      <NomeEspacado s={s} de={2.8} ate={4.6} nome="Ícaro" linha="31 ANOS · RECIFE" topo={330} />
      <HudAnel s={s} de={0.4} ate={6.4} rotulo="ANOS IMORTAL" valor="0" linha="BOA VIAGEM · 16:40" progresso={0.02 + (s / 6.5) * 0.1} />
      <TextoSerifa s={s} de={4.4} ate={6.3} topo={1380} tam={60} texto="Mar de *tubarões*." />
    </AbsoluteFill>
  );
};
