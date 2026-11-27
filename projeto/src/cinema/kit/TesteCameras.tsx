import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Boneco, Visual } from "../Boneco";
import { SANS } from "../Textos";
import { CameraLivre, CameraOrbita, CameraTopo, CameraTrajeto, Chave, V3, tremor } from "./Cameras";
import { Ambiente } from "./Luz";
import { Carro, Parado, Passante } from "./Pecas";
import { LOJAS_RUA, Rua, casasDaRua } from "./Rua";

// Teste do kit de câmeras: 7 tipos de plano na mesma rua (voo que entra na loja, primeira pessoa
// pagando com Pix, close de reação, olho de Deus, rente ao chão, primeira pessoa andando, órbita).
export const DURACAO_TESTE_CAMERAS = 16 * 30;
const COMP = 120;
const SEMENTE = "teste";

const ZE: Visual = { pele: "#c58c68", cabelo: "careca", barba: true, corCabelo: "#2a1c14", camisa: "#f4f1ea", listras: "#1d2b4a", calca: "#3b3b3b", peso: 1.1, avental: "#a4161a" };
const DANDARA: Visual = { corpo: "mulher", pele: "#6e4532", cabelo: "trancas", corCabelo: "#3a2418", camisa: "#f2c230", manga: "regata", calca: "#2f5f9e", perna: "short", brinco: true };
const CAIO: Visual = { pele: "#8d5a3c", cabelo: "black", corCabelo: "#1c1410", camisa: "#ff7a2f", calca: "#4a6fa5" };

const PLANOS: [number, string][] = [
  [0, "Voo contínuo · entra na loja"],
  [5, "Primeira pessoa · pagando"],
  [6.8, "Close de reação"],
  [8.2, "Olho de Deus"],
  [9.8, "Rente ao chão"],
  [11.6, "Primeira pessoa · andando"],
  [13.8, "Órbita"],
];

