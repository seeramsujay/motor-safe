# 🏭 MotorSafe: Detailed System Description

## 💡 The Core Philosophy
Traditional motor monitoring is often siloed—focusing only on vibration or thermal data. MotorSafe breaks this mold by implementing **Tri-Modal Sensor Fusion**. We synchronized three critical data streams—**Voltage, Current, and Vibration**—into a singular local Edge-AI pipeline. 

By analyzing the relationship between electrical power quality (V), mechanical load (I), and physical health (Vibration), we eliminate the false positives that plague single-sensor systems.

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

## 🤖 Why we use Isolation Forest? (The "Brain")
For our Edge-AI gateway, we selected the **Isolation Forest** algorithm over traditional Neural Networks or K-Means clustering for several critical reasons:

1.  **Anomaly-First Logic:** Unlike models that try to define "Normal," Isolation Forest works by explicitly trying to "isolate" data points. Since faults are "few and different," they are isolated much faster (shorter path lengths) than healthy data.
2.  **Edge Efficiency:** The algorithm has linear time complexity $O(n)$ and extremely low memory usage. It can run in real-time on localized hardware (like an ESP32 or Raspberry Pi) without needing powerful GPUs or cloud connectivity.
3.  **No Labeled Data Required:** In a factory, we don't always have samples of every possible motor failure. Isolation Forest is **Unsupervised**—it learns the baseline on the fly and flags anything that deviates.
4.  **Multi-Variate Excellence:** It is exceptionally good at handling high-dimensional data, allowing it to "see" the correlation between V, I, and Vibration simultaneously.

---

## ⚙️ The Operational Pipeline

1.  **Acquisition:** Sensors (ACS712, ZMPT101B, MPU6050) capture 1000 samples per second.
2.  **Processing:** The Edge Microcontroller performs Digital Signal Processing (DSP) to clean the signals and extract features.
3.  **Inference:** The **Isolation Forest** analyzes the data packet.
    *   **Case A (External Shock):** High Vibration + Steady Current = *Mechanical Noise (Ignored).*
    *   **Case B (Grid Fluctuation):** High Current + Low Voltage = *Grid Sag (Warning).*
    *   **Case C (Mechanical Failure):** High Current + High Vibration = **MOTOR TRIP (Emergency Shutoff).**

---
