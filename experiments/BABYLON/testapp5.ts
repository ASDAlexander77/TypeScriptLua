declare var os: any;
declare var Canvas: any;

export default class TestApp5 {
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

        const light = new BABYLON.PointLight('Omni', new BABYLON.Vector3(0, 100, 100), scene);
        const camera = new BABYLON.ArcRotateCamera('Camera', 0, 0.8, 100, BABYLON.Vector3.Zero(), scene);
        camera.attachControl(this.canvas, true);

        // Boxes
        const box1 = BABYLON.Mesh.CreateBox('Box1', 10.0, scene);
        box1.position.x = -20;
        const box2 = BABYLON.Mesh.CreateBox('Box2', 10.0, scene);

        const materialBox = new BABYLON.StandardMaterial('texture1', scene);
        materialBox.diffuseColor = new BABYLON.Color3(0, 1, 0);//Green
        const materialBox2 = new BABYLON.StandardMaterial('texture2', scene);

        // Applying materials
        box1.material = materialBox;
        box2.material = materialBox2;

        // Positioning box
        box2.position.x = 20;

        // Creation of a basic animation with box 1
        // ----------------------------------------

        // Create a scaling animation at 30 FPS
        const animationBox = new BABYLON.Animation('tutoAnimation', 'scaling.x', 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
        //Here we have chosen a loop mode, but you can change to :
        //  Use previous values and increment it (BABYLON.Animation.ANIMATIONLOOPMODE_RELATIVE)
        //  Restart from initial value (BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE)
        //  Keep the final value (BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT)

        // Animation keys
        const keys = [];
        // At the animation key 0, the value of scaling is "1"
        keys.push({
            frame: 0,
            value: 1
        });

        // At the animation key 20, the value of scaling is "0.2"
        keys.push({
            frame: 20,
            value: 0.2
        });

        // At the animation key 100, the value of scaling is "1"
        keys.push({
            frame: 100,
            value: 1
        });

        // Adding keys to the animation object
        animationBox.setKeys(keys);

        // Then add the animation object to box1
        box1.animations.push(animationBox);

        // Finally, launch animations on box1, from key 0 to key 100 with loop activated
        scene.beginAnimation(box1, 0, 100, true);

        // Creation of a manual animation with box 2
        // ------------------------------------------
        scene.registerBeforeRender(function () {

            // The color is defined at run time with random()
            box2.material.diffuseColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());

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
