import { AbsoluteFill } from "remotion";
import { Boneco, Caixa, Chao, crianca, Fosco, LUCAS, MAE, MEDICA, Palco } from "./boneco";
import { Banheiro, CamPlanos, Consultorio, Parque, Quadro } from "./cenarios";
import { Anticorpo, Defesa, Estreptococo, Glomerulo, Grumo, Hemacia, Pedaco } from "./corpo";
import { entre, lerp, naFala, pop, suave, type V3 } from "./tempo";
import { Balao, Icone, Selo } from "./ui";

export type PropsCena = { t: number; dur: number; s: number };

// boca mexendo enquanto fala (determinístico)
const falando = (t: number, de: number, ate: number) => (t > de && t < ate ? Math.abs(Math.sin(t * 17)) * 0.8 : 0);

// 1 — "O Lucas tem sete anos... e hoje o xixi dele saiu cor de refrigerante de cola."
export const Cena1: React.FC<PropsCena> = ({ t, dur }) => {
  const xixi = naFala(0, "xixi");
  const cola = naFala(0, "cola");
  const cheio = entre(t, xixi - 0.2, xixi + 0.9);
  return (
    <AbsoluteFill>
      <Palco fundo="#e8f6f1">
        <CamPlanos
          t={t}
          dur={dur}
          planos={[
            { t: 0, de: [1.8, 1.7, 4.6], para: [1.0, 1.35, 3.4], alvo: [-0.2, 0.8, -0.5] },
            { t: xixi - 0.1, de: [0.9, 1.25, 0.25], para: [0.78, 1.12, -0.25], alvo: [0.75, 1.0, -1.15], fov: 30 },
          ]}
        />
        <Banheiro cheio={cheio} />
        <Boneco v={LUCAS} pos={[-0.25, 0, -0.3]} giro={0.45} escala={0.78} t={t} rosto={t > xixi ? "espanto" : "feliz"} cabeca={[t > xixi ? 0.25 : 0, 0.35]} />
      </Palco>
      <Icone t={t} de={cola - 0.1} tipo="aviso" x={760} y={640} tam={190} />
      <Selo t={t} de={0.15} ate={xixi - 0.1} texto="LUCAS, 7 ANOS" y={260} />
    </AbsoluteFill>
  );
};

// 2 — pronto-socorro: olho inchado, tornozelo inchado, pressão 135 x 90
export const Cena2: React.FC<PropsCena> = ({ t, dur, s }) => {
  const olho = naFala(1, "olho");
  const torn = naFala(1, "tornozelo");
  const pressao = naFala(1, "pressão");
  const alta = naFala(1, "alta");
  const inchaOlho = entre(t, olho - 0.1, olho + 0.6);
  const inchaPe = entre(t, torn - 0.1, torn + 0.6);
  return (
    <AbsoluteFill>
      <Palco>
        <CamPlanos
          t={t}
          dur={dur}
          planos={[
            { t: 0, de: [0.2, 2.6, 7.2], para: [0.3, 2.2, 5.8], alvo: [0.2, 1.0, -0.6] },
            { t: olho - 0.15, de: [0.55, 1.15, 1.35], para: [0.5, 1.12, 1.05], alvo: [0.35, 1.05, -0.1], fov: 30 },
            { t: torn - 0.15, de: [1.7, 0.6, 2.1], para: [1.4, 0.5, 1.7], alvo: [0.35, 0.25, -0.1], fov: 32 },
            { t: pressao - 0.15, de: [-0.6, 1.9, 3.6], para: [-0.2, 1.8, 3.0], alvo: [0.7, 1.2, -0.8] },
          ]}
        />
        <Consultorio s={s} pressao={t > pressao ? 1 : 0} />
        <Boneco v={MEDICA} pos={[-0.9, 0, -0.4]} giro={0.5} t={t} rosto="serio" cabeca={[0.1, 0.4]} />
        <Boneco v={MAE} pos={[1.6, 0, -0.2]} giro={-0.5} t={t} rosto="triste" />
        <Boneco v={LUCAS} pos={[0.35, 0, -0.1]} escala={0.72} t={t} rosto="triste" olhoInchado={inchaOlho} />
        {/* tornozelos inchados */}
        {[-1, 1].map((l) => (
          <mesh key={l} position={[0.35 + l * 0.09, 0.1, -0.04]} scale={inchaPe * 1.5 + 0.01}>
            <sphereGeometry args={[0.085, 16, 12]} />
            <Fosco cor="#ecbfa0" />
          </mesh>
        ))}
      </Palco>
      <Icone t={t} de={olho} ate={torn - 0.15} tipo="aviso" x={760} y={560} tam={150} />
      <Icone t={t} de={torn} ate={pressao - 0.15} tipo="aviso" x={300} y={760} tam={150} />
      <Selo t={t} de={pressao + 0.1} texto="135 x 90" cor="vermelho" y={230} tam={84} sub={t > alta - 0.1 ? "PRESSÃO ALTA" : undefined} />
    </AbsoluteFill>
  );
};

