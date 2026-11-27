import { loadFont } from "@remotion/google-fonts/Montserrat";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { Camera } from "../Estudio";
import { CorPele, Mascote3D, PoseMascote } from "../Mascote3D";
import dados from "./dados.json";


// Fase Extra, Fase 49: "8 mecânicas secretas do GTA 6 que o jogo não te conta" — gameplay de um vídeo brasileiro (ClickBait GamePlay),
// com seleção, ordem, texto, voz e edição nossos. clipes/jogo.mp4 = o vídeo inteiro em 30 fps. Jogo inteiro, sem zoom.
// Os planos evitam o número dele no canto (começo de cada dica dele); o quadro de cores dele (527–540 s) fica coberto pelo nosso cartão.
// Lista "SEGREDO n/8" + cartão do botão (PlayStation), barra de progresso, legenda viva. Ele narra tudo: sem som do jogo.
const { fontFamily } = loadFont("normal", { weights: ["600", "800", "900"], subsets: ["latin"] });
export const FPS = 30;
const FIM = dados.duracao + 1.2;
export const DURACAO_FASE49 = Math.ceil(FIM * FPS);
const AMARELO = "#FFD84A";
const VERDE = "#7CFF9B";
const ROSA = "#FF7EB6";
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const suave = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
const entra = (t: number, a: number, d = 0.3) => interpolate(t, [a, a + d], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) });
const sombra = "0 4px 22px rgba(0,0,0,.8)";
const ARQ = (n: string) => `fase-extra/fase49/${n}`;


