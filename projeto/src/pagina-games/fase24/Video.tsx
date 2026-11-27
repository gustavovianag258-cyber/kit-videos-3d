import { loadFont } from "@remotion/google-fonts/Montserrat";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { Camera } from "../Estudio";
import { Mascote3D, PoseMascote } from "../Mascote3D";
import dados from "./dados.json";

// Fase Extra, Fase 24: "Esse streamer foi ABDUZIDO no GTA 6".
// Base: reel do FoxMan (Instagram Df5jgx2Mbtq): webcam dele em cima + jogo (Lucia e o disco voador de Kelly County).
// Usuário liberou o rosto do streamer nesta Fase. Legendas em inglês do jogo e o título dele já vêm borrados em clipes/reel.mp4.
// Estilo claro e direto: título curto (faixa entre a webcam e o jogo), legenda embaixo. Sem música, só efeitos leves.
// Final: o Vyce DENTRO do GTA, na frente do feixe do disco voador, com a enquete.
const { fontFamily } = loadFont("normal", { weights: ["600", "800", "900"], subsets: ["latin"] });
export const FPS = 30;
const FIM = dados.duracao + 1.0;
export const DURACAO_FASE24 = Math.ceil(FIM * FPS);
const AZUL = "#7CE7FF";
const VERDE = "#7CFF9B";
const AMARELO = "#FFD84A";
const VERMELHO = "#FF3B3B";
const BRONZE = "#D8925A";
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const suave = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
const entra = (t: number, a: number, d = 0.3) => interpolate(t, [a, a + d], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) });
const sombra = "0 4px 22px rgba(0,0,0,.8)";
const ARQ = (n: string) => `fase-extra/fase24/${n}`;

