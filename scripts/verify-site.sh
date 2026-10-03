#!/bin/bash
cd /home/z/my-project

pkill -f "vite" 2>/dev/null
pkill -f "manage.py runserver" 2>/dev/null
sleep 1

setsid nohup /home/z/.venv/bin/python backend/manage.py runserver 0.0.0.0:8000 > backend/server.log 2>&1 < /dev/null &
BACK_PID=$!
setsid nohup npx vite --host 0.0.0.0 --port 3000 > dev.log 2>&1 < /dev/null &
FRONT_PID=$!

for i in $(seq 1 30); do
  FRONT=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ 2>/dev/null)
  BACK=$(curl -s -o /dev/null -w "%{http_code}" -L http://localhost:8000/api/health 2>/dev/null)
  if [ "$FRONT" = "200" ] && [ "$BACK" = "200" ]; then
    echo "servers ready (front=$FRONT back=$BACK)"
    break
  fi
  sleep 1
done

agent-browser set viewport 1440 900
agent-browser open http://localhost:3000
agent-browser wait --load networkidle
sleep 1
agent-browser screenshot /home/z/my-project/download/verify-desktop.png
echo "--- console errors (desktop) ---"
agent-browser errors
agent-browser console | head -20

agent-browser eval "JSON.stringify({navBtn: (() => { const b=[...document.querySelectorAll('.nav-cta')][0]; if(!b) return null; const r=b.getBoundingClientRect(); return {left:r.left,right:r.right,viewportW:window.innerWidth,overflowing:r.right>window.innerWidth}; })(), heroImg: (() => { const i=document.querySelector('.hero-photo img'); return i ? {src:i.getAttribute('src'), complete:i.complete, w:i.clientWidth} : null; })(), chip: !!document.querySelector('.stat-chip')})"

agent-browser set viewport 1150 800
sleep 1
agent-browser eval "JSON.stringify((() => { const b=[...document.querySelectorAll('.nav-cta')][0]; const r=b.getBoundingClientRect(); const toggle=getComputedStyle(document.querySelector('.nav-toggle')).display; return {viewportW:window.innerWidth, btnRight:r.right, overflowing:r.right>window.innerWidth, hamburger:toggle}; })())"

agent-browser set viewport 1250 800
sleep 1
agent-browser eval "JSON.stringify((() => { const b=[...document.querySelectorAll('.nav-cta')][0]; const r=b.getBoundingClientRect(); const toggle=getComputedStyle(document.querySelector('.nav-toggle')).display; return {viewportW:window.innerWidth, btnRight:r.right, overflowing:r.right>window.innerWidth, hamburger:toggle}; })())"

agent-browser set viewport 1440 900
sleep 1
agent-browser eval "JSON.stringify((() => { const b=[...document.querySelectorAll('.nav-cta')][0]; const r=b.getBoundingClientRect(); return {viewportW:window.innerWidth, btnRight:r.right, overflowing:r.right>window.innerWidth}; })())"

agent-browser set viewport 390 844
agent-browser open http://localhost:3000
agent-browser wait --load networkidle
sleep 1
agent-browser screenshot /home/z/my-project/download/verify-mobile.png
agent-browser eval "JSON.stringify((() => { const img=document.querySelector('.hero-photo img'); const chip=document.querySelector('.stat-chip'); return {img: img?{src:img.getAttribute('src'),w:img.clientWidth}:null, chipVisible: chip?chip.getBoundingClientRect().width:null, docOverflowX: document.documentElement.scrollWidth > window.innerWidth}; })())"
agent-browser errors

echo "BACK_PID=$BACK_PID FRONT_PID=$FRONT_PID"
