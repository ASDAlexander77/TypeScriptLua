rmdir /S /Q  BABYLON
md BABYLON
echo Copying binary Lua files for BabylonJS
xcopy /S ..\..\thirdparty\Babylon.js\src\*.lua .\BABYLON\
xcopy /S ..\..\thirdparty\Babylon.js\src\*.lua.map .\BABYLON\

echo Copying source for Shaders
xcopy /S ..\..\thirdparty\Babylon.js\src\Shaders .\Shaders\

@call copy_js.bat
