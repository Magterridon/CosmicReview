#!/bin/sh
# Recrée le bac à sable de cadrage après chaque build (build-preview vide preview/).
cat > preview/__vp.html <<'HTMLEOF'
<!doctype html><meta charset="utf-8">
<style>html,body{margin:0;background:#222}iframe{border:0;display:block;position:absolute;left:0;top:0}</style>
<script>
const q=new URLSearchParams(location.search);
const w=+q.get('w')||1440,h=+q.get('h')||900,route=q.get('r')||'/le-projet/';
document.write('<iframe src="'+route+'" width="'+w+'" height="'+h+'"></iframe>');
</script>
HTMLEOF
cat > preview/__fit.html <<'HTMLEOF'
<!doctype html><meta charset="utf-8"><pre id="out" style="font:12px monospace;color:#eee;background:#111">…</pre>
<script>
const q=new URLSearchParams(location.search);
const W=+q.get('w')||1440, H=+q.get('h')||900, R=q.get('r')||'/le-projet/';
document.write('<iframe id="f" src="'+R+'" width="'+W+'" height="'+H+'" style="position:absolute;left:0;top:1600px;border:0"></iframe>');
addEventListener('load',()=>{setTimeout(()=>{
  const d=document.getElementById('f').contentDocument,o=[];
  const tr=d.querySelector('.pj-transcript').getBoundingClientRect();
  const vw=d.documentElement.clientWidth, vh=d.documentElement.clientHeight;
  o.push('écran '+vw+'x'+vh+' | bandeau '+Math.round(tr.height)+'px (haut à '+Math.round(tr.top)+')');
  let bad=0;
  [...d.querySelectorAll('.pj-el')].forEach(e=>{
    const b=e.getBoundingClientRect();
    const ok = b.left>=-1 && b.right<=vw+1 && b.top>=-1 && b.bottom<=tr.top+1;
    if(!ok) bad++;
    o.push('  '+e.dataset.el.padEnd(9)+(ok?'entier':'DÉBORDE  l'+Math.round(b.left)+' r'+Math.round(b.right)+' t'+Math.round(b.top)+' b'+Math.round(b.bottom)));
  });
  o.push(bad? '=> '+bad+' ÉLÉMENT(S) HORS CADRE' : '=> tout tient');
  document.getElementById('out').textContent=o.join('\n');
},1800)});
</script>
HTMLEOF
