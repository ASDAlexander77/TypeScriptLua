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
    static lua_State *global_L = NULL;

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

    static int luaDisplayFnctionReference = LUA_NOREF;
    static void displayCallback()
    {
        if (luaDisplayFnctionReference != LUA_NOREF)
        {
            if (lua_rawgeti(global_L, LUA_REGISTRYINDEX, luaDisplayFnctionReference) != LUA_TFUNCTION)
            {
                luaL_error(global_L, "bad argument #%d (function expected) in callback", 1);
                return;
            }
        }

        lua_call(global_L, 0, 0);
    }

    static int displayFuncGLUT(lua_State *L)
    {
        if (!lua_isfunction(L, 1))
        {
            return luaL_error(L, "bad argument #%d (function expected)", 1);
        }

        if (luaDisplayFnctionReference != LUA_NOREF)
        {
            luaL_unref(L, LUA_REGISTRYINDEX, luaDisplayFnctionReference);
        }

        luaDisplayFnctionReference = luaL_ref(L, LUA_REGISTRYINDEX);

        glutDisplayFunc(displayCallback);

        return 0;
    }

    static int mainLoopGLUT(lua_State *L)
    {
        glutMainLoop();
        return 0;
    }

    static int swapBuffersGLUT(lua_State *L)
    {
        glutSwapBuffers();
        return 0;
    }

    static const struct luaL_Reg glut[] = {
        {"init", initGLUT},
        {"createWindow", createWindowGLUT},
        {"display", displayFuncGLUT},
        {"mainLoop", mainLoopGLUT},
        {"swapBuffers", swapBuffersGLUT},
        {NULL, NULL} /* sentinel */
    };

    //name of this function is not flexible
    LIBRARY_API int luaopen_glut(lua_State *L)
    {
        global_L = L;
        luaL_newlib(L, glut);
        return 1;
    }

#ifdef __cplusplus
}
#endif
