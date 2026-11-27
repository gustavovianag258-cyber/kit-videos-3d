import { loadFont as carregarJakarta } from "@remotion/google-fonts/PlusJakartaSans";

// MOTOR 2D "OLHO-DE-PEIXE" (estilo das referências da série do alerta): o cenário é feito de
// polígonos em perspectiva de verdade, passados por uma lente olho-de-peixe (equidistante), com cor
// chapada e contorno grosso. Bonecos são recortes 2D desenhados em SVG presos a pontos do mundo.
// Mundo em metros, y para cima. Câmera: posição, giro (yaw) e inclinação (pitch).

// fontes (pedido do usuário: trocar por fontes melhores): falas em Montserrat extra-negrito (como nas
// referências), títulos em Bebas Neue, narrador em máquina de escrever (cara de relatório sinistro)
// escolhida pelo usuário em 09/11/2026 (opção C): Plus Jakarta Sans em tudo, sombra suave, sem contorno duro
export const FONTE_FORTE = carregarJakarta("normal", { weights: ["500", "700", "800"], subsets: ["latin", "latin-ext"] }).fontFamily;
carregarJakarta("italic", { weights: ["500", "700"], subsets: ["latin", "latin-ext"] });
export const FONTE_TITULO = FONTE_FORTE;
export const FONTE_NARRA = FONTE_FORTE;
export const SOMBRA_SUAVE = "0 2px 4px rgba(0,0,0,0.55), 0 6px 24px rgba(0,0,0,0.75)";

export type V3 = [number, number, number];
export type Cam = { pos: V3; yaw: number; pitch: number; k?: number };

const W = 1080;
const H = 1920;
const LIM = 1.62; // além disso o ponto já está fora da tela (canto da tela ≈ 1,53 rad)
const ATRAS = 2.75; // ponto quase atrás da câmera: aí a lente dobra e não dá para desenhar

export const proj = (c: Cam, p: V3) => {
  const vx = p[0] - c.pos[0];
  const vy = p[1] - c.pos[1];
  const vz = p[2] - c.pos[2];
  const cy = Math.cos(c.yaw);
  const sy = Math.sin(c.yaw);
  const x1 = vx * cy - vz * sy;
  const z1 = vx * sy + vz * cy;
  const cp = Math.cos(c.pitch);
  const sp = Math.sin(c.pitch);
  const y2 = vy * cp - z1 * sp;
  const z2 = vy * sp + z1 * cp;
  const d = Math.hypot(x1, y2, z2) || 1e-6;
  const th = Math.acos(Math.max(-1, Math.min(1, z2 / d)));
  const ph = Math.atan2(y2, x1);
  const r = (c.k ?? 720) * th;
  return { x: W / 2 + r * Math.cos(ph), y: H / 2 - r * Math.sin(ph), th, d };
};

const mix = (a: V3, b: V3, t: number): V3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const bil = (q: V3[], u: number, v: number): V3 => mix(mix(q[0], q[1], u), mix(q[3], q[2], u), v);

export const escurece = (hex: string, f: number) => {
  const n = parseInt(hex.slice(1), 16);
  const c = (s: number) => Math.max(0, Math.min(255, Math.round(((n >> s) & 255) * f)));
  return `#${((1 << 24) | (c(16) << 16) | (c(8) << 8) | c(0)).toString(16).slice(1)}`;
};

export type Prim = { q: V3[]; cor: string; borda?: boolean[]; tam?: number; xadrez?: string; liso?: boolean; tinta?: string; fino?: boolean; brilha?: boolean };

// retângulo no mundo (4 cantos em sequência)
export const quad = (a: V3, b: V3, c: V3, d: V3, cor: string, extra: Partial<Prim> = {}): Prim => ({ q: [a, b, c, d], cor, ...extra });

