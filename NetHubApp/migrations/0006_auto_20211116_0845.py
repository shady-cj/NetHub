# Generated by Django 3.2.6 on 2021-11-16 07:45

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('NetHubApp', '0005_auto_20211030_1413'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='user',
            name='bookmark',
        ),
        migrations.AlterField(
            model_name='user',
            name='profile_picture',
            field=models.ImageField(default='user_images/default.png', upload_to='user_images/upload'),
        ),
        migrations.CreateModel(
            name='Bookmark',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('post', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='bookmark_post', to='NetHubApp.post')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='user_bookmark', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
