from django.conf.urls import url

from edwin.client import views


urlpatterns = [
    # This is a catch-all!
    url(r'.*', views.client, name='client'),
]
