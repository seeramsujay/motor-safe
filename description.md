The Core Idea:
Instead of just relying on one sensor, we are building a "sensor fusion" system. We are tracking three different parameters simultaneously—Voltage, Current, and Vibration—and feeding them into a local AI model. This is called multi-modal monitoring.

Why are we doing it this way?
If you only monitor current, a random power grid fluctuation might trigger a false alarm. If you only monitor vibration, someone bumping into the machine might trigger a false alarm. By combining the electrical data (V & I) with physical data (Vibration), our system cross-verifies faults. It eliminates false positives and gives a 100% accurate diagnosis.

The 3 Parameters (What each one actually does):
1. Current (The Load Monitor)

What it tells us: How hard the motor is working.

The Fault: If the bearings are wearing out, friction increases. The motor has to pull more current to maintain the same speed. A slow, steady rise in current or sudden spikes (transients) tells our AI that the motor is physically struggling.

2. Voltage (The Power Quality Monitor)

What it tells us: What the electrical grid is supplying to the motor.

The Fault: If the voltage drops suddenly (sag), the current will artificially spike to compensate. Because we are monitoring voltage, our AI knows this is a grid problem, not a mechanical motor problem, preventing a false alarm.

3. Vibration (The Physical Wear Monitor)

What it tells us: The actual mechanical health of the spinning parts.

The Fault: As internal components (like bearings or the rotor shaft) degrade, they vibrate at specific frequencies. While current tells us the motor is struggling, the vibration sensor specifically confirms where the physical grinding or imbalance is happening.

How the System Ties It All Together (The Pipeline):
Hardware: We attach the Voltage, Current, and Vibration sensors to the motor and wire them directly into our Edge microcontroller (like an Arduino/ESP32).

Processing: The microcontroller reads all three data streams continuously.

The AI Logic: The data goes into our local anomaly detection model. The AI looks for correlations.

Example A: High Vibration + Normal Current = External mechanical shock (Ignore).

Example B: High Current + Low Voltage = Grid power issue (Warning).

Example C: High Current + High Vibration = Severe internal bearing friction (CRITICAL TRIP).