// caixa com centro, tamanho (l, a, p) e giro: 6 faces
export const caixa = (c: V3, t: V3, cor: string, giro = 0, extra: Partial<Prim> = {}): Prim[] => {
  const [hx, hy, hz] = [t[0] / 2, t[1] / 2, t[2] / 2];
  const cs = Math.cos(giro);
  const sn = Math.sin(giro);
  const pt = (x: number, y: number, z: number): V3 => [c[0] + x * cs + z * sn, c[1] + y, c[2] - x * sn + z * cs];
  const f = (a: V3, b: V3, cc: V3, d: V3, k: number) => quad(a, b, cc, d, escurece(cor, k), { borda: [true, true, true, true], ...extra });
  return [
    f(pt(-hx, -hy, hz), pt(hx, -hy, hz), pt(hx, hy, hz), pt(-hx, hy, hz), 1),
    f(pt(hx, -hy, -hz), pt(-hx, -hy, -hz), pt(-hx, hy, -hz), pt(hx, hy, -hz), 0.8),
    f(pt(hx, -hy, hz), pt(hx, -hy, -hz), pt(hx, hy, -hz), pt(hx, hy, hz), 0.88),
    f(pt(-hx, -hy, -hz), pt(-hx, -hy, hz), pt(-hx, hy, hz), pt(-hx, hy, -hz), 0.74),
    f(pt(-hx, hy, hz), pt(hx, hy, hz), pt(hx, hy, -hz), pt(-hx, hy, -hz), 1.12),
    f(pt(-hx, -hy, -hz), pt(hx, -hy, -hz), pt(hx, -hy, hz), pt(-hx, -hy, hz), 0.6),
  ];
};

type Tile = { q: V3[]; cor: string; borda: boolean[]; dist: number; tinta: string; fino?: boolean; brilha?: boolean };

