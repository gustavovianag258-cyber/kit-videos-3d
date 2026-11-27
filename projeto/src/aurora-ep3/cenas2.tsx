import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { entra, FundoDiagrama, plano, Rotulo } from "../aurora/cenas2";
import { Olheiro } from "../aurora/elenco";
import { Camada, clamp, COR, Facho, FONTE, Placa, Poeira } from "../aurora/estilo";
import { CriadoMudo, Planta, Quadro, Tapete, Ventilador } from "../aurora/objetos";
import { bate, Celular } from "../aurora-ep2/cenas2";
import { Bicicleta, CarroParado, Chinelo, Cone, Extintor } from "../aurora-ep2/objetos";
import { Bruno } from "../aurora-ep2/bruno";
import { Edson } from "./edson";
import { Chiado, Faiscas, Flash, Onda, Onom, Velocidade } from "./efeitos";
import { CamaCasal, Cano, Crucifixo, GuardaRoupa, LambeLambe, LivroOcorrencias, Luminaria, Pedrinhas, Pilar, PortaoGrade, RelogioParede, Remedios, Uno } from "./objetos";
import { PropsCena } from "./cenas";

// Cenas da garagem, da queda, do livro e da casa do Seu Edson.

// ---------- fundo: garagem do subsolo ----------
const PISO = 1420;
export const Garagem: React.FC<{ t: number; blur?: number; olheiro?: number; frente?: React.ReactNode }> = ({ t, blur = 4, olheiro, frente }) => (
  <AbsoluteFill style={{ background: "#6E737C" }}>
    <Camada blur={blur}>
      <svg width={1080} height={1920}>
        <rect x={0} y={0} width={1080} height={PISO} fill="#7C818A" />
        <rect x={0} y={0} width={1080} height={300} fill="#5E626A" />
        <Cano y={180} />
        <Cano y={230} cor="#9EA3AB" />
        <Luminaria x={300} y={290} />
        <Luminaria x={800} y={290} acesa={Math.floor(t * 7) % 9 !== 0} />
        {/* manchas e infiltração */}
        <ellipse cx={600} cy={500} rx={60} ry={140} fill="rgba(30,30,30,0.12)" />
        <ellipse cx={420} cy={900} rx={90} ry={40} fill="rgba(30,30,30,0.08)" />
        {/* carro do fundo, bicicleta, cones e extintor */}
        <CarroParado x={520} y={PISO - 20} e={0.8} cor="#2F5DA8" />
        <Bicicleta x={310} y={PISO - 10} e={0.6} />
        <Extintor x={230} y={1100} e={0.9} />
        <text x={540} y={760} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={44} fill="#F2C230" opacity={0.85}>
          VAGA 12 · AP 31
        </text>
        <Pilar x={120} y={PISO} numero="12" />
        <Pilar x={960} y={PISO} numero="13" />
        <LambeLambe x={960} y={640} e={0.7} />
        {olheiro !== undefined && (
          <g>
            <Olheiro x={905} y={PISO} escala={0.75} olhosVerdes={olheiro} />
            <Pilar x={960} y={PISO} numero="13" />
            <LambeLambe x={960} y={640} e={0.7} />
          </g>
        )}
      </svg>
    </Camada>
    <svg width={1080} height={1920} style={{ position: "absolute" }}>
      <rect x={0} y={PISO} width={1080} height={1920 - PISO} fill="#5A5E66" />
      {[-200, 260, 720, 1180].map((x) => (
        <path key={x} d={`M ${x} ${PISO} L ${x - 160} 1920`} stroke="#E6C84A" strokeWidth={10} />
      ))}
      <ellipse cx={300} cy={1700} rx={120} ry={20} fill="rgba(0,0,0,0.15)" />
      <Cone x={80} y={1600} e={0.9} />
      <Cone x={1020} y={1700} e={0.8} />
    </svg>
    {frente}
  </AbsoluteFill>
);

