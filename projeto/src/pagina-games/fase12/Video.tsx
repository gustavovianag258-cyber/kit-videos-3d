import { loadFont } from "@remotion/google-fonts/Montserrat";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { Acabamento, PalcoCinema } from "../../cinema/Palco";
import { Camera } from "../Estudio";
import { Mascote3D, PoseMascote } from "../Mascote3D";
import { QuartoGamer } from "../QuartoGamer";
import dados from "./dados.json";

// Fase Extra, Fase 12: "NPC ou personagem? No GTA 6 você não vai saber" (~90 s).
// Quiz de 3 rodadas (Cal = personagem, mulher da mesa do fundo = NPC, Real Dimez = personagem) e 5 motivos, todos
// ditos pela Rockstar: animação que se ajusta ao corpo (Rob Nelson/IGN), equipe de diálogo de pedestre em LA
// (Rupert Humphries/James Horton), NPC que percebe quem encara, mundo que age em você, sem gíria da moda.
// Imagens: capturas oficiais dos personagens + cenas do "Um Olhar Estendido" que nenhuma Fase usou.
const { fontFamily } = loadFont("normal", { weights: ["600", "800", "900"], subsets: ["latin"] });
export const FPS = 30;
const FIM = dados.duracao + 1.0;
export const DURACAO_FASE12 = Math.ceil(FIM * FPS);
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

const INICIO_FINAL = 82.49; // "Você está na Fase Extra"
const emSetup = (t: number) => t >= INICIO_FINAL;
const CLIPE = (n: string) => `fase-extra/fase12/clipes/${n}.mp4`;
const FOTO = (n: string) => `fase-extra/fase12/fotos/${n}`;
const CAL = FOTO("cal-rosto.jpg");
const NPC = FOTO("npc-mesa.png");
const DIMEZ = FOTO("dimez-rosto.jpg");

