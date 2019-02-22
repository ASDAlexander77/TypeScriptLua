gl = require("webgl")
glut = require("glut")

glut.init();
glut.initWindowSize(640, 400);
glut.initDisplayMode(glut.DOUBLE, glut.DEPTH, glut.RGB);
glut.createWindow("Cool window");

gl.init()

print ('init - success.')

local c = 0.0;
glut.display(function ()
    print ('display function')
    glut.swapBuffers()
end)

glut.idle(function ()
    --glut.postRedisplay()
end)

local tfunc;
tfunc = function ()
    glut.postRedisplay()

    gl.clearColor(c, 0.7, 0.7, 1);
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

    c = c + 0.01
    if (c > 1.0) then c = 0.0 end

    glut.timer(16, tfunc, 0)
end

glut.timer(16, tfunc, 0)

print ('Main loop.')

glut.mainLoop();