pcre2 = require("pcre2adapter")

local nativeHandle = pcre2.regcomp("((a)(.+?)(d))", 0);

local result = pcre2.regtest(nativeHandle, "asd assssd assd");

print (result);

local result2 = pcre2.regtest(nativeHandle, "xxx xxx xxx");

print (result2);

local result3 = pcre2.regexec(nativeHandle, "asd assssd assd");

for k,v in pairs(result3) do
print (k,v);
end
