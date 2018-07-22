import { byte } from './types';

export class BinaryWriter {
    private data: Array<byte> = [];

    public write(data: byte): void {
        this.data.push(data);
    }

    public writeArray(data: byte[]): void {
        data.forEach((b) => {
            this.write(b);
        });
    }
}
