from mongoengine import Document, StringField, ReferenceField, ListField, DateTimeField, CASCADE, BooleanField
import datetime

class User(Document):
    user_id = StringField(primary_key=True, max_length=100)
    # Could add extra fields like name, but we use dummy UUIDs for now

class Conversation(Document):
    participants = ListField(ReferenceField(User, reverse_delete_rule=CASCADE))
    is_group = BooleanField(default=False)
    name = StringField(null=True, blank=True)
    created_at = DateTimeField(default=datetime.datetime.utcnow)

class Message(Document):
    conversation = ReferenceField(Conversation, reverse_delete_rule=CASCADE, required=True)
    sender = ReferenceField(User, reverse_delete_rule=CASCADE, required=True)
    content = StringField(required=True)
    timestamp = DateTimeField(default=datetime.datetime.utcnow)
    seen_by = ListField(ReferenceField(User, reverse_delete_rule=CASCADE), default=list)
    deleted_for = ListField(ReferenceField(User, reverse_delete_rule=CASCADE), default=list)
    
    meta = {
        'indexes': [
            'conversation',
            'timestamp'
        ]
    }
