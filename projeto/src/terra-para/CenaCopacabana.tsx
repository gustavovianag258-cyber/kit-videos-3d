import { interpolate, random } from "remotion";
import * as THREE from "three";
import { Boneco, type Visual } from "../cinema/Boneco";
import { CameraLivre, CameraTopo, CameraTrajeto, type Chave } from "../cinema/kit/Cameras";
import { Ambiente } from "../cinema/kit/Luz";
import { Calcadao } from "../cinema/kit/Calcadao";
import { Parado, Passante, pessoaAleatoria } from "../cinema/kit/Pecas";
import { clamp, T } from "./tempo";

// "E se a Terra parasse de girar, de repente, na praia de Copacabana?"
// Cena de chão: Diego (o "você" da história) fica parado firme; tudo que não tá preso ao chão
// — o café, a poeira, o resto da galera — continua na mesma velocidade e sai voando pra leste (+x).

// cor viva e saturada (igual ao Culturaverso) — nada de tom neutro/apagado aqui
const DIEGO: Visual = { corpo: "homem", pele: "#b5805f", cabelo: "curto", corCabelo: "#3a2c20", camisa: "#ff7a2f", manga: "curta", calca: "#1d4ed8", perna: "bermuda" };
// x = 7,5: fica no meio do vão entre dois coqueiros do Calçadão (plantados a cada 15 m, x = 0 e x = 15)
const DIEGO_POS: [number, number, number] = [7.5, 0, 31];
const DIEGO_GIRO = Math.PI / 2; // de frente pro leste (+x) — a mesma direção que tudo voa
const FIM_PRIMEIRA_PESSOA = 2.3; // abertura em primeira pessoa com o coco na mão, igual à referência

// Durante a primeira pessoa, o Diego REALMENTE anda até o ponto fixo (a câmera fica presa na cabeça
// dele, e a animação "andando" sozinha quase não desloca a cabeça — sem isso a abertura parece
// travada). Antes de T.parou ele já chegou e fica parado no DIEGO_POS.
const posDiego = (s: number): [number, number, number] => {
  if (s >= FIM_PRIMEIRA_PESSOA) return DIEGO_POS;
  const k = Math.max(0, s / FIM_PRIMEIRA_PESSOA);
  return [DIEGO_POS[0] - 6 * (1 - k), DIEGO_POS[1], DIEGO_POS[2]];
};

// Caneca de café (só malha simples: não usa o sistema de "naMao" do Boneco, porque ela se solta e some)
const Cafe: React.FC<{ s: number }> = ({ s }) => {
  if (s < T.cafeAndou - 2) return null;
  const voou = Math.max(0, s - T.cafeAndou);
  // antes do gatilho: fica quietinho na mão. depois: dispara pra leste e cai girando.
  const x = DIEGO_POS[0] + 0.22 + (voou > 0 ? interpolate(voou, [0, 1.6], [0, 9], { ...clamp, easing: (t) => t * t }) : 0);
  const y = 1.05 - (voou > 0 ? Math.min(0.9, voou * voou * 0.5) : 0);
  const z = DIEGO_POS[2] - 0.35;
  if (voou > 1.6) return null;
  return (
    <group position={[x, y, z]} rotation={[0, 0, voou * 6]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.045, 0.04, 0.07, 14]} />
        <meshStandardMaterial color="#f4f1ea" roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.038, 0]}>
        <cylinderGeometry args={[0.038, 0.038, 0.01, 14]} />
        <meshStandardMaterial color="#4a2f1c" roughness={0.4} />
      </mesh>
    </group>
  );
};

// Poeira/areia solta voando pra leste depois do gatilho (nada antes: areia parada é só areia)
const Poeira: React.FC<{ s: number }> = ({ s }) => {
  if (s < T.parou) return null;
  const voou = s - T.parou;
  return (
    <>
      {Array.from({ length: 10 }, (_, i) => {
        const vel = 3 + random(`poeira-v${i}`) * 5;
        const x0 = -6 + random(`poeira-x${i}`) * 12;
        const z0 = 26 + random(`poeira-z${i}`) * 10;
        const y0 = 0.1 + random(`poeira-y${i}`) * 1.4;
        const x = x0 + voou * vel;
        if (x > 24) return null;
        return (
          <mesh key={i} position={[x, y0, z0]} rotation={[0, voou * 4, voou * 3]}>
            <planeGeometry args={[0.06, 0.06]} />
            <meshStandardMaterial color="#cfae82" roughness={1} side={THREE.DoubleSide} />
          </mesh>
        );
      })}
    </>
  );
};

// O mar inteiro avança e engrossa (fase "oceano"): a borda de frente sai de -70 e avança até a
// praia; a borda de trás fica presa lá no fundo do mar — assim lê como o oceano crescendo, não uma
// fatia fina voando sozinha (isso ficava quase invisível visto de cima).
const OndaGigante: React.FC<{ s: number }> = ({ s }) => {
  if (s < T.oceano - 0.5) return null;
  const k = Math.max(0, Math.min(1, (s - T.oceano) / (T.real - T.oceano)));
  const zFrente = interpolate(k, [0, 1], [-70, 30]);
  const zFundo = -260;
  const altura = interpolate(k, [0, 1], [2, 30]);
  const meio = (zFrente + zFundo) / 2;
  const prof = zFrente - zFundo;
  return (
    <group position={[0, altura / 2 - 1, meio]}>
      <mesh castShadow>
        <boxGeometry args={[420, altura, prof]} />
        <meshPhysicalMaterial color="#1f7fa0" roughness={0.12} transmission={0.08} clearcoat={1} />
      </mesh>
      {/* espuma branca só na borda de frente */}
      <mesh position={[0, altura / 2, prof / 2 - 4]}>
        <boxGeometry args={[420, altura * 0.3, 6]} />
        <meshStandardMaterial color="#ffffff" roughness={0.8} transparent opacity={0.85} />
      </mesh>
    </group>
  );
};

