import React from 'react';
import { baseFor } from '../../engine';
import Button, { KeyKind } from './button';
import { useCalculatorContext } from './calculatorContext';
import { CalculatorActionType } from './calculatorReducer';
import { useKeyboard } from './useKeyboard';

interface Key {
    value: string;
    label?: string;
    kind: KeyKind;
    action?: CalculatorActionType;
    describe?: string;
    className?: string;
}

const KEYS: Key[] = [
    { value: 'AC', kind: 'function', action: CalculatorActionType.CLEAR, describe: 'Clear all' },
    { value: 'back', label: '⌫', kind: 'function', action: CalculatorActionType.BACKSPACE, describe: 'Delete last entry' },
    { value: '%', label: 'mod', kind: 'operator', describe: 'Remainder' },
    { value: '/', label: '÷', kind: 'operator', describe: 'Divide' },
    { value: '7', kind: 'digit' },
    { value: '8', kind: 'digit' },
    { value: '9', kind: 'digit' },
    { value: '*', label: '×', kind: 'operator', describe: 'Multiply' },
    { value: '4', kind: 'digit' },
    { value: '5', kind: 'digit' },
    { value: '6', kind: 'digit' },
    { value: '-', label: '−', kind: 'operator', describe: 'Subtract' },
    { value: '1', kind: 'digit' },
    { value: '2', kind: 'digit' },
    { value: '3', kind: 'digit' },
    { value: '+', kind: 'operator', describe: 'Add' },
    { value: '0', kind: 'digit', className: 'col-span-2' },
    { value: '.', kind: 'digit', describe: 'Decimal point' },
    { value: '=', kind: 'equal', action: CalculatorActionType.EQUAL, describe: 'Equals', className: 'text-2xl' },
];

const CONVERTER_KEYS: Key[] = [
    { value: 'AC', kind: 'function', action: CalculatorActionType.CLEAR, describe: 'Clear' },
    { value: 'back', label: '\u232b', kind: 'function', action: CalculatorActionType.BACKSPACE, describe: 'Delete last digit' },
    { value: '.', kind: 'digit', describe: 'Decimal point' },
    { value: '7', kind: 'digit' },
    { value: '8', kind: 'digit' },
    { value: '9', kind: 'digit' },
    { value: '4', kind: 'digit' },
    { value: '5', kind: 'digit' },
    { value: '6', kind: 'digit' },
    { value: '1', kind: 'digit' },
    { value: '2', kind: 'digit' },
    { value: '3', kind: 'digit' },
    { value: '0', kind: 'digit', className: 'col-span-3' },
];

const Keypad = () => {
    const { state, dispatch } = useCalculatorContext();
    useKeyboard();

    const converting = state.mode === 'converter';
    const digits = state.mode === 'programmer' ? baseFor(state.base).digits : '0123456789';

    const press = (key: Key) => () =>
        dispatch(
            key.action === undefined
                ? { type: CalculatorActionType.ENTRY, payload: key.value }
                : { type: key.action }
        );

    const unavailable = (key: Key) => {
        if (key.kind !== 'digit') return false;
        if (key.value === '.') return state.mode === 'programmer';
        return !digits.includes(key.value);
    };

    return (
        <div className="space-y-2.5">
            <div className={`grid gap-2.5 ${converting ? 'grid-cols-3' : 'grid-cols-4'}`}>
                {(converting ? CONVERTER_KEYS : KEYS).map(key => (
                    <Button
                        key={key.value}
                        label={key.label ?? key.value}
                        kind={key.kind}
                        describe={key.describe}
                        disabled={unavailable(key)}
                        onPress={press(key)}
                        className={`h-14 text-xl ${key.className ?? ''}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default Keypad;
