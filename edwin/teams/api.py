from rest_framework import serializers, viewsets

from edwin.teams.models import Team


class TeamSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Team
        fields = ('name', 'slug', 'current_burn_rate')


# ViewSets define the view behavior.
class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.order_by('pk').all()
    serializer_class = TeamSerializer
    lookup_field = 'slug'
