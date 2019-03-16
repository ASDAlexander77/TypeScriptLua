import './JS';


class ShaderMaterial {
    constructor(shaderPath: any) {
        console.log(shaderPath.substr(0, 3));
    }
}

let _colorShader = new ShaderMaterial("color");