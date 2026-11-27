import { loadFont } from "@remotion/google-fonts/Montserrat";
import { AbsoluteFill, Audio, Easing, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Acabamento, PalcoCinema } from "../../cinema/Palco";
import { Camera, Estudio } from "../Estudio";
import { Mascote3D, PoseMascote } from "../Mascote3D";
import dados from "../fase01-dados.json";

// Fase Extra, Fase 01: "Faltam 6 dias" e os números do GTA 6 (roteiro v3 aprovado em 13/11/2026).
// Narração: Eduardo (ElevenLabs), tempo por palavra do Whisper. Sem logo, cena ou trilha do jogo.
const { fontFamily } = loadFont("normal", { weights: ["600", "800", "900"], subsets: ["latin"] });
export const FPS = 30;
export const DURACAO_FASE01 = Math.ceil((dados.duracao + 1.2) * FPS);

const ROXO = "#B66BFF";
const ROSA = "#FF4FD8";
type V3 = [number, number, number];
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const suave = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
const entra = (t: number, a: number, d = 0.35) => interpolate(t, [a, a + d], [0, 1], { ...cl, easing: Easing.out(Easing.back(1.6)) });

// ---------- câmera: um plano novo a cada 1,5–3 s, sempre em movimento ----------
type Plano = { de: number; p0: V3; p1: V3; a0: V3; a1?: V3 };
const PLANOS: Plano[] = [
  { de: 0, p0: [0, 2.8, 9.5], p1: [0.35, 1.45, 3.4], a0: [0, 1.4, 0], a1: [0, 1.25, 0] }, // voo de entrada
  { de: 2.35, p0: [-0.7, 1.5, 3.1], p1: [-0.45, 1.55, 2.6], a0: [0, 1.3, 0] },
  { de: 5.1, p0: [0.28, 1.6, 1.35], p1: [0.2, 1.63, 1.15], a0: [0, 1.62, 0] }, // close
  { de: 6.75, p0: [-0.4, 1.58, 1.45], p1: [-0.3, 1.6, 1.25], a0: [0, 1.6, 0] },
  { de: 8.2, p0: [1.0, 0.45, 4.6], p1: [0.6, 0.5, 4.0], a0: [0, 1.5, 0] }, // rente ao chão
  { de: 10.9, p0: [-1.6, 1.3, 3.6], p1: [-0.9, 1.35, 3.9], a0: [0, 1.25, 0] },
  { de: 13.6, p0: [0.2, 5.0, 2.6], p1: [-0.2, 4.4, 2.2], a0: [0, 0.6, 0] }, // olho de deus
  { de: 16.0, p0: [-1.3, 1.4, 3.6], p1: [-1.0, 1.45, 3.2], a0: [0, 1.3, 0] },
  { de: 18.9, p0: [0.32, 1.6, 1.45], p1: [0.22, 1.62, 1.25], a0: [0, 1.6, 0] },
  { de: 21.2, p0: [1.5, 1.2, 4.8], p1: [1.1, 1.25, 4.2], a0: [0, 1.25, 0] },
  { de: 23.4, p0: [-0.5, 1.9, 2.6], p1: [-0.3, 1.85, 2.3], a0: [0, 1.45, 0] },
  { de: 25.3, p0: [-0.9, 0.7, 3.1], p1: [-0.6, 0.75, 2.7], a0: [0, 1.4, 0] },
  { de: 27.6, p0: [1.2, 1.5, 3.0], p1: [0.9, 1.5, 2.6], a0: [0, 1.4, 0] },
  { de: 29.1, p0: [0.3, 1.6, 1.4], p1: [0.22, 1.62, 1.2], a0: [0, 1.6, 0] },
  { de: 31.0, p0: [0, 1.3, 7.0], p1: [0, 1.58, 1.7], a0: [0, 1.45, 0], a1: [0, 1.6, 0] }, // empurrão do payoff
  { de: 33.4, p0: [1.6, 1.4, 2.6], p1: [-1.6, 1.4, 2.6], a0: [0, 1.4, 0] }, // órbita
  { de: 37.5, p0: [0.9, 1.4, 3.4], p1: [0.6, 1.42, 3.0], a0: [0, 1.3, 0] },
  { de: 40.5, p0: [-0.32, 1.6, 1.45], p1: [-0.24, 1.62, 1.25], a0: [0, 1.6, 0] },
  { de: 42.7, p0: [0.0, 1.5, 2.4], p1: [0.2, 1.6, 4.6], a0: [0, 1.3, 0] }, // afasta
  { de: 45.9, p0: [0.35, 1.3, 5.4], p1: [0.35, 1.3, 5.1], a0: [0, 0.98, 0] }, // cartaz final
];
const lerp3 = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
const cameraEm = (t: number) => {
  let i = 0;
  while (i + 1 < PLANOS.length && PLANOS[i + 1].de <= t) i++;
  const pl = PLANOS[i];
  const fim = i + 1 < PLANOS.length ? PLANOS[i + 1].de : dados.duracao + 1.2;
  const k = i === 0 || i === 14 ? suave(t, pl.de, pl.de + (i === 0 ? 2.2 : 2.0)) : interpolate(t, [pl.de, fim], [0, 1], cl);
  return { pos: lerp3(pl.p0, pl.p1, k), alvo: lerp3(pl.a0, pl.a1 ?? pl.a0, k), plano: i };
};

