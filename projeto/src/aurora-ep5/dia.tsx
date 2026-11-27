import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { plano, Rotulo } from "../aurora/cenas2";
import { Cartao, clamp, COR, FONTE, Placa } from "../aurora/estilo";
import { Faiscas, Flash, Onom, tremor, Velocidade } from "../aurora-ep3/efeitos";
import { Feixe, Gente, MaoOssos } from "../aurora-ep4/corpo";
import { RuaFundo } from "../aurora-ep4/fundos";
import { Janela, Kaique } from "../aurora-ep4/pessoa";
import { Estilhacos, Fumaca3D } from "./tresd";
import { Denis, Enfermeira, Pedreiro, Socorrista, Tiao } from "./elenco";
import { clipe, janelas, palavra } from "./falas";
import { AndaimeAlto, Balde, Blocos, BeicoCratera, CabecaMarreta, Cadeiras, Carrinho, ChaoObra, Corredor, Cratera, Jato, Maca, Marmita, Marreta, Martelo, Obra, OnibusLado, PredioObra, Saco } from "./objetos";
import { S } from "./tempos";

// Metade de dia do ep. 5: começa engraçado e cada degrau é pior que o anterior. `t` = segundos
// desde o começo da cena. Mesmo padrão do ep. 4: vivo mas contido, corte seco dentro da cena,
// personagem no centro e primeira pessoa quando ele olha pra alguma coisa.

export const Zoom: React.FC<{ z: number; ox: number; oy: number; dx?: number; dy?: number; children: React.ReactNode }> = ({ z, ox, oy, dx = 0, dy = 0, children }) => (
  <AbsoluteFill style={{ transform: `translate(${dx}px, ${dy}px) scale(${z})`, transformOrigin: `${ox}px ${oy}px`, overflow: "hidden" }}>{children}</AbsoluteFill>
);
export const Tela: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1080} height={1920} style={{ position: "absolute" }}>
    {children}
  </svg>
);
export const suave = (t: number, a: number, b: number, v0: number, v1: number) => interpolate(t, [a, b], [v0, v1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
export const freia = (t: number, a: number, b: number, v0: number, v1: number) => interpolate(t, [a, b], [v0, v1], { ...clamp, easing: Easing.out(Easing.cubic) });
const acelera = (t: number, a: number, b: number, v0: number, v1: number) => interpolate(t, [a, b], [v0, v1], { ...clamp, easing: Easing.in(Easing.quad) });
const fala = (de: number): Janela[] => janelas(["denis"], de);

// ---------- 1: o ônibus bate e quem amassa é o ônibus ----------
export const GANCHO_BATE = 0.95;
const GANCHO_POUSA = 1.3;
export const CenaGancho: React.FC<{ t: number }> = ({ t }) => {
  const Y = 1530;
  const E = 0.72;
  if (t < GANCHO_POUSA) {
    const bateu = t >= GANCHO_BATE;
    const tb = t - GANCHO_BATE;
    const frente = bateu ? freia(tb, 0, 0.3, 640, 730) : interpolate(t, [0, GANCHO_BATE], [-240, 640]);
    const dx = bateu ? tb * 1700 : 0;
    return (
      <Zoom z={1.04} ox={540} oy={1300} dx={tremor(tb, 9, 0.22)}>
        <RuaFundo t={t} transito={false} gente={false} semPoste />
        <Tela>
          {!bateu && <Saco x={640} y={Y - 590 * E} e={0.72} a={-6} />}
          <Denis x={680 + dx} y={Y - tb * (bateu ? 220 : 0)} escala={E} anda={bateu ? 0 : 0.9} rot={bateu ? tb * 420 : 0} olha={bateu ? 0 : -0.8} olhos={t > 0.55 ? "espanto" : "normal"} boca={t > 0.7 ? "o" : "neutra"} />
          <OnibusLado x={frente} y={1570} amassa={bateu ? freia(tb, 0, 0.1, 0, 1) : 0} giro={t * 520} />
          {bateu && <Saco x={640 + tb * 300} y={Y - 430 - tb * 900} e={0.72} a={tb * 500} />}
          <Fumaca3D t={tb} x={700} y={Y - 170} id="fBate" cor="#CFC6B4" raio={130} dur={1} />
          <Estilhacos t={tb} x={690} y={Y - 300} chao={Y + 20} n={24} cores={["#BFE0F4", "#D8EEF8", "#F0E2BE"]} forca={1} tam={22} semente="bus" fino />
        </Tela>
        <Flash t={tb} forca={0.16} />
        {null}
      </Zoom>
    );
  }
  // ele cai, escorrega e levanta, sem um arranhão, na frente do ônibus amassado
  const tt = t - GANCHO_POUSA;
  const x = freia(tt, 0, 0.35, 1320, 800);
  const rot = suave(tt, 0.28, 0.85, 90, 0);
  return (
    <Zoom z={freia(tt, 0, 1.4, 1.14, 1.04)} ox={560} oy={1300}>
      <RuaFundo t={t} gente={false} transito={false} semPoste />
      <Tela>
        <OnibusLado x={610} y={1570} amassa={0.85} />
        <Denis x={x} y={Y} escala={E} rot={rot} sombra={rot < 20} olhos={tt > 0.85 ? "normal" : "fechado"} boca="neutra" pose={{ cabeca: rot * 0.1 }} />
        <Fumaca3D t={tt} x={1000} y={Y} id="fPousa" cor="#CFC6B4" raio={90} sobe={150} dur={0.9} />
        <Fumaca3D t={tt + 0.3} x={560} y={1120} id="fRadiador" cor="#E8E8E4" raio={110} sobe={560} abre={160} dur={3} forca={0.5} />
        <Estilhacos t={tt + 0.35} x={590} y={Y - 300} chao={Y + 20} n={24} cores={["#BFE0F4", "#D8EEF8", "#F0E2BE"]} forca={1} tam={22} semente="bus" fino />
        <Gente x={70} y={1760} e={0.95} cor="#C05070" longo olhos="espanto" boca="o" dir={1} olha={0.8} semente="g1" />
        <Gente x={1010} y={1760} e={0.95} cor="#4B7FB3" olhos="espanto" boca="aberta" olha={-0.8} celular semente="g2" />
      </Tela>
    </Zoom>
  );
};

// ---------- 3: laje da obra, madrugada, céu verde ----------
const Celular317: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-46} y={-20} width={92} height={40} rx={7} fill="#111" />
    <rect x={-40} y={-15} width={80} height={30} rx={4} fill="#20344C" />
    <text x={0} y={9} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={24} fill="#fff">
      03:17
    </text>
  </g>
);
const POSE_SENTADO = { pernaE: -72, joelhoE: 72, pernaD: -72, joelhoD: 72, bracoD: 22, antebracoD: -72, bracoE: 14, antebracoE: -66 };
export const CenaLaje: React.FC<{ t: number }> = ({ t }) => {
  const dc = clipe("d-ceu").inicio - S.laje;
  const p = plano(t, [dc]);
  const X = 470;
  const CHAO = 1560;
  const Y = CHAO + 120;
  const placa = palavra("n-denis", "Trinta") - S.laje;
  return (
    <AbsoluteFill>
      <Zoom z={p ? 1.85 + (t - dc) * 0.02 : 1.08 + t * 0.012} ox={p ? X + 30 : 540} oy={p ? 1000 : 1300} dx={p ? 540 - X - 30 : 0}>
        <RuaFundo t={t} noite transito={false} gente={false} semPoste />
        <Tela>
          {/* a laje: concreto, vergalhão, saco de cimento, carrinho */}
          <rect x={0} y={1490} width={1080} height={430} fill="#6A6778" />
          <rect x={0} y={1490} width={1080} height={430} fill="url(#lajeSombra)" />
          <defs>
            <linearGradient id="lajeSombra" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={COR.aurora} stopOpacity={0.16} />
              <stop offset="0.5" stopColor="#000" stopOpacity={0.05} />
              <stop offset="1" stopColor="#000" stopOpacity={0.4} />
            </linearGradient>
          </defs>
          {[40, 58, 76, 980, 998, 1016].map((vx) => (
            <line key={vx} x1={vx} y1={1500} x2={vx + 5} y2={1250} stroke="#4E3A34" strokeWidth={7} />
          ))}
          <Blocos x={760} y={1530} e={0.8} lin={4} col={3} />
          <Saco x={190} y={1500} e={0.9} />
          <Saco x={210} y={1440} e={0.85} a={3} />
          <Carrinho x={880} y={1680} e={0.9} />
          <Celular317 x={760} y={1600} />
          <Balde x={X} y={CHAO + 6} e={0.92} />
          <Denis x={X} y={Y} escala={0.95} olhos="cima" olha={0.25} t={t} fala={fala(S.laje)} gesto={false} pose={{ ...POSE_SENTADO, cabeca: -6 }} />
          <Marmita x={X + 150} y={1394} e={0.95} />
        </Tela>
      </Zoom>
      <Placa s={t} de={placa} ate={placa + 2.2} nome="DENIS" desc="34 · PEDREIRO" x={540} y={700} />
    </AbsoluteFill>
  );
};

