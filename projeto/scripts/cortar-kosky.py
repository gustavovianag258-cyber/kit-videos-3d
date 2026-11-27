# Corta e emenda os trechos da live do kosky e gera as legendas.
# Uso: python scripts/cortar-kosky.py <id>   (ou sem id para todos)
# Saída: public/cortes/kosky/<id>.mp4 (1920x1080, 30 fps, áudio -14 LUFS) + src/cortes/kosky/cortes.json
import json, os, subprocess, sys, glob
import imageio_ffmpeg

FF = imageio_ffmpeg.get_ffmpeg_exe()
LIVE = sorted(glob.glob("live/kosky/live-*.mp4"))[-1]
OUT = "public/cortes/kosky"
JS = "src/cortes/kosky/cortes.json"
os.makedirs(OUT, exist_ok=True)

CAM = {"x": 0, "y": 0, "w": 455, "h": 256}  # posição da câmera dele no fim da live
CAM_INICIO = {"x": 0, "y": 60, "w": 456, "h": 258}  # no começo da live ela ficava um pouco mais baixo
JOGO = {"x": 460, "y": 100, "w": 1120, "h": 944}  # sem câmera (esq.) e sem chat (dir.)

# blocos de legenda: (início na live, fim na live, texto). Palavra com * fica em amarelo.
CAM_TIGRE = {"x": 0, "y": 375, "w": 455, "h": 256}  # perto de 2h13 de live a câmera desceu

CAM_MEIO = {"x": 0, "y": 320, "w": 455, "h": 256}  # de ~3h25 em diante (jogo)
CAM_DESK = {"x": 0, "y": 126, "w": 456, "h": 256}  # quando ele mostra o navegador (Twitter)

DAVY = "live/davyjones/clipes/"
CAM_DAVY = {"x": 30, "y": 26, "w": 410, "h": 230}  # câmera dele no canto, durante o jogo
JOGO_DAVY = {"x": 420, "y": 0, "w": 1100, "h": 1080}

