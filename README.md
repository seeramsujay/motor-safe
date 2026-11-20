<p align="center">
  <img src="assets/logo.svg" alt="MotorSafe Logo" width="220" />
</p>

<h1 align="center">MotorSafe</h1>

<p align="center">
  <strong>Edge IoT &amp; 3D Digital Twin Predictive Maintenance Platform for Industrial Electric Motors with Isolation Forest Anomaly Detection.</strong>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square" alt="License: MIT"></a>
  <img src="https://img.shields.io/badge/ML-Isolation_Forest-10B981.svg?style=flat-square" alt="Isolation Forest">
  <img src="https://img.shields.io/badge/Broker-Mosquitto_MQTT-3B82F6.svg?style=flat-square&logo=eclipsemosquitto" alt="MQTT">
  <img src="https://img.shields.io/badge/Frontend-React_Three_Fiber-06B6D4.svg?style=flat-square&logo=threedotjs" alt="R3F">
  <img src="https://img.shields.io/badge/Microcontroller-ESP8266_%7C_ESP32-E7352C.svg?style=flat-square&logo=espressif" alt="ESP8266">
  <a href="future.md"><img src="https://img.shields.io/badge/roadmap-future.md-blueviolet.svg?style=flat-square" alt="Roadmap"></a>
</p>

---

## ⚡ Overview

**MotorSafe** is a zero-latency predictive health and telemetry monitoring platform for industrial three-phase and single-phase electric motors. By combining **tri-modal physical sensor fusion**—Voltage (power quality), Current (torque load), and Vibration/Temperature (mechanical integrity)—with local unsupervised machine learning (**Isolation Forest**), MotorSafe detects insulation breakdown, bearing wear, and phase imbalances days before catastrophic equipment seizure occurs.

---

## 🏗️ System & Network Architecture

MotorSafe decouples data acquisition, ingestion, and 3D spatial telemetry visualization into a robust wireless Publish/Subscribe topology:

```mermaid
flowchart TD
    subgraph Edge Nodes [Industrial Hardware Nodes]
        A["ACS712 (Current Sensor)"] & B["ZMPT101B (Voltage Sensor)"] & C["MPU6050 (Vibration Accel)"] -->|Analog / I2C| D["ESP8266 Gateway / Publisher"]
    end
    
    D -->|MQTT Over WiFi JSON| E["Mosquitto MQTT Broker (factory/+/telemetry)"]
    
    subgraph Diagnostic Core [Central Analytical Server]
        E -->|Instant Telemetry Sync| F["Python / central_server.py"]
        F -->|Real-Time Inference| G["Isolation Forest (Unsupervised ML)"]
        F -->|Data Historian| H[("Local CSV Logging (public/motor_parameters.csv)")]
    end
    
    subgraph Control Room [3D Spatial Frontend]
        H -->|High-Frequency Playback Feed| I["React 3D Command Dashboard"]
        I -->|React Three Fiber (R3F)| J["3D Digital Twin Spatial Factory Map"]
    end
    
    G -->|Triage & Emergency Alerts| I
```

---

## ⚡ Core Engineering Pillars

*   **Tri-Modal Sensor Fusion:** Correlates power stability, current draws, and physical vibration to prevent expensive, false-positive factory shutdowns caused by ambient mechanical impacts.
*   **Unsupervised Anomaly Isolation:** Employs an edge-optimized Isolation Forest algorithm that learns the unique baseline signature of each motor without historic failure logs.
*   **3D React Three Fiber Digital Twin:** Renders a zero-latency blueprint factory grid. Anomaly states (>70% confidence) trigger visual red pulses and dynamic spin accelerations directly on the failing 3D motor node.
*   **Decoupled MQTT Scalability:** Add or remove dozens of physical motor nodes instantly via wildcard topics (`factory/+/telemetry`).

---

## 🔬 Rule-Based Diagnostic Pipeline

```text
  Telemetry Ingestion (Current + Voltage + Vibration)
       │
       ├──► [High Vibration]  + [Steady Current]  ==► External Mechanical Noise  (Filter & Ignore)
       ├──► [High Current]    + [Low Voltage]     ==► Grid Sag / Brownout Warning (Log System State)
       └──► [High Current]    + [High Vibration]  ==► MOTOR FAULT / TRIP TRIGGER  (Emergency Shutdown)
```

---

## 🚀 Quick Start (Under 60 Seconds)

### 1. Install & Seed Python ML Backend
```bash
pip install streamlit pandas numpy scipy scikit-learn pyserial plotly
python generate_motor_data.py
```

### 2. Launch 3D Digital Twin Frontend
```bash
npm install
npm run dev
```

### 3. Setup MQTT Broker (Production Setup)
```bash
sudo apt install mosquitto mosquitto-clients -y
sudo systemctl start mosquitto

# Test publish
mosquitto_pub -h localhost -t "factory/motor1/telemetry" -m '{"voltage": 220, "current": 4.2, "vibration": 0.08}'
```

---

## 🔮 Engineering Roadmap

To explore planned features including Motor Current Signature Analysis (MCSA) via on-chip FFT, RS-485 Modbus RTU / OPC UA bridges, and FLIR thermal camera radiometry, read [future.md](future.md).

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for details.
