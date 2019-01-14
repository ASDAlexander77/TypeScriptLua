
declare var print: any;
interface ICamera {
    attachControl: (element: HTMLElement, noPreventDefault?: boolean) => void;
    checkInputs?: () => void;
}

class Camera implements ICamera {
    public checkInputs: () => void;

    public attachControl(element: HTMLElement, noPreventDefault?: boolean) {
        print(noPreventDefault);
    }
}

const c = new Camera();

const ci = <ICamera>c;

c.attachControl(null, true);
ci.attachControl(null, true);


