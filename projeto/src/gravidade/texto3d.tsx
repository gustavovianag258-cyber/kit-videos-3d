import { loadFont as carregarAnton } from "@remotion/google-fonts/Anton";
import { loadFont as carregarMontserrat } from "@remotion/google-fonts/Montserrat";
import { interpolate, spring } from "remotion";
import { clamp, FPS } from "./tempo";

// Texto com cara de 3D: letras grossas com "espessura" (camadas de sombra deslocadas),
// palavras que entram girando uma a uma e um balanço leve contínuo.

export const FONTE_TITULO = carregarAnton("normal", { weights: ["400"], subsets: ["latin", "latin-ext"] }).fontFamily;
export const FONTE_TEXTO = carregarMontserrat("normal", { weights: ["700", "800", "900"], subsets: ["latin"] }).fontFamily;

export const AMARELO = "#ffd23f";
export const AMARELO_FUNDO = "#b85c00";
export const BRANCO_FUNDO = "#39404f";

// Espessura das letras: n camadas empilhadas na direção (dx, dy) + sombra no chão
export const extrusao = (cor: string, n = 9, dx = 0.35, dy = 1.1) => {
  const camadas = Array.from({ length: n }, (_, i) => `${(dx * (i + 1)).toFixed(2)}px ${(dy * (i + 1)).toFixed(2)}px 0 ${cor}`);
  camadas.push(`${(dx * n).toFixed(1)}px ${(dy * n + 10).toFixed(1)}px 24px rgba(0,0,0,0.6)`);
  return camadas.join(", ");
};

// Mesma ideia para caixas (placas, botões)
export const extrusaoCaixa = (cor: string, n = 10) =>
  [...Array.from({ length: n }, (_, i) => `0 ${i + 1}px 0 ${cor}`), `0 ${n + 14}px 30px rgba(0,0,0,0.55)`].join(", ");

type Palavra = { t: string; destaque: boolean };

// "metade da gravidade = **metade do peso**" → palavras, com destaque no trecho entre **
export const separarPalavras = (texto: string): Palavra[] =>
  texto.split("**").flatMap((trecho, i) =>
    trecho
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((t) => ({ t, destaque: i % 2 === 1 })),
  );

// Balanço contínuo do bloco de texto (graus), com a espessura acompanhando o giro
export const balanco = (segundos: number, forca = 1) => ({
  rotY: Math.sin(segundos * 1.25) * 7 * forca,
  rotX: 8 + Math.sin(segundos * 0.9 + 1) * 3 * forca,
});

export const Palavras3D: React.FC<{
  texto: string;
  // segundos desde que o texto entrou e quanto tempo ele fica
  t: number;
  duracao: number;
  tamanho?: number;
  largura?: number;
  maiusculas?: boolean;
}> = ({ texto, t, duracao, tamanho = 92, largura = 920, maiusculas = true }) => {
  const f = t * FPS;
  const { rotY, rotX } = balanco(t);
  const dx = -rotY * 0.09;
  const saida = interpolate(t, [duracao - 0.28, duracao], [0, 1], clamp);
  const lista = separarPalavras(maiusculas ? texto.toUpperCase() : texto);

  return (
    <div style={{ perspective: 1100, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          maxWidth: largura,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "baseline",
          columnGap: tamanho * 0.32,
          rowGap: tamanho * 0.02,
          transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
          transformStyle: "preserve-3d",
        }}
      >
        {lista.map((p, i) => {
          // Cada palavra entra 2,5 quadros depois da anterior, virando de baixo para cima
          const e = spring({ frame: f - i * 2.5, fps: FPS, config: { damping: 14, stiffness: 170, mass: 0.8 } });
          // Palavra-chave dá um "soco" de escala logo depois de entrar
          const soco = p.destaque ? interpolate(f - i * 2.5, [6, 10, 16], [1, 1.14, 1], clamp) : 1;
          const s = saida;
          const simbolo = /^[=×→+<>·]$/.test(p.t);
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                fontFamily: FONTE_TITULO,
                fontSize: p.destaque ? tamanho * 1.12 : simbolo ? tamanho * 0.9 : tamanho,
                lineHeight: 1.04,
                color: p.destaque ? AMARELO : "#ffffff",
                textShadow: extrusao(p.destaque ? AMARELO_FUNDO : BRANCO_FUNDO, p.destaque ? 10 : 8, dx, 1.1),
                opacity: Math.min(1, e * 1.6) * (1 - s),
                transformOrigin: "50% 100%",
                transform: [
                  `translateY(${(1 - e) * 70 - s * 40}px)`,
                  `rotateX(${(1 - e) * -95 + s * 70}deg)`,
                  `scale(${(0.55 + 0.45 * e) * soco})`,
                ].join(" "),
              }}
            >
              {p.t}
            </span>
          );
        })}
      </div>
    </div>
  );
};
