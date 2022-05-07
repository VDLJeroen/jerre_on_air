@ECHO OFF
setlocal enabledelayedexpansion
color 0a

TITLE Jerre on Air
ECHO Launching Jerre on Air

start python ./backend/manage.py runserver
start npm start --prefix ./player

setlocal

set /a counter=0
set /a limit=150

:top

if !counter! lss !limit! (
echo %random% %random% %random% %random% %random% %random% %random% %random% %random% %random% %random% %random% %random% %random%
ping -n 0.25 500.0.0.1>nul
set /a counter=!counter!+1
goto :top
)

endlocal
got :eof