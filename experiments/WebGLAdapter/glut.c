#include <GL/glut.h>

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

    // === public
    static int initGLUT(lua_State *L)
    {
        int argc = 0;
        glutInit(&argc, NULL);
        return 0;
    }

    static int createWindowGLUT(lua_State *L)
    {
        const char *name = luaL_checkstring(L, 1);

        int windowId = glutCreateWindow(name ? name : "GLUT Window");

        lua_pushnumber(L, windowId);

        return 1;
    }

    static const struct luaL_Reg glut[] = {
        {"init", initGLUT},
        {"createWindow", createWindowGLUT},
        {NULL, NULL} /* sentinel */
    };

    //name of this function is not flexible
    LIBRARY_API int luaopen_glut(lua_State *L)
    {
        luaL_newlib(L, glut);
        return 1;
    }

#ifdef __cplusplus
}
#endif
