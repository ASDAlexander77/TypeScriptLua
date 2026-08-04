module JSxx {

    export class Object {

        // to make dynamic object to convert string into 'new String' and number to 'new Number'
        constructor(private obj: object = {}) {
        }

        public static create(proto: any): any {
            if (!proto) {
                throw new Error('Prototype can\'t be undefined or null');
            }

            return null;
        }
   }
}