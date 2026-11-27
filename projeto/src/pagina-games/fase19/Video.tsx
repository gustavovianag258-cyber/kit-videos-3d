import { loadFont } from "@remotion/google-fonts/Montserrat";
import { AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Acabamento, PalcoCinema } from "../../cinema/Palco";
import { Camera } from "../Estudio";
import { QuartoGamer } from "../QuartoGamer";
import dados from "./dados.json";

// Fase Extra, Fase 19: "O GTA 6 levou 37 minutos pra ganhar o primeiro bug" — formato novo (modelo: Fase 18).
// 5 bugs numerados, selo em cada informação (A GALERA ACHOU / A GALERA DISCUTE / BOATO / CONFIRMADO),
// clipes reais dos jogadores em tela cheia vertical com jogo de câmera, e trechos da live do kosky no layout dos
// cortes (câmera dele em cima, tela embaixo). Vyce só na voz e no final (quarto gamer + enquete).
// Todos os tempos saem das palavras da narração (dados.json).
const { fontFamily } = loadFont("normal", { weights: ["600", "800", "900"], subsets: ["latin"] });
export const FPS = 30;
const FIM = dados.duracao + 1.0;
export const DURACAO_FASE19 = Math.ceil(FIM * FPS);
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
const ARQ = (n: string) => `fase-extra/fase19/${n}`;

// ---------- âncoras: tempo de cada palavra da narração ----------
type Pal = { w: string; s: number; e: number };
const PAL = dados.palavras as Pal[];
const limpa = (w: string) => w.toLowerCase().replace(/[.,?!:…]/g, "");
const em = (palavra: string, depois = 0) => PAL.find((p) => limpa(p.w) === palavra && p.s >= depois)?.s ?? 999;
const GUIA = em("eu"); // "Eu fui atrás dos vídeos"
const B1 = em("bug", GUIA);
const B2 = em("bug", B1 + 1);
const B3 = em("bug", B2 + 1);
const B4 = em("bug", B3 + 1);
const B5 = em("bug", B4 + 1);
const BOATO = em("e", em("animação", B5)); // "E cuidado com o boato"
const BRASIL = em("e", em("bugs", BOATO)); // "E o Brasil também"
const FECHO = em("ou", BRASIL); // "Ou seja"
const iFase = PAL.findIndex((p) => limpa(p.w) === "fase" && p.s >= FECHO);
const INICIO_FINAL = iFase >= 3 ? PAL[iFase - 3].s : 999; // "Você está na Fase Extra"
const ENQUETE = em("e", em("vyce", INICIO_FINAL)) - 0.1; // "E você:"
const emSetup = (t: number) => t >= INICIO_FINAL - 0.1;
const KOSKY_NAVIO = em("até", B4); // "Até o kosky, ao vivo…"