CORTES = {
    # ---- rodada de 18/11/2026 (regras novas) ----
    "bug": {
        "titulo": ["O 1º BRASILEIRO", "A SOFRER UM ", "BUG NO GTA 6"],
        "estilo": "amarelo",
        "cam": CAM_DESK,
        "trechos": [(22024.4, 22028.0), (22017.1, 22024.3), (22029.0, 22035.0), (22257.4, 22263.9), (22264.7, 22272.7),
                    (22272.8, 22282.2), (22288.9, 22301.8)],
        "reacoes_live": [22027.3, 22265.5, 22294.1],
        "blocos": [
            (22024.44, 22027.0, "Eu sou o *primeiro brasileiro a sofrer um *bug no GTA 6,"),
            (22027.24, 22027.95, "no *GTA 6!"),
            (22017.18, 22019.6, "Eu tô falando, eu já fui *coroado, mano."),
            (22020.3, 22024.2, "Eu preciso ir em *entrevista, em *palestras, cara."),
            (22029.0, 22031.1, "A gente tá falando do jogo *antológico, cara."),
            (22031.2, 22032.6, "Eu fui o *pioneiro!"),
            (22033.08, 22035.0, "Tá ligado? Eu quero dar *palestra, pai!"),
            (22257.43, 22259.6, "Nossa, o jogo é tão real que tem até *exorcismo."),
            (22261.17, 22263.8, "O que é isso? A mina *flutuando, cara!"),
            (22265.47, 22266.1, "*Injogável."),
            (22266.97, 22268.2, "Eu não jogo *mais."),
            (22270.01, 22271.2, "Eu não jogo mais."),
            (22272.77, 22275.7, "Cara, *10 e 20… o cara é colega de profissão,"),
            (22275.81, 22277.8, "eu não quero entrar numa *guerra, né?"),
            (22278.45, 22282.1, "Parece que eu quero só o *título de primeiro bug, né?"),
            (22288.87, 22290.9, "Eu não quero que vire uma *competição,"),
            (22291.05, 22293.9, "mas eu quero que me desminta o *horário, mano."),
            (22294.05, 22295.2, "*10 e 20 postado."),
            (22296.69, 22298.8, "Vou continuar com o *título, velho."),
            (22299.03, 22301.7, "O cara é meu irmão de live, mas *10 e 20, fi."),
        ],
    },
    "aviao": {
        "titulo": ["ROUBOU UM AVIÃO", "E MANDARAM UM ", "CAÇA ATRÁS"],
        "estilo": "branco",
        "cam": CAM_MEIO,
        "trechos": [(19963.5, 19966.4), (19982.6, 19984.6), (20012.8, 20020.2), (20029.0, 20033.1), (20044.4, 20052.7),
                    (20068.7, 20073.6), (20098.6, 20100.5), (20104.1, 20107.0), (20109.8, 20116.8), (20128.9, 20133.6),
                    (20150.4, 20158.1)],
        "reacoes_live": [20049.8, 20104.1, 20115.96],
        "blocos": [
            (19963.54, 19965.6, "Vou pegar o *avião, mas qual, mano?"),
            (19982.64, 19984.5, "Como ele vai *ligar esse avião?"),
            (20012.8, 20014.2, "Hum, eu não sei *virar, velho."),
            (20014.82, 20016.6, "Nossa, não é ele que vira."),
            (20017.1, 20018.5, "Não é assim que *vira, mano."),
            (20019.16, 20020.1, "É muito *difícil virar!"),
            (20029.74, 20030.9, "Olha que *pista, mano!"),
            (20031.96, 20033.0, "Que *grandeza, cara!"),
            (20044.42, 20047.2, "Caralho, vou tentar chegar nesse *avião, olha lá."),
            (20047.88, 20048.8, "Não *alcança."),
            (20049.8, 20052.6, "O que tá *acontecendo, cara?"),
            (20068.74, 20070.6, "Não é o trem de pouso que eu puxei, velho."),
            (20070.68, 20071.3, "É o *caça."),
            (20072.36, 20073.5, "Esses aviões são a *polícia?"),
            (20098.63, 20100.4, "Tem algo *vindo, cara."),
            (20104.1, 20105.1, "*Fudeu, velho."),
            (20105.36, 20106.2, "Vou tentar *atingir ele…"),
            (20109.8, 20110.8, "Tá no *mar? Tá no mar?"),
            (20111.84, 20112.95, "Só sai, *Jason!"),
            (20113.58, 20115.2, "Você tá no mar, cara."),
            (20115.96, 20116.8, "Caralho, *histórico!"),
            (20128.89, 20130.1, "Como que eu tiro esse *paraquedas?"),
            (20130.17, 20131.4, "Vou me jogar no *mar, velho,"),
            (20131.51, 20133.2, "mas diz que nessa altura o mar fica…"),
            (20150.43, 20151.9, "Vou me jogar daqui, será que eu *morro?"),
            (20151.97, 20155.8, "Na vida real, quanto mais alto, mais *dura a água fica, né?"),
            (20156.49, 20158.0, "Quero muito ver essa *animação, velho."),
        ],
    },
    "heroi": {
        "titulo": ["TENTOU SER HERÓI", "NO GTA 6 E ", "DEU TUDO ERRADO"],
        "estilo": "amarelo",
        "cam": CAM_MEIO,
        "trechos": [(12442.1, 12445.3), (12459.9, 12463.4), (12481.8, 12483.5), (12484.5, 12486.3), (12487.4, 12490.9),
                    (12492.8, 12494.0), (12543.4, 12553.4), (12557.5, 12561.7), (12699.9, 12705.2), (14588.6, 14590.8),
                    (14609.4, 14611.0), (14622.6, 14624.0), (14651.0, 14653.9), (14667.8, 14672.4)],
        "reacoes_live": [12545.05, 14609.5, 14651.1],
        "blocos": [
            (12442.18, 12445.2, "Eu vim aqui em prol disso, de *salvar eles, velho."),
            (12459.96, 12463.3, "Já tem *três estrelas, não sei por que eu fiz isso."),
            (12481.88, 12483.4, "Tá *insustentável, velho."),
            (12484.58, 12486.2, "Como que eu vou salvar as *araras?"),
            (12487.44, 12490.8, "Tenho que parar com esse bagulho de querer ser o *herói da vizinhança."),
            (12492.84, 12493.9, "Eu quero salvar a *arara."),
            (12543.45, 12544.9, "Linha da *cabeça! Valorant!"),
            (12545.05, 12545.9, "Ai, caralho!"),
            (12546.69, 12548.6, "O *reflexo dele foi muito maior, mano!"),
            (12549.73, 12551.3, "Mano, eu apertei e *morri, velho!"),
            (12552.09, 12553.3, "Eu apertei e morri!"),
            (12557.56, 12559.2, "Esquece os *papagaios, tá, rapaziada?"),
            (12560.18, 12561.6, "Não tem por que bancar o *herói, não!"),
            (12699.95, 12702.2, "Acabamos com o *tráfico de pássaros, velho."),
            (12702.45, 12705.1, "A gente morreu, só que a *polícia chegou e entendeu tudo."),
            (14588.7, 14590.7, "De novo eu quero ser o *herói, velho."),
            (14609.5, 14610.9, "Não, não, *não!"),
            (14622.68, 14623.9, "Primeira tela de alguém *preso?"),
            (14651.08, 14653.8, "Nossa, menos *1.700, véi!"),
            (14667.8, 14670.1, "Caralho, a gente não nasce na *delegacia, não."),
            (14670.76, 14672.3, "Agora *fudeu bem, hein?"),
        ],
    },
    "golpe": {
        "titulo": ["PAGOU 1 DÓLAR", "POR UM CONSELHO E ", "CAIU NO GOLPE"],
        "estilo": "branco",
        "cam": CAM_TIGRE,
        "trechos": [(10803.2, 10817.2), (10825.4, 10833.2), (10857.2, 10858.4), (10873.5, 10878.5), (10946.0, 10964.0)],
        "reacoes_live": [10829.6, 10876.4, 10962.3],
        "blocos": [
            (10803.26, 10804.2, "Que *história ela vai contar?"),
            (10806.18, 10807.5, "*Um dólar pra ouvir uma história dela."),
            (10829.57, 10831.9, "Cara, vou tomar esse *golpe até no GTA,"),
            (10831.95, 10833.15, "mas quero ver até onde ela *vai."),
            (10857.24, 10858.3, "Se ela pedir *10, eu dou 10."),
            (10873.59, 10876.0, "Eu tô pra perder meu *dinheiro pra ela aqui."),
            (10876.39, 10878.4, "Eu dei *16 pilas."),
            (10955.7, 10957.3, "Cara, eu queria muito saber e *não tenho."),
            (10962.3, 10963.9, "Infelizmente vou ter que *recusar."),
        ],
    },
    "oito": {
        "titulo": ["ASSALTOU ÀS 5 DA", "MANHÃ POR ", "8 DÓLARES"],
        "estilo": "preto",
        "cam": CAM_MEIO,
        "trechos": [(16333.4, 16338.7), (16341.5, 16344.0), (16348.5, 16351.2), (16353.1, 16356.5), (16362.6, 16363.3),
                    (16369.1, 16370.3), (16386.8, 16391.7), (16402.2, 16404.1), (16409.9, 16411.7), (16425.2, 16429.3),
                    (16446.0, 16458.0), (16469.1, 16474.7)],
        "reacoes_live": [16369.15, 16425.3, 16469.1],
        "blocos": [
            (16333.46, 16334.3, "Coitada, *trabalhadora, mano."),
            (16335.76, 16338.6, "O pessoal no rolê e ela acordando *cedo pra caminhar."),
            (16341.5, 16343.9, "Caralho, *5:34 da manhã, velho."),
            (16348.54, 16351.1, "Ela indo caminhar e ela que vai ser *roubada, mano."),
            (16353.1, 16356.4, "Ela já sabe que eu tô *perseguindo, mas como eu vou dar um tranco?"),
            (16362.7, 16363.2, "A porra!"),
            (16369.15, 16370.2, "*Oito dólar, mano!"),
            (16386.81, 16389.6, "Cara, como que eu vou *assaltar esses caras aqui?"),
            (16390.37, 16391.6, "Se eu assalto qualquer um desses aqui…"),
            (16402.28, 16404.0, "Cara, ele é muito *engessado, velho!"),
            (16410.0, 16411.6, "A mina chamou ele de *gato, tá ligado?"),
            (16425.32, 16427.5, "Ainda vou ser *preso pelos 8 dólares!"),
            (16427.62, 16429.2, "É uma vida *desgraçada, velho!"),
            (16469.11, 16471.4, "Mano, olha isso, véi, *opressão policial!"),
        ],
    },
    "seta": {
        "titulo": ["ELE DESCOBRIU QUE", "O GTA 6 TEM ", "SETA"],
        "estilo": "branco",
        "cam": CAM_TIGRE,
        "cam_trocas_live": [(13823.9, CAM_MEIO)],
        "trechos": [(10041.9, 10053.2), (10065.6, 10070.5), (13823.9, 13827.6), (13989.2, 13993.5), (14061.0, 14068.2),
                    (15773.4, 15777.4), (15785.0, 15786.6), (15789.9, 15792.1), (15800.0, 15806.4)],
        "reacoes_live": [10044.84, 14062.12, 15789.95],
        "blocos": [
            (10041.9, 10044.0, "Mano, curva nesse GTA não se *brinca."),
            (10044.84, 10045.9, "Tem *seta? Mentira."),
            (10046.22, 10047.6, "Tem *seta, mano!"),
            (10048.68, 10049.8, "Olha aí, véi!"),
            (10049.94, 10052.4, "É a seta do *controle, véi."),
            (10052.5, 10053.1, "Faz sentido."),
            (10065.65, 10068.2, "Curti essa parada da *seta, hein, véi."),
            (10068.51, 10070.4, "GTA RP vai *torrar essa parada."),
            (13823.9, 13825.7, "Olha, ele ligou a seta, que *bonitinho, cara."),
            (13826.74, 13827.5, "Vou começar a *ligar também."),
            (13989.28, 13990.9, "Outra coisa que eu posso ser *pioneiro:"),
            (13991.18, 13993.4, "o primeiro cara a usar *seta no Brasil, velho."),
            (14061.02, 14061.9, "Deixa eu fazer um *teste."),
            (14062.12, 14064.3, "Se eu virar o volante, a seta *desativa, velho."),
            (14065.76, 14068.1, "Quando você vira na vida real, tira *automático."),
            (15773.41, 15775.3, "E olha eu usando a *seta de novo, cara."),
            (15776.27, 15777.3, "Olha eu usando a seta de novo."),
            (15785.08, 15786.5, "Errei a entrada, liguei a seta. Que *bosta."),
            (15789.95, 15792.0, "Que *vergonha, cara. Sinto vergonha às vezes."),
            (15800.07, 15800.9, "Perdi de novo, cara."),
            (15802.03, 15804.3, "Meu Deus, deve ser muito *tiltante ver eu dirigindo assim."),
            (15805.47, 15806.3, "Ai, perdão, cara."),
        ],
    },
    "ifood": {
        "titulo": ["FUGIU DA POLÍCIA", "NA MOTO DO ", "IFOOD"],
        "estilo": "amarelo",
        "cam": CAM_MEIO,
        "trechos": [(14921.8, 14935.1), (14936.6, 14941.9), (14946.1, 14948.4), (14959.5, 14967.8), (15013.9, 15023.2),
                    (15045.6, 15051.7), (15053.4, 15061.6)],
        "reacoes_live": [14936.68, 14959.58, 15058.38],
        "blocos": [
            (14921.94, 14922.4, "Uma *moto."),
            (14923.28, 14924.6, "Cara, é o *entregador, mano."),
            (14931.08, 14932.1, "Vou virar o *demônio, velho."),
            (14936.68, 14938.4, "Caralho, a moto do *iFood, mano."),
            (14938.9, 14939.9, "É *histórico também, né?"),
            (14940.56, 14941.8, "Pior que é histórico também, mano."),
            (14946.19, 14948.35, "Caralho, eles tão furando minha *bag!"),
            (14959.58, 14960.2, "Ai, caralho!"),
            (14962.04, 14964.1, "É muita demora pra *levantar."),
            (14965.48, 14967.6, "Trânsito, para a *ocorrência, velho."),
            (15013.98, 15015.4, "Não tem como eu *ganhar da polícia com isso aqui."),
            (15021.06, 15023.1, "Olha, eu entro em *lugares que eles não entram, cara."),
            (15045.64, 15047.1, "Que engraçado que eles não me *atiram, né?"),
            (15047.22, 15049.0, "Os caras real *respeitam."),
            (15050.26, 15051.6, "Eu vou *morrer, tá, rapaziada?"),
            (15053.48, 15055.2, "Vou *pular com ela em movimento."),
            (15058.38, 15058.8, "Senhora!"),
            (15060.79, 15061.5, "Bora, mano."),
        ],
    },
    # ---- Davy Jones (clipes do Kick, kick.com/davyjones) ----
    "davy-chorou": {
        "canal": "davyjones",
        "fonte": DAVY + "clip_01M7Q2H15CR4ADM9EBMV0DJ5Y8.mp4",
        "titulo": ["DAVY JONES CHOROU", "ANTES DE JOGAR ", "GTA 6"],
        "estilo": "branco",
        "cam": {"x": 680, "y": 30, "w": 1210, "h": 680},
        "jogo": {"x": 0, "y": 40, "w": 640, "h": 1040},  # o chat dele chorando junto
        "trechos": [(0.9, 26.0), (30.2, 42.0), (47.5, 51.0), (59.8, 62.0)],
        "reacoes_live": [17.92, 48.0],
        "blocos": [
            (1.01, 3.1, "Muito *orgulho de tudo que você criou durante esses anos,"),
            (3.71, 5.6, "principalmente da *pessoa que você se tornou."),
            (10.08, 11.85, "O melhor *irmão que eu podia desejar."),
            (11.9, 14.0, "Te amo muito, estamos *juntos sempre."),
            (14.6, 15.7, "Te amo muito, cara."),
            (17.92, 20.6, "*Saudade, cara."),
            (20.77, 22.4, "Obrigado por *tudo também, cara."),
            (23.49, 25.5, "Você sabe como você é *importante pra mim."),
            (30.29, 34.3, "Vocês sabem que meu irmão mora na *Dinamarca, né?"),
            (36.4, 37.6, "E também a minha família."),
            (38.08, 41.1, "Ele tem três filhos, meus *sobrinhos, que eu amo tanto,"),
            (41.12, 42.0, "e a gente fica *longe…"),
            (47.98, 48.9, "A *distância é foda."),
            (49.94, 50.7, "Obrigado, Bruno."),
            (59.9, 61.9, "Achei que não ia dar pra *chorar, né?"),
        ],
    },
    "davy-morte": {
        "canal": "davyjones",
        "fonte": DAVY + "clip_01M7Q61465TJ3MJD98CGM5Q8RA.mp4",
        "titulo": ["A PRIMEIRA MORTE", "DO DAVY NO ", "GTA 6"],
        "estilo": "amarelo",
        "cam": CAM_DAVY,
        "jogo": JOGO_DAVY,
        "trechos": [(0.0, 35.0), (42.5, 48.6)],
        "reacoes_live": [27.83, 44.69],
        "blocos": [
            (0.0, 1.7, "Crime *denunciado, vamos descer aqui?"),
            (8.04, 8.8, "É, não vai *dar, né?"),
            (10.94, 11.9, "Como é que eu vou?"),
            (12.8, 15.0, "Já baixou um *carro qualquer aqui."),
            (17.12, 18.4, "Eu tenho que ser *feio, provavelmente, né?"),
            (19.2, 19.6, "Opa!"),
            (21.32, 22.1, "Eu fico *roubando esse carro aqui?"),
            (22.48, 22.9, "Vamo lá!"),
            (24.2, 25.3, "Vai, vai! *Isso!"),
            (27.83, 28.6, "*Sai!"),
            (28.93, 30.0, "Ih! Pera aí, quer?"),
            (30.75, 31.9, "Ah, tá fazendo o *hot wire!"),
            (33.17, 34.4, "Não sai *daí!"),
            (43.15, 43.9, "Toma aí."),
            (44.69, 45.4, "Se *fudeu."),
            (47.03, 48.1, "A *primeira morte é assim."),
        ],
    },
    "davy-parede": {
        "canal": "davyjones",
        "fonte": DAVY + "clip_01M7Q94QS5ZF5R970KQYRAJW79.mp4",
        "titulo": ["EM ÊXTASE PINTANDO", "PAREDE NO ", "GTA 6"],
        "estilo": "preto",
        "cam": CAM_DAVY,
        "jogo": JOGO_DAVY,
        "trechos": [(0.0, 32.0)],
        "reacoes_live": [3.0, 14.0, 17.0],
        "blocos": [
            (2.7, 5.4, "Ah, gostei do *verde pro quarto aqui, né?"),
            (13.72, 16.2, "Ah, o *efeito sonoro do rolo, os caras…"),
            (16.84, 18.1, "Cara, *absurdo."),
            (30.16, 31.6, "Hoje é *7 vídeos ou mais no canal, tá?"),
        ],
    },
    # ---- cortes já postados ----
    "tigre": {
        "titulo": ["FUGIU DE UM TIGRE", "E PULOU NO ", "JACARÉ"],
        "estilo": "amarelo",
        "cam": CAM_TIGRE,
        "trechos": [(7986.5, 7993.4), (8030.4, 8035.2), (8036.8, 8041.3), (8070.1, 8073.0), (8111.1, 8113.1),
                    (8115.9, 8121.0), (8127.8, 8131.7), (8143.6, 8153.2)],
        "reacoes_live": [7990.3, 8128.1, 8146.4],
        "blocos": [
            (7990.3, 7991.9, "Deus, cara! Que *susto, cara!"),
            (7991.96, 7993.3, "Por que que ele *grita tão alto?"),
            (8030.52, 8032.8, "Mano, cadê meu *bastão? Já perdi ele, velho."),
            (8033.82, 8035.1, "Eu contra o *tigre no bastão…"),
            (8037.0, 8039.5, "Vou ter que matar o tigre com a *pistola"),
            (8039.54, 8041.25, "porque eu quero ver o *jacaré com o corpo."),
            (8070.34, 8071.6, "“Esquece o *jacaré”, mano?"),
            (8071.72, 8072.95, "Como você quer que eu *esqueça?"),
            (8111.32, 8113.0, "E se eu *pular junto com o corpo, mano?"),
            (8116.18, 8118.1, "Vou *jogar só pra ver primeiro."),
            (8128.06, 8129.0, "*Caralho, cara!"),
            (8130.3, 8131.6, "Se eu pular, ele vai *vir, mano?"),
            (8145.86, 8148.1, "Ah, *morri! Morri!"),
            (8150.9, 8153.1, "Mano, nós acabou de *ganhar do *jacaré!"),
        ],
    },
    "analogico": {
        "titulo": ["O ANALÓGICO DELE", "AFUNDOU NO ", "GTA 6"],
        "estilo": "branco",
        "cam": CAM_INICIO,
        "trechos": [(619.9, 624.3), (638.1, 642.3), (660.7, 673.4), (736.5, 738.8)],
        "reacoes_live": [622.3, 666.3, 672.6],
        "blocos": [
            (620.04, 621.3, "Cara, se eu falar pra vocês"),
            (621.36, 623.2, "que meu *bolinho acabou de *afundar,"),
            (623.28, 624.2, "vocês *acreditam, mano?"),
            (638.2, 640.7, "Cara, tá *afundada a bolinha do meu *controle,"),
            (640.84, 642.2, "não vou clicar que vai *sair."),
            (660.8, 663.9, "Tá *afundada a bolinha do meu *PlayStation, cara."),
            (664.98, 666.0, "Que bagulho *intankável,"),
            (666.1, 668.0, "afundou durante a gameplay do *GTA, velho."),
            (669.98, 671.9, "Que isso, cara, como que pode *acontecer?"),
            (672.0, 673.3, "O *avião tá quase *caindo."),
            (736.66, 738.7, "Mano, meu bolinha foi pro *pau, velho."),
        ],
    },
    "r1": {
        "titulo": ["“SERÁ QUE ERA", "R1 ESSE ", "TEMPO TODO?”"],
        "estilo": "preto",
        "cam": CAM_INICIO,
        "trechos": [(391.1, 393.5), (198.2, 202.0), (208.3, 212.5), (228.2, 231.3), (232.6, 234.6), (238.9, 243.3), (385.6, 389.0), (402.4, 407.3), (413.4, 415.9)],
        "reacoes_live": [391.3, 229.0, 388.2],
        "blocos": [
            (391.2, 393.4, "Será que era *R1 esse tempo todo, mano?"),
            (198.3, 200.3, "*L1, eu tô clicando L1, certo?"),
            (201.48, 201.95, "É pra *trocar?"),
            (208.38, 209.3, "Volta a *arma, fi!"),
            (209.38, 211.35, "Não é igual *Fortnite não, com arrasto, mano,"),
            (211.44, 212.4, "tô no *controle, tio!"),
            (228.3, 231.2, "Meu Deus, *perdi as duas agora, cara!"),
            (232.7, 234.5, "Meu Deus, não vai ficar *entalado aqui, véi!"),
            (239.0, 240.6, "O *L1, certo?"),
            (240.94, 243.2, "Tô observando todos os cantos, não tem *nada, mano."),
            (385.7, 387.45, "Eu tô clicando *L1, cara,"),
            (387.54, 388.95, "não é possível que seja *R1 e eu tô vendo *errado."),
            (402.5, 404.6, "“É só mudar os botões na *config”"),
            (404.72, 407.2, "Mas por que pra *mim eu teria que mudar os botões, mano?"),
            (413.5, 415.8, "O jogo tá *estranho pra mim, né, cara?"),
        ],
    },
    "ruim": {
        "titulo": ["“TODO MUNDO", "TÁ ", "RUIM AGORA”"],
        "estilo": "branco",
        "cam": CAM_INICIO,
        "trechos": [(321.2, 324.4), (78.8, 85.1), (114.6, 120.6), (125.0, 127.6), (130.1, 133.2), (316.4, 318.6)],
        "reacoes_live": [81.7, 316.7],
        "blocos": [
            (321.3, 324.3, "Eu só jogo FPS, sou bom em FPS e *teclado e *mouse, tá?"),
            (78.9, 81.3, "Se é muito *ruim, é, todo mundo tá ruim agora, cara."),
            (81.58, 82.4, "Não é só *eu, não!"),
            (82.96, 85.0, "É uma jogabilidade *diferente, bota na *cabeça."),
            (114.7, 117.6, "Só, mano, fica *feio de ver eu jogar, né, mano?"),
            (118.46, 120.5, "Só que é uma *nova jogabilidade. Bota isso na cabeça."),
            (125.1, 127.5, "Na *canela não dá mais dano não, velho, quem falou isso?"),
            (130.2, 133.1, "Quando ele *mira, ele sai do *agachamento, tá ligado?"),
            (316.58, 318.5, "Muito *feio atirando, cara…"),
        ],
    },
    "saideira": {
        "titulo": ["A SAIDEIRA", "ANTES DE TIRAR ", "A LUCIA"],
        "estilo": "amarelo",
        "trechos": [(5818.1, 5823.25), (5824.8, 5825.6), (5829.95, 5832.5), (5842.9, 5858.2), (5865.3, 5870.95), (5873.85, 5881.45), (5900.8, 5901.75), (5906.3, 5912.2)],
        "reacoes_live": [5845.2, 5870.2, 5909.0],
        "blocos": [
            (5818.18, 5819.95, "Ela é bem *gostosa, né, mano?"),
            (5820.88, 5822.45, "Eu tô na cara dela ainda, a *câmera."),
            (5822.48, 5823.2, "Não vou *tirar, não."),
            (5824.88, 5825.6, "Eu só tô"),
            (5830.0, 5830.95, "olhando pro *cano aqui, cara."),
            (5831.44, 5832.45, "Porque eu tô pro *cano da *missão."),
            (5843.0, 5844.6, "Ah, perdoe as *minas da live,"),
            (5844.74, 5846.0, "mas nós é *homem, mano."),
            (5847.16, 5848.6, "É *animação, é animação,"),
            (5848.68, 5850.85, "mas olha o jeito que a *Rockstar deixa, mano."),
            (5850.94, 5852.6, "Vocês têm que *reclamar com a Rockstar."),
            (5853.32, 5856.4, "Vocês têm que reclamar com a Rockstar, nós é *homem…"),
            (5856.48, 5858.1, "É bagulho *natural do ser humano."),
            (5865.36, 5866.95, "Essa mina é *fortíssima, velho."),
            (5867.2, 5869.1, "E ainda pega os *gráficos, né, mano?"),
            (5869.9, 5870.9, "Tudo *mexe."),
            (5873.9, 5874.5, "Cara,"),
            (5878.74, 5879.95, "não existem essas minas na *vida *real."),
            (5880.14, 5881.35, "Eu não vou interromper. Deixa ela *falar."),
            (5900.86, 5901.7, "É a *ex dele."),
            (5906.34, 5908.3, "Mano, ela vai sair assim pra *rua,"),
            (5908.4, 5910.0, "então não é *honradinha, né, velho."),
            (5910.06, 5912.1, "Eu achei que era *honradinha…"),
        ],
    },
}


