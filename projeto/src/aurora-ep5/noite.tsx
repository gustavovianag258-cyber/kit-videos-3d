import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { clamp, COR, FONTE, Placa } from "../aurora/estilo";
import { Celular } from "../aurora-ep2/cenas2";
import { GuaritaFora, LambeLambe, Poste } from "../aurora-ep3/objetos";
import { Caixa, PortaDeCasa } from "../aurora-ep4/atos";
import { Gente } from "../aurora-ep4/corpo";
import { Padaria, Quarto, RuaFundo } from "../aurora-ep4/fundos";
import { OlheiroBloco, SeuEdson } from "../aurora-ep4/pessoa";
import { freia, suave, Tela, Zoom } from "./dia";
import { Agente, Denis } from "./elenco";
import { clipe, janelas, palavra } from "./falas";
import { Betoneira, CarroPreto, CasaDenis, Chuva, ConeDePoste, Escuro, Foto, GuardaChuva, Pasta, Respingos } from "./objetos";
import { S } from "./tempos";
import { Molhado } from "./tresd";

// Metade de noite do ep. 5: o tom vira. Sem onomatopeia, sem piada, sem whoosh: chuva, luz de poste
// e silêncio. Só aparece o que é pra dar medo.

// ---------- agentes ----------
const NET = 70;
const POSE_GUARDA = { bracoD: 30, antebracoD: -100 };
const AgenteGuarda: React.FC<{ x: number; y: number; e?: number; t?: number; fala?: [number, number][]; olha?: number; olhos?: "normal" | "cima"; anda?: number; dir?: 1 | -1 }> = ({ x, y, e = 0.95, t, fala, olha = 0, olhos = "normal", anda, dir }) => (
  <Agente x={x} y={y} escala={e} t={t} fala={fala} olha={olha} olhos={olhos} anda={anda} dir={dir} gesto={false} pose={POSE_GUARDA} naMao={<GuardaChuva net={NET} />} />
);
const AgentePasta: React.FC<{ x: number; y: number; e?: number; olha?: number; anda?: number; dir?: 1 | -1 }> = ({ x, y, e = 0.95, olha = 0, anda, dir }) => (
  <Agente n={1} x={x} y={y} escala={e} olha={olha} anda={anda} dir={dir} gesto={false} naMao={<Pasta />} />
);

const ChuvaEscura: React.FC<{ x?: number; y?: number; r?: number; forca?: number; chuva?: number }> = ({ x, y, r, forca, chuva }) => (
  <>
    <Escuro x={x} y={y} r={r} forca={forca} />
    <Chuva forca={chuva} />
    <Respingos />
  </>
);

