import './JS';

declare var os: any;
declare var navigator: any;

navigator = <Navigator>{};

// Core

import WindowEx from './window';
import Canvas from './canvas';

declare var _gl: any;

declare var window: WindowEx;
window = new WindowEx();

class Runner {
    private canvas: any;
    private engine: any;

    private programInfo: any;
    private buffers: any;

    private c: number;

    constructor() {
        this.canvas = new Canvas();
        this.c = 0.5;
    }

    create() {
        const out = new Float32Array(16);
        out[0] = 1;
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[4] = 0;
        out[5] = 1;
        out[6] = 0;
        out[7] = 0;
        out[8] = 0;
        out[9] = 0;
        out[10] = 1;
        out[11] = 0;
        out[12] = 0;
        out[13] = 0;
        out[14] = 0;
        out[15] = 1;
        return out;
    }

    perspective(out, fovy, aspect, near, far) {
        const f = 1.0 / Math.tan(fovy / 2);
        const nf = 1 / (near - far);
        out[0] = f / aspect;
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[4] = 0;
        out[5] = f;
        out[6] = 0;
        out[7] = 0;
        out[8] = 0;
        out[9] = 0;
        out[10] = (far + near) * nf;
        out[11] = -1;
        out[12] = 0;
        out[13] = 0;
        out[14] = 2 * far * near * nf;
        out[15] = 0;
        return out;
    }

    translate(out, a, v) {
        const x = v[0],
            y = v[1],
            z = v[2];
        let a00 = void 0,
            a01 = void 0,
            a02 = void 0,
            a03 = void 0;
        let a10 = void 0,
            a11 = void 0,
            a12 = void 0,
            a13 = void 0;
        let a20 = void 0,
            a21 = void 0,
            a22 = void 0,
            a23 = void 0;

        if (a === out) {
            out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
            out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
            out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
            out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
        } else {
            a00 = a[0]; a01 = a[1]; a02 = a[2]; a03 = a[3];
            a10 = a[4]; a11 = a[5]; a12 = a[6]; a13 = a[7];
            a20 = a[8]; a21 = a[9]; a22 = a[10]; a23 = a[11];

            out[0] = a00; out[1] = a01; out[2] = a02; out[3] = a03;
            out[4] = a10; out[5] = a11; out[6] = a12; out[7] = a13;
            out[8] = a20; out[9] = a21; out[10] = a22; out[11] = a23;

            out[12] = a00 * x + a10 * y + a20 * z + a[12];
            out[13] = a01 * x + a11 * y + a21 * z + a[13];
            out[14] = a02 * x + a12 * y + a22 * z + a[14];
            out[15] = a03 * x + a13 * y + a23 * z + a[15];
        }

        return out;
    }

    //
    // Start here
    //
    main() {
        const vsSource = `
            attribute vec4 aVertexPosition;
            uniform mat4 uModelViewMatrix;
            uniform mat4 uProjectionMatrix;
            void main() {
                gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
            }
            `;

        // Fragment shader program

        const fsSource = `
            void main() {
                gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
            }
            `;

        // Initialize a shader program; this is where all the lighting
        // for the vertices and so forth is established.
        const shaderProgram = this.initShaderProgram(vsSource, fsSource);

        // Collect all the info needed to use the shader program.
        // Look up which attribute our shader program is using
        // for aVertexPosition and look up uniform locations.
        this.programInfo = {
            program: shaderProgram,
            attribLocations: {
                vertexPosition: _gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
            },
            uniformLocations: {
                projectionMatrix: _gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
                modelViewMatrix: _gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
            },
        };

        // Here's where we call the routine that builds all the
        // objects we'll be drawing.
        this.buffers = this.initBuffers();

        // init drawing
        // @ts-ignore
        window.setTimeout(() => {
            this.drawScene();
        }, 16);
    }

    //
    // initBuffers
    //
    // Initialize the buffers we'll need. For this demo, we just
    // have one object -- a simple two-dimensional square.
    //
    initBuffers() {

        // Create a buffer for the square's positions.

        const positionBuffer = _gl.createBuffer();

        // Select the positionBuffer as the one to apply buffer
        // operations to from here out.

        _gl.bindBuffer(_gl.ARRAY_BUFFER, positionBuffer);

        // Now create an array of positions for the square.

        const positions = [
            1.0, 1.0,
            -1.0, 1.0,
            1.0, -1.0,
            -1.0, -1.0,
        ];

        // Now pass the list of positions into WebGL to build the
        // shape. We do this by creating a Float32Array from the
        // JavaScript array, then use it to fill the current buffer.

        _gl.bufferData(_gl.ARRAY_BUFFER,
            (<any>(new Float32Array(positions))).buffer.bufferNativeInstance,
            _gl.STATIC_DRAW);

        return {
            position: positionBuffer,
        };
    }

