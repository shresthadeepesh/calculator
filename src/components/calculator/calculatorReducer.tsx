import {
    BaseKey,
    CalcError,
    CONVERSION_PRECISION,
    LITERAL,
    Table,
    categoryFor,
    convert,
    evaluate,
    formatBits,
    formatNumber,
    kindOf,
    prettify,
    unitFor,
} from '../../engine';
import { ConverterState, IState, Mode, tableFor } from './state';

export enum CalculatorActionType {
    CLEAR,
    EQUAL,
    ENTRY,
    BACKSPACE,
    SET_MODE,
    SET_BASE,
    TOGGLE_ANGLE,
    TOGGLE_INVERSE,
    MEMORY,
    RECALL,
    SET_CONVERTER,
    SWAP_UNITS,
}

export type MemoryOp = 'clear' | 'recall' | 'add' | 'subtract';

export interface IAction {
    type: CalculatorActionType;
    payload?: string;
    mode?: Mode;
    base?: BaseKey;
    memory?: MemoryOp;
    converter?: Partial<ConverterState>;
}

const MAX_DIGITS = 16;

const digitCount = (token: string) => token.replace(/[^0-9a-f]/gi, '').length;

const openDepth = (tokens: string[]) =>
    tokens.reduce((count, token) => count + (token === '(' ? 1 : token === ')' ? -1 : 0), 0);

/** A lone '-' in a value slot is a minus sign, not a subtraction. */
const pendingSign = (tokens: string[], table: Table<any>) => {
    if (tokens[tokens.length - 1] !== '-') return false;
    const before = tokens[tokens.length - 2];
    if (before === undefined) return true;
    const kind = kindOf(table, before);
    return kind === 'binary' || kind === 'open' || kind === 'prefix';
};

/** Turns a pending sign back into real subtraction: '-' then 'π' means 0 − π. */
const expandSign = (tokens: string[], table: Table<any>) =>
    pendingSign(tokens, table) ? [...tokens.slice(0, -1), '0', '-'] : tokens;

const closes = (kind: string) =>
    kind === 'value' || kind === 'constant' || kind === 'close' || kind === 'postfix';

const entry = (state: IState, key: string): IState => {
    const table = tableFor(state);
    const open = { result: null, error: null, settled: false };

    if (state.mode === 'converter' && !/^[0-9.]$/.test(key)) return state;

    // A settled result is the left operand when an operator follows it, and is
    // discarded when a fresh value starts.
    let tokens = state.tokens;
    if (state.settled) {
        const continues = kindOf(table, key) === 'binary' || kindOf(table, key) === 'postfix';
        tokens = continues && state.result !== null ? [state.result.replace(/ /g, '')] : [];
    }

    const last = tokens[tokens.length - 1];
    const lastKind = last === undefined ? null : kindOf(table, last);
    const sign = pendingSign(tokens, table);
    const typingValue = lastKind === 'value' && !sign;
    const afterValue = lastKind !== null && closes(lastKind) && !sign;
    const kind = kindOf(table, key);

    // Entering a value where one is already complete means implicit multiply.
    const withMultiply = (next: string[]) => (afterValue ? [...next, '*'] : next);

    if (kind === 'constant' || kind === 'prefix' || key === '(') {
        const base = withMultiply(expandSign(tokens, table));
        const added = kind === 'prefix' ? [key, '('] : [key];
        return { ...state, ...open, tokens: [...base, ...added] };
    }

    if (key === ')') {
        if (!afterValue || openDepth(tokens) <= 0) return state;
        return { ...state, ...open, tokens: [...tokens, ')'] };
    }

    if (kind === 'postfix') {
        if (!afterValue) return state;
        return { ...state, ...open, tokens: [...tokens, key] };
    }

    if (kind === 'binary') {
        if (sign) return key === '-' ? state : { ...state, ...open, tokens };
        if (!tokens.length) {
            return key === '-' ? { ...state, ...open, tokens: ['-'] } : state;
        }
        if (afterValue) return { ...state, ...open, tokens: [...tokens, key] };
        if (lastKind === 'binary') return { ...state, ...open, tokens: [...tokens.slice(0, -1), key] };
        if (key === '-' && (lastKind === 'open' || lastKind === 'prefix')) {
            return { ...state, ...open, tokens: [...tokens, '-'] };
        }
        return state;
    }

    // Digits, hex letters and the decimal point.
    if (key === '.') {
        if (state.mode === 'programmer') return state;
        if (!typingValue && !sign) return { ...state, ...open, tokens: [...withMultiply(tokens), '0.'] };
        if (sign) return { ...state, ...open, tokens: [...tokens.slice(0, -1), '-0.'] };
        if (last.includes('.')) return { ...state, ...open, tokens };
        return { ...state, ...open, tokens: [...tokens.slice(0, -1), `${last}.`] };
    }

    if (sign) return { ...state, ...open, tokens: [...tokens.slice(0, -1), `-${key}`] };
    if (!typingValue) return { ...state, ...open, tokens: [...withMultiply(tokens), key] };
    if (digitCount(last) >= MAX_DIGITS) return { ...state, ...open, tokens };
    if (last === '0' || last === '-0') {
        return { ...state, ...open, tokens: [...tokens.slice(0, -1), last.replace(/0$/, key)] };
    }

    return { ...state, ...open, tokens: [...tokens.slice(0, -1), `${last}${key}`] };
};