// 3 — a pergunta certa: dor de garganta? Teve, doze dias atrás (lembrança em sépia)
export const Cena3: React.FC<PropsCena> = ({ t, dur, s }) => {
  const perg = naFala(2, "pergunta");
  const teve = naFala(2, "teve", 1);
  const doze = naFala(2, "doze");
  const lembra = t > doze - 0.15;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ filter: lembra ? "sepia(0.55) saturate(1.1) brightness(1.04)" : undefined }}>
        <Palco fundo={lembra ? "#f3e3c3" : "#dff1f7"}>
          {!lembra ? (
            <>
              <CamPlanos
                t={t}
                dur={dur}
                planos={[
                  { t: 0, de: [0.1, 1.6, 3.2], para: [-0.1, 1.55, 2.7], alvo: [-0.8, 1.15, -0.4], fov: 32 },
                  { t: teve - 0.15, de: [0.8, 1.6, 3.0], para: [1.0, 1.55, 2.6], alvo: [1.5, 1.15, -0.2], fov: 32 },
                ]}
              />
              <Consultorio s={s} pressao={1} />
              <Boneco v={MEDICA} pos={[-0.9, 0, -0.4]} giro={0.5} t={t} rosto="feliz" fala={falando(t, 0, teve - 0.2)} cabeca={[0, 0.3]} />
              <Boneco v={MAE} pos={[1.6, 0, -0.2]} giro={-0.5} t={t} rosto={t > teve ? "espanto" : "triste"} fala={falando(t, teve, doze)} cabeca={[Math.sin(t * 8) * (t > teve ? 0.12 : 0), 0]} />
              <Boneco v={LUCAS} pos={[0.35, 0, -0.1]} escala={0.72} t={t} rosto="triste" olhoInchado={1} />
            </>
          ) : (
            <>
              <CamPlanos t={t - doze} dur={dur - doze} planos={[{ t: 0, de: [0.4, 2.2, 3.2], para: [0.2, 1.7, 2.3], alvo: [0, 0.6, 0] }]} />
              <Chao cor="#c9a27a" />
              <Caixa tam={[10, 5, 0.2]} pos={[0, 2.5, -1.6]} cor="#f6d7a8" sombra={false} />
              {/* cama */}
              <Caixa tam={[1.2, 0.45, 2.1]} pos={[0, 0.22, 0]} cor="#7fc6e8" />
              <Caixa tam={[1.2, 0.12, 2.1]} pos={[0, 0.5, 0]} cor="#ffffff" />
              <Caixa tam={[1.22, 0.16, 1.2]} pos={[0, 0.6, 0.45]} cor="#ff8a80" />
              <group position={[0, 0.62, -0.55]} rotation={[-1.2, 0, 0]}>
                <Boneco v={LUCAS} escala={0.72} t={t} rosto="triste" />
              </group>
              {/* garganta vermelha + termômetro */}
              <mesh position={[0, 0.98, -0.5]} rotation={[-0.3, 0, 0]}>
                <torusGeometry args={[0.16, 0.05, 10, 24]} />
                <Fosco cor="#e8463f" />
              </mesh>
              <mesh position={[0.12, 1.18, -0.3]} rotation={[0.4, 0, -0.9]}>
                <capsuleGeometry args={[0.02, 0.25, 4, 8]} />
                <Fosco cor="#ffffff" />
              </mesh>
            </>
          )}
        </Palco>
      </AbsoluteFill>
      <Balao t={t} de={perg - 0.1} ate={teve - 0.1} texto="Dor de garganta?" x={420} y={520} />
      <Selo t={t} de={doze} texto="12 DIAS ATRÁS" y={230} tam={76} />
      <Icone t={t} de={doze + 0.35} tipo="aviso" x={800} y={700} tam={140} />
    </AbsoluteFill>
  );
};

