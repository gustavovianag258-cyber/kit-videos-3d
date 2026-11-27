import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Aurora, Estrelas, Sobrado } from "../aurora/cenas";
import { entra, FundoDiagrama, plano, Rotulo } from "../aurora/cenas2";
import { Camada, Cartao, clamp, COR, Facho, FONTE, Placa, Poeira } from "../aurora/estilo";
import { Arvore, Bicicleta, Cachorro, Orelhao, Picho } from "../aurora-ep2/objetos";
import { bate } from "../aurora-ep2/cenas2";
import { Edson } from "./edson";
import { Faiscas, Flash, Onda, Onom, tremor, Velocidade } from "./efeitos";
import {
  AdesivoChaveiro,
  CalendarioBorracharia,
  Chaveiro,
  Cadeirao,
  CamElevador,
  CamGaragem,
  CamRua,
  Conteiner,
  Fedor,
  Fios,
  Garrafa,
  GuaritaFora,
  LivroOcorrencias,
  Monitor,
  PainelChaves,
  PortaoGrade,
  Poste,
  Predio,
  Radinho,
  SacoLixo,
  Santinho,
  VentiladorMesa,
} from "./objetos";

// Cenas da rua, da guarita e dos diagramas do ep. 3. Cada cena recebe `fala` (janelas em s,
// relativas à cena, em que a boca do Seu Edson mexe) e os cortes presos às palavras.

type Janela = [number, number];
export type PropsCena = { t: number; fala?: Janela[] };

// ---------- fundos ----------
// Rua do prédio de manhã cedo (ou de madrugada, com o céu verde). `dentro` desenha o que se vê
// pelo vidro da guarita; `frente` entra entre o cenário e o primeiro plano.
export const Rua: React.FC<{ t: number; noite?: boolean; portao?: number; dentro?: React.ReactNode; frente?: React.ReactNode; chao?: React.ReactNode }> = ({
  t,
  noite,
  portao = 0,
  dentro,
  frente,
  chao,
}) => (
  <>
    <AbsoluteFill style={{ background: noite ? "linear-gradient(180deg,#070B1E 0%,#1A1640 50%,#3F2D57 100%)" : "linear-gradient(180deg,#7C8FC4 0%,#C9A6C0 45%,#F4B88A 75%)" }}>
      {noite && (
        <>
          <Estrelas altura={900} />
          <Aurora altura={1000} />
        </>
      )}
    </AbsoluteFill>
    <Camada blur={6} dx={-t * 3}>
      <svg width={1080} height={1920}>
        {[
          [-80, 300, 520],
          [700, 360, 640],
          [980, 260, 420],
        ].map(([x, l, a], i) => (
          <Sobrado key={i} x={x} base={1300} l={l} a={a} cor={noite ? "#231B3C" : "#B79A8A"} acesa={noite && i === 1 ? 0 : -1} />
        ))}
        <Fios y={230} />
      </svg>
    </Camada>
    <svg width={1080} height={1920} style={{ position: "absolute" }}>
      <Predio x={380} y={1500} e={0.95} noite={noite} />
      <PortaoGrade x={250} y={1500} largura={300} altura={330} aberto={portao} />
      <GuaritaFora x={830} y={1500} e={0.95} noite={noite}>
        {dentro}
      </GuaritaFora>
      <Picho x={700} y={1430} cor={noite ? "#2A2230" : "#5A3E6A"} />
      {/* calçada e rua */}
      <rect x={0} y={1500} width={1080} height={150} fill={noite ? "#4A4458" : "#B8B2AA"} />
      {new Array(12).fill(0).map((_, i) => (
        <rect key={i} x={i * 96} y={1500} width={4} height={150} fill="rgba(0,0,0,0.12)" />
      ))}
      <rect x={0} y={1640} width={1080} height={26} fill={noite ? "#5A5468" : "#D4CEC6"} />
      <rect x={0} y={1666} width={1080} height={254} fill={noite ? "#24222C" : "#4A4C55"} />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={i * 260 - ((t * 0) % 260)} y={1790} width={140} height={14} fill="#E8E2C8" opacity={0.8} />
      ))}
      {chao}
      <Arvore x={40} y={1560} e={0.9} cor={noite ? "#2E4A30" : "#4E8A43"} />
      <Poste x={1020} y={1640} />
      <Bicicleta x={960} y={1640} e={0.6} />
      <Orelhao x={590} y={1560} e={0.7} />
    </svg>
    {frente}
  </>
);

