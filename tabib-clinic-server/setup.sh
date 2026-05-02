#!/bin/bash

# Tabib Clinic Server - Linux/Mac Setup Script
# This script sets up the complete clinic server environment

set -e

echo "=========================================="
echo "  Tabib Clinic Server Setup"
echo "=========================================="
echo ""

# Check Python version
echo "Checking Python version..."
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is not installed"
    echo "Please install Python 3.11 or higher"
    exit 1
fi

PYTHON_VERSION=$(python3 --version | awk '{print $2}')
echo "Found Python $PYTHON_VERSION"

# Check if Python version is 3.11+
PYTHON_MAJOR=$(echo $PYTHON_VERSION | cut -d. -f1)
PYTHON_MINOR=$(echo $PYTHON_VERSION | cut -d. -f2)

if [ "$PYTHON_MAJOR" -lt 3 ] || ([ "$PYTHON_MAJOR" -eq 3 ] && [ "$PYTHON_MINOR" -lt 11 ]); then
    echo "WARNING: Python 3.11+ is recommended. Found $PYTHON_VERSION"
fi

# Check Ollama
echo ""
echo "Checking Ollama installation..."
if ! command -v ollama &> /dev/null; then
    echo "Ollama is not installed. Installing now..."
    curl -fsSL https://ollama.com/install.sh | sh
    echo "Ollama installed successfully"
else
    echo "Ollama is already installed"
fi

# Pull Gemma 4 model
echo ""
echo "=========================================="
echo "  IMPORTANT: Model Download"
echo "=========================================="
echo ""
echo "This will download the Gemma 4 E4B model (~2.3GB)."
echo "This may take 10-30 minutes depending on your internet speed."
echo ""
read -p "Press Enter to continue or Ctrl+C to cancel..."

echo ""
echo "Downloading Gemma 4 E4B model..."
ollama pull gemma4:e4b

echo "Model downloaded successfully!"

# Create virtual environment
echo ""
echo "Creating Python virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install requirements
echo ""
echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "Dependencies installed successfully!"

# Generate random PIN
echo ""
echo "Generating clinic PIN..."
DASHBOARD_PIN=$(shuf -i 100000-999999 -n 1)
echo "Your dashboard PIN is: $DASHBOARD_PIN"

# Prompt for clinic information
echo ""
echo "=========================================="
echo "  Clinic Information"
echo "=========================================="
echo ""

read -p "Clinic name: " CLINIC_NAME
read -p "City: " CLINIC_CITY
read -p "Contact phone: " CLINIC_PHONE

# Auto-detect location or prompt
echo ""
read -p "Auto-detect location? (y/n): " AUTO_DETECT

