import { AbsoluteFill, useCurrentFrame } from "remotion";
import { SERIFA } from "../cinema/Textos";
import { Cachorro, Cam, Cenario, Estilo, FONTE_FORTE, MaosPOV, Objeto, Pessoa, Pose, Prim, V3, caixa, proj, quad } from "./olho";
import { TextoNoMundo, detalhesBar } from "./detalhes";

// PRÉVIA (sem voz) da parte 1 no estilo novo: 2D olho-de-peixe, primeira pessoa (Thaís).
// Plano = frame / 60. Para ver a cena N: quadro 30 + 60 × (N − 1).
export const DURACAO_PREVIA = 6 * 60;

export const RAFA: Estilo = { pele: "#8d5a3c", cabelo: "#1c1410", roupa: "#e63946", calca: "#22223b", penteado: "curto", mochila: "#c1121f", tenis: "#222", estampa: "#f4f4f2" };
export const NEIDE: Estilo = { pele: "#a8704f", cabelo: "#8a8a8a", roupa: "#f4f1ea", calca: "#3b3b3b", penteado: "coque", avental: "#c1121f", oculos: true, tenis: "#c9ccd1" };
export const JAIR: Estilo = { pele: "#c58c68", cabelo: "#d8d8d8", roupa: "#8ecae6", calca: "#5c4033", penteado: "careca", barba: true, oculos: true, bermuda: true, tenis: "#8a5a2b" };
export const BETO: Estilo = { pele: "#8d5a3c", cabelo: "#1c1410", roupa: "#f4f1ea", calca: "#22223b", penteado: "curto", avental: "#222" };
export const GENTE: Estilo[] = [
  { pele: "#c58c68", cabelo: "#3b2214", roupa: "#f2c230", calca: "#4a6fa5", penteado: "curto", estampa: "#1f9d55", bermuda: true },
  { pele: "#6e4532", cabelo: "#15100c", roupa: "#f2c230", calca: "#2f5f9e", penteado: "trancas" },
  { pele: "#e0ac84", cabelo: "#6b4226", roupa: "#7b5ea7", calca: "#3b3b3b", penteado: "longo" },
  { pele: "#8d5a3c", cabelo: "#1c1410", roupa: "#1f9d55", calca: "#5c4033", penteado: "bone", estampa: "#f2c230" },
  { pele: "#c58c68", cabelo: "#2a1c14", roupa: "#d62828", calca: "#22223b", penteado: "curto" },
];

export const FRENTE = 4;
const JANELA = { x0: -4.2, x1: -0.6, y0: 0.95, y1: 2.35 };
export const PORTA = { x0: 1.85, x1: 3.35 };
const ALTO = 3.2;

