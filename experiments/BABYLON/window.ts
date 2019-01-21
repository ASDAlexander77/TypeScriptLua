import glut from 'glut';

export default class WindowEx {
    innerWidth = 640;
    innerHeight = 480;

    constructor() {
        /* init GLUT */
        glut.init();
        glut.initWindowSize(400, 640);
        glut.initDisplayMode(glut.DOUBLE, glut.DEPTH, glut.RGBA);
        glut.createWindow('Cool window');

        glut.display(function () {
            /*
            gl.clear(gl.COLOR, gl.DEPTH);
            gl.clearColor(0.5, 1.0, 0.2, 1.0);
            gl.flush();
            */
            glut.swapBuffers();
        });

        glut.idle(function () {
            glut.postRedisplay();
        });
    }

    public addEventListener(eventName: string, cb: any, flag: boolean): void {
    }

    public setTimeout(funct: any, millisec: number) {
        if (funct) {
            funct();
        }
    }

    public loop() {
        glut.mainLoop();
    }
}
