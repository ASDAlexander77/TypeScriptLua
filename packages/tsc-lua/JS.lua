__type = __type or type
__is_true = __is_true or function (inst)
    if inst == false or inst == nil or inst == 0 or inst == undefined then 
        return false
    end
    return true
end

__not = __not or function (left)
    return (function () if __is_true(__is_true(left)) then return false else return true end end)()
end

__void = __void or function (left)
    return undefined
end

___type = ___type or function (inst)
    local tp = __type(inst)

    return (function () if __is_true(tp == "table") then return "object" else return tp end end)()
end

__instanceof = __instanceof or function (inst, type)
    if inst == nil then 
        return false
    end
    local mt = undefined

    local op1984 = __type(inst)
    if op1984 == "table" then
        mt = rawget(inst, "__proto")
    elseif op1984 == "number" then
        mt = Number
    elseif op1984 == "string" then
        mt = String
    elseif op1984 == "boolean" then
        mt = Boolean
    end
    while not(mt == nil) do
        if mt == type then 
            return true
        end
        mt = rawget(mt, "__proto")
    end
    return false
end

__equals = __equals or function (l, r)
    if l == r then 
        return true
    end
    if l == nil and r == undefined or r == nil and l == undefined then 
        return true
    end
    return false
end

__comma = __comma or function (l, r)
    return r
end

__tostring = __tostring or function (v)
    if v == nil or v == undefined then 
        return v
    end
    return tostring(v)
end

__get_call_undefined__ = __get_call_undefined__ or function (t, k)
    local get_ = rawget(t, "__get__")

    local getmethod = get_ and rawget(get_, k)

    if not(getmethod == nil) then 
        return getmethod(t)
    end
    local nullsHolder = rawget(t, "__nulls")

    if nullsHolder and rawget(nullsHolder, k) then 
        return nil
    end
    local proto = rawget(t, "__proto")

    while not(proto == nil) do
        local v = rawget(proto, k)

        if not(v == nil) then 
            return v
        end
        get_ = rawget(proto, "__get__")
        getmethod = get_ and rawget(get_, k)
        if not(getmethod == nil) then 
            return getmethod(t)
        end
        proto = rawget(proto, "__proto")
    end
    return undefined
end

__set_call_undefined__ = __set_call_undefined__ or function (t, k, v)
    local proto = t

    while not(proto == nil) do
        local set_ = rawget(proto, "__set__")

        local setmethod = set_ and rawget(set_, k)

        if not(setmethod == nil) then 
            setmethod(t, v)
            return
        end
        proto = rawget(proto, "__proto")
    end
    if v == nil then 
        local nullsHolder = rawget(t, "__nulls")

        if nullsHolder == nil then 
            nullsHolder = __obj({
                __index = __get_call_undefined__,
                __newindex = __set_call_undefined__,
            })
            
            rawset(t, "__nulls", nullsHolder)
        end
        rawset(nullsHolder, k, true)
        return
    end
    local v0 = v

    if v == undefined then 
        local nullsHolder = rawget(t, "__nulls")

        if not(nullsHolder == nil) then 
            rawset(nullsHolder, k, nil)
        end
        v0 = nil
    end
    rawset(t, k, v0)
end

__obj = __obj or function (t)
    setmetatable(t, t)
    return t
end

__wrapper = __wrapper or function (method, _this)
    if not(method) or not(___type((method)) == "function") then 
        return method
    end
    return function (...)
        return method(_this, ...)
    end
    
end

__bind = __bind or function (method, _this, ...)
    if not(method) or not(___type((method)) == "function") then 
        return method
    end
    local prependParams = {
    }
    

    if prependParams and prependParams[0] then 
        return function (...)
            return method(_this, table.unpack(prependParams), ...)
        end
        
    end
    return function (...)
        return prependParams and method(_this, ...)
    end
    
end

__call = __call or function (method, _this, ...)
    if not(method) or not(___type((method)) == "function") then 
        return _this:call(...)
    end
    return method(_this, ...)
end

__apply = __apply or function (method, _this, ...)
    if not(method) or not(___type((method)) == "function") then 
        return _this:apply(_this, ...)
    end
    return method(_this, ...)
end

__new = __new or function (proto, ...)
    if not(proto) then 
        error("Prototype can't be undefined or null")
    end
    local obj = {
        __index = __get_call_undefined__,
        __proto = proto,
        __newindex = __set_call_undefined__,
    }
    

    setmetatable(obj, obj)
    if obj.constructor_ and not(obj.constructor_ == undefined) then 
        obj:constructor_(...)
    end
    return obj
end

__new_init = __new_init or function (proto, obj, ...)
    if not(proto) then 
        error("Prototype can't be undefined or null")
    end
    obj.__index = __get_call_undefined__
    obj.__proto = proto
    obj.__newindex = __set_call_undefined__
    setmetatable(obj, obj)
    if obj.constructor_ and not(obj.constructor_ == undefined) then 
        obj:constructor_(...)
    end
    return obj
end

__decorate = __decorate or function (decors, proto, propertyName, descriptorOrParameterIndex)
    local isClassDecorator = propertyName == undefined

    local isMethodDecoratorOrParameterDecorator = not(descriptorOrParameterIndex == undefined)

    local protoOrDescriptorOrParameterIndex = (function () if __is_true(isClassDecorator) then return proto else return (function () if __is_true(nil == descriptorOrParameterIndex) then return (function () local op17362 = (Object:getOwnPropertyDescriptor(proto, propertyName)) descriptorOrParameterIndex = op17362 return op17362 end)() else return descriptorOrParameterIndex end end)() end end)()

    local l = decors.length - 1

    while l >= 0 do
        local decoratorItem = decors[l]

        if decoratorItem then 
            protoOrDescriptorOrParameterIndex = ((function () if __is_true(isClassDecorator) then return decoratorItem(protoOrDescriptorOrParameterIndex) else return (function () if __is_true(isMethodDecoratorOrParameterDecorator) then return decoratorItem(proto, propertyName, protoOrDescriptorOrParameterIndex) else return decoratorItem(proto, propertyName) end end)() end end)()) or protoOrDescriptorOrParameterIndex
        end
    l = l - 1
    end
    if isMethodDecoratorOrParameterDecorator and not(protoOrDescriptorOrParameterIndex == nil) then 
        Object:defineProperty(proto, propertyName, protoOrDescriptorOrParameterIndex)
    end
    return protoOrDescriptorOrParameterIndex
end



Infinity = tonumber("1e+1000")
function decodeURIComponent(s)
    return s
end

function toPrimitiveForParse(v)
    return (function () if __is_true(___type(v) == "object") then return tostring(v) else return v end end)()
end

function parseInt(v)
    if __is_true(__equals(v, undefined)) then 
        return 0 / 0
    end
    local num = tonumber(toPrimitiveForParse(v))

    if __is_true(num == nil) then 
        return 0 / 0
    end
    return math.floor(num)
end

function parseFloat(v)
    if __is_true(__equals(v, undefined)) then 
        return 0 / 0
    end
    local num = tonumber(toPrimitiveForParse(v))

    if __is_true(num == nil) then 
        return 0 / 0
    end
    return num
end

function isNaN(v)
    return __equals(tostring(v), tostring(0 / 0))
end

function isFinite(v)
    return __equals(tostring(v), tostring(1 / 0))
end

JS = JS or __obj({
    __index = __get_call_undefined__,
    __newindex = __set_call_undefined__,
})

undefined = {
    name = "undefined",
    __tostring = function ()
        error(__new(Error, "Object is possibly 'undefined'"))
    end
    ,
    __index = function (_this, indx)
        error(__new(Error, "Object is possibly 'undefined'"))
    end
    ,
    __newindex = function (_this, indx, val)
        error(__new(Error, "Object is possibly 'undefined'"))
    end
    ,
    __call = function (_this, indx)
        error(__new(Error, "Object is possibly 'undefined'"))
    end
    ,
    __len = function (_this)
        return 0
    end
    ,
    __lt = function (_this, other)
        return false
    end
    ,
    __le = function (_this, other)
        return false
    end
    ,
    __index = __get_call_undefined__,
    __newindex = __set_call_undefined__,
}