export const sala = (rolo: number, gold: boolean): { prims: Prim[]; linhas: V3[][] } => {
  const P: Prim[] = [];
  const B = [true, true, true, true];
  const parede = gold ? "#a8925c" : "#d9b863";
  const azul = gold ? "#b9b4a6" : "#e8e2d2";
  // piso, teto
  P.push(quad([-5, 0, -4], [5, 0, -4], [5, 0, 4], [-5, 0, 4], gold ? "#8f8670" : "#d2c3a0", { xadrez: gold ? "#6e6656" : "#b09f7c", tam: 1 }));
  P.push(quad([-5, ALTO, 4], [5, ALTO, 4], [5, ALTO, -4], [-5, ALTO, -4], gold ? "#77726a" : "#d6cfc0", { xadrez: gold ? "#6a655d" : "#c4bdac", tam: 1 }));
  // fundo e laterais (faixa de azulejo + pintura)
  P.push(quad([-5, 0, -4], [5, 0, -4], [5, 1.3, -4], [-5, 1.3, -4], azul, { borda: B }));
  P.push(quad([-5, 1.3, -4], [5, 1.3, -4], [5, ALTO, -4], [-5, ALTO, -4], parede, { borda: B }));
  P.push(quad([-5, 0, 4], [-5, 0, -4], [-5, 1.3, -4], [-5, 1.3, 4], azul, { borda: B }));
  P.push(quad([-5, 1.3, 4], [-5, 1.3, -4], [-5, ALTO, -4], [-5, ALTO, 4], escurecer(parede, 0.9), { borda: B }));
  P.push(quad([5, 0, -4], [5, 0, 4], [5, 1.3, 4], [5, 1.3, -4], azul, { borda: B }));
  P.push(quad([5, 1.3, -4], [5, 1.3, 4], [5, ALTO, 4], [5, ALTO, -4], escurecer(parede, 0.9), { borda: B }));
  // parede da rua, com vitrine e porta
  const f = (x0: number, x1: number, y0: number, y1: number, cor = parede) => P.push(quad([x0, y0, FRENTE], [x1, y0, FRENTE], [x1, y1, FRENTE], [x0, y1, FRENTE], cor, { borda: B }));
  f(-5, JANELA.x0, 0, ALTO);
  f(JANELA.x0, JANELA.x1, 0, JANELA.y0, "#c9a14a");
  f(JANELA.x0, JANELA.x1, JANELA.y1, ALTO);
  f(JANELA.x1, PORTA.x0, 0, ALTO);
  f(PORTA.x1, 5, 0, ALTO);
  // porta de aço (rolo): desce do alto até a altura `rolo`
  P.push(quad([PORTA.x0, rolo, FRENTE - 0.05], [PORTA.x1, rolo, FRENTE - 0.05], [PORTA.x1, ALTO - 0.1, FRENTE - 0.05], [PORTA.x0, ALTO - 0.1, FRENTE - 0.05], "#8d949b", { borda: B, tam: 0.8 }));
  P.push(...caixa([(PORTA.x0 + PORTA.x1) / 2, rolo - 0.04, FRENTE - 0.06], [PORTA.x1 - PORTA.x0 + 0.1, 0.08, 0.08], "#3d4348"));
  // lado de fora: clarão, calçada, prédios escuros
  const ceu = gold ? "#e0361f" : "#8ec2ea";
  P.push(quad([-40, -2, 16], [40, -2, 16], [40, 14, 16], [-40, 14, 16], ceu, { tam: 12, brilha: true }));
  P.push(quad([-40, 0, FRENTE], [40, 0, FRENTE], [40, 0, 16], [-40, 0, 16], gold ? "#8a2c20" : "#bdb4a4", { tam: 4, brilha: gold }));
  if (gold) {
    [[-9, 12, 5], [-2, 14, 8], [5, 13, 6], [11, 12, 9]].forEach(([x, z, h]) => P.push(...caixa([x, h / 2, z], [4.5, h, 2], "#8a2a1b", 0, { brilha: true })));
  } else {
    [[-9, 13, 5], [-2, 14, 8], [5, 13, 6]].forEach(([x, z, h]) => P.push(...caixa([x, h / 2, z], [4.5, h, 2], "#c98a62")));
  }
  // luminárias de teto (tubos compridos, como nas referências) e ventilador
  [[-1.5, 0], [-1.5, -2.4], [2.4, -1], [2.4, 1.6]].forEach(([x, z]) => P.push(...caixa([x, ALTO - 0.05, z], [0.18, 0.08, 1.7], "#f6f6f0", 0, { brilha: true })));
  P.push(...caixa([-1, ALTO - 0.12, 0.5], [0.16, 0.14, 0.16], "#333"));
  P.push(...caixa([-1, ALTO - 0.22, 0.5], [1.5, 0.03, 0.14], "#6b4a2a"));
  P.push(...caixa([-1, ALTO - 0.22, 0.5], [0.14, 0.03, 1.5], "#6b4a2a"));
  // balcão, geladeira, TV, prateleira
  P.push(...caixa([3.4, 0.5, -2.9], [3.2, 1.0, 0.8], "#7a4a22"));
  P.push(...caixa([3.4, 1.04, -2.9], [3.3, 0.08, 0.9], "#2b2b2b"));
  [-1, -0.2, 0.7].forEach((dx, i) => P.push(...caixa([3.4 + dx, 1.2, -2.95], [0.09, 0.25, 0.09], i === 1 ? "#f2c230" : "#5a2a0a")));
  P.push(...caixa([0.2, 0.95, -3.5], [1.0, 1.9, 0.7], "#f4f4f2"));
  P.push(quad([-0.28, 0.4, -3.14], [0.68, 0.4, -3.14], [0.68, 1.75, -3.14], [-0.28, 1.75, -3.14], "#bfe3f2", { borda: B }));
  P.push(...caixa([-2.2, 2.15, -3.9], [1.95, 1.15, 0.12], "#15151a"));
  // cartaz e relógio no fundo
  P.push(quad([-4.5, 1.7, -3.97], [-3.7, 1.7, -3.97], [-3.7, 2.7, -3.97], [-4.5, 2.7, -3.97], "#f4e9c8", { borda: B }));
  // mesas e cadeiras
  const mesas: [number, number, string][] = [[-3, -0.8, "#f4f4f2"], [-0.6, -1.2, "#e63946"], [-3.4, 1.4, "#2a9d8f"]];
  mesas.forEach(([x, z, cor]) => {
    P.push(...caixa([x, 0.72, z], [0.8, 0.05, 0.8], "#f4f4f2"));
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => P.push(...caixa([x + a * 0.33, 0.36, z + b * 0.33], [0.05, 0.72, 0.05], "#dcdcd8")));
    [[0, 0.62], [0, -0.62], [0.62, 0], [-0.62, 0]].forEach(([dx, dz], i) => {
      P.push(...caixa([x + dx, 0.45, z + dz], [0.44, 0.04, 0.42], cor));
      P.push(...caixa([x + dx * 1.3, 0.7, z + dz * 1.3], i < 2 ? [0.44, 0.4, 0.04] : [0.04, 0.4, 0.44], cor));
    });
    P.push(...caixa([x + 0.1, 0.84, z], [0.08, 0.22, 0.08], "#5a2a0a"));
  });
  const linhas: V3[][] = [
    [[JANELA.x0, JANELA.y0, FRENTE], [JANELA.x1, JANELA.y0, FRENTE], [JANELA.x1, JANELA.y1, FRENTE], [JANELA.x0, JANELA.y1, FRENTE], [JANELA.x0, JANELA.y0, FRENTE]],
    [[(JANELA.x0 + JANELA.x1) / 2, JANELA.y0, FRENTE], [(JANELA.x0 + JANELA.x1) / 2, JANELA.y1, FRENTE]],
  ];
  for (let y = 0.4; y < 3.1; y += 0.4) linhas.push(([[PORTA.x0, y, FRENTE - 0.1], [PORTA.x1, y, FRENTE - 0.1]] as V3[]).filter(() => y > rolo));
  return { prims: P, linhas };
};
const escurecer = (hex: string, f: number) => {
  const n = parseInt(hex.slice(1), 16);
  const c = (s: number) => Math.max(0, Math.min(255, Math.round(((n >> s) & 255) * f)));
  return `#${((1 << 24) | (c(16) << 16) | (c(8) << 8) | c(0)).toString(16).slice(1)}`;
};

