from flask import Flask, request, jsonify, session
from mongoengine import connect
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from models import User, Location, Report
import os
from datetime import datetime, timedelta
from bson.objectid import ObjectId
from dotenv import load_dotenv
import dateutil.parser 

app = Flask(__name__)

# Load environment variables from .env file
load_dotenv()

app.config['SECRET_KEY'] = os.environ.get("FLASK_SECRET_KEY", "a_strong_fallback_secret") 
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax' 
app.config['SESSION_COOKIE_SECURE'] = False 

bcrypt = Bcrypt(app)

CORS(app, supports_credentials=True, origins=["http://localhost:3000", "http://127.0.0.1:3000"]) 

login_manager = LoginManager()
login_manager.login_view = 'login'
login_manager.init_app(app)

# Connect to MongoDB
connect(host=os.environ.get("MONGODB_URI"))

@login_manager.user_loader
def load_user(user_id):
    try:
        return User.objects(id=user_id).first()
    except (ValueError, TypeError): 
        return None

# --- AUTH ROUTES ---

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "GET":
        return jsonify({"message": "Please log in via POST with credentials."}), 200
    if not request.json or "email" not in request.json or "password" not in request.json:
        return jsonify({"error": "Invalid request format"}), 400
    email = request.json["email"]
    password = request.json["password"]
    user = User.objects(email=email).first()
    
    if user is None or not bcrypt.check_password_hash(user.password, password): 
        return jsonify({"error": "Unauthorized"}), 401
        
    # Check if banned
    if hasattr(user, 'banned') and user.banned:
        return jsonify({"error": "Account is banned"}), 403

    login_user(user)
    
    return jsonify({
        "id": str(user.id),
        "email": user.email,
        "username": user.username,
        "isAdmin": getattr(user, "isAdmin", False)
    })

@app.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()
    if not data or not data.get("email") or not data.get("password"):
        return jsonify({"error": "Missing email or password"}), 400
    email = data.get("email")
    password = data.get("password")
    
    username_prefix = email.split("@")[0]
    if len(username_prefix) < 3:
        return jsonify({"error": "Username must be at least 3 characters long."}), 400
        
    if User.objects(email=email).first():
        return jsonify({"error": "Email already exists"}), 409
    if not email.endswith("@ufl.edu"):
        return jsonify({"error": "Only ufl.edu emails are allowed for signup"}), 400
    
    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")
    
    new_user = User(
        email=email,
        username=username_prefix,
        password=hashed_password,
        isAdmin=False,
        banned=False 
    )
    new_user.save()
    login_user(new_user)
    return jsonify({
        "id": str(new_user.id),
        "email": new_user.email,
        "isAdmin": False
    }), 201

@app.route('/logout')
@login_required
def logout():
    logout_user()
    session.clear()
    return jsonify({"message": "Successfully logged out"}), 200

# --- SECURITY CHECK ROUTE ---
@app.route('/check-session', methods=['GET'])
@login_required
def check_session():
    return jsonify({"valid": True, "user_id": str(current_user.id)}), 200

# --- LOCATION ROUTES ---

@app.route('/locations', methods=['GET'])
def get_locations():
    locations = Location.objects.order_by('name')
    return jsonify({
        "locations": [
            {
                "id": str(loc.id),
                "name": loc.name,
                "busyness": loc.busyness
            } for loc in locations
        ]
    }), 200

@app.route('/locations/<location_identifier>', methods=['GET'])
def get_single_location(location_identifier):
    location = None
    if ObjectId.is_valid(location_identifier):
        location = Location.objects(id=location_identifier).first()
    
    if not location:
        query_name = location_identifier.replace("-", " ")
        location = Location.objects(name__icontains=query_name).first()

    if not location:
        return jsonify({"error": "Location not found"}), 404

    live_busyness = list(location.busyness) 

    # Calculate "Live" Score from recent reports (Last 60 mins)
    one_hour_ago = datetime.utcnow() - timedelta(hours=1)
    
    recent_reports = Report.objects(
        location=location, 
        date_posted__gte=one_hour_ago
    )

    current_hour_local = datetime.now().hour 

    if recent_reports:
        total = sum(r.busyness for r in recent_reports)
        count = len(recent_reports)
        avg_score = round(total / count)
        
        live_busyness[current_hour_local % 24] = avg_score

    return jsonify({
        "id": str(location.id),
        "name": location.name,
        "busyness": live_busyness,
        "live_report_count": len(recent_reports)
    })

