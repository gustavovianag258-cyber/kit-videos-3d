import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from "remotion";
import { entra, FundoDiagrama, plano, Rotulo } from "../aurora/cenas2";
import { Cartao, clamp, COR, FONTE, Placa } from "../aurora/estilo";
import { Celular } from "../aurora-ep2/cenas2";
import { Chiado, Faiscas, Flash, Onom, tremor, Velocidade } from "../aurora-ep3/efeitos";
import { GuaritaFora, LambeLambe, PortaoGrade, Predio } from "../aurora-ep3/objetos";
import { Esqueleto, Feixe, Gente, MaoOssos } from "./corpo";
import { Bloco, Moto, Padaria, Quarto, RuaFundo } from "./fundos";
import { CABECA_Y, Janela, Kaique, OlheiroBloco, SeuEdson, SeuZe } from "./pessoa";
import { Balanca, Fumaca, Poeirinha } from "./vida";

// Todas as cenas do ep. 4, refeitas pra ter movimento o tempo todo (pedido do usuário: "mais vivo,
// menos artificial"). Regra daqui: ninguém fica parado, todo plano tem alguma coisa atravessando
// e a câmera nunca está quieta. `t` = segundos desde o começo da cena.

export type PropsCena = { t: number; fala?: Janela[] };

const Zoom: React.FC<{ z: number; ox: number; oy: number; dx?: number; dy?: number; children: React.ReactNode }> = ({ z, ox, oy, dx = 0, dy = 0, children }) => (
  <AbsoluteFill style={{ transform: `translate(${dx}px, ${dy}px) scale(${z})`, transformOrigin: `${ox}px ${oy}px`, overflow: "hidden" }}>{children}</AbsoluteFill>
);
const Tela: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1080} height={1920} style={{ position: "absolute" }}>
    {children}
  </svg>
);

