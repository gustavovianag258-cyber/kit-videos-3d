import { loadFont } from "@remotion/google-fonts/Montserrat";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { Acabamento, PalcoCinema } from "../../cinema/Palco";
import { Camera } from "../Estudio";
import { Mascote3D, PoseMascote } from "../Mascote3D";
import { QuartoGamer } from "../QuartoGamer";
import dados from "./dados.json";

// Fase Extra, Fase 14: "O GTA 6 sai dia 19 e o Brasil só quer saber de uma coisa" (~65 s).
// Mesma pauta da Fase 13 (a "loja de sapatos"), em pegada de humor: zoa a ansiedade do público, sem nada explícito
// na tela e sem imagem de vazamento. Hot Coffee (2005) como virada real; o Jason malhando e o tiozinho da praia
// (capturas oficiais) como piada; o Boobie que só quer um hit; a dica da mãe.
const { fontFamily } = loadFont("normal", { weights: ["600", "800", "900"], subsets: ["latin"] });
export const FPS = 30;
const FIM = dados.duracao + 1.0;
export const DURACAO_FASE14 = Math.ceil(FIM * FPS);
const ROXO = "#B66BFF";
const ROSA = "#FF4FD8";
const VERDE = "#4ADE80";
const VERMELHO = "#FF4D5E";
const AMARELO = "#FFD84A";
const LARANJA = "#FF8A3D";
const AZUL = "#7CC8FF";
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const suave = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
const entra = (t: number, a: number, d = 0.3) => interpolate(t, [a, a + d], [0, 1], { ...cl, easing: Easing.out(Easing.back(1.7)) });
const sombra = "0 0 26px rgba(182,107,255,.85), 0 5px 0 #2B0F66, 0 0 8px rgba(0,0,0,.9)";

const INICIO_FINAL = 57.76; // "Você está na Fase Extra"
const ENQUETE = 60.15;
const emSetup = (t: number) => t >= INICIO_FINAL;
const CLIPE = (n: string) => `fase-extra/fase14/clipes/${n}.mp4`;
const FOTO = (n: string) => `fase-extra/fase14/fotos/${n}.jpg`;
const LETREIRO = FOTO("letreiro-vc");
const NOITE = FOTO("noite");
const CIDADE = FOTO("cidade");
const JASON = FOTO("jason-malhando");
const PRAIA = FOTO("praia");
const BOOBIE = FOTO("boobie-rosto");

// ---------- planos: vídeo (clipe) ou foto desfocada de fundo ----------
type Plano = { de: number; clipe?: string; foto?: string; src?: number; x?: number; x2?: number; zoom?: number; chicote?: boolean };
const PLANOS: Plano[] = [
  { de: 0.0, foto: LETREIRO, zoom: 1.2 },
  { de: 5.51, clipe: "avenida", src: 0, x: 0.5, x2: 0.45, chicote: true },
  { de: 8.09, clipe: "festa", src: 0, x: 0.45, x2: 0.55, chicote: true, zoom: 1.12 },
  { de: 9.91, clipe: "avenida", src: 1.5, x: 0.5, x2: 0.42 },
  // vazamento em câmera lenta
  { de: 12.07, clipe: "rua", src: 0, x: 0.55, x2: 0.45, chicote: true },
  { de: 14.6, clipe: "noite", src: 0, x: 0.45, x2: 0.55, zoom: 1.15 },
  // 2005
  { de: 18.49, foto: CIDADE, chicote: true },
  { de: 22.36, clipe: "moto", src: 0, x: 0.5, x2: 0.45 },
  { de: 25.89, foto: NOITE, chicote: true },
  { de: 29.25, clipe: "festa", src: 3.0, x: 0.5, x2: 0.45, chicote: true, zoom: 1.1 },
  // corpo
  { de: 31.51, foto: JASON, chicote: true },
  { de: 35.95, foto: PRAIA, chicote: true },
  { de: 38.56, foto: BOOBIE, chicote: true },
  { de: 47.04, clipe: "festa", src: 5.5, x: 0.45, x2: 0.55, chicote: true },
  { de: 49.18, clipe: "avenida", src: 0, x: 0.5, x2: 0.45 },
  // a mãe
  { de: 51.73, clipe: "moto", src: 1.0, x: 0.5, x2: 0.45, chicote: true },
  { de: 55.04, clipe: "noite", src: 0, x: 0.45, x2: 0.55, zoom: 1.12 },
];
const planoEm = (t: number) => {
  let i = 0;
  while (i + 1 < PLANOS.length && PLANOS[i + 1].de <= t) i++;
  return i;
};
const fimDoPlano = (i: number) => Math.min(PLANOS[i + 1]?.de ?? FIM, INICIO_FINAL + 0.4);

