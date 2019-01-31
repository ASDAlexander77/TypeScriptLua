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
for /d %%x in (%fld%\*) do @call clean_bs.bat %%x