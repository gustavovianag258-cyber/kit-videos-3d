import { loadFont } from "@remotion/google-fonts/Montserrat";
import { AbsoluteFill, Composition, interpolate, registerRoot, useCurrentFrame } from "remotion";
import { Acabamento, PalcoCinema } from "../cinema/Palco";
import { Camera, Estudio } from "./Estudio";
import { Mascote3D, PoseMascote } from "./Mascote3D";

// Cartazes da página Fase Extra: abertura (número da fase) e final (siga + pergunta). Teste de nome e identidade.
const { fontFamily } = loadFont("normal", { weights: ["800", "900"], subsets: ["latin"] });
const ARROBA = "@faseextra.br"; // PROVISÓRIO: confirmar se está livre no Instagram e no TikTok

const Titulo: React.FC<{ topo?: string; grande: string; sub?: string; tam?: number }> = ({ topo, grande, sub, tam = 158 }) => (
  <div style={{ fontFamily, textAlign: "center", color: "#fff", textShadow: "0 0 28px #B66BFF, 0 6px 0 #2B0F66, 0 0 6px rgba(0,0,0,.6)" }}>
    {topo && <div style={{ fontSize: 44, fontWeight: 800, letterSpacing: 14, color: "#E6D2FF" }}>{topo}</div>}
    <div style={{ fontSize: tam, fontWeight: 900, lineHeight: 0.92, letterSpacing: -2 }}>{grande}</div>
    {sub && <div style={{ fontSize: 46, fontWeight: 800, letterSpacing: 8, color: "#E6D2FF", marginTop: 18 }}>{sub}</div>}
  </div>
);

const Cena: React.FC<{ pose: PoseMascote; boca: number; cam: [number, number, number]; alvo: [number, number, number]; children: React.ReactNode }> = ({ pose, boca, cam, alvo, children }) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  return (
    <AbsoluteFill>
      <PalcoCinema ceu="estudio" fundo="#120B22" fov={28} luzCeu={0.3} brilhoCeu={0.05}>
        <Camera pos={cam} alvo={alvo} />
        <Estudio />
        <Mascote3D giro={0.12} pose={pose} boca={boca} pisca={t > 1.6 && t < 1.72} />
        <Acabamento foco={Math.hypot(cam[0], cam[1] - 1.5, cam[2])} desfoque={5} brilho={0.7} saturacao={0.1} contraste={0.1} vinheta={0.5} ao={0} />
      </PalcoCinema>
      {children}
    </AbsoluteFill>
  );
};

const Abertura: React.FC = () => {
  const t = useCurrentFrame() / 30;
  const entra = interpolate(t, [0, 0.4], [0, 1], { extrapolateRight: "clamp" });
  const gesto = interpolate(t, [0.2, 0.7], [0, 1], { extrapolateRight: "clamp" });
  const pose: PoseMascote = { bracoD: [0.02 - gesto * 0.55, 0, 0.1 + gesto * 0.45], cotoveloD: 0.15 + gesto * 0.9, cabeca: [0.02, 0.1, 0.03] };
  return (
    <Cena pose={pose} boca={0.5} cam={[0.35, 1.3, 5.2]} alvo={[0, 0.96, 0]}>
      <div style={{ position: "absolute", top: 150, left: 0, right: 0, opacity: entra, transform: `scale(${0.9 + entra * 0.1})` }}>
        <Titulo topo="FASE" grande="EXTRA" sub="COM VYCE" />
      </div>
      <div style={{ position: "absolute", bottom: 130, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div style={{ fontFamily, fontWeight: 900, fontSize: 58, color: "#fff", letterSpacing: 6, padding: "10px 46px", border: "4px solid #B66BFF", borderRadius: 60, textShadow: "0 0 16px #B66BFF", boxShadow: "0 0 30px #B66BFF88, inset 0 0 20px #B66BFF55" }}>FASE 01</div>
      </div>
    </Cena>
  );
};

const Final: React.FC = () => {
  const t = useCurrentFrame() / 30;
  const entra = interpolate(t, [0, 0.4], [0, 1], { extrapolateRight: "clamp" });
  const pose: PoseMascote = { bracoD: [-0.9, 0, 0.5], cotoveloD: 1.5, cabeca: [0.02, 0.08, 0.02] };
  return (
    <Cena pose={pose} boca={0.4} cam={[0.35, 1.3, 5.2]} alvo={[0, 0.96, 0]}>
      <div style={{ position: "absolute", top: 140, left: 0, right: 0, opacity: entra }}>
        <Titulo topo="SIGA A" grande="FASE EXTRA" tam={132} />
        <div style={{ fontFamily, fontWeight: 800, fontSize: 60, color: "#fff", textAlign: "center", marginTop: 26, textShadow: "0 0 18px #B66BFF, 0 3px 0 #2B0F66" }}>{ARROBA}</div>
      </div>
      <div style={{ position: "absolute", bottom: 90, left: 40, right: 40, fontFamily, fontWeight: 800, fontSize: 48, lineHeight: 1.2, color: "#fff", textAlign: "center", textShadow: "0 0 14px #000, 0 3px 6px rgba(0,0,0,.8)" }}>
        Comenta qual vai ser a próxima fase.
      </div>
    </Cena>
  );
};

const Raiz: React.FC = () => (
  <>
    <Composition id="FaseExtraAbertura" component={Abertura} durationInFrames={90} fps={30} width={1080} height={1920} />
    <Composition id="FaseExtraFinal" component={Final} durationInFrames={90} fps={30} width={1080} height={1920} />
  </>
);
registerRoot(Raiz);
