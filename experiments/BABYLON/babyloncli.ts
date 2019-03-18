import './JS';

declare var arg: any;
declare var os: any;
declare var navigator: any;

// init global classes
navigator = <Navigator>{};

import WindowEx from './window';
import DocumentEx from './document';

declare var window: WindowEx;
window = new WindowEx();
(<any>window).self = window;

declare var self: WindowEx;
self = window;

declare var setTimeout: (funct: any, millisec: number) => number;
setTimeout = WindowEx.setTimeout;

declare var document: DocumentEx;
document = new DocumentEx();

// Load BabylonJS - Core
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

import './BABYLON/Loading/babylon_sceneLoader';
import './BABYLON/Tools/babylon_database';
import './BABYLON/Loading/Plugins/babylon_babylonFileLoader';

import './BABYLON/Gamepad/babylon_gamepad';
import './BABYLON/Gamepad/babylon_gamepadManager';

import './BABYLON/Cameras/Inputs/babylon_freeCameraTouchInput';
import './BABYLON/Cameras/Inputs/babylon_freeCameraGamepadInput';
import './BABYLON/Cameras/babylon_touchCamera';
import './BABYLON/Cameras/babylon_universalCamera';
import './BABYLON/Gamepad/babylon_gamepadSceneComponent';

import './BABYLON/Lights/babylon_shadowLight';
import './BABYLON/Lights/babylon_pointLight';
import './BABYLON/Lights/babylon_directionalLight';

import './BABYLON/PostProcess/babylon_postProcessManager';
import './BABYLON/PostProcess/babylon_postProcess';
import './BABYLON/PostProcess/babylon_passPostProcess';

import './BABYLON/Mesh/babylon_linesMesh';
import './BABYLON/Materials/babylon_shaderMaterial';
import './BABYLON/Materials/Textures/babylon_cubeTexture';

import './BABYLON/Collisions/babylon_collider';
import './BABYLON/Collisions/babylon_collisionCoordinator';
import './BABYLON/Collisions/babylon_collisionWorker';

import './BABYLON/Animations/babylon_animation';
import './BABYLON/Animations/babylon_animatable';
import './BABYLON/Animations/babylon_animationGroup';
import './BABYLON/Animations/babylon_animationPropertiesOverride';
import './BABYLON/Animations/babylon_easing';
import './BABYLON/Animations/babylon_runtimeAnimation';

import Image from './image';
// @ts-ignore
import Canvas from './canvas';
import TestApp from './testapp';
import TestApp2 from './testapp2';
import TestApp3 from './testapp3';
import TestApp4 from './testapp4';
import TestApp5 from './testapp5';
import TestApp6 from './testapp6';
import TestLoadMesh from './testloadmesh';

// hack to fix BabylonJS 3.3 code
// @ts-ignore
BABYLON.Viewport.toGlobal = function (renderWidth: number, renderHeight: number): BABYLON.Viewport {
    return new BABYLON.Viewport(this.x * renderWidth, this.y * renderHeight, this.width * renderWidth, this.height * renderHeight);
};

const argNumber = arg[1] !== '-i' ? 1 : 2;

// tslint:disable-next-line:radix
const number = parseInt(arg[argNumber]);
number = 6;
switch (number) {
    case 1:
        new TestApp().run();
        break;
    case 2:
        new TestApp2().run();
        break;
    case 3:
        new TestApp3().run();
        break;
    case 4:
        new TestApp4().run();
        break;
    case 5:
        new TestApp5().run();
        break;
    case 6:
        new TestApp6().run();
        break;
    default:
        new TestLoadMesh().run(arg[argNumber]);
        break;
}

// @ts-ignore
window.focus();
// @ts-ignore
window.loop();
