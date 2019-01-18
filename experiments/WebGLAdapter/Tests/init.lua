gl = require("webgl")
glut = require("glut")

glut.init();
glut.createWindow("Cool window");

gl.init()

print ('init - success.')

glut.display(function ()
    print ('display function')
    glut.swapBuffers()
end)

print ('Main loop.')

glut.mainLoop();