// ---------- planos de fundo: clipe/foto em tela cheia, ou live do kosky (câmera em cima) ----------
type Plano = {
  de: number;
  clipe?: string;
  foto?: string;
  cam?: string; // câmera do kosky (layout dos cortes)
  src?: number;
  camSrc?: number;
  vel?: number;
  x?: number;
  x2?: number;
  zoom?: number;
  zoom2?: number;
  credito?: string;
};
const PLANOS: Plano[] = [
  { de: 0, clipe: "lucia", src: 4.6, x: 0.5, x2: 0.5, zoom: 1.0, zoom2: 1.25, credito: "X · @BAYLENLATONA" },
  { de: GUIA - 0.1, foto: "casal", x: 0.3, x2: 0.55 },
  { de: B1 - 0.1, clipe: "lucia", src: 0.3, x: 0.45, x2: 0.55, zoom: 1.05, zoom2: 1.12, credito: "X · @BAYLENLATONA" },
  { de: B2 - 0.1, clipe: "aviao", src: 0, x: 0.3, x2: 0.45, zoom: 1.05, zoom2: 1.15, credito: "X · @RATHOR7_" },
  { de: B3 - 0.1, clipe: "balcao", src: 0, vel: 0.9, x: 0.42, x2: 0.5, zoom: 1.0, zoom2: 1.15, credito: "X · @MICHAELDOESLIFE" },
  { de: B4 - 0.1, clipe: "navio", src: 1.5, x: 0.3, x2: 0.55, zoom: 1.0, zoom2: 1.15, credito: "VIA X · @CLIPOVERDOSE" },
  { de: KOSKY_NAVIO - 0.05, clipe: "navio-live", cam: "navio-cam", src: 9.6, camSrc: 9.6, x: 0.3, x2: 0.5, zoom: 1.05, zoom2: 1.2, credito: "KICK.COM/KOSKY" },
  { de: B5 - 0.1, clipe: "geladeira", cam: "geladeira-cam", src: 8.6, camSrc: 8.6, x: 0.4, x2: 0.5, zoom: 1.0, zoom2: 1.2, credito: "KICK.COM/KOSKY" },
  { de: BOATO - 0.1, foto: "lucia", x: 0.65, x2: 0.45 },
  { de: BRASIL - 0.1, clipe: "kosky-bug", cam: "kosky-cam", src: 0, camSrc: 10.6, x: 0.5, x2: 0.42, zoom: 1.05, zoom2: 1.15, credito: "KICK.COM/KOSKY" },
  { de: FECHO - 0.1, foto: "carro", x: 0.6, x2: 0.35 },
];
const planoEm = (t: number) => {
  let i = -1;
  while (i + 1 < PLANOS.length && PLANOS[i + 1].de <= t) i++;
  return i;
};
const CAM_H = 560;
const ehLive = (t: number) => {
  const i = planoEm(t);
  return i >= 0 && Boolean(PLANOS[i].cam) && !emSetup(t);
};
const Fundo: React.FC<{ t: number }> = ({ t }) => {
  const i = planoEm(t);
  if (i < 0) return null;
  const p = PLANOS[i];
  const fim = Math.min(PLANOS[i + 1]?.de ?? FIM, INICIO_FINAL + 0.3);
  if (t > fim) return null;
  const k = interpolate(t, [p.de, fim], [0, 1], { ...cl, easing: Easing.inOut(Easing.sin) });
  const soco = 1 + 0.08 * (1 - suave(t, p.de, p.de + 0.3)); // soco de zoom na emenda
  const x = interpolate(k, [0, 1], [p.x ?? 0.5, p.x2 ?? p.x ?? 0.5]);
  const z = interpolate(k, [0, 1], [p.zoom ?? 1.04, p.zoom2 ?? (p.zoom ?? 1.04) * 1.08]) * soco;
  const dur = Math.max(1, Math.round((fim - p.de) * FPS) + 2);
  const topo = p.cam ? CAM_H : 0;
  const H = 1920 - topo;
  const W = (16 / 9) * H;
  return (
    <Sequence key={i} from={Math.round(p.de * FPS)} durationInFrames={dur} layout="none">
      <AbsoluteFill style={{ overflow: "hidden", background: "#000" }}>
        <div style={{ position: "absolute", left: 0, top: topo, width: 1080, height: H, overflow: "hidden" }}>
          {p.clipe && (
            <OffthreadVideo src={staticFile(ARQ(`clipes/${p.clipe}.mp4`))} startFrom={Math.round((p.src ?? 0) * FPS)} playbackRate={p.vel ?? 1} muted style={{ position: "absolute", height: H, width: W, left: -x * (W - 1080), top: 0, transform: `scale(${z})`, transformOrigin: `${x * 100}% 50%`, filter: "brightness(1.1) saturate(1.1)" }} />
          )}
          {p.foto && <Img src={staticFile(ARQ(`fotos/${p.foto}.jpg`))} style={{ position: "absolute", height: H, width: W, left: -x * (W - 1080), top: 0, transform: `scale(${z})`, transformOrigin: "50% 50%", filter: "brightness(1.02) saturate(1.1)" }} />}
        </div>
        {p.cam && (
          <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: CAM_H, overflow: "hidden", borderBottom: `6px solid ${ROXO}` }}>
            <OffthreadVideo src={staticFile(ARQ(`clipes/${p.cam}.mp4`))} startFrom={Math.round((p.camSrc ?? 0) * FPS)} muted style={{ position: "absolute", width: 1080, height: 608, top: (CAM_H - 608) / 2, transform: `scale(${1.02 + 0.06 * k})` }} />
          </div>
        )}
        {p.credito && (
          <div style={{ position: "absolute", right: 30, bottom: 30, fontFamily, fontWeight: 800, fontSize: 24, letterSpacing: 3, color: "#fff", background: "rgba(0,0,0,.55)", borderRadius: 8, padding: "4px 12px" }}>{p.credito}</div>
        )}
      </AbsoluteFill>
    </Sequence>
  );
};

