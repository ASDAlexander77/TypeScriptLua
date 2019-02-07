import './JS';

var sourceCode = '#ifdef TANGENT    \
vec4 tangentUpdated = tangent;   \
#endif  \
\
#include<morphTargetsVertex>[0..maxSimultaneousMorphTargets]    \
\
#ifdef REFLECTIONMAP_SKYBOX \
#ifdef REFLECTIONMAP_SKYBOX_TRANSFORMED';

var regex = /#include<(.+)>(\((.*)\))*(\[(.*)\])*/g;
var match = regex.exec(sourceCode);

while (match != null) {
    var val = match[1];
    console.log(val);
    match = regex.exec(sourceCode);
}
