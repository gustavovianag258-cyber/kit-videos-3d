import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { Aurora, Estrelas, PisoPerspectiva } from "./cenas";
import { Cida, Olheiro, useBoca } from "./elenco";
import { Camada, clamp, COR, Facho, FONTE, Poeira } from "./estilo";
import { Calendario, Cama, CriadoMudo, FiltroBarro, Fogao, Fruteira, Geladeira, PanoDePrato, Planta, Quadro, RoupaNoChao, Tapete, Televisao, Tenis, Ventilador, Xicara } from "./objetos";
import { Jonas, Pudim } from "./personagens";

// Cenas 5 a 16 do episódio 1. Cada cena recebe `t` (segundos desde o início dela) e corta
// entre 2 ou 3 planos, como nas referências (um corte a cada 2–4 s).

export const plano = (t: number, cortes: number[]) => cortes.filter((c) => t >= c).length;
export const entra = (t: number, de: number, dur = 0.3) => interpolate(t, [de, de + dur], [0, 1], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });

// ---------- fundos reaproveitados ----------
export const FundoDiagrama: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, #1E3156 0%, #121D36 70%)" }}>
    <svg width={1080} height={1920} style={{ position: "absolute", opacity: 0.18 }}>
      {new Array(28).fill(0).map((_, i) => (
        <line key={`v${i}`} x1={i * 40} y1={0} x2={i * 40} y2={1920} stroke="#7FA8E0" strokeWidth={1} />
      ))}
      {new Array(49).fill(0).map((_, i) => (
        <line key={`h${i}`} x1={0} y1={i * 40} x2={1080} y2={i * 40} stroke="#7FA8E0" strokeWidth={1} />
      ))}
    </svg>
    {children}
  </AbsoluteFill>
);

export const Rotulo: React.FC<{ x: number; y: number; texto: string; cor?: string; tam?: number; op?: number }> = ({ x, y, texto, cor = "#fff", tam = 56, op = 1 }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: "translate(-50%,-50%)", fontFamily: FONTE, fontWeight: 800, fontSize: tam, color: cor, opacity: op, whiteSpace: "nowrap", textShadow: "0 3px 12px rgba(0,0,0,0.5)" }}>
    {texto}
  </div>
);

const QuartoChao: React.FC<{ t: number; luz?: number }> = ({ t, luz = 0.5 }) => (
  <>
    <Camada blur={12} dx={-t * 4}>
      <svg width={1080} height={1920}>
        <rect x={0} y={0} width={1080} height={1300} fill="#F0D7AE" />
        <rect x={560} y={140} width={420} height={560} rx={10} fill="#FFF5DA" />
        <rect x={0} y={1180} width={1080} height={40} fill="#C9A57A" />
        <Cama x={-300} y={1230} e={1.6} lencol="#6A4A7A" />
        <CriadoMudo x={620} y={1230} e={1.4} />
        <Ventilador x={960} y={1230} e={1.3} t={t} />
      </svg>
    </Camada>
    <Facho x={500} largura={520} angulo={22} forca={luz} />
    <PisoPerspectiva topo={1220} fuga={4} cor1="#B07A4E" cor2="#C99062" linha="rgba(80,45,20,0.35)" />
    <Camada blur={4}>
      <svg width={1080} height={1920}>
        <RoupaNoChao x={180} y={1420} e={1.6} />
        <Tenis x={880} y={1450} e={1.8} />
      </svg>
    </Camada>
  </>
);

export const CozinhaFundo: React.FC<{ t: number; blur?: number }> = ({ t, blur = 14 }) => (
  <Camada blur={blur} dx={-t * 5}>
    <svg width={1080} height={1920}>
      <rect x={0} y={0} width={1080} height={1920} fill="#E9D3B0" />
      {new Array(12).fill(0).map((_, i) =>
        new Array(9).fill(0).map((__, j) => <rect key={`${i}-${j}`} x={i * 96 - 20} y={420 + j * 70} width={90} height={64} rx={4} fill={(i + j) % 2 ? "#F6F0E6" : "#EDE4D6"} />),
      )}
      <rect x={60} y={120} width={360} height={260} rx={8} fill="#FFF6DD" />
      <rect x={230} y={120} width={14} height={260} fill="#E9D3B0" />
      <Calendario x={540} y={250} />
      <rect x={-40} y={1030} width={760} height={30} rx={6} fill="#5F4A3A" />
      <rect x={-40} y={1060} width={760} height={200} fill="#8B5E3C" />
      {[0, 250, 500].map((x) => (
        <rect key={x} x={x} y={1080} width={220} height={160} rx={10} fill="#9C6C46" />
      ))}
      <PanoDePrato x={300} y={1065} />
      <Fogao x={160} y={1030} t={t} />
      <FiltroBarro x={420} y={1030} e={0.8} />
      <Fruteira x={600} y={1030} />
      <Geladeira x={880} y={1250} />
    </svg>
  </Camada>
);

