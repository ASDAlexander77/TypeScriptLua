echo =
echo ==================================
echo Building JS lib
echo ==================================
echo =
echo =

cd ..\experiments\jslib
node ../../__out/src/main.js -singleModule

cd ../..

@call npm run build-jslib-dts
copy "lib\JSLib.d.ts" "./test"

cd ./test

xcopy /Y ..\experiments\jslib\JS.lua .\
xcopy /Y ..\experiments\jslib\JS.lua.map .\
