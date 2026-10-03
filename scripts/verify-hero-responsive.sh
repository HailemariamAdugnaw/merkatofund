#!/bin/bash
cd /home/z/my-project

pkill -f "vite" 2>/dev/null
pkill -f "manage.py runserver" 2>/dev/null
sleep 1
rm -rf node_modules/.vite

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

TIECHECK="(() => { const hero=document.querySelector('.hero'); const stage=document.querySelector('.hero-stage'); const img=document.querySelector('.hero-slide-bg.is-active img'); const scrim=getComputedStyle(document.querySelector('.hero-scrim')); return { stagePos: getComputedStyle(stage).position, stageTied: stage.offsetWidth===hero.offsetWidth && stage.offsetHeight===hero.offsetHeight, imgTied: img.offsetWidth===hero.offsetWidth && img.offsetHeight===hero.offsetHeight, imgFill: img.offsetWidth+'x'+img.offsetHeight+' vs '+hero.offsetWidth+'x'+hero.offsetHeight, heroW: hero.offsetWidth, heroH: hero.offsetHeight, scrimTop: scrim.backgroundImage.match(/rgba\\(26, 14, 11, ([0-9.]+)\\)/)?.[1], overflowX: document.documentElement.scrollWidth > window.innerWidth }; })()"

agent-browser set viewport 1440 900
agent-browser open http://localhost:3000
agent-browser wait --load networkidle
sleep 1.5
agent-browser screenshot /home/z/my-project/download/verify-rhero-desktop.png
agent-browser eval "JSON.stringify({ mode:'desktop-1440', ...$TIECHECK, scrimIsDesktopGrad: getComputedStyle(document.querySelector('.hero-scrim')).backgroundImage.includes('0.88'), arrowVisible: getComputedStyle(document.querySelector('.hero-arrow-prev')).display!=='none' })"

echo "--- tablet portrait 768x1024 ---"
agent-browser set viewport 768 1024
agent-browser open http://localhost:3000
agent-browser wait --load networkidle
sleep 1.5
agent-browser screenshot /home/z/my-project/download/verify-rhero-tablet.png
agent-browser eval "JSON.stringify({ mode:'tablet-768-portrait', ...$TIECHECK, arrowVisible: getComputedStyle(document.querySelector('.hero-arrow-prev')).display!=='none' })"

echo "--- mobile portrait 390x844 ---"
agent-browser set viewport 390 844
agent-browser open http://localhost:3000
agent-browser wait --load networkidle
sleep 1.5
agent-browser screenshot /home/z/my-project/download/verify-rhero-mobile.png
agent-browser eval "JSON.stringify({ mode:'mobile-390-portrait', ...$TIECHECK, arrowHidden: getComputedStyle(document.querySelector('.hero-arrow-prev')).display==='none', hudAboveSocial: getComputedStyle(document.querySelector('.hero-hud')).bottom })"

echo "--- mobile dot nav ---"
agent-browser eval "[...document.querySelectorAll('.hero-dot')][1].click(); 'clicked-dot-2'"
sleep 1.4
agent-browser eval "JSON.stringify({ counter: document.querySelector('.hero-counter-current').textContent, activeSrc: document.querySelector('.hero-slide-bg.is-active img').getAttribute('src'), activeAnim: getComputedStyle(document.querySelector('.hero-slide-bg.is-active img')).animationName })"
agent-browser screenshot /home/z/my-project/download/verify-rhero-mobile-slide2.png

echo "--- small phone 360x640 ---"
agent-browser set viewport 360 640
agent-browser open http://localhost:3000
agent-browser wait --load networkidle
sleep 1.5
agent-browser screenshot /home/z/my-project/download/verify-rhero-small.png
agent-browser eval "JSON.stringify({ mode:'small-360', ...$TIECHECK })"

echo "--- landscape phone 812x375 ---"
agent-browser set viewport 812 375
agent-browser open http://localhost:3000
agent-browser wait --load networkidle
sleep 1.5
agent-browser screenshot /home/z/my-project/download/verify-rhero-landscape.png
agent-browser eval "JSON.stringify({ mode:'landscape-812', ...$TIECHECK, arrowVisible: getComputedStyle(document.querySelector('.hero-arrow-prev')).display!=='none' })"

echo "--- console errors ---"
agent-browser errors
echo "verify-hero-responsive done"