const tiles = (c: Cam, prims: Prim[]): Tile[] => {
  const out: Tile[] = [];
  for (const p of prims) {
    const L = (a: V3, b: V3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
    const tam = p.tam ?? 1.2;
    const nu = Math.max(1, Math.ceil(L(p.q[0], p.q[1]) / tam));
    const nv = Math.max(1, Math.ceil(L(p.q[0], p.q[3]) / tam));
    for (let i = 0; i < nu; i++)
      for (let j = 0; j < nv; j++) {
        const q = [bil(p.q, i / nu, j / nv), bil(p.q, (i + 1) / nu, j / nv), bil(p.q, (i + 1) / nu, (j + 1) / nv), bil(p.q, i / nu, (j + 1) / nv)];
        const bd = p.borda ?? [false, false, false, false];
        const borda = [bd[0] && j === 0, bd[1] && i === nu - 1, bd[2] && j === nv - 1, bd[3] && i === 0];
        const cm = mix(mix(q[0], q[1], 0.5), mix(q[3], q[2], 0.5), 0.5);
        const cor = p.xadrez && (i + j) % 2 ? p.xadrez : p.cor;
        out.push({ q, cor, borda, dist: Math.hypot(cm[0] - c.pos[0], cm[1] - c.pos[1], cm[2] - c.pos[2]), tinta: p.tinta ?? "#17130f", fino: p.fino, brilha: p.brilha });
      }
  }
  return out.sort((a, b) => b.dist - a.dist);
};

// objetos (bonecos) entram na mesma ordem de profundidade dos polígonos
// vies: quanto (m) o objeto é tratado como mais perto da câmera (texto colado em parede, por exemplo)
export type Objeto = { pos: V3; no: React.ReactNode; vies?: number };
// névoa escura: o que está longe da câmera vai apagando (pegada sombria); o que brilha (céu,
// lâmpada, tela) fica de fora
export type Nevoa = { perto: number; longe: number; min: number };
const fatorNevoa = (n: Nevoa | undefined, d: number) => (n ? Math.max(n.min, Math.min(1, 1 - ((d - n.perto) / (n.longe - n.perto)) * (1 - n.min))) : 1);
export const Cenario: React.FC<{ cam: Cam; prims: Prim[]; espessura?: number; objetos?: Objeto[]; linhas?: V3[][]; nevoa?: Nevoa }> = ({ cam, prims, espessura = 7, objetos = [], linhas = [], nevoa }) => {
  const ts = tiles(cam, prims);
  const dist = (p: V3) => Math.hypot(p[0] - cam.pos[0], p[1] - cam.pos[1], p[2] - cam.pos[2]);
  // linhas finas viram pedacinhos de até 0,8 m, cada um na sua profundidade (um pouco "à frente"
  // da parede onde está, para não sumir atrás dela)
  const pedacos: { d: number; no: React.ReactNode }[] = [];
  const presas = new Map<Tile, React.ReactNode[]>();
  const planos = ts.map((t) => {
    const u: V3 = [t.q[1][0] - t.q[0][0], t.q[1][1] - t.q[0][1], t.q[1][2] - t.q[0][2]];
    const v: V3 = [t.q[3][0] - t.q[0][0], t.q[3][1] - t.q[0][1], t.q[3][2] - t.q[0][2]];
    const nx = u[1] * v[2] - u[2] * v[1];
    const ny = u[2] * v[0] - u[0] * v[2];
    const nz = u[0] * v[1] - u[1] * v[0];
    const nl = Math.hypot(nx, ny, nz) || 1;
    return { t, o: t.q[0], u, v, uu: u[0] * u[0] + u[1] * u[1] + u[2] * u[2], vv: v[0] * v[0] + v[1] * v[1] + v[2] * v[2], n: [nx / nl, ny / nl, nz / nl] as V3 };
  });
  // a mais perto da câmera entre as que contêm o ponto (a da frente, se houver duas)
  const dono = (p: V3) => {
    let melhor: Tile | null = null;
    for (let i = planos.length - 1; i >= 0; i--) {
      const pl = planos[i];
      const w: V3 = [p[0] - pl.o[0], p[1] - pl.o[1], p[2] - pl.o[2]];
      if (Math.abs(w[0] * pl.n[0] + w[1] * pl.n[1] + w[2] * pl.n[2]) > 0.06) continue;
      const a = (w[0] * pl.u[0] + w[1] * pl.u[1] + w[2] * pl.u[2]) / pl.uu;
      const b = (w[0] * pl.v[0] + w[1] * pl.v[1] + w[2] * pl.v[2]) / pl.vv;
      if (a >= -0.001 && a <= 1.001 && b >= -0.001 && b <= 1.001) {
        melhor = pl.t;
        break;
      }
    }
    return melhor;
  };
  linhas.forEach((l, li) =>
    l.slice(0, -1).forEach((a, si) => {
      const b = l[si + 1];
      const n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]) / 0.8));
      for (let k = 0; k < n; k++) {
        const p0 = mix(a, b, k / n);
        const p1 = mix(a, b, (k + 1) / n);
        const pts: string[] = [];
        for (let s = 0; s <= 4; s++) {
          const pr = proj(cam, mix(p0, p1, s / 4));
          if (pr.th < ATRAS) pts.push(`${pr.x.toFixed(1)} ${pr.y.toFixed(1)}`);
        }
        if (pts.length > 1) {
          const meio = mix(p0, p1, 0.5);
          const no = <path key={`${li}-${si}-${k}`} d={`M${pts.join("L")}`} fill="none" stroke="#17130f" strokeWidth={3} opacity={0.5} />;
          const t = dono(meio);
          if (t) {
            if (!presas.has(t)) presas.set(t, []);
            presas.get(t)!.push(no);
          } else pedacos.push({ d: dist(meio) - 0.15, no });
        }
      }
    }),
  );
  const obs = [
    ...objetos.map((o) => {
      const d = dist(o.pos);
      const f = fatorNevoa(nevoa, d);
      return { d: d - (o.vies ?? 0), no: f < 0.99 ? <g style={{ filter: `brightness(${f.toFixed(2)})` }}>{o.no}</g> : o.no };
    }),
    ...pedacos,
  ].sort((a, b) => b.d - a.d);
  const lista: ({ tile: Tile } | { obj: React.ReactNode })[] = [];
  let k = 0;
  for (const t of ts) {
    while (k < obs.length && obs[k].d > t.dist) lista.push({ obj: obs[k++].no });
    lista.push({ tile: t });
  }
  while (k < obs.length) lista.push({ obj: obs[k++].no });
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      {lista.map((item, n) => {
        if ("obj" in item) return <g key={n}>{item.obj}</g>;
        const t = item.tile;
        const cor = t.brilha ? t.cor : escurece(t.cor, fatorNevoa(nevoa, t.dist));
        let d = "";
        const SUB = t.dist < 1.6 ? 9 : t.dist < 3 ? 6 : t.dist < 6 ? 4 : 3;
        let dentro = false;
        let atras = false;
        const grade: { x: number; y: number }[][] = [];
        for (let a = 0; a <= SUB; a++) {
          grade[a] = [];
          for (let b = 0; b <= SUB; b++) {
            const pr = proj(cam, bil(t.q, a / SUB, b / SUB));
            if (pr.th < LIM) dentro = true;
            if (pr.th > ATRAS) atras = true;
            grade[a][b] = pr;
          }
        }
        if (!dentro || atras) return null;
        for (let a = 0; a < SUB; a++)
          for (let b = 0; b < SUB; b++) {
            const p = [grade[a][b], grade[a + 1][b], grade[a + 1][b + 1], grade[a][b + 1]];
            d += `M${p.map((z) => `${z.x.toFixed(1)} ${z.y.toFixed(1)}`).join("L")}Z`;
          }
        const arestas: string[] = [];
        const pegar = (k: number) => {
          const ps: { x: number; y: number }[] = [];
          for (let s = 0; s <= SUB; s++) ps.push(k === 0 ? grade[s][0] : k === 1 ? grade[SUB][s] : k === 2 ? grade[SUB - s][SUB] : grade[0][SUB - s]);
          return ps;
        };
        t.borda.forEach((on, k) => {
          if (on) arestas.push(`M${pegar(k).map((z) => `${z.x.toFixed(1)} ${z.y.toFixed(1)}`).join("L")}`);
        });
        return (
          <g key={n}>
            <path d={d} fill={cor} stroke={cor} strokeWidth={1.6} />
            {arestas.length > 0 && <path d={arestas.join("")} fill="none" stroke={t.tinta} strokeWidth={t.fino ? espessura * 0.5 : espessura} />}
            {presas.get(t)}
          </g>
        );
      })}
    </g>
  );
};

