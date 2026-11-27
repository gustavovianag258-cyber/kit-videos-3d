import { loadFont } from "@remotion/google-fonts/Montserrat";
import { AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Acabamento, PalcoCinema } from "../../cinema/Palco";
import { Camera } from "../Estudio";
import { QuartoGamer } from "../QuartoGamer";
import dados from "./dados.json";

// Fase Extra, Fase 18: "Ser preso no GTA 6 não te leva pra cadeia" — primeiro vídeo no FORMATO NOVO
// (base: vídeo-guia do mapa em Perfil/Nova pasta). Guia com 5 regras, rótulo colorido + título branco, selos
// ROCKSTAR/PRÉVIA, gráficos limpos, imagens oficiais em movimento e gameplay real da prisão (live do kosky,
// câmera dele em cima e o jogo embaixo, com jogo de câmera). Vyce só na voz e no final (quarto gamer).
// Todos os tempos saem das palavras da narração (dados.json), então trocar a voz reajusta o vídeo sozinho.
const { fontFamily } = loadFont("normal", { weights: ["600", "800", "900"], subsets: ["latin"] });
export const FPS = 30;
const FIM = dados.duracao + 1.0;
export const DURACAO_FASE18 = Math.ceil(FIM * FPS);
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
const ARQ = (n: string) => `fase-extra/fase18/${n}`;

// ---------- âncoras: tempo de cada palavra da narração ----------
type Pal = { w: string; s: number; e: number };
const PAL = dados.palavras as Pal[];
const PROVISORIO = Boolean((dados as { provisorio?: boolean }).provisorio); // tempos estimados enquanto a voz real não chega
const limpa = (w: string) => w.toLowerCase().replace(/[.,?!:…]/g, "");
const em = (palavra: string, depois = 0) => PAL.find((p) => limpa(p.w) === palavra && p.s >= depois)?.s ?? 999;
const GUIA = em("então");
const R1 = em("regra", GUIA);
const R2 = em("regra", R1 + 1);
const R3 = em("regra", R2 + 1);
const R4 = em("regra", R3 + 1);
const R5 = em("regra", R4 + 1);
const CADEIA = em("cadeia", R5) - 0.4; // "E a cadeia?"
const LUCIA = em("mas", CADEIA); // "Mas cadeia existe"
const FECHO = em("ou", LUCIA); // "Ou seja"
const iFase = PAL.findIndex((p) => limpa(p.w) === "fase" && p.s >= FECHO);
const INICIO_FINAL = iFase >= 3 ? PAL[iFase - 3].s : 999; // "Você está na Fase Extra"
const ENQUETE = em("você", em("vyce", INICIO_FINAL)) - 0.25; // "E você:"
const emSetup = (t: number) => t >= INICIO_FINAL - 0.1;

// ---------- fundo: clipes e fotos oficiais, sempre em movimento ----------
type Plano = { de: number; clipe?: string; foto?: string; src?: number; x?: number; x2?: number; zoom?: number };
const PLANOS: Plano[] = [
  { de: GUIA - 0.1, clipe: "assalto", src: 0.5, x: 0.5, x2: 0.45, zoom: 1.12 },
  { de: R1 - 0.1, clipe: "assalto", src: 3.0, x: 0.45, x2: 0.55 },
  { de: em("câmera", R1), clipe: "assalto", src: 7.0, x: 0.5, x2: 0.5, zoom: 1.15 },
  { de: R2 - 0.1, foto: "perseguicao", x: 0.35, x2: 0.6 },
  { de: em("vazia", R2), foto: "lucia-policia", x: 0.55, x2: 0.4 },
  { de: R4 - 0.1, clipe: "assalto", src: 9.0, x: 0.5, x2: 0.45, zoom: 1.1 },
  { de: em("dá", R4), foto: "carro-arma", x: 0.45, x2: 0.6 },
  { de: R5 - 0.1, foto: "posto", x: 0.4, x2: 0.6 },
  { de: LUCIA - 0.1, foto: "lucia-presa", x: 0.42, x2: 0.5, zoom: 1.05 },
  { de: FECHO - 0.1, foto: "perseguicao", x: 0.7, x2: 0.5 },
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
  const k = interpolate(t, [p.de, fim], [0, 1], cl);
  const soco = 1 + 0.07 * (1 - suave(t, p.de, p.de + 0.3)); // soco de zoom na emenda
  const x = interpolate(k, [0, 1], [p.x ?? 0.5, p.x2 ?? p.x ?? 0.5]);
  const z = (p.zoom ?? 1.06) * (1 + 0.08 * k) * soco;
  const dur = Math.max(1, Math.round((fim - p.de) * FPS) + 2);
  return (
    <Sequence key={i} from={Math.round(p.de * FPS)} durationInFrames={dur} layout="none">
      <AbsoluteFill style={{ overflow: "hidden" }}>
        {p.clipe && (
          <OffthreadVideo src={staticFile(ARQ(`clipes/${p.clipe}.mp4`))} startFrom={Math.round((p.src ?? 0) * FPS)} muted style={{ position: "absolute", width: 1080, height: 1920, objectFit: "cover", transform: `scale(${z})`, transformOrigin: `${x * 100}% 50%`, filter: "brightness(1.12) saturate(1.1)" }} />
        )}
        {p.foto && <Img src={staticFile(ARQ(`fotos/${p.foto}.jpg`))} style={{ position: "absolute", height: 1920, width: 3413, left: -x * (3413 - 1080), top: 0, transform: `scale(${z})`, transformOrigin: "50% 50%", filter: "brightness(1.05) saturate(1.1)" }} />}
      </AbsoluteFill>
    </Sequence>
  );
};

