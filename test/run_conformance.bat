FOR %%i IN (..\spec\conformance\tests\*.lua) DO ..\__dist\lua.exe -e "require('./JS')" %%i