// linhas finas no mundo (rejunte, moldura, listras), com curvatura da lente
export const Linhas: React.FC<{ cam: Cam; linhas: V3[][]; cor?: string; larg?: number; opacidade?: number }> = ({ cam, linhas, cor = "#17130f", larg = 3, opacidade = 0.5 }) => (
  <g fill="none" stroke={cor} strokeWidth={larg} opacity={opacidade} strokeLinecap="round">
    {linhas.map((l, i) => {
      const pts: string[] = [];
      for (let s = 0; s < l.length - 1; s++)
        for (let k = 0; k <= 8; k++) {
          const pr = proj(cam, mix(l[s], l[s + 1], k / 8));
          if (pr.th < ATRAS) pts.push(`${pr.x.toFixed(1)} ${pr.y.toFixed(1)}`);
        }
      return pts.length > 1 ? <path key={i} d={`M${pts.join("L")}`} /> : null;
    })}
  </g>
);

// ---------- bonecos 2D (recortes) ----------
export type Estilo = {
  pele: string;
  cabelo: string;
  roupa: string;
  calca: string;
  penteado?: "curto" | "coque" | "trancas" | "careca" | "bone" | "longo";
  barba?: boolean;
  avental?: string;
  oculos?: boolean;
  mochila?: string; // mochila de entrega (cor)
  tenis?: string;
  estampa?: string; // faixa/listra na camisa
  bermuda?: boolean;
};
export type Pose = "parado" | "celular" | "susto" | "ceu" | "sentado" | "costas" | "sombra" | "calmo";

