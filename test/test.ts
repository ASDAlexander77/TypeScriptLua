import './JS';

const _keys: string[] = [];

for (var key of Object.keys({})) {
    if (key[0] === '_') {
        continue;
    }

    _keys.push(key);
}
