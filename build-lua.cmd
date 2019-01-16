IF NOT EXIST __dist MKDIR __dist

rem Building Lua
cd thirdparty\lua-build\
rem build.cmd win64 Release
@call build.cmd Release
cd ..\..\..\..