// Boneco 2D de recorte, preso aos pés no mundo (sempre de frente ou de costas pra câmera).
// Unidade interna: altura 1 = altura da pessoa; pés em y = 0, cabeça em y ≈ −1.
// tela: cor da tela do celular acesa (alerta), com brilho no rosto
export const Pessoa: React.FC<{ cam: Cam; pos: V3; altura?: number; estilo: Estilo; pose?: Pose; esp?: number; t?: number; tela?: string }> = ({ cam, pos, altura = 1.72, estilo, pose = "parado", esp = 5, t = 0, tela }) => {
  const pe = proj(cam, pos);
  const cab = proj(cam, [pos[0], pos[1] + altura, pos[2]]);
  if ((pe.th > LIM && cab.th > LIM) || pe.th > ATRAS || cab.th > ATRAS) return null;
  const h = Math.hypot(cab.x - pe.x, cab.y - pe.y);
  const ang = (Math.atan2(cab.x - pe.x, -(cab.y - pe.y)) * 180) / Math.PI;
  const sombra = pose === "sombra";
  const T = sombra ? "#000" : "#17130f";
  const pele = sombra ? "#14141a" : estilo.pele;
  const roupa = sombra ? "#101016" : estilo.roupa;
  const calca = sombra ? "#0d0d12" : estilo.calca;
  const cabelo = sombra ? "#0b0b0f" : estilo.cabelo;
  const tenis = sombra ? "#0b0b0f" : estilo.tenis ?? "#f4f4f2";
  const costas = pose === "costas";
  const sent = pose === "sentado";
  const ceu = pose === "ceu";
  const VE = { vectorEffect: "non-scaling-stroke" as const };
  const piscou = !ceu && !sombra && pose !== "calmo" && ((t * 0.7 + pos[0] * 0.37) % 3.2) < 0.12;
  // braços: [ombro → cotovelo → mão]
  const bracos: [number, number][][] =
    pose === "susto"
      ? [[[-0.11, -0.76], [-0.21, -0.82], [-0.2, -0.97]], [[0.11, -0.76], [0.21, -0.82], [0.2, -0.97]]]
      : pose === "celular"
        ? [[[-0.11, -0.76], [-0.16, -0.62], [-0.13, -0.48]], [[0.11, -0.76], [0.13, -0.64], [0.05, -0.64]]]
        : sent
          ? [[[-0.11, -0.76], [-0.15, -0.6], [-0.08, -0.52]], [[0.11, -0.76], [0.15, -0.6], [0.08, -0.52]]]
          : [[[-0.11, -0.76], [-0.15, -0.6], [-0.135, -0.46]], [[0.11, -0.76], [0.15, -0.6], [0.135, -0.46]]];
  const caminho = (b: [number, number][]) => `M${b[0][0]} ${b[0][1]} Q${b[1][0]} ${b[1][1]} ${b[2][0]} ${b[2][1]}`;
  const olhoY = ceu ? -0.958 : -0.935;
  const pupY = ceu ? -0.966 : -0.932;
  return (
    <g transform={`translate(${pe.x} ${pe.y}) rotate(${ang}) scale(${h})`} stroke={T} strokeWidth={esp} strokeLinejoin="round" strokeLinecap="round">
      {/* mochila de entrega aparecendo dos lados */}
      {estilo.mochila && !costas && <rect x={-0.15} y={-0.84} width={0.3} height={0.32} rx={0.02} fill={sombra ? "#0b0b0f" : estilo.mochila} {...VE} />}
      {/* pernas e tênis */}
      {sent ? (
        <>
          <rect x={-0.1} y={-0.44} width={0.09} height={0.12} rx={0.03} fill={calca} {...VE} />
          <rect x={0.01} y={-0.44} width={0.09} height={0.12} rx={0.03} fill={calca} {...VE} />
        </>
      ) : (
        <>
          <rect x={-0.1} y={-0.47} width={0.085} height={0.45} rx={0.03} fill={calca} {...VE} />
          <rect x={0.015} y={-0.47} width={0.085} height={0.45} rx={0.03} fill={calca} {...VE} />
          {estilo.bermuda && !sombra && (
            <>
              <rect x={-0.093} y={-0.22} width={0.07} height={0.2} rx={0.02} fill={pele} {...VE} />
              <rect x={0.022} y={-0.22} width={0.07} height={0.2} rx={0.02} fill={pele} {...VE} />
            </>
          )}
          <path d="M-0.115 -0.005 Q-0.12 -0.05 -0.06 -0.05 Q-0.02 -0.05 -0.015 -0.005 Z" fill={tenis} {...VE} />
          <path d="M0.115 -0.005 Q0.12 -0.05 0.06 -0.05 Q0.02 -0.05 0.015 -0.005 Z" fill={tenis} {...VE} />
        </>
      )}
      {/* tronco */}
      <path d="M-0.125 -0.74 Q-0.125 -0.8 -0.07 -0.8 L0.07 -0.8 Q0.125 -0.8 0.125 -0.74 L0.12 -0.43 L-0.12 -0.43 Z" fill={roupa} {...VE} />
      {estilo.estampa && !sombra && <rect x={-0.12} y={-0.66} width={0.24} height={0.05} fill={estilo.estampa} stroke="none" />}
      {!sombra && <path d="M-0.12 -0.47 L0.12 -0.47" stroke={T} strokeWidth={esp * 0.6} fill="none" {...VE} />}
      {!costas && !sombra && <path d="M-0.04 -0.8 L0 -0.76 L0.04 -0.8" fill="none" strokeWidth={esp * 0.7} {...VE} />}
      {estilo.avental && !sombra && <path d="M-0.09 -0.66 L0.09 -0.66 L0.1 -0.4 L-0.1 -0.4 Z" fill={estilo.avental} {...VE} />}
      {estilo.mochila && costas && <rect x={-0.13} y={-0.82} width={0.26} height={0.3} rx={0.02} fill={estilo.mochila} {...VE} />}
      {/* braços (manga + pele) e mãos */}
      {bracos.map((b, i) => (
        <g key={i}>
          <path d={caminho(b)} stroke={T} strokeWidth={esp * 3.2} fill="none" {...VE} />
          <path d={caminho(b)} stroke={pele} strokeWidth={esp * 2.1} fill="none" {...VE} />
          <path d={`M${b[0][0]} ${b[0][1]} L${b[0][0] + (b[1][0] - b[0][0]) * 0.45} ${b[0][1] + (b[1][1] - b[0][1]) * 0.45}`} stroke={roupa} strokeWidth={esp * 2.6} fill="none" {...VE} />
          <circle cx={b[2][0]} cy={b[2][1]} r={0.027} fill={pele} {...VE} />
        </g>
      ))}
      {pose === "celular" && (
        <>
          {tela && <ellipse cx={0.05} cy={-0.8} rx={0.16} ry={0.2} fill={tela} opacity={0.22} stroke="none" />}
          <rect x={0.02} y={-0.72} width={0.065} height={0.1} rx={0.012} fill="#2a2d33" {...VE} />
          {tela && <rect x={0.028} y={-0.712} width={0.049} height={0.084} rx={0.006} fill={tela} stroke="none" />}
        </>
      )}
      {/* pescoço e cabeça */}
      <rect x={-0.03} y={-0.86} width={0.06} height={0.08} fill={pele} {...VE} />
      <g transform={ceu ? "rotate(-14 0 -0.92)" : ""}>
        <ellipse cx={-0.088} cy={-0.925} rx={0.018} ry={0.026} fill={pele} {...VE} />
        <ellipse cx={0.088} cy={-0.925} rx={0.018} ry={0.026} fill={pele} {...VE} />
        <ellipse cx={0} cy={-0.93} rx={0.085} ry={0.1} fill={pele} {...VE} />
        {/* cabelo */}
        {estilo.penteado === "longo" && <path d="M-0.095 -0.95 Q-0.12 -0.8 -0.1 -0.74 L0.1 -0.74 Q0.12 -0.8 0.095 -0.95 Z" fill={cabelo} {...VE} />}
        {estilo.penteado !== "careca" && (
          <path
            d={costas ? "M-0.09 -0.93 Q-0.095 -1.04 0 -1.04 Q0.095 -1.04 0.09 -0.93 Q0.08 -0.85 0 -0.85 Q-0.08 -0.85 -0.09 -0.93 Z" : "M-0.092 -0.95 Q-0.1 -1.05 0 -1.045 Q0.1 -1.05 0.092 -0.95 Q0.05 -1.0 0 -0.985 Q-0.05 -1.0 -0.092 -0.95 Z"}
            fill={cabelo}
            {...VE}
          />
        )}
        {estilo.penteado === "careca" && !costas && <path d="M-0.085 -0.92 Q-0.09 -0.88 -0.08 -0.86 M0.085 -0.92 Q0.09 -0.88 0.08 -0.86" stroke={cabelo} strokeWidth={esp * 1.4} fill="none" {...VE} />}
        {estilo.penteado === "bone" && (
          <>
            <path d="M-0.092 -0.95 Q-0.1 -1.06 0 -1.06 Q0.1 -1.06 0.092 -0.95 Z" fill={sombra ? "#0b0b0f" : "#1d4e89"} {...VE} />
            {!costas && <path d="M-0.06 -0.955 L0.13 -0.955 Q0.12 -0.93 0.06 -0.935 Z" fill={sombra ? "#0b0b0f" : "#1d4e89"} {...VE} />}
          </>
        )}
        {estilo.penteado === "coque" && <circle cx={0} cy={-1.07} r={0.04} fill={cabelo} {...VE} />}
        {estilo.penteado === "trancas" && (
          <>
            <path d="M-0.09 -0.95 L-0.11 -0.76" stroke={cabelo} fill="none" strokeWidth={esp * 1.8} {...VE} />
            <path d="M0.09 -0.95 L0.11 -0.76" stroke={cabelo} fill="none" strokeWidth={esp * 1.8} {...VE} />
          </>
        )}
        {estilo.barba && !costas && <path d="M-0.075 -0.92 Q-0.07 -0.83 0 -0.825 Q0.07 -0.83 0.075 -0.92 Q0.04 -0.88 0 -0.88 Q-0.04 -0.88 -0.075 -0.92 Z" fill={cabelo} {...VE} />}
        {/* rosto */}
        {!costas && !sombra && (
          <g>
            {piscou ? (
              <>
                <path d="M-0.05 -0.935 L-0.014 -0.935" strokeWidth={esp * 0.8} fill="none" {...VE} />
                <path d="M0.014 -0.935 L0.05 -0.935" strokeWidth={esp * 0.8} fill="none" {...VE} />
              </>
            ) : (
              <g stroke="none">
                <ellipse cx={-0.032} cy={olhoY} rx={0.019} ry={0.025} fill="#fff" />
                <ellipse cx={0.032} cy={olhoY} rx={0.019} ry={0.025} fill="#fff" />
                <circle cx={-0.03} cy={pupY} r={0.01} fill="#17130f" />
                <circle cx={0.034} cy={pupY} r={0.01} fill="#17130f" />
              </g>
            )}
            <path d={`M-0.055 ${olhoY - 0.04} Q-0.032 ${olhoY - (pose === "susto" ? 0.065 : 0.05)} -0.012 ${olhoY - 0.04}`} stroke={cabelo} strokeWidth={esp * 0.9} fill="none" {...VE} />
            <path d={`M0.012 ${olhoY - 0.04} Q0.032 ${olhoY - (pose === "susto" ? 0.065 : 0.05)} 0.055 ${olhoY - 0.04}`} stroke={cabelo} strokeWidth={esp * 0.9} fill="none" {...VE} />
            <path d="M0 -0.925 Q0.012 -0.9 -0.004 -0.895" strokeWidth={esp * 0.6} fill="none" {...VE} />
            {pose === "calmo" ? <path d="M-0.04 -0.878 Q0 -0.84 0.04 -0.878 Q0 -0.862 -0.04 -0.878 Z" fill="#fff" strokeWidth={esp * 0.7} {...VE} /> : pose === "susto" || ceu ? <ellipse cx={0} cy={-0.868} rx={0.016} ry={0.02} fill="#5a1e1e" {...VE} /> : <path d="M-0.022 -0.87 Q0 -0.858 0.022 -0.87" strokeWidth={esp * 0.7} fill="none" {...VE} />}
            {estilo.oculos && (
              <g fill="none" strokeWidth={esp * 0.7}>
                <circle cx={-0.032} cy={-0.935} r={0.03} {...VE} />
                <circle cx={0.032} cy={-0.935} r={0.03} {...VE} />
                <path d="M-0.002 -0.935 L0.002 -0.935" {...VE} />
              </g>
            )}
          </g>
        )}
        {sombra && (
          <g stroke="none">
            <ellipse cx={-0.032} cy={-0.955} rx={0.012} ry={0.018} fill="#fff" />
            <ellipse cx={0.032} cy={-0.955} rx={0.012} ry={0.018} fill="#fff" />
          </g>
        )}
      </g>
    </g>
  );
};

