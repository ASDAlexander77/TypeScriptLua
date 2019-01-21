gl = require("webgl")
glut = require("glut")

glut.init();
glut.createWindow("Cool window");

gl.init()

print ('init - success.')

glut.display(function ()
    print ('display function')
    gl.clearColor(0.1, 0.0, 0.0, 1.0)
    glut.swapBuffers()
end)

print ('Main loop.')

glut.mainLoop();