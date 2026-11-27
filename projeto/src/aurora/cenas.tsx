import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { Camada, Cartao, clamp, COR, Facho, FONTE, Placa, Poeira } from "./estilo";
import { Calendario, Cama, CriadoMudo, FiltroBarro, Fogao, Fruteira, PanoDePrato, Poster, Prateleira, RoupaNoChao, Tenis, Ventilador } from "./objetos";
import { Jonas, Pudim } from "./personagens";

// Cenas do teste do episódio 1. Cada cena recebe `t` = segundos desde o início dela.

const ciclo = (t: number, vel = 9) => Math.sin(t * vel);

// ---------- Aurora (céu verde ondulando) ----------
export const Aurora: React.FC<{ altura?: number; forca?: number }> = ({ altura = 1100, forca = 1 }) => {
  const f = useCurrentFrame();
  const t = f / 30;
  const faixa = (fase: number, base: number, amp: number) => {
    let d = `M -50 ${base}`;
    for (let x = -50; x <= 1130; x += 40) d += ` L ${x} ${base + Math.sin(x / 170 + t * 0.6 + fase) * amp + Math.sin(x / 63 + t * 1.1 + fase * 2) * amp * 0.25}`;
    return d + ` L 1130 ${base - 520} L -50 ${base - 520} Z`;
  };
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen", opacity: forca }}>
      <svg width={1080} height={altura} style={{ position: "absolute", filter: "blur(16px)" }}>
        <defs>
          <linearGradient id="aur1" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor={COR.aurora} stopOpacity={0.95} />
            <stop offset="0.35" stopColor={COR.aurora} stopOpacity={0.45} />
            <stop offset="1" stopColor="#7a4cff" stopOpacity={0} />
          </linearGradient>
        </defs>
        <path d={faixa(0, altura * 0.62, 90)} fill="url(#aur1)" />
        <path d={faixa(2.1, altura * 0.46, 120)} fill="url(#aur1)" opacity={0.6} />
        <path d={faixa(4.2, altura * 0.78, 60)} fill="url(#aur1)" opacity={0.45} />
      </svg>
      <svg width={1080} height={altura} style={{ position: "absolute", filter: "blur(3px)", opacity: 0.55 }}>
        {new Array(70).fill(0).map((_, i) => {
          const x = (i / 70) * 1080 + Math.sin(t * 0.7 + i) * 6;
          const op = 0.15 + 0.35 * Math.abs(Math.sin(i * 0.9 + t * 1.3));
          const base = altura * 0.62 + Math.sin(x / 170 + t * 0.6) * 90;
          return <rect key={i} x={x} y={base - 380 - random(`a${i}`) * 120} width={5} height={380} fill={COR.aurora} opacity={op} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

export const Estrelas: React.FC<{ n?: number; altura?: number }> = ({ n = 90, altura = 1000 }) => {
  const f = useCurrentFrame();
  return (
    <svg width={1080} height={altura} style={{ position: "absolute" }}>
      {new Array(n).fill(0).map((_, i) => (
        <circle key={i} cx={random(`ex${i}`) * 1080} cy={random(`ey${i}`) * altura} r={1 + random(`er${i}`) * 2.2} fill="#fff" opacity={0.3 + 0.5 * Math.abs(Math.sin(f / 20 + i))} />
      ))}
    </svg>
  );
};

// ---------- Cena 1: cozinha, câmera no chão, Pudim atrás do Jonas ----------
export const PisoPerspectiva: React.FC<{ topo: number; fuga: number; cor1: string; cor2: string; linha: string }> = ({ topo, fuga, cor1, cor2, linha }) => {
  const linhas = [];
  for (let i = 1; i < 9; i++) {
    const y = topo + (1920 - topo) * Math.pow(i / 8, 1.9);
    linhas.push(<line key={`h${i}`} x1={0} y1={y} x2={1080} y2={y} stroke={linha} strokeWidth={2 + i * 0.6} />);
  }
  for (let k = -10; k <= 10; k++) linhas.push(<line key={`v${k}`} x1={540 + k * 18} y1={topo} x2={540 + k * 340} y2={1920} stroke={linha} strokeWidth={3} />);
  return (
    <svg width={1080} height={1920} style={{ position: "absolute" }}>
      <defs>
        <linearGradient id={`piso${fuga}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={cor1} />
          <stop offset="1" stopColor={cor2} />
        </linearGradient>
      </defs>
      <rect x={0} y={topo} width={1080} height={1920 - topo} fill={`url(#piso${fuga})`} />
      {linhas}
    </svg>
  );
};

export const CenaCozinhaChao: React.FC<{ t: number }> = ({ t }) => {
  const zoom = interpolate(t, [0, 4], [1, 1.07]);
  const xJ = interpolate(t, [0, 4], [520, 700]);
  const xG = interpolate(t, [0, 4], [-40, 160]);
  const c = ciclo(t, 13);
  return (
    <AbsoluteFill style={{ background: "#EAD9BE", transform: `scale(${zoom})` }}>
      <Camada blur={14} dx={-t * 6}>
        <svg width={1080} height={1920}>
          <rect x={0} y={0} width={1080} height={1250} fill="#E9D3B0" />
          {new Array(12).fill(0).map((_, i) =>
            new Array(9).fill(0).map((__, j) => <rect key={`${i}-${j}`} x={i * 96 - 20} y={420 + j * 70} width={90} height={64} rx={4} fill={(i + j) % 2 ? "#F6F0E6" : "#EDE4D6"} />),
          )}
          <rect x={60} y={120} width={360} height={260} rx={8} fill="#FFF6DD" />
          <rect x={-40} y={1000} width={1160} height={250} fill="#8B5E3C" />
          <rect x={-40} y={985} width={1160} height={30} fill="#5F4A3A" />
          {[100, 400, 700].map((x) => (
            <rect key={x} x={x} y={1040} width={260} height={180} rx={10} fill="#9C6C46" />
          ))}
          <rect x={760} y={260} width={240} height={720} rx={18} fill="#DCDCDC" />
          <rect x={980} y={500} width={10} height={120} rx={5} fill="#9a9a9a" />
          <Calendario x={560} y={250} />
          <PanoDePrato x={300} y={1010} />
          <Fogao x={170} y={985} t={t} />
          <FiltroBarro x={460} y={985} e={0.8} />
          <Fruteira x={640} y={985} />
        </svg>
      </Camada>
      <Facho x={180} largura={360} angulo={-24} forca={0.4} />
      <PisoPerspectiva topo={1250} fuga={1} cor1="#C9B49A" cor2="#E2CDB0" linha="rgba(120,95,70,0.35)" />
      <Camada blur={7} dx={-t * 14}>
        <svg width={1080} height={1920}>
          <rect x={30} y={700} width={70} height={720} rx={10} fill="#5B3F2C" />
          <rect x={880} y={760} width={60} height={640} rx={10} fill="#5B3F2C" />
          <rect x={-60} y={640} width={1200} height={70} rx={12} fill="#6E4C34" />
        </svg>
      </Camada>
      <Camada blur={6}>
        <svg width={1080} height={1920}>
          <Pudim x={xG} y={1640} escala={1.55} olhos="caca" agachado virado rabo={Math.sin(t * 3)} />
        </svg>
      </Camada>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <Jonas
          x={xJ}
          y={1760 + Math.abs(c) * -14}
          escala={0.62}
          pose={{ bracoE: 40 * c, bracoD: -40 * c, antebracoE: -50, antebracoD: 50, pernaE: -32 * c, pernaD: 32 * c, tronco: 6, cabeca: -10 }}
          olhos="espanto"
          boca="aberta"
        />
      </svg>
      <Poeira semente="c1" n={30} />
    </AbsoluteFill>
  );
};

// ---------- Cena 2: céu verde sobre a zona leste ----------
export const Sobrado: React.FC<{ x: number; base: number; l: number; a: number; cor: string; janelas?: boolean; acesa?: number; caixa?: boolean }> = ({ x, base, l, a, cor, janelas = true, acesa = -1, caixa = true }) => (
  <g>
    <rect x={x} y={base - a} width={l} height={a} fill={cor} />
    <rect x={x - 8} y={base - a - 14} width={l + 16} height={16} fill={cor} />
    {caixa && (
      <g>
        <rect x={x + l * 0.6} y={base - a - 70} width={64} height={56} rx={10} fill="#1E3550" />
        <rect x={x + l * 0.6 - 4} y={base - a - 78} width={72} height={14} rx={6} fill="#24405F" />
      </g>
    )}
    {janelas &&
      [0, 1].map((k) => (
        <rect key={k} x={x + 26 + k * (l / 2)} y={base - a + 50} width={l / 2 - 52} height={90} rx={4} fill={k === acesa ? "#FFD27A" : "#2A2240"} />
      ))}
    {janelas && <rect x={x + l / 2 - 32} y={base - 130} width={64} height={130} fill="#16122A" />}
  </g>
);

export const CenaCeuVerde: React.FC<{ t: number }> = ({ t }) => {
  const dy = interpolate(t, [0, 4], [-60, 40]);
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg,#070B1E 0%,#1A1640 45%,#352653 75%,#3F2D57 100%)" }}>
      <Camada dy={dy * 0.3}>
        <Estrelas altura={1100} />
      </Camada>
      <Camada dy={dy * 0.5}>
        <Aurora altura={1250} forca={interpolate(t, [0, 0.8], [0.4, 1], clamp)} />
      </Camada>
      <Camada blur={3} dy={dy * 0.8}>
        <svg width={1080} height={1920}>
          {[
            [-40, 260, 380],
            [210, 220, 300],
            [420, 300, 420],
            [710, 240, 330],
            [940, 220, 380],
          ].map(([x, l, a], i) => (
            <Sobrado key={i} x={x} base={1500} l={l} a={a} cor="#231B3C" />
          ))}
        </svg>
      </Camada>
      <Camada dy={dy}>
        <svg width={1080} height={1920}>
          <rect x={0} y={1830} width={1080} height={120} fill="#120E22" />
          <Sobrado x={-60} base={1880} l={430} a={520} cor="#17122B" acesa={1} />
          <Sobrado x={560} base={1880} l={560} a={440} cor="#1A142F" caixa />
          {/* Jonas na janela acesa, de perfil, olhando pra cima */}
          <g transform="translate(236 1424)">
            <circle cx={26} cy={26} r={22} fill="#3A2A26" />
            <rect x={6} y={50} width={40} height={26} rx={10} fill="#3A2A26" />
          </g>
          {[
            [140, 1720],
            [690, 1720],
          ].map(([x], i) => (
            <rect key={i} x={x} y={900} width={16} height={1000} fill="#0D0A18" />
          ))}
          <path d="M -20 990 Q 300 1080 698 960 Q 900 1030 1100 980" stroke="#0D0A18" strokeWidth={5} fill="none" />
          <path d="M -20 1020 Q 320 1120 698 1000 Q 900 1070 1100 1020" stroke="#0D0A18" strokeWidth={4} fill="none" />
          <path d="M -20 1050 Q 360 1160 698 1040" stroke="#0D0A18" strokeWidth={3} fill="none" />
        </svg>
        <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 30%, rgba(60,240,160,${0.1 + 0.04 * Math.sin(f / 9)}) 0%, rgba(0,0,0,0) 60%)` }} />
      </Camada>
      <Cartao s={t} de={0.15} ate={3.9} etiqueta="NOITE DA AURORA" texto="3:17" top={240} />
    </AbsoluteFill>
  );
};

// ---------- Cena 3: quarto à noite, Jonas deitado no celular quando o céu fica verde ----------
export const CenaQuartoNoite: React.FC<{ t: number }> = ({ t }) => {
  const zoom = interpolate(t, [0, 7.5], [1.0, 1.14]);
  const verde = interpolate(t, [0.2, 1.4], [0.15, 1], clamp);
  const vira = interpolate(t, [0.9, 1.4], [0, 1], clamp); // vira a cabeça pra janela
  const filma = interpolate(t, [3.2, 3.8], [0, 1], clamp); // levanta o celular pra filmar
  const piscar = t > 2.6 && t < 2.72;
  return (
    <AbsoluteFill style={{ background: "#1A1733", transform: `scale(${zoom})`, transformOrigin: "50% 60%" }}>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <rect x={0} y={0} width={1080} height={1560} fill="#231E40" />
        <rect x={0} y={1540} width={1080} height={380} fill="#2B2238" />
        <rect x={0} y={1530} width={1080} height={16} fill="#3A2C4C" />
      </svg>
      <Camada blur={4}>
        <svg width={1080} height={1920}>
          <Poster x={140} y={620} cor="#E0565B" />
          <Prateleira x={880} y={980} />
          <Ventilador x={950} y={1560} t={t} />
        </svg>
      </Camada>
      {/* janela com a aurora, em cima da cama */}
      <div style={{ position: "absolute", left: 300, top: 200, width: 480, height: 620, overflow: "hidden", borderRadius: 6, background: "linear-gradient(180deg,#070B1E,#1A1640)" }}>
        <Estrelas altura={620} n={40} />
        <div style={{ position: "absolute", inset: 0, transform: "scale(0.9) translate(-60px, -160px)" }}>
          <Aurora altura={900} forca={verde} />
        </div>
        <svg width={480} height={620} style={{ position: "absolute" }}>
          <rect x={0} y={460} width={480} height={160} fill="#120E22" />
          <rect x={20} y={400} width={140} height={220} fill="#17122B" />
          <rect x={290} y={380} width={190} height={240} fill="#17122B" />
          <rect x={233} y={0} width={14} height={620} fill="#4A3C66" />
          <rect x={0} y={300} width={480} height={14} fill="#4A3C66" />
        </svg>
      </div>
      <div style={{ position: "absolute", left: 282, top: 182, width: 516, height: 656, border: "18px solid #4A3C66", borderRadius: 10 }} />
      <Facho x={420} largura={420} angulo={-12} forca={0.3 * verde} cor="60,240,160" />
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <CriadoMudo x={110} y={1560} aceso={false} />
        <Cama x={190} y={1560} e={0.95} lencol="#5E4A88" />
        {/* Jonas deitado de barriga pra cima, cabeça no travesseiro */}
        <g transform="translate(830 1300) rotate(-90)">
          <Jonas
            x={0}
            y={0}
            escala={0.9}
            pose={{ bracoD: interpolate(filma, [0, 1], [150, 175]), antebracoD: interpolate(filma, [0, 1], [40, -10]), bracoE: 10, cabeca: interpolate(vira, [0, 1], [0, 18]) }}
            olhos={vira > 0.5 ? "cima" : "normal"}
            boca={t > 0.1 && t < 2.6 ? (Math.floor(t / 0.11) % 2 ? "o" : "aberta") : "o"}
            piscar={piscar}
            celular
            brilho={verde * 0.6}
          />
        </g>
        {/* lençol cobrindo as pernas */}
        <path d="M 600 1220 Q 760 1180 1050 1210 L 1050 1340 Q 820 1360 600 1330 Z" fill="#5E4A88" />
        <RoupaNoChao x={420} y={1720} />
        <Tenis x={760} y={1760} />
      </svg>
      {/* luz azul do celular no rosto */}
      <AbsoluteFill style={{ background: `radial-gradient(circle at 30% 64%, rgba(140,190,255,${0.25 * (1 - verde * 0.5)}) 0%, rgba(0,0,0,0) 22%)`, mixBlendMode: "screen" }} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 30%, rgba(60,240,160,${0.22 * verde}) 0%, rgba(0,0,0,0) 60%)`, mixBlendMode: "screen" }} />
      <Poeira semente="c3" n={24} cor="160,255,210" />
      <Placa s={t} de={2.4} ate={7.2} nome="JONAS, 23" desc="ESTAGIÁRIO" x={300} y={1560} />
    </AbsoluteFill>
  );
};

// ---------- Cena 4: de manhã, o quarto gigante ----------
const ReguaAltura: React.FC<{ t: number }> = ({ t }) => {
  const k = interpolate(t, [1.6, 3.0], [0, 1], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
  const cm = Math.round(interpolate(k, [0, 1], [170, 17]));
  const texto = cm >= 100 ? `${(cm / 100).toFixed(2).replace(".", ",")} m` : `${cm} cm`;
  const topo = 480;
  const fundo = 1080;
  const marca = interpolate(k, [0, 1], [topo, fundo - (fundo - topo) * 0.1]);
  const op = interpolate(t, [0.8, 1.1], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", left: 870, top: 0, width: 200, height: 1920, opacity: op }}>
      <div style={{ position: "absolute", left: 60, top: topo, width: 34, height: fundo - topo, background: COR.creme, borderRadius: 8, boxShadow: "0 8px 24px rgba(0,0,0,0.3)" }}>
        {new Array(21).fill(0).map((_, i) => (
          <div key={i} style={{ position: "absolute", left: 0, top: (i / 20) * (fundo - topo), width: i % 5 === 0 ? 22 : 12, height: 3, background: COR.tinta }} />
        ))}
      </div>
      <div style={{ position: "absolute", left: 30, top: marca - 4, width: 94, height: 8, background: k > 0.9 ? COR.vermelho : COR.amarelo, borderRadius: 4 }} />
      <div style={{ position: "absolute", left: -120, top: topo - 120, width: 300, textAlign: "center", fontFamily: FONTE, fontWeight: 800, color: "#fff", textShadow: "0 3px 10px rgba(0,0,0,0.6)" }}>
        <div style={{ fontSize: 30, letterSpacing: 4 }}>ALTURA</div>
        <div style={{ fontSize: 66, color: k > 0.9 ? COR.vermelho : "#fff" }}>{texto}</div>
      </div>
    </div>
  );
};

export const CenaQuartoGigante: React.FC<{ t: number }> = ({ t }) => {
  const zoom = interpolate(t, [0, 5], [1.12, 1.0]);
  const tremor = t < 2.2 ? Math.sin(t * 90) * 6 : 0;
  const pulo = t > 0.15 && t < 0.5 ? -40 * Math.sin(((t - 0.15) / 0.35) * Math.PI) : 0;
  return (
    <AbsoluteFill style={{ background: "#F2D9B3", transform: `scale(${zoom})` }}>
      <Camada blur={12}>
        <svg width={1080} height={1920}>
          <rect x={0} y={0} width={1080} height={1300} fill="#F0D7AE" />
          <rect x={560} y={140} width={420} height={560} rx={10} fill="#FFF5DA" />
          <rect x={0} y={1180} width={1080} height={40} fill="#C9A57A" />
        </svg>
      </Camada>
      <Facho x={500} largura={520} angulo={22} forca={0.5} />
      <PisoPerspectiva topo={1220} fuga={4} cor1="#B07A4E" cor2="#C99062" linha="rgba(80,45,20,0.35)" />
      {/* cama gigante à esquerda */}
      <Camada blur={4}>
        <svg width={1080} height={1920}>
          <rect x={-200} y={500} width={640} height={760} rx={30} fill="#6A4A7A" />
          <path d="M -200 560 Q 120 520 440 600 L 440 1040 Q 300 1120 180 1060 Q 60 1150 -200 1080 Z" fill="#8A6AA0" />
          <rect x={-200} y={1240} width={660} height={60} rx={10} fill="#4A3020" />
          <rect x={380} y={1240} width={60} height={240} fill="#4A3020" />
        </svg>
      </Camada>
      <Camada blur={7}>
        <svg width={1080} height={1920}>
          <RoupaNoChao x={760} y={1330} e={2.4} />
          <Tenis x={160} y={1360} e={2.6} />
          <Ventilador x={950} y={1260} e={1.6} t={t} />
        </svg>
      </Camada>
      {/* celular despertando no chão */}
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <g transform={`translate(${380 + tremor} 1500) skewX(-12)`}>
          <rect x={0} y={0} width={360} height={150} rx={26} fill="#1d1d22" />
          <rect x={14} y={12} width={332} height={126} rx={18} fill="#2E3B57" />
          <text x={180} y={98} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={74} fill="#fff">
            07:00
          </text>
          <text x={180} y={128} textAnchor="middle" fontFamily={FONTE} fontWeight={700} fontSize={19} fill="#fff" opacity={0.6}>
            @mundoparalelo.br
          </text>
          {t < 2.4 &&
            [0, 1, 2].map((i) => {
              const r = ((t * 2 + i / 3) % 1) * 120;
              return <circle key={i} cx={180} cy={75} r={140 + r} fill="none" stroke="#fff" strokeWidth={4} opacity={1 - r / 120} />;
            })}
        </g>
        <Jonas
          x={260}
          y={1640 + pulo}
          escala={0.62}
          pose={{ bracoE: t < 0.5 ? 60 : 20, bracoD: t < 0.5 ? 60 : 20, antebracoE: -20, antebracoD: 20, cabeca: interpolate(t, [0.6, 1.4, 2.4], [0, -12, 10], clamp) }}
          olhos={t > 0.5 ? "espanto" : "fechado"}
          boca={t > 0.5 ? "aberta" : "neutra"}
        />
      </svg>
      {/* chinelo gigante em primeiro plano */}
      <Camada blur={3}>
        <svg width={1080} height={1920}>
          {/* chinelo de dedo deitado, sola com formato de pé */}
          <g transform="translate(830 1730) rotate(-28)">
            <path d="M -300 -10 Q -310 -95 -170 -105 Q 40 -120 230 -88 Q 330 -70 320 10 Q 310 90 210 96 Q 20 110 -170 92 Q -300 80 -300 -10 Z" fill="#2F6FB0" />
            <path d="M -280 -18 Q -285 -80 -165 -88 Q 40 -102 225 -72 Q 300 -58 296 4 Q 290 70 205 78 Q 20 92 -165 74 Q -280 64 -280 -18 Z" fill="#F4F1EA" />
            <path d="M 200 -6 Q 40 -90 -60 -60 M 200 -6 Q 40 80 -60 56" stroke="#2F6FB0" strokeWidth={24} fill="none" strokeLinecap="round" />
            <circle cx={200} cy={-6} r={16} fill="#24578C" />
          </g>
        </svg>
      </Camada>
      <Poeira semente="c4" n={45} />
      <ReguaAltura t={t} />
    </AbsoluteFill>
  );
};