const Fundo: React.FC<{ t: number }> = ({ t }) => {
  const i = planoEm(t);
  const p = PLANOS[i];
  const fim = fimDoPlano(i);
  if (t > fim) return null;
  const k = interpolate(t, [p.de, fim], [0, 1], cl);
  const punch = 1 + 0.08 * (1 - suave(t, p.de, p.de + 0.25));
  const ch = p.chicote ? 1 - suave(t, p.de, p.de + 0.22) : 0;
  const x = interpolate(k, [0, 1], [p.x ?? 0.5, p.x2 ?? p.x ?? 0.5]);
  const z = (p.zoom ?? 1.06) * (1 + 0.07 * k) * punch;
  const dur = Math.max(1, Math.round((fim - p.de) * FPS) + 2);
  const cheia = { position: "absolute", width: 1080, height: 1920, left: 0, top: 0, objectFit: "cover", transform: `scale(${z})`, transformOrigin: `${x * 100}% 50%` } as const;
  return (
    <Sequence key={i} from={Math.round(p.de * FPS)} durationInFrames={dur} layout="none">
      <AbsoluteFill style={{ overflow: "hidden", filter: ch > 0.02 ? `blur(${10 * ch}px)` : undefined, transform: `translateX(${ch * 260}px)` }}>
        {p.clipe && <OffthreadVideo src={staticFile(CLIPE(p.clipe))} startFrom={Math.round((p.src ?? 0) * FPS)} muted style={{ ...cheia, filter: "brightness(1.12) contrast(1.05) saturate(1.15)" }} />}
        {p.foto && <Img src={staticFile(p.foto)} style={{ ...cheia, filter: "blur(36px) brightness(.5) saturate(1.3)", transform: `scale(${1.3 * z})` }} />}
      </AbsoluteFill>
    </Sequence>
  );
};

// ---------- peças comuns ----------
const Chip: React.FC<{ t: number; de: number; cor: string; children: React.ReactNode; tam?: number; riscado?: boolean }> = ({ t, de, cor, children, tam = 42, riscado }) => {
  const q = entra(t, de, 0.25);
  const r = riscado ? suave(t, de + 0.35, de + 0.6) : 0;
  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 12, margin: "8px 6px 0", fontWeight: 900, fontSize: tam, color: "#fff", background: "rgba(20,10,40,.85)", border: `4px solid ${cor}`, borderRadius: 18, padding: "4px 20px", boxShadow: `0 0 20px ${cor}`, opacity: q, transform: `scale(${0.5 + 0.5 * q})`, whiteSpace: "nowrap" }}>
      {children}
      {riscado && <div style={{ position: "absolute", left: "4%", top: "50%", height: 7, width: `${92 * r}%`, background: VERMELHO, borderRadius: 4, boxShadow: `0 0 10px ${VERMELHO}` }} />}
    </div>
  );
};
const Selo: React.FC<{ texto: string; cor: string; t: number; de: number }> = ({ texto, cor, t, de }) => {
  const k = entra(t, de, 0.25);
  return (
    <div style={{ display: "inline-block", marginTop: 16, transform: `scale(${0.6 + 0.4 * k}) rotate(${(1 - k) * -8}deg)`, opacity: k, fontFamily, fontWeight: 800, fontSize: 27, letterSpacing: 3, color: "#111", background: cor, padding: "6px 18px", borderRadius: 10, boxShadow: `0 0 24px ${cor}99`, whiteSpace: "nowrap" }}>
      {texto}
    </div>
  );
};
const Bloco: React.FC<{ t: number; de: number; ate: number; children: React.ReactNode; gancho?: boolean; topo?: number }> = ({ t, de, ate, children, gancho, topo }) => {
  if (t < de - 0.05 || t > ate + 0.05) return null;
  const k = entra(t, de);
  const s = suave(t, ate - 0.15, ate);
  const tx = gancho ? Math.sin(t * 61) * 14 * (1 - suave(t, de + 0.1, de + 0.6)) : 0;
  return <div style={{ position: "absolute", top: topo ?? 650, left: 60, right: 180, textAlign: "center", color: "#fff", fontFamily, opacity: k * (1 - s), transform: `translateX(${tx}px) scale(${0.7 + 0.3 * k})` }}>{children}</div>;
};
const G: React.FC<{ tam: number; children: React.ReactNode; cor?: string }> = ({ tam, children, cor = "#fff" }) => <div style={{ fontWeight: 900, fontSize: Math.round(tam * 0.74), lineHeight: 0.95, letterSpacing: -2, color: cor, textShadow: sombra, whiteSpace: "nowrap" }}>{children}</div>;
const P: React.FC<{ children: React.ReactNode; cor?: string }> = ({ children, cor = "#F3E8FF" }) => <div style={{ fontWeight: 800, fontSize: 36, letterSpacing: 4, color: cor, textShadow: sombra, marginTop: 6 }}>{children}</div>;

