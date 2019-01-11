import './JS';

navigator = <Navigator>{};

// Core
import './BABYLON/Materials/effect';
import './BABYLON/types';
import './BABYLON/Events/keyboardEvents';
import './BABYLON/Events/pointerEvents';
import './BABYLON/Math/math';
import './BABYLON/Math/math_scalar';
import './BABYLON/mixins';
import './BABYLON/Tools/decorators';
import './BABYLON/Tools/deferred';
import './BABYLON/Tools/observable';
import './BABYLON/Tools/smartArray';
import './BABYLON/Tools/tools';
import './BABYLON/Tools/promise';
import './BABYLON/Tools/workerPool';
import './BABYLON/States/alphaCullingState';
import './BABYLON/States/depthCullingState';
import './BABYLON/States/stencilState';
import './BABYLON/Engine/engine';
// import './BABYLON/Engine/webgl2';
import './BABYLON/Engine/nullEngine';
import './BABYLON/node';
import './BABYLON/Culling/boundingSphere';
import './BABYLON/Culling/boundingBox';
import './BABYLON/Culling/boundingInfo';
import './BABYLON/Mesh/transformNode';
import './BABYLON/Mesh/abstractMesh';
import './BABYLON/Lights/light';
import './BABYLON/Cameras/camera';
import './BABYLON/Rendering/renderingManager';
import './BABYLON/Rendering/renderingGroup';
import './BABYLON/sceneComponent';
import './BABYLON/abstractScene';
import './BABYLON/scene';
import './BABYLON/assetContainer';
import './BABYLON/Mesh/buffer';
import './BABYLON/Mesh/vertexBuffer';
import './BABYLON/Materials/Textures/internalTextureLoader';
import './BABYLON/Materials/Textures/internalTextureTracker';
import './BABYLON/Materials/Textures/internalTexture';
import './BABYLON/Materials/Textures/baseTexture';
import './BABYLON/Materials/Textures/texture';
import './BABYLON/Mesh/mesh';
import './BABYLON/Mesh/subMesh';
import './BABYLON/Materials/material';
import './BABYLON/Materials/uniformBuffer';
import './BABYLON/Mesh/mesh_vertexData';
import './BABYLON/Mesh/geometry';
import './BABYLON/Tools/performanceMonitor';
import './BABYLON/Materials/materialHelper';
import './BABYLON/Materials/pushMaterial';
import './BABYLON/Materials/standardMaterial';

// extra
import './BABYLON/Mesh/meshBuilder';

import './BABYLON/Cameras/targetCamera';
import './BABYLON/Cameras/cameraInputsManager';
import './BABYLON/Cameras/Inputs/arcRotateCameraKeyboardMoveInput';
import './BABYLON/Cameras/Inputs/arcRotateCameraMouseWheelInput';
import './BABYLON/Cameras/Inputs/arcRotateCameraPointersInput';
import './BABYLON/Cameras/arcRotateCameraInputsManager';
import './BABYLON/Cameras/arcRotateCamera';

import './window';
import './canvas';

window = <Window><any>WindowEx;

// xcopy /S D:\Git\Babylon.js\src\*.lua D:\Dev\TypeScriptLUA\__build\win64\lua\Debug\BABYLON\

class Runner {
    private canvas: any;
    private engine: any;

    constructor() {
        this.canvas = new Canvas();
        /*
        this.engine = new BABYLON.Engine(
            this.canvas, true, { stencil: true, disableWebGL2Support: false, preserveDrawingBuffer: true, premultipliedAlpha: false });
        */
        this.engine = new BABYLON.NullEngine();

        const basicVertexShader =
            'attribute vec4 position; \
			// Uniforms \
			uniform mat4 world; \
			uniform mat4 view; \
			uniform mat4 viewProjection; \
			 \
			void main() { \
				gl_Position = viewProjection * world * position; \
			}';

        const basicPixelShader =
            '#ifdef GL_ES \
			precision mediump float; \
			#endif \
			 \
			void main(void) { \
			    gl_FragColor = vec4(1.,1.,1.,1.); \
			}';

        BABYLON.Effect.ShadersStore['defaultVertexShader'] = basicVertexShader;
        BABYLON.Effect.ShadersStore['defaultPixelShader'] = basicPixelShader;
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
