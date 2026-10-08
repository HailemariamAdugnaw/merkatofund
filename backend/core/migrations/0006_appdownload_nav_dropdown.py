from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0005_appdownload'),
    ]

    operations = [
        migrations.DeleteModel(name='AppDownload'),
        migrations.CreateModel(
            name='AppDownload',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('document_id', models.CharField(blank=True, default='', max_length=64)),
                ('is_active', models.BooleanField(default=True)),
                ('menu_label', models.CharField(blank=True, max_length=80)),
                ('badge', models.CharField(blank=True, max_length=120)),
                ('arm64_label', models.CharField(blank=True, max_length=80)),
                ('arm64_file', models.CharField(blank=True, max_length=400)),
                ('arm64_store_url', models.CharField(blank=True, max_length=400)),
                ('legacy_label', models.CharField(blank=True, max_length=80)),
                ('legacy_file', models.CharField(blank=True, max_length=400)),
                ('legacy_store_url', models.CharField(blank=True, max_length=400)),
                ('note', models.CharField(blank=True, max_length=260)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
        ),
    ]
