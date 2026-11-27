import { AbsoluteFill, interpolate } from "remotion";
import { Sobrado } from "../aurora/cenas";
import { Cida, Olheiro } from "../aurora/elenco";
import {
  Camada,
  clamp,
  COR,
  Facho,
  FONTE,
  Placa,
  Poeira,
} from "../aurora/estilo";
import { Jonas } from "../aurora/personagens";
import { Boca } from "../aurora/personagens";
import { Bruno } from "./bruno";
import { Adesivo, Arvore, Bebedouro, Bola, Bueiro, CarroParado, Cone, Extintor, Garrafa, Lixeira, Mochila, Orelhao, Picho, PlacaLoja } from "./objetos";

// Cenários novos do ep. 2 (busão por fora e por dentro, quadra da escola). Mesmo esquema do
// ep. 1: cada cena recebe `t` e corta entre planos; câmera sempre com zoom lento.

const plano = (t: number, cortes: number[]) =>
  cortes.filter((c) => t >= c).length;
const mod = (a: number, n: number) => ((a % n) + n) % n;

// ---------- peças da rua ----------
const Poste: React.FC<{ x: number; topo: number; base: number }> = ({
  x,
  topo,
  base,
}) => (
  <g>
    <rect x={x} y={topo} width={22} height={base - topo} fill="#6B6F78" />
    <rect x={x - 50} y={topo + 40} width={122} height={12} fill="#55595F" />
    <rect
      x={x - 4}
      y={topo + 120}
      width={30}
      height={40}
      rx={4}
      fill="#4A4E55"
    />
  </g>
);

// Faixa de sobrados repetida (largura 1600) pra rolar sem emenda.
const RuaFundo: React.FC<{ base: number; cores: string[] }> = ({
  base,
  cores,
}) => (
  <g>
    {[
      [0, 300, 420, 0],
      [300, 260, 340, 1],
      [560, 360, 460, 2],
      [920, 280, 380, 0],
      [1200, 400, 430, 1],
    ].map(([x, l, a, c], i) => (
      <Sobrado
        key={i}
        x={x}
        base={base}
        l={l}
        a={a}
        cor={cores[c]}
        acesa={-1}
        caixa={i % 2 === 0}
      />
    ))}
    <PlacaLoja x={150} y={base - 150} texto="PADARIA" cor="#B5651D" />
    <PlacaLoja x={740} y={base - 160} texto="ADEGA 24H" cor="#2E6B4F" e={0.9} />
    <PlacaLoja x={1400} y={base - 150} texto="SALÃO DA RÔ" cor="#C05070" e={0.9} />
    <Picho x={330} y={base - 40} cor="#2A2A30" />
    <Picho x={1000} y={base - 50} cor="#7A2E3A" e={0.8} />
    <Arvore x={520} y={base} e={0.9} />
    <Arvore x={1150} y={base} e={0.8} cor="#3E7A4E" />
    <Orelhao x={880} y={base} e={0.8} />
    <CarroParado x={260} y={base + 10} e={0.8} cor="#7A2E3A" />
    <CarroParado x={1450} y={base + 10} e={0.8} cor="#E6B83A" />
  </g>
);