// ---------- âncoras ----------
type Pal = { w: string; s: number; e: number };
const PAL = dados.palavras as Pal[];
const limpa = (w: string) => w.toLowerCase().replace(/[.,?!:…“”"]/g, "");
const em = (palavra: string, depois = 0) => PAL.find((p) => limpa(p.w) === palavra && p.s >= depois)?.s ?? 999;
const K = [em("um", 5), em("dois"), em("três", 20), em("quatro"), em("cinco"), em("seis"), em("sete"), em("oito", 50)];
const FINAL = em("você", em("jiu-jitsu")) - 0.15;
const ENQ = em("e", em("vyce", FINAL));

// ---------- planos (s = segundo do vídeo ORIGINAL) ----------
type Plano = { de: number; s: number; v?: 1 | 2; luz?: number; mapa?: number; soco?: boolean };
const PLANOS: Plano[] = [
  { de: 0, s: 615.0, soco: true },
  { de: em("a", 3) - 0.1, s: 328.5 },
  // 1 · conserto grátis (Scooter Bros Premium)
  { de: K[0] - 0.1, s: 586.0 },
  { de: em("no", K[0]) - 0.1, s: 592.5 },
  { de: em("premium") - 0.1, s: 600.5 },
  { de: em("aí", K[0]) - 0.1, s: 605.5 },
  { de: em("o", em("dia")) - 0.1, s: 615.0, soco: true },
  // 2 · sair e deixar ligado
  { de: K[1] - 0.1, s: 84.5 },
  { de: em("e", em("vezes", K[1])) - 0.1, s: 88.0 },
  { de: em("perfeito") - 0.1, s: 92.0 },
  // 3 · piloto automático
  { de: K[2] - 0.1, s: 139.0 },
  { de: em("segura", K[2]) - 0.1, s: 144.0 },
  { de: em("ele", K[2]) - 0.1, s: 151.0 },
  // 4 · snorkel
  { de: K[3] - 0.1, s: 634.0 },
  { de: em("é", K[3]) - 0.1, s: 640.0 },
  { de: em("deixa", K[3]) - 0.1, s: 646.5 },
  // 5 · binóculo + foco
  { de: K[4] - 0.1, s: 480.5 },
  { de: em("marca", K[4]) - 0.1, s: 486.0 },
  { de: em("ainda", K[4]) - 0.1, s: 505.5 },
  // 6 · as cores do modo foco (o quadro dele aparece a partir de 527 s: fica embaixo do nosso cartão)
  { de: K[5] - 0.1, s: 520.2 },
  // 7 · prédio azul escuro
  { de: K[6] - 0.1, s: 729.0 },
  { de: em("azul", em("entrar")) - 0.1, s: 738.0 },
  // 8 · golpes
  { de: K[7] - 0.1, s: 327.6 },
  { de: em("joga") - 0.1, s: 330.3, soco: true },
  { de: em("e", em("ponte")) - 0.1, s: 389.0 },
  { de: em("jiu-jitsu") - 0.1, s: 404.0 },
];
PLANOS.sort((a, b) => a.de - b.de);
const planoEm = (t: number) => {
  let i = -1;
  while (i + 1 < PLANOS.length && PLANOS[i + 1].de <= t) i++;
  return i;
};
const VIDEO = staticFile(ARQ("clipes/jogo.mp4"));
const fonte = (_v?: 1 | 2) => VIDEO;
const CHEIO = 1920 / 1080;
const Quadro: React.FC<{ s: number; k: number; filtro?: string; v?: 1 | 2 }> = ({ s, k, filtro, v }) => {
  const w = 1920 * k;
  const h = (w * 1080) / 1920;
  return <OffthreadVideo src={fonte(v)} startFrom={Math.round(s * FPS)} muted style={{ position: "absolute", left: 540 - w / 2, top: 960 - h / 2, width: w, height: h, filter: filtro }} />;
};
const CLARO = (luz: number) => `brightness(${luz}) contrast(1.06) saturate(1.15)`;
const esc = 1080 / 1920;
// mapas parados (segundo do original) e o ponto exato de cada lugar no quadro 1920x1080
const MAPAS: [string, number, number][] = [["", 0, 0]];
// o jogo inteiro na largura (sem zoom); nos momentos fortes ("soco"): flash branco + leve avanço que volta em 0,4 s
const Janela: React.FC<{ s: number; z: number; luz?: number; mapa?: number; t: number; soco?: number; v?: 1 | 2; num?: number }> = ({ s, z, luz = 1.05, mapa, t, soco = 0, v, num }) => {
  const H = 1080 * esc;
  const MARCA = MAPAS[mapa ?? 0];
  const pulso = (t * 1.6) % 1;
  return (
    <div style={{ position: "absolute", left: 0, top: 960 - H / 2, width: 1080, height: H, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,.6)" }}>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${z + 0.06 * soco})` }}>
        {mapa ? (
          <>
            <Img src={staticFile(ARQ(`mapas/${MARCA[0]}`))} style={{ position: "absolute", left: 0, top: 0, width: 1080, height: H }} />
            <div style={{ position: "absolute", left: MARCA[1] * esc - 60, top: MARCA[2] * esc - 60, width: 120, height: 120 }}>
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `7px solid ${ROSA}`, boxShadow: `0 0 18px ${ROSA}` }} />
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `5px solid ${ROSA}`, transform: `scale(${1 + 0.8 * pulso})`, opacity: 1 - pulso }} />
              <div style={{ position: "absolute", left: 60 - 80, top: -66, width: 160, textAlign: "center", fontFamily, fontWeight: 900, fontSize: 34, color: "#fff", WebkitTextStroke: "7px #000", paintOrder: "stroke fill" }}>AQUI ▼</div>
            </div>
          </>
        ) : (
          <OffthreadVideo src={fonte(v)} startFrom={Math.round(s * FPS)} muted style={{ position: "absolute", left: 0, top: 0, width: 1080, height: H, filter: CLARO(luz) }} />
        )}
      </div>
      {/* o vídeo base põe o número da dica dele num círculo no canto de cima: coberto pelo NOSSO número */}
      {num ? <div style={{ position: "absolute", left: 127 * z - 68, top: 127 * z - 68, width: 136, height: 136, borderRadius: 68, background: AMARELO, color: "#111", fontFamily, fontWeight: 900, fontSize: 64, lineHeight: "136px", textAlign: "center", boxShadow: "0 4px 18px rgba(0,0,0,.6)" }}>{num}</div> : null}
      {soco > 0 && <div style={{ position: "absolute", inset: 0, background: "#fff", opacity: 0.85 * soco * soco }} />}
    </div>
  );
};
const Fundo: React.FC<{ t: number }> = ({ t }) => {
  const i = planoEm(t);
  if (i < 0 || t > FINAL + 0.3) return null;
  const p = PLANOS[i];
  const fim = Math.min(PLANOS[i + 1]?.de ?? FIM, FINAL + 0.3);
  const z = 1 + 0.02 * interpolate(t, [p.de, fim], [0, 1], { ...cl, easing: Easing.inOut(Easing.sin) });
  const soco = p.soco ? 1 - suave(t, p.de, p.de + 0.4) : 0;
  const dur = Math.max(1, Math.round((fim - p.de) * FPS) + 2);
  return (
    <Sequence key={i} from={Math.round(p.de * FPS)} durationInFrames={dur} layout="none">
      <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
        <AbsoluteFill style={{ transform: "scale(1.15)" }}>
          <Quadro s={p.s} v={p.v} k={CHEIO} filtro="blur(30px) brightness(0.95)" />
        </AbsoluteFill>
        <Janela s={p.s} v={p.v} z={z} luz={p.luz} mapa={p.mapa} t={t} soco={soco} num={K.findIndex((de, j) => p.de >= de - 0.15 && p.de < (K[j + 1] ?? FINAL) - 0.15) + 1 || (p.de < K[0] ? 8 : undefined)} />
      </AbsoluteFill>
    </Sequence>
  );
};