setmetatable(undefined, undefined)
JS.undefined = undefined

setmetatable(undefined, undefined)





JS = JS or __obj({
    __index = __get_call_undefined__,
    __newindex = __set_call_undefined__,
})

Object = {
    constructor_ = function (this, obj)
        if __is_true(__equals(obj, nil)) then 
            obj = __obj({
                __index = __get_call_undefined__,
                __newindex = __set_call_undefined__,
            })
            
        end
        this.obj = obj
        this.__index = function (_this, indx)
            local val = _this.obj[indx]

            local op520 = ___type((val))
            if op520 == "number" then
                return __new(Number, val)
            elseif op520 == "string" then
                return __new(String, val)
            elseif op520 == "table" then
                return __new(Object, val)
            end
            return val
        end
        
        this.__newindex = function (_this, indx, val)
            _this.obj[indx] = val
        end
        
    end
    ,
    create = function (proto)
        if __is_true(__not(proto)) then 
            error(__new(Error, "Prototype can't be undefined or null"))
        end
        local obj = __obj({
            __index = __get_call_undefined__,
            __newindex = __set_call_undefined__,
        })
        

        obj.__index = __get_call_undefined__
        obj.__proto = proto
        obj.__newindex = __set_call_undefined__
        setmetatable(obj, obj)
        if __is_true(obj.constructor_) then 
            obj:constructor_()
        end
        return obj
    end
    ,
    freeze = function (obj)
        if __is_true(obj == nil) then 
            return
        end
        obj.__newindex = function (table)
            error(__new(Error, "Object is read-only"))
        end
        
        setmetatable(obj, obj)
    end
    ,
    keys = function (obj)
        local a = __new(Array)

        local current = obj

        if __is_true(current) then 
            local __c = current
            local __v = __type(__c) == "table" and rawget(__c, "_values")
            for __k in pairs(__v or __c) do
                if (__v and __type(__k) == "number") or (not(__v) and not(string.char(string.byte(__k, 1)) == '_' and string.char(string.byte(__k, 2)) == '_')) then
                    local k
 = __v and __k - 1 or __k
                    a:push(k)
                end
            end
            current = current.__proto
        end
        while __is_true(current) do
            local __c = current
            local __v = __type(__c) == "table" and rawget(__c, "_values")
            for __k in pairs(__v or __c) do
                if (__v and __type(__k) == "number") or (not(__v) and not(string.char(string.byte(__k, 1)) == '_' and string.char(string.byte(__k, 2)) == '_')) then
                    local k
 = __v and __k - 1 or __k
                    local val = current[k]

                    if __is_true(___type(val) == "function") then 
                        goto continue
                    end
                    a:push(k)
                ::continue::
                end
            end
            current = current.__proto
        ::continue::
        end
        return a
    end
    ,
    defineProperty = function (obj, name, opts)
        if __is_true(__equals(opts, nil)) then 
            return
        end
        if __is_true(not(opts.get == nil)) then 
            if __is_true(__not(obj.__get__)) then 
                obj.__get__ = __obj({
                    __index = __get_call_undefined__,
                    __newindex = __set_call_undefined__,
                })
                
                obj.__get__.__index = undefined
                rawset(obj.__get__, "__index", nil)
            end
            obj.__get__[name] = opts.get
            if __is_true(not(___type(obj.__index) == "function")) then 
                obj.__index = __get_call_undefined__
            end
        end
        local setMethod = (function () local op3385 = opts.set if __is_true(op3385) then return op3385 else return ((function () if __is_true(((function () local op3400 = opts.value if __is_true(op3400) then return ___type(opts.value) == "function" else return op3400 end end)())) then return opts.value else return nil end end)()) end end)()

        if __is_true(setMethod) then 
            if __is_true(__not(obj.__set__)) then 
                obj.__set__ = __obj({
                    __index = __get_call_undefined__,
                    __newindex = __set_call_undefined__,
                })
                
                obj.__set__.__newindex = undefined
                rawset(obj.__set__, "__newindex", nil)
            end
            obj.__set__[name] = setMethod
            if __is_true(not(___type(obj.__newindex) == "function")) then 
                obj.__newindex = __set_call_undefined__
            end
        end
        if __is_true((function () local op3876 = opts.value if __is_true(op3876) then return not(___type(opts.value) == "function") else return op3876 end end)()) then 
            obj[name] = opts.value
        end
    end
    ,
    getOwnPropertyDescriptor = function (obj, name)
        local opts = __obj({
            __index = __get_call_undefined__,
            __newindex = __set_call_undefined__,
        })
        

        if __is_true(obj.__get__) then 
            local getMethod = obj.__get__[name]

            if __is_true(___type((getMethod)) == "function") then 
                opts["get"] = getMethod
            end
        end
        if __is_true(obj.__set__) then 
            local setMethod = obj.__set__[name]

            if __is_true(___type((setMethod)) == "function") then 
                opts["set"] = setMethod
            end
        end
        local value = obj[name]

        if __is_true(value) then 
            opts["value"] = value
        end
        return opts
    end
    ,
    getPrototypeOf = function (obj)
        return obj.__proto
    end
    ,
    __index = __get_call_undefined__,
    __newindex = __set_call_undefined__,
}

setmetatable(Object, Object)
JS.Object = Object






JS = JS or __obj({
    __index = __get_call_undefined__,
    __newindex = __set_call_undefined__,
})

Map = {
    __index = __get_call_undefined__,
    __newindex = __set_call_undefined__,
}

setmetatable(Map, Map)
JS.Map = Map








JS = JS or __obj({
    __index = __get_call_undefined__,
    __newindex = __set_call_undefined__,
})

