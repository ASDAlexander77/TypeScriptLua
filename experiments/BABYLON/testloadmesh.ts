/// <reference path="./canvas.d.ts" />

declare var os: any;

export default class TestLoadMesh {
    private canvas: any;
    private engine: any;

    private scene: any;

    constructor() {
        this.canvas = new Canvas();
        this.engine = new BABYLON.Engine(
            this.canvas, true, { stencil: true, disableWebGL2Support: false, preserveDrawingBuffer: true, premultipliedAlpha: false });
        this.engine.disableManifestCheck = true;
        this.engine.enableOfflineSupport = true;
        // this.engine = new BABYLON.NullEngine();

        // TODO: debug options
        // this.engine.validateShaderPrograms = true;
        BABYLON.Engine.ShadersRepository = 'Shaders/';
    }

    createScene(fileName: string) {
        // This creates a basic Babylon Scene object (non-mesh)
        const scene = new BABYLON.Scene(this.engine);

        // This creates and positions a free camera (non-mesh)
        const camera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 5, -10), scene);

        // This targets the camera to scene origin
        camera.setTarget(BABYLON.Vector3.Zero());

        // This attaches the camera to the canvas
        camera.attachControl(this.canvas, true);

        // load scene
        BABYLON.SceneLoader.Load(
            '',
            'file://' + (fileName || 'Spaceship.babylon'),
            this.engine,
            (loadedScene) => {

                console.log('Scene loaded');

                // Attach the camera to the scene
                loadedScene.activeCamera.attachControl(this.canvas);

                // wingnut crap.
                loadedScene.onPrePointerObservable.add(function (pointerInfo, eventState) {
                    // console.log(pointerInfo);
                    const event = pointerInfo.event;
                    let delta = 0;
                    if (event.wheelDelta) {
                        delta = event.wheelDelta;
                    } else if (event.detail) {
                        delta = -event.detail;
                    }

                    if (delta) {
                        const dir = loadedScene.activeCamera.getDirection(BABYLON.Axis.Z);
                        if (delta > 0) {
                            loadedScene.activeCamera.position.addInPlace(dir.scaleInPlace(delta * 100));
                        } else {
                            loadedScene.activeCamera.position.subtractInPlace(dir.scaleInPlace(-delta * 100));
                        }
                    }
                }, BABYLON.PointerEventTypes.POINTERWHEEL, false);

                this.scene = loadedScene;
            });

        return scene;
    }

    run(fileName: string) {
        this.scene = this.createScene(fileName);

        this.engine.runRenderLoop(() => {
            const before = os.clock();

            this.scene.render();

            const time = (os.clock() - before);
            console.log(`Render time: ${time} sec.`);
        });

        // Resize
        window.addEventListener('resize', () => {
            this.engine.resize();
        });
    }
}
