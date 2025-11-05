from flask_login import UserMixin 
from mongoengine import Document, StringField, DateTimeField, IntField, ListField

class User(Document, UserMixin): 
    username = StringField(required=True, unique=True, max_length=200)
    password = StringField(required=True)
    email = StringField(required=True, unique=True)


    def get_id(self):
        """Returns the user ID as a string for Flask-Login."""
        return str(self.id)

class Report(Document):
    author = StringField(required=True, max_length=200)
    location_name = StringField(max_length=200)
    date_posted = DateTimeField()
    busyness_level = IntField(min_value=1, max_value=10)


class Location(Document):
    name = StringField(required=True, unique=True, max_length=200)
    current_busyness = IntField()
    busyness_hourly = ListField(IntField(), default=lambda: [-1] * 24)