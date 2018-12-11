declare var os: any;

module JS {

    export class Date {

        public getHours() {
            return os.date('*t').hour;
        }

        public getMinutes() {
            return os.date('*t').min;
        }

        public getSeconds() {
            return os.date('*t').sec;
        }

    }

}