// Vira-lata deitado (recorte 2D, de lado)
export const Cachorro: React.FC<{ cam: Cam; pos: V3; t?: number; cor?: string }> = ({ cam, pos, t = 0, cor = "#c98a4b" }) => {
  const a = proj(cam, pos);
  const b = proj(cam, [pos[0], pos[1] + 0.5, pos[2]]);
  if (a.th > LIM && b.th > LIM) return null;
  const h = Math.hypot(b.x - a.x, b.y - a.y);
  const rabo = Math.sin(t * 9) * 0.06;
  const VE = { vectorEffect: "non-scaling-stroke" as const };
  return (
    <g transform={`translate(${a.x} ${a.y}) scale(${h})`} stroke="#17130f" strokeWidth={5} strokeLinejoin="round" strokeLinecap="round">
      <path d={`M0.42 -0.2 Q0.6 ${-0.32 + rabo} 0.62 ${-0.42 + rabo}`} fill="none" strokeWidth={9} {...VE} />
      <ellipse cx={0.15} cy={-0.16} rx={0.32} ry={0.15} fill={cor} {...VE} />
      <ellipse cx={-0.2} cy={-0.06} rx={0.12} ry={0.05} fill={cor} {...VE} />
      <ellipse cx={-0.2} cy={-0.3} rx={0.15} ry={0.13} fill={cor} {...VE} />
      <path d="M-0.3 -0.38 Q-0.36 -0.28 -0.3 -0.22 Q-0.26 -0.3 -0.3 -0.38 Z" fill="#8a5a2b" {...VE} />
      <path d="M-0.1 -0.4 Q-0.04 -0.3 -0.1 -0.24 Q-0.14 -0.32 -0.1 -0.4 Z" fill="#8a5a2b" {...VE} />
      <ellipse cx={-0.31} cy={-0.27} rx={0.07} ry={0.05} fill="#e8c9a0" {...VE} />
      <circle cx={-0.36} cy={-0.29} r={0.018} fill="#17130f" stroke="none" />
      <path d="M-0.24 -0.33 L-0.18 -0.33 M-0.12 -0.33 L-0.06 -0.33" strokeWidth={4} fill="none" {...VE} />
    </g>
  );
};

