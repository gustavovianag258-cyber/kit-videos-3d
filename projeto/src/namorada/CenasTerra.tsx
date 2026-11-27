import { Estrelas } from "../v2/mundo";
import { BRASIL, CHILE, Explosao, focar, Globo } from "./Globo";
import { CameraLenta, entre, lerp, Palco, suave, type PropsPlano } from "./comum";

// Planos no espaço: a Terra de longe, o Brasil, as placas, o recorde do Chile, os lasers e a explosão.

const [LAT_BR, LON_BR] = focar(BRASIL.lat, BRASIL.lon);
const [LAT_CL, LON_CL] = focar(CHILE.lat, CHILE.lon);

const Luzes: React.FC<{ quente?: number }> = ({ quente = 0 }) => (
  <>
    <ambientLight intensity={0.35} />
    <directionalLight position={[8, 4, 9]} intensity={2.6} color={quente > 0.5 ? "#ffd2a8" : "#ffffff"} />
    <directionalLight position={[-9, -2, -4]} intensity={0.5} color="#5d7cff" />
  </>
);

const Espaco: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Palco fundo="#02030a">
    <Estrelas raio={150} quantidade={2600} />
    {children}
  </Palco>
);

// 0–1 s: a Terra girando no escuro
export const PlanoEspaco: React.FC<PropsPlano> = ({ t, dur }) => (
  <Espaco>
    <Luzes />
    <CameraLenta de={[0, 0.3, 19]} para={[0, 0.2, 16.5]} alvo={[0, 0, 0]} x={t / dur} fov={38} />
    <Globo raio={3} giro={[0.25, LON_BR - 1.6 + t * 0.6]} />
  </Espaco>
);

// 1–2,5 s: zoom rápido na América do Sul; pulso rosa sobre o Brasil, como radar
export const PlanoZoomBrasil: React.FC<PropsPlano> = ({ t, dur }) => {
  const x = suave(entre(t, 0, 0.75));
  return (
    <Espaco>
      <Luzes />
      <CameraLenta de={[0, 0.2, 15.5]} para={[0, -0.6, 6.4]} alvo={[0, 0, 0]} alvoFim={[0, -0.7, 0]} x={entre(t, 0, dur)} fov={38} />
      <Globo raio={3} giro={[lerp(0.25, LAT_BR + 0.1, x), lerp(LON_BR - 1.0, LON_BR, x)]} brasil={entre(t, 0.35, 0.7) * (0.75 + 0.25 * Math.sin(t * 9))} tempo={t * 2.2} />
    </Espaco>
  );
};

// 21,6–23,8 s: a Terra de perto, rachando
export const PlanoTerraRacha: React.FC<PropsPlano> = ({ t, dur, s }) => (
  <Espaco>
    <Luzes />
    <CameraLenta de={[1.2, 0.6, 7.6]} para={[0.4, 0.2, 6.4]} alvo={[0, 0, 0]} x={t / dur} treme={0.012 + t * 0.02} s={s} fov={40} />
    <Globo raio={3} giro={[LAT_BR + 0.15, LON_BR + 0.35 - t * 0.12]} rachaduras={entre(t, 0.2, dur)} placas={entre(t, 0.8, dur) * 0.45} laranja={entre(t, 1, dur) * 0.15} />
  </Espaco>
);

// 23,8–27,3 s: placas acesas e ondas sísmicas saindo do Brasil (dois ângulos)
export const PlanoPlacas: React.FC<PropsPlano & { angulo: 0 | 1 }> = ({ t, dur, s, angulo }) => (
  <Espaco>
    <Luzes />
    {angulo === 0 ? (
      <CameraLenta de={[0, 0.5, 9]} para={[0, 0.3, 8]} alvo={[0, 0, 0]} x={t / dur} treme={0.05} s={s} fov={40} />
    ) : (
      <CameraLenta de={[-4.5, 4.2, 6.5]} para={[-3.6, 3.4, 5.6]} alvo={[0, -0.3, 0]} x={t / dur} treme={0.08} s={s} fov={40} />
    )}
    <Globo
      raio={3}
      giro={[LAT_BR + 0.05, LON_BR + (angulo ? -0.35 : 0.2) - t * 0.08]}
      placas={angulo ? 1 : entre(t, 0, 0.35)}
      rachaduras={0.8}
      laranja={0.15}
      ondas={1}
      tempo={(angulo ? 2.05 : 0) + t}
    />
  </Espaco>
);

