// @ts-ignore
import glut from 'glut';

class WindowElement {
    public static setPointerCapture(pointerId: number) {
        console.log(`pointer capture ${pointerId}`);
    }

    public static releasePointerCapture(pointerId: number) {
        console.log(`releaswe pointer capture ${pointerId}`);
    }
}

export default class WindowEx {
    static events = {};

    static innerWidth = 640;
    static innerHeight = 480;

    static __drawFunction: any;

    public static location = { href: 'file://' };

    constructor() {
        /* init GLUT */
        glut.init();
        glut.initWindowSize(WindowEx.innerWidth, WindowEx.innerHeight);
        glut.initDisplayMode(glut.DOUBLE, glut.DEPTH, glut.RGBA);
        glut.createWindow('Cool window');
        glut.ignoreKeyRepeat(true);

        glut.display(function () {
            if (WindowEx.__drawFunction) {
                WindowEx.__drawFunction();
            }

            glut.swapBuffers();
        });

        glut.passiveMotion(function (x: number, y: number) {
            console.log(`passive motion: x = ${x}, y = ${y}`);

            /*
            let preventedDefault = false;
            const preventDefault = function () { preventedDefault = true; };

            const mousemoves = WindowEx.events['mousemove'];
            if (mousemoves) {
                for (const mousemove of mousemoves) {
                    mousemove({ pointerId: 1, clientX: x, clientY: y, preventDefault, srcElement: WindowElement });
                }

                glut.postRedisplay();
            }
            */
        });

        glut.mouse(function (button: number, state: number, x: number, y: number) {
            console.log(`mouse: button = ${button}, state = ${state}, x = ${x}, y = ${y}`);

            let preventedDefault = false;
            const preventDefault = function () { preventedDefault = true; };
            if (button < 3 || button > 4) {
                if (state === 1) {
                    const mouseups = WindowEx.events['mouseup'];
                    if (mouseups) {
                        for (const mouseup of mouseups) {
                            mouseup({ pointerId: 1, button, clientX: x, clientY: y, preventDefault, srcElement: WindowElement });
                        }

                        glut.postRedisplay();
                    }
                } else {
                    const mousedowns = WindowEx.events['mousedown'];
                    if (mousedowns) {
                        for (const mousedown of mousedowns) {
                            mousedown({ pointerId: 1, button, clientX: x, clientY: y, preventDefault, srcElement: WindowElement });
                        }

                        glut.postRedisplay();
                    }
                }
            } else {
                const mousewheels = WindowEx.events['mousewheel'];
                if (mousewheels) {
                    for (const mousewheel of mousewheels) {
                        mousewheel({
                            pointerId: 1,
                            type: 'mousewheel',
                            wheelDelta: button === 3 ? 0.1 : -0.1,
                            button,
                            clientX: x,
                            clientY: y,
                            preventDefault,
                            srcElement: WindowElement
                        });
                    }

                    glut.postRedisplay();
                }
            }
        });

        glut.motion(function (x: number, y: number) {
            console.log(`motion: x = ${x}, y = ${y}`);

            let preventedDefault = false;
            const preventDefault = function () { preventedDefault = true; };

            const mousemoves = WindowEx.events['mousemove'];
            if (mousemoves) {
                for (const mousemove of mousemoves) {
                    mousemove({ pointerId: 1, clientX: x, clientY: y, preventDefault, srcElement: WindowElement });
                }

                glut.postRedisplay();
            }
        });

        glut.idle(function () {
            // glut.postRedisplay();
        });

        glut.keyboard(function (k: number, x: number, y: number) {
            console.log(`keyboard: key = ${k}, x = ${x}, y = ${y}`);

            // glutGetModifiers();  ALT=4  SHIFT=1  CTRL=2

            let preventedDefault = false;
            const preventDefault = function () { preventedDefault = true; };
            const keydowns = WindowEx.events['keydown'];
            if (keydowns) {
                for (const keydown of keydowns) {
                    keydown({ pointerId: 1, keyCode: k, clientX: x, clientY: y, preventDefault, srcElement: WindowElement });
                }

                glut.postRedisplay();
            }
        });

        glut.keyboardUp(function (k: number, x: number, y: number) {
            console.log(`keyboard-up: key = ${k}, x = ${x}, y = ${y}`);

            // glutGetModifiers();  ALT=4  SHIFT=1  CTRL=2

            let preventedDefault = false;
            const preventDefault = function () { preventedDefault = true; };
            const keyups = WindowEx.events['keyup'];
            if (keyups) {
                for (const keyup of keyups) {
                    keyup({ pointerId: 1, keyCode: k, clientX: x, clientY: y, preventDefault, srcElement: WindowElement });
                }

                glut.postRedisplay();
            }
        });

        glut.special(function (k: number, x: number, y: number) {
            console.log(`special: key = ${k}, x = ${x}, y = ${y}`);

            // glutGetModifiers();  ALT=4  SHIFT=1  CTRL=2

            let preventedDefault = false;
            const preventDefault = function () { preventedDefault = true; };
            const keydowns = WindowEx.events['keydown'];
            if (keydowns) {
                for (const keydown of keydowns) {
                    keydown({ pointerId: 1, keyCode: k - 63, clientX: x, clientY: y, preventDefault, srcElement: WindowElement });
                }

                glut.postRedisplay();
            }
        });

        glut.specialUp(function (k: number, x: number, y: number) {
            console.log(`special-up: key = ${k}, x = ${x}, y = ${y}`);

            // glutGetModifiers();  ALT=4  SHIFT=1  CTRL=2

            let preventedDefault = false;
            const preventDefault = function () { preventedDefault = true; };
            const keyups = WindowEx.events['keyup'];
            if (keyups) {
                for (const keyup of keyups) {
                    keyup({ pointerId: 1, keyCode: k - 63, clientX: x, clientY: y, preventDefault, srcElement: WindowElement });
                }

                glut.postRedisplay();
            }
        });

        glut.reshape(function (w: number, h: number) {
            WindowEx.innerWidth = w;
            WindowEx.innerHeight = h;
            glut.postRedisplay();
        });
    }

    public static focus() {
        console.log(`focus`);

        // glutGetModifiers();  ALT=4  SHIFT=1  CTRL=2

        let preventedDefault = false;
        const preventDefault = function () { preventedDefault = true; };

        const focuses = WindowEx.events['focus'];
        if (focuses) {
            for (const focusItem of focuses) {
                focusItem({ pointerId: 1, preventDefault, srcElement: WindowElement });
            }
        }
    }

    // @ts-ignore
    public static addEventListener(eventName: string, cb: any, flag: boolean): void {
        let listeners = this.events[eventName];
        if (!listeners) {
            listeners = [];
            this.events[eventName] = listeners;
        }

        listeners.push(cb);
    }

    public static setTimeout(funct: any, millisec: number) {
        if (funct) {
            WindowEx.__drawFunction = funct;
            glut.timer(millisec, function () {
                glut.postRedisplay();
                // instead of calling draw on timer(which is working anyway), I want to call 'draw' at draw window stages
                /// funct();
            }, 0);
        }
    }

    public static setImmediate(funct: any) {
        if (funct) {
            glut.timer(0, function () {
                funct();
            }, 0);
        }
    }

    public static loop() {
        glut.mainLoop();
    }
}