const pisca = (t: number) => 0.9 + Math.sin(t * 7) * 0.1;
const suave = (t: number, a: number, b: number, v0: number, v1: number) => interpolate(t, [a, b], [v0, v1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
const freia = (t: number, a: number, b: number, v0: number, v1: number) => interpolate(t, [a, b], [v0, v1], { ...clamp, easing: Easing.out(Easing.cubic) });
// ---------- o Kaique pilotando ----------
const POSE_MOTO = { pernaE: -58, joelhoE: 48, pernaD: -72, joelhoD: 62, bracoE: -52, antebracoE: -10, bracoD: 48, antebracoD: -6, tronco: 8 };
export const Piloto: React.FC<{ x: number; y: number; e?: number; v?: number; t: number; raio?: number; fala?: Janela[]; olha?: number; boca?: "neutra" | "aberta" | "o" | "sorriso" | "dentes"; olhos?: "normal" | "espanto" | "cima"; ardendo?: number; capacete?: boolean }> = ({
  x,
  y,
  e = 1,
  v = 0,
  t,
  raio = 0,
  fala,
  olha = 0.8,
  boca,
  olhos,
  ardendo,
  capacete = true,
}) => {
  const tg = useCurrentFrame() / 30;
  const vib = v > 0 ? Math.sin(tg * 58) * 1.8 : Math.sin(tg * 30) * 0.6;
  return (
    <g transform={`translate(${x} ${y + vib}) scale(${e})`}>
      <Moto x={0} y={0} giro={tg * v * 0.9} />
      <Kaique x={-24} y={92} escala={0.8} sombra={false} capacete={capacete} raio={raio} olha={olha} t={t} fala={fala} boca={boca} olhos={olhos} ardendo={ardendo} pose={POSE_MOTO} />
    </g>
  );
};
export const cabecaMoto = (x: number, y: number, e = 1): [number, number] => [x + 14 * e, y - 438 * e];
const Farol: React.FC<{ x: number; y: number; e?: number; forca?: number }> = ({ x, y, e = 1, forca = 1 }) => (
  <g opacity={forca}>
    <defs>
      <linearGradient id="farol" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stopColor="#FFF4C4" stopOpacity={0.75} />
        <stop offset="1" stopColor="#FFF4C4" stopOpacity={0} />
      </linearGradient>
    </defs>
    <polygon points={`${x + 150 * e},${y - 200 * e} ${x + 900 * e},${y - 300 * e} ${x + 900 * e},${y + 40 * e}`} fill="url(#farol)" />
  </g>
);

// ---------- 1: gancho ----------
export const CenaGancho: React.FC<PropsCena & { c1: number; c2: number }> = ({ t, c1, c2 }) => {
  const tg = useCurrentFrame() / 30;
  const p = plano(t, [c1, c2]);
  const MX = 300;
  const MY = 1590;
  const [hx, hy] = cabecaMoto(MX, MY, 1.2);
  if (p === 0) {
    const pan = freia(t, 0, c1 - 0.1, 0, 760);
    const x = freia(t, 0, c1 - 0.1, -280, MX);
    const v = Math.max(0, 1 - t / (c1 - 0.1)) * 1100;
    return (
      <Zoom z={1.02 + t * 0.03} ox={500} oy={1300}>
        <RuaFundo t={t} pan={pan} transito={false} gente={false} semPoste>
          <Bloco x={430 + (760 - pan) * 0.3} y={1150} e={1} raio={0} t={tg} />
        </RuaFundo>
        <Tela>
          <Poeirinha t={t - (c1 - 0.5)} x={x - 120} y={MY} forca={1.2} />
          <Piloto x={x} y={MY} e={1.2} v={v} t={t} />
        </Tela>
        <Velocidade t={t} vertical={false} forca={0.6 * (v / 1100)} />
      </Zoom>
    );
  }
  if (p === 1) {
    const tt = t - c1;
    return (
      <Zoom z={freia(tt, 0, 0.8, 2.3, 2.7)} ox={hx} oy={hy} dx={540 - hx}>
        <RuaFundo t={t} pan={760} transito={false} gente={false} semPoste>
          <Bloco x={430} y={1150} e={1} raio={tt > 0.2 ? 1 : 0} t={tg} />
        </RuaFundo>
        <Tela>
          <Feixe t={t} x={hx + 14} y={hy} ang={-26} comp={1300} abre={190} forca={pisca(t) * entra(tt, 0.15, 0.1)} id="g2" />
          <Piloto x={MX} y={MY} e={1.2} t={t} raio={entra(tt, 0.1, 0.15)} olhos="espanto" boca="aberta" olha={suave(tt, 0, 0.5, 0.9, 0.2)} />
        </Tela>
                <Flash t={tt - 0.12} forca={0.15} cor="#B8FFE0" />
      </Zoom>
    );
  }
  const tt = t - c2;
  return (
    <Zoom z={freia(tt, 0, 1.2, 1.28, 1.06)} ox={700} oy={1200}>
      <RuaFundo t={t} pan={760} raioGente={1} semPoste>
        <Bloco x={430} y={1150} e={1} raio={1} t={tg} />
      </RuaFundo>
      <Tela>
        <Feixe t={t} x={hx + 14} y={hy} ang={-30 + Math.sin(t * 1.4) * 6} comp={1300} abre={170} forca={pisca(t)} id="g3" />
        <Piloto x={MX} y={MY} e={1.2} t={t} raio={1} olhos="espanto" boca="sorriso" />
      </Tela>
      <Onom t={tt} texto="ZZZIP!" x={760} y={900} tam={120} ang={8} dur={0.8} cor={COR.aurora} />
    </Zoom>
  );
};

// ---------- 3: a última entrega da madrugada, de moto, debaixo do céu verde ----------
export const CenaNoite: React.FC<PropsCena & { placa: number; vinte: number; lindo: number }> = ({ t, fala, placa, vinte, lindo }) => {
  const p = plano(t, [vinte, lindo]);
  const V = 1050;
  if (p < 2) {
    const MX = 430;
    const MY = 1590;
    return (
      <AbsoluteFill>
        <Zoom z={p === 1 ? 1.75 + (t - vinte) * 0.06 : 1.03 + t * 0.012} ox={p === 1 ? MX + 40 : 540} oy={p === 1 ? MY - 300 : 1300}>
          <RuaFundo t={t} noite pan={t * V} transito={false} gente={false} />
          <Tela>
            <Farol x={MX} y={MY} e={1.2} />
            <Poeirinha t={(t * 2) % 0.9} x={MX - 210} y={MY - 30} forca={0.6} />
            <Piloto x={MX} y={MY} e={1.2} v={V} t={t} />
          </Tela>
          <Velocidade t={t} vertical={false} forca={0.5} />
        </Zoom>
        <Placa s={t} de={placa} ate={placa + 3} nome="KAIQUE" desc="20 · ENTREGADOR" x={540} y={760} />
      </AbsoluteFill>
    );
  }
  // desceu da moto e olha pro céu
  const tt = t - lindo;
  const x = freia(tt, 0, 0.8, 260, 560);
  return (
    <Zoom z={freia(tt, 0, 2.6, 1.34, 1.12)} ox={560} oy={1300}>
      <RuaFundo t={t} noite pan={300} gente={false} />
      <Tela>
        <Moto x={190} y={1590} e={1.2} />
        <Kaique x={x} y={1650} escala={0.95} mochila olhos="cima" olha={tt < 0.8 ? 0.7 : 0} anda={tt < 0.75 ? 0.9 : 0} t={t} fala={fala} pose={{ cabeca: -8 }} />
      </Tela>
    </Zoom>
  );
};

// ---------- 4: acorda e vê o osso (primeira pessoa) ----------
const Despertador: React.FC<{ x: number; y: number; toca: boolean; t: number }> = ({ x, y, toca, t }) => {
  const a = toca ? Math.sin(t * 60) * 3 : 0;
  return (
    <g transform={`translate(${x} ${y}) rotate(${a})`}>
      <circle cx={-26} cy={-62} r={15} fill="#C8322B" />
      <circle cx={26} cy={-62} r={15} fill="#C8322B" />
      <circle cx={0} cy={-34} r={36} fill="#E8E4D8" stroke="#C8322B" strokeWidth={7} />
      <path d="M 0 -34 L 0 -56 M 0 -34 L 14 -30" stroke="#2A2230" strokeWidth={4} strokeLinecap="round" />
    </g>
  );
};
// gato visto pelo raio-x: anda com as patas e abana o rabo devagar
const GatoOsso: React.FC<{ x: number; y: number; e?: number }> = ({ x, y, e = 1 }) => {
  const tg = useCurrentFrame() / 30;
  const s = Math.sin(tg * 6);
  const perna = (px: number, a: number) => <path key={px} d={`M ${px} -90 L ${px} -20`} strokeWidth={9} transform={`rotate(${a} ${px} -90)`} />;
  return (
    <g transform={`translate(${x} ${y}) scale(${-e} ${e})`} stroke="#EDE8DA" strokeWidth={10} strokeLinecap="round" fill="none">
      <path d="M -90 -90 L 90 -90" />
      {[-70, -40, -10, 20, 50].map((rx) => (
        <path key={rx} d={`M ${rx} -90 q 6 -34 0 -60`} strokeWidth={7} />
      ))}
      {perna(-80, s * 16)}
      {perna(-50, -s * 16)}
      {perna(60, -s * 16)}
      {perna(90, s * 16)}
      <path d={`M 100 -90 q ${60 + Math.sin(tg * 2.4) * 16} -30 ${44 + Math.sin(tg * 2.4) * 20} -110`} />
      <circle cx={-118} cy={-122} r={34} fill="#EDE8DA" />
      <path d="M -142 -150 l 8 -30 l 18 22 M -110 -152 l 12 -28 l 12 30" strokeWidth={7} />
      <circle cx={-128} cy={-126} r={7} fill="#0E3B2C" stroke="none" />
      <circle cx={-106} cy={-126} r={7} fill="#0E3B2C" stroke="none" />
    </g>
  );
};

export const CenaOsso: React.FC<PropsCena & { olhou: number; mao: number; viu: number; osso: number; caralho: number; gato: number }> = ({ t, fala, olhou, viu, osso, caralho, gato }) => {
  const p = plano(t, [olhou, caralho, gato]);
  if (p === 0) {
    // espreguiça, despertador tocando
    const k = suave(t, 0, olhou, 8, 150);
    return (
      <Zoom z={1.1 + t * 0.03} ox={500} oy={1200}>
        <Quarto t={t} frente={<>
          <Kaique x={500} y={1640} escala={0.95} olhos="fechado" boca="aberta" gesto={false} pose={{ bracoD: k, bracoE: k, cabeca: 4 }} />
          <Despertador x={760} y={1235} toca t={t} />
        </>} />
        <Onom t={t} texto="BRRIIIM!" x={800} y={1000} tam={80} ang={8} dur={olhou + 0.2} />
      </Zoom>
    );
  }
  if (p === 1) {
    // PRIMEIRA PESSOA: é o olho dele. A mão sobe devagar, ele olha, e o raio-x varre do punho aos dedos.
    const tt = t - olhou;
    const varre = suave(t, viu - 0.1, osso + 0.1, 0, 1);
    return (
      <AbsoluteFill>
        <Quarto t={t} blur={18} />
        <Tela>
          <MaoOssos x={540 + Math.sin(t * 0.9) * 7} y={freia(tt, 0, 0.75, 1750, 860) + Math.sin(t * 1.3) * 5} e={2.15} rot={-3 + Math.sin(t * 0.7) * 1.2} raio={varre} />
        </Tela>
        {varre > 0 && <AbsoluteFill style={{ background: COR.aurora, opacity: varre * 0.06 }} />}
      </AbsoluteFill>
    );
  }
  if (p === 2) {
    // o susto: dá um passo pra trás, com a mão na frente do rosto, sem acreditar
    const tt = t - caralho;
    const recua = freia(tt, 0, 0.25, 0, 46);
    const anda = tt < 0.22 ? 1.6 : 0;
    return (
      <Zoom z={1.42 + tt * 0.02} ox={540} oy={1120} dx={tremor(tt, 5, 0.2)}>
        <Quarto t={t} clarao={0.3} frente={<Kaique x={560 - recua} y={1640} escala={0.95} olhos="espanto" boca="aberta" raio={1} t={t} fala={fala} gesto={false} anda={anda} olha={0.5} pose={{ bracoD: 34, antebracoD: -118, bracoE: 10, cabeca: 7, tronco: -3 - freia(tt, 0, 0.25, 0, 2) }} />} />
      </Zoom>
    );
  }
  // PRIMEIRA PESSOA de novo: a parede some e dá pra ver o apartamento da vizinha
  const tt = t - gato;
  const abre = suave(tt, 0, 0.45, 0, 1);
  return (
    <AbsoluteFill>
      <Quarto t={t} blur={8} />
      <AbsoluteFill style={{ background: "#0B2F24", opacity: abre * 0.93 }} />
      <Tela>
        <g opacity={abre}>
          <rect x={0} y={1400} width={1080} height={520} fill="#123F31" />
          {/* móveis da vizinha, em raio-x */}
          <g stroke="#6FE6B8" strokeWidth={5} fill="none" opacity={0.45}>
            <rect x={70} y={1080} width={320} height={320} />
            <line x1={230} y1={1080} x2={230} y2={1400} />
            <rect x={640} y={860} width={280} height={200} />
            <path d="M 620 1400 L 620 1250 Q 620 1190 690 1190 L 930 1190 Q 1000 1190 1000 1250 L 1000 1400 Z" />
          </g>
          <g transform={`translate(${760 + Math.sin(t * 1.1) * 60} 1410) scale(0.82)`}>
            <Esqueleto x={0} y={0} e={1} semente={2} />
            <line x1={92} y1={-430} x2={150 + Math.sin(t * 3.4) * 26} y2={-6} stroke="#EDE8DA" strokeWidth={12} />
          </g>
          <GatoOsso x={interpolate(tt, [0, 3], [40, 470])} y={1560} e={1.35} />
        </g>
      </Tela>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 55%, transparent 55%, rgba(0,0,0,0.45) 100%)" }} />
    </AbsoluteFill>
  );
};

// ---------- 5: a regra liga/desliga ----------
export const CenaRegra: React.FC<PropsCena & { liga: number; piscou: number; desliga: number; firmeza: number; interruptor: number }> = ({ t, fala, liga, piscou, desliga, firmeza, interruptor }) => {
  const p = plano(t, [piscou, firmeza, interruptor]);
  let cena: React.ReactNode;
  if (p === 0) {
    const a = Math.sin(t * 1.2) * 7;
    const hy = 1640 - CABECA_Y * 0.95;
    cena = (
      <Zoom z={1.62 + t * 0.03} ox={380} oy={1040} dx={160}>
        <Quarto t={t} clarao={0.6} frente={<>
          <Feixe t={t} x={400} y={hy} ang={a} comp={1000} abre={110} forca={pisca(t)} id="r5" />
          <Kaique x={380} y={1640} escala={0.95} raio={1} olhos="espanto" boca="sorriso" olha={a / 28} pose={{ cabeca: a * 0.35 }} />
        </>} />
              </Zoom>
    );
  } else if (p === 1) {
    // close nos olhos: fecha, desliga, abre normal, testa de novo
    const tt = t - piscou;
    const fecha = tt < 0.32 || (t > desliga + 0.25 && t < desliga + 0.42);
    cena = (
      <Zoom z={3.2 + tt * 0.06} ox={420} oy={1000} dx={120}>
        <Quarto t={t} blur={10} frente={<Kaique x={420} y={1640} escala={0.95} boca="neutra" olha={Math.sin(tt * 1.4) * 0.2} piscar={fecha} pose={{ cabeca: Math.sin(tt * 1.1) * 2 }} />} />
      </Zoom>
    );
  } else if (p === 2) {
    const tt = t - firmeza;
    cena = (
      <Zoom z={1.2 + tt * 0.03} ox={540} oy={1200}>
        <Quarto t={t} clarao={0.4} frente={<Kaique x={540} y={1640} escala={0.95} raio={1} boca="sorriso" gesto={false} pose={{ bracoD: suave(tt, 0, 0.3, 8, 36), antebracoD: suave(tt, 0, 0.3, 0, -120) }} />} />
              </Zoom>
    );
  } else {
    // brinca com o interruptor da parede, pulando a cada clique
    const tt = t - interruptor;
    const n = Math.floor(tt / 0.5);
    const on = n % 2 === 0;
    const passo = tt - n * 0.5;
    cena = (
      <Zoom z={1.1 + tt * 0.03} ox={560} oy={1100}>
        <Quarto t={t} clarao={on ? 0.5 : 0} frente={<>
          <g transform="translate(790 1060)">
            <rect x={-90} y={-130} width={180} height={260} rx={22} fill="#F4F0E6" stroke="#CFC8B6" strokeWidth={6} />
            <rect x={-34} y={-90} width={68} height={180} rx={14} fill="#C9C4B4" />
            <rect x={-30} y={on ? -86 : 0} width={60} height={86} rx={12} fill={on ? COR.aurora : "#9A958A"} />
          </g>
          <Kaique x={500} y={1640} escala={0.95} t={t} fala={fala} gesto={false} boca="sorriso" olhos="normal" raio={on ? 1 : 0} piscar={passo < 0.1} olha={0.6} pose={{ bracoD: 72 + (on ? 4 : -4) * Math.min(1, passo / 0.08), antebracoD: -6 }} />
        </>} />
        <Onom t={passo} texto={on ? "CLIC!" : "CLAC!"} x={790} y={840} tam={66} ang={-4} dur={0.3} cor={COR.amarelo} />
      </Zoom>
    );
  }
  return (
    <AbsoluteFill>
      {cena}
      <Cartao s={t} de={liga} ate={Math.min(firmeza + 0.6, interruptor)} etiqueta="REGRA DO PODER #1" texto="OLHOU = LIGA · PISCOU = DESLIGA" top={290} />
    </AbsoluteFill>
  );
};

// ---------- 7: pizzaria ----------
const Massa: React.FC<{ x: number; y: number; e?: number; giro: number }> = ({ x, y, e = 1, giro }) => (
  <g transform={`translate(${x} ${y}) scale(${e})`}>
    <ellipse rx={92} ry={24 + Math.abs(Math.sin(giro)) * 16} fill="#F2DDB0" />
    <ellipse rx={70} ry={14 + Math.abs(Math.sin(giro)) * 12} fill="#E8CD94" />
    <circle cx={Math.cos(giro) * 54} cy={Math.sin(giro) * 12} r={5} fill="#C99A5A" />
    <circle cx={Math.cos(giro + 2) * 40} cy={Math.sin(giro + 2) * 10} r={4} fill="#C99A5A" />
  </g>
);
const FundoPizza: React.FC = () => {
  const tg = useCurrentFrame() / 30;
  const ch = (k: number) => 1 + Math.sin(tg * 13 + k) * 0.12 + Math.sin(tg * 21 + k) * 0.06;
  return (
    <Tela>
      {new Array(10).fill(0).map((_, i) => new Array(18).fill(0).map((__, j) => <rect key={`${i}${j}`} x={i * 110} y={j * 110} width={106} height={106} fill={(i + j) % 2 ? "#F1E4C8" : "#E7D5B0"} />))}
      <rect x={0} y={0} width={1080} height={1500} fill="url(#luzPizza)" />
      <defs>
        <linearGradient id="luzPizza" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity={0.15} />
          <stop offset="1" stopColor="#000" stopOpacity={0.22} />
        </linearGradient>
      </defs>
      <rect x={0} y={1500} width={1080} height={420} fill="#7A5C44" />
      <g transform="translate(90 1290)">
        <rect x={0} y={-500} width={460} height={500} rx={24} fill="#8C4B3A" />
        {new Array(7).fill(0).map((_, i) => (
          <line key={i} x1={0} y1={-460 + i * 66} x2={460} y2={-460 + i * 66} stroke="rgba(0,0,0,0.15)" strokeWidth={4} />
        ))}
        <path d="M 40 -20 L 40 -280 Q 40 -360 230 -360 Q 420 -360 420 -280 L 420 -20 Z" fill="#241510" />
        <g transform={`translate(230 -20) scale(${ch(0)} ${ch(1)})`}>
          <path d="M -130 0 Q -120 -130 -60 -150 Q -50 -90 -10 -190 Q 30 -100 70 -140 Q 110 -80 130 0 Z" fill="#FF8A2C" />
          <path d="M -80 0 Q -70 -80 -30 -90 Q -10 -60 10 -120 Q 50 -60 80 0 Z" fill="#FFD27A" />
        </g>
        <rect x={120} y={-560} width={210} height={70} fill="#6E4C34" />
      </g>
      <Fumaca x={320} y={720} n={7} sobe={500} />
      <rect x={590} y={390} width={420} height={140} rx={14} fill="#B3262C" />
      <text x={800} y={490} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={64} fill="#FFF3D6">
        FORNO DO ZÉ
      </text>
      <rect x={660} y={600} width={280} height={190} fill="#F4ECDD" stroke="#6E5C46" strokeWidth={6} />
      <text x={800} y={665} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={40} fill="#6E5C46">
        CARDÁPIO
      </text>
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={700} y={690 + i * 22} width={200} height={8} rx={3} fill="#9AA" />
      ))}
      {/* lâmpada balançando e prateleira com latas */}
      <Balanca x={610} y={0} forca={5} vel={1.6}>
        <line x1={610} y1={0} x2={610} y2={250} stroke="#333" strokeWidth={5} />
        <path d="M 560 300 L 660 300 L 630 250 L 590 250 Z" fill="#2F5DA8" />
        <circle cx={610} cy={300} r={18} fill="#FFF0B8" />
      </Balanca>
      <rect x={640} y={900} width={380} height={18} fill="#6E4C34" />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={660 + i * 72} y={830} width={52} height={70} rx={6} fill={["#C8322B", "#E6B83A", "#3C8C6A", "#C8322B", "#2F5DA8"][i]} />
      ))}
    </Tela>
  );
};

