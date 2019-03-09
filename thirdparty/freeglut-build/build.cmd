IF "%VS150COMNTOOLS%" EQU "" set VS150COMNTOOLS=C:\Program Files (x86)\Microsoft Visual Studio\2017\Community\Common7\Tools\

IF "%1" EQU "Release" GOTO :set_release
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
cmake -Wno-dev -f ..\..\..\freeglut-3.0.0 -G "Visual Studio 15 2017 Win64" -DCMAKE_BUILD_TYPE=%Mode%
if not defined DevEnvDir (@call "%VS150COMNTOOLS%\..\..\VC\Auxiliary\Build\vcvarsall.bat" x86_amd64)
"%VS150COMNTOOLS%\..\..\MSBuild\15.0\Bin\MSBuild" ALL_BUILD.vcxproj /m:8 /p:Configuration=%Mode% /p:Platform="x64"
IF "%Mode%" NEQ "Debug" GOTO :skip_debug_copy
copy bin\%Mode%\freeglutd.dll ..\..\..\..\__dist\freeglutd.dll
copy bin\%Mode%\freeglutd.dll ..\..\..\..\__dist\freeglut.dll
GOTO :end
:skip_debug_copy
copy bin\%Mode%\freeglut.dll ..\..\..\..\__dist
GOTO :end
:mingw32
IF NOT EXIST __build MKDIR __build
cd __build
IF NOT EXIST mingw32 MKDIR mingw32
cd mingw32
cmake -Wno-dev -f ..\..\..\freeglut-3.0.0 -DCMAKE_INSTALL_PREFIX=/freeglut -G "MinGW Makefiles" -DCMAKE_BUILD_TYPE="%Mode%"
@call mingw32-make.exe
copy bin\libfreeglut.dll ..\..\..\..\__dist
:end