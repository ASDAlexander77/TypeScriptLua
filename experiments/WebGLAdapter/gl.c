#include <GL/glew.h>

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

    // ==== private
    static int errorCheck(lua_State *L)
    {
        GLenum error = GL_NO_ERROR;
        error = glGetError();
        if (GL_NO_ERROR != error)
        {
            switch (error)
            {
            case GL_INVALID_ENUM:
                return luaL_error(L, "GL error: enumeration parameter is not a legal enumeration for that function");
            case GL_INVALID_VALUE:
                return luaL_error(L, "GL error: value parameter is not a legal value for that function");
            case GL_INVALID_OPERATION:
                return luaL_error(L, "GL error: the set of state for a command is not legal for the parameters given to that command");
            case GL_STACK_OVERFLOW:
                return luaL_error(L, "GL error: stack pushing operation cannot be done because it would overflow the limit of that stack's size");
            case GL_STACK_UNDERFLOW:
                return luaL_error(L, "GL error: stack popping operation cannot be done because the stack is already at its lowest point");
            case GL_OUT_OF_MEMORY:
                return luaL_error(L, "GL error: performing an operation that can allocate memory, and the memory cannot be allocated");
            case GL_INVALID_FRAMEBUFFER_OPERATION_EXT:
                return luaL_error(L, "GL error: doing anything that would attempt to read from or write/render to a framebuffer that is not complete");
            case GL_TABLE_TOO_LARGE:
                return luaL_error(L, "GL error: Table is too large");
            default:
                return luaL_error(L, "GL error: Error %d", error);
            }
        }

        return error;
    }

    // === public
    static int initGL(lua_State *L)
    {
        GLenum err = glewInit();
        if (err != GLEW_OK)
        {
            return luaL_error(L, "glewInit error: %s", glewGetErrorString(err));
        }

        int error = errorCheck(L);
        if (error) 
        {
            return error;
        }

        return 0;
    }

    static int clearColor(lua_State *L)
    {
        const GLfloat red = luaL_checknumber(L, 1);
        const GLfloat green = luaL_checknumber(L, 2);
        const GLfloat blue = luaL_checknumber(L, 3);
        const GLfloat alpha = luaL_checknumber(L, 4);

        glClearColor(red, green, blue, alpha);

        int error = errorCheck(L);
        if (error) 
        {
            return error;
        }

        return 0;        
    }

    static int createBuffer(lua_State *L)
    {
        GLuint val;
        glGenBuffers(1, &val);
        
        int error = errorCheck(L);
        if (error) 
        {
            return error;
        }

        lua_pushnumber(L, val);

        return 1;
    }

    static const struct luaL_Reg webgl[] = {
        {"init", initGL},
        {"clearColor", clearColor},
        {"createBuffer", createBuffer},
        {NULL, NULL} /* sentinel */
    };

    //name of this function is not flexible
    LIBRARY_API int luaopen_webgl(lua_State *L)
    {
        luaL_newlib(L, webgl);
        return 1;
    }

#ifdef __cplusplus
}
#endif