// ---------- gameplay real: câmera do kosky em cima, jogo embaixo, com jogo de câmera ----------
// tempo do clipe (s) = live 14596 + src. Prisão: 9 "mãos para trás" · 19 de joelhos · 26 "perdeu, mané" · 44 de volta na rua.
type Tomada = { de: number; src: number; x0: number; x1: number; z0: number; z1: number };
const TOMADAS: Tomada[] = [
  { de: 0, src: 8.6, x0: 0.62, x1: 0.48, z0: 1.0, z1: 1.18 },
  { de: em("mas"), src: 25.1, x0: 0.5, x1: 0.5, z0: 1.05, z1: 1.2 },
  { de: CADEIA, src: 18.0, x0: 0.45, x1: 0.55, z0: 1.1, z1: 1.25 },
  { de: em("é", CADEIA + 1.5), src: 25.1, x0: 0.5, x1: 0.5, z0: 1.0, z1: 1.15 },
  { de: em("volta", CADEIA), src: 43.0, x0: 0.62, x1: 0.68, z0: 1.15, z1: 1.3 },
];
const emGameplay = (t: number) => (t < GUIA - 0.1) || (t >= CADEIA && t < LUCIA - 0.1);
const CAM_H = 560;
const Gameplay: React.FC<{ t: number }> = ({ t }) => {
  if (!emGameplay(t)) return null;
  let i = 0;
  while (i + 1 < TOMADAS.length && TOMADAS[i + 1].de <= t) i++;
  const tm = TOMADAS[i];
  const fim = Math.min(TOMADAS[i + 1]?.de ?? FIM, t < GUIA ? GUIA - 0.1 : LUCIA - 0.1);
  const k = interpolate(t, [tm.de, fim], [0, 1], { ...cl, easing: Easing.inOut(Easing.sin) });
  const soco = 1 + 0.09 * (1 - suave(t, tm.de, tm.de + 0.28));
  const z = interpolate(k, [0, 1], [tm.z0, tm.z1]) * soco;
  const x = interpolate(k, [0, 1], [tm.x0, tm.x1]);
  const H = 1920 - CAM_H;
  const W = (1080 / 1050) * H; // jogo 1080x1050 ocupando a altura toda
  const dur = Math.max(1, Math.round((fim - tm.de) * FPS) + 2);
  const srcAgora = tm.src + (t - tm.de);
  const perdeu = srcAgora > 25.1 && srcAgora < 33 ? entra(t, tm.de + Math.max(0, 25.1 - tm.src), 0.2) : 0;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Sequence key={`g${i}`} from={Math.round(tm.de * FPS)} durationInFrames={dur} layout="none">
        <div style={{ position: "absolute", left: 0, top: CAM_H, width: 1080, height: H, overflow: "hidden" }}>
          <OffthreadVideo src={staticFile(ARQ("clipes/prisao.mp4"))} startFrom={Math.round(tm.src * FPS)} muted style={{ position: "absolute", height: H, width: W, left: -x * (W - 1080), top: 0, transform: `scale(${z})`, transformOrigin: `${x * 100}% 45%`, filter: perdeu > 0 ? `blur(${18 * perdeu}px) brightness(${1 - 0.35 * perdeu})` : undefined }} />
          {perdeu > 0 && (
            <div style={{ position: "absolute", left: 0, right: 0, top: H * 0.38, textAlign: "center", fontFamily, fontWeight: 900, fontSize: 150, letterSpacing: -2, color: "#fff", opacity: perdeu, transform: `scale(${1.3 - 0.3 * perdeu})`, WebkitTextStroke: "12px #000", paintOrder: "stroke fill", textShadow: "0 10px 30px rgba(0,0,0,.6)" }}>
              PERDEU, MANÉ
            </div>
          )}
        </div>
        <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: CAM_H, overflow: "hidden", borderBottom: `6px solid ${ROXO}` }}>
          <OffthreadVideo src={staticFile(ARQ("clipes/kosky-cam.mov"))} startFrom={Math.round(tm.src * FPS)} muted style={{ position: "absolute", width: 1080, height: 608, top: (CAM_H - 608) / 2, transform: `scale(${1 + 0.04 * k})` }} />
        </div>
      </Sequence>
      <div style={{ position: "absolute", right: 30, bottom: 30, fontFamily, fontWeight: 800, fontSize: 24, letterSpacing: 3, color: "#fff", background: "rgba(0,0,0,.55)", borderRadius: 8, padding: "4px 12px" }}>GAMEPLAY · KICK.COM/KOSKY</div>
    </AbsoluteFill>
  );
};

