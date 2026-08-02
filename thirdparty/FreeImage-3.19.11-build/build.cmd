IF "%VS150COMNTOOLS%" EQU "" set VS150COMNTOOLS=C:\Program Files\Microsoft Visual Studio\18\Professional\Common7\Tools\

IF "%1" EQU "Release" GOTO :set_release
IF "%2" EQU "Release" GOTO :set_release
SET Mode=Debug
GOTO :cont
:set_release
SET Mode=Release
:cont
IF "%1" NEQ "win64" GOTO :mingw32
cd ..\freeimage-3.19.11
@call cmake -B build -S . -DBUILD_SHARED_LIBS:BOOL=TRUE
cd build
if not defined DevEnvDir (@call "%VS150COMNTOOLS%\..\..\VC\Auxiliary\Build\vcvarsall.bat" x86_amd64)
"%VS150COMNTOOLS%\..\..\MSBuild\Current\Bin\MSBuild" FreeImage.slnx /m:8 /p:Configuration=%Mode% /p:Platform="x64"
IF "%Mode%" NEQ "Debug" GOTO :skip_debug_copy
copy %Mode%\freeimaged.dll ..\..\..\__dist\freeimaged.dll
copy %Mode%\freeimaged.dll ..\..\..\__dist\freeimage.dll
rem clean.bat
GOTO :end
:skip_debug_copy
copy %Mode%\freeimage.dll ..\..\..\__dist
rem clean.bat
cd %Mode%
GOTO :end
:mingw32
IF NOT EXIST __build MKDIR __build
cd __build
IF NOT EXIST mingw32 MKDIR mingw32
cd mingw32
cmake -Wno-dev ..\..\..\freeimage -G "MinGW Makefiles" -DCMAKE_BUILD_TYPE="%Mode%" -DCMAKE_POLICY_VERSION_MINIMUM=3.5
@call mingw32-make.exe
copy bin\libfreeimage.dll ..\..\..\..\__dist
:end