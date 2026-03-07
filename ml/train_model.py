import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import joblib
import os

def train_and_save_model(data_path="public/motor_data.csv", model_path="ml/isolation_forest_model.joblib"):
    if not os.path.exists(data_path):
        print(f"Data file {data_path} not found. Please provide the correct path.")
        return
    
    print("Loading data...")
    df = pd.read_csv(data_path)
    
    # Extract features for training (Voltage, Current, Vibration)
    # The generated dataset has data for 5 motors
    features = []
    labels = []
    
    for i in range(1, 6):
        v_col = f"Motor_{i}_Voltage"
        c_col = f"Motor_{i}_Current"
        vib_col = f"Motor_{i}_Vibration"
        
        # Ground truth anomalies for evaluation
        v_anom = f"Motor_{i}_Voltage_Anomaly"
        c_anom = f"Motor_{i}_Current_Anomaly"
        vib_anom = f"Motor_{i}_Vibration_Anomaly"
        
        if v_col in df.columns and c_col in df.columns and vib_col in df.columns:
            motor_df = df[[v_col, c_col, vib_col]].copy()
            motor_df.columns = ["Voltage", "Current", "Vibration"]
            features.append(motor_df)
            
            # If any of the 3 sensors has an anomaly, we consider the row anomalous
            if v_anom in df.columns and c_anom in df.columns and vib_anom in df.columns:
                motor_anom = df[[v_anom, c_anom, vib_anom]].max(axis=1)
                labels.append(motor_anom)
            
    if not features:
        print("No valid motor data columns found.")
        return
        
    training_data = pd.concat(features, ignore_index=True)
    
    if labels:
        y_true = pd.concat(labels, ignore_index=True)
        # 1 for anomaly, 0 for normal.
    
    print("Scaling data...")
    scaler = StandardScaler()
    scaled_data = scaler.fit_transform(training_data)
    
    print(f"Training Isolation Forest on {len(scaled_data)} samples...")
    # contamination is the expected proportion of outliers.
    model = IsolationForest(n_estimators=100, contamination=0.05, random_state=42)
    model.fit(scaled_data)
    
    print("Saving model and scaler...")
    os.makedirs(os.path.dirname(model_path), exist_ok=True)
    joblib.dump({'model': model, 'scaler': scaler}, model_path)
    
    print(f"Model successfully saved to {model_path}")
    
    if labels:
        # Evaluate internally
        y_pred = model.predict(scaled_data)
        # Isolation Forest outputs: 1 for normal, -1 for anomaly
        # Convert to: 0 for normal, 1 for anomaly to match y_true
        y_pred_binary = [1 if x == -1 else 0 for x in y_pred]
        
        from sklearn.metrics import classification_report
        print("\nEvaluation against ground truth synthetic labels:")
        print(classification_report(y_true, y_pred_binary, target_names=["Normal", "Anomaly"]))

if __name__ == "__main__":
    train_and_save_model()
