from django.conf.urls import url, include
from rest_framework import routers, serializers, viewsets

from edwin.teams.models import Team


class TeamSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Team
        fields = ('name', 'slug', 'current_burn_rate')


# ViewSets define the view behavior.
class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
