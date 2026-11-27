import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { detalhesBar } from "./detalhes";
import { SonsAlerta } from "./sons";
import { Cachorro, Cam, Cenario, Estilo, FONTE_FORTE, FONTE_NARRA, FONTE_TITULO, MaosPOV, SOMBRA_SUAVE, Nevoa, Objeto, Pessoa, Pose, V3, proj } from "./olho";
import { BETO, GENTE, JAIR, NEIDE, Quadrinho, RAFA, TelaAlerta, TelaMensagem, TextoMundo, sala } from "./Previa";

// PRÉVIA ANIMADA da parte 1 (sem voz): 26 planos, câmera sempre andando, legendas no tempo estimado
// da fala. Tudo preso ao tempo global s (segundos).
export const DURACAO_ANIMA = Math.round(70.6 * 30);

// Tempo REAL (com a voz) → tempo de DESENHO (o da prévia sem voz). A narração da abertura ficou mais
// longa, então a cena 1 estica 2 s; depois do alerta é só deslocar 2 s.
const MAPA: [number, number][] = [[0, 0], [3, 3], [6, 5], [8.4, 7.2], [11.3, 9.3], [100, 98]];
const paraDesenho = (r: number) => {
  for (let i = 0; i < MAPA.length - 1; i++) {
    const [r0, d0] = MAPA[i];
    const [r1, d1] = MAPA[i + 1];
    if (r <= r1) return d0 + ((r - r0) / (r1 - r0)) * (d1 - d0);
  }
  return r - 2;
};
const paraReal = (d: number) => {
  for (let i = 0; i < MAPA.length - 1; i++) {
    const [r0, d0] = MAPA[i];
    const [r1, d1] = MAPA[i + 1];
    if (d <= d1) return r0 + ((d - d0) / (d1 - d0)) * (r1 - r0);
  }
  return d + 2;
};

const ease = (x: number) => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
};
const lerp = (a: number, b: number, x: number) => a + (b - a) * x;
const faixa = (s: number, a: number, b: number) => ease((s - a) / (b - a));
const C = (pos: V3, yaw: number, pitch = 0, k = 720): Cam => ({ pos, yaw, pitch, k });
const entre = (a: Cam, b: Cam, x: number): Cam => {
  const e = ease(x);
  return {
    pos: [lerp(a.pos[0], b.pos[0], e), lerp(a.pos[1], b.pos[1], e), lerp(a.pos[2], b.pos[2], e)],
    yaw: lerp(a.yaw, b.yaw, e),
    pitch: lerp(a.pitch, b.pitch, e),
    k: lerp(a.k ?? 720, b.k ?? 720, e),
  };
};
const PI = Math.PI;

