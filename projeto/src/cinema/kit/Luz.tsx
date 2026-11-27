import { Acabamento, Ceu, PalcoCinema, Sol } from "../Palco";

// Horas do dia prontas (skill visual-cinematico: "toda cena tem hora"). Cada uma escolhe o céu HDRI,
// a direção/cor do sol, a luz que vem do céu e do chão, a névoa e o acabamento de cor.
export type Hora = "manha" | "dia" | "tarde" | "entardecer" | "noite" | "fogo" | "interior";

type Preset = {
  ceu: Ceu | null;
  fundo: string;
  sol: [number, number, number];
  corSol: string;
  forca: number;
  ceuChao: [string, string, number];
  nevoa: [string, number, number];
  luzCeu: number;
  brilhoCeu: number;
  saturacao: number;
  contraste: number;
  brilho: number;
  desfoqueCeu?: number;
};

export const HORAS: Record<Hora, Preset> = {
  manha: { ceu: "manha", fundo: "#f3d9c4", sol: [35, 12, 30], corSol: "#ffd7ae", forca: 2.6, ceuChao: ["#d6e4ff", "#b39b7d", 0.55], nevoa: ["#ead8c6", 60, 650], luzCeu: 0.6, brilhoCeu: 0.9, saturacao: 0.2, contraste: 0.14, brilho: 0.5, desfoqueCeu: 0.04 },
  dia: { ceu: "dia", fundo: "#9fd3ff", sol: [22, 40, 16], corSol: "#fff4e0", forca: 3.2, ceuChao: ["#cfe8ff", "#a89a82", 0.55], nevoa: ["#dbe8f3", 70, 750], luzCeu: 0.6, brilhoCeu: 0.85, saturacao: 0.22, contraste: 0.16, brilho: 0.4 },
  tarde: { ceu: "praia-sol", fundo: "#a8d4f5", sol: [-30, 15, 26], corSol: "#ffd9a6", forca: 3.4, ceuChao: ["#bcd6ff", "#a88a6a", 0.5], nevoa: ["#e6dccd", 70, 700], luzCeu: 0.5, brilhoCeu: 0.85, saturacao: 0.3, contraste: 0.2, brilho: 0.5 },
  entardecer: { ceu: "entardecer", fundo: "#f2c9a0", sol: [-30, 7, 22], corSol: "#ffb27a", forca: 2.8, ceuChao: ["#ffd2b0", "#7d6a5a", 0.5], nevoa: ["#efc29c", 50, 600], luzCeu: 0.55, brilhoCeu: 0.9, saturacao: 0.26, contraste: 0.18, brilho: 0.7 },
  noite: { ceu: "noite", fundo: "#0d1424", sol: [-20, 30, -12], corSol: "#9fb4ff", forca: 0.45, ceuChao: ["#2a3860", "#141420", 0.4], nevoa: ["#121a2e", 40, 450], luzCeu: 0.35, brilhoCeu: 0.7, saturacao: 0.2, contraste: 0.18, brilho: 1.1 },
  fogo: { ceu: "fogo", fundo: "#c8504a", sol: [-30, 9, 12], corSol: "#ff7a4a", forca: 2.6, ceuChao: ["#ff9a7a", "#4a2a2a", 0.5], nevoa: ["#b5544a", 40, 450], luzCeu: 0.6, brilhoCeu: 0.95, saturacao: 0.3, contraste: 0.2, brilho: 0.9, desfoqueCeu: 0.12 },
  interior: { ceu: "estudio", fundo: "#2a2622", sol: [3, 6, 4], corSol: "#fff1dc", forca: 0.9, ceuChao: ["#fff4e6", "#6b5a48", 0.6], nevoa: ["#2a2622", 30, 120], luzCeu: 0.45, brilhoCeu: 0, saturacao: 0.18, contraste: 0.14, brilho: 0.6 },
};

// Palco + luz da hora + acabamento num lugar só: <Ambiente hora="entardecer" foco={6}>…cena…</Ambiente>
export const Ambiente: React.FC<{
  hora: Hora;
  children: React.ReactNode;
  foco?: number;
  desfoque?: number;
  area?: number; // tamanho da área com sombra (m)
  alvoSombra?: [number, number, number];
  semNevoa?: boolean;
  ao?: number;
  raioAo?: number;
}> = ({ hora, children, foco = 6, desfoque = 2.4, area = 30, alvoSombra = [0, 0, 0], semNevoa, ao = 1.6, raioAo = 1.2 }) => {
  const h = HORAS[hora];
  return (
    <PalcoCinema ceu={h.ceu} fundo={h.fundo} luzCeu={h.luzCeu} brilhoCeu={h.brilhoCeu} desfoqueCeu={h.desfoqueCeu}>
      <Sol pos={[alvoSombra[0] + h.sol[0], h.sol[1], alvoSombra[2] + h.sol[2]]} cor={h.corSol} forca={h.forca} area={area} />
      <hemisphereLight args={h.ceuChao} />
      {!semNevoa && <fog attach="fog" args={h.nevoa} />}
      {children}
      <Acabamento foco={foco} desfoque={desfoque} brilho={h.brilho} saturacao={h.saturacao} contraste={h.contraste} ao={ao} raioAo={raioAo} />
    </PalcoCinema>
  );
};

export const ehNoite = (h: Hora) => h === "noite";
