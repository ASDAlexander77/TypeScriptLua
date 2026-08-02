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

set(SRC "${PROJECT_SOURCE_DIR}/../lua-5.5.0/src/")

message("Source = ${SRC}")

set(CORE_SRC ${SRC}lapi.c ${SRC}lcode.c ${SRC}lctype.c ${SRC}ldebug.c ${SRC}ldo.c ${SRC}ldump.c ${SRC}lfunc.c ${SRC}lgc.c ${SRC}llex.c ${SRC}lmem.c ${SRC}lobject.c ${SRC}lopcodes.c ${SRC}lparser.c ${SRC}lstate.c ${SRC}lstring.c ${SRC}ltable.c ${SRC}ltm.c ${SRC}lundump.c ${SRC}lvm.c ${SRC}lzio.c)
set(LIB_SRC ${SRC}lauxlib.c ${SRC}lbaselib.c ${SRC}lcorolib.c ${SRC}ldblib.c ${SRC}liolib.c ${SRC}lmathlib.c ${SRC}loadlib.c ${SRC}loslib.c ${SRC}lstrlib.c ${SRC}ltablib.c ${SRC}lutf8lib.c ${SRC}linit.c)

set(LUA_SRC ${SRC}lua.c)
set(LUAC_SRC ${SRC}luac.c)

add_library (lib_dll SHARED ${CORE_SRC} ${LIB_SRC})
set_target_properties(lib_dll PROPERTIES OUTPUT_NAME "lua55")
target_link_libraries (lib_dll ${MYLIBS})

add_executable (lua ${LUA_SRC})
target_link_libraries (lua lib_dll ${MYLIBS})

add_executable (luac ${CORE_SRC} ${LUAC_SRC})
target_link_libraries (luac lib_dll ${MYLIBS})

add_custom_command(TARGET lua POST_BUILD COMMAND ${CMAKE_COMMAND} -E copy_if_different $<TARGET_FILE:lib_dll> "${PROJECT_SOURCE_DIR}/../../__dist") 
add_custom_command(TARGET lua POST_BUILD COMMAND ${CMAKE_COMMAND} -E copy_if_different $<TARGET_FILE:lua> "${PROJECT_SOURCE_DIR}/../../__dist") 
add_custom_command(TARGET luac POST_BUILD COMMAND ${CMAKE_COMMAND} -E copy_if_different $<TARGET_FILE:luac> "${PROJECT_SOURCE_DIR}/../../__dist")