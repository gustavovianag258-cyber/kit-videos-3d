import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { detalhesBar } from "./detalhes";
import { Cachorro, Cam, Cenario, Estilo, FONTE_FORTE, FONTE_TITULO, MaosPOV, Nevoa, Objeto, Pessoa, Pose, SOMBRA_SUAVE, V3, proj } from "./olho";
import { BETO, GENTE, JAIR, NEIDE, Quadrinho, RAFA, TelaAlerta, TextoMundo, sala } from "./Previa";

// PARTE 1 — roteiro v4 "Separa as marmita" (aprovado em 09/11/2026), no molde do vídeo do supermercado
// das referências (só a técnica): começo banal, medo pelo que se vê, fala com motivo, retorno da frase
// boba no fim, silêncio, POV da Thaís, faixa do alerta no topo, "o que você faria?".
// Tudo em tempo real (segundos); vozes em public/alerta/voz4/final (scripts/vozes-alerta4.py).
export const DURACAO_PARTE1 = 85 * 30;
const FIM = 85;

const ease = (x: number) => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
};
const lerp = (a: number, b: number, x: number) => a + (b - a) * x;
const faixa = (s: number, a: number, b: number) => ease((s - a) / (b - a));
const C = (pos: V3, yaw: number, pitch = 0, k = 720): Cam => ({ pos, yaw, pitch, k });
const entre = (a: Cam, b: Cam, x: number): Cam => {
  const e = ease(x);
  return { pos: [lerp(a.pos[0], b.pos[0], e), lerp(a.pos[1], b.pos[1], e), lerp(a.pos[2], b.pos[2], e)], yaw: lerp(a.yaw, b.yaw, e), pitch: lerp(a.pitch, b.pitch, e), k: lerp(a.k ?? 720, b.k ?? 720, e) };
};
const PI = Math.PI;

const JAIR_PERTO = (z0: number, z1: number): [Cam, Cam] => [C([-2.45, 1.35, -2.2 - (z0 - 0.95)], -0.25, -0.12, 760), C([-2.5, 1.35, -2.0 - (z1 - 0.7)], -0.25, -0.12, 790)];
const PLANOS: [number, Cam, Cam][] = [
  [0, C([0.5, 1.5, 2.7], PI + 0.45, 0.06), C([0.5, 1.5, 2.6], PI - 0.05, 0.06)], // bar cheio, Jair reclama
  [3.6, C([2.6, 1.5, -1.2], PI - 0.12, 0), C([2.8, 1.5, -1.6], PI - 0.2, 0.02)], // Neide responde
  [7.2, C([0.5, 1.45, 2.7], PI - 0.05, -0.12), C([0.5, 1.45, 2.6], PI + 0.05, -0.14)], // áudio do Rafa
  [11.0, C([3.3, 1.5, 0.2], PI + 0.1, 0.02), C([3.4, 1.5, -0.5], PI + 0.1, 0.02)], // Thaís vai ao balcão
  [14.0, C([-1.0, 1.5, 1.5], PI + 0.22, 0.1), C([-1.2, 1.5, 0.9], PI + 0.2, 0.1)], // TV, jogo
  [16.2, C([-2.2, 1.9, -1.4], PI, 0.05, 800), C([-2.2, 2.0, -2.1], PI, 0.05, 820)], // TV vira alerta
  [17.4, C([4.3, 2.6, 3.3], -2.27, -0.25), C([4.2, 2.5, 2.6], -2.05, -0.22)], // bar inteiro apitando
  [19.7, C([0.5, 1.5, 2.7], PI - 0.05, -0.08), C([0.5, 1.5, 2.6], PI + 0.05, -0.1)], // Thaís lê o alerta
  [24.8, ...JAIR_PERTO(0.95, 0.7)], // "é golpe"
  [29.2, C([-0.3, 1.55, 1.2], -0.5, 0.03), C([-0.5, 1.55, 1.6], -0.45, 0.04)], // Beto na vitrine
  [32.4, C([-1.0, 1.5, 2.3], -0.33, 0.04), C([-1.2, 1.5, 2.8], -0.3, 0.05)], // Rafa chega
  [34.6, C([-1.6, 1.55, 3.3], -0.27, 0.06), C([-1.7, 1.55, 3.5], -0.25, 0.06)], // Thaís grita no vidro
  [37.6, C([-1.4, 1.55, 3.0], -0.28, 0.02, 950), C([-1.5, 1.55, 3.2], -0.28, 0.02, 1050)], // "não tô ouvindo"
  [39.6, C([-1.9, 1.6, 3.6], -0.12, 0.25, 1050), C([-1.95, 1.62, 3.65], -0.1, 0.3, 1150)], // ele olha pra cima
  [40.6, C([-1.0, 1.5, 2.3], -0.33, 0.04), C([-1.1, 1.5, 2.5], -0.33, 0.04)], // BUM
  [42.4, C([-1.4, 1.55, 3.0], -0.28, 0.02, 950), C([-1.5, 1.55, 3.2], -0.28, 0.02, 1050)], // ele vira, calmo
  [43.6, C([0.6, 1.5, 1.8], 0.75, 0.05), C([0.8, 1.5, 2.0], 0.7, 0.08)], // porta descendo
  [46.4, C([-1.4, 1.6, 2.6], 0, 0.02, 900), C([-1.4, 1.6, 2.85], 0, 0.02, 980)], // Rafa colado na vitrine
  [50.7, C([-0.7, 1.5, 2.4], -0.3, -0.02), C([-0.8, 1.5, 2.65], -0.3, -0.02)], // Thaís: "entra logo"
  [54.6, C([-1.2, 1.55, 3.5], 2.11, 0, 760), C([-1.15, 1.55, 3.45], 2.11, 0, 800)], // Neide: "olha o olho"
  [57.1, C([-1.4, 1.66, 3.45], 0, 0.04, 1150), C([-1.4, 1.66, 3.6], 0, 0.04, 1300)], // "olha pra cá"
  [59.8, C([0.4, 1.62, 2.9], -2.47, 0, 760), C([0.33, 1.62, 2.82], -2.47, 0, 800)], // Beto: "não pisca"
  [61.8, C([-0.8, 1.5, 2.4], -0.45, 0.04), C([-1.0, 1.5, 2.8], -0.42, 0.05)], // sombras chegando
  [65.0, C([0.5, 1.5, 2.7], PI, 0.06), C([0.5, 1.5, 2.5], PI, 0.08)], // luzes morrem
  [67.4, C([-0.6, 1.5, 2.4], -0.5, -0.05), C([-0.7, 1.5, 2.5], -0.46, -0.05)], // outro áudio
  [71.4, C([-0.6, 1.45, 2.3], -0.3, 0.03), C([-0.8, 1.45, 2.7], -0.25, 0.03)], // celular no bolso
  [76.6, ...JAIR_PERTO(0.95, 0.8)], // "não é golpe não, né?"
  [79.0, C([-0.8, 1.45, 2.7], -0.25, 0.03), C([-0.8, 1.45, 2.7], -0.25, 0.03)], // o que você faria?
];

