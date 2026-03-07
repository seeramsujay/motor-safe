import joblib
import numpy as np
import os

class AnomalyDetector:
    def __init__(self, model_path="ml/isolation_forest_model.joblib"):
        self.model_path = model_path
        self.model = None
        self.scaler = None
        self.load_model()
        
    def load_model(self):
        if not os.path.exists(self.model_path):
            print(f"Warning: Model file {self.model_path} not found. Please train the model first.")
            return
            
        try:
            artifacts = joblib.load(self.model_path)
            self.model = artifacts['model']
            self.scaler = artifacts['scaler']
            print("Model and scaler successfully loaded.")
        except Exception as e:
            print(f"Error loading model from {self.model_path}: {e}")
            
    def predict(self, voltage, current, vibration):
        """
        Predicts whether the current sensor readings indicate an anomaly.
        
        Args:
            voltage: numeric
            current: numeric
            vibration: numeric
            
        Returns:
            -1 for anomaly
             1 for normal
             None if model is not loaded
        """
        if self.model is None or self.scaler is None:
            raise ValueError("Model is not loaded.")
            
        # Reshape for single sample prediction
        data = np.array([[voltage, current, vibration]])
        scaled_data = self.scaler.transform(data)
        
        prediction = self.model.predict(scaled_data)
        return prediction[0]

if __name__ == "__main__":
    # Test script for inference logic
    detector = AnomalyDetector()
    
    if detector.model is not None:
        print("\n--- Running Inference Tests ---")
        # 1. Test with typical normal data (around expected sine wave peaks/RMS)
        # Voltage: ~325V peak, Current: ~11.3A peak, Vibration: ~0.2g
        normal_pred = detector.predict(300.0, 10.0, 0.1)
        print(f"Normal data test -> Voltage: 300, Current: 10, Vib: 0.1 | Prediction (1=Normal, -1=Anomaly): {normal_pred}")
        
        # 2. Test with anomalous voltage sag (low V, high I to compensate)
        sag_pred = detector.predict(240.0, 15.0, 0.1)
        print(f"Voltage sag test -> Voltage: 240, Current: 15, Vib: 0.1 | Prediction (1=Normal, -1=Anomaly): {sag_pred}")

        # 3. Test with mechanical friction (high I, high Vib)
        friction_pred = detector.predict(320.0, 19.5, 0.45)
        print(f"Friction test    -> Voltage: 320, Current: 19.5, Vib: 0.45| Prediction (1=Normal, -1=Anomaly): {friction_pred}")
        
        # 4. Test with typical transient spike
        spike_pred = detector.predict(550.0, 30.0, 0.15)
        print(f"Spike test       -> Voltage: 550, Current: 30, Vib: 0.15  | Prediction (1=Normal, -1=Anomaly): {spike_pred}")
