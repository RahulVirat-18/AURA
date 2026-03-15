# 🌟 AURA (AIOps Uptime Reliability Analyzer)

![Python](https://img.shields.io/badge/Python-3.8%2B-blue)
![Flask](https://img.shields.io/badge/Flask-API-green)
![SQLite](https://img.shields.io/badge/Database-SQLite3-lightgrey)
![HTML/CSS/JS](https://img.shields.io/badge/Frontend-Web-orange)
![License](https://img.shields.io/badge/License-MIT-success)

**AURA** is a high-performance, decoupled system monitoring tool. It tracks CPU, RAM, and Disk telemetry in real-time, stores historical data securely, and uses lightweight AI to predict future resource consumption. 

Built with a **Microservices Architecture**, AURA separates data collection, API serving, and frontend visualization to ensure maximum stability and zero UI-blocking.

---

## ✨ Key Features

* 🧠 **AI-Powered Forecasting:** Utilizes the Holt-Winters Exponential Smoothing model (`statsmodels`) to predict resource usage trends 5 minutes into the future.
* 🔋 **Eco-Mode Telemetry:** The background agent detects battery status. It samples data at 1Hz on AC power but throttles to 0.1Hz on battery to conserve energy.
* 🛡️ **Self-Healing Database:** Built on SQLite using **WAL (Write-Ahead Logging)** mode for concurrent read/writes. Includes auto-corruption detection and a "Zombie Killer" to prevent locked-file crashes.
* 🌉 **Decoupled API Bridge:** A local Flask server that dynamically binds to open ports (5000+) and serves data strictly to `127.0.0.1` for maximum security.
* 🎨 **"Royal" Web Dashboard:** A responsive HTML/CSS/JS frontend featuring a premium Emerald, Gold, and Cream UI. Real-time charting is powered by `Chart.js`.

---

## 🏗️ Architecture Design

AURA is divided into three distinct layers to prevent bottlenecks:

1. **`core_agent` (The Worker):** A silent Python background process that interacts with the OS (via `psutil`), processes AI models, and writes to the DB.
2. **`backend_api` (The Bridge):** A lightweight Flask REST API. It reads from the database and serves JSON endpoints (`/api/status`, `/api/history`) to the frontend.
3. **`frontend` (The Face):** A static web interface. It polls the API asynchronously and updates the DOM and canvas charts without refreshing the page.

---

## 🚀 Installation & Setup

1. Clone the Repository:
    git clone https://github.com/yourusername/AURA.git
    cd AURA

2. Set Up Virtual Environment:
    python -m venv venv

3. Activate Virtual Environment:
    Windows: venv\Scripts\activate
    Mac/Linux: source venv/bin/activate

4. Install Dependencies:
    pip install psutil statsmodels flask flask-cors

---

## 💻 How to Run AURA

Because AURA uses a decoupled architecture, you need to start the backend services before opening the UI.

Step 1: Start the Background Agent
(Open a terminal in the project root and run)
    python -m core_agent.agent_main

Step 2: Start the Local API Server
(Open a second terminal and run)
    python -m backend_api.app

Step 3: Launch the Dashboard
Navigate to the `frontend` folder and double-click `index.html` to open it in your web browser. The dashboard will immediately connect to the API and begin displaying live metrics!

---

## 📂 Project Structure

AURA/
├── core_agent/             # Background telemetry & AI logic
│   ├── agent_main.py       # Main loop and hysteresis logic
│   ├── ai_engine.py        # Holt-Winters prediction model
│   └── collector.py        # OS metric collection & Eco-mode
├── backend_api/            # RESTful API Bridge
│   └── app.py              # Flask server and endpoints
├── database/               # DB Management
│   └── db_manager.py       # SQLite WAL mode & auto-healing
├── frontend/               # User Interface
│   ├── index.html          # Dashboard layout
│   ├── styles.css          # Royal Theme styling
│   └── app.js              # Async fetch logic & Chart.js
├── shared/                 # Utilities
│   ├── config.py           # Safe pathing (%APPDATA%)
│   └── utils.py            # Process management / Lockfiles
└── README.md

---

## 💡 Why this architecture? (For Developers/Recruiters)

This project demonstrates several senior-level engineering concepts:
* **Separation of Concerns:** By completely decoupling the UI from the OS-level data collection, a crash in the web browser will never stop the agent from logging critical system data.
* **Concurrency Handling:** Using SQLite's WAL mode allows the Agent to write data at the exact same time the API is reading it, preventing `database is locked` errors.
* **Resilience:** The inclusion of lockfiles, dynamic port finding, and warm-up thresholds for the AI model ensures the application fails gracefully and heals itself on the next startup.

---
Developed with ❤️ and a passion for clean architecture.
