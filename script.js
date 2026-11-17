
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
      var strips=$$('.strip',mix), CH=[{b:.62},{b:.55},{b:.48},{b:.34}];
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
    var clips=$$('.av-clip',av), data=$$('.av-data p',av), ph=$('.av-ph',av), tlw=$('.av-tlw',av), tl=$('.av-tl',av), scrn=$('.av-scr',av);
    var tcEl=$('[data-avtc]',av), chip=$('.av-chip',av), title=$('.av-title',av), text=$('.av-text',av), meta=$('.av-meta',av);
    var nEl=$('.av-n',av), inEl=$('.av-in',av), outEl=$('.av-out',av), durEl=$('.av-dur',av);
    var TOTAL=30*60*25, DUR=28000, pos=0, playing=false, act=-1, seen=false, visible=false, lt=0, userScroll=0;
    var order=clips.map(function(c,i){return i}).sort(function(a,b){return clips[a].dataset.a-clips[b].dataset.a});
    var fmt=function(pct){return tcOf(pct/100*TOTAL)}, dur=function(pct){var f=pct/100*TOTAL,s=Math.floor(f/25);return '00:'+p2(Math.floor(s/60))+':'+p2(s%60)+':'+p2(Math.floor(f)%25)};
    var show=function(k){
      if(k===act)return; act=k;
      clips.forEach(function(c,i){c.classList.toggle('on',i===k)});
      var c=clips[k], p=data[k], s=c.dataset.s;
      chip.className='av-chip t'+s; chip.textContent=p.dataset.chip;
      title.textContent=p.firstChild.textContent; text.textContent=p.lastChild.textContent; meta.textContent='Teil von: '+p.dataset.svc;
      nEl.textContent=p2(order.indexOf(k)+1); inEl.textContent=fmt(+c.dataset.a); outEl.textContent=fmt(+c.dataset.b); durEl.textContent=dur(c.dataset.b-c.dataset.a);
      scrn.classList.remove('swap'); void scrn.offsetWidth; scrn.classList.add('swap');
    };
    var pick=function(){
      var best=-1,ba=-1;
      clips.forEach(function(c,i){var a=+c.dataset.a,b=+c.dataset.b;if(pos*100>=a&&pos*100<b&&a>ba){ba=a;best=i}});
      if(best>=0)show(best);
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
    var play=function(on){
      if(on===playing)return; playing=on; av.classList.toggle('playing',on);
      $('.av-play',av).setAttribute('aria-label',on?'Pause':'Abspielen');
      if(on){lt=0;requestAnimationFrame(tick)}
    };
    var jump=function(k){pos=+clips[k].dataset.a/100+.0005;show(k);draw()};
    clips.forEach(function(c,i){c.addEventListener('click',function(e){e.stopPropagation();play(false);jump(i)})});
    $('[data-av="play"]',av).addEventListener('click',function(){play(!playing)});
    var step=function(dir){var i=order.indexOf(act);i=(i+dir+order.length)%order.length;play(false);jump(order[i])};
    $('[data-av="prev"]',av).addEventListener('click',function(){step(-1)});
    $('[data-av="next"]',av).addEventListener('click',function(){step(1)});
    // Scrubben auf Lineal und Spuren
    var scrub=function(e){
      var lane=$('.av-rul',av).getBoundingClientRect(), x=(e.touches?e.touches[0].clientX:e.clientX);
      pos=Math.min(.9999,Math.max(0,(x-lane.left)/lane.width)); pick(); draw();
    };
    var dragging=false;
    $$('.av-rul,.av-lane',av).forEach(function(el){el.addEventListener('pointerdown',function(e){if(e.target.closest('.av-clip'))return;dragging=true;play(false);scrub(e)})});
    addEventListener('pointermove',function(e){if(dragging)scrub(e)});
    addEventListener('pointerup',function(){dragging=false});
    tlw.addEventListener('scroll',function(){if(!playing)return},{passive:true});
    tlw.addEventListener('touchstart',function(){userScroll=Date.now()},{passive:true});
    tlw.addEventListener('wheel',function(){userScroll=Date.now()},{passive:true});
    // J K L wie im Schnittprogramm
    d.addEventListener('keydown',function(e){
      if(!visible||e.metaKey||e.ctrlKey||e.altKey||/INPUT|TEXTAREA/.test(e.target.tagName))return;
      var k=e.key.toLowerCase();
      if(k==='l')play(true); else if(k==='k')play(false); else if(k==='j')step(-1);
    });
    show(0); draw();
    inView(av,function(v){visible=v;if(v&&!seen){seen=true;av.classList.add('in');if(!R)setTimeout(function(){if(visible)play(true)},1200)}else if(!v&&playing)play(false)},.3);
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
  // 1) V-Klasse Hover: Stau in Köln
  // =====================================================================
  var STAU=(function(){
    var GROUND=452, VW=112, VH=48, S, WW, van, obs, parts, speed, dist, t, hold, crashed, sky, lastGantry, mis, lastMis=-1;
    var SKY={
      abend:{s:['#0f1d3a','#3b3f6b','#e7875a'],city:'#231f3b',water:'#1d2746',refl:'rgba(231,135,90,.25)',bridge:'#38415f',stars:.7},
      nacht:{s:['#03060f','#0b1430','#1c2a55'],city:'#0d1226',water:'#0a1022',refl:'rgba(255,214,120,.22)',bridge:'#26304d',stars:1},
      morgen:{s:['#2a3a6e','#b07aa1','#ffc48a'],city:'#3a3355',water:'#2d3a63',refl:'rgba(255,196,138,.3)',bridge:'#4b5378',stars:0},
      tag:{s:['#3d7fd6','#86b9ec','#d6ecff'],city:'#56607a',water:'#3c6aa3',refl:'rgba(255,255,255,.35)',bridge:'#6b7590',stars:0}
    };
    var MIS=[
      {n:'Interview am Dom',m:1000,sky:'abend',dens:1,sign:'Köln-Zentrum'},
      {n:'Nachtdreh im Rheinauhafen',m:1400,sky:'nacht',dens:1.1,sign:'Rheinauhafen'},
      {n:'Frühdreh am Mediapark',m:900,sky:'morgen',dens:.9,sign:'Mediapark'},
      {n:'Messe-Dreh in Deutz',m:1700,sky:'tag',dens:1.2,sign:'Köln-Deutz'},
      {n:'Studio-Termin in Ossendorf',m:2200,sky:'tag',dens:1.3,sign:'Ossendorf'},
      {n:'Live-Schalte an der Zoobrücke',m:1200,sky:'nacht',dens:1.15,sign:'Zoobrücke'}
    ];
    var CARS=['#c9ccd1','#f2f2f2','#b3261e','#1f3a6e','#6b7078','#2f3236','#d9c9a3','#3d6b4f'];
    // Skyline einmal erzeugen (wiederholt sich alle 1600 Einheiten)
    var sk=[];(function(){var x=0;while(x<1600){var w=rnd(40,110),h=rnd(30,110);sk.push([x,w,h]);x+=w+rnd(0,14)}})();
    function setScale(G){S=G.H/500;WW=G.W/S}
    function reset(){mis=mis||MIS[0];van={x:120,y:GROUND-VH,vy:0};obs=[];parts=[];speed=300;dist=0;t=0;hold=false;crashed=0;lastGantry=-99}
    function spawn(){
      var right=obs.length?Math.max.apply(null,obs.map(function(o){return o.x+o.w})):0;
      if(right>WW-rnd(260,520)*(speed/300))return;
      var x=Math.max(WW+20,right+rnd(260,500));
      if(t>10&&t-lastGantry>6&&Math.random()<.3){obs.push({g:1,x:x,w:150,y:62,h:178,txt:mis.sign});lastGantry=t;return}
      var n=Math.floor(rnd(1,Math.min(5,(2.2+t/10)*mis.dens)));
      for(var i=0;i<n;i++){
        var big=t>8&&Math.random()<.18, vanT=!big&&Math.random()<.25;
        var w=big?rnd(160,190):vanT?rnd(96,106):rnd(74,92), h=big?rnd(78,88):vanT?rnd(48,54):rnd(34,40);
        obs.push({x:x,w:w,h:h,y:GROUND-h,col:big?'#e8e8e8':CARS[Math.floor(Math.random()*CARS.length)],big:big,vanT:vanT});
        x+=w+rnd(6,14);
      }
    }
    function bg(c,G,off){
      var P=SKY[mis.sky];var g=c.createLinearGradient(0,0,0,340);g.addColorStop(0,P.s[0]);g.addColorStop(.55,P.s[1]);g.addColorStop(1,P.s[2]);c.fillStyle=g;c.fillRect(0,0,WW,340);
      if(P.stars){c.fillStyle='rgba(255,255,255,'+P.stars*.7+')';for(var i=0;i<26;i++){c.fillRect((i*137+11)%WW,(i*53)%140+8,1.5,1.5)}}
      // Skyline mit Dom und Fernsehturm
      var o=(off*.12)%1600;c.fillStyle=P.city;
      for(var k=-1;k<2;k++){var bx=k*1600-o;
        sk.forEach(function(b){var x=bx+b[0];if(x>WW||x+b[1]<0)return;c.fillRect(x,330-b[2],b[1],b[2])});
        var dx=bx+520;c.beginPath();c.moveTo(dx,330);c.lineTo(dx,220);c.lineTo(dx+14,150);c.lineTo(dx+20,90);c.lineTo(dx+26,150);c.lineTo(dx+40,220);c.lineTo(dx+70,220);c.lineTo(dx+84,150);c.lineTo(dx+90,90);c.lineTo(dx+96,150);c.lineTo(dx+110,220);c.lineTo(dx+110,250);c.lineTo(dx+170,250);c.lineTo(dx+170,330);c.fill();
        var tx=bx+1180;c.fillRect(tx,140,7,190);c.beginPath();c.ellipse(tx+3.5,170,16,9,0,0,Math.PI*2);c.fill();c.fillRect(tx+2,95,3,45);
      }
      // Rhein und Hohenzollernbrücke
      c.fillStyle=P.water;c.fillRect(0,330,WW,62);
      c.fillStyle=P.refl;for(var j=0;j<14;j++){c.fillRect(((j*97-off*.5)%WW+WW)%WW,340+(j%4)*12,30,2)}
      var bo=(off*.35)%300;c.strokeStyle=P.bridge;c.lineWidth=3;
      for(var a=-1;a<WW/300+2;a++){var ax=a*300-bo;c.beginPath();c.moveTo(ax,372);c.quadraticCurveTo(ax+150,300,ax+300,372);c.stroke();for(var q=1;q<6;q++){c.beginPath();c.moveTo(ax+q*50,372);c.lineTo(ax+q*50,372-Math.sin(q/6*Math.PI)*36);c.stroke()}}
      // Fahrbahn
      c.fillStyle='#2a2c31';c.fillRect(0,385,WW,115);c.fillStyle='#5b5f68';c.fillRect(0,383,WW,4);
      c.fillStyle='#d8d8d8';var lo=(off)%80;for(var m=-1;m<WW/80+1;m++)c.fillRect(m*80-lo,476,40,4);
    }
    function car(c,o){
      c.save();c.translate(o.x,o.y);
      if(o.big){c.fillStyle='#e8e8e8';rr(c,0,0,o.w-40,o.h-10,4);c.fill();c.fillStyle='#c33';c.fillRect(6,(o.h-10)/2-6,o.w-52,12);c.fillStyle='#3a3f47';rr(c,o.w-42,o.h*.3,40,o.h*.7-10,6);c.fill();c.fillStyle='#9cc3e6';c.fillRect(o.w-34,o.h*.36,24,14)}
      else{c.fillStyle=o.col;rr(c,0,o.h*.38,o.w,o.h*.5,7);c.fill();rr(c,o.w*(o.vanT?.06:.2),o.vanT?2:o.h*.08,o.w*(o.vanT?.86:.58),o.h*(o.vanT?.5:.4),8);c.fill();c.fillStyle='rgba(20,30,45,.85)';rr(c,o.w*(o.vanT?.1:.25),o.vanT?7:o.h*.14,o.w*(o.vanT?.75:.48),o.h*(o.vanT?.28:.26),4);c.fill()}
      c.fillStyle='#ff2d20';c.shadowColor='#ff2d20';c.shadowBlur=10;c.fillRect(-1,o.h*.48,5,6);c.shadowBlur=0;
      c.fillStyle='#111';[o.w*.2,o.w*.8].forEach(function(wx){c.beginPath();c.arc(wx,o.h-2,o.big?11:9,0,Math.PI*2);c.fill()});
      c.restore();
    }
    function gantry(c,o){
      c.fillStyle='#4b505a';c.fillRect(o.x-10,0,o.w+20,10);c.fillRect(o.x+o.w/2-3,10,6,o.y-10+4);
      c.fillStyle='#1f4fa8';rr(c,o.x,o.y,o.w,o.h,6);c.fill();c.strokeStyle='#fff';c.lineWidth=3;rr(c,o.x+6,o.y+6,o.w-12,o.h-12,4);c.stroke();
      c.fillStyle='#fff';c.font='700 19px Instrument Sans,Arial';c.textAlign='center';c.fillText(o.txt,o.x+o.w/2,o.y+o.h/2-6);c.font='600 15px Instrument Sans,Arial';c.fillText('Stau · 8 km',o.x+o.w/2,o.y+o.h/2+18);c.textAlign='left';
    }
    function drawVan(c,fl){
      var x=van.x,y=van.y,air=GROUND-VH-y;
      c.fillStyle='rgba(0,0,0,'+clamp(.45-air/500,.08,.45)+')';c.beginPath();c.ellipse(x+VW/2,GROUND+3,VW*.5*(1-air/700),5,0,0,Math.PI*2);c.fill();
      if(fl){for(var i=0;i<2;i++){var jx=x+22+i*66, L=22+Math.random()*16;var g=c.createLinearGradient(0,y+VH,0,y+VH+L);g.addColorStop(0,'rgba(220,245,255,.95)');g.addColorStop(.35,'rgba(60,170,255,.8)');g.addColorStop(1,'rgba(60,170,255,0)');c.fillStyle=g;c.beginPath();c.moveTo(jx-9,y+VH-2);c.lineTo(jx+9,y+VH-2);c.lineTo(jx,y+VH+L);c.fill()}}
      c.save();c.translate(x,y);
      c.fillStyle='#0d0e10';c.beginPath();c.moveTo(4,4);c.lineTo(84,4);c.quadraticCurveTo(94,5,100,18);c.lineTo(110,26);c.quadraticCurveTo(113,30,112,40);c.lineTo(112,42);c.lineTo(2,42);c.lineTo(0,10);c.quadraticCurveTo(0,4,4,4);c.fill();
      c.fillStyle='#2b3440';c.beginPath();c.moveTo(8,9);c.lineTo(82,9);c.quadraticCurveTo(90,10,95,20);c.lineTo(8,20);c.fill();
      c.fillStyle='#0d0e10';[30,54].forEach(function(px){c.fillRect(px,9,3,11)});
      c.fillStyle='#ff2d20';c.beginPath();c.arc(14,30,3,0,Math.PI*2);c.fill();
      c.fillStyle='#fff';c.font='600 7.5px Instrument Sans,Arial';c.fillText('GESCHICHTENFABRIK.TV',20,32.5);
      c.fillStyle='#ffe9a6';c.fillRect(106,28,6,4);c.fillStyle='#ff2d20';c.fillRect(0,22,3,6);
      c.fillStyle='#151515';[22,88].forEach(function(wx){c.beginPath();c.arc(wx,42,9.5,0,Math.PI*2);c.fill();c.fillStyle='#777';c.beginPath();c.arc(wx,42,4,0,Math.PI*2);c.fill();c.fillStyle='#151515'});
      c.restore();
    }
    function render(G,fl){
      var c=G.c;c.save();c.scale(S,S);bg(c,G,dist);
      obs.forEach(function(o){o.g?gantry(c,o):car(c,o)});
      parts.forEach(function(p){c.fillStyle='rgba(120,200,255,'+p.a+')';c.fillRect(p.x,p.y,3,3)});
      drawVan(c,fl);
      if(crashed){c.fillStyle='rgba(255,45,32,'+crashed*.5+')';c.fillRect(0,0,WW,500)}
      c.restore();
    }
    return {
      init:function(G){reset()},
      idle:function(G){setScale(G);reset();obs=[{x:WW*.55,w:84,h:38,y:GROUND-38,col:'#c9ccd1'},{x:WW*.55+92,w:100,h:52,y:GROUND-52,col:'#1f3a6e',vanT:1},{x:WW*.55+200,w:80,h:36,y:GROUND-36,col:'#b3261e'}];van.y=GROUND-VH-90;render(G,true)},
      start:function(G){var k;do{k=Math.floor(Math.random()*MIS.length)}while(k===lastMis);lastMis=k;mis=MIS[k];setScale(G);reset();G.say(mis.n+' · '+fmtN(mis.m)+' m','Mission')},
      frame:function(G,dt){
        t+=dt;speed=Math.min(660,300+t*10);dist+=speed*dt;
        van.vy+=(hold?-2150:1500)*dt;van.vy=clamp(van.vy,-520,720);van.y+=van.vy*dt;
        if(van.y>GROUND-VH){van.y=GROUND-VH;van.vy=0}if(van.y<26){van.y=26;van.vy=0}
        obs.forEach(function(o){o.x-=speed*dt});obs=obs.filter(function(o){return o.x+o.w>-40});spawn();
        if(hold&&Math.random()<.8)parts.push({x:van.x+22+(Math.random()<.5?0:66),y:van.y+VH+8,vx:-speed*.4,vy:rnd(60,160),a:.8});
        parts.forEach(function(p){p.x+=p.vx*dt;p.y+=p.vy*dt;p.a-=dt*2});parts=parts.filter(function(p){return p.a>0});
        var m=7,hit=obs.some(function(o){return van.x+m<o.x+o.w&&van.x+VW-m>o.x&&van.y+m<o.y+o.h&&van.y+VH-2>o.y+m});
        if(hit){crashed=1;render(G,false);var km=dist/12,rest=Math.max(0,mis.m-km);G.finish('<b>'+fmtN(km)+' m geschafft</b>'+'Noch '+fmtN(rest)+' m bis zum Set ('+mis.n+'). '+(km<mis.m*.4?'Der Kölner Stau war stärker. Noch ein Versuch?':'Knapp! Die Redaktion hält den Drehbeginn noch kurz auf.'),Math.round(km));return}
        if(dist/12>=mis.m){render(G,false);G.finish('<b>Pünktlich am Set!</b>'+mis.n+': '+fmtN(mis.m)+' m durch den Kölner Stau, ohne Kratzer. Das Team ist beeindruckt.',Math.round(dist/12));return}
        render(G,hold);G.hud(fmtN(dist/12)+' / '+fmtN(mis.m)+' m · '+Math.round(speed/5)+' km/h');
      },
      down:function(G){hold=true},up:function(G){hold=false},
      key:function(G,e,on){if(e.code==='Space'||e.key==='ArrowUp'){hold=on;return}return false},
      stop:function(){hold=false},
      better:function(a,b){return a>b},fmt:function(v){return fmtN(v)+' m'}
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

  var IMPL={stau:STAU,klappe:KLAPPE,fokus:FOKUS,regie:REGIE};
  cards.forEach(function(el){var im=IMPL[el.getAttribute('data-game')];if(im)all.push(mk(el,im))});
  var sized=function(){all.forEach(function(g){g.size()})};
  if(d.fonts&&d.fonts.ready)d.fonts.ready.then(sized);
  sized(); addEventListener('load',sized);
})();
