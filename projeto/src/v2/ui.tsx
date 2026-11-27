import { AbsoluteFill, interpolate, spring, useVideoConfig } from "remotion";
import { LEGENDAS } from "../legendas";
import { CORRECOES, FILTRO_COR, RECAPITULACAO, SELOS, TEXTO_FINAL } from "./correcoes";
import { clamp, FPS } from "./tempo";

// Elementos de tela (2D) que ficam por cima das cenas 3D.
// Área segura: nada importante nas bordas; legendas acima dos botões do TikTok/Reels.

const FONTE = "Arial Black, Arial, sans-serif";

export const Vinheta: React.FC<{ forca?: number }> = ({ forca = 0.55 }) => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background: `radial-gradient(ellipse 75% 60% at 50% 48%, rgba(0,0,0,0) 55%, rgba(0,0,0,${forca}) 100%)`,
    }}
  />
);

// Filtro que deixa as cores mais vivas e os detalhes mais nítidos (valores em correcoes.ts)
export const FiltroCor: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { saturacao, contraste, brilho, nitidez: k } = FILTRO_COR;
  // Nitidez: matriz que soma o pixel e subtrai um pouco dos vizinhos (realce de bordas)
  const matriz = `0 ${-k} 0 ${-k} ${1 + 4 * k} ${-k} 0 ${-k} 0`;
  return (
    <AbsoluteFill
      style={{
        filter: `${k > 0 ? "url(#nitidez) " : ""}saturate(${saturacao}) contrast(${contraste}) brightness(${brilho})`,
      }}
    >
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id="nitidez" colorInterpolationFilters="sRGB">
          <feConvolveMatrix order={3} kernelMatrix={matriz} preserveAlpha />
        </filter>
      </svg>
      {children}
    </AbsoluteFill>
  );
};

export const Legendas: React.FC<{ segundos: number }> = ({ segundos }) => {
  const { fps } = useVideoConfig();
  // A frase final aparece grande no lugar da legenda comum
  if (segundos >= TEXTO_FINAL.inicio && segundos < 54.8) return null;
  const bloco = LEGENDAS.find((b) => segundos >= b.inicio && segundos < b.fim);
  if (!bloco) return null;
  const entrada = spring({
    frame: Math.round((segundos - bloco.inicio) * fps),
    fps,
    config: { damping: 16, stiffness: 220 },
  });
  return (
    <div
      style={{
        position: "absolute",
        top: 1250,
        left: 70,
        right: 110,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "0 30px",
        opacity: entrada,
        transform: `translateY(${(1 - entrada) * 20}px)`,
      }}
    >
      {bloco.palavras.map((p, i) => {
        const proxima = bloco.palavras[i + 1]?.inicio ?? bloco.fim;
        const ativa = segundos >= p.inicio && segundos < proxima;
        // A palavra falada dá um "pulinho" ao acender
        const pulo = ativa ? 1.03 + 0.07 * Math.exp(-(segundos - p.inicio) * 10) : 1;
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              transform: `scale(${pulo}) translateY(${ativa ? -4 : 0}px)`,
              fontFamily: FONTE,
              fontWeight: 900,
              fontSize: 70,
              lineHeight: 1.12,
              textTransform: "uppercase",
              color: ativa ? "#ffd60a" : "#ffffff",
              WebkitTextStroke: "12px #000000",
              paintOrder: "stroke fill",
              textShadow: "0 6px 22px rgba(0,0,0,0.65)",
            }}
          >
            {p.texto}
          </span>
        );
      })}
    </div>
  );
};

