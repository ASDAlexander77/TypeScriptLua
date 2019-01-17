IF NOT EXIST __dist MKDIR __dist

echo on

rem Building Lua
cd thirdparty\lua-build\
@call build.cmd win64 Release
cd ..\..\..\..

rem Building GLEW
cd thirdparty\glew-build\
@call build.cmd win64 Release
cd ..\..\..\..

rem Building FreeGLUT
cd thirdparty\freeglut-build\
@call build.cmd win64 Release
cd ..\..\..\..

rem Building MoonGLUT
cd experiments\WebGLAdapter
@call build.cmd win64 Release
cd ..\..\..\..
