__instanceof = function (inst: object, type: object) {
    if (!inst) {
        return false;
    }

    let mt: object;
    switch (__type(inst)) {
        case "table":
            mt = rawget(inst, "__proto");
            break;
        case "number":
            mt = Number;
            break;
        case "string":
            mt = String;
            break;
        case "boolean":
            mt = Boolean;
            break;
    }

    while (mt) {
        if (mt == type) {
            return true;
        }

        mt = rawget(mt, "__proto");
    }

    return false;
}

__get_call_undefined__ = function (t, k) {
    let rootProto: object = rawget(t, "__proto");
    let proto: object = t;
    while (proto) {
        let get_: object = rawget(proto, "__get__");
        const getmethod: object = get_ && get_[k];
        if (getmethod) {
            return getmethod(t);
        }

        proto = rawget(proto, "__proto");
    }

    let v = rawget(t, k);
    if (v == null) {
        const nullsHolder: object = rawget(t, "__nulls");
        if (nullsHolder && nullsHolder[k]) {
            return null;
        }

        v = rootProto && rootProto[k];
    }

    return v == null ? undefined : v;
}

__set_call_undefined__ = function (t, k, v) {
    let proto: object = t;
    while (proto) {
        let set_: object = rawget(proto, "__set__");
        const setmethod: object = set_ && set_[k];
        if (setmethod) {
            setmethod(t, v);
            return;
        }

        proto = rawget(proto, "__proto");
    }

    if (v == null) {
        const nullsHolder: object = rawget(t, "__nulls");
        if (!nullsHolder) {
            nullsHolder = {};
            rawset(t, "__nulls", nullsHolder);
        }

        nullsHolder[k] = true;
        return;
    }

    let v0 = v;
    if (v == undefined) {
        const nullsHolder: object = rawget(t, "__nulls");
        if (nullsHolder) {
            nullsHolder[k] = null;
        }

        v0 = null;
    }

    rawset(t, k, v0);
}

import './JS';

declare var os: any;
declare var navigator: any;

navigator = <Navigator>{};

// Core
import './BABYLON/Materials/babylon_effect';
import './BABYLON/babylon_types';
import './BABYLON/Events/babylon_keyboardEvents';
import './BABYLON/Events/babylon_pointerEvents';
import './BABYLON/Math/babylon_math';
import './BABYLON/Math/babylon_math_scalar';
import './BABYLON/babylon_mixins';
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
import './BABYLON/Engine/babylon_webgl2';
// import './BABYLON/Engine/babylon_nullEngine';
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
import './BABYLON/Mesh/babylon_groundMesh';

// extra
import './BABYLON/Mesh/babylon_meshBuilder';

import './BABYLON/Cameras/babylon_targetCamera';
import './BABYLON/Cameras/babylon_cameraInputsManager';

import './BABYLON/Cameras/Inputs/babylon_arcRotateCameraKeyboardMoveInput';
import './BABYLON/Cameras/Inputs/babylon_arcRotateCameraMouseWheelInput';
import './BABYLON/Cameras/Inputs/babylon_arcRotateCameraPointersInput';
import './BABYLON/Cameras/babylon_arcRotateCameraInputsManager';
import './BABYLON/Cameras/babylon_arcRotateCamera';

import './BABYLON/Cameras/Inputs/babylon_freeCameraKeyboardMoveInput';
import './BABYLON/Cameras/Inputs/babylon_freeCameraMouseInput';
import './BABYLON/Cameras/babylon_freeCameraInputsManager';
import './BABYLON/Cameras/babylon_freeCamera';

import './BABYLON/Tools/babylon_filesInput';

import './BABYLON/Lights/babylon_hemisphericLight';

import './BABYLON/Materials/babylon_imageProcessingConfiguration';
import './BABYLON/Materials/babylon_colorCurves';

import WindowEx from './window';
import Canvas from './canvas';

declare var window: WindowEx;
window = new WindowEx();

class Runner {
    private canvas: any;
    private engine: any;

    constructor() {
        this.canvas = new Canvas();
        this.engine = new BABYLON.Engine(
            this.canvas, true, { stencil: true, disableWebGL2Support: false, preserveDrawingBuffer: true, premultipliedAlpha: false });
        // this.engine = new BABYLON.NullEngine();

        // TODO: debug options
        // this.engine.disableUniformBuffers = true;
        this.engine.validateShaderPrograms = true;
        BABYLON.Engine.ShadersRepository = 'Shaders/';

        /*
        const basicVertexShader =
            'attribute vec4 position; \n\
			uniform mat4 world; \n\
			uniform mat4 view; \n\
			uniform mat4 viewProjection; \n\
            \n\
			void main() { \n\
				gl_Position = viewProjection * world * position; \n\
			}\n';

        const basicPixelShader =
            '#ifdef GL_ES \n\
			precision mediump float; \n\
			#endif \n\
            \n\
			void main(void) { \n\
			    gl_FragColor = vec4(1.,1.,1.,1.); \n\
			}\n';

        BABYLON.Effect.ShadersStore['defaultVertexShader'] = basicVertexShader;
        BABYLON.Effect.ShadersStore['defaultPixelShader'] = basicPixelShader;
        */
    }

    createScene() {
        // This creates a basic Babylon Scene object (non-mesh)
        var scene = new BABYLON.Scene(this.engine);
        scene.forceWireframe = true;

        // This creates and positions a free camera (non-mesh)
        var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);

        // This targets the camera to scene origin
        camera.setTarget(BABYLON.Vector3.Zero());

        // This attaches the camera to the canvas
        camera.attachControl(this.canvas, true);

        // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
        var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);

        // Default intensity is 1. Let's dim the light a small amount
        light.intensity = 0.7;

        // Our built-in 'sphere' shape. Params: name, subdivs, size, scene
        var sphere = BABYLON.Mesh.CreateSphere("sphere1", 16, 2, scene);

        // Move the sphere upward 1/2 its height
        sphere.position.y = 1;

        // Our built-in 'ground' shape. Params: name, width, depth, subdivs, scene
        var ground = BABYLON.Mesh.CreateGround("ground1", 6, 6, 2, scene);

        return scene;
    }

    run() {
        const scene = this.createScene();

        this.engine.runRenderLoop(() => {
            const before = os.clock();
            scene.render();
            const time = (os.clock() - before);
            console.log(`Render time: ${time} sec.`);
        });
    }
}

new Runner().run();

// @ts-ignore
window.loop();
