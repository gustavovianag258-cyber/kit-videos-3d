import { loadFont } from "@remotion/google-fonts/Montserrat";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { Acabamento, PalcoCinema } from "../../cinema/Palco";
import { Camera } from "../Estudio";
import { Mascote3D, PoseMascote } from "../Mascote3D";
import { QuartoGamer } from "../QuartoGamer";
import dados from "./dados.json";

// Fase Extra, Fase 10: "A Rockstar transformou Miami em Vice City" (~59 s).
// Gancho: o gameplay do GTA 6 que passou no South Park (saco de cocô). Depois, a campanha em Miami: letreiro de
// US$ 975 mil no ginásio do Miami Heat, Burger Shot e Cluckin' Bell reais, carros com placa de Vice City, rótulos de
// cerveja registrados e o acordo de US$ 3,9 mi com Miami-Dade (com o "não" do xerife e de Miami Beach).
// Imagens de terceiros (fotos e vídeos de Miami, trecho do South Park): liberadas pelo usuário neste vídeo.
const { fontFamily } = loadFont("normal", { weights: ["600", "800", "900"], subsets: ["latin"] });
export const FPS = 30;
const FIM = dados.duracao + 1.0;
export const DURACAO_FASE10 = Math.ceil(FIM * FPS);
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

const INICIO_FINAL = 52.56; // "Você está na Fase Extra"
const emSetup = (t: number) => t >= INICIO_FINAL;
const CLIPE = (n: string) => `fase-extra/fase10/clipes/${n}.mp4`;
const FOTO = (n: string) => `fase-extra/fase10/fotos/${n}`;

// ---------- planos: vídeo vertical, foto em tela cheia ("cheia") ou foto deitada sobre fundo desfocado ("caixa") ----------
type Plano = { de: number; clipe?: string; foto?: string; caixa?: boolean; src?: number; x?: number; x2?: number; zoom?: number; chicote?: boolean };
const PLANOS: Plano[] = [
  // gancho: South Park
  { de: 0.0, foto: "southpark.png", caixa: true, zoom: 1.05 },
  { de: 1.6, clipe: "southpark", src: 1.0, x: 0.5, x2: 0.45, chicote: true },
  { de: 4.18, clipe: "southpark", src: 6.0, x: 0.45, x2: 0.55, zoom: 1.1, chicote: true },
  // nem é o mais louco / Miami virando Vice City
  { de: 6.8, clipe: "dirigivel", src: 2.5, x: 0.5, x2: 0.45, chicote: true },
  { de: 8.42, clipe: "dirigivel", src: 6.0, x: 0.45, x2: 0.55, zoom: 1.12 },
  { de: 10.0, clipe: "letreiro", src: 3.0, x: 0.5, x2: 0.42, chicote: true },
  { de: 11.75, clipe: "dirigivel", src: 9.5, x: 0.5, x2: 0.5, zoom: 1.15 },
  // ginásio do Miami Heat + letreiro
  { de: 13.35, clipe: "dirigivel", src: 12.3, x: 0.5, x2: 0.45, chicote: true },
  { de: 14.93, foto: "letreiro1.jpg", caixa: true, x: 0.35, x2: 0.65 },
  { de: 16.22, foto: "burger3.jpg", x: 0.5, x2: 0.5, zoom: 1.05, chicote: true },
  { de: 17.8, foto: "letreiro1.jpg", caixa: true, x: 0.7, x2: 0.4, zoom: 1.2 },
  // Burger Shot e Cluckin' Bell
  { de: 20.56, foto: "burger1.jpg", x: 0.45, x2: 0.55, chicote: true },
  { de: 22.04, foto: "cluckin1.jpg", x: 0.5, x2: 0.42, zoom: 1.1, chicote: true },
  { de: 23.56, clipe: "burger", src: 1.0, x: 0.5, x2: 0.45, chicote: true },
  { de: 25.5, clipe: "burger", src: 18.0, x: 0.5, x2: 0.55, zoom: 1.1 },
  // carros
  { de: 27.24, clipe: "carros", src: 2.0, x: 0.5, x2: 0.45, chicote: true },
  { de: 29.4, clipe: "carros", src: 11.4, x: 0.5, x2: 0.55, zoom: 1.08 },
  { de: 30.85, foto: "carro2.jpg", x: 0.45, x2: 0.55, zoom: 1.1 },
  // cervejas
  { de: 32.31, foto: "cerveja1full.png", caixa: true, x: 0.3, x2: 0.6, chicote: true },
  { de: 34.6, foto: "cerveja4.png", caixa: true, zoom: 1.0, chicote: true },
  { de: 35.5, foto: "cerveja2.png", caixa: true, zoom: 1.0, chicote: true },
  // re-gancho
  { de: 37.42, clipe: "dirigivel", src: 15.0, x: 0.5, x2: 0.45, chicote: true, zoom: 1.1 },
  // Miami-Dade
  { de: 39.64, clipe: "dirigivel", src: 18.5, x: 0.45, x2: 0.55, chicote: true },
  { de: 43.3, clipe: "dirigivel", src: 21.5, x: 0.5, x2: 0.45, zoom: 1.15 },
  // xerife e Miami Beach
  { de: 47.24, foto: "carro2.jpg", x: 0.55, x2: 0.45, zoom: 1.2, chicote: true },
  { de: 50.42, clipe: "dirigivel", src: 0.3, x: 0.5, x2: 0.42, chicote: true },
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
        {p.clipe && <OffthreadVideo src={staticFile(CLIPE(p.clipe))} startFrom={Math.round((p.src ?? 0) * FPS)} muted style={{ ...cheia, filter: "contrast(1.05) saturate(1.15)" }} />}
        {p.foto && !p.caixa && <Img src={staticFile(FOTO(p.foto))} style={{ ...cheia, filter: "contrast(1.05) saturate(1.15)" }} />}
        {p.foto && p.caixa && (
          <>
            <Img src={staticFile(FOTO(p.foto))} style={{ ...cheia, filter: "blur(40px) brightness(.55) saturate(1.3)", transform: `scale(${1.3 * z})` }} />
            <div style={{ position: "absolute", left: 0, right: 0, top: 380, height: 760, overflow: "hidden" }}>
              <Img src={staticFile(FOTO(p.foto))} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", transform: `scale(${z})`, transformOrigin: `${x * 100}% 50%`, filter: "contrast(1.05) saturate(1.15)" }} />
            </div>
          </>
        )}
      </AbsoluteFill>
    </Sequence>
  );
};

