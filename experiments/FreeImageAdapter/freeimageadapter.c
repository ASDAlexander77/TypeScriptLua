#ifdef __cplusplus
#include "lua.hpp"
#else
#include "lua.h"
#include "lualib.h"
#include "lauxlib.h"
#endif

#include <freeimage.h>

#ifdef _WIN32
#define LIBRARY_API extern __declspec(dllexport)
#elif
#define LIBRARY_API static
#endif

#ifdef __cplusplus
extern "C"
{
#endif

    static int FreeImage_GetFileType_Wrapper(lua_State *L)
    {
        const char *filePath = luaL_checkstring(L, 1);
        int size = luaL_checkinteger(L, 2);

        FREE_IMAGE_FORMAT fif = FreeImage_GetFileType(filePath, size);

        lua_pushinteger(L, fif);

        return 1;
    }

    static int FreeImage_GetFIFFromFilename_Wrapper(lua_State *L)
    {
        return 0;
    }

    static int FreeImage_FIFSupportsReading_Wrapper(lua_State *L)
    {
        return 0;
    }

    static int FreeImage_Load_Wrapper(lua_State *L)
    {
        return 0;
    }

    static int FreeImage_ConvertTo32Bits_Wrapper(lua_State *L)
    {
        return 0;
    }

    static int FreeImage_GetWidth_Wrapper(lua_State *L)
    {
        return 0;
    }

    static int FreeImage_GetHeight_Wrapper(lua_State *L)
    {
        return 0;
    }

    static int FreeImage_GetBits_Wrapper(lua_State *L)
    {
        return 0;
    }

    static int FreeImage_Unload_Wrapper(lua_State *L)
    {
        return 0;
    }

    static const struct luaL_Reg freeimageadapter[] = {
        {"getFileType", FreeImage_GetFileType_Wrapper},
        {"getFIFFromFilename", FreeImage_GetFIFFromFilename_Wrapper},
        {"fifSupportsReading", FreeImage_FIFSupportsReading_Wrapper},
        {"load", FreeImage_Load_Wrapper},
        {"convertTo32Bits", FreeImage_ConvertTo32Bits_Wrapper},
        {"getWidth", FreeImage_GetWidth_Wrapper},
        {"getHeight", FreeImage_GetHeight_Wrapper},
        {"getBits", FreeImage_GetBits_Wrapper},
        {"unload", FreeImage_Unload_Wrapper},
        {NULL, NULL} /* sentinel */
    };

    //name of this function is not flexible
    LIBRARY_API int luaopen_freeimageadapter(lua_State *L)
    {
        luaL_newlib(L, freeimageadapter);
        return 1;
    }

#ifdef __cplusplus
}
#endif
