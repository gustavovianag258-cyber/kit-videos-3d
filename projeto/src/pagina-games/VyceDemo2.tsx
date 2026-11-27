import { loadFont } from "@remotion/google-fonts/Montserrat";
import { AbsoluteFill, Composition, Easing, Img, interpolate, random, registerRoot, staticFile, useCurrentFrame } from "remotion";

// Demonstração do Vyce novo, idealização 2 (terno preto, estilo arte de GTA), em 2.5D: captura oficial de Vice City ao fundo,
// o Vyce recortado numa camada própria e câmera se movendo em perspectiva (parallax), com respiração,
// brilho de contraluz e partículas na frente. Sem o logo do GTA.
const { fontFamily } = loadFont("normal", { weights: ["700", "900"], subsets: ["latin"] });
const DUR = 7 * 30;
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const VyceDemo: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const k = interpolate(f, [0, DUR], [0, 1], { ...cl, easing: Easing.inOut(Easing.sin) });
  const entra = interpolate(t, [0, 0.9], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) });
  const resp = Math.sin(t * 2.2);
  const titulo = interpolate(t, [1.2, 1.8], [0, 1], { ...cl, easing: Easing.out(Easing.back(1.6)) });
  return (
    <AbsoluteFill style={{ background: "#1A0B2E", overflow: "hidden" }}>
      {/* fundo: mais longe, anda pouco e fica desfocado */}
      <Img
        src={staticFile("vyce/fundo.jpg")}
        style={{ position: "absolute", height: 1920, width: 3413, left: -2133 + interpolate(k, [0, 1], [70, -70]), top: 0, filter: "blur(3px) saturate(1.1) brightness(.9)", transform: `scale(${1.08 - 0.04 * k})` }}
      />
      {/* névoa roxa entre o fundo e o personagem */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 70%, rgba(182,107,255,.0) 30%, rgba(26,11,46,.55) 100%)" }} />
      {/* o Vyce: camada da frente, gira um pouco em perspectiva e respira */}
      <AbsoluteFill style={{ perspective: 1600 }}>
        <Img
          src={staticFile("vyce/vyce.png")}
          style={{
            position: "absolute",
            height: 1650,
            left: -260 + interpolate(k, [0, 1], [-40, 40]),
            bottom: -40 - 120 * (1 - entra),
            opacity: entra,
            transformOrigin: "50% 100%",
            transform: `rotateY(${interpolate(k, [0, 1], [7, -7])}deg) scale(${(1.0 + 0.05 * k) * (1 + 0.004 * resp)}, ${(1.0 + 0.05 * k) * (1 + 0.007 * resp)})`,
            filter: "drop-shadow(0 0 26px rgba(214,120,255,.55)) drop-shadow(-14px 0 18px rgba(255,120,190,.35)) contrast(1.04)",
          }}
        />
      </AbsoluteFill>
      {/* partículas e reflexo de luz na frente (andam mais rápido = profundidade) */}
      {new Array(26).fill(0).map((_, i) => {
        const r = (q: string) => random(`p${i}${q}`);
        const x = r("x") * 1080 + interpolate(k, [0, 1], [160, -160]) * (0.6 + r("z"));
        const y = (r("y") * 1920 - t * (20 + r("v") * 40)) % 1920;
        const s = 3 + r("s") * 9;
        return <div key={i} style={{ position: "absolute", left: x, top: y < 0 ? y + 1920 : y, width: s, height: s, borderRadius: "50%", background: i % 3 ? "#FFD6F5" : "#C9A2FF", boxShadow: `0 0 ${s * 2}px ${i % 3 ? "#FF7FD0" : "#B66BFF"}`, opacity: 0.35 + r("o") * 0.5, filter: s > 9 ? "blur(2px)" : undefined }} />;
      })}
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${70 - 20 * k}% 22%, rgba(255,170,120,.28), rgba(0,0,0,0) 40%)`, mixBlendMode: "screen" }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(26,11,46,.55) 0%, rgba(26,11,46,0) 22%, rgba(26,11,46,0) 70%, rgba(26,11,46,.7) 100%)" }} />
      {/* apresentação */}
      <div style={{ position: "absolute", left: 70, top: 170, fontFamily, color: "#fff", opacity: titulo, transform: `translateX(${(1 - titulo) * -60}px)`, textShadow: "0 6px 24px rgba(0,0,0,.6)" }}>
        <div style={{ fontWeight: 700, fontSize: 34, letterSpacing: 8, color: "#E2C4FF" }}>SEU GUIA EM LEONIDA</div>
        <div style={{ fontWeight: 900, fontSize: 64, letterSpacing: 2, marginTop: 6 }}>@faseextra.br</div>
      </div>
    </AbsoluteFill>
  );
};

registerRoot(() => <Composition id="VyceDemo" component={VyceDemo} durationInFrames={DUR} fps={30} width={1080} height={1920} />);