// ---------- peças do formato novo ----------
const Rotulo: React.FC<{ cor: string; children: React.ReactNode }> = ({ cor, children }) => <div style={{ fontWeight: 800, fontSize: 32, letterSpacing: 8, color: cor, textShadow: sombra }}>{children}</div>;
const Titulo: React.FC<{ tam?: number; cor?: string; children: React.ReactNode }> = ({ tam = 92, cor = "#fff", children }) => <div style={{ fontWeight: 900, fontSize: tam, lineHeight: 0.98, letterSpacing: -1, color: cor, textShadow: sombra }}>{children}</div>;
const Selo: React.FC<{ tipo: "ROCKSTAR" | "PRÉVIA" | "ROCKSTAR NORTH"; t: number; de: number }> = ({ tipo, t, de }) => {
  const cor = tipo === "PRÉVIA" ? AMARELO : VERDE;
  return <div style={{ display: "inline-block", marginTop: 16, fontWeight: 800, fontSize: 24, letterSpacing: 4, color: "#111", background: cor, borderRadius: 8, padding: "4px 14px", opacity: entra(t, de) }}>{tipo === "PRÉVIA" ? "SEGUNDO QUEM JOGOU A PRÉVIA" : `CONFIRMADO · ${tipo}`}</div>;
};
// bloco de texto alinhado à esquerda, que entra deslizando e sai suave
const Bloco: React.FC<{ t: number; de: number; ate: number; topo?: number; children: React.ReactNode }> = ({ t, de, ate, topo = 200, children }) => {
  if (t < de - 0.05 || t > ate) return null;
  const k = entra(t, de, 0.4);
  const s = suave(t, ate - 0.25, ate);
  return <div style={{ position: "absolute", left: 70, right: 70, top: topo, fontFamily, color: "#fff", opacity: k * (1 - s), transform: `translateX(${(1 - k) * -50}px)` }}>{children}</div>;
};
const Linha: React.FC<{ t: number; de: number; ic: string; txt: string; cor?: string; riscado?: boolean; tam?: number }> = ({ t, de, ic, txt, cor = "#fff", riscado, tam = 44 }) => {
  const k = entra(t, de, 0.3);
  const r = riscado ? suave(t, de + 0.4, de + 0.7) : 0;
  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 18, marginTop: 14, opacity: k, transform: `translateX(${(1 - k) * -40}px)`, width: "fit-content", background: "rgba(14,8,30,.72)", borderLeft: `8px solid ${cor}`, borderRadius: 12, padding: "10px 22px 10px 18px" }}>
      <span style={{ fontSize: tam + 6 }}>{ic}</span>
      <span style={{ fontWeight: 900, fontSize: tam, color: "#fff", whiteSpace: "nowrap" }}>{txt}</span>
      {riscado && <div style={{ position: "absolute", left: 14, top: "50%", height: 6, width: `calc(${r * 100}% - 28px)`, background: VERMELHO, borderRadius: 3 }} />}
    </div>
  );
};

