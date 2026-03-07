# 🔧 MotorSafe: Wireless Implementation Roadmap

This document provides the technical steps required to set up the wireless telemetry architecture for MotorSafe.

## 🖥️ Server Side (Central Hub)

### 1. MQTT Broker Setup (Mosquitto)
The broker is the traffic controller for your industrial data.
- [ ] **Install Mosquitto:** Download and install the Mosquitto broker on the central server machine.
- [ ] **Configuration:** 
    - [ ] Edit `mosquitto.conf` to listen on port `1883`.
    - [ ] (Optional) Add a listener on port `9001` for WebSockets support (useful for real-time web dashboards).
- [ ] **Security:** 
    - [ ] Use `mosquitto_passwd` to create a secure login for the ESP8266 nodes.
    - [ ] Set `allow_anonymous false` in the config to prevent unauthorized data injection.
- [ ] **Verification:** Use a tool like MQTT Explorer or `mosquitto_sub` to verify the broker is receiving messages.

### 2. Python Analytics Engine
This is the "Brain" that processes the live streams.
*(Reference code available in `mqtt/server.py`)*
- [ ] **Library:** Install `paho-mqtt` via pip.
- [ ] **Connection:** Implement an MQTT client that persists a connection to `localhost`.
- [ ] **Subscription:** Subscribe to the wildcard topic `factory/+/telemetry`. This allows one server to handle hundreds of motors.
- [ ] **The CSV Loop:**
    - [ ] On every message received, parse the JSON payload.
    - [ ] Append the values (Timestamp, V, I, Vib) to `public/motor_parameters.csv`.
- [ ] **AI Inference:** Feed the parsed data into the `AnomalyDetector` class.
- [ ] **Automated Response:** If the model returns an Anomaly (`-1`), immediately publish a "TRIP" message to the specific motor's control topic (e.g., `factory/motor1/control`).

---

## 🛰️ Slave Side (ESP8266 Node)

### 1. Hardware Integration
Each motor node is a standalone "Slave" that monitors its assigned motor.
- [ ] **Sensor Wiring:** 
    - [ ] **Current:** Connect ACS712 signal to an Analog pin.
    - [ ] **Voltage:** Connect ZMPT101B signal to an Analog pin.
    - [ ] **Vibration:** Connect MPU6050 to the I2C pins (SDA/SCL).
- [ ] **Safety Relay:** Wire a Relay module to a Digital GPIO pin to act as a physical circuit breaker.

### 2. Firmware Logic Requirements (ESP8266)
*Do not write code yet—follow these structural steps:*
*(Reference code available in `mqtt/slave.ino`)*
- [ ] **Network Init:** Boot the ESP8266 and establish a stable WiFi connection to the local access point.
- [ ] **MQTT Handshake:**
    - [ ] Connect to the Server IP using the credentials created in the Broker setup.
    - [ ] Set a **Last Will and Testament (LWT)** message (e.g., `Status: Offline`) so the server knows if the node loses power.
- [ ] **Telemetry Loop:**
    - [ ] Sample the Current and Voltage at high frequency to capture transients.
    - [ ] Read the X, Y, and Z acceleration from the MPU6050.
    - [ ] Package all values into a compact **JSON String**.
    - [ ] Publish the string to `factory/motor[ID]/telemetry` every 100-500ms.
- [ ] **Control Listener:**
    - [ ] Subscribe to `factory/motor[ID]/control`.
    - [ ] Implement a "Callback" function: if a "TRIP" message is received, immediately pull the Relay pin HIGH/LOW to stop the motor.
