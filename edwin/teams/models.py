from django.db import models


class Team(models.Model):
    name = models.CharField(max_length=64)
    slug = models.SlugField(max_length=64, unique=True)
    # Burn rate is points per week
    current_burn_rate = models.IntegerField()
    # Like "mozilla/edwin"
    github_repo = models.CharField(max_length=64, blank=True)