// ---------- barra de progresso fininha no topo (dá a sensação de "falta pouco") ----------
const Progresso: React.FC<{ t: number }> = ({ t }) => {
  if (t >= FINAL) return null;
  const k = Math.min(1, t / FINAL);
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 170, height: 8, borderRadius: 4, background: "rgba(255,255,255,.18)" }}>
      <div style={{ width: `${k * 100}%`, height: "100%", borderRadius: 4, background: `linear-gradient(90deg, ${ROSA}, ${AMARELO})`, boxShadow: `0 0 12px ${AMARELO}` }} />
    </div>
  );
};

// ---------- título (em cima) ----------
type Tela = { de: number; ate: number; n?: string; rotulo?: string; cor: string; titulo: string; nota?: string };
const TELAS: Tela[] = [
  { de: 0.05, ate: K[0] - 0.05, rotulo: "O JOGO NÃO TE CONTA", cor: AMARELO, titulo: "8 SEGREDOS DO GTA 6" },
];
const Titulos: React.FC<{ t: number }> = ({ t }) => {
  const tela = TELAS.find((x) => t >= x.de - 0.05 && t < x.ate);
  if (!tela) return null;
  const k = entra(t, tela.de, 0.25);
  const s = suave(t, tela.ate - 0.12, tela.ate);
  const n = tela.titulo.length;
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: 250, textAlign: "center", fontFamily, opacity: k * (1 - s) }}>
      {tela.rotulo && <div style={{ fontWeight: 800, fontSize: 32, letterSpacing: 5, color: tela.cor, textShadow: sombra, marginBottom: 6, transform: `translateY(${(1 - k) * 16}px)` }}>{tela.rotulo}</div>}
      <div style={{ fontWeight: 900, fontSize: n > 22 ? 70 : n > 16 ? 80 : 92, lineHeight: 1.02, letterSpacing: -1, color: "#fff", WebkitTextStroke: "8px #000", paintOrder: "stroke fill", textShadow: sombra, transform: `translateY(${(1 - k) * 20}px) scale(${0.94 + 0.06 * k})` }}>{tela.titulo}</div>
    </div>
  );
};

