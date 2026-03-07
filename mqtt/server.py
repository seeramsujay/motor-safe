import paho.mqtt.client as mqtt
import json
import csv
from datetime import datetime
import os

# NOTE: This code is for reference only and is not meant to be directly executed.
# It demonstrates how the Python Analytics Engine interacts with the Mosquitto broker.

MQTT_BROKER = "localhost"
MQTT_PORT = 1883
MQTT_TOPIC_TELEMETRY = "factory/+/telemetry"
CSV_FILE_PATH = os.path.join("..", "public", "motor_parameters.csv")

def on_connect(client, userdata, flags, rc):
    print(f"Connected to MQTT Broker with result code {rc}")
    # Subscribe to the wildcard topic to listen to all motors
    client.subscribe(MQTT_TOPIC_TELEMETRY)

def on_message(client, userdata, msg):
    try:
        # Parse the topic to extract the motor ID (e.g., factory/motor1/telemetry -> motor1)
        topic_parts = msg.topic.split('/')
        if len(topic_parts) >= 2:
            motor_id = topic_parts[1]
        else:
            motor_id = "unknown"
        
        # Decode the JSON payload
        payload = json.loads(msg.payload.decode())
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        v = payload.get("voltage", 0.0)
        i = payload.get("current", 0.0)
        vib = payload.get("vibration", 0.0)
        
        # Append to the CSV file
        file_exists = os.path.isfile(CSV_FILE_PATH)
        with open(CSV_FILE_PATH, mode='a', newline='') as file:
            writer = csv.writer(file)
            if not file_exists:
                writer.writerow(["Timestamp", "Voltage", "Current", "Vibration"])
            writer.writerow([timestamp, v, i, vib])
            
        print(f"[{motor_id}] Telemetry received: V={v}, I={i}, Vib={vib}")
        
        # Reference AI Inference call
        # from ml.anomaly_detector import AnomalyDetector
        # detector = AnomalyDetector()
        # prediction = detector.predict([v, i, vib])
        
        # Simulated prediction result
        is_anomaly = False # Change this to test the TRIP logic
        
        # Automated Response
        if is_anomaly:
            print(f"[{motor_id}] ANOMALY DETECTED! Publishing TRIP command.")
            control_topic = f"factory/{motor_id}/control"
            # Publish a TRIP command to immediately stop the motor
            client.publish(control_topic, "TRIP")
            
    except Exception as e:
        print(f"Error processing message from topic {msg.topic}: {e}")

if __name__ == "__main__":
    client = mqtt.Client()
    client.on_connect = on_connect
    client.on_message = on_message
    
    # Example setup for authentication (if configured on the broker)
    # client.username_pw_set("server_user", "secure_password")
    
    try:
        client.connect(MQTT_BROKER, MQTT_PORT, 60)
        print(f"Python Analytics Engine subscribing to {MQTT_TOPIC_TELEMETRY}...")
        client.loop_forever()
    except Exception as e:
        print(f"Failed to connect to broker: {e}")
