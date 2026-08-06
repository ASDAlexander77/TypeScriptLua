import * as path from 'path';
import { generateJsLibDts } from '../src/jslibdts';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('JSLib.d.ts generator', () => {

    const output = generateJsLibDts(path.join(__dirname, '..', 'experiments', 'jslib'));

    // the printer indents members, so a class body runs to the first '}' in column 0
    function classText(name: string): string {
        const match = output.match(new RegExp('declare class ' + name + '[^{]*\\{[\\s\\S]*?\\n\\}'));
        expect(match, 'no declare class ' + name + ' in the output').to.not.equals(null);
        return match[0];
    }

    it('declares Math as a class with static members', () =>
        expect(classText('Math')).to.match(/static floor\(/));

    // this is the whole point: a static on a class is emitted without self, an interface
    // member is not, and 'lib.es5.d.ts' models Math and String as interfaces
    it('keeps a helper static without a this parameter static', () =>
        expect(classText('String')).to.match(/static fromCharCode\(/));

    it('folds a helper static taking this into an instance member', () => {
        const stringClass = classText('String');
        expect(stringClass).to.match(/\n {4}charCodeAt\(/);
        expect(stringClass).to.not.match(/static charCodeAt\(/);
    });

    it('drops the this parameter of a folded member', () =>
        expect(classText('String')).to.not.match(/charCodeAt\(this:/));

    it('emits a plain top level function as declare function', () =>
        expect(output).to.match(/declare function parseInt\(/));

    it('types an assigned ambient global by what it is assigned', () =>
        expect(output).to.match(/declare var console: typeof Console;/));

    it('skips the undefined class, which collides with the intrinsic', () =>
        expect(output).to.not.match(/declare class undefined/));

    it('skips ambient declarations of lua natives', () => {
        expect(output).to.not.match(/declare var math\b/);
        expect(output).to.not.match(/declare function setmetatable\b/);
    });

    it('skips private members and lua metamethods', () => {
        expect(classText('Error')).to.not.match(/__tostring/);
        expect(classText('Number')).to.not.match(/__lt/);
    });

    it('widens a literal initializer to its base type', () =>
        expect(classText('XMLHttpRequest')).to.match(/static readonly UNSENT: number;/));

    // the module wrappers are gone, so a name still qualified by one would not resolve.
    // 'checker.typeToTypeNode' is the likely source: it prints a type back with its
    // namespace, which is why the assigned globals build their type node by hand
    it('leaves no namespace qualified names behind', () => {
        expect(output).to.not.match(/\bJS\.\w/);
        expect(output).to.not.match(/\bTS\.\w/);
    });

});
