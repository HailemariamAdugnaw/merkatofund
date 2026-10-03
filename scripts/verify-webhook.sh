#!/bin/bash
cd /home/z/my-project
SECRET="sandbox-webhook-secret"
PY=/home/z/.venv/bin/python

pkill -f "manage.py runserver" 2>/dev/null
pkill -f "vite" 2>/dev/null
pkill -f "mock-strapi.py" 2>/dev/null
sleep 1

$PY scripts/mock-state.py full

setsid nohup env STRAPI_WEBHOOK_SECRET="$SECRET" $PY backend/manage.py runserver 0.0.0.0:8000 > backend/server.log 2>&1 < /dev/null &
setsid nohup $PY scripts/mock-strapi.py > mock-strapi.log 2>&1 < /dev/null &
setsid nohup npx vite --host 0.0.0.0 --port 3000 > dev.log 2>&1 < /dev/null &

for i in $(seq 1 30); do
  FRONT=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ 2>/dev/null)
  BACK=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/health/ 2>/dev/null)
  MOCK=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:1337/api/hero-slides 2>/dev/null)
  if [ "$FRONT" = "200" ] && [ "$BACK" = "200" ] && [ "$MOCK" = "200" ]; then
    echo "servers ready (front=$FRONT back=$BACK mock=$MOCK)"
    break
  fi
  sleep 1
done

count_articles() { curl -s http://localhost:8000/api/articles/ | $PY -c "import json,sys; print(len(json.load(sys.stdin)))"; }
count_slides() { curl -s http://localhost:8000/api/hero-slides/ | $PY -c "import json,sys; print(len(json.load(sys.stdin)))"; }

echo "=== PHASE 1: baseline sync + seed adoption ==="
$PY backend/manage.py sync_content --force
echo "articles=$(count_articles) (expect 7)  slides=$(count_slides) (expect 3)"
$PY backend/manage.py shell -c "from core.models import Article, HeroSlide; print('articles with document_id:', Article.objects.exclude(document_id='').count(), '/ slides:', HeroSlide.objects.exclude(document_id='').count())"
$PY backend/manage.py shell -c "from core.models import Article, HeroSlide; print('total rows:', Article.objects.count(), '/', HeroSlide.objects.count())"

echo "=== PHASE 2: rename heading keeps single row (no ghost) ==="
$PY scripts/mock-state.py rename-slide1
$PY backend/manage.py sync_content --force
echo "slides=$(count_slides) (expect 3)"
$PY backend/manage.py shell -c "from core.models import HeroSlide; s=HeroSlide.objects.get(document_id='slide-1'); print('renamed heading:', s.heading); print('dup check (rows with empty doc id):', HeroSlide.objects.filter(document_id='').count())"

echo "=== PHASE 3: webhook auth ==="
echo -n "wrong secret -> "; curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:8000/api/webhooks/strapi -H "Content-Type: application/json" -H "X-Strapi-Webhook-Secret: wrong" -d '{"event":"entry.delete"}'
echo -n "missing header -> "; curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:8000/api/webhooks/strapi -H "Content-Type: application/json" -d '{"event":"entry.delete"}'
echo -n "correct secret -> "; curl -s -X POST http://localhost:8000/api/webhooks/strapi -H "Content-Type: application/json" -H "X-Strapi-Webhook-Secret: $SECRET" -d '{"event":"entry.publish"}'; echo
sleep 3
echo "articles after webhook=$(count_articles) (expect 7)"

echo "=== PHASE 4: unpublish/delete propagation via webhook ==="
$PY scripts/mock-state.py delete-article7-slide3
curl -s -X POST http://localhost:8000/api/webhooks/strapi -H "Content-Type: application/json" -H "X-Strapi-Webhook-Secret: $SECRET" -d '{"event":"entry.unpublish","model":"article"}' > /dev/null
sleep 4
echo "articles=$(count_articles) (expect 6)  slides=$(count_slides) (expect 2)"
$PY backend/manage.py shell -c "from core.models import Article, HeroSlide; print('ghost check:', Article.objects.filter(document_id='art-7').exists(), HeroSlide.objects.filter(document_id='slide-3').exists(), '(expect False False)')"
echo "title lookups:"
curl -s http://localhost:8000/api/articles/ | $PY -c "import json,sys; d=json.load(sys.stdin); print('  art-7 present:', any(a['order']==7 for a in d))"
curl -s http://localhost:8000/api/hero-slides/ | $PY -c "import json,sys; d=json.load(sys.stdin); print('  slide-3 present:', any(s['heading']=='Mock Heading 3' for s in d))"

agent-browser set viewport 1440 900
agent-browser open http://localhost:3000
agent-browser wait --load networkidle
sleep 1.5
agent-browser screenshot /home/z/my-project/download/verify-webhook-deleted.png
agent-browser eval "JSON.stringify({ heroCounter: document.querySelector('.hero-counter-current').textContent+'/'+document.querySelector('.hero-counter-total').textContent, timelineRows: document.querySelectorAll('.timeline-item').length, navLinks: document.querySelectorAll('.nav-links .nav-link').length })"

echo "=== PHASE 5: empty payload safety guard ==="
$PY scripts/mock-state.py empty
curl -s -X POST http://localhost:8000/api/webhooks/strapi -H "Content-Type: application/json" -H "X-Strapi-Webhook-Secret: $SECRET" -d '{"event":"entry.delete"}' > /dev/null
sleep 4
echo "articles=$(count_articles) (expect 6, rows must survive)  slides=$(count_slides) (expect 2, rows must survive)"

echo "=== PHASE 6: CMS-down resilience ==="
pkill -f "mock-strapi.py" 2>/dev/null
sleep 1
$PY backend/manage.py sync_content --force 2>&1 | tail -1
echo "articles=$(count_articles) (expect 6)  slides=$(count_slides) (expect 2)"

echo "=== PHASE 7: restore full content via webhook ==="
$PY scripts/mock-state.py full
setsid nohup $PY scripts/mock-strapi.py >> mock-strapi.log 2>&1 < /dev/null &
sleep 2
curl -s -X POST http://localhost:8000/api/webhooks/strapi -H "Content-Type: application/json" -H "X-Strapi-Webhook-Secret: $SECRET" -d '{"event":"entry.publish"}' > /dev/null
sleep 4
echo "articles=$(count_articles) (expect 7)  slides=$(count_slides) (expect 3)"

echo "=== PHASE 8: reset sandbox Django DB to brand defaults ==="
pkill -f "mock-strapi.py" 2>/dev/null
$PY backend/manage.py shell -c "from core.models import Article, HeroSlide, SiteSetting, SyncState; Article.objects.all().delete(); HeroSlide.objects.all().delete(); SiteSetting.objects.all().delete(); SyncState.objects.all().delete(); print('tables cleared')"
curl -s http://localhost:8000/api/articles/ > /dev/null
sleep 1
echo "articles=$(count_articles) (expect 7)  slides=$(count_slides) (expect 3)"
curl -s http://localhost:8000/api/hero-slides/ | $PY -c "import json,sys; d=json.load(sys.stdin); print('default heading back:', d[0]['heading'])"

echo "=== console errors ==="
agent-browser errors
echo "verify-webhook done"