// ---------- âncoras ----------
type Pal = { w: string; s: number; e: number };
const PAL = dados.palavras as Pal[];
const limpa = (w: string) => w.toLowerCase().replace(/[.,?!:…“”"]/g, "");
const em = (palavra: string, depois = 0) => PAL.find((p) => limpa(p.w) === palavra && p.s >= depois)?.s ?? 999;
const AOVIVO = em("ao");
const ELE = em("ele");
const QUANDO = em("quando", ELE);
const CHEGOU = em("chegou");
const DISCO = em("tinha", CHEGOU);
const PESSOA = em("pessoa", DISCO);
const FALOU = em("a", em("jogo"));
const APAGA = em("luz", FALOU) - 0.1;
const PELADA = em("pelada");
const TRAZ = em("traz");
const BELEZA = em("e", TRAZ + 0.3);
const BUSCA = em("ele", BELEZA);
const VOLTA = em("e", em("boa", BUSCA));
const AGORA = em("só", VOLTA);
// buraco na narração depois de "pra ele.": entra o áudio ORIGINAL do reel (clarão + "No fucking way" + "Oh my god")
const iEle = PAL.findIndex((p) => limpa(p.w) === "ele" && p.s >= AGORA);
const GAP = PAL[iEle].e + 0.1;
const BREAK_A = 4.1; // reel 55.3 → 59.4: clarão, tela branca/preta, "No fucking way"
const GAP_B = GAP + BREAK_A; // reel 63.9 → 66.5: ela acorda no mato, "Oh my god"
const CLARAO = GAP + 0.6;
const DIAS = em("e", GAP);
const TROFEU = em("e", em("depois", DIAS));
const COMO = em("e", em("fora", TROFEU));
const FECHO = em("foi", em("manhã", COMO));
const FINAL = em("você", FECHO) - 0.15;
const ENQ = em("e", em("vyce", FINAL));

// ---------- planos do reel (src = segundo de clipes/reel.mp4) ----------
type Plano = { de: number; src: number; vel?: number; z?: number; vol?: number };
const PLANOS: Plano[] = [
  { de: 0, src: 27.3 },
  { de: AOVIVO - 0.05, src: 55.4, vel: 0.8 },
  { de: em("no", AOVIVO) - 0.05, src: 25.0 },
  { de: em("final") - 0.1, src: 28.2 },
  { de: ELE - 0.1, src: 5.8 },
  { de: QUANDO - 0.1, src: 12.0 },
  { de: CHEGOU - 0.1, src: 20.6 },
  { de: DISCO - 0.1, src: 22.6 },
  { de: PESSOA - 0.1, src: 26.0 },
  { de: FALOU - 0.1, src: 29.0 },
  { de: APAGA, src: 33.4 },
  { de: em("moça", APAGA) - 0.1, src: 36.6 },
  { de: PELADA - 0.15, src: 41.6 },
  { de: BELEZA - 0.1, src: 45.6 },
  { de: BUSCA - 0.1, src: 49.0 },
  { de: VOLTA - 0.1, src: 51.6 },
  { de: AGORA - 0.1, src: 53.9, vel: 0.8 },
  { de: GAP, src: 55.3, vol: 0.34, z: 1.02 },
  { de: GAP_B, src: 63.9, vol: 0.5, z: 1.03 },
  { de: DIAS - 0.1, src: 66.6 },
  { de: TROFEU - 0.1, src: 68.6 },
  { de: COMO - 0.1, src: 71.0 },
  { de: em("estrada", COMO) - 0.1, src: 9.0 },
  { de: em("depois", COMO) - 0.1, src: 14.0 },
  { de: FECHO - 0.1, src: 26.6 },
];
const planoEm = (t: number) => {
  let i = -1;
  while (i + 1 < PLANOS.length && PLANOS[i + 1].de <= t) i++;
  return i;
};
const Reel: React.FC<{ t: number }> = ({ t }) => {
  const i = planoEm(t);
  if (i < 0 || t > FINAL + 0.3) return null;
  const p = PLANOS[i];
  const fim = Math.min(PLANOS[i + 1]?.de ?? FIM, FINAL + 0.3);
  const k = interpolate(t, [p.de, fim], [0, 1], { ...cl, easing: Easing.inOut(Easing.sin) });
  const z = interpolate(k, [0, 1], [1, p.z ?? 1.05]);
  const dur = Math.max(1, Math.round((fim - p.de) * FPS) + 2);
  return (
    <Sequence key={i} from={Math.round(p.de * FPS)} durationInFrames={dur} layout="none">
      <AbsoluteFill style={{ overflow: "hidden", background: "#000" }}>
        <OffthreadVideo src={staticFile(ARQ("clipes/reel.mp4"))} startFrom={Math.round(p.src * FPS)} playbackRate={p.vel ?? 1} volume={p.vol ?? FUNDO_REEL} style={{ position: "absolute", width: 1080, height: 1920, transform: `scale(${z})`, transformOrigin: "50% 50%" }} />
      </AbsoluteFill>
    </Sequence>
  );
};

// áudio original do reel bem baixinho por baixo de tudo; no buraco da narração ele sobe
const FUNDO_REEL = 0.06;

// ---------- título (faixa logo abaixo da webcam) ----------
type Tela = { de: number; ate: number; rotulo?: string; cor: string; titulo: string; vivo?: boolean };
const TELAS: Tela[] = [
  { de: 0.05, ate: em("final") - 0.05, cor: VERMELHO, titulo: "ABDUZIDO NO GTA 6", vivo: true },
  { de: em("final"), ate: ELE - 0.05, rotulo: "NO FINAL", cor: VERMELHO, titulo: "ONDE FOI 📍" },
  { de: ELE, ate: CHEGOU - 0.05, rotulo: "KELLY COUNTY", cor: AZUL, titulo: "2 DA MANHÃ" },
  { de: CHEGOU, ate: FALOU - 0.05, cor: AZUL, titulo: "UM DISCO VOADOR" },
  { de: FALOU, ate: APAGA - 0.05, cor: AZUL, titulo: "…QUE ISSO?" },
  { de: APAGA, ate: PELADA - 0.15, cor: AZUL, titulo: "A LUZ APAGOU" },
  { de: PELADA - 0.1, ate: TRAZ - 0.05, cor: AMARELO, titulo: "ELA CAIU PELADA" },
  { de: TRAZ, ate: BUSCA - 0.05, cor: AMARELO, titulo: "“TRAZ MEU CARRO”" },
  { de: BUSCA, ate: VOLTA - 0.05, cor: AMARELO, titulo: "ERA UMA ARMADILHA?" },
  { de: VOLTA, ate: GAP - 0.05, cor: VERMELHO, titulo: "O DISCO VOLTOU" },
  { de: GAP, ate: GAP_B - 0.05, cor: VERMELHO, titulo: "ABDUZIDO", vivo: true },
  { de: GAP_B, ate: DIAS - 0.05, cor: VERDE, titulo: "ACORDOU NO MATO" },
  { de: DIAS, ate: TROFEU - 0.05, rotulo: "SEGUNDO QUEM JÁ FEZ", cor: VERDE, titulo: "3 DIAS DEPOIS" },
  { de: FECHO, ate: FINAL - 0.1, cor: VERMELHO, titulo: "ABDUZIDO", vivo: true },
];
const Titulos: React.FC<{ t: number }> = ({ t }) => {
  const tela = TELAS.find((x) => t >= x.de - 0.05 && t < x.ate);
  if (!tela) return null;
  const k = entra(t, tela.de, 0.3);
  const s = suave(t, tela.ate - 0.15, tela.ate);
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: 500, textAlign: "center", fontFamily, opacity: k * (1 - s), transform: `translateY(${(1 - k) * 20}px) scale(${0.94 + 0.06 * k})` }}>
      {tela.vivo && (
        <div style={{ display: "inline-flex", alignItems: "center", gap: 10, fontWeight: 900, fontSize: 26, letterSpacing: 5, color: "#fff", background: VERMELHO, borderRadius: 8, padding: "3px 14px", marginBottom: 8 }}>
          <span style={{ width: 14, height: 14, borderRadius: 7, background: "#fff", opacity: Math.sin(t * 7) > 0 ? 1 : 0.25 }} />
          AO VIVO
        </div>
      )}
      {tela.rotulo && <div style={{ fontWeight: 800, fontSize: 24, letterSpacing: 6, color: tela.cor, textShadow: sombra, marginBottom: 4 }}>{tela.rotulo}</div>}
      <div style={{ fontWeight: 900, fontSize: tela.titulo.length > 13 ? 60 : 72, lineHeight: 1, letterSpacing: -1, color: "#fff", WebkitTextStroke: "6px #000", paintOrder: "stroke fill", textShadow: sombra }}>{tela.titulo}</div>
    </div>
  );
};

