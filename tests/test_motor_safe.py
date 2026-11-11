import pytest
from pathlib import Path
import numpy as np
from generate_motor_data import generate_motor_signals
from ml.anomaly_detector import AnomalyDetector

REPO_ROOT = Path(__file__).resolve().parent.parent

def test_generate_motor_signals():
    num_rows = 200
    voltage, v_anom, current, i_anom, vibration, vib_anom, confidence = generate_motor_signals(num_rows)
    assert len(voltage) == num_rows
    assert len(current) == num_rows
    assert len(vibration) == num_rows
    assert len(confidence) == num_rows

def test_anomaly_detector():
    model_path = REPO_ROOT / "ml" / "isolation_forest_model.joblib"
    detector = AnomalyDetector(model_path=str(model_path))
    assert detector.model is not None
    assert detector.scaler is not None

    pred = detector.predict(300.0, 10.0, 0.1)
    assert pred in [-1, 1]

    pred_anom = detector.predict(550.0, 30.0, 0.15)
    assert pred_anom in [-1, 1]