// fundo rosado "dentro da garganta": túnel com anéis
const Tunel: React.FC<{ t: number }> = ({ t }) => (
  <group>
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -10]}>
      <cylinderGeometry args={[3, 3, 40, 40, 1, true]} />
      <meshStandardMaterial color="#f08aa0" side={1} roughness={0.9} />
    </mesh>
    {Array.from({ length: 14 }, (_, i) => (
      <mesh key={i} position={[0, 0, 4 - i * 2.4]}>
        <torusGeometry args={[2.92, 0.16, 10, 40]} />
        <meshStandardMaterial color="#e06f88" roughness={0.9} />
      </mesh>
    ))}
    <pointLight position={[0, 1, 2 - t]} intensity={6} distance={12} color="#ffe6ea" />
  </group>
);

// 4 — "O culpado é o estreptococo do grupo A."
export const Cena4: React.FC<PropsCena> = ({ t, dur }) => {
  const est = naFala(3, "estreptococo");
  return (
    <AbsoluteFill>
      <Palco fundo="#f08aa0">
        <CamPlanos t={t} dur={dur} planos={[{ t: 0, de: [0, 0, 6], para: [0.4, 0.2, 2.4], alvo: [0, 0, -4], alvoFim: [0.3, 0, -4] }]} />
        <Tunel t={t} />
        <Estreptococo pos={[0, 0.2, -1]} t={t} escala={1.3 * pop(t, 0.05)} rot={0.15} />
        <Estreptococo pos={[-1.4, 1.2, -3]} t={t + 1} rot={-0.5} escala={pop(t, 0.25)} />
        <Estreptococo pos={[1.5, -1.1, -3.5]} t={t + 2} rot={0.6} escala={pop(t, 0.4)} />
        <Estreptococo pos={[1.2, 1.4, -6]} t={t + 3} rot={-0.2} escala={pop(t, 0.5)} />
      </Palco>
      <Selo t={t} de={est - 0.05} texto="ESTREPTOCOCO" sub="DO GRUPO A" y={240} tam={78} />
    </AbsoluteFill>
  );
};

