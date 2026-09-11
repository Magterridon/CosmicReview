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
const W=+q.get('w')||1440, H=+q.get('h')||900, R=q.get('r')||'/le-projet/', S=q.get('s');
document.write('<iframe id="f" src="'+R+'" width="'+W+'" height="'+H+'" style="position:absolute;left:0;top:1600px;border:0"></iframe>');
addEventListener('load',()=>{setTimeout(()=>{
  const d=document.getElementById('f').contentDocument,o=[];
  if(S) d.querySelector('.scene--projet').dataset.state=S;
  const tr=d.querySelector('.pj-transcript').getBoundingClientRect();
  const vw=d.documentElement.clientWidth, vh=d.documentElement.clientHeight;
  o.push('écran '+vw+'x'+vh+' · '+d.querySelector('.scene--projet').dataset.state+' | bandeau '+Math.round(tr.height)+'px');
  let bad=0;
  const vis=[...d.querySelectorAll('.pj-el')].filter(e=>e.offsetParent!==null);
  vis.forEach(e=>{
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
cat > preview/__shot.html <<'HTMLEOF'
<!doctype html><meta charset="utf-8">
<style>html,body{margin:0;background:#000}iframe{border:0;display:block}</style>
<script>
// Ouvre le carnet (ou la cassette) et fige tout, pour capture d'écran.
//   __shot.html?w=1440&h=900&p=51        une page du carnet
//   __shot.html?w=1440&h=900&k=cassette  la cassette
const q=new URLSearchParams(location.search);
const W=+q.get('w')||1440,H=+q.get('h')||900,P=+q.get('p')||1,K=q.get('k')||'carnet';
document.write('<iframe id="f" src="/le-projet/" width="'+W+'" height="'+H+'"></iframe>');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
document.getElementById('f').addEventListener('load',async()=>{
  const d=document.getElementById('f').contentDocument;
  const cible = K==='cassette' ? '.pj-el--camera' : '.pj-el--carnet';
  d.querySelector(cible).click(); await sleep(260);
  d.querySelector(cible).click(); await sleep(900);
  const st=d.createElement('style');
  st.textContent='*{transition:none!important;animation:none!important}.cn-leaf,.cn-sketch{opacity:1!important}';
  d.head.appendChild(st);
  if(K!=='cassette') d.querySelectorAll('.cn-tab')[P-1].click();
  await sleep(300);
  document.title='pret';
});
</script>
HTMLEOF
cat > preview/__gx.html <<'HTMLEOF'
<!doctype html><meta charset="utf-8">
<style>html,body{margin:0;background:#000}iframe{border:0;display:block}</style>
<script>
// Amène la scène à une étape des Gémeaux et la fige, pour capture d'écran.
//   __gx.html?w=1440&h=900&e=roue|gemini|g1..g4|fin|boite|case|blanc
const q=new URLSearchParams(location.search);
const W=+q.get('w')||1440,H=+q.get('h')||900,E=q.get('e')||'roue';
document.write('<iframe id="f" src="/le-projet/" width="'+W+'" height="'+H+'"></iframe>');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
document.getElementById('f').addEventListener('load',async()=>{
  const d=document.getElementById('f').contentDocument, w=document.getElementById('f').contentWindow;
  const q1=x=>d.querySelector(x);
  q1('.pj-el--camera').click(); await sleep(200);
  q1('.pj-el--camera').click(); await sleep(700);
  const i=q1('.cs-input'); i.value='51'; i.dispatchEvent(new w.Event('input',{bubbles:true}));
  await sleep(16000);
  q1('.pj-el--axel-seul').click(); await sleep(300);
  q1('.pj-el--axel-seul').click(); await sleep(900);
  if(E!=='roue'){
    q1('.gx-secteur[data-cons="gemeaux"]').click(); await sleep(3400);
    const n = ['fin','boite','case','blanc'].includes(E) ? 4 : (E[0]==='g' ? +E[1] : 0);
    for(let k=0;k<n;k++){ q1('.gx-twin--castor').click(); await sleep(900); }
    if(n===4) await sleep(9000);
    if(E==='boite'||E==='case'||E==='blanc'){
      q1('.gx-boite').click(); await sleep(300); q1('.gx-boite').click(); await sleep(900);
    }
    if(E==='case'){ q1('.gx-case-btn[data-case="nombre"]').click(); await sleep(500); }
    if(E==='blanc'){
      q1('.gx-case-btn[data-case="ciel"]').click(); await sleep(300);
      q1('[data-roue]').click(); await sleep(1000);
      q1('.gx-secteur[data-cons="lion"]').click(); await sleep(2600);
      const f=q1('[data-form]');
      q1('.gx-case-btn[data-case="nombre"]').click(); await sleep(300);
      q1('[data-input]').value='11'; f.dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true})); await sleep(400);
      q1('.gx-case-btn[data-case="objet"]').click(); await sleep(300);
      q1('[data-input]').value='telescope'; f.dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
      await sleep(15000);
    }
  }
  const st=d.createElement('style');
  st.textContent='*{transition:none!important;animation:none!important}.gx-nom,.gx-centre,.fin-ciel,.fin-titre,.fin-retour,.lb-mot,.lb-etat{opacity:1!important}';
  const C=+q.get('c');
  if(!isNaN(C)){
    // on laisse le générique aller au bout, puis on rejoue l'étape C
    await sleep(54000);
    d.querySelector('.fin').classList.add('is-credits');
    const figs=[...d.querySelectorAll('.fin-membre')];
    figs.forEach((g,k)=>{ g.classList.toggle('is-scene',k===C); g.classList.toggle('is-rangee',k<C); });
    const rang=d.querySelector('[data-rang]'), n=figs.length, k=Math.min(C,n-1);
    if(rang&&n>1){
      const pas=(figs[n-1].getBoundingClientRect().left-figs[0].getBoundingClientRect().left)/(n-1);
      rang.style.setProperty('--dx',((n-1-k)*pas)/2+'px');
    }
    st.textContent += '.fin-carte{opacity:0!important}.fin-carte[data-carte="'+C+'"]{opacity:1!important}';
    await sleep(1600);
  }
  d.head.appendChild(st);
  await sleep(300);
  document.title='pret';
});
</script>
HTMLEOF
