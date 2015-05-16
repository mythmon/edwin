from django.db import models


class Team(models.Model):
    name = models.CharField(max_length=64)
    slug = models.SlugField(max_length=64, unique=True)
    current_burn_rate = models.IntegerField(
        help_text='Burn rate is in points per week')
    github_repo = models.CharField(
        max_length=64, blank=True,
        help_text='Like "mozilla/edwin"')

    def __str__(self):
        return str(self.name)
    
