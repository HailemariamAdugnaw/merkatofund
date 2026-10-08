import hmac
import logging
import threading
import time

from django.conf import settings
from django.utils import timezone

from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import AppDownload, Article, ContactMessage, HeroSlide, SiteSetting
from .serializers import (
    AppDownloadSerializer,
    ArticleSerializer,
    ContactMessageSerializer,
    EngagementEventSerializer,
    HeroSlideSerializer,
    SiteSettingSerializer,
)
from .defaults import DEFAULT_APP_DOWNLOAD
from .services import refresh_content

logger = logging.getLogger(__name__)

WEBHOOK_DEBOUNCE_SECONDS = 1.5
_webhook_lock = threading.Lock()
_last_webhook_at = 0.0


def _run_webhook_sync():
    time.sleep(0.4)
    try:
        errors = refresh_content(force=True)
        if errors:
            logger.warning('Webhook-triggered sync failed for: %s', ', '.join(errors))
    except Exception as exc:
        logger.warning('Webhook-triggered sync errored: %s', exc)


@api_view(['POST'])
def strapi_webhook(request):
    expected = settings.STRAPI_WEBHOOK_SECRET
    if not expected:
        return Response(
            {'detail': 'Webhook receiver is not configured (set STRAPI_WEBHOOK_SECRET)'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )
    provided = request.headers.get('X-Strapi-Webhook-Secret', '')
    if not hmac.compare_digest(provided.encode('utf-8'), expected.encode('utf-8')):
        return Response({'detail': 'Invalid webhook secret'}, status=status.HTTP_401_UNAUTHORIZED)
    global _last_webhook_at
    with _webhook_lock:
        now = time.monotonic()
        if now - _last_webhook_at < WEBHOOK_DEBOUNCE_SECONDS:
            return Response({'status': 'debounced'})
        _last_webhook_at = now
    event = ''
    if isinstance(request.data, dict):
        event = str(request.data.get('event') or '')
    threading.Thread(target=_run_webhook_sync, daemon=True).start()
    return Response({'status': 'accepted', 'event': event})


@api_view(['GET'])
def article_list(request):
    refresh_content()
    articles = Article.objects.all()
    return Response(ArticleSerializer(articles, many=True).data)


@api_view(['GET'])
def hero_slide_list(request):
    refresh_content()
    slides = HeroSlide.objects.all()
    return Response(HeroSlideSerializer(slides, many=True).data)


@api_view(['GET'])
def site_settings(request):
    refresh_content()
    site_setting = SiteSetting.objects.first()
    return Response(SiteSettingSerializer(site_setting).data)


@api_view(['GET'])
def app_download(request):
    refresh_content()
    entry = AppDownload.objects.first()
    if entry is None:
        entry = AppDownload.objects.create(**DEFAULT_APP_DOWNLOAD)
    return Response(AppDownloadSerializer(entry).data)


@api_view(['POST'])
def contact_create(request):
    serializer = ContactMessageSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    message = serializer.save()
    return Response({'id': message.id, 'status': 'received'}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
def event_create(request):
    serializer = EngagementEventSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
def health(request):
    database_ok = True
    try:
        ContactMessage.objects.exists()
    except Exception:
        database_ok = False
    return Response(
        {
            'status': 'ok',
            'service': 'merkato-backend',
            'database': 'ok' if database_ok else 'error',
            'time': timezone.now().isoformat(),
        }
    )
