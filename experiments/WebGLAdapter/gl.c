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

    static int bindBuffer(lua_State *L)
    {
        const GLenum target = luaL_checkinteger(L, 1);
        const GLuint val = luaL_checkinteger(L, 2);
        glBindBuffer(target, val);

        int error = errorCheck(L);
        if (error)
        {
            return error;
        }

        return 0;
    }

    typedef struct ArrayContainerType {
        size_t bytesLength;
        unsigned char data[1];
    } ArrayContainer;

    static int bufferData(lua_State *L)
    {
        GLenum target;
        size_t len;
        const char *data;
        GLbitfield flags;

        target = luaL_checkinteger(L, 1);

        if (lua_type(L, 2) == LUA_TUSERDATA) 
        {
            ArrayContainer* userdata = lua_topointer(L, 2);
            len = userdata->bytesLength;
            data = &userdata->data;
        } 
        else 
        {
            return luaL_argerror(L, 2, "Bad argument, <number>, <user_data>, <number>");
        }

        flags = luaL_checkinteger(L, 3);

        glBufferData(target, len, data, flags);

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

    static int enable(lua_State *L)
    {
        const GLenum cap = luaL_checknumber(L, 1);

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
        const GLenum cap = luaL_checknumber(L, 1);

        glDisable(cap);

        int error = errorCheck(L);
        if (error)
        {
            return error;
        }

        return 0;
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
        {"flush", flush},
        {"clear", clear},
        {"clearColor", clearColor},
        {"createBuffer", createBuffer},
        {"bindBuffer", bindBuffer},
        {"bufferData", bufferData},
        {"depthMask", depthMask},
        {"enable", enable},
        {"disable", disable},
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
