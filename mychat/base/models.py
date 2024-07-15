from django.db import models


# Create your models here.

# 4. Create database model to store user info (next:admin.py)
class RoomMember(models.Model):
    name = models.CharField(max_length=200)
    uid = models.CharField(max_length=200)
    room_name = models.CharField(max_length=200)

    def __str__(self):
        return self.name


"""
    1 - Create Database Model (RoomMember) | Store username, uid and roomname
    (note: su: bhuwan p: bhuwan)
    
    2 - On Join, create Room Member in database

    3 - On handleUserJoin event, query db for room member name by uid and roommame

    4 - On leave, delete RoomMember
"""