// ---------- fundo do canteiro de obra, de dia ----------
export const Canteiro: React.FC<{ blur?: number }> = ({ blur }) => {
  const tg = useCurrentFrame() / 30;
  // um peão passa lá atrás empurrando o carrinho o tempo todo
  const px = ((tg * 150) % 1800) - 300;
  return (
    <Tela>
      <Obra blur={blur} />
      <ChaoObra />
      <g transform={`translate(${px} 0)`}>
        <Pedreiro n={0} x={0} y={1590} escala={0.78} anda={0.8} semente="peao" pose={{ bracoD: 20, bracoE: 20 }} />
        <Carrinho x={190} y={1590} e={0.72} />
      </g>
      <Blocos x={40} y={1600} e={0.85} />
      <Saco x={900} y={1590} e={1} />
      <Saco x={925} y={1530} e={0.95} a={4} />
    </Tela>
  );
};

// ---------- 4: martelada no dedo (primeira pessoa) ----------
const BracoMartelo: React.FC<{ ang: number }> = ({ ang }) => (
  <g transform={`rotate(${ang} 1010 1980)`}>
    <g transform="translate(1010 1320) scale(-1.6 1.6)">
      <Martelo />
    </g>
    <rect x={925} y={1320} width={170} height={680} rx={60} fill="#B07A52" />
    <rect x={905} y={1700} width={210} height={300} rx={34} fill="#C8742C" />
    <rect x={915} y={1262} width={190} height={130} rx={56} fill="#B07A52" />
  </g>
);
export const CenaObra: React.FC<{ t: number }> = ({ t }) => {
  const tg = useCurrentFrame() / 30;
  const w = (id: string, p: string) => palavra(id, p) - S.obra;
  const hit = w("n-martelo", "próprio");
  const porra = clipe("d-porra").inicio - S.obra;
  const doeu = clipe("d-doeu").inicio - S.obra;
  const dedo = clipe("n-dedo").inicio - S.obra;
  const voa = hit + 0.22;
  const p = plano(t, [voa, porra, dedo]);
  if (p === 0) {
    const T1 = w("n-martelo", "errou");
    const T2 = w("n-martelo", "prego") + 0.05;
    const ang = interpolate(t, [0, T1 - 0.16, T1, T1 + 0.16, T2 - 0.1, T2, T2 + 0.12, hit - 0.1, hit, hit + 0.12], [-7, -5, -23, -7, -7, -23, -7, -3, -31, 26], clamp);
    return (
      <AbsoluteFill>
        <Zoom z={1.2} ox={540} oy={800}>
          <Canteiro blur={9} />
        </Zoom>
        <Tela>
          {/* tábua */}
          <rect x={-20} y={1090} width={1120} height={860} fill="#B58A5C" />
          {[1150, 1300, 1470, 1620, 1800].map((ly) => (
            <path key={ly} d={`M -20 ${ly} q 300 ${(ly % 7) * 3} 600 0 t 520 6`} stroke="rgba(70,40,20,0.3)" strokeWidth={5} fill="none" />
          ))}
          <rect x={-20} y={1090} width={1120} height={16} fill="rgba(255,255,255,0.2)" />
          {/* prego */}
          <rect x={600} y={1030} width={14} height={130} fill="#9EA3AB" />
          <rect x={582} y={1020} width={50} height={15} rx={6} fill="#C9CED6" />
          <MaoOssos x={360} y={1410 + Math.sin(tg * 1.4) * 3} e={1.45} raio={0} rot={4} mangaCor="#C8742C" />
          <BracoMartelo ang={ang} />
        </Tela>
        <Flash t={t - hit} forca={0.18} />
        <Onom t={t - hit} texto="TÓIN!" x={520} y={760} tam={150} ang={-6} dur={0.5} />
      </AbsoluteFill>
    );
  }
  if (p === 1) {
    // o martelo quica e acerta a testa do Tião, que tava olhando
    const tt = t - voa;
    const VOO = 0.3;
    const k = Math.min(1, tt / VOO);
    const mx = interpolate(k, [0, 1], [430, 720]);
    const my = 1000 - Math.sin(k * Math.PI) * 170;
    const depois = tt > VOO;
    return (
      <Zoom z={1.3} ox={560} oy={1150}>
        <Canteiro />
        <Tela>
          <Denis x={320} y={1650} escala={0.95} olhos="espanto" boca="o" olha={0.6} gesto={false} pose={{ bracoD: 40, antebracoD: -60 }} />
          <Tiao x={790} y={1650} escala={0.95} rot={depois ? -Math.min(5, (tt - VOO) * 40) : 0} olhos={depois ? "fechado" : "normal"} boca={depois ? "dentes" : "neutra"} olha={-0.7} />
          <Martelo x={depois ? 690 - (tt - VOO) * 140 : mx} y={depois ? 1050 + (tt - VOO) * (tt - VOO) * 2600 : my} a={depois ? -40 + (tt - VOO) * 600 : k * 720} e={0.85} />
        </Tela>
        <Onom t={tt - VOO} texto="POC!" x={880} y={760} tam={130} ang={8} dur={0.5} />
      </Zoom>
    );
  }
  if (p === 2) {
    // "Porra!" e depois o espanto: não doeu
    const tt = t - porra;
    const dd = t - doeu;
    return (
      <Zoom z={1.72 + tt * 0.02} ox={540} oy={1000}>
        <Canteiro />
        <Tela>
          <Tiao x={960} y={1650} escala={0.95} olhos="fechado" boca="dentes" olha={-0.6} gesto={false} pose={{ bracoD: 34, antebracoD: -128 }} />
          <Denis x={540} y={1650} escala={0.95} olhos={dd > 0 ? "normal" : "fechado"} boca={dd > 0 ? "neutra" : "aberta"} t={t} fala={fala(S.obra)} gesto={false} olha={dd > 0 ? -0.5 : 0} pose={{ bracoE: 26, antebracoE: -124, cabeca: dd > 0 ? 6 : -3 }} />
        </Tela>
        <Onom t={dd - 0.2} texto="?" x={800} y={770} tam={150} ang={8} dur={1.2} />
      </Zoom>
    );
  }
  // primeira pessoa: o dedo inteiro, e o prego entortando contra a mão dele
  const tt = t - dedo;
  const prego = w("n-dedo", "prego");
  const ent = w("n-dedo", "entortou");
  const k = suave(t, ent - 0.05, ent + 0.55, 0, 1);
  const NY = 1040;
  return (
    <AbsoluteFill>
      <Zoom z={1.2} ox={540} oy={900}>
        <Canteiro blur={10} />
      </Zoom>
      <Tela>
        <MaoOssos x={540 + Math.sin(t * 0.9) * 5} y={freia(tt, 0, 0.4, 1200, 960) + Math.sin(t * 1.3) * 4} e={1.75} raio={0} rot={-3} mangaCor="#C8742C" />
        {t >= prego && (
          <g>
            <path d={`M 540 ${NY} Q ${540 + k * 8} ${NY - 110 + k * 30} ${540 + k * 130} ${NY - 200 + k * 110}`} stroke="#9EA3AB" strokeWidth={20} fill="none" strokeLinecap="round" />
            <circle cx={540 + k * 130} cy={NY - 200 + k * 110} r={22} fill="#C9CED6" />
            {/* a outra mão empurra o prego */}
            <circle cx={562 + k * 160} cy={NY - 232 + k * 120} r={62} fill="#B07A52" />
            <rect x={570 + k * 160} y={NY - 290 + k * 120} width={520} height={120} rx={50} fill="#B07A52" />
            <rect x={840 + k * 160} y={NY - 310 + k * 120} width={300} height={160} rx={26} fill="#C8742C" />
          </g>
        )}
      </Tela>
      <Onom t={t - ent - 0.5} texto="NHÉC!" x={760} y={620} tam={120} ang={7} dur={0.55} />
    </AbsoluteFill>
  );
};