// Guarita por dentro: mesa, monitores, painel de chaves, calendário e o vidro pra rua.
export const GuaritaDentro: React.FC<{ t: number; noite?: boolean; hora: string; olheiro?: number; children?: React.ReactNode; mesa?: React.ReactNode; blur?: number }> = ({
  t,
  noite,
  hora,
  olheiro = -1,
  children,
  mesa,
  blur = 3,
}) => (
  <AbsoluteFill style={{ background: noite ? "#3E3650" : "#D8C7A6" }}>
    <Camada blur={blur}>
      <svg width={1080} height={1920}>
        <rect x={0} y={0} width={1080} height={1920} fill={noite ? "#4A4060" : "#E2D2B2"} />
        <rect x={0} y={1240} width={1080} height={20} fill={noite ? "#2E2840" : "#B8A684"} />
        {/* vidro pra rua */}
        <rect x={40} y={260} width={520} height={520} rx={10} fill={noite ? "#14112A" : "#A9CBE0"} />
        <svg x={40} y={260} width={520} height={520}>
          {noite ? (
            <>
              <rect width={520} height={520} fill="url(#ceuVerde)" />
              <defs>
                <linearGradient id="ceuVerde" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#0B2A26" />
                  <stop offset="0.5" stopColor="#1E7A5C" />
                  <stop offset="1" stopColor="#2B2050" />
                </linearGradient>
              </defs>
              <ellipse cx={260} cy={160} rx={300} ry={90} fill={COR.aurora} opacity={0.35 + 0.1 * Math.sin(t * 2)} style={{ filter: "blur(30px)" }} />
              <Sobrado x={-20} base={520} l={200} a={260} cor="#1A1430" />
              <Sobrado x={280} base={520} l={260} a={200} cor="#1A1430" acesa={1} />
            </>
          ) : (
            <>
              <rect width={520} height={300} fill="#F2C9A0" />
              <Sobrado x={-20} base={520} l={200} a={300} cor="#B79A8A" />
              <Sobrado x={280} base={520} l={260} a={240} cor="#A88BB0" />
              <rect y={440} width={520} height={80} fill="#4A4C55" />
            </>
          )}
        </svg>
        <rect x={40} y={260} width={520} height={520} rx={10} fill="none" stroke="#8C8F96" strokeWidth={18} />
        <rect x={290} y={260} width={14} height={520} fill="#8C8F96" />
        <PainelChaves x={810} y={420} e={0.9} />
        <CalendarioBorracharia x={720} y={790} e={0.8} />
        <Santinho x={900} y={790} e={0.9} />
        {/* monitores das câmeras em 2x2 */}
        <rect x={600} y={880} width={460} height={20} fill="#6E4C34" />
        <Monitor x={720} y={1010} e={0.62} cam="CAM 4 · RUA" hora={hora}>
          <CamRua olheiro={olheiro} />
        </Monitor>
        <Monitor x={940} y={1010} e={0.62} cam="CAM 2 · GARAGEM" hora={hora}>
          <CamGaragem />
        </Monitor>
        <Monitor x={720} y={1180} e={0.62} cam="CAM 3 · ELEV." hora={hora}>
          <CamElevador />
        </Monitor>
        <Monitor x={940} y={1180} e={0.62} cam="CAM 1 · PORTÃO" hora={hora}>
          <CamRua />
        </Monitor>
        <Cadeirao x={420} y={1640} e={1.1} />
      </svg>
    </Camada>
    {children}
    {/* mesa em primeiro plano */}
    <svg width={1080} height={1920} style={{ position: "absolute" }}>
      <rect x={-20} y={1380} width={1120} height={40} fill="#8B6A43" />
      <rect x={-20} y={1420} width={1120} height={500} fill="#6E4C34" />
      <rect x={60} y={1460} width={300} height={120} rx={8} fill="#5E402A" />
      <circle cx={210} cy={1520} r={10} fill="#C9A43A" />
      <Radinho x={140} y={1385} e={0.9} />
      <Garrafa x={930} y={1385} e={0.8} />
      <VentiladorMesa x={1010} y={1385} e={0.7} t={t} />
      {mesa}
    </svg>
  </AbsoluteFill>
);

// ---------- Cena 3: guarita, 3:17 ----------
export const CenaGuarita: React.FC<PropsCena & { corte?: number }> = ({ t, fala, corte = 4.4 }) => {
  const p = plano(t, [corte]);
  const f = useCurrentFrame();
  if (p === 0) {
    const zoom = interpolate(t, [0, corte], [1.0, 1.1]);
    return (
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "77% 62%" }}>
        <Rua
          t={t}
          noite
          dentro={
            <g>
              <rect width={260} height={180} fill="#FFE3A0" />
              <rect x={150} y={40} width={90} height={60} fill="#2B3A33" />
              <Edson x={90} y={300} escala={0.42} olhos="cima" boca="o" quepe />
            </g>
          }
        />
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 20%, rgba(60,240,160,0.2) 0%, rgba(0,0,0,0) 60%)", mixBlendMode: "screen" }} />
        <Poeira semente="g3" n={18} cor="160,255,210" />
        <Placa s={t} de={0.5} ate={corte - 0.1} nome="SEU EDSON, 61" desc="PORTEIRO DA NOITE" x={420} y={760} />
      </AbsoluteFill>
    );
  }
  const tt = t - corte;
  const hora = `03:17:${String(Math.min(59, 2 + Math.floor(tt))).padStart(2, "0")}`;
  // o Olheiro olha pra câmera 4 por 2 quadros
  const verde = tt > 2.2 && tt < 2.27 ? 1 : 0;
  const escreve = Math.sin(f * 0.9) * 6;
  return (
    <AbsoluteFill style={{ transform: `scale(${1.05 + tt * 0.02})`, transformOrigin: "50% 60%" }}>
      <GuaritaDentro
        t={t}
        noite
        hora={hora}
        olheiro={verde}
        mesa={<LivroOcorrencias x={600} y={1520} e={0.75} linhas={["02:40 ronda ok", "03:05 gato no lixo", "03:17 céu verde!!"]} />}
      >
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Edson x={430} y={1500} escala={1.0} olhos="normal" boca={bate(t, fala)} quepe pose={{ bracoD: 34, antebracoD: 50 + escreve, cabeca: 6 }} />
        </svg>
      </GuaritaDentro>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 25% 25%, rgba(60,240,160,0.22) 0%, rgba(0,0,0,0) 50%)", mixBlendMode: "screen" }} />
    </AbsoluteFill>
  );
};

// ---------- Cena 4: o lixo, a calçada que cospe e a regra ----------
export const CenaLixo: React.FC<
  PropsCena & { prendeu: number; afunda: number; pop: number; regra: number; wSoltou: number; wDentro: number; wCuspido: number }