if [ "$AUTO_DETECT" = "y" ] || [ "$AUTO_DETECT" = "Y" ]; then
    echo "Detecting location..."
    LOCATION=$(curl -s https://ipapi.co/json/)
    LATITUDE=$(echo $LOCATION | python3 -c "import sys, json; print(json.load(sys.stdin).get('latitude', 0))")
    LONGITUDE=$(echo $LOCATION | python3 -c "import sys, json; print(json.load(sys.stdin).get('longitude', 0))")
    echo "Detected: $LATITUDE, $LONGITUDE"
else
    read -p "Latitude: " LATITUDE
    read -p "Longitude: " LONGITUDE
fi

# Create .env file
echo ""
echo "Creating .env file..."
cat > .env << EOF
OLLAMA_URL=http://localhost:11434
MODEL=gemma4:e4b
OLLAMA_TIMEOUT=120
REQUEST_TIMEOUT=300
GEMMA_WORKERS=2
DB_PATH=tabib_clinic.db
DASHBOARD_PIN=$DASHBOARD_PIN
CLINIC_NAME=$CLINIC_NAME
CLINIC_CITY=$CLINIC_CITY
CLINIC_LAT=$LATITUDE
CLINIC_LNG=$LONGITUDE
CLINIC_PHONE=$CLINIC_PHONE
REGISTRY_URL=
EOF

echo ".env file created!"

# Get public IP
echo ""
echo "Getting public IP..."
PUBLIC_IP=$(curl -s ifconfig.me)
PUBLIC_URL="http://$PUBLIC_IP:8000"

# Register clinic in local registry
echo ""
echo "Registering clinic in local discovery registry..."
python3 - << PYEOF
import json, os
from datetime import datetime

registry_path = "clinics_registry.json"
try:
    if os.path.exists(registry_path):
        with open(registry_path) as f:
            registry = json.load(f)
    else:
        registry = {}
except Exception as e:
    print(f"Error loading registry: {e}")
    registry = {}

clinic_id = "clinic_$(date +%s)"
registry[clinic_id] = {
    "id": clinic_id,
    "name": "$CLINIC_NAME",
    "city": "$CLINIC_CITY",
    "lat": $LATITUDE,
    "lng": $LONGITUDE,
    "phone": "$CLINIC_PHONE",
    "public_url": "$PUBLIC_URL",
    "registered_at": str(datetime.now())
}

with open(registry_path, "w") as f:
    json.dump(registry, f, indent=2)
print("Clinic registered successfully.")
PYEOF

# Sync registry to frontend if frontend exists
FRONTEND_REGISTRY="../frontend/public/clinics_registry.json"
if [ -d "../frontend/public" ]; then
    cp clinics_registry.json "$FRONTEND_REGISTRY"
    echo "Registry synced to frontend."
fi

echo ""
echo "=========================================="
echo "  Setup Complete!"
echo "=========================================="
echo ""
echo "Clinic: $CLINIC_NAME"
echo "Location: $CLINIC_CITY ($LATITUDE, $LONGITUDE)"
echo "Dashboard PIN: $DASHBOARD_PIN"
echo ""
echo "Dashboard URL: http://localhost:8000/dashboard"
echo "Patient URL: $PUBLIC_URL"
echo ""
echo "To start the server:"
echo "  source venv/bin/activate"
echo "  uvicorn main:app --host 0.0.0.0 --port 8000"
echo ""
echo "IMPORTANT: Make sure port 8000 is open in your firewall"
echo "           for patients to connect."
echo ""

# Attempt to set static local IP
echo "Setting static local IP for reliable patient connections..."
INTERFACE=$(ip route | grep default | awk '{print $5}' | head -1)
CURRENT_IP=$(hostname -I | awk '{print $1}')
echo "Network interface: $INTERFACE"
echo "Current local IP: $CURRENT_IP"
echo ""
echo "To make this IP permanent (recommended), run:"
echo "  sudo nmcli con mod \$(nmcli -g NAME con show --active) ipv4.addresses $CURRENT_IP/24 ipv4.method manual"
echo "  sudo nmcli con up \$(nmcli -g NAME con show --active)"
echo ""
echo "Or add a DHCP reservation in your router settings for MAC address:"
ip link show $INTERFACE | grep ether | awk '{print $2}'
echo ""

# Create systemd service for auto-start on boot
echo "Setting up auto-start service..."
sudo tee /etc/systemd/system/tabib-clinic.service > /dev/null << SYSTEMD
[Unit]
Description=Tabib Clinic Server
After=network.target ollama.service

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)
ExecStart=$(pwd)/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
SYSTEMD

sudo systemctl daemon-reload
sudo systemctl enable tabib-clinic
sudo systemctl start tabib-clinic
echo "Service started and enabled on boot."
echo ""

# Ask if user wants to start server now
read -p "Start server now? (y/n): " START_SERVER

if [ "$START_SERVER" = "y" ] || [ "$START_SERVER" = "Y" ]; then
    echo ""
    echo "Starting Tabib Clinic Server..."
    echo "Press Ctrl+C to stop"
    echo ""
    uvicorn main:app --host 0.0.0.0 --port 8000
fi
