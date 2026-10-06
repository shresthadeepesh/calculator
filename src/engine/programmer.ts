import { CalcError, Table } from './types';

export const BASES = [
    { key: 'hex', radix: 16, label: 'HEX', digits: '0123456789ABCDEF' },
    { key: 'dec', radix: 10, label: 'DEC', digits: '0123456789' },
    { key: 'oct', radix: 8, label: 'OCT', digits: '01234567' },
    { key: 'bin', radix: 2, label: 'BIN', digits: '01' },
] as const;

export type BaseKey = typeof BASES[number]['key'];

export const baseFor = (key: BaseKey) => BASES.find(base => base.key === key) ?? BASES[1];

const MAX_SHIFT = 512n;

const shift = (value: bigint, places: bigint, direction: 'left' | 'right') => {
    if (places < 0n) throw new CalcError("Can't shift by a negative amount");
    if (places > MAX_SHIFT) throw new CalcError('Shift is too large');
    return direction === 'left' ? value << places : value >> places;
};

const parseIn = (lexeme: string, radix: number) => {
    const negative = lexeme.startsWith('-');
    const digits = negative ? lexeme.slice(1) : lexeme;
    if (!digits.length) throw new CalcError('That expression is incomplete');

    const value = [...digits].reduce((total, digit) => {
        const place = parseInt(digit, radix);
        if (Number.isNaN(place)) throw new CalcError(`${digit} is not a ${radix}-base digit`);
        return total * BigInt(radix) + BigInt(place);
    }, 0n);

    return negative ? -value : value;
};

/** Integer arithmetic in a chosen base. Division truncates, as in C. */
export const programmer = (key: BaseKey): Table<bigint> => {
    const { radix, digits } = baseFor(key);
    const literal = new RegExp(`^-?[${digits}]+$`, 'i');

    return {
        binary: {
            '+': { precedence: 4, assoc: 'left', apply: (a, b) => a + b },
            '-': { precedence: 4, assoc: 'left', apply: (a, b) => a - b },
            '*': { precedence: 5, assoc: 'left', apply: (a, b) => a * b },
            '/': {
                precedence: 5,
                assoc: 'left',
                apply: (a, b) => {
                    if (b === 0n) throw new CalcError("Can't divide by zero");
                    return a / b;
                },
            },
            '%': {
                precedence: 5,
                assoc: 'left',
                apply: (a, b) => {
                    if (b === 0n) throw new CalcError("Can't divide by zero");
                    return a % b;
                },
            },
            '<<': { precedence: 3, assoc: 'left', apply: (a, b) => shift(a, b, 'left') },
            '>>': { precedence: 3, assoc: 'left', apply: (a, b) => shift(a, b, 'right') },
            AND: { precedence: 2, assoc: 'left', apply: (a, b) => a & b },
            XOR: { precedence: 1, assoc: 'left', apply: (a, b) => a ^ b },
            OR: { precedence: 0, assoc: 'left', apply: (a, b) => a | b },
        },

        prefix: {
            NOT: value => ~value,
        },

        postfix: {},

        constants: {},

        parse: lexeme => parseIn(lexeme, radix),

        isLiteral: lexeme => literal.test(lexeme),
    };
};

export const formatBits = (value: bigint, key: BaseKey) => {
    const { radix } = baseFor(key);
    const text = (value < 0n ? -value : value).toString(radix).toUpperCase();
    return `${value < 0n ? '-' : ''}${text}`;
};