// abertura (por cima do gameplay)
const Abertura: React.FC<{ t: number }> = ({ t }) => (
  <Bloco t={t} de={0.15} ate={GUIA - 0.1} topo={CAM_H + 60}>
    <div style={{ display: "inline-block", background: "rgba(10,4,24,.72)", borderRadius: 18, padding: "16px 26px" }}>
      <Rotulo cor="#E2C4FF">GUIA ANTES DE JOGAR</Rotulo>
      <Titulo tam={86}>SER PRESO</Titulo>
      <Titulo tam={86}>NO GTA 6</Titulo>
    </div>
  </Bloco>
);

const Guia: React.FC<{ t: number }> = ({ t }) => {
  const cinco = em("5", GUIA);
  return (
    <Bloco t={t} de={GUIA} ate={R1 - 0.05}>
      <Rotulo cor="#E2C4FF">O GUIA</Rotulo>
      <Titulo>COMO A POLÍCIA</Titulo>
      <Titulo>TE ACHA</Titulo>
      <div style={{ marginTop: 18, opacity: entra(t, em("despistar", GUIA)) }}>
        <Titulo tam={60} cor={AZUL}>COMO DESPISTAR</Titulo>
      </div>
      <div style={{ marginTop: 10, opacity: entra(t, em("perde", GUIA)) }}>
        <Titulo tam={60} cor={VERMELHO}>O QUE VOCÊ PERDE</Titulo>
      </div>
      <div style={{ marginTop: 40, display: "flex", gap: 18 }}>
        {[1, 2, 3, 4, 5].map((n) => {
          const k = entra(t, cinco + n * 0.08, 0.25);
          return (
            <div key={n} style={{ width: 120, height: 120, borderRadius: 24, border: `5px solid ${ROXO}`, background: "rgba(14,8,30,.75)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 64, opacity: k, transform: `scale(${0.6 + 0.4 * k})` }}>
              {n}
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 14, opacity: entra(t, cinco + 0.5) }}>
        <Rotulo cor={AMARELO}>5 REGRAS</Rotulo>
      </div>
    </Bloco>
  );
};

const Regra1: React.FC<{ t: number }> = ({ t }) => (
  <Bloco t={t} de={R1} ate={R2 - 0.05}>
    <Rotulo cor={ROXO}>REGRA 1</Rotulo>
    <Titulo>A POLÍCIA</Titulo>
    <Titulo>PRECISA SABER</Titulo>
    <Selo tipo="PRÉVIA" t={t} de={R1 + 0.6} />
    <div style={{ marginTop: 26 }}>
      <Linha t={t} de={em("ver", R1)} ic="👁️" txt="ALGUÉM TE VIU" cor={AZUL} />
      <Linha t={t} de={em("alarme", R1)} ic="🚨" txt="ALARME DISPAROU" cor={VERMELHO} />
      <Linha t={t} de={em("câmera", R1)} ic="📹" txt="CÂMERA FILMOU" cor={AMARELO} />
      <Linha t={t} de={em("rastreador", R1)} ic="📡" txt="CARRO COM RASTREADOR" cor={ROSA} />
    </div>
    <div style={{ marginTop: 30, opacity: entra(t, em("red", R1)) }}>
      <Rotulo cor="#E2C4FF">🤠 IGUAL AO RED DEAD 2</Rotulo>
    </div>
  </Bloco>
);

const Estrela: React.FC<{ tipo: "cheia" | "piscando" | "vazia" | "vermelha"; t: number; tam?: number }> = ({ tipo, t, tam = 80 }) => {
  const cor = tipo === "vermelha" ? VERMELHO : "#fff";
  const pisca = tipo === "piscando" ? (Math.sin(t * 14) > 0 ? 1 : 0.25) : 1;
  return (
    <svg width={tam} height={tam} viewBox="-50 -50 100 100" style={{ opacity: pisca }}>
      <polygon points="0,-46 13,-15 46,-14 20,7 29,40 0,21 -29,40 -20,7 -46,-14 -13,-15" fill={tipo === "vazia" ? "none" : cor} stroke={cor} strokeWidth={tipo === "vazia" ? 6 : 3} strokeLinejoin="round" />
    </svg>
  );
};
const Regra2: React.FC<{ t: number }> = ({ t }) => {
  const seis = em("6", R2);
  const linhas: [("cheia" | "piscando" | "vazia" | "vermelha"), string, number][] = [
    ["cheia", "TÃO TE VENDO", em("branca", R2)],
    ["piscando", "ACABARAM DE TE PERDER", em("piscando", R2)],
    ["vazia", "SABEM DO CRIME, NÃO DE VOCÊ", em("vazia", R2)],
    ["vermelha", "FUGIU, MAS TÁ NA ÁREA", em("vermelha", R2)],
  ];
  return (
    <Bloco t={t} de={R2} ate={R3 - 0.05}>
      <Rotulo cor={AMARELO}>REGRA 2</Rotulo>
      <Titulo>AS ESTRELAS</Titulo>
      <Titulo>FALAM</Titulo>
      <Selo tipo="PRÉVIA" t={t} de={R2 + 0.6} />
      <div style={{ marginTop: 24, display: "flex", gap: 10 }}>
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const k = entra(t, seis + i * 0.07, 0.25);
          return (
            <div key={i} style={{ opacity: k, transform: `scale(${0.4 + 0.6 * k})` }}>
              <Estrela tipo="cheia" t={t} tam={100} />
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 10, opacity: entra(t, seis) }}>
        <Rotulo cor="#fff">6 ESTRELAS (NO GTA 5 ERAM 5)</Rotulo>
      </div>
      <div style={{ marginTop: 22 }}>
        {linhas.map(([tipo, txt, de]) => {
          const k = entra(t, de, 0.3);
          return (
            <div key={tipo} style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 12, opacity: k, transform: `translateX(${(1 - k) * -40}px)`, background: "rgba(14,8,30,.72)", borderRadius: 12, padding: "6px 22px 6px 12px", width: "fit-content" }}>
              <Estrela tipo={tipo} t={t} tam={64} />
              <span style={{ fontWeight: 900, fontSize: 40, whiteSpace: "nowrap" }}>{txt}</span>
            </div>
          );
        })}
      </div>
    </Bloco>
  );
};

// mapa 2D de Leonida (estilizado, nosso) com a zona quente
const Mapa: React.FC<{ t: number }> = ({ t }) => {
  if (t < R3 - 0.1 || t > R4) return null;
  const k = interpolate(t, [R3, R4], [0, 1], cl);
  const zona = entra(t, em("marcada", R3), 0.5);
  const pulso = 1 + 0.06 * Math.sin(t * 5);
  const sai = suave(t, R4 - 0.3, R4);
  return (
    <AbsoluteFill style={{ background: "#2F5FA0", opacity: 1 - sai }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ transform: `scale(${1.05 + 0.12 * k})`, transformOrigin: "62% 58%" }}>
        <defs>
          <filter id="brilho">
            <feGaussianBlur stdDeviation="16" />
          </filter>
          <pattern id="quadras" width="26" height="26" patternUnits="userSpaceOnUse">
            <rect width="26" height="26" fill="#C9C6D4" />
            <rect x="3" y="3" width="20" height="20" fill="#DDDAE6" />
          </pattern>
        </defs>
        <path d="M380 420 C560 360 760 420 800 580 C860 800 820 1060 760 1260 C720 1420 640 1580 560 1680 C500 1750 420 1720 400 1640 C360 1460 300 1280 290 1100 C280 860 260 580 380 420 Z" fill="#7FE8E0" filter="url(#brilho)" opacity=".75" />
        <path d="M380 420 C560 360 760 420 800 580 C860 800 820 1060 760 1260 C720 1420 640 1580 560 1680 C500 1750 420 1720 400 1640 C360 1460 300 1280 290 1100 C280 860 260 580 380 420 Z" fill="#B9DB72" />
        <ellipse cx="560" cy="640" rx="70" ry="50" fill="#2F86D0" />
        <path d="M650 860 C760 920 790 1140 720 1340 C690 1420 640 1410 640 1310 C630 1140 600 980 650 860 Z" fill="url(#quadras)" />
        {[0, 1, 2, 3, 4].map((i) => (
          <ellipse key={i} cx={830 + (i % 2) * 22} cy={900 + i * 90} rx="16" ry="34" fill="#B9DB72" stroke="#7FE8E0" strokeWidth="6" />
        ))}
        <path d="M340 760 C480 860 560 1060 600 1360 M420 460 C520 760 700 960 760 1160 M300 1100 C450 1080 600 1120 760 1100" stroke="#5C6B7A" strokeWidth="6" fill="none" opacity=".55" />
        <g opacity={zona} transform={`translate(700 1120) scale(${zona * pulso})`}>
          <circle r="170" fill="rgba(255,60,90,.28)" stroke={VERMELHO} strokeWidth="10" />
          <circle r="235" fill="none" stroke={VERMELHO} strokeWidth="4" opacity=".45" />
          <g transform="translate(-30 -40)">
            <polygon points="0,-46 13,-15 46,-14 20,7 29,40 0,21 -29,40 -20,7 -46,-14 -13,-15" fill={VERMELHO} transform="scale(.9)" />
          </g>
        </g>
      </svg>
      <div style={{ position: "absolute", left: 70, top: 200, fontFamily, color: "#fff" }}>
        <Rotulo cor={VERMELHO}>REGRA 3</Rotulo>
        <Titulo>O MAPA</Titulo>
        <Titulo>LEMBRA</Titulo>
        <Selo tipo="PRÉVIA" t={t} de={R3 + 0.6} />
      </div>
      <div style={{ position: "absolute", left: 470, top: 1400, fontFamily, opacity: zona }}>
        <Titulo tam={56}>ZONA QUENTE</Titulo>
        <div style={{ marginTop: 6, opacity: entra(t, em("tempo", R3)) }}>
          <Rotulo cor="#fff">CONTINUA ATIVA ⏳</Rotulo>
        </div>
      </div>
      <div style={{ position: "absolute", left: 70, top: 1700, fontFamily, opacity: entra(t, em("voltou", R3)), transform: `scale(${0.7 + 0.3 * entra(t, em("voltou", R3))})`, transformOrigin: "0% 50%" }}>
        <Linha t={t} de={em("voltou", R3)} ic="👮" txt="VOLTOU CEDO? ELES TÃO LÁ" cor={VERMELHO} />
      </div>
    </AbsoluteFill>
  );
};