// [início, arquivo, legenda, cor] — cor por personagem
const JAI = "#ffd23f";
const NEI = "#9dff9d";
const THA = "#ffffff";
const RAF = "#ff9be0";
const BET = "#ffb347";
const CLI = "#8fd3ff";
const VOZES: [number, string, string, string][] = [
  [0.6, "01-jair-juiz", "Ô Neide, esse juiz tá roubando descarado!", JAI],
  [3.8, "02-neide-fiado", "Roubando tá você, Jair, que não paga o fiado.", NEI],
  [7.7, "03-rafa-audio", "🔊 Thaís, tô chegando. Separa as marmita pra mim, beleza?", RAF],
  [11.1, "04-thais-marmitas", "Neide, as marmitas do Rafa já saíram?", THA],
  [14.2, "05-neide-minutinhos", "Dois minutinhos, fia.", NEI],
  [17.0, "06-cliente-apitando", "Que isso? Tá todo mundo apitando!", CLI],
  [19.8, "07-thais-le", "Alerta extremo… Fique onde está. Não olhe para o céu.", THA],
  [25.0, "08-jair-golpe", "Isso aí é golpe, gente. Daqui a pouco pede Pix.", JAI],
  [29.4, "09-beto-parou", "Neide… o povo lá fora parou tudo.", BET],
  [34.6, "10-thais-grita", "Rafa! Não olha pra cima! Entra!", THA],
  [37.7, "11-rafa-naoouco", "Quê? Não tô ouvindo!", RAF],
  [42.4, "12-thais-rafa", "…Rafa?", THA],
  [43.8, "13-neide-porta", "Beto, abaixa a porta! Agora!", NEI],
  [47.0, "14-rafa-marmita", "Thaís… separa as marmita pra mim… beleza?", RAF],
  [50.9, "15-thais-assusta", "Rafa, cê tá me assustando. Entra logo!", THA],
  [54.7, "16-neide-olho", "Não, fia. Olha o olho dele.", NEI],
  [57.3, "17-rafa-olha", "Olha pra cá, Thaís. Olha pra cá.", RAF],
  [59.9, "18-beto-pisca", "Ele não pisca, Neide.", BET],
  [62.2, "coro", "olha pra cá… olha pra cá…", "#ff5a4d"],
  [67.6, "msg-robo", "🔊 Thaís… separa as marmita pra mim… beleza?", RAF],
  [71.5, "20-thais-bolso", "Ele mandou outro áudio… Mas o celular dele tá no bolso.", THA],
  [76.7, "21-jair-naoegolpe", "…Isso não é golpe não, né?", JAI],
];
const DUR: Record<string, number> = {
  "01-jair-juiz": 2.96, "02-neide-fiado": 3.25, "03-rafa-audio": 3.24, "04-thais-marmitas": 2.93, "05-neide-minutinhos": 1.56,
  "06-cliente-apitando": 2.56, "07-thais-le": 4.92, "08-jair-golpe": 4.1, "09-beto-parou": 2.96, "10-thais-grita": 2.88,
  "11-rafa-naoouco": 1.79, "12-thais-rafa": 0.97, "13-neide-porta": 2.63, "14-rafa-marmita": 3.63, "15-thais-assusta": 3.58,
  "16-neide-olho": 2.35, "17-rafa-olha": 2.28, "18-beto-pisca": 1.79, coro: 4.97, "msg-robo": 3.63, "20-thais-bolso": 4.91, "21-jair-naoegolpe": 1.82,
};