export const CenaPizza: React.FC<PropsCena & { conferir: number; cebola: number; instinto: number; zeno: number }> = ({ t, fala, conferir, cebola, instinto, zeno }) => {
  const p = plano(t, [conferir, cebola, instinto, zeno]);
  const ZX = 800;
  const ZY = 1600;
  const zeCab = ZY - CABECA_Y * 0.95;
  const salao = (kx: number, caixaX: number, ze: React.ReactNode, kaique: React.ReactNode) => (
    <>
      <FundoPizza />
      <Tela>
        {ze}
        <rect x={0} y={1290} width={1080} height={350} fill="#A67B55" />
        <rect x={0} y={1290} width={1080} height={22} fill="#C99062" />
        <rect x={0} y={1312} width={1080} height={10} fill="rgba(0,0,0,0.2)" />
        <rect x={caixaX} y={1198} width={230} height={92} rx={6} fill="#C98B4E" />
        <rect x={caixaX} y={1198} width={230} height={18} fill="#B07A3E" />
        <g transform="translate(860 1290)">
          <Balanca x={0} y={-100} forca={1} vel={1.2}>
            <rect x={-60} y={-100} width={120} height={100} fill="#fff" />
            <text x={0} y={-60} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={26} fill="#C9382F">
              SEM
            </text>
            <text x={0} y={-28} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={26} fill="#C9382F">
              CEBOLA
            </text>
          </Balanca>
        </g>
        {kaique}
        <circle cx={kx} cy={0} r={0} />
      </Tela>
    </>
  );
  if (p === 0) {
    // Seu Zé rodando a massa no ar, Kaique chega andando
    const up = Math.abs(Math.sin(t * 2.6));
    const kx = freia(t, 0, 1.1, -120, 230);
    return (
      <Zoom z={1.06 + t * 0.03} ox={540} oy={1100}>
        {salao(
          kx,
          1200,
          <>
            <SeuZe x={ZX} y={ZY} escala={0.95} boca="sorriso" olha={-0.3} olhos="cima" pose={{ bracoD: 142 + up * 12, bracoE: 142 + up * 12, antebracoD: -18, antebracoE: -18 }} />
            <Massa x={ZX} y={zeCab - 190 - up * 130} giro={t * 6} />
          </>,
          <Kaique x={kx} y={1720} escala={0.95} mochila olha={0.6} anda={t < 1.05 ? 0.8 : 0} />,
        )}
      </Zoom>
    );
  }
  if (p === 1) {
    // caixa desliza no balcão e bate no lugar; ele já liga o olho
    const tt = t - conferir;
    const cx = freia(tt, 0, 0.45, 1000, 480);
    return (
      <Zoom z={1.72 - tt * 0.03} ox={560} oy={1240}>
        {salao(
          230,
          cx,
          <SeuZe x={ZX} y={ZY} escala={0.95} boca="sorriso" olha={-0.7} pose={{ bracoE: 60, antebracoE: -60 }} />,
          <>
            <Feixe t={t} x={250} y={1720 - CABECA_Y * 0.95} ang={32} comp={460} abre={70} forca={entra(tt, 0.5, 0.2) * pisca(t)} id="pz" />
            <Kaique x={230} y={1720} escala={0.95} mochila olha={0.7} raio={entra(tt, 0.5, 0.2)} olhos="espanto" pose={{ tronco: 4, cabeca: 8 }} />
          </>,
        )}
              </Zoom>
    );
  }
  if (p === 2) {
    // raio-x na caixa: a tampa some, uma linha de leitura passa e as cebolas pulam
    const tt = t - cebola;
    const fade = interpolate(tt, [0.1, 0.8], [1, 0.15], clamp);
    const scan = -300 + ((tt * 0.8) % 1) * 600;
    return (
      <AbsoluteFill style={{ background: "#0B1620" }}>
        <Tela>
          <g transform={`translate(540 900) scale(${0.96 + tt * 0.015})`}>
            <rect x={-420} y={-300} width={840} height={600} rx={20} fill="#C98B4E" opacity={fade} />
            <rect x={-420} y={-300} width={840} height={600} rx={20} fill="none" stroke={COR.aurora} strokeWidth={8} />
            <circle r={250} fill="#E8B04A" />
            <circle r={226} fill="#C9382F" opacity={0.85} />
            {[[-80, -60], [90, -90], [-110, 90], [60, 100], [160, 10], [-30, 10]].map(([cx, cy], i) => (
              <circle key={i} cx={cx} cy={cy} r={34} fill="#8E2A22" />
            ))}
            {[[-150, -130, 0], [140, 40, 1], [-40, 150, 2], [20, -150, 3]].map(([cx, cy, i]) => {
              const m = freia(tt, 0.45 + i * 0.13, 0.75 + i * 0.13, 0, 1);
              return (
                <g key={i} transform={`translate(${cx} ${cy}) scale(${0.6 + m * 0.5})`}>
                  <ellipse rx={50} ry={24} fill="none" stroke="#F4ECDD" strokeWidth={9} />
                  <ellipse rx={30} ry={14} fill="none" stroke="#F4ECDD" strokeWidth={8} />
                  <ellipse rx={70} ry={42} fill="none" stroke={COR.vermelho} strokeWidth={6} opacity={entra(tt, 0.45 + i * 0.13, 0.15)} />
                </g>
              );
            })}
            <rect x={-420} y={scan} width={840} height={14} fill={COR.aurora} opacity={0.75} />
            <rect x={-420} y={scan - 50} width={840} height={50} fill={COR.aurora} opacity={0.14} />
          </g>
          <rect width={1080} height={1920} fill={COR.aurora} opacity={0.1} />
        </Tela>
        <Onom t={tt - 0.7} texto="CEBOLA!" x={540} y={470} tam={120} ang={-3} dur={1.2} cor={COR.vermelho} />
              </AbsoluteFill>
    );
  }
  if (p === 3) {
    // "Instinto de entregador": faz pose de esperto, com o dedo na têmpora
    const tt = t - instinto;
    const up = Math.abs(Math.sin(t * 2.6));
    return (
      <Zoom z={1.5 + tt * 0.03} ox={400} oy={1120} dx={140}>
        {salao(
          230,
          480,
          <>
            <SeuZe x={ZX} y={ZY} escala={0.95} olha={-0.6} olhos="cima" pose={{ bracoD: 142 + up * 12, bracoE: 142 + up * 12, antebracoD: -18, antebracoE: -18 }} />
            <Massa x={ZX} y={zeCab - 190 - up * 130} giro={t * 6} />
          </>,
          <Kaique x={400} y={1720} escala={0.95} t={t} fala={fala} boca="sorriso" olha={0.4} mochila pose={{ cabeca: 4 }} />,
        )}
      </Zoom>
    );
  }
  // a massa cai na cara do Seu Zé
  const tt = t - zeno;
  const cai = freia(tt, 0, 0.3, zeCab - 420, zeCab - 30);
  const caiu = tt >= 0.3;
  return (
    <Zoom z={2 + tt * 0.04} ox={ZX} oy={zeCab + 90} dx={540 - ZX}>
      {salao(
        230,
        480,
        <>
          <SeuZe x={ZX} y={ZY} escala={0.95} olhos="espanto" boca="o" gesto={false} pose={{ bracoD: caiu ? 8 : 142, bracoE: caiu ? 8 : 142 }} />
          {!caiu && <Massa x={ZX} y={cai} giro={t * 11} />}
          {caiu && (
            <g transform={`translate(${ZX} ${zeCab - 70 + Math.min(16, (tt - 0.3) * 18)})`}>
              <path d="M -86 0 Q -70 -36 0 -40 Q 70 -36 86 0 Q 76 46 62 22 Q 44 62 30 20 Q 8 50 -14 18 Q -36 58 -52 20 Q -70 46 -86 0 Z" fill="#F2DDB0" />
            </g>
          )}
        </>,
        <></>,
      )}
      <Onom t={tt - 0.3} texto="PLOFT!" x={ZX - 180} y={zeCab - 140} tam={70} ang={-9} dur={0.7} />
    </Zoom>
  );
};

