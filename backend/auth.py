# auth.py
import jwt
from datetime import datetime, timedelta
from models import User
from werkzeug.security import check_password_hash
import os

SECRET_KEY = os.environ.get("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

def create_access_token(user_id):
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": str(user_id),  # 👈 convert to string!
        "exp": expire
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    
def get_current_user(request, db):
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise Exception("Missing or malformed token")

    token = auth.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        user = db.get(User, user_id)
        if not user:
            raise Exception("User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise Exception("Token expired")
    except jwt.InvalidTokenError as e:
        raise Exception(f"Invalid token: {str(e)}")

def authenticate_user(db, username, password):
    user = db.query(User).filter_by(username=username).first()
    if user and user.check_password(password):
        return user
    return None
