import { loadFont as carregarInter } from "@remotion/google-fonts/Inter";
import { loadFont as carregarMontserrat } from "@remotion/google-fonts/Montserrat";
import { useThree } from "@react-three/fiber";
import { useLayoutEffect, useMemo } from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { Acabamento, PalcoCinema } from "../../cinema/Palco";
import { Personagem3D, Pose3D } from "../../narrador/Personagem3D";
import { CarroAlagado, OndaChegando, PoeiraVento, RachasVivas, Raio, Respingo, Rodamoinho, Varal } from "./Acao";
import { CasaPartida, NIVEL_AGUA } from "./CasaPartida";
import { entre, K_MAPA, mapaX, mapaZ, MundoBairro, MundoBrasil, MundoCelular, MundoCorte, MundoEscala, MundoGlobo, MundoMesa, MundoTerreno } from "./Mundos";
import { baixaEfeitos, bocaEm, CASA_ELE, DURACAO, ETIQUETAS, FPS, LEGENDAS, piscaEm, PLANOS, planoEm, PoseNome, real, virtual } from "./tempo";

const SANS = carregarInter("normal", { weights: ["600"], subsets: ["latin", "latin-ext"] }).fontFamily;
const FORTE = carregarMontserrat("normal", { weights: ["700", "800"], subsets: ["latin", "latin-ext"] }).fontFamily;
const SOMBRA = "0 1px 3px rgba(0,0,0,0.6), 0 3px 16px rgba(0,0,0,0.45)";
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// ---------- poses: cada plano pede uma; a passagem é suave e, por cima, o gesto de quem fala ----------
const POSES: Record<PoseNome, Pose3D> = {
  neutro: { bracoE: [0.02, 0, -0.1], cotoveloE: 0.22, bracoD: [0.02, 0, 0.1], cotoveloD: 0.22 },
  abre: { bracoE: [-0.25, 0, -1.02], cotoveloE: 0.5, bracoD: [-0.25, 0, 1.02], cotoveloD: 0.5 },
  apontaE: { bracoE: [-0.45, 0, -1.26], cotoveloE: 0.12, bracoD: [0.02, 0, 0.12], cotoveloD: 0.3, cabeca: [0.02, -0.34, 0] },
  apontaD: { bracoE: [0.02, 0, -0.12], cotoveloE: 0.3, bracoD: [-0.45, 0, 1.26], cotoveloD: 0.12, cabeca: [0.02, 0.34, 0] },
  ombros: { bracoE: [-0.32, 0, -0.5], cotoveloE: 1.35, bracoD: [-0.32, 0, 0.5], cotoveloD: 1.35, cabeca: [0.03, 0, 0.07] },
  cima: { bracoE: [0.02, 0, -0.1], cotoveloE: 0.2, bracoD: [-2.5, 0, 0.3], cotoveloD: 0.2, cabeca: [-0.24, 0.1, 0] },
  explica: { bracoE: [-0.46, 0, -0.32], cotoveloE: 1.2, bracoD: [-0.56, 0, 0.42], cotoveloD: 1.32 },
  baixo: { bracoE: [0.02, 0, -0.1], cotoveloE: 0.2, bracoD: [-0.82, 0, 0.44], cotoveloD: 0.25, cabeca: [0.36, 0.1, 0] },
};
const mistura3 = (a: [number, number, number] = [0, 0, 0], b: [number, number, number] = [0, 0, 0], k: number): [number, number, number] => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
const poseEm = (t: number): Pose3D => {
  const i = PLANOS.findIndex((p) => t >= p.de && t < p.ate);
  const plano = PLANOS[Math.max(0, i)];
  const atual = POSES[plano.pose ?? "neutro"];
  let antes: Pose3D = atual;
  for (let j = i - 1; j >= 0; j--) {
    if (PLANOS[j].pose) {
      antes = POSES[PLANOS[j].pose!];
      break;
    }
  }
  const k = entre(t, plano.de, plano.de + 0.32);
  const fala = bocaEm(t) > 0 ? 1 : 0.35;
  const v = Math.sin(t * 2.7);
  const w = Math.sin(t * 4.3 + 1);
  const gesto = (c: [number, number, number] | undefined, c0: [number, number, number] | undefined, lado: number): [number, number, number] => {
    const m = mistura3(c0, c, k);
    return [m[0] + 0.05 * fala * v, m[1], m[2] + lado * 0.04 * fala * w];
  };
  // passo: perna e joelho; o braço acompanha
  const an = plano.anda;
  const andando = an && t >= an.t0 && t < an.t1;
  const f = t * 8.6;
  const passo = andando ? Math.sin(f) : 0;
  const trava = andando ? Math.min(1, (t - an!.t0) / 0.15, (an!.t1 - t) / 0.15) : 0;
  return {
    pernaE: 0.46 * passo * trava,
    pernaD: -0.46 * passo * trava,
    joelhoE: andando ? -Math.max(0.05, 0.92 * Math.sin(f + Math.PI / 2 + 0.5) ** 2 * (Math.cos(f) > 0 ? 1 : 0.2)) * trava : undefined,
    joelhoD: andando ? -Math.max(0.05, 0.92 * Math.sin(f + 0.5) ** 2 * (Math.cos(f) < 0 ? 1 : 0.2)) * trava : undefined,
    bracoE: ((): [number, number, number] => { const g = gesto(atual.bracoE, antes.bracoE, -1); return andando ? [g[0] - 0.3 * passo, g[1], g[2]] : g; })(),
    bracoD: ((): [number, number, number] => { const g = gesto(atual.bracoD, antes.bracoD, 1); return andando ? [g[0] + 0.3 * passo, g[1], g[2]] : g; })(),
    cotoveloE: (antes.cotoveloE ?? 0.2) + ((atual.cotoveloE ?? 0.2) - (antes.cotoveloE ?? 0.2)) * k + 0.08 * fala * w,
    cotoveloD: (antes.cotoveloD ?? 0.2) + ((atual.cotoveloD ?? 0.2) - (antes.cotoveloD ?? 0.2)) * k + 0.08 * fala * v,
    tronco: 0.012 * Math.sin(t * 1.7),
    cabeca: ((): [number, number, number] => {
      const m = mistura3(antes.cabeca, atual.cabeca, k);
      return [m[0] + 0.026 * Math.sin(t * 2.9) + 0.02 * fala * Math.sin(t * 6.3), m[1] + 0.05 * Math.sin(t * 1.2), m[2] + 0.018 * Math.sin(t * 0.9)];
    })(),
  };
};
const Ele: React.FC<{ t: number; pos: [number, number, number]; giro?: number; escala?: number }> = ({ t, pos, giro = -0.04, escala = 1 }) => {
  const an = planoEm(t).anda;
  const u = an ? Math.min(1, Math.max(0, (t - an.t0) / (an.t1 - an.t0))) : 0;
  const onde: [number, number, number] = an ? [an.de[0] + (an.ate[0] - an.de[0]) * u, an.de[1], an.de[2] + (an.ate[2] - an.de[2]) * u] : pos;
  const anda = an && t < an.t1;
  const girando = an && anda ? (an.giro ?? 0) : giro;
  const pula = anda ? Math.abs(Math.sin(t * 8.6)) * 0.022 : 0;
  const alvoLuz = useMemo(() => new THREE.Object3D(), []);
  return (
    <group scale={escala} position={onde}>
      {/* luz só dele: o cenário escurece, e o personagem continua com a cor normal */}
      <primitive object={alvoLuz} position={[0, 1.05, 0]} />
      <spotLight position={[0.8, 2.8, 3]} target={alvoLuz} angle={0.46} penumbra={0.75} intensity={13 * escala * escala} distance={8 * escala} decay={1.5} color="#FFF4E6" />
      <Personagem3D pos={[0, 0.006 * Math.sin(t * 1.9) + pula, 0]} giro={girando} pose={poseEm(t)} boca={bocaEm(t)} olhar={0.1} pisca={piscaEm(t)} />
    </group>
  );
};

