from flask import Flask, jsonify, request, abort
from mongoengine import connect
from dotenv import load_dotenv
import boto3
import os

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# Connect to MongoDB using the URI from environment variables
#connect(host=os.environ.get("MONGODB_URI"))
#from models import User, Report, Location

@app.route('/')
def home():
    return jsonify({"message": "Welcome to UF-CrowdView API!"})

if __name__ == "__main__":
    app.run()