// ---------- peças do formato novo ----------
const Rotulo: React.FC<{ cor: string; children: React.ReactNode }> = ({ cor, children }) => <div style={{ fontWeight: 800, fontSize: 32, letterSpacing: 8, color: cor, textShadow: sombra }}>{children}</div>;
const Titulo: React.FC<{ tam?: number; cor?: string; children: React.ReactNode }> = ({ tam = 92, cor = "#fff", children }) => <div style={{ fontWeight: 900, fontSize: tam, lineHeight: 0.98, letterSpacing: -1, color: cor, textShadow: sombra }}>{children}</div>;
type TipoSelo = "A GALERA ACHOU" | "A GALERA DISCUTE" | "BOATO" | "CONFIRMADO" | "NENHUM CONFIRMADO PELA ROCKSTAR";
const COR_SELO: Record<TipoSelo, string> = { "A GALERA ACHOU": AMARELO, "A GALERA DISCUTE": ROSA, BOATO: VERMELHO, CONFIRMADO: VERDE, "NENHUM CONFIRMADO PELA ROCKSTAR": "#fff" };
const Selo: React.FC<{ tipo: TipoSelo; t: number; de: number }> = ({ tipo, t, de }) => (
  <div style={{ display: "inline-block", marginTop: 16, fontWeight: 800, fontSize: 24, letterSpacing: 4, color: "#111", background: COR_SELO[tipo], borderRadius: 8, padding: "4px 14px", opacity: entra(t, de), transform: `scale(${0.85 + 0.15 * entra(t, de)})`, transformOrigin: "0% 50%" }}>
    {tipo === "A GALERA ACHOU" ? "A GALERA ACHOU · COM VÍDEO" : tipo}
  </div>
);
const Bloco: React.FC<{ t: number; de: number; ate: number; topo?: number; children: React.ReactNode }> = ({ t, de, ate, topo = 240, children }) => {
  if (t < de - 0.05 || t > ate) return null;
  const k = entra(t, de, 0.4);
  const s = suave(t, ate - 0.25, ate);
  return <div style={{ position: "absolute", left: 70, right: 70, top: topo, fontFamily, color: "#fff", opacity: k * (1 - s), transform: `translateX(${(1 - k) * -50}px)` }}>{children}</div>;
};
const Caixa: React.FC<{ children: React.ReactNode }> = ({ children }) => <div style={{ display: "inline-block", background: "rgba(10,4,24,.72)", borderRadius: 18, padding: "16px 26px" }}>{children}</div>;
const Linha: React.FC<{ t: number; de: number; ic: string; txt: string; cor?: string; tam?: number }> = ({ t, de, ic, txt, cor = "#fff", tam = 44 }) => {
  const k = entra(t, de, 0.3);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 14, opacity: k, transform: `translateX(${(1 - k) * -40}px)`, width: "fit-content", background: "rgba(14,8,30,.78)", borderLeft: `8px solid ${cor}`, borderRadius: 12, padding: "10px 22px 10px 18px" }}>
      <span style={{ fontSize: tam + 6 }}>{ic}</span>
      <span style={{ fontWeight: 900, fontSize: tam, color: "#fff", whiteSpace: "nowrap" }}>{txt}</span>
    </div>
  );
};
// cartão de post (nosso, sem copiar o print): @ + curtidas subindo
const Post: React.FC<{ t: number; de: number; arroba: string; hora?: string; mil: number }> = ({ t, de, arroba, hora, mil }) => {
  const k = entra(t, de, 0.35);
  const n = Math.round(mil * suave(t, de + 0.1, de + 1.1));
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 20, opacity: k, transform: `scale(${0.85 + 0.15 * k})`, transformOrigin: "0% 50%", width: "fit-content", background: "rgba(255,255,255,.95)", borderRadius: 22, padding: "14px 24px", boxShadow: "0 12px 30px rgba(0,0,0,.45)" }}>
      <div style={{ width: 64, height: 64, borderRadius: 32, background: "#111", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 30 }}>𝕏</div>
      <div>
        <div style={{ fontWeight: 900, fontSize: 36, color: "#111" }}>{arroba}</div>
        <div style={{ fontWeight: 700, fontSize: 26, color: "#555" }}>{hora ? `${hora} · ` : ""}18/11</div>
      </div>
      <div style={{ marginLeft: 16, fontWeight: 900, fontSize: 44, color: "#E0245E" }}>♥ +{n} mil</div>
    </div>
  );
};

