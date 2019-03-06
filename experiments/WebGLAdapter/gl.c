#if DEBUG
#define _DEBUG
#endif

#include <GL/glew.h>

#ifdef __cplusplus
#include "lua.hpp"
#else
#include "lua.h"
#include "lualib.h"
#include "lauxlib.h"
#include "lobject.h"
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
        const GLenum error = glGetError();
        if (GL_NO_ERROR != error)
        {
            switch (error)
            {
            case GL_INVALID_ENUM:
#if _DEBUG
                printf("GL error: enumeration parameter is not a legal enumeration for that function\n");
#endif
                return luaL_error(L, "GL error: enumeration parameter is not a legal enumeration for that function");
            case GL_INVALID_VALUE:
#if _DEBUG
                printf("GL error: value parameter is not a legal value for that function\n");
#endif
                return luaL_error(L, "GL error: value parameter is not a legal value for that function");
            case GL_INVALID_OPERATION:
#if _DEBUG
                printf("GL error: the set of state for a command is not legal for the parameters given to that command\n");
#endif
                return luaL_error(L, "GL error: the set of state for a command is not legal for the parameters given to that command");
            case GL_STACK_OVERFLOW:
#if _DEBUG
                printf("GL error: the set of state for a command is not legal for the parameters given to that command\n");
#endif
                return luaL_error(L, "GL error: stack pushing operation cannot be done because it would overflow the limit of that stack's size");
            case GL_STACK_UNDERFLOW:
#if _DEBUG
                printf("GL error: stack popping operation cannot be done because the stack is already at its lowest point\n");
#endif
                return luaL_error(L, "GL error: stack popping operation cannot be done because the stack is already at its lowest point");
            case GL_OUT_OF_MEMORY:
#if _DEBUG
                printf("GL error: performing an operation that can allocate memory, and the memory cannot be allocated\n");
#endif
                return luaL_error(L, "GL error: performing an operation that can allocate memory, and the memory cannot be allocated");
            case GL_INVALID_FRAMEBUFFER_OPERATION_EXT:
#if _DEBUG
                printf("GL error: doing anything that would attempt to read from or write/render to a framebuffer that is not complete\n");
#endif
                return luaL_error(L, "GL error: doing anything that would attempt to read from or write/render to a framebuffer that is not complete");
            case GL_TABLE_TOO_LARGE:
#if _DEBUG
                printf("GL error: Table is too large\n");
#endif
                return luaL_error(L, "GL error: Table is too large");
            default:
#if _DEBUG
                printf("GL error: Error %d\n", error);
#endif
                return luaL_error(L, "GL error: Error %d", error);
            }
        }

        return error;
    }

    // === public
    static int majorVersion = 1;
    static int minorVersion = 0;

    static int higherOrEqual(int major, int minor)
    {
        return majorVersion > major || majorVersion == major && minorVersion >= minor;
    }

#if _DEBUG
    void GLAPIENTRY MessageCallback( GLenum source, GLenum type, GLuint id, GLenum severity, GLsizei length, const GLchar* message, const void* userParam )
    {
        fprintf( stderr, "GL CALLBACK: %s type = 0x%x, severity = 0x%x, message = %s\n",
            ( type == GL_DEBUG_TYPE_ERROR ? "** GL ERROR **" : "" ), type, severity, message );
    }
