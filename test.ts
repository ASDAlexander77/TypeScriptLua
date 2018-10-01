class Test {
private _partialLoadImg(url: string, index: number, loadedImages: HTMLImageElement[], scene: Nullable<Scene>,
    onfinish: (images: HTMLImageElement[]) => void, onErrorCallBack: Nullable<(message?: string, exception?: any) => void> = null) {

    var img: HTMLImageElement;

    var onload = () => {
        loadedImages[index] = img;
        (<any>loadedImages)._internalCount++;
    };
}

}