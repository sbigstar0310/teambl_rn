# Generated by Django 5.1.2 on 2024-11-20 12:28

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0009_alter_experiencedetail_end_date_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='experience',
            name='creator_id',
        ),
    ]
