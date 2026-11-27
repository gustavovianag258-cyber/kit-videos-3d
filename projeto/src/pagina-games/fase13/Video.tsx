import { loadFont } from "@remotion/google-fonts/Montserrat";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { Acabamento, PalcoCinema } from "../../cinema/Palco";
import { Camera } from "../Estudio";
import { Mascote3D, PoseMascote } from "../Mascote3D";
import { QuartoGamer } from "../QuartoGamer";
import dados from "./dados.json";

// Fase Extra, Fase 13: "A 'loja de sapatos' do GTA 6 tem dono" (~85 s).
// Por que "sapato" (ícone de salto alto no mapa do GTA 5), 20 anos de clube em todo GTA, o Jack of Hearts do Boobie Ike,
// a Only Raw Records com o Dre'Quan e o álbum oficial do GTA 6. Nada de vazamento e nenhuma dançarina na tela:
// só o letreiro, o Boobie, o Dre'Quan e a boate oficial do "Um Olhar Estendido".
const { fontFamily } = loadFont("normal", { weights: ["600", "800", "900"], subsets: ["latin"] });
export const FPS = 30;
const FIM = dados.duracao + 1.0;
export const DURACAO_FASE13 = Math.ceil(FIM * FPS);
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

const INICIO_FINAL = 76.38; // "Você está na Fase Extra"
const ENQUETE = 79.44;
const emSetup = (t: number) => t >= INICIO_FINAL;
const CLIPE = (n: string) => `fase-extra/fase13/clipes/${n}.mp4`;
const FOTO = (n: string) => `fase-extra/fase13/fotos/${n}.jpg`;
const LETREIRO = FOTO("boobie-letreiro");
const ESCRITORIO = FOTO("boobie-escritorio");
const ROSTO = FOTO("boobie-rosto");
const ESTUDIO = FOTO("drequan-estudio");
const DQ_BOATE = FOTO("drequan-boate");

