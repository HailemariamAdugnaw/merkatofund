from django.urls import path

from . import views

urlpatterns = [
    path('articles/', views.article_list),
    path('hero-slides/', views.hero_slide_list),
    path('settings/', views.site_settings),
    path('contact/', views.contact_create),
    path('events/', views.event_create),
    path('health/', views.health),
]
