"""Run once to create the default admin user."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from app.database import SessionLocal, Base, engine
from app.controllers.auth_controller import register_user

Base.metadata.create_all(bind=engine)
db = SessionLocal()

try:
    user = register_user(db, username="admin", email="admin@ksp.gov.in", password="Admin@1234", role="admin")
    print(f"Admin created: {user.username} / Admin@1234")
except Exception as e:
    print(f"Note: {e}")
finally:
    db.close()
