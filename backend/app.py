from flask import Flask, request, jsonify, session, abort
from mongoengine import connect
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_login import LoginManager, login_user, logout_user, login_required, UserMixin, current_user
from models import User, Report, Location
import os
from datetime import datetime
from dotenv import load_dotenv

app = Flask(__name__)

# Load environment variables from .env file
load_dotenv()

bcrypt = Bcrypt(app)
CORS(app, supports_credentials=True)
login_manager = LoginManager()
login_manager.login_view = 'login'
login_manager.init_app(app)


# Connect to MongoDB using the URI from environment variables
connect(host=os.environ.get("MONGODB_URI"))
from models import User, Report, Location

@login_manager.user_loader
def load_user(user_id):
    return User.objects(id=user_id).first()


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "GET":
        return jsonify({"message": "Please log in via POST with credentials."}), 200

    email = request.json["email"]
    password = request.json["password"]

    user = User.objects(email=email).first()
    if user is None or not bcrypt.check_password_hash(user.password_hash, password):
        return jsonify({"error": "Unauthorized"}), 401

    login_user(user)
    session["user_id"] = user.id

    return jsonify({
        "id": str(user.id),
        "email": user.email
    })

# returns 201 Created in success
# returns 400 error if wrong
@app.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request must be JSON"}), 400
    email = data.get("email")
    password = data.get("password")
    
    if User.objects(email=email).first():
        return jsonify({"error": "Email already exists"}), 409

    # The reason we make the username derived from password is that it must be a ufl.edu password
    # Raises error if not ufl.edu, but this could also be redundant cuz this could be in frontend, but idk anything tbh
    if not email.endswith("@ufl.edu"):
        return jsonify({"error": "Only ufl.edu emails are allowed for signup"}), 400
    
    # Saves user and puts it in the database :)
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(email=email, username=email.split("@")[0], password_hash=hashed_password)
    new_user.save()

    login_user(new_user)  
    
    return jsonify({
        "id": str(new_user.id),
        "email": new_user.email
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
        
        if not location_name or not busyness_level:
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

if __name__ == "__main__":
    app.run(debug=True)