#endif

    static int initGL(lua_State *L)
    {
        GLenum err = glewInit();
        if (err != GLEW_OK)
        {
            return luaL_error(L, "glewInit error: %s", glewGetErrorString(err));
        }

        const char *version = glGetString(GL_VERSION);
        if (version && version[0] != (char)NULL)
        {
            majorVersion = version[0] - '0';
            if (version[1] == '.' && version[2] != (char)NULL)
            {
                minorVersion = version[2] - '0';
            }
        }

#if _DEBUG
        printf("OpenGL Version: %s(%d.%d)\n", version, majorVersion, minorVersion);
#endif

        if (!glewIsSupported(
                "GL_VERSION_2_0 "
                "GL_EXT_framebuffer_object "
                "GL_ARB_vertex_program "
                "GL_ARB_fragment_program "))
        {
#if _DEBUG
            printf("Unable to load extensions\nGL_VERSION_2_0\nGL_EXT_framebuffer_object\nGL_ARB_vertex_program\nGL_ARB_fragment_program\n");
            printf("Supported extensions: %s\n", glGetString(GL_EXTENSIONS));
#endif
            return luaL_error(
                L,
                "Unable to load extensions: GL_VERSION_2_0, GL_EXT_framebuffer_object, GL_ARB_vertex_program, GL_ARB_fragment_program. OpenGL Version:%s, Supported extensions:%s",
                glGetString(GL_VERSION),
                glGetString(GL_EXTENSIONS));
        }

        int error = errorCheck(L);
        if (error)
        {
            return error;
        }

#if _DEBUG
        // During init, enable debug output
        glEnable              ( GL_DEBUG_OUTPUT );
        glDebugMessageCallback( MessageCallback, 0 );
#endif
        return 0;
    }

    static int error(lua_State *L)
    {
        const GLenum error = glGetError();

        lua_pushinteger(L, error);

        return 1;
    }

    static int flush(lua_State *L)
    {
        glFlush();

        int error = errorCheck(L);
        if (error)
        {
            return error;
        }

        return 0;
    }

    static int clear(lua_State *L)
    {
        int arg = 1;
        GLbitfield val = 0;
        while (!lua_isnoneornil(L, arg))
        {
            val |= luaL_checkinteger(L, arg++);
        }

        glClear(val);

        int error = errorCheck(L);
        if (error)
        {
            return error;
        }

        return 0;
    }

    static int clearColor(lua_State *L)
    {
        const GLfloat red = (GLfloat) luaL_checknumber(L, 1);
        const GLfloat green = (GLfloat) luaL_checknumber(L, 2);
        const GLfloat blue = (GLfloat) luaL_checknumber(L, 3);
        const GLfloat alpha = (GLfloat) luaL_checknumber(L, 4);

        glClearColor(red, green, blue, alpha);

        int error = errorCheck(L);
        if (error)
        {
            return error;
        }

        return 0;
    }

    static int clearDepth(lua_State *L)
    {
        const GLclampd depth = (GLclampd) luaL_checkinteger(L, 1);

        glClearDepth(depth);

        int error = errorCheck(L);
        if (error)
        {
            return error;
        }

        return 0;
    }

    static int clearStencil(lua_State *L)
    {
        const GLint s = (GLint) luaL_checkinteger(L, 1);

        glClearStencil(s);

        int error = errorCheck(L);
        if (error)
        {
            return error;
        }

        return 0;
    }

    static int viewport(lua_State *L)
    {
        const GLint x = (GLint) luaL_checkinteger(L, 1);
        const GLint y = (GLint) luaL_checkinteger(L, 2);
        const GLsizei width = (GLsizei) luaL_checkinteger(L, 3);
        const GLsizei height = (GLsizei) luaL_checkinteger(L, 4);

        glViewport(x, y, width, height);

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

        lua_pushinteger(L, val);

        return 1;
    }

    static int createShader(lua_State *L)
    {
        const GLenum type = (GLenum) luaL_checkinteger(L, 1);

        GLuint val = glCreateShader(type);
        if (!val)
        {
#if _DEBUG
            printf("GL error: glCreateShader: an error occurs creating the shader object.\n");
#endif
            return luaL_error(L, "GL error: glCreateShader: an error occurs creating the shader object.");
        }

        int error = errorCheck(L);
        if (error)
        {
            return error;
        }

        lua_pushinteger(L, val);

        return 1;
    }

    static int shaderSource(lua_State *L)
    {
        const GLuint shader = (GLuint) luaL_checkinteger(L, 1);
        size_t len;
        const GLchar *line = luaL_checklstring(L, 2, &len);
        const GLint length = (GLint)len;

#if _DEBUG
        printf("GL shaderSource: len:%d, %.100s...\n", length, line);

        int lineNumber = 0, charNumber = 0;
        for (int i = 0; i < length; i++)
        {
            unsigned int l = line[i];
            unsigned int c = 128;
            if (l > c)
            {
                printf("Ln: %d,%d: (indx:%d):%d = %c\n", lineNumber, charNumber, i, line[i], line[i]);
            }

            if (l == '\n')
            {
                charNumber = 0;
                lineNumber++;
            }
            else 
            {
                charNumber++;
            }
        }
#endif

        glShaderSource(shader, 1, &line, &length);

        int error = errorCheck(L);
        if (error)
        {
            return error;
        }

        return 0;
    }

    static int compileShader(lua_State *L)
    {
        const GLuint value = (GLuint) luaL_checkinteger(L, 1);

        glCompileShader(value);

        int error = errorCheck(L);
        if (error)
        {
            return error;
        }

        return 0;
    }

    static int getParameter(lua_State *L)
    {
        const GLenum pname = (GLenum) luaL_checkinteger(L, 1);

#if _DEBUG
        printf("getParameter %d ... getting value as int\n", pname);
#endif

        GLint valint;
        glGetIntegerv(pname, &valint);
        if (glGetError() != GL_INVALID_ENUM)
        {
            int error = errorCheck(L);
            if (error)
            {
                return error;
            }

#if _DEBUG
            printf("getParameter %d (int) = %d\n", pname, valint);
#endif

            lua_pushinteger(L, valint);
            return 1;
        }

#if _DEBUG
        printf("getParameter %d ... getting value as int64\n", pname);
#endif

        GLint64 valint64;
        glGetInteger64v(pname, &valint64);
        if (glGetError() != GL_INVALID_ENUM)
        {
            int error = errorCheck(L);
            if (error)
            {
                return error;
            }

#if _DEBUG
            printf("getParameter %d (int64) = %d\n", pname, valint64);
#endif

            lua_pushinteger(L, valint64);
            return 1;
        }

#if _DEBUG
        printf("getParameter %d ... getting value as float\n", pname);
#endif

        GLfloat valfloat;
        glGetFloatv(pname, &valfloat);
        if (glGetError() != GL_INVALID_ENUM)
        {
            int error = errorCheck(L);
            if (error)
            {
                return error;
            }

#if _DEBUG
            printf("getParameter %d (float) = %f\n", pname, valfloat);
#endif

            lua_pushnumber(L, valfloat);
            return 1;
        }

#if _DEBUG
        printf("getParameter %d ... getting value as double\n", pname);
#endif

        GLdouble valdouble;
        glGetDoublev(pname, &valdouble);
        if (glGetError() != GL_INVALID_ENUM)
        {
            int error = errorCheck(L);
            if (error)
            {
                return error;
            }

#if _DEBUG
            printf("getParameter %d (double) = %f\n", pname, valdouble);
#endif

            lua_pushnumber(L, valdouble);
            return 1;
        }

#if _DEBUG
        printf("getParameter %d ... getting value as string\n", pname);
#endif

        const char *str = glGetString(pname);
        if (glGetError() != GL_INVALID_ENUM && str)
        {
#if _DEBUG
            printf("getParameter %d (str) = %s\n", pname, str);
#endif

            lua_pushstring(L, str);
            return 1;
        }

#if _DEBUG
        printf("getParameter %s (no value)\n", pname);
#endif
        lua_pushinteger(L, 0);

        return 1;
    }

    static int getShaderParameter(lua_State *L)
    {
        const GLuint shader = (GLuint) luaL_checkinteger(L, 1);
        const GLenum pname = (GLenum) luaL_checkinteger(L, 2);

        GLint val;
        glGetShaderiv(shader, pname, &val);

        int error = errorCheck(L);
        if (error)
        {
            return error;
        }

        lua_pushinteger(L, val);

        return 1;
    }

    static int getShaderPrecisionFormat(lua_State *L)
    {
        const GLenum shaderType = (GLenum) luaL_checkinteger(L, 1);
        const GLenum precisionType = (GLenum) luaL_checkinteger(L, 2);

        GLint range[2];
 	    GLint precision;

        glGetShaderPrecisionFormat(shaderType, precisionType, (GLint*)&range, (GLint*)&precision);
        int error = errorCheck(L);
        if (error)
        {
            return error;
        }

        if (range > 0 && precision > 0) {
            lua_newtable(L);

            lua_pushstring(L, "rangeMin");
            lua_pushinteger(L, range[0]);
            lua_settable(L, -3);        

            lua_pushstring(L, "rangeMax");
            lua_pushinteger(L, range[1]);
            lua_settable(L, -3);        

            lua_pushstring(L, "precision");
            lua_pushinteger(L, precision);
            lua_settable(L, -3);        
        } else {
            lua_pushnil(L);
        }

        return 1;
    }

    static int getShaderInfoLog(lua_State *L)
    {
        const GLuint shader = (GLuint) luaL_checkinteger(L, 1);

        GLint val;
        glGetShaderiv(shader, GL_INFO_LOG_LENGTH, &val);
        int error = errorCheck(L);
        if (error)
        {
            return error;
        }

        if (val == -1 || val == 0)
        {
            // XXX GL Error? should never happen.
            lua_pushstring(L, "");
            return 1;
        }

        char *result = (char *)lua_newuserdata(L, val + 1);
        glGetShaderInfoLog(shader, val, &val, result);
        error = errorCheck(L);
        if (error)
        {
            return error;
        }

        lua_pushstring(L, result);

        return 1;
    }

    static int createProgram(lua_State *L)
    {
        GLuint val = glCreateProgram();

        int error = errorCheck(L);
        if (error)
        {
            return error;
        }

        lua_pushinteger(L, val);

        return 1;
    }

    static int attachShader(lua_State *L)
    {
        const GLuint program = (GLuint) luaL_checkinteger(L, 1);
        const GLuint shader = (GLuint) luaL_checkinteger(L, 2);

        glAttachShader(program, shader);

        int error = errorCheck(L);
        if (error)
        {
            return error;
        }

        return 0;
    }

    static int linkProgram(lua_State *L)
    {
        const GLuint program = (GLuint) luaL_checkinteger(L, 1);

        glLinkProgram(program);

        int error = errorCheck(L);
        if (error)
        {
            return error;
        }

        return 0;
    }

    static int getProgramParameter(lua_State *L)
    {
        const GLuint program = (GLuint) luaL_checkinteger(L, 1);
        const GLenum pname = (GLenum) luaL_checkinteger(L, 2);

        GLint val;
        glGetProgramiv(program, pname, &val);

#if _DEBUG
        printf("getProgramParameter(%d:%d) = %d\n", program, pname, val);
#endif

        int error = errorCheck(L);
        if (error)
        {
            return error;
        }

        lua_pushinteger(L, val);

        return 1;
    }

    static int getProgramInfoLog(lua_State *L)
    {
        const GLuint shader = (GLuint) luaL_checkinteger(L, 1);

        GLint val;
        glGetProgramiv(shader, GL_INFO_LOG_LENGTH, &val);
        int error = errorCheck(L);
        if (error)
        {
            return error;
        }

        if (val == -1 || val == 0)
        {
            // XXX GL Error? should never happen.
            lua_pushstring(L, "");
            return 1;
        }

        char *result = (char *)lua_newuserdata(L, val + 1);
        glGetProgramInfoLog(shader, val, &val, result);
        error = errorCheck(L);
        if (error)
        {
            return error;
        }

        lua_pushstring(L, result);

        return 1;
    }

    static int deleteShader(lua_State *L)
    {
        const GLuint shader = (GLuint) luaL_checkinteger(L, 1);

        glDeleteShader(shader);

        int error = errorCheck(L);
        if (error)
        {
            return error;
        }

        return 0;
    }

    static int deleteProgram(lua_State *L)
    {
        const GLuint program = (GLuint) luaL_checkinteger(L, 1);

        glDeleteProgram(program);

        int error = errorCheck(L);
        if (error)
        {
            return error;
        }

        return 0;
    }

    static int getUniformBlockIndex(lua_State *L)
    {
        const GLuint program = (GLuint) luaL_checkinteger(L, 1);
        const char *uniformBlockName = luaL_checkstring(L, 2);

        const GLuint result = glGetUniformBlockIndex(program, uniformBlockName);
        if (result == GL_INVALID_INDEX)
        {
            printf("GL error: glGetUniformBlockIndex: (%s) returns GL_INVALID_INDEX.\n", uniformBlockName);
            return luaL_error(L, "GL error: glGetUniformBlockIndex (%s) returns GL_INVALID_INDEX", uniformBlockName);
        }

        int error = errorCheck(L);
        if (error)
        {
            return error;
        }

        lua_pushinteger(L, result);

        return 1;
    }

    static int uniformBlockBinding(lua_State *L)
    {
        const GLuint program = (GLuint) luaL_checkinteger(L, 1);
        const GLuint uniformBlockIndex = (GLuint) luaL_checkinteger(L, 2);
        const GLuint uniformBlockBindingValue = (GLuint) luaL_checkinteger(L, 3);

        glUniformBlockBinding(program, uniformBlockIndex, uniformBlockBindingValue);

        int error = errorCheck(L);
        if (error)
        {
            return error;
        }

        return 0;
    }

    static int getUniformLocation(lua_State *L)
    {
        const GLuint program = (GLuint) luaL_checkinteger(L, 1);
        const char *name = luaL_checkstring(L, 2);

        GLint result = glGetUniformLocation(program, name);

        int error = errorCheck(L);
        if (error)
        {
            return error;
        }

        lua_pushinteger(L, result);

        return 1;
    }

    static int getAttribLocation(lua_State *L)
    {
        const GLuint program = (GLuint) luaL_checkinteger(L, 1);
        const char *name = luaL_checkstring(L, 2);

        GLint result = glGetAttribLocation(program, name);

        int error = errorCheck(L);
        if (error)
        {
            return error;
        }

        lua_pushinteger(L, result);

        return 1;
    }

    static int useProgram(lua_State *L)
    {
        const GLuint program = (GLuint) luaL_checkinteger(L, 1);

        glUseProgram(program);

        int error = errorCheck(L);
        if (error)
        {
            return error;
        }

        return 0;
    }

    static int validateProgram(lua_State *L)
    {
        const GLuint program = (GLuint) luaL_checkinteger(L, 1);

        glValidateProgram(program);

        int error = errorCheck(L);
        if (error)
        {
            return error;
        }

        return 0;
    }

    static int createVertexArray(lua_State *L)
    {
        GLuint arrays;
        if (higherOrEqual(4, 5))
        {
#if _DEBUG
            printf("createVertexArray...\n");
#endif
            glCreateVertexArrays(1, &arrays);
        }
        else
        {
#if _DEBUG
            printf("glGenVertexArrays...\n");
#endif
            glGenVertexArrays(1, &arrays);
        }

#if _DEBUG
        printf("createVertexArray... result: %d\n", arrays);
#endif

        int error = errorCheck(L);
        if (error)
        {
            return error;
        }

        lua_pushinteger(L, arrays);

        return 1;
    }

    static int bindVertexArray(lua_State *L)
    {
        const GLuint array = (GLuint) luaL_checkinteger(L, 1);
        glBindVertexArray(array);

        int error = errorCheck(L);
        if (error)
        {
            return error;
        }

        return 0;
    }

    static int enableVertexAttribArray(lua_State *L)
    {
        const GLuint array = (GLuint) luaL_checkinteger(L, 1);
        glEnableVertexAttribArray(array);

        int error = errorCheck(L);
        if (error)
        {
            return error;
        }

        return 0;
    }

    static int disableVertexAttribArray(lua_State *L)
    {
        const GLuint array = (GLuint) luaL_checkinteger(L, 1);
        glDisableVertexAttribArray(array);

        int error = errorCheck(L);
        if (error)
        {
            return error;
        }

        return 0;
    }

    static int vertexAttribPointer(lua_State *L)
    {
        const GLuint index = (GLuint) luaL_checkinteger(L, 1);
        const GLint size = (GLint) luaL_checkinteger(L, 2);
        const GLenum type = (GLenum) luaL_checkinteger(L, 3);
        const GLboolean normalized = (GLboolean) lua_toboolean(L, 4);
        const GLsizei stride = (GLsizei) luaL_checkinteger(L, 5);
        const GLvoid* pointer = (GLvoid*) luaL_checkinteger(L, 6);

        glVertexAttribPointer(index, size, type, normalized, stride, pointer);

        int error = errorCheck(L);
        if (error)
        {
            return error;
        }

        return 0;
    }

    static int bindBuffer(lua_State *L)
    {
        const GLenum target = (GLenum) luaL_checkinteger(L, 1);
        const GLuint buffer = (GLuint) luaL_checkinteger(L, 2);
        glBindBuffer(target, buffer);

        int error = errorCheck(L);
        if (error)
        {
            return error;
        }

        return 0;
    }

    static int bindBufferBase(lua_State *L)
    {
        const GLenum target = (GLenum) luaL_checkinteger(L, 1);
        const GLuint index = (GLuint) luaL_checkinteger(L, 2);
        const GLuint buffer = (GLuint) luaL_checkinteger(L, 3);
        glBindBufferBase(target, index, buffer);

        int error = errorCheck(L);
        if (error)
        {
            return error;
        }

        return 0;
    }

    typedef struct ArrayContainerType
    {
        size_t bytesLength;
        unsigned char data[1];
    } ArrayContainer;

    static int bufferData(lua_State *L)
    {
        GLenum target;
        size_t len;
        const char *data;
        GLbitfield flags;

        target = (GLenum) luaL_checkinteger(L, 1);

        if (lua_type(L, 2) == LUA_TUSERDATA)
        {
            const ArrayContainer *userdata = lua_topointer(L, 2);
            len = userdata->bytesLength;
            data = (const char*) &userdata->data;
        }
        else
        {
            return luaL_argerror(L, 2, "Bad argument, <number>, <user_data>, <number>");
        }

        flags = (GLbitfield) luaL_checkinteger(L, 3);

        glBufferData(target, len, data, flags);

        int error = errorCheck(L);
        if (error)
        {
            return error;
        }

        return 0;
    }

    static int bufferSubData(lua_State *L)
    {
        GLenum target;
        GLintptr offset;
        size_t len;
        const char *data;

        target = (GLenum) luaL_checkinteger(L, 1);
        offset = (GLintptr) luaL_checkinteger(L, 2);

        if (lua_type(L, 3) == LUA_TUSERDATA)
        {
            const ArrayContainer *userdata = lua_topointer(L, 3);
            len = userdata->bytesLength;
            data = (const char*) &userdata->data;
        }
        else
        {
            return luaL_argerror(L, 2, "Bad argument, <number>, <number>, <user_data>");
        }

        glBufferSubData(target, offset, len, data);

        int error = errorCheck(L);
        if (error)
        {
            return error;
        }

        return 0;
    }

    static int uniformMatrix2fv(lua_State *L)
    {
        const GLint location = (GLint) luaL_checkinteger(L, 1);
        const GLboolean transpose = lua_toboolean(L, 2);
        GLfloat *value;
        GLsizei count;
        GLsizei len;

        if (lua_type(L, 3) == LUA_TUSERDATA)
        {
            const ArrayContainer *userdata = (ArrayContainer *)lua_topointer(L, 3);
            len = (GLsizei) userdata->bytesLength;
            value = (GLfloat *) &userdata->data;
            count = len / sizeof(GLfloat) / 4 /*to get couint of matrixes*/;
        }
        else
        {
            return luaL_argerror(L, 2, "Bad argument LUA_TUSERDATA needed");
        }

        glUniformMatrix2fv(location, count, transpose, value);

        int error = errorCheck(L);
        if (error)
        {
            return error;
        }

        return 0;
    }

    static int uniformMatrix3fv(lua_State *L)
    {
        const GLint location = (GLint) luaL_checkinteger(L, 1);
        const GLboolean transpose = lua_toboolean(L, 2);
        GLfloat *value;
        GLsizei count;
        GLsizei len;

        if (lua_type(L, 3) == LUA_TUSERDATA)
        {
            ArrayContainer *userdata = (ArrayContainer *)lua_topointer(L, 3);
            len = (GLsizei) userdata->bytesLength;
            value = (GLfloat *) &userdata->data;
            count = len / sizeof(GLfloat) / 9 /*to get couint of matrixes*/;
        }
        else
        {
            return luaL_argerror(L, 2, "Bad argument LUA_TUSERDATA needed");
        }

        glUniformMatrix3fv(location, count, transpose, value);

        int error = errorCheck(L);
        if (error)
        {
            return error;
        }

        return 0;
    }

    static int uniformMatrix4fv(lua_State *L)
    {
        const GLint location = (GLint) luaL_checkinteger(L, 1);
        const GLboolean transpose = lua_toboolean(L, 2);
        GLfloat *value;
        GLsizei count;
        GLsizei len;

        if (lua_type(L, 3) == LUA_TUSERDATA)
        {
            const ArrayContainer *userdata = (ArrayContainer *)lua_topointer(L, 3);
            len = (GLsizei) userdata->bytesLength;
            value = (GLfloat *) &userdata->data;
            count = len / sizeof(GLfloat) / 16 /*to get count of matrixes*/;

#if _DEBUG
            printf("glUniformMatrix4fv count=%d, size=%d (len=%d))\n", count, sizeof(GLfloat), len);
#endif
        }
        else
        {
            return luaL_argerror(L, 2, "Bad argument LUA_TUSERDATA needed");
        }

#if _DEBUG
        printf("glUniformMatrix4fv (location=%d, count=%d(len=%d), value=%d)\n", location, count, len, value);
#endif

        glUniformMatrix4fv(location, count, transpose, value);

        int error = errorCheck(L);
        if (error)
        {
            return error;
        }

        return 0;
    }

    static int depthMask(lua_State *L)
    {
        const GLboolean flag = lua_toboolean(L, 1);

        glDepthMask(flag);

        int error = errorCheck(L);
        if (error)
        {
            return error;
        }

        return 0;
    }

    static int depthFunc(lua_State *L)
    {
        const GLenum func = (GLenum) luaL_checkinteger(L, 1);

        glDepthFunc(func);

        int error = errorCheck(L);
        if (error)
        {
            return error;
        }

        return 0;
    }

    static int stencilMask(lua_State *L)
    {
        const GLuint mask = (GLuint) luaL_checkinteger(L, 1);

        glStencilMask(mask);

        int error = errorCheck(L);
        if (error)
        {
            return error;
        }

        return 0;
    }

    static int stencilFunc(lua_State *L)
    {
        const GLenum func = (GLenum) luaL_checkinteger(L, 1);
        const GLint ref = (GLint) luaL_checkinteger(L, 2);
        const GLuint mask = (GLuint) luaL_checkinteger(L, 2);

        glStencilFunc(func, ref, mask);

        int error = errorCheck(L);
        if (error)
        {
            return error;
        }

        return 0;
    }

    static int stencilOp(lua_State *L)
    {
        const GLenum sfail = (GLenum) luaL_checkinteger(L, 1);
        const GLenum dpfail = (GLenum) luaL_checkinteger(L, 2);
        const GLenum dppass = (GLenum) luaL_checkinteger(L, 2);

        glStencilOp(sfail, dpfail, dppass);

        int error = errorCheck(L);
        if (error)
        {
            return error;
        }

        return 0;
    }

    static int enable(lua_State *L)
    {
        const GLenum cap = (GLenum) luaL_checkinteger(L, 1);

        glEnable(cap);

        int error = errorCheck(L);
        if (error)
        {
            return error;
        }

        return 0;
    }

    static int disable(lua_State *L)
    {
        const GLenum cap = (GLenum) luaL_checkinteger(L, 1);

        glDisable(cap);

        int error = errorCheck(L);
        if (error)
        {
            return error;
        }

        return 0;
    }

    static int uniform1i(lua_State *L)
    {
        const GLint location = (GLint) luaL_checkinteger(L, 1);
        const GLint x = (GLint) luaL_checkinteger(L, 2);

        glUniform1i(location, x);

        int error = errorCheck(L);
        if (error)
        {
            return error;
        }

        return 0;
    }

    static int uniform2i(lua_State *L)
    {
        const GLint location = (GLint) luaL_checkinteger(L, 1);
        const GLint x = (GLint) luaL_checkinteger(L, 2);
        const GLint y = (GLint) luaL_checkinteger(L, 3);

        glUniform2i(location, x, y);

        int error = errorCheck(L);
        if (error)
        {
            return error;
        }

        return 0;
    }

    static int uniform3i(lua_State *L)
    {
        const GLint location = (GLint) luaL_checkinteger(L, 1);
        const GLint x = (GLint) luaL_checkinteger(L, 2);
        const GLint y = (GLint) luaL_checkinteger(L, 3);
        const GLint z = (GLint) luaL_checkinteger(L, 4);

        glUniform3i(location, x, y, z);

        int error = errorCheck(L);
        if (error)
        {
            return error;
        }

        return 0;
    }

    static int uniform4i(lua_State *L)
    {
        const GLint location = (GLint) luaL_checkinteger(L, 1);
        const GLint x = (GLint) luaL_checkinteger(L, 2);
        const GLint y = (GLint) luaL_checkinteger(L, 3);
        const GLint z = (GLint) luaL_checkinteger(L, 4);
        const GLint w = (GLint) luaL_checkinteger(L, 5);

        glUniform4i(location, x, y, z, w);

        int error = errorCheck(L);
        if (error)
        {
            return error;
        }

        return 0;
    }

    static int uniform1f(lua_State *L)
    {
        const GLint location = (GLint) luaL_checkinteger(L, 1);
        const GLfloat x = (GLfloat) luaL_checknumber(L, 2);

        glUniform1f(location, x);

        int error = errorCheck(L);
        if (error)
        {
            return error;
        }

        return 0;
    }

    static int uniform2f(lua_State *L)
    {
        const GLint location = (GLint) luaL_checkinteger(L, 1);
        const GLfloat x = (GLfloat) luaL_checknumber(L, 2);
        const GLfloat y = (GLfloat) luaL_checknumber(L, 3);

        glUniform2f(location, x, y);

        int error = errorCheck(L);
        if (error)
        {
            return error;
        }

        return 0;
    }

    static int uniform3f(lua_State *L)
    {
        const GLint location = (GLint) luaL_checkinteger(L, 1);
        const GLfloat x = (GLfloat) luaL_checknumber(L, 2);
        const GLfloat y = (GLfloat) luaL_checknumber(L, 3);
        const GLfloat z = (GLfloat) luaL_checknumber(L, 4);

        glUniform3f(location, x, y, z);

        int error = errorCheck(L);
        if (error)
        {
            return error;
        }

        return 0;
    }

    static int uniform4f(lua_State *L)
    {
        const GLint location = (GLint) luaL_checkinteger(L, 1);
        const GLfloat x = (GLfloat) luaL_checknumber(L, 2);
        const GLfloat y = (GLfloat) luaL_checknumber(L, 3);
        const GLfloat z = (GLfloat) luaL_checknumber(L, 4);
        const GLfloat w = (GLfloat) luaL_checknumber(L, 5);

        glUniform4f(location, x, y, z, w);

        int error = errorCheck(L);
        if (error)
        {
            return error;
        }

        return 0;
    }

    static int uniform1iv(lua_State *L)
    {
        const GLint location = (GLint) luaL_checkinteger(L, 1);
        GLint *value;
        GLsizei count;
        GLsizei len;

        if (lua_type(L, 2) == LUA_TUSERDATA)
        {
            const ArrayContainer *userdata = (ArrayContainer *)lua_topointer(L, 2);
            len = (GLsizei) userdata->bytesLength;
            value = (GLint *) &userdata->data;
            count = len / sizeof(GLint);
        }
        else
        {
            return luaL_argerror(L, 2, "Bad argument LUA_TUSERDATA needed");
        }

        glUniform1iv(location, count, value);

        int error = errorCheck(L);
        if (error)
        {
            return error;
        }

        return 0;
    }

    static int uniform2iv(lua_State *L)
    {
        const GLint location = (GLint) luaL_checkinteger(L, 1);
        GLint *value;
        GLsizei count;
        GLsizei len;

        if (lua_type(L, 2) == LUA_TUSERDATA)
        {
            ArrayContainer *userdata = (ArrayContainer *)lua_topointer(L, 2);
            len = (GLsizei) userdata->bytesLength;
            value = (GLint *) &userdata->data;
            count = len / sizeof(GLint);
        }
        else
        {
            return luaL_argerror(L, 2, "Bad argument LUA_TUSERDATA needed");
        }

        glUniform2iv(location, count, value);

        int error = errorCheck(L);
        if (error)
        {
            return error;
        }

        return 0;
    }

    static int uniform3iv(lua_State *L)
    {
        const GLint location = (GLint) luaL_checkinteger(L, 1);
        GLint *value;
        GLsizei count;
        GLsizei len;

        if (lua_type(L, 2) == LUA_TUSERDATA)
        {
            ArrayContainer *userdata = (ArrayContainer *)lua_topointer(L, 2);
            len = (GLsizei) userdata->bytesLength;
            value = (GLint *) &userdata->data;
            count = len / sizeof(GLint);
        }
        else
        {
            return luaL_argerror(L, 2, "Bad argument LUA_TUSERDATA needed");
        }

        glUniform3iv(location, count, value);

        int error = errorCheck(L);
        if (error)
        {
            return error;
        }

        return 0;
    }

    static int uniform4iv(lua_State *L)
    {
        const GLint location = (GLint) luaL_checkinteger(L, 1);
        GLint *value;
        GLsizei count;
        GLsizei len;

        if (lua_type(L, 2) == LUA_TUSERDATA)
        {
            ArrayContainer *userdata = (ArrayContainer *)lua_topointer(L, 2);
            len = (GLsizei) userdata->bytesLength;
            value = (GLint *) &userdata->data;
            count = len / sizeof(GLint);
        }
        else
        {
            return luaL_argerror(L, 2, "Bad argument LUA_TUSERDATA needed");
        }

        glUniform4iv(location, count, value);

        int error = errorCheck(L);
        if (error)
        {
            return error;
        }

        return 0;
    }

    static int uniform1fv(lua_State *L)
    {
        const GLint location = (GLint) luaL_checkinteger(L, 1);
        GLfloat *value;
        GLsizei count;
        GLsizei len;

        if (lua_type(L, 2) == LUA_TUSERDATA)
        {
            ArrayContainer *userdata = (ArrayContainer *)lua_topointer(L, 2);
            len = (GLsizei) userdata->bytesLength;
            value = (GLfloat *) &userdata->data;
            count = len / sizeof(GLfloat);
        }
        else
        {
            return luaL_argerror(L, 2, "Bad argument LUA_TUSERDATA needed");
        }

        glUniform1fv(location, count, value);

        int error = errorCheck(L);
        if (error)
        {
            return error;
        }

        return 0;
    }

    static int uniform2fv(lua_State *L)
    {
        const GLint location = (GLint) luaL_checkinteger(L, 1);
        GLfloat *value;
        GLsizei count;
        GLsizei len;

        if (lua_type(L, 2) == LUA_TUSERDATA)
        {
            ArrayContainer *userdata = (ArrayContainer *)lua_topointer(L, 2);
            len = (GLsizei) userdata->bytesLength;
            value = (GLfloat *) &userdata->data;
            count = len / sizeof(GLfloat);
        }
        else
        {
            return luaL_argerror(L, 2, "Bad argument LUA_TUSERDATA needed");
        }

        glUniform2fv(location, count, value);

        int error = errorCheck(L);
        if (error)
        {
            return error;
        }

        return 0;
    }

    static int uniform3fv(lua_State *L)
    {
        const GLint location = (GLint) luaL_checkinteger(L, 1);
        GLfloat *value;
        GLsizei count;
        GLsizei len;

        if (lua_type(L, 2) == LUA_TUSERDATA)
        {
            ArrayContainer *userdata = (ArrayContainer *)lua_topointer(L, 2);
            len = (GLsizei) userdata->bytesLength;
            value = (GLfloat *) &userdata->data;
            count = len / sizeof(GLfloat);
        }
        else
        {
            return luaL_argerror(L, 2, "Bad argument LUA_TUSERDATA needed");
        }

        glUniform3fv(location, count, value);

        int error = errorCheck(L);
        if (error)
        {
            return error;
        }

        return 0;
    }

    static int uniform4fv(lua_State *L)
    {
        const GLint location = (GLint) luaL_checkinteger(L, 1);
        GLfloat *value;
        GLsizei count;
        GLsizei len;

        if (lua_type(L, 2) == LUA_TUSERDATA)
        {
            ArrayContainer *userdata = (ArrayContainer *)lua_topointer(L, 2);
            len = (GLsizei) userdata->bytesLength;
            value = (GLfloat *) &userdata->data;
            count = len / sizeof(GLfloat);
        }
        else
        {
            return luaL_argerror(L, 2, "Bad argument LUA_TUSERDATA needed");
        }

        glUniform4fv(location, count, value);

        int error = errorCheck(L);
        if (error)
        {
            return error;
        }

        return 0;
    }

    static int cullFace(lua_State *L)
    {
        const GLenum mode = (GLenum) luaL_checkinteger(L, 1);

        glCullFace(mode);

        int error = errorCheck(L);
        if (error)
        {
            return error;
        }

        return 0;
    }

    static int frontFace(lua_State *L)
    {
        const GLenum mode = (GLenum) luaL_checkinteger(L, 1);

        glFrontFace(mode);

        int error = errorCheck(L);
        if (error)
        {
            return error;
        }

        return 0;
    }

    static int drawElements(lua_State *L)
    {
        const GLenum mode = (GLenum) luaL_checkinteger(L, 1);
        const GLsizei count = (GLsizei) luaL_checkinteger(L, 2);
        const GLenum type = (GLenum) luaL_checkinteger(L, 3);
        const GLvoid* indices = (GLvoid*) luaL_checkinteger(L, 4);

        glDrawElements(mode, count, type, indices);

        int error = errorCheck(L);
        if (error)
        {
            return error;
        }

        return 0;
    }

    static int drawArrays(lua_State *L)
    {
        const GLenum mode = (GLenum) luaL_checkinteger(L, 1);
        const GLint first = (GLint) luaL_checkinteger(L, 2);
        const GLsizei count = (GLsizei) luaL_checkinteger(L, 3);

        glDrawArrays(mode, first, count);

        int error = errorCheck(L);
        if (error)
        {
            return error;
        }

        return 0;
    }    

    static int createTexture(lua_State *L)
    {
        GLuint val;
        glGenTextures(1, &val);

        int error = errorCheck(L);
        if (error)
        {
            return error;
        }

        lua_pushinteger(L, val);

        return 1;
    }

    typedef struct ConstPair
    {
        const char *name;
        GLint val;
    } ConstPairs;

    static const struct ConstPair consts[] = {
        {"DOUBLE", GL_DOUBLE},
        {"DEPTH", GL_DEPTH},
        {"ACTIVE_ATTRIBUTES", GL_ACTIVE_ATTRIBUTES},
        {"ACTIVE_TEXTURE", GL_ACTIVE_TEXTURE},
        {"ACTIVE_UNIFORMS", GL_ACTIVE_UNIFORMS},
        {"ALIASED_LINE_WIDTH_RANGE", GL_ALIASED_LINE_WIDTH_RANGE},
        {"ALIASED_POINT_SIZE_RANGE", GL_ALIASED_POINT_SIZE_RANGE},
        {"ALPHA", GL_ALPHA},
        {"ALPHA_BITS", GL_ALPHA_BITS},
        {"ALWAYS", GL_ALWAYS},
        {"ARRAY_BUFFER", GL_ARRAY_BUFFER},
        {"ARRAY_BUFFER_BINDING", GL_ARRAY_BUFFER_BINDING},
        {"ATTACHED_SHADERS", GL_ATTACHED_SHADERS},
        {"BACK", GL_BACK},
        {"BLEND", GL_BLEND},
        {"BLEND_COLOR", GL_BLEND_COLOR},
        {"BLEND_DST_ALPHA", GL_BLEND_DST_ALPHA},
        {"BLEND_DST_RGB", GL_BLEND_DST_RGB},
        {"BLEND_EQUATION", GL_BLEND_EQUATION},
        {"BLEND_EQUATION_ALPHA", GL_BLEND_EQUATION_ALPHA},
        {"BLEND_EQUATION_RGB", GL_BLEND_EQUATION_RGB},
        {"BLEND_SRC_ALPHA", GL_BLEND_SRC_ALPHA},
        {"BLEND_SRC_RGB", GL_BLEND_SRC_RGB},
        {"BLUE_BITS", GL_BLUE_BITS},
        {"BOOL", GL_BOOL},
        {"BOOL_VEC2", GL_BOOL_VEC2},
        {"BOOL_VEC3", GL_BOOL_VEC3},
        {"BOOL_VEC4", GL_BOOL_VEC4},
        //{"BROWSER_DEFAULT_WEBGL", GL_BROWSER_DEFAULT_WEBGL},
        {"BUFFER_SIZE", GL_BUFFER_SIZE},
        {"BUFFER_USAGE", GL_BUFFER_USAGE},
        {"BYTE", GL_BYTE},
        {"CCW", GL_CCW},
        {"CLAMP_TO_EDGE", GL_CLAMP_TO_EDGE},
        {"COLOR_ATTACHMENT0", GL_COLOR_ATTACHMENT0},
        {"COLOR_BUFFER_BIT", GL_COLOR_BUFFER_BIT},
        {"COLOR_CLEAR_VALUE", GL_COLOR_CLEAR_VALUE},
        {"COLOR_WRITEMASK", GL_COLOR_WRITEMASK},
        {"COMPILE_STATUS", GL_COMPILE_STATUS},
        {"COMPRESSED_TEXTURE_FORMATS", GL_COMPRESSED_TEXTURE_FORMATS},
        {"CONSTANT_ALPHA", GL_CONSTANT_ALPHA},
        {"CONSTANT_COLOR", GL_CONSTANT_COLOR},
        //{"CONTEXT_LOST_WEBGL", GL_CONTEXT_LOST_WEBGL},
        {"CULL_FACE", GL_CULL_FACE},
        {"CULL_FACE_MODE", GL_CULL_FACE_MODE},
        {"CURRENT_PROGRAM", GL_CURRENT_PROGRAM},
        {"CURRENT_VERTEX_ATTRIB", GL_CURRENT_VERTEX_ATTRIB},
        {"CW", GL_CW},
        {"DECR", GL_DECR},
        {"DECR_WRAP", GL_DECR_WRAP},
        {"DELETE_STATUS", GL_DELETE_STATUS},
        {"DEPTH_ATTACHMENT", GL_DEPTH_ATTACHMENT},
        {"DEPTH_BITS", GL_DEPTH_BITS},
        {"DEPTH_BUFFER_BIT", GL_DEPTH_BUFFER_BIT},
        {"DEPTH_CLEAR_VALUE", GL_DEPTH_CLEAR_VALUE},
        {"DEPTH_COMPONENT", GL_DEPTH_COMPONENT},
        {"DEPTH_COMPONENT16", GL_DEPTH_COMPONENT16},
        {"DEPTH_FUNC", GL_DEPTH_FUNC},
        {"DEPTH_RANGE", GL_DEPTH_RANGE},
        {"DEPTH_STENCIL", GL_DEPTH_STENCIL},
        {"DEPTH_STENCIL_ATTACHMENT", GL_DEPTH_STENCIL_ATTACHMENT},
        {"DEPTH_TEST", GL_DEPTH_TEST},
        {"DEPTH_WRITEMASK", GL_DEPTH_WRITEMASK},
        {"DITHER", GL_DITHER},
        {"DONT_CARE", GL_DONT_CARE},
        {"DST_ALPHA", GL_DST_ALPHA},
        {"DST_COLOR", GL_DST_COLOR},
        {"DYNAMIC_DRAW", GL_DYNAMIC_DRAW},
        {"ELEMENT_ARRAY_BUFFER", GL_ELEMENT_ARRAY_BUFFER},
        {"ELEMENT_ARRAY_BUFFER_BINDING", GL_ELEMENT_ARRAY_BUFFER_BINDING},
        {"EQUAL", GL_EQUAL},
        {"FASTEST", GL_FASTEST},
        {"FLOAT", GL_FLOAT},
        {"FLOAT_MAT2", GL_FLOAT_MAT2},
        {"FLOAT_MAT3", GL_FLOAT_MAT3},
        {"FLOAT_MAT4", GL_FLOAT_MAT4},
        {"FLOAT_VEC2", GL_FLOAT_VEC2},
        {"FLOAT_VEC3", GL_FLOAT_VEC3},
        {"FLOAT_VEC4", GL_FLOAT_VEC4},
        {"FRAGMENT_SHADER", GL_FRAGMENT_SHADER},
        {"FRAMEBUFFER", GL_FRAMEBUFFER},
        {"FRAMEBUFFER_ATTACHMENT_OBJECT_NAME", GL_FRAMEBUFFER_ATTACHMENT_OBJECT_NAME},
        {"FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE", GL_FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE},
        {"FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE", GL_FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE},
        {"FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL", GL_FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL},
        {"FRAMEBUFFER_BINDING", GL_FRAMEBUFFER_BINDING},
        {"FRAMEBUFFER_COMPLETE", GL_FRAMEBUFFER_COMPLETE},
        {"FRAMEBUFFER_INCOMPLETE_ATTACHMENT", GL_FRAMEBUFFER_INCOMPLETE_ATTACHMENT},
        {"FRAMEBUFFER_INCOMPLETE_DIMENSIONS", GL_FRAMEBUFFER_INCOMPLETE_DIMENSIONS_EXT},
        {"FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT", GL_FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT},
        {"FRAMEBUFFER_UNSUPPORTED", GL_FRAMEBUFFER_UNSUPPORTED},
        {"FRONT", GL_FRONT},
        {"FRONT_AND_BACK", GL_FRONT_AND_BACK},
        {"FRONT_FACE", GL_FRONT_FACE},
        {"FUNC_ADD", GL_FUNC_ADD},
        {"FUNC_REVERSE_SUBTRACT", GL_FUNC_REVERSE_SUBTRACT},
        {"FUNC_SUBTRACT", GL_FUNC_SUBTRACT},
        {"GENERATE_MIPMAP_HINT", GL_GENERATE_MIPMAP_HINT},
        {"GEQUAL", GL_GEQUAL},
        {"GREATER", GL_GREATER},
        {"GREEN_BITS", GL_GREEN_BITS},
        {"HIGH_FLOAT", GL_HIGH_FLOAT},
        {"HIGH_INT", GL_HIGH_INT},
        {"IMPLEMENTATION_COLOR_READ_FORMAT", GL_IMPLEMENTATION_COLOR_READ_FORMAT},
        {"IMPLEMENTATION_COLOR_READ_TYPE", GL_IMPLEMENTATION_COLOR_READ_TYPE},
        {"INCR", GL_INCR},
        {"INCR_WRAP", GL_INCR_WRAP},
        {"INT", GL_INT},
        {"INT_VEC2", GL_INT_VEC2},
        {"INT_VEC3", GL_INT_VEC3},
        {"INT_VEC4", GL_INT_VEC4},
        {"INVALID_ENUM", GL_INVALID_ENUM},
        {"INVALID_FRAMEBUFFER_OPERATION", GL_INVALID_FRAMEBUFFER_OPERATION},
        {"INVALID_OPERATION", GL_INVALID_OPERATION},
        {"INVALID_VALUE", GL_INVALID_VALUE},
        {"INVERT", GL_INVERT},
        {"KEEP", GL_KEEP},
        {"LEQUAL", GL_LEQUAL},
        {"LESS", GL_LESS},
        {"LINEAR", GL_LINEAR},
        {"LINEAR_MIPMAP_LINEAR", GL_LINEAR_MIPMAP_LINEAR},
        {"LINEAR_MIPMAP_NEAREST", GL_LINEAR_MIPMAP_NEAREST},
        {"LINES", GL_LINES},
        {"LINE_LOOP", GL_LINE_LOOP},
        {"LINE_STRIP", GL_LINE_STRIP},
        {"LINE_WIDTH", GL_LINE_WIDTH},
        {"LINK_STATUS", GL_LINK_STATUS},
        {"LOW_FLOAT", GL_LOW_FLOAT},
        {"LOW_INT", GL_LOW_INT},
        {"LUMINANCE", GL_LUMINANCE},
        {"LUMINANCE_ALPHA", GL_LUMINANCE_ALPHA},
        {"MAX_COMBINED_TEXTURE_IMAGE_UNITS", GL_MAX_COMBINED_TEXTURE_IMAGE_UNITS},
        {"MAX_CUBE_MAP_TEXTURE_SIZE", GL_MAX_CUBE_MAP_TEXTURE_SIZE},
        {"MAX_FRAGMENT_UNIFORM_VECTORS", GL_MAX_FRAGMENT_UNIFORM_VECTORS},
        {"MAX_RENDERBUFFER_SIZE", GL_MAX_RENDERBUFFER_SIZE},
        {"MAX_TEXTURE_IMAGE_UNITS", GL_MAX_TEXTURE_IMAGE_UNITS},
        {"MAX_TEXTURE_SIZE", GL_MAX_TEXTURE_SIZE},
        {"MAX_VARYING_VECTORS", GL_MAX_VARYING_VECTORS},
        {"MAX_VERTEX_ATTRIBS", GL_MAX_VERTEX_ATTRIBS},
        {"MAX_VERTEX_TEXTURE_IMAGE_UNITS", GL_MAX_VERTEX_TEXTURE_IMAGE_UNITS},
        {"MAX_VERTEX_UNIFORM_VECTORS", GL_MAX_VERTEX_UNIFORM_VECTORS},
        {"MAX_VIEWPORT_DIMS", GL_MAX_VIEWPORT_DIMS},
        {"MEDIUM_FLOAT", GL_MEDIUM_FLOAT},
        {"MEDIUM_INT", GL_MEDIUM_INT},
        {"MIRRORED_REPEAT", GL_MIRRORED_REPEAT},
        {"NEAREST", GL_NEAREST},
        {"NEAREST_MIPMAP_LINEAR", GL_NEAREST_MIPMAP_LINEAR},
        {"NEAREST_MIPMAP_NEAREST", GL_NEAREST_MIPMAP_NEAREST},
        {"NEVER", GL_NEVER},
        {"NICEST", GL_NICEST},
        {"NONE", GL_NONE},
        {"NOTEQUAL", GL_NOTEQUAL},
        {"NO_ERROR", GL_NO_ERROR},
        {"ONE", GL_ONE},
        {"ONE_MINUS_CONSTANT_ALPHA", GL_ONE_MINUS_CONSTANT_ALPHA},
        {"ONE_MINUS_CONSTANT_COLOR", GL_ONE_MINUS_CONSTANT_COLOR},
        {"ONE_MINUS_DST_ALPHA", GL_ONE_MINUS_DST_ALPHA},
        {"ONE_MINUS_DST_COLOR", GL_ONE_MINUS_DST_COLOR},
        {"ONE_MINUS_SRC_ALPHA", GL_ONE_MINUS_SRC_ALPHA},
        {"ONE_MINUS_SRC_COLOR", GL_ONE_MINUS_SRC_COLOR},
        {"OUT_OF_MEMORY", GL_OUT_OF_MEMORY},
        {"PACK_ALIGNMENT", GL_PACK_ALIGNMENT},
        {"POINTS", GL_POINTS},
        {"POLYGON_OFFSET_FACTOR", GL_POLYGON_OFFSET_FACTOR},
        {"POLYGON_OFFSET_FILL", GL_POLYGON_OFFSET_FILL},
        {"POLYGON_OFFSET_UNITS", GL_POLYGON_OFFSET_UNITS},
        {"RED_BITS", GL_RED_BITS},
        {"RENDERBUFFER", GL_RENDERBUFFER},
        {"RENDERBUFFER_ALPHA_SIZE", GL_RENDERBUFFER_ALPHA_SIZE},
        {"RENDERBUFFER_BINDING", GL_RENDERBUFFER_BINDING},
        {"RENDERBUFFER_BLUE_SIZE", GL_RENDERBUFFER_BLUE_SIZE},
        {"RENDERBUFFER_DEPTH_SIZE", GL_RENDERBUFFER_DEPTH_SIZE},
        {"RENDERBUFFER_GREEN_SIZE", GL_RENDERBUFFER_GREEN_SIZE},
        {"RENDERBUFFER_HEIGHT", GL_RENDERBUFFER_HEIGHT},
        {"RENDERBUFFER_INTERNAL_FORMAT", GL_RENDERBUFFER_INTERNAL_FORMAT},
        {"RENDERBUFFER_RED_SIZE", GL_RENDERBUFFER_RED_SIZE},
        {"RENDERBUFFER_STENCIL_SIZE", GL_RENDERBUFFER_STENCIL_SIZE},
        {"RENDERBUFFER_WIDTH", GL_RENDERBUFFER_WIDTH},
        {"RENDERER", GL_RENDERER},
        {"REPEAT", GL_REPEAT},
        {"REPLACE", GL_REPLACE},
        {"RGB", GL_RGB},
        {"RGB565", GL_RGB565},
        {"RGB5_A1", GL_RGB5_A1},
        {"RGBA", GL_RGBA},
        {"RGBA4", GL_RGBA4},
        {"SAMPLER_2D", GL_SAMPLER_2D},
        {"SAMPLER_CUBE", GL_SAMPLER_CUBE},
        {"SAMPLES", GL_SAMPLES},
        {"SAMPLE_ALPHA_TO_COVERAGE", GL_SAMPLE_ALPHA_TO_COVERAGE},
        {"SAMPLE_BUFFERS", GL_SAMPLE_BUFFERS},
        {"SAMPLE_COVERAGE", GL_SAMPLE_COVERAGE},
        {"SAMPLE_COVERAGE_INVERT", GL_SAMPLE_COVERAGE_INVERT},
        {"SAMPLE_COVERAGE_VALUE", GL_SAMPLE_COVERAGE_VALUE},
        {"SCISSOR_BOX", GL_SCISSOR_BOX},
        {"SCISSOR_TEST", GL_SCISSOR_TEST},
        {"SHADER_TYPE", GL_SHADER_TYPE},
        {"SHADING_LANGUAGE_VERSION", GL_SHADING_LANGUAGE_VERSION},
        {"SHORT", GL_SHORT},
        {"SRC_ALPHA", GL_SRC_ALPHA},
        {"SRC_ALPHA_SATURATE", GL_SRC_ALPHA_SATURATE},
        {"SRC_COLOR", GL_SRC_COLOR},
        {"STATIC_DRAW", GL_STATIC_DRAW},
        {"STENCIL_ATTACHMENT", GL_STENCIL_ATTACHMENT},
        {"STENCIL_BACK_FAIL", GL_STENCIL_BACK_FAIL},
        {"STENCIL_BACK_FUNC", GL_STENCIL_BACK_FUNC},
        {"STENCIL_BACK_PASS_DEPTH_FAIL", GL_STENCIL_BACK_PASS_DEPTH_FAIL},
        {"STENCIL_BACK_PASS_DEPTH_PASS", GL_STENCIL_BACK_PASS_DEPTH_PASS},
        {"STENCIL_BACK_REF", GL_STENCIL_BACK_REF},
        {"STENCIL_BACK_VALUE_MASK", GL_STENCIL_BACK_VALUE_MASK},
        {"STENCIL_BACK_WRITEMASK", GL_STENCIL_BACK_WRITEMASK},
        {"STENCIL_BITS", GL_STENCIL_BITS},
        {"STENCIL_BUFFER_BIT", GL_STENCIL_BUFFER_BIT},
        {"STENCIL_CLEAR_VALUE", GL_STENCIL_CLEAR_VALUE},
        {"STENCIL_FAIL", GL_STENCIL_FAIL},
        {"STENCIL_FUNC", GL_STENCIL_FUNC},
        {"STENCIL_INDEX8", GL_STENCIL_INDEX8},
        {"STENCIL_PASS_DEPTH_FAIL", GL_STENCIL_PASS_DEPTH_FAIL},
        {"STENCIL_PASS_DEPTH_PASS", GL_STENCIL_PASS_DEPTH_PASS},
        {"STENCIL_REF", GL_STENCIL_REF},
        {"STENCIL_TEST", GL_STENCIL_TEST},
        {"STENCIL_VALUE_MASK", GL_STENCIL_VALUE_MASK},
        {"STENCIL_WRITEMASK", GL_STENCIL_WRITEMASK},
        {"STREAM_DRAW", GL_STREAM_DRAW},
        {"SUBPIXEL_BITS", GL_SUBPIXEL_BITS},
        {"TEXTURE", GL_TEXTURE},
        {"TEXTURE0", GL_TEXTURE0},
        {"TEXTURE1", GL_TEXTURE1},
        {"TEXTURE10", GL_TEXTURE10},
        {"TEXTURE11", GL_TEXTURE11},
        {"TEXTURE12", GL_TEXTURE12},
        {"TEXTURE13", GL_TEXTURE13},
        {"TEXTURE14", GL_TEXTURE14},
        {"TEXTURE15", GL_TEXTURE15},
        {"TEXTURE16", GL_TEXTURE16},
        {"TEXTURE17", GL_TEXTURE17},
        {"TEXTURE18", GL_TEXTURE18},
        {"TEXTURE19", GL_TEXTURE19},
        {"TEXTURE2", GL_TEXTURE2},
        {"TEXTURE20", GL_TEXTURE20},
        {"TEXTURE21", GL_TEXTURE21},
        {"TEXTURE22", GL_TEXTURE22},
        {"TEXTURE23", GL_TEXTURE23},
        {"TEXTURE24", GL_TEXTURE24},
        {"TEXTURE25", GL_TEXTURE25},
        {"TEXTURE26", GL_TEXTURE26},
        {"TEXTURE27", GL_TEXTURE27},
        {"TEXTURE28", GL_TEXTURE28},
        {"TEXTURE29", GL_TEXTURE29},
        {"TEXTURE3", GL_TEXTURE3},
        {"TEXTURE30", GL_TEXTURE30},
        {"TEXTURE31", GL_TEXTURE31},
        {"TEXTURE4", GL_TEXTURE4},
        {"TEXTURE5", GL_TEXTURE5},
        {"TEXTURE6", GL_TEXTURE6},
        {"TEXTURE7", GL_TEXTURE7},
        {"TEXTURE8", GL_TEXTURE8},
        {"TEXTURE9", GL_TEXTURE9},
        {"TEXTURE_2D", GL_TEXTURE_2D},
        {"TEXTURE_BINDING_2D", GL_TEXTURE_BINDING_2D},
        {"TEXTURE_BINDING_CUBE_MAP", GL_TEXTURE_BINDING_CUBE_MAP},
        {"TEXTURE_CUBE_MAP", GL_TEXTURE_CUBE_MAP},
        {"TEXTURE_CUBE_MAP_NEGATIVE_X", GL_TEXTURE_CUBE_MAP_NEGATIVE_X},
        {"TEXTURE_CUBE_MAP_NEGATIVE_Y", GL_TEXTURE_CUBE_MAP_NEGATIVE_Y},
        {"TEXTURE_CUBE_MAP_NEGATIVE_Z", GL_TEXTURE_CUBE_MAP_NEGATIVE_Z},
        {"TEXTURE_CUBE_MAP_POSITIVE_X", GL_TEXTURE_CUBE_MAP_POSITIVE_X},
        {"TEXTURE_CUBE_MAP_POSITIVE_Y", GL_TEXTURE_CUBE_MAP_POSITIVE_Y},
        {"TEXTURE_CUBE_MAP_POSITIVE_Z", GL_TEXTURE_CUBE_MAP_POSITIVE_Z},
        {"TEXTURE_MAG_FILTER", GL_TEXTURE_MAG_FILTER},
        {"TEXTURE_MIN_FILTER", GL_TEXTURE_MIN_FILTER},
        {"TEXTURE_WRAP_S", GL_TEXTURE_WRAP_S},
        {"TEXTURE_WRAP_T", GL_TEXTURE_WRAP_T},
        {"TRIANGLES", GL_TRIANGLES},
        {"TRIANGLE_FAN", GL_TRIANGLE_FAN},
        {"TRIANGLE_STRIP", GL_TRIANGLE_STRIP},
        {"UNIFORM_BUFFER", GL_UNIFORM_BUFFER},
        {"UNPACK_ALIGNMENT", GL_UNPACK_ALIGNMENT},
        //{"UNPACK_COLORSPACE_CONVERSION_WEBGL", GL_UNPACK_COLORSPACE_CONVERSION_WEBGL},
        //{"UNPACK_FLIP_Y_WEBGL", GL_UNPACK_FLIP_Y_WEBGL},
        //{"UNPACK_PREMULTIPLY_ALPHA_WEBGL", GL_UNPACK_PREMULTIPLY_ALPHA_WEBGL},
        {"UNSIGNED_BYTE", GL_UNSIGNED_BYTE},
        {"UNSIGNED_INT", GL_UNSIGNED_INT},
        {"UNSIGNED_SHORT", GL_UNSIGNED_SHORT},
        {"UNSIGNED_SHORT_4_4_4_4", GL_UNSIGNED_SHORT_4_4_4_4},
        {"UNSIGNED_SHORT_5_5_5_1", GL_UNSIGNED_SHORT_5_5_5_1},
        {"UNSIGNED_SHORT_5_6_5", GL_UNSIGNED_SHORT_5_6_5},
        {"VALIDATE_STATUS", GL_VALIDATE_STATUS},
        {"VENDOR", GL_VENDOR},
        {"VERSION", GL_VERSION},
        {"VERTEX_ATTRIB_ARRAY_BUFFER_BINDING", GL_VERTEX_ATTRIB_ARRAY_BUFFER_BINDING},
        {"VERTEX_ATTRIB_ARRAY_ENABLED", GL_VERTEX_ATTRIB_ARRAY_ENABLED},
        {"VERTEX_ATTRIB_ARRAY_NORMALIZED", GL_VERTEX_ATTRIB_ARRAY_NORMALIZED},
        {"VERTEX_ATTRIB_ARRAY_POINTER", GL_VERTEX_ATTRIB_ARRAY_POINTER},
        {"VERTEX_ATTRIB_ARRAY_SIZE", GL_VERTEX_ATTRIB_ARRAY_SIZE},
        {"VERTEX_ATTRIB_ARRAY_STRIDE", GL_VERTEX_ATTRIB_ARRAY_STRIDE},
        {"VERTEX_ATTRIB_ARRAY_TYPE", GL_VERTEX_ATTRIB_ARRAY_TYPE},
        {"VERTEX_SHADER", GL_VERTEX_SHADER},
        {"VIEWPORT", GL_VIEWPORT},
        {"ZERO", GL_ZERO}};

    static void AddConstsGL(lua_State *L)
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

    static const struct luaL_Reg webgl[] = {
        {"init", initGL},
        {"error", error},
        {"flush", flush},
        {"clear", clear},
        {"clearColor", clearColor},
        {"clearDepth", clearDepth},
        {"clearStencil", clearStencil},
        {"viewport", viewport},
        {"createBuffer", createBuffer},
        {"bindBuffer", bindBuffer},
        {"bindBufferBase", bindBufferBase},
        {"bufferData", bufferData},
        {"bufferSubData", bufferSubData},
        {"createShader", createShader},
        {"shaderSource", shaderSource},
        {"compileShader", compileShader},
        {"getParameter", getParameter},
        {"getShaderParameter", getShaderParameter},
        {"getShaderInfoLog", getShaderInfoLog},
        {"getShaderPrecisionFormat", getShaderPrecisionFormat},
        {"createProgram", createProgram},
        {"getProgramInfoLog", getProgramInfoLog},
        {"attachShader", attachShader},
        {"linkProgram", linkProgram},
        {"getProgramParameter", getProgramParameter},
        {"deleteShader", deleteShader},
        {"deleteProgram", deleteProgram},
        {"getUniformBlockIndex", getUniformBlockIndex},
        {"uniformBlockBinding", uniformBlockBinding},
        {"getUniformLocation", getUniformLocation},
        {"getAttribLocation", getAttribLocation},
        {"useProgram", useProgram},
        {"validateProgram", validateProgram},
        {"createVertexArray", createVertexArray},
        {"bindVertexArray", bindVertexArray},
        {"enableVertexAttribArray", enableVertexAttribArray},
        {"disableVertexAttribArray", disableVertexAttribArray},
        {"vertexAttribPointer", vertexAttribPointer},
        {"uniformMatrix2fv", uniformMatrix2fv},
        {"uniformMatrix3fv", uniformMatrix3fv},
        {"uniformMatrix4fv", uniformMatrix4fv},
        {"depthMask", depthMask},
        {"depthFunc", depthFunc},
        {"stencilMask", stencilMask},
        {"stencilFunc", stencilFunc},
        {"stencilOp", stencilOp},
        {"enable", enable},
        {"disable", disable},
        {"uniform1i", uniform1i},
        {"uniform2i", uniform2i},
        {"uniform3i", uniform3i},
        {"uniform4i", uniform4i},
        {"uniform1iv", uniform1iv},
        {"uniform2iv", uniform2iv},
        {"uniform3iv", uniform3iv},
        {"uniform4iv", uniform4iv},
        {"uniform1f", uniform1f},
        {"uniform2f", uniform2f},
        {"uniform3f", uniform3f},
        {"uniform4f", uniform4f},
        {"uniform1fv", uniform1fv},
        {"uniform2fv", uniform2fv},
        {"uniform3fv", uniform3fv},
        {"uniform4fv", uniform4fv},
        {"cullFace", cullFace},
        {"frontFace", frontFace},
        {"drawElements", drawElements},
        {"drawArrays", drawArrays},
        {"createTexture", createTexture},
        {NULL, NULL} /* sentinel */
    };

    //name of this function is not flexible
    LIBRARY_API int luaopen_webgl(lua_State *L)
    {
        luaL_newlib(L, webgl);
        AddConstsGL(L);
        return 1;
    }

#ifdef __cplusplus
}
#endif
