from django.urls import path

from . import views

urlpatterns = [
    path('articles/', views.article_list),
    path('hero-slides/', views.hero_slide_list),
    path('settings/', views.site_settings),
    path('app-download/', views.app_download),
    path('contact/', views.contact_create),
    path('events/', views.event_create),
    path('webhooks/strapi', views.strapi_webhook),
    path('health/', views.health),
]
