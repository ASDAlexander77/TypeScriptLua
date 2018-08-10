class Rectangle {
    constructor(private w: number, private h: number) {
        console.log('Hi!');
        console.log(this.w);
    }

/*
    public run() {
	console.log('run');
    }
*/
  }

const p = new Rectangle(1, 2);
//p.run();
