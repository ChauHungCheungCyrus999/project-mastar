@echo off
echo Starting Project Mastar servers...
echo.

echo Starting backend server...
start "Backend Server" cmd /k "cd server && npm start"

echo Starting frontend server...
start "Frontend Server" cmd /k "cd client && npm start"

echo.
echo Both servers are starting in separate windows.
echo Close the windows to stop the servers.
pause
