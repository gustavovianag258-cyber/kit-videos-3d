import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Camera } from "../v2/mundo";
import { PessoaMixamo, type Personagem } from "./Mixamo";

// candidatos ao estilo Culturaverso (desenho)
const ELENCO: Personagem[] = ["ch12", "ch21", "ch08", "remy", "ch07", "ch31", "ch06", "ch16"];
import { Acabamento, PalcoCinema, Sol } from "./Palco";
import { SANS } from "./Textos";

// Foto de elenco: os 9 personagens do Mixamo em três fileiras, cada um com uma animação,
// para conhecer o visual e escolher quem faz qual papel.

// um retrato por personagem: 20 quadros cada
export const DURACAO_ELENCO = 8 * 20;

export const TesteElenco: React.FC = () => {
  const frame = useCurrentFrame();
  const s = frame / 30;
  return (
    <AbsoluteFill style={{ background: "#9fd3ff" }}>
      <PalcoCinema ceu="praia-sol">
        <Camera posicao={[0.4, 1.5, 2.6]} alvo={[0, 1.2, 0]} fov={40} />
        <Sol pos={[8, 12, 10]} forca={3} />
        <hemisphereLight args={["#cfe8ff", "#d9c7a3", 0.5]} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[60, 60]} />
          <meshStandardMaterial color="#a89a82" roughness={0.9} />
        </mesh>
        <PessoaMixamo personagem={ELENCO[Math.min(7, Math.floor(frame / 20))]} animacao="waving" t={s} pos={[0, 0, 0]} altura={1.75} />
        <Acabamento foco={10} desfoque={1.5} brilho={0.4} />
      </PalcoCinema>
      <div style={{ position: "absolute", top: 1650, left: 0, right: 0, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: 54, color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>{ELENCO[Math.min(7, Math.floor(frame / 20))]}</div>
    </AbsoluteFill>
  );
};
