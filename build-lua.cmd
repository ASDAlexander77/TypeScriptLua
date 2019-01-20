IF NOT EXIST __dist MKDIR __dist

IF "%VS150COMNTOOLS%" EQU "" set VS150COMNTOOLS=C:\Program Files (x86)\Microsoft Visual Studio\2017\Community\Common7\Tools\

rem Building Lua
cd thirdparty\lua-build\
@call build.cmd win64 Release
rem @call build.cmd Release
cd ..\..\..\..
