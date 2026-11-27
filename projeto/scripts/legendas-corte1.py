import json, re
seg = json.load(open("live/corte1.json", encoding="utf-8"))
# texto corrigido por segmento (None = sem legenda)
fix = {
 0: "Salve, Meikod!",
 1: "Salve, salve!",
 2: "Aí vem: menos de 48 horas, pai.",
 3: "Mano, tô falando toda hora que tô preparadaço pra essa porra.",
 4: "Toda hora eu tô entrando no Play, no cronômetro, mano.",
 5: "Você falou que ia ser o primeiro a zerar o bagulho, prometeu pra nós.",
 6: "Davy Jones vai abrir live dia 18, 6 horas da manhã, Meikod.",
 7: "O bicho vai abrir live 6 horas da manhã.",
 8: "E diz ele que pela primeira vez vai fazer live 24 horas, pai.",
 9: "Quero ver você também, Meikod. Vambora, mano!",
 10: "Qual é, mano? Papo 10?",
 11: "Qual é, mano. Na verdade, olha só: eu vou abrir live",
 12: "8 horas da manhã já estarei jogando.",
 13: "8 horas. 8 fucking horas estarei jogando. Eu quero convidar você.",
 14: "Se o Davy Jones vai abrir live 6 horas da manhã, eu vou abrir 5.",
 15: "Antes do Davy Jones! Quer saber? Eu vou abrir live 4 horas da manhã.",
 16: "Porra!",
 17: "Quero nem saber de porra nenhuma.",
 18: "Olha só: eu sei que muita gente vai querer ver o Alanzoka,",
 19: "vai querer ver o Davy Jones, vai querer ver outros streamers por aí.",
 20: "Mas olha só: a forma que eu vejo o jogo, que eu faço acontecer, é diferente.",
 21: "Então, se você quiser ver um cria de verdade, um vagabundo nato,",
 22: "jogando GTA 6...",
 23: None,
 24: "Jogando GTA 6, vem comigo, pai!",
}
DEST = {"48","primeiro","zerar","24","fucking","5","4","Alanzoka","diferente","cria","nato","GTA","6","Porra!"}
out=[]
for i,s in enumerate(seg):
    t = fix.get(i, s["text"])
    if t is None: continue
    ws = t.split()
    # usa o tempo real das palavras do whisper, esticado ao número de palavras corrigidas
    ow = s["words"]; n=len(ws); m=len(ow)
    times=[]
    for k in range(n):
        a = ow[min(m-1, int(k*m/n))]["s"]; b = ow[min(m-1, int((k+1)*m/n)-1 if (k+1)*m/n>=1 else 0)]["e"]
        times.append((a, max(b, a+0.12)))
    # blocos de até 4 palavras, quebrando em pontuação
    chunk=[]
    for k,w in enumerate(ws):
        chunk.append(k)
        if len(chunk)==4 or re.search(r"[.,!?:]$", w) or k==n-1:
            out.append({"de": round(times[chunk[0]][0],2), "ate": round(times[chunk[-1]][1],2),
                        "palavras":[{"t":ws[j], "s":round(times[j][0],2), "d": re.sub(r'[.,!?:]','',ws[j]) in {re.sub(r'[.,!?:]','',x) for x in DEST}} for j in chunk]})
            chunk=[]
for i in range(len(out)-1):
    out[i]["ate"] = min(max(out[i]["ate"], out[i]["de"]+0.5), out[i+1]["de"])
json.dump(out, open("src/cortes/corte1-legendas.json","w",encoding="utf-8"), ensure_ascii=False, indent=1)
print(len(out),"blocos")
