declare var os: any;
declare var Canvas: any;

export default class TestApp2 {
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
        // This creates a basic Babylon Scene object (non-mesh)
        const scene = new BABYLON.Scene(this.engine);

        // This creates and positions a free camera (non-mesh)
        const camera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 5, 10), scene);

        // This targets the camera to scene origin
        camera.setTarget(BABYLON.Vector3.Zero());

        // This attaches the camera to the canvas
        camera.attachControl(this.canvas, true);

        //const light0 = new BABYLON.PointLight("Omni", new BABYLON.Vector3(20, 20, 100), scene);
        const light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 1, 0), scene);

        // Creation of 6 spheres
        const sphere1 = BABYLON.Mesh.CreateSphere("Sphere1", 10, 6.0, scene);
        const sphere2 = BABYLON.Mesh.CreateSphere("Sphere2", 2, 7.0, scene); // Only two segments
        const sphere3 = BABYLON.Mesh.CreateSphere("Sphere3", 10, 9.0, scene);
        const sphere4 = BABYLON.Mesh.CreateSphere("Sphere4", 10, 9.0, scene);
        const sphere5 = BABYLON.Mesh.CreateSphere("Sphere5", 10, 9.0, scene);
        const sphere6 = BABYLON.Mesh.CreateSphere("Sphere6", 10, 9.0, scene);

        // Positioning spheres
        sphere1.position.x = 40;
        sphere2.position.x = 30;
        sphere3.position.x = 10;
        sphere4.position.x = 0;
        sphere5.position.x = -20;
        sphere6.position.x = -30;

        // Creation of a plane
        const plan = BABYLON.Mesh.CreatePlane("plan", 120, scene);
        plan.position.z = -10;
        plan.rotation.y = 3.14;

        // Creation of a material in wireFrame
        const materialSphere1 = new BABYLON.StandardMaterial("texture1", scene);
        materialSphere1.wireframe = true;

        // Creation of a red material with alpha
        const materialSphere2 = new BABYLON.StandardMaterial("texture2", scene);
        materialSphere2.diffuseColor = new BABYLON.Color3(1, 0, 0); //Red
        materialSphere2.alpha = 0.7;

        // Creation of a material with an image
        const materialSphere3 = new BABYLON.StandardMaterial("texture3", scene);
        materialSphere3.diffuseTexture = new BABYLON.Texture("text.jpg", scene);

        // Creation of a material, with translated texture
        const materialSphere4 = new BABYLON.StandardMaterial("texture4", scene);
        materialSphere4.diffuseTexture = new BABYLON.Texture("text.jpg", scene);
        materialSphere4.diffuseTexture.vOffset = 0.1;
        materialSphere4.diffuseTexture.uOffset = 0.4;
        // Offset of 10% vertical
        // Offset of 40% horizontal

        // Creation of a material with alpha texture
        const materialSphere5 = new BABYLON.StandardMaterial("texture5", scene);
        materialSphere5.diffuseTexture = new BABYLON.Texture("Planet.png", scene); // Planet
        materialSphere5.diffuseTexture.hasAlpha = true; // Have an alpha

        // Creation of a material and allways show all the faces
        const materialSphere6 = new BABYLON.StandardMaterial("texture6", scene);
        materialSphere6.diffuseTexture = new BABYLON.Texture("Planet.png", scene); // Planet
        materialSphere6.diffuseTexture.hasAlpha = true; // Have an alpha
        materialSphere6.backFaceCulling = false; // Allways show all the faces of the element

        // Creation of a repeated textured material
        const materialPlan = new BABYLON.StandardMaterial("texturePlane", scene);
        materialPlan.diffuseTexture = new BABYLON.Texture("grass_texture.jpg", scene);
        materialPlan.diffuseTexture.uScale = 5.0;
        materialPlan.diffuseTexture.vScale = 5.0;
        // Wood effect
        // Repeat 5 times on the Vertical Axes
        // Repeat 5 times on the Horizontal Axes
        materialPlan.backFaceCulling = false; // Allways show the front and the back of an element

        // Applying the materials to the mesh
        sphere1.material = materialSphere1;
        sphere2.material = materialSphere2;

        sphere3.material = materialSphere3;
        sphere4.material = materialSphere4;

        sphere5.material = materialSphere5;
        sphere6.material = materialSphere6;

        plan.material = materialPlan;

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
    }
}
