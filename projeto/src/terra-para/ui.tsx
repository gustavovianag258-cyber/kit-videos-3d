import { interpolate } from "remotion";
import { HudAnel, SANS, SERIFA, TextoSerifa } from "../cinema/Textos";
import { clamp, hudLinha, hudRotulo, hudValor, LEGENDAS, T } from "./tempo";

// Pergunta "E se...?" — regra fixa: na tela desde o 1º segundo
export const Pergunta: React.FC<{ s: number }> = ({ s }) => (
  <TextoSerifa
    texto={`E se a Terra parasse de girar, *de repente*, na praia de *Copacabana*?`}
    s={s}
    de={0.05}
    ate={4.6}
    topo={410}
    tam={58}
    largura={820}
  />
);

export const Legendas: React.FC<{ s: number }> = ({ s }) => (
  <>
    {LEGENDAS.map((l) => (
      <TextoSerifa key={l.de} texto={l.texto} s={s} de={l.de} ate={l.ate} topo={1480} tam={46} largura={760} />
    ))}
  </>
);

export const Hud: React.FC<{ s: number }> = ({ s }) => (
  <HudAnel
    s={s}
    de={0.3}
    ate={T.cta + 1}
    rotulo={hudRotulo(s)}
    valor={hudValor(s)}
    linha={hudLinha(s)}
    progresso={s < T.parou ? 1 : Math.min(1, (s - T.parou) / 20)}
    alerta={s >= T.parou}
  />
);

export const CartazFinal: React.FC<{ s: number }> = ({ s }) => {
  if (s < T.cta) return null;
  const k = Math.min(1, Math.max(0, (s - T.cta) / 0.6));
  return (
    <div style={{ position: "absolute", inset: 0, background: `rgba(10,14,20,${0.55 * k})`, display: "flex", alignItems: "center", justifyContent: "center", opacity: k }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 24, letterSpacing: 5, color: "rgba(255,255,255,0.8)" }}>STATUS ATUAL</div>
        <div style={{ fontFamily: SERIFA, fontSize: 68, color: "#fff", margin: "10px 0", maxWidth: 820, textShadow: "0 4px 20px rgba(0,0,0,0.5)" }}>
          Qual vai ser o próximo <span style={{ fontStyle: "italic" }}>"E se"</span>?
        </div>
        <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 30, letterSpacing: 2, color: "#f5c518", marginTop: 18 }}>@mundoparalelo.br</div>
      </div>
    </div>
  );
};

// Flash branco rápido no instante exato em que o chão "para" (o gatilho)
export const FlashGatilho: React.FC<{ s: number }> = ({ s }) => {
  const op = interpolate(s, [T.parou - 0.03, T.parou + 0.02, T.parou + 0.22], [0, 0.85, 0], clamp);
  if (op <= 0) return null;
  return <div style={{ position: "absolute", inset: 0, background: "#fff", opacity: op, pointerEvents: "none" }} />;
};
