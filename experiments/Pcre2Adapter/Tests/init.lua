pcre2 = require("pcre2adapter")

local nativeHandle = pcre2.regcomp("a.+?d", 0);

local result = pcre2.regexec(nativeHandle, "asd assssd assd");

print (result);

local result2 = pcre2.regexec(nativeHandle, "xxx xxx xxx");

print (result2);