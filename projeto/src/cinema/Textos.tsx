import { loadFont as carregarInter } from "@remotion/google-fonts/Inter";
import { loadFont as carregarSerifa } from "@remotion/google-fonts/SourceSerif4";
import { interpolate, spring } from "remotion";

// Textos do padrão novo (skill visual-cinematico): serifa branca com a palavra-chave em itálico,
// sombra suave; HUD minimalista sem caixa (anel fino, rótulo espaçado, número fino, lugar/hora).

const serifa = carregarSerifa("normal", { weights: ["400", "600"], subsets: ["latin", "latin-ext"] });
carregarSerifa("italic", { weights: ["400", "600"], subsets: ["latin", "latin-ext"] });
export const SERIFA = serifa.fontFamily;
export const SANS = carregarInter("normal", { weights: ["300", "500", "600"], subsets: ["latin", "latin-ext"] }).fontFamily;

const SOMBRA = "0 2px 6px rgba(0,0,0,0.45), 0 8px 30px rgba(0,0,0,0.35)";
const FPS = 30;
const k = (x: number) => Math.max(0, Math.min(1, x));
const mola = (s: number, ini: number) => spring({ frame: Math.round((s - ini) * FPS), fps: FPS, config: { damping: 200, stiffness: 120 } });

// "palavra *itálico* palavra" → trechos; o que está entre * sai em itálico
const trechos = (texto: string) =>
  texto.split("*").map((p, i) => ({ p, italico: i % 2 === 1 }));

// Texto em serifa que entra suave (sobe 18 px e aparece), palavra-chave em itálico
export const TextoSerifa: React.FC<{
  texto: string;
  s: number;
  de: number;
  ate: number;
  topo: number;
  tam?: number;
  largura?: number;
}> = ({ texto, s, de, ate, topo, tam = 64, largura = 860 }) => {
  if (s < de - 0.05 || s > ate + 0.3) return null;
  const entra = mola(s, de);
  const sai = 1 - k((s - ate) / 0.3);
  return (
    <div style={{ position: "absolute", top: topo, left: 0, right: 0, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div
        style={{
          maxWidth: largura,
          textAlign: "center",
          fontFamily: SERIFA,
          fontWeight: 400,
          fontSize: tam,
          lineHeight: 1.18,
          color: "#ffffff",
          textShadow: SOMBRA,
          opacity: entra * sai,
          transform: `translateY(${(1 - entra) * 18}px)`,
        }}
      >
        {trechos(texto).map((t, i) => (
          <span key={i} style={{ fontStyle: t.italico ? "italic" : "normal", fontWeight: t.italico ? 600 : 400 }}>
            {t.p}
          </span>
        ))}
      </div>
    </div>
  );
};

// HUD sem caixa: anel fino de progresso, rótulo espaçado, número grande e fino, linha de lugar/hora
export const HudAnel: React.FC<{
  s: number;
  de: number;
  ate: number;
  rotulo: string;
  valor: string;
  linha?: string;
  progresso?: number; // 0 a 1 (quanto do anel está cheio)
  topo?: number;
  alerta?: boolean;
}> = ({ s, de, ate, rotulo, valor, linha, progresso = 0.25, topo = 760, alerta = false }) => {
  if (s < de || s > ate + 0.3) return null;
  const entra = mola(s, de);
  const sai = 1 - k((s - ate) / 0.3);
  const cor = alerta ? "#ff8a7a" : "#ffffff";
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ position: "absolute", top: topo, left: 56, opacity: entra * sai, transform: `translateX(${(1 - entra) * -20}px)`, pointerEvents: "none" }}>
      <svg width={84} height={84} style={{ display: "block", marginBottom: 14, filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.4))" }}>
        <circle cx={42} cy={42} r={r} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={2.5} />
        <circle
          cx={42}
          cy={42}
          r={r}
          fill="none"
          stroke={cor}
          strokeWidth={3.5}
          strokeLinecap="round"
          strokeDasharray={`${c * k(progresso)} ${c}`}
          transform="rotate(-90 42 42)"
        />
      </svg>
      <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 24, letterSpacing: 5, color: "rgba(255,255,255,0.9)", textShadow: SOMBRA }}>{rotulo}</div>
      <div style={{ fontFamily: SERIFA, fontWeight: 400, fontSize: 96, lineHeight: 1.05, color: cor, textShadow: SOMBRA, fontVariantNumeric: "tabular-nums" }}>{valor}</div>
      {linha && <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 22, letterSpacing: 3, color: "rgba(255,255,255,0.75)", textShadow: SOMBRA, marginTop: 6 }}>{linha}</div>}
    </div>
  );
};

// Nome do personagem com letras espaçadas e um fio fino embaixo ("Í C A R O")
export const NomeEspacado: React.FC<{ s: number; de: number; ate: number; nome: string; linha?: string; topo?: number }> = ({
  s,
  de,
  ate,
  nome,
  linha,
  topo = 300,
}) => {
  if (s < de || s > ate + 0.4) return null;
  const entra = mola(s, de);
  const sai = 1 - k((s - ate) / 0.4);
  const abre = interpolate(entra, [0, 1], [4, 22]);
  return (
    <div style={{ position: "absolute", top: topo, left: 0, right: 0, textAlign: "center", opacity: entra * sai, pointerEvents: "none" }}>
      <div style={{ fontFamily: SERIFA, fontSize: 92, letterSpacing: abre, color: "#fff", textShadow: SOMBRA, paddingLeft: abre }}>{nome.toUpperCase()}</div>
      <div style={{ width: 220 * entra, height: 2, background: "rgba(255,255,255,0.85)", margin: "10px auto 14px" }} />
      {linha && <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 24, letterSpacing: 4, color: "rgba(255,255,255,0.85)", textShadow: SOMBRA }}>{linha}</div>}
    </div>
  );
};
