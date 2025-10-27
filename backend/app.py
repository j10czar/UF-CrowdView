from flask import Flask, request, jsonify, session, abort
from mongoengine import connect
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_login import LoginManager, login_user, logout_user, login_required, current_user 
from models import User, Report, Location 
import os
from datetime import datetime
from dotenv import load_dotenv

app = Flask(__name__)

# Load environment variables from .env file
load_dotenv()

app.config['SECRET_KEY'] = os.environ.get("FLASK_SECRET_KEY", "a_strong_fallback_secret") 

bcrypt = Bcrypt(app)
CORS(app, supports_credentials=True, origins=["http://localhost:3000", "http://127.0.0.1:3000"]) 

login_manager = LoginManager()
login_manager.login_view = 'login'
login_manager.init_app(app)


# Connect to MongoDB using the URI from environment variables
connect(host=os.environ.get("MONGODB_URI"))
@login_manager.user_loader
def load_user(user_id):
    try:
        return User.objects(id=user_id).first()
    except Exception:
        return None

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "GET":
        return jsonify({"message": "Please log in via POST with credentials."}), 200
    if not request.json or "email" not in request.json or "password" not in request.json:
        return jsonify({"error": "Invalid request format"}), 400
    email = request.json["email"]
    password = request.json["password"]
    user = User.objects(email=email).first()
    if user is None or not bcrypt.check_password_hash(user.password_hash, password):
        return jsonify({"error": "Unauthorized"}), 401
    login_user(user)
    return jsonify({
        "id": str(user.id),
        "email": user.email,
    })

@app.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()
    if not data or not data.get("email") or not data.get("password"):
        return jsonify({"error": "Missing email or password"}), 400
    email = data.get("email")
    password = data.get("password")
    if User.objects(email=email).first():
        return jsonify({"error": "Email already exists"}), 409
    if not email.endswith("@ufl.edu"):
        return jsonify({"error": "Only ufl.edu emails are allowed for signup"}), 400
    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")
    new_user = User(
        email=email,
        username=email.split("@")[0],
        password_hash=hashed_password,
    )
    new_user.save()
    login_user(new_user)
    return jsonify({
        "id": str(new_user.id),
        "email": new_user.email,
    }), 201


@app.route('/logout')
@login_required
def logout():
    logout_user()
    session.clear()
    return jsonify({"message": "Successfully logged out"}), 200


@app.route('/reports', methods=["POST", "GET"])
@login_required
def reports():
    if request.method == "POST":
        location_name = request.json.get("location_name")
        busyness_level = request.json.get("busyness_level")
        
        if not location_name or busyness_level is None: 
            return jsonify({"error": "Missing location_name or busyness_level"}), 400
        
        new_report = Report(
            location_name=location_name,
            busyness_level=busyness_level,
            author=current_user.username,
            date_posted=datetime.utcnow()
        )
        new_report.save()
        return jsonify({
            "message": "Report submitted successfully",
            "report": {
                "id": str(new_report.id),
                "location_name": new_report.location_name,
                "busyness_level": new_report.busyness_level,
                "author": new_report.author,
                "date_posted": new_report.date_posted.isoformat()
            }
        }), 201

    elif request.method == "GET":
        reports_list = []
        all_reports = Report.objects.order_by('-date_posted')  
        for report in all_reports:
            reports_list.append({
                "id": str(report.id),
                "location_name": report.location_name,
                "busyness_level": report.busyness_level,
                "author": report.author,
                "date_posted": report.date_posted.isoformat() if report.date_posted else None
            })
        
        return jsonify({"reports": reports_list}), 200

@app.route('/locations', methods=["GET"])
@login_required
def get_locations():
    location_list = []
    all_locations = Location.objects.order_by('name')  

    for location in all_locations:
        location_list.append({
            "id": str(location.id),
            "name": location.name,
            "current_busyness": location.current_busyness
        })

    return jsonify({"locations": location_list}), 200

@app.route('/admin/locations', methods=['POST'])
@login_required
def add_location():
    data = request.get_json()
    name = data.get("name")
    current_busyness = data.get("current_busyness", 0)

    if not name:
        return jsonify({"error": "Missing location name"}), 400
    
    location = Location(name=name, current_busyness=current_busyness)
    location.save()
    return jsonify({"message":"Location added", "id":str(location.id)}), 201

# UPDATE a location’s busyness or name
@app.route('/admin/locations/<location_id>', methods=['PUT'])
@login_required
def update_location(location_id):
    data = request.get_json()
    location = Location.objects(id=location_id).first()
    if not location:
        return jsonify({"error": "Location not found"}), 404
    
    if "name" in data:
        location.name = data["name"]
    if "current_busyness" in data:
        location.current_busyness = data["current_busyness"]
    
    location.save()
    return jsonify({"message": "Location updated"}), 200


# DELETE a location
@app.route('/admin/locations/<location_id>', methods=['DELETE'])
@login_required
def delete_location(location_id):
    
    location = Location.objects(id=location_id).first()
    if not location:
        return jsonify({"error": "Location not found"}), 404
    
    location.delete()
    return jsonify({"message": "Location deleted"}), 200


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0')