> = ({ t, fala, prendeu, afunda, pop, regra, wSoltou, wDentro, wCuspido }) => {
  const p = plano(t, [prendeu, afunda, pop, regra]);
  if (p === 4) {
    const tt = t - regra;
    const a = entra(tt, 0.1);
    const b = entra(t, wSoltou);
    const c = entra(t, wDentro);
    const sobe = interpolate(t, [wCuspido, wCuspido + 0.3], [0, 1], clamp);
    return (
      <FundoDiagrama>
        <Cartao s={tt} de={0} ate={99} etiqueta="REGRA DO PODER #1" texto="O AR LIGA O PODER" top={300} />
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <rect x={60} y={1120} width={960} height={10} rx={5} fill="#7FA8E0" opacity={0.6} />
          <g opacity={a}>
            <Edson x={190} y={1120} escala={0.42} prende={1} fantasma={1} olhos="fechado" />
          </g>
          <g opacity={b}>
            <Edson x={540} y={1120} escala={0.42} boca="aberta" olhos="normal" />
          </g>
          <g opacity={c}>
            {/* metade enfiada no chão e a seta do cuspe */}
            <clipPath id="regraChao">
              <rect x={700} y={0} width={400} height={1120} />
            </clipPath>
            <g clipPath="url(#regraChao)">
              <Edson x={890} y={1120 + 120 - sobe * 120} escala={0.42} olhos="espanto" boca="o" />
            </g>
            <rect x={760} y={1130} width={260} height={110} fill="#5A6A8A" opacity={0.7} />
            <path d={`M 990 ${1100 - sobe * 60} l 0 -160 m -24 30 l 24 -30 l 24 30`} stroke={COR.amarelo} strokeWidth={10} fill="none" strokeLinecap="round" opacity={sobe} />
          </g>
        </svg>
        <Faiscas t={tt - 0.1} x={190} y={1000} n={12} raio={160} semente="regra" />
        <Rotulo x={190} y={720} texto="PRENDEU O AR" tam={42} op={a} />
        <Rotulo x={540} y={720} texto="SOLTOU" tam={42} op={b} />
        <Rotulo x={880} y={720} texto="SOLTOU DENTRO" tam={42} op={c} />
        <Rotulo x={190} y={1400} texto="FANTASMA" tam={60} cor={COR.aurora} op={a} />
        <Rotulo x={540} y={1400} texto="SÓLIDO" tam={60} op={b} />
        <Rotulo x={880} y={1400} texto="CUSPIDO" tam={60} cor={COR.amarelo} op={sobe} />
      </FundoDiagrama>
    );
  }
  if (p === 1) {
    // close: cara de nojo, prende o ar
    const tt = t - prendeu;
    const k = interpolate(tt, [0, 0.4], [0, 1], clamp);
    return (
      <AbsoluteFill style={{ transform: `scale(${2.3 + tt * 0.05})`, transformOrigin: "52% 748px" }}>
        <Rua
          t={t}
          frente={
            <svg width={1080} height={1920} style={{ position: "absolute" }}>
              <Conteiner x={700} y={1580} tampa={30} />
              <Fedor x={700} y={1330} t={t} />
              <Edson x={520} y={1560} escala={0.9} prende={k} olhos={k > 0.5 ? "fechado" : "normal"} boca="neutra" pose={{ bracoD: 30, antebracoD: 40 }} />
              <SacoLixo x={430} y={1570} />
            </svg>
          }
        />
      </AbsoluteFill>
    );
  }
  if (p === 2) {
    // afunda até o joelho, verde
    const tt = t - afunda;
    const desce = interpolate(tt, [0, 0.3], [0, 150], { ...clamp, easing: (x) => x * x });
    return (
      <AbsoluteFill style={{ transform: `scale(${1.45 + tt * 0.04})`, transformOrigin: "50% 100%" }}>
        <Rua
          t={t}
          frente={
            <svg width={1080} height={1920} style={{ position: "absolute" }}>
              <Conteiner x={720} y={1600} />
              <defs>
                <clipPath id="calcada4">
                  <rect x={0} y={0} width={1080} height={1560} />
                </clipPath>
              </defs>
              <g clipPath="url(#calcada4)">
                <Edson x={520} y={1560 + desce} escala={0.85} prende={1} fantasma={1} olhos="espanto" pose={{ bracoE: 40, bracoD: 40 }} />
              </g>
              <ellipse cx={520} cy={1562} rx={120} ry={18} fill={COR.aurora} opacity={0.5} style={{ filter: "blur(8px)" }} />
              <SacoLixo x={380} y={1640} />
              <SacoLixo x={640} y={1650} cor="#3A3A44" />
            </svg>
          }
        />
        <Onda t={tt} x={520} y={1562} rx={200} ry={40} />
        <Faiscas t={tt} x={520} y={1480} semente="afunda" />
      </AbsoluteFill>
    );
  }
  if (p === 3) {
    // POP: cuspido, cai sentado na calçada
    const tt = t - pop;
    const voo = Math.sin(Math.min(1, tt / 0.45) * Math.PI) * 220;
    const sentado = tt > 0.45;
    return (
      <>
      <AbsoluteFill style={{ transform: `scale(${1.5 + tt * 0.03}) translate(${tremor(tt - 0.45, 12)}px, ${tremor(tt, 10)}px)`, transformOrigin: "50% 100%" }}>
        <Rua
          t={t}
          frente={
            <svg width={1080} height={1920} style={{ position: "absolute" }}>
              <Conteiner x={720} y={1600} />
              {!sentado && <Edson x={520} y={1560 - voo} escala={0.85} olhos="espanto" boca="aberta" pose={{ bracoE: 140, bracoD: 140, pernaE: 20, pernaD: -20 }} />}
              {sentado && (
                <Edson x={520} y={1560 + 150} escala={0.85} olhos={tt < 2 ? "espanto" : "normal"} boca={bate(t, fala)} pose={{ pernaE: 80, pernaD: -80, bracoE: 30, bracoD: 30, antebracoE: -20, antebracoD: 20, cabeca: tt < 1.5 ? 10 : 0 }} />
              )}
              {tt < 0.4 &&
                [0, 1, 2, 3, 4, 5].map((i) => (
                  <rect key={i} x={480 + Math.cos(i) * tt * 500} y={1560 - Math.abs(Math.sin(i * 2)) * tt * 600} width={18} height={14} fill="#9A948C" />
                ))}
              <SacoLixo x={380} y={1660} />
              <SacoLixo x={660} y={1660} cor="#3A3A44" />
            </svg>
          }
        />
      </AbsoluteFill>
      <Flash t={tt} forca={0.5} />
      <Onom t={tt} texto="PLOFT!" x={760} y={760} />
      <Onom t={tt - 0.45} texto="TUM!" x={300} y={1450} tam={90} ang={6} dur={0.6} />
      </>
    );
  }
  // abertura: arrastando os sacos até o contêiner
  const anda = interpolate(t, [0, prendeu], [300, 520], clamp);
  const passo = Math.sin(t * 9);
  return (
    <AbsoluteFill style={{ transform: `scale(${1.05 + t * 0.02})`, transformOrigin: "50% 100%" }}>
      <Rua
        t={t}
        frente={
          <svg width={1080} height={1920} style={{ position: "absolute" }}>
            <Conteiner x={720} y={1600} />
            <Cachorro x={180} y={1700} e={0.7} t={t} />
            <SacoLixo x={anda - 110} y={1575} />
            <SacoLixo x={anda + 110} y={1575} cor="#3A3A44" />
            <Edson x={anda} y={1560} escala={0.85} pose={{ bracoE: 20, bracoD: 20, pernaE: passo * 12, pernaD: passo * 12 }} />
          </svg>
        }
      />
      <Facho x={300} largura={500} angulo={-24} forca={0.25} cor="255,210,170" />
    </AbsoluteFill>
  );
};

