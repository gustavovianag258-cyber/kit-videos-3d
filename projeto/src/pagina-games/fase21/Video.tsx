import { loadFont } from "@remotion/google-fonts/Montserrat";
import { AbsoluteFill, Audio, Easing, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Acabamento, PalcoCinema } from "../../cinema/Palco";
import { Camera } from "../Estudio";
import { QuartoGamer } from "../QuartoGamer";
import dados from "./dados.json";

// Fase Extra, Fase 21: "Como pegar o carro do Brian no GTA 6" — formato novo (modelo: Fases 18–20).
// Base: reel do @battlefieldbosh (Instagram, 19/11/2026), vertical, recortado sem as legendas em inglês dele
// (clipes/reel.mp4 = reel inteiro; clipes/reel-inicio.mp4 = primeiros 6 s, com recorte maior por causa do texto).
// Onde fica (Rialto Islands, Vespucci Island), como pegar, 3 detalhes (nome, visual, placa "HAD YOU"),
// a cena do filme, a pintura "Almost Had You" do GTA Online e a homenagem ao Paul Walker. Vyce só no final.
const { fontFamily } = loadFont("normal", { weights: ["600", "800", "900"], subsets: ["latin"] });
export const FPS = 30;
const FIM = dados.duracao + 1.0;
export const DURACAO_FASE21 = Math.ceil(FIM * FPS);
const ROXO = "#B66BFF";
const ROSA = "#FF4FD8";
const VERDE = "#4ADE80";
const VERMELHO = "#FF4D5E";
const AMARELO = "#FFD84A";
const AZUL = "#7CC8FF";
const LIMAO = "#A8F03C";
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const suave = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
const entra = (t: number, a: number, d = 0.35) => interpolate(t, [a, a + d], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) });
const sombra = "0 4px 22px rgba(0,0,0,.7)";
const ARQ = (n: string) => `fase-extra/fase21/${n}`;

