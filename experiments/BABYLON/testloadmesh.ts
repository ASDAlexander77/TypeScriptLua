declare var os: any;
declare var Canvas: any;

export default class TestLoadMesh {
    private canvas: any;
    private engine: any;

    private scene: any;

    constructor() {
        this.canvas = new Canvas();
        this.engine = new BABYLON.Engine(
            this.canvas, true, { stencil: true, disableWebGL2Support: false, preserveDrawingBuffer: true, premultipliedAlpha: false });
        // this.engine = new BABYLON.NullEngine();

        // TODO: debug options
        // this.engine.validateShaderPrograms = true;
        BABYLON.Engine.ShadersRepository = 'Shaders/';
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

        // load scene
        BABYLON.SceneLoader.Load(
            '',
            'skull.babylon',
            this.engine,
            (loadedScene) => {
                this.scene = loadedScene;
                // Attach the camera to the scene
                this.scene.activeCamera.attachControl(this.canvas);
            });

        return scene;
    }

    run() {
        this.scene = this.createScene();

        this.engine.runRenderLoop(() => {
            const before = os.clock();

            this.scene.render();

            const time = (os.clock() - before);
            console.log(`Render time: ${time} sec.`);
        });
    }
}
