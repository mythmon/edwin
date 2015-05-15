from django.conf.urls import include, url
from django.conf.urls.static import static
from django.conf import settings
from django.contrib import admin

urlpatterns = [
    url(r'api', include('edwin.teams.urls', namespace='teams', app_name='teams')),
    url(r'admin', include(admin.site.urls)),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Must do this last because it has a catchall.
urlpatterns += [
    url(r'', include('edwin.client.urls', namespace='client', app_name='client'))
]
