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
        int size = (int) (!lua_isnoneornil(L, 2) ? luaL_checkinteger(L, 2) : 0);

        FREE_IMAGE_FORMAT fif = FreeImage_GetFileType(filePath, size);

        lua_pushinteger(L, fif);

        return 1;
    }

    static int FreeImage_GetFIFFromFilename_Wrapper(lua_State *L)
    {
        const char *filePath = luaL_checkstring(L, 1);

        FREE_IMAGE_FORMAT fif = FreeImage_GetFIFFromFilename(filePath);

        lua_pushinteger(L, fif);

        return 1;
    }

    static int FreeImage_FIFSupportsReading_Wrapper(lua_State *L)
    {
        FREE_IMAGE_FORMAT fif = (FREE_IMAGE_FORMAT) luaL_checkinteger(L, 1);

        BOOL val = FreeImage_FIFSupportsReading(fif);

        lua_pushboolean(L, val ? 1 : 0);

        return 1;
    }

    static int FreeImage_Load_Wrapper(lua_State *L)
    {
        FREE_IMAGE_FORMAT fif = (FREE_IMAGE_FORMAT) luaL_checkinteger(L, 1);
        const char *filePath = luaL_checkstring(L, 2);
        int flags = (int) (!lua_isnoneornil(L, 3) ? luaL_checkinteger(L, 3) : 0);

        FIBITMAP *dib;
        dib = FreeImage_Load(fif, filePath, flags);

        lua_pushlightuserdata(L, dib);

        return 1;
    }

    static int FreeImage_ConvertTo32Bits_Wrapper(lua_State *L)
    {
        FIBITMAP *dib = (FIBITMAP *) (lua_islightuserdata(L, 1) ? lua_topointer(L, 1) : NULL);
        if (!dib) 
        {
            luaL_argerror(L, 1, "No image data");
        }

        FIBITMAP *dib32bit;
        dib32bit = FreeImage_ConvertTo32Bits(dib);

        FreeImage_Unload(dib);

        lua_pushlightuserdata(L, dib32bit);

        return 1;
    }

    static int FreeImage_GetWidth_Wrapper(lua_State *L)
    {
        FIBITMAP *dib = (FIBITMAP *) (lua_islightuserdata(L, 1) ? lua_topointer(L, 1) : NULL);
        if (!dib) 
        {
            luaL_argerror(L, 1, "No image data");
        }

        int width = FreeImage_GetWidth(dib);

        lua_pushnumber(L, width);

        return 1;
    }

    static int FreeImage_GetHeight_Wrapper(lua_State *L)
    {
        FIBITMAP *dib = (FIBITMAP *) (lua_islightuserdata(L, 1) ? lua_topointer(L, 1) : NULL);
        if (!dib) 
        {
            luaL_argerror(L, 1, "No image data");
        }

        int height = FreeImage_GetHeight(dib);

        lua_pushnumber(L, height);

        return 1;
    }

    static int FreeImage_GetBits_Wrapper(lua_State *L)
    {
        FIBITMAP *dib = (FIBITMAP *) (lua_islightuserdata(L, 1) ? lua_topointer(L, 1) : NULL);
        if (!dib) 
        {
            luaL_argerror(L, 1, "No image data");
        }

        unsigned char* bits;
	    bits = FreeImage_GetBits(dib);

        FreeImage_Unload(dib);

        lua_pushlightuserdata(L, bits);

        return 1;
    }

    static int FreeImage_Unload_Wrapper(lua_State *L)
    {
        FIBITMAP *dib = (FIBITMAP *) (lua_islightuserdata(L, 1) ? lua_topointer(L, 1) : NULL);
        if (!dib) 
        {
            luaL_argerror(L, 1, "No image data");
        }

        FreeImage_Unload(dib);

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
