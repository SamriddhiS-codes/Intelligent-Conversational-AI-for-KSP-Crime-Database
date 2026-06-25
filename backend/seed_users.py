"""
Run once to create default users:
  cd backend
  python seed_users.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from app.database import SessionLocal
from app.controllers.auth_controller import register
from sqlalchemy.exc import IntegrityError

db = SessionLocal()
users = [
    ("admin",       "admin@ksp.gov.in",      "Admin@1234",  "admin"),
    ("investigator","inv@ksp.gov.in",         "Inv@1234",    "investigator"),
    ("analyst",     "analyst@ksp.gov.in",     "Ana@1234",    "analyst"),
]
for username, email, password, role in users:
    try:
        register(db, username, email, password, role)
        print(f"✅ Created: {username} ({role})")
    except Exception as e:
        print(f"⚠️  {username}: {e}")
db.close()
print("Done.")
