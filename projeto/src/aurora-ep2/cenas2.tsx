import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Aurora, Estrelas, Sobrado } from "../aurora/cenas";
import { CozinhaFundo, entra, FundoDiagrama, plano, Rotulo } from "../aurora/cenas2";
import { Olheiro } from "../aurora/elenco";
import { Camada, Cartao, clamp, COR, Facho, FONTE, Placa, Poeira } from "../aurora/estilo";
import { Cama, Calendario, CriadoMudo, Poster, Prateleira, RoupaNoChao, Tenis, Ventilador } from "../aurora/objetos";
import { Boca } from "../aurora/personagens";
import { Bruno } from "./bruno";
import { Antena, Arvore, Balde, Bicicleta, Bola, CadeiraPraia, Cadeira, CarroParado, Cachorro, Chinelo, Cortina, Lixeira, Luvas, Medalhas, Mochila, Orelhao, Picho, Pipa, PlacaLoja, PlacaPonto, Vaso, Vergalhao } from "./objetos";
import { CenaBusaoLado } from "./cenas";

// Resto das cenas do ep. 2. Os cortes (`plano`) são provisórios até a narração existir: na
// montagem cada cena recebe `fala`, as janelas (em s, relativas à cena) em que a boca mexe.

type Janela = [number, number];
export type PropsCena = { t: number; fala?: Janela[] };

// Boca batendo dentro das janelas de fala.
export const bate = (t: number, fala: Janela[] = [], fechada: Boca = "neutra"): Boca =>
  fala.some(([a, b]) => t >= a && t <= b) ? (Math.floor(t / 0.1) % 2 ? "aberta" : "o") : fechada;

const mod = (a: number, n: number) => ((a % n) + n) % n;