// ---------- âncoras ----------
type Pal = { w: string; s: number; e: number };
const PAL = dados.palavras as Pal[];
const limpa = (w: string) => w.toLowerCase().replace(/[.,?!:…“”"]/g, "");
const em = (palavra: string, depois = 0) => PAL.find((p) => limpa(p.w) === palavra && p.s >= depois)?.s ?? 999;
const GUIA = em("vou");
const ONDE = em("ele", GUIA + 3); // "Ele fica nas Rialto Islands"
const COMO = em("é", em("lugar", ONDE)); // "É só abrir o portão"
const D1 = em("detalhe", COMO);
const D2 = em("2", D1);
const D3 = em("e", em("filme", D2)); // "E 3, o melhor"
const APOSTA = em("detalhe", D3 + 2);
const ONLINE = em("e", em("depois", APOSTA)); // "E a Rockstar já tinha feito"
const HOMEN = em("uma", em("inteiro", ONLINE)); // "Uma homenagem"
const iFase = PAL.findIndex((p) => limpa(p.w) === "fase" && p.s >= HOMEN);
const INICIO_FINAL = iFase >= 3 ? PAL[iFase - 3].s : 999;
const ENQUETE = em("e", em("vyce", INICIO_FINAL)) - 0.1;
const emSetup = (t: number) => t >= INICIO_FINAL - 0.1;

// ---------- planos: o reel (vertical) em tela cheia, sempre em movimento ----------
// ox/oy = ponto do zoom (%), src = segundo do reel; src < 6 usa reel-inicio (recorte sem o texto em inglês)
type Plano = { de: number; src: number; zoom?: number; zoom2?: number; ox?: number; oy?: number; ox2?: number; oy2?: number; vel?: number; brilho?: number };
const PLANOS: Plano[] = [
  { de: 0, src: 26.0, zoom: 2.2, zoom2: 1.3, ox: 50, oy: 74, ox2: 50, oy2: 60 },
  { de: em("escondido") - 0.1, src: 21.2, zoom: 1.0, zoom2: 1.15, ox: 50, oy: 55 },
  { de: GUIA - 0.1, src: 34.8, zoom: 1.05, zoom2: 1.2, ox: 45, oy: 55, ox2: 55, oy2: 55 },
  { de: ONDE - 0.1, src: 39.0, vel: 0.62, zoom: 1.0, zoom2: 1.35, ox: 50, oy: 45, ox2: 50, oy2: 42 },
  { de: em("entra", ONDE) - 0.1, src: 0.0, zoom: 1.0, zoom2: 1.15, ox: 50, oy: 55 },
  { de: em("o", em("mapa", ONDE)) - 0.1, src: 6.0, zoom: 1.05, zoom2: 1.2, ox: 50, oy: 60 },
  { de: COMO - 0.1, src: 8.6, zoom: 1.0, zoom2: 1.12, ox: 50, oy: 55 },
  { de: em("entrar", COMO) - 0.1, src: 14.6, zoom: 1.05, zoom2: 1.2, ox: 45, oy: 60 },
  { de: em("se", COMO + 1) - 0.1, src: 17.8, zoom: 1.0, zoom2: 1.15, ox: 50, oy: 60 },
  { de: D1 - 0.1, src: 27.0, zoom: 1.4, zoom2: 2.1, ox: 50, oy: 66 },
  { de: em("olha", D1) - 0.1, src: 36.0, zoom: 1.0, zoom2: 1.2, ox: 50, oy: 60 },
  { de: D2 - 0.1, src: 37.3, vel: 0.7, zoom: 1.0, zoom2: 1.15, ox: 50, oy: 60 },
  { de: em("asa", D2) - 0.15, src: 22.3, zoom: 1.0, zoom2: 1.15, ox: 50, oy: 65 },
  { de: em("adesivos", D2) - 0.15, src: 12.8, zoom: 1.05, zoom2: 1.25, ox: 45, oy: 60 },
  { de: D3 - 0.1, src: 28.0, zoom: 2.3, zoom2: 2.9, ox: 50, oy: 72 },
  { de: em("no", D3 + 1) - 0.1, src: 29.6, zoom: 1.05, zoom2: 1.2, ox: 50, oy: 60 },
  { de: em("e", em("peguei", D3)) - 0.1, src: 31.5, zoom: 1.0, zoom2: 1.15, ox: 50, oy: 60 },
  { de: APOSTA - 0.1, src: 23.8, zoom: 1.0, zoom2: 1.15, ox: 50, oy: 55 },
  { de: em("e", APOSTA + 1) - 0.1, src: 32.6, zoom: 1.05, zoom2: 1.25, ox: 50, oy: 62 },
  { de: ONLINE - 0.1, src: 33.6, zoom: 1.0, zoom2: 1.18, ox: 45, oy: 60, ox2: 55, oy2: 60 },
  { de: em("agora", ONLINE) - 0.1, src: 20.0, zoom: 1.0, zoom2: 1.2, ox: 50, oy: 50 },
  { de: HOMEN - 0.1, src: 35.6, vel: 0.6, zoom: 1.0, zoom2: 1.15, ox: 50, oy: 55, brilho: 0.85 },
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
  const z = interpolate(k, [0, 1], [p.zoom ?? 1.04, p.zoom2 ?? 1.12]) * soco * batida;
  const ox = interpolate(k, [0, 1], [p.ox ?? 50, p.ox2 ?? p.ox ?? 50]);
  const oy = interpolate(k, [0, 1], [p.oy ?? 50, p.oy2 ?? p.oy ?? 50]);
  const dur = Math.max(1, Math.round((fim - p.de) * FPS) + 2);
  const inicio = p.src < 6;
  return (
    <Sequence key={i} from={Math.round(p.de * FPS)} durationInFrames={dur} layout="none">
      <AbsoluteFill style={{ overflow: "hidden", background: "#000" }}>
        <OffthreadVideo src={staticFile(ARQ(`clipes/${inicio ? "reel-inicio" : "reel"}.mp4`))} startFrom={Math.round(p.src * FPS)} playbackRate={p.vel ?? 1} muted style={{ position: "absolute", width: 1080, height: 1920, transform: `scale(${z})`, transformOrigin: `${ox}% ${oy}%`, filter: `brightness(${p.brilho ?? 1.06}) saturate(1.1)` }} />
        <div style={{ position: "absolute", right: 30, bottom: 30, fontFamily, fontWeight: 800, fontSize: 24, letterSpacing: 3, color: "#fff", background: "rgba(0,0,0,.55)", borderRadius: 8, padding: "4px 12px" }}>INSTAGRAM · @BATTLEFIELDBOSH</div>
      </AbsoluteFill>
    </Sequence>
  );
};

// ---------- peças ----------
const Rotulo: React.FC<{ cor: string; children: React.ReactNode }> = ({ cor, children }) => <div style={{ fontWeight: 800, fontSize: 32, letterSpacing: 8, color: cor, textShadow: sombra }}>{children}</div>;
const Titulo: React.FC<{ tam?: number; cor?: string; children: React.ReactNode }> = ({ tam = 92, cor = "#fff", children }) => <div style={{ fontWeight: 900, fontSize: tam, lineHeight: 0.98, letterSpacing: -1, color: cor, textShadow: sombra }}>{children}</div>;
type TipoSelo = "NO JOGO" | "A GALERA DIZ" | "NO FILME" | "GTA ONLINE";
const COR_SELO: Record<TipoSelo, string> = { "NO JOGO": VERDE, "A GALERA DIZ": ROSA, "NO FILME": AZUL, "GTA ONLINE": ROXO };
const TXT_SELO: Record<TipoSelo, string> = { "NO JOGO": "VISTO NO JOGO", "A GALERA DIZ": "AINDA SEM CONFIRMAÇÃO", "NO FILME": "VELOZES E FURIOSOS (2001)", "GTA ONLINE": "GTA ONLINE · 2020" };
const Selo: React.FC<{ tipo: TipoSelo; t: number; de: number }> = ({ tipo, t, de }) => (
  <div style={{ display: "inline-block", marginTop: 16, fontWeight: 800, fontSize: 24, letterSpacing: 4, color: "#111", background: COR_SELO[tipo], borderRadius: 8, padding: "4px 14px", opacity: entra(t, de), transform: `scale(${0.85 + 0.15 * entra(t, de)})`, transformOrigin: "0% 50%" }}>
    {TXT_SELO[tipo]}
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
// balão de fala do filme
const Fala: React.FC<{ t: number; de: number; quem: string; txt: string; cor: string }> = ({ t, de, quem, txt, cor }) => {
  const k = entra(t, de, 0.3);
  return (
    <div style={{ marginTop: 18, opacity: k, transform: `translateY(${(1 - k) * 30}px)`, background: "rgba(255,255,255,.95)", color: "#111", borderRadius: 24, padding: "16px 26px", width: "fit-content", maxWidth: 900, borderLeft: `12px solid ${cor}` }}>
      <div style={{ fontWeight: 900, fontSize: 26, letterSpacing: 5, color: cor }}>{quem}</div>
      <div style={{ fontWeight: 900, fontSize: 50, lineHeight: 1.05 }}>{txt}</div>
    </div>
  );
};

// ---------- blocos ----------
const Abertura: React.FC<{ t: number }> = ({ t }) => (
  <Bloco t={t} de={0.1} ate={GUIA - 0.05}>
    <Caixa>
      <Rotulo cor={LIMAO}>VELOZES E FURIOSOS NO GTA 6</Rotulo>
      <Titulo tam={96}>COMO PEGAR</Titulo>
      <Titulo tam={74}>O CARRO DO BRIAN</Titulo>
      <div style={{ opacity: entra(t, em("escondido") - 0.1) }}>
        <Titulo tam={64} cor={LIMAO}>TÁ ESCONDIDO 👀</Titulo>
      </div>
    </Caixa>
    <Linha t={t} de={em("placa") - 0.1} ic="🚘" txt="E A PLACA É UMA ZOEIRA" cor={AMARELO} />
  </Bloco>
);

const Guia: React.FC<{ t: number }> = ({ t }) => (
  <Bloco t={t} de={GUIA} ate={ONDE - 0.05}>
    <Rotulo cor="#E2C4FF">NESTE VÍDEO</Rotulo>
    <Linha t={t} de={em("onde", GUIA)} ic="📍" txt="ONDE FICA" cor={AZUL} tam={56} />
    <Linha t={t} de={em("como", GUIA)} ic="🔑" txt="COMO PEGAR" cor={VERDE} tam={56} />
    <Linha t={t} de={em("3", GUIA)} ic="🔍" txt="3 DETALHES QUE PROVAM" cor={AMARELO} tam={56} />
  </Bloco>
);

const Onde: React.FC<{ t: number }> = ({ t }) => (
  <Bloco t={t} de={ONDE} ate={COMO - 0.05} topo={1160}>
    <Caixa>
      <Rotulo cor={AZUL}>ONDE FICA</Rotulo>
      <Titulo tam={88}>RIALTO ISLANDS</Titulo>
      <Selo tipo="NO JOGO" t={t} de={ONDE + 0.6} />
    </Caixa>
    <Linha t={t} de={em("caminho", ONDE)} ic="🌉" txt="ENTRE VICE CITY E VICE BEACH" cor={AZUL} tam={38} />
    <Linha t={t} de={em("garagem", ONDE) - 0.2} ic="📍" txt="VESPUCCI ISLAND · GARAGEM" cor={AMARELO} tam={38} />
    <Linha t={t} de={em("lugar", ONDE) - 0.3} ic="🔁" txt="SEMPRE NO MESMO LUGAR" cor={VERDE} tam={38} />
  </Bloco>
);

const Como: React.FC<{ t: number }> = ({ t }) => {
  const guardar = em("guardar", COMO);
  return (
    <Bloco t={t} de={COMO} ate={D1 - 0.05}>
      <Caixa>
        <Rotulo cor={VERDE}>COMO PEGAR</Rotulo>
        <Titulo tam={80}>EM 3 PASSOS</Titulo>
      </Caixa>
      <Linha t={t} de={em("abrir", COMO)} ic="1️⃣" txt="ABRE O PORTÃO" cor={VERDE} />
      <Linha t={t} de={em("entrar", COMO)} ic="2️⃣" txt="QUEBRA O VIDRO E ENTRA" cor={AMARELO} />
      <Linha t={t} de={em("sair", COMO)} ic="3️⃣" txt="SAI DIRIGINDO" cor={AZUL} />
      {t >= guardar - 0.1 && (
        <div>
          <Linha t={t} de={guardar} ic="🏠" txt="GUARDAR PRA SEMPRE?" cor={ROSA} />
          <Selo tipo="A GALERA DIZ" t={t} de={guardar + 0.3} />
        </div>
      )}
    </Bloco>
  );
};

const Det1: React.FC<{ t: number }> = ({ t }) => (
  <Bloco t={t} de={D1} ate={D2 - 0.05}>
    <Caixa>
      <Rotulo cor={AMARELO}>DETALHE 1 · O NOME</Rotulo>
      <Titulo tam={78}>MAIBATSU</Titulo>
      <Titulo tam={78}>PENUMBRA</Titulo>
      <Selo tipo="NO JOGO" t={t} de={D1 + 0.6} />
    </Caixa>
    <Linha t={t} de={em("eclipse", D1) - 0.2} ic="🟰" txt="MITSUBISHI ECLIPSE" cor={LIMAO} tam={50} />
  </Bloco>
);

const Det2: React.FC<{ t: number }> = ({ t }) => (
  <Bloco t={t} de={D2} ate={D3 - 0.05}>
    <Caixa>
      <Rotulo cor={LIMAO}>DETALHE 2 · O VISUAL</Rotulo>
      <Titulo tam={78}>IGUAL AO FILME</Titulo>
    </Caixa>
    <Linha t={t} de={em("verde", D2)} ic="🟢" txt="VERDE LIMÃO" cor={LIMAO} />
    <Linha t={t} de={em("asa", D2)} ic="⬆️" txt="ASA GIGANTE ATRÁS" cor={AZUL} />
    <Linha t={t} de={em("adesivos", D2)} ic="🏁" txt="ADESIVOS DE CORRIDA" cor={AMARELO} />
  </Bloco>
);

const Det3: React.FC<{ t: number }> = ({ t }) => {
  const filme = em("filme", D3);
  return (
    <Bloco t={t} de={D3} ate={APOSTA - 0.05}>
      <Caixa>
        <Rotulo cor={ROSA}>DETALHE 3 · O MELHOR</Rotulo>
        <Titulo tam={68}>A PLACA:</Titulo>
        <Titulo tam={110} cor={AMARELO}>“HAD YOU”</Titulo>
        <Selo tipo="NO FILME" t={t} de={filme} />
      </Caixa>
      <Fala t={t} de={em("eu", filme) - 0.1} quem="BRIAN (PERDEU O RACHA)" txt="“Cara, eu quase te peguei!”" cor={AZUL} />
      <Fala t={t} de={em("você", em("toretto", filme + 1)) - 0.1} quem="TORETTO" txt="“Você nunca me pegou.”" cor={VERMELHO} />
    </Bloco>
  );
};

const Aposta: React.FC<{ t: number }> = ({ t }) => (
  <Bloco t={t} de={APOSTA} ate={ONLINE - 0.05}>
    <Caixa>
      <Rotulo cor={VERMELHO}>E TEM MAIS</Rotulo>
      <Titulo tam={76}>ELE APOSTOU</Titulo>
      <Titulo tam={76}>O CARRO</Titulo>
      <Selo tipo="NO FILME" t={t} de={APOSTA + 0.6} />
    </Caixa>
    <Linha t={t} de={em("racha", APOSTA)} ic="❌" txt="PERDEU O RACHA" cor={VERMELHO} />
    <Linha t={t} de={em("destruído", APOSTA) - 0.2} ic="💥" txt="DESTRUÍDO LOGO DEPOIS" cor={AMARELO} />
  </Bloco>
);

const Online: React.FC<{ t: number }> = ({ t }) => {
  const pintura = em("pintura", ONLINE);
  const agora = em("agora", ONLINE);
  return (
    <Bloco t={t} de={ONLINE} ate={HOMEN - 0.05}>
      <Caixa>
        <Rotulo cor={ROXO}>A ROCKSTAR JÁ TINHA AVISADO</Rotulo>
        <Selo tipo="GTA ONLINE" t={t} de={ONLINE + 0.5} />
        <div style={{ marginTop: 14, opacity: entra(t, pintura - 0.2) }}>
          <Titulo tam={46}>PINTURA DO PENUMBRA:</Titulo>
          <Titulo tam={74} cor={AMARELO}>“ALMOST HAD YOU”</Titulo>
          <Titulo tam={46} cor="#ddd">= “QUASE TE PEGUEI”</Titulo>
        </div>
      </Caixa>
      <div style={{ marginTop: 10 }}>
        <Linha t={t} de={agora} ic="🚗" txt="GTA 6: O CARRO INTEIRO" cor={LIMAO} tam={48} />
      </div>
    </Bloco>
  );
};

const Homenagem: React.FC<{ t: number }> = ({ t }) => {
  const k = entra(t, HOMEN + 0.1, 0.8);
  return t >= HOMEN && t < INICIO_FINAL - 0.1 ? (
    <div style={{ position: "absolute", left: 0, right: 0, top: 700, textAlign: "center", fontFamily, color: "#fff", opacity: k * (1 - suave(t, INICIO_FINAL - 0.4, INICIO_FINAL - 0.1)) }}>
      <div style={{ fontWeight: 600, fontSize: 34, letterSpacing: 12, textShadow: sombra }}>UMA HOMENAGEM A</div>
      <div style={{ fontWeight: 900, fontSize: 110, letterSpacing: 2, textShadow: sombra, transform: `scale(${0.95 + 0.05 * k})` }}>PAUL WALKER</div>
      <div style={{ fontWeight: 600, fontSize: 38, letterSpacing: 10, textShadow: sombra }}>1973 – 2013</div>
    </div>
  ) : null;
};

// ---------- Vyce no quarto gamer + enquete ----------
const boca = (f: number) => (dados.boca as number[])[f] ?? 0;
const pisca = (t: number) => {
  const c = t % 4.3;
  return c > 1.4 && c < 1.52;
};
const OPCOES: [string, string, number, string][] = [
  ["🏁", "VOU BUSCAR O ECLIPSE", em("buscar", ENQUETE), LIMAO],
  ["💪", "ESPERO O CHARGER DO TORETTO", em("esperando", ENQUETE), VERMELHO],
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
        <Titulo tam={78}>NO GTA 6, VOCÊ…</Titulo>
        {OPCOES.map(([ic, nome, d, cor], i) => (
          <Linha key={i} t={t} de={d} ic={ic} txt={`${i + 1} · ${nome}`} cor={cor} tam={38} />
        ))}
      </div>
      <div style={{ position: "absolute", top: 1090, left: 70, fontFamily, fontWeight: 900, fontSize: 44, color: "#fff", textShadow: sombra, opacity: entra(t, a + 1.7) }}>@faseextra.br</div>
    </AbsoluteFill>
  );
};

// ---------- legenda ----------
const DESTAQUE = /^(brian|velozes|furiosos|escondido|placa|zoeira|onde|pegar|3|rialto|islands|vice|garagem|mapa|lugar|portão|dirigindo|guardar|maibatsu|penumbra|eclipse|verde|limão|asa|adesivos|filme|had|you|toretto|peguei|apostado|carro|destruído|rockstar|online|2020|inteiro|paul|walker|13|fase|extra|vyce|charger|comenta)$/i;
const BLOCOS: Pal[][] = (() => {
  const b: Pal[][] = [];
  let c: Pal[] = [];
  PAL.forEach((p, i) => {
    c.push(p);
    const n = PAL[i + 1];
    if (c.length >= 3 || /[.,?!:”]$/.test(p.w) || !n || n.s - p.e > 0.35) {
      b.push(c);
      c = [];
    }
  });
  return b;
})();
const Legenda: React.FC<{ t: number }> = ({ t }) => {
  const i = BLOCOS.findIndex((b, j) => t >= b[0].s - 0.05 && t < Math.min(BLOCOS[j + 1]?.[0].s ?? 999, b[b.length - 1].e + 0.5) - 0.05);
  if (i < 0) return null;
  const naOnde = t >= ONDE && t < COMO;
  const topo = emSetup(t) ? 1420 : naOnde ? 600 : t >= HOMEN ? 1180 : 1560;
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
const VIRADAS = [GUIA, ONDE, COMO, D1, D2, D3, APOSTA, ONLINE, HOMEN, INICIO_FINAL - 0.1];
const DUCK: number[] = (() => {
  const bruto = Array.from({ length: DURACAO_FASE21 }, (_, i) => (falando(i / FPS) ? 0.42 : 1));
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

export const VideoFase21: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {!emSetup(t) && <Fundo t={t} />}
      {!emSetup(t) && <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,4,24,.68) 0%, rgba(10,4,24,.3) 36%, rgba(10,4,24,0) 52%, rgba(10,4,24,.55) 100%)" }} />}
      {t >= HOMEN && !emSetup(t) && <AbsoluteFill style={{ background: "rgba(0,0,0,.35)" }} />}
      <Setup t={t} f={f} />

      <Abertura t={t} />
      <Guia t={t} />
      <Onde t={t} />
      <Como t={t} />
      <Det1 t={t} />
      <Det2 t={t} />
      <Det3 t={t} />
      <Aposta t={t} />
      <Online t={t} />
      <Homenagem t={t} />

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
