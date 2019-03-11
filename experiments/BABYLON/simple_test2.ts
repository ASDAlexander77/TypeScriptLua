import './JS';

declare var os: any;
declare var navigator: any;

navigator = <Navigator>{};

// Core

import WindowEx from './window';
import Canvas from './canvas';
import Image from './image';

declare var _gl: any;

declare var window: WindowEx;
window = new WindowEx();

class Runner {
    private canvas: any;
    private engine: any;

    private programInfo: any;
    private buffers: any;
    private texture: any;
    private deltaTime: any;

    private cubeRotation = 0.0;

    constructor() {
        this.canvas = new Canvas();
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

    rotate(out, a, rad, axis) {
        let x = axis[0],
            y = axis[1],
            z = axis[2];
        let len = Math.sqrt(x * x + y * y + z * z);
        let s = void 0,
            c = void 0,
            t = void 0;
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
        let b00 = void 0,
            b01 = void 0,
            b02 = void 0;
        let b10 = void 0,
            b11 = void 0,
            b12 = void 0;
        let b20 = void 0,
            b21 = void 0,
            b22 = void 0;

        if (Math.abs(len) < 0.000001) {
            return null;
        }

        len = 1 / len;
        x *= len;
        y *= len;
        z *= len;

        s = Math.sin(rad);
        c = Math.cos(rad);
        t = 1 - c;

        a00 = a[0]; a01 = a[1]; a02 = a[2]; a03 = a[3];
        a10 = a[4]; a11 = a[5]; a12 = a[6]; a13 = a[7];
        a20 = a[8]; a21 = a[9]; a22 = a[10]; a23 = a[11];

        // Construct the elements of the rotation matrix
        b00 = x * x * t + c; b01 = y * x * t + z * s; b02 = z * x * t - y * s;
        b10 = x * y * t - z * s; b11 = y * y * t + c; b12 = z * y * t + x * s;
        b20 = x * z * t + y * s; b21 = y * z * t - x * s; b22 = z * z * t + c;

        // Perform rotation-specific matrix multiplication
        out[0] = a00 * b00 + a10 * b01 + a20 * b02;
        out[1] = a01 * b00 + a11 * b01 + a21 * b02;
        out[2] = a02 * b00 + a12 * b01 + a22 * b02;
        out[3] = a03 * b00 + a13 * b01 + a23 * b02;
        out[4] = a00 * b10 + a10 * b11 + a20 * b12;
        out[5] = a01 * b10 + a11 * b11 + a21 * b12;
        out[6] = a02 * b10 + a12 * b11 + a22 * b12;
        out[7] = a03 * b10 + a13 * b11 + a23 * b12;
        out[8] = a00 * b20 + a10 * b21 + a20 * b22;
        out[9] = a01 * b20 + a11 * b21 + a21 * b22;
        out[10] = a02 * b20 + a12 * b21 + a22 * b22;
        out[11] = a03 * b20 + a13 * b21 + a23 * b22;

        if (a !== out) {
            // If the source and destination differ, copy the unchanged last row
            out[12] = a[12];
            out[13] = a[13];
            out[14] = a[14];
            out[15] = a[15];
        }
        return out;
    }

    //
    // Start here
    //
    main() {
        // Vertex shader program

        const vsSource = `
      attribute vec4 aVertexPosition;
      attribute vec2 aTextureCoord;

      uniform mat4 uModelViewMatrix;
      uniform mat4 uProjectionMatrix;

      varying highp vec2 vTextureCoord;

      void main(void) {
        gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
        vTextureCoord = aTextureCoord;
      }
    `;

        // Fragment shader program

        const fsSource = `
      varying highp vec2 vTextureCoord;

      uniform sampler2D uSampler;

      void main(void) {
        gl_FragColor = texture2D(uSampler, vTextureCoord);
      }
    `;

        // Initialize a shader program; this is where all the lighting
        // for the vertices and so forth is established.
        const shaderProgram = this.initShaderProgram(vsSource, fsSource);

        // Collect all the info needed to use the shader program.
        // Look up which attributes our shader program is using
        // for aVertexPosition, aTextureCoord and also
        // look up uniform locations.
        this.programInfo = {
            program: shaderProgram,
            attribLocations: {
                vertexPosition: _gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
                textureCoord: _gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
            },
            uniformLocations: {
                projectionMatrix: _gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
                modelViewMatrix: _gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
                uSampler: _gl.getUniformLocation(shaderProgram, 'uSampler'),
            },
        };

        // Here's where we call the routine that builds all the
        // objects we'll be drawing.
        this.buffers = this.initBuffers();

        this.texture = this.loadTexture('cubetexture.png');

        // Draw the scene repeatedly
        // @ts-ignore
        window.setTimeout(() => {
            this.drawScene(0.01);
        }, 16);
    }

    //
    // initBuffers
    //
    // Initialize the buffers we'll need. For this demo, we just
    // have one object -- a simple three-dimensional cube.
    //
    initBuffers() {

        // Create a buffer for the cube's vertex positions.

        const positionBuffer = _gl.createBuffer();

        // Select the positionBuffer as the one to apply buffer
        // operations to from here out.

        _gl.bindBuffer(_gl.ARRAY_BUFFER, positionBuffer);

        // Now create an array of positions for the cube.

        const positions = [
            // Front face
            -1.0, -1.0, 1.0,
            1.0, -1.0, 1.0,
            1.0, 1.0, 1.0,
            -1.0, 1.0, 1.0,

            // Back face
            -1.0, -1.0, -1.0,
            -1.0, 1.0, -1.0,
            1.0, 1.0, -1.0,
            1.0, -1.0, -1.0,

            // Top face
            -1.0, 1.0, -1.0,
            -1.0, 1.0, 1.0,
            1.0, 1.0, 1.0,
            1.0, 1.0, -1.0,

            // Bottom face
            -1.0, -1.0, -1.0,
            1.0, -1.0, -1.0,
            1.0, -1.0, 1.0,
            -1.0, -1.0, 1.0,

            // Right face
            1.0, -1.0, -1.0,
            1.0, 1.0, -1.0,
            1.0, 1.0, 1.0,
            1.0, -1.0, 1.0,

            // Left face
            -1.0, -1.0, -1.0,
            -1.0, -1.0, 1.0,
            -1.0, 1.0, 1.0,
            -1.0, 1.0, -1.0,
        ];

        // Now pass the list of positions into WebGL to build the
        // shape. We do this by creating a Float32Array from the
        // JavaScript array, then use it to fill the current buffer.

        _gl.bufferData(_gl.ARRAY_BUFFER, (<any>(new Float32Array(positions))).buffer.bufferNativeInstance, _gl.STATIC_DRAW);

        // Now set up the texture coordinates for the faces.

        const textureCoordBuffer = _gl.createBuffer();
        _gl.bindBuffer(_gl.ARRAY_BUFFER, textureCoordBuffer);

        const textureCoordinates = [
            // Front
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,
            // Back
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,
            // Top
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,
            // Bottom
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,
            // Right
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,
            // Left
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,
        ];

        _gl.bufferData(_gl.ARRAY_BUFFER, (<any>(new Float32Array(textureCoordinates))).buffer.bufferNativeInstance,
            _gl.STATIC_DRAW);

        // Build the element array buffer; this specifies the indices
        // into the vertex arrays for each face's vertices.

        const indexBuffer = _gl.createBuffer();
        _gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

        // This array defines each face as two triangles, using the
        // indices into the vertex array to specify each triangle's
        // position.

        const indices = [
            0, 1, 2, 0, 2, 3,    // front
            4, 5, 6, 4, 6, 7,    // back
            8, 9, 10, 8, 10, 11,   // top
            12, 13, 14, 12, 14, 15,   // bottom
            16, 17, 18, 16, 18, 19,   // right
            20, 21, 22, 20, 22, 23,   // left
        ];

        // Now send the element array to GL

        _gl.bufferData(_gl.ELEMENT_ARRAY_BUFFER,
            (<any>(new Uint16Array(indices))).buffer.bufferNativeInstance, _gl.STATIC_DRAW);

        return {
            position: positionBuffer,
            textureCoord: textureCoordBuffer,
            indices: indexBuffer,
        };
    }

    //
    // Initialize a texture and load an image.
    // When the image finished loading copy it into the texture.
    //
    loadTexture(url: string) {
        const texture = _gl.createTexture();
        _gl.bindTexture(_gl.TEXTURE_2D, texture);

        // Because images have to be download over the internet
        // they might take a moment until they are ready.
        // Until then put a single pixel in the texture so we can
        // use it immediately. When the image has finished downloading
        // we'll update the texture with the contents of the image.
        const level = 0;
        const internalFormat = _gl.RGBA;
        const width = 1;
        const height = 1;
        const border = 0;
        const srcFormat = _gl.RGBA;
        const srcType = _gl.UNSIGNED_BYTE;
        const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
        _gl.texImage2D(_gl.TEXTURE_2D, level, internalFormat,
            width, height, border, srcFormat, srcType,
            (<any>pixel).buffer.bufferNativeInstance);

        const image = new Image();
        image.onload = () => {
            _gl.bindTexture(_gl.TEXTURE_2D, texture);
            _gl.texImage2D(_gl.TEXTURE_2D, level, internalFormat,
                (<any>image).width, (<any>image).height, 0,
                srcFormat, srcType, (<any>image).bits);

            // WebGL1 has different requirements for power of 2 images
            // vs non power of 2 images so check if the image is a
            // power of 2 in both dimensions.
            if (this.isPowerOf2(image.width) && this.isPowerOf2(image.height)) {
                // Yes, it's a power of 2. Generate mips.
                _gl.generateMipmap(_gl.TEXTURE_2D);
            } else {
                // No, it's not a power of 2. Turn of mips and set
                // wrapping to clamp to edge
                _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_WRAP_S, _gl.CLAMP_TO_EDGE);
                _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_WRAP_T, _gl.CLAMP_TO_EDGE);
                _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_MIN_FILTER, _gl.LINEAR);
            }
        };
        image.src = url;

        return texture;
    }

    isPowerOf2(value) {
        return (value & (value - 1)) === 0;
    }

    //
    // Draw the scene.
    //
    drawScene(deltaTime) {
        _gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
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
        this.rotate(modelViewMatrix,  // destination matrix
            modelViewMatrix,  // matrix to rotate
            this.cubeRotation,     // amount to rotate in radians
            [0, 0, 1]);       // axis to rotate around (Z)
        this.rotate(modelViewMatrix,  // destination matrix
            modelViewMatrix,  // matrix to rotate
            this.cubeRotation * .7, // amount to rotate in radians
            [0, 1, 0]);       // axis to rotate around (X)

        // Tell WebGL how to pull out the positions from the position
        // buffer into the vertexPosition attribute
        {
            const numComponents = 3;
            const type = _gl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;
            _gl.bindBuffer(_gl.ARRAY_BUFFER, this.buffers.position);
            _gl.vertexAttribPointer(
                this.programInfo.attribLocations.vertexPosition,
                numComponents,
                type,
                normalize,
                stride,
                offset);
            _gl.enableVertexAttribArray(
                this.programInfo.attribLocations.vertexPosition);
        }

        // Tell WebGL how to pull out the texture coordinates from
        // the texture coordinate buffer into the textureCoord attribute.
        {
            const numComponents = 2;
            const type = _gl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;
            _gl.bindBuffer(_gl.ARRAY_BUFFER, this.buffers.textureCoord);
            _gl.vertexAttribPointer(
                this.programInfo.attribLocations.textureCoord,
                numComponents,
                type,
                normalize,
                stride,
                offset);
            _gl.enableVertexAttribArray(
                this.programInfo.attribLocations.textureCoord);
        }

        // Tell WebGL which indices to use to index the vertices
        _gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, this.buffers.indices);

        // Tell WebGL to use our program when drawing

        _gl.useProgram(this.programInfo.program);

        // Set the shader uniforms

        _gl.uniformMatrix4fv(
            this.programInfo.uniformLocations.projectionMatrix,
            false,
            (<any>projectionMatrix).buffer.bufferNativeInstance);
        _gl.uniformMatrix4fv(
            this.programInfo.uniformLocations.modelViewMatrix,
            false,
            (<any>modelViewMatrix).buffer.bufferNativeInstance);

        // Specify the texture to map onto the faces.

        // Tell WebGL we want to affect texture unit 0
        _gl.activeTexture(_gl.TEXTURE0);

        // Bind the texture to texture unit 0
        _gl.bindTexture(_gl.TEXTURE_2D, this.texture);

        // Tell the shader we bound the texture to texture unit 0
        _gl.uniform1i(this.programInfo.uniformLocations.uSampler, 0);

        {
            const vertexCount = 36;
            const type = _gl.UNSIGNED_SHORT;
            const offset = 0;
            _gl.drawElements(_gl.TRIANGLES, vertexCount, type, offset);
        }

        // Update the rotation for the next draw

        this.cubeRotation += deltaTime;

        // next draw
        // @ts-ignore
        window.setTimeout(() => {
            this.drawScene(deltaTime);
        }, 16);
    }

    //
    // Initialize a shader program, so WebGL knows how to draw our data
    //
    initShaderProgram(vsSource: string, fsSource: string) {
        const vertexShader = this.loadShader(_gl.VERTEX_SHADER, vsSource);
        const fragmentShader = this.loadShader(_gl.FRAGMENT_SHADER, fsSource);

        // Create the shader program

        const shaderProgram = _gl.createProgram();
        _gl.attachShader(shaderProgram, vertexShader);
        _gl.attachShader(shaderProgram, fragmentShader);
        _gl.linkProgram(shaderProgram);

        // If creating the shader program failed, alert

        if (!_gl.getProgramParameter(shaderProgram, _gl.LINK_STATUS)) {
            alert('Unable to initialize the shader program: ' + _gl.getProgramInfoLog(shaderProgram));
            return null;
        }

        return shaderProgram;
    }

    //
    // creates a shader of the given type, uploads the source and
    // compiles it.
    //
    loadShader(type: number, source: string) {
        const shader = _gl.createShader(type);

        // Send the source to the shader object

        _gl.shaderSource(shader, source);

        // Compile the shader program

        _gl.compileShader(shader);

        // See if it compiled successfully

        if (!_gl.getShaderParameter(shader, _gl.COMPILE_STATUS)) {
            alert('An error occurred compiling the shaders: ' + _gl.getShaderInfoLog(shader));
            _gl.deleteShader(shader);
            return null;
        }

        return shader;
    }
}

new Runner().main();

// @ts-ignore
window.loop();