# --- ADMIN ROUTES ---

def ensure_admin():
    if not current_user.is_authenticated or not getattr(current_user, "isAdmin", False):
        return False
    return True

@app.route('/admin/users', methods=['GET'])
@login_required
def get_all_users():
    if not ensure_admin(): return jsonify({"error": "Admin required"}), 403
    
    users = User.objects.all()
    return jsonify([
        {
            "id": str(u.id),
            "username": u.username,
            "email": u.email,
            "isAdmin": getattr(u, "isAdmin", False),
            "banned": getattr(u, "banned", False)
        } for u in users
    ])

@app.route('/admin/users/<user_id>/ban', methods=['POST'])
@login_required
def toggle_ban_user(user_id):
    if not ensure_admin(): return jsonify({"error": "Admin required"}), 403
    
    user = User.objects(id=user_id).first()
    if not user: return jsonify({"error": "User not found"}), 404
    
    current_status = getattr(user, "banned", False)
    user.banned = not current_status
    user.save()
    
    return jsonify({"message": "User ban status updated", "banned": user.banned})

@app.route('/admin/locations-data', methods=['GET'])
@login_required
def get_admin_locations_data():
    if not ensure_admin(): return jsonify({"error": "Admin required"}), 403
    
    locations = Location.objects.all()
    data = []
    
    last_24h = datetime.utcnow() - timedelta(hours=24)
    
    for loc in locations:
        reports = Report.objects(location=loc, date_posted__gte=last_24h).order_by('-date_posted')
        
        report_list = [{
            "id": str(r.id),
            "authorName": r.author.username,
            "busyness": r.busyness,
            "hour": r.date_posted.hour, 
            "datePosted": r.date_posted.isoformat(),
            "note": getattr(r, "note", "No note") 
        } for r in reports]
        
        data.append({
            "id": str(loc.id),
            "name": loc.name,
            "busyness": loc.busyness,
            "reports": report_list
        })
        
    return jsonify(data)

@app.route('/admin/reports/<report_id>', methods=['DELETE'])
@login_required
def delete_report(report_id):
    if not ensure_admin(): return jsonify({"error": "Admin required"}), 403
    
    report = Report.objects(id=report_id).first()
    if not report: return jsonify({"error": "Report not found"}), 404
    
    report.delete()
    return jsonify({"message": "Report deleted"})

# --- REPORT ROUTES ---

@app.route('/reports', methods=['POST'])
@login_required
def submit_report():
    data = request.get_json()
    location_id = data.get("location_id")
    busyness_score = data.get("busyness")
    
    timestamp_str = data.get("timestamp") 
    hour_index = data.get("hour")         

    if not location_id or not busyness_score:
        return jsonify({"error": "Missing location_id or busyness"}), 400

    try:
        score = int(busyness_score)
        if score < 1 or score > 10:
            raise ValueError
    except ValueError:
        return jsonify({"error": "Busyness must be 1-10"}), 400

    location = None 
    if ObjectId.is_valid(location_id):
        location = Location.objects(id=location_id).first()

    if not location:
        query_name = location_id.replace("-", " ")
        location = Location.objects(name__icontains=query_name).first()

    if not location:
        return jsonify({"error": "Location not found"}), 404
    
    if hasattr(current_user, 'banned') and current_user.banned:
        return jsonify({"error": "You are banned from submitting reports"}), 403

    # Handle Specific Time
    report_date = datetime.utcnow()
    if timestamp_str:
        try:
            report_date = datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
        except Exception as e:
            print(f"Timestamp parse error, using now: {e}")
            pass

    new_report = Report(
        author=current_user._get_current_object(),
        location=location,
        busyness=score,
        date_posted=report_date
    )
    new_report.save()

    # Update Specific Hour on Graph
    if hour_index is not None and isinstance(hour_index, int) and 0 <= hour_index <= 23:
        try:
            current_val = location.busyness[hour_index]
            new_val = int(round((current_val + score) / 2))
            new_val = max(1, min(10, new_val))
            location.busyness[hour_index] = new_val
            location.save()
        except Exception as e:
            print(f"Error updating location busyness array: {e}")

    return jsonify({"message": "Report submitted!"}), 201


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0')