// ---------- "SEGREDO n/8" + título + cartão do botão (PlayStation) ----------
const SEGREDOS: [string, string][] = [
  ["CONSERTO GRÁTIS", "APP SCOOTER BROS · PREMIUM US$ 12.500 · 3 GRÁTIS POR DIA"],
  ["DESCE COM O CARRO LIGADO", "PS: △ △"],
  ["PILOTO AUTOMÁTICO", "PS: SEGURA ↓ · OPTIONS · SEGURA ○"],
  ["SNORKEL NA OFF-ROAD", "OFICINA DE OFF-ROAD · US$ 510 A 570"],
  ["BINÓCULO + MODO FOCO", "PS: L3 + R3 NO BINÓCULO"],
  ["AS CORES DO MODO FOCO", ""],
  ["PRÉDIO AZUL ESCURO", "AZUL ESCURO = ENTRA · AZUL CLARO = NÃO"],
  ["GOLPES ESCONDIDOS", "JASON: R2 R2 NO PARAPEITO · LÚCIA: □ POR TRÁS"],
];
const fimK = (i: number) => K[i + 1] ?? FINAL;
const Segredo: React.FC<{ t: number }> = ({ t }) => {
  const i = K.findIndex((de, j) => t >= de - 0.1 && t < fimK(j) - 0.1);
  if (i < 0) return null;
  const [titulo, botao] = SEGREDOS[i];
  const de = K[i] - 0.1;
  const k = entra(t, de, 0.25);
  const s2 = suave(t, fimK(i) - 0.25, fimK(i) - 0.1);
  const kn = interpolate(t, [de, de + 0.35], [0, 1], { ...cl, easing: Easing.out(Easing.back(2)) });
  return (
    <>
      <div style={{ position: "absolute", left: 40, right: 40, top: 220, textAlign: "center", fontFamily, opacity: k * (1 - s2) }}>
        <div style={{ display: "inline-block", padding: "6px 22px", borderRadius: 40, background: AMARELO, color: "#111", fontWeight: 900, fontSize: 40, letterSpacing: 2, transform: `scale(${kn})`, boxShadow: "0 6px 24px rgba(0,0,0,.6)" }}>SEGREDO {i + 1}/8</div>
        <div style={{ marginTop: 12, fontWeight: 900, fontSize: titulo.length > 20 ? 74 : 86, lineHeight: 1.02, color: "#fff", WebkitTextStroke: "8px #000", paintOrder: "stroke fill", textShadow: sombra, transform: `translateY(${(1 - k) * 20}px)` }}>{titulo}</div>
      </div>
      {botao && (
        <div style={{ position: "absolute", left: 60, right: 60, top: 1255, textAlign: "center", fontFamily, opacity: entra(t, de + 0.3, 0.25) * (1 - s2) }}>
          <span style={{ display: "inline-block", padding: "10px 24px", borderRadius: 14, background: "rgba(10,6,20,.88)", border: `3px solid ${AMARELO}`, color: "#fff", fontWeight: 900, fontSize: 36, letterSpacing: 1 }}>{botao}</span>
        </div>
      )}
      {i === 5 && <Cores t={t} de={de} />}
    </>
  );
};
// o nosso cartão das cores do modo foco, em cima do canto onde o vídeo base põe o quadro dele
const CORES: [string, string, string][] = [
  ["laranja", "#FF9A2E", "DÁ PRA ROUBAR"],
  ["verde", "#4BE37A", "FUNCIONÁRIO (SENHA DO COFRE)"],
  ["azul", "#4FA3FF", "SEGURANÇA"],
  ["vermelho", "#FF4B4B", "CÂMERA, ALARME, POLÍCIA"],
];
const Cores: React.FC<{ t: number; de: number }> = ({ t, de }) => (
  <div style={{ position: "absolute", left: 0, top: 1040, width: 560, padding: "16px 22px", background: "rgba(10,6,20,.94)", borderRight: `6px solid ${AMARELO}`, borderRadius: "0 18px 18px 0", fontFamily, opacity: entra(t, de, 0.2) }}>
    {CORES.map(([palavra, cor, txt], j) => {
      const q = em(palavra, de);
      const on = t >= q - 0.1;
      return (
        <div key={j} style={{ display: "flex", alignItems: "center", gap: 14, marginTop: j ? 8 : 0, opacity: on ? 1 : 0.35 }}>
          <div style={{ width: 30, height: 30, borderRadius: 15, background: cor, boxShadow: on ? `0 0 14px ${cor}` : "none" }} />
          <div style={{ fontWeight: 900, fontSize: 30, color: on ? "#fff" : "#aaa" }}>{txt}</div>
        </div>
      );
    })}
  </div>
);