// ---------- planos: vídeo (clipe) ou foto desfocada de fundo ----------
type Plano = { de: number; clipe?: string; foto?: string; src?: number; x?: number; x2?: number; zoom?: number; chicote?: boolean };
const PLANOS: Plano[] = [
  { de: 0.0, foto: CAL, zoom: 1.2 },
  { de: 5.07, clipe: "terraco", src: 0.5, x: 0.5, x2: 0.45, chicote: true },
  { de: 8.71, clipe: "conversa", src: 3.0, x: 0.45, x2: 0.55, zoom: 1.1 },
  // quiz
  { de: 10.38, foto: CAL, chicote: true },
  { de: 17.04, foto: NPC, chicote: true },
  { de: 23.45, foto: DIMEZ, chicote: true },
  // re-gancho
  { de: 29.15, clipe: "boate", src: 0.5, x: 0.5, x2: 0.45, chicote: true, zoom: 1.1 },
  // 1 corpo
  { de: 33.85, clipe: "corpo", src: 1.5, x: 0.45, x2: 0.55, chicote: true },
  { de: 40.91, clipe: "corpo", src: 3.5, x: 0.5, x2: 0.45, zoom: 1.12 },
  // 2 fala
  { de: 47.24, clipe: "conversa", src: 0.0, x: 0.5, x2: 0.42, chicote: true },
  { de: 52.53, clipe: "conversa", src: 7.5, x: 0.45, x2: 0.55, zoom: 1.1 },
  { de: 56.36, clipe: "terraco", src: 1.5, x: 0.5, x2: 0.45, chicote: true },
  // 3 encarar
  { de: 61.64, clipe: "grupo", src: 0.5, x: 0.5, x2: 0.45, chicote: true },
  { de: 64.25, clipe: "grupo", src: 2.5, x: 0.45, x2: 0.5, zoom: 1.15 },
  // 4 perigo
  { de: 67.15, clipe: "gangue", src: 10.0, x: 0.5, x2: 0.45, chicote: true },
  { de: 70.49, clipe: "gangue", src: 12.0, x: 0.45, x2: 0.55, zoom: 1.1, chicote: true },
  { de: 72.38, clipe: "gangue", src: 3.0, x: 0.5, x2: 0.45, zoom: 1.08 },
  // 5 gíria
  { de: 74.36, clipe: "bar", src: 2.5, x: 0.5, x2: 0.45, chicote: true },
  { de: 78.44, clipe: "gangue", src: 0.3, x: 0.45, x2: 0.55, zoom: 1.1 },
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
        {p.clipe && <OffthreadVideo src={staticFile(CLIPE(p.clipe))} startFrom={Math.round((p.src ?? 0) * FPS)} muted style={{ ...cheia, filter: "brightness(1.08) contrast(1.05) saturate(1.15)" }} />}
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


// ---------- quiz ----------
const Rodada: React.FC<{ t: number; de: number; ate: number; n: number; foto: string; conta: [number, number, number]; revela: number; npc?: boolean; nome: string; deNome: number; pos?: string }> = ({ t, de, ate, n, foto, conta, revela, npc, nome, deNome, pos = "50% 30%" }) => {
  if (t < de || t > ate) return null;
  const k = entra(t, de, 0.35);
  const sai = suave(t, ate - 0.2, ate);
  const r = suave(t, revela, revela + 0.15);
  const cor = npc ? LARANJA : VERDE;
  const num = t >= conta[2] ? "1" : t >= conta[1] ? "2" : t >= conta[0] ? "3" : "";
  const deN = t >= conta[2] ? conta[2] : t >= conta[1] ? conta[1] : conta[0];
  const pulso = num && t < revela ? 1.6 - 0.6 * suave(t, deN, deN + 0.25) : 1;
  return (
    <div style={{ position: "absolute", top: 240, left: 60, right: 180, textAlign: "center", fontFamily, color: "#fff", opacity: k * (1 - sai), transform: `scale(${0.7 + 0.3 * k})` }}>
      <div style={{ fontWeight: 900, fontSize: 40, letterSpacing: 6, color: AMARELO, textShadow: sombra }}>RODADA {n}/3</div>
      <div style={{ position: "relative", margin: "12px auto 0", width: 620, height: 640, borderRadius: 30, overflow: "hidden", border: `6px solid ${r > 0.5 ? cor : "#fff"}`, boxShadow: `0 0 ${20 + 40 * r}px ${r > 0.5 ? cor : "rgba(255,255,255,.4)"}` }}>
        <Img src={staticFile(foto)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: pos, transform: `scale(${1.05 + 0.05 * (t - de) / (ate - de)})` }} />
        {t < revela && num && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,.25)" }}>
            <div style={{ fontWeight: 900, fontSize: 260, color: "#fff", textShadow: "0 0 40px rgba(0,0,0,.8)", transform: `scale(${pulso})` }}>{num}</div>
          </div>
        )}
        {r > 0 && (
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "14px 0", background: cor, color: "#111", fontWeight: 900, fontSize: 70, transform: `translateY(${(1 - r) * 120}%)` }}>{npc ? "NPC" : "PERSONAGEM"}</div>
        )}
      </div>
      {t < revela && (
        <div style={{ display: "flex", justifyContent: "center", gap: 18, marginTop: 18 }}>
          {["PERSONAGEM", "NPC"].map((b, i) => (
            <div key={b} style={{ fontWeight: 900, fontSize: 44, padding: "6px 26px", borderRadius: 18, background: "rgba(20,10,40,.85)", border: `4px solid ${i === 0 ? VERDE : LARANJA}`, boxShadow: `0 0 ${10 + 14 * Math.abs(Math.sin(t * 6 + i * 1.5))}px ${i === 0 ? VERDE : LARANJA}` }}>{b}</div>
          ))}
        </div>
      )}
      <div style={{ marginTop: 18, opacity: entra(t, deNome), transform: `scale(${0.6 + 0.4 * entra(t, deNome)})` }}>
        <div style={{ display: "inline-block", fontWeight: 900, fontSize: 46, color: "#fff", background: "rgba(20,10,40,.85)", border: `4px solid ${cor}`, borderRadius: 18, padding: "4px 24px", whiteSpace: "nowrap" }}>{nome}</div>
      </div>
    </div>
  );
};
// gancho: o rosto com os dois botões
const Gancho: React.FC<{ t: number }> = ({ t }) => {
  const ate = 5.0;
  if (t > ate) return null;
  const k = entra(t, 0, 0.35);
  const sai = suave(t, ate - 0.2, ate);
  const z = 1.25 - 0.15 * suave(t, 0, 4.5);
  return (
    <div style={{ position: "absolute", top: 240, left: 60, right: 180, textAlign: "center", fontFamily, color: "#fff", opacity: k * (1 - sai) }}>
      <div style={{ margin: "0 auto", width: 620, height: 700, borderRadius: 30, overflow: "hidden", border: "6px solid #fff", boxShadow: "0 0 40px rgba(255,255,255,.4)" }}>
        <Img src={staticFile(CAL)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 25%", transform: `scale(${z})` }} />
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 18, marginTop: 18 }}>
        {[["PERSONAGEM", VERDE, 0.78], ["NPC", LARANJA, 3.56]].map(([b, c, d]) => (
          <div key={b as string} style={{ fontWeight: 900, fontSize: 48, padding: "6px 26px", borderRadius: 18, background: "rgba(20,10,40,.85)", border: `4px solid ${c}`, boxShadow: `0 0 26px ${c}`, opacity: entra(t, d as number), transform: `scale(${0.5 + 0.5 * entra(t, d as number)})` }}>{b as string}</div>
        ))}
      </div>
    </div>
  );
};

