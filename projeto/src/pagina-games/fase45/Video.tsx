import { loadFont } from "@remotion/google-fonts/Montserrat";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { Camera } from "../Estudio";
import { CorPele, Mascote3D, PoseMascote } from "../Mascote3D";
import dados from "./dados.json";

// Fase Extra, Fase 45: "O portal secreto do GTA 6 que te leva pra Vice City antiga" — a partir de um guia gringo (Misleading).
// clipes/jogo.mp4 = o vídeo inteiro em 30 fps (mesmos segundos). O jogo entra inteiro na largura, sem zoom, cortando só a faixa
// de baixo (y > 880: legenda queimada dele + legendas do jogo com palavrão) e, entre 383 e 394 s, o aviso dele no topo (y < 60).
// Memes do banco (Absolute Cinema no portal, DiCaprio nos prêmios). Voz só do Vyce, sem crédito, áudio do vídeo mudo.
const { fontFamily } = loadFont("normal", { weights: ["600", "800", "900"], subsets: ["latin"] });
export const FPS = 30;
const FIM = dados.duracao + 1.2;
export const DURACAO_FASE45 = Math.ceil(FIM * FPS);
const AMARELO = "#FFD84A";
const AZUL = "#6FD6FF";
const VERDE = "#7CFF9B";
const ROSA = "#FF7EB6";
const ROXO = "#C99BFF";
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const suave = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
const entra = (t: number, a: number, d = 0.3) => interpolate(t, [a, a + d], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) });
const sombra = "0 4px 22px rgba(0,0,0,.8)";
const ARQ = (n: string) => `fase-extra/fase45/${n}`;