// ---------- gestos ----------
const poseEm = (t: number): PoseMascote => {
  const fala = Math.sin(t * 5.3);
  const base: PoseMascote = {
    bracoE: [0.02 - 0.12 * Math.max(0, fala), 0, -0.1],
    cotoveloE: 0.3 + 0.15 * fala,
    bracoD: [0.02, 0, 0.1],
    cotoveloD: 0.25,
    tronco: 0.012 * Math.sin(t * 1.7),
    cabeca: [0.03 * Math.sin(t * 2.9) + 0.025 * Math.sin(t * 6.3), 0.07 * Math.sin(t * 1.1), 0.02 * Math.sin(t * 0.9)],
  };
  const g = (a: number, b: number) => suave(t, a, a + 0.3) * (1 - suave(t, b - 0.3, b));
  // "absurdos": braços abertos
  const abre = g(2.3, 4.9);
  // dedo levantado: "o último eu deixei pro final"
  const dedo = g(5.2, 8.0);
  // aponta pro alto (placas): números
  const aponta = Math.max(g(8.3, 13.5), g(21.2, 25.1), g(25.4, 30.8), g(37.5, 42.5));
  // payoff: mãos na cabeça
  const susto = g(31.1, 37.2);
  // aceno final
  const acena = g(45.9, 53);
  return {
    ...base,
    bracoE: [base.bracoE![0] - abre * 0.6 - susto * 2.3, 0, -0.1 - abre * 0.9 - susto * 0.35],
    cotoveloE: (base.cotoveloE ?? 0) + abre * 0.2 + susto * 1.6,
    bracoD: [0.02 - abre * 0.6 - dedo * 1.1 - aponta * 2.2 - susto * 2.3 - acena * 0.9, 0, 0.1 + abre * 0.9 + dedo * 0.25 + aponta * 0.35 + susto * 0.35 + acena * (0.4 + 0.12 * Math.sin(t * 9))],
    cotoveloD: 0.25 + abre * 0.2 + dedo * 1.3 - aponta * 0.15 + susto * 1.6 + acena * 1.25,
    cabeca: [base.cabeca![0] - aponta * 0.12, base.cabeca![1] + aponta * 0.15, base.cabeca![2]],
  };
};

