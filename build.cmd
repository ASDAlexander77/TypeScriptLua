if "%1" NEQ "win64" goto :mingw32
IF NOT EXIST __build MKDIR __build
cd __build
IF NOT EXIST win64 MKDIR win64
cd win64
cmake -f ../.. -G "Visual Studio 15 2017 Win64"
goto :end
:mingw32
IF NOT EXIST __build MKDIR __build
cd __build
IF NOT EXIST mingw32 MKDIR mingw32
cd mingw32
cmake -f ../.. -G "MinGW Makefiles"
mingw32-make.exe
:end