// ---------- Cena 5: diagrama do empurrão ----------
const Atomo: React.FC<{ x: number; y: number; r: number; t: number; cor?: string }> = ({ x, y, r, t, cor = "#7FB3E8" }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={r} fill={cor} opacity={0.12} />
    {[0, 60, 120].map((a) => (
      <g key={a} transform={`rotate(${a})`}>
        <ellipse rx={r} ry={r * 0.36} fill="none" stroke={cor} strokeWidth={3} opacity={0.6} />
        <circle cx={Math.cos(t * 3 + a) * r} cy={Math.sin(t * 3 + a) * r * 0.36} r={9} fill={cor} />
      </g>
    ))}
    <circle r={Math.max(4, r * 0.04)} fill={COR.vermelho} />
  </g>
);

export const CenaFisica: React.FC<{ t: number; w: { atomo: number; itaquerao: number; parede: number; desliga: number; segura: number; chao: number; ar: number; luz: number } }> = ({ t, w }) => {
  const fase = plano(t, [w.atomo, w.itaquerao, w.parede, w.desliga, w.segura]);
  const zoom = 1 + (t % 4) * 0.01;
  return (
    <FundoDiagrama>
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        {fase === 0 && <Rotulo x={540} y={820} texto="SÓ QUE A FÍSICA COBRA" tam={96} cor={COR.amarelo} op={entra(t, 0.05)} />}
        {fase === 1 && (
          <>
            <svg width={1080} height={1920} style={{ position: "absolute" }}>
              <Atomo x={540} y={820} r={300 * entra(t, w.atomo, 0.4)} t={t} />
            </svg>
            <Rotulo x={540} y={1440} texto="QUASE TODO VAZIO" tam={80} op={entra(t, w.atomo + 0.3)} />
          </>
        )}
        {fase === 2 && (
          <>
            <svg width={1080} height={1920} style={{ position: "absolute" }}>
              <g transform={`translate(540 820) scale(${0.6 + 0.4 * entra(t, w.itaquerao, 0.5)})`}>
                {/* estádio visto de cima */}
                <ellipse rx={470} ry={340} fill="#5C6068" />
                <ellipse rx={420} ry={292} fill="#8C8F96" />
                {new Array(24).fill(0).map((_, i) => (
                  <line key={i} x1={Math.cos((i / 24) * Math.PI * 2) * 300} y1={Math.sin((i / 24) * Math.PI * 2) * 200} x2={Math.cos((i / 24) * Math.PI * 2) * 420} y2={Math.sin((i / 24) * Math.PI * 2) * 292} stroke="#6E7178" strokeWidth={4} />
                ))}
                <rect x={-270} y={-170} width={540} height={340} fill="#3E8E4E" />
                {[-216, -162, -108, -54, 0, 54, 108, 162, 216].map((x, i) => (
                  <rect key={x} x={x - 27} y={-170} width={54} height={340} fill={i % 2 ? "#3E8E4E" : "#47995A"} />
                ))}
                <rect x={-270} y={-170} width={540} height={340} fill="none" stroke="#fff" strokeWidth={5} />
                <line x1={0} y1={-170} x2={0} y2={170} stroke="#fff" strokeWidth={5} />
                <circle r={60} fill="none" stroke="#fff" strokeWidth={5} />
                <rect x={-270} y={-70} width={60} height={140} fill="none" stroke="#fff" strokeWidth={5} />
                <rect x={210} y={-70} width={60} height={140} fill="none" stroke="#fff" strokeWidth={5} />
                {/* o feijão (núcleo), bem no meio-campo */}
                <ellipse rx={7} ry={4.5} fill="#5A2E1A" />
              </g>
              {/* lupa no feijão */}
              <g opacity={entra(t, w.itaquerao + 0.9)}>
                <line x1={540} y1={820} x2={790} y2={480} stroke="#fff" strokeWidth={4} strokeDasharray="10 8" />
                <circle cx={820} cy={440} r={110} fill="#3E8E4E" stroke="#fff" strokeWidth={8} />
                <ellipse cx={820} cy={440} rx={60} ry={38} fill="#5A2E1A" />
                <ellipse cx={800} cy={428} rx={18} ry={9} fill="#7A4A30" />
                <path d="M 790 452 q 30 10 56 -6" stroke="#F4ECDD" strokeWidth={5} fill="none" opacity={0.7} />
              </g>
            </svg>
            <Rotulo x={540} y={1440} texto="O NÚCLEO É UM FEIJÃO" tam={80} cor={COR.amarelo} op={entra(t, w.itaquerao + 1.0)} />
          </>
        )}
        {(fase === 3 || fase === 4) && (
          <>
            <svg width={1080} height={1920} style={{ position: "absolute" }}>
              <Atomo x={330} y={820} r={190} t={t} />
              <Atomo x={750} y={820} r={190} t={t + 1} />
              {[-1, 1].map((s) => {
                const k = fase === 3 ? 1 + 0.15 * Math.sin(t * 10) : 1 - entra(t, w.desliga, 0.3);
                return (
                  <g key={s} opacity={k} transform={`translate(540 820) scale(${s} 1)`}>
                    <path d="M 40 0 L 150 0 M 120 -30 L 150 0 L 120 30" stroke={COR.vermelho} strokeWidth={14} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                );
              })}
              {fase === 4 && (
                <g>
                  <Edson x={interpolate(t, [w.desliga + 0.3, w.segura], [-150, 1230], clamp)} y={1060} escala={0.42} prende={1} fantasma={1} olhos="fechado" />
                </g>
              )}
            </svg>
            {fase === 4 && <Faiscas t={t - w.desliga} x={540} y={820} semente="desliga" />}
            <Rotulo x={540} y={460} texto={fase === 3 ? "A PAREDE É DURA PORQUE…" : "O PODER DESLIGA"} tam={66} op={entra(t, fase === 3 ? w.parede : w.desliga)} />
            <Rotulo x={540} y={1440} texto="EMPURRÃO" tam={100} cor={fase === 3 ? COR.vermelho : COR.aurora} op={entra(t, fase === 3 ? w.parede + 0.4 : w.desliga)} />
          </>
        )}
        {fase === 5 && (
          <>
            <Rotulo x={540} y={420} texto="O EMPURRÃO SEGURA…" tam={70} op={entra(t, w.segura)} />
            <svg width={1080} height={1920} style={{ position: "absolute" }}>
              {[
                [210, w.chao],
                [540, w.ar],
                [870, w.luz],
              ].map(([x, de], i) => {
                const k = entra(t, de, 0.25);
                const corta = entra(t, w.luz + 0.5, 0.2);
                return (
                  <g key={i} transform={`translate(${x} 800) scale(${k})`}>
                    <circle r={130} fill="rgba(255,255,255,0.08)" stroke="#7FA8E0" strokeWidth={4} />
                    {i === 0 && (
                      <g>
                        <rect x={-90} y={50} width={180} height={12} fill="#9EA3AB" />
                        <path d="M -40 50 L -40 -60 Q -40 -80 -20 -80 L 0 -80 L 0 10 Q 60 10 70 40 L 70 50 Z" fill={COR.amarelo} />
                      </g>
                    )}
                    {i === 1 && (
                      <g>
                        <rect x={-6} y={-90} width={12} height={60} fill="#F4ECDD" />
                        <path d="M -10 -40 Q -90 -40 -80 60 Q -60 90 -14 60 Z" fill="#E88A9A" />
                        <path d="M 10 -40 Q 90 -40 80 60 Q 60 90 14 60 Z" fill="#E88A9A" />
                      </g>
                    )}
                    {i === 2 && (
                      <g>
                        <path d="M -100 0 Q 0 -80 100 0 Q 0 80 -100 0 Z" fill="#F4F4F0" />
                        <circle r={38} fill="#5A8F5A" />
                        <circle r={18} fill={COR.tinta} />
                        <circle cx={8} cy={-8} r={6} fill="#fff" />
                      </g>
                    )}
                    <path d="M -90 -90 L 90 90 M 90 -90 L -90 90" stroke={COR.vermelho} strokeWidth={16} strokeLinecap="round" opacity={corta} />
                  </g>
                );
              })}
            </svg>
            {["CHÃO", "AR", "LUZ"].map((r, i) => (
              <Rotulo key={r} x={[210, 540, 870][i]} y={1010} texto={r} tam={64} cor={COR.amarelo} op={entra(t, [w.chao, w.ar, w.luz][i])} />
            ))}
          </>
        )}
      </AbsoluteFill>
    </FundoDiagrama>
  );
};

