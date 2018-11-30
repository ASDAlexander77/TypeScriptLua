declare var print;
class console {
    public static log(...params) {
        print(...params);
    }
}

const grade = 0;
switch (grade) {
    case 0:
        console.log("Excellent");
        break;
    case 1:
        var i = 0;
        for (i; i < 10; i++) {
            console.log("failed");
        }
        console.log("failed");
        for (i; i < 10; i++) {
            console.log("failed");
        }
        console.log("failed");
        break;
    case 2:
        console.log("failed");
        break;
}