// ---------- Cena 1 e 10: sai do chão feito rolha e cai no capô ----------
// O Edson sai do chão em x=360 e cai deitado no teto do Uno.
const UNO_X = 640;
const UNO_Y = 1760;
const TETO = UNO_Y - 250 * 1.1;
export const CenaRolha: React.FC<PropsCena & { gancho?: boolean }> = ({ t, fala, gancho }) => {
  const f = useCurrentFrame();
  const sai = 0.3;
  const pousa = 1.05;
  const k = interpolate(t, [sai, pousa], [0, 1], clamp);
  const voando = t >= sai && t < pousa;
  // parábola do chão (360, PISO+60) até o teto do Uno
  const x = interpolate(k, [0, 1], [360, UNO_X + 60]);
  const y = interpolate(k, [0, 1], [PISO + 80, TETO - 70]) - Math.sin(k * Math.PI) * 650;
  const giro = interpolate(k, [0, 1], [0, -450]);
  const brilho = interpolate(t, [0, sai, sai + 0.5], [0.3, 1, 0], clamp);
  const tremor = t > pousa && t < pousa + 0.25 ? Math.sin(t * 90) * 10 : 0;
  const pisca = t > pousa && Math.floor((t - pousa) * 4) % 2 === 0;
  const zoom = gancho ? interpolate(t, [0, 3], [1.0, 1.12]) : interpolate(t, [0, 2.6], [1.05, 1.18]);
  const quepeY = interpolate(t, [sai, sai + 0.7, sai + 1.6], [PISO, 520, PISO - 30], clamp);
  return (
    <AbsoluteFill style={{ transform: `scale(${zoom}) translate(${tremor}px, ${tremor * 0.5}px)`, transformOrigin: "55% 62%" }}>
      <Garagem
        t={t}
        frente={
          <svg width={1080} height={1920} style={{ position: "absolute" }}>
            {/* rachadura brilhando no piso */}
            <ellipse cx={360} cy={PISO + 90} rx={170} ry={36} fill={COR.aurora} opacity={0.7 * brilho} style={{ filter: "blur(12px)" }} />
            <path d="M 260 1510 l 40 -14 l 30 18 l 40 -20 l 34 16 l 40 -10" stroke={COR.aurora} strokeWidth={6} fill="none" opacity={brilho} />
            <Uno x={UNO_X} y={UNO_Y} e={1.1} pisca={pisca} amassado={t > pousa ? 16 : 0} />
            {t < sai && <Edson x={360} y={PISO + 260} escala={0.8} semPernas fantasma={1} prende={1} />}
            {voando && <Edson x={x} y={y + 300} escala={0.8} olhos="espanto" boca="aberta" rot={giro} pose={{ bracoE: 140, bracoD: 140, pernaE: 30, pernaD: -30 }} />}
            {t >= pousa && (
              <Edson x={UNO_X + 300} y={TETO - 70} escala={0.8} rot={-90} olhos="espanto" boca={gancho ? "aberta" : bate(t, fala)} pose={{ bracoE: 120, bracoD: 60, pernaE: 20, pernaD: -10 }} />
            )}
            {/* pedaços de concreto */}
            {t > sai &&
              t < sai + 0.9 &&
              new Array(10).fill(0).map((_, i) => {
                const tt = t - sai;
                const vx = Math.cos(i * 1.7) * 380;
                const vy = -600 - (i % 4) * 160;
                return <rect key={i} x={360 + vx * tt} y={PISO + 80 + vy * tt + 1400 * tt * tt} width={22} height={18} fill="#8C8F96" transform={`rotate(${i * 40 + tt * 500} ${360 + vx * tt} ${PISO + 80 + vy * tt + 1400 * tt * tt})`} />;
              })}
            {/* o quepe voando */}
            {t > sai && (
              <g transform={`translate(${360 + (t - sai) * 160} ${quepeY}) rotate(${(t - sai) * 400})`}>
                <path d="M -50 0 Q -48 -40 0 -42 Q 48 -40 50 0 Z" fill="#26324F" />
                <path d="M -50 0 Q 0 16 50 0 L 56 6 Q 0 30 -56 6 Z" fill="#14141A" />
              </g>
            )}
          </svg>
        }
      />
      <Poeira semente={`r${f % 2}`} n={14} cor="200,200,200" />
      <Faiscas t={t - sai} x={360} y={PISO + 60} n={22} raio={320} semente="rolha" />
      <Onda t={t - sai + 0.15} x={360} y={PISO + 90} rx={240} ry={50} />
      <Onom t={t - sai} texto="CRACK!" x={300} y={1200} tam={110} ang={-10} dur={0.7} />
      <Flash t={t - pousa} forca={0.35} />
      <Onom t={t - pousa} texto="TUM!" x={860} y={1180} tam={140} ang={8} dur={0.8} cor={COR.vermelho} />
    </AbsoluteFill>
  );
};

