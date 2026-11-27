"""Gera cada fala da narração com Edge TTS e guarda o tempo exato de cada palavra.

Uso: python scripts/gerar_narracao.py
Saída: public/narracao/fala-N.mp3 e public/narracao/falas.json
"""

import asyncio
import json
from pathlib import Path

import edge_tts

VOZ = "pt-BR-AntonioNeural"
VELOCIDADE = "+8%"
FALAS = [
    "E se a Terra fosse plana?",
    "O planeta inteiro seria um disco gigante!",
    "Mas espera... para onde iria toda essa água?",
    "E se a gravidade nem funcionasse como conhecemos?",
    "Será que conseguiríamos sobreviver nesse mundo?",
]

PASTA = Path(__file__).resolve().parent.parent / "public" / "narracao"


async def gerar(indice: int, texto: str) -> dict:
    comunicar = edge_tts.Communicate(texto, VOZ, rate=VELOCIDADE, boundary="WordBoundary")
    arquivo = PASTA / f"fala-{indice}.mp3"
    palavras = []
    with arquivo.open("wb") as saida:
        async for pedaco in comunicar.stream():
            if pedaco["type"] == "audio":
                saida.write(pedaco["data"])
            elif pedaco["type"] == "WordBoundary":
                # offset e duration vêm em unidades de 100 nanossegundos
                inicio = pedaco["offset"] / 10_000_000
                palavras.append(
                    {
                        "texto": pedaco["text"],
                        "inicio": round(inicio, 3),
                        "fim": round(inicio + pedaco["duration"] / 10_000_000, 3),
                    }
                )
    return {"texto": texto, "arquivo": arquivo.name, "palavras": palavras}


async def main() -> None:
    PASTA.mkdir(parents=True, exist_ok=True)
    falas = [await gerar(i, texto) for i, texto in enumerate(FALAS)]
    (PASTA / "falas.json").write_text(
        json.dumps({"voz": VOZ, "velocidade": VELOCIDADE, "falas": falas}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    for f in falas:
        print(f"{f['arquivo']}: {f['palavras'][-1]['fim']:.2f}s  {f['texto']}")


asyncio.run(main())
