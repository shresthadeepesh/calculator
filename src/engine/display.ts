import { kindOf, Table } from './types';

const GLYPHS: Record<string, string> = {
    '*': '×',
    '/': '÷',
    '-': '−',
    '%': 'mod',
    '⁻¹': '⁻¹',
};

const WORDS = ['AND', 'OR', 'XOR', 'NOT', '<<', '>>'];

const glyph = (token: string) => GLYPHS[token] ?? token;

/** Spacing that reads like written maths: sin(30) + 2, not sin ( 30 ) + 2. */
export const prettify = <T,>(tokens: string[], table: Table<T>) =>
    tokens.reduce((text, token, index) => {
        const kind = kindOf(table, token);
        const previous = tokens[index - 1];
        const previousKind = previous === undefined ? null : kindOf(table, previous);

        const tight =
            index === 0 ||
            kind === 'close' ||
            kind === 'postfix' ||
            previousKind === 'open' ||
            previousKind === 'prefix';

        const spaced = WORDS.includes(token) || WORDS.includes(previous ?? '');

        return `${text}${tight && !spaced ? '' : ' '}${glyph(token)}`;
    }, '');
