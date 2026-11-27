import { loadFont } from "@remotion/google-fonts/Montserrat";
import { AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Acabamento, PalcoCinema } from "../../cinema/Palco";
import { Camera } from "../Estudio";
import { QuartoGamer } from "../QuartoGamer";
import dados from "./dados.json";

// Fase Extra, Fase 20: "O easter egg do GTA 6 é literalmente um ovo" — formato novo (modelo: Fases 18 e 19).
// 5 segredos achados no lançamento, cada um com o clipe real do jogador em tela cheia vertical e jogo de câmera;
// o último é o Davy Jones em êxtase pintando parede (imagem do post de @drayareturn, com zoom até o sorriso dele).
// Vyce só na voz e no final (quarto gamer + enquete). Tempos saem das palavras da narração (dados.json).
const { fontFamily } = loadFont("normal", { weights: ["600", "800", "900"], subsets: ["latin"] });
export const FPS = 30;
const FIM = dados.duracao + 1.0;
export const DURACAO_FASE20 = Math.ceil(FIM * FPS);
const ROXO = "#B66BFF";
const ROSA = "#FF4FD8";
const VERDE = "#4ADE80";
const VERMELHO = "#FF4D5E";
const AMARELO = "#FFD84A";
const AZUL = "#7CC8FF";
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const suave = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
const entra = (t: number, a: number, d = 0.35) => interpolate(t, [a, a + d], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) });
const sombra = "0 4px 22px rgba(0,0,0,.7)";
const ARQ = (n: string) => `fase-extra/fase20/${n}`;

// ---------- âncoras ----------
type Pal = { w: string; s: number; e: number };
const PAL = dados.palavras as Pal[];
const limpa = (w: string) => w.toLowerCase().replace(/[.,?!:…]/g, "");
const em = (palavra: string, depois = 0) => PAL.find((p) => limpa(p.w) === palavra && p.s >= depois)?.s ?? 999;
const GUIA = em("a", 4) - 0.05; // "A galera passou a madrugada"
const S1 = em("1");
const SA = em("no", em("celular", S1)); // "No San Andreas"
const S2 = em("2");
const S3 = em("3");
const S4 = em("4");
const S5 = em("5", S4);
const DAVY = em("e", em("azul", S5)); // "E o Davy Jones"
const FECHO = em("13", DAVY);
const iFase = PAL.findIndex((p) => limpa(p.w) === "fase" && p.s >= FECHO);
const INICIO_FINAL = iFase >= 3 ? PAL[iFase - 3].s : 999;
const ENQUETE = em("e", em("vyce", INICIO_FINAL)) - 0.1;
const emSetup = (t: number) => t >= INICIO_FINAL - 0.1;

