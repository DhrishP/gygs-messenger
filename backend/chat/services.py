import logging
from .models import User, Conversation
from .serializers import ConversationSerializer

logger = logging.getLogger(__name__)

def create_group_service(user_id: str, name: str, participant_ids: list) -> Conversation:
    """Create a group conversation.

    Ensures the creator is included, creates missing users, and returns the saved Conversation.
    """
    if user_id not in participant_ids:
        participant_ids.append(user_id)

    participants = []
    for pid in participant_ids:
        user = User.objects(user_id=pid).first()
        if not user:
            user = User(user_id=pid)
            user.save()
        participants.append(user)

    conv = Conversation(participants=participants, is_group=True, name=name)
    conv.save()
    logger.info(f"Group created (id={conv.id}) by user {user_id}")
    return conv