// quadro com foto oficial (sem desfoque), com leve zoom
const Quadro: React.FC<{ t: number; de: number; ate: number; foto: string; pos: string; w?: number; h?: number; cor?: string; zoom?: number }> = ({ t, de, ate, foto, pos, w = 820, h = 560, cor = "#fff", zoom = 1.08 }) => (
  <div style={{ margin: "0 auto", width: w, height: h, borderRadius: 30, overflow: "hidden", border: `6px solid ${cor}`, boxShadow: `0 0 40px ${cor}66, 0 20px 40px rgba(0,0,0,.6)` }}>
    <Img src={staticFile(foto)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: pos, transformOrigin: "60% 0%", transform: `scale(${zoom + 0.08 * interpolate(t, [de, ate], [0, 1], cl)})` }} />
  </div>
);
const Janela: React.FC<{ t: number; de: number; ate: number; topo?: number; children: React.ReactNode }> = ({ t, de, ate, topo = 240, children }) => {
  if (t < de || t > ate) return null;
  const k = entra(t, de, 0.35);
  const sai = suave(t, ate - 0.2, ate);
  return <div style={{ position: "absolute", top: topo, left: 60, right: 180, textAlign: "center", fontFamily, color: "#fff", opacity: k * (1 - sai), transform: `scale(${0.7 + 0.3 * k})` }}>{children}</div>;
};

// ---------- gancho: tudo que o jogo tem x a única pergunta ----------
const ITENS: [string, number][] = [
  ["🗺️ MAPA GIGANTE", 2.05],
  ["🎬 HISTÓRIA NOVA", 3.02],
  ["🎵 34 MÚSICAS INÉDITAS", 3.84],
];
const Gancho: React.FC<{ t: number }> = ({ t }) => {
  const cinza = suave(t, 6.0, 6.5);
  const pergunta = entra(t, 8.09, 0.3);
  const treme = t > 8.09 ? Math.sin(t * 60) * 12 * (1 - suave(t, 8.2, 9.0)) : 0;
  return (
    <Janela t={t} de={0} ate={9.88} topo={260}>
      <div style={{ fontWeight: 900, fontSize: 44, letterSpacing: 6, color: AMARELO, textShadow: sombra }}>GTA 6 · DIA 19</div>
      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", alignItems: "center", filter: `grayscale(${cinza})`, opacity: (1 - 0.55 * cinza) * (1 - 0.8 * pergunta), transform: `scale(${1 - 0.12 * cinza}) translateY(${-60 * pergunta}px)` }}>
        {ITENS.map(([txt, d]) => (
          <Chip key={txt} t={t} de={d} cor={VERDE} tam={48}>
            {txt} <span style={{ color: VERDE }}>✓</span>
          </Chip>
        ))}
      </div>
      <div style={{ marginTop: 10, opacity: entra(t, 6.07) * (1 - pergunta) }}>
        <P>E O BRASILEIRO SÓ QUER SABER…</P>
      </div>
      <div style={{ marginTop: 0, opacity: pergunta, transform: `translateX(${treme}px) scale(${0.5 + 0.5 * pergunta}) rotate(-3deg)` }}>
        <G tam={110} cor={ROSA}>👠 CADÊ A LOJA</G>
        <G tam={110} cor={ROSA}>DE SAPATOS?</G>
      </div>
    </Janela>
  );
};
const Julgando: React.FC<{ t: number }> = ({ t }) => (
  <Bloco t={t} de={9.91} ate={12.02} topo={700}>
    <G tam={100}>NÃO TÔ</G>
    <G tam={100}>JULGANDO</G>
    <div style={{ opacity: entra(t, 10.93), transform: `rotate(-4deg) scale(${0.6 + 0.4 * entra(t, 10.93)})` }}>
      <Selo texto="(TÔ UM POUQUINHO)" cor={AMARELO} t={t} de={10.93} />
    </div>
  </Bloco>
);

// ---------- o vazamento em câmera lenta ----------
const Rec: React.FC<{ t: number }> = ({ t }) => {
  const de = 12.07;
  const ate = 18.45;
  if (t < de || t > ate) return null;
  const k = entra(t, de, 0.3);
  const sai = suave(t, ate - 0.2, ate);
  const zoom = 100 + 300 * suave(t, 15.58, 16.2);
  const canto = (pos: React.CSSProperties) => <div style={{ position: "absolute", width: 70, height: 70, ...pos }} />;
  return (
    <AbsoluteFill style={{ opacity: k * (1 - sai), fontFamily }}>
      <div style={{ position: "absolute", left: 50, right: 50, top: 220, bottom: 640 }}>
        {canto({ left: 0, top: 0, borderLeft: "8px solid #fff", borderTop: "8px solid #fff" })}
        {canto({ right: 0, top: 0, borderRight: "8px solid #fff", borderTop: "8px solid #fff" })}
        {canto({ left: 0, bottom: 0, borderLeft: "8px solid #fff", borderBottom: "8px solid #fff" })}
        {canto({ right: 0, bottom: 0, borderRight: "8px solid #fff", borderBottom: "8px solid #fff" })}
        <div style={{ position: "absolute", left: 30, top: 24, display: "flex", alignItems: "center", gap: 12, fontWeight: 900, fontSize: 44, color: "#fff" }}>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: VERMELHO, opacity: Math.sin(t * 8) > 0 ? 1 : 0.2 }} /> REC
        </div>
        <div style={{ position: "absolute", right: 30, top: 24, opacity: entra(t, 14.75), fontWeight: 900, fontSize: 44, color: AMARELO }}>⏯ 0.25x</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 260, textAlign: "center", opacity: entra(t, 15.58) }}>
          <div style={{ display: "inline-block", fontWeight: 900, fontSize: 90, color: "#fff", textShadow: sombra }}>🔍 ZOOM {Math.round(zoom)}%</div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 420, textAlign: "center" }}>
          <Chip t={t} de={16.35} cor={AZUL} tam={46}>🧑‍🔬 PRA ESTUDAR FÍSICA</Chip>
          <div style={{ marginTop: 14, opacity: entra(t, 17.44), transform: `rotate(-3deg) scale(${0.5 + 0.5 * entra(t, 17.44)})` }}>
            <G tam={100} cor={AMARELO}>…DO CABELO 💇</G>
          </div>
          <div style={{ opacity: entra(t, 17.95) }}>
            <P>CLARO 🙄</P>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 2005: a Rockstar já se queimou ----------