// ---------- troféu (estilo notificação do console) ----------
const Trofeu: React.FC<{ t: number }> = ({ t }) => {
  if (t < TROFEU - 0.1 || t > COMO) return null;
  const k = interpolate(t, [TROFEU, TROFEU + 0.45], [0, 1], { ...cl, easing: Easing.out(Easing.back(1.5)) });
  const s = suave(t, COMO - 0.25, COMO);
  const brilho = 0.5 + 0.5 * Math.sin(t * 6);
  return (
    <div style={{ position: "absolute", top: 520, left: 70, right: 70, fontFamily, opacity: k * (1 - s), transform: `translateY(${(1 - k) * -40}px) scale(${0.85 + 0.15 * k})` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 28, background: "rgba(10,12,20,.88)", border: `4px solid ${BRONZE}`, borderRadius: 26, padding: "26px 30px", boxShadow: `0 0 ${30 + 30 * brilho}px ${BRONZE}88` }}>
        <svg width={130} height={130} viewBox="0 0 100 100">
          <circle cx={50} cy={50} r={48} fill="#2A1C12" stroke={BRONZE} strokeWidth={4} />
          <path d="M30 24 h40 v12 c0 14 -8 22 -20 24 c-12 -2 -20 -10 -20 -24z" fill={BRONZE} />
          <path d="M30 28 h-8 c0 10 4 15 10 16 M70 28 h8 c0 10 -4 15 -10 16" stroke={BRONZE} strokeWidth={4} fill="none" />
          <rect x={45} y={58} width={10} height={12} fill={BRONZE} />
          <rect x={34} y={70} width={32} height={8} rx={2} fill={BRONZE} />
        </svg>
        <div>
          <div style={{ fontWeight: 800, fontSize: 28, letterSpacing: 5, color: BRONZE }}>TROFÉU SECRETO · BRONZE</div>
          <div style={{ fontWeight: 900, fontSize: 52, lineHeight: 1.05, color: "#fff" }}>A Verdade Está Lá Fora</div>
          <div style={{ fontWeight: 600, fontSize: 28, color: "rgba(255,255,255,.65)", marginTop: 4 }}>The Truth Is Out There</div>
        </div>
      </div>
    </div>
  );
};