export const TesteCameras: React.FC = () => {
  const frame = useCurrentFrame();
  const s = frame / 30;
  const casas = casasDaRua(COMP, SEMENTE, LOJAS_RUA);
  const bar = casas.find((c) => c.loja?.[0] === "BAR")!;
  const merc = casas.find((c) => c.loja?.[0] === "MERCEARIA")!;
  const lm = merc.lado;
  const lb = bar.lado;
  const w = Math.min(merc.larg - 1.2, 3.4);
  // dentro da mercearia: profundidade d vira x, e a posição ao longo da fachada vira z
  const dentro = (d: number, lx: number, y = 0.01): V3 => [lm * (5.9 + d), y, merc.z + lm * lx];
  const dan = dentro(2.2, w / 2 - 1.45);
  const giroDan = lm > 0 ? 0 : Math.PI;
  const ze: V3 = [lm * 4.7, 0.16, merc.z - lm * (w / 2 + 0.55)];
  const giroZe = -lm * (Math.PI / 2) + 0.4;
  const plano = PLANOS.filter(([t]) => s >= t).length - 1;
  const ini = PLANOS[plano][0];
  const fim = PLANOS[plano + 1]?.[0] ?? 16;
  const x = (s - ini) / (fim - ini);

  // A: voo que desce do céu, vem pela calçada e entra pela porta até o ombro da Dandara
  const fDan: V3 = [0, 0, lm];
  const ombroFinal: V3 = [dan[0] + 0.45 * -lm, 1.78, dan[2] - fDan[2] * 1.15];
  const voo: Chave[] = [
    { t: 0, pos: [-lm * 2, 26, merc.z + 42], alvo: [lm * 3, 0, merc.z], fov: 50 },
    { t: 1.5, pos: [-lm * 1, 8, merc.z + 15], alvo: [lm * 5, 1.5, merc.z], fov: 46 },
    { t: 2.8, pos: [lm * 1.4, 1.7, merc.z + 3.5], alvo: [lm * 7, 1.4, merc.z], fov: 44 },
    { t: 3.9, pos: [lm * 5.0, 1.6, merc.z + lm * 0.2], alvo: [lm * 9, 1.4, dan[2]], fov: 46 },
    { t: 5, pos: ombroFinal, alvo: [dan[0] + 0.0, 1.15, dan[2] + fDan[2] * 2], fov: 44 },
  ];

  // F: Caio andando pela calçada do outro lado (a câmera vira os olhos dele)
  const caioZ = bar.z + 18 - (s - 11.6) * 1.3;
  const caio: V3 = [-lb * 4.5, 0.16, caioZ];

  let camera: React.ReactNode = null;
  if (plano === 0) camera = <CameraTrajeto chaves={voo} s={s} mao={0.4} />;
  if (plano === 2) {
    const f: V3 = [Math.sin(giroZe), 0, Math.cos(giroZe)];
    const rosto: V3 = [ze[0], ze[1] + 1.6, ze[2]];
    const m = tremor(s, 0.5);
    camera = <CameraLivre pos={[rosto[0] + f[0] * (1.15 - x * 0.2) + m[0], rosto[1] + 0.02 + m[1], rosto[2] + f[2] * (1.15 - x * 0.2) + 0.15]} alvo={rosto} fov={30} />;
  }
  if (plano === 3) camera = <CameraTopo alvo={[lb * 4.6, 0.2, bar.z]} altura={7.5 - x * 1.5} s={s} giro={0.25} fov={45} />;
  if (plano === 4) {
    const z = bar.z + 16 - x * 14;
    camera = <CameraLivre pos={[-lb * 0.9, 0.45, z]} alvo={[lb * 2.5, 0.9, z - 8]} fov={52} rolo={-0.04 * lb} />;
  }
  if (plano === 6) camera = <CameraOrbita alvo={[lb * 4.6, 0.9, bar.z]} raio={3.4} altura={-0.3} de={-lb * 1.9} ate={-lb * 0.9} x={x} fov={42} />;

  // gente sentada nas mesas do bar
  const mesas = [-1, 1].map((k) => ({ x: lb * 4.6, z: bar.z + k * 1.15, giro: 0.3 * k }));
  const sentados = mesas.flatMap((m, i) =>
    [0, 2, 1].map((k) => {
      const a = m.giro + (k * Math.PI) / 2;
      return { pos: [m.x + Math.sin(a) * 0.62, 0.16, m.z + Math.cos(a) * 0.62] as V3, giro: a + Math.PI, sem: `mesa${i}${k}`, anim: (k === 1 ? "sitting-talking" : "sitting-idle") as "sitting-talking" | "sitting-idle" };
    }),
  );

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Ambiente hora="tarde" foco={plano === 2 ? 1.1 : plano === 1 ? 0.6 : plano === 3 ? 7 : 5} desfoque={plano === 2 ? 3 : 1.6} area={45} ao={1.6} raioAo={0.9}>
        {camera}
        <Rua hora="tarde" comprimento={COMP} semente={SEMENTE} />
        <Carro pos={[-1.6, 0, bar.z - 40 + s * 6]} giroY={0} semente="passando" cor="#e9c46a" />
        {sentados.map((p) => (
          <Parado key={p.sem} semente={p.sem} pos={p.pos} giroY={p.giro} t={s} animacao={p.anim} falando={p.anim === "sitting-talking"} />
        ))}
        {/* Dandara no balcão: no plano B a câmera vira os olhos dela, com o celular no Pix */}
        <Boneco
          visual={DANDARA}
          animacao={plano === 1 ? "texting-while-standing" : "idle"}
          t={s}
          pos={dan}
          giroY={giroDan}
          altura={1.66}
          semente={4}
          naMao={plano === 1 ? "celular" : undefined}
          telaCelular="pix"
          primeiraPessoa={plano === 1 ? { inclinar: 1.05, fov: 66 } : undefined}
        />
        <Boneco visual={ZE} animacao={plano === 2 ? "surprised" : "talking"} falando={plano !== 2} t={s} pos={ze} giroY={giroZe} altura={1.74} semente={2} />
        <Boneco
          visual={CAIO}
          animacao="walking"
          t={s}
          pos={plano === 5 ? caio : [-lb * 4.5, 0.16, bar.z + 30 - s * 1.3]}
          giroY={Math.PI}
          altura={1.76}
          semente={7}
          naMao="coco"
          primeiraPessoa={plano === 5 ? { inclinar: 0.12, fov: 70 } : undefined}
        />
        {Array.from({ length: 6 }, (_, i) => (
          <Passante key={i} semente={`calc${i}`} de={[(i % 2 ? 1 : -1) * 4.4, i < 3 ? -45 : 40]} para={[(i % 2 ? 1 : -1) * 4.4, i < 3 ? 40 : -45]} t={s} y={0.16} />
        ))}
      </Ambiente>
      <div
        style={{
          position: "absolute",
          top: 120,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: SANS,
          fontWeight: 600,
          fontSize: 34,
          letterSpacing: 4,
          color: "#fff",
          textShadow: "0 2px 8px rgba(0,0,0,0.6)",
          opacity: interpolate(x, [0, 0.08], [0, 1], { extrapolateRight: "clamp" }),
        }}
      >
        {PLANOS[plano][1].toUpperCase()}
      </div>
    </AbsoluteFill>
  );
};