// [início, câmera no começo, câmera no fim]
const PLANOS: [number, Cam, Cam][] = [
  [0, C([0.5, 1.5, 2.7], PI + 0.45, 0.06), C([0.5, 1.5, 2.6], PI - 0.05, 0.06)], // bar cheio
  [3, C([-0.6, 1.5, 2.0], -0.25, 0.03), C([-0.8, 1.5, 2.4], -0.18, 0.03)], // moto chegando
  [5, C([2.6, 1.5, -1.2], PI - 0.12, 0), C([2.8, 1.5, -1.6], PI - 0.2, 0.02)], // Neide no balcão
  [7.2, C([-1.0, 1.5, 1.5], PI + 0.22, 0.1), C([-1.2, 1.5, 0.9], PI + 0.2, 0.1)], // TV, quase gol
  [9.3, C([-2.2, 1.9, -1.4], PI, 0.05, 800), C([-2.2, 2.0, -2.1], PI, 0.05, 820)], // TV vira alerta
  [10.5, C([0.5, 1.5, 2.7], PI - 0.05, -0.05), C([0.5, 1.5, 2.6], PI + 0.05, -0.08)], // celular sobe
  [12.5, C([-3.0, 1.15, 0.95], PI, 0, 760), C([-3.0, 1.15, 0.7], PI, 0, 780)], // Jair
  [14.5, C([0.5, 1.5, 2.7], PI + 0.3, 0.04), C([0.5, 1.5, 2.7], PI - 0.3, 0.04)], // Thaís responde
  [17.2, C([4.3, 2.6, 3.3], -2.27, -0.25), C([4.2, 2.5, 2.6], -2.05, -0.22)], // bar inteiro no celular
  [20, C([-1.0, 1.5, 2.3], -0.33, 0.04), C([-1.2, 1.5, 2.8], -0.3, 0.05)], // Rafa lá fora no celular
  [23.2, C([-1.4, 1.55, 3.2], -0.27, 0.08), C([-1.6, 1.55, 3.45], -0.25, 0.12)], // ele olha pra cima
  [25.2, C([-1.9, 1.6, 3.6], -0.12, 0.25, 1050), C([-1.95, 1.62, 3.65], -0.1, 0.3, 1150)], // close olhando o céu
  [27.2, C([-1.0, 1.5, 2.3], -0.33, 0.04), C([-1.1, 1.5, 2.5], -0.33, 0.04)], // "Rafa? RAFA!"
  [29.2, C([-1.4, 1.55, 3.0], -0.28, 0.02, 950), C([-1.5, 1.55, 3.2], -0.28, 0.02, 1050)], // ele vira, calmo
  [31, C([0.6, 1.5, 1.8], 0.75, 0.05), C([0.8, 1.5, 2.0], 0.7, 0.08)], // Neide baixa a porta
  [33.2, C([2.4, 1.55, 2.6], 0.06, 0), C([2.5, 1.55, 2.9], 0.04, 0)], // Rafa na fresta
  [36, C([2.0, 1.5, 2.0], 0.25, -0.02), C([2.1, 1.5, 2.2], 0.2, -0.02)], // "Cê tá bem?"
  [38, C([2.6, 1.62, 3.1], 0, 0.02, 900), C([2.6, 1.62, 3.35], 0, 0.02, 1000)], // ele repete
  [40, C([0.9, 1.62, 3.3], 2.71, 0, 760), C([0.95, 1.62, 3.15], 2.71, 0, 800)], // Beto cochicha
  [43, C([2.6, 1.66, 3.75], 0, 0.04, 1150), C([2.6, 1.66, 3.85], 0, 0.04, 1300)], // olhos que não piscam
  [45, C([-0.8, 1.5, 2.4], -0.45, 0.04), C([-1.0, 1.5, 2.8], -0.42, 0.05)], // sombras chegando
  [48, C([0.5, 1.5, 2.7], PI, 0.06), C([0.5, 1.5, 2.5], PI, 0.08)], // luzes e celulares morrem
  [50, C([-0.6, 1.5, 2.4], -0.5, -0.05), C([-0.7, 1.5, 2.5], -0.46, -0.05)], // celular dela vibra
  [53, C([2.3, 1.4, 2.4], 0.06, 0.03), C([2.4, 1.45, 2.75], 0.05, 0.03)], // ele não digita
  [56, C([-0.8, 1.5, 2.4], -0.45, 0.02), C([-0.9, 1.5, 2.6], -0.43, 0.02)], // "digitando…"
  [60, C([-0.9, 1.5, 2.6], -0.43, 0.02), C([-0.9, 1.5, 2.6], -0.43, 0.02)], // escolha A ou B
];
const FIM = 68.6;

