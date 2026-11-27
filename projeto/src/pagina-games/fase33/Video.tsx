import { loadFont } from "@remotion/google-fonts/Montserrat";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, Audio, Easing, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { Camera } from "../Estudio";
import { CorPele, Mascote3D, PoseMascote } from "../Mascote3D";
import dados from "./dados.json";

// Fase Extra, Fase 33: "Como guardar carro roubado na garagem no GTA 6" (passo a passo, 4 passos).
// Base: reel do @lorenzoofr (Instagram Df-AQqDOkuY): webcam dele em cima + jogo embaixo. Pedido: a pessoa de cima NÃO aparece.
// clipes/jogo.mp4 = só a faixa do jogo do reel (1080x960, y 960–1920), mesmos segundos do reel, 30 fps.
// A faixa entra inteira (sem zoom) no meio da tela, com o próprio quadro desfocado no fundo. Voz só do Vyce, sem crédito.
const { fontFamily } = loadFont("normal", { weights: ["600", "800", "900"], subsets: ["latin"] });
export const FPS = 30;
const FIM = dados.duracao + 1.2;
export const DURACAO_FASE33 = Math.ceil(FIM * FPS);
const AMARELO = "#FFD84A";
const LARANJA = "#FF8A2B";
const AZUL = "#6FD6FF";
const VERDE = "#7CFF9B";
const ROSA = "#FF7EB6";
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const suave = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
const entra = (t: number, a: number, d = 0.3) => interpolate(t, [a, a + d], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) });
const sombra = "0 4px 22px rgba(0,0,0,.8)";
const ARQ = (n: string) => `fase-extra/fase33/${n}`;