// ---------- objetos novos ----------
const Moeda: React.FC<{ x: number; y: number; r?: number; cor?: string }> = ({ x, y, r = 22, cor = "#D9A441" }) => (
  <g>
    <circle cx={x} cy={y} r={r} fill={cor} />
    <circle cx={x} cy={y} r={r * 0.72} fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth={3} />
  </g>
);
const Clipe: React.FC<{ x: number; y: number; a: number }> = ({ x, y, a }) => (
  <path d="M 0 0 h 34 a 8 8 0 0 1 0 16 h -28 a 6 6 0 0 1 0 -12 h 22" transform={`translate(${x} ${y}) rotate(${a})`} stroke="#B8BCC4" strokeWidth={4} fill="none" />
);
const Chave: React.FC<{ x: number; y: number; a: number }> = ({ x, y, a }) => (
  <g transform={`translate(${x} ${y}) rotate(${a})`}>
    <circle r={14} fill="none" stroke="#C9A43A" strokeWidth={6} />
    <rect x={10} y={-4} width={34} height={8} rx={3} fill="#C9A43A" />
  </g>
);
const Cofrinho: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <ellipse cx={0} cy={-60} rx={90} ry={62} fill="#F28CA8" />
    <circle cx={-80} cy={-74} r={34} fill="#F28CA8" />
    <ellipse cx={-108} cy={-70} rx={14} ry={12} fill="#E06C8C" />
    <path d="M -70 -120 l 14 -34 l 18 30 Z" fill="#E06C8C" />
    <circle cx={-84} cy={-86} r={5} fill={COR.tinta} />
    <rect x={-14} y={-124} width={34} height={7} rx={3} fill={COR.tinta} />
    {[-50, 40].map((px) => (
      <rect key={px} x={px} y={-14} width={20} height={20} rx={6} fill="#E06C8C" />
    ))}
  </g>
);
// Despertador de metal parado em 3:17 (easter egg da série).
const Despertador: React.FC<{ x: number; y: number; e?: number }> = ({ x, y, e = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${e})`}>
    <circle cx={-34} cy={-50} r={18} fill="#B8BCC4" />
    <circle cx={34} cy={-50} r={18} fill="#B8BCC4" />
    <circle r={52} fill="#C8322B" />
    <circle r={42} fill="#F4ECDD" />
    <text y={12} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={34} fill={COR.tinta}>
      3:17
    </text>
  </g>
);

// Ímã de ferradura aberto pra esquerda, pontas cinza.
const ImaU: React.FC = () => (
  <g>
    <path d="M -140 -90 H 0 A 90 90 0 0 1 0 90 H -140 V 40 H 0 A 40 40 0 0 0 0 -40 H -140 Z" fill={COR.vermelho} />
    <rect x={-150} y={-90} width={46} height={50} fill="#C9CED6" />
    <rect x={-150} y={40} width={46} height={50} fill="#C9CED6" />
  </g>
);

// ---------- Cena 3: laje de madrugada ----------
export const CenaLaje: React.FC<PropsCena> = ({ t, fala }) => {
  const zoom = interpolate(t, [0, 7], [1.0, 1.12]);
  const quica = Math.abs(Math.sin(t * 5));
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg,#070B1E 0%,#1A1640 50%,#3F2D57 100%)", transform: `scale(${zoom})`, transformOrigin: "45% 70%" }}>
      <Estrelas altura={1100} />
      <Aurora altura={1200} />
      <Camada blur={4}>
        <svg width={1080} height={1920}>
          {[
            [-60, 300, 420],
            [260, 260, 300],
            [540, 320, 480],
            [880, 260, 360],
          ].map(([x, l, a], i) => (
            <Sobrado key={i} x={x} base={1420} l={l} a={a} cor="#231B3C" acesa={i === 2 ? 0 : -1} />
          ))}
          <path d="M -20 820 Q 400 900 1100 800" stroke="#0D0A18" strokeWidth={5} fill="none" />
          <Pipa x={760} y={760} e={0.6} a={20} />
          <Antena x={160} y={1000} e={0.9} />
        </svg>
      </Camada>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        {/* laje: piso de concreto, mureta, caixa d'água e varal */}
        <rect x={0} y={1400} width={1080} height={520} fill="#5A5266" />
        <rect x={0} y={1360} width={1080} height={50} fill="#6E6680" />
        {new Array(8).fill(0).map((_, i) => (
          <rect key={i} x={i * 140} y={1300} width={22} height={70} fill="#4A4258" />
        ))}
        <g transform="translate(860 1400)">
          <rect x={-110} y={-260} width={220} height={250} rx={30} fill="#2D6FB5" />
          <rect x={-120} y={-280} width={240} height={36} rx={14} fill="#3A82CC" />
          <rect x={-90} y={-10} width={180} height={20} fill="#3E3650" />
        </g>
        <path d="M 40 1060 L 640 1100" stroke="#C9C9C9" strokeWidth={3} />
        {[[120, "#C05070"], [260, "#F2873A"], [420, "#2F5DA8"]].map(([x, c]) => (
          <rect key={x as number} x={x as number} y={1068 + (x as number) * 0.06} width={90} height={110} rx={8} fill={c as string} />
        ))}
        <Antena x={980} y={1120} />
        <Vergalhao x={110} y={1380} />
        <Vergalhao x={640} y={1380} e={0.8} />
        <CadeiraPraia x={170} y={1600} />
        <Vaso x={700} y={1520} />
        <Vaso x={780} y={1540} cor="#3E7A4E" e={0.8} />
        <Balde x={960} y={1620} />
        <Chinelo x={240} y={1720} />
        <Chinelo x={300} y={1740} />
        <Luvas x={760} y={1800} e={0.7} />
        <Bruno x={420} y={1900} escala={0.9} roupa="goleiro" olhos="cima" boca={bate(t, fala)} pose={{ bracoD: 20, antebracoD: -10, cabeca: -6 }} brilho={interpolate(t, [0, 1.5], [0.2, 0.6], clamp)} />
        {/* bola quicando */}
        <g transform={`translate(580 ${1880 - quica * 160})`}>
          <circle r={50} fill="#F4F4F0" />
          <path d="M -30 -20 l 20 -14 l 22 8 l 2 24 l -22 12 l -20 -10 Z" fill="#22222A" />
        </g>
      </svg>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 25%, rgba(60,240,160,0.18) 0%, rgba(0,0,0,0) 60%)", mixBlendMode: "screen" }} />
      <Poeira semente="laje" n={20} cor="160,255,210" />
      <Placa s={t} de={0.6} ate={5.5} nome="BRUNO, 17" desc="GOLEIRO DO 3º B" x={300} y={960} />
    </AbsoluteFill>
  );
};

// ---------- Cena 4: acorda coberto de moeda; corte pro diagrama da moeda ----------
const ITENS: [string, number, number, number][] = [
  ["m", 420, 1250, 0],
  ["m", 480, 1320, 0],
  ["m", 560, 1270, 0],
  ["m", 640, 1330, 0],
  ["m", 700, 1250, 0],
  ["c", 380, 1340, 30],
  ["c", 600, 1210, -20],
  ["k", 520, 1360, 60],
  ["k", 760, 1300, -30],
  ["m", 300, 1230, 0],
  ["m", 260, 1350, 0],
];

export const CenaQuarto: React.FC<PropsCena & { close?: number; corte?: number }> = ({ t, fala, close = 2.2, corte = 4.2 }) => {
  const p = plano(t, [close, corte]);
  if (p === 2) {
    const tt = t - corte;
    const k = entra(tt, 0.3, 0.6);
    return (
      <FundoDiagrama>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <circle cx={540} cy={760} r={300} fill="#D9A441" />
          {/* metade cortada: miolo de aço, casquinha de bronze */}
          <path d="M 540 460 A 300 300 0 0 1 540 1060 Z" fill="#C9862E" />
          <path d="M 540 490 A 270 270 0 0 1 540 1030 Z" fill="#9EA3AB" opacity={k} />
          <circle cx={540} cy={760} r={220} fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth={8} />
          {/* ímã puxando */}
          <g transform={`translate(${interpolate(k, [0, 1], [1080, 1010])} 760) scale(0.8)`}>
            <ImaU />
          </g>
        </svg>
        <Rotulo x={700} y={400} texto="AÇO POR DENTRO" cor={COR.amarelo} tam={70} op={k} />
      </FundoDiagrama>
    );
  }
  const puxa = interpolate(t, [0.2, 1.8], [0, 1], { ...clamp, easing: (x) => x * x });
  const zoom = p === 1 ? 2.0 + (t - close) * 0.04 : 1.02 + t * 0.03;
  return (
    <AbsoluteFill style={{ background: "#F0D7AE", transform: `scale(${zoom})`, transformOrigin: p === 1 ? "202px 1750px" : "50% 62%" }}>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <rect x={0} y={0} width={1080} height={1540} fill="#E8CFA6" />
        <rect x={0} y={1540} width={1080} height={380} fill="#B07A4E" />
        <rect x={0} y={1530} width={1080} height={16} fill="#C9A57A" />
      </svg>
      <Camada blur={4}>
        <svg width={1080} height={1920}>
          {/* pôster de time e prateleira com troféu do interclasse */}
          <Poster x={160} y={640} cor="#F2873A" />
          <Prateleira x={850} y={900} />
          <g transform="translate(900 880)">
            <rect x={-20} y={-20} width={40} height={20} fill="#8B6A43" />
            <path d="M -30 -90 h 60 q 0 50 -30 70 q -30 -20 -30 -70 Z" fill="#E6B83A" />
          </g>
          <rect x={520} y={260} width={300} height={380} rx={8} fill="#FFF5DA" />
          <rect x={662} y={260} width={14} height={380} fill="#E8CFA6" />
          <Ventilador x={960} y={1540} t={t} />
          <Cortina x={520} y={260} largura={300} altura={420} />
          <Medalhas x={330} y={420} />
          <Cadeira x={720} y={1540} />
          <Calendario x={420} y={900} />
        </svg>
      </Camada>
      <Facho x={600} largura={460} angulo={18} forca={0.4} />
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <CriadoMudo x={110} y={1540} />
        <Cama x={190} y={1540} e={0.95} lencol="#2F5DA8" />
        <g transform="translate(830 1300) rotate(-90)">
          <Bruno x={0} y={0} escala={0.9} roupa="casa" olhos={p === 1 ? "espanto" : puxa > 0.6 ? "espanto" : "fechado"} boca={bate(t, fala, "o")} pose={{ bracoE: 10, bracoD: 20, cabeca: 8 }} />
        </g>
        <path d="M 640 1220 Q 780 1180 1050 1210 L 1050 1340 Q 820 1360 640 1330 Z" fill="#2F5DA8" />
        {/* tudo que é de aço vindo pra ele */}
        {ITENS.map(([tipo, x, y, a], i) => {
          const k = interpolate(t, [0.1 + i * 0.08, 0.6 + i * 0.08], [0, 1], { ...clamp, easing: (z) => z * z * z });
          const x0 = i % 2 ? 1100 : -40;
          const y0 = 900 + (i % 4) * 160;
          const px = x0 + (x - x0) * k;
          const py = y0 + (y - y0) * k;
          return tipo === "m" ? <Moeda key={i} x={px} y={py} cor={i % 3 ? "#D9A441" : "#C27A3A"} /> : tipo === "c" ? <Clipe key={i} x={px} y={py} a={a} /> : <Chave key={i} x={px} y={py} a={a} />;
        })}
        <Despertador x={interpolate(puxa, [0, 1], [110, 470])} y={interpolate(puxa, [0, 1], [1290, 1265])} e={0.8} />
        <g transform={`translate(${interpolate(puxa, [0, 1], [1010, 720])} 1235)`}>
          <Cofrinho x={0} y={0} />
        </g>
        <RoupaNoChao x={420} y={1720} />
        <Tenis x={760} y={1760} />
        <Mochila x={960} y={1800} e={0.9} />
        <Luvas x={130} y={1310} e={0.7} />
        <Bola x={600} y={1860} e={1.2} />
      </svg>
      <Poeira semente="q4" n={26} />
    </AbsoluteFill>
  );
};

// ---------- Cena 5: a geladeira e a ação e reação ----------
const Ima: React.FC<{ x: number; y: number; texto: string; cor: string; a?: number }> = ({ x, y, texto, cor, a = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${a})`}>
    <rect x={-70} y={-40} width={140} height={80} rx={10} fill={cor} />
    <text y={10} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={28} fill="#fff">
      {texto}
    </text>
  </g>
);

