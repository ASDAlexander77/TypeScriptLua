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

    static int initWindowSizeGLUT(lua_State *L)
    {
        const GLint width = luaL_checkinteger(L, 1);
        const GLint height = luaL_checkinteger(L, 2);

        glutInitWindowSize(width, height);

        return 0;
    }

    static int initWindowPositionGLUT(lua_State *L)
    {
        const GLint top = luaL_checkinteger(L, 1);
        const GLint left = luaL_checkinteger(L, 2);

        glutInitWindowPosition(top, left);

        return 0;
    }    

    static int initDisplayModeGLUT(lua_State *L)
    {
        int arg = 1;
        GLint val = 0;
        while(!lua_isnoneornil(L, arg)) 
        {
            val |= luaL_checkinteger(L, arg++);
        }

        glutInitDisplayMode(val);

        return 0;
    }    

    static int createWindowGLUT(lua_State *L)
    {
        const char *name = luaL_checkstring(L, 1);

        int windowId = glutCreateWindow(name ? name : "GLUT Window");

        lua_pushinteger(L, windowId);

        return 1;
    }

    // Display
    static int luaDisplayFunctionReference = LUA_NOREF;
    static void displayCallback()
    {
        if (luaDisplayFunctionReference != LUA_NOREF)
        {
            if (lua_rawgeti(global_L, LUA_REGISTRYINDEX, luaDisplayFunctionReference) != LUA_TFUNCTION)
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

        if (luaDisplayFunctionReference != LUA_NOREF)
        {
            luaL_unref(L, LUA_REGISTRYINDEX, luaDisplayFunctionReference);
        }

        luaDisplayFunctionReference = luaL_ref(L, LUA_REGISTRYINDEX);

        glutDisplayFunc(displayCallback);

        return 0;
    }

    // Idle
    static int luaIdleFunctionReference = LUA_NOREF;
    static void idleCallback()
    {
        if (luaIdleFunctionReference != LUA_NOREF)
        {
            if (lua_rawgeti(global_L, LUA_REGISTRYINDEX, luaIdleFunctionReference) != LUA_TFUNCTION)
            {
                luaL_error(global_L, "bad argument #%d (function expected) in callback", 1);
                return;
            }
        }

        lua_call(global_L, 0, 0);
    }

    static int idleFuncGLUT(lua_State *L)
    {
        if (!lua_isfunction(L, 1))
        {
            return luaL_error(L, "bad argument #%d (function expected)", 1);
        }

        if (luaIdleFunctionReference != LUA_NOREF)
        {
            luaL_unref(L, LUA_REGISTRYINDEX, luaIdleFunctionReference);
        }

        luaIdleFunctionReference = luaL_ref(L, LUA_REGISTRYINDEX);

        glutIdleFunc(idleCallback);

        return 0;
    }

    // Timer
    static int luaTimerFunctionReference = LUA_NOREF;
    static void timerCallback(GLint value)
    {
        if (luaTimerFunctionReference != LUA_NOREF)
        {
            if (lua_rawgeti(global_L, LUA_REGISTRYINDEX, luaTimerFunctionReference) != LUA_TFUNCTION)
            {
                luaL_error(global_L, "bad argument #%d (function expected) in callback", 1);
                return;
            }
        }

        lua_pushinteger(global_L, value);
        lua_call(global_L, 1, 0);
    }

    static int timerFuncGLUT(lua_State *L)
    {
        GLint msecs = luaL_checkinteger(L, 1);
        if (!lua_isfunction(L, 2))
        {
            return luaL_error(L, "bad argument #%d (function expected)", 2);
        }

        if (luaTimerFunctionReference != LUA_NOREF)
        {
            luaL_unref(L, LUA_REGISTRYINDEX, luaTimerFunctionReference);
        }

        lua_pushvalue(L, 2);
        luaTimerFunctionReference = luaL_ref(L, LUA_REGISTRYINDEX);

        // 3)
        GLint value = luaL_checkinteger(L, 3);

        glutTimerFunc(msecs, timerCallback, value);

        return 0;
    }    

    static postRedisplayGLUT(lua_State *L)
    {
        glutPostRedisplay();
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

    typedef struct ConstPair {
        const char *name;
        GLint val;
    } ConstPairs;

    static const struct ConstPair consts[] = {
        {"DOUBLE", GLUT_DOUBLE},
        {"DEPTH", GLUT_DEPTH},
        {"RGB", GLUT_RGB},
        {"RGBA", GLUT_RGBA}
    };

    static void AddConstsGLUT(lua_State *L)
    {
        const int count = sizeof(consts) / sizeof(consts[0]);
        for (int i = 0; i < count; i++) 
        {
            const struct ConstPair val = consts[i];
            lua_pushstring(L, val.name);
            lua_pushinteger(L, val.val);
            lua_settable(L, -3);
        }
    }

    static const struct luaL_Reg glut[] = {
        {"init", initGLUT},
        {"initWindowSize", initWindowSizeGLUT},
        {"initWindowPosition", initWindowPositionGLUT},
        {"initDisplayMode", initDisplayModeGLUT},
        {"createWindow", createWindowGLUT},
        {"display", displayFuncGLUT},
        {"idle", idleFuncGLUT},
        {"timer", timerFuncGLUT},
        {"mainLoop", mainLoopGLUT},
        {"postRedisplay", postRedisplayGLUT},
        {"swapBuffers", swapBuffersGLUT},
        {NULL, NULL} /* sentinel */
    };

    //name of this function is not flexible
    LIBRARY_API int luaopen_glut(lua_State *L)
    {
        global_L = L;
        luaL_newlib(L, glut);
        AddConstsGLUT(L);
        return 1;
    }

#ifdef __cplusplus
}
#endif
