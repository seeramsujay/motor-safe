import csv
import random

def generate_motor_data(filename, num_rows=25000):
    headers = [
        "Voltage", "Voltage_Anomaly",
        "Current", "Current_Anomaly",
        "Vibration", "Vibration_Anomaly",
        "Confidence_Rating"
    ]

    with open(filename, mode='w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(headers)

        for _ in range(num_rows):
            # Default values (Normal State)
            voltage = round(random.uniform(225, 235), 2)
            current = round(random.uniform(7.5, 8.5), 2)
            vibration = round(random.uniform(0.15, 0.25), 2)
            v_anomaly = 0
            i_anomaly = 0
            vib_anomaly = 0
            confidence = round(random.uniform(0.0, 0.1), 3)

            # Determine if this row should be an anomaly (~5% chance)
            anomaly_type = random.random()
            
            if anomaly_type < 0.05:
                # 5% chance of some kind of anomaly
                sub_type = random.random()
                
                if sub_type < 0.4:
                    # Voltage Sag (prevents false alarm logic)
                    voltage = round(random.uniform(190, 210), 2)
                    current = round(random.uniform(10.0, 11.5), 2) # Compensatory spike
                    v_anomaly = 1
                    i_anomaly = 1 # Mark both as anomalies
                    confidence = round(random.uniform(0.7, 0.85), 3)
                
                elif sub_type < 0.7:
                    # Mechanical Vibration (Physical Wear)
                    vibration = round(random.uniform(0.7, 1.2), 2)
                    vib_anomaly = 1
                    confidence = round(random.uniform(0.6, 0.8), 3)
                
                else:
                    # Severe Internal Friction (CRITICAL TRIP)
                    current = round(random.uniform(12.0, 15.0), 2)
                    vibration = round(random.uniform(1.0, 1.5), 2)
                    i_anomaly = 1
                    vib_anomaly = 1
                    confidence = round(random.uniform(0.9, 1.0), 3)

            writer.writerow([
                voltage, v_anomaly,
                current, i_anomaly,
                vibration, vib_anomaly,
                confidence
            ])

if __name__ == "__main__":
    generate_motor_data("motor_data.csv")
    print("motor_data.csv generated successfully with 25,000 rows.")
