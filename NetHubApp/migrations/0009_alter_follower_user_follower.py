# Generated by Django 3.2.6 on 2022-01-14 13:02

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('NetHubApp', '0008_alter_search_options'),
    ]

    operations = [
        migrations.AlterField(
            model_name='follower',
            name='user_follower',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='user_following', to=settings.AUTH_USER_MODEL),
        ),
    ]
