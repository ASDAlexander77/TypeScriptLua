IF "%VS150COMNTOOLS%" EQU "" set VS150COMNTOOLS=C:\Program Files\Microsoft Visual Studio\18\Professional\Common7\Tools\

IF "%1" EQU "Release" GOTO :set_release
IF "%2" EQU "Release" GOTO :set_release
SET Mode=Debug
GOTO :cont
:set_release
SET Mode=Release
:cont
IF "%1" NEQ "win64" GOTO :mingw32
cd ..\glew-2.2.0\build\cmake
@call cmake -B build -S . -DCMAKE_POLICY_VERSION_MINIMUM=3.5
cd build
if not defined DevEnvDir (@call "%VS150COMNTOOLS%\..\..\VC\Auxiliary\Build\vcvarsall.bat" x86_amd64)
"%VS150COMNTOOLS%\..\..\MSBuild\Current\Bin\MSBuild" glew.slnx /m:8 /p:Configuration=%Mode% /p:Platform="x64"
IF "%Mode%" NEQ "Debug" GOTO :skip_debug_copy
copy bin\%Mode%\glew32d.dll ..\..\..\..\..\__dist\glew32d.dll
copy bin\%Mode%\glew32d.dll ..\..\..\..\..\__dist\glew32.dll
:skip_debug_copy
copy bin\%Mode%\glew32.dll ..\..\..\..\..\__dist
cd ..
GOTO :end
:mingw32
IF NOT EXIST __build MKDIR __build
cd __build
IF NOT EXIST mingw32 MKDIR mingw32
cd mingw32
cmake -Wno-dev ..\..\..\glew-2.2.0\build\cmake -G "MinGW Makefiles" -DCMAKE_BUILD_TYPE="%Mode%" -DCMAKE_POLICY_VERSION_MINIMUM=3.5
@call mingw32-make
copy bin\glew32.dll ..\..\..\..\__dist
:end