// [segundo, efeito, volume]
const EFEITOS: [number, string, number][] = [
  [7.4, "vibra", 0.35], [7.4, "msg", 0.3],
  [16.2, "alarme", 0.5], [16.2, "vibra", 0.4], [16.9, "alarme", 0.3], [17.8, "alarme", 0.22], [17.8, "vibra", 0.3], [19.0, "alarme", 0.14],
  [32.4, "moto", 0.32],
  [40.6, "bum", 0.85],
  [44.4, "rolo", 0.55],
  [57.2, "coracao", 0.5], [58.2, "coracao", 0.55], [59.2, "coracao", 0.6],
  [65.0, "apagao", 0.55],
  [67.4, "vibra", 0.5], [67.4, "msg", 0.45],
  [78.2, "escolha", 0.75],
];

const Legenda: React.FC<{ s: number }> = ({ s }) => {
  const v = VOZES.find(([a, n]) => s >= a && s < a + DUR[n] + 0.25);
  if (!v) return null;
  const [a, n, texto, cor] = v;
  const b = a + DUR[n] + 0.25;
  const op = Math.min(1, (s - a) / 0.12, (b - s) / 0.15);
  return (
    <div style={{ position: "absolute", top: 1150, left: 70, right: 70, textAlign: "center", opacity: op, fontFamily: FONTE_FORTE, fontWeight: 700, fontStyle: n === "coro" ? "italic" : "normal", fontSize: 54, lineHeight: 1.2, color: cor, textShadow: SOMBRA_SUAVE }}>
      {texto}
    </div>
  );
};

// tela do celular com o áudio do WhatsApp (normal = verde; robo = vermelho, de quem já olhou)
const TelaAudio: React.FC<{ robo?: boolean; prog: number }> = ({ robo, prog }) => (
  <g style={{ fontFamily: FONTE_FORTE }}>
    <rect x={-160} y={-268} width={320} height={576} rx={28} fill={robo ? "#160b0b" : "#0f1714"} />
    <rect x={-160} y={-268} width={320} height={70} rx={28} fill={robo ? "#3a1010" : "#1f3a2f"} />
    <circle cx={-118} cy={-233} r={20} fill={robo ? "#7a1a1a" : "#2a9d8f"} />
    <text x={-88} y={-225} fontSize={24} fontWeight={800} fill="#fff">Rafa</text>
    <text x={-88} y={-205} fontSize={15} fontWeight={500} fill="#cfd8d4">{robo ? "gravando áudio…" : "online"}</text>
    <rect x={-140} y={-150} width={270} height={84} rx={22} fill={robo ? "#4a1414" : "#24453a"} />
    <path d="M-118 -126 L-96 -108 L-118 -90 Z" fill="#fff" />
    {Array.from({ length: 20 }, (_, i) => {
      const h = 8 + Math.abs(Math.sin(i * 1.7 + (robo ? 3 : 0))) * 26;
      return <rect key={i} x={-82 + i * 9.5} y={-108 - h / 2} width={5} height={h} rx={2} fill={i / 20 < prog ? (robo ? "#ff5a4d" : "#7ee2b8") : "#8a9a94"} />;
    })}
    <text x={110} y={-76} fontSize={15} fontWeight={700} fill="#cfd8d4" textAnchor="end">0:03</text>
    {robo && (
      <>
        <rect x={-140} y={-40} width={270} height={84} rx={22} fill="#4a1414" />
        <path d="M-118 -16 L-96 2 L-118 20 Z" fill="#fff" />
        {Array.from({ length: 20 }, (_, i) => {
          const h = 6 + Math.abs(Math.sin(i * 2.3)) * 30;
          return <rect key={i} x={-82 + i * 9.5} y={2 - h / 2} width={5} height={h} rx={2} fill="#ff5a4d" opacity={0.6} />;
        })}
        <text x={0} y={120} fontSize={20} fontWeight={800} fill="#ff5a4d" textAnchor="middle">2 áudios novos</text>
      </>
    )}
  </g>
);