const Seta: React.FC<{ x1: number; x2: number; y: number; cor: string; larg?: number }> = ({ x1, x2, y, cor, larg = 26 }) => {
  const d = x2 > x1 ? 1 : -1;
  return (
    <g>
      <rect x={Math.min(x1, x2 - d * 40)} y={y - larg / 2} width={Math.abs(x2 - d * 40 - x1)} height={larg} fill={cor} />
      <path d={`M ${x2} ${y} L ${x2 - d * 60} ${y - 40} L ${x2 - d * 60} ${y + 40} Z`} fill={cor} />
    </g>
  );
};

export const CenaGeladeira: React.FC<PropsCena & { corte1?: number; corte2?: number }> = ({ t, fala, corte1 = 3.0, corte2 = 6.6 }) => {
  const p = plano(t, [corte1, corte2]);
  if (p === 0) {
    const gruda = entra(t, 0.4, 0.25);
    return (
      <AbsoluteFill style={{ background: "#EAD9BE", transform: `scale(${1.05 + t * 0.03})` }}>
        <CozinhaFundo t={t} />
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          {/* porta da geladeira em primeiro plano */}
          <rect x={560} y={0} width={560} height={1920} rx={30} fill="#F4F4F0" />
          <rect x={580} y={980} width={30} height={260} rx={12} fill="#C9C9C9" />
          <line x1={560} y1={940} x2={1080} y2={940} stroke="#DCDCD6" strokeWidth={6} />
          <Calendario x={860} y={560} e={1.3} />
          <Bruno x={interpolate(gruda, [0, 1], [300, 345])} y={1850} escala={1.7} roupa="casa" olhos="fechado" boca={bate(t, fala, "o")} pose={{ tronco: 10 + gruda * 6, cabeca: 14, bracoD: 70, antebracoD: -30 }} />
          {[
            ["DISK GÁS", "#C8322B", 820, 300, -8],
            ["PIZZA", "#2E8B57", 960, 760, 6],
            ["CHAVEIRO", "#2F5DA8", 820, 1300, 4],
          ].map(([txt, cor, x, y, a], i) => {
            const k = interpolate(t, [0.9 + i * 0.3, 1.3 + i * 0.3], [0, 1], { ...clamp, easing: (z) => z * z });
            return <Ima key={i} texto={txt as string} cor={cor as string} x={(x as number) + (640 - (x as number)) * k} y={(y as number) + (980 + i * 70 - (y as number)) * k} a={(a as number) + k * 30} />;
          })}
        </svg>
      </AbsoluteFill>
    );
  }
  if (p === 1) {
    const tt = t - corte1;
    const k = entra(tt, 0.3, 0.6);
    return (
      <FundoDiagrama>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Bruno x={250} y={1050} escala={0.75} roupa="casa" brilho={0.5} />
          <g transform="translate(830 1050)">
            <rect x={-140} y={-600} width={280} height={600} rx={24} fill="#F4F4F0" />
            <rect x={-120} y={-360} width={240} height={6} fill="#DCDCD6" />
          </g>
          <g opacity={k}>
            <Seta x1={380} x2={640} y={700} cor={COR.amarelo} />
            <Seta x1={680} x2={420} y={800} cor={COR.amarelo} />
          </g>
        </svg>
        <Rotulo x={540} y={360} texto="MESMA FORÇA" tam={96} cor={COR.amarelo} op={k} />
        <Rotulo x={540} y={1420} texto="PRA LÁ E PRA CÁ" tam={60} op={entra(tt, 1.0)} />
      </FundoDiagrama>
    );
  }
  const tt = t - corte2;
  const voaMoeda = interpolate(tt, [0.3, 0.9], [0, 1], { ...clamp, easing: (z) => z * z });
  const voaBruno = interpolate(tt, [1.4, 2.0], [0, 1], { ...clamp, easing: (z) => z * z });
  return (
    <FundoDiagrama>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        {/* linha 1: a moeda vai até ele */}
        <Bruno x={300} y={900} escala={0.55} roupa="casa" brilho={0.5} />
        <Moeda x={interpolate(voaMoeda, [0, 1], [880, 380])} y={760} r={34} />
        {/* linha 2: ele vai até o busão */}
        <g transform="translate(700 1560)">
          <rect x={-40} y={-380} width={420} height={380} rx={20} fill="#F2F2EE" />
          <rect x={-20} y={-350} width={160} height={150} rx={10} fill="#1F3550" />
          <rect x={160} y={-350} width={160} height={150} rx={10} fill="#1F3550" />
          <rect x={-40} y={-150} width={420} height={36} fill="#C8322B" />
          <circle cx={240} cy={0} r={60} fill="#1A1A1E" />
        </g>
        <Bruno x={interpolate(voaBruno, [0, 1], [200, 620])} y={1560} escala={0.55} roupa="escola" brilho={0.5} olhos={voaBruno > 0 ? "espanto" : "normal"} />
      </svg>
      <Rotulo x={540} y={460} texto="QUEM É MAIS LEVE…" tam={80} />
      <Rotulo x={540} y={1720} texto="…É QUE VOA" tam={96} cor={COR.amarelo} op={entra(tt, 1.6)} />
    </FundoDiagrama>
  );
};

