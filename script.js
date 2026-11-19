
(function(){
  var d=document, reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Prüfmodus: Seite mit ?still aufrufen, dann steht alles ohne Bewegung (für Screenshots)
  if(/[?&]still/.test(location.search)){reduce=true;d.documentElement.classList.add('still');[].forEach.call(d.images,function(i){i.loading='eager'});}
  window.GF={reduce:reduce};
  var els=[].slice.call(d.querySelectorAll('[data-r]'));
  if(!('IntersectionObserver' in window)||reduce){els.forEach(function(e){e.classList.add('in')});}
  else{
    var io=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target);}});},{rootMargin:'0px 0px -8% 0px',threshold:.08});
    els.forEach(function(e){io.observe(e)});
  }
  requestAnimationFrame(function(){d.documentElement.classList.add('ready')});
  [].forEach.call(d.querySelectorAll('.js-mail'),function(a){
    var m=a.getAttribute('data-u')+'@'+a.getAttribute('data-d');
    a.href='mailto:'+m; if(a.hasAttribute('data-show')) a.textContent=m;
  });
  [].forEach.call(d.querySelectorAll('[data-yt]'),function(b){
    b.addEventListener('click',function(){
      var f=d.createElement('iframe');
      f.className='yt-frame'; f.allow='autoplay; encrypted-media; picture-in-picture; fullscreen'; f.allowFullscreen=true;
      f.title=b.getAttribute('data-title')||'Video';
      f.src='https://www.youtube-nocookie.com/embed/'+b.getAttribute('data-yt')+'?autoplay=1&rel=0';
      var host=b.closest('[data-player]')||b.parentNode; host.appendChild(f); host.classList.add('playing');
    });
  });
  // Laufender Timecode (25 Bilder pro Sekunde)
  var tc=[].slice.call(d.querySelectorAll('[data-tc]'));
  if(tc.length){
    var t0=performance.now(), p2=function(n){return (n<10?'0':'')+n};
    var tick=function(now){
      var f=Math.max(0,Math.floor((now-t0)/40)), s=Math.floor(f/25), txt=p2(Math.floor(s/3600))+':'+p2(Math.floor(s/60)%60)+':'+p2(s%60)+':'+p2(f%25);
      tc.forEach(function(e){e.textContent=txt});
      if(!reduce) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
  var cl=[].slice.call(d.querySelectorAll('[data-clock]'));
  if(cl.length){
    var ck=function(){var n=new Date();cl.forEach(function(e){e.textContent=n.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit',second:'2-digit'})})};
    ck(); setInterval(ck,1000);
  }
})();

(function(){
  var d=document, html=d.documentElement, R=GF.reduce, $=function(s,c){return (c||d).querySelector(s)}, $$=function(s,c){return [].slice.call((c||d).querySelectorAll(s))};
  var p2=function(n){return (n<10?'0':'')+n};
  var tcOf=function(fr){var s=Math.floor(fr/25);return p2(Math.floor(s/3600)+10)+':'+p2(Math.floor(s/60)%60)+':'+p2(s%60)+':'+p2(Math.floor(fr)%25)};
  var bootMs=html.classList.contains('ni')||!d.body.classList.contains('k-home')?150:1550;
  var inView=function(el,cb,th){if(!('IntersectionObserver' in window)){cb(true);return}new IntersectionObserver(function(en){en.forEach(function(x){cb(x.isIntersecting,x)})},{threshold:th||0}).observe(el)};

  // ---------- Menü auf dem Handy ----------
  var mb=$('.menu-btn'), mn=$('#mnav');
  if(mb&&mn){
    var setM=function(o){mb.setAttribute('aria-expanded',o?'true':'false');mn.hidden=!o};
    mb.addEventListener('click',function(){setM(mn.hidden)});
    $$('a',mn).forEach(function(a){a.addEventListener('click',function(){setM(false)})});
    d.addEventListener('keydown',function(e){if(e.key==='Escape')setM(false)});
  }

  // ---------- Aktiver Menüpunkt ----------
  var navs=$$('.nav a[href^="#"]');
  navs.forEach(function(a){var s=$(a.getAttribute('href'));if(s)inView(s,function(v){if(v){navs.forEach(function(o){o.classList.toggle('cur',o===a)})}},.35)});

  // ---------- Sucher im Titelbild ----------
  $$('[data-vf]').forEach(function(vf){
    var scr=$('.vf-scr',vf), tc=$('[data-vftc]',vf), tcm=$('.vf-tcm',vf), mode=$('.vf-mode',vf), btn=$('.vf-recbtn',vf), af=$('.vf-af',vf), fr=0, last=0, rec=false, free=!!tcm;
    var setRec=function(on){rec=on;vf.classList.toggle('is-rec',on);if(mode)mode.textContent=on?'REC':'STBY';if(btn)btn.setAttribute('aria-pressed',on?'true':'false')};
    // Timecode: "TC FREE" = echte Uhrzeit (Free Run), "TC REC" = läuft nur während der Aufnahme (Rec Run)
    var tod=function(){var n=new Date();return p2(n.getHours())+':'+p2(n.getMinutes())+':'+p2(n.getSeconds())+':'+p2(Math.floor(n.getMilliseconds()/40))};
    var paint=function(){if(tc)tc.textContent=free?tod():tcOf(fr)};
    var loop=function(now){if(rec&&last)fr+=(now-last)/40;last=now;paint();requestAnimationFrame(loop)};
    if(!R)requestAnimationFrame(loop); else paint();
    if(tcm){tcm.textContent='TC FREE';$('.vf-tcbtn',vf).addEventListener('click',function(e){e.stopPropagation();free=!free;tcm.textContent=free?'TC FREE':'TC REC';paint()})}
    if(btn){
      btn.addEventListener('click',function(e){e.stopPropagation();setRec(!rec)});
      setTimeout(function(){setRec(true);html.classList.add('booted')},bootMs+1900);
    }
    if(af&&matchMedia('(hover:hover)').matches){
      scr.addEventListener('mousemove',function(e){var r=scr.getBoundingClientRect();af.style.transform='translate('+(e.clientX-r.left)+'px,'+(e.clientY-r.top)+'px)'});
    }
    // Kamera-Einstellungen: ND, Blende, ISO, Verschluss (nie langsamer als 1/50) und Tonpegel
    var pop=$('.vf-pop',vf); if(!pop)return;
    var mix, mixOpen=function(){}, img=$('.vf-img',vf), aud=$('.vf-aud',vf), mm=$('.vf-mm',vf), rng=$('.vf-rng',pop), pl=$('.vf-pop-l',pop), pv=$('.vf-pop-v',pop), cur=null;
    var C={
      nd:{l:'ND-FILTER',v:['CLEAR','1/4','1/8','1/16','1/32','1/64','1/128'],st:[0,2,3,4,5,6,7],i:3,f:function(v){return 'ND '+v}},
      iris:{l:'BLENDE',v:['F1.4','F2','F2.8','F4','F5.6','F8','F11','F16'],i:2,f:function(v){return v}},
      iso:{l:'ISO',v:[100,200,400,800,1600,3200,6400,12800,25600],i:3,f:function(v){return 'ISO '+v}},
      shutter:{l:'VERSCHLUSS',v:[50,60,100,125,200,250,500,1000,2000],i:0,f:function(v){return '1/'+v}}
    };
    var val=function(k){var c=C[k];return c.v?c.v[c.i]:c.i};
    var apply=function(){
      var ev=(C.iso.i-3)-(C.iris.i-2)-(C.nd.st[C.nd.i]-4)-Math.log(C.shutter.v[C.shutter.i]/50)/Math.LN2;
      img.style.setProperty('--ex',Math.min(3.2,Math.max(.06,Math.pow(2,ev*.55))).toFixed(3));
      img.style.setProperty('--ct',(ev>1?Math.max(.7,1-(ev-1)*.09):1).toFixed(3));
      scr.style.setProperty('--gr',(Math.max(0,C.iso.i-3)*.08).toFixed(2));
      var r=Math.round(ev*10)/10;
      mm.textContent='M.M '+(r>0?'+':r<0?'−':'±')+Math.abs(r).toFixed(1);
      mm.className='vf-mm'+(Math.abs(r)>=2?' over':Math.abs(r)>=1?' warn':'');
      ['nd','iris','iso','shutter'].forEach(function(k){var b=$('[data-v="'+k+'"]',vf);if(b)b.textContent=C[k].f(val(k))});
      if(cur){pv.textContent=C[cur].f(val(cur));rng.value=C[cur].i}
    };
    var close=function(){cur=null;pop.hidden=true;$$('[data-ctl]',vf).forEach(function(b){b.setAttribute('aria-expanded','false')})};
    var open=function(k){
      if(cur===k){close();return}
      cur=k;var c=C[k];
      pl.textContent=c.l;rng.min=c.v?0:c.min;rng.max=c.v?c.v.length-1:c.max;rng.step=1;rng.value=c.i;rng.setAttribute('aria-label',c.l);
      pop.hidden=false;
      $$('[data-ctl]',vf).forEach(function(b){b.setAttribute('aria-expanded',b.getAttribute('data-ctl')===k?'true':'false')});
      apply();
    };
    $$('[data-ctl]',vf).forEach(function(b){b.addEventListener('click',function(e){e.stopPropagation();if(mix&&!mix.hidden)mixOpen(false);open(b.getAttribute('data-ctl'))})});
    rng.addEventListener('input',function(){C[cur].i=+rng.value;apply()});
    $$('.vf-step',pop).forEach(function(b){b.addEventListener('click',function(e){
      e.stopPropagation();var c=C[cur],dd=+b.getAttribute('data-step')*(c.step||1);
      c.i=c.v?Math.min(c.v.length-1,Math.max(0,c.i+dd)):Math.min(c.max,Math.max(c.min,c.i+dd));apply();
    })});
    $('.vf-pop-x',pop).addEventListener('click',function(e){e.stopPropagation();close()});
    pop.addEventListener('click',function(e){e.stopPropagation()});
    d.addEventListener('click',function(){if(cur)close()});
    d.addEventListener('keydown',function(e){if(e.key==='Escape'&&cur)close()});
    apply();
    // ---------- Mini-Mischpult: vier Kanäle mit Fadern, Pegeln und Stummschaltung ----------
    mix=$('.mix',vf); var vfM=$$('.vf-aud i b',vf);
    if(mix){
      var strips=$$('.mxs',mix), CH=[{b:.62},{b:.55},{b:.48},{b:.34}];
      // Fader-Weg (0 unten … 1 oben) in dB: 0 = −∞, .25 = −20, .5 = −10, .75 = 0, 1 = +12
      var P2DB=[[0,-60],[.25,-20],[.5,-10],[.75,0],[1,12]];
      var toDb=function(p){if(p<=.01)return -Infinity;for(var k=1;k<P2DB.length;k++){if(p<=P2DB[k][0]){var a=P2DB[k-1],b=P2DB[k];return a[1]+(b[1]-a[1])*(p-a[0])/(b[0]-a[0])}}return 12};
      var fmtDb=function(v){if(v===-Infinity)return '−∞';var r=Math.round(v);return (r>0?'+':r<0?'−':'±')+Math.abs(r)};
      CH.forEach(function(c,k){
        var st=strips[k], fd=$('.fader',st), cap=$('.fader-cap',st), db=$('.strip-db',st), mu=$('.mute',st);
        c.p=.75;c.mute=false;c.lv=c.b;c.tg=c.b;c.mtr=$('.mtr b',st);
        var set=function(p){c.p=Math.min(1,Math.max(0,p));cap.style.setProperty('--t',(1-c.p).toFixed(3));var v=toDb(c.p);c.g=v===-Infinity?0:Math.pow(10,v/20);db.textContent=fmtDb(v)+' dB';fd.setAttribute('aria-valuenow',v===-Infinity?-60:Math.round(v));fd.setAttribute('aria-valuetext',fmtDb(v)+' dB')};
        var fromY=function(e){var r=fd.getBoundingClientRect();set(1-(e.clientY-r.top)/r.height)};
        fd.addEventListener('pointerdown',function(e){e.preventDefault();e.stopPropagation();try{fd.setPointerCapture(e.pointerId)}catch(x){}fd._drag=1;fromY(e)});
        fd.addEventListener('pointermove',function(e){if(fd._drag)fromY(e)});
        ['pointerup','pointercancel'].forEach(function(t){fd.addEventListener(t,function(){fd._drag=0})});
        fd.addEventListener('keydown',function(e){var s={ArrowUp:.02,ArrowRight:.02,ArrowDown:-.02,ArrowLeft:-.02,PageUp:.1,PageDown:-.1}[e.key];if(s){e.preventDefault();set(c.p+s)}});
        mu.addEventListener('click',function(e){e.stopPropagation();c.mute=!c.mute;mu.setAttribute('aria-pressed',c.mute?'true':'false');st.classList.toggle('muted',c.mute)});
        set(.75);
      });
      // Pegel per Skript (funktioniert in allen Browsern gleich)
      var lt=0;
      var meter=function(now){
        if(now-lt>110){lt=now;CH.forEach(function(c){c.tg=c.b*(.45+Math.random()*.75)})}
        CH.forEach(function(c,k){
          c.lv+=(c.tg-c.lv)*.25;
          var l=c.mute?0:Math.min(1,c.lv*c.g), h=((1-l)*100).toFixed(1)+'%';
          c.mtr.style.height=h; if(vfM[k])vfM[k].style.height=h;
          strips[k].classList.toggle('clip',l>.97);
        });
        if(!R)requestAnimationFrame(meter);
      };
      requestAnimationFrame(meter);
      mixOpen=function(o){mix.hidden=!o;aud.setAttribute('aria-expanded',o?'true':'false');if(o){close();var f=$('.fader',mix);if(f)f.focus({preventScroll:true})}};
      aud.addEventListener('click',function(e){e.stopPropagation();mixOpen(mix.hidden)});
      $('.mix-x',mix).addEventListener('click',function(e){e.stopPropagation();mixOpen(false)});
      mix.addEventListener('click',function(e){e.stopPropagation()});
      mix.addEventListener('pointerdown',function(e){e.stopPropagation()});
      d.addEventListener('click',function(){if(!mix.hidden)mixOpen(false)});
      d.addEventListener('keydown',function(e){if(e.key==='Escape'&&!mix.hidden)mixOpen(false)});
    }
  });

  // ---------- Zahlen zählen hoch ----------
  $$('[data-count]').forEach(function(el){
    var to=+el.getAttribute('data-count'), from=to>1000?to-26:0;
    if(R)return;
    el.textContent=from;
    inView(el,function(v){
      if(!v||el._done)return; el._done=1; var t0=performance.now();
      (function step(now){var k=Math.min(1,(now-t0)/1200), e=1-Math.pow(1-k,3);el.textContent=Math.round(from+(to-from)*e);if(k<1)requestAnimationFrame(step)})(t0);
    },.6);
  });

  // ---------- Avid-Timeline ----------
  var av=$('.avid');
  if(av){
    var clips=$$('.av-clip',av), data=$$('.av-data p',av), ph=$('.av-ph',av), tlw=$('.av-tlw',av), tl=$('.av-tl',av), scrn=$('.av-scr',av), lanes=$$('.av-lane',av);
    var tcEl=$('[data-avtc]',av), chip=$('.av-chip',av), title=$('.av-title',av), text=$('.av-text',av), meta=$('.av-meta',av);
    var nEl=$('.av-n',av), inEl=$('.av-in',av), outEl=$('.av-out',av), durEl=$('.av-dur',av);
    var TOTAL=30*60*25, DUR=28000, U=100/30, pos=0, playing=false, act=-1, seen=false, visible=false, lt=0, userScroll=0;
    var A=function(c){return +c.dataset.a}, B=function(c){return +c.dataset.b};
    var home=clips.map(function(c){return {lane:c.parentNode,a:A(c),b:B(c)}});
    var order=function(){return clips.map(function(c,i){return i}).sort(function(x,y){return A(clips[x])-A(clips[y])||(clips[x].parentNode.dataset.tr<clips[y].parentNode.dataset.tr?-1:1)})};
    var isOn=function(c){return !c.parentNode.parentNode.classList.contains('off')};
    var fmt=function(pct){return tcOf(pct/100*TOTAL)}, dur=function(pct){var f=Math.round(pct/100*TOTAL),s=Math.floor(f/25);return '00:'+p2(Math.floor(s/60))+':'+p2(s%60)+':'+p2(f%25)};
    var show=function(k,force){
      if(k===act&&!force)return; act=k;
      clips.forEach(function(c,i){c.classList.toggle('on',i===k)});
      var c=clips[k], p=data[k], s=c.dataset.s;
      chip.className='av-chip t'+s; chip.textContent=c.parentNode.dataset.tr+' · '+p.dataset.chip.split(' · ')[1];
      title.textContent=p.firstChild.textContent; text.textContent=p.lastChild.textContent; meta.textContent='Teil von: '+p.dataset.svc;
      nEl.textContent=p2(order().indexOf(k)+1); inEl.textContent=fmt(A(c)); outEl.textContent=fmt(B(c)); durEl.textContent=dur(B(c)-A(c));
      scrn.classList.remove('swap'); void scrn.offsetWidth; scrn.classList.add('swap');
    };
    var empty=function(){
      if(act===-2)return; act=-2; clips.forEach(function(c){c.classList.remove('on')});
      chip.className='av-chip'; chip.textContent='Kein Signal'; title.textContent='Spur ausgeschaltet';
      text.textContent='An dieser Stelle liegt nur Material auf ausgeschalteten Spuren. Schalten Sie die Spur links wieder ein.'; meta.textContent='';
      inEl.textContent=outEl.textContent='--:--:--:--'; durEl.textContent='--:--:--:--';
    };
    var pick=function(){
      var best=-1,ba=-1,any=false;
      clips.forEach(function(c,i){var a=A(c),b=B(c);if(pos*100>=a&&pos*100<b){any=true;if(isOn(c)&&a>ba){ba=a;best=i}}});
      if(best>=0)show(best); else if(any||(act>=0&&!isOn(clips[act])))empty();
    };
    var draw=function(){
      ph.style.setProperty('--p',pos.toFixed(5)); tcEl.textContent=tcOf(pos*TOTAL);
      if(playing&&tlw.scrollWidth>tlw.clientWidth&&Date.now()-userScroll>2500){
        var lab=parseFloat(getComputedStyle(tl).getPropertyValue('--lab'))||100, x=lab+pos*(tl.offsetWidth-lab-14);
        if(x<tlw.scrollLeft+lab+20||x>tlw.scrollLeft+tlw.clientWidth-40)tlw.scrollLeft=x-lab-30;
      }
    };
    var tick=function(now){
      if(!playing){lt=0;return}
      if(lt)pos+=(now-lt)/DUR; lt=now;
      if(pos>=1)pos=0;
      pick(); draw(); requestAnimationFrame(tick);
    };
    var play=function(o){
      if(o===playing)return; playing=o; av.classList.toggle('playing',o);
      $('.av-play',av).setAttribute('aria-label',o?'Pause':'Abspielen');
      if(o){lt=0;requestAnimationFrame(tick)}
    };
    var jump=function(k){pos=A(clips[k])/100+.0005;show(k,true);draw()};
    clips.forEach(function(c,i){c.addEventListener('click',function(e){e.stopPropagation();if(c._moved){c._moved=false;return}play(false);jump(i)})});
    $('[data-av="play"]',av).addEventListener('click',function(){play(!playing)});
    var step=function(dir){var o=order().filter(function(i){return isOn(clips[i])});if(!o.length)return;var i=o.indexOf(act);i=i<0?0:(i+dir+o.length)%o.length;play(false);jump(o[i])};
    $('[data-av="prev"]',av).addEventListener('click',function(){step(-1)});
    $('[data-av="next"]',av).addEventListener('click',function(){step(1)});

    // Spuren ein- und ausschalten (wie die Spur-Schalter im Schnittprogramm)
    $$('.av-tsel',av).forEach(function(b){b.addEventListener('click',function(e){
      e.stopPropagation();var tr=b.closest('.av-tr'),off=!tr.classList.contains('off');
      tr.classList.toggle('off',off);b.setAttribute('aria-pressed',off?'false':'true');
      if(act>=0&&!isOn(clips[act]))act=-1; pick(); if(act===-1)pick();
    })});

    // Clips verschieben: lange drücken, dann ziehen. Bild bleibt auf V-Spuren, Ton auf A-Spuren.
    var drag=null, pend=null;
    var laneAt=function(y,kind){var best=null;lanes.forEach(function(l){if(l.dataset.kind!==kind)return;var r=l.getBoundingClientRect();if(y>=r.top-6&&y<=r.bottom+6)best=l});return best};
    var free=function(lane,a,b,self){return !$$('.av-clip',lane).some(function(o){return o!==self&&a<B(o)-.001&&b>A(o)+.001})};
    var place=function(c,lane,a,b){if(c.parentNode!==lane)lane.appendChild(c);c.dataset.a=a.toFixed(4);c.dataset.b=b.toFixed(4);c.style.left=a+'%';c.style.width=(b-a)+'%'};
    var startDrag=function(c,x){
      var r=c.parentNode.getBoundingClientRect();
      drag={c:c,lane0:c.parentNode,a0:A(c),b0:B(c),w:B(c)-A(c),off:(x-r.left)/r.width*100-A(c),ok:true};
      play(false);c.classList.add('drag');av.classList.add('dragging');
      try{navigator.vibrate&&navigator.vibrate(12)}catch(e){}
    };
    var moveDrag=function(x,y){
      var c=drag.c, lane=laneAt(y,c.parentNode.dataset.kind)||c.parentNode, r=lane.getBoundingClientRect();
      var a=(x-r.left)/r.width*100-drag.off;
      a=Math.round(a/U)*U; a=Math.max(0,Math.min(100-drag.w,a));
      var b=a+drag.w; drag.ok=free(lane,a,b,c);
      place(c,lane,a,b); c.classList.toggle('bad',!drag.ok); c.setAttribute('data-tc',fmt(a).slice(3,8));
    };
    var endDrag=function(){
      var c=drag.c; if(!drag.ok)place(c,drag.lane0,drag.a0,drag.a0+drag.w);
      c.classList.remove('drag','bad');c.removeAttribute('data-tc');av.classList.remove('dragging');c._moved=true;
      var k=clips.indexOf(c); drag=null; act=-1; show(k,true); pos=A(c)/100+.0005; draw();
      setTimeout(function(){c._moved=false},400);
    };
    clips.forEach(function(c){
      c.addEventListener('contextmenu',function(e){e.preventDefault()});
      c.addEventListener('pointerdown',function(e){
        if(e.button>0)return;
        pend={c:c,x:e.clientX,y:e.clientY,t:setTimeout(function(){if(pend&&pend.c===c){startDrag(c,pend.x);pend=null}},320)};
      });
    });
    addEventListener('pointermove',function(e){
      if(pend&&(Math.abs(e.clientX-pend.x)>8||Math.abs(e.clientY-pend.y)>8)){clearTimeout(pend.t);pend=null}
      if(pend){pend.x=e.clientX;pend.y=e.clientY}
      if(drag){e.preventDefault();moveDrag(e.clientX,e.clientY)}
    },{passive:false});
    ['pointerup','pointercancel'].forEach(function(t){addEventListener(t,function(){if(pend){clearTimeout(pend.t);pend=null}if(drag)endDrag()})});
    tlw.addEventListener('touchmove',function(e){if(drag)e.preventDefault()},{passive:false});
    var rs=$('.av-reset',av);
    if(rs)rs.addEventListener('click',function(){
      clips.forEach(function(c,i){place(c,home[i].lane,home[i].a,home[i].b)});
      $$('.av-tr',av).forEach(function(t){t.classList.remove('off')});$$('.av-tsel',av).forEach(function(b){b.setAttribute('aria-pressed','true')});
      play(false);pos=0;act=-1;show(0,true);draw();
    });

    // Scrubben auf Lineal und freien Spurflächen
    var scrub=function(e){
      var lane=$('.av-rul',av).getBoundingClientRect(), x=(e.touches?e.touches[0].clientX:e.clientX);
      pos=Math.min(.9999,Math.max(0,(x-lane.left)/lane.width)); pick(); draw();
    };
    var scrubbing=false;
    $$('.av-rul,.av-lane',av).forEach(function(el){el.addEventListener('pointerdown',function(e){if(e.target.closest('.av-clip'))return;scrubbing=true;play(false);scrub(e)})});
    addEventListener('pointermove',function(e){if(scrubbing)scrub(e)});
    addEventListener('pointerup',function(){scrubbing=false});
    tlw.addEventListener('touchstart',function(){userScroll=Date.now()},{passive:true});
    tlw.addEventListener('wheel',function(){userScroll=Date.now()},{passive:true});
    // J K L wie im Schnittprogramm
    d.addEventListener('keydown',function(e){
      if(!visible||e.metaKey||e.ctrlKey||e.altKey||/INPUT|TEXTAREA/.test(e.target.tagName))return;
      var k=e.key.toLowerCase();
      if(k==='l')play(true); else if(k==='k')play(false); else if(k==='j')step(-1);
    });
    show(0); draw();
    inView(av,function(v){visible=v;if(v&&!seen){seen=true;av.classList.add('in');if(!R)setTimeout(function(){if(visible&&!drag)play(true)},1200)}else if(!v&&playing)play(false)},.3);
  }

  // ---------- Produktionen: Filter, "Alle zeigen", Vorschau ----------
  var list=$('.rundown');
  if(list){
    var rows=$$('.row',list), fb=$$('.filter button'), more=$('.more-btn');
    var openAll=function(){list.removeAttribute('data-collapsed');if(more){more.setAttribute('aria-expanded','true');more.hidden=true}};
    if(more)more.addEventListener('click',openAll);
    // Sender-Kacheln im Profil springen zur gefilterten Liste
    $$('[data-goto]').forEach(function(t){t.addEventListener('click',function(){
      var b=$('.filter button[data-f="'+t.getAttribute('data-goto')+'"]'); if(b)b.click();
      var w=$('#produktionen'); scrollTo({top:w.getBoundingClientRect().top+scrollY-70,behavior:R?'auto':'smooth'});
    })});
    fb.forEach(function(b){b.addEventListener('click',function(){
      var f=b.getAttribute('data-f');
      var apply=function(){
        fb.forEach(function(o){o.setAttribute('aria-pressed',o===b?'true':'false')});
        if(f!=='*')openAll();
        rows.forEach(function(r){r.hidden=!(f==='*'||r.getAttribute('data-sender')===f)});
      };
      if(d.startViewTransition&&!R)d.startViewTransition(apply);else apply();
    })});
    var peek=$('.peek');
    if(peek&&matchMedia('(hover:hover)').matches){
      var pi=$('img',peek), pt=$('.pk-tr',peek), x=0,y=0,tx=0,ty=0,on=false,raf=0;
      var loop=function(){x+=(tx-x)*.16;y+=(ty-y)*.16;peek.style.transform='translate3d('+x+'px,'+y+'px,0) scale('+(on?1:.92)+')';raf=on?requestAnimationFrame(loop):0};
      rows.forEach(function(r){
        r.addEventListener('mouseenter',function(){pi.src=r.getAttribute('data-img');pt.textContent=r.getAttribute('data-sender')+' · '+r.getAttribute('data-fmt');peek.classList.add('on');on=true;if(!raf)raf=requestAnimationFrame(loop)});
        r.addEventListener('mouseleave',function(){peek.classList.remove('on');on=false});
      });
      d.addEventListener('mousemove',function(e){
        var w=peek.offsetWidth,h=peek.offsetHeight;
        tx=Math.min(e.clientX+28,innerWidth-w-14); ty=Math.min(Math.max(e.clientY-h/2,14),innerHeight-h-14);
        if(!on){x=tx;y=ty}
      },{passive:true});
    }
  }

  // ---------- Behind the Scenes: Galerie zum Wischen + Großansicht ----------
  var gal=$('.gal');
  if(gal){
    var figs=$$('figure',gal), cnt=$('.bts-c b'), lb=$('.lb'), lbi=lb&&$('img',lb), lbc=lb&&$('.lb-c',lb), cur=0, last=null;
    var idx=function(){var g=gal.getBoundingClientRect(),best=0,bd=1e9;figs.forEach(function(f,i){var dd=Math.abs(f.getBoundingClientRect().left-g.left-parseFloat(getComputedStyle(gal).paddingLeft));if(dd<bd){bd=dd;best=i}});return best};
    var go=function(i){i=Math.max(0,Math.min(figs.length-1,i));gal.scrollTo({left:figs[i].offsetLeft-figs[0].offsetLeft,behavior:R?'auto':'smooth'})};
    gal.addEventListener('scroll',function(){if(cnt)cnt.textContent=p2(idx()+1)},{passive:true});
    $$('[data-bts]').forEach(function(b){b.addEventListener('click',function(){go(idx()+(+b.getAttribute('data-bts')))})});
    var show=function(i){cur=(i+figs.length)%figs.length;var b=$('.gal-b',figs[cur]);lbi.src=b.getAttribute('data-full');lbi.alt=$('img',b).alt;lbc.textContent=p2(cur+1)+' / '+p2(figs.length)};
    var open=function(i){last=d.activeElement;show(i);lb.hidden=false;d.documentElement.classList.add('lb-on');$('.lb-x',lb).focus({preventScroll:true})};
    var close=function(){lb.hidden=true;d.documentElement.classList.remove('lb-on');go(cur);if(last)last.focus({preventScroll:true})};
    if(lb){
      figs.forEach(function(f,i){$('.gal-b',f).addEventListener('click',function(){open(i)})});
      $('.lb-x',lb).addEventListener('click',close);
      $('.lb-p',lb).addEventListener('click',function(e){e.stopPropagation();show(cur-1)});
      $('.lb-n',lb).addEventListener('click',function(e){e.stopPropagation();show(cur+1)});
      lb.addEventListener('click',function(e){if(e.target===lb)close()});
      d.addEventListener('keydown',function(e){if(lb.hidden)return;if(e.key==='Escape')close();else if(e.key==='ArrowLeft')show(cur-1);else if(e.key==='ArrowRight')show(cur+1)});
      var sx=null;lb.addEventListener('pointerdown',function(e){sx=e.clientX});lb.addEventListener('pointerup',function(e){if(sx===null)return;var dx=e.clientX-sx;sx=null;if(Math.abs(dx)>45)show(cur+(dx<0?1:-1))});
    }
  }

  // ---------- Karussell der Minispiele ----------
  var rail=$('.rail');
  if(rail){
    var cards=$$('.game',rail), dots=$$('.rail-dots i');
    var cur=function(){var best=0,bd=1e9;cards.forEach(function(c,i){var dd=Math.abs(c.getBoundingClientRect().left-rail.getBoundingClientRect().left-parseFloat(getComputedStyle(rail).paddingLeft));if(dd<bd){bd=dd;best=i}});return best};
    $$('[data-rail]').forEach(function(b){b.addEventListener('click',function(){
      var i=Math.min(cards.length-1,Math.max(0,cur()+(+b.getAttribute('data-rail'))));
      rail.scrollTo({left:cards[i].offsetLeft-cards[0].offsetLeft,behavior:R?'auto':'smooth'});
    })});
    rail.addEventListener('scroll',function(){var i=cur();dots.forEach(function(t,k){t.classList.toggle('on',k===i)})},{passive:true});
  }

  // ---------- Fußzeile: Timeline-Balken ----------
  var ft=$('.foot-tl'); if(ft&&R)ft.classList.add('in'); else if(ft)inView(ft,function(v){if(v)ft.classList.add('in')},.5);

  // ---------- Easter Eggs ----------
  var buf='', KON='ArrowUpArrowUpArrowDownArrowDownArrowLeftArrowRightArrowLeftArrowRightba';
  var tone=function(){try{var A=new (window.AudioContext||window.webkitAudioContext)(),o=A.createOscillator(),g=A.createGain();o.frequency.value=1000;g.gain.value=.06;o.connect(g);g.connect(A.destination);o.start();o.stop(A.currentTime+1.2)}catch(e){}};
  var testcard=function(){
    if($('.egg'))return;
    var e=d.createElement('div');e.className='egg';e.setAttribute('role','dialog');e.setAttribute('aria-label','Testbild');
    e.innerHTML='<div class="intro-bars">'+'<i></i>'.repeat(7)+'</div><div class="intro-low">'+'<i></i>'.repeat(6)+'</div><p><b>Sendeschluss.</b>Gut gemacht, Cheat-Code erkannt. Klick oder Esc beendet das Testbild.</p>';
    var close=function(){e.remove();d.removeEventListener('keydown',esc)}, esc=function(k){if(k.key==='Escape')close()};
    e.addEventListener('click',close); d.addEventListener('keydown',esc); d.body.appendChild(e); tone();
  };
  var slate=function(){
    if($('.slate'))return;
    var s=d.createElement('div');s.className='slate';s.setAttribute('aria-hidden','true');
    s.innerHTML='<svg viewBox="0 0 420 300"><g class="arm"><rect x="10" y="20" width="400" height="46" rx="4" fill="#111"/><path d="M40 20l40 46M120 20l40 46M200 20l40 46M280 20l40 46M360 20l40 46" stroke="#fff" stroke-width="22"/></g><rect x="10" y="74" width="400" height="216" rx="6" fill="#111"/><path d="M10 74h400M10 140h400M10 206h400M210 140v150" stroke="#555" stroke-width="2"/><text x="26" y="118" fill="#fff" font-family="Instrument Sans,Arial" font-weight="700" font-size="30">GESCHICHTENFABRIK.TV</text><text x="26" y="185" fill="#aaa" font-family="monospace" font-size="18">SZENE</text><text x="110" y="187" fill="#fff" font-family="monospace" font-size="34">1</text><text x="226" y="185" fill="#aaa" font-family="monospace" font-size="18">TAKE</text><text x="300" y="187" fill="#fff" font-family="monospace" font-size="34">1</text><text x="26" y="255" fill="#ffd60a" font-family="Instrument Sans,Arial" font-weight="700" font-size="28">Und … Action!</text><text x="226" y="255" fill="#fff" font-family="monospace" font-size="18">'+new Date().toLocaleDateString('de-DE')+'</text></svg>';
    d.body.appendChild(s); setTimeout(function(){s.remove()},2000);
  };
  d.addEventListener('keydown',function(e){
    if(/INPUT|TEXTAREA/.test(e.target.tagName))return;
    buf=(buf+e.key).slice(-80);
    if(buf.slice(-KON.length)===KON){buf='';testcard()}
    else if(buf.toLowerCase().slice(-6)==='action'){buf='';slate()}
  });
  if(window.console&&console.log)console.log('%c● REC  GESCHICHTENFABRIK.TV','background:#0b0c0e;color:#fff;padding:6px 10px;font:600 13px monospace','\nSie lesen Quelltext? Dann passen Sie vielleicht zu uns. Tipp: Tippen Sie auf der Seite einmal „action“.');
})();

// Drehpause: vier Minispiele im Karussell. Alles läuft lokal, Bestwerte bleiben nur in diesem Browser.
(function(){
  var d=document, cards=[].slice.call(d.querySelectorAll('.game'));
  if(!cards.length)return;
  var store={get:function(k){try{return localStorage.getItem(k)}catch(e){return null}},set:function(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
  var active=null, rnd=function(a,b){return a+Math.random()*(b-a)}, clamp=function(v,a,b){return v<a?a:v>b?b:v};
  var fmtN=function(n){return Math.round(n).toLocaleString('de-DE')};
  var rr=function(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()};

  function mk(el,impl){
    var stage=el.querySelector('.g-stage'), cv=el.querySelector('.g-cv'), ov=el.querySelector('.g-ov'), msg=el.querySelector('.g-msg'), btn=el.querySelector('.g-start'), hud=el.querySelector('.g-hud'), bestEl=el.querySelector('.g-best b'), kick=el.querySelector('.g-kick');
    var key='gf-best-'+el.getAttribute('data-game')+(impl.ver||''), lt=0, mis=d.createElement('p'), mt=0;
    mis.className='g-mis';mis.setAttribute('aria-live','polite');stage.appendChild(mis);
    var G={el:el,stage:stage,cv:cv,c:cv.getContext('2d'),W:0,H:0,running:false,
      hud:function(t){hud.textContent=t||''},
      say:function(t,k){mis.innerHTML='<small>'+(k||'Mission')+'</small>'+t;mis.classList.add('on');clearTimeout(mt);mt=setTimeout(function(){mis.classList.remove('on')},2600)},
      size:function(){var r=stage.getBoundingClientRect(),p=Math.min(window.devicePixelRatio||1,2);if(!r.width)return;cv.width=Math.round(r.width*p);cv.height=Math.round(r.height*p);G.W=r.width;G.H=r.height;G.c.setTransform(p,0,0,p,0,0);if(!G.running&&impl.idle)impl.idle(G)},
      finish:function(html,score){
        G.running=false;el.classList.remove('run');el.classList.add('done');active=null;G.hud('');mis.classList.remove('on');
        var b=store.get(key), rec=false;
        if(score!=null&&(b==null||impl.better(score,+b))){store.set(key,score);b=score;rec=true}
        if(b!=null)bestEl.textContent=impl.fmt(+b);
        kick.textContent=rec?'Neuer Bestwert':'Ergebnis';
        msg.innerHTML=html; btn.lastChild.textContent=' Nochmal'; ov.hidden=false; btn.focus({preventScroll:true});
      },
      abort:function(){if(!G.running)return;G.running=false;mis.classList.remove('on');el.classList.remove('run');active=null;G.hud('');kick.textContent='Pausiert';msg.textContent=impl.how||msg.textContent;btn.lastChild.textContent=' Neu starten';ov.hidden=false;if(impl.stop)impl.stop(G);if(impl.idle)impl.idle(G)}
    };
    var b0=store.get(key); if(b0!=null)bestEl.textContent=impl.fmt(+b0);
    impl.how=msg.textContent;
    var loop=function(now){if(!G.running)return;var dt=lt?Math.min(.05,(now-lt)/1000):0;lt=now;impl.frame(G,dt);requestAnimationFrame(loop)};
    btn.addEventListener('click',function(){
      if(active&&active!==G)active.abort();
      G.size();active=G;G.running=true;el.classList.add('run');el.classList.remove('done');ov.hidden=true;lt=0;impl.start(G);requestAnimationFrame(loop);
    });
    stage.addEventListener('pointerdown',function(e){if(!G.running||e.target.closest('.g-ov'))return;if(!e.target.closest("button"))try{stage.setPointerCapture(e.pointerId)}catch(x){}if(impl.down){impl.down(G,e);if(e.pointerType!=='mouse')e.preventDefault()}});
    stage.addEventListener('pointermove',function(e){if(G.running&&impl.move)impl.move(G,e)});
    ['pointerup','pointercancel','pointerleave'].forEach(function(t){stage.addEventListener(t,function(e){if(G.running&&impl.up)impl.up(G,e)})});
    stage.addEventListener('contextmenu',function(e){if(G.running)e.preventDefault()});
    if('IntersectionObserver' in window)new IntersectionObserver(function(en){en.forEach(function(x){if(!x.isIntersecting||x.intersectionRatio<.45)G.abort()})},{threshold:[0,.45]}).observe(el);
    G.impl=impl; impl.init&&impl.init(G);
    return G;
  }
  var all=[];
  // Finger-Gesten im laufenden Spiel nicht an die Seite weitergeben (sonst scrollt das Karussell)
  cards.forEach(function(el){el.querySelector('.g-stage').addEventListener('touchmove',function(e){if(el.classList.contains('run'))e.preventDefault()},{passive:false})});
  d.addEventListener('keydown',function(e){if(!active||!active.impl.key)return;if(active.impl.key(active,e,true)!==false)e.preventDefault()});
  d.addEventListener('keyup',function(e){if(active&&active.impl.key)active.impl.key(active,e,false)});
  d.addEventListener('visibilitychange',function(){if(d.hidden&&active)active.abort()});
  var rs=0; addEventListener('resize',function(){clearTimeout(rs);rs=setTimeout(function(){all.forEach(function(g){g.size()})},120)});

  // =====================================================================
  // 1) Tonangel: echte Drehszenen. Mikro über die sprechende Person, Windkorb auf sie ausrichten,
  //    Pegel im grünen Bereich halten und die Angel nicht ins Bild hängen.
  // =====================================================================
  var TON=(function(){
    var aim=null, T=25, t, mx, my, tx, ty, th, rot=0, act, nextSw, lvl, good, inFrame, shout, mis, lastMis=-1, wind, flash, offAx, FT, box, IMG={};
    var LO=-18, HI=-6, RAD=Math.PI/180;
    // Köpfe in Prozent des Bildes (x, y), gemessen an den Originalbildern
    var MIS=[
      {img:'84ed29bb99',sy:.06,n:'Gespräch in der Küche',k:'Zwei Personen, ruhiger Dialog',h:[[31,33],[67,37]],L:[0,-2],sw:[2.2,3.6],shout:.05,wind:0},
      {img:'5990f27b4d',sy:.12,n:'Abendinterview auf der Terrasse',k:'Leise Stimmen, nah ran',h:[[52,33],[73,35]],L:[-6,-7],sw:[2,3.4],shout:0,wind:0},
      {img:'e10302302c',sy:.0,n:'Car-Talk im Auto',k:'Schnelle Wechsel, lautes Lachen',h:[[27,30],[67,26]],L:[1,0],sw:[1.1,2.1],shout:.35,wind:0},
      {img:'d5132a003d',sy:.1,n:'Außendreh im Schnee',k:'Vier Personen, Wind im Mikro',h:[[26.5,23],[41,23],[62.5,21],[79,21]],L:[0,-1,1,-1],sw:[1.6,2.8],shout:.1,wind:1},
      {img:'75d48f68ac',sy:.08,n:'Wasserpistolen-Test im Garten',k:'Drei Personen, laute Stellen',h:[[34,33],[49,40],[73,33]],L:[0,1,0],sw:[1.3,2.4],shout:.3,wind:.3},
      {img:'a9507e6621',sy:.1,n:'Badewannen-Test mit Familie',k:'Drei Personen, wechselnde Positionen',h:[[28,40],[48,40],[81,40]],L:[0,-3,-1],sw:[1.5,2.8],shout:.15,wind:0}
    ];
    function load(m){if(!IMG[m.img]){var im=new Image();im.src='img/'+m.img+'-m.webp';IMG[m.img]=im}return IMG[m.img]}
    function layout(G){
      FT=Math.round(G.H*.27);var im=IMG[mis.img],iw=1280,ih=720,sh=ih*(1-mis.sy),w=G.W,h=w*sh/iw;
      if(h<G.H-FT){h=G.H-FT;w=h*iw/sh}
      box={x:(G.W-w)/2,y:FT,w:w,h:h,sy:mis.sy};
    }
    function head(i){var p=mis.h[i];return {x:box.x+box.w*p[0]/100,y:box.y+box.h*((p[1]/100-box.sy)/(1-box.sy))}}
    function setup(G,m){mis=m;load(m);layout(G);act=0;nextSw=rnd(m.sw[0],m.sw[1]);var h=head(0);mx=tx=h.x+G.W*.12;my=ty=FT*.55;th=0;rot=0;lvl=-30;good=0;inFrame=0;shout=0;wind=0;flash=0;offAx=0;t=0}
    function level(G){
      var h=head(act),dx=h.x-mx,dy=h.y-my,dd=Math.max(G.W*.03,Math.sqrt(dx*dx+dy*dy));
      // Richtung des Windkorbs gegen Richtung zur Person (Richtmikrofon: seitlich deutlich leiser)
      var want=Math.atan2(dx,dy),diff=Math.abs(((want-th)/RAD+540)%360-180);offAx=diff;
      var att=diff<=15?0:diff<=90?-(diff-15)/75*18:-18-(diff-90)/90*8;
      return mis.L[act]+(shout>0?10:0)+att-20*Math.log(dd/(G.W*.045))/Math.LN10;
    }
    function draw(G){
      var c=G.c,W=G.W,H=G.H;c.clearRect(0,0,W,H);
      c.fillStyle='#0f1013';c.fillRect(0,0,W,H);
      var im=IMG[mis.img];
      if(im&&im.complete&&im.naturalWidth){var sy=im.naturalHeight*box.sy;c.drawImage(im,0,sy,im.naturalWidth,im.naturalHeight-sy,box.x,box.y,box.w,box.h)}
      c.fillStyle='rgba(0,0,0,.18)';c.fillRect(0,FT,W,H-FT);
      // Bereich außerhalb des Bildes
      var gr=c.createLinearGradient(0,0,0,FT);gr.addColorStop(0,'#0b0c0e');gr.addColorStop(1,'#1a1b1f');c.fillStyle=gr;c.fillRect(0,0,W,FT);
      c.strokeStyle='#ff2d20';c.setLineDash([10,7]);c.lineWidth=2;c.beginPath();c.moveTo(0,FT);c.lineTo(W,FT);c.stroke();c.setLineDash([]);
      c.font='600 11px Spline Sans Mono,monospace';c.fillStyle='#ff6b62';c.textAlign='left';c.fillText('BILDKANTE',12,FT-8);
      c.fillStyle='#7d828b';c.textAlign='right';c.fillText('außerhalb des Bildes',W-70,FT-8);c.textAlign='left';
      // Wer spricht?
      var h=head(act),pr=W*.045+Math.sin(t*9)*2;
      c.strokeStyle=shout>0?'#ff2d20':'rgba(255,255,255,.9)';c.lineWidth=2;
      for(var k=0;k<2;k++){c.globalAlpha=.9-k*.45;c.beginPath();c.arc(h.x,h.y,pr+k*9+((t*30)%9),0,Math.PI*2);c.stroke()}c.globalAlpha=1;
      var tag=shout>0?'LAUT!':'spricht';c.font='700 12px Spline Sans Mono,monospace';var tw=c.measureText(tag).width+12;
      c.fillStyle=shout>0?'#ff2d20':'#fff';rr(c,h.x-tw/2,h.y+pr+8,tw,18,4);c.fill();c.fillStyle=shout>0?'#fff':'#000';c.textAlign='center';c.fillText(tag,h.x,h.y+pr+21);c.textAlign='left';
      // Aufnahmekegel des Richtmikrofons
      var L=Math.max(W,H),dx=Math.sin(th),dy=Math.cos(th),on=offAx<=15;
      c.fillStyle=on?'rgba(61,220,132,.16)':'rgba(255,255,255,.08)';c.beginPath();c.moveTo(mx,my);
      c.lineTo(mx+Math.sin(th-15*RAD)*L,my+Math.cos(th-15*RAD)*L);c.lineTo(mx+Math.sin(th+15*RAD)*L,my+Math.cos(th+15*RAD)*L);c.closePath();c.fill();
      c.strokeStyle=on?'rgba(61,220,132,.7)':'rgba(255,255,255,.35)';c.lineWidth=1;c.setLineDash([4,5]);c.beginPath();c.moveTo(mx,my);c.lineTo(mx+dx*L,my+dy*L);c.stroke();c.setLineDash([]);
      // Angel
      var ox=W+30,oy=-30,hx=mx-dx*W*.045,hy=my-dy*W*.045;
      c.strokeStyle='#08090a';c.lineWidth=7;c.beginPath();c.moveTo(ox,oy);c.lineTo(hx,hy);c.stroke();
      c.strokeStyle='#4d5058';c.lineWidth=3;c.beginPath();c.moveTo(ox,oy);c.lineTo(hx,hy);c.stroke();
      c.strokeStyle='#1b1c1f';c.lineWidth=4;c.beginPath();c.moveTo(hx,hy);c.lineTo(mx-dx*W*.02,my-dy*W*.02);c.stroke();
      // Windkorb (Fell) in Blickrichtung
      var len=W*.07,wid=W*.022;c.save();c.translate(mx,my);c.rotate(-th);
      var fg=c.createLinearGradient(-wid,0,wid,0);fg.addColorStop(0,'#5d6068');fg.addColorStop(.5,my>FT-6?'#ff6b62':'#b9bcc3');fg.addColorStop(1,'#5d6068');
      c.fillStyle=fg;c.beginPath();c.ellipse(0,len*.15,wid,len*.62,0,0,Math.PI*2);c.fill();
      c.strokeStyle='rgba(225,228,233,.55)';c.lineWidth=1.2;
      for(var f=0;f<54;f++){var a=f/54*Math.PI*2,ex=Math.cos(a)*wid,ey=len*.15+Math.sin(a)*len*.62,o=3+((f*7)%5);c.beginPath();c.moveTo(ex,ey);c.lineTo(ex+Math.cos(a+.6)*o,ey+Math.sin(a+.6)*o);c.stroke()}
      c.fillStyle='rgba(0,0,0,.35)';c.beginPath();c.ellipse(0,len*.72,wid*.55,wid*.35,0,0,Math.PI*2);c.fill();
      c.restore();
      if(offAx>35&&G.running){c.font='700 12px Spline Sans Mono,monospace';c.fillStyle='#ffd60a';c.textAlign='center';c.fillText('↻ Mikro zur Person drehen',mx,Math.max(18,my-len*.7-8));c.textAlign='left'}
      if(flash>0){c.fillStyle='rgba(255,45,32,'+(flash*.3)+')';c.fillRect(0,FT,W,H-FT)}
      // Pegelanzeige
      var mw=Math.max(34,W*.045),mxp=W-mw-10,my0=FT+26,mh=H-my0-30,q=function(db){return my0+mh*(1-(Math.max(-40,Math.min(0,db))+40)/40)};
      c.fillStyle='rgba(8,9,11,.82)';rr(c,mxp-6,my0-22,mw+12,mh+44,6);c.fill();
      c.fillStyle='rgba(61,220,132,.22)';c.fillRect(mxp,q(HI),mw,q(LO)-q(HI));
      var lc=lvl>HI?'#ff2d20':lvl>=LO?'#3ddc84':'#7d828b';c.fillStyle=lc;c.fillRect(mxp+mw*.25,q(lvl),mw*.5,my0+mh-q(lvl));
      c.fillStyle='#fff';c.font='600 11px Spline Sans Mono,monospace';c.textAlign='center';c.fillText(Math.round(lvl)+' dB',mxp+mw/2,my0-8);c.fillText(lvl>HI?'LAUT':lvl>=LO?'GUT':'LEISE',mxp+mw/2,my0+mh+16);c.textAlign='left';
    }
    function pickMis(){var k;do{k=Math.floor(Math.random()*MIS.length)}while(k===lastMis);lastMis=k;return MIS[k]}
    return {
      init:function(G){
        MIS.forEach(load);
        var rb=G.el.querySelectorAll('[data-rot]');
        [].forEach.call(rb,function(b){
          var d=+b.getAttribute('data-rot');
          b.addEventListener('pointerdown',function(e){e.stopPropagation();e.preventDefault();rot=d});
          ['pointerup','pointerleave','pointercancel'].forEach(function(ev){b.addEventListener(ev,function(){if(rot===d)rot=0})});
        });
        G.stage.addEventListener('wheel',function(e){if(!G.running)return;e.preventDefault();th=clamp(th+(e.deltaY>0?1:-1)*6*RAD,-85*RAD,85*RAD)},{passive:false});
        aim=G.el.querySelector('.g-aim input');
        if(aim){aim.addEventListener('input',function(){th=clamp(+aim.value*RAD,-85*RAD,85*RAD);if(!G.running){level(G);draw(G)}});['pointerdown','touchstart'].forEach(function(ev){aim.addEventListener(ev,function(e){e.stopPropagation()},{passive:true})})}
        var im=IMG[MIS[0].img];im.addEventListener('load',function(){if(!G.running&&TON.idle)TON.idle(G)});
      },
      idle:function(G){setup(G,MIS[0]);var h=head(0);mx=h.x+G.W*.06;my=FT*.6;th=Math.atan2(h.x-mx,h.y-my);lvl=-12;level(G);draw(G)},
      start:function(G){setup(G,pickMis());if(aim)aim.value=0;G.say(mis.n+' · '+mis.k,'Drehtag')},
      frame:function(G,dt){
        t+=dt;
        nextSw-=dt;if(nextSw<=0){var n;do{n=Math.floor(Math.random()*mis.h.length)}while(n===act&&mis.h.length>1);act=n;nextSw=rnd(mis.sw[0],mis.sw[1]);shout=Math.random()<mis.shout?rnd(.8,1.4):0}
        if(shout>0)shout-=dt;
        th=clamp(th+rot*dt*110*RAD,-85*RAD,85*RAD);
        if(aim&&d.activeElement!==aim)aim.value=Math.round(th/RAD);
        mx+=(tx-mx)*Math.min(1,dt*7);my+=(ty-my)*Math.min(1,dt*7);
        wind+=((mis.wind?rnd(-1,1)*7*mis.wind:0)-wind)*.12;
        var target=level(G)+wind+rnd(-.8,.8);lvl+=(target-lvl)*Math.min(1,dt*10);
        var inF=my>FT-6;if(inF){inFrame+=dt;flash=1}else flash=Math.max(0,flash-dt*3);
        if(!inF&&lvl>=LO&&lvl<=HI)good+=dt;
        draw(G);
        var s=Math.max(0,T-t);G.hud('Guter Ton '+Math.round(good/Math.max(t,.01)*100)+' % · 0:'+(s<10?'0':'')+Math.ceil(s)+(inF?' · ANGEL IM BILD!':''));
        if(t>=T){rot=0;var p=Math.round(good/T*100);G.finish('<b>'+p+' % sauberer Ton</b>'+(inFrame>1?'Die Angel war '+inFrame.toFixed(1)+' s im Bild. ':'')+(p>=75?'Der Cutter dankt Ihnen. Kein Nachvertonen nötig.':p>=50?'Brauchbar, ein paar Stellen müssen wir reparieren.':'Das wird eine lange Nacht im Tonstudio. Nochmal?'),p)}
      },
      move:function(G,e){if(e.target&&e.target.closest&&e.target.closest('[data-rot]'))return;var r=G.stage.getBoundingClientRect();tx=clamp(e.clientX-r.left,20,G.W-70);ty=clamp(e.clientY-r.top,16,G.H*.62)},
      down:function(G,e){TON.move(G,e)},
      key:function(G,e,on){var v=on?1:0,k=e.key.toLowerCase();if(k==='q'||k==='a'){rot=on?-1:0;return}if(k==='e'||k==='d'){rot=on?1:0;return}if(e.key==='ArrowLeft'){tx=clamp(tx-24,20,G.W-70);return}if(e.key==='ArrowRight'){tx=clamp(tx+24,20,G.W-70);return}if(e.key==='ArrowUp'){ty=clamp(ty-18,16,G.H*.62);return}if(e.key==='ArrowDown'){ty=clamp(ty+18,16,G.H*.62);return}return false},
      stop:function(){rot=0},
      ver:'2',better:function(a,b){return a>b},fmt:function(v){return v+' % sauberer Ton'}
    };
  })();

  // =====================================================================
  // 2) Klappe! Ton anlegen
  // =====================================================================
  var KLAPPE=(function(){
    var FR=50, takes, take, x, spike, dur, phase, pt, off, wave, mis, sc, lastMis=-1;
    var MIS=[
      {n:'Interview in der Werkstatt',k:'Normale Takes',sp:1,decoy:0,amp:.95,noise:.12},
      {n:'Dreh an der Baustelle',k:'Achtung: Störgeräusche vor der Klappe',sp:1,decoy:.8,amp:.95,noise:.2},
      {n:'Leise Klappe im Krankenhaus',k:'Die Klappe ist kaum zu hören',sp:1,decoy:0,amp:.38,noise:.16},
      {n:'Tagesgeschäft im Frühstücksfernsehen',k:'Schnelle Takes',sp:1.35,decoy:.3,amp:.9,noise:.12},
      {n:'Außendreh im Wind',k:'Viel Grundrauschen',sp:1.1,decoy:.4,amp:.85,noise:.32}
    ];
    function newTake(){spike=rnd(.3,.82);dur=Math.max(1,(2.3-take*.22)/mis.sp);x=0;phase='run';off=null;
      var dec=Math.random()<mis.decoy?clamp(spike+(Math.random()<.6?-1:1)*rnd(.1,.22),.08,.94):-1;
      wave=[];for(var i=0;i<220;i++){var p=i/220,dd=p-spike,a=dd>=0&&dd<.05?(1-dd/.05)*mis.amp:0,de=p-dec,b=dec>0&&de>=0&&de<.035?(1-de/.035)*.7:0;wave.push(Math.max(a,b,.05+Math.random()*mis.noise*(.6+.4*Math.sin(i/7))))}}
    function draw(G){
      var c=G.c,W=G.W,H=G.H;c.fillStyle='#121317';c.fillRect(0,0,W,H);
      var top=36,vh=H*.5,cx=W/2,cy=top+vh/2;
      // Bildmonitor mit Klappe
      c.fillStyle='#000';c.fillRect(W*.12,top,W*.76,vh);
      var tt=(spike-x)*dur, ang=phase==='run'?(tt>.45?.42:tt>0?.42*(tt/.45):0):0;
      var sw=Math.min(W*.42,vh*1.1),sh=sw*.62,sx=cx-sw/2,sy=cy-sh/2+sh*.12;
      c.fillStyle='#16171a';rr(c,sx,sy+sh*.2,sw,sh*.8,6);c.fill();
      c.fillStyle='#fff';c.font='700 '+Math.round(sw*.07)+'px Instrument Sans,Arial';c.fillText('GESCHICHTENFABRIK.TV',sx+sw*.06,sy+sh*.42);
      c.fillStyle='#bbb';c.font=Math.round(sw*.055)+'px Spline Sans Mono,monospace';c.fillText('SZENE '+sc+'   TAKE '+(take+1),sx+sw*.06,sy+sh*.62);c.fillText('TON: A1',sx+sw*.06,sy+sh*.8);
      c.save();c.translate(sx,sy+sh*.2);c.rotate(-ang);c.fillStyle='#16171a';c.fillRect(0,-sh*.16,sw,sh*.15);c.fillStyle='#fff';for(var s=0;s<6;s++){c.beginPath();c.moveTo(sw*(s/6),-sh*.16);c.lineTo(sw*(s/6)+sw*.08,-sh*.16);c.lineTo(sw*(s/6)+sw*.13,-sh*.01);c.lineTo(sw*(s/6)+sw*.05,-sh*.01);c.fill()}c.restore();
      // Zeitleiste
      var ty=top+vh+18,tw=W*.84,tx=W*.08,trh=Math.max(46,H-ty-40);
      c.fillStyle='#202226';c.fillRect(tx,ty,tw,trh);
      c.fillStyle='#6b7078';c.font='11px Spline Sans Mono,monospace';c.fillText('A1',tx-26,ty+trh/2+4);
      for(var f=0;f<=FR;f++){c.fillStyle=f%5?'#3a3d44':'#6b7078';c.fillRect(tx+tw*f/FR,ty-(f%5?4:8),1,f%5?4:8)}
      c.strokeStyle='#3ddc84';c.lineWidth=1.2;c.beginPath();
      for(var i=0;i<wave.length;i++){var wx=tx+tw*i/wave.length,a=wave[i]*trh*.46;c.moveTo(wx,ty+trh/2-a);c.lineTo(wx,ty+trh/2+a)}c.stroke();
      if(phase!=='run'){c.fillStyle='rgba(255,214,10,.9)';c.fillRect(tx+tw*spike-1,ty-10,2,trh+20)}
      c.fillStyle='#3c9cff';c.fillRect(tx+tw*x-1,ty-14,2,trh+24);c.beginPath();c.moveTo(tx+tw*x-7,ty-14);c.lineTo(tx+tw*x+7,ty-14);c.lineTo(tx+tw*x,ty-5);c.fill();
      if(phase==='res'){var good=Math.abs(off)<=1;c.fillStyle=off===null?'#ff2d20':good?'#3ddc84':Math.abs(off)<=4?'#ffd60a':'#ff7a1a';c.font='700 '+Math.round(Math.min(W*.05,30))+'px Instrument Sans,Arial';c.textAlign='center';c.fillText(off===null?'Verpasst':off===0?'Framegenau!':(off>0?'+':'')+off+' Frame'+(Math.abs(off)===1?'':'s'),cx,top+vh-18);c.textAlign='left'}
      c.fillStyle='#8b9099';c.font='12px Spline Sans Mono,monospace';c.fillText('TAKE '+(take+1)+'/5',W*.12,22);c.textAlign='right';c.fillText('Abweichung gesamt: '+takes.reduce(function(a,b){return a+Math.abs(b)},0)+' Fr.',W*.88,22);c.textAlign='left';
    }
    function hit(G){if(phase!=='run')return;off=Math.round((x-spike)*FR);takes.push(off);phase='res';pt=0}
    return {
      idle:function(G){mis=MIS[0];sc=12;takes=[];take=0;newTake();x=spike-.12;draw(G)},
      start:function(G){var k;do{k=Math.floor(Math.random()*MIS.length)}while(k===lastMis);lastMis=k;mis=MIS[k];sc=Math.floor(rnd(3,48));takes=[];take=0;newTake();G.say(mis.n+' · '+mis.k,'Drehtag')},
      frame:function(G,dt){
        if(phase==='run'){x+=dt/dur;if(x>=1){x=1;off=null;takes.push(15);phase='res';pt=0}}
        else{pt+=dt;if(pt>1.1){take++;if(take>=5){var tot=takes.reduce(function(a,b){return a+Math.abs(b)},0);draw(G);G.finish('<b>'+tot+' Frames daneben</b>'+(tot<=3?'Framegenau. Sie dürfen bei uns anlegen.':tot<=10?'Gut synchron. Kaum jemand würde es merken.':'Lippen und Ton gehen getrennte Wege. Noch einmal?'),tot);return}newTake()}}
        draw(G);
      },
      down:function(G){hit(G)},
      key:function(G,e,on){if(e.code==='Space'||e.key==='Enter'){if(on)hit(G);return}return false},
      better:function(a,b){return a<b},fmt:function(v){return v+' Frames'}
    };
  })();

  // =====================================================================
  // 3) Schärfe ziehen – jede Runde anderes Motiv und andere Bewegung
  // =====================================================================
  var FOKUS=(function(){
    var T=20, t, f, dist, inF, ph, img, keyV=0, pat, last=-1, LBL=[['0,5 m',0],['1 m',.2],['2 m',.42],['3 m',.6],['5 m',.78],['∞',1]];
    var PICS=['aab2b6cd48','806bc4ec77','e10302302c','1bd626b41c','9ad5d1de9b','5990f27b4d','e225eeba11','84ed29bb99'];
    var PAT=[
      {n:'Person läuft auf die Kamera zu',f:function(t){return clamp(.92-t/T*.85+.05*Math.sin(2.2*t+ph[0]),.04,.96)}},
      {n:'Person geht hin und her',f:function(t){return clamp(.5+.36*Math.sin(.9*t+ph[0]),.04,.96)}},
      {n:'Unruhige Szene, viel Bewegung',f:function(t){var s=t*(1+t/24);return clamp(.5+.27*Math.sin(.8*s+ph[0])+.14*Math.sin(2*s+ph[1])+.06*Math.sin(3.8*s+ph[2]),.04,.96)}},
      {n:'Erst ruhig, dann plötzlich Bewegung',f:function(t){var k=t<7?0:Math.min(1,(t-7)/1.2);return clamp(.7-.45*k+.25*k*Math.sin(1.6*(t-7)+ph[1])+.03*Math.sin(t*1.3),.04,.96)}},
      {n:'Person entfernt sich vom Set',f:function(t){return clamp(.12+t/T*.82+.06*Math.sin(2.6*t+ph[2]),.04,.96)}}
    ];
    function target(t){return pat.f(t)}
    function apply(){var e=Math.abs(f-dist);img.style.filter='blur('+Math.min(16,e*46).toFixed(1)+'px)';img.style.transform='scale('+(1.04+(1-dist)*.14).toFixed(3)+')'}
    function draw(G){
      var c=G.c,W=G.W,H=G.H;c.clearRect(0,0,W,H);
      var y=H-30,x0=W*.08,w=W*.84;
      c.strokeStyle='rgba(255,255,255,.55)';c.lineWidth=2;c.beginPath();c.moveTo(x0,y);c.lineTo(x0+w,y);c.stroke();
      c.fillStyle='#fff';c.font='600 12px Spline Sans Mono,monospace';c.textAlign='center';c.shadowColor='rgba(0,0,0,.8)';c.shadowBlur=4;
      LBL.forEach(function(l){c.fillRect(x0+w*l[1]-1,y-6,2,12);c.fillText(l[0],x0+w*l[1],y+20)});
      c.fillStyle='#ffd60a';c.beginPath();c.moveTo(x0+w*dist,y-10);c.lineTo(x0+w*dist-7,y-22);c.lineTo(x0+w*dist+7,y-22);c.fill();
      var ok=Math.abs(f-dist)<.05;c.fillStyle=ok?'#3ddc84':'#fff';c.fillRect(x0+w*f-2,y-26,4,32);c.beginPath();c.arc(x0+w*f,y,9,0,Math.PI*2);c.fill();
      c.shadowBlur=0;c.textAlign='right';c.font='600 12px Spline Sans Mono,monospace';c.fillStyle=ok?'#3ddc84':'#ff7a1a';c.fillText((ok?'● SCHARF':'○ UNSCHARF')+'  MF',W-14,24);c.textAlign='left';
    }
    return {
      init:function(G){img=G.el.querySelector('.g-photo');img.style.transition='transform .3s linear';img.style.opacity=1;img.style.filter='blur(7px)'},
      idle:function(G){ph=[0,1,2];pat=PAT[1];f=.3;dist=.55;draw(G)},
      start:function(G){
        t=0;inF=0;f=.5;keyV=0;ph=[rnd(0,6),rnd(0,6),rnd(0,6)];
        var k;do{k=Math.floor(Math.random()*PAT.length)}while(k===last&&PAT.length>1);last=k;pat=PAT[k];
        img.src='img/'+PICS[Math.floor(Math.random()*PICS.length)]+'-m.webp';
        dist=target(0);apply();G.say(pat.n,'Einstellung');
      },
      frame:function(G,dt){
        t+=dt;dist=target(t);f=clamp(f+keyV*dt,0,1);if(Math.abs(f-dist)<.05)inF+=dt;apply();draw(G);
        var s=Math.max(0,T-t);G.hud('Scharf '+Math.round(inF/Math.max(t,.01)*100)+' % · 0:'+(s<10?'0':'')+Math.ceil(s));
        if(t>=T){var p=Math.round(inF/T*100);G.finish('<b>'+p+' % scharf</b>'+(p>=80?'Focus Puller mit Auszeichnung. Der DoP nickt zufrieden.':p>=55?'Brauchbar. Ein, zwei Takes würden wir wiederholen.':'Da war die Nasenspitze scharf, nicht die Augen. Nochmal?'),p);img.style.filter='blur(0)'}
      },
      move:function(G,e){if(e.pointerType==='mouse'||e.buttons||e.pointerType==='touch'||e.pointerType==='pen'){var r=G.stage.getBoundingClientRect();f=clamp((e.clientX-r.left-r.width*.08)/(r.width*.84),0,1)}},
      down:function(G,e){FOKUS.move(G,{pointerType:'mouse',clientX:e.clientX})},
      key:function(G,e,on){if(e.key==='ArrowLeft'){keyV=on?-.7:0;return}if(e.key==='ArrowRight'){keyV=on?.7:0;return}return false},
      stop:function(){img.style.filter='blur(7px)'},
      better:function(a,b){return a>b},fmt:function(v){return v+' % scharf'}
    };
  })();

  // =====================================================================
  // 4) Live-Regie – Ansage wie im Ü-Wagen: erst "Achtung 3 …", dann "… und 3!"
  // =====================================================================
  var REGIE=(function(){
    var N, cams, i, call, pgm, tl, wait, hits, times, early, lim, phase, sb, show, lastShow=-1;
    var POOL=['84ed29bb99','e225eeba11','5765c3a6ea','40440a6a2f','a9507e6621','2fdb71c55f','d5132a003d','75d48f68ac','461696c92a','1bd626b41c','5990f27b4d','aab2b6cd48'];
    var SHOTS=['Totale','Halbtotale','Halbnah','Nah','Groß','Zweier','Over-Shoulder'];
    var SHOWS=[
      {n:'Live-Talk',calls:16,sp:1},
      {n:'Frühstücksfernsehen',calls:20,sp:1.1},
      {n:'Live-Schalte Außendreh',calls:18,sp:1.2},
      {n:'Magazin-Studio',calls:20,sp:1.05},
      {n:'Breaking News',calls:22,sp:1.35}
    ];
    var STBY=['Achtung, {n} …','Achtung Kamera {n} …','Bereit {n} …','{n} kommt …'];
    var TAKE=['… und {n}!','{n}!','… {n}, ab!','… und Kamera {n}!'];
    var pick=function(a){return a[Math.floor(Math.random()*a.length)]};
    function band(G,txt,col){var c=G.c;c.clearRect(0,0,G.W,G.H);c.fillStyle='#16171a';c.fillRect(0,0,G.W,44);c.font='600 12px Spline Sans Mono,monospace';c.fillStyle='#ff2d20';c.fillText('PGM '+(pgm||'–'),12,27);c.textAlign='right';c.fillStyle='#8b9099';c.fillText((i||0)+'/'+(N||20),G.W-12,27);c.font='700 '+(G.W<420?15:18)+'px Instrument Sans,Arial';c.fillStyle=col||'#fff';c.textAlign='center';c.fillText(txt,G.W/2,29);c.textAlign='left'}
    function mark(){cams.forEach(function(b){var n=+b.dataset.cam;b.classList.toggle('pgm',n===pgm);b.classList.toggle('call',n===call);b.classList.toggle('go',n===call&&phase==='take')})}
    function setCams(){
      var pool=POOL.slice().sort(function(){return Math.random()-.5}), shots=SHOTS.slice().sort(function(){return Math.random()-.5});
      cams.forEach(function(b,k){
        var im=b.querySelector('img'), lab=b.querySelector('b');
        if(k>0)im.src='img/'+pool[k-1]+'-m.webp';
        var z=k===0?1:rnd(1,1.45);im.style.transformOrigin=Math.round(rnd(20,80))+'% '+Math.round(rnd(20,70))+'%';im.style.transform='scale('+z.toFixed(2)+')';
        lab.textContent='CAM '+(k+1)+' · '+(k===0?'Totale':shots[k]);
      });
    }
    function finish(G){
      var avg=times.length?Math.round(times.reduce(function(a,b){return a+b},0)/times.length):0;call=0;mark();band(G,'Sendeschluss');
      cams.forEach(function(b){b.tabIndex=-1});
      var q=hits/N;
      G.finish('<b>'+hits+' von '+N+' Schnitten</b>'+(times.length?'Reaktionszeit im Schnitt '+avg+' ms. ':'')+(early?early+'× zu früh geschnitten. ':'')+(q>=.9?'Sie gehören in den Ü-Wagen.':q>=.6?'Ordentliche Sendung, ein paar Wackler.':'Die Regie bittet um ein klärendes Gespräch.'),Math.round(q*100)*10000+(9999-Math.min(9999,avg)));
    }
    function next(G){
      i++;if(i>N){finish(G);return}
      var n;do{n=1+Math.floor(Math.random()*4)}while(n===pgm);
      call=n;phase='sb';sb=rnd(.45,1.3)/show.sp;tl=0;wait=0;lim=Math.max(.7,1.5-i*.03)/show.sp;mark();
      band(G,'Regie: „'+pick(STBY).replace('{n}',n)+'“','#ffd60a');
    }
    function miss(G,b,txt){if(b){b.classList.remove('miss');void b.offsetWidth;b.classList.add('miss')}call=0;mark();band(G,txt,'#ff2d20');wait=.6}
    function press(G,n){
      if(!call||wait>0)return;
      var b=cams[n-1];
      if(n!==call){miss(G,b,'Falsche Kamera!');return}
      if(phase==='sb'){early++;miss(G,b,'Zu früh! Erst auf „und '+n+'“ schneiden.');return}
      hits++;times.push(Math.round(tl*1000));pgm=n;call=0;mark();band(G,'Sauber! '+Math.round(tl*1000)+' ms','#fff');wait=.4;
    }
    return {
      init:function(G){cams=[].slice.call(G.el.querySelectorAll('.g-cam'));cams.forEach(function(b){b.addEventListener('click',function(){if(G.running)press(G,+b.dataset.cam)})});setCams()},
      idle:function(G){i=0;pgm=1;call=0;N=20;if(cams)mark();band(G,'Bildmischer bereit')},
      start:function(G){
        var k;do{k=Math.floor(Math.random()*SHOWS.length)}while(k===lastShow);lastShow=k;show=SHOWS[k];N=show.calls;
        setCams();i=0;hits=0;early=0;times=[];pgm=1;call=0;wait=1.2;band(G,show.n+': gleich sind wir auf Sendung …');cams.forEach(function(b){b.tabIndex=0});
        G.say(show.n+' · '+N+' Kommandos','Sendung');
      },
      frame:function(G,dt){
        if(wait>0){wait-=dt;if(wait<=0)next(G);return}
        if(!call)return;
        if(phase==='sb'){sb-=dt;if(sb<=0){phase='take';tl=0;mark();band(G,'Regie: „'+pick(TAKE).replace('{n}',call)+'“','#3ddc84')}return}
        tl+=dt;if(tl>lim){miss(G,null,'Zu langsam!')}
      },
      key:function(G,e,on){if(/^[1-4]$/.test(e.key)){if(on)press(G,+e.key);return}return false},
      stop:function(){cams.forEach(function(b){b.tabIndex=-1;b.classList.remove('call')})},
      ver:'2',better:function(a,b){return a>b},fmt:function(v){return Math.floor(v/10000)+' % Treffer'}
    };
  })();

  var IMPL={ton:TON,klappe:KLAPPE,fokus:FOKUS,regie:REGIE};
  cards.forEach(function(el){var im=IMPL[el.getAttribute('data-game')];if(im)all.push(mk(el,im))});
  var sized=function(){all.forEach(function(g){g.size()})};
  if(d.fonts&&d.fonts.ready)d.fonts.ready.then(sized);
  sized(); addEventListener('load',sized);
})();
