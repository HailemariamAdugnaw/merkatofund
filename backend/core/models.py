from django.db import models


class SyncState(models.Model):
    key = models.CharField(max_length=64, unique=True)
    synced_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f'{self.key} @ {self.synced_at}'


class Article(models.Model):
    order = models.PositiveIntegerField(unique=True)
    title = models.CharField(max_length=220)
    subtitle = models.CharField(max_length=260, blank=True)
    slug = models.SlugField(max_length=240, unique=True)
    nav_label = models.CharField(max_length=80, blank=True)
    category = models.CharField(max_length=80, blank=True)
    highlight = models.TextField(blank=True)
    paragraphs = models.JSONField(default=list, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f'{self.order}. {self.title}'


class HeroSlide(models.Model):
    sort_order = models.PositiveIntegerField(default=0)
    eyebrow = models.CharField(max_length=140, blank=True)
    heading = models.CharField(max_length=220)
    accent = models.CharField(max_length=220, blank=True)
    body = models.TextField(blank=True)
    image = models.CharField(max_length=400, blank=True)
    stat_value = models.CharField(max_length=60, blank=True)
    stat_label = models.CharField(max_length=140, blank=True)
    cta1_label = models.CharField(max_length=80, blank=True)
    cta1_href = models.CharField(max_length=200, blank=True)
    cta2_label = models.CharField(max_length=80, blank=True)
    cta2_href = models.CharField(max_length=200, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['sort_order']

    def __str__(self):
        return self.heading


class SiteSetting(models.Model):
    site_name = models.CharField(max_length=160, default='The Merkato Fund')
    tagline = models.CharField(max_length=260, blank=True)
    slogan = models.CharField(max_length=260, blank=True)
    contact_email = models.EmailField(blank=True)
    contact_phone = models.CharField(max_length=60, blank=True)
    contact_location = models.CharField(max_length=260, blank=True)
    video_url = models.CharField(max_length=400, blank=True)
    facebook_url = models.CharField(max_length=400, blank=True)
    telegram_url = models.CharField(max_length=400, blank=True)
    tiktok_url = models.CharField(max_length=400, blank=True)
    instagram_url = models.CharField(max_length=400, blank=True)
    footer_about = models.TextField(blank=True)
    footer_legal = models.TextField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.site_name


class ContactMessage(models.Model):
    name = models.CharField(max_length=160)
    email = models.EmailField()
    phone = models.CharField(max_length=60, blank=True)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.name} <{self.email}>'


class EngagementEvent(models.Model):
    name = models.CharField(max_length=100)
    path = models.CharField(max_length=300, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.name} @ {self.created_at}'
