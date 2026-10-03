#!/bin/bash
cd /home/z/my-project

pkill -f "vite" 2>/dev/null
pkill -f "manage.py runserver" 2>/dev/null
sleep 1

setsid nohup /home/z/.venv/bin/python backend/manage.py runserver 0.0.0.0:8000 > backend/server.log 2>&1 < /dev/null &
setsid nohup npx vite --host 0.0.0.0 --port 3000 > dev.log 2>&1 < /dev/null &

for i in $(seq 1 30); do
  FRONT=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ 2>/dev/null)
  BACK=$(curl -s -o /dev/null -w "%{http_code}" -L http://localhost:8000/api/health 2>/dev/null)
  if [ "$FRONT" = "200" ] && [ "$BACK" = "200" ]; then break; fi
  sleep 1
done
echo "front=$FRONT back=$BACK"

agent-browser set viewport 1440 900
agent-browser open http://localhost:3000
agent-browser wait --load networkidle
sleep 1.5
agent-browser screenshot /home/z/my-project/download/v2-hero.png
echo "--- hero structure ---"
agent-browser eval "JSON.stringify((() => { const pane=document.querySelector('.hero-text-pane'); const track=document.querySelector('.hero-track'); const vis=document.querySelectorAll('.hero-slide-visual'); const chip=document.querySelector('.hero-text-pane .stat-chip'); const img=document.querySelector('.hero-slide-visual.is-active img'); return {textPane: !!pane, trackTransform: track ? track.style.transform : null, visualCount: vis.length, chipInTextPane: !!chip, activeImg: img ? {src: img.getAttribute('src'), loaded: img.complete && img.naturalWidth > 0} : null}; })())"
echo "--- console errors ---"
agent-browser errors

echo "--- timeline zigzag ---"
agent-browser eval "JSON.stringify((() => { const first=document.querySelector('.timeline-item.align-left'); const second=document.querySelector('.timeline-item.align-right'); const vis=document.querySelectorAll('.article-visual'); const imgs=[...document.querySelectorAll('.article-visual img')]; const cardLeft=first.querySelector('.article-card').getBoundingClientRect().left; const visLeft=first.querySelector('.article-visual').getBoundingClientRect().left; const card2Left=second.querySelector('.article-card').getBoundingClientRect().left; const vis2Left=second.querySelector('.article-visual').getBoundingClientRect().left; return {visualCount: vis.length, loadedImgs: imgs.filter(i=>i.complete && i.naturalWidth>0).length, item1: {cardLeft: Math.round(cardLeft), visualLeft: Math.round(visLeft)}, item2: {cardLeft: Math.round(card2Left), visualLeft: Math.round(vis2Left)}; }; })())"
agent-browser eval "document.querySelector('.timeline-item').scrollIntoView({block:'center'})"
sleep 1.5
agent-browser screenshot /home/z/my-project/download/v2-timeline.png
agent-browser eval "document.querySelectorAll('.timeline-item')[1].scrollIntoView({block:'center'})"
sleep 1.5
agent-browser screenshot /home/z/my-project/download/v2-timeline-right.png

echo "--- mobile ---"
agent-browser set viewport 390 844
agent-browser eval "window.scrollTo(0,0)"
sleep 1
agent-browser screenshot /home/z/my-project/download/v2-mobile-hero.png
agent-browser eval "document.querySelector('.timeline-item').scrollIntoView({block:'start'})"
sleep 1.5
agent-browser screenshot /home/z/my-project/download/v2-mobile-timeline.png
agent-browser eval "JSON.stringify({overflowX: document.documentElement.scrollWidth > window.innerWidth})"
agent-browser errors
echo "VERIFY DONE"
