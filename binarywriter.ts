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

    public writeInteger(data: number): void {
        // write 8 bytes
        throw 'Not implemented';
    }      

    public writeNumber(data: number): void {
        throw 'Not implemented';
    }      

    public writeString(data: string): void {
        if (data == null)
        {
            this.data.push(0);
            return;
        }

        if (data.length + 1 >= 255)
        {
            this.writeByte(255);
            this.writeInteger(data.length + 1);
        }
        else
        {
            this.writeByte(data.length + 1);
        }

        let i;
        for (i = 0; i < data.length; i++)
        {
            this.writeByte(data.charCodeAt(i));
        }
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
