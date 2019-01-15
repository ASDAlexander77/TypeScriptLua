interface ICamera {
    checkInputs?: () => void;

    /*attachControl: (element: HTMLElement, noPreventDefault?: number) => void;*/
    attachControl(element: HTMLElement, noPreventDefault?: number): void;
}

class Camera implements ICamera {
    public checkInputs: () => void;

    public attachControl(element: HTMLElement, noPreventDefault?: number) {
        console.log(noPreventDefault);
    }
}

const c = new Camera();

const ci = <ICamera>c;

c.attachControl(null, 10);
ci.attachControl(null, 20);
