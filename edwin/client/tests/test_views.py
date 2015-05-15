from django.core.urlresolvers import reverse
from django.test import TestCase


class ClientTestCase(TestCase):
    def test_client(self):
        resp = self.client.get(reverse('client:client'))
        self.assertEquals(resp.status_code, 200)
        self.assertTemplateUsed('index.html')

    def test_client_all_urls(self):
        resp = self.client.get('/ou812')
        self.assertEquals(resp.status_code, 200)
        self.assertTemplateUsed('index.html')