const backspace = (state: IState): IState => {
    if (state.settled) return { ...state, tokens: [], result: null, error: null, settled: false };

    const last = state.tokens[state.tokens.length - 1];
    if (last === undefined) return state;

    const table = tableFor(state);
    // Multi-character tokens that are not values delete whole, as one key did.
    const atomic = kindOf(table, last) !== 'value' || !LITERAL.test(last);
    const shortened = atomic ? '' : last.slice(0, -1);

    let tokens = shortened.length
        ? [...state.tokens.slice(0, -1), shortened]
        : state.tokens.slice(0, -1);

    // A function key wrote its own bracket, so it deletes as a pair.
    if (last === '(' && tokens.length && kindOf(table, tokens[tokens.length - 1]) === 'prefix') {
        tokens = tokens.slice(0, -1);
    }

    return { ...state, tokens, result: null, error: null };
};

const compute = (state: IState) => {
    const table = tableFor(state);
    const value = evaluate(state.tokens, table, { angle: state.angle });

    return state.mode === 'programmer'
        ? formatBits(value as bigint, state.base)
        : formatNumber(value as number);
};

const equal = (state: IState): IState => {
    if (state.mode === 'converter' || state.settled || !state.tokens.length) return state;

    try {
        const result = compute(state);
        const expression = prettify(state.tokens, tableFor(state));

        return {
            ...state,
            result,
            error: null,
            settled: true,
            history: [{ id: Date.now(), expression, result }, ...state.history].slice(0, 20),
        };
    } catch (error) {
        const message = error instanceof CalcError ? error.message : 'That expression is incomplete';
        return { ...state, result: null, error: message, settled: true };
    }
};

const memory = (state: IState, op: MemoryOp): IState => {
    if (op === 'clear') return { ...state, memory: 0 };

    if (op === 'recall') {
        return entry({ ...state, settled: state.settled }, formatNumber(state.memory));
    }

    let value: number;
    try {
        value = state.result !== null ? Number(state.result) : Number(compute(state));
    } catch {
        return state;
    }

    if (!Number.isFinite(value)) return state;
    return { ...state, memory: op === 'add' ? state.memory + value : state.memory - value };
};

const switchMode = (state: IState, mode: Mode): IState => ({
    ...state,
    mode,
    tokens: [],
    result: null,
    error: null,
    settled: false,
    inverse: false,
});

export const converterValue = (state: IState) => {
    const category = categoryFor(state.converter.category);
    const from = unitFor(category, state.converter.from);
    const to = unitFor(category, state.converter.to);
    const raw = state.tokens.join('');
    const value = raw.length ? Number(raw) : 0;

    if (!Number.isFinite(value)) return { input: raw || '0', output: '0' };

    return {
        input: raw || '0',
        output: formatNumber(convert(value, from, to), CONVERSION_PRECISION),
    };
};

export const calculatorReducer = (state: IState, action: IAction): IState => {
    switch (action.type) {
        case CalculatorActionType.CLEAR:
            return { ...state, tokens: [], result: null, error: null, settled: false };

        case CalculatorActionType.ENTRY:
            return action.payload === undefined ? state : entry(state, action.payload);

        case CalculatorActionType.BACKSPACE:
            return backspace(state);

        case CalculatorActionType.EQUAL:
            return equal(state);

        case CalculatorActionType.SET_MODE:
            return action.mode === undefined || action.mode === state.mode
                ? state
                : switchMode(state, action.mode);

        case CalculatorActionType.SET_BASE:
            return action.base === undefined
                ? state
                : { ...state, base: action.base, tokens: [], result: null, error: null, settled: false };

        case CalculatorActionType.TOGGLE_ANGLE:
            return { ...state, angle: state.angle === 'deg' ? 'rad' : 'deg' };

        case CalculatorActionType.TOGGLE_INVERSE:
            return { ...state, inverse: !state.inverse };

        case CalculatorActionType.MEMORY:
            return action.memory === undefined ? state : memory(state, action.memory);

        case CalculatorActionType.RECALL:
            return action.payload === undefined
                ? state
                : {
                      ...state,
                      tokens: [action.payload.replace(/\u2009/g, '')],
                      result: null,
                      error: null,
                      settled: false,
                  };

        case CalculatorActionType.SET_CONVERTER: {
            const next = { ...state.converter, ...action.converter };

            // A new category has its own units, so the old pair cannot carry over.
            if (action.converter?.category && action.converter.category !== state.converter.category) {
                const category = categoryFor(action.converter.category);
                next.from = category.units[0].key;
                next.to = (category.units[1] ?? category.units[0]).key;
            }

            return { ...state, converter: next };
        }

        case CalculatorActionType.SWAP_UNITS:
            return {
                ...state,
                converter: {
                    ...state.converter,
                    from: state.converter.to,
                    to: state.converter.from,
                },
            };

        default:
            return state;
    }
};
