import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Camera } from "../../v2/mundo";
import { Boneco } from "../Boneco";
import { SANS, SERIFA } from "../Textos";
import { Calcadao } from "./Calcadao";
import { Cidade } from "./Cidade";
import { Ambiente, Hora } from "./Luz";
import { Mercadinho } from "./Mercadinho";
import { BANCOS, Parque } from "./Parque";
import { Parado, Passante } from "./Pecas";
import { Rua } from "./Rua";

// Vitrine do kit de cenários: 6 lugares x 2,5 s, cada um numa hora do dia, com gente e câmera andando.
const CENA = 75;
export const DURACAO_VITRINE = CENA * 6;

type V3 = [number, number, number];
const mover = (x: number, a: V3, b: V3): V3 => {
  const e = x * x * (3 - 2 * x);
  return [a[0] + (b[0] - a[0]) * e, a[1] + (b[1] - a[1]) * e, a[2] + (b[2] - a[2]) * e];
};

const Rotulo: React.FC<{ lugar: string; hora: string; f: number }> = ({ lugar, hora, f }) => (
  <div style={{ position: "absolute", top: 1560, left: 0, right: 0, textAlign: "center", opacity: interpolate(f, [4, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
    <div style={{ fontFamily: SERIFA, fontSize: 76, color: "#fff", textShadow: "0 3px 14px rgba(0,0,0,0.55)" }}>{lugar}</div>
    <div style={{ fontFamily: SANS, fontSize: 30, letterSpacing: 8, color: "rgba(255,255,255,0.9)", marginTop: 8, textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>{hora}</div>
  </div>
);

const CenaRua: React.FC<{ s: number; x: number; hora: Hora }> = ({ s, x, hora }) => {
  const cam = mover(x, [2.2, 1.7, 14], [1.4, 1.6, 4]);
  return (
    <Ambiente hora={hora} foco={6} desfoque={1.6} area={40}>
      <Camera posicao={cam} alvo={[-0.5, 2.2, cam[2] - 12]} fov={42} />
      <Rua hora={hora} comprimento={130} semente="vitrine" />
      {Array.from({ length: 7 }, (_, i) => (
        <Passante key={i} semente={`rua${i}`} de={[i % 2 ? 4.6 : -4.6, i % 2 ? -40 : 30]} para={[i % 2 ? 4.6 : -4.6, i % 2 ? 30 : -40]} t={s} y={0.16} />
      ))}
      <Parado semente="rua-p1" pos={[4.3, 0.16, -2]} giroY={-2.4} t={s} animacao="talking" />
      <Parado semente="rua-p2" pos={[4.9, 0.16, -2.7]} giroY={0.5} t={s} animacao="laughing" />
      <Parado semente="rua-p3" pos={[-4.5, 0.16, -8]} giroY={1.2} t={s} animacao="texting-while-standing" />
    </Ambiente>
  );
};

const CenaCalcadao: React.FC<{ s: number; x: number }> = ({ s, x }) => {
  const cam = mover(x, [6, 1.6, 33.5], [-2, 1.7, 32]);
  return (
    <Ambiente hora="entardecer" foco={7} desfoque={1.8} area={45}>
      <Camera posicao={cam} alvo={[cam[0] - 14, 1.4, 27]} fov={44} />
      <Calcadao hora="entardecer" s={s} />
      {Array.from({ length: 8 }, (_, i) => (
        <Passante key={i} semente={`orla${i}`} de={[i % 2 ? -40 : 20, 29.5 + (i % 4) * 1.2]} para={[i % 2 ? 20 : -40, 29.5 + (i % 4) * 1.2]} t={s} correndo={i === 3} vel={i === 3 ? 3.2 : 1.2} />
      ))}
      <Parado semente="orla-p1" pos={[-16, 0, 32.4]} giroY={2.5} t={s} animacao="drinking" />
      <Parado semente="orla-p2" pos={[-15.2, 0, 31.6]} giroY={-0.8} t={s} animacao="talking" />
    </Ambiente>
  );
};

const CenaMercadinho: React.FC<{ s: number; x: number }> = ({ s, x }) => {
  const cam = mover(x, [-1.6, 1.55, 2.6], [-0.6, 1.5, 1.4]);
  return (
    <Ambiente hora="interior" foco={2.4} desfoque={2.6} area={8}>
      <Camera posicao={cam} alvo={[0.6, 1.3, -1.5]} fov={44} />
      <Mercadinho />
      {/* o dono atrás do balcão e uma cliente comprando */}
      <Boneco visual={{ pele: "#c58c68", cabelo: "careca", barba: true, corCabelo: "#2a1c14", camisa: "#f4f1ea", listras: "#1d2b4a", calca: "#3b3b3b", peso: 1.1 }} animacao="talking" falando t={s} pos={[2.75, 0, 0.3]} giroY={-Math.PI / 2} altura={1.74} semente={2} />
      <Boneco visual={{ corpo: "mulher", pele: "#6e4532", cabelo: "trancas", corCabelo: "#3a2418", camisa: "#f2c230", manga: "regata", calca: "#2f5f9e", perna: "short", brinco: true }} animacao="idle" t={s} pos={[1.2, 0, 0.1]} giroY={Math.PI / 2} altura={1.66} semente={4} />
    </Ambiente>
  );
};

const CenaParque: React.FC<{ s: number; x: number }> = ({ s, x }) => {
  const cam = mover(x, [-3.5, 0.5, 9], [-1.5, 0.75, 6]);
  return (
    <Ambiente hora="manha" foco={4.5} desfoque={2.2} area={35}>
      <Camera posicao={cam} alvo={[0.5, 0.9, -2]} fov={42} />
      <Parque hora="manha" s={s} />
      {BANCOS.slice(0, 2).map(([bx, bz, g], i) => (
        <Parado key={i} semente={`banco${i}`} pos={[bx, 0, bz]} giroY={g} t={s} animacao={i ? "sitting-talking" : "sitting-idle"} />
      ))}
      {Array.from({ length: 5 }, (_, i) => (
        <Passante key={i} semente={`parque${i}`} de={[i % 2 ? 0.6 : -0.6, i % 2 ? -40 : 25]} para={[i % 2 ? 0.6 : -0.6, i % 2 ? 25 : -40]} t={s} correndo={i === 2} vel={i === 2 ? 3 : 1.2} />
      ))}
      <Parado semente="pique1" pos={[-5.6, 0, 2.6]} giroY={0.6} t={s} animacao="waving" />
    </Ambiente>
  );
};

const CenaCidade: React.FC<{ s: number; x: number }> = ({ x }) => {
  const cam = mover(x, [-260, 210, 300], [-120, 170, 160]);
  return (
    <Ambiente hora="noite" foco={300} desfoque={0.3} area={400} semNevoa>
      <Camera posicao={cam} alvo={[60, 0, -80]} fov={46} />
      <fog attach="fog" args={["#141c32", 200, 1300]} />
      <Cidade hora="noite" />
    </Ambiente>
  );
};

export const Vitrine: React.FC = () => {
  const frame = useCurrentFrame();
  const n = Math.floor(frame / CENA);
  const f = frame % CENA;
  const x = f / (CENA - 1);
  const s = frame / 30;
  const cenas = [
    { lugar: "Rua de bairro", hora: "TARDE", el: <CenaRua s={s} x={x} hora="tarde" /> },
    { lugar: "Calçadão", hora: "ENTARDECER", el: <CenaCalcadao s={s} x={x} /> },
    { lugar: "Mercadinho", hora: "INTERIOR", el: <CenaMercadinho s={s} x={x} /> },
    { lugar: "Parque", hora: "MANHÃ", el: <CenaParque s={s} x={x} /> },
    { lugar: "Cidade de cima", hora: "NOITE", el: <CenaCidade s={s} x={x} /> },
    { lugar: "Rua de bairro", hora: "CÉU EM CHAMAS", el: <CenaRua s={s} x={x} hora="fogo" /> },
  ];
  const c = cenas[Math.min(n, cenas.length - 1)];
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {c.el}
      <Rotulo lugar={c.lugar} hora={c.hora} f={f} />
    </AbsoluteFill>
  );
};
