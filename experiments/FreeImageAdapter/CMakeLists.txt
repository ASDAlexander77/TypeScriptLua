cmake_minimum_required (VERSION 2.8 FATAL_ERROR)

project (pcre2adapter_wrappers) 

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

file(GLOB PRE2ADAPTER_SRC
    "${PROJECT_SOURCE_DIR}/pcre2adapter.c"
)

include_directories("${PROJECT_SOURCE_DIR}/../../thirdparty/lua/src/")

#-----------------------------------------------------------------------------
# Configure PCRE2

if(WIN32)
	set(PCRE2_INCLUDE_PATH "${CMAKE_SOURCE_DIR}/../../thirdparty/pcre2/src")
	if (MSVC)                                                       
		set(PCRE2_INCLUDE_PATH2 "${CMAKE_SOURCE_DIR}/../../thirdparty/pcre2-build/__build/win64")
		set(PCRE2_LIBRARY "${CMAKE_SOURCE_DIR}/../../thirdparty/pcre2-build/__build/win64/${CMAKE_BUILD_TYPE}/pcre2-8${CMAKE_DEBUG_POSTFIX}.lib")
		set(PCRE2_LIBRARY_POSIX "${CMAKE_SOURCE_DIR}/../../thirdparty/pcre2-build/__build/win64/${CMAKE_BUILD_TYPE}/pcre2-posix${CMAKE_DEBUG_POSTFIX}.lib")
	else()
		set(PCRE2_INCLUDE_PATH2 "${CMAKE_SOURCE_DIR}/../../thirdparty/pcre2-build/__build/mingw32")
		set(PCRE2_LIBRARY "${CMAKE_SOURCE_DIR}/../../thirdparty/pcre2-build/__build/mingw32/pcre2-8.a")
		set(PCRE2_LIBRARY_POSIX "${CMAKE_SOURCE_DIR}/../../thirdparty/pcre2-build/__build/mingw32/pcre2-posix.a")
		set(CMAKE_SHARED_LIBRARY_PREFIX "")
	endif()
endif()

include_directories(SYSTEM 
	${PCRE2_INCLUDE_PATH}
	${PCRE2_INCLUDE_PATH2}
)

add_library (pcre2adapter SHARED ${PRE2ADAPTER_SRC})
target_link_libraries (pcre2adapter ${LUA_LIBRARY} ${PCRE2_LIBRARY} ${PCRE2_LIBRARY_POSIX})

add_custom_command(TARGET pcre2adapter POST_BUILD COMMAND ${CMAKE_COMMAND} -E copy_if_different $<TARGET_FILE:pcre2adapter> "${PROJECT_SOURCE_DIR}/../../__dist/$<TARGET_FILE_NAME:pcre2adapter>") 