// ---------- legenda (embaixo): a palavra falada acende e dá um pulinho ----------
const BLOCOS: Pal[][] = (() => {
  const b: Pal[][] = [];
  let c: Pal[] = [];
  PAL.forEach((p, i) => {
    c.push(p);
    const n = PAL[i + 1];
    if (c.length >= 3 || /[.,?!:…”]$/.test(p.w) || !n || n.s - p.e > 0.35) {
      b.push(c);
      c = [];
    }
  });
  return b;
})();
const Legenda: React.FC<{ t: number }> = ({ t }) => {
  if (t >= FINAL) return null;
  const i = BLOCOS.findIndex((b, j) => t >= b[0].s - 0.05 && t < Math.min(BLOCOS[j + 1]?.[0].s ?? 999, b[b.length - 1].e + 0.5) - 0.05);
  if (i < 0) return null;
  return (
    <div style={{ position: "absolute", top: 1560, left: 50, right: 50, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 24px" }}>
      {BLOCOS[i].map((p, j) => {
        const fala = t >= p.s - 0.03 && t < p.e + 0.05;
        const pulo = interpolate(t, [p.s - 0.03, p.s + 0.07, p.s + 0.17], [1, 1.1, 1.03], cl);
        return (
          <span key={j} style={{ display: "inline-block", fontFamily, fontWeight: 900, fontSize: 66, lineHeight: 1.1, color: fala ? AMARELO : "#fff", opacity: t >= p.s - 0.03 ? 1 : 0, transform: `scale(${fala ? pulo : 1})`, WebkitTextStroke: "10px #000", paintOrder: "stroke fill" }}>
            {p.w.replace(/[.,:!]$/, "")}
          </span>
        );
      })}
    </div>
  );
};

// ---------- final: o Vyce DENTRO do GTA, com o carro consertado ----------
const boca = (f: number) => (dados.boca as number[])[f] ?? 0;
const pisca = (t: number) => {
  const c = t % 4.3;
  return c > 1.4 && c < 1.52;
};
const OPCOES: [string, string, string, string][] = [
  ["1", "🚗", "O CONSERTO GRÁTIS", VERDE],
  ["2", "🥋", "OS GOLPES", ROSA],
];
const VyceNoGta: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  if (t < FINAL - 0.2) return null;
  const k = suave(t, FINAL - 0.2, FINAL + 0.3);
  const fala = Math.sin(t * 5.5);
  const aponta = suave(t, ENQ - 0.2, ENQ + 0.1) * (1 - suave(t, ENQ + 1.6, ENQ + 1.9));
  const pose: PoseMascote = {
    bracoD: [-0.3 - 0.9 * aponta, 0, 0.35 + 0.12 * fala + 0.9 * aponta],
    bracoE: [-0.25, 0, -0.3 - 0.1 * Math.sin(t * 4.3)],
    cotoveloD: 0.9 - 0.6 * aponta,
    cotoveloE: 0.8,
    tronco: 0.03 * Math.sin(t * 2.4),
    cabeca: [0.04 * Math.sin(t * 3.1), 0.08 * Math.sin(t * 1.3), 0.04 * Math.sin(t * 2.2)],
  };
  const fov = (2 * Math.atan(1920 / 560 / 2 / 6) * 180) / Math.PI;
  return (
    <AbsoluteFill style={{ opacity: k, background: "#000", overflow: "hidden" }}>
      <Sequence from={Math.round((FINAL - 0.2) * FPS)} layout="none">
        <AbsoluteFill style={{ transformOrigin: "50% 0%", transform: `scale(${1.3 + 0.04 * suave(t, FINAL, FIM)})` }}>
          <Quadro s={616.0} k={CHEIO} filtro="blur(5px) brightness(1.05) saturate(1.1)" />
        </AbsoluteFill>
      </Sequence>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.65) 0%, rgba(0,0,0,.2) 35%, rgba(0,0,0,0) 60%, rgba(0,0,0,.45) 100%)" }} />
      <AbsoluteFill>
        <ThreeCanvas width={1080} height={1920} camera={{ fov, near: 0.05, far: 50 }} gl={{ toneMapping: THREE.ACESFilmicToneMapping, antialias: true, alpha: true }}>
          <Camera pos={[0, 1.2, 6]} alvo={[0, 1.05, 0]} />
          <hemisphereLight args={["#FFF1DE", "#4A3A2E", 1.1]} />
          <directionalLight position={[-2, 5, 4]} intensity={2.2} color="#FFF2DE" />
          <directionalLight position={[2.5, 3, -2]} intensity={1.3} color="#FFC0E8" />
          <CorPele.Provider value={{ pele: "#D9A584", funda: "#C48E6C" }}>
            <Mascote3D pos={[0.05, -0.62 * (1 - suave(t, FINAL - 0.1, FINAL + 0.35)) - 0.52, 0]} giro={-0.08 + 0.05 * Math.sin(t * 0.9)} pose={pose} boca={boca(f)} pisca={pisca(t)} olhar={0.6} sorriso />
          </CorPele.Provider>
        </ThreeCanvas>
      </AbsoluteFill>
      <div style={{ position: "absolute", top: 230, left: 70, right: 70, fontFamily, color: "#fff" }}>
        <div style={{ fontWeight: 800, fontSize: 32, letterSpacing: 8, color: "#E2C4FF", textShadow: sombra, opacity: entra(t, FINAL) }}>VOCÊ ESTÁ NA FASE EXTRA</div>
        <div style={{ fontWeight: 900, fontSize: 92, lineHeight: 1, textShadow: sombra, opacity: entra(t, ENQ - 0.2) }}>E AÍ?</div>
        <div style={{ marginTop: 10 }}>
          {OPCOES.map(([n, ic, txt, cor], i) => {
            const kk = entra(t, em(i === 0 ? "qual" : "sabia", ENQ) - 0.15);
            return (
              <div key={n} style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 14, opacity: kk, transform: `translateX(${(1 - kk) * -40}px)`, width: "fit-content", background: "rgba(10,6,20,.8)", borderLeft: `8px solid ${cor}`, borderRadius: 12, padding: "8px 22px 8px 16px" }}>
                <span style={{ fontWeight: 900, fontSize: 42, color: cor }}>{n}</span>
                <span style={{ fontSize: 44 }}>{ic}</span>
                <span style={{ fontWeight: 900, fontSize: 42 }}>{txt}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 110, left: 0, right: 0, textAlign: "center", fontFamily, fontWeight: 900, fontSize: 44, color: "#fff", textShadow: sombra, opacity: entra(t, FINAL + 0.6) }}>FASE EXTRA · @faseextra.br</div>
    </AbsoluteFill>
  );
};