// ---------- Cena 5: a balança ----------
export const CenaBalanca: React.FC<{ t: number }> = ({ t }) => {
  const p = plano(t, [3.4, 8.2]);
  const boca = useBoca(["j-capinha"]);
  if (p === 0) {
    const k = entra(t, 0.6, 1.2);
    return (
      <FundoDiagrama>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <g opacity={0.35}>
            <Jonas x={380} y={1500} escala={1.45} />
          </g>
          <Jonas x={760} y={1500} escala={1.45 - 1.3 * k} olhos="espanto" boca="o" />
          <line x1={120} y1={1500} x2={960} y2={1500} stroke="#7FA8E0" strokeWidth={4} />
        </svg>
        <Rotulo x={380} y={520} texto="1,70 m" />
        <Rotulo x={760} y={1300} texto="17 cm" cor={COR.amarelo} op={k} />
        <Rotulo x={540} y={1660} texto="10× MENOR NA ALTURA" tam={64} op={entra(t, 1.6)} />
      </FundoDiagrama>
    );
  }
  if (p === 1) {
    const tt = t - 3.4;
    const kg = interpolate(tt, [0.8, 2.6], [70, 0.07], clamp);
    const caiCel = entra(tt, 3.0, 0.35);
    const pende = interpolate(tt, [3.3, 3.8], [0, 1], clamp);
    const ang = -10 + 26 * pende; // positivo = prato direito desce
    return (
      <FundoDiagrama>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <rect x={520} y={900} width={40} height={620} rx={10} fill="#C9D3E6" />
          <rect x={400} y={1500} width={280} height={40} rx={14} fill="#C9D3E6" />
          <g transform={`rotate(${ang} 540 900)`}>
            <rect x={160} y={890} width={760} height={20} rx={10} fill="#E8EEF8" />
            {[180, 900].map((px, i) => (
              <g key={px} transform={`translate(${px} 910) rotate(${-ang} 0 0)`}>
                <line x1={0} y1={0} x2={-90} y2={180} stroke="#E8EEF8" strokeWidth={4} />
                <line x1={0} y1={0} x2={90} y2={180} stroke="#E8EEF8" strokeWidth={4} />
                <path d="M -130 180 Q 0 240 130 180 Z" fill="#E8EEF8" />
                {i === 0 && <Jonas x={0} y={182} escala={0.22} olhos="espanto" boca="o" />}
                {i === 1 && caiCel > 0 && (
                  <g transform={`translate(0 ${interpolate(caiCel, [0, 1], [-700, 0])})`}>
                    <rect x={-40} y={110} width={80} height={70} rx={10} fill="#1d1d22" />
                    <rect x={-34} y={116} width={68} height={58} rx={6} fill="#2E3B57" />
                  </g>
                )}
              </g>
            ))}
          </g>
        </svg>
        <Rotulo x={540} y={560} texto={kg > 1 ? `${Math.round(kg)} kg` : "70 g"} tam={130} cor={kg > 1 ? "#fff" : COR.amarelo} />
        <Rotulo x={540} y={700} texto="1.000× MAIS LEVE" tam={60} op={entra(tt, 1.2)} />
        <Rotulo x={900} y={1250} texto="CELULAR · 180 g" tam={40} cor={COR.vermelho} op={pende} />
      </FundoDiagrama>
    );
  }
  const tt = t - 8.2;
  return (
    <AbsoluteFill style={{ background: "#F2D9B3", transform: `scale(${interpolate(tt, [0, 3], [1.08, 1.0])})` }}>
      <QuartoChao t={tt} />
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <g transform="translate(560 1560) skewX(-12)">
          <rect x={0} y={0} width={360} height={150} rx={26} fill="#1d1d22" />
          <rect x={14} y={12} width={332} height={126} rx={18} fill="#2E3B57" />
        </g>
        <Jonas x={400} y={1690} escala={0.75} pose={{ bracoE: -20, bracoD: -20, antebracoE: 110, antebracoD: -110 }} boca={boca} olhos="normal" />
      </svg>
      <Poeira semente="c5" n={30} />
    </AbsoluteFill>
  );
};

// ---------- Cena 6: frio em pleno verão ----------
export const CenaFrio: React.FC<{ t: number }> = ({ t }) => {
  const p = plano(t, [3.9]);
  const boca = useBoca(["j-congelando"], "dentes", "dentes");
  if (p === 0) {
    const tremor = Math.sin(t * 70) * 5;
    return (
      <AbsoluteFill style={{ background: "#F3D7A8", transform: `scale(${interpolate(t, [0, 4], [1.0, 1.08])})` }}>
        <Camada blur={10}>
          <svg width={1080} height={1920}>
            <rect x={0} y={0} width={1080} height={1920} fill="#EFD2A2" />
            <rect x={540} y={160} width={460} height={600} rx={10} fill="#FFF7DE" />
          </svg>
        </Camada>
        <Facho x={560} largura={560} angulo={24} forca={0.6} />
        {/* termômetro na parede */}
        <div style={{ position: "absolute", left: 140, top: 380, width: 120, height: 420, background: COR.creme, borderRadius: 60, boxShadow: "0 10px 30px rgba(0,0,0,0.25)" }}>
          <div style={{ position: "absolute", left: 48, top: 40, width: 24, height: 300, background: "#ddd", borderRadius: 12 }} />
          <div style={{ position: "absolute", left: 48, top: 110, width: 24, height: 230, background: COR.vermelho, borderRadius: 12 }} />
          <div style={{ position: "absolute", left: 30, top: 330, width: 60, height: 60, background: COR.vermelho, borderRadius: 30 }} />
        </div>
        <Rotulo x={200} y={880} texto="31 °C" tam={84} cor={COR.vermelho} />
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          {/* tampo da cômoda */}
          <rect x={-40} y={1450} width={1160} height={60} rx={10} fill="#7A5236" />
          <rect x={-40} y={1510} width={1160} height={420} fill="#8E6243" />
          <Xicara x={200} y={1452} e={1.4} />
          <g transform="translate(330 1452)">
            <rect x={-20} y={-260} width={160} height={260} rx={10} fill="#3A2C4C" />
            <rect x={-6} y={-246} width={132} height={160} fill="#8FC2D9" />
          </g>
          <rect x={880} y={1300} width={70} height={152} rx={14} fill="#C05070" />
          <rect x={898} y={1270} width={34} height={36} rx={6} fill="#EEE" />
          <g transform={`translate(${600 + tremor} 0)`}>
            <Jonas x={0} y={1452} escala={1.1} olhos="normal" boca={boca} pose={{ bracoE: -10, bracoD: -10, antebracoE: 120, antebracoD: -120 }} />
            {/* a meia enrolada no corpo */}
            <path d="M -130 1452 L -125 1050 Q -120 980 -40 975 L 40 975 Q 120 980 125 1050 L 130 1452 Z" fill="#E9E4DA" />
            {[1100, 1180, 1260, 1340, 1420].map((y) => (
              <rect key={y} x={-128} y={y} width={256} height={14} fill="#C9C1B3" />
            ))}
          </g>
          {new Array(6).fill(0).map((_, i) => (
            <path key={i} d={`M ${520 + i * 30} ${1000 + (i % 2) * 20} q 10 -10 0 -20 q -10 -10 0 -20`} stroke="#9CD4F5" strokeWidth={5} fill="none" opacity={0.5 + 0.5 * Math.sin(t * 8 + i)} />
          ))}
        </svg>
        <Poeira semente="c6" n={30} />
      </AbsoluteFill>
    );
  }
  const tt = t - 3.9;
  const setas = (cx: number, cy: number, r: number, n: number, k: number) =>
    new Array(n).fill(0).map((_, i) => {
      const a = (i / n) * Math.PI * 2;
      const d = r + 30 + ((tt * 80 + i * 13) % 60);
      return (
        <g key={i} opacity={k}>
          <line x1={cx + Math.cos(a) * (r + 10)} y1={cy + Math.sin(a) * (r + 10)} x2={cx + Math.cos(a) * d} y2={cy + Math.sin(a) * d} stroke={COR.vermelho} strokeWidth={8} strokeLinecap="round" />
        </g>
      );
    });
  return (
    <FundoDiagrama>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <circle cx={300} cy={900} r={190} fill="#F4C9A0" opacity={0.9} />
        {setas(300, 900, 190, 8, entra(tt, 0.3))}
        <circle cx={800} cy={950} r={60} fill="#F4C9A0" opacity={0.9} />
        {setas(800, 950, 60, 14, entra(tt, 1.2))}
      </svg>
      <Rotulo x={300} y={1180} texto="NORMAL" tam={48} />
      <Rotulo x={800} y={1180} texto="PEQUENO" tam={48} cor={COR.amarelo} />
      <Rotulo x={540} y={520} texto="MUITA PELE PRA POUCO CORPO" tam={58} op={entra(tt, 0.8)} />
    </FundoDiagrama>
  );
};

