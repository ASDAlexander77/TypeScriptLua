@echo off
set fld=%1
IF "%1" EQU "" GOTO :set
GOTO :start
:set
set fld=..\..\thirdparty\Babylon.js\src
:start
echo Deleting files in %fld%
del /q %fld%\*.lua
del /q %fld%\*.lua.map
rem by full path, so the recursion does not depend on the current directory being on PATH
for /d %%x in (%fld%\*) do @call "%~dp0clean_bs.bat" %%x