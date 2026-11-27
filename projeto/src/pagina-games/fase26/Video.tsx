import { loadFont } from "@remotion/google-fonts/Montserrat";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, Audio, Easing, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { Camera } from "../Estudio";
import { Mascote3D, PoseMascote } from "../Mascote3D";
import dados from "./dados.json";

// Fase Extra, Fase 26: "O laboratório secreto do caranguejo gigante no GTA 6".
// Passo a passo com mistério (base: vídeo do VITAOZITO, só a imagem do jogo; narração dele fora).
// clipes/jogo.mp4 = gameplay horizontal 1920x1080 a 30 fps. Cada plano recorta na vertical (k = zoom em relação à
// altura 1920; k=1.778 = recorte 9:16 cheio; k=1 = faixa de 1080 px de largura, pra telas com texto, com fundo desfocado).
// Um passo por tela, códigos grandes (CLEAVES, 0036, 0072, 0212). Música de suspense no padrão (0,5 × ducking).
const { fontFamily } = loadFont("normal", { weights: ["600", "800", "900"], subsets: ["latin"] });
export const FPS = 30;
const FIM = dados.duracao + 1.0;
export const DURACAO_FASE26 = Math.ceil(FIM * FPS);
const VERDE = "#7CFF9B";
const AMARELO = "#FFD84A";
const VERMELHO = "#FF4B4B";
const AZUL = "#6FD6FF";
const LARANJA = "#FF9B3D";
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const suave = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
const entra = (t: number, a: number, d = 0.3) => interpolate(t, [a, a + d], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) });
const pula = (t: number, a: number) => interpolate(t, [a, a + 0.35], [0, 1], { ...cl, easing: Easing.out(Easing.back(1.8)) });
const sombra = "0 4px 22px rgba(0,0,0,.8)";
const contorno = (px: number) => ({ WebkitTextStroke: `${px}px #000`, paintOrder: "stroke fill" as const });
const ARQ = (n: string) => `fase-extra/fase26/${n}`;