StringHelper = {
    getLength = function (this)
        return string.len(this)
    end
    ,
    toConcatString = function (val)
        if __is_true(val == nil) then 
            return "null"
        end
        if __is_true(val == undefined) then 
            return "undefined"
        end
        if __is_true((function () local op766 = ___type((val)) == "object" if __is_true(op766) then return __not(rawget(val, "__tostring")) else return op766 end end)()) then 
            return "[object Object]"
        end
        return tostring(val)
    end
    ,
    fromCharCode = function (code)
        return string.char(tonumber(code))
    end
    ,
    charCodeAt = function (this, index)
        return string.byte(this, index + 1)
    end
    ,
    replace = function (this, valOrRegExp, valOrFunc)
        if __is_true(___type(valOrRegExp) == "string") then 
            return string.gsub(this, string.gsub(valOrRegExp, "[%^%$%(%)%%%.%[%]%*%+%-%?]", "%%%1"), valOrFunc)
        end
        if __is_true(valOrRegExp.nativeHandle) then 
            local current = 0

            local size = StringHelper.getLength(this)

            local isFunc = ___type(valOrFunc) == "function"

            local result = __new(Array)

            while __is_true(current < size) do
                local matchResult = valOrRegExp:exec(this)

                local position = (function () if __is_true(matchResult) then return matchResult.index else return -1 end end)()

                if __is_true(position < 0) then 
                    local rest = StringHelper.substring(this, current)

                    ArrayHelper.pushOne(result, rest)
                    return result:join("")
                end
                if __is_true(position > current) then 
                    local part = StringHelper.substring(this, current, position)

                    ArrayHelper.pushOne(result, part)
                end
                current = position + StringHelper.getLength(matchResult[0])
                if __is_true(__not(isFunc)) then 
                    ArrayHelper.pushOne(result, valOrFunc)
                 else 
                    local val = valOrFunc(matchResult[0], table.unpack(matchResult))

                    ArrayHelper.pushOne(result, val)
                end
            end
            return result:join("")
        end
        return string.gsub(this, valOrRegExp:__getLuaPattern(), valOrFunc)
    end
    ,
    substr = function (this, begin, len)
        if __is_true(len == nil) then 
            len = undefined
            if __is_true(begin == nil) then 
                begin = undefined
            end
        end
        return string.sub(this, ((function () local op3263 = begin if __is_true(op3263) then return op3263 else return 0 end end)()) + 1, ((function () local op3281 = begin if __is_true(op3281) then return op3281 else return 0 end end)()) + ((function () local op3296 = len if __is_true(op3296) then return op3296 else return string.len(this) end end)()))
    end
    ,
    substring = function (this, begin, _end)
        if __is_true(_end == nil) then 
            _end = undefined
            if __is_true(begin == nil) then 
                begin = undefined
            end
        end
        if __is_true((function () local op3441 = (function () local op3441 = __equals(begin, _end) if __is_true(op3441) then return __equals(_end, nil) else return op3441 end end)() if __is_true(op3441) then return op3441 else return begin == _end end end)()) then 
            return ""
        end
        return string.sub(this, ((function () local op3575 = begin if __is_true(op3575) then return op3575 else return 0 end end)()) + 1, (function () if __is_true(not(__equals(_end, undefined))) then return _end else return nil end end)())
    end
    ,
    slice = function (this, start, _end)
        if __is_true(_end == nil) then 
            _end = undefined
            if __is_true(start == nil) then 
                start = undefined
            end
        end
        return string.sub(this, ((function () local op3761 = start if __is_true(op3761) then return op3761 else return 0 end end)()) + 1, (function () if __is_true(not(__equals(_end, undefined))) then return _end else return nil end end)())
    end
    ,
    indexOf = function (this, pattern, begin)
        if __is_true(begin == nil) then 
            begin = undefined
        end
        return ((function () local op3934 = table.pack(string.find(this, pattern, ((function () local op3973 = begin if __is_true(op3973) then return op3973 else return 0 end end)()) + 1, true))[1] if __is_true(op3934) then return op3934 else return 0 end end)()) - 1
    end
    ,
    lastIndexOf = function (this, pattern, begin)
        if __is_true(begin == nil) then 
            begin = undefined
        end
        local lastFound = undefined

        local found = undefined

        repeat
            lastFound = found
            found = table.pack(string.find(this, pattern, ((function () local op4333 = (function () local op4333 = begin if __is_true(op4333) then return op4333 else return found end end)() if __is_true(op4333) then return op4333 else return 0 end end)()) + 1, true))[1]
        until not(__is_true(found))
        return (function () if __is_true(lastFound) then return lastFound - 1 else return -1 end end)()
    end
    ,
    search = function (this, pattern, begin)
        if __is_true(begin == nil) then 
            begin = undefined
        end
        if __is_true(___type(pattern) == "string") then 
            (function () local op4610 = table.pack(string.find(this, pattern, ((function () local op4667 = begin if __is_true(op4667) then return op4667 else return 0 end end)()) + 1, true))[1] if __is_true(op4610) then return op4610 else return -1 end end)()
        end
        return (function () local op4737 = table.pack(string.find(this, pattern:__getLuaPattern(), ((function () local op4802 = begin if __is_true(op4802) then return op4802 else return 0 end end)()) + 1))[1] if __is_true(op4737) then return op4737 else return -1 end end)()
    end
    ,
    toLowerCase = function (this)
        return string.lower(this)
    end
    ,
    toUpperCase = function (this)
        return string.upper(this)
    end
    ,
    split = function (this, separator)
        local current = 0

        local size = StringHelper.getLength(this)

        local sizeSeparator = StringHelper.getLength(separator)

        local result = __new(Array)

        while __is_true(current < size) do
            local position = StringHelper.indexOf(this, separator, current)

            if __is_true(position < 0) then 
                local rest = StringHelper.substring(this, current)

                ArrayHelper.pushOne(result, rest)
                return result
            end
            local part = StringHelper.substring(this, current, position)

            current = position + sizeSeparator
            ArrayHelper.pushOne(result, part)
        end
        return result
    end
    ,
    __index = __get_call_undefined__,
    __newindex = __set_call_undefined__,
}

setmetatable(StringHelper, StringHelper)
JS.StringHelper = StringHelper

String = {
    constructor_ = function (this, constString)
        this.constString = constString
        this.__tostring = function (this)
            return this.constString
        end
        
        this.__concat = function (left, right)
            return ((function () local op6261 = left.constString if __is_true(op6261) then return op6261 else return left end end)()) .. ((function () local op6310 = right.constString if __is_true(op6310) then return op6310 else return right end end)())
        end
        
        this.__index = function (_this, indx)
            if __is_true(___type((indx)) == "number") then 
                return string.char(string.byte(_this.constString, indx + 1))
            end
            return __get_call_undefined__(_this, indx)
        end
        
    end
    ,
    replace = function (this, valOrRegExp, valOrFunc)
        return __new(String, StringHelper.replace(this.constString, valOrRegExp, valOrFunc))
    end
    ,
    charCodeAt = function (this, index)
        return StringHelper.charCodeAt(this.constString, index)
    end
    ,
    substr = function (this, begin, len)
        if __is_true(len == nil) then 
            len = undefined
            if __is_true(begin == nil) then 
                begin = undefined
            end
        end
        return __new(String, StringHelper.substr(this.constString, begin, len))
    end
    ,
    substring = function (this, begin, _end)
        if __is_true(_end == nil) then 
            _end = undefined
            if __is_true(begin == nil) then 
                begin = undefined
            end
        end
        return __new(String, StringHelper.substring(this.constString, begin, _end))
    end
    ,
    indexOf = function (this, pattern, begin)
        if __is_true(begin == nil) then 
            begin = undefined
        end
        return StringHelper.indexOf(this.constString, pattern, begin)
    end
    ,
    split = function (this, separator)
        return StringHelper.split(this.constString, separator)
    end
    ,
    slice = function (this, start, _end)
        if __is_true(_end == nil) then 
            _end = undefined
            if __is_true(start == nil) then 
                start = undefined
            end
        end
        return __new(String, StringHelper.substring(this.constString, start, _end))
    end
    ,
    toLowerCase = function (this)
        return __new(String, StringHelper.toLowerCase(this.constString))
    end
    ,
    toUpperCase = function (this)
        return __new(String, StringHelper.toUpperCase(this.constString))
    end
    ,
    toString_ = function (this)
        return this
    end
    ,
    __get__ = {
        length = function (this)
            return string.len(this.constString)
        end
        ,
    }
    ,
    __index = __get_call_undefined__,
    __newindex = __set_call_undefined__,
}

setmetatable(String, String)
JS.String = String

if __is_true(getmetatable("")) then 
    getmetatable("").__concat = function (left, right)
        return StringHelper.toConcatString(left) .. StringHelper.toConcatString(right)
    end
    
end




JS = JS or __obj({
    __index = __get_call_undefined__,
    __newindex = __set_call_undefined__,
})

Error = {
    constructor_ = function (this, message)
        this.message = message
        this.__tostring = function (this)
            return (this.message .. "\10") .. this.stack
        end
        
        this.stack = debug.traceback()
    end
    ,
    toString_ = function (this)
        return __new(String, this.message)
    end
    ,
    __index = __get_call_undefined__,
    __newindex = __set_call_undefined__,
}

setmetatable(Error, Error)
JS.Error = Error












JS = JS or __obj({
    __index = __get_call_undefined__,
    __newindex = __set_call_undefined__,
})

ArrayHelper = {
    getLength = function (_this)
        return #_this + ((function () if __is_true(_this[0]) then return 1 else return 0 end end)())
    end
    ,
    pushOne = function (_this, obj)
        local vals = _this._values

        if __is_true(vals) then 
            table.insert(vals, obj)
            return
        end
        if __is_true(__not(_this[0])) then 
            _this[0] = obj
            return
        end
        table.insert(_this, obj)
    end
    ,
    __index = __get_call_undefined__,
    __newindex = __set_call_undefined__,
}

setmetatable(ArrayHelper, ArrayHelper)
JS.ArrayHelper = ArrayHelper

ArrayNullElement = {
    __isNull = true,
    __tostring = function ()
        return "null"
    end
    ,
    __index = __get_call_undefined__,
    __newindex = __set_call_undefined__,
}

