import { IState } from './calculatorContext';
import { CalcError, evaluate, format, isOperator } from './evaluate';

export enum CalculatorActionType {
    CLEAR,
    EQUAL,
    ENTRY,
    BACKSPACE,
}

export interface IAction {
    type: CalculatorActionType;
    payload?: string;
}

const MAX_DIGITS = 14;

const digitCount = (token: string) => token.replace(/[^0-9]/g, '').length;

/** A lone '-' sitting in a number slot is a minus sign, not an operator. */
const hasPendingSign = (tokens: string[]) =>
    tokens.length % 2 === 1 && tokens[tokens.length - 1] === '-';

const entry = (state: IState, key: string): IState => {
    const tokens = state.settled ? [] : state.tokens;
    const last = tokens[tokens.length - 1];
    const typingNumber = last !== undefined && (!isOperator(last) || hasPendingSign(tokens));

    if (isOperator(key)) {
        if (state.settled && state.result !== null) {
            return { tokens: [state.result, key], result: null, error: null, settled: false };
        }

        if (!tokens.length) {
            return key === '-' ? { ...state, tokens: ['-'], error: null, settled: false } : state;
        }

        if (typingNumber) {
            if (last === '-') return state;
            return { ...state, tokens: [...tokens, key], error: null, settled: false };
        }

        return { ...state, tokens: [...tokens.slice(0, -1), key], error: null, settled: false };
    }

    const base = { result: null, error: null, settled: false };

    if (key === '.') {
        if (!typingNumber) return { ...base, tokens: [...tokens, '0.'] };
        if (last.includes('.')) return { ...state, ...base, tokens };
        return { ...base, tokens: [...tokens.slice(0, -1), `${last}.`] };
    }

    if (!typingNumber) return { ...base, tokens: [...tokens, key] };
    if (digitCount(last) >= MAX_DIGITS) return { ...state, ...base, tokens };
    if (last === '0') return { ...base, tokens: [...tokens.slice(0, -1), key] };
    if (last === '-0') return { ...base, tokens: [...tokens.slice(0, -1), `-${key}`] };

    return { ...base, tokens: [...tokens.slice(0, -1), `${last}${key}`] };
};

const backspace = (state: IState): IState => {
    if (state.settled) return { tokens: [], result: null, error: null, settled: false };

    const last = state.tokens[state.tokens.length - 1];
    if (last === undefined) return state;

    const shortened = last.slice(0, -1);
    const tokens = shortened.length
        ? [...state.tokens.slice(0, -1), shortened]
        : state.tokens.slice(0, -1);

    return { ...state, tokens, result: null, error: null };
};

const equal = (state: IState): IState => {
    if (state.settled || !state.tokens.length) return state;

    try {
        return { ...state, result: format(evaluate(state.tokens)), error: null, settled: true };
    } catch (error) {
        const message = error instanceof CalcError ? error.message : 'That expression is incomplete';
        return { ...state, result: null, error: message, settled: true };
    }
};

export const calculatorReducer = (state: IState, action: IAction): IState => {
    switch (action.type) {
        case CalculatorActionType.CLEAR:
            return { tokens: [], result: null, error: null, settled: false };

        case CalculatorActionType.ENTRY:
            return action.payload === undefined ? state : entry(state, action.payload);

        case CalculatorActionType.BACKSPACE:
            return backspace(state);

        case CalculatorActionType.EQUAL:
            return equal(state);

        default:
            return state;
    }
};
