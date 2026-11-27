import { loadFont as carregarInter } from "@remotion/google-fonts/Inter";
import { RoundedBox } from "@react-three/drei";
import { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Boneco, Visual } from "../cinema/Boneco";
import { SERIFA } from "../cinema/Textos";
import { CameraLivre, V3 } from "../cinema/kit/Cameras";
import { Ambiente } from "../cinema/kit/Luz";
import { Parado, texturaCanvas } from "../cinema/kit/Pecas";
import { MesaBar, Rua, casasDaRua } from "../cinema/kit/Rua";

// TESTE da parte 1 do "Fim do mundo interativo" (alerta no celular): uma imagem por cena do roteiro v2.
// Plano = frame / 60. Para ver uma cena: quadro 30 + 60 × (número da cena − 1).
export const DURACAO_ALERTA_TESTE = 6 * 60;
const FORTE = carregarInter("normal", { weights: ["800", "900"], subsets: ["latin"] }).fontFamily;

const LOJAS: [string, string][] = [
  ["BAR DO NEIDE", "CERVEJA GELADA"],
  ["PADARIA", "PÃO QUENTINHO"],
  ["FARMÁCIA", "24 HORAS"],
];

const RAFA: Visual = { pele: "#8d5a3c", cabelo: "curto", corCabelo: "#1c1410", camisa: "#e63946", calca: "#22223b", perna: "calca" };
const THAIS: Visual = { corpo: "mulher", pele: "#6e4532", cabelo: "trancas", corCabelo: "#3a2418", camisa: "#2a9d8f", manga: "curta", calca: "#2f5f9e", perna: "calca", brinco: true };
const NEIDE: Visual = { corpo: "mulher", pele: "#a8704f", cabelo: "coque", corCabelo: "#6b6b6b", camisa: "#f4f1ea", calca: "#3b3b3b", perna: "calca", avental: "#c1121f", peso: 1.15 };
const JAIR: Visual = { pele: "#c58c68", cabelo: "careca", barba: true, corCabelo: "#d8d8d8", camisa: "#8ecae6", calca: "#5c4033", perna: "calca", peso: 1.1 };
const BETO: Visual = { pele: "#8d5a3c", cabelo: "black", corCabelo: "#1c1410", camisa: "#f4f1ea", calca: "#22223b", perna: "calca", avental: "#222222" };

const TV_X = -2.2;
const TV_Y = 2.15;
const BAR_Z0 = -4;
const FRENTE = 4; // parede da rua

const texturaTV = (alerta: boolean) =>
  texturaCanvas(640, 360, (ctx) => {
    if (!alerta) {
      ctx.fillStyle = "#2e8b3a";
      ctx.fillRect(0, 0, 640, 360);
      return;
    }
    ctx.fillStyle = "#b3001b";
    ctx.fillRect(0, 0, 640, 360);
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.font = "900 52px Inter, sans-serif";
    ctx.fillText("ALERTA NACIONAL", 320, 90);
    ctx.font = "600 38px Inter, sans-serif";
    ctx.fillText("Fique onde está.", 320, 170);
    ctx.fillText("Feche portas e janelas.", 320, 225);
    ctx.font = "900 40px Inter, sans-serif";
    ctx.fillText("NÃO OLHE PARA O CÉU.", 320, 300);
  });

const Peca: React.FC<{ p: V3; e: V3; cor: string; r?: number; rug?: number }> = ({ p, e, cor, rug = 0.7 }) => (
  <mesh position={p} castShadow receiveShadow>
    <boxGeometry args={e} />
    <meshStandardMaterial color={cor} roughness={rug} />
  </mesh>
);

