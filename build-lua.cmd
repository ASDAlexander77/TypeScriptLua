IF NOT EXIST __dist MKDIR __dist

rem Building Lua
cd thirdparty\lua-build\
@call build.cmd win64 Release
rem @call build.cmd Release
cd ..\..\..\..