// ---------- Cena 6: a bússola do celular e o sangue ----------
export const Celular: React.FC<{ vib?: number; children: React.ReactNode; hora?: string }> = ({ vib = 0, children, hora = "07:40" }) => (
  <div style={{ position: "absolute", left: 140 + vib, top: 240, width: 800, height: 1440, borderRadius: 80, background: "#1d1d22", boxShadow: "0 30px 80px rgba(0,0,0,0.5)" }}>
    <div style={{ position: "absolute", inset: 26, borderRadius: 60, overflow: "hidden", background: "#E9EEF2" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 70, display: "flex", justifyContent: "space-between", padding: "18px 50px", fontFamily: FONTE, fontWeight: 700, fontSize: 30, color: COR.tinta, zIndex: 2 }}>
        <span>{hora}</span>
        <span>▮▮▮ 4G</span>
      </div>
      {children}
    </div>
  </div>
);

export const CenaBussola: React.FC<PropsCena & { corte1?: number; corte2?: number; corte3?: number }> = ({ t, fala, corte1 = 1.6, corte2 = 4.0, corte3 = 5.6 }) => {
  const p = plano(t, [corte1, corte2, corte3]);
  if (p === 0 || p === 2) {
    const tt = p === 0 ? t : t - corte2;
    return (
      <AbsoluteFill style={{ background: "#9CC6E6", transform: `scale(${p === 2 ? 1.9 : 1.05 + tt * 0.03})`, transformOrigin: p === 2 ? "50% 75%" : "50% 40%" }}>
        <Camada blur={7}>
          <svg width={1080} height={1920}>
            <Sobrado x={-40} base={1500} l={420} a={700} cor="#C49A7A" />
            <Sobrado x={420} base={1500} l={360} a={560} cor="#E0BE96" />
            <Sobrado x={800} base={1500} l={360} a={760} cor="#A88BB0" />
            <PlacaLoja x={240} y={1340} texto="PADARIA" cor="#B5651D" />
            <Picho x={480} y={1440} />
            <Orelhao x={760} y={1500} />
            <Arvore x={980} y={1500} />
            <CarroParado x={160} y={1520} cor="#E6B83A" />
          </svg>
        </Camada>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <rect x={0} y={1500} width={1080} height={420} fill="#B9B3A6" />
          {new Array(9).fill(0).map((_, i) => (
            <line key={i} x1={i * 130} y1={1500} x2={i * 130 - 60} y2={1920} stroke="#A9A396" strokeWidth={4} />
          ))}
          <Cachorro x={900} y={1760} t={tt} />
          <Lixeira x={120} y={1700} />
          <Bruno x={540} y={2200} escala={1.25} roupa="escola" mochila celular olhos={p === 2 ? "normal" : "espanto"} boca={bate(t, fala)} pose={{ bracoD: 150, antebracoD: 50, bracoE: 10 }} brilho={0.4} />
        </svg>
      </AbsoluteFill>
    );
  }
  if (p === 1) {
    const tt = t - corte1;
    const gira = interpolate(tt, [0, 1.6], [0, 900], { ...clamp, easing: (z) => 1 - Math.pow(1 - z, 3) }) + 180;
    const aviso = entra(tt, 0.5);
    return (
      <AbsoluteFill style={{ background: "#B9B3A6" }}>
        <Celular>
          <svg width={748} height={1388} style={{ position: "absolute" }}>
            {/* mapa do bairro */}
            <rect width={748} height={1388} fill="#EDE6D6" />
            {[180, 470, 820, 1120].map((y) => (
              <rect key={y} x={0} y={y} width={748} height={46} fill="#FFFFFF" />
            ))}
            {[140, 420, 640].map((x) => (
              <rect key={x} x={x} y={0} width={46} height={1388} fill="#FFFFFF" />
            ))}
            <rect x={200} y={560} width={180} height={200} rx={12} fill="#BFE0B0" />
            <text x={290} y={670} textAnchor="middle" fontFamily={FONTE} fontWeight={700} fontSize={26} fill="#4A7A3A">
              PRAÇA
            </text>
            <g transform={`translate(374 700) rotate(${gira})`}>
              <circle r={120} fill="rgba(80,140,255,0.18)" />
              <path d="M 0 -100 L 34 20 L 0 0 L -34 20 Z" fill="#2F6FE0" />
            </g>
            <circle cx={374} cy={700} r={20} fill="#2F6FE0" stroke="#fff" strokeWidth={6} />
          </svg>
          {/* notificação: a marca do canal dentro da tela do celular */}
          <div style={{ position: "absolute", left: 30, right: 30, top: 90, background: "rgba(255,255,255,0.95)", borderRadius: 26, padding: "18px 26px", opacity: aviso, transform: `translateY(${(1 - aviso) * -30}px)`, boxShadow: "0 8px 20px rgba(0,0,0,0.15)", fontFamily: FONTE }}>
            <div style={{ fontWeight: 800, fontSize: 28, color: COR.tinta }}>@mundoparalelo.br</div>
            <div style={{ fontWeight: 700, fontSize: 30, color: "#555" }}>postou um vídeo novo: “E se cê virasse ímã?”</div>
          </div>
          <div style={{ position: "absolute", bottom: 60, left: 0, right: 0, textAlign: "center", fontFamily: FONTE, fontWeight: 800, fontSize: 44, color: COR.vermelho }}>CALIBRE A BÚSSOLA</div>
        </Celular>
      </AbsoluteFill>
    );
  }
  const tt = t - corte3;
  const k = entra(tt, 0.3, 0.5);
  return (
    <FundoDiagrama>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        {/* glóbulo vermelho e o ferro preso, átomo por átomo */}
        <ellipse cx={540} cy={680} rx={300} ry={200} fill="#C8322B" />
        <ellipse cx={540} cy={680} rx={170} ry={100} fill="#A82820" />
        {[
          [380, 620],
          [700, 620],
          [450, 760],
          [640, 760],
        ].map(([x, y], i) => (
          <g key={i} opacity={k}>
            <circle cx={x} cy={y} r={34} fill="#E8EEF8" />
            <text x={x} y={y + 12} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={32} fill={COR.tinta}>
              Fe
            </text>
          </g>
        ))}
        <g transform="translate(940 1480)" opacity={entra(tt, 1.0)}>
          <ImaU />
        </g>
        <path d="M 360 1380 L 720 1580 M 720 1380 L 360 1580" stroke={COR.vermelho} strokeWidth={30} strokeLinecap="round" opacity={entra(tt, 1.4)} />
      </svg>
      <Rotulo x={540} y={380} texto="FERRO DO SANGUE" tam={80} />
      <Rotulo x={540} y={960} texto="1 ÁTOMO DE CADA VEZ" tam={56} cor={COR.amarelo} op={k} />
      <Rotulo x={540} y={1760} texto="NÃO GRUDA" tam={110} cor={COR.vermelho} op={entra(tt, 1.4)} />
    </FundoDiagrama>
  );
};