// texto do mundo (TV) preso a um ponto
export const TextoMundo: React.FC<{ cam: Cam; centro: V3; larg: number; children: React.ReactNode }> = ({ cam, centro, larg, children }) => {
  const p = proj(cam, centro);
  const s = ((cam.k ?? 720) * larg) / p.d / 360;
  return (
    <g transform={`translate(${p.x} ${p.y}) scale(${s})`} textAnchor="middle" style={{ fontFamily: FONTE_FORTE }}>
      {children}
    </g>
  );
};

export const Quadrinho: React.FC<{ tipo: TextoNoMundo["tipo"] }> = ({ tipo }) => {
  if (tipo === "lousa")
    return (
      <g fill="#f4f1e6" fontWeight={800}>
        <text y={-120} fontSize={40} fontWeight={900}>CARDÁPIO</text>
        {["Pastel ......... 8,00", "Coxinha ........ 6,50", "Porção batata . 25,00", "Cerveja 600 ... 12,00", "Caipirinha .... 15,00"].map((l, i) => (
          <text key={i} y={-70 + i * 44} fontSize={28}>{l}</text>
        ))}
      </g>
    );
  if (tipo === "relogio")
    return (
      <g>
        <circle r={150} fill="#f8f8f4" stroke="#17130f" strokeWidth={14} />
        <line x1={0} y1={0} x2={0} y2={-110} stroke="#17130f" strokeWidth={14} strokeLinecap="round" />
        <line x1={0} y1={0} x2={70} y2={50} stroke="#17130f" strokeWidth={18} strokeLinecap="round" />
        <circle r={14} fill="#c1121f" />
      </g>
    );
  if (tipo === "fiado")
    return (
      <text y={16} fontSize={52} fontWeight={900} fill="#17130f">FIADO SÓ AMANHÃ</text>
    );
  if (tipo === "placa")
    return (
      <g>
        <rect x={-150} y={-55} width={300} height={110} rx={14} fill="#c1121f" stroke="#17130f" strokeWidth={10} />
        <text y={22} fontSize={64} fontWeight={900} fill="#fff">ABERTO</text>
      </g>
    );
  return null;
};

