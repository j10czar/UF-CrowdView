from flask_login import UserMixin
from mongoengine import Document, StringField, IntField, ListField

class User(Document, UserMixin): 
    username = StringField(required=True, unique=True, max_length=200)
    password = StringField(required=True)
    email = StringField(required=True, unique=True)

    def get_id(self):
        """Returns the user ID as a string for Flask-Login."""
        return str(self.id)


class Location(Document):
    name = StringField(required=True, unique=True, max_length=200)
    busyness_ratings = ListField(IntField(min_value=-1, max_value=10), default=lambda: [-1] * 24, required=True)
