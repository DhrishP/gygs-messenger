import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from .models import Message, Conversation, User

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.conversation_id = self.scope['url_route']['kwargs']['conversation_id']
        self.room_group_name = f'chat_{self.conversation_id}'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        action = text_data_json.get('action')
        
        if action == 'send_message':
            message_content = text_data_json['message']
            sender_id = text_data_json['sender_id']
            
            # Save message to DB
            msg = await self.save_message(sender_id, self.conversation_id, message_content)
            
            # Send message to room group
            if msg:
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'chat_message',
                        'message_id': str(msg.id),
                        'message': message_content,
                        'sender_id': sender_id,
                        'timestamp': msg.timestamp.isoformat()
                    }
                )

    # Receive message from room group
    async def chat_message(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'new_message',
            'message_id': event['message_id'],
            'message': event['message'],
            'sender_id': event['sender_id'],
            'timestamp': event['timestamp']
        }))

    @sync_to_async
    def save_message(self, sender_id, conversation_id, content):
        sender = User.objects(user_id=sender_id).first()
        conversation = Conversation.objects(id=conversation_id).first()
        if sender and conversation:
            msg = Message(sender=sender, conversation=conversation, content=content)
            msg.save()
            return msg
        return None