// faixa vermelha do alerta no topo da tela (como notificação de emergência)
const Faixa: React.FC<{ s: number }> = ({ s }) => {
  if (s < 16.2 || s > 31.5) return null;
  const entra = faixa(s, 16.2, 16.6);
  const sai = 1 - faixa(s, 30.8, 31.5);
  const pisca = Math.sin(s * 10) > 0 ? 1 : 0.85;
  return (
    <div style={{ position: "absolute", top: 70 + (1 - entra) * -260, left: 46, right: 46, opacity: sai, background: `rgba(178,8,26,${0.94 * pisca})`, borderRadius: 26, padding: "22px 30px", display: "flex", gap: 22, alignItems: "center", boxShadow: "0 14px 40px rgba(0,0,0,0.5)" }}>
      <div style={{ fontSize: 64, lineHeight: 1 }}>⚠️</div>
      <div style={{ fontFamily: FONTE_FORTE, color: "#fff" }}>
        <div style={{ fontWeight: 800, fontSize: 36, letterSpacing: 2 }}>ALERTA EXTREMO</div>
        <div style={{ fontWeight: 700, fontSize: 30, opacity: 0.95 }}>Fique onde está. Não olhe para o céu.</div>
      </div>
    </div>
  );
};

const Tag: React.FC = () => (
  <div style={{ position: "absolute", top: 110, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
    <div style={{ background: "rgba(150,16,22,0.92)", borderRadius: 999, padding: "12px 44px", fontFamily: FONTE_TITULO, fontWeight: 800, fontSize: 46, letterSpacing: 6, color: "#fff", boxShadow: "0 8px 30px rgba(0,0,0,0.5)" }}>PARTE 01</div>
  </div>
);

const Escolha: React.FC = () => (
  <>
    <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.62)" }} />
    <div style={{ position: "absolute", top: 430, left: 0, right: 0, textAlign: "center", fontFamily: FONTE_TITULO, fontWeight: 800, fontSize: 82, color: "#fff", textShadow: SOMBRA_SUAVE }}>
      O que você faria<span style={{ color: "#ff4a3d" }}>?</span>
    </div>
    {[
      ["A", "Abrir a porta pro Rafa", 610],
      ["B", "Ouvir o áudio dele", 880],
    ].map(([l, t, y]) => (
      <div key={l as string} style={{ position: "absolute", top: y as number, left: 80, right: 80, display: "flex", alignItems: "center", gap: 36, padding: "26px 44px", borderRadius: 28, background: "rgba(14,10,10,0.78)", border: "2px solid rgba(255,255,255,0.35)", boxShadow: "0 12px 40px rgba(0,0,0,0.55)" }}>
        <div style={{ fontFamily: FONTE_TITULO, fontWeight: 800, fontSize: 110, color: "#ff4a3d", lineHeight: 1 }}>{l}</div>
        <div style={{ fontFamily: FONTE_FORTE, fontWeight: 700, fontSize: 48, lineHeight: 1.2, color: "#fff" }}>{t}</div>
      </div>
    ))}
    <div style={{ position: "absolute", top: 1180, left: 60, right: 60, textAlign: "center", fontFamily: FONTE_FORTE, fontWeight: 500, fontSize: 44, color: "#f1ece4", textShadow: SOMBRA_SUAVE }}>
      Comenta <span style={{ color: "#ff4a3d", fontWeight: 800 }}>A</span> ou <span style={{ color: "#ff4a3d", fontWeight: 800 }}>B</span>. A parte 2 sai com a que ganhar.
    </div>
  </>
);

const Som: React.FC<{ cortes: number[] }> = ({ cortes }) => {
  const F = 30;
  return (
    <>
      {/* trilha de suspense o vídeo inteiro (Piano Horror, Mixkit): sobe no alerta e no céu vermelho */}
      <Audio
        src={staticFile("alerta/musica/piano-horror.mp3")}
        volume={(f) => {
          const t = f / F;
          const base = t < 16.2 ? 0.1 : t < 40.6 ? 0.13 : 0.17;
          return base * interpolate(t, [0, 1.2, FIM - 2.5, FIM], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        }}
      />
      <Sequence from={Math.round(40.6 * F)}>
        <Audio src={staticFile("alerta/sons/grave.wav")} loop volume={(f) => interpolate(f / F, [0, 1.5, FIM - 40.6 - 2, FIM - 40.6], [0, 0.14, 0.14, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
      </Sequence>
      {cortes.map((t, i) => (
        <Sequence key={`c${i}`} from={Math.max(0, Math.round((t - 0.12) * F))} durationInFrames={12}>
          <Audio src={staticFile(`alerta/sons/${i % 2 ? "corte2" : "corte"}.wav`)} volume={0.14} />
        </Sequence>
      ))}
      {EFEITOS.map(([t, n, v], i) => (
        <Sequence key={`e${i}`} from={Math.round(t * F)}>
          <Audio src={staticFile(`alerta/sons/${n}.wav`)} volume={v} />
        </Sequence>
      ))}
      {VOZES.map(([t, n], i) => (
        <Sequence key={`v${i}`} from={Math.round(t * F)}>
          <Audio src={staticFile(`alerta/voz4/final/${n}.wav`)} volume={n === "coro" ? 0.75 : n.startsWith("03") || n === "msg-robo" ? 0.8 : 1} />
        </Sequence>
      ))}
    </>
  );
};

const SOMBRAS: V3[] = [[-3.4, 0, 6.2], [-2.0, 0, 7.4], [-1.0, 0, 5.8], [-3.0, 0, 9], [-1.6, 0, 10.5], [0.2, 0, 7.5], [-4.2, 0, 8.2]];
const PARADOS: [V3, number][] = [[[-4.2, 0, 7.2], 0], [[-2.9, 0, 8.4], 1], [[-0.6, 0, 7.8], 2], [[0.8, 0, 9.4], 3], [[-5.6, 0, 9.8], 4], [[-1.8, 0, 10.6], 0]];

export const AlertaParte1: React.FC<{ semTexto?: boolean }> = ({ semTexto }) => {
  const frame = useCurrentFrame();
  const s = frame / 30;
  const iPlano = PLANOS.filter(([a]) => s >= a).length - 1;
  const [ini, ca, cb] = PLANOS[iPlano];
  const fimPlano = PLANOS[iPlano + 1]?.[0] ?? FIM;
  let cam = entre(ca, cb, (s - ini) / (fimPlano - ini));

  // estado do mundo
  const ALERTA = 16.2;
  const BUM = 40.6;
  const gold = s >= BUM;
  const flash = s >= BUM ? Math.exp(-(s - BUM) * 3) : 0;
  const flashTV = s >= ALERTA && s < ALERTA + 1.2 ? Math.exp(-(s - ALERTA) * 5) * 0.6 : 0;
  const rolo = s < 44.4 ? 3.05 : lerp(3.05, 0.02, faixa(s, 44.4, 46.2));
  const motoX = s < 32.4 ? -14 : s < 33.8 ? lerp(-14, 0, 1 - (1 - (s - 32.4) / 1.4) ** 2) : 0;
  const tv = s < ALERTA ? "jogo" : s < 65.0 ? "alerta" : "off";
  // luzes morrendo: duas piscadas lentas (no ritmo do som do apagão) e depois fica escuro
  const escuro = s < 65.0 ? 0 : s < 65.35 ? 0.5 : s < 65.6 ? 0.1 : s < 66.0 ? 0.5 : s < 66.15 ? 0.15 : 0.3;
  const treme = (s > 34.6 && s < 37.6) || s > 79 ? 1 : s > 61.8 && s < 65 ? 0.4 : 0;
  if (treme) cam = { ...cam, pos: [cam.pos[0] + Math.sin(s * 31) * 0.02 * treme, cam.pos[1] + Math.sin(s * 27) * 0.015 * treme, cam.pos[2]] };
  cam = { ...cam, yaw: cam.yaw + Math.sin(s * 1.1) * 0.012, pitch: cam.pitch + Math.sin(s * 1.7) * 0.008 };

  const base = sala(rolo, gold);
  const det = detalhesBar(gold, motoX);
  const prims = [...base.prims, ...det.prims];
  const linhas = [...base.linhas, ...det.linhas];

  // gente lá dentro
  const alerta = s >= ALERTA;
  const medo = s >= BUM;
  const costas: Pose = "costas";
  const jairFrente = iPlano === 8 || iPlano === 26;
  const dentro: { pos: V3; est: Estilo; pose: Pose; h: number }[] = [
    { pos: [-3, 0, -0.25], est: JAIR, pose: jairFrente ? (s >= 16.2 && s < 40.6 ? "celular" : "sentado") : costas, h: 1.3 },
    { pos: [-0.6, 0, -0.62], est: GENTE[0], pose: costas, h: 1.3 },
    { pos: [-0.6, 0, -1.8], est: GENTE[1], pose: alerta ? "celular" : "sentado", h: 1.3 },
    { pos: [-3.4, 0, 2.02], est: GENTE[2], pose: alerta && !medo ? "celular" : "sentado", h: 1.28 },
    { pos: [-3.4, 0, 0.78], est: GENTE[3], pose: medo ? "susto" : alerta ? "celular" : "sentado", h: 1.3 },
    s < 29.2
      ? { pos: [2.2, 0, -1.5], est: BETO, pose: costas, h: 1.76 }
      : s < 43.6
        ? { pos: [-3.6, 0, 3.2], est: BETO, pose: costas, h: 1.76 }
        : { pos: [-0.4, 0, 1.9], est: BETO, pose: iPlano === 21 ? "parado" : "susto", h: 1.76 },
    { pos: [-1.6, 0, 0.5], est: GENTE[4], pose: alerta ? "celular" : costas, h: 1.7 },
    s >= 43.6 && s < 46.4
      ? { pos: [2.3, 0, 3.45], est: NEIDE, pose: "susto", h: 1.62 }
      : s >= 50.7 && s < 61.8
        ? { pos: [-0.2, 0, 2.9], est: NEIDE, pose: "parado", h: 1.62 }
        : { pos: [3.0, 0, -3.55], est: NEIDE, pose: alerta && s < 19 ? "susto" : "parado", h: 1.62 },
    { pos: [2.4, 0, -1.85], est: GENTE[3], pose: costas, h: 1.3 },
    { pos: [4.2, 0, -1.85], est: GENTE[0], pose: costas, h: 1.32 },
    ...(jairFrente ? [] : [{ pos: [-3.0, 0, -1.42] as V3, est: GENTE[4], pose: (alerta ? "celular" : "sentado") as Pose, h: 1.3 }]),
    { pos: [-2.38, 0, -0.8], est: GENTE[1], pose: alerta ? "celular" : "sentado", h: 1.28 },
    { pos: [-2.78, 0, 1.4], est: GENTE[0], pose: medo ? "susto" : alerta ? "celular" : "sentado", h: 1.3 },
    { pos: [-1.9, 0, 1.2], est: GENTE[2], pose: alerta ? "celular" : "parado", h: 1.62 },
    { pos: [-4.3, 0, -0.5], est: GENTE[2], pose: costas, h: 1.6 },
  ];
  // celular de todo mundo apita: tela vermelha piscando (cada um num ritmo); depois do apagão, todos mortos
  const telaDe = (i: number) => (s >= 16.2 && s < 65 ? (s < 40.6 && Math.sin(s * 9 + i * 1.7) < -0.2 ? "#ff9a8a" : "#ff2a2a") : undefined);
  const objetos: Objeto[] = dentro.map((p, i) => ({ pos: [p.pos[0], 0.6, p.pos[2]], no: <Pessoa cam={cam} pos={p.pos} altura={p.h} estilo={p.est} pose={p.pose} t={s} tela={telaDe(i)} /> }));
  objetos.push({ pos: [1.2, 0.2, 0.9], no: <Cachorro cam={cam} pos={[1.2, 0, 0.9]} t={s} /> });

  // gente lá fora parada olhando o céu (depois do alerta); depois do BUM, todos viram pro bar, calmos
  if (s >= 29.2 && s < 61.8)
    PARADOS.forEach(([p, k], i) => objetos.push({ pos: [p[0], 0.8, p[2]], no: <Pessoa cam={cam} pos={p} altura={1.65 + (i % 3) * 0.06} estilo={GENTE[k]} pose={medo ? "calmo" : "ceu"} t={s} /> }));

  // Rafa
  let rafa: { pos: V3; pose: Pose } | null = null;
  if (s >= 32.4 && s < 34.0) rafa = { pos: [-0.9 + motoX, 0.35, 6.4], pose: "sentado" };
  else if (s >= 34.0 && s < 39.6) rafa = { pos: [-1.9, 0, 6.0], pose: s < 34.6 ? "celular" : "parado" };
  else if (s >= 39.6 && s < 42.6) rafa = { pos: [-2.2, 0, 6.0], pose: "ceu" };
  else if (s >= 42.6) {
    const k = faixa(s, 44.0, 46.8);
    rafa = { pos: [lerp(-2.2, -1.4, k), 0, lerp(6.0, 4.55, k)], pose: "calmo" };
  }
  if (rafa) objetos.push({ pos: [rafa.pos[0], 0.8, rafa.pos[2]], no: <Pessoa cam={cam} pos={rafa.pos} altura={rafa.pose === "sentado" ? 1.4 : 1.76} estilo={RAFA} pose={rafa.pose} t={s} /> });

  if (s >= 61.8) {
    const k = faixa(s, 61.8, 74);
    const ponto = [...PARADOS.map(([p]) => p), ...SOMBRAS.slice(0, 3).map((p) => [p[0], 0, p[2] + 6] as V3)];
    ponto.forEach((origem, i) => {
      const alvo = SOMBRAS[i % SOMBRAS.length];
      const pos: V3 = [lerp(origem[0], alvo[0], k), 0, lerp(origem[2], alvo[2], k)];
      objetos.push({ pos: [pos[0], 0.8, pos[2]], no: <Pessoa cam={cam} pos={pos} altura={1.7 + (i % 3) * 0.05} estilo={RAFA} pose="sombra" t={s} /> });
    });
  }

  // celular da Thaís
  let fone: React.ReactNode;
  let subida = 0;
  if (s >= 7.4 && s < 11.1) {
    fone = <TelaAudio prog={faixa(s, 7.7, 10.9)} />;
    subida = Math.min(faixa(s, 7.4, 8.0), 1 - faixa(s, 10.6, 11.1));
  } else if (s >= 19.7 && s < 24.9) {
    fone = <TelaAlerta />;
    subida = Math.min(faixa(s, 19.7, 20.3), 1 - faixa(s, 24.4, 24.9));
  } else if (s >= 67.4 && s < 71.5) {
    fone = <TelaAudio robo prog={faixa(s, 67.6, 71.2)} />;
    subida = Math.min(faixa(s, 67.4, 68.0), 1 - faixa(s, 71.0, 71.5));
  }
  const vibra = (s >= 7.4 && s < 8.4) || (s >= 67.4 && s < 68.4) ? Math.sin(s * 90) * 9 : 0;
  const semMaos = [1, 4, 5, 6, 8, 13, 15, 16, 19, 20, 21, 26].includes(iPlano);
  const maosBaixas = !fone && iPlano >= 10 && iPlano <= 25;

  // PEGADA: cor viva no começo, pesa de leve depois do alerta, "bum" pro sombrio no céu vermelho
  const trevas = s < ALERTA ? 0 : s < BUM ? 0.28 * faixa(s, ALERTA, 30) : 0.28 + 0.72 * faixa(s, BUM, BUM + 1);
  const L = (a: number, b: number) => lerp(a, b, trevas);
  const nevoa: Nevoa = { perto: L(4, 2.2), longe: L(20, 13), min: L(0.8, 0.32) };
  const filtroCena = `saturate(${L(0.95, 0.75).toFixed(2)}) brightness(${L(1.0, 0.62).toFixed(2)}) contrast(${L(1.04, 1.22).toFixed(2)})`;
  const filtroMaos = `saturate(${L(0.95, 0.7).toFixed(2)}) brightness(${L(1.0, 0.62).toFixed(2)})`;
  const pisca = 0;
  const tvP = proj(cam, [-2.2, 2.15, -3.82]);
  const brilhoTV = tv === "alerta" && tvP.th < 1.5 ? 0.55 + Math.sin(s * 8) * 0.15 : 0;
  // textos presos no cenário (lousa, relógio, placa, TV) como objetos com profundidade
  const textosMundo: Objeto[] = det.textos.map((t) => ({
    pos: t.centro,
    vies: 0.25,
    no: (
      <TextoMundo cam={cam} centro={t.centro} larg={t.larg}>
        <Quadrinho tipo={t.tipo} />
      </TextoMundo>
    ),
  }));
  const contraFiltro = `brightness(${(1 / L(1.0, 0.62)).toFixed(2)}) saturate(${(1 / L(0.95, 0.75)).toFixed(2)})`;
  textosMundo.push({
    pos: [-2.2, 2.15, -3.82],
    vies: 0.25,
    no: (
      <g style={{ filter: tv === "off" ? undefined : contraFiltro }}>
        <TextoMundo cam={cam} centro={[-2.2, 2.15, -3.82]} larg={1.8}>
          <rect x={-180} y={-100} width={360} height={200} fill={tv === "alerta" ? "#a3001a" : tv === "jogo" ? "#2a5a32" : "#050507"} />
          {tv === "alerta" && (
            <>
              <text y={-48} fontSize={30} fontWeight={900} fill="#fff">ALERTA EXTREMO</text>
              <text y={0} fontSize={24} fontWeight={800} fill="#fff">Fique onde está.</text>
              <text y={36} fontSize={20} fontWeight={800} fill="#fff">Feche portas e janelas.</text>
              <text y={80} fontSize={26} fontWeight={900} fill={Math.sin(s * 8) > 0 ? "#ffe66d" : "#fff"}>NÃO OLHE PARA O CÉU.</text>
            </>
          )}
          {tv === "jogo" && (
            <>
              <line x1={-180} x2={180} y1={0} y2={0} stroke="#fff" strokeWidth={4} opacity={0.5} />
              <circle r={34} fill="none" stroke="#fff" strokeWidth={4} opacity={0.5} />
              <circle cx={-120 + ((s * 60) % 240)} cy={30 * Math.sin(s * 2)} r={8} fill="#fff" />
              <text y={-62} fontSize={24} fontWeight={900} fill="#fff">{"BRA  1 x 1  ARG  · 87'"}</text>
            </>
          )}
        </TextoMundo>
      </g>
    ),
  });
  const fadeEscolha = interpolate(s, [79, 79.6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <radialGradient id="vinheta" cx="50%" cy="48%" r="72%">
            <stop offset="0.35" stopColor="#000" stopOpacity={0} />
            <stop offset="0.8" stopColor="#000" stopOpacity={L(0.18, 0.55)} />
            <stop offset="1" stopColor="#000" stopOpacity={L(0.45, 0.92)} />
          </radialGradient>
          <radialGradient id="luzTV" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#ff2a2a" stopOpacity={0.7} />
            <stop offset="1" stopColor="#ff2a2a" stopOpacity={0} />
          </radialGradient>
          <filter id="grao" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={frame % 13} />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>
        <g style={{ filter: filtroCena }}>
          <rect width={1080} height={1920} fill="#2a2724" />
          <Cenario cam={cam} prims={prims} objetos={[...objetos, ...textosMundo]} linhas={linhas} nevoa={nevoa} />
        </g>
        {false && (
          <TextoMundo cam={cam} centro={[-2.2, 2.15, -3.82]} larg={1.8}>
            <rect x={-180} y={-100} width={360} height={200} fill={tv === "alerta" ? "#a3001a" : "#2a5a32"} />
            {tv === "alerta" ? (
              <>
                <text y={-48} fontSize={30} fontWeight={900} fill="#fff">ALERTA EXTREMO</text>
                <text y={0} fontSize={24} fontWeight={800} fill="#fff">Fique onde está.</text>
                <text y={36} fontSize={20} fontWeight={800} fill="#fff">Feche portas e janelas.</text>
                <text y={80} fontSize={26} fontWeight={900} fill={Math.sin(s * 8) > 0 ? "#ffe66d" : "#fff"}>NÃO OLHE PARA O CÉU.</text>
              </>
            ) : (
              <>
                <line x1={-180} x2={180} y1={0} y2={0} stroke="#fff" strokeWidth={4} opacity={0.5} />
                <circle r={34} fill="none" stroke="#fff" strokeWidth={4} opacity={0.5} />
                <circle cx={-120 + ((s * 60) % 240)} cy={30 * Math.sin(s * 2)} r={8} fill="#fff" />
                <text y={-62} fontSize={24} fontWeight={900} fill="#fff">{"BRA  1 x 1  ARG  · 87'"}</text>
              </>
            )}
          </TextoMundo>
        )}
        {brilhoTV > 0 && <ellipse cx={tvP.x} cy={tvP.y} rx={520} ry={520} fill="url(#luzTV)" opacity={brilhoTV} style={{ mixBlendMode: "screen" }} />}
        {trevas > 0 && <rect width={1080} height={1920} fill={gold ? "#ff4a3a" : "#6a7d92"} opacity={gold ? 0.5 * trevas : trevas * 0.9} style={{ mixBlendMode: "multiply" }} />}
        {escuro + pisca > 0 && <rect width={1080} height={1920} fill="#04050a" opacity={Math.min(0.8, escuro + pisca)} />}
        {!semMaos && (
          <g style={{ filter: filtroMaos }}>
            <MaosPOV baixo={maosBaixas} telefone={fone} subida={subida} tremor={vibra} />
          </g>
        )}
        {!semMaos && fone && (
          <g opacity={0.9} style={{ mixBlendMode: "screen" }}>
            <g transform={`translate(${560 + vibra} ${1540 + (1 - subida) * 760}) rotate(${-8 + vibra * 0.3}) scale(0.72)`}>{fone}</g>
          </g>
        )}
        <rect width={1080} height={1920} fill="url(#vinheta)" />
        <rect width={1080} height={1920} filter="url(#grao)" opacity={L(0.05, 0.13)} style={{ mixBlendMode: "overlay" }} />
        {flash > 0.01 && <rect width={1080} height={1920} fill="#ff2a1a" opacity={flash} />}
        {flashTV > 0.01 && <rect width={1080} height={1920} fill="#ff2030" opacity={flashTV} />}
      </svg>

      {!semTexto && <Tag />}
      {!semTexto && <Faixa s={s} />}
      {!semTexto && s < 3.6 && (
        <div style={{ position: "absolute", top: 290, left: 60, right: 60, textAlign: "center", fontFamily: FONTE_TITULO, fontWeight: 800, fontSize: 74, lineHeight: 1.12, color: "#fff", textShadow: SOMBRA_SUAVE, opacity: Math.min(1, s / 0.3, (3.6 - s) / 0.3) }}>
          E se todo celular do Brasil tocasse ao mesmo tempo com o alerta: <span style={{ color: "#ff4a3d" }}>não olhe para o céu</span>?
        </div>
      )}
      {!semTexto && s < 79 && <Legenda s={s} />}
      {!semTexto && s >= 79 && (
        <div style={{ position: "absolute", inset: 0, opacity: fadeEscolha }}>
          <Escolha />
        </div>
      )}
      {!semTexto && <Som cortes={PLANOS.slice(1).map(([t]) => t)} />}
    </AbsoluteFill>
  );
};
