echo =
echo ==================================
echo Building JS lib
echo ==================================
echo =
echo =

cd ..\..\..\experiments\jslib
node ../../__out/main.js -singleModule
cd ../BABYLON

xcopy /Y ..\jslib\JS.lua .\
xcopy /Y ..\jslib\JS.lua.map .\
