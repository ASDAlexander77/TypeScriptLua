pcre2 = require("pcre2adapter")

local nativeHandle = pcre2adapter.regcomp("a.+?d", 0);

local result = pcre2adapter.regexec(nativeHandle, "asd assssd assd");

print (result);