export const Fala: React.FC<{ texto: string; cor?: string; topo?: number }> = ({ texto, cor = "#ffd23f", topo = 1180 }) => (
  <div style={{ position: "absolute", top: topo, left: 70, right: 70, textAlign: "center", fontFamily: FONTE_FORTE, fontWeight: 800, fontSize: 50, lineHeight: 1.18, color: cor, textShadow: "0 3px 0 #000, 0 0 14px rgba(0,0,0,0.9), 3px 3px 0 #000, -3px 3px 0 #000", WebkitTextStroke: "1px rgba(0,0,0,0.5)" }}>
    {texto}
  </div>
);

export const TagParte: React.FC<{ n: number }> = ({ n }) => (
  <div style={{ position: "absolute", top: 110, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
    <div style={{ background: "#c1121f", border: "5px solid #fff", borderRadius: 16, padding: "10px 38px", fontFamily: FONTE_FORTE, fontWeight: 900, fontSize: 58, letterSpacing: 3, color: "#fff", boxShadow: "0 6px 0 #000" }}>PARTE {String(n).padStart(2, "0")}</div>
  </div>
);

export const TelaAlerta: React.FC = () => (
  <g style={{ fontFamily: FONTE_FORTE }} textAnchor="middle">
    <rect x={-160} y={-268} width={320} height={576} rx={28} fill="#b3001b" />
    <text x={0} y={-150} fontSize={34} fontWeight={900} fill="#fff">ALERTA NACIONAL</text>
    <text x={0} y={-60} fontSize={30} fontWeight={800} fill="#fff">Fique onde está.</text>
    <text x={0} y={-15} fontSize={26} fontWeight={800} fill="#fff">Feche portas e janelas.</text>
    <text x={0} y={90} fontSize={34} fontWeight={900} fill="#ffe66d">NÃO OLHE</text>
    <text x={0} y={130} fontSize={34} fontWeight={900} fill="#ffe66d">PARA O CÉU.</text>
  </g>
);

export const TelaMensagem: React.FC = () => (
  <g style={{ fontFamily: FONTE_FORTE }}>
    <rect x={-160} y={-268} width={320} height={576} rx={28} fill="#101418" />
    <text x={-140} y={-215} fontSize={22} fontWeight={800} fill="#9aa0a6">RAFA</text>
    <rect x={-140} y={-190} width={250} height={150} rx={22} fill="#2b3036" />
    <text x={-122} y={-150} fontSize={26} fontWeight={800} fill="#fff">Abre.</text>
    <text x={-122} y={-114} fontSize={26} fontWeight={800} fill="#fff">Eu só quero que</text>
    <text x={-122} y={-78} fontSize={26} fontWeight={800} fill="#fff">você olhe.</text>
    <text x={0} y={200} fontSize={20} fontWeight={800} fill="#e63946" textAnchor="middle">● digitando…</text>
  </g>
);

export const Escolha: React.FC = () => (
  <>
    <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)" }} />
    <div style={{ position: "absolute", top: 440, left: 0, right: 0, textAlign: "center", fontFamily: SERIFA, fontSize: 70, color: "#fff", textShadow: "0 3px 10px rgba(0,0,0,0.7)" }}>
      O que eles fazem<i style={{ fontWeight: 600 }}>?</i>
    </div>
    {[
      ["A", "Abrem a porta pro Rafa", 620],
      ["B", "Ficam trancados e ela responde", 900],
    ].map(([l, t, y]) => (
      <div key={l as string} style={{ position: "absolute", top: y as number, left: 80, right: 80, display: "flex", alignItems: "center", gap: 36, padding: "30px 44px", borderRadius: 30, background: "rgba(10,10,12,0.72)", border: "5px solid #fff", boxShadow: "0 8px 0 #000" }}>
        <div style={{ fontFamily: FONTE_FORTE, fontWeight: 900, fontSize: 130, color: "#ffd23f", lineHeight: 1 }}>{l}</div>
        <div style={{ fontFamily: FONTE_FORTE, fontWeight: 800, fontSize: 50, lineHeight: 1.15, color: "#fff" }}>{t}</div>
      </div>
    ))}
    <div style={{ position: "absolute", top: 1230, left: 0, right: 0, textAlign: "center", fontFamily: SERIFA, fontSize: 52, color: "#fff", textShadow: "0 3px 10px rgba(0,0,0,0.7)" }}>
      Comenta <i style={{ fontWeight: 600 }}>A</i> ou <i style={{ fontWeight: 600 }}>B</i>. A parte 2 sai com a que ganhar.
    </div>
    <div style={{ position: "absolute", right: 56, bottom: 90, textAlign: "right", fontFamily: FONTE_FORTE, fontWeight: 900, color: "rgba(255,255,255,0.9)", textShadow: "0 3px 10px rgba(0,0,0,0.7)" }}>
      <div style={{ fontSize: 46, letterSpacing: 2 }}>MUNDO PARALELO</div>
      <div style={{ fontSize: 28, opacity: 0.85 }}>@mundoparalelo.br</div>
    </div>
  </>
);

export const AlertaPrevia: React.FC = () => {
  const frame = useCurrentFrame();
  const plano = Math.min(5, Math.floor(frame / 60));
  const t = frame / 30;
  const gold = plano >= 2;
  const rolo = plano === 3 ? 1.95 : 1.5;
  const base = sala(rolo, gold);
  const det = detalhesBar(gold);
  const prims = [...base.prims, ...det.prims];
  const linhas = [...base.linhas, ...det.linhas];
  const sway = Math.sin(t * 1.3) * 0.03;

  const cams: Cam[] = [
    { pos: [0.5 + sway, 1.5, 2.7], yaw: Math.PI + 0.15, pitch: 0.06 },
    { pos: [0.5 + sway, 1.5, 2.7], yaw: Math.PI - 0.1, pitch: 0.08 },
    { pos: [-1.0 + sway, 1.5, 2.3], yaw: -0.33, pitch: 0.05 },
    { pos: [2.4 + sway, 1.55, 2.6], yaw: 0.06, pitch: 0.0 },
    { pos: [-0.8 + sway, 1.5, 2.4], yaw: -0.45, pitch: 0.04 },
    { pos: [-0.8 + sway, 1.5, 2.4], yaw: -0.45, pitch: 0.04 },
  ];
  const cam = cams[plano];
  const costas: Pose = "costas";

  const dentro: { pos: V3; est: Estilo; pose: Pose; h: number }[] = [
    { pos: [-3, 0, -0.25], est: JAIR, pose: costas, h: 1.3 },
    { pos: [-0.6, 0, -0.62], est: GENTE[0], pose: costas, h: 1.3 },
    { pos: [-0.6, 0, -1.8], est: GENTE[1], pose: "sentado", h: 1.3 },
    { pos: [-3.4, 0, 2.02], est: GENTE[2], pose: "sentado", h: 1.28 },
    { pos: [-3.4, 0, 0.78], est: GENTE[3], pose: "sentado", h: 1.3 },
    { pos: [2.2, 0, -1.5], est: BETO, pose: costas, h: 1.76 },
    { pos: [-1.6, 0, 0.5], est: GENTE[4], pose: costas, h: 1.7 },
    { pos: [3.0, 0, -3.55], est: NEIDE, pose: plano === 1 ? "susto" : "parado", h: 1.62 },
    { pos: [2.4, 0, -1.85], est: GENTE[3], pose: costas, h: 1.3 },
    { pos: [4.2, 0, -1.85], est: GENTE[0], pose: costas, h: 1.32 },
    { pos: [-3.0, 0, -1.42], est: GENTE[4], pose: "sentado", h: 1.3 },
    { pos: [-2.38, 0, -0.8], est: GENTE[1], pose: plano === 1 ? "celular" : "sentado", h: 1.28 },
    { pos: [-2.78, 0, 1.4], est: GENTE[0], pose: "sentado", h: 1.3 },
    { pos: [-1.9, 0, 1.2], est: GENTE[2], pose: plano === 1 ? "celular" : "parado", h: 1.62 },
    { pos: [-4.3, 0, -0.5], est: GENTE[2], pose: costas, h: 1.6 },
  ];
  const sombras: V3[] = [[-3.4, 0, 7.2], [-2.0, 0, 9.4], [-1.0, 0, 6.8], [-3.0, 0, 11], [-1.6, 0, 12.5], [0.2, 0, 9]];
  
  const tvAlerta = plano >= 1;
  const mostrarDentro = plano <= 1;
  const objetos: Objeto[] = [];
  if (mostrarDentro) dentro.forEach((p) => objetos.push({ pos: [p.pos[0], 0.6, p.pos[2]], no: <Pessoa cam={cam} pos={p.pos} altura={p.h} estilo={p.est} pose={p.pose} t={t} /> }));
  objetos.push({ pos: [1.2, 0.2, 0.9], no: <Cachorro cam={cam} pos={[1.2, 0, 0.9]} t={t} /> });
  if (plano === 2) objetos.push({ pos: [-2.2, 0.8, 6.0], no: <Pessoa cam={cam} pos={[-2.2, 0, 6.0]} altura={1.76} estilo={RAFA} pose="ceu" t={t} /> });
  if (plano === 3) objetos.push({ pos: [2.6, 0.8, 5.1], no: <Pessoa cam={cam} pos={[2.6, 0, 5.1]} altura={1.76} estilo={RAFA} pose="parado" t={t} /> });
  if (plano >= 4) {
    [...sombras, [-1.2, 0, 5.4] as V3].forEach((p) => objetos.push({ pos: [p[0], 0.8, p[2]], no: <Pessoa cam={cam} pos={p} altura={1.74} estilo={RAFA} pose="sombra" t={t} /> }));
  }
  // gente passando lá fora no plano 1 (rua ainda normal)

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <radialGradient id="vinheta" cx="50%" cy="50%" r="75%">
            <stop offset="0.6" stopColor="#000" stopOpacity={0} />
            <stop offset="1" stopColor="#000" stopOpacity={0.55} />
          </radialGradient>
        </defs>
        <rect width={1080} height={1920} fill="#b9b09e" />
        <Cenario cam={cam} prims={prims} objetos={objetos} linhas={linhas} />
        {det.textos.map((x, i) => (
          <TextoMundo key={i} cam={cam} centro={x.centro} larg={x.larg}>
            <Quadrinho tipo={x.tipo} />
          </TextoMundo>
        ))}
        {/* TV */}
        {(plano <= 1) && (
          <TextoMundo cam={cam} centro={[-2.2, 2.15, -3.82]} larg={1.8}>
            <rect x={-180} y={-100} width={360} height={200} fill={tvAlerta ? "#b3001b" : "#2e8b3a"} />
            {tvAlerta ? (
              <>
                <text y={-48} fontSize={30} fontWeight={900} fill="#fff">ALERTA NACIONAL</text>
                <text y={0} fontSize={24} fontWeight={800} fill="#fff">Fique onde está.</text>
                <text y={36} fontSize={20} fontWeight={800} fill="#fff">Feche portas e janelas.</text>
                <text y={80} fontSize={26} fontWeight={900} fill="#ffe66d">NÃO OLHE PARA O CÉU.</text>
              </>
            ) : (
              <>
                <line x1={-180} x2={180} y1={0} y2={0} stroke="#fff" strokeWidth={4} opacity={0.6} />
                <circle r={34} fill="none" stroke="#fff" strokeWidth={4} opacity={0.6} />
                <text y={-62} fontSize={24} fontWeight={900} fill="#fff">BRA  1 x 1  ARG</text>
              </>
            )}
          </TextoMundo>
        )}
        <rect width={1080} height={1920} fill="url(#vinheta)" />
        {/* braços em primeira pessoa */}
        <MaosPOV baixo={plano === 2 || plano === 3} telefone={plano === 1 ? <TelaAlerta /> : plano === 4 ? <TelaMensagem /> : undefined} />
      </svg>

      <TagParte n={1} />
      {plano === 0 && (
        <div style={{ position: "absolute", top: 300, left: 70, right: 70, textAlign: "center", fontFamily: SERIFA, fontSize: 68, lineHeight: 1.15, color: "#fff", textShadow: "0 3px 10px rgba(0,0,0,0.75)" }}>
          E se todo celular do Brasil tocasse ao mesmo tempo com o alerta: <i style={{ fontWeight: 600 }}>fique onde está</i>?
        </div>
      )}
      {plano === 0 && <Fala texto="Domingo, quatro da tarde. Ninguém sai antes do apito." cor="#fff" />}
      {plano === 1 && <Fala texto="Teste, né?" cor="#ffd23f" topo={900} />}
      {plano === 1 && <Fala texto="Teste não manda não olhar pro céu." cor="#fff" topo={1010} />}
      {plano === 2 && <Fala texto="Rafa? RAFA!" cor="#fff" />}
      {plano === 3 && <Fala texto="Abre, Thaís. É bonito." cor="#ffd23f" />}
      {plano === 4 && <Fala texto="A mensagem veio do celular dele. Ele não estava digitando." cor="#fff" topo={920} />}
      {plano === 5 && <Escolha />}
    </AbsoluteFill>
  );
};
