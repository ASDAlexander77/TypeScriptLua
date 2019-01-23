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

    static const struct luaL_Reg array_buffer[] = {
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
