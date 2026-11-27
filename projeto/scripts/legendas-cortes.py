# Monta as legendas dos cortes verticais a partir das transcrições (faster-whisper) + textos corrigidos.
# Tempos das fontes são relativos ao início do áudio extraído (offset em s da live).
import json, re, sys
L = "live/"
def load(f, desloc=0.0):
    return [dict(s, start=s["start"]+desloc, end=s["end"]+desloc,
                 words=[dict(w, s=w["s"]+desloc, e=w["e"]+desloc) for w in s["words"]]) for s in json.load(open(L+f, encoding="utf-8"))]

CFG = {
 "corte2": {
  # tempos tirados do áudio do vídeo final (live/c2final.json), já emendado
  "inicio": 958.0,
  "pedacos": [(0.0,55.9)],
  "segs": [("c2final.json",0.0,{1:"Prometeu IRL!",2:"Cara, olha só:",3:"Não tinha tempo pra fazer IRL.",4:"Não tinha sol.",5:"Não tinha nada.",6:"Não tinha porra nenhuma.",
            7:"Eu dei um mergulhinho, tirei as fotos, postei no Insta lá.",8:"Inclusive, eu queria mostrar pra vocês.",9:"Olha a qualidade da foto!",
            10:"Sem IA!",11:"Pai tá shapado, né?",12:"Olha só, na brisinha.",13:"Pai tá shapado.",14:"Botando o pé pra entrar na água.",
            15:"Olha: minha namorada, louca por mim quando me vê sem camisa.",16:"São várias fotos que a minha namorada, louca por mim…",17:"Olha, olha, olha: ela não desgruda do namorado!",
            18:"Sabe o que é isso? Isso é testosterona, amigo!",19:"Isso é sex appeal.",20:"Pô, tá maluco! Isso é sex appeal, isso é testosterona!"})],
  "dest": {"IRL!","IRL.","sol.","nada.","nenhuma.","Insta","qualidade","IA!","shapado,","shapado.","água.","louca","camisa.","desgruda","testosterona,","testosterona!","sex","appeal.","appeal,"},
  "cortes_emendas": [13.9, 18.3, 32.7],
 },
 "clipe2": {
  # clipe "twitch-clip (1).mp4" da Nova pasta: só as falas do Meikod (os "pegue o gato" do TikTok viram o contador)
  "inicio": 0.0,
  "pedacos": [(0.0,53.5)],
  "segs": [("clipe2/clipe2.json",0.0,{0:"Caralho, moleque, parece aquele moleque lá que ganhou o Big Brother!",5:"Ih, caralho!",10:"Ih, caralho!",
            11:"Que porra é essa, gente?",12:"O que tá acontecendo aqui?",13:"Mano, o que que é isso aqui que tá acontecendo?",
            25:"Mano, que porra é essa que a Proteção Animal",26:"tá metendo a porrada no cara?",27:"Que porra é isso de pegar o gato?",
            28:"O que que tá acontecendo?",29:"Pega o gato, vá!"})],
  "dest": {"Big","Brother!","caralho!","porra","acontecendo?","Proteção","Animal","porrada","gato?","gato,","vá!"},
 },
 "corte3": {
  "inicio": 770.0,
  "pedacos": [(9.6,54.3)],
  "segs": [("corte3.json",0.0,{5:"E aí, tudo bem?",6:"Quem fala é o Edu.",7:"Caralho, o vagabundo tá filmando os outros com o coelhinho, mano!",8:"Pisca-pisca da árvore de Natal!",
            9:"Abriu só a bandinha, ó.",12:"Ele tava falando que é IA!",13:"É IA essa porra?",14:"Tá maluco, mano, o menor é IA!",15:"Caralho, mano, eu nunca vi.",
            16:"Não, de verdade, de coração.",17:"De coração.",18:"Uma coisa é tu ser aloprado no Twitter,",19:"outra coisa",20:"é a internet inteira",21:"aloprar alguém.",
            22:"Mano, eu não queria estar na pele desse menor."})],
  "dest": {"coelhinho,","Natal!","bandinha,","IA!","IA","nunca","coração.","Twitter,","internet","inteira","aloprar","pele"},
 },
}

def blocos(c):
    out=[]
    for arq, desloc, fix in c["segs"]:
        for i,s in enumerate(load(arq, desloc)):
            if i not in fix: continue
            ws=fix[i].split(); ow=s["words"]; n=len(ws); m=len(ow)
            tt=[(ow[min(m-1,k*m//n)]["s"], ow[min(m-1,max(0,(k+1)*m//n-1))]["e"]) for k in range(n)]
            ch=[]
            for k,w in enumerate(ws):
                ch.append(k)
                if len(ch)==4 or re.search(r"[.,!?:…]$",w) or k==n-1:
                    out.append({"de":tt[ch[0]][0],"ate":max(tt[ch[-1]][1],tt[ch[0]][0]+0.5),
                                "palavras":[{"t":ws[j],"s":tt[j][0],"d":ws[j] in c["dest"]} for j in ch]}); ch=[]
    out.sort(key=lambda b:b["de"])
    # junta blocos que ficariam menos de 0,3 s na tela com o seguinte
    i=0
    while i < len(out)-1:
        if out[i+1]["de"]-out[i]["de"] < 0.3 and len(out[i]["palavras"])+len(out[i+1]["palavras"]) <= 6:
            out[i+1]["palavras"]=out[i]["palavras"]+out[i+1]["palavras"]; out[i+1]["de"]=out[i]["de"]; out.pop(i)
        else: i+=1
    for i in range(len(out)-1): out[i]["ate"]=min(out[i]["ate"]+0.25, out[i+1]["de"])
    # leva para a linha do tempo do corte (pedaços emendados)
    res=[]; acc=0.0; emendas=[]
    for a,z in c["pedacos"]:
        for b in out:
            if a<=b["de"]<z:
                off=a-acc
                res.append({"de":round(b["de"]-off,2),"ate":round(min(b["ate"],z)-off,2),"palavras":[dict(p,s=round(p["s"]-off,2)) for p in b["palavras"]]})
        acc+=z-a; emendas.append(round(acc,2))
    return res, round(acc,2), emendas[:-1]

for nome,c in CFG.items():
    res,dur,em=blocos(c)
    json.dump(res,open(f"src/cortes/{nome}v-legendas.json","w",encoding="utf-8"),ensure_ascii=False,indent=1)
    print(nome, len(res), "blocos", dur, "s, emendas", em, "| inicio", c["inicio"], "pedacos", c["pedacos"])
