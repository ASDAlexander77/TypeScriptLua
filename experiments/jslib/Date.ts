declare var os: any;

module JS {

    export class Date {

        static initial_clock: number = os.clock();
        static initial_time: number = os.time();

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
            const clk = os.clock();
            return (Date.initial_time * 1000) + (math.floor((clk - initial_clock) * 1000));
        }

    }

}