// ---------- como ver ----------
const ITENS: [string, string, string][] = [
  ["1", "KELLY COUNTY", "kelly"],
  ["2", "ESTRADA DE TERRA, LESTE DE PORT GELLHORN", "estrada"],
  ["3", "PERTO DO STARLET MOTEL", "perto"],
  ["4", "DEPOIS DAS 2H DA MANHÃ", "depois"],
];
// mapa do jogo (quadros do guia em vídeo HarryNinetyFour, uabc4E946Jg): o cursor no centro (960,540) é o ponto do evento
const MAPAS: [string, string, number, number, number][] = [
  // [arquivo, palavra que troca, cx, k inicial, k final]
  ["kelly", "como", 960, 1.78, 2.0],
  ["gellhorn", "estrada", 800, 1.78, 1.95],
  ["local", "perto", 960, 1.78, 2.05],
];
const ComoVer: React.FC<{ t: number }> = ({ t }) => {
  if (t < COMO - 0.1 || t > FECHO) return null;
  const k = entra(t, COMO, 0.35);
  const s = suave(t, FECHO - 0.25, FECHO);
  let i = 0;
  MAPAS.forEach((m, j) => {
    if (t >= em(m[1], COMO) - 0.15) i = j;
  });
  const [arq, pal, cx, k0, k1] = MAPAS[i];
  const de = i === 0 ? COMO : em(pal, COMO) - 0.15;
  const ate = i + 1 < MAPAS.length ? em(MAPAS[i + 1][1], COMO) - 0.15 : FECHO;
  const kz = interpolate(t, [de, ate], [k0, k1], { ...cl, easing: Easing.inOut(Easing.sin) });
  const w = 1920 * kz;
  const h = 1080 * kz;
  const px = 540 + (960 - cx) * kz; // cursor na tela
  const py = 960;
  const alvo = interpolate(t, [de, de + 0.35], [0, 1], { ...cl, easing: Easing.out(Easing.back(1.8)) });
  const pulso = 1 + 0.08 * Math.sin((t - de) * 7);
  const rotulo = ITENS[i === 0 ? 0 : i === 1 ? 1 : t >= em("depois", COMO) - 0.15 ? 3 : 2][1];
  return (
    <AbsoluteFill style={{ fontFamily, opacity: k * (1 - s), background: "#0B1418", overflow: "hidden" }}>
      <Img src={staticFile(ARQ(`mapa/${arq}.png`))} style={{ position: "absolute", left: px - 960 * kz, top: py - 540 * kz, width: w, height: h }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgb(8,14,18) 0%, rgb(8,14,18) 11%, rgba(8,14,18,.85) 17%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 72%, rgba(0,0,0,.55) 100%)" }} />
      <div style={{ position: "absolute", left: px - 100, top: py - 100, width: 200, height: 200, borderRadius: 100, border: "12px solid #000", transform: `scale(${(0.6 + 0.4 * alvo) * pulso})`, opacity: Math.min(1, alvo * 1.4) }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: 100, border: `8px solid ${VERMELHO}` }} />
      </div>
      <div style={{ position: "absolute", top: py + 130, left: Math.min(Math.max(px, 330), 750), transform: "translateX(-50%)", whiteSpace: "nowrap", opacity: Math.min(1, alvo * 1.4) }}>
        <div style={{ fontWeight: 900, fontSize: i === 2 ? 60 : 50, color: "#fff", background: VERMELHO, borderRadius: 16, padding: "4px 26px", boxShadow: "0 6px 24px rgba(0,0,0,.5)" }}>{i === 0 ? "KELLY COUNTY" : i === 1 ? "LESTE DE PORT GELLHORN" : "FOI AQUI 📍"}</div>
      </div>
      <div style={{ position: "absolute", top: 230, left: 70, right: 70 }}>
        <div style={{ fontWeight: 800, fontSize: 32, letterSpacing: 8, color: AZUL, textShadow: sombra }}>COMO EU PROMETI</div>
        <div style={{ fontWeight: 900, fontSize: 64, lineHeight: 1.05, color: "#fff", WebkitTextStroke: "7px #000", paintOrder: "stroke fill" }}>{rotulo}</div>
      </div>
    </AbsoluteFill>
  );
};

