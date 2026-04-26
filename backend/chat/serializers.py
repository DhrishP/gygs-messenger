from rest_framework_mongoengine import serializers
from .models import User, Conversation, Message

class UserSerializer(serializers.DocumentSerializer):
    class Meta:
        model = User
        fields = '__all__'

class ConversationSerializer(serializers.DocumentSerializer):
    class Meta:
        model = Conversation
        fields = '__all__'

class MessageSerializer(serializers.DocumentSerializer):
    class Meta:
        model = Message
        fields = '__all__'
