import { loadFont } from "@remotion/google-fonts/Montserrat";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { Camera } from "../Estudio";
import { Mascote3D, PoseMascote } from "../Mascote3D";
import dados from "./dados.json";

// Fase Extra, Fase 23: "O GTA 6 quebrou a internet (e o Brasil tava no topo)".
// Vídeo EXPLICATIVO (pedido em 19/11/2026): fundo com imagens oficiais do jogo desfocadas, um número grande por tela,
// barras, relógio, pódio e mosaico, logos das plataformas e fotos dos streamers. Sem música: só efeitos leves.
// Números: picos preliminares da Streams Charts.
// Final: o Vyce 3D DENTRO do GTA (praia de Vice City da live do kosky, clipes/praia.mp4) fazendo a pergunta.
const { fontFamily } = loadFont("normal", { weights: ["600", "800", "900"], subsets: ["latin"] });
export const FPS = 30;
const FIM = dados.duracao + 1.0;
export const DURACAO_FASE23 = Math.ceil(FIM * FPS);
const ROXO = "#B66BFF";
const TWITCH = "#9146FF";
const YOUTUBE = "#FF2D2D";
const KICK = "#53FC18";
const VERDE_BR = "#22C55E";
const AMARELO = "#FFD84A";
const CINZA = "#8A8FA3";
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const suave = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
const entra = (t: number, a: number, d = 0.4) => interpolate(t, [a, a + d], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) });
const ARQ = (n: string) => `fase-extra/fase23/${n}`;
const fmt = (n: number) => Math.round(n).toLocaleString("pt-BR");

// ---------- âncoras ----------
type Pal = { w: string; s: number; e: number };
const PAL = dados.palavras as Pal[];
const limpa = (w: string) => w.toLowerCase().replace(/[.,?!:…“”"]/g, "");
const em = (palavra: string, depois = 0) => PAL.find((p) => limpa(p.w) === palavra && p.s >= depois)?.s ?? 999;
const NUNCA = em("nunca");
const BRASIL = em("brasil", NUNCA);
const VAL = em("o", em("números")); // "O recorde antes era do Valorant"
const TW = em("só", VAL);
const YT = em("no", em("legends", TW));
const KK = em("kick", YT);
const NZ = em("e", KK + 0.5); // "E o Brasil nem precisou esperar"
const TOP = em("resultado", NZ);
const ALAN = em("o", em("brasileiros", TOP));
const PD = em("o", em("tempo", ALAN));
const KG = em("e", em("youtube", PD));
const NOTA = em("e", em("plataforma", KG));
const FECHO = em("quase", NOTA);
const FINAL = em("fala", FECHO) - 0.15;
const ENQ = em("comenta", FINAL);

// ---------- fundo explicativo (escuro, grade suave que anda) ----------
const Foto: React.FC<{ t: number }> = ({ t }) => {
  const marcas = [0, NUNCA, VAL, TW, YT, NZ, TOP, ALAN, KG, NOTA];
  let i = 0;
  while (i + 1 < marcas.length && marcas[i + 1] <= t) i++;
  const de = marcas[i];
  const k = suave(t, de, de + 0.5);
  const z = 1.08 + 0.06 * Math.min(1, (t - de) / 8);
  const filtro = "blur(7px) brightness(0.42) saturate(1.1)";
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {i > 0 && <Img src={staticFile(ARQ(`fotos/bg${i}.jpg`))} style={{ position: "absolute", width: 1080, height: 1920, objectFit: "cover", transform: `scale(${z})`, filter: filtro }} />}
      <Img src={staticFile(ARQ(`fotos/bg${Math.min(9, i + 1)}.jpg`))} style={{ position: "absolute", width: 1080, height: 1920, objectFit: "cover", opacity: k, transform: `scale(${z})`, filter: filtro }} />
    </AbsoluteFill>
  );
};
const Fundo: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill style={{ background: "#07040F" }}>
    <Foto t={t} />
    <AbsoluteFill style={{ background: "radial-gradient(120% 80% at 50% 30%, rgba(42,17,80,.55) 0%, rgba(18,8,34,.75) 55%, rgba(7,4,15,.9) 100%)" }} />
    <AbsoluteFill
      style={{
        opacity: 0.18,
        backgroundImage: "linear-gradient(rgba(182,107,255,.35) 2px, transparent 2px), linear-gradient(90deg, rgba(182,107,255,.35) 2px, transparent 2px)",
        backgroundSize: "90px 90px",
        backgroundPosition: `0px ${(t * 30) % 90}px`,
        transform: "perspective(900px) rotateX(55deg) translateY(520px) scale(2)",
        transformOrigin: "50% 100%",
      }}
    />
    <div style={{ position: "absolute", left: 540 - 420 + Math.sin(t * 0.4) * 80, top: 500 + Math.cos(t * 0.3) * 60, width: 840, height: 840, borderRadius: 420, background: "radial-gradient(circle, rgba(182,107,255,.22), transparent 65%)" }} />
  </AbsoluteFill>
);

