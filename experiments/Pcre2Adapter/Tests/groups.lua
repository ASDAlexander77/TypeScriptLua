pcre2 = require("pcre2adapter")

local nativeHandle = pcre2.regcomp("(a)(s)(d)", 0);

local result3 = pcre2.regexec(nativeHandle, "asd");
for k,v in pairs(result3) do
print (k,v);
end
