#!/bin/bash
# Analisa a live gravada continuamente: a cada ~10 min transcreve o trecho novo.
# Resultado: live/kosky/analise/<inicio>.json e .txt (tempos em s da gravação). Não faz cortes.
cd "$(dirname "$0")/.."
FF=$(python -c "import imageio_ffmpeg as i;print(i.get_ffmpeg_exe())")
POS=live/kosky/analise/posicao.txt
[ -f $POS ] || echo ${1:-8190} > $POS
while true; do
  F=$(ls -t live/kosky/live-*.mp4 | head -1)
  D=$("$FF" -i "$F" 2>&1 | python -c "import sys,re;h,m,s=re.search(r'Duration: (\d+):(\d+):([\d.]+)',sys.stdin.read()).groups();print(int(int(h)*3600+int(m)*60+float(s)))")
  INI=$(cat $POS); FIM=$((D - 10))
  if [ $((FIM - INI)) -ge 120 ]; then
    "$FF" -v error -y -ss $INI -t $((FIM - INI)) -i "$F" -vn -ac 1 -ar 16000 -c:a pcm_s16le live/kosky/analise/_t.wav
    PYTHONIOENCODING=utf-8 python scripts/transcrever-wav.py live/kosky/analise/_t.wav live/kosky/analise/$INI.json $INI > live/kosky/analise/$INI.txt 2>/dev/null
    echo $FIM > $POS
    echo "$(date +%H:%M) transcrito $INI-$FIM"
  fi
  sleep 600
done
