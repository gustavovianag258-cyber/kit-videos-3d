# Vídeo-demo "Glomerulonefrite" (src/glomerulo): tempo de cada palavra da legenda.
# uso: python scripts/glomerulo-dados.py <whisper.json | --estimar> <saida.json>
# Com o whisper.json (scripts/transcrever-wav.py), alinha o texto certo às palavras ouvidas (difflib).
# Com --estimar, cria tempos provisórios pelo tamanho das palavras (para montar antes da voz chegar).
import json, sys, difflib, re

FRASES = [
    "O Lucas tem sete anos... e hoje o xixi dele saiu cor de refrigerante de cola.",
    "No pronto-socorro, a médica vê o olho inchado, o tornozelo inchado... e a pressão em 135 por 90. Alta demais pra uma criança.",
    "Aí ela faz a pergunta certa: ele teve dor de garganta? Teve. Doze dias atrás.",
    "O culpado é o estreptococo do grupo A.",
    "A garganta sarou... mas os anticorpos grudaram em pedaços da bactéria, e esses grumos entalaram no filtro do rim, o glomérulo.",
    "O alarme do sistema imune dispara, gasta o C3, e o filtro inflama!",
    "Resultado: sai pouco xixi, a água fica presa no corpo, e as hemácias vazam pra urina.",
    "Os exames confirmam: C3 baixo, ASO alto. Glomerulonefrite pós-estreptocócica.",
    "O tratamento é segurar o corpo: menos sal, menos água, diurético e antibiótico.",
    "E a boa notícia? De cada cem crianças, mais de 95 ficam curadas.",
    "A garganta sarou em cinco dias... foi o rim que contou o resto da história.",
]

certo = [(w, i) for i, f in enumerate(FRASES) for w in f.split()]
# formas que o Whisper escreve diferente do roteiro
SUB = {"doze": "12", "cem": "100", "cinco": "5", "sete": "7", "estreptococo": "streptococo", "inchado": "enxado", "hemácias": "emáceas", "para": "pra"}

def norm(x):
    x = re.sub(r"[^\w]", "", x.lower())
    return SUB.get(x, x)

if sys.argv[1] == "--estimar":
    t, tem = 0.3, []
    for k, (w, f) in enumerate(certo):
        if k and certo[k - 1][1] != f:
            t += 0.45
        d = 0.09 + 0.062 * len(w)
        tem.append((t, t + d))
        t += d + (0.25 if w.endswith(("...", ".", "?", "!", ":")) else 0.03)
else:
    segs = json.load(open(sys.argv[1], encoding="utf-8"))
    wh = [w for s in segs for w in s["words"]]
    # o Whisper pode juntar/separar números ("cento e trinta e cinco"); junta palavras ouvidas em sequência
    A = [norm(w["w"]) for w in wh]
    B = [norm(w) for w, _ in certo]
    tem = [None] * len(certo)
    for a, b, n in difflib.SequenceMatcher(None, A, B, autojunk=False).get_matching_blocks():
        for k in range(n):
            tem[b + k] = (wh[a + k]["s"], wh[a + k]["e"])
    for i in range(len(certo)):
        if tem[i] is None:
            j = i
            while j < len(certo) and tem[j] is None:
                j += 1
            ini = tem[i - 1][1] if i > 0 else 0.0
            fim = tem[j][0] if j < len(certo) else ini + 0.35 * (j - i)
            passo = (fim - ini) / (j - i)
            for k in range(i, j):
                tem[k] = (ini + (k - i) * passo, ini + (k - i + 1) * passo)

out = {
    "palavras": [{"w": w, "f": f, "s": round(s, 3), "e": round(e, 3)} for (w, f), (s, e) in zip(certo, tem)],
}
out["fim"] = round(out["palavras"][-1]["e"] + 1.6, 2)
json.dump(out, open(sys.argv[2], "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(f"{len(certo)} palavras, fim em {out['fim']} s")
