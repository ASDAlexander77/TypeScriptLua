@call clean_bs.bat

echo =
echo ==================================
echo Building Babylon.JS
echo ==================================
echo =
echo =

cd ..\..\thirdparty\Babylon.js\src
node ../../../__out/main.js

echo =
echo ==================================
echo Building JS lib
echo ==================================
echo =
echo =

cd ..\..\..\experiments\jslib
node ../../__out/main.js -singleModule
cd ../BABYLON

rmdir /S /Q  BABYLON
md BABYLON
echo =
echo ==================================
echo Copying binary Lua files for BabylonJS
echo ==================================
echo =
echo =

xcopy /S ..\..\thirdparty\Babylon.js\src\*.lua .\BABYLON\
xcopy /S ..\..\thirdparty\Babylon.js\src\*.lua.map .\BABYLON\

rmdir /S /Q Shaders
md Shaders
echo =
echo ==================================
echo Copying source for Shaders
echo ==================================
echo =
echo =

xcopy /S /Y ..\..\thirdparty\Babylon.js\src\Shaders .\Shaders\

@call copy_js.bat

node ../../__out/main.js