// 5 — a garganta sarou, mas os anticorpos grudam nos pedaços e os grumos entalam no glomérulo
export const Cena5: React.FC<PropsCena> = ({ t, dur }) => {
  const ac = naFala(4, "anticorpos");
  const grumos = naFala(4, "grumos");
  const filtro = naFala(4, "filtro");
  const glom = naFala(4, "glomérulo");
  const parte = t < ac - 0.15 ? 0 : t < filtro - 0.15 ? 1 : 2;
  if (parte === 0)
    return (
      <AbsoluteFill>
        <Palco>
          <CamPlanos t={t} dur={ac} planos={[{ t: 0, de: [0, 1.3, 3.0], para: [0, 1.2, 2.4], alvo: [0, 0.9, 0] }]} />
          <Chao cor="#e8f6f1" />
          <Caixa tam={[10, 5, 0.2]} pos={[0, 2.5, -1.5]} cor="#cfe7f0" sombra={false} />
          <Boneco v={LUCAS} escala={0.85} t={t} rosto="feliz" acena />
        </Palco>
        <Icone t={t} de={0.25} tipo="certo" x={760} y={520} tam={170} />
      </AbsoluteFill>
    );
  if (parte === 1) {
    const u = t - (ac - 0.15);
    // 4 pares anticorpo → pedaço; o anticorpo voa até o pedaço e vira grumo
    const pares: { de: V3; para: V3 }[] = [
      { de: [-2.6, 1.6, 0], para: [-0.7, 0.5, 0] },
      { de: [2.6, 1.8, -0.5], para: [0.8, 0.7, -0.4] },
      { de: [-2.4, -1.8, 0.2], para: [-0.5, -0.6, 0.2] },
      { de: [2.4, -1.6, 0], para: [0.7, -0.5, 0] },
    ];
    return (
      <AbsoluteFill>
        <Palco fundo="#fde6ea">
          <CamPlanos t={u} dur={filtro - ac} planos={[{ t: 0, de: [0, 0, 6.2], para: [0.3, 0.2, 5.2], alvo: [0, 0, 0] }]} />
          {pares.map((p, i) => {
            const k = suave(entre(u, 0.1 + i * 0.12, 0.9 + i * 0.12));
            const junto = u > grumos - (ac - 0.15) - 0.1;
            const pos: V3 = [lerp(p.de[0], p.para[0], k), lerp(p.de[1], p.para[1], k), p.de[2]];
            return junto ? (
              <Grumo key={i} pos={p.para} escala={1.6 * pop(u, grumos - (ac - 0.15) - 0.1)} giro={u * 0.8 + i} />
            ) : (
              <group key={i}>
                <Pedaco pos={[p.para[0] + 0.12, p.para[1], p.para[2]]} r={0.16} />
                <Anticorpo pos={pos} rot={[0, 0, Math.atan2(p.para[1] - p.de[1], p.para[0] - p.de[0]) + Math.PI / 2]} escala={1.6} />
              </group>
            );
          })}
        </Palco>
        <Selo t={u} de={0.1} texto="ANTICORPOS" y={240} />
        <Selo t={u} de={grumos - (ac - 0.15)} texto="GRUMOS" y={1520} cor="vermelho" tam={56} />
      </AbsoluteFill>
    );
  }
  const u = t - (filtro - 0.15);
  return (
    <AbsoluteFill>
      <Palco fundo="#fde6ea">
        <CamPlanos t={u} dur={dur - filtro} planos={[{ t: 0, de: [0, 0.4, 7.5], para: [0, 0.2, 5.0], alvo: [0, 0, 0] }]} />
        <Glomerulo t={u + 3} />
        {Array.from({ length: 9 }, (_, i) => {
          const a = (i / 9) * Math.PI * 2;
          const k = suave(entre(u, 0.1 + i * 0.07, 0.6 + i * 0.07));
          const r = lerp(3.2, 1.0, k);
          return <Grumo key={i} pos={[Math.cos(a) * r, Math.sin(a) * r * 0.9, 0.6]} escala={0.9} giro={u + i} />;
        })}
      </Palco>
      <Selo t={u} de={glom - (filtro - 0.15)} texto="GLOMÉRULO" sub="O FILTRO DO RIM" y={240} tam={76} />
    </AbsoluteFill>
  );
};

