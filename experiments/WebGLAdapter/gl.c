#include <GL/glew.h>
#include <GL/glut.h>

#ifdef __cplusplus
#include "lua.hpp"
#else
#include "lua.h"
#include "lualib.h"
#include "lauxlib.h"
#endif

#ifdef __cplusplus
extern "C" {
#endif

	static int createBuffer() {
		::GLuint val;
		glGenBuffers(1, &val);
		return val;
	}

	//library to be registered
	static const struct luaL_Reg webgl[] = {
		  {"createBuffer", createBuffer},
		  {NULL, NULL}  /* sentinel */
	};

	//name of this function is not flexible
	int luaopen_webgl(lua_State *L) {
		luaL_newlib(L, webgl);
		return 1;
	}

#ifdef __cplusplus
}
#endif
