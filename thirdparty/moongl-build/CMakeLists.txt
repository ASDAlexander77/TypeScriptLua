cmake_minimum_required (VERSION 2.8 FATAL_ERROR)

project (moongl) 

SET(CWARNSCPP "-Wextra -Wshadow	-Wsign-compare -Wundef -Wwrite-strings -Wredundant-decls -Wdisabled-optimization -Wdouble-promotion -Wstrict-aliasing=3 -Wno-aggressive-loop-optimizations -Wlogical-op -Werror")

# The next warnings are neither valid nor needed for C++
SET(CWARNSC "-Wdeclaration-after-statement -Wmissing-prototypes -Wnested-externs -Wstrict-prototypes -Wc++-compat -Wold-style-definition")

if (MSVC)
    SET(MYCFLAGS "/DLUA_USE_WINDOWS")
    SET(MYCFLAGS "${MYCFLAGS} /DGL_CONTEXT_FLAG_ROBUST_ACCESS_BIT=GL_CONTEXT_FLAG_ROBUST_ACCESS_BIT_ARB /Duint32_t=int")

    SET(BUILD_ARCH "win32")
    SET(CMAKE_CXX_FLAGS_DEBUG "${CMAKE_CXX_FLAGS_DEBUG} /Od /Zi /EHsc /DDEBUG /wd4250 /wd4200 /wd4291 /wd4996 /wd4800 /MP8 /bigobj ${MYCFLAGS}")
    SET(CMAKE_CXX_FLAGS_RELEASE "${CMAKE_CXX_FLAGS_RELEASE} /Ox /EHsc /wd4250 /wd4200 /wd4291 /wd4996 /wd4800 /MP8 /bigobj ${MYCFLAGS}")
    SET(CMAKE_C_FLAGS_DEBUG "${CMAKE_C_FLAGS_DEBUG} ${MYCFLAGS}")
    SET(CMAKE_C_FLAGS_RELEASE "${CMAKE_C_FLAGS_RELEASE} ${MYCFLAGS}")
    set(CMAKE_EXE_LINKER_FLAGS "${CMAKE_EXE_LINKER_FLAGS} /ignore:4006 /ignore:4049 /ignore:4217")
else()
    if (CMAKE_SYSTEM_NAME STREQUAL "Android")
    	SET(MYCFLAGS "-DLUA_USE_LINUX")
    	SET(MYLIBS dl m)

        SET(EXTRA_CXX_FLAGS "${CWARNSCPP}")
        SET(EXTRA_C_FLAGS "${CWARNSC}")
        SET(BUILD_ARCH "vs_android")

    elseif (CMAKE_SYSTEM_NAME STREQUAL "Windows")
    	SET(MYCFLAGS "-DLUA_USE_WINDOWS")
    	SET(MYLIBS )

        SET(EXTRA_CXX_FLAGS "${CWARNSCPP}")
        SET(EXTRA_C_FLAGS "${CWARNSC}")
        SET(BUILD_ARCH "mingw32")

	set(LUA_LIBRARY "${CMAKE_SOURCE_DIR}/../lua-build/__build/mingw32/libcore.a")
	
    else()
    	#SET(MYCFLAGS "-DLUA_USE_LINUX -DLUA_USE_READLINE")
    	#SET(MYLIBS dl m readline)
    	SET(MYCFLAGS "-DLUA_USE_LINUX")
    	SET(MYLIBS dl m)

        SET(EXTRA_CXX_FLAGS "${CWARNSCPP} ${MYCFLAGS}")
        SET(EXTRA_C_FLAGS "${CWARNSC} ${MYCFLAGS}")
        SET(BUILD_ARCH "linux")
    endif()

    SET(MYCFLAGS "${MYCFLAGS} -DGL_CONTEXT_FLAG_ROBUST_ACCESS_BIT=GL_CONTEXT_FLAG_ROBUST_ACCESS_BIT_ARB")

    SET(CMAKE_CXX_FLAGS_DEBUG "${CMAKE_CXX_FLAGS_DEBUG} -O0 ${EXTRA_CXX_FLAGS} -ggdb ${MYCFLAGS}")
    SET(CMAKE_CXX_FLAGS_RELEASE "${CMAKE_CXX_FLAGS_RELEASE} -Wall -O2 ${EXTRA_CXX_FLAGS} -Wfatal-errors -fno-stack-protector -fno-common ${MYCFLAGS}")
    SET(CMAKE_C_FLAGS_DEBUG "${CMAKE_C_FLAGS_DEBUG} -O0 ${EXTRA_C_FLAGS} -ggdb ${MYCFLAGS}")
    SET(CMAKE_C_FLAGS_RELEASE "${CMAKE_C_FLAGS_RELEASE} -Wall -O2 ${EXTRA_C_FLAGS} -Wfatal-errors -fno-stack-protector -fno-common ${MYCFLAGS}")
endif()

file(GLOB MOONGL_SRC
    "${PROJECT_SOURCE_DIR}/../moongl/src/*.c"
)

include_directories("${PROJECT_SOURCE_DIR}/../lua/src/")

#-----------------------------------------------------------------------------
# Configure OpenGL

find_package(OpenGL)

#-----------------------------------------------------------------------------
# Configure GLEW

if(WITH_SYSTEM_GLEW)
	find_package(GLEW)

	mark_as_advanced(
		GLEW_LIBRARY
		GLEW_INCLUDE_PATH
	)
else()
	if(WIN32)
		set(GLEW_INCLUDE_PATH "${CMAKE_SOURCE_DIR}/../Binaries/GLEW/include")
		if (MSVC)
			set(GLEW_LIBRARY "${CMAKE_SOURCE_DIR}/../Binaries/GLEW/lib/Win/x86/glew32.lib")
		else()
			set(GLEW_LIBRARY "${CMAKE_SOURCE_DIR}/../glew-build/__build/mingw32/lib/libglew32.dll.a")
		endif()
	endif()
endif()

#-----------------------------------------------------------------------------
# Configure GLUT

if(WITH_SYSTEM_GLUT)
	find_package(GLUT)

	mark_as_advanced(
		GLUT_LIBRARY
		GLUT_INCLUDE_PATH
	)
else()
	if(WIN32)		
		set(GLUT_INCLUDE_PATH "${CMAKE_SOURCE_DIR}/../Binaries/freeglut/include")
		if (MSVC)
			set(GLUT_LIBRARY "${CMAKE_SOURCE_DIR}/../Binaries/freeglut/lib/freeglut.lib")
		else()
			set(GLUT_LIBRARY "${CMAKE_SOURCE_DIR}/../Binaries/freeglut/lib/libfreeglut.a")
		endif()
	endif()
endif()

include_directories(SYSTEM 
	${GLEW_INCLUDE_PATH}
	${GLUT_INCLUDE_PATH}
)

MESSAGE("GLEW: ${GLEW_LIBRARY}")

add_library (moongl SHARED ${MOONGL_SRC})
target_link_libraries (moongl ${LUA_LIBRARY} ${OPENGL_gl_LIBRARY} ${OPENGL_glu_LIBRARY} ${GLEW_LIBRARY} ${GLUT_LIBRARY})

add_custom_command(TARGET moongl POST_BUILD COMMAND ${CMAKE_COMMAND} -E copy_if_different $<TARGET_FILE:moongl> "${PROJECT_SOURCE_DIR}/../../__dist") 