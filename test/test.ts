let hello = 'is';
for (const _char of hello) {
    // @ts-ignore
    print(<any>_char);
}
