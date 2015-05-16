# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('teams', '0003_auto_20150515_2006'),
    ]

    operations = [
        migrations.AlterField(
            model_name='team',
            name='current_burn_rate',
            field=models.IntegerField(help_text='Burn rate is in points per week'),
        ),
        migrations.AlterField(
            model_name='team',
            name='github_repo',
            field=models.CharField(blank=True, max_length=64, help_text='Like "mozilla/edwin"'),
        ),
    ]
