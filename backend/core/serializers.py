from rest_framework import serializers

from .models import AppDownload, Article, ContactMessage, EngagementEvent, HeroSlide, SiteSetting


class ArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Article
        fields = [
            'order',
            'slug',
            'nav_label',
            'category',
            'title',
            'subtitle',
            'highlight',
            'paragraphs',
            'image',
        ]


class HeroSlideSerializer(serializers.ModelSerializer):
    class Meta:
        model = HeroSlide
        fields = [
            'sort_order',
            'eyebrow',
            'heading',
            'accent',
            'body',
            'image',
            'stat_value',
            'stat_label',
            'cta1_label',
            'cta1_href',
            'cta2_label',
            'cta2_href',
        ]


class SiteSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSetting
        fields = [
            'site_name',
            'tagline',
            'slogan',
            'contact_email',
            'contact_phone',
            'contact_location',
            'video_url',
            'facebook_url',
            'telegram_url',
            'tiktok_url',
            'instagram_url',
            'footer_about',
            'footer_legal',
        ]


class AppDownloadSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppDownload
        fields = [
            'is_active',
            'menu_label',
            'badge',
            'arm64_label',
            'arm64_file',
            'arm64_store_url',
            'legacy_label',
            'legacy_file',
            'legacy_store_url',
            'note',
        ]


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ['id', 'name', 'email', 'phone', 'message', 'created_at']
        read_only_fields = ['id', 'created_at']


class EngagementEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = EngagementEvent
        fields = ['id', 'name', 'path', 'metadata', 'created_at']
        read_only_fields = ['id', 'created_at']
