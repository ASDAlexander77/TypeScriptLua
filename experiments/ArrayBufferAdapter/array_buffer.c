#ifdef __cplusplus
#include "lua.hpp"
#else
#include "lua.h"
#include "lualib.h"
#include "lauxlib.h"
#endif

#ifdef _WIN32
#define LIBRARY_API extern __declspec(dllexport)
#elif
#define LIBRARY_API static
#endif

#ifdef __cplusplus
extern "C"
{
#endif

    typedef ArrayContainer {
        size_t bytesSize,
        size_t count,
        size_t elementSize,
        unsigned char[1] data
    }

    static int new (lua_State *L)
    {
        size_t count = luaL_checkint(L, 1);
        size_t elementSize = luaL_checkint(L, 2);
        size_t nbytes = sizeof(ArrayContainer) + count * sizeof(elementSize);
        ArrayContainer *a = (ArrayContainer *)lua_newuserdata(L, nbytes);
        a->bytesLength = nbytes;
        a->count = n;
        a->elementSize = elementSize;
        return 1; /* new userdatum is already on the stack */
    }

    // === Double ===
#define SET(type, name)                                                                 \
    static int set_##name (lua_State *L)                                                \
    {                                                                                   \
        ArrayContainer *a = (ArrayContainer *)lua_touserdata(L, 1);                     \
        int index = luaL_checkint(L, 2);                                                \
        type value = luaL_checknumber(L, 3);                                            \
                                                                                        \
        luaL_argcheck(L, a != NULL, 1, "'array_buffer' expected");                      \
        luaL_argcheck(L, 0 <= index && index < a->size, 2, "index out of range");       \
                                                                                        \
        ((*type)a->values)[index] = value;                                              \
        return 0;                                                                       \
    }

#define GET(type, name)                                                                 \
    static int get_##name (lua_State *L)                                                \
    {                                                                                   \
        ArrayContainer *a = (ArrayContainer *)lua_touserdata(L, 1);                     \
        int index = luaL_checkint(L, 2);                                                \
                                                                                        \
        luaL_argcheck(L, a != NULL, 1, "'array_buffer' expected");                      \
        luaL_argcheck(L, 0 <= index && index < a->size, 2, "index out of range");       \
                                                                                        \
        lua_pushnumber(L, ((*type)a->values)[index]);                                   \
        return 1;                                                                       \
    }

SET(unsigned char, byte)
GET(unsigned char, byte)

SET(short, int16)
GET(short, int16)

SET(int, int32)
GET(int, int32)

SET(long, int64)
GET(long, int64)

SET(float, float)
GET(float, float)

SET(double, double)
GET(double, double)

    static int getCount (lua_State *L) 
    {
        ArrayContainer *a = (ArrayContainer *)lua_touserdata(L, 1);
        luaL_argcheck(L, a != NULL, 1, "`array' expected");
        lua_pushnumber(L, a->count);
        return 1;
    }    

    static int getBytesLength (lua_State *L) 
    {
        ArrayContainer *a = (ArrayContainer *)lua_touserdata(L, 1);
        luaL_argcheck(L, a != NULL, 1, "`array' expected");
        lua_pushnumber(L, a->bytesLength);
        return 1;
    }      

    static int getData (lua_State *L)
    {
        ArrayContainer *a = (ArrayContainer *)lua_touserdata(L, 1);
        lua_pushlightuserdata(a->data);
        return 1; /* new userdatum is already on the stack */
    }

    static const struct luaL_Reg array_buffer[] = {
        {"new", new},
        {"set", set_double},
        {"get", get_double},
        {"set16", set_int16},
        {"get16", get_int16},
        {"set32", set_int32},
        {"get32", get_int32},
        {"set64", set_int64},
        {"get64", get_int64},
        {"setFloat", set_float},
        {"getFloat", get_float},
        {"count", getCount},        
        {"bytesLength", getBytesLength},        
        {"data", getData},        
        {NULL, NULL} /* sentinel */
    };

    //name of this function is not flexible
    LIBRARY_API int luaopen_array_buffer(lua_State *L)
    {
        luaL_newlib(L, array_buffer);
        AddConstsGL(L);
        return 1;
    }

#ifdef __cplusplus
}
#endif
