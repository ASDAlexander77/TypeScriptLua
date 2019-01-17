cmake_minimum_required (VERSION 2.8 FATAL_ERROR)

project (lua) 

SET(CWARNSCPP "-Wextra -Wshadow	-Wsign-compare -Wundef -Wwrite-strings -Wredundant-decls -Wdisabled-optimization -Wdouble-promotion -Wstrict-aliasing=3 -Wno-aggressive-loop-optimizations -Wlogical-op -Werror")

# The next warnings are neither valid nor needed for C++
SET(CWARNSC "-Wdeclaration-after-statement -Wmissing-prototypes -Wnested-externs -Wstrict-prototypes -Wc++-compat -Wold-style-definition")

if (MSVC)
    #SET(MYCFLAGS "/DLUA_USE_WINDOWS")
    SET(MYCFLAGS "${MYCFLAGS} /DLUA_BUILD_AS_DLL")

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
    	#SET(MYCFLAGS "-DLUA_USE_WINDOWS")
    	SET(MYLIBS )

        SET(EXTRA_CXX_FLAGS "${CWARNSCPP}")
        SET(EXTRA_C_FLAGS "${CWARNSC}")
        SET(BUILD_ARCH "mingw32")
    else()
    	#SET(MYCFLAGS "-DLUA_USE_LINUX -DLUA_USE_READLINE")
    	#SET(MYLIBS dl m readline)
    	SET(MYCFLAGS "-DLUA_USE_LINUX")
    	SET(MYLIBS dl m)

        SET(EXTRA_CXX_FLAGS "${CWARNSCPP}")
        SET(EXTRA_C_FLAGS "${CWARNSC}")
        SET(BUILD_ARCH "linux")
    endif()

    SET(CMAKE_CXX_FLAGS_DEBUG "${CMAKE_CXX_FLAGS_DEBUG} -O0 ${EXTRA_CXX_FLAGS} -ggdb ${MYCFLAGS}")
    SET(CMAKE_CXX_FLAGS_RELEASE "${CMAKE_CXX_FLAGS_RELEASE} -Wall -O2 ${EXTRA_CXX_FLAGS} -Wfatal-errors -fno-stack-protector -fno-common ${MYCFLAGS}")
    SET(CMAKE_C_FLAGS_DEBUG "${CMAKE_C_FLAGS_DEBUG} -O0 ${EXTRA_C_FLAGS} -ggdb ${MYCFLAGS}")
    SET(CMAKE_C_FLAGS_RELEASE "${CMAKE_C_FLAGS_RELEASE} -Wall -O2 ${EXTRA_C_FLAGS} -Wfatal-errors -fno-stack-protector -fno-common ${MYCFLAGS}")
endif()

file(GLOB CORE_SRC
    "${PROJECT_SOURCE_DIR}/../lua/src/*.c"
)

file(GLOB LUA_SRC
    "${PROJECT_SOURCE_DIR}/../lua/src/lua.c"
)

file(GLOB LUAC_SRC
    "${PROJECT_SOURCE_DIR}/../lua/src/luac.c"
)

list(REMOVE_ITEM CORE_SRC "${PROJECT_SOURCE_DIR}/../lua/src/lbitlib.c")
list(REMOVE_ITEM CORE_SRC "${PROJECT_SOURCE_DIR}/../lua/src/lua.c")
list(REMOVE_ITEM CORE_SRC "${PROJECT_SOURCE_DIR}/../lua/src/luac.c")

add_library (core SHARED ${CORE_SRC})
set_target_properties(core PROPERTIES OUTPUT_NAME "lua53")
target_link_libraries (core ${MYLIBS})

add_executable (lua ${LUA_SRC})
target_link_libraries (lua core)

add_executable (luac ${LUAC_SRC})
target_link_libraries (luac core)

add_custom_command(TARGET lua POST_BUILD COMMAND ${CMAKE_COMMAND} -E copy_if_different $<TARGET_FILE:lua> "${PROJECT_SOURCE_DIR}/../../__dist") 
add_custom_command(TARGET luac POST_BUILD COMMAND ${CMAKE_COMMAND} -E copy_if_different $<TARGET_FILE:luac> "${PROJECT_SOURCE_DIR}/../../__dist")