// ---------- 9: o carro preto para na frente do portão ----------
export const CenaCarro: React.FC<{ t: number }> = ({ t }) => {
  const c1 = 1.75;
  const c2 = clipe("a-ceu").inicio - S.noite;
  const c3 = palavra("a-ceu", "É") - S.noite;
  const fala = janelas(["agente"], S.noite);
  if (t < c1) {
    const cx = freia(t, 0, c1 - 0.15, -520, 540);
    return (
      <Zoom z={1.03 + t * 0.012} ox={540} oy={1300}>
        <RuaFundo t={t} noite semAurora gente={false} transito={false} semPoste perto={<CasaDenis cortina={0} />} ruaFrente />
        <Tela>
          <CarroPreto x={cx} y={1900} e={2.7} giro={cx * 0.6} />
        </Tela>
        <ChuvaEscura x={540} y={1250} r={950} forca={0.58} />
      </Zoom>
    );
  }
  if (t < c2) {
    // primeira pessoa: ele espia pela cortina. Lá embaixo, o carro e dois guarda-chuvas
    const tt = t - c1;
    const abre = freia(tt, 0, 0.5, 0, 1);
    const gy = 1180;
    return (
      <AbsoluteFill style={{ background: "#07090F" }}>
        <Zoom z={1 + tt * 0.025} ox={540} oy={900}>
          <Tela>
            <rect x={0} y={0} width={1080} height={1920} fill="#262838" />
            {/* a rua molhada vista de cima */}
            <rect x={0} y={720} width={1080} height={1200} fill="#2E3040" />
            <rect x={0} y={1270} width={1080} height={650} fill="#42445A" />
            <rect x={0} y={1262} width={1080} height={14} fill="#6A6A80" />
            <ellipse cx={560} cy={1120} rx={480} ry={300} fill="#FFD9A0" opacity={0.22} />
            <rect x={570} y={860} width={380} height={148} rx={34} fill="#0A0B10" />
            <rect x={640} y={876} width={220} height={116} rx={18} fill="#1A2534" />
            <rect x={570} y={860} width={380} height={30} rx={14} fill="rgba(255,255,255,0.06)" />
            <polygon points="950,890 1080,860 1080,1000 950,980" fill="#FFF4C4" opacity={0.08} />
            {[
              [440 + Math.sin(tt) * 4, gy, 118],
              [640 + Math.sin(tt + 1) * 4, gy - 30, 118],
            ].map(([x, y, r], i) => (
              <g key={i}>
                <ellipse cx={x + 14} cy={y + 16} rx={r} ry={r * 0.72} fill="rgba(0,0,0,0.4)" />
                <ellipse cx={x} cy={y} rx={r} ry={r * 0.72} fill="#0B0C11" />
                {[0, 1, 2, 3].map((k) => (
                  <line key={k} x1={x} y1={y} x2={x + Math.cos(k * 0.785) * r} y2={y + Math.sin(k * 0.785) * r * 0.72} stroke="#2A2C38" strokeWidth={4} />
                ))}
                <circle cx={x} cy={y} r={6} fill="#3A3C48" />
              </g>
            ))}
          </Tela>
          <Chuva forca={0.32} v={1200} />
        </Zoom>
        <Tela>
          {/* vidro, batente e cortina */}
          <rect x={0} y={0} width={1080} height={1920} fill="rgba(170,190,220,0.05)" />
          <path d={`M 0 0 L ${330 - abre * 200} 0 Q ${380 - abre * 220} 900 ${300 - abre * 170} 1920 L 0 1920 Z`} fill="#3E2F35" />
          <path d={`M 1080 0 L ${750 + abre * 200} 0 Q ${700 + abre * 220} 900 ${780 + abre * 170} 1920 L 1080 1920 Z`} fill="#34282E" />
          {[0, 1, 2, 3, 4].map((i) => (
            <line key={i} x1={40 + i * 42} y1={0} x2={30 + i * 30} y2={1920} stroke="rgba(0,0,0,0.25)" strokeWidth={6} />
          ))}
          <rect x={0} y={0} width={1080} height={60} fill="#0D0D12" />
          <rect x={0} y={1860} width={1080} height={60} fill="#0D0D12" />
          {/* dedos segurando a cortina */}
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={120 + abre * -60} y={820 + i * 62} width={150} height={52} rx={25} fill="#7A5438" />
          ))}
        </Tela>
        <Escuro x={540} y={1000} r={720} forca={0.32} />
      </AbsoluteFill>
    );
  }
  if (t < c3) {
    // "Seu Denis? Departamento de Eventos Atmosféricos." Visto de dentro do portão, pelas grades
    const tt = t - c2;
    return (
      <AbsoluteFill>
        <Zoom z={freia(tt, 0, 3, 1.5, 1.6)} ox={520} oy={1040}>
          <RuaFundo t={t} noite semAurora gente={false} transito={false} semPoste />
          <Tela>
            <CarroPreto x={760} y={1550} e={2.1} />
            <ConeDePoste x={520} y={560} base={1660} l={380} />
            <AgentePasta x={860} y={1640} e={0.92} olha={-0.3} />
            <AgenteGuarda x={500} y={1660} t={t} fala={fala} olha={0} />
          </Tela>
          <Molhado t={t} luzes={[{ x: 520, y: 1672, cor: "#FFD9A0", forca: 0.7, l: 170, h: 250 }, { x: 960, y: 1570, cor: "#FFF4C4", forca: 0.45, l: 120, h: 140 }]} />
          <Escuro x={520} y={980} r={620} forca={0.7} />
          <Chuva forca={0.4} />
          <Respingos />
        </Zoom>
        <Tela>
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <rect x={[28, 972, 215, 800][i]} y={0} width={46} height={1920} fill="#07080D" />
              <rect x={[28, 972, 215, 800][i]} y={0} width={10} height={1920} fill="rgba(255,255,255,0.05)" />
            </g>
          ))}
          <rect x={0} y={1640} width={1080} height={38} fill="#07080D" />
        </Tela>
      </AbsoluteFill>
    );
  }
  // close na pasta: as fotos saindo uma por uma. A do Denis por cima, ainda úmida da impressora
  const tt = t - c3;
  const fotos = [
    { q: "jonas", nome: "JONAS", x: 270, y: 460, a: -7 },
    { q: "bruno", nome: "BRUNO", x: 810, y: 440, a: 6 },
    { q: "edson", nome: "SEU EDSON", x: 250, y: 930, a: 5 },
    { q: "kaique", nome: "KAIQUE", x: 830, y: 950, a: -5 },
  ] as const;
  const PASSO = 0.27;
  const dk = tt - PASSO * 4;
  return (
    <AbsoluteFill style={{ background: "#0C0D12" }}>
      <Tela>
        <rect x={0} y={0} width={1080} height={1920} fill="#14130F" />
        <rect x={60} y={120} width={960} height={1680} rx={14} fill="#B39A6A" />
        <rect x={60} y={120} width={960} height={1680} rx={14} fill="url(#escPasta)" />
        <defs>
          <radialGradient id="escPasta" cx="0.5" cy="0.45" r="0.8">
            <stop offset="0.4" stopColor="#000" stopOpacity={0.05} />
            <stop offset="1" stopColor="#000" stopOpacity={0.75} />
          </radialGradient>
        </defs>
        <text x={540} y={1560} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={40} fill="#2A2010">
          DEPARTAMENTO DE EVENTOS ATMOSFÉRICOS · CONFIDENCIAL
        </text>
        {fotos.map((f, i) => {
          const d = tt - i * PASSO;
          if (d < 0) return null;
          const k = freia(d, 0, 0.2, 0, 1);
          return <Foto key={f.q} q={f.q} nome={f.nome} x={f.x} y={f.y + (1 - k) * 700} a={f.a} e={0.94} carimbo />;
        })}
        {dk >= 0 && <Foto q="denis" nome="DENIS" x={540} y={freia(dk, 0, 0.22, 1400, 690)} a={-2} e={1.22} umida={1} carimbo />}
      </Tela>
      <Escuro x={540} y={700} r={760} forca={0.6} />
      <Chuva n={40} forca={0.22} v={1600} />
    </AbsoluteFill>
  );
};