// X vermelho grande com a frase de correção
export const XVermelho: React.FC<{ segundos: number }> = ({ segundos }) => {
  const c = CORRECOES.find((x) => segundos >= x.inicio && segundos < x.fim);
  if (!c) return null;
  const f = (segundos - c.inicio) * FPS;
  const total = (c.fim - c.inicio) * FPS;
  const rapido = c.estilo === "rapido";
  const traco1 = interpolate(f, [0, rapido ? 4 : 6], [1, 0], clamp);
  const traco2 = interpolate(f, [rapido ? 2 : 4, rapido ? 6 : 10], [1, 0], clamp);
  const pulo = spring({ frame: f, fps: FPS, config: { damping: 9, stiffness: 260 } });
  const texto = spring({ frame: f - (rapido ? 4 : 8), fps: FPS, config: { damping: 14, stiffness: 200 } });
  const saida = interpolate(f, [total - 6, total], [1, 0], clamp);

  return (
    <AbsoluteFill style={{ alignItems: "center", opacity: saida, pointerEvents: "none" }}>
      <svg
        width={520}
        height={520}
        viewBox="0 0 100 100"
        style={{
          position: "absolute",
          top: 330,
          transform: `scale(${0.6 + 0.4 * pulo})`,
          filter: "drop-shadow(0 0 18px rgba(255,30,30,0.85)) drop-shadow(0 8px 20px rgba(0,0,0,0.6))",
        }}
      >
        {[
          { d: "M18 18 L82 82", t: traco1 },
          { d: "M82 18 L18 82", t: traco2 },
        ].map((l, i) => (
          <path
            key={i}
            d={l.d}
            stroke="#ff1f1f"
            strokeWidth={13}
            strokeLinecap="round"
            fill="none"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={l.t}
          />
        ))}
      </svg>
      <div
        style={{
          position: "absolute",
          top: 870,
          left: 80,
          right: 80,
          padding: "26px 34px",
          borderRadius: 26,
          background: "#d90f0f",
          boxShadow: "0 14px 40px rgba(0,0,0,0.55)",
          textAlign: "center",
          fontFamily: FONTE,
          fontWeight: 900,
          fontSize: 62,
          lineHeight: 1.08,
          color: "#ffffff",
          opacity: texto,
          transform: `scale(${0.85 + 0.15 * texto})`,
        }}
      >
        {c.texto}
      </div>
    </AbsoluteFill>
  );
};

export const Selos: React.FC<{ segundos: number }> = ({ segundos }) => {
  const s = SELOS.find((x) => segundos >= x.inicio && segundos < x.fim);
  if (!s) return null;
  const o = interpolate(segundos, [s.inicio, s.inicio + 0.25, s.fim - 0.25, s.fim], [0, 1, 1, 0], clamp);
  return (
    <div
      style={{
        position: "absolute",
        top: 150,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        opacity: o,
      }}
    >
      <div
        style={{
          padding: "12px 26px",
          borderRadius: 14,
          border: "3px solid rgba(255,214,10,0.9)",
          background: "rgba(0,0,0,0.55)",
          color: "#ffd60a",
          fontFamily: "Arial, sans-serif",
          fontWeight: 800,
          fontSize: 34,
          letterSpacing: 3,
        }}
      >
        {s.texto}
      </div>
    </div>
  );
};

export const TextoFinal: React.FC<{ segundos: number }> = ({ segundos }) => {
  if (segundos < TEXTO_FINAL.inicio) return null;
  const f = (segundos - TEXTO_FINAL.inicio) * FPS;
  const entrada = spring({ frame: f, fps: FPS, config: { damping: 18, stiffness: 120 } });
  // Depois que a frase é dita, sobe e diminui para dar lugar à pergunta final
  const recolher = interpolate(segundos, [54.5, 55.2], [0, 1], { ...clamp });
  return (
    <div
      style={{
        position: "absolute",
        top: interpolate(recolher, [0, 1], [1180, 230]),
        left: 60,
        right: 60,
        textAlign: "center",
        fontFamily: FONTE,
        fontWeight: 900,
        fontSize: interpolate(recolher, [0, 1], [66, 52]),
        lineHeight: 1.1,
        color: "#ffffff",
        WebkitTextStroke: "10px #000000",
        paintOrder: "stroke fill",
        textShadow: "0 0 40px rgba(120,180,255,0.45), 0 8px 24px rgba(0,0,0,0.7)",
        opacity: entrada,
        transform: `translateY(${(1 - entrada) * 30}px)`,
      }}
    >
      {TEXTO_FINAL.texto}
    </div>
  );
};

export const Recapitulacao: React.FC<{ segundos: number }> = ({ segundos }) => (
  <div
    style={{
      position: "absolute",
      top: 520,
      left: 0,
      right: 0,
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: "16px 18px",
      padding: "0 110px",
    }}
  >
    {RECAPITULACAO.map((r) => {
      const f = (segundos - r.inicio) * FPS;
      if (f < 0) return null;
      const e = spring({ frame: f, fps: FPS, config: { damping: 12, stiffness: 200 } });
      const sumir = interpolate(segundos, [57.6, 58.2], [1, 0], clamp);
      return (
        <div
          key={r.texto}
          style={{
            padding: "10px 22px",
            borderRadius: 40,
            background: "rgba(20,40,80,0.7)",
            border: "2px solid rgba(140,200,255,0.9)",
            color: "#dff1ff",
            fontFamily: "Arial, sans-serif",
            fontWeight: 800,
            fontSize: 34,
            letterSpacing: 2,
            opacity: e * sumir,
            transform: `scale(${0.7 + 0.3 * e})`,
          }}
        >
          {r.texto}
        </div>
      );
    })}
  </div>
);
