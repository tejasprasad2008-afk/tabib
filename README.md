![Tabib Banner](tabibbanner.png)

# <div dir="rtl" align="center">طبيب</div>

<div align="center">

**Your AI-powered medical triage assistant | مساعدك الطبي الذكي للتقييم الأولي**

[![Built with Gemma 4](https://img.shields.io/badge/Built%20with-Gemma%204-4285F4?logo=google)](https://ai.google.dev/gemma)
[![Offline-First](https://img.shields.io/badge/Offline--First-green)](#)
[![Arabic-First](https://img.shields.io/badge/Arabic--First-orange)](#)
[![License: CC-BY 4.0](https://img.shields.io/badge/License-CC--BY%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by/4.0/)

</div>

---

## 🏥 What is Tabib? (For Clinic Administrators)

**Tabib** helps clinics provide 24/7 initial symptom assessment to their patients using AI that runs entirely on the clinic's own computer.

### The Problem We Solve

Imagine a patient at home at 11 PM with worrying symptoms. They don't know if it's serious enough for the emergency room or something they can treat at home. They call your clinic, but no one answers. This creates anxiety for patients and unnecessary visits for minor issues.

**Tabib solves this:** Patients open a website on their phone, describe their symptoms in Arabic (or English), and immediately receive guidance on what to do next.

### How It Works (Simple Version)

1.  Your clinic installs our software on your existing computer (takes ~30 minutes)
2.  Patients visit your clinic's web address on their phone
3.  They enter their phone number and get a verification code
4.  They type or speak their symptoms in Arabic
5.  Our AI (running on YOUR computer, not the cloud) analyzes the symptoms
6.  The patient gets clear guidance: 🟢 Home care / 🟡 See a doctor soon / 🔴 Emergency
7.  If needed, patients can tap "Notify Clinic" and your nurse dashboard alerts you to call them back

### What Tabib Does NOT Do

- ❌ **It does NOT diagnose** — It provides guidance only, not a medical diagnosis
- ❌ **It does NOT replace doctors** — It helps patients decide when to see a doctor
- ❌ **It does NOT store data in the cloud** — Everything stays on your clinic's computer
- ❌ **It does NOT prescribe medication** — It suggests general care steps only

### Who Is This For?

- Small to medium clinics in Arabic-speaking regions
- Community health centers and NGOs
- Rural clinics without 24/7 staffing
- Any healthcare provider wanting to reduce unnecessary visits while improving patient guidance

### System Flow

```
Patient Phone (anywhere in city)
        │
        ▼
    [Internet]
        │
        ▼
Clinic PC running Gemma 4 AI
        │
        ▼
Arabic triage response generated
        │
        ▼
🔴 Emergency / 🟡 See Doctor / 🟢 Home Care
        │
        ▼
Patient taps "Notify Clinic" if needed
        │
        ▼
    Nurse Dashboard
        │
        ▼
Nurse receives alert → Calls patient back
```

---

## 💻 System Requirements

### Clinic Server (The PC You Install On)

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| **Operating System** | Windows 10 or Ubuntu 20.04+ | Windows 11 or Ubuntu 22.04+ |
| **RAM** | 12GB (slower) | 16GB or more |
| **Storage** | 50GB free space | 100GB SSD |
| **CPU** | Any modern processor from 2018+ | 6+ cores |
| **Internet** | Required for setup only | Stable connection |
| **GPU** | Not required (CPU works fine) | NVIDIA GPU optional for faster responses |
| **Cost** | Runs on hardware you likely already own | ~$300-500 if buying used |

**Note:** The AI model is about 18GB. The installer downloads this automatically.

### Patient Device (What Your Patients Use)

| Requirement | Details |
|-------------|---------|
| **Device** | Any smartphone or tablet from 2015 or newer |
| **Browser** | Chrome, Safari, Firefox (any modern browser) |
| **App Download** | None required — opens directly in browser |
| **Network** | Works on 3G, 4G, 5G, or WiFi |
| **Data Usage** | ~200KB to load the app, ~50KB per consultation |
| **Account** | Phone number only (no email, no password) |

---

## 🚀 Quick Start for Clinics

Follow these steps exactly. No technical knowledge required.

### Step 1: Download the Clinic Server

Download or clone this repository to your clinic computer:

```bash
# If you have Git installed:
git clone https://github.com/tejasprasad2008-afk/Tabib.git

# OR download as ZIP and extract to C:\tabib or ~/tabib
```

### Step 2: Run the Installer

The installer sets up everything automatically: Python, the AI model, and all dependencies.

**On Windows:**
```bash
cd tabib-clinic-server
setup.bat
```

**On Mac/Linux:**
```bash
cd tabib-clinic-server
chmod +x setup.sh
./setup.sh
```

**⚠️ IMPORTANT: Model Download Time**

The installer will download the Gemma 4 model (~18GB). Estimated times:

| Internet Speed | Download Time |
|----------------|---------------|
| 10 Mbps | ~4 hours |
| 50 Mbps | ~45 minutes |
| 100 Mbps | ~25 minutes |
| 200 Mbps | ~12 minutes |

---

## 🌐 Network Setup Guide

This section explains how to make your clinic accessible to patients outside your building.

### 5a. FOR TESTING: ngrok (5 Minutes)

Use ngrok for quick testing without any network configuration.

```bash
# Download ngrok from https://ngrok.com/download
# Then run:
ngrok http 8000
```

### 5b. FOR SMALL CLINICS: Port Forwarding

For long-term use, we recommend using a Dynamic DNS provider like [DuckDNS](https://www.duckdns.org). 

1. Find your clinic computer's local IP.
2. Log into your router and forward port 8000 to that IP.
3. Your clinic URL will be `http://your-subdomain.duckdns.org:8000`.

---

## 👨‍💻 For Developers (Technical Section)

### 6a. Architecture Overview

Tabib is a decentralized medical triage system built with React, FastAPI, and Gemma 4. All AI inference happens locally via Ollama.

### 6b. Project Structure

```
tabib/
├── frontend/                    # Patient PWA (React + Vite)
├── tabib-clinic-server/         # Backend server (FastAPI)
└── README.md                   # This file
```

### 6c. Local Development Setup

```bash
# Backend
cd tabib-clinic-server
pip install -r requirements.txt
python main.py

# Frontend
cd frontend
npm install
npm run dev
```

### 6d. API Reference

<details>
<summary>Click to view the full API specification</summary>

All endpoints require JSON content-type. Authentication uses Bearer tokens.

#### Authentication
- `POST /api/auth/request-otp`: Request 6-digit code
- `POST /api/auth/verify-otp`: Exchange code for JWT token

#### Triage & Chat
- `POST /api/chat`: Submit symptoms for AI analysis
- `GET /api/queue-status`: Poll for AI completion

#### Clinic Management
- `GET /api/clinics`: Search nearby clinic servers
- `POST /api/notify-clinic`: Securely share report with clinic staff
- `GET /api/notifications`: Nurse dashboard feed

</details>

### 6e. Environment Variables

For security reasons, do not store actual keys in the repository. We have provided a template for all required configuration variables:

- **Backend**: See [`tabib-clinic-server/.env.example`](tabib-clinic-server/.env.example)
- **Frontend**: See `frontend/.env` (VITE_API_URL)

Copy the `.env.example` file to `.env` in the server directory and fill in your clinic's specific details.

---

## 🔒 Privacy & Data Protection

- **Local-Only Inference**: No medical data is sent to external AI providers.
- **On-Premise Storage**: Data stays on the clinic's hardware.
- **Zero-Knowledge**: The developers of Tabib have zero access to patient interactions.

---

<div align="center">

**Built for the Gemma 4 Good Hackathon.**

**Built with ❤️ for better healthcare access in Arabic-speaking communities**

</div>