// ---------- blocos ----------
const Relogio: React.FC<{ t: number; de: number; ate: number; tam?: number }> = ({ t, de, ate, tam = 190 }) => {
  const min = Math.round(37 * suave(t, de, ate));
  return (
    <div style={{ fontWeight: 900, fontSize: tam, letterSpacing: -4, color: "#fff", textShadow: sombra, fontVariantNumeric: "tabular-nums" }}>
      8:{String(min).padStart(2, "0")}
    </div>
  );
};
const Abertura: React.FC<{ t: number }> = ({ t }) => {
  const bug = em("bug");
  return (
    <Bloco t={t} de={0.1} ate={GUIA - 0.1}>
      <Caixa>
        <Rotulo cor={AZUL}>18/11 · O JOGO ABRIU ÀS 8:00</Rotulo>
        <Relogio t={t} de={0.3} ate={em("minutos") + 0.4} />
        <div style={{ opacity: entra(t, bug - 0.1) }}>
          <Titulo tam={70} cor={AMARELO}>1º BUG FAMOSO 🐛</Titulo>
        </div>
      </Caixa>
    </Bloco>
  );
};

const Guia: React.FC<{ t: number }> = ({ t }) => {
  const cinco = em("5", GUIA);
  const quebrado = em("quebrado", GUIA);
  return (
    <Bloco t={t} de={GUIA} ate={B1 - 0.05}>
      <Rotulo cor="#E2C4FF">FUI ATRÁS DOS VÍDEOS</Rotulo>
      <Titulo>5 BUGS QUE</Titulo>
      <Titulo>A GALERA</Titulo>
      <Titulo>JÁ ACHOU</Titulo>
      <div style={{ marginTop: 34, display: "flex", gap: 18 }}>
        {[1, 2, 3, 4, 5].map((n) => {
          const k = entra(t, cinco + n * 0.08, 0.25);
          return (
            <div key={n} style={{ width: 120, height: 120, borderRadius: 24, border: `5px solid ${ROXO}`, background: "rgba(14,8,30,.75)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 64, opacity: k, transform: `scale(${0.6 + 0.4 * k})` }}>
              {n}
            </div>
          );
        })}
      </div>
      <Selo tipo="NENHUM CONFIRMADO PELA ROCKSTAR" t={t} de={cinco + 0.6} />
      <div style={{ marginTop: 22, opacity: entra(t, quebrado - 0.3) }}>
        <Titulo tam={56} cor={AZUL}>NO FIM: TÁ QUEBRADO?</Titulo>
      </div>
    </Bloco>
  );
};

const Bug1: React.FC<{ t: number }> = ({ t }) => (
  <Bloco t={t} de={B1} ate={B2 - 0.05}>
    <Caixa>
      <Rotulo cor={AMARELO}>BUG 1</Rotulo>
      <Titulo tam={78}>A LUCIA ATRAVESSA</Titulo>
      <Titulo tam={78}>O CHÃO</Titulo>
      <Selo tipo="A GALERA ACHOU" t={t} de={B1 + 0.6} />
    </Caixa>
    <Post t={t} de={em("post", B1)} arroba="@BaylenLatona" hora="8:37" mil={33} />
    <Linha t={t} de={em("espera", B1)} ic="⏳" txt="ESPERA: ELA VOLTA" cor={VERDE} tam={40} />
    <Linha t={t} de={em("reinicia", B1)} ic="🔁" txt="NÃO VOLTOU? REINICIA A MISSÃO" cor={AMARELO} tam={40} />
  </Bloco>
);

const Bug2: React.FC<{ t: number }> = ({ t }) => (
  <Bloco t={t} de={B2} ate={B3 - 0.05}>
    <Caixa>
      <Rotulo cor={AZUL}>BUG 2</Rotulo>
      <Titulo tam={78}>O JASON ATRAVESSA</Titulo>
      <Titulo tam={78}>O AVIÃO</Titulo>
      <Selo tipo="A GALERA ACHOU" t={t} de={B2 + 0.6} />
    </Caixa>
    <Linha t={t} de={em("porta", B2)} ic="🚪" txt="A PORTA NÃO ABRE" cor={VERMELHO} tam={40} />
    <Post t={t} de={em("banco", B2) - 0.4} arroba="@rathor7_" hora="9:08" mil={23} />
  </Bloco>
);

const Bug3: React.FC<{ t: number }> = ({ t }) => {
  const treze = em("13", B3);
  return (
    <Bloco t={t} de={B3} ate={B4 - 0.05}>
      <Caixa>
        <Rotulo cor={ROSA}>BUG 3 · O MAIS COMPARTILHADO</Rotulo>
        <Titulo tam={78}>O BALCÃO QUE</Titulo>
        <Titulo tam={78}>ENGOLE GENTE</Titulo>
        <Selo tipo="A GALERA ACHOU" t={t} de={B3 + 0.6} />
      </Caixa>
      <Post t={t} de={em("streamer", B3)} arroba="@MichaelDoesLife" hora="10:05" mil={46} />
      <div style={{ marginTop: 22, opacity: entra(t, treze), transform: `scale(${0.7 + 0.3 * entra(t, treze)})`, transformOrigin: "0% 50%" }}>
        <Titulo tam={84} cor={AMARELO}>“13 ANOS PRA ISSO”</Titulo>
      </div>
    </Bloco>
  );
};

const Bug4: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Bloco t={t} de={B4} ate={KOSKY_NAVIO - 0.05}>
      <Caixa>
        <Rotulo cor={VERDE}>BUG 4 · NAS KEYS</Rotulo>
        <Titulo tam={78}>O NAVIO QUE</Titulo>
        <Titulo tam={78}>SUBIU NA PONTE</Titulo>
        <Selo tipo="A GALERA ACHOU" t={t} de={B4 + 0.6} />
      </Caixa>
    </Bloco>
    <Bloco t={t} de={KOSKY_NAVIO} ate={B5 - 0.05} topo={CAM_H + 50}>
      <Caixa>
        <Titulo tam={60}>O KOSKY, AO VIVO:</Titulo>
        <Titulo tam={60} cor={AMARELO}>SEM PALAVRAS 😶</Titulo>
      </Caixa>
    </Bloco>
  </>
);

const Bug5: React.FC<{ t: number }> = ({ t }) => {
  const metade = em("metade", B5);
  return (
    <Bloco t={t} de={B5} ate={BOATO - 0.05} topo={CAM_H + 50}>
      <Caixa>
        <Rotulo cor={ROSA}>BUG 5 · O MAIS POLÊMICO</Rotulo>
        <Titulo tam={72}>A CERVEJA</Titulo>
        <Titulo tam={72}>TELETRANSPORTA 🍺</Titulo>
        <Selo tipo="A GALERA DISCUTE" t={t} de={B5 + 0.6} />
      </Caixa>
      <div style={{ marginTop: 18, display: "flex", gap: 14, opacity: entra(t, metade) }}>
        <Linha t={t} de={metade} ic="🐛" txt="BUG?" cor={VERMELHO} tam={44} />
        <Linha t={t} de={em("metade", metade + 0.5)} ic="😴" txt="PREGUIÇA?" cor={AMARELO} tam={44} />
      </div>
    </Bloco>
  );
};

// carimbo grande que cai
const Carimbo: React.FC<{ t: number; de: number; txt: string; cor: string }> = ({ t, de, txt, cor }) => {
  const k = entra(t, de, 0.18);
  if (t < de) return null;
  return (
    <div style={{ display: "inline-block", marginTop: 18, fontWeight: 900, fontSize: 96, letterSpacing: 6, color: cor, border: `10px solid ${cor}`, borderRadius: 18, padding: "0 30px", transform: `rotate(-8deg) scale(${2 - k})`, opacity: k, textShadow: sombra, background: "rgba(10,4,24,.55)" }}>
      {txt}
    </div>
  );
};
const Boato: React.FC<{ t: number }> = ({ t }) => {
  const falso = em("falso", BOATO);
  const nada = em("nada", BOATO);
  return (
    <Bloco t={t} de={BOATO} ate={BRASIL - 0.05}>
      <Rotulo cor={VERMELHO}>CUIDADO COM O BOATO</Rotulo>
      <div style={{ marginTop: 14, width: 860, background: "rgba(255,255,255,.95)", borderRadius: 22, padding: "20px 26px", color: "#111", opacity: entra(t, em("post", BOATO)) }}>
        <div style={{ fontWeight: 800, fontSize: 28, color: "#555" }}>𝕏 · post viral</div>
        <div style={{ fontWeight: 900, fontSize: 40, lineHeight: 1.12, marginTop: 6 }}>“A Rockstar pediu desculpas e marcou a correção pro dia 25”</div>
      </div>
      <Carimbo t={t} de={falso - 0.05} txt="BOATO" cor={VERMELHO} />
      <div style={{ marginTop: 26 }}>
        <Linha t={t} de={nada - 0.3} ic="🤐" txt="ROCKSTAR: NADA SOBRE OS BUGS" cor={VERDE} tam={40} />
      </div>
      <div style={{ opacity: entra(t, nada) }}>
        <Selo tipo="CONFIRMADO" t={t} de={nada} />
      </div>
    </Bloco>
  );
};

const Brasil: React.FC<{ t: number }> = ({ t }) => {
  const hora = em("8h41", BRASIL);
  const titulo = em("título", BRASIL);
  return (
    <Bloco t={t} de={BRASIL} ate={FECHO - 0.05} topo={CAM_H + 50}>
      <Caixa>
        <Rotulo cor={VERDE}>E O BRASIL?</Rotulo>
        <div style={{ opacity: entra(t, hora - 0.2) }}>
          <Titulo tam={110}>8:41</Titulo>
          <Titulo tam={46} cor={AMARELO}>“PRIMEIRO BRASILEIRO A</Titulo>
          <Titulo tam={46} cor={AMARELO}>DESCOBRIR UM BUG NO GTA VI”</Titulo>
        </div>
        <div style={{ marginTop: 10, opacity: entra(t, titulo - 0.2) }}>
          <Rotulo cor="#fff">👑 152 MIL VIEWS · ELE QUER O TÍTULO</Rotulo>
        </div>
      </Caixa>
    </Bloco>
  );
};

const Fecho: React.FC<{ t: number }> = ({ t }) => {
  const mas = em("mas", FECHO);
  const ninguem = em("ninguém", FECHO);
  return (
    <Bloco t={t} de={FECHO} ate={INICIO_FINAL - 0.1} topo={420}>
      <Rotulo cor="#E2C4FF">OU SEJA</Rotulo>
      <Titulo tam={150}>37 MIN</Titulo>
      <Titulo tam={70}>PRO PRIMEIRO BUG</Titulo>
      <div style={{ marginTop: 22, opacity: entra(t, mas) }}>
        <Linha t={t} de={mas} ic="🤡" txt="FEIO E ENGRAÇADO" cor={AMARELO} tam={46} />
      </div>
      <div style={{ marginTop: 6, opacity: entra(t, ninguem), transform: `scale(${0.8 + 0.2 * entra(t, ninguem)})`, transformOrigin: "0% 50%" }}>
        <Titulo tam={66} cor={VERDE}>…E O JOGO SEGUE DE PÉ ✓</Titulo>
      </div>
    </Bloco>
  );
};

// ---------- Vyce no quarto gamer (final) + enquete ----------
const boca = (f: number) => (dados.boca as number[])[f] ?? 0;
const pisca = (t: number) => {
  const c = t % 4.3;
  return c > 1.4 && c < 1.52;
};
const OPCOES: [string, string, number, string][] = [
  ["🐛", "JÁ ACHEI BUG", em("achou", ENQUETE), AMARELO],
  ["✅", "ATÉ AGORA, LISO", em("liso", ENQUETE) - 0.2, VERDE],
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
          <Linha key={i} t={t} de={d} ic={ic} txt={`${i + 1} · ${nome}`} cor={cor} tam={42} />
        ))}
      </div>
      <div style={{ position: "absolute", top: 1090, left: 70, fontFamily, fontWeight: 900, fontSize: 44, color: "#fff", textShadow: sombra, opacity: entra(t, a + 1.7) }}>@faseextra.br</div>
    </AbsoluteFill>
  );
};

