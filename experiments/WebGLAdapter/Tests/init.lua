gl = require("webgl")
glut = require("glut")

glut.init();
glut.initWindowSize(400, 640);
glut.initDisplayMode(glut.DOUBLE, glut.DEPTH, glut.RGBA);
glut.createWindow("Cool window");

gl.init()

print ('init - success.')

glut.display(function ()
    print ('display function')
    gl.clear(gl.COLOR, gl.DEPTH)
    gl.clearColor(0.5, 1.0, 0.2, 1.0)
    gl.flush()
    glut.swapBuffers()
end)

glut.idle(function ()
    glut.postRedisplay()
end)


print ('Main loop.')

glut.mainLoop();