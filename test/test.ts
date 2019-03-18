import './JS';

module Module1
{
    export const Epsilon1 = 0.0001;

    export class Test1 {
        public static print() {
            console.log(Epsilon1);
        }
    }
}

Module1.Test1.print();
console.log(Module1.Epsilon1);
