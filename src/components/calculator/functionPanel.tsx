import React from 'react';
import { BASES } from '../../engine';
import Button from './button';
import { useCalculatorContext } from './calculatorContext';
import { CalculatorActionType } from './calculatorReducer';

const SIZE = 'h-11 text-sm';

const ScientificPanel = () => {
    const { state, dispatch } = useCalculatorContext();
    const { inverse } = state;

    const press = (payload: string) => () =>
        dispatch({ type: CalculatorActionType.ENTRY, payload });

    const keys = [
        {
            label: 'inv',
            onPress: () => dispatch({ type: CalculatorActionType.TOGGLE_INVERSE }),
            active: inverse,
            describe: 'Inverse functions',
        },
        {
            label: state.angle,
            onPress: () => dispatch({ type: CalculatorActionType.TOGGLE_ANGLE }),
            describe: `Angles in ${state.angle === 'deg' ? 'degrees' : 'radians'}`,
        },
        { label: 'π', onPress: press('π') },
        ...(['sin', 'cos', 'tan'] as const).map(fn => ({
            label: inverse ? `${fn}⁻¹` : fn,
            onPress: press(inverse ? `a${fn}` : fn),
        })),
        { label: inverse ? 'eˣ' : 'ln', onPress: press(inverse ? 'e^' : 'ln') },
        { label: inverse ? '10ˣ' : 'log', onPress: press(inverse ? '10^' : 'log') },
        { label: inverse ? 'x²' : '√', onPress: press(inverse ? '²' : '√') },
        { label: 'xʸ', onPress: press('^'), describe: 'Power' },
        { label: 'x!', onPress: press('!'), describe: 'Factorial' },
        { label: '1/x', onPress: press('⁻¹'), describe: 'Reciprocal' },
        { label: '(', onPress: press('(') },
        { label: ')', onPress: press(')') },
        { label: 'e', onPress: press('e') },
        {
            label: 'MC',
            onPress: () => dispatch({ type: CalculatorActionType.MEMORY, memory: 'clear' }),
            describe: 'Clear memory',
        },
        {
            label: 'MR',
            onPress: () => dispatch({ type: CalculatorActionType.MEMORY, memory: 'recall' }),
            describe: 'Recall memory',
        },
        {
            label: inverse ? 'M−' : 'M+',
            onPress: () =>
                dispatch({
                    type: CalculatorActionType.MEMORY,
                    memory: inverse ? 'subtract' : 'add',
                }),
            describe: inverse ? 'Subtract from memory' : 'Add to memory',
        },
    ];

    return (
        <div className="grid grid-cols-3 gap-2.5">
            {keys.map(key => (
                <Button key={key.label} kind="panel" className={SIZE} {...key} />
            ))}
        </div>
    );
};

const ProgrammerPanel = () => {
    const { state, dispatch } = useCalculatorContext();
    const digits = BASES.find(base => base.key === state.base)?.digits ?? '';

    const press = (payload: string) => () =>
        dispatch({ type: CalculatorActionType.ENTRY, payload });

    const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
    const operators = ['AND', 'OR', 'XOR', 'NOT', '<<', '>>'];

    return (
        <div className="space-y-2.5">
            <div className="grid grid-cols-4 gap-2.5">
                {BASES.map(base => (
                    <Button
                        key={base.key}
                        label={base.label}
                        kind="panel"
                        className="h-9 text-xs"
                        active={state.base === base.key}
                        onPress={() => dispatch({ type: CalculatorActionType.SET_BASE, base: base.key })}
                    />
                ))}
            </div>
            <div className="grid grid-cols-3 gap-2.5">
                {letters.map(letter => (
                    <Button
                        key={letter}
                        label={letter}
                        kind="panel"
                        className={SIZE}
                        disabled={!digits.includes(letter)}
                        onPress={press(letter)}
                    />
                ))}
                {operators.map(operator => (
                    <Button
                        key={operator}
                        label={operator}
                        kind="panel"
                        className={SIZE}
                        onPress={press(operator)}
                    />
                ))}
                <Button label="(" kind="panel" className={SIZE} onPress={press('(')} />
                <Button label=")" kind="panel" className={SIZE} onPress={press(')')} />
            </div>
        </div>
    );
};

const FunctionPanel = () => {
    const { state } = useCalculatorContext();

    if (state.mode === 'scientific') return <ScientificPanel />;
    if (state.mode === 'programmer') return <ProgrammerPanel />;
    return null;
};

export default FunctionPanel;
