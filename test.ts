class Test {
private _partialLoadImg(url: string, index: number, loadedImages: HTMLImageElement[], scene: Nullable<Scene>,
    onfinish: (images: HTMLImageElement[]) => void, onErrorCallBack: Nullable<(message?: string, exception?: any) => void> = null) {

    var img: HTMLImageElement;

    var onload = () => {
        loadedImages[index] = img;
        (<any>loadedImages)._internalCount++;

        if (scene) {
            scene._removePendingData(img);
        }

        if ((<any>loadedImages)._internalCount === 6) {
            onfinish(loadedImages);
        }
    };

    var onerror = (message?: string, exception?: any) => {
        if (scene) {
            scene._removePendingData(img);
        }

        if (onErrorCallBack) {
            onErrorCallBack(message, exception);
        }
    };

    img = Tools.LoadImage(url, onload, onerror, scene ? scene.database : null);
    if (scene) {
        scene._addPendingData(img);
    }
}

}