def mapa(trechos, t):
    off = 0.0
    for a, b in trechos:
        if a - 0.05 <= t <= b + 0.05:
            return round(off + max(0.0, min(t, b) - a), 3)
        off += b - a
    raise ValueError(f"tempo {t} fora dos trechos")


def legendas(c):
    tr = c["trechos"]
    out = []
    for a, b, txt in c["blocos"]:
        de, ate = mapa(tr, a), mapa(tr, b)
        ws = txt.split()
        pesos = [len(w.strip("*")) + 2 for w in ws]
        tot, acc, pal = sum(pesos), 0, []
        for w, p in zip(ws, pesos):
            pal.append({"t": w.strip("*"), "s": round(de + (ate - de) * acc / tot, 3), "d": w.startswith("*")})
            acc += p
        # no máximo 3 palavras (ou ~18 letras) por legenda: sempre cabe em 2 linhas, do lado dele
        grupos, g = [], []
        for q in pal:
            if g and (len(g) >= 3 or sum(len(x["t"]) + 1 for x in g) + len(q["t"]) > 18):
                grupos.append(g)
                g = []
            g.append(q)
        grupos.append(g)
        fim_bloco = max(ate, de + 0.6)
        for i, g in enumerate(grupos):
            ini_g = de if i == 0 else g[0]["s"]
            fim_g = grupos[i + 1][0]["s"] if i + 1 < len(grupos) else fim_bloco
            out.append({"de": ini_g, "ate": fim_g, "palavras": g})
    # não deixar blocos se sobreporem
    for i in range(len(out) - 1):
        out[i]["ate"] = min(out[i]["ate"], out[i + 1]["de"])
    return out