setmetatable(ArrayNullElement, ArrayNullElement)
JS.ArrayNullElement = ArrayNullElement

ArrayUndefinedElement = {
    __isUndefined = true,
    __tostring = function ()
        return "undefined"
    end
    ,
    __index = __get_call_undefined__,
    __newindex = __set_call_undefined__,
}

setmetatable(ArrayUndefinedElement, ArrayUndefinedElement)
JS.ArrayUndefinedElement = ArrayUndefinedElement

Array = {
    constructor_ = function (this, size)
        if __is_true(size == nil) then 
            size = undefined
        end
        this._values = __obj({
            __index = __get_call_undefined__,
            __newindex = __set_call_undefined__,
        })
        
        local zeroVal = rawget(this, 0)

        if __is_true((function () local op1525 = not(zeroVal == nil) if __is_true(op1525) then return op1525 else return not(rawget(this, 1) == nil) end end)()) then 
            if __is_true(not(zeroVal == nil)) then 
                this[0] = undefined
                rawset(this, 0, nil)
            end
            local _len = ArrayHelper.getLength(this)

            if __is_true(not(zeroVal == nil)) then 
                table.insert(this._values, zeroVal)
            end
            local i = 1

            while __is_true(i <= _len) do
                table.insert(this._values, rawget(this, i))
            i = i + 1
            end
            local i = _len

            while __is_true(i > 0) do
                table.remove(this, i)
                this[i] = undefined
                rawset(this, i, nil)
            i = i - 1
            end
            rawset(this, "length", nil)
        end
        this.__tostring = function (this)
            return this:join()
        end
        
        this.__ipairs = Array.__ipairsFunc
        this.__pairs = Array.__pairsFunc
        this.__index = function (_this, indx)
            if __is_true(___type((indx)) == "number") then 
                local v = rawget(_this._values, indx + 1)

                local isObject = ___type((v)) == "object"

                return (function () if __is_true((function () local op3033 = isObject if __is_true(op3033) then return v.__isNull else return op3033 end end)()) then return nil else return (function () if __is_true((function () local op3138 = isObject if __is_true(op3138) then return v.__isUndefined else return op3138 end end)()) then return undefined else return (function () if __is_true(v == nil) then return undefined else return v end end)() end end)() end end)()
            end
            return __get_call_undefined__(_this, indx)
        end
        
        this.__newindex = function (_this, indx, val)
            if __is_true(___type((indx)) == "number") then 
                rawset(_this._values, indx + 1, val)
                return
            end
            __set_call_undefined__(_this, indx, val)
        end
        
        if __is_true(size) then 
            this.length = size
        end
    end
    ,
    push = function (this, ...)
        local objs = {...}; objs.length = #objs; objs[0] = objs[1]; table.remove(objs, 1);
        local any = false

        local arr_ = objs
        local i_ = 0

        while __is_true(i_ < arr_.length) do
            local obj = arr_[i_]

            any = true
            table.insert(this._values, (function () if __is_true(not(obj == nil)) then return obj else return ArrayNullElement end end)())
        i_ = i_ + 1
        end
        
        if __is_true(__not(any)) then 
            table.insert(this._values, ArrayNullElement)
        end
    end
    ,
    pop = function (this)
        local l = this._values.length

        if __is_true(l == 0) then 
            error(__new(Error, "Out of items"))
        end
        local v = table.remove(this._values)

        return (function () if __is_true((function () local op5005 = ___type((v)) == "object" if __is_true(op5005) then return v.isNull else return op5005 end end)()) then return nil else return (function () if __is_true(v == nil) then return undefined else return v end end)() end end)()
    end
    ,
    indexOf = function (this, val)
        local vals = this._values

        local length_ = ArrayHelper.getLength(vals)

        local i = 1

        while __is_true(i <= length_) do
            if __is_true(__equals(rawget(vals, i), val)) then 
                return i - 1
            end
        i = i + 1
        end
        return -1
    end
    ,
    join = function (this, separator)
        if __is_true(separator == nil) then 
            separator = undefined
        end
        local sep = (function () if __is_true(separator == undefined) then return "," else return separator end end)()

        local vals = this._values

        local length_ = ArrayHelper.getLength(vals)

        local parts = __obj({
            __index = __get_call_undefined__,
            __newindex = __set_call_undefined__,
        })
        

        local i = 1

        while __is_true(i <= length_) do
            local v = rawget(vals, i)

            local isObject = ___type((v)) == "object"

            table.insert(parts, (function () if __is_true((function () local op6798 = (function () local op6798 = v == nil if __is_true(op6798) then return op6798 else return v == undefined end end)() if __is_true(op6798) then return op6798 else return (function () local op6852 = isObject if __is_true(op6852) then return ((function () local op6866 = v.__isNull if __is_true(op6866) then return op6866 else return v.__isUndefined end end)()) else return op6852 end end)() end end)()) then return "" else return tostring(v) end end)())
        i = i + 1
        end
        return table.concat(parts, sep)
    end
    ,
    toString_ = function (this)
        return this:join()
    end
    ,
    sort = function (this)
        table.sort(this._values)
    end
    ,
    shift = function (this)
        local v = table.remove(this._values, 1)

        return (function () if __is_true((function () local op7347 = ___type((v)) == "object" if __is_true(op7347) then return v.isNull else return op7347 end end)()) then return nil else return (function () if __is_true(__equals(v, nil)) then return undefined else return v end end)() end end)()
    end
    ,
    unshift = function (this, ...)
        local objs = {...}; objs.length = #objs; objs[0] = objs[1]; table.remove(objs, 1);
        local vals = this._values

        local arr_ = objs
        local i_ = 0

        while __is_true(i_ < arr_.length) do
            local obj = arr_[i_]

            table.insert(vals, obj)
        i_ = i_ + 1
        end
        
    end
    ,
    concat = function (this, other)
        local retArr = __new(Array)

        local _vals = this._values

        local _len = ArrayHelper.getLength(_vals)

        local i = 1

        while __is_true(i <= _len) do
            table.insert(retArr._values, _vals[i])
        i = i + 1
        end
        local arr_ = other
        local i_ = 0

        while __is_true(i_ < arr_.length) do
            local obj = arr_[i_]

            table.insert(retArr._values, obj)
        i_ = i_ + 1
        end
        
        return retArr
    end
    ,
    remove = function (this, obj)
        local idx = this:indexOf(obj)

        if __is_true(not(idx == -1)) then 
            table.remove(this._values, idx + 1)
        end
    end
    ,
    map = function (this, func, thisValue)
        if __is_true(thisValue == nil) then 
            thisValue = undefined
        end
        local retArr = __new(Array)

        local index = 0

        local _vals = this._values

        local _len = ArrayHelper.getLength(_vals)

        local i = 1

        while __is_true(i <= _len) do
            local obj = func(_vals[i], (function () local op8693 = (index) index = op8693 + 1 return op8693 end)(), this)

            ArrayHelper.pushOne(retArr, obj)
        i = i + 1
        end
        return retArr
    end
    ,
    filter = function (this, func, thisValue)
        if __is_true(thisValue == nil) then 
            thisValue = undefined
        end
        local retArr = __new(Array)

        local index = 0

        local _vals = this._values

        local _len = ArrayHelper.getLength(_vals)

        local i = 1

        while __is_true(i <= _len) do
            local val = _vals[i]

            local iftrue = func(val, (function () local op9314 = (index) index = op9314 + 1 return op9314 end)(), this)

            if __is_true(iftrue) then 
                ArrayHelper.pushOne(ret, val)
            end
        i = i + 1
        end
        return retArr
    end
    ,
    forEach = function (this, func, thisValue)
        if __is_true(thisValue == nil) then 
            thisValue = undefined
        end
        local index = 0

        local _vals = this._values

        local _len = ArrayHelper.getLength(_vals)

        local i = 1

        while __is_true(i <= _len) do
            local val = _vals[i]

            func(val, (function () local op9931 = (index) index = op9931 + 1 return op9931 end)(), this)
        i = i + 1
        end
    end
    ,
    every = function (this, func, thisValue)
        if __is_true(thisValue == nil) then 
            thisValue = undefined
        end
        local index = 0

        local result = true

        local arr_ = this._values
        local i_ = 0

        while __is_true(i_ < arr_.length) do
            local val = arr_[i_]

            result = math.floor(result) & math.floor(func(val, (function () local op10258 = (index) index = op10258 + 1 return op10258 end)(), this))
        i_ = i_ + 1
        end
        
        return result
    end
    ,
    splice = function (this, index, howmany, ...)
        if __is_true(howmany == nil) then 
            howmany = undefined
        end
        local items = {...}; items.length = #items; items[0] = items[1]; table.remove(items, 1);
        local count = (function () local op10464 = howmany if __is_true(op10464) then return op10464 else return 1 end end)()

        local retArr = __new(Array)

        local i = index + count

        while __is_true(i > index) do
            ArrayHelper.pushOne(retArr, rawget(this._values, i))
            table.remove(this._values, i)
        i = i - 1
        end
        if __is_true(items) then 
            local length_ = ArrayHelper.getLength(items)

            local i = 0

            while __is_true(i < length_) do
                local ind = i + index + 1

                table.insert(this._values, ind, items[i])
            i = i + 1
            end
        end
        return retArr
    end
    ,
    slice = function (this, begin, _end)
        if __is_true(_end == nil) then 
            _end = undefined
            if __is_true(begin == nil) then 
                begin = undefined
            end
        end
        local retArr = __new(Array)

        local from = (function () local op11238 = begin if __is_true(op11238) then return op11238 else return 0 end end)()

        if __is_true(from < 0) then 
            error(__new(Error, "Index out of bounds: " .. from
            ))
        end
        local to = (function () local op11384 = _end if __is_true(op11384) then return op11384 else return this.length end end)()

        if __is_true(to > this.length) then 
            to = this.length
        end
        local i = from

        while __is_true(i < to) do
            table.insert(retArr._values, rawget(this._values, i + 1))
        i = i + 1
        end
        return retArr
    end
    ,
    __get__ = {
        length = function (this)
            return ArrayHelper.getLength(this._values)
        end
        ,
    }
    ,
    __set__ = {
        length = function (this, newSize)
            local _len = ArrayHelper.getLength(this._values)

            if __is_true(_len == newSize) then 
                return
            end
            if __is_true(newSize < _len) then 
                local i = _len

                while __is_true(i >= newSize) do
                    table.remove(this._values, i)
                i = i - 1
                end
             else 
                local i = _len + 1

                while __is_true(i <= newSize) do
                    table.insert(this._values, i, ArrayUndefinedElement)
                i = i + 1
                end
            end
        end
        ,
    }
    ,
    __index = __get_call_undefined__,
    __newindex = __set_call_undefined__,
}

