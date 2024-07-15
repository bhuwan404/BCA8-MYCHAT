from django.contrib import admin

# Register your models here.
from .models import RoomMember

# 5. Register database called RoomMember model in admin panel (next:views)
admin.site.register(RoomMember)
