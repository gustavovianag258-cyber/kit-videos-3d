import { loadFont } from "@remotion/google-fonts/Montserrat";
import { AbsoluteFill, Composition, Img, registerRoot, staticFile } from "remotion";

// Amostra de como o Vyce novo (2.5D, camiseta roxa de flores) aparece na Fase 18 no formato novo:
// a = abertura · b = no canto, sobre o mapa (regra 3) · c = final com enquete.
const { fontFamily } = loadFont("normal", { weights: ["600", "800", "900"], subsets: ["latin"] });
const sombra = "0 4px 20px rgba(0,0,0,.6)";
const Rotulo: React.FC<{ cor: string; children: React.ReactNode }> = ({ cor, children }) => <div style={{ fontWeight: 800, fontSize: 30, letterSpacing: 7, color: cor, textShadow: sombra }}>{children}</div>;
const Titulo: React.FC<{ tam?: number; children: React.ReactNode }> = ({ tam = 96, children }) => <div style={{ fontWeight: 900, fontSize: tam, lineHeight: 0.98, color: "#fff", textShadow: sombra }}>{children}</div>;

const Fundo: React.FC<{ desfoque?: number }> = ({ desfoque = 4 }) => <Img src={staticFile("vyce/fundo.jpg")} style={{ position: "absolute", height: 2000, width: 3556, left: -760, top: -40, filter: `blur(${desfoque}px) brightness(.8)` }} />;
const Vyce: React.FC<{ w: number; left: number; bottom: number }> = ({ w, left, bottom }) => <Img src={staticFile("vyce/vyce.png")} style={{ position: "absolute", width: w, left, bottom, filter: "drop-shadow(0 0 26px rgba(214,120,255,.55))" }} />;

// mapa 2D simplificado de Leonida (só para a amostra)
const Mapa: React.FC = () => (
  <AbsoluteFill style={{ background: "#2F5FA0" }}>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920">
      <defs>
        <filter id="b"><feGaussianBlur stdDeviation="14" /></filter>
      </defs>
      <path d="M380 260 C560 200 760 260 800 420 C860 640 820 900 760 1100 C720 1260 640 1420 560 1520 C500 1590 420 1560 400 1480 C360 1300 300 1120 290 940 C280 700 260 420 380 260 Z" fill="#7FE8E0" filter="url(#b)" opacity=".7" />
      <path d="M380 260 C560 200 760 260 800 420 C860 640 820 900 760 1100 C720 1260 640 1420 560 1520 C500 1590 420 1560 400 1480 C360 1300 300 1120 290 940 C280 700 260 420 380 260 Z" fill="#B9DB72" />
      <path d="M650 700 C760 760 790 980 720 1180 C690 1260 640 1250 640 1150 C630 980 600 820 650 700 Z" fill="#D9D6E0" />
      <path d="M340 600 C480 700 560 900 600 1200 M420 300 C520 600 700 800 760 1000" stroke="#5C6B7A" strokeWidth="5" fill="none" opacity=".6" />
      <circle cx="690" cy="980" r="150" fill="rgba(255,60,90,.25)" stroke="#FF4D6A" strokeWidth="8" />
      <circle cx="690" cy="980" r="210" fill="none" stroke="#FF4D6A" strokeWidth="4" opacity=".4" />
    </svg>
  </AbsoluteFill>
);

const Amostra: React.FC<{ modelo: "a" | "b" | "c" }> = ({ modelo }) => (
  <AbsoluteFill style={{ background: "#1A0B2E", fontFamily, overflow: "hidden" }}>
    {modelo === "a" && (
      <>
        <Fundo />
        <Vyce w={1500} left={-150} bottom={-170} />
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(26,11,46,.65) 0%, rgba(26,11,46,0) 30%)" }} />
        <div style={{ position: "absolute", left: 70, top: 170 }}>
          <Rotulo cor="#E2C4FF">GUIA ANTES DE JOGAR</Rotulo>
          <Titulo>SER PRESO</Titulo>
          <Titulo>NO GTA 6</Titulo>
        </div>
      </>
    )}
    {modelo === "b" && (
      <>
        <Mapa />
        <div style={{ position: "absolute", left: 70, top: 170 }}>
          <Rotulo cor="#FF6B85">REGRA 3</Rotulo>
          <Titulo tam={84}>O MAPA LEMBRA</Titulo>
          <div style={{ marginTop: 14, display: "inline-block", fontWeight: 800, fontSize: 26, letterSpacing: 4, color: "#111", background: "#FFD84A", borderRadius: 8, padding: "4px 14px" }}>PRÉVIA</div>
        </div>
        <div style={{ position: "absolute", left: 590, top: 1170, fontWeight: 900, fontSize: 40, color: "#fff", textShadow: sombra }}>ZONA QUENTE</div>
        {/* Vyce no canto, em janela redonda */}
        <div style={{ position: "absolute", right: 50, bottom: 260, width: 360, height: 360, borderRadius: "50%", overflow: "hidden", border: "6px solid #B66BFF", boxShadow: "0 0 30px #B66BFF", background: "#2B0F55" }}>
          <Img src={staticFile("vyce/fundo.jpg")} style={{ position: "absolute", height: 400, width: 711, left: -150, top: 0, filter: "blur(3px) brightness(.8)" }} />
          <Img src={staticFile("vyce/vyce.png")} style={{ position: "absolute", width: 620, left: -150, top: -10 }} />
        </div>
      </>
    )}
    {modelo === "c" && (
      <>
        <Fundo desfoque={6} />
        <Vyce w={1500} left={-150} bottom={-260} />
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(26,11,46,.8) 0%, rgba(26,11,46,.2) 34%, rgba(26,11,46,0) 50%)" }} />
        <div style={{ position: "absolute", left: 70, right: 70, top: 150 }}>
          <Rotulo cor="#E2C4FF">E VOCÊ?</Rotulo>
          <Titulo tam={70}>NO GTA 6, VOCÊ…</Titulo>
          {[
            ["1", "🏦 DEPOSITO TUDO", "#4ADE80"],
            ["2", "💵 ANDO COM TUDO NO BOLSO", "#FFD84A"],
          ].map(([n, t, c]) => (
            <div key={n} style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 16, fontWeight: 900, fontSize: 40, color: "#fff", background: "rgba(20,10,40,.75)", borderLeft: `8px solid ${c}`, borderRadius: 12, padding: "10px 20px", width: "fit-content" }}>
              <span style={{ color: c }}>{n}</span>
              {t}
            </div>
          ))}
        </div>
        <div style={{ position: "absolute", left: 70, bottom: 120, fontWeight: 900, fontSize: 52, color: "#fff", textShadow: sombra }}>@faseextra.br</div>
      </>
    )}
  </AbsoluteFill>
);

registerRoot(() => (
  <>
    {(["a", "b", "c"] as const).map((m) => (
      <Composition key={m} id={`Amostra${m.toUpperCase()}`} component={Amostra} defaultProps={{ modelo: m }} durationInFrames={1} fps={30} width={1080} height={1920} />
    ))}
  </>
));
