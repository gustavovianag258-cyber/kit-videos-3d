import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Camera } from "../v2/mundo";
import { Acabamento, PalcoCinema, Sol } from "./Palco";
import { Boneco, type Visual } from "./Boneco";
import { Mercadinho } from "./kit/Mercadinho";
import { SANS } from "./Textos";

// Teste do elenco do vídeo "E se todo mundo ouvisse os pensamentos de todo mundo?" (Mercadão/Mercadinho).
// Só para o usuário ver a cara dos 3 personagens antes de ir pra produção.
// V2 (pedido do usuário): cores de roupa mais neutras/realistas e acabamento com menos saturação/contraste
// de cartoon (saturacao e contraste bem mais baixos que o preset "interior" padrão).
export const DURACAO_TELEPATIA = 150;

export const ELENCO_TELEPATIA: { nome: string; visual: Visual; pos: [number, number, number]; giroY: number; anim: "idle" | "talking" | "waving" }[] = [
  { nome: "Marcos", anim: "idle", pos: [-0.9, 0, 0.9], giroY: 0.3, visual: { corpo: "homem", pele: "#b5805f", cabelo: "curto", corCabelo: "#3a2c20", camisa: "#cfc7b8", manga: "curta", calca: "#3b4654" } },
  { nome: "Juliana", anim: "talking", pos: [0.1, 0, 1.0], giroY: -0.2, visual: { corpo: "mulher", pele: "#7d5138", cabelo: "rabo", corCabelo: "#2a1810", camisa: "#b98a5e", manga: "curta", calca: "#333330", perna: "calca", brinco: true } },
  { nome: "Rodrigo", anim: "waving", pos: [1.1, 0, 0.75], giroY: -0.6, visual: { corpo: "homem", pele: "#d4a87e", cabelo: "black", corCabelo: "#1c1511", barba: true, camisa: "#5c6a57", manga: "curta", calca: "#49392b" } },
];

export const TesteTelepatia: React.FC = () => {
  const frame = useCurrentFrame();
  const s = frame / 30;
  const x = frame / (DURACAO_TELEPATIA - 1);
  const cam: [number, number, number] = [interpolate(x, [0, 1], [-1.7, 1.8]), 1.55, interpolate(x, [0, 1], [2.9, 2.5])];
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <PalcoCinema ceu="estudio" fundo="#2a2622" luzCeu={0.4} brilhoCeu={0}>
        <Camera posicao={cam} alvo={[0.1, 1.25, -0.5]} fov={42} />
        <Sol pos={[3, 6, 4]} cor="#fff1dc" forca={0.85} area={8} />
        <hemisphereLight args={["#fff4e6", "#6b5a48", 0.5]} />
        <fog attach="fog" args={["#2a2622", 30, 120]} />
        <Mercadinho />
        {ELENCO_TELEPATIA.map((p) => (
          <Boneco key={p.nome} visual={p.visual} animacao={p.anim} t={s} pos={p.pos} giroY={p.giroY} altura={p.visual.corpo === "mulher" ? 1.66 : 1.78} falando={p.anim === "talking"} semente={p.nome.length} />
        ))}
        <Acabamento foco={2.6} desfoque={2.2} brilho={0.3} saturacao={0.04} contraste={0.06} ao={1.6} raioAo={1.2} />
      </PalcoCinema>
      <div style={{ position: "absolute", top: 1700, left: 0, right: 0, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: 42, color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,0.55)" }}>
        {ELENCO_TELEPATIA.map((p) => p.nome).join(" · ")}
      </div>
    </AbsoluteFill>
  );
};