// ---------- legenda discreta (sem pulo de palavra) ----------
const DESTAQUE = /^(37|minutos|bug|bugs|famoso|vídeos|5|quebrado|lucia|chão|mapa|33|mil|volta|reinicia|hidroavião|porta|jason|piloto|policial|balcão|13|anos|keys|navio|ponte|kosky|geladeira|cerveja|mão|preguiça|boato|rockstar|25|falso|nada|brasil|8h41|título|feio|engraçado|vez|fase|extra|vyce|liso|comenta)$/i;
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
  const topo = emSetup(t) ? 1420 : ehLive(t) ? 1600 : 1560;
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

// ---------- som: whoosh baixo nas viradas, carimbo no BOATO ----------
const falando = (t: number) => PAL.some((p) => t >= p.s - 0.04 && t <= p.e + 0.04);
const VIRADAS = [GUIA, B1, B2, B3, B4, KOSKY_NAVIO, B5, BOATO, BRASIL, FECHO, INICIO_FINAL - 0.1];
const DUCK: number[] = (() => {
  const bruto = Array.from({ length: DURACAO_FASE19 }, (_, i) => (falando(i / FPS) ? 0.42 : 1));
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

export const VideoFase19: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const live = ehLive(t);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {!emSetup(t) && <Fundo t={t} />}
      {!emSetup(t) && !live && <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,4,24,.7) 0%, rgba(10,4,24,.35) 38%, rgba(10,4,24,0) 55%, rgba(10,4,24,.55) 100%)" }} />}
      {live && <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 60%, rgba(10,4,24,.55) 100%)" }} />}
      <Setup t={t} f={f} />

      <Abertura t={t} />
      <Guia t={t} />
      <Bug1 t={t} />
      <Bug2 t={t} />
      <Bug3 t={t} />
      <Bug4 t={t} />
      <Bug5 t={t} />
      <Boato t={t} />
      <Brasil t={t} />
      <Fecho t={t} />

      <Legenda t={t} />

      <Audio src={staticFile(ARQ("narracao.wav"))} />
      <Audio src={staticFile(ARQ("trilha.wav"))} volume={(q) => 0.63 * (DUCK[q] ?? 1)} />
      {VIRADAS.map((v, i) => (
        <Sequence key={i} from={Math.max(0, Math.round((v - 0.05) * FPS))} durationInFrames={45}>
          <Audio src={staticFile("fase-extra/sons/whoosh.wav")} volume={() => 0.3 * (falando(v) ? 0.5 : 1)} />
        </Sequence>
      ))}
      <Sequence from={Math.round((em("falso", BOATO) - 0.05) * FPS)} durationInFrames={30}>
        <Audio src={staticFile("fase-extra/sons/carimbo.wav")} volume={0.35} />
      </Sequence>
    </AbsoluteFill>
  );
};
