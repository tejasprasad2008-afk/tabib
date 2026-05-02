@echo off
REM Tabib Clinic Server - Windows Setup Script
REM This script sets up the complete clinic server environment

echo ==========================================
echo   Tabib Clinic Server Setup
echo ==========================================
echo.

REM Check Python version
echo Checking Python version...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed
    echo Please install Python 3.11 or higher from https://python.org
    pause
    exit /b 1
)

for /f "tokens=2" %%i in ('python --version') do set PYTHON_VERSION=%%i
echo Found Python %PYTHON_VERSION%

REM Check Ollama
echo.
echo Checking Ollama installation...
ollama --version >nul 2>&1
if errorlevel 1 (
    echo Ollama is not installed. Installing now...
    winget install Ollama.Ollama
    echo Ollama installed successfully
) else (
    echo Ollama is already installed
)

REM Pull Gemma 4 model
echo.
echo ==========================================
echo   IMPORTANT: Model Download
echo ==========================================
echo.
echo This will download the Gemma 4 E4B model (~2.3GB).
echo This may take 10-30 minutes depending on your internet speed.
echo.
pause

echo.
echo Downloading Gemma 4 E4B model...
ollama pull gemma4:e4b

echo Model downloaded successfully!

REM Create virtual environment
echo.
echo Creating Python virtual environment...
python -m venv venv

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install requirements
echo.
echo Installing Python dependencies...
pip install --upgrade pip
pip install -r requirements.txt

echo Dependencies installed successfully!

REM Generate random PIN
echo.
echo Generating clinic PIN...
set /a DASHBOARD_PIN=%random% * 9000 / 32768 + 100000
echo Your dashboard PIN is: %DASHBOARD_PIN%

REM Prompt for clinic information
echo.
echo ==========================================
echo   Clinic Information
echo ==========================================
echo.

set /p CLINIC_NAME="Clinic name: "
set /p CLINIC_CITY="City: "
set /p CLINIC_PHONE="Contact phone: "

REM Auto-detect location or prompt
echo.
set /p AUTO_DETECT="Auto-detect location? (y/n): "

if /i "%AUTO_DETECT%"=="y" (
    echo Detecting location...
    for /f "tokens=2 delims=," %%a in ('curl -s https://ipapi.co/json ^| findstr "latitude"') do set LATITUDE=%%a
    for /f "tokens=2 delims=," %%a in ('curl -s https://ipapi.co/json ^| findstr "longitude"') do set LONGITUDE=%%a
    set LATITUDE=%LATITUDE: =%
    set LONGITUDE=%LONGITUDE: =%
    echo Detected: %LATITUDE%, %LONGITUDE%
) else (
    set /p LATITUDE="Latitude: "
    set /p LONGITUDE="Longitude: "
)

REM Create .env file
echo.
echo Creating .env file...
(
    echo OLLAMA_URL=http://localhost:11434
    echo MODEL=gemma4:e4b
    echo OLLAMA_TIMEOUT=120
    echo REQUEST_TIMEOUT=300
    echo GEMMA_WORKERS=2
    echo DB_PATH=tabib_clinic.db
    echo DASHBOARD_PIN=%DASHBOARD_PIN%
    echo CLINIC_NAME=%CLINIC_NAME%
    echo CLINIC_CITY=%CLINIC_CITY%
    echo CLINIC_LAT=%LATITUDE%
    echo CLINIC_LNG=%LONGITUDE%
    echo CLINIC_PHONE=%CLINIC_PHONE%
    echo REGISTRY_URL=
) > .env

echo .env file created!

REM Get public IP
echo.
echo Getting public IP...
for /f %%i in ('curl -s ifconfig.me') do set PUBLIC_IP=%%i
set PUBLIC_URL=http://%PUBLIC_IP%:8000

echo.
echo ==========================================
echo   Setup Complete!
echo ==========================================
echo.
echo Clinic: %CLINIC_NAME%
echo Location: %CLINIC_CITY% (%LATITUDE%, %LONGITUDE%)
echo Dashboard PIN: %DASHBOARD_PIN%
echo.
echo Dashboard URL: http://localhost:8000/dashboard
echo Patient URL: %PUBLIC_URL%
echo.
echo To start the server:
echo   venv\Scripts\activate.bat
echo   uvicorn main:app --host 0.0.0.0 --port 8000
echo.
echo IMPORTANT: Make sure port 8000 is open in your firewall
echo            for patients to connect.
echo.

REM Ask if user wants to start server now
set /p START_SERVER="Start server now? (y/n): "

if /i "%START_SERVER%"=="y" (
    echo.
    echo Starting Tabib Clinic Server...
    echo Press Ctrl+C to stop
    echo.
    uvicorn main:app --host 0.0.0.0 --port 8000
)

pause