// ---------- Cena 9: a queda pela terra ----------
const PX_M = 130; // pixels por metro
export const CenaQueda: React.FC<PropsCena & { mmm: number; japao: number; volta: number; wVinte: number; wSempre: number }> = ({ t, mmm, japao, volta, wVinte, wSempre }) => {
  const p = plano(t, [mmm, japao]);
  // profundidade (m): passa a garagem em ~1 s e chega a 20 m quando o narrador fala "vinte"
  const d = interpolate(t, [0.2, 1.0, mmm, wVinte], [0, 3.2, 12, 20], { ...clamp, easing: (x) => x });
  const medidor = (
    <div style={{ position: "absolute", right: 60, top: 260, textAlign: "right", fontFamily: FONTE, color: "#fff" }}>
      <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: 6, opacity: 0.8 }}>PROFUNDIDADE</div>
      <div style={{ fontSize: 120, fontWeight: 700, color: d >= 19.5 ? COR.amarelo : "#fff" }}>−{Math.round(d)} m</div>
    </div>
  );
  if (p === 0) {
    const ED_Y = 980;
    const camada = (m: number) => ED_Y + (m - d) * PX_M;
    return (
      <AbsoluteFill style={{ background: "#0A0A0E" }}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          {/* guarita (0 m) e o ar da garagem (0,3 a 3 m) */}
          <rect x={0} y={camada(-4)} width={1080} height={4 * PX_M} fill="#3E3650" opacity={0.5} />
          <rect x={0} y={camada(0)} width={1080} height={0.3 * PX_M} fill="#6E737C" />
          <rect x={0} y={camada(0.3)} width={1080} height={2.7 * PX_M} fill="#2A2C32" opacity={0.6} />
          <g opacity={0.35}>
            <Uno x={760} y={camada(3)} e={0.9} />
          </g>
          <rect x={0} y={camada(3)} width={1080} height={0.3 * PX_M} fill="#6E737C" />
          <rect x={0} y={camada(3.3)} width={1080} height={4000} fill="#3A2A1E" />
          <g transform={`translate(0 ${camada(3.3)})`}>
            <Pedrinhas semente="q1" n={60} />
            <rect x={-10} y={1.4 * PX_M} width={1100} height={40} fill="#5C6068" />
            <text x={60} y={1.4 * PX_M - 14} fontFamily={FONTE} fontWeight={800} fontSize={30} fill="#9EA3AB">
              CANO
            </text>
          </g>
        </svg>
        {/* cego: só o contorno verde dele aparece */}
        <AbsoluteFill style={{ background: "rgba(0,0,0,0.45)" }} />
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Edson x={540} y={ED_Y + 300} escala={0.8} prende={1} fantasma={1} olhos="espanto" rot={Math.sin(t * 3) * 8} pose={{ bracoE: 150, bracoD: 150, pernaE: 14, pernaD: -14 }} />
        </svg>
        <Velocidade t={t} n={26} forca={0.35} cor="160,255,210" />
        {[
          [0, "GUARITA"],
          [3, "GARAGEM"],
          [3.6, "TERRA"],
        ].map(([m, r]) => (
          <Rotulo key={r as string} x={180} y={camada(m as number) - 30} texto={r as string} tam={46} cor="#9EA3AB" />
        ))}
        {medidor}
      </AbsoluteFill>
    );
  }
  if (p === 1) {
    // close: bochecha cheia, no breu, a terra passando pra cima
    const tt = t - mmm;
    return (
      <AbsoluteFill style={{ background: "#120C08" }}>
        <svg width={1080} height={1920} style={{ position: "absolute", opacity: 0.5 }}>
          <Pedrinhas semente="q2" n={50} dy={tt * 2600} cor="#4A3426" />
        </svg>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Edson x={540} y={1860} escala={1.9} prende={1} fantasma={0.8} olhos="espanto" rot={Math.sin(tt * 5) * 4} pose={{ bracoE: 160, bracoD: 160 }} />
        </svg>
        <Velocidade t={tt} n={30} forca={0.4} cor="160,255,210" />
        {medidor}
      </AbsoluteFill>
    );
  }
  // a Terra cortada ao meio: de São Paulo até o mar perto do Japão, e de volta (ioiô)
  const tt = t - japao;
  const R = 380;
  const ang = (-118 * Math.PI) / 180;
  const sp = { x: 540 + Math.cos(ang) * R, y: 820 + Math.sin(ang) * R };
  const ida = interpolate(tt, [0.3, 2.4], [0, 1], { ...clamp, easing: (x) => (1 - Math.cos(x * Math.PI)) / 2 });
  const osc = t >= volta ? (1 - Math.cos((t - volta) * 2.6 + Math.PI)) / 2 : ida;
  const pos = { x: sp.x + (1080 - 2 * sp.x) * osc, y: sp.y + (1640 - 2 * sp.y) * osc };
  return (
    <FundoDiagrama>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <circle cx={540} cy={820} r={R} fill="#5A3E2A" />
        <circle cx={540} cy={820} r={R - 26} fill="#C8501E" />
        <circle cx={540} cy={820} r={R * 0.55} fill="#E88A2A" />
        <circle cx={540} cy={820} r={R * 0.2} fill="#F6D04A" />
        <line x1={sp.x} y1={sp.y} x2={1080 - sp.x} y2={1640 - sp.y} stroke="#fff" strokeWidth={5} strokeDasharray="14 12" opacity={0.8} />
        <circle cx={sp.x} cy={sp.y} r={14} fill={COR.amarelo} />
        <circle cx={1080 - sp.x} cy={1640 - sp.y} r={14} fill="#7FB3E8" />
        <circle cx={pos.x} cy={pos.y} r={26} fill={COR.aurora} />
        <circle cx={pos.x} cy={pos.y} r={60} fill={COR.aurora} opacity={0.3} style={{ filter: "blur(10px)" }} />
      </svg>
      <Rotulo x={sp.x - 20} y={sp.y - 60} texto="SÃO PAULO" tam={46} cor={COR.amarelo} />
      <Rotulo x={1080 - sp.x - 60} y={1640 - sp.y + 175} texto="MAR, PERTO DO JAPÃO" tam={46} cor="#9FD0FF" />
      <Rotulo x={540} y={300} texto={t >= wSempre ? "PRA SEMPRE" : t >= volta ? "E VOLTA…" : "~40 MIN"} tam={90} cor={t >= wSempre ? COR.vermelho : "#fff"} op={entra(tt, 1.6)} />
    </FundoDiagrama>
  );
};