// ---------- câmera ----------
const Camera: React.FC<{ t: number }> = ({ t }) => {
  const { camera } = useThree();
  const p = planoEm(t);
  const u = (t - p.de) / (p.ate - p.de);
  const m = u * u * (3 - 2 * u) * 0.35 + u * 0.65;
  const lerp = (a: [number, number, number], b: [number, number, number]) => mistura3(a, b, m);
  useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    const tr = p.treme ?? 0;
    const q = lerp(p.pos[0], p.pos[1]);
    c.position.set(q[0] + tr * Math.sin(t * 41), q[1] + tr * Math.sin(t * 53 + 1), q[2] + tr * 0.6 * Math.sin(t * 37 + 2));
    c.lookAt(...lerp(p.alvo[0], p.alvo[1]));
    c.fov = p.fov ?? 38;
    c.updateProjectionMatrix();
  });
  return null;
};

// ---------- mundo do plano ----------
const Mundo: React.FC<{ t: number }> = ({ t }) => {
  const p = planoEm(t);
  const u = (t - p.de) / (p.ate - p.de);
  const camX = p.pos[0][0] + (p.pos[1][0] - p.pos[0][0]) * u;
  const camZ = p.pos[0][2] + (p.pos[1][2] - p.pos[0][2]) * u;
  switch (p.mundo) {
    case "casa": {
      const claro = entre(t, 81.8, 82.7) * (t < 84.62 ? 1 : 0);
      const fresco = p.estado === "fresco";
      const desloca: [number, number, number] = p.estado === "borda" ? [0.32, 0, 7.4] : t >= 62.88 && t < 65.08 ? [0.3 + entre(t, 62.9, 63.7) * 2.1, 0, 7.4] : t >= 74.3 && t < 76.14 ? [4.25, 0, 6.6] : CASA_ELE;
      const mostra = p.estado !== "gota" && !fresco;
      // gancho: a água chega de repente; o chão racha; a poeira levanta
      const aguaK = t < -11.4 ? 0.2 + 0.8 * entre(t, -13, -11.5) : 1;
      const rachas = t < -5.15 ? entre(t, -13, -11.4) : t < -3.72 ? 0.25 + 0.75 * entre(t, -5.15, -3.9) : 1;
      const vento = t < 0 ? 0.9 : t >= 62.88 && t < 65.08 ? 0.75 : 0.34;
      const rodamoinho = (t >= -5.15 && t < -3.72) || (t >= 62.88 && t < 65.08) ? 1 : 0;
      const onda = t >= -7.1 && t < -5.5;
      return (
        <>
          <CasaPartida camX={camX} camZ={Math.max(1, camZ)} t={t} claro={claro} aguaK={aguaK} />
          <Raio t={t} quando={[-12.75, -12.1, -9.7, 33.75, 107.1]} />
          <OndaChegando t={t} de={-13} ate={-11.45} nivel={NIVEL_AGUA * aguaK} />
          {onda && <OndaChegando t={t} de={-7.1} ate={-5.5} nivel={NIVEL_AGUA} />}
          <Respingo t={t} de={-12.15} ate={-11.6} p={[-2.7, 1.1, 0.25]} n={60} vx={0.8} vy={2.9} sem="ga" escala={1.4} />
          <CarroAlagado t={t} p={[-3.25, NIVEL_AGUA * (aguaK - 1) * 0.7 - 0.15, 3.3]} />
          <Varal t={t} a={[0.75, 2.35, 3.7]} b={[3.35, 2.35, 3.4]} />
          <RachasVivas k={rachas} />
          <PoeiraVento t={t} forca={vento} />
          <Rodamoinho t={t} p={[2.2, 0, 6.2]} forca={rodamoinho} />
          {mostra && <Ele t={t} pos={desloca} giro={p.estado === "borda" ? -0.9 : -0.04} />}
          {p.estado === "gota" && <ChuvaRara t={t} />}
          {fresco && <Fresco t={t} />}
          {!mostra ? null : (
            <mesh position={[desloca[0] - 0.13, NIVEL_AGUA + 0.012, desloca[2]]} rotation={[-Math.PI / 2, 0, 0]} visible={desloca[0] === 0}>
              <ringGeometry args={[0.17, 0.24, 28]} />
              <meshBasicMaterial color="#E4DCCB" transparent opacity={0.7} depthWrite={false} />
            </mesh>
          )}
        </>
      );
    }
    case "cisterna":
      return <CasaPartida camX={camX} camZ={Math.max(1, camZ)} t={t} nivelCisterna={entre(t, 71.9, 74.2)} />;
    case "alagada":
      return <CasaPartida camX={Math.max(0.01, camX)} camZ={Math.max(1, camZ)} t={t} opSecao={0.34} perigos />;
    case "globo":
      return (
        <>
          <MundoGlobo t={t} estado={p.estado} />
          {p.estado === "ele" && <Ele t={t} pos={[0, 0.99, 0.02]} escala={0.17} />}
        </>
      );
    case "escala":
      return (
        <>
          <MundoEscala t={t} />
          <Ele t={t} pos={[0.425, 1.7, 0.1]} giro={0.2} escala={0.78} />
        </>
      );
    case "brasil":
      return (
        <>
          <MundoBrasil t={t} estado={p.estado ?? "neutro"} />
          {p.estado === "neutro" && <Ele t={t} pos={[mapaX(-37.5), 0, mapaZ(-21)]} escala={1.75} giro={-0.45} />}
          {p.estado === "chuva" && <Ele t={t} pos={[mapaX(-43.5), 0, mapaZ(-26.5)]} escala={0.85} giro={-0.5} />}
          
          {p.estado === "calor" && <Ele t={t} pos={[mapaX(-37.5), 0, mapaZ(-21)]} escala={1.75} giro={-0.35} />}
          
        </>
      );
    case "corte":
      return <MundoCorte t={t} estado={p.estado ?? "um"} />;
    case "terreno":
      return (
        <>
          <MundoTerreno t={t} obra={p.estado === "obra"} />
          <Ele t={t} pos={p.estado === "obra" ? [2.2, 0, 2] : [-0.7, 0, 1.2]} giro={-0.5} />
        </>
      );
    case "mesa":
      return <MundoMesa t={t} />;
    case "celular":
      return <MundoCelular t={t} ElePadrao={<Ele t={t} pos={[0.58, -1.32, -1.4]} giro={-0.3} />} />;
    case "bairro":
      return <MundoBairro t={t} />;
  }
};
// a pouca chuva que cai no telhado
const ChuvaRara: React.FC<{ t: number }> = ({ t }) => (
  <>
    {new Array(46).fill(0).map((_, i) => {
      const f = (i * 0.137) % 1;
      const y = ((f * 5 - t * 8) % 5 + 5) % 5;
      return (
        <mesh key={i} position={[0.3 + ((i * 0.41) % 2.9), 6 + y, -2.6 + ((i * 0.73) % 3.1)]}>
          <boxGeometry args={[0.012, 0.3, 0.012]} />
          <meshBasicMaterial color="#D9ECF7" transparent opacity={0.65} />
        </mesh>
      );
    })}
    <mesh position={[2.72, 3.5, 0.25]}>
      <cylinderGeometry args={[0.018, 0.018, 4.3, 8]} />
      <meshBasicMaterial color="#9CD0E8" transparent opacity={0.8} />
    </mesh>
  </>
);
// toldo e vento atravessando a casa
const Fresco: React.FC<{ t: number }> = ({ t }) => {
  const abre = entre(t, 82.9, 83.5);
  const vento = entre(t, 83.6, 84.1);
  return (
    <>
      {abre > 0.01 && (
        <mesh position={[1.42, 3.45, 0.2 + 0.6 * abre]} rotation={[0.5, 0, 0]} scale={[1, 1, abre]} castShadow>
          <boxGeometry args={[1.95, 0.03, 1.3]} />
          <meshStandardMaterial color="#C6503A" roughness={0.8} />
        </mesh>
      )}
      {vento > 0 &&
        new Array(9).fill(0).map((_, i) => {
          const x = ((t * 7 + i * 1.8) % 9) - 2;
          return (
            <mesh key={i} position={[x, 1.1 + (i % 3) * 0.62, 0.45 + (i % 2) * 0.5]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.012, 0.012, 1.3, 6]} />
              <meshBasicMaterial color="#F7F4E8" transparent opacity={0.65 * vento} />
            </mesh>
          );
        })}
    </>
  );
};