// clarão branco por cima no momento do "Clarão"
const Flash: React.FC<{ t: number }> = ({ t }) => {
  const a = interpolate(t, [CLARAO - 0.05, CLARAO + 0.05, CLARAO + 0.5], [0, 0.9, 0], cl);
  const b = interpolate(t, [AOVIVO - 0.05, AOVIVO + 0.03, AOVIVO + 0.35], [0, 0.6, 0], cl);
  return <AbsoluteFill style={{ background: "#fff", opacity: Math.max(a, b) }} />;
};

// ---------- final: o Vyce DENTRO do GTA, na frente do feixe ----------
const boca = (f: number) => (dados.boca as number[])[f] ?? 0;
const pisca = (t: number) => {
  const c = t % 4.3;
  return c > 1.4 && c < 1.52;
};
const OPCOES: [string, string, string, string][] = [
  ["1", "🚗", "IA BUSCAR O CARRO", AMARELO],
  ["2", "🏃", "SAÍA CORRENDO", VERDE],
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
        {/* só a parte do jogo do reel (y 490–1510), ampliada pra tela toda */}
        <OffthreadVideo src={staticFile(ARQ("clipes/reel.mp4"))} startFrom={Math.round(23.4 * FPS)} playbackRate={0.8} muted style={{ position: "absolute", width: 1080, height: 1920, transform: `scale(${1.95 + 0.05 * suave(t, FINAL, FIM)})`, transformOrigin: "50% 44%" }} />
      </Sequence>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.6) 0%, rgba(0,0,0,.15) 35%, rgba(0,0,0,0) 60%, rgba(0,0,0,.35) 100%)" }} />
      <AbsoluteFill>
        <ThreeCanvas width={1080} height={1920} camera={{ fov, near: 0.05, far: 50 }} gl={{ toneMapping: THREE.ACESFilmicToneMapping, antialias: true, alpha: true }}>
          <Camera pos={[0, 1.2, 6]} alvo={[0, 1.05, 0]} />
          <hemisphereLight args={["#CFE6FF", "#3A4A5A", 1.1]} />
          <directionalLight position={[0, 6, -3]} intensity={2.6} color="#BFEFFF" />
          <directionalLight position={[-2, 3, 4]} intensity={1.6} color="#FFF4E6" />
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

