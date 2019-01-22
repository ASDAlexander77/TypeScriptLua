del "packages\tsc-lua\lib\*.js"
del "packages\tsc-lua\lib\*.js.map"

del "packages\tsc-lua\*.lua"
del "packages\tsc-lua\*.lua.map"

@call tsc -p ./
copy __out\*.js "packages\tsc-lua\lib"
copy __out\*.js.map "packages\tsc-lua\lib"

cd experiments\jslib
node ../../__out/main.js -singleModule

copy *.lua "..\..\packages\tsc-lua\"
copy *.lua.map "..\..\packages\tsc-lua\"

cd ..\..