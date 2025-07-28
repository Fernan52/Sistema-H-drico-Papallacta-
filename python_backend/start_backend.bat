@echo off
echo 🐍 Iniciando Backend Python para Modelo ARIMA...
echo.

REM Verificar si Python está instalado
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python no está instalado o no está en el PATH
    echo Por favor instale Python 3.8 o superior
    pause
    exit /b 1
)

REM Crear entorno virtual si no existe
if not exist "venv" (
    echo 📦 Creando entorno virtual...
    python -m venv venv
)

REM Activar entorno virtual
echo 🔄 Activando entorno virtual...
call venv\Scripts\activate.bat

REM Instalar dependencias
echo 📚 Instalando dependencias...
pip install -r requirements.txt

REM Verificar que el modelo existe
if not exist "..\modelo_arima_best.pkl" (
    echo ⚠️  ADVERTENCIA: No se encontró el archivo modelo_arima_best.pkl
    echo El archivo debe estar en la carpeta raíz del proyecto
    echo.
)

REM Ejecutar la aplicación
echo 🚀 Iniciando servidor Flask...
echo.
echo 📡 Backend disponible en: http://127.0.0.1:5000
echo 🔬 Modelo ARIMA: modelo_arima_best.pkl
echo.
python app.py

pause