// Interior do Bar do Neide: balcão, geladeira de cerveja, TV, mesas, parede da rua com vitrine e porta
// de aço (rolo) quase fechada. Do lado de fora fica um clarão dourado.
const BarInterior: React.FC<{ alerta: boolean; luz: number; rolo: number }> = ({ alerta, luz, rolo }) => {
  const piso = useMemo(
    () =>
      texturaCanvas(
        256,
        256,
        (ctx) => {
          for (let i = 0; i < 4; i++)
            for (let j = 0; j < 4; j++) {
              ctx.fillStyle = (i + j) % 2 ? "#cfc3ad" : "#b9ab90";
              ctx.fillRect(i * 64, j * 64, 64, 64);
              ctx.strokeStyle = "rgba(0,0,0,0.18)";
              ctx.strokeRect(i * 64, j * 64, 64, 64);
            }
          for (let i = 0; i < 900; i++) {
            ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.05})`;
            ctx.fillRect(Math.random() * 256, Math.random() * 256, 3, 3);
          }
        },
        true,
      ),
    [],
  );
  piso.repeat.set(10 / 1.2, 8 / 1.2);
  const tv = useMemo(() => texturaTV(alerta), [alerta]);
  const x0 = -5;
  const x1 = 5;
  const H = 3.2;
  const janela = { x: -2.4, l: 3.6, y0: 0.95, y1: 2.35 };
  const porta = { x: 2.6, l: 1.5 };
  return (
    <group>
      {/* piso e teto */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 8]} />
        <meshStandardMaterial map={piso} roughness={0.4} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, H, 0]}>
        <planeGeometry args={[10, 8]} />
        <meshStandardMaterial color="#b9b0a0" roughness={0.95} />
      </mesh>
      {/* paredes: fundo, laterais */}
      <Peca p={[0, H / 2, BAR_Z0]} e={[10, H, 0.2]} cor="#e0c97f" />
      <Peca p={[x0, H / 2, 0]} e={[0.2, H, 8]} cor="#d9b86a" />
      <Peca p={[x1, H / 2, 0]} e={[0.2, H, 8]} cor="#d9b86a" />
      {/* faixa de azulejo no fundo e nas laterais */}
      <Peca p={[0, 0.7, BAR_Z0 + 0.12]} e={[10, 1.4, 0.04]} cor="#f1efe9" rug={0.3} />
      <Peca p={[x0 + 0.12, 0.7, 0]} e={[0.04, 1.4, 8]} cor="#f1efe9" rug={0.3} />
      <Peca p={[x1 - 0.12, 0.7, 0]} e={[0.04, 1.4, 8]} cor="#f1efe9" rug={0.3} />
      {/* parede da rua: peitoril, verga, pilares e porta */}
      <Peca p={[janela.x, janela.y0 / 2, FRENTE]} e={[janela.l, janela.y0, 0.25]} cor="#c9a14a" />
      <Peca p={[janela.x, (janela.y1 + H) / 2, FRENTE]} e={[janela.l, H - janela.y1, 0.25]} cor="#d9b86a" />
      <Peca p={[(x0 + janela.x - janela.l / 2) / 2, H / 2, FRENTE]} e={[janela.x - janela.l / 2 - x0, H, 0.25]} cor="#d9b86a" />
      <Peca p={[(janela.x + janela.l / 2 + porta.x - porta.l / 2) / 2, H / 2, FRENTE]} e={[porta.x - porta.l / 2 - (janela.x + janela.l / 2), H, 0.25]} cor="#d9b86a" />
      <Peca p={[(porta.x + porta.l / 2 + x1) / 2, H / 2, FRENTE]} e={[x1 - (porta.x + porta.l / 2), H, 0.25]} cor="#d9b86a" />
      {/* moldura da vitrine */}
      <Peca p={[janela.x, janela.y0, FRENTE - 0.02]} e={[janela.l + 0.1, 0.06, 0.3]} cor="#3a2a1a" />
      <Peca p={[janela.x, janela.y1, FRENTE - 0.02]} e={[janela.l + 0.1, 0.06, 0.3]} cor="#3a2a1a" />
      <Peca p={[janela.x, (janela.y0 + janela.y1) / 2, FRENTE - 0.02]} e={[0.05, janela.y1 - janela.y0, 0.3]} cor="#3a2a1a" />
      {/* adesivo de cerveja no vidro */}
      <Peca p={[janela.x - 1.0, 1.7, FRENTE - 0.15]} e={[0.9, 0.35, 0.01]} cor="#f2c230" />
      {/* porta de aço: desce do alto até a altura `rolo` */}
      <group position={[porta.x, 0, FRENTE - 0.05]}>
        <mesh position={[0, (rolo + H - 0.15) / 2, 0]} castShadow>
          <boxGeometry args={[porta.l + 0.05, H - 0.15 - rolo, 0.04]} />
          <meshStandardMaterial color="#8d949b" metalness={0.6} roughness={0.45} />
        </mesh>
        {Array.from({ length: 10 }, (_, i) => (
          <mesh key={i} position={[0, rolo + 0.12 + i * ((H - 0.3 - rolo) / 10), 0.025]}>
            <boxGeometry args={[porta.l + 0.05, 0.015, 0.02]} />
            <meshStandardMaterial color="#5f666c" metalness={0.5} roughness={0.5} />
          </mesh>
        ))}
        <Peca p={[0, rolo - 0.04, 0.03]} e={[porta.l + 0.1, 0.08, 0.08]} cor="#3d4348" />
      </group>
      {/* clarão dourado lá fora, atrás da vitrine e da porta */}
      <mesh position={[0, 4, FRENTE + 12]}>
        <planeGeometry args={[60, 24]} />
        <meshBasicMaterial color="#ffd27a" toneMapped={false} side={2} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, FRENTE + 6]}>
        <planeGeometry args={[40, 12]} />
        <meshStandardMaterial color="#c9bba2" roughness={0.9} />
      </mesh>
      <pointLight position={[1, 3, FRENTE + 7]} color="#ffd9a0" intensity={60 * luz} distance={14} decay={1.6} />
      {/* balcão em L, geladeira e TV */}
      <group position={[3.4, 0, BAR_Z0 + 1.1]}>
        <RoundedBox args={[3.2, 1.05, 0.7]} radius={0.03} position={[0, 0.525, 0]} castShadow receiveShadow>
          <meshStandardMaterial color="#7a4a22" roughness={0.5} />
        </RoundedBox>
        <Peca p={[0, 1.07, 0]} e={[3.3, 0.06, 0.8]} cor="#2b2b2b" rug={0.3} />
        {[-1, -0.3, 0.6].map((x, i) => (
          <mesh key={i} position={[x, 1.2, 0.05]} castShadow>
            <cylinderGeometry args={[0.04, 0.04, 0.24, 12]} />
            <meshPhysicalMaterial color={i === 1 ? "#f2c230" : "#5a2a0a"} roughness={0.15} clearcoat={1} />
          </mesh>
        ))}
      </group>
      <group position={[0.2, 0, BAR_Z0 + 0.5]}>
        <Peca p={[0, 0.95, 0]} e={[1.0, 1.9, 0.7]} cor="#f4f4f2" rug={0.3} />
        <Peca p={[0, 1.4, 0.36]} e={[0.85, 1.3, 0.02]} cor="#bfe3f2" rug={0.1} />
        {Array.from({ length: 4 }, (_, i) => (
          <Peca key={i} p={[0, 0.85 + i * 0.32, 0.34]} e={[0.8, 0.03, 0.04]} cor="#999" />
        ))}
      </group>
      <group position={[TV_X, TV_Y, BAR_Z0 + 0.18]}>
        <Peca p={[0, 0, 0]} e={[1.9, 1.1, 0.08]} cor="#111" />
        <mesh position={[0, 0, 0.05]}>
          <planeGeometry args={[1.78, 1.0]} />
          <meshBasicMaterial map={tv} toneMapped={false} />
        </mesh>
        <Peca p={[0, -0.7, 0]} e={[0.12, 0.3, 0.12]} cor="#222" />
      </group>
      {/* luz vermelha da TV no alerta */}
      <pointLight position={[TV_X, TV_Y - 0.3, BAR_Z0 + 1.5]} color={alerta ? "#ff3340" : "#9dff9d"} intensity={alerta ? 7 : 4} distance={9} decay={1.6} />
      {/* ventilador e lâmpadas */}
      <group position={[-1, H - 0.05, 0]}>
        <Peca p={[0, 0, 0]} e={[0.2, 0.1, 0.2]} cor="#333" />
        <Peca p={[0, -0.1, 0]} e={[1.0, 0.02, 0.12]} cor="#6b4a2a" />
        <Peca p={[0, -0.1, 0]} e={[0.12, 0.02, 1.0]} cor="#6b4a2a" />
      </group>
      <pointLight position={[-1.5, 2.9, 0]} color="#fff0d0" intensity={9} distance={9} decay={1.5} />
      <pointLight position={[2, 2.9, -1]} color="#fff0d0" intensity={6} distance={8} decay={1.5} />
      {/* mesas */}
      <MesaBar pos={[-3, 0, -0.8]} giroY={0.2} />
      <MesaBar pos={[-0.6, 0, -1.2]} giroY={-0.1} cor="#e63946" />
      <MesaBar pos={[-3.4, 0, 1.4]} giroY={0.1} cor="#2a9d8f" />
      {/* cartaz e relógio na parede do fundo */}
      <Peca p={[-4.1, 2.1, BAR_Z0 + 0.14]} e={[0.6, 0.85, 0.02]} cor="#f4e9c8" />
      <mesh position={[-3.2, 2.7, BAR_Z0 + 0.14]}>
        <cylinderGeometry args={[0.22, 0.22, 0.04, 24]} />
        <meshStandardMaterial color="#f4f4f2" />
      </mesh>
    </group>
  );
};

const NomeCena: React.FC<{ n: number; texto: string }> = ({ n, texto }) => (
  <div style={{ position: "absolute", top: 70, left: 0, right: 0, textAlign: "center", fontFamily: FORTE, fontWeight: 800, fontSize: 26, letterSpacing: 5, color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,0.7)" }}>
    TESTE · CENA {n} · {texto.toUpperCase()}
  </div>
);

const Legenda: React.FC<{ texto: string }> = ({ texto }) => (
  <div style={{ position: "absolute", left: 60, right: 60, bottom: 330, textAlign: "center", fontFamily: SERIFA, fontSize: 64, lineHeight: 1.15, color: "#fff", textShadow: "0 2px 6px rgba(0,0,0,0.55), 0 8px 30px rgba(0,0,0,0.45)" }}>
    {texto.split("*").map((p, i) => (
      <span key={i} style={{ fontStyle: i % 2 ? "italic" : "normal", fontWeight: i % 2 ? 600 : 400 }}>
        {p}
      </span>
    ))}
  </div>
);

const Pergunta: React.FC = () => (
  <div style={{ position: "absolute", top: 400, left: 70, right: 70, textAlign: "center", fontFamily: SERIFA, fontSize: 68, lineHeight: 1.15, color: "#fff", textShadow: "0 2px 6px rgba(0,0,0,0.55), 0 8px 30px rgba(0,0,0,0.45)" }}>
    E se todo celular do Brasil tocasse ao mesmo tempo com o alerta: <i style={{ fontWeight: 600 }}>fique onde está</i>?
  </div>
);

// celular com a notificação (cena 5)
const Celular: React.FC = () => (
  <div style={{ position: "absolute", left: 130, right: 130, bottom: 520, background: "rgba(20,20,24,0.92)", borderRadius: 38, padding: "34px 40px", border: "2px solid rgba(255,255,255,0.15)", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>
    <div style={{ fontFamily: FORTE, fontWeight: 800, fontSize: 26, letterSpacing: 3, color: "#9aa0a6" }}>MENSAGEM · RAFA</div>
    <div style={{ fontFamily: FORTE, fontWeight: 800, fontSize: 50, lineHeight: 1.15, color: "#fff", marginTop: 14 }}>Abre. Eu só quero que você olhe.</div>
  </div>
);

const MarcaDagua: React.FC = () => (
  <div style={{ position: "absolute", right: 56, bottom: 72, textAlign: "right", fontFamily: FORTE, fontWeight: 900, color: "rgba(255,255,255,0.88)", textShadow: "0 2px 10px rgba(0,0,0,0.6)" }}>
    <div style={{ fontSize: 40, letterSpacing: 2 }}>MUNDO PARALELO</div>
    <div style={{ fontSize: 26, letterSpacing: 1, opacity: 0.85 }}>@mundoparalelo.br</div>
  </div>
);

const Escolha: React.FC = () => (
  <>
    <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.38)" }} />
    <div style={{ position: "absolute", top: 520, left: 0, right: 0, textAlign: "center", fontFamily: SERIFA, fontSize: 66, color: "#fff", textShadow: "0 2px 6px rgba(0,0,0,0.55)" }}>
      O que eles fazem<i style={{ fontWeight: 600 }}>?</i>
    </div>
    {[
      ["A", "Abrem a porta pro Rafa", 700],
      ["B", "Ficam trancados e ela responde", 960],
    ].map(([l, t, y]) => (
      <div key={l as string} style={{ position: "absolute", top: y as number, left: 90, right: 90, display: "flex", alignItems: "center", gap: 36, padding: "30px 40px", borderRadius: 30, background: "rgba(0,0,0,0.5)", border: "3px solid rgba(255,255,255,0.8)" }}>
        <div style={{ fontFamily: FORTE, fontWeight: 900, fontSize: 120, color: "#f3cf5e", lineHeight: 1 }}>{l}</div>
        <div style={{ fontFamily: FORTE, fontWeight: 800, fontSize: 46, lineHeight: 1.15, color: "#fff" }}>{t}</div>
      </div>
    ))}
    <div style={{ position: "absolute", top: 1260, left: 0, right: 0, textAlign: "center", fontFamily: SERIFA, fontSize: 48, color: "#fff", textShadow: "0 2px 6px rgba(0,0,0,0.55)" }}>
      Comenta <i style={{ fontWeight: 600 }}>A</i> ou <i style={{ fontWeight: 600 }}>B</i>. A parte 2 sai com a que ganhar.
    </div>
    <MarcaDagua />
  </>
);

export const AlertaTeste: React.FC = () => {
  const frame = useCurrentFrame();
  const plano = Math.min(5, Math.floor(frame / 60));
  const s = (frame % 60) / 30;
  const t = frame / 30;

  // cena 1: rua de verdade, bar do Neide, Rafa chegando
  const casas = casasDaRua(120, "alerta", LOJAS);
  const bar = casas.find((c) => c.loja?.[0] === "BAR DO NEIDE")!;
  const lb = bar.lado;
  const exterior = plano === 0;
  const interior = !exterior;

  // pessoas dentro do bar (de frente para a TV, de costas para a câmera da cena 2)
  const olhaTV = Math.PI; // virado para o fundo (−z)
  const dentro = (
    <>
      <Boneco visual={NEIDE} animacao={plano === 1 ? "terrified" : "idle"} t={t} pos={[3.4, 0, BAR_Z0 + 1.9]} giroY={0} altura={1.62} semente={3} falando={false} />
      <Boneco visual={BETO} animacao="idle" t={t} pos={[2.2, 0, -1.5]} giroY={olhaTV} altura={1.76} semente={5} />
      <Boneco visual={JAIR} animacao={plano === 1 ? "surprised" : "sitting-idle"} t={t} pos={[-3, 0, -0.18]} giroY={olhaTV} altura={1.7} semente={2} />
      <Boneco visual={THAIS} animacao="texting-while-standing" naMao="celular" telaCelular="mensagens" t={t} pos={[0.9, 0, 1.6]} giroY={Math.PI} altura={1.64} semente={4} />
      <Parado semente="c1" pos={[-0.6, 0, -0.58]} giroY={olhaTV} t={t} animacao="sitting-idle" />
      <Parado semente="c2" pos={[-0.6, 0, -1.78]} giroY={0} t={t} animacao="sitting-talking" falando />
      <Parado semente="c3" pos={[-3.4, 0, 2.02]} giroY={Math.PI} t={t} animacao="sitting-idle" />
      <Parado semente="c4" pos={[-3.4, 0, 0.78]} giroY={0} t={t} animacao="sitting-talking" falando />
      <Parado semente="c5" pos={[-1.6, 0, 0.9]} giroY={olhaTV} t={t} animacao="texting-while-standing" />
      <Parado semente="c6" pos={[-4.2, 0, -0.5]} giroY={olhaTV} t={t} animacao="idle" />
    </>
  );

  let camera: React.ReactNode = null;
  if (plano === 0) camera = <CameraLivre pos={[-lb * 0.5, 2.0, bar.z + 8 - s * 0.6]} alvo={[lb * 5, 1.7, bar.z]} fov={52} />;
  if (plano === 1) camera = <CameraLivre pos={[0.9, 1.6, 3.2 - s * 0.15]} alvo={[-2, 1.9, BAR_Z0]} fov={56} />;
  if (plano === 2) camera = <CameraLivre pos={[-1.0 + s * 0.05, 1.5, 1.6]} alvo={[-1.9, 1.7, FRENTE + 3]} fov={50} />;
  if (plano === 3) camera = <CameraLivre pos={[2.6, 1.62, 2.55 + s * 0.05]} alvo={[2.6, 1.6, FRENTE + 2]} fov={30} />;
  if (plano === 4 || plano === 5) camera = <CameraLivre pos={[-0.3, 1.45, 2.3]} alvo={[-2.4, 1.6, FRENTE + 5]} fov={50} />;

  const sombras: V3[] = [[-3.4, 0, FRENTE + 3.2], [-2.0, 0, FRENTE + 5.4], [-1.0, 0, FRENTE + 3.4], [-3.0, 0, FRENTE + 7], [-1.6, 0, FRENTE + 9], [0.2, 0, FRENTE + 6]];

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Ambiente hora={exterior ? "tarde" : "interior"} foco={plano === 3 ? 2.6 : plano === 2 ? 3.2 : 4} desfoque={plano === 3 ? 3.5 : 2} area={45} ao={1.4} raioAo={0.9} semNevoa={interior}>
        {camera}
        {exterior && (
          <>
            <Rua hora="tarde" comprimento={120} semente="alerta" lojas={LOJAS} carros={3} />
            {/* Rafa chega de moto e para na calçada; mexe no celular */}
            <Boneco visual={RAFA} animacao="walking" t={t} pos={[lb * 3.9, 0.16, bar.z + 4.5 - s * 1.2]} giroY={Math.PI} altura={1.76} semente={7} />
            {[-1, 1].map((k, i) =>
              [0, 2, 1].map((c) => {
                const a = 0.3 * k + (c * Math.PI) / 2;
                const mx = lb * 4.6;
                const mz = bar.z + k * 1.15;
                return (
                  <Parado key={`${i}${c}`} semente={`mesa${i}${c}`} pos={[mx + Math.sin(a) * 0.62, 0.16, mz + Math.cos(a) * 0.62]} giroY={a + Math.PI} t={t} animacao={c === 1 ? "sitting-talking" : "sitting-idle"} falando={c === 1} />
                );
              }),
            )}
          </>
        )}
        {interior && (
          <>
            <BarInterior alerta={plano >= 1} luz={plano >= 4 ? 0.5 : 1} rolo={plano === 3 ? 1.95 : 1.5} />
            {dentro}
            {/* Rafa lá fora, no clarão: olha pro céu (cena 3) e depois encara pela fresta */}
            {plano === 2 && <Boneco visual={RAFA} animacao="surprised" t={t} pos={[-1.7, 0, FRENTE + 3.4]} giroY={Math.PI} altura={1.76} semente={7} />}
            {plano === 3 && <Boneco visual={RAFA} animacao="idle" t={t} pos={[2.6, 0, FRENTE + 1.15]} giroY={Math.PI} altura={1.76} semente={7} />}
            {plano >= 4 && (
              <>
                <Boneco visual={RAFA} animacao="idle" t={t} pos={[-0.3, 0, FRENTE + 1.2]} giroY={Math.PI} altura={1.76} semente={7} />
                {sombras.map((p, i) => (
                  <Boneco key={i} visual={{ ...pessoaEscura }} animacao="idle" t={t + i} pos={p} giroY={Math.PI + (i - 2) * 0.12} altura={1.7} semente={i + 10} />
                ))}
              </>
            )}
          </>
        )}
      </Ambiente>

      {plano === 0 && <Pergunta />}
      {plano === 0 && <Legenda texto="Domingo, quatro da tarde. *Ninguém* ia sair antes do apito." />}
      {plano === 1 && <Legenda texto="*Teste* não manda não olhar pro céu." />}
      {plano === 2 && <Legenda texto="Foi só *um segundo*." />}
      {plano === 3 && <Legenda texto="*Abre*, Thaís. É bonito." />}
      {plano === 4 && <Legenda texto="A mensagem veio do celular dele. *Ele não estava digitando.*" />}
      {plano === 4 && <Celular />}
      {plano === 5 && <Escolha />}
      <NomeCena n={plano + 1} texto={["Bar do Neide · 16h02", "O toque", "Rafa lá fora", "Pela fresta", "As sombras", "Escolha A ou B"][plano]} />
    </AbsoluteFill>
  );
};

// silhuetas: roupa e pele escuras, contra o clarão
const pessoaEscura: Visual = { pele: "#2a2a2e", cabelo: "curto", corCabelo: "#111", camisa: "#232329", calca: "#1c1c22", perna: "calca", sapato: "#111" };