setmetatable(Array, Array)
JS.Array = Array



JS = JS or __obj({
    __index = __get_call_undefined__,
    __newindex = __set_call_undefined__,
})

TypedArrayBase = {
    constructor_ = function (this, sizeOrData, sizePerElement, type)
        this.sizePerElement = sizePerElement
        this.type = type
        if __is_true(__not(array_buffer)) then 
            array_buffer = require("array_buffer")
        end
        local setFunc = undefined

        local getFunc = undefined

        local op681 = type
        if op681 == "int8" then
            getFunc = array_buffer.getInt8
            setFunc = array_buffer.setInt8
        elseif op681 == "int16" then
            getFunc = array_buffer.getInt16
            setFunc = array_buffer.setInt16
        elseif op681 == "int32" then
            getFunc = array_buffer.getInt32
            setFunc = array_buffer.setInt32
        elseif op681 == "int64" then
            getFunc = array_buffer.getInt64
            setFunc = array_buffer.setInt64
        elseif op681 == "float" then
            getFunc = array_buffer.getFloat
            setFunc = array_buffer.setFloat
        elseif op681 == "double" then
            getFunc = array_buffer.getDouble
            setFunc = array_buffer.setDouble
        else
            getFunc = array_buffer.get
            setFunc = array_buffer.set
        end
        this.get = getFunc
        this.set = setFunc
        local data = undefined

        local isSize = __equals(___type((sizeOrData)), "number")

        if __is_true(isSize) then 
            this.size = sizeOrData
            this.byteLength = sizeOrData * sizePerElement
         else 
            data = sizeOrData
            this.size = (function () local op2322 = sizeOrData.length if __is_true(op2322) then return op2322 else return ArrayHelper.getLength(sizeOrData) end end)()
            this.byteLength = this.size * sizePerElement
        end
        this.buffer = __new(ArrayBuffer, this.byteLength)
        if __is_true(__not(isSize)) then 
            local bufferNative = this.buffer.bufferNativeInstance

            local index = 0

            local arr_ = data
            local i_ = 0

            while __is_true(i_ < arr_.length) do
                local val = arr_[i_]

                setFunc(bufferNative, (function () local op2814 = (index) index = op2814 + 1 return op2814 end)(), val)
            i_ = i_ + 1
            end
            
        end
        this.__index = function (_this, indx)
            if __is_true(___type((indx)) == "number") then 
                local bufferNative = _this.buffer.bufferNativeInstance

                return _this.get(bufferNative, indx)
            end
            return __get_call_undefined__(_this, indx)
        end
        
        this.__newindex = function (_this, indx, val)
            if __is_true(___type((indx)) == "number") then 
                local bufferNative = _this.buffer.bufferNativeInstance

                _this.set(bufferNative, indx, val)
                return
            end
            __set_call_undefined__(_this, indx, val)
        end
        
    end
    ,
    __index = __get_call_undefined__,
    __newindex = __set_call_undefined__,
}

setmetatable(TypedArrayBase, TypedArrayBase)
JS.TypedArrayBase = TypedArrayBase



JS = JS or __obj({
    __index = __get_call_undefined__,
    __newindex = __set_call_undefined__,
})

ArrayBuffer = {
    constructor_ = function (this, sizeBytes)
        if __is_true(__not(array_buffer)) then 
            array_buffer = require("array_buffer")
        end
        if __is_true(__not(array_buffer)) then 
            error(__new(Error, "array_buffer module is not available"))
        end
        local bufferNativeInstance = (function () local op450 = (array_buffer.new(sizeBytes)) this.bufferNativeInstance = op450 return op450 end)()

    end
    ,
    __index = __get_call_undefined__,
    __newindex = __set_call_undefined__,
}

setmetatable(ArrayBuffer, ArrayBuffer)
JS.ArrayBuffer = ArrayBuffer



JS = JS or __obj({
    __index = __get_call_undefined__,
    __newindex = __set_call_undefined__,
})

if __is_true(__not(TypedArrayBase)) then 
    error("Base class is not defined: TypedArrayBase")
end
Float32Array = {
    TYPE = "float",
    BYTES_PER_ELEMENT = 4,
    constructor_ = function (this, sizeOrData)
        TypedArrayBase.constructor_(this, sizeOrData, Float32Array.BYTES_PER_ELEMENT, Float32Array.TYPE)
    end
    ,
    __proto = TypedArrayBase,
    __index = __get_call_undefined__,
    __newindex = __set_call_undefined__,
}

setmetatable(Float32Array, Float32Array)
JS.Float32Array = Float32Array



JS = JS or __obj({
    __index = __get_call_undefined__,
    __newindex = __set_call_undefined__,
})

if __is_true(__not(TypedArrayBase)) then 
    error("Base class is not defined: TypedArrayBase")
end
Float64Array = {
    TYPE = "double",
    BYTES_PER_ELEMENT = 8,
    constructor_ = function (this, sizeOrData)
        TypedArrayBase.constructor_(this, sizeOrData, Float64Array.BYTES_PER_ELEMENT, Float64Array.TYPE)
    end
    ,
    __proto = TypedArrayBase,
    __index = __get_call_undefined__,
    __newindex = __set_call_undefined__,
}

setmetatable(Float64Array, Float64Array)
JS.Float64Array = Float64Array



