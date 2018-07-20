cmake_minimum_required (VERSION 2.8 FATAL_ERROR) 

if(NOT EXECUTABLE_OUTPUT_PATH)
	set(FIRST_RUN "TRUE")
endif()

#-----------------------------------------------------------------------------
# Initialize project.

project (TypeScriptLUA) 

add_subdirectory (lua)