// ---------- Cena 7: vinte grãos de arroz ----------
export const CenaArroz: React.FC<{ t: number }> = ({ t }) => {
  const p = plano(t, [4.4]);
  const boca = useBoca(["j-fome"], "aberta", "neutra");
  const comidos = p === 0 ? Math.floor(interpolate(t, [0.6, 4.2], [0, 20], clamp)) : 20;
  const graos = new Array(20).fill(0).map((_, i) => ({ x: 380 + random(`gx${i}`) * 320, y: 1440 + random(`gy${i}`) * 90, r: random(`gr${i}`) * 180 }));
  return (
    <AbsoluteFill style={{ background: "#EAD9BE" }}>
      <CozinhaFundo t={t} />
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <rect x={-40} y={1300} width={1160} height={660} fill="#B07A4E" />
        <ellipse cx={540} cy={1500} rx={340} ry={120} fill="#F7F4EE" />
        <ellipse cx={540} cy={1490} rx={270} ry={88} fill="#EDE8DE" />
        {graos.slice(comidos).map((g, i) => (
          <ellipse key={i} cx={g.x} cy={g.y} rx={16} ry={7} fill="#fff" stroke="#ddd" strokeWidth={2} transform={`rotate(${g.r} ${g.x} ${g.y})`} />
        ))}
        <Jonas
          x={840}
          y={1560}
          escala={0.62}
          olhos={p === 1 ? "normal" : "fechado"}
          boca={p === 1 ? boca : Math.sin(t * 14) > 0 ? "o" : "sorriso"}
          pose={{ bracoD: 60, antebracoD: 80 }}
        />
        {p === 1 &&
          [0, 1, 2].map((i) => (
            <path key={i} d={`M ${800 + i * 22} 1390 q 8 -10 0 -18 q -8 -8 0 -16`} stroke="#7B5D45" strokeWidth={4} fill="none" opacity={Math.abs(Math.sin(t * 9 + i))} />
          ))}
      </svg>
      <Rotulo x={540} y={1760} texto={p === 0 ? `${20 - comidos} GRÃOS` : "+30 MIN"} tam={80} cor={p === 0 ? "#fff" : COR.amarelo} />
    </AbsoluteFill>
  );
};

