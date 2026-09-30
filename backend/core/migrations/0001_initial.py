
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Article',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('order', models.PositiveIntegerField(unique=True)),
                ('title', models.CharField(max_length=220)),
                ('subtitle', models.CharField(blank=True, max_length=260)),
                ('slug', models.SlugField(max_length=240, unique=True)),
                ('nav_label', models.CharField(blank=True, max_length=80)),
                ('category', models.CharField(blank=True, max_length=80)),
                ('highlight', models.TextField(blank=True)),
                ('paragraphs', models.JSONField(blank=True, default=list)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'ordering': ['order'],
            },
        ),
        migrations.CreateModel(
            name='ContactMessage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=160)),
                ('email', models.EmailField(max_length=254)),
                ('phone', models.CharField(blank=True, max_length=60)),
                ('message', models.TextField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='EngagementEvent',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('path', models.CharField(blank=True, max_length=300)),
                ('metadata', models.JSONField(blank=True, default=dict)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='HeroSlide',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('sort_order', models.PositiveIntegerField(default=0)),
                ('eyebrow', models.CharField(blank=True, max_length=140)),
                ('heading', models.CharField(max_length=220)),
                ('accent', models.CharField(blank=True, max_length=220)),
                ('body', models.TextField(blank=True)),
                ('stat_value', models.CharField(blank=True, max_length=60)),
                ('stat_label', models.CharField(blank=True, max_length=140)),
                ('cta1_label', models.CharField(blank=True, max_length=80)),
                ('cta1_href', models.CharField(blank=True, max_length=200)),
                ('cta2_label', models.CharField(blank=True, max_length=80)),
                ('cta2_href', models.CharField(blank=True, max_length=200)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'ordering': ['sort_order'],
            },
        ),
        migrations.CreateModel(
            name='SiteSetting',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('site_name', models.CharField(default='The Merkato Fund', max_length=160)),
                ('tagline', models.CharField(blank=True, max_length=260)),
                ('slogan', models.CharField(blank=True, max_length=260)),
                ('contact_email', models.EmailField(blank=True, max_length=254)),
                ('contact_phone', models.CharField(blank=True, max_length=60)),
                ('contact_location', models.CharField(blank=True, max_length=260)),
                ('video_url', models.CharField(blank=True, max_length=400)),
                ('facebook_url', models.CharField(blank=True, max_length=400)),
                ('telegram_url', models.CharField(blank=True, max_length=400)),
                ('tiktok_url', models.CharField(blank=True, max_length=400)),
                ('instagram_url', models.CharField(blank=True, max_length=400)),
                ('footer_about', models.TextField(blank=True)),
                ('footer_legal', models.TextField(blank=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.CreateModel(
            name='SyncState',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('key', models.CharField(max_length=64, unique=True)),
                ('synced_at', models.DateTimeField(blank=True, null=True)),
            ],
        ),
    ]