// ---------- âncoras ----------
type Pal = { w: string; s: number; e: number };
const PAL = dados.palavras as Pal[];
const limpa = (w: string) => w.toLowerCase().replace(/[.,?!:…“”"]/g, "");
const em = (palavra: string, depois = 0) => PAL.find((p) => limpa(p.w) === palavra && p.s >= depois)?.s ?? 999;
const P1 = em("passo", 9);
const P2 = em("passo", P1 + 1);
const P3 = em("passo", P2 + 1);
const P4 = em("passo", P3 + 1);
const ERRO = em("como", P4);
const PAGOU = em("pagou");
const FINAL = em("você", em("antes", ERRO)) - 0.15;
const ENQ = em("e", em("vyce", FINAL));

// ---------- planos (s = segundo do reel = segundo de clipes/jogo.mp4) ----------
type Plano = { de: number; s: number };
const PLANOS: Plano[] = [
  // gancho
  { de: 0, s: 0.3 },
  { de: em("guardado") - 0.1, s: 59.4 },
  { de: em("eu", 5) - 0.1, s: 37.6 },
  { de: em("erro") - 0.1, s: 15.4 },
  // 1 · escaneia
  { de: P1 - 0.1, s: 8.6 },
  { de: em("segura", P1) - 0.1, s: 11.0 },
  { de: em("o", em("r1")) - 0.1, s: 15.2 },
  // 2 · rouba
  { de: P2 - 0.1, s: 19.4 },
  { de: em("arromba") - 0.1, s: 21.6 },
  { de: em("faz", P2) - 0.1, s: 24.6 },
  // 3 · oficina
  { de: P3 - 0.1, s: 28.4 },
  { de: em("watkins") - 0.1, s: 36.0 },
  { de: em("em", em("moses")) - 0.1, s: 32.6 },
  { de: em("ela", P3) - 0.1, s: 38.0 },
  // 4 · pinta e registra
  { de: P4 - 0.1, s: 40.0 },
  { de: em("l2") - 0.1, s: 42.2 },
  { de: em("primeiro", P4) - 0.1, s: 46.4 },
  { de: em("depois", P4) - 0.1, s: 50.4 },
  { de: PAGOU - 0.1, s: 55.0 },
  { de: em("ficou", PAGOU) - 0.1, s: 59.4 },
  // o erro
  { de: ERRO - 0.1, s: 64.4 },
  { de: em("e", em("aceita")) - 0.1, s: 68.0 },
  { de: em("rouba", ERRO) - 0.1, s: 72.0 },
];
PLANOS.sort((a, b) => a.de - b.de);
const planoEm = (t: number) => {
  let i = -1;
  while (i + 1 < PLANOS.length && PLANOS[i + 1].de <= t) i++;
  return i;
};
const VIDEO = staticFile(ARQ("clipes/jogo.mp4"));
// faixa do jogo inteira (1080x960) no meio da tela
const TOPO = 440;
const CORTE = 80; // a beirada de cima da faixa tem as legendas do criador
const Faixa: React.FC<{ s: number; z: number }> = ({ s, z }) => (
  <div style={{ position: "absolute", left: 0, top: TOPO + CORTE, width: 1080, height: 960 - CORTE, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,.6)" }}>
    <div style={{ position: "absolute", inset: 0, transform: `scale(${z})` }}>
      <OffthreadVideo src={VIDEO} startFrom={Math.round(s * FPS)} muted style={{ position: "absolute", left: 0, top: -CORTE, width: 1080, height: 960 }} />
    </div>
  </div>
);
const Desfocado: React.FC<{ s: number }> = ({ s }) => (
  <AbsoluteFill style={{ overflow: "hidden" }}>
    <OffthreadVideo src={VIDEO} startFrom={Math.round(s * FPS)} muted style={{ position: "absolute", left: -540, top: 0, width: 2160, height: 1920, filter: "blur(30px) brightness(0.4)" }} />
  </AbsoluteFill>
);
const Fundo: React.FC<{ t: number }> = ({ t }) => {
  const i = planoEm(t);
  if (i < 0 || t > FINAL + 0.3) return null;
  const p = PLANOS[i];
  const fim = Math.min(PLANOS[i + 1]?.de ?? FIM, FINAL + 0.3);
  const z = 1 + 0.04 * interpolate(t, [p.de, fim], [0, 1], { ...cl, easing: Easing.inOut(Easing.sin) });
  const dur = Math.max(1, Math.round((fim - p.de) * FPS) + 2);
  return (
    <Sequence key={i} from={Math.round(p.de * FPS)} durationInFrames={dur} layout="none">
      <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
        <Desfocado s={p.s} />
        <Faixa s={p.s} z={z} />
      </AbsoluteFill>
    </Sequence>
  );
};

// ---------- título (em cima): número grande da contagem + título curto ----------
type Tela = { de: number; ate: number; n?: string; rotulo?: string; cor: string; titulo: string };
const TELAS: Tela[] = [
  { de: 0.05, ate: em("eu", 5) - 0.05, cor: AZUL, titulo: "CARRO ROUBADO = SEU 🔑" },
  { de: em("eu", 5), ate: P1 - 0.05, rotulo: "GUARDADO NA GARAGEM", cor: AZUL, titulo: "PASSO A PASSO" },
  { de: P1, ate: em("o", em("r1")) - 0.05, n: "1", rotulo: "SETA PRA CIMA + R1", cor: VERDE, titulo: "ESCANEIA" },
  { de: em("o", em("r1")), ate: P2 - 0.05, n: "1", rotulo: "RASTREADOR TEM QUE SER", cor: VERDE, titulo: "“NÃO”" },
  { de: P2, ate: P3 - 0.05, n: "2", rotulo: "ARROMBA OU DESTRANCA", cor: LARANJA, titulo: "ROUBA" },
  { de: P3, ate: P4 - 0.05, n: "3", rotulo: "PORT GELLHORN · SÓ NO CAPÍTULO 2", cor: AMARELO, titulo: "OFICINA DO MOSES" },
  { de: P4, ate: ERRO - 0.05, n: "4", rotulo: "L2 + QUADRADO", cor: ROSA, titulo: "PINTA E REGISTRA" },
  { de: ERRO, ate: FINAL - 0.1, rotulo: "COM RASTREADOR · ROUBADO DO LADO", cor: AMARELO, titulo: "O ERRO ⚠️" },
];
const Titulos: React.FC<{ t: number }> = ({ t }) => {
  const tela = TELAS.find((x) => t >= x.de - 0.05 && t < x.ate);
  if (!tela) return null;
  const k = entra(t, tela.de, 0.3);
  const s = suave(t, tela.ate - 0.15, tela.ate);
  const kn = interpolate(t, [tela.de, tela.de + 0.4], [0, 1], { ...cl, easing: Easing.out(Easing.back(2)) });
  const n = tela.titulo.length;
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: 230, textAlign: "center", fontFamily, opacity: k * (1 - s) }}>
      {tela.n && (
        <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 120, height: 120, borderRadius: 60, background: tela.cor, color: "#111", fontWeight: 900, fontSize: 84, lineHeight: 1, marginBottom: 10, boxShadow: "0 6px 26px rgba(0,0,0,.6)", transform: `scale(${kn})` }}>{tela.n}</div>
      )}
      {tela.rotulo && <div style={{ fontWeight: 800, fontSize: 32, letterSpacing: 6, color: tela.cor, textShadow: sombra, marginBottom: 6, transform: `translateY(${(1 - k) * 16}px)` }}>{tela.rotulo}</div>}
      <div style={{ fontWeight: 900, fontSize: tela.titulo === "“NÃO”" ? 130 : n > 18 ? 68 : n > 14 ? 78 : 92, lineHeight: 1.02, letterSpacing: -1, color: "#fff", WebkitTextStroke: "8px #000", paintOrder: "stroke fill", textShadow: sombra, transform: `translateY(${(1 - k) * 20}px) scale(${0.94 + 0.06 * k})` }}>{tela.titulo}</div>
    </div>
  );
};

