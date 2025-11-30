from app import app
from models import Location


locations_data = [
    {
        "name": "Library West", 
        "busyness": [3, 2, 1, 1, 1, 1, 2, 3, 5, 7, 8, 9, 9, 9, 9, 8, 8, 7, 7, 6, 5, 4, 4, 3]
    },
    {
        "name": "Marston Library", 
        "busyness": [2, 1, 1, 1, 1, 1, 2, 4, 6, 8, 9, 10, 10, 10, 9, 8, 8, 7, 6, 5, 4, 3, 2, 2]
    },
    {
        "name": "Reitz Union", 
        "busyness": [1, 1, 1, 1, 1, 1, 2, 4, 6, 8, 9, 10, 10, 9, 7, 6, 5, 4, 3, 2, 2, 1, 1, 1]
    },
    {
        "name": "Turlington Plaza", 
        "busyness": [1, 1, 1, 1, 1, 1, 2, 6, 9, 10, 10, 9, 10, 9, 8, 6, 4, 2, 1, 1, 1, 1, 1, 1]
    },
    {
        "name": "Norman Hall", 
        "busyness": [1, 1, 1, 1, 1, 1, 2, 5, 7, 8, 8, 7, 7, 6, 5, 4, 3, 2, 1, 1, 1, 1, 1, 1]
    },
    {
        "name": "Broward Dining", 
        "busyness": [1, 1, 1, 1, 1, 1, 1, 3, 5, 4, 3, 8, 10, 8, 4, 3, 5, 9, 10, 7, 4, 2, 1, 1]
    },
    {
        "name": "Gator Corner", 
        "busyness": [1, 1, 1, 1, 1, 1, 1, 3, 5, 4, 3, 7, 9, 7, 4, 3, 5, 8, 9, 6, 3, 2, 1, 1]
    },
    {
        "name": "Southwest Rec", 
        "busyness": [1, 1, 1, 1, 1, 1, 5, 6, 4, 3, 3, 4, 5, 6, 7, 8, 9, 10, 10, 9, 8, 6, 4, 2]
    }
]

with app.app_context():
    print("Deleting old locations...")
    Location.objects.delete()

    print("Seeding REALISTIC UF locations...")
    for loc in locations_data:
        new_loc = Location(name=loc["name"], busyness=loc["busyness"])
        new_loc.save()
        print(f"Created: {loc['name']}")
    
    print("Database seeded successfully!")