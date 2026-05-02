# Tabib (طبيب) — Gemma 4 Powered Medical Triage

Tabib is a decentralized medical triage system designed for local clinics. It turns any computer into a secure medical server running **Gemma 4**, allowing patients to receive instant triage guidance and share reports with clinic staff without their data ever leaving the local network.

## 🚀 The Ecosystem

Tabib consists of two primary components:

1.  **Patient App (PWA)**: A high-fidelity mobile-first interface for patients to describe symptoms, perform AI triage, and find nearby clinics.
2.  **Clinic Server**: A standalone FastAPI server that hosts the **Gemma 4** model (via Ollama), provides the nurse dashboard, and handles local clinic registration.

## 📂 Project Structure

```text
.
├── frontend/                # Patient PWA (React + Vite + Tailwind v4)
├── tabib-clinic-server/      # FastAPI Server + Nurse Dashboard
├── AGENTS.md                # Technical instructions for AI agents
└── README.md                # You are here
```

## 🛠️ Quick Start

### 1. Start the Clinic Server
The server acts as the hub for the clinic, providing inference and the dashboard.

```bash
cd tabib-clinic-server
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```
*   **Dashboard**: `http://localhost:8000/dashboard` (PIN: `123456`)
*   **API**: `http://localhost:8000/api`

### 2. Start the Patient App
The PWA connects to the clinic server over the local network.

```bash
cd frontend
npm install
npm run dev
```
*   **App**: `http://localhost:5173/app`

## 🌟 Key Features

- **Nearby Discovery**: Patients automatically scan for local clinic servers when within range.
- **Cinematic Onboarding**: A premium Arabic/English onboarding experience with WebGL backgrounds.
- **Privacy First**: All medical data is stored locally on the patient's device and only shared with the clinic via secure local handshake.
- **Intelligent Triage**: Gemma 4 provides structured triage (Urgency, Explanation, Steps) and detects when a human doctor is needed.
- **Nurse Dashboard**: Real-time notifications and queue management for clinic staff.

## 🤖 Gemma 4 Integration
Tabib uses a specialized medical triage prompt with **Gemma 4** to ensure safe and accurate guidance. It supports multimodal input (text + images) for analyzing physical symptoms.

---
*Built for the Gemma 4 Hackathon.*