const Regra4: React.FC<{ t: number }> = ({ t }) => {
  const dicas = em("então", R4);
  return (
    <Bloco t={t} de={R4} ate={R5 - 0.05}>
      <Rotulo cor={AZUL}>REGRA 4</Rotulo>
      <Titulo tam={84}>ELES PROCURAM</Titulo>
      <Titulo tam={84}>A DESCRIÇÃO</Titulo>
      {t < dicas && (
      <div style={{ marginTop: 24, opacity: entra(t, em("roupa", R4)) * (1 - suave(t, dicas - 0.2, dicas)) }}>
        <Rotulo cor="#E2C4FF">O QUE A POLÍCIA SABE</Rotulo>
        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          {[
            ["👕", "ROUPA", em("roupa", R4)],
            ["🔫", "ARMA", em("arma", R4)],
            ["🚗", "CARRO", em("carro", R4)],
            ["📹", "CÂMERA", em("câmera", R4)],
          ].map(([ic, n, de]) => (
            <div key={n as string} style={{ width: 200, padding: "14px 0", borderRadius: 18, background: "rgba(14,8,30,.78)", border: `4px solid ${AZUL}`, textAlign: "center", opacity: entra(t, de as number, 0.25) }}>
              <div style={{ fontSize: 60 }}>{ic}</div>
              <div style={{ fontWeight: 900, fontSize: 30 }}>{n}</div>
            </div>
          ))}
        </div>
      </div>
      )}
      {t >= dicas && (
        <div style={{ marginTop: 24 }}>
          <Rotulo cor={VERDE}>COMO DESPISTAR</Rotulo>
          <Linha t={t} de={em("troca", R4)} ic="👕" txt="TROCA DE ROUPA" cor={VERDE} tam={40} />
          <Linha t={t} de={em("máscara", R4)} ic="🎭" txt="PÕE MÁSCARA" cor={VERDE} tam={40} />
          <Linha t={t} de={em("esconde", R4)} ic="🔫" txt="ESCONDE A ARMA" cor={VERDE} tam={40} />
          <Linha t={t} de={em("troca", em("esconde", R4))} ic="🚗" txt="TROCA DE CARRO" cor={VERDE} tam={40} />
          <Linha t={t} de={em("cortar", R4)} ic="💇" txt="CORTA O CABELO" cor={VERDE} tam={40} />
          <Linha t={t} de={em("separar", R4)} ic="👫" txt="SEPARA JASON E LUCIA = −1 ⭐" cor={AMARELO} tam={40} />
        </div>
      )}
    </Bloco>
  );
};