// ---------- âncoras ----------
type Pal = { w: string; s: number; e: number };
const PAL = dados.palavras as Pal[];
const limpa = (w: string) => w.toLowerCase().replace(/[.,?!:…“”"]/g, "");
const em = (palavra: string, depois = 0) => PAL.find((p) => limpa(p.w) === palavra && p.s >= depois)?.s ?? 999;
const PREMIO = em("no", 5);
const TORRE = em("começa");
const DOZE = em("agora");
const EST0 = em("12", DOZE);
const MORRER = em("morrer");
const ULTIMA = em("na", em("fácil"));
const USINA = em("a", em("manhã"));
const PRONTO = em("e", em("esquerda"));
const SALA = em("vai", em("malibu"));
const VOLTA = em("quando", em("original"));
const FINAL = em("você", em("perguntando")) - 0.15;
const ENQ = em("e", em("vyce", FINAL));

// as 12 subestações (conferidas no vídeo base + Game Rant, games.gg, Beebom e The Based Otaku):
// [segundo do original com o botão sendo apertado, lugar, botão, letras pintadas na parede, x e y do ponto no mapa (quadro 1920x1080)]
// o mapa é a foto parada mapas/mNN.jpg (o mapa do jogo no momento em que ele marca o destino)
const ESTACOES: [number, string, string, string, number, number][] = [
  [62.0, "VICE CITY · BEIRA DO RIO", "D", "L", 939, 546],
  [113.5, "BALSERO", "D", "iF", 957, 540],
  [134.5, "KEY LENTO", "•", "Ei", 960, 540],
  [151.0, "PENMARCH ISLE", "A", "S", 960, 540],
  [171.0, "VICE CITY · BAYSIDE", "•", "P", 969, 531],
  [187.5, "PORT GELLHORN", "A", "A", 969, 558],
  [205.5, "HAMLET (SUDESTE)", "A", "Ss", 936, 516],
  [222.0, "GLORIANA KEY · TANQUES", "A", "iN", 951, 555],
  [251.5, "HAMLET (OESTE)", "•", "G", 972, 534],
  [269.0, "PORT GELLHORN (PONTA SUL)", "W", "Me", 960, 549],
  [284.0, "HAMLET (SUL)", "D", "B", 954, 594],
  [304.5, "NORTE DE GRASSRIVERS", "W", "Y", 972, 558],
];
const PASSO = (MORRER - 0.1 - EST0) / ESTACOES.length;
const estIni = (i: number) => EST0 - 0.1 + i * PASSO;

// ---------- planos (s = segundo do vídeo ORIGINAL; y0 = corte de cima) ----------
type Plano = { de: number; s: number; y0?: number; luz?: number; mapa?: number };
const PLANOS: Plano[] = [
  // gancho
  { de: 0, s: 357.0 },
  { de: em("leva") - 0.1, s: 395.5, luz: 1.25 },
  { de: em("e", 4) - 0.1, s: 360.5 },
  // prêmio
  { de: PREMIO - 0.1, s: 446.2, luz: 1.35 },
  { de: em("mas", PREMIO) - 0.1, s: 454.0 },
  // torre de Key Lento
  { de: TORRE - 0.1, s: 14.0, luz: 1 },
  { de: em("sobe") - 0.1, s: 19.5 },
  { de: em("liga", TORRE) - 0.1, s: 24.5 },
  { de: em("e", em("força")) - 0.1, s: 28.0 },
  { de: em("vai", TORRE) - 0.1, s: 31.0 },
  // 12 subestações
  { de: DOZE - 0.1, s: 41.0, luz: 1 },
  ...ESTACOES.map(([s], i) => ({ de: estIni(i), s, mapa: i + 1 })),
  // pode morrer
  { de: MORRER - 0.1, s: 319.5 },
  { de: em("só", MORRER) - 0.1, s: 118.0 },
  // mensagem + usina
  { de: ULTIMA - 0.1, s: 308.5 },
  { de: em("é", ULTIMA) - 0.1, s: 328.5, luz: 1 },
  { de: em("entre", ULTIMA) - 0.1, s: 336.0 },
  { de: USINA - 0.1, s: 341.0 },
  { de: em("mas", USINA) - 0.1, s: 347.5 },
  { de: em("lá", USINA) - 0.1, s: 356.0 },
  { de: em("o", em("dentro")) - 0.1, s: 367.5 },
  { de: em("puxa") - 0.1, s: 371.0 },
  // Vice City antiga
  { de: PRONTO - 0.1, s: 376.0 },
  { de: em("você", PRONTO) - 0.1, s: 383.5, y0: 60, luz: 1.25 },
  { de: em("dentro", PRONTO) - 0.1, s: 393.5, luz: 1.25 },
  { de: SALA - 0.1, s: 414.0 },
  { de: em("quem", SALA) - 0.1, s: 427.5 },
  { de: em("e", em("original")) - 0.1, s: 438.5 },
  // de volta: prêmios + ligação do Kent
  { de: VOLTA - 0.1, s: 446.2, luz: 1.35 },
  { de: em("a", em("tommy", VOLTA)) - 0.1, s: 455.0 },
  { de: em("e", em("suas")) - 0.1, s: 465.5, y0: 60 },
];
PLANOS.sort((a, b) => a.de - b.de);
// detalhes embaixo da janela (pedido: mostrar mais a camisa e a moto; nas subestações, o prédio onde fica o botão)
const DETALHES: Detalhe[] = [
  ...ESTACOES.map(([s], i) => ({ de: estIni(i), ate: estIni(i + 1) - 0.02, s: s - 0.3, x: 178, y: 0, w: 1564, rotulo: "O PRÉDIO" })),
  { de: PREMIO - 0.1, ate: em("mas", PREMIO) - 0.1, s: 0, x: 0, y: 0, w: 1, img: "camisa.jpg", rotulo: "A CAMISA DO TOMMY" },
  { de: em("mas", PREMIO) - 0.1, ate: TORRE - 0.1, s: 0, x: 0, y: 0, w: 1, img: "moto.jpg", rotulo: "A MOTO DO TOMMY" },
  { de: VOLTA - 0.1, ate: em("a", em("tommy", VOLTA)) - 0.1, s: 0, x: 0, y: 0, w: 1, img: "camisa.jpg", rotulo: "A CAMISA DO TOMMY" },
  { de: em("a", em("tommy", VOLTA)) - 0.1, ate: em("e", em("suas")) - 0.1, s: 0, x: 0, y: 0, w: 1, img: "moto.jpg", rotulo: "A MOTO DO TOMMY" },
  { de: em("e", em("suas")) - 0.1, ate: FINAL - 0.1, s: 0, x: 0, y: 0, w: 1, img: "moto.jpg", rotulo: "CAMISA + MOTO" },
];
const planoEm = (t: number) => {
  let i = -1;
  while (i + 1 < PLANOS.length && PLANOS[i + 1].de <= t) i++;
  return i;
};
const VIDEO = staticFile(ARQ("clipes/jogo.mp4"));
const CHEIO = 1920 / 1080;
const Quadro: React.FC<{ s: number; k: number; filtro?: string }> = ({ s, k, filtro }) => {
  const w = 1920 * k;
  const h = (w * 1080) / 1920;
  return <OffthreadVideo src={VIDEO} startFrom={Math.round(s * FPS)} muted style={{ position: "absolute", left: 540 - w / 2, top: 960 - h / 2, width: w, height: h, filter: filtro }} />;
};
// o jogo inteiro na largura (sem zoom), cortando embaixo (y > 880) e, quando precisa, em cima
// pedido do usuário (25/11): estava escuro demais → clareia toda a gameplay (o jogo tem muita cena de noite)
const CLARO = (luz: number) => `brightness(${luz}) contrast(1.06) saturate(1.15)`;
const esc = 1080 / 1920;
const Janela: React.FC<{ s: number; y0: number; z: number; luz?: number; mapa?: number; t: number }> = ({ s, y0, z, luz = 1.6, mapa, t }) => {
  const y1 = 880;
  const H = (y1 - y0) * esc;
  const topo = 960 - H / 2;
  const est = mapa ? ESTACOES[mapa - 1] : undefined;
  const pulso = (t * 1.6) % 1;
  return (
    <div style={{ position: "absolute", left: 0, top: topo, width: 1080, height: H, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,.6)" }}>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${z})` }}>
        {est ? (
          <>
            <Img src={staticFile(ARQ(`mapas/m${String(mapa).padStart(2, "0")}.jpg`))} style={{ position: "absolute", left: 0, top: -y0 * esc, width: 1080, height: 1080 * esc }} />
            {/* o ponto exato da subestação no mapa: anel que pulsa + seta "AQUI" */}
            <div style={{ position: "absolute", left: est[4] * esc - 60, top: (est[5] - y0) * esc - 60, width: 120, height: 120 }}>
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `7px solid ${ROSA}`, boxShadow: `0 0 18px ${ROSA}` }} />
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `5px solid ${ROSA}`, transform: `scale(${1 + 0.8 * pulso})`, opacity: 1 - pulso }} />
              <div style={{ position: "absolute", left: 60 - 80, top: -66, width: 160, textAlign: "center", fontFamily, fontWeight: 900, fontSize: 34, color: "#fff", WebkitTextStroke: "7px #000", paintOrder: "stroke fill" }}>AQUI ▼</div>
            </div>
          </>
        ) : (
          <OffthreadVideo src={VIDEO} startFrom={Math.round(s * FPS)} muted style={{ position: "absolute", left: 0, top: -y0 * esc, width: 1080, height: 1080 * esc, filter: CLARO(luz) }} />
        )}
      </div>
    </div>
  );
};
// detalhe embaixo da janela (entre o jogo e a legenda): o prédio da subestação ou o close da camisa e da moto
type Detalhe = { de: number; ate: number; s: number; x: number; y: number; w: number; rotulo: string; img?: string };
const Detalhe: React.FC<{ t: number }> = ({ t }) => {
  const d = DETALHES.find((x) => t >= x.de && t < x.ate);
  if (!d) return null;
  const W = 640;
  const H = (W * 9) / 16;
  const k = interpolate(t, [d.de, d.de + 0.15], [0.85, 1], { ...cl, easing: Easing.out(Easing.back(2)) });
  const e = W / d.w;
  return (
    <div style={{ position: "absolute", left: 540 - W / 2, top: 1192, width: W, height: H, borderRadius: 16, overflow: "hidden", border: "6px solid #fff", boxShadow: "0 16px 40px rgba(0,0,0,.7)", transform: `scale(${k})` }}>
      {d.img ? (
        <Img src={staticFile(ARQ(d.img))} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transform: `scale(${1.04 + 0.06 * suave(t, d.de, d.ate)})` }} />
      ) : (
      <Sequence from={Math.round(d.de * FPS)} layout="none">
        <OffthreadVideo src={VIDEO} startFrom={Math.round(d.s * FPS)} muted style={{ position: "absolute", left: -d.x * e, top: -d.y * e, width: 1920 * e, height: 1080 * e, filter: CLARO(1.7) }} />
      </Sequence>
      )}
      <div style={{ position: "absolute", left: 12, top: 10, fontFamily, fontWeight: 900, fontSize: 26, letterSpacing: 2, color: "#111", background: AMARELO, borderRadius: 8, padding: "2px 10px" }}>{d.rotulo}</div>
    </div>
  );
};
const Fundo: React.FC<{ t: number }> = ({ t }) => {
  const i = planoEm(t);
  if (i < 0 || t > FINAL + 0.3) return null;
  const p = PLANOS[i];
  const fim = Math.min(PLANOS[i + 1]?.de ?? FIM, FINAL + 0.3);
  const z = 1 + 0.02 * interpolate(t, [p.de, fim], [0, 1], { ...cl, easing: Easing.inOut(Easing.sin) });
  const dur = Math.max(1, Math.round((fim - p.de) * FPS) + 2);
  return (
    <Sequence key={i} from={Math.round(p.de * FPS)} durationInFrames={dur} layout="none">
      <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
        <AbsoluteFill style={{ transform: "scale(1.15)" }}>
          <Quadro s={p.s} k={CHEIO} filtro="blur(30px) brightness(0.8)" />
        </AbsoluteFill>
        <Janela s={p.s} y0={p.y0 ?? 0} z={z} luz={p.luz} mapa={p.mapa} t={t} />
      </AbsoluteFill>
    </Sequence>
  );
};