const Jornal: React.FC<{ t: number }> = ({ t }) => {
  const carimbo = entra(t, 25.89, 0.25);
  return (
    <Janela t={t} de={18.49} ate={29.2} topo={250}>
      <div style={{ opacity: entra(t, 18.49) }}>
        <G tam={100} cor={AMARELO}>CALMA.</G>
      </div>
      <div style={{ position: "relative", margin: "18px auto 0", width: 780, padding: "26px 30px 30px", background: "#F4EFE4", color: "#1b1b1b", borderRadius: 8, boxShadow: "0 20px 50px rgba(0,0,0,.6)", transform: `rotate(-1.5deg) scale(${0.6 + 0.4 * entra(t, 20.93)})`, opacity: entra(t, 20.93) }}>
        <div style={{ fontFamily: "Georgia, serif", fontWeight: 700, fontSize: 30, letterSpacing: 4, borderBottom: "3px solid #1b1b1b", paddingBottom: 8 }}>JULHO DE 2005</div>
        <div style={{ fontFamily: "Georgia, serif", fontWeight: 900, fontSize: 64, lineHeight: 1.0, marginTop: 14 }}>GTA SAN ANDREAS</div>
        <div style={{ fontWeight: 800, fontSize: 34, marginTop: 14, opacity: entra(t, 22.36) }}>🔒 CONTEÚDO ESCONDIDO NO CÓDIGO</div>
        <div style={{ fontWeight: 800, fontSize: 34, marginTop: 8, opacity: entra(t, 24.8) }}>🔓 SÓ ABRIA COM MOD</div>
        <div style={{ position: "absolute", right: 10, bottom: -62, opacity: carimbo, transform: `rotate(-12deg) scale(${2 - carimbo})`, border: `8px solid ${VERMELHO}`, color: VERMELHO, fontWeight: 900, fontSize: 46, padding: "4px 18px", borderRadius: 12, background: "rgba(244,239,228,.85)" }}>SÓ PRA ADULTOS</div>
      </div>
      <div style={{ marginTop: 50 }}>
        <Chip t={t} de={26.95} cor={VERMELHO} tam={44}>🛒 SAIU DAS LOJAS</Chip>
        <Chip t={t} de={28.45} cor={AZUL} tam={44}>🔁 RELANÇADO</Chip>
      </div>
    </Janela>
  );
};
const Pinca: React.FC<{ t: number }> = ({ t }) => (
  <Bloco t={t} de={29.25} ate={31.45} topo={640} gancho>
    <P>DESDE ENTÃO:</P>
    <G tam={140} cor={AMARELO}>COM PINÇA 🤏</G>
  </Bloco>
);

// ---------- o que a Rockstar mostrou de corpo ----------
const Placa: React.FC<{ t: number; de: number; texto: string; cor: string; tam?: number }> = ({ t, de, texto, cor, tam = 50 }) => (
  <div style={{ marginTop: 14, opacity: entra(t, de), transform: `scale(${0.6 + 0.4 * entra(t, de)})` }}>
    <div style={{ display: "inline-block", fontWeight: 900, fontSize: tam, color: "#fff", background: "rgba(20,10,40,.88)", border: `4px solid ${cor}`, borderRadius: 18, padding: "4px 24px", whiteSpace: "nowrap", boxShadow: `0 0 22px ${cor}` }}>{texto}</div>
  </div>
);
const Corpo: React.FC<{ t: number }> = ({ t }) => {
  const revela = suave(t, 33.78, 33.95);
  return (
    <Janela t={t} de={31.51} ate={35.92}>
      <P cor={AMARELO}>A ROCKSTAR MOSTROU DE CORPO:</P>
      <div style={{ position: "relative", marginTop: 12 }}>
        <div style={{ filter: `blur(${30 * (1 - revela)}px)` }}>
          <Quadro t={t} de={31.51} ate={35.92} foto={JASON} pos="35% 25%" h={640} cor={AZUL} zoom={1.15} />
        </div>
        {revela < 1 && <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 200, color: "#fff", opacity: 1 - revela }}>?</div>}
      </div>
      <Placa t={t} de={33.87} texto="O JASON." cor={AZUL} tam={60} />
      <div>
        <Chip t={t} de={34.44} cor={AMARELO} tam={44}>SEM CAMISA</Chip>
        <Chip t={t} de={35.27} cor={VERDE} tam={44}>🏋️ MALHANDO</Chip>
      </div>
    </Janela>
  );
};
const Praia: React.FC<{ t: number }> = ({ t }) => (
  <Janela t={t} de={35.95} ate={38.5}>
    <P cor={AMARELO}>NA PRAIA DE VICE CITY:</P>
    <div style={{ marginTop: 12 }}>
      <Quadro t={t} de={35.95} ate={38.5} foto={PRAIA} pos="62% 45%" h={640} cor={LARANJA} zoom={1.5} />
    </div>
    <div style={{ marginTop: 6, opacity: entra(t, 37.31), transform: `rotate(-3deg) scale(${0.5 + 0.5 * entra(t, 37.31)})` }}>
      <G tam={110} cor={LARANJA}>TIOZINHO</G>
      <G tam={110} cor={LARANJA}>DE SUNGA 🩳</G>
    </div>
  </Janela>
);