// ---------- legenda (embaixo) ----------
const DESTAQUE = /^(carro|gta|6|sempre|garagem|erro|recusar|r1|app|escaneia|rastreador|não|registro|arromba|destranca|ligação|direta|autopeças|watkins|moses|port|gellhorn|capítulo|2|l2|quadrado|pinta|registra|azulzinho|seu|aceita|roubado|lado|oficina|longe|antes|fase|extra|vyce|esportivo|caminhonete|comenta)$/i;
const BLOCOS: Pal[][] = (() => {
  const b: Pal[][] = [];
  let c: Pal[] = [];
  PAL.forEach((p, i) => {
    c.push(p);
    const n = PAL[i + 1];
    if (c.length >= 3 || /[.,?!:…]$/.test(p.w) || !n || n.s - p.e > 0.35) {
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
    <div style={{ position: "absolute", top: 1560, left: 50, right: 50, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 18px" }}>
      {BLOCOS[i].map((p, j) => (
        <span key={j} style={{ fontFamily, fontWeight: 900, fontSize: 66, lineHeight: 1.1, color: DESTAQUE.test(limpa(p.w)) ? AMARELO : "#fff", opacity: t >= p.s - 0.03 ? 1 : 0, WebkitTextStroke: "10px #000", paintOrder: "stroke fill" }}>
          {p.w.replace(/[.,:!]$/, "")}
        </span>
      ))}
    </div>
  );
};

// ---------- final: o Vyce DENTRO do GTA, na frente da oficina do Moses ----------
const boca = (f: number) => (dados.boca as number[])[f] ?? 0;
const pisca = (t: number) => {
  const c = t % 4.3;
  return c > 1.4 && c < 1.52;
};
const OPCOES: [string, string, string, string][] = [
  ["1", "🏎️", "UM ESPORTIVO", AZUL],
  ["2", "🛻", "UMA CAMINHONETE", LARANJA],
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
        <AbsoluteFill style={{ transform: `scale(${1 + 0.04 * suave(t, FINAL, FIM)})` }}>
          <OffthreadVideo src={VIDEO} startFrom={Math.round(37.0 * FPS)} muted style={{ position: "absolute", left: -540, top: 0, width: 2160, height: 1920, filter: "blur(2px)" }} />
        </AbsoluteFill>
      </Sequence>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.65) 0%, rgba(0,0,0,.2) 35%, rgba(0,0,0,0) 60%, rgba(0,0,0,.35) 100%)" }} />
      <AbsoluteFill>
        <ThreeCanvas width={1080} height={1920} camera={{ fov, near: 0.05, far: 50 }} gl={{ toneMapping: THREE.ACESFilmicToneMapping, antialias: true, alpha: true }}>
          <Camera pos={[0, 1.2, 6]} alvo={[0, 1.05, 0]} />
          <hemisphereLight args={["#FFF1DE", "#4A3A2E", 1.1]} />
          <directionalLight position={[-2, 5, 4]} intensity={2.2} color="#FFF2DE" />
          <directionalLight position={[2.5, 3, -2]} intensity={1.3} color="#FFE2C0" />
          <CorPele.Provider value={{ pele: "#D9A584", funda: "#C48E6C" }}>
            <Mascote3D pos={[0.05, -0.62 * (1 - suave(t, FINAL - 0.1, FINAL + 0.35)) - 0.52, 0]} giro={-0.08 + 0.05 * Math.sin(t * 0.9)} pose={pose} boca={boca(f)} pisca={pisca(t)} olhar={0.6} sorriso />
          </CorPele.Provider>
        </ThreeCanvas>
      </AbsoluteFill>
      <div style={{ position: "absolute", top: 230, left: 70, right: 70, fontFamily, color: "#fff" }}>
        <div style={{ fontWeight: 800, fontSize: 32, letterSpacing: 8, color: "#E2C4FF", textShadow: sombra, opacity: entra(t, FINAL) }}>VOCÊ ESTÁ NA FASE EXTRA</div>
        <div style={{ fontWeight: 900, fontSize: 92, lineHeight: 1, textShadow: sombra, opacity: entra(t, ENQ - 0.2) }}>E VOCÊ?</div>
        <div style={{ marginTop: 10 }}>
          {OPCOES.map(([n, ic, txt, cor], i) => {
            const kk = entra(t, em(i === 0 ? "um" : "ou", ENQ) - 0.15);
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

// ---------- som: voz + música (Waka Floka Type, Mixkit 364) bem baixa + whoosh leve em cada passo ----------
const PASSOS = [P1, P2, P3, P4, ERRO];
const SONS: [number, string, number][] = [
  ...PASSOS.map((q) => [q - 0.05, "whoosh", 0.1] as [number, string, number]),
  ...PASSOS.map((q) => [q + 0.05, "pop", 0.12] as [number, string, number]),
  [FINAL, "whoosh", 0.1],
];
const falando = (t: number) => PAL.some((p) => t >= p.s - 0.04 && t <= p.e + 0.04);
const DUCK: number[] = (() => {
  const bruto = Array.from({ length: DURACAO_FASE33 }, (_, i) => (falando(i / FPS) ? 0.5 : 0.85));
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

export const VideoFase33: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Fundo t={t} />
      {t < FINAL + 0.3 && <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.5) 0%, rgba(0,0,0,0) 24%, rgba(0,0,0,0) 74%, rgba(0,0,0,.6) 100%)" }} />}
      <Titulos t={t} />
      <VyceNoGta t={t} f={f} />
      <Legenda t={t} />
      <Audio src={staticFile(ARQ("narracao.wav"))} />
      <Audio src={staticFile(ARQ("trilha.wav"))} volume={(q) => 0.12 * (DUCK[q] ?? 0.5)} />
      {SONS.map(([q, nome, vol], i) => (
        <Sequence key={i} from={Math.max(0, Math.round(q * FPS))} durationInFrames={90}>
          <Audio src={staticFile(nome === "whoosh" ? "fase-extra/sons/whoosh.wav" : ARQ(`sfx-${nome}.wav`))} volume={vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
