import time
import psutil
import requests
import json

 
BACKEND_URL = "http://localhost:8080/api/metrics"

def get_system_metrics():
     
    cpu = psutil.cpu_percent(interval=1)
    ram = psutil.virtual_memory().percent
    
    return {
        "cpuUsage": cpu,
        "memoryUsage": ram,
        "timestamp": int(time.time() * 1000)
    }

def start_monitoring():
    print(f"--- AURA Agent Started ---")
    print(f"Target Backend: {BACKEND_URL}")
    print("Collecting Real-Time Metrics...")
    
    while True:
        try:
             
            data = get_system_metrics()
            
             
            response = requests.post(BACKEND_URL, json=data)
            
             
            if response.status_code == 200:
                print(f"Sent: CPU {data['cpuUsage']}% | RAM {data['memoryUsage']}%")
            else:
                print(f"Failed: {response.status_code}")
                
        except Exception as e:
            print(f"Connection Error: {e}")
            
         
        time.sleep(2)

if __name__ == "__main__":
    start_monitoring()