// ---------- o Boobie quer um hit ----------
const Boobie: React.FC<{ t: number }> = ({ t }) => (
  <Janela t={t} de={38.56} ate={47.0}>
    <Chip t={t} de={38.65} cor={ROSA} tam={46}>👠 A LOJA EXISTE ✓</Chip>
    <div style={{ marginTop: 12 }}>
      <Quadro t={t} de={38.56} ate={47.0} foto={BOOBIE} pos="28% 22%" w={760} h={540} cor={ROSA} zoom={1.35} />
    </div>
    <Placa t={t} de={40.4} texto="🃏 JACK OF HEARTS · BOOBIE IKE" cor={ROSA} tam={40} />
    <Placa t={t} de={43.55} texto="💼 PRO BOOBIE: NEGÓCIO" cor={AZUL} tam={44} />
    <div style={{ marginTop: 14, opacity: entra(t, 46.38), transform: `scale(${0.5 + 0.5 * entra(t, 46.38)})` }}>
      <div style={{ display: "inline-block", fontWeight: 900, fontSize: 50, color: "#111", background: AMARELO, borderRadius: 16, padding: "4px 22px", whiteSpace: "nowrap" }}>O SONHO DELE: UM HIT 🎵</div>
    </div>
  </Janela>
);
const Lados: React.FC<{ t: number }> = ({ t }) => {
  const lado = (quem: string, ic: string, cor: string, de: number) => (
    <div style={{ flex: 1, opacity: entra(t, de), transform: `scale(${0.5 + 0.5 * entra(t, de)})`, padding: "26px 0", borderRadius: 28, background: "rgba(14,8,30,.88)", border: `5px solid ${cor}`, boxShadow: `0 0 26px ${cor}` }}>
      <div style={{ fontWeight: 900, fontSize: 46, color: cor }}>{quem}</div>
      <div style={{ fontSize: 200, lineHeight: 1.1, transform: `rotate(${Math.sin(t * 4 + de) * 6}deg)` }}>{ic}</div>
    </div>
  );
  return (
    <Janela t={t} de={47.04} ate={51.7} topo={300}>
      <div style={{ display: "flex", gap: 24, alignItems: "stretch" }}>
        {lado("VOCÊ", "👠", ROSA, 47.71)}
        {lado("O BOOBIE", "🎵", AMARELO, 49.18)}
      </div>
      <div style={{ marginTop: 20 }}>
        <Selo texto="IGUAL VENDEDOR BATENDO META 📈" cor={VERDE} t={t} de={50.65} />
      </div>
    </Janela>
  );
};

// ---------- dica de amigo: a mãe ----------
const Mae: React.FC<{ t: number }> = ({ t }) => {
  const mae = entra(t, 56.29, 0.3);
  const treme = t > 56.29 ? Math.sin(t * 55) * 10 * (1 - suave(t, 56.4, 57.2)) : 0;
  return (
    <Janela t={t} de={51.73} ate={57.7} topo={640}>
      <div style={{ display: "inline-block", fontWeight: 900, fontSize: 44, color: "#111", background: AMARELO, borderRadius: 14, padding: "6px 22px", boxShadow: `0 0 26px ${AMARELO}` }}>⚠️ DICA DE AMIGO</div>
      <div style={{ marginTop: 18, opacity: entra(t, 52.69) }}>
        <P>ANTES DE ENTRAR NA LOJA DE SAPATOS…</P>
      </div>
      <div style={{ marginTop: 10, opacity: entra(t, 55.04), transform: `scale(${0.5 + 0.5 * entra(t, 55.04)})` }}>
        <G tam={96}>OLHA PRA TRÁS 👀</G>
      </div>
      <div style={{ marginTop: 22, opacity: mae, transform: `translateX(${treme}px) scale(${0.4 + 0.6 * mae}) rotate(-3deg)` }}>
        <div style={{ display: "inline-block", padding: "18px 30px", borderRadius: 28, background: "rgba(14,8,30,.9)", border: `5px solid ${VERMELHO}`, boxShadow: `0 0 30px ${VERMELHO}` }}>
          <div style={{ fontSize: 130, lineHeight: 1 }}>👩🧺</div>
          <div style={{ fontWeight: 900, fontSize: 44, color: "#fff", marginTop: 8 }}>SUA MÃE COM A ROUPA LAVADA</div>
        </div>
      </div>
    </Janela>
  );
};