const Regra5: React.FC<{ t: number }> = ({ t }) => {
  const bolso = em("bolso", R5);
  const banco = em("banco", R5);
  return (
    <Bloco t={t} de={R5} ate={CADEIA - 0.05}>
      <Rotulo cor={VERDE}>REGRA 5 · A MAIS IMPORTANTE</Rotulo>
      <Titulo>O BANCO</Titulo>
      <Titulo>TE SALVA</Titulo>
      <Selo tipo="ROCKSTAR NORTH" t={t} de={R5 + 0.6} />
      <div style={{ margin: "30px 0 0 120px", width: 560, padding: "26px 26px 30px", borderRadius: 56, background: "#0d0a18", border: "8px solid #2c2442", boxShadow: "0 20px 50px rgba(0,0,0,.6)", opacity: entra(t, em("rodou", R5)), transform: `scale(${0.7 + 0.3 * entra(t, em("rodou", R5))})` }}>
        <div style={{ fontWeight: 800, fontSize: 26, color: "#9aa" }}>💳 Conta · Jason & Lucia</div>
        <div style={{ position: "relative", marginTop: 20, padding: "16px 20px", borderRadius: 20, background: "rgba(255,77,94,.15)", border: `3px solid ${VERMELHO}`, opacity: entra(t, bolso) }}>
          <div style={{ fontWeight: 800, fontSize: 26, color: "#ffb3bb" }}>NO BOLSO</div>
          <div style={{ fontWeight: 900, fontSize: 52, color: VERMELHO }}>{t > bolso + 0.5 ? "$0 · PERDIDO ✗" : "$ 4.850"}</div>
        </div>
        <div style={{ marginTop: 16, padding: "16px 20px", borderRadius: 20, background: "rgba(74,222,128,.15)", border: `3px solid ${VERDE}`, opacity: entra(t, banco) }}>
          <div style={{ fontWeight: 800, fontSize: 26, color: "#b9f5cc" }}>NO BANCO</div>
          <div style={{ fontWeight: 900, fontSize: 52, color: VERDE }}>SEGURO ✓</div>
        </div>
      </div>
      <div style={{ marginTop: 24 }}>
        <Linha t={t} de={em("armas", R5)} ic="🔫" txt="SUAS ARMAS → PORTA-MALAS" cor={AMARELO} tam={40} />
      </div>
    </Bloco>
  );
};