// ---------- Cena 6: o fôlego ----------
export const CenaFolego: React.FC<PropsCena & { corte: number }> = ({ t, fala, corte }) => {
  if (t < corte) {
    return (
      <FundoDiagrama>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <g transform="translate(540 820)">
            <rect x={-14} y={-260} width={28} height={140} rx={10} fill="#F4ECDD" opacity={0.6} />
            <path d="M -20 -130 Q -260 -150 -240 160 Q -200 260 -30 180 Z" fill={COR.aurora} opacity={0.25} stroke={COR.aurora} strokeWidth={6} />
            <path d="M 20 -130 Q 260 -150 240 160 Q 200 260 30 180 Z" fill={COR.aurora} opacity={0.25} stroke={COR.aurora} strokeWidth={6} />
          </g>
          {/* o ar atravessando direto */}
          {new Array(18).fill(0).map((_, i) => {
            const x = ((t * 420 + i * 137) % 1300) - 110;
            const y = 620 + ((i * 97) % 420);
            return <circle key={i} cx={x} cy={y} r={14} fill="#9FD0FF" opacity={0.85} />;
          })}
        </svg>
        <Rotulo x={540} y={1440} texto="O AR PASSA DIRETO" tam={84} op={entra(t, 0.3)} />
      </FundoDiagrama>
    );
  }
  const tt = t - corte;
  const n = Math.min(30, Math.floor(interpolate(tt, [0, 0.8], [0, 30], clamp)));
  const anel = interpolate(tt, [0, 0.8], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ filter: "blur(7px)", transform: "scale(1.6)", transformOrigin: "75% 70%" }}>
        <Rua t={t} />
      </AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <Edson x={540} y={1840} escala={1.7} olhos="espanto" prende={tt < 0.4 ? 1 - tt / 0.4 : 0} boca={bate(t, fala)} celular quepe pose={{ bracoD: 30, antebracoD: 70 }} />
      </svg>
      {/* anel fino de cronômetro */}
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <circle cx={540} cy={360} r={150} fill="rgba(20,20,30,0.55)" />
        <circle cx={540} cy={360} r={150} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={6} />
        <circle cx={540} cy={360} r={150} fill="none" stroke={COR.aurora} strokeWidth={8} strokeDasharray={`${anel * 942} 942`} transform="rotate(-90 540 360)" strokeLinecap="round" />
        <text x={540} y={392} textAnchor="middle" fontFamily={FONTE} fontWeight={700} fontSize={110} fill="#fff">
          {n}
        </text>
        <text x={540} y={450} textAnchor="middle" fontFamily={FONTE} fontWeight={700} fontSize={30} fill="#fff" letterSpacing={6}>
          SEGUNDOS
        </text>
      </svg>
    </AbsoluteFill>
  );
};

