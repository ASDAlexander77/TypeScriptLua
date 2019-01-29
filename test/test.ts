import './JS';

function addStr(source: string): string {
    source = "precision highp float;\n" + source;
    return source;
}

console.log(addStr("!!!! line here"));