def cortar(id_, c):
    tr = c["trechos"]
    fc, ins = [], ""
    for i, (a, b) in enumerate(tr):
        fc.append(f"[0:v]trim={a}:{b},setpts=PTS-STARTPTS,fps=30[v{i}];[0:a]atrim={a}:{b},asetpts=PTS-STARTPTS,afade=t=in:d=0.03,afade=t=out:st={b-a-0.04:.3f}:d=0.04[a{i}]")
        ins += f"[v{i}][a{i}]"
    fc.append(f"{ins}concat=n={len(tr)}:v=1:a=1[v][a0];[a0]loudnorm=I=-14:TP=-1.5:LRA=11[a]")
    ini, fim = max(0.0, min(a for a, _ in tr) - 1), max(b for _, b in tr) + 1
    # pré-corta a janela com -ss para não decodificar a live inteira; os tempos ficam relativos a 'ini'
    fc = ";".join(fc)
    for a, b in tr:
        fc = fc.replace(f"trim={a}:{b}", f"trim={a-ini:.3f}:{b-ini:.3f}")
    pasta = f"public/cortes/{c.get('canal', 'kosky')}"
    os.makedirs(pasta, exist_ok=True)
    cmd = [FF, "-v", "error", "-y", "-ss", str(ini), "-t", str(fim - ini), "-i", c.get("fonte", LIVE), "-filter_complex", fc,
           "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-preset", "veryfast", "-crf", "18", "-pix_fmt", "yuv420p",
           "-c:a", "aac", "-b:a", "192k", "-ar", "48000", f"{pasta}/{id_}.mp4"]
    subprocess.run(cmd, check=True)


