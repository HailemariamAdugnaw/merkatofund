from django.core.management.base import BaseCommand

from core.services import refresh_content


class Command(BaseCommand):
    help = 'Pulls the latest content from Strapi into the local database'

    def add_arguments(self, parser):
        parser.add_argument('--force', action='store_true')

    def handle(self, *args, **options):
        errors = refresh_content(force=options['force'])
        if errors:
            self.stdout.write(self.style.WARNING(f'Sync finished with errors for: {", ".join(errors)}'))
        else:
            self.stdout.write(self.style.SUCCESS('Content synced successfully'))
