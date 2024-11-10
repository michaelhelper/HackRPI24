import json
import random
from datetime import datetime, timedelta

# Define the bounding box for Troy, NY
MIN_LATITUDE = 42.7240
MAX_LATITUDE = 42.7410
MIN_LONGITUDE = -73.6980
MAX_LONGITUDE = -73.6640

# Parameters
num_devices = 50
interval_minutes = 5
hours = 24


# Function to generate a random latitude and longitude within the bounding box
def random_location():
    latitude = random.uniform(MIN_LATITUDE, MAX_LATITUDE)
    longitude = random.uniform(MIN_LONGITUDE, MAX_LONGITUDE)
    return {"latitude": latitude, "longitude": longitude}


# Function to generate random sound level between 50 and 100 dB
def random_sound_level():
    return random.randint(30, 100)


# Generate data for each device
devices_data = []
start_time = datetime.now() - timedelta(hours=hours)

for device_id in range(1, num_devices + 1):
    device_data = []
    device_location = random_location()  # Fixed location for each device

    # Generate readings for the past 24 hours
    current_time = start_time
    while current_time <= datetime.now():
        # Create data entry
        data_entry = {
            "device_id": f"device_{device_id:03}",
            "timestamp": current_time.strftime("%Y-%m-%dT%H:%M:%S"),
            "location": device_location,
            "sound_level": random_sound_level(),
        }
        device_data.append(data_entry)
        current_time += timedelta(minutes=interval_minutes)

    devices_data.extend(device_data)

# Save data to JSON file
with open("mock_data.json", "w") as f:
    json.dump(devices_data, f, indent=2)

print("Mock data generated and saved to mock_data.json")
