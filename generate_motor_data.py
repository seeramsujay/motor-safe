import csv
import math
import random
import numpy as np

def generate_motor_signals(num_rows, freq_hz=50, sample_rate=1000):
    duration = num_rows / sample_rate
    t = np.linspace(0, duration, num_rows, endpoint=False)
    omega = 2 * np.pi * freq_hz

    # Base signals
    voltage_amp_base = 325.0
    current_amp_base = 11.3
    
    # Pre-allocate arrays
    voltage = voltage_amp_base * np.sin(omega * t) + np.random.normal(0, 2.0, num_rows)
    current = current_amp_base * np.sin(omega * t - np.pi/6) + np.random.normal(0, 0.2, num_rows)
    vibration = 0.2 * np.sin(2 * omega * t) + np.random.normal(0, 0.05, num_rows)
    
    v_anomaly = np.zeros(num_rows, dtype=int)
    i_anomaly = np.zeros(num_rows, dtype=int)
    vib_anomaly = np.zeros(num_rows, dtype=int)
    confidence = np.zeros(num_rows)

    # Add Anomalies
    num_anomalies = random.randint(3, 6) # Generate 3-6 anomaly events
    
    for _ in range(num_anomalies):
        event_type = random.choice(['sag', 'wear', 'friction', 'spike'])
        
        # Decide roughly when it happens
        start_idx = random.randint(1000, num_rows - 4000)
        
        if event_type == 'sag':
            length = random.randint(1000, 3000) # 1 to 3 seconds
            end_idx = start_idx + length
            
            # Smooth envelope for sag (e.g. going down to 80% voltage)
            sag_env = np.ones(length)
            sag_env -= 0.2 * np.sin(np.pi * np.linspace(0, 1, length))
            
            # Current spikes slightly to compensate
            comp_env = np.ones(length)
            comp_env += 0.3 * np.sin(np.pi * np.linspace(0, 1, length))
            
            voltage[start_idx:end_idx] *= sag_env
            current[start_idx:end_idx] *= comp_env
            
            v_anomaly[start_idx:end_idx] = 1
            i_anomaly[start_idx:end_idx] = 1
            confidence[start_idx:end_idx] = 0.7 * np.sin(np.pi * np.linspace(0, 1, length))
            
        elif event_type == 'wear':
            length = random.randint(2000, 4000)
            end_idx = start_idx + length
            
            # Smoothly increase vibration amplitude and noise
            vib_env = np.linspace(1.0, 3.0, length)
            vibration[start_idx:end_idx] *= vib_env
            vibration[start_idx:end_idx] += np.random.normal(0, 0.3, length) * np.linspace(0, 1, length)
            
            vib_anomaly[start_idx:end_idx] = 1
            confidence[start_idx:end_idx] = 0.6 * np.linspace(0, 1, length)
            
        elif event_type == 'friction':
            length = random.randint(1500, 3000)
            end_idx = start_idx + length
            
            # Both current and vibration increase smoothly
            env = np.linspace(1.0, 1.8, length)
            current[start_idx:end_idx] *= env
            vibration[start_idx:end_idx] *= (env * 1.5)
            
            i_anomaly[start_idx:end_idx] = 1
            vib_anomaly[start_idx:end_idx] = 1
            confidence[start_idx:end_idx] = 0.9 * np.linspace(0, 1, length)
            
        elif event_type == 'spike':
            # Electrical transient (1-5 ms)
            length = random.randint(1, 5)
            end_idx = start_idx + length
            
            voltage[start_idx:end_idx] += random.choice([-1, 1]) * random.uniform(200, 400)
            current[start_idx:end_idx] += random.choice([-1, 1]) * random.uniform(10, 20)
            
            v_anomaly[start_idx:end_idx] = 1
            i_anomaly[start_idx:end_idx] = 1
            confidence[start_idx:end_idx] = 0.95
            
    return voltage, v_anomaly, current, i_anomaly, vibration, vib_anomaly, confidence

def generate_ac_motor_data_for_multiple_motors(filename, num_motors=5, num_rows=25000, sample_rate=1000):
    headers = []
    for i in range(1, num_motors + 1):
        headers.extend([
            f"Motor_{i}_Voltage", f"Motor_{i}_Voltage_Anomaly",
            f"Motor_{i}_Current", f"Motor_{i}_Current_Anomaly",
            f"Motor_{i}_Vibration", f"Motor_{i}_Vibration_Anomaly",
            f"Motor_{i}_Confidence_Rating"
        ])

    # Generate data arrays for all motors
    motors_data = []
    for _ in range(num_motors):
        motors_data.append(generate_motor_signals(num_rows, sample_rate=sample_rate))

    # Write everything to CSV
    with open(filename, mode='w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(headers)
        
        for i in range(num_rows):
            row = []
            for j in range(num_motors):
                voltage, v_anomaly, current, i_anomaly, vibration, vib_anomaly, confidence = motors_data[j]
                row.extend([
                    round(voltage[i], 2), v_anomaly[i],
                    round(current[i], 2), i_anomaly[i],
                    round(vibration[i], 3), vib_anomaly[i],
                    round(confidence[i], 3)
                ])
            writer.writerow(row)

if __name__ == "__main__":
    generate_ac_motor_data_for_multiple_motors("motor_data.csv", num_motors=5)
    print("AC motor_data.csv generated successfully for 5 motors with 25,000 rows.")
