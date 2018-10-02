class Event1 {
    public message: string;
}

class Handler {
    info: string;
    onClickGood = (e: Event1) => { this.info = e.message; };
}

let h = new Handler();
let m = new Event1();
m.message = 'test';
h.onClickGood(m);
console.log(h.info);
