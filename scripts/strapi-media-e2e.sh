#!/bin/bash
cd /home/z/my-project/strapi-cms

CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:1337/admin 2>/dev/null || true)
if [ "$CODE" != "200" ]; then
  setsid nohup npm run develop > strapi.log 2>&1 < /dev/null &
  echo "booting strapi..."
  for i in $(seq 1 120); do
    CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:1337/admin 2>/dev/null || true)
    if [ "$CODE" = "200" ]; then break; fi
    sleep 2
  done
  node_modules/.bin/strapi admin:create-user --email admin@merkato.fund --password "MerkatoFund2026!" --firstname Admin --lastname User 2>&1 | tail -1 || echo "admin exists"
  sleep 2
fi
echo "strapi ready ($CODE)"

TOKEN_CACHE=/home/z/my-project/.strapi-token
TOKEN=""
if [ -f "$TOKEN_CACHE" ]; then
  CACHED=$(cat "$TOKEN_CACHE")
  VALID=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:1337/admin/users/me -H "Authorization: Bearer $CACHED" 2>/dev/null || true)
  if [ "$VALID" = "200" ]; then TOKEN=$CACHED; fi
fi

if [ -z "$TOKEN" ]; then
  RAW=$(curl -s -X POST http://localhost:1337/admin/login -H "Content-Type: application/json" \
    -d '{"email":"admin@merkato.fund","password":"MerkatoFund2026!"}')
  TOKEN=$(echo "$RAW" | python3 -c "import json,sys; print(json.load(sys.stdin)['data']['token'])" 2>/dev/null || true)
  TRIES=0
  while [ -z "$TOKEN" ] && [ $TRIES -lt 4 ]; do
    TRIES=$((TRIES+1))
    echo "waiting 70s for rate limit (try $TRIES)..."
    sleep 70
    RAW=$(curl -s -X POST http://localhost:1337/admin/login -H "Content-Type: application/json" \
      -d '{"email":"admin@merkato.fund","password":"MerkatoFund2026!"}')
    TOKEN=$(echo "$RAW" | python3 -c "import json,sys; print(json.load(sys.stdin)['data']['token'])" 2>/dev/null || true)
  done
fi
if [ -z "$TOKEN" ]; then echo "LOGIN FAILED"; exit 1; fi
echo "$TOKEN" > "$TOKEN_CACHE"
echo "login ok (len ${#TOKEN})"

API_TOKEN_NAME="e2e-$(date +%s)"
RES=$(curl -s --retry 3 --retry-delay 2 -X POST http://localhost:1337/admin/api-tokens -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"$API_TOKEN_NAME\",\"description\":\"temp\",\"type\":\"custom\",\"permissions\":[\"plugin::upload.content-api.upload\"]}")
ACCESS=$(echo "$RES" | python3 -c "import json,sys; print(json.load(sys.stdin).get('data',{}).get('accessKey',''))" 2>/dev/null || true)
if [ -z "$ACCESS" ]; then echo "api token create failed: ${RES:0:250}"; exit 1; fi
echo "api token ok"

UP=""
for attempt in 1 2 3; do
  UP=$(curl -s --retry 2 --retry-delay 2 -X POST "http://localhost:1337/api/upload" -H "Authorization: Bearer $ACCESS" \
    -F "files=@/home/z/my-project/upload/image2.jpg")
  if [ -n "$UP" ]; then break; fi
  echo "upload attempt $attempt empty, retrying..."
  sleep 2
done
MEDIA_ID=$(echo "$UP" | python3 -c "import json,sys; d=json.load(sys.stdin); f=d[0] if isinstance(d,list) else d; print(f.get('id',''))" 2>/dev/null || true)
MEDIA_URL=$(echo "$UP" | python3 -c "import json,sys; d=json.load(sys.stdin); f=d[0] if isinstance(d,list) else d; print(f.get('url',''))" 2>/dev/null || true)
if [ -z "$MEDIA_ID" ]; then echo "upload failed, raw: ${UP:0:250}"; exit 1; fi
echo "uploaded media id=$MEDIA_ID url=$MEDIA_URL"

DOCID=$(curl -s --retry 2 --retry-delay 2 "http://localhost:1337/content-manager/collection-types/api::hero-slide.hero-slide?page=1&pageSize=10" \
  -H "Authorization: Bearer $TOKEN" | python3 -c "import json,sys; d=json.load(sys.stdin); r=sorted(d['results'], key=lambda x: x.get('sort_order') or 0); print(r[0]['documentId'])" 2>/dev/null || true)
if [ -z "$DOCID" ]; then echo "could not read hero slides"; exit 1; fi
echo "slide1 documentId=$DOCID"

PUTRES=$(curl -s --retry 2 --retry-delay 2 -X PUT "http://localhost:1337/content-manager/collection-types/api::hero-slide.hero-slide/$DOCID" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"image\": $MEDIA_ID}")
echo "set image: ${PUTRES:0:140}"

PUBRES=$(curl -s --retry 2 --retry-delay 2 -X POST "http://localhost:1337/content-manager/collection-types/api::hero-slide.hero-slide/$DOCID/actions/publish" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{}')
echo "published: ${PUBRES:0:100}"

echo "--- Strapi public REST after ---"
curl -s "http://localhost:1337/api/hero-slides?populate=image" | python3 -c "
import json,sys
d = json.load(sys.stdin)
for s in d['data']:
    img = s.get('image')
    print('Strapi', s['sort_order'], s['heading'], '->', (img or {}).get('url') if isinstance(img, dict) else img)
" || echo "public REST parse failed"

echo "--- Django force sync ---"
cd /home/z/my-project/backend && /home/z/.venv/bin/python manage.py sync_content --force 2>&1 | tail -1
sleep 1
curl -s http://localhost:8000/api/hero-slides/ | python3 -c "
import json,sys
d = json.load(sys.stdin)
for s in d:
    print('Django', s['sort_order'], s['heading'], '->', s['image'])
" || echo "django api parse failed"

echo "--- media file served? ---"
curl -s -o /dev/null -w "media file: %{http_code}\n" "http://localhost:1337$MEDIA_URL"
echo "E2E DONE"
