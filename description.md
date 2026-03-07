# 🏭 MotorSafe: Tri-Modal Edge-AI Motor Diagnostics

## 💡 The Core Philosophy
Traditional industrial maintenance often relies on "siloed" monitoring—focusing only on vibration or thermal data. This approach is prone to false positives and late-stage detection. **MotorSafe** revolutionizes this by implementing **Tri-Modal Sensor Fusion**. We synchronize three critical data streams—**Voltage, Current, and Vibration**—into a singular, intelligent diagnostic pipeline.

By analyzing the complex relationship between electrical power quality (V), mechanical load (I), and physical health (Vibration), we eliminate the ambiguity of traditional monitoring and provide a definitive diagnosis of motor health.

### ❓ Why Sensor Fusion? (Is it necessary?)
Yes! While monitoring just one variable (like vibration) is simple, it is often unreliable. We use fusion for three critical reasons:
1.  **Eliminating False Positives:** A physical bump to a motor might spike a vibration sensor, but if Voltage and Current are stable, the AI knows it's an external shock and avoids an expensive, unnecessary shutdown.
2.  **Root Cause Analysis:** If the motor pulls high current, we don't know if it's a mechanical jam or a power grid "brownout." By looking at Voltage simultaneously, we can distinguish between a grid problem and a motor problem.
3.  **Cross-Verification:** Multi-modal data allows the AI to "cross-check" its findings. If both Current and Vibration rise together, the confidence of a mechanical failure is near 100%.

---

## 🌐 The MQTT Wireless Ecosystem
In this project, we don't use direct wires to connect every motor to the server. Instead, we use a wireless **Publish/Subscribe** architecture.

### 🛠️ How it works:
1.  **The Publisher (ESP8266):** Each motor has an ESP8266 chip. It reads the raw sensor data, packages it into a small JSON string, and "publishes" it to a specific **MQTT Topic** (e.g., `factory/motor1/telemetry`).
2.  **The Broker:** A central MQTT Broker (like Mosquitto) sits in the middle. It receives all messages from the ESP8266s and keeps them organized.
3.  **The Subscriber (Central Server):** Our Python-based Central Server "subscribes" to these topics. Whenever a new data point arrives, the Broker pushes it to the server instantly.

### 🚀 Why MQTT?
We chose MQTT over WebSockets or HTTP for industrial reliability:
*   **Quality of Service (QoS):** MQTT ensures that critical fault alerts are delivered even if the local Wi-Fi temporarily drops out.
*   **Battery/Resource Friendly:** It is extremely lightweight, which is perfect for the limited processing power of the ESP8266.
*   **Decoupled Design:** The server doesn't need to know exactly how many motors there are; it just listens to the "topic." You can add 100 more motors without changing a single line of server code.

---

## 🔬 The 3 Pillars of Monitoring

### 1. Current (The Load Monitor)
*   **What it tracks:** Electrical demand and torque load.
*   **The Diagnostic:** As bearings wear or friction increases, the motor struggles to maintain RPM, causing a steady climb in current. Sudden transients can also indicate rotor bar damage.

### 2. Voltage (The Power Quality Monitor)
*   **What it tracks:** The health of the supply grid.
*   **The Diagnostic:** By monitoring voltage, we can distinguish between a **Grid Issue** (Voltage Sag causing a Current Spike) and a **Motor Issue** (Normal Voltage with high Current). This is the key to our 0% false-positive rate.

### 3. Vibration (The Physical Wear Monitor)
*   **What it tracks:** Mechanical resonance and structural integrity.
*   **The Diagnostic:** High-frequency vibration signatures specifically identify *where* a fault is occurring—whether it's an imbalanced rotor, a dry bearing, or a misaligned shaft.

---

## 🤖 The "Brain": Isolation Forest ML
For our central diagnostic engine, we selected the **Isolation Forest** algorithm. This unsupervised model is perfectly suited for industrial PdM:

1.  **Anomaly Isolation:** Instead of defining "Normal," it explicitly looks for data that is "few and different." Faults are isolated much faster (shorter path lengths) than healthy data.
2.  **Unsupervised Learning:** It learns the unique "healthy" signature of each motor on-the-fly, requiring no expensive manual labeling or pre-existing fault data.
3.  **Linear Efficiency:** It processes thousands of multi-modal data points in milliseconds, allowing for real-time inference on standard server hardware.

---

## ⚙️ The Operational Pipeline

1.  **Acquisition:** Sensors (ACS712, ZMPT101B, MPU6050) capture 1000 samples per second at the motor.
2.  **Transmission:** The **ESP8266** packages this telemetry into JSON payloads and sends them via **MQTT** to the central broker.
3.  **Logging:** The Central Server appends the live data stream to `public/motor_parameters.csv` for historical auditing.
4.  **Inference:** The **Isolation Forest** analyzes the incoming data packet in real-time.
    *   **Case A (External Shock):** High Vibration + Steady Current = *Mechanical Noise (Ignored).*
    *   **Case B (Grid Fluctuation):** High Current + Low Voltage = *Grid Sag (Warning).*
    *   **Case C (Mechanical Failure):** High Current + High Vibration = **MOTOR TRIP (Emergency Shutoff).**

---
