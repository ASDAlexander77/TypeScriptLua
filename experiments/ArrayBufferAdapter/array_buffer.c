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

    typedef struct ArrayContainerType {
        size_t bytesLength;
        unsigned char data[1];
    } ArrayContainer;

    static int new (lua_State *L)
    {
        size_t bytes = luaL_checkinteger(L, 1);
        size_t totalBytes = sizeof(ArrayContainer) + bytes;
        ArrayContainer *a = (ArrayContainer *)lua_newuserdata(L, totalBytes);
        a->bytesLength = bytes;
        return 1; /* new userdatum is already on the stack */
    }

    static int set (lua_State *L)                                                
    {                                                                                   
        ArrayContainer *a = (ArrayContainer *)lua_touserdata(L, 1);                     
        int index = luaL_checkinteger(L, 2);                                            
        double value = luaL_checknumber(L, 3);                                          
                                                                                        
        luaL_argcheck(L, a != NULL, 1, "'array_buffer' expected");                      
        luaL_argcheck(L, 0 <= index && (index * sizeof(double)) < a->bytesLength, 2, "index out of range");      
                                                                                        
        ((double*)(&a->data))[index] = value;
        return 0;                                                                       
    }

    static int get (lua_State *L)                                                
    {                                                                                   
        ArrayContainer *a = (ArrayContainer *)lua_touserdata(L, 1);                     
        int index = luaL_checkinteger(L, 2);                                             
                                                                                        
        luaL_argcheck(L, a != NULL, 1, "'array_buffer' expected");                      
        luaL_argcheck(L, 0 <= index && (index * sizeof(double)) < a->bytesLength, 2, "index out of range");      
                                                                                        
        lua_pushnumber(L, ((double*)(&a->data))[index]);                                
        return 1;                                                                       
    }

    // === Double ===
#define SET(type__, name)                                                               \
    static int set_##name (lua_State *L)                                                \
    {                                                                                   \
        ArrayContainer *a = (ArrayContainer *)lua_touserdata(L, 1);                     \
        int index = luaL_checkinteger(L, 2);                                            \
        type__ value = luaL_checknumber(L, 3);                                          \
                                                                                        \
        luaL_argcheck(L, a != NULL, 1, "'array_buffer' expected");                      \
        luaL_argcheck(L, 0 <= index && (index * sizeof(type__)) < a->bytesLength, 2, "index out of range"); \
                                                                                        \
        ((type__*)(&a->data))[index] = value;                                           \
        return 0;                                                                       \
    }

#define GET(type__, name)                                                               \
    static int get_##name (lua_State *L)                                                \
    {                                                                                   \
        ArrayContainer *a = (ArrayContainer *)lua_touserdata(L, 1);                     \
        int index = luaL_checkinteger(L, 2);                                                \
                                                                                        \
        luaL_argcheck(L, a != NULL, 1, "'array_buffer' expected");                      \
        luaL_argcheck(L, 0 <= index && (index * sizeof(type__)) < a->bytesLength, 2, "index out of range"); \
                                                                                        \
        lua_pushnumber(L, ((type__*)(&a->data))[index]);                                \
        return 1;                                                                       \
    }

SET(unsigned char, int8)
GET(unsigned char, int8)

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
        lua_pushlightuserdata(L, a->data);
        return 1; /* new userdatum is already on the stack */
    }

    static const struct luaL_Reg array_buffer[] = {
        {"new", new},
        {"set", set_double},
        {"get", get_double},
        {"set8", set_int8},
        {"get8", get_int8},
        {"set16", set_int16},
        {"get16", get_int16},
        {"set32", set_int32},
        {"get32", get_int32},
        {"set64", set_int64},
        {"get64", get_int64},
        {"setFloat", set_float},
        {"getFloat", get_float},
        {"setDouble", set_double},
        {"getDouble", get_double},
        {"bytesLength", getBytesLength},        
        {"data", getData},        
        {NULL, NULL} /* sentinel */
    };

    //name of this function is not flexible
    LIBRARY_API int luaopen_array_buffer(lua_State *L)
    {
        luaL_newlib(L, array_buffer);
        return 1;
    }

#ifdef __cplusplus
}
#endif