// ---------- Cena 8: a mãe ----------
export const CenaMae: React.FC<{ t: number }> = ({ t }) => {
  const p = plano(t, [1.4, 5.0]);
  const bocaCida = useBoca(["c-celular"]);
  if (p === 0) {
    return (
      <AbsoluteFill style={{ background: "#EAD9BE" }}>
        <CozinhaFundo t={t} />
        <PisoPerspectiva topo={1250} fuga={8} cor1="#C9B49A" cor2="#E2CDB0" linha="rgba(120,95,70,0.35)" />
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Jonas x={540} y={1840} escala={0.7} olhos="espanto" boca="aberta" pose={{ bracoE: 40, bracoD: 40, antebracoE: -100, antebracoD: 100, cabeca: -6 }} />
          {[0, 1, 2].map((i) => {
            const r = 120 + ((t * 300 + i * 60) % 180);
            return <circle key={i} cx={540} cy={1430} r={r} fill="none" stroke="#fff" strokeWidth={5} opacity={1 - (r - 120) / 180} strokeDasharray="6 14" />;
          })}
        </svg>
        <Rotulo x={540} y={600} texto="♪ ~ fiiiiii ~ ♪" tam={56} cor={COR.amarelo} />
      </AbsoluteFill>
    );
  }
  if (p === 1) {
    const tt = t - 1.4;
    return (
      <AbsoluteFill style={{ background: "#3B3550", transform: `scale(${interpolate(tt, [0, 3.6], [1.0, 1.06])})` }}>
        <Camada blur={10}>
          <svg width={1080} height={1920}>
            <rect x={0} y={0} width={1080} height={1920} fill="#5E5470" />
            <rect x={620} y={300} width={360} height={260} rx={10} fill="#2A3346" />
            <rect x={640} y={320} width={320} height={220} rx={6} fill="#5A88B8" opacity={0.6} />
            <rect x={80} y={380} width={200} height={260} rx={8} fill="#7A6A54" />
            <Quadro x={200} y={760} e={1.2} />
            <Planta x={980} y={1250} e={1.6} />
            <Televisao x={800} y={1240} e={1.1} t={tt} />
          </svg>
        </Camada>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Tapete x={540} y={1760} e={1.4} />
        </svg>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <rect x={60} y={1260} width={960} height={260} rx={60} fill="#8C4A3C" />
          <rect x={30} y={1180} width={140} height={360} rx={50} fill="#7A3E32" />
          <rect x={910} y={1180} width={140} height={360} rx={50} fill="#7A3E32" />
          <Cida x={540} y={1460} escala={1.25} sentada celular bracoD={40} olhos={tt > 0.3 ? "normal" : "cima"} boca={bocaCida} />
          <rect x={60} y={1440} width={960} height={140} rx={40} fill="#9A5646" />
        </svg>
      </AbsoluteFill>
    );
  }
  const tt = t - 5.0;
  const vib = (amp: number, f: number) => Math.sin(tt * f) * amp;
  return (
    <FundoDiagrama>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <g transform="translate(300 950) rotate(-12)">
          <ellipse cx={0} cy={140} rx={170} ry={200} fill="#B9773F" />
          <ellipse cx={0} cy={-60} rx={130} ry={150} fill="#B9773F" />
          <circle cx={0} cy={60} r={55} fill="#3B2410" />
          <rect x={-18} y={-560} width={36} height={420} fill="#5A3B1E" />
          {[-9, 0, 9].map((dx) => (
            <line key={dx} x1={dx + vib(3, 25)} y1={-540} x2={dx} y2={260} stroke="#EEE" strokeWidth={3} />
          ))}
        </g>
        <g transform="translate(800 1000) rotate(-12) scale(0.55)">
          <ellipse cx={0} cy={140} rx={170} ry={200} fill="#8E3A1E" />
          <ellipse cx={0} cy={-60} rx={130} ry={150} fill="#8E3A1E" />
          <rect x={-18} y={-560} width={36} height={420} fill="#3B2410" />
          {[-9, 0, 9].map((dx) => (
            <line key={dx} x1={dx + vib(6, 70)} y1={-540} x2={dx} y2={260} stroke="#EEE" strokeWidth={4} />
          ))}
        </g>
      </svg>
      <Rotulo x={300} y={1420} texto="♪ grave" tam={52} />
      <Rotulo x={800} y={1420} texto="♪ agudo" tam={52} cor={COR.amarelo} />
      <Rotulo x={540} y={520} texto="CORDA MENOR = SOM FINO" tam={62} op={entra(tt, 0.4)} />
    </FundoDiagrama>
  );
};

// ---------- Cena 9: o Pudim acorda ----------
export const CenaPudimAcorda: React.FC<{ t: number }> = ({ t }) => {
  const p = plano(t, [3.4]);
  const boca = useBoca(["j-racao"], "o", "neutra");
  if (p === 0) {
    const abre = interpolate(t, [0.3, 1.0], [0.05, 1], clamp);
    const pupila = interpolate(t, [1.0, 2.2], [70, 16], clamp);
    return (
      <AbsoluteFill style={{ background: "#C76A24" }}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <rect x={0} y={0} width={1080} height={1920} fill="#E8873A" />
          {[300, 560, 820].map((x) => (
            <path key={x} d={`M ${x} 0 q 40 300 0 600`} stroke="#C76A24" strokeWidth={60} fill="none" opacity={0.5} />
          ))}
          <g transform={`translate(540 960) scale(${interpolate(t, [0, 3.4], [1, 1.15])})`}>
            <ellipse cx={0} cy={0} rx={380} ry={300 * abre} fill="#E8C64A" />
            <ellipse cx={0} cy={0} rx={pupila} ry={290 * abre} fill={COR.tinta} />
            <circle cx={-110} cy={-90 * abre} r={34 * abre} fill="#fff" opacity={0.85} />
            <path d={`M -400 ${-300 * abre} Q 0 ${-420 * abre} 400 ${-300 * abre}`} stroke="#C76A24" strokeWidth={40} fill="none" />
          </g>
        </svg>
      </AbsoluteFill>
    );
  }
  const tt = t - 3.4;
  return (
    <AbsoluteFill style={{ background: "#EAD9BE", transform: `scale(${interpolate(tt, [0, 4.4], [1.0, 1.1])})` }}>
      <CozinhaFundo t={tt} />
      <PisoPerspectiva topo={1250} fuga={9} cor1="#C9B49A" cor2="#E2CDB0" linha="rgba(120,95,70,0.35)" />
      <Camada blur={3}>
        <svg width={1080} height={1920}>
          <Pudim x={330} y={1560} escala={1.8} olhos="caca" agachado virado rabo={Math.sin(tt * 4)} />
        </svg>
      </Camada>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <Jonas x={860} y={1760} escala={0.62} olhos="espanto" boca={boca} pose={{ bracoE: 150, bracoD: 150, antebracoE: 10, antebracoD: -10 }} />
      </svg>
    </AbsoluteFill>
  );
};

