# Generated by Django 5.1 on 2024-12-08 07:41

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("api", "0026_alter_notification_notification_type"),
    ]

    operations = [
        migrations.AddField(
            model_name="message",
            name="visible_for_user1",
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name="message",
            name="visible_for_user2",
            field=models.BooleanField(default=True),
        ),
    ]