// ---------- planos: clipe ou foto em tela cheia, sempre em movimento ----------
type Plano = { de: number; clipe?: string; foto?: string; src?: number; x?: number; x2?: number; zoom?: number; zoom2?: number; ox?: number; oy?: number; ox2?: number; oy2?: number; credito?: string; vertical?: boolean };
const C_OVO = "X · @XGARBETT";
const PLANOS: Plano[] = [
  { de: 0, clipe: "ovo", src: 33.6, x: 0.5, x2: 0.5, zoom: 1.0, zoom2: 1.2, credito: C_OVO },
  { de: em("e") - 0.05, clipe: "ovo", src: 42.6, x: 0.45, x2: 0.55, zoom: 1.05, zoom2: 1.2, credito: C_OVO },
  { de: GUIA, clipe: "ovo", src: 4.0, x: 0.35, x2: 0.65, zoom: 1.0, zoom2: 1.1, credito: C_OVO },
  { de: S1 - 0.1, clipe: "ovo", src: 17.0, x: 0.4, x2: 0.5, zoom: 1.05, zoom2: 1.2, credito: C_OVO },
  { de: em("são", S1) - 0.05, clipe: "ovo", src: 0.5, x: 0.55, x2: 0.4, zoom: 1.0, zoom2: 1.12, credito: C_OVO },
  { de: em("jogar", S1) - 0.1, clipe: "ovo", src: 33.0, x: 0.5, x2: 0.5, zoom: 1.0, zoom2: 1.25, credito: C_OVO },
  { de: em("carro", S1) - 0.1, clipe: "ovo", src: 41.5, x: 0.4, x2: 0.55, zoom: 1.05, zoom2: 1.2, credito: C_OVO },
  { de: SA - 0.1, clipe: "ovo", src: 48.0, x: 0.5, x2: 0.45, zoom: 1.0, zoom2: 1.15, credito: C_OVO },
  { de: S2 - 0.1, clipe: "cachorro", src: 0, x: 0.5, x2: 0.55, zoom: 1.05, zoom2: 1.25, credito: "X · @CHIZPLAYS" },
  { de: S3 - 0.1, clipe: "gato", src: 3.0, x: 0.55, x2: 0.45, zoom: 1.05, zoom2: 1.25, credito: "X · @CARTOONSOTMOON" },
  { de: S4 - 0.1, foto: "furries", vertical: true, zoom: 1.0, zoom2: 1.18, ox: 50, oy: 30, ox2: 50, oy2: 45, credito: "X · @TOONHIVE" },
  { de: S5 - 0.1, clipe: "pintura", src: 0, x: 0.45, x2: 0.55, zoom: 1.05, zoom2: 1.2, credito: "X · @PIRAT_NATION" },
  { de: DAVY - 0.05, foto: "davy", zoom: 1.0, zoom2: 2.6, ox: 78, oy: 40, ox2: 16, oy2: 14, credito: "X · @DRAYARETURN" },
  { de: FECHO - 0.1, clipe: "pintura", src: 8.5, x: 0.4, x2: 0.55, zoom: 1.05, zoom2: 1.2, credito: "X · @PIRAT_NATION" },
  { de: em("jogando", FECHO) - 0.15, clipe: "ovo", src: 34.0, x: 0.5, x2: 0.5, zoom: 1.0, zoom2: 1.25, credito: C_OVO },
];
const planoEm = (t: number) => {
  let i = -1;
  while (i + 1 < PLANOS.length && PLANOS[i + 1].de <= t) i++;
  return i;
};
const Fundo: React.FC<{ t: number }> = ({ t }) => {
  const i = planoEm(t);
  if (i < 0) return null;
  const p = PLANOS[i];
  const fim = Math.min(PLANOS[i + 1]?.de ?? FIM, INICIO_FINAL + 0.3);
  if (t > fim) return null;
  const k = interpolate(t, [p.de, fim], [0, 1], { ...cl, easing: Easing.inOut(Easing.sin) });
  const soco = 1 + 0.08 * (1 - suave(t, p.de, p.de + 0.3));
  const desde = t - p.de;
  const batida = desde > 2.4 ? interpolate((desde - 2.4) % 2.4, [0, 0.22], [1.05, 1], { ...cl, easing: Easing.out(Easing.cubic) }) : 1;
  const x = interpolate(k, [0, 1], [p.x ?? 0.5, p.x2 ?? p.x ?? 0.5]);
  const z = interpolate(k, [0, 1], [p.zoom ?? 1.04, p.zoom2 ?? 1.12]) * soco * batida;
  const dur = Math.max(1, Math.round((fim - p.de) * FPS) + 2);
  const W = (16 / 9) * 1920;
  const ox = interpolate(k, [0, 1], [p.ox ?? 50, p.ox2 ?? p.ox ?? 50]);
  const oy = interpolate(k, [0, 1], [p.oy ?? 50, p.oy2 ?? p.oy ?? 50]);
  return (
    <Sequence key={i} from={Math.round(p.de * FPS)} durationInFrames={dur} layout="none">
      <AbsoluteFill style={{ overflow: "hidden", background: "#000" }}>
        {p.clipe && (
          <OffthreadVideo src={staticFile(ARQ(`clipes/${p.clipe}.mp4`))} startFrom={Math.round((p.src ?? 0) * FPS)} muted style={{ position: "absolute", height: 1920, width: W, left: -x * (W - 1080), top: 0, transform: `scale(${z})`, transformOrigin: `${x * 100}% 50%`, filter: `brightness(${p.clipe === "gato" ? 1.45 : 1.08}) saturate(1.1)` }} />
        )}
        {p.foto && !p.vertical && (
          // foto deitada (Davy Jones): começa no rolo de tinta (direita), desliza e termina com zoom no rosto dele
          (() => {
            const W2 = 1920 * (2048 / 1447);
            const esq = interpolate(k, [0, 0.55], [-(W2 - 1080), 0], { ...cl, easing: Easing.inOut(Easing.cubic) });
            const zz = interpolate(k, [0.45, 1], [1.02, 2.3], { ...cl, easing: Easing.inOut(Easing.cubic) }) * soco * batida;
            const rx = (330 / 2048) * W2 + esq; // rosto dele na tela
            const ry = (210 / 1447) * 1920;
            const tx = interpolate(k, [0.45, 1], [0, 540 - rx], cl);
            const ty = interpolate(k, [0.45, 1], [0, 760 - ry], cl);
            return (
              <div style={{ position: "absolute", inset: 0, transform: `translate(${tx}px, ${ty}px) scale(${zz})`, transformOrigin: `${rx}px ${ry}px` }}>
                <Img src={staticFile(ARQ(`fotos/${p.foto}.jpg`))} style={{ position: "absolute", height: 1920, width: W2, left: esq, top: 0, filter: "brightness(1.04) saturate(1.1)" }} />
              </div>
            );
          })()
        )}
        {p.foto && p.vertical && (
          <Img src={staticFile(ARQ(`fotos/${p.foto}.jpg`))} style={{ position: "absolute", width: 1080, height: 1920, objectFit: "cover", transform: `scale(${z})`, transformOrigin: `${ox}% ${oy}%` }} />
        )}
        {p.credito && <div style={{ position: "absolute", right: 30, bottom: 30, fontFamily, fontWeight: 800, fontSize: 24, letterSpacing: 3, color: "#fff", background: "rgba(0,0,0,.55)", borderRadius: 8, padding: "4px 12px" }}>{p.credito}</div>}
      </AbsoluteFill>
    </Sequence>
  );
};

