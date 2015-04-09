from django.conf.urls import include, url
from django.contrib import admin

urlpatterns = [
    url(r'api', include('edwin.teams.urls')),
    url(r'admin', include(admin.site.urls)),
    url(r'', include('edwin.client.urls')),
]
