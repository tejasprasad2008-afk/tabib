# Tabib Clinic Server

## Quick Demo Start

### Backend
```bash
cd tabib-clinic-server
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd frontend
npm run dev
```

---

A standalone Python application that clinics install on their own Windows or Linux PC/laptop. It runs Gemma 4 locally via Ollama and serves as the AI backend for all patient Tabib apps within ~20km.

## What This Is

Tabib Clinic Server is a local medical triage system powered by Gemma 4. Clinics install it on their own hardware to provide AI-powered health guidance to patients in their area, completely offline after initial setup.

## System Requirements

- **OS**: Windows 10/11 or Ubuntu 20.04+ (or macOS 11+)
- **RAM**: 16GB recommended (minimum 12GB)
- **Disk**: 50GB free space (for Gemma 4 26B model)
- **Internet**: Required for initial setup only
- **Python**: 3.11 or higher

## Quick Start

### Linux/Mac

```bash
# Make setup script executable
chmod +x setup.sh

# Run setup
./setup.sh
```

### Windows

```bash
# Run setup
setup.bat
```

The setup script will:
1. Check and install Ollama if needed
2. Download Gemma 4 26B model (~18GB)
3. Create Python virtual environment
4. Install all dependencies
5. Prompt for clinic information
6. Generate dashboard PIN
7. Start the server

## Manual Setup

If you prefer manual setup:

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh  # Linux/Mac
winget install Ollama.Ollama  # Windows

# Pull model
ollama pull gemma4:26b

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate.bat  # Windows

# Install dependencies
pip install -r requirements.txt

# Create .env file (see .env.example)
cp .env.example .env
# Edit .env with your settings

# Start server
uvicorn main:app --host 0.0.0.0 --port 8000
```

## How Patients Connect

Patients need your server's public IP or domain name to connect:

1. **Find your public IP**:
   ```bash
   curl ifconfig.me
   ```

2. **Patients use**: `http://YOUR_PUBLIC_IP:8000`

3. **Or use a domain**:
   - Get a domain (e.g., clinic.example.com)
   - Point it to your public IP
   - Patients use: `http://clinic.example.com:8000`

## API Endpoints

### Health Check
```bash
GET /health
```

Returns server status, Ollama status, queue depth, and clinic info.

### Get Nearby Clinics
```bash
GET /api/clinics?lat=24.7136&lon=46.6753&radius=20
```

Returns list of clinics within 20km of given coordinates.

### Request OTP
```bash
POST /api/auth/request-otp
Content-Type: application/x-www-form-urlencoded

phone=+9665XXXXXXXX
```

For demo: OTP is always "123456".

### Verify OTP
```bash
POST /api/auth/verify-otp
Content-Type: application/x-www-form-urlencoded

phone=+9665XXXXXXXX&code=123456
```

Returns token and patient_id.

### Submit Chat
```bash
POST /api/chat
Content-Type: application/json
Authorization: Bearer {token}

{
  "message": "I have chest pain",
  "image_base64": "..."  // optional
}
```

Returns request_id and queue_position.

### Check Queue Status
```bash
GET /api/queue-status?request_id={request_id}
Authorization: Bearer {token}
```

Returns status, position, and response when done.

### Notify Clinic
```bash
POST /api/notify-clinic
Content-Type: application/json
Authorization: Bearer {token}

{
  "session_id": "...",
  "patient_phone": "+9665XXXXXXXX",
  "patient_name": "John Doe",  // optional
  "consent_given": true
}
```

Notifies clinic dashboard about patient session.

### Get Notifications
```bash
GET /api/notifications?limit=50&filter_status=pending&urgency_filter=emergency
```

Returns notifications for nurse dashboard.

### Mark Callback
```bash
POST /api/notifications/{notification_id}/callback
```

Marks notification as called back.

### Dashboard
```bash
GET /dashboard
```

Serves nurse dashboard HTML.

### WebSocket
```bash
WS /ws/dashboard
```

