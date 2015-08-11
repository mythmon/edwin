from rest_framework import serializers, viewsets, fields

from edwin.teams.models import Team


class CommaSeparatedCharField(fields.CharField):
    def to_representation(self, obj):
        """From database to api output."""
        return [r for r in obj.split(',') if r]

    def to_internal_value(self, data):
        """From api input to database."""
        return ','.join(data)


class TeamSerializer(serializers.HyperlinkedModelSerializer):
    github_repo = CommaSeparatedCharField()

    class Meta:
        model = Team
        fields = ('name', 'slug', 'current_burn_rate', 'github_repo')


# ViewSets define the view behavior.
class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.order_by('pk').all()
    serializer_class = TeamSerializer
    lookup_field = 'slug'