// ---------- âncoras ----------
type Pal = { w: string; s: number; e: number };
const PAL = dados.palavras as Pal[];
const limpa = (w: string) => w.toLowerCase().replace(/[.,?!:…“”"]/g, "");
const em = (palavra: string, depois = 0) => PAL.find((p) => limpa(p.w) === palavra && p.s >= depois)?.s ?? 999;
const ONDE = em("vai");
const GANCHO_CARANGUEJO = em("caranguejo");
const P1 = em("antes");
const P2 = em("lá", P1);
const SENHA = em("a", em("senha", P2) - 0.5);
const CLEAVES = em("cleaves");
const P3 = em("no", CLEAVES);
const EMBAIXO = em("embaixo", P3);
const SUSTO = em("aí", P3);
const CARANGUEJO = em("caranguejo", SUSTO);
const P4 = em("ele", CARANGUEJO);
const P5 = em("na", P4);
const ESPECIME = em("o", em("experimentos"));
const P6 = em("sucesso", em("quilos") + 1);
const COD = em("o", em("36", P6) + 0.5);
const P7 = em("no", COD);
const PROTO = em("e", em("dólares", P7));
const P8 = em("usa", P7);
const DIGITA = em("digita", P8);
const P9 = em("lá", DIGITA);
const MOCHILA = em("e", em("crabshack", P9));
const P10 = em("nota", P9);
const BRIAN = em("leva", P10);
const P11 = em("e", em("missões", P10));
const FINAL = em("você", em("criou", P11)) - 0.15;
const ENQ = em("e", em("vyce", FINAL));

// ---------- planos (src = segundo de clipes/jogo.mp4; cx = centro x no quadro 1920; k = zoom) ----------
type Plano = { de: number; src: number; cx?: number; cy?: number; k?: number; vel?: number };
const CHEIO = 1920 / 1080;
const PLANOS: Plano[] = [
  { de: 0, src: 262.4 },
  { de: em("arma") - 0.1, src: 243.0, cx: 1100 },
  { de: GANCHO_CARANGUEJO - 0.1, src: 129.3, cx: 900 },
  { de: em("eu") - 0.1, src: 60.0 },
  { de: ONDE - 0.1, src: 40.0, cx: 1000, k: 1.3 },
  { de: em("logo") - 0.1, src: 46.0, k: 1.3 },
  { de: em("tem", ONDE + 2) - 0.1, src: 49.2 },
  { de: em("abandonada") - 0.1, src: 59.5 },
  { de: P1 - 0.1, src: 61.0 },
  { de: em("liga", P1) - 0.1, src: 64.6, cx: 1000 },
  { de: P2 - 0.1, src: 72.0 },
  { de: em("cofre", P2) - 0.1, src: 76.0, cx: 1050 },
  { de: SENHA - 0.1, src: 80.6 },
  { de: em("chão", SENHA) - 0.1, src: 84.6, k: 1.2 },
  { de: P3 - 0.1, src: 96.5, k: 1.2 },
  { de: em("lista", P3) - 0.1, src: 121.0, cx: 520, k: 1 },
  { de: SUSTO - 0.1, src: CARANGUEJO - SUSTO > 0 ? 130.0 - (CARANGUEJO - SUSTO) : 128.0, cx: 900 },
  { de: P4 - 0.1, src: 141.5 },
  { de: em("gaiola", P4) - 0.1, src: 159.6 },
  { de: em("produto", P4) - 0.1, src: 165.6 },
  { de: em("e", em("químico", P4)) - 0.1, src: 168.0 },
  { de: P5 - 0.1, src: 177.8, cx: 1000 },
  { de: ESPECIME - 0.1, src: 188.5, cx: 720, k: 0.75 },
  { de: P6 - 0.1, src: 200.8, cx: 1000, k: 1.5 },
  { de: P7 - 0.1, src: 207.5, cx: 1050 },
  { de: PROTO - 0.1, src: 215.5, cx: 1000 },
  { de: P8 - 0.1, src: 226.6 },
  { de: em("segue", P8) - 0.1, src: 230.5 },
  { de: em("galpão", P8) - 0.1, src: 233.5 },
  { de: DIGITA - 0.1, src: 239.5, cx: 1100 },
  { de: P9 - 0.1, src: 243.0, cx: 1150 },
  { de: MOCHILA - 0.1, src: 262.6 },
  { de: P10 - 0.1, src: 275.0, cx: 1290, k: 1 },
  { de: BRIAN - 0.1, src: 280.5 },
  { de: em("ele", BRIAN) - 0.1, src: 286.0 },
  { de: P11 - 0.1, src: 131.5, cx: 900, vel: 0.6 },
];
const planoEm = (t: number) => {
  let i = -1;
  while (i + 1 < PLANOS.length && PLANOS[i + 1].de <= t) i++;
  return i;
};
const Quadro: React.FC<{ src: number; k: number; cx: number; cy: number; filtro?: string }> = ({ src, k, cx, cy, filtro }) => {
  const w = 1920 * k * (1920 / 1080) / CHEIO; // largura do quadro na tela (k=CHEIO → 3413)
  const h = (w * 1080) / 1920;
  const left = 540 - (cx / 1920) * w;
  const top = 960 - (cy / 1080) * h;
  return <OffthreadVideo src={staticFile(ARQ("clipes/jogo.mp4"))} startFrom={Math.round(src * FPS)} muted style={{ position: "absolute", left: Math.min(0, Math.max(1080 - w, left)), top, width: w, height: h, filter: filtro }} />;
};
const Fundo: React.FC<{ t: number }> = ({ t }) => {
  const i = planoEm(t);
  if (i < 0 || t > FINAL + 0.3) return null;
  const p = PLANOS[i];
  const fim = Math.min(PLANOS[i + 1]?.de ?? FIM, FINAL + 0.3);
  const k0 = p.k ?? CHEIO;
  const z = 1 + 0.05 * interpolate(t, [p.de, fim], [0, 1], { ...cl, easing: Easing.inOut(Easing.sin) });
  const dur = Math.max(1, Math.round((fim - p.de) * FPS) + 2);
  const cheio = k0 >= CHEIO - 0.01;
  return (
    <Sequence key={i} from={Math.round(p.de * FPS)} durationInFrames={dur} layout="none">
      <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
        {!cheio && (
          <AbsoluteFill style={{ transform: "scale(1.1)" }}>
            <Quadro src={p.src} k={CHEIO} cx={p.cx ?? 960} cy={540} filtro="blur(28px) brightness(0.45)" />
          </AbsoluteFill>
        )}
        <AbsoluteFill style={{ transform: `scale(${z})` }}>
          <Quadro src={p.src} k={k0} cx={p.cx ?? 960} cy={p.cy ?? 540} />
        </AbsoluteFill>
      </AbsoluteFill>
    </Sequence>
  );
};

// ---------- títulos (um passo por tela) ----------
type Tela = { de: number; ate: number; rotulo?: string; cor: string; titulo: string[]; sub?: string };
const TELAS: Tela[] = [
  { de: 0.05, ate: GANCHO_CARANGUEJO - 0.05, rotulo: "GTA 6 · LOGO NO COMEÇO", cor: VERDE, titulo: ["$10.000", "MUITO FÁCIL 💵"] },
  { de: GANCHO_CARANGUEJO, ate: ONDE - 0.05, rotulo: "O MISTÉRIO DO", cor: VERMELHO, titulo: ["CARANGUEJO", "GIGANTE 🦀"] },
  { de: ONDE, ate: P1 - 0.05, rotulo: "ONDE FICA", cor: AZUL, titulo: ["PELICAN", "VALLEY"], sub: "SUDOESTE DO PÂNTANO · GULLETT MARSH" },
  { de: P1, ate: P2 - 0.05, rotulo: "1", cor: VERDE, titulo: ["LIGA A", "ENERGIA"] },
  { de: P2, ate: P3 - 0.05, rotulo: "2", cor: AMARELO, titulo: ["A SENHA", "TÁ NO CHÃO"] },
  { de: P3, ate: SUSTO - 0.05, rotulo: "3", cor: AZUL, titulo: ["A LISTA DE", "COMPRAS"] },
  { de: P4, ate: P5 - 0.05, rotulo: "4", cor: VERDE, titulo: ["O LABORATÓRIO"] },
  { de: P5, ate: P6 - 0.05, rotulo: "5", cor: AMARELO, titulo: ["A PRANCHETA"] },
  { de: P6, ate: P7 - 0.05, rotulo: "6", cor: VERDE, titulo: ["O CÓDIGO", "DO COFRE"] },
  { de: P7, ate: P8 - 0.05, rotulo: "7", cor: AMARELO, titulo: ["O COFRE"] },
  { de: P8, ate: P9 - 0.05, rotulo: "8", cor: VERMELHO, titulo: ["SEGUE O", "SANGUE"] },
  { de: P9, ate: P10 - 0.05, rotulo: "9", cor: LARANJA, titulo: ["O PRÊMIO"] },
  { de: P10, ate: P11 - 0.05, rotulo: "10", cor: VERDE, titulo: ["VENDE NO", "BRIAN"] },
  { de: P11, ate: FINAL - 0.1, rotulo: "ESPÉCIME", cor: VERMELHO, titulo: ["E O 0036?"] },
];
const Titulos: React.FC<{ t: number }> = ({ t }) => {
  const tela = TELAS.find((x) => t >= x.de - 0.05 && t < x.ate);
  if (!tela) return null;
  const k = entra(t, tela.de, 0.35);
  const s = suave(t, tela.ate - 0.2, tela.ate);
  const num = tela.rotulo && tela.rotulo.length <= 2;
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: 230, fontFamily, opacity: k * (1 - s), transform: `translateY(${(1 - k) * 24}px)` }}>
      {tela.rotulo && (
        <div style={{ display: "inline-block", fontWeight: 900, fontSize: num ? 60 : 30, letterSpacing: num ? 0 : 8, color: "#111", background: tela.cor, borderRadius: 14, padding: num ? "0 24px" : "6px 16px", marginBottom: 12 }}>{tela.rotulo}</div>
      )}
      {tela.titulo.map((l) => (
        <div key={l} style={{ fontWeight: 900, fontSize: 100, lineHeight: 0.98, letterSpacing: -1, color: "#fff", textShadow: sombra, ...contorno(8) }}>
          {l}
        </div>
      ))}
      {tela.sub && <div style={{ marginTop: 12, fontWeight: 800, fontSize: 30, letterSpacing: 4, color: tela.cor, ...contorno(6) }}>{tela.sub}</div>}
    </div>
  );
};