// ---------- Cena 10: perseguição e pulo da mesa ----------
export const CenaPulo: React.FC<{ t: number }> = ({ t }) => {
  const p = plano(t, [1.6, 5.4, 8.0]);
  const boca = useBoca(["j-capeta", "j-vivo"]);
  if (p === 0) {
    const c = Math.sin(t * 16);
    return (
      <AbsoluteFill style={{ background: "#EAD9BE" }}>
        <CozinhaFundo t={t * 3} blur={18} />
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <rect x={-40} y={1350} width={1200} height={600} fill="#8B5E3C" />
          <rect x={-40} y={1330} width={1200} height={30} fill="#6E4C34" />
          <g transform={`translate(${interpolate(t, [0, 1.6], [600, 900])} 0)`}>
            <Jonas x={0} y={1340} escala={0.55} olhos="espanto" boca={boca} pose={{ bracoE: 40 * c, bracoD: -40 * c, antebracoE: -50, antebracoD: 50, pernaE: -32 * c, pernaD: 32 * c, tronco: 8 }} />
          </g>
          <g transform={`translate(${interpolate(t, [0, 1.6], [200, 420])} 1340) rotate(${interpolate(t, [0.4, 1.4], [0, 70], clamp)})`}>
            <path d="M -60 -120 L 60 -120 L 50 0 L -50 0 Z" fill="#F4F1EA" />
            <path d="M 60 -95 q 40 0 40 35 q 0 35 -45 30" stroke="#F4F1EA" strokeWidth={14} fill="none" />
          </g>
        </svg>
        <Camada blur={5}>
          <svg width={1080} height={1920}>
            <ellipse cx={interpolate(t, [0, 1.6], [-200, 120])} cy={1300} rx={240} ry={120} fill="#E8873A" />
          </svg>
        </Camada>
      </AbsoluteFill>
    );
  }
  if (p === 1) {
    const tt = t - 1.6;
    const y = interpolate(tt, [0, 1.2], [520, 1620], { ...clamp, easing: (x) => x * x });
    return (
      <AbsoluteFill style={{ background: "#EAD9BE" }}>
        <CozinhaFundo t={tt} />
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <rect x={-40} y={420} width={620} height={70} fill="#6E4C34" />
          <rect x={460} y={490} width={60} height={1180} fill="#5B3F2C" />
          <rect x={-40} y={1660} width={1160} height={300} fill="#9A4F5A" />
          <rect x={-40} y={1660} width={1160} height={22} fill="#7C3C46" />
          {/* régua da altura */}
          <rect x={860} y={520} width={34} height={1140} fill={COR.creme} rx={6} />
          {new Array(16).fill(0).map((_, i) => (
            <rect key={i} x={860} y={520 + i * 76} width={i % 4 === 0 ? 30 : 16} height={4} fill={COR.tinta} />
          ))}
          {tt < 1.25 &&
            [0, 1, 2].map((i) => <line key={i} x1={690 + i * 30} y1={y - 400} x2={690 + i * 30} y2={y - 260} stroke="#fff" strokeWidth={4} opacity={0.6} />)}
          <Jonas
            x={720}
            y={Math.min(y, 1660) + (tt > 1.2 ? -Math.abs(Math.sin((tt - 1.2) * 9)) * 40 * Math.max(0, 1 - (tt - 1.2)) : 0)}
            escala={0.26}
            olhos="espanto"
            boca="aberta"
            pose={{ bracoE: 150, bracoD: 150, pernaE: 20, pernaD: -20 }}
          />
        </svg>
        <Rotulo x={760} y={400} texto="75 cm = 4× A ALTURA DELE" tam={50} cor={COR.amarelo} op={entra(tt, 0.2)} />
      </AbsoluteFill>
    );
  }
  if (p === 2) {
    const tt = t - 5.4;
    return (
      <FundoDiagrama>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <g transform="translate(300 900)">
            <circle cx={0} cy={0} r={150} fill="#F4C9A0" opacity={0.9} />
            <line x1={0} y1={180} x2={0} y2={460} stroke={COR.vermelho} strokeWidth={22} />
            <path d="M -40 440 L 0 500 L 40 440 Z" fill={COR.vermelho} />
            <line x1={0} y1={-180} x2={0} y2={-260} stroke="#9CD4F5" strokeWidth={14} opacity={entra(tt, 0.4)} />
          </g>
          <g transform="translate(800 900)">
            <circle cx={0} cy={0} r={45} fill="#F4C9A0" opacity={0.9} />
            <line x1={0} y1={60} x2={0} y2={120} stroke={COR.vermelho} strokeWidth={10} />
            <line x1={0} y1={-60} x2={0} y2={-260} stroke="#9CD4F5" strokeWidth={22} opacity={entra(tt, 0.8)} />
            <path d="M -40 -240 L 0 -300 L 40 -240 Z" fill="#9CD4F5" opacity={entra(tt, 0.8)} />
          </g>
        </svg>
        <Rotulo x={300} y={1500} texto="PESO" tam={48} cor={COR.vermelho} />
        <Rotulo x={800} y={520} texto="AR" tam={48} cor="#9CD4F5" op={entra(tt, 0.8)} />
        <Rotulo x={540} y={1650} texto="O AR FREIA" tam={70} cor={COR.amarelo} op={entra(tt, 1.2)} />
      </FundoDiagrama>
    );
  }
  const tt = t - 8.0;
  return (
    <AbsoluteFill style={{ background: "#9A4F5A", transform: `scale(${interpolate(tt, [0, 3], [1.1, 1.0])})` }}>
      <CozinhaFundo t={tt} />
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <rect x={-40} y={1250} width={1160} height={700} fill="#9A4F5A" />
        {new Array(12).fill(0).map((_, i) => (
          <line key={i} x1={i * 100} y1={1250} x2={i * 100 - 60} y2={1950} stroke="#7C3C46" strokeWidth={6} />
        ))}
        <Jonas x={540} y={1890} escala={0.9} olhos="espanto" boca={boca} pose={{ bracoE: 20, bracoD: 20, antebracoE: -120 + Math.sin(tt * 10) * 20, antebracoD: 120 - Math.sin(tt * 10) * 20 }} />
      </svg>
    </AbsoluteFill>
  );
};

