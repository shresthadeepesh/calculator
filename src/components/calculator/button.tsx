import React, { FC } from 'react';
import { useCalculatorContext } from './calculatorContext';
import { CalculatorActionType } from './calculatorReducer';

export type KeyKind = 'digit' | 'operator' | 'function' | 'equal';

export interface IButton {
    /** What the reducer receives: a digit, '.', or an operator. */
    value: string;
    /** What the key shows, when it differs from the value. */
    label?: string;
    kind: KeyKind;
    action?: CalculatorActionType;
    describe?: string;
    className?: string;
}

const KIND_STYLES: Record<KeyKind, string> = {
    digit: 'bg-white/[0.06] text-slate-50 hover:bg-white/[0.12]',
    operator: 'bg-white/[0.1] text-amber-100 hover:bg-white/[0.16]',
    function: 'bg-white/[0.03] text-slate-300 hover:bg-white/[0.1] hover:text-slate-100',
    equal: 'bg-amber-300 text-[#0B1B24] hover:bg-amber-200',
};

const Button: FC<IButton> = ({ value, label, kind, action, describe, className = '' }) => {
    const { dispatch } = useCalculatorContext();

    const press = () =>
        dispatch(
            action === undefined
                ? { type: CalculatorActionType.ENTRY, payload: value }
                : { type: action }
        );

    return (
        <button
            type="button"
            onClick={press}
            aria-label={describe}
            className={[
                'flex h-14 items-center justify-center rounded-2xl border border-white/10 text-xl font-medium',
                'shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-sm',
                'transition-colors duration-150 motion-reduce:transition-none',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1B24]',
                'active:scale-[0.97] motion-reduce:active:scale-100',
                KIND_STYLES[kind],
                className,
            ].join(' ')}
        >
            {label ?? value}
        </button>
    );
};

export default Button;