// ---------- camadas de tela ----------
// azul na enchente, laranja na seca, amarelo no resto
const AZUL = "#6FD6FF";
const LARANJA = "#FFA63D";
const AMARELO = "#FFD23F";
const corEm = (t: number) => {
  if ((t >= -8.72 && t < -7.95) || (t >= -7.1 && t < -5.15) || (t >= 23 && t < 25.72) || (t >= 33.6 && t < 62.88) || (t >= 102.38 && t < 106.92)) return AZUL;
  if ((t >= -7.95 && t < -7.1) || (t >= -5.15 && t < -3.72) || (t >= 25.72 && t < 31.32) || (t >= 62.88 && t < 84.62)) return LARANJA;
  return AMARELO;
};
// quebra a frase em palavras; * marca a palavra-chave, que pode ter mais de uma palavra
const palavrasDe = (texto: string) => {
  const lista: { p: string; chave: boolean }[] = [];
  texto.split(/(\*[^*]+\*)/).forEach((pedaco) => {
    if (!pedaco) return;
    const chave = pedaco.startsWith("*");
    (chave ? pedaco.slice(1, -1) : pedaco).split(/\s+/).filter(Boolean).forEach((p) => lista.push({ p, chave }));
  });
  return lista;
};
// surge com um pulinho; a palavra-chave pula mais
const salto = (u: number, forca: number) => {
  const k = Math.min(1, Math.max(0, u));
  return 0.72 + 0.28 * k + forca * Math.sin(k * Math.PI);
};
const TextoVivo: React.FC<{ t: number; de: number; ate: number; texto: string; cor: string; tam: number; tudoAte?: number }> = ({ t, de, ate, texto, cor, tam, tudoAte }) => {
  const lista = palavrasDe(texto);
  const total = lista.reduce((n, w) => n + w.p.length + 1, 0);
  let antes = 0;
  const janela = (tudoAte ?? ate) - de;
  return (
    <>
      {lista.map((w, i) => {
        const nasce = de + janela * 0.88 * (antes / total);
        antes += w.p.length + 1;
        const u = (t - nasce) / 0.13;
        return (
          <span key={i} style={{ display: "inline-block", marginLeft: w.chave ? "0.06em" : 0, marginRight: w.chave ? "0.34em" : "0.24em", opacity: u <= 0 ? 0 : 1, color: w.chave ? cor : "#fff", transform: `scale(${salto(u, w.chave ? 0.2 : 0.07) * (w.chave ? 1.07 : 1)}) rotate(${w.chave ? -1.4 : 0}deg)` }}>
            {w.p}
          </span>
        );
      })}
    </>
  );
};
const CONTORNO: React.CSSProperties = { WebkitTextStroke: "7px rgba(0,0,0,0.92)", paintOrder: "stroke fill", textShadow: "0 5px 0 rgba(0,0,0,0.55), 0 8px 22px rgba(0,0,0,0.5)" };
const Pergunta: React.FC<{ t: number }> = ({ t }) => {
  if (t >= -8.72) return null;
  return (
    <div style={{ position: "absolute", left: 50, right: 50, top: 1130, textAlign: "center", fontFamily: FORTE, fontWeight: 800, fontSize: 92, lineHeight: 1.06, letterSpacing: -1, color: "#fff", ...CONTORNO }}>
      <TextoVivo t={t} de={-13.03} ate={-8.72} tudoAte={-10.25} texto="Sua casa aguentaria o *El Niño* mais forte desde 1950?" cor={AMARELO} tam={92} />
    </div>
  );
};
// clarão só do lado da tempestade
const Clarao: React.FC<{ t: number }> = ({ t }) => {
  const b = [-12.75, -12.1, -9.7, 33.75, 107.1].find((v) => t >= v && t < v + 0.2);
  const p = planoEm(t);
  if (b === undefined || p.mundo !== "casa") return null;
  return <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 540, background: `rgba(226,232,255,${0.72 * (1 - (t - b) / 0.2)})`, mixBlendMode: "screen" }} />;
};
const Legenda: React.FC<{ t: number }> = ({ t }) => {
  const atual = LEGENDAS.find(([a, b]) => t >= a && t < b);
  if (!atual) return null;
  return (
    <div style={{ position: "absolute", left: 50, right: 50, top: 1370, textAlign: "center", fontFamily: FORTE, fontWeight: 800, fontSize: 74, lineHeight: 1.08, letterSpacing: -0.5, color: "#fff", ...CONTORNO }}>
      <TextoVivo t={t} de={atual[0]} ate={atual[1]} texto={atual[2]} cor={corEm(t)} tam={74} />
    </div>
  );
};
const EtiquetaTela: React.FC<{ t: number }> = ({ t }) => {
  const e = ETIQUETAS.find((x) => t >= x.de && t < x.ate);
  if (!e) return null;
  const k = entre(t, e.de, e.de + 0.22) * (1 - entre(t, e.ate - 0.16, e.ate));
  const numero = e.conta ? `+${interpolate(t, [e.conta[0], e.conta[1]], [e.conta[2], e.conta[3]], cl).toFixed(2).replace(".", ",")} °C` : e.numero;
  const progresso = e.conta ? entre(t, e.conta[0], e.conta[1]) : 1;
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: e.topo ?? 130, opacity: k, textShadow: SOMBRA, textAlign: "center", color: "#fff", transform: `translateY(${(1 - k) * -8}px)` }}>
      {e.rotulo && <div style={{ fontFamily: FORTE, fontWeight: 700, fontSize: 28, letterSpacing: 2.2, lineHeight: 1.28, ...CONTORNO, WebkitTextStroke: "4px rgba(0,0,0,0.85)" }}>{e.rotulo}</div>}
      {numero && <div style={{ fontFamily: FORTE, fontSize: 118, fontWeight: 800, lineHeight: 1.1, marginTop: 6, letterSpacing: -2, color: corEm(t), transform: `scale(${salto((t - e.de) / 0.2, 0.14)})`, ...CONTORNO }}>{numero}</div>}
      {e.conta && <div style={{ height: 3, width: 460 * progresso, background: "rgba(255,255,255,0.9)", margin: "10px auto 0" }} />}
      {e.fonte && <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 22, letterSpacing: 0.2, marginTop: 14, color: "rgba(255,255,255,0.92)", lineHeight: 1.3, textShadow: "0 2px 6px rgba(0,0,0,0.9)" }}>{e.fonte}</div>}
    </div>
  );
};
// nomes dos perigos na hora da fala, ao lado da seção da água
const Perigos: React.FC<{ t: number }> = ({ t }) => {
  if (t < 104.5 || t >= 106.92) return null;
  const nomes: [number, string, number, number][] = [
    [104.84, "buraco", 110, 900],
    [105.64, "bueiro", 420, 930],
    [106.26, "fio", 740, 840],
  ];
  return (
    <>
      {nomes.map(([de, nome, x, y]) => {
        const k = entre(t, de, de + 0.15);
        return (
          <div key={nome} style={{ position: "absolute", left: x, top: y, fontFamily: FORTE, fontWeight: 800, fontSize: 62, color: AZUL, ...CONTORNO, opacity: k > 0 ? 1 : 0, transform: `scale(${salto(k, 0.2)})` }}>
            {nome}
          </div>
        );
      })}
    </>
  );
};
// a transição do vídeo: duas folhas que fecham exatamente na linha do meio da casa
const TROCAS = [...PLANOS.filter((p, i) => i > 0 && PLANOS[i - 1].mundo !== p.mundo).map((p) => p.de), 12.24];
const Folhas: React.FC<{ t: number }> = ({ t }) => {
  const c = TROCAS.find((x) => Math.abs(t - x) < 0.17);
  if (c === undefined) return null;
  const k = 1 - Math.abs(t - c) / 0.17;
  const w = 540 * Math.min(1, k * 1.25);
  return (
    <>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: w, background: "#2F3B48" }} />
      <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: w, background: "#D5A25C" }} />
    </>
  );
};
// ---------- som: voz + efeitos, sem música ----------
const EFEITOS: [number, string, number][] = [
  [-13, "agua-sobe", 0.5],
  [-13, "chuva-curta", 0.3],
  [-12.75, "trovao", 0.5],
  [-12.1, "correnteza", 0.34],
  [-9.7, "trovao", 0.34],
  [-8.72, "chuva-curta", 0.22],
  [-7.95, "vento-seco", 0.26],
  [-7.1, "correnteza", 0.32],
  [-5.15, "vento-seco", 0.34],
  [-5.05, "racha", 0.24],
  [16.7, "carimbo", 0.5],
  [23, "chuva-curta", 0.24],
  [25.72, "vento-seco", 0.3],
  [33.6, "chuva-curta", 0.24],
  [33.75, "trovao", 0.28],
  [35.9, "martelo", 0.4],
  [38.1, "agua-sobe", 0.34],
  [43, "agua-sobe", 0.4],
  [44.6, "racha", 0.6],
  [45.08, "dum", 0.36],
  [55.08, "dum", 0.38],
  [55.86, "dum", 0.38],
  [107.1, "trovao", 0.18],
  [60.0, "correnteza", 0.16],
  [56.6, "correnteza", 0.28],
  [47.2, "agua-entra", 0.42],
  [54.42, "correnteza", 0.42],
  [62.88, "vento-seco", 0.34],
  [67.1, "gotas", 0.42],
  [71.9, "agua-sobe", 0.34],
  [83, "toldo", 0.36],
  [83.6, "vento-seco", 0.32],
  [89.6, "vento-seco", 0.2],
  [102.5, "agua-entra", 0.22],
];
const Som: React.FC = () => (
  <>
    <Audio src={staticFile("noticias/el-nino/voz/narracao-v3.wav")} volume={1} />
    {/* só um sopro baixo quando o lugar muda; nada de tique em cada corte */}
    {PLANOS.slice(1).map((p, i) => {
      if (PLANOS[i].mundo === p.mundo) return null;
      const r = real(p.de);
      if (r === null) return null;
      const de = Math.max(0, Math.round((r - 0.12) * FPS));
      return (
        <Sequence key={i} from={de} layout="none" durationInFrames={20}>
          <Audio src={staticFile("noticias/el-nino/sons/whoosh.wav")} volume={(q) => 0.2 * (baixaEfeitos[de + q] ?? 1)} />
        </Sequence>
      );
    })}
    {EFEITOS.map(([momento, som, vol], i) => {
      const r = real(momento);
      if (r === null) return null;
      const de = Math.round(r * FPS);
      return (
        <Sequence key={i} from={de} layout="none" durationInFrames={150}>
          <Audio src={staticFile(`noticias/el-nino/sons/${som}.wav`)} volume={(q) => vol * (baixaEfeitos[de + q] ?? 1)} />
        </Sequence>
      );
    })}
  </>
);