// ---------- 5: a física, numa cena de verdade ----------
const BracoLado: React.FC<{ gx: number; gy: number; a?: number }> = ({ gx, gy, a = 90 }) => (
  <g>
    <rect x={gx - 680} y={gy - 54} width={680} height={108} rx={44} fill="#B07A52" />
    <rect x={gx - 680} y={gy - 66} width={430} height={132} rx={30} fill="#C8742C" />
    <g transform={`translate(${gx} ${gy}) rotate(${a}) scale(1.2)`}>
      <Martelo />
    </g>
    <circle cx={gx - 6} cy={gy} r={64} fill="#B07A52" />
  </g>
);
const Colchao: React.FC<{ fundo: number }> = ({ fundo }) => {
  const X = 540;
  const TOPO = 1380;
  const contorno = `M 110 ${TOPO + 26} Q 110 ${TOPO} 150 ${TOPO} L ${X - 240} ${TOPO} Q ${X - 90} ${TOPO + 4} ${X - 60} ${TOPO + fundo} L ${X + 170} ${TOPO + fundo} Q ${X + 210} ${TOPO + 4} ${X + 330} ${TOPO} L 930 ${TOPO} Q 970 ${TOPO} 970 ${TOPO + 26} L 970 1590 L 110 1590 Z`;
  return (
    <g>
      <ellipse cx={540} cy={1594} rx={470} ry={16} fill="rgba(0,0,0,0.3)" />
      <clipPath id="colchao">
        <path d={contorno} />
      </clipPath>
      <path d={contorno} fill="#F0E6D2" />
      <g clipPath="url(#colchao)">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <rect key={i} x={120 + i * 100} y={1330} width={40} height={270} fill="#7FA8C9" opacity={0.65} />
        ))}
        <rect x={100} y={1560} width={880} height={32} fill="rgba(0,0,0,0.14)" />
      </g>
    </g>
  );
};
const BlocoAco: React.FC<{ crack?: number }> = () => (
  <g>
    <ellipse cx={540} cy={1596} rx={270} ry={15} fill="rgba(0,0,0,0.35)" />
    <rect x={300} y={1300} width={480} height={290} rx={8} fill="#6E7682" />
    <polygon points="300,1300 780,1300 730,1244 350,1244" fill="#C9D0DA" />
    <polygon points="780,1300 780,1590 730,1530 730,1244" fill="#4A515C" />
    <rect x={300} y={1300} width={480} height={18} fill="#8A929E" />
    <path d="M 340 1360 L 450 1560 L 500 1560 L 390 1360 Z" fill="rgba(255,255,255,0.1)" />
    <text x={540} y={1490} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={118} letterSpacing={6} fill="#F2C230">
      DENIS
    </text>
  </g>
);
export const CenaFisica: React.FC<{ t: number }> = ({ t }) => {
  const w = (id: string, p: string) => palavra(id, p) - S.fisica;
  const c1 = w("n-fisica1", "pancada") - 0.1;
  const c2 = clipe("n-fisica2").inicio - S.fisica;
  const c3 = w("n-fisica2", "Então");
  const c4 = w("n-fisica2", "ou");
  const c5 = clipe("d-parede").inicio - S.fisica;
  const p = plano(t, [c1, c2, c3, c4, c5]);
  if (p === 0) {
    return (
      <Zoom z={1.5 + t * 0.03} ox={540} oy={1000}>
        <Canteiro />
        <Tela>
          <Denis x={540} y={1650} escala={0.95} olha={0.5} olhos="normal" gesto={false} pose={{ bracoD: 48, antebracoD: -96 }} naMao={<Martelo a={100} e={0.72} />} />
        </Tela>
      </Zoom>
    );
  }
  if (p === 1) {
    // gente = colchão: o martelo afunda devagar (é a amassada que freia a pancada)
    const toca = w("n-fisica1", "Gente");
    const para = w("n-fisica1", "amortece");
    const gy = t < toca ? interpolate(t, [c1, toca], [820, 1300], clamp) : suave(t, toca, para, 1300, 1450);
    const fundo = t < toca ? 0 : suave(t, toca, para, 0, 150);
    return (
      <AbsoluteFill>
        <Zoom z={1.08} ox={540} oy={1300}>
          <Canteiro blur={6} />
          <Tela>
            <Colchao fundo={fundo} />
            <BracoLado gx={230} gy={gy} />
          </Tela>
        </Zoom>
        <Rotulo x={540} y={1660} texto="GENTE" tam={100} cor={COR.creme} op={freia(t, toca - 0.1, toca + 0.2, 0, 1)} />
      </AbsoluteFill>
    );
  }
  if (p === 2) {
    // Denis = aço: não afunda nada, a pancada para na hora, com faísca
    const toca = w("n-fisica2", "não");
    const tt = t - toca;
    const gy = t < toca ? acelera(t, c2, toca, 780, 1230) : 1230 - freia(tt, 0, 0.5, 0, 340);
    const a = t < toca ? 90 : 90 - freia(tt, 0, 0.5, 0, 26);
    return (
      <AbsoluteFill>
        <Zoom z={1.08} ox={540} oy={1300} dx={tremor(tt, 7, 0.16)}>
          <Canteiro blur={6} />
          <Tela>
            <BlocoAco />
            <BracoLado gx={230} gy={gy} a={a} />
          </Tela>
        </Zoom>
        <Faiscas t={tt} x={540} y={1290} n={22} raio={320} semente="aco" />
        <Onom t={tt} texto="TÉIM!" x={700} y={900} tam={140} ang={7} dur={0.7} />
      </AbsoluteFill>
    );
  }
  if (p === 3) {
    // "volta pra quem bateu": o Tião bate no peito do Denis e o braço dele é que volta
    const toca = w("n-fisica2", "volta");
    const tt = t - toca;
    const braco = t < toca ? interpolate(t, [c3, c3 + 0.3, toca], [90, 160, 72], clamp) : freia(tt, 0, 0.28, 72, 176);
    return (
      <Zoom z={1.25} ox={540} oy={1200}>
        <Canteiro />
        <Tela>
          <Denis x={760} y={1650} escala={0.95} olha={-0.7} olhos="normal" boca="neutra" gesto={false} />
          <Tiao x={270} y={1650} escala={0.95} olha={0.7} olhos={tt > 0 ? "espanto" : "normal"} boca={tt > 0 ? "aberta" : "neutra"} gesto={false} pose={{ bracoD: braco, antebracoD: -8, tronco: tt > 0 ? -6 : 3 }} naMao={<Martelo a={100} e={0.7} />} />
        </Tela>
        <Onom t={tt} texto="TUM!" x={700} y={800} tam={120} ang={-6} dur={0.45} />
      </Zoom>
    );
  }
  if (p === 4) {
    // "ou vai pro chão": rachadura nascendo debaixo da bota
    const toca = w("n-fisica2", "chão") - 0.1;
    const tt = t - toca;
    return (
      <Zoom z={2} ox={540} oy={1480} dy={-330} dx={tremor(tt, 6, 0.16)}>
        <Canteiro />
        <Tela>
          {tt > 0 && <Cratera x={540} y={1680} k={freia(tt, 0, 0.25, 0, 0.72)} e={0.7} />}
          <Denis x={540} y={1650} escala={0.95} gesto={false} />
          <Fumaca3D t={tt} x={540} y={1650} id="fChao" raio={70} sobe={130} abre={210} dur={0.8} />
          <Estilhacos t={tt} x={540} y={1640} chao={1670} n={12} cores={["#8E7E66", "#B7A68C"]} forca={0.45} tam={13} semente="chaoF" />
        </Tela>
      </Zoom>
    );
  }
  const tt = t - c5;
  return (
    <AbsoluteFill>
      <Zoom z={freia(tt, 0, 1, 1.5, 1.42)} ox={540} oy={1000}>
        <Canteiro />
        <Tela>
          <Tiao x={930} y={1650} escala={0.95} olha={-0.7} olhos="normal" boca="dentes" gesto={false} pose={{ bracoD: 26, antebracoD: -98, bracoE: 36, antebracoE: -92 }} />
          <Denis x={520} y={1650} escala={0.95} t={t} fala={fala(S.fisica)} olha={0.1} olhos="normal" gesto={false} pose={{ bracoD: 44, antebracoD: -46, bracoE: 44, antebracoE: -46 }} />
        </Tela>
      </Zoom>
      <Cartao s={tt} de={0} ate={clipe("d-parede").fim - clipe("d-parede").inicio + 0.3} etiqueta="REGRA DO PODER #1" texto="NADA QUEBRA O DENIS" top={280} />
    </AbsoluteFill>
  );
};