// ---------- braços em primeira pessoa (por cima de tudo, na tela) ----------
export const MaosPOV: React.FC<{ pele?: string; manga?: string; telefone?: React.ReactNode; baixo?: boolean; subida?: number; tremor?: number }> = ({ pele = "#7a4a2e", manga = "#2a9d8f", telefone, baixo, subida = 1, tremor = 0 }) => {
  const T = "#17130f";
  const mao = (cx: number, cy: number, rot: number, espelho = 1) => (
    <g transform={`translate(${cx} ${cy}) rotate(${rot}) scale(${espelho} 1)`} stroke={T} strokeWidth={7} strokeLinejoin="round">
      <path d="M-70 40 Q-85 -30 -55 -75 Q-45 -105 -22 -95 Q-8 -125 14 -105 Q38 -118 48 -90 Q74 -88 72 -55 Q86 -10 60 45 Q10 90 -70 40 Z" fill={pele} />
      <path d="M-22 -95 L-20 -50 M14 -105 L16 -55 M48 -90 L46 -50" fill="none" strokeWidth={5} />
      <path d="M-62 -20 Q-90 -45 -80 -70 Q-70 -80 -58 -62" fill={pele} />
    </g>
  );
  return (
    <g>
      {/* braço esquerdo (sai do canto de baixo) */}
      <path d={baixo ? "M-60 2020 Q80 1760 210 1700 L330 1780 Q180 1900 120 2020 Z" : "M-80 2020 Q60 1680 250 1560 L380 1640 Q200 1800 150 2020 Z"} fill={manga} stroke={T} strokeWidth={7} strokeLinejoin="round" />
      {/* braço direito */}
      <path d={telefone ? "M1160 2020 Q980 1740 760 1560 L650 1660 Q830 1790 900 2020 Z" : "M1160 2020 Q1010 1760 850 1690 L760 1790 Q900 1870 930 2020 Z"} fill={manga} stroke={T} strokeWidth={7} strokeLinejoin="round" />
      {mao(baixo ? 250 : 300, baixo ? 1720 : 1600, 15)}
      {telefone ? (
        <g transform={`translate(${560 + tremor} ${1540 + (1 - subida) * 760}) rotate(${-8 + tremor * 0.3}) scale(0.72)`}>
          <rect x={-180} y={-290} width={360} height={620} rx={44} fill="#16181c" stroke={T} strokeWidth={8} />
          <rect x={-160} y={-268} width={320} height={576} rx={28} fill="#0d0f12" />
          {telefone}
          {mao(180, 300, -12, 1)}
          <path d="M150 190 Q220 230 210 300" stroke={T} strokeWidth={7} fill="none" />
        </g>
      ) : (
        mao(840, 1710, -15, -1)
      )}
    </g>
  );
};