Real-time updates for nurse dashboard.

## Nurse Dashboard

Access the dashboard at `http://localhost:8000/dashboard` with your PIN.

Features:
- Real-time notification updates
- Color-coded urgency levels
- Patient phone numbers
- Clinical summaries
- Mark as called back
- Filter by status/urgency
- Audio ping for new emergencies

## Updating the Model

To update to a newer Gemma 4 model:

```bash
# Stop the server
# Pull new model
ollama pull gemma4:26b

# Update .env
MODEL=gemma4:26b

# Restart server
uvicorn main:app --host 0.0.0.0 --port 8000
```

## Troubleshooting

### Ollama Not Starting

```bash
# Check if Ollama is running
ps aux | grep ollama

# Start Ollama
ollama serve

# Check logs
ollama logs
```

### Port 8000 Already in Use

```bash
# Find process using port 8000
lsof -i :8000  # Linux/Mac
netstat -ano | findstr :8000  # Windows

# Kill process
kill -9 <PID>  # Linux/Mac
taskkill /PID <PID> /F  # Windows
```

### Model Download Interrupted

```bash
# Remove partial download
ollama rm gemma4:26b

# Re-download
ollama pull gemma4:26b
```

### Patients Can't Connect

1. **Check firewall**:
   ```bash
   # Linux (ufw)
   sudo ufw allow 8000/tcp

   # Windows Firewall
   # Add inbound rule for port 8000
   ```

2. **Check if server is listening**:
   ```bash
   netstat -an | grep 8000
   ```

3. **Test from external network**:
   ```bash
   curl http://YOUR_PUBLIC_IP:8000/health
   ```

### Database Issues

```bash
# Reset database (WARNING: deletes all data)
rm tabib_clinic.db

# Database will be recreated on next start
```

## Production Deployment

For production use:

### Get a Domain

1. Buy a domain (e.g., Namecheap, GoDaddy)
2. Point DNS A record to your public IP
3. Use domain instead of IP

### SSL Certificate (Let's Encrypt)

```bash
# Install certbot
sudo apt install certbot  # Ubuntu/Debian

# Get certificate
sudo certbot certonly --standalone -d clinic.example.com

# Configure server to use SSL
# Update uvicorn command with SSL options
uvicorn main:app --host 0.0.0.0 --port 8000 \
  --ssl-keyfile /etc/letsencrypt/live/clinic.example.com/privkey.pem \
  --ssl-certfile /etc/letsencrypt/live/clinic.example.com/fullchain.pem
```

### Systemd Service (Linux)

Create `/etc/systemd/system/tabib-clinic.service`:

```ini
[Unit]
Description=Tabib Clinic Server
After=network.target

[Service]
Type=simple
User=clinic
WorkingDirectory=/home/clinic/tabib-clinic-server
Environment="PATH=/home/clinic/tabib-clinic-server/venv/bin"
ExecStart=/home/clinic/tabib-clinic-server/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl enable tabib-clinic
sudo systemctl start tabib-clinic
sudo systemctl status tabib-clinic
```

### Windows Service

Use NSSM (Non-Sucking Service Manager):

```bash
# Download NSSM
# https://nssm.cc/download

# Install service
nssm install TabibClinic "C:\path\to\venv\Scripts\uvicorn.exe" "main:app" "--host" "0.0.0.0" "--port" "8000"

# Start service
nssm start TabibClinic
```

## Security Notes

- **Dashboard PIN**: Change the default PIN in production
- **Firewall**: Only open necessary ports
- **SSL**: Use HTTPS in production
- **Updates**: Keep dependencies updated
- **Backups**: Regular database backups

## License

CC-BY 4.0 — Open source as required by Gemma 4 Good Hackathon

## Support

For issues or questions:
- Check troubleshooting section
- Review logs in terminal
- Check Ollama logs: `ollama logs`

## Acknowledgments

Built for the Gemma 4 Good Hackathon by Kaggle and Google.
Powered by Gemma 4 26B model via Ollama.
