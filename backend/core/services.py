import logging
from datetime import timedelta

import requests
from django.conf import settings
from django.utils import timezone

from .defaults import DEFAULT_ARTICLES, DEFAULT_HERO_SLIDES, DEFAULT_SETTINGS
from .models import Article, HeroSlide, SiteSetting, SyncState

logger = logging.getLogger(__name__)


def _strapi_get(path, params=None):
    headers = {}
    if settings.STRAPI_API_TOKEN:
        headers['Authorization'] = f'Bearer {settings.STRAPI_API_TOKEN}'
    response = requests.get(
        f'{settings.STRAPI_BASE_URL}{path}',
        params=params or {},
        headers=headers,
        timeout=settings.STRAPI_TIMEOUT_SECONDS,
    )
    response.raise_for_status()
    return response.json()


def _cache_is_fresh(key):
    state = SyncState.objects.filter(key=key).first()
    if state is None or state.synced_at is None:
        return False
    return timezone.now() - state.synced_at < timedelta(seconds=settings.CONTENT_SYNC_TTL_SECONDS)


def _mark_synced(key):
    SyncState.objects.update_or_create(key=key, defaults={'synced_at': timezone.now()})


def _unwrap_attributes(entry):
    if not isinstance(entry, dict):
        return {}
    return entry.get('attributes', entry)


def _split_paragraphs(body):
    if not body:
        return []
    normalized = str(body).replace('\r\n', '\n')
    return [part.strip() for part in normalized.split('\n\n') if part.strip()]


def _normalize_url(value):
    cleaned = (value or '').strip()
    if cleaned and not cleaned.startswith(('http://', 'https://')):
        return f'https://{cleaned}'
    return cleaned


def _resolve_media_url(value):
    if isinstance(value, dict):
        url = (value.get('url') or '').strip()
        if not url:
            return ''
        if url.startswith('/'):
            return f"{settings.STRAPI_BASE_URL.rstrip('/')}{url}"
        return url
    if isinstance(value, str):
        return value.strip()
    return ''


def _document_id(item, attrs):
    for source in (item, attrs):
        if isinstance(source, dict):
            value = str(source.get('documentId') or '').strip()
            if value:
                return value
    return ''


def _payload_total(payload):
    meta = payload.get('meta') if isinstance(payload, dict) else None
    pagination = meta.get('pagination') if isinstance(meta, dict) else None
    if isinstance(pagination, dict):
        try:
            return int(pagination.get('total') or 0)
        except (TypeError, ValueError):
            return 0
    return 0


def _apply_fields(instance, defaults):
    for field, value in defaults.items():
        setattr(instance, field, value)
    instance.save()


def _prune_stale(model, seen_ids, items_count, total):
    if items_count == 0 or not seen_ids:
        return
    if total > items_count:
        logger.warning(
            'Strapi reports %s entries but returned %s; skipping stale-entry deletion',
            total,
            items_count,
        )
        return
    removed, _ = model.objects.exclude(document_id__in=seen_ids).delete()
    if removed:
        logger.info('Removed %s stale %s rows no longer published in Strapi', removed, model.__name__)


def sync_articles():
    payload = _strapi_get(
        '/api/articles',
        {
            'sort': 'order:asc',
            'status': 'published',
            'pagination[pageSize]': 100,
            'populate': 'image',
        },
    )
    items = payload.get('data', []) if isinstance(payload, dict) else []
    seen_ids = []
    for item in items:
        attrs = _unwrap_attributes(item)
        title = attrs.get('title')
        if not title:
            continue
        document_id = _document_id(item, attrs)
        order = attrs.get('order') or 0
        defaults = {
            'title': title,
            'subtitle': attrs.get('subtitle') or '',
            'slug': attrs.get('slug') or f'article-{order}',
            'nav_label': attrs.get('nav_label') or '',
            'category': attrs.get('category') or f'Article {order}',
            'highlight': attrs.get('highlight') or '',
            'paragraphs': _split_paragraphs(attrs.get('body')),
            'image': _resolve_media_url(attrs.get('image')),
        }
        article = Article.objects.filter(document_id=document_id).first() if document_id else None
        if article is None and document_id:
            article = Article.objects.filter(document_id='', order=order).first()
        if article is None:
            try:
                article = Article.objects.create(order=order, document_id=document_id, **defaults)
            except Exception:
                article = Article.objects.filter(order=order).first()
                if article is None:
                    raise
                article.document_id = document_id
                _apply_fields(article, defaults)
        else:
            article.document_id = document_id or article.document_id
            _apply_fields(article, defaults)
        if document_id:
            seen_ids.append(document_id)
    _prune_stale(Article, seen_ids, len(items), _payload_total(payload))