// 6 — alarme do sistema imune, gasta o C3, o filtro inflama
export const Cena6: React.FC<PropsCena> = ({ t, dur }) => {
  const imune = naFala(5, "imune");
  const c3 = naFala(5, "c3");
  const infl = naFala(5, "inflama");
  const inflama = entre(t, infl - 0.2, infl + 0.6);
  const flash = t < c3 + 0.6 ? Math.max(0, Math.sin(t * 14)) * 0.18 : 0;
  return (
    <AbsoluteFill>
      <Palco fundo="#fde6ea">
        <CamPlanos
          t={t}
          dur={dur}
          planos={[
            { t: 0, de: [1.6, 0.9, 8.0], para: [0.9, 0.5, 6.6], alvo: [0, 0, 0] },
            { t: infl - 0.2, de: [-1.2, 1.2, 6.2], para: [-0.7, 0.7, 5.2], alvo: [0, 0, 0] },
          ]}
        />
        <Glomerulo t={t + 6} inflama={inflama} />
        {Array.from({ length: 6 }, (_, i) => {
          const a = (i / 6) * Math.PI * 2 + 0.4;
          const k = suave(entre(t, imune + i * 0.1, imune + 0.8 + i * 0.1));
          const r = lerp(4.5, 1.65, k);
          return <Defesa key={i} pos={[Math.cos(a) * r, Math.sin(a) * r * 0.8, 0.8]} giro={-a * 0.3} />;
        })}
      </Palco>
      <AbsoluteFill style={{ background: "#ff3b30", opacity: flash }} />
      <Icone t={t} de={0.05} ate={infl - 0.2} tipo="alarme" x={540} y={420} tam={200} />
      <Selo t={t} de={c3} texto="C3 ↓" cor="vermelho" y={1500} tam={90} />
      <Selo t={t} de={infl - 0.05} texto="INFLAMAÇÃO" y={240} />
    </AbsoluteFill>
  );
};

// 7 — sai pouco xixi, a água fica presa (incha), as hemácias vazam pra urina
export const Cena7: React.FC<PropsCena> = ({ t, dur, s }) => {
  const pouco = naFala(6, "pouco");
  const agua = naFala(6, "água");
  const hem = naFala(6, "hemácias");
  const incha = entre(t, agua, agua + 0.9);
  return (
    <AbsoluteFill>
      <Palco>
        <CamPlanos
          t={t}
          dur={dur}
          planos={[
            { t: 0, de: [0.3, 1.4, 3.6], para: [0.3, 1.3, 3.0], alvo: [0.3, 0.8, -0.1] },
            { t: hem - 0.15, de: [1.4, 1.2, 1.6], para: [1.2, 1.1, 1.25], alvo: [1.0, 0.85, -0.2], fov: 32 },
          ]}
        />
        <Consultorio s={s} pressao={1} />
        <Boneco v={LUCAS} pos={[0.35, 0, -0.1]} escala={0.72} t={t} rosto="triste" inchado={incha} olhoInchado={0.6 + incha * 0.4} />
        {/* copo da urina ao lado, recebendo hemácias */}
        <group position={[1.0, 0, -0.2]}>
          <Caixa tam={[0.5, 0.7, 0.5]} pos={[0, 0.35, 0]} cor="#ffffff" />
          <mesh position={[0, 0.85, 0]}>
            <cylinderGeometry args={[0.12, 0.1, 0.3, 24, 1, true]} />
            <meshStandardMaterial color="#e6f7ff" transparent opacity={0.4} side={2} />
          </mesh>
          <mesh position={[0, 0.8, 0]}>
            <cylinderGeometry args={[0.11, 0.1, 0.18, 24]} />
            <meshStandardMaterial color={t > hem + 0.6 ? "#6b3a1a" : "#f2d36b"} roughness={0.3} />
          </mesh>
          {Array.from({ length: 6 }, (_, i) => {
            const y = 1.7 - (t - hem - i * 0.12) * 1.8;
            if (t < hem + i * 0.12 || y < 0.85) return null;
            return <Hemacia key={i} pos={[(i % 3) * 0.05 - 0.05, y, (i % 2) * 0.04]} rot={[t * 3 + i, i, 0]} escala={0.8} />;
          })}
        </group>
      </Palco>
      <Icone t={t} de={pouco} ate={agua - 0.1} tipo="gota" x={400} y={520} tam={150} />
      <Icone t={t} de={pouco + 0.2} ate={agua - 0.1} tipo="errado" x={400} y={520} tam={190} balanca={false} />
      <Selo t={t} de={agua} ate={hem - 0.15} texto="INCHAÇO" sub="+ PRESSÃO ALTA" y={240} />
      <Selo t={t} de={hem} texto="SANGUE NA URINA" cor="vermelho" y={240} />
    </AbsoluteFill>
  );
};

