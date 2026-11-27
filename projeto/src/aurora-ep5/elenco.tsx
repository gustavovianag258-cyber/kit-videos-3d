import { Corpo, Cores, PropsCorpo } from "../aurora-ep4/pessoa";

// Elenco do ep. 5, mesmo boneco do ep. 4. Pés em (x, y).
type Sem = Omit<PropsCorpo, "cores" | "cabelo" | "manga" | "extra" | "chapeu" | "mangaLonga" | "bigode">;

const CapaceteObra: React.FC<{ cor?: string }> = ({ cor = "#F2C230" }) => (
  <g>
    <path d="M -70 -690 Q -68 -772 0 -776 Q 68 -772 70 -690 Z" fill={cor} />
    <rect x={-13} y={-778} width={26} height={90} rx={9} fill="rgba(0,0,0,0.1)" />
    <path d="M -70 -690 Q -68 -772 0 -776 Q 68 -772 70 -690 Z" fill="url(#luzCapacete)" />
    <rect x={-84} y={-702} width={168} height={17} rx={8} fill={cor} />
    <rect x={-84} y={-694} width={168} height={9} rx={4} fill="rgba(0,0,0,0.18)" />
    <defs>
      <linearGradient id="luzCapacete" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#fff" stopOpacity={0.35} />
        <stop offset="1" stopColor="#000" stopOpacity={0.2} />
      </linearGradient>
    </defs>
  </g>
);

const DC: Cores = { pele: "#B07A52", peleSombra: "#90613F", camisa: "#C8742C", camisaEscura: "#A55D20", calca: "#4E5A6E", tenis: "#3A2E22", cabelo: "#1E1712" };
const DC_CASA: Cores = { ...DC, camisa: "#6E7480", camisaEscura: "#585D68", calca: "#2F3442", tenis: "#26262C" };
const POEIRA = <path d="M -60 -470 Q -30 -486 -4 -468 M 20 -420 Q 44 -434 66 -416" stroke="rgba(255,255,255,0.22)" strokeWidth={9} fill="none" strokeLinecap="round" />;

// De dia: camiseta laranja suja de cimento e capacete. De noite (`casa`): camiseta cinza, sem capacete.
export const Denis: React.FC<Sem & { casa?: boolean }> = ({ casa, ...p }) => (
  <Corpo {...p} cores={casa ? DC_CASA : DC} cabelo="curto" manga={96} bigode="#2C2018" extra={casa ? undefined : POEIRA} chapeu={casa ? undefined : <CapaceteObra />} semente={p.semente ?? "denis"} />
);

const TC: Cores = { pele: "#D3A07A", peleSombra: "#B4815C", camisa: "#3E7CA8", camisaEscura: "#2F6288", calca: "#6A5A48", tenis: "#2E2A26", cabelo: "#3A2A20" };
export const Tiao: React.FC<Sem> = (p) => <Corpo {...p} cores={TC} cabelo="curto" manga={90} chapeu={<CapaceteObra cor="#F4F2EA" />} semente={p.semente ?? "tiao"} />;

const PEDREIROS: Cores[] = [
  { ...TC, camisa: "#7E9A52", camisaEscura: "#667E42", pele: "#8D5A3C", peleSombra: "#6F4630" },
  { ...TC, camisa: "#B24A4A", camisaEscura: "#8E3A3A", pele: "#C98B5E", peleSombra: "#A9704B" },
];
export const Pedreiro: React.FC<Sem & { n: 0 | 1 }> = ({ n, ...p }) => <Corpo {...p} cores={PEDREIROS[n]} cabelo="curto" manga={90} chapeu={<CapaceteObra cor={n ? "#E8863A" : "#F2C230"} />} semente={p.semente ?? `ped${n}`} />;

const AC: Cores = { pele: "#C89A72", peleSombra: "#A97D58", camisa: "#16171E", camisaEscura: "#0E0F14", calca: "#14151B", tenis: "#0C0C10", cabelo: "#101014" };
const Gravata = (
  <g>
    <polygon points="-34,-604 0,-516 34,-604" fill="#E8E8E4" />
    <polygon points="-9,-590 9,-590 13,-520 0,-500 -13,-520" fill="#2A2C38" />
    <path d="M -36 -604 L -6 -500 M 36 -604 L 6 -500" stroke="#0A0A0E" strokeWidth={8} />
    <rect x={40} y={-500} width={30} height={7} rx={3} fill="#3A3C48" />
  </g>
);
export const Agente: React.FC<Sem & { n?: 0 | 1 }> = ({ n = 0, ...p }) => (
  <Corpo
    {...p}
    cores={n ? { ...AC, pele: "#8D5A3C", peleSombra: "#6F4630" } : AC}
    cabelo={n ? "careca" : "curto"}
    manga={140}
    mangaLonga
    extra={Gravata}
    semente={p.semente ?? `agente${n}`}
  />
);

const EN: Cores = { pele: "#D9A27A", peleSombra: "#B9825C", camisa: "#6FBFB4", camisaEscura: "#58A399", calca: "#6FBFB4", tenis: "#F0F0EC", cabelo: "#3A2A20" };
export const Enfermeira: React.FC<Omit<Sem, "semente">> = (p) => <Corpo {...p} cores={EN} cabelo="longo" manga={80} semente="enfermeira" />;

const SC: Cores = { ...EN, camisa: "#E0562E", camisaEscura: "#B8451F", calca: "#26324F", pele: "#A06845", peleSombra: "#7C4C31", cabelo: "#17120F", tenis: "#1E1E22" };
export const Socorrista: React.FC<Omit<Sem, "semente">> = (p) => <Corpo {...p} cores={SC} cabelo="curto" manga={90} semente="samu" />;
