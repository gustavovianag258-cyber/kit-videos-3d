import { loadFont as carregarBarlow } from "@remotion/google-fonts/BarlowCondensed";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";

// Série AURORA: 2.5D chapado. Personagens vetoriais sem contorno, cenário em camadas com
// desfoque de fundo, luz entrando pela janela, poeira e granulado. Verde-aurora só com poder.
const barlow = carregarBarlow("normal", { weights: ["700", "800"], subsets: ["latin", "latin-ext"] });
export const FONTE = barlow.fontFamily;

export const COR = {
  aurora: "#3CF0A0",
  amarelo: "#FFC83D",
  vermelho: "#FF4B4B",
  creme: "#F4ECDD",
  tinta: "#2A2230",
  pele: "#C98B5E",
  peleSombra: "#B07549",
  cabelo: "#2B1E1A",
  pijama: "#4F7FB3",
  pijamaEscuro: "#3E6894",
};

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Trecho de legenda: palavras com destaque opcional (a = amarelo, v = vermelho, g = verde-aurora).
export type Palavra = { t: string; c?: "a" | "v" | "g" };
export type Legenda = { de: number; ate: number; palavras: Palavra[] };

const corDe = (c?: Palavra["c"]) => (c === "a" ? COR.amarelo : c === "v" ? COR.vermelho : c === "g" ? COR.aurora : "#fff");

const CONTORNO =
  "0 0 2px rgba(0,0,0,0.9), 0 2px 0 rgba(0,0,0,0.85), 2px 0 0 rgba(0,0,0,0.6), -2px 0 0 rgba(0,0,0,0.6), 0 6px 18px rgba(0,0,0,0.45)";

// Legenda curta no meio de baixo: entra com um soquinho de escala.
export const Legendas: React.FC<{ s: number; lista: Legenda[]; top?: number }> = ({ s, lista, top = 1180 }) => (
  <>
    {lista.map((l) => {
      if (s < l.de || s > l.ate) return null;
      const t = s - l.de;
      const escala = interpolate(t, [0, 0.08, 0.16], [0.82, 1.08, 1], clamp);
      return (
        <div
          key={l.de}
          style={{
            position: "absolute",
            top,
            left: 50,
            right: 50,
            textAlign: "center",
            fontFamily: FONTE,
            fontWeight: 800,
            fontSize: 78,
            letterSpacing: 1,
            textTransform: "uppercase",
            textShadow: CONTORNO,
            transform: `scale(${escala})`,
          }}
        >
          {l.palavras.map((p, i) => (
            <span key={i} style={{ color: corDe(p.c) }}>
              {p.t}
              {i < l.palavras.length - 1 ? " " : ""}
            </span>
          ))}
        </div>
      );
    })}
  </>
);

