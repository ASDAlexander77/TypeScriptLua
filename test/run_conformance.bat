FOR %%i IN (..\..\TypeScriptLua\spec\conformance\tests\*.lua) DO ..\__dist\lua.exe -e "require('./JS')" %%i
