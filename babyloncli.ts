import './JSLib';
import './BABYLON';

class Runner {
    private canvas: any;
    private engine: any;

    constructor() {
        this.canvas = undefined;
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
