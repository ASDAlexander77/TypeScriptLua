function f(d)
	d[0] = 1
	d[1] = 2
	d["end"] = "hi"
end

print ('start.')

local s = "Hello String";
local f = 3.14
local i = 1

local a = {}
if a then
    local b = {}
    a["object b"] = b
    a["b"] = b
    a[0] = b
    a["value"] = 1

	b[0] = 1
	b[1] = 2
	b["end"] = "hi"

	a["end"] = "end"

	f(a)
end

if a then
	local c = {}
end

print ('done.')