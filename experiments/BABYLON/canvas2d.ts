/// <reference path="./image.d.ts" />

// @ts-ignore
export default class Canvas2d implements CanvasRenderingContext2D {

    private img: ImageObject;

    // @ts-ignore
    constructor() {
    }

    // @ts-ignore
    public drawImage(image: CanvasImageSource, sx: number, sy: number, sw: number,
        sh: number, dx: number, dy: number, dw: number, dh: number): void {
        this.img = <ImageObject><any>image;
    }

    public getImageData(sx: number, sy: number, sw: number, sh: number): ImageData {
        const data = new Uint8Array(this.img.width * this.img.height * 4);
        // (<any>this.img.bits) -> wrap into array
        return { data: <ImageData><any>data };
    }
}
