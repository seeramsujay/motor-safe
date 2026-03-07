# 🏭 MotorSafe: Tri-Modal Edge-AI Motor Diagnostics

**Protecting the industrial heart.** MotorSafe is an Edge-Native Predictive Maintenance (PdM) system designed for Industry 4.0. By fusing electrical and mechanical data (Current, Voltage, and Vibration), this system predicts industrial motor degradation and mechanical faults days before a catastrophic failure occurs.

![Technology Readiness Level](https://img.shields.io/badge/TRL-4%20(Lab%20Validated)-blue)
![Architecture](https://img.shields.io/badge/Architecture-Edge--Native-success)
![Status](https://img.shields.io/badge/Status-Hackathon%20Prototype-orange)

## 📖 Project Overview
Traditional industrial maintenance relies on single-variable monitoring (e.g., thermal cameras or vibration alone), which often leads to late-stage detection or false positives. 

MotorSafe utilizes a **Multi-Modal Sensor Fusion** approach. By analyzing high-frequency current transients alongside voltage quality and physical vibration, our local unsupervised Machine Learning model (**Isolation Forest**) cross-verifies faults. This ensures incredibly high predictive accuracy for mechanical drag, bearing wear, and rotor imbalances with zero cloud latency.

### ✨ Key Features
* **Tri-Modal Sensor Fusion:** Simultaneously monitors Voltage, Current, and Vibration to eliminate false positives.
* **Edge-AI Processing:** All DSP (Fast Fourier Transform) and ML anomaly detection (via Isolation Forest) runs locally, ensuring data privacy and zero latency.
* **Real-Time Telemetry Dashboard:** A local web interface built with Streamlit to visualize time-domain signals and frequency-domain (FFT) spectral shifts.
* **Automated Safety Relay:** Triggers a physical hardware shut-off in milliseconds if critical multi-variate thresholds are crossed.

---

## 🏗️ System Architecture

1. **Hardware / Data Acquisition:**
   * **Current (Load):** ACS712 Hall-Effect Sensor
   * **Voltage (Power Quality):** ZMPT101B Sensor
   * **Vibration (Mechanical Health):** MPU6050 Accelerometer/Gyro
   * **Edge Gateway:** ESP32 / Arduino microcontroller reading analog/I2C data and transmitting via Serial.
   
2. **Software / Digital Signal Processing (DSP):**
   * Raw time-domain signals are converted using **Fast Fourier Transform (FFT)** to isolate harmonic sidebands and mechanical fault frequencies.

3. **Machine Learning / Anomaly Detection:**
   * An Unsupervised Anomaly Detection algorithm (**Isolation Forest**) monitors the tri-modal data to flag spectral deviations from the baseline "healthy" state. Isolation Forest is specifically chosen for its edge-computing efficiency (linear time complexity) and extreme accuracy in identifying isolated mechanical/electrical transient faults.

---

## 🛠️ Hardware Requirements
* Arduino Uno / Nano OR ESP32 NodeMCU
* ACS712 Current Sensor Module
* ZMPT101B Voltage Sensor Module
* MPU6050 Accelerometer/Gyroscope Module
* 5V Relay Module (For emergency motor shutoff)
* Jumper wires & Breadboard

## 💻 Software & Dependencies
The dashboard and local AI model are built on Python 3.8+.
```bash
pip install streamlit pandas numpy scipy scikit-learn pyserial plotly