// falas: [início, fim, texto, cor, serifa (narrador)?]
const NARRADOR = "#e8e2d4";
const THAIS = "#ffffff";
const FALAS: [number, number, string, string, boolean?][] = [
  [6.05, 10.2, "Domingo, quatro da tarde. Ninguém ia sair antes do apito.", NARRADOR, true],
  [10.3, 12.2, "Vai, vai, VAI!", "#ffd23f"],
  [14.7, 16.9, "Teste, né?", "#ffd23f"],
  [16.95, 19.6, "Teste não manda não olhar pro céu.", THAIS],
  [29.3, 31.1, "Rafa? RAFA!", THAIS],
  [31.4, 33.0, "Foi só um segundo.", NARRADOR, true],
  [33.3, 35.0, "Ninguém abre essa porta!", "#9dff9d"],
  [35.5, 38.3, "Abre, Thaís. É bonito.", "#ff9be0"],
  [38.4, 40.1, "Cê tá bem?", THAIS],
  [40.4, 41.7, "Cê tá bem?", "#ff9be0"],
  [42.3, 44.4, "Ele não piscou nem uma vez.", "#ffb347"],
  [50.2, 52.8, "Aí os celulares começaram a morrer.", NARRADOR, true],
  [52.9, 54.7, "Todos, menos um.", NARRADOR, true],
  [55.2, 57.8, "A mensagem veio do celular dele.", NARRADOR, true],
  [58.3, 60.1, "Ele não estava digitando.", NARRADOR, true],
];

const Legenda: React.FC<{ s: number }> = ({ s }) => {
  const f = FALAS.find(([a, b]) => s >= a && s < b);
  if (!f) return null;
  const [a, b, texto, cor, serifa] = f;
  const op = Math.min(1, (s - a) / 0.12, (b - s) / 0.12);
  return (
    <div
      style={{
        position: "absolute",
        top: 1150,
        left: 70,
        right: 70,
        textAlign: "center",
        opacity: op,
        transform: `scale(${0.94 + 0.06 * Math.min(1, (s - a) / 0.15)})`,
        fontFamily: serifa ? FONTE_NARRA : FONTE_FORTE,
        fontWeight: serifa ? 500 : 700,
        fontStyle: serifa ? "italic" : "normal",
        fontSize: serifa ? 52 : 56,
        lineHeight: 1.18,
        color: cor,
        textShadow: SOMBRA_SUAVE,
      }}
    >
      {texto}
    </div>
  );
};

const SOMBRAS: V3[] = [[-3.4, 0, 6.2], [-2.0, 0, 7.4], [-1.0, 0, 5.8], [-3.0, 0, 9], [-1.6, 0, 10.5], [0.2, 0, 7.5], [-4.2, 0, 8.2]];