// por cima do gameplay da prisão
const SemCadeia: React.FC<{ t: number }> = ({ t }) => (
  <Bloco t={t} de={CADEIA} ate={LUCIA - 0.1} topo={CAM_H + 70}>
    <Titulo tam={74}>E A CADEIA?</Titulo>
    <div style={{ marginTop: 12, display: "inline-block", fontWeight: 800, fontSize: 26, letterSpacing: 3, color: "#111", background: AMARELO, borderRadius: 8, padding: "5px 14px", opacity: entra(t, em("ninguém", CADEIA)) }}>SEM CADEIA JOGÁVEL (ATÉ AGORA)</div>
  </Bloco>
);

const Lucia: React.FC<{ t: number }> = ({ t }) => (
  <Bloco t={t} de={LUCIA} ate={FECHO - 0.05} topo={1100}>
    <Rotulo cor="#FFB070">MAS CADEIA EXISTE</Rotulo>
    <Titulo tam={70}>A HISTÓRIA COMEÇA</Titulo>
    <Titulo tam={70}>COM A LUCIA PRESA</Titulo>
    <div style={{ marginTop: 12, opacity: entra(t, em("penitenciária", LUCIA)) }}>
      <Rotulo cor="#fff">PENITENCIÁRIA DE LEONIDA</Rotulo>
    </div>
    <Selo tipo="ROCKSTAR" t={t} de={LUCIA + 0.8} />
  </Bloco>
);

