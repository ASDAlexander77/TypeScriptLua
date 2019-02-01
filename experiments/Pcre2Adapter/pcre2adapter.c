#ifdef __cplusplus
#include "lua.hpp"
#else
#include "lua.h"
#include "lualib.h"
#include "lauxlib.h"
#endif

#define PCRE2_CODE_UNIT_WIDTH 8
#include <pcre2.h>

#ifdef _WIN32
#define LIBRARY_API extern __declspec(dllexport)
#elif
#define LIBRARY_API static
#endif

#ifdef __cplusplus
extern "C"
{
#endif
 
    static const struct luaL_Reg pcre2_adapter[] = {
        {NULL, NULL} /* sentinel */
    };

    //name of this function is not flexible
    LIBRARY_API int luaopen_pcre2_adapter(lua_State *L)
    {
        luaL_newlib(L, pcre2_adapter);
        return 1;
    }

#ifdef __cplusplus
}
#endif
