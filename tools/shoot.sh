#!/bin/sh
# shoot.sh <route> <prefix> — capture la route à une série de tailles d'écran réelles.
r=$1; pref=$2; out=/home/claude/shots/vp
mkdir -p $out
for s in 2560x1080 1000x1300 1440x900 1440x620 1024x768 768x1024 360x740; do
  w=${s%x*}; h=${s#*x}; ww=$w
  [ "$ww" -lt 520 ] && ww=520
  /opt/pw-browsers/chromium-1194/chrome-linux/chrome --headless=new --no-sandbox --disable-gpu \
    --hide-scrollbars --window-size=$ww,$h --virtual-time-budget=5000 \
    --screenshot=$out/$pref-$s.png "http://localhost:8099/__vp.html?w=$w&h=$h&r=$r" 2>/dev/null
  python3 -c "
from PIL import Image
Image.open('$out/$pref-$s.png').crop((0,0,$w,$h)).save('$out/$pref-$s.png')"
done
python3 - "$pref" <<'PY'
import sys
from PIL import Image, ImageDraw
pref=sys.argv[1]; out='/home/claude/shots/vp/'
sizes=['2560x1080','1000x1300','1440x900','1440x620','1024x768','768x1024','360x740']
ims=[]; TH=290
for s in sizes:
    im=Image.open(out+pref+'-'+s+'.png').convert('RGB'); r=TH/im.height
    ims.append((s,im.resize((max(1,int(im.width*r)),TH), Image.LANCZOS)))
pad=10; lab=16
W=sum(i.width for _,i in ims)+pad*(len(ims)+1); H=TH+lab+pad*2
sh=Image.new('RGB',(W,H),(24,24,28)); d=ImageDraw.Draw(sh); x=pad
for s,im in ims:
    sh.paste(im,(x,pad+lab)); d.text((x,pad),s,fill=(220,220,220)); x+=im.width+pad
sh.save(out+'sheet-'+pref+'.png'); print(out+'sheet-'+pref+'.png', sh.size)
PY
