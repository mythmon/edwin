from django.core.management.base import BaseCommand

from edwin.teams.models import Team


class Command(BaseCommand):
    help = 'Converts specified user into a superuser'

    def add_arguments(self, parser):
        parser.add_argument('name', type=str)
        parser.add_argument('slug', type=str)

    def handle(self, *args, **options):
        Team.objects.create(name=options['name'], slug=options['slug'], current_burn_rate=0).save()
        print('Team {0} added. Done!'.format(options['name']))
