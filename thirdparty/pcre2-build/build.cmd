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
cmake -Wno-dev -f ..\..\..\pcre2 -G "Visual Studio 15 2017 Win64" -DCMAKE_BUILD_TYPE=%Mode% -DPCRE_BUILD_PCRECPP=OFF -DPCRE_BUILD_PCREGREP=OFF -DBUILD_SHARED_LIBS=ON
if not defined DevEnvDir (@call "%VS150COMNTOOLS%\..\..\VC\Auxiliary\Build\vcvarsall.bat" x86_amd64)
"%VS150COMNTOOLS%\..\..\MSBuild\15.0\Bin\MSBuild" ALL_BUILD.vcxproj /m:8 /p:Configuration=%Mode% /p:Platform="x64"
IF "%Mode%" NEQ "Debug" GOTO :skip_debug_copy
copy %Mode%\pcre2-8d.dll ..\..\..\..\__dist\pcre2-8d.dll
copy %Mode%\pcre2-8d.dll ..\..\..\..\__dist\pcre2-8.dll
copy %Mode%\pcre2-posixd.dll ..\..\..\..\__dist\pcre2-posixd.dll
copy %Mode%\pcre2-posixd.dll ..\..\..\..\__dist\pcre2-posix.dll
GOTO :end
:skip_debug_copy
copy %Mode%\pcre2-8.dll ..\..\..\..\__dist
copy %Mode%\pcre2-posix.dll ..\..\..\..\__dist
GOTO :end
:mingw32
IF NOT EXIST __build MKDIR __build
cd __build
IF NOT EXIST mingw32 MKDIR mingw32
cd mingw32
cmake -Wno-dev -f ..\..\..\pcre2 -G "MinGW Makefiles" -DCMAKE_BUILD_TYPE="%Mode%" -DPCRE_BUILD_PCRECPP=OFF -DPCRE_BUILD_PCREGREP=OFF -DBUILD_SHARED_LIBS=ON
@call mingw32-make.exe
:end