// ---------- o busão por fora (lateral) ----------
const BusaoLateral: React.FC<{ t: number }> = ({ t }) => {
  const roda = t * 1400;
  return (
    <g>
      {/* janelas com reflexo do céu */}
      <rect x={-40} y={700} width={1160} height={360} rx={18} fill="#ECECEC" />
      {[0, 1, 2].map((k) => (
        <g key={k}>
          <rect
            x={-10 + k * 380}
            y={730}
            width={340}
            height={300}
            rx={14}
            fill="#1F3550"
          />
          <path
            d={`M ${-10 + k * 380 + mod(-t * 900 + k * 120, 600) - 200} 730 l 120 0 l -160 300 l -120 0 Z`}
            fill="#fff"
            opacity={0.12}
          />
          <rect
            x={-10 + k * 380}
            y={730}
            width={340}
            height={300}
            rx={14}
            fill="none"
            stroke="#2A2A30"
            strokeWidth={10}
          />
        </g>
      ))}
      {/* letreiro lateral */}
      <rect x={780} y={980} width={220} height={40} rx={4} fill="#111" />
      <text
        x={890}
        y={1009}
        textAnchor="middle"
        fontFamily={FONTE}
        fontWeight={800}
        fontSize={26}
        fill="#FFB020"
      >
        3170 · JD. AURORA
      </text>
      {/* lataria */}
      <rect x={-40} y={1050} width={1160} height={400} fill="#F2F2EE" />
      <rect x={-40} y={1170} width={1160} height={56} fill="#C8322B" />
      <rect x={-40} y={1236} width={1160} height={14} fill="#E6A03A" />
      <rect x={-40} y={1420} width={1160} height={70} fill="#5C6068" />
      {/* parafusos e emendas da chapa (ferro de verdade) */}
      {[160, 540, 920].map((sx) => (
        <line
          key={sx}
          x1={sx}
          y1={1050}
          x2={sx}
          y2={1420}
          stroke="#D2D2CC"
          strokeWidth={4}
        />
      ))}
      {/* propaganda lateral e número do carro */}
      <rect x={60} y={1260} width={420} height={130} rx={12} fill="#2F5DA8" />
      <text x={270} y={1318} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={40} fill="#fff">CURSO DE INFORMÁTICA</text>
      <text x={270} y={1362} textAnchor="middle" fontFamily={FONTE} fontWeight={700} fontSize={30} fill="#F2C230">MATRÍCULAS ABERTAS</text>
      <text x={600} y={1110} fontFamily={FONTE} fontWeight={800} fontSize={44} fill="#2A2A30">4 3170</text>
      <rect x={560} y={1290} width={60} height={40} rx={6} fill="#E6A03A" />
      {/* roda */}
      <path d="M 640 1490 A 170 170 0 0 1 980 1490 Z" fill="#2A2A30" />
      <g transform={`translate(810 1500) rotate(${roda})`}>
        <circle r={130} fill="#1A1A1E" />
        <circle r={70} fill="#9EA3AB" />
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <circle
            key={a}
            cx={45 * Math.cos((a * Math.PI) / 180)}
            cy={45 * Math.sin((a * Math.PI) / 180)}
            r={9}
            fill="#5C6068"
          />
        ))}
      </g>
    </g>
  );
};