// ---------- 8: portaria, a foto e o chuvisco ----------
const Chuvisco: React.FC<{ t: number; x: number; y: number; w: number; h: number; n?: number }> = ({ t, x, y, w, h, n = 90 }) => {
  const f = Math.floor(t * 30);
  return (
    <g>
      {new Array(Math.max(0, Math.round(n))).fill(0).map((_, i) => (
        <rect key={i} x={x + random(`cx${f}${i}`) * w} y={y + random(`cy${f}${i}`) * h} width={3 + random(`cs${f}${i}`) * 5} height={3 + random(`cs${f}${i}`) * 5} fill="#fff" opacity={0.6 + random(`co${f}${i}`) * 0.4} />
      ))}
    </g>
  );
};

const CAB_APP = (sub: string) => (
  <>
    <div style={{ position: "absolute", top: 90, left: 0, right: 0, textAlign: "center", fontFamily: FONTE, fontWeight: 800, fontSize: 46, color: COR.aurora, letterSpacing: 2 }}>ENTREGA PARALELA</div>
    <div style={{ position: "absolute", top: 142, left: 0, right: 0, textAlign: "center", fontFamily: FONTE, fontWeight: 700, fontSize: 28, color: "#9AA", letterSpacing: 1 }}>@mundoparalelo.br · {sub}</div>
  </>
);

