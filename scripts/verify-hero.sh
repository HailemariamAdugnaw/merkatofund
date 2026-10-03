#!/bin/bash
cd /home/z/my-project

pkill -f "vite" 2>/dev/null
pkill -f "manage.py runserver" 2>/dev/null
sleep 1

/home/z/.venv/bin/python backend/manage.py migrate --noinput > /dev/null 2>&1

setsid nohup /home/z/.venv/bin/python backend/manage.py runserver 0.0.0.0:8000 > backend/server.log 2>&1 < /dev/null &
setsid nohup npx vite --host 0.0.0.0 --port 3000 > dev.log 2>&1 < /dev/null &

for i in $(seq 1 40); do
  FRONT=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ 2>/dev/null)
  BACK=$(curl -s -o /dev/null -w "%{http_code}" -L http://localhost:8000/api/health 2>/dev/null)
  if [ "$FRONT" = "200" ] && [ "$BACK" = "200" ]; then
    echo "servers ready (front=$FRONT back=$BACK)"
    break
  fi
  sleep 1
done

echo "--- API hero-slides ---"
curl -s http://localhost:8000/api/hero-slides | head -c 300; echo

agent-browser set viewport 1440 900
agent-browser open http://localhost:3000
agent-browser wait --load networkidle
sleep 1.5
agent-browser screenshot /home/z/my-project/download/verify-hero-desktop.png

echo "--- structure checks (desktop) ---"
agent-browser eval "JSON.stringify((() => { const hero=document.querySelector('.hero'); const active=document.querySelector('.hero-slide-bg.is-active img'); const dots=[...document.querySelectorAll('.hero-dot')]; const activeDot=document.querySelector('.hero-dot.is-active'); const fill=document.querySelector('.hero-progress-fill'); const copy=document.querySelector('.hero-copy'); return { heroH: Math.round(hero.getBoundingClientRect().height), innerH: window.innerHeight, navOffsetOK: Math.round(hero.getBoundingClientRect().top) === 78, activeAnim: active?getComputedStyle(active).animationName:null, activeRunning: active?getComputedStyle(active).animationPlayState:null, activeSrc: active?active.getAttribute('src'):null, bgCount: document.querySelectorAll('.hero-slide-bg').length, dotCount: dots.length, activeDotW: activeDot?Math.round(activeDot.getBoundingClientRect().width):null, progressAnim: fill?getComputedStyle(fill).animationName+' '+getComputedStyle(fill).animationDuration:null, counter: document.querySelector('.hero-counter-current').textContent+'/'+document.querySelector('.hero-counter-total').textContent, staggerDelays: [...copy.children].map(c=>getComputedStyle(c).animationDelay), arrows: [!!document.querySelector('.hero-arrow-prev'), !!document.querySelector('.hero-arrow-next')] }; })())"

echo "--- autoplay advance (wait 7s) ---"
sleep 7
agent-browser eval "JSON.stringify({ counter: document.querySelector('.hero-counter-current').textContent, activeSrc: document.querySelector('.hero-slide-bg.is-active img').getAttribute('src') })"
agent-browser screenshot /home/z/my-project/download/verify-hero-slide2.png

echo "--- hover pause ---"
agent-browser hover .hero-copy
sleep 0.8
agent-browser eval "JSON.stringify({ heroClass: document.querySelector('.hero').className, playState: getComputedStyle(document.querySelector('.hero-progress-fill')).animationPlayState })"
agent-browser eval "document.querySelector('.hero').dispatchEvent(new PointerEvent('pointerleave', {pointerType:'mouse', bubbles:true})); 'resumed'"

echo "--- arrow nav ---"
agent-browser click .hero-arrow-next
sleep 0.6
agent-browser eval "JSON.stringify({ afterNext: document.querySelector('.hero-counter-current').textContent })"
agent-browser click .hero-arrow-prev
sleep 0.6
agent-browser eval "JSON.stringify({ afterPrev: document.querySelector('.hero-counter-current').textContent })"

echo "--- dot nav ---"
agent-browser eval "[...document.querySelectorAll('.hero-dot')][2].click(); 'clicked-dot-3'"
sleep 0.6
agent-browser eval "JSON.stringify({ afterDot3: document.querySelector('.hero-counter-current').textContent, activeDotW: Math.round(document.querySelector('.hero-dot.is-active').getBoundingClientRect().width) })"

echo "--- keyboard nav ---"
agent-browser eval "window.dispatchEvent(new KeyboardEvent('keydown', {key:'ArrowRight', bubbles:true})); 'sent-arrowright'"
sleep 0.6
agent-browser eval "JSON.stringify({ afterKey: document.querySelector('.hero-counter-current').textContent })"

echo "--- swipe nav ---"
agent-browser eval "(() => { const hero=document.querySelector('.hero'); const mk=(x)=>new Touch({identifier:7,target:hero,clientX:x,clientY:400}); hero.dispatchEvent(new TouchEvent('touchstart',{touches:[mk(320)],bubbles:true})); hero.dispatchEvent(new TouchEvent('touchend',{changedTouches:[mk(80)],bubbles:true})); return 'swiped-left'; })()"
sleep 0.6
agent-browser eval "JSON.stringify({ afterSwipe: document.querySelector('.hero-counter-current').textContent })"

echo "--- console errors (desktop) ---"
agent-browser errors

agent-browser set viewport 390 844
agent-browser open http://localhost:3000
agent-browser wait --load networkidle
sleep 1.5
agent-browser screenshot /home/z/my-project/download/verify-hero-mobile.png
agent-browser eval "JSON.stringify((() => { return { arrowHidden: getComputedStyle(document.querySelector('.hero-arrow-prev')).display==='none', counterVisible: !!document.querySelector('.hero-counter'), hudRow: getComputedStyle(document.querySelector('.hero-hud-inner')).justifyContent, docOverflowX: document.documentElement.scrollWidth > window.innerWidth, heroH: Math.round(document.querySelector('.hero').getBoundingClientRect().height), titleSize: getComputedStyle(document.querySelector('.hero-title')).fontSize }; })())"
agent-browser errors

echo "verify-hero done"
