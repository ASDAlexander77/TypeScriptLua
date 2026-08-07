// Node's console.log and jslib's disagree about formatting: jslib separates arguments with
// a tab and renders arrays through Array.prototype.join(','), where Node uses spaces and
// util.inspect. The survey compares values, not printers, so the Node side is adapted down
// to jslib's format here. The deviation itself is reported separately, not swept away -
// see docs/superpowers/specs/2026-08-07-jslib-conformance-suite-design.md.
'use strict';

function format(value) {
    if (value === null) {
        return 'nil';
    }

    if (Array.isArray(value)) {
        return value.join(',');
    }

    return String(value);
}

console.log = function () {
    const args = Array.prototype.slice.call(arguments);
    process.stdout.write(args.map(format).join('\t') + '\n');
};
