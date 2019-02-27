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

import './BABYLON/Culling/babylon_ray';
import './BABYLON/Collisions/babylon_pickingInfo';

import WindowEx from './window';
import DocumentEx from './document';
import Canvas from './canvas';

declare var window: WindowEx;
window = new WindowEx();

declare var document: DocumentEx;
document = new DocumentEx();

// hack to fix BabylonJS 3.3 code
// @ts-ignore
BABYLON.Viewport.toGlobal = function (renderWidth: number, renderHeight: number): BABYLON.Viewport {
    return new BABYLON.Viewport(this.x * renderWidth, this.y * renderHeight, this.width * renderWidth, this.height * renderHeight);
};

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
            'attribute vec4 position; n
			uniform mat4 world; n
			uniform mat4 view; n
			uniform mat4 viewProjection; n
            n
			void main() { n
				gl_Position = viewProjection * world * position; n
			}n';

        const basicPixelShader =
            '#ifdef GL_ES n
			precision mediump float; n
			#endif n
            n
			void main(void) { n
			    gl_FragColor = vec4(1.,1.,1.,1.); n
			}n';

        BABYLON.Effect.ShadersStore['defaultVertexShader'] = basicVertexShader;
        BABYLON.Effect.ShadersStore['defaultPixelShader'] = basicPixelShader;
        */
    }

    createScene() {
        // This creates a basic Babylon Scene object (non-mesh)
        const scene = new BABYLON.Scene(this.engine);

        // This creates and positions a free camera (non-mesh)
        const camera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 5, -10), scene);

        // This targets the camera to scene origin
        camera.setTarget(BABYLON.Vector3.Zero());

        // This attaches the camera to the canvas
        camera.attachControl(this.canvas, true);

        // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
        const light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 1, 0), scene);

        // Default intensity is 1. Let's dim the light a small amount
        light.intensity = 0.7;

        // Our built-in 'sphere' shape. Params: name, subdivs, size, scene
        const sphere = BABYLON.Mesh.CreateSphere('sphere1', 16, 2, scene);

        // Move the sphere upward 1/2 its height
        sphere.position.y = 1;

        // Our built-in 'ground' shape. Params: name, width, depth, subdivs, scene
        const ground = BABYLON.Mesh.CreateGround('ground1', 6, 6, 2, scene);

        // wingnut crap.
        scene.onPrePointerObservable.add(function (pointerInfo, eventState) {
            // console.log(pointerInfo);
            const event = pointerInfo.event;
            let delta = 0;
            if (event.wheelDelta) {
                delta = event.wheelDelta;
            } else if (event.detail) {
                delta = -event.detail;
            }

            if (delta) {
                const dir = scene.activeCamera.getDirection(BABYLON.Axis.Z);
                if (delta > 0) {
                    scene.activeCamera.position.addInPlace(dir);
                } else {
                    scene.activeCamera.position.subtractInPlace(dir);
                }
            }
        }, BABYLON.PointerEventTypes.POINTERWHEEL, false);

        return scene;
    }

    run() {
        const scene = this.createScene();

        let c = 0;
        this.engine.runRenderLoop(() => {
            const before = os.clock();

            // scene.clearColor.r = c;
            c += 0.01;
            if (c > 1.0) {
                c = 0.0;
            }

            scene.render();

            const time = (os.clock() - before);
            console.log(`Render time: ${time} sec.`);
        });
    }
}

new Runner().run();

// @ts-ignore
window.focus();
// @ts-ignore
window.loop();