const quadroTexto = (linhas: [string, string][], fundo = "#ffffff") => (ctx: CanvasRenderingContext2D) => {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  ctx.fillStyle = fundo;
  ctx.fillRect(0, 0, w, h);
  ctx.textAlign = "center";
  linhas.forEach(([txt, cor], i) => {
    ctx.fillStyle = cor;
    ctx.font = `bold ${i === 0 ? 120 : 52}px sans-serif`;
    ctx.fillText(txt, w / 2, i === 0 ? h * 0.52 : h * 0.82);
  });
};

// 8 — exames: urina, C3 baixo, ASO alto → diagnóstico
export const Cena8: React.FC<PropsCena> = ({ t, dur }) => {
  const conf = naFala(7, "confirmam");
  const c3 = naFala(7, "c3");
  const aso = naFala(7, "aso");
  const diag = naFala(7, "glomerulonefrite");
  return (
    <AbsoluteFill>
      <Palco>
        <CamPlanos
          t={t}
          dur={dur}
          planos={[
            { t: 0, de: [-2.3, 1.6, 4.2], para: [-2.0, 1.6, 3.7], alvo: [-2.0, 1.5, -2] },
            { t: c3 - 0.15, de: [-0.2, 1.6, 4.0], para: [0, 1.6, 3.6], alvo: [0, 1.5, -2] },
            { t: aso - 0.15, de: [1.8, 1.6, 4.0], para: [2.0, 1.6, 3.6], alvo: [2.0, 1.5, -2] },
            { t: diag - 0.15, de: [0, 2.0, 7.5], para: [0, 1.8, 6.6], alvo: [0, 1.2, -1.5] },
          ]}
        />
        <Chao cor="#eef0f2" />
        <Caixa tam={[14, 5, 0.2]} pos={[0, 2.5, -2.2]} cor="#e3eef7" sombra={false} />
        <Caixa tam={[14, 0.12, 0.05]} pos={[0, 1.05, -2.08]} cor="#5cc39a" sombra={false} />
        <Quadro pos={[-2.0, 1.9, -2.05]} chave="urina" escala={pop(t, conf)} desenhar={quadroTexto([["URINA", "#d63c3c"], ["HEMÁCIAS + CILINDROS", "#1f2a44"]])} />
        <Quadro pos={[0, 1.9, -2.05]} chave="c3" escala={pop(t, c3)} desenhar={quadroTexto([["C3 ↓", "#e8463f"], ["COMPLEMENTO", "#1f2a44"]])} />
        <Quadro pos={[2.0, 1.9, -2.05]} chave="aso" escala={pop(t, aso)} desenhar={quadroTexto([["ASO ↑", "#e8463f"], ["ANTIESTREPTOLISINA", "#1f2a44"]])} />
        <Boneco v={MEDICA} pos={[-0.9, 0, 0.2]} giro={0.3} t={t} rosto="feliz" bracos={[1.2, 0.3]} fala={falando(t, 0, dur)} />
        <Boneco v={LUCAS} pos={[1.0, 0, 0.4]} giro={-0.3} escala={0.72} t={t} rosto="serio" />
      </Palco>
      <Icone t={t} de={conf + 0.3} tipo="certo" x={250} y={560} tam={120} />
      <Selo t={t} de={diag} texto="GLOMERULONEFRITE" sub="PÓS-ESTREPTOCÓCICA" y={250} tam={70} />
    </AbsoluteFill>
  );
};