export const CenaPortaria: React.FC<PropsCena & { falaEdson: Janela[]; placa: number; interfone: number; palma: number; foto: number; chuvisco: number; sensor: number; porra: number }> = ({ t, fala, falaEdson, placa, interfone, palma, foto, chuvisco, sensor, porra }) => {
  const p = plano(t, [interfone, foto, sensor, porra]);
  const cenario = <>
    <Predio x={540} y={1570} e={2.4} />
    <PortaoGrade x={200} y={1570} largura={520} altura={760} aberto={0} />
    <GuaritaFora x={880} y={1570} e={1.9} />
  </>;
  if (p === 0) {
    // chega de moto, freando
    const x = freia(t, 0, 0.95, -320, 250);
    const v = Math.max(0, 1 - t / 0.95) * 900;
    return (
      <AbsoluteFill>
        <Zoom z={1.03 + t * 0.03} ox={540} oy={1300}>
          <RuaFundo t={t} transito={false} perto={cenario} ruaFrente />
          <Tela>
            <SeuEdson x={760} y={1660} escala={0.95} quepe t={t} fala={falaEdson} olha={-0.6} />
            <Poeirinha t={t - 0.55} x={x - 120} y={1880} forca={1.1} />
            <Piloto x={x} y={1880} e={1.2} v={v} t={t} />
          </Tela>
          <Velocidade t={t} vertical={false} forca={0.4 * (v / 900)} />
        </Zoom>
        <Placa s={t} de={placa} ate={placa + 3.2} nome="SEU EDSON" desc="61 · PORTEIRO (EP. 3)" x={560} y={760} />
      </AbsoluteFill>
    );
  }
  if (p === 1) {
    // close no Seu Edson; em "bate palma" ele bate palma mesmo
    const tt = t - palma;
    const sobe = suave(tt, -0.28, -0.02, 0, 1) * (1 - suave(tt, 0.9, 1.15, 0, 1));
    const abre = tt < 0 ? 1 : 0.5 - 0.5 * Math.cos(tt * Math.PI * 2 * 3);
    return (
      <AbsoluteFill>
        <Zoom z={1.72 + (t - interfone) * 0.03} ox={760} oy={1120} dx={-220}>
          <RuaFundo t={t} transito={false} gente={false} perto={cenario} ruaFrente />
          <Tela>
            <SeuEdson x={760} y={1660} escala={0.95} quepe t={t} fala={falaEdson} olha={-0.2} gesto={sobe < 0.02} boca="neutra" pose={{ bracoD: 6 + sobe * 24, bracoE: 6 + sobe * 24, antebracoD: -sobe * (129 - abre * 26), antebracoE: -sobe * (129 - abre * 26) }} />
          </Tela>
        </Zoom>
        <Onom t={tt} texto="PLÁ!" x={800} y={980} tam={60} ang={5} dur={0.25} />
        <Onom t={tt - 0.33} texto="PLÁ!" x={800} y={980} tam={60} ang={5} dur={0.25} />
        <Onom t={tt - 0.66} texto="PLÁ!" x={800} y={980} tam={60} ang={5} dur={0.25} />
        <Placa s={t} de={placa} ate={placa + 3.2} nome="SEU EDSON" desc="61 · PORTEIRO (EP. 3)" x={540} y={520} />
      </AbsoluteFill>
    );
  }
  if (p === 2) {
    // ponto de vista dele: o celular treme na mão, o polegar aperta, a foto chuvisca
    const tt = t - foto;
    const ent = freia(tt, 0, 0.4, 0, 1);
    const sx = Math.sin(t * 1.1) * 6;
    const sy = Math.sin(t * 0.9 + 1) * 5;
    const r = Math.sin(t * 0.8) * 0.6;
    const aperta = tt > 0.62 && tt < 0.85;
    return (
      <AbsoluteFill>
        <AbsoluteFill style={{ filter: "blur(9px)" }}>
          <RuaFundo t={t} transito={false} perto={cenario} ruaFrente />
        </AbsoluteFill>
        <AbsoluteFill style={{ transform: `translate(${sx}px, ${(1 - ent) * 1500 + sy}px) rotate(${r}deg)` }}>
          <Celular hora="07:48">
            <AbsoluteFill style={{ background: "#16161C" }}>
              {CAB_APP("FOTO DO COMPROVANTE")}
              <svg width={748} height={1380} style={{ position: "absolute", left: 0, top: 0 }}>
                <rect x={60} y={230} width={628} height={760} rx={12} fill="#3A3F52" />
                <rect x={110 - sx * 0.8} y={820 - sy * 0.5} width={530} height={170} fill="#5C5E68" />
                <rect x={150 - sx} y={520 - sy} width={450} height={250} rx={12} fill="#C98B4E" />
                <rect x={150 - sx} y={520 - sy} width={450} height={34} rx={8} fill="#B07A3E" />
                <Chuvisco t={t} x={60} y={230} w={628} h={760} n={interpolate(t, [chuvisco, chuvisco + 0.9], [0, 240], clamp)} />
                <circle cx={374} cy={1140} r={aperta ? 54 : 62} fill="#fff" />
                <circle cx={374} cy={1140} r={50} fill="none" stroke="#16161C" strokeWidth={6} />
              </svg>
              {t > chuvisco + 0.9 && <div style={{ position: "absolute", left: 60, right: 60, top: 1010, textAlign: "center", fontFamily: FONTE, fontWeight: 800, fontSize: 54, color: COR.vermelho, opacity: Math.floor(t * 5) % 2 ? 1 : 0.55 }}>FOTO COM PROBLEMA</div>}
            </AbsoluteFill>
          </Celular>
          <Tela>
            {/* polegar */}
            <g transform={`translate(${aperta ? 590 : 660} ${aperta ? 1490 : 1560}) rotate(-28)`}>
              <rect x={-52} y={-40} width={104} height={420} rx={52} fill="#9A6240" />
              <rect x={-36} y={-26} width={72} height={58} rx={26} fill="#B98263" />
            </g>
          </Tela>
        </AbsoluteFill>
        <Flash t={tt - 0.72} forca={0.8} />
        <Chiado t={t} />
      </AbsoluteFill>
    );
  }
  if (p === 3) {
    // o sensor por dentro: raio-x batendo nos pixels
    const tt = t - sensor;
    const f = Math.floor(t * 15);
    return (
      <FundoDiagrama>
        <Tela>
          <g transform="translate(240 500)">
            {new Array(9).fill(0).map((_, i) =>
              new Array(9).fill(0).map((__, j) => {
                const aceso = random(`px${f}${i}${j}`) > 0.8;
                return <rect key={`${i}${j}`} x={i * 68} y={j * 68} width={62} height={62} rx={8} fill={aceso ? "#fff" : "#26304E"} stroke="#3C4A78" strokeWidth={2} />;
              }),
            )}
          </g>
          {new Array(9).fill(0).map((_, i) => {
            const k = (tt * 1.5 + i * 0.13) % 1;
            const x0 = 180 + ((i * 97) % 760);
            return <line key={i} x1={x0 - 200 + k * 200} y1={160 + k * 700} x2={x0 - 160 + k * 200} y2={240 + k * 700} stroke={COR.aurora} strokeWidth={8} strokeLinecap="round" opacity={1 - k * 0.4} />;
          })}
        </Tela>
        <Rotulo x={540} y={390} texto="SENSOR DA CÂMERA" tam={80} cor={COR.amarelo} op={entra(tt, 0.05)} />
      </FundoDiagrama>
    );
  }
  // "P-pi! Cliente vai me dar uma estrela!": pisa no chão, joga os braços, a estrela despenca
  const tt = t - porra;
  const solta = interpolate(tt, [0, 0.16, 0.55], [8, 62, 8], clamp);
  return (
    <Zoom z={1.32 + tt * 0.02} ox={540} oy={1180}>
      <RuaFundo t={t} transito={false} gente={false} perto={cenario} ruaFrente />
      <Tela>
        <SeuEdson x={860} y={1660} escala={0.95} quepe boca="sorriso" olha={-0.7} />
        <Kaique x={500} y={1660} escala={0.95} celular olhos="espanto" t={t} fala={fala} gesto={false} olha={0.3} pose={{ bracoD: 40, antebracoD: -110, bracoE: solta, antebracoE: -solta * 0.3, cabeca: 7 }} />
      </Tela>
      <Onom t={tt - 0.5} texto="★☆☆☆☆" x={540} y={700} tam={90} ang={0} dur={1.6} cor={COR.amarelo} />
    </Zoom>
  );
};

// ---------- 9: a fila da padaria ----------
const FILA: { x: number; cor: string; pele: string; cabelo: string; parafuso?: boolean; celular?: boolean; longo?: boolean }[] = [
  { x: 340, cor: "#C05070", pele: "#C98B5E", cabelo: "#D8D4CC", parafuso: true, longo: true },
  { x: 500, cor: "#4B7FB3", pele: "#8D5A3C", cabelo: "#17120F", celular: true },
  { x: 660, cor: "#E0A83A", pele: "#E0B08A", cabelo: "#5A3A2A" },
  { x: 830, cor: "#5FA052", pele: "#C98B5E", cabelo: "#2B1E1A", celular: true },
];

