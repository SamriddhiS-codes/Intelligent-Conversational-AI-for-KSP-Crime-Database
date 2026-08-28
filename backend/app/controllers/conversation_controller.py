from sqlalchemy.orm import Session
from sqlalchemy import desc
from ..models.conversation import Conversation, Message

def list_conversations(db: Session, user_id: int) -> list[dict]:
    convos = (
        db.query(Conversation)
        .filter(Conversation.user_id == user_id)
        .order_by(desc(Conversation.updated_at))
        .all()
    )
    return [
        {"id": c.id, "title": c.title, "created_at": c.created_at, "updated_at": c.updated_at}
        for c in convos
    ]

def get_conversation(db: Session, user_id: int, conversation_id: int) -> dict | None:
    convo = (
        db.query(Conversation)
        .filter(Conversation.id == conversation_id, Conversation.user_id == user_id)
        .first()
    )
    if not convo:
        return None
    return {
        "id": convo.id,
        "title": convo.title,
        "created_at": convo.created_at,
        "updated_at": convo.updated_at,
        "messages": [
            {
                "id": m.id, "role": m.role, "content": m.content,
                "response_data": m.response_data, "created_at": m.created_at,
            }
            for m in convo.messages
        ],
    }

def create_conversation(db: Session, user_id: int, title: str = "New Chat") -> Conversation:
    convo = Conversation(user_id=user_id, title=title)
    db.add(convo)
    db.commit()
    db.refresh(convo)
    return convo

def delete_conversation(db: Session, user_id: int, conversation_id: int) -> bool:
    convo = (
        db.query(Conversation)
        .filter(Conversation.id == conversation_id, Conversation.user_id == user_id)
        .first()
    )
    if not convo:
        return False
    db.delete(convo)
    db.commit()
    return True

def add_message(db: Session, conversation_id: int, role: str, content: str, response_data: dict = None):
    msg = Message(conversation_id=conversation_id, role=role, content=content, response_data=response_data)
    db.add(msg)
    convo = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if convo:
        from sqlalchemy import func as sa_func
        convo.updated_at = sa_func.now()
    db.commit()
    return msg

def make_title_from_question(question: str, max_len: int = 60) -> str:
    q = question.strip()
    if len(q) <= max_len:
        return q
    return q[:max_len].rsplit(" ", 1)[0] + "..."