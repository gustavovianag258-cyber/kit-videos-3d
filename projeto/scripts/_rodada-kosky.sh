#!/bin/bash
# espera N segundos, extrai o áudio da gravação atual e transcreve
cd "$(dirname "$0")/.."
sleep ${1:-600}
FF=node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe
F=$(ls -t live/kosky/live-*.mp4 | head -1)
"$FF" -v error -i "$F" -vn -ac 1 -ar 16000 -c:a pcm_s16le live/kosky/rodada.wav -y
python scripts/transcrever-wav.py live/kosky/rodada.wav live/kosky/rodada.json > live/kosky/rodada.txt 2>&1
echo PRONTO
