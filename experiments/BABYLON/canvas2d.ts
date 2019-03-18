/// <reference path="./image.d.ts" />

// @ts-ignore
export default class Canvas2d implements CanvasRenderingContext2D {

    // @ts-ignore
    constructor() {
    }

    // @ts-ignore
    public drawImage(image: CanvasImageSource, sx: number, sy: number, sw: number,
        sh: number, dx: number, dy: number, dw: number, dh: number): void {
            const img = <ImageObject><any>image;
    }
}