// ---------- cartões ----------
const Cartao: React.FC<{ t: number; de: number; ate: number; topo?: number; cor: string; children: React.ReactNode }> = ({ t, de, ate, topo = 300, cor, children }) => {
  if (t < de || t > ate) return null;
  const k = entra(t, de, 0.35);
  const sai = suave(t, ate - 0.2, ate);
  return (
    <div style={{ position: "absolute", top: topo, left: 60, right: 180, padding: "22px 20px", borderRadius: 28, background: "rgba(14,8,30,.86)", border: `4px solid ${cor}`, boxShadow: `0 0 34px ${cor}88`, textAlign: "center", fontFamily, color: "#fff", opacity: k * (1 - sai), transform: `scale(${0.7 + 0.3 * k})` }}>
      {children}
    </div>
  );
};
const Chip: React.FC<{ t: number; de: number; cor: string; children: React.ReactNode; tam?: number }> = ({ t, de, cor, children, tam = 46 }) => {
  const q = entra(t, de, 0.25);
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 12, margin: "8px 6px 0", fontWeight: 900, fontSize: tam, color: "#fff", background: "rgba(20,10,40,.85)", border: `4px solid ${cor}`, borderRadius: 18, padding: "4px 20px", boxShadow: `0 0 20px ${cor}`, opacity: q, transform: `scale(${0.5 + 0.5 * q})`, whiteSpace: "nowrap" }}>
      {children}
    </div>
  );
};
// número que sobe até o valor
const Conta: React.FC<{ t: number; de: number; dur: number; ate: number; casas?: number; pre?: string; pos?: string; cor: string; tam: number }> = ({ t, de, dur, ate, casas = 0, pre = "", pos = "", cor, tam }) => {
  const v = interpolate(t, [de, de + dur], [0, ate], { ...cl, easing: Easing.out(Easing.cubic) });
  const q = entra(t, de, 0.25);
  return <div style={{ fontWeight: 900, fontSize: tam, lineHeight: 1, letterSpacing: -2, color: cor, textShadow: sombra, opacity: q, transform: `scale(${0.6 + 0.4 * q})`, whiteSpace: "nowrap" }}>{pre}{v.toFixed(casas).replace(".", ",")}{pos}</div>;
};