// ---------- Cena 7: sem atrito, a parede e o olho ----------
export const CenaParede: React.FC<PropsCena & { embalo: number; dentro: number; sai: number; cego: number; passa: number }> = ({ t, fala, embalo, dentro, sai, cego, passa }) => {
  const p = plano(t, [embalo, dentro, sai, cego]);
  if (p === 0) {
    const pe = Math.sin(t * 22) * 30;
    return (
      <AbsoluteFill style={{ transform: `scale(${1.25 + t * 0.03})`, transformOrigin: "40% 100%" }}>
        <Rua
          t={t}
          frente={
            <svg width={1080} height={1920} style={{ position: "absolute" }}>
              <Edson x={420} y={1560} escala={0.85} prende={1} fantasma={1} olhos="espanto" pose={{ pernaE: pe, pernaD: pe, bracoE: 50 + pe, bracoD: 50 - pe }} />
              {[0, 1, 2].map((i) => (
                <path key={i} d={`M ${300 + i * 20} ${1570 + i * 12} q 60 -10 120 0`} stroke="#fff" strokeWidth={5} fill="none" opacity={0.6} />
              ))}
            </svg>
          }
        />
        <Rotulo x={420} y={640} texto="SEM ATRITO" tam={90} cor={COR.amarelo} op={entra(t, 0.4)} />
      </AbsoluteFill>
    );
  }
  if (p === 1) {
    // embalo: corre e mergulha na parede da guarita (some na parede em x=670)
    const tt = t - embalo;
    const x = interpolate(tt, [0, 1.0], [-120, 820], clamp);
    const verde = x > 560 ? 1 : 0;
    const passo = Math.sin(tt * 26) * 28;
    return (
      <AbsoluteFill style={{ transform: "scale(1.15)", transformOrigin: "60% 100%" }}>
        <Rua
          t={t}
          frente={
            <svg width={1080} height={1920} style={{ position: "absolute" }}>
              <defs>
                <clipPath id="parede7">
                  <rect x={0} y={0} width={672} height={1920} />
                </clipPath>
              </defs>
              <g clipPath="url(#parede7)">
                <Edson x={x} y={1560} escala={0.8} prende={verde} fantasma={verde} olhos={verde ? "fechado" : "normal"} pose={{ pernaE: passo, pernaD: passo, bracoE: 30 - passo, bracoD: 30 + passo, tronco: 8 }} />
              </g>
              {x > 640 && <ellipse cx={672} cy={1320} rx={30} ry={200} fill={COR.aurora} opacity={0.4} style={{ filter: "blur(16px)" }} />}
            </svg>
          }
        />
        <Velocidade t={tt} vertical={false} n={14} forca={0.35} />
        <Onda t={tt - 0.75} x={672} y={1320} rx={60} ry={240} />
        <Faiscas t={tt - 0.75} x={672} y={1320} semente="entra" />
        <Rotulo x={360} y={640} texto="EMBALO" tam={90} cor={COR.amarelo} op={entra(tt, 0.1)} />
      </AbsoluteFill>
    );
  }
  if (p === 2) {
    // dentro da parede: breu
    const tt = t - dentro;
    return (
      <AbsoluteFill style={{ background: "#050507" }}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <g opacity={0.35 + 0.15 * Math.sin(tt * 12)}>
            <Edson x={540} y={1300} escala={0.9} prende={1} fantasma={1} olhos="espanto" />
          </g>
        </svg>
        <Rotulo x={540} y={600} texto="?" tam={200} cor="#fff" op={entra(tt, 0.2)} />
      </AbsoluteFill>
    );
  }
  if (p === 3) {
    // sai do outro lado, dentro da guarita, piscando
    const tt = t - sai;
    const x = interpolate(tt, [0, 0.35], [-60, 300], clamp);
    return (
      <GuaritaDentro t={t} hora="06:33:48" blur={6}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <ellipse cx={30} cy={1300} rx={40 * (1 - Math.min(1, tt / 0.6))} ry={360} fill={COR.aurora} opacity={0.5} style={{ filter: "blur(18px)" }} />
          <Edson x={x} y={1740} escala={1.45} olhos={Math.floor(tt * 6) % 3 === 0 ? "fechado" : "espanto"} prende={tt < 0.35 ? 1 : 0} fantasma={tt < 0.35 ? 1 : 0} boca={bate(t, fala)} pose={{ bracoE: 50, bracoD: 60, antebracoD: 40 }} />
        </svg>
        <Faiscas t={tt} x={120} y={1250} semente="sai" />
        <Onda t={tt} x={30} y={1300} rx={60} ry={300} />
      </GuaritaDentro>
    );
  }
  // o olho: a luz para na retina; fantasma, atravessa
  const fantasma = t >= passa;
  const tt = t - (fantasma ? passa : cego);
  return (
    <FundoDiagrama>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        {/* lâmpada */}
        <circle cx={120} cy={820} r={46} fill={COR.amarelo} />
        <circle cx={120} cy={820} r={90} fill={COR.amarelo} opacity={0.2} />
        {/* olho em corte */}
        <g transform="translate(600 820)" opacity={fantasma ? 0.55 : 1}>
          <circle r={230} fill={fantasma ? COR.aurora : "#F4F4F0"} opacity={fantasma ? 0.35 : 1} stroke={fantasma ? COR.aurora : "#C9CED6"} strokeWidth={8} />
          <path d="M 120 -195 A 230 230 0 0 1 120 195" stroke="#E0565B" strokeWidth={22} fill="none" opacity={fantasma ? 0.4 : 1} />
          <ellipse cx={-180} rx={34} ry={90} fill="#9FC0D8" opacity={0.9} />
          <rect x={-240} y={-70} width={30} height={140} fill="#5A8F5A" />
        </g>
        {[-60, 0, 60].map((dy, i) => {
          const fim = fantasma ? 1100 : 810;
          const x2 = interpolate(tt, [0, 0.6], [160, fim], clamp);
          return <line key={i} x1={160} y1={820 + dy * 0.3} x2={x2} y2={820 + dy * ((x2 - 160) / 650)} stroke={COR.amarelo} strokeWidth={8} strokeLinecap="round" />;
        })}
        {!fantasma && tt > 0.6 && <circle cx={815} cy={820} r={30} fill={COR.amarelo} opacity={0.6} style={{ filter: "blur(6px)" }} />}
      </svg>
      <Rotulo x={540} y={420} texto={fantasma ? "FANTASMA: A LUZ PASSA" : "O OLHO SEGURA A LUZ"} tam={70} op={entra(tt, 0.1)} />
      {fantasma && <Rotulo x={540} y={1440} texto="CEGO" tam={150} cor={COR.vermelho} op={entra(tt, 0.7)} />}
    </FundoDiagrama>
  );
};