// 9 — tratamento: menos sal, menos água, diurético e antibiótico
export const Cena9: React.FC<PropsCena> = ({ t, dur }) => {
  const sal = naFala(8, "sal");
  const agua = naFala(8, "água");
  const diu = naFala(8, "diurético");
  const ab = naFala(8, "antibiótico");
  const selo = t >= ab ? "ANTIBIÓTICO" : t >= diu ? "DIURÉTICO" : t >= agua ? "MENOS ÁGUA" : t >= sal ? "MENOS SAL" : null;
  const deSelo = t >= ab ? ab : t >= diu ? diu : t >= agua ? agua : sal;
  return (
    <AbsoluteFill>
      <Palco>
        <CamPlanos t={t} dur={dur} planos={[{ t: 0, de: [-0.9, 2.5, 4.8], para: [0.9, 2.3, 4.3], alvo: [0, 1.0, -0.4] }]} />
        <Chao cor="#eef0f2" />
        <Caixa tam={[14, 5, 0.2]} pos={[0, 2.5, -2.2]} cor="#e3eef7" sombra={false} />
        {/* mesa */}
        <Caixa tam={[2.6, 0.1, 1.0]} pos={[0, 0.8, -0.3]} cor="#c97b4a" />
        {[-1.2, 1.2].map((x) => (
          <Caixa key={x} tam={[0.1, 0.8, 0.9]} pos={[x, 0.4, -0.3]} cor="#a7643b" />
        ))}
        {/* saleiro */}
        <group position={[-0.9, 0.85, -0.3]} scale={pop(t, sal)}>
          <mesh position={[0, 0.15, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.11, 0.3, 20]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.85} />
          </mesh>
          <mesh position={[0, 0.33, 0]}>
            <sphereGeometry args={[0.1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <Fosco cor="#9aa5ad" />
          </mesh>
        </group>
        {/* copo d'água pela metade */}
        <group position={[-0.3, 0.85, -0.3]} scale={pop(t, agua)}>
          <mesh position={[0, 0.15, 0]}>
            <cylinderGeometry args={[0.11, 0.09, 0.3, 20, 1, true]} />
            <meshStandardMaterial color="#e6f7ff" transparent opacity={0.4} side={2} />
          </mesh>
          <mesh position={[0, 0.06, 0]}>
            <cylinderGeometry args={[0.1, 0.09, 0.12, 20]} />
            <meshStandardMaterial color="#4fb3ea" transparent opacity={0.85} />
          </mesh>
        </group>
        {/* cápsula do diurético */}
        <group position={[0.3, 0.95, -0.3]} rotation={[0, 0, 1.2]} scale={pop(t, diu)}>
          <mesh position={[0, 0.07, 0]}>
            <capsuleGeometry args={[0.07, 0.14, 6, 12, 1]} />
            <Fosco cor="#4f8fe8" />
          </mesh>
          <mesh position={[0, -0.07, 0]}>
            <capsuleGeometry args={[0.07, 0.14, 6, 12]} />
            <Fosco cor="#ffffff" />
          </mesh>
        </group>
        {/* frasco do antibiótico */}
        <group position={[0.95, 0.85, -0.3]} scale={pop(t, ab)}>
          <mesh position={[0, 0.17, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.12, 0.34, 20]} />
            <meshStandardMaterial color="#ff9a3c" transparent opacity={0.9} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.39, 0]}>
            <cylinderGeometry args={[0.09, 0.09, 0.1, 20]} />
            <Fosco cor="#ffffff" />
          </mesh>
          <Caixa tam={[0.2, 0.12, 0.02]} pos={[0, 0.17, 0.12]} cor="#ffffff" sombra={false} />
        </group>
        <Boneco v={MEDICA} pos={[0, 0, -1.3]} t={t} rosto="feliz" fala={falando(t, 0, dur)} />
      </Palco>
      {selo && <Selo key={selo} t={t} de={deSelo} texto={selo} cor={t >= ab ? "verde" : "escuro"} y={250} tam={80} />}
      <Icone t={t} de={sal + 0.1} ate={agua - 0.05} tipo="proibido" x={330} y={1060} tam={150} />
      <Icone t={t} de={ab + 0.2} tipo="certo" x={780} y={1000} tam={150} />
    </AbsoluteFill>
  );
};