// ---------- Vyce: facecam ----------
const boca = (f: number) => (dados.boca as number[])[f] ?? 0;
const pisca = (t: number) => {
  const c = t % 4.3;
  return c > 1.4 && c < 1.52;
};
const poseFala = (t: number, extra: Partial<PoseMascote> = {}): PoseMascote => ({
  bracoE: [0.02 - 0.15 * Math.max(0, Math.sin(t * 5.1)), 0, -0.12],
  cotoveloE: 0.4 + 0.2 * Math.sin(t * 4.3),
  bracoD: [-0.5 - 0.25 * Math.max(0, Math.sin(t * 3.7 + 1)), 0, 0.25],
  cotoveloD: 1.1 + 0.25 * Math.sin(t * 5.7),
  tronco: 0.02 * Math.sin(t * 1.9),
  cabeca: [0.04 * Math.sin(t * 3.1) + 0.03 * Math.sin(t * 7.2), 0.12 * Math.sin(t * 1.3), 0.04 * Math.sin(t * 1.1)],
  ...extra,
});
const REACOES = [10.0, 11.0, 56.3];
const JANELAS: [number, number][] = [
  [9.91, 12.02], // não tô julgando / tô um pouquinho
  [51.73, 57.7], // dica de amigo: a mãe
];
const Facecam: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const k = JANELAS.reduce((m, [a, b]) => Math.max(m, entra(t, a, 0.3) * (1 - suave(t, b - 0.25, b))), 0);
  const reage = REACOES.reduce((m, r) => Math.max(m, 1 - Math.abs(t - r) * 1.6), 0);
  const W = 300;
  const H = 360;
  if (k <= 0.01) return null;
  return (
    <div style={{ position: "absolute", left: 1080 - W - 40, top: 250, width: W, height: H, borderRadius: 26, overflow: "hidden", border: `5px solid ${ROXO}`, boxShadow: `0 0 ${30 + 25 * Math.max(0, reage)}px ${ROXO}, 0 10px 30px rgba(0,0,0,.6)`, transform: `scale(${(0.5 + 0.5 * k) * (1 + 0.06 * Math.max(0, reage))})`, transformOrigin: "100% 0%", opacity: k, background: "#140a2a" }}>
      <ThreeCanvas width={W} height={H} camera={{ fov: 32, near: 0.05, far: 50 }} gl={{ toneMapping: THREE.ACESFilmicToneMapping, antialias: true }}>
        <Camera pos={[0.1 + 0.05 * Math.sin(t * 0.6), 1.68, 1.22]} alvo={[0, 1.57, 0]} />
        <hemisphereLight args={["#B9A2F2", "#1A1030", 0.9]} />
        <directionalLight position={[-1.2, 2.2, 2.4]} intensity={2.6} color="#F6EEFF" />
        <pointLight position={[1.2, 1.7, 0.6]} intensity={5} color={ROSA} distance={4} />
        <pointLight position={[-1.3, 1.4, 0.2]} intensity={5} color="#5B6CFF" distance={4} />
        <mesh position={[0, 1.4, -1.2]}>
          <planeGeometry args={[6, 4]} />
          <meshStandardMaterial color="#1B1035" />
        </mesh>
        <Mascote3D giro={-0.15 + 0.1 * Math.sin(t * 0.7)} pose={poseFala(t, reage > 0.3 ? { bracoD: [-1.7, 0, 0.3], cotoveloD: 1.5 } : {})} boca={boca(f)} pisca={pisca(t)} olhar={0.6} />
      </ThreeCanvas>
      <div style={{ position: "absolute", left: 12, top: 10, fontFamily, fontWeight: 900, fontSize: 20, letterSpacing: 3, color: "#fff", background: ROSA, padding: "3px 10px", borderRadius: 8 }}>● VYCE</div>
    </div>
  );
};

