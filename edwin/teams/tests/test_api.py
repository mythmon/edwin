import json

from django.core.urlresolvers import reverse
from django.test import Client, TestCase
from django.utils.encoding import smart_text

from edwin.teams.models import Team


class APITestCase(TestCase):
    def setUp(self):
        self.client = Client()

    def test_no_teams(self):
        resp = self.client.get(reverse('teams:team-list'))
        self.assertEquals(resp.status_code, 200)
        self.assertEquals(json.loads(smart_text(resp.content)), [])

    def test_teams(self):
        team1 = Team.objects.create(name='awesome', slug='awesome', current_burn_rate=10)

        resp = self.client.get(reverse('teams:team-list'))
        self.assertEquals(resp.status_code, 200)
        self.assertEquals(
            json.loads(smart_text(resp.content)),
            [
                {'name': team1.name,
                 'slug': team1.slug,
                 'current_burn_rate': team1.current_burn_rate,
                 'github_repo': team1.github_repo},
            ]
        )

        team2 = Team.objects.create(name='toiletpaper', slug='tp', current_burn_rate=5)

        resp = self.client.get(reverse('teams:team-list'))
        self.assertEquals(resp.status_code, 200)
        self.assertEquals(
            json.loads(smart_text(resp.content)),
            [
                {'name': team1.name,
                 'slug': team1.slug,
                 'current_burn_rate': team1.current_burn_rate,
                 'github_repo': team1.github_repo},
                {'name': team2.name,
                 'slug': team2.slug,
                 'current_burn_rate': team2.current_burn_rate,
                 'github_repo': team2.github_repo},
            ]
        )

    def test_single_team(self):
        team1 = Team.objects.create(name='awesome', slug='awesome', current_burn_rate=10)

        resp = self.client.get(reverse('teams:team-detail', args=(team1.slug,)))
        self.assertEquals(resp.status_code, 200)
        self.assertEquals(
            json.loads(smart_text(resp.content)),
            {'name': team1.name,
             'slug': team1.slug,
             'current_burn_rate': team1.current_burn_rate,
             'github_repo': team1.github_repo}
        )
