# AURA — Autonomous Uptime & Reliability Architecture

<div align="center">

![Java](https://img.shields.io/badge/Java-Spring_Boot-red?style=for-the-badge&logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-Backend-success?style=for-the-badge&logo=springboot)
![AWS](https://img.shields.io/badge/AWS-Cloud_Infra-orange?style=for-the-badge&logo=amazonaws)
![MySQL](https://img.shields.io/badge/MySQL-Persistent_Storage-blue?style=for-the-badge&logo=mysql)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=for-the-badge&logo=docker)
![REST API](https://img.shields.io/badge/Architecture-REST_API-black?style=for-the-badge)

</div>

---

## Overview

**AURA** is a distributed real-time infrastructure monitoring and risk-based alerting platform designed to simulate production-grade observability systems.

The platform continuously collects system telemetry metrics from distributed agents, processes them through a Spring Boot backend, stores historical activity in MySQL, and evaluates anomaly risk using an integrated prediction microservice.

Unlike traditional student monitoring projects, AURA was designed with a strong focus on:

- Backend architecture
- Distributed monitoring workflows
- Infrastructure observability
- Fault isolation
- Real-time telemetry processing
- Persistent monitoring pipelines

The system follows a **decoupled service-oriented architecture** where telemetry collection, backend processing, alert evaluation, and visualization operate independently to improve reliability and scalability.

---

## Core Features

### 📡 Real-Time Distributed Monitoring
- Collects CPU, memory, and system telemetry metrics from distributed monitoring agents
- Processes live monitoring streams using REST-based communication
- Supports continuous metric ingestion and alert evaluation pipelines

### ⚙️ Spring Boot Backend Infrastructure
- Built on a Java Spring Boot backend architecture
- Exposes REST APIs for telemetry ingestion, dashboard communication, and monitoring workflows
- Handles persistent metric processing and backend orchestration

### 🚨 Risk-Based Alert Evaluation
- Integrates an XGBoost-powered anomaly scoring microservice
- Evaluates historical telemetry behavior to identify abnormal system activity
- Achieved **86% anomaly prediction accuracy** during testing

### 📊 Monitoring Dashboard
Interactive dashboard powered by Chart.js displaying:
- Real-time system metrics
- Risk scores
- Monitoring history
- Health indicators
- Alert activity

### 🗄️ Persistent Monitoring Storage
- Uses MySQL for long-term telemetry storage
- Maintains historical alert logs and metric history
- Enables trend analysis across extended monitoring windows

### ☁️ Cloud & Infrastructure-Oriented Design
- Designed with infrastructure observability principles inspired by modern AIOps platforms
- Structured for future deployment using Docker and AWS-based infrastructure services

---

## System Architecture

AURA follows a multi-service architecture to separate responsibilities and improve reliability.

```
+---------------------+
|  Monitoring Agents  |
|  (Telemetry Layer)  |
+----------+----------+
           |
           | REST API Calls
           v
+---------------------+
| Spring Boot Backend |
|  Processing Layer   |
+----------+----------+
           |
           | Metric Storage
           v
+---------------------+
|      MySQL DB       |
| Historical Metrics  |
+----------+----------+
           |
           | Historical Data
           v
+---------------------+
|  Risk Evaluation    |
|  ML Microservice    |
+----------+----------+
           |
           | Risk Scores
           v
+---------------------+
| Monitoring Dashboard|
|  Chart.js Frontend  |
+---------------------+
```

---

## Technology Stack

| Layer | Technologies |
|-------|-------------|
| **Backend** | Java, Spring Boot, REST APIs |
| **Monitoring & Processing** | Python, Flask, psutil |
| **Machine Learning** | XGBoost |
| **Database** | MySQL |
| **Frontend** | HTML, CSS, JavaScript, Chart.js |
| **Infrastructure & DevOps** | Docker, AWS, Linux |

---

## Engineering Concepts Demonstrated

### Distributed Telemetry Collection
Implemented agent-based monitoring architecture for collecting telemetry data independently from backend services.

### Service Decoupling
Separated telemetry collection, backend processing, anomaly evaluation, and frontend visualization to improve modularity and maintainability.

### Real-Time Monitoring Pipelines
Built continuous metric ingestion and evaluation workflows for live system analysis.

### Persistent Observability Systems
Designed historical metric storage and alert retention mechanisms for long-term monitoring analytics.

### Infrastructure-Oriented Backend Design
Focused on backend architecture patterns commonly used in monitoring systems, observability platforms, and cloud-native infrastructure tools.

---

## Project Structure

```
AURA/
│
├── backend/
│   ├── Spring Boot APIs
│   ├── Alert Evaluation Logic
│   └── Monitoring Controllers
│
├── monitoring-agent/
│   ├── System Metric Collection
│   ├── CPU & Memory Tracking
│   └── REST Communication
│
├── ml-service/
│   ├── XGBoost Prediction Engine
│   └── Risk Scoring Logic
│
├── frontend/
│   ├── Dashboard UI
│   ├── Live Charts
│   └── Monitoring Visualization
│
├── database/
│   └── MySQL Metric Storage
│
└── docker/
    └── Container Configuration
```

---

## Future Improvements

- [ ] Kubernetes-based deployment
- [ ] Distributed agent scaling
- [ ] WebSocket live streaming
- [ ] Role-based authentication
- [ ] Prometheus integration
- [ ] Grafana visualization
- [ ] Alert notification system
- [ ] Multi-node infrastructure monitoring

---

## Why AURA?

AURA was built to explore how modern monitoring and observability systems operate internally — beyond basic CRUD applications.

The project emphasizes **backend engineering**, **monitoring pipelines**, **distributed infrastructure thinking**, **telemetry processing**, **service orchestration**, and **scalable architecture design** — while simulating concepts commonly found in real-world cloud and DevOps monitoring platforms.
