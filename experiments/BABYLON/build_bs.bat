rem called by full path - a bare 'call clean_bs.bat' resolves via PATH, which does not
rem include the current directory on every machine, and a silent clean failure here leaves
rem stale .lua behind for the xcopy below
@call "%~dp0clean_bs.bat" .\BABYLON
@call "%~dp0clean_bs.bat" ..\..\thirdparty\Babylon.js\src

echo =
echo ==================================
echo Building Babylon.JS
echo ==================================
echo =
echo =

rem thirdparty\Babylon.js is re-downloaded from scratch, so its tsconfig lives here
rem and is installed on every build - it is what pulls window.d.ts/canvas.d.ts/image.d.ts
rem into the library compile
copy /Y tsconfig.babylonjs.json ..\..\thirdparty\Babylon.js\src\tsconfig.json

cd ..\..\thirdparty\Babylon.js\src
node ../../../__out/src/main.js -jslib -varAsLet

rmdir /S /Q  BABYLON
md BABYLON
echo =
echo ==================================
echo Copying binary Lua files for BabylonJS
echo ==================================
echo =
echo =

cd ..\..\..\experiments\BABYLON
rem /Y matters: without it xcopy prompts 'Overwrite?' for any file the clean above missed,
rem and a non-interactive run answers EOF and copies nothing - deploying a stale BABYLON\
xcopy /S /Y ..\..\thirdparty\Babylon.js\src\*.lua .\BABYLON\
xcopy /S /Y ..\..\thirdparty\Babylon.js\src\*.lua.map .\BABYLON\

cd
rmdir /S /Q Shaders
md Shaders
echo =
echo ==================================
echo Copying source for Shaders
echo ==================================
echo =
echo =

xcopy /S /Y ..\..\thirdparty\Babylon.js\src\Shaders .\Shaders\

rem echo ==================================
rem echo Copying JSLib
rem echo ==================================
@call "%~dp0copy_js.bat"

echo =
echo ==================================
echo Building Babylon.JS Client
echo ==================================
echo =
echo =

node ../../__out/src/main.js -jslib -varAsLet
