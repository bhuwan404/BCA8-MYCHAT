from django.urls import path
from . import views

urlpatterns = [
    path('', views.lobby),
    path('room/', views.room),
    path('get_token/', views.getToken),

    #7. defining path (next:streams)
    path('create_member/', views.createMember),
    
    #11. defining path (next:streams)
    path('get_member/', views.getMember),
    
    path('delete_member/', views.deleteMember)
]