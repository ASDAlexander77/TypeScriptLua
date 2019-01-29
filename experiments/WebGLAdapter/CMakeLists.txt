cmake_minimum_required (VERSION 2.8 FATAL_ERROR)

project (wrappers) 

if (MSVC)
    SET(MYCFLAGS "")

    SET(BUILD_ARCH "win32")
    SET(CMAKE_CXX_FLAGS_DEBUG "${CMAKE_CXX_FLAGS_DEBUG} /Od /Zi /EHsc /DDEBUG /wd4250 /wd4200 /wd4291 /wd4996 /wd4800 /MP8 /bigobj ${MYCFLAGS}")
    SET(CMAKE_CXX_FLAGS_RELEASE "${CMAKE_CXX_FLAGS_RELEASE} /Ox /EHsc /wd4250 /wd4200 /wd4291 /wd4996 /wd4800 /MP8 /bigobj ${MYCFLAGS}")
    SET(CMAKE_C_FLAGS_DEBUG "${CMAKE_C_FLAGS_DEBUG} ${MYCFLAGS}")
    SET(CMAKE_C_FLAGS_RELEASE "${CMAKE_C_FLAGS_RELEASE} ${MYCFLAGS}")
    set(CMAKE_EXE_LINKER_FLAGS "${CMAKE_EXE_LINKER_FLAGS} /ignore:4006 /ignore:4049 /ignore:4217")

    set(LUA_LIBRARY "${CMAKE_SOURCE_DIR}/../../thirdparty/lua-build/__build/win64/${CMAKE_BUILD_TYPE}/lua53.lib")

    if (CMAKE_BUILD_TYPE STREQUAL "Debug")
	set (CMAKE_DEBUG_POSTFIX d)	
    endif()

else()
    if (CMAKE_SYSTEM_NAME STREQUAL "Android")
    	SET(MYCFLAGS "-DLUA_USE_LINUX")
    	SET(MYLIBS dl m)

        SET(BUILD_ARCH "vs_android")

    elseif (CMAKE_SYSTEM_NAME STREQUAL "Windows")
    	SET(MYCFLAGS "-DMINGW")

        SET(BUILD_ARCH "mingw32")

	set(LUA_LIBRARY "${CMAKE_SOURCE_DIR}/../../thirdparty/lua-build/__build/mingw32/lua53.a")
	
    else()
    	#SET(MYCFLAGS "-DLUA_USE_LINUX -DLUA_USE_READLINE")
    	#SET(MYLIBS dl m readline)
    	SET(MYCFLAGS "-DLUA_USE_LINUX")
    	SET(MYLIBS dl m)

        SET(BUILD_ARCH "linux")

    endif()

    SET(EXTRA_CXX_FLAGS "${MYCFLAGS}")
    SET(EXTRA_C_FLAGS "${MYCFLAGS}")

    SET(EXTRA_CXX_DEBUG_FLAGS "-DDEBUG")
    SET(EXTRA_C_DEBUG_FLAGS "-DDEBUG")

    SET(CMAKE_CXX_FLAGS_DEBUG "${CMAKE_CXX_FLAGS_DEBUG} -O0 -ggdb ${EXTRA_CXX_FLAGS} ${EXTRA_CXX_DEBUG_FLAGS}")
    SET(CMAKE_CXX_FLAGS_RELEASE "${CMAKE_CXX_FLAGS_RELEASE} -Wall -O2 -Wfatal-errors -fno-stack-protector -fno-common ${EXTRA_CXX_FLAGS}")
    SET(CMAKE_C_FLAGS_DEBUG "${CMAKE_C_FLAGS_DEBUG} -O0 -ggdb ${EXTRA_C_FLAGS} ${EXTRA_C_DEBUG_FLAGS}")
    SET(CMAKE_C_FLAGS_RELEASE "${CMAKE_C_FLAGS_RELEASE} -Wall -O2 -Wfatal-errors -fno-stack-protector -fno-common ${EXTRA_C_FLAGS}")
endif()

file(GLOB WEBGL_SRC
    "${PROJECT_SOURCE_DIR}/gl.c"
)

file(GLOB GLUT_SRC
    "${PROJECT_SOURCE_DIR}/glut.c"
)

include_directories("${PROJECT_SOURCE_DIR}/../../thirdparty/lua/src/")

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
		set(GLEW_INCLUDE_PATH "${CMAKE_SOURCE_DIR}/../../thirdparty/glew-2.2.0/include")
		if (MSVC)
			set(GLEW_LIBRARY "${CMAKE_SOURCE_DIR}/../../thirdparty/glew-2.2.0/lib/${CMAKE_BUILD_TYPE}/x64/glew32${CMAKE_DEBUG_POSTFIX}.lib")
		else()
			set(GLEW_LIBRARY "${CMAKE_SOURCE_DIR}/../../thirdparty/glew-build/__build/mingw32/lib/libglew32.dll.a")
			set(CMAKE_SHARED_LIBRARY_PREFIX "")
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
		set(GLUT_INCLUDE_PATH "${CMAKE_SOURCE_DIR}/../../thirdparty/freeglut-3.0.0/include")
		if (MSVC)
			set(GLUT_LIBRARY "${CMAKE_SOURCE_DIR}/../../thirdparty/freeglut-build/__build/win64/lib/${CMAKE_BUILD_TYPE}/freeglut${CMAKE_DEBUG_POSTFIX}.lib")
		else()
			set(GLUT_LIBRARY "${CMAKE_SOURCE_DIR}/../../thirdparty/freeglut-build/__build/mingw32/lib/libfreeglut.dll.a")
			set(CMAKE_SHARED_LIBRARY_PREFIX "")
		endif()
	endif()
endif()

include_directories(SYSTEM 
	${GLEW_INCLUDE_PATH}
	${GLUT_INCLUDE_PATH}
)

add_library (webgl SHARED ${WEBGL_SRC})
target_link_libraries (webgl ${LUA_LIBRARY} ${OPENGL_gl_LIBRARY} ${OPENGL_glu_LIBRARY} ${GLEW_LIBRARY})

add_library (glut SHARED ${GLUT_SRC})
target_link_libraries (glut ${LUA_LIBRARY} ${GLUT_LIBRARY})

add_custom_command(TARGET webgl POST_BUILD COMMAND ${CMAKE_COMMAND} -E copy_if_different $<TARGET_FILE:webgl> "${PROJECT_SOURCE_DIR}/../../__dist/$<TARGET_FILE_NAME:webgl>") 
add_custom_command(TARGET glut POST_BUILD COMMAND ${CMAKE_COMMAND} -E copy_if_different $<TARGET_FILE:glut> "${PROJECT_SOURCE_DIR}/../../__dist/$<TARGET_FILE_NAME:glut>") 