// ---------- 6: o Tião de marreta ----------
export const CenaMarreta: React.FC<{ t: number }> = ({ t }) => {
  const w = (p: string) => palavra("n-tiao", p) - S.marreta;
  const c1 = w("Até");
  const quebra = w("Quebrou") + 0.05;
  const c2 = w("quase");
  const p = plano(t, [c1, c2]);
  const Turma: React.FC<{ rindo: number }> = ({ rindo }) => (
    <>
      <Pedreiro n={0} x={120} y={1600} escala={0.9} olha={0.5} boca={rindo ? "aberta" : "sorriso"} olhos={rindo ? "fechado" : "normal"} gesto={false} />
      <Pedreiro n={1} x={980} y={1600} escala={0.9} olha={-0.5} boca={rindo ? "aberta" : "sorriso"} olhos={rindo ? "fechado" : "normal"} gesto={false} pose={{ tronco: rindo * Math.sin(t * 9) * 1.2 }} />
    </>
  );
  if (p === 0) {
    return (
      <Zoom z={1.34 + t * 0.03} ox={540} oy={1150}>
        <Canteiro />
        <Tela>
          <Turma rindo={0} />
          <Denis x={540} y={1650} escala={0.95} olhos="normal" boca="sorriso" gesto={false} pose={{ bracoD: 52, antebracoD: -18, bracoE: 52, antebracoE: -18 }} />
        </Tela>
      </Zoom>
    );
  }
  if (p === 1) {
    const tq = t - quebra;
    const bateu = tq >= 0;
    const braco = bateu ? 72 + freia(tq, 0, 0.3, 0, 28) : interpolate(t, [c1, c1 + 0.6, quebra - 0.18, quebra], [20, 162, 165, 72], clamp);
    // a cabeça da marreta voa em arco até estourar o balde
    const VOO = 0.5;
    const k = Math.min(1, tq / VOO);
    const hx = 800 + k * 140;
    const hy = 1260 - Math.sin(k * Math.PI) * 340 + k * 330;
    const estoura = tq > VOO ? freia(tq - VOO, 0, 0.5, 0.01, 1) : 0;
    return (
      <Zoom z={1.14} ox={560} oy={1250} dx={tremor(tq, 6, 0.15)}>
        <Canteiro />
        <Tela>
          <Pedreiro n={0} x={70} y={1600} escala={0.9} olha={0.5} boca={bateu ? "aberta" : "o"} olhos={tq > 0.6 ? "fechado" : "normal"} gesto={false} />
          {estoura <= 0 && <Balde x={950} y={1640} e={0.95} cor="#2F5DA8" />}
          <Estilhacos t={tq - VOO} x={950} y={1540} chao={1650} n={18} cores={["#2F5DA8", "#3E6FBE", "#23488A"]} forca={0.72} tam={28} semente="balde" fino />
          <Estilhacos t={tq} x={720} y={1250} chao={1660} n={10} cores={["#C2965C", "#A97F48"]} forca={0.6} tam={16} semente="cabo" />
          <Denis x={760} y={1650} escala={0.95} olha={-0.6} olhos="normal" boca={bateu ? "sorriso" : "neutra"} gesto={false} />
          <Tiao x={240} y={1650} escala={0.95} olha={0.7} olhos={bateu ? "espanto" : "fechado"} boca={bateu ? "aberta" : "dentes"} gesto={false} pose={{ bracoD: braco, antebracoD: -8, tronco: bateu ? -5 : 3 }} naMao={bateu ? <Marreta a={180} e={0.72} semCabeca cabo={0.5} /> : <Marreta a={180} e={0.72} />} />
          {bateu && tq < VOO && <CabecaMarreta x={hx} y={hy} a={tq * 700} />}
        </Tela>
        <Onom t={tq} texto="CREC!" x={660} y={780} tam={150} ang={-7} dur={0.55} />
        <Onom t={tq - VOO} texto="PLÁ!" x={880} y={1040} tam={130} ang={8} dur={0.5} />
      </Zoom>
    );
  }
  // quase o pulso do Tião: ele segurando o pulso, a turma rindo
  const tt = t - c2;
  return (
    <Zoom z={freia(tt, 0, 0.8, 1.72, 1.62)} ox={540} oy={1000}>
      <Canteiro />
      <Tela>
        <Turma rindo={1} />
        <Tiao x={540} y={1650} escala={0.95} olha={0.1} olhos="fechado" boca="dentes" gesto={false} pose={{ bracoD: 26, antebracoD: -98, bracoE: 36, antebracoE: -92, cabeca: 5 }} />
      </Tela>
    </Zoom>
  );
};