JS = JS or __obj({
    __index = __get_call_undefined__,
    __newindex = __set_call_undefined__,
})

if __is_true(__not(TypedArrayBase)) then 
    error("Base class is not defined: TypedArrayBase")
end
Uint8Array = {
    TYPE = "int8",
    BYTES_PER_ELEMENT = 1,
    constructor_ = function (this, sizeOrData)
        TypedArrayBase.constructor_(this, sizeOrData, Uint8Array.BYTES_PER_ELEMENT, Uint8Array.TYPE)
    end
    ,
    __proto = TypedArrayBase,
    __index = __get_call_undefined__,
    __newindex = __set_call_undefined__,
}

setmetatable(Uint8Array, Uint8Array)
JS.Uint8Array = Uint8Array



JS = JS or __obj({
    __index = __get_call_undefined__,
    __newindex = __set_call_undefined__,
})

if __is_true(__not(TypedArrayBase)) then 
    error("Base class is not defined: TypedArrayBase")
end
Uint16Array = {
    TYPE = "int16",
    BYTES_PER_ELEMENT = 2,
    constructor_ = function (this, sizeOrData)
        TypedArrayBase.constructor_(this, sizeOrData, Uint16Array.BYTES_PER_ELEMENT, Uint16Array.TYPE)
    end
    ,
    __proto = TypedArrayBase,
    __index = __get_call_undefined__,
    __newindex = __set_call_undefined__,
}

setmetatable(Uint16Array, Uint16Array)
JS.Uint16Array = Uint16Array



JS = JS or __obj({
    __index = __get_call_undefined__,
    __newindex = __set_call_undefined__,
})

if __is_true(__not(TypedArrayBase)) then 
    error("Base class is not defined: TypedArrayBase")
end
Uint32Array = {
    TYPE = "int32",
    BYTES_PER_ELEMENT = 4,
    constructor_ = function (this, sizeOrData)
        TypedArrayBase.constructor_(this, sizeOrData, Uint32Array.BYTES_PER_ELEMENT, Uint32Array.TYPE)
    end
    ,
    __proto = TypedArrayBase,
    __index = __get_call_undefined__,
    __newindex = __set_call_undefined__,
}

setmetatable(Uint32Array, Uint32Array)
JS.Uint32Array = Uint32Array



JS = JS or __obj({
    __index = __get_call_undefined__,
    __newindex = __set_call_undefined__,
})

if __is_true(__not(TypedArrayBase)) then 
    error("Base class is not defined: TypedArrayBase")
end
Uint64Array = {
    TYPE = "int64",
    BYTES_PER_ELEMENT = 8,
    constructor_ = function (this, sizeOrData)
        TypedArrayBase.constructor_(this, sizeOrData, Uint64Array.BYTES_PER_ELEMENT, Uint64Array.TYPE)
    end
    ,
    __proto = TypedArrayBase,
    __index = __get_call_undefined__,
    __newindex = __set_call_undefined__,
}

setmetatable(Uint64Array, Uint64Array)
JS.Uint64Array = Uint64Array





TS = TS or __obj({
    __index = __get_call_undefined__,
    __newindex = __set_call_undefined__,
})

NumberHelper = {
    toString_ = function (this, ...)
        return tostring(this)
    end
    ,
    __index = __get_call_undefined__,
    __newindex = __set_call_undefined__,
}

setmetatable(NumberHelper, NumberHelper)
TS.NumberHelper = NumberHelper

Number = {
    MAX_VALUE = 1.7976931348623157e+308,
    MIN_VALUE = 5e-324,
    constructor_ = function (this, constNumber)
        this.constNumber = constNumber
        this.__tostring = function (this)
            return tostring(this.constNumber)
        end
        
        this.__lt = function (this, other)
            return ((function () if __is_true(__type(this) == "number") then return this else return this.constNumber end end)()) <= ((function () if __is_true(__type(other) == "number") then return other else return other.constNumber end end)())
        end
        
        this.__le = function (this, other)
            return ((function () if __is_true(__type(this) == "number") then return this else return this.constNumber end end)()) <= ((function () if __is_true(__type(other) == "number") then return other else return other.constNumber end end)())
        end
        
        this.__unm = function (this)
            return __not(((function () if __is_true(__type(this) == "number") then return this else return this.constNumber end end)()))
        end
        
        this.__add = function (this, other)
            return ((function () if __is_true(__type(this) == "number") then return this else return this.constNumber end end)()) + ((function () if __is_true(__type(other) == "number") then return other else return other.constNumber end end)())
        end
        
        this.__sub = function (this, other)
            return ((function () if __is_true(__type(this) == "number") then return this else return this.constNumber end end)()) - ((function () if __is_true(__type(other) == "number") then return other else return other.constNumber end end)())
        end
        
        this.__mul = function (this, other)
            return ((function () if __is_true(__type(this) == "number") then return this else return this.constNumber end end)()) * ((function () if __is_true(__type(other) == "number") then return other else return other.constNumber end end)())
        end
        
        this.__div = function (this, other)
            return ((function () if __is_true(__type(this) == "number") then return this else return this.constNumber end end)()) / ((function () if __is_true(__type(other) == "number") then return other else return other.constNumber end end)())
        end
        
    end
    ,
    toString_ = function (this)
        return __new(String, tostring(this.constNumber))
    end
    ,
    __index = __get_call_undefined__,
    __newindex = __set_call_undefined__,
}

setmetatable(Number, Number)
TS.Number = Number




TS = TS or __obj({
    __index = __get_call_undefined__,
    __newindex = __set_call_undefined__,
})

Math = {
    E = 2.718281828459045,
    LN10 = 2.302585092994046,
    LN2 = 0.6931471805599453,
    LOG2E = 1.4426950408889634,
    LOG10E = 0.4342944819032518,
    PI = 3.141592653589793,
    SQRT1_2 = 0.7071067811865476,
    SQRT2 = 1.4142135623730951,
    pow = function (op, op2)
        return op ^ op2
    end
    ,
    min = function (op, op2)
        return math.min(op, op2)
    end
    ,
    max = function (op, op2)
        return math.max(op, op2)
    end
    ,
    sin = function (op)
        return math.sin(op)
    end
    ,
    cos = function (op)
        return math.cos(op)
    end
    ,
    asin = function (op)
        return math.asin(op)
    end
    ,
    acos = function (op)
        return math.acos(op)
    end
    ,
    abs = function (op)
        return math.abs(op)
    end
    ,
    floor = function (op)
        return math.floor(op)
    end
    ,
    round = function (op)
        return math.round(op)
    end
    ,
    sqrt = function (op)
        return math.sqrt(op)
    end
    ,
    tan = function (op)
        return math.tan(op)
    end
    ,
    atan = function (op)
        return math.atan(op)
    end
    ,
    atan2 = function (op)
        return math.atan(op)
    end
    ,
    log = function (op)
        return math.log(op)
    end
    ,
    exp = function (op)
        return math.exp(op)
    end
    ,
    random = function ()
        return math.random()
    end
    ,
    __index = __get_call_undefined__,
    __newindex = __set_call_undefined__,
}

setmetatable(Math, Math)
TS.Math = Math




JS = JS or __obj({
    __index = __get_call_undefined__,
    __newindex = __set_call_undefined__,
})

Date = {
    getHours = function (this)
        return os.date("*t").hour
    end
    ,
    getMinutes = function (this)
        return os.date("*t").min
    end
    ,
    getSeconds = function (this)
        return os.date("*t").sec
    end
    ,
    now = function (this)
        local clk = os.clock()

        return (Date.initial_time * 1000) + (math.floor((clk - Date.initial_clock) * 1000))
    end
    ,
    __index = __get_call_undefined__,
    __newindex = __set_call_undefined__,
}

setmetatable(Date, Date)
Date.initial_clock = os.clock()
Date.initial_time = os.time()
JS.Date = Date