// ---------- cartões dos códigos ----------
const Cartao: React.FC<{ t: number; de: number; ate: number; cor: string; children: React.ReactNode; top?: number }> = ({ t, de, ate, cor, children, top = 860 }) => {
  if (t < de - 0.05 || t > ate) return null;
  const k = pula(t, de);
  const s = suave(t, ate - 0.2, ate);
  return (
    <div style={{ position: "absolute", top, left: 70, right: 70, display: "flex", justifyContent: "center", fontFamily, opacity: Math.min(1, k * 1.5) * (1 - s), transform: `scale(${0.7 + 0.3 * k})` }}>
      <div style={{ background: "rgba(8,10,18,.88)", border: `5px solid ${cor}`, borderRadius: 28, padding: "26px 40px", boxShadow: `0 0 40px ${cor}66`, textAlign: "center", color: "#fff" }}>{children}</div>
    </div>
  );
};
const Rot: React.FC<{ cor: string; children: React.ReactNode }> = ({ cor, children }) => <div style={{ fontWeight: 800, fontSize: 30, letterSpacing: 6, color: cor }}>{children}</div>;
const Big: React.FC<{ tam?: number; cor?: string; children: React.ReactNode }> = ({ tam = 130, cor = "#fff", children }) => (
  <div style={{ fontWeight: 900, fontSize: tam, lineHeight: 1, letterSpacing: 2, color: cor, fontVariantNumeric: "tabular-nums" }}>{children}</div>
);
const Linha: React.FC<{ t: number; de: number; children: React.ReactNode; cor?: string }> = ({ t, de, children, cor = "#fff" }) => (
  <div style={{ fontWeight: 900, fontSize: 52, lineHeight: 1.15, color: cor, opacity: entra(t, de, 0.25), transform: `translateY(${(1 - entra(t, de, 0.25)) * 14}px)` }}>{children}</div>
);
const Cartoes: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Cartao t={t} de={CLEAVES - 0.15} ate={EMBAIXO - 0.1} cor={AMARELO}>
      <Rot cor={AMARELO}>SENHA DO COMPUTADOR</Rot>
      <Big tam={120}>CLEAVES</Big>
    </Cartao>
    <Cartao t={t} de={EMBAIXO} ate={SUSTO - 0.05} cor={AZUL} top={1000}>
      <Rot cor={AZUL}>NO FIM DA LISTA</Rot>
      <Big tam={64}>CÓDIGO DO COFRE =</Big>
      <Big tam={64} cor={AMARELO}>SUCESSO EM DOBRO</Big>
    </Cartao>
    <Cartao t={t} de={CARANGUEJO - 0.1} ate={P4 - 0.05} cor={VERMELHO} top={1040}>
      <Big tam={86} cor={VERMELHO}>CARANGUEJO</Big>
      <Big tam={86} cor={VERMELHO}>GIGANTE! 😱</Big>
    </Cartao>
    <Cartao t={t} de={em("0036", ESPECIME) - 0.15} ate={P6 - 0.05} cor={VERDE} top={900}>
      <Rot cor={VERDE}>REGISTRO DOS EXPERIMENTOS</Rot>
      <Big tam={120}>0036</Big>
      <Linha t={t} de={em("leonida", ESPECIME) - 0.1}>LEONIDA BLUE</Linha>
      <Linha t={t} de={em("mais", ESPECIME) - 0.1}>+25,6 KG</Linha>
      <Linha t={t} de={em("sucesso", ESPECIME) - 0.1} cor={VERDE}>✔ SUCESSO</Linha>
    </Cartao>
    <Cartao t={t} de={P6} ate={P7 - 0.05} cor={AMARELO} top={880}>
      <Rot cor={AMARELO}>SUCESSO EM DOBRO</Rot>
      <Big tam={110}>
        36 <span style={{ opacity: entra(t, em("mais", P6) - 0.1) }}>+ 36</span>
      </Big>
      <div style={{ opacity: entra(t, em("0072", P6) - 0.15), transform: `scale(${0.6 + 0.4 * pula(t, em("0072", P6) - 0.15)})` }}>
        <Big tam={150} cor={AMARELO}>
          = 0072
        </Big>
        <div style={{ fontWeight: 700, fontSize: 24, letterSpacing: 3, color: "rgba(255,255,255,.7)", marginTop: 8 }}>SE NÃO FUNCIONAR, SIGA AS PISTAS</div>
      </div>
    </Cartao>
    <Cartao t={t} de={em("mil", P7) - 0.15} ate={P8 - 0.05} cor={VERDE} top={900}>
      <Big tam={100} cor={VERDE}>
        $1.000
      </Big>
      <div style={{ opacity: entra(t, PROTO), marginTop: 10 }}>
        <Rot cor={AMARELO}>PROTOCOLO DE EMERGÊNCIA</Rot>
        <Big tam={130} cor={AMARELO}>
          0212
        </Big>
      </div>
    </Cartao>
    <Cartao t={t} de={DIGITA - 0.1} ate={P9 - 0.05} cor={AMARELO} top={980}>
      <Rot cor={AMARELO}>NA PORTA DO GALPÃO</Rot>
      <Big tam={140} cor={AMARELO}>
        0212
      </Big>
    </Cartao>
    <Cartao t={t} de={em("submetralhadora", P9) - 0.1} ate={P10 - 0.05} cor={LARANJA} top={960}>
      <Rot cor={LARANJA}>SUBMETRALHADORA</Rot>
      <Big tam={84}>VF5 CRABSHACK</Big>
      <div style={{ opacity: entra(t, MOCHILA + 0.2), marginTop: 14 }}>
        <Big tam={96} cor={VERDE}>
          + $10.000
        </Big>
        <Rot cor={VERDE}>EM NOTAS MARCADAS</Rot>
      </div>
    </Cartao>
    <Cartao t={t} de={BRIAN - 0.1} ate={P11 - 0.05} cor={VERDE} top={1020}>
      <Rot cor={VERDE}>DEPÓSITO DO BRIAN</Rot>
      <Big tam={66}>ELE PAGA DEPOIS</Big>
    </Cartao>
  </>
);