// ---------- Cena 10: o Bruno grudado no portão ----------
export const CenaBruno: React.FC<PropsCena & { corte: number; falaBruno: [number, number][] }> = ({ t, fala, corte, falaBruno }) => {
  const pisca = Math.floor(t * 4) % 2 === 0;
  if (t < corte) {
    return (
      <AbsoluteFill style={{ background: "#6E737C", transform: `scale(${1.0 + t * 0.03})`, transformOrigin: "50% 30%" }}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          {/* rampa subindo pra rua, com a luz do dia lá em cima */}
          <rect x={0} y={0} width={1080} height={1920} fill="#7C818A" />
          <rect x={300} y={180} width={480} height={420} fill="#F4E2C0" />
          <Facho x={360} largura={360} angulo={6} forca={0.3} />
          <path d="M 300 600 L 780 600 L 1080 1500 L 0 1500 Z" fill="#6B6F78" />
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <path key={i} d={`M ${300 - i * 43} ${600 + i * 128} L ${780 + i * 43} ${600 + i * 128}`} stroke="#5C6068" strokeWidth={8} />
          ))}
          <Pilar x={110} y={1500} numero="12" />
          <Pilar x={970} y={1500} numero="13" />
          <PortaoGrade x={540} y={600} largura={480} altura={420} aberto={0.32} />
          {/* o Bruno grudado de lado no portão de ferro */}
          <g transform={`translate(${Math.sin(t * 30) * 2} 0)`}>
            <Bruno x={540} y={470} escala={0.5} roupa="escola" mochila olhos="espanto" boca={bate(t, falaBruno)} brilho={0.7} pose={{ bracoE: 120, bracoD: 120, pernaE: 20, pernaD: -20 }} />
          </g>
        </svg>
        {/* primeiro plano: os sapatos do Edson deitado no teto do Uno */}
        <Camada blur={8}>
          <svg width={1080} height={1920}>
            <rect x={-20} y={1640} width={1120} height={300} rx={60} fill="#C8322B" />
            <ellipse cx={420} cy={1600} rx={80} ry={50} fill="#1E1E22" />
            <ellipse cx={640} cy={1610} rx={80} ry={50} fill="#1E1E22" />
            {pisca && <circle cx={1000} cy={1700} r={120} fill="#FFB020" opacity={0.35} />}
          </svg>
        </Camada>
        <Placa s={t} de={1.0} ate={corte - 0.1} nome="BRUNO, 17" desc="O GOLEIRO ÍMÃ (EP. 2)" x={540} y={900} />
      </AbsoluteFill>
    );
  }
  const tt = t - corte;
  return (
    <AbsoluteFill style={{ transform: `scale(${1.0 + tt * 0.02})` }}>
      <Garagem t={t} blur={10} />
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <rect x={-40} y={1580} width={1160} height={380} rx={60} fill="#C8322B" />
        <rect x={-40} y={1580} width={1160} height={24} fill="rgba(255,255,255,0.18)" />
        <Edson x={1010} y={1490} escala={1.4} rot={-90} olhos={tt > 0.4 ? "fechado" : "normal"} boca={bate(t, fala)} pose={{ bracoE: 160, antebracoE: 60, bracoD: 20 }} />
        {pisca && <circle cx={60} cy={1700} r={140} fill="#FFB020" opacity={0.3} style={{ filter: "blur(20px)" }} />}
      </svg>
    </AbsoluteFill>
  );
};