const Fecho: React.FC<{ t: number }> = ({ t }) => {
  const desde = em("desde", FECHO);
  return (
    <Bloco t={t} de={FECHO} ate={INICIO_FINAL - 0.1} topo={620}>
      <Rotulo cor="#E2C4FF">OU SEJA</Rotulo>
      <Titulo tam={96}>O CRIME</Titulo>
      <Titulo tam={96}>COMPENSA…</Titulo>
      <div style={{ marginTop: 26, opacity: entra(t, desde), transform: `scale(${0.8 + 0.2 * entra(t, desde)})`, transformOrigin: "0% 50%" }}>
        <Titulo tam={70} cor={VERDE}>…SE VOCÊ DEPOSITAR 🏦</Titulo>
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
  ["🏦", "DEPOSITO TUDO", em("deposita", ENQUETE), VERDE],
  ["💵", "ANDO COM TUDO NO BOLSO", em("anda", ENQUETE), AMARELO],
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
const DESTAQUE = /^(preso|cadeia|dói|guia|cinco|regras|estrela|alguém|alarme|câmera|rastreador|red|dead|seis|branca|piscando|vazia|vermelha|mapa|quente|cedo|descrição|roupa|máscara|arma|carro|cabelo|jason|lucia|estrela|bolso|banco|seguro|porta-malas|pobre|existe|penitenciária|compensa|deposite|fase|extra|vyce|comenta)$/i;
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
  const naTelaDePreso = (t >= em("mas") && t < GUIA) || (t >= em("é", CADEIA + 1.5) && t < em("volta", CADEIA));
  const topo = emGameplay(t) ? (naTelaDePreso ? 1640 : 1180) : emSetup(t) ? 1420 : 1560;
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

// ---------- som: só whoosh baixo nas viradas (formato novo, sem impacto) ----------
const falando = (t: number) => PAL.some((p) => t >= p.s - 0.04 && t <= p.e + 0.04);
const VIRADAS = [GUIA, R1, R2, R3, R4, R5, CADEIA, LUCIA, FECHO, INICIO_FINAL - 0.1];
const DUCK: number[] = (() => {
  const bruto = Array.from({ length: DURACAO_FASE18 }, (_, i) => (falando(i / FPS) ? 0.42 : 1));
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

export const VideoFase18: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const noFundo = !emSetup(t) && !emGameplay(t);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {noFundo && <Fundo t={t} />}
      {noFundo && <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,4,24,.72) 0%, rgba(10,4,24,.45) 40%, rgba(10,4,24,.2) 62%, rgba(10,4,24,.6) 100%)" }} />}
      <Mapa t={t} />
      <Gameplay t={t} />
      <Setup t={t} f={f} />

      <Abertura t={t} />
      <Guia t={t} />
      <Regra1 t={t} />
      <Regra2 t={t} />
      <Regra4 t={t} />
      <Regra5 t={t} />
      <SemCadeia t={t} />
      <Lucia t={t} />
      <Fecho t={t} />

      <Legenda t={t} />

      {!PROVISORIO && <Audio src={staticFile(ARQ("narracao.wav"))} />}
      {!PROVISORIO && <Audio src={staticFile(ARQ("trilha.wav"))} volume={(q) => 0.63 * (DUCK[q] ?? 1)} />}
      {VIRADAS.map((v, i) => (
        <Sequence key={i} from={Math.max(0, Math.round((v - 0.05) * FPS))} durationInFrames={45}>
          <Audio src={staticFile("fase-extra/sons/whoosh.wav")} volume={() => 0.3 * (falando(v) ? 0.5 : 1)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
