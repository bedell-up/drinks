# BoozeBuddy Backend

Flask-based API for BoozeBuddy app (alcohol discovery app).  
Runs on Gunicorn + Nginx, and connects to MariaDB via SQLAlchemy.

---

## ⚙️ Project Structure

backend/
├── app.py # Flask app entry point
├── models/ # SQLAlchemy models
├── routes/ # Flask routes
├── static/ # Frontend assets (optional)
├── templates/ # Jinja2 templates (if any)
├── venv/ # Local virtual environment (excluded)
├── requirements.txt # Python dependencies
└── README.md

yaml
Copy
Edit

---

## 🚀 Setup Instructions

```bash
git clone git@github.com:your-username/boozebuddy-backend.git
cd boozebuddy-backend

python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Set env vars or edit .env
export FLASK_APP=app.py
export FLASK_ENV=production
🛠 Run Server (Locally)
bash
Copy
Edit
flask run
For production (via Gunicorn):

bash
Copy
Edit
gunicorn -w 4 -b 127.0.0.1:5001 app:app
🧪 Run Tests
bash
Copy
Edit
pytest
📦 Deployment Notes
Backend served on port 5001

Reverse-proxied via Nginx at /etc/nginx/sites-available/boozebuddy

Connects to MariaDB using pymysql

Config is pulled from app.config['SQLALCHEMY_DATABASE_URI']

📜 License
MIT
