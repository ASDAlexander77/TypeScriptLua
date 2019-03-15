declare var os: any;
declare var Canvas: any;

export default class TestApp3 {
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

        const camera = new BABYLON.ArcRotateCamera('Camera', 3 * Math.PI / 2, Math.PI / 8, 50, BABYLON.Vector3.Zero(), scene);

        camera.attachControl(this.canvas, true);

        const light = new BABYLON.HemisphericLight('hemi', new BABYLON.Vector3(0, 1, 0), scene);

        // Creation of a box
        // (name of the box, size, scene)
        const box = BABYLON.Mesh.CreateBox('box', 6.0, scene);

        // Creation of a sphere
        // (name of the sphere, segments, diameter, scene)
        const sphere = BABYLON.Mesh.CreateSphere('sphere', 10.0, 10.0, scene);

        // Creation of a plan
        // (name of the plane, size, scene)
        const plan = BABYLON.Mesh.CreatePlane('plane', 10.0, scene);

        // Creation of a cylinder
        // (name, height, diameter, tessellation, scene, updatable)
        const cylinder = BABYLON.Mesh.CreateCylinder('cylinder', 3, 3, 3, 6, 1, scene, false);

        // Creation of a torus
        // (name, diameter, thickness, tessellation, scene, updatable)
        const torus = BABYLON.Mesh.CreateTorus('torus', 5, 1, 10, scene, false);

        // Creation of a knot
        // (name, radius, tube, radialSegments, tubularSegments, p, q, scene, updatable)
        const knot = BABYLON.Mesh.CreateTorusKnot('knot', 2, 0.5, 128, 64, 2, 3, scene);

        // Creation of a lines mesh
        const lines = BABYLON.Mesh.CreateLines('lines', [
            new BABYLON.Vector3(-10, 0, 0),
            new BABYLON.Vector3(10, 0, 0),
            new BABYLON.Vector3(0, 0, -10),
            new BABYLON.Vector3(0, 0, 10)
        ], scene);

        // Creation of a ribbon
        // let's first create many paths along a maths exponential function as an example
        const exponentialPath = function (p) {
            const path = [];
            for (const i = -10; i < 10; i++) {
                path.push(new BABYLON.Vector3(p, i, Math.sin(p / 3) * 5 * Math.exp(-(i - p) * (i - p) / 60) + i / 3));
            }
            return path;
        };

        // let's populate arrayOfPaths with all these different paths
        const arrayOfPaths = [];
        for (const p = 0; p < 20; p++) {
            arrayOfPaths[p] = exponentialPath(p);
        }

        // (name, array of paths, closeArray, closePath, offset, scene)
        const ribbon = BABYLON.Mesh.CreateRibbon('ribbon', arrayOfPaths, false, false, 0, scene);


        // Moving elements
        box.position = new BABYLON.Vector3(-10, 0, 0);   // Using a vector
        sphere.position = new BABYLON.Vector3(0, 10, 0); // Using a vector
        plan.position.z = 10;                            // Using a single coordinate component
        cylinder.position.z = -10;
        torus.position.x = 10;
        knot.position.y = -10;
        ribbon.position = new BABYLON.Vector3(-10, -10, 20);

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