export const CenaFila: React.FC<PropsCena & { escolhe: number; bairro: number; parafuso: number; dona: number }> = ({ t, fala, escolhe, bairro, parafuso, dona }) => {
  const tg = useCurrentFrame() / 30;
  const p = plano(t, [bairro, parafuso, dona]);
  const KX = 190;
  const KY = 1650;
  const cab = KY - CABECA_Y * 0.95;
  const raioDe = (i: number) => (p === 3 ? 0 : p === 2 ? 1 : interpolate(t, [escolhe + 0.35 + i * 0.3, escolhe + 0.75 + i * 0.3], [0, 1], clamp));
  // a fila anda aos poucos: passinhos de quem espera
  const passo = (i: number) => Math.sin(t * 0.5 + i) * 4;
  if (p === 1) {
    // abre a câmera: o feixe varre o bairro inteiro, e todo mundo na rua vira esqueleto
    const tt = t - bairro;
    return (
      <Zoom z={freia(tt, 0, 1.2, 1.5, 1.04)} ox={560} oy={1250}>
        <RuaFundo t={t} tarde raioGente={1} pan={120 + tt * 40}>
          <Bloco x={40} y={1150} e={0.8} raio={1} t={tg} />
          <Bloco x={560} y={1150} e={0.95} raio={1} t={tg + 2} />
        </RuaFundo>
        <Tela>
          <Feixe t={t} x={50} y={1400} ang={-22 + Math.sin(t * 1.4) * 10} comp={1500} abre={280} forca={pisca(t)} id="fb" />
        </Tela>
      </Zoom>
    );
  }
  const pessoas = (
    <>
      <g opacity={1 - raioDe(3)}>
        <OlheiroBloco x={990} y={1650} escala={0.95} olha={-0.5} />
      </g>
      {raioDe(3) > 0 && <Esqueleto x={990} y={1650} e={0.95} bone pochete op={raioDe(3)} semente={4} />}
      {FILA.slice(1, 3).map((g, i) => (
        <Gente key={i} x={g.x + passo(i)} y={1650} e={0.95} cor={g.cor} pele={g.pele} cabelo={g.cabelo} raio={raioDe(i + 1)} celular={g.celular} olha={i ? 0.3 : -0.3} />
      ))}
    </>
  );
  if (p === 0) {
    const ang = -2 + Math.sin(t * 1.2) * 3;
    const h = FILA[0];
    return (
      <Zoom z={1.08 + t * 0.015} ox={540} oy={1200} dx={-t * 8}>
        <RuaFundo t={t} tarde raioGente={raioDe(3)} perto={<Padaria x={-60} y={1570} e={1.6} />} ruaFrente transito={false} />
        <Tela>
          {pessoas}
          <Gente x={h.x + passo(3)} y={1650} e={0.95} cor={h.cor} pele={h.pele} cabelo={h.cabelo} longo raio={raioDe(0)} parafuso olha={-0.3} />
          <Feixe t={t} x={KX + 14} y={cab} ang={ang} comp={1000} abre={170} forca={pisca(t) * entra(t, escolhe, 0.3)} id="fl" />
          <Kaique x={KX} y={KY} escala={0.95} raio={entra(t, escolhe, 0.2)} olhos="espanto" olha={0.7} pose={{ cabeca: ang * 0.8 }} />
          <Chuvisco t={t} x={520} y={1130} w={110} h={120} n={raioDe(1) * 14} />
          <Chuvisco t={t} x={850} y={1160} w={110} h={120} n={raioDe(3) * 14} />
        </Tela>
              </Zoom>
    );
  }
  const h = FILA[0];
  if (p === 2) {
    // close no joelho do parafuso, subindo até a cara da dona
    const tt = t - parafuso;
    const sobe = suave(tt, 0.9, 1.9, 1480, 1160);
    return (
      <Zoom z={2.3} ox={h.x + 30} oy={sobe}>
        <RuaFundo t={t} tarde gente={false} perto={<Padaria x={-60} y={1570} e={1.6} />} ruaFrente transito={false} />
        <Tela>
          <Gente x={h.x} y={1650} e={0.95} cor={h.cor} pele={h.pele} cabelo={h.cabelo} longo raio={1} parafuso />
          <circle cx={h.x + 34} cy={1650 - 172 * 0.92} r={58} fill="none" stroke={COR.vermelho} strokeWidth={6} opacity={tt < 1.1 ? 1 : 0} />
        </Tela>
        <Onom t={tt - 0.35} texto="PARAFUSO!" x={487} y={1115} tam={54} ang={-6} dur={0.9} cor={COR.amarelo} />
      </Zoom>
    );
  }
  // "A dona não gostou": a bolsada acerta o olho dele, e fica claro: close no olho roxo
  const tt = t - dona;
  const bate = 0.34;
  const K2 = 270;
  const D2 = 460;
  const OLHO_Y = KY - 665 * 0.95;
  if (tt < bate + 0.24) {
    const ang = interpolate(tt, [0, 0.16, bate, bate + 0.2], [-60, -125, 11, 34], { ...clamp, easing: Easing.inOut(Easing.quad) });
    const k = interpolate(tt, [bate, bate + 0.14], [0, 1], clamp);
    return (
      <Zoom z={1.75} ox={370} oy={1060} dx={170 + tremor(tt - bate, 7, 0.2)}>
        <RuaFundo t={t} tarde gente={false} perto={<Padaria x={-60} y={1570} e={1.6} />} ruaFrente transito={false} />
        <Tela>
          <Kaique x={K2 - k * 22} y={KY} escala={0.95} gesto={false} olhos={k > 0.1 ? "fechado" : "espanto"} boca={k > 0.1 ? "aberta" : "o"} olha={0.6} olhoRoxo={k} pose={{ cabeca: -k * 11, tronco: -k * 5, bracoD: 8 + k * 120, antebracoD: k * 100 }} />
          <Gente x={D2} y={1650} e={0.95} cor={h.cor} pele={h.pele} cabelo={h.cabelo} longo olhos="espanto" boca="aberta" olha={-0.8} pose={{ bracoD: 6, bracoE: 170, antebracoE: 0 }} />
          <g transform={`translate(332 ${1650 - 790}) rotate(${ang})`}>
            <line x1={0} y1={0} x2={0} y2={100} stroke="#6E2A3E" strokeWidth={7} />
            <rect x={-46} y={96} width={92} height={78} rx={15} fill="#8E2A4E" />
            <rect x={-46} y={96} width={92} height={20} rx={8} fill="#6E2A3E" />
            <circle cx={0} cy={134} r={9} fill="#D9C27A" />
          </g>
        </Tela>
        <Onom t={tt - bate} texto="POW!" x={K2 - 70} y={OLHO_Y - 120} tam={70} ang={-8} dur={0.5} cor={COR.vermelho} />
        <Flash t={tt - bate} forca={0.3} />
        {/* estalo bem em cima do olho */}
        {tt >= bate && tt < bate + 0.14 && (
          <Tela>
            <polygon points={`${K2 + 34},${OLHO_Y - 56} ${K2 + 46},${OLHO_Y - 16} ${K2 + 86},${OLHO_Y - 10} ${K2 + 50},${OLHO_Y + 12} ${K2 + 58},${OLHO_Y + 54} ${K2 + 30},${OLHO_Y + 24} ${K2 - 6},${OLHO_Y + 46} ${K2 + 10},${OLHO_Y + 6} ${K2 - 24},${OLHO_Y - 18} ${K2 + 18},${OLHO_Y - 18}`} fill="#FFE27A" />
          </Tela>
        )}
      </Zoom>
    );
  }
  // close: o olho inchando, a lágrima escorrendo, os dois olhos ardendo
  const tc = tt - bate - 0.24;
  return (
    <AbsoluteFill>
      <Zoom z={3.1 + tc * 0.12} ox={K2} oy={KY - CABECA_Y * 0.95 + 20} dx={540 - K2}>
        <RuaFundo t={t} tarde gente={false} perto={<Padaria x={-60} y={1570} e={1.6} />} ruaFrente transito={false} />
        <Tela>
          <Kaique x={K2} y={KY} escala={0.95} gesto={false} olhos="normal" boca="aberta" ardendo={suave(tc, 0, 0.5, 0.2, 1)} olhoRoxo={1} pose={{ cabeca: Math.sin(t * 2.4) * 2 }} />
        </Tela>
      </Zoom>
      <Onom t={tc} texto="BEM NO OLHO!" x={540} y={560} tam={84} ang={-3} dur={1.4} cor={COR.amarelo} />
    </AbsoluteFill>
  );
};

// ---------- 10: aí deu ruim ----------
export const CenaRuim: React.FC<PropsCena & { lente: number; pimenta: number; radio: number }> = ({ t, fala, lente, pimenta, radio }) => {
  const p = plano(t, [lente, pimenta, radio]);
  if (p === 1) {
    const tt = t - lente;
    return (
      <FundoDiagrama>
        <Tela>
          <g transform="translate(620 880)">
            <circle r={300} fill="#EDEAF4" />
            {[-160, 90, 200].map((y, i) => (
              <path key={i} d={`M 290 ${y * 0.5} Q 200 ${y * 0.6} 120 ${y * 0.3}`} stroke="#E56A6A" strokeWidth={5} fill="none" opacity={entra(tt, 0.4 + i * 0.2)} />
            ))}
            <g transform={`translate(${Math.sin(t * 1.2) * 6} ${Math.cos(t * 0.9) * 4})`}>
              <circle r={110} fill="#4B7FB3" />
              <circle r={52 + Math.sin(t * 2) * 3} fill="#16122A" />
            </g>
            <ellipse cx={-210} cy={0} rx={50} ry={150} fill="#9FD8FF" opacity={0.85} stroke="#fff" strokeWidth={6} />
            {[-110, -60, -10, 40, 90].map((y) => (
              <line key={y} x1={-660} y1={y} x2={-250} y2={y * 0.7} stroke={COR.aurora} strokeWidth={10} strokeLinecap="round" strokeDasharray="34 22" strokeDashoffset={-t * 300} />
            ))}
            {[
              [-222, -84],
              [-196, -40],
              [-224, 8],
              [-198, 52],
              [-218, 94],
            ].map(([cx, cy], i) => (
              <circle key={i} cx={cx} cy={cy} r={9} fill={COR.vermelho} opacity={entra(tt, 0.3 + i * 0.25, 0.3)} />
            ))}
          </g>
        </Tela>
        <Rotulo x={540} y={410} texto="A LENTE DO OLHO" tam={88} cor={COR.amarelo} op={entra(tt, 0.05)} />
        <Rotulo x={540} y={520} texto="É SENSÍVEL AO RAIO-X" tam={64} op={entra(tt, 0.4)} />
      </FundoDiagrama>
    );
  }
  if (p === 3) {
    const tt = t - radio;
    const m = freia(tt, 0, 0.45, 0, 1);
    return (
      <FundoDiagrama>
        <Tela>
          {new Array(6).fill(0).map((_, i) => {
            const y0 = 670 + i * 50;
            return (
              <g key={i}>
                <line x1={-40} y1={y0} x2={150} y2={y0 + 10} stroke={COR.aurora} strokeWidth={9} strokeLinecap="round" strokeDasharray="28 18" strokeDashoffset={-t * 300} />
                <line x1={150} y1={y0 + 10} x2={-20} y2={y0 - 170 + i * 14} stroke={COR.aurora} strokeWidth={7} strokeLinecap="round" strokeDasharray="20 22" strokeDashoffset={-t * 300} opacity={0.55} />
              </g>
            );
          })}
          <g transform={`translate(560 ${interpolate(m, [0, 1], [500, 830])}) scale(0.92)`} opacity={m}>
            <rect x={-390} y={-130} width={330} height={250} rx={60} fill="#4A4D58" stroke="#8A8F99" strokeWidth={14} />
            <rect x={60} y={-130} width={330} height={250} rx={60} fill="#4A4D58" stroke="#8A8F99" strokeWidth={14} />
            <rect x={-70} y={-60} width={140} height={26} fill="#8A8F99" />
            <path d="M -390 -50 L -520 -90 M 390 -50 L 520 -90" stroke="#8A8F99" strokeWidth={16} strokeLinecap="round" />
            <path d="M -330 -80 L -210 -80" stroke="rgba(255,255,255,0.35)" strokeWidth={12} strokeLinecap="round" />
          </g>
        </Tela>
        <Rotulo x={540} y={460} texto="RADIOLOGISTA USA" tam={72} op={entra(tt, 0.05)} />
      </FundoDiagrama>
    );
  }
  if (p === 2) {
    // close, no centro: mão nos olhos, cabeça balançando devagar, lágrima escorrendo
    const tt = t - pimenta;
    const cab = 1660 - CABECA_Y * 0.95;
    return (
      <Zoom z={2.1 + tt * 0.03} ox={540} oy={1010}>
        <RuaFundo t={t} tarde gente={false} />
        <Tela>
          <Kaique olhoRoxo={1} x={540} y={1660} escala={0.95} olhos="espanto" raio={0.8} ardendo={1} t={t} fala={fala} gesto={false} boca="aberta" pose={{ bracoD: 150, antebracoD: 118, bracoE: 150, antebracoE: 118, cabeca: Math.sin(t * 2.2) * 5, tronco: 2 }} />
          {[0, 1, 2, 3].map((i) => {
            const k = (tt * 0.8 + i * 0.25) % 1;
            const lado = i % 2 ? 25 : -25;
            return <ellipse key={i} cx={540 + lado} cy={cab + 30 + k * 130} rx={6} ry={10} fill="#8CD3FF" opacity={1 - k * 0.8} />;
          })}
        </Tela>
      </Zoom>
    );
  }
  // sente arder: para no meio da rua, leva a mão aos olhos e cambaleia uns passos
    return (
    <Zoom z={1.24 + t * 0.03} ox={540} oy={1200}>
      <RuaFundo t={t} tarde gente={false} />
      <Tela>
        <Kaique olhoRoxo={1} x={540} y={1650} escala={0.95} rot={Math.sin(t * 1.5) * 2.2} olhos="normal" boca="aberta" ardendo={1} gesto={false} pose={{ bracoD: 150, antebracoD: 133, bracoE: 8, cabeca: 5, tronco: 4 }} />
      </Tela>
    </Zoom>
  );
};