// ---------- 7a: o andaime solta ----------
export const CenaAndaime: React.FC<{ t: number }> = ({ t }) => {
  const c1 = palavra("n-ruim", "O") - S.andaime;
  const solta = palavra("n-ruim", "soltou") - S.andaime;
  if (t < c1) {
    // lá em cima, a tábua range e ele olha pra baixo
    return (
      <Zoom z={1.5} ox={540} oy={1000}>
        <RuaFundo t={t} transito={false} gente={false} semPoste />
        <Tela>
          <Obra />
          <rect x={0} y={1650} width={1080} height={38} fill="#B5844F" />
          <rect x={0} y={1688} width={1080} height={232} fill="url(#ceuBaixo)" />
          <defs>
            <linearGradient id="ceuBaixo" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#8FB0D8" />
              <stop offset="1" stopColor="#C8D2E0" />
            </linearGradient>
          </defs>
          <Denis x={540} y={1655} escala={0.95} olhos="espanto" boca="o" olha={0.3} gesto={false} pose={{ cabeca: 10, bracoD: 22, bracoE: 22 }} />
        </Tela>
      </Zoom>
    );
  }
  // de longe: 4 andares, e a tábua vira com ele em cima
  const k = suave(t, solta - 0.12, solta + 0.3, 0, 1);
  const cai = Math.max(0, t - (solta + 0.1));
  const A = 350;
  const base = 1570;
  const px = 30;
  const py = base - 4 * A + 60;
  return (
    <AbsoluteFill>
      <RuaFundo t={t} gente={false} transito={false} perto={<PredioObra base={base} a={A} />} semPoste />
      <Tela>
        <AndaimeAlto x={px} base={base} andar={4} a={A} solta={k} />
        <Denis x={px + 90 - k * 70 - cai * 40} y={py - 22 + k * 74 + cai * cai * 2400} escala={0.32} rot={k * -34 - cai * 320} olhos="espanto" boca="aberta" gesto={false} pose={{ bracoD: 90 * k, bracoE: 90 * k }} />
      </Tela>
    </AbsoluteFill>
  );
};

