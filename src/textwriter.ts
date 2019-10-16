import { byte, int } from './types';

export class TextWriter {
    private data: Array<string> = [];

    public writeString(data: string): void {
        if (data == null) {
            return;
        }

        this.data.push(data);
    }

    public getBytes(): string {
        return this.data.join("");
    }
}
