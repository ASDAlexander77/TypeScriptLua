rmdir /S /Q  BABYLON
md BABYLON
xcopy /S ..\..\thirdparty\Babylon.js\src\*.lua .\BABYLON\
xcopy /S ..\..\thirdparty\Babylon.js\src\*.lua.map .\BABYLON\


xcopy /Y ..\jslib\JS.lua .\
xcopy /Y ..\jslib\JS.lua.map .\