// ---------- Cena 7: forte de perto, fraco de longe ----------
export const CenaDistancia: React.FC<PropsCena & { dobra?: number }> = ({ t, dobra = 1.2 }) => {
  const k = entra(t, dobra, 1.0);
  const barra2 = interpolate(k, [0, 1], [600, 75]);
  const carro = mod(t * 500, 1600) - 300;
  return (
    <FundoDiagrama>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        {[1, 2, 3].map((n) => (
          <circle key={n} cx={540} cy={760} r={n * 170} fill="none" stroke={COR.aurora} strokeWidth={10 / (n * n * n) + 1.5} opacity={0.9 / (n * n)} />
        ))}
        <Bruno x={540} y={900} escala={0.4} roupa="escola" brilho={0.8} />
        {/* carro passando longe, sem efeito nenhum */}
        <g transform={`translate(${carro} 1450)`}>
          <rect x={0} y={-80} width={260} height={70} rx={20} fill="#7A2E3A" />
          <rect x={40} y={-130} width={160} height={60} rx={20} fill="#7A2E3A" />
          <circle cx={60} cy={-10} r={28} fill="#1E1E22" />
          <circle cx={200} cy={-10} r={28} fill="#1E1E22" />
        </g>
        {/* barras: campo a 1× e a 2× da distância */}
        <rect x={180} y={1540} width={600} height={60} rx={14} fill={COR.amarelo} />
        <rect x={180} y={1650} width={barra2} height={60} rx={14} fill={COR.vermelho} />
      </svg>
      <Rotulo x={850} y={1570} texto="1×" tam={56} />
      <Rotulo x={850} y={1680} texto="2× LONGE" tam={60} op={k} />
      <Rotulo x={540} y={300} texto="FORTE DE PERTO" tam={90} cor={COR.amarelo} />
      <Rotulo x={540} y={1810} texto="8× MAIS FRACO" tam={96} cor={COR.vermelho} op={entra(t, dobra + 1.0)} />
    </FundoDiagrama>
  );
};