// ---------- título (em cima) ----------
type Tela = { de: number; ate: number; n?: string; rotulo?: string; cor: string; titulo: string; nota?: string };
const TELAS: Tela[] = [
  { de: 0.05, ate: PREMIO - 0.05, rotulo: "EASTER EGG DO GTA 6", cor: ROXO, titulo: "PORTAL PRA VICE CITY ANTIGA" },
  { de: PREMIO, ate: TORRE - 0.05, rotulo: "O PRÊMIO", cor: ROSA, titulo: "CAMISA + MOTO DO TOMMY" },
  { de: TORRE, ate: DOZE - 0.05, n: "1", rotulo: "KEY LENTO · SOBE ATÉ O TOPO", cor: AZUL, titulo: "TORRE DE RÁDIO" },
  { de: DOZE, ate: estIni(0) - 0.05, n: "2", rotulo: "NA ORDEM · SEM VIAGEM RÁPIDA", cor: AMARELO, titulo: "12 SUBESTAÇÕES" },
  ...ESTACOES.map(([, lugar, botao, letras], i) => ({ de: estIni(i), ate: estIni(i + 1) - 0.02, n: botao, rotulo: `SUBESTAÇÃO ${i + 1} DE 12 · APERTA ${botao === "•" ? "O PONTO" : botao}`, cor: AMARELO, titulo: lugar, nota: `PAREDE COM “${letras}” · SEM VIAGEM RÁPIDA` })),
  { de: MORRER, ate: ULTIMA - 0.05, rotulo: "SÓ NÃO MACHUCA NINGUÉM", cor: VERDE, titulo: "MORRER NÃO RESETA ✅" },
  { de: ULTIMA, ate: USINA - 0.05, n: "3", rotulo: "MENSAGEM: “U-235 REACTOR2 19-06”", cor: AZUL, titulo: "USINA T.H. · 19h ÀS 6h" },
  { de: USINA, ate: PRONTO - 0.05, n: "4", rotulo: "ENTRA PELA PORTA DO LADO", cor: ROXO, titulo: "REATOR 2 ⚡" },
  { de: PRONTO, ate: SALA - 0.05, rotulo: "VICE CITY ANTIGA · CARA DE PS2", cor: ROSA, titulo: "BOATE MALIBU" },
  { de: SALA, ate: VOLTA - 0.05, n: "5", rotulo: "SALA À ESQUERDA DO BAR", cor: AMARELO, titulo: "KENT PAUL" },
  { de: VOLTA, ate: FINAL - 0.1, rotulo: "MOTO: WESTERN MALIBU ZOMBIE BOBBER", cor: ROSA, titulo: "CAMISA + MOTO DO TOMMY", nota: "+ PINTURA LIBERADA NA VICE VINYL" },
];
const Titulos: React.FC<{ t: number }> = ({ t }) => {
  const tela = TELAS.find((x) => t >= x.de - 0.05 && t < x.ate);
  if (!tela) return null;
  const k = entra(t, tela.de, 0.25);
  const s = suave(t, tela.ate - 0.12, tela.ate);
  const kn = interpolate(t, [tela.de, tela.de + 0.35], [0, 1], { ...cl, easing: Easing.out(Easing.back(2)) });
  const n = tela.titulo.length;
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: 230, textAlign: "center", fontFamily, opacity: k * (1 - s) }}>
      {tela.n && (
        <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 120, height: 120, borderRadius: 60, background: tela.cor, color: "#111", fontWeight: 900, fontSize: tela.n === "•" ? 120 : 84, lineHeight: 1, marginBottom: 10, boxShadow: "0 6px 26px rgba(0,0,0,.6)", transform: `scale(${kn})` }}>{tela.n}</div>
      )}
      {tela.rotulo && <div style={{ fontWeight: 800, fontSize: 32, letterSpacing: 5, color: tela.cor, textShadow: sombra, marginBottom: 6, transform: `translateY(${(1 - k) * 16}px)` }}>{tela.rotulo}</div>}
      <div style={{ fontWeight: 900, fontSize: n > 22 ? 64 : n > 16 ? 74 : 92, lineHeight: 1.02, letterSpacing: -1, color: "#fff", WebkitTextStroke: "8px #000", paintOrder: "stroke fill", textShadow: sombra, transform: `translateY(${(1 - k) * 20}px) scale(${0.94 + 0.06 * k})` }}>{tela.titulo}</div>
      {tela.nota && <div style={{ marginTop: 10, fontWeight: 800, fontSize: 26, letterSpacing: 3, color: "#fff", opacity: 0.85, textShadow: sombra }}>{tela.nota}</div>}
    </div>
  );
};

