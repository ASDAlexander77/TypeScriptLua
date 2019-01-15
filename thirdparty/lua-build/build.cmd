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
cmake -Wno-dev -f ../../thirdparty/lua-build/ -G "Visual Studio 15 2017 Win64"
"C:\Program Files (x86)\Microsoft Visual Studio\2017\Community\VC\Auxiliary\Build\vcvarsall.bat" amd64_arm uwp -vcvars_ver=14.10
MSBuild ALL_BUILD.vcxproj /m:8 /p:Configuration=Release /p:Platform="Win32" /toolsversion:14.0
GOTO :end
:mingw32
IF NOT EXIST __build MKDIR __build
cd __build
IF NOT EXIST mingw32 MKDIR mingw32
cd mingw32
cmake -Wno-dev -f ../../thirdparty/lua-build/ -G "MinGW Makefiles" -DCMAKE_BUILD_TYPE="%Mode%"
mingw32-make.exe
:end