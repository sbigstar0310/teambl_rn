# Generated by Django 5.1 on 2024-12-02 12:42

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("api", "0019_alter_profile_major1_alter_profile_major2"),
    ]

    operations = [
        migrations.AlterField(
            model_name="notification",
            name="notification_type",
            field=models.CharField(
                choices=[
                    ("invitation_register", "Invitation Register"),
                    ("invitation_expired", "Invitation Expired"),
                    ("friend_accept", "Friend Accept"),
                    ("friend_reject", "Friend Reject"),
                    ("friend_request", "Friend Request"),
                    ("project_tag", "Project Tag"),
                    ("new_comment", "New Comment"),
                    ("reply_comment", "Reply Comment"),
                    ("project_profile_keyword", "Project Profile Keyword"),
                    ("experience_request", "Experience Request"),
                    ("experience_accept", "Experience Accept"),
                    ("experience_reject", "Experience Reject"),
                    ("experience_delete", "Experience Delete"),
                ],
                max_length=30,
            ),
        ),
    ]