RegExp = {
    loaded = false,
    constructor_ = function (this, pattern, flags)
        if __is_true(flags == nil) then 
            flags = undefined
        end
        this.pattern = pattern
        this.flags = flags
        if __is_true(__not(RegExp.loaded)) then 
            RegExp.loaded = true
            pcre2adapter = require("pcre2adapter")
        end
        if __is_true(pcre2adapter) then 
            local flagsEnum = 0

            if __is_true(flags) then 
                local arr_ = flags
                local i_ = 0

                while __is_true(i_ < #arr_) do
                    local flag = string.char(string.byte(arr_, i_ + 1))

                    local op609 = flag
                    if op609 == "g" then
                        this.isGlobal = true
                    elseif op609 == "i" then
                        flagsEnum = math.floor(flagsEnum) | 1
                    elseif op609 == "m" then
                        flagsEnum = math.floor(flagsEnum) | 2
                    end
                i_ = i_ + 1
                end
                
            end
            this.nativeHandle = pcre2adapter.regcomp(pattern, flagsEnum)
        end
    end
    ,
    test = function (this, t)
        if __is_true(__not(t)) then 
            return false
        end
        if __is_true(this.nativeHandle) then 
            return pcre2adapter.regtest(this.nativeHandle, t)
        end
        return __not(string.match(t, this:__getLuaPattern()))
    end
    ,
    exec = function (this, t)
        if __is_true(__not(t)) then 
            return nil
        end
        if __is_true(this.nativeHandle) then 
            local matchResult = pcre2adapter.regexec(this.nativeHandle, t, (function () if __is_true(not(this.lastIndex == undefined)) then return this.lastIndex + 1 else return nil end end)())

            if __is_true(matchResult) then 
                this.lastIndex = matchResult.index
            end
            return matchResult
        end
        return string.match(t, this:__getLuaPattern())
    end
    ,
    getPattern = function (this)
        return this.pattern
    end
    ,
    __getLuaPattern = function (this)
        return string.gsub(this.pattern, "\\", "%%")
    end
    ,
    __index = __get_call_undefined__,
    __newindex = __set_call_undefined__,
}

setmetatable(RegExp, RegExp)

JS = JS or __obj({
    __index = __get_call_undefined__,
    __newindex = __set_call_undefined__,
})

if __is_true(__not(Error)) then 
    error("Base class is not defined: Error")
end
SyntaxError = {
    constructor_ = function (this)
        Error.constructor_(this, "JSON Syntax Error")
    end
    ,
    __proto = Error,
    __index = __get_call_undefined__,
    __newindex = __set_call_undefined__,
}

setmetatable(SyntaxError, SyntaxError)
JS.SyntaxError = SyntaxError

JSONParse = {
    constructor_ = function (this)
        this.Unescapes = {
            [92] = "\\",
            [34] = "\"",
            [47] = "/",
            [98] = "\8",
            [116] = "\9",
            [110] = "\10",
            [102] = "\12",
            [114] = "\13",
        }
        
    end
    ,
    abort = function (this)
        this.Index = (function () local op867 = (nil) this.Source = op867 return op867 end)()
        error(SyntaxError())
    end
    ,
    lex = function (this)
        local source = this.Source
        local length = StringHelper.getLength(source)

        local value = undefined
        local begin = undefined
        local position = undefined
        local isSigned = undefined
        local charCode = undefined

        while __is_true(this.Index < length) do
            charCode = StringHelper.charCodeAt(source, this.Index)
            local op1405 = charCode
            if op1405 == 9 or op1405 == 10 or op1405 == 13 or op1405 == 32 then
                this.Index = this.Index + 1
            elseif op1405 == 123 or op1405 == 125 or op1405 == 91 or op1405 == 93 or op1405 == 58 or op1405 == 44 then
                value = string.char(string.byte(source, this.Index + 1))
                this.Index = this.Index + 1
                return value
            elseif op1405 == 34 then
                __comma((function () local op2448 = ("@") value = op2448 return op2448 end)(),(function () local op2460 = (this.Index) this.Index = op2460 + 1 return op2460 end)())
                while __is_true(this.Index < length) do
                    charCode = StringHelper.charCodeAt(source, this.Index)
                    if __is_true(charCode < 32) then 
                        this:abort()
                     else 
                        if __is_true(charCode == 92) then 
                            charCode = StringHelper.charCodeAt(source, (function () local op0 = (this.Index + 1) this.Index = op0 return op0 end)())
                            local op3225 = charCode
                            if op3225 == 92 or op3225 == 34 or op3225 == 47 or op3225 == 98 or op3225 == 116 or op3225 == 110 or op3225 == 102 or op3225 == 114 then
                                value = value .. this.Unescapes[charCode]
                                this.Index = this.Index + 1
                            elseif op3225 == 117 then
                                begin = (function () local op0 = (this.Index + 1) this.Index = op0 return op0 end)()
                                position = this.Index + 4
                                while __is_true(this.Index < position) do
                                    charCode = StringHelper.charCodeAt(source, this.Index)
                                    if __is_true(__not(((function () local op4464 = (function () local op4464 = (function () local op4464 = charCode >= 48 if __is_true(op4464) then return charCode <= 57 else return op4464 end end)() if __is_true(op4464) then return op4464 else return (function () local op4548 = charCode >= 97 if __is_true(op4548) then return charCode <= 102 else return op4548 end end)() end end)() if __is_true(op4464) then return op4464 else return (function () local op4634 = charCode >= 65 if __is_true(op4634) then return charCode <= 70 else return op4634 end end)() end end)()))) then 
                                        this:abort()
                                    end
                                this.Index = this.Index + 1
                                end
                                value = value .. StringHelper.fromCharCode("0x" .. StringHelper.slice(source, begin, this.Index))
                            else
                                this:abort()
                            end
                         else 
                            if __is_true(charCode == 34) then 
                                break
                            end
                            charCode = StringHelper.charCodeAt(source, this.Index)
                            begin = this.Index
                            while __is_true((function () local op5930 = (function () local op5930 = charCode >= 32 if __is_true(op5930) then return not(charCode == 92) else return op5930 end end)() if __is_true(op5930) then return not(charCode == 34) else return op5930 end end)()) do
                                charCode = StringHelper.charCodeAt(source, (function () local op0 = (this.Index + 1) this.Index = op0 return op0 end)())
                            end
                            value = value .. StringHelper.slice(source, begin, this.Index)
                        end
                    end
                
                end
                if __is_true(StringHelper.charCodeAt(source, this.Index) == 34) then 
                    this.Index = this.Index + 1
                    return value
                end
                this:abort()
            else
                begin = this.Index
                if __is_true(charCode == 45) then 
                    isSigned = true
                    charCode = StringHelper.charCodeAt(source, (function () local op0 = (this.Index + 1) this.Index = op0 return op0 end)())
                end
                if __is_true((function () local op7200 = charCode >= 48 if __is_true(op7200) then return charCode <= 57 else return op7200 end end)()) then 
                    if __is_true((function () local op7351 = charCode == 48 if __is_true(op7351) then return (__comma(((function () local op7372 = (StringHelper.charCodeAt(source, this.Index + 1)) charCode = op7372 return op7372 end)()),(function () local op7418 = charCode >= 48 if __is_true(op7418) then return charCode <= 57 else return op7418 end end)())) else return op7351 end end)()) then 
                        this:abort()
                    end
                    isSigned = false
                    while __is_true((function () local op7738 = this.Index < length if __is_true(op7738) then return (__comma(((function () local op7797 = (StringHelper.charCodeAt(source, this.Index)) charCode = op7797 return op7797 end)()),(function () local op7839 = charCode >= 48 if __is_true(op7839) then return charCode <= 57 else return op7839 end end)())) else return op7738 end end)()) do
                    this.Index = this.Index + 1
                    end
                    if __is_true(StringHelper.charCodeAt(source, this.Index) == 46) then 
                        position = (function () local op0 = (this.Index + 1) this.Index = op0 return op0 end)()
                        while __is_true((function () local op8360 = position < length if __is_true(op8360) then return (__comma(((function () local op8421 = (StringHelper.charCodeAt(source, position)) charCode = op8421 return op8421 end)()),(function () local op8461 = charCode >= 48 if __is_true(op8461) then return charCode <= 57 else return op8461 end end)())) else return op8360 end end)()) do
                        position = position + 1
                        end
                        if __is_true(position == this.Index) then 
                            this:abort()
                        end
                        this.Index = position
                    end
                    charCode = StringHelper.charCodeAt(source, this.Index)
                    if __is_true((function () local op9091 = charCode == 101 if __is_true(op9091) then return op9091 else return charCode == 69 end end)()) then 
                        charCode = StringHelper.charCodeAt(source, (function () local op0 = (this.Index + 1) this.Index = op0 return op0 end)())
                        if __is_true((function () local op9380 = charCode == 43 if __is_true(op9380) then return op9380 else return charCode == 45 end end)()) then 
                            this.Index = this.Index + 1
                        end
                        position = this.Index
                        while __is_true((function () local op9635 = position < length if __is_true(op9635) then return (__comma(((function () local op9696 = (StringHelper.charCodeAt(source, position)) charCode = op9696 return op9696 end)()),(function () local op9736 = charCode >= 48 if __is_true(op9736) then return charCode <= 57 else return op9736 end end)())) else return op9635 end end)()) do
                        position = position + 1
                        end
                        if __is_true(position == this.Index) then 
                            this:abort()
                        end
                        this.Index = position
                    end
                    local val = StringHelper.slice(source, begin, this.Index)

                    return tonumber(val)
                end
                if __is_true(isSigned) then 
                    this:abort()
                end
                if __is_true(StringHelper.slice(source, this.Index, this.Index + 4) == "true") then 
                    this.Index = this.Index + 4
                    return true
                 else 
                    if __is_true(StringHelper.slice(source, this.Index, this.Index + 5) == "false") then 
                        this.Index = this.Index + 5
                        return false
                     else 
                        if __is_true(StringHelper.slice(source, this.Index, this.Index + 4) == "null") then 
                            this.Index = this.Index + 4
                            return nil
                        end
                    end
                end
                this:abort()
            end
        end
        return "$"
    end
    ,
    get = function (this, value)
        local results = undefined

        local hasMembers = false

        if __is_true(value == "$") then 
            this:abort()
        end
        if __is_true(___type((value)) == "string") then 
            if __is_true(string.char(string.byte(value, 0 + 1)) == "@") then 
                return StringHelper.slice(value, 1)
            end
            if __is_true(value == "[") then 
                results = __new(Array)
                while __is_true() do
                    value = this:lex()
                    if __is_true(value == "]") then 
                        break
                    end
                    if __is_true(hasMembers) then 
                        if __is_true(value == ",") then 
                            value = this:lex()
                            if __is_true(value == "]") then 
                                this:abort()
                            end
                         else 
                            this:abort()
                        end
                    end
                    if __is_true(value == ",") then 
                        this:abort()
                    end
                    results:push(this:get(value))
                (function () local op12207 = hasMembers if __is_true(op12207) then return op12207 else return ((function () local op12223 = (true) hasMembers = op12223 return op12223 end)()) end end)()
                end
                return results
             else 
                if __is_true(value == "{") then 
                    results = __obj({
                        __index = __get_call_undefined__,
                        __newindex = __set_call_undefined__,
                    })
                    
                    while __is_true() do
                        value = this:lex()
                        if __is_true(value == "}") then 
                            break
                        end
                        if __is_true(hasMembers) then 
                            if __is_true(value == ",") then 
                                value = this:lex()
                                if __is_true(value == "}") then 
                                    this:abort()
                                end
                             else 
                                this:abort()
                            end
                        end
                        if __is_true((function () local op15065 = (function () local op15065 = (function () local op15065 = value == "," if __is_true(op15065) then return op15065 else return not(___type(value) == "string") end end)() if __is_true(op15065) then return op15065 else return not(string.char(string.byte(value, 0 + 1)) == "@") end end)() if __is_true(op15065) then return op15065 else return not(this:lex() == ":") end end)()) then 
                            this:abort()
                        end
                        local nameProp = StringHelper.slice(value, 1)

                        results[nameProp] = this:get(this:lex())
                    (function () local op13801 = hasMembers if __is_true(op13801) then return op13801 else return ((function () local op13817 = (true) hasMembers = op13817 return op13817 end)()) end end)()
                    end
                    return results
                end
            end
            this:abort()
        end
        return value
    end
    ,
    parse = function (this, source)
        this.Index = 0
        this.Source = "" .. source
        local result = this:get(this:lex())

        if __is_true(not(this:lex() == "$")) then 
            this:abort()
        end
        this.Index = (function () local op16064 = (nil) this.Source = op16064 return op16064 end)()
        return result
    end
    ,
    __index = __get_call_undefined__,
    __newindex = __set_call_undefined__,
}

setmetatable(JSONParse, JSONParse)
JS.JSONParse = JSONParse

JSON = {
    parse = function (source)
        return __new(JSONParse):parse(source)
    end
    ,
    __index = __get_call_undefined__,
    __newindex = __set_call_undefined__,
}

setmetatable(JSON, JSON)
JS.JSON = JSON




JS = JS or __obj({
    __index = __get_call_undefined__,
    __newindex = __set_call_undefined__,
})

XMLHttpRequest = {
    constructor_ = function (this)
    end
    ,
    UNSENT = 0,
    OPENED = 1,
    HEADERS_RECEIVED = 2,
    LOADING = 3,
    DONE = 4,
    open = function (this, method, url, asyncType)
        this.url = url
        this.readyState = XMLHttpRequest.OPENED
    end
    ,
    addEventListener = function (this, eventName, cb, flag)
        if __is_true(flag == nil) then 
            flag = undefined
        end
        if __is_true(__not(this.callbacks)) then 
            this.callbacks = __obj({
                __index = __get_call_undefined__,
                __newindex = __set_call_undefined__,
            })
            
        end
        this.callbacks[eventName] = cb
    end
    ,
    removeEventListener = function (this, eventName, cb, flag)
        if __is_true(flag == nil) then 
            flag = undefined
        end
        if __is_true(__not(this.callbacks)) then 
            return
        end
        this.callbacks[eventName] = undefined
        rawset(this.callbacks, eventName, nil)
    end
    ,
    send = function (this, body)
        if __is_true(body == nil) then 
            body = undefined
        end
        this.readyState = XMLHttpRequest.LOADING
        local prefix = "file://"

        local actualPrefix = StringHelper.substr(this.url, 0, StringHelper.getLength(prefix))

        local absPath = (function () if __is_true(actualPrefix == prefix) then return StringHelper.substr(this.url, StringHelper.getLength(prefix)) else return this.url end end)()

        local file = table.pack(io.open(absPath, "r"))

        if __is_true(file[1]) then 
            local data = file[1]:read("*all")

            this.responseText = string.gsub(data, "^ï»¿", "")
            this.status = 200
         else 
            this.status = 404
            this.statusText = file[2]
        end
        this.readyState = XMLHttpRequest.DONE
        local readystatechangeCallback = this.callbacks["readystatechange"]

        if __is_true(readystatechangeCallback) then 
            readystatechangeCallback()
        end
        local loadendCallback = this.callbacks["loadend"]

        if __is_true(loadendCallback) then 
            loadendCallback()
        end
    end
    ,
    __index = __get_call_undefined__,
    __newindex = __set_call_undefined__,
}

setmetatable(XMLHttpRequest, XMLHttpRequest)
JS.XMLHttpRequest = XMLHttpRequest





JS = JS or __obj({
    __index = __get_call_undefined__,
    __newindex = __set_call_undefined__,
})

Console = {
    log = function (...)
        print(...)
    end
    ,
    warn = function (...)
        print(...)
    end
    ,
    error = function (...)
        local params = {...}; params.length = #params; params[0] = params[1]; table.remove(params, 1);
        io.stderr:write(tostring(params[0]))
    end
    ,
    __index = __get_call_undefined__,
    __newindex = __set_call_undefined__,
}

setmetatable(Console, Console)
JS.Console = Console




console = JS.Console
