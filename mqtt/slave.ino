#include <ESP8266WiFi.h>
#include <PubSubClient.h>

// NOTE: This code is for reference only.
// It acts as the ESP8266 node that publishes telemetry and responds to trips.

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* mqtt_server = "YOUR_MQTT_BROKER_IP";

const char* motor_id = "motor1";

String telemetry_topic = String("factory/") + motor_id + String("/telemetry");
String control_topic = String("factory/") + motor_id + String("/control");
String lwt_topic = String("factory/") + motor_id + String("/status");

WiFiClient espClient;
PubSubClient client(espClient);

// Hardware pins
const int RELAY_PIN = D1;
const int SENSOR_PIN = A0; // Shared analog pin for reference

void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
}

void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    
    // Connect with Last Will and Testament (LWT)
    if (client.connect(motor_id, "node_user", "node_pass", lwt_topic.c_str(), 1, true, "Offline")) {
      Serial.println("connected");
      // Publish "Online" status
      client.publish(lwt_topic.c_str(), "Online", true);
      // Subscribe to control topics for this specific motor
      client.subscribe(control_topic.c_str());
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

void callback(char* topic, byte* payload, unsigned int length) {
  String message;
  for (unsigned int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  
  Serial.print("Message arrived on topic: ");
  Serial.print(topic);
  Serial.print(". Message: ");
  Serial.println(message);

  // If the server detected an anomaly and sent a TRIP command
  if (String(topic) == control_topic && message == "TRIP") {
    Serial.println("Emergency TRIP received from server! Deploying relay...");
    digitalWrite(RELAY_PIN, HIGH); // Assuming HIGH trips the mechanical relay
  }
}

void setup() {
  Serial.begin(115200);
  
  // Set relay as output and ensure it is not tripped at startup
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW);
  
  setup_wifi();
  
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  // Reference telemetry sampling logic (In reality, replace with specific sensors)
  float voltage = analogRead(SENSOR_PIN) * (3.3 / 1023.0) * 100.0;
  float current = 5.5; // Example load
  float vibration = 1.05; // Example MPU6050 reading

  // Construct compact JSON payload
  String payload = "{\"voltage\":" + String(voltage, 2) + 
                   ",\"current\":" + String(current, 2) + 
                   ",\"vibration\":" + String(vibration, 2) + "}";
                   
  // Publish telemetry every 500ms
  client.publish(telemetry_topic.c_str(), payload.c_str());
  
  delay(500); 
}
