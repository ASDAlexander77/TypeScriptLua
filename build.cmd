IF "%2" EQU "Release" GOTO :set_release
SET Mode=Debug
GOTO :cont
:set_release
SET Mode=Release
:cont
IF "%1" NEQ "win64" GOTO :mingw32
IF NOT EXIST __build MKDIR __build
cd __build
IF NOT EXIST win64 MKDIR win64
cd win64
cmake -f ../.. -G "Visual Studio 15 2017 Win64"
GOTO :end
:mingw32
IF NOT EXIST __build MKDIR __build
cd __build
IF NOT EXIST mingw32 MKDIR mingw32
cd mingw32
cmake -f ../.. -G "MinGW Makefiles" -DCMAKE_BUILD_TYPE="%Mode%"
mingw32-make.exe
:end