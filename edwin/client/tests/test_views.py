from django.core.urlresolvers import reverse
from django.test import Client, TestCase


class ClientTestCase(TestCase):
    def test_client(self):
        client = Client()
        resp = client.get(reverse('client:client'))
        assert resp.status_code == 200
