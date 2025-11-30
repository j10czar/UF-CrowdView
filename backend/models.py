from mongoengine import Document, StringField, ListField, IntField, ReferenceField, DateTimeField, BooleanField
from flask_login import UserMixin
from datetime import datetime

class User(UserMixin, Document):
    email = StringField(required=True, unique=True)
    username = StringField(required=True, min_length=3)
    password = StringField(required=True)
    isAdmin = BooleanField(default=False)
    banned = BooleanField(default=False)


    meta = {'collection': 'users'}

class Location(Document):
    name = StringField(required=True, unique=True)
    # Stores 24 integers (0-23 hours) representing average busyness (1-10)
    busyness = ListField(IntField(), default=lambda: [0] * 24)
    
    meta = {'collection': 'locations'}

class Report(Document):
    author = ReferenceField(User, required=True)
    location = ReferenceField(Location, required=True)
    busyness = IntField(required=True, min_value=1, max_value=10)
    date_posted = DateTimeField(default=datetime.utcnow)
    
    # Optional note field for the future
    note = StringField(max_length=500)

    meta = {'collection': 'reports'}