// ---------- Vyce no quarto gamer (final) + enquete ----------
const OPCOES: [string, string, number, string][] = [
  ["🎬", "A HISTÓRIA", 61.02, AZUL],
  ["👠", "\"CONHECER A CIDADE\"", 62.33, ROSA],
];
const Setup: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const a = INICIO_FINAL;
  if (t < a - 0.3) return null;
  const k = suave(t, a - 0.3, a + 0.2);
  const olha = suave(t, a + 0.25, a + 0.7);
  const pos: [number, number, number] = [0.45 - (t - a) * 0.06, 1.5, 3.6 - (t - a) * 0.1];
  const troca = suave(t, ENQUETE - 0.2, ENQUETE + 0.1);
  return (
    <AbsoluteFill style={{ opacity: k, transform: `scale(${1.2 - 0.2 * k})` }}>
      <Sequence from={Math.round(a * FPS) - 10} layout="none">
        <PalcoCinema ceu="estudio" fundo="#0B1016" fov={45} luzCeu={0.2} brilhoCeu={0.03}>
          <Camera pos={pos} alvo={[-0.5, 1.12, -0.15]} />
          <QuartoGamer t={t} boca={boca(f)} pisca={pisca(t)} olhaCamera={olha} />
          <Acabamento foco={Math.hypot(pos[0] + 0.2, pos[1] - 1.3, pos[2])} desfoque={4} brilho={0.8} saturacao={0.15} contraste={0.12} vinheta={0.45} ao={0} />
        </PalcoCinema>
      </Sequence>
      <div style={{ position: "absolute", top: 270, left: 60, right: 180, textAlign: "center", color: "#fff", fontFamily, transform: `scale(${0.8 + 0.2 * entra(t, a + 0.2)})`, opacity: entra(t, a + 0.2) * (1 - troca) }}>
        <div style={{ fontWeight: 800, fontSize: 38, letterSpacing: 8, color: "#E6D2FF", textShadow: sombra }}>VOCÊ ESTÁ NA</div>
        <div style={{ fontWeight: 900, fontSize: 112, lineHeight: 0.95, letterSpacing: -2, textShadow: sombra }}>FASE EXTRA</div>
        <div style={{ fontWeight: 800, fontSize: 40, letterSpacing: 8, marginTop: 8, textShadow: sombra, opacity: entra(t, a + 1.3) }}>COM VYCE</div>
      </div>
      <div style={{ position: "absolute", top: 240, left: 60, right: 180, textAlign: "center", fontFamily, opacity: troca }}>
        <div style={{ fontWeight: 800, fontSize: 34, letterSpacing: 5, color: "#E6D2FF", textShadow: sombra }}>DIA 19, PRIMEIRA PARADA:</div>
        <div style={{ fontWeight: 900, fontSize: 84, lineHeight: 0.95, color: "#fff", textShadow: sombra }}>SEJA SINCERO</div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 12 }}>
          {OPCOES.map(([ic, nome, d, cor], i) => (
            <Chip key={i} t={t} de={d} cor={cor} tam={42}>
              <span style={{ color: "#111", background: cor, borderRadius: 10, padding: "0 12px" }}>{i + 1}</span>
              <span>{ic}</span>
              <span>{nome}</span>
            </Chip>
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", top: 1090, left: 60, right: 180, textAlign: "center", opacity: entra(t, a + 1.7) }}>
        <div style={{ display: "inline-block", fontFamily, fontWeight: 900, fontSize: 40, letterSpacing: 1, color: "#fff", background: "rgba(20,10,40,.7)", border: `3px solid ${ROSA}`, borderRadius: 16, padding: "6px 22px", boxShadow: `0 0 22px ${ROSA}`, transform: `scale(${0.7 + 0.3 * entra(t, a + 1.7)})` }}>
          @faseextra.br
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- legenda ----------
const DESTAQUE = /^(GTA|6|19|Mapa|gigante|história|34|músicas|brasileiro|loja|sapatos\?|sapatos|sapato|julgando|pouquinho|Vazou|câmera|lenta|zoom|física|cabelo|claro|Rockstar|queimou|2005|escondido|código|San|Andreas|mod|adultos|lojas|relançado|pinça|corpo|Jason|camisa|Malhando|praia|Tiozinho|sunga|Jack|Hearts|Boobie|Ike|negócio|gravadora|hit|música|vendedor|meta|amigo|trás|mãe|lavada|Fase|Extra|Vyce|sincero|primeira|parada\?|Comenta)$/i;
type Pal = { w: string; s: number; e: number };
const PAL = dados.palavras as Pal[];
const BLOCOS: Pal[][] = (() => {
  const b: Pal[][] = [];
  let c: Pal[] = [];
  PAL.forEach((p, i) => {
    c.push(p);
    const n = PAL[i + 1];
    if (c.length >= 3 || /[.,?!:]$/.test(p.w) || !n || n.s - p.e > 0.35) {
      b.push(c);
      c = [];
    }
  });
  return b;
})();
const Legenda: React.FC<{ t: number }> = ({ t }) => {
  const i = BLOCOS.findIndex((b, j) => t >= b[0].s - 0.05 && t < Math.min(BLOCOS[j + 1]?.[0].s ?? 999, b[b.length - 1].e + 0.6) - 0.05);
  if (i < 0) return null;
  return (
    <div style={{ position: "absolute", top: 1300, left: 60, right: 180, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 28px" }}>
      {BLOCOS[i].map((p, j) => {
        const ativo = t >= p.s;
        const dest = DESTAQUE.test(p.w.replace(/[.,?!:]$/g, ""));
        const pulo = ativo ? interpolate(t, [p.s, p.s + 0.1, p.s + 0.22], [0.75, 1.15, 1], cl) : 1;
        return (
          <span key={j} style={{ fontFamily, fontWeight: 900, fontSize: 74, lineHeight: 1.08, color: dest ? "#E2B8FF" : "#fff", opacity: ativo ? 1 : 0, transform: `scale(${pulo})`, display: "inline-block", WebkitTextStroke: "10px #000", paintOrder: "stroke fill", textShadow: dest ? "0 0 24px rgba(182,107,255,.95)" : "0 6px 10px rgba(0,0,0,.6)" }}>
            {p.w.replace(/[.,:!]$/, "")}
          </span>
        );
      })}
    </div>
  );
};

// ---------- sons ----------
const falando = (t: number) => PAL.some((p) => t >= p.s - 0.04 && t <= p.e + 0.04);
const IMPACTOS = [0, 8.09, 17.44, 25.89, 33.78, 37.31, 46.38, 56.29];
const SONS: { s: string; t: number; v: number }[] = [
  { s: "dum", t: 0.0, v: 0.6 },
  { s: "whoosh", t: 5.49, v: 0.35 },
  { s: "dum", t: 8.09, v: 0.55 },
  { s: "whoosh", t: 9.89, v: 0.4 },
  { s: "whoosh", t: 12.05, v: 0.45 },
  { s: "carimbo", t: 17.44, v: 0.5 },
  { s: "whoosh", t: 18.47, v: 0.45 },
  { s: "carimbo", t: 25.89, v: 0.55 },
  { s: "dum", t: 29.25, v: 0.5 },
  { s: "whoosh", t: 31.49, v: 0.45 },
  { s: "carimbo", t: 33.78, v: 0.5 },
  { s: "whoosh", t: 35.93, v: 0.45 },
  { s: "carimbo", t: 37.31, v: 0.5 },
  { s: "whoosh", t: 38.54, v: 0.45 },
  { s: "carimbo", t: 46.38, v: 0.5 },
  { s: "whoosh", t: 47.02, v: 0.45 },
  { s: "whoosh", t: 51.71, v: 0.45 },
  { s: "dum", t: 56.29, v: 0.55 },
  { s: "whoosh", t: INICIO_FINAL - 0.1, v: 0.45 },
];

const DUCK: number[] = (() => {
  const bruto = Array.from({ length: DURACAO_FASE14 }, (_, i) => (falando(i / FPS) ? 0.42 : 1));
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

export const VideoFase14: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const corte = PLANOS.some((p) => p.de > 0 && t >= p.de && t < p.de + 2 / FPS) && !emSetup(t) ? 0.2 : 0;
  const flash = Math.min(0.8, IMPACTOS.reduce((m, a) => m + interpolate(t, [a, a + 0.04, a + 0.28], [0, a === 0 ? 0.35 : 0.45, 0], cl), 0));
  const tremor = IMPACTOS.reduce((m, a) => (t >= a ? Math.max(m, 1 - suave(t, a, a + 0.35)) : m), 0);
  const tx = Math.sin(t * 83) * 10 * tremor;
  const ty = Math.cos(t * 71) * 8 * tremor;
  const noFundo = !emSetup(t);
  const escurece = t > 12.07 && t < 31.5 ? 0.25 : t > 47 && t < INICIO_FINAL ? 0.2 : 0;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ transform: `translate(${tx}px,${ty}px) scale(1.02)` }}>
        {noFundo && <Fundo t={t} />}
        {noFundo && <AbsoluteFill style={{ background: `rgba(8,4,20,${escurece})` }} />}
        {noFundo && <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,4,24,.5) 0%, rgba(10,4,24,.08) 22%, rgba(10,4,24,0) 50%, rgba(10,4,24,.12) 72%, rgba(10,4,24,.55) 100%)" }} />}
      </AbsoluteFill>
      <Setup t={t} f={f} />

      <Gancho t={t} />
      <Julgando t={t} />
      <Rec t={t} />
      <Jornal t={t} />
      <Pinca t={t} />
      <Corpo t={t} />
      <Praia t={t} />
      <Boobie t={t} />
      <Lados t={t} />
      <Mae t={t} />

      <Facecam t={t} f={f} />
      <Legenda t={t} />

      <AbsoluteFill style={{ background: "#F5E9FF", opacity: flash, pointerEvents: "none" }} />
      <AbsoluteFill style={{ background: "#000", opacity: corte, pointerEvents: "none" }} />

      <Audio src={staticFile("fase-extra/fase14/narracao.wav")} />
      <Audio src={staticFile("fase-extra/fase14/trilha.wav")} volume={(q) => 0.63 * (DUCK[q] ?? 1)} />
      {SONS.map((s, i) => (
        <Sequence key={i} from={Math.round(s.t * FPS)} durationInFrames={60}>
          <Audio src={staticFile(`fase-extra/sons/${s.s}.wav`)} volume={(q) => s.v * (falando(s.t + q / FPS) ? 0.3 : 1)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