// ---------- planos: vídeo (clipe) ou foto desfocada de fundo ----------
type Plano = { de: number; clipe?: string; foto?: string; src?: number; x?: number; x2?: number; zoom?: number; chicote?: boolean };
const PLANOS: Plano[] = [
  { de: 0.0, foto: LETREIRO, zoom: 1.2 },
  { de: 6.13, clipe: "cidade", src: 0, x: 0.5, x2: 0.42, chicote: true },
  { de: 9.47, clipe: "entrada", src: 0.5, x: 0.45, x2: 0.55, zoom: 1.1 },
  { de: 12.38, clipe: "porta", src: 0, x: 0.5, x2: 0.45, chicote: true },
  // linha do tempo
  { de: 15.55, clipe: "cidade", src: 2.5, x: 0.55, x2: 0.45, chicote: true },
  { de: 19.78, clipe: "entrada", src: 3.0, x: 0.45, x2: 0.55, zoom: 1.12 },
  { de: 23.87, clipe: "porta", src: 2.5, x: 0.5, x2: 0.42, chicote: true },
  { de: 27.58, clipe: "cidade", src: 0.0, x: 0.45, x2: 0.55, zoom: 1.15 },
  // GTA 6: o clube e o dono
  { de: 32.89, foto: LETREIRO, chicote: true },
  { de: 40.16, foto: ROSTO, chicote: true },
  { de: 45.82, foto: ESTUDIO, chicote: true },
  { de: 53.0, foto: DQ_BOATE, chicote: true },
  // álbum
  { de: 59.62, clipe: "entrada", src: 4.0, x: 0.5, x2: 0.45, chicote: true },
  { de: 63.53, clipe: "porta", src: 0.0, x: 0.45, x2: 0.55, zoom: 1.1 },
  { de: 67.0, clipe: "cidade", src: 1.0, x: 0.5, x2: 0.45, chicote: true },
  // e não é a única
  { de: 71.84, clipe: "entrada", src: 0.0, x: 0.5, x2: 0.45, chicote: true, zoom: 1.12 },
  { de: 74.2, clipe: "porta", src: 2.0, x: 0.45, x2: 0.55, zoom: 1.1 },
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

// ---------- gancho: o letreiro + o salto alto ----------
const Gancho: React.FC<{ t: number }> = ({ t }) => (
  <Janela t={t} de={0} ate={6.1}>
    <Quadro t={t} de={0} ate={6.1} foto={LETREIRO} pos="62% 0%" h={600} cor={ROSA} zoom={1.0} />
    <div style={{ marginTop: 18 }}>
      <Chip t={t} de={1.98} cor={ROSA} tam={52}>👠 LOJA DE SAPATOS</Chip>
    </div>
    <div style={{ marginTop: 10, opacity: entra(t, 4.07), transform: `scale(${0.6 + 0.4 * entra(t, 4.07)})` }}>
      <G tam={120} cor={AMARELO}>TEM DONO</G>
    </div>
  </Janela>
);

// por que "sapato": pino de mapa com o salto alto
const PorQue: React.FC<{ t: number }> = ({ t }) => {
  const pino = entra(t, 9.96, 0.35);
  const bate = 1 + 0.12 * Math.max(0, Math.sin((t - 9.96) * 8)) * (t < 11.5 ? 1 : 0);
  return (
    <Bloco t={t} de={6.13} ate={12.3} topo={640}>
      <G tam={130} cor={AMARELO}>POR QUE</G>
      <G tam={130} cor={AMARELO}>SAPATO?</G>
      <div style={{ marginTop: 26, display: "flex", justifyContent: "center", alignItems: "center", gap: 20 }}>
        <div style={{ opacity: entra(t, 7.47), fontWeight: 900, fontSize: 34, color: "#fff", background: "rgba(20,10,40,.85)", border: `4px solid ${AZUL}`, borderRadius: 16, padding: "6px 16px" }}>🗺️ MAPA DO GTA 5</div>
        <div style={{ width: 120, height: 120, borderRadius: "50% 50% 50% 0", transform: `rotate(-45deg) scale(${pino * bate})`, background: ROSA, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 30px ${ROSA}` }}>
          <span style={{ transform: "rotate(45deg)", fontSize: 64 }}>👠</span>
        </div>
      </div>
      <div style={{ opacity: entra(t, 11.11) }}>
        <Selo texto="= LOJA DE SAPATOS" cor={ROSA} t={t} de={11.11} />
      </div>
    </Bloco>
  );
};

// ---------- 20 anos: linha do tempo ----------
const MARCOS: { ano: string; jogo: string; nota: string; de: number; deNota: number; cor: string }[] = [
  { ano: "2001", jogo: "GTA III", nota: "AS PRIMEIRAS MISSÕES", de: 16.22, deNota: 18.25, cor: AZUL },
  { ano: "2002", jogo: "VICE CITY", nota: "O TOMMY COMPRA O DELE", de: 19.78, deNota: 21.15, cor: ROSA },
  { ano: "2004", jogo: "SAN ANDREAS", nota: "PIG PEN", de: 22.11, deNota: 23.04, cor: LARANJA },
  { ano: "2013", jogo: "GTA V", nota: "ESCONDERIJO DO TREVOR", de: 23.87, deNota: 25.95, cor: VERDE },
];
const Linha: React.FC<{ t: number }> = ({ t }) => {
  const de = 15.6;
  const ate = 32.85;
  const seis = entra(t, 29.31, 0.35);
  const sobe = suave(t, 31.36, 32.0);
  return (
    <Janela t={t} de={de} ate={ate} topo={250}>
      <div style={{ fontWeight: 900, fontSize: 40, letterSpacing: 6, color: AMARELO, textShadow: sombra }}>TODO GTA TEM UMA</div>
      <div style={{ position: "relative", margin: "18px auto 0", width: 760, textAlign: "left" }}>
        <div style={{ position: "absolute", left: 38, top: 20, bottom: 20, width: 6, borderRadius: 3, background: "rgba(255,255,255,.35)" }} />
        {MARCOS.map((m) => {
          const q = entra(t, m.de, 0.3);
          return (
            <div key={m.ano} style={{ position: "relative", display: "flex", alignItems: "center", gap: 22, height: 128, opacity: q, transform: `translateX(${(1 - q) * -120}px)` }}>
              <div style={{ width: 82, height: 82, borderRadius: "50%", background: m.cor, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, boxShadow: `0 0 24px ${m.cor}` }}>👠</div>
              <div>
                <div style={{ fontWeight: 900, fontSize: 52, color: "#fff", textShadow: sombra, whiteSpace: "nowrap" }}>
                  <span style={{ color: m.cor }}>{m.ano}</span> · {m.jogo}
                </div>
                <div style={{ display: "inline-block", marginTop: 4, opacity: entra(t, m.deNota), fontWeight: 900, fontSize: 30, color: "#111", background: m.cor, borderRadius: 10, padding: "2px 12px", whiteSpace: "nowrap" }}>{m.nota}</div>
              </div>
            </div>
          );
        })}
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 22, height: 128, opacity: seis, transform: `scale(${0.6 + 0.4 * seis})`, transformOrigin: "0% 50%" }}>
          <div style={{ width: 82, height: 82, borderRadius: "50%", background: AMARELO, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44, fontWeight: 900, color: "#111", boxShadow: `0 0 34px ${AMARELO}` }}>?</div>
          <div style={{ fontWeight: 900, fontSize: 60, color: AMARELO, textShadow: sombra, whiteSpace: "nowrap" }}>2026 · GTA 6</div>
        </div>
      </div>
      <div style={{ marginTop: 8, display: "flex", justifyContent: "center", gap: 16, alignItems: "center" }}>
        <Chip t={t} de={28.13} cor={AMARELO} tam={44}>+20 ANOS</Chip>
        <div style={{ opacity: sobe, fontWeight: 900, fontSize: 34, color: VERDE, textShadow: sombra, transform: `translateY(${(1 - sobe) * 30}px)`, whiteSpace: "nowrap" }}>📈 CADA VEZ MAIS NA HISTÓRIA</div>
      </div>
    </Janela>
  );
};

// ---------- GTA 6: o clube, o dono, o sócio ----------
const Placa: React.FC<{ t: number; de: number; texto: string; cor: string; tam?: number }> = ({ t, de, texto, cor, tam = 50 }) => (
  <div style={{ marginTop: 14, opacity: entra(t, de), transform: `scale(${0.6 + 0.4 * entra(t, de)})` }}>
    <div style={{ display: "inline-block", fontWeight: 900, fontSize: tam, color: "#fff", background: "rgba(20,10,40,.88)", border: `4px solid ${cor}`, borderRadius: 18, padding: "4px 24px", whiteSpace: "nowrap", boxShadow: `0 0 22px ${cor}` }}>{texto}</div>
  </div>
);
const Clube: React.FC<{ t: number }> = ({ t }) => (
  <Janela t={t} de={32.89} ate={40.1}>
    <div style={{ fontWeight: 900, fontSize: 40, letterSpacing: 6, color: AMARELO, textShadow: sombra }}>NO GTA 6</div>
    <div style={{ marginTop: 12 }}>
      <Quadro t={t} de={32.89} ate={40.1} foto={LETREIRO} pos={t < 37.5 ? "70% 0%" : "30% 30%"} h={620} cor={ROSA} zoom={t < 37.5 ? 1.25 : 1.1} />
    </div>
    <Placa t={t} de={34.18} texto="🃏 JACK OF HEARTS" cor={ROSA} tam={58} />
    <Placa t={t} de={35.73} texto="📍 CROSSTOWN · VICE CITY" cor={AZUL} tam={40} />
    {t > 37.4 && <Placa t={t} de={39.09} texto="O DONO: BOOBIE IKE" cor={AMARELO} tam={50} />}
  </Janela>
);
const Boobie: React.FC<{ t: number }> = ({ t }) => (
  <Janela t={t} de={40.16} ate={45.8}>
    <Selo texto="SEGUNDO A ROCKSTAR" cor={AMARELO} t={t} de={40.25} />
    <div style={{ marginTop: 12 }}>
      <Quadro t={t} de={40.16} ate={45.8} foto={ESCRITORIO} pos="22% 30%" h={560} cor={AMARELO} zoom={1.15} />
    </div>
    <div style={{ opacity: entra(t, 41.55) }}>
      <G tam={90}>LENDA DE VICE CITY</G>
    </div>
    <div>
      <Chip t={t} de={43.04} cor={AZUL}>🏢 IMÓVEIS</Chip>
      <Chip t={t} de={43.84} cor={ROSA}>🃏 CLUBE</Chip>
      <Chip t={t} de={44.6} cor={VERDE}>🎙️ ESTÚDIO</Chip>
    </div>
  </Janela>
);
const Socio: React.FC<{ t: number }> = ({ t }) => {
  const hit = suave(t, 52.2, 52.45);
  return (
    <Janela t={t} de={45.82} ate={52.95}>
      <div style={{ fontWeight: 900, fontSize: 40, letterSpacing: 6, color: AMARELO, textShadow: sombra }}>O SÓCIO</div>
      <div style={{ marginTop: 12 }}>
        <Quadro t={t} de={45.82} ate={52.95} foto={ESTUDIO} pos="40% 20%" h={560} cor={VERDE} zoom={1.12} />
      </div>
      <Placa t={t} de={47.15} texto="DRE'QUAN PRIEST" cor={VERDE} tam={54} />
      <Placa t={t} de={49.44} texto="💿 ONLY RAW RECORDS" cor={ROXO} tam={46} />
      <div style={{ marginTop: 14, opacity: entra(t, 51.02), transform: `scale(${(0.6 + 0.4 * entra(t, 51.02)) * (1 + 0.15 * hit * Math.max(0, Math.sin((t - 52.2) * 10)))})` }}>
        <div style={{ display: "inline-block", fontWeight: 900, fontSize: 50, color: "#111", background: AMARELO, borderRadius: 16, padding: "4px 22px", whiteSpace: "nowrap" }}>
          SÓ FALTA: {hit > 0.5 ? "UM HIT 🔥" : "…"}
        </div>
      </div>
    </Janela>
  );
};
// clube → gravadora: o Dre'Quan testa a música no clube
const Onda: React.FC<{ t: number; ativo: number }> = ({ t, ativo }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, height: 120 }}>
    {Array.from({ length: 16 }, (_, i) => {
      const h = 20 + ativo * 90 * Math.abs(Math.sin(t * 7 + i * 0.9) * Math.cos(t * 3.1 + i * 0.4));
      return <div key={i} style={{ width: 16, height: h, borderRadius: 8, background: i % 2 ? ROSA : ROXO, boxShadow: `0 0 10px ${ROSA}` }} />;
    })}
  </div>
);
const Fluxo: React.FC<{ t: number }> = ({ t }) => {
  const seta = suave(t, 53.75, 54.3);
  const pega = entra(t, 58.53, 0.3);
  const nao = entra(t, 59.18, 0.3);
  const caixa = (txt: string, cor: string, de: number) => (
    <div style={{ opacity: entra(t, de), transform: `scale(${0.6 + 0.4 * entra(t, de)})`, width: 300, padding: "18px 0", borderRadius: 24, background: "rgba(14,8,30,.88)", border: `5px solid ${cor}`, boxShadow: `0 0 24px ${cor}`, fontWeight: 900, fontSize: 40, whiteSpace: "nowrap" }}>{txt}</div>
  );
  return (
    <Janela t={t} de={53.0} ate={59.58} topo={300}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
        {caixa("🃏 CLUBE", ROSA, 53.75)}
        <div style={{ width: 120 * seta, height: 10, background: AMARELO, borderRadius: 5, boxShadow: `0 0 14px ${AMARELO}`, position: "relative" }}>
          {seta > 0.9 && <div style={{ position: "absolute", right: -18, top: -14, borderTop: "19px solid transparent", borderBottom: "19px solid transparent", borderLeft: `26px solid ${AMARELO}` }} />}
        </div>
        {caixa("💿 GRAVADORA", ROXO, 54.0)}
      </div>
      <div style={{ marginTop: 26 }}>
        <Chip t={t} de={55.96} cor={AMARELO} tam={44}>🎤 O DRE'QUAN CUIDA DAS ATRAÇÕES</Chip>
      </div>
      <div style={{ marginTop: 22, padding: "16px 0", borderRadius: 26, background: "rgba(14,8,30,.8)", border: `4px solid ${ROSA}`, opacity: entra(t, 57.69) }}>
        <div style={{ fontWeight: 900, fontSize: 40, color: ROSA }}>🧪 TESTE NA PISTA</div>
        <Onda t={t} ativo={suave(t, 57.69, 58.2)} />
        <div style={{ display: "flex", justifyContent: "center", gap: 20 }}>
          <div style={{ opacity: pega, transform: `scale(${pega})`, fontWeight: 900, fontSize: 44, color: "#111", background: VERDE, borderRadius: 14, padding: "2px 20px" }}>✓ PEGA</div>
          <div style={{ opacity: nao, transform: `scale(${nao})`, fontWeight: 900, fontSize: 44, color: "#fff", background: VERMELHO, borderRadius: 14, padding: "2px 20px" }}>✗ NÃO PEGA</div>
        </div>
      </div>
    </Janela>
  );
};

// ---------- o álbum oficial ----------
const Disco: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: "relative", margin: "0 auto", width: 360, height: 360 }}>
    <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "repeating-radial-gradient(circle, #141018 0 6px, #232031 6px 8px)", transform: `rotate(${t * 140}deg)`, boxShadow: `0 0 50px ${ROSA}88, 0 20px 40px rgba(0,0,0,.6)` }}>
      <div style={{ position: "absolute", left: "50%", top: "50%", width: 170, height: 170, marginLeft: -85, marginTop: -85, borderRadius: "50%", background: `linear-gradient(135deg, ${ROSA}, ${ROXO} 55%, ${LARANJA})`, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        <div style={{ fontWeight: 900, fontSize: 46, color: "#fff", letterSpacing: -1 }}>VI</div>
        <div style={{ fontWeight: 800, fontSize: 15, color: "#fff", letterSpacing: 2 }}>THE ALBUM</div>
      </div>
      <div style={{ position: "absolute", left: "50%", top: "50%", width: 18, height: 18, marginLeft: -9, marginTop: -9, borderRadius: "50%", background: "#0B0810" }} />
    </div>
  </div>
);
const Album: React.FC<{ t: number }> = ({ t }) => (
  <Janela t={t} de={59.62} ate={71.8} topo={250}>
    <div style={{ opacity: entra(t, 59.62) }}>
      <P cor={AMARELO}>PROMETI MÚSICA:</P>
    </div>
    <div style={{ marginTop: 10, opacity: entra(t, 61.71, 0.4), transform: `scale(${0.4 + 0.6 * entra(t, 61.71, 0.4)})` }}>
      <Disco t={t} />
    </div>
    <div style={{ marginTop: 10 }}>
      <Selo texto="ÁLBUM OFICIAL DO GTA 6" cor={ROSA} t={t} de={61.91} />
    </div>
    <div style={{ opacity: entra(t, 63.73) }}>
      <G tam={100} cor="#fff">34 FAIXAS INÉDITAS</G>
    </div>
    <div>
      <Chip t={t} de={65.53} cor={ROSA} tam={36}>TRAVIS SCOTT</Chip>
      <Chip t={t} de={66.4} cor={AZUL} tam={36}>FUTURE</Chip>
      <Chip t={t} de={66.96} cor={LARANJA} tam={36}>METRO BOOMIN</Chip>
    </div>
    <div>
      <Chip t={t} de={68.13} cor={VERDE} tam={34}>🎸 O GUITARRISTA DOS ROLLING STONES</Chip>
    </div>
    <div style={{ marginTop: 6 }}>
      <Chip t={t} de={70.09} cor={AMARELO} tam={46}>📅 19/11 · JUNTO COM O JOGO</Chip>
    </div>
  </Janela>
);
const Balada: React.FC<{ t: number }> = ({ t }) => (
  <Bloco t={t} de={71.84} ate={76.3} topo={560} gancho>
    <P>VICE CITY NÃO TEM</P>
    <G tam={120} cor={AMARELO}>UMA SÓ</G>
    <div>
      <Chip t={t} de={75.22} cor={ROSA} tam={46}>🎉 BOATE CHEIA</Chip>
    </div>
    <Selo texto="IMAGEM OFICIAL DA ROCKSTAR" cor={AMARELO} t={t} de={74.02} />
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
const REACOES = [6.3, 10.8, 72.0];
const JANELAS: [number, number][] = [
  [6.13, 15.5], // por que sapato? / fica até o final
  [71.84, 76.3], // não tem uma balada só
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
  ["👠", "VOU ENTRAR NO DIA 19", 80.07, ROSA],
  ["🙈", "VOU FINGIR QUE NÃO VI", 82.27, AZUL],
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
        <div style={{ fontWeight: 800, fontSize: 34, letterSpacing: 5, color: "#E6D2FF", textShadow: sombra }}>A LOJA DE SAPATOS:</div>
        <div style={{ fontWeight: 900, fontSize: 84, lineHeight: 0.95, color: "#fff", textShadow: sombra }}>VOCÊ…</div>
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
const DESTAQUE = /^(GTA|6|loja|sapatos|sapato\?|dono|história|mapa|salto|alto|música|Luigi|missões|Tommy|comprar|Pig|Pen|Vanilla|Unicorn|esconderijo|Trevor|20|anos|Jack|Hearts|Crosstown|Vice|City|Boobie|Ike|Rockstar|lenda|imóvel|clube|estúdio|Dre'Quan|Priest|gravadora|Only|Raw|Records|hit|atrações|testa|pega|álbum|oficial|34|inéditas|Travis|Scott|Future|Metro|Boomin|Rolling|Stones|19|balada|boate|Fase|Extra|Vyce|primeiro|fingir|Comenta)$/i;
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
const IMPACTOS = [0, 4.07, 9.96, 29.31, 32.89, 39.09, 52.2, 61.71];
const SONS: { s: string; t: number; v: number }[] = [
  { s: "dum", t: 0.0, v: 0.6 },
  { s: "carimbo", t: 4.07, v: 0.5 },
  { s: "whoosh", t: 6.11, v: 0.4 },
  { s: "carimbo", t: 9.96, v: 0.5 },
  { s: "whoosh", t: 12.36, v: 0.4 },
  { s: "whoosh", t: 15.53, v: 0.45 },
  { s: "whoosh", t: 19.76, v: 0.35 },
  { s: "whoosh", t: 23.85, v: 0.35 },
  { s: "carimbo", t: 29.31, v: 0.5 },
  { s: "dum", t: 32.89, v: 0.6 },
  { s: "carimbo", t: 39.09, v: 0.5 },
  { s: "whoosh", t: 40.14, v: 0.45 },
  { s: "whoosh", t: 45.8, v: 0.45 },
  { s: "carimbo", t: 52.2, v: 0.5 },
  { s: "whoosh", t: 52.98, v: 0.45 },
  { s: "whoosh", t: 59.6, v: 0.45 },
  { s: "dum", t: 61.71, v: 0.5 },
  { s: "whoosh", t: 67.0, v: 0.35 },
  { s: "whoosh", t: 71.82, v: 0.45 },
  { s: "whoosh", t: INICIO_FINAL - 0.1, v: 0.45 },
];

const DUCK: number[] = (() => {
  const bruto = Array.from({ length: DURACAO_FASE13 }, (_, i) => (falando(i / FPS) ? 0.42 : 1));
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

export const VideoFase13: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const corte = PLANOS.some((p) => p.de > 0 && t >= p.de && t < p.de + 2 / FPS) && !emSetup(t) ? 0.2 : 0;
  const flash = Math.min(0.8, IMPACTOS.reduce((m, a) => m + interpolate(t, [a, a + 0.04, a + 0.28], [0, a === 0 ? 0.35 : 0.45, 0], cl), 0));
  const tremor = IMPACTOS.reduce((m, a) => (t >= a ? Math.max(m, 1 - suave(t, a, a + 0.35)) : m), 0);
  const tx = Math.sin(t * 83) * 10 * tremor;
  const ty = Math.cos(t * 71) * 8 * tremor;
  const noFundo = !emSetup(t);
  const escurece = t > 15.55 && t < 32.89 ? 0.3 : t > 53 && t < 71.84 ? 0.2 : 0;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ transform: `translate(${tx}px,${ty}px) scale(1.02)` }}>
        {noFundo && <Fundo t={t} />}
        {noFundo && <AbsoluteFill style={{ background: `rgba(8,4,20,${escurece})` }} />}
        {noFundo && <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,4,24,.5) 0%, rgba(10,4,24,.08) 22%, rgba(10,4,24,0) 50%, rgba(10,4,24,.12) 72%, rgba(10,4,24,.55) 100%)" }} />}
      </AbsoluteFill>
      <Setup t={t} f={f} />

      <Gancho t={t} />
      <PorQue t={t} />
      <Bloco t={t} de={12.38} ate={15.5} topo={640}>
        <P>FICA ATÉ O FINAL</P>
        <G tam={120} cor={ROSA}>TEM MÚSICA</G>
        <G tam={120} cor={ROSA}>NESSA HISTÓRIA 🎵</G>
      </Bloco>
      <Linha t={t} />
      <Clube t={t} />
      <Boobie t={t} />
      <Socio t={t} />
      <Fluxo t={t} />
      <Album t={t} />
      <Balada t={t} />

      <Facecam t={t} f={f} />
      <Legenda t={t} />

      <AbsoluteFill style={{ background: "#F5E9FF", opacity: flash, pointerEvents: "none" }} />
      <AbsoluteFill style={{ background: "#000", opacity: corte, pointerEvents: "none" }} />

      <Audio src={staticFile("fase-extra/fase13/narracao.wav")} />
      <Audio src={staticFile("fase-extra/fase13/trilha.wav")} volume={(q) => 0.63 * (DUCK[q] ?? 1)} />
      {SONS.map((s, i) => (
        <Sequence key={i} from={Math.round(s.t * FPS)} durationInFrames={60}>
          <Audio src={staticFile(`fase-extra/sons/${s.s}.wav`)} volume={(q) => s.v * (falando(s.t + q / FPS) ? 0.3 : 1)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