// ---------- legenda (na faixa de baixo do reel) ----------
const DESTAQUE = /^(abduzido|alien|vivo|gta|6|madrugada|lucia|luz|azul|disco|voador|céu|jogo|diabo|pelada|carro|volta|ele|clarão|preta|apagou|dia|3|dias|troféu|secreto|verdade|kelly|county|gellhorn|starlet|motel|2|fase|extra|vyce|correndo|comenta)$/i;
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
// falas originais do reel (no buraco da narração), traduzidas: [início, fim, texto]
const FALAS_REEL: [number, number, string][] = [
  [GAP + (57.34 - 55.3), GAP + (59.4 - 55.3), "NÃO ACREDITO!"],
  [GAP_B + (64.28 - 63.9), GAP_B + 2.6, "MEU DEUS!"],
];
const Legenda: React.FC<{ t: number }> = ({ t }) => {
  if (t >= FINAL) return null;
  const fr = FALAS_REEL.find(([a, b]) => t >= a && t < b);
  if (fr) {
    const k = interpolate(t, [fr[0], fr[0] + 0.25], [0, 1], { ...cl, easing: Easing.out(Easing.back(2)) });
    return (
      <div style={{ position: "absolute", top: 1600, left: 40, right: 40, textAlign: "center", fontFamily, transform: `scale(${0.7 + 0.3 * k})`, opacity: k }}>
        <div style={{ fontWeight: 800, fontSize: 30, letterSpacing: 6, color: "#fff", WebkitTextStroke: "6px #000", paintOrder: "stroke fill" }}>O STREAMER:</div>
        <div style={{ fontWeight: 900, fontSize: 92, lineHeight: 1.05, color: AMARELO, WebkitTextStroke: "12px #000", paintOrder: "stroke fill" }}>“{fr[2]}”</div>
      </div>
    );
  }
  const i = BLOCOS.findIndex((b, j) => t >= b[0].s - 0.05 && t < Math.min(BLOCOS[j + 1]?.[0].s ?? 999, b[b.length - 1].e + 0.5) - 0.05);
  if (i < 0) return null;
  return (
    <div style={{ position: "absolute", top: 1620, left: 50, right: 50, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 18px" }}>
      {BLOCOS[i].map((p, j) => (
        <span key={j} style={{ fontFamily, fontWeight: 900, fontSize: 66, lineHeight: 1.1, color: DESTAQUE.test(limpa(p.w)) ? AMARELO : "#fff", opacity: t >= p.s - 0.03 ? 1 : 0, WebkitTextStroke: "10px #000", paintOrder: "stroke fill" }}>
          {p.w.replace(/[.,:!]$/, "")}
        </span>
      ))}
    </div>
  );
};

// ---------- som: voz + efeitos leves (sem música) ----------
const TROCAS = [ELE, CHEGOU, FALOU, PELADA, TRAZ, BUSCA, GAP_B, DIAS, COMO, FECHO, FINAL];
const SONS: [number, string, number][] = [
  [0, "feixe", 0.22],
  [AOVIVO - 0.05, "clarao", 0.2],
  ...TROCAS.map((q) => [q - 0.05, "whoosh", 0.12] as [number, string, number]),
  [CHEGOU + 0.3, "feixe", 0.2],
  [VOLTA, "feixe", 0.24],
  [CLARAO - 0.05, "clarao", 0.16],
  [TROFEU, "sino", 0.18],
  [TROFEU + 0.05, "pop", 0.16],
  ...ITENS.map(([, , pal]) => [em(pal, COMO) - 0.15, "pop", 0.14] as [number, string, number]),
  [FECHO - 0.1, "feixe", 0.2],
];

// música: Sci-Fi Score (Mixkit, Arulo), clima de mistério/disco voador; abaixa sob a voz e quase some na reação original
const falando = (t: number) => PAL.some((p) => t >= p.s - 0.04 && t <= p.e + 0.04);
const DUCK: number[] = (() => {
  const bruto = Array.from({ length: DURACAO_FASE24 }, (_, i) => {
    const t = i / FPS;
    if (t >= GAP && t < DIAS - 0.1) return 0.22;
    return falando(t) ? 0.5 : 0.85;
  });
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

export const VideoFase24: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Reel t={t} />
      {t < FINAL + 0.3 && <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 76%, rgba(0,0,0,.7) 80%, rgba(0,0,0,.82) 100%)" }} />}
      <Flash t={t} />
      <ComoVer t={t} />
      <Titulos t={t} />
      <Trofeu t={t} />
      <VyceNoGta t={t} f={f} />
      <Legenda t={t} />
      <Audio src={staticFile(ARQ("narracao.wav"))} />
      <Audio src={staticFile(ARQ("trilha.wav"))} volume={(q) => 0.7 * (DUCK[q] ?? 0.5)} />
      {SONS.map(([q, nome, vol], i) => (
        <Sequence key={i} from={Math.max(0, Math.round(q * FPS))} durationInFrames={90}>
          <Audio src={staticFile(nome === "whoosh" ? "fase-extra/sons/whoosh.wav" : ARQ(`sfx-${nome}.wav`))} volume={vol * 0.5} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
