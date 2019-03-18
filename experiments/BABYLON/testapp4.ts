declare var os: any;
declare var Canvas: any;

export default class TestApp4 {
    private canvas: any;
    private engine: any;

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
        const scene = new BABYLON.Scene(this.engine);

        // Lights
        const light0 = new BABYLON.DirectionalLight("Omni", new BABYLON.Vector3(-2, -5, 2), scene);
        const light1 = new BABYLON.PointLight('Omni', new BABYLON.Vector3(2, -5, -2), scene);

        // Need a free camera for collisions
        const camera = new BABYLON.FreeCamera('FreeCamera', new BABYLON.Vector3(0, -8, -20), scene);
        camera.attachControl(this.canvas, true);

        // Ground
        const ground = BABYLON.Mesh.CreatePlane('ground', 20.0, scene);
        ground.material = new BABYLON.StandardMaterial('groundMat', scene);
        ground.material.diffuseColor = new BABYLON.Color3(1, 1, 1);
        ground.material.backFaceCulling = false;
        ground.position = new BABYLON.Vector3(5, -10, -15);
        ground.rotation = new BABYLON.Vector3(Math.PI / 2, 0, 0);

        // Simple crate
        const box = BABYLON.Mesh.CreateBox('crate', 2, scene);
        box.material = new BABYLON.StandardMaterial('Mat', scene);
        box.material.diffuseTexture = new BABYLON.Texture('crate.png', scene);
        box.material.diffuseTexture.hasAlpha = true;
        box.position = new BABYLON.Vector3(5, -9, -10);

        // Set gravity for the scene (G force like, on Y-axis)
        scene.gravity = new BABYLON.Vector3(0, -0.9, 0);

        // Enable Collisions
        scene.collisionsEnabled = true;

        // Then apply collisions and gravity to the active camera
        camera.checkCollisions = true;
        camera.applyGravity = true;

        // Set the ellipsoid around the camera (e.g. your player's size)
        camera.ellipsoid = new BABYLON.Vector3(1, 1, 1);

        // finally, say which mesh will be collisionable
        ground.checkCollisions = true;
        box.checkCollisions = true;


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
                    scene.activeCamera.position.addInPlace(dir.scaleInPlace(delta * 10));
                } else {
                    scene.activeCamera.position.subtractInPlace(dir.scaleInPlace(-delta * 10));
                }
            }
        }, BABYLON.PointerEventTypes.POINTERWHEEL, false);

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

        // Resize
        window.addEventListener('resize', () => {
            this.engine.resize();
        });
    }
}