// ---------- peças ----------
const Rotulo: React.FC<{ cor: string; children: React.ReactNode }> = ({ cor, children }) => <div style={{ fontWeight: 800, fontSize: 32, letterSpacing: 8, color: cor, textShadow: sombra }}>{children}</div>;
const Titulo: React.FC<{ tam?: number; cor?: string; children: React.ReactNode }> = ({ tam = 92, cor = "#fff", children }) => <div style={{ fontWeight: 900, fontSize: tam, lineHeight: 0.98, letterSpacing: -1, color: cor, textShadow: sombra }}>{children}</div>;
type TipoSelo = "COM VÍDEO" | "NO JOGO" | "A GALERA DIZ" | "5 ACHADOS NO LANÇAMENTO";
const COR_SELO: Record<TipoSelo, string> = { "COM VÍDEO": AMARELO, "NO JOGO": VERDE, "A GALERA DIZ": ROSA, "5 ACHADOS NO LANÇAMENTO": "#fff" };
const Selo: React.FC<{ tipo: TipoSelo; t: number; de: number }> = ({ tipo, t, de }) => (
  <div style={{ display: "inline-block", marginTop: 16, fontWeight: 800, fontSize: 24, letterSpacing: 4, color: "#111", background: COR_SELO[tipo], borderRadius: 8, padding: "4px 14px", opacity: entra(t, de), transform: `scale(${0.85 + 0.15 * entra(t, de)})`, transformOrigin: "0% 50%" }}>
    {tipo === "COM VÍDEO" ? "A GALERA ACHOU · COM VÍDEO" : tipo === "NO JOGO" ? "ESTÁ NO JOGO" : tipo}
  </div>
);
const Bloco: React.FC<{ t: number; de: number; ate: number; topo?: number; children: React.ReactNode }> = ({ t, de, ate, topo = 240, children }) => {
  if (t < de - 0.05 || t > ate) return null;
  const k = entra(t, de, 0.4);
  const s = suave(t, ate - 0.25, ate);
  const boia = Math.sin(t * 1.6) * 5;
  return <div style={{ position: "absolute", left: 70, right: 70, top: topo + boia, fontFamily, color: "#fff", opacity: k * (1 - s), transform: `translateX(${(1 - k) * -50}px)` }}>{children}</div>;
};
const Caixa: React.FC<{ children: React.ReactNode }> = ({ children }) => <div style={{ display: "inline-block", background: "rgba(10,4,24,.74)", borderRadius: 18, padding: "16px 26px" }}>{children}</div>;
const Linha: React.FC<{ t: number; de: number; ic: string; txt: string; cor?: string; tam?: number }> = ({ t, de, ic, txt, cor = "#fff", tam = 42 }) => {
  const k = entra(t, de, 0.3);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 14, opacity: k, transform: `translateX(${(1 - k) * -40}px) scale(${0.9 + 0.1 * k})`, transformOrigin: "0% 50%", width: "fit-content", background: "rgba(14,8,30,.8)", borderLeft: `8px solid ${cor}`, borderRadius: 12, padding: "10px 22px 10px 18px" }}>
      <span style={{ fontSize: tam + 6 }}>{ic}</span>
      <span style={{ fontWeight: 900, fontSize: tam, color: "#fff", whiteSpace: "nowrap" }}>{txt}</span>
    </div>
  );
};
const Num: React.FC<{ n: number; cor: string; titulo: string[]; t: number; de: number; selo: TipoSelo }> = ({ n, cor, titulo, t, de, selo }) => (
  <Caixa>
    <Rotulo cor={cor}>SEGREDO {n}</Rotulo>
    {titulo.map((l) => (
      <Titulo key={l} tam={74}>
        {l}
      </Titulo>
    ))}
    <Selo tipo={selo} t={t} de={de + 0.6} />
  </Caixa>
);

