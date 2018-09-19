function buildName(firstName: string, ...restOfName: string[]) {
    console.log(firstName);
    console.log(restOfName[1]);
    console.log(restOfName[2]);
    console.log(restOfName[3]);
}

buildName("Joseph", "Samuel", "Lucas", "MacKinzie");