// ---------- final: o Vyce DENTRO do GTA ----------
const boca = (f: number) => (dados.boca as number[])[f] ?? 0;
const pisca = (t: number) => {
  const c = t % 4.3;
  return c > 1.4 && c < 1.52;
};
const OPCOES: [string, string, string, string][] = [
  ["1", "🔫", "IA ATRÁS DA ARMA", LARANJA],
  ["2", "🦀", "FUGIA DO CARANGUEJO", VERMELHO],
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
          <Quadro src={59.5} k={CHEIO} cx={760} cy={540} />
        </AbsoluteFill>
      </Sequence>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.6) 0%, rgba(0,0,0,.15) 35%, rgba(0,0,0,0) 60%, rgba(0,0,0,.3) 100%)" }} />
      <AbsoluteFill>
        <ThreeCanvas width={1080} height={1920} camera={{ fov, near: 0.05, far: 50 }} gl={{ toneMapping: THREE.ACESFilmicToneMapping, antialias: true, alpha: true }}>
          <Camera pos={[0, 1.2, 6]} alvo={[0, 1.05, 0]} />
          <hemisphereLight args={["#DCEBFF", "#C8B48C", 1.15]} />
          <directionalLight position={[-2, 5, 4]} intensity={2.3} color="#FFF6E6" />
          <directionalLight position={[2.5, 3, -2]} intensity={1.4} color="#FFE6C4" />
          <Mascote3D pos={[0.05, -0.62 * (1 - suave(t, FINAL - 0.1, FINAL + 0.35)) - 0.52, 0]} giro={-0.08 + 0.05 * Math.sin(t * 0.9)} pose={pose} boca={boca(f)} pisca={pisca(t)} olhar={0.6} sorriso />
        </ThreeCanvas>
      </AbsoluteFill>
      <div style={{ position: "absolute", top: 230, left: 70, right: 70, fontFamily, color: "#fff" }}>
        <div style={{ fontWeight: 800, fontSize: 32, letterSpacing: 8, color: "#E2C4FF", textShadow: sombra, opacity: entra(t, FINAL) }}>VOCÊ ESTÁ NA FASE EXTRA</div>
        <div style={{ fontWeight: 900, fontSize: 92, lineHeight: 1, textShadow: sombra, opacity: entra(t, ENQ - 0.2) }}>E VOCÊ?</div>
        <div style={{ marginTop: 10 }}>
          {OPCOES.map(([n, ic, txt, cor], i) => {
            const kk = entra(t, em(i === 0 ? "ia" : "ou", ENQ) - 0.15);
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

// ---------- legenda ----------
const DESTAQUE = /^(laboratório|caranguejo|gigante|10|mil|dólares|arma|especial|pelican|valley|keys|energia|cofre|computador|senha|chão|cleaves|sucesso|dobro|pessoa|gaiola|quebrada|prancheta|0036|leonida|blue|25|36|0072|0212|águia|sangue|píer|vf5|crabshack|mochila|marcadas|brian|criou|fase|extra|vyce|comenta)$/i;
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
    <div style={{ position: "absolute", top: 1600, left: 50, right: 50, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 18px" }}>
      {BLOCOS[i].map((p, j) => (
        <span key={j} style={{ fontFamily, fontWeight: 900, fontSize: 66, lineHeight: 1.1, color: DESTAQUE.test(limpa(p.w)) ? AMARELO : "#fff", opacity: t >= p.s - 0.03 ? 1 : 0, ...contorno(10) }}>
          {p.w.replace(/[.,:!]$/, "")}
        </span>
      ))}
    </div>
  );
};

// ---------- som ----------
const falando = (t: number) => PAL.some((p) => t >= p.s - 0.04 && t <= p.e + 0.04);
const DUCK: number[] = (() => {
  const bruto = Array.from({ length: DURACAO_FASE26 }, (_, i) => (falando(i / FPS) ? 0.5 : 0.85));
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
const TROCAS = [ONDE, P1, P2, P3, P4, P5, P6, P7, P8, P9, P10, P11, FINAL];
const SONS: [number, string, number][] = [
  [0.0, "sino", 0.18],
  [GANCHO_CARANGUEJO - 0.1, "clarao", 0.22],
  ...TROCAS.map((q) => [q - 0.05, "whoosh", 0.12] as [number, string, number]),
  [CLEAVES - 0.15, "pop", 0.18],
  [CARANGUEJO - 0.1, "clarao", 0.3],
  [em("0036", ESPECIME) - 0.15, "pop", 0.16],
  [em("sucesso", ESPECIME) - 0.1, "sino", 0.14],
  [em("0072", P6) - 0.15, "sino", 0.18],
  [PROTO, "pop", 0.16],
  [DIGITA - 0.1, "pop", 0.16],
  [em("submetralhadora", P9) - 0.1, "pop", 0.16],
  [MOCHILA + 0.2, "sino", 0.16],
];

export const VideoFase26: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Fundo t={t} />
      {t < FINAL + 0.3 && <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.6) 0%, rgba(0,0,0,.12) 30%, rgba(0,0,0,0) 50%, rgba(0,0,0,.5) 100%)" }} />}
      <Titulos t={t} />
      <Cartoes t={t} />
      <VyceNoGta t={t} f={f} />
      <Legenda t={t} />
      <Audio src={staticFile(ARQ("narracao.wav"))} />
      <Audio src={staticFile(ARQ("trilha.wav"))} volume={(q) => 0.5 * (DUCK[q] ?? 0.5)} />
      {SONS.map(([q, nome, vol], i) => (
        <Sequence key={i} from={Math.max(0, Math.round(q * FPS))} durationInFrames={60}>
          <Audio src={staticFile(nome === "whoosh" ? "fase-extra/sons/whoosh.wav" : ARQ(`sfx-${nome}.wav`))} volume={vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