export const AlertaAnima: React.FC<{ semTexto?: boolean }> = ({ semTexto }) => {
  const frame = useCurrentFrame();
  const real = frame / 30;
  const s = paraDesenho(real);
  const iPlano = PLANOS.filter(([a]) => s >= a).length - 1;
  const [ini, ca, cb] = PLANOS[iPlano];
  const fimPlano = PLANOS[iPlano + 1]?.[0] ?? FIM;
  const x = (s - ini) / (fimPlano - ini);
  let cam = entre(ca, cb, x);

  // estado do mundo no tempo
  const gold = s >= 23.2;
  const flash = s >= 23.2 ? Math.exp(-(s - 23.2) * 3) : 0;
  const flashTV = s >= 9.3 && s < 10.5 ? Math.exp(-(s - 9.3) * 5) * 0.6 : 0;
  const rolo = s < 31 ? 3.05 : s < 33.2 ? lerp(3.05, 1.95, faixa(s, 31.3, 32.9)) : 1.95 + (s >= 60 ? Math.abs(Math.sin(s * 23)) * 0.03 : 0);
  const motoX = s < 3 ? -14 : s < 4.4 ? lerp(-14, 0, 1 - (1 - (s - 3) / 1.4) ** 2) : 0;
  const tv = s < 9.3 ? "jogo" : s < 48.6 ? "alerta" : "off";
  const escuro = s < 48.2 ? 0 : s < 49.6 ? (Math.sin(s * 40) > 0.2 ? 0.45 : 0.1) : 0.3;
  // tremor de câmera: grito, sombras chegando, escolha
  const treme = (s > 27.2 && s < 29) || (s > 60 && s < 68) ? 1 : s > 45 && s < 48 ? 0.4 : 0;
  if (treme) cam = { ...cam, pos: [cam.pos[0] + Math.sin(s * 31) * 0.02 * treme, cam.pos[1] + Math.sin(s * 27) * 0.015 * treme, cam.pos[2]] };
  // respiração de câmera na mão
  cam = { ...cam, yaw: cam.yaw + Math.sin(s * 1.1) * 0.012, pitch: cam.pitch + Math.sin(s * 1.7) * 0.008 };

  const base = sala(rolo, gold);
  const det = detalhesBar(gold, motoX);
  const prims = [...base.prims, ...det.prims];
  const linhas = [...base.linhas, ...det.linhas];

  // gente lá dentro
  const alerta = s >= 9.3;
  const medo = s >= 23.2;
  const costas: Pose = "costas";
  const dentro: { pos: V3; est: Estilo; pose: Pose; h: number }[] = [
    { pos: [-3, 0, -0.25], est: JAIR, pose: iPlano === 6 ? "sentado" : costas, h: 1.3 },
    { pos: [-0.6, 0, -0.62], est: GENTE[0], pose: costas, h: 1.3 },
    { pos: [-0.6, 0, -1.8], est: GENTE[1], pose: s > 7.4 && s < 9.3 ? "susto" : alerta ? "celular" : "sentado", h: 1.3 },
    { pos: [-3.4, 0, 2.02], est: GENTE[2], pose: "sentado", h: 1.28 },
    { pos: [-3.4, 0, 0.78], est: GENTE[3], pose: s > 7.4 && s < 9.3 ? "susto" : medo ? "susto" : "sentado", h: 1.3 },
    s >= 36 ? { pos: [1.4, 0, 2.2], est: BETO, pose: iPlano === 18 ? "parado" : medo ? "susto" : "parado", h: 1.76 } : { pos: [2.2, 0, -1.5], est: BETO, pose: costas, h: 1.76 },
    { pos: [-1.6, 0, 0.5], est: GENTE[4], pose: costas, h: 1.7 },
    s >= 31 && s < 33.2 ? { pos: [2.3, 0, 3.45], est: NEIDE, pose: "susto", h: 1.62 } : { pos: [3.0, 0, -3.55], est: NEIDE, pose: alerta && s < 12 ? "susto" : "parado", h: 1.62 },
    { pos: [2.4, 0, -1.85], est: GENTE[3], pose: costas, h: 1.3 },
    { pos: [4.2, 0, -1.85], est: GENTE[0], pose: costas, h: 1.32 },
    { pos: [-3.0, 0, -1.42], est: GENTE[4], pose: alerta ? "celular" : "sentado", h: 1.3 },
    { pos: [-2.38, 0, -0.8], est: GENTE[1], pose: alerta ? "celular" : "sentado", h: 1.28 },
    { pos: [-2.78, 0, 1.4], est: GENTE[0], pose: medo ? "susto" : "sentado", h: 1.3 },
    { pos: [-1.9, 0, 1.2], est: GENTE[2], pose: alerta ? "celular" : "parado", h: 1.62 },
    { pos: [-4.3, 0, -0.5], est: GENTE[2], pose: costas, h: 1.6 },
  ];
  const objetos: Objeto[] = dentro.map((p) => ({ pos: [p.pos[0], 0.6, p.pos[2]], no: <Pessoa cam={cam} pos={p.pos} altura={p.h} estilo={p.est} pose={p.pose} t={s} /> }));
  objetos.push({ pos: [1.2, 0.2, 0.9], no: <Cachorro cam={cam} pos={[1.2, 0, 0.9]} t={s} /> });

  // Rafa
  let rafa: { pos: V3; pose: Pose } | null = null;
  if (s >= 3 && s < 4.6) rafa = { pos: [-0.9 + motoX, 0.35, 6.4], pose: "sentado" };
  else if (s >= 4.6 && s < 23.2) rafa = { pos: [-1.6 - faixa(s, 19, 21) * 0.6, 0, 6.0], pose: "celular" };
  else if (s >= 23.2 && s < 29.6) rafa = { pos: [-2.2, 0, 6.0], pose: "ceu" };
  else if (s >= 29.6 && s < 31.6) rafa = { pos: [-2.2, 0, 6.0], pose: "calmo" };
  else if (s >= 33.2) rafa = { pos: [2.6, 0, s < 45 ? 5.1 : 5.4], pose: "calmo" };
  if (rafa) objetos.push({ pos: [rafa.pos[0], 0.8, rafa.pos[2]], no: <Pessoa cam={cam} pos={rafa.pos} altura={rafa.pose === "sentado" ? 1.4 : 1.76} estilo={RAFA} pose={rafa.pose} t={s} /> });

  // sombras: aparecem e chegam perto da vitrine
  if (s >= 45) {
    const k = faixa(s, 45, 58);
    SOMBRAS.forEach((p, i) => {
      const pos: V3 = [p[0], 0, p[2] + (1 - k) * (5 + i)];
      objetos.push({ pos: [pos[0], 0.8, pos[2]], no: <Pessoa cam={cam} pos={pos} altura={1.7 + (i % 3) * 0.05} estilo={RAFA} pose="sombra" t={s} /> });
    });
  }

  // mãos e celular da Thaís
  let fone: React.ReactNode;
  let subida = 0;
  if (s >= 10.5 && s < 14.6) {
    fone = <TelaAlerta />;
    subida = Math.min(faixa(s, 10.5, 11.1), 1 - faixa(s, 14.0, 14.6));
  } else if (s >= 50 && s < 53) {
    fone = <TelaMensagem />;
    subida = faixa(s, 50, 50.6);
  } else if (s >= 56) {
    fone = <TelaMensagem />;
    subida = faixa(s, 56, 56.5);
  }
  const vibra = s >= 50 && s < 51.6 ? Math.sin(s * 90) * 9 : 0;
  const maosBaixas = !fone && (iPlano >= 9 && iPlano <= 17);
  const mostrarMaos = ![2, 4, 6, 8, 11, 13, 17, 18, 19, 23].includes(iPlano);

  const fadeEscolha = interpolate(s, [60, 60.6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // PEGADA SOMBRIA (pedido do usuário): cor apagada, névoa escura, tinta fria antes do alerta e
  // vermelha depois que o céu vira; lâmpada piscando; granulado
  const trevas = s < 9.3 ? 0 : s < 23.2 ? 0.28 * faixa(s, 9.3, 20) : 0.28 + 0.72 * faixa(s, 23.2, 24.2);
  const L = (a: number, b: number) => lerp(a, b, trevas);
  const nevoa: Nevoa = { perto: L(4, 2.2), longe: L(20, 13), min: L(0.8, 0.32) };
  const filtroCena = `saturate(${L(0.95, 0.75).toFixed(2)}) brightness(${L(1.0, 0.62).toFixed(2)}) contrast(${L(1.04, 1.22).toFixed(2)})`;
  const filtroMaos = `saturate(${L(0.95, 0.7).toFixed(2)}) brightness(${L(1.0, 0.62).toFixed(2)})`;
  const pisca = gold && s < 48 && Math.sin(s * 17.3) * Math.sin(s * 3.1 + 1) > 0.9 ? 0.28 : 0;
  const tvP = proj(cam, [-2.2, 2.15, -3.82]);
  const brilhoTV = tv === "alerta" && tvP.th < 1.5 ? 0.55 + Math.sin(s * 8) * 0.15 : 0;

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <radialGradient id="vinheta" cx="50%" cy="48%" r="72%">
            <stop offset="0.35" stopColor="#000" stopOpacity={0} />
            <stop offset="0.8" stopColor="#000" stopOpacity={L(0.18, 0.55)} />
            <stop offset="1" stopColor="#000" stopOpacity={L(0.45, 0.92)} />
          </radialGradient>
          <radialGradient id="luzTV" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#ff2a2a" stopOpacity={0.7} />
            <stop offset="1" stopColor="#ff2a2a" stopOpacity={0} />
          </radialGradient>
          <filter id="grao" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={frame % 13} />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>
        <g style={{ filter: filtroCena }}>
          <rect width={1080} height={1920} fill="#2a2724" />
          <Cenario cam={cam} prims={prims} objetos={objetos} linhas={linhas} nevoa={nevoa} />
          {det.textos.map((t, i) => (
            <TextoMundo key={i} cam={cam} centro={t.centro} larg={t.larg}>
              <Quadrinho tipo={t.tipo} />
            </TextoMundo>
          ))}
          {tv === "off" && (
            <TextoMundo cam={cam} centro={[-2.2, 2.15, -3.82]} larg={1.8}>
              <rect x={-180} y={-100} width={360} height={200} fill="#050507" />
            </TextoMundo>
          )}
        </g>
        {/* TV fora do filtro: ela é a luz da sala */}
        {tv !== "off" && (
          <TextoMundo cam={cam} centro={[-2.2, 2.15, -3.82]} larg={1.8}>
            <rect x={-180} y={-100} width={360} height={200} fill={tv === "alerta" ? "#a3001a" : "#2a5a32"} />
            {tv === "alerta" ? (
              <>
                <text y={-48} fontSize={30} fontWeight={900} fill="#fff">ALERTA NACIONAL</text>
                <text y={0} fontSize={24} fontWeight={800} fill="#fff">Fique onde está.</text>
                <text y={36} fontSize={20} fontWeight={800} fill="#fff">Feche portas e janelas.</text>
                <text y={80} fontSize={26} fontWeight={900} fill={Math.sin(s * 8) > 0 ? "#ffe66d" : "#fff"}>NÃO OLHE PARA O CÉU.</text>
              </>
            ) : (
              <>
                <line x1={-180} x2={180} y1={0} y2={0} stroke="#fff" strokeWidth={4} opacity={0.5} />
                <circle r={34} fill="none" stroke="#fff" strokeWidth={4} opacity={0.5} />
                <circle cx={-120 + ((s * 60) % 240)} cy={30 * Math.sin(s * 2)} r={8} fill="#fff" />
                <text y={-62} fontSize={24} fontWeight={900} fill="#fff">{"BRA  1 x 1  ARG  · 87'"}</text>
              </>
            )}
          </TextoMundo>
        )}
        {brilhoTV > 0 && <ellipse cx={tvP.x} cy={tvP.y} rx={520} ry={520} fill="url(#luzTV)" opacity={brilhoTV} style={{ mixBlendMode: "screen" }} />}
        {/* tinta: fria e cinza antes; vermelha depois do céu virar */}
        {trevas > 0 && <rect width={1080} height={1920} fill={gold ? "#ff4a3a" : "#6a7d92"} opacity={gold ? 0.5 * trevas : trevas * 0.9} style={{ mixBlendMode: "multiply" }} />}
        {escuro + pisca > 0 && <rect width={1080} height={1920} fill="#04050a" opacity={Math.min(0.8, escuro + pisca)} />}
        {mostrarMaos && (
          <g style={{ filter: filtroMaos }}>
            <MaosPOV baixo={maosBaixas} telefone={fone} subida={subida} tremor={vibra} />
          </g>
        )}
        {/* tela do celular acesa por cima (luz própria) */}
        {mostrarMaos && fone && (
          <g opacity={0.9} style={{ mixBlendMode: "screen" }}>
            <g transform={`translate(${560 + vibra} ${1540 + (1 - subida) * 760}) rotate(${-8 + vibra * 0.3}) scale(0.72)`}>{fone}</g>
          </g>
        )}
        <rect width={1080} height={1920} fill="url(#vinheta)" />
        <rect width={1080} height={1920} filter="url(#grao)" opacity={L(0.05, 0.13)} style={{ mixBlendMode: "overlay" }} />
        {flash > 0.01 && <rect width={1080} height={1920} fill="#ff2a1a" opacity={flash} />}
        {flashTV > 0.01 && <rect width={1080} height={1920} fill="#ff2030" opacity={flashTV} />}
      </svg>

      {!semTexto && <Tag />}
      {!semTexto && real < 6.0 && (
        <div
          style={{
            position: "absolute",
            top: 290,
            left: 60,
            right: 60,
            textAlign: "center",
            fontFamily: FONTE_TITULO,
            fontWeight: 800,
            fontSize: 74,
            lineHeight: 1.12,
            color: "#ffffff",
            textShadow: SOMBRA_SUAVE,
            opacity: Math.min(1, real / 0.3, (6.0 - real) / 0.3),
          }}
        >
          E se todo celular do Brasil tocasse ao mesmo tempo com o alerta: <span style={{ color: "#ff4a3d" }}>fique onde está</span>?
        </div>
      )}
      {!semTexto && <Legenda s={real} />}
      {!semTexto && <SonsAlerta cortes={PLANOS.slice(1).map(([d]) => paraReal(d))} fim={70.6} />}
      {!semTexto && s >= 60 && (
        <div style={{ position: "absolute", inset: 0, opacity: fadeEscolha }}>
          <EscolhaSombria />
        </div>
      )}
    </AbsoluteFill>
  );
};

const Tag: React.FC = () => (
  <div style={{ position: "absolute", top: 110, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
    <div style={{ background: "rgba(150,16,22,0.92)", borderRadius: 999, padding: "12px 44px", fontFamily: FONTE_TITULO, fontWeight: 800, fontSize: 46, letterSpacing: 6, color: "#fff", boxShadow: "0 8px 30px rgba(0,0,0,0.5)" }}>PARTE 01</div>
  </div>
);

const EscolhaSombria: React.FC = () => (
  <>
    <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)" }} />
    <div style={{ position: "absolute", top: 410, left: 0, right: 0, textAlign: "center", fontFamily: FONTE_TITULO, fontWeight: 800, fontSize: 80, color: "#fff", textShadow: SOMBRA_SUAVE }}>
      O que eles fazem<span style={{ color: "#ff4a3d" }}>?</span>
    </div>
    {[
      ["A", "Abrem a porta pro Rafa", 600],
      ["B", "Ficam trancados e ela responde", 880],
    ].map(([l, t, y]) => (
      <div key={l as string} style={{ position: "absolute", top: y as number, left: 80, right: 80, display: "flex", alignItems: "center", gap: 36, padding: "26px 44px", borderRadius: 28, background: "rgba(14,10,10,0.78)", border: "2px solid rgba(255,255,255,0.35)", boxShadow: "0 12px 40px rgba(0,0,0,0.55)" }}>
        <div style={{ fontFamily: FONTE_TITULO, fontWeight: 800, fontSize: 110, color: "#ff4a3d", lineHeight: 1 }}>{l}</div>
        <div style={{ fontFamily: FONTE_FORTE, fontWeight: 700, fontSize: 46, lineHeight: 1.2, color: "#fff" }}>{t}</div>
      </div>
    ))}
    <div style={{ position: "absolute", top: 1200, left: 60, right: 60, textAlign: "center", fontFamily: FONTE_FORTE, fontWeight: 500, fontSize: 44, color: "#f1ece4", textShadow: SOMBRA_SUAVE }}>
      Comenta <span style={{ color: "#ff4a3d", fontWeight: 800 }}>A</span> ou <span style={{ color: "#ff4a3d", fontWeight: 800 }}>B</span>. A parte 2 sai com a que ganhar.
    </div>
    <div style={{ position: "absolute", right: 56, bottom: 90, textAlign: "right", fontFamily: FONTE_TITULO, color: "rgba(255,255,255,0.88)", textShadow: SOMBRA_SUAVE }}>
      <div style={{ fontWeight: 800, fontSize: 44, letterSpacing: 3, lineHeight: 1.1 }}>MUNDO PARALELO</div>
      <div style={{ fontFamily: FONTE_FORTE, fontWeight: 500, fontSize: 28, opacity: 0.85 }}>@mundoparalelo.br</div>
    </div>
  </>
);