// lane na areia (z=24…27), longe do calçadão onde a câmera anda (z~32…35) — ninguém atravessa a lente.
// Bem mais gente que a V1 (praia cheia de domingo, igual à referência).
const CREWE = Array.from({ length: 11 }, (_, i) => ({ semente: `cp${i}`, z: 24 + (i % 4) * 1.1, de: 2 - i * 2.4, visual: pessoaAleatoria(`cp${i}`) }));

const Multidao: React.FC<{ s: number }> = ({ s }) => {
  const voando = s >= T.entorno;
  const vel = voando ? interpolate(s, [T.entorno, T.oceano], [5, 11], clamp) : 1.2;
  return (
    <>
      {CREWE.map((p) => (
        <Passante key={p.semente} semente={p.semente} de={[p.de, p.z]} para={[p.de + 48, p.z]} t={s} vel={vel} correndo={voando} visual={p.visual} y={0.03} />
      ))}
      <Parado semente="vendedor" pos={[3.5, 0.03, 25.5]} giroY={-1.4} t={s} animacao={s < T.parou ? "idle" : "terrified"} />
      <Parado semente="deitado1" pos={[5, 0.03, 23.5]} giroY={0.4} t={s} animacao={s < T.parou ? "sitting-idle" : "terrified"} />
      <Parado semente="deitado2" pos={[11, 0.03, 24]} giroY={-2} t={s} animacao={s < T.parou ? "sitting-talking" : "terrified"} />
    </>
  );
};

// Brilhinhos no ar (bloom) — o checklist da skill visual-cinematico pede "coisas que brilham de
// verdade": sem isso a cena fica "chapada".
const Brilhinhos: React.FC<{ s: number }> = ({ s }) => (
  <>
    {Array.from({ length: 10 }, (_, i) => {
      const x = 2 + (i * 1.7) % 16;
      const z = 29.5 + ((i * 3.1) % 4);
      const y = 1.2 + Math.sin(s * 0.9 + i * 2) * 0.5 + 0.8;
      return (
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[0.025, 6, 6]} />
          <meshStandardMaterial color="#fff6d8" emissive="#fff0c0" emissiveIntensity={3} />
        </mesh>
      );
    })}
  </>
);

const CHAVES: Chave[] = [
  { t: FIM_PRIMEIRA_PESSOA, pos: [14, 2.6, 35.5], alvo: [7.5, 1.3, 29], fov: 48 },
  { t: 5, pos: [9.5, 1.65, 33], alvo: [4.5, 1.4, 28.5], fov: 42 },
  { t: 8, pos: [9.2, 1.6, 32.8], alvo: [7, 1.3, 29.5], fov: 40 },
  { t: T.parou, pos: [8.4, 1.6, 32.6], alvo: [7.5, 1.3, 30.8], fov: 40 },
  { t: T.cafeAndou, pos: [8.7, 1.55, 32.3], alvo: [7.8, 1.3, 30.9], fov: 38 },
  { t: T.entorno, pos: [6.5, 1.9, 34.2], alvo: [10, 1.3, 28.5], fov: 46 },
  { t: 27, pos: [4, 2.4, 35], alvo: [12, 1.4, 27], fov: 48 },
];

export const CenaCopacabana: React.FC<{ s: number }> = ({ s }) => {
  const foco = s < T.parou ? 6 : 10;
  const primeiraPessoa = s < FIM_PRIMEIRA_PESSOA;
  return (
    <Ambiente hora="dia" foco={foco} desfoque={1.6} area={50} alvoSombra={[0, 0, 30]}>
      {!primeiraPessoa &&
        (s < 28.5 ? (
          <CameraTrajeto chaves={CHAVES} s={Math.min(s, 28)} mao={s >= T.parou ? 1.4 : 0.3} />
        ) : s < T.real ? (
          <CameraTopo alvo={[15.5, 0, 10]} altura={interpolate(s, [28.5, T.real], [36, 150], clamp)} s={s} giro={0.05} fov={50} />
        ) : (
          <CameraLivre pos={[8.9, 1.6, 32.6]} alvo={[7.5, 1.3, 30.8]} fov={40} />
        ))}
      <Calcadao hora="dia" s={s} semente="terrapara" />
      <Boneco
        visual={DIEGO}
        animacao={primeiraPessoa ? "walking" : s < T.parou ? "idle" : s < T.vento ? "terrified" : s < T.real ? "falling" : "laughing"}
        velocidade={primeiraPessoa ? 1.3 : 1}
        t={s}
        pos={posDiego(s)}
        giroY={DIEGO_GIRO}
        altura={1.78}
        semente={7}
        primeiraPessoa={primeiraPessoa ? { inclinar: 0.55, fov: 60 } : undefined}
        naMao={primeiraPessoa ? "coco" : undefined}
      />
      <Cafe s={s} />
      <Multidao s={s} />
      <Poeira s={s} />
      <OndaGigante s={s} />
      {s < T.vento && <Brilhinhos s={s} />}
    </Ambiente>
  );
};