// 27,3–28,3 s: magnitude 12 — tremor forte, ondas vermelhas
export const PlanoMagnitude: React.FC<PropsPlano> = ({ t, dur, s }) => (
  <Espaco>
    <Luzes quente={1} />
    <CameraLenta de={[0.8, 0.2, 7.2]} para={[0.5, 0.1, 6.4]} alvo={[0, 0, 0]} x={t / dur} treme={0.16} s={s} fov={40} />
    <Globo raio={3} giro={[LAT_BR, LON_BR + 0.1]} placas={1} rachaduras={1} laranja={0.3} ondas={1.4} ondasCor="#ff2020" tempo={3.5 + t * 1.5} />
  </Espaco>
);

// 28,3–31,8 s: o recorde anterior, no Chile (a câmera vai até lá)
export const PlanoRecorde: React.FC<PropsPlano & { perto: boolean }> = ({ t, dur, s, perto }) => {
  const x = suave(entre(t, 0, perto ? 0.6 : dur));
  const giro: [number, number] = perto ? [LAT_CL + 0.05, LON_CL] : [lerp(LAT_BR, LAT_CL, x * 0.7), lerp(LON_BR + 0.1, LON_CL, x * 0.7)];
  return (
    <Espaco>
      <Luzes />
      {perto ? (
        <CameraLenta de={[0.3, 0.2, 6.2]} para={[0.15, 0.1, 4.9]} alvo={[0, 0, 0]} x={t / dur} treme={0.02} s={s} fov={40} />
      ) : (
        <CameraLenta de={[0, 0.3, 8.4]} para={[-0.5, 0.2, 7.4]} alvo={[0, 0, 0]} x={t / dur} treme={0.05} s={s} fov={40} />
      )}
      <Globo raio={3} giro={giro} placas={0.75} rachaduras={0.6} laranja={0.12} alvoChile={entre(t, perto ? 0 : 1.2, perto ? 0.3 : dur)} tempo={t} />
    </Espaco>
  );
};

// 40,2–41,8 s: lasers de todos os sismógrafos convergindo no Brasil
export const PlanoLasers: React.FC<PropsPlano> = ({ t, dur, s }) => (
  <Espaco>
    <Luzes />
    <CameraLenta de={[-2.2, 1.6, 10.5]} para={[-0.8, 0.8, 9.6]} alvo={[0, -0.3, 0]} x={t / dur} treme={0.02} s={s} fov={42} />
    <Globo
      raio={3}
      giro={[LAT_BR - 0.05, LON_BR + 0.12 - t * 0.08]}
      lasers={entre(t, 0, 1.1) * 1.5}
      ondas={0.8}
      ondasCor="#ff2a2a"
      brasil={0.35}
      placas={0.35}
      tempo={t * 1.3}
    />
  </Espaco>
);

// 45–46 s: o planeta inteiro brilhando em laranja
export const PlanoTerraLaranja: React.FC<PropsPlano> = ({ t, dur, s }) => (
  <Espaco>
    <Luzes quente={1} />
    <CameraLenta de={[0, 0.2, 9.4]} para={[0, 0.1, 8.2]} alvo={[0, 0, 0]} x={t / dur} treme={0.03 + t * 0.12} s={s} fov={40} />
    <Globo raio={3} giro={[LAT_BR, LON_BR + 0.3 - t * 0.2]} placas={1} rachaduras={1} laranja={0.4 + t * 0.6} ondas={1} tempo={t * 2} />
  </Espaco>
);

// 46,1–47,6 s: explode
export const PlanoExplosao: React.FC<PropsPlano> = ({ t, dur, s }) => (
  <Espaco>
    <ambientLight intensity={0.6} />
    <pointLight position={[0, 0, 0]} intensity={60 * Math.max(0, 1 - t * 0.7)} color="#ff8a3d" decay={1.2} />
    <directionalLight position={[8, 4, 9]} intensity={1.5} />
    <CameraLenta de={[0, 0.3, 11]} para={[0, 0.2, 13]} alvo={[0, 0, 0]} x={t / dur} treme={Math.max(0, 0.35 - t * 0.3)} s={s} fov={42} />
    <Explosao raio={3} t={t} />
  </Espaco>
);

// 47,6–49,3 s: corte seco — a Terra inteira e calma de novo
export const PlanoTerraCalma: React.FC<PropsPlano> = ({ t, dur }) => (
  <Espaco>
    <Luzes />
    <CameraLenta de={[0, 0.3, 9.6]} para={[0, 0.2, 8.4]} alvo={[0, 0, 0]} x={t / dur} fov={38} />
    <Globo raio={3} giro={[LAT_BR + 0.05, LON_BR + 0.4 - t * 0.12]} />
  </Espaco>
);
