import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Camera } from "../v2/mundo";
import { Boneco, Visual } from "./Boneco";
import { Acabamento, PalcoCinema, Sol } from "./Palco";
import { SANS } from "./Textos";

// Teste dos bonecos "escritos em código" (estilo Culturaverso): 4 pessoas no fim de tarde e um close.
export const DURACAO_BONECO = 6 * 30;

export const ELENCO_BONECO: { nome: string; visual: Visual; anim: "idle" | "waving" | "talking" | "laughing" }[] = [
  { nome: "Dandara", anim: "talking", visual: { corpo: "mulher", pele: "#6e4532", cabelo: "trancas", corCabelo: "#3a2418", camisa: "#f2c230", manga: "regata", calca: "#2f5f9e", perna: "short", brinco: true } },
  { nome: "Seu Zé", anim: "laughing", visual: { corpo: "homem", pele: "#c58c68", cabelo: "raspado", corCabelo: "#2a1c14", barba: true, camisa: "#f4f1ea", listras: "#1d2b4a", calca: "#3b3b3b", peso: 1.15 } },
  { nome: "Bia", anim: "waving", visual: { corpo: "mulher", pele: "#ecc2a2", cabelo: "rabo", corCabelo: "#4a2c1c", camisa: "#ffffff", calca: "#3f7fc8", perna: "short" } },
  { nome: "Caio", anim: "idle", visual: { corpo: "homem", pele: "#8d5a3c", cabelo: "black", corCabelo: "#1c1410", camisa: "#ff7a2f", calca: "#4a6fa5" } },
];

export const TesteBoneco: React.FC = () => {
  const frame = useCurrentFrame();
  const s = frame / 30;
  const close = frame >= 90;
  const meio = frame >= 60 && frame < 90;
  const giro = interpolate(frame, [0, 89], [-0.25, 0.25]);
  const camGeral: [number, number, number] = [Math.sin(giro) * 8.6, 1.45, Math.cos(giro) * 8.6];
  const zoom = interpolate(frame, [90, 179], [1.05, 0.85]);
  return (
    <AbsoluteFill style={{ background: "#f2c9a0" }}>
      <PalcoCinema ceu="entardecer">
        {meio ? <Camera posicao={[0.2, 1.0, 2.6]} alvo={[0, 0.95, 0]} fov={40} /> : close ? <Camera posicao={[-1.5 + 0.25, 1.55, zoom]} alvo={[-1.5, 1.5, 0]} fov={30} /> : <Camera posicao={camGeral} alvo={[0, 1.05, 0]} fov={40} />}
        <Sol pos={[-6, 5, 7]} cor="#ffd2a0" forca={3.2} />
        <hemisphereLight args={["#ffd9b8", "#9a7c62", 0.55]} />
        <fog attach="fog" args={["#f0c6a0", 10, 60]} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[80, 80]} />
          <meshStandardMaterial color="#d8b98e" roughness={0.95} />
        </mesh>
        {ELENCO_BONECO.map((p, i) => (
          <Boneco key={p.nome} visual={p.visual} animacao={p.anim} t={s + i * 0.7} pos={[-1.5 + i * 1.0, 0, (i % 2) * -0.5]} giroY={(i - 1.5) * -0.18} altura={p.visual.corpo === "mulher" ? 1.66 : 1.76} falando={p.anim === "talking"} semente={i * 3} />
        ))}
        <Acabamento foco={close ? zoom : 8.6} desfoque={close ? 2.2 : 1.0} brilho={0.35} />
      </PalcoCinema>
      <div style={{ position: "absolute", top: 1700, left: 0, right: 0, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: 44, color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
        {close ? "Dandara" : ELENCO_BONECO.map((p) => p.nome).join(" · ")}
      </div>
    </AbsoluteFill>
  );
};

// Detalhe para conferir o corpo de perto (quadril/virilha): 4 ângulos, 1 quadro cada.
export const TesteBonecoDetalhe: React.FC = () => {
  const frame = useCurrentFrame();
  const angulos = [0, 0.6, -0.9, Math.PI];
  const a = angulos[frame % 4];
  const quem = Math.floor(frame / 4) % 4;
  const p = ELENCO_BONECO[quem];
  return (
    <AbsoluteFill style={{ background: "#f2c9a0" }}>
      <PalcoCinema ceu="entardecer">
        <Camera posicao={[Math.sin(a) * 1.5, 0.95, Math.cos(a) * 1.5]} alvo={[0, 0.85, 0]} fov={40} />
        <Sol pos={[-6, 5, 7]} cor="#ffd2a0" forca={3.2} />
        <hemisphereLight args={["#ffd9b8", "#9a7c62", 0.55]} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[80, 80]} />
          <meshStandardMaterial color="#d8b98e" roughness={0.95} />
        </mesh>
        <Boneco visual={p.visual} animacao={frame >= 16 ? "walking" : "idle"} t={0.4} altura={p.visual.corpo === "mulher" ? 1.66 : 1.76} />
        <Acabamento foco={1.5} desfoque={0.4} brilho={0.3} />
      </PalcoCinema>
    </AbsoluteFill>
  );
};
