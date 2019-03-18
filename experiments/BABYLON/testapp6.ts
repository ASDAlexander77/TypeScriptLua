declare var os: any;
declare var Canvas: any;

export default class TestApp6 {
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

        // Light
        const spot = new BABYLON.PointLight('spot', new BABYLON.Vector3(0, 30, 10), scene);
        spot.diffuse = new BABYLON.Color3(1, 1, 1);
        spot.specular = new BABYLON.Color3(0, 0, 0);

        // Camera
        const camera = new BABYLON.ArcRotateCamera('Camera', 0, 0.8, 100, BABYLON.Vector3.Zero(), scene);
        camera.lowerBetaLimit = 0.1;
        camera.upperBetaLimit = (Math.PI / 2) * 0.9;
        camera.lowerRadiusLimit = 30;
        camera.upperRadiusLimit = 150;
        camera.attachControl(this.canvas, true);

        // Ground
        const groundMaterial = new BABYLON.StandardMaterial('ground', scene);
        groundMaterial.diffuseTexture = new BABYLON.Texture('Textures/earth.jpg', scene);

        const ground = BABYLON.Mesh.CreateGroundFromHeightMap('ground', 'Textures/worldHeightMap.jpg', 200, 200, 250, 0, 10, scene, false);
        ground.material = groundMaterial;

        // Sphere to see the light's position
        const sun = BABYLON.Mesh.CreateSphere('sun', 10, 4, scene);
        sun.material = new BABYLON.StandardMaterial('sun', scene);
        sun.material.emissiveColor = new BABYLON.Color3(1, 1, 0);

        // Skybox
        const skybox = BABYLON.Mesh.CreateBox('skyBox', 800.0, scene);
        const skyboxMaterial = new BABYLON.StandardMaterial('skyBox', scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture('skybox', scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.disableLighting = true;
        skybox.material = skyboxMaterial;

        // Sun animation
        scene.registerBeforeRender(function () {
            sun.position = spot.position;
            spot.position.x -= 0.5;
            if (spot.position.x < -90)
                spot.position.x = 100;
        });

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
