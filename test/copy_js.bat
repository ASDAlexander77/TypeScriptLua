echo =
echo ==================================
echo Building JS lib
echo ==================================
echo =
echo =

cd ..\experiments\jslib
node ../../__out/main.js -singleModule
cd ../../test

xcopy /Y ..\experiments\jslib\JS.lua .\
xcopy /Y ..\experiments\jslib\JS.lua.map .\
