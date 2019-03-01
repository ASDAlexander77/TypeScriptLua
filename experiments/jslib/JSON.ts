module JS {

    type TokenSingle = string | number | boolean | null | {};
    type Token = TokenSingle | Array<TokenSingle>;

    // Internal: A map of escaped control characters and their unescaped
    // equivalents.
    const Unescapes = {
        92: '\\',
        34: '"',
        47: '/',
        98: '\b',
        116: '\t',
        110: '\n',
        102: '\f',
        114: '\r'
    };

    export class SyntaxError {
    }

    export class JSONParse {

        // Internal: Stores the parser state.
        private Index: number;
        private Source: string;

        // Internal: Resets the parser state and throws a `SyntaxError`.
        public abort() {
            this.Index = this.Source = null;
            throw SyntaxError();
        }

        // Internal: Returns the next token, or `"$"` if the parser has reached
        // the end of the source string. A token may be a string, number, `null`
        // literal, or Boolean literal.
        public lex(): Token {
            const source: string = this.Source, length = source.length;
            let value, begin, position, isSigned, charCode;
            while (this.Index < length) {
                charCode = source.charCodeAt(this.Index);
                switch (charCode) {
                    case 9: case 10: case 13: case 32:
                        // Skip whitespace tokens, including tabs, carriage returns, line
                        // feeds, and space characters.
                        this.Index++;
                        break;
                    case 123: case 125: case 91: case 93: case 58: case 44:
                        // Parse a punctuator token (`{`, `}`, `[`, `]`, `:`, or `,`) at
                        // the current position.
                        value = source[this.Index];
                        this.Index++;
                        return value;
                    case 34:
                        // `"` delimits a JSON string; advance to the next character and
                        // begin parsing the string. String tokens are prefixed with the
                        // sentinel `@` character to distinguish them from punctuators and
                        // end-of-string tokens.
                        for (value = '@', this.Index++; this.Index < length;) {
                            charCode = source.charCodeAt(this.Index);
                            if (charCode < 32) {
                                // Unescaped ASCII control characters (those with a code unit
                                // less than the space character) are not permitted.
                                this.abort();
                            } else if (charCode === 92) {
                                // A reverse solidus (`\`) marks the beginning of an escaped
                                // control character (including `"`, `\`, and `/`) or Unicode
                                // escape sequence.
                                charCode = source.charCodeAt(++this.Index);
                                switch (charCode) {
                                    case 92: case 34: case 47: case 98: case 116: case 110: case 102: case 114:
                                        // Revive escaped control characters.
                                        value += Unescapes[charCode];
                                        this.Index++;
                                        break;
                                    case 117:
                                        // `\u` marks the beginning of a Unicode escape sequence.
                                        // Advance to the first character and validate the
                                        // four-digit code point.
                                        begin = ++this.Index;
                                        for (position = this.Index + 4; this.Index < position; this.Index++) {
                                            charCode = source.charCodeAt(this.Index);
                                            // A valid sequence comprises four hexdigits (case-
                                            // insensitive) that form a single hexadecimal value.
                                            if (!(charCode >= 48
                                                && charCode <= 57 || charCode >= 97 && charCode <= 102
                                                || charCode >= 65 && charCode <= 70)) {
                                                // Invalid Unicode escape sequence.
                                                this.abort();
                                            }
                                        }
                                        // Revive the escaped character.
                                        value += StringHelper.fromCharCode('0x' + source.slice(begin, this.Index));
                                        break;
                                    default:
                                        // Invalid escape sequence.
                                        this.abort();
                                }
                            } else {
                                if (charCode === 34) {
                                    // An unescaped double-quote character marks the end of the
                                    // string.
                                    break;
                                }
                                charCode = source.charCodeAt(this.Index);
                                begin = this.Index;
                                // Optimize for the common case where a string is valid.
                                while (charCode >= 32 && charCode !== 92 && charCode !== 34) {
                                    charCode = source.charCodeAt(++this.Index);
                                }
                                // Append the string as-is.
                                value += source.slice(begin, this.Index);
                            }
                        }

                        if (source.charCodeAt(this.Index) === 34) {
                            // Advance to the next character and return the revived string.
                            this.Index++;
                            return value;
                        }

                        // Unterminated string.
                        this.abort();
                        break;
                    default:
                        // Parse numbers and literals.
                        begin = this.Index;
                        // Advance past the negative sign, if one is specified.
                        if (charCode === 45) {
                            isSigned = true;
                            charCode = source.charCodeAt(++this.Index);
                        }
                        // Parse an integer or floating-point value.
                        if (charCode >= 48 && charCode <= 57) {
                            // Leading zeroes are interpreted as octal literals.
                            if (charCode === 48 && ((charCode = source.charCodeAt(this.Index + 1)), charCode >= 48 && charCode <= 57)) {
                                // Illegal octal literal.
                                this.abort();
                            }

                            isSigned = false;
                            // Parse the integer component.
                            for (; this.Index < length
                                && ((charCode = source.charCodeAt(this.Index)), charCode >= 48 && charCode <= 57);
                                this.Index++) {
                            }
                            // Floats cannot contain a leading decimal point; however, this
                            // case is already accounted for by the parser.
                            if (source.charCodeAt(this.Index) === 46) {
                                position = ++this.Index;
                                // Parse the decimal component.
                                for (; position < length
                                    && ((charCode = source.charCodeAt(position)), charCode >= 48 && charCode <= 57); position++) {
                                }

                                if (position === this.Index) {
                                    // Illegal trailing decimal.
                                    this.abort();
                                }

                                this.Index = position;
                            }

                            // Parse exponents. The `e` denoting the exponent is
                            // case-insensitive.
                            charCode = source.charCodeAt(this.Index);
                            if (charCode === 101 || charCode === 69) {
                                charCode = source.charCodeAt(++this.Index);
                                // Skip past the sign following the exponent, if one is
                                // specified.
                                if (charCode === 43 || charCode === 45) {
                                    this.Index++;
                                }

                                // Parse the exponential component.
                                for (position = this.Index; position < length
                                    && ((charCode = source.charCodeAt(position)), charCode >= 48 && charCode <= 57); position++) {
                                }

                                if (position === this.Index) {
                                    // Illegal empty exponent.
                                    this.abort();
                                }

                                this.Index = position;
                            }

                            // Coerce the parsed value to a JavaScript number.
                            const val = source.slice(begin, this.Index);
                            return tonumber(val);
                        }

                        // A negative sign may only precede numbers.
                        if (isSigned) {
                            this.abort();
                        }

                        // `true`, `false`, and `null` literals.
                        if (source.slice(this.Index, this.Index + 4) === 'true') {
                            this.Index += 4;
                            return true;
                        } else if (source.slice(this.Index, this.Index + 5) === 'false') {
                            this.Index += 5;
                            return false;
                        } else if (source.slice(this.Index, this.Index + 4) === 'null') {
                            this.Index += 4;
                            return null;
                        }

                        // Unrecognized token.
                        this.abort();
                }
            }
            // Return the sentinel `$` character if the parser has reached the end
            // of the source string.
            return '$';
        }

        // Internal: Parses a JSON `value` token.
        public get(value: Token): Token {
            let results: Token;
            let hasMembers = false;

            if (value === '$') {
                // Unexpected end of input.
                this.abort();
            }
            if (typeof (value) === 'string') {
                if (value[0] === '@') {
                    // Remove the sentinel `@` character.
                    return value.slice(1);
                }

                // Parse object and array literals.
                if (value === '[') {
                    // Parses a JSON array, returning a new JavaScript array.
                    results = new Array<Token>();
                    for (; ; hasMembers || (hasMembers = true)) {
                        value = this.lex();
                        // A closing square bracket marks the end of the array literal.
                        if (value === ']') {
                            break;
                        }
                        // If the array literal contains elements, the current token
                        // should be a comma separating the previous element from the
                        // next.
                        if (hasMembers) {
                            if (value === ',') {
                                value = this.lex();
                                if (value === ']') {
                                    // Unexpected trailing `,` in array literal.
                                    this.abort();
                                }
                            } else {
                                // A `,` must separate each array element.
                                this.abort();
                            }
                        }

                        // Elisions and leading commas are not permitted.
                        if (value === ',') {
                            this.abort();
                        }

                        (<Array<Token>>results).push(this.get(value));
                    }

                    return results;
                } else if (value === '{') {
                    // Parses a JSON object, returning a new JavaScript object.
                    results = {};
                    for (; ; hasMembers || (hasMembers = true)) {
                        value = this.lex();
                        // A closing curly brace marks the end of the object literal.
                        if (value === '}') {
                            break;
                        }
                        // If the object literal contains members, the current token
                        // should be a comma separator.
                        if (hasMembers) {
                            if (value === ',') {
                                value = this.lex();
                                if (value === '}') {
                                    // Unexpected trailing `,` in object literal.
                                    this.abort();
                                }
                            } else {
                                // A `,` must separate each object member.
                                this.abort();
                            }
                        }
                        // Leading commas are not permitted, object property names must be
                        // double-quoted strings, and a `:` must separate each property
                        // name and value.
                        if (value === ',' || typeof value !== 'string'
                            || value[0] !== '@' || this.lex() !== ':') {
                            this.abort();
                        }

                        const nameProp = (<string>value).slice(1);
                        (<any>results)[nameProp] = this.get(this.lex());
                    }

                    return results;
                }

                // Unexpected token encountered.
                this.abort();
            }

            return value;
        }

        // Public: `JSON.parse`. See ES 5.1 section 15.12.2.
        public parse(source: string) {
            this.Index = 0;
            this.Source = '' + source;
            const result = this.get(this.lex());
            // If a JSON string contains multiple tokens, it is invalid.
            if (this.lex() !== '$') {
                this.abort();
            }

            // Reset the parser state.
            this.Index = this.Source = null;

            return result;
        }
    }

    export class JSON {
        public static parse(source: string): any {
            return new JSONParse().parse(source);
        }
    }
}