const FILTRO_DARK: Record<string, string> = {
  casa: "brightness(0.8) contrast(1.14) saturate(0.92)",
  alagada: "brightness(0.8) contrast(1.14) saturate(0.92)",
  cisterna: "brightness(0.82) contrast(1.14) saturate(0.94)",
  corte: "brightness(0.8) contrast(1.16) saturate(0.9)",
  terreno: "brightness(0.74) contrast(1.16) saturate(0.9)",
  mesa: "brightness(0.78) contrast(1.14) saturate(0.94)",
  bairro: "brightness(0.76) contrast(1.16) saturate(0.9)",
  brasil: "brightness(0.9) contrast(1.1) saturate(0.96)",
  globo: "brightness(0.96) contrast(1.08)",
  escala: "brightness(0.9) contrast(1.1) saturate(0.96)",
  celular: "brightness(0.96) contrast(1.06)",
};
export const VideoElNino: React.FC = () => {
  const t = virtual(useCurrentFrame() / FPS);
  const p = planoEm(t);
  const foco = p.foco ?? 9.6;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <div style={{ position: "absolute", inset: 0, filter: FILTRO_DARK[p.mundo] }}>
        <PalcoCinema ceu="entardecer" fundo="#5B6670" fov={38} far={900} luzCeu={0.28} brilhoCeu={0.6} desfoqueCeu={0.2}>
          <Camera t={t} />
          <Mundo t={t} />
          <Acabamento foco={foco} desfoque={p.desfoque ?? 2.2} brilho={0.28} saturacao={0.05} contraste={0.12} vinheta={0.34} ao={0} />
        </PalcoCinema>
      </div>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 72% 60% at 50% 45%, rgba(4,6,12,0) 55%, rgba(4,6,12,0.42) 100%)" }} />
      <AbsoluteFill>
        <Clarao t={t} />
        <Pergunta t={t} />
        <EtiquetaTela t={t} />
        <Perigos t={t} />
        <Legenda t={t} />
        <Folhas t={t} />
      </AbsoluteFill>
      <Som />
    </AbsoluteFill>
  );
};
export const DURACAO_QUADROS = Math.round((real(DURACAO) ?? 0) * FPS);
void K_MAPA;