// ---------- Cena 11: debaixo do sofá ----------
export const CenaSofa: React.FC<{ t: number }> = ({ t }) => {
  const boca = useBoca(["j-menor"], "o", "neutra");
  const pata = Math.max(0, Math.sin(t * 2.2)) * 260;
  const brilho = interpolate(t, [3.6, 5.6], [0, 1], clamp);
  const esc = interpolate(t, [4.8, 5.9], [1.0, 0.04], clamp);
  return (
    <AbsoluteFill style={{ background: "#1B1626" }}>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <rect x={0} y={0} width={1080} height={700} fill="#4A2E2A" />
        <rect x={0} y={680} width={1080} height={40} fill="#3A221F" />
        {new Array(9).fill(0).map((_, i) => (
          <path key={i} d={`M ${i * 130} 720 q 30 30 65 0 q 30 30 65 0`} stroke="#5B3A35" strokeWidth={8} fill="none" />
        ))}
        <rect x={0} y={1500} width={1080} height={420} fill="#2A2233" />
        <ellipse cx={540} cy={1500} rx={600} ry={80} fill="#231C2C" />
        <rect x={60} y={1420} width={170} height={60} rx={12} fill="#1E1E22" transform="rotate(-8 140 1450)" />
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x={80 + i * 28} y={1435} width={16} height={12} rx={3} fill="#555" transform="rotate(-8 140 1450)" />
        ))}
        <circle cx={700} cy={1470} r={26} fill="#C9A24A" />
        <circle cx={760} cy={1480} r={20} fill="#B08A3A" />
        <path d="M 300 1490 Q 340 1440 400 1470 Q 430 1500 380 1500 Z" fill="#E9E4DA" />
        {[0, 1, 2, 3].map((i) => (
          <circle key={i} cx={560 + i * 90} cy={1490 - (i % 2) * 14} r={18 + (i % 3) * 6} fill="#4A4258" opacity={0.8} />
        ))}
        {/* pata do gato entrando pela direita */}
        <g transform={`translate(${1180 - pata} 1380)`}>
          <rect x={0} y={-50} width={500} height={110} rx={55} fill="#E8873A" />
          {[-30, 0, 30].map((dy) => (
            <circle key={dy} cx={10} cy={dy} r={22} fill="#F6C08A" />
          ))}
        </g>
        <g transform={`translate(420 1500) scale(${esc}) translate(-420 -1500)`}>
          <Jonas x={420} y={1500} escala={0.7} olhos={t > 2.4 ? "fechado" : "espanto"} boca={boca} brilho={brilho * 2} />
        </g>
      </svg>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 39% 66%, rgba(60,240,160,${0.45 * brilho}) 0%, rgba(0,0,0,0) 35%)`, mixBlendMode: "screen" }} />
    </AbsoluteFill>
  );
};

// ---------- Cena 12: o mundo borrado ----------
export const CenaBorrado: React.FC<{ t: number }> = ({ t }) => {
  const p = plano(t, [2.2]);
  const boca = useBoca(["j-cego"]);
  const f = useCurrentFrame();
  if (p === 0) {
    return (
      <AbsoluteFill style={{ background: "#2A2233" }}>
        <AbsoluteFill style={{ filter: "blur(38px)" }}>
          <svg width={1080} height={1920}>
            <rect x={0} y={0} width={1080} height={1920} fill="#3A2E44" />
            <rect x={600} y={200} width={400} height={500} fill="#F0D7AE" />
            <ellipse cx={300} cy={1300} rx={400} ry={200} fill="#E8873A" />
          </svg>
        </AbsoluteFill>
        {new Array(14).fill(0).map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: random(`bx${i}`) * 1000,
              top: random(`by${i}`) * 1700,
              width: 80 + random(`br${i}`) * 140,
              height: 80 + random(`br${i}`) * 140,
              borderRadius: "50%",
              border: "3px solid rgba(255,240,200,0.35)",
              background: "rgba(255,240,200,0.12)",
              transform: `scale(${1 + 0.06 * Math.sin(f / 10 + i)})`,
            }}
          />
        ))}
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Jonas x={540} y={1250} escala={0.5} olhos="espanto" boca={boca} pose={{ bracoE: 70, bracoD: 70, antebracoE: -40, antebracoD: 40 }} />
        </svg>
      </AbsoluteFill>
    );
  }
  const tt = t - 2.2;
  const raios = (cx: number, cy: number, abre: number, k: number) =>
    new Array(7).fill(0).map((_, i) => {
      const dy = (i - 3) * 22;
      return <line key={i} x1={cx - 330} y1={cy + dy} x2={cx + 300} y2={cy + dy * abre} stroke="#FFE9A8" strokeWidth={5} opacity={0.8 * k} />;
    });
  return (
    <FundoDiagrama>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        {/* olho normal: a luz chega num ponto */}
        <g opacity={entra(tt, 0.2)}>
          <circle cx={620} cy={700} r={170} fill="#EAF2FB" />
          <circle cx={470} cy={700} r={40} fill="#3A6EA5" />
          {raios(470, 700, -0.1, 1)}
          <circle cx={770} cy={690} r={14} fill="#FFE9A8" />
        </g>
        {/* olho minúsculo: a luz espalha */}
        <g opacity={entra(tt, 2.0)}>
          <circle cx={620} cy={1300} r={170} fill="#EAF2FB" />
          <rect x={455} y={1293} width={30} height={14} fill="#3A6EA5" />
          {[0, 1, 2, 3].map((i) => (
            <circle key={i} cx={470} cy={1300} r={60 + i * 70 + ((tt * 60) % 70)} fill="none" stroke="#FFE9A8" strokeWidth={6} opacity={0.6 - i * 0.12} />
          ))}
        </g>
      </svg>
      <Rotulo x={540} y={460} texto="NORMAL: FOCO" tam={52} op={entra(tt, 0.2)} />
      <Rotulo x={540} y={1040} texto="PUPILA MAIS FINA QUE UM FIO DE CABELO" tam={44} cor={COR.amarelo} op={entra(tt, 2.0)} />
      <Rotulo x={540} y={1560} texto="A LUZ SE ESPALHA" tam={64} cor={COR.vermelho} op={entra(tt, 3.6)} />
    </FundoDiagrama>
  );
};

// ---------- Cena 13: a gota ----------
export const CenaGota: React.FC<{ t: number }> = ({ t }) => {
  const p = plano(t, [4.6, 7.0]);
  const f = useCurrentFrame();
  const boca = useBoca(["j-afogado"]);
  if (p === 0 || p === 2) {
    const dentro = p === 2 || t > 3.2;
    const xJ = interpolate(t, [0, 3.0], [180, 420], clamp);
    return (
      <AbsoluteFill style={{ background: "#C9B49A" }}>
        <Camada blur={16}>
          <svg width={1080} height={1920}>
            <rect x={0} y={0} width={1080} height={1200} fill="#DCC7A8" />
            <rect x={600} y={0} width={360} height={1100} rx={20} fill="#BFD2E0" />
            <FiltroBarro x={300} y={1100} e={2.6} />
          </svg>
        </Camada>
        <PisoPerspectiva topo={1100} fuga={13} cor1="#BFA88C" cor2="#D9C4A6" linha="rgba(120,95,70,0.25)" />
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <defs>
            <radialGradient id="gotaGrad" cx="0.4" cy="0.35" r="0.7">
              <stop offset="0" stopColor="#E6F6FF" stopOpacity={0.9} />
              <stop offset="0.6" stopColor="#8CC8EE" stopOpacity={0.55} />
              <stop offset="1" stopColor="#4A90C8" stopOpacity={0.7} />
            </radialGradient>
          </defs>
          <ellipse cx={620} cy={1560} rx={360} ry={40} fill="rgba(40,80,120,0.25)" />
          {!dentro && <Jonas x={xJ} y={1560} escala={0.4} olhos="normal" boca="o" pose={{ bracoD: 60, antebracoD: 60 }} />}
          <path
            d={`M 260 1560 Q ${260 + Math.sin(f / 8) * 6} 1180 620 1170 Q ${980 + Math.cos(f / 9) * 6} 1180 980 1560 Z`}
            fill="url(#gotaGrad)"
          />
          {dentro && (
            <g transform={`translate(620 1440) rotate(${Math.sin(f / 5) * 18})`}>
              <Jonas x={0} y={0} escala={0.4} olhos="espanto" boca={boca} pose={{ bracoE: 140 + Math.sin(f / 3) * 30, bracoD: 140 - Math.sin(f / 3) * 30, pernaE: 20 * Math.sin(f / 4), pernaD: -20 * Math.sin(f / 4) }} />
            </g>
          )}
          {dentro &&
            new Array(10).fill(0).map((_, i) => (
              <circle key={i} cx={560 + random(`bb${i}`) * 140} cy={1450 - ((f * 3 + i * 40) % 260)} r={6 + random(`bs${i}`) * 10} fill="none" stroke="#fff" strokeWidth={3} opacity={0.7} />
            ))}
          <ellipse cx={500} cy={1250} rx={70} ry={30} fill="#fff" opacity={0.6} transform="rotate(-25 500 1250)" />
        </svg>
      </AbsoluteFill>
    );
  }
  const tt = t - 4.6;
  return (
    <FundoDiagrama>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <path d="M 200 1300 Q 220 820 540 810 Q 860 820 880 1300 Z" fill="#8CC8EE" opacity={0.5} />
        {new Array(9).fill(0).map((_, i) => {
          const a = Math.PI * (0.1 + 0.8 * (i / 8));
          const x = 540 - Math.cos(a) * 330;
          const y = 1300 - Math.sin(a) * 470;
          return <line key={i} x1={x} y1={y} x2={x + Math.cos(a) * 60 * entra(tt, 0.3 + i * 0.08)} y2={y + Math.sin(a) * 60 * entra(tt, 0.3 + i * 0.08)} stroke={COR.amarelo} strokeWidth={8} strokeLinecap="round" />;
        })}
        <Jonas x={540} y={1280} escala={0.3} olhos="espanto" boca="aberta" />
      </svg>
      <Rotulo x={540} y={560} texto="TENSÃO SUPERFICIAL" tam={58} op={entra(tt, 0.2)} />
      <Rotulo x={540} y={1500} texto="ÁGUA = COLA" tam={84} cor={COR.amarelo} op={entra(tt, 1.0)} />
    </FundoDiagrama>
  );
};

// ---------- Cena 14: volta ao tamanho de caneta ----------
export const CenaVolta: React.FC<{ t: number }> = ({ t }) => {
  const boca = useBoca(["j-pronto"], "o", "neutra");
  const flash = interpolate(t, [0, 0.35], [1, 0], clamp);
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#EAD9BE" }}>
      <CozinhaFundo t={t} />
      <PisoPerspectiva topo={1250} fuga={14} cor1="#C9B49A" cor2="#E2CDB0" linha="rgba(120,95,70,0.35)" />
      <Camada blur={6}>
        <svg width={1080} height={1920}>
          {/* Pudim dormindo de barriga pra cima */}
          <g transform="translate(260 1380) rotate(180) scale(1.1)">
            <Pudim x={0} y={0} olhos="fechados" />
          </g>
        </svg>
      </Camada>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <Jonas x={700} y={1720} escala={0.8} olhos="fechado" boca={boca} pose={{ tronco: 10, bracoE: 10, bracoD: 10, cabeca: 10 }} />
        {new Array(6).fill(0).map((_, i) => (
          <ellipse key={i} cx={640 + i * 24} cy={1300 + ((f * 4 + i * 50) % 400)} rx={6} ry={10} fill="#8CC8EE" />
        ))}
      </svg>
      <AbsoluteFill style={{ background: COR.aurora, opacity: flash * 0.7, mixBlendMode: "screen" }} />
    </AbsoluteFill>
  );
};

// ---------- Cena 15: o celular vibra, o Olheiro lá fora ----------
export const CenaOlheiro: React.FC<{ t: number }> = ({ t }) => {
  const p = plano(t, [4.8, 6.6]);
  const boca = useBoca(["j-quem"]);
  if (p === 0) {
    const vib = t < 0.8 ? Math.sin(t * 90) * 6 : 0;
    const msg = entra(t, 0.6);
    return (
      <AbsoluteFill style={{ background: "#B07A4E" }}>
        <PisoPerspectiva topo={0} fuga={15} cor1="#A06C42" cor2="#C99062" linha="rgba(80,45,20,0.35)" />
        <div style={{ position: "absolute", left: 140 + vib, top: 260, width: 800, height: 1400, borderRadius: 80, background: "#1d1d22", boxShadow: "0 30px 80px rgba(0,0,0,0.5)" }}>
          <div style={{ position: "absolute", inset: 26, borderRadius: 60, background: "linear-gradient(180deg,#1F2A44,#121826)" }}>
            <div style={{ position: "absolute", top: 60, width: "100%", textAlign: "center", fontFamily: FONTE, fontWeight: 700, fontSize: 120, color: "#fff" }}>03:17</div>
            <div
              style={{
                position: "absolute",
                left: 50,
                right: 50,
                top: 380,
                background: "rgba(255,255,255,0.12)",
                borderRadius: 34,
                padding: "30px 36px",
                opacity: msg,
                transform: `translateY(${(1 - msg) * 40}px)`,
              }}
            >
              <div style={{ fontFamily: FONTE, fontWeight: 700, fontSize: 34, color: COR.aurora, letterSpacing: 2 }}>NÚMERO DESCONHECIDO</div>
              <div style={{ fontFamily: FONTE, fontWeight: 700, fontSize: 52, color: "#fff", marginTop: 14, lineHeight: 1.15 }}>
                Vi o que cê fez com a gota. Tenho uma vaga pra você.
              </div>
              <div style={{ fontFamily: FONTE, fontWeight: 800, fontSize: 52, color: COR.aurora, marginTop: 12 }}>— O.</div>
            </div>
          </div>
        </div>
      </AbsoluteFill>
    );
  }
  if (p === 1) {
    return (
      <AbsoluteFill style={{ background: "#EAD9BE" }}>
        <CozinhaFundo t={t} />
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Jonas x={540} y={2350} escala={1.9} olhos="normal" boca={boca} pose={{ bracoD: 150, antebracoD: 40, cabeca: 12 }} />
        </svg>
        <Rotulo x={540} y={380} texto="?" tam={220} cor={COR.amarelo} />
      </AbsoluteFill>
    );
  }
  const tt = t - 6.6;
  const verde = tt > 1.2 && tt < 1.55 ? 1 : tt > 3.5 ? interpolate(tt, [3.5, 4], [0, 1], clamp) : 0;
  return (
    <AbsoluteFill style={{ background: "#2B2240", transform: `scale(${interpolate(tt, [0, 6], [1.0, 1.12])})` }}>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <rect x={0} y={0} width={1080} height={1920} fill="#3A2E55" />
        <rect x={0} y={1350} width={1080} height={570} fill="#4B4458" />
        <rect x={0} y={1330} width={1080} height={30} fill="#5E566C" />
        <rect x={0} y={420} width={480} height={930} fill="#2A2140" />
        <rect x={620} y={560} width={460} height={790} fill="#2F2647" />
        <rect x={80} y={560} width={140} height={160} fill="#FFD27A" opacity={0.8} />
        <rect x={700} y={700} width={120} height={140} fill="#FFD27A" opacity={0.6} />
        <rect x={560} y={300} width={16} height={1040} fill="#16122A" />
        <path d="M -20 420 Q 300 520 568 400 Q 800 480 1100 410" stroke="#16122A" strokeWidth={5} fill="none" />
        <circle cx={568} cy={300} r={180} fill="#FFD27A" opacity={0.18} style={{ filter: "blur(30px)" }} />
        <rect x={548} y={290} width={50} height={20} rx={6} fill="#FFE3A0" />
        <g transform="translate(700 1480)">
          <rect x={0} y={-150} width={420} height={120} rx={30} fill="#7A2E3A" />
          <rect x={60} y={-230} width={260} height={100} rx={30} fill="#7A2E3A" />
          <rect x={90} y={-215} width={90} height={70} rx={10} fill="#9FC0D8" opacity={0.5} />
          <rect x={200} y={-215} width={90} height={70} rx={10} fill="#9FC0D8" opacity={0.5} />
          <circle cx={90} cy={-30} r={44} fill="#1E1E22" />
          <circle cx={330} cy={-30} r={44} fill="#1E1E22" />
        </g>
        {/* lambe-lambe colado no muro */}
        <g transform="rotate(-4 300 1000)">
          <rect x={220} y={880} width={180} height={240} fill="#E9E1D0" opacity={0.85} />
          <rect x={232} y={892} width={156} height={120} fill="#3CF0A0" opacity={0.55} />
          <text x={310} y={1050} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={24} fill="#2A2230">MUNDO</text>
          <text x={310} y={1078} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={24} fill="#2A2230">PARALELO</text>
          <text x={310} y={1104} textAnchor="middle" fontFamily={FONTE} fontWeight={700} fontSize={15} fill="#2A2230">@mundoparalelo.br</text>
        </g>
        <rect x={120} y={1360} width={110} height={160} rx={12} fill="#3E7A4E" />
        <rect x={110} y={1346} width={130} height={22} rx={8} fill="#2E5A3A" />
        <Olheiro x={540} y={1560} escala={0.75} olhosVerdes={verde} />
      </svg>
      {/* moldura da janela do Jonas, em primeiro plano */}
      <div style={{ position: "absolute", inset: 0, border: "70px solid #4A3C66", boxShadow: "inset 0 0 120px rgba(0,0,0,0.6)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 920, height: 40, background: "#4A3C66" }} />
    </AbsoluteFill>
  );
};

// ---------- Cena 16: cartão final ----------
export const CenaFinal: React.FC<{ t: number; ep?: number; titulo?: string; parte?: number }> = ({ t, ep = 1, titulo = "JONAS ENCOLHEU", parte = 2 }) => {
  const k = entra(t, 0.1, 0.4);
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg,#070B1E 0%,#1A1640 60%,#352653 100%)" }}>
      <Estrelas altura={1920} n={120} />
      <Aurora altura={1300} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: COR.creme, borderRadius: 24, padding: "50px 70px 40px", textAlign: "center", transform: `scale(${0.85 + 0.15 * k})`, opacity: k, boxShadow: "0 20px 60px rgba(0,0,0,0.5)", position: "relative" }}>
          <div style={{ position: "absolute", top: -26, left: "50%", transform: "translateX(-50%)", background: COR.aurora, color: COR.tinta, fontFamily: FONTE, fontWeight: 800, fontSize: 34, padding: "4px 22px", borderRadius: 8, whiteSpace: "nowrap" }}>
            AURORA · EP. {ep}
          </div>
          <div style={{ fontFamily: FONTE, fontWeight: 800, fontSize: 96, color: COR.tinta, lineHeight: 1 }}>{titulo}</div>
          <div style={{ fontFamily: FONTE, fontWeight: 800, fontSize: 48, color: COR.vermelho, marginTop: 18 }}>CONTINUA NA PARTE {parte}</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