// ---------- Cena 8: o portão e o atalho ----------
export const CenaPortao: React.FC<PropsCena & { atalho: number; garagem: number; segundo: number; wCego: number }> = ({ t, fala, atalho, garagem, segundo, wCego }) => {
  const p = plano(t, [atalho, garagem]);
  if (p === 0) {
    const treme = Math.sin(t * 50) * (t < 0.6 ? 6 : 0);
    const buzina = Math.floor(t * 2.5) % 2 === 0;
    return (
      <AbsoluteFill style={{ transform: `scale(${1.2 + t * 0.03})`, transformOrigin: "30% 70%" }}>
        <Rua
          t={t}
          portao={0.3}
          dentro={
            <g>
              <rect width={260} height={180} fill="#A9CBE0" />
              <Edson x={130} y={300} escala={0.42} olhos="espanto" quepe />
            </g>
          }
          frente={
            <svg width={1080} height={1920} style={{ position: "absolute" }}>
              <g transform={`translate(${treme} 0)`}>
                <ellipse cx={200} cy={1420} rx={50} ry={26} fill="#FFF4C0" opacity={0.9} style={{ filter: "blur(6px)" }} />
                <ellipse cx={300} cy={1420} rx={50} ry={26} fill="#FFF4C0" opacity={0.9} style={{ filter: "blur(6px)" }} />
              </g>
              {buzina && (
                <text x={250} y={1110} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={90} fill={COR.amarelo} transform="rotate(-8 250 1110)" style={{ textShadow: "0 4px 0 #000" }}>
                  BIIII!
                </text>
              )}
            </svg>
          }
        />
      </AbsoluteFill>
    );
  }
  if (p === 1) {
    const tt = t - atalho;
    return (
      <AbsoluteFill style={{ transform: `scale(${1.05 + tt * 0.03})` }}>
        <GuaritaDentro t={t} hora="06:40:02" blur={7}>
          <svg width={1080} height={1920} style={{ position: "absolute" }}>
            <Edson x={480} y={1740} escala={1.5} olhos={tt > 1.0 ? "normal" : "espanto"} boca={bate(t, fala)} quepe pose={{ bracoE: tt < 1.0 ? 150 : 20, antebracoE: tt < 1.0 ? 30 : 0, cabeca: tt > 1.0 ? 12 : -6 }} />
          </svg>
        </GuaritaDentro>
      </AbsoluteFill>
    );
  }
  // corte do prédio: guarita em cima, garagem embaixo, 3 metros
  const tt = t - garagem;
  const cai = interpolate(t, [segundo, segundo + 0.8], [0, 1], { ...clamp, easing: (x) => x * x });
  return (
    <FundoDiagrama>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        {/* guarita */}
        <rect x={120} y={380} width={380} height={300} fill="none" stroke="#9FC0E0" strokeWidth={8} />
        <rect x={60} y={680} width={960} height={40} fill="#7F8A9C" />
        {/* garagem */}
        <rect x={60} y={1080} width={960} height={40} fill="#7F8A9C" />
        <rect x={60} y={1120} width={960} height={800} fill="#4A3A2E" opacity={0.7} />
        <g opacity={0.6}>
          <rect x={640} y={960} width={260} height={90} rx={20} fill="#C8322B" />
          <circle cx={690} cy={1060} r={24} fill="#1E1E22" />
          <circle cx={850} cy={1060} r={24} fill="#1E1E22" />
        </g>
        <Edson x={310} y={680 + cai * 400} escala={0.42} prende={1} fantasma={1} olhos="fechado" />
        <path d="M 310 700 L 310 1080" stroke={COR.aurora} strokeWidth={6} strokeDasharray="14 12" opacity={entra(tt, 0.3)} />
        {/* cota de 3 m */}
        <g opacity={entra(tt, 0.4)}>
          <path d="M 560 700 L 560 1080 M 540 700 L 580 700 M 540 1080 L 580 1080" stroke={COR.amarelo} strokeWidth={6} />
        </g>
      </svg>
      <Rotulo x={720} y={820} texto="3 METROS" tam={70} cor={COR.amarelo} op={entra(tt, 0.4)} />
      <Rotulo x={720} y={910} texto="0,8 s" tam={70} cor="#fff" op={entra(t, segundo)} />
      <Rotulo x={310} y={300} texto="CEGO" tam={90} cor={COR.vermelho} op={entra(t, wCego)} />
      <Rotulo x={310} y={1440} texto="GUARITA → GARAGEM" tam={60} op={entra(tt, 0.2)} />
    </FundoDiagrama>
  );
};

