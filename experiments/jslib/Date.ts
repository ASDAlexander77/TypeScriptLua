declare var os: any;

module JS {

    export class Date {

        public getHours(): number {
            return os.date('*t').hour;
        }

        public getMinutes(): number {
            return os.date('*t').min;
        }

        public getSeconds(): number {
            return os.date('*t').sec;
        }

        public now(): number {
            return os.time() * 1000;
        }

    }

}
