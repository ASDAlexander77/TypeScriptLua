import './JS';

const a = `{"name":" \\/ 0"}`;

const b = JSON.parse(a);

class Test
{

}

Test.prototype.hello = function () {
    console.log("Hello");
}

const t = new Test();
t.hello();
