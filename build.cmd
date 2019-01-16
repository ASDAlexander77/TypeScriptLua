IF NOT EXIST __dist MKDIR __dist
cd thirdparty\lua-build\
rem build.cmd win64 Release
@call build.cmd Release
cd ..\..\..\..
cd thirdparty\moongl-build\
rem build.cmd win64 Release
@call build.cmd Release
cd ..\..\..\..
