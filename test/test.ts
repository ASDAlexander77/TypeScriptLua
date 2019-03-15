import './JS';

function generateSerializableMember(type: number, sourceName?: string) {
    return sourceName;
}

function serialize(sourceName?: string) {
    return generateSerializableMember(0, sourceName); // value member
}

const s = serialize();

console.log(s);