// ---------- memes do banco (inserto curto, pulando) ----------
const MEMES: [number, number, string, number][] = [
  [em("premium") + 0.3, 1.3, "roll-safe-think-about-it.jpg", 702 / 395],
];

const pula = (t: number, a: number) => interpolate(t, [a, a + 0.12, a + 0.22], [0, 1.15, 1], cl);
const Memes: React.FC<{ t: number }> = ({ t }) => {
  const m = MEMES.find(([q, d]) => t >= q && t < q + d);
  if (!m) return null;
  const [q, d, arq, prop] = m;
  const w = 420;
  const k = pula(t, q) * (1 - suave(t, q + d - 0.12, q + d));
  return (
    <div style={{ position: "absolute", left: 540 - w / 2, top: 1150, width: w, height: w / prop, borderRadius: 18, overflow: "hidden", border: "8px solid #fff", boxShadow: "0 20px 50px rgba(0,0,0,.7)", transform: `scale(${k}) rotate(-3deg)` }}>
      <Img src={staticFile(ARQ(`memes/${arq}`))} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </div>
  );
};



// ---------- som (regra nova, desde a Fase 47): sem whoosh automático; memes sonoros nas viradas + música ~0,2 ----------
// O criador do vídeo base narra tudo: sem som do jogo nesta Fase.
const VIRAL = (n: string) => `fase-extra/sons/virais/${n}.wav`;
const BANCO = (n: string) => `fase-extra/banco/sons/${n}.wav`;
const SONS: [number, string, number, number?][] = [
  ...K.map((q) => [q - 0.05, VIRAL("click"), 0.25] as [number, string, number]),
  [K[0] + 0.1, VIRAL("erro-windows"), 0.22],
  [em("grátis", K[0] + 2) + 0.1, VIRAL("cha-ching-dinheiro"), 0.22],
  [em("o", em("dia")) - 0.05, VIRAL("magic-reveal"), 0.22],
  [em("aperta", K[1]) + 0.3, VIRAL("ding"), 0.2],
  [em("bolinha") + 0.1, VIRAL("ding"), 0.2],
  [em("baratinho") + 0.1, VIRAL("cha-ching-dinheiro"), 0.18],
  [em("laranja") - 0.05, BANCO("anime-wow"), 0.2, 1.4],
  [em("joga") + 0.05, BANCO("que-isso-meu-filho"), 0.3, 1.6],
  [em("lúcia") + 0.1, VIRAL("sino"), 0.2, 1.7],
];

