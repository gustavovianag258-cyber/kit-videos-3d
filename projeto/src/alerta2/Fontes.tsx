import { loadFont as dmSans } from "@remotion/google-fonts/DMSans";
import { loadFont as dmSerif } from "@remotion/google-fonts/DMSerifDisplay";
import { loadFont as jakarta } from "@remotion/google-fonts/PlusJakartaSans";
import { loadFont as manrope } from "@remotion/google-fonts/Manrope";
import { loadFont as playfair } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as poppins } from "@remotion/google-fonts/Poppins";
import { AbsoluteFill, Freeze, useCurrentFrame } from "remotion";
import { AlertaAnima } from "./Anima";

// Quatro opções de fonte (pedido do usuário: letras bonitas, sem contorno duro) sobre uma cena real.
// Quadro 0 = opção A, 1 = B, 2 = C, 3 = D. Fundo: quadro 1300 da prévia (Rafa na fresta), sem textos.
const P = { normal: poppins("normal", { weights: ["400", "600", "800"], subsets: ["latin", "latin-ext"] }).fontFamily, italico: poppins("italic", { weights: ["400"], subsets: ["latin", "latin-ext"] }).fontFamily };
const DS = dmSans("normal", { weights: ["500", "700"], subsets: ["latin", "latin-ext"] }).fontFamily;
const DSE = dmSerif("normal", { weights: ["400"], subsets: ["latin", "latin-ext"] }).fontFamily;
dmSerif("italic", { weights: ["400"], subsets: ["latin", "latin-ext"] });
const PJ = jakarta("normal", { weights: ["500", "700", "800"], subsets: ["latin", "latin-ext"] }).fontFamily;
jakarta("italic", { weights: ["500"], subsets: ["latin", "latin-ext"] });
const MR = manrope("normal", { weights: ["600", "700"], subsets: ["latin", "latin-ext"] }).fontFamily;
const PF = playfair("normal", { weights: ["700", "800"], subsets: ["latin", "latin-ext"] }).fontFamily;
playfair("italic", { weights: ["500"], subsets: ["latin", "latin-ext"] });

type Opcao = { nome: string; titulo: [string, number]; fala: [string, number]; narra: [string, number, boolean] };
const OPCOES: Opcao[] = [
  { nome: "A · Moderna (Poppins)", titulo: [P.normal, 800], fala: [P.normal, 600], narra: [P.normal, 400, true] },
  { nome: "B · Cinema (DM Serif + DM Sans)", titulo: [DSE, 400], fala: [DS, 700], narra: [DSE, 400, true] },
  { nome: "C · Premium (Plus Jakarta Sans)", titulo: [PJ, 800], fala: [PJ, 700], narra: [PJ, 500, true] },
  { nome: "D · Suspense clássico (Playfair + Manrope)", titulo: [PF, 800], fala: [MR, 700], narra: [PF, 500, true] },
];

// sombra suave, sem contorno duro
const SOMBRA = "0 2px 4px rgba(0,0,0,0.55), 0 6px 24px rgba(0,0,0,0.75)";

export const AlertaFontes: React.FC = () => {
  const f = useCurrentFrame();
  const o = OPCOES[Math.min(3, f)];
  const VERM = "#ff4a3d";
  return (
    <AbsoluteFill>
      <Freeze frame={1300}>
        <AlertaAnima semTexto />
      </Freeze>
      {/* tag da parte */}
      <div style={{ position: "absolute", top: 120, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div style={{ background: "rgba(150,16,22,0.92)", borderRadius: 999, padding: "12px 44px", fontFamily: o.titulo[0], fontWeight: o.titulo[1], fontSize: 46, letterSpacing: 6, color: "#fff", boxShadow: "0 8px 30px rgba(0,0,0,0.5)" }}>PARTE 01</div>
      </div>
      {/* pergunta */}
      <div style={{ position: "absolute", top: 300, left: 70, right: 70, textAlign: "center", fontFamily: o.titulo[0], fontWeight: o.titulo[1], fontSize: 74, lineHeight: 1.12, color: "#fff", textShadow: SOMBRA }}>
        E se todo celular do Brasil tocasse ao mesmo tempo com o alerta: <span style={{ color: VERM }}>fique onde está</span>?
      </div>
      {/* narração */}
      <div style={{ position: "absolute", top: 1010, left: 80, right: 80, textAlign: "center", fontFamily: o.narra[0], fontWeight: o.narra[1], fontStyle: o.narra[2] ? "italic" : "normal", fontSize: 52, lineHeight: 1.2, color: "#f1ece4", textShadow: SOMBRA }}>
        A mensagem veio do celular dele.
      </div>
      {/* fala */}
      <div style={{ position: "absolute", top: 1160, left: 80, right: 80, textAlign: "center", fontFamily: o.fala[0], fontWeight: o.fala[1], fontSize: 56, lineHeight: 1.2, color: "#ffd84d", textShadow: SOMBRA }}>
        Abre, Thaís. É bonito.
      </div>
      <div style={{ position: "absolute", top: 1260, left: 80, right: 80, textAlign: "center", fontFamily: o.fala[0], fontWeight: o.fala[1], fontSize: 56, lineHeight: 1.2, color: "#fff", textShadow: SOMBRA }}>
        Cê tá bem?
      </div>
      {/* rótulo da opção */}
      <div style={{ position: "absolute", bottom: 70, left: 0, right: 0, textAlign: "center", fontFamily: "sans-serif", fontWeight: 700, fontSize: 40, color: "#fff", background: "rgba(0,0,0,0.6)", padding: "18px 0" }}>OPÇÃO {o.nome}</div>
    </AbsoluteFill>
  );
};