// ---------- 7b: a queda em primeira pessoa ----------
export const CenaQueda: React.FC<{ t: number }> = ({ t }) => {
  const dur = S.calcada - S.queda;
  const k = Math.pow(Math.min(1, t / dur), 2.3);
  const z = 1 + k * 7;
  const quatro = palavra("n-queda", "Quatro") - S.queda;
  const cinq = palavra("n-queda", "cinquenta") - S.queda;
  return (
    <AbsoluteFill style={{ background: "#DAD3C4" }}>
      <AbsoluteFill style={{ transform: `scale(${z})`, transformOrigin: "540px 1000px" }}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <defs>
            <pattern id="mosaicoCima" width={110} height={110} patternUnits="userSpaceOnUse">
              <rect width={110} height={110} fill="#E2DCCF" />
              <path d="M 0 55 Q 28 14 55 55 T 110 55" stroke="#BDB5A4" strokeWidth={12} fill="none" />
            </pattern>
          </defs>
          {/* a calçada vista de cima, a rua à esquerda */}
          <rect x={0} y={0} width={1080} height={1920} fill="url(#mosaicoCima)" />
          <rect x={0} y={0} width={290} height={1920} fill="#55565F" />
          <rect x={286} y={0} width={18} height={1920} fill="#CFC8B8" />
          {[120, 620, 1120, 1620].map((ly) => (
            <rect key={ly} x={130} y={ly} width={16} height={230} fill="#EDE7CE" />
          ))}
          {/* carro e gente vistos de cima */}
          <rect x={46} y={700 - t * 40} width={92} height={200} rx={26} fill="#C8322B" />
          <rect x={60} y={752 - t * 40} width={64} height={84} rx={12} fill="#22304A" />
          {[
            [470, 720, "#C05070"],
            [660, 1180, "#4B7FB3"],
            [420, 1360, "#3C8C6A"],
            [800, 800, "#E6B83A"],
          ].map(([x, y, c], i) => (
            <g key={i} transform={`translate(${x} ${Number(y) + Math.sin(t * 2 + i) * 14})`}>
              <ellipse cx={8} cy={8} rx={40} ry={28} fill="rgba(0,0,0,0.25)" />
              <ellipse cx={0} cy={0} rx={38} ry={24} fill={c as string} />
              <circle cx={0} cy={0} r={16} fill="#2B1E1A" />
            </g>
          ))}
          <circle cx={350} cy={1500} r={90} fill="#4E8A43" />
          <circle cx={350} cy={1500} r={60} fill="#5E9654" />
        </svg>
      </AbsoluteFill>
      {/* a parede do prédio passando dos dois lados */}
      <Tela>
        <polygon points={`1080,0 ${1080 - 300 * (1 - k * 0.6)},0 ${1080 - 80},1920 1080,1920`} fill="#8A8478" />
        {[0, 1, 2, 3, 4].map((i) => {
          const yy = ((t * 1500 + i * 480) % 2400) - 240;
          return <rect key={i} x={760 + (yy / 1920) * 220} y={yy} width={320} height={30} fill="#CFCABD" />;
        })}
        {/* as mãos dele, abertas */}
        <rect x={-40} y={1540} width={300} height={100} rx={46} fill="#B07A52" transform={`rotate(-34 40 1640) translate(0 ${Math.sin(t * 16) * 4})`} />
        <rect x={840} y={1540} width={300} height={100} rx={46} fill="#B07A52" transform={`rotate(34 1040 1640) translate(0 ${Math.sin(t * 15) * 4})`} />
      </Tela>
      <Velocidade t={t} vertical forca={0.3 + k * 0.5} />
      <Rotulo x={540} y={520} texto={t >= cinq ? "55 KM/H" : "12 METROS"} tam={t >= cinq ? 150 : 130} cor={t >= cinq ? COR.vermelho : COR.amarelo} op={t >= quatro ? 1 : 0} />
    </AbsoluteFill>
  );
};

// ---------- 7c: a calçada arrebenta, e ele levanta do buraco ----------
export const CenaCalcada: React.FC<{ t: number }> = ({ t }) => {
  const w = (p: string) => palavra("n-corpo", p) - S.calcada;
  const c1 = w("O");
  const c2 = w("Quem");
  const c3 = clipe("d-caralho").inicio - S.calcada;
  const vivo = clipe("d-vivo").inicio - S.calcada;
  const p = plano(t, [c1, c2, c3]);
  const C = 1720;
  const rua = (
    <RuaFundo t={t} gente={false} semPoste transito={p === 2} />
  );
  const Passante = () => (
    <>
      <Gente x={100} y={1660} e={0.95} cor="#C05070" longo olhos="espanto" boca="o" olha={0.8} semente="pa" />
      <Gente x={985} y={1660} e={0.95} cor="#3C8C6A" olhos="espanto" boca="aberta" olha={-0.8} celular semente="pb" />
    </>
  );
  const k = freia(t, 0, 0.3, 0, 1);
  const entulho = <Estilhacos t={t} x={540} y={C - 30} chao={C + 26} n={30} cores={["#E2DCCF", "#CFC8B8", "#8A8478", "#B4AD9C"]} forca={1.25} tam={40} semente="calc" abre={0.95} />;
  const poeira = <Fumaca3D t={t} x={540} y={C - 30} id="fCalc" cor="#D2C8B6" raio={210} sobe={620} abre={560} dur={2.6} forca={0.85} />;
  if (p === 0 || p === 2) {
    return (
      <Zoom z={p === 2 ? freia(t - c2, 0, 1.2, 1.18, 1.06) : freia(t, 0, 0.5, 1.26, 1.14)} ox={540} oy={1500} dx={tremor(t, 11, 0.3)}>
        {rua}
        <Tela>
          <Cratera x={540} y={C} k={k} />
          <Jato x={790} y={C + 12} t={t - 0.35} altura={p === 2 ? 860 : 560} />
          <Denis x={330} y={C + 16} escala={0.68} rot={90} olhos="fechado" gesto={false} sombra={false} />
          <BeicoCratera x={540} y={C} />
          {entulho}
          {poeira}
          {p === 2 && <Passante />}
        </Tela>
        <Flash t={t} forca={0.28} />
        {null}
      </Zoom>
    );
  }
  if (p === 1) {
    // de perto: nem um arranhão, ele só pisca
    return (
      <Zoom z={2.3} ox={790} oy={1680} dx={-250} dy={-300}>
        {rua}
        <Tela>
          <Cratera x={540} y={C} k={1} />
          {entulho}
          <Denis x={330} y={C + 16} escala={0.68} rot={90} olhos={(t - c1) % 0.8 < 0.14 ? "fechado" : "normal"} gesto={false} sombra={false} />
          <BeicoCratera x={540} y={C} />
        </Tela>
      </Zoom>
    );
  }
  // levanta do buraco: "Cara-pi! Tô vivo?"
  const tt = t - c3;
  const dv = t - vivo;
  const sobe = freia(tt, 0, 0.35, 170, 0);
  return (
    <Zoom z={freia(tt, 0, 0.9, 1.6, 1.5)} ox={540} oy={1080} dy={-250}>
      {rua}
      <Tela>
        <Cratera x={540} y={C} k={1} />
          {entulho}
        <Jato x={850} y={C + 12} t={t} altura={860} />
        <Denis x={540} y={C + 55 + sobe} escala={0.95} olhos={dv > 0 ? "normal" : "espanto"} boca={dv > 0 ? "neutra" : "aberta"} t={t} fala={fala(S.calcada)} gesto={false} olha={dv > 0 ? -0.2 : 0} pose={dv > 0 ? { bracoD: 26, antebracoD: -100, bracoE: 26, antebracoE: -100, cabeca: 8 } : { bracoD: 34, bracoE: 34 }} />
        <BeicoCratera x={540} y={C} />
      </Tela>
    </Zoom>
  );
};

