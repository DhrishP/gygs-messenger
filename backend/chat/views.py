from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import User, Conversation, Message
from .serializers import UserSerializer, ConversationSerializer, MessageSerializer

@api_view(['POST'])
def register_user(request):
    user_id = request.data.get('user_id')
    if not user_id:
        return Response({'error': 'user_id is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    user = User.objects(user_id=user_id).first()
    if not user:
        user = User(user_id=user_id)
        user.save()
    
    return Response(UserSerializer(user).data)

@api_view(['GET', 'POST'])
def conversations_list(request):
    user_id = request.query_params.get('user_id') or request.data.get('user_id')
    if not user_id:
        return Response({'error': 'user_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
    user = User.objects(user_id=user_id).first()
    if not user:
        return Response({'error': 'user not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        conversations = Conversation.objects(participants=user)
        return Response(ConversationSerializer(conversations, many=True).data)
        
    elif request.method == 'POST':
        other_user_id = request.data.get('other_user_id')
        other_user = User.objects(user_id=other_user_id).first()
        if not other_user:
            other_user = User(user_id=other_user_id)
            other_user.save()
            
        # Check if conversation already exists
        conv = Conversation.objects(participants__all=[user, other_user], participants__size=2).first()
        if not conv:
            conv = Conversation(participants=[user, other_user])
            conv.save()
            
        return Response(ConversationSerializer(conv).data)

@api_view(['GET'])
def messages_list(request, conversation_id):
    messages = Message.objects(conversation=conversation_id).order_by('timestamp')
    return Response(MessageSerializer(messages, many=True).data)

@api_view(['POST'])
def delete_message(request, message_id):
    user_id = request.data.get('user_id')
    delete_for_everyone = request.data.get('delete_for_everyone', False)
    
    msg = Message.objects(id=message_id).first()
    if not msg:
        return Response({'error': 'message not found'}, status=status.HTTP_404_NOT_FOUND)
        
    user = User.objects(user_id=user_id).first()
    
    if delete_for_everyone:
        if msg.sender != user:
            return Response({'error': 'only sender can delete for everyone'}, status=status.HTTP_403_FORBIDDEN)
        msg.delete()
        return Response({'status': 'deleted for everyone'})
    else:
        if user not in msg.deleted_for:
            msg.deleted_for.append(user)
            msg.save()
        return Response({'status': 'deleted for user'})

@api_view(['POST'])
def mark_seen(request, message_id):
    user_id = request.data.get('user_id')
    msg = Message.objects(id=message_id).first()
    if not msg:
        return Response({'error': 'message not found'}, status=status.HTTP_404_NOT_FOUND)
        
    user = User.objects(user_id=user_id).first()
    if user and user not in msg.seen_by:
        msg.seen_by.append(user)
        msg.save()
        
    return Response({'status': 'marked as seen'})
