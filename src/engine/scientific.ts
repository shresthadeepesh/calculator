import { CalcError, Context, Table } from './types';

const guard = (value: number) => {
    if (Number.isNaN(value)) throw new CalcError('Not a number');
    if (!Number.isFinite(value)) throw new CalcError('Result is out of range');
    return value;
};

const toRadians = (value: number, context: Context) =>
    context.angle === 'deg' ? (value * Math.PI) / 180 : value;

const fromRadians = (value: number, context: Context) =>
    context.angle === 'deg' ? (value * 180) / Math.PI : value;

/** Trig at exact right angles: 1e-16 noise reads worse than a clean zero. */
const clean = (value: number) => (Math.abs(value) < 1e-12 ? 0 : value);

const factorial = (value: number) => {
    if (!Number.isInteger(value) || value < 0) throw new CalcError('Factorial needs a whole number');
    if (value > 170) throw new CalcError('Result is out of range');

    let total = 1;
    for (let i = 2; i <= value; i += 1) total *= i;
    return total;
};

export const LITERAL = /^-?(\d+\.?\d*|\.\d+)$/;

export const scientific: Table<number> = {
    binary: {
        '+': { precedence: 1, assoc: 'left', apply: (a, b) => guard(a + b) },
        '-': { precedence: 1, assoc: 'left', apply: (a, b) => guard(a - b) },
        '*': { precedence: 2, assoc: 'left', apply: (a, b) => guard(a * b) },
        '/': {
            precedence: 2,
            assoc: 'left',
            apply: (a, b) => {
                if (b === 0) throw new CalcError("Can't divide by zero");
                return guard(a / b);
            },
        },
        '%': {
            precedence: 2,
            assoc: 'left',
            apply: (a, b) => {
                if (b === 0) throw new CalcError("Can't divide by zero");
                return guard(a % b);
            },
        },
        '^': { precedence: 3, assoc: 'right', apply: (a, b) => guard(Math.pow(a, b)) },
    },

    prefix: {
        sin: (value, context) => clean(guard(Math.sin(toRadians(value, context)))),
        cos: (value, context) => clean(guard(Math.cos(toRadians(value, context)))),
        tan: (value, context) => clean(guard(Math.tan(toRadians(value, context)))),
        asin: (value, context) => fromRadians(guard(Math.asin(value)), context),
        acos: (value, context) => fromRadians(guard(Math.acos(value)), context),
        atan: (value, context) => fromRadians(guard(Math.atan(value)), context),
        ln: value => {
            if (value <= 0) throw new CalcError('Log needs a positive number');
            return guard(Math.log(value));
        },
        log: value => {
            if (value <= 0) throw new CalcError('Log needs a positive number');
            return guard(Math.log10(value));
        },
        '√': value => {
            if (value < 0) throw new CalcError("Can't root a negative number");
            return guard(Math.sqrt(value));
        },
        'e^': value => guard(Math.exp(value)),
        '10^': value => guard(Math.pow(10, value)),
    },

    postfix: {
        '!': value => guard(factorial(value)),
        '²': value => guard(value * value),
        '⁻¹': value => {
            if (value === 0) throw new CalcError("Can't divide by zero");
            return guard(1 / value);
        },
    },

    constants: {
        'π': Math.PI,
        e: Math.E,
    },

    parse: lexeme => {
        const value = Number(lexeme);
        if (!Number.isFinite(value)) throw new CalcError('That expression is incomplete');
        return value;
    },

    isLiteral: lexeme => LITERAL.test(lexeme),
};
