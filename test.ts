class Class1 {

    private value: string;

    public set(s: string): Class1 {
        this.value = s;
        return this;
    }

    public show(): void {
        console.log(this.value);
    }
}

let c = new Class1();
c.set('Hello2').show();
