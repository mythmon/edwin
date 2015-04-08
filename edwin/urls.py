from django.conf.urls import include, url
from django.contrib import admin

urlpatterns = [
    url(r'', include('edwin.teams.urls')),
    url(r'', include('edwin.client.urls')),
    url(r'^admin/', include(admin.site.urls)),
]
