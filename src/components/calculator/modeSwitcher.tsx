import React from 'react';
import { useCalculatorContext } from './calculatorContext';
import { CalculatorActionType } from './calculatorReducer';
import { MODES } from './state';

const ModeSwitcher = () => {
    const { state, dispatch } = useCalculatorContext();

    return (
        <div role="tablist" aria-label="Calculator mode" className="flex gap-1 pt-1">
            {MODES.map(mode => {
                const selected = state.mode === mode.key;

                return (
                    <button
                        key={mode.key}
                        role="tab"
                        type="button"
                        aria-selected={selected}
                        onClick={() => dispatch({ type: CalculatorActionType.SET_MODE, mode: mode.key })}
                        className={[
                            'flex-1 rounded-xl px-2 py-1.5 text-xs transition-colors duration-150 motion-reduce:transition-none',
                            'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/80',
                            selected
                                ? 'bg-white/[0.1] text-slate-50'
                                : 'text-slate-400 hover:bg-white/[0.05] hover:text-slate-200',
                        ].join(' ')}
                    >
                        {mode.label}
                    </button>
                );
            })}
        </div>
    );
};

export default ModeSwitcher;
