@echo off
echo ====================================================
echo Starting Postify Studio Development Environment
echo ====================================================

echo Checking for .env files...

REM Check if backend .env file exists
IF NOT EXIST "d:\postify-studio-project\backend\.env" (
  echo Creating backend .env file with required settings...
  echo JWT_SECRET=postify-studio-jwt-secret-dev-123456789 > "d:\postify-studio-project\backend\.env"
  echo MONGO_URI=mongodb://localhost:27017/postify-studio >> "d:\postify-studio-project\backend\.env"
  echo PORT=5000 >> "d:\postify-studio-project\backend\.env"
  echo NODE_ENV=development >> "d:\postify-studio-project\backend\.env"
)

REM Check if frontend .env file exists
IF NOT EXIST "d:\postify-studio-project\frontend\.env" (
  echo Creating frontend .env file with required settings...
  echo VITE_API_URL=http://localhost:5000/api > "d:\postify-studio-project\frontend\.env"
)

echo Starting Postify Studio Backend...
cd /d "d:\postify-studio-project\backend"
start "Backend Server" cmd /k "npm start"

echo Waiting for backend to start...
timeout /t 5

echo Starting Postify Studio Frontend...
cd /d "d:\postify-studio-project\frontend"
start "Frontend Server" cmd /k "npm run dev"

echo ====================================================
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173 (Vite default)
echo ====================================================
echo.
echo Press any key to close this window (servers will continue running)
pause