// ---------- 11: o esqueleto de boné olha de volta, e o Olheiro anota o nome dele ----------
// a prancheta do Olheiro, em close: a lista de quem ganhou poder na Noite da Aurora
const Prancheta: React.FC<{ t: number; escreve: number }> = ({ t, escreve }) => {
  const nomes = ["JONAS — ENCOLHE", "BRUNO — ÍMÃ", "SEU EDSON — ATRAVESSA"];
  const novo = "KAIQUE — RAIO-X";
  const n = Math.round(novo.length * Math.min(1, Math.max(0, escreve)));
  const fim = 170 + n * 32;
  return (
    <AbsoluteFill style={{ background: "#2A1F16" }}>
      <Tela>
        <g transform={`translate(540 ${880 + Math.sin(t * 1.3) * 5}) rotate(${-2 + Math.sin(t * 0.9) * 0.6}) scale(1.08)`}>
          <rect x={-430} y={-640} width={860} height={1270} rx={26} fill="#8B6A43" />
          <rect x={-430} y={-640} width={860} height={1270} rx={26} fill="url(#luzPran)" />
          <defs>
            <linearGradient id="luzPran" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#fff" stopOpacity={0.14} />
              <stop offset="1" stopColor="#000" stopOpacity={0.3} />
            </linearGradient>
          </defs>
          <rect x={-386} y={-570} width={772} height={1160} rx={8} fill="#F4F1EA" />
          <rect x={-120} y={-670} width={240} height={90} rx={14} fill="#9AA0A8" />
          <rect x={-90} y={-650} width={180} height={18} rx={8} fill="#5E646C" />
          <text x={0} y={-470} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={58} fill="#2E6B4F">
            NOITE DA AURORA · 3:17
          </text>
          <line x1={-340} y1={-435} x2={340} y2={-435} stroke="#2E6B4F" strokeWidth={5} />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <line key={i} x1={-340} y1={-296 + i * 130} x2={340} y2={-296 + i * 130} stroke="#C9C4B6" strokeWidth={3} />
          ))}
          {nomes.map((nome, i) => (
            <g key={nome}>
              <text x={-330} y={-316 + i * 130} fontFamily={FONTE} fontWeight={700} fontSize={60} fill="#2A2230">
                {nome}
              </text>
              <path d={`M 262 ${-336 + i * 130} l 18 22 l 36 -46`} stroke="#2E6B4F" strokeWidth={10} fill="none" strokeLinecap="round" />
            </g>
          ))}
          <text x={-330} y={74} fontFamily={FONTE} fontWeight={800} fontSize={66} fill={COR.vermelho}>
            {novo.slice(0, n)}
          </text>
          {escreve >= 1 && <path d="M 262 54 l 18 22 l 36 -46" stroke={COR.vermelho} strokeWidth={11} fill="none" strokeLinecap="round" />}
          {/* a mão dele com a caneta */}
          <g transform={`translate(${escreve < 1 ? -330 + fim - 170 + 170 * 0 : 330} ${84 + (escreve < 1 ? Math.sin(t * 34) * 7 : 0)}) rotate(28)`}>
            <rect x={-10} y={-210} width={20} height={210} rx={5} fill="#2F5DA8" />
            <polygon points="-10,0 10,0 0,26" fill="#1A1A1E" transform="translate(0 0)" />
            <circle cx={36} cy={-100} r={76} fill="#C89A72" />
            <rect x={-20} y={-300} width={120} height={220} rx={50} fill="#2E6B4F" />
          </g>
        </g>
      </Tela>
    </AbsoluteFill>
  );
};

export const CenaEsqueleto: React.FC<PropsCena & { boneW: number; olhando: number; apaga: number }> = ({ t, boneW, olhando, apaga }) => {
  const OX = 660;
  const lambe = <Padaria x={-60} y={1570} e={1.6} lambe={<LambeLambe x={600} y={-420} e={0.7} a={-3} />} />;
  const fila = (real: boolean) =>
    [340, 500].map((x, i) => (
      <Gente key={x} x={x + Math.sin(t * 0.5 + i) * 4} y={1650} e={0.95} cor={["#C05070", "#4B7FB3"][i]} longo={i === 0} raio={real ? 0 : 1} parafuso={i === 0} celular={i === 1} />
    ));
  if (t < boneW) {
    // o olho dele ainda ardendo, varrendo a fila
    return (
      <Zoom z={1.12 + t * 0.05} ox={OX} oy={1180} dx={interpolate(t, [0, boneW], [40, -100], clamp)}>
        <RuaFundo t={t} tarde raioGente={1} perto={lambe} ruaFrente transito={false} />
        <Tela>
          {fila(false)}
          <Esqueleto x={OX} y={1650} e={0.95} bone pochete vira={18} semente={4} />
          <Kaique olhoRoxo={1} x={160} y={1650} escala={0.95} olhos="espanto" boca="o" raio={0.8} ardendo={0.8} olha={0.7} pose={{ bracoD: 10 }} />
        </Tela>
      </Zoom>
    );
  }
  if (t < apaga) {
    // close na caveira de boné: ela vira devagar pra câmera, e os olhos acendem
    const vira = suave(t, olhando - 0.35, olhando + 0.1, 20, 0);
    return (
      <Zoom z={2.3 + (t - boneW) * 0.12} ox={OX} oy={1030} dx={540 - OX}>
        <RuaFundo t={t} tarde gente={false} perto={lambe} ruaFrente transito={false} />
        <Tela>
          <Esqueleto x={OX} y={1650} e={0.95} bone pochete olhosVerdes={suave(t, olhando - 0.05, olhando + 0.2, 0, 1)} vira={vira} semente={4} />
        </Tela>
      </Zoom>
    );
  }
  if (t < apaga + 0.85) {
    // ele pisca e desliga: é um senhor de carne e osso, sorrindo. O olho dele ainda brilha um instante
    const tt = t - apaga;
    return (
      <Zoom z={2.5 + tt * 0.1} ox={OX} oy={1030} dx={540 - OX}>
        <RuaFundo t={t} tarde gente={false} perto={lambe} ruaFrente transito={false} />
        <Tela>
          <OlheiroBloco x={OX} y={1650} escala={0.95} olhosVerdes={tt < 0.34 ? 1 : 0} boca="sorriso" olha={0} semente="olheiro" />
        </Tela>
        <Flash t={tt} forca={0.25} cor="#B8FFE0" />
      </Zoom>
    );
  }
  // e anota o nome dele na prancheta
  return <Prancheta t={t} escreve={suave(t, apaga + 0.95, apaga + 1.75, 0, 1)} />;
};

