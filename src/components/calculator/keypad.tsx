import React from 'react';
import Button, { IButton } from './button';
import { useCalculatorContext } from './calculatorContext';
import { CalculatorActionType } from './calculatorReducer';
import { useKeyboard } from './useKeyboard';

const KEYS: IButton[] = [
    { value: 'AC', label: 'AC', kind: 'function', action: CalculatorActionType.CLEAR, describe: 'Clear all' },
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

const Keypad = () => {
    const { dispatch } = useCalculatorContext();
    useKeyboard(dispatch);

    return (
        <div className="grid grid-cols-4 gap-2.5">
            {KEYS.map(key => (
                <Button key={key.value} {...key} />
            ))}
        </div>
    );
};

export default Keypad;