// ---------- Cena 11: o grupo do condomínio, a câmera e o livro ----------
const Bolha: React.FC<{ nome: string; cor: string; op: number; children: React.ReactNode }> = ({ nome, cor, op, children }) => (
  <div style={{ background: "#fff", borderRadius: 28, padding: "18px 26px", margin: "0 40px 22px", opacity: op, transform: `translateY(${(1 - op) * 30}px)`, boxShadow: "0 3px 8px rgba(0,0,0,0.08)" }}>
    <div style={{ fontFamily: FONTE, fontWeight: 800, fontSize: 30, color: cor }}>{nome}</div>
    <div style={{ fontFamily: FONTE, fontWeight: 700, fontSize: 44, color: COR.tinta, lineHeight: 1.12, marginTop: 4 }}>{children}</div>
  </div>
);

export const CenaLivro: React.FC<PropsCena & { camera: number; close: number }> = ({ t, fala, camera, close }) => {
  const p = plano(t, [camera, close]);
  if (p === 0) {
    const vib = t < 0.6 ? Math.sin(t * 90) * 6 : 0;
    return (
      <AbsoluteFill>
        <Garagem t={t} blur={14} />
        <Celular vib={vib} hora="06:14">
          <div style={{ position: "absolute", inset: 0, background: "#E7DED3" }} />
          {/* papel de parede do chat: a marca do canal, bem clarinha */}
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "space-around", alignItems: "center", opacity: 0.1, fontFamily: FONTE, fontWeight: 800, fontSize: 40, color: COR.tinta, transform: "rotate(-14deg)" }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i}>MUNDO PARALELO · @mundoparalelo.br</div>
            ))}
          </div>
          <div style={{ position: "absolute", top: 70, left: 0, right: 0, height: 120, background: "#2E7D5B", display: "flex", alignItems: "center", padding: "0 40px", gap: 24 }}>
            <div style={{ width: 80, height: 80, borderRadius: 40, background: COR.aurora }} />
            <div>
              <div style={{ fontFamily: FONTE, fontWeight: 800, fontSize: 44, color: "#fff" }}>Cond. Jardim Aurora</div>
              <div style={{ fontFamily: FONTE, fontWeight: 700, fontSize: 28, color: "#CDE8D6" }}>Neide, Valter (síndico), +38</div>
            </div>
          </div>
          <div style={{ position: "absolute", top: 220, left: 0, right: 0 }}>
            <Bolha nome="Neide · ap 21" cor="#C0506A" op={entra(t, 0.15)}>
              Alguém viu o porteiro? Tô esperando o gás
            </Bolha>
            <Bolha nome="Valter (síndico)" cor="#2F5DA8" op={entra(t, 0.6)}>
              O EDSON TÁ EM CIMA DO MEU UNO
            </Bolha>
            <Bolha nome="Número desconhecido" cor="#1E6B4A" op={entra(t, 1.2)}>
              <svg width={600} height={340} viewBox="-260 -175 520 350" style={{ display: "block", borderRadius: 16, background: "#4A4038" }}>
                <LivroOcorrencias x={0} y={0} linhas={["02:40 ronda ok", "03:05 gato no lixo", "03:17 céu verde!!", "06:02 lixo"]} nova="06:14 — Porteiro saiu|do chão da garagem.|Tenho uma vaga|pra você. — O." />
              </svg>
              <div style={{ color: "#1E6B4A", fontWeight: 800 }}>— O.</div>
            </Bolha>
          </div>
        </Celular>
      </AbsoluteFill>
    );
  }
  if (p === 1) {
    // a câmera 2 da garagem: o Edson no Uno e, atrás do pilar, o Olheiro
    const tt = t - camera;
    const verde = tt > 0.9 ? 1 : tt > 0.4 && tt < 0.47 ? 1 : 0;
    return (
      <AbsoluteFill style={{ transform: `scale(${1.0 + tt * 0.06})`, transformOrigin: "80% 60%" }}>
        <AbsoluteFill style={{ filter: "saturate(0.25) contrast(1.1) brightness(0.9)" }}>
          <Garagem t={t} blur={0} olheiro={verde} />
          <svg width={1080} height={1920} style={{ position: "absolute" }}>
            <Uno x={UNO_X - 140} y={UNO_Y} e={1.0} pisca={Math.floor(t * 4) % 2 === 0} amassado={16} />
            <Edson x={UNO_X + 120} y={UNO_Y - 250 - 60} escala={0.7} rot={-90} olhos="normal" celular pose={{ bracoD: 140, antebracoD: 40 }} />
          </svg>
        </AbsoluteFill>
        {/* os olhos verdes furam o preto e branco da câmera */}
        {verde > 0 && (
          <svg width={1080} height={1920} style={{ position: "absolute" }}>
            {[-40, 40].map((ex) => (
              <circle key={ex} cx={905 + ex * 0.75} cy={PISO - 505 * 0.75} r={22} fill={COR.aurora} style={{ filter: "blur(4px)" }} />
            ))}
          </svg>
        )}
        <Chiado t={tt} />
        <AbsoluteFill style={{ background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 3px, rgba(0,0,0,0) 3px, rgba(0,0,0,0) 8px)" }} />
        <div style={{ position: "absolute", left: 50, top: 230, fontFamily: "monospace", fontSize: 44, color: "#E8FFE8" }}>CAM 2 · GARAGEM</div>
        <div style={{ position: "absolute", right: 50, top: 230, fontFamily: "monospace", fontSize: 44, color: "#E8FFE8" }}>06:14:{String(20 + Math.floor(tt)).padStart(2, "0")}</div>
        <div style={{ position: "absolute", left: 50, top: 290, width: 26, height: 26, borderRadius: 13, background: Math.floor(t * 2) % 2 ? "#E04040" : "transparent" }} />
      </AbsoluteFill>
    );
  }
  const tt = t - close;
  return (
    <AbsoluteFill style={{ transform: `scale(${1.02 + tt * 0.03})` }}>
      <Garagem t={t} blur={10} />
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <Edson x={540} y={1860} escala={1.75} olhos="normal" boca={bate(t, fala)} celular pose={{ bracoD: 34, antebracoD: 78, cabeca: -8 }} />
      </svg>
    </AbsoluteFill>
  );
};

