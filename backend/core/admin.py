from django.contrib import admin

from .models import Article, ContactMessage, EngagementEvent, HeroSlide, SiteSetting


@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ['order', 'title', 'slug', 'nav_label']
    search_fields = ['title', 'slug']
    list_display_links = ['order', 'title']


@admin.register(HeroSlide)
class HeroSlideAdmin(admin.ModelAdmin):
    list_display = ['sort_order', 'heading', 'stat_value', 'stat_label']


@admin.register(SiteSetting)
class SiteSettingAdmin(admin.ModelAdmin):
    list_display = ['site_name', 'contact_email', 'contact_phone']


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'phone', 'created_at']
    search_fields = ['name', 'email']
    readonly_fields = ['name', 'email', 'phone', 'message', 'created_at']


@admin.register(EngagementEvent)
class EngagementEventAdmin(admin.ModelAdmin):
    list_display = ['name', 'path', 'created_at']
    search_fields = ['name']
    readonly_fields = ['name', 'path', 'metadata', 'created_at']
