from django.contrib import admin

from edwin.teams.models import Team


class TeamAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'current_burn_rate')


admin.site.register(Team, TeamAdmin)