// ---------- Cena 12: em casa, a apneia ----------
const LEITO_Y = 1120; // linha de cima do colchão
export const CenaCasa: React.FC<PropsCena & { ronco: number; fimRonco: number; queda: number; wQuinhentos: number }> = ({ t, ronco, fimRonco, queda, wQuinhentos }) => {
  const p = plano(t, [ronco, queda]);
  const deita = interpolate(t, [0, 0.45], [0, 1], { ...clamp, easing: (x) => x * x });
  const afunda = p === 2 ? interpolate(t, [queda + 0.3, queda + 2.4], [0, 1], { ...clamp, easing: (x) => x * x }) : 0;
  const roncando = t >= ronco && t < fimRonco;
  const bocaRonco = roncando ? (Math.floor((t - ronco) * 1.4) % 2 === 0 ? "aberta" : "o") : "neutra";
  const fantasma = p === 2 ? interpolate(t, [queda, queda + 0.3], [0, 1], clamp) : 0;
  const zoom = p === 1 ? 2.1 + (t - ronco) * 0.03 : 1.05 + t * 0.01;
  const origem = p === 1 ? "300px 660px" : "50% 70%";
  // deitado: pés à direita, cabeça no travesseiro
  const edson = (
    <Edson
      x={interpolate(deita, [0, 1], [600, 760])}
      y={interpolate(deita, [0, 1], [1400, LEITO_Y - 60 + afunda * 420])}
      escala={0.82}
      rot={interpolate(deita, [0, 1], [0, -90])}
      olhos={deita > 0.5 ? "fechado" : "normal"}
      boca={bocaRonco}
      fantasma={fantasma}
      pose={{ bracoE: 20, bracoD: 20 }}
    />
  );
  return (
    <AbsoluteFill style={{ background: "#E9D3B0", transform: `scale(${zoom})`, transformOrigin: origem }}>
      <Camada blur={p === 1 ? 6 : 3}>
        <svg width={1080} height={1920}>
          <rect x={0} y={0} width={1080} height={1320} fill="#E9D3B0" />
          <rect x={0} y={900} width={1080} height={420} fill="#DCC29C" />
          {/* janela com cortina e a tarde lá fora */}
          <rect x={660} y={300} width={320} height={380} rx={8} fill="#F6C98A" />
          <rect x={814} y={300} width={12} height={380} fill="#C9A57A" />
          <path d="M 640 290 h 100 q -30 200 10 400 h -110 Z M 1000 290 h -100 q 30 200 -10 400 h 110 Z" fill="#7FA36A" opacity={0.9} />
          <GuardaRoupa x={170} y={1320} />
          <Quadro x={520} y={430} />
          <Crucifixo x={560} y={700} />
          <RelogioParede x={400} y={250} hora={2} minuto={0} />
          <Ventilador x={1000} y={1320} t={t} />
          <Planta x={70} y={1320} />
        </svg>
      </Camada>
      <Facho x={600} largura={480} angulo={20} forca={0.3} cor="255,210,150" />
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <rect x={0} y={1320} width={1080} height={600} fill="#B07A4E" />
        <Tapete x={540} y={1560} e={1.3} />
        <Chinelo x={330} y={1560} cor="#2F5DA8" />
        <Chinelo x={400} y={1580} cor="#2F5DA8" />
        <CriadoMudo x={960} y={1320} e={0.9} />
        <Remedios x={950} y={1140} e={1.1} />
        <CamaCasal x={520} y={1320} afunda={afunda * 60 + deita * 16} />
        <defs>
          <clipPath id="colchao">
            <rect x={0} y={0} width={1080} height={LEITO_Y + 6} />
          </clipPath>
        </defs>
        <g clipPath={deita > 0.99 ? "url(#colchao)" : undefined}>{edson}</g>
        {p === 2 && <ellipse cx={540} cy={LEITO_Y + 10} rx={360} ry={40} fill={COR.aurora} opacity={0.5 * fantasma} style={{ filter: "blur(16px)" }} />}
        {roncando &&
          [0, 1, 2].map((i) => {
            const k = ((t - ronco) * 0.8 + i / 3) % 1;
            return (
              <text key={i} x={300 + k * 120} y={1000 - k * 260} fontFamily={FONTE} fontWeight={800} fontSize={60 + k * 40} fill={COR.tinta} opacity={1 - k}>
                Z
              </text>
            );
          })}
      </svg>
      {p === 2 && <Poeira semente="casa" n={16} cor="160,255,210" />}
      {p === 2 && <Onda t={t - queda - 0.2} x={420} y={LEITO_Y + 10} rx={320} ry={50} />}
      {p === 2 && <Faiscas t={t - queda - 0.2} x={420} y={LEITO_Y - 40} n={20} semente="cama" />}
      {p === 2 && <Rotulo x={540} y={420} texto="10 s = 500 m" tam={110} cor={COR.amarelo} op={entra(t, wQuinhentos)} />}
    </AbsoluteFill>
  );
};

