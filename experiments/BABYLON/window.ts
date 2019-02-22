// @ts-ignore
import glut from 'glut';

export default class WindowEx {
    static events = {};

    static innerWidth = 640;
    static innerHeight = 480;

    constructor() {
        /* init GLUT */
        glut.init();
        glut.initWindowSize(WindowEx.innerWidth, WindowEx.innerHeight);
        glut.initDisplayMode(glut.DOUBLE, glut.DEPTH, glut.RGBA);
        glut.createWindow('Cool window');
        glut.ignoreKeyRepeat(true);

        glut.display(function () {
            glut.swapBuffers();
        });

        glut.passiveMotion(function (x: number, y: number) {
            console.log(`passive motion: x = ${x}, y = ${y}`);

            /*
            let preventedDefault = false;
            const preventDefault = function () { preventedDefault = true; };

            const mousemove = WindowEx.events['mousemove'];
            if (mousemove) {
                mousemove({ pointerId: 1, clientX: x, clientY: y, preventDefault });
                glut.postRedisplay();
            }
            */
        });

        glut.mouse(function (button: number, state: number, x: number, y: number) {
            console.log(`mouse: button = ${button}, state = ${state}, x = ${x}, y = ${y}`);

            let preventedDefault = false;
            const preventDefault = function () { preventedDefault = true; };
            if (state == 1) {
                const mouseup = WindowEx.events['mouseup'];
                if (mouseup) {
                    mouseup({ pointerId: 1, button, clientX: x, clientY: y, preventDefault });
                    //glut.postRedisplay();
                }
            } else {
                const mousedown = WindowEx.events['mousedown'];
                if (mousedown) {
                    mousedown({ pointerId: 1, button, clientX: x, clientY: y, preventDefault });
                    //glut.postRedisplay();
                }
            }
        });

        glut.motion(function (x: number, y: number) {
            console.log(`motion: x = ${x}, y = ${y}`);

            let preventedDefault = false;
            const preventDefault = function () { preventedDefault = true; };

            const mousemove = WindowEx.events['mousemove'];
            if (mousemove) {
                mousemove({ pointerId: 1, clientX: x, clientY: y, preventDefault });
                //glut.postRedisplay();
            }
        });

        glut.idle(function () {
            //glut.postRedisplay();
        });

        glut.keyboard(function (k: number, x: number, y: number) {
            console.log(`keyboard: key = ${k}, x = ${x}, y = ${y}`);

            // glutGetModifiers();  ALT=4  SHIFT=1  CTRL=2

            let preventedDefault = false;
            const preventDefault = function () { preventedDefault = true; };
            const keydown = WindowEx.events['keydown'];
            if (keydown) {
                keydown({ pointerId: 1, key: k, clientX: x, clientY: y, preventDefault });
                //glut.postRedisplay();
            }
        });

        glut.keyboardUp(function (k: number, x: number, y: number) {
            console.log(`keyboard-up: key = ${k}, x = ${x}, y = ${y}`);

            // glutGetModifiers();  ALT=4  SHIFT=1  CTRL=2

            let preventedDefault = false;
            const preventDefault = function () { preventedDefault = true; };
            const keyup = WindowEx.events['keyup'];
            if (keyup) {
                keyup({ pointerId: 1, key: k, clientX: x, clientY: y, preventDefault });
                //glut.postRedisplay();
            }
        });

        glut.special(function (k: number, x: number, y: number) {
            console.log(`special: key = ${k}, x = ${x}, y = ${y}`);

            // glutGetModifiers();  ALT=4  SHIFT=1  CTRL=2

            let preventedDefault = false;
            const preventDefault = function () { preventedDefault = true; };
            const keydown = WindowEx.events['keydown'];
            if (keydown) {
                keydown({ pointerId: 1, key: k, clientX: x, clientY: y, preventDefault });
                //glut.postRedisplay();
            }
        });

        glut.specialUp(function (k: number, x: number, y: number) {
            console.log(`special-up: key = ${k}, x = ${x}, y = ${y}`);

            // glutGetModifiers();  ALT=4  SHIFT=1  CTRL=2

            let preventedDefault = false;
            const preventDefault = function () { preventedDefault = true; };
            const keyup = WindowEx.events['keyup'];
            if (keyup) {
                keyup({ pointerId: 1, key: k, clientX: x, clientY: y, preventDefault });
                //glut.postRedisplay();
            }
        });

        glut.reshape(function (w: number, h: number) {
            WindowEx.innerWidth = w;
            WindowEx.innerHeight = h;
            //glut.postRedisplay();
        });
    }

    // @ts-ignore
    public static addEventListener(eventName: string, cb: any, flag: boolean): void {
        this.events[eventName] = cb;
    }

    public static setTimeout(funct: any, millisec: number) {
        if (funct) {
            //glut.timer(millisec, funct, 0);
            glut.timer(millisec, function () {
                glut.postRedisplay();
                funct();
            }, 0);
        }
    }

    public static loop() {
        glut.mainLoop();
    }
}
