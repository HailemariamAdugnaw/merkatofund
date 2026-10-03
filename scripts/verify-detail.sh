#!/bin/bash
cd /home/z/my-project

FRONT=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/)
if [ "$FRONT" != "200" ]; then
  setsid nohup npx vite --host 0.0.0.0 --port 3000 > dev.log 2>&1 < /dev/null &
  for i in $(seq 1 20); do
    FRONT=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ 2>/dev/null)
    [ "$FRONT" = "200" ] && break
    sleep 1
  done
fi
BACK=$(curl -s -o /dev/null -w "%{http_code}" -L http://localhost:8000/api/health 2>/dev/null)
if [ "$BACK" != "200" ]; then
  setsid nohup /home/z/.venv/bin/python backend/manage.py runserver 0.0.0.0:8000 > backend/server.log 2>&1 < /dev/null &
  sleep 3
fi
echo "front=$FRONT back=$BACK"

agent-browser set viewport 390 844
agent-browser open http://localhost:3000
agent-browser wait --load networkidle
agent-browser find role button click --name "Toggle navigation menu"
sleep 1
agent-browser screenshot /home/z/my-project/download/verify-drawer.png
agent-browser eval "JSON.stringify((() => { const drawer=document.querySelector('.nav-links'); const cta=document.querySelector('.nav-cta'); const r=cta.getBoundingClientRect(); return {drawerOpen: drawer.classList.contains('is-open'), ctaRight: r.right, ctaVisible: r.width > 0 && r.right <= window.innerWidth, homeLinkVisible: getComputedStyle(document.querySelector('.nav-link[href=\'#home\']')).display !== 'none'}; })())"

agent-browser find role button click --name "Toggle navigation menu"
sleep 1

echo "--- slide navigation test ---"
agent-browser find role button click --name "Next slide"
sleep 1.5
agent-browser eval "JSON.stringify((() => { const i=document.querySelector('.hero-slide:nth-child(2) img, .hero-slide.is-active img'); const imgs=[...document.querySelectorAll('.hero-slide img')]; return imgs.map(x => ({src:x.getAttribute('src'), loaded:x.complete && x.naturalWidth > 0})); })())"
agent-browser screenshot /home/z/my-project/download/verify-slide2.png
agent-browser find role button click --name "Next slide"
sleep 1.5
agent-browser screenshot /home/z/my-project/download/verify-slide3.png
agent-browser eval "JSON.stringify((() => { const active=document.querySelector('.hero-slide.is-active img'); return {src: active.getAttribute('src'), loaded: active.complete}; })())"

echo "--- tightest desktop widths ---"
for W in 1121 1140 1180 1200 1280 1366; do
  agent-browser set viewport $W 800
  sleep 0.6
  agent-browser eval "JSON.stringify((() => { const b=document.querySelector('.nav-cta'); if(!b) return 'no-btn'; const r=b.getBoundingClientRect(); const toggle=getComputedStyle(document.querySelector('.nav-toggle')).display; return {w:window.innerWidth, overflow: r.right > window.innerWidth, hamburger: toggle !== 'none'}; })())"
done
