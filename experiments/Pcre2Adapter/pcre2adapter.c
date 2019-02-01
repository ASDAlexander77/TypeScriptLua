#ifdef __cplusplus
#include "lua.hpp"
#else
#include "lua.h"
#include "lualib.h"
#include "lauxlib.h"
#endif

#define PCRE2_CODE_UNIT_WIDTH 8
#include <pcre2.h>
#include <pcre2posix.h>

#ifdef _WIN32
#define LIBRARY_API extern __declspec(dllexport)
#elif
#define LIBRARY_API static
#endif

#ifdef __cplusplus
extern "C"
{
#endif

#define REGEXP_GC_METATABLENAME "__pcre2_adapter_metatable"

    static int regcomp_wrapper (lua_State *L)
    {
        const char* pattern = luaL_checkstring(L, 1);   
        int cflags = luaL_checkinteger(L, 2);   

        size_t totalBytes = sizeof(regex_t);
        regex_t* preg = (regex_t *)lua_newuserdata(L, totalBytes);

        int result;
        if ((result = regcomp(preg, pattern, cflags)) != 0) {
            char msgbuf[255];
            regerror(result, preg, &msgbuf, sizeof(msgbuf));

#if _DEBUG
            printf("RegExp compile error: %s\n", msgbuf);
#endif                
            return luaL_error(L, "RegExp compile error: %s", msgbuf);            
        }

        /* set its metatable */
        luaL_getmetatable(L, REGEXP_GC_METATABLENAME);
        lua_setmetatable(L, -2);        

        return 1; /* new userdatum is already on the stack */
    }

    static int regexec_wrapper (lua_State *L)
    {
        regex_t* preg = (regex_t *)lua_touserdata(L, 1);
        const char* data = luaL_checkstring(L, 2);   

        size_t nmatch = 1;
        regmatch_t pmatch[1];        
        int result = regexec(preg, data, nmatch, &pmatch, 0);
        if (result != 0 && result != REG_NOMATCH) {
            char msgbuf[255];
            regerror(result, preg, &msgbuf, sizeof(msgbuf));

#if _DEBUG
            printf("RegExp execute error: %s\n", msgbuf);
#endif                
            return luaL_error(L, "RegExp execute error: %s", msgbuf);            
        }

        lua_pushboolean(L, result == REG_NOMATCH ? 0 : 1);

        return 1;
    }    

    static int reg_gc (lua_State *L)
    {
        regex_t* preg = (regex_t *)lua_touserdata(L, 1);
        regfree(preg);
        return 1; /* new userdatum is already on the stack */
    }

    static const struct luaL_Reg pcre2adapter[] = {
        {"regcomp", regcomp_wrapper},
        {"regexec", regexec_wrapper},
        {NULL, NULL} /* sentinel */
    };

    //name of this function is not flexible
    LIBRARY_API int luaopen_pcre2adapter(lua_State *L)
    {
        // we need to create metatable for UserData to set __gc to clear the resource up later
        luaL_newmetatable(L, REGEXP_GC_METATABLENAME);
        
        /* set its __gc field */
        lua_pushstring(L, "__gc");
        lua_pushcfunction(L, reg_gc);
        lua_settable(L, -3);

        luaL_newlib(L, pcre2adapter);
        return 1;
    }

#ifdef __cplusplus
}
#endif
