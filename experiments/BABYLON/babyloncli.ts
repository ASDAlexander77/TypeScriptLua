import './JS';

var window = {};
var navigator = {};

// Core
import './BABYLON/Materials/babylon_effect';
import './BABYLON/babylon_types';
import './BABYLON/Events/babylon_keyboardEvents';
import './BABYLON/Events/babylon_pointerEvents';
import './BABYLON/Math/babylon_math';
import './BABYLON/Math/babylon_math_scalar';
import './BABYLON/babylon_mixins';
// import './BABYLON/Engine/babylon_webgl2';
import './BABYLON/Engine/babylon_nullEngine';
import './BABYLON/Tools/babylon_decorators';
import './BABYLON/Tools/babylon_deferred';
import './BABYLON/Tools/babylon_observable';
import './BABYLON/Tools/babylon_smartArray';
import './BABYLON/Tools/babylon_tools';
import './BABYLON/Tools/babylon_promise';
import './BABYLON/Tools/babylon_workerPool';
import './BABYLON/States/babylon_alphaCullingState';
import './BABYLON/States/babylon_depthCullingState';
import './BABYLON/States/babylon_stencilState';
import './BABYLON/Engine/babylon_engine';
import './BABYLON/babylon_node';
import './BABYLON/Culling/babylon_boundingSphere';
import './BABYLON/Culling/babylon_boundingBox';
import './BABYLON/Culling/babylon_boundingInfo';
import './BABYLON/Mesh/babylon_transformNode';
import './BABYLON/Mesh/babylon_abstractMesh';
import './BABYLON/Lights/babylon_light';
import './BABYLON/Cameras/babylon_camera';
import './BABYLON/Rendering/babylon_renderingManager';
import './BABYLON/Rendering/babylon_renderingGroup';
import './BABYLON/babylon_sceneComponent';
import './BABYLON/babylon_abstractScene';
import './BABYLON/babylon_scene';
import './BABYLON/babylon_assetContainer';
import './BABYLON/Mesh/babylon_buffer';
import './BABYLON/Mesh/babylon_vertexBuffer';
import './BABYLON/Materials/Textures/babylon_internalTextureLoader';
import './BABYLON/Materials/Textures/babylon_internalTextureTracker';
import './BABYLON/Materials/Textures/babylon_internalTexture';
import './BABYLON/Materials/Textures/babylon_baseTexture';
import './BABYLON/Materials/Textures/babylon_texture';
import './BABYLON/Mesh/babylon_mesh';
import './BABYLON/Mesh/babylon_subMesh';
import './BABYLON/Materials/babylon_material';
import './BABYLON/Materials/babylon_uniformBuffer';
import './BABYLON/Mesh/babylon_mesh_vertexData';
import './BABYLON/Mesh/babylon_geometry';
import './BABYLON/Tools/babylon_performanceMonitor';
import './BABYLON/Materials/babylon_materialHelper';
import './BABYLON/Materials/babylon_pushMaterial';
import './BABYLON/Materials/babylon_standardMaterial';

// extra
import './BABYLON/Cameras/babylon_targetCamera';
import './BABYLON/Cameras/babylon_cameraInputsManager';
import './BABYLON/Cameras/Inputs/babylon_arcRotateCameraKeyboardMoveInput';
import './BABYLON/Cameras/Inputs/babylon_arcRotateCameraMouseWheelInput';
import './BABYLON/Cameras/Inputs/babylon_arcRotateCameraPointersInput';
import './BABYLON/Cameras/babylon_arcRotateCameraInputsManager';
import './BABYLON/Cameras/babylon_arcRotateCamera';

// xcopy /S D:\Git\Babylon.js\src\*.lua D:\Dev\TypeScriptLUA\__build\win64\lua\Debug\BABYLON\