// ---------- 3D: estúdio com mais vida ----------
const Particulas: React.FC<{ t: number }> = ({ t }) => (
  <>
    {new Array(40).fill(0).map((_, i) => {
      const x = Math.sin(i * 12.9898) * 3.2;
      const z = -2.3 + ((i * 0.37) % 3.4);
      const y = ((i * 0.53 + t * (0.08 + (i % 5) * 0.02)) % 3.2) + 0.1;
      return (
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[0.012 + (i % 3) * 0.006, 8, 6]} />
          <meshStandardMaterial color={i % 3 ? ROXO : ROSA} emissive={i % 3 ? ROXO : ROSA} emissiveIntensity={2.5} />
        </mesh>
      );
    })}
  </>
);
const Colunas: React.FC<{ pulso: number }> = ({ pulso }) => (
  <>
    {[-2.4, -1.8, 1.8, 2.4].map((x, i) => (
      <group key={x} position={[x, 0, -1.6 - (i % 2) * 0.5]}>
        <mesh position={[0, 1.4, 0]} castShadow>
          <boxGeometry args={[0.16, 2.8, 0.16]} />
          <meshStandardMaterial color="#1C1236" roughness={0.6} metalness={0.3} />
        </mesh>
        <mesh position={[0, 1.4, 0.085]}>
          <boxGeometry args={[0.03, 2.6, 0.01]} />
          <meshStandardMaterial color={i % 2 ? ROSA : ROXO} emissive={i % 2 ? ROSA : ROXO} emissiveIntensity={2.4 + pulso * 3} />
        </mesh>
      </group>
    ))}
    {/* grade no chão */}
    {new Array(9).fill(0).map((_, i) => (
      <mesh key={i} position={[(i - 4) * 0.7, 0.004, -0.4]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.012, 6]} />
        <meshStandardMaterial color={ROXO} emissive={ROXO} emissiveIntensity={0.7} transparent opacity={0.5} />
      </mesh>
    ))}
  </>
);

// ---------- 2D: placas, selos, placar ----------
const sombra = "0 0 26px rgba(182,107,255,.85), 0 5px 0 #2B0F66, 0 0 6px rgba(0,0,0,.7)";
const Selo: React.FC<{ tipo: string; fonte: string; t: number; de: number }> = ({ tipo, fonte, t, de }) => {
  const k = entra(t, de, 0.25);
  const cor = tipo === "OFICIAL" ? "#4ADE80" : tipo === "ESTIMATIVA" ? "#FACC15" : "#38BDF8";
  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: 22, transform: `scale(${0.6 + 0.4 * k}) rotate(${(1 - k) * -8}deg)`, opacity: k }}>
      <div style={{ fontFamily, fontWeight: 800, fontSize: 34, letterSpacing: 3, color: "#111", background: cor, padding: "8px 22px", borderRadius: 10, boxShadow: `0 0 24px ${cor}88` }}>
        {tipo} <span style={{ fontWeight: 600, opacity: 0.8 }}>· {fonte}</span>
      </div>
    </div>
  );
};
const Placa: React.FC<{ t: number; de: number; ate: number; topo?: string; grande: string; tam?: number; sub?: string; children?: React.ReactNode; tremor?: number }> = ({ t, de, ate, topo, grande, tam = 190, sub, children, tremor = 0 }) => {
  if (t < de - 0.05 || t > ate + 0.05) return null;
  const k = entra(t, de);
  const sai = suave(t, ate - 0.18, ate);
  const tx = tremor * Math.sin(t * 61) * 10 * (1 - suave(t, de + 0.1, de + 0.8));
  return (
    <div style={{ position: "absolute", top: 230, left: 30, right: 30, textAlign: "center", color: "#fff", fontFamily, opacity: k * (1 - sai), transform: `translateX(${tx}px) scale(${0.7 + 0.3 * k + sai * 0.15})` }}>
      {topo && <div style={{ fontWeight: 800, fontSize: 50, letterSpacing: 8, color: "#E6D2FF", textShadow: sombra }}>{topo}</div>}
      <div style={{ fontWeight: 900, fontSize: tam, lineHeight: 0.95, letterSpacing: -3, textShadow: sombra }}>{grande}</div>
      {sub && <div style={{ fontWeight: 800, fontSize: 52, letterSpacing: 4, marginTop: 12, color: "#F3E8FF", textShadow: sombra }}>{sub}</div>}
      {children}
    </div>
  );
};
const Placar: React.FC<{ t: number }> = ({ t }) => {
  // 4 números do vídeo; o último fica com "?" até o payoff (loop aberto)
  if (t < 5.3 || t > 45.8) return null;
  const itens = [
    { r: "90 MI", de: 9.3 },
    { r: "+700 MI", de: 22.9 },
    { r: "+1 BI", de: 27.6 },
    { r: "3,2 BI", de: 33.5 },
  ];
  const k = entra(t, 5.3, 0.4);
  return (
    <div style={{ position: "absolute", top: 70, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 14, opacity: k * (1 - suave(t, 45.5, 45.8)) }}>
      {itens.map((it, i) => {
        const aberto = t >= it.de;
        const pop = aberto ? entra(t, it.de, 0.3) : 0;
        const ultimo = i === 3;
        return (
          <div key={i} style={{ fontFamily, fontWeight: 900, fontSize: 30, minWidth: 170, padding: "10px 12px", textAlign: "center", borderRadius: 14, color: aberto ? "#fff" : "#C9B3F5", background: aberto ? "rgba(91,45,184,.85)" : "rgba(20,10,40,.7)", border: `3px solid ${ultimo && !aberto ? ROSA : ROXO}`, boxShadow: aberto ? `0 0 ${18 + pop * 20}px ${ROXO}` : ultimo ? `0 0 ${14 + 10 * Math.abs(Math.sin(t * 4))}px ${ROSA}` : "none", transform: `scale(${1 + pop * 0.12 - (aberto ? (pop - 1) * 0 : 0)})` }}>
            {aberto ? it.r : "?"}
          </div>
        );
      })}
    </div>
  );
};
const Contador: React.FC<{ t: number }> = ({ t }) => {
  const v = Math.round(90421491 * interpolate(t, [8.6, 11.3], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) }));
  return <>{v.toLocaleString("pt-BR")}</>;
};
const Ano: React.FC<{ t: number }> = ({ t }) => {
  const a = Math.round(interpolate(t, [13.8, 15.3], [2023, 2026], { ...cl, easing: Easing.inOut(Easing.cubic) }));
  return <>{a}</>;
};