def sync_hero_slides():
    payload = _strapi_get(
        '/api/hero-slides',
        {
            'sort': 'sort_order:asc',
            'status': 'published',
            'pagination[pageSize]': 50,
            'populate': 'image',
        },
    )
    items = payload.get('data', []) if isinstance(payload, dict) else []
    seen_ids = []
    for index, item in enumerate(items):
        attrs = _unwrap_attributes(item)
        heading = attrs.get('heading')
        if not heading:
            continue
        document_id = _document_id(item, attrs)
        sort_order = attrs.get('sort_order')
        if sort_order is None:
            sort_order = index
        defaults = {
            'eyebrow': attrs.get('eyebrow') or '',
            'heading': heading,
            'accent': attrs.get('accent') or '',
            'body': attrs.get('body') or '',
            'image': _resolve_media_url(attrs.get('image')),
            'stat_value': attrs.get('stat_value') or '',
            'stat_label': attrs.get('stat_label') or '',
            'cta1_label': attrs.get('cta1_label') or '',
            'cta1_href': attrs.get('cta1_href') or '',
            'cta2_label': attrs.get('cta2_label') or '',
            'cta2_href': attrs.get('cta2_href') or '',
        }
        slide = HeroSlide.objects.filter(document_id=document_id).first() if document_id else None
        if slide is None and document_id:
            slide = HeroSlide.objects.filter(document_id='', heading=heading).first()
        if slide is None and document_id:
            slide = HeroSlide.objects.filter(document_id='', sort_order=sort_order).first()
        if slide is None:
            slide = HeroSlide.objects.create(sort_order=sort_order, document_id=document_id, **defaults)
        else:
            slide.document_id = document_id or slide.document_id
            defaults['sort_order'] = sort_order
            _apply_fields(slide, defaults)
        if document_id:
            seen_ids.append(document_id)
    _prune_stale(HeroSlide, seen_ids, len(items), _payload_total(payload))


def sync_settings():
    payload = _strapi_get('/api/site-setting', {'status': 'published'})
    entry = payload.get('data') if isinstance(payload, dict) else None
    attrs = _unwrap_attributes(entry)
    if not attrs:
        return
    fields = {
        'site_name': attrs.get('site_name') or 'The Merkato Fund',
        'tagline': attrs.get('tagline') or '',
        'slogan': attrs.get('slogan') or '',
        'contact_email': attrs.get('contact_email') or '',
        'contact_phone': attrs.get('contact_phone') or '',
        'contact_location': attrs.get('contact_location') or '',
        'video_url': attrs.get('video_url') or '',
        'facebook_url': _normalize_url(attrs.get('facebook_url')),
        'telegram_url': _normalize_url(attrs.get('telegram_url')),
        'tiktok_url': _normalize_url(attrs.get('tiktok_url')),
        'instagram_url': _normalize_url(attrs.get('instagram_url')),
        'footer_about': attrs.get('footer_about') or '',
        'footer_legal': attrs.get('footer_legal') or '',
    }
    site_setting = SiteSetting.objects.first()
    if site_setting is None:
        SiteSetting.objects.create(**fields)
    else:
        for field, value in fields.items():
            setattr(site_setting, field, value)
        site_setting.save()


def seed_default_content():
    if Article.objects.count() == 0:
        for article in DEFAULT_ARTICLES:
            Article.objects.create(**article)
    if HeroSlide.objects.count() == 0:
        for slide in DEFAULT_HERO_SLIDES:
            HeroSlide.objects.create(**slide)
    if SiteSetting.objects.count() == 0:
        SiteSetting.objects.create(**DEFAULT_SETTINGS)


def refresh_content(force=False):
    if (
        Article.objects.count() == 0
        and HeroSlide.objects.count() == 0
        and SiteSetting.objects.count() == 0
    ):
        seed_default_content()
    tasks = []
    if force or not _cache_is_fresh('articles'):
        tasks = [
            ('articles', sync_articles),
            ('hero_slides', sync_hero_slides),
            ('settings', sync_settings),
        ]
    errors = []
    for key, task in tasks:
        try:
            task()
            _mark_synced(key)
        except Exception as exc:
            logger.warning('Content sync for %s failed: %s', key, exc)
            errors.append(key)
    return errors