// ---------- Cena 8a: o ponto de ônibus com o lambe-lambe ----------
export const CenaPonto: React.FC<PropsCena> = ({ t }) => {
  const chega = interpolate(t, [0.4, 1.8], [1200, 640], { ...clamp, easing: (z) => 1 - Math.pow(1 - z, 3) });
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg,#9CC6E6,#F3D2AE)", transform: `scale(${1.04 + t * 0.03})` }}>
      <Camada blur={6}>
        <svg width={1080} height={1920}>
          <Sobrado x={-40} base={1400} l={460} a={640} cor="#C49A7A" />
          <Sobrado x={460} base={1400} l={380} a={520} cor="#A88BB0" />
          <Sobrado x={860} base={1400} l={300} a={700} cor="#E0BE96" />
          <PlacaLoja x={640} y={1230} texto="ADEGA 24H" cor="#2E6B4F" e={0.9} />
          <Arvore x={780} y={1400} />
          <Picho x={80} y={1360} />
        </svg>
      </Camada>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <rect x={0} y={1400} width={1080} height={160} fill="#B9B3A6" />
        <rect x={0} y={1560} width={1080} height={360} fill="#4A4C55" />
        {/* abrigo */}
        <rect x={60} y={760} width={560} height={30} fill="#5C6068" />
        <rect x={70} y={790} width={16} height={620} fill="#6B6F78" />
        <rect x={594} y={790} width={16} height={620} fill="#6B6F78" />
        <rect x={86} y={800} width={240} height={420} fill="#BFD9EA" opacity={0.4} />
        {/* lambe-lambes colados na lateral do abrigo */}
        <g transform="rotate(-3 200 1000)">
          <rect x={110} y={850} width={190} height={250} fill="#E9E1D0" />
          <rect x={122} y={862} width={166} height={120} fill={COR.aurora} opacity={0.6} />
          <text x={205} y={1020} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={30} fill={COR.tinta}>
            MUNDO PARALELO
          </text>
          <text x={205} y={1060} textAnchor="middle" fontFamily={FONTE} fontWeight={700} fontSize={22} fill={COR.tinta}>
            @mundoparalelo.br
          </text>
        </g>
        <g transform="rotate(4 420 980)">
          <rect x={350} y={880} width={150} height={190} fill="#F2C230" />
          <text x={425} y={980} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={32} fill={COR.tinta}>
            COMPRO
          </text>
          <text x={425} y={1020} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={32} fill={COR.tinta}>
            OURO
          </text>
        </g>
        <rect x={100} y={1250} width={480} height={30} rx={8} fill="#8C9099" />
        <rect x={0} y={1400} width={1080} height={10} fill="#F2C230" />
        <PlacaPonto x={680} y={1420} />
        <Lixeira x={40} y={1420} e={0.9} />
        <Cachorro x={180} y={1480} e={0.8} t={t} />
        <Bruno x={430} y={1520} escala={0.85} roupa="escola" mochila celular pose={{ bracoD: 150, antebracoD: 50 }} olhos="normal" brilho={0.4} />
        {/* busão chegando */}
        <g transform={`translate(${chega} 0)`}>
          <rect x={0} y={760} width={900} height={860} rx={40} fill="#F2F2EE" />
          <rect x={30} y={800} width={360} height={380} rx={20} fill="#1F3550" />
          <rect x={30} y={700} width={420} height={80} rx={10} fill="#111" />
          <text x={240} y={754} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={44} fill="#FFB020">
            3170 JD. AURORA
          </text>
          <rect x={0} y={1300} width={900} height={60} fill="#C8322B" />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// ---------- Cena 9b: diagrama do atrito ----------
export const CenaAtrito: React.FC<PropsCena> = ({ t }) => {
  const k = entra(t, 0.3, 0.5);
  return (
    <FundoDiagrama>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <rect x={760} y={260} width={140} height={1400} fill="#F2F2EE" />
        <rect x={760} y={700} width={140} height={50} fill="#C8322B" />
        <Bruno x={650} y={1080} escala={0.7} roupa="escola" mochila olhos="espanto" boca="o" brilho={0.6} pose={{ bracoE: 120, bracoD: 120 }} />
        <g opacity={k}>
          <Seta x1={380} x2={740} y={800} cor={COR.amarelo} />
        </g>
        <g opacity={entra(t, 1.0)}>
          <rect x={300} y={420} width={26} height={260} fill={COR.aurora} />
          <path d="M 313 360 L 270 440 L 356 440 Z" fill={COR.aurora} />
          <rect x={300} y={1330} width={26} height={260} fill={COR.vermelho} />
          <path d="M 313 1650 L 270 1570 L 356 1570 Z" fill={COR.vermelho} />
        </g>
      </svg>
      <Rotulo x={380} y={720} texto="PUXÃO" tam={60} cor={COR.amarelo} op={k} />
      <Rotulo x={313} y={310} texto="ATRITO" tam={60} cor={COR.aurora} op={entra(t, 1.0)} />
      <Rotulo x={313} y={1710} texto="PESO" tam={60} cor={COR.vermelho} op={entra(t, 1.0)} />
      <Rotulo x={540} y={1820} texto="IGUAL ÍMÃ DE GELADEIRA" tam={60} op={entra(t, 2.2)} />
    </FundoDiagrama>
  );
};

// ---------- Cena 10: respira, solta e cai na grama ----------
export const CenaRegra: React.FC<PropsCena & { corte?: number; cartaoDe?: number }> = ({ t, fala, corte = 4.2, cartaoDe = 2.6 }) => {
  if (t < corte) {
    const calma = interpolate(t, [0.3, Math.min(2.6, cartaoDe)], [0, 1], clamp);
    return (
      <AbsoluteFill>
        <CenaBusaoLado t={t + 10} calma={calma} fixo={1} bocaCalma={bate(t, fala)} />
        <Cartao s={t} de={cartaoDe} ate={corte} etiqueta="REGRA DO PODER #1" texto="NERVOSO = ÍMÃ MAIS FORTE" top={260} />
      </AbsoluteFill>
    );
  }
  const tt = t - corte;
  const rola = interpolate(tt, [0, 0.8], [0, 1], { ...clamp, easing: (z) => 1 - Math.pow(1 - z, 3) });
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg,#9CC6E6,#F3D2AE)", transform: `scale(${1.1 - tt * 0.02})` }}>
      <Camada blur={5}>
        <svg width={1080} height={1920}>
          <rect x={0} y={700} width={1080} height={700} fill="#E6DCC8" />
          <rect x={0} y={760} width={1080} height={50} fill="#2F5DA8" />
          <text x={540} y={796} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={34} fill="#fff" letterSpacing={3}>
            E.E. JARDIM AURORA
          </text>
          <g transform={`translate(${-200 - tt * 900} 0)`}>
            <rect x={0} y={1000} width={700} height={420} rx={30} fill="#F2F2EE" />
            <rect x={0} y={1260} width={700} height={50} fill="#C8322B" />
          </g>
        </svg>
      </Camada>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <rect x={0} y={1400} width={1080} height={520} fill="#5FA052" />
        <Arvore x={900} y={1440} e={1.1} />
        <Bicicleta x={760} y={1560} />
        <Lixeira x={980} y={1520} />
        {[[120, 1800], [420, 1880], [980, 1760], [640, 1840]].map(([x, y], i) => (
          <g key={i}>
            {[0, 72, 144, 216, 288].map((a) => (
              <circle key={a} cx={x + 12 * Math.cos((a * Math.PI) / 180)} cy={y + 12 * Math.sin((a * Math.PI) / 180)} r={9} fill={i % 2 ? "#F4F4F0" : "#F2C230"} />
            ))}
            <circle cx={x} cy={y} r={7} fill="#E6862E" />
          </g>
        ))}
        {new Array(40).fill(0).map((_, i) => (
          <path key={i} d={`M ${(i * 57) % 1080} ${1420 + ((i * 131) % 480)} l 8 -26 l 8 26`} fill="#4E8A43" />
        ))}
        <g transform={`translate(${interpolate(rola, [0, 1], [200, 560])} 1640) rotate(${interpolate(rola, [0, 1], [-200, -90])})`}>
          <Bruno x={0} y={0} escala={0.8} roupa="escola" mochila olhos="fechado" boca="sorriso" pose={{ bracoE: 60, bracoD: 60 }} />
        </g>
        {rola > 0.9 &&
          [0, 1, 2].map((i) => (
            <circle key={i} cx={260 + Math.cos(tt * 5 + i * 2.1) * 70} cy={1580 + Math.sin(tt * 5 + i * 2.1) * 24} r={12} fill={COR.amarelo} />
          ))}
      </svg>
    </AbsoluteFill>
  );
};