// ---------- blocos ----------
const Abertura: React.FC<{ t: number }> = ({ t }) => {
  const lit = em("literalmente");
  const risca = suave(t, lit - 0.1, lit + 0.25);
  return (
    <Bloco t={t} de={0.1} ate={GUIA - 0.05}>
      <Caixa>
        <Rotulo cor={AZUL}>GTA 6 · ACHADO NO LANÇAMENTO</Rotulo>
        <div style={{ position: "relative", width: "fit-content" }}>
          <Titulo tam={110}>EASTER EGG</Titulo>
          <div style={{ position: "absolute", left: 0, top: "48%", height: 12, width: `${risca * 100}%`, background: VERMELHO, borderRadius: 6 }} />
        </div>
        <div style={{ opacity: entra(t, em("ovo") - 0.15), transform: `scale(${1.4 - 0.4 * entra(t, em("ovo") - 0.15)})`, transformOrigin: "0% 50%" }}>
          <Titulo tam={86} cor={AMARELO}>OVO. DE VERDADE. 🥚</Titulo>
        </div>
      </Caixa>
    </Bloco>
  );
};

const Guia: React.FC<{ t: number }> = ({ t }) => {
  const cinco = em("5", GUIA);
  const davy = em("davy", GUIA);
  return (
    <Bloco t={t} de={GUIA} ate={S1 - 0.05}>
      <Rotulo cor="#E2C4FF">A GALERA VIROU A MADRUGADA</Rotulo>
      <Titulo>5 SEGREDOS</Titulo>
      <Titulo>DO GTA 6</Titulo>
      <div style={{ marginTop: 30, display: "flex", gap: 18 }}>
        {[1, 2, 3, 4, 5].map((n) => {
          const k = entra(t, cinco + n * 0.08, 0.25);
          return (
            <div key={n} style={{ width: 120, height: 120, borderRadius: 24, border: `5px solid ${n === 5 ? AMARELO : ROXO}`, background: "rgba(14,8,30,.75)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 64, opacity: k, transform: `scale(${0.6 + 0.4 * k})` }}>
              {n}
            </div>
          );
        })}
      </div>
      <Linha t={t} de={davy - 0.3} ic="👀" txt="O ÚLTIMO TEM O DAVY JONES" cor={AMARELO} />
    </Bloco>
  );
};

const Seg1: React.FC<{ t: number }> = ({ t }) => (
  <Bloco t={t} de={S1} ate={SA - 0.05}>
    <Num n={1} cor={AMARELO} titulo={["O OVO NO TOPO", "DA TORRE"]} t={t} de={S1} selo="COM VÍDEO" />
    <Linha t={t} de={em("ninho", S1)} ic="🥚" txt="NINHO COM OVO PINTADO" cor={AMARELO} />
    <Linha t={t} de={em("são", S1)} ic="⬆️" txt="6 MIN DE ESCADA" cor={AZUL} />
    <Linha t={t} de={em("carro", S1)} ic="🚗" txt="CAI NO CARRO DO CARA" cor={VERMELHO} />
    <Linha t={t} de={em("celular", S1)} ic="▶" txt="+1 MILHÃO DE VIEWS" cor={VERDE} tam={36} />
  </Bloco>
);

const SanAndreas: React.FC<{ t: number }> = ({ t }) => {
  const agora = em("agora", SA);
  return (
    <Bloco t={t} de={SA} ate={S2 - 0.05}>
      <Caixa>
        <Rotulo cor="#FFB070">GTA SAN ANDREAS · 2004</Rotulo>
        <div style={{ marginTop: 10, fontWeight: 900, fontSize: 52, lineHeight: 1.05 }}>“There are no Easter Eggs up here. Go away.”</div>
        <div style={{ marginTop: 6, fontWeight: 700, fontSize: 28, color: "#ddd" }}>placa no alto da ponte Gant</div>
      </Caixa>
      <div style={{ marginTop: 24, opacity: entra(t, agora), transform: `scale(${1.3 - 0.3 * entra(t, agora)})`, transformOrigin: "0% 50%" }}>
        <Caixa>
          <Rotulo cor={VERDE}>GTA 6 · 2026</Rotulo>
          <Titulo tam={80} cor={AMARELO}>TEM. É UM OVO. 🥚</Titulo>
        </Caixa>
      </div>
    </Bloco>
  );
};

const Seg2: React.FC<{ t: number }> = ({ t }) => (
  <Bloco t={t} de={S2} ate={S3 - 0.05}>
    <Num n={2} cor={AZUL} titulo={["O CACHORRO", "SALVA-VIDAS"]} t={t} de={S2} selo="COM VÍDEO" />
    <Linha t={t} de={em("latido", S2)} ic="🐕" txt="PERDIDO NO MAR? ESCUTA UM LATIDO" cor={AZUL} tam={36} />
    <Linha t={t} de={em("óculos", S2)} ic="🕶️" txt="DE ÓCULOS, NO JET SKI" cor={AMARELO} />
    {t >= em("dizem", S2) - 0.1 && (
      <div>
        <Linha t={t} de={em("dizem", S2)} ic="🏝️" txt="ILHA DOS CACHORROS?" cor={ROSA} />
        <Selo tipo="A GALERA DIZ" t={t} de={em("dizem", S2) + 0.2} />
      </div>
    )}
  </Bloco>
);

const Seg3: React.FC<{ t: number }> = ({ t }) => (
  <Bloco t={t} de={S3} ate={S4 - 0.05}>
    <Num n={3} cor={VERMELHO} titulo={["O GATO QUE", "DEFENDE O CARRO"]} t={t} de={S3} selo="COM VÍDEO" />
    <Linha t={t} de={em("parte", S3)} ic="🐈" txt="PARTE PRA CIMA" cor={VERMELHO} />
    <Linha t={t} de={em("janela", S3) - 0.2} ic="💨" txt="SAI PELA JANELA" cor={AMARELO} />
  </Bloco>
);

const Seg4: React.FC<{ t: number }> = ({ t }) => (
  <Bloco t={t} de={S4} ate={S5 - 0.05} topo={1050}>
    <Num n={4} cor={ROSA} titulo={["FURRY É PROIBIDO", "EM LEONIDA"]} t={t} de={S4} selo="NO JOGO" />
    <Linha t={t} de={em("carinha", S4)} ic="🚫" txt="“UwU” = CRIME" cor={VERMELHO} />
    <Linha t={t} de={em("culto", S4)} ic="🐾" txt="CULTO SECRETO: THE FURVERTS" cor={ROSA} tam={38} />
  </Bloco>
);

const Seg5: React.FC<{ t: number }> = ({ t }) => (
  <Bloco t={t} de={S5} ate={DAVY - 0.05}>
    <Num n={5} cor={VERDE} titulo={["PINTAR A CASA", "PRA LUCIA"]} t={t} de={S5} selo="COM VÍDEO" />
    <Linha t={t} de={em("agradar", S5)} ic="❤️" txt="+ RELAÇÃO COM A LUCIA" cor={ROSA} />
    <Linha t={t} de={em("40", S5)} ic="⌛" txt="40 MIN PINTANDO" cor={AMARELO} />
    <Linha t={t} de={em("azul", S5) - 0.3} ic="😰" txt="“E SE ELA NÃO GOSTAR DO AZUL?”" cor={AZUL} tam={36} />
  </Bloco>
);

const Davy: React.FC<{ t: number }> = ({ t }) => {
  const rolo = em("rolo", DAVY);
  const melhor = em("melhor", DAVY);
  return (
    <Bloco t={t} de={DAVY} ate={FECHO - 0.05} topo={1100}>
      <Caixa>
        <Rotulo cor={AMARELO}>ENQUANTO ISSO, NO BRASIL</Rotulo>
        <Titulo tam={84}>O DAVY JONES</Titulo>
        <div style={{ opacity: entra(t, rolo - 0.2) }}>
          <Titulo tam={56} cor={AMARELO}>E O BARULHO DO ROLO 🖌️</Titulo>
        </div>
        <div style={{ marginTop: 8, opacity: entra(t, melhor), transform: `scale(${1.3 - 0.3 * entra(t, melhor)})`, transformOrigin: "0% 50%" }}>
          <Rotulo cor="#fff">EM ÊXTASE 🤩</Rotulo>
        </div>
      </Caixa>
    </Bloco>
  );
};

const Fecho: React.FC<{ t: number }> = ({ t }) => {
  const brasil = em("brasil", FECHO);
  return (
    <Bloco t={t} de={FECHO} ate={INICIO_FINAL - 0.1} topo={420}>
      <Rotulo cor="#E2C4FF">RESUMINDO</Rotulo>
      <Titulo tam={130}>13 ANOS</Titulo>
      <Titulo tam={66}>DE ESPERA…</Titulo>
      <div style={{ marginTop: 22 }}>
        <Linha t={t} de={brasil} ic="🖌️" txt="…PRA PINTAR PAREDE" cor={VERDE} tam={50} />
        <Linha t={t} de={em("jogando", FECHO)} ic="🥚" txt="…E JOGAR OVO DA TORRE" cor={AMARELO} tam={50} />
      </div>
    </Bloco>
  );
};

// ---------- Vyce no quarto gamer + enquete ----------
const boca = (f: number) => (dados.boca as number[])[f] ?? 0;
const pisca = (t: number) => {
  const c = t % 4.3;
  return c > 1.4 && c < 1.52;
};
const OPCOES: [string, string, number, string][] = [
  ["🥚", "CAÇAR SEGREDO", em("caçar", ENQUETE), AMARELO],
  ["🖌️", "PINTAR A CASA", em("pintar", ENQUETE), VERDE],
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
      <div style={{ position: "absolute", top: 230, left: 70, right: 70, fontFamily, opacity: entra(t, a + 0.2) * (1 - troca) }}>
        <Rotulo cor="#E2C4FF">VOCÊ ESTÁ NA</Rotulo>
        <Titulo tam={108}>FASE EXTRA</Titulo>
        <div style={{ marginTop: 6, opacity: entra(t, a + 1.3) }}>
          <Rotulo cor="#fff">COM VYCE</Rotulo>
        </div>
      </div>
      <div style={{ position: "absolute", top: 210, left: 70, right: 70, fontFamily, opacity: troca }}>
        <Rotulo cor="#E2C4FF">E VOCÊ?</Rotulo>
        <Titulo tam={78}>NO GTA 6, VOCÊ VAI…</Titulo>
        {OPCOES.map(([ic, nome, d, cor], i) => (
          <Linha key={i} t={t} de={d} ic={ic} txt={`${i + 1} · ${nome}`} cor={cor} />
        ))}
      </div>
      <div style={{ position: "absolute", top: 1090, left: 70, fontFamily, fontWeight: 900, fontSize: 44, color: "#fff", textShadow: sombra, opacity: entra(t, a + 1.7) }}>@faseextra.br</div>
    </AbsoluteFill>
  );
};

// ---------- legenda ----------
const DESTAQUE = /^(easter|egg|ovo|literalmente|segredo|5|davy|jones|torre|ninho|6|minutos|escada|carro|celular|san|andreas|entregou|mar|latido|cachorro|óculos|jet|ski|ilha|gato|janela|jornal|furries|crime|culto|furverts|perigoso|pintar|lucia|40|azul|barulho|rolo|13|brasil|parede|fase|extra|vyce|comenta)$/i;
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
  const i = BLOCOS.findIndex((b, j) => t >= b[0].s - 0.05 && t < Math.min(BLOCOS[j + 1]?.[0].s ?? 999, b[b.length - 1].e + 0.5) - 0.05);
  if (i < 0) return null;
  const naParte4 = t >= S4 && t < S5;
  const noDavy = t >= DAVY && t < FECHO;
  const topo = emSetup(t) ? 1420 : naParte4 || noDavy ? 860 : 1560;
  return (
    <div style={{ position: "absolute", top: topo, left: 60, right: 60, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 20px" }}>
      {BLOCOS[i].map((p, j) => (
        <span key={j} style={{ fontFamily, fontWeight: 900, fontSize: 64, lineHeight: 1.1, color: DESTAQUE.test(limpa(p.w)) ? "#E2C4FF" : "#fff", opacity: t >= p.s - 0.03 ? 1 : 0, WebkitTextStroke: "9px #000", paintOrder: "stroke fill", textShadow: "0 6px 12px rgba(0,0,0,.5)" }}>
          {p.w.replace(/[.,:!]$/, "")}
        </span>
      ))}
    </div>
  );
};

// ---------- som ----------
const falando = (t: number) => PAL.some((p) => t >= p.s - 0.04 && t <= p.e + 0.04);
const VIRADAS = [GUIA, S1, SA, S2, S3, S4, S5, DAVY, FECHO, INICIO_FINAL - 0.1];
const DUCK: number[] = (() => {
  const bruto = Array.from({ length: DURACAO_FASE20 }, (_, i) => (falando(i / FPS) ? 0.42 : 1));
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

export const VideoFase20: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {!emSetup(t) && <Fundo t={t} />}
      {!emSetup(t) && <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,4,24,.68) 0%, rgba(10,4,24,.3) 36%, rgba(10,4,24,0) 52%, rgba(10,4,24,.55) 100%)" }} />}
      <Setup t={t} f={f} />

      <Abertura t={t} />
      <Guia t={t} />
      <Seg1 t={t} />
      <SanAndreas t={t} />
      <Seg2 t={t} />
      <Seg3 t={t} />
      <Seg4 t={t} />
      <Seg5 t={t} />
      <Davy t={t} />
      <Fecho t={t} />

      <Legenda t={t} />

      <Audio src={staticFile(ARQ("narracao.wav"))} />
      <Audio src={staticFile(ARQ("trilha.wav"))} volume={(q) => 0.63 * (DUCK[q] ?? 1)} />
      {VIRADAS.map((v, i) => (
        <Sequence key={i} from={Math.max(0, Math.round((v - 0.05) * FPS))} durationInFrames={45}>
          <Audio src={staticFile("fase-extra/sons/whoosh.wav")} volume={() => 0.3 * (falando(v) ? 0.5 : 1)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