// 10 — de cada 100 crianças, mais de 95 ficam curadas (multidão que fica verde)
const GRADE = Array.from({ length: 100 }, (_, i) => ({ i, x: (i % 10) - 4.5, z: Math.floor(i / 10) - 4.5 }));
const NAO = new Set([13, 47, 72, 88]); // as que não ficam totalmente curadas (menos de 5%)
export const Cena10: React.FC<PropsCena> = ({ t, dur }) => {
  const criancas = naFala(9, "crianças");
  const n95 = naFala(9, "95");
  const cur = naFala(9, "curadas");
  return (
    <AbsoluteFill>
      <Palco fundo="#cfeec0" sol={[6, 12, 4]}>
        <CamPlanos t={t} dur={dur} planos={[{ t: 0, de: [0, 13, 12], para: [0, 10, 8.5], alvo: [0, 0, 0.5] }]} />
        <Chao cor="#a8d88a" tam={80} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <planeGeometry args={[11, 11]} />
          <meshStandardMaterial color="#f4f1ea" roughness={1} />
        </mesh>
        {GRADE.map(({ i, x, z }) => {
          const aparece = pop(t, criancas - 0.8 + (i % 10) * 0.03 + Math.floor(i / 10) * 0.05, 0.3);
          if (aparece <= 0) return null;
          const vira = !NAO.has(i) && t > n95 + ((i * 37) % 100) / 100;
          const v = crianca(i);
          return (
            <Boneco
              key={i}
              simples
              v={{ ...v, roupa: vira ? "#29b862" : "#b9c2cc" }}
              pos={[x * 1.0, 0, z * 1.0]}
              escala={0.62 * aparece}
              pula={vira ? Math.max(0, Math.sin((t - n95) * 6 + i)) * 0.6 : 0}
            />
          );
        })}
      </Palco>
      <Selo t={t} de={criancas - 0.3} ate={n95 - 0.05} texto="100 CRIANÇAS" y={230} />
      <Selo t={t} de={n95} texto="+ DE 95%" sub={t > cur - 0.1 ? "FICAM CURADAS" : undefined} cor="verde" y={230} tam={92} />
    </AbsoluteFill>
  );
};

// 11 — final no parque: a garganta sarou em 5 dias... foi o rim que contou o resto
export const Cena11: React.FC<PropsCena> = ({ t, dur }) => {
  const cinco = naFala(10, "cinco");
  const rim = naFala(10, "rim");
  return (
    <AbsoluteFill>
      <Palco fundo="#bfe6fb" sol={[5, 10, 6]}>
        <CamPlanos
          t={t}
          dur={dur}
          planos={[
            { t: 0, de: [1.8, 1.3, 3.6], para: [1.0, 1.2, 3.0], alvo: [0, 0.8, 0] },
            { t: rim - 0.2, de: [0, 4.5, 8], para: [0, 6, 10], alvo: [0, 0.6, 0] },
          ]}
        />
        <Parque />
        <Boneco v={LUCAS} escala={0.8} t={t} rosto="feliz" pula={Math.abs(Math.sin(t * 4.5))} acena />
        <Boneco v={MAE} pos={[-1.1, 0, -0.4]} giro={0.4} t={t} rosto="feliz" />
      </Palco>
      <Selo t={t} de={cinco} ate={rim - 0.1} texto="GARGANTA: 5 DIAS" y={240} />
      <Selo t={t} de={rim} texto="O RIM CONTOU O RESTO" cor="verde" y={240} tam={66} />
    </AbsoluteFill>
  );
};

export const CENAS = [Cena1, Cena2, Cena3, Cena4, Cena5, Cena6, Cena7, Cena8, Cena9, Cena10, Cena11];
