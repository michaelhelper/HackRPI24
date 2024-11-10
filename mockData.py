import json
import random
from datetime import datetime, timedelta

# Define the bounding box for Troy, NY
MIN_LATITUDE = 42.7240
MAX_LATITUDE = 42.7410
MIN_LONGITUDE = -73.6980
MAX_LONGITUDE = -73.6640

# Parameters
num_devices = 100
interval_minutes = 5
hours = 24

# Initial sound level bounds
INITIAL_MIN_SOUND_LEVEL = 30
INITIAL_MAX_SOUND_LEVEL = 100


# Function to generate a random latitude and longitude within the bounding box
def random_location():
    latitude = random.uniform(MIN_LATITUDE, MAX_LATITUDE)
    longitude = random.uniform(MIN_LONGITUDE, MAX_LONGITUDE)
    return {"latitude": latitude, "longitude": longitude}


# Function to generate sound level with constraints
def constrained_sound_level(previous_level, neighbor_level):
    # Start with the previous level, limited to a max change of ±10 dB
    min_level = max(previous_level - 10, INITIAL_MIN_SOUND_LEVEL)
    max_level = min(previous_level + 10, INITIAL_MAX_SOUND_LEVEL)
    new_level = random.randint(min_level, max_level)

    # Ensure the new level is within ±20 dB of the neighbor level
    if abs(new_level - neighbor_level) > 20:
        new_level = (
            neighbor_level + 20 if new_level > neighbor_level else neighbor_level - 20
        )

    return new_level


# Generate data for each device
devices_data = []
start_time = datetime.now() - timedelta(hours=hours)
locations = [random_location() for _ in range(num_devices)]  # Fixed locations
initial_sound_levels = [
    random.randint(INITIAL_MIN_SOUND_LEVEL, INITIAL_MAX_SOUND_LEVEL)
    for _ in range(num_devices)
]

for device_id in range(2, num_devices + 1):
    device_data = []
    current_time = start_time
    previous_level = initial_sound_levels[device_id - 1]
    location = locations[device_id - 1]

    # Determine initial neighbor level
    neighbor_level = (
        initial_sound_levels[device_id]
        if device_id < num_devices
        else initial_sound_levels[device_id - 2]
    )

    # Generate readings for the past 24 hours
    while current_time <= datetime.now():
        sound_level = constrained_sound_level(previous_level, neighbor_level)

        # Create data entry
        data_entry = {
            "device_id": f"device_{device_id:03}",
            "timestamp": current_time.strftime("%Y-%m-%dT%H:%M:%S"),
            "location": location,
            "sound_level": sound_level,
        }
        device_data.append(data_entry)

        # Update time and levels
        current_time += timedelta(minutes=interval_minutes)
        previous_level = sound_level

        # Update neighbor level every 5 minutes
        if device_id < num_devices:
            neighbor_level = previous_level

    devices_data.extend(device_data)

# Save data to JSON file
with open("mock_data.json", "w") as f:
    json.dump(devices_data, f, indent=2)

print("Mock data generated and saved to mock_data.json")
