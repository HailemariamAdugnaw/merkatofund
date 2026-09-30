from django.utils import timezone

from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Article, ContactMessage, HeroSlide, SiteSetting
from .serializers import (
    ArticleSerializer,
    ContactMessageSerializer,
    EngagementEventSerializer,
    HeroSlideSerializer,
    SiteSettingSerializer,
)
from .services import refresh_content


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