// ---------- legenda (embaixo) ----------
const DESTAQUE = /^(gta|6|portal|secreto|vice|city|2002|tommy|vercetti|moto|camisa|key|lento|torre|botão|12|subestações|viagem|rápida|d|a|w|ponto|life|passing|me|by|reseta|estrela|t\.h|7|noite|segurança|porta|reator|2|alavanca|esquerda|playstation|malibu|kent|paul|suas|fase|extra|vyce|preguiça|comenta)$/i;
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
    <div style={{ position: "absolute", top: 1560, left: 50, right: 50, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 18px" }}>
      {BLOCOS[i].map((p, j) => (
        <span key={j} style={{ fontFamily, fontWeight: 900, fontSize: 66, lineHeight: 1.1, color: DESTAQUE.test(limpa(p.w)) ? AMARELO : "#fff", opacity: t >= p.s - 0.03 ? 1 : 0, WebkitTextStroke: "10px #000", paintOrder: "stroke fill" }}>
          {p.w.replace(/[.,:!]$/, "")}
        </span>
      ))}
    </div>
  );
};

// ---------- final: o Vyce DENTRO do GTA, do lado da moto do Tommy ----------
const boca = (f: number) => (dados.boca as number[])[f] ?? 0;
const pisca = (t: number) => {
  const c = t % 4.3;
  return c > 1.4 && c < 1.52;
};
const OPCOES: [string, string, string, string][] = [
  ["1", "🌀", "VOU FAZER HOJE", ROXO],
  ["2", "😴", "DÁ PREGUIÇA", AMARELO],
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
          <Quadro s={446.0} k={CHEIO} filtro="blur(5px)" />
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
            const kk = entra(t, em(i === 0 ? "vai" : "ou", ENQ) - 0.15);
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
  [em("portal", USINA) + 0.15, 1.4, "absolute-cinema.png", 936 / 725],
];
const pula = (t: number, a: number) => interpolate(t, [a, a + 0.12, a + 0.22], [0, 1.15, 1], cl);
const Memes: React.FC<{ t: number }> = ({ t }) => {
  const m = MEMES.find(([q, d]) => t >= q && t < q + d);
  if (!m) return null;
  const [q, d, arq, prop] = m;
  const w = 560;
  const k = pula(t, q) * (1 - suave(t, q + d - 0.12, q + d));
  return (
    <div style={{ position: "absolute", left: 540 - w / 2, top: 1235, width: w, height: w / prop, borderRadius: 18, overflow: "hidden", border: "8px solid #fff", boxShadow: "0 20px 50px rgba(0,0,0,.7)", transform: `scale(${k}) rotate(-3deg)` }}>
      <Img src={staticFile(ARQ(`memes/${arq}`))} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </div>
  );
};