// Grama vista de cima, com tufos e florzinhas (fundo dos closes na frente da escola).
const Grama: React.FC = () => (
  <svg width={1080} height={1920} style={{ position: "absolute" }}>
    {new Array(70).fill(0).map((_, i) => (
      <path key={i} d={`M ${(i * 157) % 1080} ${(i * 263) % 1920} l 10 -30 l 10 30 l 8 -22 l 6 22`} fill="#4E8A43" />
    ))}
    {new Array(14).fill(0).map((_, i) => (
      <g key={`f${i}`}>
        <circle cx={(i * 331 + 90) % 1080} cy={(i * 547 + 200) % 1920} r={11} fill={i % 2 ? "#F4F4F0" : "#F2C230"} />
        <circle cx={(i * 331 + 90) % 1080} cy={(i * 547 + 200) % 1920} r={5} fill="#E6862E" />
      </g>
    ))}
  </svg>
);

// ---------- Cena 11: a mensagem do O. e o Olheiro indo embora no busão ----------
export const CenaMensagem: React.FC<PropsCena & { corte1?: number; corte2?: number }> = ({ t, fala, corte1 = 4.6, corte2 = 7.0 }) => {
  const p = plano(t, [corte1, corte2]);
  if (p === 0) {
    const vib = t < 0.8 ? Math.sin(t * 90) * 6 : 0;
    const msg = entra(t, 0.6);
    return (
      <AbsoluteFill style={{ background: "#5FA052" }}>
        <Grama />
        <Celular vib={vib}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,#1F2A44,#121826)" }} />
          <div style={{ position: "absolute", top: 120, width: "100%", textAlign: "center", fontFamily: FONTE, fontWeight: 700, fontSize: 120, color: "#fff" }}>07:52</div>
          <div style={{ position: "absolute", left: 50, right: 50, top: 420, background: "rgba(255,255,255,0.12)", borderRadius: 34, padding: "30px 36px", opacity: msg, transform: `translateY(${(1 - msg) * 40}px)` }}>
            <div style={{ fontFamily: FONTE, fontWeight: 700, fontSize: 34, color: COR.aurora, letterSpacing: 2 }}>NÚMERO DESCONHECIDO</div>
            <div style={{ fontFamily: FONTE, fontWeight: 700, fontSize: 52, color: "#fff", marginTop: 14, lineHeight: 1.15 }}>
              Goleiro que segura busão segura qualquer pênalti. Te vejo na final.
            </div>
            <div style={{ fontFamily: FONTE, fontWeight: 800, fontSize: 52, color: COR.aurora, marginTop: 12 }}>— O.</div>
          </div>
        </Celular>
      </AbsoluteFill>
    );
  }
  if (p === 1) {
    const tt = t - corte1;
    const longe = interpolate(tt, [0, 2.4], [1, 0.7]);
    const verde = tt > 0.9 && tt < 1.0 ? 1 : tt > 1.6 ? 1 : 0;
    return (
      <AbsoluteFill style={{ background: "linear-gradient(180deg,#9CC6E6,#F3D2AE)" }}>
        <Camada blur={5}>
          <svg width={1080} height={1920}>
            <Sobrado x={-40} base={1300} l={420} a={600} cor="#C49A7A" />
            <Sobrado x={700} base={1300} l={420} a={700} cor="#A88BB0" />
          </svg>
        </Camada>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <rect x={0} y={1300} width={1080} height={620} fill="#4A4C55" />
          {/* traseira do busão indo embora, com o Olheiro no vidro de trás */}
          <g transform={`translate(540 1500) scale(${longe}) translate(-540 -1500)`}>
            <rect x={190} y={620} width={700} height={900} rx={40} fill="#F2F2EE" />
            <rect x={240} y={680} width={600} height={420} rx={20} fill="#1F3550" />
            <svg x={240} y={680} width={600} height={420}>
              <Olheiro x={300} y={720} escala={0.7} olhosVerdes={verde} apito={34} />
            </svg>
            <rect x={190} y={1220} width={700} height={50} fill="#C8322B" />
            <rect x={230} y={1300} width={110} height={60} rx={10} fill="#FF4B4B" />
            <rect x={740} y={1300} width={110} height={60} rx={10} fill="#FF4B4B" />
            <rect x={430} y={1380} width={220} height={60} rx={6} fill="#E8E2C8" />
          </g>
        </svg>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{ background: "#5FA052" }}>
        <Grama />
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <Bruno x={540} y={2800} escala={2.3} roupa="escola" mochila olhos="normal" boca={bate(t, fala)} pose={{ cabeca: -8 }} />
        {/* o celular grudado na testa */}
        <g transform="translate(560 1400) rotate(-8)">
          <rect x={-60} y={-100} width={120} height={200} rx={20} fill="#1d1d22" />
          <rect x={-50} y={-88} width={100} height={176} rx={14} fill="#2E3B57" />
        </g>
      </svg>
      <Rotulo x={540} y={360} texto="?" tam={220} cor={COR.amarelo} />
    </AbsoluteFill>
  );
};

// ---------- Cena 12b: close do "se fudeu" ----------
export const CenaSeFudeu: React.FC<PropsCena> = ({ t, fala }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#3E8E6E", transform: `scale(${1 + t * 0.04})` }}>
      <svg width={1080} height={1920} style={{ position: "absolute", opacity: 0.4 }}>
        <defs>
          <pattern id="alambrado2" width={90} height={90} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width={90} height={90} fill="none" stroke="#2A2A30" strokeWidth={6} />
          </pattern>
        </defs>
        <rect width={1080} height={1920} fill="url(#alambrado2)" />
      </svg>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <Bruno x={540} y={2850} escala={2.4} roupa="escola" mochila olhos="espanto" boca={bate(t, fala, "neutra")} brilho={0.5 + 0.2 * Math.sin(f / 3)} />
      </svg>
    </AbsoluteFill>
  );
};
