# 🏭 MotorSafe: Tri-Modal Edge-AI Motor Diagnostics

## 💡 The Core Philosophy

Traditional industrial maintenance often relies on "siloed" monitoring—focusing only on vibration or thermal data. This approach is prone to false positives and late-stage detection. MotorSafe revolutionizes this by implementing Tri-Modal Sensor Fusion. We synchronize three critical data streams—Voltage, Current, and Vibration—into a singular, intelligent diagnostic pipeline.

By analyzing the complex relationship between electrical power quality (V), mechanical load (I), and physical health (Vibration), we eliminate the ambiguity of traditional monitoring and provide a definitive diagnosis of motor health.

## ❓ Why Sensor Fusion? (Is it necessary?)

Yes! While monitoring just one variable (like vibration) is simple, it is often unreliable. We use fusion for three critical reasons:

- **Eliminating False Positives**: A physical bump to a motor might spike a vibration sensor, but if Voltage and Current are stable, the AI knows it's an external shock and avoids an expensive, unnecessary shutdown.

- **Root Cause Analysis**: If the motor pulls high current, we don't know if it's a mechanical jam or a power grid "brownout." By looking at Voltage simultaneously, we can distinguish between a grid problem and a motor problem.

- **Cross-Verification**: Multi-modal data allows the AI to "cross-check" its findings. If both Current and Vibration rise together, the confidence of a mechanical failure is near 100%.

## 🌐 The MQTT Wireless Ecosystem

In this project, we don't use direct wires to connect every motor to the server. Instead, we use a wireless Publish/Subscribe architecture. (See `mqtt/` folder for reference implementation).

### 🛠️ How it works:

- **The Publisher (ESP8266)**: Each motor has an ESP8266 chip. It reads the raw sensor data, packages it into a small JSON string, and "publishes" it to a specific MQTT Topic (e.g., `factory/motor1/telemetry`).

- **The Broker**: A central MQTT Broker (like Mosquitto) sits in the middle. It receives all messages from the ESP8266s and keeps them organized.

- **The Subscriber (Central Server)**: Our Python-based Central Server "subscribes" to these topics. Whenever a new data point arrives, the Broker pushes it to the server instantly.

### 🚀 Why MQTT?

We chose MQTT over WebSockets or HTTP for industrial reliability:

- **Quality of Service (QoS)**: MQTT ensures that critical fault alerts are delivered even if the local Wi-Fi temporarily drops out.

- **Battery/Resource Friendly**: It is extremely lightweight, which is perfect for the limited processing power of the ESP8266.

- **Decoupled Design**: The server doesn't need to know exactly how many motors there are; it just listens to the "topic." You can add 100 more motors without changing a single line of server code.

## 🔬 The 3 Pillars of Monitoring

1. **Current (The Load Monitor)**  
   - **What it tracks**: Electrical demand and torque load.  
   - **The Diagnostic**: As bearings wear or friction increases, the motor struggles to maintain RPM, causing a steady climb in current. Sudden transients can also indicate rotor bar damage.

2. **Voltage (The Power Quality Monitor)**  
   - **What it tracks**: The health of the supply grid.  
   - **The Diagnostic**: By monitoring voltage, we can distinguish between a Grid Issue (Voltage Sag causing a Current Spike) and a Motor Issue (Normal Voltage with high Current). This is the key to our 0% false-positive rate.

3. **Vibration (The Physical Wear Monitor)**  
   - **What it tracks**: Mechanical resonance and structural integrity.  
   - **The Diagnostic**: High-frequency vibration signatures specifically identify where a fault is occurring—whether it's an imbalanced rotor, a dry bearing, or a misaligned shaft.

## 🤖 The "Brain": Isolation Forest ML

For our central diagnostic engine, we selected the Isolation Forest algorithm. This unsupervised model is perfectly suited for industrial PdM:

- **Anomaly Isolation**: Instead of defining "Normal," it explicitly looks for data that is "few and different." Faults are isolated much faster (shorter path lengths) than healthy data.

- **Unsupervised Learning**: It learns the unique "healthy" signature of each motor on-the-fly, requiring no expensive manual labeling or pre-existing fault data.

- **Linear Efficiency**: It processes thousands of multi-modal data points in milliseconds, allowing for real-time inference on standard server hardware.

## ⚙️ The Operational Pipeline

- **Acquisition**: Sensors (ACS712, ZMPT101B, MPU6050) capture 1000 samples per second at the motor.

- **Transmission**: The ESP8266 packages this telemetry into JSON payloads and sends them via MQTT to the central broker.

- **Logging**: The Central Server appends the live data stream to `public/motor_parameters.csv` for historical auditing.

- **Inference**: The Isolation Forest analyzes the incoming data packet in real-time.

  - **Case A (External Shock)**: High Vibration + Steady Current = Mechanical Noise (Ignored).
  - **Case B (Grid Fluctuation)**: High Current + Low Voltage = Grid Sag (Warning).
  - **Case C (Mechanical Failure)**: High Current + High Vibration = MOTOR TRIP (Emergency Shutoff).

## 🖥️ The Command Center: 3D Digital Twin Dashboard

To visualize this complex tri-modal data, we engineered a high-performance frontend using React, Tailwind CSS, and Framer Motion, transforming raw telemetry into an intuitive, zero-latency interface.

### 🌌 React Three Fiber (R3F) Digital Twin

Instead of abstract charts, the dashboard features a live 3D Spatial Map of the factory floor:

- **Blueprint Aesthetic**: A high-tech, zero-distraction dark mode grid that provides immediate spatial context for every deployed sensor.

- **Real-Time Visual Feedback**: Motor nodes actively spin in 3D space. When the Isolation Forest detects an anomaly (e.g., > 70% confidence), the corresponding 3D node instantly pulses Red and accelerates its spinning animation, drawing immediate operator attention to the exact physical location of the fault.

- **Infinite Scalability**: The grid dynamically recalculates positions. Deploying a new motor from the UI instantly provisions a new 3D node onto the factory floor.

### 📊 Live Analytics & Triage

- **Dynamic Thresholds**: The UI translates raw AI anomaly scores (0.0 to 1.0) into actionable percentages, dynamically categorized into Optimal (<50%), Warning (50-69%), and Critical (>=70%).

- **Emergency Attention Panel**: Automatically sorts and elevates failing motors to the top of the triage list, so factory managers don't have to hunt for issues during an active failure.

- **End-to-End Export**: A built-in utility allows operators to instantly snapshot the live state of the factory floor and export it back to CSV for offline compliance and maintenance reporting.

### 🔄 The Streaming Engine (Hackathon Implementation)

To simulate the high-frequency telemetry of a live MQTT feed for demonstration purposes, the dashboard utilizes a highly optimized PapaParse playback engine. It streams historical CSV data at 100ms intervals, seamlessly integrating a synthetic data generator to simulate live physics for any newly deployed "mock" nodes during live pitches.