// ---------- som: voz + música (Cyberpunk City, Mixkit) bem baixa + whoosh/pop nas telas + sons do banco pontuais ----------
const VIRAL = (n: string) => `fase-extra/sons/virais/${n}.wav`;
const BANCO = (n: string) => `fase-extra/banco/sons/${n}.wav`;
const CORTES = [PREMIO, TORRE, DOZE, MORRER, ULTIMA, USINA, SALA, VOLTA];
const SONS: [number, string, number][] = [
  ...CORTES.map((q) => [q - 0.05, "whoosh", 0.1] as [number, string, number]),
  ...ESTACOES.map((_, i) => [estIni(i) + 0.05, "pop", 0.11] as [number, string, number]),
  [FINAL, "whoosh", 0.1],
  [em("portal", USINA) + 0.15, BANCO("vine-boom"), 0.14],
  [PRONTO + 0.1, VIRAL("magic-reveal"), 0.18],
  [em("volta", SALA) + 0.1, VIRAL("woosh"), 0.2],
  [em("suas", VOLTA) + 0.15, VIRAL("cha-ching-dinheiro"), 0.2],
];
const falando = (t: number) => PAL.some((p) => t >= p.s - 0.04 && t <= p.e + 0.04);
const DUCK: number[] = (() => {
  const bruto = Array.from({ length: DURACAO_FASE45 }, (_, i) => (falando(i / FPS) ? 0.5 : 0.85));
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

export const VideoFase45: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Fundo t={t} />
      {t < FINAL + 0.3 && <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.35) 0%, rgba(0,0,0,0) 24%, rgba(0,0,0,0) 78%, rgba(0,0,0,.4) 100%)" }} />}
      <Titulos t={t} />
      <Detalhe t={t} />
      <Memes t={t} />
      <VyceNoGta t={t} f={f} />
      <Legenda t={t} />
      <Audio src={staticFile(ARQ("narracao.wav"))} />
      <Audio src={staticFile(ARQ("trilha.wav"))} volume={(q) => 0.12 * (DUCK[q] ?? 0.5)} />
      {SONS.map(([q, nome, vol], i) => (
        <Sequence key={i} from={Math.max(0, Math.round(q * FPS))} durationInFrames={90}>
          <Audio src={staticFile(nome === "whoosh" ? "fase-extra/sons/whoosh.wav" : nome.includes("/") ? nome : ARQ(`sfx-${nome}.wav`))} volume={vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