// Pergunta de abertura: palavras entrando uma a uma, no alto da tela.
export const Pergunta: React.FC<{ s: number; linhas: Palavra[][]; ate: number }> = ({ s, linhas, ate }) => {
  let n = 0;
  const sai = interpolate(s, [ate - 0.3, ate], [1, 0], clamp);
  return (
    <div style={{ position: "absolute", top: 250, left: 40, right: 40, textAlign: "center", opacity: sai }}>
      {linhas.map((linha, li) => (
        <div key={li} style={{ fontFamily: FONTE, fontWeight: 800, fontSize: li === 0 ? 74 : 92, lineHeight: 1.05, textTransform: "uppercase", textShadow: CONTORNO }}>
          {linha.map((p, i) => {
            const de = 0.1 + n++ * 0.16;
            const op = interpolate(s, [de, de + 0.12], [0, 1], clamp);
            const y = interpolate(s, [de, de + 0.18], [24, 0], clamp);
            return (
              <span key={i} style={{ color: corDe(p.c), opacity: op, display: "inline-block", transform: `translateY(${y}px)`, marginRight: 18 }}>
                {p.t}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// Cartão creme com etiqueta verde ("NOITE DA AURORA · 3:17").
export const Cartao: React.FC<{ s: number; de: number; ate: number; etiqueta: string; texto: string; top?: number }> = ({ s, de, ate, etiqueta, texto, top = 300 }) => {
  if (s < de || s > ate) return null;
  const op = interpolate(s, [de, de + 0.2, ate - 0.25, ate], [0, 1, 1, 0], clamp);
  const y = interpolate(s, [de, de + 0.25], [-30, 0], clamp);
  return (
    <div style={{ position: "absolute", top, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: op, transform: `translateY(${y}px)` }}>
      <div style={{ background: COR.creme, borderRadius: 18, padding: "34px 48px 26px", boxShadow: "0 14px 40px rgba(0,0,0,0.35)", textAlign: "center", position: "relative" }}>
        <div style={{ position: "absolute", top: -22, left: "50%", transform: "translateX(-50%)", background: COR.aurora, color: COR.tinta, fontFamily: FONTE, fontWeight: 800, fontSize: 30, padding: "4px 18px", borderRadius: 8, whiteSpace: "nowrap" }}>
          {etiqueta}
        </div>
        <div style={{ fontFamily: FONTE, fontWeight: 800, fontSize: 70, color: COR.tinta, letterSpacing: 1 }}>{texto}</div>
      </div>
    </div>
  );
};

// Plaquinha de personagem (nome em cima, descrição embaixo).
export const Placa: React.FC<{ s: number; de: number; ate: number; nome: string; desc: string; x: number; y: number }> = ({ s, de, ate, nome, desc, x, y }) => {
  if (s < de || s > ate) return null;
  const k = interpolate(s, [de, de + 0.12, de + 0.22], [0, 1.1, 1], clamp);
  const op = interpolate(s, [ate - 0.25, ate], [1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) scale(${k}) rotate(-3deg)`, opacity: op, textAlign: "center" }}>
      <div style={{ background: COR.vermelho, color: "#fff", fontFamily: FONTE, fontWeight: 800, fontSize: 30, padding: "2px 14px", borderRadius: "8px 8px 0 0", display: "inline-block" }}>{nome}</div>
      <div style={{ background: COR.creme, color: COR.tinta, fontFamily: FONTE, fontWeight: 800, fontSize: 56, padding: "6px 26px", borderRadius: 12, boxShadow: "0 10px 26px rgba(0,0,0,0.35)" }}>{desc}</div>
    </div>
  );
};

// Camada de cenário com desfoque por profundidade e deslocamento de parallax.
export const Camada: React.FC<{ blur?: number; dx?: number; dy?: number; escala?: number; children: React.ReactNode }> = ({ blur = 0, dx = 0, dy = 0, escala = 1, children }) => (
  <AbsoluteFill style={{ filter: blur ? `blur(${blur}px)` : undefined, transform: `translate(${dx}px, ${dy}px) scale(${escala})` }}>{children}</AbsoluteFill>
);

// Facho de luz entrando na diagonal (tela, sem pegar o resto).
export const Facho: React.FC<{ x: number; largura: number; angulo: number; forca?: number; cor?: string }> = ({ x, largura, angulo, forca = 0.35, cor = "255,236,190" }) => (
  <AbsoluteFill style={{ mixBlendMode: "screen", pointerEvents: "none" }}>
    <div
      style={{
        position: "absolute",
        left: x,
        top: -300,
        width: largura,
        height: 2800,
        transform: `rotate(${angulo}deg)`,
        transformOrigin: "top center",
        background: `linear-gradient(180deg, rgba(${cor},${forca}) 0%, rgba(${cor},${forca * 0.5}) 55%, rgba(${cor},0) 100%)`,
        filter: "blur(30px)",
      }}
    />
  </AbsoluteFill>
);

// Poeira flutuando no facho de luz.
export const Poeira: React.FC<{ n?: number; cor?: string; semente?: string }> = ({ n = 40, cor = "255,240,210", semente = "p" }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {new Array(n).fill(0).map((_, i) => {
        const x0 = random(`${semente}x${i}`) * 1080;
        const y0 = random(`${semente}y${i}`) * 1920;
        const v = 0.15 + random(`${semente}v${i}`) * 0.4;
        const r = 2 + random(`${semente}r${i}`) * 4;
        const x = x0 + Math.sin(f / 40 + i) * 18;
        const y = (y0 - f * v + 1920) % 1920;
        const op = 0.25 + 0.5 * Math.abs(Math.sin(f / 30 + i * 1.7));
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: r, height: r, borderRadius: r, background: `rgba(${cor},${op})`, filter: r > 4 ? "blur(1.5px)" : undefined }} />;
      })}
    </AbsoluteFill>
  );
};

// Granulado leve e vinheta, por cima de tudo.
export const Acabamento: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={1080} height={1920} style={{ position: "absolute", opacity: 0.09, mixBlendMode: "overlay" }}>
        <filter id="grao">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={f % 12} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grao)" />
      </svg>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.42) 100%)" }} />
    </AbsoluteFill>
  );
};