const falando = (t: number) => PAL.some((p) => t >= p.s - 0.04 && t <= p.e + 0.04);
const DUCK: number[] = (() => {
  const bruto = Array.from({ length: DURACAO_FASE49 }, (_, i) => (falando(i / FPS) ? 0.5 : 0.85));
  return bruto.map((_, i) => {
    let soma = 0;
    let n = 0;
    for (let k = -6; k <= 6; k++) {
      const v = bruto[i + k];
      if (v !== undefined) {
        soma += v;
        n++;
      }
    }
    return soma / n;
  });
})();



// a música abaixa enquanto toca o "mission passed"
const MUDO = (_t: number) => 1;

export const VideoFase49: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Fundo t={t} />
      {t < FINAL + 0.3 && <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.35) 0%, rgba(0,0,0,0) 24%, rgba(0,0,0,0) 78%, rgba(0,0,0,.4) 100%)" }} />}
      <Progresso t={t} />
      <Titulos t={t} />
      <Segredo t={t} />
      <Memes t={t} />
      <VyceNoGta t={t} f={f} />
      <Legenda t={t} />
      <Audio src={staticFile(ARQ("narracao.wav"))} />
      <Audio src={staticFile(ARQ("trilha.wav"))} volume={(q) => 0.2 * (DUCK[q] ?? 0.5) * MUDO(q / FPS)} />
      {SONS.map(([q, nome, vol, dur], i) => (
        <Sequence key={i} from={Math.max(0, Math.round(q * FPS))} durationInFrames={Math.round((dur ?? 2) * FPS)}>
          <Audio src={staticFile(nome)} volume={vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
