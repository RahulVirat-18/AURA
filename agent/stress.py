import time
import multiprocessing

def stress_cpu():
    while True:
        pass

if __name__ == "__main__":
    processes = []
    for _ in range(multiprocessing.cpu_count()):
        p = multiprocessing.Process(target=stress_cpu)
        p.start()
        processes.append(p)
        
    print("Stress Test Started... Press Ctrl+C to Stop")
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        for p in processes:
            p.terminate()
        print("Stopped.")