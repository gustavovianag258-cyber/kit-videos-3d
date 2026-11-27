import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Camera } from "../../v2/mundo";
import { Boneco, Visual } from "../Boneco";
import { SANS } from "../Textos";
import { Ambiente } from "./Luz";
import { Carro, Parado, Passante } from "./Pecas";
import { LOJAS_RUA, Rua, casasDaRua } from "./Rua";

// Teste de detalhe: rua de bairro no fim de tarde (bar com mesas, mercearia, gente) + plano médio
// do dono da mercearia conversando com uma cliente.
export const DURACAO_TESTE_RUA = 8 * 30;
const CORTE = 4.5 * 30;
const COMP = 120;
const SEMENTE = "teste";

const ZE: Visual = { pele: "#c58c68", cabelo: "careca", barba: true, corCabelo: "#2a1c14", camisa: "#f4f1ea", listras: "#1d2b4a", calca: "#3b3b3b", peso: 1.1, avental: "#a4161a" };
const DANDARA: Visual = { corpo: "mulher", pele: "#6e4532", cabelo: "trancas", corCabelo: "#3a2418", camisa: "#f2c230", manga: "regata", calca: "#2f5f9e", perna: "short", brinco: true };

export const TesteRua: React.FC = () => {
  const frame = useCurrentFrame();
  const s = frame / 30;
  const casas = casasDaRua(COMP, SEMENTE, LOJAS_RUA);
  const bar = casas.find((c) => c.loja?.[0] === "BAR")!;
  const merc = casas.find((c) => c.loja?.[0] === "MERCEARIA")!;
  const plano2 = frame >= CORTE;
  const x = plano2 ? (frame - CORTE) / (8 * 30 - CORTE) : frame / CORTE;
  const e = x * x * (3 - 2 * x);

  // plano 1: câmera andando pela rua em direção ao bar (que fica à esquerda ou à direita)
  const lb = bar.lado;
  const cam1: [number, number, number] = [-lb * 0.6, 1.65, bar.z + 10 - e * 5];
  // plano 2: de frente para a porta da mercearia
  const lm = merc.lado;
  const ze: [number, number, number] = [lm * 4.45, 0.16, merc.z + 0.45];
  const dan: [number, number, number] = [lm * 3.95, 0.16, merc.z - 0.35];
  const cam2: [number, number, number] = [lm * (-1.6 + e * 0.5), 1.45, merc.z + 0.35 - e * 0.15];

  // gente sentada nas mesas do bar: cadeira k fica a 0,62 m da mesa, de frente para ela
  const mesas = [-1, 1].map((k) => ({ x: lb * 4.6, z: bar.z + k * 1.15, giro: 0.3 * k }));
  const sentados = mesas.flatMap((m, i) =>
    [0, 2, 1].map((k) => {
      const a = m.giro + (k * Math.PI) / 2;
      return { pos: [m.x + Math.sin(a) * 0.62, 0.16, m.z + Math.cos(a) * 0.62] as [number, number, number], giro: a + Math.PI, sem: `mesa${i}${k}`, anim: (k === 1 ? "sitting-talking" : "sitting-idle") as "sitting-talking" | "sitting-idle" };
    }),
  );

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Ambiente hora="tarde" foco={plano2 ? 5.7 : 7.5} desfoque={plano2 ? 3 : 1.4} area={45} ao={1.8} raioAo={0.9}>
        {plano2 ? <Camera posicao={cam2} alvo={[lm * 4.3, 1.38, merc.z + 0.05]} fov={30} /> : <Camera posicao={cam1} alvo={[lb * 3.6, 1.5, bar.z - 6]} fov={44} />}
        <Rua hora="tarde" comprimento={COMP} semente={SEMENTE} />
        {/* carro passando */}
        <Carro pos={[-1.6, 0, bar.z - 40 + s * 7]} giroY={0} semente="passando" cor="#e9c46a" />
        {sentados.map((p) => (
          <Parado key={p.sem} semente={p.sem} pos={p.pos} giroY={p.giro} t={s} animacao={p.anim} falando={p.anim === "sitting-talking"} />
        ))}
        <Parado semente="balcao" pos={[lb * 5.3, 0.16, bar.z - 0.2]} giroY={lb > 0 ? -Math.PI / 2 : Math.PI / 2} t={s} animacao="drinking" />
        <Boneco visual={ZE} animacao="talking" falando={plano2} t={s} pos={ze} giroY={lm > 0 ? -Math.PI / 2 - 0.5 : Math.PI / 2 + 0.5} altura={1.74} semente={2} />
        <Boneco visual={DANDARA} animacao={plano2 ? "idle" : "walking"} t={s} pos={plano2 ? dan : [lm * 4.4, 0.16, merc.z + 14 - s * 1.3]} giroY={plano2 ? (lm > 0 ? -Math.PI / 2 + 0.7 : Math.PI / 2 - 0.7) : Math.PI} altura={1.66} semente={4} />
        {Array.from({ length: 6 }, (_, i) => (
          <Passante key={i} semente={`calc${i}`} de={[(i % 2 ? 1 : -1) * 4.5, i < 3 ? -45 : 40]} para={[(i % 2 ? 1 : -1) * 4.5, i < 3 ? 40 : -45]} t={s} y={0.16} />
        ))}
      </Ambiente>
      <div style={{ position: "absolute", top: 1700, left: 0, right: 0, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: 40, color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,0.5)", opacity: interpolate(x, [0, 0.1], [0, 1]) }}>
        {plano2 ? "Seu Zé e Dandara" : "Rua de bairro · fim de tarde"}
      </div>
    </AbsoluteFill>
  );
};