// carimbo
const Carimbo: React.FC<{ t: number; de: number; ate: number; texto: string; cor: string; topo?: number }> = ({ t, de, ate, texto, cor, topo = 1010 }) => {
  if (t < de || t > ate) return null;
  const k = interpolate(t, [de, de + 0.12], [0, 1], cl);
  const sai = suave(t, ate - 0.15, ate);
  return (
    <div style={{ position: "absolute", top: topo, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: 1 - sai }}>
      <div style={{ fontFamily, fontWeight: 900, fontSize: 92, color: cor, border: `10px solid ${cor}`, borderRadius: 18, padding: "4px 26px", transform: `rotate(-8deg) scale(${2.4 - 1.4 * k})`, opacity: k, background: "rgba(20,0,4,.55)", whiteSpace: "nowrap" }}>
        {texto}
      </div>
    </div>
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
const REACOES = [6.9, 11.8, 37.5];
const JANELAS: [number, number][] = [
  [6.8, 13.3], // nem é o mais louco / Miami virando Vice City / nem todo mundo gostou
  [37.42, 39.6], // re-gancho
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
const ENQUETE = 55.31;
const OPCOES: [string, string, number, string][] = [
  ["🌴", "RIO", 55.84, VERDE],
  ["🏙️", "SÃO PAULO", 56.3, AMARELO],
  ["☀️", "SALVADOR", 56.8, LARANJA],
  ["👇", "OUTRA?", 57.44, ROSA],
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
      {/* enquete */}
      <div style={{ position: "absolute", top: 230, left: 60, right: 180, textAlign: "center", fontFamily, opacity: troca }}>
        <div style={{ fontWeight: 800, fontSize: 34, letterSpacing: 5, color: "#E6D2FF", textShadow: sombra }}>QUAL CIDADE DO BRASIL</div>
        <div style={{ fontWeight: 900, fontSize: 84, lineHeight: 0.95, color: "#fff", textShadow: sombra }}>VIRAVA GTA?</div>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", marginTop: 14 }}>
          {OPCOES.map(([ic, nome, d, cor], i) => (
            <Chip key={i} t={t} de={d} cor={cor} tam={42}>
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

// ---------- textos ----------
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
const P: React.FC<{ children: React.ReactNode; cor?: string }> = ({ children, cor = "#F3E8FF" }) => <div style={{ fontWeight: 800, fontSize: 38, letterSpacing: 5, color: cor, textShadow: sombra, marginTop: 6 }}>{children}</div>;

// ---------- legenda ----------
const DESTAQUE = /^(GTA|6|South|Park|Jason|cocô|louco|Rockstar|Miami|Vice|City|gostou|Heat|letreiro|gigante|milhão|dólares|Burger|Shot|Cluckin'|Bell|jogo|Flórida|placa|Lamborghini|polícia|Beach|cervejaria|rótulos|Pißwasser|Patriot|cervejas|sabe|Miami-Dade|acordo|três|vírgula|nove|milhões|aeroporto|transporte|xerife|recusou|violência|não|Fase|Extra|Vyce|Brasil|Comenta)$/i;
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
    <div style={{ position: "absolute", top: 1240, left: 60, right: 180, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 18px" }}>
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
const IMPACTOS = [0, 5.2, 13.35, 18.87, 37.42, 42.02, 47.82, 51.71];
const SONS: { s: string; t: number; v: number }[] = [
  { s: "dum", t: 0.0, v: 0.6 },
  { s: "whoosh", t: 1.58, v: 0.4 },
  { s: "carimbo", t: 5.2, v: 0.55 },
  { s: "whoosh", t: 6.78, v: 0.45 },
  { s: "whoosh", t: 10.0, v: 0.4 },
  { s: "dum", t: 13.35, v: 0.55 },
  { s: "dum", t: 18.87, v: 0.55 },
  { s: "whoosh", t: 20.54, v: 0.45 },
  { s: "whoosh", t: 23.54, v: 0.4 },
  { s: "whoosh", t: 27.22, v: 0.45 },
  { s: "whoosh", t: 32.29, v: 0.45 },
  { s: "dum", t: 37.42, v: 0.6 },
  { s: "whoosh", t: 39.62, v: 0.45 },
  { s: "dum", t: 42.02, v: 0.55 },
  { s: "carimbo", t: 47.82, v: 0.6 },
  { s: "carimbo", t: 51.71, v: 0.6 },
  { s: "whoosh", t: INICIO_FINAL - 0.1, v: 0.45 },
];

const DUCK: number[] = (() => {
  const bruto = Array.from({ length: DURACAO_FASE10 }, (_, i) => (falando(i / FPS) ? 0.42 : 1));
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

export const VideoFase10: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const corte = PLANOS.some((p) => p.de > 0 && t >= p.de && t < p.de + 2 / FPS) && !emSetup(t) ? 0.2 : 0;
  const flash = Math.min(0.8, IMPACTOS.reduce((m, a) => m + interpolate(t, [a, a + 0.04, a + 0.28], [0, a === 0 ? 0.35 : 0.45, 0], cl), 0));
  const tremor = IMPACTOS.reduce((m, a) => (t >= a ? Math.max(m, 1 - suave(t, a, a + 0.35)) : m), 0);
  const tx = Math.sin(t * 83) * 10 * tremor;
  const ty = Math.cos(t * 71) * 8 * tremor;
  const noFundo = !emSetup(t);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ transform: `translate(${tx}px,${ty}px) scale(1.02)` }}>
        {noFundo && <Fundo t={t} />}
        {noFundo && <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,4,24,.5) 0%, rgba(10,4,24,.08) 22%, rgba(10,4,24,0) 50%, rgba(10,4,24,.12) 72%, rgba(10,4,24,.55) 100%)" }} />}
      </AbsoluteFill>
      <Setup t={t} f={f} />

      {/* gancho: South Park */}
      <Bloco t={t} de={0.1} ate={4.15} gancho topo={250}>
        <P>GAMEPLAY NOVO DO GTA 6</P>
        <G tam={130} cor={AMARELO}>NO SOUTH PARK?!</G>
      </Bloco>
      <Bloco t={t} de={4.2} ate={6.75} topo={250}>
        <P>O JASON BATE COM UM</P>
        <G tam={130}>SACO DE COCÔ 💩</G>
      </Bloco>
      {/* nem é o mais louco */}
      <Bloco t={t} de={6.82} ate={8.38} gancho>
        <P>E ISSO NEM É</P>
        <G tam={130} cor={AMARELO}>O MAIS LOUCO</G>
      </Bloco>
      <Bloco t={t} de={8.45} ate={11.7}>
        <P>A ROCKSTAR TÁ TRANSFORMANDO</P>
        <G tam={130}>MIAMI</G>
        <div style={{ opacity: entra(t, 10.4) }}>
          <G tam={130} cor={ROSA}>➜ VICE CITY</G>
        </div>
      </Bloco>
      <Bloco t={t} de={11.78} ate={13.3} gancho>
        <G tam={120} cor={VERMELHO}>NEM TODO MUNDO</G>
        <G tam={120} cor={VERMELHO}>GOSTOU</G>
        <Selo texto="FICA ATÉ O FINAL" cor={AMARELO} t={t} de={12.1} />
      </Bloco>
      {/* ginásio do Miami Heat + letreiro */}
      <Bloco t={t} de={13.4} ate={17.75} topo={250}>
        <P>GINÁSIO DO MIAMI HEAT</P>
        <div style={{ opacity: entra(t, 14.93) }}>
          <G tam={120} cor={ROSA}>LETREIRO GIGANTE</G>
        </div>
      </Bloco>
      <Cartao t={t} de={17.85} ate={20.5} topo={1010 - 560} cor={AMARELO}>
        <P>SÓ O LETREIRO CUSTOU</P>
        <Conta t={t} de={18.6} dur={1.0} ate={975} pre="US$ " pos=" MIL" cor={AMARELO} tam={104} />
        <Selo texto="QUASE 1 MILHÃO DE DÓLARES" cor={ROSA} t={t} de={19.6} />
      </Cartao>
      {/* Burger Shot e Cluckin' Bell */}
      <Cartao t={t} de={20.6} ate={23.5} topo={260} cor={ROSA}>
        <P>DO JOGO</P>
        <G tam={110}>➜ PRA VIDA REAL</G>
        <div>
          <Chip t={t} de={21.31} cor={VERMELHO}>🍔 BURGER SHOT</Chip>
          <Chip t={t} de={22.04} cor={AMARELO}>🐔 CLUCKIN' BELL</Chip>
        </div>
      </Cartao>
      <Bloco t={t} de={23.6} ate={27.2} topo={250}>
        <P>REDE DE LANCHONETE DA FLÓRIDA</P>
        <div style={{ opacity: entra(t, 26.04) }}>
          <G tam={120} cor={VERMELHO}>VIROU BURGER SHOT</G>
        </div>
        <Selo texto="13/11 ATÉ 31/12" cor={AMARELO} t={t} de={26.5} />
      </Bloco>
      {/* carros */}
      <Bloco t={t} de={27.28} ate={29.55} topo={250}>
        <P>NA RUA</P>
        <G tam={120} cor={ROSA}>PLACA DE VICE CITY</G>
      </Bloco>
      <Bloco t={t} de={29.6} ate={32.25} topo={250}>
        <G tam={130} cor={AMARELO}>LAMBORGHINI</G>
        <div style={{ opacity: entra(t, 30.85) }}>
          <P>DA POLÍCIA DE VICE BEACH 🚨</P>
        </div>
      </Bloco>
      {/* cervejas */}
      <Bloco t={t} de={32.35} ate={37.35} topo={190}>
        <P>CERVEJARIA PERTO DE MIAMI</P>
        <div style={{ opacity: entra(t, 33.75) }}>
          <G tam={110} cor={AMARELO}>RÓTULOS REGISTRADOS</G>
        </div>
      </Bloco>
      <Bloco t={t} de={34.8} ate={37.35} topo={1150 - 60}>
        <Chip t={t} de={34.84} cor={AMARELO}>🍺 PIßWASSER</Chip>
        <Chip t={t} de={35.62} cor={AZUL}>🦅 PATRIOT</Chip>
      </Bloco>
      {/* re-gancho */}
      <Bloco t={t} de={37.45} ate={39.6} gancho>
        <P>AGORA, A PARTE QUE</P>
        <G tam={120} cor={AMARELO}>POUCA GENTE SABE</G>
      </Bloco>
      {/* Miami-Dade */}
      <Cartao t={t} de={39.7} ate={47.2} topo={300} cor={VERDE}>
        <P>O CONDADO DE MIAMI-DADE</P>
        <div style={{ opacity: entra(t, 41.56) }}>
          <P cor={VERDE}>FECHOU ACORDO DE</P>
        </div>
        <Conta t={t} de={42.02} dur={1.2} ate={3.9} casas={1} pre="US$ " pos=" MI" cor={VERDE} tam={120} />
        <div>
          <Chip t={t} de={45.42} cor={AZUL}>✈️ AEROPORTO</Chip>
          <Chip t={t} de={46.13} cor={AMARELO}>🚇 TRANSPORTE</Chip>
        </div>
      </Cartao>
      {/* xerife e Miami Beach */}
      <Carimbo t={t} de={47.82} ate={50.4} texto="XERIFE: NÃO" cor={VERMELHO} topo={420} />
      <Bloco t={t} de={48.89} ate={50.4} topo={640}>
        <P>VIOLÊNCIA CONTRA</P>
        <G tam={110}>POLICIAL NO JOGO</G>
      </Bloco>
      <Carimbo t={t} de={51.71} ate={INICIO_FINAL - 0.05} texto="MIAMI BEACH: NÃO" cor={VERMELHO} topo={560} />

      <Facecam t={t} f={f} />
      <Legenda t={t} />

      <AbsoluteFill style={{ background: "#F5E9FF", opacity: flash, pointerEvents: "none" }} />
      <AbsoluteFill style={{ background: "#000", opacity: corte, pointerEvents: "none" }} />

      <Audio src={staticFile("fase-extra/fase10/narracao.wav")} />
      {/* música do trailer de lançamento (a preferida dele), no nível das Fases 05 a 09 */}
      <Audio src={staticFile("fase-extra/fase10/trilha.wav")} volume={(q) => 0.63 * (DUCK[q] ?? 1)} />
      {SONS.map((s, i) => (
        <Sequence key={i} from={Math.round(s.t * FPS)} durationInFrames={60}>
          <Audio src={staticFile(`fase-extra/sons/${s.s}.wav`)} volume={(q) => s.v * (falando(s.t + q / FPS) ? 0.3 : 1)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