    //
    // Draw the scene.
    //
    drawScene() {
        const programInfo = this.programInfo;
        const buffers = this.buffers;

        if (this.c > 1.0) {
            this.c = 0.0;
        } else {
            this.c += 0.1;
        }

        _gl.clearColor(this.c, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
        _gl.clearDepth(1.0);                 // Clear everything
        _gl.enable(_gl.DEPTH_TEST);           // Enable depth testing
        _gl.depthFunc(_gl.LEQUAL);            // Near things obscure far things

        // Clear the canvas before we start drawing on it.

        _gl.clear(_gl.COLOR_BUFFER_BIT | _gl.DEPTH_BUFFER_BIT);

        // Create a perspective matrix, a special matrix that is
        // used to simulate the distortion of perspective in a camera.
        // Our field of view is 45 degrees, with a width/height
        // ratio that matches the display size of the canvas
        // and we only want to see objects between 0.1 units
        // and 100 units away from the camera.

        const fieldOfView = 45 * Math.PI / 180;   // in radians
        // const aspect = _gl.canvas.clientWidth / _gl.canvas.clientHeight;
        const rect = this.canvas.getBoundingClientRect();
        const aspect = rect.width / rect.height;
        const zNear = 0.1;
        const zFar = 100.0;
        const projectionMatrix = this.create();

        // note: glmatrix.js always has the first argument
        // as the destination to receive the result.
        this.perspective(projectionMatrix,
            fieldOfView,
            aspect,
            zNear,
            zFar);

        // Set the drawing position to the "identity" point, which is
        // the center of the scene.
        const modelViewMatrix = this.create();

        // Now move the drawing position a bit to where we want to
        // start drawing the square.

        this.translate(modelViewMatrix,     // destination matrix
            modelViewMatrix,     // matrix to translate
            [-0.0, 0.0, -6.0]);  // amount to translate

        // Tell WebGL how to pull out the positions from the position
        // buffer into the vertexPosition attribute.
        {
            const numComponents = 2;
            const type = _gl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;
            _gl.bindBuffer(_gl.ARRAY_BUFFER, buffers.position);
            _gl.vertexAttribPointer(
                programInfo.attribLocations.vertexPosition,
                numComponents,
                type,
                normalize,
                stride,
                offset);
            _gl.enableVertexAttribArray(
                programInfo.attribLocations.vertexPosition);
        }

        // Tell WebGL to use our program when drawing

        _gl.useProgram(programInfo.program);

        // Set the shader uniforms

        _gl.uniformMatrix4fv(
            programInfo.uniformLocations.projectionMatrix,
            false,
            (<any>projectionMatrix).buffer.bufferNativeInstance);
        _gl.uniformMatrix4fv(
            programInfo.uniformLocations.modelViewMatrix,
            false,
            (<any>modelViewMatrix).buffer.bufferNativeInstance);

        {
            const offset = 0;
            const vertexCount = 4;
            _gl.drawArrays(_gl.TRIANGLE_STRIP, offset, vertexCount);
        }

        // next draw
        // @ts-ignore
        window.setTimeout(() => {
            this.drawScene();
        }, 16);
    }

    //
    // Initialize a shader program, so WebGL knows how to draw our data
    //
    initShaderProgram(vsSource, fsSource) {
        const vertexShader = this.loadShader(_gl.VERTEX_SHADER, vsSource);
        const fragmentShader = this.loadShader(_gl.FRAGMENT_SHADER, fsSource);

        // Create the shader program

        const shaderProgram = _gl.createProgram();
        _gl.attachShader(shaderProgram, vertexShader);
        _gl.attachShader(shaderProgram, fragmentShader);
        _gl.linkProgram(shaderProgram);

        // If creating the shader program failed, alert

        if (!_gl.getProgramParameter(shaderProgram, _gl.LINK_STATUS)) {
            // @ts-ignore
            console.log('Unable to initialize the shader program: ' + _gl.getProgramInfoLog(shaderProgram));
            return null;
        }

        return shaderProgram;
    }

    //
    // creates a shader of the given type, uploads the source and
    // compiles it.
    //
    loadShader(type, source) {
        const shader = _gl.createShader(type);

        // Send the source to the shader object

        _gl.shaderSource(shader, source);

        // Compile the shader program

        _gl.compileShader(shader);

        // See if it compiled successfully

        if (!_gl.getShaderParameter(shader, _gl.COMPILE_STATUS)) {
            // @ts-ignore
            console.log('An error occurred compiling the shaders: ' + _gl.getShaderInfoLog(shader));
            _gl.deleteShader(shader);
            return null;
        }

        return shader;
    }
}

new Runner().main();

// @ts-ignore
window.loop();