// ---------- 12: o Olheiro fala, a mensagem chega ----------
export const CenaCelular: React.FC<PropsCena & { falaOlheiro: Janela[]; msg: number; quem: number }> = ({ t, fala, falaOlheiro, msg, quem }) => {
  if (t >= quem) {
    // olha pra todo lado procurando quem mandou
    const tt = t - quem;
    const vira = Math.sin(tt * 2.2);
    return (
      <Zoom z={freia(tt, 0, 0.8, 1.5, 1.28)} ox={540} oy={1160}>
        <RuaFundo t={t} tarde />
        <Tela>
          <Kaique olhoRoxo={1} x={540} y={1650} escala={0.95} celular olhos="espanto" ardendo={0.5} olha={vira} t={t} fala={fala} gesto={false} pose={{ bracoD: 40, antebracoD: -110, cabeca: vira * 6 }} />
        </Tela>
        <Onom t={tt} texto="?" x={790} y={780} tam={180} ang={6} dur={2} cor={COR.amarelo} />
      </Zoom>
    );
  }
  if (t < msg) {
    // "Olho bom vê por dentro de tudo, garoto.": o Olheiro falando pra câmera, com a prancheta
    return (
      <AbsoluteFill>
        <Zoom z={1.72 + t * 0.05} ox={540} oy={1040}>
          <RuaFundo t={t} tarde gente={false} perto={<Padaria x={-60} y={1570} e={1.6} lambe={<LambeLambe x={600} y={-420} e={0.7} a={-3} />} />} ruaFrente transito={false} />
          <AbsoluteFill style={{ background: "#141A3C", opacity: 0.42, mixBlendMode: "multiply" }} />
          <Tela>
            <ellipse cx={540} cy={1000} rx={300} ry={460} fill={COR.aurora} opacity={0.12} style={{ filter: "blur(50px)" }} />
            <OlheiroBloco x={540} y={1650} escala={0.95} olhosVerdes={1} boca="sorriso" t={t} fala={falaOlheiro} semente="olheiro" />
          </Tela>
        </Zoom>
      </AbsoluteFill>
    );
  }
  const tm = t - msg;
  const ent = freia(tm, 0, 0.3, 0, 1);
  const k = freia(tm, 0.1, 0.35, 0, 1);
  const vib = tm < 0.35 ? Math.sin(t * 90) * 4 : 0;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ filter: "blur(10px)" }}>
        <RuaFundo t={t} tarde />
      </AbsoluteFill>
      <AbsoluteFill style={{ transform: `translate(${Math.sin(t * 1.1) * 5}px, ${(1 - ent) * 1400 + Math.sin(t * 0.9) * 4}px) rotate(${Math.sin(t * 0.8) * 0.5}deg)` }}>
        <Celular hora="03:17" vib={vib}>
          <AbsoluteFill style={{ background: "#16161C" }}>
            {CAB_APP("NOVO PEDIDO")}
            <div style={{ position: "absolute", left: 40, right: 40, top: 260, background: "#2A2A34", borderRadius: 30, padding: "28px 34px" }}>
              <div style={{ fontFamily: FONTE, fontWeight: 800, fontSize: 40, color: COR.amarelo }}>PEDIDO #317 · 03:17</div>
              <div style={{ fontFamily: FONTE, fontWeight: 700, fontSize: 34, color: "#BBB", marginTop: 4 }}>REMETENTE: — O.</div>
            </div>
            <div style={{ position: "absolute", left: 40, right: 40, top: 500, background: COR.creme, borderRadius: 34, padding: "40px 44px", opacity: k, transform: `scale(${0.85 + k * 0.15})`, transformOrigin: "10% 0%" }}>
              <div style={{ fontFamily: FONTE, fontWeight: 800, fontSize: 64, lineHeight: 1.08, color: COR.tinta }}>Olho bom vê por dentro de tudo, garoto.</div>
              <div style={{ fontFamily: FONTE, fontWeight: 800, fontSize: 64, lineHeight: 1.08, color: COR.tinta, marginTop: 16 }}>Tenho uma encomenda pra você.</div>
              <div style={{ fontFamily: FONTE, fontWeight: 800, fontSize: 60, color: "#1FA87A", marginTop: 26, textAlign: "right" }}>— O.</div>
            </div>
          </AbsoluteFill>
        </Celular>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- 13: chega em casa, tem uma caixa preta na porta; o raio-x não atravessa ----------
export const Caixa: React.FC<{ x: number; y: number; ga?: number; e?: number }> = ({ x, y, ga = 0, e = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${ga}) scale(${e})`}>
    <ellipse cx={0} cy={4} rx={190} ry={16} fill="rgba(0,0,0,0.3)" />
    <rect x={-170} y={-290} width={340} height={290} rx={10} fill="#0B0B0F" />
    <rect x={-170} y={-290} width={340} height={46} rx={10} fill="#16161C" />
    <circle cx={0} cy={-140} r={46} fill={COR.creme} />
    <text x={0} y={-122} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={64} fill={COR.tinta}>
      O.
    </text>
  </g>
);
// a casa dele: porta, número, luz acesa, capacho
export const PortaDeCasa: React.FC<{ x: number }> = ({ x }) => (
  <g transform={`translate(${x} 1570) scale(2.35) translate(${-x} -1500)`}>
    <rect x={x - 300} y={840} width={600} height={660} fill="#D9A98A" />
    <rect x={x - 300} y={840} width={600} height={660} fill="url(#luzcasa)" />
    <polygon points={`${x - 330},840 ${x},720 ${x + 330},840`} fill="#B8553A" />
    <rect x={x - 106} y={1180} width={212} height={320} fill="#6E4C34" />
    <rect x={x - 90} y={1196} width={180} height={304} fill="#7A4E34" />
    <rect x={x - 70} y={1216} width={140} height={100} fill="#5E3E28" />
    <circle cx={x + 66} cy={1360} r={8} fill="#D9C27A" />
    <rect x={x - 35} y={1236} width={70} height={46} rx={5} fill="#F4ECDD" />
    <text x={x} y={1272} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={34} fill={COR.tinta}>
      317
    </text>
    <rect x={x - 270} y={950} width={170} height={150} fill="#F4ECDD" />
    <rect x={x - 262} y={958} width={154} height={134} fill="#FFD27A" />
    <circle cx={x} cy={1130} r={15} fill="#FFF0B8" />
    <circle cx={x} cy={1130} r={46} fill="#FFF0B8" opacity={0.25} />
  </g>
);

export const CenaCaixa: React.FC<PropsCena & { queda: number; olhaDe: number; atravessa: number; dentro: number; fim: number; fim2: number }> = ({ t, fala, queda, olhaDe, atravessa, dentro, fim, fim2 }) => {
  const CHAO = 1650;
  const panFim = queda * 338;
  const pan = Math.min(t, queda) * 338;
  const BX = 700;
  const caixaX = BX + (panFim - pan);
  const andando = t < queda;
  const kx = interpolate(t, [olhaDe, olhaDe + 0.5], [300, 340], clamp);
  const anda = andando ? 0.8 : t > olhaDe && t < olhaDe + 0.5 ? 0.45 : 0;
  const KY = 1650;
  const cab = KY - CABECA_Y * 0.95;
  const r = suave(t, olhaDe + 0.5, olhaDe + 0.8, 0, 1);
  const ang = Math.atan2(CHAO - 150 - cab, caixaX - 170 - kx) * (180 / Math.PI) + Math.sin(t * 1.6) * 3;
  const comp = caixaX - 170 - kx - 10;
  const ladoY = cab + Math.tan((ang * Math.PI) / 180) * comp;
  if (t >= fim2) {
    // a última imagem antes do cartão: ele, sabendo de tudo
    const tt = t - fim2;
    return (
      <Zoom z={2.5 + tt * 0.14} ox={540} oy={1040}>
        <RuaFundo t={t} tarde gente={false} perto={<Padaria x={-60} y={1570} e={1.6} lambe={<LambeLambe x={600} y={-420} e={0.7} a={-3} />} />} ruaFrente transito={false} />
        <AbsoluteFill style={{ background: "#141A3C", opacity: 0.5, mixBlendMode: "multiply" }} />
        <Tela>
          <OlheiroBloco x={540} y={1650} escala={0.95} olhosVerdes={suave(tt, 0.05, 0.3, 0, 1)} boca="sorriso" semente="olheiro" />
        </Tela>
      </Zoom>
    );
  }
  if (t >= fim) {
    // o gancho: a caixa dá uma batida por dentro
    const tt = t - fim;
    const pul = tt % 0.55 < 0.08;
    return (
      <Zoom z={1.7 + tt * 0.12} ox={BX} oy={CHAO - 150} dx={540 - BX}>
        <RuaFundo t={t} tarde pan={panFim} transito={false} gente={false} semPoste perto={<PortaDeCasa x={BX} />} />
        <Tela>
          <Caixa x={BX} y={CHAO + (pul ? -5 : 0)} ga={pul ? 0.8 : 0} />
        </Tela>
      </Zoom>
    );
  }
  if (t >= dentro) {
    return (
      <Zoom z={freia(t - dentro, 0, 0.5, 1.9, 2.1)} ox={kx} oy={cab + 70} dx={540 - kx}>
        <RuaFundo t={t} tarde pan={panFim} transito={false} gente={false} semPoste perto={<PortaDeCasa x={BX} />} />
        <Tela>
          <Caixa x={BX} y={CHAO} />
          <Kaique olhoRoxo={1} x={kx} y={KY} escala={0.95} raio={1} olhos="espanto" t={t} fala={fala} olha={0.6} pose={{ tronco: 3, cabeca: 5 }} />
        </Tela>
      </Zoom>
    );
  }
  return (
    <Zoom z={1.08 + t * 0.012} ox={520} oy={1250}>
      <RuaFundo t={t} tarde pan={pan} transito={false} gente={false} perto={<PortaDeCasa x={caixaX} />} />
      <Tela>
        <Caixa x={caixaX} y={CHAO} />
        {r > 0 && <Feixe t={t} x={kx + 14} y={cab} ang={ang} comp={comp / Math.cos((ang * Math.PI) / 180)} abre={95} forca={r * pisca(t)} id="cx" />}
        <Kaique olhoRoxo={1} x={kx} y={KY} escala={0.95} mochila raio={r} olhos={t > queda ? "espanto" : "normal"} olha={0.6} anda={anda} gesto={false} pose={{ cabeca: 4 }} />
      </Tela>
      {r > 0 && <Faiscas t={(t * 1.2) % 0.9} x={caixaX - 170} y={ladoY} n={6} raio={70} semente={`cx${Math.floor(t * 1.2)}`} />}
      <Onom t={t - atravessa} texto="NADA!" x={700} y={770} tam={110} ang={-5} dur={1.2} cor={COR.vermelho} />
    </Zoom>
  );
};
