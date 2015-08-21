# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('teams', '0004_auto_20150516_0009'),
    ]

    operations = [
        migrations.AlterField(
            model_name='team',
            name='github_repo',
            field=models.CharField(
                blank=True,
                help_text='Comma-separated list of repos, like "mozilla/edwin,mozilla/edwin2"',
                max_length=1024),
        ),
    ]
