from mongoengine import Document, StringField, DateTimeField, IntField, BooleanField, ListField


class User(Document):
    username = StringField(required=True, unique=True, max_length=200)
    password_hash = StringField(required=True)
    email = StringField(required=True, unique=True)
    is_admin = BooleanField(default=False)


class Report(Document):
    author = StringField(required=True, max_length=200)
    location_name = StringField(max_length=200)
    date_posted = DateTimeField()
    busyness_level = IntField(min_value=1, max_value=10)


class Location(Document):
    name = StringField(required=True, unique=True, max_length=200)
    current_busyness = IntField()
    busyness_hourly = ListField(IntField(), default=lambda: [-1] * 24)