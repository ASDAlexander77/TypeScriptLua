import './JS';

function SetCorsBehavior(url: string | string[]): void {
    if (url && url.indexOf("data:") === 0) {
        return;
    }
}