// ---------- Cena 4b: a porta da guarita bate, com a chave lá dentro ----------
export const CenaPorta: React.FC<PropsCena & { chave: number; ou: number; atravessa: number; wChaveiro: number }> = ({ t, chave, ou, atravessa, wChaveiro }) => {
  const p = plano(t, [chave, ou]);
  if (p === 0) {
    // a porta fechando com o vento: BLAM
    const fecha = interpolate(t, [0.2, 0.5], [0.22, 1], { ...clamp, easing: (x) => x * x });
    const bate = t - 0.5;
    return (
      <>
        <AbsoluteFill style={{ background: "#CDB895", transform: `scale(${1.02 + t * 0.02}) translate(${tremor(bate, 18)}px, ${tremor(bate, 8)}px)` }}>
          <svg width={1080} height={1920} style={{ position: "absolute" }}>
            {new Array(30).fill(0).map((_, i) => (
              <rect key={i} x={(i * 197) % 1080} y={(i * 331) % 1920} width={60} height={4} fill="rgba(80,60,30,0.12)" />
            ))}
            <ellipse cx={180} cy={1500} rx={60} ry={160} fill="rgba(60,40,20,0.1)" />
            <rect x={270} y={280} width={540} height={1440} fill="#5E4630" />
            <rect x={300} y={310} width={480} height={1410} fill="#1E1A16" />
            {/* a chave lá dentro, pendurada, sumindo atrás da porta */}
            <Chaveiro x={640} y={980} e={1.2} />
            <g transform={`translate(300 0) scale(${fecha} 1)`}>
              <rect x={0} y={310} width={480} height={1410} fill="#8B6A43" />
              <rect x={40} y={360} width={400} height={560} rx={8} fill="#7A5C38" />
              <rect x={40} y={980} width={400} height={680} rx={8} fill="#7A5C38" />
              <rect x={120} y={430} width={240} height={70} rx={6} fill="#2F5DA8" />
              <text x={240} y={478} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={40} fill="#fff">
                PORTARIA
              </text>
              <rect x={110} y={560} width={260} height={50} rx={6} fill="#F2C230" />
              <text x={240} y={595} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={24} fill={COR.tinta}>
                SÓ PESSOAL AUTORIZADO
              </text>
              <circle cx={420} cy={1000} r={26} fill="#C9A43A" />
              <rect x={410} y={1040} width={20} height={40} rx={6} fill="#3A2A1A" />
            </g>
          </svg>
          {/* folhas voando com o vento */}
          <svg width={1080} height={1920} style={{ position: "absolute" }}>
            {[0, 1, 2, 3, 4].map((i) => {
              const fx = 1100 - ((t * 900 + i * 260) % 1400);
              const fy = 500 + i * 230 + Math.sin(t * 8 + i) * 40;
              return <ellipse key={i} cx={fx} cy={fy} rx={22} ry={10} fill={i % 2 ? "#6E8A3A" : "#A88A3A"} transform={`rotate(${t * 300 + i * 50} ${fx} ${fy})`} />;
            })}
          </svg>
          <Velocidade t={t} vertical={false} n={10} forca={0.25} />
        </AbsoluteFill>
        <Flash t={bate} forca={0.45} />
        <Onom t={bate} texto="BLAM!" x={540} y={700} tam={170} dur={1.0} />
      </>
    );
  }
  if (p === 1) {
    // de dentro: a chave na mesa e o Edson grudado no vidro, do lado de fora
    const tt = t - chave;
    const pulsa = 1 + 0.12 * Math.sin(tt * 10);
    return (
      <AbsoluteFill style={{ transform: `scale(${1.03 + tt * 0.03})`, transformOrigin: "50% 60%" }}>
        <GuaritaDentro t={t} hora="06:12:40" blur={2} mesa={<Chaveiro x={600} y={1395} e={1.5} />}>
          <svg width={1080} height={1920} style={{ position: "absolute" }}>
            <defs>
              <clipPath id="vidroPorta">
                <rect x={58} y={278} width={484} height={484} />
              </clipPath>
            </defs>
            <g clipPath="url(#vidroPorta)">
              <Edson x={300} y={1110} escala={1.15} olhos="espanto" boca="o" quepe pose={{ bracoE: 150, bracoD: 150, antebracoE: 20, antebracoD: 20 }} />
              <rect x={40} y={260} width={520} height={520} fill="rgba(255,255,255,0.14)" />
              <path d="M 80 300 L 220 740 M 140 300 L 280 740" stroke="rgba(255,255,255,0.3)" strokeWidth={10} />
            </g>
            <circle cx={600} cy={1440} r={110 * pulsa} fill="none" stroke={COR.amarelo} strokeWidth={8} opacity={0.9} />
          </svg>
        </GuaritaDentro>
        <Onom t={tt - 0.3} texto="TOC TOC" x={300} y={230} tam={80} ang={-4} dur={1.2} cor="#fff" />
      </AbsoluteFill>
    );
  }
  // na calçada: chaveiro (R$ 180) ou atravessar?
  const tt = t - ou;
  const decide = t >= atravessa;
  return (
    <AbsoluteFill style={{ transform: `scale(${1.3 + tt * 0.03})`, transformOrigin: "60% 100%" }}>
      <Rua
        t={t}
        frente={
          <svg width={1080} height={1920} style={{ position: "absolute" }}>
            <g opacity={entra(t, wChaveiro - 0.1, 0.2)}>
              <AdesivoChaveiro x={880} y={1250} e={1.0} />
            </g>
            <Edson
              x={500}
              y={1560}
              escala={0.85}
              olhos={decide ? "normal" : "cima"}
              boca={decide ? "sorriso" : "neutra"}
              quepe
              pose={decide ? { bracoD: 70, antebracoD: 30 } : { bracoE: 10, antebracoD: 60, bracoD: 30, cabeca: -10 }}
            />
          </svg>
        }
      />
      <Faiscas t={t - atravessa} x={690} y={1180} n={14} raio={180} semente="decide" />
    </AbsoluteFill>
  );
};
