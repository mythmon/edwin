from django.conf.urls import include, url
from rest_framework import routers

from edwin.teams import api


router = routers.DefaultRouter()
router.register(r'teams', api.TeamViewSet)


urlpatterns = [
    url(r'^api/', include(router.urls)),
]
