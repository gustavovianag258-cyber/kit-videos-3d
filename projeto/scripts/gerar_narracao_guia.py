"""Gera a narração-guia: um MP3 por fala + o tempo de cada palavra.

Uso: python scripts/gerar_narracao_guia.py
Lê:    scripts/narracao-guia.json
Gera:  public/narracao-guia/<id>.mp3 e public/narracao-guia/falas.json
"""

import asyncio
import json
from pathlib import Path

import edge_tts

RAIZ = Path(__file__).resolve().parent.parent
CONFIG = json.loads((RAIZ / "scripts" / "narracao-guia.json").read_text(encoding="utf-8"))
PASTA = RAIZ / "public" / "narracao-guia"


async def gerar(fala: dict) -> dict:
    comunicar = edge_tts.Communicate(
        fala["texto"], CONFIG["voz"], rate=CONFIG["velocidade"], boundary="WordBoundary"
    )
    arquivo = PASTA / f"{fala['id']}.mp3"
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
    return {"id": fala["id"], "texto": fala["texto"], "arquivo": arquivo.name, "palavras": palavras}


async def main() -> None:
    PASTA.mkdir(parents=True, exist_ok=True)
    falas = [await gerar(f) for f in CONFIG["falas"]]
    (PASTA / "falas.json").write_text(json.dumps({"falas": falas}, ensure_ascii=False, indent=2), encoding="utf-8")
    total = 0.0
    for f in falas:
        dur = f["palavras"][-1]["fim"] - f["palavras"][0]["inicio"]
        total += dur
        print(f"{f['id']}: {dur:5.2f}s  {f['texto']}")
    print(f"Fala total (sem pausas): {total:.2f}s")


asyncio.run(main())
