import { byte, int } from './types';

export class BinaryWriter {
    private data: Array<byte> = [];

    public write(data: byte): void {
        this.data.push(data);
    }

    public writeByte(data: byte): void {
        this.data.push(data);
    }    

    public writeInt(data: int): void {
        this.data.push((data & 0x000000ff));
        this.data.push((data & 0x0000ff00) >> 8);
        this.data.push((data & 0x00ff0000) >> 16);
        this.data.push((data & 0xff000000) >> 24);
    }    

    public writeString(data: string): void {
        if (data == null)
        {
            this.data.push(0);
            return;
        }

        throw 'Not implemented';
    } 

    public writeArray(data: byte[]): void {
        data.forEach((b) => {
            this.write(b);
        });
    }

    public getBytes(): Uint8Array
    {
        return new Uint8Array(this.data);
    }
}