// ---------- cabeçalho de cada motivo ----------
const Motivo: React.FC<{ t: number; de: number; ate: number; n: string; titulo: string; cor: string }> = ({ t, de, ate, n, titulo, cor }) => {
  if (t < de || t > ate) return null;
  const k = entra(t, de, 0.3);
  const sai = suave(t, ate - 0.15, ate);
  return (
    <div style={{ position: "absolute", top: 230, left: 60, right: 180, display: "flex", justifyContent: "center", alignItems: "center", gap: 16, fontFamily, opacity: k * (1 - sai), transform: `translateX(${(1 - k) * -200}px)` }}>
      <div style={{ width: 92, height: 92, borderRadius: 22, background: cor, color: "#111", fontWeight: 900, fontSize: 66, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 26px ${cor}` }}>{n}</div>
      <div style={{ fontWeight: 900, fontSize: 70, color: "#fff", textShadow: sombra, whiteSpace: "nowrap" }}>{titulo}</div>
    </div>
  );
};
// 1) corpo: baixinho e grandão com a mesma animação x ajustada
const Boneco: React.FC<{ h: number; w: number; cor: string; braco: number }> = ({ h, w, cor, braco }) => (
  <div style={{ position: "relative", width: w, height: h }}>
    <div style={{ position: "absolute", left: w / 2 - h * 0.09, top: 0, width: h * 0.18, height: h * 0.18, borderRadius: "50%", background: cor }} />
    <div style={{ position: "absolute", left: w / 2 - w * 0.22, top: h * 0.2, width: w * 0.44, height: h * 0.42, borderRadius: 18, background: cor }} />
    <div style={{ position: "absolute", left: w / 2 + w * 0.18, top: h * 0.24, width: h * 0.36, height: 14, borderRadius: 7, background: cor, transformOrigin: "0% 50%", transform: `rotate(${braco}deg)` }} />
    <div style={{ position: "absolute", left: w / 2 - w * 0.2, top: h * 0.6, width: w * 0.14, height: h * 0.4, borderRadius: 8, background: cor }} />
    <div style={{ position: "absolute", left: w / 2 + w * 0.06, top: h * 0.6, width: w * 0.14, height: h * 0.4, borderRadius: 8, background: cor }} />
  </div>
);
const Corpo: React.FC<{ t: number }> = ({ t }) => {
  const de = 34.0;
  const ate = 47.15;
  if (t < de || t > ate) return null;
  const k = entra(t, de + 0.3, 0.35);
  const sai = suave(t, ate - 0.2, ate);
  const ajusta = suave(t, 42.0, 42.8);
  const soco = Math.max(0, Math.sin((t - 44.3) * 9)) * (t > 44.3 && t < 45.5 ? 1 : 0);
  // antes do ajuste o soco do baixinho "atravessa" o grandão (animação feita pra outra altura)
  const bracoB = -10 - 30 * soco - 25 * (1 - ajusta);
  return (
    <div style={{ position: "absolute", top: 360, left: 60, right: 180, textAlign: "center", fontFamily, color: "#fff", opacity: k * (1 - sai), transform: `scale(${0.7 + 0.3 * k})` }}>
      <div style={{ display: "inline-flex", alignItems: "flex-end", gap: 30 + 40 * ajusta, padding: "26px 40px 20px", borderRadius: 28, background: "rgba(14,8,30,.82)", border: `4px solid ${ajusta > 0.5 ? VERDE : LARANJA}` }}>
        <Boneco h={300} w={150} cor={AZUL} braco={bracoB} />
        <Boneco h={430} w={220} cor={ROSA} braco={160 + 10 * soco} />
      </div>
      <div style={{ marginTop: 12 }}>
        <Chip t={t} de={36.93} cor={LARANJA} riscado={t > 41.5}>MESMAS ANIMAÇÕES</Chip>
      </div>
      <div style={{ opacity: entra(t, 42.0), transform: `scale(${0.6 + 0.4 * entra(t, 42.0)})` }}>
        <G tam={96} cor={VERDE}>AJUSTA NA HORA</G>
      </div>
      <div>
        <Chip t={t} de={44.33} cor={AZUL} tam={34}>🥊 BRIGAM</Chip>
        <Chip t={t} de={44.93} cor={AZUL} tam={34}>🚗 SENTAM NO CARRO</Chip>
        <Chip t={t} de={46.16} cor={VERDE} tam={34}>✓ NINGUÉM ATRAVESSA</Chip>
      </div>
    </div>
  );
};
// 2) fala: mapa das cidades + balões
const Cidade: React.FC<{ t: number; de: number; nome: string; x: number; y: number; cor: string; grande?: boolean }> = ({ t, de, nome, x, y, cor, grande }) => {
  const q = entra(t, de, 0.3);
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) scale(${q})`, textAlign: "center" }}>
      <div style={{ margin: "0 auto", width: grande ? 40 : 28, height: grande ? 40 : 28, borderRadius: "50%", background: cor, boxShadow: `0 0 0 ${8 + 6 * Math.sin(t * 5)}px ${cor}44, 0 0 20px ${cor}` }} />
      <div style={{ fontWeight: 900, fontSize: grande ? 40 : 32, color: "#fff", marginTop: 6, whiteSpace: "nowrap", textShadow: sombra }}>{nome}</div>
    </div>
  );
};
const Fala: React.FC<{ t: number }> = ({ t }) => {
  const de = 47.3;
  const ate = 56.3;
  if (t < de || t > ate) return null;
  const k = entra(t, de, 0.35);
  const sai = suave(t, ate - 0.2, ate);
  return (
    <div style={{ position: "absolute", top: 360, left: 60, right: 180, height: 560, fontFamily, opacity: k * (1 - sai) }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: 28, background: "rgba(14,8,30,.82)", border: `4px solid ${AZUL}` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 18, textAlign: "center", fontWeight: 800, fontSize: 30, letterSpacing: 4, color: "#ccc" }}>QUEM ESCREVE O PAPO DO NPC</div>
      <Cidade t={t} de={50.11} nome="LOS ANGELES" x={170} y={250} cor={AMARELO} grande />
      <Cidade t={t} de={54.29} nome="NOVA YORK" x={600} y={190} cor={AZUL} />
      <Cidade t={t} de={55.78} nome="LONDRES" x={640} y={400} cor={ROSA} />
      <div style={{ position: "absolute", left: 40, top: 330, opacity: entra(t, 51.33), transform: `scale(${0.6 + 0.4 * entra(t, 51.33)})`, transformOrigin: "0% 0%" }}>
        <div style={{ fontWeight: 900, fontSize: 34, color: "#111", background: AMARELO, borderRadius: 14, padding: "6px 14px", whiteSpace: "nowrap" }}>💬 SÓ PAPO DE PEDESTRE</div>
      </div>
      <div style={{ position: "absolute", left: 360, top: 470, opacity: entra(t, 53.11), whiteSpace: "nowrap", fontWeight: 900, fontSize: 30, color: "#fff" }}>😂 HUMOR · 📺 PROPAGANDA</div>
    </div>
  );
};
// pedaço x conversa inteira
const Ouvir: React.FC<{ t: number }> = ({ t }) => {
  const de = 56.4;
  const ate = 61.6;
  if (t < de || t > ate) return null;
  const k = entra(t, de, 0.3);
  const sai = suave(t, ate - 0.2, ate);
  const linha = (txt: string, d: number, cor: string) => (
    <div style={{ opacity: entra(t, d, 0.2), display: "inline-block", margin: "6px 4px", padding: "10px 18px", borderRadius: 22, background: "#fff", color: "#111", fontWeight: 800, fontSize: 32, borderBottom: `6px solid ${cor}` }}>{txt}</div>
  );
  return (
    <div style={{ position: "absolute", top: 360, left: 60, right: 180, textAlign: "center", fontFamily, color: "#fff", opacity: k * (1 - sai) }}>
      <div style={{ padding: "18px", borderRadius: 26, background: "rgba(14,8,30,.85)", border: `4px solid ${LARANJA}` }}>
        <div style={{ fontWeight: 900, fontSize: 46, color: LARANJA }}>🏃 PASSANDO CORRENDO</div>
        {linha("…não, mas aí ele…", 57.4, LARANJA)}
      </div>
      <div style={{ marginTop: 18, padding: "18px", borderRadius: 26, background: "rgba(14,8,30,.85)", border: `4px solid ${VERDE}`, opacity: entra(t, 59.04) }}>
        <div style={{ fontWeight: 900, fontSize: 46, color: VERDE }}>🧍 PAROU PRA OUVIR</div>
        {linha("💬 conversa inteira", 59.5, VERDE)}
        {linha("😂 com piada", 60.0, VERDE)}
        {linha("✓ vale a pena", 60.82, VERDE)}
      </div>
    </div>
  );
};
// 3) encarar: contador + balão "QUE FOI?"
const Encarar: React.FC<{ t: number }> = ({ t }) => {
  const de = 61.7;
  const ate = 67.1;
  if (t < de || t > ate) return null;
  const sai = suave(t, ate - 0.2, ate);
  const s = Math.min(9, Math.floor((t - 62.36) * 2.2));
  const balao = entra(t, 65.85, 0.3);
  return (
    <div style={{ position: "absolute", top: 380, left: 60, right: 180, textAlign: "center", fontFamily, opacity: 1 - sai }}>
      <div style={{ display: "inline-block", opacity: entra(t, 62.36), fontWeight: 900, fontSize: 52, color: "#fff", background: "rgba(14,8,30,.8)", border: `4px solid ${AMARELO}`, borderRadius: 20, padding: "6px 24px", whiteSpace: "nowrap" }}>👀 ENCARANDO… {Math.max(0, s)}s</div>
      <div style={{ marginTop: 40, display: "inline-block", opacity: balao, transform: `scale(${0.3 + 0.7 * balao}) rotate(-4deg)`, position: "relative" }}>
        <div style={{ fontWeight: 900, fontSize: 110, color: "#111", background: "#fff", borderRadius: 40, padding: "10px 44px", boxShadow: "0 20px 40px rgba(0,0,0,.5)" }}>QUE FOI? 😒</div>
        <div style={{ position: "absolute", left: 80, bottom: -36, width: 0, height: 0, borderLeft: "30px solid transparent", borderRight: "30px solid transparent", borderTop: "44px solid #fff" }} />
      </div>
    </div>
  );
};
// 4) perigo
const Perigo: React.FC<{ t: number }> = ({ t }) => (
  <Bloco t={t} de={67.8} ate={74.3} topo={380}>
    <G tam={96}>VOCÊ NÃO É O ÚNICO</G>
    <G tam={120} cor={VERMELHO}>PERIGOSO</G>
    <div>
      <Chip t={t} de={69.95} cor={VERMELHO}>🔥 GANGUE</Chip>
      <Chip t={t} de={70.58} cor={VERMELHO}>🔫 GENTE ARMADA</Chip>
      <Chip t={t} de={71.33} cor={LARANJA}>🎲 ENCONTRO ALEATÓRIO</Chip>
    </div>
    <Selo texto="O MUNDO TAMBÉM AGE EM VOCÊ" cor={AMARELO} t={t} de={72.96} />
  </Bloco>
);
// 5) gíria
const Giria: React.FC<{ t: number }> = ({ t }) => (
  <Bloco t={t} de={75.4} ate={82.4} topo={380}>
    <div>
      <Chip t={t} de={75.96} cor={VERMELHO} riscado tam={52}>😂 MEME DA MODA</Chip>
    </div>
    <div>
      <Chip t={t} de={76.51} cor={VERMELHO} riscado tam={52}>🗣️ GÍRIA DE HOJE</Chip>
    </div>
    <div style={{ marginTop: 18, opacity: entra(t, 77.36) }}>
      <G tam={96} cor={VERDE}>PRO JOGO NÃO</G>
      <G tam={96} cor={VERDE}>FICAR VELHO</G>
    </div>
    <Selo texto="DEMOROU TANTO QUE IA ENVELHECER" cor={AMARELO} t={t} de={78.95} />
  </Bloco>
);

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
const REACOES = [5.2, 8.8, 29.3];
const JANELAS: [number, number][] = [
  [5.07, 10.3], // se errou, a culpa é da Rockstar / 3 rodadas / comenta quantas acertou
  [29.15, 33.8], // por que tá tão difícil?
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
const ENQUETE = 84.98;
const OPCOES: [string, string, number, string][] = [
  ["👂", "PARO PRA OUVIR", 85.71, VERDE],
  ["🏃", "PASSO CORRENDO", 87.18, LARANJA],
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
        <div style={{ fontWeight: 800, fontSize: 34, letterSpacing: 5, color: "#E6D2FF", textShadow: sombra }}>CONVERSA DE NPC:</div>
        <div style={{ fontWeight: 900, fontSize: 84, lineHeight: 0.95, color: "#fff", textShadow: sombra }}>VOCÊ…</div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 12 }}>
          {OPCOES.map(([ic, nome, d, cor], i) => (
            <Chip key={i} t={t} de={d} cor={cor} tam={46}>
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
const DESTAQUE = /^(GTA|6…|6|personagem|NPC|Rockstar|errou|rodadas|acertou|personagens|Cal|lista|Real|Dimez|difícil|caprichou|nunca|altura|corpo|animações|tamanho|sistema|hora|baixinho|grandão|ninguém|falam|equipe|Los|Angeles|pedestre|humor|propaganda|Nova|York|Londres|pedaço|vale|pena|encarando|grupo|demais|perguntam|quer|perigoso|Gangue|armada|aleatório|mundo|meme|gíria|velho|envelhecer|Fase|Extra|Vyce|ouvir|correndo|Comenta|Um:|Dois:|Três:|Quatro:|cinco:)$/i;
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
    <div style={{ position: "absolute", top: 1240, left: 60, right: 180, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 28px" }}>
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
const IMPACTOS = [0, 13.15, 20.02, 26.89, 29.15, 65.85];
const SONS: { s: string; t: number; v: number }[] = [
  { s: "dum", t: 0.0, v: 0.6 },
  { s: "whoosh", t: 5.05, v: 0.4 },
  { s: "whoosh", t: 10.36, v: 0.45 },
  { s: "carimbo", t: 13.15, v: 0.55 },
  { s: "whoosh", t: 17.02, v: 0.45 },
  { s: "carimbo", t: 20.02, v: 0.55 },
  { s: "whoosh", t: 23.43, v: 0.45 },
  { s: "carimbo", t: 26.89, v: 0.55 },
  { s: "dum", t: 29.15, v: 0.6 },
  { s: "whoosh", t: 33.83, v: 0.45 },
  { s: "dum", t: 42.0, v: 0.45 },
  { s: "whoosh", t: 47.22, v: 0.45 },
  { s: "whoosh", t: 56.34, v: 0.4 },
  { s: "whoosh", t: 61.62, v: 0.45 },
  { s: "carimbo", t: 65.85, v: 0.5 },
  { s: "whoosh", t: 67.13, v: 0.45 },
  { s: "whoosh", t: 74.34, v: 0.45 },
  { s: "whoosh", t: INICIO_FINAL - 0.1, v: 0.45 },
];

const DUCK: number[] = (() => {
  const bruto = Array.from({ length: DURACAO_FASE12 }, (_, i) => (falando(i / FPS) ? 0.42 : 1));
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

export const VideoFase12: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const corte = PLANOS.some((p) => p.de > 0 && t >= p.de && t < p.de + 2 / FPS) && !emSetup(t) ? 0.2 : 0;
  const flash = Math.min(0.8, IMPACTOS.reduce((m, a) => m + interpolate(t, [a, a + 0.04, a + 0.28], [0, a === 0 ? 0.35 : 0.45, 0], cl), 0));
  const tremor = IMPACTOS.reduce((m, a) => (t >= a ? Math.max(m, 1 - suave(t, a, a + 0.35)) : m), 0);
  const tx = Math.sin(t * 83) * 10 * tremor;
  const ty = Math.cos(t * 71) * 8 * tremor;
  const noFundo = !emSetup(t);
  const escurece = t > 33.85 && t < 67.1 ? 0.22 : t > 67.1 && t < INICIO_FINAL ? 0.15 : 0;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ transform: `translate(${tx}px,${ty}px) scale(1.02)` }}>
        {noFundo && <Fundo t={t} />}
        {noFundo && <AbsoluteFill style={{ background: `rgba(8,4,20,${escurece})` }} />}
        {noFundo && <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,4,24,.5) 0%, rgba(10,4,24,.08) 22%, rgba(10,4,24,0) 50%, rgba(10,4,24,.12) 72%, rgba(10,4,24,.55) 100%)" }} />}
      </AbsoluteFill>
      <Setup t={t} f={f} />

      <Gancho t={t} />
      <Bloco t={t} de={5.1} ate={10.3}>
        <P>SE VOCÊ ERROU…</P>
        <G tam={110} cor={AMARELO}>CULPA DA</G>
        <G tam={110} cor={AMARELO}>ROCKSTAR</G>
        <Selo texto="QUIZ: 3 RODADAS" cor={ROSA} t={t} de={7.96} />
        <div>
          <Selo texto="COMENTA QUANTAS ACERTOU" cor={AMARELO} t={t} de={8.71} />
        </div>
      </Bloco>
      <Rodada t={t} de={10.38} ate={17.0} n={1} foto={CAL} conta={[11.11, 11.76, 12.35]} revela={13.15} nome="CAL HAMPTON" deNome={14.42} pos="50% 20%" />
      <Rodada t={t} de={17.04} ate={23.4} n={2} foto={NPC} conta={[18.04, 18.69, 19.4]} revela={20.02} npc nome="FORA DA LISTA: GENTE DA RUA" deNome={20.89} pos="30% 30%" />
      <Rodada t={t} de={23.45} ate={29.1} n={3} foto={DIMEZ} conta={[24.76, 25.53, 26.24]} revela={26.89} nome="REAL DIMEZ" deNome={28.11} pos="50% 20%" />
      {/* re-gancho */}
      <Bloco t={t} de={29.2} ate={33.8} gancho>
        <P>POR QUE TÁ</P>
        <G tam={140} cor={AMARELO}>TÃO DIFÍCIL?</G>
        <div style={{ opacity: entra(t, 31.44) }}>
          <P cor={VERDE}>A ROCKSTAR CAPRICHOU NO NPC</P>
        </div>
      </Bloco>
      <Motivo t={t} de={33.85} ate={47.15} n="1" titulo="ALTURA E CORPO" cor={AZUL} />
      <Corpo t={t} />
      <Motivo t={t} de={47.24} ate={61.6} n="2" titulo="O QUE ELES FALAM" cor={AMARELO} />
      <Fala t={t} />
      <Ouvir t={t} />
      <Motivo t={t} de={61.64} ate={67.1} n="3" titulo="ENCARAR" cor={ROSA} />
      <Encarar t={t} />
      <Motivo t={t} de={67.15} ate={74.3} n="4" titulo="O PERIGO" cor={VERMELHO} />
      <Perigo t={t} />
      <Motivo t={t} de={74.36} ate={INICIO_FINAL - 0.05} n="5" titulo="SEM GÍRIA DA MODA" cor={VERDE} />
      <Giria t={t} />

      <Facecam t={t} f={f} />
      <Legenda t={t} />

      <AbsoluteFill style={{ background: "#F5E9FF", opacity: flash, pointerEvents: "none" }} />
      <AbsoluteFill style={{ background: "#000", opacity: corte, pointerEvents: "none" }} />

      <Audio src={staticFile("fase-extra/fase12/narracao.wav")} />
      <Audio src={staticFile("fase-extra/fase12/trilha.wav")} volume={(q) => 0.63 * (DUCK[q] ?? 1)} />
      {SONS.map((s, i) => (
        <Sequence key={i} from={Math.round(s.t * FPS)} durationInFrames={60}>
          <Audio src={staticFile(`fase-extra/sons/${s.s}.wav`)} volume={(q) => s.v * (falando(s.t + q / FPS) ? 0.3 : 1)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