// ---------- 10: o Olheiro já conhecia esse carro ----------
const Lembra: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ filter: "saturate(0.3) brightness(0.72)" }}>{children}</AbsoluteFill>
);
export const CenaOlheiro: React.FC<{ t: number }> = ({ t }) => {
  const tg = useCurrentFrame() / 30;
  const c0 = palavra("n-olheiro", "esse") - S.olheiro;
  const c1 = clipe("n-jonas").inicio - S.olheiro - 0.05;
  const c2 = clipe("n-edson").inicio - S.olheiro - 0.05;
  const c3 = clipe("n-kaique").inicio - S.olheiro - 0.05;
  const c4 = S.prancheta - S.olheiro;
  if (t < c0) {
    // do outro lado da rua, debaixo do poste, na chuva. Ele não olha pro Denis: olha pro carro
    const verde = suave(t, 0.5, 0.85, 0, 1);
    return (
      <Zoom z={freia(t, 0, 2, 1.55, 1.68)} ox={540} oy={1040}>
        <RuaFundo t={t} noite semAurora gente={false} transito={false} semPoste />
        <Tela>
          <Poste x={250} y={1640} e={1.5} />
          <LambeLambe x={250} y={1260} e={0.72} a={-4} />
          <ConeDePoste x={415} y={300} base={1660} l={420} />
          <OlheiroBloco x={540} y={1650} escala={0.95} olhosVerdes={verde} boca="neutra" olha={-0.7} semente="olheiro" pose={{ bracoD: 34, antebracoD: -108, cabeca: -3 }} />
          <ellipse cx={540} cy={1010} rx={230} ry={300} fill={COR.aurora} opacity={0.08 * verde} style={{ filter: "blur(40px)" }} />
        </Tela>
        <Molhado t={t} luzes={[{ x: 430, y: 1668, cor: "#FFD9A0", forca: 0.75, l: 190, h: 260 }, { x: 540, y: 1668, cor: "#3CF0A0", forca: 0.22, l: 90, h: 200 }]} />
        <Escuro x={500} y={1000} r={540} forca={0.76} />
        <Chuva forca={0.42} />
        <Respingos />
      </Zoom>
    );
  }
  if (t < c1) {
    // o olhar dele: o carro brilhando de leve no verde
    const tt = t - c0;
    return (
      <Zoom z={1.35 + tt * 0.1} ox={540} oy={1650}>
        <RuaFundo t={t} noite semAurora gente={false} transito={false} semPoste perto={<CasaDenis cortina={0.5} />} ruaFrente />
        <Tela>
          <CarroPreto x={540} y={1900} e={2.7} olho={1} />
        </Tela>
        <AbsoluteFill style={{ background: COR.aurora, opacity: 0.07, mixBlendMode: "screen" }} />
        <ChuvaEscura x={540} y={1600} r={820} forca={0.54} />
      </Zoom>
    );
  }
  if (t < c2) {
    // rua do Jonas. Lá no parapeito da padaria, o Jonas do tamanho de uma caneta
    const tt = t - c1;
    return (
      <AbsoluteFill>
        <Lembra>
          <Zoom z={1.08 + tt * 0.03} ox={540} oy={1500}>
            <RuaFundo t={t} noite semAurora gente={false} transito={false} perto={<Padaria x={-60} y={1570} e={1.6} />} ruaFrente semPoste />
            <Tela>
              <Gente x={190} y={1300} e={0.13} cor="#4B7FB3" pele="#D9A27A" olhos="espanto" boca="o" olha={0.5} semente="jonasPeq" />
              <CarroPreto x={540} y={1900} e={2.5} olho={0.8} />
            </Tela>
          </Zoom>
        </Lembra>
        <AbsoluteFill style={{ background: COR.aurora, opacity: 0.05, mixBlendMode: "screen" }} />
        <Placa s={tt} de={0.05} ate={1.3} nome="JONAS, 23" desc="O QUE ENCOLHE (EP. 1)" x={540} y={560} />
      </AbsoluteFill>
    );
  }
  if (t < c3) {
    const tt = t - c2;
    return (
      <AbsoluteFill>
        <Lembra>
          <Zoom z={1.08 + tt * 0.03} ox={540} oy={1500}>
            <RuaFundo t={t} noite semAurora gente={false} transito={false} perto={<GuaritaFora x={660} y={1730} e={2.1} noite />} ruaFrente semPoste />
            <Tela>
              <SeuEdson x={230} y={1730} escala={0.95} olha={0.6} olhos="espanto" gesto={false} />
              <CarroPreto x={590} y={1900} e={2.5} olho={0.8} />
            </Tela>
          </Zoom>
        </Lembra>
        <AbsoluteFill style={{ background: COR.aurora, opacity: 0.05, mixBlendMode: "screen" }} />
        <Placa s={tt} de={0.05} ate={1.3} nome="SEU EDSON, 61" desc="ATRAVESSA PAREDE (EP. 3)" x={540} y={560} />
      </AbsoluteFill>
    );
  }
  if (t < c4) {
    // a casa 317: a porta fechada e a caixa preta ainda lá
    const tt = t - c3;
    return (
      <AbsoluteFill>
        <Lembra>
          <Zoom z={1.08 + tt * 0.03} ox={540} oy={1500}>
            <RuaFundo t={t} noite semAurora gente={false} transito={false} perto={<PortaDeCasa x={540} />} ruaFrente semPoste />
            <Tela>
              <Caixa x={770} y={1640} e={0.72} />
              <CarroPreto x={420} y={1900} e={2.5} olho={0.8} />
            </Tela>
          </Zoom>
        </Lembra>
        <AbsoluteFill style={{ background: COR.aurora, opacity: 0.05, mixBlendMode: "screen" }} />
        <Placa s={tt} de={0.05} ate={1.2} nome="KAIQUE, 20" desc="O RAIO-X (EP. 4)" x={540} y={560} />
      </AbsoluteFill>
    );
  }
  // close na prancheta: ele circula os nomes, um por um, e escreve em cima
  const tt = t - c4;
  const NOMES = ["JONAS", "BRUNO", "SEU EDSON", "KAIQUE", "DENIS"];
  const PASSO = 0.25;
  const fimN = NOMES.length * PASSO;
  const escreve = interpolate(tt, [fimN, fimN + 0.55], [0, 1], clamp);
  const nomeAtual = Math.min(NOMES.length - 1, Math.floor(tt / PASSO));
  const noCirculo = tt < fimN;
  const ang = ((tt % PASSO) / PASSO) * Math.PI * 2;
  const canetaX = noCirculo ? 540 + Math.cos(ang) * 300 : 180 + escreve * 720;
  const canetaY = noCirculo ? 690 + nomeAtual * 150 + Math.sin(ang) * 66 : 500;
  return (
    <AbsoluteFill style={{ background: "#0A0C14" }}>
      <AbsoluteFill style={{ transform: `rotate(${-1.6 + Math.sin(tg * 0.6) * 0.3}deg) scale(${1 + tt * 0.012})`, transformOrigin: "540px 900px" }}>
        <Tela>
          <rect x={70} y={200} width={940} height={1400} rx={22} fill="#8B6A43" />
          <rect x={110} y={250} width={860} height={1310} rx={8} fill="#F0ECE0" />
          <rect x={390} y={170} width={300} height={90} rx={14} fill="#9AA0A8" />
          <rect x={410} y={190} width={260} height={18} rx={6} fill="#C9CED6" />
          <text x={540} y={345} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={62} fill="#555">
            NOITE DA AURORA · 3:17
          </text>
          <line x1={150} y1={380} x2={930} y2={380} stroke="#999" strokeWidth={4} />
          {NOMES.map((n, i) => (
            <g key={n}>
              <text x={540} y={718 + i * 150} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={92} fill={COR.tinta}>
                {n}
              </text>
              <ellipse cx={540} cy={690 + i * 150} rx={300} ry={66} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - interpolate(tt, [i * PASSO, (i + 1) * PASSO], [0, 1], clamp)} stroke="#C8322B" strokeWidth={9} fill="none" />
            </g>
          ))}
          <clipPath id="escreve">
            <rect x={100} y={390} width={880 * escreve} height={200} />
          </clipPath>
          <text x={540} y={550} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={158} letterSpacing={10} fill="#C8322B" clipPath="url(#escreve)" transform="rotate(-2 540 500)">
            GOVERNO
          </text>
          {/* a caneta e a mão */}
          <g transform={`translate(${canetaX} ${canetaY}) rotate(128) scale(0.62)`}>
            <path d="M 0 0 L -12 -44 L 12 -44 Z" fill="#26262C" />
            <rect x={-12} y={-300} width={24} height={256} fill="#2F5DA8" />
            <circle cx={-6} cy={-250} r={66} fill="#C89A72" />
            <rect x={-70} y={-720} width={126} height={470} rx={46} fill="#C89A72" />
            <rect x={-82} y={-860} width={150} height={420} rx={24} fill="#2E6B4F" />
          </g>
        </Tela>
      </AbsoluteFill>
      <Escuro x={540} y={800} r={820} forca={0.55} />
      <Chuva n={36} forca={0.18} v={1700} />
    </AbsoluteFill>
  );
};

