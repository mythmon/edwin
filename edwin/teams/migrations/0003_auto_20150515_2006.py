# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('teams', '0002_team_github_repo'),
    ]

    operations = [
        migrations.AlterField(
            model_name='team',
            name='slug',
            field=models.SlugField(unique=True, max_length=64),
        ),
    ]
