IF NOT EXIST __dist MKDIR __dist

IF "%VS150COMNTOOLS%" EQU "" set VS150COMNTOOLS=C:\Program Files (x86)\Microsoft Visual Studio\2017\Community\Common7\Tools\

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

rem Building Array Adapter
cd experiments\ArrayBufferAdapter
@call build.cmd win64 Release
cd ..\..\..\..

rem Building RegExp Adapter
cd experiments\Pcre2Adapter
@call build.cmd win64 Release
cd ..\..\..\..

rem Building GLUT
cd experiments\WebGLAdapter
@call build.cmd win64 Release
cd ..\..\..\..
