import { loadFont } from "@remotion/google-fonts/Baloo2";
import { PALAVRAS, pop } from "./tempo";

// Texto de desenho animado: fonte arredondada bem grossa, amarela com contorno escuro (legenda),
// selos em pílula (escuro, vermelho ou verde) e ícones simples que surgem com "pop".
const baloo = loadFont("normal", { weights: ["700", "800"], subsets: ["latin", "latin-ext"] });
export const FONTE = baloo.fontFamily;

// Legenda: uma palavra por vez, no meio-baixo da tela
export const Legenda: React.FC<{ s: number }> = ({ s }) => {
  const i = PALAVRAS.findIndex((p, k) => s >= p.s - 0.03 && (k + 1 >= PALAVRAS.length || s < PALAVRAS[k + 1].s - 0.03) && s < p.e + 0.6);
  if (i < 0) return null;
  const p = PALAVRAS[i];
  const texto = p.w.replace(/[.,!?:…]+$/g, "").replace(/^\.+/, "");
  const k = pop(s, p.s - 0.03, 0.14);
  return (
    <div style={{ position: "absolute", top: 1240, left: 0, right: 0, textAlign: "center", pointerEvents: "none" }}>
      <span
        style={{
          display: "inline-block",
          fontFamily: FONTE,
          fontWeight: 800,
          fontSize: 92,
          color: "#ffd84a",
          WebkitTextStroke: "14px #3a2a12",
          paintOrder: "stroke fill",
          textShadow: "0 6px 0 rgba(58,42,18,0.55)",
          transform: `scale(${0.75 + 0.25 * k})`,
          letterSpacing: -0.5,
          textTransform: texto.length <= 4 && /\d/.test(texto) ? "none" : "capitalize",
        }}
      >
        {texto}
      </span>
    </div>
  );
};

const CORES = { escuro: "#1f2a44", vermelho: "#e8463f", verde: "#29b862" } as const;

// Selo em pílula ("135 x 90", "12 DIAS ATRÁS"...). y = topo em px; t = segundos da cena.
export const Selo: React.FC<{ t: number; de: number; ate?: number; texto: string; cor?: keyof typeof CORES; y?: number; sub?: string; tam?: number }> = ({
  t,
  de,
  ate = 999,
  texto,
  cor = "escuro",
  y = 300,
  sub,
  tam = 64,
}) => {
  if (t < de || t > ate) return null;
  const k = pop(t, de, 0.35);
  const sai = t > ate - 0.2 ? Math.max(0, (ate - t) / 0.2) : 1;
  return (
    <div style={{ position: "absolute", top: y, left: 0, right: 0, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div
        style={{
          transform: `scale(${k * sai})`,
          background: CORES[cor],
          color: "#fff",
          fontFamily: FONTE,
          fontWeight: 800,
          fontSize: tam,
          lineHeight: 1,
          padding: `${tam * 0.32}px ${tam * 0.6}px ${tam * 0.22}px`,
          borderRadius: 999,
          boxShadow: cor === "verde" ? "0 0 0 8px rgba(41,184,98,0.25), 0 10px 30px rgba(0,0,0,0.25)" : "0 10px 30px rgba(0,0,0,0.25)",
          border: "5px solid rgba(255,255,255,0.9)",
          textAlign: "center",
          maxWidth: 940,
        }}
      >
        {texto}
        {sub && <div style={{ fontSize: tam * 0.42, marginTop: 4, letterSpacing: 2 }}>{sub}</div>}
      </div>
    </div>
  );
};

export type TipoIcone = "aviso" | "certo" | "errado" | "proibido" | "gota" | "alarme";

const desenho = (tipo: TipoIcone) => {
  switch (tipo) {
    case "aviso":
      return (
        <>
          <path d="M50 8 L94 88 H6 Z" fill="#ffcf2e" stroke="#1d1d1d" strokeWidth="6" strokeLinejoin="round" />
          <rect x="45" y="34" width="10" height="30" rx="4" fill="#1d1d1d" />
          <circle cx="50" cy="74" r="6" fill="#1d1d1d" />
        </>
      );
    case "certo":
      return (
        <>
          <circle cx="50" cy="50" r="44" fill="#29b862" stroke="#fff" strokeWidth="6" />
          <path d="M28 52 L44 67 L73 35" fill="none" stroke="#fff" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
        </>
      );
    case "errado":
      return <path d="M22 22 L78 78 M78 22 L22 78" stroke="#e8463f" strokeWidth="16" strokeLinecap="round" />;
    case "proibido":
      return (
        <>
          <circle cx="50" cy="50" r="42" fill="#fff" stroke="#e8463f" strokeWidth="10" />
          <path d="M21 21 L79 79" stroke="#e8463f" strokeWidth="10" />
        </>
      );
    case "gota":
      return <path d="M50 8 C50 8 18 48 18 64 A32 32 0 0 0 82 64 C82 48 50 8 50 8 Z" fill="#4fb3ea" stroke="#fff" strokeWidth="5" />;
    case "alarme":
      return (
        <>
          <path d="M22 80 V52 A28 28 0 0 1 78 52 V80 Z" fill="#e8463f" stroke="#1d1d1d" strokeWidth="5" />
          <rect x="14" y="80" width="72" height="12" rx="4" fill="#1d1d1d" />
          <path d="M8 30 L20 38 M92 30 L80 38 M50 6 V18" stroke="#ffcf2e" strokeWidth="6" strokeLinecap="round" />
        </>
      );
  }
};

export const Icone: React.FC<{ t: number; de: number; ate?: number; tipo: TipoIcone; x: number; y: number; tam?: number; balanca?: boolean }> = ({ t, de, ate = 999, tipo, x, y, tam = 150, balanca = true }) => {
  if (t < de || t > ate) return null;
  const k = pop(t, de, 0.3);
  const flut = balanca ? Math.sin((t - de) * 3) * 8 : 0;
  return (
    <svg viewBox="0 0 100 100" width={tam} height={tam} style={{ position: "absolute", left: x - tam / 2, top: y - tam / 2 + flut, transform: `scale(${k})`, filter: "drop-shadow(0 8px 10px rgba(0,0,0,0.25))", overflow: "visible" }}>
      {desenho(tipo)}
    </svg>
  );
};

// Balão de fala com texto curto
export const Balao: React.FC<{ t: number; de: number; ate?: number; texto: string; x: number; y: number }> = ({ t, de, ate = 999, texto, x, y }) => {
  if (t < de || t > ate) return null;
  const k = pop(t, de, 0.3);
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-100%) scale(${k})`, transformOrigin: "30% 100%" }}>
      <div style={{ background: "#fff", borderRadius: 40, padding: "22px 38px", fontFamily: FONTE, fontWeight: 800, fontSize: 54, color: "#1f2a44", boxShadow: "0 10px 30px rgba(0,0,0,0.2)", whiteSpace: "nowrap" }}>{texto}</div>
      <div style={{ width: 0, height: 0, borderLeft: "22px solid transparent", borderRight: "22px solid transparent", borderTop: "34px solid #fff", marginLeft: 60 }} />
    </div>
  );
};
