if exist packages goto :skip 
md packages
:skip
cd packages
if exist tsc-lua goto :skip2
md tsc-lua
:skip2
cd tsc-lua
if exist lib goto :skip3
md lib
:skip3

cd ..\..


del "packages\tsc-lua\lib\*.js"
del "packages\tsc-lua\lib\*.js.map"

del "packages\tsc-lua\*.lua"
del "packages\tsc-lua\*.lua.map"

@call tsc -p ./
copy __out\src\*.js "packages\tsc-lua\lib"
copy __out\src\*.js.map "packages\tsc-lua\lib"

cd experiments\jslib
node ../../__out/src/main.js -singleModule

copy *.lua "..\..\packages\tsc-lua\"
copy *.lua.map "..\..\packages\tsc-lua\"

cd ..\..

@call npm run build-jslib-dts
copy "lib\JSLib.d.ts" "packages\tsc-lua\"