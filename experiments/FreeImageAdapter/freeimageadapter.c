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

#define FREEIMAGE_GC_METATABLENAME "__freeimage_adapter_metatable"

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

        // TODO: do not forget to free it
        //FreeImage_Unload(dib);

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

        // TODO: do not forget to free it
        //FreeImage_Unload(dib);

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

    static void FreeImage_SwapColorOrder(BYTE *target, BYTE *source, int width_in_pixels, int step) 
    {
        for (int cols = 0; cols < width_in_pixels; cols++) 
        {
            auto tmp = target[FI_RGBA_RED];
            target[FI_RGBA_RED] = source[FI_RGBA_BLUE];
            target[FI_RGBA_BLUE] = tmp;	
            target += step;
            source += step;
        }
    }

    static int FreeImage_LoadImage_Wrapper(lua_State *L)
    {
        const char *filePath = luaL_checkstring(L, 1);

        // load image
        FREE_IMAGE_FORMAT fif = FIF_UNKNOWN;
        // pointer to the image, once loaded
        FIBITMAP *dib;

        // check the file signature and deduce its format
        fif = FreeImage_GetFileType(filePath, 0);
        // if still unknown, try to guess the file format from the file extension
        if (fif == FIF_UNKNOWN) 
        {
            fif = FreeImage_GetFIFFromFilename(filePath);
        }

        // if still unkown, return failure
        if (fif == FIF_UNKNOWN)
        {
            lua_pushnil(L);
            return 1;
        }

        // check that the plugin has reading capabilities and load the file
        if (FreeImage_FIFSupportsReading(fif))
        {
            dib = FreeImage_Load(fif, filePath, 0);
        }

        // if the image failed to load, return failure
        if (!dib)
        {
            lua_pushnil(L);
            return 1;
        }

        // retrieve the image data
        // get the image width and height
        int is32bit = 0;
        if (fif != FIF_JPEG) {
            FIBITMAP *dib32bit = FreeImage_ConvertTo32Bits(dib);

            // Free FreeImage's copy of the data
            FreeImage_Unload(dib);

            dib = dib32bit;
            is32bit = 1;
        }

        int width = FreeImage_GetWidth(dib);
        int height = FreeImage_GetHeight(dib);

        // fix color order
        for (int rows = 0; rows < height; rows++) {
            FreeImage_SwapColorOrder(FreeImage_GetScanLine(dib, rows), FreeImage_GetScanLine(dib, rows), width, is32bit ? 4 : 3);
        }

        unsigned char* bits = FreeImage_GetBits(dib);

        // if this somehow one of these failed (they shouldn't), return failure
        if ((bits == 0) || (width == 0) || (height == 0))
        {
            FreeImage_Unload(dib);
            lua_pushnil(L);
            return 1;
        }

        // Free FreeImage's copy of the data
        //FreeImage_Unload(dib);

        lua_newtable(L);

        lua_pushstring(L, "width");
        lua_pushinteger(L, width);
        lua_settable(L, -3);    

        lua_pushstring(L, "height");
        lua_pushinteger(L, height);
        lua_settable(L, -3);                    

        // add allocated data;
        lua_pushstring(L, "dib");
        lua_pushlightuserdata(L, dib);
        lua_settable(L, -3);           

        lua_pushstring(L, "bits");
        lua_pushlightuserdata(L, bits);
        lua_settable(L, -3);           

        lua_pushstring(L, "is32bit");
        lua_pushboolean(L, is32bit);
        lua_settable(L, -3);              

        // set metatable
        luaL_getmetatable(L, FREEIMAGE_GC_METATABLENAME);
        lua_setmetatable(L, -2);        

        return 1;
    }

    static int reg_gc (lua_State *L)
    {
        lua_getfield(L, -1, "dib");
        if (lua_islightuserdata(L, 1)) 
        {
            FIBITMAP * dib = (FIBITMAP *) lua_topointer(L, 1);
            FreeImage_Unload(dib);
        }

        return 1; /* new userdatum is already on the stack */
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
        {"loadImage", FreeImage_LoadImage_Wrapper},
        {NULL, NULL} /* sentinel */
    };

    //name of this function is not flexible
    LIBRARY_API int luaopen_freeimageadapter(lua_State *L)
    {
        // we need to create metatable for UserData to set __gc to clear the resource up later
        luaL_newmetatable(L, FREEIMAGE_GC_METATABLENAME);
        
        /* set its __gc field */
        lua_pushstring(L, "__gc");
        lua_pushcfunction(L, reg_gc);
        lua_settable(L, -3);

        luaL_newlib(L, freeimageadapter);
        return 1;
    }

#ifdef __cplusplus
}
#endif
