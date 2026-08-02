IF NOT EXIST __dist MKDIR __dist

IF "%VS150COMNTOOLS%" EQU "" set VS150COMNTOOLS=C:\Program Files\Microsoft Visual Studio\18\Professional\Common7\Tools\

echo on

rem Building Lua
cd thirdparty\lua-5.5.0-build\
@call build.cmd win64 Debug
cd ..\..\..\..

rem Building GLEW
cd thirdparty\glew-build\
@call build.cmd win64 Debug
cd ..\..\..\..

rem Building FreeGLUT
cd thirdparty\freeglut-build\
@call build.cmd win64 Debug
cd ..\..\..\..

rem Building Pcre2
cd thirdparty\pcre2-build\
@call build.cmd win64 Debug
cd ..\..\..\..

rem Building Array Adapter
cd experiments\ArrayBufferAdapter
@call build.cmd win64 Debug
cd ..\..\..\..

rem Building RegExp Adapter
cd experiments\Pcre2Adapter
@call build.cmd win64 Debug
cd ..\..\..\..

rem Building GLUT
cd experiments\WebGLAdapter
@call build.cmd win64 Debug
cd ..\..\..\..

rem Building FreeImagr
cd thirdparty\freeimage-3.19.11-build\
@call build.cmd win64 Release
cd ..\..\..\..

rem Building FreeImage Adapter
cd experiments\FreeImageAdapter
@call build.cmd win64 Debug
cd ..\..\..\..