// ---------- 8: hospital ----------
const AGULHA_DUR = 0.34;
const Agulha: React.FC<{ x: number; y: number; dobra: number; a?: number; e?: number }> = ({ x, y, dobra, a = 0, e = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${a}) scale(${e})`}>
    <path d={`M 0 0 Q ${dobra * 16} -56 ${dobra * 76} ${-110 + dobra * 44}`} stroke="#C9CED6" strokeWidth={7} fill="none" strokeLinecap="round" transform="rotate(180)" />
    <rect x={-30} y={-210} width={60} height={210} rx={6} fill="#EAF2F6" opacity={0.95} />
    <rect x={-30} y={-110} width={60} height={110} rx={4} fill="#8CC8E8" opacity={0.75} />
    <rect x={-44} y={-222} width={88} height={14} rx={5} fill="#C9CED6" />
    <rect x={-12} y={-300} width={24} height={84} fill="#C9CED6" />
    <rect x={-32} y={-310} width={64} height={14} rx={6} fill="#AEB5B2" />
  </g>
);
export const CenaHospital: React.FC<{ t: number }> = ({ t }) => {
  const tg = useCurrentFrame() / 30;
  const c1 = palavra("n-hospital", "mesmo") - S.hospital;
  const c2 = clipe("n-agulhas").inicio - S.hospital - 0.35;
  const c3 = clipe("n-sistema").inicio - S.hospital - 0.1;
  const c4 = palavra("n-sistema", "no") - S.hospital;
  const p = plano(t, [c1, c2, c3, c4]);
  if (p === 0) {
    // o SAMU empurra a maca pelo corredor; o Kaique, de olho roxo, na sala de espera
    const mx = freia(t, 0, c1 + 0.3, -180, 680);
    return (
      <AbsoluteFill>
        <Corredor />
        <Tela>
          <Cadeiras x={30} y={1600} n={3} e={0.85} />
          <Kaique x={200} y={1711} escala={0.95} olhoRoxo={1} olha={0.5} gesto={false} pose={{ pernaE: -72, joelhoE: 72, pernaD: -72, joelhoD: 72, bracoD: 34, antebracoD: -132, cabeca: -4 }} />
          <rect x={252} y={1020} width={74} height={54} rx={16} fill="#7FB3E8" />
          <Socorrista x={mx - 520} y={1750} escala={1} anda={1.1} olha={0.4} pose={{ bracoD: 60, antebracoD: -30 }} />
          <Maca x={mx} y={1810} />
          <Denis x={mx - 330} y={1500} escala={0.92} rot={90} olhos="normal" boca="neutra" gesto={false} sombra={false} />
        </Tela>
      </AbsoluteFill>
    );
  }
  if (p === 1) {
    // o Kaique olha pela parede com o olho bom e arregala
    const tt = t - c1;
    return (
      <AbsoluteFill>
        <Zoom z={freia(tt, 0, 1.4, 2.0, 2.1)} ox={260} oy={1045} dx={280}>
          <Corredor />
          <Tela>
            <Cadeiras x={30} y={1600} n={3} e={0.85} />
            <Feixe t={t} x={224} y={1040} ang={3} comp={880} abre={130} forca={0.75} id="kk" />
            <Kaique x={200} y={1711} escala={0.95} olhoRoxo={1} raio={1} olhos="espanto" boca="o" olha={0.5} gesto={false} pose={{ pernaE: -72, joelhoE: 72, pernaD: -72, joelhoD: 72, bracoD: 12, antebracoD: -60 }} />
          </Tela>
        </Zoom>
        <Placa s={tt} de={0.1} ate={2.2} nome="KAIQUE, 20" desc="O RAIO-X (EP. 4)" x={540} y={520} />
      </AbsoluteFill>
    );
  }
  if (p === 2) {
    // primeira pessoa: o braço dele e três agulhas entortando
    const a0 = clipe("n-agulhas").inicio - S.hospital;
    const a1 = palavra("n-agulhas", "agulhas") - S.hospital + 0.02;
    const a2 = palavra("n-agulhas", "tortas") - S.hospital + 0.05;
    const tent = [a0, a1, a2];
    const atual = tent.filter((x) => t >= x - 0.16).length - 1;
    const ini = atual >= 0 ? tent[atual] : a0;
    const tt = t - ini;
    const NY = 1090;
    const desce = t < a0 - 0.16 ? 760 : tt < 0 ? interpolate(tt, [-0.16, 0], [800, NY], clamp) : NY - freia(tt, 0.14, AGULHA_DUR, 0, 220);
    const dobra = tt > 0 ? freia(tt, 0, 0.1, 0, 1) : 0;
    return (
      <AbsoluteFill>
        <Corredor blur={16} />
        <Tela>
          <rect x={0} y={1040} width={1080} height={880} fill="#E8EEEA" />
          {[1160, 1320, 1500, 1680].map((ly, i) => (
            <path key={i} d={`M 0 ${ly} q 300 ${i * 10 - 12} 560 4 t 520 -8`} stroke="rgba(120,140,135,0.3)" strokeWidth={8} fill="none" />
          ))}
          {/* o braço */}
          <rect x={-40} y={1100} width={1180} height={210} rx={90} fill="#B07A52" />
          <rect x={-40} y={1100} width={1180} height={60} rx={30} fill="rgba(255,255,255,0.1)" />
          <path d="M 320 1190 Q 520 1176 760 1208" stroke="#8E5F3E" strokeWidth={9} fill="none" opacity={0.6} />
          <rect x={-40} y={1094} width={280} height={222} rx={30} fill="#C8742C" />
          {/* bandeja com as agulhas tortas */}
          <rect x={120} y={1560} width={840} height={120} rx={22} fill="#AEB5B2" />
          <rect x={136} y={1572} width={808} height={96} rx={16} fill="#C9CED6" />
          {tent.map((x, i) =>
            t > x + AGULHA_DUR ? (
              <g key={i} transform={`translate(${320 + i * 220} 1640) rotate(90) scale(0.85)`}>
                <Agulha x={0} y={0} dobra={1} />
              </g>
            ) : null,
          )}
          {/* mão de luva */}
          {atual >= 0 || t >= a0 - 0.16 ? (
            <g transform={`translate(${520 + Math.sin(tg * 2) * 3} ${desce}) scale(1.8)`}>
              <Agulha x={0} y={-112} dobra={dobra} />
              <circle cx={44} cy={-280} r={54} fill="#E8F4F6" />
              <rect x={40} y={-320} width={600} height={100} rx={46} fill="#E8F4F6" />
              <rect x={280} y={-340} width={420} height={140} rx={30} fill="#6FBFB4" />
            </g>
          ) : null}
        </Tela>
        {tent.map((x, i) => (
          <Onom key={i} t={t - x} texto="TIN!" x={[360, 760, 560][i]} y={[820, 760, 700][i]} tam={110} ang={i % 2 ? 7 : -7} dur={0.34} />
        ))}
      </AbsoluteFill>
    );
  }
  if (p === 3) {
    const tt = t - c3;
    return (
      <Zoom z={1.24 + tt * 0.03} ox={560} oy={1150}>
        <Corredor />
        <Tela>
          <Maca x={330} y={1760} e={0.82} />
          <Denis x={260} y={1647} escala={0.86} olha={0.5} olhos="normal" boca="neutra" gesto={false} pose={{ pernaE: -72, joelhoE: 72, pernaD: -72, joelhoD: 72, bracoD: 40, antebracoD: -30 }} />
          {/* balcão e o computador */}
          <rect x={660} y={1250} width={440} height={520} fill="#8FAFA2" />
          <rect x={650} y={1236} width={460} height={28} rx={6} fill="#6F8A80" />
          <rect x={700} y={1070} width={210} height={150} rx={10} fill="#1A1E24" />
          <rect x={712} y={1082} width={186} height={126} fill="#2C5A7C" />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={726} y={1096 + i * 24} width={i * 40 + 44} height={9} fill="#BFE0F4" />
          ))}
          <rect x={790} y={1220} width={30} height={20} fill="#1A1E24" />
          <Enfermeira x={590} y={1650} escala={0.95} olha={0.7} olhos="normal" gesto={false} pose={{ bracoD: 54, antebracoD: -46 + Math.sin(tg * 18) * 5 }} />
        </Tela>
      </Zoom>
    );
  }
  // a tela do sistema
  const tt = t - c4;
  const le = clipe("n-le").inicio - S.hospital;
  const nao = palavra("n-le", "não") - S.hospital;
  const LINHAS = ["PACIENTE: DENIS, 34", "QUEDA: 4 ANDARES", "SEM LESÃO", "3 AGULHAS TORTAS"];
  const n = Math.floor(tt * 28);
  let conta = 0;
  return (
    <AbsoluteFill style={{ background: "#0B1014" }}>
      <AbsoluteFill style={{ transform: `scale(${1 + Math.max(0, t - le) * 0.05})`, transformOrigin: "540px 760px" }}>
        <div style={{ position: "absolute", left: 50, top: 180, width: 980, height: 960, borderRadius: 28, background: "#10263A", boxShadow: "0 0 90px rgba(90,170,220,0.35)", border: "18px solid #1A1E24", overflow: "hidden", fontFamily: FONTE, fontWeight: 800 }}>
          <div style={{ background: "#1F6B8E", color: "#E8F6FF", fontSize: 46, padding: "20px 40px" }}>SISTEMA DE PRONTUÁRIO · PS JD. AURORA</div>
          <div style={{ padding: "34px 44px", color: "#CFE9FA", fontSize: 76, lineHeight: 1.26 }}>
            {LINHAS.map((l) => {
              const mostra = Math.max(0, Math.min(l.length, n - conta));
              conta += l.length;
              return <div key={l}>{l.slice(0, mostra)}</div>;
            })}
          </div>
          {t >= le && (
            <div style={{ position: "absolute", left: 44, right: 44, top: 560, background: "#123F31", color: COR.aurora, fontSize: 74, padding: "16px 30px", textAlign: "center", borderRadius: 14 }}>
              ✓ REGISTRO ENVIADO
            </div>
          )}
          {t >= nao && (
            <div style={{ position: "absolute", left: 44, right: 44, top: 720, color: "#FF9A9A", fontSize: 50, lineHeight: 1.2, textAlign: "center", opacity: freia(t, nao, nao + 0.4, 0, 1) }}>
              CÓPIA AUTOMÁTICA → D.E.A.
              <br />
              DEP. DE EVENTOS ATMOSFÉRICOS
            </div>
          )}
        </div>
      </AbsoluteFill>
      {/* o tom vira aqui: a sala vai apagando em volta da tela */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, transparent 40%, rgba(0,0,0,0.85) 100%)", opacity: suave(t, le, le + 1.6, 0, 1) }} />
    </AbsoluteFill>
  );
};
