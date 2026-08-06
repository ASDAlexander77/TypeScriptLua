import * as fs from 'fs-extra';
import * as path from 'path';
import { generateJsLibDts } from '../src/jslibdts';

const root = path.join(__dirname, '..');
const target = path.join(root, 'lib', 'JSLib.d.ts');

fs.mkdirpSync(path.dirname(target));
fs.writeFileSync(target, generateJsLibDts(path.join(root, 'experiments', 'jslib')));

console.log('Written ' + target);