class Canvas implements WebGLRenderingContext {
    MAX_SAMPLES: number;
    RGBA8: number;
    READ_FRAMEBUFFER: number;
    DRAW_FRAMEBUFFER: number;
    UNIFORM_BUFFER: number;
    HALF_FLOAT_OES: number;
    RGBA16F: number;
    RGBA32F: number;
    R32F: number;
    RG32F: number;
    RGB32F: number;
    R16F: number;
    RG16F: number;
    RGB16F: number;
    RED: number;
    RG: number;
    R8: number;
    RG8: number;
    UNSIGNED_INT_24_8: number;
    DEPTH24_STENCIL8: number;
    COLOR_ATTACHMENT0: number;
    COLOR_ATTACHMENT1: number;
    COLOR_ATTACHMENT2: number;
    COLOR_ATTACHMENT3: number;
    ANY_SAMPLES_PASSED_CONSERVATIVE: number;
    ANY_SAMPLES_PASSED: number;
    QUERY_RESULT_AVAILABLE: number;
    QUERY_RESULT: number;

    drawBuffers(buffers: number[]): void {
        throw new Error('Method not implemented.');
    }

    readBuffer(src: number): void {
        throw new Error('Method not implemented.');
    }

    drawArraysInstanced(mode: number, first: number, count: number, primcount: number): void {
        throw new Error('Method not implemented.');
    }

    drawElementsInstanced(mode: number, count: number, type: number, offset: number, primcount: number): void {
        throw new Error('Method not implemented.');
    }

    vertexAttribDivisor(index: number, divisor: number): void {
        throw new Error('Method not implemented.');
    }

    createVertexArray() {
        throw new Error('Method not implemented.');
    }

    bindVertexArray(vao?: any): void {
        throw new Error('Method not implemented.');
    }

    deleteVertexArray(vao: any): void {
        throw new Error('Method not implemented.');
    }

    blitFramebuffer(srcX0: number, srcY0: number, srcX1: number, srcY1: number, dstX0: number, dstY0: number,
        dstX1: number, dstY1: number, mask: number, filter: number): void {
        throw new Error('Method not implemented.');
    }

    renderbufferStorageMultisample(target: number, samples: number, internalformat: number, width: number, height: number): void {
        throw new Error('Method not implemented.');
    }

    bindBufferBase(target: number, index: number, buffer: WebGLBuffer): void {
        throw new Error('Method not implemented.');
    }

    getUniformBlockIndex(program: WebGLProgram, uniformBlockName: string): number {
        throw new Error('Method not implemented.');
    }
    uniformBlockBinding(program: WebGLProgram, uniformBlockIndex: number, uniformBlockBinding: number): void {
        throw new Error('Method not implemented.');
    }

    createQuery() {
        throw new Error('Method not implemented.');
    }

    deleteQuery(query: any): void {
        throw new Error('Method not implemented.');
    }

    beginQuery(target: number, query: any): void {
        throw new Error('Method not implemented.');
    }

    endQuery(target: number): void {
        throw new Error('Method not implemented.');
    }

    getQueryParameter(query: any, pname: number) {
        throw new Error('Method not implemented.');
    }

    getQuery(target: number, pname: number) {
        throw new Error('Method not implemented.');
    }
}

class Runner {
    private canvas: any;
    private engine: any;

    constructor() {
        this.canvas = new Canvas();
        this.engine = new BABYLON.Engine(
            this.canvas, true, { stencil: true, disableWebGL2Support: false, preserveDrawingBuffer: true, premultipliedAlpha: false });
    }

    createScene() {

        // This creates a basic Babylon Scene object (non-mesh)
        const scene = new BABYLON.Scene(this.engine);

        // This creates and positions a free camera (non-mesh)
        const camera = new BABYLON.ArcRotateCamera('ArcRotateCamera', 1, 0.8, 5, BABYLON.Vector3.Zero(), scene);
        camera.setPosition(new BABYLON.Vector3(0, 10, 10));

        // This attaches the camera to the canvas
        camera.attachControl(this.canvas, true);

        const sphere = BABYLON.Mesh.CreateSphere('sphere', 16, 2, scene);

        return scene;
    }

    run() {
        const scene = this.createScene();

        this.engine.runRenderLoop(() => {
            scene.render();
        });
    }
}

new Runner().run();
