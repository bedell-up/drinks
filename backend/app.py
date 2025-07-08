from flask import Flask, request, jsonify, send_from_directory, Blueprint
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from dotenv import load_dotenv
import os
import numpy as np
import cv2
from pyzbar.pyzbar import decode

from auth import create_access_token, get_current_user, authenticate_user
from models import db, User, InventoryItem

# Load environment variables
load_dotenv()

# --- Flask App Setup ---
app = Flask(__name__, static_folder="../frontend/dist", static_url_path="/")
CORS(app)

app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL", "sqlite:///test.db")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config['SECRET_KEY'] = os.environ["SECRET_KEY"]

# Initialize DB
db.init_app(app)
with app.app_context():
    db.create_all()

# --- Barcode Blueprint ---
barcode_bp = Blueprint("barcode", __name__)

@barcode_bp.route("/scan-barcode", methods=["POST"])
def scan_barcode():
    if "file" not in request.files:
        return jsonify({"error": "Missing image file"}), 400

    file = request.files["file"]
    npimg = np.frombuffer(file.read(), np.uint8)
    img = cv2.imdecode(npimg, cv2.IMREAD_COLOR)
    results = decode(img)
    barcodes = [r.data.decode("utf-8") for r in results]

    return jsonify({"barcodes": barcodes})

app.register_blueprint(barcode_bp)

# --- Auth Routes ---
@app.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid JSON or Content-Type"}), 400

    required_fields = ["username", "email", "password"]
    missing = [f for f in required_fields if not data.get(f)]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    if User.query.filter((User.username == data["username"]) | (User.email == data["email"])).first():
        return jsonify({"error": "Username or email already registered"}), 400

    user = User(username=data["username"], email=data["email"])
    user.set_password(data["password"])
    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "User registered"}), 201


@app.route("/token", methods=["POST"])
def token():
    try:
        username = request.form.get("username")
        password = request.form.get("password")

        if not username or not password:
            return jsonify({"error": "Missing username or password"}), 400

        user = authenticate_user(db.session, username, password)
        if not user:
            return jsonify({"error": "Invalid credentials"}), 401

        token = create_access_token(user.id)
        return jsonify({"access_token": token, "token_type": "bearer"})

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": "Server error", "details": str(e)}), 500


@app.route("/users/me", methods=["GET"])
def get_me():
    try:
        user = get_current_user(request, db.session)
        return jsonify({
            "id": user.id,
            "username": user.username
        })
    except Exception as e:
        return jsonify({"error": "Unauthorized", "details": str(e)}), 401



# --- Inventory Routes ---
@app.route("/inventory/", methods=["GET"])
def get_inventory():
    user = get_current_user(request, db.session)
    items = InventoryItem.query.filter_by(user_id=user.id).all()
    return jsonify({
        "inventory": [{"id": item.id, "name": item.name} for item in items]
    })


@app.route("/inventory/", methods=["POST"])
def add_inventory():
    user = get_current_user(request, db.session)
    name = request.json.get("name", "").strip()
    if not name:
        return jsonify({"error": "Item name required"}), 400

    item = InventoryItem(name=name, user_id=user.id)
    db.session.add(item)
    db.session.commit()
    return jsonify({"message": "Item added", "id": item.id})


@app.route("/inventory/<int:item_id>", methods=["DELETE"])
def delete_inventory(item_id):
    user = get_current_user(request, db.session)
    item = InventoryItem.query.filter_by(id=item_id, user_id=user.id).first()
    if not item:
        return jsonify({"error": "Item not found"}), 404

    db.session.delete(item)
    db.session.commit()
    return jsonify({"message": "Item deleted"})


# --- Healthcheck ---
@app.route("/ping")
def ping():
    return jsonify({"status": "alive"})


@app.route("/health")
def health():
    return jsonify({"status": "ok"})


# --- Optional Debug Hooks ---
@app.before_request
def log_request_info():
    print(f"📥 {request.method} {request.path}")


@app.errorhandler(405)
def method_not_allowed(e):
    return jsonify({"error": "Method not allowed"}), 405


# --- SPA Fallback Route (for React/Vite BrowserRouter) ---
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_react_app(path):
    static_dir = app.static_folder
    full_path = os.path.join(static_dir, path)
    if path and os.path.exists(full_path):
        return send_from_directory(static_dir, path)
    return send_from_directory(static_dir, "index.html")


@app.route("/favicon.ico")
def favicon():
    return send_from_directory(app.static_folder, "favicon.ico")