// logo da plataforma (SVG num círculo da cor da marca)
const Logo: React.FC<{ nome: "twitch" | "youtube" | "kick"; tam?: number }> = ({ nome, tam = 120 }) => {
  const cor = nome === "twitch" ? TWITCH : nome === "youtube" ? YOUTUBE : KICK;
  return (
    <div style={{ width: tam, height: tam, borderRadius: tam / 2, background: cor, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 30px ${cor}88` }}>
      <Img src={staticFile(ARQ(`fotos/logo-${nome}.svg`))} style={{ width: tam * 0.55, height: tam * 0.55, filter: nome === "kick" ? "none" : "invert(1)" }} />
    </div>
  );
};
// cena: aparece e some suave, sobe um pouco
const Cena: React.FC<{ t: number; de: number; ate: number; children: React.ReactNode }> = ({ t, de, ate, children }) => {
  if (t < de - 0.05 || t > ate) return null;
  const k = entra(t, de, 0.45);
  const s = suave(t, ate - 0.3, ate);
  return <AbsoluteFill style={{ fontFamily, color: "#fff", opacity: k * (1 - s), transform: `translateY(${(1 - k) * 40 - s * 30}px) scale(${1 + 0.03 * suave(t, de, ate)})` }}>{children}</AbsoluteFill>;
};
const Rotulo: React.FC<{ cor?: string; children: React.ReactNode; tam?: number }> = ({ cor = "#E2C4FF", children, tam = 36 }) => <div style={{ fontWeight: 800, fontSize: tam, letterSpacing: 8, color: cor, textAlign: "center" }}>{children}</div>;
const Grande: React.FC<{ tam?: number; cor?: string; children: React.ReactNode }> = ({ tam = 150, cor = "#fff", children }) => (
  <div style={{ fontWeight: 900, fontSize: tam, lineHeight: 1, letterSpacing: -3, color: cor, textAlign: "center", fontVariantNumeric: "tabular-nums", textShadow: "0 8px 40px rgba(0,0,0,.5)" }}>{children}</div>
);
const Fonte: React.FC = () => <div style={{ position: "absolute", bottom: 40, left: 0, right: 0, textAlign: "center", fontWeight: 700, fontSize: 22, letterSpacing: 4, color: "rgba(255,255,255,.55)" }}>DADOS PRELIMINARES · STREAMS CHARTS</div>;
const conta = (t: number, de: number, d: number, alvo: number) => alvo * interpolate(t, [de, de + d], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) });

// ---------- cenas ----------
const Gancho: React.FC<{ t: number }> = ({ t }) => (
  <Cena t={t} de={0} ate={NUNCA - 0.05}>
    <div style={{ position: "absolute", top: 640, left: 0, right: 0 }}>
      <Rotulo>GTA 6 AO VIVO</Rotulo>
      <Grande tam={168}>{fmt(conta(t, 0.1, 2.6, 7886402))}</Grande>
      <div style={{ opacity: entra(t, em("mesmo") - 0.2) }}>
        <Grande tam={74} cor={AMARELO}>AO MESMO TEMPO</Grande>
      </div>
      <div style={{ marginTop: 60, display: "flex", justifyContent: "center", gap: 40 }}>
        {(["twitch", "youtube", "kick"] as const).map((n, i) => (
          <div key={n} style={{ opacity: entra(t, 0.6 + i * 0.25), transform: `scale(${0.6 + 0.4 * entra(t, 0.6 + i * 0.25)})` }}>
            <Logo nome={n} />
          </div>
        ))}
      </div>
    </div>
    <Fonte />
  </Cena>
);

const Maior: React.FC<{ t: number }> = ({ t }) => (
  <Cena t={t} de={NUNCA} ate={VAL - 0.05}>
    <div style={{ position: "absolute", top: 640, left: 0, right: 0 }}>
      <Grande tam={110}>O MAIOR</Grande>
      <Grande tam={110}>DA HISTÓRIA</Grande>
      <div style={{ marginTop: 40, opacity: entra(t, BRASIL - 0.2), transform: `scale(${0.8 + 0.2 * entra(t, BRASIL - 0.2)})` }}>
        <Grande tam={78} cor={VERDE_BR}>
          E O <span style={{ color: AMARELO }}>BRASIL</span> NO TOPO
        </Grande>
      </div>
    </div>
  </Cena>
);

const Barra: React.FC<{ t: number; de: number; rotulo: string; valor: number; max: number; cor: string; texto: string; altura?: number; logo?: "twitch" | "youtube" | "kick" }> = ({ t, de, rotulo, valor, max, cor, texto, altura = 900, logo }) => {
  const k = interpolate(t, [de, de + 1.2], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) });
  const h = (valor / max) * altura * k;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", width: 300, height: altura + 200 }}>
      {logo && (
        <div style={{ marginBottom: 14, opacity: k }}>
          <Logo nome={logo} tam={110} />
        </div>
      )}
      <div style={{ fontWeight: 900, fontSize: 58, marginBottom: 14, opacity: k, fontVariantNumeric: "tabular-nums" }}>{texto}</div>
      <div style={{ width: 220, height: h, background: `linear-gradient(180deg, ${cor}, ${cor}AA)`, borderRadius: "22px 22px 0 0", boxShadow: `0 0 50px ${cor}66` }} />
      <div style={{ marginTop: 16, fontWeight: 800, fontSize: 32, letterSpacing: 4, textAlign: "center", color: "#ddd" }}>{rotulo}</div>
    </div>
  );
};

const Recorde: React.FC<{ t: number }> = ({ t }) => {
  const gta = em("gta", VAL);
  const quatro = em("4", VAL);
  return (
    <Cena t={t} de={VAL} ate={TW - 0.05}>
      <div style={{ position: "absolute", top: 230, left: 0, right: 0 }}>
        <Rotulo>O RECORDE DE AUDIÊNCIA EM LIVE</Rotulo>
      </div>
      <div style={{ position: "absolute", top: 380, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 120 }}>
        <Barra t={t} de={VAL + 0.4} rotulo={"VALORANT\n2020"} valor={1.74} max={7.89} cor={CINZA} texto="1,7 MI" />
        <Barra t={t} de={gta} rotulo="GTA 6" valor={7.89} max={7.89} cor={ROXO} texto="7,9 MI" />
      </div>
      <div style={{ position: "absolute", top: 1560, left: 0, right: 0, opacity: entra(t, quatro - 0.2), transform: `scale(${0.7 + 0.3 * entra(t, quatro - 0.2)})` }}>
        <Grande tam={96} cor={AMARELO}>4,5× MAIS</Grande>
      </div>
      <Fonte />
    </Cena>
  );
};

const Twitch: React.FC<{ t: number }> = ({ t }) => {
  const lol = em("league", TW);
  return (
    <Cena t={t} de={TW} ate={YT - 0.05}>
      <div style={{ position: "absolute", top: 380, left: 0, right: 0 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <Logo nome="twitch" tam={140} />
        </div>
        <Rotulo cor={TWITCH}>SÓ NA TWITCH</Rotulo>
        <Grande tam={190} cor="#fff">{(conta(t, TW + 0.2, 1.6, 3.29)).toFixed(1).replace(".", ",")} MI</Grande>
        <div style={{ opacity: entra(t, em("virou", TW) - 0.2) }}>
          <Grande tam={60}>A CATEGORIA MAIS VISTA</Grande>
          <Grande tam={60}>DE TODOS OS TEMPOS</Grande>
        </div>
      </div>
      <div style={{ position: "absolute", top: 1130, left: 120, right: 120, opacity: entra(t, lol - 0.3) }}>
        {[
          ["GTA 6", 3.29, TWITCH, "3,29 MI"],
          ["MUNDIAL DE LOL 2022", 3.11, CINZA, "3,11 MI"],
        ].map(([n, v, c, txt], i) => {
          const k = interpolate(t, [lol - 0.3 + i * 0.25, lol + 0.9 + i * 0.25], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) });
          return (
            <div key={n as string} style={{ marginBottom: 26 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 34, marginBottom: 8 }}>
                <span>{n}</span>
                <span>{txt}</span>
              </div>
              <div style={{ height: 34, borderRadius: 17, background: "rgba(255,255,255,.08)" }}>
                <div style={{ width: `${((v as number) / 3.29) * 100 * k}%`, height: 34, borderRadius: 17, background: c as string }} />
              </div>
            </div>
          );
        })}
      </div>
      <Fonte />
    </Cena>
  );
};

const Plataformas: React.FC<{ t: number }> = ({ t }) => {
  const itens: [string, number, string, number, "twitch" | "youtube" | "kick"][] = [
    ["TWITCH", 3.29, TWITCH, YT - 0.2, "twitch"],
    ["YOUTUBE", 3.19, YOUTUBE, YT + 0.1, "youtube"],
    ["KICK", 1.49, KICK, KK - 0.1, "kick"],
  ];
  return (
    <Cena t={t} de={YT - 0.2} ate={NZ - 0.05}>
      <div style={{ position: "absolute", top: 260, left: 0, right: 0 }}>
        <Rotulo>PICO EM CADA PLATAFORMA</Rotulo>
      </div>
      <div style={{ position: "absolute", top: 420, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 50 }}>
        {itens.map(([n, v, c, de, lg]) => (
          <Barra key={n} t={t} de={de} rotulo={n} valor={v} max={3.29} cor={c} texto={`${v.toFixed(1).replace(".", ",")} MI`} altura={760} logo={lg} />
        ))}
      </div>
      <Fonte />
    </Cena>
  );
};

const Relogio: React.FC<{ hora: number; cor: string; t: number }> = ({ hora, cor, t }) => {
  const a = (hora % 12) * 30 + 0 * t;
  return (
    <svg width={300} height={300} viewBox="-150 -150 300 300">
      <circle r={136} fill="rgba(255,255,255,.06)" stroke={cor} strokeWidth={10} />
      {Array.from({ length: 12 }, (_, i) => (
        <line key={i} x1={0} y1={-118} x2={0} y2={-100} stroke="#fff" strokeWidth={6} transform={`rotate(${i * 30})`} opacity={0.7} />
      ))}
      <line x1={0} y1={0} x2={0} y2={-70} stroke="#fff" strokeWidth={12} strokeLinecap="round" transform={`rotate(${a})`} />
      <line x1={0} y1={0} x2={0} y2={-105} stroke={cor} strokeWidth={6} strokeLinecap="round" />
      <circle r={10} fill="#fff" />
    </svg>
  );
};
const Fuso: React.FC<{ t: number }> = ({ t }) => (
  <Cena t={t} de={NZ} ate={TOP - 0.05}>
    <div style={{ position: "absolute", top: 300, left: 0, right: 0 }}>
      <Rotulo>O TRUQUE DO FUSO</Rotulo>
    </div>
    <div style={{ position: "absolute", top: 470, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 100 }}>
      {[
        ["NOVA ZELÂNDIA", 0, "#7CC8FF", "00:00 · 19/11", NZ + 0.2],
        ["BRASIL", 8, VERDE_BR, "08:00 · 18/11", em("8", NZ) - 0.2],
      ].map(([n, h, c, txt, de]) => (
        <div key={n as string} style={{ textAlign: "center", opacity: entra(t, de as number), transform: `scale(${0.85 + 0.15 * entra(t, de as number)})` }}>
          <Relogio hora={h as number} cor={c as string} t={t} />
          <div style={{ marginTop: 20, fontWeight: 900, fontSize: 40, color: c as string }}>{n}</div>
          <div style={{ fontWeight: 800, fontSize: 42 }}>{txt}</div>
        </div>
      ))}
    </div>
    <div style={{ position: "absolute", top: 1080, left: 0, right: 0, opacity: entra(t, em("live", NZ) - 0.2) }}>
      <Grande tam={92} cor={AMARELO}>16 HORAS</Grande>
      <Grande tam={64}>ANTES DA MEIA-NOITE</Grande>
    </div>
  </Cena>
);

const Podio: React.FC<{ t: number }> = ({ t }) => {
  const dois = em("2", TOP);
  const bloco = (lugar: string, h: number, cor: string, nome: string, de: number) => {
    const k = interpolate(t, [de, de + 0.7], [0, 1], { ...cl, easing: Easing.out(Easing.back(1.4)) });
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", width: 280 }}>
        {lugar === "2" && <Img src={staticFile(ARQ("fotos/alanzoka.jpg"))} style={{ width: 150, height: 150, borderRadius: 75, objectFit: "cover", border: `6px solid ${VERDE_BR}`, marginBottom: 12, opacity: k }} />}
        <div style={{ fontWeight: 900, fontSize: 40, marginBottom: 14, opacity: k, color: cor === CINZA ? "#ccc" : AMARELO }}>{lugar === "2" ? "ALANZOKA" : nome}</div>
        <div style={{ width: 250, height: h * k, background: cor, borderRadius: "18px 18px 0 0", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 20, fontWeight: 900, fontSize: 90, color: "#0b0b14" }}>{k > 0.5 ? lugar : ""}</div>
      </div>
    );
  };
  return (
    <Cena t={t} de={TOP} ate={ALAN - 0.05}>
      <div style={{ position: "absolute", top: 300, left: 0, right: 0 }}>
        <Rotulo>MAIORES LIVES DO MUNDO NO LANÇAMENTO</Rotulo>
      </div>
      <div style={{ position: "absolute", top: 520, left: 0, right: 0, display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 20, height: 900 }}>
        {bloco("2", 560, VERDE_BR, "BRASIL", dois)}
        {bloco("1", 720, CINZA, "OUTRO PAÍS", dois + 0.3)}
        {bloco("3", 440, VERDE_BR, "BRASIL", dois + 0.6)}
      </div>
      <div style={{ position: "absolute", top: 1500, left: 0, right: 0, opacity: entra(t, dois + 1) }}>
        <Grande tam={80} cor={AMARELO}>2 DOS 3 MAIORES</Grande>
        <Grande tam={70} cor={VERDE_BR}>SÃO BRASILEIROS</Grande>
      </div>
    </Cena>
  );
};

const Cartao: React.FC<{ t: number; de: number; nome: string; foto: string; cor: string; plat: "twitch" | "youtube"; valor: string }> = ({ t, de, nome, foto, cor, plat, valor }) => {
  const k = entra(t, de, 0.5);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 34, padding: "34px 40px", background: "rgba(255,255,255,.07)", border: `4px solid ${cor}`, borderRadius: 34, opacity: k, transform: `translateX(${(1 - k) * -60}px)`, marginBottom: 30 }}>
      <div style={{ position: "relative" }}>
        <Img src={staticFile(ARQ(`fotos/${foto}.jpg`))} style={{ width: 170, height: 170, borderRadius: 85, objectFit: "cover", border: `6px solid ${cor}` }} />
        <div style={{ position: "absolute", right: -8, bottom: -8 }}>
          <Logo nome={plat} tam={64} />
        </div>
      </div>
      <div>
        <div style={{ fontWeight: 900, fontSize: 58 }}>{nome}</div>
        <div style={{ fontWeight: 800, fontSize: 30, letterSpacing: 4, color: cor }}>{plat.toUpperCase()}</div>
        <div style={{ fontWeight: 900, fontSize: 64, color: AMARELO }}>{valor}</div>
      </div>
    </div>
  );
};
const Streamers: React.FC<{ t: number }> = ({ t }) => (
  <Cena t={t} de={ALAN} ate={KG - 0.05}>
    <div style={{ position: "absolute", top: 300, left: 0, right: 0 }}>
      <Rotulo>OS BRASILEIROS</Rotulo>
    </div>
    <div style={{ position: "absolute", top: 440, left: 80, right: 80 }}>
      <Cartao t={t} de={ALAN} nome="ALANZOKA" foto="alanzoka" cor={TWITCH} plat="twitch" valor="+300 MIL" />
      <Cartao t={t} de={em("paulinho", PD) - 0.1} nome="PAULINHO O LOKO" foto="paulinho" cor={YOUTUBE} plat="youtube" valor="+200 MIL" />
      <Cartao t={t} de={em("davy", PD) - 0.1} nome="DAVY JONES" foto="davy" cor={YOUTUBE} plat="youtube" valor="+200 MIL" />
    </div>
    <div style={{ position: "absolute", top: 1560, left: 0, right: 0, opacity: entra(t, ALAN + 0.5) }}>
      <Rotulo tam={30}>PESSOAS ASSISTINDO AO MESMO TEMPO</Rotulo>
    </div>
    <Fonte />
  </Cena>
);

const Canais: React.FC<{ t: number }> = ({ t }) => {
  const n = Math.round(conta(t, KG + 0.2, 2.4, 1128));
  const cols = 24;
  return (
    <Cena t={t} de={KG} ate={NOTA - 0.05}>
      <div style={{ position: "absolute", top: 260, left: 0, right: 0 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <Logo nome="kick" tam={120} />
        </div>
        <Rotulo cor={KICK}>NA KICK</Rotulo>
        <Grande tam={170}>{fmt(n)}</Grande>
        <Grande tam={56}>CANAIS AO MESMO TEMPO</Grande>
      </div>
      <div style={{ position: "absolute", top: 930, left: 90, width: 900, display: "flex", flexWrap: "wrap", gap: 6 }}>
        {Array.from({ length: 47 * cols }, (_, i) => (
          <div key={i} style={{ width: 31.5, height: 9, borderRadius: 3, background: i < n ? KICK : "rgba(255,255,255,.06)", opacity: i < n ? 0.55 + 0.45 * ((i * 37) % 7) / 7 : 1 }} />
        ))}
      </div>
      <div style={{ position: "absolute", top: 1580, left: 0, right: 0, opacity: entra(t, em("recorde", KG) - 0.2) }}>
        <Grande tam={70} cor={AMARELO}>RECORDE DA KICK</Grande>
      </div>
    </Cena>
  );
};

const Nota: React.FC<{ t: number }> = ({ t }) => {
  const zelda = em("zelda", NOTA);
  const selo = (txt: string, sub: string, de: number, cor: string) => {
    const k = interpolate(t, [de, de + 0.6], [0, 1], { ...cl, easing: Easing.out(Easing.back(1.6)) });
    return (
      <div style={{ textAlign: "center", opacity: k, transform: `scale(${0.6 + 0.4 * k})` }}>
        <div style={{ width: 330, height: 330, borderRadius: 40, background: cor, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 190, color: "#fff", boxShadow: `0 0 60px ${cor}88` }}>{txt}</div>
        <div style={{ marginTop: 22, fontWeight: 900, fontSize: 40 }}>{sub}</div>
      </div>
    );
  };
  return (
    <Cena t={t} de={NOTA} ate={FECHO - 0.05}>
      <div style={{ position: "absolute", top: 300, left: 0, right: 0 }}>
        <Rotulo>E O JOGO?</Rotulo>
        <Grande tam={70}>NOTA NO METACRITIC</Grande>
      </div>
      <div style={{ position: "absolute", top: 640, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 80 }}>
        {selo("99", "GTA 6", em("99", NOTA) - 0.2, "#16A34A")}
        {selo("99", "ZELDA: OCARINA", zelda - 0.1, "#16A34A")}
      </div>
      <div style={{ position: "absolute", top: 1240, left: 0, right: 0, opacity: entra(t, em("mais", zelda) - 0.2) }}>
        <Grande tam={58} cor={AMARELO}>EMPATADO COM O MAIS</Grande>
        <Grande tam={58} cor={AMARELO}>BEM AVALIADO DA HISTÓRIA</Grande>
      </div>
    </Cena>
  );
};

const Fecho: React.FC<{ t: number }> = ({ t }) => (
  <Cena t={t} de={FECHO} ate={FINAL}>
    <div style={{ position: "absolute", top: 700, left: 0, right: 0 }}>
      <Grande tam={170}>7.886.402</Grande>
      <Grande tam={64} cor={AMARELO}>PESSOAS AO MESMO TEMPO</Grande>
    </div>
  </Cena>
);

// ---------- final: o Vyce DENTRO do GTA ----------
const boca = (f: number) => (dados.boca as number[])[f] ?? 0;
const pisca = (t: number) => {
  const c = t % 4.3;
  return c > 1.4 && c < 1.52;
};
const OPCOES: [string, string][] = [
  ["1", "ALANZOKA"],
  ["2", "PAULINHO O LOKO"],
  ["3", "DAVY JONES"],
  ["4", "OUTRO"],
];
const CORES = [TWITCH, YOUTUBE, YOUTUBE, KICK];
const VyceNoGta: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  if (t < FINAL - 0.2) return null;
  const k = suave(t, FINAL - 0.2, FINAL + 0.3);
  const fala = Math.sin(t * 5.5);
  const aponta = suave(t, em("quem", FINAL) - 0.2, em("quem", FINAL) + 0.1) * (1 - suave(t, em("você", FINAL + 1.2) - 0.1, em("você", FINAL + 1.2) + 0.2));
  const pose: PoseMascote = {
    bracoD: [-0.3 - 0.9 * aponta, 0, 0.35 + 0.12 * fala + 0.9 * aponta],
    bracoE: [-0.25, 0, -0.3 - 0.1 * Math.sin(t * 4.3)],
    cotoveloD: 0.9 - 0.6 * aponta,
    cotoveloE: 0.8,
    tronco: 0.03 * Math.sin(t * 2.4),
    cabeca: [0.04 * Math.sin(t * 3.1), 0.08 * Math.sin(t * 1.3), 0.04 * Math.sin(t * 2.2)],
  };
  const fov = (2 * Math.atan(1920 / 560 / 2 / 6) * 180) / Math.PI;
  return (
    <AbsoluteFill style={{ opacity: k }}>
      <Sequence from={Math.round((FINAL - 0.2) * FPS)} layout="none">
        <OffthreadVideo src={staticFile(ARQ("clipes/praia.mp4"))} startFrom={Math.round(3.0 * FPS)} muted style={{ position: "absolute", width: 1080, height: 1920, transform: `scale(${1.08 + 0.04 * suave(t, FINAL, FIM)})`, filter: "brightness(1.02)" }} />
      </Sequence>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.55) 0%, rgba(0,0,0,.1) 35%, rgba(0,0,0,0) 60%, rgba(0,0,0,.25) 100%)" }} />
      <AbsoluteFill style={{ filter: "contrast(1.04) saturate(0.95)" }}>
        <ThreeCanvas width={1080} height={1920} camera={{ fov, near: 0.05, far: 50 }} gl={{ toneMapping: THREE.ACESFilmicToneMapping, antialias: true, alpha: true }}>
          <Camera pos={[0, 1.2, 6]} alvo={[0, 1.05, 0]} />
          <hemisphereLight args={["#DCEBFF", "#C8B48C", 1.15]} />
          <directionalLight position={[-2, 5, 4]} intensity={2.3} color="#FFF6E6" />
          <directionalLight position={[2.5, 3, -2]} intensity={1.4} color="#FFE6C4" />
          <Mascote3D pos={[0.05, -0.62 * (1 - suave(t, FINAL - 0.1, FINAL + 0.35)) - 0.52, 0]} giro={-0.08 + 0.05 * Math.sin(t * 0.9)} pose={pose} boca={boca(f)} pisca={pisca(t)} olhar={0.6} sorriso />
        </ThreeCanvas>
      </AbsoluteFill>
      <div style={{ position: "absolute", top: 230, left: 70, right: 70, fontFamily, color: "#fff" }}>
        <div style={{ fontWeight: 800, fontSize: 32, letterSpacing: 8, color: "#E2C4FF", textShadow: "0 3px 14px rgba(0,0,0,.7)", opacity: entra(t, FINAL) }}>FALA AÍ</div>
        <div style={{ fontWeight: 900, fontSize: 84, lineHeight: 1, textShadow: "0 4px 20px rgba(0,0,0,.7)", opacity: entra(t, FINAL + 0.2) }}>VOCÊ TAVA</div>
        <div style={{ fontWeight: 900, fontSize: 84, lineHeight: 1, textShadow: "0 4px 20px rgba(0,0,0,.7)", opacity: entra(t, FINAL + 0.3) }}>VENDO QUEM?</div>
        <div style={{ marginTop: 20 }}>
          {OPCOES.map(([n, nome], i) => {
            const de = ENQ - 1.8 + i * 0.25;
            const kk = entra(t, de, 0.3);
            return (
              <div key={n} style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 12, opacity: kk, transform: `translateX(${(1 - kk) * -40}px)`, width: "fit-content", background: "rgba(10,6,20,.78)", borderLeft: `8px solid ${CORES[i]}`, borderRadius: 12, padding: "8px 22px 8px 16px" }}>
                <span style={{ fontWeight: 900, fontSize: 40, color: CORES[i] }}>{n}</span>
                <span style={{ fontWeight: 900, fontSize: 40 }}>{nome}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 110, left: 0, right: 0, textAlign: "center", fontFamily, fontWeight: 900, fontSize: 44, color: "#fff", textShadow: "0 3px 14px rgba(0,0,0,.8)", opacity: entra(t, em("fase", FINAL)) }}>FASE EXTRA · @faseextra.br</div>
    </AbsoluteFill>
  );
};

// ---------- legenda ----------
const DESTAQUE = /^(8|milhões|mesmo|tempo|história|brasil|topo|valorant|4|twitch|3|league|legends|youtube|kick|1|meia-noite|zelândia|brasileiros|alanzoka|300|mil|paulinho|loko|davy|jones|200|canais|recorde|99|zelda|quem|fase|extra|vyce|comenta)$/i;
const BLOCOS: Pal[][] = (() => {
  const b: Pal[][] = [];
  let c: Pal[] = [];
  PAL.forEach((p, i) => {
    c.push(p);
    const n = PAL[i + 1];
    if (c.length >= 3 || /[.,?!:]$/.test(p.w) || !n || n.s - p.e > 0.35) {
      b.push(c);
      c = [];
    }
  });
  return b;
})();
const Legenda: React.FC<{ t: number }> = ({ t }) => {
  const i = BLOCOS.findIndex((b, j) => t >= b[0].s - 0.05 && t < Math.min(BLOCOS[j + 1]?.[0].s ?? 999, b[b.length - 1].e + 0.5) - 0.05);
  if (i < 0) return null;
  if (t >= FINAL) return null; // no final o texto do Vyce já está na tela
  const topo = 1700;
  return (
    <div style={{ position: "absolute", top: topo, left: 60, right: 60, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 18px" }}>
      {BLOCOS[i].map((p, j) => (
        <span key={j} style={{ fontFamily, fontWeight: 900, fontSize: 56, lineHeight: 1.1, color: DESTAQUE.test(limpa(p.w)) ? AMARELO : "#fff", opacity: t >= p.s - 0.03 ? 1 : 0, WebkitTextStroke: "9px #000", paintOrder: "stroke fill" }}>
          {p.w.replace(/[.,:!]$/, "")}
        </span>
      ))}
    </div>
  );
};

// ---------- som: voz + efeitos leves (sem música, pedido em 19/11/2026) ----------
const TROCAS = [NUNCA, VAL, TW, YT, NZ, TOP, ALAN, KG, NOTA, FECHO, FINAL];
const tiques = (de: number, d: number) => Array.from({ length: Math.floor(d / 0.11) }, (_, i) => de + i * 0.11);
const SONS: [number, string, number][] = [
  ...tiques(0.1, 2.5).map((q) => [q, "tique", 0.07] as [number, string, number]),
  [2.7, "sino", 0.16],
  ...TROCAS.map((q) => [q - 0.05, "whoosh", 0.12] as [number, string, number]),
  [VAL + 0.4, "pop", 0.18],
  [em("gta", VAL), "pop", 0.2],
  [em("4", VAL) - 0.2, "sino", 0.15],
  ...tiques(TW + 0.2, 1.5).map((q) => [q, "tique", 0.06] as [number, string, number]),
  [em("virou", TW) - 0.2, "sino", 0.14],
  [YT - 0.2, "pop", 0.16],
  [YT + 0.1, "pop", 0.16],
  [KK - 0.1, "pop", 0.16],
  [NZ + 0.2, "pop", 0.15],
  [em("8", NZ) - 0.2, "pop", 0.15],
  [em("2", TOP), "pop", 0.18],
  [em("2", TOP) + 0.3, "pop", 0.16],
  [em("2", TOP) + 0.6, "pop", 0.18],
  [em("2", TOP) + 1.0, "sino", 0.15],
  [ALAN, "pop", 0.18],
  [em("paulinho", PD) - 0.1, "pop", 0.18],
  [em("davy", PD) - 0.1, "pop", 0.18],
  ...tiques(KG + 0.2, 2.3).map((q) => [q, "tique", 0.05] as [number, string, number]),
  [em("recorde", KG) - 0.2, "sino", 0.15],
  [em("99", NOTA) - 0.2, "pop", 0.2],
  [em("zelda", NOTA) - 0.1, "pop", 0.2],
  [FECHO - 0.7, "sobe", 0.12],
  [FECHO, "sino", 0.16],
];

export const VideoFase23: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  return (
    <AbsoluteFill style={{ background: "#07040F" }}>
      {t < FINAL + 0.4 && <Fundo t={t} />}
      <Gancho t={t} />
      <Maior t={t} />
      <Recorde t={t} />
      <Twitch t={t} />
      <Plataformas t={t} />
      <Fuso t={t} />
      <Podio t={t} />
      <Streamers t={t} />
      <Canais t={t} />
      <Nota t={t} />
      <Fecho t={t} />
      <VyceNoGta t={t} f={f} />
      <Legenda t={t} />
      <Audio src={staticFile(ARQ("narracao.wav"))} />
      {SONS.map(([q, nome, vol], i) => (
        <Sequence key={i} from={Math.max(0, Math.round(q * FPS))} durationInFrames={40}>
          <Audio src={staticFile(nome === "whoosh" ? "fase-extra/sons/whoosh.wav" : ARQ(`sfx-${nome}.wav`))} volume={vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