def main():
    dados = json.load(open(JS, encoding="utf-8")) if os.path.exists(JS) else {}
    # -l: só refaz legendas/json, sem recortar o vídeo
    so_legendas = "-l" in sys.argv
    ids = [a for a in sys.argv[1:] if not a.startswith("-")] or list(CORTES)
    for id_ in ids:
        c = CORTES[id_]
        if not so_legendas:
            cortar(id_, c)
        tr = c["trechos"]
        acc, emendas = 0.0, []
        for a, b in tr[:-1]:
            acc += b - a
            emendas.append(round(acc, 3))
        dados[id_] = {
            "segundos": round(sum(b - a for a, b in tr), 3),
            "emendas": emendas,
            "legendas": legendas(c),
            "titulo": c["titulo"],
            "estilo": c["estilo"],
            "cam": c.get("cam", CAM),
            "jogo": c.get("jogo", JOGO),
            "canal": c.get("canal", "kosky"),
            "jogoTrocas": [{"de": mapa(tr, t), "jogo": j} for t, j in c.get("jogo_trocas_live", [])],
            "reacoes": [mapa(tr, r) for r in c.get("reacoes_live", [])],
            "camTrocas": [{"de": mapa(tr, t), "cam": cam} for t, cam in c.get("cam_trocas_live", [])],
        }
        print(id_, dados[id_]["segundos"], "s,", len(emendas), "emendas")
    json.dump(dados, open(JS, "w", encoding="utf-8"), ensure_ascii=False, indent=1)


main()
