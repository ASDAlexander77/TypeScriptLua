class Foo {
    constructor(public value: int) {
    }
}

function makeAndDrop(): WeakRef<Foo> {
    const obj = new Foo(42);
    const ref = new WeakRef<Foo>(obj);
    return ref;
}

function main() {
    const ref = makeAndDrop();

    // object should still be alive here since no GC ran yet in a way that could collect it
    const before = ref.deref();
    console.log(before != undefined);

    GC_gcollect();
    GC_gcollect();

    const after = ref.deref();
    console.log(after == undefined);
    console.log("ALL DONE");
}
