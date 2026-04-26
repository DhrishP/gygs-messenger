from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register_user, name='register_user'),
    path('conversations/', views.conversations_list, name='conversations_list'),
    path('groups/', views.create_group, name='create_group'),
    path('messages/<str:conversation_id>/', views.messages_list, name='messages_list'),
    path('messages/<str:message_id>/delete/', views.delete_message, name='delete_message'),
    path('messages/<str:message_id>/seen/', views.mark_seen, name='mark_seen'),
]
