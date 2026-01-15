from flask import Flask, request, jsonify
import pandas as pd
import xgboost as xgb
import numpy as np

app = Flask(__name__)

# Load the trained model
model = xgb.XGBClassifier()
model.load_model("aura_model.json")

history_cpu = []
history_mem = []

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    cpu = data.get('cpuUsage', 0)
    mem = data.get('memoryUsage', 0)

    # Maintain history window
    history_cpu.append(cpu)
    history_mem.append(mem)
    if len(history_cpu) > 6:
        history_cpu.pop(0)
        history_mem.pop(0)

    # Handle cold start
    if len(history_cpu) < 6:
        return jsonify({"cpuRisk": 0.0, "memRisk": 0.0, "prediction": 0})

    # Prepare DataFrame for XGBoost
    df = pd.DataFrame({
        'cpu_usage': [cpu],
        'memory_usage': [mem],
        'cpu_rolling_mean': [np.mean(history_cpu)],
        'mem_rolling_mean': [np.mean(history_mem)],
        'cpu_lag_1': [history_cpu[-2]],
        'cpu_lag_2': [history_cpu[-3]]
    })
    
    features = ['cpu_usage', 'memory_usage', 'cpu_rolling_mean', 'mem_rolling_mean', 'cpu_lag_1', 'cpu_lag_2']
    
    # 1. Get Base ML Probability (The "Smart" Score)
    probs = model.predict_proba(df[features])[0]
    ml_risk = float(probs[1]) * 100  # 0 to 100

    # 2. Calculate CPU-Specific Risk
    # Logic: If ML says danger OR CPU is simply very high, risk goes up.
    # This prevents the "0% risk at 90% CPU" issue.
    cpu_stress_factor = (cpu / 100.0) * 100
    if cpu > 50:
        final_cpu_risk = (ml_risk * 0.4) + (cpu_stress_factor * 0.6)
    else:
        final_cpu_risk = ml_risk * 0.5 # Low risk if CPU is low

    # 3. Calculate Memory-Specific Risk
    mem_stress_factor = (mem / 100.0) * 100
    if mem > 85:
        final_mem_risk = (ml_risk * 0.2) + (mem_stress_factor * 0.8) # RAM is critical at high %
    else:
        final_mem_risk = ml_risk * 0.3

    # formatting
    final_cpu_risk = round(min(final_cpu_risk, 99.9), 2)
    final_mem_risk = round(min(final_mem_risk, 99.9), 2)
    
    prediction = 1 if (final_cpu_risk > 70 or final_mem_risk > 85) else 0
    
    return jsonify({
        "prediction": prediction,
        "cpuRisk": final_cpu_risk,
        "memRisk": final_mem_risk
    })

if __name__ == '__main__':
    app.run(port=5000)