// ---------- 11: a mensagem ----------
const Fundo: React.FC<{ t: number; frente?: React.ReactNode }> = ({ t, frente }) => <Quarto t={t} blur={6} frente={frente} />;
export const CenaQuarto: React.FC<{ t: number }> = ({ t }) => {
  const quem = clipe("d-quem").inicio - S.quarto;
  const fala = janelas(["denis"], S.quarto);
  if (t >= quem) {
    const tt = t - quem;
    return (
      <Zoom z={freia(tt, 0, 1, 1.7, 1.78)} ox={540} oy={1000}>
        <Fundo t={t} frente={<Denis casa x={540} y={1650} escala={0.95} celular olhos="espanto" boca="neutra" t={t} fala={fala} olha={0.1} gesto={false} pose={{ bracoD: 40, antebracoD: -110, cabeca: 3 }} />} />
        <AbsoluteFill style={{ background: "radial-gradient(ellipse 520px 540px at 600px 980px, rgba(130,190,255,0.26), transparent 70%)", pointerEvents: "none" }} />
        <Escuro x={590} y={990} r={470} forca={0.96} cor="3,4,12" />
      </Zoom>
    );
  }
  const tm = t - 0.15;
  const ent = freia(tm, 0, 0.3, 0, 1);
  const k = freia(tm, 0.15, 0.45, 0, 1);
  return (
    <AbsoluteFill style={{ background: "#05060C" }}>
      <AbsoluteFill style={{ transform: `translate(${Math.sin(t * 1.1) * 4}px, ${(1 - ent) * 1400 + Math.sin(t * 0.9) * 3}px)` }}>
        <Celular hora="03:17" vib={tm < 0.35 ? Math.sin(t * 90) * 3 : 0}>
          <AbsoluteFill style={{ background: "#10121A" }}>
            <div style={{ position: "absolute", top: 90, left: 0, right: 0, textAlign: "center", fontFamily: FONTE, fontWeight: 800, fontSize: 46, color: COR.aurora, letterSpacing: 2 }}>MENSAGEM NOVA</div>
            <div style={{ position: "absolute", top: 142, left: 0, right: 0, textAlign: "center", fontFamily: FONTE, fontWeight: 700, fontSize: 28, color: "#778", letterSpacing: 1 }}>@mundoparalelo.br · NÚMERO DESCONHECIDO</div>
            <div style={{ position: "absolute", left: 40, right: 40, top: 280, background: COR.creme, borderRadius: 34, padding: "40px 44px", opacity: k, transform: `scale(${0.85 + k * 0.15})`, transformOrigin: "10% 0%" }}>
              <div style={{ fontFamily: FONTE, fontWeight: 800, fontSize: 70, lineHeight: 1.08, color: COR.tinta }}>Não abre o portão, pedreiro.</div>
              <div style={{ fontFamily: FONTE, fontWeight: 800, fontSize: 70, lineHeight: 1.08, color: COR.tinta, marginTop: 18 }}>Eles têm a mesma lista que eu.</div>
              <div style={{ fontFamily: FONTE, fontWeight: 800, fontSize: 64, color: "#1FA87A", marginTop: 26, textAlign: "right" }}>— O.</div>
            </div>
          </AbsoluteFill>
        </Celular>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 42%, transparent 56%, rgba(0,0,0,0.8) 100%)", pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

// ---------- 12: o caminhão de concreto ----------
const DenisJanela: React.FC<{ t: number; z: number; olhos?: "espanto" | "normal"; fala?: [number, number][]; luz: number }> = ({ t, z, olhos = "espanto", fala, luz }) => (
  <Zoom z={z} ox={540} oy={1000}>
    <Fundo t={t} frente={<Denis casa x={540} y={1650} escala={0.95} olhos={olhos} boca="neutra" t={t} fala={fala} olha={0} gesto={false} pose={{ bracoD: 8, bracoE: 8 }} />} />
    <AbsoluteFill style={{ background: "#FF2A20", opacity: 0.1 + luz * 0.2, mixBlendMode: "screen", pointerEvents: "none" }} />
    <Escuro x={540} y={980} r={430} forca={0.96} cor="3,3,10" />
  </Zoom>
);
export const CenaCaminhao: React.FC<{ t: number }> = ({ t }) => {
  const tg = useCurrentFrame() / 30;
  const c1 = clipe("n-respirar").inicio - S.caminhao;
  const c2 = palavra("n-respirar", "Mas") - S.caminhao;
  const c3 = clipe("a-solto").inicio - S.caminhao - 0.15;
  const c4 = clipe("d-merda").inicio - S.caminhao - 0.2;
  const fim = S.final - S.caminhao;
  const luz = (Math.sin(tg * 6.3) + 1) / 2;
  if (t < c1) {
    // de ré, luz vermelha na chuva, a betoneira girando atrás do carro preto
    const x = freia(t, 0, c1 - 0.2, 2850, 1480);
    return (
      <Zoom z={1.06 + t * 0.01} ox={420} oy={1500}>
        <RuaFundo t={t} noite semAurora gente={false} transito={false} semPoste perto={<CasaDenis cortina={0.7} />} ruaFrente />
        <Tela>
          <CarroPreto x={60} y={1900} e={2.7} faroisOn={false} />
          <Betoneira x={x} y={1910} e={2.7} giro={-x * 0.3} gira={tg * 0.9} re />
        </Tela>
        <AbsoluteFill style={{ background: "#FF2A20", opacity: luz * 0.05, mixBlendMode: "screen" }} />
        <ChuvaEscura x={760} y={1480} r={900} forca={0.5} />
      </Zoom>
    );
  }
  if (t < c2) {
    return <DenisJanela t={t} z={1.7 + (t - c1) * 0.04} luz={luz} />;
  }
  if (t < c3) {
    // o tambor girando, e o concreto já começando a escorrer da bica
    const tt = t - c2;
    return (
      <AbsoluteFill>
        <Zoom z={1.5 + tt * 0.05} ox={540} oy={1500}>
          <RuaFundo t={t} noite semAurora gente={false} transito={false} semPoste perto={<CasaDenis cortina={0.7} />} ruaFrente />
          <Tela>
            <Betoneira x={1300} y={1910} e={2.7} gira={tg * 0.9} re bica={suave(tt, 0.4, 2.2, 0, 1)} />
          </Tela>
          <ChuvaEscura x={500} y={1500} r={820} forca={0.5} />
        </Zoom>
      </AbsoluteFill>
    );
  }
  if (t < c4) {
    // o agente olha direto pra janela (pra câmera)
    const tt = t - c3;
    return (
      <Zoom z={freia(tt, 0, 3, 1.72, 1.88)} ox={540} oy={1000}>
        <RuaFundo t={t} noite semAurora gente={false} transito={false} semPoste />
        <Tela>
          <CarroPreto x={760} y={1550} e={2.1} faroisOn={false} />
          <AgenteGuarda x={540} y={1650} t={t} fala={janelas(["agente"], S.caminhao)} olhos="cima" olha={0} />
        </Tela>
        <AbsoluteFill style={{ background: "#FF2A20", opacity: luz * 0.05, mixBlendMode: "screen" }} />
        <Molhado t={t} luzes={[{ x: 540, y: 1664, cor: "#FFD9A0", forca: 0.6, l: 170, h: 240 }, { x: 860, y: 1660, cor: "#FF3B30", forca: 0.35 + luz * 0.3, l: 150, h: 240 }]} />
        <Escuro x={540} y={1000} r={440} forca={0.84} />
        <Chuva forca={0.42} />
      </Zoom>
    );
  }
  // "Puta merda.", sussurrado, e apaga
  const tt = t - c4;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ opacity: interpolate(t, [fim - 0.55, fim - 0.1], [1, 0], clamp) }}>
        <DenisJanela t={t} z={2 + tt * 0.05} luz={luz} fala={janelas(["denis"], S.caminhao)} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
