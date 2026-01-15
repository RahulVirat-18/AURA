import pandas as pd
import numpy as np
import random

def generate_synthetic_data(num_rows=250000):
    np.random.seed(42)
    
    cpu_data = []
    mem_data = []
    timestamps = []
    
    current_state = 0
    current_step = 0
    
    base_mem = 30.0
    
    while len(cpu_data) < num_rows:
        duration = np.random.randint(50, 500)
        
        if np.random.rand() > 0.95:
            current_state = np.random.choice([0, 1, 2, 3, 4], p=[0.3, 0.3, 0.2, 0.15, 0.05])

        for _ in range(duration):
            if len(cpu_data) >= num_rows:
                break
                
            if current_state == 0:
                cpu = np.random.normal(10, 2)
                base_mem = base_mem * 0.99 + 30 * 0.01
                
            elif current_state == 1:
                cpu = np.random.normal(25, 5)
                base_mem = base_mem * 0.99 + 45 * 0.01
                
            elif current_state == 2:
                cpu = np.random.normal(40, 10)
                if np.random.rand() > 0.95: cpu += 40
                base_mem = base_mem * 0.99 + 55 * 0.01

            elif current_state == 3:
                cpu = np.random.normal(85, 5)
                base_mem = base_mem * 0.99 + 85 * 0.01
                
            elif current_state == 4:
                cpu = np.random.normal(20, 5)
                base_mem += 0.1
                if base_mem > 99: base_mem = 99

            final_cpu = np.clip(cpu + np.random.normal(0, 2), 0, 100)
            final_mem = np.clip(base_mem + np.random.normal(0, 1), 0, 100)
            
            cpu_data.append(round(final_cpu, 2))
            mem_data.append(round(final_mem, 2))
            timestamps.append(current_step)
            current_step += 10

    df = pd.DataFrame({
        'timestamp': timestamps,
        'cpu_usage': cpu_data,
        'memory_usage': mem_data
    })
    
    df.to_csv('aura_training_data.csv', index=False)
    print(f"Dataset Generated: {len(df)} rows.")

if __name__ == "__main__":
    generate_synthetic_data()