// Cena 1 (gancho) e 9 (aí deu ruim): Bruno grudado de lado no busão andando.
// `calma` (0–1): ele respira, fecha o olho e o brilho apaga (cena 10). `fixo` = um plano só.
export const CenaBusaoLado: React.FC<{
  t: number;
  calma?: number;
  fixo?: 0 | 1;
  bocaCalma?: Boca;
  cortes?: number[];
}> = ({ t, calma = 0, fixo, bocaCalma, cortes = [1.6, 3.0] }) => {
  const p = fixo ?? plano(t, cortes) % 2;
  const pula = Math.sin(t * 19) * 5;
  const zoom = p === 1 ? 1.9 + t * 0.03 : 1.04 + t * 0.02;
  const origem = p === 1 ? "26.5% 67%" : "50% 55%"; // no close a cabeça fica acima da legenda
  const desliza = mod(-t * 1300, 1600);
  return (
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(180deg,#8FC3E8 0%,#F3C9A0 70%,#F2B68A 100%)",
      }}
    >
      <AbsoluteFill
        style={{ transform: `scale(${zoom})`, transformOrigin: origem }}
      >
        <Camada blur={7}>
          <svg width={1080} height={1920}>
            <g transform={`translate(${desliza - 1600} 0)`}>
              <RuaFundo base={1420} cores={["#B6876A", "#D9B48C", "#9C7FA0"]} />
              <g transform="translate(1600 0)">
                <RuaFundo
                  base={1420}
                  cores={["#B6876A", "#D9B48C", "#9C7FA0"]}
                />
              </g>
            </g>
          </svg>
        </Camada>
        <Camada blur={3}>
          <svg width={1080} height={1920}>
            {[0, 800].map((k) => (
              <Poste
                key={k}
                x={mod(-t * 2200 + k, 1600) - 200}
                topo={380}
                base={1500}
              />
            ))}
            <path
              d={`M -100 470 Q 540 540 1180 470`}
              stroke="#2A2A30"
              strokeWidth={4}
              fill="none"
            />
          </svg>
        </Camada>
        {/* asfalto com faixas passando */}
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <rect x={0} y={1490} width={1080} height={430} fill="#4A4C55" />
          <rect x={0} y={1880} width={1080} height={40} fill="#9C9690" />
          <Bueiro x={mod(-t * 3200 + 300, 1800) - 300} y={1870} />
          {[0, 1].map((k) => (
            <rect key={`m${k}`} x={mod(-t * 3200 + k * 900, 1800) - 300} y={1640} width={90} height={12} rx={4} fill="#3A3C44" opacity={0.6} />
          ))}
          {[0, 1, 2].map((k) => (
            <rect
              key={k}
              x={mod(-t * 3200 + k * 600, 1800) - 300}
              y={1780}
              width={260}
              height={18}
              fill="#E8E2C8"
              opacity={0.8}
            />
          ))}
        </svg>
        <svg
          width={1080}
          height={1920}
          style={{ position: "absolute", transform: `translateY(${pula}px)` }}
        >
          <BusaoLateral t={t} />
          <Bruno
            x={420}
            y={1430}
            escala={0.78}
            roupa="escola"
            mochila
            vento={1}
            t={t}
            pose={{
              bracoE: 128 - calma * 50 + Math.sin(t * 7) * 6,
              bracoD: 128 - calma * 50 + Math.cos(t * 6) * 6,
              antebracoE: 20,
              antebracoD: 20,
              pernaE: 16,
              pernaD: -16,
              cabeca: Math.sin(t * 9) * 3,
            }}
            olhos={calma > 0.3 ? "fechado" : "espanto"}
            boca={
              calma > 0.3
                ? (bocaCalma ?? "neutra")
                : Math.floor(t / 0.12) % 2
                  ? "aberta"
                  : "o"
            }
            brilho={0.7 * (1 - calma)}
          />
        </svg>
        {/* riscos de vento */}
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          {new Array(9).fill(0).map((_, i) => (
            <rect
              key={i}
              x={mod(-t * 4000 + i * 377, 1500) - 300}
              y={300 + ((i * 211) % 1300)}
              width={180 + (i % 3) * 80}
              height={4}
              rx={2}
              fill="#fff"
              opacity={0.45}
            />
          ))}
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- o busão por dentro (corte de lado) ----------
const Chave: React.FC<{ x: number; y: number; a: number }> = ({ x, y, a }) => (
  <g transform={`translate(${x} ${y}) rotate(${a})`}>
    <circle r={16} fill="none" stroke="#C9A43A" strokeWidth={7} />
    <rect x={12} y={-5} width={38} height={10} rx={3} fill="#C9A43A" />
    <rect x={38} y={4} width={6} height={10} fill="#C9A43A" />
  </g>
);

const Sombrinha: React.FC<{ x: number; y: number; a: number }> = ({
  x,
  y,
  a,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${a})`}>
    <path d="M 0 0 L 150 -14 L 150 14 Z" fill="#7A3E9C" />
    <rect x={150} y={-3} width={40} height={6} fill="#9AA" />
    <path
      d="M 0 0 q -16 0 -16 18"
      stroke="#3A2A1A"
      strokeWidth={7}
      fill="none"
      strokeLinecap="round"
    />
  </g>
);

const Banco: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g>
    <rect x={x} y={y - 250} width={190} height={190} rx={22} fill="#2F5DA8" />
    <rect x={x - 8} y={y - 80} width={206} height={40} rx={12} fill="#264E8E" />
    <rect x={x + 85} y={y - 40} width={20} height={40} fill="#666B73" />
  </g>
);

const Catraca: React.FC<{ x: number; y: number; gira: number }> = ({
  x,
  y,
  gira,
}) => (
  <g>
    <rect
      x={x - 60}
      y={y - 300}
      width={120}
      height={300}
      rx={10}
      fill="#8C9099"
    />
    <rect
      x={x - 50}
      y={y - 290}
      width={100}
      height={60}
      rx={6}
      fill="#1A1A1E"
    />
    <text
      x={x}
      y={y - 252}
      textAnchor="middle"
      fontFamily={FONTE}
      fontWeight={800}
      fontSize={28}
      fill="#5BE08A"
    >
      R$ 5,00
    </text>
    <g transform={`translate(${x + 60} ${y - 170}) rotate(${gira})`}>
      {[0, 120, 240].map((a) => (
        <rect
          key={a}
          x={0}
          y={-8}
          width={150}
          height={16}
          rx={8}
          fill="#B8BCC4"
          transform={`rotate(${a})`}
        />
      ))}
      <circle r={20} fill="#6B6F78" />
    </g>
  </g>
);

// Cena 8: dentro do busão. Chaves voando pro Bruno, a sombrinha da Dona Cida indo atrás
// e, no fundo, o Olheiro com o apito torto apontando pra ele.
export const CenaBusaoDentro: React.FC<{
  t: number;
  corte1?: number;
  corte2?: number;
  fala?: [number, number][];
  falaCida?: [number, number][];
}> = ({ t, corte1 = 3.2, corte2 = 6.6, fala, falaCida = [[3.4, 5.8]] }) => {
  const p = plano(t, [corte1, corte2]);
  const zoom = [
    1.02 + t * 0.012,
    1.7 + (t - corte1) * 0.02,
    2.1 + (t - corte2) * 0.03,
  ][p];
  const origem = ["50% 55%", "0px 1881px", "82% 72%"][p];
  const balanca = Math.sin(t * 2.4) * 4;
  const puxa = interpolate(t, [0.6, 2.2], [0, 1], {
    ...clamp,
    easing: (x) => x * x,
  });
  const sombra = interpolate(t, [corte1 + 0.2, corte1 + 2.4], [0, 1], {
    ...clamp,
    easing: (x) => x * x * x,
  });
  const verde =
    (t > corte2 + 0.8 && t < corte2 + 0.87) ||
    (t > corte2 + 1.0 && t < corte2 + 1.07)
      ? 1
      : 0;
  const fecha = (j: [number, number][] | undefined, f: Boca): Boca =>
    j?.some(([a, b]) => t >= a && t <= b)
      ? Math.floor(t / 0.1) % 2
        ? "aberta"
        : "o"
      : f;
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background: "#D9D3C5",
          transform: `scale(${zoom}) rotate(${balanca * 0.15}deg)`,
          transformOrigin: origem,
        }}
      >
        {/* cidade passando pelas janelas */}
        <Camada blur={8}>
          <svg width={1080} height={1920}>
            <rect x={0} y={560} width={1080} height={460} fill="#9CC6E6" />
            <g transform={`translate(${mod(-t * 700, 1600) - 1600} 0)`}>
              <RuaFundo base={1040} cores={["#C49A7A", "#E0BE96", "#A88BB0"]} />
              <g transform="translate(1600 0)">
                <RuaFundo
                  base={1040}
                  cores={["#C49A7A", "#E0BE96", "#A88BB0"]}
                />
              </g>
            </g>
          </svg>
        </Camada>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          {/* parede interna recortando as janelas */}
          <path
            d="M 0 0 H 1080 V 560 H 0 Z M 0 1020 H 1080 V 1920 H 0 Z"
            fill="#D9D3C5"
          />
          {[330, 700].map((x) => (
            <rect
              key={x}
              x={x}
              y={560}
              width={50}
              height={460}
              fill="#C9C2B2"
            />
          ))}
          <rect x={0} y={1016} width={1080} height={20} fill="#B9B1A0" />
          {/* teto, painel e barra com alças */}
          <rect x={0} y={0} width={1080} height={300} fill="#CFC8B8" />
          <rect x={250} y={170} width={580} height={80} rx={10} fill="#111" />
          <text
            x={540}
            y={224}
            textAnchor="middle"
            fontFamily={FONTE}
            fontWeight={800}
            fontSize={36}
            fill="#FFB020"
            letterSpacing={2}
          >
            PRÓX. PONTO: E.E. JD. AURORA
          </text>
          <rect x={0} y={380} width={1080} height={22} rx={11} fill="#F2C230" />
          {[120, 300, 480, 660, 840, 1000].map((x, i) => (
            <g
              key={x}
              transform={`rotate(${Math.sin(t * 2.4 + i) * 8} ${x} 400)`}
            >
              <rect x={x - 4} y={400} width={8} height={80} fill="#333" />
              <path
                d={`M ${x - 26} 480 h 52 l -10 50 h -32 Z`}
                fill="none"
                stroke="#333"
                strokeWidth={10}
              />
            </g>
          ))}
          {/* balaústres amarelos e piso */}
          {[140, 560, 960].map((x) => (
            <rect
              key={x}
              x={x}
              y={400}
              width={22}
              height={1260}
              fill="#F2C230"
            />
          ))}
          <rect x={0} y={1650} width={1080} height={270} fill="#55585F" />
          {new Array(12).fill(0).map((_, i) => (
            <rect
              key={i}
              x={i * 96}
              y={1650}
              width={6}
              height={270}
              fill="#4A4D54"
            />
          ))}
          <Banco x={20} y={1650} />
          <Banco x={790} y={1650} />
          <Catraca x={430} y={1650} gira={-puxa * 30} />
          <Adesivo x={115} y={1110} texto="ASSENTO PREFERENCIAL" cor="#2F5DA8" e={0.75} />
          <Adesivo x={885} y={1110} texto="PROIBIDO FUMAR" cor="#C8322B" e={0.75} />
          <Extintor x={300} y={1600} e={0.8} />
          {[150, 970].map((x) => (
            <g key={x}>
              <rect x={x - 26} y={1000} width={74} height={40} rx={8} fill="#C8322B" />
              <text x={x + 11} y={1029} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={26} fill="#fff">PARE</text>
            </g>
          ))}
          <rect x={430} y={560} width={260} height={130} rx={8} fill="#F4ECDD" />
          <text x={560} y={612} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={28} fill={COR.tinta}>VALE-TRANSPORTE</text>
          <text x={560} y={652} textAnchor="middle" fontFamily={FONTE} fontWeight={700} fontSize={24} fill="#666">PASSE NA CATRACA</text>
          <Mochila x={1000} y={1650} e={0.6} cor="#2E6B4F" />
        </svg>
        {/* gente */}
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Cida
            x={115}
            y={1590}
            escala={0.55}
            sentada
            olhos={sombra > 0.1 ? "espanto" : "normal"}
            boca={fecha(falaCida, "neutra")}
          />
          {/* easter egg: o Jonas (ep. 1), do tamanho de uma caneta, espiando da bolsa da mãe */}
          <Jonas
            x={248}
            y={1605}
            escala={0.14}
            pose={{ bracoD: 150 + Math.sin(t * 9) * 20, antebracoD: 20 }}
            olhos={sombra > 0.1 ? "espanto" : "normal"}
            boca="sorriso"
          />
          <g transform="translate(240 1650)">
            <path
              d="M -40 -70 Q 0 -120 40 -70"
              stroke="#7A3E2A"
              strokeWidth={6}
              fill="none"
            />
            <rect
              x={-60}
              y={-72}
              width={120}
              height={72}
              rx={14}
              fill="#9C4E32"
            />
            <rect
              x={-60}
              y={-72}
              width={120}
              height={14}
              rx={6}
              fill="#7A3E2A"
            />
          </g>
          <Olheiro
            x={885}
            y={1600}
            escala={0.5}
            olhosVerdes={verde}
            apito={
              interpolate(t, [0.4, 1.4], [0, 38], clamp) + Math.sin(t * 5) * 3
            }
          />
          <Bruno
            x={690}
            y={1650}
            escala={0.62}
            roupa="escola"
            mochila
            pose={{
              bracoE: 60 + puxa * 40,
              bracoD: 40,
              antebracoE: -40,
              antebracoD: -60,
              tronco: -6 * puxa,
            }}
            olhos={puxa > 0.5 ? "espanto" : "normal"}
            boca={fecha(fala, "o")}
            brilho={0.5}
          />
          {/* chaves da galera voando até ele */}
          {[
            [80, 1400, 650, 1340],
            [980, 1350, 730, 1300],
            [300, 900, 680, 1250],
            [860, 1000, 740, 1380],
          ].map(([x0, y0, x1, y1], i) => {
            const k = interpolate(t, [0.4 + i * 0.25, 1.1 + i * 0.25], [0, 1], {
              ...clamp,
              easing: (x) => x * x * x,
            });
            return (
              <Chave
                key={i}
                x={x0 + (x1 - x0) * k}
                y={y0 + (y1 - y0) * k - Math.sin(k * Math.PI) * 120}
                a={k * 540 + i * 40}
              />
            );
          })}
          <Sombrinha
            x={interpolate(sombra, [0, 1], [320, 650])}
            y={1630 - Math.sin(sombra * Math.PI) * 40}
            a={sombra * -20}
          />
        </svg>
        <Facho x={700} largura={500} angulo={-18} forca={0.25} />
        <Poeira semente="bus" n={22} />
      </AbsoluteFill>
      <Placa
        s={t}
        de={corte1 + 0.1}
        ate={corte1 + 3.2}
        nome="DONA CIDA, 52"
        desc="MÃE DO JONAS"
        x={600}
        y={420}
      />
    </AbsoluteFill>
  );
};

// ---------- a quadra da escola ----------
const Trave: React.FC<{ x: number; y: number; e: number }> = ({ x, y, e }) => (
  <g transform={`translate(${x} ${y}) scale(${e})`}>
    {/* rede */}
    {new Array(13).fill(0).map((_, i) => (
      <line
        key={`v${i}`}
        x1={-300 + i * 50}
        y1={-400}
        x2={-260 + i * 44}
        y2={-40}
        stroke="#EDEDED"
        strokeWidth={2}
        opacity={0.5}
      />
    ))}
    {new Array(8).fill(0).map((_, i) => (
      <line
        key={`h${i}`}
        x1={-300}
        y1={-400 + i * 50}
        x2={300}
        y2={-400 + i * 50}
        stroke="#EDEDED"
        strokeWidth={2}
        opacity={0.5}
      />
    ))}
    {/* trave pintada de branco, descascando: aparece o ferro enferrujado */}
    <rect x={-320} y={-420} width={28} height={420} fill="#F2F2F2" />
    <rect x={292} y={-420} width={28} height={420} fill="#F2F2F2" />
    <rect x={-320} y={-420} width={640} height={28} fill="#F2F2F2" />
    {[
      [-316, -300, 20, 60],
      [-312, -120, 16, 40],
      [296, -380, 18, 50],
      [298, -200, 20, 70],
      [-160, -416, 70, 18],
      [80, -414, 50, 16],
    ].map(([rx, ry, w, h], i) => (
      <rect key={i} x={rx} y={ry} width={w} height={h} rx={6} fill="#8A4B2A" />
    ))}
    {[-320, 292].map((bx) => (
      <rect
        key={bx}
        x={bx}
        y={-420}
        width={28}
        height={420}
        fill="none"
        stroke="#C9C9C9"
        strokeWidth={3}
      />
    ))}
  </g>
);

// Cena 12: "a trave do gol é de ferro". Pela grade da escola, zoom no gol descascado.
export const CenaQuadra: React.FC<{ t: number; corte?: number }> = ({
  t,
  corte = 2.6,
}) => {
  const p = plano(t, [corte]);
  const zoom = p === 0 ? 1 + t * 0.03 : 2.4 + (t - corte) * 0.05;
  const faisca = interpolate(
    t,
    [corte + 0.8, corte + 1.0, corte + 1.6],
    [0, 1, 0],
    clamp,
  );
  return (
    <AbsoluteFill
      style={{ background: "linear-gradient(180deg,#9CC6E6 0%,#F3D2AE 60%)" }}
    >
      <AbsoluteFill
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: p === 0 ? "50% 50%" : "29% 47%",
        }}
      >
        <Camada blur={6}>
          <svg width={1080} height={1920}>
            <rect x={0} y={420} width={1080} height={520} fill="#E6DCC8" />
            {new Array(9).fill(0).map((_, i) => (
              <rect
                key={i}
                x={40 + i * 118}
                y={510}
                width={80}
                height={90}
                rx={4}
                fill="#5C7EA6"
              />
            ))}
            <rect x={0} y={430} width={1080} height={50} fill="#2F5DA8" />
            <text
              x={540}
              y={466}
              textAnchor="middle"
              fontFamily={FONTE}
              fontWeight={800}
              fontSize={34}
              fill="#fff"
              letterSpacing={3}
            >
              E.E. JARDIM AURORA
            </text>
          </svg>
        </Camada>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          {/* arquibancada de concreto */}
          {[0, 1, 2, 3].map((i) => (
            <rect
              key={i}
              x={0}
              y={820 + i * 50}
              width={1080}
              height={50}
              fill={i % 2 ? "#B9B3A6" : "#C9C3B6"}
            />
          ))}
          <rect
            x={250}
            y={640}
            width={580}
            height={70}
            rx={6}
            fill={COR.creme}
          />
          <text
            x={540}
            y={688}
            textAnchor="middle"
            fontFamily={FONTE}
            fontWeight={800}
            fontSize={34}
            fill={COR.tinta}
          >
            FINAL DO INTERCLASSE · 3º B x 3º A · 15H
          </text>
          {/* piso da quadra */}
          <path d="M 0 1020 H 1080 V 1920 H 0 Z" fill="#3E8E6E" />
          <path d="M 120 1020 H 960 L 1180 1920 H -100 Z" fill="#2F7A9C" />
          <path
            d="M 120 1020 H 960 L 1180 1920 H -100 Z"
            fill="none"
            stroke="#fff"
            strokeWidth={8}
          />
          <path
            d="M 330 1020 L 300 1260 L 780 1260 L 750 1020"
            fill="none"
            stroke="#fff"
            strokeWidth={7}
          />
          <Trave x={540} y={1060} e={0.75} />
          <Mochila x={90} y={870} e={0.45} cor="#C0392B" />
          <Mochila x={190} y={920} e={0.45} cor="#2F5DA8" />
          <Garrafa x={880} y={870} e={0.8} />
          <Garrafa x={920} y={870} e={0.8} cor="#E6862E" />
          <Mochila x={990} y={970} e={0.45} cor="#2E6B4F" />
          <Bebedouro x={1010} y={1020} e={0.7} />
          <Lixeira x={60} y={1020} e={0.8} />
          {[200, 360, 720, 880].map((x, i) => (
            <Cone key={x} x={x + (i > 1 ? 40 : -40)} y={1500 + (i % 2) * 120} e={0.8} />
          ))}
          <Bola x={640} y={1400} e={1.1} />
          {faisca > 0 && (
            <circle
              cx={317}
              cy={830}
              r={60 * faisca}
              fill={COR.aurora}
              opacity={faisca}
              style={{ filter: "blur(8px)" }}
            />
          )}
        </svg>
      </AbsoluteFill>
      {/* alambrado na frente (fora do zoom, como se a câmera estivesse atrás da grade) */}
      <svg
        width={1080}
        height={1920}
        style={{ position: "absolute", opacity: p === 0 ? 0.55 : 0 }}
      >
        <defs>
          <pattern
            id="alambrado"
            width={70}
            height={70}
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <rect
              width={70}
              height={70}
              fill="none"
              stroke="#2A2A30"
              strokeWidth={5}
            />
          </pattern>
        </defs>
        <rect width={1080} height={1920} fill="url(#alambrado)" />
      </svg>
      {p === 0 && (
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          {/* Bruno de costas, segurando a grade */}
          <circle cx={300} cy={1560} r={150} fill={COR.cabelo} />
          <rect
            x={120}
            y={1680}
            width={360}
            height={300}
            rx={90}
            fill="#F4F4F0"
          />
          <rect
            x={150}
            y={1700}
            width={70}
            height={240}
            rx={26}
            fill="#C0392B"
          />
          <rect
            x={380}
            y={1700}
            width={70}
            height={240}
            rx={26}
            fill="#C0392B"
          />
        </svg>
      )}
    </AbsoluteFill>
  );
};

// Folha do personagem pra aprovação: as três roupas lado a lado.
export const CenaElencoBruno: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill
    style={{
      background:
        "radial-gradient(ellipse at 50% 40%, #3F2D57 0%, #1A1640 80%)",
    }}
  >
    <svg width={1080} height={1920} style={{ position: "absolute" }}>
      {(["casa", "escola", "goleiro"] as const).map((r, i) => (
        <g key={r}>
          <Bruno
            x={190 + i * 350}
            y={1300}
            escala={0.82}
            roupa={r}
            mochila={r === "escola"}
            boca={i === 2 ? "sorriso" : "neutra"}
            piscar={t % 3 > 2.85}
            pose={
              i === 2
                ? { bracoE: 40, bracoD: 40, antebracoE: -60, antebracoD: -60 }
                : {}
            }
          />
          <text
            x={190 + i * 350}
            y={1400}
            textAnchor="middle"
            fontFamily={FONTE}
            fontWeight={800}
            fontSize={40}
            fill={COR.creme}
          >
            {r.toUpperCase()}
          </text>
        </g>
      ))}
    </svg>
    <div
      style={{
        position: "absolute",
        top: 300,
        width: 1080,
        textAlign: "center",
        fontFamily: FONTE,
        fontWeight: 800,
        fontSize: 80,
        color: COR.creme,
      }}
    >
      BRUNO, 17 · <span style={{ color: COR.amarelo }}>GOLEIRO DO 3º B</span>
    </div>
  </AbsoluteFill>
);
