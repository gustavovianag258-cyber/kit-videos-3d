# Baixa os 100 memes mais usados do Imgflip (api.imgflip.com/get_memes) para public/fase-extra/banco/memes/
import json, os, re, urllib.request, unicodedata
D = "public/fase-extra/banco/memes"; os.makedirs(D, exist_ok=True)
UA = {"User-Agent": "Mozilla/5.0"}
memes = json.load(urllib.request.urlopen(urllib.request.Request("https://api.imgflip.com/get_memes", headers=UA)))["data"]["memes"]
out = []
for m in memes:
    nome = unicodedata.normalize("NFKD", m["name"]).encode("ascii", "ignore").decode().lower()
    nome = re.sub(r"[^a-z0-9]+", "-", nome).strip("-")[:50]
    ext = m["url"].rsplit(".", 1)[1]
    arq = f"{nome}.{ext}"
    open(f"{D}/{arq}", "wb").write(urllib.request.urlopen(urllib.request.Request(m["url"], headers=UA)).read())
    out.append({"arquivo": f"fase-extra/banco/memes/{arq}", "nome": m["name"], "largura": m["width"], "altura": m["height"], "paineis": m["box_count"], "fonte": m["url"]})
json.dump(out, open(f"{D}/memes.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(len(out), "memes")