// ---------- legenda palavra por palavra ----------
const DESTAQUE = /^(6|absurdos|último|assusta|90|milhões|24|recorde|Guinness|3|anos|precedentes|700|1|bilhão|nunca|3,2|bilhões|primeiro|19|meia-noite|cidade|novidade|todo|dia|Fase|Extra|Vyce|madrugada)$/i;
const limpa = (w: string) => w.replace(/[.,?!:]/g, "");
type Palavra = { w: string; s: number; e: number };
const PAL = dados.palavras as Palavra[];
const BLOCOS: Palavra[][] = (() => {
  const b: Palavra[][] = [];
  let cur: Palavra[] = [];
  PAL.forEach((p, i) => {
    cur.push(p);
    const prox = PAL[i + 1];
    if (cur.length >= 3 || /[.,?!:]$/.test(p.w) || !prox || prox.s - p.e > 0.35) {
      b.push(cur);
      cur = [];
    }
  });
  return b;
})();
const Legenda: React.FC<{ t: number }> = ({ t }) => {
  const bloco = BLOCOS.find((b, i) => t >= b[0].s - 0.05 && t < (BLOCOS[i + 1]?.[0].s ?? b[b.length - 1].e + 0.6) - 0.05 && t < b[b.length - 1].e + 0.6);
  if (!bloco) return null;
  return (
    <div style={{ position: "absolute", top: 1430, left: 40, right: 40, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 22px" }}>
      {bloco.map((p, i) => {
        const ativo = t >= p.s;
        const dest = DESTAQUE.test(limpa(p.w));
        const pulo = ativo ? interpolate(t, [p.s, p.s + 0.12, p.s + 0.24], [0.8, 1.12, 1], cl) : 1;
        return (
          <span key={i} style={{ fontFamily, fontWeight: 800, fontSize: 86, lineHeight: 1.1, color: dest ? "#D9A8FF" : "#fff", opacity: ativo ? 1 : 0.0, transform: `scale(${pulo})`, display: "inline-block", WebkitTextStroke: "10px #000", paintOrder: "stroke fill", textShadow: dest ? "0 0 22px rgba(182,107,255,.9)" : "0 6px 10px rgba(0,0,0,.6)" }}>
            {p.w.replace(/[.,]$/, "")}
          </span>
        );
      })}
    </div>
  );
};

// ---------- sons: só nas pausas da voz ----------
const falando = (t: number) => PAL.some((p) => t >= p.s - 0.05 && t <= p.e + 0.05);
const SONS: { s: string; t: number; v: number }[] = [
  { s: "whoosh", t: 0.05, v: 0.5 },
  { s: "dum", t: 0.25, v: 0.55 },
  { s: "whoosh", t: 4.95, v: 0.35 },
  { s: "carimbo", t: 12.25, v: 0.4 },
  { s: "whoosh", t: 15.6, v: 0.35 },
  { s: "carimbo", t: 22.9, v: 0.35 },
  { s: "whoosh", t: 25.0, v: 0.3 },
  { s: "carimbo", t: 27.6, v: 0.35 },
  { s: "whoosh", t: 30.75, v: 0.4 },
  { s: "dum", t: 33.45, v: 0.6 },
  { s: "whoosh", t: 37.2, v: 0.35 },
  { s: "whoosh", t: 45.55, v: 0.4 },
];

export const VideoFase01: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const { pos, alvo, plano } = cameraEm(t);
  const boca = (dados.boca as number[])[f] ?? 0;
  const pisca = [1.9, 6.4, 11.7, 17.3, 24.1, 29.8, 36.2, 41.1, 47.2].some((p) => t > p && t < p + 0.12);
  const pulso = Math.max(0, 1 - Math.abs(t - 33.5) * 2) + Math.max(0, 1 - Math.abs(t - 0.3) * 2);
  // flash de luz no payoff e no gancho
  const flash = Math.max(interpolate(t, [33.45, 33.55, 34.1], [0, 0.55, 0], cl), interpolate(t, [0.2, 0.3, 0.8], [0, 0.35, 0], cl));
  // corte seco: um quadro de "piscar" escuro no início de cada plano (exceto voos contínuos)
  const corte = PLANOS.some((p, i) => i > 0 && i !== 15 && t >= p.de && t < p.de + 1 / FPS) ? 0.25 : 0;
  // tremor da câmera no payoff
  const treme = interpolate(t, [33.45, 34.4], [1, 0], cl) * (t > 33.45 ? 1 : 0);
  const camPos: V3 = [pos[0] + Math.sin(t * 57) * 0.03 * treme, pos[1] + Math.cos(t * 49) * 0.03 * treme, pos[2]];
  return (
    <AbsoluteFill style={{ background: "#0E0820" }}>
      <PalcoCinema ceu="estudio" fundo="#120B22" fov={plano === 6 ? 40 : 30} luzCeu={0.3} brilhoCeu={0.05}>
        <Camera pos={camPos} alvo={alvo} />
        <Estudio />
        <Colunas pulso={pulso} />
        <Particulas t={t} />
        <Mascote3D giro={0.1 + 0.08 * Math.sin(t * 0.7)} pose={poseEm(t)} boca={boca * 0.95} pisca={pisca} olhar={0.15 * Math.sin(t * 0.8)} />
        <Acabamento foco={Math.hypot(camPos[0], camPos[1] - 1.4, camPos[2])} desfoque={5} brilho={0.75} saturacao={0.12} contraste={0.12} vinheta={0.5} ao={0} />
      </PalcoCinema>

      {/* gancho */}
      <Placa t={t} de={0.0} ate={5.0} topo="FALTAM" grande="6 DIAS" tam={250} sub="PRO GTA 6" tremor={1} />
      {/* loop aberto */}
      <Placa t={t} de={5.2} ate={8.15} grande="O ÚLTIMO" tam={130} sub="ASSUSTA" />
      {/* trailer */}
      <Placa t={t} de={8.25} ate={13.55} topo="TRAILER 1 · 24 HORAS" grande="" tam={10}>
        <div style={{ fontWeight: 900, fontSize: 132, letterSpacing: -2, textShadow: sombra }}>
          <Contador t={t} />
        </div>
        <div style={{ fontWeight: 800, fontSize: 52, letterSpacing: 6, color: "#F3E8FF", textShadow: sombra }}>VIEWS NO YOUTUBE</div>
        <Selo tipo="OFICIAL" fonte="RECORDE GUINNESS" t={t} de={12.25} />
      </Placa>
      <Placa t={t} de={13.65} ate={15.9} topo="FAZ QUASE" grande="" tam={10}>
        <div style={{ fontWeight: 900, fontSize: 230, letterSpacing: -4, textShadow: sombra }}>
          <Ano t={t} />
        </div>
        <div style={{ fontWeight: 800, fontSize: 60, letterSpacing: 6, textShadow: sombra }}>3 ANOS DE ESPERA</div>
      </Placa>
      {/* pré-vendas */}
      <Placa t={t} de={16.0} ate={21.1} topo="PRÉ-VENDAS" grande="“SEM PRECEDENTES”" tam={96}>
        <Selo tipo="OFICIAL" fonte="TAKE-TWO, 09/11" t={t} de={20.1} />
      </Placa>
      <Placa t={t} de={21.2} ate={25.2} topo="PRÉ-VENDAS" grande="+US$ 700 MI" tam={150}>
        <Selo tipo="ESTIMATIVA" fonte="SENSOR TOWER" t={t} de={22.9} />
      </Placa>
      {/* custo */}
      <Placa t={t} de={25.3} ate={30.9} topo="CUSTO PRA FAZER" grande="+US$ 1 BI" tam={170}>
        <Selo tipo="ESTIMATIVA" fonte="ANALISTAS" t={t} de={27.6} />
        {t > 29.5 && <div style={{ fontWeight: 800, fontSize: 46, marginTop: 18, color: "#FFD1F4", textShadow: sombra, opacity: entra(t, 29.5) }}>A ROCKSTAR NUNCA CONFIRMOU</div>}
      </Placa>
      {/* payoff */}
      <Placa t={t} de={31.0} ate={33.4} grande="O NÚMERO" tam={140} sub="QUE ASSUSTA…" />
      <Placa t={t} de={33.45} ate={37.4} topo="SÓ NO 1º ANO" grande="US$ 3,2 BI" tam={190} tremor={1.6}>
        <Selo tipo="PREVISÃO" fonte="DFC INTELLIGENCE" t={t} de={34.6} />
      </Placa>
      {/* data */}
      <Placa t={t} de={37.5} ate={42.6} topo="19/11" grande="00:00" tam={230} sub="NO HORÁRIO DA SUA CIDADE">
        {t > 40.5 && <div style={{ fontWeight: 800, fontSize: 52, marginTop: 14, letterSpacing: 4, textShadow: sombra, opacity: entra(t, 40.5) }}>PS5 · XBOX SERIES</div>}
        <Selo tipo="OFICIAL" fonte="ROCKSTAR" t={t} de={38.4} />
      </Placa>
      {/* promessa */}
      <Placa t={t} de={42.7} ate={45.8} topo="AQUI NA FASE EXTRA" grande="NOVIDADE" tam={150} sub="TODO DIA" />
      {/* final */}
      <Placa t={t} de={45.9} ate={dados.duracao + 1.3} topo="VOCÊ ESTÁ NA" grande="FASE EXTRA" tam={150} sub="COM VYCE" />

      <Placar t={t} />
      <Legenda t={t} />

      {/* flash e corte */}
      <AbsoluteFill style={{ background: "#F5E9FF", opacity: flash, pointerEvents: "none" }} />
      <AbsoluteFill style={{ background: "#000", opacity: corte, pointerEvents: "none" }} />

      <Audio src={staticFile("fase-extra/fase01/narracao.wav")} />
      {SONS.map((s, i) => (
        <Sequence key={i} from={Math.round(s.t * FPS)} durationInFrames={60}>
          <Audio src={staticFile(`fase-extra/sons/${s.s}.wav`)} volume={(q) => s.v * (falando(s.t + q / FPS) ? 0.25 : 1)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
