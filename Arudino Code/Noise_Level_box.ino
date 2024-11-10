#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <NTPClient.h>
#include <WiFiUdp.h>  // For handling JSON

// WiFi configuration
const char* ssid = "iPhone (2)";
const char* password = "michael14!";

// Static GPS coordinates
const float latitude = 42.729322;
const float longitude = -73.679168;

// Microphone configuration
const int numMicrophones = 4;
const int numReadings = 100;
int microphonePins[numMicrophones] = {A0, A1, A2, A3};
int readings[numMicrophones][numReadings];
int total[numMicrophones] = {0, 0, 0, 0};
int readingIndex = 0;
unsigned long previousMillis = 0;
const unsigned long interval = 300000;  // 5 minutes in milliseconds

// NTP Client to get time
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org", 0);  // 0 offset for GMT

void setup() {
  Serial.begin(115200);  // Initialize Serial for debugging

  // WiFi setup
  Serial.print("Connecting to WiFi");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
  }
  Serial.println("\nConnected to WiFi successfully!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());

  // Initialize microphone readings to zero
  for (int i = 0; i < numMicrophones; i++) {
    for (int j = 0; j < numReadings; j++) {
      readings[i][j] = 0;
    }
  }

  // Start NTP client
  timeClient.begin();
}

void loop() {
  timeClient.update();  // Update NTP client time

  // Read microphone values and update totals
  for (int i = 0; i < numMicrophones; i++) {
    int micValue = analogRead(microphonePins[i]);
    total[i] -= readings[i][readingIndex];
    readings[i][readingIndex] = micValue;
    total[i] += micValue;
  }
  readingIndex = (readingIndex + 1) % numReadings;

  // Check if 5 minutes have passed
  unsigned long currentMillis = millis();
  if (currentMillis - previousMillis >= interval) {
    previousMillis = currentMillis;

    // Calculate average sound level over 5 minutes
    int avgSoundLevel = 0;
    for (int i = 0; i < numMicrophones; i++) {
      avgSoundLevel += total[i] / numReadings;
    }
    avgSoundLevel /= numMicrophones;
    avgSoundLevel *= 0.03;

    // Send data to the server
    sendData(avgSoundLevel);
  }
}

void sendData(int soundLevel) {
  if (WiFi.status() == WL_CONNECTED) {  // Check if WiFi is connected
    HTTPClient http;
    http.begin("https://www.noisescape.tech/api/data/totalqueries");  // Specify the URL
    http.addHeader("Content-Type", "application/json");  // Specify content-type header

    // Create JSON object
    StaticJsonDocument<200> jsonDoc;
    jsonDoc["device_id"] = "device_001";
    jsonDoc["location"]["latitude"] = latitude;
    jsonDoc["location"]["longitude"] = longitude;
    jsonDoc["sound_level"] = soundLevel;
    jsonDoc["timestamp"] = timeClient.getEpochTime();  // Add GMT timestamp

    // Convert JSON object to string
    String requestBody;
    serializeJson(jsonDoc, requestBody);

    // Send HTTP POST request
    int httpResponseCode = http.POST(requestBody);

    if (httpResponseCode > 0) {
      String response = http.getString();  // Get the response to the request
      Serial.println("POST Response code: " + String(httpResponseCode));
      Serial.println("Response: " + response);
    } else {
      Serial.println("Error on sending POST: " + String(httpResponseCode));
    }

    http.end();  // Free resources
  } else {
    Serial.println("WiFi Disconnected");
  }
}