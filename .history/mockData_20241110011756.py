import json
import random
from datetime import datetime, timedelta
from geopy.distance import geodesic

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


# Function to calculate the nearest 3 neighbors based on location
def get_nearest_neighbors(device_index, locations):
    distances = []
    for i, location in enumerate(locations):
        if i != device_index:
            dist = geodesic(
                (
                    locations[device_index]["latitude"],
                    locations[device_index]["longitude"],
                ),
                (location["latitude"], location["longitude"]),
            ).meters
            distances.append((i, dist))
    # Sort by distance and get indices of the three closest neighbors
    distances.sort(key=lambda x: x[1])
    return [index for index, _ in distances[:3]]


# Function to generate a constrained sound level based on neighbors' levels
def constrained_sound_level(previous_level, neighbor_levels):
    # Start with the previous level, limited to a max change of ±10 dB
    min_level = max(previous_level - 10, INITIAL_MIN_SOUND_LEVEL)
    max_level = min(previous_level + 10, INITIAL_MAX_SOUND_LEVEL)
    new_level = random.randint(min_level, max_level)

    # Calculate the average level of the three nearest neighbors
    avg_neighbor_level = sum(neighbor_levels) / len(neighbor_levels)

    # Ensure the new level is within ±20 dB of the average neighbor level
    if abs(new_level - avg_neighbor_level) > 20:
        if new_level > avg_neighbor_level:
            new_level = avg_neighbor_level + 20
        else:
            new_level = avg_neighbor_level - 20

    return int(new_level)


# Generate data for each device
devices_data = []
start_time = datetime.now() - timedelta(hours=hours)
locations = [
    random_location() for _ in range(num_devices)
]  # Generate fixed locations for each device
initial_sound_levels = [
    random.randint(INITIAL_MIN_SOUND_LEVEL, INITIAL_MAX_SOUND_LEVEL)
    for _ in range(num_devices)
]
neighbor_indices = [
    get_nearest_neighbors(i, locations) for i in range(num_devices)
]  # Nearest 3 neighbors for each device

for device_id in range(1, num_devices + 1):
    device_data = []
    current_time = start_time
    previous_level = initial_sound_levels[device_id - 1]
    location = locations[device_id - 1]

    # Generate readings for the past 24 hours
    while current_time <= datetime.now():
        # Get the sound levels of the three nearest neighbors
        neighbor_levels = [
            (
                initial_sound_levels[neighbor_id]
                if current_time == start_time
                else devices_data[-(num_devices - neighbor_id)]["sound_level"]
            )
            for neighbor_id in neighbor_indices[device_id - 1]
        ]

        # Generate constrained sound level
        sound_level = constrained_sound_level(previous_level, neighbor_levels)

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

    devices_data.extend(device_data)

# Save data to JSON file
with open("mock_data.json", "w") as f:
    json.dump(devices_data, f, indent=2)

print("Mock data generated and saved to mock_data.json")
