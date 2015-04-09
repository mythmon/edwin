from django.conf.urls import url

from edwin.client import views


urlpatterns = [
    url(r'^$', views.client),
]
